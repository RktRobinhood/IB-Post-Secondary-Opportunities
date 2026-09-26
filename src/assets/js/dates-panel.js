/* The "Deadlines" panel on a school's or a programme's page
 * (src/lib/school-dates.mjs), kept current in the browser.
 *
 * The page is built with every date that was still ahead on the day it was
 * built. A page can then sit in a tab, or in a cache, for weeks, so here any
 * date whose day (or whose window's last day) has passed is removed and the
 * short list is laid out again in the build's order: every binding deadline
 * first (a hard deadline, or an equal-consideration date, and not one only for
 * applicants who already hold the Diploma: `data-binding`), by day, then the
 * other dates by day; the rest wait behind the disclosure in date order, with
 * its count redone.
 * With this script blocked a student sees the build's list, which errs on the
 * side of one date too many.
 */
const today = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
})();
const isPast = (li) => (li.dataset.end || li.dataset.date || '9999') < today;

for (const panel of document.querySelectorAll('[data-dates-panel]')) {
  /* How many dates show before the disclosure: on a phone, where the panel
     comes before the page's own content, and beside it on a wide screen
     (the build says how many; each date is three short lines). */
  const narrow = window.matchMedia('(max-width: 61.99rem)').matches;
  const first = narrow ? Number(panel.dataset.firstNarrow) || 3 : Number(panel.dataset.first) || 3;
  const head = panel.querySelector('[data-dates-head]');
  const rest = panel.querySelector('[data-dates-rest]');
  const sessions = panel.querySelector('[data-sessions]');

  for (const li of panel.querySelectorAll('li[data-date]')) if (isPast(li)) li.remove();

  if (head) {
    /* Date order (stable, so same-day dates keep the build's order), then the
       next binding deadline lifted to the top. */
    const items = [...head.children, ...(rest ? [...rest.children] : [])].sort((a, b) =>
      a.dataset.date.localeCompare(b.dataset.date)
    );
    const binding = (li) => li.dataset.binding === 'true';
    const holders = (li) => li.dataset.diplomaHolders === 'true';
    /* Binding deadlines, then the other dates, then the dates only for
       Diploma holders; where the panel opens on a status line, those wait
       under "All dates" whatever else there is. */
    const behind = panel.dataset.holdersBehind === 'true';
    const ordered = [
      ...items.filter(binding),
      ...items.filter((li) => !binding(li) && !holders(li)),
      ...(behind ? [] : items.filter((li) => !binding(li) && holders(li))),
    ];
    /* With no disclosure to hold the rest (three dates or fewer), all stay. */
    const shown = ordered.slice(0, rest ? first : ordered.length);
    head.replaceChildren(...shown);
    if (rest) {
      rest.replaceChildren(...items.filter((li) => !shown.includes(li)));
      const n = rest.children.length;
      const all = rest.closest('details');
      if (!n) all?.remove();
      else {
        const count = all?.querySelector('[data-dates-rest-n]');
        if (count) count.textContent = `(${n} more)`;
      }
    }
  }
  if (sessions && !sessions.children.length) {
    sessions.previousElementSibling?.remove();
    sessions.remove();
    /* No sessions left: the panel is named for what it still holds. */
    const title = panel.querySelector('.dates-panel__title');
    if (title) title.textContent = 'Deadlines';
  }
  if (head && !head.children.length && panel.dataset.holdersBehind === 'true') head.remove();
  else if (head && !head.children.length) {
    const p = document.createElement('p');
    p.className = 'dates-panel__empty';
    p.textContent = 'No upcoming deadlines recorded here.';
    head.replaceWith(p);
  }
}
