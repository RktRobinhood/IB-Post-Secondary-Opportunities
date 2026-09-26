/**
 * When a student can apply to one programme of a listed school record, as
 * one rule for every country (issue #43, programme pages round 4).
 *
 * The page's "Apply by" tile, its dates panel and every card that stands for
 * the programme read it from here, so a card never says something the page
 * does not:
 *
 *   - **Apply by is an application deadline this reader can use.** The first
 *     closing date (`kind: "closes"`) of the programme or its school that is
 *     for an EU/EEA applicant in their final IB year: not a date only for
 *     applicants outside the EU/EEA, not one only for Diploma holders, not an
 *     earlier chance (`early`: Early Action, an early bird, a priority date, a
 *     discount, an earlier round) and not a housing date (`housing`). The
 *     nearest of those shows as the tile's note ("€2,000 off by 15 Jan").
 *   - **A route's general date is the school's only where the route says so.**
 *     A date that governs some kinds of institution (`institutionTypes`) or
 *     some teaching languages (`taughtIn`) reaches no other school at all
 *     (school-dates.mjs); one that is every such school's deadline
 *     (`everySchool`, CAO's 1 February) may be Apply by, unless the school or
 *     the programme runs its own selection (`ownDeadline`).
 *   - **No date is never a dropped tile.** With nothing the reader can use,
 *     the tile says why, and the dates panel opens on the same line:
 *     "After your Diploma" (its only round needs the Diploma in hand), "Not
 *     open yet" (no round for a final-year student is published), "Not
 *     published yet" (its own date is not out; last year's from the record as
 *     the note), "No deadline" (the school sets none for the reader), or "Not
 *     recorded yet".
 *
 * Nothing here names a country, a school or a programme.
 */
import { datesFor, isBinding, leadsFor, forReader } from './school-dates.mjs';
import { roundOf, NOT_OPEN_YET, AFTER_DIPLOMA, NOT_PUBLISHED, NOT_RECORDED, NO_DEADLINE } from './schools.mjs';
import { FIELD } from '../pages/schools.mjs';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "15 April 2027". */
export function prettyDate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
/** "15 Apr". */
export function shortDay(iso) {
  const [, m, d] = String(iso).split('-').map(Number);
  return `${d} ${MONTHS[m - 1].slice(0, 3)}`;
}

/* --- The dates this programme reads ---------------------------------------- */

/**
 * The school, as the dates panel reads it for one programme: its key as its
 * id, its country as its Destination, its programmes by slug (so a date
 * naming a sibling stays on the sibling's page), and the programme's own
 * closing date in place of the school's. A programme's `closes` is, by the
 * schema, where it differs from the institution's, so the school's closing
 * dates give way to it, and it replaces whatever route date they replaced.
 *
 * A programme that runs in one of the school's rounds (`round`) reads that
 * round's dates only, and whether they are for Diploma holders is its own
 * answer.
 */
export function forDates(inst, c, p) {
  const school = inst.school;
  let dates = school.dates || [];
  if (p.round) {
    const mine = roundOf(p.round);
    const rounds = new Set(dates.filter((d) => d.kind === 'closes').map((d) => roundOf(d.label)));
    dates = dates
      .filter((d) => !rounds.has(roundOf(d.label)) || roundOf(d.label) === mine)
      .map((d) => {
        if (roundOf(d.label) !== mine || !p.closes) return d;
        const { forDiplomaHolders, ...rest } = d;
        return p.closesForDiplomaHolders ? { ...rest, forDiplomaHolders: true } : rest;
      });
  }
  if (p.closes) {
    const replaced = dates.filter((d) => d.kind === 'closes');
    const supersedes = replaced.find((d) => d.supersedes)?.supersedes;
    dates = [
      ...dates.filter((d) => d.kind !== 'closes'),
      {
        label: p.closesForDiplomaHolders ? 'Applications close (only if you already hold your IB Diploma)' : 'Applications close',
        date: p.closes,
        kind: 'closes',
        who: 'any',
        url: p.requirementsUrl || p.url,
        ...(supersedes ? { supersedes } : {}),
        ...(p.closesForDiplomaHolders ? { forDiplomaHolders: true } : {}),
      },
    ];
  }
  return {
    inst: {
      ...inst,
      id: inst.key,
      destination: c.code,
      school: { ...school, dates },
      programmes: school.programmes.map((q) => ({ id: q.slug, name: q.name })),
    },
    programme: { id: p.slug, name: p.name },
    ownCloses: dates.some((d) => d.kind === 'closes'),
    ownRound: Boolean(p.round),
    ownDeadline: Boolean(p.ownDeadline || school.ownDeadline),
  };
}

/* Words that name a field of study, from the schema's field list, made when
   first asked for (FIELD lives with the school pages). A date closing
   applications for a field names it ("Medicine and neighbours close").
   "Education" is left out: a deadline for "education finished this spring"
   means schooling, not the field. */
const NOT_A_FIELD = new Set(['education']);
let fieldWords = null;
function fieldWordsOf() {
  fieldWords ||= new Map(
    Object.entries(FIELD)
      .filter(([id]) => id !== 'other' && id !== 'interdisciplinary')
      .map(([id, label]) => [
        id,
        new Set([...id.split('-'), ...label.toLowerCase().split(/\s+/)].filter((w) => w.length > 3 && !NOT_A_FIELD.has(w))),
      ])
  );
  return fieldWords;
}

/**
 * Which dates are this programme's. The school's own (its record's, and a
 * route date tied to it or naming it) always are. A date of the route it is
 * applied through is, unless it is for a subset this programme is not
 * recorded in: numerus fixus only, or a deadline naming another field of
 * study. Where the school's record gives its own closing date, or the school
 * or programme runs its own selection (`ownDeadline`), the route's deadlines
 * are not its own. Dates for applicants outside the EU/EEA never are.
 */
export function keepFor(p, scope) {
  const words = fieldWordsOf();
  const mine = words.get(p.field) || new Set();
  const otherField = (label) => {
    const have = new Set(String(label).toLowerCase().split(/[^a-z]+/));
    return [...words].some(([id, ws]) => id !== p.field && [...ws].some((w) => have.has(w) && !mine.has(w)));
  };
  return (e) => {
    if (!forReader(e)) return false;
    if (e.schoolOwn) return true;
    /* A programme in one named round has all its dates in the record. */
    if (scope.ownRound) return false;
    if (e.numerusFixusOnly) return false;
    if (isBinding(e) && (scope.ownCloses || scope.ownDeadline || (!e.everySchool && otherField(e.label)))) return false;
    return true;
  };
}

/* The groups a date can be for that include this site's reader. */
const READER = new Set(['any', 'eu-eea-ch']);

/**
 * The deadline facts of one programme: its Apply-by date (or why there is
 * none), the notes beside it, and the filters its dates panel reads.
 */
const cache = new WeakMap();
export function deadlineOf(site, inst, c, p, today = new Date().toISOString().slice(0, 10)) {
  /* Asked once per programme and day: its page, its card on its school's
     page, and its card on its neighbours' pages all read the same answer. */
  if (!cache.has(site)) cache.set(site, new Map());
  const memo = cache.get(site);
  const key = `${inst.key}|${p.slug}|${today}`;
  if (!memo.has(key)) memo.set(key, deadlineUncached(site, inst, c, p, today));
  return memo.get(key);
}

function deadlineUncached(site, inst, c, p, today) {
  const school = inst.school;
  const year = Number(String(school.intake || '').match(/\d{4}/)?.[0]) || null;
  const scope = forDates(inst, c, p);
  const keep = keepFor(p, scope);
  const recorded = new Set(scope.inst.school.dates.map((d) => d.date));
  const all = datesFor(site, scope.inst, { programme: scope.programme });
  const ahead = (x) => (x.endDate || x.date) >= today;
  const forYou = (x) => keep(x) && READER.has(x.audience || 'any') && ahead(x);
  const closing = all.filter(
    (x) =>
      forYou(x) && isBinding(x) &&
      (x.kind ? x.kind === 'closes' : /\b(clos|deadline)/i.test(x.label)) &&
      ((x.schoolOwn && (recorded.has(x.endDate || x.date) || (x.institutions || []).includes(scope.inst.key))) ||
        (x.everySchool && !scope.ownDeadline)) &&
      /* A programme with its own selection reads only its own dates: its
         `closes`, or a date the record scopes to it. */
      (!p.ownDeadline || (p.closes && x.date === p.closes) || (x.programmes || []).includes(p.slug))
  );
  const e = closing.find(leadsFor);
  const closes = e ? e.endDate || e.date : null;
  /* Earlier chances and housing, before the deadline (or at all, with none). */
  const before = (x) => forYou(x) && (!closes || x.date <= closes);
  const early = all.find((x) => x.kind === 'early' && before(x)) || null;
  const housing = all.find((x) => x.kind === 'housing' && before(x)) || null;

  let status = null;
  if (!e) {
    const lastYear = p.lastYear || school.lastYear;
    if (closing.some((x) => x.forDiplomaHolders)) {
      status = p.closesForDiplomaHolders
        ? { value: AFTER_DIPLOMA, note: p.round ? `Runs only in the ${p.round}, which needs the Diploma in hand` : 'Its only round needs the Diploma in hand' }
        : { value: NOT_OPEN_YET, note: `No ${year ? `${year} ` : ''}round for final-year IB students published yet` };
    } else if (school.noDeadline && !p.ownDeadline) {
      status = { value: NO_DEADLINE, note: school.noDeadline };
    } else if (lastYear || scope.ownDeadline) {
      status = { value: NOT_PUBLISHED, note: lastYear ? `${lastYear.year}: ${lastYear.text}` : `No ${year ? `${year} ` : ''}date out yet` };
    } else {
      status = { value: NOT_RECORDED, note: null };
    }
  }
  const earlyNote = early ? `${early.short || 'Earlier round'} by ${shortDay(early.date)}` : null;
  const note = [
    e?.provisional ? `Not yet confirmed for ${year || 'this year'}` : null,
    status?.note || null,
    earlyNote,
    housing ? `Housing by ${shortDay(housing.date)}` : null,
  ].filter(Boolean).join(' · ') || null;

  return {
    scope,
    keep,
    closes,
    provisional: Boolean(e?.provisional),
    early,
    housing,
    status,
    year,
    tile: { label: 'Apply by', value: closes ? prettyDate(closes) : status.value, note },
    /* The same answer, as a card's chip. */
    chip: closes ? `Apply by ${shortDay(closes)}` : status.value,
    /* Open to a final-year student now: a date to act on. */
    open: Boolean(closes),
  };
}

/**
 * When the first year starts, only as a record says it: the programme's
 * month, else its school's, else just the season of the intake. A programme
 * the reader can join only after their Diploma starts a year later at the
 * earliest.
 */
export function startsOf(school, p, deadline) {
  const year = Number(String(school.intake || '').match(/\d{4}/)?.[0]) || null;
  const season = /spring/.test(school.intake || '') ? 'Spring' : 'Autumn';
  if (deadline?.status?.value === AFTER_DIPLOMA) return year ? `${season} ${year + 1} at the earliest` : `${season}, a year later`;
  const month = p.starts || school.starts;
  if (month) return year ? `${month} ${year}` : month;
  return year ? `${season} ${year}` : season;
}
