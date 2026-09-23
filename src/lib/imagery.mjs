/**
 * Whether a photograph is allowed on the page.
 *
 * `docs/IMAGE_STANDARD.md` used to govern bytes and dimensions only, so every
 * picture on this site was technically correct and a fair number of them were
 * editorially wrong. Canada led on an annotated aerial diagram of a yacht club
 * with red arrows labelling Mud Lake. A Luxembourg university was represented
 * by a total solar eclipse. A Methodist seminary in Tallinn was represented by
 * a portrait captioned "Abikaasa Maire Lilleorg" — somebody's wife.
 *
 * None of those are format failures. They are all format *successes*: 16:10,
 * WebP, under the byte ceiling, correctly attributed, correctly licensed, and
 * wrong. This module is the missing half — what the picture is of, and who
 * says so.
 *
 * Three rules, and the order matters:
 *
 *   1. **A person's judgement outranks the scorer, in both directions.** An
 *      approved picture publishes whatever it scored; a rejected one does not
 *      publish however well it scored. The scorer proposes; a person disposes.
 *
 *   2. **An unreviewed machine pick below the floor is not published at all.**
 *      Not shown smaller, not shown with a caveat — not shown. A tasteful
 *      empty state beats a picture of an eclipse.
 *
 *   3. **An approval names the picture it approved.** It is a judgement about
 *      one photograph, not a permanent property of a page slot, so it does not
 *      transfer to whatever the fetcher picks next week.
 *
 * Nothing here knows the name of a country, a university or a file. Every
 * difference between two Destinations is a difference in their records.
 * `scripts/test-images.mjs` reads this file back and enforces that.
 *
 * Not to be confused with `src/lib/publication-floor.mjs`, which is about how
 * much of a Destination has been *researched*. This one is about pictures.
 */

/* --- The floor ------------------------------------------------------------ */

/**
 * The score below which an unreviewed machine pick is withheld.
 *
 * Chosen from the distribution actually present in `data/images.json` rather
 * than from taste. 489 of the 495 stored pictures carry a score. Sorted, the
 * scores are dense — the largest gap between two adjacent distinct scores
 * anywhere above 40 is four points — with exactly one real discontinuity in
 * the whole range:
 *
 *     8   12   14   24  ·············  40   44   47   48   50   52 …
 *                           16 points
 *                           with nothing in them
 *
 * That gap is the only place a line can be drawn that is a fact about the data
 * rather than an opinion about quality. Everything beneath it is categorically
 * different from everything above it: an eclipse, a bare street address, a
 * near-square snapshot, a photograph of a sign. Above it the scores run
 * continuously, so any cut there would be a number someone picked, would split
 * pictures that differ by two points into published and withheld, and would be
 * argued about forever.
 *
 * So the floor answers a narrow question — "is the scorer's verdict here worth
 * anything at all?" — rather than "is this picture good?". The second question
 * is REVIEW_THRESHOLD's, and it is answered by a person.
 *
 * `scripts/test-images.mjs` asserts that the floor still sits in a gap. Move it
 * on a hunch and that test says so.
 */
export const IMAGE_SCORE_FLOOR = 40;

/**
 * The score at or below which a published machine pick still wants a human eye.
 *
 * This withholds nothing. It is the size of the review queue, and it is the
 * number issue #17 named when it said "work down the institution images by
 * score, starting with everything under 65". Between the floor and this line
 * sit the pictures that are plausibly of the right place and plausibly not:
 * an award ceremony at RWTH, a sports hall at TalTech, a tram passing the
 * Estonian Academy of Arts. A scorer cannot tell those apart. A person can, in
 * about four seconds each.
 */
export const REVIEW_THRESHOLD = 65;

/** The version of `score()` in scripts/fetch-images.mjs that produced a number. */
export const SCORER_VERSION = 2;

/* --- The approval record -------------------------------------------------- */

/**
 * The shape of `review` in `data/images.json`:
 *
 *     "review": {
 *       "state": "approved" | "rejected",
 *       "by":    "who looked at it",
 *       "at":    "YYYY-MM-DD",
 *       "file":  "the Commons filename this judgement was about",
 *       "note":  "why"            // optional, and always worth writing
 *     }
 *
 * `by` and `at` are not decoration. An approval is an accountability record —
 * it is the thing that makes "what we show is checked" a true sentence rather
 * than a claim — and an approval nobody signed and nobody dated establishes
 * nothing. So a review missing either is not a review, and `approval()` returns
 * null for it rather than quietly honouring half a record.
 *
 * `file` is what stops an approval from drifting onto a different photograph.
 * See `carryReview()`.
 */
export const REVIEW_STATES = ['approved', 'rejected'];

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** A complete, signed, dated review of a named file, or null. */
export function review(pick) {
  const r = pick?.review;
  if (!r || typeof r !== 'object') return null;
  if (!REVIEW_STATES.includes(r.state)) return null;
  // An unsigned or undated judgement is not a judgement anyone can be held to.
  if (typeof r.by !== 'string' || r.by.trim().length < 2) return null;
  if (typeof r.at !== 'string' || !DATE.test(r.at)) return null;
  // A judgement about a picture has to say which picture. A pick with no file
  // at all (an official hot-link, which is identified by its URL) is exempt,
  // because there is no Commons filename for the review to name.
  if (pick.file && r.file !== pick.file) return null;
  return r;
}

export function isApproved(pick) {
  return review(pick)?.state === 'approved';
}

/* --- What may be published ------------------------------------------------ */

/**
 * Why this picture is not going on the page, or null if it is.
 *
 * Returning the reason rather than a boolean is what lets `npm run images:review`
 * and `scripts/test-images.mjs` say the same thing the build did, in words,
 * without re-deriving it.
 *
 * @param {object|null} pick   an entry from data/images.json, or an official pick
 * @param {object} [opts]
 * @param {boolean} [opts.scored]  false for hot-linked official images, which
 *                                 are not machine picks and carry no score
 */
export function withheldReason(pick, { scored = true } = {}) {
  if (!pick) return 'missing';

  const r = review(pick);
  // A person looked and said no. Nothing else is consulted; that is the point.
  if (r?.state === 'rejected') return 'rejected';
  // A person looked and said yes. The floor does not apply to them either —
  // "MCAST Campus.jpg" scores 14 because it is nearly square, and it is a
  // photograph of MCAST's campus.
  if (r?.state === 'approved') return null;

  // An institution's own Open Graph image is the picture it publishes of itself
  // for exactly this purpose. It was not chosen from a pool of candidates by a
  // heuristic, so there is no score, and the failure mode the floor guards
  // against cannot occur. Its own ceiling is a byte ceiling, in data.mjs.
  if (!scored) return null;

  // An unreviewed pick with no score cannot be measured against the floor, and
  // an unmeasurable picture is not a passing one — otherwise deleting a field
  // would be a way round the rule.
  if (typeof pick.score !== 'number') return 'unscored';
  if (pick.score < IMAGE_SCORE_FLOOR) return 'below-floor';
  return null;
}

export function publishable(pick, opts) {
  return withheldReason(pick, opts) === null;
}

/** Plain English for a withholding reason, for the review tool and the logs. */
export function withheldLabel(reason) {
  return {
    missing: 'no picture was found',
    rejected: 'a person looked at it and said no',
    unscored: 'an unreviewed pick with no score to measure',
    'below-floor': `an unreviewed machine pick below the floor of ${IMAGE_SCORE_FLOOR}`,
  }[reason] || 'published';
}

/* --- Surviving a re-run of the fetcher ------------------------------------ */

/**
 * The review to keep when a pick is re-fetched, or null.
 *
 * `scripts/fetch-images.mjs` rebuilds an entry from scratch on every fetch, so
 * without this an editor's judgement would last exactly until the next
 * `--refresh`. Two things protect it, and they protect against opposite
 * failures:
 *
 *   **The fetcher does not re-pick a reviewed entry at all.** A decided entry
 *   is skipped by a bare `--refresh` exactly as a pinned one is, so the ordinary
 *   way of losing an approval — someone re-runs the fetcher across everything —
 *   cannot happen. That is in the fetcher, next to the pin check.
 *
 *   **This, for when it is re-fetched on purpose.** `--refresh --only=<key>`
 *   is an editor asking for that one entry again. If the file that comes back
 *   is the one that was approved, the approval still applies and is carried
 *   through untouched. If a different file comes back, the approval was about a
 *   photograph nobody is publishing any more, so it does not transfer — the new
 *   picture is an unreviewed machine pick and the floor applies to it.
 *
 * Note what this function cannot do: it has no way to *create* a review. It
 * copies one or it returns null. The fetcher therefore has no code path that
 * can sign an approval, which is what `scripts/test-images.mjs` checks by
 * reading the fetcher's source.
 */
export function carryReview(previous, nextFile) {
  const r = previous?.review;
  if (!r || typeof r !== 'object') return null;
  if (!REVIEW_STATES.includes(r.state)) return null;
  if (!r.file || !nextFile || r.file !== nextFile) return null;
  return r;
}

/** True if this entry has been decided either way, so a re-pick would overrule a person. */
export function isDecided(pick) {
  return REVIEW_STATES.includes(pick?.review?.state);
}

/* --- Reading the manifest ------------------------------------------------- */

/**
 * Every hosted picture as a flat list, gallery photographs included.
 *
 * A gallery photograph is published on the page exactly as a primary one is —
 * same hero, same crossfade, same credit — so it is reviewed exactly as one.
 * Reporting only the primaries flattered the number by a fifth.
 *
 * Gallery entries are addressed as `key#2`, `key#3`, matching the slide they
 * become. That spelling survives a shell, which `key [2]` does not.
 */
export function entries(picks, { heroesOnly = false } = {}) {
  const out = [];
  for (const [key, pick] of Object.entries(picks || {})) {
    if (heroesOnly && pick.kind !== 'country') continue;
    out.push({ key, pick, kind: pick.kind || 'institution', subject: pick.subject || null, parent: null });
    if (heroesOnly) continue;
    for (const [i, g] of (pick.gallery || []).entries()) {
      out.push({
        key: `${key}#${i + 2}`,
        pick: g,
        kind: 'gallery',
        subject: pick.subject || null,
        parent: key,
      });
    }
  }
  return out;
}

/** Resolve `key` or `key#3` to the entry it names, without mutating anything. */
export function locate(picks, address) {
  const [key, slide] = String(address ?? '').split('#');
  const parent = picks?.[key];
  if (!parent) return null;
  if (!slide) return { key, pick: parent, container: picks, field: key, index: null };
  const i = Number(slide) - 2;
  const pick = (parent.gallery || [])[i];
  if (!pick) return null;
  return { key: address, pick, container: parent.gallery, field: i, index: i, parentKey: key };
}

/**
 * The review queue: what a person should look at, worst first.
 *
 * Two different bars, and the difference is a property of the record rather
 * than of any particular country:
 *
 *   A **Destination hero** is queued until somebody has decided about it,
 *   whatever it scored. It is the whole top of the page, it is the first thing
 *   a student sees, and there are 35 of them — small enough that "all of them"
 *   is a reasonable standard and an afternoon's work. The scores do not help
 *   here: Canada's yacht club scored 60, comfortably mid-range.
 *
 *   **Everything else** is queued when it is withheld or when it scored at or
 *   below REVIEW_THRESHOLD. There are 460 of those and no realistic prospect
 *   of a human eye on every one, so the score is used for what it is actually
 *   good for — ordering a queue nobody will finish.
 *
 * Withheld pictures come first however they scored, because a page showing a
 * typographic panel is a page missing a photograph, which is more urgent than
 * a page showing a mediocre one.
 */
export function reviewQueue(picks, { heroesOnly = false, includeReviewed = false } = {}) {
  const rank = { country: 0, institution: 1, gallery: 2 };
  const wanted = (e) =>
    e.reason !== null ||
    e.kind === 'country' ||
    typeof e.pick.score !== 'number' ||
    e.pick.score <= REVIEW_THRESHOLD;

  return entries(picks, { heroesOnly })
    .map((e) => ({ ...e, reason: withheldReason(e.pick), decided: isDecided(e.pick) }))
    .filter((e) => (includeReviewed ? true : !e.decided))
    .filter(wanted)
    .sort(
      (a, b) =>
        (a.reason ? 0 : 1) - (b.reason ? 0 : 1) ||
        (rank[a.kind] ?? 9) - (rank[b.kind] ?? 9) ||
        (a.pick.score ?? -1) - (b.pick.score ?? -1) ||
        a.key.localeCompare(b.key)
    );
}

/* --- The empty state ------------------------------------------------------ */

/**
 * What to draw where a photograph is not going.
 *
 * The site already falls back to a typographic panel in two places — `hero()`
 * with `variant: 'plain'`, and a card with no media — so this extends those
 * rather than introducing a third thing. All it returns is the words; the CSS
 * decides what they look like, in both themes, from the same tokens everything
 * else uses.
 *
 * The label is the subject's own name, because that is the one true thing we
 * have to say about a place whose photograph we do not trust. It is not an
 * apology and it does not mention the review queue: a student reading about
 * Ljubljana does not need to know about our image pipeline.
 */
export function emptyPanel(label) {
  const text = String(label ?? '').trim();
  if (!text) return null;
  return { label: text, initials: initials(text) };
}

/**
 * The mark that stands in for the photograph.
 *
 * Initials of the first words that carry meaning — "University of Copenhagen"
 * gives UC, because "of" is not a word anybody abbreviates. A name that is
 * already a single short acronym is shown whole instead: LUNEX abbreviated to
 * "L" is a letter, not a mark, and the institution has already done the
 * abbreviating for us.
 */
function initials(text) {
  const SKIP = new Set([
    'of', 'the', 'and', 'for', 'de', 'di', 'du', 'da', 'des', 'der', 'den', 'det',
    'van', 'von', 'la', 'le', 'el', 'og', 'och', 'ja', 'i', 'in', 'a', 'an',
  ]);
  const words = text
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/[\s-]+/)
    .filter(Boolean)
    .filter((w) => !SKIP.has(w.toLowerCase()));
  const kept = words.length ? words : [text];
  if (kept.length === 1) {
    const only = kept[0];
    if (only.length <= 5 && only === only.toUpperCase()) return only;
    return only.slice(0, 2).toUpperCase();
  }
  return kept.slice(0, 3).map((w) => w[0].toUpperCase()).join('');
}
