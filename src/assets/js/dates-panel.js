/* The "Deadlines & sessions" panel on a school's or a programme's page
 * (src/lib/school-dates.mjs), kept current in the browser.
 *
 * The page is built with every date that was still ahead on the day it was
 * built. A page can then sit in a tab, or in a cache, for weeks, so here any
 * date whose day (or whose window's last day) has passed is removed, the first
 * few that remain move up into the short list, and the disclosure's count is
 * recounted. With this script blocked a student sees the build's list, which
 * errs on the side of one date too many.
 */
const today = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
})();
const isPast = (li) => (li.dataset.end || li.dataset.date || '9999') < today;

for (const panel of document.querySelectorAll('[data-dates-panel]')) {
  /* Two dates before the disclosure on a phone, where the panel comes before
     the page's own content; three beside it on a wide screen. */
  const narrow = window.matchMedia('(max-width: 61.99rem)').matches;
  const first = narrow ? Number(panel.dataset.firstNarrow) || 2 : Number(panel.dataset.first) || 3;
  const head = panel.querySelector('[data-dates-head]');
  const rest = panel.querySelector('[data-dates-rest]');
  const sessions = panel.querySelector('[data-sessions]');

  for (const li of panel.querySelectorAll('li[data-date]')) if (isPast(li)) li.remove();

  if (head && rest) {
    while (head.children.length > first) rest.prepend(head.lastElementChild);
    while (head.children.length < first && rest.firstElementChild) head.append(rest.firstElementChild);
    const n = rest.children.length;
    const all = rest.closest('details');
    if (!n) all?.remove();
    else {
      const count = all?.querySelector('[data-dates-rest-n]');
      if (count) count.textContent = `(${n} more)`;
    }
  }
  if (sessions && !sessions.children.length) {
    sessions.previousElementSibling?.remove();
    sessions.remove();
  }
  if (head && !head.children.length) {
    const p = document.createElement('p');
    p.className = 'dates-panel__empty';
    p.textContent = 'No upcoming deadlines recorded here.';
    head.replaceWith(p);
  }
}
