/** Refresh a local Studyinfo data dependency for institutions already on file.
 * npm run import:studyinfo [-- --year 2027 --season autumn]
 * --cached replays the original dated harvest without network access.
 * All requests must succeed before the last good snapshot is replaced.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { API, identity, catalogueEntry } from '../src/lib/studyinfo.mjs';
import { schoolKey } from '../src/lib/schools.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const CACHE = path.join(ROOT, '.cache', 'studyinfo-harvest.json');
const OUTPUT = path.join(ROOT, 'data', 'external', 'studyinfo.json');
const CALLER_ID = process.env.STUDYINFO_CALLER_ID || 'ib-pathways.studyinfo-import';
// Both names are published by LUT: https://www.lut.fi/en/about-us/introducing-university
const ALIASES = { 'LUT University': ['Lappeenranta-Lahti University of Technology LUT'] };

async function getJson(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(45000), headers: {
        Accept: 'application/json', 'Caller-Id': CALLER_ID,
        'User-Agent': 'ib-pathways-europe/0.2 (https://github.com/rktrobinhood/IB-Post-Secondary-Opportunities)',
      } });
      if (!response.ok) throw new Error(`${response.status} ${url}`);
      return await response.json();
    } catch (error) {
      if (attempt === 2) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
}

export async function main(args = process.argv.slice(2)) {
  const option = (flag, fallback) => args.includes(flag) ? args[args.indexOf(flag) + 1] : fallback;
  const year = Number(option('--year', '2027'));
  const season = option('--season', 'autumn');
  if (!Number.isInteger(year) || year < 2020 || year > 2100 || !['spring', 'autumn'].includes(season)) throw new Error('Use --year YYYY --season autumn|spring');
  if (!/^[a-z0-9._-]+$/.test(CALLER_ID)) throw new Error('STUDYINFO_CALLER_ID must contain only a-z, 0-9, dot, underscore or hyphen');
  const country = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'countries', 'fi.json'), 'utf8'));
  const known = country.institutions.map((i) => ({ key: schoolKey('fi', i), name: i.name, aliases: [i.name, ...(ALIASES[i.name] || [])].map(identity) }));
  const match = (name) => {
    const matches = known.filter((i) => i.aliases.includes(identity(name)));
    if (matches.length > 1) throw new Error(`Ambiguous institution name: ${name}`);
    return matches[0];
  };
  let harvest;
  if (args.includes('--cached')) {
    harvest = JSON.parse(await fs.readFile(CACHE, 'utf8'));
  } else {
    const hits = [];
    let total;
    for (let page = 1; ; page++) {
      const query = new URLSearchParams({ opetuskieli: 'oppilaitoksenopetuskieli_4', koulutustyyppi: 'kandi,kandi-ja-maisteri,amk-alempi', lng: 'en', size: '200', page: String(page), sort: 'name', order: 'asc' });
      const response = await getJson(`${API}/search/toteutukset-koulutuksittain?${query}`);
      if (!Array.isArray(response.hits) || !Number.isInteger(response.total)) throw new Error('Studyinfo search response has changed');
      if (total !== undefined && total !== response.total) throw new Error('Studyinfo catalogue changed during pagination; retry');
      total = response.total;
      hits.push(...response.hits);
      if (hits.length >= total) break;
      if (!response.hits.length || page > 100) throw new Error('Incomplete Studyinfo pagination');
    }
    if (new Set(hits.map((h) => h.oid)).size !== total) throw new Error('Duplicate or incomplete Studyinfo search results');
    const offerings = [...new Map(hits.flatMap((h) => h.toteutukset || []).filter((t) => match(t.oppilaitosNimi?.en)).map((t) => [t.toteutusOid, t])).values()];
    console.log(`${total} catalogue records; fetching ${offerings.length} offerings at our institutions`);
    const details = {};
    // Small batches keep independent reads bounded and stay well below the
    // operational rate of the public search interface.
    for (let start = 0; start < offerings.length; start += 3) {
      const batch = offerings.slice(start, start + 3);
      const responses = await Promise.all(batch.map((t) => getJson(`${API}/toteutus/${t.toteutusOid}?koulutus=true&hakukohteet=true&haut=true`)));
      for (let n = 0; n < batch.length; n++) {
        if (responses[n]?.oid !== batch[n].toteutusOid || !Array.isArray(responses[n].hakukohteet)) throw new Error(`Invalid offering ${batch[n].toteutusOid}`);
        details[batch[n].toteutusOid] = responses[n];
      }
      console.log(`  ${Math.min(start + 3, offerings.length)}/${offerings.length}`);
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    harvest = { retrievedAt: new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Copenhagen' }).format(new Date()), total, hits, details };
    await fs.mkdir(path.dirname(CACHE), { recursive: true });
    await fs.writeFile(CACHE, JSON.stringify(harvest));
  }
  const institutions = Object.fromEntries(known.map((i) => [i.key, { name: i.name, providerIds: [], programmes: [], excluded: {} }]));
  const seen = new Set();
  for (const hit of harvest.hits) for (const offering of hit.toteutukset || []) {
    const institution = match(offering.oppilaitosNimi?.en);
    if (!institution) continue;
    const pair = `${institution.key}:${offering.toteutusOid}`;
    if (seen.has(pair)) continue;
    seen.add(pair);
    const detail = harvest.details[offering.toteutusOid];
    if (!detail) throw new Error(`Harvest lacks ${offering.toteutusOid}; refresh without --cached`);
    const result = catalogueEntry(detail, offering.oppilaitosOid, year, season);
    const record = institutions[institution.key];
    if (!record.providerIds.includes(offering.oppilaitosOid)) record.providerIds.push(offering.oppilaitosOid);
    if (result.entry) record.programmes.push(result.entry);
    else record.excluded[result.reason] = (record.excluded[result.reason] || 0) + 1;
  }
  for (const record of Object.values(institutions)) {
    record.programmes.sort((a, b) => a.name.localeCompare(b.name, 'en') || a.id.localeCompare(b.id));
    record.status = record.programmes.length ? 'listings-found' : record.providerIds.length ? 'no-matching-listings' : 'not-matched-in-filtered-feed';
  }
  const snapshot = {
    schemaVersion: 2,
    source: { id: 'studyinfo', publisher: 'Finnish National Agency for Education', url: 'https://opintopolku.fi/konfo/en/', api: API,
      accessBasis: 'Official Konfo external API documentation explicitly describes display on third-party websites. No blanket data licence identified; only structured names, identifiers and links are published.',
      documentation: 'https://wiki.eduuni.fi/spaces/ophPPK/pages/190612447',
      callerIdDocumentation: 'https://wiki.eduuni.fi/x/0MeKCg' },
    retrievedAt: harvest.retrievedAt, intakeYear: year, season,
    selection: 'Existing Finnish institutions only; published degree with EQF 6; English as sole structured teaching language; target-season published application option explicitly lists IB (112), general university (123) or general UAS (100) eligibility. IB-specific recognition is recorded separately per application. This is catalogue discovery, not an eligibility assessment.',
    upstreamEducationRecords: harvest.total, institutions,
  };
  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  await fs.writeFile(`${OUTPUT}.tmp`, `${JSON.stringify(snapshot, null, 2)}\n`);
  await fs.rename(`${OUTPUT}.tmp`, OUTPUT);
  const records = Object.values(institutions);
  console.log(`Saved ${records.reduce((n, i) => n + i.programmes.length, 0)} listings across ${records.filter((i) => i.programmes.length).length}/${known.length} institutions to data/external/studyinfo.json`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
