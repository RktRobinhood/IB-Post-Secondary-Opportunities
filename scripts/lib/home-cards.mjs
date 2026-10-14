/**
 * Every card of the home page's discovery surface, as markup a guard can read.
 *
 * Since 14 October 2026 the home page carries only its first cards; the rest
 * are files beside it (dist/discover/cards-<k>.json, written by src/build.mjs
 * from src/pages/discover.mjs) that discover.js fetches as the student
 * scrolls or chooses. A guard that read "every card on the home page" from
 * the page alone would now see a dozen. This returns the rest, each wrapped
 * as the page wraps its own, to be appended to the page's markup.
 */
import fs from 'node:fs';
import path from 'node:path';

export function homeChunkCards(dist) {
  const dir = path.join(dist, 'discover');
  if (!fs.existsSync(dir)) return '';
  const files = fs.readdirSync(dir)
    .map((f) => /^cards-(\d+)\.json$/.exec(f))
    .filter(Boolean)
    .sort((a, b) => Number(a[1]) - Number(b[1]))
    .map((m) => m[0]);
  const cards = files.flatMap((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  return cards.map((markup, n) => `<li class="discover__card" data-card="${n}">${markup}</li>`).join('\n');
}

/** Every card's facts, as discover.js filters them (dist/discover/index.json). */
export function homeIndex(dist) {
  const file = path.join(dist, 'discover', 'index.json');
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
}
