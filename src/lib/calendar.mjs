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

/* --- Whether the reader can take this at all ------------------------------ */

/**
 * `readerAccess` — whether this site's reader can take a route or act on a
 * date. #35: Korea's GKS Embassy Track and Japan's embassy MEXT undergraduate
 * route were both closed to a Danish applicant, and the only place that could
 * say so was `notes`, so both rendered as a date with a hard-deadline badge,
 * sorted among the dates a student was meant to act on.
 *
 * A closed entry is shown, not hidden — a student who has heard of the route
 * elsewhere needs telling it is closed — but it is never actionable: no
 * `data-date` for the "next" marker, no consequence badge, and sorted after
 * every entry that is. `isActionable` is the one test every consumer asks.
 */
export const READER_ACCESS = {
  closed: { label: 'Not open to you' },
  conditional: { label: 'Only if' },
  open: { label: 'Open to you' },
};

/** A declared access, or null. An unknown state is not passed through. */
export function readerAccessOf(...candidates) {
  for (const a of candidates) {
    if (a && READER_ACCESS[a.state] && clean(a.reason)) {
      return { state: a.state, reason: clean(a.reason), evidence: Array.isArray(a.evidence) ? a.evidence : [] };
    }
  }
  return null;
}

export function isClosed(event) {
  return event?.access?.state === 'closed';
}

export function isActionable(event) {
  return !isClosed(event);
}

/** Sort key that puts every closed entry after every actionable one. */
function orderKey(event) {
  return `${isClosed(event) ? '1' : '0'}${sortKey(event)}`;
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
    /* The institutions this date belongs to, by page id, when it is one
       school's date on a route many schools share (see fromRouteMilestone). */
    institutions: idList(entry.institutions),
    /* A date for Institutions that have no page, by name ("Reykjavik
       University"): it reaches no school page (school-dates.mjs). */
    institutionsWithoutPage: nameList(entry.institutionsWithoutPage),
    /* Only for numerus fixus programmes: on a Programme page it shows only
       where the programme's admission is numerus fixus. */
    numerusFixusOnly: Boolean(entry.numerusFixusOnly),
    /* The cited source gives the day and month and no year. Such a date is
       provisional; scripts/test-calendar.mjs holds the two together. */
    yearUnpublished: Boolean(entry.yearUnpublished),
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
    access: readerAccessOf(entry.readerAccess),
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
    /* The general date this one replaces where it is shown ("<route>/<milestone>");
       read by a school's own list (school-dates.mjs), never by the calendar. */
    supersedes: clean(milestone.supersedes),
    /* The institutions this date is for, by id, when it is one school's date
       on a route several share ("UBC applications close" on the British
       Columbia route). A school's page shows it only if its id is here; the
       calendar shows it as it always did. Read by school-dates.mjs. */
    institutions: idList(milestone.institutions),
    /* A date for Institutions that have no page, by name ("Reykjavik
       University"): it reaches no school page (school-dates.mjs). */
    institutionsWithoutPage: nameList(milestone.institutionsWithoutPage),
    /* Only for numerus fixus programmes: on a Programme page it shows only
       where the programme's admission is numerus fixus. */
    numerusFixusOnly: Boolean(milestone.numerusFixusOnly),
    /* The cited source gives the day and month and no year. Such a date is
       provisional; scripts/test-calendar.mjs holds the two together. */
    yearUnpublished: Boolean(milestone.yearUnpublished),
    sources: [],
    checkedAt: clean(route.meta?.dataAsOf),
    evidence: milestone.evidence || [],
    access: readerAccessOf(milestone.readerAccess, route.readerAccess),
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
    provisional: Boolean(round.provisional),
    intake: route.intake || null,
    note: clean(round.note),
    institutions: idList(round.institutions),
    /* A date for Institutions that have no page, by name ("Reykjavik
       University"): it reaches no school page (school-dates.mjs). */
    institutionsWithoutPage: nameList(round.institutionsWithoutPage),
    /* Only for numerus fixus programmes: on a Programme page it shows only
       where the programme's admission is numerus fixus. */
    numerusFixusOnly: Boolean(round.numerusFixusOnly),
    /* The cited source gives the day and month and no year. Such a date is
       provisional; scripts/test-calendar.mjs holds the two together. */
    yearUnpublished: Boolean(round.yearUnpublished),
    sources: [],
    checkedAt: clean(route.meta?.dataAsOf),
    evidence: round.evidence || [],
    access: readerAccessOf(round.readerAccess, route.readerAccess),
    origin: 'route',
  };
}

/**
 * A route the reader cannot take, as one entry rather than one per milestone.
 *
 * Every round and milestone of a closed route would otherwise print the same
 * exclusion five times over. The route is the thing that is closed, so the
 * route is the one line; the dates inside it are not the reader's to act on
 * and are not listed.
 */
export function fromClosedRoute(route, destinationName) {
  return {
    id: route.id,
    destination: route.destination,
    destinationName,
    routeId: route.id,
    routeLabel: null,
    jurisdiction: route.jurisdiction || null,
    label: clean(route.label) || route.id,
    date: null,
    endDate: null,
    timeOfDay: null,
    timeZone: null,
    dateState: null,
    legacyDate: null,
    consequence: 'indicative',
    audience: route.applicantGroup || 'any',
    provisional: false,
    intake: route.intake || null,
    note: null,
    sources: route.portalUrl ? [route.portalUrl] : [],
    checkedAt: clean(route.meta?.dataAsOf),
    evidence: route.readerAccess?.evidence || [],
    access: readerAccessOf(route.readerAccess),
    origin: 'route',
  };
}

/** A list of record ids, or an empty list. */
function idList(v) {
  return Array.isArray(v) ? [...new Set(v.map(clean).filter(Boolean))] : [];
}

/** Names, trimmed and once each. */
const nameList = idList;

function isIso(v) {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.trim()) && !Number.isNaN(Date.parse(v));
}

/* --- One fact, one card ---------------------------------------------------- */

/**
 * The same deadline, recorded twice.
 *
 * A Destination's country profile listed its deadlines first; its Application
 * Routes were migrated from them later, and the profile entries stayed. The
 * label test in `eventsForDestination` caught a twin only when the two were
 * worded identically, and they rarely are: "HKUST — priority round" and "HKUST
 * priority round closes" are one date, and ~90 of them reached the calendar
 * twice across 25 Destinations (docs/research/variants/systemic.md §5).
 *
 * Two entries are one event when they fall on the same day (and, for a window,
 * end on the same day), are the same kind of thing, belong to the same route
 * where both say, and name the same institution or system. Everything here is
 * read off the records: the words set aside as naming nothing are the
 * vocabulary of calendars in general, never the name of a place.
 */

/* Words that say what kind of date it is, or nothing at all. What is left
   after removing them names the institution, programme or system. */
const GENERIC = new Set(`
  a an and or the of for to in on at by with from as is it its be are your you yours this that these those all any each
  every everything else anything other most more main only also not no if one two three first second third final last
  next new early late
  application applications apply applicant applicants applying admission admissions deadline deadlines date dates day
  close closes closed closing open opens opened opening window period round rounds session sessions stage phase
  submit submitted submission due deliver send sent upload uploaded register registration registered enrol enrolment
  intake entry start starts year years semester term academic autumn spring summer winter fall
  university universities college school institution programme programmes program programs course courses bachelor bachelors
  degree degrees undergraduate study studies student students international foreign eu eea non nordic selective taught
  must can may will need needs needed required requirement requirements recommended general ordinary normal regular
  result results document documents supporting official
  issued published released announced
  january february march april may june july august september october november december
`.trim().split(/\s+/));

const words = (text) =>
  String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((w) => (w.length > 4 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w));

/** The words of a label that identify something, rather than describe a date. */
export function identityWords(label) {
  return new Set(words(label).filter((w) => w.length > 1 && !/^\d+$/.test(w) && !GENERIC.has(w) && !GENERIC.has(`${w}s`)));
}

/**
 * Does an initialism in one label spell a name written out in the other?
 * "NTU" and "Nanyang Technological University", "UBC" and "University of
 * British Columbia". Each letter must be the first letter of the next
 * capitalised word; short lower-case words ("of", "the", "and") are skipped.
 * Anything looser matched "IT" against "IB results" and "SEA" against "Sign
 * the application".
 */
function spellsOut(a, b) {
  return Boolean(initialismOf(a, b));
}

/**
 * The initialism in `a` that spells out a name written in `b`, or null.
 * `toEnd`, for `b` a name rather than a label: the letters must run to the
 * name's last word, so they spell the whole name or its closing words ("UAS"
 * for "… University of Applied Sciences"), never a phrase that stops inside
 * it ("UAT" is not "University of the Arts London"). Under `toEnd` the last
 * letter must start a word of its own.
 */
export function initialismOf(a, b, { toEnd = false } = {}) {
  const plain = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  /* Three letters at least: two matched "EU" to "Erasmus University". */
  const initialisms = plain(a).match(/\b[A-Z]{3,6}\b/g) || [];
  const named = plain(b).split(/[^A-Za-z]+/).filter((w) => w && !(w.length <= 3 && w === w.toLowerCase()));
  /* One letter may come from inside the word before it, for the syllable an
     initialism takes from a compound: XJTLU is Xi'an JiaoTong-Liverpool. */
  const spells = (acr, i) => {
    let w = i;
    let inside = 0;
    for (let k = 0; k < acr.length; k++) {
      if (named[w]?.[0] === acr[k]) { w++; continue; }
      const prev = named[w - 1];
      const last = k === acr.length - 1;
      if (k && !inside && !(toEnd && last) && prev && prev.slice(1).toUpperCase().includes(acr[k])) { inside++; continue; }
      return false;
    }
    if (toEnd && w !== named.length) return false;
    return named.slice(i, w).join('') !== acr;
  };
  return initialisms.find((acr) => named.some((_, i) => spells(acr, i))) || null;
}

const flat = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

/**
 * How strongly two labels name the same thing: shared identifying words, one
 * for an initialism written out, and a decisive score when one label is the
 * other with whole words added ("Normal closing date - the one that matters").
 * Whole words: "HKUST applications close" does not begin with "HKU".
 */
export function nameMatch(a, b) {
  const fa = flat(a);
  const fb = flat(b);
  if (fa && fb && (`${fa} `.startsWith(`${fb} `) || `${fb} `.startsWith(`${fa} `))) return 99;
  const wa = identityWords(a);
  let n = 0;
  for (const w of identityWords(b)) if (wa.has(w)) n++;
  if (spellsOut(a, b) || spellsOut(b, a)) n++;
  return n;
}

/**
 * What kind of date an entry is. Two entries on one day can only be one event
 * if they are the same kind: an exam and the application it belongs to share
 * a day and an institution and are still two things to do.
 */
export function eventKind(e) {
  if (e.endDate && e.endDate !== e.date) return 'window';
  const l = String(e.label || '').toLowerCase();
  if (/\b(test|exam|examination|interview)s?\b/.test(l)) return 'test';
  if (/\bopen(s|ed|ing)?\b/.test(l) && !/\bclos/.test(l)) return 'open';
  if (/\b(reply|accept|acceptance|deposit|intent to register)\b/.test(l)) return 'reply';
  /* "IB results released" is news; "IB results due" is a deadline. */
  if (/\b(results?|ranking|offers)\b/.test(l) && !/\b(due|deadline|must|needs?|reach|send|submit|upload|deliver|to)\b/.test(l)) return 'result';
  return 'deadline';
}

const STRICTNESS = ['indicative', 'personal', 'rolling', 'priority', 'equal-consideration', 'hard'];
const stricter = (a, b) => (STRICTNESS.indexOf(a) >= STRICTNESS.indexOf(b) ? a : b);

/** Same day, same end, same kind, and not on two different routes. */
export function sameOccasion(a, b) {
  return Boolean(
    a.date && a.date === b.date &&
    (a.endDate || null) === (b.endDate || null) &&
    (!a.routeId || !b.routeId || a.routeId === b.routeId) &&
    !isClosed(a) && !isClosed(b) &&
    eventKind(a) === eventKind(b)
  );
}

/** Notes that say the same thing once. A note contained in another is dropped. */
function unionNotes(...notes) {
  const kept = [];
  for (const n of notes.filter(Boolean)) {
    const f = flat(n);
    if (kept.some((k) => flat(k).includes(f))) continue;
    for (let i = kept.length - 1; i >= 0; i--) if (f.includes(flat(kept[i]))) kept.splice(i, 1);
    kept.push(n);
  }
  return kept.length ? kept.join('\n\n') : null;
}

const union = (...lists) => [...new Set(lists.flat().filter(Boolean))];

/**
 * One card from two records of one event. The route is the migrated record, so
 * its fields win where both have one and the profile fills what it lacks.
 * Three exceptions: the label that names more is kept; the stricter
 * consequence is kept, because a student who reads a hard deadline as a
 * priority date can miss it; and notes, sources and evidence are the union of
 * both, so no link a researcher recorded is lost in the merge.
 */
export function mergeTwins(route, profile) {
  const rw = identityWords(route.label).size;
  const pw = identityWords(profile.label).size;
  return {
    ...route,
    label: pw > rw ? profile.label : route.label,
    timeOfDay: route.timeOfDay || profile.timeOfDay,
    timeZone: route.timeOfDay ? route.timeZone : profile.timeZone || route.timeZone,
    consequence: stricter(route.consequence, profile.consequence),
    audience: route.audience && route.audience !== 'any' ? route.audience : profile.audience,
    intake: route.intake || profile.intake,
    note: unionNotes(route.note, profile.note),
    ibCalendar: route.ibCalendar || profile.ibCalendar,
    institutions: union(route.institutions, profile.institutions),
    institutionsWithoutPage: union(route.institutionsWithoutPage, profile.institutionsWithoutPage),
    numerusFixusOnly: Boolean(route.numerusFixusOnly || profile.numerusFixusOnly),
    /* Either record's doubt about the year stands: a provisional date is
       never shown as a confirmed one because its twin did not say so. */
    provisional: Boolean(route.provisional || profile.provisional),
    yearUnpublished: Boolean(route.yearUnpublished || profile.yearUnpublished),
    sources: union(route.sources, profile.sources),
    evidence: union(route.evidence, profile.evidence),
    checkedAt: [route.checkedAt, profile.checkedAt].filter(Boolean).sort().at(-1) || null,
    access: route.access || profile.access,
    mergedFrom: union(route.mergedFrom, [profile.id]),
  };
}

/**
 * Fold each profile entry into the route event it restates.
 *
 * 1. Pairs are made one to one, best match first, so two institutions'
 *    deadlines on one day ("HKU first round" and "HKUST priority round") each
 *    find their own twin rather than both finding the first.
 * 2. A day left with one unmatched route event of a kind takes the one profile
 *    entry that either names nothing beyond the route ("First admission round
 *    application deadline") or names the route itself where the route event
 *    names nothing ("Samordna opptak main deadline" and "Ordinary application
 *    deadline"). Two entries that each name something the other does not are
 *    two things, whatever the day.
 * 3. A profile entry that names the route and matches an event already folded
 *    joins it: one system's deadline, recorded by the system and by a member.
 * 4. A profile window whose first day is a route's "opens" and whose last day
 *    is its "closes", for the same institution, is those two dates written
 *    once more. Its notes and sources go to the closing date, the one that
 *    costs something to miss, and its sources to the opening too.
 */
export function foldTwins(routeEvents, profileEvents) {
  const merged = new Map(routeEvents.map((r) => [r, r]));
  const leftover = new Set(profileEvents);
  const taken = new Set();
  const fold = (r, p) => {
    merged.set(r, mergeTwins(merged.get(r), p));
    leftover.delete(p);
    taken.add(r);
  };
  const context = (r) => identityWords(`${r.routeLabel || ''} ${String(r.routeId || '').replace(/-/g, ' ')}`);
  const namesRoute = (p, r) => p.routeId === r.routeId || [...identityWords(p.label)].some((w) => context(r).has(w));

  // 1
  const pairs = [];
  for (const p of profileEvents)
    for (const r of routeEvents) {
      if (!sameOccasion(p, r)) continue;
      const n = nameMatch(p.label, r.label);
      if (n) pairs.push({ p, r, n: n + (namesRoute(p, r) ? 0.5 : 0) });
    }
  pairs.sort((a, b) => b.n - a.n);
  for (const { p, r } of pairs) if (leftover.has(p) && !taken.has(r)) fold(r, p);

  // 2
  for (const r of routeEvents) {
    if (taken.has(r)) continue;
    const ctx = context(r);
    const own = (label) => [...identityWords(label)].filter((w) => !ctx.has(w));
    const fits = [...leftover].filter((p) => {
      if (!sameOccasion(p, r)) return false;
      if (p.consequence !== r.consequence) return false;
      /* Where the day has several route events of this kind, the one with the
         same consequence is the only candidate; none or two, and it is left. */
      const rivals = routeEvents.filter((o) => !taken.has(o) && sameOccasion(p, o) && o.consequence === p.consequence);
      if (rivals.length !== 1) return false;
      return !own(p.label).length || (!own(r.label).length && namesRoute(p, r));
    });
    if (fits.length === 1) fold(r, fits[0]);
  }

  // 3
  for (const p of [...leftover]) {
    const home = routeEvents.find((r) => taken.has(r) && sameOccasion(p, r) && [...identityWords(p.label)].some((w) => context(r).has(w)) && Math.max(nameMatch(p.label, r.label), nameMatch(p.label, merged.get(r).label)) > 0);
    if (home) fold(home, p);
  }

  // 4
  const used = new Set();
  const within = (inner, outer) => {
    const ow = identityWords(outer);
    return [...identityWords(inner)].every((w) => ow.has(w)) || (spellsOut(inner, outer) && [...identityWords(inner)].every((w) => ow.has(w) || /^[a-z]{2,6}$/.test(w) && spellsOut(inner, outer)));
  };
  const onDay = (p, day, kind) =>
    routeEvents.filter((r) => !used.has(r) && r.date === day && !r.endDate && !isClosed(r) && eventKind(r) === kind &&
      (!p.routeId || p.routeId === r.routeId) && nameMatch(p.label, r.label) && within(r.label, p.label));
  const windows = [...leftover].filter((p) => eventKind(p) === 'window' && !isClosed(p));
  for (const p of windows) {
    const opens = onDay(p, p.date, 'open');
    const closes = onDay(p, p.endDate, 'deadline');
    if (opens.length !== 1 || closes.length !== 1) continue;
    const [o] = opens;
    const [c] = closes;
    merged.set(c, mergeTwins(merged.get(c), { ...p, label: '', endDate: null }));
    merged.set(o, { ...merged.get(o), sources: union(merged.get(o).sources, p.sources), mergedFrom: union(merged.get(o).mergedFrom, [p.id]) });
    used.add(o).add(c);
    leftover.delete(p);
  }
  /* A window with a matching "opens" and no matching close: the window says
     more (it has the end), so the opening folds into it and the window's words
     are kept. An opening already kept for a window closed above can still fold
     here: its day is then carried by this window, so no date is lost. */
  const intoWindow = new Set();
  for (const p of windows) {
    if (!leftover.has(p)) continue;
    const opens = onDay({ ...p }, p.date, 'open').concat([...used].filter((o) => !intoWindow.has(o) && o.date === p.date && eventKind(o) === 'open' && (!p.routeId || p.routeId === o.routeId) && nameMatch(p.label, o.label) && within(o.label, p.label)));
    const unique = [...new Set(opens)].filter((o) => !intoWindow.has(o));
    if (unique.length !== 1) continue;
    const [o] = unique;
    merged.set(o, { ...mergeTwins({ ...merged.get(o), endDate: p.endDate }, p), label: p.label });
    used.add(o);
    intoWindow.add(o);
    leftover.delete(p);
  }

  return [...merged.values(), ...leftover];
}

/* --- The one entry point pages use ---------------------------------------- */

/**
 * Every dated event for one Destination, from both shapes, newest research
 * first: a route milestone supersedes a profile deadline carrying the same
 * label, because the route is the migrated record and the profile is what it
 * was migrated from.
 */
export function eventsForDestination(country, graph, { fold = true } = {}) {
  const routes = [...(graph?.applicationRoutes?.values() || [])].filter((r) => r.destination === country.code);

  const closedRoutes = new Set(
    routes.filter((r) => readerAccessOf(r.readerAccess)?.state === 'closed').map((r) => r.id)
  );

  const fromRoutes = routes.flatMap((r) => {
    if (closedRoutes.has(r.id)) return [fromClosedRoute(r, country.name)];
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

  /* A closed route's rounds and milestones still claim their labels after it
     collapses to one line, so the profile entry it was migrated from is
     recognised as the same fact and not listed again beside it. */
  const claimed = new Set([
    ...routes
      .filter((r) => closedRoutes.has(r.id))
      .flatMap((r) => [...(r.rounds || []), ...(r.milestones || [])].map((x) => normaliseLabel(x.label))),
  ]);
  const fromProfile = (country.application?.deadlines || [])
    .map((d, i) => fromCountryDeadline(country, d, i))
    /* A profile entry on a closed route is that route's fact, already stated
       once by the route's own line. */
    .filter((e) => !claimed.has(normaliseLabel(e.label)) && !closedRoutes.has(e.routeId));

  if (!fold) return [...fromRoutes, ...fromProfile].sort((a, b) => orderKey(a).localeCompare(orderKey(b)));

  /* Worded the same: the route event is the fact, and the profile entry's
     notes and sources join it rather than being dropped with it. */
  const byLabel = new Map(fromRoutes.map((e) => [normaliseLabel(e.label), e]));
  const merged = new Map(fromRoutes.map((e) => [e, e]));
  const rest = [];
  for (const e of fromProfile) {
    const twin = byLabel.get(normaliseLabel(e.label));
    const cur = twin && merged.get(twin);
    if (!twin || (cur.date && e.date && (cur.date !== e.date || (cur.endDate || null) !== (e.endDate || null)))) {
      /* Same words, different day: two dates, both kept. */
      rest.push(e);
      continue;
    }
    const dated = cur.date ? cur : { ...cur, date: e.date, endDate: e.endDate, dateState: e.dateState, provisional: e.provisional };
    merged.set(twin, mergeTwins(dated, { ...e, label: twin.label }));
  }

  /* Worded differently, still one date: see foldTwins. */
  return foldTwins([...merged.values()], rest).sort((a, b) => orderKey(a).localeCompare(orderKey(b)));
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
    .sort((a, b) => orderKey(a).localeCompare(orderKey(b)));
}

function normaliseLabel(label) {
  return String(label || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/* --- Which entry year a date is for ---------------------------------------- */

/**
 * The year of entry an event belongs to, read off its `intake`: "2027-autumn"
 * on a route, or the researcher's words on a profile entry ("2027 entry",
 * "2026/27 entry, spring start", "2026 UCAT cycle, used for 2027 entry").
 * The year that counts is the one written against entry, intake, session or
 * admission; a sentence that names no such year returns null.
 */
export function entryYear(event) {
  const t = String(event?.intake || '');
  const route = t.match(/^(\d{4})-[a-z]/i);
  if (route) return Number(route[1]);
  const m = t.match(/\b(\d{4})(?:\s*\/\s*\d{2,4})?\s+(?:entry|intake|session|admission)\b/i);
  return m ? Number(m[1]) : null;
}

/**
 * Is this a date for an earlier year's entry than the one the site is built
 * for? Portugal's 2026 national-competition phases and a Polish university's
 * 2026 enrolment window were recorded as the pattern for 2027 because the 2027
 * dates were not out. They are last year's dates: nothing a student applying
 * for this cycle can act on, so they never sit among the dates ahead.
 */
export function isForEarlierEntry(event, cycleYear) {
  const y = entryYear(event);
  return Boolean(cycleYear && y && y < cycleYear);
}

/* --- Reading the calendar ------------------------------------------------- */

/** Where a date sits relative to today. The countdown chip needs no more. */
export function standing(event, today = new Date().toISOString().slice(0, 10)) {
  if (isClosed(event)) return 'closed';
  if (!event.date) return 'undated';
  if (event.endDate && event.endDate >= today && event.date <= today) return 'open';
  if (event.date < today) return 'past';
  const days = Math.round((Date.parse(event.date) - Date.parse(today)) / 86400000);
  if (days <= 30) return 'soon';
  return 'ahead';
}

export function daysUntil(event, today = new Date().toISOString().slice(0, 10)) {
  if (!event.date || isClosed(event)) return null;
  return Math.round((Date.parse(event.date) - Date.parse(today)) / 86400000);
}
