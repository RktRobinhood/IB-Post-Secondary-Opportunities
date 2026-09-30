/**
 * Turns the reviewed programme-image research into records, fetches them
 * through the ordinary pipeline, and signs the reviews.
 *
 *   node scripts/import-programme-images.mjs            # upsert, fetch what is missing, sign
 *   node scripts/import-programme-images.mjs --dry-run  # report only
 *   node scripts/import-programme-images.mjs --unsigned # upsert and fetch, but do not sign
 *   node scripts/import-programme-images.mjs --only=de  # one country batch file only
 *
 * `--only` reads just `schools-<cc>.jsonl`, so a batch is fetched and signed
 * on its own: another country's lines that a critic rejected (and that were
 * taken out of the manifest) are not re-added or signed by someone else's run.
 *
 * Reads, in this order (a later line for the same key wins):
 *   docs/research/programme-images/proposal.jsonl   one line per scope
 *   docs/research/programme-images/additions.jsonl  later picks, with an explicit key
 *   docs/research/programme-images/schools-*.jsonl   one country's school-record programmes
 *
 * and does three things:
 *
 *   1. Records. One per line in data/programme-images.json. The key is
 *      `programme-<id>` or `field-<value>`, or the line's own `key` for a second
 *      image in a field. Each is pinned to the named Commons file and carries
 *      the `scope` the site resolves by. A record already holding a different
 *      file is re-pinned; its old review does not follow (carryReview).
 *
 *      A school-programme line may instead name `officialUrl` and `sourcePage`:
 *      a photograph the institution publishes on its own page, which the site
 *      links to and does not copy (docs/IMAGE_STANDARD.md). It is verified
 *      (scripts/lib/official-image.mjs: it answers 200 as an image, is wide
 *      and light enough, and the page shows it) and recorded as
 *      `official: true` with its address, size and page. A line that fails is
 *      reported and not recorded. A record already holding that address and
 *      page is kept as it is, as a fetched Commons file is.
 *   2. Fetch. `scripts/fetch-images.mjs --manifest=programmes` downloads,
 *      credits and normalises every record that has no file on disk yet. It is
 *      the same fetcher as every other picture, and it cannot sign anything.
 *   3. Reviews. Every record whose file has landed (its record names the file,
 *      and its Commons page is that file), or whose official address was
 *      verified and recorded, is signed as approved. The note is the
 *      research's cropNote, which records the judgement made when the picture
 *      was viewed at 16:10 and at card size in light and dark; see
 *      docs/IMAGE_STANDARD.md, "Who reviews". A record whose fetch failed is
 *      left unsigned, so it is not published.
 *
 * Nothing here names a programme, a field or a country. Everything comes from
 * the research lines and the programme records.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { FIELD_LABELS } from '../src/lib/canonical.mjs';
import { programmePaths } from '../src/lib/schools.mjs';
import { OFFICIAL_LICENCE, verifyOfficial } from './lib/official-image.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const RESEARCH = path.join(ROOT, 'docs', 'research', 'programme-images');
const MANIFEST = path.join(ROOT, 'data', 'programme-images.json');
const IMG = path.join(ROOT, 'src', 'assets', 'img', 'programmes');
const DRY = process.argv.includes('--dry-run');
const UNSIGNED = process.argv.includes('--unsigned');
const ONLY = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7);
const REVIEWER = process.env.REVIEWER || 'Codex (automated visual review, delegated by the site owner)';
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

// School-record programmes are not canonical programme records, but use the
// same manifest and import path. Resolve their subject from the same generated
// slug that the page and image resolver use.
const schoolProgrammeNames = new Map();
for (const f of (await fs.readdir(path.join(ROOT, 'data', 'schools'))).filter((f) => f.endsWith('.json'))) {
  const school = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'schools', f), 'utf8'));
  if (school.scope !== 'listed') continue;
  for (const p of programmePaths(school.institution, school.programmes || [])) {
    schoolProgrammeNames.set(`${school.institution}-${p.slug}`, p.name);
  }
}

const schoolResearch = (await fs.readdir(RESEARCH))
  .filter((f) => /^schools-[a-z]{2}\.jsonl$/.test(f))
  .filter((f) => !ONLY || f === `schools-${ONLY}.jsonl`)
  .sort();

const wanted = new Map();
const research = [
  ...(ONLY ? [] : await lines('proposal.jsonl')),
  ...(ONLY ? [] : await lines('additions.jsonl')),
  ...(await Promise.all(schoolResearch.map((f) => lines(f)))).flat(),
];
for (const l of research) {
  const [kind, value] = String(l.scope).split(':');
  if (!['programme', 'field', 'school'].includes(kind) || !value) throw new Error(`bad scope: ${l.scope}`);
  const key = l.key || `${kind}-${value}`;
  const subject = kind === 'programme'
    ? programmeNames.get(value) || value
    : kind === 'school'
    ? schoolProgrammeNames.get(value) || value
    : `${FIELD_LABELS[value] || value} (field)`;
  // One picture per line: a Commons file, or the institution's own (for a
  // school programme only, whose page is the one that publishes it).
  if (!l.commonsFile === !l.officialUrl) throw new Error(`${l.scope}: name either commonsFile or officialUrl`);
  if (l.officialUrl && (kind !== 'school' || !l.sourcePage)) throw new Error(`${l.scope}: an officialUrl needs a school: scope and a sourcePage`);
  const official = l.officialUrl ? { url: l.officialUrl, sourcePage: l.sourcePage } : null;
  wanted.set(key, { key, kind, scope: l.scope, file: official ? null : l.commonsFile.replace(/^File:/, ''), official, subject, line: l });
}

/* --- 1. Records --------------------------------------------------------- */

const records = await readJson(MANIFEST, {});
let added = 0, repinned = 0;
const official = { verified: 0, kept: 0, failed: 0 };
const nowOfficial = [];
for (const w of wanted.values()) {
  const r = records[w.key];
  if (w.official) {
    if (r?.official && r.url === w.official.url && r.sourcePage === w.official.sourcePage) {
      r.scope = w.scope; r.kind = w.kind; r.subject = w.subject;
      official.kept++;
      continue;
    }
    const v = await verifyOfficial(w.line);
    if (v.problems.length) {
      official.failed++;
      console.log(`  ${w.key}: ${w.official.url} not recorded: ${v.problems.join('; ')}`);
      continue;
    }
    // The institution's photograph, linked where it publishes it. A review
    // follows only onto the same address; so does `focus`, a crop chosen for it.
    const same = r?.official && r.url === w.official.url;
    records[w.key] = {
      kind: w.kind,
      scope: w.scope,
      subject: w.subject,
      official: true,
      url: w.official.url,
      sourcePage: w.official.sourcePage,
      width: v.width,
      height: v.height,
      bytes: v.bytes,
      type: v.type,
      licence: OFFICIAL_LICENCE,
      fetched: TODAY,
      ...(same && r.focus ? { focus: r.focus } : {}),
      ...(same && r.review ? { review: r.review } : {}),
    };
    if (r?.src) nowOfficial.push(w.key);
    official.verified++;
    r ? repinned++ : added++;
    continue;
  }
  if (r && !r.official && r.file === w.file) { r.scope = w.scope; r.kind = w.kind; r.subject = w.subject; r.pin = true; continue; }
  // A record that was an official link starts again as a Commons one: none of its fields apply.
  records[w.key] = { ...(r && !r.official ? r : {}), file: w.file, pin: true, kind: w.kind, scope: w.scope, subject: w.subject };
  r ? repinned++ : added++;
}
console.log(`${wanted.size} research lines · ${added} new record(s) · ${repinned} re-pinned`);
if (official.verified + official.kept + official.failed) console.log('official photographs:', official);
if (DRY) process.exit(0);
await writeJson(MANIFEST, records);

// A record that held a stored Commons file and is now an official link: its
// files go, unless another record still points at them (twins share a file).
const stillUsed = new Set(
  Object.values(records).flatMap((r) => [r.src, ...(r.variants || []).map((v) => v.src)]).filter(Boolean).map((s) => path.basename(s))
);
for (const k of nowOfficial) {
  const own = (await fs.readdir(IMG)).filter((f) => f === `${k}.webp` || (f.startsWith(`${k}-`) && /^\d+\.webp$/.test(f.slice(k.length + 1))));
  for (const f of own) if (!stillUsed.has(f)) await fs.rm(path.join(IMG, f));
}

/* --- 2. Fetch ----------------------------------------------------------- */

try {
  execFileSync(process.execPath, ['scripts/fetch-images.mjs', '--manifest=programmes'], { cwd: ROOT, stdio: 'inherit' });
} catch {
  console.log('  the fetcher reported a failure; records it did not land stay unsigned');
}

/* --- 3. Reviews --------------------------------------------------------- */

if (UNSIGNED) {
  console.log('reviews: skipped (--unsigned); inspect the fetched crops, then rerun without the flag');
  process.exit(0);
}

const fetched = await readJson(MANIFEST, {});
const title = (page) => decodeURIComponent(String(page || '').replace(/^.*\/File:/, '')).replace(/_/g, ' ');
const counts = { signed: 0, kept: 0, unlanded: 0 };
for (const w of wanted.values()) {
  const r = fetched[w.key];
  // An official photograph has landed when its verified address is recorded; its review names that address.
  const landed = w.official
    ? r?.official && r.url === w.official.url
    : r && r.file === w.file && title(r.page) === w.file && r.src;
  if (!landed) { counts.unlanded++; console.log(`  ${w.key}: ${w.file || w.official.url} did not land; left unsigned`); continue; }
  if (r.review?.state === 'approved' && (w.official ? r.review.url === r.url : r.review.file === r.file)) { counts.kept++; continue; }
  r.review = {
    state: 'approved',
    by: REVIEWER,
    at: TODAY,
    ...(w.official ? { url: r.url } : { file: r.file }),
    note: `${w.line.cropNote} Viewed at 16:10 and as a light and dark card (docs/research/programme-images/). Why: ${w.line.why}`.slice(0, 600),
  };
  counts.signed++;
}
await writeJson(MANIFEST, fetched);
console.log('reviews:', counts);
