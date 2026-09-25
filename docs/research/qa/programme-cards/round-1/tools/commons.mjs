import fs from 'node:fs/promises'; import { createRequire } from 'node:module';
const require = createRequire('D:/OneDrive - Ikast/OneDrive - Ikast-Brande Gymnasium/AI Projects/DK Uni Requirments/ib-pathways-europe/package.json');
const sharp = require('sharp');
const [tag, ...qs] = process.argv.slice(2);
const UA = { 'User-Agent': 'IBPathwaysCritic/1.0 (matt.pilley review; contact via site)' };
const out = [];
for (const q of qs) {
  const u = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=12&gsrsearch=${encodeURIComponent(q + ' filetype:bitmap filew:>1199')}&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=400`;
  const j = await (await fetch(u, { headers: UA })).json();
  for (const p of Object.values(j.query?.pages || {})) {
    const ii = p.imageinfo?.[0]; if (!ii) continue;
    const lic = ii.extmetadata?.LicenseShortName?.value || '';
    if (/NC|ND|fair|GFDL$/i.test(lic)) continue;
    const r = ii.width / ii.height; if (r < 1.2) continue;
    out.push({ q, title: p.title.replace('File:', ''), lic, w: ii.width, h: ii.height, thumb: ii.thumburl, artist: (ii.extmetadata?.Artist?.value || '').replace(/<[^>]+>/g, '').trim().slice(0, 40) });
  }
}
const W = 400, H = 250, CAP = 30, cols = 5; const items = out.slice(0, 40); const comps = [];
for (let i = 0; i < items.length; i++) {
  try { const b = Buffer.from(await (await fetch(items[i].thumb, { headers: UA })).arrayBuffer()); comps.push({ input: await sharp(b).resize(W, H, { fit: 'cover' }).toBuffer(), left: (i % cols) * W, top: Math.floor(i / cols) * (H + CAP) }); } catch (e) { }
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  comps.push({ input: Buffer.from(`<svg width="${W}" height="${CAP}"><rect width="100%" height="100%" fill="#111"/><text x="4" y="20" font-family="Arial" font-size="12" fill="#fff">${esc(`${i + 1}. ${items[i].title.slice(0, 48)} ${items[i].lic}`)}</text></svg>`), left: (i % cols) * W, top: Math.floor(i / cols) * (H + CAP) + H });
}
const rows = Math.ceil(items.length / cols);
await sharp({ create: { width: W * cols, height: Math.max(1, rows) * (H + CAP), channels: 3, background: '#222' } }).composite(comps).jpeg({ quality: 78 }).toFile(`cand-${tag}.jpg`);
await fs.writeFile(`cand-${tag}.json`, JSON.stringify(items, null, 1));
console.log(items.map((x, i) => `${i + 1}. ${x.title} | ${x.lic} | ${x.w}x${x.h} | ${x.artist}`).join('\n'));
