import { html, raw, plural } from '../lib/html.mjs';
import { page, SITE } from '../lib/layout.mjs';
import { hero, note, stats, topic } from '../lib/components.mjs';
import { deadlineList } from '../lib/primitives.mjs';
import { allEvents, isActionable, isClosed, isForEarlierEntry, standing } from '../lib/calendar.mjs';

/* The application calendar. */

/**
 * Every dated event on the site, opening on the next few that apply to the
 * student.
 *
 * This page used to hold a hard-coded array of eighteen events (#13), and then
 * every event on the site, oldest first: 541 rows, 158 phone screens, and the
 * first thing below the scope box a date that had already passed. Each row was
 * short; the page was a list with no default. A student opens a calendar for
 * the next few dates that apply to them, so that is what it opens on:
 *
 *   1. which countries (chips with counts, preselected from the Exploration
 *      List or the compare tray);
 *   2. a month strip — how the dates fall across the year, one tap to a month;
 *   3. **the next ten** upcoming dates in scope;
 *   4. every upcoming date, grouped by month, one tap away;
 *   5. dates already past, one tap away and never before an upcoming one;
 *   6. the undated and the closed, as before;
 *   7. last year's dates, kept as the pattern for this year's where this
 *      year's are not out, counted and one tap away, never among the dates
 *      ahead (a Portuguese 2026-entry result is not a date to act on).
 *
 * In the browser the page is filter-first: until a country is chosen it shows
 * the chips and one line asking for a choice, never one list of every
 * country's dates (`calendar.js`).
 *
 * Nothing is dropped: every event on the site is still on this page, and the
 * no-JavaScript view is complete, one tap from the default.
 *
 * ## Why the scoping happens in the browser
 *
 * The signals that decide the scope — the Exploration List, the compare
 * selection, the Student Profile — live in `localStorage` and are never sent
 * anywhere, the promise the subject checker makes in as many words. A server
 * that scoped this page would have to be told what a student is interested in.
 * So the page ships every event, the server lays it out for "every country, as
 * of the build", and `calendar.js` re-lays it for the reader's scope and the
 * reader's today — a page can sit in a browser tab for a week.
 */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthOf = (iso) => iso.slice(0, 7);
const monthName = (key) => `${MONTHS[Number(key.slice(5, 7)) - 1]} ${key.slice(0, 4)}`;

/** How many dates the page opens on. */
export const NEXT_UP = 10;

/** The entry year the site is built for ("Autumn 2027" → 2027). */
const CYCLE_YEAR = Number(String(SITE.cycle.intake).match(/\d{4}/)?.[0]) || null;

export function timeline(site, { today = new Date().toISOString().slice(0, 10) } = {}) {
  const events = allEvents(site);
  /* A route the reader cannot take is listed on its own, after both groups a
     student acts on, never sorted among them (#35). */
  const dated = events.filter((e) => e.date && isActionable(e) && !isForEarlierEntry(e, CYCLE_YEAR));
  const earlier = events.filter((e) => e.date && isActionable(e) && isForEarlierEntry(e, CYCLE_YEAR));
  const undated = events.filter((e) => !e.date && isActionable(e));
  const closed = events.filter(isClosed);

  /* Past means over: a window that opened last week and closes next week is
     still something to act on. */
  const past = dated.filter((e) => standing(e, today) === 'past');
  const upcoming = dated.filter((e) => standing(e, today) !== 'past');

  /* Destinations that actually have something on the calendar, so the scope
     chips never offer a country with nothing to show. The count on each chip is
     its upcoming dates, which is what a student is choosing between. */
  const upcomingBy = new Map();
  for (const e of upcoming) upcomingBy.set(e.destination, (upcomingBy.get(e.destination) || 0) + 1);
  const represented = [...new Set(events.map((e) => e.destination))]
    .map((code) => site.destinations.find((d) => d.code === code))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));

  /* Months from this one to the last with a date in it, including any with
     none — a gap in the strip is information. */
  const byMonth = new Map();
  for (const e of upcoming) {
    const k = monthOf(e.date < today ? today : e.date);
    if (!byMonth.has(k)) byMonth.set(k, []);
    byMonth.get(k).push(e);
  }
  const months = [];
  if (upcoming.length) {
    const last = [...byMonth.keys()].sort().at(-1);
    for (let y = Number(today.slice(0, 4)), m = Number(today.slice(5, 7)); ; ) {
      const k = `${y}-${String(m).padStart(2, '0')}`;
      months.push(k);
      if (k >= last) break;
      if (++m > 12) (m = 1), y++;
    }
  }
  const busiest = Math.max(1, ...[...byMonth.values()].map((l) => l.length));

  const body = html`
${hero({
  variant: 'plain',
  eyebrow: SITE.cycle.label,
  title: 'Deadlines',
  lede: 'The next dates that apply to you, in order. Some close before you have predicted grades.',
})}

<section class="section">
  <div class="wrap">
    <div class="layout-aside">
      <div class="prose">

        <div class="scope cal-scope" id="cal-scope" hidden>
          <p class="cal-scope__q" id="cal-scope-q">Which countries?</p>
          <div class="cal-chips" role="group" aria-labelledby="cal-scope-q">
            ${represented.map(
              (c) => html`<label class="chip cal-chip">
                <input type="checkbox" name="scope" value="${c.code}" data-sentence-name="${c.articleName || c.name}">
                <span>${c.flag} ${c.name}</span> <span class="chip__count" data-count-for="${c.code}">${upcomingBy.get(c.code) || 0}</span>
              </label>`
            )}
          </div>
          <p class="scope__state" id="cal-scope-state" role="status"></p>
          <div class="scope__actions">
            <button type="button" class="btn btn--ghost btn--sm" id="cal-show-all" hidden>Clear</button>
            <button type="button" class="btn btn--ghost btn--sm" id="cal-show-mine" hidden>Back to mine</button>
            <button type="button" class="btn btn--ghost btn--sm" id="cal-share" hidden>Copy a link to this view</button>
          </div>
        </div>

        ${months.length
          ? html`<div class="cal-months" aria-label="Upcoming dates by month">
              <ol>
                ${months.map((k) => {
                  const n = byMonth.get(k)?.length || 0;
                  return html`<li${k === monthOf(today) ? raw(' class="is-now"') : ''}>
                    <a href="#m-${k}" data-month="${k}" aria-label="${monthName(k)}: ${plural(n, 'date')}">
                      <span class="cal-months__bar"><span style="--h:${(n / busiest).toFixed(3)}"></span></span>
                      <span class="cal-months__m">${MONTHS[Number(k.slice(5, 7)) - 1].slice(0, 3)}</span>
                      <span class="cal-months__n" data-month-count="${k}">${n}</span>
                    </a>
                  </li>`;
                })}
              </ol>
            </div>`
          : ''}

        <div id="cal-next-wrap">
        <h2 id="next" class="cal-next__title">Next up <span class="cal-next__count" id="cal-next-count">${Math.min(NEXT_UP, upcoming.length)} of ${upcoming.length}</span></h2>
        ${/* The server's "next ten" is every country as of the build. With
              JavaScript, calendar.js rebuilds this list from the full one below,
              for the reader's countries and the reader's today. */ ''}
        <div id="cal-next">${deadlineList(upcoming.slice(0, NEXT_UP), {
          showDestination: true,
          emptyText: 'Nothing left on the calendar this cycle.',
        })}</div>
        </div>

        <details class="cal-group" id="cal-all">
          <summary>Every upcoming date <span class="cal-group__n" id="cal-all-n">(${upcoming.length})</span></summary>
          ${[...byMonth.keys()].sort().map(
            (k) => html`<h3 class="cal-month" id="m-${k}">${monthName(k)}</h3>
              ${deadlineList(byMonth.get(k), { showDestination: true })}`
          )}
        </details>

        ${past.length
          ? html`<details class="cal-group" id="cal-past">
              <summary>Earlier this cycle <span class="cal-group__n" id="cal-past-n">(${past.length})</span></summary>
              ${deadlineList(past, { showDestination: true })}
            </details>`
          : ''}

        ${earlier.length
          ? html`<details class="cal-group" id="cal-earlier">
              <summary>Last year's dates, kept as a pattern <span class="cal-group__n" id="cal-earlier-n">(${earlier.length})</span></summary>
              ${deadlineList(earlier, { showDestination: true })}
            </details>`
          : ''}

        ${/* Both of these are real answers — "there is no date" is something a
              student can act on, and a blank is not — but they are not what a
              student opened a calendar for. Named, counted, and one tap away. */ ''}
        ${undated.length
          ? topic({
              id: 'undated',
              title: `${plural(undated.length, 'date')} with no published day`,
              short: 'Not published yet, or set by each institution rather than centrally.',
              body: deadlineList(undated, { showDestination: true }),
              more: `Show all ${undated.length}`,
            })
          : ''}

        ${closed.length
          ? topic({
              id: 'closed',
              title: 'Not open to you',
              short: 'Routes you may have heard of that are closed to you — each one says why.',
              body: deadlineList(closed, { showDestination: true }),
              more: 'Which ones',
            })
          : ''}

        <noscript>
          <p class="state state--empty">Choosing your countries needs JavaScript, because that choice stays in
          your browser. Without it you get every country: more than you need, rather than less.</p>
        </noscript>
      </div>

      <aside class="layout-aside__side stack">
        ${note(
          `**Provisional** means carried over from last cycle because the authority has not republished it.
          Treat it as a warning to check, not as a date.`,
          { kind: 'warn', title: 'Provisional dates' }
        )}
        ${stats([
          { value: upcoming.length, label: 'Upcoming dates' },
          { value: upcomingBy.size, label: 'Countries with dates ahead' },
        ])}
      </aside>
    </div>
  </div>
</section>`;

  return page({
    title: 'Deadlines',
    description:
      'University application deadlines for IB students finishing in May 2027: the next dates for the countries you choose, then every date to results day.',
    path: '/timeline/',
    section: '/timeline/',
    body,
    scripts: ['calendar.js'],
  });
}
