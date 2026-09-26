import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire('D:/OneDrive - Ikast/OneDrive - Ikast-Brande Gymnasium/AI Projects/DK Uni Requirments/ib-pathways-europe/package.json');
const sharp = require('sharp');
const [out, h, ...files] = process.argv.slice(2);
const H = +h; const imgs = [];
for (const f of files) { const b = await sharp(f).resize({ height: H }).toBuffer({ resolveWithObject: true }); imgs.push(b); }
const W = imgs.reduce((s, i) => s + i.info.width + 10, 0);
await sharp({ create: { width: W, height: H, channels: 3, background: '#888' } }).composite(imgs.map((im, k) => ({ input: im.data, left: imgs.slice(0, k).reduce((s, i) => s + i.info.width + 10, 0), top: 0 }))).jpeg({ quality: 80 }).toFile(out);
console.log(out, W, H);
