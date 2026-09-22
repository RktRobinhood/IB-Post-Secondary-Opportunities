/**
 * HTML to readable text, for matching a recorded claim against its source.
 *
 * This is deliberately not a parser. It needs to answer one question — does the
 * wording we published appear on the page we cited — and for that, a robust
 * strip beats a correct DOM. Two details matter more than they look:
 *
 *   1. Block elements become newlines, so "Mathematics A" in a table cell does
 *      not silently fuse with the next cell into "Mathematics AEnglish B".
 *   2. Script and style content is removed entirely, because several Danish
 *      university sites ship their whole course catalogue as JSON inside a
 *      <script> tag, and matching against that would "confirm" requirements
 *      that no human visitor can see.
 */

const BLOCK = 'address|article|aside|blockquote|br|dd|div|dl|dt|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|tbody|td|tfoot|th|thead|tr|ul';

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—',
  aelig: 'æ', oslash: 'ø', aring: 'å', AElig: 'Æ', Oslash: 'Ø', Aring: 'Å',
  eacute: 'é', hellip: '…', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', middot: '·',
  shy: '­', zwj: '‍', zwnj: '‌',
};

export function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-zA-Z]+);/g, (m, name) => (name in ENTITIES ? ENTITIES[name] : m));
}

export function htmlToText(html) {
  if (!html) return '';
  let s = html;
  s = s.replace(/<!--[\s\S]*?-->/g, ' ');
  s = s.replace(/<(script|style|noscript|svg|template)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  s = s.replace(new RegExp(`<(?:${BLOCK})\\b[^>]*>`, 'gi'), '\n');
  s = s.replace(new RegExp(`</(?:${BLOCK})>`, 'gi'), '\n');
  s = s.replace(/<[^>]+>/g, ' ');
  s = decodeEntities(s);
  // Soft hyphens and zero-width characters are invisible hyphenation hints, and
  // Danish sites use them constantly because the compound words are long — CBS
  // ships "re&shy;quire&shy;ments". They render as nothing and must match as
  // nothing, or every requirement on such a page reads as missing.
  s = s.replace(/[­​‌‍﻿]/g, '');
  s = s.replace(/[ \t ]+/g, ' ');
  s = s.replace(/ *\n */g, '\n');
  s = s.replace(/\n{3,}/g, '\n\n');
  return s.trim();
}

/** The <title>, useful for spotting a page that redirected to a 404 or a hub. */
export function pageTitle(html) {
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html || '');
  return m ? decodeEntities(m[1]).replace(/\s+/g, ' ').trim() : '';
}

/**
 * Does the page look like it failed, whatever status code it returned? Danish
 * university sites are fond of serving a friendly 200 for a page that no longer
 * exists, and a soft 404 that we silently accept is exactly how a dead
 * requirement stays published.
 */
export function looksLikeSoftError(text, title) {
  const hay = `${title}\n${text.slice(0, 600)}`.toLowerCase();
  return /page not found|siden findes ikke|404|kunne ikke findes|not be found|no longer available|siden blev ikke fundet/.test(hay);
}

/** A readable window around a match, snapped to word boundaries. */
export function excerptAround(text, index, length, pad = 110) {
  let start = Math.max(0, index - pad);
  let end = Math.min(text.length, index + length + pad);
  if (start > 0) {
    const sp = text.indexOf(' ', start);
    if (sp !== -1 && sp < index) start = sp + 1;
  }
  if (end < text.length) {
    const sp = text.lastIndexOf(' ', end);
    if (sp !== -1 && sp > index + length) end = sp;
  }
  const snippet = text.slice(start, end).replace(/\s+/g, ' ').trim();
  return `${start > 0 ? '…' : ''}${snippet}${end < text.length ? '…' : ''}`;
}
