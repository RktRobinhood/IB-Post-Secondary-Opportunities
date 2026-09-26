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
 *
 * For a big country the medoid is still a campus, not the middle, so since
 * 26 September 2026 (#53) a country's light goes to `visualCentre()` of its
 * outline, and the medoid is the fallback for a country with no outline.
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

/**
 * The point a reader sees as the middle of a country, from its outline.
 *
 * The medoid above keeps a light inside the country, but it is a campus: for
 * a big country it is wherever the universities cluster, so the United
 * States' light sat near Detroit and Canada's by Lake Ontario (the owner,
 * #53: "your pips are not placed in the center of the country"). A light that
 * stands for the whole country belongs at the country's middle:
 *
 *   - its main land: the largest ring and any ring at least a third its size
 *     (by area on an equal-area projection), so Alaska, Hawaii, Baffin
 *     Island, French Guiana or Svalbard never pull it off, while New
 *     Zealand's two islands are weighed together;
 *   - the area centroid of that land, when it is well inside (at least half
 *     as far from the coast as the deepest point of the land is): that is
 *     what the eye calls the middle — Kansas, for the United States;
 *   - otherwise, the point nearest that centroid that is that deep: the
 *     centroid of a crescent, of a country with a bay in it (Canada and
 *     Hudson Bay) or of a coastal strip (Sweden) is in the sea or on the
 *     shore, and the middle the eye sees is just inland of it.
 *
 * Rings are flat [lon, lat, lon, lat, …] arrays (the 50m borders). Returns
 * { lat, lon }, or null when there is no ring. No country is named.
 */
export function visualCentre(rings) {
  const usable = (rings || []).filter((r) => r && r.length >= 6);
  if (!usable.length) return null;

  /* Sinusoidal (equal-area) about the land's central meridian, in degrees. */
  const areaOf = (pts) => {
    let a = 0;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) a += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1];
    return a / 2;
  };
  const project = (ring, lon0) => {
    const pts = [];
    for (let i = 0; i < ring.length; i += 2) pts.push([(ring[i] - lon0) * Math.cos(ring[i + 1] * D2R), ring[i + 1]]);
    return pts;
  };
  const midLon = (list) => {
    let w = Infinity, e = -Infinity;
    for (const ring of list) for (let i = 0; i < ring.length; i += 2) { w = Math.min(w, ring[i]); e = Math.max(e, ring[i]); }
    return (w + e) / 2;
  };
  const sized = usable.map((ring) => ({ ring, area: Math.abs(areaOf(project(ring, midLon([ring])))) }));
  const biggest = Math.max(...sized.map((s) => s.area));
  const main = sized.filter((s) => s.area >= biggest / 3).map((s) => s.ring);
  const lon0 = midLon(main);
  const polys = main.map((ring) => project(ring, lon0));
  const back = ([x, y]) => ({ lat: y, lon: lon0 + x / Math.max(1e-6, Math.cos(y * D2R)) });

  const inside = (x, y) => polys.some((pts) => {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  });
  const edgeDist = (x, y) => {
    let best = Infinity;
    for (const pts of polys) {
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [ax, ay] = pts[j], [bx, by] = pts[i];
        const dx = bx - ax, dy = by - ay;
        const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
        best = Math.min(best, Math.hypot(x - ax - t * dx, y - ay - t * dy));
      }
    }
    return best;
  };
  /* How deep inside the land a point is; negative in the sea. */
  const depth = (x, y) => (inside(x, y) ? 1 : -1) * edgeDist(x, y);

  /* The area centroid of the main land. */
  let cx = 0, cy = 0, a2 = 0;
  for (const pts of polys) {
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const f = pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1];
      cx += (pts[j][0] + pts[i][0]) * f; cy += (pts[j][1] + pts[i][1]) * f; a2 += f;
    }
  }
  const centroid = a2 ? [cx / (3 * a2), cy / (3 * a2)] : polys[0][0];

  /* The deepest point (the "polylabel" search: split only the cells that
     could hold a deeper point than the best so far), to know how deep "well
     inside" is. Precision: a hundredth of a degree. */
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const pts of polys) for (const [x, y] of pts) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
  const cell = (x, y, h) => { const d = depth(x, y); return { x, y, h, d, max: d + h * Math.SQRT2 }; };
  let deepest = cell(centroid[0], centroid[1], 0);
  const size = Math.min(maxX - minX, maxY - minY);
  if (size > 0) {
    const queue = [];
    for (let x = minX; x < maxX; x += size) for (let y = minY; y < maxY; y += size) queue.push(cell(x + size / 2, y + size / 2, size / 2));
    while (queue.length) {
      let k = 0;
      for (let i = 1; i < queue.length; i++) if (queue[i].max > queue[k].max) k = i;
      const c = queue.splice(k, 1)[0];
      if (c.d > deepest.d) deepest = c;
      if (c.max - deepest.d <= 0.01) continue;
      const h = c.h / 2;
      queue.push(cell(c.x - h, c.y - h, h), cell(c.x + h, c.y - h, h), cell(c.x - h, c.y + h, h), cell(c.x + h, c.y + h, h));
    }
  }

  const deepEnough = deepest.d * 0.5;
  if (depth(centroid[0], centroid[1]) >= deepEnough) return back(centroid);
  /* The nearest point to the centroid that is deep enough: a grid over the
     land, then one finer pass around the winner. */
  let pick = [deepest.x, deepest.y];
  let pickGap = Math.hypot(pick[0] - centroid[0], pick[1] - centroid[1]);
  const scan = (x0, x1, y0, y1, step) => {
    for (let x = x0; x <= x1; x += step) {
      for (let y = y0; y <= y1; y += step) {
        const gap = Math.hypot(x - centroid[0], y - centroid[1]);
        if (gap < pickGap && depth(x, y) >= deepEnough) { pick = [x, y]; pickGap = gap; }
      }
    }
  };
  const step = Math.max(maxX - minX, maxY - minY) / 80;
  scan(minX, maxX, minY, maxY, step);
  scan(pick[0] - step, pick[0] + step, pick[1] - step, pick[1] + step, step / 8);
  return back(pick);
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
