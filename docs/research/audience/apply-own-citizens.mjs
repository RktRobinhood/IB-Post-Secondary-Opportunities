/**
 * Critic round 2, fix 6: every EU/EEA/EFTA Destination says what is different
 * for a reader who holds its citizenship (`ownCitizens`). Written into
 * data/destinations/*.json after the tagline, keeping each file's formatting.
 * Re-runnable: a record that already has `ownCitizens` is left alone.
 *
 *   node docs/research/audience/apply-own-citizens.mjs [--write]
 *
 * The general form is deliberately modest — it states only what follows from
 * EU law and from the IB being a foreign qualification, and sends the reader to
 * check residence-based conditions — and a Destination with a verified rule of
 * its own says it (Poland, Germany, Norway, Switzerland, Denmark).
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const WRITE = process.argv.includes('--write');

const general = (adj, poss) =>
  `If you hold ${adj} citizenship, the parts of this page written for other EU/EEA citizens — registering your right of residence, proving your fee status — are not about you, and ${poss} own student grants and loans are open to you on their ordinary terms; check them, because some depend on where you have lived. Your IB is still a foreign qualification here, so the IB entry rules on this page still apply to you.`;

const OWN = {
  at: general('Austrian', "Austria's"),
  be: general('Belgian', "Belgium's"),
  cz: general('Czech', "Czechia's"),
  ee: general('Estonian', "Estonia's"),
  es: general('Spanish', "Spain's"),
  fi: general('Finnish', "Finland's"),
  fr: general('French', "France's"),
  gr: general('Greek', "Greece's"),
  hu: general('Hungarian', "Hungary's"),
  ie: general('Irish', "Ireland's"),
  is: general('Icelandic', "Iceland's"),
  it: general('Italian', "Italy's"),
  lt: general('Lithuanian', "Lithuania's"),
  lu: general('Luxembourgish', "Luxembourg's"),
  lv: general('Latvian', "Latvia's"),
  mt: general('Maltese', "Malta's"),
  nl: general('Dutch', "the Netherlands'"),
  pt: general('Portuguese', "Portugal's"),
  se: general('Swedish', "Sweden's"),
  si: general('Slovenian', "Slovenia's"),
  /* Verified rules of their own (verification.md §10; the countries' own records). */
  pl: "If you hold Polish citizenship, article 324 of the Higher Education Act — the source of this page's rules for foreigners — does not apply to you: Polish-taught study is free, and the maintenance grant and student loan are open to you on the ordinary terms. Your IB is still a foreign qualification, so the IB entry rules here still apply, and whether you count as a foreign candidate at universities with a separate foreigners' recruitment, such as Wroclaw Tech, is not established here: ask them.",
  de: 'If you hold German citizenship, the parts of this page written for other EU/EEA citizens are not about you, and BAföG is your own system. One rule is yours alone: German citizens who did not take German in the IB must prove German before enrolling. Your IB is still a foreign qualification, so the IB entry rules on this page still apply.',
  no: 'If you hold Norwegian citizenship, Lånekassen is yours — for everyone else it is realistically closed — and the registration steps for other EU/EEA citizens are not about you. Your IB is still a foreign qualification, so the IB entry rules on this page still apply.',
  ch: "If you hold Swiss citizenship, you pay the Swiss fee rather than the foreign one — at ETH Zurich CHF 730 a semester rather than CHF 2,190 — and the permit and registration steps for EU/EFTA students are not about you. EPFL's lower threshold for \"Swiss applicants\" may cover you too: ask EPFL whether it means citizenship or a Swiss school certificate.",
  dk: 'If you hold Danish citizenship, SU is yours without applying for equal status, and you probably know this system already: the Denmark pages are written for the students at this school who do not. Your IB is converted to the Danish scale exactly as everyone else\'s is.',
};

let changed = 0;
const problems = [];
for (const [code, text] of Object.entries(OWN)) {
  const file = path.join(ROOT, 'data/destinations', `${code}.json`);
  let s = fs.readFileSync(file, 'utf8');
  const j = JSON.parse(s);
  if (!text.startsWith(`If you hold ${j.adjective} citizenship`)) problems.push(`${code}: text does not begin with the record's own adjective (${j.adjective})`);
  if (j.ownCitizens) continue;
  const m = s.match(/\n( *)"tagline": .*(\r?\n)/);
  if (!m) { problems.push(`${code}: no tagline line`); continue; }
  /* Keep the file's own line endings (one record uses CRLF). */
  s = s.replace(m[0], `${m[0]}${m[1]}"ownCitizens": ${JSON.stringify(text)},${m[2]}`);
  if (code === 'ch' && !j.membership?.efta) s = s.replace('"schengen": true }', '"schengen": true, "efta": true }');
  JSON.parse(s);
  changed++;
  if (WRITE) fs.writeFileSync(file, s);
}
console.log(`${changed} Destination record(s) ${WRITE ? 'written' : 'to write'}.`);
if (problems.length) { console.log(problems.join('\n')); process.exitCode = 1; }
