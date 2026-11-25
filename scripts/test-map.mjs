/** Student-facing guarantees for the country-level globe (ADR 0005).
 * Browser review checks drawing and phone layout; this gate covers the fallback,
 * motion contract, local assets and the places that must be available to choose.
 * Home/filter/history interactions execute the real listeners in test-controls.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { isEnglishStudyOption } from '../src/lib/schools.mjs';
import { continentOf } from '../src/lib/continents.mjs';
import { runGlobeRuntimeTests } from './lib/globe-runtime-test.mjs';
import { checkCountryDetailAssets } from './lib/globe-detail-assets.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const read = (file) => fsSync.readFileSync(path.join(ROOT, file), 'utf8');
const css = read('src/assets/css/primitives.css');
const siteCss = read('src/assets/css/site.css');
const entryJs = read('src/assets/js/map.js');
const globeJs = read('src/assets/js/globe.js');
const primitives = read('src/lib/primitives.mjs');
const layout = read('src/lib/layout.mjs');
const worldWindowSrc = (primitives.match(/export function worldWindow\([\s\S]*?\n\}\n/) || [''])[0];
let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  ok    ${name}`); }
  catch (e) { failures++; console.log(`  FAIL  ${name}\n          ${String(e.message).slice(0, 800)}`); }
}
const decl = (source, selector, prop) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const block = source.match(new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`));
  return block?.[1].match(new RegExp(`(?:^|;|\\n)\\s*${prop}\\s*:\\s*([^;]+)`))?.[1].trim() || null;
};
console.log('\nGlobe\n');

check('one local pastel globe replaces the satellite, street map and travel vehicle', () => {
  assert.ok(worldWindowSrc, 'worldWindow() is missing');
  assert.doesNotMatch(worldWindowSrc, /<svg/i, 'a second map is drawn before the globe');
  assert.equal(/globe-close|maplibre|world__vehicle|earth-day|earth-clouds|earth-detail|EOxCloudless|OpenFreeMap/i.test(entryJs + globeJs + css + primitives), false,
    'a removed mode is still referenced by the runtime or styles');
  for (const file of ['src/assets/js/globe-close.js', 'src/assets/vendor/maplibre-gl/maplibre-gl.js', 'src/assets/vendor/maplibre-gl/maplibre-gl.css', 'scripts/make-globe-textures.mjs']) {
    assert.equal(fsSync.existsSync(path.join(ROOT, file)), false, `${file} remains`);
  }
  assert.doesNotMatch(globeJs.replaceAll('http://www.w3.org/2000/svg', ''), /https?:\/\//, 'the globe depends on another host');
});

check('the globe loads near the viewport, with a stable transparent stage and eager still', () => {
  assert.match(entryJs, /await import\('\.\/globe\.js'\)/);
  assert.match(entryJs, /IntersectionObserver/);
  assert.doesNotMatch(entryJs, /^\s*import[^;]*['"]\.\/globe\.js['"]/m);
  assert.equal(decl(css, '.world__stage', 'background'), 'transparent');
  assert.match(decl(css, '.world__stage', 'border') || '', /^(0|none)$/);
  assert.match(decl(css, '.world__stage', 'aspect-ratio') || '', /^\d+ \/ \d+$/);
  assert.match(globeJs, /alpha: true, premultipliedAlpha: true/);
  assert.match(globeJs, /gl\.clearColor\(0, 0, 0, 0\)/);
  assert.match(worldWindowSrc, /loading="eager" fetchpriority="high"/);
  assert.match(layout, /rel="preload" as="image"/);
  for (const name of ['discover-map', 'index-countries']) for (const theme of ['', '-dark']) {
    const file = path.join(ROOT, 'src/assets/img/globe', `poster-${name}${theme}.webp`);
    const bytes = fsSync.statSync(file).size;
    assert.ok(bytes > 1000 && bytes < 90 * 1024, `${file}: ${bytes} bytes`);
  }
});

function fallbackFigure() {
  const rows = ['one', 'two'].map(id => ({
    dataset: { place: id }, badge: { textContent: '' }, attrs: new Map(),
    querySelector() { return this.badge; },
    toggleAttribute(k, on) { on ? this.attrs.set(k, '') : this.attrs.delete(k); },
    setAttribute(k, v) { this.attrs.set(k, v); },
    removeAttribute(k) { this.attrs.delete(k); },
  }));
  const fold = { open: false };
  return {
    rows, fold, dataset: {}, hasAttribute: () => false,
    querySelector: () => fold, querySelectorAll: () => rows,
  };
}
function fallbackController(figure, search) {
  const enhance = vm.runInNewContext(entryJs.replace('export function enhanceWorld', 'function enhanceWorld') + '\nenhanceWorld;', {
    URLSearchParams, location: { search }, window: {}, document: { querySelectorAll: () => [] },
  });
  return enhance(figure);
}
check('without WebGL, the real controller opens the list and keeps counts, dimming and selection usable', () => {
  for (const search of ['', '?map=off']) {
    const figure = fallbackFigure();
    const controller = fallbackController(figure, search);
    assert.equal(controller.mode, 'off');
    assert.equal(figure.dataset.globe, 'off');
    assert.equal(figure.fold.open, true);
    controller.setCounts(new Map([['one', 4]]), { selected: 'one' });
    assert.equal(figure.rows[0].badge.textContent, '4');
    assert.equal(figure.rows[0].attrs.get('aria-current'), 'true');
    assert.equal(figure.rows[1].attrs.has('data-dim'), true);
    controller.setCounts(new Map([['two', 2]]));
    assert.equal(figure.rows[0].attrs.has('aria-current'), false);
    assert.equal(figure.rows[1].badge.textContent, '2');
    assert.equal(figure.rows[1].attrs.has('data-dim'), false);
  }
});
check('failed or lost WebGL and JavaScript-off retain the list fallback', () => {
  assert.match(entryJs, /catch\s*\(err\)\s*\{[\s\S]{0,500}noGlobe\(/);
  assert.match(entryJs, /onFail:\s*\(\w*\)\s*=>\s*noGlobe\(/);
  assert.match(globeJs, /webglcontextlost/);
  assert.match(css, /:root:not\(\[data-js\]\) \.world__off/);
  assert.match(css, /\.world\[data-globe="off"\] \.world__off\s*\{\s*display:\s*block/);
  assert.match(worldWindowSrc, /class="world__off"/);
});

check('phone controls and card sit outside the stage, with thumb-sized controls', () => {
  assert.match(globeJs, /if \(narrowMQ\.matches\) \{\s*stage\.before\(controls\);\s*stage\.after\(card\);/);
  assert.equal(decl(css, '.world > .world__controls', 'position'), 'static');
  assert.equal(decl(css, '.world > .world__card', 'position'), 'relative');
  assert.match(css, /@media \(max-width: 44rem\)[\s\S]{0,200}\.world__stage\s*\{[^}]*aspect-ratio/);
  assert.match(siteCss, /--tap:\s*44px/);
  assert.match(css, /@media \(pointer: coarse\)\s*\{\s*\.world__pin::before, \.world__cluster::before\s*\{[^}]*width:\s*var\(--tap\)/);
});

check('the page scrolls until the globe is engaged, and one gesture steps one level', () => {
  const wheel = globeJs.match(/addEventListener\(\s*'wheel',\s*\(e\)\s*=>\s*\{([\s\S]{0,2500}?)\n  \}, \{ passive: false \}\);/)?.[1];
  assert.ok(wheel, 'wheel handler missing');
  const guard = wheel.search(/if\s*\(\s*!engaged\s*&&\s*!e\.ctrlKey\s*&&\s*!e\.metaKey\s*\)/);
  assert.ok(guard >= 0 && wheel.indexOf('e.preventDefault()') > guard, 'wheel cancels page scrolling before engagement');
  assert.match(globeJs, /touchAction\s*=\s*engaged \? 'none' : 'pan-y'/);
  assert.match(globeJs, /let pinch = null/);
  assert.match(globeJs, /wheelStep\(e\)/);
  assert.match(globeJs, /held < 900/);
});

check('reduced motion arrives instantly, and rendering pauses offscreen and in hidden tabs', () => {
  assert.match(globeJs, /getAttribute\('data-motion'\)\s*===\s*'reduced'/);
  assert.match(globeJs, /prefers-reduced-motion: reduce/);
  const fly = globeJs.match(/function flyTo\([\s\S]*?\n  \}/)?.[0];
  assert.match(fly || '', /if \(reducedMotion\(\)\) \{[\s\S]{0,200}Object\.assign\(view, to\)[\s\S]{0,200}return;/);
  assert.match(globeJs, /let idle = !reducedMotion\(\)/);
  assert.match(globeJs, /idle && !reducedMotion\(\)/);
  assert.match(globeJs, /document\.hidden/);
  assert.match(globeJs, /new IntersectionObserver/);
  const cap = Number(globeJs.match(/const DPR_CAP = ([\d.]+)/)?.[1]);
  assert.ok(cap > 0 && cap <= 2, 'device pixel ratio must be capped');
});

check('the list names every place and cards use real accessible links', () => {
  assert.doesNotMatch(worldWindowSrc, /tabindex/, 'the build adds a second tab stop per place');
  assert.match(globeJs, /class: 'world__pins', 'aria-hidden': 'true'/);
  assert.doesNotMatch(globeJs, /world__pin[^\n]*tabindex/i);
  assert.match(globeJs, /class: 'world__card-link', href/);
  assert.match(css, /\.world__card-link::after\s*\{[^}]*position:\s*absolute;[^}]*inset:\s*0/);
  assert.match(globeJs, /class: 'visually-hidden' \}, ` — \$\{label\}`\)/);
  assert.match(worldWindowSrc, /inst: s\.inst/);
  assert.match(worldWindowSrc, /schools: d\.schools/);
});

{
  const { load } = await import('../src/lib/data.mjs');
  const { centroid } = await import('../src/pages/destinations.mjs');
  const { insideRings, kmToRings } = await import('../src/lib/geo.mjs');
  const borders = JSON.parse(await fs.readFile(path.join(ROOT, 'src', 'assets', 'geo', 'borders-50m.json'), 'utf8'));
  const ringsOf = new Map();
  for (const c of borders.countries) if (c.id) ringsOf.set(c.id, [...(ringsOf.get(c.id) || []), ...c.rings]);
  const site = await load({ quiet: true });
  const lights = [];
  for (const c of site.countries) {
    const at = centroid(c);
    if (at) lights.push({ what: `${c.name} (its country light)`, country: c.code, ...at });
    for (const i of c.institutions || []) if (i.coords) lights.push({ what: i.shortName || i.name, country: c.code, ...i.coords });
  }
  for (const p of site.graph?.places?.values() || []) {
    if (p.coordinates && p.destination) lights.push({ what: p.id, country: p.destination, ...p.coordinates });
  }
  const ABROAD = new Map([
    ['hu-vienna-austria', 'Central European University is accredited in Hungary and teaches in Vienna'],
  ]);
  const placeOf = new Map();
  for (const c of site.countries) for (const i of c.institutions || []) if (i.place) placeOf.set(i.shortName || i.name, i.place);
  const misplaced = lights
    .filter((l) => !ABROAD.has(l.what) && !ABROAD.has(placeOf.get(l.what)))
    .filter((l) => ringsOf.has(l.country))
    .filter((l) => {
      const rings = ringsOf.get(l.country);
      return !insideRings(l.lat, l.lon, rings) && kmToRings(l.lat, l.lon, rings) > 30;
    })
    .map((l) => `${l.what} [${l.country}] at ${l.lat.toFixed(2)}, ${l.lon.toFixed(2)}`);
  check(`every light sits inside its own country (${lights.length} lights, within 30 km of the 50m outline)`, () => {
    assert.deepEqual(misplaced, [], 'these lights are drawn outside their own country');
  });

  const shallow = [];
  for (const c of site.countries) {
    const rings = ringsOf.get(c.code);
    const at = centroid(c);
    if (!rings || !at) continue;
    let w = Infinity, e = -Infinity, s = Infinity, n = -Infinity;
    for (const r of rings) for (let i = 0; i < r.length; i += 2) { w = Math.min(w, r[i]); e = Math.max(e, r[i]); s = Math.min(s, r[i + 1]); n = Math.max(n, r[i + 1]); }
    let deepest = 0;
    const N = 36;
    for (let i = 0; i <= N; i++) {
      for (let j = 0; j <= N; j++) {
        const lat = s + ((n - s) * i) / N, lon = w + ((e - w) * j) / N;
        if (insideRings(lat, lon, rings)) deepest = Math.max(deepest, kmToRings(lat, lon, rings));
      }
    }
    const depth = insideRings(at.lat, at.lon, rings) ? kmToRings(at.lat, at.lon, rings) : 0;
    if (depth < deepest / 3) shallow.push(`${c.code}: ${Math.round(depth)} km deep, the country goes to ${Math.round(deepest)} km`);
  }
  check('every country\'s light is at its middle, not at a campus near its edge', () => {
    assert.deepEqual(shallow, [], 'these country lights sit near an edge rather than in the middle');
  });

  const { schoolsOf } = await import('../src/pages/destinations.mjs');
  const missing = [];
  const initials = [];
  let schoolCount = 0, withPhoto = 0;
  for (const c of site.countries) {
    const list = schoolsOf(site, c);
    if (c.researchDepth?.tier !== 'outline') {
      schoolCount += list.length;
      withPhoto += list.filter((x) => x.image).length;
    }
    const fullName = new Map((c.institutions || []).map((i) => [i.key || i.id, i.name]));
    for (const x of list) {
      const full = fullName.get(x.id);
      if (x.name === full) continue;
      const words = new Set(full.toLowerCase().split(/[^\p{L}'’-]+/u));
      if (full.length <= 26 || !x.name.split(/\s+/).every((w) => words.has(w.toLowerCase()))) initials.push(`${x.id}: "${x.name}" for "${full}"`);
    }
    initials.push(...list.filter((x) => /^[A-Z][A-Za-z]?[A-Z][A-Z-]*$/.test(x.name) && fullName.get(x.id) !== x.name).map((x) => `${x.id}: ${x.name}`));
    const ids = new Set(list.map((s) => s.id));
    for (const i of c.institutions || []) {
      if (isEnglishStudyOption(i) && i.coords && i.href && !ids.has(i.key)) missing.push(`${c.code}: ${i.key}`);
    }
  }
  check('every public institution with a position rides on its country\'s light, for the globe\'s schools level', () => {
    assert.deepEqual(missing, [], 'these institutions would never show as their own dot when their country is zoomed into');
    assert.deepEqual(initials, [], 'these schools are named by their initials on the globe');
    assert.ok(withPhoto >= schoolCount * 0.8, `only ${withPhoto} of ${schoolCount} schools on the globe carry a photograph for their card`);
  });
}

check('every country names a continent from the shared vocabulary', () => {
  for (const file of fsSync.readdirSync(path.join(ROOT, 'data/countries')).filter(f => f.endsWith('.json'))) {
    const record = JSON.parse(read(`data/countries/${file}`));
    assert.ok(continentOf(record), `${file} has no known continent`);
  }
});

check('every destination has bounded and clipped 10m detail with proven islands, water and date-line coverage', () => checkCountryDetailAssets(ROOT));

try {
  const scenarios = await runGlobeRuntimeTests();
  console.log(`  ok    real mount, counts, choices, navigation and gestures (${scenarios} DOM/WebGL-double scenarios; no pixel validation)`);
} catch (error) {
  failures++;
  console.log(`  FAIL  globe runtime: ${error.message}`);
}

console.log(failures ? `\n${failures} failing\n` : '\nAll globe guards pass\n');
process.exit(failures ? 1 : 0);
