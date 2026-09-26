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
 * The strings a student meets first, before any disclosure, and the two short
 * fields that sit beside them:
 *
 *   - data/countries/*.json      `tagline`, `summary`, `institutions[].note`,
 *                                `institutions[].englishBachelors` (it renders
 *                                as "In English:" on /universities/ and as a
 *                                tag on the card), `ibRecognition.notes`
 *   - data/destinations/*.json   `tagline`, `summary`, `ibRecognition.notes`
 *   - data/institutions/*.json   `about`
 *   - data/dk/*.json             `about` (the input `npm run migrate:dk` copies
 *                                into data/institutions, so a re-run cannot
 *                                bring a ranking back)
 *   - data/schools/*.json        `summary` (it replaces the profile's note on
 *                                the Destination card once a school is researched)
 *
 * Since round 3 of the #41 critique it also reads the prose next to those
 * cards, because every live ranking that critique found was there:
 *
 *   - data/countries/*.json      `whyConsider`
 *   - data/destinations/*.json   `whyConsider`, `sectorLandscape.summary`,
 *                                `sectorLandscape.routes[].what` and `.note`
 *   - data/context-notes/*.json  `text` ("What it is actually like")
 *   - data/topics/*.json         the guide's `options[].what` and `whoItSuits`
 *
 * In that prose a superlative is sometimes about a rule, a scale or a cost,
 * not about an institution or a place: "the only compulsory payment is the ÖH
 * fee", "the score of the lowest-scoring applicant admitted", "the top of the
 * Norwegian scale". Those are listed in NOT_A_RANKING, each with the reason,
 * matched by exact substring, and an entry that stops matching fails — the
 * same discipline as ALLOW. Watch-outs and deadline notes are still not read:
 * there the comparison is nearly always between options for the student.
 *
 * ## House style: "Known for …" and "Strong in …"
 *
 * The site's owner wants each school to say what it is known for and what it
 * is like. So "Known for <subjects>" and "Strong in <subjects>" are the house
 * style, and allowed, when what follows is the subjects, programmes or
 * features the record itself lists (`notableFields`, `knownFor`, the
 * programme list): "Known for marine and climate science", "strong in food,
 * pharma and life sciences". They say where the institution's weight is, not
 * how good it is.
 *
 * What is not allowed is "known for" followed by praise: "known for
 * excellence", "known for its quality", "known for its rigour", "a strong
 * reputation". Those are the reputation claims this guard exists to stop,
 * and the rule flags them wherever they stand.
 *
 * ## The rule
 *
 * A ranking is a claim that puts an institution or a place above, first, or
 * alone among others. The first version of this guard listed eleven words and
 * missed 21 of 31 phrasings a critic tried ("smallest", "northernmost",
 * "highest-ranked", "well-regarded", "unlike anywhere", "one of the few"…). So
 * the vocabulary now follows the definition, in four shapes:
 *
 *   1. Words that rank wherever they stand: "by far", "best known", "well
 *      known", "well regarded", "highly regarded", "best-value", "world-class",
 *      "world-leading", "world-famous", "famous(ly)", "renowned", "prestigious",
 *      "excellent", "unique(ly)", "premier", "unlike any(where)", "one of (the |
 *      relatively | very) few", "top-100", "No. 1", and a ranking verb used of
 *      a place — "top-ranked", "highly ranked", "ranked among / first / in the
 *      top". "Ranked" on its own is not flagged: "ranked on the SAT", "ten
 *      ranked choices" and "pass/fail rather than ranked by grade" are about
 *      applicants, and they are how selection works.
 *   2. Any superlative inside a comparison frame. The frame is "the", "one of
 *      the", "among the", or a possessive naming the field ("Germany's", "the
 *      world's", "the Netherlands'", "the country's"). The superlative is any
 *      -est or -most word ("smallest", "clearest", "northernmost"), "most
 *      <adjective>", an "-ranked" compound, best, worst, top, leading or only.
 *   3. An ordinal after a possessive field: "Hong Kong's first private
 *      university", "the world's fifth film school", "Sweden's second city".
 *   4. Being first: "the first private university in the country to teach in
 *      English", "the first English-language degree at a German public
 *      university".
 *
 * Round 2 of the critique added praise that is not a superlative, and closed
 * three gaps:
 *
 *   - to shape 1: "reputation", "powerhouse", "internationally known /
 *     recognised", "well-respected", "top-tier", "elite", "a leading", "a top",
 *     "one of only …", "the sole", "than any other", "nowhere else", "rare in
 *     Europe", "great universities", "ranked 45th" and "flagship". A US
 *     "public flagship" is the name of a kind of state university, and the
 *     "6G Flagship" and "Elite Institute" are names, so those stay.
 *   - to shape 2: an ordinal or "very" before the superlative ("the second
 *     largest", "among the very best").
 *   - "its largest university": the "its" scope exemption is for an
 *     institution's own campus, programme or door. "Its" followed by an -est
 *     word and university, school, institution or city is a country ranking
 *     its institutions, and is flagged.
 *
 * Deliberately not flagged, because they are not rankings:
 *
 *   - "most" as a quantifier, with no frame: "most bachelor's are three years".
 *   - "only" as an adverb: "taught only in German", "entry is only through
 *     the MedAT".
 *   - A scope statement about the institution's *own* offer, written with its
 *     possessive: "Its only English door is Classical Ballet", "its newest
 *     campus". That compares the institution with nothing; it says what it
 *     teaches, and the record lists what it teaches. Write it with "its", not
 *     "the" or the institution's name: "the only English door" reads the same
 *     to a student but cannot be told apart from "the only conservatoire in
 *     Czechia" by any rule short of a parser.
 *   - -est words that are not superlatives (rest, test, interest, west…), and
 *     the ones that order dates and places rather than rank institutions
 *     ("the latest", "the earliest sitting", "the nearest centre").
 *   - "the highest grade / level / score" and "the lowest …": how a rule reads
 *     a transcript.
 *   - "the most recent", "the most likely".
 *   - "the first cohort", "the first year", "the first opens in October":
 *     first in time, not first among institutions.
 *
 * Oldest, largest, smallest and youngest are measurable, but they are still
 * comparisons with every other institution in the field, and none of the
 * records carried the source that would establish one. Use what the record
 * does hold — a count, a fee, a named programme — and only then a founding
 * year, which /universities/ already shows in its own tile.

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
import { rankings } from './lib/superlatives.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');

/* --- The rule: scripts/lib/superlatives.mjs --------------------------------- */

/* --- Exceptions: a ranking whose record cites a source for it ---------------- */

const ALLOW = [
  {
    file: 'data/countries/ee.json',
    match: "The widest choice of English-taught bachelor's degrees in Estonia: six of the 27 on the national list",
    source:
      "counted from Study in Estonia's national list of English-taught bachelor's, " +
      'https://www.studyinestonia.ee/study/programmes/bachelors-programmes: six of 27 at Tallinn University, more than at any other ' +
      'institution (ev-ee-sie-bachelors-list in data/evidence/ee.json; the count is also in ee.json language.englishTaughtBachelors).',
  },
  {
    file: 'data/countries/lu.json',
    match: "The country's only public university",
    source:
      'ev-lu-mengstudien-sector (data/evidence/lu.json): the Ministry of Higher Education, ' +
      'https://mengstudien.public.lu/en/etudier-luxembourg.html — "The University of Luxembourg is the only public university in the country".',
  },
  {
    file: 'data/destinations/lu.json',
    match: 'the Université du Luxembourg is the only public university',
    source:
      'ev-lu-mengstudien-sector (data/evidence/lu.json): the Ministry of Higher Education, ' +
      'https://mengstudien.public.lu/en/etudier-luxembourg.html — "The University of Luxembourg is the only public university in the country".',
  },
  {
    file: 'data/destinations/lu.json',
    match: 'The only public university.',
    source:
      'ev-lu-mengstudien-sector (data/evidence/lu.json): the Ministry of Higher Education, ' +
      'https://mengstudien.public.lu/en/etudier-luxembourg.html — "The University of Luxembourg is the only public university in the country".',
  },
];

/* --- Not a ranking: a superlative about a rule, a scale or a cost ---------------
 *
 * The prose fields read since round 3 sometimes use a superlative about
 * something that is not an institution or a place. Each entry says why. It is
 * matched by exact substring and fails when it no longer matches, as ALLOW
 * does. A comparison scoped to this page's own list ("of the five
 * universities covered here") is allowed here too: it is checkable on the
 * page, which is the scope convention the critiques accepted. */
const NOT_A_RANKING = [
  { file: 'data/countries/at.json', match: 'the only compulsory payment is the OeH fee', why: 'a fee, not an institution' },
  { file: 'data/countries/cz.json', match: 'the only Czech faculty in this guide known to do so', why: "scoped to this page's own faculty records" },
  { file: 'data/countries/hk.json', match: "HKU's first round closes", why: 'first in time: the first application round' },
  { file: 'data/countries/no.json', match: 'the top of the Norwegian scale', why: 'a grading scale' },
  { file: 'data/destinations/au.json', match: 'It is the only one confirmed open to a candidate sitting the exams in Europe', why: "admissions systems, scoped to what this page confirms" },
  { file: 'data/destinations/hk.json', match: 'Of the five universities covered here, it is the only one.', why: "scoped to this page's five universities" },
  { file: 'data/destinations/it.json', match: 'the most anyone paid was about', why: 'a fee ceiling' },
  { file: 'data/destinations/jp.json', match: 'the only decision here that lands after the examination session', why: "scoped to this page's deadlines" },
  { file: 'data/destinations/nz.json', match: 'are the only providers NZQA does not quality assure', why: 'a statutory fact about quality assurance, not a ranking' },
  { file: 'data/destinations/sg.json', match: 'the only institutions where the MOE Tuition Grant', why: 'who the grant applies to' },
  { file: 'data/context-notes/de-subjects-decide.json', match: 'Excellent points do not compensate', why: "a student's grades" },
  { file: 'data/context-notes/dk-aau-pbl.json', match: 'the worst part of the Diploma', why: "the student's own experience" },
  { file: 'data/context-notes/ie-free-fees-are-not-free.json', match: 'the largest predictable cost of an Irish degree', why: 'a cost' },
  { file: 'data/context-notes/ie-points-are-a-market.json', match: 'the lowest-scoring applicant admitted', why: 'how CAO points are set' },
  { file: 'data/context-notes/se-january-is-the-deadline.json', match: 'carries the most English-taught programmes', why: 'the two Swedish admission rounds' },
  { file: 'data/context-notes/se-nothing-to-add.json', match: 'the highest-ranked place that accepts you', why: 'how Swedish offers are made' },
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
    // Round 1 of the #41 critique: phrasings the first version let through.
    "Switzerland's smallest and newest public university.",
    "Denmark's smallest and youngest university.",
    "The world's northernmost university.",
    "France's highest-ranked research university.",
    'Not Russell Group but consistently top-ranked.',
    'A top-100 world position in agriculture.',
    'One of the clearest IB rules in Europe and one of the strictest.',
    'The broadest subject range of any London university.',
    "Home of FAMU, the world's fifth university-level film school.",
    'With a well-regarded medical school.',
    'The famous schools cost 100x that.',
    'World-famous for medical research.',
    'Cheap, excellent, and mostly not in English.',
    'A premier business school.',
    'The finest faculty in the region.',
    'In a city that is unlike anywhere else.',
    'One of the few German institutions with a full English bachelor.',
    'Its veterinary degree is one of relatively few in Europe.',
    'The first private university in the country to teach in English.',
    'The first institution in the Soviet Union to teach business in English.',
    'Described as the first English-language liberal arts degree at a German public university.',
    'Ranked first in the country for law.',
    'Close to unique in English anywhere in the EU.',
    'The country’s largest and best known university.',
    'A well-known forestry programme.',
    "Hong Kong's first private university.",
    // Round 2 of the critique: praise that is not a superlative, and the gaps.
    'A leading research university.',
    'The second largest university in Denmark.',
    'One of only three conservatoires.',
    'The sole public university.',
    "Estonia's flagship university.",
    'A well-respected law school.',
    'Small and young, with a strong reputation for teaching quality.',
    'The business and economics powerhouse.',
    'Its game development programme is internationally known.',
    'An elite institution.',
    'A top-tier business school.',
    'Among the very best in Europe.',
    "One of Europe's great universities.",
    'More English-taught degrees than any other Danish university.',
    'A programme found nowhere else in Europe.',
    'A degree that is rare in Europe.',
    'Ranked 45th in the world.',
    "Norway's engineering powerhouse and its largest university.",
    // Round 3 of the critique: soft praise, and "known for" + praise.
    'An aviation engineering programme you will not find elsewhere in the region.',
    'Far better regarded by German employers than the translation suggests.',
    'Problem-based learning, which it pioneered in medicine.',
    'Its teaching is second to none.',
    'An unrivalled alumni network.',
    'A world leader in marine science.',
    'Estonia is often described as teaching in English.',
    'A highly rated business school.',
    'A household name in design.',
    'The go-to university for engineers.',
    'A small university that punches above its weight.',
    'Ranks 12th in the world for law.',
    'Known for excellence in teaching.',
    'Known for its rigour.',
    'Well known for its prestigious law school.',
    'A strong reputation for teaching quality.',
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
    'Group I is ranked on the SAT or ACT.',
    'One application with ten ranked choices, closing 15 April.',
    'Admission is pass/fail rather than ranked by grade.',
    'Where a subject was taken at several levels, the highest grade counts.',
    'The first opens in October and closes on 15 January.',
    'Its international track is new; the first cohort entered in autumn 2026.',
    'Read together, the most likely reading is that the leaflet is specific.',
    'The latest date to register is 31 March; the nearest centre is in Oslo.',
    'In Vejle, its newest campus.',
    'The first year can be taken in English.',
    'It is the public flagship of the state system.',
    'The SJTU-ParisTech Elite Institute of Technology teaches in French.',
    'Home of the 6G Flagship programme.',
    // The house style: "Known for / Strong in" + the subjects the record lists.
    'Known for marine and climate science.',
    'Strong in food, pharma and life sciences.',
    'Known for film, drama and the performing arts.',
    'A campus university known for mathematics and economics.',
    'Its newest campus is in Vejle.',
    'Its biggest faculty is engineering.',
    'Places go down the ranking, and you pay the rest.',
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
  (Array.isArray(d.institutions) ? d.institutions : []).forEach((i, k) => {
    add(f, `institutions[${k}] ${i.name}`, i.note);
    add(f, `institutions[${k}] ${i.name} englishBachelors`, i.englishBachelors);
  });
  (d.ibRecognition?.notes || []).forEach((n, k) => add(f, `ibRecognition.notes[${k}]`, n));
}
for (const f of readDir('data/destinations')) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  add(f, 'tagline', d.tagline);
  add(f, 'summary', d.summary);
  (d.ibRecognition?.notes || []).forEach((n, k) => add(f, `ibRecognition.notes[${k}]`, n));
}
for (const f of [...readDir('data/institutions'), ...readDir('data/dk')]) add(f, 'about', JSON.parse(fs.readFileSync(f, 'utf8')).about);
for (const f of readDir('data/schools')) add(f, 'summary', JSON.parse(fs.readFileSync(f, 'utf8')).summary);
// The prose beside the cards (round 3 of the critique).
for (const f of readDir('data/countries')) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  (d.whyConsider || []).forEach((t, k) => add(f, `whyConsider[${k}]`, t));
}
for (const f of readDir('data/destinations')) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  (d.whyConsider || []).forEach((t, k) => add(f, `whyConsider[${k}]`, t));
  add(f, 'sectorLandscape.summary', d.sectorLandscape?.summary);
  (d.sectorLandscape?.routes || []).forEach((r, k) => {
    add(f, `sectorLandscape.routes[${k}].what`, r.what);
    add(f, `sectorLandscape.routes[${k}].note`, r.note);
  });
}
for (const f of readDir('data/context-notes')) add(f, 'text', JSON.parse(fs.readFileSync(f, 'utf8')).text);
for (const f of readDir('data/topics')) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  (d.options || []).forEach((o, k) => {
    add(f, `options[${k}].what`, o.what);
    add(f, `options[${k}].whoItSuits`, o.whoItSuits);
  });
}

if (process.argv.includes('--report')) {
  for (const s of strings) {
    const m = rankings(s.text);
    if (m.length) console.log(`${s.file} | ${s.where} | [${m.join('; ')}]\n    ${s.text}\n`);
  }
  process.exit(0);
}

const hits = strings.flatMap((s) => rankings(s.text).map((m) => ({ ...s, m })));
const allowedBy = (h) => ALLOW.find((a) => a.file === h.file && h.text.includes(a.match) && a.match.includes(h.m));
const notRanking = (h) => NOT_A_RANKING.find((n) => n.file === h.file && h.text.includes(n.match) && n.match.toLowerCase().includes(h.m.toLowerCase()));
const open = hits.filter((h) => !allowedBy(h) && !notRanking(h));

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

check('every not-a-ranking entry still matches, and says why', () => {
  const stale = NOT_A_RANKING.filter((n) => !hits.some((h) => notRanking(h) === n));
  const unreasoned = NOT_A_RANKING.filter((n) => typeof n.why !== 'string' || n.why.length < 5);
  assert.equal(stale.length + unreasoned.length, 0,
    [...stale.map((n) => `stale (remove it): ${n.file} "${n.match}"`), ...unreasoned.map((n) => `no reason: ${n.file} "${n.match}"`)].join('\n'));
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
