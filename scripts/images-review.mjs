/**
 * The tool for looking at the pictures and deciding.
 *
 *   npm run images:review                       # the summary and the queue, worst first
 *   npm run images:review -- --heroes           # Destination heroes only
 *   npm run images:review -- --all              # the whole queue, not the first 25
 *   npm run images:review -- --show ie-atu      # everything known about one picture
 *   npm run images:review -- --approve ie-atu --by "Anna" --note "Letterkenny campus, autumn"
 *   npm run images:review -- --reject lu-lunex --by "Anna" --note "A solar eclipse."
 *   npm run images:review -- --report           # what the build is currently withholding
 *
 * Gallery photographs are addressed as key#2, key#3 — the slide they become.
 * That spelling survives a shell; `key [2]` does not.
 *
 * Why this exists rather than an instruction to edit JSON: an approval is an
 * accountability record. It has to name a person and a date and the photograph
 * it is about, and the one thing a tired editor at eleven at night will get
 * wrong in a hand-edited 15,000-line JSON file is exactly that. So the tool
 * writes it, refuses to write an unsigned one, and puts the judgement on the
 * picture rather than on the page slot.
 *
 * What it will not do: approve something in bulk. There is no --approve-all,
 * and there is no flag that takes a score threshold and approves everything
 * above it. An approval that nobody looked at is worse than an honest machine
 * pick, because it claims a check that did not happen.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  IMAGE_SCORE_FLOOR,
  REVIEW_THRESHOLD,
  SCORER_VERSION,
  entries,
  isDecided,
  locate,
  review,
  reviewQueue,
  withheldLabel,
  withheldReason,
} from '../src/lib/imagery.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const PICKS = path.join(ROOT, 'data', 'images.json');

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(`--${name}`);
  if (i >= 0) return argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true;
  const eq = argv.find((a) => a.startsWith(`--${name}=`));
  return eq ? eq.slice(name.length + 3) : undefined;
};

const HEROES_ONLY = argv.includes('--heroes');
const SHOW_ALL = argv.includes('--all');
const REPORT = argv.includes('--report');

const picks = JSON.parse(await fs.readFile(PICKS, 'utf8'));
const today = () => new Date().toISOString().slice(0, 10);

/* --- Recording a decision -------------------------------------------------- */

/**
 * Who is signing this off.
 *
 * Deliberately not defaulted to the OS login name. "BlackBox approved this
 * photograph on 23 September" is not an accountability record, it is a machine
 * saying a machine did it, and the whole point of the field is that a person
 * can be asked afterwards what they were looking at. Set IMAGE_REVIEWER once
 * per session and it stops being a nuisance.
 */
function reviewer() {
  const who = flag('by') || process.env.IMAGE_REVIEWER;
  if (typeof who !== 'string' || who.trim().length < 2) {
    console.error(
      '\nWho is approving this? Pass --by "Your name", or set IMAGE_REVIEWER once:\n' +
        '  IMAGE_REVIEWER="Anna Sørensen" npm run images:review -- --approve ie-atu --note "…"\n\n' +
        'An unsigned approval records that nobody checked it, which is what we already had.\n'
    );
    process.exit(2);
  }
  return who.trim();
}

async function decide(address, state) {
  const found = locate(picks, address);
  if (!found) {
    console.error(`\nNo picture called "${address}". Gallery slides are key#2, key#3.\n`);
    process.exit(2);
  }
  const { pick } = found;
  const by = reviewer();
  const note = typeof flag('note') === 'string' ? flag('note') : undefined;

  if (state === 'rejected' && !note) {
    console.error('\nA rejection needs a --note saying what is wrong with it, or the next\n' +
      'person re-fetches the same picture and rejects it again.\n');
    process.exit(2);
  }

  const previous = pick.review;
  pick.review = {
    state,
    by,
    at: today(),
    // The judgement is about this photograph, not about this page slot. If the
    // fetcher ever replaces the file, the approval does not come with it.
    file: pick.file || null,
    ...(note ? { note } : {}),
  };

  await fs.writeFile(PICKS, `${JSON.stringify(picks, null, 2)}\n`);

  console.log(`\n  ${state}  ${address}`);
  console.log(`  ${pick.file || pick.src || ''}`);
  console.log(`  by ${by} on ${pick.review.at}`);
  if (previous) console.log(`  (replaces: ${previous.state} by ${previous.by} on ${previous.at})`);
  if (state === 'approved') console.log('\n  It will publish whatever it scored.');
  else console.log('\n  It will not publish. The page falls back to its typographic panel.');
  console.log('  Run `npm run build` to see it.\n');
}

/* --- Looking at one ------------------------------------------------------- */

function show(address) {
  const found = locate(picks, address);
  if (!found) {
    console.error(`\nNo picture called "${address}".\n`);
    process.exit(2);
  }
  const { pick } = found;
  const reason = withheldReason(pick);
  const row = (k, v) => v != null && v !== '' && console.log(`  ${k.padEnd(11)} ${v}`);

  console.log(`\n${address}\n`);
  row('subject', pick.subject);
  row('file', pick.file);
  row('score', `${pick.score ?? '—'}${pick.scorer ? ` (scorer v${pick.scorer})` : ' (scorer v1)'}`);
  row('flagged', (pick.flags || []).join(', '));
  row('stored', pick.width && pick.height ? `${pick.width}×${pick.height}, ${Math.round((pick.bytes || 0) / 1024)} KB` : null);
  row('fetched', pick.fetched);
  row('author', pick.author);
  row('licence', pick.licence);
  row('says', pick.description);
  console.log('');
  row('on the page', pick.src);
  row('on Commons', pick.page);
  console.log('');
  const r = review(pick);
  if (r) row('reviewed', `${r.state} by ${r.by} on ${r.at}${r.note ? ` — ${r.note}` : ''}`);
  else if (pick.review) row('reviewed', `an incomplete review record, ignored: ${JSON.stringify(pick.review)}`);
  else row('reviewed', 'never — this is a machine pick');
  row('published', reason ? `no — ${withheldLabel(reason)}` : 'yes');
  console.log('');
}

/* --- The queue ------------------------------------------------------------ */

function queue() {
  const all = entries(picks, { heroesOnly: HEROES_ONLY });
  const decided = all.filter((e) => isDecided(e.pick));
  const approved = all.filter((e) => review(e.pick)?.state === 'approved');
  const rejected = all.filter((e) => review(e.pick)?.state === 'rejected');
  const withheld = all.filter((e) => withheldReason(e.pick));
  const pct = (n) => `${Math.round((n / (all.length || 1)) * 100)}%`;

  console.log(`\n${all.length} hosted picture${all.length === 1 ? '' : 's'}${HEROES_ONLY ? ' (Destination heroes)' : ''}\n`);
  console.log(`  looked at by a person   ${String(decided.length).padStart(4)}   ${pct(decided.length)}`);
  console.log(`    approved              ${String(approved.length).padStart(4)}`);
  console.log(`    rejected, not shown   ${String(rejected.length).padStart(4)}`);
  console.log(`  machine pick, unseen    ${String(all.length - decided.length).padStart(4)}   ${pct(all.length - decided.length)}`);
  console.log(`  withheld from the page  ${String(withheld.length).padStart(4)}   floor ${IMAGE_SCORE_FLOOR}, current scorer v${SCORER_VERSION}\n`);

  const q = reviewQueue(picks, { heroesOnly: HEROES_ONLY });
  if (!q.length) {
    console.log('Nothing in the queue. Every picture at or under the review threshold has been looked at.\n');
    return;
  }

  const shown = SHOW_ALL ? q : q.slice(0, 25);
  console.log(
    `${q.length} to look at, worst first — withheld pictures before merely doubtful ones,\n` +
      `then by score. A low score is a reason to look, never a verdict.\n`
  );
  for (const e of shown) {
    const mark = e.reason ? '·withheld·' : '          ';
    console.log(
      `  ${String(e.pick.score ?? '—').padStart(4)} ${mark} ${e.key.padEnd(30)} ${(e.subject || '').slice(0, 30)}`
    );
    console.log(`       ${(e.pick.file || '').slice(0, 72)}`);
    if (e.pick.flags?.length) console.log(`       flagged: ${e.pick.flags.join(', ')}`);
    if (e.pick.page) console.log(`       ${e.pick.page}`);
  }
  if (shown.length < q.length) console.log(`\n  … and ${q.length - shown.length} more. --all to list them.`);

  console.log(`\nOpen the Commons page, look at it, then record what you decided:`);
  console.log(`  npm run images:review -- --approve <key> --by "You" --note "what it shows"`);
  console.log(`  npm run images:review -- --reject  <key> --by "You" --note "what is wrong"`);
  console.log(`To replace one instead, put the Commons filename in data/images.json with "pin": true and`);
  console.log(`  npm run images -- --refresh --only=<key>`);
  console.log(`then approve the result. An approved picture publishes whatever it scored; below ${IMAGE_SCORE_FLOOR}`);
  console.log(`an unreviewed one does not publish at all.\n`);
}

/* --- What the build is withholding ---------------------------------------- */

function report() {
  const withheld = entries(picks, { heroesOnly: HEROES_ONLY })
    .map((e) => ({ ...e, reason: withheldReason(e.pick) }))
    .filter((e) => e.reason)
    .sort((a, b) => (a.pick.score ?? -1) - (b.pick.score ?? -1));

  console.log(`\nWithheld from the site — these pages render their typographic panel.\n`);
  if (!withheld.length) {
    console.log('  Nothing. Every stored picture is either approved or above the floor.\n');
    return;
  }
  for (const e of withheld) {
    console.log(`  ${String(e.pick.score ?? '—').padStart(4)}  ${e.key.padEnd(30)} ${withheldLabel(e.reason)}`);
    console.log(`        ${(e.pick.file || '').slice(0, 76)}`);
  }
  console.log(`\n${withheld.length} withheld. Each is a page with no photograph, which is the point — but`);
  console.log(`a photograph a person chose would be better. Work down the list with --show.\n`);
}

/* --- Dispatch ------------------------------------------------------------- */

const approve = flag('approve');
const reject = flag('reject');
const showKey = flag('show');

if (typeof approve === 'string') await decide(approve, 'approved');
else if (typeof reject === 'string') await decide(reject, 'rejected');
else if (typeof showKey === 'string') show(showKey);
else if (REPORT) report();
else queue();
