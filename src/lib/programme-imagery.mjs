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
 * Each record carries a `scope`, and no photograph appears on two cards
 * (`backdropResolver` below has the order):
 *
 *   1. `programme:<programme id>`, a picture chosen for that programme;
 *   2. `field:<field.primary>`, a pool of pictures of its field, each dealt to
 *      one card only;
 *   3. `field:interdisciplinary`, for `other`, an unknown field, a field with
 *      no pool or a spent one.
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
  light: { top: 0.08, text: 0.84, foot: 0.94, dim: 1 },
  dark: { top: 0.12, text: 0.86, foot: 0.93, dim: 0.85 },
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
 * **One photograph per card, site-wide.** The owner's rule (25 September
 * 2026): "We can't have repeated pictures." A card is a programme, or a family
 * of paths that share one card (`card`, from src/lib/families.mjs `cardKey`).
 * Every member of a family resolves to the family's one picture; no two cards
 * resolve to the same Commons file.
 *
 * `programmes` is every programme the site shows, as
 * `{ id, field, card, primary }`: `field` is the `field.primary` vocabulary
 * value, `card` the card it belongs to (its own id when it has no family), and
 * `primary` whether it leads its family. The whole catalogue is needed because
 * uniqueness is a property of the whole catalogue.
 *
 * Assignment, deterministic and from the data alone:
 *
 *   1. A card whose members have a `programme:<id>` picture takes the first
 *      one, primary member first. That picture is chosen for that programme.
 *   2. Every other card draws from its field's pool, `field:<field>` — every
 *      publishable record with that scope, in key order. Cards are served in
 *      card-key order and each takes the first picture in the pool that no
 *      card has taken yet. Pictures are compared by Commons file, so two
 *      records naming one file count as one picture.
 *   3. A card whose field has no pool, or whose pool is spent, draws from the
 *      interdisciplinary pool the same way.
 *   4. Only when every pool it may use is spent does a card repeat a picture:
 *      it takes pool picture i mod n, as before. That is a data gap — too few
 *      pictures for the field — and `scripts/test-unique-images.mjs` fails on
 *      it and names the field that needs another photograph.
 *
 * Returns `(programmeId) => backdrop | null`. A backdrop is
 * `{ key, scope, src, width, height, srcset: [{ src, width }] }`, and its
 * paths are site-relative.
 */
export function backdropResolver(records, programmes) {
  const scopes = byScope(records);
  const fieldScope = (field) => (field && scopes.has(`field:${field}`) ? `field:${field}` : FALLBACK_SCOPE);

  /* Cards, each with its members primary-first then by id. */
  const cards = new Map();
  for (const p of programmes) {
    const k = p.card || p.id;
    if (!cards.has(k)) cards.set(k, []);
    cards.get(k).push(p);
  }
  for (const members of cards.values()) {
    members.sort((a, b) => Number(!!b.primary) - Number(!!a.primary) || String(a.id).localeCompare(String(b.id)));
  }

  const taken = new Set();
  const chosen = new Map();
  const cardKeys = [...cards.keys()].sort((a, b) => String(a).localeCompare(String(b)));

  /* 1. Programme-specific pictures first, so a pool never takes one a card was chosen for. */
  for (const k of cardKeys) {
    for (const m of cards.get(k)) {
      const r = scopes.get(`programme:${m.id}`)?.[0];
      if (r) { chosen.set(k, r); taken.add(r.file || r.key); break; }
    }
  }

  /* 2–4. Pools, in card order. Every card is served from its own field's
     pool before any card borrows from the fallback pool, so a field that has
     run short cannot take the picture meant for a card of the fallback field. */
  const fromPool = (scope) => (scopes.get(scope) || []).find((r) => !taken.has(r.file || r.key)) || null;
  const take = (k, r) => { chosen.set(k, r); taken.add(r.file || r.key); };
  const poolOf = (k) => fieldScope(cards.get(k)[0].field);
  for (const k of cardKeys) {
    if (chosen.has(k)) continue;
    const r = fromPool(poolOf(k));
    if (r) take(k, r);
  }
  for (const k of cardKeys) {
    if (chosen.has(k)) continue;
    const r = fromPool(FALLBACK_SCOPE);
    if (r) take(k, r);
  }
  const turns = new Map();
  for (const k of cardKeys) {
    if (chosen.has(k)) continue;
    const scope = poolOf(k);
    const list = scopes.get(scope) || scopes.get(FALLBACK_SCOPE) || [];
    const n = turns.get(scope) || 0;
    turns.set(scope, n + 1);
    if (list.length) chosen.set(k, list[n % list.length]);
  }

  const cardOf = new Map(programmes.map((p) => [p.id, p.card || p.id]));

  const shape = (r) => ({
    key: r.key,
    scope: r.scope,
    src: r.src,
    width: r.width,
    height: r.height,
    /* Where the crop should sit (a CSS object-position), chosen by the
       reviewer for this file; the card box is 16:10, so only a record whose
       subject is off-centre needs one. */
    ...(r.focus ? { focus: r.focus } : {}),
    srcset: [...(r.variants || []), { src: r.src, width: r.width }]
      .filter((v) => v.src && v.width)
      .sort((a, b) => a.width - b.width)
      .map((v) => ({ src: v.src, width: v.width })),
  });

  return (id) => {
    const r = chosen.get(cardOf.get(id) || id);
    return r ? shape(r) : null;
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
export const CARD_SIZES = '(min-width: 66rem) 400px, (min-width: 44rem) 50vw, calc(100vw - 2rem)';
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
