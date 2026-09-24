/**
 * Generates the picture a link shows when it is shared.
 *
 *   node scripts/make-share-card.mjs
 *
 * The site's own social card is an SVG, and most of the places a counsellor
 * pastes a link — Teams, Outlook, Facebook, LinkedIn, iMessage — do not render
 * SVG previews at all, so a shared link arrived as a bare URL. This writes a
 * 1200×630 JPEG instead: the home page's first photograph, the pine gradient
 * the heroes use, and the home page's sentence. Needs `sharp` (npm install),
 * like the other image scripts; the build itself does not.
 *
 * The photograph is the first entry of `homeDoors.hero` in
 * data/site-config.json, so changing the home page's opening picture and
 * re-running this keeps the two in step.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const config = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'site-config.json'), 'utf8'));
const images = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'images.json'), 'utf8'));

const key = config.homeDoors?.hero?.[0];
const record = images[key];
if (!record?.src) throw new Error(`No photograph recorded for "${key}" in data/images.json`);
const photo = path.join(ROOT, 'src', record.src.replace(/^\//, ''));

const W = 1200;
const H = 630;

const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="1" x2="0.35" y2="0">
      <stop offset="0" stop-color="#081412" stop-opacity=".92"/>
      <stop offset=".55" stop-color="#081412" stop-opacity=".6"/>
      <stop offset="1" stop-color="#081412" stop-opacity=".15"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect x="0" y="${H - 12}" width="${W}" height="12" fill="#B4471F"/>
  <text x="64" y="96" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="24" font-weight="700"
        letter-spacing="4" fill="#D9B26A">IB PATHWAYS · MAY 2027 IB SESSION</text>
  <text font-family="Georgia, 'Palatino Linotype', serif" font-size="76" font-weight="700" fill="#FFFFFF">
    <tspan x="64" y="400">Your IB is a passport.</tspan>
    <tspan x="64" y="484">This is the map.</tspan>
  </text>
  <text x="64" y="552" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="30" fill="#FFFFFF" fill-opacity=".9">
    English-taught degrees in Denmark, across Europe and around the world
  </text>
</svg>`;

const out = path.join(ROOT, 'src', 'assets', 'img', 'share-card.jpg');
await sharp(photo)
  .resize(W, H, { fit: 'cover', position: 'attention' })
  .composite([{ input: Buffer.from(overlay), top: 0, left: 0 }])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(out);

const { size } = await fs.stat(out);
console.log(`wrote src/assets/img/share-card.jpg (${Math.round(size / 1024)} KB) from ${record.src}`);
