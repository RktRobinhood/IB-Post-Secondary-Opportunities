/**
 * Every page at a level is drawn by that level's one template (#55).
 *
 * The owner, 29 September 2026: the site has three levels — country,
 * university, programme — and "they should all be the same": every country
 * page one template with different pictures and universities, every
 * university page one template, every programme page one template, and a
 * section with nothing in it simply not shown. Two renderers per level
 * (Danish records and country school records) had drifted into two designs,
 * fixed one difference at a time.
 *
 * So each level has one template in src/templates/, which marks the page it
 * draws (`<main data-template="…">`) and each slot it fills (`data-slot`).
 * This reads every built page at each level back and fails when:
 *   1. a page at that level was not drawn by its template, or
 *   2. its slots are not a subsequence of the template's order (a slot may be
 *      missing because it had no data; it may never move or be added).
 * And from the source: 3. no page module outside src/templates/ writes a
 * `data-template` or `data-slot`, so a second template cannot pose as the one.
 *
 * It self-tests its reader first, so a markup change cannot make it pass by
 * finding nothing. Built stage.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(ROOT, 'dist');

/** Each level: which built pages belong to it, and its slots in order. */
export const LEVELS = {
  country: {
    slots: ['stats', 'places', 'details', 'pager'],
    pages: () => [
      'denmark',
      ...fs.readdirSync(path.join(DIST, 'destinations'), { withFileTypes: true })
        .filter((d) => d.isDirectory() && fs.existsSync(path.join(DIST, 'destinations', d.name, 'index.html')))
        .map((d) => `destinations/${d.name}`),
    ].filter((p) => !isRedirect(p)),
  },
  university: {
    slots: ['glance', 'study', 'details', 'pager'],
    pages: () =>
      fs.readdirSync(path.join(DIST, 'universities'), { withFileTypes: true })
        .filter((d) => d.isDirectory() && fs.existsSync(path.join(DIST, 'universities', d.name, 'index.html')))
        .map((d) => `universities/${d.name}`)
        .filter((p) => !isRedirect(p)),
  },
  programme: {
    slots: ['glance', 'before', 'detail', 'pager'],
    pages: () => {
      const out = [];
      const dir = (d) => fs.readdirSync(path.join(DIST, d), { withFileTypes: true }).filter((x) => x.isDirectory());
      // Canonical programmes live under /programmes/<id>/; school-record
      // programmes under /universities/<school>/<programme>/.
      for (const x of dir('programmes')) if (fs.existsSync(path.join(DIST, 'programmes', x.name, 'index.html'))) out.push(`programmes/${x.name}`);
      for (const u of dir('universities'))
        for (const x of dir(`universities/${u.name}`))
          if (fs.existsSync(path.join(DIST, 'universities', u.name, x.name, 'index.html'))) out.push(`universities/${u.name}/${x.name}`);
      return out.filter((p) => !isRedirect(p));
    },
  },
};

const failures = [];
const fail = (m) => failures.push(m);
const read = (p) => fs.readFileSync(path.join(DIST, p, 'index.html'), 'utf8');
const isRedirect = (p) => /http-equiv="refresh"/i.test(read(p));

/** The template that drew a page, and the slots it filled, in page order. */
export function skeleton(html) {
  const main = html.match(/<main\b([^>]*)>([\s\S]*?)<\/main>/);
  if (!main) return { template: null, slots: [] };
  const template = main[1].match(/data-template="([^"]+)"/)?.[1] || null;
  const slots = [...main[2].matchAll(/data-slot="([^"]+)"/g)].map((m) => m[1]);
  return { template, slots };
}

/** Is `got` the template's order with some slots left out? */
export function inOrder(got, order) {
  let at = -1;
  for (const s of got) {
    const i = order.indexOf(s);
    if (i < 0 || i <= at) return false;
    at = i;
  }
  return true;
}

/* --- Self-test ------------------------------------------------------------ */
{
  const page = '<main id="main" data-template="university"><section data-slot="glance"></section><section data-slot="study"></section></main>';
  const k = skeleton(page);
  if (k.template !== 'university' || k.slots.join() !== 'glance,study') throw new Error('test-templates: the reader cannot read a skeleton');
  if (!inOrder(['glance', 'details'], LEVELS.university.slots)) throw new Error('test-templates: a missing slot was refused');
  if (inOrder(['study', 'glance'], LEVELS.university.slots)) throw new Error('test-templates: a moved slot was accepted');
  if (inOrder(['glance', 'extra'], LEVELS.university.slots)) throw new Error('test-templates: an unknown slot was accepted');
}

/* --- Built pages ---------------------------------------------------------- */
console.log('\nOne template per level (#55)\n');
for (const [level, { slots, pages }] of Object.entries(LEVELS)) {
  const list = pages();
  if (!list.length) fail(`${level}: no pages found — the reader is looking in the wrong place`);
  let ok = 0;
  for (const p of list) {
    const k = skeleton(read(p));
    if (k.template !== level) fail(`/${p}/: drawn by ${k.template ? `the "${k.template}" template` : 'no template'}, not the ${level} template`);
    else if (!inOrder(k.slots, slots)) fail(`/${p}/: slots ${k.slots.join(' → ')} are not in the ${level} template's order (${slots.join(' → ')})`);
    else ok++;
  }
  console.log(`  ${level}: ${ok} of ${list.length} pages from the one template`);
}

/* --- Source --------------------------------------------------------------- */
const pagesDir = path.join(ROOT, 'src', 'pages');
for (const f of fs.readdirSync(pagesDir)) {
  const src = fs.readFileSync(path.join(pagesDir, f), 'utf8');
  // Only a level's own names count: other pages use data-template for their
  // own client-side <template>s.
  const levels = Object.keys(LEVELS).join('|');
  const slotNames = [...new Set(Object.values(LEVELS).flatMap((l) => l.slots))].join('|');
  if (new RegExp(`data-template="(${levels})"|data-slot="(${slotNames})"`).test(src))
    fail(`src/pages/${f}: writes a level template's marks; only src/templates/ may`);
}

if (failures.length) {
  console.error(`\n  ✗ ${failures.length} problem(s):`);
  for (const m of failures.slice(0, 40)) console.error(`    · ${m}`);
  process.exit(1);
}
console.log('\n  ✓ every page at each level comes from its one template\n');
