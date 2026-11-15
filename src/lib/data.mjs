/**
 * Loads everything in /data and normalises it into the shape the templates want.
 *
 * The JSON files are written by hand and by research agents, so they are
 * forgiving by design: missing fields are normal, and nothing here throws on a
 * gap. `validate()` reports problems instead, and the build prints them.
 */
import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { slugify, listSentence } from './html.mjs';
import { destinationFacet, loadRecords, indexSources, FIELD_TONES } from './records.mjs';
import { summarise as summariseEvidenceRecords } from './evidence-policy.mjs';
import { publishable as editoriallyPublishable, isApproved } from './imagery.mjs';
import { backdropResolver, schoolBackdropResolver } from './programme-imagery.mjs';
import { designResolver } from './designed-backdrop.mjs';
import { cardKey, schoolCardGroups } from './families.mjs';
import { englishProgrammeCounts } from './intake-language.mjs';
import { schoolKey, loadSchools, hostOf, programmePaths, pagedProgrammes } from './schools.mjs';

/* A school record with each programme's page address on it (#43): a listed
   school's every degree, a catalogue school's flagships. */
const withProgrammePages = (key, rec) =>
  rec ? { ...rec, programmes: programmePaths(key, pagedProgrammes(rec)) } : null;

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const DATA = path.join(ROOT, 'data');

async function readJson(p, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(p, 'utf8'));
  } catch {
    return fallback;
  }
}

async function readDir(dir) {
  try {
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json')).sort();
    const out = [];
    for (const f of files) {
      const j = await readJson(path.join(dir, f));
      // The filename is the stable identifier — titles get reworded, filenames don't.
      if (j) out.push({ slug: f.replace(/\.json$/, ''), ...j });
      else console.warn(`  ! could not parse ${path.relative(ROOT, path.join(dir, f))}`);
    }
    return out;
  } catch {
    return [];
  }
}

/* --- Fields that agents sometimes fill in slightly different shapes -------- */

/** costs.tuitionEuEea may be a string or {value, year, source}. */
export function money(v) {
  if (!v) return null;
  if (typeof v === 'string') return { value: v, year: null, source: null };
  if (typeof v === 'object' && v.value) return { value: v.value, year: v.year || null, source: v.source || null };
  return null;
}

function asArray(v) {
  if (!v) return [];
  return Array.isArray(v) ? v.filter(Boolean) : [v];
}

/** Regions, in the order they should appear. */
export const REGION_ORDER = [
  'Nordics',
  'British Isles',
  'Western Europe',
  'Central Europe',
  'Baltics',
  'Southern Europe',
  'North America',
  'Asia-Pacific',
  'Middle East',
  'Other',
];

const FLAGS = {
  at: '🇦🇹', au: '🇦🇺', be: '🇧🇪', ca: '🇨🇦', ch: '🇨🇭', cn: '🇨🇳', cz: '🇨🇿', de: '🇩🇪',
  dk: '🇩🇰', ee: '🇪🇪', es: '🇪🇸', fi: '🇫🇮', fr: '🇫🇷', gb: '🇬🇧', gr: '🇬🇷', hk: '🇭🇰',
  hu: '🇭🇺', ie: '🇮🇪', is: '🇮🇸', it: '🇮🇹', jp: '🇯🇵', kr: '🇰🇷', lt: '🇱🇹', lu: '🇱🇺',
  lv: '🇱🇻', mt: '🇲🇹', nl: '🇳🇱', no: '🇳🇴', nz: '🇳🇿', pl: '🇵🇱', pt: '🇵🇹', se: '🇸🇪',
  sg: '🇸🇬', si: '🇸🇮', us: '🇺🇸', ae: '🇦🇪',
  am: '🇦🇲', az: '🇦🇿', bb: '🇧🇧', bg: '🇧🇬', bh: '🇧🇭', br: '🇧🇷', co: '🇨🇴', cy: '🇨🇾',
  ec: '🇪🇨', eg: '🇪🇬', gd: '🇬🇩', gh: '🇬🇭', gy: '🇬🇾', id: '🇮🇩', il: '🇮🇱', in: '🇮🇳',
  jm: '🇯🇲', jo: '🇯🇴', kh: '🇰🇭', kw: '🇰🇼', kz: '🇰🇿', lb: '🇱🇧', mc: '🇲🇨', mo: '🇲🇴',
  mx: '🇲🇽', my: '🇲🇾', ng: '🇳🇬', np: '🇳🇵', om: '🇴🇲', pa: '🇵🇦', ph: '🇵🇭', pk: '🇵🇰',
  qa: '🇶🇦', sa: '🇸🇦', th: '🇹🇭', tr: '🇹🇷', tt: '🇹🇹', ug: '🇺🇬', uz: '🇺🇿', vi: '🇻🇮',
  vn: '🇻🇳', za: '🇿🇦',
};

/* --- IB recognition statements (#38) --------------------------------------- */

/**
 * What an institution card may say about its IB statement: one line and a
 * link. The number is the persuasive part — IB students really do send their
 * results here — and it counts transcripts *sent*, so the wording says "sent",
 * never "admitted" or "enrolled". A statement that says the Diploma is not
 * recognised says so first; silence about recognition says nothing at all.
 *
 * Below IB_TRANSCRIPT_FLOOR the number is not shown, only the link. A small
 * count is more often an artefact than a signal — the Technical University of
 * Munich's statement reads 1, because its record was re-created in 2023 — and
 * "2 transcripts sent here" invites exactly the wrong conclusion about a place.
 */
export const IB_TRANSCRIPT_FLOOR = 25;

export function ibStatementFacet(s) {
  if (!s?.statementUrl) return null;
  const n = Number.isInteger(s.transcripts5y) && s.transcripts5y >= IB_TRANSCRIPT_FLOOR ? s.transcripts5y : null;
  let text = null;
  if (s.recognises?.diploma === false) text = 'says it does not recognise the IB Diploma';
  else if (n) text = `${n.toLocaleString('en-GB')} IB transcript${n === 1 ? '' : 's'} sent here in five years`;
  return {
    url: s.statementUrl,
    text,
    transcripts5y: n,
    recognisesDiploma: s.recognises?.diploma ?? null,
    recognisesCourseResults: s.recognises?.courseResults ?? null,
    diplomaPolicy: s.diplomaPolicy || null,
    ibAdmissions: s.links?.ibAdmissions || null,
    retrievedAt: s.retrievedAt || null,
  };
}

/* --- Funding lines that name a shared scheme ------------------------------

   A Destination's funding list may hold { "fund": "<id>", "note": "…" }
   instead of a sentence. It names a record in data/funding/, whose `label`
   (who can claim it) and `otherwise` (what to do if you cannot) are written
   once there, so every page naming the scheme carries the same condition.
   The note is only what is particular to this Destination. */

export function fundingLine(item, schemes = {}, adjectiveOf = () => null, where = null) {
  if (typeof item === 'string' || !item?.fund) return item;
  const f = schemes[item.fund];
  if (!f) throw new Error(`funding line names "${item.fund}", which has no record in data/funding/`);
  const adjective = adjectiveOf(f.destination);
  const name = adjective ? `${adjective} ${f.name}` : f.name;
  /* On another Destination's page the scheme is being taken abroad, which
     usually carries conditions of its own. */
  const abroad = where && where !== f.destination && f.abroad?.label;
  const label = abroad ? f.abroad.label : f.label;
  const lead = (abroad ? f.abroad.lead : f.lead) || null;
  const first = lead ? `${name} ${lead} ${label}.` : `${name}, ${label}.`;
  return [first, item.note, f.otherwise].filter(Boolean).join(' ');
}

/* --- Load ----------------------------------------------------------------- */

export async function load({ today = process.env.SITE_TODAY || new Date().toISOString().slice(0, 10) } = {}) {
  const records = await loadRecords({ retirePassed: true, today });
  const { graph, schools } = records;
  const [topics, conversionRaw, images, officialImages, glossary, faq, ibSubjects, preparationRaw, config, ibStatements, fundingRaw, applicantGroups, programmeImages, studyinfo, externalSources, countryGuideFiles, sessionFiles] = await Promise.all([
    readDir(path.join(DATA, 'topics')), readJson(path.join(DATA, 'ib-conversion.json')),
    readJson(path.join(DATA, 'images.json'), {}), readJson(path.join(DATA, 'official-images.json'), {}),
    readJson(path.join(DATA, 'glossary.json'), { terms: [] }), readJson(path.join(DATA, 'faq.json'), { questions: [] }),
    readJson(path.join(DATA, 'ib-subjects.json'), { subjects: [] }), readJson(path.join(DATA, 'preparation.json')),
    readJson(path.join(DATA, 'site-config.json')), readJson(path.join(DATA, 'ib-statements.json'), { statements: {} }),
    readDir(path.join(DATA, 'funding')), readJson(path.join(DATA, 'applicant-groups.json'), { groups: [] }),
    readJson(path.join(DATA, 'programme-images.json'), {}), readJson(path.join(DATA, 'external', 'studyinfo.json')),
    readJson(path.join(DATA, 'external', 'sources.json'), { sources: [] }), readDir(path.join(DATA, 'country-guides')),
    readDir(path.join(DATA, 'sessions')),
  ]);
  const conversion = indexSources(conversionRaw, graph.evidence);
  const preparation = indexSources(preparationRaw, graph.evidence);
  const fundingSchemes = fundingRaw.map(f => indexSources(f, graph.evidence));
  const fundingById = Object.fromEntries(fundingSchemes.map(f => [f.id, f]));
  const adjectiveOf = code => graph.destinations.get(code)?.adjective || null;
  const countryGuides = Object.fromEntries(countryGuideFiles.map(g => [g.slug, g]));
  const projected = new Map(records.institutions.map(i => [i.id, i]));
  const programmes = records.programmes;
  const backdropFor = backdropResolver(programmeImages, [...graph.programmes.values()].filter(p => p.intakes?.length).map(p => ({ id: p.id, field: p.field?.primary, card: cardKey(p), primary: !!p.family?.primary })));
  const schoolBackdrop = schoolBackdropResolver(programmeImages);
  const creditOf = (b, institution) => b.external
    ? { text: 'Image: ' + (String(b.author || '').trim() ? creditName(b.author) : institution || 'the institution'), url: b.page }
    : { text: creditName(b.author) + ' · ' + (b.licence || 'Wikimedia Commons'), url: b.page };
  const projectionByProgramme = new Map(programmes.map(p => [p.programmeId, p]));
  const collectSources = value => {
    if (!value || typeof value !== 'object') return [];
    const own = Array.isArray(value.sources) ? value.sources : [];
    return [...own, ...Object.entries(value).filter(([k]) => !['sources', 'meta'].includes(k)).flatMap(([,v]) => Array.isArray(v) ? v.flatMap(collectSources) : collectSources(v))];
  };
  const uniqueSources = values => [...new Map(values.map(s => [s.url + '|' + s.retrieved + '|' + s.title, s])).values()];
  const byKey = new Map();
  for (const [key, authored] of schools) {
    const view = projected.get(key) || {};
    const school = { ...authored, programmes: programmePaths(key, pagedProgrammes(authored)).map(p => {
      const rich = projectionByProgramme.get(p.id);
      const b = (rich ? backdropFor(p.id) : null) || schoolBackdrop(key, p.slug);
      const photo = b ? programmeImages[b.key] : null;
      const result = { ...p, ...(rich || {}), id: p.id || key + '-' + p.slug, credential: p.credential, field: p.field, about: p.about, slug: p.slug, href: p.href,
        sources: uniqueSources(collectSources(p)), ...(b ? { backdrop: { ...b, alt: photo?.description || photo?.subject || '', credit: creditOf({ ...b, author: photo?.author || b.author, licence: photo?.licence || b.licence, page: photo?.official ? photo?.sourcePage : photo?.page || b.page }, authored.name) } } : {}) };
      if (rich) { result.restrictedAdmission = rich.restrictedAdmission; result.opportunityId = rich.opportunityId; result.intakes = p.intakes; result.applicationRoutes = p.intakes?.[0]?.applicationRoutes || []; }
      return result;
    }) };
    const statement = ibStatementFacet(ibStatements.statements?.[key] || authored.aliases?.map(a => ibStatements.statements?.[a]).find(Boolean));
    const inst = { ...view, ...authored, type: view.type || authored.type, id: key, key, countryCode: authored.country, destination: destinationFacet(graph.destinations.get(authored.country), authored.country),
      school, programmes: school.programmes, href: '/universities/' + key + '/', ibRecognitionStatement: statement,
      campuses: (authored.places || (authored.place ? [authored.place] : [])).map(id => graph.places.get(id)?.name).filter(Boolean),
      ibisCode: authored.codes?.ibResultsService || null, sources: uniqueSources(collectSources(authored)),
      coords: graph.places.get(authored.place || authored.places?.[0])?.coordinates || null,
      coordinatePrecision: graph.places.get(authored.place || authored.places?.[0])?.coordinatePrecision || null };
    byKey.set(key, inst);
  }
  const countries = records.countries.map(c => {
    const out = { ...c, flag: FLAGS[c.code] || '', href: c.href || '/destinations/' + c.code + '/', scope: c.scope === 'worldwide' ? 'worldwide' : 'europe',
      institutions: (c.institutions || []).map(key => byKey.get(key)).filter(Boolean),
      whyConsider: asArray(c.whyConsider), watchOuts: asArray(c.watchOuts), sources: asArray(c.sources), deadlines: asArray(c.application?.deadlines),
      guideContent: countryGuides[c.code] || null,
      funding: asArray(c.funding).map(f => fundingLine(f, fundingById, adjectiveOf, c.code)) };
    out.places = [...new Set(out.institutions.flatMap(i => i.places || (i.place ? [i.place] : [])))].map(id => graph.places.get(id)).filter(Boolean);
    out.researchDepth = researchDepth(out, graph);
    return out;
  });
  const allSchools = [...byKey.values()].sort((a,b) => a.name.localeCompare(b.name));
  const designs = countries.flatMap(c => c.institutions.flatMap(inst => {
    const ordered = [...inst.school.programmes].sort((a,b) => Number(Boolean(a.closesForDiplomaHolders)) - Number(Boolean(b.closesForDiplomaHolders)) || String(a.field).localeCompare(String(b.field)) || a.name.localeCompare(b.name));
    const groups = schoolCardGroups(ordered);
    const drawn = new Map();
    for (const g of groups) {
      const photo = g.members.some(p => p.backdrop);
      for (const p of g.members) drawn.set(p, p.backdrop ? false : p === g.lead && !photo ? 'card' : 'page');
    }
    return groups.flatMap(g => g.members).map((p, order) => ({ p, seed: p.href, field: p.field, group: inst.key, order, shown: drawn.get(p) }));
  }));
  const designFor = designResolver(designs, FIELD_TONES);
  for (const {p} of designs) p.design = designFor(p.href);
  for (const p of programmes) { const common = allSchools.find(i => i.id === p.institutionId)?.school.programmes.find(x => x.programmeId === p.programmeId); if (common) { p.backdrop = common.backdrop; p.design = common.design; } }
  const scopeCodes = [...new Set([...graph.opportunities.values()].map(o => o.destination))].filter(Boolean);
  const catalogue = institutionCatalogue(allSchools, countries, graph);
  return { today, schools, countries, destinations: countries, countryGuides, externalCatalogues: { studyinfo }, externalSources,
    opportunityScope: { ...scopeWording(scopeCodes.map(code => sentenceNameFor(countries, code))), codes: scopeCodes, complete: scopeCodes.length >= countries.length },
    europe: countries.filter(c => c.scope === 'europe'), world: countries.filter(c => c.scope === 'worldwide'),
    institutionCatalogue: catalogue, dkInstitutions: catalogue.in('dk'), programmes, graph,
    ibSubjects: ibSubjects.subjects || [], ibDiplomaMinimumPoints: ibSubjects.diplomaMinimumPoints ?? null,
    recognitionSchemes: records.recognitionSchemes, fundingSchemes, funding: fundingById, applicantGroups: applicantGroups.groups || [],
    preparation, config, evidenceSummary: summariseEvidence(graph),
    topics: Object.fromEntries(topics.map(t => [slugify(t.title || 'topic'), t])), topicList: topics,
    conversion, images, officialImages, programmeImages, backdropFor, designFor, glossary, faq,
    sessions: new Map(sessionFiles.map(f => [f.institution || f.slug, Array.isArray(f.sessions) ? f.sessions : []])) };
}

/* --- How many Destinations is this about, and what do I call them? --------- */

/**
 * Inside a sentence some Destination names take a definite article and a page
 * cannot know which, so the record says. "in the Netherlands", not "in
 * Netherlands".
 */
function sentenceNameFor(destinations, code) {
  const d = destinations.find((x) => x.code === code);
  return d?.articleName || d?.name || code;
}

/**
 * The wording for "which Destinations this surface covers", derived rather than
 * asserted.
 *
 * Written once because it was needed twice and will be needed again. The rule
 * it encodes is that a heading may name the Destinations while it can still
 * name them all, and must stop naming any of them the moment it cannot — a page
 * that says "every English-taught degree in Denmark" over a list containing
 * Delft is worse than one that says "5 destinations", because a student takes
 * the heading at its word and stops looking.
 *
 * Names sort by the word that matters, so "the Netherlands" files under N.
 */
function scopeWording(names) {
  const sorted = [...names].sort((a, b) => a.replace(/^the /, '').localeCompare(b.replace(/^the /, '')));
  return {
    names: sorted,
    /** "Denmark", "Denmark and the Netherlands", "five destinations". */
    label:
      sorted.length === 0
        ? 'no destinations yet'
        : sorted.length <= 3
          ? listSentence(sorted)
          : `${sorted.length} destinations`,
    /** For a navigation chip, where there is room for a word and not a list. */
    chip: sorted.length === 1 ? sorted[0] : `${sorted.length} destinations`,
  };
}

/**
 * The Institutions, arranged by the thing that decides how every page about
 * them reads.
 *
 * `dkInstitutions` was a correct interface for as long as Denmark was the only
 * Destination with Institutions, and it stopped being correct without anything
 * failing: the list grew five Dutch entries, `/universities/` went on calling
 * them "Danish institutions" under a Denmark breadcrumb, and nothing in the
 * build had an opinion about it.
 *
 * Deleting the name would only have moved the problem. Destination selection,
 * ordering and the wording for "which countries is this list about" would then
 * be re-decided by the build, the institution index, the Programme explorer and
 * the Denmark hub, four times, from the same `site.institutions` array — and
 * the first one to get it wrong would again produce a plausible page rather
 * than an error. So the knowledge is concentrated here and callers ask for what
 * they actually mean:
 *
 *   `.all`          — every Institution, whatever its Destination.
 *   `.in(code)`     — only that Destination's, for a page that promises them.
 *   `.byDestination`— the same set grouped, so an index can be honest about
 *                     holding more than one country without hard-coding two.
 *   `.scope`        — what to call the set in a heading.
 *
 * It lives here rather than in `catalogue.mjs` only because that file is owned
 * by another change in flight; Destination identity and precedence are its
 * subject and this belongs beside them.
 */
function institutionCatalogue(institutions, destinations, graph) {
  const all = institutions;
  const byCode = new Map();
  for (const inst of all) {
    const code = inst.destination?.code || null;
    if (!byCode.has(code)) byCode.set(code, []);
    byCode.get(code).push(inst);
  }

  const byDestination = [...byCode.entries()]
    .filter(([code]) => code)
    .map(([code, list]) => ({
      ...(list[0].destination),
      institutions: list,
      programmes: englishProgrammeCounts(graph, list.flatMap((i) => i.programmes || [])).confirmed,
      pendingProgrammes: englishProgrammeCounts(graph, list.flatMap((i) => i.programmes || [])).pending,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    all,
    /* An empty array, not everything. A page that asks for a Destination we
       hold no Institutions for is making a claim about that Destination, and
       the honest answer to it is "none" rather than "here is Denmark's". */
    in: (code) => byCode.get(code) || [],
    byDestination,
    scope: scopeWording(byDestination.map((d) => sentenceNameFor(destinations, d.code))),
  };
}

/** The state of the evidence, reported on every build and on the trust page. */
function summariseEvidence(graph) {
  return summariseEvidenceRecords([...(graph?.evidence?.values() || [])]);
}

/* --- Where on earth is this -------------------------------------------------- */

/**
 * How far a coordinate is from the country it claims to be in, in degrees.
 * Zero when it is inside; null when we hold no polygon for that country.
 *
 * The obvious version of this check — "which country is this point in?" — cries
 * wolf, and a check that cries wolf gets switched off. Natural Earth at 110m
 * has no separate polygon for Hong Kong, Singapore, Luxembourg or Malta, so
 * every Hong Kong university "is in China". Geneva and Lugano sit in thin Swiss
 * salients that simplification rounds away, so they land in France and Italy.
 * None of those is a mistake in our data.
 *
 * Distance answers the question that was actually being asked. Geneva is a
 * fifth of a degree outside a simplified Switzerland; DigiPen Singapore was a
 * hundred degrees from Singapore. Only the second is a bug, and no threshold
 * has to be argued about to tell them apart.
 */
let BASEMAP_CACHE = null;
function basemap() {
  if (!BASEMAP_CACHE) {
    try {
      BASEMAP_CACHE = JSON.parse(fsSync.readFileSync(path.join(DATA, 'geo', 'countries.json'), 'utf8'));
    } catch {
      BASEMAP_CACHE = { countries: [] };
    }
  }
  return BASEMAP_CACHE;
}

/**
 * A country's outline at the globe's finer scale (Natural Earth 50m, the same
 * file the globe dives into), as flat [lon, lat, …] rings — for placing a
 * light that stands for the whole country at its middle (geo.mjs
 * visualCentre). Empty when the country has no outline there.
 */
let OUTLINES = null;
export function countryOutline(code) {
  if (!OUTLINES) {
    OUTLINES = new Map();
    try {
      const borders = JSON.parse(fsSync.readFileSync(path.join(ROOT, 'src', 'assets', 'geo', 'borders-50m.json'), 'utf8'));
      for (const c of borders.countries || []) if (c.id) OUTLINES.set(c.id, [...(OUTLINES.get(c.id) || []), ...c.rings]);
    } catch { /* no outlines: callers fall back to the places */ }
  }
  return OUTLINES.get(code) || [];
}

function degreesOutside(lat, lon, code) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  /* The finer outline when there is one: the 110m basemap has no Azores,
     Madeira or Canaries, so a real island campus read as 16° adrift. */
  const fine = countryOutline(code);
  const country = fine.length ? { rings: fine } : basemap().countries.find((c) => c.id === code);
  if (!country) return null;

  let best = Infinity;
  for (const flat of country.rings) {
    if (inRing(lat, lon, flat)) return 0;
    for (let i = 0; i < flat.length; i += 2) {
      const d = Math.hypot(flat[i] - lon, flat[i + 1] - lat);
      if (d < best) best = d;
    }
  }
  return best;
}

/** Ray casting over a flat [lon, lat, lon, lat, …] ring. */
function inRing(lat, lon, flat) {
  let inside = false;
  for (let i = 0, j = flat.length - 2; i < flat.length; j = i, i += 2) {
    const xi = flat[i];
    const yi = flat[i + 1];
    const xj = flat[j];
    const yj = flat[j + 1];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/* --- Research depth -------------------------------------------------------- */

/**
 * How far a Destination has actually been researched, computed from what is on
 * disk rather than asserted by hand.
 *
 * Coverage here is uneven by an order of magnitude — Poland cites 43 sources
 * for 13 institutions, South Korea cites 4 for 14 — and every page presented it
 * with the same confidence. A student could not tell a researched Destination
 * from a sketch, which is the one thing that matters on a site whose whole
 * promise is that a claim is backed by a source with a date.
 *
 * The tier gives the shape. The counts are carried alongside it and rendered,
 * because a tier on its own is a grade, and a grade invites an argument about
 * where the line sits; 4 sources for 14 institutions does not.
 */
function researchDepth(c, graph) {
  const institutions = c.institutions.length;
  const sources = c.sources.length;
  const routes = [...(graph?.applicationRoutes?.values() || [])].filter(r => r.destination === c.code);
  const dates = c.deadlines.length ? c.deadlines : routes.flatMap(r => (r.milestones || []).filter(m => m.date || m.dateState));
  const refs = new Set();
  const gather = value => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(gather); return; }
    for (const source of Array.isArray(value.sources) ? value.sources : []) if (source?.url && source.retrieved) refs.add(source.url + '|' + source.retrieved);
    for (const [key, child] of Object.entries(value)) if (!['sources', 'ibRecognitionStatement'].includes(key)) gather(child);
  };
  gather(c);
  const tier = c.sectorLandscape?.routes?.length && refs.size && routes.length ? 'researched' : institutions && sources >= institutions ? 'profiled' : 'outline';
  return { tier, institutions, sources, deadlines: dates.length, dated: dates.filter(d => typeof d.date === 'string' && !Number.isNaN(Date.parse(d.date))).length, undated: dates.filter(d => d.date == null).length, evidence: refs.size, routes: routes.length };
}

/** The wording for each tier. Descriptive, not a score. */
export const RESEARCH_DEPTH = {
  researched: {
    label: 'Researched in depth',
    summary: 'Its sector, application route and deadlines each come with a source and a date.',
  },
  profiled: {
    label: 'Profile with sources',
    summary: 'The country profile and institution list carry source links; detailed sector and application routes remain incomplete.',
  },
  outline: {
    label: 'Outline only',
    summary: 'Fewer sources than institutions listed. Treat this page as a starting point for your own research, not as a checked account of how admission works here.',
  },
};

/* --- Picture resolution --------------------------------------------------- */

/**
 * Which picture to use for a thing, in order of preference:
 *   1. the institution's own Open Graph share image, linked from its server —
 *      that is the picture it publishes of itself for exactly this purpose;
 *   2. a freely licensed Wikimedia Commons photograph we host ourselves;
 *   3. nothing, and the template falls back to a typographic panel.
 */
/**
 * The most a hot-linked official image may weigh before we decline to publish
 * it.
 *
 * An institution's own Open Graph image is the better picture — it is the one
 * the university chose of itself — but it is served raw, at whatever size the
 * press office exported. CBS publishes its share images as 6720×4480 JPEGs of
 * 20 MB. Self-hosted Commons photographs go through the image standard and
 * average 200 KB; there is no equivalent step for a file on someone else's CDN,
 * because we link to those rather than copy them, and copying a university's
 * copyrighted photograph into an MIT repository is not ours to do.
 *
 * So the gate is here, at publication, rather than in the fetcher: the record
 * is kept either way, `npm run images:official -- --report` lists what was held
 * back, and a person can go and find a smaller official image for those.
 * A student reading this on a phone should not download 20 MB for one page.
 */
export const OFFICIAL_MAX_BYTES = 2_000_000;

/**
 * An official pick we are willing to hot-link, or null.
 *
 * Two ceilings, and they are unrelated. Bytes are this file's business, because
 * a 20 MB share image is a page-weight problem wherever it points. Whether the
 * picture is *of* anything is `src/lib/imagery.mjs`'s business, and an official
 * image is exempt from the score floor there: it was published by the
 * institution as its own picture of itself rather than chosen from a pool of
 * candidates by a heuristic, so there is no score and nothing for a floor to
 * measure. A person can still reject one.
 */
function publishable(official) {
  if (!official) return null;
  // No content-length is not a reason to reject — plenty of CDNs omit it — but
  // a known size over the ceiling is.
  if (typeof official.bytes === 'number' && official.bytes > OFFICIAL_MAX_BYTES) return null;
  return editoriallyPublishable(official, { scored: false }) ? official : null;
}

function creditName(author) {
  const a = String(author || '').trim();
  const assumed = a.match(/^No machine-readable author provided\.\s*(.+?)\s+assumed\b/i);
  if (assumed) return assumed[1];
  return a && !/^No machine-readable author/i.test(a) ? a : 'Wikimedia Commons';
}

export function picture(site, key, { prefer = 'official', also = [] } = {}) {
  // Canonical ids and image keys drifted apart twice, in different directions,
  // and an image that is fetched but never found is worse than one that was
  // never fetched — it looks like the fetcher failed.
  //
  //   1. Institutions are namespaced canonically (dk-dtu) while the image
  //      scripts were seeded from the older bare ids (dtu).
  //   2. An Opportunity id carries its intake (…-biotechnology-2027-autumn),
  //      because the same programme in two intakes is two Opportunities. The
  //      photograph is of the department and does not change with the year, so
  //      it is keyed without one.
  //
  // Try the id as given, then with each of those removed, then with both.
  const raw = String(key ?? '');
  const noPrefix = raw.replace(/^[a-z]{2}-/, '');
  const noIntake = (s) => s.replace(/-\d{4}-(?:autumn|spring|summer|winter)$/, '');
  const aliases = site.schools?.get(raw)?.aliases || [];
  const keys = [...new Set([key, ...also, ...aliases, noPrefix, noIntake(raw), noIntake(noPrefix)])].filter(Boolean);
  // A record with no usable address is worse than no record: it renders an
  // <img src="/"> that 404s. Treat it as absent.
  const pick = (store, field) => keys.map((k) => store?.[k]).find((r) => r && r[field]);

  const official = publishable(pick(site.officialImages, 'url'));
  // The editorial gate. A self-hosted Commons photograph is published when a
  // person approved it, or when the scorer that chose it cleared the floor in
  // src/lib/imagery.mjs. Otherwise this returns nothing and the caller falls
  // back to its typographic panel, which is the designed outcome rather than
  // the failure one.
  const commonsPick = pick(site.images, 'src');
  const commons = editoriallyPublishable(commonsPick) ? commonsPick : null;

  // A photograph reviewed and approved as showing the place beats the
  // institution's own share image, which is as often a stock shot of students
  // with laptops as a picture of the campus. The share image still stands in
  // wherever there is no approved photograph.
  if (prefer === 'official' && official && !(commons && isApproved(commonsPick))) {
    return {
      src: official.url,
      external: true,
      alt: `${official.subject || ''}`.trim(),
      credit: {
        text: official.creditText || `Image: ${official.subject || 'the institution'}`,
        url: official.sourcePage,
      },
    };
  }
  if (commons) {
    return {
      src: commons.src,
      external: false,
      alt: commons.description || commons.subject || '',
      credit: {
        /* Commons' placeholder ("No machine-readable author provided. Qz10
           assumed …") is not a credit: the name it assumes is. */
        text: `${creditName(commons.author)} · ${commons.licence || 'Wikimedia Commons'}`,
        url: commons.page,
      },
    };
  }
  if (official) {
    return {
      src: official.url,
      external: true,
      alt: `${official.subject || ''}`.trim(),
      credit: { text: official.creditText || `Image: ${official.subject || 'the institution'}`, url: official.sourcePage },
    };
  }
  return null;
}

/* --- Validation ----------------------------------------------------------- */

export function validate(site) {
  const problems = [];
  const warn = (where, what) => problems.push({ level: 'warn', where, what });
  const err = (where, what) => problems.push({ level: 'error', where, what });

  if (!site.conversion) err('data/ib-conversion.json', 'missing — recognition guidance depends on it');

  for (const c of site.countries) {
    const at = `countries/${c.code}.json`;
    if (!c.name) err(at, 'no name');
    if (!c.summary) warn(at, 'no summary');
    if (!c.institutions.length) warn(at, 'no institutions listed');
    if (!c.sources.length) warn(at, 'no sources — every page should be traceable');
    if (!c.dataAsOf) warn(at, 'no dataAsOf stamp');
    if (!c.deadlines.length) warn(at, 'no deadlines');
    for (const i of c.institutions) {
      if (!i.website) warn(at, `institution "${i.name}" has no website`);
    }
  }

  /* Every Institution, not Denmark's. A Dutch programme with no URL and no
     recorded requirements is exactly as unusable to a student as a Danish one,
     and this loop used to be handed only the Danish ones — under a `dk/` path
     that would have been wrong for the rest anyway. */
  for (const inst of site.institutionCatalogue.all) {
    const at = `schools/${inst.key}.json`;
    if (!inst.about && !inst.school?.summary && !inst.note) warn(at, 'no summary text');
    if (inst.school?.scope === 'listed' && !inst.programmes.length && !inst.school.retiredProgrammes) err(at, 'listed scope has no programmes');
    for (const p of inst.programmes) {
      if (!p.url) warn(at, `programme "${p.name}" has no url`);
      if (!p.requirementsText && !p.entryRequirements && !p.ib && !p.needs?.length && !inst.school?.ib?.text) {
        warn(at, `programme "${p.name}" has no entry requirements at all`);
      }
    }
  }

  // A campus in the wrong country. The geocoder resolves a branch campus by
  // name, and a branch campus is usually named after its parent: DigiPen
  // Singapore came back at DigiPen's headquarters in Redmond, Washington, and
  // ESSEC Asia-Pacific came back at ESSEC's campus in Cergy, France. Both sat
  // undetected while the map clamped them to the edge of the panel. With a
  // coastline underneath, the country the marker lands in is checkable, so it
  // is checked.
  // Five degrees is roughly 550 km. No campus is that far outside its own
  // country by rounding; the two that were had been geocoded to another
  // continent.
  const STRAY_DEGREES = 5;
  for (const c of site.countries) {
    const located = c.institutions.filter((i) => i.coords);
    for (const inst of located) {
      let off = degreesOutside(inst.coords.lat, inst.coords.lon, c.code);

      // Natural Earth at 110m has no polygon for Hong Kong, Singapore,
      // Luxembourg or Malta — and Singapore is where both real errors were, so
      // a check that gives up here would have missed the thing it was written
      // for. Fall back to the company the coordinate keeps: in a country small
      // enough to have no polygon, every campus is within a degree or two of
      // every other, so one that is a hundred degrees away is not a rounding
      // difference. Needs three siblings before it will accuse anybody.
      if (off === null) {
        const siblings = located.filter((x) => x !== inst).map((x) => x.coords);
        if (siblings.length < 3) continue;
        const mid = (get) => {
          const v = siblings.map(get).sort((a, b) => a - b);
          return v[Math.floor(v.length / 2)];
        };
        off = Math.hypot(inst.coords.lon - mid((p) => p.lon), inst.coords.lat - mid((p) => p.lat));
      }

      if (off > STRAY_DEGREES) {
        err(
          `places/${inst.place || '?'}.json`,
          `"${inst.name}" is listed under ${c.name}, but ${inst.coords.lat}, ${inst.coords.lon} is ` +
            `${Math.round(off)}° away — a branch campus geocoded to its parent?`
        );
      }
    }
  }

  // Photographs are looked up in one flat namespace, and two things share the
  // prefix `au-`: Aarhus University's programmes and every institution in
  // Australia. Nothing collides today — Aarhus keys are subject names and the
  // Australian ones are city names — but if one ever did, the failure is silent
  // and it is a photograph of the wrong continent on a programme page.
  //
  // The prefix stripped here is whatever Destination the record belongs to, the
  // same normalisation `picture()` does, rather than `dk-`. Checking only the
  // Danish keys left the Dutch ones — `utwente`, `maastricht` — free to collide
  // with a country profile's institution key and nothing would have said so.
  const imageKeys = new Map();
  for (const inst of site.institutionCatalogue.all.filter(i => i.school?.programmes.some(p => p.intakes?.length))) {
    imageKeys.set(inst.id.replace(/^[a-z]{2}-/, ''), inst.id);
    for (const p of inst.programmes) {
      const key = p.id.replace(/^[a-z]{2}-/, '').replace(/-\d{4}-(?:autumn|spring|summer|winter)$/, '');
      imageKeys.set(key, `programme "${p.name}"`);
    }
  }
  for (const c of site.countries) {
    for (const i of c.institutions) {
      const owner = imageKeys.get(i.key);
      if (owner) {
        err(
          `countries/${c.code}.json`,
          `institution "${i.name}" resolves to image key "${i.key}", which already belongs to ${owner} — ` +
            'one of them would show the other\'s photograph'
        );
      }
    }
  }

  return problems;
}
