/* The world window's entry point. ADR 0005.
 *
 * Every page with a map loads this file and nothing else, and it decides which
 * map a figure gets:
 *
 *   - **The globe** (`globe.js`), where WebGL is there. It is imported only
 *     when the figure comes near the viewport, and its textures and geometry
 *     are fetched then too, so a page whose map is far down pays nothing for it
 *     until the reader gets there. Until its first frame is drawn the
 *     build-time flat SVG is the map, and it stays in the page underneath.
 *
 *   - **The flat map** (`map-flat.js`) everywhere else: no WebGL, a context the
 *     browser refused, drew only in software, or later lost, frames the machine
 *     cannot keep up with, the globe failing to load, or `?map=flat` in the
 *     address (`?map=globe` skips the software and frame-rate checks). It is the interaction layer that shipped before the
 *     globe, unchanged.
 *
 * With JavaScript off, neither runs and the flat SVG and the list are the map,
 * which is what `worldWindow()` guarantees at build time.
 *
 * Either way the caller gets the same controller back, straight away:
 * `setCounts()` and `reset()` are remembered and replayed if the engine is not
 * there yet, and `world:select` is dispatched on the figure by both.
 */
import { enhanceFlat } from './map-flat.js';

const attached = new WeakMap();

function globeRuledOut() {
  if (new URLSearchParams(location.search).get('map') === 'flat') return 'asked for the flat map';
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

export function enhanceWorld(figure) {
  if (!figure) return null;
  const existing = attached.get(figure);
  if (existing) return existing;

  let engine = null;
  let last = null;
  const controller = {
    figure,
    setCounts(counts, opts = {}) {
      last = [counts, opts];
      engine?.setCounts(counts, opts);
    },
    reset() { engine?.reset(); },
    /** 'globe', 'flat', or 'waiting' while the globe loads. */
    get mode() { return engine ? (engine.debug ? 'globe' : 'flat') : 'waiting'; },
    /** The globe's own controller, for QA scripts; null on the flat map. */
    get globe() { return engine?.debug ? engine : null; },
  };
  attached.set(figure, controller);

  const flat = (why) => {
    if (engine?.destroy) engine.destroy();
    if (why) figure.dataset.globeOff = why;
    figure.dataset.globe = 'off';
    engine = enhanceFlat(figure);
    if (engine && last) engine.setCounts(...last);
  };

  const why = globeRuledOut();
  if (why) { flat(why); return controller; }

  figure.dataset.globe = 'waiting';
  whenNear(figure, async () => {
    figure.dataset.globe = 'loading';
    try {
      const { mountGlobe } = await import('./globe.js');
      engine = await mountGlobe(figure, { onFail: (why) => flat(why || 'the WebGL context was lost') });
      if (last) engine.setCounts(...last);
    } catch (err) {
      console.warn('[world] the globe could not start; using the flat map.', err?.message || err);
      /* Say why: "software renderer: …" or "WebGL refused …" is what a person
         debugging a school laptop needs to read off data-globe-off. */
      flat(err?.message ? String(err.message).slice(0, 120) : 'the globe could not start');
    }
  });
  return controller;
}

/* Every build-time map on the page, wired the moment the module runs. Modules
   are deferred, so the document is already parsed and nothing here races the
   markup it depends on. */
for (const figure of document.querySelectorAll('.world[data-world]')) enhanceWorld(figure);
