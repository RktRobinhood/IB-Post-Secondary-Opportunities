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
 *      A programme with no photograph draws its designed backdrop instead
 *      (src/lib/designed-backdrop.mjs, #67), marked and decorative, and so
 *      does its page's hero when the page has no photograph either: no
 *      programme card on any built page is bare.
 *   2. **Every picture is accounted for.** Each record in
 *      data/programme-images.json names a Commons file, and its page is for
 *      that file. It has an author and a licence to credit and a signed, dated
 *      approval for that file. Its WebP and every srcset variant are on disk at
 *      the size the record says, and in the image standard's shape. Every
 *      published picture appears on /credits/. An official record (the
 *      institution's own photograph, linked and not stored) has instead an
 *      https address, the page that publishes it, its size and an approval
 *      for that address; the path that verifies and draws one is exercised
 *      here against fixtures.
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
import sharp from 'sharp';
import { load, OFFICIAL_MAX_BYTES } from '../src/lib/data.mjs';
import { review, publishable } from '../src/lib/imagery.mjs';
import { VEIL, FALLBACK_SCOPE, CARD_SIZES, contrast, hex, schoolBackdropResolver, worstBackground } from '../src/lib/programme-imagery.mjs';
import { backdropImg, hero } from '../src/lib/components.mjs';
import { toString } from '../src/lib/html.mjs';
import { url } from '../src/lib/layout.mjs';
import { backdropData } from '../src/pages/explorer.mjs';
import { conforms, probeWebp } from './lib/image-standard.mjs';
import { OFFICIAL_LICENCE, publishedOn, verifyOfficial } from './lib/official-image.mjs';
import { cardKey } from '../src/lib/families.mjs';
import { schoolCards } from '../src/pages/schools.mjs';

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

/* A school record's programme (#54): a `school:<key>-<slug>` record names a
   programme of a listed school record, at the slug its page lives at, and is
   keyed `school-<key>-<slug>`. Its card on the school page and its own page
   show it; a programme with no record keeps its school's photograph. */
const schoolProgrammes = new Map();
for (const c of site.countries || []) {
  for (const inst of c.institutions || []) {
    for (const p of inst.school?.programmes || []) if (p.slug) schoolProgrammes.set(`${inst.key}-${p.slug}`, { inst, p });
  }
}
const schoolRecords = Object.entries(records).filter(([, r]) => r.scope?.startsWith('school:'));

check('every school-programme record names a listed programme at the slug of its page, under its own key', () => {
  const bad = [];
  for (const [key, r] of schoolRecords) {
    const id = r.scope.slice('school:'.length);
    if (!schoolProgrammes.has(id)) bad.push(`${key}: no listed school programme "${id}"`);
    if (key !== `school-${id}`) bad.push(`${key}: its scope is for "${id}", so its key should be "school-${id}"`);
  }
  assert.deepEqual(bad, []);
});

check('every school programme with a publishable record shows it on its card and heads its own page with it', () => {
  const bad = [];
  let seen = 0;
  for (const [key, r] of schoolRecords) {
    if (!publishable(r)) continue;
    const hit = schoolProgrammes.get(r.scope.slice('school:'.length));
    if (!hit) continue;
    const { inst, p } = hit;
    seen++;
    const src = r.official ? r.url : r.src;
    if (p.backdrop?.src !== src) { bad.push(`${key}: the programme resolves ${p.backdrop?.src || 'no photograph'}`); continue; }
    const pageHtml = built(path.join(p.href, 'index.html'));
    if (!pageHtml) { bad.push(`${p.href}: not built`); continue; }
    const hero = (pageHtml.match(/<div class="hero__media"[^>]*>\s*<img src="([^"]+)"/) || [])[1] || '';
    // An official address is absolute: drawn as it is, never under the site's base.
    if (r.official ? hero.replace(/&amp;/g, '&') !== src : !hero.endsWith(src)) bad.push(`${p.href}: heads with ${hero || 'no photograph'}, not ${src}`);
    const schoolHtml = built(path.join(inst.href, 'index.html'));
    if (!schoolHtml) { bad.push(`${inst.href}: not built`); continue; }
    // The card that links to this programme (its own, or its family's, whose
    // rows link every path) draws a photograph.
    const cards = [...schoolHtml.matchAll(/<article class="card[^"]*">[\s\S]*?<\/article>/g)].map((m) => m[0]);
    const mine = cards.filter((c) => c.includes(`${p.href}"`));
    if (!mine.length) bad.push(`${inst.href}: no card links to ${p.href}`);
    else if (!mine.some((c) => /^<article class="card[^"]*\bcard--backdrop\b[^"]*">\s*<img class="card__backdrop"/.test(c))) bad.push(`${inst.href}: the card for ${p.slug} draws no photograph`);
  }
  assert.ok(seen > 0 || !schoolRecords.length, 'no school-programme record resolved');
  assert.deepEqual(bad.slice(0, 12), [], `${bad.length} problems`);
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

/* A programme with no photograph draws a pattern generated for it
   (src/lib/designed-backdrop.mjs, #67): in the photograph's place on its
   card, under the same veil, and in its page's hero when that page has no
   photograph either. No programme card anywhere is a bare text box. */
/* Every programme page, with its design and the photograph its card shows:
   its own, or on the page a family's card opens, the one that card shows. */
const designOf = new Map(site.programmes.map((p) => [p.href, { design: p.design, photo: !!p.backdrop, cardPhoto: p.backdrop?.src || null }]));
const schoolsSeen = new Set();
for (const { inst } of schoolProgrammes.values()) {
  if (schoolsSeen.has(inst.key)) continue;
  schoolsSeen.add(inst.key);
  for (const g of schoolCards(inst.school.programmes)) {
    const family = g.members.find((m) => m.backdrop)?.backdrop?.src || null;
    for (const m of g.members) {
      designOf.set(m.href, { design: m.design, photo: !!m.backdrop, cardPhoto: m.backdrop?.src || (m === g.lead ? family : null) });
    }
  }
}

function* builtPages(dir = DIST) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) yield* builtPages(f);
    else if (e.name === 'index.html') yield f;
  }
}

/** A programme card links its title to a programme page: /programmes/<id>/ or /universities/<key>/<slug>/. */
const PROGRAMME_HREF = /<h3 class="card__title"><a href="[^"]*?(\/(?:programmes\/[a-z0-9-]+|universities\/[a-z0-9-]+\/[a-z0-9-]+)\/)"/;

/** What is wrong with one programme card's background. */
function backgroundFaults(c) {
  const out = [];
  const photo = /^<article class="card[^"]*\bcard--backdrop\b[^"]*">\s*<img class="card__backdrop"/.test(c);
  const svg = (c.match(/^<article class="card[^"]*\bcard--backdrop\b[^"]*">\s*(<svg class="dz card__backdrop"[\s\S]*?<\/svg>)/) || [])[1];
  if (!photo && !svg) return ['no photograph and no designed backdrop: a bare card'];
  if (photo && /data-backdrop="designed"/.test(c)) out.push('draws both a photograph and a designed backdrop');
  if (svg) {
    if (!/\baria-hidden="true"/.test(svg)) out.push('its designed backdrop is not aria-hidden');
    if (!/\bdata-backdrop="designed"/.test(svg) || !/\bdata-design="[^"]+"/.test(svg)) out.push('its designed backdrop is not marked data-backdrop="designed" with its data-design');
    if (/<(?:text|title|image|use)\b/.test(svg)) out.push('its designed backdrop carries text, an image or a reference');
    if (/\bid="/.test(svg)) out.push('its designed backdrop has an id, which a page with two of it would repeat');
    if (svg.length > 4096) out.push(`its designed backdrop is ${svg.length} bytes (over 4 KB)`);
  }
  return out;
}

check('the bare-card guard can see what it is for', () => {
  const body = '<div class="card__body"><h3 class="card__title"><a href="/b/universities/x-y/art/">Art</a></h3></div></article>';
  assert.deepEqual(backgroundFaults(`<article class="card card--link">${body}`), ['no photograph and no designed backdrop: a bare card']);
  assert.deepEqual(backgroundFaults(`<article class="card card--link card--backdrop">\n<svg class="dz card__backdrop" aria-hidden="true" data-backdrop="designed" data-design="a/b/1"><path d="M0 0"/></svg>${body}`), []);
  assert.ok(backgroundFaults(`<article class="card card--link card--backdrop"><svg class="dz card__backdrop" data-backdrop="designed" data-design="a"><text>BU</text></svg>${body}`).length === 2, 'misses a monogram or a missing aria-hidden');
});

check('no programme card on any built page is bare: each draws its photograph or its designed backdrop', () => {
  const bad = [];
  let photos = 0;
  let designed = 0;
  for (const f of builtPages()) {
    const text = fs.readFileSync(f, 'utf8');
    for (const m of text.matchAll(/<article class="card card--link[^"]*">[\s\S]*?<\/article>/g)) {
      const href = (m[0].match(PROGRAMME_HREF) || [])[1];
      if (!href) continue;
      const faults = backgroundFaults(m[0]);
      if (/data-backdrop="designed"/.test(m[0])) {
        designed++;
        // A photograph always wins: a card is designed only when its programme has none.
        const known = designOf.get(href);
        if (!known) faults.push('opens a page the catalogue does not know');
        else if (known.photo) faults.push('has a photograph, yet draws a designed backdrop');
      } else photos++;
      if (faults.length) bad.push(`${path.relative(DIST, f)} → ${href}: ${faults.join('; ')}`);
    }
  }
  console.log(`          ${photos} photograph cards · ${designed} designed cards`);
  assert.ok(photos > 150 && designed > 100, `only ${photos} photograph and ${designed} designed cards found`);
  assert.deepEqual(bad.slice(0, 12), [], `${bad.length} cards`);
});

check('every programme page opens on the image its card draws: its photograph, or its designed backdrop', () => {
  const bad = [];
  let photos = 0;
  let designed = 0;
  const unescape = (u) => u.replace(/&amp;/g, '&');
  for (const [href, { design, cardPhoto }] of designOf) {
    const page = built(path.join(href, 'index.html'));
    if (!page || /http-equiv="refresh"/i.test(page)) continue;
    const media = (page.match(/<div class="hero__media[^"]*"[^>]*>[\s\S]*?<\/div>/) || [])[0] || '';
    const img = unescape((media.match(/<img src="([^"]+)"/) || [])[1] || '');
    if (cardPhoto) {
      photos++;
      // An official photograph is an absolute address; a stored one sits under the site's base.
      if (!img || !(img === cardPhoto || img.endsWith(cardPhoto))) bad.push(`${href}: heads with ${img || 'no photograph'}, its card with ${cardPhoto}`);
      continue;
    }
    // A canonical programme with no card photograph keeps its institution's (none today).
    if (img && href.startsWith('/programmes/')) continue;
    designed++;
    const key = (media.match(/class="hero__media hero__media--designed"><svg class="dz"[^>]*\bdata-design="([^"]+)"/) || [])[1];
    if (img) bad.push(`${href}: heads with ${img}, a photograph its card does not show`);
    else if (!key) bad.push(`${href}: no photograph and no designed hero`);
    else if (key !== design?.key) bad.push(`${href}: heads with ${key}, its card with ${design?.key}`);
    else if (!/aria-hidden="true"/.test(media)) bad.push(`${href}: its designed hero is not aria-hidden`);
    else if (/hero__credit/.test(page.slice(page.indexOf('<section class="hero'), page.indexOf('</section>', page.indexOf('<section class="hero'))))) bad.push(`${href}: credits a designed hero`);
  }
  console.log(`          ${photos} pages open on their card's photograph · ${designed} on their card's design`);
  assert.ok(photos > 0 && designed > 0, 'no programme page found of one kind; the check is looking in the wrong place');
  assert.deepEqual(bad.slice(0, 12), [], `${bad.length} pages`);
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
    if (r.official) continue; // the next check
    if (!r.file) { bad.push(`${key}: no Commons file`); continue; }
    if (title(r.page) !== r.file) bad.push(`${key}: names "${r.file}" but its page is for "${title(r.page)}"`);
    if (!r.author || !r.licence) bad.push(`${key}: no ${!r.author ? 'author' : 'licence'} to credit`);
    if (!/^(?:CC0|Public domain|PD|CC BY(?:-SA)? \d\.\d)/i.test(r.licence || '')) bad.push(`${key}: licence "${r.licence}" is not CC0, PD, CC BY or CC BY-SA`);
    if (!r.scope || !/^(?:programme|field|school):[a-z0-9-]+$/.test(r.scope)) bad.push(`${key}: scope "${r.scope}"`);
    const rv = review(r);
    if (!rv) bad.push(`${key}: no complete review for "${r.file}"`);
    else if (rv.state === 'approved' && !rv.note) bad.push(`${key}: approved with no note saying why`);
  }
  assert.deepEqual(bad, []);
});

/** What is wrong with an official record: the institution's own photograph, linked from the page that publishes it. */
function officialFaults(key, r) {
  const out = [];
  if (!/^https:\/\/[^/\s]+\/\S*$/.test(r.url || '')) out.push(`${key}: its url "${r.url || ''}" is not an https address`);
  if (!/^https:\/\/[^/\s]+/.test(r.sourcePage || '')) out.push(`${key}: no https sourcePage that publishes it`);
  if (!(r.width > 0 && r.height > 0)) out.push(`${key}: no width and height`);
  if (typeof r.bytes === 'number' && r.bytes > OFFICIAL_MAX_BYTES) out.push(`${key}: ${r.bytes} bytes, over OFFICIAL_MAX_BYTES`);
  if (!/^school:[a-z0-9-]+$/.test(r.scope || '')) out.push(`${key}: an official photograph is one school programme's own; its scope is "${r.scope}"`);
  if (r.src || r.variants || r.file) out.push(`${key}: an official record links; it names no stored file or Commons file`);
  const rv = review(r);
  if (rv?.state !== 'approved' || rv.url !== r.url) out.push(`${key}: no approval signed for ${r.url}`);
  else if (!rv.note) out.push(`${key}: approved with no note saying why`);
  return out;
}

check('every official record links an https image, names the page that publishes it, and is approved for that address', () => {
  const bad = Object.entries(records).filter(([, r]) => r.official).flatMap(([key, r]) => officialFaults(key, r));
  assert.deepEqual(bad, []);
});

/* The official path end to end, against fixtures and without the network: the
   importer's verification (scripts/lib/official-image.mjs), the resolver, and
   the markup of a card, a finder or planner row, and a programme page's hero.
   No real record is needed for any of it to be held. */
const FIX = { url: 'https://www.example.edu/media/lab.jpg?w=1600&h=1000', page: 'https://www.example.edu/study/lab-science' };
const verified = await (async () => {
  const jpeg = (width) => sharp({ create: { width, height: Math.round(width * 0.625), channels: 3, background: '#808080' } }).jpeg().toBuffer();
  const [wide, narrow] = await Promise.all([jpeg(1200), jpeg(640)]);
  const og = `<meta content="${FIX.url.replace(/&/g, '&amp;')}" property="og:image">`;
  const serve = (routes) => async (u) => {
    const r = routes[u];
    if (!r) return new Response('', { status: 404 });
    return typeof r === 'string'
      ? new Response(r, { status: 200, headers: { 'content-type': 'text/html' } })
      : new Response(r.body, { status: 200, headers: { 'content-type': r.type || 'image/jpeg' } });
  };
  const run = (routes, opts = {}) => verifyOfficial({ officialUrl: FIX.url, sourcePage: FIX.page }, { fetch: serve(routes), ...opts });
  return {
    good: await run({ [FIX.url]: { body: wide }, [FIX.page]: og }),
    unpublished: await run({ [FIX.url]: { body: wide }, [FIX.page]: '<img src="/media/other.jpg">' }),
    narrow: await run({ [FIX.url]: { body: narrow }, [FIX.page]: og }),
    heavy: await run({ [FIX.url]: { body: wide }, [FIX.page]: og }, { maxBytes: 100 }),
    notImage: await run({ [FIX.url]: { body: wide, type: 'text/html' }, [FIX.page]: og }),
    gone: await run({ [FIX.page]: og }),
  };
})();

check('the official-photo verification can see what it is for', () => {
  assert.deepEqual(verified.good.problems, [], 'rejects a wide image its page publishes');
  assert.equal(verified.good.width, 1200);
  assert.equal(verified.good.type, 'image/jpeg');
  for (const [name, re] of [['unpublished', /does not show/], ['narrow', /640 px wide/], ['heavy', /ceiling/], ['notImage', /served as "text\/html"/], ['gone', /answers 404/]]) {
    assert.ok(verified[name].problems.some((p) => re.test(p)), `misses ${name}: ${verified[name].problems.join('; ') || 'no problem found'}`);
    assert.equal(verified[name].width, undefined, `${name} still returns a size to record`);
  }
  // The same path under a CDN host and another query, a srcset, a lazy data-srcset, a twitter:image: each is the page publishing it.
  const path = '/media/lab.jpg';
  for (const page of [
    `<img src="https://cdn.example.edu${path}?w=800" alt="">`,
    `<picture><source srcset="${path}?w=480 480w, ${path}?w=1600&amp;h=1000 1600w"></picture>`,
    `<img class="lazy" data-srcset="https://cdn.example.edu${path}?tr=w-400,h-250 400w" alt="">`,
    `<meta name="twitter:image" content="${FIX.url}">`,
    `<div class="hero" style="background-image: url('${path}?w=1600')"></div>`,
    `<section data-bg="${path}"></section>`,
  ]) assert.ok(publishedOn(page, FIX.page, FIX.url), `misses ${page}`);
  assert.equal(publishedOn('<a href="/media/lab.jpg">download</a>', FIX.page, FIX.url), null, 'counts a link as publishing it');
});

check('an official record resolves and draws as a linked address: no base path, no srcset, credited to its page', () => {
  const record = {
    kind: 'school', scope: 'school:fixture-lab-science', subject: 'Lab Science', official: true, url: FIX.url, sourcePage: FIX.page,
    width: 1600, height: 1000, bytes: 250000, type: 'image/jpeg', licence: OFFICIAL_LICENCE, fetched: '2026-09-30',
    review: { state: 'approved', by: 'fixture', at: '2026-09-30', url: FIX.url, note: 'Fixture.' },
  };
  assert.deepEqual(officialFaults('school-fixture-lab-science', record), []);
  assert.ok(officialFaults('k', { ...record, sourcePage: undefined, review: { ...record.review, url: 'https://other.example/x.jpg' } }).length === 2, 'misses a missing page and an approval for another address');
  const b = schoolBackdropResolver({ 'school-fixture-lab-science': record })('fixture', 'lab-science');
  assert.ok(b, 'an approved official record does not resolve');
  assert.equal(b.src, FIX.url);
  assert.equal(b.external, true);
  assert.deepEqual(b.srcset, []);
  assert.equal(b.page, FIX.page);
  assert.equal(schoolBackdropResolver({ k: { ...record, review: undefined } })('fixture', 'lab-science'), null, 'an unsigned official record resolves');
  const escaped = FIX.url.replace(/&/g, '&amp;');
  const cardImg = toString(backdropImg(b, CARD_SIZES, 'card__backdrop'));
  assert.ok(cardImg.includes(`src="${escaped}"`), `the card draws ${cardImg}`);
  assert.doesNotMatch(cardImg, /srcset=|sizes=/, 'the card writes an empty srcset');
  const row = backdropData(b);
  assert.equal(row.src, FIX.url);
  assert.equal(row.srcset, '');
  // planner.js's own backdrop(), run as the browser runs it.
  const planner = read('src/assets/js/planner.js');
  const fn = new Function(`${/const esc = [\s\S]*?\);\n/.exec(planner)[0]}${/function backdrop\(b\) \{[\s\S]*?\n\}/.exec(planner)[0]}\nreturn backdrop;`)();
  const plannerImg = fn(row);
  assert.ok(plannerImg.includes(`src="${escaped}"`) && !/srcset=/.test(plannerImg), `the planner draws ${plannerImg}`);
  const top = toString(hero({ title: 'Lab Science', image: { src: b.src, alt: '', credit: { text: 'Image: Fixture University', url: b.page } } }));
  assert.ok(top.includes(`<img src="${escaped}"`), 'the programme page hero prefixes or changes the address');
  // A Commons record is unchanged: its srcset, under the site's base.
  const commons = schoolBackdropResolver({ c: { scope: 'school:fixture-lab-science', src: '/assets/img/programmes/c.webp', width: 960, height: 600, variants: [{ src: '/assets/img/programmes/c-480.webp', width: 480, height: 300 }], review: { state: 'approved', by: 'fixture', at: '2026-09-30' } } })('fixture', 'lab-science');
  const commonsImg = toString(backdropImg(commons, CARD_SIZES, 'card__backdrop'));
  assert.ok(commonsImg.includes(`src="${url('/assets/img/programmes/c.webp')}"`) && commonsImg.includes(`srcset="${url('/assets/img/programmes/c-480.webp')} 480w`), `a Commons card draws ${commonsImg}`);
});

check('every stored file and srcset variant is on disk, as recorded, in the image standard', () => {
  const bad = [];
  for (const [key, r] of Object.entries(records)) {
    if (r.official) continue; // linked from the institution's server; nothing of ours to measure
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
  // An official photograph is credited by the page it was published on.
  const missing = [...new Set(Object.values(records).filter((r) => publishable(r)).map((r) => (r.official ? r.sourcePage : r.page)))]
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
  /* A card (#67 round 2): the picture is the card's top, --card-headroom
     tall; the text follows it, reaching back --card-overlap
     over its foot, and there the picture's mask lets through at most
     1 − --veil-text of it: the same worst case as a --veil-text veil. */
  assert.match(rules, /\.card--backdrop \.card__backdrop \{[^}]*flex: 0 0 var\(--card-headroom\)[^}]*margin-bottom: calc\(-1 \* var\(--card-overlap\)\)/, 'the card picture is not --card-headroom tall, ending --card-overlap under the text');
  assert.match(rules, /\.card--backdrop \.card__body \{ padding-top: 0;/, 'card text does not start straight after the picture');
  const masks = rules.match(/(?<!-webkit-)mask-image: linear-gradient\(to bottom, #000 calc\(100% - var\(--card-overlap\) - [\d.]+rem\), rgb\(0 0 0 \/ calc\(1 - var\(--veil-text\)\)\) calc\(100% - var\(--card-overlap\)\), transparent 100%\)/g) || [];
  assert.equal(masks.length, 1, 'the card picture does not fade to 1 − --veil-text where the text starts');
  assert.match(rules, /\.card--backdrop::before \{\s*background: color-mix\(in srgb, var\(--paper\) calc\(var\(--veil-top\) \* 100%\), transparent\);\s*\}/, 'the card veil over the picture is not the light band');
  assert.match(rules, /calc\(var\(--veil-text\) \* 100%\), transparent\) var\(--card-headroom\)/, 'the shared veil does not reach --veil-text at --card-headroom');
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

/** A degree named in a credential line: an abbreviation (BSc, BEng, LLB) or a word.
    The long professional degrees ("Doctor of Dental Surgery (DDS)", a
    medical doctor's or a dentist's title) name the profession they qualify
    for; their cards came into this check with their designed backdrops (#67). */
const DEGREE_WORD = /\b(?:B[A-Z][A-Za-z]{0,4}|LLB|M[A-Z][A-Za-z]{0,4}|PhD|bachelor|master|degrees?|diploma|certificate|associate|doctor|dentist|DDS)\b/i;

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
  const pointFigures = cardText(card).match(/\b\d+(?:[.,]\d+)?\+? IB points\b/g) || [];
  const cutOffTag = /<li class="tag tag--sand">[^<]*IB points<\/li>/.test(card);
  if (cutOffTag && pointFigures.length > 1) out.push(`it repeats ${pointFigures.length} IB-points figures (${pointFigures.join(', ')})`);
  if (/<\/span> \+ <span/.test(card)) out.push('it joins requirements with "+" instead of "and"');
  return out;
}

/** Programme cards in a built page: articles with a backdrop. */
const programmeCards = (page) => [...page.matchAll(/<article class="card card--link[^"]*card--backdrop[^"]*">[\s\S]*?<\/article>/g)].map((m) => m[0]);

const programmeCardPages = () => [
  'index.html',
  ...site.institutionCatalogue.all.filter((i) => i.programmes.length).map((i) => path.join(i.href, 'index.html')),
  ...new Set([...schoolProgrammes.values()].map(({ inst }) => path.join(inst.href, 'index.html'))),
];

check('the card guard can see what it is for', () => {
  const old = '<article class="card card--link card--backdrop"><h3 class="card__title">Electronics</h3><p class="card__cred">Sønderborg</p>' +
    '<div class="req" data-req><p class="req__ib">Needs X</p><p class="req__local"><span class="req-local">Danish requirement: English B</span></p></div>' +
    '<ul class="tags"><li class="tag tag--sand">A</li><li class="tag tag--ok">B</li></ul></article>';
  const f = cardFaults(old);
  assert.ok(f.some((x) => /names no degree/.test(x)), 'misses a credential line with no degree');
  assert.ok(f.some((x) => /published/.test(x)), 'misses the published requirement on a card');
  assert.ok(f.some((x) => /2 tags/.test(x)), 'misses two tags');
  const repeated = cardFaults('<article class="card card--link card--backdrop"><p class="card__cred">BSc · 3 yrs</p><p class="req__ib">Needs 28+ IB points</p><li class="tag tag--sand">Last year: 42 IB points</li></article>');
  assert.ok(repeated.some((x) => /repeats 2 IB-points figures/.test(x)), 'misses two competing point figures');
  const joined = cardFaults('<article class="card card--link card--backdrop"><p class="card__cred">BSc · 3 yrs</p><p class="req__ib"><span>Physics</span> + <span>Chemistry</span></p></article>');
  assert.ok(joined.some((x) => /instead of "and"/.test(x)), 'misses a symbolic subject join');
  const good = '<article class="card card--link card--backdrop"><p class="card__cred"><span class="card__facts"><span class="card__fact">BSc or BEng</span><span class="card__fact"><span class="card__sep"> · </span>3–3½ yrs</span></span></p>' +
    '<div class="req" data-req><p class="req__ib"><strong>Needs</strong> X <span class="req__count">+2 more</span></p></div></article>';
  assert.deepEqual(cardFaults(good), []);
});

check('every programme card: a degree on its credential line, one Needs line, one tag, no published form', () => {
  const pages = programmeCardPages();
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
  assert.ok(seen > 150, `only ${seen} programme cards found`);
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
  'src/lib/designed-backdrop.mjs',
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
