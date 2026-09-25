/**
 * Every institution has its own page, and nothing hands a student to a homepage.
 *
 * Issue #43: an institution card on a country page linked straight to the
 * university's homepage and left the student to find the English-taught
 * degrees on a foreign site. This reads the built site back and holds:
 *
 *   1. every institution in data/countries/ has a page under /universities/;
 *   2. every institution card on a country page links to a page on this site;
 *   3. no link on a school page that leaves the site is a homepage;
 *   4. a school record listing programmes renders one card per programme.
 *
 * Nothing here names a country. Run after a build: node scripts/test-school-pages.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { schoolKeys, loadSchools, isHomepage } from '../src/lib/schools.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(ROOT, 'dist');
const BASE = (process.env.SITE_BASE || '').replace(/\/$/, '');

const failures = [];
const fail = (m) => failures.push(m);
const read = (p) => {
  const f = path.join(DIST, p, 'index.html');
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
};

/* Self-test: the homepage rule must catch a homepage and pass a targeted page. */
if (!isHomepage('https://www.helsinki.fi/en', null) || isHomepage('https://www.helsinki.fi/en/admissions', null)) {
  console.log('  FAIL  self-test: isHomepage cannot tell a homepage from a targeted page');
  process.exit(1);
}
console.log('  ok    self-test: a homepage is caught, a targeted page passes');

const known = schoolKeys(path.join(ROOT, 'data', 'countries'));
const records = loadSchools(path.join(ROOT, 'data', 'schools'));
const countries = fs
  .readdirSync(path.join(ROOT, 'data', 'countries'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'countries', f), 'utf8')));

let pages = 0;
let cards = 0;
for (const c of countries) {
  const countryPage = read(`destinations/${c.code}`);
  if (!countryPage) {
    fail(`/destinations/${c.code}/ was not built`);
    continue;
  }
  // The institution cards sit in the #institutions section, before the map.
  const section = countryPage.split('id="institutions"')[1]?.split('class="world')[0] || '';
  for (const m of section.matchAll(/<h3 class="card__title"><a href="([^"]+)"/g)) {
    cards++;
    if (/^(https?:)?\/\//.test(m[1])) fail(`/destinations/${c.code}/: an institution card leaves the site (${m[1]})`);
  }
}

for (const [key, inst] of known) {
  const html = read(`universities/${key}`);
  if (!html) {
    // A profile institution with a canonical twin is served by the canonical page.
    const twin = [...fs.readdirSync(path.join(ROOT, 'data', 'institutions'))].some((f) => {
      const r = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'institutions', f), 'utf8'));
      return (r.links?.website || '').replace(/^https?:\/\/(www\.)?/, '').split('/')[0] ===
        (inst.website || '').replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    });
    if (!twin) fail(`/universities/${key}/ was not built`);
    continue;
  }
  pages++;
  const main = html.split('<main')[1]?.split('</main>')[0] || '';
  for (const m of main.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
    const link = m[1].replace(/&amp;/g, '&');
    if (isHomepage(link, inst.website)) fail(`/universities/${key}/ hands the student to a homepage: ${link}`);
  }
  const rec = records.get(key);
  if (rec?.scope === 'listed') {
    const shown = (main.split('id="programmes"')[1] || '').match(/class="card card--link/g)?.length || 0;
    if (shown !== rec.programmes.length) fail(`/universities/${key}/ shows ${shown} programme cards; its record lists ${rec.programmes.length}`);
  }
}

if (!cards) fail('no institution cards found on any country page — has the markup changed?');

if (failures.length) {
  for (const f of failures.slice(0, 40)) console.log(`  FAIL  ${f}`);
  if (failures.length > 40) console.log(`  … and ${failures.length - 40} more`);
  process.exit(1);
}
console.log(`  ok    ${pages} school pages, ${cards} institution cards on country pages; none hands a student to a homepage`);
void BASE;
