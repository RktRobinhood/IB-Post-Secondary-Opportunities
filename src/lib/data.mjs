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
import { destinationFacet, loadCanonical } from './canonical.mjs';
import { reconcileDestinations } from './catalogue.mjs';
import { summarise as summariseEvidenceRecords } from './evidence-policy.mjs';
import { publishable as editoriallyPublishable } from './imagery.mjs';

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
};

/* --- Load ----------------------------------------------------------------- */

export async function load() {
  const [countries, legacyDk, topics, conversion, images, officialImages, glossary, faq, canonical, ibSubjects, preparation, config, recognitionSchemes] =
    await Promise.all([
      readDir(path.join(DATA, 'countries')),
      readDir(path.join(DATA, 'dk')),
      readDir(path.join(DATA, 'topics')),
      readJson(path.join(DATA, 'ib-conversion.json')),
      readJson(path.join(DATA, 'images.json'), {}),
      readJson(path.join(DATA, 'official-images.json'), {}),
      readJson(path.join(DATA, 'glossary.json'), { terms: [] }),
      readJson(path.join(DATA, 'faq.json'), { questions: [] }),
      loadCanonical(),
      readJson(path.join(DATA, 'ib-subjects.json'), { subjects: [] }),
      readJson(path.join(DATA, 'preparation.json')),
      readJson(path.join(DATA, 'site-config.json')),
      // Recognition Schemes: one per Destination that publishes its entry rules
      // in its own vocabulary. A Destination with none is the normal case.
      readDir(path.join(DATA, 'recognition')),
    ]);

  /* Denmark was the pilot: institution pages render from the canonical entity
     graph. The research files under data/dk stay as the input the migration
     reads and are only used directly if the migration has not been run yet —
     in which case every record in them is Danish by construction, and has to be
     told so, because that shape predates the model having a Destination at all.
     `danishName` is the same story: it is what the field is called in the
     un-migrated files, and `localName` is what the canonical record calls it. */
  const institutions = canonical.institutions.length
    ? canonical.institutions
    : legacyDk.map((inst) => ({
        ...inst,
        localName: inst.localName || inst.danishName || null,
        destination: destinationFacet(canonical.graph.destinations.get('dk'), 'dk'),
      }));

  for (const c of countries) {
    c.flag = FLAGS[c.code] || '';
    c.scope = c.scope === 'worldwide' ? 'worldwide' : 'europe';
    c.region = c.region || (c.scope === 'worldwide' ? 'Other' : 'Western Europe');
    c.href = `/destinations/${c.code}/`;
    c.institutions = asArray(c.institutions).map((i) => ({
      ...i,
      key: `${c.code}-${slugify(i.shortName || i.name)}`,
    }));
    c.whyConsider = asArray(c.whyConsider);
    c.watchOuts = asArray(c.watchOuts);
    c.funding = asArray(c.funding);
    c.sources = asArray(c.sources);
    c.deadlines = asArray(c.application?.deadlines);

    // Join institutions to their Place records so any page can draw a map.
    c.places = [];
    const seenPlace = new Set();
    for (const inst of c.institutions) {
      const place = inst.place ? canonical.graph.places.get(inst.place) : null;
      inst.coords = place?.coordinates || null;
      inst.coordinatePrecision = place?.coordinatePrecision || null;
      if (place && !seenPlace.has(place.id)) {
        seenPlace.add(place.id);
        c.places.push(place);
      }
    }

    c.researchDepth = researchDepth(c, canonical.graph);
  }

  for (const inst of institutions) {
    inst.href = `/universities/${inst.id}/`;
    inst.programmes = asArray(inst.programmes).map((p) => ({
      ...p,
      id: p.id || `${inst.id}-${slugify(p.name)}`,
      institutionId: inst.id,
      institutionName: inst.shortName || inst.name,
      destination: p.destination || inst.destination || null,
      href: `/programmes/${p.id || `${inst.id}-${slugify(p.name)}`}/`,
    }));
  }

  const programmes = institutions.flatMap((i) => i.programmes);

  /* A migrated Destination and an unmigrated country profile describe the same
     thing in different shapes. This projects the canonical form into the
     profile shape so comparison, indexes and anything else that iterates
     destinations sees one consistent list — otherwise Denmark, the most
     complete record in the dataset, would be missing from every comparison. */
  const migrated = [...canonical.graph.destinations.values()].map((d) => ({
    code: d.id,
    name: d.name,
    articleName: d.articleName || null,
    flag: FLAGS[d.iso2 || d.id] || '',
    scope: d.scope || 'europe',
    region: d.region || 'Other',
    capital: d.capital || null,
    currency: d.currency || null,
    eu: d.membership?.eu ?? null,
    eea: d.membership?.eea ?? null,
    membership: d.membership || {},
    tagline: d.tagline || null,
    summary: d.summary || null,
    whyConsider: asArray(d.whyConsider),
    watchOuts: asArray(d.watchOuts),
    ibRecognition: d.ibRecognition || null,
    language: d.language || null,
    costs: {
      tuitionEuEea: d.feeContext?.find((f) => f.applicantGroup === 'eu-eea-ch')
        ? { value: d.feeContext.find((f) => f.applicantGroup === 'eu-eea-ch').summary, year: d.feeContext.find((f) => f.applicantGroup === 'eu-eea-ch').priceYear }
        : null,
      tuitionNonEu: d.feeContext?.find((f) => f.applicantGroup === 'non-eu')
        ? { value: d.feeContext.find((f) => f.applicantGroup === 'non-eu').typicalRange || d.feeContext.find((f) => f.applicantGroup === 'non-eu').summary, year: d.feeContext.find((f) => f.applicantGroup === 'non-eu').priceYear }
        : null,
      livingCostMonthly: d.livingContext?.livingCostMonthly
        ? {
            value: `${d.livingContext.livingCostMonthly.amount.toLocaleString('en-GB')} ${d.livingContext.livingCostMonthly.currency} per ${d.livingContext.livingCostMonthly.period}`,
            year: d.livingContext.livingCostYear || null,
          }
        : null,
    },
    residency: d.livingContext?.residency || null,
    housing: d.livingContext?.housing || null,
    healthcare: d.livingContext?.healthcare || null,
    workRights: d.livingContext?.workRights || null,
    funding: asArray(d.livingContext?.funding),
    institutions: [],
    places: [],
    deadlines: [],
    sources: [],
    dataAsOf: d.meta?.dataAsOf || null,
    targetIntake: d.targetIntake || null,
    artDirection: d.artDirection || null,
    // Which Destinations have a hand-written section instead of a generated
    // page is one fact, and it used to be written here and again wherever else
    // it was needed. canonical.mjs holds it now, so an institution page and its
    // Destination's own page cannot disagree about where the Destination lives.
    href: destinationFacet(d).href,
    migrated: true,
  }));

  /* Destinations for comparison and indexes: every Destination exactly once.
     This used to be `[...migrated, ...countries]`, which gave 50 entries for
     36 codes and put two disagreeing Australias in the comparison table. The
     precedence rule lives in catalogue.mjs so no caller has to re-decide it. */
  const allDestinations = reconcileDestinations(migrated, countries);

  /* Which Destinations the Opportunity records actually cover.
   *
   * Every surface built on Opportunities used to assert "Denmark" in its
   * heading, its eyebrow, its breadcrumb and a navigation chip, because for a
   * long time that was true. The day the first Dutch Opportunities landed it
   * stopped being true in four places at once, and a page that says "every
   * English-taught degree in Denmark" over a list containing Delft is worse
   * than one that says nothing — a student takes the heading at its word and
   * stops looking.
   *
   * Derived, so it cannot be wrong again: add a Destination's Opportunities and
   * the copy follows. `scripts/test-credentials.mjs` already forbids code that
   * branches on a country; this is the same rule applied to prose. */
  const scopeCodes = [...new Set([...canonical.graph.opportunities.values()].map((o) => o.destination))].filter(Boolean);
  const opportunityScope = {
    ...scopeWording(scopeCodes.map((code) => sentenceNameFor(allDestinations, code))),
    codes: scopeCodes,
    complete: scopeCodes.length >= allDestinations.length,
  };

  /* The same question asked of the Institutions rather than the Opportunities,
     because they are not the same set and the page that got this wrong was the
     one about Institutions. An Institution with no Opportunities recorded yet
     is still in the catalogue and still has to be placed in a country. */
  const catalogue = institutionCatalogue(institutions, allDestinations);

  return {
    countries,
    destinations: allDestinations,
    opportunityScope,
    europe: countries.filter((c) => c.scope === 'europe'),
    world: countries.filter((c) => c.scope === 'worldwide'),
    institutionCatalogue: catalogue,
    /* Genuinely Denmark-only, and named for what it now holds. The Denmark hub
       and the About page's "Danish institutions" count both promise Danish
       Institutions in as many words; before this they were handed all thirteen,
       five of which are Dutch. Everything that wanted *every* Institution —
       the institution index, the Programme explorer, the build's page loop —
       asks the catalogue instead. */
    dkInstitutions: catalogue.in('dk'),
    programmes,
    graph: canonical.graph,
    ibSubjects: ibSubjects.subjects || [],
    recognitionSchemes,
    preparation,
    config,
    evidenceSummary: summariseEvidence(canonical.graph),
    fromCanonical: canonical.institutions.length > 0,
    topics: Object.fromEntries(topics.map((t) => [slugify(t.title || 'topic'), t])),
    topicList: topics,
    conversion,
    images,
    officialImages,
    glossary,
    faq,
  };
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
function institutionCatalogue(institutions, destinations) {
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
      programmes: list.reduce((n, i) => n + (i.programmes?.length || 0), 0),
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

function degreesOutside(lat, lon, code) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const country = basemap().countries.find((c) => c.id === code);
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
  const deadlines = c.deadlines.length;
  // A date a student can act on, as opposed to null (we could not verify it) or
  // prose like "No central deadline" (true, and not a date).
  const dated = c.deadlines.filter((d) => typeof d.date === 'string' && !Number.isNaN(Date.parse(d.date))).length;
  const undated = c.deadlines.filter((d) => d.date == null).length;

  const canonical = graph?.destinations?.get(c.code) || null;
  const routes = [...(graph?.applicationRoutes?.values() || [])].filter((r) => r.destination === c.code).length;
  // Evidence attaches to whatever it establishes, which is usually not the
  // country itself: the UK's one record supports `gb-ucas-2027`, its
  // Application Route. So anything namespaced to the Destination counts.
  const owned = (id) => id === c.code || String(id ?? '').startsWith(`${c.code}-`);
  const evidence = [...(graph?.evidence?.values() || [])].filter((e) =>
    (e.supports || []).some((s) => owned(s.entity))
  ).length;

  const tier = canonical?.sectorLandscape && evidence && routes
    ? 'researched'
    : institutions && sources >= institutions
      ? 'profiled'
      : 'outline';

  return { tier, institutions, sources, deadlines, dated, undated, evidence, routes };
}

/** The wording for each tier. Descriptive, not a score. */
export const RESEARCH_DEPTH = {
  researched: {
    label: 'Researched in depth',
    summary: 'Its sector, application route and deadlines are recorded as evidence, each with a source and a date.',
  },
  profiled: {
    label: 'Profile with sources',
    summary: 'Every institution listed is backed by at least one source, but the claims are inline URLs rather than evidence records, so nothing here is tracked for freshness.',
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
  const keys = [...new Set([key, ...also, noPrefix, noIntake(raw), noIntake(noPrefix)])].filter(Boolean);
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

  if (prefer === 'official' && official) {
    return {
      src: official.url,
      external: true,
      alt: `${official.subject || ''}`.trim(),
      credit: {
        text: `Image: ${official.subject || 'the institution'}`,
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
        text: `${commons.author || 'Unknown'} · ${commons.licence || 'Wikimedia Commons'}`,
        url: commons.page,
      },
    };
  }
  if (official) {
    return {
      src: official.url,
      external: true,
      alt: `${official.subject || ''}`.trim(),
      credit: { text: `Image: ${official.subject || 'the institution'}`, url: official.sourcePage },
    };
  }
  return null;
}

/* --- Validation ----------------------------------------------------------- */

export function validate(site) {
  const problems = [];
  const warn = (where, what) => problems.push({ level: 'warn', where, what });
  const err = (where, what) => problems.push({ level: 'error', where, what });

  if (!site.conversion) err('data/ib-conversion.json', 'missing — the Denmark section depends on it');

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
    const at = `institutions/${inst.id}.json`;
    if (!inst.about) warn(at, 'no about text');
    if (!inst.programmes.length) warn(at, 'no programmes — is this intentional?');
    for (const p of inst.programmes) {
      if (!p.url) warn(at, `programme "${p.name}" has no url`);
      if (!p.requirementsText && !p.entryRequirements) {
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
  for (const inst of site.institutionCatalogue.all) {
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
