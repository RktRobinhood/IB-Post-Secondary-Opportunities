/**
 * The dates that matter to one school, and to one programme at it.
 *
 * A combined list of every deadline in every country is too much to read. A
 * student starts caring about deadlines once they are interested in a school,
 * so every Institution page, every school page and every Programme page
 * carries its own short list: the next deadline first, then the next few
 * dates, then the rest one tap away, then any open days and webinars.
 *
 * Which dates belong to a school is read off the records, never from a list of
 * names in code:
 *
 *   - **Its routes.** The Application Routes its Opportunities name, and the
 *     routes whose `appliesTo` names them. A school whose programmes are not
 *     listed one by one (a school page from a country profile) is applied to
 *     through its country's route when the country has exactly one route open
 *     to every school; with several, only the dates that name it are its own.
 *   - **Not another school's dates.** A national route carries every member
 *     institution's dates ("UBC applications close" and "SFU applications
 *     close" on one route). A date that is one school's says so in its record,
 *     `institutions: [ids]`, and reaches only those schools' pages. That link
 *     is the rule; reading names out of a label is the fallback for a date
 *     with none. In the fallback, a date whose label names one other
 *     Institution of the same Destination, or several, and not this one, is
 *     theirs. The Institutions a label can name are the Destination's school
 *     pages and the Institutions its records name that have no page
 *     (`institutionsWithoutPage` on a date, and the publishers of its
 *     evidence): a date for Reykjavik University, which has no page, reaches
 *     no school page at all and stays on the Deadlines page. The fallback never
 *     reads a heading that names a place ("British Columbia — …": the
 *     Destination's name or one of its jurisdictions') as naming a school,
 *     never counts a word three or more of a country's schools share
 *     ("Applied", "Sciences"), never reads an initialism as spelling out
 *     one school's name when another school carries those letters as a word
 *     of its own ("LUT" is LUT University), and reads an initialism only as
 *     a whole name or its closing words ("UAT" is not "University of the Arts
 *     London").
 *   - **Its own dates.** A profile deadline with no route belongs here when it
 *     names this Institution, and so does every date in the school's own
 *     record (data/schools/).
 *   - **Its own date wins.** Where the school's own date for a step replaces
 *     the route's general one (`supersedes`), the general one is left out:
 *     two dates for one step leave a student to guess which binds. A date for
 *     one programme replaces the general one only on that programme's page.
 *   - **This year's entry only.** A date recorded from last year's cycle as
 *     the pattern for this one is not a date to act on (`isForEarlierEntry`).
 *   - **On a Programme page, not another programme's dates.** A date that names
 *     one of the school's programmes ("International Business numerus fixus
 *     closes") is shown on that programme's page and not on its siblings'. A
 *     date only for numerus fixus programmes (`numerusFixusOnly`) is not shown
 *     where the programme is recorded as not numerus fixus
 *     (`admission.numerusFixus: false`).
 */
import { html, raw } from './html.mjs';
import { url, SITE } from './layout.mjs';
import {
  allEvents, consequenceOf, eventKind, formatWhen, identityWords, initialismOf, isActionable, isForEarlierEntry, mergeTwins, nameMatch, sortKey,
} from './calendar.mjs';

/** How many dates show before the disclosure, on a wide screen and on a phone. */
export const PANEL_FIRST = 3;
export const PANEL_FIRST_NARROW = 3;

/** The entry year the site is built for ("Autumn 2027" → 2027). */
const CYCLE_YEAR = Number(String(SITE.cycle?.intake || '').match(/\d{4}/)?.[0]) || null;

/**
 * The consequences that make a date the one to plan around: missing it costs
 * the place, or the guarantee of being read. Everything else (a portal
 * opening, a result, a step to set yourself) is context for it.
 */
const BINDING = new Set(['hard', 'equal-consideration']);
export const isBinding = (e) => BINDING.has(e.consequence) && isActionable(e);

const eventsCache = new WeakMap();
function siteEvents(site) {
  if (!eventsCache.has(site)) eventsCache.set(site, allEvents(site));
  return eventsCache.get(site);
}

/* --- Who a label is about -------------------------------------------------- */

/**
 * Every way a record names itself: its name, short name and local name, and
 * each half of a name with a bracket in it ("University College Maastricht
 * (Liberal Arts and Sciences)" is named by either).
 */
function namesOf(record) {
  return [record.name, record.shortName, record.localName]
    .filter(Boolean)
    .flatMap((n) => {
      const m = n.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
      return m ? [n, m[1], m[2]] : [n];
    })
    .filter(Boolean);
}

/**
 * How completely a label names a record: the share of the record's identifying
 * words the label contains, or 1 for an initialism spelled out ("RSU").
 */
function coverage(label, record, ignore, weak) {
  return strengthOf(label, record, ignore, weak).c;
}

/**
 * `c`, the share of a record's identifying words a label contains; `s`, how
 * many words that took; `words`, which words of the label it took (an
 * initialism takes one of its own). Of two names a label covers completely,
 * the one it spells out further wins.
 */
function strengthOf(label, record, ignore = new Set(), weak = new Set()) {
  let best = { c: 0, s: 0, words: new Set() };
  const better = (c, s, words) => {
    if (c > best.c || (c === best.c && s > best.s)) best = { c, s, words };
  };
  const have = identityWords(label);
  for (const n of namesOf(record)) {
    /* A name can be named by containment even when every word of it is
       generic or ignored ("University College Maastricht" on its own
       university's page), so that test comes first. */
    if (nameMatch(label, n) >= 99) return { c: 1, s: 99, words: identityWords(n) };
    const words = new Set([...identityWords(n)].filter((w) => !ignore.has(w)));
    if (!words.size) continue;
    const shared = new Set([...words].filter((w) => have.has(w)));
    /* Words many schools share ("Hong Kong", "Dubai", "Applied Sciences")
       count toward a name the label also names by a word of its own, never
       on their own. */
    if ([...shared].some((w) => !weak.has(w))) better(shared.size / words.size, shared.size, shared);
    /* An initialism in the label for a name written out in the record: the
       match counts one more than the words the two share (ignored words
       included, or a shared "Maastricht" reads as an initialism). */
    const sharedAll = [...identityWords(n)].filter((w) => have.has(w)).length;
    const acr = n.split(/\s+/).length > 1 && initialismOf(label, n, { toEnd: true });
    /* Marked "#<letters>": a school whose name carries those letters as a
       word takes them first (namedIn), so this counts a little less. */
    if (acr && nameMatch(label, n) > sharedAll) better(1, shared.size + 0.5, new Set([...shared, `#${acr.toLowerCase()}`]));
  }
  return best;
}

/**
 * The records a label is about: those it names most completely, if any. A
 * record whose every matched word is already taken by a name the label spells
 * out further is not named: "TU Delft …" names TU Delft and not TU/e, whose
 * "TU" it shares; "Oxford, Cambridge, medicine …" names both universities.
 */
function namedIn(label, records, threshold = 1, ignore, weak) {
  const scored = records.map((r) => ({ r, ...strengthOf(label, r, ignore, weak) })).filter((x) => x.c >= threshold);
  if (!scored.length) return [];
  const top = Math.max(...scored.map((x) => x.c));
  const taken = new Set();
  const out = [];
  /* An initialism is taken by a school that carries those letters as a word
     of its name ("LUT" in "LUT University"), never by another initialism:
     "UAS" names every University of Applied Sciences alike. */
  const isTaken = (w) => taken.has(w.startsWith('#') ? w.slice(1) : w);
  for (const x of scored.filter((x) => x.c === top).sort((a, b) => b.s - a.s)) {
    if (x.words.size && [...x.words].every(isTaken)) continue;
    for (const w of x.words) if (!w.startsWith('#')) taken.add(w);
    out.push(x.r);
  }
  return out;
}

/** A page's Institution carries its Destination as an object; a record, as an id. */
const destinationCode = (inst) => inst.destination?.code || inst.destination;

/**
 * A label with a heading that names a place taken off: "British Columbia —
 * Simon Fraser University applications close" is about Simon Fraser, and the
 * words before the dash say where, not who. The places are the Destination's
 * own names and its jurisdictions' names, read off the records. A heading
 * that is not a place ("UBC - accept the offer") stays.
 */
function withoutPlaceHeading(label, places) {
  const text = String(label || '');
  const m = text.match(/^\s*([^—–:]+?)\s+[—–-]\s+(.+)$/) || text.match(/^\s*([^—–:]+?):\s+(.+)$/);
  if (!m) return text;
  return places.has(m[1].trim().toLowerCase()) ? m[2] : text;
}

/** Every name a Destination and its jurisdictions go by, lower case. */
function placeNames(site, dest) {
  const d = site.graph?.destinations?.get(dest);
  const c = (site.countries || []).find((x) => x.code === dest);
  return new Set(
    [d?.name, c?.name, c?.articleName, ...(d?.jurisdictions || []).map((j) => j.name)]
      .filter(Boolean)
      .map((n) => String(n).trim().toLowerCase())
  );
}

/**
 * The words many of a Destination's schools share ("applied", "sciences" in
 * Finland): a word in the names of three or more schools identifies none of
 * them, so it never names one on its own.
 */
function sharedWords(records) {
  const count = new Map();
  for (const r of records) {
    for (const w of new Set(namesOf(r).flatMap((n) => [...identityWords(n)]))) count.set(w, (count.get(w) || 0) + 1);
  }
  return new Set([...count].filter(([, n]) => n >= 3).map(([w]) => w));
}

/**
 * Whether every identifying word of a name is one of a page's names' words or
 * an initialism of them: "NYU Abu Dhabi" is New York University Abu Dhabi's
 * own. Lenient on purpose, because a publisher wrongly taken for another
 * institution would take the page's own dates off it.
 */
function spelledBy(name, page) {
  const words = identityWords(name);
  return Boolean(words.size) && namesOf(page).some((n) => nameMatch(name, n) >= words.size);
}

/** Every web host a record gives for itself (its website, admissions page, links), without "www.". */
function hostsOf(record) {
  const urls = [];
  const walk = (v) => {
    if (typeof v === 'string') { if (/^https?:\/\//.test(v)) urls.push(v); }
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk([record.website, record.admissionsUrl, record.links]);
  return urls.map(hostOf).filter(Boolean);
}
function hostOf(u) {
  try { return new URL(u).hostname.replace(/^www\./, '').toLowerCase(); } catch { return null; }
}
/* One host is the other's, or under it: studieren.univie.ac.at is univie.ac.at. */
const sameSite = (a, b) => a === b || a.endsWith(`.${b}`) || b.endsWith(`.${a}`);

/** A publisher's name without the unit or page after it: "ETH Zurich, Financial Aid Office" → "ETH Zurich". */
const baseName = (n) => String(n || '').split(/\s+[—–-]\s+|,\s|\s\(/)[0].trim();

/**
 * The Institutions a Destination's records name that have no page on the
 * site: the names a date gives in `institutionsWithoutPage`, and the
 * institutions that publish its evidence. A publisher that is one of the
 * school pages, or a unit of one ("PEAK — Programs in English at Komaba,
 * University of Tokyo"), or writes on its web site, is that page's, not
 * another institution.
 */
const pagelessCache = new WeakMap();
export function institutionsWithoutPages(site, dest, pages) {
  if (!pagelessCache.has(site)) pagelessCache.set(site, new Map());
  const cache = pagelessCache.get(site);
  if (cache.has(dest)) return cache.get(dest);
  const names = new Set();
  for (const e of siteEvents(site)) if (e.destination === dest) for (const n of e.institutionsWithoutPage || []) names.add(n);
  const destOf = (entity) => String(entity || '').split('-')[0];
  for (const ev of site.graph?.evidence?.values() || []) {
    if (ev.publisherType !== 'institution' || !ev.publisher) continue;
    if (!(ev.supports || []).some((s) => destOf(s.entity) === dest)) continue;
    const full = ev.publisher;
    /* The publisher is a page when it names or spells one, when its source is
       on a page's own web site ("Universität Wien" at univie.ac.at is the
       University of Vienna), or when the evidence is about a page or one of
       its programmes ("Erasmus School of Economics" for an EUR programme). */
    const host = hostOf(ev.sourceUrl);
    const about = (ev.supports || []).map((x) => x.entity);
    const ownerOf = (id) => site.graph?.opportunities?.get(id)?.institution || id;
    if (pages.some((p) =>
      coverage(full, p) >= 1 || coverage(baseName(full), p) >= 1 || spelledBy(baseName(full), p) ||
      (host && hostsOf(p).some((h) => sameSite(h, host))) ||
      about.some((id) => ownerOf(id) === p.id)
    )) continue;
    names.add(baseName(full));
  }
  const out = [...names]
    .filter((n) => identityWords(n).size && !pages.some((p) => coverage(n, p) >= 1))
    .map((name) => ({ id: `without-page:${name}`, name, withoutPage: true }));
  cache.set(dest, out);
  return out;
}

/** "<route>/<milestone>", the key `supersedes` names. */
const refOf = (e) => (e.routeId ? `${e.routeId}/${e.id}` : null);

/* --- A school record's own dates ----------------------------------------------- */

/**
 * What a kind of date in a school record (schemas/school.schema.json) costs to
 * miss. An application that closes and a document that is due are deadlines;
 * an opening, a test sitting, a decision and an open day are not.
 */
const KIND_CONSEQUENCE = { closes: 'hard', documents: 'hard' };

function fromSchoolDate(inst, d, i) {
  return {
    id: `${inst.id}-date-${i}`,
    destination: destinationCode(inst),
    routeId: null,
    label: d.label,
    date: d.date,
    endDate: null,
    timeOfDay: null,
    timeZone: null,
    consequence: KIND_CONSEQUENCE[d.kind] || 'indicative',
    audience: d.who || 'any',
    provisional: false,
    intake: null,
    note: null,
    supersedes: d.supersedes || null,
    kind: d.kind,
    sources: d.url ? [d.url] : [],
    evidence: [],
    access: null,
    origin: 'school',
  };
}

/* --- Selecting --------------------------------------------------------------- */

/**
 * Every dated event for a school, or for one programme at it, in date order.
 * `inst` is the page's Institution (a canonical record, or a country-profile
 * school with `id` set to its key); `programme`, when given, is the page's
 * Programme (with its `opportunityId`).
 */
export function datesFor(site, inst, { programme = null } = {}) {
  const graph = site.graph;
  if (!graph) return [];
  const dest = destinationCode(inst);
  const opps = [...(graph.opportunities?.values() || [])].filter((o) => o.institution === inst.id);
  const scoped = programme ? opps.filter((o) => o.id === (programme.opportunityId || programme.id)) : opps;
  const oppIds = new Set(scoped.map((o) => o.id));

  const routes = new Set(scoped.flatMap((o) => o.applicationRoutes || []));
  for (const r of graph.applicationRoutes?.values() || []) {
    if ((r.appliesTo || []).some((id) => oppIds.has(id))) routes.add(r.id);
  }
  /* A school with no programmes recorded one by one is applied to through its
     country's route, when the country has exactly one route open to all. */
  if (!opps.length) {
    const general = [...(graph.applicationRoutes?.values() || [])].filter(
      (r) => r.destination === dest && !(r.appliesTo || []).length && r.readerAccess?.state !== 'closed'
    );
    if (general.length === 1) routes.add(general[0].id);
  }

  /* Every school of the country: the canonical records, and the profile's
     schools that have no canonical twin. */
  const country = (site.countries || []).find((c) => c.code === dest);
  const siblings = [
    ...[...(graph.institutions?.values() || [])].filter((i) => i.destination === dest),
    ...(country?.institutions || [])
      .filter((i) => !i.canonicalId)
      .map((i) => ({ id: i.key, name: i.name, shortName: i.shortName, localName: i.localName, website: i.website, admissionsUrl: i.admissionsUrl })),
  ];
  const self = siblings.find((i) => i.id === inst.id) || inst;
  /* Every id this school's page answers to: its own, and the key of a
     profile school whose page is this canonical record's. */
  const selfIds = new Set([
    inst.id,
    inst.key,
    inst.canonicalId,
    ...(country?.institutions || []).filter((i) => i.canonicalId && i.canonicalId === inst.id).map((i) => i.key),
  ].filter(Boolean));
  const programmes = inst.programmes || [];
  /* The school's own name says nothing about which of its programmes a date is for. */
  const ownWords = new Set(namesOf(self).flatMap((n) => [...identityWords(n)]));
  const programmesNamed = (e) => namedIn(e.label, programmes, 0.5, ownWords);

  /* A date tied to schools by id is theirs and only theirs. One that is not
     falls back to its label: who it names, with a place heading taken off
     and the words most schools share ignored. */
  const places = placeNames(site, dest);
  const common = sharedWords(siblings);
  /* Every Institution a label can name: the school pages, and the ones the
     records name that have no page. */
  const candidates = [...siblings, ...institutionsWithoutPages(site, dest, siblings)];
  const who = (e) => withoutPlaceHeading(e.label, places);
  const tied = (e) => (e.institutions || []).length > 0;
  /* A date for Institutions with no page, and none with one, is on no school page. */
  const forPageless = (e) => !tied(e) && (e.institutionsWithoutPage || []).length > 0;
  const tiedToSelf = (e) => e.institutions.some((id) => selfIds.has(id));
  /* Whether a label names this school is asked alongside every other school
     of the country, so an initialism another school holds outright ("CUHK",
     "HKU") never names this one too. A page whose school is not among them
     is asked on its own. */
  const listed = siblings.includes(self);
  const namesSelfIn = (e, named = namedIn(who(e), candidates, 1, undefined, common)) =>
    tied(e) ? tiedToSelf(e) : listed ? named.includes(self) : coverage(who(e), inst, undefined, common) >= 1;
  /* A date only for numerus fixus programmes is not for a page whose every
     programme is recorded as not numerus fixus (a programme's own page, or a
     school whose programmes are all open). */
  const noFixus = scoped.length > 0 && scoped.every((o) => o.admission?.numerusFixus === false);
  const national = siteEvents(site).filter((e) => {
    if (e.destination !== dest || !isActionable(e) || isForEarlierEntry(e, CYCLE_YEAR)) return false;
    if (e.numerusFixusOnly && noFixus) return false;
    if (tied(e)) {
      if (!tiedToSelf(e)) return false;
      if (programme) {
        const progs = programmesNamed(e);
        if (progs.length && !progs.some((p) => p.id === programme.id)) return false;
      }
      return true;
    }
    if (forPageless(e)) return false;
    const named = namedIn(who(e), candidates, 1, undefined, common);
    const namesSelf = namesSelfIn(e, named);
    /* Its routes' dates, and any date that names it. */
    if (!namesSelf && !(e.routeId && routes.has(e.routeId))) return false;
    /* Another Institution named, with a page or without, and not this one:
       theirs, never a guess at this school's. A rule several schools share
       says whose it is with `institutions`. */
    if (named.length && !namesSelf) return false;
    if (programme) {
      const progs = programmesNamed(e);
      if (progs.length && !progs.some((p) => p.id === programme.id)) return false;
    }
    return true;
  });

  const own = programme ? [] : (inst.school?.dates || []).map((d, i) => fromSchoolDate(inst, d, i));
  const mine = restated(national, own, namesSelfIn);

  /* A school's own date for a step replaces the general one. On a school's
     page only a date for the whole school does; a date naming one programme
     replaces it on that programme's page (the others are already gone). */
  const superseded = new Set(
    mine.filter((e) => e.supersedes && (programme || !programmesNamed(e).length)).map((e) => e.supersedes)
  );
  const kept = mine.filter((e) => !superseded.has(refOf(e)));

  return condense(kept).sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
}

/**
 * A school record that says when its application opens or closes is restating
 * the route's window when the days match: Arcada's "Joint application closes"
 * on 21 January is the national 7-21 January window, once more. The school's
 * own lines are kept (they carry its source), the window is dropped, and the
 * window's note joins the school's closing date.
 *
 * Likewise a route date that names this school on a day its own record also
 * dates: "Official final IB grades (Jyväskylä's date)" on the national route
 * is Jyväskylä's own 13 July, which its record states in its own words.
 */
function restated(national, own, namesSelf) {
  if (!own.length) return national;
  const opens = new Set(own.filter((d) => d.kind === 'opens').map((d) => d.date));
  const closes = new Map(own.filter((d) => d.kind === 'closes').map((d) => [d.date, d]));
  const onDay = new Map(own.map((d) => [d.date, d]));
  const out = [];
  for (const e of national) {
    /* A route's window, or a window that names this school. */
    const window = e.endDate && e.endDate !== e.date && (e.routeId || namesSelf(e));
    if (window && (opens.has(e.date) || closes.has(e.endDate))) {
      const close = closes.get(e.endDate);
      if (close) close.note = close.note || e.note;
      continue;
    }
    const twin = !e.endDate && onDay.get(e.date);
    if (twin && namesSelf(e)) {
      twin.note = twin.note || e.note;
      twin.provisional = twin.provisional || e.provisional;
      continue;
    }
    out.push(e);
  }
  return [...out, ...own];
}

/**
 * On one school's list, a national date and the school's own statement of it
 * are one line: "Numerus fixus applications close" from the national route and
 * "International Business numerus fixus application closes" from the school's
 * are the same day and the same deadline. The one that names more is kept, with
 * the other's notes and sources.
 */
function condense(events) {
  const out = [...events];
  for (let i = 0; i < out.length; i++) {
    for (let j = 0; j < out.length; j++) {
      const a = out[i];
      const b = out[j];
      if (!a || !b || i === j || !a.date || a.date !== b.date || (a.endDate || null) !== (b.endDate || null)) continue;
      if (eventKind(a) !== eventKind(b)) continue;
      const wa = identityWords(a.label);
      const wb = identityWords(b.label);
      if (!wa.size || wa.size >= wb.size || ![...wa].every((w) => wb.has(w))) continue;
      out[j] = mergeTwins(b, a);
      out[i] = null;
      break;
    }
  }
  return out.filter(Boolean);
}

/** Sessions for a school, or for one programme at it, one entry per date. */
export function sessionsFor(site, inst, { programme = null } = {}) {
  const list = site.sessions?.get(inst.id) || [];
  const programmeId = programme?.programmeId || programme?.id;
  return list
    .filter((s) => !programme || !(s.programmes || []).length || s.programmes.includes(programmeId))
    .flatMap((s) => (s.dates || []).map((d) => ({ ...s, ...d })))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * The order a school's dates are read in: every binding deadline first, by
 * date, because those are the dates a student came for, then everything else
 * by date. Opening days and steps to set yourself come earlier in the year
 * and used to take the visible slots while a second deadline waited behind
 * the fold (SDU's uniTEST behind "Optagelse.dk opens"). dates-panel.js keeps
 * this order as dates pass.
 */
export function leadOrder(events) {
  return [...events.filter(isBinding), ...events.filter((e) => !isBinding(e))];
}

/**
 * The short list and the rest: the first `n` in lead order show, and the rest
 * wait behind the disclosure in date order, where a student looking for one
 * date looks for it.
 */
export function splitPanel(events, n) {
  const head = leadOrder(events).slice(0, n);
  return { head, rest: events.filter((e) => !head.includes(e)) };
}

/** A Destination as a sentence names it: "the Netherlands", "Denmark". */
function countryLabel(site, code) {
  const c = (site.countries || []).find((x) => x.code === code);
  const d = site.graph?.destinations?.get(code) || (site.destinations || []).find((x) => x.code === code);
  return c?.articleName || c?.name || d?.articleName || d?.name || null;
}

/* --- Rendering ----------------------------------------------------------------- */

function sourceOf(site, e) {
  if (e.sources?.length) return e.sources[0];
  for (const id of e.evidence || []) {
    const ev = site.graph?.evidence?.get(id);
    if (ev?.sourceUrl) return ev.sourceUrl;
  }
  return site.graph?.applicationRoutes?.get(e.routeId)?.portalUrl || null;
}

const endOf = (e) => e.endDate || e.date;

/**
 * One date: the day, what it is, and one compact row under it with what
 * missing it costs, the note behind a disclosure and the source. On a phone
 * that is three short lines, about 90 px, where it was five.
 */
function dateItem(site, e) {
  const c = consequenceOf(e);
  const src = sourceOf(site, e);
  /* The whole note, behind its disclosure: opening a detail shows all of it. */
  const paras = String(e.note || '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const badge = e.consequence && e.consequence !== 'indicative'
    ? html`<span class="timeline__badge" data-consequence="${e.consequence}">${c.label}</span>`
    : '';
  return html`<li class="dates-panel__item" data-date="${e.date}"${raw(e.endDate ? ` data-end="${e.endDate}"` : '')}${raw(isBinding(e) ? ' data-binding="true"' : '')}${raw(e.provisional ? ' data-provisional="true"' : '')}>
    <p class="dates-panel__when">${formatWhen(e)}${e.provisional ? html` <span class="dates-panel__prov">· provisional</span>` : ''}</p>
    <p class="dates-panel__what">${e.label}</p>
    ${badge || paras.length || src
      ? html`<div class="dates-panel__foot">${badge}${
          /* The note is the same on every school in a country, so it waits
             behind a disclosure rather than repeating as prose on every page. */
          paras.length
            ? html`<details class="dates-panel__why"><summary>Note</summary>${paras.map((p) => html`<p class="dates-panel__note">${p}</p>`)}</details>`
            : ''}${src ? html`<a class="dates-panel__src" href="${src}" rel="noopener nofollow" aria-label="Source for ${e.label}">Source</a>` : ''}</div>`
      : ''}
  </li>`;
}

const SESSION_KIND = {
  'open-day': 'Open day',
  'info-session': 'Information session',
  webinar: 'Webinar',
  'campus-tour': 'Campus tour',
  'trial-lecture': 'Trial lecture',
  fair: 'Fair',
  'q-and-a': 'Q&A',
  other: 'Session',
};
const FORMAT = { online: 'Online', 'in-person': 'In person', hybrid: 'In person and online' };

function sessionItem(s) {
  const where = s.format === 'online' ? FORMAT.online : [FORMAT[s.format], s.place].filter(Boolean).join(', ');
  return html`<li class="dates-panel__item" data-date="${s.date}"${s.endDate ? raw(` data-end="${s.endDate}"`) : ''}>
    <p class="dates-panel__when">${formatWhen(s)}</p>
    <p class="dates-panel__what"><a href="${s.url}" rel="noopener nofollow">${s.title}</a></p>
    <p class="dates-panel__meta">${SESSION_KIND[s.kind] || SESSION_KIND.other} · ${where}${s.registration === 'required' ? ' · sign-up needed' : ''}</p>
    <div class="dates-panel__foot">${s.audienceNote || s.note ? html`<details class="dates-panel__why"><summary>Note</summary><p class="dates-panel__note">${s.audienceNote || s.note}</p></details>` : ''}<a class="dates-panel__src" href="${s.source}" rel="noopener nofollow" aria-label="Source for ${s.title}">Source</a></div>
  </li>`;
}

/**
 * The school's dates panel: "Deadlines", or "Deadlines & sessions" where it
 * has sessions to list. Past dates are left out at build time and again in
 * the browser (`dates-panel.js`), because a page can sit in a tab for a week;
 * every binding deadline leads, then the next few dates, and the rest are one
 * tap away.
 *
 * `countryName`, when given, keeps the panel on a page whose school has no
 * dates of its own yet: one line into that country's dates, never a sentence
 * saying there are none. The link reads "Every date in <country>" on every
 * page, the country named from its record when the caller does not say.
 */
export function datesPanel(site, inst, { programme = null, today = new Date().toISOString().slice(0, 10), id = 'dates', countryName = null } = {}) {
  const events = datesFor(site, inst, { programme }).filter((e) => e.date && endOf(e) >= today);
  const sessions = sessionsFor(site, inst, { programme }).filter((s) => endOf(s) >= today);
  const calendarLink = `/timeline/?destinations=${destinationCode(inst)}`;
  const where = countryName || countryLabel(site, destinationCode(inst)) || 'this country';
  const everyDate = html`<p class="dates-panel__more"><a href="${url(calendarLink)}">Every date in ${where}</a></p>`;
  if (!events.length && !sessions.length) {
    return countryName
      ? html`<section class="dates-panel" id="${id}" aria-labelledby="${id}-title">
          <h2 class="dates-panel__title" id="${id}-title">Deadlines</h2>
          ${everyDate}
        </section>`
      : '';
  }

  const { head: first, rest } = splitPanel(events, PANEL_FIRST);
  const whose = programme ? 'this programme' : 'this school';
  /* No sessions recorded: the panel is named for what it holds. */
  const title = sessions.length ? 'Deadlines & sessions' : 'Deadlines';

  return html`<section class="dates-panel" id="${id}" aria-labelledby="${id}-title" data-dates-panel data-first="${PANEL_FIRST}" data-first-narrow="${PANEL_FIRST_NARROW}">
    <h2 class="dates-panel__title" id="${id}-title">${title}</h2>
    ${events.length
      ? html`<ol class="dates-panel__list" data-dates-head>${first.map((e) => dateItem(site, e))}</ol>
          ${rest.length
            ? html`<details class="dates-panel__all">
                <summary>All dates for ${whose} <span data-dates-rest-n>(${rest.length} more)</span></summary>
                <ol class="dates-panel__list" data-dates-rest>${rest.map((e) => dateItem(site, e))}</ol>
              </details>`
            : ''}`
      : html`<p class="dates-panel__empty">No upcoming deadlines recorded for ${whose}.</p>`}
    ${sessions.length
      ? html`<h3 class="dates-panel__sub">Upcoming sessions</h3>
          <ol class="dates-panel__list" data-sessions>${sessions.map(sessionItem)}</ol>`
      : ''}
    ${everyDate}
  </section>`;
}
