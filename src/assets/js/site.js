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

navToggle?.addEventListener('click', () => {
  const open = drawer.dataset.open === 'true';
  drawer.dataset.open = String(!open);
  navToggle.setAttribute('aria-expanded', String(!open));
  navToggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
  document.body.style.overflow = open ? '' : 'hidden';
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && drawer?.dataset.open === 'true') navToggle.click();
});

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

/* --- Opening options in new tabs ------------------------------------------ */

/* A student collects options: they open a university from a search, a map or
   a result list, then another, and come back to the tool. Following such a
   link in the same tab threw the tool away each time. So a link to another
   site, or to one university's or one programme's page, opens in a new tab.
   Links for getting around (masthead, drawer, footer, breadcrumbs, pager)
   keep to the tab, and a click with a modifier key is left to the browser. */
const DETAIL = /\/(universities|programmes)\/[^/]+\/?(#.*)?$/;
const WAYFINDING = '.masthead, .drawer, .site-foot, nav[aria-label="Breadcrumb"], .pager';

function opensNewTab(a) {
  if (!a.href || a.target || a.hasAttribute('download') || a.closest(WAYFINDING)) return false;
  const to = new URL(a.href, location.href);
  if (!/^https?:$/.test(to.protocol)) return false;
  if (to.origin !== location.origin) return true;
  return DETAIL.test(to.pathname) && to.pathname !== location.pathname;
}

document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest?.('a[href]');
  if (!a || !opensNewTab(a)) return;
  a.target = '_blank';
  if (!/\bnoopener\b/.test(a.rel)) a.rel = `${a.rel} noopener`.trim();
}, true);
