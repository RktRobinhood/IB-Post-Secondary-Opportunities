# Content critic, round 14 (admissions-counsellor view)

| Template | Score | One line |
|---|---|---|
| Home | 8 (+1) | The round-13 headline is fixed. AU CS, DS and ITPD now say "Maths HL", CBS shows "Any Maths · one of …", "one of any Maths" is lower-case, and SDU's "31+" is gone. One quota figure is still left. |
| Country | 8 (=) | No template defects. Rich (Denmark, Spain) and sparse (Ghana) pages both read cleanly. |
| University | 8 (+1) | AU degree cards carry their subjects. On a phone the Econ line wraps in full with "+1 more" visible, and deadlines sit after the degrees. |
| Programme | 8 (=) | On a phone, Apply by and the 43-point cut-off now come first, with the rest under "More facts". "Keep exploring" is still thin for a school with one programme. |

## Home
| Issue | Where | Concrete fix |
|---|---|---|
| A quota-1 average still reads as a minimum: "Needs … 28+ IB points" on AU Econ, the one Danish card with no cut-off pill. | `requirementSummary`, `pointFigures` | Never put a `minimum-average` "Quota 1" unit on a card, whatever the pill says. The programme page already shows it as "Quota 1 … Under 28? Quota 2". |
| An ungraded "Any Maths" takes card space but says nothing on a Diploma-only card, because every Diploma holder takes Maths. It pushes real items into "+N" (CBS ×6, AU Econ). | `needsUnits`/rarity | Treat a Maths unit with no grade and no level like English (near-universal) unless the card's prefix says Course Results are accepted. |
| A compound alternative inside a one-of list reads as nonsense: "one of History, Global Politics SL with Economics or 1 other" (AU Cognitive Science). | one-of card unit | Name only single-subject alternatives on the card ("one of History or 3 others"). Compounds stay on the programme page. |

## Country
No template defects.

## University
| Issue | Where | Concrete fix |
|---|---|---|
| A school with no programmes still offers only "Universities in Ghana" as its next step. | Ashesi | Add a "Degrees like these" link to Home, filtered to the country, or the school's own programme list when its URL is known. |
| "28+ IB points" on the Econ card. | dk-au | Home row 1. |

## Programme
| Issue | Where | Concrete fix |
|---|---|---|
| A school with one programme still gets "Keep exploring" with only the university and Spain. | UB English Studies | Add up to 3 "Similar degrees elsewhere" cards from the same field and country. |
| The sibling picker ignores the subject field. CS shows CogSci, DS and Econ, and leaves out IT Product Development. The sibling cards also drop the Needs line that the AU page shows for the same degrees. | `programme.mjs` `siblings` | Sort siblings by same field first. Keep the one-line Needs on sibling cards, as the school page does. |

## Data backlog
- Only 65 of 1,904 cards have a Needs line. Most school records carry the IB rule as prose.
- Ashesi and ACM have no blurb, photo, official URL or programmes.
- dk-au: no degree matches the 30 in "30–43" (the lowest cut-off is 39). Campuses lists Foulum and Roskilde. Econ has no 2026 cut-off.
- IE BBA: the chips say "Motivation letter" but the text says "CV". IE Design and Fashion Design have no city.
- Spain: the Language lede names Navarra, which has no card. UB's "towards 14" is unexplained.
- Denmark: "Results come out on 6 July" contradicts "28 July · You get an answer".
