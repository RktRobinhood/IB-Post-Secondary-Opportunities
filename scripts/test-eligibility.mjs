/**
 * Scenarios for the eligibility engine.
 *
 *   node scripts/test-eligibility.mjs
 *
 * These exist because the engine's failure mode is dangerous in a specific way:
 * the tempting bug is to resolve missing or ambiguous data in the student's
 * favour. Several scenarios below assert the opposite.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  assess, buildSubjectIndex, convertAverage, convertGrade, OUTCOME,
} from '../src/lib/eligibility.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');

let passed = 0;
const failures = [];

function check(name, condition, detail = '') {
  if (condition) { passed++; return; }
  failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
}

function eq(name, actual, expected) {
  check(name, actual === expected, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

/* --- fixtures --------------------------------------------------------------- */

const conversionFile = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'ib-conversion.json'), 'utf8'));
const subjectFile = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'ib-subjects.json'), 'utf8'));
const subjectIndex = buildSubjectIndex(subjectFile.subjects);
const conversion = {
  single: conversionFile.singleGrade.table,
  average: conversionFile.gradeAverage.table,
};
const options = { conversion, subjectIndex, dataVersion: 'test' };

const req = (id, subject, level, extra = {}) => ({
  id, kind: 'ib-subject', mandatory: true, subject, level,
  label: `${subject} ${level}`, evidence: ['ev-test'], ...extra,
});

/** An engineering-shaped Opportunity: English B, Maths A, and one of two science pairs. */
const engineering = {
  id: 'opp-test-engineering',
  intake: '2027-autumn',
  meta: { dataAsOf: '2026-09-22' },
  evidence: ['ev-test'],
  admission: { restricted: true, historicalCutoffs: [{ intake: '2026-autumn', quota: 'Quota 1', value: '7.5' }] },
  requirements: [
    req('r1', 'English', 'B'),
    req('r2', 'Mathematics', 'A'),
    {
      id: 'r3', kind: 'subject-combination', mandatory: true, operator: 'one-of',
      label: 'One of two science combinations', evidence: ['ev-test'],
      alternatives: [
        [req('r3a1', 'Physics', 'B'), req('r3a2', 'Chemistry', 'B')],
        [req('r3b1', 'Physics', 'B'), req('r3b2', 'Biology', 'A')],
      ],
    },
  ],
};

/** A business-shaped Opportunity with a minimum grade and an essay. */
const business = {
  id: 'opp-test-business',
  intake: '2027-autumn',
  meta: { dataAsOf: '2026-09-22' },
  evidence: ['ev-test'],
  admission: { restricted: true },
  requirements: [
    req('r1', 'English', 'B', { minGrade: 6, gradeScale: 'dk-7-point' }),
    req('r2', 'Mathematics', 'B'),
    { id: 'r3', kind: 'essay', mandatory: true, label: 'Motivational essay', evidence: ['ev-test'] },
  ],
};

const verified = () => ({ level: 'verified', label: 'Verified', records: [] });

const profile = (subjects, extra = {}) => ({
  subjects,
  holdsDiploma: true,
  applicantGroup: 'eu-eea-ch',
  ...extra,
});

/* --- conversion tables ------------------------------------------------------ */

eq('34 points converts to a Danish 8.5', convertAverage(34, conversion.average), 8.5);
eq('45 points converts to 12.7', convertAverage(45, conversion.average), 12.7);
eq('an IB 5 converts to a Danish 7', convertGrade(5, conversion.single), 7);
eq('an IB 3 converts to a Danish 2', convertGrade(3, conversion.single), 2);
eq('an unpublished total returns nothing', convertAverage(17, conversion.average), null);

/* --- both maths courses are treated identically ----------------------------- */

for (const maths of ['mathematics-aa', 'mathematics-ai']) {
  const r = assess(
    profile([
      { subject: 'english-a-literature', level: 'HL', grade: 6 },
      { subject: maths, level: 'HL', grade: 6 },
      { subject: 'physics', level: 'SL', grade: 5 },
      { subject: 'chemistry', level: 'SL', grade: 5 },
    ]),
    engineering,
    { ...options, evidenceStatus: verified }
  );
  eq(`${maths} HL satisfies Mathematics A`, r.outcome, OUTCOME.MEETS);
}

/* --- a higher level covers a lower requirement ------------------------------ */

{
  const r = assess(
    profile([
      { subject: 'english-a-literature', level: 'HL', grade: 6 },
      { subject: 'mathematics-aa', level: 'HL', grade: 6 },
      { subject: 'physics', level: 'HL', grade: 6 },
      { subject: 'chemistry', level: 'HL', grade: 6 },
    ]),
    engineering,
    { ...options, evidenceStatus: verified }
  );
  eq('HL sciences cover B-level requirements', r.outcome, OUTCOME.MEETS);
}

/* --- alternatives: the second combination is enough ------------------------- */

{
  const r = assess(
    profile([
      { subject: 'english-b', level: 'SL', grade: 5 },
      { subject: 'mathematics-aa', level: 'HL', grade: 5 },
      { subject: 'physics', level: 'SL', grade: 4 },
      { subject: 'biology', level: 'HL', grade: 5 },
    ]),
    engineering,
    { ...options, evidenceStatus: verified }
  );
  eq('Physics SL + Biology HL satisfies the second alternative', r.outcome, OUTCOME.MEETS);
  check('the explanation names the combination',
    r.matched.some((m) => /accepted subject combinations/i.test(m.message)));
}

/* --- one subject short is "possible with action", not a rejection ----------- */

{
  const r = assess(
    profile([
      { subject: 'english-a-literature', level: 'HL', grade: 6 },
      { subject: 'mathematics-aa', level: 'SL', grade: 6 },
      { subject: 'physics', level: 'SL', grade: 5 },
      { subject: 'chemistry', level: 'SL', grade: 5 },
    ]),
    engineering,
    { ...options, evidenceStatus: verified }
  );
  eq('Maths SL against a Maths A requirement is possible with action', r.outcome, OUTCOME.POSSIBLE);
  eq('exactly one gap is reported', r.gaps.length, 1);
  check('the gap explains the level shortfall', /needs A/.test(r.gaps[0].message), r.gaps[0].message);
}

/* --- two missing subjects is a clear no ------------------------------------- */

{
  const r = assess(
    profile([
      { subject: 'english-b', level: 'SL', grade: 5 },
      { subject: 'history', level: 'HL', grade: 6 },
      { subject: 'psychology', level: 'SL', grade: 5 },
    ]),
    engineering,
    { ...options, evidenceStatus: verified }
  );
  eq('a humanities profile does not meet an engineering requirement', r.outcome, OUTCOME.DOES_NOT_MEET);
  check('more than one gap is reported', r.gaps.length > 1, `${r.gaps.length} gaps`);
}

/* --- minimum grades, and what happens when the grade is unknown ------------- */

{
  const withGrade = assess(
    profile([
      { subject: 'english-a-lang-lit', level: 'HL', grade: 5 },
      { subject: 'mathematics-ai', level: 'SL', grade: 5 },
    ]),
    business,
    { ...options, evidenceStatus: verified }
  );
  check('a grade 5 English (Danish 7) clears a minimum of 6',
    withGrade.matched.some((m) => /converts to 7/.test(m.message)));

  const belowGrade = assess(
    profile([
      { subject: 'english-a-lang-lit', level: 'HL', grade: 4 },
      { subject: 'mathematics-ai', level: 'SL', grade: 5 },
    ]),
    business,
    { ...options, evidenceStatus: verified }
  );
  check('a grade 4 English (Danish 4) falls below a minimum of 6',
    belowGrade.gaps.some((g) => /below the required 6/.test(g.message)),
    JSON.stringify(belowGrade.gaps.map((g) => g.message))
  );

  const noGrade = assess(
    profile([
      { subject: 'english-a-lang-lit', level: 'HL' },
      { subject: 'mathematics-ai', level: 'SL' },
    ]),
    business,
    { ...options, evidenceStatus: verified }
  );
  eq('a missing grade produces Needs review, not a pass', noGrade.outcome, OUTCOME.NEEDS_REVIEW);
  check('it says which grade to add', noGrade.unknowns.some((u) => /Add your grade/.test(u.message)));
}

/* --- unknown data never resolves in the student's favour -------------------- */

{
  const noRules = assess(
    profile([{ subject: 'english-a-literature', level: 'HL', grade: 7 }]),
    { id: 'opp-empty', intake: '2027-autumn', meta: {}, requirements: [] },
    { ...options, evidenceStatus: verified }
  );
  eq('an Opportunity with no recorded rules is Needs review', noRules.outcome, OUTCOME.NEEDS_REVIEW);
  check('it says why', noRules.dataIssues.some((d) => /No entry requirements/.test(d)));

  const unreviewed = assess(
    profile([
      { subject: 'english-a-literature', level: 'HL', grade: 6 },
      { subject: 'mathematics-aa', level: 'HL', grade: 6 },
      { subject: 'physics', level: 'SL', grade: 5 },
      { subject: 'chemistry', level: 'SL', grade: 5 },
    ]),
    engineering,
    { ...options, evidenceStatus: () => ({ level: 'needs-review', label: 'Not yet checked by a person', records: [] }) }
  );
  // Evidence read from the official page but not yet signed off by a person is
  // a caveat, not a refusal. Gating on it would make every result "Needs review"
  // the moment new research lands, and the label would stop meaning anything.
  eq('unreviewed evidence still gives an answer', unreviewed.outcome, OUTCOME.MEETS);
  check('but it says the evidence has not been checked by a person',
    unreviewed.caveats.some((c) => /not yet been checked by a person/.test(c)),
    JSON.stringify(unreviewed.caveats));

  const stale = assess(
    profile([
      { subject: 'english-a-literature', level: 'HL', grade: 6 },
      { subject: 'mathematics-aa', level: 'HL', grade: 6 },
      { subject: 'physics', level: 'SL', grade: 5 },
      { subject: 'chemistry', level: 'SL', grade: 5 },
    ]),
    engineering,
    { ...options, evidenceStatus: () => ({ level: 'stale', label: 'Past its review date', checkedAt: '2024-01-01', records: [] }) }
  );
  eq('evidence past its review date does hold the result back', stale.outcome, OUTCOME.NEEDS_REVIEW);

  const noSource = assess(
    profile([
      { subject: 'english-a-literature', level: 'HL', grade: 6 },
      { subject: 'mathematics-aa', level: 'HL', grade: 6 },
      { subject: 'physics', level: 'SL', grade: 5 },
      { subject: 'chemistry', level: 'SL', grade: 5 },
    ]),
    engineering,
    { ...options, evidenceStatus: () => ({ level: 'none', label: 'No source recorded', records: [] }) }
  );
  eq('no source at all holds the result back', noSource.outcome, OUTCOME.NEEDS_REVIEW);

  const conflicting = assess(
    profile([
      { subject: 'english-a-literature', level: 'HL', grade: 6 },
      { subject: 'mathematics-aa', level: 'HL', grade: 6 },
      { subject: 'physics', level: 'SL', grade: 5 },
      { subject: 'chemistry', level: 'SL', grade: 5 },
    ]),
    engineering,
    { ...options, evidenceStatus: () => ({ level: 'conflicting', label: 'Sources disagree', records: [] }) }
  );
  eq('conflicting sources hold the result back', conflicting.outcome, OUTCOME.NEEDS_REVIEW);
  check('the conflict is explained rather than hidden',
    conflicting.dataIssues.some((d) => /disagree/.test(d)));
}

/* --- the documented exceptions ---------------------------------------------- */

{
  const socialStudies = {
    id: 'opp-social', intake: '2027-autumn', meta: {}, evidence: ['ev-test'],
    requirements: [req('r1', 'English', 'B'), req('r2', 'Social Studies', 'B')],
  };
  const r = assess(
    profile([
      { subject: 'english-a-literature', level: 'HL', grade: 6 },
      { subject: 'history', level: 'HL', grade: 6 },
    ]),
    socialStudies,
    { ...options, evidenceStatus: verified }
  );
  eq('Social Studies has no fixed equivalence, so it is Needs review', r.outcome, OUTCOME.NEEDS_REVIEW);
  check('the explanation tells the student to ask in writing',
    r.unknowns.some((u) => /in writing/.test(u.message)),
    JSON.stringify(r.unknowns.map((u) => u.message)));
}

{
  const essayProgramme = assess(
    profile([
      { subject: 'english-a-lang-lit', level: 'HL', grade: 6 },
      { subject: 'mathematics-ai', level: 'SL', grade: 5 },
    ]),
    business,
    { ...options, evidenceStatus: verified }
  );
  eq('an essay requirement cannot be auto-checked, so the result is held', essayProgramme.outcome, OUTCOME.NEEDS_REVIEW);
  check('the essay is named as the reason',
    essayProgramme.unknowns.some((u) => /essay/i.test(u.label) || /essay/i.test(u.message)));
}

/* --- changing predicted grades ---------------------------------------------- */

{
  const pointsRule = {
    id: 'opp-points', intake: '2027-autumn', meta: {}, evidence: ['ev-test'],
    requirements: [
      { id: 'r1', kind: 'ib-total-points', mandatory: true, minPoints: 32, label: '32 points overall', evidence: ['ev-test'] },
    ],
  };
  const below = assess(profile([], { totalPoints: 30 }), pointsRule, { ...options, evidenceStatus: verified });
  eq('30 points against a 32-point rule is possible with action', below.outcome, OUTCOME.POSSIBLE);

  const wayBelow = assess(profile([], { totalPoints: 24 }), pointsRule, { ...options, evidenceStatus: verified });
  eq('24 points against a 32-point rule does not currently meet', wayBelow.outcome, OUTCOME.DOES_NOT_MEET);

  const above = assess(profile([], { totalPoints: 36 }), pointsRule, { ...options, evidenceStatus: verified });
  eq('36 points meets it', above.outcome, OUTCOME.MEETS);

  const unset = assess(profile([]), pointsRule, { ...options, evidenceStatus: verified });
  eq('no predicted total gives Needs review', unset.outcome, OUTCOME.NEEDS_REVIEW);
}

/* --- selection stays separate from eligibility ------------------------------ */

{
  const r = assess(
    profile([
      { subject: 'english-a-literature', level: 'HL', grade: 6 },
      { subject: 'mathematics-aa', level: 'HL', grade: 6 },
      { subject: 'physics', level: 'SL', grade: 5 },
      { subject: 'chemistry', level: 'SL', grade: 5 },
    ], { totalPoints: 24 }),
    engineering,
    { ...options, evidenceStatus: verified }
  );
  eq('a low total does not change requirement fit', r.outcome, OUTCOME.MEETS);
  check('the historical cut-off is reported separately', r.selection.historicalCutoffs.length === 1);
  check('it is explicitly not a prediction', /not a prediction/.test(r.selection.note));
  check('no field claims a chance of admission',
    !JSON.stringify(r).match(/likely|probability|chance of|guaranteed|safe bet/i));
}

/* --- every outcome is explainable ------------------------------------------- */

{
  const r = assess(
    profile([
      { subject: 'english-a-literature', level: 'HL', grade: 6 },
      { subject: 'mathematics-aa', level: 'SL', grade: 6 },
    ]),
    engineering,
    { ...options, evidenceStatus: verified }
  );
  const all = [...r.matched, ...r.gaps, ...r.unknowns];
  check('every rule produces a message', all.every((e) => e.message && e.message.length > 10));
  check('every rule is traceable to evidence', all.every((e) => Array.isArray(e.evidence)));
  check('the intake is reported', r.provenance.intake === '2027-autumn');
  check('the data version is reported', r.provenance.dataVersion === 'test');
}

/* --- against the real Danish catalogue -------------------------------------- */

{
  const dir = path.join(ROOT, 'data', 'opportunities');
  let files = [];
  try { files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json')); } catch {}
  if (files.length) {
    const opportunities = [];
    for (const f of files) opportunities.push(JSON.parse(await fs.readFile(path.join(dir, f), 'utf8')));

    const strong = profile([
      { subject: 'english-a-literature', level: 'HL', grade: 6 },
      { subject: 'mathematics-aa', level: 'HL', grade: 6 },
      { subject: 'physics', level: 'HL', grade: 6 },
      { subject: 'chemistry', level: 'SL', grade: 5 },
      { subject: 'history', level: 'SL', grade: 5 },
      { subject: 'danish-a-literature', level: 'SL', grade: 6 },
    ], { totalPoints: 38 });

    let crashed = 0;
    const outcomes = {};
    for (const opp of opportunities) {
      try {
        const r = assess(strong, opp, { ...options, evidenceStatus: verified });
        outcomes[r.outcome] = (outcomes[r.outcome] || 0) + 1;
        if (!r.outcomeLabel) crashed++;
      } catch { crashed++; }
    }
    eq(`every one of the ${opportunities.length} real Opportunities assesses without crashing`, crashed, 0);
    check('a strong science profile qualifies for at least one real programme',
      (outcomes[OUTCOME.MEETS] || 0) > 0, JSON.stringify(outcomes));
    console.log(`  real catalogue: ${JSON.stringify(outcomes)}`);
  }
}

/* --- Exemptions -----------------------------------------------------------
 *
 * Most English-taught European degrees require a documented English test and
 * then exempt IB Diploma holders. Recording only the test and not the exemption
 * shows "Needs review" to a student who is explicitly excused from it, which is
 * both wrong and exactly the kind of wrong that nobody reports.
 */
{
  const withTest = {
    id: 'test-exempt',
    requirements: [
      {
        id: 'r1',
        kind: 'language-general',
        mandatory: true,
        label: 'Documented English proficiency',
        satisfiedBy: ['ib-diploma'],
      },
    ],
  };
  const subjects = [{ subject: 'english-a-language-and-literature', level: 'HL', grade: 6 }];

  eq(
    'a full IB Diploma is exempt from a documented English test',
    assess(profile(subjects, { holdsDiploma: true }), withTest, options).outcome,
    OUTCOME.MEETS
  );
  eq(
    'Course Results are NOT exempt — the waiver is for the Diploma',
    assess(profile(subjects, { holdsDiploma: false }), withTest, options).outcome,
    OUTCOME.NEEDS_REVIEW
  );
  eq(
    'an unstated Diploma status does not assume the exemption',
    assess(profile(subjects, { holdsDiploma: undefined }), withTest, options).outcome,
    OUTCOME.NEEDS_REVIEW
  );

  const noExemption = {
    id: 'test-no-exempt',
    requirements: [{ id: 'r1', kind: 'language-general', mandatory: true, label: 'Documented English proficiency' }],
  };
  eq(
    'without satisfiedBy, a Diploma holder is still asked to check',
    assess(profile(subjects, { holdsDiploma: true }), noExemption, options).outcome,
    OUTCOME.NEEDS_REVIEW
  );
}

/* --- report ------------------------------------------------------------------ */

console.log('');
if (failures.length) {
  console.log(`${failures.length} failing scenario(s):`);
  for (const f of failures) console.log(`  ✗ ${f}`);
  console.log(`\n${passed} passed, ${failures.length} failed\n`);
  process.exit(1);
}
console.log(`All ${passed} eligibility scenarios pass.\n`);
