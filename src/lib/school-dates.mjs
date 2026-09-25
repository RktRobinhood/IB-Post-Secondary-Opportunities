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
 *     close" on one route). A date whose label names one other Institution of
 *     the same Destination, and not this one, is that Institution's. A date
 *     that names several ("Oxford, Cambridge, medicine … close") is a rule
 *     shared across them, and stays.
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
 *     closes") is shown on that programme's page and not on its siblings'.
 */
import { html, raw } from './html.mjs';
import { url, SITE } from './layout.mjs';
import {
  allEvents, consequenceOf, eventKind, formatWhen, identityWords, isActionable, isForEarlierEntry, mergeTwins, nameMatch, sortKey,
} from './calendar.mjs';

/** How many dates show before the disclosure, on a wide screen and on a phone. */
export const PANEL_FIRST = 3;
export const PANEL_FIRST_NARROW = 2;

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
function coverage(label, record, ignore) {
  return strengthOf(label, record, ignore).c;
}

/**
 * `c`, the share of a record's identifying words a label contains; `s`, how
 * many words that took; `words`, which words of the label it took (an
 * initialism takes one of its own). Of two names a label covers completely,
 * the one it spells out further wins.
 */
function strengthOf(label, record, ignore = new Set()) {
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
    better(shared.size / words.size, shared.size, shared);
    /* An initialism in the label for a name written out in the record: the
       match counts one more than the words the two share (ignored words
       included, or a shared "Maastricht" reads as an initialism). */
    const sharedAll = [...identityWords(n)].filter((w) => have.has(w)).length;
    if (n.split(/\s+/).length > 1 && nameMatch(label, n) > sharedAll) better(1, shared.size + 1, new Set([...shared, `#${n}`]));
  }
  return best;
}

/**
 * The records a label is about: those it names most completely, if any. A
 * record whose every matched word is already taken by a name the label spells
 * out further is not named: "TU Delft …" names TU Delft and not TU/e, whose
 * "TU" it shares; "Oxford, Cambridge, medicine …" names both universities.
 */
function namedIn(label, records, threshold = 1, ignore) {
  const scored = records.map((r) => ({ r, ...strengthOf(label, r, ignore) })).filter((x) => x.c >= threshold);
  if (!scored.length) return [];
  const top = Math.max(...scored.map((x) => x.c));
  const taken = new Set();
  const out = [];
  for (const x of scored.filter((x) => x.c === top).sort((a, b) => b.s - a.s)) {
    if (x.words.size && [...x.words].every((w) => taken.has(w))) continue;
    for (const w of x.words) taken.add(w);
    out.push(x.r);
  }
  return out;
}

/** A page's Institution carries its Destination as an object; a record, as an id. */
const destinationCode = (inst) => inst.destination?.code || inst.destination;

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
      .map((i) => ({ id: i.key, name: i.name, shortName: i.shortName, localName: i.localName })),
  ];
  const self = siblings.find((i) => i.id === inst.id) || inst;
  const programmes = inst.programmes || [];
  /* The school's own name says nothing about which of its programmes a date is for. */
  const ownWords = new Set(namesOf(self).flatMap((n) => [...identityWords(n)]));
  const programmesNamed = (e) => namedIn(e.label, programmes, 0.5, ownWords);

  const namesSelfIn = (e, named = namedIn(e.label, siblings)) => named.includes(self) || coverage(e.label, inst) >= 1;
  const national = siteEvents(site).filter((e) => {
    if (e.destination !== dest || !isActionable(e) || isForEarlierEntry(e, CYCLE_YEAR)) return false;
    const named = namedIn(e.label, siblings);
    const namesSelf = namesSelfIn(e, named);
    /* Its routes' dates, and any date that names it. */
    if (!namesSelf && !(e.routeId && routes.has(e.routeId))) return false;
    /* One other school named, and not this one: that school's date. */
    if (named.length === 1 && !namesSelf) return false;
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
    const window = e.routeId && e.endDate && e.endDate !== e.date;
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
 * The order a school's dates are read in: the next binding deadline first,
 * because that is the date a student came for, then everything else by date.
 * Opening days and steps to set yourself come earlier in the year and used to
 * push the deadline behind the fold (dates-panel.js keeps this order as dates
 * pass).
 */
export function leadOrder(events) {
  const lead = events.find(isBinding);
  return lead ? [lead, ...events.filter((e) => e !== lead)] : events;
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

function dateItem(site, e) {
  const c = consequenceOf(e);
  const src = sourceOf(site, e);
  /* The whole note, behind its disclosure: opening a detail shows all of it. */
  const paras = String(e.note || '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return html`<li class="dates-panel__item" data-date="${e.date}"${raw(e.endDate ? ` data-end="${e.endDate}"` : '')}${raw(isBinding(e) ? ' data-binding="true"' : '')}${raw(e.provisional ? ' data-provisional="true"' : '')}>
    <p class="dates-panel__when">${formatWhen(e)}${e.provisional ? html` <span class="dates-panel__prov">· provisional</span>` : ''}</p>
    <p class="dates-panel__what">${e.label}</p>
    ${e.consequence && e.consequence !== 'indicative'
      ? html`<p class="dates-panel__meta"><span class="timeline__badge" data-consequence="${e.consequence}">${c.label}</span></p>`
      : ''}
    ${/* The note is the same on every school in a country, so it waits
          behind a disclosure rather than repeating as prose on every page. */
      paras.length
        ? html`<details class="dates-panel__why"><summary>Note</summary>${paras.map((p) => html`<p class="dates-panel__note">${p}</p>`)}</details>`
        : ''}
    ${src ? html`<p class="dates-panel__src"><a href="${src}" rel="noopener nofollow" aria-label="Source for ${e.label}">Source</a></p>` : ''}
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
    ${s.audienceNote || s.note ? html`<details class="dates-panel__why"><summary>Note</summary><p class="dates-panel__note">${s.audienceNote || s.note}</p></details>` : ''}
    <p class="dates-panel__src"><a href="${s.source}" rel="noopener nofollow" aria-label="Source for ${s.title}">Source</a></p>
  </li>`;
}

/**
 * The "Deadlines & sessions" panel. Past dates are left out at build time and
 * again in the browser (`dates-panel.js`), because a page can sit in a tab for
 * a week; the next binding deadline leads, the next few dates follow, and the
 * rest are one tap away.
 *
 * `countryName`, when given, keeps the panel on a page whose school has no
 * dates of its own yet: one line into that country's dates, never a sentence
 * saying there are none.
 */
export function datesPanel(site, inst, { programme = null, today = new Date().toISOString().slice(0, 10), id = 'dates', countryName = null } = {}) {
  const events = leadOrder(datesFor(site, inst, { programme }).filter((e) => e.date && endOf(e) >= today));
  const sessions = sessionsFor(site, inst, { programme }).filter((s) => endOf(s) >= today);
  const calendarLink = `/timeline/?destinations=${destinationCode(inst)}`;
  if (!events.length && !sessions.length) {
    return countryName
      ? html`<section class="dates-panel" id="${id}" aria-labelledby="${id}-title">
          <h2 class="dates-panel__title" id="${id}-title">Deadlines &amp; sessions</h2>
          <p class="dates-panel__more"><a href="${url(calendarLink)}">Dates in ${countryName}</a></p>
        </section>`
      : '';
  }

  const first = events.slice(0, PANEL_FIRST);
  const rest = events.slice(PANEL_FIRST);
  const whose = programme ? 'this programme' : 'this school';

  return html`<section class="dates-panel" id="${id}" aria-labelledby="${id}-title" data-dates-panel data-first="${PANEL_FIRST}" data-first-narrow="${PANEL_FIRST_NARROW}">
    <h2 class="dates-panel__title" id="${id}-title">Deadlines &amp; sessions</h2>
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
    <p class="dates-panel__more"><a href="${url(calendarLink)}">Every date in ${countryName || 'this country'}</a></p>
  </section>`;
}
