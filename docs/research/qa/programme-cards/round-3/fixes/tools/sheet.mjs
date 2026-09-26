/* A contact sheet of the home page's card photographs, in page order.
   node sheet.mjs <dist> <out.jpg> */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
const sharp = require('sharp');
const [dist, out] = process.argv.slice(2);
const h = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const cards = h.split('<article class="card card--link').slice(1).map((a) => {
  const src = (a.match(/class="card__backdrop" src="([^"]+)"/) || [])[1];
  const title = ((a.match(/card__title">[\s\S]*?>([^<]+)</) || [])[1] || '').trim();
  return { src, title };
});
const W = 200, H = 125, cols = 8, lab = 20;
const rows = Math.ceil(cards.length / cols);
const tiles = [];
for (const [i, c] of cards.entries()) {
  const file = path.join(dist, c.src.replace(/^\//, ''));
  const img = await sharp(file).resize(W, H, { fit: 'cover' }).toBuffer();
  const x = (i % cols) * (W + 4), y = Math.floor(i / cols) * (H + lab + 4);
  tiles.push({ input: img, left: x, top: y });
  const t = `${i + 1}. ${c.title}`.slice(0, 30).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  tiles.push({ input: Buffer.from(`<svg width="${W}" height="${lab}"><rect width="100%" height="100%" fill="#222"/><text x="4" y="14" font-family="Arial" font-size="11" fill="#fff">${t}</text></svg>`), left: x, top: y + H });
}
await sharp({ create: { width: cols * (W + 4), height: rows * (H + lab + 4), channels: 3, background: '#555' } }).composite(tiles).jpeg({ quality: 78 }).toFile(out);
console.log(cards.length, 'cards');
