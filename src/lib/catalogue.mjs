/**
 * One Destination, one identity.
 *
 * A Destination can exist on disk in two shapes at once. `data/destinations/`
 * holds the canonical record; `data/countries/` holds the profile it is
 * migrating from. While a migration is in progress that is normal, and it is
 * documented as normal. What is not normal is both of them reaching a page.
 *
 * They did. `[...migrated, ...countries]` produced 50 entries for 36 codes —
 * fourteen Destinations twice — so `/compare/` offered two Australias in its
 * selector, printed "50 destinations", and drew two rows for each of the
 * fourteen. The rows disagreed, because one was canonical and one was the
 * profile: Australia showed 4/7 and 5/7 coverage, Germany showed different
 * regions and 2/7 against 5/7. A student comparing destinations was shown the
 * same country twice with different answers and no way to tell which was meant.
 *
 * ADR 0001 says derived surfaces must not quietly disagree with the structured
 * source of truth. Two identities for one Destination is the sharpest possible
 * version of that disagreement.
 *
 * ## Why this is a merge and not a choice
 *
 * The obvious fix — prefer the canonical record — silently deletes data. The
 * canonical projection sets `institutions`, `places`, `deadlines` and `sources`
 * to empty arrays, because those parts have not migrated yet. Preferring it
 * wholesale would empty Germany's institution list and drop every German
 * deadline from the calendar.
 *
 * So precedence is per field, and stated once here rather than re-decided by
 * each caller:
 *
 *   **The canonical record wins wherever it says anything. The profile fills
 *   what the canonical record has not migrated yet.**
 *
 * "Says anything" means present and non-empty — an empty array is the canonical
 * record declining to speak, which is exactly the migration state the profile
 * exists to cover.
 */

/** Present enough to override: not null, not undefined, not an empty list. */
function speaks(v) {
  if (v === null || v === undefined) return false;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

/** Shallow per-field overlay, used for the nested `costs` object too. */
function overlay(base, top) {
  const out = { ...base };
  for (const [k, v] of Object.entries(top)) if (speaks(v)) out[k] = v;
  return out;
}

/**
 * Merge one Destination's two representations into the single public one.
 *
 * Exported so the guard can exercise it directly on a fixture rather than
 * having to build a whole site.
 */
export function mergeDestination(canonical, profile) {
  if (!canonical) return profile;
  if (!profile) return canonical;

  const merged = overlay(profile, canonical);

  /* `costs` is an object of possibly-null members on both sides, so the
     top-level overlay would take the canonical one whole and drop a living
     cost the profile had and the canonical record did not. */
  merged.costs = overlay(profile.costs || {}, canonical.costs || {});

  /* Both are true of a half-migrated Destination and pages ask different
     questions of them: `migrated` means a canonical record exists, and
     `hasProfile` means there is still un-migrated research behind it. */
  merged.migrated = true;
  merged.hasProfile = true;
  return merged;
}

/**
 * The Destination catalogue the pages see: every Destination exactly once.
 *
 * Order is the profiles' order with canonical-only Destinations appended,
 * rather than canonical-first. Denmark is the only canonical-only Destination
 * today and it has its own section; putting the migrated records first would
 * have reordered the whole list every time one more Destination migrated,
 * which is a visible change to every index page caused by a data move that
 * should not be visible at all.
 */
export function reconcileDestinations(migrated, profiles) {
  const byCode = new Map();
  for (const d of migrated || []) if (d?.code) byCode.set(d.code, d);

  const out = [];
  const used = new Set();
  for (const p of profiles || []) {
    if (!p?.code) continue;
    out.push(mergeDestination(byCode.get(p.code), p));
    used.add(p.code);
  }
  for (const [code, d] of byCode) {
    if (!used.has(code)) out.push({ ...d, hasProfile: false });
  }
  return out;
}

/**
 * Destination codes that have a canonical record but no country profile.
 *
 * `calendar.mjs` worked this out for itself with its own `seen` set, and its
 * comment said six Destinations overlapped when the live graph had fourteen —
 * overlap knowledge duplicated outside the catalogue goes stale silently,
 * because being wrong about it produces a plausible page rather than an error.
 */
export function canonicalOnlyCodes(migrated, profiles) {
  const have = new Set((profiles || []).map((p) => p?.code).filter(Boolean));
  return (migrated || []).map((d) => d?.code).filter((c) => c && !have.has(c));
}
