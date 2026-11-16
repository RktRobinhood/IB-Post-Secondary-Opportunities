/**
 * Builds the site into dist/.
 *
 *   node src/build.mjs                     # build for local preview (links from /)
 *   SITE_BASE=/ib-pathways node src/build.mjs   # build for a GitHub Pages project site
 *
 * There is no bundler and there are no dependencies. Data goes in, HTML comes out.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { load, validate } from './lib/data.mjs';
import { setBase, setGuides, setRevision, setScope, setFeedback, setPlaces, redirectPage, url, SITE } from './lib/layout.mjs';
import { home } from './pages/home.mjs';
import { countriesIndex, distanceDoors, destination, placeTiles, countryPicture } from './pages/destinations.mjs';
import { compare } from './pages/compare.mjs';
import { countryGuide } from './pages/country-guides.mjs';
import { universitiesIndex, schoolPage, schoolCards } from './pages/schools.mjs';
import { displayName, isEnglishStudyOption } from './lib/schools.mjs';
import { schoolProgrammePage } from './pages/school-programme.mjs';
import { planner } from './pages/planner.mjs';
import { courseResultsGuide } from './pages/course-results.mjs';
import { timeline } from './pages/timeline.mjs';
import * as meta from './pages/meta.mjs';
import { counsellors } from './pages/counsellors.mjs';
import { prepare } from './pages/prepare.mjs';
import { trust } from './pages/trust.mjs';
import { slugify } from './lib/html.mjs';
import { motionCss } from './lib/motion.mjs';
import { execFileSync } from 'node:child_process';
import { destinationFacet } from './lib/records.mjs';
import { continentOf } from './lib/continents.mjs';
import { buildBaseline, schoolBuildBaseline } from '../scripts/lib/check-scope.mjs';


/** The commit the data came from, so an export can be traced back to a diff. */
function dataRevision() {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT }).toString().trim();
  } catch {
    return 'unversioned';
  }
}

const ROOT = path.resolve(import.meta.dirname, '..');
/* DIST_DIR builds somewhere other than dist/ — for an agent that needs a
   build nobody else will wipe while it is being looked at (PARALLEL_WORK.md). */
const DIST = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(ROOT, 'dist');
const ASSETS = path.join(ROOT, 'src', 'assets');

const BASE = (process.env.SITE_BASE || '').replace(/\/$/, '');
setBase(BASE);
const schoolArg = process.argv.indexOf('--school');
const schoolKey = schoolArg === -1 ? null : process.argv[schoolArg + 1];
if (schoolArg !== -1 && !/^[a-z][a-z0-9-]*$/.test(schoolKey || '')) throw new Error('--school needs a school key');

// Recursive removals stay in the generated output, inside this checkout.
const relativeDist = path.relative(ROOT, DIST);
if (!relativeDist || relativeDist.startsWith('..') || path.isAbsolute(relativeDist) ||
    /^(?:src|data|docs|schemas|scripts|node_modules|\.git)(?:[\\/]|$)/.test(relativeDist)) {
  throw new Error('DIST_DIR must name a generated-output directory inside the checkout');
}

const written = [];

async function write(routePath, contents) {
  const file =
    routePath.endsWith('.html') || routePath.endsWith('.xml') || routePath.endsWith('.txt')
      ? path.join(DIST, routePath)
      : path.join(DIST, routePath, 'index.html');
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, contents);
  written.push({ route: routePath, bytes: Buffer.byteLength(contents), moved: /http-equiv="refresh"/.test(contents) });
}

async function copyDir(from, to) {
  await fs.mkdir(to, { recursive: true });
  for (const entry of await fs.readdir(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) await copyDir(src, dst);
    else await fs.copyFile(src, dst);
  }
}

/* --- Extra files ----------------------------------------------------------- */

function sitemap(routes, origin) {
  const urls = routes
    .filter((r) => !r.endsWith('.html') && !r.endsWith('.xml') && !r.endsWith('.txt'))
    .map((r) => `  <url><loc>${origin}${BASE}${r}</loc></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function favicon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#0F302C"/>
  <path d="M16 5.5 20.4 16 16 26.5 11.6 16z" fill="#FBF7F0"/>
  <path d="M16 5.5 11.6 16 16 26.5z" fill="#C99A45"/>
</svg>
`;
}

/**
 * A public export of the whole dataset.
 *
 * The structured data is a product in its own right, so it ships with the
 * provenance a reader needs to judge it: which schema shaped it, which commit
 * produced it, which intake it describes, and how much of it is actually
 * verified rather than merely present.
 */
function dataDump(site) {
  // Runtime indexes add references for the checker; export the authoring shape.
  const facts = (value) => Array.isArray(value) ? value.map(facts) : value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).filter(([key]) => !['meta','evidence','key'].includes(key)).map(([key,v]) => [key,facts(v)])) : value;
  const g = site.graph;
  return JSON.stringify({
    schemaVersion: '2.0', dataRevision: dataRevision(), generatedAt: new Date().toISOString(),
    targetIntake: SITE.cycle.intake,
    licence: 'CC BY 4.0. Photographs carry their own terms — see /credits/.',
    disclaimer: 'Admission rules change every year. Confirm anything consequential with the institution before acting on it.',
    recordCounts: { countries: site.countries.length, schools: site.schools.size, programmes: g.programmes.size, intakes: g.opportunities.size, sources: g.evidence.size },
    schools: Object.fromEntries([...site.schools].map(([key,value]) => [key,facts(value)])),
    countries: [...g.destinations.values()].map(facts),
    places: [...g.places.values()].map(facts),
    recognitionSchemes: site.recognitionSchemes.map(facts), fundingSchemes: site.fundingSchemes.map(facts),
    conversion: facts(site.conversion), countryGuides: facts(site.countryGuides),
  }, null, 2);
}

/* --- Build ----------------------------------------------------------------- */

async function main() {
  const t0 = Date.now();
  console.log(`\n${SITE.name} — building${BASE ? ` for base "${BASE}"` : ''}\n`);

  if (!schoolKey) await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(DIST, { recursive: true });

  const marker = path.join(DIST, '.build-info.json');
  let baseline;
  if (schoolKey) {
    let previous;
    try { previous = JSON.parse(await fs.readFile(marker, 'utf8')); } catch { previous = null; }
    baseline = await schoolBuildBaseline({ root: ROOT, baseline: previous, key: schoolKey });
    // An interrupted rebuild must never leave a trusted marker behind.
    await fs.rm(marker, { force: true });
  } else baseline = await buildBaseline({ root: ROOT });
  const site = await load();
  console.log(
    `  data: ${site.countries.length} countries · ${site.institutionCatalogue.all.length} institutions · ` +
      `${site.programmes.length} programmes · ${Object.keys(site.images).length + Object.keys(site.programmeImages).length} stored photos`
  );

  setRevision(dataRevision());

  setGuides(
    site.topicList.map((t) => ({
      href: `/guides/${slugify(t.slug || t.title || 'guide')}/`,
      label: t.navLabel || t.title,
    }))
  );

  /* What the Opportunity-backed tools cover, so the navigation cannot claim a
     scope the records do not support. */
  setScope(site.opportunityScope);
  setFeedback(site.config?.feedback);
  /* The three ways into Countries, named once, for the menu and the footer. */
  setPlaces(distanceDoors(site).map((d) => ({ href: d.href, label: d.label })));

  console.log('  sources: ' + site.graph.evidence.size + ' cited source references with checked dates');

  const problems = validate(site);
  const errors = problems.filter((p) => p.level === 'error');
  const warns = problems.filter((p) => p.level === 'warn');
  if (errors.length) {
    console.log('\n  errors:');
    for (const p of errors) console.log(`    ✗ ${p.where}: ${p.what}`);
  }
  if (warns.length) {
    console.log(`\n  ${warns.length} warnings (first 12):`);
    for (const p of warns.slice(0, 12)) console.log(`    · ${p.where}: ${p.what}`);
  }
  console.log('');

  // The quick gate refreshes only this institution. Shared indexes and exports
  // are deliberately left to the full build used for publishing.
  if (schoolKey) {
    const target = path.resolve(DIST, 'universities', schoolKey);
    if (!target.startsWith(DIST + path.sep)) throw new Error('School output escapes DIST_DIR');
    await fs.rm(target, { recursive: true, force: true });
  }

  /* Core */
  if (!schoolKey) {
  await write('/', home(site));
  /* The home page's other cards and every card's facts, fetched as the
     student explores (src/pages/discover.mjs, discover.js). */
  if (site.discoverFiles) {
    const dir = path.join(DIST, 'discover');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, 'index.json'), JSON.stringify(site.discoverFiles.index));
    for (const [k, list] of site.discoverFiles.chunks.entries()) await fs.writeFile(path.join(dir, `cards-${k}.json`), JSON.stringify(list));
  }
  await write('/countries/', countriesIndex(site));
  /* Europe and Worldwide were two pages from one template; they are the two
     halves of /countries/ now. The old addresses keep working (redirectPage:
     the query and anchor survive, Back skips the stub) and stay out of the
     sitemap. */
  await write('/europe/', redirectPage('/countries/#europe', 'Countries'));
  await write('/world/', redirectPage('/countries/#worldwide', 'Countries'));
  await write('/compare/', compare(site));

  /* Destinations, with prev/next within their own scope */
  for (const scope of ['europe', 'worldwide']) {
    const list = site.countries
      .filter((c) => c.scope === scope)
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const [i, c] of list.entries()) {
      const prev = list[i - 1] ? { href: list[i - 1].href, label: list[i - 1].name } : null;
      const next = list[i + 1] ? { href: list[i + 1].href, label: list[i + 1].name } : null;
      await write(c.href, destination(site, c, { prev, next }));
      for (const guide of c.guideContent?.pages || []) {
        await write(guide.path, countryGuide(site, c, guide));
      }
    }
  }

  /* Every institution and programme uses the school adapters. */
  await write('/universities/', universitiesIndex(site));
  }
  for (const c of site.countries) {
    const schools = c.institutions.filter((i) => isEnglishStudyOption(i) || i.school?.publicPage);
    for (const [i, inst] of schools.entries()) {
      if (schoolKey && inst.key !== schoolKey) continue;
      const near = (j) => schools[j] && { href: schools[j].href, label: schools[j].name };
      await write(inst.href, schoolPage(site, inst, c, { prev: near(i - 1), next: near(i + 1) }));
      /* A school's programmes (a listed school's every degree, a catalogue
         school's flagships): a page each under the school, paged in the
         order the school's page lists them. */
      if (inst.school?.programmes?.length) {
        /* Paged card by card: a programme's own paths (the Global BBA of a
           BBA family) are its paths table's, never its "Next" (round 7). */
        const groups = schoolCards(inst.school.programmes);
        const leadOf = (g) => g && (g.lead || g.members?.[0] || g);
        const step = (k) => { const q = leadOf(groups[k]); return q && { href: q.href, label: displayName(groups[k].family?.name || q.name) }; };
        for (const [k, g] of groups.entries()) {
          for (const p of g.members || [g]) {
            await write(p.href, schoolProgrammePage(site, inst, c, p, { prev: step(k - 1), next: step(k + 1) }));
          }
        }
      }
    }
  }
  if (schoolKey) {
    console.log(`  rebuilt ${written.length} pages for ${schoolKey} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    if (!errors.length && baseline && JSON.stringify(baseline) === JSON.stringify(await schoolBuildBaseline({ root: ROOT, baseline, key: schoolKey }))) {
      await fs.writeFile(marker, JSON.stringify(baseline));
    }
    if (errors.length) process.exitCode = 1;
    return;
  }
  // The finder is the home page now (plan.md, Batch D); old links arrive there.
  await write('/programmes/', redirectPage('/#discover', 'Find a degree'));
  await write('/planner/', planner(site));
  await write('/timeline/', timeline(site));
  await write('/prepare/', prepare(site));

  /* Guides */
  await write('/guides/course-results/', courseResultsGuide(site));
  for (const topic of site.topicList) {
    const slug = slugify(topic.slug || topic.title || 'guide');
    await write(`/guides/${slug}/`, meta.topicPage(site, topic, slug));
  }

  /* Meta */
  await write('/about/', meta.about(site));
  await write('/glossary/', meta.glossary(site));
  await write('/faq/', meta.faq());
  await write('/credits/', meta.credits(site));
  await write('/trust/', trust(site));
  await write('/counsellors/', counsellors(site));
  await write('/404.html', meta.notFound());

  /* Assets */
  await copyDir(ASSETS, path.join(DIST, 'assets'));
  // The eligibility engine is shared between the build, the tests and the
  // browser. Copying it rather than duplicating it is the whole point.
  await fs.copyFile(
    path.join(ROOT, 'src', 'lib', 'eligibility.mjs'),
    path.join(DIST, 'assets', 'js', 'eligibility.js')
  );
  await fs.writeFile(path.join(DIST, 'assets', 'img', 'favicon.svg'), favicon());
  // Motion tokens are generated from src/lib/motion.mjs so the stylesheet and
  // the documented purpose of each token cannot drift apart.
  await fs.writeFile(path.join(DIST, 'assets', 'css', 'motion.css'), motionCss());
  await fs.writeFile(path.join(DIST, 'data.json'), dataDump(site));
  // The globe (assets/js/globe.js, ADR 0005) draws borders and picks
  // countries from the 110m basemap, and names a clicked country's page from
  // the Destination records. Both are site-wide and fetched once, when the
  // globe loads, so neither is inlined into any page (there is no flat map to
  // bake the basemap into any more, ADR 0007).
  await fs.mkdir(path.join(DIST, 'assets', 'geo'), { recursive: true });
  await fs.copyFile(
    path.join(ROOT, 'data', 'geo', 'countries.json'),
    path.join(DIST, 'assets', 'geo', 'countries.json')
  );
  await fs.writeFile(
    path.join(DIST, 'assets', 'geo', 'destinations.json'),
    /* Every Destination, with the page it actually lives at — a Destination
       with an optional guide section links there,
       the rest to their generated page. From the records, never a name here. */
    JSON.stringify((site.destinations || site.countries).map((d) => ({
      code: d.code,
      name: d.name,
      flag: d.flag || '',
      href: url(destinationFacet(site.graph?.destinations?.get(d.code) || d, d.code).href),
      /* The country's photograph, for its card on the globe (#53 round 1:
         Denmark's card was the one without). */
      image: (() => {
        const tile = placeTiles(site).find((t) => t.code === d.code);
        const p = tile ? countryPicture(site, tile) : null;
        return p && !p.external ? url(p.src) : '';
      })(),
      /* Its one-line hook, for its postcard on the globe. */
      /* The same words as its tile in the lists beside it. */
      tagline: placeTiles(site).find((t) => t.code === d.code)?.tagline || d.tagline || '',
      /* The globe's top level: the continent its record puts it in. */
      continent: continentOf(d)?.id || '',
      continentName: continentOf(d)?.name || '',
    })))
  );

  /* GitHub Pages must not run Jekyll over this. */
  await fs.writeFile(path.join(DIST, '.nojekyll'), '');

  const origin = process.env.SITE_ORIGIN || 'https://rktrobinhood.github.io';
  await write('/sitemap.xml', sitemap(written.filter((w) => !w.moved).map((w) => w.route), origin));
  await write(
    '/robots.txt',
    `User-agent: *\nAllow: /\nSitemap: ${origin}${BASE}/sitemap.xml\n`
  );
  // Edits during a build cannot become a trusted quick-check baseline.
  if (!errors.length && baseline && JSON.stringify(baseline) === JSON.stringify(await buildBaseline({ root: ROOT }))) {
    await fs.writeFile(marker, JSON.stringify(baseline));
  }

  const bytes = written.reduce((n, w) => n + w.bytes, 0);
  console.log(
    `  wrote ${written.length} pages (${(bytes / 1024).toFixed(0)} KB of HTML) in ${((Date.now() - t0) / 1000).toFixed(1)}s`
  );
  console.log(`  output: ${path.relative(process.cwd(), DIST)}\n`);

  if (errors.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
