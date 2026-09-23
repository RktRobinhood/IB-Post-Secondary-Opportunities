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
const mapJs = await fs.readFile(path.join(ROOT, 'src', 'assets', 'js', 'map.js'), 'utf8');
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
  assert.ok(m, 'TOUCH_TARGET is gone from map.js');
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

check('the wheel still does not zoom', () => {
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

console.log(failures ? `\n${failures} failing\n` : '\nAll map guards pass\n');
process.exit(failures ? 1 : 0);
