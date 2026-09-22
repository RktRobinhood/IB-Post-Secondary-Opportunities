/**
 * Checks the built site for the mistakes that are easy to make and hard to see.
 *
 *   node scripts/check.mjs             # structure, internal links, accessibility basics
 *   node scripts/check.mjs --external  # also verify every outbound link resolves (slow)
 *
 * Exits non-zero if anything fails, so CI can gate on it.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { findPromises } from './lib/no-promises.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const CHECK_EXTERNAL = process.argv.includes('--external');

const fails = [];
const warns = [];
const fail = (where, what) => fails.push(`${where}: ${what}`);
const warn = (where, what) => warns.push(`${where}: ${what}`);

async function walk(dir, out = []) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else out.push(p);
  }
  return out;
}

/** Rough but effective: are the block-level tags balanced? */
function unbalanced(html) {
  const PAIRED = ['html', 'head', 'body', 'main', 'section', 'article', 'aside', 'nav', 'header',
    'footer', 'div', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'dl', 'dt',
    'dd', 'figure', 'form', 'select', 'details', 'summary', 'p'];
  const counts = {};
  for (const tag of PAIRED) {
    const open = (html.match(new RegExp(`<${tag}(\\s[^>]*)?>`, 'gi')) || []).length;
    const close = (html.match(new RegExp(`</${tag}>`, 'gi')) || []).length;
    if (open !== close) counts[tag] = `${open} open / ${close} close`;
  }
  return counts;
}

async function main() {
  let files;
  try {
    files = await walk(DIST);
  } catch {
    console.error('No dist/ — run `npm run build` first.');
    process.exit(1);
  }

  const pages = files.filter((f) => f.endsWith('.html'));
  const assets = new Set(files.map((f) => '/' + path.relative(DIST, f).split(path.sep).join('/')));
  const routes = new Set(
    pages.map((f) => {
      const rel = '/' + path.relative(DIST, f).split(path.sep).join('/');
      return rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
    })
  );

  /* A project-site build prefixes every link with the repository path. Read it
     back off the page rather than requiring the checker to be told. */
  let base = '';
  if (pages.length) {
    const first = await fs.readFile(pages[0], 'utf8');
    const m = first.match(/<html[^>]*data-base="([^"]*)"/);
    if (m && m[1] && m[1] !== '/') base = m[1].replace(/\/$/, '');
  }
  const unbase = (href) => (base && href.startsWith(base + '/') ? href.slice(base.length) : href);

  console.log(`\nChecking ${pages.length} pages${base ? ` (base "${base}")` : ''}…\n`);

  const externalLinks = new Set();

  for (const file of pages) {
    const rel = '/' + path.relative(DIST, file).split(path.sep).join('/');
    const html = await fs.readFile(file, 'utf8');

    /* Head */
    if (!/<title>[^<]{5,}<\/title>/.test(html)) fail(rel, 'missing or empty <title>');
    if (!/<meta name="description" content="[^"]{20,}"/.test(html)) warn(rel, 'weak meta description');
    if (!/<html lang="/.test(html)) fail(rel, 'no lang attribute');

    /* Exactly one h1 */
    const h1s = (html.match(/<h1[\s>]/g) || []).length;
    if (h1s === 0 && !rel.endsWith('404.html')) fail(rel, 'no <h1>');
    if (h1s > 1) fail(rel, `${h1s} <h1> elements — there should be one`);

    /* Structure */
    const bad = unbalanced(html);
    if (Object.keys(bad).length) {
      fail(rel, `unbalanced tags: ${Object.entries(bad).map(([t, c]) => `${t} (${c})`).join(', ')}`);
    }

    /* Images */
    for (const m of html.matchAll(/<img\b([^>]*)>/g)) {
      const attrs = m[1];
      if (!/\balt\s*=/.test(attrs)) fail(rel, 'an <img> has no alt attribute');
      const src = (attrs.match(/\bsrc="([^"]+)"/) || [])[1];
      if (src && src.startsWith('/') && !assets.has(unbase(src))) fail(rel, `image not found: ${src}`);
    }

    /* Links */
    for (const m of html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)) {
      const href = m[1];
      if (href.startsWith('#') || href.startsWith('mailto:')) continue;
      if (/^https?:\/\//.test(href)) {
        externalLinks.add(href);
        if (!/rel="[^"]*noopener/.test(m[0]) && !href.includes('creativecommons.org')) {
          // not a security issue without target=_blank, so only a nudge
        }
        continue;
      }
      if (href.startsWith('/')) {
        const clean = unbase(href.split('#')[0].split('?')[0]);
        if (!routes.has(clean) && !assets.has(clean)) fail(rel, `broken internal link: ${href}`);
      }
    }

    /* Content quality */
    if (/\bundefined\b/.test(html)) fail(rel, 'the word "undefined" appears — a template gap');
    if (/\[object Object\]/.test(html)) fail(rel, '"[object Object]" appears — an unrendered value');
    if (/\bnull\b(?![^<]*<\/(code|pre)>)/.test(html.replace(/<script[\s\S]*?<\/script>/g, ''))) {
      warn(rel, 'the word "null" appears in visible text');
    }
    if (/&amp;(amp|lt|gt|quot);/.test(html)) warn(rel, 'double-escaped entity');

    /* The site must never promise the reader an outcome. */
    for (const problem of findPromises(html)) fail(rel, problem);

    /* Accessibility basics */
    if (!/class="skip-link"/.test(html)) warn(rel, 'no skip link');
    for (const m of html.matchAll(/<button\b([^>]*)>\s*<\/button>/g)) {
      if (!/aria-label=/.test(m[1])) fail(rel, 'empty <button> with no aria-label');
    }
  }

  /* Data sanity */
  const dataFile = path.join(DIST, 'data.json');
  try {
    const data = JSON.parse(await fs.readFile(dataFile, 'utf8'));
    if (!data.schemaVersion) fail('data.json', 'no schemaVersion — the export must say what shaped it');
    if (!data.dataRevision) fail('data.json', 'no dataRevision — the export must be traceable to a commit');
    if (!data.countryProfiles?.length && !data.canonical?.destinations?.length) {
      fail('data.json', 'no destinations or country profiles');
    }
    for (const c of data.countryProfiles || []) {
      if (!c.dataAsOf) warn('data.json', `${c.code} has no dataAsOf`);
    }
    // An export where nothing is verified is a research dump, not a publication.
    const ev = data.evidenceCounts || {};
    if ((ev.verified || 0) === 0 && (data.recordCounts?.evidence || 0) > 0) {
      warn('data.json', 'no evidence is marked verified');
    }
  } catch {
    fail('data.json', 'missing or unparseable');
  }

  /* External links */
  if (CHECK_EXTERNAL) {
    console.log(`Checking ${externalLinks.size} external links…`);
    let n = 0;
    const list = [...externalLinks];
    const CONCURRENCY = 8;
    await Promise.all(
      Array.from({ length: CONCURRENCY }, async () => {
        while (list.length) {
          const href = list.pop();
          n++;
          if (n % 50 === 0) process.stdout.write(`\r  ${n}/${externalLinks.size}  `);
          try {
            const res = await fetch(href, {
              method: 'GET',
              redirect: 'follow',
              signal: AbortSignal.timeout(15000),
              headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ib-pathways link checker)' },
            });
            if (res.status >= 400 && res.status !== 403 && res.status !== 405) {
              warn('external', `${res.status} ${href}`);
            }
          } catch (e) {
            warn('external', `unreachable ${href}`);
          }
        }
      })
    );
    process.stdout.write('\r');
  }

  /* Report */
  if (warns.length) {
    console.log(`${warns.length} warnings:`);
    for (const w of warns.slice(0, 40)) console.log(`  · ${w}`);
    if (warns.length > 40) console.log(`  … and ${warns.length - 40} more`);
    console.log('');
  }
  if (fails.length) {
    console.log(`${fails.length} failures:`);
    for (const f of fails.slice(0, 60)) console.log(`  ✗ ${f}`);
    if (fails.length > 60) console.log(`  … and ${fails.length - 60} more`);
    console.log('');
    process.exit(1);
  }
  console.log(`All ${pages.length} pages pass.\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
