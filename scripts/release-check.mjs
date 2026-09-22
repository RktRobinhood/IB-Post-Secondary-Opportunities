/**
 * The gate before a public release or an intake rollover.
 *
 *   node scripts/release-check.mjs
 *
 * `npm test` asks "does it work". This asks "should a seventeen-year-old act on
 * it". Those are different questions, which is why this is a separate script
 * and why it is allowed to fail on things a build would happily ship — a
 * missing correction address breaks no page and fails this.
 *
 * Checks are BLOCKING or ADVISORY. Blocking means a student could be harmed.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA = path.join(ROOT, 'data');
const DIST = path.join(ROOT, 'dist');

const blocking = [];
const advisory = [];
const passed = [];

const block = (what, detail) => blocking.push({ what, detail });
const advise = (what, detail) => advisory.push({ what, detail });
const ok = (what) => passed.push(what);

async function readJson(p, fallback = null) {
  try { return JSON.parse(await fs.readFile(p, 'utf8')); } catch { return fallback; }
}

async function listJson(dir) {
  try { return (await fs.readdir(dir)).filter((f) => f.endsWith('.json')); } catch { return []; }
}

async function main() {
  const cfg = await readJson(path.join(DATA, 'site-config.json'));
  const policy = await readJson(path.join(DATA, 'freshness-policy.json'));
  const exported = await readJson(path.join(DIST, 'data.json'));

  /* --- The intake is visible ---------------------------------------------- */
  if (exported?.targetIntake) ok(`Target intake stated in the export: ${exported.targetIntake}`);
  else block('No target intake in the export', 'A student cannot tell which admission year this describes.');

  /* --- Corrections can be reported without an account ---------------------- */
  const route = cfg?.corrections?.route;
  if (route === 'github' && cfg?.corrections?.issuesUrl) {
    ok('Corrections route declared: public issue tracker');
    advise(
      'Reporting a mistake needs a free GitHub account',
      'A deliberate choice — an issue is public, threaded and linked to its fix. The counsellor route covers students who do not want an account, and the trust page says so plainly.'
    );
  } else if (cfg?.corrections?.contactEmail) {
    ok('A correction address exists that does not require an account');
  } else {
    block(
      'No corrections route',
      'Set corrections.route in data/site-config.json, with either a monitored address or a public issue tracker.'
    );
  }
  if (cfg?.corrections?.issuesUrl) ok('A public issue tracker is linked');

  /* --- Evidence state ------------------------------------------------------ */
  const ev = exported?.evidenceCounts || {};
  if ((ev.conflicting || 0) > 0) {
    block(`${ev.conflicting} conflicting evidence record(s)`, 'A conflict must be resolved by a person before release.');
  } else ok('No unresolved evidence conflicts');

  if ((ev.unavailable || 0) > 0) {
    block(`${ev.unavailable} unavailable source(s)`, 'A claim whose source cannot be reached should not be published as current.');
  } else ok('Every recorded source was reachable when last checked');

  const total = exported?.recordCounts?.evidence || 0;
  const verifiedShare = total ? (ev.verified || 0) / total : 0;
  if (verifiedShare < 0.25) {
    advise(
      `Only ${ev.verified || 0} of ${total} evidence records are human-verified (${Math.round(verifiedShare * 100)}%)`,
      'Not blocking, because the alternative is publishing nothing. But this is the number that decides how much weight the site deserves, and it should go up before a wide release.'
    );
  } else ok(`${Math.round(verifiedShare * 100)}% of evidence is human-verified`);

  /* --- High-consequence claims carry evidence ------------------------------ */
  let unsourcedRequirements = 0;
  for (const f of await listJson(path.join(DATA, 'opportunities'))) {
    const o = await readJson(path.join(DATA, 'opportunities', f));
    for (const r of o?.requirements || []) {
      if (r.mandatory !== false && !(r.evidence || []).length) unsourcedRequirements++;
    }
  }
  if (unsourcedRequirements) {
    block(`${unsourcedRequirements} mandatory requirement(s) with no source`, 'Entry requirements decide whether a student can apply at all.');
  } else ok('Every mandatory entry requirement has a source');

  /* --- Provisional dates are marked, not disguised ------------------------- */
  let provisional = 0;
  let undatedMilestones = 0;
  for (const f of await listJson(path.join(DATA, 'application-routes'))) {
    const r = await readJson(path.join(DATA, 'application-routes', f));
    for (const m of r?.milestones || []) {
      if (m.provisional) provisional++;
      if (!m.date && !m.endDate) undatedMilestones++;
      if (m.consequence === 'hard' && m.date && !m.timeOfDay && !m.provisional) {
        advise(`"${m.label}" is a hard deadline with no time of day`, 'Noon and midnight are very different promises.');
      }
    }
  }
  if (provisional) {
    advise(`${provisional} provisional date(s) carried from a previous cycle`, 'Allowed, and they render marked as provisional. Re-verify before the application window opens.');
  } else ok('No dates are inherited from a previous cycle');
  if (undatedMilestones) advise(`${undatedMilestones} milestone(s) with no date at all`, 'Fine if the authority has not published one; check that is why.');

  /* --- The export is traceable --------------------------------------------- */
  if (exported?.schemaVersion && exported?.dataRevision && exported?.generatedAt) {
    ok(`Export carries schema ${exported.schemaVersion}, revision ${exported.dataRevision}`);
  } else block('The public export is not traceable', 'It needs a schema version, a data revision and a generation date.');

  /* --- Media rights --------------------------------------------------------- */
  const images = await readJson(path.join(DATA, 'images.json'), {});
  const uncredited = Object.entries(images).filter(([, v]) => !v.licence || !v.author || !v.page);
  if (uncredited.length) {
    block(`${uncredited.length} hosted image(s) without full attribution`, `First: ${uncredited.slice(0, 3).map(([k]) => k).join(', ')}`);
  } else ok(`All ${Object.keys(images).length} hosted images carry an author, a licence and a source page`);

  const official = await readJson(path.join(DATA, 'official-images.json'), {});
  const unbased = Object.entries(official).filter(([, v]) => !v.usageBasis && !v.licence);
  if (unbased.length) advise(`${unbased.length} linked image(s) without a recorded usage basis`, 'They are linked rather than copied, but the basis should still be recorded.');

  /* --- Independence is declared -------------------------------------------- */
  if (cfg?.independence) {
    const { sponsorship, affiliateLinks, paidPlacement } = cfg.independence;
    if (sponsorship === 'none' && affiliateLinks === 'none' && paidPlacement === 'none') {
      ok('No sponsorship, affiliate links or paid placement');
    } else {
      advise('Commercial relationships exist', 'Confirm they are labelled at the point of display and excluded from eligibility and ordering.');
    }
  } else block('No independence declaration', 'Students and counsellors should be able to see who pays for this.');

  /* --- Privacy claims match behaviour -------------------------------------- */
  const pages = await walk(DIST);
  const htmlFiles = pages.filter((f) => f.endsWith('.html'));
  const thirdParty = new Set();
  for (const f of htmlFiles) {
    const html = await fs.readFile(f, 'utf8');
    for (const m of html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)) {
      const host = new URL(m[1]).host;
      // Links a student clicks are fine; this looks for things the page LOADS.
      if (/<(script|link|img|iframe)[^>]*["']\s*$/.test(html.slice(Math.max(0, m.index - 200), m.index))) {
        thirdParty.add(host);
      }
    }
    // Look for an analytics vendor in a URL the page actually loads, not for
    // the word anywhere — this page uses "plausible" in ordinary prose, and a
    // check that fires on that gets switched off within a week.
    const TRACKERS = /google-analytics|googletagmanager|plausible\.io|matomo|hotjar|segment\.(io|com)|mixpanel|facebook\.net|clarity\.ms/i;
    for (const m of html.matchAll(/\b(?:src|href)="(https?:\/\/[^"]+)"/g)) {
      if (TRACKERS.test(m[1])) {
        block('Analytics detected', `${path.relative(DIST, f)} loads ${m[1]}, but the privacy page says there are none.`);
      }
    }
  }
  const allowed = new Set(['fonts.googleapis.com', 'fonts.gstatic.com']);
  const unexpected = [...thirdParty].filter((h) => !allowed.has(h));
  if (unexpected.length) {
    advise(`Pages load from ${unexpected.length} third-party host(s)`, unexpected.slice(0, 5).join(', '));
  } else ok('Pages load nothing from third parties except the font stylesheet');

  /* --- Accessibility and journeys that must not need JavaScript ------------ */
  const mustWorkWithoutJs = ['/programmes/index.html', '/compare/index.html', '/planner/index.html'];
  for (const rel of mustWorkWithoutJs) {
    const file = path.join(DIST, rel.replace(/\//g, path.sep));
    try {
      const html = await fs.readFile(file, 'utf8');
      if (!/<noscript/.test(html)) {
        advise(`${rel} has no <noscript> explanation`, 'A student with JavaScript blocked should be told what they are missing and where to go instead.');
      }
    } catch {
      block(`${rel} is missing from the build`, 'A page listed as core did not generate.');
    }
  }

  /* --- Rollover readiness --------------------------------------------------- */
  if (policy?.rollover?.currentIntake && exported?.targetIntake) ok(`Rollover target recorded: ${policy.rollover.currentIntake} → ${policy.rollover.nextIntake}`);
  else advise('No rollover target recorded', 'Set it in data/freshness-policy.json before the next cycle.');

  /* --- Report ---------------------------------------------------------------- */
  console.log(`\nRelease check — ${new Date().toISOString().slice(0, 10)}\n`);
  console.log(`  passed    ${String(passed.length).padStart(3)}`);
  console.log(`  advisory  ${String(advisory.length).padStart(3)}`);
  console.log(`  blocking  ${String(blocking.length).padStart(3)}\n`);

  for (const p of passed) console.log(`  ✓ ${p}`);
  if (advisory.length) {
    console.log('\nAdvisory — ship if you have decided to, but decide:');
    for (const a of advisory) console.log(`  · ${a.what}\n      ${a.detail}`);
  }
  if (blocking.length) {
    console.log('\nBlocking — a student could be harmed by these:');
    for (const b of blocking) console.log(`  ✗ ${b.what}\n      ${b.detail}`);
    console.log('');
    process.exit(1);
  }
  console.log('\nNothing blocking. Ready for a public release.\n');
}

async function walk(dir, out = []) {
  try {
    for (const e of await fs.readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) await walk(p, out);
      else out.push(p);
    }
  } catch {}
  return out;
}

main().catch((e) => { console.error(e); process.exit(1); });
