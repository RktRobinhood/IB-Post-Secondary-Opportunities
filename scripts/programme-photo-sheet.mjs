// Contact sheet of one country's degree photos for the photo critic
// (docs/COUNTRY_PIPELINE.md, stage 5): each stored crop at card size with its
// number, subject and key under it. An official record (the institution's own
// photograph, linked and not stored) is fetched from its address into memory
// for its tile, and nothing of it is written but the sheet.
//
//   node scripts/programme-photo-sheet.mjs <cc> <out.jpg>
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { UA } from './lib/official-image.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const [cc, out] = process.argv.slice(2);
const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/programme-images.json'), 'utf8'));
const items = Object.entries(m).filter(([k, r]) => k.startsWith(`school-${cc}-`) && (r.official ? r.url : r.src));
const W = 360, H = 225, CAP = 44, COLS = 5;
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
/** The picture a tile is made from: the stored crop, or the linked image's bytes. */
async function input(r) {
  if (r.official) {
    const res = await fetch(r.url, { headers: UA });
    if (!res.ok) throw new Error(`${r.url} answers ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }
  const src = path.join(ROOT, 'src/assets', String(r.src).replace(/^\/?assets\//, ''));
  return fs.existsSync(src) ? src : path.join(ROOT, 'src', r.src);
}
const tiles = [];
for (const [i, [k, r]] of items.entries()) {
  const img = await sharp(await input(r)).rotate().resize(W, H, { fit: 'cover' }).toBuffer();
  const cap = Buffer.from(`<svg width="${W}" height="${CAP}"><rect width="100%" height="100%" fill="#1a1613"/><text x="6" y="17" font-family="Arial" font-size="13" fill="#fff">${i + 1}. ${esc(r.subject || '').slice(0, 44)}</text><text x="6" y="36" font-family="Arial" font-size="10" fill="#bbb">${esc(k).slice(0, 58)}${r.official ? ' · official' : ''}</text></svg>`);
  tiles.push({ img, cap, x: (i % COLS) * W, y: Math.floor(i / COLS) * (H + CAP) });
}
const rows = Math.ceil(tiles.length / COLS);
await sharp({ create: { width: COLS * W, height: rows * (H + CAP), channels: 3, background: '#000' } })
  .composite(tiles.flatMap((t) => [{ input: t.img, left: t.x, top: t.y }, { input: t.cap, left: t.x, top: t.y + H }]))
  .jpeg({ quality: 78 }).toFile(out);
console.log(`${tiles.length} tiles → ${out}`);
