/**
 * One shape for every dated thing on the site.
 *
 * The `date` field on a country deadline was doing five jobs at once. Across 35
 * records it held a day ("15 January 2027"), a range ("20 July to 6 August
 * 2026"), a list ("15 October 2026, 2 February 2027, 15 April 2027"), a day
 * with a time and a zone ("13 January 2027, 18:00 UK time"), and in 119 of 177
 * cases a paragraph describing a whole admissions campaign. Twenty-eight were
 * null. One said "No central deadline", which is a researched fact about a
 * country and looked, to every consumer, exactly like a missing value.
 *
 * Nothing could be filtered, sorted, counted or put on a calendar, which is why
 * `/timeline/` held a hand-typed array of eighteen events instead of reading
 * the data — and why a hand-typed array could drift from the country pages with
 * nothing to catch it (#13).
 *
 * The model here is the one the Application Route schema already used for its
 * milestones, lifted out so both shapes produce it:
 *
 *   - **A date is a date.** ISO, or absent.
 *   - **An absence says why.** `dateState` distinguishes "we could not find it"
 *     from "there is no central deadline" — one is unfinished research and the
 *     other is the finding.
 *   - **A period has two ends.** `date` and `endDate`, not a sentence.
 *   - **A time of day is kept as published.** 12:00 and 23:59 are very
 *     different promises, and neither is ever silently converted to a zone the
 *     student does not live in.
 *   - **Several events are several events.** A campaign with a registration
 *     window, an exam and a result day is three entries, not one paragraph.
 *
 * Nothing in this file knows the name of a country, a portal or a university.
 * Every difference between two Destinations is a difference in their records.
 */
import { DATE_STATES, dateStateLabel, isRealDate } from './publication-floor.mjs';
import { canonicalOnlyCodes } from './catalogue.mjs';

export { DATE_STATES, dateStateLabel };

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/* --- Reading a date ------------------------------------------------------- */

/** ISO day → the parts we format from. Returns null for anything else. */
function parts(iso) {
  if (typeof iso !== 'string') return null;
  const m = iso.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const [, y, mo, d] = m;
  const month = Number(mo);
  if (month < 1 || month > 12) return null;
  return { year: Number(y), month, day: Number(d) };
}

/**
 * How a dated event reads to a student.
 *
 * Ranges collapse the parts they share — "20 July to 6 August 2026" rather than
 * "20 July 2026 to 6 August 2026" — because the repetition is what makes a
 * table of dates hard to scan.
 */
export function formatWhen(event) {
  const from = parts(event.date);
  const to = parts(event.endDate);

  if (!from) return dateStateLabel(event.dateState) || dateStateLabel('not-published');

  const day = (p) => `${p.day} ${MONTHS[p.month - 1]}`;
  let when;
  if (to && (to.year !== from.year || to.month !== from.month || to.day !== from.day)) {
    when =
      to.year !== from.year
        ? `${day(from)} ${from.year} to ${day(to)} ${to.year}`
        : `${day(from)} to ${day(to)} ${to.year}`;
  } else {
    when = `${day(from)} ${from.year}`;
  }

  if (event.timeOfDay) when += `, ${event.timeOfDay}`;
  if (event.timeZone) when += ` ${event.timeZone}`;
  return when;
}

/** For sorting and for "is this still ahead of me". Absent dates sort last. */
export function sortKey(event) {
  return parts(event.date) ? event.date : '9999-99-99';
}

/* --- What a missed date actually costs ------------------------------------ */

/**
 * `consequence` is the field that stops us frightening students unnecessarily
 * and reassuring them wrongly. UCAS publishes an *equal consideration* date,
 * not a deadline: an application in by then is guaranteed to be read, one after
 * it may still be read against whatever places remain. Rendering both as
 * "Deadline" loses the only distinction that matters at that point in the year.
 */
export const CONSEQUENCE = {
  hard: { label: 'Hard deadline', short: 'Closes', note: 'After this the door closes.' },
  'equal-consideration': {
    label: 'Equal consideration',
    short: 'Guaranteed a read',
    note: 'Applications in by this date are guaranteed to be considered. Later ones may still be read, at the institution’s discretion, against whatever places remain.',
  },
  priority: { label: 'Priority', short: 'Priority', note: 'Later applications are considered after these.' },
  rolling: { label: 'Rolling', short: 'Rolling', note: 'Considered as they arrive, until places run out.' },
  indicative: { label: 'Indicative', short: 'Around', note: 'A guide to when this happens, not a published deadline.' },
  personal: { label: 'Your own plan', short: 'Plan for', note: 'Not published by anyone — a date worth setting yourself.' },
};

export function consequenceOf(event) {
  return CONSEQUENCE[event.consequence] || CONSEQUENCE.indicative;
}

/* --- How well an IB session date is actually established ------------------ */

/**
 * The honesty field on `data/ib-calendar.json`, and the reason it is not
 * `dateState`.
 *
 * `2027-07-06` was written into 41 files and cited in none. It is held on the
 * IB publishing on 6 July in 2024, 2025 and 2026 — an inference — and no field
 * on any of those 41 records could say so, so the most-repeated date on the
 * site read exactly like the ones somebody had read off an official page.
 *
 * `dateState` was the obvious place to put it and is the wrong one. All six of
 * its values answer "why is there no date here", and `formatWhen` above drops
 * the state the moment a date exists — so `dateState: 'not-yet-announced'`
 * beside a real date would have rendered as a plain, confident 6 July and the
 * inference would have been invisible in the one place it had to be visible.
 * The two are complementary, not competing: `dateState` says why a date is
 * missing, `basis` says what a date that is present is worth.
 *
 * `provisional` is what carries this to the page. It already means "carried
 * from a previous cycle because the authority has not published this one",
 * which is this claim exactly, and `/timeline/` already explains it. So an
 * inferred date is marked provisional everywhere it appears, and the migration
 * sets that rather than leaving it to whoever writes the next record.
 */
export const IB_DATE_BASIS = {
  published: 'Published by the IB and read',
  'inferred-from-precedent': 'Inferred from earlier sessions — not published anywhere we can read',
  'not-established': 'Looked for and not found',
};

export function ibDateBasisLabel(basis) {
  return IB_DATE_BASIS[basis] || null;
}

/**
 * Does this label claim that the IB released results, as opposed to saying
 * something about them?
 *
 * The distinction is worth a shared constant because both the migration and
 * the guard need it and they must not drift: seven records on the site name IB
 * results and belong to somebody else's calendar — NTU wanting actuals within
 * three days, UC wanting them by 15 July, CAO wanting them by 1 August, Warsaw
 * wanting them typed into a portal. A rule that matched "IB results" anywhere
 * in the label would have rewritten four real deadlines onto the IB's day.
 * Opening with it is the claim; containing it is a reference to it.
 */
export const IB_RELEASE_LABEL = /^ib results\b/i;

export function claimsIbRelease(label) {
  return IB_RELEASE_LABEL.test(String(label || '').trim());
}

/**
 * The event id, in every session, that means "results reached the candidate".
 *
 * Named rather than spelled out at each use because the drift was between two
 * events of one session that are one day apart, and a guard comparing against
 * a string typed in three places is a guard that can be half-updated.
 */
export const IB_RESULTS_EVENT = 'results-day';

/**
 * Resolve `"2027-05/results-day"` against a parsed `data/ib-calendar.json`.
 *
 * A string reference rather than a pair of fields, because the drift this
 * whole model exists to stop was two records meaning different events by the
 * same date. One token that names the session AND the event cannot be
 * half-copied; `session` and `event` as separate fields can, and the record
 * that copies one and not the other looks complete.
 *
 * Returns null for anything that does not resolve, and the guard treats null
 * as a failure rather than as "no IB claim here" — a reference to a session
 * that was deleted at rollover must fail loudly, not stop being checked.
 */
export function ibSessionEvent(calendar, ref) {
  const [sessionId, eventId] = String(ref || '').split('/');
  if (!sessionId || !eventId) return null;
  const session = (calendar?.sessions || []).find((s) => s.id === sessionId);
  const event = session?.events?.[eventId];
  if (!event) return null;
  return { sessionId, eventId, session, ...event };
}

/** Every `session/event` token the calendar defines, for "did you mean". */
export function ibSessionEventRefs(calendar) {
  return (calendar?.sessions || []).flatMap((s) => Object.keys(s.events || {}).map((e) => `${s.id}/${e}`));
}

/* --- Normalising the two shapes we hold ----------------------------------- */

function clean(text) {
  return typeof text === 'string' && text.trim() ? text.trim() : null;
}

/**
 * A country profile's `application.deadlines[]` entry.
 *
 * Tolerant by design: the migration to ISO runs Destination by Destination, and
 * a record part-way through it still has to render. An unparsed legacy string
 * is carried through as `legacyDate` and shown as written rather than dropped —
 * losing a date because it is inconveniently shaped would be the worst of the
 * available outcomes.
 */
export function fromCountryDeadline(country, entry, index) {
  const iso = isIso(entry.date) ? entry.date : null;
  const legacy = !iso && clean(entry.date);

  return {
    id: entry.id || `${country.code}-deadline-${index}`,
    destination: country.code,
    destinationName: country.name,
    routeId: entry.route || null,
    jurisdiction: entry.jurisdiction || null,
    label: clean(entry.label) || 'Deadline',
    date: iso,
    endDate: isIso(entry.endDate) ? entry.endDate : null,
    timeOfDay: clean(entry.timeOfDay),
    timeZone: clean(entry.timeZone),
    dateState: DATE_STATES[entry.dateState] ? entry.dateState : iso ? null : legacy ? null : 'not-published',
    legacyDate: legacy,
    consequence: CONSEQUENCE[entry.consequence] ? entry.consequence : 'indicative',
    audience: entry.audience || 'any',
    provisional: Boolean(entry.provisional),
    intake: clean(entry.year) || country.targetIntake || null,
    note: clean(entry.notes) || clean(entry.note),
    /* Carried rather than dropped. A field that is legal to write and reaches
       no consumer produces a workaround repeated by everyone who meets it —
       `sources` and `audience` both did exactly that. */
    ibCalendar: clean(entry.ibCalendar),
    /* Both spellings, because both are allowed and only one was read.
       `test-calendar.mjs` whitelists `sources` as a legal field on a deadline
       entry, and this took `source` alone — so a researcher who recorded a
       second URL had it silently discarded, and the renderer below has always
       been able to show several. Three passes worked around it by putting the
       second URL inline in the note, which is the tell: the model advertised a
       field that did nothing. */
    sources: [...new Set([clean(entry.source), ...(Array.isArray(entry.sources) ? entry.sources : [entry.sources]).map(clean)])].filter(Boolean),
    /* When this date was last looked at. A source without one is an assertion
       with a URL attached: the page it points at may have changed the morning
       after it was read, and on a calendar that is the difference between a
       date a student can plan around and one they cannot. */
    checkedAt: clean(country.dataAsOf),
    evidence: entry.evidence || [],
    origin: 'profile',
  };
}

/** An Application Route milestone — already the right shape. */
export function fromRouteMilestone(route, milestone, destinationName) {
  return {
    id: milestone.id,
    destination: route.destination,
    destinationName,
    routeId: route.id,
    routeLabel: route.label || null,
    jurisdiction: route.jurisdiction || null,
    label: milestone.label,
    date: isIso(milestone.date) ? milestone.date : null,
    endDate: isIso(milestone.endDate) ? milestone.endDate : null,
    timeOfDay: clean(milestone.timeOfDay),
    timeZone: clean(milestone.timeZone),
    dateState: DATE_STATES[milestone.dateState] ? milestone.dateState : milestone.date ? null : 'not-published',
    legacyDate: null,
    type: milestone.type,
    consequence: CONSEQUENCE[milestone.consequence] ? milestone.consequence : 'indicative',
    audience: milestone.audience || route.applicantGroup || 'any',
    provisional: Boolean(milestone.provisional),
    intake: route.intake || null,
    note: clean(milestone.note),
    ibCalendar: clean(milestone.ibCalendar),
    sources: [],
    checkedAt: clean(route.meta?.dataAsOf),
    evidence: milestone.evidence || [],
    origin: 'route',
  };
}

/** A round is a window, which is one event with two ends. */
export function fromRouteRound(route, round, destinationName) {
  return {
    id: round.id,
    destination: route.destination,
    destinationName,
    routeId: route.id,
    routeLabel: route.label || null,
    jurisdiction: route.jurisdiction || null,
    label: round.label,
    date: isIso(round.closes) ? round.closes : isIso(round.opens) ? round.opens : null,
    endDate: null,
    openedOn: isIso(round.opens) ? round.opens : null,
    decisionBy: isIso(round.decisionBy) ? round.decisionBy : null,
    timeOfDay: null,
    timeZone: null,
    dateState: round.closes || round.opens ? null : 'not-published',
    legacyDate: null,
    type: 'submit',
    consequence: CONSEQUENCE[round.consequence] ? round.consequence : 'indicative',
    audience: route.applicantGroup || 'any',
    provisional: false,
    intake: route.intake || null,
    note: clean(round.note),
    sources: [],
    checkedAt: clean(route.meta?.dataAsOf),
    evidence: round.evidence || [],
    origin: 'route',
  };
}

function isIso(v) {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.trim()) && !Number.isNaN(Date.parse(v));
}

/* --- The one entry point pages use ---------------------------------------- */

/**
 * Every dated event for one Destination, from both shapes, newest research
 * first: a route milestone supersedes a profile deadline carrying the same
 * label, because the route is the migrated record and the profile is what it
 * was migrated from.
 */
export function eventsForDestination(country, graph) {
  const routes = [...(graph?.applicationRoutes?.values() || [])].filter((r) => r.destination === country.code);

  const fromRoutes = routes.flatMap((r) => {
    const milestones = (r.milestones || []).map((x) => fromRouteMilestone(r, x, country.name));

    /* A round and its own closing milestone are the same day described twice.
       Denmark records both — "The only round for applicants with an
       international qualification" and "Applications close", both 15 March —
       and a calendar that prints both is telling a student there are two things
       to do. The milestone wins: it is the one that says what closes. */
    const closedBy = new Set(milestones.filter((m) => m.type === 'submit' && m.date).map((m) => m.date));
    const rounds = (r.rounds || [])
      .map((x) => fromRouteRound(r, x, country.name))
      .filter((round) => !(round.date && closedBy.has(round.date)));

    return [...rounds, ...milestones];
  });

  const claimed = new Set(fromRoutes.map((e) => normaliseLabel(e.label)));
  const fromProfile = (country.application?.deadlines || [])
    .map((d, i) => fromCountryDeadline(country, d, i))
    .filter((e) => !claimed.has(normaliseLabel(e.label)));

  return [...fromRoutes, ...fromProfile].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
}

/**
 * Every dated event on the site.
 *
 * Takes the whole site rather than a list of countries, because "every
 * Destination" and "every country profile" are not the same set and the
 * difference is Denmark. Denmark is the one Destination that has finished
 * migrating: it has no record in `data/countries` at all, its dates live in
 * `data/application-routes/dk-optagelse-international-2027.json`, and iterating
 * the country profiles left the most important dates on the site off the
 * calendar entirely — including the 15 March noon deadline that the page's own
 * lede promises to tell you about.
 *
 * The de-duplication matters for the same reason in reverse: a Destination with
 * both a canonical record and a country profile would list every one of its
 * deadlines twice.
 *
 * Which Destinations those are is asked of the catalogue rather than worked out
 * here. This function used to keep its own `seen` set, and its comment said six
 * Destinations overlapped at a point when the live graph had fourteen — being
 * wrong about overlap produces a plausible page rather than an error, so the
 * stale number was never going to announce itself.
 */
export function allEvents(site) {
  const countries = site.countries || [];
  const canonicalCodes = new Set(
    canonicalOnlyCodes([...(site.graph?.destinations?.values() || [])].map((d) => ({ code: d.id })), countries)
  );

  const canonicalOnly = [...(site.graph?.destinations?.values() || [])]
    .filter((d) => canonicalCodes.has(d.id))
    .map((d) => ({
      code: d.id,
      name: d.name,
      targetIntake: d.targetIntake || null,
      dataAsOf: d.meta?.dataAsOf || null,
      application: null,
    }));

  return [...countries, ...canonicalOnly]
    .flatMap((c) => eventsForDestination(c, site.graph))
    .sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
}

function normaliseLabel(label) {
  return String(label || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/* --- Reading the calendar ------------------------------------------------- */

/** Where a date sits relative to today. The countdown chip needs no more. */
export function standing(event, today = new Date().toISOString().slice(0, 10)) {
  if (!event.date) return 'undated';
  if (event.endDate && event.endDate >= today && event.date <= today) return 'open';
  if (event.date < today) return 'past';
  const days = Math.round((Date.parse(event.date) - Date.parse(today)) / 86400000);
  if (days <= 30) return 'soon';
  return 'ahead';
}

export function daysUntil(event, today = new Date().toISOString().slice(0, 10)) {
  if (!event.date) return null;
  return Math.round((Date.parse(event.date) - Date.parse(today)) / 86400000);
}
