/**
 * The dates that matter to one school, and to one programme at it.
 *
 * A combined list of every deadline in every country is too much to read. A
 * student starts caring about deadlines once they are interested in a school,
 * so each Institution page and each Programme page carries its own short list:
 * the next dates on the routes its programmes are applied through, then the
 * rest one tap away, then any open days and webinars.
 *
 * Which dates belong to a school is read off the records, never from a list of
 * names in code:
 *
 *   - **Its routes.** The Application Routes its Opportunities name, and the
 *     routes whose `appliesTo` names them.
 *   - **Not another school's dates.** A national route carries every member
 *     institution's dates ("UBC applications close" and "SFU applications
 *     close" on one route). A date whose label names a different Institution
 *     of the same Destination, and not this one, is that Institution's.
 *   - **Its own dates from the country profile.** A profile deadline with no
 *     route belongs here when it names this Institution.
 *   - **On a Programme page, not another programme's dates.** A date that names
 *     one of the school's programmes ("International Business numerus fixus
 *     closes") is shown on that programme's page and not on its siblings'.
 */
import { html, raw, firstSentence } from './html.mjs';
import { url } from './layout.mjs';
import { allEvents, consequenceOf, eventKind, formatWhen, identityWords, isActionable, mergeTwins, nameMatch } from './calendar.mjs';

/** How many dates show before the disclosure. */
export const PANEL_FIRST = 3;

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
function coverage(label, record, ignore = new Set()) {
  let best = 0;
  const have = identityWords(label);
  for (const n of namesOf(record)) {
    /* A name can be named by containment even when every word of it is
       generic or ignored ("University College Maastricht" on its own
       university's page), so that test comes first. */
    if (nameMatch(label, n) >= 99) return 1;
    const words = new Set([...identityWords(n)].filter((w) => !ignore.has(w)));
    if (!words.size) continue;
    let shared = 0;
    for (const w of words) if (have.has(w)) shared++;
    best = Math.max(best, shared / words.size);
    /* An initialism in the label for a name written out in the record. */
    if (n.split(/\s+/).length > 1 && nameMatch(label, n) > shared) best = Math.max(best, 1);
  }
  return best;
}

/** The records a label is about: those it names most completely, if any. */
function namedIn(label, records, threshold = 1, ignore) {
  const scored = records.map((r) => ({ r, c: coverage(label, r, ignore) })).filter((x) => x.c >= threshold);
  if (!scored.length) return [];
  const top = Math.max(...scored.map((x) => x.c));
  return scored.filter((x) => x.c === top).map((x) => x.r);
}

/** A page's Institution carries its Destination as an object; a record, as an id. */
const destinationCode = (inst) => inst.destination?.code || inst.destination;

/* --- Selecting --------------------------------------------------------------- */

/**
 * Every dated event for a school, or for one programme at it, in date order.
 * `inst` is the page's Institution; `programme`, when given, is the page's
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

  const siblings = [...(graph.institutions?.values() || [])].filter((i) => i.destination === dest);
  const self = siblings.find((i) => i.id === inst.id) || inst;
  const programmes = inst.programmes || [];
  /* The school's own name says nothing about which of its programmes a date is for. */
  const ownWords = new Set(namesOf(self).flatMap((n) => [...identityWords(n)]));

  const mine = siteEvents(site).filter((e) => {
    if (e.destination !== dest || !isActionable(e)) return false;
    const named = namedIn(e.label, siblings);
    const namesSelf = named.includes(self) || coverage(e.label, inst) >= 1;
    if (e.routeId ? !routes.has(e.routeId) : !namesSelf) return false;
    if (named.length && !namesSelf) return false;
    if (programme) {
      const progs = namedIn(e.label, programmes, 0.5, ownWords);
      if (progs.length && !progs.some((p) => p.id === programme.id)) return false;
    }
    return true;
  });
  return condense(mine);
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

/* --- Rendering ----------------------------------------------------------------- */

function sourceOf(site, e) {
  if (e.sources?.length) return e.sources[0];
  for (const id of e.evidence || []) {
    const ev = site.graph?.evidence?.get(id);
    if (ev?.sourceUrl) return ev.sourceUrl;
  }
  return site.graph?.applicationRoutes?.get(e.routeId)?.portalUrl || null;
}

const shortWhen = (e) => formatWhen(e);
const endOf = (e) => e.endDate || e.date;

function dateItem(site, e) {
  const c = consequenceOf(e);
  const src = sourceOf(site, e);
  const line = e.note ? firstSentence(e.note, 16) : null;
  return html`<li class="dates-panel__item" data-date="${e.date}"${e.endDate ? raw(` data-end="${e.endDate}"`) : ''}>
    <p class="dates-panel__when">${shortWhen(e)}</p>
    <p class="dates-panel__what">${e.label}</p>
    ${e.consequence && e.consequence !== 'indicative'
      ? html`<p class="dates-panel__meta"><span class="timeline__badge" data-consequence="${e.consequence}">${c.label}</span></p>`
      : ''}
    ${/* The note is the same on every school in a country, so it waits
          behind a disclosure rather than repeating as prose on every page. */
      line ? html`<details class="dates-panel__why"><summary>Note</summary><p class="dates-panel__note">${line}</p></details>` : ''}
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
 * a week; the first few upcoming dates show, the rest are one tap away.
 */
export function datesPanel(site, inst, { programme = null, today = new Date().toISOString().slice(0, 10), id = 'dates' } = {}) {
  const events = datesFor(site, inst, { programme }).filter((e) => e.date && endOf(e) >= today);
  const sessions = sessionsFor(site, inst, { programme }).filter((s) => endOf(s) >= today);
  if (!events.length && !sessions.length) return '';

  const first = events.slice(0, PANEL_FIRST);
  const rest = events.slice(PANEL_FIRST);
  const whose = programme ? 'this programme' : 'this school';
  const calendarLink = `/timeline/?destinations=${destinationCode(inst)}`;

  return html`<section class="dates-panel" id="${id}" aria-labelledby="${id}-title" data-dates-panel data-first="${PANEL_FIRST}" data-first-narrow="2">
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
    <p class="dates-panel__more"><a href="${url(calendarLink)}">Every date in this country</a></p>
  </section>`;
}
