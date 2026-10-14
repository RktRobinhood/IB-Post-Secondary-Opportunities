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
 *   2. its slots are not a subsequence of the template's order (a slot may
 *      never move or be added), or
 *   3. it lacks one of its level's `required` sections, or shows them out of
 *      order — unless scripts/lib/template-gaps.json lists that page as
 *      waiting for that content (owner, 14 October 2026; see LEVELS).
 * And from the source: 4. no page module outside src/templates/ writes a
 * `data-template` or `data-slot`, so a second template cannot pose as the one.
 *
 * It self-tests its reader first, so a markup change cannot make it pass by
 * finding nothing. Built stage.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(ROOT, 'dist');

/**
 * Each level: which built pages belong to it, its slots in order, and the
 * sections every one of its pages must show (`required`: slots, and `#id`
 * for a section heading), in that order.
 *
 * The owner, 14 October 2026, after two Baltic programme pages looked like
 * two different designs: "the same program template for every single
 * program… the university template is the same for every university… if
 * we make changes, this will roll out to every single other one." One
 * template was not enough while sections vanished with their data; now a
 * mandatory section is always drawn, and a gap is filled, not hidden.
 * Pages still waiting for content are listed in scripts/lib/template-gaps.json
 * with what they lack; the list may only shrink.
 */
export const LEVELS = {
  country: {
    required: ['places', 'details', '#how', '#why', '#system', '#ib', '#apply', '#dates', '#language', '#money', '#living', '#sources'],
    slots: ['stats', 'places', 'details', 'pager'],
    pages: () => [
      'denmark',
      ...fs.readdirSync(path.join(DIST, 'destinations'), { withFileTypes: true })
        .filter((d) => d.isDirectory() && fs.existsSync(path.join(DIST, 'destinations', d.name, 'index.html')))
        .map((d) => `destinations/${d.name}`),
    ].filter((p) => !isRedirect(p)),
  },
  university: {
    required: ['glance', 'study', '#dates-title', '#programmes', 'details', '#ib', '#sources'],
    slots: ['glance', 'study', 'details', 'pager'],
    pages: () =>
      fs.readdirSync(path.join(DIST, 'universities'), { withFileTypes: true })
        .filter((d) => d.isDirectory() && fs.existsSync(path.join(DIST, 'universities', d.name, 'index.html')))
        .map((d) => `universities/${d.name}`)
        .filter((p) => !isRedirect(p)),
  },
  programme: {
    required: ['glance', 'detail', '#dates-title', '#what', '#requirements', '#selection', 'more'],
    slots: ['glance', 'before', 'detail', 'more', 'pager'],
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
  // Slots and section headings together, in page order: what `required` names.
  const marks = [...main[2].matchAll(/data-slot="([^"]+)"|<(?:h2\b|header class="section-head")[^>]*\bid="([^"]+)"/g)].map((m) => m[1] || `#${m[2]}`);
  return { template, slots, marks };
}

/** The required sections a page lacks, or shows out of order. */
export function missingSections(marks, required) {
  const present = [...new Set(marks.filter((m) => required.includes(m)))];
  const missing = required.filter((r) => !present.includes(r));
  const order = required.filter((r) => present.includes(r));
  return { missing, outOfOrder: present.join() !== order.join() };
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
  const req = ['glance', '#what', '#requirements'];
  if (missingSections(['glance', '#requirements'], req).missing.join() !== '#what') throw new Error('test-templates: a missing section was not seen');
  if (!missingSections(['glance', '#requirements', '#what'], req).outOfOrder) throw new Error('test-templates: a moved section was accepted');
  if (skeleton('<main data-template="programme"><section data-slot="detail"><h2 id="what">W</h2></section></main>').marks.join() !== 'detail,#what') throw new Error('test-templates: the reader cannot read section headings');
}

/* --- Built pages ---------------------------------------------------------- */
console.log('\nOne template per level (#55), the same sections on every page\n');
const GAPS_FILE = path.join(ROOT, 'scripts', 'lib', 'template-gaps.json');
const gaps = fs.existsSync(GAPS_FILE) ? JSON.parse(fs.readFileSync(GAPS_FILE, 'utf8')) : {};
const baseline = {};
for (const [level, { slots, required, pages }] of Object.entries(LEVELS)) {
  const list = pages();
  if (!list.length) fail(`${level}: no pages found — the reader is looking in the wrong place`);
  let ok = 0, whole = 0, waiting = 0;
  for (const p of list) {
    const k = skeleton(read(p));
    if (k.template !== level) { fail(`/${p}/: drawn by ${k.template ? `the "${k.template}" template` : 'no template'}, not the ${level} template`); continue; }
    if (!inOrder(k.slots, slots)) { fail(`/${p}/: slots ${k.slots.join(' → ')} are not in the ${level} template's order (${slots.join(' → ')})`); continue; }
    ok++;
    const { missing, outOfOrder } = missingSections(k.marks, required);
    if (outOfOrder) fail(`/${p}/: its sections are out of the ${level} order (${required.join(' → ')})`);
    if (missing.length) baseline[p] = missing;
    const listed = gaps[p] || [];
    const unlisted = missing.filter((m) => !listed.includes(m));
    if (unlisted.length) fail(`/${p}/: lacks ${unlisted.join(', ')} — every ${level} page shows ${required.join(', ')}; fill the section, never drop it`);
    else if (listed.length && listed.some((m) => !missing.includes(m))) fail(`/${p}/: now shows ${listed.filter((m) => !missing.includes(m)).join(', ')} — take it off scripts/lib/template-gaps.json`);
    if (!missing.length) whole++; else waiting++;
  }
  console.log(`  ${level}: ${ok} of ${list.length} pages from the one template; ${whole} with every section, ${waiting} listed as waiting for content`);
}
for (const p of Object.keys(gaps)) if (!fs.existsSync(path.join(DIST, p, 'index.html'))) fail(`scripts/lib/template-gaps.json lists /${p}/, which is not built`);
if (process.argv.includes('--baseline')) {
  fs.writeFileSync(GAPS_FILE, `${JSON.stringify(baseline, null, 1)}\n`);
  console.log(`  wrote ${Object.keys(baseline).length} pages to scripts/lib/template-gaps.json`);
  process.exit(0);
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
