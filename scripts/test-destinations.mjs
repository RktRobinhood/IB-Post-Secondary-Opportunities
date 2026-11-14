/**
 * Guards on whether an Institution or a Programme page can tell the truth about
 * where it is.
 *
 * Nothing about #30 looked like a failure from inside the build. Thirteen
 * Institutions loaded, thirteen pages were written, `npm run check` passed, and
 * the institution index was headed "Danish institutions" over Breda, Delft,
 * Maastricht, Twente and Erasmus Rotterdam. A heading is not decoration: a
 * student who reads "Danish institutions" and sees Maastricht decides the site
 * is broken, and a student who reads it and does not scroll decides there is
 * nothing outside Denmark to look at. Neither of them files a bug.
 *
 * So these tests are about the seam rather than about today's numbers.
 * Asserting "five Dutch Institutions" would pass until somebody researched a
 * sixth; asserting "every page's Destination crumb is its own record's
 * Destination" holds for a third Destination nobody has added yet, which is the
 * only version of this fix worth making — the copy it replaced was also correct
 * on the day it was written.
 *
 * The Danish half is half the test. A guard that only forbids "Danish" is
 * satisfied by a site that says nothing anywhere, and the Danish pages are the
 * ones most students will read.
 *
 * Modelled on scripts/test-images.mjs, which makes the same argument about
 * pictures: a rule that never refuses anything is not a rule.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { load } from '../src/lib/data.mjs';
import { schoolProgrammePage } from '../src/pages/school-programme.mjs';
import { universitiesIndex, schoolPage } from '../src/pages/schools.mjs';
import { isEnglishStudyOption } from '../src/lib/schools.mjs';
import { url, currentNav } from '../src/lib/layout.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');

let failures = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok    ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL  ${name}\n          ${e.message}`);
  }
};
const checkAsync = async (name, fn) => {
  try {
    await fn();
    console.log(`  ok    ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL  ${name}\n          ${e.message}`);
  }
};

console.log('\nDestination framing guards\n');

const site = await load();

/* --- Reading a rendered page back ------------------------------------------ */

/*
 * The assertions below are made against the HTML a student is served, not
 * against the arguments handed to the template. The whole fault was a template
 * that received a Dutch record and printed a Danish page, so anything that
 * stops short of the rendered output is testing the wrong end of it.
 */
const between = (html, re) => (html.match(re) || [])[1] || '';
const titleOf = (html) => between(html, /<title>([\s\S]*?)<\/title>/);
const descriptionOf = (html) => between(html, /<meta name="description" content="([\s\S]*?)">/);
const headingOf = (html) => between(html, /<h1[^>]*>([\s\S]*?)<\/h1>/).replace(/<[^>]+>/g, '').trim();
/*
 * The deploy builds under the GitHub Pages project path (SITE_BASE), so every
 * rendered href carries it. The assertions name site paths, so the prefix comes
 * off before comparing; without this the guards pass locally and fail in CI.
 */
const base = url('/').slice(0, -1);
const sitePath = (href) => (base && href.startsWith(base) ? href.slice(base.length) : href);
/** The breadcrumb trail only — the masthead links to every section on every page. */
const crumbHrefs = (html) => {
  const trail = between(html, /<nav aria-label="Breadcrumb">([\s\S]*?)<\/nav>/);
  // A crumb may land on the country page's list of institutions (#institutions);
  // it still goes through that country.
  return [...trail.matchAll(/href="([^"]*)"/g)].map((m) => sitePath(m[1]).split('#')[0]);
};
/** Which top-level navigation item the page claims to be inside. */
const sectionOf = (html) => sitePath(between(html, /<a href="([^"]*)" aria-current="page"/));

const countryOf = (inst) => site.destinations.find((c) => c.code === inst.destination?.code);
const schoolOf = (inst) => countryOf(inst)?.institutions.find((i) => i.id === inst.id || i.key === inst.id) || inst;
const renderUniversity = (inst) => schoolPage(site, schoolOf(inst), countryOf(inst), { prev: null, next: null });
const renderProgramme = (inst, p) => {
  const school = schoolOf(inst);
  const record = school.school?.programmes.find((x) => x.opportunityId === p.id || x.id === p.id || x.href === p.href) || p;
  return schoolProgrammePage(site, school, countryOf(inst), record);
};

const institutions = site.institutionCatalogue.all;
const publicInstitutions = institutions.filter((i) => isEnglishStudyOption(i) || i.school?.publicPage);
const danish = site.dkInstitutions;

/* Every rendered institution reads its country from the school record. */
check('every institution carries the country facts a breadcrumb and sentence need', () => {
  for (const inst of institutions) {
    for (const field of ['code', 'name', 'sentenceName', 'href', 'section']) {
      assert.ok(inst.destination?.[field], `${inst.id}'s country has no ${field}`);
    }
    assert.ok(countryOf(inst), `${inst.id} has no country page`);
    assert.ok(schoolOf(inst).school, `${inst.id} has no school record for the common adapter`);
  }
});
check('country articles remain part of sentences rather than breadcrumb labels', () => {
  const nl = institutions.find((i) => i.destination.code === 'nl');
  assert.equal(nl.destination.sentenceName, 'the Netherlands');
  assert.equal(nl.destination.name, 'Netherlands');
});

/* --- A Denmark-only interface is genuinely Denmark-only -------------------- */

check('dkInstitutions holds only Danish Institutions', () => {
  const strays = danish.filter((i) => i.destination?.code !== 'dk').map((i) => i.id);
  assert.deepEqual(strays, [], `these are not Danish and are being handed to Denmark's pages: ${strays.join(', ')}`);
  assert.ok(danish.length > 0, 'expected Denmark to have Institutions');
});

check('the catalogue holds more than Denmark', () => {
  assert.ok(
    institutions.length > danish.length,
    'expected the catalogue to hold Institutions outside Denmark — this test is meaningless otherwise'
  );
});

check('asking for a Destination we hold nothing for returns nothing', () => {
  // Not "everything". A caller that asks about a Destination is making a claim
  // about that Destination, and handing it Denmark's list is how the bug this
  // file exists for got written in the first place.
  assert.deepEqual(site.institutionCatalogue.in('zz'), []);
});

check('every Institution is in exactly one Destination group', () => {
  const grouped = site.institutionCatalogue.byDestination.flatMap((d) => d.institutions);
  assert.equal(grouped.length, institutions.length, 'grouping lost or duplicated an Institution');
  assert.equal(new Set(grouped.map((i) => i.id)).size, institutions.length);
});

check('no Institution page anywhere borrows another Destination\'s framing', () => {
  // The general form, so a third Destination cannot reintroduce this.
  for (const inst of institutions) {
    const html = renderUniversity(inst);
    const hubs = crumbHrefs(html).filter((h) => h === '/denmark/' || h.startsWith('/destinations/'));
    assert.deepEqual(
      hubs,
      [inst.destination.href],
      `${inst.id} is in ${inst.destination.code} and its breadcrumb goes through ${hubs.join(', ') || 'nowhere'}`
    );
    assert.equal(sectionOf(html), currentNav('/countries/'), `${inst.id} is in the wrong navigation section`);
  }
});

check('no Programme page anywhere borrows another Destination\'s framing', () => {
  for (const inst of institutions) {
    for (const p of inst.programmes) {
      const html = renderProgramme(inst, p);
      const hubs = crumbHrefs(html).filter((h) => h === '/denmark/' || h.startsWith('/destinations/'));
      assert.deepEqual(hubs, [p.destination?.href || inst.destination.href], `${p.id} sits under ${hubs.join(', ') || 'nowhere'}`);
    }
  }
});

check('every programme names the application portal in its recorded route', () => {
  for (const inst of institutions) {
    for (const p of inst.programmes) {
      const intake = site.graph.opportunities.get(p.opportunityId || p.id);
      const route = site.graph.applicationRoutes.get(intake?.applicationRoutes?.[0]);
      if (!route?.portalUrl) continue;
      const html = renderProgramme(inst, p);
      assert.ok(html.includes(route.portalUrl.replace(/&/g, '&amp;')), `${p.id} lost its recorded application portal ${route.portalUrl}`);
    }
  }
});

/* --- and a Danish page still reads as Danish ------------------------------- */

check('a Danish Institution page still sits under Denmark', () => {
  const inst = institutions.find((i) => i.id === 'dk-au');
  assert.ok(inst, 'expected dk-au in the catalogue');
  const html = renderUniversity(inst);
  assert.ok(crumbHrefs(html).includes('/denmark/'), 'a Danish institution lost its Denmark breadcrumb');
  // Every place is under Countries in the menu; the breadcrumb is what keeps it Danish.
  assert.equal(sectionOf(html), '/countries/');
  assert.ok(/Denmark/.test(html), 'the page does not mention Denmark at all');
});

check('a Danish Programme page still names the Danish machinery', () => {
  const inst = institutions.find((i) => i.id === 'dk-au');
  const p = inst.programmes.find((x) => x.cutoff?.value);
  assert.ok(p, 'expected at least one Danish Opportunity with a published cut-off');
  const html = renderProgramme(inst, p);
  assert.ok(crumbHrefs(html).includes('/denmark/'), 'a Danish programme lost its Denmark breadcrumb');
  // Quota 1 and the Danish 7-point scale are Danish national mechanisms, not
  // framing. Generalising them away would be the opposite mistake: the figure
  // means nothing without the competition it came out of and the scale it is
  // on, and both are on the record.
  assert.ok(/quota 1/i.test(html), 'the quota the cut-off came out of is no longer named');
  assert.ok(/7-point/.test(html), 'the scale the cut-off is measured on is no longer named');
  assert.ok(/optagelse\.dk/.test(html), 'a Danish applicant is no longer told where to apply');
});

/* --- The index, which holds two Destinations and must say so --------------- */

check('the institution index does not present itself as one Destination\'s', () => {
  const html = universitiesIndex(site);
  assert.ok(!/Danish institutions/i.test(html), 'it is still headed "Danish institutions"');
  assert.ok(!crumbHrefs(html).includes('/denmark/'), 'it still sits under Denmark');
  assert.equal(sectionOf(html), '', 'it claims a navigation section while spanning Destinations');
});

check('the institution index names every Destination it actually holds', () => {
  const html = universitiesIndex(site);
  /* In its headings, not merely somewhere on the page. An institution's own
     `about` text mentions its country, so a page that checked the whole of
     itself would have passed while headed "Danish institutions". */
  const headings = [...html.matchAll(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/g)]
    .map((m) => m[1].replace(/<[^>]+>/g, ''))
    .join(' | ');
  const publicDestinations = site.institutionCatalogue.byDestination.filter((d) => d.institutions.some((i) => isEnglishStudyOption(i) || i.school?.publicPage));
  for (const d of publicDestinations) {
    assert.ok(
      headings.includes(d.sentenceName) || descriptionOf(html).includes(d.sentenceName),
      `the index lists ${d.code} Institutions without saying so in a heading: ${headings}`
    );
  }
  // Derived rather than asserted: the wording must move with the data.
  assert.equal(
    [...html.matchAll(/<details class="topic__more"><summary>/g)].length,
    publicDestinations.length,
    'the index groups a different number of countries from the public catalogue'
  );
});

check('every public institution reaches the index', () => {
  const html = universitiesIndex(site);
  const missing = publicInstitutions.filter((i) => !html.includes(i.href)).map((i) => i.id);
  assert.deepEqual(missing, [], `these Institutions are built but unreachable from the index: ${missing.join(', ')}`);
});

check('internal records with no English provision have no links on the index', () => {
  const html = universitiesIndex(site);
  const leaked = institutions.filter((i) => !isEnglishStudyOption(i) && !i.school?.publicPage && html.includes(i.href)).map((i) => i.id);
  assert.deepEqual(leaked, [], `internal records reach the index: ${leaked.join(', ')}`);
});

/* --- and the framing may not be written back in ---------------------------- */

await checkAsync('the institution and Programme templates hard-code no Destination', async () => {
  /*
   * Shared adapters must not write a country route into layout. A literal
   * country hub href rather than a recorded href recreates the old bug: before this guard existed the file carried
   * `section: '/denmark/'` three times and `{ href: '/denmark/', label:
   * 'Denmark' }` three more, on the institution index, the institution page and
   * the Programme page.
   */
  // One module per page family since the split; every one of these renders
  // whatever Destination it is handed.
  const modules = [
    'src/pages/schools.mjs',
    'src/pages/school-programme.mjs',
    'src/pages/programme-facts.mjs',
    'src/pages/explorer.mjs',
    'src/pages/planner.mjs',
    'src/pages/timeline.mjs',
    // The Countries page and the home page hold every Destination, so they may name none.
    'src/pages/destinations.mjs',
    'src/pages/home.mjs',
  ];
  for (const rel of modules) {
    const text = await fs.readFile(path.join(ROOT, rel), 'utf8');
    const code = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    const suspects = [
      ...code.matchAll(/section:\s*['"][^'"]+['"]/g),
      ...code.matchAll(/\{\s*href:\s*['"]\/(?:denmark|destinations)\/[^'"]*['"]/g),
    ]
      .map((m) => m[0])
      // The Programme explorer, the subject checker and the calendar are their
      // own top-level navigation items and are nobody's Destination; so is
      // "Find a degree", which since the home page became the discovery
      // surface is the home page's own #discover.
      .filter((s) => !/^section:\s*['"]\/((programmes|planner|timeline|prepare|countries)\/|#discover)['"]$/.test(s));
    assert.deepEqual(
      suspects,
      [],
      `${rel} is writing a Destination into a page rather than reading it off the record:\n          ${suspects.join('\n          ')}`
    );
  }
});

console.log(failures ? `\n${failures} failing\n` : '\nAll destination guards pass\n');
process.exit(failures ? 1 : 0);
