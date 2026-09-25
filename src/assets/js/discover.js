/* The discovery surface on the home page (src/pages/discover.mjs).
 *
 * The cards are in the page already, drawn at build time; this file hides the
 * ones a choice rules out, counts what is left, and keeps the globe and the
 * cards telling the same story:
 *
 *   - a preset (Right here / Nearby / Explore) sets the distance and moves the
 *     camera;
 *   - choosing a place or a country on the globe narrows the cards;
 *   - every filter re-weights the globe's lights (`setCounts`), counted from
 *     the cards that are left, never filtered a second time.
 *
 * Back means back. Every deliberate choice is a history entry, and the entry
 * being left is first stamped with how far down the page the student was, so
 * Back puts the cards, the camera and the scroll position back together. The
 * globe pushes its own entries when a place or country is chosen on it; a
 * filter that follows from that choice is written into the globe's entry
 * rather than a second one, so one Back undoes one choice. On a phone the
 * filters open as a sheet: opening it is one entry, the choices inside it one
 * step, and Back or "Show" closes it with the choices kept.
 *
 * Without JavaScript every card is there and the globe is its flat first
 * paint; nothing here is needed to read the page.
 */

import { enhanceWorld } from './map.js';

const json = (id) => {
  const el = document.getElementById(id);
  return el ? JSON.parse(el.textContent) : null;
};

const DATA = json('discover-data') || { cards: [], lights: {} };
const CARDS = DATA.cards;
const LIGHTS = DATA.lights || {};
const PLACES = json('place-data') || {};
const TOTAL = CARDS.reduce((n, c) => n + c.members.length, 0);

const EMPTY = { q: '', field: '', where: '', place: '', award: '', open: false, nomath: false, scope: '' };
const state = { ...EMPTY };

const $ = (id) => document.getElementById(id);
const els = {
  form: $('prog-filters'),
  q: $('f-q'),
  field: $('f-field'),
  where: $('f-where'),
  award: $('f-award'),
  open: $('f-open'),
  nomath: $('f-nomath'),
  reset: $('f-reset'),
  count: $('prog-count'),
  active: $('prog-active'),
  results: $('discover-results'),
  empty: $('discover-empty'),
  places: $('discover-places'),
  more: $('discover-more'),
  ways: $('discover-empty-ways'),
  map: $('prog-map'),
  sheet: $('f-sheet'),
  sheetOpen: $('f-sheet-open'),
  presets: [...document.querySelectorAll('.preset[data-scope]')],
};
/* The researched countries with no mapped degree ship as a template (they are
   shown only when a distance has no degree), stamped here once. */
{
  const tpl = $('discover-places-tiles');
  if (tpl && els.places) els.places.append(tpl.content.cloneNode(true));
}
const cardEls = new Map([...document.querySelectorAll('[data-card]')].map((el) => [Number(el.dataset.card), el]));

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduce';

/* --- Filtering --------------------------------------------------------------- */

/** "dest:dk", "city:Aarhus" or "inst:dk-au": one question, three depths. */
function inWhere(m, where) {
  const i = where.indexOf(':');
  const kind = where.slice(0, i);
  const value = where.slice(i + 1);
  if (kind === 'dest') return m.d === value;
  if (kind === 'city') return m.c === value;
  if (kind === 'inst') return m.i === value;
  return true;
}

function matches(m, st = state) {
  if (st.scope && m.s !== st.scope) return false;
  if (st.field && m.f !== st.field) return false;
  if (st.where && !inWhere(m, st.where)) return false;
  if (st.place && m.p !== st.place) return false;
  /* "Not established" is an award state of its own, never a fall-through: a
     student filtering for what Course Results reach is never handed a record
     that is simply silent. */
  if (st.award && m.a !== st.award) return false;
  if (st.open && !m.o) return false;
  // Worked out at build time from the IB courses that satisfy each requirement.
  if (st.nomath && m.m) return false;
  if (st.q) {
    const terms = st.q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.every((t) => m.q.includes(t))) return false;
  }
  return true;
}

const hitsFor = (st) => CARDS.reduce((n, c) => n + c.members.filter((m) => matches(m, st)).length, 0);

/** A filter other than the distance: something that narrows by what a degree is. */
const narrowed = (st = state) => ['q', 'field', 'where', 'place', 'award', 'open', 'nomath'].some((k) => st[k]);

/* A chip's count is what turning it on would leave, given everything else
   already chosen. A chip that would leave nothing says so, and is dimmed
   rather than hidden, so the row does not jump. */
function chipCounts() {
  for (const [k, el, value] of [['award', els.award, els.award?.dataset.value], ['open', els.open, true], ['nomath', els.nomath, true]]) {
    const out = el?.querySelector('.chip__count');
    if (!out) continue;
    const n = hitsFor({ ...state, [k]: value });
    out.textContent = n;
    el.toggleAttribute('data-empty', n === 0 && !state[k]);
    // A chip that would leave nothing cannot be pressed into "No degrees".
    el.disabled = n === 0 && !state[k];
  }
}

/* --- The globe ----------------------------------------------------------------- */

const world = enhanceWorld(els.map?.querySelector('.world'));

function paintMap() {
  if (!world) return;
  const counts = new Map();
  for (const c of CARDS) for (const m of c.members) if (m.p && matches(m)) counts.set(m.p, (counts.get(m.p) || 0) + 1);
  // A Destination with no mapped degree stays lit until a filter asks about
  // degrees; then it has nothing to match and dims with the rest.
  if (!narrowed()) {
    for (const [id, l] of Object.entries(LIGHTS)) if (!state.scope || l.s === state.scope) counts.set(id, l.n || 1);
  }
  world.setCounts(counts, { selected: state.place });
}

/* Move the camera to what a distance names. `show` pushes nothing here: the
   preset's own entry is the one Back returns to. */
function frame(scope) {
  const g = world?.globe;
  if (!g) return;
  const btn = els.presets.find((b) => b.dataset.scope === scope);
  let view = {};
  try { view = JSON.parse(btn?.dataset.view || '{}'); } catch { /* none */ }
  if (!scope || view.reset) { g.reset(); return; }
  if (view.country) g.show({ country: view.country }, { push: false });
  else if (view.bounds) g.show({ bounds: view.bounds, label: view.label }, { push: false });
  // Worldwide: a camera turned to the faraway door with the most institutions.
  else if (view.camera) g.show({ camera: view.camera, label: view.label }, { push: false });
}

/* What the globe chose, as a filter. The globe has already made the history
   entry, so the filter is written into it. A choice made by a preset or by
   Back is not the student's choice on the globe, and is left alone. */
let driving = false;
let fromGlobe = { place: false, where: false };
world?.figure.addEventListener('world:choose', (e) => {
  const d = e.detail || {};
  if (driving || d.restored) return;
  if (d.kind === 'place' && PLACES[d.id]) {
    state.place = d.id;
    fromGlobe.place = true;
  } else if (d.kind === 'country' && CARDS.some((c) => c.members.some((m) => m.d === d.id))) {
    if (state.scope === 'here' && CARDS.some((c) => c.members.some((m) => m.d === d.id && m.s === 'here'))) return;
    state.where = `dest:${d.id}`;
    state.place = '';
    fromGlobe = { place: false, where: true };
  } else if (!d.kind) {
    if (fromGlobe.place) state.place = '';
    if (fromGlobe.where) state.where = '';
    fromGlobe = { place: false, where: false };
  } else {
    return;
  }
  syncControls();
  choose({ replace: true, keepHash: true });
});

/* "Show the degrees here" in a place's card: the same choice, then the cards. */
world?.figure.addEventListener('world:select', (e) => {
  const id = e.detail.id;
  if (!PLACES[id]) return; // a country's light goes to its own page
  e.preventDefault();
  state.place = id;
  choose({ replace: true, keepHash: true });
  els.count?.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
});

/* --- Rendering ------------------------------------------------------------------- */

const LABELS = { q: 'Search', field: 'Subject', where: 'Where', place: 'Place', award: 'IB award', open: 'Open admission', nomath: 'No Maths HL needed', scope: 'Distance' };

function chosenLabel(key, value) {
  if (key === 'award') return els.award && value === els.award.dataset.value ? 'Accepts Course Results' : `${LABELS.award}: ${value}`;
  if (key === 'scope') {
    const b = els.presets.find((x) => x.dataset.scope === value);
    return b ? `${b.querySelector('.preset__eyebrow')?.textContent} · ${b.querySelector('.preset__title')?.textContent}` : value;
  }
  const el = els[key];
  const option = el && el.options ? [...el.options].find((o) => o.value === value) : null;
  return option ? option.textContent.trim().replace(/\s*\(\d+\)$/, '') : value;
}

/* No degree matches: a way out for each filter that is on, one at a time,
   and any guide whose title shares a word with the search ("medicine" has a
   guide even where no degree is mapped yet). */
const GUIDES = DATA.guides || [];
function renderWays() {
  if (!els.ways) return;
  const ways = Object.entries(state)
    .filter(([k, v]) => v && k !== 'scope')
    .map(([k, v]) => {
      const label = k === 'place' ? PLACES[v]?.name || v : v === true ? LABELS[k] : k === 'q' ? `“${v}”` : chosenLabel(k, v);
      return `<li><button type="button" class="chip" data-clear="${k}">Without ${esc(label)}</button></li>`;
    });
  const terms = (state.q || '').toLowerCase().split(/\s+/).filter((t) => t.length > 3);
  const guides = terms.length ? GUIDES.filter((g) => terms.some((t) => g.t.toLowerCase().includes(t))).slice(0, 3) : [];
  els.ways.innerHTML = [
    ...guides.map((g) => `<li class="discover__guide"><a class="arrow-link" href="${esc(g.h)}">${esc(g.t)}</a></li>`),
    ...ways,
    ways.length > 1 ? '<li><button type="button" class="chip" data-clear-all>Clear all</button></li>' : '',
  ].join('');
}
els.ways?.addEventListener('click', (e) => {
  const b = e.target.closest('[data-clear]');
  if (!b) return;
  const k = b.dataset.clear;
  state[k] = EMPTY[k];
  syncControls();
  choose();
});

/* On a phone the results are a long way below the hero: when the count
   changes out of sight, a pill says it and takes you there (home round 1). */
let pillEl = null;
let lastPill = '';
let countSeen = true;
if (els.count && 'IntersectionObserver' in window) {
  new IntersectionObserver(([e]) => { countSeen = e.isIntersecting; if (countSeen && pillEl) pillEl.hidden = true; }).observe(els.count);
}
function pill(text) {
  if (text === lastPill) return;
  const first = !lastPill;
  lastPill = text;
  if (first || countSeen || !matchMedia('(max-width: 51.99rem)').matches) { if (pillEl) pillEl.hidden = true; return; }
  if (!pillEl) {
    pillEl = document.createElement('button');
    pillEl.type = 'button';
    pillEl.className = 'discover__pill';
    pillEl.addEventListener('click', () => {
      pillEl.hidden = true;
      els.count.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
    });
    document.body.append(pillEl);
  }
  pillEl.textContent = `${text} ↓`;
  pillEl.hidden = false;
}

function renderActive() {
  if (!els.active) return;
  els.active.innerHTML = Object.entries(state)
    .filter(([, v]) => v)
    .map(([k, v]) => {
      const label = k === 'place' ? PLACES[v]?.name || v : v === true ? LABELS[k] : k === 'q' ? `“${v}”` : chosenLabel(k, v);
      return `<li>${esc(label)} <button type="button" data-clear="${k}" aria-label="Remove ${esc(label)}">×</button></li>`;
    })
    .join('');
}

els.active?.addEventListener('click', (e) => {
  const b = e.target.closest('[data-clear]');
  if (!b) return;
  const k = b.dataset.clear;
  state[k] = EMPTY[k];
  syncControls();
  choose();
  if (k === 'scope') frame('');
});

function render() {
  let shown = 0;
  let cardsShown = 0;
  for (const [n, c] of CARDS.entries()) {
    const hit = c.members.filter((m) => matches(m)).length;
    const el = cardEls.get(n);
    if (el) el.hidden = hit === 0;
    shown += hit;
    if (hit) cardsShown++;
  }
  const any = Object.values(state).some(Boolean);
  /* Any filter opens the folded cards, so no result waits behind "Show all";
     clearing them folds the cards again only if this opened them. */
  if (els.more) {
    if (any && !els.more.open) { els.more.open = true; els.more.dataset.auto = ''; }
    else if (!any && 'auto' in els.more.dataset) { els.more.open = false; delete els.more.dataset.auto; }
    els.more.toggleAttribute('data-filtering', any);
  }
  // A distance with no mapped degree shows its countries instead.
  const placesInstead = !!state.scope && !narrowed() && shown === 0;
  const doors = placesInstead ? [...(els.places?.querySelectorAll('[data-scope]') || [])].filter((li) => li.dataset.scope === state.scope).length : 0;
  els.count.innerHTML = !any
    ? `<b>${TOTAL}</b> degrees`
    : shown
    ? `<b>${shown}</b> of ${TOTAL} degrees`
    : placesInstead && doors
    ? `<b>${plural(doors, 'country', 'countries')}</b> researched`
    : '<b>No degrees</b>';
  if (!shown && !placesInstead) renderWays();
  pill(els.count.textContent);
  if (els.places) {
    els.places.hidden = !placesInstead;
    for (const li of els.places.querySelectorAll('[data-scope]')) li.hidden = li.dataset.scope !== state.scope;
  }
  if (els.empty) els.empty.hidden = shown > 0 || placesInstead;

  const badge = els.sheetOpen?.querySelector('[data-n]');
  const n = ['field', 'where', 'place', 'award', 'open', 'nomath'].filter((k) => state[k]).length;
  if (badge) badge.textContent = n ? ` (${n})` : '';
  for (const b of document.querySelectorAll('[data-show]')) {
    b.textContent = shown ? `Show ${plural(shown, 'degree')}` : 'Nothing matches: close';
  }
  for (const b of els.presets) b.setAttribute('aria-pressed', String(state.scope === b.dataset.scope));

  renderActive();
  chipCounts();
  paintMap();
  return cardsShown;
}

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-clear-all]')) {
    Object.assign(state, EMPTY);
    syncControls();
    choose();
    frame('');
    return;
  }
  // Leaving for a programme page: remember where on this one the student was.
  if (e.target.closest('#discover-results a[href]')) stamp();
});

/* --- URL and history ---------------------------------------------------------------- */

function query() {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(state)) {
    if (v === true) params.set(k, '1');
    else if (typeof v === 'string' && v) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/** Read the address into the state. Old finder links (`?inst=`, `?campus=`) still work. */
function readUrl() {
  Object.assign(state, EMPTY);
  const params = new URLSearchParams(location.search);
  for (const k of ['q', 'field', 'where', 'place', 'award', 'scope']) {
    const v = params.get(k);
    if (v) state[k] = v;
  }
  if (!state.where && params.get('inst')) state.where = `inst:${params.get('inst')}`;
  if (!state.where && params.get('campus')) state.where = `city:${params.get('campus')}`;
  for (const k of ['open', 'nomath']) if (params.get(k) === '1') state[k] = true;
}

function syncControls() {
  if (els.q) els.q.value = state.q;
  for (const k of ['field', 'where']) {
    const el = els[k];
    if (!el) continue;
    el.value = state[k];
    // A value no option carries (an old link) is still applied, and removable
    // from the chip row; the select just shows "any".
    if (el.value !== state[k]) el.value = '';
  }
  els.award?.setAttribute('aria-pressed', String(!!state.award && state.award === els.award.dataset.value));
  for (const k of ['open', 'nomath']) els[k]?.setAttribute('aria-pressed', String(state[k]));
}

try { history.scrollRestoration = 'manual'; } catch { /* its own restoration stays */ }

/** Write how far down the page this entry was, so Back can return to it. */
function stamp() {
  try { history.replaceState({ ...(history.state || {}), discover: true, y: Math.round(scrollY) }, ''); } catch { /* sandboxed */ }
}

let sheetIsOpen = false;
let typing = false;

/** A deliberate choice: show it, and make it one step Back can undo. */
function choose({ replace = false, keepHash = false } = {}) {
  render();
  const to = `${location.pathname}${query()}${keepHash ? location.hash : ''}`;
  if (to === location.pathname + location.search + (keepHash ? location.hash : '')) return;
  try {
    if (replace || sheetIsOpen) {
      history.replaceState({ ...(history.state || {}), discover: true }, '', to);
    } else {
      stamp();
      history.pushState({ discover: true, y: null }, '', to);
    }
  } catch { /* sandboxed: the choice still shows, Back just leaves */ }
}

addEventListener('popstate', (e) => {
  if (sheetIsOpen && !e.state?.sheet) {
    // Back, Close or "Show": the sheet goes, and the choices made in it stay,
    // as one step of their own.
    setSheet(false);
    const to = `${location.pathname}${query()}`;
    if (to !== location.pathname + location.search) {
      try { history.pushState({ discover: true, y: null }, '', to); } catch { /* ignore */ }
    }
    els.count?.scrollIntoView({ block: 'center' });
    return;
  }
  // Only an entry with different choices is this page's to restore; the menu
  // and the globe's own entries share this history.
  const before = query();
  const scopeBefore = state.scope;
  readUrl();
  if (query() === before) return;
  fromGlobe = { place: false, where: false };
  syncControls();
  render();
  if (state.scope !== scopeBefore) {
    driving = true;
    frame(state.scope);
    setTimeout(() => { driving = false; }, 0);
  }
  const y = e.state?.y;
  if (typeof y === 'number') scrollTo(0, y);
});

addEventListener('pagehide', stamp);

/* --- The phone's filter sheet ------------------------------------------------------- */

const phone = matchMedia('(max-width: 51.99rem)');

function setSheet(open) {
  sheetIsOpen = open;
  els.form?.toggleAttribute('data-sheet', open);
  els.sheetOpen?.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('has-sheet', open);
  if (open) els.sheet?.querySelector('select, button:not([data-sheet-close])')?.focus();
  else if (phone.matches) els.sheetOpen?.focus({ preventScroll: true });
}

els.sheetOpen?.addEventListener('click', () => {
  stamp();
  try { history.pushState({ ...(history.state || {}), discover: true, sheet: true }, '', location.pathname + location.search); } catch { /* ignore */ }
  setSheet(true);
});
for (const b of document.querySelectorAll('[data-sheet-close]')) {
  b.addEventListener('click', () => { if (sheetIsOpen) history.back(); });
}
els.sheet?.addEventListener('keydown', (e) => {
  if (!sheetIsOpen) return;
  if (e.key === 'Escape') {
    // An open "i" note closes first (site.js); the sheet on the next Escape.
    if (els.sheet.querySelector('[data-info][aria-expanded="true"]')) return;
    e.preventDefault();
    history.back();
    return;
  }
  if (e.key !== 'Tab') return;
  const f = [...els.sheet.querySelectorAll('button, select, a[href], input')].filter((x) => x.offsetParent !== null && !x.closest('[hidden]'));
  if (!f.length) return;
  const first = f[0];
  const last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
phone.addEventListener?.('change', () => { if (!phone.matches && sheetIsOpen) history.back(); });

/* --- Wiring ---------------------------------------------------------------------------- */

for (const b of els.presets) {
  b.addEventListener('click', () => {
    state.scope = state.scope === b.dataset.scope ? '' : b.dataset.scope;
    // A distance replaces a place picked inside another one.
    state.place = '';
    fromGlobe = { place: false, where: false };
    choose();
    driving = true;
    frame(state.scope);
    setTimeout(() => { driving = false; }, 0);
  });
}

els.q?.addEventListener('input', (e) => {
  state.q = e.target.value;
  // The first keystroke is the choice; the rest refine it in place.
  choose({ replace: typing });
  typing = true;
});
els.q?.addEventListener('change', () => { typing = false; });
els.q?.addEventListener('blur', () => { typing = false; });

for (const k of ['field', 'where']) {
  els[k]?.addEventListener('change', (e) => { state[k] = e.target.value; choose(); });
}
els.award?.addEventListener('click', () => {
  state.award = state.award ? '' : els.award.dataset.value;
  syncControls();
  choose();
});
for (const k of ['open', 'nomath']) {
  els[k]?.addEventListener('click', () => {
    state[k] = !state[k];
    syncControls();
    choose();
  });
}
els.reset?.addEventListener('click', () => {
  const hadScope = !!state.scope;
  Object.assign(state, EMPTY);
  syncControls();
  choose();
  if (hadScope) frame('');
});
els.form?.addEventListener('submit', (e) => e.preventDefault());

readUrl();
syncControls();
render();
if (state.scope) {
  // The globe loads when it is near the screen; frame it once it is there.
  const wait = setInterval(() => {
    if (!world?.globe) return;
    clearInterval(wait);
    driving = true;
    frame(state.scope);
    setTimeout(() => { driving = false; }, 0);
  }, 250);
  setTimeout(() => clearInterval(wait), 15000);
}
// Back from a programme page, when the browser did not keep this one alive.
if (typeof history.state?.y === 'number') scrollTo(0, history.state.y);
