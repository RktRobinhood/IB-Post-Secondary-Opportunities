/**
 * Guards on the things about the map that regress silently.
 *
 * Every map defect this repository has shipped was invisible to the test suite
 * and obvious in a browser, which is a bad ratio. The three that reached a
 * reader were: a basemap drawn at 7% opacity, so a map baked specifically to
 * show a coastline showed none; a fixed 1000×420 viewBox, so a phone got a
 * 343×145 letterbox with 14px tap targets; and a `[hidden]` attribute beaten by
 * a component's own `display`, so a filter hid 253 rows and showed all 269.
 *
 * None of those is a logic error. Each is a number in a stylesheet that was
 * plausible when it was written, so none of them would ever fail a unit test of
 * the code. What they have in common is that they are *stated* somewhere — an
 * opacity, an aspect ratio, a pixel size — and the statement can be read back.
 * That is what this file does.
 *
 * It cannot see rendering. It can see that nobody quietly lowered a number
 * somebody else measured.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

let failures = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok    ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL  ${name}\n          ${e.message}`);
  }
};

console.log('\nMaps\n');

const css = await fs.readFile(path.join(ROOT, 'src', 'assets', 'css', 'primitives.css'), 'utf8');
/* The control policy lives in site.css since #34; the map's own styles stay here. */
const siteCss = await fs.readFile(path.join(ROOT, 'src', 'assets', 'css', 'site.css'), 'utf8');
/* map.js decides whether a figure gets the globe; globe.js is the globe. The
   flat map (map-flat.js and the build-time SVG) was removed on 26 September
   2026 at the owner's request (#53, ADR 0007), and its guards with it — the
   ones that still protect something moved to the globe. */
const entryJs = await fs.readFile(path.join(ROOT, 'src', 'assets', 'js', 'map.js'), 'utf8');
const globeJs = await fs.readFile(path.join(ROOT, 'src', 'assets', 'js', 'globe.js'), 'utf8');
const texturesReadme = await fs.readFile(path.join(ROOT, 'src', 'assets', 'img', 'globe', 'README.md'), 'utf8').catch(() => '');
const primitives = await fs.readFile(path.join(ROOT, 'src', 'lib', 'primitives.mjs'), 'utf8');
const layoutMjs = await fs.readFile(path.join(ROOT, 'src', 'lib', 'layout.mjs'), 'utf8');
const worldWindowSrc = (primitives.match(/export function worldWindow\([\s\S]*?\n\}\n/) || [''])[0];

const decl = (source, selector, prop) => {
  const block = source.match(new RegExp(`(?:^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`));
  if (!block) return null;
  const m = block[1].match(new RegExp(`(?:^|;|\\n)\\s*${prop}\\s*:\\s*([^;]+)`));
  return m ? m[1].trim() : null;
};

/* --- One map: the globe, and the list it is drawn from (ADR 0007) --------- */

check('there is no flat map: no build-time SVG, no basemap in the page, no flat interaction layer', () => {
  /* The owner (#53): "when the page loads I see the old map load and then I
     see it getting replaced by the Globe … take out the code for the Old map
     entirely". A second map drawn first is the flash, whatever it looks like. */
  assert.ok(worldWindowSrc, 'worldWindow() is gone from primitives.mjs');
  assert.ok(!/<svg/i.test(worldWindowSrc), 'worldWindow() writes an SVG into the page again — that is the flat map that flashed before the globe');
  assert.ok(!/landPaths|mercatorY|countries\.json/.test(primitives), 'primitives.mjs draws a basemap again');
  assert.ok(!/map-flat|enhanceFlat/.test(entryJs), 'map.js hands over to a flat map again');
});

check('the stage is empty until the globe lands, and keeps its size so nothing moves', () => {
  const stage = worldWindowSrc.match(/<div class="world__stage">([\s\S]*?)<\/div>/);
  assert.ok(stage, 'worldWindow() no longer writes a .world__stage');
  assert.deepEqual(stage[1].replace(/<script type="application\/json" class="world__data">[\s\S]*?<\/script>/, '').trim(), '',
    'something is drawn in the stage before the globe — a different picture first is the flash the owner asked to be rid of');
  assert.match(worldWindowSrc, /class="world__data"/, 'worldWindow() no longer writes the places for the globe');
  assert.match(decl(css, '.world__stage', 'aspect-ratio') || '', /^\d+ \/ \d+$/, 'the stage no longer reserves the globe\'s size, so the page jumps when it lands');
});

check('a narrow viewport gets its own stage shape', () => {
  assert.match(
    css,
    /@media \(max-width: 44rem\)[\s\S]{0,200}\.world__stage\s*\{[^}]*aspect-ratio/,
    'no narrow-viewport aspect-ratio for .world__stage — a phone is back to a letterbox'
  );
});

check('the globe floats: the stage is transparent, with no box, in both themes', () => {
  /* The owner (#53): the dark panel "is kind of hidden in dark mode but is
     obstructive in the light mode … we want the Globe to be floating". */
  assert.equal(decl(css, '.world__stage', 'background'), 'transparent', 'the stage has a background again');
  assert.match(decl(css, '.world__stage', 'border') || '', /^(0|none)$/, 'the stage has a border again');
  assert.match(globeJs, /alpha: true, premultipliedAlpha: true/, 'the globe\'s canvas is no longer transparent');
  assert.match(globeJs, /gl\.clearColor\(0, 0, 0, 0\)/, 'the globe clears to an opaque colour');
  /* The home band used to be a night sky in both themes. Nothing that holds
     the globe may paint a fixed dark colour behind it. */
  const dark = /#0[0-9a-f]{5}\b|#1[0-2][0-9a-f]{4}\b|rgb\(\s*[0-9]\s+[0-9]+\s+[0-9]+\s*\)/i;
  for (const sel of ['.discover__hero', '.discover__globe', '.discover__intro', '.discover__globe .world__stage']) {
    for (const m of siteCss.matchAll(new RegExp(`(?:^|\\n)\\s*${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'g'))) {
      const bg = (m[1].match(/background(?:-color|-image)?\s*:\s*([^;]+)/) || [])[1] || '';
      assert.ok(!dark.test(bg) && !/gradient/.test(bg), `${sel} paints "${bg.trim()}" behind the globe — in light mode that is the dark panel the owner called obstructive`);
    }
  }
});

check('without JavaScript or without the globe, the list is the map and one line says so', () => {
  /* The stage may only be hidden when the globe is off or the script is. */
  const hides = [...css.matchAll(/([^{}]*\.world__stage[^{}]*)\{([^}]*)\}/g)].filter(([, , body]) => /display:\s*none/.test(body));
  assert.ok(hides.length, 'nothing hides the empty stage when the globe cannot run');
  for (const [, sel] of hides) {
    for (const part of sel.split(',')) {
      if (!/\.world__stage/.test(part)) continue;
      assert.match(part, /\[data-globe="off"\]|:not\(\[data-js\]\)/, `"${part.trim()}" hides the stage while the globe could still land`);
    }
  }
  assert.match(css, /\.world\[data-globe="off"\] \.world__off\s*\{\s*display:\s*block/, 'with the globe off, the line saying the list is the map is not shown');
  assert.match(css, /:root:not\(\[data-js\]\) \.world__off/, 'with JavaScript off, the line saying the list is the map is not shown');
  assert.match(worldWindowSrc, /class="world__off"/, 'worldWindow() no longer writes the "every place is in the list" line');
  assert.match(layoutMjs, /setAttribute\('data-js'/, 'the head no longer marks a page whose script runs, so a no-JS reader gets an empty stage');
});

/* --- Targets a thumb can hit --------------------------------------------- */

check('a pin is a fingertip-sized target under a thumb', () => {
  assert.match(css, /@media \(pointer: coarse\)\s*\{\s*\.world__pin::before, \.world__cluster::before\s*\{[^}]*width:\s*var\(--tap\)/,
    'a pin or group on a touch screen is no longer --tap wide');
});

check('the controls are at least 44px under a thumb', () => {
  /* This used to assert `.world__btn { min-height: 44px }` inside a coarse
     media query in primitives.css, and it was right to until #34, when that
     rule became the seed of a site-wide control policy and was deleted here on
     purpose. The number now lives once on `:root` as `--tap`, and the map's
     buttons are covered by being *named in the policy* rather than by
     restating it. */
  assert.match(siteCss, /--tap:\s*44px/, 'the touch minimum is no longer declared as --tap: 44px on :root');

  const policy = siteCss.match(/@media \(pointer: coarse\)\s*\{[\s\S]{0,600}?min-height:\s*var\(--tap\)/);
  assert.ok(policy, 'no coarse-pointer control policy applying --tap');
  assert.ok(
    /\.world__list a|(^|[\s,(])button([\s,)]|$)/m.test(policy[0]),
    'the control policy no longer names the map buttons, so the map is back to whatever size it happens to be'
  );
});

check('a disabled control is dimmed rather than made translucent', () => {
  const block = css.match(/\.world__btn:disabled\s*\{([^}]*)\}/);
  assert.ok(block, 'no :disabled rule');
  assert.ok(
    !/opacity\s*:/.test(block[1]),
    'opacity on a disabled button applies to its background too, so the globe shows through it and it reads ' +
      'as a rendering fault rather than as a control that is currently unavailable'
  );
});

/* --- Gestures ------------------------------------------------------------- */

check('pinch and double-click zoom exist on the globe', () => {
  assert.match(globeJs, /let pinch = null/, 'no pinch handling');
  assert.match(globeJs, /A double click zooms in/, 'no double-click zoom');
});

/* --- The pins are still not controls -------------------------------------- */

check('nothing in the build-time world window is a second control for a place', () => {
  assert.ok(!/tabindex/.test(worldWindowSrc),
    'worldWindow() writes a focusable element besides the list — that doubles every tab stop on the page with a worse copy of the list entry');
});

check('the globe zooms on the wheel only once it has been taken hold of', () => {
  /* The owner asked for wheel zoom (ADR 0005); the research doc forbids a map
     that eats the page's scroll. Both hold if the wheel zooms only after a
     click or drag on the globe, or with Ctrl/Cmd held (which is also what a
     trackpad pinch sends) — and nothing cancels the scroll before that test. */
  const handler = globeJs.match(/addEventListener\(\s*'wheel',\s*\(e\)\s*=>\s*\{([\s\S]{0,2500}?)\n  \}, \{ passive: false \}\);/);
  assert.ok(handler, 'no wheel handler found on the globe');
  const body = handler[1];
  const guard = body.search(/if\s*\(\s*!engaged\s*&&\s*!e\.ctrlKey\s*&&\s*!e\.metaKey\s*\)/);
  const prevent = body.indexOf('e.preventDefault()');
  assert.ok(guard >= 0, 'the wheel handler no longer checks that the globe is engaged (or Ctrl/Cmd held)');
  assert.ok(prevent > guard, 'the wheel handler cancels the page scroll before checking that the globe is engaged');
  assert.match(globeJs, /'pointerleave'[\s\S]{0,200}disengage\(\)/,
    'leaving the globe no longer lets go of it, so a wheel passing over later would zoom');
  /* Round 2, bug A: under the close map the handler returned without
     cancelling, so a wheel over a pin or the card scrolled the page away in
     the middle of a zoom. Inside the close-map branch, the cancel comes
     before any return, and the wheel is handed on to the map. */
  const closeBranch = body.match(/if \(closeActive\) \{([\s\S]*?)\n    \}/);
  assert.ok(closeBranch, 'the wheel handler no longer has a close-map branch');
  const p = closeBranch[1].indexOf('e.preventDefault()');
  const r = closeBranch[1].indexOf('return');
  assert.ok(p >= 0 && (r < 0 || p < r), 'under the close map the wheel handler returns without cancelling the page scroll');
  assert.match(closeBranch[1], /dispatchEvent\(new WheelEvent/, 'a wheel over a pin is no longer handed to the close map');
});

check('on the globe, a thumb can still scroll the page until it takes hold', () => {
  assert.match(globeJs, /touchAction\s*=\s*engaged \? 'none' : 'pan-y'/,
    'touch-action is not pan-y until the globe is engaged — a thumb swiping up the page would spin the planet instead');
});

/* --- The globe's loading, fallback and reduced-motion guarantees ---------- */

console.log('\nGlobe\n');

check('the globe is loaded progressively, never in the first request', () => {
  assert.ok(!/^\s*import[^;]*['"]\.\/globe\.js['"]/m.test(entryJs),
    'map.js imports globe.js statically, so every page pays for the engine before first paint');
  assert.match(entryJs, /await import\(\s*'\.\/globe\.js'\s*\)/, 'map.js no longer imports the globe on demand');
  assert.match(entryJs, /IntersectionObserver/, 'the globe no longer waits for the map to come near the viewport');
});

check('without WebGL, or when the globe fails, the list is the map', () => {
  assert.match(entryJs, /WebGLRenderingContext/, 'map.js no longer checks for WebGL before trying the globe');
  assert.match(entryJs, /catch\s*\(err\)\s*\{[\s\S]{0,500}noGlobe\(/, 'a globe that throws no longer hands over to the list');
  assert.match(entryJs, /onFail:\s*\(\w*\)\s*=>\s*noGlobe\(/, 'a lost WebGL context no longer hands over to the list');
  assert.match(entryJs, /dataset\.globe = 'off'/, 'a globe that cannot run no longer marks the figure off, so its empty stage stays on the page');
  assert.match(entryJs, /fold\.open = true/, 'a folded list stays folded when it is the only map');
  assert.match(entryJs, /function paintList[\s\S]{0,600}data-dim/, 'without the globe the list no longer follows the filters');
  assert.match(globeJs, /failIfMajorPerformanceCaveat/, 'the globe no longer refuses a software-rendered context');
  assert.match(globeJs, /swiftshader\|llvmpipe/i, 'the globe no longer refuses a renderer that names itself as software');
  assert.match(globeJs, /onFail\?\.\('frames too slow'\)/, 'a globe the machine cannot draw fast enough no longer hands over to the list');
  assert.match(globeJs, /webglcontextlost/, 'the globe no longer listens for a lost context');
  assert.match(entryJs, /get\('map'\)\s*===\s*'off'/, '?map=off no longer forces the list alone, so nobody can look at it on purpose');
});

check('a card on the globe is itself the link: one link, stretched over the card, nothing nested in it', () => {
  /* The owner (#53): "make it so clicking the card on the map takes you to
     that country's page instead of having to scroll down the card and click
     on open country". */
  const link = globeJs.match(/function cardLink\([\s\S]*?\n  \}\n/);
  assert.ok(link, 'cardLink() is gone from globe.js');
  assert.match(link[0], /el\('a', \{ class: 'world__card-link', href \}/, 'the card\'s link is no longer one real <a href>');
  assert.match(link[0], /title\.replaceChildren\(a\)/, 'the link is no longer the card\'s title');
  const appended = [...link[0].matchAll(/\ba\.append\(el\('(\w+)'/g)].map((m) => m[1]);
  assert.deepEqual(appended.filter((t) => t !== 'span'), [], 'something other than text is put inside the card\'s link');
  assert.match(link[0], /'aria-hidden': 'true' \}, label\)/, 'the visible "Open … →" line is announced as well as the link, so a screen reader hears it twice');
  assert.match(css, /\.world__card-link::after\s*\{[^}]*position:\s*absolute;[^}]*inset:\s*0/, 'the link no longer covers the whole card, so only its title is clickable');
  assert.match(css, /\.world__card-list\s*\{[^}]*position:\s*relative;[^}]*z-index:\s*1/, 'the list of places in a country card sits under the link\'s cover and cannot be clicked');
  const country = globeJs.match(/function countryCard\([\s\S]*?\n  \}\n/);
  assert.ok(country && /cardLink\(c, title, dest\.href/.test(country[0]), 'a country\'s card is no longer a link to the country\'s page');
  const place = globeJs.match(/function placeCard\([\s\S]*?\n  \}\n/);
  assert.ok(place && /cardLink\(c, title, p\.href/.test(place[0]), 'a place\'s card is no longer a link to the place');
  assert.ok(!/world__card-go', href/.test(globeJs), 'a separate "Open …" link came back beside the card\'s own link');
});

check('the globe fades in only once it has drawn, and its stand with it', () => {
  assert.equal(decl(css, '.world__globe', 'opacity'), '0', 'the canvas shows before its first frame');
  assert.match(css, /\.world\[data-globe="on"\] \.world__globe \{ opacity: 1; \}/, 'the canvas never fades in');
  assert.match(css, /\.world\[data-globe="on"\] \.world__desk \{ display: block; \}/, 'the desk stand shows before the globe it holds');
  assert.match(globeJs, /if \(first\) \{\s*first = false;\s*figure\.dataset\.globe = 'on';/, 'the figure is marked on before the first frame is drawn');
});

check('reduced motion makes every camera move instant and stops the idle spin, the drift and the rush', () => {
  assert.match(globeJs, /getAttribute\('data-motion'\)\s*===\s*'reduced'/, "the globe ignores the site's own motion toggle");
  assert.match(globeJs, /prefers-reduced-motion: reduce/, 'the globe ignores the operating-system setting');
  const fly = globeJs.match(/function flyTo\([\s\S]*?\n  \}/);
  assert.ok(fly, 'flyTo is gone');
  assert.match(fly[0], /if \(reducedMotion\(\)\) \{[\s\S]{0,200}Object\.assign\(view, to\)[\s\S]{0,200}return;/,
    'under reduced motion flyTo no longer jumps straight to the target');
  assert.match(globeJs, /let idle = !reducedMotion\(\)/, 'the idle spin no longer starts off under reduced motion');
  assert.match(globeJs, /idle && !reducedMotion\(\)/, 'the idle spin no longer checks reduced motion each frame');
  assert.match(globeJs, /reducedMotion\(\) \? 0 :/, 'the cloud drift no longer stops under reduced motion');
  assert.match(globeJs, /function stopMotion\(\)[\s\S]{0,120}rush = 0/, 'reduced motion no longer cancels the cloud rush');
});

check('the globe pauses offscreen and in a hidden tab, and caps the pixel ratio', () => {
  assert.match(globeJs, /document\.hidden/, 'the render loop no longer stops in a hidden tab');
  assert.match(globeJs, /new IntersectionObserver/, 'the render loop no longer stops when the map is scrolled away');
  const cap = globeJs.match(/const DPR_CAP = ([\d.]+)/);
  assert.ok(cap && Number(cap[1]) <= 2, 'devicePixelRatio is no longer capped at 2 or below');
});

check('pins stay decorative, so the list stays the one control surface', () => {
  assert.match(globeJs, /class: 'world__pins', 'aria-hidden': 'true'/, 'the pin layer is no longer hidden from assistive technology');
  assert.ok(!/world__pin[^\n]*tabindex/i.test(globeJs), 'a pin became focusable');
  assert.match(globeJs, /for \(const \[id, a\] of links\)[\s\S]{0,300}'focus'/, 'focusing a list entry no longer lights its pin');
});

{
  const closeJs = await fs.readFile(path.join(ROOT, 'src', 'assets', 'js', 'globe-close.js'), 'utf8').catch(() => '');
  const vendorDir = path.join(ROOT, 'src', 'assets', 'vendor', 'maplibre-gl');
  const vendorReadme = await fs.readFile(path.join(vendorDir, 'README.md'), 'utf8').catch(() => '');
  const hasLib = await fs.stat(path.join(vendorDir, 'maplibre-gl.js')).then(() => true, () => false);
  const hasLicence = await fs.stat(path.join(vendorDir, 'LICENSE.txt')).then(() => true, () => false);
  check('the close map is vendored with its licence, version and checksum', () => {
    assert.ok(hasLib, 'src/assets/vendor/maplibre-gl/maplibre-gl.js is missing');
    assert.ok(hasLicence, 'the MapLibre licence is not vendored beside it');
    assert.match(vendorReadme, /\d+\.\d+\.\d+/, 'the vendored version is not recorded');
    assert.match(vendorReadme, /[0-9a-f]{64}/, 'no SHA-256 recorded for the vendored file');
    assert.match(vendorReadme, /EOX|EOxCloudless/, 'the satellite tiles\' terms are not recorded');
    assert.match(vendorReadme, /OpenStreetMap/, 'the street map\'s data licence is not recorded');
  });
  check('the close map is never on first paint', () => {
    assert.ok(!/^\s*import\s+[^(;]*globe-close/m.test(globeJs), 'globe.js imports the close map statically');
    assert.match(globeJs, /import\('\.\/globe-close\.js'\)/, 'the close map is no longer imported on demand');
    assert.ok(!/maplibre/i.test(entryJs), 'map.js (every map page) mentions MapLibre');
    assert.ok(!/maplibre/i.test(primitives), 'the build-time map writes MapLibre into the page');
    assert.match(globeJs, /function ensureClose\(\)/, 'ensureClose() is gone');
  });
  check('nothing close or big loads before a gesture, and the globe owns every resting view', () => {
    /* Round 2: the Netherlands page cost 9 MB at rest, because its resting
       camera sat below the close map's preload altitude, and every visit
       fetched the big textures in idle time. */
    assert.match(globeJs, /closeState === 'none' && touched && view\.alt < CLOSE_PRELOAD_ALT/, 'the close map preloads without any gesture');
    assert.match(globeJs, /if \(touched\) \{ maybeFine\(\); maybeDetail\(\); \}/, 'the finer borders or the detail texture load before any gesture');
    assert.ok(!/if \(first\) \{[\s\S]{0,400}upgradeDay\(\)/.test(globeJs), 'the 4096 map loads on every visit again, not on the first gesture');
    /* Since the desk globe (25 September) every page rests on the desk, far
       above the close map: its altitude is fitted to the stage, never below 2.2. */
    assert.match(globeJs, /Math\.max\(2\.2, 1 \/ Math\.sin\(Math\.atan\(k\)\) - 1\)/, 'the desk altitude can come down towards the close map');
    assert.match(globeJs, /alt: deskAlt \};/, 'a page can rest somewhere other than the desk');
  });
  check('the desk globe turns on its axis only, and lets go of its tilt and stand as you lean in', () => {
    assert.match(globeJs, /const roll = TILT \* dk;/, 'the axis tilt no longer follows the desk');
    assert.match(globeJs, /const dLat = dy \* k \* \(1 \+ Math\.sin\(cam\.pitch\) \* 0\.9\) \* \(1 - desk\(view\.alt\)\);/, 'a drag on the desk can tip the globe north or south');
    assert.match(globeJs, /Math\.min\(3\.2, deskIn\(\) \* 0\.95,/, 'a journey can climb into the desk, so the stand blinks in mid-flight');
    assert.match(globeJs, /const k = closeActive \? 0 : desk\(view\.alt\);/, 'the stand shows over the close map');
  });
  check('cards are judged only once the camera has arrived, and a place keeps its own depth', () => {
    assert.match(globeJs, /if \(cardSubject && !flight && !closeFlying\) cardStillAbout\(\)/, 'a card can be closed by its own flight');
    assert.ok(!/Math\.max\(close\.map\.getZoom\(\), zoom\)/.test(globeJs), 'a city arrived at from a campus is dived to street level again');
    assert.match(globeJs, /function goHome\(\)[\s\S]{0,120}climbOut\(/, 'Reset from street level jumps to orbit again instead of climbing out');
  });
  check('no cream: the close map has no opaque ground below street level, and the globe draws under it', () => {
    /* Round 3: every upward move inside the close map showed the style's cream
       background where tiles had not loaded. */
    assert.match(closeJs, /'background-opacity': \['interpolate', \['linear'\], \['zoom'\], 13, 0,/, 'the close style paints an opaque background below street level again');
    assert.ok(!/if \(!closeActive\) draw\(now\)/.test(globeJs), 'the globe stops drawing under the close map again, so missing tiles show as voids');
  });
  check('no hitches: textures decode off-thread, upload only when still, anisotropy read once', () => {
    assert.match(globeJs, /gl\.__aniso === undefined/, 'the anisotropy limit is read after every mipmap again (a forced GPU sync)');
    assert.match(globeJs, /createImageBitmap/, 'lazy textures decode on the main thread again');
    assert.match(globeJs, /function upgradeDay\(\)[\s\S]{0,400}whenStill\(/, 'the 4096 upload is no longer held until nothing moves');
    assert.match(globeJs, /uploads\.length && still/, 'queued uploads no longer wait for stillness');
    assert.match(globeJs, /if \(warming\) await Promise\.race/, 'the handoff cuts the warm-up short again (the street-level pop)');
  });
  check('a page resting below FINE_ALT rests on the detail texture and the finer borders', () => {
    assert.match(globeJs, /if \(rest\.alt < FINE_ALT\)[\s\S]{0,200}maybeFine\(0\); maybeDetail\(rest\);/, 'the resting picture is the magnified 2048 map again (round 3, R1)');
  });
  check('a group click frames every member, and Back undoes it', () => {
    assert.ok(!/cameraForBounds/.test(globeJs), 'groups are framed with MapLibre\'s pitch-0 bounds fit again (ten of twelve off the stage)');
    assert.match(globeJs, /function openGroup[\s\S]{0,4000}remember\(\{ kind: 'view'/, 'a group dive pushes no history entry, so Back leaves the page');
  });
  check('the close map keeps the motion and touch rules', () => {
    assert.match(globeJs, /function closeFlyTo[\s\S]{0,900}if \(reducedMotion\(\)\) \{\s*m\.jumpTo/, 'close-map flights no longer jump under reduced motion');
    assert.match(globeJs, /function climbOut[\s\S]{0,1200}if \(reducedMotion\(\)\) \{ m\.jumpTo/, 'climbing out of the close map no longer jumps under reduced motion');
    assert.match(closeJs, /cooperativeGestures: !!coarse/, 'on a touch screen one finger no longer scrolls the page over the close map');
    assert.match(closeJs, /keyboard: false/, 'the close map takes keys the stage already handles');
    const codes = closeJs.match(/['"](dk|nl|gb|de|fr|us|ca|au|Denmark|Netherlands)['"]/g);
    assert.ok(!codes, `country literals in globe-close.js: ${codes}`);
  });
}

/* --- The shaders compile, as far as reading them can tell ----------------- */

/*
 * A globe whose shader does not compile falls back to the flat map, silently
 * and correctly — and shipped that way once: the Europe detail blend declared
 * `vec2 d` in a main() that already had `float d`, every browser refused the
 * program, and the live site showed the flat map with one console line. No
 * browser runs in this stage, so this reads each GLSL string back out of
 * globe.js and checks what a compiler would check first: no name declared
 * twice in one scope, balanced braces and parentheses, a main() in every
 * shader, and no variable used before any declaration of it.
 */
{
  const shaders = [...globeJs.matchAll(/const (\w+_(?:VS|FS)) = `([\s\S]*?)`;/g)].map(([, name, src]) => ({
    name,
    // Interpolations are the precision header and numeric constants.
    src: src.replace(/\$\{[^}]*\}/g, (m) => (/MED|HIGH/.test(m) ? '' : '1.0')),
  }));
  const TYPE = '(?:float|int|bool|vec[234]|ivec[234]|bvec[234]|mat[234]|sampler2D|samplerCube)';
  const problems = [];
  for (const { name, src } of shaders) {
    const code = src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
    if (!/void\s+main\s*\(\s*\)\s*\{/.test(code)) problems.push(`${name}: no main()`);
    let depth = 0, paren = 0;
    for (const ch of code) {
      if (ch === '{') depth++;
      if (ch === '}') depth--;
      if (ch === '(') paren++;
      if (ch === ')') paren--;
      if (depth < 0 || paren < 0) break;
    }
    if (depth !== 0) problems.push(`${name}: unbalanced braces`);
    if (paren !== 0) problems.push(`${name}: unbalanced parentheses`);

    /* Walk the code keeping a stack of scopes. A declaration is a type followed
       by one or more names (`vec3 a = …, b;`), or a function parameter, which
       belongs to the function body's scope. */
    const scopes = [new Set()];
    let pendingParams = null;
    const declRe = new RegExp(`\\b(?:(?:uniform|varying|attribute|const|in|out|inout|highp|mediump|lowp)\\s+)*${TYPE}\\s+(\\w+)\\s*(\\[[^\\]]*\\])?\\s*([=;,)\\(])`, 'g');
    let i = 0;
    const declare = (id, where) => {
      const top = scopes[scopes.length - 1];
      if (top.has(id)) problems.push(`${name}: '${id}' declared twice in one scope (${where})`);
      top.add(id);
    };
    while (i < code.length) {
      const ch = code[i];
      if (ch === '{') {
        scopes.push(new Set());
        if (pendingParams) { for (const p of pendingParams) declare(p, 'parameter'); pendingParams = null; }
        i++;
        continue;
      }
      if (ch === '}') { scopes.pop(); i++; continue; }
      declRe.lastIndex = i;
      const m = declRe.exec(code);
      if (m && m.index === i) {
        const [, id, , next] = m;
        if (next === '(') {
          // A function: its parameters are declared in the body that follows.
          const close = code.indexOf(')', declRe.lastIndex);
          const params = code.slice(declRe.lastIndex, close);
          pendingParams = [...params.matchAll(new RegExp(`${TYPE}\\s+(\\w+)`, 'g'))].map((p) => p[1]);
          scopes[scopes.length - 1].add(id);
          i = close + 1;
          continue;
        }
        declare(id, `before "${code.slice(i, i + 40).replace(/\s+/g, ' ')}"`);
        // `float a = 1.0, b = 2.0;` — further names after top-level commas.
        if (next === ',' || next === '=') {
          let j = declRe.lastIndex, d = 0;
          while (j < code.length && !(code[j] === ';' && d === 0)) {
            if ('([{'.includes(code[j])) d++;
            if (')]}'.includes(code[j])) d--;
            if (code[j] === ',' && d === 0) {
              const more = /^\s*(\w+)/.exec(code.slice(j + 1));
              if (more) declare(more[1], 'comma list');
            }
            j++;
          }
        }
        i = m.index + m[0].length - (next === ';' || next === ',' || next === '=' ? 1 : 0);
        continue;
      }
      i++;
    }
  }
  check(`every shader in globe.js reads as one that compiles (${shaders.length} shaders)`, () => {
    assert.ok(shaders.length >= 6, `found only ${shaders.length} shader strings in globe.js — has their naming changed?`);
    assert.deepEqual(problems, []);
  });
}

check('the globe does not branch on a country', () => {
  /* Behaviour comes from the records. A country code or name written into the
     engine is a rule for one Destination hiding in code. */
  const codes = globeJs.match(/['"](dk|nl|gb|uk|de|fr|se|no|fi|us|ca|au|Denmark|Netherlands)['"]/g);
  assert.ok(!codes, `country literals in globe.js: ${codes}`);
});

{
  /* The budget, as the owner moved it in round 1: what the first frame waits
     for stays small; the big textures are fetched only later (the 4096 day map
     once the globe is idle, the detail texture on a close approach), and the
     engine must actually load them lazily for this to be a budget at all. */
  const dir = path.join(ROOT, 'src', 'assets', 'img', 'globe');
  const probe = async (f) => {
    try {
      const buf = await fs.readFile(path.join(dir, f));
      // A lossy WebP's VP8 frame header carries the size at bytes 26..29.
      return { f, bytes: buf.length, w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
    } catch {
      return { f, bytes: 0, w: 0, h: 0 };
    }
  };
  const firstLoad = await Promise.all(['earth-day.webp', 'earth-clouds.webp'].map(probe));
  const lazy = await Promise.all(['earth-day-4096.webp', 'earth-detail-europe.webp'].map(probe));
  const detailJson = await fs.readFile(path.join(dir, 'detail.json'), 'utf8').then(JSON.parse).catch(() => null);
  check('the first frame waits for at most 2048 x 1024 textures, under 500 kB together', () => {
    for (const t of firstLoad) {
      assert.ok(t.w && t.h, `${t.f} is missing or not a lossy WebP`);
      assert.ok(t.w <= 2048 && t.h <= 1024, `${t.f} is ${t.w}x${t.h}`);
    }
    const total = firstLoad.reduce((n, t) => n + t.bytes, 0);
    assert.ok(total < 500 * 1024, `the first-load textures are ${Math.round(total / 1024)} kB`);
  });
  check('the big textures are at most 4096 x 2048, under 600 kB each, and loaded lazily', () => {
    for (const t of lazy) {
      assert.ok(t.w && t.h, `${t.f} is missing or not a lossy WebP`);
      assert.ok(t.w <= 4096 && t.h <= 2048, `${t.f} is ${t.w}x${t.h}`);
      assert.ok(t.bytes < 600 * 1024, `${t.f} is ${Math.round(t.bytes / 1024)} kB`);
    }
    assert.ok(detailJson && ['west', 'east', 'south', 'north'].every((k) => Number.isFinite(detailJson[k])),
      'detail.json does not say where the detail texture sits');
    assert.match(globeJs, /function upgradeDay\(\)[\s\S]{0,400}earth-day-4096\.webp/, 'the 4096 day map is no longer loaded on its own, after the first frame');
    assert.match(globeJs, /function maybeDetail\([\s\S]{0,300}at\.alt > FINE_ALT/, 'the detail texture is no longer held back until a close approach');
    assert.match(globeJs, /requestIdleCallback/, 'the big day map is no longer deferred to idle time');
  });
  check("the textures' source and licence are recorded beside them", () => {
    assert.match(texturesReadme, /public domain/i, 'no licence in src/assets/img/globe/README.md');
    assert.match(texturesReadme, /eoimages\.gsfc\.nasa\.gov/, 'no source URL in src/assets/img/globe/README.md');
  });
}

{
  /* Every light is in its own country. Canada's light sat in Minnesota for a
     round because a country's light was the mean of its campuses; now it is
     the medoid (src/lib/geo.mjs), and this reads every light the maps can draw
     back against the finer borders the globe dives into. A coastal city may
     fall just offshore at 50m, so "inside or within 30 km" is the test. */
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
  /* True exceptions, by place id, each with its reason: an institution
     listed under one Destination whose campus is in another country. The light
     is right to be where the campus is. A new entry needs a reason as good. */
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

  /* A country's light is at the country's middle, not at a campus (the
     owner, #53: "your pips are not placed in the center of the country").
     "Middle" is read back without trusting geo.mjs: the light must be at
     least a third as deep inside the country — as far from its coast or
     border — as the deepest point a coarse grid finds. The medoid it
     replaced put the United States' light 51 km from Lake Erie, a twentieth
     of the depth of Kansas. */
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

  /* Country → schools (#53): every institution with a position and a page
     rides on its country's light, and the globe opens a country into them. */
  const { schoolsOf } = await import('../src/pages/destinations.mjs');
  const missing = [];
  for (const c of site.countries) {
    const ids = new Set(schoolsOf(site, c).map((s) => s.id));
    for (const i of c.institutions || []) if (i.coords && i.href && !ids.has(i.key)) missing.push(`${c.code}: ${i.key}`);
  }
  check('every institution with a position rides on its country\'s light, for the globe\'s schools level', () => {
    assert.deepEqual(missing, [], 'these institutions would never show as their own dot when their country is zoomed into');
    for (const f of ['discover.mjs', 'destinations.mjs']) {
      const src = fsSync.readFileSync(path.join(ROOT, 'src', 'pages', f), 'utf8');
      assert.match(src, /precision: 'region',\s*schools: schoolsOf\(site, c\)/, `${f}: a country light no longer carries its schools`);
    }
    assert.match(globeJs, /function schoolsOpen\(p\)/, 'the globe no longer opens a country into its schools');
    assert.match(globeJs, /if \(p\.open\) out\.push\(\.\.\.p\.subs\)/, 'an open country no longer gives way to its schools');
    assert.match(globeJs, /const left = \[\.\.\.shown\]/, 'the schools no longer group and split with the zoom like other pins');
    assert.match(worldWindowSrc, /schools: d\.schools/, 'worldWindow() no longer hands a light\'s schools to the globe');
  });
}

console.log(failures ? `\n${failures} failing\n` : '\nAll map guards pass\n');
process.exit(failures ? 1 : 0);
