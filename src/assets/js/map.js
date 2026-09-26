/* The world window's entry point. ADR 0005, ADR 0007.
 *
 * Every page with a map loads this file and nothing else, and it decides
 * whether a figure gets the globe:
 *
 *   - **The globe** (`globe.js`), where WebGL is there. It is imported only
 *     when the figure comes near the viewport, and its textures and geometry
 *     are fetched then too, so a page whose map is far down pays nothing for it
 *     until the reader gets there. Until its first frame the stage is empty
 *     and transparent — the size the globe will be, so nothing moves when it
 *     lands, and nothing else is drawn first (the owner, #53: the old flat map
 *     flashed before every globe, so it was removed).
 *
 *   - **The list alone** everywhere else: no WebGL, a context the browser
 *     refused, drew only in software, or later lost, frames the machine
 *     cannot keep up with, or the globe failing to load. The figure is marked
 *     `data-globe="off"` (with the reason in `data-globe-off`), primitives.css
 *     hides the stage and shows one line saying the places are in the list, and
 *     a folded list opens. `?map=off` forces this for testing; `?map=globe`
 *     skips the software and frame-rate checks.
 *
 * With JavaScript off neither runs, and the list is the world window, which is
 * what `worldWindow()` guarantees at build time.
 *
 * Either way the caller gets the same controller back, straight away:
 *
 *   - `setCounts(Map<placeId, n>, { selected })` re-weights the lights from a
 *     filtered set (zero dims a light and its list entry);
 *   - `show(spec)` goes somewhere by data — `{ place }`, `{ country }`,
 *     `{ bounds: { north, south, west, east }, label }` or `{ camera }`;
 *     without the globe it does nothing and returns false;
 *   - `reset()` returns to the page's resting view.
 *
 * `setCounts()` and the latest `show()` are remembered and replayed if the
 * globe is not there yet. Two events come from the figure: `world:select`
 * (the card's action — cancel it to handle the choice yourself, as the
 * explorer filters) and `world:choose` (a place, country or group chosen or
 * cleared on the globe; see globe.js).
 */

const attached = new WeakMap();

function globeRuledOut() {
  if (new URLSearchParams(location.search).get('map') === 'off') return 'asked for no globe';
  if (!('WebGLRenderingContext' in window)) return 'no WebGL';
  if (!('IntersectionObserver' in window) || !('ResizeObserver' in window)) return 'an old browser';
  return '';
}

/** Run `fn` once the element is within a screen or so of the viewport. */
function whenNear(node, fn) {
  const io = new IntersectionObserver((entries, obs) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    obs.disconnect();
    fn();
  }, { rootMargin: '400px 0px' });
  io.observe(node);
}

/** Without the globe the list is the whole map: its badges and dimming still
    follow the filters, as the pins would. */
function paintList(figure, counts, { selected = '' } = {}) {
  for (const a of figure.querySelectorAll('.world__list a[data-place]')) {
    const id = a.dataset.place;
    const n = counts.get(id) || 0;
    const badge = a.querySelector('.world__count');
    if (badge) badge.textContent = String(n);
    a.toggleAttribute('data-dim', n === 0);
    if (selected && id === selected) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  }
}

export function enhanceWorld(figure) {
  if (!figure) return null;
  const existing = attached.get(figure);
  if (existing) return existing;

  let engine = null;
  let off = false;
  let last = null;
  let pendingShow = null;
  const controller = {
    figure,
    setCounts(counts, opts = {}) {
      last = [counts, opts];
      if (engine) engine.setCounts(counts, opts);
      else if (off) paintList(figure, counts, opts);
    },
    reset() { engine?.reset(); },
    show(spec, opts) {
      if (engine?.show) return engine.show(spec, opts);
      if (!engine && !off) pendingShow = [spec, opts];
      return false;
    },
    /** 'globe', 'off' (the list alone), or 'waiting' while the globe loads. */
    get mode() { return engine ? 'globe' : off ? 'off' : 'waiting'; },
    /** The globe's own controller, for QA scripts and the home page; null without it. */
    get globe() { return engine || null; },
  };
  attached.set(figure, controller);

  const noGlobe = (why) => {
    if (engine?.destroy) engine.destroy();
    engine = null;
    off = true;
    pendingShow = null;
    figure.dataset.globeOff = why || 'the globe stopped';
    figure.dataset.globe = 'off';
    /* The list is the map now: a folded one opens. */
    const fold = figure.querySelector('.world__fold');
    if (fold) fold.open = true;
    if (last) paintList(figure, ...last);
  };

  const why = globeRuledOut();
  if (why) { noGlobe(why); return controller; }

  figure.dataset.globe = 'waiting';
  whenNear(figure, async () => {
    figure.dataset.globe = 'loading';
    try {
      const { mountGlobe } = await import('./globe.js');
      engine = await mountGlobe(figure, { onFail: (why) => noGlobe(why || 'the WebGL context was lost') });
      if (last) engine.setCounts(...last);
      if (pendingShow) { engine.show(...pendingShow); pendingShow = null; }
    } catch (err) {
      console.warn('[world] the globe could not start; the list is the map.', err?.message || err);
      /* Say why: "software renderer: …" or "WebGL refused …" is what a person
         debugging a school laptop needs to read off data-globe-off. */
      noGlobe(err?.message ? String(err.message).slice(0, 120) : 'the globe could not start');
    }
  });
  return controller;
}

/* Every world window on the page, wired the moment the module runs. Modules
   are deferred, so the document is already parsed and nothing here races the
   markup it depends on. */
for (const figure of document.querySelectorAll('.world[data-world]')) enhanceWorld(figure);
