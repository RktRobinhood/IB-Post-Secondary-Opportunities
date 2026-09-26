/**
 * Schools: the institutions in the country profiles (data/countries/), each
 * with its own page on the site (issue #43).
 *
 * An institution in a profile used to be a card that linked to its homepage,
 * which left the student to find the English-taught degrees on a foreign site.
 * Each now has a record in data/schools/<key>.json (schemas/school.schema.json)
 * that says what it offers IB students and where exactly to go next, and a
 * page built from it by the same template as the canonical institutions.
 */
import fs from 'node:fs';
import path from 'node:path';
import { slugify } from './html.mjs';
import { identityWords } from './calendar.mjs';

/** The key a profile institution is known by: `fi-uh`, `gb-oxford`. */
export function schoolKey(countryCode, inst) {
  return `${countryCode}-${slugify(inst.shortName || inst.name)}`;
}

/**
 * Where each programme of a listed school record has its own page:
 * /universities/<key>/<slug>/, the slug from the programme's name. Two
 * programmes with one name are told apart by their credential, then their
 * city, then their place in the record, so a slug is unique within its school
 * and stays put while the record is edited around it. The build, the school
 * page's cards and the school-pages guard all read it from here.
 */
export function programmePaths(key, programmes = []) {
  const taken = new Set();
  return programmes.map((p, i) => {
    const base = slugify(p.name) || 'programme';
    const tries = [base, `${base}-${slugify(p.credential)}`, `${base}-${slugify(p.credential)}-${slugify(p.city)}`];
    let slug = tries.find((s) => !s.endsWith('-') && !taken.has(s)) || `${base}-${i + 1}`;
    while (taken.has(slug)) slug = `${slug}-${i + 1}`;
    taken.add(slug);
    return { ...p, slug, href: `/universities/${key}/${slug}/` };
  });
}

/** Every profile institution by key, read straight from data/countries/. */
export function schoolKeys(countriesDir) {
  const out = new Map();
  for (const f of fs.readdirSync(countriesDir).filter((f) => f.endsWith('.json'))) {
    const c = JSON.parse(fs.readFileSync(path.join(countriesDir, f), 'utf8'));
    for (const inst of c.institutions || []) out.set(schoolKey(c.code, inst), inst);
  }
  return out;
}

/** The school records in data/schools/, by key. Missing directory: none. */
export function loadSchools(dir) {
  const out = new Map();
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    out.set(f.slice(0, -5), JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  }
  return out;
}

/**
 * Is this link a homepage — the thing #43 forbids handing a student to?
 *
 * The root of the institution's own site is (`/`, `/en/`, `/en/home/`), and so
 * is the recorded website itself. The root of a different host is not: a
 * dedicated admissions site (admission.snu.ac.kr, future.utoronto.ca) or a
 * national portal is exactly the targeted page a student should land on.
 * Without a website to compare, any root counts, to be safe.
 */
export function isHomepage(link, website) {
  let u;
  try {
    u = new URL(link);
  } catch {
    return false;
  }
  const bare = u.pathname.replace(/\/+$/, '').replace(/\/index\.[a-z]+$/, '');
  /* A front page, or a front page in one of its languages ("/en", "/de-de/home").
     A word that happens to be two letters ("/om", Norwegian for "about") is a page. */
  const lang = bare.match(/^\/([a-z]{2})(?:-[a-z]{2})?(?:\/home)?$/i)?.[1]?.toLowerCase();
  const root = !bare || bare === '/home' || (lang && SITE_LANGUAGES.has(lang));
  if (!root || u.search || u.hash) return false;
  return website ? hostOf(link) === hostOf(website) : true;
}

/** Language codes universities put at the root of their sites. */
const SITE_LANGUAGES = new Set(['en', 'da', 'de', 'fr', 'nl', 'sv', 'se', 'no', 'nb', 'nn', 'fi', 'is', 'es', 'ca', 'eu', 'it', 'pt', 'pl', 'cs', 'cz', 'sk', 'hu', 'et', 'ee', 'lv', 'lt', 'sl', 'hr', 'el', 'gr', 'ro', 'bg', 'ga', 'mt', 'ja', 'jp', 'ko', 'kr', 'zh', 'cn', 'ar', 'tr', 'ru', 'uk', 'int']);

/** A host name for the words beside a link: "helsinki.fi". */
export function hostOf(link) {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/* --- Dates only for Diploma holders ------------------------------------------ */

/**
 * Whether a date's words say it is only for applicants who already hold their
 * IB Diploma: "only if you already hold your IB Diploma", "not for final-year
 * IB students", "diploma already in hand". Such a date carries
 * `forDiplomaHolders` (schemas/common.schema.json); scripts/check-schools.mjs
 * and scripts/test-school-pages.mjs hold the words and the flag together.
 * "IB Diploma holders" alone is not it: that names the qualification (Helsinki's
 * admission group for the IB), not a round a final-year student may not use.
 */
const HOLDERS_WORDING =
  /\balready holds?\b|\bdiploma already in hand\b|\bnot for final-year\b|\bincluding your diploma\b|\bdiploma holders only\b|\bhave not finished the diploma\b/i;
export const saysForDiplomaHolders = (text) => HOLDERS_WORDING.test(String(text || ''));

/**
 * The round a school date belongs to, read off its label: the words before
 * what happens in it ("January round opens (…)", "January round: documents",
 * "January round results" are all "january round"). A round that is for
 * Diploma holders is so on every one of its dates.
 */
export const roundOf = (label) =>
  String(label || '')
    .split(/[:(,;]| (?:opens|closes|deadline|results)\b/i)[0]
    .trim()
    .toLowerCase();

/** The badge on a date only for Diploma holders. */
export const HOLDERS_ONLY = 'Diploma holders only';

/**
 * A programme page's "Apply by" when every closing date is for Diploma
 * holders: no round for a final-year student is published yet, or the
 * programme's only round needs the Diploma in hand (a gap-year option).
 */
export const NOT_OPEN_YET = 'Not open yet';
export const AFTER_DIPLOMA = 'After your Diploma';

/* --- A school's notes, for one of its programmes ------------------------------ */

/**
 * Whether a sentence names a programme: every identifying word of its name
 * (two or fewer), or at least half of them (more), leaving out the school's
 * own name.
 */
function namesProgramme(sentence, q, schoolWords) {
  const want = [...identityWords(q.name)].filter((w) => !schoolWords.has(w));
  if (!want.length) return false;
  const have = identityWords(sentence);
  const hit = want.filter((w) => have.has(w)).length;
  return want.length <= 2 ? hit === want.length : hit / want.length >= 0.5;
}

/**
 * The school record's notes that are one programme's to read, the ones that
 * name it first, then the ones that name no programme: the caveats the
 * researchers wrote next to the dates ("ask UmU first", "you cannot apply
 * yet", "late applications are not accepted"). A note only about another
 * programme is left to that programme's page. `p` and the school's
 * programmes carry their `slug` (programmePaths).
 */
export function notesFor(school, p) {
  const schoolWords = new Set([...identityWords(school.name || '')]);
  const others = (school.programmes || []).filter((q) => q.slug !== p.slug);
  const notes = (school.notes || []).map((text) => ({
    text,
    mine: namesProgramme(text, p, schoolWords),
    theirs: others.some((q) => namesProgramme(text, q, schoolWords)),
  }));
  return [...notes.filter((n) => n.mine), ...notes.filter((n) => !n.mine && !n.theirs)];
}
