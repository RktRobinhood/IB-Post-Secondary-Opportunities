/**
 * The globe's close-zoom borders: Natural Earth 50m, simplified.
 *
 *   node scripts/make-globe-borders.mjs [path/to/ne_50m_admin_0_countries.geojson]
 *
 * `data/geo/countries.json` (110m, simplified to 0.22°) is right for the flat
 * map and for the globe from a distance, and it is what every page's build
 * draws. Dived in on a single country it is not: the Netherlands is a pentagon.
 * This writes a finer layer to `src/assets/geo/borders-50m.json`, which the
 * globe fetches only once the camera comes down below the altitude where the
 * difference shows, so a reader who never zooms in never pays for it.
 *
 * Ids are made exactly as `make-basemap.mjs` makes them, so a country is the
 * same id in both layers and the globe can swap one for the other.
 *
 * Source: Natural Earth 1:50m Admin 0 – Countries, public domain,
 * https://www.naturalearthdata.com/downloads/50m-cultural-vectors/ — fetched
 * from the project's own GitHub mirror when no path is given.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const URL50 = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson';
const CACHE = path.join(ROOT, '.cache', 'geo', 'ne50m.geojson');
const OUT = path.join(ROOT, 'src', 'assets', 'geo', 'borders-50m.json');

/** Degrees, ~5 km. Finer than the day texture resolves (~20 km a texel). */
const TOLERANCE = 0.05;
/** Square degrees. Islands smaller than this are dropped. */
const MIN_AREA = 0.02;

function simplifyRing(ring, tolerance) {
  const open = ring.slice(0, -1);
  if (open.length < 4) return ring;
  const half = Math.floor(open.length / 2);
  const a = simplify(open.slice(0, half + 1), tolerance);
  const b = simplify([...open.slice(half), open[0]], tolerance);
  return [...a.slice(0, -1), ...b];
}

function simplify(points, tolerance) {
  if (points.length < 3) return points;
  let maxDist = 0, index = 0;
  const [ax, ay] = points[0];
  const [bx, by] = points[points.length - 1];
  const dx = bx - ax, dy = by - ay;
  const denom = Math.hypot(dx, dy) || 1;
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i];
    const dist = Math.abs(dy * px - dx * py + bx * ay - by * ax) / denom;
    if (dist > maxDist) { maxDist = dist; index = i; }
  }
  if (maxDist <= tolerance) return [points[0], points[points.length - 1]];
  return [...simplify(points.slice(0, index + 1), tolerance).slice(0, -1), ...simplify(points.slice(index), tolerance)];
}

function area(ring) {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  return Math.abs(a / 2);
}

const round = (n) => Math.round(n * 100) / 100;

let text;
const given = process.argv[2];
try {
  text = await fs.readFile(given || CACHE, 'utf8');
} catch {
  const res = await fetch(URL50);
  if (!res.ok) throw new Error(`${URL50}: ${res.status}`);
  text = await res.text();
  await fs.mkdir(path.dirname(CACHE), { recursive: true });
  await fs.writeFile(CACHE, text);
}
const raw = JSON.parse(text);

const out = [];
let pointsOut = 0;
for (const f of raw.features) {
  const g = f.geometry;
  if (!g) continue;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
  const rings = [];
  for (const poly of polys) {
    const ring = poly[0];
    if (!ring || ring.length < 4 || area(ring) < MIN_AREA) continue;
    const small = simplifyRing(ring, TOLERANCE).map(([lon, lat]) => [round(lon), round(lat)]);
    if (small.length < 4) continue;
    pointsOut += small.length;
    rings.push(small.flat());
  }
  if (!rings.length) continue;
  out.push({
    id: (f.properties.ISO_A2_EH || f.properties.ISO_A2 || '').toLowerCase().replace('-99', '') || null,
    name: f.properties.ADMIN || f.properties.SOVEREIGNT || '',
    rings,
  });
}

const json = JSON.stringify({
  source: 'Natural Earth 50m admin 0 countries, public domain',
  url: 'https://www.naturalearthdata.com/',
  simplifiedToDegrees: TOLERANCE,
  countries: out,
});
await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, json);
const { gzipSync } = await import('node:zlib');
console.log(`${out.length} countries · ${pointsOut} points · ${(json.length / 1024).toFixed(0)} KB raw · ${(gzipSync(json).length / 1024).toFixed(0)} KB gzip`);
