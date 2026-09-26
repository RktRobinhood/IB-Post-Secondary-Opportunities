/**
 * No unsourced ranking on an institution card, a headline or a short version.
 *
 * Registered in scripts/lib/quality-gate.mjs as 'superlatives' (stage data).
 *
 * Every Destination page says, above its institutions, "A spread of what
 * [country] offers, not a ranking" — and five critic rounds in September 2026
 * kept finding rankings directly underneath it: "The strongest engineering
 * school in the Netherlands", "The world's best-known hospitality school",
 * "Slovenia is one of the best-value places in Europe". None of them had a
 * source. Each was fixed one sentence at a time and the next one survived,
 * because nothing looked at the class (docs/research/qa/country-audit-europe/
 * round-5.md, section 5; issue #41).
 *
 * ## What it reads
 *
 * The strings a student meets first, before any disclosure:
 *
 *   - data/countries/*.json      `tagline`, `summary`, `institutions[].note`
 *   - data/destinations/*.json   `tagline`, `summary`
 *   - data/institutions/*.json   `about`
 *   - data/dk/*.json             `about` (the input `npm run migrate:dk` copies
 *                                into data/institutions, so a re-run cannot
 *                                bring a ranking back)
 *   - data/schools/*.json        `summary` (it replaces the profile's note on
 *                                the Destination card once a school is researched)
 *
 * The deeper prose — watch-outs, deadline notes, "why it might suit you" — is
 * not read: there a comparison is usually the point of the sentence ("the only
 * compulsory payment is the ÖH fee") and the false-positive rate would teach
 * people to ignore the guard.
 *
 * ## The rule
 *
 * A ranking is a claim that puts an institution or a place above or alone
 * among others. The guard flags two shapes:
 *
 *   1. Words that are always a ranking: "by far", "best-known", "best-value",
 *      "world-class", "world-leading".
 *   2. A superlative inside a comparison frame — "the", "one of the", "among
 *      the", or a possessive naming the field ("Germany's", "the world's",
 *      "the Netherlands'") — followed by best, strongest, cheapest, widest,
 *      largest, biggest, oldest (also "second-oldest"), leading, top,
 *      "most <adjective>", or only.
 *
 * Deliberately not flagged, because they are not rankings:
 *
 *   - "most" as a quantifier, with no frame: "most bachelor's are three years".
 *   - "only" as an adverb: "taught only in German", "entry is only through
 *     the MedAT".
 *   - A scope statement about the institution's *own* offer, written with its
 *     possessive: "Its only English door is Classical Ballet", "its only fully
 *     English-taught degrees are two engineering degrees". That compares the
 *     institution with nothing; it says what it teaches, and the record lists
 *     what it teaches. Write it with "its", not "the": "the only English door"
 *     reads the same to a student but cannot be told apart from "the only
 *     conservatoire in Czechia" by any rule short of a parser.
 *   - "the most recent".
 *
 * Oldest and largest are measurable, but they are still comparisons with every
 * other institution in the field, and none of the records carried the source
 * that would establish one. The record does carry the founding year, so the
 * fix is usually "Founded in 1365" — true from the record, and it tells a
 * student the same thing.
 *
 * ## Exceptions
 *
 * A ranking whose own record cites a source for it stays, and is listed in
 * ALLOW below with that source. Each entry is matched by an exact substring,
 * not a line number, and an entry that no longer matches anything fails, so
 * the list cannot rot. An attribution ("it calls itself…") is not a source:
 * repeating an institution's marketing is still the site making the claim.
 *
 *   node scripts/test-superlatives.mjs
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

/* --- The rule --------------------------------------------------------------- */

const ALWAYS = /\b(?:by far|best-known|best-value|world-class|world-leading)\b/gi;
const SUPERLATIVE = String.raw`(?:(?:second|third|fourth)-)?(?:best|strongest|cheapest|widest|largest|biggest|oldest|leading|top|most\s+(?!recent\b)[\w-]+|only)`;
// A possessive naming the field the claim ranks within. Contractions are not
// possessives ("It's only open…").
const POSSESSIVE = String.raw`(?!(?:It|That|There|What|Here|Who|He|She|Let)['’]s)[A-Z][\w-]*(?:['’]s|s['’])`;
const FRAMED = new RegExp(
  String.raw`\b(?:[Tt]he|[Oo]ne of the|[Aa]mong the|${POSSESSIVE}|world['’]s|country['’]s|nation['’]s)\s+(?:single\s+)?${SUPERLATIVE}\b`,
  'g'
);

export function rankings(text) {
  if (typeof text !== 'string') return [];
  return [...(text.match(ALWAYS) || []), ...(text.match(FRAMED) || [])];
}

/* --- Exceptions: a ranking whose record cites a source for it ---------------- */

const ALLOW = [
  {
    file: 'data/countries/ee.json',
    match: "The widest choice of English-taught bachelor's degrees in Estonia: six of the 27 on the national list",
    source:
      "ev-ee-sie-bachelors-list (data/evidence/ee.json): Study in Estonia's national list of English-taught bachelor's, " +
      'https://www.studyinestonia.ee/study/programmes/bachelors-programmes — "Tallinn University has the most (six)"; ' +
      'the same count is in ee.json language.englishTaughtBachelors.',
  },
  {
    file: 'data/countries/lu.json',
    match: "The country's only public university",
    source:
      'ev-lu-mengstudien-sector (data/evidence/lu.json): the Ministry of Higher Education, ' +
      'https://mengstudien.public.lu/en/etudier-luxembourg.html — "The University of Luxembourg is the only public university in the country".',
  },
  {
    file: 'data/countries/si.json',
    match: 'the only university where private international students can get a dormitory place',
    source:
      'si.json housing, quoting Study in Slovenia (si.json sources, https://studyinslovenia.si/live/accomodation/): ' +
      '"If you are coming as a private international student, unfortunately you do not have the option of staying in university student dormitories, except in Maribor". The note quotes it too.',
  },
];

/* --- Harness ----------------------------------------------------------------- */

let failures = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok    ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL  ${name}\n          ${e.message.split('\n').join('\n          ')}`);
  }
};

console.log('\nNo unsourced rankings on cards and headlines\n');

check('flags a ranking', () => {
  for (const t of [
    'The strongest engineering school in the Netherlands.',
    "The world's best-known hospitality school.",
    'Slovenia is one of the best-value places in Europe.',
    "Germany's oldest university and a research heavyweight.",
    "Austria's second-oldest university.",
    'By far the largest and oldest Slovenian university.',
    'The most international university in the country.',
    'One of the most competitive places in Europe for economics.',
    'Ranked among the top three sport-science schools in the world.',
    "The Netherlands' only campus university.",
    'The only conservatoire in Czechia with English-taught degrees.',
    "Lithuania's only coastal university.",
    'World-class quantum physics.',
    'The single best-value option in the country.',
    'Hong Kong’s oldest university.',
  ]) assert.ok(rankings(t).length, `not caught: ${t}`);
});

check('leaves quantifiers, adverbs and scope statements alone', () => {
  for (const t of [
    "Most bachelor's degrees are three years.",
    'Entry is only through the MedAT test.',
    'Almost all bachelor teaching is in Slovene, and only a small number are in English.',
    'Its only English door is Classical Ballet, audition-driven.',
    'Its only fully English-taught degrees are two engineering degrees in Kalundborg.',
    "It's only open to EU citizens.",
    'Founded in 1365; bachelor teaching is in German.',
    'The Preferential Entry Score for most undergraduate qualifications is 26.',
    'In the most recent cycle the window ran 8 January to 10 February.',
    "Waseda's historic rival.",
  ]) assert.deepEqual(rankings(t), [], t);
});

/* --- The real scan ------------------------------------------------------------ */

const rel = (f) => path.relative(ROOT, f).split(path.sep).join('/');
const readDir = (dir) =>
  fs.existsSync(path.join(ROOT, dir))
    ? fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith('.json')).map((f) => path.join(ROOT, dir, f))
    : [];

const strings = [];
const add = (file, where, text) => typeof text === 'string' && strings.push({ file: rel(file), where, text });
for (const f of readDir('data/countries')) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  add(f, 'tagline', d.tagline);
  add(f, 'summary', d.summary);
  (Array.isArray(d.institutions) ? d.institutions : []).forEach((i, k) => add(f, `institutions[${k}] ${i.name}`, i.note));
}
for (const f of readDir('data/destinations')) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  add(f, 'tagline', d.tagline);
  add(f, 'summary', d.summary);
}
for (const f of [...readDir('data/institutions'), ...readDir('data/dk')]) add(f, 'about', JSON.parse(fs.readFileSync(f, 'utf8')).about);
for (const f of readDir('data/schools')) add(f, 'summary', JSON.parse(fs.readFileSync(f, 'utf8')).summary);

const hits = strings.flatMap((s) => rankings(s.text).map((m) => ({ ...s, m })));
const allowedBy = (h) => ALLOW.find((a) => a.file === h.file && h.text.includes(a.match) && a.match.includes(h.m));
const open = hits.filter((h) => !allowedBy(h));

check(`no card, headline or short version ranks without a source (${strings.length} strings read)`, () => {
  assert.equal(
    open.length,
    0,
    `${open.length} ranking(s):\n` +
      open.map((h) => `${h.file} ${h.where}: "${h.m}" in "${h.text.slice(0, 140)}${h.text.length > 140 ? '…' : ''}"`).join('\n') +
      '\nSay what makes the place worth a look instead — a founding year, a count, a fee — from the record itself, ' +
      'or, if the record cites a source for the ranking, add an entry to ALLOW in this file naming it.'
  );
});

check('every exception still matches, and names its source', () => {
  const stale = ALLOW.filter((a) => !hits.some((h) => allowedBy(h) === a));
  const unsourced = ALLOW.filter((a) => typeof a.source !== 'string' || !/https?:\/\//.test(a.source));
  assert.equal(
    stale.length + unsourced.length,
    0,
    [...stale.map((a) => `stale (matches no ranking now; remove it): ${a.file} "${a.match}"`),
      ...unsourced.map((a) => `no source URL: ${a.file} "${a.match}"`)].join('\n')
  );
});

console.log(failures ? `\n${failures} failed.\n` : '\nNo unsourced rankings.\n');
process.exit(failures ? 1 : 0);
