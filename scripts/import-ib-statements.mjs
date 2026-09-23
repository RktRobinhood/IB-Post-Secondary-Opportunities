/**
 * Turns a browser harvest of the IB Recognition Statements Database into
 * `data/ib-statements.json` and one Evidence record per statement (#38).
 *
 *   node scripts/import-ib-statements.mjs <harvest.json>
 *
 * The harvest is produced by a person's browser session, not by this script,
 * because recognition.ibo.org is a JavaScript application that serves no
 * readable text to a fetch (scripts/lib/link-policy.json). This script only
 * reshapes what was read; it opens nothing and signs nothing off.
 *
 * What it keeps is deliberately small — "a touch", see docs/IB_STATEMENTS.md:
 * that the institution has a statement, whether it recognises the Diploma and
 * Course Results, how many transcripts IB students sent it, one short quotation
 * of its Diploma policy, and the institution's own links. The full statement
 * stays where it is and is linked, never copied.
 *
 * It never adds an institution. A harvest row that does not resolve to an
 * institution already on the site is reported and dropped.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { slugify } from '../src/lib/html.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'data');

/** The longest Diploma-policy quotation kept. A touch, not a copy. */
export const EXCERPT_MAX = 280;

const STATEMENT_URL = (id) => `https://recognition.ibo.org/en-US/university-statements/?id=${id}`;

/** Cut at a sentence end inside the limit when there is one, else at a word. */
export function excerpt(text, max = EXCERPT_MAX) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (!t) return null;
  if (t.length <= max) return t;
  const head = t.slice(0, max);
  const stop = Math.max(head.lastIndexOf('. '), head.lastIndexOf('? '), head.lastIndexOf('! '));
  if (stop > max * 0.4) return head.slice(0, stop + 1);
  return `${head.slice(0, head.lastIndexOf(' '))}…`;
}

const yesNo = (v) => (v === 'Yes' ? true : v === 'No' ? false : null);
const flag = (flags, i) => (typeof flags === 'string' && flags[i] ? flags[i] === '1' : null);
const cleanUrl = (u) => {
  if (!u || !/^https?:\/\//.test(u)) return null;
  try {
    return new URL(u.trim()).href;
  } catch {
    return null;
  }
};

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

/**
 * Every institution the site knows, by the same key the site builds, looked up
 * by Destination and exact name. Not by position: a list that loses an entry
 * between the harvest and the import would silently shift every statement
 * after it onto its neighbour.
 */
async function institutionKeys() {
  const keys = new Map();
  const add = (k, v) => keys.set(k, [...(keys.get(k) || []), v]);
  for (const f of await fs.readdir(path.join(DATA, 'countries'))) {
    const c = await readJson(path.join(DATA, 'countries', f));
    for (const i of c.institutions || []) {
      add(`${c.code}:${i.name}`, { key: `${c.code}-${slugify(i.shortName || i.name)}`, name: i.name, website: i.website });
    }
  }
  /* A canonical Institution can share its name with its own country-profile
     entry; both render somewhere, so both receive the statement. */
  for (const f of await fs.readdir(path.join(DATA, 'institutions'))) {
    const i = await readJson(path.join(DATA, 'institutions', f));
    add(`${i.destination}:${i.name}`, { key: i.id, name: i.name, website: i.links?.website });
  }
  return keys;
}

const HOW = { e: 'exact', r: 'reviewed', m: 'manual' };
const YN = { Y: 'Yes', N: 'No' };

/**
 * The compact harvest: one `|`-separated line per statement —
 * destination, our name, match (e/r/m), statement id, the IB's name for it,
 * DP/DPC/credit/CP flags, transcripts in five years, DP/DPC/language-meets
 * as Y/N/-, and the host of the website the statement names. The quotation
 * and the institution's own links are absent from this form, and the import
 * records them as absent rather than inventing them.
 */
function parseCompact(text) {
  return text.split(/\r?\n/).filter(Boolean).map((line) => {
    const [cc, name, how, id, ibName, flags, total, yn, site] = line.split('|');
    return {
      cc, name, how: HOW[how] || how, id, ibName, flags,
      x: {
        total5y: total ? Number(total) : null,
        dp: YN[yn[0]] || null, dpc: YN[yn[1]] || null, ibLangMeets: YN[yn[2]] || null,
        urls: { website: site ? `https://${site}/` : null },
      },
    };
  });
}

const host = (u) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
};

/** Do the two websites belong to the same organisation? A check on the name match, not a replacement for it. */
function sameSite(a, b) {
  const [x, y] = [host(a), host(b)];
  if (!x || !y) return null;
  const base = (h) => h.split('.').slice(-3).join('.');
  return x === y || x.endsWith(`.${y}`) || y.endsWith(`.${x}`) || base(x) === base(y);
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('usage: node scripts/import-ib-statements.mjs <harvest.json>');
    process.exit(2);
  }
  const compact = file.endsWith('.tsv');
  const harvest = compact
    ? { rows: parseCompact(await fs.readFile(path.resolve(file), 'utf8')), retrievedAt: process.argv[3], readBy: process.argv[4] }
    : await readJson(path.resolve(file));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(harvest.retrievedAt || '')) {
    console.error('a compact harvest needs its retrieval date: import-ib-statements.mjs <harvest.tsv> <YYYY-MM-DD> [read by]');
    process.exit(2);
  }
  const known = await institutionKeys();
  const retrievedAt = harvest.retrievedAt;
  const by = harvest.readBy || 'a browser session reading recognition.ibo.org';

  const statements = {};
  const evidence = [];
  const dropped = [];
  const domainMismatch = [];

  const pairs = [];
  const seen = new Set();
  for (const row of harvest.rows) {
    const list = known.get(`${row.cc}:${row.name}`);
    if (!list) dropped.push(`${row.cc} ${row.name} — not an institution on the site (renamed or removed since the harvest?)`);
    else for (const inst of list) if (!seen.has(inst.key)) { seen.add(inst.key); pairs.push([row, inst]); }
  }

  for (const [row, inst] of pairs) {
    const x = row.x || {};
    const evId = `ev-ibrs-${inst.key}`;
    const website = cleanUrl(x.urls?.website);
    const agrees = sameSite(website, inst.website);
    if (agrees === false) domainMismatch.push(`${inst.key}: ours ${host(inst.website)}, IB statement ${host(website)} (${row.ibName})`);

    statements[inst.key] = {
      ibName: row.ibName,
      statementUrl: STATEMENT_URL(row.id),
      recognises: {
        diploma: yesNo(x.dp) ?? flag(row.flags, 0),
        courseResults: yesNo(x.dpc) ?? flag(row.flags, 1),
      },
      givesCredit: flag(row.flags, 2),
      transcripts5y: Number.isInteger(x.total5y) ? x.total5y : null,
      ibLanguageMeetsProficiency: yesNo(x.ibLangMeets),
      diplomaPolicy: excerpt(x.dpText),
      links: {
        website,
        ibAdmissions: cleanUrl(x.urls?.dpAdmission),
        language: cleanUrl(x.urls?.language),
        scholarships: cleanUrl(x.urls?.scholarships),
      },
      match: row.how,
      websiteAgrees: agrees,
      retrievedAt,
      evidence: evId,
    };

    evidence.push({
      id: evId,
      sourceUrl: STATEMENT_URL(row.id),
      publisher: inst.name,
      publisherType: 'institution',
      sourceClass: 'institutional-guidance',
      retrievedAt,
      verificationState: 'needs-review',
      claim: `${inst.name} has published an IB recognition statement through the IB, and says it ${yesNo(x.dp) === false ? 'does not recognise' : 'recognises'} the IB Diploma.`,
      excerpt: excerpt(x.dpText, 1000) || undefined,
      supports: [{ entity: inst.key, field: 'ibStatement' }],
      attestation: {
        by,
        at: retrievedAt,
        method: 'read-browser',
        note: 'Statements are written and edited by the university and published by the IB. The database is a JavaScript application that serves no text to a fetch, so this was read in a browser session. The match to this institution was made by name' +
          (agrees === true ? ' and confirmed by the website the statement links to.' : agrees === false ? ', and the statement links to a different website — worth a look.' : '; the statement gives no website to confirm it.'),
      },
      sourceCheck: {
        checkedAt: retrievedAt,
        outcome: 'partial',
        reason: 'recognition.ibo.org serves no readable text to automated retrieval, so npm run verify can never confirm this record. That is a property of the host, not a sign that nobody read it.',
        method: 'not machine-checkable (scripts/lib/link-policy.json)',
      },
      meta: { schemaVersion: '1.0', dataAsOf: retrievedAt },
    });
  }

  const out = {
    $comment:
      'One entry per institution on the site that has a statement in the IB Recognition Statements Database. A touch, not a copy — see docs/IB_STATEMENTS.md. Generated by scripts/import-ib-statements.mjs from a browser harvest; edit by re-harvesting, and never add an institution here that the site does not already list.',
    database: {
      name: 'IB Recognition Statements Database',
      publisher: 'International Baccalaureate Organization',
      url: 'https://recognition.ibo.org/',
      retrievedAt,
      size: harvest.index || null,
    },
    statements: Object.fromEntries(Object.entries(statements).sort(([a], [b]) => a.localeCompare(b))),
  };

  await fs.writeFile(path.join(DATA, 'ib-statements.json'), `${JSON.stringify(out, null, 2)}\n`);
  await fs.writeFile(path.join(DATA, 'evidence', 'ib-statements.json'), `${JSON.stringify(evidence, null, 2)}\n`);

  console.log(`${Object.keys(statements).length} statements written, ${evidence.length} evidence records.`);
  if (dropped.length) console.log(`\nDropped ${dropped.length}:\n  ${dropped.join('\n  ')}`);
  if (domainMismatch.length) console.log(`\nWebsite disagrees with the name match (${domainMismatch.length}) — read these:\n  ${domainMismatch.join('\n  ')}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
