/**
 * Gives every institution a location, so the map is not a Denmark-only feature.
 *
 *   node scripts/geocode.mjs                 # fill in what is missing
 *   node scripts/geocode.mjs --refresh       # re-resolve everything
 *   node scripts/geocode.mjs --only=nl,se
 *
 * Resolution order, most precise first:
 *   1. the institution's own Wikidata coordinate (P625) — usually the campus;
 *   2. the coordinate of the city it says it is in (P131 or a lookup);
 *   3. nothing, and the record says so.
 *
 * `coordinatePrecision` records which of those happened. A city centre is never
 * written as though it were a verified campus pin, because a student clicking a
 * marker has a reasonable expectation that it is the actual place.
 *
 * Writes Place records to data/places/ and adds `place` ids to the country
 * profiles' institutions. Country profiles stay where they are — this is
 * additive, not a migration.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA = path.join(ROOT, 'data');
const UA = { 'User-Agent': 'ib-pathways/1.0 (school guidance site) geocoder' };

const args = process.argv.slice(2);
const REFRESH = args.includes('--refresh');
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').replace('--only=', '').split(',').filter(Boolean);

const SCHEMA_VERSION = '1.0';
const TODAY = new Date().toISOString().slice(0, 10);

/* --- polite, adaptive HTTP -------------------------------------------------- */

let lastCall = 0;
let minGap = 320;

async function j(url, tries = 5) {
  for (let n = 1; n <= tries; n++) {
    const gap = Date.now() - lastCall;
    if (gap < minGap) await sleep(minGap - gap);
    lastCall = Date.now();
    let res;
    try {
      res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(20000) });
    } catch {
      await sleep(1200 * n);
      continue;
    }
    if (res.ok) { minGap = Math.max(320, minGap - 20); return res.json(); }
    if (res.status === 429 || res.status >= 500) {
      minGap = Math.min(3000, minGap + 400);
      await sleep(1500 * n);
      continue;
    }
    return null;
  }
  return null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* --- Wikidata --------------------------------------------------------------- */

async function qidFromWikipedia(wikipediaUrl) {
  const m = decodeURIComponent(wikipediaUrl || '').match(/\/wiki\/([^#?]+)/);
  if (!m) return null;
  const title = m[1].replace(/_/g, ' ');
  const d = await j(
    `https://en.wikipedia.org/w/api.php?${new URLSearchParams({
      format: 'json', formatversion: '2', action: 'query', prop: 'pageprops', titles: title,
    })}`
  );
  return d?.query?.pages?.[0]?.pageprops?.wikibase_item || null;
}

async function qidFromSearch(name) {
  const d = await j(
    `https://www.wikidata.org/w/api.php?${new URLSearchParams({
      format: 'json', action: 'wbsearchentities', search: name, language: 'en', limit: '1', type: 'item',
    })}`
  );
  return d?.search?.[0]?.id || null;
}

/** Coordinate location (P625) and administrative location (P131). */
async function entityPlace(qid) {
  if (!qid) return null;
  const d = await j(
    `https://www.wikidata.org/w/api.php?${new URLSearchParams({
      format: 'json', action: 'wbgetclaims', entity: qid, property: 'P625',
    })}`
  );
  const v = d?.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
  if (v && Number.isFinite(v.latitude) && Number.isFinite(v.longitude)) {
    return { lat: round(v.latitude), lon: round(v.longitude) };
  }
  return null;
}

async function adminParent(qid) {
  const d = await j(
    `https://www.wikidata.org/w/api.php?${new URLSearchParams({
      format: 'json', action: 'wbgetclaims', entity: qid, property: 'P131',
    })}`
  );
  return d?.claims?.P131?.[0]?.mainsnak?.datavalue?.value?.id || null;
}

const round = (n) => Math.round(n * 10000) / 10000;

/** Written as each one is resolved, so a long run is resumable. */
async function writePlace(place) {
  await fs.writeFile(
    path.join(DATA, 'places', `${place.id}.json`),
    JSON.stringify(place, null, 2) + '\n'
  );
}

/* --- main -------------------------------------------------------------------- */

function slug(s) {
  return String(s ?? '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/ø/gi, 'o').replace(/æ/gi, 'ae').replace(/å/gi, 'aa')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    // Trim AFTER truncating as well. Stripping the trailing hyphen first and
    // then slicing can put one back, which is how a place ended up with the id
    // "fr-paris-plus-campuses-in-dijon-le-havre-menton-nancy-poitiers-and-" and
    // failed the id pattern. Long "city" strings listing several campuses are
    // common enough that this is not a rare edge.
    .slice(0, 64).replace(/-+$/, '');
}

async function main() {
  const dir = path.join(DATA, 'countries');
  let files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json')).sort();
  if (ONLY.length) files = files.filter((f) => ONLY.includes(f.replace('.json', '')));

  await fs.mkdir(path.join(DATA, 'places'), { recursive: true });

  // Existing places, so re-runs are cheap and ids stay stable.
  const existing = new Map();
  for (const f of await fs.readdir(path.join(DATA, 'places')).catch(() => [])) {
    try {
      const p = JSON.parse(await fs.readFile(path.join(DATA, 'places', f), 'utf8'));
      existing.set(p.id, p);
    } catch {}
  }

  const cityCache = new Map();
  let resolved = 0, reused = 0, failed = 0;
  const misses = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const country = JSON.parse(await fs.readFile(filePath, 'utf8'));
    const code = country.code || file.replace('.json', '');
    let touched = false;

    process.stdout.write(`\n${code} `);

    for (const inst of country.institutions || []) {
      const placeId = `${code}-${slug(inst.city || inst.shortName || inst.name)}`;

      if (!REFRESH && inst.place && existing.has(inst.place)) { reused++; process.stdout.write('·'); continue; }
      if (!REFRESH && existing.has(placeId)) {
        inst.place = placeId;
        touched = true;
        reused++;
        process.stdout.write('·');
        continue;
      }

      let coords = null;
      let precision = 'unknown';

      const qid = inst.wikipedia ? await qidFromWikipedia(inst.wikipedia) : null;
      if (qid) {
        coords = await entityPlace(qid);
        if (coords) precision = 'institution';
      }

      if (!coords && inst.city) {
        const key = `${code}:${slug(inst.city)}`;
        if (cityCache.has(key)) {
          coords = cityCache.get(key);
        } else {
          const cityQid = (qid ? await adminParent(qid) : null) || (await qidFromSearch(`${inst.city} ${country.name}`));
          coords = await entityPlace(cityQid);
          cityCache.set(key, coords);
        }
        if (coords) precision = 'city';
      }

      if (!coords) {
        failed++;
        misses.push(`${code}: ${inst.name}`);
        process.stdout.write('×');
        continue;
      }

      const place = {
        id: placeId,
        destination: code,
        name: inst.city || inst.name,
        kind: precision === 'institution' ? 'campus' : 'city',
        coordinates: coords,
        coordinatePrecision: precision,
        meta: { schemaVersion: SCHEMA_VERSION, dataAsOf: TODAY },
      };
      existing.set(place.id, place);
      await writePlace(place);
      inst.place = place.id;
      touched = true;
      resolved++;
      process.stdout.write('+');
    }

    // Persist per country so an interrupted run loses at most one country's
    // work, and a re-run picks up where it stopped.
    if (touched) await fs.writeFile(filePath, JSON.stringify(country, null, 2) + '\n');
    console.log(`  ${code}: ${resolved} resolved, ${reused} reused so far`);
  }

  console.log(`\n\nresolved ${resolved} · reused ${reused} · unresolved ${failed}`);
  console.log(`${existing.size} places on disk`);
  if (misses.length) {
    console.log('\nNo coordinate found for:');
    for (const m of misses.slice(0, 30)) console.log(`  ${m}`);
    if (misses.length > 30) console.log(`  … and ${misses.length - 30} more`);
    console.log('\nAdd a "wikipedia" URL or a "city" to those institutions and re-run.');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
