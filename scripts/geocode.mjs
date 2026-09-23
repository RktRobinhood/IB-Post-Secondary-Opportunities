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

/**
 * Readings of a recorded "city", simplest last, deduplicated.
 *
 *   "Abu Dhabi (Al Reem Island)"        -> Abu Dhabi (Al Reem Island), Abu Dhabi
 *   "Mechelen, Antwerp, Turnhout, Geel" -> the whole string, then Mechelen
 *   "Hasselt and Diepenbeek"            -> the whole string, then Hasselt
 *   "Linz"                              -> Linz
 *
 * The full string is tried first because it is occasionally a real place name
 * with a comma in it, and only then narrowed.
 */
function cityCandidates(city) {
  const raw = String(city || '').trim();
  if (!raw) return [];
  const out = [raw];
  const noParen = raw.replace(/\s*\([^)]*\)/g, '').trim();
  if (noParen) out.push(noParen);
  const first = noParen.split(/\s*(?:,| and | & )\s*/i)[0].trim();
  if (first) out.push(first);
  return [...new Set(out)].filter(Boolean);
}

/**
 * The separate places a recorded "city" names, in the order it names them.
 *
 *   "Mechelen, Antwerp, Turnhout, Geel" -> [Mechelen, Antwerp, Turnhout, Geel]
 *   "Hasselt and Diepenbeek"            -> [Hasselt, Diepenbeek]
 *   "Abu Dhabi (Al Reem Island)"        -> [Abu Dhabi]   (a district, not a second city)
 *   "Linz"                              -> [Linz]
 *
 * The parenthetical is dropped first, because it qualifies the city rather than
 * adding another one — "Dubai (Dubai Knowledge Park)" is one place, and counting
 * it as two would make the note claim a campus that does not exist.
 */
function campusList(city) {
  const noParen = String(city || '')
    .replace(/\s*\([^)]*\)/g, '')
    .trim();
  if (!noParen) return [];
  return noParen
    .split(/\s*(?:,| and | & )\s*/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

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

async function qidFromSearch(name, limit = 1) {
  const d = await j(
    `https://www.wikidata.org/w/api.php?${new URLSearchParams({
      format: 'json', action: 'wbsearchentities', search: name, language: 'en', limit: String(limit), type: 'item',
    })}`
  );
  return limit === 1 ? d?.search?.[0]?.id || null : d?.search || [];
}

/**
 * The Wikidata item for a city, disambiguated by country.
 *
 * This used to search for "Tallinn Estonia" and find nothing at all, which is
 * why forty institutions with a perfectly ordinary one-word city had no
 * coordinate. `wbsearchentities` matches entity LABELS by prefix, and nothing
 * is labelled "Tallinn Estonia" — appending the country name does not narrow
 * the search, it destroys it.
 *
 * So the city is searched on its own and the country is used to choose between
 * the results, which is what it was always for. Wikidata's one-line description
 * carries it — "capital and most populous city of Estonia", "city in Czechia" —
 * and the ambiguity is real: a bare search for Cambridge returns Massachusetts
 * before England.
 */
async function qidForCity(city, countryName) {
  const results = await qidFromSearch(city, 5);
  if (!Array.isArray(results) || !results.length) return null;

  const needle = String(countryName || '').toLowerCase();
  if (needle) {
    const inCountry = results.find((r) => String(r.description || '').toLowerCase().includes(needle));
    if (inCountry) return inCountry.id;
  }

  /* No description named the country. Rather than take the top hit — which for
     "Cambridge" would put a Danish student's UK campus in Massachusetts — this
     gives up, and the institution is reported as unplaced. An unplaced marker
     is a gap; a marker in the wrong country is a lie. */
  return null;
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

/**
 * The ISO 3166-1 alpha-2 code of the country a Wikidata item belongs to,
 * via P17 (country) and P297 (ISO code). Exact, and needs no polygon.
 */
const isoCache = new Map();

async function isoOfEntity(qid) {
  if (!qid) return null;
  const countryQid = await claimId(qid, 'P17');
  if (!countryQid) return null;
  if (isoCache.has(countryQid)) return isoCache.get(countryQid);
  const iso = await claimString(countryQid, 'P297');
  const code = iso ? String(iso).toLowerCase() : null;
  isoCache.set(countryQid, code);
  return code;
}

async function claimId(qid, property) {
  const d = await j(
    `https://www.wikidata.org/w/api.php?${new URLSearchParams({
      format: 'json', action: 'wbgetclaims', entity: qid, property,
    })}`
  );
  return d?.claims?.[property]?.[0]?.mainsnak?.datavalue?.value?.id || null;
}

async function claimString(qid, property) {
  const d = await j(
    `https://www.wikidata.org/w/api.php?${new URLSearchParams({
      format: 'json', action: 'wbgetclaims', entity: qid, property,
    })}`
  );
  const v = d?.claims?.[property]?.[0]?.mainsnak?.datavalue?.value;
  return typeof v === 'string' ? v : null;
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
  const strays = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const country = JSON.parse(await fs.readFile(filePath, 'utf8'));
    const code = country.code || file.replace('.json', '');
    let touched = false;

    process.stdout.write(`\n${code} `);

    for (const inst of country.institutions || []) {
      /* The id and the display name come from the FIRST campus, not the whole
       * recorded string. "Esch-sur-Alzette (Belval), Luxembourg City" became a
       * single place called exactly that, which is not the name of anywhere.
       * The pin is one of those locations and the note says which, so the id
       * and the name should agree with the pin rather than list what it is
       * not. */
      const primaryCity = campusList(inst.city)[0] || inst.city || '';
      const placeId = `${code}-${slug(primaryCity || inst.shortName || inst.name)}`;

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
      let wrongCountry = false;

      const qid = inst.wikipedia ? await qidFromWikipedia(inst.wikipedia) : null;
      if (qid) {
        coords = await entityPlace(qid);
        if (coords) {
          /* Before trusting it: is this item even in the right country?
           *
           * An institution's own Wikidata coordinate is normally the best
           * answer there is, and it placed most of this catalogue correctly.
           * It is catastrophically wrong for exactly one kind of record — a
           * branch campus whose Wikipedia article is its PARENT's. Miami
           * University's centre in Differdange resolved to Miami University
           * and landed in Oxford, Ohio; Sacred Heart University Luxembourg
           * landed in Connecticut. Both were written at institution precision,
           * so nothing downstream doubted them.
           *
           * degreesOutside() in src/lib/data.mjs catches this afterwards, and
           * returns null for countries with no polygon at 110m — Luxembourg,
           * Malta, Singapore, Hong Kong — which is precisely where these were.
           * Asking Wikidata needs no polygon: P17 gives the country, P297 its
           * ISO code, and the comparison is exact. */
          const iso = await isoOfEntity(qid);
          if (iso && iso !== String(code).toLowerCase()) {
            strays.push(
              `${code}: ${inst.name} — its Wikidata item is in ${iso.toUpperCase()}, so the city was used instead`
            );
            coords = null;
            wrongCountry = true;
          } else {
            precision = 'institution';
          }
        }
      }

      if (!coords && inst.city) {
        const key = `${code}:${slug(inst.city)}`;
        if (cityCache.has(key)) {
          coords = cityCache.get(key);
        } else {
          /* A "city" in these records is often not one word. It carries the
           * district — "Abu Dhabi (Al Reem Island)" — or lists every campus —
           * "Mechelen, Antwerp, Turnhout, Geel", "Hasselt and Diepenbeek".
           * Searching Wikidata for the whole string matches nothing, so 46 of
           * the 48 unplaced institutions had a perfectly good city recorded and
           * no coordinate.
           *
           * So: try what the record says, then progressively simpler readings
           * of it. The first campus listed is the one the pin lands on, at city
           * precision, which the map already draws as a hollow marker meaning
           * "the city, not the campus". */
          /* `wrongCountry` matters here as much as it did above. Rejecting the
           * parent institution's COORDINATE and then taking the same parent's
           * administrative city is the identical mistake one step along: for
           * Sacred Heart University Luxembourg it swapped a pin in Connecticut
           * for a different pin in Connecticut. If the item is not in this
           * country, nothing derived from it is either. */
          let cityQid = qid && !wrongCountry ? await adminParent(qid) : null;
          for (const candidate of cityCandidates(inst.city)) {
            if (cityQid) break;
            cityQid = await qidForCity(candidate, country.name);
          }
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

      /* Where the recorded "city" named several campuses, this pin is not where
       * the institution is so much as where ONE OF IT is, and the record should
       * say which and what else there was. The map already draws anything below
       * campus precision as a hollow marker and the list carries the cue as
       * text; this gives that text something true to say. */
      const campuses = campusList(inst.city);
      const place = {
        id: placeId,
        destination: code,
        name: primaryCity || inst.name,
        kind: precision === 'institution' ? 'campus' : 'city',
        coordinates: coords,
        coordinatePrecision: precision,
        meta: {
          schemaVersion: SCHEMA_VERSION,
          dataAsOf: TODAY,
          ...(precision !== 'institution' && campuses.length > 1
            ? {
                notes: [
                  `${inst.name} is recorded across ${campuses.length} locations — ` +
                    `${campuses.join(', ')}. This pin is ${campuses[0]}, the first of them, ` +
                    `placed at city level. It is not the only place this institution teaches.`,
                ],
              }
            : {}),
        },
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
  if (strays.length) {
    console.log('\nRejected an institution coordinate for being in the wrong country:');
    for (const x of strays) console.log(`  ${x}`);
    console.log('');
  }

  if (misses.length) {
    console.log('\nNo coordinate found for:');
    for (const m of misses.slice(0, 30)) console.log(`  ${m}`);
    if (misses.length > 30) console.log(`  … and ${misses.length - 30} more`);
    console.log('\nAdd a "wikipedia" URL or a "city" to those institutions and re-run.');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
