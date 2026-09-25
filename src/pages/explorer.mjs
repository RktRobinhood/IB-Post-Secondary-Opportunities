import { url } from '../lib/layout.mjs';
import { ROW_SIZES, srcsetOf } from '../lib/programme-imagery.mjs';

/*
 * What used to be the programme finder at /programmes/. The finder now lives on
 * the home page (src/pages/discover.mjs; docs/research/ia/plan.md, Batch D) and
 * /programmes/ redirects there. The helpers it shared stay here.
 */

/* A programme's card background, in the shape planner.js writes into its rows.
   The paths are resolved here, at build time, so the client never has to know
   the site's base path for an image. */
export function backdropData(b) {
  return b ? { key: b.key, src: url(b.src), srcset: srcsetOf(b, url), sizes: ROW_SIZES, width: b.width, height: b.height } : null;
}

/**
 * The IB courses that satisfy one requirement: the translated options of a
 * requirement published on a local scale, or the one IB course a native IB
 * requirement names. Empty when the requirement has no IB route.
 */
function ibOptions(r) {
  if (r?.translation) return r.translation.options || [];
  if (r?.option) return [r.option];
  return [];
}

/**
 * Does this requirement need Maths at HL? Read from the IB courses that
 * satisfy it (ADR 0002), never from what the local scale calls the subject:
 * true when every IB way to meet it is a Maths course taken at HL.
 */
function needsMathsHL(r) {
  const opts = ibOptions(r);
  return opts.length > 0 && opts.every((o) => o.area === 'Maths' && Array.isArray(o.levels) && !o.levels.includes('SL'));
}

/** Does every way into this programme go through Maths HL? */
export function requiresMathsHL(entry) {
  if (!entry) return false;
  if ((entry.all || []).some(needsMathsHL)) return true;
  // A "one of" only closes the door if every alternative in it needs Maths HL.
  const sets = entry.oneOfSets || (entry.oneOf ? [entry.oneOf] : []);
  return sets.some((groups) => groups.length > 0 && groups.every((g) => g.some(needsMathsHL)));
}
