/**
 * Audience critic round 2 fixes (critique-round-2.md, top fixes 1, 3, 5, 7 in
 * data). Exact-substring edits, re-runnable, formatting-preserving.
 *
 *   node docs/research/audience/apply-round2.mjs [--write]
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const WRITE = process.argv.includes('--write');

const EDITS = {
  /* --- Fix 1: Poland, for the Polish citizen too; Karta Polaka (verification §10) --- */
  'data/countries/pl.json': [
    /* A Danish-certificate rule, not a reason Poland suits an IB student; the
       full rule stays in language.notes, where the detail belongs. */
    [' six-year MD.",\n    "The Jagiellonian School of Medicine in English has an explicit Denmark rule: a Danish English grade of 7 satisfies its English requirement."\n', ' six-year MD."\n'],
    ["Poland's maintenance grant and student loan are closed to an EU student who is not working in Poland, under article 324(3) of the Higher Education Act. Your funding has to come from outside Poland — Danish SU if you qualify, or your own country's student finance.",
      "If you are an EU citizen without Polish citizenship, Poland's maintenance grant and student loan are closed to you unless you work in Poland (article 324(3) of the Higher Education Act), so your funding has to come from elsewhere — Danish SU if you can claim it, or your own country's student finance. Article 324 governs foreigners only: if you hold Polish citizenship, both are open to you on the ordinary terms."],
    ['Every foreign candidate at Wroclaw Tech must sit a compulsory online maths-with-logic entrance exam, whatever your IB Maths grade.',
      'Every foreign candidate at Wroclaw Tech must sit a compulsory online maths-with-logic entrance exam, whatever your IB Maths grade. Whether a Polish citizen with a foreign IB counts as a foreign candidate is not established here: ask Wroclaw Tech.'],
    ['Karta Polaka is irrelevant to you. It requires Polish ancestry, and EU citizenship already gives you the identical fee exemption for Polish-taught study.',
      'If you have Polish ancestry but not Polish citizenship, Karta Polaka is worth having: it opens the maintenance grant and the student loan without the work condition, which EU citizenship alone does not (article 324(3) point 2).'],
    ['Be clear about what you cannot get. Article 324(3) restricts the Polish maintenance grant (stypendium socjalne) and the Polish student loan (kredyt studencki) to EU citizens who are workers, self-employed, retain a right of residence on that basis, or hold permanent residence. An EU student who simply arrives to study cannot claim either.',
      'Be clear about what a non-Polish EU citizen cannot get. Article 324(3) restricts the Polish maintenance grant (stypendium socjalne) and the Polish student loan (kredyt studencki) to EU citizens who are workers, self-employed, retain a right of residence on that basis, or hold permanent residence, so an EU student who simply arrives to study cannot claim either. A Karta Polaka holder can, without the work condition (article 324(3) point 2), and a Polish citizen is outside article 324 altogether.'],
    ['taking up work is what unlocks the Polish maintenance grant and student loan, which are otherwise closed to you.',
      'taking up work is what unlocks the Polish maintenance grant and student loan, which are otherwise closed to an EU citizen without Polish citizenship.'],
    [' Danish tuition support is decided in Denmark too, at su.dk and ufm.dk: apply early.', ''],
  ],

  /* --- Fix 3: Norwegian and Swedish readers in Australia --- */
  'data/countries/au.json': [
    ['Denmark has no reciprocal healthcare agreement that replaces OSHC for students, and the EHIC is not valid in Australia.',
      'The EHIC is not valid in Australia. If you are a Norwegian or Swedish citizen covered by your own country\'s scheme, you may be exempt from OSHC under special arrangements: check with the Department of Home Affairs before you buy it. Denmark has no such arrangement.'],
    /* Fix 5 */
    ['most students go home once a year at most.', 'most students fly back once a year at most.'],
  ],
  'data/destinations/au.json': [
    ['Denmark has no reciprocal healthcare agreement that replaces it, and the EHIC is not valid in Australia.',
      'The EHIC is not valid in Australia. Norwegian and Swedish citizens covered by their own country\'s scheme may be exempt: check with the Department of Home Affairs. Denmark has no such arrangement.'],
  ],

  /* --- Fix 7: prose --- */
  'data/countries/fi.json': [
    [' Other EU/EEA citizens register their EU right of residence with Migri as well.', ''],
    ['This is simpler than the standard EU registration that other EU citizens have to do, and it is the correct route for any Danish, Icelandic, Norwegian or Swedish citizen. Other EU/EEA citizens register their EU right of residence with Migri.',
      'This is simpler than the EU registration everyone else does: other EU/EEA citizens register their EU right of residence with Migri.'],
  ],
  'data/countries/cz.json': [
    ['One of the two dated overseas sittings nearest Denmark, with Berlin on 13 July 2027. It falls four days before IB results are released on 6 July.',
      'London on 2 July 2027 is one of the two dated overseas sittings nearest Denmark; the other is Berlin on 13 July. The London sitting falls four days before IB results are released on 6 July.'],
  ],
  'data/countries/lt.json': [
    ['"date": null,\n        "dateState": "not-yet-announced",\n        "consequence": "hard",\n        "provisional": false,\n        "year": "2027 entry",\n        "audience": "EU and EFTA citizens",',
      '"date": "2027-07-01",\n        "consequence": "hard",\n        "provisional": false,\n        "year": "2027 entry",\n        "audience": "EU and EFTA citizens",'],
    ['As an EU/EFTA citizen you are in the July group. The 2027 dates were not published on 23 September 2026 - admissions.vu.lt offered only a "Get 2027 Admissions Updates" sign-up - so no date is recorded here.',
      'As an EU/EFTA citizen you are in the July group. For the 2027/2028 round admissions.vu.lt now reads (25 September 2026): applications open on 1 December 2026, with 1 May for applicants from non-EU/EFTA countries and 1 July for EU/EFTA citizens and non-EU/EFTA applicants whose visa-free period has not been exceeded.'],
  ],
  'data/application-routes/lt-direct-2027.json': [
    ['Not established: 2027 dates at Vilnius University, KTU,', 'Not established: 2027 dates at KTU,'],
  ],
};

let applied = 0, skipped = 0;
const problems = [];
for (const [file, edits] of Object.entries(EDITS)) {
  const p = path.join(ROOT, file);
  let s = fs.readFileSync(p, 'utf8');
  for (const [find, replace] of edits) {
    /* A find written with real newlines is matched on raw text (structure);
       everything else is a JSON string value, matched escaped. */
    const raw = find.includes('\n');
    const F = raw ? find : JSON.stringify(find).slice(1, -1);
    const R = replace === null ? '' : raw ? replace : JSON.stringify(replace).slice(1, -1);
    if (R && R.includes(F) && s.includes(R)) { skipped++; continue; }
    if (!s.includes(F)) {
      if ((R && s.includes(R)) || (!R)) { skipped++; continue; }
      problems.push(`${file}: not found — "${find.slice(0, 70)}"`);
      continue;
    }
    s = s.split(F).join(R);
    applied++;
  }
  JSON.parse(s);
  if (WRITE) fs.writeFileSync(p, s);
}
console.log(`${applied} ${WRITE ? 'applied' : 'to apply'}, ${skipped} already applied.`);
if (problems.length) { console.log(problems.join('\n')); process.exitCode = 1; }
