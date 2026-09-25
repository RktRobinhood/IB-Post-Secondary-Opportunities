/**
 * The faded photograph behind a programme card.
 *
 * The owner asked for "an image specific to that discipline or bachelor's"
 * behind each programme card. The pictures live in
 * `data/programme-images.json`. That file is apart from `data/images.json`
 * because these are pictures of a discipline, not of a place. The records have
 * the same shape and pass the same editorial gate (`publishable()` in
 * `imagery.mjs`): a rejected record is skipped, and the card falls back to the
 * next level.
 *
 * Each record carries a `scope`, and the resolution order is:
 *
 *   1. `programme:<programme id>`, the programme's own picture;
 *   2. `field:<field.primary>`, a picture of its field. Where a field has more
 *      than one, programmes that fall back to it take them in turn (see below);
 *   3. `field:interdisciplinary`, for `other`, an unknown field or a field with
 *      no picture.
 *
 * `field.secondary` is not consulted. The research explains why:
 * docs/research/programme-images/README.md.
 *
 * Nothing here names a programme, a field value or a country. The fallback
 * scope is the one exception, and it is a vocabulary value, not a record.
 * `scripts/test-programme-images.mjs` reads this file back to keep it that way.
 */
import { publishable } from './imagery.mjs';

/** The scope every card can fall back to. */
export const FALLBACK_SCOPE = 'field:interdisciplinary';

/**
 * The overlay between the photograph and the card's text, and how dim the
 * photograph is under it. These are the numbers the stylesheet uses (the
 * `--veil-*` tokens in site.css). The guard computes worst-case text contrast
 * from them and checks that the stylesheet still says the same.
 *
 *   top:  the band above the text (the card's `--card-headroom`). No text sits
 *         here; it is where the picture shows.
 *   text: where the first line of text starts. It is the minimum under any
 *         text.
 *   foot: the bottom edge.
 *   dim:  CSS brightness() on the photograph. A pure white pixel becomes
 *         255 × dim, which is the worst case for pale text in dark mode.
 */
export const VEIL = {
  light: { top: 0.4, text: 0.84, foot: 0.94, dim: 1 },
  dark: { top: 0.45, text: 0.86, foot: 0.93, dim: 0.85 },
};

/** The records grouped by scope. Only publishable ones, ordered by key so the order is stable. */
function byScope(records) {
  const out = new Map();
  for (const [key, r] of Object.entries(records || {}).sort(([a], [b]) => a.localeCompare(b))) {
    if (!r?.scope || !r.src || !publishable(r)) continue;
    if (!out.has(r.scope)) out.set(r.scope, []);
    out.get(r.scope).push({ key, ...r });
  }
  return out;
}

/**
 * Build a resolver for a catalogue.
 *
 * `programmes` is every programme the site shows, as `{ id, field }`, where
 * `field` is the `field.primary` vocabulary value. The whole catalogue is
 * needed, not just one card, because of how a field with several pictures
 * shares them out. The programmes that fall back to that field are sorted by
 * id, and the programme at position i takes picture i mod n. The choice is
 * deterministic and comes from the data. Programmes of one institution sit
 * together in id order, so neighbouring cards on an institution page take
 * different pictures.
 *
 * Returns `(programmeId) => backdrop | null`. A backdrop is
 * `{ key, scope, src, width, height, srcset: [{ src, width }] }`, and its
 * paths are site-relative.
 */
export function backdropResolver(records, programmes) {
  const scopes = byScope(records);
  const own = (id) => scopes.get(`programme:${id}`)?.[0] || null;
  const fieldScope = (field) => (field && scopes.has(`field:${field}`) ? `field:${field}` : FALLBACK_SCOPE);

  /* Who falls back to each field, in id order. */
  const turns = new Map();
  for (const p of [...programmes].sort((a, b) => String(a.id).localeCompare(String(b.id)))) {
    if (own(p.id)) continue;
    const scope = fieldScope(p.field);
    if (!turns.has(scope)) turns.set(scope, []);
    turns.get(scope).push(p.id);
  }

  const shape = (r) => ({
    key: r.key,
    scope: r.scope,
    src: r.src,
    width: r.width,
    height: r.height,
    srcset: [...(r.variants || []), { src: r.src, width: r.width }]
      .filter((v) => v.src && v.width)
      .sort((a, b) => a.width - b.width)
      .map((v) => ({ src: v.src, width: v.width })),
  });

  const fieldOf = new Map(programmes.map((p) => [p.id, p.field]));
  return (id) => {
    const mine = own(id);
    if (mine) return shape(mine);
    const scope = fieldScope(fieldOf.get(id));
    const list = scopes.get(scope);
    if (!list?.length) return null;
    const i = Math.max(0, (turns.get(scope) || []).indexOf(id));
    return shape(list[i % list.length]);
  };
}

/** A backdrop's srcset attribute, with each path passed through `url`. */
export function srcsetOf(backdrop, url = (s) => s) {
  return (backdrop?.srcset || []).map((v) => `${url(v.src)} ${v.width}w`).join(', ');
}

/**
 * The `sizes` a card background is drawn at. A grid card is at most about
 * 400 px wide on a desktop, half the viewport on a tablet, and the full width
 * on a phone. A finder row is the full width.
 */
export const CARD_SIZES = '(min-width: 66rem) 400px, (min-width: 44rem) 50vw, 100vw';
export const ROW_SIZES = '100vw';

/* --- Contrast, for the guard and anyone checking a colour ---------------- */

const channel = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
export function luminance([r, g, b]) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
export function hex(h) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(h).trim());
  if (!m) throw new Error(`not a six-digit hex colour: ${h}`);
  return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
}
/** The colour a veil of `paper` at `alpha` makes over a photograph pixel. The browser composites in sRGB. */
export function veiled(paper, alpha, pixel) {
  return paper.map((c, i) => alpha * c + (1 - alpha) * pixel[i]);
}
/**
 * The worst-case background under text on a veiled card. For dark text that
 * is a black pixel. For pale text it is a white pixel dimmed by `dim`. The
 * text's own lightness decides which is worse.
 */
export function worstBackground(paper, alpha, text, dim = 1) {
  const pale = luminance(text) > luminance(paper);
  const pixel = pale ? [255 * dim, 255 * dim, 255 * dim] : [0, 0, 0];
  return veiled(paper, alpha, pixel);
}
