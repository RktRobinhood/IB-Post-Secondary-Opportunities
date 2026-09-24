/**
 * Phase 2a: applies the audience edits to the quiet data files — the ones no
 * other agent is editing. Busy files (data/countries, data/destinations,
 * data/evidence, data/application-routes, data/images.json) are refused.
 *
 *   node docs/research/audience/apply-quiet.mjs          # dry run
 *   node docs/research/audience/apply-quiet.mjs --write
 *
 * Each edit is located by JSON path. Every `find` must be present in the
 * string's current value, which guards against text that changed after the
 * inventory. The new value is then substituted into the raw file text, so the
 * file's own formatting is kept. Edits already applied are skipped, so the
 * script can be re-run.
 *
 * The edits are the inventory's proposals with the phase-2a verification
 * corrections (verification.md): AU's own wording, the SU label from
 * data/funding/dk-su.json, and the ECB rate of 24 September 2026.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const WRITE = process.argv.includes('--write');
const BUSY = /^data\/(countries|destinations|evidence|application-routes)\/|^data\/images\.json$/;

const SU_LABEL =
  'if you can claim Danish SU — Danish citizens, and EU/EEA citizens with equal status (for example through a parent who works in Denmark, or five years living here)';
const OTHERWISE = "If you cannot claim SU, look first at your own country's student finance: several EU/EEA systems fund a full degree in another country.";
const AU_GLOSS = '"Danish applicants" (on its Data Science page, "applicants with Danish A")';

const EDITS = [
  ['data/application-systems/au-uac.json', 'coverage.includes', [
    ['which is what puts a Danish IB candidate inside it', 'which is what puts an IB candidate at a school in Denmark inside it'],
  ]],
  ['data/application-systems/jp-mext-embassy.json', 'meta.notes[1]', [
    ['so this system has no Danish undergraduate dates to record.', 'so this system has no Danish undergraduate dates to record. That holds for Danish citizens only: MEXT runs the first screening at the Japanese mission in the country of the applicant\'s nationality (2027 guidelines, 5(1)), so other nationalities get their dates from the mission in their own country.'],
  ]],
  ['data/context-notes/no-language-is-the-obstacle.json', 'text', [
    ['a Danish IB student would apply', 'an IB student in Denmark would apply'],
    ['a familiar culture and favourable SU treatment', 'a culture close to Denmark\'s and, for anyone who can claim Danish SU, favourable SU treatment'],
  ]],
  ['data/dk/au.json', 'notes[4]', [['AU tells Danish applicants', `AU tells ${AU_GLOSS}`]]],
  ['data/institutions/dk-au.json', 'meta.notes[4]', [['AU tells Danish applicants', `AU tells ${AU_GLOSS}`]]],
  ['data/dk/au.json', 'programmes[1].extraRequirements[4]', [['AU advises Danish applicants', `AU advises ${AU_GLOSS}`]]],
  ['data/opportunities/dk-au-computer-science-2027-autumn.json', 'meta.notes[2]', [['AU advises Danish applicants', `AU advises ${AU_GLOSS}`]]],
  ['data/dk/au.json', 'programmes[3].extraRequirements[4]', [['AU advises Danish applicants', `AU advises ${AU_GLOSS}`]]],
  ['data/opportunities/dk-au-it-product-development-2027-autumn.json', 'meta.notes[1]', [['AU advises Danish applicants', `AU advises ${AU_GLOSS}`]]],
  ...['data/dk/itu.json|programmes[1].summary', 'data/programmes/dk-itu-global-business-informatics.json|summary'].map((s) => {
    const [f, p] = s.split('|');
    return [f, p, [[
      'it is realistically only open to applicants who went to school in Denmark or studied Danish to A level.',
      'it is realistically only open to applicants who have Danish at A level — from a Danish gymnasium, or Danish A in the IB. Going to school in Denmark is not enough on its own.',
    ]]];
  }),
  ['data/opportunities/nl-breda-uas-hotel-management-2027-autumn.json', 'requirements[5].note', [
    ['For a Danish IB student taking a Group 2 language', 'For an IB student taking German, French or Spanish as a Group 2 language'],
  ]],
  ['data/preparation.json', 'actions[12].why', [
    ['budgets NOK 15,488 a month to live', 'budgets NOK 15,488 a month to live (about €1,435 at the ECB rate of 24 September 2026)'],
    ['If you are a Danish citizen, work out early whether SU follows you. It does, for a full degree abroad.',
      `If you can claim Danish SU — Danish citizens, and EU/EEA citizens with equal status, for example through a parent who works in Denmark — work out early whether it follows you. It can, for a full degree abroad, if you also meet the ties-to-Denmark requirement: two years living here in the last ten is one way.`],
    ['Elsewhere, at most four years (48 klip).', `Elsewhere, at most four years (48 klip). ${OTHERWISE}`],
  ]],
  ['data/topics/distinctive-options.json', 'options[10].cost', [
    ['tuition is free for EU/EEA citizens and Danish SU applies.', `tuition is free for EU/EEA citizens, and Danish SU applies ${SU_LABEL.replace('claim Danish SU', 'claim it')}.`],
  ]],
  ['data/topics/distinctive-options.json', 'options[11].cost', [
    ['typically a large six-figure DKK sum, self-financed', 'typically a large sum — high five figures in euros or more — self-financed'],
  ]],
  ['data/topics/distinctive-options.json', 'options[12].cost', [
    ['with the state covering a substantial share for Danish students', 'with the Danish state covering a substantial share for students who qualify — ask the school whether your citizenship gets the subsidised price'],
  ]],
  ['data/topics/distinctive-options.json', 'options[12].whoItSuits', [
    ['taking a sabbatår is the Danish norm, not a sign of drift', 'in Denmark, where you go to school, taking a sabbatår is the norm, not a sign of drift'],
    ['Most Danish students take one or two years', 'Most students leaving Danish gymnasiums take one or two years'],
  ]],
  ['data/topics/medicine-abroad.json', 'title', [['coming home to practise in Denmark', 'getting licensed to practise in Denmark or elsewhere in the EU']]],
  ['data/topics/medicine-abroad.json', 'intro', [
    ['a group of Danish students who do not get a place', 'a group of students from Denmark who do not get a place'],
    ['whether your degree lets you work as a doctor in Denmark', 'whether your degree lets you work as a doctor in Denmark — or in whichever EU/EEA country you want to practise'],
  ]],
  ['data/topics/medicine-abroad.json', 'sections[0].body', [
    ['Danish medicine places are rationed. If you do not get in,', 'Medicine places are rationed — in Denmark, where medicine is taught in Danish, and in most other European countries. If you do not get in,'],
  ]],
  ['data/topics/medicine-abroad.json', 'sections[0].bullets[0]', [
    ['not by a Danish grade-point average', 'not by a converted grade-point average'],
    ['who missed the Danish cut-off', 'who missed a medicine cut-off in Denmark or elsewhere'],
  ]],
  ['data/topics/medicine-abroad.json', 'sections[2].body', [
    ['Danish SU and the Danish state student loan (SU-lan) can often be taken abroad', `If you can claim Danish SU — Danish citizens, and EU/EEA citizens with equal status — it and the Danish state student loan (SU-lan) can often be taken abroad`],
    ['Do that early, because it changes whether the whole plan is affordable.', `Do that early, because it changes whether the whole plan is affordable. ${OTHERWISE}`],
  ]],
  ['data/topics/medicine-abroad.json', 'sections[2].bullets[3]', [
    ['Check the Danish SU rules for udlandsstipendium and SU abroad before you commit. This is a Danish decision made in Denmark.',
      'If you can claim Danish SU, check its rules for udlandsstipendium and SU abroad — including the ties-to-Denmark requirement — before you commit. This is a Danish decision made in Denmark. If you cannot, check your own country\'s student finance for a full degree abroad.'],
  ]],
  ['data/topics/medicine-abroad.json', 'sections[3].heading', [['Danish authorisation', 'Authorisation to practise (Denmark as the example)']]],
  ['data/topics/medicine-abroad.json', 'sections[3].body', [
    ['A medical degree is not the same thing as a licence to work as a doctor. In Denmark the licence is called autorisation',
      'A medical degree is not the same thing as a licence to work as a doctor, and the licence comes from the country where you want to practise. This section uses Denmark as the example. In Denmark the licence is called autorisation'],
  ]],
  ['data/topics/medicine-abroad.json', 'sections[4].body', [
    ['come straight home and skip', 'leave Poland straight away and skip'],
    ['You can still work towards Danish authorisation, but you are on a slower and less certain path.',
      'If you plan to practise in Denmark, you can still work towards Danish authorisation, but you are on a slower and less certain path — and a degree outside the automatic route is slower to get recognised anywhere, so ask the authority where you want to practise.'],
  ]],
  ['data/topics/medicine-abroad.json', 'sections[5].body', [
    ['Denmark has a fallback for exactly this situation.', 'If you plan to practise in Denmark, there is a fallback for exactly this situation.'],
    ['than to arrive home and negotiate', 'than to arrive in the country where you want to practise and negotiate'],
  ]],
  ['data/topics/medicine-abroad.json', 'sections[5].bullets[1]', [
    ['A Dane with an EU medical degree', 'An EU/EEA or Swiss citizen with an EU medical degree'],
    ['to get permission to practise independently.', 'to get permission to practise independently in Denmark.'],
  ]],
  ['data/topics/medicine-abroad.json', 'sections[6].body', [
    ['That cuts both ways. Legally you are fine.', 'If you plan to practise in Denmark, that cuts both ways. Legally you are fine.'],
    ['Keep your Danish alive while you are away. Do Danish-language clinical placements or summer jobs in Denmark if you can.',
      'If Denmark is the plan, build or keep up your Danish while you are away: do Danish-language clinical placements or summer jobs in Denmark if you can. If you plan to practise somewhere else, the same goes for that country\'s language.'],
  ]],
  ['data/topics/medicine-abroad.json', 'sections[6].bullets[1]', [['The employer is responsible', 'In Denmark, the employer is responsible']]],
  ['data/topics/medicine-abroad.json', 'sections[7].bullets[6]', [
    ['What does Uddannelses- og Forskningsstyrelsen say about SU and tuition support for this specific programme?',
      "If you can claim Danish SU: what does Uddannelses- og Forskningsstyrelsen say about SU and tuition support for this specific programme? If not, what does your own country's student finance body say?"],
  ]],
];

function getAt(obj, p) {
  return p.split(/\.|(?=\[)/).reduce((o, k) => (o == null ? o : k.startsWith('[') ? o[Number(k.slice(1, -1))] : o[k]), obj);
}

let applied = 0, skipped = 0;
const problems = [];
const byFile = new Map();
for (const [file, p, edits] of EDITS) {
  if (BUSY.test(file)) { problems.push(`${file}: busy file, refused`); continue; }
  if (!byFile.has(file)) byFile.set(file, fs.readFileSync(path.join(ROOT, file), 'utf8'));
  const raw = byFile.get(file);
  const value = getAt(JSON.parse(raw), p);
  if (typeof value !== 'string') { problems.push(`${file} ${p}: not a string`); continue; }
  let next = value;
  for (const [find, replace] of edits) {
    if (next.includes(replace)) { skipped++; continue; }
    if (!next.includes(find)) { problems.push(`${file} ${p}: find not present — "${find.slice(0, 70)}"`); continue; }
    next = next.replace(find, replace);
    applied++;
  }
  if (next === value) continue;
  const from = JSON.stringify(value);
  const count = raw.split(from).length - 1;
  if (count < 1) { problems.push(`${file} ${p}: value not found verbatim in the file text`); continue; }
  byFile.set(file, raw.split(from).join(JSON.stringify(next)));
}
for (const [file, text] of byFile) {
  JSON.parse(text);
  if (WRITE) fs.writeFileSync(path.join(ROOT, file), text);
}
console.log(`${applied} edit(s) ${WRITE ? 'applied' : 'would apply'}, ${skipped} already applied, ${byFile.size} file(s).`);
if (problems.length) { console.log(problems.join('\n')); process.exit(1); }
