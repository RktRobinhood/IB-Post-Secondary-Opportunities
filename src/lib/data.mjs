/**
 * Loads everything in /data and normalises it into the shape the templates want.
 *
 * The JSON files are written by hand and by research agents, so they are
 * forgiving by design: missing fields are normal, and nothing here throws on a
 * gap. `validate()` reports problems instead, and the build prints them.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { slugify } from './html.mjs';
import { loadCanonical } from './canonical.mjs';

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
  const [countries, legacyDk, topics, conversion, images, officialImages, glossary, faq, canonical, ibSubjects, preparation, config] =
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
    ]);

  // Denmark is the pilot: its pages render from the canonical entity graph.
  // The research files under data/dk stay as the input the migration reads, and
  // are only used directly if the migration has not been run yet.
  const dkInstitutions = canonical.institutions.length ? canonical.institutions : legacyDk;

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

  for (const inst of dkInstitutions) {
    inst.href = `/universities/${inst.id}/`;
    inst.programmes = asArray(inst.programmes).map((p) => ({
      ...p,
      id: p.id || `${inst.id}-${slugify(p.name)}`,
      institutionId: inst.id,
      institutionName: inst.shortName || inst.name,
      href: `/programmes/${p.id || `${inst.id}-${slugify(p.name)}`}/`,
    }));
  }

  const programmes = dkInstitutions.flatMap((i) => i.programmes);

  /* A migrated Destination and an unmigrated country profile describe the same
     thing in different shapes. This projects the canonical form into the
     profile shape so comparison, indexes and anything else that iterates
     destinations sees one consistent list — otherwise Denmark, the most
     complete record in the dataset, would be missing from every comparison. */
  const migrated = [...canonical.graph.destinations.values()].map((d) => ({
    code: d.id,
    name: d.name,
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
    // Denmark has its own section rather than a generated destination page.
    href: d.id === 'dk' ? '/denmark/' : `/destinations/${d.id}/`,
    migrated: true,
  }));

  /* Destinations for comparison and indexes: migrated first, then profiles. */
  const allDestinations = [...migrated, ...countries];

  return {
    countries,
    destinations: allDestinations,
    europe: countries.filter((c) => c.scope === 'europe'),
    world: countries.filter((c) => c.scope === 'worldwide'),
    dkInstitutions,
    programmes,
    graph: canonical.graph,
    ibSubjects: ibSubjects.subjects || [],
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

/** The state of the evidence, reported on every build and on the trust page. */
function summariseEvidence(graph) {
  const out = {
    verified: 0, needsReview: 0, stale: 0, superseded: 0, unavailable: 0, conflicting: 0, total: 0,
    // Source checks are a SECOND axis, not a rung on the same ladder. A record
    // can be unreviewed by a person and still have had its page re-read and the
    // supporting sentence quoted onto it. Reporting them as one number would
    // hide which of the two a reader is actually getting.
    sourceChecked: 0, sourceSupported: 0, sourcePartial: 0, sourceUnsupported: 0, lastCheckedAt: null,
  };
  const today = new Date().toISOString().slice(0, 10);
  for (const e of graph?.evidence?.values() || []) {
    out.total++;
    const sc = e.sourceCheck;
    if (sc?.outcome) {
      out.sourceChecked++;
      if (sc.outcome === 'supported') out.sourceSupported++;
      else if (sc.outcome === 'partial') out.sourcePartial++;
      else out.sourceUnsupported++;
      if (sc.checkedAt && (!out.lastCheckedAt || sc.checkedAt > out.lastCheckedAt)) out.lastCheckedAt = sc.checkedAt;
    }
    if ((e.conflictsWith || []).length) out.conflicting++;
    else if (e.verificationState === 'unavailable') out.unavailable++;
    else if (e.verificationState === 'superseded') out.superseded++;
    else if (e.meta?.reviewBy && e.meta.reviewBy < today) out.stale++;
    else if (e.verificationState === 'needs-review') out.needsReview++;
    else out.verified++;
  }
  return out;
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

/** An official pick we are willing to hot-link, or null. */
function publishable(official) {
  if (!official) return null;
  // No content-length is not a reason to reject — plenty of CDNs omit it — but
  // a known size over the ceiling is.
  if (typeof official.bytes === 'number' && official.bytes > OFFICIAL_MAX_BYTES) return null;
  return official;
}

export function picture(site, key, { prefer = 'official', also = [] } = {}) {
  // Canonical institution ids are namespaced (dk-dtu) while the image scripts
  // were seeded from the older bare ids (dtu). Try both rather than re-fetching
  // several hundred photographs to rename them.
  const keys = [key, ...also, String(key ?? '').replace(/^[a-z]{2}-/, '')].filter(Boolean);
  // A record with no usable address is worse than no record: it renders an
  // <img src="/"> that 404s. Treat it as absent.
  const pick = (store, field) => keys.map((k) => store?.[k]).find((r) => r && r[field]);

  const official = publishable(pick(site.officialImages, 'url'));
  const commons = pick(site.images, 'src');

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

  for (const inst of site.dkInstitutions) {
    const at = `dk/${inst.id}.json`;
    if (!inst.about) warn(at, 'no about text');
    if (!inst.programmes.length) warn(at, 'no programmes — is this intentional?');
    for (const p of inst.programmes) {
      if (!p.url) warn(at, `programme "${p.name}" has no url`);
      if (!p.requirementsText && !p.entryRequirements) {
        warn(at, `programme "${p.name}" has no entry requirements at all`);
      }
    }
  }

  return problems;
}
