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
/* Since ADR 0005 the flat interaction layer lives in map-flat.js (the fallback)
   and map.js only decides between it and the globe. The flat map's guards
   follow the flat map; the globe has its own at the end. */
const mapJs = await fs.readFile(path.join(ROOT, 'src', 'assets', 'js', 'map-flat.js'), 'utf8');
const entryJs = await fs.readFile(path.join(ROOT, 'src', 'assets', 'js', 'map.js'), 'utf8');
const globeJs = await fs.readFile(path.join(ROOT, 'src', 'assets', 'js', 'globe.js'), 'utf8');
const texturesReadme = await fs.readFile(path.join(ROOT, 'src', 'assets', 'img', 'globe', 'README.md'), 'utf8').catch(() => '');
const primitives = await fs.readFile(path.join(ROOT, 'src', 'lib', 'primitives.mjs'), 'utf8');

const decl = (selector, prop) => {
  const block = css.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`));
  if (!block) return null;
  const m = block[1].match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`));
  return m ? m[1].trim() : null;
};

/* --- The basemap has to be visible --------------------------------------- */

check('the coastline is drawn at an opacity someone can see', () => {
  const stroke = Number(decl('.world__land path', 'stroke-opacity'));
  assert.ok(Number.isFinite(stroke), 'no stroke-opacity found on .world__land path');
  assert.ok(
    stroke >= 0.45,
    `stroke-opacity is ${stroke}. It was .20 once, which measured 1.29:1 against the land — ` +
      'a coastline nobody can see is a coastline that was not worth baking. ' +
      'If this is being lowered deliberately, measure it again and update the comment beside it.'
  );
});

check('land and sea are two surfaces', () => {
  const fill = Number(decl('.world__land path', 'fill-opacity'));
  assert.ok(Number.isFinite(fill), 'no fill-opacity found');
  assert.ok(fill >= 0.15, `fill-opacity is ${fill}, which was .07 when the map read as an empty panel`);
});

check('the measured contrast ratios are recorded beside the values', () => {
  // Numbers somebody took in a browser. If they are gone, the next person has
  // no way to tell a considered value from a guess — which is how .07 happened.
  assert.match(css, /\b\d\.\d{2}\s*:\s*1|\b\d\.\d{2}\b[^\n]*contrast|contrast[^\n]*\b\d\.\d{2}\b/i,
    'no measured ratio appears near the basemap declarations');
});

/* --- The panel is not one shape ------------------------------------------ */

check('the map crops rather than shrinking', () => {
  assert.match(
    primitives,
    /preserveAspectRatio="xMidYMid slice"/,
    'the SVG is back to the default `meet`, which letterboxes a narrow panel instead of cropping it'
  );
});

check('a narrow viewport gets its own panel shape', () => {
  assert.match(
    css,
    /@media \(max-width: 44rem\)[\s\S]{0,200}\.world__stage\s*\{[^}]*aspect-ratio/,
    'no narrow-viewport aspect-ratio for .world__stage — a phone is back to a 2.38:1 letterbox'
  );
});

/* --- Targets a thumb can hit --------------------------------------------- */

check('the touch target is at least 44px', () => {
  const m = mapJs.match(/const TOUCH_TARGET\s*=\s*(\d+)/);
  assert.ok(m, 'TOUCH_TARGET is gone from map-flat.js');
  assert.ok(Number(m[1]) >= 44, `TOUCH_TARGET is ${m[1]}`);
});

check('the hit radius is derived from the measured scale, not authored in viewBox units', () => {
  // The whole bug: a circle authored at r=21 "the size of a fingertip" rendered
  // at 14px on a phone, because a viewBox unit is not a pixel.
  assert.match(mapJs, /TOUCH_TARGET\s*\/\s*2\s*\)\s*\/\s*unitPx|TOUCH_TARGET[\s\S]{0,120}metrics\(\)/,
    'the hit radius no longer takes the rendered scale into account');
});

check('the controls are at least 44px under a thumb', () => {
  /* This used to assert `.world__btn { min-height: 44px }` inside a coarse
     media query in primitives.css, and it was right to until #34, when that
     rule became the seed of a site-wide control policy and was deleted here on
     purpose. The number now lives once on `:root` as `--tap`, and the map's
     buttons are covered by being *named in the policy* rather than by
     restating it.
     *
     * So the assertion moved with the rule. What it protects is unchanged —
     * a control under a thumb is at least 44px — but it now fails in the two
     * ways that would actually break the map: the policy dropping the map's
     * controls, or the map opting itself back out. It deliberately does NOT
     * require a 44 in primitives.css; `test-controls.mjs` fails if any
     * component restates it, so requiring one here would make the two guards
     * contradict each other. */
  assert.match(siteCss, /--tap:\s*44px/, 'the touch minimum is no longer declared as --tap: 44px on :root');

  const policy = siteCss.match(/@media \(pointer: coarse\)\s*\{[\s\S]{0,600}?min-height:\s*var\(--tap\)/);
  assert.ok(policy, 'no coarse-pointer control policy applying --tap');
  assert.ok(
    /\.world__list a|(^|[\s,(])button([\s,)]|$)/m.test(policy[0]),
    'the control policy no longer names the map buttons, so the map is back to whatever size it happens to be'
  );

  /* The base `min-height: 2rem` on `.world__btn` stays and is correct: it is
     the mouse size, and the policy raises it under a coarse pointer. Whether a
     component can escape the policy by specificity is `test-controls.mjs`'s
     question, and it asks it properly — asserting it here too would mean two
     guards with one opinion between them and two places to update. */
});

check('a disabled control is dimmed rather than made translucent', () => {
  const block = css.match(/\.world__btn:disabled\s*\{([^}]*)\}/);
  assert.ok(block, 'no :disabled rule');
  assert.ok(
    !/opacity\s*:/.test(block[1]),
    'opacity on a disabled button applies to its background too, so the map shows through it and it reads ' +
      'as a rendering fault rather than as a control that is currently unavailable'
  );
});

/* --- Gestures ------------------------------------------------------------- */

check('pinch and double-tap exist', () => {
  assert.match(mapJs, /pointerType\s*!==\s*'touch'/, 'no touch-specific handling at all');
  assert.match(mapJs, /fingerGap|pinch/, 'no pinch handling');
});

check('the page can still be scrolled with the map at rest', () => {
  assert.match(
    mapJs,
    /touchAction\s*=\s*view\.k > 1\.001 \? 'none' : 'pan-y'/,
    'touch-action at rest is not pan-y — either the map eats the page scroll, or a pinch scrolls the page'
  );
});

check('the flat map still does not zoom on the wheel', () => {
  // DYNAMIC_SITE_INSPIRATION.md is explicit, and it is the easiest thing to add
  // by accident when adding the other gestures.
  assert.ok(!/addEventListener\(\s*'wheel'/.test(mapJs), 'a wheel handler appeared; page scrolling must not zoom the map');
});

/* --- The markers are still not controls ---------------------------------- */

check('markers stay decorative, so the list stays the one control surface', () => {
  assert.ok(
    !/world__place[\s\S]{0,200}tabindex/.test(primitives),
    'a marker became focusable — that doubles every tab stop on the page with a worse copy of the list entry, ' +
      'and a marker disappears when its place is grouped, so it is a control that vanishes while in use'
  );
});

check('the globe zooms on the wheel only once it has been taken hold of', () => {
  /* The owner asked for wheel zoom (ADR 0005); the research doc forbids a map
     that eats the page's scroll. Both hold if the wheel zooms only after a
     click or drag on the globe, or with Ctrl/Cmd held (which is also what a
     trackpad pinch sends) — and nothing cancels the scroll before that test. */
  const handler = globeJs.match(/addEventListener\(\s*'wheel',\s*\(e\)\s*=>\s*\{([\s\S]{0,400})/);
  assert.ok(handler, 'no wheel handler found on the globe');
  const body = handler[1];
  const guard = body.search(/if\s*\(\s*!engaged\s*&&\s*!e\.ctrlKey\s*&&\s*!e\.metaKey\s*\)/);
  const prevent = body.indexOf('e.preventDefault()');
  assert.ok(guard >= 0, 'the wheel handler no longer checks that the globe is engaged (or Ctrl/Cmd held)');
  assert.ok(prevent > guard, 'the wheel handler cancels the page scroll before checking that the globe is engaged');
  assert.match(globeJs, /'pointerleave'[\s\S]{0,200}disengage\(\)/,
    'leaving the globe no longer lets go of it, so a wheel passing over later would zoom');
});

check('on the globe, a thumb can still scroll the page until it takes hold', () => {
  assert.match(globeJs, /touchAction\s*=\s*engaged \? 'none' : 'pan-y'/,
    'touch-action is not pan-y until the globe is engaged — a thumb swiping up the page would spin the planet instead');
});

/* --- The globe's fallback and reduced-motion guarantees (ADR 0005) -------- */

console.log('\nGlobe\n');

check('the flat SVG is still the first paint: built into the page, with the globe data beside it', () => {
  assert.match(primitives, /<svg viewBox="0 0 \$\{W\} \$\{H\}"/,
    'worldWindow() no longer writes the inline SVG — without it there is no map with JavaScript or WebGL off');
  assert.match(primitives, /class="world__data"/, 'worldWindow() no longer writes the places for the globe');
});

check('the globe is loaded progressively, never in the first request', () => {
  assert.ok(!/^\s*import[^;]*['"]\.\/globe\.js['"]/m.test(entryJs),
    'map.js imports globe.js statically, so every page pays for the engine before first paint');
  assert.match(entryJs, /await import\(\s*'\.\/globe\.js'\s*\)/, 'map.js no longer imports the globe on demand');
  assert.match(entryJs, /IntersectionObserver/, 'the globe no longer waits for the map to come near the viewport');
});

check('without WebGL, or when the globe fails, the flat map takes over', () => {
  assert.match(entryJs, /WebGLRenderingContext/, 'map.js no longer checks for WebGL before trying the globe');
  assert.match(entryJs, /catch\s*\(err\)\s*\{[\s\S]{0,200}flat\(/, 'a globe that throws no longer falls back to the flat map');
  assert.match(entryJs, /onFail:\s*\(\w*\)\s*=>\s*flat\(/, 'a lost WebGL context no longer falls back to the flat map');
  assert.match(globeJs, /failIfMajorPerformanceCaveat/, 'the globe no longer refuses a software-rendered context');
  assert.match(globeJs, /swiftshader\|llvmpipe/i, 'the globe no longer refuses a renderer that names itself as software');
  assert.match(globeJs, /onFail\?\.\('frames too slow'\)/, 'a globe the machine cannot draw fast enough no longer hands over to the flat map');
  assert.match(globeJs, /webglcontextlost/, 'the globe no longer listens for a lost context');
  assert.match(entryJs, /get\('map'\)\s*===\s*'flat'/, '?map=flat no longer forces the fallback, so nobody can look at it on purpose');
});

check('the SVG is hidden only once the globe has drawn', () => {
  const hides = [...css.matchAll(/([^{}]*\.world__svg[^{}]*)\{([^}]*)\}/g)]
    .filter(([, , body]) => /opacity:\s*0\b|visibility:\s*hidden|display:\s*none/.test(body));
  assert.ok(hides.length, 'no rule hides the SVG under the globe');
  for (const [, sel] of hides) {
    assert.match(sel, /\[data-globe="on"\]/,
      `"${sel.trim()}" hides the flat map without waiting for the globe — a failed globe would leave no map`);
  }
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
  check('the close map keeps the motion and touch rules', () => {
    assert.match(globeJs, /function closeFlyTo[\s\S]{0,600}animate: !reducedMotion\(\)/, 'close-map flights ignore reduced motion');
    assert.match(globeJs, /duration: reducedMotion\(\) \? 0/, 'close-map flights keep a duration under reduced motion');
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
}

console.log(failures ? `\n${failures} failing\n` : '\nAll map guards pass\n');
process.exit(failures ? 1 : 0);
