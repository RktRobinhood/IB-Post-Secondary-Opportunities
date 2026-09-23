/**
 * What a Verification State means. One implementation, for every output.
 *
 * Evidence status is a load-bearing product rule — ADR 0001 makes Evidence a
 * first-class source of truth — and it had been written out independently six
 * times: the claim status on a page, the aggregate summary, the browser
 * planner's roll-up, the build console line, the public `data.json` export, and
 * several page templates inferring trust from how many sources a record had.
 *
 * Six copies of a rule are not six risks of the same bug. They are six
 * slightly different rules, and one of the differences was already real:
 *
 *   - `canonical.mjs` and the build console both treated an Evidence item past
 *     its `meta.reviewBy` as **stale**, whatever its verification state said;
 *   - the public export never looked at `reviewBy` at all, so a record marked
 *     `verificationState: "verified"` stayed **verified** in `data.json` after
 *     its review date had passed.
 *
 * There are no stale records today, so the public contradiction is latent
 * rather than displayed. It activates by itself on the first elapsed review
 * date — which is the worst kind of bug to leave lying around, because nothing
 * will change in the repository on the day it starts being wrong.
 *
 * ## The precedence, stated once
 *
 * Worst first. The first one that applies is the answer.
 *
 *   conflicting → unavailable → superseded → stale → needs-review → verified
 *
 * `conflicting` is first on purpose and is not a severity judgement: a conflict
 * must never resolve to the more permissive source. Everything above
 * `needs-review` means the product should decline to state the claim.
 * `needs-review` is weaker — a source was read and recorded, and no person has
 * signed it off — which is worth showing beside a claim rather than worth
 * refusing to show the claim at all.
 *
 * ## Two axes, not one ladder
 *
 * A source check is not a rung on this ladder. A record can be unreviewed by a
 * person *and* have had its page re-read with the supporting sentence quoted
 * onto it. Reporting those as one number hides which of the two a reader is
 * actually getting, so `summarise` counts them separately and this file never
 * mixes them.
 *
 * ## The browser
 *
 * `src/assets/js/planner.js` is served as a static file and cannot import this
 * module. It does not need to: `serialisePolicy()` emits the precedence and the
 * labels, and `normalise()` emits the four fields a classification depends on,
 * so the browser rolls records up by *reading* the policy rather than by
 * restating it. The payload it consumes is the one place the rule crosses the
 * runtime boundary, and it crosses as data.
 */

/** Worst first. Index in this array *is* the precedence. */
export const ORDER = ['conflicting', 'unavailable', 'superseded', 'stale', 'needs-review', 'verified'];

export const LABELS = {
  conflicting: 'Sources disagree',
  unavailable: 'Source unavailable',
  superseded: 'Superseded',
  stale: 'Past its review date',
  'needs-review': 'Not yet checked by a person',
  verified: 'Verified',
  none: 'No source recorded',
};

/** Levels at which the product declines to state the claim. */
export const DECLINE = new Set(['conflicting', 'unavailable', 'superseded', 'stale']);

export const today = () => new Date().toISOString().slice(0, 10);

/**
 * The four fields a classification depends on, pulled out of a full Evidence
 * record.
 *
 * Exists because the same rule has to run over two shapes: the record as it
 * sits in `data/evidence/`, and the trimmed object serialised into the planner
 * payload. Normalising first means one `classify` rather than two.
 */
export function normalise(record) {
  if (!record) return null;
  return {
    conflicts: Array.isArray(record.conflictsWith) ? record.conflictsWith.length : Number(record.conflicts) || 0,
    state: record.verificationState ?? record.state ?? null,
    retrievedAt: record.retrievedAt ?? null,
    reviewBy: record.meta?.reviewBy ?? record.reviewBy ?? null,
  };
}

/**
 * One record's level.
 *
 * `asOf` is a parameter rather than a call to `Date.now()` so that a test can
 * pin a date, and so that one build cannot classify a record two ways because
 * it happened to run across midnight.
 */
export function classify(record, asOf = today()) {
  const r = normalise(record);
  if (!r) return 'verified';
  if (r.conflicts > 0) return 'conflicting';
  if (r.state === 'unavailable') return 'unavailable';
  if (r.state === 'superseded') return 'superseded';
  /* Past its own review date is stale whatever the state says. This is the
     line the public export did not have, and the reason it would have gone on
     calling an expired record verified. */
  if (r.reviewBy && r.reviewBy < asOf) return 'stale';
  /* `verified` is reached only by saying so. Everything else — `needs-review`,
     a missing state, a typo — lands on `needs-review`.
     *
     * This was written the other way round first, ending `return 'verified'`,
     * which is how all four of the implementations this replaces were written:
     * a chain of `else if` with the strongest claim as the fallback. So
     * `verrified` counted as verified, and so did a record with no state at
     * all. The schema catches a typo, which is exactly why it was easy to
     * leave — but the policy must not be the thing relying on the schema to
     * stop it making the strongest claim on the site by default. */
  return r.state === 'verified' ? 'verified' : 'needs-review';
}

const rank = (level) => {
  const i = ORDER.indexOf(level);
  /* An unrecognised state is not evidence of quality. The old build console
     ended `else ev.verified++`, so a typo in `verificationState` counted as
     verified — the one direction this project is organised against. */
  return i === -1 ? 0 : i;
};

/**
 * The status of a claim backed by several records: the weakest of them.
 *
 * Takes records in either shape. Returns the same object every caller was
 * building by hand, including `records`, which the claim UI renders.
 */
export function statusFor(records, asOf = today()) {
  const list = (records || []).filter(Boolean);
  if (!list.length) return { level: 'none', label: LABELS.none, records: [] };

  let level = 'verified';
  for (const r of list) {
    const l = classify(r, asOf);
    if (rank(l) < rank(level)) level = l;
  }
  const checkedAt = list.map((r) => normalise(r).retrievedAt).filter(Boolean).sort().at(-1) || null;
  return { level, label: LABELS[level], checkedAt, records: list };
}

/**
 * How many records sit at each level, plus the source-check axis.
 *
 * One function so the build console, the public export and the trust page
 * cannot disagree about what they are counting — which they did.
 */
export function summarise(records, asOf = today()) {
  const out = {
    total: 0,
    verified: 0,
    needsReview: 0,
    stale: 0,
    superseded: 0,
    unavailable: 0,
    conflicting: 0,
    // The second axis. Deliberately not folded into the counts above.
    sourceChecked: 0,
    sourceSupported: 0,
    sourcePartial: 0,
    sourceUnsupported: 0,
    lastCheckedAt: null,
  };
  const KEY = {
    conflicting: 'conflicting',
    unavailable: 'unavailable',
    superseded: 'superseded',
    stale: 'stale',
    'needs-review': 'needsReview',
    verified: 'verified',
  };

  for (const e of records || []) {
    out.total++;
    out[KEY[classify(e, asOf)]]++;

    const sc = e?.sourceCheck;
    if (sc?.outcome) {
      out.sourceChecked++;
      if (sc.outcome === 'supported') out.sourceSupported++;
      else if (sc.outcome === 'partial') out.sourcePartial++;
      else out.sourceUnsupported++;
      if (sc.checkedAt && (!out.lastCheckedAt || sc.checkedAt > out.lastCheckedAt)) out.lastCheckedAt = sc.checkedAt;
    }
  }
  return out;
}

/**
 * The policy, as data, for the one consumer that cannot import it.
 *
 * Shipped into the planner page alongside the evidence index. The browser gets
 * the precedence and the labels and applies them; it does not get a second
 * opinion about what `stale` means.
 */
export function serialisePolicy() {
  return { order: ORDER, labels: LABELS, asOf: today() };
}

/**
 * One Evidence record, trimmed to what a browser needs, with its level already
 * decided here.
 *
 * The level is computed at build time rather than in the page because "is this
 * past its review date" depends on today's date, and a page cached in a
 * student's browser for a week would otherwise answer it with the date the page
 * was opened — quietly disagreeing with the server-rendered claim beside it.
 */
export function forBrowser(record, asOf = today()) {
  return {
    state: record.verificationState ?? null,
    level: classify(record, asOf),
    retrievedAt: record.retrievedAt ?? null,
    reviewBy: record.meta?.reviewBy ?? null,
    url: record.sourceUrl ?? null,
    publisher: record.publisher ?? null,
    conflicts: (record.conflictsWith || []).length,
  };
}
