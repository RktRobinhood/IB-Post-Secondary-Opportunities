import { card } from './components.mjs';

/**
 * The one visual contract for a programme card, regardless of which data
 * model supplied it. Country-specific records may know fewer facts, but they
 * do not get a different band, type scale or content hierarchy (#63).
 *
 * Adapters return this small view model:
 *   title → credential/length/place line → one requirement/selection line →
 *   optional path rows → one status tag → page-context meta.
 */
export function renderProgrammeCard({ href, title, line, backdrop = null, req = '', paths = '', tags = [], meta = [] }) {
  return card({ href, title, line, backdrop, req, paths, tags, meta });
}
