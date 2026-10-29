/**
 * Pulls the full English-taught programme catalogue from studyindenmark.dk.
 *
 * Study in Denmark runs Plone with the REST API exposed at `/++api++`, so we can
 * ask it for the catalogue directly instead of scraping rendered HTML.
 *
 *   node scripts/fetch-studyindenmark.mjs            # undergraduate catalogue
 *   node scripts/fetch-studyindenmark.mjs --all      # every degree level
 *   node scripts/fetch-studyindenmark.mjs --index-only # listing only; no detail fetches
 *
 * Writes:
 *   .cache/sid-index.json     the raw catalogue listing
 *   .cache/sid-programmes.json  one record per programme, with full detail
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(import.meta.dirname, '..');
const CACHE = path.join(ROOT, '.cache');
const BASE = 'https://studyindenmark.dk';
const UA = 'ib-pathways-europe/1.0 (educational guidance site; contact via GitHub repository)';

const wantAll = process.argv.includes('--all');

async function api(url, tries = 3) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(30000),
        headers: { Accept: 'application/json', 'User-Agent': UA },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === tries) throw err;
      await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }
}

function searchUrl(bStart) {
  const query = {
    metadata_fields: '_all',
    b_size: '200',
    limit: '2000',
    query: [
      { i: 'portal_type', o: 'plone.app.querystring.operation.selection.any', v: ['program'] },
      { i: 'path', o: 'plone.app.querystring.operation.string.absolutePath', v: '/portal' },
    ],
    sort_on: 'sortable_title',
    sort_order: 'ascending',
    b_start: bStart,
  };
  return `${BASE}/++api++/portal/@querystring-search?query=${encodeURIComponent(JSON.stringify(query))}`;
}

export async function fetchIndex(readPage = api) {
  const items = [];
  let bStart = 0;
  let total;
  for (;;) {
    const page = await readPage(searchUrl(bStart));
    if (!Array.isArray(page.items) || !Number.isInteger(page.items_total) || page.items_total < 0) throw new Error('Study in Denmark index format changed');
    if (total !== undefined && total !== page.items_total) throw new Error('Study in Denmark index changed during pagination; retry');
    total = page.items_total;
    const batch = page.items;
    items.push(...batch);
    process.stdout.write(`\r  index: ${items.length}/${page.items_total ?? '?'}   `);
    if (items.length === total) break;
    if (!batch.length || items.length > total || bStart > 100000) throw new Error('Incomplete Study in Denmark pagination');
    bStart += batch.length;
  }
  const ids = items.map((i) => i['@id']);
  if (ids.some((id) => typeof id !== 'string' || !id.startsWith(`${BASE}/portal/`)) || new Set(ids).size !== ids.length) throw new Error('Duplicate or invalid Study in Denmark listing identifiers');
  process.stdout.write('\n');
  return items;
}

/** Plone returns rich text as {data, content-type}; flatten to plain text. */
function textOf(value) {
  if (!value) return '';
  const raw = typeof value === 'string' ? value : value.data || '';
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h\d|tr)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Catalogue URLs look like /portal/<institution>/<campus>/<programme>. */
function pathCampus(id) {
  const parts = (id || '').split('/portal/')[1]?.split('/') || [];
  if (parts.length < 3) return null;
  return parts[1]
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Last resort: dig any off-site http link out of the record. */
function firstExternalLink(detail) {
  const seen = JSON.stringify(detail ?? {});
  const m = seen.match(/https?:\/\/(?!studyindenmark\.dk)[^"'\\\s<>]+/);
  return m ? m[0].replace(/[.,)]+$/, '') : null;
}

async function main() {
  await fs.mkdir(CACHE, { recursive: true });

  console.log('Fetching programme index from studyindenmark.dk …');
  const index = await fetchIndex();
  const harvest = {
    schemaVersion: 1,
    retrievedAt: new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Copenhagen' }).format(new Date()),
    source: `${BASE}/portal`,
    items: index,
  };
  // A single authoritative cache pack keeps payload and retrieval date together.
  const harvestFile = path.join(CACHE, 'sid-index-harvest.json');
  await fs.writeFile(`${harvestFile}.tmp`, JSON.stringify(harvest));
  await fs.rename(`${harvestFile}.tmp`, harvestFile);
  await fs.writeFile(path.join(CACHE, 'sid-index.json'), JSON.stringify(index, null, 2));
  console.log(`  ${index.length} programmes in catalogue`);
  if (process.argv.includes('--index-only')) return;

  // Collection includes bachelor's, academy profession degrees and subsequent
  // top-ups. A downstream first-year comparison must exclude the top-ups.
  const UNDERGRAD = /^(bachelor|academy profession degree|top-up degree)$/i;
  const wanted = wantAll ? index : index.filter((i) => UNDERGRAD.test(i.degree_title || ''));
  console.log(`  ${wanted.length} to fetch in detail`);

  const out = [];
  for (const [n, item] of wanted.entries()) {
    const url = item['@id'].replace(`${BASE}/`, `${BASE}/++api++/`);
    let detail = {};
    try {
      detail = await api(url, 2);
    } catch (err) {
      console.warn(`\n  ! ${item.title}: ${err.message}`);
    }
    // The catalogue puts the programme's own homepage in a "links"/"remoteUrl"-ish field
    // that has moved around over the years, so look in every plausible place.
    const link =
      detail.remoteUrl ||
      detail.getRemoteUrl ||
      detail.program_url ||
      detail.website ||
      detail.url ||
      firstExternalLink(detail) ||
      null;

    out.push({
      title: detail.title || item.Title,
      publicUrl: item['@id'],
      slug: item.getId,
      institution: item.institution_title || detail.institution_title || null,
      campus: pathCampus(item['@id']),
      degree: item.degree_title || null,
      subjects: item.program_subject_title || [],
      ects: item.credits || null,
      programmeUrl: link,
      description: textOf(detail.description || item.Description),
      body: textOf(detail.program_description || detail.text),
      modified: item.ModificationDate || null,
      raw: detail,
    });
    if ((n + 1) % 10 === 0 || n + 1 === wanted.length) {
      process.stdout.write(`\r  detail: ${n + 1}/${wanted.length}   `);
    }
    await new Promise((r) => setTimeout(r, 120)); // be a polite guest
  }
  process.stdout.write('\n');

  await fs.writeFile(path.join(CACHE, 'sid-programmes.json'), JSON.stringify(out, null, 2));
  console.log(`Wrote .cache/sid-programmes.json (${out.length} programmes)`);

  const byInst = {};
  for (const p of out) byInst[p.institution || '?'] = (byInst[p.institution || '?'] || 0) + 1;
  console.log('\nBy institution:');
  for (const [k, v] of Object.entries(byInst).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(v).padStart(3)}  ${k}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch((err) => {
  console.error(err);
  process.exit(1);
});
