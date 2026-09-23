/* The interaction layer for the world window.
 *
 * The picture arrives finished. `worldWindow()` draws the coastline, projects
 * every place and writes the geometry onto each marker at build time, so the
 * map is already a map with JavaScript switched off. This file only adds the
 * things a still picture cannot do: light the marker that matches the list
 * entry under the pointer, light the list entry that matches the marker, group
 * the places that land on top of each other, and move the camera.
 *
 * Two decisions run through all of it.
 *
 * The markers are decoration and are marked as such. They are inside an SVG
 * with `role="img"`, they take no focus and they have no accessible name of
 * their own, because the list directly beneath names every place, counts it,
 * links to it, and is already a control. Focusable markers would have doubled
 * every tab stop on the page with a worse copy of the entry below — and worse,
 * a marker that disappears into a group when you zoom is a control that
 * disappears while you are using it. So the list is the control surface, the
 * map carries three buttons of its own, and nothing here is reachable only by
 * pointer except the grouping, which is a way of looking rather than a task.
 *
 * Motion explains a camera move and nothing else. Both the operating system's
 * setting and the in-product toggle turn every transition into an instant
 * state change, which is the point of them — a reduced-motion reader still
 * gets the new view, just without the journey.
 */

const root = document.documentElement;

const reducedMotion = () =>
  root.getAttribute('data-motion') === 'reduced' ||
  matchMedia('(prefers-reduced-motion: reduce)').matches;

const MAX_K = 8;
const STEP = 1.7;
/**
 * Two markers are grouped when they are closer than their own radii put
 * together: touching is readable, hiding is not. Tying it to the radii rather
 * than to a fixed distance means a map of big lights groups sooner than a map
 * of small ones, which is what a reader actually sees.
 */
const overlaps = (dist, a, b) => dist < (a.r + b.r) * 0.95;
/**
 * Below this much separation in the base frame, even the closest zoom leaves
 * two places on top of each other: they are two records at one coordinate.
 */
const SAME_PLACE = 3;

const attached = new WeakMap();

/**
 * Wire up one `<figure class="world">`. Safe to call twice — the second call
 * hands back the same controller, which is how the explorer gets hold of the
 * map that the build already rendered for it.
 */
export function enhanceWorld(figure) {
  if (!figure) return null;
  const existing = attached.get(figure);
  if (existing) return existing;

  const svg = figure.querySelector('.world__svg');
  const stage = figure.querySelector('.world__stage');
  const marks = figure.querySelector('.world__marks');
  const groupLayer = figure.querySelector('.world__groups');
  const land = figure.querySelector('.world__land');
  const list = figure.querySelector('.world__list');
  const caption = figure.querySelector('.world__caption');
  if (!svg || !stage || !marks || !groupLayer) return null;

  const W = Number(svg.dataset.w) || 1000;
  const H = Number(svg.dataset.h) || 420;
  const layer = activeLayer(svg);

  const places = [...marks.querySelectorAll('.world__place')].map((el) => ({
    el,
    id: el.dataset.place,
    name: el.dataset.name || el.dataset.place,
    href: el.dataset.href || '',
    state: el.dataset.state || '',
    // The wording comes with the marker rather than living here: one phrase,
    // written where the record is read.
    cue: el.dataset.cue || '',
    x: Number(el.dataset.x),
    y: Number(el.dataset.y),
    r: Number(el.dataset.r),
    count: Number(el.dataset.count) || 0,
    glow: el.querySelector('.world__glow'),
    dot: el.querySelector('.world__dot'),
    hit: el.querySelector('.world__hit'),
  }));
  const byId = new Map(places.map((p) => [p.id, p]));

  const links = new Map();
  for (const a of list ? list.querySelectorAll('a[data-place]') : []) links.set(a.dataset.place, a);

  /* --- The furniture the still picture does not need ---------------------- */

  const controls = el('div', { class: 'world__controls' });
  const zoomIn = button('Zoom in', '+');
  const zoomOut = button('Zoom out', '−');
  const zoomReset = button('Show the whole frame', 'Reset');
  zoomReset.classList.add('world__btn--wide');
  controls.append(zoomIn, zoomOut, zoomReset);

  const callout = el('div', { class: 'world__callout', 'aria-hidden': 'true', hidden: '' });
  const calloutName = el('b', { class: 'world__callout-name' });
  const calloutCount = el('span', { class: 'world__callout-count' });
  const calloutCue = el('span', { class: 'world__callout-cue' });
  callout.append(calloutName, calloutCount, calloutCue);

  stage.append(controls, callout);
  // A marker is worth pointing at only where activating it goes somewhere. On a
  // country page the markers are institutions with nowhere of their own to open,
  // so they light up and stay markers.
  stage.dataset.reachable = String(places.some((p) => p.href));
  stage.tabIndex = 0;
  stage.setAttribute('role', 'group');
  stage.setAttribute('aria-label', `${layer}. Arrow keys pan, plus and minus zoom, zero shows the whole frame.`);

  const status = el('p', { class: 'visually-hidden', role: 'status', 'aria-live': 'polite' });
  figure.append(status);

  if (caption) {
    caption.append(
      el('span', { class: 'world__legend world__legend--hint' },
        'Drag or use the arrow keys to move the map, + and − to zoom. Every place is in the list either way.')
    );
  }

  /* --- View --------------------------------------------------------------- */

  /* `view` is what is on screen; `goal` is where it is heading. They are
     separate because a reader who presses + twice quickly means twice, and
     multiplying by whatever the animation happened to have reached when the
     second press landed means something between once and twice. */
  const view = { k: 1, tx: 0, ty: 0 };
  const goal = { k: 1, tx: 0, ty: 0 };
  let spider = null;      // a group fanned out because zooming cannot separate it
  let lit = null;         // the place id currently lit, from either direction
  let raf = 0;

  const sx = (p) => p.x * view.k + view.tx;
  const sy = (p) => p.y * view.k + view.ty;

  /** Never let the frame's edge come inside the panel: there is nothing there. */
  function clampPan(v) {
    v.k = Math.min(MAX_K, Math.max(1, v.k));
    v.tx = Math.min(0, Math.max(W * (1 - v.k), v.tx));
    v.ty = Math.min(0, Math.max(H * (1 - v.k), v.ty));
    return v;
  }

  function moveTo(next, { announce = true } = {}) {
    const from = { ...view };
    const to = clampPan({ ...goal, ...next });
    Object.assign(goal, to);
    spider = null;

    if (reducedMotion() || (from.k === to.k && from.tx === to.tx && from.ty === to.ty)) {
      cancelAnimationFrame(raf);
      Object.assign(view, to);
      render();
      if (announce) say();
      return;
    }

    cancelAnimationFrame(raf);
    const t0 = performance.now();
    // Moving the camera is the site's "overview to detail", so it borrows that
    // duration from the motion tokens rather than inventing one here.
    const DUR = parseFloat(getComputedStyle(root).getPropertyValue('--motion-overview-to-detail-ms')) || 420;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / DUR);
      const e = ease(t);
      view.k = from.k + (to.k - from.k) * e;
      view.tx = from.tx + (to.tx - from.tx) * e;
      view.ty = from.ty + (to.ty - from.ty) * e;
      render();
      if (t < 1) raf = requestAnimationFrame(tick);
      else if (announce) say();
    };
    raf = requestAnimationFrame(tick);
  }

  /** Zoom about a point in panel coordinates, so the thing under it stays put. */
  function zoomBy(factor, px = W / 2, py = H / 2) {
    const k = Math.min(MAX_K, Math.max(1, goal.k * factor));
    const ratio = k / goal.k;
    moveTo({ k, tx: px - (px - goal.tx) * ratio, ty: py - (py - goal.ty) * ratio });
  }

  /** Fit a set of places, with room around them. */
  function fit(members) {
    const xs = members.map((m) => m.x);
    const ys = members.map((m) => m.y);
    const pad = 70;
    const w = Math.max(...xs) - Math.min(...xs) + pad * 2;
    const h = Math.max(...ys) - Math.min(...ys) + pad * 2;
    const k = Math.min(MAX_K, Math.max(1, Math.min(W / w, H / h)));
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
    const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    moveTo({ k, tx: W / 2 - cx * k, ty: H / 2 - cy * k });
  }

  /* --- Grouping ------------------------------------------------------------ */

  /**
   * Places that land within a marker's width of each other at this zoom are
   * drawn as one group carrying the number of places in it. Sorting by size and
   * hoping the small one pokes out — which is what this replaced — is not a
   * solution, it is a picture of the problem.
   */
  function groupsFor(visible) {
    const left = [...visible].sort((a, b) => b.r - a.r);
    const out = [];
    while (left.length) {
      const seed = left.shift();
      const members = [seed];
      for (let i = left.length - 1; i >= 0; i--) {
        const d = Math.hypot(sx(left[i]) - sx(seed), sy(left[i]) - sy(seed));
        if (overlaps(d, seed, left[i])) members.push(...left.splice(i, 1));
      }
      out.push(members);
    }
    return out;
  }

  const spread = (members) => {
    const xs = members.map((m) => m.x);
    const ys = members.map((m) => m.y);
    return Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  };

  /* --- Drawing ------------------------------------------------------------- */

  function render() {
    const t = `translate(${view.tx.toFixed(2)} ${view.ty.toFixed(2)}) scale(${view.k.toFixed(4)})`;
    if (land) land.setAttribute('transform', t);

    const inPanel = places.filter((p) => {
      const x = sx(p);
      const y = sy(p);
      return x > -40 && x < W + 40 && y > -40 && y < H + 40;
    });

    const fanned = spider ? new Set(spider.members.map((m) => m.id)) : null;
    const groups = groupsFor(fanned ? inPanel.filter((p) => !fanned.has(p.id)) : inPanel);

    const shown = new Map();   // place id -> where its own marker sits, if it has one
    groupLayer.replaceChildren();

    for (const members of groups) {
      if (members.length === 1) {
        shown.set(members[0].id, [sx(members[0]), sy(members[0])]);
        continue;
      }
      groupLayer.append(groupNode(members));
    }

    if (spider) {
      const n = spider.members.length;
      const radius = 18 + n * 6;
      spider.members.forEach((m, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        shown.set(m.id, [spider.cx + Math.cos(a) * radius, spider.cy + Math.sin(a) * radius]);
      });
      groupLayer.append(spiderNode(spider, radius));
    }

    for (const p of places) {
      const at = shown.get(p.id);
      p.el.toggleAttribute('hidden', !at);
      if (!at) continue;
      p.el.setAttribute('transform', `translate(${(at[0] - p.x).toFixed(2)} ${(at[1] - p.y).toFixed(2)})`);
    }

    stage.dataset.zoomed = String(view.k > 1.001);
    stage.style.touchAction = view.k > 1.001 ? 'none' : '';
    zoomReset.disabled = view.k <= 1.001 && !spider;
    zoomIn.disabled = view.k >= MAX_K - 0.001;
    zoomOut.disabled = view.k <= 1.001;
    if (lit) paintCallout(lit);
  }

  function groupNode(members) {
    const cx = members.reduce((s, m) => s + sx(m), 0) / members.length;
    const cy = members.reduce((s, m) => s + sy(m), 0) / members.length;
    const r = 13 + Math.min(9, Math.sqrt(members.length) * 3);
    const g = svgEl('g', { class: 'world__group', 'data-group': members.map((m) => m.id).join(' ') });
    if (!members.some((m) => m.count > 0)) g.setAttribute('data-dim', '');
    if (members.some((m) => m.el.hasAttribute('data-selected'))) g.setAttribute('data-selected', '');
    g.append(
      svgEl('circle', { class: 'world__group-ring', cx, cy, r: r + 5 }),
      svgEl('circle', { class: 'world__group-dot', cx, cy, r }),
      text(String(members.length), cx, cy),
      svgEl('circle', { class: 'world__hit', cx, cy, r: r + 6 })
    );
    return g;
  }

  function spiderNode(s, radius) {
    const g = svgEl('g', { class: 'world__spider' });
    g.append(svgEl('circle', { class: 'world__spider-hub', cx: s.cx, cy: s.cy, r: 3 }));
    const n = s.members.length;
    s.members.forEach((m, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      g.append(
        svgEl('line', {
          class: 'world__spider-leg',
          x1: s.cx, y1: s.cy,
          x2: s.cx + Math.cos(a) * radius,
          y2: s.cy + Math.sin(a) * radius,
        })
      );
    });
    return g;
  }

  /* --- Lighting, both ways ------------------------------------------------- */

  /**
   * One id lights one place; a group's whole membership lights all of them.
   * The key is the space-separated id list either way, so hovering a marker and
   * hovering the list entry beneath it end up in exactly the same state.
   */
  function light(key, { fromMap = false } = {}) {
    if (lit === key) return;
    lit = key;
    const on = new Set(key ? key.split(' ') : []);
    for (const p of places) p.el.toggleAttribute('data-on', on.has(p.id));
    for (const [pid, a] of links) a.toggleAttribute('data-on', on.has(pid));
    for (const g of groupLayer.querySelectorAll('.world__group')) {
      g.toggleAttribute('data-on', g.dataset.group.split(' ').some((id) => on.has(id)));
    }
    if (!key) {
      callout.hidden = true;
      return;
    }
    paintCallout(key);
    // Following a list entry with the eye is only useful if the marker is in
    // view; a marker the reader is already pointing at plainly is.
    if (!fromMap) reveal([...on][0]);
  }

  function paintCallout(key) {
    const ids = key.split(' ');
    const members = ids.map((id) => byId.get(id)).filter(Boolean);
    if (!members.length) { callout.hidden = true; return; }

    const group = [...groupLayer.querySelectorAll('.world__group')]
      .find((g) => g.dataset.group.split(' ').some((id) => ids.includes(id)));
    const inGroup = group ? group.dataset.group.split(' ').length : 1;

    if (members.length > 1) {
      // A group is not one of its members wearing the others' numbers.
      calloutName.textContent = `${members.length} places here`;
      calloutCount.textContent = String(members.reduce((n, m) => n + m.count, 0));
      calloutCount.hidden = false;
      calloutCue.textContent = `${members.map((m) => m.name).join(', ')} — zoom in to separate them`;
      calloutCue.hidden = false;
    } else {
      const p = members[0];
      calloutName.textContent = p.name;
      calloutCount.textContent = p.count ? String(p.count) : '';
      calloutCount.hidden = !p.count;
      const cue = [
        p.state,
        p.cue,
        inGroup > 1 ? `Grouped with ${inGroup - 1} more here — zoom in to separate` : '',
      ].filter(Boolean).join(' · ');
      calloutCue.textContent = cue;
      calloutCue.hidden = !cue;
    }

    const at = group
      ? [Number(group.querySelector('.world__group-dot').getAttribute('cx')),
         Number(group.querySelector('.world__group-dot').getAttribute('cy'))]
      : [sx(members[0]), sy(members[0])];
    callout.style.left = `${(at[0] / W) * 100}%`;
    callout.style.top = `${(at[1] / H) * 100}%`;
    callout.dataset.side = at[1] / H > 0.6 ? 'above' : 'below';
    callout.dataset.align = at[0] / W > 0.7 ? 'right' : at[0] / W < 0.3 ? 'left' : 'centre';
    callout.hidden = false;
  }

  /** Bring a place into the panel if the camera has wandered off it. */
  function reveal(id) {
    const p = byId.get(id);
    if (!p || goal.k <= 1.001) return;
    const x = sx(p);
    const y = sy(p);
    const m = 60;
    if (x > m && x < W - m && y > m && y < H - m) return;
    moveTo({ tx: W / 2 - p.x * goal.k, ty: H / 2 - p.y * goal.k }, { announce: false });
  }

  /* --- Acting -------------------------------------------------------------- */

  /**
   * One event for both views. The map does not know what a filter is; the
   * explorer listens for this and filters, and where nothing listens the
   * default is the same link the list entry carries.
   */
  function choose(id) {
    const p = byId.get(id);
    if (!p) return;
    const ev = new CustomEvent('world:select', { detail: { id, name: p.name, href: p.href }, cancelable: true, bubbles: true });
    if (figure.dispatchEvent(ev) && p.href) location.href = p.href;
  }

  function openGroup(ids) {
    const members = ids.map((id) => byId.get(id)).filter(Boolean);
    if (!members.length) return;
    // Two campuses in one city share a coordinate, and no amount of zoom will
    // ever put daylight between them. Those fan out; everything else is a
    // crowd that a closer look resolves honestly.
    if (spread(members) < SAME_PLACE) {
      spider = {
        members,
        cx: members.reduce((s, m) => s + sx(m), 0) / members.length,
        cy: members.reduce((s, m) => s + sy(m), 0) / members.length,
      };
      render();
      say(`${members.length} places in the same spot, fanned out.`);
    } else {
      fit(members);
    }
  }

  /**
   * What the camera did, for a reader who cannot see it move. Said in places
   * rather than in pixels, and it distinguishes a place that is grouped from a
   * place that has gone off the edge, because those are different problems with
   * different answers.
   */
  function say(message) {
    if (message) { status.textContent = message; return; }
    const alone = places.filter((p) => !p.el.hasAttribute('hidden')).length;
    const grouped = [...groupLayer.querySelectorAll('.world__group')]
      .reduce((n, g) => n + g.dataset.group.split(' ').length, 0);
    const off = places.length - alone - grouped;
    status.textContent = [
      view.k > 1.001 ? `Zoomed to ${view.k.toFixed(1)} times.` : 'Showing the whole frame.',
      ` ${alone} of ${places.length} places on their own`,
      grouped ? `, ${grouped} grouped` : '',
      off ? `, ${off} outside the view` : '',
      '.',
    ].join('');
  }

  /* --- Pointer ------------------------------------------------------------- */

  const hitOf = (target) => (target instanceof Element ? target.closest('.world__place, .world__group') : null);

  svg.addEventListener('pointermove', (e) => {
    if (dragging) return;
    const node = hitOf(e.target);
    if (!node) { light(null); return; }
    light(node.classList.contains('world__group') ? node.dataset.group : node.dataset.place, { fromMap: true });
  });
  svg.addEventListener('pointerleave', () => { if (!dragging) light(null); });

  svg.addEventListener('click', (e) => {
    if (moved) return;
    const node = hitOf(e.target);
    if (!node) {
      // Clicking the sea closes a fan, the way clicking away closes anything.
      if (spider) { spider = null; render(); }
      return;
    }
    if (node.classList.contains('world__group')) openGroup(node.dataset.group.split(' '));
    else choose(node.dataset.place);
  });

  let dragging = false;
  let moved = false;
  let from = null;

  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || goal.k <= 1.001) return;
    if (e.target.closest('.world__controls')) return;
    dragging = true;
    moved = false;
    // A fan is drawn where the markers were when it opened; moving the camera
    // out from under it would leave it pointing at nothing.
    spider = null;
    cancelAnimationFrame(raf);
    from = { x: e.clientX, y: e.clientY, tx: goal.tx, ty: goal.ty };
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const unit = W / stage.getBoundingClientRect().width;
    const dx = (e.clientX - from.x) * unit;
    const dy = (e.clientY - from.y) * unit;
    if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
    view.tx = from.tx + dx;
    view.ty = from.ty + dy;
    clampPan(view);
    Object.assign(goal, view);
    render();
  });
  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    try { stage.releasePointerCapture(e.pointerId); } catch {}
    if (moved) say();
    setTimeout(() => { moved = false; }, 0);
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  /* --- Keyboard ------------------------------------------------------------ */

  stage.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const pan = 70;
    const keys = {
      ArrowLeft: () => moveTo({ tx: goal.tx + pan }),
      ArrowRight: () => moveTo({ tx: goal.tx - pan }),
      ArrowUp: () => moveTo({ ty: goal.ty + pan }),
      ArrowDown: () => moveTo({ ty: goal.ty - pan }),
      '+': () => zoomBy(STEP),
      '=': () => zoomBy(STEP),
      '-': () => zoomBy(1 / STEP),
      _: () => zoomBy(1 / STEP),
      0: () => moveTo({ k: 1, tx: 0, ty: 0 }),
      Escape: () => moveTo({ k: 1, tx: 0, ty: 0 }),
    };
    const act = keys[e.key];
    if (!act) return;
    e.preventDefault();
    act();
  });

  zoomIn.addEventListener('click', () => zoomBy(STEP));
  zoomOut.addEventListener('click', () => zoomBy(1 / STEP));
  zoomReset.addEventListener('click', () => moveTo({ k: 1, tx: 0, ty: 0 }));

  /* --- The list, which is the other half of every one of these ------------- */

  for (const [id, a] of links) {
    a.addEventListener('pointerenter', () => light(id));
    a.addEventListener('pointerleave', () => light(null));
    a.addEventListener('focus', () => light(id));
    a.addEventListener('blur', () => light(null));
    a.addEventListener('click', (e) => {
      // A place outside the frame has no marker, and still has an entry here:
      // the list does not lose a place because of where the camera is.
      const p = byId.get(id);
      const detail = { id, name: p ? p.name : a.textContent.trim(), href: p ? p.href : a.getAttribute('href') };
      const ev = new CustomEvent('world:select', { detail, cancelable: true, bubbles: true });
      if (!figure.dispatchEvent(ev)) e.preventDefault();
    });
  }

  const controller = {
    figure,
    /**
     * Re-weight the markers from a filtered set. The same rule as the
     * primitive: area means how much is here, never how good it is.
     */
    setCounts(counts, { selected = '' } = {}) {
      const max = Math.max(1, ...counts.values());
      for (const p of places) {
        const n = counts.get(p.id) || 0;
        p.count = n;
        p.r = n ? 4 + Math.sqrt(n / max) * 9 : 3.5;
        p.el.dataset.count = String(n);
        p.el.toggleAttribute('data-dim', n === 0);
        // Selection and hover are different states and must not overwrite each
        // other: a student can hover Aarhus while the list is filtered to Odense.
        p.el.toggleAttribute('data-selected', !!selected && p.id === selected);
        p.dot.setAttribute('r', p.r.toFixed(1));
        p.glow.setAttribute('r', (p.r * 2.6).toFixed(1));
        p.hit.setAttribute('r', Math.max(p.r + 8, 14).toFixed(1));
        const a = links.get(p.id);
        if (a) {
          const badge = a.querySelector('.world__count');
          if (badge) badge.textContent = String(n);
          a.toggleAttribute('data-dim', n === 0);
          if (p.id === selected) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        }
      }
      svg.setAttribute('aria-label', `${layer}: ${counts.size} of ${places.length} places match the current filters.`);
      render();
    },
    reset() { moveTo({ k: 1, tx: 0, ty: 0 }, { announce: false }); },
  };

  render();
  attached.set(figure, controller);
  return controller;
}

/* --- Small helpers --------------------------------------------------------- */

function activeLayer(svg) {
  return (svg.getAttribute('aria-label') || 'Map').split(':')[0];
}

function el(tag, attrs = {}, textContent) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (textContent) node.textContent = textContent;
  return node;
}

function svgEl(tag, attrs = {}) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, typeof v === 'number' ? v.toFixed(2) : v);
  return node;
}

function text(value, x, y) {
  const node = svgEl('text', { x, y, class: 'world__group-count' });
  node.textContent = value;
  return node;
}

function button(label, glyph) {
  const b = el('button', { type: 'button', class: 'world__btn', 'aria-label': label, title: label });
  b.textContent = glyph;
  return b;
}

/* Every build-time map on the page, wired the moment the module runs. Modules
   are deferred, so the document is already parsed and nothing here races the
   markup it depends on. */
for (const figure of document.querySelectorAll('.world[data-world]')) enhanceWorld(figure);
