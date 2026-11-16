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
 * `backdrop` is the card's stored photograph. `req: false`
 * marks a brief card, which keeps no requirement slot.
 */
export function renderProgrammeCard({ href, title, text, line, backdrop = null, req = '', paths = '', tags = [], meta = [], warning = null }) {
  return card({ href, title, summary: text, line, backdrop, req, paths, tags, meta, warning, mod: 'card--programme' });
}
