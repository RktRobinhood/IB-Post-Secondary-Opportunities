import fs from 'node:fs/promises';
import path from 'node:path';
import { collection } from './lib/records.mjs';
import {
  applicantGroupsOf, assess, buildSubjectIndex, convertAverage, convertGrade, cutoffComparison, entryAward, ENTRY_AWARD, floorTerms, ibPointsFor, ibTermsFor,
  levelRaiseFor, OUTCOME, reasonParts, splitLead,
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

const catalogue = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'ib-subjects.json'), 'utf8'));

const recognitionDir = path.join(ROOT, 'data', 'recognition');
const schemes = [];
for (const f of (await fs.readdir(recognitionDir)).filter((x) => x.endsWith('.json'))) {
  schemes.push(JSON.parse(await fs.readFile(path.join(recognitionDir, f), 'utf8')));
}

const localScheme = schemes.find((s) => s.destination === 'dk');
const LOCAL_SCALE = localScheme.subjectScale.id;
const conversion = {
  single: localScheme.gradeConversion.single.table,
  average: localScheme.gradeConversion.average.table,
};

const subjectIndex = buildSubjectIndex({ subjects: catalogue.subjects, schemes });
const options = { subjectIndex, dataVersion: 'test' };

const ibOnlyIndex = buildSubjectIndex(catalogue.subjects);
const ibOnlyOptions = { subjectIndex: ibOnlyIndex, dataVersion: 'test' };

const req = (id, subject, level, extra = {}) => ({
  id, kind: 'local-equivalency', mandatory: true, levelScale: LOCAL_SCALE, subject, level,
  label: `${subject} ${level}`, evidence: ['ev-test'], ...extra,
});

const ibReq = (id, ibSubject, ibLevel, extra = {}) => ({
  id, kind: 'ib-subject', mandatory: true, ibSubject, ibLevel,
  label: `${ibSubject} ${ibLevel}`, evidence: ['ev-test'], ...extra,
});

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

eq('34 points converts to a local average of 8.5', convertAverage(34, conversion.average), 8.5);
eq('45 points converts to 12.7', convertAverage(45, conversion.average), 12.7);
eq('an IB 5 converts to a local 7', convertGrade(5, conversion.single), 7);
eq('an IB 3 converts to a local 2', convertGrade(3, conversion.single), 2);
eq('an unpublished total returns nothing', convertAverage(17, conversion.average), null);

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
  eq('Maths SL against a Maths A requirement, with no recorded summer supplementation, is Needs review', r.outcome, OUTCOME.NEEDS_REVIEW);
  check('and the To check line says the permission is not recorded', r.actionLead === 'To check' && /accepts summer supplementation is not recorded/.test(r.actionSummary || ''), r.actionSummary);
  eq('exactly one gap is reported', r.gaps.length, 1);
  check('the gap leads with the IB level it needs', /^This needs Maths HL \(AA or AI\)/.test(r.gaps[0].message), r.gaps[0].message);
  check('and names the requirement as published', /Mathematics A\.\)$/.test(r.gaps[0].message), r.gaps[0].message);
  check('and it shows the translation rather than asserting it',
    /counts only as Mathematics at B level/.test(r.gaps[0].message), r.gaps[0].message);
}

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

{
  const pointsRule = {
    id: 'opp-points', destination: 'dk', intake: '2027-autumn', meta: {}, evidence: ['ev-test'],
    requirements: [
      { id: 'r1', kind: 'ib-total-points', mandatory: true, minPoints: 32, label: '32 points overall', evidence: ['ev-test'] },
    ],
  };
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

{
  const opportunities = collection('opportunities');
  check('real school intakes are loaded', opportunities.length > 0);
  if (opportunities.length) {

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

  const later = opp([{ ...gated.requirements[0], alternativeRouteSummary: { short: 'Two further subjects raised in level.', reachesAtEighteen: true } }]);
  const laterResult = assess(courseCandidate(), later, awardOpts);
  eq('a route not recorded as completable for this intake is not possible with action', laterResult.outcome, OUTCOME.DOES_NOT_MEET);
  check('and says why, for 2027', laterResult.actionLead === 'For 2027' && /2027 intake/.test(laterResult.actionSummary || ''), JSON.stringify([laterResult.actionLead, laterResult.actionSummary]));

  const aged = opp([{ ...gated.requirements[0], alternativeRouteSummary: { short: 'From 21: a colloquium doctum.', reachesAtEighteen: false } }]);
  const agedResult = assess(courseCandidate(), aged, awardOpts);
  eq('a route that opens only at 21 does not make it possible with action', agedResult.outcome, OUTCOME.DOES_NOT_MEET);
  check('but the route is still said', agedResult.gaps.some((g) => /raised in level/.test(g.message)), JSON.stringify(agedResult.gaps.map((g) => g.message)));
  const unsummarised = opp([{ ...gated.requirements[0], alternativeRouteSummary: undefined }]);
  eq('nor does a route whose record does not say it opens before 21', assess(courseCandidate(), unsummarised, awardOpts).outcome, OUTCOME.DOES_NOT_MEET);

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
    silentForCandidate.unknowns.some((u) => /confirm which qualification route/i.test(u.message)),
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

  {
    const records = collection('opportunities');

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

{
  const institutions = collection('institutions');
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
    const alone = assess(gpSL, opp(withRoutes.id), opts);
    check('Global Politics SL alone does not meet it', alone.outcome !== OUTCOME.MEETS && alone.outcome !== OUTCOME.POSSIBLE, alone.outcome);
    eq('Global Politics SL with Economics does', assess(gpSLecon, opp(withRoutes.id), opts).outcome, OUTCOME.MEETS);
    const t = ibTermsFor(req('r1', 'Social Studies', 'B'), index, withRoutes.id);
    check('and the wording names the route, not "no IB equivalent"', !!t.phrase && !t.none && /Global Politics HL/.test(t.phrase), JSON.stringify(t));
  }
  eq('elsewhere Global Politics HL is still a question for the institution',
    assess(gpHL, opp('dk-test-elsewhere'), opts).outcome, OUTCOME.NEEDS_REVIEW);
}

{
  const t = ibTermsFor(req('r1', 'Contemporary History', 'B'), subjectIndex);
  eq('Contemporary History B reads as History HL (the handbook\'s History A row)', t.phrase, 'History HL');
}

eq('a 10.7 cut-off is 40 IB points', ibPointsFor('10.7', localScheme.gradeScale.id, subjectIndex), 40);
eq('a 6.9 cut-off is 30 IB points', ibPointsFor(6.9, localScheme.gradeScale.id, subjectIndex), 30);
eq('a figure on an unknown scale is not converted', ibPointsFor(10.7, 'no-such-scale', subjectIndex), null);
eq('a figure above the table is not converted', ibPointsFor(13, localScheme.gradeScale.id, subjectIndex), null);

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

{
  const readDir = async (d) => collection(d);
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

{
  const readDir = async (d) => collection(d);
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

  const gbi = run('p1', 'dk-itu-global-business-informatics');
  eq('P1 at ITU Global Business Informatics (no Danish at all) is Needs review, not one course', gbi.outcome, OUTCOME.NEEDS_REVIEW);
  const danish = gbi.gaps.find((g) => /Danish A/.test(g.message));
  check('the Danish A gap quotes ITU: only Data Science is open to international students', /only the programme in Data Science is open to international students/.test(danish?.message || ''), msgs(gbi));
  check('and says nothing about Mathematics', !/Mathematics|Maths/.test(danish?.message || 'x'), danish?.message);
  check('ITU\x27s Danish action is its own Danish sentence', /supplementary course in Danish level A/.test(levelRaiseFor({ subject: 'Danish', level: 'A', levelScale: LOCAL_SCALE }, index, 'dk-itu', { applicantGroup: 'eu-eea-ch' })?.text || ''));
  eq('P7 (outside the EU/EEA) at ITU GBI does not currently meet for 2027', run('p7', 'dk-itu-global-business-informatics').outcome, OUTCOME.DOES_NOT_MEET);
  const itds = run('p1', 'dk-itu-data-science');
  check('the Maths gap at ITU still names ITU\x27s Maths routes', /University of Amsterdam/.test(itds.gaps[0]?.message || ''), msgs(itds));

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

  const sea = run('p6', 'dk-sea-computer-science-ap');
  check('P6 (Course Results, six grades, no total) at SEA Computer Science clears the Course Results conditions',
    sea.matched.some((m) => /grades add up to 33/.test(m.message)), msgs(sea));
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
        if (!g.actions?.length || !g.actions.every((a) => a.text) || !/To close it:|The other published way|It does not close this one to you|One step closes both/.test(g.message)) {
          actionless.push(`${key} ${o.id}: ${g.message.slice(0, 90)}`);
        }
      }
    }
  }
  check('every gap of every "possible with action", for all nine round-4 profiles, names its step', actionless.length === 0, actionless.slice(0, 4).join(' | '));

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

  const sduNon = run('p7', 'dk-sdu-computer-science');
  check('P7 (outside the EU/EEA) at SDU is told to finish before 5 July, not offered 31 August',
    /before 5 July/.test(sduNon.gaps[0]?.message || '') && !/31 August/.test(sduNon.gaps[0]?.message || ''), msgs(sduNon));
  eq('and one course that must come before the results is not possible for 2027', sduNon.outcome, OUTCOME.DOES_NOT_MEET);
  for (const id of ['dk-sdu-electronics-sonderborg', 'dk-sdu-electronics-beng', 'dk-sdu-engineering-innovation-and-business',
    'dk-sdu-interactive-technology-engineering', 'dk-sdu-mechatronics-sonderborg', 'dk-sdu-mechatronics-beng', 'dk-sdu-computer-science']) {
    const r = run('p7', id);
    check(`P7 at ${id}: no line says anything may come after 5 July`,
      ![r.actionSummary || '', ...r.gaps.map((g) => g.message)].some((m) => /after 5 July/.test(m)), msgs(r));
  }
  check('an EU/EEA student at SDU is still offered 31 August', /31 August/.test(run('p1', 'dk-sdu-computer-science').gaps[0]?.message || ''));
  const ituNon = run('p7', 'dk-itu-data-science');
  check('P7 at ITU is told conditional admission is not open to them', /not fee-exempt|without fee exemption/.test(ituNon.gaps[0]?.message || '') && !/1 September/.test(ituNon.gaps[0]?.message || ''), msgs(ituNon));

  const chem = opps.get('dk-aau-chemical-engineering-and-biotechnology-2027-autumn');
  const cmp = cutoffComparison(chem.admission.historicalCutoffs[0], 27, index);
  check('AAU Chemical Engineering\x27s 3.3 reads "any IB Diploma clears it", not a sub-Diploma total',
    cmp.anyDiploma && cmp.points === null && cmp.you === 'You: 27 · any IB Diploma clears it', JSON.stringify(cmp));
  eq('a 10.7 cut-off beside 34 points reads as the comparison', cutoffComparison({ value: '10.7', scale: localScheme.gradeScale.id }, 34, index).you, 'You: 34 · last cut-off: 40');

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

  const quota2Line = (r) => r.outcome !== OUTCOME.MEETS && !r.route && (r.floors || []).some((f) => f.status === 'unmet' && f.otherRoute);
  for (const id of ['dk-au-computer-science', 'dk-au-data-science', 'dk-au-it-product-development']) {
    const r1 = run('p1', id);
    check(`P1 (34 points, Maths A from a course) at ${id} is not told its way in is quota 2`, !quota2Line(r1), JSON.stringify(r1.floors.map((f) => [f.status, f.message])));
    check(`and the Maths floor says 6.0 in Mathematics A, a 7 or better from the course (${id})`,
      r1.floors.some((f) => f.status === 'unknown' && /6\.0 in Mathematics A: a 7 or better from your course/.test(f.message) && /after 5 July is not recorded/.test(f.message) && !/HL/.test(f.message)), JSON.stringify(r1.floors.map((f) => f.message)));
  }
  check('P8 (24 points, below the 28 floor) at AU CS is still told its way in is quota 2', quota2Line(run('p8', 'dk-au-computer-science')));

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

  {
    const everyResult = [];
    for (const [key, p] of Object.entries(P)) for (const o of allOpps) everyResult.push([key, o, assess(asProfile(p), o, opts)]);

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

    const UNQUOTED = /rests on a pattern|could not be captured|not on a quoted sentence/i;
    const ticked = [];
    for (const [key, o, r] of everyResult) {
      const ids = new Set(rulesOf(o.requirements).filter((x) => UNQUOTED.test(x.note || '')).map((x) => x.id));
      if (r.matched.some((m) => ids.has(m.id))) ticked.push(`${key} ${o.id}`);
    }
    check('no requirement whose note says it rests on a pattern (no quoted sentence) is ever met', ticked.length === 0, ticked.slice(0, 5).join(', '));
    check('and such a requirement is never satisfiedBy', !allOpps.some((o) => rulesOf(o.requirements).some((x) => UNQUOTED.test(x.note || '') && (x.satisfiedBy || []).length)));
    check('P5 at Maastricht DSAI is not green on an unquoted English exemption', run('p5', 'nl-maastricht-data-science-and-artificial-intelligence').outcome !== OUTCOME.MEETS);

    const bare = everyResult.filter(([, , r]) => /(^|[^t] )\d+ of them/.test((r.actionSummary || '').replace(/At least \d+ of them/g, '')) &&
      r.gaps.some((g) => (g.actions || []).some((a) => a.kind === 'raise' && !Number.isInteger(a.afterResults))));
    check('no "For 2027" line gives a bare "N of them" on an unrecorded count', bare.length === 0, bare.slice(0, 3).map(([k, o, r]) => `${k} ${o.id}: ${r.actionSummary}`).join(' | '));

    const ibUnit = everyResult.filter(([, , r]) => (r.floors || []).some((f) => f.fromCourse && /\bHL\b|\bSL\b/.test(f.message)));
    check('no floor the plan\x27s course supplies is said in IB grades', ibUnit.length === 0, ibUnit.slice(0, 3).map(([k, o]) => `${k} ${o.id}`).join(', '));

    const silent = everyResult.filter(([, , r]) => r.outcome === OUTCOME.NEEDS_REVIEW && !r.actionSummary);
    check('every "Needs review" result has a one-line "To check"', silent.length === 0, silent.slice(0, 4).map(([k, o]) => `${k} ${o.id}`).join(', '));
    const um7 = run('p7', 'nl-maastricht-data-science-and-artificial-intelligence');
    check('P7 at Maastricht says its deadline once in the "To check" line', (um7.actionSummary.match(/1 June 2027/g) || []).length <= 1, um7.actionSummary);

    check('AU\x27s one-line step names 5 July and 5 September', /5 July/.test(run('p1', 'dk-au-computer-science').actionSummary || '') && /5 September/.test(run('p1', 'dk-au-computer-science').actionSummary || ''), run('p1', 'dk-au-computer-science').actionSummary);
    check('ITU\x27s test step keeps "on 5 July"', /on 5 July/.test(run('p5', 'dk-itu-data-science').actionSummary || ''), run('p5', 'dk-itu-data-science').actionSummary);

    check('P1 at ITU GBI leads with ITU: only Data Science is open to international students', /^ITU's own BSc overview page: "only the programme in Data Science/.test(run('p1', 'dk-itu-global-business-informatics').actionSummary || ''), run('p1', 'dk-itu-global-business-informatics').actionSummary);
  }

  for (const id of ['dk-sea-computer-science-ap', 'dk-sea-multimedia-design-ap']) {
    const english = rulesOf(opps.get(`${id}-2027-autumn`).requirements).find((r) => r.subject === 'English');
    check(`${id}: English B is required of IB holders (the exemption is from the test)`, !(english?.satisfiedBy || []).includes('ib-diploma'), JSON.stringify(english));
  }

  {
    const everyResult = [];
    for (const [key, p] of Object.entries(P)) for (const o of allOpps) everyResult.push([key, o, assess(asProfile(p), o, opts)]);
    const words = (t) => String(t).trim().split(/\s+/).length;

    const LIMIT = { gap: 20, other: 28 };
    const long = [];
    const doubled = [];
    for (const [key, o, r] of everyResult) {
      const lines = [
        ...r.gaps.flatMap((g) => reasonParts(g).map((t) => ['gap', t])),
        ...r.unknowns.flatMap((u) => reasonParts(u).map((t) => ['other', t])),
        ...r.matched.flatMap((m) => reasonParts(m).map((t) => ['other', t])),
        ...(r.floors || []).map((f) => ['other', `${f.quota}: ${f.message}`]),
      ];
      for (const [kind, t] of lines) {
        const [lead] = splitLead(t);
        if (words(lead) > LIMIT[kind]) long.push(`${key} ${o.id} (${words(lead)} words): ${lead}`);
        if ((t.match(/\bThis needs\b/g) || []).length > 1) doubled.push(`${key} ${o.id}: ${t.slice(0, 120)}`);
      }
    }
    check(`every ✗ lead is at most ${LIMIT.gap} words and every other lead at most ${LIMIT.other}`, long.length === 0, long.slice(0, 4).join(' | '));
    if (process.env.DEBUG_LEADS) console.log([...new Set(long.map((l) => l.replace(/^\S+ \S+ /, '')))].join('\n'));
    check('no reason line holds two missing subjects ("This needs … This needs")', doubled.length === 0, doubled.slice(0, 3).join(' | '));
    const chem = run('p1', 'dk-aau-chemical-engineering-and-biotechnology');
    const combo = chem.gaps.find((g) => /Physics/.test(g.message) && /Chemistry/.test(g.message));
    check('P1 at AAU Chemical Engineering shows Physics and Chemistry as two lines', combo?.parts?.length === 2 && /Physics/.test(combo.parts[0]) && /Chemistry/.test(combo.parts[1]), JSON.stringify(combo?.parts || combo?.message));
    check('and the combination note stays with the last line', /None of the 3 accepted combinations/.test(combo?.parts?.[1] || ''), combo?.parts?.[1]);
    check('splitLead keeps every word', (() => { const t = 'This needs X. Your Y counts as Z. (Danish requirement.)'; const [a, b] = splitLead(t); return `${a} ${b}` === t; })());

    for (const id of ['dk-cbs-international-business', 'dk-cbs-business-administration-and-sociology', 'dk-cbs-international-shipping-and-trade']) {
      const r = run('p5', id);
      const g = r.gaps.find((x) => x.id === 'req-english-language');
      const closes = (g?.message || '').indexOf('One step closes both');
      const other = (g?.message || '').indexOf('other published way');
      check(`P5 at ${id}: the English A gap names the Cambridge step that closes both before the test route`, closes > 0 && /Cambridge C1/.test(g.message.slice(closes)) && (other < 0 || closes < other), g?.message);
    }
    check('P1 at CBS (no English B gap) still offers the IELTS route on the English A gap', /other published way in: An English test on top of English B/i.test(run('p1', 'dk-cbs-international-business').gaps.find((x) => x.id === 'req-english-language')?.message || ''));

    const evById = new Map(collection('evidence').map((e) => [e.id, e]));
    const unsourced = [];
    const cite = (where, refs) => {
      const sources = (refs || []).map((id) => typeof id === 'object' ? id : evById.get(id));
      if (!sources.length || sources.some((e) => !e || !(e.sourceUrl || e.url) || !(e.retrievedAt || e.checked))) unsourced.push(where);
    };
    for (const inst of institutions.filter((i) => i.levelRaise)) cite(inst.id + ' levelRaise', inst.levelRaise.evidence);
    for (const o of allOpps) for (const r of rulesOf(o.requirements)) if (r.alternativeTest) cite(o.id + ' ' + r.id, r.alternativeTest.evidence);
    check('every supplementary-course rule and alternative test has a dated source', unsourced.length === 0, unsourced.slice(0, 5).join(' | '));
    const before = unsourced.length;
    cite('planted missing source', ['missing-source']);
    check('the source guard catches a missing reference', unsourced.length > before);
  }
}

{
  const readDir = async (d) => collection(d);
  const institutions = await readDir('institutions');
  const allOpps = await readDir('opportunities');
  const opps = new Map(allOpps.map((o) => [o.id, o]));
  const groupsTable = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'applicant-groups.json'), 'utf8')).groups;
  const index = buildSubjectIndex({ subjects: catalogue.subjects, schemes, institutions, diplomaMinimumPoints: catalogue.diplomaMinimumPoints });
  const opts = { subjectIndex: index, dataVersion: 'test', evidenceStatus: verified };
  const qa = (danishLevel, group = 'eu-eea-ch') => profile([
    { subject: 'mathematics-aa', level: 'HL', grade: 6 },
    { subject: 'physics', level: 'HL', grade: 6 },
    { subject: 'english-a-literature', level: 'SL', grade: 6 },
    { subject: 'chemistry', level: 'HL', grade: 6 },
    ...(danishLevel ? [{ subject: 'danish-b', level: danishLevel, grade: 6 }] : []),
    { subject: 'economics', level: 'SL', grade: 6 },
  ], { totalPoints: 36, applicantGroup: group, applicantGroups: applicantGroupsOf(group, groupsTable) });
  const GBI = opps.get('dk-itu-global-business-informatics-2027-autumn');
  const all = (r) => [...r.gaps, ...r.unknowns];
  const said = (r) => JSON.stringify([r.outcome, r.actionSummary, ...all(r).map((x) => x.message)]);
  const words = (t) => String(t).trim().split(/\s+/).length;

  const sl = assess(qa('SL'), GBI, opts);
  const dsl = sl.gaps.find((g) => g.id === 'req-all-3');
  const [lead] = splitLead(dsl?.message || '');
  check('QA: Danish B SL at ITU GBI is never told "your profile has none"', !all(sl).some((x) => /has none/.test(x.message)), said(sl));
  check('QA: nor asked the from-nothing question', !all(sl).some((x) => /From no Danish/.test(x.message)), said(sl));
  check('QA: the Danish A line is still a ✗ (Danish as a second language B is below Danish A)', !!dsl, said(sl));
  check('QA: its lead names what the student holds and what it counts as', /Your Danish B SL counts as Danish as a second language B/.test(lead) && /this needs Danish A/.test(lead), lead);
  check('QA: and fits a phone (a ✗ lead is at most 20 words)', words(lead) <= 20, `${words(lead)} words: ${lead}`);
  check('QA: it carries the scheme\x27s own note: the institution decides, ask in writing', /decided by each institution/.test(dsl?.message || ''), dsl?.message);
  check('QA: and names ITU\x27s own step, a supplementary course in Danish A', /supplementary course in Danish level A/.test(dsl?.message || ''), dsl?.message);
  check('QA: and says that one course from Danish as a second language B is not established', /from Danish as a second language B to Danish at A level/i.test(dsl?.message || ''), dsl?.message);
  check('QA: the step is marked uncertain', (dsl?.actions || []).length > 0 && dsl.actions.every((a) => a.uncertain), JSON.stringify(dsl?.actions));
  // A permission nobody has recorded, and a rule a person must judge: the legend's "Needs review".
  eq('QA: the verdict is Needs review — never greener without a source', sl.outcome, OUTCOME.NEEDS_REVIEW);
  check('QA: and its "To check" line asks the question', /decided by each institution/.test(sl.actionSummary || ''), sl.actionSummary);
  eq('QA: from outside the EU/EEA (no course after the results at ITU) it does not currently meet', assess(qa('SL', 'non-eu'), GBI, opts).outcome, OUTCOME.DOES_NOT_MEET);

  const hl = assess(qa('HL'), GBI, opts);
  const dhl = hl.gaps.find((g) => g.id === 'req-all-3');
  check('QA: Danish B HL is named as Danish as a second language A, not "none"', /Your Danish B HL counts as Danish as a second language A/.test(dhl?.message || '') && !all(hl).some((x) => /has none/.test(x.message)), said(hl));
  check('QA: and is not green — the Agency counts it as a different subject', hl.outcome !== OUTCOME.MEETS && hl.outcome !== OUTCOME.POSSIBLE, hl.outcome);

  const none = assess(qa(null), GBI, opts);
  check('QA: a profile with no Danish at all is still told it has none', none.gaps.some((g) => /has none/.test(g.message) && /From no Danish/.test(g.message)), said(none));

  const scheme = schemes.find((s) => s.subjectScale?.id === LOCAL_SCALE);
  const areaOf = new Map(catalogue.subjects.map((s) => [s.id, s.area || null]));
  const areasFor = (subject) => new Set(scheme.subjectEquivalence
    .filter((row) => Object.values(row.maps || {}).some((ts) => ts.some((t) => t.subject === subject)))
    .map((row) => areaOf.get(row.ibSubject)).filter(Boolean));
  const rulesOf = (rs) => (rs || []).flatMap((r) => [r, ...rulesOf((r.alternatives || []).flat())]);
  const denied = [];
  for (const variant of [['danish-b', 'SL'], ['danish-b', 'HL'], ['english-b', 'SL'], ['language-b-other', 'SL'], ['language-ab-initio', 'SL']]) {
    const p = profile([{ subject: variant[0], level: variant[1], grade: 5 }, { subject: 'mathematics-aa', level: 'HL', grade: 5 }], { totalPoints: 32 });
    const heldAreas = new Set([areaOf.get(variant[0])].filter(Boolean));
    for (const o of allOpps) {
      const r = assess(p, o, opts);
      for (const rule of rulesOf(o.requirements)) {
        if (rule.kind !== 'local-equivalency' || !rule.subject) continue;
        if (![...areasFor(rule.subject)].some((a) => heldAreas.has(a))) continue;
        const hit = all(r).find((x) => x.id === rule.id && /has none/.test(x.message));
        if (hit) denied.push(`${variant.join(' ')} at ${o.id}: ${hit.message.slice(0, 90)}`);
      }
    }
  }
  check('no student holding a course in a subject\x27s area is told they have none of it', denied.length === 0, denied.slice(0, 3).join(' | '));

  const toyCatalogue = [
    { id: 'toy-lit', name: 'Toyish A: Literature', area: 'Toyish', family: 'Toyish A', course: 'Literature', levels: ['HL', 'SL'] },
    { id: 'toy-acq', name: 'Toyish B', area: 'Toyish', levels: ['HL', 'SL'] },
  ];
  const toyScheme = {
    id: 'toy', destination: 'zz', label: 'the toy table',
    subjectScale: { id: 'zz-abc', levels: [{ code: 'A', rank: 3 }, { code: 'B', rank: 2 }, { code: 'C', rank: 1 }] },
    subjectEquivalence: [
      { ibSubject: 'toy-lit', maps: { HL: [{ subject: 'Toyish', level: 'A' }], SL: [{ subject: 'Toyish', level: 'A' }] } },
      { ibSubject: 'toy-acq', maps: { HL: [{ subject: 'Toyish second language', level: 'A' }], SL: [{ subject: 'Toyish second language', level: 'B' }] } },
    ],
  };
  const toyIndex = buildSubjectIndex({ subjects: toyCatalogue, schemes: [toyScheme] });
  const toyOpp = {
    id: 'opp-test-toy', destination: 'zz', intake: '2027-autumn', meta: { dataAsOf: '2026-09-22' }, evidence: ['ev-test'], admission: { restricted: false },
    requirements: [{ id: 't1', kind: 'local-equivalency', mandatory: true, levelScale: 'zz-abc', subject: 'Toyish', level: 'A', label: 'Toyish A', evidence: ['ev-test'] }],
  };
  const toy = assess(profile([{ subject: 'toy-acq', level: 'SL', grade: 5 }]), toyOpp, { subjectIndex: toyIndex, dataVersion: 'test', evidenceStatus: verified });
  check('toy scheme: the acquisition course is named, not "none"', /Your Toyish B SL counts as Toyish second language B; this needs/.test(toy.gaps[0]?.message || '') && !/has none/.test(toy.gaps[0]?.message || ''), said(toy));
  eq('toy scheme: with no published step it does not currently meet', toy.outcome, OUTCOME.DOES_NOT_MEET);
  const toyHl = assess(profile([{ subject: 'toy-acq', level: 'HL', grade: 5 }]), toyOpp, { subjectIndex: toyIndex, dataVersion: 'test', evidenceStatus: verified });
  check('toy scheme: at the level asked, a different subject is still not a tick', toyHl.outcome !== OUTCOME.MEETS && /counts as Toyish second language A/.test(toyHl.gaps[0]?.message || ''), said(toyHl));

  const ibOnly = {
    id: 'opp-test-ib-english', destination: 'zz', intake: '2027-autumn', meta: { dataAsOf: '2026-09-22' }, evidence: ['ev-test'], admission: { restricted: false },
    requirements: [ibReq('e1', 'english-a-literature', 'SL')],
  };
  const eb = assess(profile([{ subject: 'english-b', level: 'HL', grade: 6 }]), ibOnly, { ...ibOnlyOptions, evidenceStatus: verified });
  check('IB terms: English B HL against English A: Literature names the course held', /Your English B HL is a different IB course/.test(eb.gaps[0]?.message || ''), said(eb));
  const [ebLead] = splitLead(eb.gaps[0]?.message || '');
  check('IB terms: and the lead still says what is missing', /You do not have English A: Literature/.test(ebLead), ebLead);
}

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

{
  const published = { ...engineering, requirements: [{ id: 'diploma', kind: 'ib-diploma', mandatory: true }] };
  const pending = { ...published, language: { instruction: 'English', fullyInLanguage: true, intakeStatus: 'unconfirmed', note: 'The next intake teaching language is under review.' } };
  const assessWith = (p, o) => assess(p, o, { ...options, evidenceStatus: verified });
  eq('listed intake language retains a positive requirement fit', assessWith(profile([]), published).outcome, OUTCOME.MEETS);
  eq('explicitly confirmed intake language retains a positive requirement fit', assessWith(profile([]), { ...published, language: { instruction: 'English', intakeStatus: 'confirmed' } }).outcome, OUTCOME.MEETS);
  const result = assessWith(profile([]), pending);
  eq('unconfirmed intake language cannot grant a positive fit', result.outcome, OUTCOME.NEEDS_REVIEW);
  check('unconfirmed intake language explains the open question', result.unknowns.some((u) => u.id === 'intake-language-unconfirmed' && u.blocksPlan && u.message === pending.language.note));
  eq('unconfirmed intake language cannot establish applicant rejection', assessWith(profile([], { holdsDiploma: false }), pending).outcome, OUTCOME.NEEDS_REVIEW);
}

console.log('');
if (failures.length) {
  console.log(`${failures.length} failing scenario(s):`);
  for (const f of failures) console.log(`  ✗ ${f}`);
  console.log(`\n${passed} passed, ${failures.length} failed\n`);
  process.exit(1);
}
console.log(`All ${passed} eligibility scenarios pass.\n`);

// Qualification labels, sectors and degree structures retain their actual meanings
{
const { default: assert } = await import('node:assert/strict');
const { default: fs } = await import('node:fs/promises');
const { default: path } = await import('node:path');
const {
  credentialName,
  sectorName,
  credentialSummary,
  credentialExplainer,
  levelOrder,
  COMPARABLE_LEVEL,
} = await import('../src/lib/credentials.mjs');

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

const GERMAN_MEDICINE = {
  comparableLevel: 'integrated-long',
  structure: 'integrated-long',
  localTitle: 'Staatsexamen',
  localTitleEn: 'State Examination',
  sector: { local: 'Universität', en: 'university', kind: 'research' },
  eqf: 7,
  years: 6,
};

const GERMAN_APPLIED = {
  comparableLevel: 'bachelor',
  structure: 'standard',
  localTitle: 'Bachelor of Engineering',
  localTitleEn: 'Bachelor of Engineering',
  abbreviation: 'BEng',
  sector: { local: 'Fachhochschule', en: 'university of applied sciences', kind: 'applied' },
  eqf: 6,
  ects: 210,
  years: 3.5,
};

const FRENCH_ENGINEER = {
  comparableLevel: 'integrated-long',
  structure: 'integrated-long',
  localTitle: "Diplôme d'ingénieur",
  localTitleEn: 'Engineering Diploma',
  sector: { local: 'grande école', en: 'specialist engineering school', kind: 'professional' },
  eqf: 7,
  years: 5,
};

const US_ASSOCIATE = {
  comparableLevel: 'short-cycle',
  structure: 'short-cycle',
  localTitle: 'Associate of Arts',
  localTitleEn: 'Associate of Arts',
  abbreviation: 'AA',
  sector: { local: 'community college', en: 'community college', kind: 'college' },
  years: 2,
};

const DANISH_BENG = {
  comparableLevel: 'bachelor',
  structure: 'standard',
  localTitle: 'Diplomingeniør',
  localTitleEn: 'Bachelor of Engineering',
  abbreviation: 'BEng',
  sector: { local: 'universitet', en: 'university', kind: 'research' },
  eqf: 6,
  ects: 210,
  years: 3.5,
};

const ALL = { GERMAN_MEDICINE, GERMAN_APPLIED, FRENCH_ENGINEER, US_ASSOCIATE, DANISH_BENG };

check('a Staatsexamen is called a Staatsexamen', () =>
  assert.equal(credentialName(GERMAN_MEDICINE), 'Staatsexamen (State Examination)'));

check("a diplôme d'ingénieur keeps its accents and its name", () =>
  assert.equal(credentialName(FRENCH_ENGINEER), "Diplôme d'ingénieur (Engineering Diploma)"));

check('a Fachhochschule is not flattened into "university"', () =>
  assert.equal(sectorName(GERMAN_APPLIED.sector), 'Fachhochschule (university of applied sciences)'));

check('a grande école keeps its own name', () =>
  assert.equal(sectorName(FRENCH_ENGINEER.sector), 'grande école (specialist engineering school)'));

check('an English name is not repeated in brackets after itself', () =>
  assert.equal(credentialName(US_ASSOCIATE), 'Associate of Arts'));

check('Denmark still reads correctly', () =>
  assert.equal(credentialName(DANISH_BENG), 'Diplomingeniør (Bachelor of Engineering)'));

check('an associate degree sorts below a bachelor, which sorts below a long degree', () => {
  const order = [GERMAN_MEDICINE, US_ASSOCIATE, DANISH_BENG]
    .sort((a, b) => levelOrder(a) - levelOrder(b))
    .map((c) => c.comparableLevel);
  assert.deepEqual(order, ['short-cycle', 'bachelor', 'integrated-long']);
});

check('a German Staatsexamen and a French ingénieur compare as the same level', () =>
  assert.equal(levelOrder(GERMAN_MEDICINE), levelOrder(FRENCH_ENGINEER)));

check('a Fachhochschule bachelor and a Danish bachelor compare as the same level', () =>
  assert.equal(levelOrder(GERMAN_APPLIED), levelOrder(DANISH_BENG)));

check('a long degree warns that there is no bachelor exit', () => {
  const e = credentialExplainer(GERMAN_MEDICINE);
  assert.match(e.explain, /no bachelor exit/i);
  assert.match(e.explain, /apply once/i);
});

check('a short-cycle qualification says it is continuable', () =>
  assert.match(credentialExplainer(US_ASSOCIATE).explain, /continue/i));

check('a standard degree adds no redundant structural note', () =>
  assert.equal(credentialExplainer(DANISH_BENG).extra, null));

check('a non-standard structure does add one', () =>
  assert.ok(credentialExplainer(GERMAN_MEDICINE).extra));

check('every fixture produces a name, a sector and a summary', () => {
  for (const [name, c] of Object.entries(ALL)) {
    assert.ok(credentialName(c), `${name} has no rendered name`);
    assert.ok(sectorName(c.sector), `${name} has no rendered sector`);
    assert.ok(credentialSummary(c), `${name} has no summary`);
    assert.ok(credentialExplainer(c), `${name} has no explainer`);
  }
});

check('every comparable level has an explanation a student could use', () => {
  for (const [key, v] of Object.entries(COMPARABLE_LEVEL)) {
    assert.ok(v.label, `${key} has no label`);
    assert.ok(v.explain && v.explain.length > 50, `${key} has no useful explanation`);
  }
});

await new Promise((r) => setTimeout(r, 0));
console.log(failures ? `\n${failures} failing\n` : '\nAll credential guards pass\n');
if (failures) process.exit(1);
}

// Published grade-conversion tables agree with the eligibility engine
{
const { default: assert } = await import('node:assert/strict');
const { default: fs } = await import('node:fs/promises');
const { default: path } = await import('node:path');

const ROOT = path.resolve(import.meta.dirname, '..');
const read = async (p) => JSON.parse(await fs.readFile(path.join(ROOT, p), 'utf8'));

const handbook = await read('data/ib-conversion.json');
const dir = path.join(ROOT, 'data', 'recognition');
const schemes = await Promise.all(
  (await fs.readdir(dir)).filter((f) => f.endsWith('.json')).map((f) => read(path.join('data', 'recognition', f)))
);

// The handbook covers one destination; its tables are published by the same
// authority the scheme names.
const scheme = schemes.find((s) => s.authority?.name && s.authority.name === handbook.authority?.name);

let failures = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok    ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL  ${name}\n        ${e.message}`);
  }
};

console.log('\nConversion handbook and Recognition Scheme agree\n');

check('a Recognition Scheme exists for the handbook’s authority', () =>
  assert.ok(scheme, `no scheme in data/recognition/ names "${handbook.authority?.name}" as its authority`)
);

const rows = (table, key) => new Map((table || []).map((r) => [r.ib, r[key]]));

for (const [label, own, theirs] of [
  ['total points → grade average', handbook.gradeAverage?.table, scheme?.gradeConversion?.average?.table],
  ['single subject grade', handbook.singleGrade?.table, scheme?.gradeConversion?.single?.table],
]) {
  check(`${label}: every row matches`, () => {
    const a = rows(own, 'dk');
    const b = rows(theirs, 'local');
    assert.ok(a.size, `the handbook has no ${label} table`);
    assert.deepEqual(
      [...a.keys()].sort((x, y) => x - y),
      [...b.keys()].sort((x, y) => x - y),
      `the two ${label} tables cover different IB values`
    );
    const differ = [...a].filter(([ib, v]) => b.get(ib) !== v).map(([ib, v]) => `IB ${ib}: handbook ${v}, scheme ${b.get(ib)}`);
    assert.deepEqual(differ, [], `rows differ:\n        ${differ.join('\n        ')}`);
  });
}

console.log(failures ? `\n${failures} failing\n` : '\nThe two copies agree\n');
if (failures) process.exit(1);
}

// Missing, conflicting or stale sources cannot silently become verified in the browser.
{
  const assert = (await import('node:assert/strict')).default;
  const { classify, forBrowser, statusFor, summarise, serialisePolicy, ORDER, DECLINE } = await import('../src/lib/evidence-policy.mjs');
  const today = '2026-09-23';
  const source = (extra = {}) => ({ id: 'source', sourceUrl: 'https://example.org/rules', publisher: 'Rule owner', retrievedAt: '2026-01-01', verificationState: 'verified', ...extra });
  const states = [
    [source(), 'verified'],
    [source({ meta: { reviewBy: '2020-01-01' } }), 'stale'],
    [source({ conflictsWith: ['other'] }), 'conflicting'],
    [source({ verificationState: 'unknown-state' }), 'needs-review'],
    [source({ verificationState: 'unavailable' }), 'unavailable'],
    [source({ verificationState: 'superseded' }), 'superseded'],
  ];
  for (const [record, expected] of states) {
    assert.equal(classify(record, today), expected);
    assert.equal(classify(forBrowser(record, today), today), expected);
    if (expected !== 'verified') assert.equal(summarise([record], today).verified, 0);
  }
  assert.equal(statusFor([], today).level, 'none');
  assert.equal(statusFor([states[0][0], states[2][0]], today).level, 'conflicting');
  assert.deepEqual(serialisePolicy().order, ORDER);
  for (const level of ['conflicting', 'stale', 'unavailable', 'superseded']) assert.ok(DECLINE.has(level));
  console.log('Source uncertainty keeps the same refusal policy in the planner and browser.');
}
