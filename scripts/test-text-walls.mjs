/**
 * No page opens on a wall of prose; details sit behind a disclosure.
 *
 * The Destination budget (`test-page-budget.mjs`, #37) held one family of
 * pages to a word budget, and nothing measured the rest. That is how
 * `/programmes/` reached 78 phone screens and `/timeline/` 158 with every check
 * green — the same failure #37 recorded, one directory over. The audit is in
 * docs/research/ia/text-walls.md; the rules and why each number is that number
 * are in docs/research/ia/plan.md ("The new guard").
 *
 * ## The rules, held by every built page
 *
 *   - **Prose run**: consecutive paragraphs of 15+ words with only headings
 *     between them. More than 4 paragraphs or more than 150 words fails.
 *   - **Before the first action**: default-view words after the hero and before
 *     the first picture, control, card, table or disclosure. At most 120.
 *   - **Open note**: an `aside.note` in the default view. At most 60 words.
 *   - **One paragraph**: at most 90 words.
 *   - **Whole default view**: at most 1,500 words.
 *   - **Repeated sentence**: a visible sentence of 12+ words on more than 10
 *     pages is boilerplate, and belongs in a component or on one linked page.
 *
 * Nothing here names a page or a country. Every page is measured the same way.
 *
 * ## The ratchet
 *
 * The pages that broke a rule when this guard landed are listed, with their
 * measured numbers, in `scripts/lib/text-walls-known.json`. A listed page may
 * not get worse on any measure. A listed page that now passes must be taken off
 * the list — the guard fails until it is — so the list only shrinks. The same
 * holds for the repeated sentences listed there, by page count.
 *
 *   node scripts/test-text-walls.mjs              # the guard
 *   node scripts/test-text-walls.mjs --report     # every page's numbers
 *   node scripts/test-text-walls.mjs --baseline   # print what the list would be today
 *
 * A self-test runs first: a synthetic page of five 30-word paragraphs must
 * fail, and the same page with a disclosure after the third must pass. A guard
 * that cannot fail is not a guard.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { defaultView, countWords, proseRuns, stripCardLists, wordsBeforeFirst } from './lib/page-measure.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
// DIST_DIR reads another build, as `src/build.mjs` writes one.
const DIST = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(ROOT, 'dist');
const KNOWN_FILE = path.join(ROOT, 'scripts/lib/text-walls-known.json');

export const BUDGET = {
  run: { paras: 4, words: 150 },
  beforeAction: 120,
  note: 60,
  paragraph: 90,
  total: 1500,
  repeat: { words: 12, pages: 10 },
};

/* --- Measuring one page ---------------------------------------------------- */

/** A sentence with its numbers taken out: "3 dates on this page…" and "5 dates…" are one piece of boilerplate. */
const sentenceKey = (s) => s.replace(/\d[\d,.]*/g, '#');

export function measurePage(pageHtml) {
  const view = defaultView(pageHtml, { markDisclosures: true });
  const afterHero = view.replace(/^[\s\S]*?<section class="hero[\s\S]*?<\/section>/, '');
  const run = proseRuns(afterHero);
  const notes = [...view.matchAll(/<aside class="note[^"]*">([\s\S]*?)<\/aside>/gi)].map((x) => countWords(x[1]));
  const paras = [...view.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((x) => x[1]);
  const sentences = paras
    .flatMap((p) => p.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+(?=[A-Z])/))
    .filter((s) => s.split(' ').length >= BUDGET.repeat.words)
    .map(sentenceKey);
  return {
    run: { paras: run.paras, words: run.words },
    runStarts: run.first,
    beforeAction: wordsBeforeFirst(stripCardLists(afterHero)),
    note: Math.max(0, ...notes),
    paragraph: Math.max(0, ...paras.map(countWords)),
    total: countWords(view),
    sentences: [...new Set(sentences)],
  };
}

/** The rules a measured page breaks, as `{ rule, value, budget }`. */
export function breaches(m) {
  const out = [];
  if (m.run.paras > BUDGET.run.paras) out.push({ rule: 'run.paras', value: m.run.paras, budget: BUDGET.run.paras });
  if (m.run.words > BUDGET.run.words) out.push({ rule: 'run.words', value: m.run.words, budget: BUDGET.run.words });
  if (m.beforeAction > BUDGET.beforeAction) out.push({ rule: 'beforeAction', value: m.beforeAction, budget: BUDGET.beforeAction });
  if (m.note > BUDGET.note) out.push({ rule: 'note', value: m.note, budget: BUDGET.note });
  if (m.paragraph > BUDGET.paragraph) out.push({ rule: 'paragraph', value: m.paragraph, budget: BUDGET.paragraph });
  if (m.total > BUDGET.total) out.push({ rule: 'total', value: m.total, budget: BUDGET.total });
  return out;
}

const RULE_WORDS = {
  'run.paras': 'paragraphs in one run of prose',
  'run.words': 'words in one run of prose',
  beforeAction: 'words before the first picture, control, card, table or disclosure',
  note: 'words in an open note',
  paragraph: 'words in one paragraph',
  total: 'words in the whole default view',
};

const get = (m, rule) => rule.split('.').reduce((o, k) => o?.[k], m);

/* --- Self-test --------------------------------------------------------------- */

function selfTest() {
  const para = (i) => `<p>${Array.from({ length: 30 }, (_, n) => `word${i}x${n}`).join(' ')}</p>`;
  const shell = (inner) => `<html><body><main><section class="hero"><h1>T</h1></section><section>${inner}</section></main></body></html>`;
  const wall = shell([1, 2, 3, 4, 5].map(para).join('\n'));
  const split = shell([1, 2, 3].map(para).join('\n') + '<details><summary>More</summary><p>hidden</p></details>' + [4, 5].map(para).join('\n'));
  const cards = shell('<ul class="tiles">' + [1, 2, 3, 4, 5].map((i) => `<li>${para(i)}</li>`).join('') + '</ul>');
  const problems = [];
  if (!breaches(measurePage(wall)).length) problems.push('five 30-word paragraphs in a row passed');
  if (breaches(measurePage(split)).length) problems.push(`a disclosure after the third paragraph did not break the run (${JSON.stringify(breaches(measurePage(split)))})`);
  if (measurePage(cards).run.paras) problems.push('the items of a card list were read as prose');
  return problems;
}

/* --- The built site ------------------------------------------------------------ */

function builtPages() {
  const files = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.html')) files.push(p);
    }
  };
  walk(DIST);
  return files
    .map((f) => {
      const rel = path.relative(DIST, f).replace(/\\/g, '/');
      const key = rel === 'index.html' ? '/' : rel.replace(/index\.html$/, '');
      return { key, html: fs.readFileSync(f, 'utf8') };
    })
    // A page with no <main> (a redirect stub, the 404 shell) has no reading to measure.
    .filter((p) => /<main\b/i.test(p.html))
    .sort((a, b) => a.key.localeCompare(b.key));
}

function measureAll() {
  const pages = builtPages().map((p) => ({ key: p.key, ...measurePage(p.html) }));
  const seen = new Map();
  for (const p of pages) for (const s of p.sentences) seen.set(s, (seen.get(s) || 0) + 1);
  const repeated = new Map([...seen].filter(([, n]) => n > BUDGET.repeat.pages));
  return { pages, repeated };
}

function baseline({ pages, repeated }) {
  const out = { pages: {}, sentences: {} };
  for (const p of pages) {
    if (!breaches(p).length) continue;
    out.pages[p.key] = { run: p.run, beforeAction: p.beforeAction, note: p.note, paragraph: p.paragraph, total: p.total };
  }
  for (const [s, n] of [...repeated].sort((a, b) => b[1] - a[1])) out.sentences[s] = n;
  return out;
}

/* --- Main ------------------------------------------------------------------------- */

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();

function main() {
  console.log('\nText walls: no page opens on a wall of prose\n');

  const self = selfTest();
  if (self.length) {
    for (const s of self) console.log(`  FAIL  self-test: ${s}`);
    process.exit(1);
  }
  console.log('  ok    self-test: a wall fails, the same wall broken by a disclosure passes');

  if (!fs.existsSync(DIST)) {
    console.log('  FAIL  dist/ does not exist — run the build first');
    process.exit(1);
  }

  const measured = measureAll();
  const { pages, repeated } = measured;

  if (process.argv.includes('--baseline')) {
    console.log(JSON.stringify(baseline(measured), null, 2));
    return;
  }
  if (process.argv.includes('--report')) {
    console.log('  page'.padEnd(60), 'run¶', 'runW', 'before', 'note', 'para', 'total');
    for (const p of pages)
      console.log(`  ${p.key}`.padEnd(60), String(p.run.paras).padStart(4), String(p.run.words).padStart(4), String(p.beforeAction).padStart(6), String(p.note).padStart(4), String(p.paragraph).padStart(4), String(p.total).padStart(5));
    console.log('');
  }

  const known = JSON.parse(fs.readFileSync(KNOWN_FILE, 'utf8'));
  const knownPages = known.pages || {};
  const knownSentences = known.sentences || {};

  let failures = 0;
  const fail = (msg) => {
    failures++;
    console.log(`  FAIL  ${msg}`);
  };
  const byKey = new Map(pages.map((p) => [p.key, p]));

  for (const p of pages) {
    const b = breaches(p);
    const entry = knownPages[p.key];
    if (!entry) {
      for (const x of b)
        fail(`/${p.key.replace(/^\//, '')}: ${x.value} ${RULE_WORDS[x.rule]}; the budget is ${x.budget}${x.rule.startsWith('run') && p.runStarts ? ` (the run starts "${p.runStarts}…")` : ''}. Shorten it or put the detail behind a <details>.`);
      continue;
    }
    if (!b.length) {
      fail(`/${p.key.replace(/^\//, '')} now passes every rule: take it off scripts/lib/text-walls-known.json, so the list only shrinks.`);
      continue;
    }
    // Listed: it may not get worse on anything. A measure that was inside the
    // budget when listed may grow up to the budget, and no further.
    for (const rule of Object.keys(RULE_WORDS)) {
      const now = get(p, rule);
      const was = get(entry, rule) ?? 0;
      const limit = Math.max(was, get(BUDGET, rule));
      if (now > limit) fail(`/${p.key.replace(/^\//, '')} got worse: ${now} ${RULE_WORDS[rule]}, listed at ${was} (budget ${get(BUDGET, rule)}).`);
    }
  }
  for (const key of Object.keys(knownPages))
    if (!byKey.has(key)) fail(`/${key.replace(/^\//, '')} is listed in scripts/lib/text-walls-known.json but was not built: take it off the list.`);

  for (const [s, n] of repeated) {
    const was = knownSentences[s];
    if (was === undefined) fail(`a ${s.split(' ').length}-word sentence is on ${n} pages (budget ${BUDGET.repeat.pages}): "${s.slice(0, 100)}…". Make it a component (a chip, a tooltip, a legend) or one linked page.`);
    else if (n > was) fail(`the sentence "${s.slice(0, 80)}…" spread from ${was} pages to ${n}.`);
  }
  for (const s of Object.keys(knownSentences))
    if (!repeated.has(s)) fail(`"${s.slice(0, 80)}…" is no longer on more than ${BUDGET.repeat.pages} pages: take it off scripts/lib/text-walls-known.json.`);

  const listed = Object.keys(knownPages).length;
  if (failures) {
    console.log(`\n${failures} text-wall failure${failures === 1 ? '' : 's'}. The fix is a shorter short answer or a new disclosure, not a higher number.\n`);
    process.exit(1);
  }
  console.log(`  ok    ${pages.length} pages measured; ${pages.length - listed} inside every budget, ${listed} listed and no worse (${Object.keys(knownSentences).length} listed repeated sentence${Object.keys(knownSentences).length === 1 ? '' : 's'}).\n`);
}
