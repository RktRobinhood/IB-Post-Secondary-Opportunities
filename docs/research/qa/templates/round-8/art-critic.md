# Art-director critique: templates, round 8

Fixed since round 7: neutral card pills, doors on one line, brass map buttons on Spain, small Sources row on Ghana, IE "Show all 16", muted path rows, Ashesi no longer opens on "Also in Ghana", Global BBA gone from the pager, 3 sibling cards fill 3 columns.

| Page | Score | One line |
|---|---|---|
| Home | **8** | Ships. Desktop cards hide the city when the degree name is long. |
| Country | **7** | Denmark is lovely. Spain's group header still says the same thing three times. |
| University | **8** | AU and IE read well. Ashesi has a band that holds only a breadcrumb. |
| Programme | **7** | Calm type, but meta lines remain and the hero states the facts three times. |

## Home
| Issue | Where | Fix |
|---|---|---|
| Facts line drops the city on desktop ("Professional bachelor · 3½ yrs", "Academy profession degree · 2 yrs"). Phone shows "Horsens" | desktop-1, desktop-8 | Let facts wrap, or shorten long degree types ("Prof. bachelor", "AP degree"). Never clip the place |
| Place style varies: "Vienna, Austria" vs "Enschede", "Delft" | desktop-8 | One rule: city only |
| The "South America" pill touches the 11 coin. "Imagery: NASA" floats between the zoom buttons and the globe | phone-1 | Offset labels from coins under 600px. Put the credit in the caption row |

## Country
| Issue | Where | Fix |
|---|---|---|
| The h3 "Public universities — UNEDasiss, then preinscripción", its subtitle and the expander "…— unedasiss, then preinscripción" all repeat each other. The expander also lowercases UNEDasiss | es desktop-2/3, phone-4 | h3 "Public universities". Subtitle "6 institutions". Expander "How to apply". Remove the lowercase transform |
| Card blurbs are cut mid-word ("Esbjerg an…", "taug…") | dk desktop-2/3; es desktop-2/4 | Trim at a word or clause boundary at build time, not mid-word with CSS |
| Ghana's single Sources row sits in a ~300px beige band | gh desktop-2, phone-2 | When the explainer has no prose, shrink the band to its content |

## University
| Issue | Where | Fix |
|---|---|---|
| Ashesi: an empty ~200px band holds only the breadcrumb | ashesi desktop-1, phone-1 | Collapse the study band when there are no programmes. On every level, move the breadcrumb to the top of the hero |
| The EBA card stacks "Aarhus / Herning" under facts that already say "2 campuses". BBA does the same with "Segovia or Madrid / Global BBA" | dk-au desktop-2, phone-2; es-ie desktop-2 | Show campus-only paths in the facts line ("Aarhus or Herning") and drop the rows |
| The EBA photo looks like Rotterdam's Markthal, so Aarhus's first card shows another country | dk-au desktop-2; cs desktop-3 | Swap in an Aarhus or Herning photo (data) |
| The deadline panel says "provisional" on every date | dk-au desktop-2; cs desktop-1/2 | Say it once under "Deadlines" |

## Programme
| Issue | Where | Fix |
|---|---|---|
| Meta copy: "Subjects carry no minimum grade unless…", "To be ranked in quota 1:", "Same entry requirements on each.", "Check it before you apply.", and the amber "Provisional dates repeat last year's…" box | cs desktop-2, phone-2/3; ie-bba desktop-2; ub desktop-2 | Delete them. The boxes and the panel already carry the meaning |
| The hero repeats itself: eyebrow "AU · BSC · 3 YRS · AARHUS", then "A three-year degree in Aarhus.", then the facts cells. UB's eyebrow wraps to 2 lines on phone | cs desktop-1; ub desktop-1, phone-1 | Eyebrow shows only institution and country |
| In the path table, the first row repeats "Segovia or Madrid" in two columns. The pager's "Next: International Relations" repeats the sibling card just above | ie-bba desktop-2/3 | Hide Path when it equals Campus. Drop the pager when siblings show |
| Phone sibling cards keep equal-height gaps of about 100px in a single column. "More at UB" is still two text-only cards | cs phone-5; ub desktop-3 | Apply equal height only at 2 or more columns. Give the More-at cards the photo or fallback backdrop |
