/**
 * The site's country flags, as small SVG files (src/assets/img/flags/<code>.svg).
 *
 *   node scripts/make-flags.mjs
 *
 * Why not the emoji the records carry (src/lib/data.mjs FLAGS)? Windows has no
 * flag emoji: it draws the two regional-indicator letters, so the globe read
 * "GB United Kingdom" and "IS Iceland" (the owner, #53: "we need country flags
 * not 2 letter place holders"). These are drawn here, from each flag's
 * published construction, simplified to read at 18 x 12 CSS pixels: a coat of
 * arms becomes a small shield, a canton of fifty stars a grid of dots, and
 * Spain uses its civil flag (no arms). National flags are public-domain
 * designs; the drawings are this site's own. Every file is 3:2, so a row of
 * them lines up; a 2:1 flag is drawn into the same box.
 *
 * One file per Destination the site knows (the codes in data.mjs FLAGS). A
 * page never needs a flag this script does not draw: the globe and the list
 * drop a flag image that fails to load rather than show a letter.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve(import.meta.dirname, '..', 'src', 'assets', 'img', 'flags');

const f = (n) => +n.toFixed(2);
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill}"${extra}/>`;
const h3 = (a, b, c) => rect(0, 0, 30, 20, b) + rect(0, 0, 30, 20 / 3, a) + rect(0, 40 / 3, 30, 20 / 3, c);
const v3 = (a, b, c) => rect(0, 0, 30, 20, b) + rect(0, 0, 10, 20, a) + rect(20, 0, 10, 20, c);
/** A Nordic cross: the vertical bar at x..x+w, the horizontal at y..y+h. */
const cross = (x, w, y, h, fill) => rect(x, 0, w, 20, fill) + rect(0, y, 30, h, fill);
/** A star of `n` points, the outer radius `r`, one point straight up. */
function star(cx, cy, r, fill, { n = 5, inner = 0.382, rot = 0 } = {}) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = ((i * Math.PI) / n) - Math.PI / 2 + rot;
    const rr = i % 2 ? r * inner : r;
    pts.push(`${f(cx + rr * Math.cos(a))},${f(cy + rr * Math.sin(a))}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}"/>`;
}
/** The Union Flag, drawn into x, y, w, h (squeezed to the box's shape). */
const union = (x, y, w, h) => `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 60 30" preserveAspectRatio="none">`
  + '<clipPath id="u"><path d="M30 15h30v15zv15H0zH0V0zV0h30z"/></clipPath>'
  + '<path d="M0 0h60v30H0z" fill="#012169"/>'
  + '<path d="M0 0l60 30m0-30L0 30" stroke="#fff" stroke-width="6"/>'
  + '<path d="M0 0l60 30m0-30L0 30" clip-path="url(#u)" stroke="#C8102E" stroke-width="4"/>'
  + '<path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/>'
  + '<path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"/></svg>';

/* A simplified maple leaf, centred on 0,0, about 18 units tall. */
const LEAF_RIGHT = [[0, -9], [1.6, -5.8], [3.4, -6.8], [2.7, -2.2], [5.6, -4.2], [6.4, -2.8], [8.8, -3.4], [7.8, -0.6], [9, 0.4], [5.4, 3.4], [5.9, 5], [1, 4.4], [1, 8.8]];
const leaf = (cx, cy, k, fill) => {
  const pts = [...LEAF_RIGHT, ...LEAF_RIGHT.slice(1).reverse().map(([x, y]) => [-x, y])];
  return `<polygon points="${pts.map(([x, y]) => `${f(cx + x * k)},${f(cy + y * k)}`).join(' ')}" fill="${fill}"/>`;
};

/* A trigram of the Korean flag: three bars, each solid (1) or broken (0),
   placed `d` from the centre along the direction `deg`. */
function trigram(bars, deg) {
  const out = bars.map((solid, i) => {
    const y = -8.9 + i * 1.05;
    return solid ? rect(-1.9, y, 3.8, 0.7, '#000') : rect(-1.9, y, 1.65, 0.7, '#000') + rect(0.25, y, 1.65, 0.7, '#000');
  });
  return `<g transform="translate(15 10) rotate(${deg})">${out.join('')}</g>`;
}

const FLAGS = {
  ae: rect(0, 0, 30, 20, '#fff') + rect(0, 0, 30, 20 / 3, '#00732F') + rect(0, 40 / 3, 30, 20 / 3, '#000') + rect(0, 0, 7.5, 20, '#FF0000'),
  at: h3('#C8102E', '#fff', '#C8102E'),
  au: rect(0, 0, 30, 20, '#012169') + union(0, 0, 15, 10) + star(7.5, 15, 2.3, '#fff', { n: 7, inner: 0.45 })
    + star(22.5, 16.8, 1.3, '#fff', { n: 7, inner: 0.45 }) + star(19, 9.6, 1.3, '#fff', { n: 7, inner: 0.45 })
    + star(22.5, 3.4, 1.3, '#fff', { n: 7, inner: 0.45 }) + star(25.7, 8.2, 1.3, '#fff', { n: 7, inner: 0.45 }) + star(24, 11.6, 0.8, '#fff'),
  be: v3('#000', '#FDDA24', '#EF3340'),
  ca: rect(0, 0, 30, 20, '#fff') + rect(0, 0, 7.5, 20, '#D80621') + rect(22.5, 0, 7.5, 20, '#D80621') + leaf(15, 10, 0.5, '#D80621'),
  ch: rect(0, 0, 30, 20, '#DA291C') + rect(13, 3.5, 4, 13, '#fff') + rect(8.5, 8, 13, 4, '#fff'),
  cn: rect(0, 0, 30, 20, '#EE1C25') + star(5, 5, 3, '#FFFF00') + star(10, 2, 1, '#FFFF00', { rot: 0.4 })
    + star(12, 4, 1, '#FFFF00', { rot: 0.2 }) + star(12, 7, 1, '#FFFF00') + star(10, 9, 1, '#FFFF00', { rot: 0.3 }),
  cz: rect(0, 0, 30, 20, '#fff') + rect(0, 10, 30, 10, '#D7141A') + '<path d="M0 0L15 10L0 20Z" fill="#11457E"/>',
  de: h3('#000', '#DD0000', '#FFCE00'),
  dk: rect(0, 0, 30, 20, '#C8102E') + cross(9.7, 3.2, 8.6, 2.8, '#fff'),
  ee: h3('#0072CE', '#000', '#fff'),
  es: rect(0, 0, 30, 20, '#AA151B') + rect(0, 5, 30, 10, '#F1BF00'),
  fi: rect(0, 0, 30, 20, '#fff') + cross(8.33, 5, 7.27, 5.45, '#002F6C'),
  fr: v3('#0055A4', '#fff', '#EF4135'),
  gb: union(0, 0, 30, 20),
  gr: rect(0, 0, 30, 20, '#fff') + [0, 2, 4, 6, 8].map((i) => rect(0, i * 20 / 9, 30, 20 / 9, '#0D5EAF')).join('')
    + rect(0, 0, 100 / 9, 100 / 9, '#0D5EAF') + rect(40 / 9, 0, 20 / 9, 100 / 9, '#fff') + rect(0, 40 / 9, 100 / 9, 20 / 9, '#fff'),
  hk: rect(0, 0, 30, 20, '#DE2910') + [0, 72, 144, 216, 288]
    .map((a) => `<path d="M15 10C12.6 8.4 12.4 5 15.2 3.6C17.2 5 17.4 8.2 15 10Z" fill="#fff" transform="rotate(${a} 15 10)"/>`).join(''),
  hu: h3('#CD2A3E', '#fff', '#436F4D'),
  ie: v3('#169B62', '#fff', '#FF883E'),
  is: rect(0, 0, 30, 20, '#02529C') + cross(8.4, 4.8, 7.78, 4.44, '#fff') + cross(9.6, 2.4, 8.89, 2.22, '#DC1E35'),
  it: v3('#009246', '#fff', '#CE2B37'),
  jp: rect(0, 0, 30, 20, '#fff') + '<circle cx="15" cy="10" r="6" fill="#BC002D"/>',
  kr: rect(0, 0, 30, 20, '#fff')
    + '<g transform="rotate(33.69 15 10)"><circle cx="15" cy="10" r="5" fill="#0047A0"/>'
    + '<path d="M10 10A5 5 0 0 1 20 10A2.5 2.5 0 0 1 15 10A2.5 2.5 0 0 0 10 10Z" fill="#CD2E3A"/></g>'
    + trigram([1, 1, 1], -56.31) + trigram([0, 1, 0], 56.31) + trigram([0, 0, 0], 123.69) + trigram([1, 0, 1], -123.69),
  lt: h3('#FDB913', '#006A44', '#C1272D'),
  lu: h3('#EA141D', '#fff', '#51ADDA'),
  lv: rect(0, 0, 30, 20, '#9E3039') + rect(0, 8, 30, 4, '#fff'),
  mt: rect(0, 0, 30, 20, '#fff') + rect(15, 0, 15, 20, '#CF142B')
    + rect(1.8, 1.8, 4.6, 4.6, '#A7A9AC', ' stroke="#CF142B" stroke-width=".5"') + rect(3.6, 2.3, 1, 3.6, '#E6E7E8') + rect(2.3, 3.6, 3.6, 1, '#E6E7E8'),
  nl: h3('#AE1C28', '#fff', '#21468B'),
  no: rect(0, 0, 30, 20, '#BA0C2F') + cross(8.18, 5.45, 7.5, 5, '#fff') + cross(9.55, 2.73, 8.75, 2.5, '#00205B'),
  nz: rect(0, 0, 30, 20, '#012169') + union(0, 0, 15, 10)
    + [[22.5, 16.6, 1.35], [20, 8.8, 1.2], [25.4, 7.6, 1.1], [22.5, 3.6, 1.1]]
      .map(([x, y, r]) => star(x, y, r + 0.45, '#fff') + star(x, y, r, '#C8102E')).join(''),
  pl: rect(0, 0, 30, 20, '#fff') + rect(0, 10, 30, 10, '#DC143C'),
  pt: rect(0, 0, 30, 20, '#DA291C') + rect(0, 0, 12, 20, '#046A38')
    + '<circle cx="12" cy="10" r="4" fill="none" stroke="#FFE900" stroke-width="1.1"/>'
    + '<path d="M10.4 7.7h3.2v2.6q0 1.6-1.6 2.1q-1.6-.5-1.6-2.1z" fill="#fff" stroke="#DA291C" stroke-width=".6"/>',
  se: rect(0, 0, 30, 20, '#006AA7') + cross(9.38, 3.75, 8, 4, '#FECC00'),
  sg: rect(0, 0, 30, 20, '#fff') + rect(0, 0, 30, 10, '#EF3340')
    + '<circle cx="6.6" cy="5" r="3.2" fill="#fff"/><circle cx="7.8" cy="5" r="2.9" fill="#EF3340"/>'
    + [0, 72, 144, 216, 288].map((a) => {
      const t = (a - 90) * Math.PI / 180;
      return star(9.8 + 1.6 * Math.cos(t), 5 + 1.6 * Math.sin(t), 0.6, '#fff');
    }).join(''),
  si: h3('#fff', '#005DA4', '#ED1C24')
    + '<path d="M5.4 3.4h4.8v3.6q0 2.4-2.4 3.3q-2.4-.9-2.4-3.3z" fill="#005DA4" stroke="#ED1C24" stroke-width=".45"/>'
    + '<path d="M6 7.9l.9-1.3.7.8.7-1.5.7 1.5.7-.8.9 1.3z" fill="#fff"/>'
    + '<circle cx="6.9" cy="4.5" r=".35" fill="#FFDD00"/><circle cx="7.8" cy="4.5" r=".35" fill="#FFDD00"/><circle cx="8.7" cy="4.5" r=".35" fill="#FFDD00"/>',
  us: rect(0, 0, 30, 20, '#fff') + Array.from({ length: 7 }, (_, i) => rect(0, i * 2 * 20 / 13, 30, 20 / 13, '#B22234')).join('')
    + rect(0, 0, 12, 7 * 20 / 13, '#3C3B6E')
    + Array.from({ length: 20 }, (_, i) => `<circle cx="${f(1.4 + (i % 5) * 2.3)}" cy="${f(1.3 + Math.floor(i / 5) * 2.6)}" r=".55" fill="#fff"/>`).join(''),
};

await fs.mkdir(OUT, { recursive: true });
let bytes = 0;
for (const [code, body] of Object.entries(FLAGS)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" width="30" height="20">${body}</svg>\n`;
  await fs.writeFile(path.join(OUT, `${code}.svg`), svg);
  bytes += Buffer.byteLength(svg);
}
console.log(`${Object.keys(FLAGS).length} flags, ${(bytes / 1024).toFixed(1)} kB in ${path.relative(process.cwd(), OUT)}`);
