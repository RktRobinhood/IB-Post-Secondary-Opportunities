# Content critic, round 6 (admissions-counsellor view)

| Template | Score | One line |
|---|---|---|
| Home | 6/10 | A strong first screen, but the cards cover only Denmark and the Netherlands (73 paths). |
| Country | 6/10 | Spain is rich and well ordered. Its main button, "See every degree", loops back to the country, and Ghana's cards are bare. |
| University | 6/10 | IE and AU are good. The round-5 items are still open: the path headers, and siblings first on a sparse page. |
| Programme | 7/10 | "What it is" leads. The generated hero line, the ranking fallback and "5.000 of 14" are unchanged. |

## Home

| Issue | Where | Concrete fix |
|---|---|---|
| The cards hold only DK and NL degrees. A search for "Business" or "Barcelona" never reaches the 81 Spanish degrees, even though each has its own page. | discover.mjs reads `site.programmes` only | Feed every degree page into the cards in the same card shape. When a degree has no requirements, show its university's line. |
| The badge slot mixes requirements ("Full Diploma", "Diploma or Course Results") with odds ("Last year: 32 IB points", "Open entry"). | cards | Use one axis, the chance of getting in. Move the diploma type to the Needs line. |
| Meta wording: "Every figure carries its date and source… How this is built", plus the count line "N countries researched". | foot of the cards; count line | Delete the sentence and say "N countries". |

## Country

| Issue | Where | Concrete fix |
|---|---|---|
| "See every degree" and "Every degree in Spain" open the home page, which has no Spanish cards. The student gets one tile that leads back to Spain. This hits every country except DK and NL. | es CTA, Go deeper | Fix Home #1. Until then, link to this page's own #where list. |
| Ledes still start with a label: "Minimum: 24 points…", "Where to apply: UNEDasiss…", "2 November 2026: Universidad de Deusto…". | es | Strip a leading "Label:". |
| The hero's "2 Nov · Next deadline" doesn't say which school it belongs to. A student applying to a public university will take it as their date, but their window is in June. | es hero | Name the school: "2 Nov · Deusto". |
| A sparse card shows only initials and a city, and the page stops at Sources. | gh | Put each school's known facts on its card ("All teaching in English · Recognises the IB Diploma"). Add a link to degrees worldwide. |

## University

| Issue | Where | Concrete fix |
|---|---|---|
| "Also in Ghana" comes before the school's own block, and there is no Sources section or checked date. | Ashesi | Show the school's own blocks first and siblings last. Always render Sources (the IBO statement). |
| "2 CAMPUSES" sits over Single/Dual rows. The BBA card mixes "Segovia or Madrid" with "Global BBA". | es-ie Political Science, Design, Applied Maths, BBA | Take the header from the row axis ("2 PATHS"). |

## Programme

| Issue | Where | Concrete fix |
|---|---|---|
| The hero line is generated and repeats the kicker ("A three-year degree in Aarhus."). | all three | Use the first sentence of "What it is". |
| "How places are decided" falls back to "does not guarantee a place" while the quota rule sits just above it. | dk-au CS | Lead with the quota rule. |
| "5.000 of 14" in the hero means nothing to an IB student. | es-ub | When the cut-off equals the scale minimum: "Last year: every eligible applicant got in". |
| The header says "Taught on two campuses", and the PATH and CAMPUS columns both read "Segovia or Madrid". | IE BBA | Header "2 paths". Drop the campus cell when it repeats the path. |

## Data backlog

- Ghana: Ashesi and ACM have no blurb, photo, official URL or programmes. There is no How-it-works record.
- es-ie: the type reads "BUSINESS SCHOOL". The BBA path should be "Spain-based BBA". Fashion Design and Humanities have no campus. The BBA chips say "Motivation letter" but the text says "CV".
- dk-au: Campuses lists Foulum, Roskilde and Copenhagen. The 30 in "30–43" matches no card (the lowest is 39).
- Denmark: "Results come out on 6 July" contradicts "28 July · You get an answer". "What it is actually like" has no lede. The Royal Danish Academy's city reads "Nexø, Bornholm".
- Spain: the hero line describes the process, not the possibilities. The Language lede names Navarra, which has no card. The Money and Shape ledes have no figure.
- Cards with no Needs line or badge: SDU AI (Vejle), CBS BADM. es-ub needs a plain-English cut-off line.
