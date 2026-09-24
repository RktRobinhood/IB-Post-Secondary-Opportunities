import { html, plural } from '../lib/html.mjs';
import { page, SITE } from '../lib/layout.mjs';
import { hero, note, stats, topic } from '../lib/components.mjs';
import { deadlineList } from '../lib/primitives.mjs';
import { allEvents, isActionable, isClosed } from '../lib/calendar.mjs';

/* The application calendar. */

/* --- The calendar ----------------------------------------------------------- */

/**
 * Every dated event on the site, scoped by default to what the student is
 * actually interested in.
 *
 * This page used to hold a hard-coded array of eighteen events. Two things were
 * wrong with that, and the second is the worse one (#13).
 *
 * It was **not derived from the data**. Every country record already carried
 * `application.deadlines[]`, the country pages already rendered them, and this
 * page duplicated a hand-picked subset of the same facts in a second place with
 * no source field and no Verification State. It could drift from the country
 * pages and nothing would catch it. It now reads the same model they do, so a
 * date can only be wrong in one place.
 *
 * And it was **shown in full to everyone**. For a student looking at Denmark
 * and the Netherlands, eleven of the eighteen entries were noise; for a student
 * who had chosen nothing, all of it was. A combined calendar is the right thing
 * to have and the wrong thing to make the only view.
 *
 * ## Why the scoping happens in the browser
 *
 * Every event is rendered into the page and the browser hides what is out of
 * scope. That is the opposite of what a server would normally do, and it is
 * deliberate: the signals that decide the scope — the Exploration List, the
 * compare selection, the Student Profile — live in `localStorage` and are never
 * sent anywhere, which is the promise the subject checker makes in as many
 * words. A server that scoped this page would have to be told what a student is
 * interested in.
 *
 * It also means the no-JavaScript fallback is the *complete* calendar rather
 * than an empty one. A student without JavaScript sees more than they need,
 * which is a far better failure than seeing nothing.
 */
export function timeline(site) {
  const events = allEvents(site);
  /* A route the reader cannot take is listed on its own, after both groups a
     student acts on, never sorted among them (#35). */
  const dated = events.filter((e) => e.date && isActionable(e));
  const undated = events.filter((e) => !e.date && isActionable(e));
  const closed = events.filter(isClosed);

  /* Destinations that actually have something on the calendar, so the scope
     picker never offers a country with nothing to show. */
  const represented = [...new Set(events.map((e) => e.destination))]
    .map((code) => site.destinations.find((d) => d.code === code))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));

  const withDates = new Set(dated.map((e) => e.destination)).size;

  const body = html`
${hero({
  variant: 'plain',
  eyebrow: SITE.cycle.label,
  title: 'The calendar',
  lede: 'Every deadline, in order. Some close before you have predicted grades.',
})}

<section class="section">
  <div class="wrap">
    <div class="layout-aside">
      <div class="prose">

        <div class="scope" id="cal-scope" hidden>
          <p class="scope__state" id="cal-scope-state" role="status"></p>
          <div class="scope__actions">
            <button type="button" class="btn btn--ghost btn--sm" id="cal-show-all">Show every deadline</button>
            <button type="button" class="btn btn--ghost btn--sm" id="cal-show-mine" hidden>Back to mine</button>
            <button type="button" class="btn btn--ghost btn--sm" id="cal-share" hidden>Copy a link to this view</button>
          </div>
          <details class="scope__pick">
            <summary>Choose which destinations to show</summary>
            <div class="scope__grid">
              ${represented.map(
                (c) => html`<label class="scope__opt">
                  <input type="checkbox" name="scope" value="${c.code}" data-sentence-name="${c.articleName || c.name}"> <span>${c.flag} ${c.name}</span>
                </label>`
              )}
            </div>
          </details>
        </div>

        <noscript>
          <p class="state state--empty">This calendar normally shows only the destinations you are looking at.
          That needs JavaScript, because which destinations those are is kept in your browser and is never sent
          anywhere. Without it you get the complete calendar below — more than you need, rather than less.</p>
        </noscript>

        ${deadlineList(dated, { showDestination: true })}

        ${/* Both of these are real answers — "there is no date" is something a
              student can act on, and a blank is not — but they are not what a
              student opened a calendar for. Named, counted, and one tap away. */ ''}
        ${undated.length
          ? topic({
              id: 'undated',
              title: `${plural(undated.length, 'date')} we could not pin down`,
              short: 'Looked for and not published, or set by each institution rather than centrally.',
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
      </div>

      <aside class="layout-aside__side stack">
        ${note(
          `**Provisional** means carried over from last cycle because the authority has not republished it.
          Treat it as a warning to check, not as a date.`,
          { kind: 'warn', title: 'Provisional dates' }
        )}
        ${stats([
          { value: dated.length, label: 'Dated events' },
          { value: withDates, label: 'Destinations with dates' },
        ])}
      </aside>
    </div>
  </div>
</section>`;

  return page({
    title: 'Application calendar',
    description:
      'Every university application deadline for IB students finishing in May 2027, scoped to the destinations you are looking at — in order, from autumn 2026 to results day.',
    path: '/timeline/',
    section: '/timeline/',
    body,
    scripts: ['calendar.js'],
  });
}
