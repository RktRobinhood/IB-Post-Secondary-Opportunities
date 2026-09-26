/**
 * Turns Natural Earth's 110m country polygons into the small basemap the globe
 * draws its far borders from.
 *
 *   node scripts/make-basemap.mjs [path/to/ne_110m_admin_0_countries.geojson]
 *
 * Why this exists at all: every map on the site was a dot cloud on an empty
 * panel with four decorative lines behind it. A reader could not tell they were
 * looking at Europe, or which dot was in which country. Geography is the thing
 * that makes a map a map.
 *
 * It was baked for the build-time flat map, which was removed on 26 September
 * 2026 (ADR 0007). The file it writes, `data/geo/countries.json`, is still
 * what the globe draws its far borders and picks countries from (the build
 * copies it to `assets/geo/`), and what the build's country check reads.
 *
 * Source: Natural Earth, public domain. https://www.naturalearthdata.com/
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const IN = process.argv[2] || path.join(ROOT, '.cache', 'geo', 'ne110m.geojson');
const OUT = path.join(ROOT, 'data', 'geo', 'countries.json');

/** Degrees. At the scales we draw, anything finer is invisible and costs bytes. */
const TOLERANCE = 0.22;
/** Drop islands too small to read. Square degrees, roughly. */
const MIN_AREA = 0.45;

/**
 * Simplify a closed ring.
 *
 * A ring repeats its first point at the end, which makes the Douglas–Peucker
 * baseline a zero-length segment: every perpendicular distance computes as
 * zero, the whole ring collapses to two points, and the basemap comes out
 * empty. So the ring is opened, simplified in two halves against real
 * baselines, and closed again.
 */
function simplifyRing(ring, tolerance) {
  const open = ring.slice(0, -1);
  if (open.length < 4) return ring;
  const half = Math.floor(open.length / 2);
  const a = simplify(open.slice(0, half + 1), tolerance);
  const b = simplify([...open.slice(half), open[0]], tolerance);
  const joined = [...a.slice(0, -1), ...b];
  return joined;
}

/** Douglas–Peucker, on raw lon/lat. Good enough away from the poles. */
function simplify(points, tolerance) {
  if (points.length < 3) return points;
  let maxDist = 0;
  let index = 0;
  const [ax, ay] = points[0];
  const [bx, by] = points[points.length - 1];
  const dx = bx - ax;
  const dy = by - ay;
  const denom = Math.hypot(dx, dy) || 1;
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i];
    const dist = Math.abs(dy * px - dx * py + bx * ay - by * ax) / denom;
    if (dist > maxDist) { maxDist = dist; index = i; }
  }
  if (maxDist <= tolerance) return [points[0], points[points.length - 1]];
  return [
    ...simplify(points.slice(0, index + 1), tolerance).slice(0, -1),
    ...simplify(points.slice(index), tolerance),
  ];
}

/** Shoelace area, in square degrees. Only used to decide what is too small to draw. */
function area(ring) {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  }
  return Math.abs(a / 2);
}

const round = (n) => Math.round(n * 100) / 100;

async function main() {
  const raw = JSON.parse(await fs.readFile(IN, 'utf8'));
  const out = [];
  let ringsIn = 0;
  let ringsOut = 0;
  let pointsIn = 0;
  let pointsOut = 0;

  for (const f of raw.features) {
    const g = f.geometry;
    if (!g) continue;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    const rings = [];
    for (const poly of polys) {
      // Outer ring only. Lakes and enclaves are detail we cannot see at this size.
      const ring = poly[0];
      if (!ring || ring.length < 4) continue;
      ringsIn++;
      pointsIn += ring.length;
      if (area(ring) < MIN_AREA) continue;
      const small = simplifyRing(ring, TOLERANCE).map(([lon, lat]) => [round(lon), round(lat)]);
      if (small.length < 4) continue;
      ringsOut++;
      pointsOut += small.length;
      rings.push(small.flat());
    }
    if (!rings.length) continue;
    out.push({
      // ISO A2 where Natural Earth has one; it uses "-99" for disputed areas.
      id: (f.properties.ISO_A2_EH || f.properties.ISO_A2 || '').toLowerCase().replace('-99', '') || null,
      name: f.properties.ADMIN || f.properties.SOVEREIGNT || '',
      rings,
    });
  }

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  const json = JSON.stringify({
    source: 'Natural Earth 110m admin 0 countries, public domain',
    url: 'https://www.naturalearthdata.com/',
    simplifiedToDegrees: TOLERANCE,
    countries: out,
  });
  await fs.writeFile(OUT, json);

  console.log(`\n${out.length} countries · ${ringsOut} of ${ringsIn} rings kept`);
  console.log(`points ${pointsIn} → ${pointsOut}  (${Math.round((1 - pointsOut / pointsIn) * 100)}% fewer)`);
  console.log(`${path.relative(ROOT, OUT)} — ${(json.length / 1024).toFixed(0)} KB\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
