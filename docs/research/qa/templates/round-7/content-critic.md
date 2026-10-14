# Content critic, round 7 (admissions-counsellor view)

| Template | Score | One line |
|---|---|---|
| Home | 6/10 | It now holds all 1,904 degrees and loads them as you scroll, but most cards are cryptic: 1,225 name the school only by initials ("PTE", "UD", "KU"), 1,442 hide a city the record has, and none names the country. |
| Country | 7/10 | "See every degree" now opens Home filtered to the country (`/?where=dest:es`), which ends the loop. The ledes that start with a label, the unnamed hero deadline and the bare Ghana page are unchanged. |
| University | 6/10 | AU and IE read well. Ashesi still shows siblings before its own block and has no Sources. IE's 16 photo cards have no grouping. |
| Programme | 7/10 | "Everyone eligible" replaces "5.000 of 14", and AU now leads with the cut-off. The hero line is still generated, and IE's path table still says the same thing twice. |

## Home
| Issue | Where | Concrete fix |
|---|---|---|
| The school name is reduced to initials, and the city drops out whenever it equals the institution's city, which is the school-page rule reused out of context. "AAU" (Klagenfurt) sits next to Aalborg's cards. | discover.mjs:166 `at: inst.shortName`; schools.mjs:216 `where` | On Home, pass `inst.name` and always show the city. Add the country: "Klagenfurt, Austria". |
| `credentialShort` cuts the title out from inside parentheses: "BSc (Economist in )", "Bachelor of (Honours)", "BSc ()". 28 cards are affected. | schools.mjs:145 | If the remainder ends in "in )", "()" or "of (", return the full credential. |
| The badge slot still mixes two axes. "Full Diploma" and "Diploma or Course Results" describe the requirement, while "Open entry" and "Last year: 43" describe the odds. | cards | Use one axis, the chance of getting in, and move the diploma type to the Needs line. |
| Meta footer: "Every figure carries its date and source… How this is built". discover.js also has "N researched countries". | card foot; discover.js:569/606 | Delete the sentence. Say "N countries". |

## Country
| Issue | Where | Concrete fix |
|---|---|---|
| Ledes still start with a label: "Minimum: 24 points…", "Where to apply: …", "2 November 2026: Universidad de Deusto…". | es | Strip a leading "Label:" in the template. |
| The hero shows "2 Nov · Next deadline" with no school named. Public-university applicants apply in June. | es hero | "2 Nov · Deusto". |
| Meta language: "Context, not a rule" and "These are observations rather than rules…". The fold also has no lede. | components.mjs:1283/1306 (dk) | Drop both lines. Use the first context topic as the lede. |
| Sparse cards show only initials and a city. Go deeper has no link to degrees. | gh | Put the facts the record has on each card: "All teaching in English · Recognises the IB Diploma". Add "Degrees worldwide". |

## University
| Issue | Where | Concrete fix |
|---|---|---|
| "Also in Ghana" comes before the school's own facts. There is no Sources section and no checked date. | Ashesi | Show the school's own blocks first and siblings last. Always render Sources (the IBO statement). |
| 16 full photo cards with no grouping. | es-ie | When there are 13 or more degrees, add field chips and show 4–6 per field, then "Show all N" (Studyportals/UvA, ref #2–3). |
| No in-page navigation on long pages. | es-ie, dk-au | Add a sticky section nav (ref #7). |

## Programme
| Issue | Where | Concrete fix |
|---|---|---|
| The hero line is generated and repeats the kicker ("A four-year languages degree in Barcelona."). | all three | Use the first sentence of "What it is". |
| The PATH and CAMPUS columns both read "Segovia or Madrid" under the header "Taught on two campuses". | IE BBA | Header "2 paths". Drop a cell when it repeats the path. |
| The quota-2 paragraph sits inside a requirement tile, which makes a text wall on a phone. | dk-au CS | One line ("Below this: quota 2"), with the rest one tap down. Use label/value rows (ref #5). |
| "Provisional dates repeat last year's" sits under the requirements, far from the dates it refers to. | dk-au CS | Move it into the Deadlines panel. |

## Data backlog
- Ghana: Ashesi and ACM have no blurb, photo, official URL or programmes.
- es-ie: the BBA path label should be "Spain-based BBA". The chips say "Motivation letter" but the text says "CV". Fashion Design and Humanities have no campus.
- dk-au: the 30 in "30–43" matches no card (the lowest is 39). Campuses lists Foulum and Roskilde.
- Denmark: "Results come out on 6 July" contradicts "28 July · You get an answer". The Language lede is "The English-taught set is much smaller."
- Spain: the Language lede names Navarra, which has no card. The Money lede has no figure.
- Home cards: 1,778 have no Needs line and only 17 show a fee. Harvard, Yale and MIT have no selectivity badge while Fontys shows "Open entry".
