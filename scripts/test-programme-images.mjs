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
 *   5. **One line per block.** Every programme card names its degree on its
 *      credential line ("BSc or BEng · 3–3½ yrs"), carries one Needs line
 *      and at most one tag, and leaves the published (local) requirement to
 *      the programme page. The home page's first twelve titles differ.
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
import { cardKey } from '../src/lib/families.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(ROOT, 'dist');
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
    // A family of paths is one card, but every path is still one tap away.
    for (const p of inst.programmes) if (!grid.includes(`/programmes/${p.id}/`)) bad.push(`${inst.href}: no link to ${p.id}`);
  }
  assert.deepEqual(bad, []);
  // One card per programme, or per family of paths (src/lib/families.mjs).
  const expected = new Set(site.programmes.map((p) => cardKey(site.graph.programmes.get(p.programmeId || p.id) || { id: p.id }))).size;
  assert.ok(cards >= expected, `only ${cards} programme cards found for ${expected} cards' worth of programmes`);
});

const jsonIn = (page, id) => {
  const htmlText = built(page);
  if (!htmlText) throw new Error(`${page} is not built`);
  const m = htmlText.match(new RegExp(`<script type="application/json" id="${id}">([\\s\\S]*?)</script>`));
  if (!m) throw new Error(`${page} has no #${id}`);
  return JSON.parse(m[1]);
};

/* The finder is the home page's discovery surface (docs/research/ia/plan.md,
   Batch D): its cards are drawn at build time through card(), one per
   programme or per family, with every programme a member of one. */
check('every card on the discovery surface carries a background', () => {
  const page = built('index.html');
  if (!page) throw new Error('index.html is not built');
  const cards = [...page.matchAll(/<li class="discover__card"[^>]*>([\s\S]*?)<\/li>\s*(?=<li class="discover__card"|<\/ul>)/g)].map((m) => m[1]);
  assert.ok(cards.length > 0, 'no discovery cards on the home page');
  const bare = cards.filter((c) => !/class="card__backdrop"/.test(c)).map((c) => (c.match(/\/programmes\/([a-z0-9-]+)\//) || [])[1]);
  assert.deepEqual(bare, []);
  const members = jsonIn('index.html', 'discover-data').cards.reduce((n, c) => n + c.members.length, 0);
  assert.equal(members, site.programmes.length);
});

check('every planner result carries a background', () => {
  const opps = jsonIn('planner/index.html', 'planner-opportunities');
  const bad = opps.filter((o) => !o.display?.backdrop?.src).map((o) => o.id);
  assert.deepEqual(bad, []);
});

check('the planner draws the background the same way the cards do', () => {
  for (const rel of ['src/assets/js/planner.js']) {
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

/* Every chip (.tag, .tag--*) against its own background, in every theme, and
   the cut-off chip as a veiled card paints it. The round-1 critic measured the
   cut-off chip at 3.05:1 in OS dark mode: the dark colour was set only for the
   explicit dark theme, and this guard checked text but not chips. A chip's
   background is an opaque tint, so the pair is the whole story; a transparent
   chip sits on the paper. */
check(`every tag chip reaches ${AA}:1 on its own background, in every theme and on a veiled card`, () => {
  const rule = (sel) => {
    const m = new RegExp(`^${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'm').exec(css);
    return m ? m[1] : null;
  };
  const prop = (body, name) => (body ? (new RegExp(`(?:^|;|\\s)${name}:\\s*([^;]+);`).exec(body) || [])[1]?.trim() : null);
  const base = rule('.tag');
  const mods = [...css.matchAll(/^\.tag--([a-z]+)\s*\{/gm)].map((m) => m[1]);
  const override = (theme, mod) => {
    const sel = theme === 'dark'
      ? `:root[data-theme="dark"] .tag--${mod}`
      : theme === 'dark (system)' ? `:root:not([data-theme="light"]) .tag--${mod}` : null;
    if (!sel) return null;
    const m = new RegExp(`${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`).exec(css);
    return m ? m[1] : null;
  };
  const bad = [];
  const rows = [];
  for (const [name, body] of Object.entries(themes)) {
    const get = (t) => { try { return token(body, t); } catch { return token(themes.light, t); } };
    const resolve = (v) => {
      if (!v || v === 'transparent') return hex(get('paper'));
      const m = /^var\(--([a-z0-9-]+)\)$/.exec(v);
      return hex(m ? get(m[1]) : v);
    };
    const pairs = [['.tag', prop(base, 'color'), prop(base, 'background')]];
    for (const mod of mods) {
      const own = rule(`.tag--${mod}`);
      const over = override(name, mod);
      pairs.push([`.tag--${mod}`, prop(over, 'color') || prop(own, 'color') || prop(base, 'color'), prop(own, 'background') || prop(base, 'background')]);
    }
    const veiled = rule('.card--backdrop .tag--sand,\n.prog--backdrop .tag--sand') || (/\.card--backdrop \.tag--sand[^{]*\{([^}]*)\}/.exec(css) || [])[1];
    if (veiled) pairs.push(['.tag--sand on a veiled card', prop(veiled, 'color'), prop(rule('.tag--sand'), 'background')]);
    for (const [label, fg, bg] of pairs) {
      const ratio = contrast(resolve(fg), resolve(bg));
      rows.push(`${name.padEnd(14)} ${label.padEnd(30)} ${ratio.toFixed(2)}:1`);
      if (ratio < AA) bad.push(`${name}: ${label} (${fg} on ${bg}) is ${ratio.toFixed(2)}:1`);
    }
  }
  console.log(rows.map((r) => `          ${r}`).join('\n'));
  assert.deepEqual(bad, []);
});

/* --- 4. No special cases ------------------------------------------------ */

/* --- 5. One line per block (#46 round 2, #44 round 1) --------------------
   A programme card is a photograph, a title, a credential line that always
   names the degree, one Needs line, one tag and the institution. The
   programme page keeps the detail. Read from the built pages, so a card any
   page draws is held to it. */

/** A degree named in a credential line: an abbreviation (BSc, BEng, LLB) or a word. */
const DEGREE_WORD = /\b(?:B[A-Z][A-Za-z]{0,4}|LLB|M[A-Z][A-Za-z]{0,4}|PhD|bachelor|master|degree|diploma|certificate|associate)\b/i;

const cardText = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

/** What is wrong with one programme card's markup. */
function cardFaults(card) {
  const out = [];
  const cred = card.match(/<p class="card__cred">([\s\S]*?)<\/p>/);
  if (!cred) out.push('no credential line');
  else {
    const line = cardText(cred[1]);
    if (!DEGREE_WORD.test(line)) out.push(`the credential line "${line}" names no degree`);
    if (/^·|·$|· ·|\d \/ yrs/.test(line)) out.push(`the credential line "${line}" is broken`);
  }
  if (/class="[^"]*\breq(?:__local|-local)\b/.test(card)) out.push('it carries the published (local) requirement; that belongs on the programme page');
  if (/As published:/.test(card)) out.push('it quotes "As published:"; that belongs on the programme page');
  if (/class="req__floor"/.test(card)) out.push('it carries a separate quota line');
  const needs = (card.match(/<p class="req__ib"/g) || []).length;
  if (needs > 1) out.push(`${needs} Needs lines`);
  const tags = (card.match(/<li class="tag\b/g) || []).length;
  if (tags > 1) out.push(`${tags} tags`);
  return out;
}

/** Programme cards in a built page: articles with a backdrop. */
const programmeCards = (page) => [...page.matchAll(/<article class="card card--link card--backdrop">[\s\S]*?<\/article>/g)].map((m) => m[0]);

check('the card guard can see what it is for', () => {
  const old = '<article class="card card--link card--backdrop"><h3 class="card__title">Electronics</h3><p class="card__cred">Sønderborg</p>' +
    '<div class="req" data-req><p class="req__ib">Needs X</p><p class="req__local"><span class="req-local">Danish requirement: English B</span></p></div>' +
    '<ul class="tags"><li class="tag tag--sand">A</li><li class="tag tag--ok">B</li></ul></article>';
  const f = cardFaults(old);
  assert.ok(f.some((x) => /names no degree/.test(x)), 'misses a credential line with no degree');
  assert.ok(f.some((x) => /published/.test(x)), 'misses the published requirement on a card');
  assert.ok(f.some((x) => /2 tags/.test(x)), 'misses two tags');
  const good = '<article class="card card--link card--backdrop"><p class="card__cred"><span class="card__facts"><span class="card__fact">BSc or BEng</span><span class="card__fact"><span class="card__sep"> · </span>3–3½ yrs</span></span></p>' +
    '<div class="req" data-req><p class="req__ib"><strong>Needs</strong> X <span class="req__count">+2 more</span></p></div></article>';
  assert.deepEqual(cardFaults(good), []);
});

check('every programme card: a degree on its credential line, one Needs line, one tag, no published form', () => {
  const pages = ['index.html', ...site.institutionCatalogue.all.filter((i) => i.programmes.length).map((i) => path.join(i.href, 'index.html'))];
  const bad = [];
  let seen = 0;
  for (const rel of pages) {
    const page = built(rel);
    if (!page) continue;
    for (const c of programmeCards(page)) {
      seen++;
      const f = cardFaults(c);
      if (f.length) bad.push(`${rel} ${(c.match(/\/programmes\/([a-z0-9-]+)\//) || [])[1]}: ${f.join('; ')}`);
    }
  }
  assert.ok(seen > 50, `only ${seen} programme cards found`);
  assert.deepEqual(bad.slice(0, 12), [], `${bad.length} cards`);
});

/* Round 3: six ways to talk about admission on the tags ("Accepts Course
   Results", "Diploma, or another route", "Restricted admission", …) and a
   seventh on the Needs line, with one country's jargon ("Quota 1") among
   them. At most four kinds of tag, in plain words, and no jargon on a card. */
const TAG_KIND = [
  ['last year', /^(?:Last year|\d{4}): /],
  ['open', /^Open entry$/],
  ['diploma', /^Full Diploma$/],
  ['course results', /^Diploma or Course Results$/],
];
function vocabularyFaults(cards) {
  const out = [];
  const kinds = new Set();
  for (const c of cards) {
    const id = (c.match(/\/programmes\/([a-z0-9-]+)\//) || [])[1];
    for (const m of c.matchAll(/<li class="tag\b[^"]*">([\s\S]*?)<\/li>/g)) {
      const label = cardText(m[1]);
      const kind = TAG_KIND.find(([, re]) => re.test(label));
      if (!kind) out.push(`${id}: the tag "${label}" is not one of the card's four kinds`);
      else kinds.add(kind[0]);
    }
    const words = cardText(c);
    for (const bad of [/\bQuota \d/, /Restricted admission/, /\bRequires\b/]) if (bad.test(words)) out.push(`${id}: says "${words.match(bad)[0]}"`);
  }
  if (kinds.size > 4) out.push(`${kinds.size} kinds of tag`);
  return out;
}

check('the admission vocabulary guard can see what it is for', () => {
  const old = '<article class="card card--link card--backdrop"><a href="/programmes/x/">x</a><ul class="tags"><li class="tag tag--sand">Restricted admission</li></ul>' +
    '<p class="req__ib"><strong>Needs</strong> <span class="req-ib">Quota 1: at least 31 IB points</span></p></article>';
  const f = vocabularyFaults([old]);
  assert.ok(f.some((x) => /not one of/.test(x)), 'misses "Restricted admission"');
  assert.ok(f.some((x) => /Quota/.test(x)), 'misses "Quota 1" on a card');
  assert.deepEqual(vocabularyFaults(['<article class="card card--link card--backdrop"><ul class="tags"><li class="tag tag--sand">Last year: 38 IB points</li></ul></article>']), []);
});

check('every programme card speaks one admission vocabulary: at most four kinds of tag, no quota names, no "Restricted admission"', () => {
  const pages = ['index.html', ...site.institutionCatalogue.all.filter((i) => i.programmes.length).map((i) => path.join(i.href, 'index.html'))];
  const cards = pages.map(built).filter(Boolean).flatMap(programmeCards);
  assert.ok(cards.length > 50, `only ${cards.length} programme cards found`);
  const bad = vocabularyFaults(cards);
  assert.deepEqual(bad.slice(0, 12), [], `${bad.length} faults`);
});

check('the first screen of the discovery surface has twelve different titles, and "Show all" counts cards truthfully', () => {
  const page = built('index.html');
  const cards = [...page.matchAll(/<li class="discover__card"[^>]*>\s*(<article[\s\S]*?<\/article>)/g)].map((m) => m[1]);
  const first = cards.slice(0, 12).map((c) => cardText((c.match(/<h3 class="card__title">([\s\S]*?)<\/h3>/) || [])[1] || ''));
  const twice = first.filter((t, i) => first.indexOf(t) !== i);
  assert.deepEqual(twice, [], `repeated in the first twelve: ${twice.join(', ')}`);
  const summary = cardText((page.match(/<details class="discover__more"[\s\S]*?<summary>([\s\S]*?)<\/summary>/) || [])[1] || '');
  // It counts cards, in the word a student reads them by (#52 round 2: "Show all 67 programmes").
  if (summary) assert.ok(summary.includes(`${cards.length} programme`), `"${summary}" does not say the ${cards.length} cards it opens`);
});

/* --- 6. The home page lands on places (#44 round 2) ----------------------
   The first screen had no photograph: a form in the hero pushed the cards
   below the fold. The filters are one row — the search and "Filters", a
   sheet at every width — and the legend under the globe is one line. A door
   ends on its researched countries' tiles, and a word with no degree can
   find the degrees whose descriptions use it. */

check('the discovery surface folds its filters into one row: a sheet at every width', () => {
  const page = built('index.html');
  assert.ok(/id="f-sheet-open"/.test(page) && /class="finder__sheet" id="f-sheet"/.test(page), 'no "Filters" button and sheet');
  const css = read('src/assets/css/site.css');
  // The rule that hides the sheet once the script is there, outside any @media block.
  const topLevel = css.replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
  assert.ok(/\.discover__filters\[data-enhanced\] \.finder__sheet \{ display: none; \}/.test(topLevel), 'the sheet is folded only at some widths');
});

check('the legend under the globe is one line; the rest is one tap down', () => {
  const page = built('index.html');
  const caption = (page.match(/<figcaption class="world__caption">([\s\S]*?)<\/figcaption>/) || [])[1] || '';
  const outside = caption.replace(/<details class="world__how">[\s\S]*?<\/details>/, '');
  const lines = (outside.match(/class="world__legend"/g) || []).length;
  assert.equal(lines, 1, `${lines} legend lines outside "How to use the globe"`);
  assert.ok(/<details class="world__how">/.test(caption), 'no "How to use the globe"');
});

check('every researched country with no mapped degree is a tile a door can land on, and every degree carries its description\'s words', () => {
  const page = built('index.html');
  const tpl = (page.match(/<template id="discover-places-tiles">([\s\S]*?)<\/template>/) || [])[1] || '';
  const scopes = [...tpl.matchAll(/<li data-scope="([a-z]+)">/g)].map((m) => m[1]);
  const code = (p) => (typeof p.destination === 'object' ? p.destination?.code : p.destination);
  const withDegrees = new Set(site.programmes.map(code));
  const researched = [...(site.destinations || []), ...(site.countries || [])].map((d) => d.code).filter((c) => c && !withDegrees.has(c));
  assert.equal(scopes.length, new Set(researched).size, `${scopes.length} tiles for ${new Set(researched).size} countries`);
  const data = JSON.parse((page.match(/<script type="application\/json" id="discover-data">([\s\S]*?)<\/script>/) || [])[1] || '{}');
  const bare = data.cards.flatMap((c) => c.members).filter((m) => typeof m.w !== 'string');
  assert.deepEqual(bare.map((m) => m.id), []);
});

const SOURCES = [
  'src/lib/programme-imagery.mjs',
  'src/lib/components.mjs',
  'src/pages/explorer.mjs',
  'src/pages/discover.mjs',
  'src/lib/paths.mjs',
  'src/pages/planner.mjs',
  'src/assets/js/discover.js',
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
