/* The discovery surface on the home page (src/pages/discover.mjs).
 *
 * The cards are in the page already, drawn at build time; this file hides the
 * ones a choice rules out, counts what is left, and keeps the globe and the
 * cards telling the same story:
 *
 *   - a preset (Right here / Nearby / Explore) sets the distance and moves the
 *     camera;
 *   - choosing on the globe narrows the cards to what it chose (#62): a place
 *     to its degrees, a country to its degrees (or, for a country whose
 *     degrees are not mapped yet, to its own page's tile), and a group dived
 *     into to the countries it holds (`area`). Looking — a drag, a zoom, a
 *     spin — narrows nothing and pushes nothing;
 *   - every filter and the search re-weight the globe's lights (`setCounts`),
 *     counted from the cards that are left, never filtered a second time: a
 *     place or a country's bubble with nothing left dims, and its count is
 *     what is left.
 *
 * Back means back. Every deliberate choice is a history entry, and the entry
 * being left is first stamped with how far down the page the student was, so
 * Back puts the cards, the camera and the scroll position back together. The
 * globe pushes its own entries when a place or country is chosen on it; a
 * filter that follows from that choice is written into the globe's entry
 * rather than a second one, so one Back undoes one choice. At every width the
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
/* Counted in cards, as the student sees them (#52): one card may hold several paths. */
const TOTAL = CARDS.length;

const EMPTY = { q: '', field: '', where: '', place: '', area: '', award: '', open: false, nomath: false, scope: '' };
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
  emptyLine: $('discover-empty-line'),
  placesLine: $('discover-places-line'),
  map: $('prog-map'),
  sheet: $('f-sheet'),
  sheetOpen: $('f-sheet-open'),
  presets: [...document.querySelectorAll('.preset[data-scope]')],
};
/* The researched countries with no mapped degree ship as a template (they are
   shown only after a door, or for a word with nothing near it), stamped here once. */
{
  const tpl = $('discover-places-tiles');
  if (tpl && els.places) els.places.append(tpl.content.cloneNode(true));
}
const FIRST_SHOWN = els.results?.children.length || 0;
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
  if (st.area && !st.area.split(',').includes(m.d)) return false;
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

/* Cards that match: a card matches when any of its paths does, and it counts once (#52). */
const hitsFor = (st) => CARDS.filter((c) => c.members.some((m) => matches(m, st))).length;

/** A filter that asks about the degrees themselves, not only where they are. */
const degreeAsked = (st = state) => ['q', 'field', 'place', 'award', 'open', 'nomath'].some((k) => st[k]) || (!!st.where && !st.where.startsWith('dest:'));
/** Only where, by distance or by a group chosen on the globe: nothing about the degrees. */
const geoOnly = (st = state) => (!!st.scope || !!st.area) && !degreeAsked(st) && !st.where;
const hasCards = (code) => CARDS.some((c) => c.members.some((m) => m.d === code));
/** A country chosen whose degrees are not mapped one by one: its code. */
function doorWhere(st = state) {
  const code = st.where.startsWith('dest:') ? st.where.slice(5) : '';
  return code && LIGHTS[code] && !hasCards(code) ? code : '';
}
/** A Destination's name, for a chip: its light's, or its "Where" option's. */
function destName(code) {
  if (LIGHTS[code]?.t) return LIGHTS[code].t;
  const o = els.where && [...els.where.options].find((x) => x.value === `dest:${code}`);
  return o ? o.textContent.replace(/\s*\(\d+\)$/, '').replace(/^Anywhere in\s+/, '').trim() : code.toUpperCase();
}

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

function paintMap(near = null) {
  if (!world) return;
  const counts = new Map();
  /* The globe's own choice (a country, a university, a continent) narrows
     the cards, not the globe: its neighbours keep their numbers, so the next
     choice is still in view. Filters and distances re-weight it. */
  const st = { ...state };
  for (const k of ['place', 'where', 'area']) if (fromGlobe[k]) st[k] = '';
  // The degrees on show: the matches, or the ones near a word that matched none.
  // Counted in cards, as the count under the globe is (#52, #62): a card of
  // several paths at one place is one there.
  const lit = near?.size ? [...near.values()] : CARDS.map((c) => c.members.filter((m) => matches(m, st)));
  // By place, and by university: the globe's levels light a university by
  // its degrees (its catalogue id, `i`).
  for (const hits of lit) {
    for (const p of new Set(hits.map((m) => m.p).filter(Boolean))) counts.set(p, (counts.get(p) || 0) + 1);
    for (const i of new Set(hits.map((m) => m.i).filter(Boolean))) counts.set(i, (counts.get(i) || 0) + 1);
    // And by country, a card once (#52): the globe's country card says what the list says.
    for (const d of new Set(hits.map((m) => m.d).filter(Boolean))) counts.set(`deg:${d}`, (counts.get(`deg:${d}`) || 0) + 1);
  }
  // A Destination with no mapped degree stays lit until a filter asks about
  // degrees; then it has nothing to match and dims with the rest. A choice
  // of where (a distance, a country, a group on the globe) keeps lit the
  // ones it names.
  if (!degreeAsked(st)) {
    const area = st.area ? st.area.split(',') : null;
    // Every Destination on the globe, mapped degrees or not: its universities
    // are all there to look at until a filter asks about degrees.
    const scopes = DATA.scopes || Object.fromEntries(Object.entries(LIGHTS).map(([id, l]) => [id, l.s]));
    for (const [id, s] of Object.entries(scopes)) {
      if (st.scope && s !== st.scope) continue;
      if (st.where && st.where !== `dest:${id}`) continue;
      if (area && !area.includes(id)) continue;
      counts.set(id, LIGHTS[id]?.n || 1);
    }
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
  // Nearby: the continent, opened into its countries.
  else if (view.region && g.show({ region: view.region, label: view.label }, { push: false })) { /* shown */ }
  else if (view.bounds) g.show({ bounds: view.bounds, label: view.label }, { push: false });
  // Worldwide: a camera turned to the faraway door with the most institutions.
  else if (view.camera) g.show({ camera: view.camera, label: view.label }, { push: false });
}

/* What the globe chose, as a filter. The globe has already made the history
   entry, so the filter is written into it. A choice made by a preset or by
   Back is not the student's choice on the globe, and is left alone. */
let driving = false;
const NONE = { place: false, where: false, area: false };
let fromGlobe = { ...NONE };
/* A choice made on the globe replaces the globe's last one, never the
   student's own filters. */
const clearGlobeChoice = () => {
  for (const k of ['place', 'where', 'area']) if (fromGlobe[k]) state[k] = '';
  fromGlobe = { ...NONE };
};
/* A choice on the globe outside the distance that is on (Denmark chosen
   under "Nearby · Europe") would leave nothing: the choice is the more
   precise one, so the distance goes. Countries are compared by their
   Destination code; no country is named. */
const scopeOfDest = (code) => LIGHTS[code]?.s || CARDS.flatMap((c) => c.members).find((m) => m.d === code)?.s || '';
const keepScope = (codes) => {
  if (state.scope && !codes.some((c) => scopeOfDest(c) === state.scope)) state.scope = '';
};
world?.figure.addEventListener('world:choose', (e) => {
  const d = e.detail || {};
  if (driving || d.restored) return;
  if (d.kind === 'place' && PLACES[d.id]) {
    clearGlobeChoice();
    state.place = d.id;
    fromGlobe.place = true;
    keepScope([PLACES[d.id].country]);
  } else if (d.kind === 'place' && d.inst && CARDS.some((c) => c.members.some((m) => m.i === d.inst))) {
    // A university chosen on the globe: its degrees.
    clearGlobeChoice();
    state.where = `inst:${d.inst}`;
    fromGlobe.where = true;
    keepScope([d.country]);
  } else if (d.kind === 'country' && (hasCards(d.id) || LIGHTS[d.id])) {
    if (state.scope === 'here' && CARDS.some((c) => c.members.some((m) => m.d === d.id && m.s === 'here'))) return;
    clearGlobeChoice();
    // A country with no degree mapped narrows to its own page's tile (#62).
    state.where = `dest:${d.id}`;
    state.place = '';
    fromGlobe.where = true;
    keepScope([d.id]);
  } else if ((d.kind === 'view' || d.kind === 'region') && d.nations?.length) {
    // A group dived into, or a continent opened: the cards of the countries it holds (#62).
    const known = d.nations.filter((c) => hasCards(c) || LIGHTS[c]);
    if (!known.length) return;
    if (d.kind === 'region' && d.name) AREA_NAMES.set(known.join(','), d.name);
    clearGlobeChoice();
    state.area = known.join(',');
    fromGlobe.area = true;
    keepScope(known);
  } else if (!d.kind) {
    clearGlobeChoice();
    // The globe's "World": the whole view, so no distance either.
    if (d.reset && state.scope) state.scope = '';
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

const LABELS = { q: 'Search', field: 'Subject', where: 'Where', place: 'Place', area: 'On the globe', award: 'IB award', open: 'Open entry', nomath: 'No Maths HL needed', scope: 'Distance' };

/* A continent chosen on the globe is named by its name, not counted (globe
   levels round 1: "26 countries" beside a door saying 25). */
const AREA_NAMES = new Map();
function chosenLabel(key, value) {
  if (key === 'area' && AREA_NAMES.has(value)) return `${LABELS.area}: ${AREA_NAMES.get(value)}`;
  if (key === 'area') {
    const codes = value.split(',');
    return `${LABELS.area}: ${codes.length <= 2 ? codes.map(destName).join(', ') : plural(codes.length, 'country', 'countries')}`;
  }
  if (key === 'where' && value.startsWith('dest:') && ![...(els.where?.options || [])].some((o) => o.value === value)) return destName(value.slice(5));
  if (key === 'award') return els.award && value === els.award.dataset.value ? 'Accepts Course Results' : `${LABELS.award}: ${value}`;
  if (key === 'scope') {
    const b = els.presets.find((x) => x.dataset.scope === value);
    return b ? `${b.querySelector('.preset__eyebrow')?.textContent} · ${b.querySelector('.preset__title')?.textContent}` : value;
  }
  const el = els[key];
  const option = el && el.options ? [...el.options].find((o) => o.value === value) : null;
  return option ? option.textContent.trim().replace(/\s*\(\d+\)$/, '') : value;
}

/* --- A word that names no degree ------------------------------------------------ *
 *
 * "psychology" and "law" are the name of no degree on the map, and answering
 * them with "No degrees" was a dead end (home round 2). The degrees whose own
 * descriptions use the word — or a word that shares its stem, "economist" and
 * "economics" — are the nearest thing on the map, and their subject areas are
 * the way on. Read from each degree's description (discover.mjs `w`); no list
 * of synonyms, and nothing here names a subject.
 */
const searchTerms = (q) => String(q || '').toLowerCase().split(/\s+/).filter((t) => t.length >= 3);
const stemMatch = (t, w) => w === t || w === `${t}s` || (t.length >= 6 && w.startsWith(t.slice(0, t.length - 2)));
function nearest(st = state) {
  const terms = searchTerms(st.q);
  if (!terms.length) return new Map();
  const rest = { ...st, q: '' };
  const out = new Map();
  CARDS.forEach((c, n) => {
    const hits = c.members.filter((m) => {
      if (!matches(m, rest)) return false;
      const words = `${m.q} ${m.w || ''}`.split(/[^\p{L}]+/u);
      return terms.every((t) => words.some((w) => stemMatch(t, w)));
    });
    if (hits.length) out.set(n, hits);
  });
  return out;
}

/* No degree matches: the nearest degrees and their subject areas, any guide
   whose title shares a word with the search ("medicine" has a guide even
   where no degree is mapped yet), and a way out for each filter that is on. */
const GUIDES = DATA.guides || [];
function renderWays(near) {
  if (!els.ways) return;
  const on = Object.entries(state).filter(([k, v]) => v && k !== 'scope');
  const quoted = state.q ? `“${state.q.trim()}”` : '';
  const nearCount = near.size;
  if (els.emptyLine) {
    els.emptyLine.textContent = on.length === 1 && on[0][0] === 'q'
      ? `Nothing on the map is called ${quoted} yet${nearCount ? `, but it comes up in ${plural(nearCount, 'programme')} below.` : '.'}`
      : on.length === 1 ? 'No degree matches that yet.' : 'No degree matches all of those yet.';
  }
  const ways = on.map(([k, v]) => {
    const label = k === 'place' ? PLACES[v]?.name || v : v === true ? LABELS[k] : k === 'q' ? `“${v}”` : chosenLabel(k, v);
    return `<li><button type="button" class="chip" data-clear="${k}">Without ${esc(label)}</button></li>`;
  });
  const terms = searchTerms(state.q).filter((t) => t.length > 3);
  const guides = terms.length ? GUIDES.filter((g) => terms.some((t) => g.t.toLowerCase().includes(t))).slice(0, 3) : [];
  // The subject areas of the nearest degrees, most degrees first.
  const fields = new Map();
  for (const hits of near.values()) for (const m of hits) fields.set(m.f, (fields.get(m.f) || 0) + 1);
  const fieldChips = [...fields].sort((a, b) => b[1] - a[1]).slice(0, 4)
    .map(([f]) => `<li><button type="button" class="chip" data-field-go="${esc(f)}">All ${esc(f)} degrees</button></li>`);
  els.ways.innerHTML = [
    ...guides.map((g) => `<li class="discover__guide"><a class="arrow-link" href="${esc(g.h)}">${esc(g.t)}</a></li>`),
    ...fieldChips,
    ...ways,
    ways.length > 1 ? '<li><button type="button" class="chip" data-clear-all>Clear all</button></li>' : '',
  ].join('');
}
els.ways?.addEventListener('click', (e) => {
  const go = e.target.closest('[data-field-go]');
  if (go) {
    // From a word to its subject area: the area replaces the word.
    state.field = go.dataset.fieldGo;
    state.q = '';
    syncControls();
    choose();
    return;
  }
  const b = e.target.closest('[data-clear]');
  if (!b) return;
  const k = b.dataset.clear;
  state[k] = EMPTY[k];
  syncControls();
  choose();
});

/* When the count changes out of sight, a pill says it and takes you there
   (home round 1), at every width (round 2, bug 7). It sits under the masthead
   once the words above the globe have scrolled away, and at the foot while
   they are on screen, so it never covers the eyebrow (round 2, bug 1). */
let pillEl = null;
let lastPill = '';
let countSeen = true;
let leadSeen = true;
if ('IntersectionObserver' in window) {
  if (els.count) new IntersectionObserver(([e]) => { countSeen = e.isIntersecting; if (countSeen && pillEl) pillEl.hidden = true; }).observe(els.count);
  const lead = document.querySelector('.discover__lead');
  if (lead) new IntersectionObserver(([e]) => { leadSeen = e.isIntersecting; pillEl?.classList.toggle('discover__pill--low', leadSeen); }).observe(lead);
}
function pill(text) {
  if (text === lastPill) return;
  const first = !lastPill;
  lastPill = text;
  if (first || countSeen) { if (pillEl) pillEl.hidden = true; return; }
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
  pillEl.classList.toggle('discover__pill--low', leadSeen);
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

/* The researched countries a choice lands on, after its cards: a door's own
   (Nearby ends with the European countries researched so far, not only the
   one whose degrees are mapped), or, for a word with nothing near it, every
   one in reach. Null when none belong. */
/** A tile's Destination code (discover.mjs stamps it on the tile's link). */
const codeOf = (li) => li.querySelector('[data-code]')?.dataset.code || '';

function placesFor(shown, near) {
  if (!els.places) return null;
  const all = [...els.places.querySelectorAll('[data-scope]')];
  /* A country chosen on the globe whose degrees are not mapped yet: its tile,
     so what is under the globe is what the globe chose (#62). */
  const door = doorWhere();
  if (door) {
    const tiles = all.filter((li) => codeOf(li) === door);
    return tiles.length ? { tiles, line: 'Its degrees are not mapped one by one yet. Its own page:' } : null;
  }
  const area = state.area ? state.area.split(',') : null;
  const inScope = all.filter((li) => (!state.scope || li.dataset.scope === state.scope) && (!area || area.includes(codeOf(li))));
  if (!inScope.length) return null;
  if (geoOnly()) {
    return { tiles: inScope, line: shown
      ? `${plural(inScope.length, 'more country', 'more countries')} researched, their degrees not yet mapped one by one:`
      : 'Their degrees are not mapped one by one yet. Each country has its own page:' };
  }
  if (!shown && !near.size && state.q && inScope.length) {
    return { tiles: inScope, line: `${plural(inScope.length, 'researched country', 'researched countries')} to explore instead:` };
  }
  return null;
}

function render() {
  const shown = hitsFor(state);
  let cardsShown = 0;
  // Nothing matches a word: the degrees near it stand in (nearest).
  const near = shown === 0 && state.q ? nearest() : new Map();
  for (const [n, c] of CARDS.entries()) {
    const hit = shown ? c.members.filter((m) => matches(m)).length : near.get(n)?.length || 0;
    const el = cardEls.get(n);
    if (el) el.hidden = hit === 0;
    if (hit) cardsShown++;
  }
  const any = Object.values(state).some(Boolean);
  /* Any filter opens the folded cards, so no result waits behind "Show all";
     clearing them folds the cards again only if this opened them. */
  if (els.more) {
    if (any && !els.more.open) { els.more.open = true; els.more.dataset.auto = ''; }
    else if (!any && 'auto' in els.more.dataset) { els.more.open = false; delete els.more.dataset.auto; }
    els.more.toggleAttribute('data-filtering', any);
    /* Filtered, the results are one grid: the folded cards join the first
       ones, so two matches sit side by side rather than one above the fold
       line and one below it; unfiltered, they go back behind "Show all". */
    const folded = els.more.querySelector('.discover__cards');
    if (folded && any) els.results.append(...folded.children);
    else if (folded && !any) folded.append(...[...els.results.children].slice(FIRST_SHOWN));
  }
  const places = placesFor(shown, near);
  const door = doorWhere();
  const doorOnly = (geoOnly() || !!door) && !!places;
  els.count.innerHTML = !any
    ? `<b>${TOTAL}</b> programmes`
    : shown
    ? `<b>${cardsShown}</b> of ${TOTAL} programmes`
    : door && places
    ? `<b>${esc(destName(door))}</b> researched, no programme mapped yet`
    : doorOnly && places
    ? `<b>${plural(places.tiles.length, 'country', 'countries')}</b> researched`
    : near.size
    ? `${plural(near.size, 'programme').replace(/^(\d+)/, '<b>$1</b>')} near “${esc(state.q.trim())}”`
    : '<b>No degrees</b>';
  if (!shown && !doorOnly) renderWays(near);
  pill(els.count.textContent);
  if (els.places) {
    els.places.hidden = !places;
    const keep = new Set(places?.tiles || []);
    for (const li of els.places.querySelectorAll('[data-scope]')) li.hidden = !keep.has(li);
    if (places && els.placesLine) els.placesLine.textContent = places.line;
  }
  if (els.empty) els.empty.hidden = shown > 0 || doorOnly;

  const badge = els.sheetOpen?.querySelector('[data-n]');
  const n = ['field', 'where', 'place', 'area', 'award', 'open', 'nomath'].filter((k) => state[k]).length;
  if (badge) badge.textContent = n ? ` (${n})` : '';
  for (const b of document.querySelectorAll('[data-show]')) {
    b.textContent = shown ? `Show ${plural(cardsShown, 'programme')}` : 'Nothing matches: close';
  }
  for (const b of els.presets) b.setAttribute('aria-pressed', String(state.scope === b.dataset.scope));

  renderActive();
  chipCounts();
  paintMap(near);
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
  for (const k of ['q', 'field', 'where', 'place', 'area', 'award', 'scope']) {
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
  /* An entry the globe made (#country=…, #place=…, #region=…) narrowed the
     cards by its choice: that narrowing is the globe's again, not a filter
     that re-weights the globe. */
  const globeEntry = /^#(place|country|region|view)=/.test(location.hash);
  fromGlobe = { ...NONE, where: globeEntry && !!state.where, area: globeEntry && !!state.area };
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

/* --- The filter sheet ---------------------------------------------------------------- *
 *
 * "Filters" opens the questions and chips as a sheet at every width (home
 * round 2: the form in the hero read as admin and pushed every photograph
 * below the fold): a full-screen sheet on a phone, a drawer beside the page on
 * a wider screen.
 */

function setSheet(open) {
  sheetIsOpen = open;
  els.form?.toggleAttribute('data-sheet', open);
  els.sheetOpen?.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('has-sheet', open);
  if (open) els.sheet?.querySelector('select, button:not([data-sheet-close])')?.focus();
  else els.sheetOpen?.focus({ preventScroll: true });
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
/* On a wide screen the sheet is a drawer: a click on the dimmed page beside
   it closes it, as Close does. */
document.addEventListener('click', (e) => {
  if (!sheetIsOpen || !els.sheet || els.sheet.contains(e.target)) return;
  e.preventDefault();
  e.stopPropagation();
  history.back();
}, true);

/* --- Wiring ---------------------------------------------------------------------------- */

for (const b of els.presets) {
  b.addEventListener('click', () => {
    state.scope = state.scope === b.dataset.scope ? '' : b.dataset.scope;
    // A distance replaces a place picked inside another one.
    state.place = '';
    state.area = '';
    fromGlobe = { ...NONE };
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
