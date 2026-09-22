/**
 * The site must never tell a student that something will get them in.
 *
 * This is deliberately narrow. Reporting that a university guarantees
 * first-year housing, or that Swiss maturity holders have guaranteed admission,
 * is accurate reporting of someone else's policy and must not trip the check —
 * a rule that cries wolf gets switched off.
 *
 * What must never appear is the site promising *the reader* an outcome. So the
 * pattern is second-person, and a negation in front of it is allowed, because
 * the site says several times over that these things do not work.
 */

const PROMISE =
  /(will get you in|gets? you in|boosts? your chances|improves? your (odds|chances)|guarantees? you (a place|admission|an offer)|ensures? you (a place|admission)|secures? you (a place|admission)|your (place|offer) is guaranteed|guaranteed to get in)/gi;

const NEGATED = /\b(not|never|no|cannot|can't|without|nothing|neither|nor|rather than)\b/i;

/** Strip markup down to the words a student actually reads. */
export function toProse(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
}

/** @returns {string[]} one message per unqualified promise found */
export function findPromises(html) {
  const prose = toProse(html);
  const found = [];
  for (const m of prose.matchAll(PROMISE)) {
    const before = prose.slice(Math.max(0, m.index - 70), m.index);
    if (NEGATED.test(before)) continue;
    const snippet = prose.slice(Math.max(0, m.index - 45), m.index + m[0].length + 25).trim();
    found.push(`promises the reader an outcome: "…${snippet}…"`);
  }
  return found;
}
