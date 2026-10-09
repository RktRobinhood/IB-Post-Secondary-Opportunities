/* Reverse-geocodes the IB world harvest (data/harvests/ib-world-2026-10-09.tsv)
 * to a city per institution, via OpenStreetMap Nominatim at its 1-request-a-
 * second limit. Cached in data/harvests/ib-world-cities.json, so a re-run only
 * asks for what is missing. */
import fs from 'node:fs';
const TSV = 'data/harvests/ib-world-2026-10-09.tsv', OUT = 'data/harvests/ib-world-cities.json';
const cache = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const rows = fs.readFileSync(TSV, 'utf8').trim().split('\n').slice(1).map((l) => l.split('|'));
for (const r of rows) {
  const id = r[2], lat = r[9], lon = r[10];
  if (cache[id]) continue;
  /* A statement with no map link is found by its name instead. */
  const name = r[1].replace(/\s*\([^)]*\)\s*$/, '');
  const u = lat
    ? `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&accept-language=en&lat=${lat}&lon=${lon}`
    : `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&accept-language=en&q=${encodeURIComponent(name + ', ' + r[0])}`;
  try {
    let j = await (await fetch(u, { headers: { 'User-Agent': 'ib-pathways-europe/1.0 (school guidance site; github.com/rktrobinhood)' } })).json();
    if (Array.isArray(j)) j = j[0] || {};
    const a = j.address || {};
    cache[id] = { city: a.city || a.town || a.municipality || a.village || a.county || a.state || '', state: a.state || '', cc: a.country_code || '' };
    if (!lat && j.lat) Object.assign(cache[id], { lat: Number(j.lat), lon: Number(j.lon), byName: true });
    fs.writeFileSync(OUT, JSON.stringify(cache, null, 1));
  } catch (e) { console.error(id, e.message); }
  await new Promise((r) => setTimeout(r, 1100));
}
console.log(Object.keys(cache).length, 'cached');
