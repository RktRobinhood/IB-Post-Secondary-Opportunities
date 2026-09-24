/**
 * The rules the audience guard applies (scripts/test-audience.mjs), built from
 * data so that no country is named in code. Pure functions, plus the one reader
 * of data/ and src/ that decides what counts as student-facing.
 *
 * Why it exists: docs/PRODUCT_VISION.md, "Who it is for". The inventory, plan
 * and verifications behind it are in docs/research/audience/.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..", "..");

/* --- The rules, built from data ------------------------------------------- */

export const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function audienceRules({ adjective, singular, plural, name, grants = [] }) {
  const a = esc(adjective);
  const n = esc(name);
  const g = grants.length ? `(?:${grants.map(esc).join('|')})` : '(?!)';
  const who = '(?:student|applicant|candidate|IB student|IB candidate|school[- ]leaver|reader|pupil)';
  return [
    /* "As a [x] citizen you pay nothing" is the reader-as-citizen form. "Only
       the University Track is available to a [x] citizen" is a statement about
       citizens, i.e. a label, and is left to the B rules. */
    { id: 'identity', cls: 'A', why: 'treats the reader as a citizen of the school country',
      re: new RegExp(`\\bas an? ${a}(?: \\(EU\\)| EU| or other EU(?:/EEA)?)? (?:citizen|national|speaker|${who})\\b|\\b(?:for|to) an? ${a} ${who}\\b|\\b${a} (?:and|or) other EU\\b`, 'i') },
    { id: 'reader-noun', cls: 'A', why: 'the school country\'s students as the default reader',
      re: new RegExp(`\\b(?:a|an|the|any|every|most|many|typical) ${a} ${who}s?\\b|\\b${a} (?:students|applicants|candidates|IB students|IB candidates|school[- ]leavers)\\b`, 'i') },
    { id: 'family', cls: 'A', why: 'assumes the family is from the school country',
      re: new RegExp(`\\b${a} (?:family|families|household|parents|income)\\b|\\bfamily['’]s ${a}\\b`, 'i') },
    { id: 'documents', cls: 'A', why: 'assumes the reader holds the school country\'s documents',
      re: new RegExp(`\\b(?:your|with an?|bring an?) ${a} (?:passport|ID card|national ID|EHIC|blue card|yellow card|health card|cover|insurance)\\b|\\b(?:Health Insurance Card|EHIC)\\b[^.]{0,25}\\bfrom ${n}\\b`, 'i') },
    { id: 'people', cls: 'A', why: 'names the reader by the school country\'s demonym',
      re: new RegExp(`\\b(?:${esc(singular)}|${esc(plural)})\\b`) },
    { id: 'home', cls: 'A', why: 'assumes the school country is home',
      re: /\b(?:close to|not far from|near|back) home\b/i },
    { id: 'standards', cls: 'A', why: 'treats the school country\'s norms as the reader\'s',
      re: new RegExp(`\\bby ${a} standards\\b`, 'i') },
    /* B rules: allowed when labelled, anywhere in the same string. */
    /* The grant named as the country's, or offered to "you" in one sentence.
       "The [x] <grant> reform" is news about the grant, not an offer of it. */
    { id: 'grant', cls: 'B', why: 'a citizens\' grant offered without saying who can claim it',
      re: new RegExp(`\\b(?:${a}|${n}['’]s) ${g}\\b(?! reform)|\\b(?:you|your)\\b[^.]{0,60}\\b(?:claim|get|receive|take|keep|bring|apply for|entitled to|funding|support)\\b[^.]{0,25}\\b${g}\\b(?! reform)|\\b${g}\\b(?! reform)[^.]{0,80}\\b(?:you|your)\\b`), needsLabel: true },
    { id: 'nationality-closure', cls: 'B', why: 'a closure true for one nationality, stated as if for everyone',
      re: new RegExp(`\\b(?:closed|not open|not offered|not available|not eligible|ineligible|cannot|may not)\\b[^.]{0,80}\\b${a} (?:citizens?|nationals?|passport)\\b|\\b${a} (?:citizens?|nationals?)\\b[^.]{0,40}\\b(?:is|are) (?:NOT|not) (?:eligible|allowed|open)`, 'i'),
      needsLabel: true },
  ];
}

export function audienceLabels({ adjective }) {
  const a = esc(adjective);
  return [
    new RegExp(`\\b(?:if|unless|when|once|whether) you (?:hold|have|are)(?: an?)? ${a} (?:citizen(?:ship)?|national(?:ity)?|passport)`, 'i'),
    new RegExp(`\\b${a} citizens? only\\b|\\bonly (?:to|for) ${a} (?:citizens|nationals)\\b|\\bfor ${a} (?:citizens|nationals)\\b`, 'i'),
    new RegExp(`\\b(?:without|not|non-)\\s?${a}\\b|\\bnot ${a} citizens?\\b`, 'i'),
    new RegExp(`\\bon an? ${a} passport\\b`, 'i'),
    new RegExp(`\\b${a} citizens?,? (?:or|and) (?:an? )?(?:other )?EU`, 'i'),
    /\b(?:if you|anyone who|who) (?:can claim|qualify for|may qualify for|are eligible for|is eligible for)\b/i,
    /\bequal status\b/i,
    /\b(?:your|other) nationalit(?:y|ies)\b|\bother nationals\b|\bcountry (?:of|where you hold) (?:your )?citizenship\b|\bwhether your country\b|\byour own country['’]s\b/i,
  ];
}

/** A src line is a fragment; its label may sit on a neighbouring line. */
export const SRC_CONTEXT_LINES = 4;

const sentences = (s) => s.split(/(?<=[.!?:;])\s+/);

/* A match that opens a quotation is the source's words, quoted — 'AU
   recommends that "[x] applicants" also apply' — which is how a page should
   report a source that itself assumes its reader. */
const OPEN_QUOTE = /["“‘]$/;
const quoted = (s, m) => OPEN_QUOTE.test(s.slice(0, m.index));

/** Every problem in one string. Pure: this is what the fixtures exercise. */
export function problemsIn(text, rules, labels, context = text) {
  const out = [];
  const labelledString = labels.some((l) => l.test(context));
  for (const rule of rules) {
    if (rule.needsLabel) {
      const m = text.match(rule.re);
      if (m && !labelledString && !quoted(text, m)) out.push({ rule, match: m[0] });
      continue;
    }
    for (const s of sentences(text)) {
      const m = s.match(rule.re);
      if (m && !labels.some((l) => l.test(s)) && !quoted(s, m)) out.push({ rule, match: m[0] });
    }
  }
  return out;
}

/* --- What is read --------------------------------------------------------- */

const SKIP_FILES = /^data\/(harvests|geo)\/|^data\/source-fingerprints\.json$|^data\/audience-allowlist\.json$/;
/* The audience settings name the school country's people on purpose. */
const SKIP_IN = { 'data/site-config.json': /^audience(\.|$)/ };
/* Verbatim quotations are the source's words, not ours. */
const SKIP_PATH = /(^|\.)(excerpt|quote|url|href|sourceUrl|officialUrl)$|sourceCheck/;

function* jsonStrings(v, p = '', parent = null) {
  if (typeof v === 'string') yield [p, v, parent];
  else if (Array.isArray(v)) for (let i = 0; i < v.length; i++) yield* jsonStrings(v[i], `${p}[${i}]`, v);
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) yield* jsonStrings(x, p ? `${p}.${k}` : k, v);
}

/* A funding line written as { fund, note } is rendered after its scheme's
   own label of who can claim it (src/lib/data.mjs fundingLine), so the note
   is read in that context rather than on its own. */
const LABELLED_BY_REFERENCE = ' (if you can claim it)';

const walk = (dir, exts) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const f = path.join(dir, e.name);
    return e.isDirectory() ? walk(f, exts) : exts.some((x) => e.name.endsWith(x)) ? [f] : [];
  });
const rel = (f) => path.relative(ROOT, f).split(path.sep).join('/');

/** Code with its comments blanked out, line numbers kept. URLs survive. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:\\'"`])\/\/.*$/gm, '$1');
}

export function collectStrings() {
  const items = [];
  for (const f of walk(path.join(ROOT, 'data'), ['.json'])) {
    const r = rel(f);
    if (SKIP_FILES.test(r)) continue;
    for (const [p, s, parent] of jsonStrings(JSON.parse(fs.readFileSync(f, 'utf8')))) {
      if (SKIP_PATH.test(p) || SKIP_IN[r]?.test(p)) continue;
      const context = parent && !Array.isArray(parent) && parent.fund && p.endsWith('.note') ? s + LABELLED_BY_REFERENCE : s;
      items.push({ file: r, where: p, text: s, context });
    }
  }
  for (const dir of ['src/pages', 'src/lib', 'src/assets/js', 'src/templates']) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of walk(abs, ['.mjs', '.js', '.html'])) {
      const lines = stripComments(fs.readFileSync(f, 'utf8')).split('\n');
      lines.forEach((line, i) => line.trim() && items.push({
        file: rel(f),
        where: `L${i + 1}`,
        text: line,
        context: lines.slice(Math.max(0, i - SRC_CONTEXT_LINES), i + SRC_CONTEXT_LINES + 1).join(' '),
      }));
    }
  }
  return items;
}

