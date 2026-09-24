/**
 * Applies a round of photo review to the image records.
 *
 *   node scripts/apply-photo-review.mjs            # apply every verdict file
 *   node scripts/apply-photo-review.mjs --dry-run  # report what would change
 *
 * Reads `docs/research/photo-review/*-verdicts.jsonl`, one verdict per line:
 *
 *   {"key","target":"commons-main|gallery:N|official","file"|"url",
 *    "verdict":"approve|reject","reason","checkedAgainst":[…],
 *    "replacement":{"commonsFile","commonsPage","licence","why"}}
 *
 * and does three things, in this order:
 *
 *   1. Replacements. A rejected main photograph with a proposed Commons file is
 *      pinned to that file and re-fetched through the ordinary fetcher, so the
 *      new picture gets the same credit, sizing and WebP treatment as every
 *      other. The fetcher rebuilds the record from scratch, which would drop
 *      the place's gallery, so galleries are put back afterwards.
 *   2. Reviews. Every verdict becomes a signed, dated review on the record it
 *      is about — the main photograph, a gallery picture, or an official share
 *      image — naming the file it judged, so it cannot drift onto another
 *      picture. A replacement is signed as approved for its new file.
 *   3. Nothing else. It never deletes a record; a rejected picture simply stops
 *      being published (see `publishable()` in src/lib/imagery.mjs), and the
 *      page falls back to the next picture or to its typographic panel.
 *
 * The reviews are signed by the reviewer named below. Since September 2026 the
 * site owner has delegated photo review to an automated visual check,
 * triangulated against each institution's own website and social media where
 * unsure — see docs/IMAGE_STANDARD.md, "Who reviews".
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIR = path.join(ROOT, 'docs', 'research', 'photo-review');
const IMAGES = path.join(ROOT, 'data', 'images.json');
const OFFICIAL = path.join(ROOT, 'data', 'official-images.json');
const DRY = process.argv.includes('--dry-run');

export const REVIEWER = 'Claude (automated visual review, delegated by the site owner)';
const TODAY = new Date().toISOString().slice(0, 10);

const readJson = async (f) => JSON.parse(await fs.readFile(f, 'utf8'));
const writeJson = (f, j) => fs.writeFile(f, `${JSON.stringify(j, null, 2)}\n`);

/* --- Read every verdict, last one wins ---------------------------------- */

const verdicts = new Map();
let malformed = 0;
// Regional rounds first, then iteration rounds in order, so a later critique's
// fix overrides the verdict it was correcting.
const order = (f) => (/^iteration-(\d+)/.exec(f) ? 1000 + Number(RegExp.$1) : 0);
const files = (await fs.readdir(DIR))
  .filter((f) => f.endsWith('-verdicts.jsonl'))
  .sort((a, b) => order(a) - order(b) || a.localeCompare(b));
for (const name of files) {
  for (const line of (await fs.readFile(path.join(DIR, name), 'utf8')).split('\n')) {
    if (!line.trim()) continue;
    try {
      const v = JSON.parse(line);
      if (!v.key || !v.target || !['approve', 'reject'].includes(v.verdict)) throw new Error('shape');
      verdicts.set(`${v.key}|${v.target}`, v);
    } catch {
      malformed++;
    }
  }
}
console.log(`${verdicts.size} verdicts${malformed ? `, ${malformed} malformed lines skipped` : ''}\n`);

const note = (v) =>
  [v.reason, v.checkedAgainst?.length ? `Checked against ${v.checkedAgainst.join(', ')}` : null]
    .filter(Boolean)
    .join(' — ')
    .slice(0, 600);
const sign = (state, file, v) => ({
  state,
  by: REVIEWER,
  at: TODAY,
  ...(file ? { file } : {}),
  note: note(v),
});

/* --- 1. Replacements ----------------------------------------------------- */

let images = await readJson(IMAGES);
const galleries = Object.fromEntries(
  Object.entries(images).filter(([, r]) => r.gallery?.length).map(([k, r]) => [k, r.gallery])
);

/* Whether a record really holds this Commons file, rather than only its name.
   The fetcher rewrites the whole record — page, credit, file on disk — when a
   download lands; when it does not, a pinned name sits on top of the old
   picture and the old credit. Trusting the name signed three approvals onto
   photographs nobody had looked at (September 2026, photo round 2). */
const commonsTitle = (page) =>
  decodeURIComponent(String(page || '').replace(/^.*\/File:/, '')).replace(/_/g, ' ');
const landed = (record, file) => Boolean(record && record.file === file && commonsTitle(record.page) === file);

const replacements = [...verdicts.values()].filter(
  (v) =>
    v.target === 'commons-main' &&
    v.verdict === 'reject' &&
    v.replacement?.commonsFile &&
    // Already fetched on an earlier run: nothing to download again.
    !landed(images[v.key], v.replacement.commonsFile.replace(/^File:/, ''))
);
const previous = structuredClone(images);
for (const v of replacements) {
  const file = v.replacement.commonsFile.replace(/^File:/, '');
  console.log(`  replace ${v.key.padEnd(28)} → ${file}`);
  if (!DRY) images[v.key] = { ...(images[v.key] || {}), file, pin: true };
}
if (replacements.length && !DRY) {
  await writeJson(IMAGES, images);
  const keys = replacements.map((v) => v.key);
  // In batches, so one long command line is never the reason a run fails.
  for (let i = 0; i < keys.length; i += 20) {
    const only = keys.slice(i, i + 20).join(',');
    try {
      execFileSync(process.execPath, ['scripts/fetch-images.mjs', '--refresh', `--only=${only}`], {
        cwd: ROOT,
        stdio: 'inherit',
      });
    } catch {
      // One failure fails the batch; retry its keys one at a time so the rest land.
      console.log(`  the fetcher reported a failure; retrying one at a time: ${only}`);
      for (const key of keys.slice(i, i + 20)) {
        try {
          execFileSync(process.execPath, ['scripts/fetch-images.mjs', '--refresh', `--only=${key}`], { cwd: ROOT, stdio: 'inherit' });
        } catch {
          console.log(`  ${key}: fetch failed`);
        }
      }
    }
  }
  images = await readJson(IMAGES);
  // A replacement that did not land goes back to the record it replaced, so no
  // name ever sits on top of a different picture.
  for (const v of replacements) {
    const file = v.replacement.commonsFile.replace(/^File:/, '');
    if (!landed(images[v.key], file)) {
      console.log(
        previous[v.key]
          ? `  ${v.key}: ${file} did not land; the previous record is restored`
          : `  ${v.key}: ${file} did not land; there is no record for it (is the institution still in the data?)`
      );
      if (previous[v.key]) images[v.key] = { ...previous[v.key] };
      else delete images[v.key];
      if (images[v.key]?.pin && !landed(images[v.key], images[v.key].file)) delete images[v.key].pin;
    }
  }
  for (const [k, g] of Object.entries(galleries)) if (images[k] && !images[k].gallery) images[k].gallery = g;
}

/* --- 2. Reviews ---------------------------------------------------------- */

const official = await readJson(OFFICIAL);
const counts = { approved: 0, rejected: 0, replaced: 0, missing: 0 };

for (const v of verdicts.values()) {
  if (v.target === 'official') {
    const r = official[v.key];
    if (!r) { counts.missing++; continue; }
    r.review = sign(v.verdict === 'approve' ? 'approved' : 'rejected', null, v);
    counts[v.verdict === 'approve' ? 'approved' : 'rejected']++;
    continue;
  }

  const record = images[v.key];
  if (!record) { counts.missing++; continue; }

  if (v.target === 'commons-main') {
    const replaced = v.verdict === 'reject' && v.replacement?.commonsFile;
    const wanted = replaced ? v.replacement.commonsFile.replace(/^File:/, '') : v.file;
    if (replaced && !landed(record, wanted)) {
      // The fetch did not land; leave the old picture unjudged rather than
      // sign a verdict onto a file nobody looked at.
      console.log(`  ${v.key}: replacement not fetched, left for the next run`);
      counts.missing++;
      continue;
    }
    if (!replaced && record.file !== v.file) { counts.missing++; continue; }
    record.review = replaced
      ? sign('approved', record.file, { ...v, reason: `Replacement: ${v.replacement.why || v.reason}` })
      : sign(v.verdict === 'approve' ? 'approved' : 'rejected', record.file, v);
    counts[replaced ? 'replaced' : v.verdict === 'approve' ? 'approved' : 'rejected']++;
    continue;
  }

  const m = /^gallery:(\d+)$/.exec(v.target);
  const g = m && record.gallery?.[Number(m[1])];
  if (!g || (v.file && g.file !== v.file)) { counts.missing++; continue; }
  g.review = sign(v.verdict === 'approve' ? 'approved' : 'rejected', g.file, v);
  counts[v.verdict === 'approve' ? 'approved' : 'rejected']++;
}

if (!DRY) {
  await writeJson(IMAGES, images);
  await writeJson(OFFICIAL, official);
}
console.log(`\n${DRY ? 'would apply' : 'applied'}:`, counts);
