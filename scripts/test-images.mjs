/**
 * Guards on what a picture is allowed to be.
 *
 * The valuable tests here are the negative ones. Nothing in this repository was
 * ever going to fail loudly over imagery: every one of the pictures issue #17
 * complained about was correctly sized, correctly cropped, correctly licensed
 * and correctly credited, and passed `npm run check` without a murmur. A solar
 * eclipse standing in for a university in Luxembourg is not an error state. It
 * is a successful run of a pipeline that was never asked what the picture was
 * of.
 *
 * So these tests are mostly refusals, and each one corresponds to a way the
 * rule could be quietly got round rather than to a way it could crash:
 *
 *   - publishing a machine pick nobody looked at, below the floor;
 *   - getting under the floor by deleting the number it is measured against;
 *   - an approval signed by nobody, dated never, or about a different picture;
 *   - the fetcher writing its own approval;
 *   - imagery code that knows the name of a country.
 *
 * Modelled on scripts/test-sourcing.mjs, which makes the same argument about
 * sources: a rule that never refuses anything is not a rule.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  IMAGE_SCORE_FLOOR,
  REVIEW_THRESHOLD,
  carryReview,
  entries,
  isApproved,
  isDecided,
  publishable,
  review,
  reviewQueue,
  withheldReason,
} from '../src/lib/imagery.mjs';
import { picture } from '../src/lib/data.mjs';
import { card, hero } from '../src/lib/components.mjs';
import { toString as render } from '../src/lib/html.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');

let failures = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok    ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL  ${name}\n          ${e.message}`);
  }
};
const checkAsync = async (name, fn) => {
  try {
    await fn();
    console.log(`  ok    ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL  ${name}\n          ${e.message}`);
  }
};

const picks = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'images.json'), 'utf8'));
const all = entries(picks);

/* --- Fixtures, deliberately awkward --------------------------------------- */

const SIGNED = { by: 'A Person', at: '2026-09-23', file: 'Campus.jpg' };
const machinePick = (score) => ({ file: 'Campus.jpg', src: '/x.webp', score });
const reviewed = (state, score, over = {}) => ({
  ...machinePick(score),
  review: { state, ...SIGNED, ...over },
});

/* --- The refusals, which are the point ------------------------------------ */

check('an unreviewed machine pick below the floor is not published', () =>
  assert.equal(publishable(machinePick(IMAGE_SCORE_FLOOR - 1)), false));

check('the floor cannot be bypassed by deleting the score', () =>
  assert.equal(publishable({ file: 'Campus.jpg', src: '/x.webp' }), false));

check('the floor cannot be bypassed by setting the score to a string', () =>
  assert.equal(publishable({ file: 'Campus.jpg', src: '/x.webp', score: '999' }), false));

check('the floor cannot be bypassed by setting the score to null', () =>
  assert.equal(publishable(machinePick(null)), false));

check('a rejected picture is not published however well it scored', () =>
  assert.equal(publishable(reviewed('rejected', 135)), false));

check('an approval signed by nobody is not an approval', () =>
  assert.equal(publishable(reviewed('approved', 10, { by: '' })), false));

check('an approval with no date is not an approval', () =>
  assert.equal(publishable(reviewed('approved', 10, { at: undefined })), false));

check('an approval with an unparseable date is not an approval', () =>
  assert.equal(publishable(reviewed('approved', 10, { at: 'last Tuesday' })), false));

check('an approval naming a different photograph does not apply to this one', () =>
  assert.equal(publishable(reviewed('approved', 10, { file: 'Something else.jpg' })), false));

check('an invented review state is not a review state', () =>
  assert.equal(publishable(reviewed('looks-fine', 10)), false));

check('an approval cannot be forged by handing carryReview a filename', () =>
  assert.equal(carryReview({ file: 'Campus.jpg', score: 9 }, 'Campus.jpg'), null));

check('a review does not transfer to a different photograph on a re-fetch', () =>
  assert.equal(carryReview(reviewed('approved', 10), 'A different picture.jpg'), null));

check('a review with no file recorded does not transfer to anything', () =>
  assert.equal(carryReview({ review: { state: 'approved', by: 'A', at: '2026-01-01' } }, 'Campus.jpg'), null));

/* --- And the permissions -------------------------------------------------- */

check('an approved picture publishes whatever it scored', () =>
  // "MCAST Campus.jpg" scores 14 because it is nearly square, and it is a
  // photograph of MCAST's campus. This is why the floor is not the last word.
  assert.equal(publishable(reviewed('approved', 14)), true));

check('an unreviewed machine pick at the floor exactly is published', () =>
  assert.equal(publishable(machinePick(IMAGE_SCORE_FLOOR)), true));

check('a review survives a re-fetch of the same photograph', () => {
  const carried = carryReview(reviewed('approved', 10), 'Campus.jpg');
  assert.equal(carried?.state, 'approved');
  assert.equal(carried?.by, 'A Person');
});

check('an official hot-link is not measured against the score floor', () =>
  // It has no score because it was not chosen from candidates by a heuristic.
  // It is the picture the institution publishes of itself.
  assert.equal(publishable({ url: 'https://example.edu/og.jpg' }, { scored: false }), true));

check('a person can still reject an official hot-link', () =>
  assert.equal(
    publishable({ url: 'https://example.edu/og.jpg', review: { state: 'rejected', by: 'A Person', at: '2026-09-23' } },
      { scored: false }),
    false
  ));

/* --- The gate is actually wired to the page ------------------------------- */

check('picture() withholds a below-floor machine pick end to end', () => {
  const site = { images: { x: { src: '/assets/img/places/x.webp', file: 'Eclipse.jpg', score: 8 } }, officialImages: {} };
  assert.equal(picture(site, 'x'), null, 'the build would have published an eclipse');
});

check('picture() publishes the same picture once a person approves it', () => {
  const site = {
    images: {
      x: {
        src: '/assets/img/places/x.webp',
        file: 'Eclipse.jpg',
        score: 8,
        review: { state: 'approved', by: 'A Person', at: '2026-09-23', file: 'Eclipse.jpg' },
      },
    },
    officialImages: {},
  };
  assert.equal(picture(site, 'x')?.src, '/assets/img/places/x.webp');
});

/* --- The empty state is real markup, not a good intention ----------------- */

check('a hero with no publishable picture renders the panel, not a broken image', () => {
  const out = render(hero({ title: 'Somewhere', lede: 'A place.', variant: 'panel' }));
  assert.match(out, /hero--panel/);
  assert.match(out, /hero--plain/, 'the panel should keep the plain hero typography');
  assert.doesNotMatch(out, /<img/, 'an empty state must not emit an image element');
});

check('a plain hero on a page that never wanted a picture is left alone', () =>
  // About, Compare and the glossary use 'plain'. They are headings, not empty
  // states, and should not acquire the ruled-paper treatment.
  assert.doesNotMatch(render(hero({ title: 'About', variant: 'plain' })), /hero--panel/));

check('a card that wanted a picture and has none renders a typographic panel', () => {
  const out = render(card({ href: '/x/', title: 'University of Copenhagen', placeholder: true }));
  assert.match(out, /card__media--empty/);
  assert.match(out, />UC</, 'the panel should carry the subject monogram');
});

check('a card that never wanted a picture does not acquire one', () =>
  assert.doesNotMatch(render(card({ href: '/x/', title: 'What will it cost?' })), /card__media/));

/* --- The manifest on disk ------------------------------------------------- */

check('no published image is an unreviewed machine pick below the floor', () => {
  const bad = all
    .filter((e) => publishable(e.pick))
    .filter((e) => !isApproved(e.pick) && (typeof e.pick.score !== 'number' || e.pick.score < IMAGE_SCORE_FLOOR))
    .map((e) => `${e.key} (${e.pick.score}) ${e.pick.file}`);
  assert.deepEqual(bad, [], `published below the floor:\n          ${bad.join('\n          ')}`);
});

check('every review record on disk is complete enough to be honoured', () => {
  // A half-written review is worse than none: `review()` ignores it, so the
  // picture silently reverts to being a machine pick and nobody is told.
  const broken = all
    .filter((e) => e.pick.review && !review(e.pick))
    .map((e) => `${e.key}: ${JSON.stringify(e.pick.review)}`);
  assert.deepEqual(broken, [], `incomplete review records:\n          ${broken.join('\n          ')}`);
});

check('every review names the photograph it was about', () => {
  const loose = all.filter((e) => isDecided(e.pick) && e.pick.file && e.pick.review.file !== e.pick.file).map((e) => e.key);
  assert.deepEqual(loose, []);
});

check('the floor sits in a gap in the distribution, not in the middle of it', () => {
  // The floor was chosen because the scores stop and start again there. If a
  // later change to the scorer fills that gap in, the number is no longer a
  // fact about the data and somebody should look at it again rather than
  // discover it has quietly become a matter of taste.
  const near = all
    .map((e) => e.pick.score)
    .filter((s) => typeof s === 'number' && s < IMAGE_SCORE_FLOOR && s >= IMAGE_SCORE_FLOOR - 8);
  assert.deepEqual(near, [], `scores now sit just under the floor of ${IMAGE_SCORE_FLOOR}: ${near.join(', ')}`);
});

check('the review threshold is above the floor', () =>
  // Otherwise nothing would ever be queued that was still being published, and
  // the queue would only ever contain pictures nobody can see.
  assert.ok(REVIEW_THRESHOLD > IMAGE_SCORE_FLOOR));

check('every withheld picture is in the review queue', () => {
  const queued = new Set(reviewQueue(picks).map((e) => e.key));
  const missing = all.filter((e) => withheldReason(e.pick) && !isDecided(e.pick)).map((e) => e.key).filter((k) => !queued.has(k));
  assert.deepEqual(missing, [], `withheld but not queued: ${missing.join(', ')}`);
});

check('every Destination hero is queued until a person has decided about it', () => {
  const queued = new Set(reviewQueue(picks, { heroesOnly: true }).map((e) => e.key));
  const missing = entries(picks, { heroesOnly: true })
    .filter((e) => !isDecided(e.pick) && !queued.has(e.key))
    .map((e) => e.key);
  assert.deepEqual(missing, [], `heroes nobody will be asked to look at: ${missing.join(', ')}`);
});

/* --- The fetcher cannot approve anything ---------------------------------- */

await checkAsync('the fetcher has no code path that writes a review state', async () => {
  const src = await fs.readFile(path.join(ROOT, 'scripts', 'fetch-images.mjs'), 'utf8');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const writes = [...code.matchAll(/state\s*:\s*['"`](?:approved|rejected)['"`]/g)].map((m) => m[0]);
  assert.deepEqual(writes, [], `the fetcher can sign its own approval: ${writes.join(', ')}`);
});

await checkAsync('the fetcher builds a review only by carrying an existing one', async () => {
  const src = await fs.readFile(path.join(ROOT, 'scripts', 'fetch-images.mjs'), 'utf8');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const literals = [...code.matchAll(/review\s*:\s*\{/g)].map((m) => m[0]);
  assert.deepEqual(literals, [], 'the fetcher constructs a review record literally rather than carrying one');
  assert.ok(/carryReview\(/.test(code), 'the fetcher no longer carries reviews forward at all');
});

/* --- No bespoke code per country or per institution ----------------------- */

const IMAGERY_SOURCES = [
  'src/lib/imagery.mjs',
  'src/lib/data.mjs',
  'src/lib/components.mjs',
  'scripts/fetch-images.mjs',
  'scripts/fetch-official-images.mjs',
  'scripts/images-review.mjs',
  'scripts/test-images.mjs',
];

await checkAsync('no imagery code branches on a country code', async () => {
  // The same guard scripts/test-credentials.mjs holds the credential model to.
  // Imagery is where the temptation is strongest, because the wrong picture is
  // always on one specific page and the one-line fix is always in reach.
  const suspects = [];
  for (const rel of IMAGERY_SOURCES) {
    const text = await fs.readFile(path.join(ROOT, rel), 'utf8');
    const re = /(?:destination|country|dest|code|key|subject)\w*\s*===\s*['"][a-z]{2}['"]/g;
    for (const m of text.matchAll(re)) suspects.push(`${rel}: ${m[0]}`);
  }
  assert.deepEqual(suspects, [], `imagery code is branching on a country:\n          ${suspects.join('\n          ')}`);
});

await checkAsync('no imagery code names an institution', async () => {
  // Every key in data/images.json that is specific enough to be unmistakable —
  // the namespaced institution keys. If one of these ever appears as a string
  // literal in the code, a photograph is being special-cased and the fix
  // belongs in the record instead.
  const named = Object.keys(picks).filter((k) => k.includes('-'));
  const suspects = [];
  for (const rel of IMAGERY_SOURCES) {
    const text = await fs.readFile(path.join(ROOT, rel), 'utf8');
    const code = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    for (const key of named) {
      if (new RegExp(`(['"\`])${key}\\1`).test(code)) suspects.push(`${rel}: "${key}"`);
    }
  }
  assert.deepEqual(suspects, [], `imagery code names a specific institution:\n          ${suspects.join('\n          ')}`);
});

console.log(failures ? `\n${failures} failing\n` : '\nAll imagery guards pass\n');
process.exit(failures ? 1 : 0);
