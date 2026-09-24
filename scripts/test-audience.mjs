/**
 * Guards on who the site is written for.
 *
 * Registered in scripts/lib/quality-gate.mjs as 'audience' (stage data).
 *
 * The guard exists because every sentence it catches was correct for the
 * reader the site was first written for — a citizen of the country the
 * school is in — and nothing failed when the reader changed. Four fifths of
 * the students at the school are not its citizens. "As a [school-country]
 * citizen you pay nothing" is true for them only by accident, and "a
 * [school-country] citizen may not use this route" tells a Czech student
 * nothing about whether they may.
 *
 * Like test-jurisdictions, it names no country. The school country's people
 * and its citizens-only grants come from the `audience` block in
 * data/site-config.json, and its name and adjective from its own Destination
 * record. The last check reads this file and its library back and refuses
 * them if any of those words has been typed in.
 *
 * A legitimate exception is a reasoned entry in data/audience-allowlist.json,
 * matched by an exact substring rather than a line number. An entry that no
 * longer matches anything fails, so the list cannot rot.
 *
 *   node scripts/test-audience.mjs            # fixtures + the real scan
 *   node scripts/test-audience.mjs --report   # list every hit, do not fail
 *
 * Inventory, verifications and calibration: docs/research/audience/.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { audienceRules, audienceLabels, problemsIn, collectStrings, esc } from './lib/audience.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const HERE = import.meta.filename;
const REPORT = process.argv.includes('--report');

/* --- Harness --------------------------------------------------------------- */

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

console.log('\nAudience guards\n');

/* --- Fixtures. A made-up country, on purpose. ------------------------------ */

const FIX = { name: 'Flatland', adjective: 'Flatlandish', singular: 'Flatlander', plural: 'Flatlanders', grants: ['FG'], groups: ['Coastal'] };
const fr = audienceRules(FIX);
const fl = audienceLabels(FIX);
const flags = (t) => problemsIn(t, fr, fl).map((p) => p.rule.id);

check('refuses the school country as the reader', () => {
  assert.deepEqual(flags('As a Flatlandish citizen you pay no tuition.'), ['identity']);
  assert.deepEqual(flags('A Flatlandish IB student applies through the national route.'), ['reader-noun']);
  assert.deepEqual(flags('EU citizens, including Flatlanders'), ['people']);
  assert.deepEqual(flags('Cheap, close to home, and English-taught'), ['home']);
  assert.deepEqual(flags('Bring your Flatlandish passport or ID card.'), ['documents']);
  assert.deepEqual(flags('a Flatlandish family on a normal income'), ['family']);
});

check("refuses a smaller group's rule stated as the reader's own, whatever the label", () => {
  assert.deepEqual(flags('As a Coastal citizen you do not register with the police.'), ['group-identity']);
  assert.deepEqual(flags('As a Coastal citizen you skip the queue, with equal status.'), ['group-identity']);
  assert.deepEqual(flags('If you are a Coastal citizen, you do not register; other EU/EEA citizens do.'), []);
});

check('the loopholes the first critique found are closed', () => {
  assert.deepEqual(flags('As a Flatlandish citizen you skip the queue, and the course is not Flatlandish-taught.'), ['identity']);
  assert.deepEqual(flags('Since you are Flatlandish, you pay home fees.'), ['identity']);
  assert.deepEqual(flags('If you are Flatlandish, you pay home fees.'), []);
  assert.deepEqual(flags('Your home country, Flatland, pays FG.').includes('home'), true);
  assert.deepEqual(flags('Close to home — and equal status if you have it.'), ['home']);
});

check('refuses a citizens-only fact offered to everyone', () => {
  assert.deepEqual(flags('Flatlandish FG for a full degree abroad, paid monthly to you.'), ['grant']);
  assert.deepEqual(flags('The embassy track is closed to Flatlandish nationals.'), ['nationality-closure']);
});

check('accepts the same fact once it says who it is for', () => {
  assert.deepEqual(flags('If you hold Flatlandish citizenship, FG follows you abroad.'), []);
  assert.deepEqual(flags('Closed to Flatlandish nationals; other nationalities should check whether your country is on the list.'), []);
  assert.deepEqual(flags('On a Flatlandish passport only the university track is open.'), []);
  assert.deepEqual(flags('The university recommends that "Flatlandish applicants" also apply in Flatlandish.'), []);
  assert.deepEqual(flags('A culture close to Flatland\'s and, for anyone who can claim Flatlandish FG, good terms.'), []);
});

check('accepts the school country described as a place, not a nationality', () => {
  for (const t of [
    'Most degrees are taught in Flatlandish.',
    'The Flatlandish 7-point scale.',
    'An IB taken at a school in Flatland counts as international.',
    'Pacific time is nine hours behind Flatland.',
    'The rate for a student living away from home.',
    'As an EU/EEA citizen you pay no tuition.',
  ]) assert.deepEqual(flags(t), [], t);
});

/* --- The real scan --------------------------------------------------------- */

const audience = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/site-config.json'), 'utf8')).audience;
if (!audience?.schoolCountry) throw new Error('data/site-config.json has no audience block — the guard reads the school country from it');
const destination = JSON.parse(fs.readFileSync(path.join(ROOT, `data/destinations/${audience.schoolCountry}.json`), 'utf8'));
/* Groups inside the reader's group that have rights of their own (data/applicant-groups.json). */
const groupTable = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/applicant-groups.json'), 'utf8')).groups || [];
const groups = groupTable.filter((g) => g.adjective && (g.within || []).includes(audience.readerGroup)).map((g) => g.adjective);
const who = { adjective: destination.adjective, name: destination.name, ...audience.schoolCountryPeople, grants: audience.citizenGrants || [], groups };
const rules = audienceRules(who);
const labels = audienceLabels(who);

const allow = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/audience-allowlist.json'), 'utf8')).entries;

const items = collectStrings();
const hits = [];
for (const it of items) for (const p of problemsIn(it.text, rules, labels, it.context)) hits.push({ ...it, ...p });

const allowed = (h) => allow.find((a) => a.file === h.file && h.text.includes(a.match) && (!a.rule || a.rule === h.rule.id));
const open = hits.filter((h) => !allowed(h));

if (REPORT) {
  const by = {};
  for (const h of open) by[`${h.rule.cls} ${h.rule.id}`] = (by[`${h.rule.cls} ${h.rule.id}`] || 0) + 1;
  console.log(`\n  ${items.length} strings read, ${open.length} hits`, by);
  for (const h of open) console.log(`    ${h.rule.cls} ${h.rule.id.padEnd(20)} ${h.file} ${h.where} — "${h.match}"`);
  process.exit(0);
}

check('no student-facing string assumes the reader is a citizen of the school country', () => {
  if (!open.length) return;
  const lines = open.slice(0, 40).map((h) => `${h.file} ${h.where}: "${h.match}" — ${h.rule.why}`);
  assert.fail(`${open.length} string(s):\n${lines.join('\n')}${open.length > 40 ? `\n… and ${open.length - 40} more` : ''}\n` +
    'Rewrite for an EU/EEA student at a school in the country (docs/PRODUCT_VISION.md, "Who it is for"), ' +
    'label a citizens-only fact ("If you hold … citizenship"), or add a reasoned entry to data/audience-allowlist.json.');
});

check('every allowlist entry still matches something, and says why', () => {
  const stale = allow.filter((a) => !hits.some((h) => h.file === a.file && h.text.includes(a.match) && (!a.rule || a.rule === h.rule.id)));
  const unreasoned = allow.filter((a) => typeof a.reason !== 'string' || a.reason.trim().length < 20);
  assert.equal(stale.length + unreasoned.length, 0,
    [...stale.map((a) => `stale: ${a.file} "${a.match}"`), ...unreasoned.map((a) => `no reason: ${a.file} "${a.match}"`)].join('\n'));
});

check('the guard names no country — the data does', () => {
  const src = [HERE, path.join(import.meta.dirname, 'lib', 'audience.mjs')].map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  for (const word of [who.adjective, who.name, who.singular, who.plural, ...who.grants, ...who.groups]) {
    assert.ok(!new RegExp(`\\b${esc(word)}\\b`).test(src), `this file contains "${word}"; read it from data instead`);
  }
});

console.log(failures ? `\n${failures} failed.\n` : '\nAll audience guards pass.\n');
process.exit(failures ? 1 : 0);
