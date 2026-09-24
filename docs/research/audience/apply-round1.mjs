/**
 * Audience critic round 1 fixes (critique-round-1.md, top fixes 1–5 and 8).
 * Exact-substring edits, re-runnable: an edit whose replacement is already
 * present is skipped; one whose find is missing is reported, never guessed.
 *
 *   node docs/research/audience/apply-round1.mjs [--write]
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const WRITE = process.argv.includes('--write');

const GRAD = 'The 2027 round needs a graduation certificate by 31 December 2026, which a May 2027 IB candidate cannot supply, whatever their passport.';

const EDITS = {
  /* --- Fix 1: Nordic-only admin steps, conditional, with the EU/EEA step beside them --- */
  'data/countries/no.json': [
    ['As a Nordic citizen you do not register with the police. If you will stay more than six months,',
      'If you are a Nordic citizen, you do not register with the police. Other EU/EEA citizens staying more than three months register with the police within three months of arriving. If you will stay more than six months,'],
    ['No residence permit needed, and as a Nordic citizen you do not register with the police either.',
      'No residence permit is needed. If you are a Nordic citizen, you do not register with the police either; other EU/EEA citizens staying more than three months register with the police within three months of arriving.'],
    /* Fix 4: the klip question, in su.dk's own words (verification §8). */
    ['It draws on the same SU-klip as a Danish degree.', 'It uses SU-klip, within the 70-klip frame su.dk sets for all higher education abroad.'],
  ],
  'data/countries/fi.json': [
    ['As a Nordic citizen you skip Migri entirely and just register your details with the population agency (dvv.fi).',
      'If you are a Nordic citizen, you skip Migri entirely and just register your details with the population agency (dvv.fi). Other EU/EEA citizens register their EU right of residence with Migri as well.'],
    ['As a Nordic citizen you do not deal with Migri at all.',
      'If you are a Nordic citizen, that is all. Other EU/EEA citizens also apply for EU registration at Migri.'],
    ['As a Nordic citizen (Danish, Icelandic, Norwegian or Swedish) you do not apply to Migri',
      'If you are a Nordic citizen (Danish, Icelandic, Norwegian or Swedish), you do not apply to Migri'],
  ],
  'data/countries/is.json': [
    ['As a Nordic citizen you have a separate, simpler track with Registers Iceland (Þjóðskrá) rather than the Directorate of Immigration. You are entitled to apply for legal domicile registration if you intend to stay three months or longer, and required to if you stay six months or longer.',
      'EU/EEA and Swiss students register with Registers Iceland (Þjóðskrá), not the Directorate of Immigration, no later than three months after arriving, showing their admission and that they can support themselves. If you are a Nordic citizen, your track is simpler still: you may register legal domicile if you intend to stay three months or longer, and must if you stay six months or longer.'],
  ],

  /* --- Fix 2: the 2027 GKS round is closed on every track; plan for 2028 --- */
  'data/countries/kr.json': [
    ["The Global Korea Scholarship's Embassy Track is closed to Danish citizens. The 2027 guidelines invite 74 countries and Denmark is not one of them, and no Korean embassy in Denmark appears in the guidelines' own contact list; on another passport, check whether your country is one of the 74. For Danish citizens, only the University Track's UIC Program is open — science and engineering at thirteen named universities, none of them Yonsei, KAIST, Seoul National or Korea University.",
      "No May 2027 IB candidate can use the 2027 Global Korea Scholarship, on either track: the round needs a graduation certificate by 31 December 2026. Plan for 2028. The Embassy Track then depends on your nationality — the 2027 list of 74 countries included the Czech Republic, Poland, Sweden and Ukraine but not Denmark, Germany or Norway — and the University Track's UIC Program is open to every nationality, but it is science and engineering at thirteen named universities, none of them Yonsei, KAIST, Seoul National or Korea University."],
    ['A May 2027 IB graduate is not eligible for the 2027 GKS round at all, because it requires a graduation certificate by 31 December 2026. The round to plan for is 2028, expected to open around September 2027.',
      'The 2028 round is expected to open around September 2027. Check the new country list for your nationality when it is published.'],
    ["If you want the Global Korea Scholarship, read the invited-country list first. On a Danish passport only the University Track's UIC Program is open, and it is science and engineering at thirteen named universities. On another passport, check whether your country is on the Embassy Track list. Applying on more than one track voids the application.",
      "If you want the Global Korea Scholarship, plan for the 2028 round: no May 2027 IB candidate can use 2027's. Read the invited-country list first — the Embassy Track depends on your nationality, while the University Track's UIC Program is open to every nationality but covers only science and engineering at thirteen named universities. Applying on more than one track voids the application."],
    ["The Embassy Track invites 74 countries and Denmark is not among them; only the University Track's UIC Program, science and engineering at thirteen named universities, is open to a Danish citizen; on another passport, check whether your country is among the 74. A May 2027 IB graduate is in any case ineligible for the 2027 round, which requires a graduation certificate by 31 December 2026 — the round to plan for is 2028.",
      "No May 2027 IB graduate can use the 2027 round, on either track, because it requires a graduation certificate by 31 December 2026 — plan for 2028. Then the Embassy Track depends on your nationality (the 2027 list of 74 countries left out Denmark), and the University Track's UIC Program, science and engineering at thirteen named universities, is open to every nationality."],
  ],
  'data/destinations/kr.json': [
    ["The Global Korea Scholarship's Embassy Track depends on your nationality: 74 countries are invited for 2027 and Denmark is not one of them, so check whether your country of citizenship is. If it is not, only the University Track's UIC Program is open, and it is science and engineering at thirteen named universities, none of them the ones above.",
      "No May 2027 IB candidate can use the 2027 Global Korea Scholarship on either track: it needs a graduation certificate by 31 December 2026. Plan for 2028, when the Embassy Track depends on your nationality and the University Track's UIC Program — science and engineering at thirteen named universities, none of them the ones above — is open to every nationality."],
    ['The Global Korea Scholarship, on the University Track only for a Danish citizen. In the 2027 round',
      'The Global Korea Scholarship, from the 2028 round for a May 2027 IB graduate (2027 needs a graduation certificate by 31 December 2026). In the 2027 round'],
  ],
  'data/application-routes/kr-gks-university-2027.json': [
    ['Global Korea Scholarship, University Track — open to every nationality', 'Global Korea Scholarship, University Track (UIC Program)'],
    ['The UIC Program is the one part of GKS with no country restriction, so this track is open whatever your passport. On a Danish passport it is the only GKS track; other nationalities should also check whether their country is on the Embassy Track list.',
      'The UIC Program is the one part of GKS with no country restriction, so from 2028 this track is open whatever your passport. The 2027 round is not: its graduation-certificate deadline of 31 December 2026 applies to every track.'],
  ],

  /* --- Fix 5: Hungary --- */
  'data/countries/hu.json': [
    ['Stipendium Hungaricum is closed to you. It works through bilateral sending-partner agreements and no EU member state is on the list. The Diaspora Scholarship excludes anyone resident inside the EU. Hungary\x27s bilateral state scholarships list 30 countries and Denmark is not one of them. You are self-funded.',
      'Stipendium Hungaricum is closed to EU citizens: it works through bilateral sending-partner agreements, and no EU member state is on the list (Ukraine, among other non-EU countries, is). The Diaspora Scholarship excludes anyone resident inside the EU. Hungary\x27s bilateral state scholarships list 30 countries and Denmark is not one of them, so check whether yours is. Unless it is, plan to be self-funded.'],
    ['Stipendium Hungaricum is closed to you. It operates through bilateral sending-partner agreements',
      'Stipendium Hungaricum is closed to EU citizens. It operates through bilateral sending-partner agreements'],
    ['The Hungarian Diaspora Scholarship is also closed to you. It is open only to members of the Hungarian diaspora residing outside the European Union, so Hungarian ancestry does not help if you live in Denmark.',
      'The Hungarian Diaspora Scholarship is closed to anyone living in the EU: it is open only to members of the Hungarian diaspora residing outside it, so Hungarian ancestry does not help while you live in Denmark.'],
    ['Medicine in English — but you pay for all of it yourself', 'Medicine in English — usually paid for yourself'],
  ],
  'data/destinations/hu.json': [
    ['Medicine in English — but you pay for all of it yourself', 'Medicine in English — usually paid for yourself'],
    ['the big Hungarian scholarships are closed to EU citizens, so plan to be self-funded.',
      'the big Hungarian scholarships are closed to EU citizens, so unless your country has a bilateral scholarship with Hungary, plan to be self-funded.'],
  ],

  /* --- Fix 8: the Copenhagen fact once, not on every MEXT calendar row --- */
  'data/application-routes/jp-mext-embassy-2028.json': [
    [' The one in Copenhagen offers Danish nationals no undergraduate call.', ''],
  ],
};

/* The readerAccess objects on the University Track (a field, not a string). */
const ACCESS = {
  'data/application-routes/kr-gks-university-2027.json': { state: 'closed', reason: GRAD, evidence: ['ev-kr-gks-2027-eligibility'] },
};

let applied = 0, skipped = 0;
const problems = [];
for (const [file, edits] of Object.entries(EDITS)) {
  const p = path.join(ROOT, file);
  let s = fs.readFileSync(p, 'utf8');
  for (const [find, replace] of edits) {
    const F = JSON.stringify(find).slice(1, -1), R = JSON.stringify(replace).slice(1, -1);
    if (R && s.includes(R) && !s.includes(F)) { skipped++; continue; }
    if (!R && !s.includes(F)) { skipped++; continue; }
    const n = s.split(F).length - 1;
    if (n < 1) { problems.push(`${file}: not found — "${find.slice(0, 70)}"`); continue; }
    s = s.split(F).join(R);
    applied += n;
  }
  const j = JSON.parse(s);
  if (ACCESS[file] && JSON.stringify(j.readerAccess) !== JSON.stringify(ACCESS[file])) {
    const i = s.lastIndexOf('\n  "meta"');
    if (j.readerAccess) problems.push(`${file}: already has a readerAccess; edit by hand`);
    else if (i < 0) problems.push(`${file}: no meta anchor`);
    else { s = s.slice(0, i) + `\n  "readerAccess": ${JSON.stringify(ACCESS[file], null, 2).replace(/\n/g, '\n  ')},` + s.slice(i); applied++; }
  }
  JSON.parse(s);
  if (WRITE) fs.writeFileSync(p, s);
}
console.log(`${applied} ${WRITE ? 'applied' : 'to apply'}, ${skipped} already applied.`);
if (problems.length) { console.log(problems.join('\n')); process.exitCode = 1; }
