/**
 * Every image record names the photograph it actually holds.
 *
 * A record in data/images.json carries the Commons filename (`file`), the
 * Commons page it came from (`page`, which is where the credit points), the
 * WebP it is served as (`src`, with the `bytes`, `width` and `height` the
 * fetcher stored), and a review signed against `file`. When a replacement is
 * pinned and its download fails, the new name can end up on top of the old
 * picture and the old credit — which in September 2026 published three
 * photographs under approvals made for other files, one of them the wrong
 * institution (photo round 2, docs/research/qa/photos/round-2/critique.md §1).
 *
 * So, for the main picture and every gallery picture, this fails if:
 *
 *   - `file` and the file its `page` names disagree (the credit is for another
 *     photograph);
 *   - a picture that names a Commons file has no author or licence to credit;
 *   - the WebP at `src` is missing, or its size or dimensions differ from what
 *     the record says was stored (the bytes on disk are not the download the
 *     record describes — how `ie-dcu` shipped the right library under the
 *     editathon's credit);
 *   - a review names a different file from the one the record holds (an
 *     approval that has drifted, or a replacement that never landed);
 *   - the latest photo-review verdict for a record that exists has not been
 *     applied to it (`node scripts/apply-photo-review.mjs` was not run, or ran
 *     and silently skipped it). A verdict whose record no longer exists — the
 *     institution was removed from the data — is listed, not failed.
 *
 * It reads files only, so it runs in the data stage and needs no network.
 * Whether the credit matches what Commons says today needs the network and is
 * not asserted here.
 */
import fs from 'node:fs';
import path from 'node:path';
import { probeWebp } from './lib/image-standard.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const images = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'images.json'), 'utf8'));
const ASSETS = path.join(ROOT, 'src');

const title = (page) => decodeURIComponent(String(page || '').replace(/^.*\/File:/, '')).replace(/_/g, ' ');

const problems = [];
let pictures = 0;
for (const [key, r] of Object.entries(images)) {
  const all = [['main', r], ...(r.gallery || []).map((g, i) => [`gallery ${i + 1}`, g])];
  for (const [which, p] of all) {
    if (!p) continue;
    pictures++;
    const at = `${key} (${which})`;
    if (p.file && p.page && title(p.page) !== p.file) {
      problems.push(`${at}: names "${p.file}" but its page and credit are for "${title(p.page)}"`);
    }
    if (p.file && (!p.author || !p.licence)) {
      problems.push(`${at}: "${p.file}" has no ${!p.author ? 'author' : 'licence'} to credit`);
    }
    if (p.review?.file && p.file && p.review.file !== p.file) {
      problems.push(`${at}: holds "${p.file}" but its ${p.review.state} review is for "${p.review.file}"`);
    }
    if (p.src) {
      const disk = path.join(ASSETS, ...p.src.split('/').filter(Boolean));
      if (!fs.existsSync(disk)) {
        problems.push(`${at}: ${p.src} is not on disk`);
        continue;
      }
      const buf = fs.readFileSync(disk);
      if (p.bytes != null && buf.length !== p.bytes) {
        problems.push(`${at}: ${p.src} is ${buf.length} bytes on disk; the record stored ${p.bytes}`);
      }
      const dim = probeWebp(buf);
      if (dim && p.width != null && (dim.width !== p.width || dim.height !== p.height)) {
        problems.push(`${at}: ${p.src} is ${dim.width}×${dim.height} on disk; the record stored ${p.width}×${p.height}`);
      }
    }
  }
}

/* The latest verdict per picture, read exactly as apply-photo-review.mjs reads
   them: regional files first, then iteration files in order, last one wins. */
const DIR = path.join(ROOT, 'docs', 'research', 'photo-review');
const order = (f) => (/^iteration-(\d+)/.exec(f) ? 1000 + Number(RegExp.$1) : 0);
const verdicts = new Map();
if (fs.existsSync(DIR)) {
  const files = fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith('-verdicts.jsonl'))
    .sort((a, b) => order(a) - order(b) || a.localeCompare(b));
  for (const name of files) {
    for (const line of fs.readFileSync(path.join(DIR, name), 'utf8').split('\n')) {
      if (!line.trim()) continue;
      try {
        const v = JSON.parse(line);
        if (v.key && v.target && v.target !== 'official') verdicts.set(`${v.key}|${v.target}`, v);
      } catch { /* apply-photo-review reports malformed lines */ }
    }
  }
}
const orphaned = new Set();
for (const v of verdicts.values()) {
  const r = images[v.key];
  if (!r) { orphaned.add(v.key); continue; }
  const m = /^gallery:(\d+)$/.exec(v.target);
  const p = v.target === 'commons-main' ? r : m ? r.gallery?.[Number(m[1])] : null;
  if (!p) continue;
  const replaced = v.target === 'commons-main' && v.verdict === 'reject' && v.replacement?.commonsFile;
  const wantFile = replaced ? v.replacement.commonsFile.replace(/^File:/, '') : v.file;
  const wantState = replaced || v.verdict === 'approve' ? 'approved' : 'rejected';
  // A gallery verdict about a picture that has since moved slot is not this
  // picture's verdict; apply-photo-review skips it too.
  if (!replaced && v.file && p.file !== v.file) {
    if (v.target === 'commons-main') problems.push(`${v.key} (main): the latest verdict judged "${v.file}" but the record holds "${p.file}"`);
    continue;
  }
  if (p.file !== wantFile) {
    problems.push(`${v.key} (main): replacement "${wantFile}" was never fetched; the record still holds "${p.file}"`);
  } else if (p.review?.state !== wantState || p.review?.file !== wantFile) {
    problems.push(`${v.key} (${v.target}): the latest verdict (${wantState}) is not applied; run node scripts/apply-photo-review.mjs`);
  }
}

console.log('\nImage records name the photograph they hold\n');
if (problems.length) {
  console.log(`  FAIL  ${problems.length} problem(s):`);
  for (const p of problems) console.log(`        ${p}`);
  process.exit(1);
}
console.log(`  ok    all ${pictures} pictures in ${Object.keys(images).length} records agree with their Commons page, their file on disk and their review`);
console.log(`  ok    ${verdicts.size} photo-review verdicts are applied`);
if (orphaned.size) console.log(`  note  ${orphaned.size} verdict key(s) have no record (institution no longer listed): ${[...orphaned].sort().join(', ')}`);
console.log('');
