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
import { countriesIndex, distanceDoors, destination } from './pages/destinations.mjs';
import { compare } from './pages/compare.mjs';
import * as dk from './pages/denmark.mjs';
import { universitiesIndex, university } from './pages/institutions.mjs';
import { programme } from './pages/programme.mjs';
import { schoolPage, schoolCards } from './pages/schools.mjs';
import { displayName } from './lib/schools.mjs';
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
import { summarise as summariseEvidence } from './lib/evidence-policy.mjs';
import { destinationFacet } from './lib/canonical.mjs';

const SCHEMA_VERSION = '1.0';

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
  /* The public export used to count these itself, and it was the one output
     that never looked at `meta.reviewBy` — so a record marked `verified` stayed
     in the verified column of data.json after its review date had passed,
     while `/trust/` and the build log both called the same record stale. There
     are no stale records today, which is exactly why nobody had seen it: the
     contradiction activates by itself on the first elapsed date, with no commit
     in between. */
  const counts = summariseEvidence([...(site.graph?.evidence?.values() || [])]);

  const g = site.graph || {};
  return JSON.stringify(
    {
      schemaVersion: SCHEMA_VERSION,
      dataRevision: dataRevision(),
      generatedAt: new Date().toISOString(),
      targetIntake: SITE.cycle.intake,
      licence: 'CC BY 4.0. Photographs carry their own terms — see /credits/.',
      disclaimer:
        'Admission rules change every year. Confirm anything consequential with the institution before acting on it.',

      recordCounts: {
        destinations: g.destinations?.size || 0,
        places: g.places?.size || 0,
        institutions: g.institutions?.size || 0,
        programmes: g.programmes?.size || 0,
        opportunities: g.opportunities?.size || 0,
        applicationSystems: g.applicationSystems?.size || 0,
        applicationRoutes: g.applicationRoutes?.size || 0,
        evidence: g.evidence?.size || 0,
        countryProfiles: site.countries.length,
      },
      evidenceCounts: counts,

      /* Canonical entities, for anyone building on this. */
      canonical: {
        destinations: [...(g.destinations?.values() || [])],
        places: [...(g.places?.values() || [])],
        institutions: [...(g.institutions?.values() || [])],
        programmes: [...(g.programmes?.values() || [])],
        opportunities: [...(g.opportunities?.values() || [])],
        applicationSystems: [...(g.applicationSystems?.values() || [])],
        applicationRoutes: [...(g.applicationRoutes?.values() || [])],
        evidence: [...(g.evidence?.values() || [])],
      },

      /* Country profiles that have not yet migrated to the entity model. */
      countryProfiles: site.countries.map((c) => ({
        code: c.code,
        name: c.name,
        scope: c.scope,
        region: c.region,
        dataAsOf: c.dataAsOf || null,
        targetIntake: c.targetIntake || null,
        tagline: c.tagline || null,
        summary: c.summary || null,
        ibRecognition: c.ibRecognition || null,
        language: c.language || null,
        costs: c.costs || null,
        deadlines: c.deadlines,
        institutions: c.institutions.map((i) => ({
          name: i.name,
          shortName: i.shortName || null,
          city: i.city || null,
          type: i.type || null,
          website: i.website || null,
          englishBachelors: i.englishBachelors || null,
        })),
        sources: c.sources,
      })),
    },
    null,
    2
  );
}

/* --- Build ----------------------------------------------------------------- */

async function main() {
  const t0 = Date.now();
  console.log(`\n${SITE.name} — building${BASE ? ` for base "${BASE}"` : ''}\n`);

  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(DIST, { recursive: true });

  const site = await load();
  console.log(
    `  data: ${site.countries.length} countries · ${site.institutionCatalogue.all.length} institutions · ` +
      `${site.programmes.length} programmes · ${Object.keys(site.images).length + Object.keys(site.officialImages).length} images`
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

  /* Every build states the condition of its evidence. A number that drifts the
     wrong way is the earliest warning that the dataset is decaying. */
  const ev = summariseEvidence([...(site.graph?.evidence?.values() || [])]);
  console.log(
    `  evidence: ${ev.verified} verified · ${ev.needsReview} awaiting review · ${ev.stale} stale · ` +
      `${ev.superseded} superseded · ${ev.unavailable} unavailable · ${ev.conflicting} conflicting`
  );
  const sc = site.evidenceSummary || {};
  if (sc.sourceChecked) {
    console.log(
      `  sources:  ${sc.sourceChecked} re-read (${sc.sourceSupported} carry the wording · ` +
        `${sc.sourcePartial} partial · ${sc.sourceUnsupported} not found), last on ${sc.lastCheckedAt}`
    );
  }

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

  /* Core */
  await write('/', home(site));
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
    }
  }

  /* Denmark */
  await write('/denmark/', dk.denmarkHub(site));
  await write('/denmark/apply/', dk.denmarkApply(site));
  await write('/denmark/ib-conversion/', dk.denmarkConversion(site));
  await write('/denmark/money/', dk.denmarkMoney(site));

  /* Institutions and programmes, in every Destination that has them */
  await write('/universities/', universitiesIndex(site));
  const insts = site.institutionCatalogue.all.slice().sort((a, b) => a.name.localeCompare(b.name));
  for (const [i, inst] of insts.entries()) {
    const prev = insts[i - 1] ? { href: insts[i - 1].href, label: insts[i - 1].shortName || insts[i - 1].name } : null;
    const next = insts[i + 1] ? { href: insts[i + 1].href, label: insts[i + 1].shortName || insts[i + 1].name } : null;
    await write(inst.href, university(site, inst, { prev, next }));
    for (const p of inst.programmes) {
      await write(p.href, programme(site, p, inst));
    }
  }
  /* Every other institution in a country profile: a school page each (#43),
     paged within its country. Ones with a canonical twin are written above. */
  for (const c of site.countries) {
    const schools = c.institutions.filter((i) => !i.canonicalId);
    for (const [i, inst] of schools.entries()) {
      const near = (j) => schools[j] && { href: schools[j].href, label: schools[j].name };
      await write(inst.href, schoolPage(site, inst, c, { prev: near(i - 1), next: near(i + 1) }));
      /* A listed school's programmes: a page each under the school, paged
         in the order the school's page lists them. */
      if (inst.school?.scope === 'listed') {
        const progs = schoolCards(inst.school.programmes).flatMap((g) => g.members);
        const step = (j) => progs[j] && { href: progs[j].href, label: displayName(progs[j].name) };
        for (const [j, p] of progs.entries()) {
          await write(p.href, schoolProgrammePage(site, inst, c, p, { prev: step(j - 1), next: step(j + 1) }));
        }
      }
    }
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
       with a hand-written section (canonical.mjs DESTINATION_HUBS) links there,
       the rest to their generated page. From the records, never a name here. */
    JSON.stringify((site.destinations || site.countries).map((d) => ({
      code: d.code,
      name: d.name,
      flag: d.flag || '',
      href: url(destinationFacet(site.graph?.destinations?.get(d.code) || d, d.code).href),
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
