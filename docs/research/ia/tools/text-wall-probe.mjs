/**
 * Prototype of the proposed text-wall guard (see ../plan.md, "The new guard").
 *
 * Reads built pages (a dist/ folder, or a folder of saved live pages) and
 * reports, per page, the five measures the guard would enforce. Report-only:
 * it never exits non-zero. The real guard belongs in scripts/test-text-walls.mjs
 * with these functions moved into scripts/lib/page-measure.mjs.
 *
 *   node docs/research/ia/tools/text-wall-probe.mjs dist
 *   node docs/research/ia/tools/text-wall-probe.mjs <folder of *.html>
 *
 * Nothing here names a country or a page: every page is held to the same rules.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(import.meta.dirname, '../../../..');
const { defaultView, countWords } = await import(pathToFileURL(path.join(ROOT, 'scripts/lib/page-measure.mjs')).href);

export const BUDGET = {
  run: { paras: 4, words: 150 }, // consecutive long paragraphs with nothing but headings between them
  beforeAction: 120, // default-view words after the hero, before the first picture/control/card/disclosure
  note: 60, // an aside.note open by default
  paragraph: 90, // one visible paragraph
  total: 1500, // the whole default view
  repeat: { words: 12, pages: 10 }, // one visible sentence on more pages than this is a component, not copy
};

// Anything that is not reading. Headings are deliberately not breaks: heading, paragraph, heading, paragraph is still a wall.
const BREAK =
  /<(img|picture|figure|table|details|summary|input|select|textarea|button|canvas|video|iframe)\b|<(ul|ol|div|article|section)\b[^>]*class="[^"]*\b(tiles|cards|card|reel|doors|chips|board|timeline|prog-list|need|glance|stats|steps|toolkit|tags)\b|<a\b[^>]*class="[^"]*\b(card|tile|door|btn|chip)\b/i;
// Named back-references, so the pattern survives being concatenated with BREAK.
const BLOCK = /<(?<bt>p|li|dd|blockquote)\b[^>]*>[\s\S]*?<\/\k<bt>>|<(?<ht>h[1-6])\b[^>]*>[\s\S]*?<\/\k<ht>>/gi;

export function textWalls(pageHtml) {
  // defaultView() flattens a closed <details> to <p>summary</p>, which would hide
  // the disclosure from this measure. A marker inside the summary survives it and
  // counts as a break: a tap-to-open line is exactly the "details on demand" we want.
  // (In the real guard: give defaultView() a `markDisclosures` option instead.)
  const view = defaultView(pageHtml.replace(/<summary\b([^>]*)>/gi, '<summary$1><button data-disclosure></button>'));
  const afterHero = view.replace(/^[\s\S]*?<section class="hero[\s\S]*?<\/section>/, '');
  // 1. Prose runs.
  let cur = { paras: 0, words: 0 }, worst = { paras: 0, words: 0, first: '' };
  let first = '';
  const tokens = [];
  const re = new RegExp(`${BREAK.source}|${BLOCK.source}`, 'gi');
  let m;
  while ((m = re.exec(afterHero))) tokens.push(m);
  const flush = () => {
    if (cur.words > worst.words) worst = { ...cur, first };
    cur = { paras: 0, words: 0 };
    first = '';
  };
  for (const t of tokens) {
    const s = t[0];
    const isBlock = /^<(p|li|dd|blockquote|h[1-6])\b/i.test(s);
    // A picture, control or card — or a block that contains one — ends the run.
    if (!isBlock || BREAK.test(s.replace(/^<[^>]+>/, ''))) { flush(); continue; }
    const n = countWords(s);
    if (/^<h/i.test(s)) { cur.words += n; continue; }
    if (n >= 15) { cur.paras++; cur.words += n; first ||= s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80); }
    else if (/^<li/i.test(s)) flush(); // a list of short items is a list, not prose
  }
  flush();
  // 2. Words before the first action.
  const b = afterHero.search(BREAK);
  const beforeAction = countWords(b >= 0 ? afterHero.slice(0, b) : afterHero);
  // 3. Open notes.
  const notes = [...view.matchAll(/<aside class="note[^"]*">([\s\S]*?)<\/aside>/gi)].map((x) => countWords(x[1]));
  // 4. Longest paragraph.
  const paras = [...view.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((x) => countWords(x[1]));
  const sentences = [...view.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .flatMap((x) => x[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+(?=[A-Z])/))
    .filter((s) => s.split(' ').length >= BUDGET.repeat.words);
  return {
    total: countWords(view),
    run: worst,
    beforeAction,
    maxNote: Math.max(0, ...notes),
    maxParagraph: Math.max(0, ...paras),
    sentences,
  };
}

export function breaches(r) {
  const out = [];
  if (r.run.paras > BUDGET.run.paras || r.run.words > BUDGET.run.words) out.push(`run ${r.run.paras}¶/${r.run.words}w`);
  if (r.beforeAction > BUDGET.beforeAction) out.push(`before-action ${r.beforeAction}w`);
  if (r.maxNote > BUDGET.note) out.push(`note ${r.maxNote}w`);
  if (r.maxParagraph > BUDGET.paragraph) out.push(`paragraph ${r.maxParagraph}w`);
  if (r.total > BUDGET.total) out.push(`total ${r.total}w`);
  return out;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = path.resolve(process.argv[2] || path.join(ROOT, 'dist'));
  const files = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.html')) files.push(p);
    }
  };
  walk(dir);
  const results = files.map((f) => ({ page: path.relative(dir, f).replace(/\\/g, '/'), ...textWalls(fs.readFileSync(f, 'utf8')) }));
  const seen = new Map();
  for (const r of results) for (const s of new Set(r.sentences)) seen.set(s, (seen.get(s) || 0) + 1);
  const repeated = [...seen].filter(([, n]) => n > BUDGET.repeat.pages).sort((a, b) => b[1] - a[1]);
  let failing = 0;
  const rule = { run: 0, 'before-action': 0, note: 0, paragraph: 0, total: 0 };
  for (const r of results) {
    const b = breaches(r);
    if (b.length) failing++;
    for (const x of b) rule[x.split(' ')[0]]++;
    if (b.length) console.log(r.page.padEnd(78), b.join(' · '));
  }
  console.log(`\n${failing} of ${results.length} pages breach at least one rule.`, rule);
  console.log(`\n${repeated.length} visible sentences of ${BUDGET.repeat.words}+ words appear on more than ${BUDGET.repeat.pages} pages:`);
  for (const [s, n] of repeated.slice(0, 15)) console.log(`  ${n}×  ${s.slice(0, 110)}`);
}
