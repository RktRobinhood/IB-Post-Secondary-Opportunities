/* The Deadlines page, scoped to what the student is actually looking at.
 *
 * The page ships every event and this lays it out for the reader: which
 * countries, and which day it is. That is the opposite of what a server would
 * do and it is the point: the signals that decide the scope live in
 * `localStorage` and are never sent anywhere, so a server could not do this
 * without being told what a student is interested in.
 *
 * What it does, every time the scope changes:
 *
 *   - hides every date outside the chosen countries, wherever it sits;
 *   - moves any date that has passed since the build into "Earlier this cycle",
 *     because a page can sit in a browser tab for a week;
 *   - rebuilds "Next up" as copies of the first ten upcoming dates in scope,
 *     taken from the full list, so the two can never disagree;
 *   - recounts the chips, the month strip and the two disclosures.
 *
 * With this script blocked, a student sees every country's next ten dates, and
 * every date one tap away — more than they need, rather than nothing at all.
 */
import { interest, set as setExploration, explicit, SOURCE_WORDING } from './exploration.js';

const NEXT_UP = 10;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthName = (k) => `${MONTHS[Number(k.slice(5, 7)) - 1]} ${k.slice(0, 4)}`;

const scope = document.getElementById('cal-scope');
if (scope) {
  const stateLine = document.getElementById('cal-scope-state');
  const showAll = document.getElementById('cal-show-all');
  const showMine = document.getElementById('cal-show-mine');
  const share = document.getElementById('cal-share');
  const boxes = [...scope.querySelectorAll('input[name="scope"]')];
  const next = document.getElementById('cal-next');
  const nextCount = document.getElementById('cal-next-count');
  const all = document.getElementById('cal-all');
  const pastBox = document.getElementById('cal-past');
  const allN = document.getElementById('cal-all-n');
  const pastN = document.getElementById('cal-past-n');
  const monthLinks = [...document.querySelectorAll('.cal-months a[data-month]')];

  /* Every real entry on the page. The "Next up" list is made of copies and is
     never counted, or it would count its ten dates twice. */
  const items = [...document.querySelectorAll('.timeline > li[data-destination]')].filter((li) => !next?.contains(li));
  const lists = [...document.querySelectorAll('.timeline')].filter((ul) => !next?.contains(ul));

  const today = new Date().toISOString().slice(0, 10);
  const endOf = (li) => li.dataset.end || li.dataset.date;
  const isPast = (li) => Boolean(li.dataset.date) && endOf(li) < today;

  /* A date that was ahead when the page was built and is behind now belongs
     with the other past dates, in date order. */
  const pastList = pastBox?.querySelector('.timeline');
  if (all && pastList) {
    const stale = [...all.querySelectorAll('.timeline > li[data-date]')].filter(isPast);
    for (const li of stale) {
      const after = [...pastList.children].find((x) => x.dataset.date > li.dataset.date);
      pastList.insertBefore(li, after || null);
    }
  }
  const upcoming = all ? [...all.querySelectorAll('.timeline > li[data-date]')] : [];

  /* Two names per Destination, because a checkbox and a sentence want
     different ones: a chip reads "Netherlands"; a sentence reads "the
     Netherlands". The record says which, in `articleName`. */
  const names = new Map(boxes.map((b) => [b.value, b.dataset.sentenceName || b.value]));

  /* --- Where the scope comes from ---------------------------------------- */

  /* A link wins over stored interest, because someone deliberately sent it —
     a counsellor sharing "here are the dates for the three we discussed"
     should not have their link quietly overridden by the reader's own list. */
  const params = new URLSearchParams(location.search);
  const fromUrl = (params.get('destinations') || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  let showingAll = params.get('all') === '1';
  let current = fromUrl.length ? { codes: fromUrl, source: 'url' } : interest();

  scope.hidden = false;

  /* The chip counts are upcoming dates as of now, not as of the build. */
  const perCountry = new Map();
  for (const li of upcoming) perCountry.set(li.dataset.destination, (perCountry.get(li.dataset.destination) || 0) + 1);
  for (const el of scope.querySelectorAll('[data-count-for]')) el.textContent = perCountry.get(el.dataset.countFor) || 0;

  /* --- Painting ----------------------------------------------------------- */

  function visibleCodes() {
    if (showingAll || !current || !current.codes.length) return null;
    return new Set(current.codes);
  }

  function paint() {
    const codes = visibleCodes();

    for (const li of items) li.hidden = codes ? !codes.has(li.dataset.destination) : false;

    /* A list whose every item is hidden should not leave a heading floating
       above a rule with nothing under it. */
    for (const ul of lists) {
      const any = [...ul.children].some((li) => !li.hidden);
      ul.hidden = !any;
      const heading = ul.previousElementSibling;
      if (heading && /^H[234]$/.test(heading.tagName)) heading.hidden = !any;
    }

    markNext();
    const shown = upcoming.filter((li) => !li.hidden);
    rebuildNext(shown);
    recount(shown);
    describe(shown.length, codes);
    syncBoxes(codes);
  }

  /* `site.js` marks what has passed and what is next on load, by start date.
     Here "past" means the window is over, and "next" is the next one the
     student can see. */
  function markNext() {
    let marked = false;
    for (const li of items) {
      delete li.dataset.state;
      if (li.hidden || !li.dataset.date) continue;
      if (isPast(li)) li.dataset.state = 'past';
      else if (!marked) {
        li.dataset.state = 'now';
        marked = true;
      }
    }
  }

  function rebuildNext(shown) {
    if (!next) return;
    const ul = document.createElement('ul');
    ul.className = 'timeline';
    for (const li of shown.slice(0, NEXT_UP)) ul.append(li.cloneNode(true));
    next.replaceChildren(ul);
    if (!shown.length) {
      const p = document.createElement('p');
      p.className = 'state state--empty';
      p.textContent = 'Nothing ahead for these countries yet. That is a gap in our research rather than a quiet year.';
      next.replaceChildren(p);
    }
    if (nextCount) nextCount.textContent = `${Math.min(NEXT_UP, shown.length)} of ${shown.length}`;
  }

  function recount(shown) {
    if (allN) allN.textContent = `(${shown.length})`;
    if (pastN && pastList) pastN.textContent = `(${[...pastList.children].filter((li) => !li.hidden).length})`;
    const byMonth = new Map();
    for (const li of shown) {
      const k = (li.dataset.date < today ? today : li.dataset.date).slice(0, 7);
      byMonth.set(k, (byMonth.get(k) || 0) + 1);
    }
    const busiest = Math.max(1, ...byMonth.values());
    for (const a of monthLinks) {
      const n = byMonth.get(a.dataset.month) || 0;
      a.querySelector('[data-month-count]').textContent = n;
      a.querySelector('.cal-months__bar > span')?.style.setProperty('--h', (n / busiest).toFixed(3));
      a.setAttribute('aria-label', `${monthName(a.dataset.month)}: ${n} date${n === 1 ? '' : 's'}`);
      a.closest('li').dataset.empty = n ? 'false' : 'true';
    }
  }

  function describe(shown, codes) {
    if (!codes) {
      stateLine.textContent = 'Every country. Pick yours to see only their dates.';
    } else if (shown === 0) {
      stateLine.textContent = `Nothing ahead for ${listSentence([...codes].map((c) => names.get(c) || c))} yet.`;
    } else {
      stateLine.textContent = `${listSentence([...codes].map((c) => names.get(c) || c))} — ${SOURCE_WORDING[current.source] || 'your selection'}.`;
    }

    showAll.hidden = !codes;
    showMine.hidden = Boolean(codes) || !current;
    share.hidden = !codes;
  }

  function syncBoxes(codes) {
    for (const b of boxes) b.checked = codes ? codes.has(b.value) : false;
  }

  function listSentence(parts) {
    if (parts.length <= 1) return parts[0] || '';
    return `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`;
  }

  /* --- Controls ----------------------------------------------------------- */

  showAll.addEventListener('click', () => {
    showingAll = true;
    paint();
  });

  showMine.addEventListener('click', () => {
    showingAll = false;
    paint();
  });

  for (const b of boxes) {
    b.addEventListener('change', () => {
      const chosen = boxes.filter((x) => x.checked).map((x) => x.value);
      showingAll = chosen.length === 0;
      /* Ticking a country here is the student saying what they are exploring,
         so it is recorded as that rather than kept as a setting private to this
         page. The compare tray and anything else built on the Exploration List
         pick it up, which is the whole reason that list exists. */
      setExploration(chosen);
      current = chosen.length ? { codes: chosen, source: 'list' } : interest();
      paint();
    });
  }

  /* A month in the strip opens the full list at that month. The disclosure
     opens first, so the browser has something to scroll to. */
  for (const a of monthLinks) {
    a.addEventListener('click', (ev) => {
      const target = document.getElementById(`m-${a.dataset.month}`);
      if (!all || !target || target.hidden) return;
      ev.preventDefault();
      all.open = true;
      history.replaceState(null, '', `#m-${a.dataset.month}`);
      target.scrollIntoView({ block: 'start' });
    });
  }

  share.addEventListener('click', async () => {
    const codes = visibleCodes();
    const u = new URL(location.href);
    u.search = codes ? `?destinations=${[...codes].join(',')}` : '?all=1';
    u.hash = '';
    try {
      await navigator.clipboard.writeText(u.toString());
      share.textContent = 'Link copied';
    } catch {
      /* Clipboard access can be refused, and a button that silently does
         nothing is worse than one that shows you what to copy. */
      share.textContent = u.toString();
    }
    setTimeout(() => {
      share.textContent = 'Copy a link to this view';
    }, 4000);
  });

  /* A link that named destinations is also a statement of interest, but only
     if the reader has not already made one of their own. */
  if (fromUrl.length && !explicit().length) setExploration(fromUrl);

  paint();

  /* Arriving on a month link: open the list it points into. */
  const landed = /^#m-\d{4}-\d{2}$/.test(location.hash) && document.getElementById(location.hash.slice(1));
  if (landed && all) {
    all.open = true;
    landed.scrollIntoView({ block: 'start' });
  }
}
