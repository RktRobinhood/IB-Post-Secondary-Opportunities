/**
 * Merge researched programme overviews into the school records.
 *
 *   node scripts/merge-overviews.mjs            # write
 *   node scripts/merge-overviews.mjs --dry      # report only
 *
 * Reads docs/research/overviews/batch-*.results.jsonl (one line per
 * programme: { key, name, overview, sources }; the brief is BRIEF.md in that
 * folder) and sets `overview` on the programme of that name in
 * data/schools/<key>.json. The last line for a programme wins. A line whose
 * overview fails the house rules is reported and left out:
 *   - 200–900 characters, one paragraph, no markdown;
 *   - no requirements, dates, fees or scores (the page says those elsewhere);
 *   - no meta language about the page or the website.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIR = path.join(ROOT, 'docs', 'research', 'overviews');
const DRY = process.argv.includes('--dry');

const OFF_TOPIC = [
  [/\b(IB|International Baccalaureate)\b|\bpoints?\b.*\b(minimum|required)\b/i, 'entry scores'],
  [/\b(tuition fees?|fees?)\b|€|\$\d/i, 'fees'],
  [/\bEUR\s?\d/, 'fees'],
  [/\b(deadline|apply by|application (period|round|window))\b/i, 'deadlines'],
  [/\bECTS\b/, 'credit totals'],
  [/\b(this page|the website|the webpage|according to the|more information|click here)\b/i, 'meta language'],
  [/\b(world-class|cutting-edge|unique|exciting|dynamic|renowned|prestigious)\b/i, 'marketing'],
];

function check(text) {
  if (typeof text !== 'string') return 'no overview';
  const t = text.trim();
  if (t.length < 200) return `too short (${t.length})`;
  if (t.length > 900) return `too long (${t.length})`;
  const words = t.split(/\s+/).length;
  if (words > 130) return `${words} words; the overview's budget is 130 (scripts/test-text-walls.mjs)`;
  if (/\n|\*\*|^\s*[-•]/.test(t)) return 'not one plain paragraph';
  for (const [re, why] of OFF_TOPIC) if (re.test(t)) return why;
  return null;
}

const lines = new Map();
for (const f of fs.readdirSync(DIR).filter((x) => /^batch-\d+\.results\.jsonl$/.test(x)).sort()) {
  for (const raw of fs.readFileSync(path.join(DIR, f), 'utf8').split('\n')) {
    if (!raw.trim()) continue;
    let r;
    try { r = JSON.parse(raw); } catch { console.warn(`${f}: unreadable line ${raw.slice(0, 60)}`); continue; }
    // Rows that share a name (one degree per campus or specialisation) are told apart by their source.
    if (r.key && r.name) lines.set(`${r.key}\u0000${r.name}\u0000${(r.sources || [])[0] || ''}`, { ...r, file: f });
  }
}

/* Boilerplate: a long sentence that many overviews share (one conservatoire's
   twenty instrument degrees) says nothing about any one of them, and the
   text-wall guard fails a 12-word sentence on more than 10 pages. Such
   overviews are held back; their programmes belong on one card with paths. */
const SHARED_MAX = 8;
const sentencesOf = (t) => (t || '').split(/(?<=[.!?])\s+(?=[A-Z])/).filter((s) => s.split(' ').length >= 12).map((s) => s.replace(/\d[\d,.]*/g, '#'));
const sentenceUse = new Map();
for (const r of lines.values()) for (const s of new Set(sentencesOf(r.overview))) sentenceUse.set(s, (sentenceUse.get(s) || 0) + 1);
const boilerplate = (t) => {
  const n = Math.max(0, ...sentencesOf(t).map((s) => sentenceUse.get(s) || 0));
  return n > SHARED_MAX ? `a sentence shared by ${n} overviews (merge these programmes into one card with paths)` : null;
};

const byKey = new Map();
for (const r of lines.values()) {
  if (!byKey.has(r.key)) byKey.set(r.key, []);
  byKey.get(r.key).push(r);
}

let set = 0, same = 0, held = 0, missing = 0, taken = 0;
const problems = [];
for (const [key, rows] of byKey) {
  const file = path.join(ROOT, 'data', 'schools', `${key}.json`);
  if (!fs.existsSync(file)) { problems.push(`${key}: no school record`); missing += rows.length; continue; }
  let source = fs.readFileSync(file, 'utf8');
  const rec = JSON.parse(source);
  let changed = false;
  for (const r of rows) {
    const named = (rec.programmes || []).filter((q) => q.name === r.name);
    const p = named.length > 1 ? named.find((q) => (r.sources || []).includes(q.url)) : named[0];
    if (named.length > 1 && !p) { problems.push(`${key} / ${r.name}: ${named.length} rows share the name and no source matches one`); held++; continue; }
    if (!p) { problems.push(`${key}: no programme "${r.name}"`); missing++; continue; }
    const why = r.overview == null ? 'no overview' : check(r.overview) || boilerplate(r.overview);
    if (why) {
      if (r.overview != null) problems.push(`${key} / ${r.name}: ${why}`);
      held++;
      if (!p.overview) continue; // nothing to take out
    }
    // A held line takes out an overview merged earlier.
    const text = why ? null : r.overview.trim().replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\b([Mm]aster|[Bb]achelor) (degree|programme|level|studies)\b/g, "$1's $2");
    if (text && p.overview === text) { same++; continue; }
    /* Written into the text, not re-serialised, so each record keeps its own
       layout (most hold one programme per line): the overview goes straight
       after the programme's `about`, replacing an earlier one. */
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const about = new RegExp(`("about"\\s*:\\s*${esc(JSON.stringify(p.about))})(\\s*,\\s*"overview"\\s*:\\s*"(?:[^"\\\\]|\\\\.)*")?(,?)(\\s*)`, 'g');
    /* The programme's own `about`: the only one with that text, or else (rows
       that share a one-liner) the first after the programme's own name. */
    const hits = [...source.matchAll(about)];
    let at = hits.length === 1 ? hits[0] : null;
    if (!at) {
      const names = [...source.matchAll(new RegExp(`"name"\\s*:\\s*${esc(JSON.stringify(p.name))}`, 'g'))];
      if (names.length === 1) at = hits.find((h) => h.index > names[0].index) || null;
    }
    if (!at) { problems.push(`${key} / ${r.name}: its about appears ${hits.length} times in the file`); held++; continue; }
    const [whole, head, , comma, space] = at;
    const sep = /\n/.test(space) ? space : ' ';
    const added = text ? `,${sep}"overview": ${JSON.stringify(text)}` : '';
    source = `${source.slice(0, at.index)}${head}${added}${comma}${space}${source.slice(at.index + whole.length)}`;
    changed = true;
    if (text) set++; else taken++;
  }
  if (changed && !DRY) {
    JSON.parse(source); // never write a broken record
    fs.writeFileSync(file, source);
  }
}

console.log(`overviews: ${set} set, ${same} unchanged, ${held} held back (${taken} taken out), ${missing} unmatched`);
for (const p of problems) console.log(`  · ${p}`);
