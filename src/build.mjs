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
import { setBase, setGuides, url, SITE } from './lib/layout.mjs';
import * as core from './pages/core.mjs';
import * as dk from './pages/denmark.mjs';
import * as prog from './pages/programmes.mjs';
import * as meta from './pages/meta.mjs';
import { slugify } from './lib/html.mjs';
import { execFileSync } from 'node:child_process';

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
const DIST = path.join(ROOT, 'dist');
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
  written.push({ route: routePath, bytes: Buffer.byteLength(contents) });
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
  const counts = { verified: 0, needsReview: 0, superseded: 0, unavailable: 0, conflicting: 0 };
  for (const ev of site.graph?.evidence?.values() || []) {
    if ((ev.conflictsWith || []).length) counts.conflicting++;
    else if (ev.verificationState === 'verified') counts.verified++;
    else if (ev.verificationState === 'needs-review') counts.needsReview++;
    else if (ev.verificationState === 'superseded') counts.superseded++;
    else if (ev.verificationState === 'unavailable') counts.unavailable++;
  }

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
    `  data: ${site.countries.length} countries · ${site.dkInstitutions.length} Danish institutions · ` +
      `${site.programmes.length} programmes · ${Object.keys(site.images).length + Object.keys(site.officialImages).length} images`
  );

  setGuides(
    site.topicList.map((t) => ({
      href: `/guides/${slugify(t.slug || t.title || 'guide')}/`,
      label: t.navLabel || t.title,
    }))
  );

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
  await write('/', core.home(site));
  await write('/europe/', core.europeIndex(site));
  await write('/world/', core.worldIndex(site));
  await write('/compare/', core.compare(site));

  /* Destinations, with prev/next within their own scope */
  for (const scope of ['europe', 'worldwide']) {
    const list = site.countries
      .filter((c) => c.scope === scope)
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const [i, c] of list.entries()) {
      const prev = list[i - 1] ? { href: list[i - 1].href, label: list[i - 1].name } : null;
      const next = list[i + 1] ? { href: list[i + 1].href, label: list[i + 1].name } : null;
      await write(c.href, core.destination(site, c, { prev, next }));
    }
  }

  /* Denmark */
  await write('/denmark/', dk.denmarkHub(site));
  await write('/denmark/apply/', dk.denmarkApply(site));
  await write('/denmark/ib-conversion/', dk.denmarkConversion(site));
  await write('/denmark/money/', dk.denmarkMoney(site));

  /* Danish institutions and programmes */
  await write('/universities/', prog.universitiesIndex(site));
  const insts = site.dkInstitutions.slice().sort((a, b) => a.name.localeCompare(b.name));
  for (const [i, inst] of insts.entries()) {
    const prev = insts[i - 1] ? { href: insts[i - 1].href, label: insts[i - 1].shortName || insts[i - 1].name } : null;
    const next = insts[i + 1] ? { href: insts[i + 1].href, label: insts[i + 1].shortName || insts[i + 1].name } : null;
    await write(inst.href, prog.university(site, inst, { prev, next }));
    for (const p of inst.programmes) {
      await write(p.href, prog.programme(site, p, inst));
    }
  }
  await write('/programmes/', prog.programmesIndex(site));
  await write('/planner/', prog.planner(site));
  await write('/timeline/', prog.timeline(site));

  /* Guides */
  for (const topic of site.topicList) {
    const slug = slugify(topic.slug || topic.title || 'guide');
    await write(`/guides/${slug}/`, meta.topicPage(site, topic, slug));
  }

  /* Meta */
  await write('/about/', meta.about(site));
  await write('/glossary/', meta.glossary());
  await write('/faq/', meta.faq());
  await write('/credits/', meta.credits(site));
  await write('/404.html', meta.notFound());

  /* Assets */
  await copyDir(ASSETS, path.join(DIST, 'assets'));
  await fs.writeFile(path.join(DIST, 'assets', 'img', 'favicon.svg'), favicon());
  await fs.writeFile(path.join(DIST, 'data.json'), dataDump(site));

  /* GitHub Pages must not run Jekyll over this. */
  await fs.writeFile(path.join(DIST, '.nojekyll'), '');

  const origin = process.env.SITE_ORIGIN || 'https://rktrobinhood.github.io';
  await write('/sitemap.xml', sitemap(written.map((w) => w.route), origin));
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
