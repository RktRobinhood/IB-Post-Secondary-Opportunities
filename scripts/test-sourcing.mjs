/**
 * Guards on what a source is allowed to establish.
 *
 * These are the rules that make it safe to research countries we have no
 * first-hand knowledge of. The valuable tests here are the negative ones: a
 * rule that never refuses anything is not a rule, and the way this fails in
 * practice is not a dramatic error but a quiet drift where secondary sources
 * gradually start carrying consequential claims because nothing stopped them.
 */
import assert from 'node:assert/strict';
import {
  SOURCE_CLASSES,
  CLAIM_KIND,
  assessSourcing,
  claimKindForField,
  isAuthoritative,
} from '../src/lib/source-classes.mjs';

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

const C = CLAIM_KIND;

/* --- the refusals, which are the point ------------------------------------ */

check('a school guidance page alone cannot establish an entry requirement', () =>
  assert.equal(assessSourcing(['school-guidance'], C.CONSEQUENTIAL).ok, false));

check('a promotion agency alone cannot establish who pays tuition', () =>
  assert.equal(assessSourcing(['promotion-agency'], C.CONSEQUENTIAL).ok, false));

check('a counsellor body alone cannot establish a deadline', () =>
  assert.equal(assessSourcing(['counselling-body'], C.CONSEQUENTIAL).ok, false));

check('an aggregator alone cannot establish a deadline', () =>
  assert.equal(assessSourcing(['aggregator'], C.CONSEQUENTIAL).ok, false));

check('Wikipedia cannot establish how a system works', () =>
  assert.equal(assessSourcing(['encyclopaedic'], C.PROCEDURAL).ok, false));

check('no source at all is not adequate sourcing', () =>
  assert.equal(assessSourcing([], C.DESCRIPTIVE).ok, false));

check('an unrecognised class counts as no source, not as a permitted one', () =>
  assert.equal(assessSourcing(['some-blog'], C.DESCRIPTIVE).ok, false));

check('piling up secondary sources does not add up to an authoritative one', () =>
  assert.equal(
    assessSourcing(['school-guidance', 'counselling-body', 'promotion-agency', 'aggregator'], C.CONSEQUENTIAL).ok,
    false
  ));

/* --- and the permissions -------------------------------------------------- */

check('the body that sets the rule can establish an entry requirement', () =>
  assert.ok(assessSourcing(['official-rule-owner'], C.CONSEQUENTIAL).ok));

check('an institution is authoritative about its own admissions', () =>
  assert.ok(assessSourcing(['institutional-guidance'], C.CONSEQUENTIAL).ok));

check('a recognition body can establish how the IB converts', () =>
  assert.ok(assessSourcing(['recognition-body'], C.CONSEQUENTIAL).ok));

check('one authoritative source rescues a claim cited mostly to secondary ones', () =>
  assert.ok(assessSourcing(['promotion-agency', 'aggregator', 'official-rule-owner'], C.CONSEQUENTIAL).ok));

check('a school guidance page CAN establish cultural context', () =>
  assert.ok(assessSourcing(['school-guidance'], C.CULTURAL).ok));

check('a promotion agency can explain how a system works', () =>
  assert.ok(assessSourcing(['promotion-agency'], C.PROCEDURAL).ok));

check('Wikipedia can carry a founding date', () =>
  assert.ok(assessSourcing(['encyclopaedic'], C.DESCRIPTIVE).ok));

/* --- claim kinds come from the field, not from anyone's judgement --------- */

check('requirements are consequential', () =>
  assert.equal(claimKindForField('requirements'), C.CONSEQUENTIAL));
check('milestones are consequential', () =>
  assert.equal(claimKindForField('milestones'), C.CONSEQUENTIAL));
check('a dotted path is classified by its head', () =>
  assert.equal(claimKindForField('ibRecognition.minimumPoints'), C.CONSEQUENTIAL));
check('an indexed path is classified by its head', () =>
  assert.equal(claimKindForField('requirements[2].minGrade'), C.CONSEQUENTIAL));
check('descriptive prose is descriptive', () =>
  assert.equal(claimKindForField('about'), C.DESCRIPTIVE));
check('an unknown field is descriptive, not consequential', () =>
  assert.equal(claimKindForField('somethingNew'), C.DESCRIPTIVE));

/* --- the matrix itself ---------------------------------------------------- */

check('exactly four classes are authoritative', () => {
  const auth = Object.keys(SOURCE_CLASSES).filter(isAuthoritative);
  assert.deepEqual(auth.sort(), [
    'admissions-authority',
    'institutional-guidance',
    'official-rule-owner',
    'recognition-body',
  ]);
});

check('no non-authoritative class may establish a consequential claim', () => {
  for (const [name, spec] of Object.entries(SOURCE_CLASSES)) {
    if (spec.authoritative) continue;
    assert.ok(
      !spec.mayEstablish.includes(C.CONSEQUENTIAL),
      `${name} is not authoritative but claims it may establish consequential facts`
    );
  }
});

check('every class explains what goes wrong if it is over-trusted', () => {
  for (const [name, spec] of Object.entries(SOURCE_CLASSES)) {
    assert.ok(spec.caution && spec.caution.length > 40, `${name} has no useful caution`);
    assert.ok(spec.description && spec.description.length > 40, `${name} has no useful description`);
  }
});

console.log(failures ? `\n${failures} failing\n` : '\nAll sourcing guards pass\n');
process.exit(failures ? 1 : 0);
