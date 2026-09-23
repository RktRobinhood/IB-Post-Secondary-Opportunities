/*
 * Prototype build. NOT part of `src/build.mjs` and never called by it.
 *
 * Reads the repository's real records and emits a self-contained page under
 * prototypes/globe/. Run with:  node prototypes/globe/build.mjs
 *
 * Everything it reads is a real record. There are no fixtures: the geography is
 * data/geo/countries.json, the points are data/places/*.json, the filter fields
 * come off data/destinations/*.json, and the detail panel's evidence is
 * resolved out of data/evidence/*.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const HERE = import.meta.dirname;
const ROOT = path.join(HERE, '..', '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const readDir = (d) =>
  fs.readdirSync(path.join(ROOT, d)).filter((f) => f.endsWith('.json')).map((f) => read(path.join(d, f)));

const geo = read('data/geo/countries.json');
const places = readDir('data/places');
const destinations = readDir('data/destinations');
const opportunities = readDir('data/opportunities');
const evidence = readDir('data/evidence').flat();

const evById = new Map(evidence.map((e) => [e.id, e]));

/* --- The slice -----------------------------------------------------------
   The fifteen Destination records are the ones carrying the fields the filters
   need. Their Places give the three regions the research doc asks for and a
   longitude spread wide enough that the globe's one real limitation — a
   hemisphere is all you can ever see at once — is actually exercised. */

const REGION = {
  de: 'Europe', dk: 'Europe', gb: 'Europe', ie: 'Europe', nl: 'Europe', no: 'Europe', se: 'Europe',
  au: 'Asia-Pacific', jp: 'Asia-Pacific', kr: 'Asia-Pacific', nz: 'Asia-Pacific', sg: 'Asia-Pacific',
  ae: 'Asia-Pacific',
  ca: 'North America', us: 'North America',
};

const oppCount = {};
for (const o of opportunities) oppCount[o.place] = (oppCount[o.place] || 0) + 1;

const destById = new Map(destinations.map((d) => [d.id, d]));

const feeFor = (d) => {
  const eu = (d.feeContext || []).find((f) => f.applicantGroup === 'eu-eea-ch');
  return eu
    ? { status: eu.feeStatus, summary: eu.summary || '', evidence: eu.evidence || [] }
    : { status: 'unknown', summary: '', evidence: [] };
};

const records = places
  .filter((p) => destById.has(p.destination) && p.coordinates)
  .map((p) => {
    const d = destById.get(p.destination);
    const fee = feeFor(d);
    return {
      id: p.id,
      name: p.name,
      dest: d.id,
      destName: d.name,
      region: REGION[d.id] || d.region || 'Elsewhere',
      lat: p.coordinates.lat,
      lon: p.coordinates.lon,
      precision: p.coordinatePrecision || 'campus',
      count: oppCount[p.id] || 0,
      /* Three real filter fields, taken off the Destination record unchanged. */
      scope: d.scope,                   // 'europe' | 'worldwide'
      fee: fee.status,                  // no-fee | eu-eea-rate | international-rate | unknown
      localLanguage: !!(d.language && d.language.localLanguageRequired),
      /* Evidence for the detail panel. */
      feeSummary: fee.summary,
      feeEvidence: fee.evidence,
      ibEvidence: (d.ibRecognition && d.ibRecognition.evidence) || [],
      ibRule: (d.ibRecognition && d.ibRecognition.subjectLevelRule) || '',
      englishTaught: (d.language && d.language.englishTaughtBachelors) || '',
    };
  })
  .sort((a, b) => a.destName.localeCompare(b.destName) || a.name.localeCompare(b.name));

const usedEvidence = new Set(records.flatMap((r) => [...r.feeEvidence, ...r.ibEvidence]));
const evidenceOut = {};
for (const id of usedEvidence) {
  const e = evById.get(id);
  if (!e) continue;
  evidenceOut[id] = {
    id: e.id, publisher: e.publisher, sourceUrl: e.sourceUrl, sourceClass: e.sourceClass,
    retrievedAt: e.retrievedAt, claim: e.claim, verificationState: e.verificationState,
  };
}

/* --- Sphere geometry ------------------------------------------------------
   A vertex's position on the unit sphere never changes, so the sin/cos wants
   paying once rather than on every frame — but *where* to pay it is a real
   choice, and it was measured both ways.

   Paying it here and shipping x,y,z costs 50% more bytes than shipping the
   lon,lat pairs the repository already has (127,750 raw / 38,189 gzip against
   80,553 / 29,422). Paying it at load instead costs one pass over 5,904
   vertices, which is under a millisecond even on a throttled phone, and lets
   the globe reuse `data/geo/countries.json` byte for byte — no second copy of
   the world to keep in step with the first.

   So the rings ship exactly as they are stored, and globe.js converts on
   construction. The conversion is timed at runtime and reported by the bench. */
const lonLatRings = [];
for (const c of geo.countries) for (const ring of c.rings) lonLatRings.push(ring);

/* --- Flat-map fallback, rendered here, exactly as primitives.mjs does ------
   Same Mercator, same frame fitting, same `slice` behaviour. Copied rather than
   imported so the prototype stays self-contained and cannot break the build. */
const W = 1000, H = 420;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const mercatorY = (deg) => (Math.log(Math.tan(Math.PI / 4 + (clamp(deg, -84, 84) * Math.PI) / 360)) * 180) / Math.PI;

function frameFor(box, ratio) {
  let x0 = box.west, x1 = box.east, y0 = mercatorY(box.south), y1 = mercatorY(box.north);
  const spanX = x1 - x0, spanY = y1 - y0;
  if (spanX / spanY < ratio) { const want = spanY * ratio, c = (x0 + x1) / 2; x0 = c - want / 2; x1 = c + want / 2; }
  else { const want = spanX / ratio, c = (y0 + y1) / 2; y0 = c - want / 2; y1 = c + want / 2; }
  return { x0, x1, y0, y1 };
}

function landPaths(view) {
  const out = [];
  const sx = W / (view.x1 - view.x0), sy = H / (view.y1 - view.y0);
  for (const country of geo.countries) {
    for (const flat of country.rings) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      const pts = [];
      for (let i = 0; i < flat.length; i += 2) {
        const x = (flat[i] - view.x0) * sx, y = (view.y1 - mercatorY(flat[i + 1])) * sy;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
        pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
      }
      if (maxX < 0 || minX > W || maxY < 0 || minY > H) continue;
      if (maxX - minX < 3 && maxY - minY < 3) continue;
      out.push(`M${pts.join('L')}Z`);
    }
  }
  return out;
}

/* The whole world, because the slice's records span three regions. This is the
   like-for-like frame: whatever the globe shows, the flat map shows here. */
const WORLD = { north: 72, south: -48, west: -170, east: 180 };
const view = frameFor(WORLD, W / H);
const project = (lat, lon) => ({
  x: ((lon - view.x0) / (view.x1 - view.x0)) * W,
  y: ((view.y1 - mercatorY(lat)) / (view.y1 - view.y0)) * H,
});

const maxCount = Math.max(1, ...records.map((r) => r.count || 1));
const flatMarks = records.map((r) => {
  const { x, y } = project(r.lat, r.lon);
  return { ...r, x, y, rad: 4 + Math.sqrt((r.count || 1) / maxCount) * 9 };
});

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const flatSvg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" class="world__svg"
     role="img" data-w="${W}" data-h="${H}"
     aria-label="Places with recorded study options: ${flatMarks.length} shown.">
  <rect class="world__sea" x="0" y="0" width="${W}" height="${H}" aria-hidden="true"/>
  <g class="world__land" aria-hidden="true">${landPaths(view).map((d) => `<path d="${d}"/>`).join('')}</g>
  <g class="world__marks" aria-hidden="true">${flatMarks
    .map(
      (m) =>
        `<g class="world__place" data-place="${esc(m.id)}" data-x="${m.x.toFixed(1)}" data-y="${m.y.toFixed(1)}" data-r="${m.rad.toFixed(1)}">` +
        `<circle cx="${m.x.toFixed(1)}" cy="${m.y.toFixed(1)}" r="${(m.rad * 2.4).toFixed(1)}" class="world__glow"/>` +
        `<circle cx="${m.x.toFixed(1)}" cy="${m.y.toFixed(1)}" r="${m.rad.toFixed(1)}" class="world__dot"/></g>`
    )
    .join('')}</g>
</svg>`;

const listHtml = records
  .map(
    (r) => `<li data-place="${esc(r.id)}"><button type="button" class="res__item" data-place="${esc(r.id)}">
      <span class="res__name">${esc(r.name)}</span>
      <span class="res__dest">${esc(r.destName)} &middot; ${esc(r.region)}</span>
      <span class="res__meta">${r.count ? `${r.count} recorded ${r.count === 1 ? 'option' : 'options'}` : 'No options recorded yet'}${r.precision !== 'campus' ? ` &middot; placed at the ${esc(r.precision)}` : ''}</span>
    </button></li>`
  )
  .join('\n');

const payload = { records, evidence: evidenceOut, rings: lonLatRings, geoSource: geo.source };

const page = fs
  .readFileSync(path.join(HERE, 'template.html'), 'utf8')
  .replace('<!--FLAT-->', flatSvg)
  .replace('<!--LIST-->', listHtml)
  .replace(/<!--COUNT-->/g, String(records.length))
  .replace(/<!--DESTS-->/g, String(new Set(records.map((r) => r.dest)).size));

fs.writeFileSync(path.join(HERE, 'index.html'), page);
fs.writeFileSync(path.join(HERE, 'data.json'), JSON.stringify(payload));

/* --- Measurements, written next to the thing they measure ----------------- */
const gz = (s) => zlib.gzipSync(Buffer.from(s), { level: 9 }).length;
const ringsJson = JSON.stringify(lonLatRings);
const recordsJson = JSON.stringify({ records, evidence: evidenceOut });
const measured = {
  measuredAt: new Date().toISOString().slice(0, 10),
  records: records.length,
  destinations: new Set(records.map((r) => r.dest)).size,
  regions: [...new Set(records.map((r) => r.region))],
  vertices: lonLatRings.reduce((n, r) => n + r.length / 2, 0),
  bytes: {
    flatSvgWorld: { raw: flatSvg.length, gzip: gz(flatSvg) },
    semanticList: { raw: listHtml.length, gzip: gz(listHtml) },
    globeGeometry: { raw: ringsJson.length, gzip: gz(ringsJson) },
    sharedRecords: { raw: recordsJson.length, gzip: gz(recordsJson) },
    page: { raw: page.length, gzip: gz(page) },
  },
};
for (const f of ['globe.js', 'app.js', 'globe.css']) {
  const p = path.join(HERE, f);
  if (fs.existsSync(p)) { const s = fs.readFileSync(p); measured.bytes[f] = { raw: s.length, gzip: gz(s) }; }
}
fs.writeFileSync(path.join(HERE, 'measured.json'), JSON.stringify(measured, null, 2));
console.log(JSON.stringify(measured, null, 2));
