/**
 * Who read the source, and whether anyone checked them.
 *
 * THE PROBLEM THIS FIXES
 *
 * 152 evidence records were marked `verified`. Two of them had been checked by
 * a second party. The other 150 were written by a research pass that opened the
 * official page, quoted it, wrote the record, and set `verified` on its own
 * work in the same breath — with a sentence saying so, across 108 different
 * free-text spellings of "Read, 2026-09-23".
 *
 * My own records were among them. This is not a failure of the research passes;
 * it is a failure of the model, which offered `verified` as the obvious thing
 * to write once you had genuinely read the page, and never said who was allowed
 * to write it.
 *
 * THE DISTINCTION THAT ACTUALLY MATTERS
 *
 * The first instinct is to say `verified` means a human. That is the wrong cut,
 * and it fails in both directions: a human who writes a record from a page has
 * not been checked either, and an agent that opened the official page and
 * quoted the sentence has done something real that "unverified" throws away.
 *
 * The line that carries the weight is INDEPENDENCE, not species. Reading a page
 * and writing a record from it is transcription. Reading the record back
 * against the source is review. The second is a check on the first, and the
 * first cannot check itself — whoever performed it.
 *
 * So:
 *
 *   ATTESTATION  whoever wrote this record opened the source and read it, and
 *                captured the wording that supports the claim. First-hand,
 *                single-pass, self-reported.
 *
 *   REVIEW       a DIFFERENT party read the record back against the source and
 *                agreed. This is what `verified` now means, and a record cannot
 *                reach it on the word of the party that wrote it.
 *
 * WHY THIS IS NOT A NEW verificationState
 *
 * `evidenceStatus()` in src/lib/canonical.mjs falls through to `verified` for
 * any state it does not recognise. Adding `attested` to the enum would have
 * rendered all 150 as "Verified" on the page — precisely backwards — and in a
 * file this pass does not own.
 *
 * So attestation is a separate field and the enum is untouched. A self-attested
 * record sits at `needs-review`, whose existing label is already exactly right:
 * "Not yet checked by a person." The attestation records that the source was
 * genuinely read, so the work is not thrown away, and the state stays honest.
 * The design fails safe in the files it cannot see.
 */

/** How the source was read. Free text was 108 spellings of four things. */
export const METHOD = {
  'read-source': 'Read from the cited page',
  'read-browser': 'Read in a browser, because the page does not serve its content to a plain fetch',
  'read-pdf': 'Downloaded and read as a PDF',
  'read-secondary': 'Read from a secondary source rather than the cited one',
  'derived': 'Computed from figures on the cited page rather than quoted from it',
};

/**
 * Infer a method from the free text a research pass left behind.
 * Used once, by the migration. New records state their method.
 */
export function methodFromText(text) {
  const t = String(text || '').toLowerCase();
  if (/\bpdf\b/.test(t)) return 'read-pdf';
  if (/browser|browser tab|javascript|rendered/.test(t)) return 'read-browser';
  if (/arithmetic|sums|derived|computed|line by line/.test(t)) return 'derived';
  if (/read|manual|source page|directly/.test(t)) return 'read-source';
  return 'read-source';
}

/**
 * Is this record's `verified` state earned?
 *
 * @returns {{ok: boolean, reason: string|null}}
 */
export function checkReview(record) {
  if (record?.verificationState !== 'verified') return { ok: true, reason: null };

  const review = record.review;
  if (!review?.by) {
    return {
      ok: false,
      reason:
        'marked verified with no review.by. `verified` means a second party read the record back against the source; ' +
        'if the source was read by whoever wrote the record, that is an attestation, not a review.',
    };
  }
  const attester = record.attestation?.by;
  if (attester && sameParty(attester, review.by)) {
    return {
      ok: false,
      reason: `marked verified by "${review.by}", who also wrote it. A record cannot be reviewed by the party that attested it.`,
    };
  }
  return { ok: true, reason: null };
}

/**
 * Deliberately loose. The point is to catch "Read, 2026-09-23" reviewing
 * "Read, 2026-09-23", not to adjudicate whether two humans are the same person.
 * A near-match is worth stopping on and a reviewer can say why it is not one.
 */
export function sameParty(a, b) {
  const norm = (s) =>
    String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9 ]+/g, ' ')
      .replace(/\b(read|from|the|source|page|on|in|a|an|at|against|directly|manual|manually)\b/g, '')
      .replace(/\d+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  const x = norm(a);
  const y = norm(b);
  if (!x && !y) return true;
  return x === y;
}

/** The three numbers the trust page reports, and nothing else. */
export function summarise(records) {
  const out = { total: 0, attested: 0, reviewed: 0, sourceChecked: 0, unread: 0, byMethod: {} };
  for (const r of records || []) {
    out.total++;
    const attested = !!r.attestation?.by;
    const reviewed = r.verificationState === 'verified' && !!r.review?.by;
    if (attested) {
      out.attested++;
      const m = r.attestation.method || 'read-source';
      out.byMethod[m] = (out.byMethod[m] || 0) + 1;
    }
    if (reviewed) out.reviewed++;
    if (r.sourceCheck?.outcome) out.sourceChecked++;
    if (!attested && !reviewed) out.unread++;
  }
  return out;
}
