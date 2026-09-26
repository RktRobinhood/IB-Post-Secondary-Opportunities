/**
 * The ranking rule for scripts/test-superlatives.mjs, kept here so a one-off
 * sweep of a field the guard does not read can use the same definition
 * (`import { rankings } from './lib/superlatives.mjs'`). The reasoning for each
 * shape is in the header of the guard.
 */

// Words that rank wherever they stand.
export const ALWAYS = new RegExp(
  String.raw`\b(?:by far|best[- ]known|well[- ]known|best-value|world-class|world-leading|world-famous|well[- ]regarded|highly regarded|famous(?:ly)?|renowned|prestigious|excellent|unique(?:ly)?|unlike any(?:where| other)?|one of (?:the |relatively |very )?few|(?:top|highest|high|highly|consistently|traditionally|internationally|globally|best|world)[- ]ranked|ranked (?:among|as|first|second|third|in the top|no\.?|#|\d)|top-\d+|top \d+|No\. ?1|premier|ranked \d+(?:st|nd|rd|th)|reputation|powerhouse|internationally (?:known|recognised|recognized)|well[- ]respected|top-tier|elite(?! Institute)|(?:a|an) (?:leading|top) |one of (?:only|just) \w+|the sole|than any other|nowhere else|rare in (?:Europe|the world|the country)|great (?:universities|schools)|(?<!public |6G )flagship|not (?:find|found) (?:it )?elsewhere|(?:far |much )?better regarded|pioneer(?:ed|ing|s)?|second to none|unrivall?ed|(?:a |the )?world leader|often described as|highly rated|household name|go-to|punch(?:es)? above (?:its|their) weight|ranks? \d+(?:st|nd|rd|th)|(?:known|famous|noted|renowned|respected) for (?:its |their )?(?:excellen\w*|quality|high standards?|reputation|prestige|rigou?r|outstanding|strength|being (?:one|the))|strong (?:reputation|standing|name))\b`,
  'gi'
);
// "The first private university in the country to teach in English": being
// first is a claim about everyone else. "The first cohort" and "the first
// year" are not, because nothing follows them into a field.
const FIRST = /\b[Tt]he first (?!(?:year|years|semester|semesters|round|rounds|cohort|day|days|week|weeks|month|months|intake|term|two|three|stage|step)\b)(?:[\w-]+ ){1,4}?(?:in (?:the )?(?!(?:January|February|March|April|May|June|July|August|September|October|November|December)\b)(?:[A-Z][\w-]*|country|world|region)|to (?:teach|offer|open|admit|introduce|award|run)|at (?:a|an|any) )/g;
// -est words that are not superlatives, or that order dates and places rather
// than rank institutions ("the earliest sitting", "the nearest centre").
const NOT_SUPERLATIVE = String.raw`(?!(?:rest|test|west|interest|request|contest|guest|forest|quest|conquest|protest|harvest|manifest|chest|nest|pest|crest|arrest|digest|honest|modest|suggest|invest|behest|bequest|inquest|priest|attest|midwest|latest|earliest|nearest|soonest|almost)\b)(?!(?:highest|lowest) (?:grade|level|score|mark|result|point)s?\b)`;
const SUPERLATIVE = String.raw`(?:(?:second|third|fourth|fifth)-)?${NOT_SUPERLATIVE}(?:[\w]+est|[\w]+most|most\s+(?!(?:recent|likely)\b)[\w-]+|[\w]+-ranked|best|worst|top|leading|only)`;
// A possessive naming the field the claim ranks within. Contractions are not
// possessives ("It's only open…").
const POSSESSIVE = String.raw`(?!(?:It|That|There|What|Here|Who|He|She|Let)['’]s)[A-Z][\w-]*(?:['’]s|s['’])`;
const FIELD = String.raw`(?:${POSSESSIVE}|world['’]s|country['’]s|nation['’]s|region['’]s|city['’]s)`;
const FRAMED = new RegExp(
  String.raw`\b(?:[Tt]he|[Oo]ne of the|[Aa]mong the|${FIELD})\s+(?:single\s+|very\s+|(?:second|third|fourth|fifth)\s+)?${SUPERLATIVE}\b`,
  'g'
);
// "its largest university" where "its" is a country: the scope exemption is for
// an institution's own campus, programme or door, never for a ranking of
// institutions or cities.
const ITS = /\bits \w+est (?:universit(?:y|ies)|schools?|institutions?|cit(?:y|ies))\b/gi;
// "Hong Kong's first private university", "the world's fifth film school".
const ORDINAL = new RegExp(String.raw`\b${FIELD}\s+(?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\b`, 'g');

export function rankings(text) {
  if (typeof text !== 'string') return [];
  return [ALWAYS, FIRST, FRAMED, ORDINAL, ITS].flatMap((rx) => text.match(rx) || []);
}
