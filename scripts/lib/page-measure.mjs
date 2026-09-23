/**
 * What a reader sees on a built page before they choose to open anything.
 *
 * Shared by `scripts/test-page-budget.mjs` (the guard) and anyone measuring a
 * page by hand, so the number in an issue and the number the gate enforces are
 * the same number by construction.
 *
 * It reads HTML, not geometry. "Default view" means: the contents of `<main>`,
 * less anything a reader has to act to see — the body of a closed `<details>`
 * (its `<summary>` is visible, so it is counted) — and less the parts that are
 * not reading: navigation, scripts, styles, inline SVG and `<noscript>`.
 *
 * No dependency: a small, nesting-aware element remover is enough for markup
 * this repository generates itself.
 */

/** Remove every `<tag …>…</tag>` (nesting-aware), passing each to `keep` for a replacement. */
function replaceElements(src, tag, keep = () => ' ') {
  const open = new RegExp(`<${tag}(?=[\\s>/])[^>]*>`, 'gi');
  const any = new RegExp(`<${tag}(?=[\\s>/])[^>]*>|</${tag}\\s*>`, 'gi');
  let out = '';
  let i = 0;
  for (;;) {
    open.lastIndex = i;
    const m = open.exec(src);
    if (!m) break;
    out += src.slice(i, m.index);
    // Walk forward to the matching close tag.
    any.lastIndex = m.index + m[0].length;
    let depth = 1;
    let end = src.length;
    let t;
    while (depth && (t = any.exec(src))) {
      depth += t[0][1] === '/' ? -1 : 1;
      if (!depth) end = t.index + t[0].length;
    }
    out += keep(m[0], src.slice(m.index + m[0].length, depth ? src.length : end - `</${tag}>`.length), src.slice(m.index, end));
    i = end;
  }
  return out + src.slice(i);
}

const text = (h) =>
  h
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, 'x')
    .replace(/\s+/g, ' ')
    .trim();

export const countWords = (h) => {
  const t = text(h);
  return t ? t.split(' ').filter((w) => /[\p{L}\p{N}]/u.test(w)).length : 0;
};

/** The `<main>` of a page, with everything a reader does not see by default taken out. */
export function defaultView(pageHtml) {
  const main = pageHtml.match(/<main\b[^>]*>([\s\S]*)<\/main>/i)?.[1] ?? pageHtml;
  let h = main;
  for (const tag of ['script', 'style', 'svg', 'noscript', 'nav', 'template']) h = replaceElements(h, tag);
  // A closed disclosure shows its summary line and nothing else. An open one
  // shows everything, so it is left alone.
  h = replaceElements(h, 'details', (openTag, inner, whole) => {
    if (/\sopen(?=[\s>=])/i.test(openTag)) return whole;
    const summary = inner.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i)?.[1] ?? '';
    return ` <p>${summary}</p> `;
  });
  return h;
}

/**
 * Measure a Destination page.
 *
 * `markers` is a list of `id`s whose position in the default view matters; for
 * each one found, how many default-view words come before it.
 */
export function measure(pageHtml, markers = []) {
  const view = defaultView(pageHtml);
  const at = {};
  for (const id of markers) {
    const m = view.match(new RegExp(`\\sid="${id}"`));
    at[id] = m ? countWords(view.slice(0, m.index)) : null;
  }
  return { words: countWords(view), wordsBefore: at, view };
}
