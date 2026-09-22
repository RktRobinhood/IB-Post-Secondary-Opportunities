/**
 * Guards for the matching logic.
 *
 * The first test exists because this bug has now cost real time twice: a regex
 * built in a template literal with single backslashes silently becomes
 * something else — `\b` turns into a backspace character, `\s` into the letter
 * s — and the result is a probe that quietly matches nothing. Nothing throws.
 * The report simply says a university has no evidence behind it, which looks
 * exactly like a real finding. So: no probe may contain a control character.
 */
import assert from 'node:assert/strict';
import { subjectProbes, milestoneProbes, probesForRequirements, runProbes } from './lib/claim-probe.mjs';
import { htmlToText } from './lib/html-text.mjs';

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

const allProbes = [
  ...subjectProbes({ kind: 'ib-subject', subject: 'Mathematics', level: 'A', minGrade: 4 }),
  ...subjectProbes({ kind: 'ib-subject', subject: 'Social Studies', level: 'B' }),
  ...milestoneProbes({ date: '2027-03-15', timeOfDay: '12:00' }),
  ...milestoneProbes({ date: '2027-07-05', timeOfDay: '09:30' }),
];

check('no probe regex contains a control character', () => {
  for (const p of allProbes) {
    const bad = /[\u0000-\u001f]/.exec(p.re.source);
    assert.equal(bad, null, `${p.label}: control char U+${bad?.[0].charCodeAt(0).toString(16)} in ${JSON.stringify(p.re.source)}`);
  }
});

check('every probe regex keeps its anchors and classes', () => {
  for (const p of allProbes) {
    assert.ok(/\b|\s|\d|\[/.test(p.re.source), `${p.label} lost its escapes: ${p.re.source}`);
  }
});

const find = (req, text) => runProbes(subjectProbes(req), htmlToText(text)).found;
const maths = { kind: 'ib-subject', subject: 'Mathematics', level: 'A' };

check('matches "Matematik A"', () => assert.ok(find(maths, '<p>Matematik A</p>')));
check('matches "Mathematics level A"', () => assert.ok(find(maths, '<p>Mathematics level A</p>')));
check('matches "Mathematics at A level"', () => assert.ok(find(maths, '<p>Mathematics at A level</p>')));
check('matches across table cells', () => assert.ok(find(maths, '<tr><td>Mathematics</td><td>A</td></tr>')));
check('matches through soft hyphens', () => assert.ok(find(maths, '<p>Ma&shy;te&shy;ma&shy;tik A</p>')));

check('does NOT accept Mathematics B for an A requirement', () =>
  assert.equal(find(maths, '<p>Mathematics B</p>'), false));
check('does NOT match a subject and a level three paragraphs apart', () =>
  assert.equal(
    find(maths, '<p>Mathematics</p><p>one</p><p>two</p><p>three</p><p>four</p><p>A</p>'),
    false
  ));
check('does NOT match "Mathematics A-level" inside a longer token', () =>
  assert.equal(find({ kind: 'ib-subject', subject: 'Mathematics', level: 'B' }, '<p>Mathematics Alpha</p>'), false));

check('a deadline matches "15 March, 12 noon (CET)"', () => {
  const g = milestoneProbes({ date: '2027-03-15', timeOfDay: '12:00' });
  assert.ok(runProbes(g, 'The application deadlines are 15 March, 12 noon (CET)').found);
});
check('a deadline does NOT match a different day', () => {
  const g = milestoneProbes({ date: '2027-03-15', timeOfDay: '12:00' });
  assert.equal(runProbes(g, 'The deadline is 16 March').found, false);
});

check('one-of branches are marked as such, not as required', () => {
  const groups = probesForRequirements([
    { kind: 'ib-subject', mandatory: true, subject: 'English', level: 'B', label: 'English B' },
    {
      kind: 'subject-combination',
      mandatory: true,
      alternatives: [
        [{ kind: 'ib-subject', mandatory: true, subject: 'Physics', level: 'B', label: 'Physics B' }],
        [{ kind: 'ib-subject', mandatory: true, subject: 'Geoscience', level: 'A', label: 'Geoscience A' }],
      ],
    },
  ]);
  assert.equal(groups.filter((g) => g.role === 'required').length, 1);
  assert.equal(groups.filter((g) => g.role === 'one-of').length, 2);
});

console.log(failures ? `\n${failures} failing\n` : '\nAll probe guards pass\n');
process.exit(failures ? 1 : 0);
