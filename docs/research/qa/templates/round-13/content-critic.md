# Content critic, round 13 (admissions-counsellor view)

| Template | Score | One line |
|---|---|---|
| Home | 7 (=) | The door now wraps on a phone ("278 universities"), "(SL or HL)" and "Any IB Maths" are gone, and most subjects follow one pattern. AU CS (43) and DS (42) still have no Needs line. |
| Country | 8 (=) | Both round-12 items landed. Ghana cards read "Teaches in English · recognises the IB Diploma", and Denmark says "Both observations". |
| University | 7 (−1) | Re-scored. No round-12 item landed, and the defect that holds Home at 7 shows here on the school's own degree list. |
| Programme | 8 (=) | No round-12 item landed. The rest is still strong: full requirement wording, Danish lines, Quota 2 one tap down. |

## Home (to reach 8: rows 1 and 2)
| Issue | Where | Concrete fix |
|---|---|---|
| A card with a cut-off pill can lose its whole Needs line. AU CS, DS, ITPD and Cognitive Science, and CBS, show no Diploma and no Maths HL. | `requirementSummary`, `pointFigures:false` path | Strip only the points figure from a unit, never the subject inside it ("a 5 in Maths HL" stays). Always print the award prefix. Add a guard: a programme with a required subject has it on the card or counted in "+N". |
| A quota-1 threshold reads as a minimum. "Needs … 28+ IB points" (AU Econ), and "Open entry" next to "Full Diploma · 31+ IB points" (SDU Electronics, Mechatronics, Mechanical). | card req line, Danish quota units | Label it "Quota 1: 31+", or leave it off the card. Below that figure, quota 2 is still open. |
| Two stray forms remain: "one of Any Maths, Economics…" and "Maths HL, or Maths SL 5+". | `cardForm` | Lower-case "any Maths" inside lists, and write "Maths SL 5+ or any Maths HL". |

## Country
No template defects. Rich (Denmark, Spain) and sparse (Ghana) both read cleanly.

(Home, minor: on a phone the door says "278 universities", but the Europe coin says 292. "278 more" would match the desktop meaning.)

## University (to reach 8: rows 1 and 2)
| Issue | Where | Concrete fix |
|---|---|---|
| CS and DS cards have no Maths HL. | dk-au | Home row 1. |
| On a phone the Econ line is cut at "28+ IB point…", which hides "+1 more". | card req line clamp | Clamp the items and always keep "+N more" visible. Home row 2 also removes "28+". |
| With no programmes, the only next step is "Universities in Ghana". | Ashesi | Add "Similar degrees" linking to Home, filtered to the country. |

## Programme
| Issue | Where | Concrete fix |
|---|---|---|
| On a phone, Apply by and the 43-point cut-off sit under "More facts", while "Taught in: English" is shown. | fact grid, phone | Show Apply by, Cut-off/Admission, Fee and Where first. Fold Degree, Length and Taught in. |
| A school with one programme gets "Keep exploring" with only the university and the country. | UB | Add "Similar degrees elsewhere", taken from the degree's family. |
| The "Other degrees at AU" cards repeat the missing Needs line. | AU CS | Home row 1 fixes it. |

## Data backlog
- Ashesi and ACM have no blurb, photo, URL or programmes.
- dk-au: no degree matches the 30 in "30–43". Campuses lists Foulum and Roskilde.
- IE BBA: the chips say "Motivation letter" but the text says "CV". Design and Fashion Design have no city.
- Spain: the Language lede names Navarra, which has no card. UB's "towards 14" is unexplained.
- Denmark: "Results 6 July" contradicts "28 July · You get an answer".
- Home: only 41 of 1,904 cards have a Needs line, and 308 have a pill.
