/**
 * How much of the imagery a person has actually looked at.
 *
 *   node scripts/images-review.mjs            # the summary and the worst unreviewed
 *   node scripts/images-review.mjs --heroes   # country heroes only
 *
 * Two automated rules were tried for this judgement and both failed in both
 * directions — a score floor throws away "MCAST Campus.jpg", and matching the
 * institution's name in the filename keeps "Beer Die Bowdoin College - 1989".
 * Whether a photograph says something true about studying somewhere is not a
 * property a scorer can reach, so this reports rather than decides.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const HEROES_ONLY = process.argv.includes('--heroes');

const picks = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'images.json'), 'utf8'));

// A gallery photograph is published exactly as a primary one is, so it counts
// exactly as one. Reporting only the primaries would have flattered the number.
const entries = [];
for (const [key, v] of Object.entries(picks)) {
  if (!HEROES_ONLY || v.kind === 'country') entries.push([key, v]);
  if (HEROES_ONLY) continue;
  for (const [i, g] of (v.gallery || []).entries()) entries.push([`${key} [${i + 2}]`, g]);
}

const reviewed = entries.filter(([, v]) => v.review?.state);
const approved = entries.filter(([, v]) => v.review?.state === 'approved');
const rejectedPicks = entries.filter(([, v]) => v.review?.state === 'rejected');
const unreviewed = entries.filter(([, v]) => !v.review?.state);

const pct = (n) => `${Math.round((n / entries.length) * 100)}%`;
console.log(`\n${entries.length} hosted picture${entries.length === 1 ? '' : 's'}${HEROES_ONLY ? ' (country heroes)' : ''}\n`);
console.log(`  looked at by a person   ${String(reviewed.length).padStart(4)}   ${pct(reviewed.length)}`);
console.log(`    approved              ${String(approved.length).padStart(4)}`);
console.log(`    rejected, not shown   ${String(rejectedPicks.length).padStart(4)}`);
console.log(`  machine pick, unseen    ${String(unreviewed.length).padStart(4)}   ${pct(unreviewed.length)}\n`);

const worst = unreviewed
  .filter(([, v]) => typeof v.score === 'number')
  .sort((a, b) => a[1].score - b[1].score)
  .slice(0, 20);

if (worst.length) {
  console.log('Unreviewed, lowest-scoring first. A low score is a hint to look, not a verdict:\n');
  for (const [key, v] of worst) {
    console.log(`  ${String(v.score).padStart(4)}  ${key.padEnd(30)} ${(v.file || '').slice(0, 54)}`);
  }
  console.log('\nOpen one, decide, then record it in data/images.json:');
  console.log('  "review": { "state": "approved" | "rejected", "by": "...", "at": "YYYY-MM-DD", "note": "why" }');
  console.log('A rejected picture is not published and the page falls back to its typographic panel.');
  console.log('To replace one instead, set "file" to a Commons filename with "pin": true and re-run');
  console.log('  npm run images -- --refresh --only=<key>');
}
console.log('');
