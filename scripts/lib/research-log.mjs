/**
 * The research-log rule for scripts/test-research-log.mjs, kept here so a
 * one-off sweep of records can use the same definition. The reasoning is in
 * the header of the guard.
 *
 * Two kinds of pattern:
 *
 *   - PHRASES: every form a critic has quoted, kept so none can come back;
 *   - VOCABULARY: the repository's own nouns and the research verbs, whatever
 *     surrounds them. These are what catch a phrasing nobody has quoted yet:
 *     a student has no use for "this profile", "the model", a file path, an
 *     Evidence id, a field name, or being told what was or was not
 *     researched or verified.
 */

export const PHRASES = [
  /\bpages? read\b/i,
  /\bread on \d/i,
  /[,(]\s*read \d/i,
  /\bwere read\b/i,
  /\bno pages? (?:read|found)\b/i,
  /\bpages? found\b/i,
  /\bretrieved\b/i,
  /\bre-read\b/i,
  /\bcould not be (?:confirmed|verified|found) (?:on|in)\b/i,
  /\bnot recorded here\b/i,
  /\bleft as context\b/i,
  /\b(?:during|in) this research\b/i,
  /\bthis research could\b/i,
  /\bwere not read\b/i,
  /\bcould find\b/i,
  /\bwikipedia field\b/i,
  /\bthat is the finding\b/i,
  /\brecorded here so\b/i,
  /\bnow 404s?\b/i,
  /\bnot on this calendar\b/i,
  // Round 1 of the #41 critique.
  /\bread in \w+ (?:on|from)\b/i,
  /\b(?:was|were) (?:not )?found\b/i,
  /\bwhen checked\b/i,
  /\bcited here\b/i,
  /\b(?:page|leaflet|portal) on \d{1,2} \w+ 20\d\d:/i,
  // Round 2.
  /\b(?:none|one|two|three|four|five|six|seven|eight|nine|ten|\d+) found\b/i,
  /\b(?:bar|example|scheme|figure|table|score|date|fee) found\b/i,
  /\bcould be found\b/i,
  /\bpages? checked\b/i,
  /\bat the time of checking\b/i,
  /\bnot checked here\b/i,
  /\b(?:bachelor's|programmes?|courses?) checked\b/i,
  /\bthe record holds\b/i,
  /\bADR \d{4}\b/,
  /\bdocs\//,
  /\bcritic\b/i,
  /\bEvidence record\b/i,
  /\bto a fetch\b/i,
  // Round 3.
  /\bpage gives no\b/i,
  /\bround-\d+ (?:audit|critique|pass)\b/i,
];

export const VOCABULARY = [
  // The repository talking about itself.
  /\bthis (?:profile|project|record|pass|audit|sweep|catalogue|dataset)\b/i,
  /\bthe (?:model|schema)\b/i,
  /\bour (?:file|sentence|research|record|data)s?\b/i,
  // Its files, ids and field names.
  /\bdata\/[\w/.-]+/,
  /\b[\w-]+\.json\b/,
  /\bev-[a-z]{2,}-[\w-]+\b/,
  /\b[a-z]+_[a-z_]+\b/,
  /\b[a-z]+[A-Z][a-z]+\w*\b/g,
  // The research verbs, whatever the tense or negation.
  // "have your original documents verified" is the student's own step, and
  // "verified electronically" is what IBIS does; neither is a research log.
  /\b(?:not |never )?(?<!(?:documents|document|diploma|copies|certificates|results) )(?:researched|verified)\b(?! (?:automatically|electronically|in Studielink|by (?:the|your) (?:university|school|coordinator)))/i,
  /\b(?:Recorded|Listed) (?:because|so)\b/i,
  // Round 4 of the critique: the site explaining its own coverage, whatever
  // the verb. "Named so the route is visible", "Listed for completeness",
  // "recorded here", "recorded as", "inferred", "this site cannot state…".
  /\b(?:Named|Listed|Included|Recorded|Mentioned|Shown)\b[^.]{0,40}\b(?:so that|so the|because|for completeness)\b/,
  /\b(?:named|listed|included|recorded|mentioned) (?:so that|so the|because)\b/i,
  /\bfor completeness\b/i,
  /\bworth naming\b/i,
  // "Recorded here" and "named on this page" are the site describing its
  // records. "Listed above / below / here" is left alone: it points the reader
  // to another part of the page ("not listed here", "listed above it"), which
  // is navigation, not a research log. "Listed here because …" is flagged.
  /\b(?:recorded|named) (?:here|above|below|on this page)\b/i,
  /\b(?:named|listed|included) here because\b/i,
  /\brecorded as\b/i,
  /\bto record\b/i,
  /\binferred\b/i,
  // The site's machinery. "This site assumes the 2027 intake" and "this site
  // treats X as meeting it" stay: they tell the student what judgement was
  // made on their behalf, which is the honest form. "This site cannot state
  // …" and "has no field for …" explain the data model instead.
  /\bthis site (?:cannot|can't|can not|has no|records|does not record)\b/i,
  // "Checked": only the research act. The stamps ("Checked 24 September
  // 2026", "— checked 2026-09-24"), the verification labels ("not yet checked
  // by a person") and the student's own step ("has to be checked with CSN")
  // are not flagged.
  /\b(?:was|were|been|when|we|absence was) checked\b(?! by a person)/i,
  /\bchecked (?:in a browser|for (?:language|[A-Z]{2,}))\b/,
  /\blooked for and\b/i,
  /\bwe (?:could not|did not|have not|found|checked|looked)\b/i,
];

export const RESEARCH_LOG = [...PHRASES, ...VOCABULARY];

// Product and portal names that really are written in camelCase or with an
// underscore.
export const NAME_OK = new Set(['uOttawa', 'iSchool', 'eApply', 'iGraduate', 'eResidence', 'ePortal', 'myCampus', 'uSis', 'iPhone', 'eBay']);

/*
 * The page's own furniture, removed before matching. The research-depth
 * tier ("Researched in depth", src/lib/data.mjs RESEARCH_DEPTH) and the home
 * page's "Also researched:" are labelled statements of how far to trust a
 * page — the product's honesty rule, not a researcher's diary — and a URL is
 * an address, whatever its path looks like ("…/fechas_clave").
 */
const FURNITURE = [/\bResearched in depth\b/g, /\bAlso researched:/g, /\bhttps?:\/\/\S+/g];

/** Every research-log phrase in a line of text, as [match, index] pairs. */
export function matches(raw) {
  // Blank furniture out rather than delete it, so indexes still point into the line.
  const text = FURNITURE.reduce((t, rx) => t.replace(rx, (m) => ' '.repeat(m.length)), raw);
  const out = [];
  for (const rx of RESEARCH_LOG) {
    if (rx.global) {
      for (const m of text.matchAll(rx)) if (!NAME_OK.has(m[0])) out.push([m[0], m.index]);
    } else {
      const m = rx.exec(text);
      if (m && !NAME_OK.has(m[0])) out.push([m[0], m.index]);
    }
  }
  return out;
}

export const researchLog = (text) => matches(text).map(([m]) => m);
