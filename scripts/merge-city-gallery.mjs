/**
 * Fold the study-city photographs into the country galleries.
 *
 *   node scripts/merge-city-gallery.mjs [--dry]
 *
 * The owner, 14 October 2026: a country's carousel should show "the areas of
 * the country where there are universities… each city or region represented
 * as well as some touristy stuff". Researchers record one photograph per
 * study city in docs/research/country-gallery/cities/batch-*.jsonl (brief:
 * BRIEF.md there). This rewrites docs/research/country-gallery/picks.jsonl so
 * that, for every country with city lines:
 *
 *   - the hero line (`primary`) stays first;
 *   - the city photographs follow, in the order researched (at most CITIES);
 *   - then the earlier gallery's photographs, as the country beyond its
 *     study cities, until the carousel is full (COUNTRY_SLIDES, hero
 *     included), always keeping at least one when there was one.
 *
 * Countries without city lines are left as they are. Run
 * `node scripts/import-country-gallery.mjs` afterwards to fetch and store.
 */
import fs from 'node:fs';
import path from 'node:path';
import { COUNTRY_SLIDES } from '../src/pages/destinations.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIR = path.join(ROOT, 'docs', 'research', 'country-gallery');
const PICKS = path.join(DIR, 'picks.jsonl');
const DRY = process.argv.includes('--dry');
const CITIES = COUNTRY_SLIDES - 2;

const read = (f) => fs.readFileSync(f, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
const picks = read(PICKS);
const cityLines = fs.readdirSync(path.join(DIR, 'cities'))
  .filter((f) => /^batch-[a-z]\.jsonl$/.test(f)).sort()
  .flatMap((f) => read(path.join(DIR, 'cities', f)))
  .filter((l) => l.country && l.commonsFile && !l.none);

const onSite = Object.values(JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'images.json'), 'utf8'))).map((r) => r?.file).filter(Boolean);
const countries = [...new Set([...picks.map((p) => p.country), ...cityLines.map((l) => l.country)])];
const out = [];
const report = [];
for (const cc of countries) {
  const mine = picks.filter((p) => p.country === cc);
  const cities = cityLines.filter((l) => l.country === cc);
  if (!cities.length) { out.push(...mine); continue; }
  const hero = mine.filter((p) => p.primary);
  // No photograph twice on the site: not the hero, not any page's own photo.
  const seen = new Set([...hero.map((p) => p.commonsFile), ...onSite]);
  const take = (list, n) => {
    const got = [];
    for (const p of list) {
      if (got.length >= n || seen.has(p.commonsFile)) continue;
      seen.add(p.commonsFile);
      got.push(p);
    }
    return got;
  };
  const before = mine.filter((p) => !p.primary);
  const room = COUNTRY_SLIDES - 1;
  const city = take(cities.map(({ none, tried, ...l }) => ({ ...l, theme: 'city' })), Math.min(CITIES, room - (before.length ? 1 : 0)));
  const rest = take(before, room - city.length);
  out.push(...hero, ...city, ...rest);
  report.push(`${cc}: ${city.length} study cities + ${rest.length} more (was ${before.length})`);
}

if (!DRY) fs.writeFileSync(PICKS, out.map((l) => JSON.stringify(l)).join('\n') + '\n');
console.log(report.join('\n'));
console.log(`${out.length} lines${DRY ? ' (dry run)' : ''}`);
