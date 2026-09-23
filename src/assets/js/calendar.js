/* The application calendar, scoped to what the student is actually looking at.
 *
 * The page ships every event and this hides what is out of scope. That is the
 * opposite of what a server would do and it is the point: the signals that
 * decide the scope live in `localStorage` and are never sent anywhere, so a
 * server could not do this without being told what a student is interested in.
 *
 * It also means the failure mode is the right way round. With this script
 * blocked, a student sees the complete calendar — more than they need, rather
 * than nothing at all.
 */
import { interest, set as setExploration, explicit, SOURCE_WORDING } from './exploration.js';

const scope = document.getElementById('cal-scope');
if (scope) {
  const stateLine = document.getElementById('cal-scope-state');
  const showAll = document.getElementById('cal-show-all');
  const showMine = document.getElementById('cal-show-mine');
  const share = document.getElementById('cal-share');
  const boxes = [...scope.querySelectorAll('input[name="scope"]')];
  const items = [...document.querySelectorAll('.timeline > li[data-destination]')];
  const lists = [...document.querySelectorAll('.timeline')];

  /* Two names per Destination, because a checkbox and a sentence want
     different ones. A list of tickboxes reads "Netherlands"; a sentence has to
     read "scoped to Denmark and **the** Netherlands", and a page cannot work
     out which names take a definite article — the record says, in
     `articleName`. This line used to scrape the checkbox's own label for both
     uses, which is why the calendar said "scoped to Denmark and Netherlands". */
  const names = new Map(
    boxes.map((b) => [b.value, b.dataset.sentenceName || b.closest('label').textContent.trim().replace(/^\S+\s/, '')])
  );

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

  /* --- Painting ----------------------------------------------------------- */

  function visibleCodes() {
    if (showingAll || !current || !current.codes.length) return null;
    return new Set(current.codes);
  }

  function paint() {
    const codes = visibleCodes();
    let shown = 0;

    for (const li of items) {
      const out = codes ? !codes.has(li.dataset.destination) : false;
      li.hidden = out;
      if (!out) shown++;
    }

    /* A list whose every item is hidden should not leave a heading floating
       above a rule with nothing under it. */
    for (const ul of lists) {
      const any = [...ul.children].some((li) => !li.hidden);
      ul.hidden = !any;
      const heading = ul.previousElementSibling;
      if (heading && /^H[234]$/.test(heading.tagName)) heading.hidden = !any;
    }

    markNext();
    describe(shown, codes);
    syncBoxes(codes);
  }

  /* `site.js` marks what has passed and what is next across the whole list on
     load. Once entries are hidden, "next" has to mean the next one the student
     can actually see, so it is recomputed here over the visible set. */
  function markNext() {
    const today = new Date().toISOString().slice(0, 10);
    let marked = false;
    for (const li of items) {
      delete li.dataset.state;
      if (li.hidden || !li.dataset.date) continue;
      if (li.dataset.date < today) li.dataset.state = 'past';
      else if (!marked) {
        li.dataset.state = 'now';
        marked = true;
      }
    }
  }

  function describe(shown, codes) {
    if (!codes) {
      stateLine.textContent = current
        ? `Showing every deadline on the site — ${items.length} in all.`
        : `Showing every deadline on the site — ${items.length} in all. Once you start comparing destinations, this narrows to yours.`;
    } else if (shown === 0) {
      stateLine.textContent =
        `Nothing on the calendar for ${listSentence([...codes].map((c) => names.get(c) || c))} yet. ` +
        `That is a gap in our research rather than a quiet year.`;
    } else {
      const where = listSentence([...codes].map((c) => names.get(c) || c));
      stateLine.textContent = `${shown} of ${items.length} dates, scoped to ${where} — ${SOURCE_WORDING[current.source] || 'your selection'}.`;
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
      /* Ticking a box here is the student saying what they are exploring, so it
         is recorded as that rather than kept as a setting private to this page.
         The compare tray and anything else built on the Exploration List pick
         it up, which is the whole reason that list exists. */
      setExploration(chosen);
      current = chosen.length ? { codes: chosen, source: 'list' } : interest();
      paint();
    });
  }

  share.addEventListener('click', async () => {
    const codes = visibleCodes();
    const u = new URL(location.href);
    u.search = codes ? `?destinations=${[...codes].join(',')}` : '?all=1';
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
}
