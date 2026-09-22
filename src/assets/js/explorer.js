/* The programme explorer.
 *
 * One query state drives the URL, the map, the list and the counts. There is no
 * second copy of the filter logic for the map — the map is drawn *from* the
 * filtered list, so the two cannot disagree. That is the whole point of the
 * synchronisation requirement: a student who filters and then looks at the map
 * must be looking at the same set.
 *
 * Everything works without the map, without a pointer, and without motion. The
 * list is the interaction source of truth; the map is an enhancement of it.
 */

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

const W = 1000;
const H = 380;

function drawMap(hits) {
  if (!els.map) return;

  // Count hits per place. The map is derived from the filtered list, never
  // filtered separately.
  const counts = new Map();
  for (const p of hits) {
    if (p.placeId) counts.set(p.placeId, (counts.get(p.placeId) || 0) + 1);
  }

  const all = Object.values(PLACES);
  if (!all.length) {
    els.map.innerHTML = '';
    return;
  }

  const lats = all.map((p) => p.lat);
  const lons = all.map((p) => p.lon);
  const pad = 1.2;
  const box = {
    north: Math.max(...lats) + pad,
    south: Math.min(...lats) - pad,
    west: Math.min(...lons) - pad,
    east: Math.max(...lons) + pad,
  };

  const merc = (deg) => Math.log(Math.tan(Math.PI / 4 + (deg * Math.PI) / 360));
  const yTop = merc(box.north);
  const yBottom = merc(box.south);
  const project = (lat, lon) => ({
    x: ((lon - box.west) / (box.east - box.west)) * W,
    y: ((yTop - merc(lat)) / (yTop - yBottom)) * H,
  });

  const max = Math.max(1, ...counts.values());
  const dots = all
    .map((p) => {
      const { x, y } = project(p.lat, p.lon);
      const n = counts.get(p.id) || 0;
      return { ...p, x, y, n, r: n ? 5 + Math.sqrt(n / max) * 11 : 4 };
    })
    .sort((a, b) => b.r - a.r);

  const shown = dots.filter((d) => d.n > 0).length;

  els.map.innerHTML = `
  <figure class="world" id="explorer-map">
    <div class="world__stage">
      <svg viewBox="0 0 ${W} ${H}" class="world__svg" role="img"
           aria-label="${shown} of ${dots.length} places have programmes matching the current filters.">
        <defs>
          <radialGradient id="explorer-glow">
            <stop offset="0%" stop-color="var(--brand-2)" stop-opacity=".85"/>
            <stop offset="70%" stop-color="var(--brand-2)" stop-opacity=".16"/>
            <stop offset="100%" stop-color="var(--brand-2)" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <g class="world__graticule" aria-hidden="true">
          ${[0.25, 0.5, 0.75].map((f) => `<line x1="0" y1="${(H * f).toFixed(0)}" x2="${W}" y2="${(H * f).toFixed(0)}"/>`).join('')}
          ${[0.25, 0.5, 0.75].map((f) => `<line x1="${(W * f).toFixed(0)}" y1="0" x2="${(W * f).toFixed(0)}" y2="${H}"/>`).join('')}
        </g>
        ${dots
          .map(
            (d, i) => `
          <g class="world__place" style="--i:${i}" data-place="${esc(d.id)}"
             ${d.n ? '' : 'data-dim="true"'}>
            ${d.n ? `<circle cx="${d.x.toFixed(1)}" cy="${d.y.toFixed(1)}" r="${(d.r * 2.4).toFixed(1)}" fill="url(#explorer-glow)" aria-hidden="true"/>` : ''}
            <circle cx="${d.x.toFixed(1)}" cy="${d.y.toFixed(1)}" r="${d.r.toFixed(1)}" class="world__dot"
                    ${d.precision && d.precision !== 'campus' ? 'data-approx="true"' : ''}/>
          </g>`
          )
          .join('')}
      </svg>
    </div>

    <ul class="world__list" aria-label="Places with matching programmes">
      ${dots
        .map(
          (d) => `<li>
            <a href="#prog-results" data-place="${esc(d.id)}"
               aria-pressed="${state.place === d.id}"
               ${d.n ? '' : 'data-dim="true"'}>
              <span class="world__name">${esc(d.name)}</span>
              <span class="world__count">${d.n}</span>
            </a>
          </li>`
        )
        .join('')}
    </ul>

    <figcaption class="world__caption">
      <span class="world__legend">
        <span class="world__legend-dot world__legend-dot--sm"></span>
        <span class="world__legend-dot world__legend-dot--lg"></span>
        Larger means more programmes here — not a better place.
      </span>
      ${dots.some((d) => d.precision && d.precision !== 'campus')
        ? '<span class="world__legend">Hollow markers are city-level, not an exact campus.</span>'
        : ''}
      ${state.place ? `<span><button type="button" class="chip chip--inline" data-place-clear>Showing ${esc(PLACES[state.place]?.name || state.place)} only — clear</button></span>` : ''}
    </figcaption>
  </figure>`;

  // Selecting a place from either view filters both.
  for (const el of els.map.querySelectorAll('[data-place]')) {
    el.addEventListener('click', (e) => {
      const id = el.dataset.place;
      if (!PLACES[id]) return;
      e.preventDefault();
      state.place = state.place === id ? '' : id;
      render();
      document.getElementById('prog-count')?.focus?.();
    });
  }
  els.map.querySelector('[data-place-clear]')?.addEventListener('click', () => {
    state.place = '';
    render();
  });
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
  drawMap(hits);
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
