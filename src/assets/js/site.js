/* Site-wide behaviour: theme, mobile nav, deadline states. Everything here is
   progressive — the page is fully readable with JavaScript switched off. */

/* --- Theme --------------------------------------------------------------- */

const root = document.documentElement;
const toggle = document.getElementById('theme-toggle');

function currentTheme() {
  return root.getAttribute('data-theme')
    || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

function paintToggle() {
  if (!toggle) return;
  const dark = currentTheme() === 'dark';
  toggle.querySelector('.t-sun').hidden = dark;
  toggle.querySelector('.t-moon').hidden = !dark;
  toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
}

toggle?.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('ibp-theme', next); } catch {}
  paintToggle();
});
paintToggle();

/* --- Mobile navigation --------------------------------------------------- */

const navToggle = document.getElementById('nav-toggle');
const drawer = document.getElementById('drawer');

/* Opening the menu is a step a student can take back: it adds one history
   entry, so the phone's Back button closes the menu instead of leaving the
   page. Following a link from inside the menu replaces that entry, so Back
   from the next page lands on this one, not on "this one with the menu open".
   Focus goes into the menu when it opens, stays there while it is open, and
   returns to the button when it closes. */
const toggleText = navToggle?.querySelector('.nav-toggle__text');
const isOpen = () => drawer?.dataset.open === 'true';

function setDrawer(open) {
  if (!drawer || !navToggle) return;
  drawer.dataset.open = String(open);
  navToggle.setAttribute('aria-expanded', String(open));
  if (toggleText) toggleText.textContent = open ? 'Close' : 'Menu';
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) drawer.querySelector('a')?.focus();
  else navToggle.focus();
}

function closeDrawer() {
  if (!isOpen()) return;
  if (history.state?.drawer) history.back(); // popstate closes it
  else setDrawer(false);
}

navToggle?.addEventListener('click', () => {
  if (isOpen()) return closeDrawer();
  history.pushState({ ...(history.state || {}), drawer: true }, '');
  setDrawer(true);
});

addEventListener('popstate', () => {
  if (isOpen() && !history.state?.drawer) setDrawer(false);
});

// Arriving back on a page whose menu entry is still in history: it is closed.
if (history.state?.drawer) history.replaceState({ ...history.state, drawer: false }, '');

drawer?.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (a.target === '_blank' || a.origin !== location.origin) return;
  if (!history.state?.drawer) return;
  e.preventDefault();
  const sameDoc = a.pathname === location.pathname && a.search === location.search;
  if (sameDoc) {
    // A jump within this page (Countries → #europe): leave the menu, then go.
    setDrawer(false);
    history.replaceState({ ...history.state, drawer: false }, '', a.hash || location.hash);
    document.getElementById(decodeURIComponent(a.hash.slice(1)))?.scrollIntoView();
  } else {
    location.replace(a.href);
  }
});

document.addEventListener('keydown', (e) => {
  if (!isOpen()) return;
  if (e.key === 'Escape') return closeDrawer();
  if (e.key === 'Tab') {
    const items = [navToggle, ...drawer.querySelectorAll('a[href]')];
    const i = items.indexOf(document.activeElement);
    const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i + 1) % items.length;
    e.preventDefault();
    items[next].focus();
  }
});

/* --- Distance doors ------------------------------------------------------- */

/* The line on each door draws itself once, when the door comes into view:
   geographic movement, so it takes the `geographic` token's length. Without
   JavaScript, without IntersectionObserver or under reduced motion the lines
   are simply drawn. */
const traced = document.querySelectorAll('.doors[data-trace]');
if (
  traced.length &&
  'IntersectionObserver' in window &&
  root.getAttribute('data-motion') !== 'reduced' &&
  !matchMedia('(prefers-reduced-motion: reduce)').matches
) {
  const seen = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        en.target.classList.add('is-seen');
        seen.unobserve(en.target);
      }
    },
    { threshold: 0.4 }
  );
  for (const doors of traced) {
    doors.dataset.trace = 'armed';
    for (const door of doors.querySelectorAll('.door')) seen.observe(door);
  }
}

/* --- Motion preference ---------------------------------------------------- */

/* The operating-system setting is respected by the stylesheet. This is the
   in-product control on top of it, because "I usually want motion but not on
   this page, on this train" is a real preference. */
const motionToggle = document.getElementById('motion-toggle');
if (motionToggle) {
  const reduced = () => root.getAttribute('data-motion') === 'reduced';
  const paintMotion = () => {
    motionToggle.checked = reduced();
    motionToggle.setAttribute('aria-label', reduced() ? 'Turn motion back on' : 'Reduce motion');
  };
  motionToggle.addEventListener('change', () => {
    const next = motionToggle.checked ? 'reduced' : 'full';
    root.setAttribute('data-motion', next);
    try { localStorage.setItem('ibp-motion', next); } catch {}
    paintMotion();
  });
  paintMotion();
}

/* --- Deadline states ----------------------------------------------------- */

/* Timeline entries carry an ISO date; mark what has passed and what is next so
   the calendar is useful whenever a student happens to open it. */
const today = new Date().toISOString().slice(0, 10);
let markedNext = false;
for (const li of document.querySelectorAll('.timeline > li[data-date]')) {
  if (li.dataset.date < today) {
    li.dataset.state = 'past';
  } else if (!markedNext) {
    li.dataset.state = 'now';
    markedNext = true;
  }
}

/* Countdown chips: <span data-countdown="2027-03-15"> */
for (const el of document.querySelectorAll('[data-countdown]')) {
  const target = new Date(el.dataset.countdown + 'T12:00:00Z');
  const days = Math.ceil((target - Date.now()) / 86400000);
  el.textContent =
    days > 1 ? `${days} days away`
    : days === 1 ? 'tomorrow'
    : days === 0 ? 'today'
    : 'passed';
  if (days < 0) el.classList.add('is-past');
}

/* --- Copy-link on headings ----------------------------------------------- */

for (const h of document.querySelectorAll('.prose h2[id], .prose h3[id]')) {
  const a = document.createElement('a');
  a.href = `#${h.id}`;
  a.className = 'heading-anchor';
  a.setAttribute('aria-label', `Link to “${h.textContent}”`);
  a.textContent = '#';
  h.append(a);
}

/* --- Hero gallery -------------------------------------------------------- */

/* A country page carries one photograph and a list of the places a student
   could actually go. Showing them in turn, named, makes the hero say something
   about the options rather than about the capital city's skyline.

   Three rules this obeys, in order of importance:

   1. The first picture is in the HTML and is the whole thing without
      JavaScript. Everything below is an enhancement.
   2. A slide that exists in the DOM is a slide the browser downloads, even at
      opacity 0. So each one is created only when it is about to be shown, and a
      reader who leaves after four seconds pays for exactly one photograph.
   3. Motion that a reader did not ask for is motion they can stop. Reduced
      motion — the OS setting or the in-product toggle — means no cycling at
      all, not a faster fade. */
for (const media of document.querySelectorAll('.hero__media[data-slides]')) {
  let slides;
  try { slides = JSON.parse(media.dataset.slides); } catch { continue; }
  if (!Array.isArray(slides) || !slides.length) continue;

  const hero = media.closest('.hero');
  const caption = hero?.querySelector('[data-hero-caption]');
  const credit = hero?.querySelector('[data-hero-credit]');
  const first = media.querySelector('img');
  if (!first) continue;

  // The picture already in the HTML is slide zero, so the cycle returns to it.
  const all = [{ src: first.getAttribute('src'), alt: first.getAttribute('alt') || '', caption: null, credit: null }, ...slides];
  const loaded = new Map([[0, first]]);
  let index = 0;
  let timer = null;

  const stopped = () =>
    root.getAttribute('data-motion') === 'reduced' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  async function show(next) {
    const slide = all[next];
    let img = loaded.get(next);
    if (!img) {
      img = new Image();
      img.src = slide.src;
      img.alt = '';
      img.decoding = 'async';
      img.width = 2000;
      img.height = 1200;
      img.className = 'hero__slide';
      try { await img.decode(); } catch { return; }   // a 404 leaves the current picture alone
      media.appendChild(img);
      loaded.set(next, img);
    }
    for (const [i, el] of loaded) el.classList.toggle('is-shown', i === next);
    first.classList.toggle('is-hidden', next !== 0);

    if (caption) {
      caption.textContent = slide.caption || '';
      caption.hidden = !slide.caption;
    }
    if (credit && slide.credit) {
      credit.textContent = slide.credit.text || '';
      if (slide.credit.url) {
        const a = document.createElement('a');
        a.href = slide.credit.url;
        a.rel = 'noopener nofollow';
        a.textContent = slide.credit.text || '';
        credit.replaceChildren(a);
      }
    }
    index = next;
  }

  function tick() {
    if (stopped() || document.hidden) return;
    show((index + 1) % all.length);
  }

  function start() {
    clearInterval(timer);
    if (stopped()) return;
    timer = setInterval(tick, 6000);
  }

  // Never compete with the first paint: wait for load, then a beat to read.
  if (document.readyState === 'complete') setTimeout(start, 3000);
  else window.addEventListener('load', () => setTimeout(start, 3000), { once: true });

  document.addEventListener('visibilitychange', () => (document.hidden ? clearInterval(timer) : start()));
  new MutationObserver(start).observe(root, { attributes: true, attributeFilter: ['data-motion'] });
}

/* --- Leaving the site opens a new tab ------------------------------------ */

/* Only a link that leaves this site opens a new tab, so the student never
   loses their place here. Every link within the site stays in the tab, so
   the back button always returns to where they were. "This site" is the
   deployed base path, not the whole origin: GitHub Pages serves other
   projects from the same host. A click with a modifier key is left to the
   browser. */
const SITE_ROOT = new URL('../../', import.meta.url).href;

function leavesSite(a) {
  if (!a.href || a.target || a.hasAttribute('download')) return false;
  const to = new URL(a.href, location.href);
  if (!/^https?:$/.test(to.protocol)) return false;
  return !to.href.startsWith(SITE_ROOT);
}

document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest?.('a[href]');
  if (!a || !leavesSite(a)) return;
  a.target = '_blank';
  if (!/\bnoopener\b/.test(a.rel)) a.rel = `${a.rel} noopener`.trim();
}, true);
