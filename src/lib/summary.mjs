import { firstSentence } from './html.mjs';

/** Keep the record's complete sentence; a summary never ends at a word budget. */
export const completeSentence = (text) => firstSentence(text, Infinity, 1);

/** `about` is the programme's one-line field; `overview` is its full paragraph. */
export function programmeSummary(programme, fallback = '') {
  return completeSentence(programme?.about || programme?.summary || fallback);
}

/** Lead a country answer with its first concrete figure or named route/place. */
export function countryShortAnswer(text) {
  let rest = String(text || '').replace(/\s+/g, ' ').trim();
  const sentences = [];
  while (rest) {
    const sentence = completeSentence(rest);
    if (!sentence) break;
    sentences.push(sentence);
    rest = rest.slice(sentence.length).trim();
  }
  const concrete = (sentence) => /\d/.test(sentence)
    || /\b[A-Z]{2,}(?:\/[A-Z]+)?\b/.test(sentence)
    || /\b\p{Lu}[\p{L}'’-]+\s+\p{Lu}[\p{L}'’-]+/u.test(sentence)
    || /\S\s+(?:[\p{Ll}][\p{L}'’-]*\s+)*\p{Lu}[\p{L}'’-]{2,}/u.test(sentence);
  return sentences.find(concrete) || sentences[0] || '';
}
