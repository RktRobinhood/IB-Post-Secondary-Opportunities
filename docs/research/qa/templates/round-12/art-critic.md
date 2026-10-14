# Art-director critique: templates, round 12

**Fixed since round 11:**
- The card facts now sit at the same height across each row: home 264/264 and 714/714, AU 297/297 and 693/693. The foot rules line up too.
- The dead gap in the middle of sparse cards has moved down, so it now sits above the foot rule.
- The Accra card without a blurb is compact.
- "Spain-based BBA" now breaks over 2 lines, down from 3.
- The white strip above the DK footer has shrunk from about 95px to about 30px.

**Regressions:** none.

| Page | Score | One line |
|---|---|---|
| Home | **8** | Ships. The facts line up, and the cards scan cleanly at both widths. |
| Country | **8** | Ships. Feet line up within each row. The sparse Ghana page still has loose padding. |
| University | **8** | Ships. The alignment is fixed. Multi-campus cards break the pattern. |
| Programme | **8** | Ships. The one meta line from round 11 is still there. |

## Home
| Issue | Where | Fix |
|---|---|---|
| The Europe door's subline is clipped mid-phrase at "278 universities beyond" | phone-1 | Shorten it to "278 universities", or let the door card grow to fit |
| Cards with only a facts line leave about 150px of air above the foot | desktop-8 (Business Admin & Sociology) | Accept it, since it was settled under #67. Optionally lower the card's minimum height so the slack is capped at about 80px |

## Country
| Issue | Where | Fix |
|---|---|---|
| There are about 80px of empty space between the last card row and the Sources band, and the band has about 100px of top padding with only one row in it | gh desktop-2, phone-2 | Size the band's padding to its content, using one spacing token above and below |
| The leftover cream strip between the Sources band and the footer | dk desktop-8 | Remove the trailing section margin when the footer follows directly |

## University
| Issue | Where | Fix |
|---|---|---|
| Multi-campus cards drop the city from the facts line and add a stacked "Aarhus / Herning" block with its own rule. That makes them the only cards with two rules | dk-au desktop-2, phone-2; cs desktop-3 | Put the cities inline: "BSc · 3 yrs · Aarhus, Herning", or "2 campuses" |
| On phone the "Needs" line is cut with an ellipsis mid-word ("28+ IB point…"), and the "+1 more" is lost | dk-au phone-2 | Use the home card's clamp, which ends on a whole item followed by "+N more" |
| Ashesi's two fact cells stack one above the other on phone, while the programme pages show them 2-up | ashesi phone-1 | Use the same 2-up grid on phone |

## Programme
| Issue | Where | Fix |
|---|---|---|
| "How these requirements read in IB terms →" is still there. It is meta, and this is the second round it has been flagged | cs desktop-2, phone-2 | Delete it. The "Check my subjects against it" button does the job |
| Sources looks different on each level: a small "▸ Sources (2)" disclosure on programme pages, a full "Sources +" row on university and country pages | ie-bba desktop-2; ub desktop-2 vs es-ie desktop-4 | Use the expander row everywhere |
| The sibling band repeats the multi-campus card break | cs desktop-3 (Econ & BA) | Same fix as the university multi-campus cards |
