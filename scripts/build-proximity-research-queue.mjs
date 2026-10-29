/** Derived work order only; never changes university facts or human decisions. */
import fs from 'node:fs';
import path from 'node:path';
import { schoolKey, programmePaths } from '../src/lib/schools.mjs';
import { picture } from '../src/lib/data.mjs';
import { schoolBackdropResolver } from '../src/lib/programme-imagery.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const asOf = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf || '')) throw new Error('Supply the local audit date: YYYY-MM-DD');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const rows = (dir) => fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith('.json')).map((f) => read(`${dir}/${f}`));
const places = new Map(rows('data/places').map((p) => [p.id, p]));
const origins = [...places.values()].filter((p) => p.destination === 'dk' && p.coordinates?.lat >= 54 && p.coordinates.lat <= 58.5 && p.coordinates.lon >= 7 && p.coordinates.lon <= 16);
if (!origins.length) throw new Error('No Danish reference places');
const radians = (x) => x * Math.PI / 180;
function distance(a, b) {
  const v = Math.sin(radians(b.lat - a.lat) / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(radians(b.lon - a.lon) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, v))));
}
const initial = new Set(read('docs/research/imports/queue.json').items.map((x) => x.institution_key));
const imagery = { images: read('data/images.json'), officialImages: read('data/official-images.json') };
const programmeImages = read('data/programme-images.json');
const ownPhoto = schoolBackdropResolver(programmeImages);
const institutions = new Map();
for (const country of rows('data/countries')) {
  for (const inst of country.institutions || []) institutions.set(schoolKey(country.code, inst), {
    key: schoolKey(country.code, inst), name: inst.name, country: country.code, place_ids: inst.place ? [inst.place] : [], model: 'country-profile',
  });
}
for (const inst of rows('data/institutions')) {
  const key = schoolKey(inst.destination, inst);
  institutions.set(key, { key, name: inst.name, country: inst.destination, place_ids: inst.places || [], model: 'canonical' });
}
const queue = [];
for (const inst of institutions.values()) {
  const points = inst.place_ids.map((id) => places.get(id)?.coordinates).filter((c) => Number.isFinite(c?.lat) && Number.isFinite(c?.lon));
  const km = inst.country === 'dk' ? 0 : points.length ? Math.round(Math.min(...points.flatMap((p) => origins.map((o) => distance(p, o.coordinates))))) : null;
  const schoolFile = `data/schools/${inst.key}.json`;
  const school = fs.existsSync(path.join(ROOT, schoolFile)) ? read(schoolFile) : null;
  const programmes = school ? programmePaths(inst.key, school.programmes) : [];
  const gaps = [];
  if (inst.model !== 'canonical' && !school) gaps.push('school research and English-degree scope');
  if (school && !school.summary) gaps.push('sourced character and known-for summary');
  if (school && !school.ib) gaps.push('IB entry guidance');
  if (school?.scope === 'catalogue' && (school.programmes.length < 2 || !school.faculties?.length)) gaps.push('institution-backed flagships and faculty guidance');
  if (school?.scope !== 'none' && !picture(imagery, inst.key)) gaps.push('institution photograph');
  const incomplete = programmes.filter((p) => !p.about || !p.overview || !p.selection?.length);
  if (incomplete.length) gaps.push(`${incomplete.length} programme descriptions or selection details`);
  if (school?.scope === 'listed') {
    const missing = programmes.filter((p) => !ownPhoto(inst.key, p.slug));
    if (missing.length) gaps.push(`${missing.length} degree-photo investigations`);
  }
  queue.push({ institution_key: inst.key, name: inst.name, country_code: inst.country,
    approximate_distance_km: km, reference_place_ids: inst.place_ids, model: inst.model,
    initial_batch: initial.has(inst.key), scope: school?.scope || null,
    disposition: school?.scope === 'none' ? 'existing-researched-exclusion' : gaps.length ? 'needs-parity-work' : 'audit-current-facts-and-parity',
    structural_gaps: gaps,
  });
}
queue.sort((a, b) => (a.approximate_distance_km ?? Infinity) - (b.approximate_distance_km ?? Infinity) || a.institution_key.localeCompare(b.institution_key));
const output = { as_of: asOf,
  purpose: 'After actionable initial-batch repairs, complete institutions outward from Denmark to the same research and visual standard as European pages.',
  distance_method: 'Minimum great-circle distance to a recorded Danish place in metropolitan Denmark. City/campus coordinates approximate a work order, not travel distance or distance to the national border. Denmark is first; missing coordinates sort last.',
  reference_places: origins.map((p) => p.id).sort(),
  caution: 'Structural gaps are a work list, never certification of current facts or image quality. Canonical institutions require their richer entity model and evidence review. Follow the full country pipeline; do not repeatedly research supported exclusions without new evidence.',
  institutions: queue,
};
fs.writeFileSync(path.join(ROOT, 'docs/research/imports/proximity-queue.json'), JSON.stringify(output, null, 2) + '\n');
console.log(`Queued ${queue.length} institutions; ${queue.filter((x) => x.approximate_distance_km === null).length} need coordinates. First non-Danish: ${queue.filter((x) => x.country_code !== 'dk').slice(0, 5).map((x) => `${x.institution_key} (${x.approximate_distance_km} km)`).join(', ')}`);
