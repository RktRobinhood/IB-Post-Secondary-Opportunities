/** Minimum student-facing facts for a country described in depth.
 * Optional sector and route data distinguish researched destinations from outlines.
 * All checks use the same school/country records and their source links. */

import { serves } from './jurisdictions.mjs';

/* --- Small helpers -------------------------------------------------------- */

/**
 * The registrable part of a host, for "is this source from the institution
 * itself" comparisons.
 *
 * A generic two-label rule reads `ox.ac.uk` out of `www.ox.ac.uk` and then
 * decides that `cam.ac.uk` is the same organisation, which would let one UK
 * source vouch for every UK university. Academic and government spaces are
 * exactly where our sources live, so the compound suffixes are spelled out
 * rather than guessed at.
 */
const COMPOUND_SUFFIXES = new Set([
  'ac.uk', 'gov.uk', 'org.uk', 'co.uk', 'sch.uk',
  'ac.at', 'ac.be', 'ac.cn', 'ac.cy', 'ac.il', 'ac.in', 'ac.jp', 'ac.kr', 'ac.nz', 'ac.th', 'ac.za',
  'edu.au', 'edu.cn', 'edu.hk', 'edu.mt', 'edu.pl', 'edu.sg', 'edu.tr', 'edu.lb',
  'co.jp', 'co.nz', 'com.au', 'com.cn', 'com.hk', 'com.sg', 'org.au', 'net.au',
  'gov.au', 'gov.cn', 'gov.hk', 'gov.sg', 'govt.nz',
  'go.jp', 'go.kr', 'or.kr', 're.kr',
]);

export function registrableDomain(urlish) {
  if (!urlish) return null;
  let host;
  try {
    host = new URL(String(urlish)).hostname.toLowerCase();
  } catch {
    return null;
  }
  host = host.replace(/^www\./, '');
  const labels = host.split('.');
  if (labels.length <= 2) return host;
  const lastTwo = labels.slice(-2).join('.');
  if (COMPOUND_SUFFIXES.has(lastTwo)) return labels.slice(-3).join('.');
  return lastTwo;
}

/**
 * A date a student can act on.
 *
 * ISO only, deliberately. `Date.parse` will happily read "15 January 2027", and
 * accepting that would have let the floor pass on a field that also held
 * "Mid-January 2027", "22 June to 5 September" and a 200-word description of an
 * admissions campaign — all of which parse into some day or other, none of
 * which is a date a student can act on. A floor that accepts prose is not one.
 */
export function isRealDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim()) && !Number.isNaN(Date.parse(value));
}

/**
 * The states a date field may be in when there is no date.
 *
 * "No central deadline" is a fact about a country, not a missing value, and the
 * two must not look alike — one is researched and the other is not. Writing the
 * sentence into the `date` field made them identical to every consumer, which
 * is how `date: "No central deadline"` ended up being sorted, parsed and
 * counted as though it were a day in the calendar.
 */
export const DATE_STATES = {
  'not-published': 'Date not published',
  'no-central-deadline': 'No central deadline',
  'varies-by-institution': 'Set by each institution',
  'rolling': 'Considered as they arrive',
  'not-yet-announced': 'Not yet announced for this intake',
  /* Added after the migration, not before it. The first five were written from
     the shapes the data already had; this one exists because the University of
     Tokyo's PEAK programme has stopped recruiting, and every one of the five
     was wrong for it. "No central deadline" was the least wrong and still reads
     as an invitation to apply late, which is the exact opposite of the truth.
     A state that quietly encourages a student to try is worse than no state. */
  'withdrawn': 'No longer offered',
};

export function dateStateLabel(state) {
  return DATE_STATES[state] || null;
}

/* --- The floor ------------------------------------------------------------ */

/**
 * Each check answers one question a student would be entitled to ask, and
 * fails with the work still outstanding rather than with a score.
 */
export const FLOOR_CHECKS = [
  {
    id: 'sector',
    title: 'The system is described in its own words',
    why:
      'Category names do not translate. Telling a Danish student about "colleges", or a French student about ' +
      '"professional bachelors", describes nothing they can recognise — and the non-university routes, which most ' +
      'IB students are never told exist, only get named here.',
    test(ctx) {
      if (!ctx.canonical) return { ok: false, detail: 'no country record' };
      const routes = ctx.canonical.sectorLandscape?.routes?.length || 0;
      if (!routes) return { ok: false, detail: 'country record has no sectorLandscape' };
      return { ok: true, detail: `${routes} sector routes named` };
    },
  },
  {
    id: 'evidence',
    title: 'Student facts have source links and checked dates',
    why:
      'Students need the official page behind a claim and the date it was read. A source without a checked date ' +
      'cannot tell them how current the entry rules, fees or application dates are.',
    test(ctx) {
      if (!ctx.evidence.length) return { ok: false, detail: 'no source links recorded' };
      const undated = ctx.evidence.filter(e => !isRealDate(e.retrievedAt)).length;
      if (undated) return { ok: false, detail: undated + ' sources have no checked date' };
      return { ok: true, detail: ctx.evidence.length + ' dated sources' };
    },
  },
  {
    id: 'route',
    title: 'Every institution sits on a named Application Route',
    why:
      'A student looking at one province and a student looking at another are on two different application paths ' +
      'with different dates. One portal sentence for a whole country makes them read a paragraph and work that out.',
    test(ctx) {
      if (!ctx.routes.length) return { ok: false, detail: 'no Application Route recorded' };
      if (!ctx.institutions.length) return { ok: false, detail: 'no institutions listed' };
      const uncovered = ctx.institutions.filter((i) => !ctx.routeFor(i)).map((i) => i.shortName || i.name);
      if (uncovered.length) {
        return {
          ok: false,
          detail: `${uncovered.length} of ${ctx.institutions.length} institutions are on no route: ${sample(uncovered)}`,
        };
      }
      return { ok: true, detail: `${ctx.routes.length} routes covering ${ctx.institutions.length} institutions` };
    },
  },
  {
    id: 'dates',
    title: 'Every date is a date, or says why it is not',
    why:
      'A blank cell reads as a layout fault. A sentence in a date field is worse: it looks like data to everything ' +
      'downstream and is prose to the one reader who matters.',
    test(ctx) {
      if (!ctx.deadlines.length) return { ok: false, detail: 'no deadlines recorded' };
      const bad = ctx.deadlines.filter((d) => !isRealDate(d.date) && !DATE_STATES[d.dateState]);
      if (bad.length) {
        return {
          ok: false,
          detail: `${bad.length} of ${ctx.deadlines.length} deadlines carry neither an ISO date nor a declared state`,
        };
      }
      return { ok: true, detail: `${ctx.deadlines.length} deadlines, each dated or declared` };
    },
  },
  {
    id: 'institutions',
    title: 'Every institution listed is backed by a source at its own domain',
    why:
      'Listing fourteen institutions and citing five of them means nine were inferred. The reader cannot tell which ' +
      'nine, so the five do not help them.',
    test(ctx) {
      if (!ctx.institutions.length) return { ok: false, detail: 'no institutions listed' };
      const unbacked = ctx.institutions.filter((i) => !ctx.sourcedAtOwnDomain(i));
      if (unbacked.length) {
        return {
          ok: false,
          detail: `${unbacked.length} of ${ctx.institutions.length} cite no source of their own: ${sample(unbacked.map((i) => i.shortName || i.name))}`,
        };
      }
      return { ok: true, detail: `all ${ctx.institutions.length} institutions cite their own publisher` };
    },
  },
];

function sample(names) {
  return names.slice(0, 4).join(', ') + (names.length > 4 ? `, and ${names.length - 4} more` : '');
}

/* --- Assessment ----------------------------------------------------------- */

/**
 * Measure one Destination against the floor.
 *
 * `country` is the profile record from `data/countries`; `graph` is the
 * canonical entity graph. Both are needed because a Destination is currently
 * half-migrated by design — the institution list still lives on the profile,
 * the routes and the evidence live in the graph.
 */
export function assessFloor(country, graph) {
  const code = country.code;
  const canonical = graph?.destinations?.get(code) || null;
  const datedSources = [];
  const collect = (value, inherited = null) => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(x => collect(x, inherited)); return; }
    const checked = value.retrieved || value.dataAsOf || inherited;
    for (const source of Array.isArray(value.sources) ? value.sources : []) if (source?.url) datedSources.push({ sourceUrl: source.url, retrievedAt: source.retrieved || checked });
    for (const [key, child] of Object.entries(value)) if (!['sources', 'ibRecognitionStatement'].includes(key)) collect(child, checked);
  };
  collect(country);
  const evidence = [...new Map(datedSources.map(e => [e.sourceUrl + '|' + e.retrievedAt, e])).values()];
  const routes = [...(graph?.applicationRoutes?.values() || [])].filter(r => r.destination === code);
  const institutions = Array.isArray(country.institutions) ? country.institutions : [];
  const ownDeadlines = country.application?.deadlines || [];
  const deadlines = ownDeadlines.length ? ownDeadlines : routes.flatMap(r => (r.milestones || []).filter(m => m.date || m.dateState));

  const sourceDomains = new Set(
    [
      ...(country.sources || []).map((s) => registrableDomain(s?.url)),
      ...evidence.map((e) => registrableDomain(e.sourceUrl)),
      ...evidence.map((e) => registrableDomain(e.sourcePage)),
    ].filter(Boolean)
  );

  const ctx = {
    country,
    canonical,
    evidence,
    routes,
    institutions,
    deadlines,

    /**
     * Which Application Route an institution is on.
     *
     * Three shapes, in order of specificity, and no country names anywhere:
     * a route naming the institution outright; a route scoped to an Application
     * Jurisdiction, matching an institution that declares the same one; and a
     * route scoped to neither, which covers the whole Destination. The last is
     * the right shape for a centralised system and the wrong one for a federal
     * one, which is precisely what check `route` is here to expose.
     */
    routeFor(inst) {
      /* `appliesTo` deliberately does NOT appear here.
         It was tried and it is a dead path: `scripts/validate.mjs` requires
         every entry to be an Opportunity id, so a route can never name an
         institution in it without failing the build. Matching against
         institution ids here made the most precise binding look available when
         it was not, which is worse than not offering it. */
      if (inst.jurisdiction) {
        const byJurisdiction = routes.find((r) => serves(r, inst.jurisdiction));
        if (byJurisdiction) return byJurisdiction;
      }
      return routes.find((r) => !r.jurisdiction && !(r.appliesTo || []).length) || null;
    },

    sourcedAtOwnDomain(inst) {
      const own = registrableDomain(inst.website) || registrableDomain(inst.admissionsUrl);
      if (!own) return false;
      if (sourceDomains.has(own)) return true;
      // The institution's own admissions or IB page is itself a citation of it.
      const cited = [inst.admissionsUrl, inst.ibPageUrl].map(registrableDomain).filter(Boolean);
      return cited.includes(own);
    },
  };

  const checks = FLOOR_CHECKS.map((c) => ({ id: c.id, title: c.title, why: c.why, ...c.test(ctx) }));
  const missing = checks.filter((c) => !c.ok);

  return {
    code,
    name: country.name,
    /* An optional sector landscape is the detailed country-level account. */
    published: Boolean(canonical?.sectorLandscape?.routes?.length),
    met: missing.length === 0,
    checks,
    missing,
  };
}

export function assessAll(countries, graph) {
  return countries.map((c) => assessFloor(c, graph)).sort((a, b) => a.missing.length - b.missing.length);
}
