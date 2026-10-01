/**
 * Turn the photo critic's picks among harvested official photos into
 * official lines for the importer (docs/COUNTRY_PIPELINE.md).
 *
 *   node scripts/apply-official-picks.mjs <cc>
 *
 * Reads official-candidates-<cc>.json (scripts/harvest-official-photos.mjs)
 * and official-picks-<cc>.jsonl ({"key", "pick": n | null, "why"}), and
 * appends one line per pick to schools-<cc>.jsonl, skipping a degree that
 * already has a line and a picture already given to another degree. Then:
 *
 *   node scripts/import-programme-images.mjs --only=<cc> --unsigned
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const CC = process.argv[2];
if (!/^[a-z]{2}$/.test(CC || '')) { console.error('usage: node scripts/apply-official-picks.mjs <cc>'); process.exit(1); }
const DIR = path.join(path.resolve(import.meta.dirname, '..'), 'docs', 'research', 'programme-images');
const jsonl = async (f) => (await fs.readFile(path.join(DIR, f), 'utf8').catch(() => '')).split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));

const candidates = new Map(JSON.parse(await fs.readFile(path.join(DIR, `official-candidates-${CC}.json`), 'utf8')).map((d) => [d.key, d]));
const existing = await jsonl(`schools-${CC}.jsonl`);
const scopes = new Set(existing.map((l) => l.scope));
const urls = new Set(existing.map((l) => l.officialUrl).filter(Boolean));

const out = [];
let none = 0, skipped = 0;
for (const p of await jsonl(`official-picks-${CC}.jsonl`)) {
  if (p.pick == null) { none++; continue; }
  const d = candidates.get(p.key);
  const c = d?.candidates.find((x) => x.n === p.pick);
  if (!c) { console.log(`  ${p.key}: no candidate ${p.pick}`); skipped++; continue; }
  if (scopes.has(d.scope) || urls.has(c.url)) { console.log(`  ${p.key}: already has a line, or its picture is taken`); skipped++; continue; }
  scopes.add(d.scope); urls.add(c.url);
  out.push({
    scope: d.scope,
    officialUrl: c.url,
    sourcePage: c.sourcePage,
    why: `The university's own picture for this degree, on its page: ${p.why || 'chosen among its published photographs'}.`,
    cropNote: 'Centre crop to 16:10, as the card draws it.',
  });
}
if (out.length) await fs.appendFile(path.join(DIR, `schools-${CC}.jsonl`), out.map((l) => JSON.stringify(l)).join('\n') + '\n');
console.log(`${CC}: ${out.length} official lines added, ${none} with no usable picture, ${skipped} skipped`);
