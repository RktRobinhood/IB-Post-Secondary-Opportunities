import { card } from './components.mjs';

/**
 * The one visual contract for a programme card, regardless of which data
 * model supplied it. Country-specific records may know fewer facts, but they
 * do not get a different band, type scale or content hierarchy (#63).
 *
 * Adapters return this small view model:
 *   title → credential/length/place line → one requirement/selection line →
 *   optional path rows → one status tag → page-context meta.
 *
 * `backdrop` is the card's photograph; `design` is the programme's designed
 * backdrop (src/lib/designed-backdrop.mjs), drawn only when there is none, so
 * every programme card has the same full-bleed shape (#67). `req: false`
 * marks a brief card, which keeps no requirement slot.
 */
export function renderProgrammeCard({ href, title, line, backdrop = null, design = null, req = '', paths = '', tags = [], meta = [] }) {
  return card({ href, title, line, backdrop, design, req, paths, tags, meta });
}
