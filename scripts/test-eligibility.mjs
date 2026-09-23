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
  assess, buildSubjectIndex, convertAverage, convertGrade, entryAward, ENTRY_AWARD, OUTCOME,
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
  check('and it shows the translation rather than asserting it',
    /counts as/.test(r.gaps[0].message), r.gaps[0].message);
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
  eq('one IB grade short is possible with action, not a rejection', short.outcome, OUTCOME.POSSIBLE);
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

  const noTotal = profile(subjects, { holdsDiploma: false });
  eq(
    'a missing total is a question, not a pass',
    assess(noTotal, openToCourseResults, awardOpts).outcome,
    OUTCOME.NEEDS_REVIEW
  );

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

/* --- report ------------------------------------------------------------------ */

console.log('');
if (failures.length) {
  console.log(`${failures.length} failing scenario(s):`);
  for (const f of failures) console.log(`  ✗ ${f}`);
  console.log(`\n${passed} passed, ${failures.length} failed\n`);
  process.exit(1);
}
console.log(`All ${passed} eligibility scenarios pass.\n`);
