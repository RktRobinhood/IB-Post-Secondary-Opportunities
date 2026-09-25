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
export function replaceElements(src, tag, keep = () => ' ') {
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

/**
 * The `<main>` of a page, with everything a reader does not see by default taken out.
 *
 * `markDisclosures` keeps each closed disclosure's summary as a `<summary>`
 * element rather than flattening it to a paragraph, so a measure that treats
 * "a tap-to-open line" as the end of a run of prose can still see it.
 */
export function defaultView(pageHtml, { markDisclosures = false } = {}) {
  const main = pageHtml.match(/<main\b[^>]*>([\s\S]*)<\/main>/i)?.[1] ?? pageHtml;
  let h = main;
  for (const tag of ['script', 'style', 'svg', 'noscript', 'nav', 'template']) h = replaceElements(h, tag);
  // A closed disclosure shows its summary line and nothing else. An open one
  // shows everything, so it is left alone.
  h = replaceElements(h, 'details', (openTag, inner, whole) => {
    if (/\sopen(?=[\s>=])/i.test(openTag)) return whole;
    const summary = inner.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i)?.[1] ?? '';
    return markDisclosures ? ` <summary data-disclosure>${summary}</summary> ` : ` <p>${summary}</p> `;
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

/* --- Prose runs: what the text-wall guard reads -------------------------------

   Used by scripts/test-text-walls.mjs. A "run" is consecutive paragraphs of 15
   or more words with nothing but headings between them. Anything that is not
   reading ends it: a picture, a control, a table, a disclosure, a card list.
   Headings do not, because heading, paragraph, heading, paragraph is still a
   wall. Pass a view made with `defaultView(html, { markDisclosures: true })`,
   so a closed disclosure counts as the break it is. */

/** Anything that is not reading. Written once, so the run and "before the first action" agree. */
export const BREAK =
  /<(img|picture|figure|table|details|summary|input|select|textarea|button|canvas|video|iframe)\b|<(ul|ol|div|article|section)\b[^>]*class="[^"]*\b(tiles|cards|card|reel|doors|chips|board|timeline|prog-list|need|glance|stats|toolkit|tags)\b|<a\b[^>]*class="[^"]*\b(card|tile|door|btn|chip)\b/i;

/** Containers whose items are cards, not paragraphs. */
const CARD_LIST = /\sclass="[^"]*\b(tiles|cards|card|reel|doors|chips|board|timeline|prog-list|need|glance|stats|toolkit|tags)\b/i;

/**
 * Replace every `tag` element whose opening tag matches `test` with
 * `replacement`, and look inside the ones that do not (nesting-aware).
 */
function replaceMatching(src, tag, test, replacement) {
  return replaceElements(src, tag, (openTag, inner, whole) => {
    if (test.test(openTag)) return replacement;
    const close = whole.match(new RegExp(`</${tag}\\s*>$`, 'i'))?.[0] ?? '';
    return openTag + replaceMatching(inner, tag, test, replacement) + close;
  });
}

/** The view with each card list replaced by one break marker, so a card's text is never read as prose. */
export function stripCardLists(view) {
  let h = view;
  for (const tag of ['ul', 'ol', 'div', 'article']) h = replaceMatching(h, tag, CARD_LIST, ' <figure data-cards></figure> ');
  return h;
}

// Named back-references, so the pattern survives being concatenated with BREAK.
const BLOCK = /<(?<bt>p|li|dd|blockquote)\b[^>]*>[\s\S]*?<\/\k<bt>>|<(?<ht>h[1-6])\b[^>]*>[\s\S]*?<\/\k<ht>>/gi;

const plain = (h) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

/** The longest run of prose in a view, by words: `{ paras, words, first }`. */
export function proseRuns(view) {
  const src = stripCardLists(view);
  let cur = { paras: 0, words: 0, first: '' };
  let worst = { paras: 0, words: 0, first: '' };
  const flush = () => {
    if (cur.words > worst.words || (cur.words === worst.words && cur.paras > worst.paras)) worst = cur;
    cur = { paras: 0, words: 0, first: '' };
  };
  const re = new RegExp(`${BREAK.source}|${BLOCK.source}`, 'gi');
  let m;
  while ((m = re.exec(src))) {
    const s = m[0];
    const isBlock = /^<(p|li|dd|blockquote|h[1-6])\b/i.test(s);
    // A picture, control or card, or a block that contains one, ends the run.
    if (!isBlock || BREAK.test(s.replace(/^<[^>]+>/, ''))) {
      flush();
      continue;
    }
    const n = countWords(s);
    if (/^<h/i.test(s)) {
      if (cur.paras) cur.words += n; // a heading extends a run; it does not start one
      continue;
    }
    if (n >= 15) {
      cur.paras++;
      cur.words += n;
      cur.first ||= plain(s).slice(0, 80);
    } else if (/^<li/i.test(s)) flush(); // a list of short items is a list, not prose
  }
  flush();
  return worst;
}

/** Default-view words before the first match of `breakRe` (the whole view if there is none). */
export function wordsBeforeFirst(view, breakRe = BREAK) {
  const at = view.search(breakRe);
  return countWords(at >= 0 ? view.slice(0, at) : view);
}
