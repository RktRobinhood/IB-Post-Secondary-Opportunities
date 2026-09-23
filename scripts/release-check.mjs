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

  /* A conflict is not automatically a fault. It became one the first time this
     check ran against a conflict that had been handled correctly.
     *
     * When two official pages disagree, recording that as a conflict is the
     * *fix*: the evidence policy downgrades the claim, the product declines to
     * state it, and the student is told what to do instead. Blocking a release
     * over that punishes the only honest response to a publisher contradicting
     * itself, and the way to make the check pass would be to delete the
     * conflict record and pick the more convenient page — which is precisely
     * what `conflictsWith` exists to prevent.
     *
     * What is still a fault is a conflict nobody has reasoned about. So the
     * test is for the marks a person leaves: each record naming its
     * counterpart, and each carrying an `interpretation` saying how it was
     * read. An auto-detected or half-written conflict has neither and still
     * blocks. A handled one is advisory, because it does still want settling
     * at the source eventually. */
  const conflicted = [];
  for (const f of await listJson(path.join(DATA, 'evidence'))) {
    const parsed = await readJson(path.join(DATA, 'evidence', f), []);
    for (const e of Array.isArray(parsed) ? parsed : Object.values(parsed)) {
      if ((e?.conflictsWith || []).length) conflicted.push(e);
    }
  }
  const byId = new Map(conflicted.map((e) => [e.id, e]));
  const unreasoned = conflicted.filter(
    (e) =>
      !String(e.interpretation || '').trim() ||
      !(e.conflictsWith || []).every((other) => (byId.get(other)?.conflictsWith || []).includes(e.id))
  );

  if (unreasoned.length) {
    block(
      `${unreasoned.length} evidence conflict(s) nobody has reasoned about`,
      `Each conflicting record must name its counterpart and carry an interpretation saying how it was read: ${unreasoned
        .map((e) => e.id)
        .join(', ')}`
    );
  } else if (conflicted.length) {
    advise(
      `${conflicted.length} evidence record(s) record a publisher contradicting itself`,
      'Handled: each names its counterpart and explains the reading, and the product declines to state the claim. Still worth settling at the source.'
    );
  } else ok('No evidence conflicts');

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

  /* --- Notes masquerading as requirements ---------------------------------- */
  //
  // A note filed as a mandatory requirement is silent and expensive. The engine
  // cannot evaluate prose, so it returns "unknown", and a student who meets
  // every actual condition is shown "Needs review" instead of "Meets". It
  // happened twice: once with capacity facts ("24 study places in 2026") and
  // once with an explanatory paragraph about grade conversion on CBS. Both read
  // perfectly well on the page, which is exactly why nobody spots them.
  //
  // The tell is shape, not content: a requirement is a label, a note is prose.
  let proseRequirements = [];
  for (const f of await listJson(path.join(DATA, 'opportunities'))) {
    const o = await readJson(path.join(DATA, 'opportunities', f));
    const walk = (rules) => {
      for (const r of rules || []) {
        const label = r.label || '';
        const readsLikeProse = label.length > 120 || /\.\s+[A-Z]/.test(label);
        if (r.mandatory !== false && readsLikeProse) {
          proseRequirements.push(`${o.id}: "${label.slice(0, 70)}…"`);
        }
        for (const alt of r.alternatives || []) walk(alt);
      }
    };
    walk(o.requirements);
  }
  if (proseRequirements.length) {
    block(
      `${proseRequirements.length} requirement(s) look like notes, not conditions`,
      `The engine cannot evaluate prose, so these silently downgrade a qualifying student to "Needs review". Move the text to the requirement's note field. First: ${proseRequirements[0]}`
    );
  } else ok('No explanatory notes are filed as mandatory requirements');

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

  /* --- Danish mechanisms on surfaces that look site-wide ------------------- */
  // Denmark is where this site starts, deliberately. The failure is not that
  // Danish rules appear — it is a student aiming at Utrecht reading quota 2 or
  // GSK as advice about their own application. A page may use those terms if it
  // says which country it is talking about: in its URL, in its title, or beside
  // the term itself. Anything else is a rule stated as a general fact.
  const DANISH_MECHANISM = /quota\s*[12]|\bGSK\b|optagelse\.dk|Eksamensh[aå]ndbogen/gi;
  const declaresDenmark = (rel, html) =>
    /(^|\/)(denmark|dk-)|destinations\/dk\//i.test(rel) ||
    /Denmark|Danish/i.test((html.match(/<title>([^<]*)<\/title>/i) || [])[1] || '');

  const leaking = [];
  for (const f of await walk(DIST)) {
    if (!f.endsWith('.html')) continue;
    const rel = path.relative(DIST, f).split(path.sep).join('/');
    const html = await fs.readFile(f, 'utf8');
    if (declaresDenmark(rel, html)) continue;
    // Read what a student reads. The subject checker ships the whole Danish
    // catalogue as embedded JSON for its client code; those are records the
    // page renders elsewhere with their own context, not prose making a claim.
    const prose = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ');
    for (const m of prose.matchAll(DANISH_MECHANISM)) {
      const near = prose.slice(Math.max(0, m.index - 400), m.index + 400);
      if (!/Denmark|Danish/i.test(near)) {
        leaking.push(`${rel}: "${m[0]}"`);
        break;
      }
    }
  }
  if (leaking.length) {
    advise(
      `${leaking.length} general page(s) state a Danish mechanism without saying so`,
      `${leaking.slice(0, 4).join('; ')}. A student not applying to Denmark reads these as their own rules.`
    );
  } else ok('No site-wide surface states a Danish mechanism without naming Denmark');

  /* --- The README's own figures ------------------------------------------- */
  // The README argues for trusting this project partly by quoting its own
  // numbers — how many records a person has signed off, how many scenarios hold
  // the engine honest. Those had drifted: it claimed 7 signed off when 20 were,
  // and gave the scenario count as both 45 and 49 two screens apart. A document
  // that makes its case out of figures has to be checkable, so it is.
  const readme = await fs.readFile(path.join(ROOT, 'README.md'), 'utf8').catch(() => null);
  if (!readme) {
    advise('No README to check', 'The figures it quotes could not be compared with the data.');
  } else {
    const states = { verified: 0, other: 0 };
    let sourceChecked = 0;
    for (const f of await listJson(path.join(DATA, 'evidence'))) {
      const recs = await readJson(path.join(DATA, 'evidence', f), []);
      for (const e of Array.isArray(recs) ? recs : [recs]) {
        if (e.verificationState === 'verified') states.verified++;
        else states.other++;
        if (e.sourceCheck) sourceChecked++;
      }
    }

    const signed = readme.match(/\*\*(\d+) records? signed off by a person, (\d+) with their source\s*\n?\s*re-read\*\*/);
    if (!signed) {
      advise('The README no longer states the verification split', 'That sentence is the honest version of the trust claim; keep it or move the check.');
    } else if (Number(signed[1]) !== states.verified || Number(signed[2]) !== sourceChecked) {
      const detail = `It says ${signed[1]} signed off and ${signed[2]} source-re-read; the data says ${states.verified} and ${sourceChecked}.`;
      // Direction matters. Claiming more verification than exists is the
      // failure this whole project is organised against; claiming less is only
      // untidy, and blocking a release over modesty teaches people to skip the
      // check.
      if (Number(signed[1]) > states.verified || Number(signed[2]) > sourceChecked) {
        block('The README claims more verification than the data supports', detail);
      } else {
        advise('The README understates its own verification', detail);
      }
    } else ok(`README verification figures match the data (${states.verified} signed off, ${sourceChecked} re-read)`);

    // The scenario count is quoted in prose as the reason to believe the engine
    // refuses to be generous, so it is taken from the engine, not from memory.
    const { spawnSync } = await import('node:child_process');
    const run = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'test-eligibility.mjs')], { encoding: 'utf8' });
    const actual = Number((run.stdout || '').match(/All (\d+) eligibility scenarios pass/)?.[1]);
    const quoted = [...readme.matchAll(/(\d+)\s+(?:eligibility\s+)?scenarios/g)].map((m) => Number(m[1]));
    if (!actual) {
      advise('Could not read the eligibility scenario count', 'test-eligibility.mjs did not report a total, so the README could not be checked against it.');
    } else if (!quoted.length) {
      ok(`${actual} eligibility scenarios pass; the README quotes no count to keep in step`);
    } else if (quoted.some((n) => n !== actual)) {
      block(
        'The README quotes the wrong number of eligibility scenarios',
        `It says ${[...new Set(quoted)].join(' and ')}; the engine runs ${actual}.`
      );
    } else ok(`README scenario count matches the engine (${actual})`);
  }

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
