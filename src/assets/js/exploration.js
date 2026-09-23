/**
 * The Exploration List.
 *
 * `CONTEXT.md` has defined this from the beginning — "a student's reversible
 * set of interesting Opportunities; inclusion does not imply eligibility or an
 * application decision" — and nothing implemented it. So every feature that
 * needed to know what a student was interested in invented its own answer:
 * the comparison tray kept `ibp-compare`, the subject checker kept
 * `ibp-profile-v2`, and the calendar had no way to ask either of them and
 * showed everybody everything (#13).
 *
 * This is the one place that question is answered. It reads the signals that
 * already exist rather than replacing them, because a student who has spent ten
 * minutes in the comparison tray has already told us what they are looking at
 * and should not have to say it again somewhere else.
 *
 * Three rules it keeps:
 *
 *   1. **Nothing leaves the browser.** Every signal here is `localStorage`, and
 *      that is the promise the subject checker makes in as many words. A scope
 *      that had to be computed on a server would be a scope that had to be
 *      sent to one.
 *
 *   2. **Reversible, and visibly so.** Adding a destination is a glance, not a
 *      commitment. Anything built on this must say what it is scoped to and
 *      offer the way out in the same breath.
 *
 *   3. **An empty list is not a scope.** A student who has chosen nothing wants
 *      everything, not nothing. Callers get `null` rather than an empty array,
 *      so the difference cannot be lost in a truthiness check.
 */

const KEY = 'ibp-exploring';
const COMPARE_KEY = 'ibp-compare';
const PROFILE_KEY = 'ibp-profile-v2';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* A private window, or storage that is full. The page still works; the
       student just has to say what they are looking at each time. */
  }
}

/** Destination codes the student has explicitly added. */
export function explicit() {
  const list = read(KEY, []);
  return Array.isArray(list) ? list.filter((x) => typeof x === 'string') : [];
}

/**
 * Every destination the student has shown interest in, from whichever signal
 * carries it, most deliberate first.
 *
 * Returns `null` when there is no signal at all — see rule 3. The `source`
 * field is not decoration: a page that says "scoped to the four you are
 * comparing" is describing something the student remembers doing, and a page
 * that says "scoped to your list" when they never made one is lying to them.
 */
export function interest() {
  const mine = explicit();
  if (mine.length) return { codes: mine, source: 'list' };

  const compare = read(COMPARE_KEY, []);
  if (Array.isArray(compare) && compare.length) {
    return { codes: compare.filter((x) => typeof x === 'string'), source: 'compare' };
  }

  const profile = read(PROFILE_KEY, null);
  const fromProfile = profile?.destinations || profile?.interests;
  if (Array.isArray(fromProfile) && fromProfile.length) {
    return { codes: fromProfile.filter((x) => typeof x === 'string'), source: 'profile' };
  }

  return null;
}

export function add(code) {
  const list = explicit();
  if (!list.includes(code)) write(KEY, [...list, code]);
  return explicit();
}

export function remove(code) {
  write(KEY, explicit().filter((c) => c !== code));
  return explicit();
}

export function set(codes) {
  write(KEY, [...new Set(codes.filter(Boolean))]);
  return explicit();
}

export function clear() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* as above */
  }
}

/** How to describe the scope to the student, in their own terms. */
export const SOURCE_WORDING = {
  list: 'the destinations you are exploring',
  compare: 'the destinations you are comparing',
  profile: 'the destinations in your profile',
  url: 'the destinations in this link',
};
