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
