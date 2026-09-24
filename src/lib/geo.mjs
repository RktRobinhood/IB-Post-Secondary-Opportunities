/**
 * Small, dependency-free geography for placing a Destination on a map.
 *
 * A country is drawn as one light, and where that light goes used to be the
 * mean of its campuses. The mean of Vancouver, Toronto and Montreal is in
 * Minnesota: an average of points on a curved, concave country is not a point
 * in the country. So the light goes on the *medoid* instead — the real place
 * whose total distance to the others is smallest. It is always one of the
 * country's own places, so it is always inside the country, and for a compact
 * country it is the place nearest the middle.
 */

const R = 6371;
const D2R = Math.PI / 180;

/** Great-circle distance in kilometres. */
export function km(a, b) {
  const dLat = (b.lat - a.lat) * D2R;
  const dLon = (b.lon - a.lon) * D2R;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * D2R) * Math.cos(b.lat * D2R) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** The place, among `points`, with the smallest summed distance to the rest. */
export function representativePoint(points) {
  const pts = points.filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lon));
  if (!pts.length) return null;
  let best = pts[0];
  let bestSum = Infinity;
  for (const p of pts) {
    let sum = 0;
    for (const q of pts) sum += km(p, q);
    if (sum < bestSum) { bestSum = sum; best = p; }
  }
  return { lat: best.lat, lon: best.lon };
}

/** Is (lat, lon) inside any of these flat [lon, lat, lon, lat, …] rings? Even–odd. */
export function insideRings(lat, lon, rings) {
  for (const ring of rings) {
    let inside = false;
    for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
      const xi = ring[i], yi = ring[i + 1], xj = ring[j], yj = ring[j + 1];
      if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
    }
    if (inside) return true;
  }
  return false;
}

/** Roughly how far (lat, lon) is from the nearest edge of these rings, in km. */
export function kmToRings(lat, lon, rings) {
  const kx = Math.cos(lat * D2R) * 111.32;
  const ky = 110.57;
  let best = Infinity;
  for (const ring of rings) {
    for (let i = 0; i < ring.length; i += 2) {
      const j = (i + 2) % ring.length;
      const ax = (ring[i] - lon) * kx, ay = (ring[i + 1] - lat) * ky;
      const bx = (ring[j] - lon) * kx, by = (ring[j + 1] - lat) * ky;
      const dx = bx - ax, dy = by - ay;
      const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1)));
      best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy));
    }
  }
  return best;
}
