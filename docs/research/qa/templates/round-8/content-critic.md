# Content critic, round 8 (admissions-counsellor view)

| Template | Score | One line |
|---|---|---|
| Home | 7/10 (was 6) | Cards now give full school names, the broken credentials are gone and so is the meta footer. Countries are still shown on some cards and not others, and the pill mixes two kinds of statement. |
| Country | 7/10 (=) | The Spain hero names the school with the next deadline, but it picks Deusto (30 Nov) when IE closes on 6 Nov. Ledes that start with a label and the Denmark fold with no lede are unchanged. |
| University | 7/10 (was 6) | Ashesi now puts its own facts first and has a Sources section. IE shows 9 degrees with "Show all 16". AU reads well. |
| Programme | 7/10 (=) | None of the four round-7 items was fixed. There is no regression, and the IE hero's "Before you apply" works well. |

## Home
| Issue | Where | Concrete fix |
|---|---|---|
| The country appears on 1,822 cards but not on 82 (all Danish and Dutch cards: "Enschede", "Delft"). One card reads "Kraków (year 1), then partner universities, Belgium", which attaches the wrong country. | card place fact | Always show "City, Country". Don't add a country to a place string that has commas or "then". |
| The pill uses two vocabularies. "Full Diploma" and "Diploma or Course Results" say which diploma is accepted, while "Open entry" and "Last year: 43" say how hard it is to get in. "Any Diploma got in" and "All qualified got in" mean the same thing. | card__tag | Use admission wording only, with one phrase per meaning. Move the diploma type into the Needs line. |
| Some Needs lines can't be read: "Language ab initio SL or Another language", "at least a 4 or 2 other routes", "Needs a test +1 more". | req line | Name the alternative ("…or another route") or show only the first concrete subject. |
| "2 campuses" appears as the place with no city. | 18 cards | Show the first city plus the count: "Aarhus +1". |

## Country
| Issue | Where | Concrete fix |
|---|---|---|
| The hero says "30 Nov · Next deadline · Deusto", but IE's Round 1 closes on 6 Nov 2026 and the page text says so. | es hero | Compute the next deadline from every school's dates, not only the country calendar. |
| Ledes still start with a label: "Minimum: 24 points…" and "Where to apply: UNEDasiss…". | es Getting in | Remove the leading "Label:" in the template. |
| The disclosure under each group heading repeats the heading, lowercased: "Applying to public universities — unedasiss, then preinscripción". | es groups | Use a short label ("How to apply") and don't change the case. |
| "What it is actually like" is a folded heading with no lede, so a phone shows a bare title. Ghana's cards show only initials and a city. | dk fold; gh | Use the first context topic as the lede. On sparse cards, show the facts the record has ("All teaching in English · Recognises the IB Diploma"). |

## University
| Issue | Where | Concrete fix |
|---|---|---|
| Ashesi ends after "Recognises the IB Diploma" with no next step and no Checked date (the Ghana page has one). | sparse school | Always show the Checked date. If a school has no programmes, add "Degrees: on its own site" or "Find similar degrees" (Home filtered to the country). |
| The card fact "2 campuses" doesn't name the campuses, and the hidden list under it holds paths, not campuses. | es-ie Political Science, Design | Name the cities ("Segovia or Madrid"), or drop the fact when the campus isn't known. |

## Programme
| Issue | Where | Concrete fix |
|---|---|---|
| The hero line is generated and repeats the kicker: "A three-year degree in Aarhus." | all three | Use the first sentence of "What it is". |
| The quota-2 paragraph is still inside the quota-1 tile, and "To be ranked in quota 1:" is followed by "Quota 1: …". | dk-au CS | Make the tile one line, put "Below this: quota 2" one tap down, and drop the lead-in sentence. |
| The path table still reads "Segovia or Madrid / Segovia or Madrid" under "Taught on two campuses". | IE BBA | Use the heading "2 paths" and drop the campus cell when it repeats the path. |
| "Provisional dates repeat last year's" sits under the requirements, far from the dates it describes. | dk-au CS | Move it into the Deadlines panel. |

## Data backlog
- Ghana: Ashesi and ACM have no blurb, photo, official URL or programmes.
- es-ie: the BBA path should be labelled "Spain-based BBA". The chips say "Motivation letter" but the text says "CV". Fashion Design has no campus.
- dk-au: the 30 in "30–43" matches no card (the cards run 39–43). Campuses lists Foulum and Roskilde.
- Denmark: "Results 6 July" contradicts "28 July · You get an answer". The context text says "That is why this site lists…", which is meta language in the record.
- Spain: the Language lede names Navarra, which has no card. The Money lede has no figure. UB's "lift it towards 14" is not explained.
- Home: 1,806 of 1,904 cards have no Needs or Selected line, and 1,565 have no admission pill.
