/*
 * The prototype's one state object, the filters that change it, the list that
 * is its truth, and the two engines that draw a picture of it.
 *
 * The shape is deliberately the shipped site's shape: one `state`, and every
 * surface rendered *from the filtered list* rather than filtered separately.
 * ADR 0003 is why. If the globe is going to overturn that decision it has to do
 * it on the same terms, not by being allowed a private copy of the data.
 */

import { createGlobe } from './globe.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const mark = (name) => performance.mark(name);
mark('app-start');

const root = document.documentElement;
const stage = $('#stage');
const svg = $('.world__svg');
const list = $('#list');
const countEl = $('#count');
const captionEl = $('#caption');
const detail = $('#detail');
const callout = $('#callout');

let forceReduced = false;
const reducedMotion = () =>
  forceReduced ||
  root.getAttribute('data-motion') === 'reduced' ||
  matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --- capability ---------------------------------------------------------
   The globe is an enhancement of a picture that is already on screen. If the
   canvas is not available the page is already correct and this file simply
   stops. That is the whole of the no-WebGL story, and it costs nothing at
   runtime because the flat map was never conditional on the check passing. */

let forceNoCanvas = new URL(location.href).searchParams.has('nocanvas');
function canvasAvailable() {
  if (forceNoCanvas) return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext && c.getContext('2d'));
  } catch { return false; }
}

/* --- data ---------------------------------------------------------------- */

const res = await fetch('data.json');
const payload = await res.json();
mark('data-ready');

const records = payload.records;
const evidence = payload.evidence;
const byId = new Map(records.map((r) => [r.id, r]));

/* --- state --------------------------------------------------------------- */

const state = { scope: 'any', fee: 'any', lang: 'any', selected: null, engine: 'globe' };

const matches = (r) =>
  (state.scope === 'any' || r.scope === state.scope) &&
  (state.fee === 'any' || r.fee === state.fee) &&
  (state.lang === 'any' || (state.lang === 'yes') === r.localLanguage);

let filtered = records.filter(matches);

/* --- the globe ----------------------------------------------------------- */

let globe = null;
let canvas = null;

function mountGlobe() {
  canvas = document.createElement('canvas');
  canvas.className = 'world__canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'A globe showing the places in the result list. The list below is the same information and is the control.');
  stage.insertBefore(canvas, stage.firstChild);
  stage.dataset.engine = 'globe';

  const rings = payload.rings;
  globe = createGlobe(canvas, rings, cssColours());
  if (!globe) { stage.dataset.engine = 'flat'; canvas.remove(); return null; }
  globe.onDraw = ({ behind }) => reportBehind(behind);
  return globe;
}

function cssColours() {
  const cs = getComputedStyle(root);
  const v = (n, d) => (cs.getPropertyValue(n) || '').trim() || d;
  return {
    sea: v('--sea', '#dce6ee'), land: v('--land', '#f6f1e7'), coast: v('--coast', '#5d6b76'),
    dot: v('--dot', '#1f4f6d'), dotDim: v('--dot-dim', 'rgba(31,79,109,.28)'), active: v('--active', '#b8471f'),
  };
}

/* --- the flat engine, for the comparison this prototype exists to make ----
   The shipped map's camera is one attribute. Reproduced here exactly so the
   two engines are timed doing the same job rather than two different jobs. */

const flat = { k: 1, tx: 0, ty: 0 };
const flatLand = svg ? svg.querySelector('.world__land') : null;
const flatMarks = svg ? svg.querySelector('.world__marks') : null;

function flatRender() {
  const t = `translate(${flat.tx} ${flat.ty}) scale(${flat.k})`;
  if (flatLand) flatLand.setAttribute('transform', t);
  if (flatMarks) flatMarks.setAttribute('transform', t);
}

/* --- rendering the state ------------------------------------------------- */

function markerSize(r, max) {
  return 4 + Math.sqrt((r.count || 1) / max) * 8;
}

function render({ moveCamera = false, instant = false } = {}) {
  filtered = records.filter(matches);
  const shown = new Set(filtered.map((r) => r.id));
  const max = Math.max(1, ...filtered.map((r) => r.count || 1));

  // The list first. It is the state; everything else is drawn from it.
  for (const li of $$('#list > li')) {
    const on = shown.has(li.dataset.place);
    li.hidden = !on;
    li.classList.toggle('is-selected', state.selected === li.dataset.place);
  }
  countEl.innerHTML = `<strong>${filtered.length}</strong> place${filtered.length === 1 ? '' : 's'} in view` +
    (state.selected ? `. Showing ${byId.get(state.selected).name}.` : '.');

  if (globe && state.engine === 'globe') {
    globe.setPlaces(
      filtered.map((r) => ({ id: r.id, lat: r.lat, lon: r.lon, r: markerSize(r, max), active: r.id === state.selected, dim: false }))
    );
    if (moveCamera) {
      const target = state.selected ? byId.get(state.selected) : centroid(filtered);
      globe.flyTo({
        lat: target.lat, lon: target.lon,
        k: state.selected ? 1.9 : 1,
        instant: instant || reducedMotion(),
      });
    } else {
      globe.layout(); globe.draw();
    }
  } else {
    for (const g of $$('.world__place', svg)) {
      const on = shown.has(g.dataset.place);
      g.style.display = on ? '' : 'none';
      g.classList.toggle('is-selected', g.dataset.place === state.selected);
    }
    flatRender();
  }

  renderDetail();
}

function centroid(rs) {
  if (!rs.length) return { lat: 25, lon: 10 };
  // Mean direction on the sphere, so a set spanning the date line does not
  // average to the middle of the Atlantic.
  let x = 0, y = 0, z = 0;
  for (const r of rs) {
    const la = r.lat * Math.PI / 180, lo = r.lon * Math.PI / 180, cl = Math.cos(la);
    x += cl * Math.cos(lo); y += Math.sin(la); z += cl * Math.sin(lo);
  }
  return { lat: Math.atan2(y, Math.hypot(x, z)) * 180 / Math.PI, lon: Math.atan2(z, x) * 180 / Math.PI };
}

function reportBehind(n) {
  if (!captionEl) return;
  let el = $('#behind');
  if (!el) { el = document.createElement('span'); el.id = 'behind'; el.className = 'behind'; captionEl.append(el); }
  el.textContent = n > 0
    ? ` ${n} of ${filtered.length} result${filtered.length === 1 ? '' : 's'} ${n === 1 ? 'is' : 'are'} on the far side of the globe — all of them are in the list.`
    : '';
}

/* --- detail panel -------------------------------------------------------- */

function renderDetail() {
  if (!state.selected) { detail.hidden = true; return; }
  const r = byId.get(state.selected);
  detail.hidden = false;
  $('#detailName').textContent = `${r.name}, ${r.destName}`;
  const evIds = [...new Set([...r.feeEvidence, ...r.ibEvidence])];
  $('#detailBody').innerHTML = `
    <dl class="kv">
      <dt>Recorded options here</dt><dd>${r.count || 'None yet'}</dd>
      <dt>Coordinate precision</dt><dd>${r.precision}</dd>
      <dt>Tuition, EU/EEA applicant</dt><dd>${esc(r.feeSummary || labelFee(r.fee))}</dd>
      <dt>English-taught provision</dt><dd>${esc(r.englishTaught || 'Not established here.')}</dd>
      <dt>IB subject rule</dt><dd>${esc(r.ibRule || 'Not established here.')}</dd>
    </dl>
    <h3>Evidence</h3>
    <ul class="ev">${
      evIds.length
        ? evIds.map((id) => {
            const e = evidence[id];
            if (!e) return `<li>${esc(id)} — record not in this slice.</li>`;
            return `<li><a href="${esc(e.sourceUrl)}" rel="noopener">${esc(e.publisher)}</a>
              <span class="ev__meta">${esc(e.sourceClass)} &middot; checked ${esc(e.retrievedAt)} &middot; ${esc(e.verificationState)}</span>
              <span class="ev__claim">${esc(e.claim || '')}</span></li>`;
          }).join('')
        : '<li>No evidence record is attached to this Destination for these fields.</li>'
    }</ul>`;
}

const labelFee = (f) => ({ 'no-fee': 'No fee', 'eu-eea-rate': 'EU/EEA rate', 'international-rate': 'International rate' }[f] || 'Not established here.');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* --- selection ----------------------------------------------------------- */

function select(id, { fromList = false } = {}) {
  state.selected = state.selected === id ? null : id;
  render({ moveCamera: !!state.selected });
  if (state.selected && fromList) detail.focus();
}

list.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-place]');
  if (!btn) return;
  select(btn.dataset.place, { fromList: true });
});

/* Focusing a list entry lights its marker, without moving the camera: a camera
   move on every arrow-key press through a list of 165 is motion that explains
   nothing, which the research doc forbids. */
list.addEventListener('focusin', (e) => {
  const btn = e.target.closest('button[data-place]');
  if (!btn || !globe || state.engine !== 'globe') return;
  const max = Math.max(1, ...filtered.map((r) => r.count || 1));
  globe.setPlaces(filtered.map((r) => ({ id: r.id, lat: r.lat, lon: r.lon, r: markerSize(r, max), active: r.id === btn.dataset.place })));
  globe.draw();
});

$('#detailClose').addEventListener('click', () => { state.selected = null; render(); });

/* --- filters ------------------------------------------------------------- */

$('#filters').addEventListener('change', (e) => {
  const n = e.target.name;
  if (n === 'scope' || n === 'fee' || n === 'lang') {
    state[n] = e.target.value;
    state.selected = null;
    render({ moveCamera: true });
  }
});

/* --- pointer, keyboard, touch -------------------------------------------- */

function wireStage() {
  stage.tabIndex = 0;
  stage.setAttribute('role', 'group');
  stage.setAttribute('aria-label', 'World view. Arrow keys rotate, plus and minus zoom, zero shows the whole world. Everything here is also in the list below.');

  stage.addEventListener('keydown', (e) => {
    if (!globe || state.engine !== 'globe') return;
    const i = reducedMotion();
    const map = {
      ArrowLeft: () => globe.nudge(0, -18, 1, i),
      ArrowRight: () => globe.nudge(0, 18, 1, i),
      ArrowUp: () => globe.nudge(12, 0, 1, i),
      ArrowDown: () => globe.nudge(-12, 0, 1, i),
      '+': () => globe.nudge(0, 0, 1.4, i),
      '=': () => globe.nudge(0, 0, 1.4, i),
      '-': () => globe.nudge(0, 0, 1 / 1.4, i),
      '0': () => globe.flyTo({ lat: 25, lon: 10, k: 1, instant: i }),
    };
    if (map[e.key]) { e.preventDefault(); map[e.key](); }
  });

  // Drag rotates. Wheel does nothing: scrolling the page must not move the
  // camera, and a globe that spins under a scroll is the exact failure the
  // research doc names.
  let drag = null;
  stage.addEventListener('pointerdown', (e) => {
    if (!globe || state.engine !== 'globe') return;
    drag = { x: e.clientX, y: e.clientY, lat: globe.goal.lat, lon: globe.goal.lon, moved: 0 };
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag) {
      if (globe && state.engine === 'globe') hover(e);
      return;
    }
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
    const scale = 0.35 / globe.view.k;
    globe.flyTo({ lat: drag.lat + dy * scale, lon: drag.lon - dx * scale, instant: true });
  });
  const end = (e) => {
    if (drag && drag.moved < 5 && globe && state.engine === 'globe') {
      const rect = canvas.getBoundingClientRect();
      const hit = globe.hitTest(e.clientX - rect.left, e.clientY - rect.top);
      if (hit) select(hit.id);
    }
    drag = null;
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', () => { drag = null; });

  function hover(e) {
    const rect = canvas.getBoundingClientRect();
    const hit = globe.hitTest(e.clientX - rect.left, e.clientY - rect.top);
    if (!hit) { callout.hidden = true; return; }
    const r = byId.get(hit.id);
    callout.hidden = false;
    callout.textContent = `${r.name}, ${r.destName}`;
    callout.style.left = `${hit.sx}px`;
    callout.style.top = `${hit.sy}px`;
  }

  $('#controls').hidden = false;
  $('#controls').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cam]');
    if (!b || !globe) return;
    const i = reducedMotion();
    ({
      left: () => globe.nudge(0, -18, 1, i), right: () => globe.nudge(0, 18, 1, i),
      up: () => globe.nudge(12, 0, 1, i), down: () => globe.nudge(-12, 0, 1, i),
      in: () => globe.nudge(0, 0, 1.4, i), out: () => globe.nudge(0, 0, 1 / 1.4, i),
      reset: () => globe.flyTo({ lat: 25, lon: 10, k: 1, instant: i }),
    })[b.dataset.cam]();
  });

  addEventListener('resize', () => { if (globe) { globe.layout(); globe.draw(); } });
}

/* --- prototype instrumentation, not a product feature -------------------- */

function wireBench() {
  const panel = $('#engine');
  panel.hidden = false;
  panel.addEventListener('change', (e) => {
    if (e.target.name === 'engine') {
      state.engine = e.target.value;
      stage.dataset.engine = state.engine;
      render();
    }
    if (e.target.id === 'forceReduced') forceReduced = e.target.checked;
    if (e.target.id === 'forceNoCanvas') {
      forceNoCanvas = e.target.checked;
      if (forceNoCanvas) { state.engine = 'flat'; stage.dataset.engine = 'flat'; render(); }
    }
  });
  $('#bench').addEventListener('click', runBench);
}

function runBench() {
  const out = $('#benchOut');
  out.hidden = false;
  const lines = [];

  // 1. Globe: cost of one full redraw, which is what a camera move costs.
  if (globe) {
    const prevEngine = state.engine;
    state.engine = 'globe';
    globe.layout();
    const N = 120;
    const t0 = performance.now();
    for (let i = 0; i < N; i++) { globe.view.lon += 1; globe.draw(); }
    const per = (performance.now() - t0) / N;
    lines.push(`globe: ${per.toFixed(2)} ms per full redraw (${N} frames, ${globe.vertexCount} vertices, ${filtered.length} markers)`);
    lines.push(`globe: ${globe.convertMs.toFixed(2)} ms one-off lon/lat -> unit sphere conversion at construction`);
    state.engine = prevEngine;
  }

  // 2. Flat: cost of the same camera move, which is one attribute.
  {
    const N = 120;
    const t0 = performance.now();
    for (let i = 0; i < N; i++) { flat.tx += 1; flatRender(); }
    const per = (performance.now() - t0) / N;
    lines.push(`flat:  ${per.toFixed(3)} ms per camera move (${N} moves, one transform attribute; layout and paint are the browser's, off the main-thread budget this measures)`);
    flat.tx = 0; flatRender();
  }

  // 3. How much of the result set a single globe camera can ever show.
  lines.push(coverage(filtered));

  // 4. Startup marks.
  const m = (n) => { const e = performance.getEntriesByName(n)[0]; return e ? e.startTime : NaN; };
  lines.push(`marks: app-start ${m('app-start').toFixed(0)} ms, data-ready ${m('data-ready').toFixed(0)} ms, first-globe-frame ${m('first-globe-frame').toFixed(0)} ms (navigationStart = 0)`);
  const nav = performance.getEntriesByType('navigation')[0];
  if (nav) lines.push(`nav:   domContentLoaded ${nav.domContentLoadedEventEnd.toFixed(0)} ms, domInteractive ${nav.domInteractive.toFixed(0)} ms`);

  out.textContent = lines.join('\n');
  console.log(lines.join('\n'));
  return lines;
}

/**
 * The globe's hard limit, stated as a number.
 *
 * An orthographic globe shows one hemisphere. So for a given result set there
 * is a minimum number of camera positions from which every result can be seen
 * at all — computed here as a greedy cover over candidate centres, each
 * candidate being one result's own coordinates. The flat map's answer is
 * always 1, because it is a whole-world frame and nothing is behind anything.
 */
function coverage(rs) {
  if (!rs.length) return 'cover: no results';
  const D2R = Math.PI / 180;
  const v = rs.map((r) => {
    const la = r.lat * D2R, lo = r.lon * D2R, cl = Math.cos(la);
    return [cl * Math.cos(lo), Math.sin(la), cl * Math.sin(lo)];
  });
  // Visible means the dot product with the camera direction is > 0. Use a
  // slightly stricter limit: a point within 8 degrees of the limb is edge-on
  // and effectively unreadable.
  const LIMIT = Math.cos(82 * D2R);
  const remaining = new Set(v.keys());
  let rounds = 0;
  while (remaining.size && rounds < 12) {
    let best = -1, bestSeen = null;
    for (const c of remaining) {
      const seen = [...remaining].filter((i) => v[c][0] * v[i][0] + v[c][1] * v[i][1] + v[c][2] * v[i][2] > LIMIT);
      if (seen.length > best) { best = seen.length; bestSeen = seen; }
    }
    for (const i of bestSeen) remaining.delete(i);
    rounds++;
  }
  const single = Math.max(
    ...v.map((c) => v.filter((p) => c[0] * p[0] + c[1] * p[1] + c[2] * p[2] > LIMIT).length)
  );
  return `cover: ${rs.length} results need ${rounds} globe camera position${rounds === 1 ? '' : 's'} to be seen at all; ` +
    `the single best position shows ${single} of ${rs.length} (${Math.round((single / rs.length) * 100)}%). Flat map: 1 position, 100%.`;
}

/* --- go ------------------------------------------------------------------ */

if (canvasAvailable() && mountGlobe()) {
  state.engine = 'globe';
  render();
  mark('first-globe-frame');
  wireStage();
} else {
  state.engine = 'flat';
  stage.dataset.engine = 'flat';
  render();
}
wireBench();

window.__proto = { state, records, globe, runBench, coverage, render };
