/** Offline checks for the generated close-country windows. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

export function checkCountryDetailAssets(root) {
  const dir = path.join(root, 'src/assets/geo/detail-10m-v1');
  const files = fs.readdirSync(dir).filter(name => /^[a-z]{2}\.json$/.test(name)).sort();
  assert.deepEqual(files, fs.readdirSync(path.join(root, 'data/countries')).filter(name => /^[a-z]{2}\.json$/.test(name)).sort());
  let maximum = 0;
  const records = new Map();
  for (const name of files) {
    const raw = fs.readFileSync(path.join(dir, name));
    const record = JSON.parse(raw);
    const { country, bounds, land, lakes } = record;
    assert.equal(record.v, 1);
    assert.equal(country + '.json', name);
    assert.equal(bounds.length, 4);
    assert.ok(bounds.every(Number.isFinite));
    const [west, south, east, north] = bounds;
    assert.ok(east > west && east - west <= 81 && north > south && north - south <= 24.01);
    assert.ok(west >= -220 && east <= 220 && south >= -90 && north <= 90);
    assert.ok(land.some(([code, polygons]) => code === country && polygons.length));
    const zip = gzipSync(raw).byteLength;
    maximum = Math.max(maximum, zip);
    assert.ok(zip <= 215 * 1024 && raw.byteLength <= 620 * 1024, name + ' exceeds network budget');
    for (const polygon of [...land.flatMap(([,polys]) => polys), ...lakes]) {
      assert.ok(polygon.length, name + ' has an empty polygon');
      for (const ring of polygon) {
        assert.ok(ring.length >= 6 && ring.length % 2 === 0 && ring.every(Number.isInteger));
        let x = 0, y = 0;
        for (let i = 0; i < ring.length; i += 2) {
          x += ring[i]; y += ring[i+1];
          assert.ok(x / 1e4 >= west - .00011 && x / 1e4 <= east + .00011);
          assert.ok(y / 1e4 >= south - .00011 && y / 1e4 <= north + .00011);
        }
      }
    }
    records.set(country, record);
  }
  const inside = (ring, lon, lat) => {
    let x = 0, y = 0, previous, first, hits = false;
    const testEdge = ([ax, ay], [bx, by]) => {
      if ((ay > lat) !== (by > lat) && lon < (bx - ax) * (lat - ay) / (by - ay) + ax) hits = !hits;
    };
    for (let i = 0; i < ring.length; i += 2) {
      x += ring[i]; y += ring[i+1];
      const point = [x / 1e4, y / 1e4];
      if (previous) testEdge(previous, point); else first = point;
      previous = point;
    }
    testEdge(previous, first);
    return hits;
  };
  const contains = (polygon, x, y) => polygon.reduce((b, r) => b !== inside(r, x, y), false);
  const land = (code,x,y) => records.get(code).land.find(([key]) => key === code)[1].some(p => contains(p,x,y));
  assert.ok(land('dk', 14.91, 55.13), 'Bornholm should be Danish land');
  assert.ok(!land('dk', 12.77, 55.80), 'Øresund should remain open water');
  assert.ok(land('ch', 7.45, 46.95), 'Bern should be inside Switzerland');
  assert.ok(records.get('ch').lakes.some(p => contains(p, 6.55, 46.45)), 'Lake Geneva must be visibly watered');
  assert.ok(!land('ch', 6.10, 45.93), 'Annecy should not be Swiss land');
  assert.ok(land('nz', 174.77, -41.28), 'Wellington should be New Zealand land');
  assert.ok(records.get('nz').bounds[2] > 180, 'the New Zealand detail window exercises wrapped longitude');
  assert.ok(maximum > 0);
}
