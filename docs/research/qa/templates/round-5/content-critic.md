# Content critic, round 5 (admissions-counsellor view)

| Template | Score | One line |
|---|---|---|
| Country | 7/10 | Fixed: the Spain hero deadline (2 Nov) and the route grouping. Still open: label-led ledes and bare sparse cards. |
| University | 6/10 | Fixed: transcripts are out of the hero and the "Other · 9" grouping is gone. Still open: path headers, a wrong "Next deadline", and siblings shown first on a sparse page. |
| Programme | 7/10 | Fixed: "What it is" now comes first. Still open: the generated hero line, the ranking fallback and "5.000 of 14". |

## Country

| Issue | Where | Concrete fix |
|---|---|---|
| Ledes still start with a field label: "Where to apply: UNEDasiss…" and "Minimum: 24 points…". | es | Strip a leading "Label:". |
| The lede is the first sentence even when it has no number ("Public universities charge per credit…", "The English-taught set is much smaller."). | es Money, dk Language | Prefer the first sentence that holds a figure or a name. |
| A sparse card shows only initials and a city, so the student has nothing to read. | gh | Fall back to the university's hero facts (for example "All teaching in English"). |

## University

| Issue | Where | Concrete fix |
|---|---|---|
| "NEXT DEADLINE 5 Mar 2027" in the hero, but the list just below starts at 6 Nov 2026. The hero took the last round instead of the next one. | es-ie | Use the earliest future date from the same list. If you want the last round too, add "final 5 Mar". |
| The header reads "2 CAMPUSES" over Single/Dual rows (Political Science, Design, Applied Maths), and the meta line switches between "2 campuses" and "Segovia or Madrid". The programme page has the same fault: "Taught on two campuses" over a Spain-based/Global table. | es-ie, IE BBA | Take the header from the row axis ("2 PATHS"). Use one campus wording per school. |
| "Also in Ghana" still comes before the school's own "What it asks". The page has no Sources or checked line. | Ashesi | Show the school's own blocks first and siblings last. Always render Sources (the IBO entry). |

## Programme

| Issue | Where | Concrete fix |
|---|---|---|
| The hero line is generated ("A three-year degree in Aarhus.") and repeats the kicker. | all | Use the first sentence of "What it is". |
| "How places are decided" falls back to "does not guarantee a place" while the quota rule sits just above it. | dk-au CS | Lead with the quota rule. Use the fallback only when there is no rule. |
| "5.000 of 14" in the hero means nothing to an IB student. | es-ub | When the cut-off equals the scale minimum, say "Last year: every eligible applicant got in". |

## Data backlog

- Ashesi and ACM have no blurb, photo, official URL or programmes. Ghana has no How-it-works record.
- es-ie: the type reads "BUSINESS SCHOOL". The BBA path should be labelled "Spain-based BBA", and its campus repeats the path label. Fashion Design and Humanities cards have no campus. Next links to the Global BBA, which this page already merges as a path.
- dk-au: Campuses still lists Foulum and Roskilde. Check where the 30 in "30–43" comes from.
- Denmark: "Results come out on 6 July" contradicts "28 July · You get an answer". "What it is actually like" has no lede.
- Denmark: the Royal Danish Academy card's city reads "Nexø, Bornholm", but its blurb says Copenhagen.
- Spain: the hero line describes the process (UNEDasiss) rather than the possibilities. The Language lede names Navarra, which has no card.
- es-ub: the record needs a plain-English cut-off line. The 2027 dates are not published yet, which is expected.
