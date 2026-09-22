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
  const [countries, legacyDk, topics, conversion, images, officialImages, glossary, faq, canonical, ibSubjects] =
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

  return {
    countries,
    europe: countries.filter((c) => c.scope === 'europe'),
    world: countries.filter((c) => c.scope === 'worldwide'),
    dkInstitutions,
    programmes,
    graph: canonical.graph,
    ibSubjects: ibSubjects.subjects || [],
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

/* --- Picture resolution --------------------------------------------------- */

/**
 * Which picture to use for a thing, in order of preference:
 *   1. the institution's own Open Graph share image, linked from its server —
 *      that is the picture it publishes of itself for exactly this purpose;
 *   2. a freely licensed Wikimedia Commons photograph we host ourselves;
 *   3. nothing, and the template falls back to a typographic panel.
 */
export function picture(site, key, { prefer = 'official', also = [] } = {}) {
  // Canonical institution ids are namespaced (dk-dtu) while the image scripts
  // were seeded from the older bare ids (dtu). Try both rather than re-fetching
  // several hundred photographs to rename them.
  const keys = [key, ...also, String(key ?? '').replace(/^[a-z]{2}-/, '')].filter(Boolean);
  // A record with no usable address is worse than no record: it renders an
  // <img src="/"> that 404s. Treat it as absent.
  const pick = (store, field) => keys.map((k) => store?.[k]).find((r) => r && r[field]);

  const official = pick(site.officialImages, 'url');
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
