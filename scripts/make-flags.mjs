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

/** A white hoist band whose fly edge is `n` serrations, the points at `tip`. */
function serrate(base, tip, n, fill = '#fff') {
  const pts = [[0, 0], [base, 0]];
  for (let i = 0; i < n; i++) pts.push([tip, (i + 0.5) * 20 / n], [base, (i + 1) * 20 / n]);
  pts.push([0, 20]);
  return `<polygon points="${pts.map(([x, y]) => `${f(x)},${f(y)}`).join(' ')}" fill="${fill}"/>`;
}
/** A crescent: a disc of `r` at cx, cy, bitten by a disc of `r2` at bx, by in the field's colour. */
const crescent = (cx, cy, r, bx, by, r2, fill, field) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${fill}"/><circle cx="${f(bx)}" cy="${f(by)}" r="${f(r2)}" fill="${field}"/>`;
/** Horizontal stripes, top to bottom, each [colour, share of the height]. */
function bands(...rows) {
  const total = rows.reduce((s, [, k]) => s + k, 0);
  let y = 0;
  // Each band runs to the foot, the next laid over it: no hairline between them.
  return rows.map(([fill, k]) => { const r = rect(0, y, 30, 20 - y, fill); y += 20 * k / total; return r; }).join('');
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
  am: h3('#D90012', '#0033A0', '#F2A800'),
  az: h3('#0092BC', '#E4002B', '#00AF66') + crescent(14, 10, 3, 14.75, 10, 2.5, '#fff', '#E4002B') + star(17.7, 10, 1.3, '#fff', { n: 8, inner: 0.5 }),
  bb: v3('#00267F', '#FFC726', '#00267F')
    + '<path d="M15 15.6V5M12.2 6.2q0 4.4 2.8 4.8q2.8-.4 2.8-4.8M13.6 13h2.8" fill="none" stroke="#000" stroke-width=".9"/>',
  bg: h3('#fff', '#00966E', '#D62612'),
  bh: rect(0, 0, 30, 20, '#CE1126') + serrate(7, 11, 5),
  br: rect(0, 0, 30, 20, '#009C3B') + '<polygon points="2.55,10 15,2.43 27.45,10 15,17.57" fill="#FFDF00"/>'
    + '<circle cx="15" cy="10" r="5" fill="#002776"/><path d="M10.1 9.1Q15.5 7.6 19.8 11.3" fill="none" stroke="#fff" stroke-width=".8"/>'
    + [[13, 11.8], [15.6, 12.6], [17.2, 11.6], [14.2, 13.8], [16.4, 14.3]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".3" fill="#fff"/>`).join(''),
  co: bands(['#FCD116', 2], ['#003893', 1], ['#CE1126', 1]),
  cy: rect(0, 0, 30, 20, '#fff')
    + '<path d="M7.6 9.2L10.8 7.4L14 6.6L17.6 5.6L21.6 4.6L23 5.2L19.6 7.4L17 9.4L13.8 10.4L10.6 10.2Z" fill="#D57800"/>'
    + '<path d="M10 12.6Q11.8 15.6 14.6 15.4M20 12.6Q18.2 15.6 15.4 15.4" fill="none" stroke="#4E5B31" stroke-width="1"/>',
  ec: bands(['#FFDD00', 2], ['#034EA2', 1], ['#ED1C24', 1])
    + '<ellipse cx="15" cy="10.4" rx="2.3" ry="2.9" fill="#6DB5E8" stroke="#C59B27" stroke-width=".5"/><path d="M11.8 7q3.2-1.6 6.4 0q-3.2.9-6.4 0z" fill="#6B4423"/>',
  eg: h3('#CE1126', '#fff', '#000') + '<path d="M15 7.2l.8.9v2.4l1.9-1.2-.3 2.2-2.4 1.4-2.4-1.4-.3-2.2 1.9 1.2V8.1z" fill="#C09300"/>',
  gd: rect(0, 0, 30, 20, '#CE1126')
    + '<path d="M2.4 2.4H27.6L15 10ZM2.4 17.6H27.6L15 10Z" fill="#FCD116"/><path d="M2.4 2.4V17.6L15 10ZM27.6 2.4V17.6L15 10Z" fill="#007A5E"/>'
    + '<circle cx="15" cy="10" r="2.6" fill="#CE1126"/>' + star(15, 10.2, 1.8, '#FCD116')
    + [8, 15, 22].map((x) => star(x, 1.3, 0.9, '#FCD116') + star(x, 18.8, 0.9, '#FCD116')).join('')
    + '<ellipse cx="6.2" cy="10" rx=".9" ry="1.3" fill="#FCD116" stroke="#CE1126" stroke-width=".35"/>',
  gh: h3('#CE1126', '#FCD116', '#006B3F') + star(15, 10.4, 3.3, '#000'),
  gy: rect(0, 0, 30, 20, '#009E49') + '<path d="M0 0L30 10L0 20Z" fill="#fff"/><path d="M0 1.2L27.3 10L0 18.8Z" fill="#FCD116"/>'
    + '<path d="M0 0L15 10L0 20Z" fill="#000"/><path d="M0 1.3L13.3 10L0 18.7Z" fill="#CE1126"/>',
  id: rect(0, 0, 30, 20, '#fff') + rect(0, 0, 30, 10, '#FF0000'),
  il: rect(0, 0, 30, 20, '#fff') + rect(0, 1.88, 30, 3.12, '#0038B8') + rect(0, 15, 30, 3.12, '#0038B8')
    + '<path d="M15 6.4L18.12 11.8H11.88ZM15 13.6L18.12 8.2H11.88Z" fill="none" stroke="#0038B8" stroke-width=".6"/>',
  in: h3('#FF9933', '#fff', '#138808') + '<circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" stroke-width=".45"/>'
    + `<path d="${Array.from({ length: 12 }, (_, i) => {
      const dx = 2.5 * Math.cos(i * Math.PI / 12), dy = 2.5 * Math.sin(i * Math.PI / 12);
      return `M${f(15 - dx)} ${f(10 - dy)}L${f(15 + dx)} ${f(10 + dy)}`;
    }).join('')}" stroke="#000080" stroke-width=".15"/><circle cx="15" cy="10" r=".5" fill="#000080"/>`,
  jm: rect(0, 0, 30, 20, '#000') + '<path d="M0 0H30L15 10ZM0 20H30L15 10Z" fill="#009B3A"/>'
    + '<path d="M-3 -2L33 22M33 -2L-3 22" stroke="#FED100" stroke-width="3"/>',
  jo: h3('#000', '#fff', '#007A3D') + '<path d="M0 0L15 10L0 20Z" fill="#CE1126"/>' + star(5, 10, 1.6, '#fff', { n: 7, inner: 0.45 }),
  kh: bands(['#032EA1', 1], ['#E00025', 2], ['#032EA1', 1])
    + '<path d="M8.5 14h13v-1h-13zM9.8 13h10.4v-2H9.8zM14 11l1-4.6 1 4.6zM11.5 11l.7-2.6.7 2.6zM17.1 11l.7-2.6.7 2.6zM10 11l.6-1.8.6 1.8zM18.8 11l.6-1.8.6 1.8z" fill="#fff"/>',
  kw: bands(['#007A3D', 1], ['#fff', 1], ['#CE1126', 1]) + '<path d="M0 0L7.5 6.67V13.33L0 20Z" fill="#000"/>',
  kz: rect(0, 0, 30, 20, '#00AFCA') + '<circle cx="15" cy="8" r="2.4" fill="#FEC50C"/>'
    + '<circle cx="15" cy="8" r="3.4" fill="none" stroke="#FEC50C" stroke-width="1.2" stroke-dasharray=".55 .55"/>'
    + '<path d="M9.6 13q2.6-1.6 5.4.4q2.8-2 5.4-.4q-2.6.4-5.4 1.8q-2.8-1.4-5.4-1.8z" fill="#FEC50C"/>'
    + '<path d="M2.2 0v20" stroke="#FEC50C" stroke-width="1.3" stroke-dasharray="1 .6"/>',
  lb: bands(['#ED1C24', 1], ['#fff', 2], ['#ED1C24', 1])
    + '<path d="M15 5.6l2.6 3h-1.2l2.4 2.6h-1.3l2.5 2.6H10l2.5-2.6h-1.3l2.4-2.6h-1.2z" fill="#00A651"/>' + rect(14.4, 13.8, 1.2, 1, '#00A651'),
  mc: rect(0, 0, 30, 20, '#fff') + rect(0, 0, 30, 10, '#CE1126'),
  mo: rect(0, 0, 30, 20, '#00785E') + star(15, 4, 1.5, '#FBD116') + star(11.6, 5, 0.85, '#FBD116', { rot: -0.35 })
    + star(18.4, 5, 0.85, '#FBD116', { rot: 0.35 }) + star(9.6, 7, 0.85, '#FBD116', { rot: -0.7 }) + star(20.4, 7, 0.85, '#FBD116', { rot: 0.7 })
    + '<path d="M15 7.6q1.6 2 0 4.4q-1.6-2.4 0-4.4zM12.2 9.2q2.4.6 2.6 2.8q-2.6-.3-2.6-2.8zM17.8 9.2q-2.4.6-2.6 2.8q2.6-.3 2.6-2.8z" fill="#fff"/>'
    + '<path d="M10 13.2q5-1.4 10 0M11 14.4h8M12 15.6h6" fill="none" stroke="#fff" stroke-width=".5"/>',
  mx: v3('#006847', '#fff', '#CE1126') + '<ellipse cx="15" cy="9.4" rx="1.6" ry="2" fill="#8C5A2B"/>'
    + '<path d="M12.3 10.4q2.7 4 5.4 0" fill="none" stroke="#006847" stroke-width=".6"/>',
  my: rect(0, 0, 30, 20, '#fff') + Array.from({ length: 7 }, (_, i) => rect(0, i * 40 / 14, 30, 20 / 14, '#CC0001')).join('')
    + rect(0, 0, 15, 160 / 14, '#010066') + crescent(5.4, 5.71, 3.4, 6.5, 5.71, 2.9, '#FFCC00', '#010066')
    + star(11.4, 5.71, 2.5, '#FFCC00', { n: 14, inner: 0.45 }),
  ng: v3('#008751', '#fff', '#008751'),
  // Nepal's two pennants stand in the box at full height; the rest is empty.
  np: '<g transform="translate(11.47 .59) scale(.2353)">'
    + '<path d="M-15 0L45 37.574H2.574L45 80H-15Z" fill="#DC143C" stroke="#003893" stroke-width="5" stroke-linejoin="round"/>'
    + '<path d="M-7 26A7 7 0 0 0 7 26A7 4 0 0 1 -7 26Z" fill="#fff"/><circle cx="0" cy="24.6" r="2.8" fill="#fff"/>'
    + star(0, 60, 9, '#fff', { n: 12, inner: 0.65 }) + '</g>',
  om: rect(0, 0, 30, 20, '#DB161B') + rect(7.5, 0, 22.5, 20 / 3, '#fff') + rect(7.5, 40 / 3, 22.5, 20 / 3, '#008000')
    + '<path d="M1.5 1.5l4.5 4.5M6 1.5L1.5 6M3.75 1v5" fill="none" stroke="#fff" stroke-width=".6"/>',
  pa: rect(0, 0, 30, 20, '#fff') + rect(15, 0, 15, 10, '#D21034') + rect(0, 10, 15, 10, '#005293')
    + star(7.5, 5, 2.4, '#005293') + star(22.5, 15, 2.4, '#D21034'),
  ph: rect(0, 0, 30, 10, '#0038A8') + rect(0, 10, 30, 10, '#CE1126') + '<path d="M0 0L17.32 10L0 20Z" fill="#fff"/>'
    + star(5.8, 10, 3.2, '#FCD116', { n: 8, inner: 0.5 }) + '<circle cx="5.8" cy="10" r="1.7" fill="#FCD116"/>'
    + star(1.8, 2.6, 0.95, '#FCD116') + star(1.8, 17.4, 0.95, '#FCD116') + star(14.6, 10, 0.95, '#FCD116', { rot: Math.PI / 2 }),
  pk: rect(0, 0, 30, 20, '#01411C') + rect(0, 0, 7.5, 20, '#fff')
    + crescent(18.6, 10.4, 4.6, 19.9, 9.1, 4, '#fff', '#01411C') + star(21.7, 7.4, 1.5, '#fff', { rot: 0.35 }),
  qa: rect(0, 0, 30, 20, '#8A1538') + serrate(8, 11, 9),
  sa: rect(0, 0, 30, 20, '#006C35')
    + '<path d="M8.5 7.6q1-1.8 2 0t2 0 2 0 2 0 2 0 2 0 2 0 1.5 0M10 5.4v1.6M13.5 5.2v1.8M17 5.4v1.6M20.5 5.2v1.8" fill="none" stroke="#fff" stroke-width=".7"/>'
    + '<path d="M9 12.6h12.2l1.2-.8M10.6 11.8v1.6" fill="none" stroke="#fff" stroke-width=".7"/>',
  th: bands(['#A51931', 1], ['#F4F5F8', 1], ['#2D2A4A', 2], ['#F4F5F8', 1], ['#A51931', 1]),
  tr: rect(0, 0, 30, 20, '#E30A17') + crescent(10, 10, 5, 11.25, 10, 4, '#fff', '#E30A17') + star(17.4, 10, 2.5, '#fff', { rot: -Math.PI / 2 }),
  tt: rect(0, 0, 30, 20, '#DA1A35') + '<path d="M-3 -2L33 22" stroke="#fff" stroke-width="7.5"/><path d="M-3 -2L33 22" stroke="#000" stroke-width="5.5"/>',
  ug: bands(['#000', 1], ['#FCDC04', 1], ['#D90000', 1], ['#000', 1], ['#FCDC04', 1], ['#D90000', 1])
    + '<circle cx="15" cy="10" r="4.3" fill="#fff"/>'
    + '<ellipse cx="15.8" cy="9.8" rx="1.9" ry="1.2" fill="#9CA69C" transform="rotate(-20 15.8 9.8)"/>'
    + '<path d="M14.4 9.6Q13.4 8.4 13.8 7M15.4 10.8v2.6M16.2 10.8l.8 1.4-.9 1" fill="none" stroke="#9CA69C" stroke-width=".45"/>'
    + '<circle cx="13.9" cy="6.9" r=".5" fill="#000"/><circle cx="14.1" cy="6.3" r=".35" fill="#FCDC04"/><circle cx="13.7" cy="7.4" r=".22" fill="#D90000"/>',
  uz: bands(['#0099B5', 16], ['#CE1126', 1], ['#fff', 16], ['#CE1126', 1], ['#1EB53A', 16])
    + crescent(4.6, 3.3, 2.4, 5.5, 3.3, 2.1, '#fff', '#0099B5')
    + [[3, 1.4], [4, 3.3], [5, 5.2]].map(([k, y]) => Array.from({ length: k }, (_, i) => star(13.6 - i * 1.6, y, 0.55, '#fff')).join('')).join(''),
  vi: rect(0, 0, 30, 20, '#fff')
    + '<path d="M15 6.6l1 1.4 3.4-1-1.6 3 1.2.4-3 1.6.6 2.4H13.4l.6-2.4-3-1.6 1.2-.4-1.6-3 3.4 1z" fill="#F4C430"/>'
    + rect(13.9, 9, 2.2, 2.6, '#fff') + rect(13.9, 9, 2.2, 0.9, '#0A3161') + rect(14.2, 9.9, 0.4, 1.7, '#BF0A30') + rect(15.4, 9.9, 0.4, 1.7, '#BF0A30')
    + '<path d="M5 7.2l2 5.6 2-5.6" fill="none" stroke="#0A3161" stroke-width=".9"/>' + rect(22.3, 7.2, 0.9, 5.6, '#0A3161'),
  vn: rect(0, 0, 30, 20, '#DA251D') + star(15, 10.6, 6, '#FFFF00'),
  // South Africa from its 2:3 construction, the green band a fifth of the height.
  za: '<svg width="30" height="20" viewBox="0 0 900 600">'
    + '<path d="M0 0h900v300H0z" fill="#E03C31"/><path d="M0 300h900v300H0z" fill="#001489"/>'
    + '<path d="M0 0L450 300L0 600M450 300H900" fill="none" stroke="#fff" stroke-width="200"/>'
    + '<path d="M0 0L450 300L0 600M450 300H900" fill="none" stroke="#007749" stroke-width="120"/>'
    + '<path d="M0 72.1L341.8 300L0 527.9Z" fill="#FFB81C"/><path d="M0 120.2L269.7 300L0 479.8Z" fill="#000"/></svg>',
};

await fs.mkdir(OUT, { recursive: true });
let bytes = 0;
for (const [code, body] of Object.entries(FLAGS)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" width="30" height="20">${body}</svg>\n`;
  await fs.writeFile(path.join(OUT, `${code}.svg`), svg);
  bytes += Buffer.byteLength(svg);
}
console.log(`${Object.keys(FLAGS).length} flags, ${(bytes / 1024).toFixed(1)} kB in ${path.relative(process.cwd(), OUT)}`);
