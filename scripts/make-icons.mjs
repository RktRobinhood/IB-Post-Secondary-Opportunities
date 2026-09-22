/**
 * Generates the social card and the touch icon.
 *
 *   node scripts/make-icons.mjs
 *
 * Both are written as SVG and referenced as SVG, so there is no raster
 * toolchain and nothing to keep in sync by hand. The layout deliberately
 * matches the site: paper ground, pine ink, the compass mark, Fraunces-ish
 * proportions. A shared link should look like the thing it points at.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'src', 'assets', 'img');

const PAPER = '#FBF7F0';
const INK = '#1A1613';
const PINE = '#0F302C';
const SAND = '#C99A45';
const ACCENT = '#B4471F';

const mark = (x, y, s, light = false) => `
  <g transform="translate(${x} ${y}) scale(${s / 32})">
    <circle cx="16" cy="16" r="14" fill="none" stroke="${light ? PAPER : PINE}" stroke-width="1.6" opacity=".35"/>
    <path d="M16 4.5 20.2 16 16 27.5 11.8 16z" fill="${light ? PAPER : PINE}"/>
    <path d="M16 4.5 11.8 16 16 27.5z" fill="${SAND}"/>
  </g>`;

const ogCard = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="IB Pathways">
  <rect width="1200" height="630" fill="${PAPER}"/>
  <rect x="0" y="0" width="1200" height="14" fill="${PINE}"/>
  <rect x="0" y="616" width="1200" height="14" fill="${ACCENT}"/>

  <!-- A quiet suggestion of latitude lines, not a map. -->
  <g stroke="${PINE}" stroke-width="1" opacity=".08">
    ${[140, 220, 300, 380, 460, 540].map((y) => `<path d="M60 ${y} Q600 ${y - 40} 1140 ${y}" fill="none"/>`).join('\n    ')}
  </g>

  ${mark(72, 70, 72)}

  <text x="72" y="300" font-family="Georgia, 'Iowan Old Style', serif" font-size="88" font-weight="600" fill="${INK}">
    IB Pathways
  </text>
  <text x="72" y="372" font-family="Inter, system-ui, sans-serif" font-size="34" fill="#4B443B">
    Where an IB Diploma can take you
  </text>

  <g font-family="Inter, system-ui, sans-serif" font-size="24" fill="#7C7266">
    <text x="72" y="468">Denmark, programme by programme · 35 countries · English-taught degrees</text>
    <text x="72" y="512">Deadlines, costs and entry requirements for the May 2027 session</text>
  </g>

  <rect x="72" y="548" width="132" height="4" fill="${ACCENT}"/>
</svg>
`;

const touchIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180" role="img" aria-label="IB Pathways">
  <rect width="180" height="180" rx="38" fill="${PINE}"/>
  ${mark(38, 38, 104, true)}
</svg>
`;

await fs.mkdir(OUT, { recursive: true });
await fs.writeFile(path.join(OUT, 'og-default.svg'), ogCard);
await fs.writeFile(path.join(OUT, 'apple-touch-icon.svg'), touchIcon);
console.log('wrote og-default.svg and apple-touch-icon.svg');
