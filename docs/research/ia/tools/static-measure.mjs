// Static metrics (default view, boilerplate, duplicates) over a folder of saved pages at ./live/pages/*.html
// (fetch them from sitemap.xml with curl first). Uses the repo's own scripts/lib/page-measure.mjs.
// Static text metrics for every live page, using the repo's own page-measure.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = 'D:/OneDrive - Ikast/OneDrive - Ikast-Brande Gymnasium/AI Projects/DK Uni Requirments/ib-pathways-europe';
const { defaultView, countWords } = await import(pathToFileURL(path.join(REPO, 'scripts/lib/page-measure.mjs')).href);
const DIR = path.join(import.meta.dirname, 'live/pages');

const strip = (h) => h.replace(/<(script|style|svg|noscript|template|nav)\b[\s\S]*?<\/\1>/gi, ' ');
const txt = (h) => h.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

// Break = anything that is not reading: a picture, a control, a card, a disclosure summary.
const BREAK = /<(img|picture|svg|canvas|input|select|textarea|button|summary|table|video|iframe|figure)\b|<a\b[^>]*class="[^"]*(card|tile|door|reel|cta|btn|button|chip|inst|prog|pill)[^"]*"|<(ul|ol)\b[^>]*class="[^"]*(cards|grid|tiles|reel|doors|list--inst|inst-list|prog-list|chips|glance)[^"]*"/i;

function runs(view) {
  // Tokenise into p-level blocks and breaks, in order.
  const re = /<(p|li|dd|blockquote|h[1-6])\b[^>]*>([\s\S]*?)<\/\1>|<(img|picture|svg|canvas|input|select|textarea|button|summary|table|video|iframe|figure)\b[^>]*>|<a\b[^>]*class="[^"]*(?:card|tile|door|reel|cta|btn|button|chip|pill)[^"]*"[^>]*>|<(?:ul|ol|div)\b[^>]*class="[^"]*(?:cards|grid|tiles|reel|doors|chips|glance|filters)[^"]*"[^>]*>/gi;
  let m, cur = { paras: 0, words: 0, first: '' }, best = { paras: 0, words: 0, first: '' }, bestW = { paras: 0, words: 0, first: '' };
  let firstBreakWords = null, words = 0;
  const flush = () => {
    if (cur.paras > best.paras || (cur.paras === best.paras && cur.words > best.words)) best = cur;
    if (cur.words > bestW.words) bestW = cur;
    cur = { paras: 0, words: 0, first: '' };
  };
  while ((m = re.exec(view))) {
    if (m[1]) {
      const tag = m[1].toLowerCase();
      const inner = m[2];
      if (BREAK.test(inner)) { flush(); if (firstBreakWords === null && words > 0) firstBreakWords = words; continue; }
      const n = countWords(inner);
      words += n;
      if (/^h/.test(tag)) { cur.words += n; continue; }
      if (n >= 15) { cur.paras++; cur.words += n; if (!cur.first) cur.first = txt(inner).slice(0, 90); }
      else if (n > 0 && tag === 'p') { cur.words += n; }
      else if (tag === 'li' && n < 15) { flush(); }
    } else {
      flush();
      if (firstBreakWords === null) firstBreakWords = words;
    }
  }
  flush();
  return { maxRunParas: best.paras, maxRunParasWords: best.words, maxRunFirst: best.first, maxRunWords: bestW.words, maxRunWordsFirst: bestW.first };
}

const rows = [];
const sentenceSeen = new Map();
for (const f of fs.readdirSync(DIR).filter((f) => f.endsWith('.html'))) {
  const h = fs.readFileSync(path.join(DIR, f), 'utf8');
  const main = h.match(/<main\b[^>]*>([\s\S]*)<\/main>/i)?.[1] ?? '';
  const total = countWords(strip(main));
  const view = defaultView(h);
  const def = countWords(view);
  const hidden = total - def;
  const r = runs(view);
  const title = h.match(/<title>([^<]*)/)?.[1] || '';
  const paras = [...strip(main).matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => txt(m[1])).filter((t) => t.split(' ').length >= 8);
  const sentences = new Set(paras.flatMap((p) => p.split(/(?<=[.!?])\s+(?=[A-Z])/)).filter((s) => s.split(' ').length >= 8));
  for (const s of sentences) {
    if (!sentenceSeen.has(s)) sentenceSeen.set(s, new Set());
    sentenceSeen.get(s).add(f);
  }
  // exact-duplicate paragraphs within one page
  const counts = new Map();
  for (const p of paras) counts.set(p, (counts.get(p) || 0) + 1);
  const dupWords = [...counts].filter(([, c]) => c > 1).reduce((a, [p, c]) => a + (c - 1) * p.split(' ').length, 0);
  // count <p> in default view with >= 15 words
  const longP = [...view.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].filter((m) => countWords(m[1]) >= 15).length;
  const longest = Math.max(0, ...[...view.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => countWords(m[1])));
  rows.push({ page: f.replace('.html', ''), title, total, def, hidden, longP, longest, dupWords, ...r });
}
// boilerplate: sentences on >= 5 pages
const boiler = [...sentenceSeen].filter(([, s]) => s.size >= 5).map(([t, s]) => ({ n: s.size, words: t.split(' ').length, t }));
boiler.sort((a, b) => b.n - a.n);
const perPageBoiler = {};
for (const b of boiler) for (const f of sentenceSeen.get(b.t)) perPageBoiler[f] = (perPageBoiler[f] || 0) + b.words;
for (const r of rows) r.boilerWords = perPageBoiler[r.page + '.html'] || 0;
fs.writeFileSync(path.join(import.meta.dirname, 'static-metrics.json'), JSON.stringify({ rows, boiler }, null, 1));
rows.sort((a, b) => b.def - a.def);
console.log('page'.padEnd(46), 'total', 'default', 'hidden', 'longP', 'longest', 'runP', 'runW', 'dupW', 'boilW');
for (const r of rows) console.log(r.page.padEnd(46), String(r.total).padStart(5), String(r.def).padStart(7), String(r.hidden).padStart(6), String(r.longP).padStart(5), String(r.longest).padStart(7), String(r.maxRunParas).padStart(4), String(r.maxRunWords).padStart(4), String(r.dupWords).padStart(4), String(r.boilerWords).padStart(5));
console.log('\nBOILERPLATE (sentences on >=5 pages):');
for (const b of boiler.slice(0, 40)) console.log(b.n, b.words, b.t.slice(0, 160));
