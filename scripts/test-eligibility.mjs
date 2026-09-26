/**
 * Scenarios for the eligibility engine.
 *
 *   node scripts/test-eligibility.mjs
 *
 * These exist because the engine's failure mode is dangerous in a specific way:
 * the tempting bug is to resolve missing or ambiguous data in the student's
 * favour. Several scenarios below assert the opposite.
 *
 * Two of them are structural rather than behavioural, and they are at the
 * bottom: the engine may not contain any destination's vocabulary, and a
 * Destination with no Recognition Scheme must be assessable end to end. The
 * second one is what makes the first one true rather than aspirational — a
 * default path nobody exercises is a fallback, not a default.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  applicantGroupsOf, assess, buildSubjectIndex, convertAverage, convertGrade, cutoffComparison, entryAward, ENTRY_AWARD, floorTerms, ibPointsFor, ibTermsFor,
  levelRaiseFor, OUTCOME,
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

/**
 * Every string literal and property name in a JavaScript source, with comments
 * skipped — the places an identifier can actually change what the code does.
 *
 * Hand-rolled because the guard below needs to tell `'dk-abc'` from the word
 * "it" in a sentence, and a regex cannot: prose is full of apostrophes and
 * slashes, and treating one as a quote swallows the rest of the file.
 */
function* identifiers(source) {
  for (let i = 0; i < source.length; i++) {
    const c = source[i];

    if (c === '/' && source[i + 1] === '/') {
      i = source.indexOf('\n', i);
      if (i === -1) return;
      continue;
    }
    if (c === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      if (end === -1) return;
      i = end + 1;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      const start = i + 1;
      let j = start;
      while (j < source.length && source[j] !== c) j += source[j] === '\\' ? 2 : 1;
      yield { text: source.slice(start, j), index: start, raw: `the literal ${JSON.stringify(source.slice(start, j).slice(0, 60))}` };
      i = j;
      continue;
    }
    if (c === '.' && /[A-Za-z_$]/.test(source[i + 1] || '')) {
      let j = i + 1;
      while (j < source.length && /[\w$]/.test(source[j])) j++;
      yield { text: source.slice(i + 1, j), index: i + 1, raw: `the property ".${source.slice(i + 1, j)}"` };
      i = j - 1;
    }
  }
}

/* --- fixtures --------------------------------------------------------------- */

const catalogue = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'ib-subjects.json'), 'utf8'));

const recognitionDir = path.join(ROOT, 'data', 'recognition');
const schemes = [];
for (const f of (await fs.readdir(recognitionDir)).filter((x) => x.endsWith('.json'))) {
  schemes.push(JSON.parse(await fs.readFile(path.join(recognitionDir, f), 'utf8')));
}

/** The scheme the Danish catalogue is written against, found by its Destination. */
const localScheme = schemes.find((s) => s.destination === 'dk');
const LOCAL_SCALE = localScheme.subjectScale.id;
const conversion = {
  single: localScheme.gradeConversion.single.table,
  average: localScheme.gradeConversion.average.table,
};

const subjectIndex = buildSubjectIndex({ subjects: catalogue.subjects, schemes });
const options = { subjectIndex, dataVersion: 'test' };

/** The catalogue alone — no Recognition Scheme anywhere. The default path. */
const ibOnlyIndex = buildSubjectIndex(catalogue.subjects);
const ibOnlyOptions = { subjectIndex: ibOnlyIndex, dataVersion: 'test' };

/** A requirement on a local subject scale. */
const req = (id, subject, level, extra = {}) => ({
  id, kind: 'local-equivalency', mandatory: true, levelScale: LOCAL_SCALE, subject, level,
  label: `${subject} ${level}`, evidence: ['ev-test'], ...extra,
});

/** A requirement in the IB's own terms. No scheme is consulted. */
const ibReq = (id, ibSubject, ibLevel, extra = {}) => ({
  id, kind: 'ib-subject', mandatory: true, ibSubject, ibLevel,
  label: `${ibSubject} ${ibLevel}`, evidence: ['ev-test'], ...extra,
});

/** An engineering-shaped Opportunity: English B, Maths A, and one of two science pairs. */
const engineering = {
  id: 'opp-test-engineering',
  destination: 'dk',
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
  destination: 'dk',
  intake: '2027-autumn',
  meta: { dataAsOf: '2026-09-22' },
  evidence: ['ev-test'],
  admission: { restricted: true },
  requirements: [
    req('r1', 'English', 'B', { minGrade: 6, gradeScale: localScheme.gradeScale.id }),
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

eq('34 points converts to a local average of 8.5', convertAverage(34, conversion.average), 8.5);
eq('45 points converts to 12.7', convertAverage(45, conversion.average), 12.7);
eq('an IB 5 converts to a local 7', convertGrade(5, conversion.single), 7);
eq('an IB 3 converts to a local 2', convertGrade(3, conversion.single), 2);
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
  check('the explanation names the combination that was met, leading with it',
    r.matched.some((m) => /^Needs Physics/.test(m.message) && /Biology HL/.test(m.message) && /One of the 2 accepted options/.test(m.message)),
    JSON.stringify(r.matched.map((m) => m.message)));
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
  /* Verification after round 5: under the national rule the course after the
     results is allowed only "where the programme accepts it", which this
     fixture does not record — so one missing level is a question for 2027. */
  eq('Maths SL against a Maths A requirement, with no recorded summer supplementation, is Needs review', r.outcome, OUTCOME.NEEDS_REVIEW);
  check('and the To check line says the permission is not recorded', r.actionLead === 'To check' && /accepts summer supplementation is not recorded/.test(r.actionSummary || ''), r.actionSummary);
  eq('exactly one gap is reported', r.gaps.length, 1);
  check('the gap leads with the IB level it needs', /^This needs Maths HL \(AA or AI\)/.test(r.gaps[0].message), r.gaps[0].message);
  check('and names the requirement as published', /Mathematics A\.\)$/.test(r.gaps[0].message), r.gaps[0].message);
  check('and it shows the translation rather than asserting it',
    /counts only as Mathematics at B level/.test(r.gaps[0].message), r.gaps[0].message);
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
  check('a grade 5 English (local 7) clears a minimum of 6',
    withGrade.matched.some((m) => /converts to 7/.test(m.message)));

  const belowGrade = assess(
    profile([
      { subject: 'english-a-lang-lit', level: 'HL', grade: 4 },
      { subject: 'mathematics-ai', level: 'SL', grade: 5 },
    ]),
    business,
    { ...options, evidenceStatus: verified }
  );
  check('a grade 4 English (local 4) falls below a minimum of 6',
    belowGrade.gaps.some((g) => /below the 6 asked for/.test(g.message) && /at least a 5/.test(g.message)),
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

/* --- a requirement on a scale nothing here covers --------------------------- */

{
  const foreign = {
    id: 'opp-unknown-scale', destination: 'zz', intake: '2027-autumn', meta: {}, evidence: ['ev-test'],
    requirements: [{
      id: 'r1', kind: 'local-equivalency', mandatory: true,
      levelScale: 'not-a-scale-we-hold', subject: 'Wiskunde', level: 'B',
      label: 'Wiskunde B', evidence: ['ev-test'],
    }],
  };
  const r = assess(
    profile([{ subject: 'mathematics-aa', level: 'HL', grade: 7 }]),
    foreign,
    { ...options, evidenceStatus: verified }
  );
  eq('a rule on a scale we hold no scheme for is Needs review, not a pass and not a rejection',
    r.outcome, OUTCOME.NEEDS_REVIEW);
  check('and it says that is what happened',
    r.unknowns.some((u) => /no Recognition Scheme/.test(u.message)),
    JSON.stringify(r.unknowns.map((u) => u.message)));

  const unscaled = {
    id: 'opp-no-scale', destination: 'zz', intake: '2027-autumn', meta: {}, evidence: ['ev-test'],
    requirements: [{
      id: 'r1', kind: 'local-equivalency', mandatory: true, subject: 'Mathematics', level: 'A',
      label: 'Mathematics A', evidence: ['ev-test'],
    }],
  };
  const u = assess(
    profile([{ subject: 'mathematics-aa', level: 'HL', grade: 7 }]),
    unscaled,
    { ...options, evidenceStatus: verified }
  );
  eq('a local level with no scale named cannot be checked at all', u.outcome, OUTCOME.NEEDS_REVIEW);
  check('and it says a level with no scale is a number with no unit',
    u.unknowns.some((x) => /no unit/.test(x.message)),
    JSON.stringify(u.unknowns.map((x) => x.message)));
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
    id: 'opp-social', destination: 'dk', intake: '2027-autumn', meta: {}, evidence: ['ev-test'],
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

/* --- a subject the scheme publishes no equivalent for ----------------------- */

{
  const r = assess(
    profile([
      { subject: 'english-a-literature', level: 'HL', grade: 6 },
      { subject: 'mathematics-aa', level: 'HL', grade: 6 },
      { subject: 'physics', level: 'SL', grade: 5 },
      { subject: 'chemistry', level: 'SL', grade: 5 },
      { subject: 'ess', level: 'HL', grade: 6 },
    ]),
    engineering,
    { ...options, evidenceStatus: verified }
  );
  check('an unmapped subject is reported rather than silently dropped',
    r.unmappedSubjects.some((u) => /Environmental/.test(u.name)),
    JSON.stringify(r.unmappedSubjects));
  check('and the caveat names the scheme that publishes no equivalent, not a nationality we invented',
    r.caveats.some((c) => c.includes(localScheme.label)),
    JSON.stringify(r.caveats));
}

/* --- changing predicted grades ---------------------------------------------- */

{
  const pointsRule = {
    id: 'opp-points', destination: 'dk', intake: '2027-autumn', meta: {}, evidence: ['ev-test'],
    requirements: [
      { id: 'r1', kind: 'ib-total-points', mandatory: true, minPoints: 32, label: '32 points overall', evidence: ['ev-test'] },
    ],
  };
  /* Round 4: a predicted total below a minimum names no step a student can
     take, so it is not "Possible with action" unless the source publishes a
     route (decision 35 said the same of a grade; this says it of a total). */
  const below = assess(profile([], { totalPoints: 30 }), pointsRule, { ...options, evidenceStatus: verified });
  eq('30 points against a 32-point rule, with no published route, does not currently meet', below.outcome, OUTCOME.DOES_NOT_MEET);
  const routed = assess(profile([], { totalPoints: 30 }), { ...pointsRule, requirements: [{ ...pointsRule.requirements[0], alternativeRoute: 'A foundation year the source names.' }] }, { ...options, evidenceStatus: verified });
  eq('with a published route it is possible with action', routed.outcome, OUTCOME.POSSIBLE);
  check('and the route is the action named', /To close it: A foundation year/.test(routed.gaps[0]?.message || ''), routed.gaps[0]?.message);

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
  check('the result records which scheme it was translated through',
    r.provenance.translatedThrough.some((t) => t.scale === LOCAL_SCALE),
    JSON.stringify(r.provenance.translatedThrough));
}

/* --- a Destination with no Recognition Scheme ------------------------------- *
 *
 * The one that proves the default is real.
 *
 * `zz` is not a country. Nothing in data/ describes it, no Recognition Scheme
 * covers it, and the index below is built from the IB catalogue alone — no
 * schemes at all, which is the state every Destination outside the pilot is in.
 * Its requirements are written the way most of the world publishes them, in the
 * IB's own units, and the whole engine has to work.
 *
 * If this ever starts failing, the IB path has quietly grown a dependency on a
 * translation table and the repository is back to one country.
 */
{
  const elsewhere = {
    id: 'opp-test-no-scheme',
    destination: 'zz',
    intake: '2027-autumn',
    meta: { dataAsOf: '2026-09-22' },
    evidence: ['ev-test'],
    admission: { restricted: false },
    requirements: [
      { id: 'r1', kind: 'ib-diploma', mandatory: true, label: 'A full IB Diploma', evidence: ['ev-test'] },
      { id: 'r2', kind: 'ib-total-points', mandatory: true, minPoints: 34, label: '34 points overall', evidence: ['ev-test'] },
      ibReq('r3', 'english-a-literature', 'any'),
      {
        id: 'r4', kind: 'subject-combination', mandatory: true, operator: 'one-of',
        label: 'Mathematics HL at 5, either course', evidence: ['ev-test'],
        alternatives: [
          [ibReq('r4a', 'mathematics-aa', 'HL', { minGrade: 5 })],
          [ibReq('r4b', 'mathematics-ai', 'HL', { minGrade: 5 })],
        ],
      },
    ],
  };

  const strong = profile([
    { subject: 'english-a-literature', level: 'SL', grade: 6 },
    { subject: 'mathematics-ai', level: 'HL', grade: 6 },
  ], { totalPoints: 36 });

  const r = assess(strong, elsewhere, { ...ibOnlyOptions, evidenceStatus: verified });
  eq('a Destination with no Recognition Scheme is assessed end to end', r.outcome, OUTCOME.MEETS);
  check('no table was consulted, and the result says so',
    r.provenance.translatedThrough.length === 0,
    JSON.stringify(r.provenance.translatedThrough));
  check('no explanation claims a conversion that did not happen',
    ![...r.matched, ...r.gaps, ...r.unknowns].some((e) => /counts as|converts to/.test(e.message)),
    JSON.stringify(r.matched.map((m) => m.message)));
  check('the explanation says the requirement was already in the student\'s own units',
    r.matched.some((m) => /published in IB terms/.test(m.message)),
    JSON.stringify(r.matched.map((m) => m.message)));
  check('an SL subject satisfies a requirement written for either level',
    r.matched.some((m) => /English A: Literature SL meets either level/.test(m.message)),
    JSON.stringify(r.matched.map((m) => m.message)));

  const short = assess(
    profile([
      { subject: 'english-a-literature', level: 'SL', grade: 6 },
      { subject: 'mathematics-aa', level: 'HL', grade: 4 },
    ], { totalPoints: 36 }),
    elsewhere,
    { ...ibOnlyOptions, evidenceStatus: verified }
  );
  /* A grade below an IB-terms minimum is the same as one below a local
     minimum (decision 35): nothing recorded replaces it, so it names no step.
     Round 4 found Dutch cards "Possible with action" with no action at all. */
  eq('one IB grade short, with no published route, does not currently meet', short.outcome, OUTCOME.DOES_NOT_MEET);
  check('and the shortfall is stated in IB grades',
    short.gaps.some((g) => /asks for at least 5 and your profile records 4/.test(g.message)),
    JSON.stringify(short.gaps.map((g) => g.message)));

  const wrongLevel = assess(
    profile([
      { subject: 'english-a-literature', level: 'SL', grade: 6 },
      { subject: 'mathematics-ai', level: 'SL', grade: 7 },
    ], { totalPoints: 30 }),
    elsewhere,
    { ...ibOnlyOptions, evidenceStatus: verified }
  );
  eq('SL against an HL requirement, with the points short too, does not currently meet',
    wrongLevel.outcome, OUTCOME.DOES_NOT_MEET);

  const noGrade = assess(
    profile([
      { subject: 'english-a-literature', level: 'SL', grade: 6 },
      { subject: 'mathematics-ai', level: 'HL' },
    ], { totalPoints: 36 }),
    elsewhere,
    { ...ibOnlyOptions, evidenceStatus: verified }
  );
  eq('a missing IB grade is Needs review, not a pass', noGrade.outcome, OUTCOME.NEEDS_REVIEW);

  const noSubjects = assess(
    profile([], { totalPoints: 36 }),
    elsewhere,
    { ...ibOnlyOptions, evidenceStatus: verified }
  );
  eq('an empty profile against it does not currently meet', noSubjects.outcome, OUTCOME.DOES_NOT_MEET);

  // And the same records assessed by an engine that DOES hold a scheme must not
  // pick one up out of the air, because nothing in them named a scale.
  const withSchemesLoaded = assess(strong, elsewhere, { ...options, evidenceStatus: verified });
  eq('holding a Recognition Scheme changes nothing for a requirement that names no scale',
    withSchemesLoaded.outcome, OUTCOME.MEETS);
  check('and still nothing was translated',
    withSchemesLoaded.provenance.translatedThrough.length === 0);
}

/* --- against the real catalogue --------------------------------------------- */

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

    /* Every subject requirement in the real records is either in IB terms or on
     * a scale we hold, at a level that scale defines. A requirement that names
     * a scale nobody defines is not an error the engine can recover from — it
     * answers "unknown" for ever and the record looks researched. */
    const scaleLevels = new Map(
      schemes.map((s) => [s.subjectScale.id, new Set((s.subjectScale.levels || []).map((l) => l.code))])
    );
    const stray = [];
    const walk = (rules, at) => {
      for (const rule of rules || []) {
        if (rule.kind === 'local-equivalency') {
          if (!rule.levelScale) stray.push(`${at} ${rule.id}: no levelScale`);
          else if (!scaleLevels.has(rule.levelScale)) stray.push(`${at} ${rule.id}: unknown scale "${rule.levelScale}"`);
          else if (!scaleLevels.get(rule.levelScale).has(rule.level)) {
            stray.push(`${at} ${rule.id}: level "${rule.level}" is not on ${rule.levelScale}`);
          }
        }
        if (rule.kind === 'ib-subject' && !rule.ibSubject) stray.push(`${at} ${rule.id}: ib-subject with no ibSubject`);
        for (const group of rule.alternatives || []) walk(group, at);
      }
    };
    for (const opp of opportunities) walk(opp.requirements, opp.id);
    check('every real subject requirement names a scale that exists, at a level it defines',
      stray.length === 0, stray.slice(0, 10).join('; '));
  }
}


/* --- Which IB award opens a door, in three states -------------------------
 *
 * Not every IB student leaves with the Diploma. Take individual DP subjects, or
 * sit the Diploma and miss its conditions, and the IB awards Course Results
 * instead. Some sources say the Diploma is required, some say Course Results
 * are accepted and on what terms, and most say nothing at all.
 *
 * Those are three states, and the third is the one these scenarios exist for.
 * The tempting implementation has two — "requires a Diploma" and "does not" —
 * and it silently converts every unresearched record into a promise that Course
 * Results are fine. A Course candidate reads it, applies, and is refused. So
 * the negative scenarios below are the load-bearing ones: nothing may tell a
 * Course candidate they meet a Diploma-gated Opportunity, nothing may tell them
 * an unrecorded Opportunity is open, and an unanswered profile may not be
 * treated as either kind of student.
 */
{
  const awardOpts = { ...ibOnlyOptions, evidenceStatus: verified };
  const subjects = [
    { subject: 'english-a-literature', level: 'HL', grade: 6 },
    { subject: 'mathematics-aa', level: 'HL', grade: 6 },
    { subject: 'physics', level: 'HL', grade: 5 },
    { subject: 'chemistry', level: 'SL', grade: 5 },
    { subject: 'economics', level: 'SL', grade: 5 },
    { subject: 'history', level: 'SL', grade: 5 },
  ];
  const courseCandidate = (extra = {}) => profile(subjects, { holdsDiploma: false, totalPoints: 30, ...extra });
  const diplomaHolder = profile(subjects, { holdsDiploma: true, totalPoints: 30 });
  const undecided = profile(subjects, { holdsDiploma: null, totalPoints: 30 });

  const opp = (requirements) => ({
    id: 'opp-test-award', destination: 'zz', intake: '2027-autumn',
    meta: { dataAsOf: '2026-09-22' }, evidence: ['ev-test'], admission: { restricted: false },
    requirements,
  });

  /* 1. The Diploma is required, and the source publishes another way in. */
  const gated = opp([
    {
      id: 'r1', kind: 'ib-diploma', mandatory: true, evidence: ['ev-test'],
      label: 'A qualifying upper-secondary examination',
      alternativeRoute: 'Two further subjects raised in level open this one without the Diploma.',
      alternativeRouteSummary: { short: 'Two further subjects raised in level open this one.', reachesAtEighteen: true, withinIntake: true },
    },
  ]);

  eq('a Diploma requirement is read as the Diploma state', entryAward(gated), ENTRY_AWARD.DIPLOMA_REQUIRED);
  eq(
    'a Diploma holder meets a Diploma-gated Opportunity',
    assess(diplomaHolder, gated, awardOpts).outcome,
    OUTCOME.MEETS
  );

  const gatedForCandidate = assess(courseCandidate(), gated, awardOpts);
  check(
    'a Course candidate is NOT told they meet a Diploma-gated Opportunity',
    gatedForCandidate.outcome !== OUTCOME.MEETS,
    gatedForCandidate.outcome
  );
  check(
    'the gap is the award, and it says Course Results do not satisfy it',
    gatedForCandidate.gaps.some((g) => /Course Results/.test(g.message) && /do not satisfy/.test(g.message)),
    JSON.stringify(gatedForCandidate.gaps.map((g) => g.message))
  );
  check(
    'the published route out is repeated to the student, from the record',
    gatedForCandidate.gaps.some((g) => /raised in level/.test(g.message)),
    JSON.stringify(gatedForCandidate.gaps.map((g) => g.message))
  );
  eq(
    'a single published route makes it Possible with action, not a closed door',
    gatedForCandidate.outcome,
    OUTCOME.POSSIBLE
  );

  /* Round 5: a route whose record does not say it can be completed for this
     intake (the Agency's two raises after Course Results arrive) is not a
     2027 step: "Does not currently meet", with the reason on a "For 2027" line. */
  const later = opp([{ ...gated.requirements[0], alternativeRouteSummary: { short: 'Two further subjects raised in level.', reachesAtEighteen: true } }]);
  const laterResult = assess(courseCandidate(), later, awardOpts);
  eq('a route not recorded as completable for this intake is not possible with action', laterResult.outcome, OUTCOME.DOES_NOT_MEET);
  check('and says why, for 2027', laterResult.actionLead === 'For 2027' && /2027 intake/.test(laterResult.actionSummary || ''), JSON.stringify([laterResult.actionLead, laterResult.actionSummary]));

  /* A route that waits for the student's 21st birthday is a route, not a
     step before this intake's deadline: said, but not "Possible with action"
     (round 4: Dutch colloquium-doctum cards were "possible"). */
  const aged = opp([{ ...gated.requirements[0], alternativeRouteSummary: { short: 'From 21: a colloquium doctum.', reachesAtEighteen: false } }]);
  const agedResult = assess(courseCandidate(), aged, awardOpts);
  eq('a route that opens only at 21 does not make it possible with action', agedResult.outcome, OUTCOME.DOES_NOT_MEET);
  check('but the route is still said', agedResult.gaps.some((g) => /raised in level/.test(g.message)), JSON.stringify(agedResult.gaps.map((g) => g.message)));
  const unsummarised = opp([{ ...gated.requirements[0], alternativeRouteSummary: undefined }]);
  eq('nor does a route whose record does not say it opens before 21', assess(courseCandidate(), unsummarised, awardOpts).outcome, OUTCOME.DOES_NOT_MEET);

  /* A record whose source publishes no way round says so and does not invent
     one, and the outcome is correspondingly harder. */
  const flatlyGated = opp([{ id: 'r1', kind: 'ib-diploma', mandatory: true, label: 'A full IB Diploma', evidence: ['ev-test'] }]);
  const flat = assess(courseCandidate(), flatlyGated, awardOpts);
  eq('with no route recorded, the engine does not invent one', flat.outcome, OUTCOME.DOES_NOT_MEET);
  check(
    'and it says nothing is recorded rather than that nothing exists',
    flat.gaps.some((g) => /No other route to this one is recorded/.test(g.message)),
    JSON.stringify(flat.gaps.map((g) => g.message))
  );

  eq(
    'an unanswered profile is not treated as a Diploma holder',
    assess(undecided, gated, awardOpts).outcome,
    OUTCOME.NEEDS_REVIEW
  );
  check(
    'and it is not treated as a Course candidate either — it asks the question',
    assess(undecided, gated, awardOpts).unknowns.some((u) => /not recorded in your profile/.test(u.message)),
    JSON.stringify(assess(undecided, gated, awardOpts).unknowns)
  );

  /* 2. Course Results are accepted, on the conditions the source attaches. */
  const openToCourseResults = opp([
    {
      id: 'r1', kind: 'ib-course-results', mandatory: true, evidence: ['ev-test'],
      label: 'Course Results accepted', minSubjects: 6, minHigherLevelSubjects: 3, minGrade: 3, minPoints: 18,
    },
  ]);
  eq('a Course Results rule is read as the accepted state', entryAward(openToCourseResults), ENTRY_AWARD.COURSE_RESULTS_ACCEPTED);
  eq(
    'a Course candidate who clears the conditions meets it',
    assess(courseCandidate(), openToCourseResults, awardOpts).outcome,
    OUTCOME.MEETS
  );
  eq(
    'a Diploma holder clears it too',
    assess(diplomaHolder, openToCourseResults, awardOpts).outcome,
    OUTCOME.MEETS
  );

  /* The conditions are conditions, not decoration. Course Results have no fixed
     shape, so a source that accepts them says what it wants to see, and a
     student who does not have it must not be told the door is open. */
  const short = profile(subjects.slice(0, 4), { holdsDiploma: false, totalPoints: 30 });
  const shortResult = assess(short, openToCourseResults, awardOpts);
  check(
    'a Course candidate with too few subjects is not told Course Results are enough',
    shortResult.outcome !== OUTCOME.MEETS,
    shortResult.outcome
  );

  const failing = profile(
    [...subjects.slice(0, 5), { subject: 'history', level: 'SL', grade: 2 }],
    { holdsDiploma: false, totalPoints: 30 }
  );
  check(
    'a grade below the floor the source set is caught',
    assess(failing, openToCourseResults, awardOpts).outcome !== OUTCOME.MEETS,
    assess(failing, openToCourseResults, awardOpts).outcome
  );

  /* Course Results have no Diploma total: their points are the six grades
     added up. Round 4's critic entered six grades totalling 34 and was asked
     for a "predicted total" on every academy that accepts Course Results. */
  const noTotal = profile(subjects, { holdsDiploma: false });
  const summed = assess(noTotal, openToCourseResults, awardOpts);
  eq('six graded subjects are summed: no predicted total is asked for', summed.outcome, OUTCOME.MEETS);
  check('and the sum is said', summed.matched.some((m) => /grades add up to 32/.test(m.message)), JSON.stringify(summed.matched.map((m) => m.message)));
  const lowSum = profile(subjects.map((x) => ({ ...x, grade: 3 })), { holdsDiploma: false });
  eq('six grades of 3 add up to 18, which clears 18', assess(lowSum, openToCourseResults, awardOpts).outcome, OUTCOME.MEETS);
  const ungraded = profile([...subjects.slice(0, 5), { subject: 'history', level: 'SL', grade: null }], { holdsDiploma: false });
  eq('a missing grade is a question, not a pass', assess(ungraded, openToCourseResults, awardOpts).outcome, OUTCOME.NEEDS_REVIEW);
  check('and it asks for the grades, not a predicted total',
    !assess(ungraded, openToCourseResults, awardOpts).unknowns.some((u) => /predicted total/.test(u.message)),
    JSON.stringify(assess(ungraded, openToCourseResults, awardOpts).unknowns.map((u) => u.message)));

  eq(
    'an unanswered profile is not told Course Results are accepted for it',
    assess(undecided, openToCourseResults, awardOpts).outcome,
    OUTCOME.NEEDS_REVIEW
  );

  /* 3. Nothing recorded — the state most records are in, and the dangerous one. */
  const silent = opp([ibReq('r1', 'english-a-literature', 'any')]);
  eq('a record that says nothing is not established', entryAward(silent), ENTRY_AWARD.NOT_ESTABLISHED);
  eq(
    'a Diploma holder is not troubled by a question they do not have',
    assess(diplomaHolder, silent, awardOpts).outcome,
    OUTCOME.MEETS
  );

  const silentForCandidate = assess(courseCandidate(), silent, awardOpts);
  check(
    'silence is NOT read as "Course Results are fine"',
    silentForCandidate.outcome !== OUTCOME.MEETS,
    silentForCandidate.outcome
  );
  check(
    'and the student is told which question could not be answered',
    silentForCandidate.unknowns.some((u) => /silence is not permission/i.test(u.message)),
    JSON.stringify(silentForCandidate.unknowns.map((u) => u.message))
  );
  check(
    'a Diploma holder gets no such caveat',
    !assess(diplomaHolder, silent, awardOpts).unknowns.some((u) => u.id === 'entry-award-not-established'),
    'a caveat was raised for a Diploma holder'
  );
  check(
    'and neither does an unanswered profile, which is asked the question instead',
    !assess(undecided, silent, awardOpts).unknowns.some((u) => u.id === 'entry-award-not-established'),
    'an unanswered profile was told a record was silent before it said which award it expects'
  );

  /* And the same three states over the real catalogue.
   *
   * The count is printed rather than asserted, because the number that is right
   * today is wrong the moment somebody researches one more record — an
   * assertion here would be a tax on doing the work. What IS asserted is that
   * the states partition the catalogue, and that the state a Course candidate
   * is most endangered by has not silently become the state everything is in. */
  {
    const dir = path.join(ROOT, 'data', 'opportunities');
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json'));
    const records = [];
    for (const f of files) records.push(JSON.parse(await fs.readFile(path.join(dir, f), 'utf8')));

    const states = {
      [ENTRY_AWARD.DIPLOMA_REQUIRED]: 0,
      [ENTRY_AWARD.COURSE_RESULTS_ACCEPTED]: 0,
      [ENTRY_AWARD.NOT_ESTABLISHED]: 0,
    };
    for (const o of records) states[entryAward(o)]++;
    check(
      'every Opportunity in the catalogue lands in exactly one of the three states',
      Object.values(states).reduce((a, b) => a + b, 0) === records.length,
      JSON.stringify(states)
    );
    console.log(`  entry award across the catalogue: ${JSON.stringify(states)}`);
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

/* --- a minimum grade the institution waives at a higher level --------------- *
 *
 * ITU: "English corresponding to the Danish B-level with an average mark of at
 * least 6 … (there is no grade requirement if you have passed English
 * corresponding to the Danish A-level)". English B HL counts as English A, so a
 * 4 there is enough; English B SL counts only as B, so a 4 there is not.
 */
{
  const itu = {
    id: 'opp-test-waiver', destination: 'dk', intake: '2027-autumn', meta: { dataAsOf: '2026-09-22' },
    evidence: ['ev-test'], admission: { restricted: true },
    requirements: [
      req('r1', 'English', 'B', { minGrade: 6, gradeScale: localScheme.gradeScale.id, minGradeWaivedAtLevel: 'A' }),
    ],
  };
  const hl4 = assess(profile([{ subject: 'english-b', level: 'HL', grade: 4 }]), itu, { ...options, evidenceStatus: verified });
  eq('English B HL at 4 meets English B min 6 where A level waives the minimum', hl4.outcome, OUTCOME.MEETS);
  const sl4 = assess(profile([{ subject: 'english-b', level: 'SL', grade: 4 }]), itu, { ...options, evidenceStatus: verified });
  eq('English B SL at 4 still falls short of the same rule, and nothing published closes it', sl4.outcome, OUTCOME.DOES_NOT_MEET);
  check('and it says so rather than promising an action', sl4.gaps.some((g) => /Nothing recorded here replaces this grade/.test(g.message)), JSON.stringify(sl4.gaps.map((g) => g.message)));
  const t = ibTermsFor(itu.requirements[0], subjectIndex);
  check('the waiver is said in IB terms: graded only in English B SL',
    t.waiver?.gradedPhrase === 'English B SL', JSON.stringify(t.waiver));
}

/* --- an institution's own route beats the national silence ------------------ *
 *
 * The Agency publishes no IB route to Social Studies B. Aarhus does: "Global
 * Politics HL: Recognised as Social Science B"; GP SL "in combination with
 * Economics SL/HL". The route is data on the institution, and applies only to
 * that institution's Opportunities.
 */
{
  const institutionsDir = path.join(ROOT, 'data', 'institutions');
  const institutions = [];
  for (const f of (await fs.readdir(institutionsDir)).filter((x) => x.endsWith('.json'))) {
    institutions.push(JSON.parse(await fs.readFile(path.join(institutionsDir, f), 'utf8')));
  }
  const withRoutes = institutions.find((i) => (i.ibEquivalences || []).some((e) => e.subject === 'Social Studies' && e.accepts.length === 2));
  check('an institution publishes its own Social Studies route', !!withRoutes);
  const index = buildSubjectIndex({ subjects: catalogue.subjects, schemes, institutions });
  const opts = { subjectIndex: index, dataVersion: 'test', evidenceStatus: verified };
  const opp = (institution) => ({
    id: 'opp-test-social', destination: 'dk', institution, intake: '2027-autumn', meta: { dataAsOf: '2026-09-22' },
    evidence: ['ev-test'], admission: { restricted: true }, requirements: [req('r1', 'Social Studies', 'B')],
  });
  const gpHL = profile([{ subject: 'global-politics', level: 'HL', grade: 5 }]);
  const gpSL = profile([{ subject: 'global-politics', level: 'SL', grade: 5 }]);
  const gpSLecon = profile([{ subject: 'global-politics', level: 'SL', grade: 5 }, { subject: 'economics', level: 'SL', grade: 5 }]);
  if (withRoutes) {
    eq('Global Politics HL meets Social Studies B at the institution that says so', assess(gpHL, opp(withRoutes.id), opts).outcome, OUTCOME.MEETS);
    /* Round 5: Social Studies from nothing to B is not established as one
       course, so "does not meet it" is a question about the plan, not a step. */
    const alone = assess(gpSL, opp(withRoutes.id), opts);
    check('Global Politics SL alone does not meet it', alone.outcome !== OUTCOME.MEETS && alone.outcome !== OUTCOME.POSSIBLE, alone.outcome);
    eq('Global Politics SL with Economics does', assess(gpSLecon, opp(withRoutes.id), opts).outcome, OUTCOME.MEETS);
    const t = ibTermsFor(req('r1', 'Social Studies', 'B'), index, withRoutes.id);
    check('and the wording names the route, not "no IB equivalent"', !!t.phrase && !t.none && /Global Politics HL/.test(t.phrase), JSON.stringify(t));
  }
  eq('elsewhere Global Politics HL is still a question for the institution',
    assess(gpHL, opp('dk-test-elsewhere'), opts).outcome, OUTCOME.NEEDS_REVIEW);
}

/* --- Contemporary History is met by History HL ------------------------------ */
{
  const t = ibTermsFor(req('r1', 'Contemporary History', 'B'), subjectIndex);
  eq('Contemporary History B reads as History HL (the handbook\'s History A row)', t.phrase, 'History HL');
}

/* --- a cut-off in IB points --------------------------------------------------- */
eq('a 10.7 cut-off is 40 IB points', ibPointsFor('10.7', localScheme.gradeScale.id, subjectIndex), 40);
eq('a 6.9 cut-off is 30 IB points', ibPointsFor(6.9, localScheme.gradeScale.id, subjectIndex), 30);
eq('a figure on an unknown scale is not converted', ibPointsFor(10.7, 'no-such-scale', subjectIndex), null);
eq('a figure above the table is not converted', ibPointsFor(13, localScheme.gradeScale.id, subjectIndex), null);

/* --- an English test as the other way in ------------------------------------- *
 *
 * CBS: "You can only take a language test to fulfil the language requirement
 * English level A if you have already passed English level B with a minimum
 * grade of 6.0." English B SL at 5 converts to 7, so the test is open to that
 * student and the result must name it; at 4 (converts to 4) it is not.
 */
{
  const cbs = {
    id: 'opp-test-english-test', destination: 'dk', intake: '2027-autumn', meta: { dataAsOf: '2026-09-22' },
    evidence: ['ev-test'], admission: { restricted: true },
    requirements: [
      {
        id: 'r1', kind: 'subject-combination', mandatory: true, operator: 'one-of', label: 'English A, or English B at 6.0 plus a test', evidence: ['ev-test'],
        alternatives: [
          [req('r1a', 'English', 'A')],
          [{ id: 'r1b', kind: 'test', mandatory: true, label: 'An English test (IELTS Academic 7.0, at least 6.0 in each part)', evidence: ['ev-test'] }],
        ],
      },
      req('r2', 'English', 'B', { minGrade: 6, gradeScale: localScheme.gradeScale.id, minGradeWaivedAtLevel: 'A' }),
    ],
  };
  const b5 = assess(profile([{ subject: 'english-b', level: 'SL', grade: 5 }]), cbs, { ...options, evidenceStatus: verified });
  eq('English B SL at 5 is possible with action at a test-route programme', b5.outcome, OUTCOME.POSSIBLE);
  check('and the action named is the test', b5.gaps.some((g) => /IELTS Academic 7\.0/.test(g.message)), JSON.stringify(b5.gaps.map((g) => g.message)));
  const b4 = assess(profile([{ subject: 'english-b', level: 'SL', grade: 4 }]), cbs, { ...options, evidenceStatus: verified });
  eq('English B SL at 4 does not currently meet it: the test needs English B at 6.0 first', b4.outcome, OUTCOME.DOES_NOT_MEET);
  const a = assess(profile([{ subject: 'english-a-literature', level: 'SL', grade: 4 }]), cbs, { ...options, evidenceStatus: verified });
  eq('any English A meets it with no test', a.outcome, OUTCOME.MEETS);
}

/* --- a minimum average, and a floor that only gates quota 1 ------------------ *
 *
 * RUC Social Sciences: "6.0 … from your entry qualification" or "4.0 … in the
 * subjects English and Mathematics", as an eligibility rule. AU: 6.0 overall
 * "to be assessed in quota 1" — below it the student is still eligible.
 */
{
  const scale = localScheme.gradeScale.id;
  const ruc = {
    id: 'opp-test-minimum', destination: 'dk', intake: '2027-autumn', meta: { dataAsOf: '2026-09-22' },
    evidence: ['ev-test'], admission: { restricted: true },
    requirements: [
      req('r1', 'English', 'B'),
      req('r2', 'Mathematics', 'B'),
      {
        id: 'r3', kind: 'subject-combination', mandatory: true, operator: 'one-of', label: 'Minimum grades', evidence: ['ev-test'],
        alternatives: [
          [{ id: 'r3a', kind: 'minimum-average', mandatory: true, minAverage: 6, gradeScale: scale, evidence: ['ev-test'] }],
          [{ id: 'r3b', kind: 'minimum-average', mandatory: true, minAverage: 4, gradeScale: scale, evidence: ['ev-test'],
             averageOf: [{ subject: 'English', levelScale: LOCAL_SCALE }, { subject: 'Mathematics', levelScale: LOCAL_SCALE }] }],
        ],
      },
    ],
  };
  const weak = profile([{ subject: 'english-b', level: 'SL', grade: 3 }, { subject: 'mathematics-ai', level: 'SL', grade: 3 }], { totalPoints: 25 });
  check('25 points with a 3 in English and Maths does not meet RUC\'s minimum',
    assess(weak, ruc, { ...options, evidenceStatus: verified }).outcome !== OUTCOME.MEETS);
  const pair = profile([{ subject: 'english-b', level: 'SL', grade: 3 }, { subject: 'mathematics-ai', level: 'SL', grade: 5 }], { totalPoints: 25 });
  eq('a 3 and a 5 (02 and 7, average 4.5) meets it through English and Maths', assess(pair, ruc, { ...options, evidenceStatus: verified }).outcome, OUTCOME.MEETS);
  const total = profile([{ subject: 'english-b', level: 'SL', grade: 3 }, { subject: 'mathematics-ai', level: 'SL', grade: 3 }], { totalPoints: 28 });
  eq('28 points meets it overall', assess(total, ruc, { ...options, evidenceStatus: verified }).outcome, OUTCOME.MEETS);

  const au = {
    ...ruc, id: 'opp-test-quota-floor',
    requirements: [
      req('r1', 'English', 'B'),
      { id: 'q1', kind: 'minimum-average', mandatory: true, minAverage: 6, gradeScale: scale, quota: 'Quota 1', evidence: ['ev-test'] },
      { id: 'q2', kind: 'minimum-average', mandatory: true, minAverage: 6, gradeScale: scale, quota: 'Quota 1', evidence: ['ev-test'],
        averageOf: [{ subject: 'Mathematics', levelScale: LOCAL_SCALE, level: 'A' }] },
    ],
  };
  const low = assess(profile([{ subject: 'english-b', level: 'SL', grade: 5 }, { subject: 'mathematics-aa', level: 'HL', grade: 3 }], { totalPoints: 26 }), au, { ...options, evidenceStatus: verified });
  eq('below a quota 1 floor is eligible, but not a plain yes', low.outcome, OUTCOME.OTHER_ROUTE);
  check('but both floors are reported as not met', low.floors.length === 2 && low.floors.every((f) => f.status === 'unmet'), JSON.stringify(low.floors));
  check('and the floor is named in IB terms', low.caveats.some((c) => /Quota 1: Needs at least 28 IB points/.test(c)), JSON.stringify(low.caveats));
  eq('6.0 overall reads as 28 IB points', floorTerms(au.requirements[1], subjectIndex).ibText, 'at least 28 IB points');
  eq('6.0 in Mathematics A reads as a 5 in Maths HL', floorTerms(au.requirements[2], subjectIndex).ibText, 'a 5 in Maths HL (AA or AI)');
  const withMin = buildSubjectIndex({ subjects: catalogue.subjects, schemes, diplomaMinimumPoints: catalogue.diplomaMinimumPoints });
  eq('a floor below the Diploma minimum reads as any IB Diploma',
    floorTerms({ kind: 'minimum-average', minAverage: 3.3, gradeScale: scale }, withMin).ibText, 'any IB Diploma');
}

/* --- the real records: no green below a floor, and every action named ------- *
 *
 * Round 3 of the critic ran five profiles through the planner. A 27-point
 * student saw a green "Meets" on SDU Software Engineering, whose quota 1 needs
 * 7.0 (31 IB points) — the only way in is SDU's entrance test. And "Possible
 * with action" named no action. These read the records as the site does.
 */
{
  const readDir = async (d) => {
    const out = [];
    for (const f of (await fs.readdir(path.join(ROOT, 'data', d))).filter((x) => x.endsWith('.json'))) {
      out.push(JSON.parse(await fs.readFile(path.join(ROOT, 'data', d, f), 'utf8')));
    }
    return out;
  };
  const institutions = await readDir('institutions');
  const opps = new Map((await readDir('opportunities')).map((o) => [o.id, o]));
  const index = buildSubjectIndex({ subjects: catalogue.subjects, schemes, institutions, diplomaMinimumPoints: catalogue.diplomaMinimumPoints });
  const opts = { subjectIndex: index, dataVersion: 'test', evidenceStatus: verified };
  const run = (id, subjects, extra) => assess(profile(subjects, extra), opps.get(`${id}-2027-autumn`), opts);

  const p4 = [
    { subject: 'mathematics-aa', level: 'HL', grade: 4 },
    { subject: 'english-b', level: 'HL', grade: 4 },
    { subject: 'physics', level: 'HL', grade: 4 },
  ];
  const se = run('dk-sdu-software-engineering-sonderborg', p4, { totalPoints: 27 });
  check('27 points at SDU Software Engineering is not a plain yes', se.outcome !== OUTCOME.MEETS, se.outcome);
  eq('it is "another route only"', se.outcome, OUTCOME.OTHER_ROUTE);
  check('and the route named is SDU\x27s entrance test', /entrance test/.test(se.route?.text || '') && /Quota 2 only/.test(se.outcomeLabel), JSON.stringify([se.outcomeLabel, se.route]));
  eq('at 31 points the same student meets it', run('dk-sdu-software-engineering-sonderborg', p4, { totalPoints: 31 }).outcome, OUTCOME.MEETS);

  const p1 = [
    { subject: 'english-b', level: 'SL', grade: 5 },
    { subject: 'mathematics-ai', level: 'SL', grade: 5 },
    { subject: 'history', level: 'HL', grade: 6 },
    { subject: 'economics', level: 'HL', grade: 6 },
  ];
  const cbs = run('dk-cbs-international-business', p1, { totalPoints: 34 });
  eq('English B SL 5 at CBS is possible with action', cbs.outcome, OUTCOME.POSSIBLE);
  const g = cbs.gaps[0]?.message || '';
  check('the action says what is missing (English A, in IB terms)', /English A/.test(g), g);
  check('and names the test, the scores and the date', /IELTS Academic 7.0/.test(g) && /6.0 in each/.test(g) && /5 July/.test(g), g);

  const cs = run('dk-au-computer-science', p1, { totalPoints: 34 });
  eq('Maths AI SL at AU Computer Science is possible with action', cs.outcome, OUTCOME.POSSIBLE);
  check('and the action is AU\x27s supplementary route', /supplementary course/.test(cs.gaps[0]?.message || ''), cs.gaps[0]?.message);

  const p5 = [
    { subject: 'english-b', level: 'SL', grade: 4 },
    { subject: 'mathematics-aa', level: 'HL', grade: 7 },
  ];
  const itu = run('dk-itu-data-science', p5, { totalPoints: 38 });
  check('English B SL 4 at ITU Data Science names ITU\x27s English test, or is not met',
    (itu.outcome === OUTCOME.POSSIBLE && /IELTS Academic 7.0/.test(itu.gaps[0]?.message || '')) || itu.outcome === OUTCOME.DOES_NOT_MEET,
    JSON.stringify([itu.outcome, itu.gaps.map((x) => x.message)]));

  const actionless = [];
  for (const o of opps.values()) {
    for (const prof of [p1, p4, p5]) {
      const r = assess(profile(prof, { totalPoints: 30 }), o, opts);
      if (r.outcome !== OUTCOME.POSSIBLE) continue;
      const gap = r.gaps[0]?.message || '';
      if (!/To close it:|The other published way in:|Add your|assessed by the institution|another route|alternative/i.test(gap) && !r.gaps[0]?.actionable) actionless.push(`${o.id}: ${gap}`);
    }
  }
  check('no "possible with action" across the catalogue is without an actionable gap', actionless.length === 0, actionless.slice(0, 3).join(' | '));
}

/* --- round 4: every action keyed to its gap, and every gap counted ----------- *
 *
 * The round-4 critic (docs/research/qa/conversion/critique-round-4.md) ran
 * nine profiles through the planner and found, among others:
 *   1. a missing Danish A told to take ITU's Maths course;
 *   2. a missing Physics hidden behind a Geoscience "?", so "Possible with
 *      action" named one course where two were needed;
 *   3. English B SL 4 at CBS "not met" although CBS publishes Cambridge C1
 *      185 as meeting English B at 6.0 and English A both;
 *   4. a Course candidate asked for a "predicted total" beside six grades;
 *   5. "Possible with action" with no action (RUC below a hard minimum,
 *      Dutch programmes missing an IB subject);
 *   6. a student holding Danish A told they lacked it (ITU).
 * The profiles are the critic's own (round-4/planner-profiles.json), inlined
 * so this file does not read the evidence folder. Every assertion below reads
 * the real records, as the planner does.
 */
{
  const readDir = async (d) => {
    const out = [];
    for (const f of (await fs.readdir(path.join(ROOT, 'data', d))).filter((x) => x.endsWith('.json'))) {
      out.push(JSON.parse(await fs.readFile(path.join(ROOT, 'data', d, f), 'utf8')));
    }
    return out;
  };
  const institutions = await readDir('institutions');
  const destinations = await readDir('destinations');
  const allOpps = await readDir('opportunities');
  const opps = new Map(allOpps.map((o) => [o.id, o]));
  const groupsTable = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'applicant-groups.json'), 'utf8')).groups;
  const index = buildSubjectIndex({ subjects: catalogue.subjects, schemes, institutions, diplomaMinimumPoints: catalogue.diplomaMinimumPoints });
  const opts = { subjectIndex: index, dataVersion: 'test', evidenceStatus: verified };

  const S = (list) => list.map(([subject, level, grade]) => ({ subject, level, grade: grade == null ? null : Number(grade) }));
  const P = {
    p1: { total: 34, group: 'eu-eea-ch', subjects: S([['language-a-other', 'HL', 6], ['english-b', 'SL', 5], ['history', 'HL', 6], ['economics', 'HL', 6], ['biology', 'SL', 5], ['mathematics-ai', 'SL', 5]]) },
    p2: { total: 36, group: 'eu-eea-ch', subjects: S([['english-a-lang-lit', 'HL', 6], ['language-b-other', 'SL', 5], ['computer-science', 'HL', 6], ['physics', 'HL', 5], ['business-management', 'SL', 6], ['mathematics-ai', 'SL', 6]]) },
    p3: { total: 37, group: 'eu-eea-ch', subjects: S([['english-a-literature', 'HL', 6], ['language-b-other', 'HL', 6], ['global-politics', 'HL', 7], ['psychology', 'SL', 6], ['biology', 'SL', 5], ['mathematics-aa', 'SL', 5]]) },
    p4: { total: 27, group: 'eu-eea-ch', subjects: S([['language-a-other', 'SL', 4], ['english-b', 'HL', 4], ['economics', 'SL', 5], ['physics', 'HL', 4], ['chemistry', 'SL', 4], ['mathematics-aa', 'HL', 4]]) },
    p5: { total: 38, group: 'eu-eea-ch', subjects: S([['language-a-other', 'SL', 6], ['english-b', 'SL', 4], ['economics', 'SL', 6], ['physics', 'HL', 7], ['chemistry', 'HL', 6], ['mathematics-aa', 'HL', 7]]) },
    p6: { total: null, group: 'eu-eea-ch', award: false, subjects: S([['english-a-lang-lit', 'HL', 6], ['mathematics-aa', 'HL', 6], ['physics', 'HL', 6], ['chemistry', 'SL', 5], ['economics', 'SL', 5], ['language-b-other', 'SL', 5]]) },
    p7: { total: 34, group: 'non-eu', subjects: S([['language-a-other', 'HL', 6], ['english-b', 'SL', 5], ['history', 'HL', 6], ['economics', 'HL', 6], ['biology', 'SL', 5], ['mathematics-ai', 'SL', 5]]) },
    p8: { total: 24, group: 'eu-eea-ch', subjects: S([['language-a-other', 'SL', 4], ['english-b', 'HL', 4], ['business-management', 'SL', 4], ['psychology', 'HL', 4], ['visual-arts', 'HL', 4], ['mathematics-ai', 'SL', 3]]) },
    p9: { total: 33, group: 'nordic', subjects: S([['danish-a-literature', 'SL', 5], ['english-a-lang-lit', 'HL', 6], ['mathematics-aa', 'SL', 5], ['economics', 'HL', 6], ['business-management', 'HL', 5], ['psychology', 'SL', 6]]) },
  };
  const asProfile = (p) => profile(p.subjects, {
    totalPoints: p.total, holdsDiploma: p.award === false ? false : true,
    applicantGroup: p.group, applicantGroups: applicantGroupsOf(p.group, groupsTable),
  });
  const run = (key, id) => assess(asProfile(P[key]), opps.get(`${id}-2027-autumn`), opts);
  const msgs = (r) => JSON.stringify([r.outcome, r.actionSummary, ...r.gaps.map((g) => g.message), ...r.unknowns.map((u) => u.message)]);

  /* 1. The action is keyed to the missing subject. */
  /* Round 5: Danish A from nothing is not counted as one course, and ITU's
     own sentence on who GBI is open to is quoted. */
  const gbi = run('p1', 'dk-itu-global-business-informatics');
  eq('P1 at ITU Global Business Informatics (no Danish at all) is Needs review, not one course', gbi.outcome, OUTCOME.NEEDS_REVIEW);
  const danish = gbi.gaps.find((g) => /Danish A/.test(g.message));
  check('the Danish A gap quotes ITU: only Data Science is open to international students', /only the programme in Data Science is open to international students/.test(danish?.message || ''), msgs(gbi));
  check('and says nothing about Mathematics', !/Mathematics|Maths/.test(danish?.message || 'x'), danish?.message);
  check('ITU\x27s Danish action is its own Danish sentence', /supplementary course in Danish level A/.test(levelRaiseFor({ subject: 'Danish', level: 'A', levelScale: LOCAL_SCALE }, index, 'dk-itu', { applicantGroup: 'eu-eea-ch' })?.text || ''));
  eq('P7 (outside the EU/EEA) at ITU GBI does not currently meet for 2027', run('p7', 'dk-itu-global-business-informatics').outcome, OUTCOME.DOES_NOT_MEET);
  const itds = run('p1', 'dk-itu-data-science');
  check('the Maths gap at ITU still names ITU\x27s Maths routes', /University of Amsterdam/.test(itds.gaps[0]?.message || ''), msgs(itds));

  /* The guard: for every subject rule in the catalogue, for every applicant
     group, the action names that subject or no subject — never another. A
     subject is "named" when it is written with a level ("Danish A", "Danish
     level A", "Danish at A level") or, for a subject whose name is not also a
     Destination's adjective, anywhere ("Mathematics"). */
  const adjectives = new Set(destinations.map((d) => d.adjective).filter(Boolean));
  const localNames = new Set();
  for (const s of schemes) {
    for (const row of s.subjectEquivalence || []) for (const ts of Object.values(row.maps || {})) for (const t of ts) localNames.add(t.subject);
    for (const row of s.subjectsWithoutEquivalence || []) localNames.add(row.subject);
  }
  const rulesOf = (rs) => (rs || []).flatMap((r) => [r, ...rulesOf((r.alternatives || []).flat())]);
  for (const o of allOpps) for (const r of rulesOf(o.requirements)) if (r.kind === 'local-equivalency' && r.subject) localNames.add(r.subject);
  const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const namesOther = (text, subject) => {
    for (const name of localNames) {
      if (name === subject || subject.startsWith(`${name} `) || name.startsWith(`${subject} `)) continue;
      const n = esc(name);
      const withLevel = new RegExp(`\\b${n}(?: level)? [A-C]\\b|\\b${n} at [A-C] level|\\bin ${n}\\b`);
      if (withLevel.test(text)) return name;
      if (!adjectives.has(name) && new RegExp(`\\b${n}\\b`).test(text)) return name;
    }
    return null;
  };
  const wrong = [];
  let actionsRead = 0;
  for (const o of allOpps) {
    for (const r of rulesOf(o.requirements)) {
      if (r.kind !== 'local-equivalency' || !r.subject) continue;
      for (const group of ['eu-eea-ch', 'nordic', 'non-eu', null]) {
        const a = levelRaiseFor(r, index, o.institution, { applicantGroup: group, applicantGroups: applicantGroupsOf(group, groupsTable) });
        if (!a) continue;
        actionsRead++;
        const other = namesOther(a.text, r.subject);
        if (other) wrong.push(`${o.id} ${r.subject} ${r.level} (${group}): names ${other} — "${a.text.slice(0, 80)}…"`);
      }
    }
  }
  check(`no action names a subject other than the one missing (${actionsRead} actions read)`, wrong.length === 0 && actionsRead > 100, [...new Set(wrong)].slice(0, 4).join(' | '));
  // A guard nobody has watched fail is a comment: round 4's ITU text, planted on Danish.
  check('the guard catches round 4\x27s ITU Maths text on a Danish gap',
    namesOther("ITU accepts a VUC course, the University of Amsterdam's online Mathematics B (it corresponds to Danish A) or an International A level in Mathematics at C or better.", 'Danish') === 'Mathematics');
  check('and passes the national sentence, whose "Danish" is an adjective',
    namesOther('Take the level as a Danish supplementary course (gymnasial supplering) passed by 5 July.', 'Physics') === null);

  /* 2. A missing Physics is named, and two courses are counted as two. */
  /* Round 5: two courses under the national rule, which lets one be finished
     after the results, is not a plan for 2027 — and Physics from nothing is
     not established as one course. */
  const aie = run('p1', 'dk-aau-applied-industrial-electronics');
  eq('P1 (no Physics) at AAU Applied Industrial Electronics is not possible for 2027', aie.outcome, OUTCOME.DOES_NOT_MEET);
  check('the Physics gap is named as a gap, not hidden behind a Geoscience "?"',
    aie.gaps.some((g) => /^This needs Physics/.test(g.message)) && !aie.unknowns.some((u) => /Geoscience/.test(u.message)), msgs(aie));
  check('the "For 2027" line names both courses and how many must come before the results',
    aie.actionLead === 'For 2027' && /^2 supplementary courses: Mathematics at A level and Physics at B level\. At least 1 of them \(all of them, unless the programme lets you finish courses after the results\) has to be passed before your IB results/.test(aie.actionSummary || ''), aie.actionSummary);
  const hidden = [];
  for (const o of allOpps) {
    const r = assess(asProfile(P.p1), o, opts);
    if (r.unknowns.some((u) => /equivalent to Geoscience/.test(u.message))) hidden.push(o.id);
  }
  check('no programme hides a missing Physics behind Geoscience for a student without Physics', hidden.length === 0, hidden.join(', '));
  const au = run('p1', 'dk-au-computer-science');
  check('one missing level at AU is one step, said in one line', au.outcome === OUTCOME.POSSIBLE && au.actionLead === 'To do' && /^Mathematics at A level as a supplementary course\./.test(au.actionSummary || ''), msgs(au));

  /* Courses counted against what the publisher lets this group finish after
     the results (round 5), and never more than our own limit. Each fixture
     gap is one level up from an SL subject, so each is one course. */
  {
    const three = {
      id: 'opp-test-three', destination: 'dk', intake: '2027-autumn', meta: {}, evidence: ['ev-test'], institution: 'dk-au',
      requirements: [req('r1', 'Mathematics', 'A'), req('r2', 'Physics', 'A'), req('r3', 'Chemistry', 'A')],
    };
    const sl = profile([
      { subject: 'english-b', level: 'SL', grade: 5 }, { subject: 'mathematics-aa', level: 'SL', grade: 5 },
      { subject: 'physics', level: 'SL', grade: 5 }, { subject: 'chemistry', level: 'SL', grade: 5 },
    ], { totalPoints: 30 });
    const r3 = assess(sl, three, opts);
    eq('three supplementary courses are not "possible with action" at AU (two after 5 July)', r3.outcome, OUTCOME.DOES_NOT_MEET);
    check('and the card says one has to come before the results', r3.actionLead === 'For 2027' && /1 of them has to be passed before your IB results/.test(r3.actionSummary || ''), r3.actionSummary);
    // Where a publisher would allow more, our own cap is the reason, and it says so.
    const generousScheme = { ...localScheme, levelRaise: { ...localScheme.levelRaise, afterResults: 5 } };
    const generous = buildSubjectIndex({ subjects: catalogue.subjects, schemes: [generousScheme, ...schemes.filter((s) => s !== localScheme)], diplomaMinimumPoints: catalogue.diplomaMinimumPoints });
    const capped = assess(sl, { ...three, institution: null }, { ...opts, subjectIndex: generous });
    eq('three courses where the publisher allows five are still not "possible": our limit', capped.outcome, OUTCOME.DOES_NOT_MEET);
    check('and the card says the cap is our limit, not the university\x27s', capped.actionLead === 'Our limit' && /our limit, not the university/.test(capped.actionSummary || ''), capped.actionSummary);
    const two = { ...three, requirements: three.requirements.slice(0, 2) };
    const r2 = assess(sl, two, opts);
    eq('two are at AU, which accepts two after 5 July', r2.outcome, OUTCOME.POSSIBLE);
    check('and the To do line gives AU\x27s own sentence', /at most two passed after it/.test(r2.actionSummary || ''), r2.actionSummary);
    const national = assess(sl, { ...two, institution: 'dk-aau' }, opts);
    eq('two are not under the national rule, which allows one after the results', national.outcome, OUTCOME.DOES_NOT_MEET);
    check('and the For 2027 line says at least one has to come before the results, and all unless the programme allows otherwise', /At least 1 of them \(all of them, unless/.test(national.actionSummary || ''), national.actionSummary);
    /* The national rule's one course after the results applies only "where
       the programme accepts it": unrecorded, so a question (verification
       after round 5), and one where the institution records it (SDU, EU). */
    const nat1 = assess(sl, { ...two, institution: 'dk-aau', requirements: two.requirements.slice(0, 1) }, opts);
    eq('one under the national rule is Needs review: the programme\x27s acceptance is not recorded', nat1.outcome, OUTCOME.NEEDS_REVIEW);
    check('and says so', /accepts summer supplementation is not recorded/.test(nat1.actionSummary || ''), nat1.actionSummary);
    eq('one at SDU (EU/EEA, recorded: pass by 31 August) is possible', assess(sl, { ...two, institution: 'dk-sdu', requirements: two.requirements.slice(0, 1) }, opts).outcome, OUTCOME.POSSIBLE);
    const nonEu = { ...sl, applicantGroup: 'non-eu', applicantGroups: ['non-eu'] };
    const sduOne = assess(nonEu, { ...two, institution: 'dk-sdu', requirements: two.requirements.slice(0, 1) }, opts);
    eq('one course is not possible for 2027 at SDU from outside the EU/EEA (none after 5 July)', sduOne.outcome, OUTCOME.DOES_NOT_MEET);
    check('and the line says it has to be passed before the results', /It has to be passed before your IB results/.test(sduOne.actionSummary || '') && !/after 5 July/.test(sduOne.actionSummary || ''), sduOne.actionSummary);
    eq('nor at CBS, which accepts no summer supplementation', assess(sl, { ...two, institution: 'dk-cbs', requirements: two.requirements.slice(0, 1) }, opts).outcome, OUTCOME.DOES_NOT_MEET);
    const silentScheme = { ...localScheme, levelRaise: { text: localScheme.levelRaise.text } };
    const silent = buildSubjectIndex({ subjects: catalogue.subjects, schemes: [silentScheme, ...schemes.filter((s) => s !== localScheme)], diplomaMinimumPoints: catalogue.diplomaMinimumPoints });
    eq('where nobody says how many can come after the results, none is counted',
      assess(sl, { ...two, institution: null, requirements: two.requirements.slice(0, 1) }, { ...opts, subjectIndex: silent }).outcome, OUTCOME.DOES_NOT_MEET);
  }

  /* 3. CBS: Cambridge C1 185 meets English B at 6.0 and English A. */
  const cbsIds = allOpps.filter((o) => o.institution === 'dk-cbs').map((o) => o.id.replace(/-2027-autumn$/, ''));
  eq('there are six CBS programmes', cbsIds.length, 6);
  for (const id of cbsIds) {
    const r = run('p5', id);
    eq(`P5 (English B SL 4) at ${id} is possible with action`, r.outcome, OUTCOME.POSSIBLE);
    check(`and the one step named is Cambridge (${id})`, /^One step closes both: Cambridge C1 Advanced/.test(r.actionSummary || ''), msgs(r));
  }
  const cbsP1 = run('p1', 'dk-cbs-international-business');
  check('English B SL 5 at CBS still names the IELTS/TOEFL route as its one step', cbsP1.outcome === OUTCOME.POSSIBLE && /IELTS Academic 7.0/.test(cbsP1.gaps[0]?.message || ''), msgs(cbsP1));
  const noTest = { ...opps.get('dk-cbs-international-business-2027-autumn') };
  noTest.requirements = noTest.requirements.map((r) => (r.alternativeTest ? { ...r, alternativeTest: undefined } : r));
  eq('without the recorded Cambridge route, English B SL 4 at CBS does not currently meet (the rule is the data)',
    assess(asProfile(P.p5), noTest, opts).outcome, OUTCOME.DOES_NOT_MEET);

  /* 4. Course Results: the six grades are the total. */
  const sea = run('p6', 'dk-sea-computer-science-ap');
  check('P6 (Course Results, six grades, no total) at SEA Computer Science clears the Course Results conditions',
    sea.matched.some((m) => /grades add up to 33/.test(m.message)), msgs(sea));
  /* Round 5: but SEA's English-test exemption names "an International
     Baccalaureate exam", and its reach to Course Results is not published. */
  for (const id of ['dk-sea-computer-science-ap', 'dk-sea-multimedia-design-ap']) {
    const r = run('p6', id);
    eq(`P6 at ${id} is Needs review, not green: the English-test exemption is an open question`, r.outcome, OUTCOME.NEEDS_REVIEW);
    check(`and the "?" says what is not published (${id})`, r.unknowns.some((u) => /whether that includes DP Course Results is not published/.test(u.message)), msgs(r));
    eq(`a Diploma holder at ${id} is exempt and meets it`, run('p5', id).outcome, OUTCOME.MEETS);
  }
  const askedTotal = [];
  for (const o of allOpps) {
    const r = assess(asProfile(P.p6), o, opts);
    const said = [...r.unknowns.map((u) => u.message), ...r.floors.map((f) => f.message)];
    if (said.some((m) => /predicted total/.test(m))) askedTotal.push(o.id);
  }
  check('no result asks a Course candidate with six grades for a predicted total', askedTotal.length === 0, askedTotal.slice(0, 4).join(', '));
  const auP6 = run('p6', 'dk-au-computer-science');
  check('the Agency\x27s Course Results route is marked as a shared passage, so the planner says it once',
    auP6.gaps.some((g) => (g.shared || []).some((s) => s.key.startsWith('route:') && g.message.includes(s.text))), msgs(auP6));

  /* 5. "Possible with action" names an action, for every profile, everywhere. */
  const ruc = run('p8', 'dk-ruc-international-bachelor-in-social-sciences');
  eq('P8 (24 points) at RUC Social Sciences does not currently meet: RUC\x27s minimum is a rejection', ruc.outcome, OUTCOME.DOES_NOT_MEET);
  check('and the gap quotes RUC\x27s rule', ruc.gaps.some((g) => /rejection letter/.test(g.message)), msgs(ruc));
  eq('P1 at TU Delft Computer Science (no Maths AA) does not currently meet: nothing is published to close it',
    run('p1', 'nl-tudelft-computer-science-and-engineering').outcome, OUTCOME.DOES_NOT_MEET);
  const um = run('p1', 'nl-maastricht-data-science-and-artificial-intelligence');
  check('at Maastricht, which publishes a deficiency route, it is possible and names it',
    um.outcome === OUTCOME.POSSIBLE && /deficiency/.test(um.gaps[0]?.message || ''), msgs(um));
  const actionless = [];
  for (const [key, p] of Object.entries(P)) {
    for (const o of allOpps) {
      const r = assess(asProfile(p), o, opts);
      if (r.outcome !== OUTCOME.POSSIBLE) continue;
      for (const g of r.gaps) {
        if (!g.actions?.length || !g.actions.every((a) => a.text) || !/To close it:|The other published way|It does not close this one to you/.test(g.message)) {
          actionless.push(`${key} ${o.id}: ${g.message.slice(0, 90)}`);
        }
      }
    }
  }
  check('every gap of every "possible with action", for all nine round-4 profiles, names its step', actionless.length === 0, actionless.slice(0, 4).join(' | '));

  /* 6. A student who holds Danish A is not told they lack it. */
  /* Round 5: the handbook "formally counts this as Danish B" and says
     "confirm with the university": a rule a person must judge, so a "?". */
  const gbi9 = run('p9', 'dk-itu-global-business-informatics');
  eq('P9 (Danish A Literature SL) at ITU Global Business Informatics is Needs review, not green', gbi9.outcome, OUTCOME.NEEDS_REVIEW);
  check('with no "documentation the profile does not hold" line', ![...gbi9.unknowns, ...gbi9.gaps].some((x) => /documentation the profile does not hold/.test(x.message)), msgs(gbi9));
  check('and the SL caution is the question asked', gbi9.unknowns.some((m) => /formally counts this as Danish B/.test(m.message)), msgs(gbi9));
  const withHl = assess(profile([...P.p9.subjects.filter((x) => x.subject !== 'danish-a-literature'), { subject: 'danish-a-literature', level: 'HL', grade: 5 }], { totalPoints: 33, applicantGroup: 'nordic', applicantGroups: applicantGroupsOf('nordic', groupsTable) }), opps.get('dk-itu-global-business-informatics-2027-autumn'), opts);
  eq('Danish A Literature HL meets it outright', withHl.outcome, OUTCOME.MEETS);
  // A language rule that is a subject at a level in disguise is the bug's shape.
  const disguised = [];
  const levelled = new RegExp(`\\b(${[...localNames].map(esc).join('|')}) [A-C]\\b`);
  for (const o of allOpps) {
    for (const r of rulesOf(o.requirements)) {
      if (['language-general', 'language-programme'].includes(r.kind) && levelled.test(r.label || '') && !(r.subject && r.levelScale)) disguised.push(`${o.id}: ${r.label}`);
    }
  }
  check('no language rule names a subject at a level without saying which (it cannot be checked)', disguised.length === 0, disguised.join(' | '));

  /* 7. The applicant group changes the action where the publisher says so. */
  const sduNon = run('p7', 'dk-sdu-computer-science');
  check('P7 (outside the EU/EEA) at SDU is told to finish before 5 July, not offered 31 August',
    /before 5 July/.test(sduNon.gaps[0]?.message || '') && !/31 August/.test(sduNon.gaps[0]?.message || ''), msgs(sduNon));
  eq('and one course that must come before the results is not possible for 2027', sduNon.outcome, OUTCOME.DOES_NOT_MEET);
  /* Round 5, verdict 1: P7's "To do" said "only one subject … after 5 July"
     under gap lines that said every course must be finished before it. */
  for (const id of ['dk-sdu-electronics-sonderborg', 'dk-sdu-electronics-beng', 'dk-sdu-engineering-innovation-and-business',
    'dk-sdu-interactive-technology-engineering', 'dk-sdu-mechatronics-sonderborg', 'dk-sdu-mechatronics-beng', 'dk-sdu-computer-science']) {
    const r = run('p7', id);
    check(`P7 at ${id}: no line says anything may come after 5 July`,
      ![r.actionSummary || '', ...r.gaps.map((g) => g.message)].some((m) => /after 5 July/.test(m)), msgs(r));
  }
  check('an EU/EEA student at SDU is still offered 31 August', /31 August/.test(run('p1', 'dk-sdu-computer-science').gaps[0]?.message || ''));
  const ituNon = run('p7', 'dk-itu-data-science');
  check('P7 at ITU is told conditional admission is not open to them', /not fee-exempt|without fee exemption/.test(ituNon.gaps[0]?.message || '') && !/1 September/.test(ituNon.gaps[0]?.message || ''), msgs(ituNon));

  /* 7. A cut-off any IB Diploma clears is not printed as a points total. */
  const chem = opps.get('dk-aau-chemical-engineering-and-biotechnology-2027-autumn');
  const cmp = cutoffComparison(chem.admission.historicalCutoffs[0], 27, index);
  check('AAU Chemical Engineering\x27s 3.3 reads "any IB Diploma clears it", not a sub-Diploma total',
    cmp.anyDiploma && cmp.points === null && cmp.you === 'You: 27 · any IB Diploma clears it', JSON.stringify(cmp));
  eq('a 10.7 cut-off beside 34 points reads as the comparison', cutoffComparison({ value: '10.7', scale: localScheme.gradeScale.id }, 34, index).you, 'You: 34 · last cut-off: 40');

  /* Round 5 guards, across every profile and every Opportunity.
     - No summary contradicts its own gap lines about 5 July: where a gap says
       a course must be finished before 5 July, no summary says one may come
       after it.
     - No green card carries an open question: a Meets result never contains
       "Confirm with" or "formally".
     - "Possible with action" never rests on a course count the publisher does
       not allow for the student's group. */
  const contradictions = [];
  const greenQuestions = [];
  for (const [key, p] of Object.entries(P)) {
    for (const o of allOpps) {
      const r = assess(asProfile(p), o, opts);
      const mustBefore = r.gaps.some((g) => /(must have finished|must be passed|has to be passed)[^.]*before 5 July|before you are admitted/.test(g.message));
      if (mustBefore && /after 5 July|after it\b/.test(r.actionSummary || '')) contradictions.push(`${key} ${o.id}: ${r.actionSummary}`);
      if (r.outcome === OUTCOME.MEETS && r.matched.some((m) => /Confirm with|formally/.test(m.message))) greenQuestions.push(`${key} ${o.id}`);
    }
  }
  check('no summary line contradicts its own gap lines about 5 July', contradictions.length === 0, contradictions.slice(0, 3).join(' | '));
  check('no Meets result contains "Confirm with" or "formally"', greenQuestions.length === 0, greenQuestions.slice(0, 5).join(', '));

  /* Verification after round 5 (verification-after-round-5.md, 7/10).
     1. The national one-course-after-the-results applies only "where the
        programme accepts it": nothing records VIA, AAU or Absalon doing so. */
  const permissionless = [];
  for (const [key, p] of Object.entries(P)) {
    for (const o of allOpps) {
      const r = assess(asProfile(p), o, opts);
      if (r.outcome !== OUTCOME.POSSIBLE) continue;
      for (const g of r.gaps) for (const a of g.actions || []) {
        if (a.kind === 'raise' && /where the programme accepts it/.test(a.text) && !Number.isInteger(a.afterResults)) permissionless.push(`${key} ${o.id}`);
        if (a.kind === 'raise' && !Number.isInteger(a.afterResults)) permissionless.push(`${key} ${o.id} (count not recorded)`);
      }
    }
  }
  check('no "possible with action" rests on a course count nobody has recorded', permissionless.length === 0, permissionless.slice(0, 5).join(', '));
  for (const [key, id] of [['p1', 'dk-via-global-business-engineering-beng'], ['p5', 'dk-via-global-business-engineering-beng'], ['p7', 'dk-via-global-business-engineering-beng'],
    ['p2', 'dk-aau-applied-industrial-electronics'], ['p2', 'dk-absalon-robot-systems-beng'], ['p2', 'dk-via-software-technology-engineering-beng'], ['p2', 'dk-via-software-technology-engineering-xr-beng']]) {
    const r = run(key, id);
    check(`${key} at ${id} is not "possible": whether it accepts summer supplementation is not recorded`,
      r.outcome !== OUTCOME.POSSIBLE && r.outcome !== OUTCOME.MEETS, msgs(r));
  }
  check('and the card says what is not recorded', /accepts summer supplementation is not recorded/.test(run('p2', 'dk-aau-applied-industrial-electronics').actionSummary || ''),
    run('p2', 'dk-aau-applied-industrial-electronics').actionSummary);

  /* 2. "Your way in is quota 2" only where the floor stays unmet whatever the
     plan does: not on a subject floor the plan's course will supply. */
  const quota2Line = (r) => r.outcome !== OUTCOME.MEETS && !r.route && (r.floors || []).some((f) => f.status === 'unmet' && f.otherRoute);
  for (const id of ['dk-au-computer-science', 'dk-au-data-science', 'dk-au-it-product-development']) {
    const r1 = run('p1', id);
    check(`P1 (34 points, Maths A from a course) at ${id} is not told its way in is quota 2`, !quota2Line(r1), JSON.stringify(r1.floors.map((f) => [f.status, f.message])));
    /* Verification 2: in the published unit, never as an IB HL grade. */
    check(`and the Maths floor says 6.0 in Mathematics A, a 7 or better from the course (${id})`,
      r1.floors.some((f) => f.status === 'unknown' && /6\.0 in Mathematics A — a 7 or better from your course/.test(f.message) && /after 5 July is not recorded/.test(f.message) && !/HL/.test(f.message)), JSON.stringify(r1.floors.map((f) => f.message)));
  }
  check('P8 (24 points, below the 28 floor) at AU CS is still told its way in is quota 2', quota2Line(run('p8', 'dk-au-computer-science')));

  /* 3. Every "Still needs a source" item is a "?" on the profiles it affects.
     The list is the one under the last "### Still needs a source" heading in
     round-5/fixes.md: one bullet per entry here, so the two cannot drift. */
  const danishLangLit = profile([...P.p9.subjects.filter((x) => x.subject !== 'danish-a-literature'), { subject: 'danish-a-lang-lit', level: 'HL', grade: 5 }],
    { totalPoints: 33, applicantGroup: 'nordic', applicantGroups: applicantGroupsOf('nordic', groupsTable) });
  const OPEN = [
    ['national-rule programmes accepting summer supplementation', () => run('p2', 'dk-aau-applied-industrial-electronics'), /accepts summer supplementation is not recorded/],
    ['AU after 5 July for applicants outside the EU/EEA', () => run('p7', 'dk-au-computer-science'), /outside the EU\/EEA is not recorded/],
    ['Maastricht deficiency date outside the EU/EEA', () => run('p7', 'nl-maastricht-data-science-and-artificial-intelligence'), /outside the EU\/EEA is not recorded/],
    ['SEA English-test exemption for Course Results', () => run('p6', 'dk-sea-computer-science-ap'), /whether that includes DP Course Results is not published/],
    ['a subject from nothing as one course', () => run('p1', 'dk-itu-global-business-informatics'), /from nothing|whether that can be done as one supplementary course/],
    ['Danish A Literature at SL for Danish A', () => run('p9', 'dk-itu-global-business-informatics'), /formally counts this as Danish B/],
    ['Danish A Language and Literature for Danish A', () => assess(danishLangLit, opps.get('dk-itu-global-business-informatics-2027-autumn'), opts), /names Danish A Literature, not Language and Literature/],
    // Verification 2 after round 5.
    ['AU conditional admission after 5 July in quota 2', () => run('p8', 'dk-au-computer-science'), /applies to quota 2 applicants/],
    ['SDU conditional place after 5 July in quota 2', () => run('p8', 'dk-sdu-computer-science'), /applies in quota 2/],
    ['Maastricht English exemption for IB Diploma holders', () => run('p1', 'nl-maastricht-international-business'), /could not be captured as a quoted sentence/],
  ];
  for (const [name, get, said] of OPEN) {
    const r = get();
    const lines = [r.actionSummary || '', ...r.gaps.map((g) => g.message), ...r.unknowns.map((u) => u.message), ...r.floors.map((f) => f.message)];
    check(`needs a source → "?": ${name}`, r.outcome === OUTCOME.NEEDS_REVIEW || r.outcome === OUTCOME.DOES_NOT_MEET, r.outcome);
    check(`and the open question is said: ${name}`, lines.some((m) => said.test(m)), msgs(r));
  }
  for (const id of ['dk-au-computer-science', 'dk-au-data-science', 'dk-au-it-product-development', 'dk-via-global-business-engineering-beng', 'nl-maastricht-data-science-and-artificial-intelligence']) {
    eq(`P7 (outside the EU/EEA) at ${id} is Needs review`, run('p7', id).outcome, OUTCOME.NEEDS_REVIEW);
  }
  {
    const fixes = await fs.readFile(path.join(ROOT, 'docs', 'research', 'qa', 'conversion', 'round-5', 'fixes.md'), 'utf8');
    const at = fixes.lastIndexOf('### Still needs a source');
    const section = at < 0 ? '' : fixes.slice(at).split('\n').slice(1).join('\n').split(/\n#{2,3} /)[0];
    const bullets = section.split('\n').filter((l) => /^- /.test(l)).length;
    eq('fixes.md\x27s last "Still needs a source" list has one bullet per open question the tests hold as a "?"', bullets, OPEN.length);
  }

  /* 4. The caution leads, and no "possible" card says "confirm with". */
  const cautionLeads = [];
  const hedged = [];
  for (const [key, p] of Object.entries(P)) {
    for (const o of allOpps) {
      const r = assess(asProfile(p), o, opts);
      for (const u of r.unknowns) {
        const lead = u.message.split(/\.(?=\s+[A-Z(])/)[0];
        if (/formally|not established/.test(u.message) && /counts as/.test(lead)) cautionLeads.push(`${key} ${o.id}: ${lead}`);
      }
      if (r.outcome === OUTCOME.POSSIBLE && r.gaps.some((g) => /confirm with/i.test(g.message))) hedged.push(`${key} ${o.id}`);
    }
  }
  check('a caution\x27s visible lead is the caution, never "counts as"', cautionLeads.length === 0, cautionLeads.slice(0, 3).join(' | '));
  check('no "possible with action" gap says "confirm with"', hedged.length === 0, hedged.slice(0, 5).join(', '));
  eq('P5 at ITU Data Science is possible through the test (ITU\x27s sentence is unconditional)', run('p5', 'dk-itu-data-science').outcome, OUTCOME.POSSIBLE);

  /* 6. Every "possible" card has a one-line step; a test keeps its date. */
  const stepless = [];
  for (const [key, p] of Object.entries(P)) {
    for (const o of allOpps) {
      const r = assess(asProfile(p), o, opts);
      if (r.outcome === OUTCOME.POSSIBLE && !r.actionSummary) stepless.push(`${key} ${o.id}`);
    }
  }
  check('every "possible with action" result has a one-line step', stepless.length === 0, stepless.slice(0, 5).join(', '));
  check('CBS\x27s step keeps "by 5 July, 12:00"', /by 5 July, 12:00/.test(run('p5', 'dk-cbs-international-business').actionSummary || '') && /by 5 July, 12:00/.test(run('p1', 'dk-cbs-international-business').actionSummary || ''),
    JSON.stringify([run('p5', 'dk-cbs-international-business').actionSummary, run('p1', 'dk-cbs-international-business').actionSummary]));

  /* Verification 2 after round 5 (verification-2-after-round-5.md, 7/10). */
  {
    const everyResult = [];
    for (const [key, p] of Object.entries(P)) for (const o of allOpps) everyResult.push([key, o, assess(asProfile(p), o, opts)]);

    /* 1. Below a floor that leaves only quota 2 open, a plan that needs a
       course after the results is a question: no record joins the two. */
    for (const id of ['dk-au-computer-science', 'dk-au-data-science', 'dk-au-it-product-development']) {
      const r = run('p8', id);
      eq(`P8 (24 points, only quota 2 open) at ${id} is Needs review`, r.outcome, OUTCOME.NEEDS_REVIEW);
      check(`and asks whether AU's after-5-July admission applies in quota 2 (${id})`, /applies to quota 2 applicants/.test(r.actionSummary || ''), r.actionSummary);
    }
    for (const id of ['dk-sdu-computer-science', 'dk-sdu-artificial-intelligence', 'dk-sdu-software-engineering-sonderborg']) {
      check(`P8 at ${id} is not "possible" on a course the quota 2 route is not recorded as taking`, run('p8', id).outcome !== OUTCOME.POSSIBLE, run('p8', id).outcome);
    }
    const joined = everyResult.filter(([, , r]) => r.outcome === OUTCOME.POSSIBLE &&
      (r.floors || []).some((f) => f.status === 'unmet' && f.otherRoute) &&
      r.gaps.some((g) => (g.actions || []).some((a) => a.kind === 'raise' && a.quota2AfterResults !== true)));
    check('no "possible" joins an after-results course to a quota 2 route no record joins', joined.length === 0, joined.slice(0, 4).map(([k, o]) => `${k} ${o.id}`).join(', '));

    /* 2. A requirement the record could not quote is never a tick. */
    const UNQUOTED = /rests on a pattern|could not be captured|not on a quoted sentence/i;
    const ticked = [];
    for (const [key, o, r] of everyResult) {
      const ids = new Set(rulesOf(o.requirements).filter((x) => UNQUOTED.test(x.note || '')).map((x) => x.id));
      if (r.matched.some((m) => ids.has(m.id))) ticked.push(`${key} ${o.id}`);
    }
    check('no requirement whose note says it rests on a pattern (no quoted sentence) is ever met', ticked.length === 0, ticked.slice(0, 5).join(', '));
    check('and such a requirement is never satisfiedBy', !allOpps.some((o) => rulesOf(o.requirements).some((x) => UNQUOTED.test(x.note || '') && (x.satisfiedBy || []).length)));
    check('P5 at Maastricht DSAI is not green on an unquoted English exemption', run('p5', 'nl-maastricht-data-science-and-artificial-intelligence').outcome !== OUTCOME.MEETS);

    /* 3. A bare "N of them" is said only where every count is recorded. */
    const bare = everyResult.filter(([, , r]) => /(^|[^t] )\d+ of them/.test((r.actionSummary || '').replace(/At least \d+ of them/g, '')) &&
      r.gaps.some((g) => (g.actions || []).some((a) => a.kind === 'raise' && !Number.isInteger(a.afterResults))));
    check('no "For 2027" line gives a bare "N of them" on an unrecorded count', bare.length === 0, bare.slice(0, 3).map(([k, o, r]) => `${k} ${o.id}: ${r.actionSummary}`).join(' | '));

    /* 4. A floor a course supplies is never said as an IB grade. */
    const ibUnit = everyResult.filter(([, , r]) => (r.floors || []).some((f) => f.fromCourse && /\bHL\b|\bSL\b/.test(f.message)));
    check('no floor the plan\x27s course supplies is said in IB grades', ibUnit.length === 0, ibUnit.slice(0, 3).map(([k, o]) => `${k} ${o.id}`).join(', '));

    /* 6. Every "Needs review" card says what to check; nothing is said twice. */
    const silent = everyResult.filter(([, , r]) => r.outcome === OUTCOME.NEEDS_REVIEW && !r.actionSummary);
    check('every "Needs review" result has a one-line "To check"', silent.length === 0, silent.slice(0, 4).map(([k, o]) => `${k} ${o.id}`).join(', '));
    const um7 = run('p7', 'nl-maastricht-data-science-and-artificial-intelligence');
    check('P7 at Maastricht says its deadline once in the "To check" line', (um7.actionSummary.match(/1 June 2027/g) || []).length <= 1, um7.actionSummary);

    /* 7. Dates in the step. */
    check('AU\x27s one-line step names 5 July and 5 September', /5 July/.test(run('p1', 'dk-au-computer-science').actionSummary || '') && /5 September/.test(run('p1', 'dk-au-computer-science').actionSummary || ''), run('p1', 'dk-au-computer-science').actionSummary);
    check('ITU\x27s test step keeps "on 5 July"', /on 5 July/.test(run('p5', 'dk-itu-data-science').actionSummary || ''), run('p5', 'dk-itu-data-science').actionSummary);

    /* 8. ITU GBI without Danish: ITU's own sentence leads. */
    check('P1 at ITU GBI leads with ITU: only Data Science is open to international students', /^ITU's own BSc overview page: "only the programme in Data Science/.test(run('p1', 'dk-itu-global-business-informatics').actionSummary || ''), run('p1', 'dk-itu-global-business-informatics').actionSummary);
  }

  /* 7. SEA exempts IB holders from the English test, not from English B. */
  for (const id of ['dk-sea-computer-science-ap', 'dk-sea-multimedia-design-ap']) {
    const english = rulesOf(opps.get(`${id}-2027-autumn`).requirements).find((r) => r.subject === 'English');
    check(`${id}: English B is required of IB holders (the exemption is from the test)`, !(english?.satisfiedBy || []).includes('ib-diploma'), JSON.stringify(english));
  }
}

/* --- and the engine may not learn any destination's vocabulary -------------- *
 *
 * The same guard scripts/test-credentials.mjs, test-floor.mjs, test-calendar.mjs
 * and test-jurisdictions.mjs already carry, pointed at the one module that
 * decides whether a student is told yes or no.
 *
 * The forbidden words are read out of the data rather than listed here, so the
 * guard grows on its own: add a Destination and its name is forbidden from that
 * moment; add a Recognition Scheme and the adjective its scales are named with
 * is forbidden too. Every difference between one jurisdiction and another has
 * to be a difference in the records, and this is what makes that a fact rather
 * than an intention.
 */
{
  const engine = await fs.readFile(path.join(ROOT, 'src', 'lib', 'eligibility.mjs'), 'utf8');

  /* Two kinds of forbidden thing, looked for in two different places.
   *
   * A CODE is two letters, and half of them are ordinary English words — at,
   * be, is, it, no, in, so, me. Searching prose for those finds a hundred
   * sentences and nothing else, and a guard that cries wolf gets switched off.
   * A code only becomes a country when it is an identifier, so codes are looked
   * for inside string literals and property accesses, which is the only way one
   * can reach the engine's behaviour.
   *
   * A NAME or a nationality is long enough to mean one thing, so it is
   * forbidden anywhere at all, comments included. A comment that explains the
   * rules by naming one country is how the next person learns that naming
   * countries here is normal. */
  const codes = new Map();
  const words = new Map();

  const addCode = (term, source) => {
    const t = String(term ?? '').trim().toLowerCase();
    if (/^[a-z]{2}$/.test(t) && !codes.has(t)) codes.set(t, source);
  };
  const addWord = (term, source) => {
    const t = String(term ?? '').trim().toLowerCase();
    if (t.length >= 4 && !words.has(t)) words.set(t, source);
  };

  for (const dir of ['countries', 'destinations']) {
    let files = [];
    try { files = (await fs.readdir(path.join(ROOT, 'data', dir))).filter((f) => f.endsWith('.json')); } catch {}
    for (const f of files) {
      const record = JSON.parse(await fs.readFile(path.join(ROOT, 'data', dir, f), 'utf8'));
      addCode(record.code || record.id, `data/${dir}/${f}`);
      addWord(record.name, `data/${dir}/${f}`);
    }
  }
  for (const s of schemes) {
    const source = `data/recognition (${s.id})`;
    addCode(s.destination, source);
    for (const id of [s.subjectScale?.id, s.gradeScale?.id]) {
      addWord(id, source);
      // A scale id carries its country in front of it: the leading segment of
      // "dk-abc" is how a jurisdiction gets into code without being named.
      addCode(String(id ?? '').split('-')[0], source);
    }
    // The adjective a scheme names its own scales with — "Danish", "Dutch".
    // Scale names are short and controlled, so this harvests the nationality
    // and little else.
    for (const name of [s.subjectScale?.name, s.gradeScale?.name]) {
      for (const word of String(name ?? '').match(/\b[A-Z][a-z]{3,}\b/g) || []) addWord(word, source);
    }
  }

  const lineOf = (i) => engine.slice(0, i).split('\n').length;
  const found = [];

  /* Every string literal and property access in the code, comments skipped.
   * An apostrophe in English prose is not a quote, so the comments have to come
   * out before anything looks for one — and a literal with a space in it is a
   * sentence, not an identifier. "no" in "No equivalent is published" is not
   * a country; `'no-abc'` would be. */
  for (const { text, index, raw } of identifiers(engine)) {
    if (/\s/.test(text)) continue;
    for (const token of text.toLowerCase().split(/[^a-z0-9]+/)) {
      if (codes.has(token)) {
        found.push(`line ${lineOf(index)}: ${raw} carries the country code "${token}" (${codes.get(token)})`);
      }
    }
  }

  for (const [term, source] of words) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    for (const m of engine.matchAll(new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'gi'))) {
      found.push(`line ${lineOf(m.index)}: "${m[0]}" — a destination's own vocabulary, from ${source}`);
    }
  }

  // And the shape test-credentials.mjs looks for, in case a code arrives that
  // no record happens to hold yet.
  for (const m of engine.matchAll(/(?:destination|country|dest)\w*\s*===\s*['"][a-z]{2}['"]/g)) {
    found.push(`line ${lineOf(m.index)}: a comparison against a literal country code: ${m[0]}`);
  }

  check(
    'no country appears in the eligibility engine',
    found.length === 0,
    `\n          ${found.join('\n          ')}`
  );
  check(
    `the guard is looking for ${codes.size} country codes and ${words.size} names, which is more than nothing`,
    codes.size > 20 && words.size > 20
  );

  // And it has to be able to see one. A guard nobody has watched fail is a
  // comment.
  {
    const code = [...codes.keys()][0];
    const planted = `${engine}\nconst scale = '${code}-abc';\nconst n = record.${code};\n`;
    let caught = 0;
    for (const { text } of identifiers(planted)) {
      if (/\s/.test(text)) continue;
      for (const token of text.toLowerCase().split(/[^a-z0-9]+/)) if (codes.has(token)) caught++;
    }
    check('the guard catches a country code planted in the engine', caught === 2, `caught ${caught}`);
  }
}

/* --- applicant groups: containment is data, not code ------------------------
 *
 * A Nordic citizen is also an EU/EEA citizen. Before data/applicant-groups.json
 * the engine compared groups with ===, so the moment the subject checker offered
 * "Nordic citizen" a Norwegian would have been marked as failing every rule
 * written for EU/EEA citizens. The table is read from disk so the real
 * declaration is what is tested; the rule fixtures use the schema's group ids. */

{
  const table = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'applicant-groups.json'), 'utf8')).groups;
  const withGroup = (g) => profile([], { applicantGroup: g, applicantGroups: applicantGroupsOf(g, table) });
  const statusRule = (group) => ({
    ...engineering,
    requirements: [{ id: 'c1', kind: 'citizenship', mandatory: true, label: 'Fee group', applicability: { applicantGroup: group }, evidence: ['ev-test'] }],
  });
  const outcomeOf = (g, ruleGroup) => {
    const r = assess(withGroup(g), statusRule(ruleGroup), { ...options, evidenceStatus: verified });
    return [...r.matched, ...r.gaps, ...r.unknowns].find((x) => x.id === 'c1') && (r.matched.some((x) => x.id === 'c1') ? 'met' : r.gaps.some((x) => x.id === 'c1') ? 'unmet' : 'unknown');
  };
  check('every group in the table is a schema applicantGroup', table.every((g) => ['eu-eea-ch', 'nordic', 'domestic', 'non-eu'].includes(g.id)));
  eq('a Nordic citizen meets a rule for EU/EEA citizens', outcomeOf('nordic', 'eu-eea-ch'), 'met');
  eq('a Nordic citizen meets a rule for Nordic citizens', outcomeOf('nordic', 'nordic'), 'met');
  eq('an EU/EEA citizen does not meet a rule for Nordic citizens', outcomeOf('eu-eea-ch', 'nordic'), 'unmet');
  eq('containment does not run backwards: non-EU is not EU/EEA', outcomeOf('non-eu', 'eu-eea-ch'), 'unmet');
  eq('a profile with no expansion still matches its own group', assess(profile([], { applicantGroup: 'nordic' }), statusRule('nordic'), { ...options, evidenceStatus: verified }).matched.some((x) => x.id === 'c1'), true);
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
