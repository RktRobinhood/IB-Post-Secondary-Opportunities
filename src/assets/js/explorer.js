/* The programme explorer.
 *
 * One query state drives the URL, the map, the list and the counts. There is no
 * second copy of the filter logic for the map — the map is drawn *from* the
 * filtered list, so the two cannot disagree. That is the whole point of the
 * synchronisation requirement: a student who filters and then looks at the map
 * must be looking at the same set.
 *
 * Nor is there a second copy of the map. This page used to draw its own dot
 * cloud here — its own projection, its own bounding box, its own graticule of
 * lines at fractions of the panel that were never meridians — which is why the
 * coastline that landed under every other map on the site did not land under
 * this one, and why Denmark was a different shape here than on its own page.
 * The picture now comes from `worldWindow()` like every other, drawn at build
 * time, so it is there before this file runs and stays there if this file never
 * does. All that is left to do is re-weight it as the filters change.
 *
 * Everything works without the map, without a pointer, and without motion. The
 * list is the interaction source of truth; the map is an enhancement of it.
 */

import { enhanceWorld } from './map.js';

const root = document.documentElement;
const BASE = root.dataset.base === '/' ? '' : root.dataset.base;
const json = (id) => {
  const el = document.getElementById(id);
  return el ? JSON.parse(el.textContent) : null;
};

const PROGRAMMES = json('programme-data') || [];
const PLACES = json('place-data') || {};

const state = { q: '', field: '', inst: '', campus: '', place: '', open: false, nomath: false };

const els = {
  q: document.getElementById('f-q'),
  field: document.getElementById('f-field'),
  inst: document.getElementById('f-inst'),
  campus: document.getElementById('f-campus'),
  open: document.getElementById('f-open'),
  nomath: document.getElementById('f-nomath'),
  reset: document.getElementById('f-reset'),
  count: document.getElementById('prog-count'),
  active: document.getElementById('prog-active'),
  results: document.getElementById('prog-results'),
  map: document.getElementById('prog-map'),
};

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/* --- Filtering --------------------------------------------------------------- */

/** Does this programme demand Mathematics A on every available route? */
function needsMathsA(p) {
  const e = p.entry;
  if (!e) return /mathematics\s+a\b/i.test(p.requirements || '');
  if ((e.all || []).some((r) => r.subject === 'Mathematics' && r.level === 'A')) return true;
  // Only counts if EVERY alternative demands it — otherwise there is a way round.
  const groups = e.oneOf || [];
  return groups.length > 0 && groups.every((g) => g.some((r) => r.subject === 'Mathematics' && r.level === 'A'));
}

function matches(p) {
  if (state.field && p.field !== state.field) return false;
  if (state.inst && p.institutionId !== state.inst) return false;
  if (state.campus && p.campus !== state.campus) return false;
  if (state.place && p.placeId !== state.place) return false;
  if (state.open && p.restricted) return false;
  if (state.nomath && needsMathsA(p)) return false;
  if (state.q) {
    const terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.every((t) => p.search.includes(t))) return false;
  }
  return true;
}

/* --- The map ----------------------------------------------------------------- */

/* The figure is already in the page, coastline and all. `enhanceWorld` hands
   back the same controller `map.js` attached to it on load, so hover, focus,
   grouping and the camera are wired once and this file only tells it what the
   current filters make of each place. */
const world = enhanceWorld(els.map?.querySelector('.world'));

/* Choosing a place — from the marker or from the list entry beneath it — is a
   filter here, not a link. The map does not know that; it asks, and this
   answers. */
world?.figure.addEventListener('world:select', (e) => {
  e.preventDefault();
  const id = e.detail.id;
  if (!PLACES[id]) return;
  state.place = state.place === id ? '' : id;
  render();
});

function paintMap(hits) {
  if (!world) return;
  // Counted from the filtered list, never filtered a second time.
  const counts = new Map();
  for (const p of hits) {
    if (p.placeId) counts.set(p.placeId, (counts.get(p.placeId) || 0) + 1);
  }
  world.setCounts(counts, { selected: state.place });
}

/* --- Rendering ---------------------------------------------------------------- */

function row(p) {
  const meta = [p.degree, p.campus, p.ects ? `${p.ects} ECTS` : null].filter(Boolean);
  return `
  <li class="prog" data-place="${esc(p.placeId)}">
    <div>
      <h3 class="prog__name"><a href="${BASE}${p.href}">${esc(p.name)}</a></h3>
      <p class="prog__meta">
        <span><strong>${esc(p.institution)}</strong></span>
        ${meta.map((m) => `<span>${esc(m)}</span>`).join('')}
      </p>
      ${p.summary ? `<p class="prog__req">${esc(p.summary)}</p>` : ''}
    </div>
    <div class="prog__side">
      ${p.requirements ? `<p class="prog__req"><strong>Requires:</strong> ${esc(p.requirements)}</p>` : ''}
      ${p.restricted
        ? '<p><span class="tag tag--warn">Restricted admission</span></p>'
        : '<p><span class="tag tag--ok">Open admission</span></p>'}
      ${p.cutoff ? `<p><small>Most recent cut-off ${esc(p.cutoff)} — history, not a forecast.</small></p>` : ''}
    </div>
  </li>`;
}

const LABELS = { q: 'Search', field: 'Field', inst: 'Institution', campus: 'City', place: 'Place', open: 'Open admission', nomath: 'No Maths A' };

function renderActive() {
  if (!els.active) return;
  const chips = [];
  for (const [k, v] of Object.entries(state)) {
    if (!v) continue;
    const label = k === 'place' ? PLACES[v]?.name || v : v === true ? LABELS[k] : `${LABELS[k]}: ${v}`;
    chips.push(`<li>${esc(label)} <button type="button" data-clear="${k}" aria-label="Remove ${esc(label)}">×</button></li>`);
  }
  els.active.innerHTML = chips.join('');
  for (const b of els.active.querySelectorAll('[data-clear]')) {
    b.addEventListener('click', () => {
      const k = b.dataset.clear;
      state[k] = typeof state[k] === 'boolean' ? false : '';
      if (els[k]) {
        if (typeof state[k] === 'boolean') els[k].setAttribute('aria-pressed', 'false');
        else els[k].value = '';
      }
      render();
    });
  }
}

function render() {
  const hits = PROGRAMMES.filter(matches).sort((a, b) => a.name.localeCompare(b.name));

  els.count.innerHTML = hits.length
    ? `<b>${hits.length}</b> of ${PROGRAMMES.length} programmes`
    : '<b>Nothing matches</b>';

  els.results.innerHTML = hits.length
    ? hits.map(row).join('')
    : `<li class="state state--empty"><p><strong>No programme matches those filters.</strong></p>
       <p>Try removing one. The English-taught catalogue in Denmark is small, so two or three filters can empty it quickly.</p></li>`;

  renderActive();
  paintMap(hits);
  syncUrl();
}

/* --- URL state ---------------------------------------------------------------- */

function syncUrl() {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(state)) {
    if (v === true) params.set(k, '1');
    else if (typeof v === 'string' && v) params.set(k, v);
  }
  const qs = params.toString();
  history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
}

function readUrl() {
  const params = new URLSearchParams(location.search);
  for (const k of ['q', 'field', 'inst', 'campus', 'place']) {
    const v = params.get(k);
    if (v) {
      state[k] = v;
      if (els[k]) els[k].value = v;
    }
  }
  for (const k of ['open', 'nomath']) {
    if (params.get(k) === '1') {
      state[k] = true;
      els[k]?.setAttribute('aria-pressed', 'true');
    }
  }
}

/* --- Wiring -------------------------------------------------------------------- */

els.q?.addEventListener('input', (e) => { state.q = e.target.value; render(); });
for (const k of ['field', 'inst', 'campus']) {
  els[k]?.addEventListener('change', (e) => { state[k] = e.target.value; render(); });
}
for (const k of ['open', 'nomath']) {
  els[k]?.addEventListener('click', () => {
    state[k] = !state[k];
    els[k].setAttribute('aria-pressed', String(state[k]));
    render();
  });
}
els.reset?.addEventListener('click', () => {
  Object.assign(state, { q: '', field: '', inst: '', campus: '', place: '', open: false, nomath: false });
  if (els.q) els.q.value = '';
  for (const k of ['field', 'inst', 'campus']) if (els[k]) els[k].value = '';
  for (const k of ['open', 'nomath']) els[k]?.setAttribute('aria-pressed', 'false');
  render();
});
document.getElementById('prog-filters')?.addEventListener('submit', (e) => e.preventDefault());

readUrl();
render();
