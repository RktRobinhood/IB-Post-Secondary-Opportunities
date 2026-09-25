/**
 * Guards on the faded photographs behind programme cards.
 *
 * The owner asked for "an image specific to that discipline or bachelor's"
 * behind each programme card. That puts a photograph under text a student has
 * to read. This file checks the pictures, the text and the code:
 *
 *   1. **Every programme card has one.** Each programme in the catalogue
 *      resolves a backdrop: its own, its field's, or the interdisciplinary
 *      fallback. The built pages carry it: every card in an institution's
 *      "What you could study here", every row of the finder's data and every
 *      opportunity in the planner's data.
 *   2. **Every picture is accounted for.** Each record in
 *      data/programme-images.json names a Commons file, and its page is for
 *      that file. It has an author and a licence to credit and a signed, dated
 *      approval for that file. Its WebP and every srcset variant are on disk at
 *      the size the record says, and in the image standard's shape. Every
 *      published picture appears on /credits/.
 *   3. **No text fails contrast.** Worst-case contrast is computed from the
 *      overlay itself: the paper colour at the minimum veil under any text,
 *      over a pure black pixel (light mode) or a white one dimmed as the
 *      stylesheet dims it (dark mode). Every text colour a veiled card uses
 *      must reach 4.5:1 against that. The numbers are read back from site.css,
 *      so a change to the stylesheet is a change to this test. The palest grey
 *      must be swapped out inside a veiled card.
 *   4. **No special cases.** The resolver and the markup name no programme,
 *      field value or country. Every difference between two cards is a
 *      difference in their records.
 *
 * It reads dist/, so it runs in the built stage.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { load } from '../src/lib/data.mjs';
import { review, publishable } from '../src/lib/imagery.mjs';
import { VEIL, FALLBACK_SCOPE, contrast, hex, worstBackground } from '../src/lib/programme-imagery.mjs';
import { conforms, probeWebp } from './lib/image-standard.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const AA = 4.5;

let failures = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok    ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL  ${name}\n          ${e.message.split('\n').join('\n          ')}`);
  }
};

console.log('\nProgramme card backgrounds\n');

const site = await load();
const records = site.programmeImages || {};
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const built = (rel) => {
  const f = path.join(DIST, rel);
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
};

/* --- 1. Every card resolves one ------------------------------------------ */

check('every programme resolves a background image', () => {
  const missing = site.programmes.filter((p) => !p.backdrop?.src).map((p) => p.id);
  assert.deepEqual(missing, [], `no background for: ${missing.join(', ')}`);
});

check('the interdisciplinary fallback exists and is publishable', () => {
  const ok = Object.values(records).some((r) => r.scope === FALLBACK_SCOPE && publishable(r));
  assert.ok(ok, `no publishable record with scope ${FALLBACK_SCOPE}`);
});

check('every programme-specific record names a programme that exists', () => {
  const ids = new Set(site.graph.programmes.keys());
  const orphans = Object.entries(records)
    .filter(([, r]) => r.scope?.startsWith('programme:') && !ids.has(r.scope.slice('programme:'.length)))
    .map(([k]) => k);
  assert.deepEqual(orphans, [], `records for programmes that are not in the catalogue: ${orphans.join(', ')}`);
});

check('a field with two pictures shares them out rather than repeating one', () => {
  const byScope = new Map();
  for (const r of Object.values(records)) if (publishable(r)) byScope.set(r.scope, (byScope.get(r.scope) || 0) + 1);
  const unused = [];
  for (const [scope, n] of byScope) {
    if (n < 2) continue;
    const used = new Set(site.programmes.filter((p) => p.backdrop?.scope === scope).map((p) => p.backdrop.key));
    const users = site.programmes.filter((p) => p.backdrop?.scope === scope).length;
    if (users >= n && used.size < n) unused.push(`${scope}: ${used.size} of ${n} used by ${users} cards`);
  }
  assert.deepEqual(unused, []);
});

check('every institution page draws a background on every programme card', () => {
  const bad = [];
  let cards = 0;
  for (const inst of site.institutionCatalogue.all.filter((i) => i.programmes.length)) {
    const htmlText = built(path.join(inst.href, 'index.html'));
    if (!htmlText) { bad.push(`${inst.href}: not built`); continue; }
    const start = htmlText.indexOf('id="programmes"');
    const grid = start < 0 ? '' : htmlText.slice(start, htmlText.indexOf('</section>', start));
    const articles = (grid.match(/<article class="card\b/g) || []).length;
    const backed = (grid.match(/<article class="card card--link card--backdrop">\s*<img class="card__backdrop"/g) || []).length;
    cards += articles;
    if (!articles || articles !== backed) bad.push(`${inst.href}: ${backed} of ${articles} cards`);
  }
  assert.deepEqual(bad, []);
  assert.ok(cards >= site.programmes.length, `only ${cards} programme cards found for ${site.programmes.length} programmes`);
});

const jsonIn = (page, id) => {
  const htmlText = built(page);
  if (!htmlText) throw new Error(`${page} is not built`);
  const m = htmlText.match(new RegExp(`<script type="application/json" id="${id}">([\\s\\S]*?)</script>`));
  if (!m) throw new Error(`${page} has no #${id}`);
  return JSON.parse(m[1]);
};

check('every finder row carries a background', () => {
  const rows = jsonIn('programmes/index.html', 'programme-data');
  const bad = rows.filter((r) => !r.backdrop?.src || !r.backdrop.srcset || !r.backdrop.sizes).map((r) => r.id);
  assert.deepEqual(bad, []);
  assert.equal(rows.length, site.programmes.length);
});

check('every planner result carries a background', () => {
  const opps = jsonIn('planner/index.html', 'planner-opportunities');
  const bad = opps.filter((o) => !o.display?.backdrop?.src).map((o) => o.id);
  assert.deepEqual(bad, []);
});

check('the finder and the planner draw the background the same way the cards do', () => {
  for (const rel of ['src/assets/js/explorer.js', 'src/assets/js/planner.js']) {
    const src = read(rel);
    assert.match(src, /class="prog__backdrop"[^`]*alt=""[^`]*loading="lazy"[^`]*srcset=|class="prog__backdrop"[^`]*srcset="[^`]*alt=""[^`]*loading="lazy"/, `${rel} does not write a lazy, decorative, srcset backdrop`);
    assert.match(src, /prog--backdrop/, `${rel} does not mark the row as veiled, so its text would sit on the bare photograph`);
  }
});

/* --- 2. Every picture is accounted for ---------------------------------- */

const title = (page) => decodeURIComponent(String(page || '').replace(/^.*\/File:/, '')).replace(/_/g, ' ');

check('every record is credited, signed for its own file, and names its Commons page', () => {
  const bad = [];
  for (const [key, r] of Object.entries(records)) {
    if (!r.file) { bad.push(`${key}: no Commons file`); continue; }
    if (title(r.page) !== r.file) bad.push(`${key}: names "${r.file}" but its page is for "${title(r.page)}"`);
    if (!r.author || !r.licence) bad.push(`${key}: no ${!r.author ? 'author' : 'licence'} to credit`);
    if (!/^(?:CC0|Public domain|PD|CC BY(?:-SA)? \d\.\d)/i.test(r.licence || '')) bad.push(`${key}: licence "${r.licence}" is not CC0, PD, CC BY or CC BY-SA`);
    if (!r.scope || !/^(?:programme|field):[a-z0-9-]+$/.test(r.scope)) bad.push(`${key}: scope "${r.scope}"`);
    const rv = review(r);
    if (!rv) bad.push(`${key}: no complete review for "${r.file}"`);
    else if (rv.state === 'approved' && !rv.note) bad.push(`${key}: approved with no note saying why`);
  }
  assert.deepEqual(bad, []);
});

check('every stored file and srcset variant is on disk, as recorded, in the image standard', () => {
  const bad = [];
  for (const [key, r] of Object.entries(records)) {
    for (const v of [{ src: r.src, width: r.width, height: r.height, bytes: r.bytes }, ...(r.variants || [])]) {
      if (!v.src) { bad.push(`${key}: no src`); continue; }
      const disk = path.join(ROOT, 'src', ...v.src.split('/').filter(Boolean));
      if (!fs.existsSync(disk)) { bad.push(`${key}: ${v.src} is not on disk`); continue; }
      const buf = fs.readFileSync(disk);
      const dim = probeWebp(buf);
      if (!dim) { bad.push(`${key}: ${v.src} is not a WebP`); continue; }
      if (v.bytes != null && buf.length !== v.bytes) bad.push(`${key}: ${v.src} is ${buf.length} bytes; the record says ${v.bytes}`);
      if (dim.width !== v.width || dim.height !== v.height) bad.push(`${key}: ${v.src} is ${dim.width}x${dim.height}; the record says ${v.width}x${v.height}`);
      for (const p of conforms({ file: v.src, ...dim, bytes: buf.length })) bad.push(`${key}: ${v.src} ${p.message}`);
    }
  }
  assert.deepEqual(bad, []);
});

check('every published background is credited on /credits/', () => {
  const credits = built('credits/index.html');
  assert.ok(credits, 'credits/index.html is not built');
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const missing = [...new Set(Object.values(records).filter((r) => publishable(r)).map((r) => r.page))]
    .filter((page) => !credits.includes(esc(page)) && !credits.includes(page));
  assert.deepEqual(missing, [], `not credited: ${missing.join(', ')}`);
});

/* --- 3. Contrast, computed from the overlay ----------------------------- */

const css = read('src/assets/css/site.css');
/** The body of the first rule block whose selector line matches, braces balanced. */
function block(selectorRe) {
  const m = selectorRe.exec(css);
  if (!m) throw new Error(`no block matching ${selectorRe}`);
  let depth = 0;
  for (let i = css.indexOf('{', m.index); i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) return css.slice(m.index, i);
  }
  throw new Error(`unclosed block ${selectorRe}`);
}
const token = (body, name) => {
  const m = new RegExp(`--${name}:\\s*([^;]+);`).exec(body);
  if (!m) throw new Error(`--${name} not found`);
  return m[1].trim();
};
const themes = {
  light: block(/^:root \{/m),
  dark: block(/^:root\[data-theme="dark"\] \{/m),
  'dark (system)': block(/^:root:not\(\[data-theme="light"\]\) \{/m),
};

check('the stylesheet veil matches VEIL in src/lib/programme-imagery.mjs, in every theme block', () => {
  const bad = [];
  for (const [name, body] of Object.entries(themes)) {
    const want = VEIL[name.startsWith('dark') ? 'dark' : 'light'];
    for (const [k, prop] of [['top', 'veil-top'], ['text', 'veil-text'], ['foot', 'veil-foot'], ['dim', 'veil-dim']]) {
      const got = Number(token(body, prop));
      if (got !== want[k]) bad.push(`${name}: --${prop} is ${got}, VEIL says ${want[k]}`);
    }
  }
  assert.deepEqual(bad, []);
});

check('text starts below the light band, and the veil under it is never lighter than --veil-text', () => {
  const rules = css.slice(css.indexOf('.card--backdrop,\n.prog--backdrop {'));
  assert.match(rules, /\.card--backdrop \.card__body \{ padding-top: var\(--card-headroom\); \}/, 'card text does not start at --card-headroom');
  assert.match(rules, /calc\(var\(--veil-text\) \* 100%\), transparent\) var\(--card-headroom\)/, 'the card veil does not reach --veil-text at --card-headroom');
  // The row's own rule, on a line of its own: it comes after the shared one and overrides it.
  const row = /(?<!,\n)^\.prog--backdrop::before \{([\s\S]*?)\}/m.exec(rules)?.[1] || '';
  assert.doesNotMatch(row, /--veil-top/, 'a finder row has text across it and must not use the light band');
  assert.match(row, /--veil-text/, 'the row veil does not name its minimum');
  assert.match(rules, /brightness\(var\(--veil-dim\)\)/, 'the photograph is not dimmed by --veil-dim, so the dark worst case is wrong');
});

check('inside a veiled card the palest grey, the link colour and the warning colour are swapped', () => {
  const rule = /\.card--backdrop,\n\.prog--backdrop \{([\s\S]*?)\}/.exec(css)?.[1] || '';
  assert.match(rule, /--ink-mute:\s*var\(--ink-soft\)/, '--ink-mute is not swapped for --ink-soft over images');
  assert.match(rule, /--accent:\s*var\(--accent-2\)/, '--accent is not swapped for --accent-2 over images');
  assert.match(rule, /--warn:\s*var\(--veil-warn\)/, '--warn is not swapped for --veil-warn over images');
});

check(`every text colour on a veiled card reaches ${AA}:1 over the worst pixel, in both themes`, () => {
  const bad = [];
  const rows = [];
  for (const [name, body] of Object.entries(themes)) {
    // The system dark block only overrides; anything it does not set comes from :root.
    const get = (t) => { try { return token(body, t); } catch { return token(themes.light, t); } };
    const veil = VEIL[name.startsWith('dark') ? 'dark' : 'light'];
    const paper = hex(get('paper'));
    // What a veiled card actually paints text in, after the swaps above.
    const colours = {
      '--ink (titles, requirements)': get('ink'),
      '--ink-soft (meta, and --ink-mute swapped)': get('ink-soft'),
      '--accent-2 (links, swapped from --accent)': get('accent-2'),
      '--veil-warn (no IB route, swapped from --warn)': get('veil-warn'),
    };
    for (const [label, c] of Object.entries(colours)) {
      const text = hex(c);
      const ratio = contrast(text, worstBackground(paper, veil.text, text, veil.dim));
      rows.push(`${name.padEnd(14)} ${label.padEnd(48)} ${ratio.toFixed(2)}:1`);
      if (ratio < AA) bad.push(`${name}: ${label} ${c} is ${ratio.toFixed(2)}:1`);
    }
  }
  console.log(rows.map((r) => `          ${r}`).join('\n'));
  assert.deepEqual(bad, []);
});

/* --- 4. No special cases ------------------------------------------------ */

const SOURCES = [
  'src/lib/programme-imagery.mjs',
  'src/lib/components.mjs',
  'src/pages/explorer.mjs',
  'src/pages/planner.mjs',
  'src/assets/js/explorer.js',
  'src/assets/js/planner.js',
  'scripts/import-programme-images.mjs',
];

check('no background code names a programme, a record or a field value', () => {
  const suspects = [];
  const fields = [...new Set(Object.values(records).map((r) => r.scope?.split(':')[1]).filter(Boolean))];
  for (const rel of SOURCES) {
    const code = read(rel).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    for (const key of [...Object.keys(records), ...site.graph.programmes.keys()]) {
      if (new RegExp(`(['"\`])${key}\\1`).test(code)) suspects.push(`${rel}: "${key}"`);
    }
    for (const f of fields) {
      if (`field:${f}` === FALLBACK_SCOPE && rel === 'src/lib/programme-imagery.mjs') continue;
      if (new RegExp(`['"\`](?:field:)?${f}['"\`]`).test(code)) suspects.push(`${rel}: field "${f}"`);
    }
    if (/(?:destination|country|code)\w*\s*===\s*['"][a-z]{2}['"]/.test(code)) suspects.push(`${rel}: branches on a country`);
  }
  assert.deepEqual(suspects, []);
});

console.log(failures ? `\n${failures} failing\n` : '\nAll programme background guards pass\n');
process.exit(failures ? 1 : 0);
