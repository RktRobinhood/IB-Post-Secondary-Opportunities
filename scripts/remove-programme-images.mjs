/**
 * Take degree photos the photo critic rejected out of a batch
 * (docs/COUNTRY_PIPELINE.md, stage 5): the research line, the manifest record
 * and the stored files. The card then falls back to its school's photograph.
 *
 *   node scripts/remove-programme-images.mjs <manifest-key> [<manifest-key> …]
 *
 * Keys are as the critic names them (`school-se-lu-biomedicine`). A key that
 * is already signed is refused: an approved photo is removed deliberately,
 * by hand, not as part of a reject list.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const RESEARCH = path.join(ROOT, 'docs', 'research', 'programme-images');
const MANIFEST = path.join(ROOT, 'data', 'programme-images.json');
const IMG = path.join(ROOT, 'src', 'assets', 'img', 'programmes');

const keys = process.argv.slice(2);
if (!keys.length) { console.error('usage: remove-programme-images.mjs <key> …'); process.exit(1); }

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const signed = keys.filter((k) => manifest[k]?.review?.state === 'approved');
if (signed.length) { console.error(`refusing signed records: ${signed.join(', ')}`); process.exit(1); }

// A school key is `school-<institution>-<slug>`; its research scope is `school:<institution>-<slug>`.
const scopes = new Set(keys.map((k) => (k.startsWith('school-') ? `school:${k.slice(7)}` : null)).filter(Boolean));
let lines = 0;
for (const f of fs.readdirSync(RESEARCH).filter((f) => f.endsWith('.jsonl'))) {
  const file = path.join(RESEARCH, f);
  const all = fs.readFileSync(file, 'utf8').split('\n');
  const kept = all.filter((l) => !l.trim() || !(scopes.has(JSON.parse(l).scope) || keys.includes(JSON.parse(l).key)));
  if (kept.length !== all.length) { lines += all.length - kept.length; fs.writeFileSync(file, kept.join('\n')); }
}

let records = 0, files = 0;
for (const k of keys) {
  if (manifest[k]) { delete manifest[k]; records++; }
  for (const f of fs.readdirSync(IMG).filter((f) => f === `${k}.webp` || f.startsWith(`${k}-`) && /^\d+\.webp$/.test(f.slice(k.length + 1)))) {
    fs.rmSync(path.join(IMG, f));
    files++;
  }
}
fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${keys.length} key(s): ${lines} research line(s), ${records} record(s), ${files} file(s) removed`);
