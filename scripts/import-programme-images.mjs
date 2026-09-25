/**
 * Turns the reviewed programme-image research into records, fetches them
 * through the ordinary pipeline, and signs the reviews.
 *
 *   node scripts/import-programme-images.mjs            # upsert, fetch what is missing, sign
 *   node scripts/import-programme-images.mjs --dry-run  # report only
 *
 * Reads, in this order (a later line for the same key wins):
 *   docs/research/programme-images/proposal.jsonl   one line per scope
 *   docs/research/programme-images/additions.jsonl  later picks, with an explicit key
 *
 * and does three things:
 *
 *   1. Records. One per line in data/programme-images.json. The key is
 *      `programme-<id>` or `field-<value>`, or the line's own `key` for a second
 *      image in a field. Each is pinned to the named Commons file and carries
 *      the `scope` the site resolves by. A record already holding a different
 *      file is re-pinned; its old review does not follow (carryReview).
 *   2. Fetch. `scripts/fetch-images.mjs --manifest=programmes` downloads,
 *      credits and normalises every record that has no file on disk yet. It is
 *      the same fetcher as every other picture, and it cannot sign anything.
 *   3. Reviews. Every record whose file has landed (its record names the file,
 *      and its Commons page is that file) is signed as approved. The note is the
 *      research's cropNote, which is the judgement made when the picture was
 *      viewed at 16:10 and at card size in light and dark. The owner delegated
 *      photo review to that automated visual check on 24 September 2026; see
 *      docs/IMAGE_STANDARD.md, "Who reviews". A record whose fetch failed is left
 *      unsigned, so it is not published.
 *
 * Nothing here names a programme, a field or a country. Everything comes from
 * the research lines and the programme records.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { FIELD_LABELS } from '../src/lib/canonical.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const RESEARCH = path.join(ROOT, 'docs', 'research', 'programme-images');
const MANIFEST = path.join(ROOT, 'data', 'programme-images.json');
const DRY = process.argv.includes('--dry-run');
const REVIEWER = 'Claude (automated visual review, delegated by the site owner)';
const TODAY = new Date().toISOString().slice(0, 10);

const readJson = async (f, fallback) => { try { return JSON.parse(await fs.readFile(f, 'utf8')); } catch { return fallback; } };
const writeJson = (f, j) => fs.writeFile(f, `${JSON.stringify(j, null, 2)}\n`);
const lines = async (name) => {
  try {
    return (await fs.readFile(path.join(RESEARCH, name), 'utf8')).split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
  } catch { return []; }
};

const programmeNames = new Map();
for (const f of (await fs.readdir(path.join(ROOT, 'data', 'programmes'))).filter((f) => f.endsWith('.json'))) {
  const p = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'programmes', f), 'utf8'));
  programmeNames.set(p.id, p.name);
}

const wanted = new Map();
for (const l of [...(await lines('proposal.jsonl')), ...(await lines('additions.jsonl'))]) {
  const [kind, value] = String(l.scope).split(':');
  if (!['programme', 'field'].includes(kind) || !value) throw new Error(`bad scope: ${l.scope}`);
  const key = l.key || `${kind}-${value}`;
  const subject = kind === 'programme'
    ? programmeNames.get(value) || value
    : `${FIELD_LABELS[value] || value} (field)`;
  wanted.set(key, { key, kind, scope: l.scope, file: l.commonsFile.replace(/^File:/, ''), subject, line: l });
}

/* --- 1. Records --------------------------------------------------------- */

const records = await readJson(MANIFEST, {});
let added = 0, repinned = 0;
for (const w of wanted.values()) {
  const r = records[w.key];
  if (r && r.file === w.file) { r.scope = w.scope; r.kind = w.kind; r.subject = w.subject; r.pin = true; continue; }
  records[w.key] = { ...(r || {}), file: w.file, pin: true, kind: w.kind, scope: w.scope, subject: w.subject };
  r ? repinned++ : added++;
}
console.log(`${wanted.size} research lines · ${added} new record(s) · ${repinned} re-pinned`);
if (DRY) process.exit(0);
await writeJson(MANIFEST, records);

/* --- 2. Fetch ----------------------------------------------------------- */

try {
  execFileSync(process.execPath, ['scripts/fetch-images.mjs', '--manifest=programmes'], { cwd: ROOT, stdio: 'inherit' });
} catch {
  console.log('  the fetcher reported a failure; records it did not land stay unsigned');
}

/* --- 3. Reviews --------------------------------------------------------- */

const fetched = await readJson(MANIFEST, {});
const title = (page) => decodeURIComponent(String(page || '').replace(/^.*\/File:/, '')).replace(/_/g, ' ');
const counts = { signed: 0, kept: 0, unlanded: 0 };
for (const w of wanted.values()) {
  const r = fetched[w.key];
  const landed = r && r.file === w.file && title(r.page) === w.file && r.src;
  if (!landed) { counts.unlanded++; console.log(`  ${w.key}: ${w.file} did not land; left unsigned`); continue; }
  if (r.review?.state === 'approved' && r.review.file === r.file) { counts.kept++; continue; }
  r.review = {
    state: 'approved',
    by: REVIEWER,
    at: TODAY,
    file: r.file,
    note: `${w.line.cropNote} Viewed at 16:10 and as a light and dark card (docs/research/programme-images/). Why: ${w.line.why}`.slice(0, 600),
  };
  counts.signed++;
}
await writeJson(MANIFEST, fetched);
console.log('reviews:', counts);
