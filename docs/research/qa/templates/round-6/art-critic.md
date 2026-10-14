# Art-director critique: templates, round 6

Scored fresh at both widths. Round 5 gave country 8, university 7, programme 7.

| Page | Score | One line |
|---|---|---|
| Home | **8** | Ships. The desk globe, the photo cards and the three doors make it feel like a place to go. The phone globe is crowded, and the page runs out of steam in a blank band before the footer. |
| Country | **7** | Denmark's hero and photo grid are lovely, but none of the round-5 items moved. The rail is a wall of 14 underlined links. |
| University | **7** | The sticky dates panel fills IE's empty rail and the facts date now matches the panel. The rest of the round-5 list is still open, Ashesi included. |
| Programme | **6** | Siblings are still clearly separate, so that stays solved. But on all three desktop pages the right rail draws its text over the deadlines panel, which blocks shipping. |

## Home

| Issue | Where | Fix |
|---|---|---|
| On phone the continent labels pile up: South America sits over the Africa coin and Asia sits under the 158 coin | phone-1 | Under 600px, show coins only. Show the label on tap, or nudge labels away from coins with collision offsets |
| The doors are uneven: "51 programmes" wraps to 2 lines while the other doors say "29 countries" on one | phone-1 | Use one unit on every door ("51 degrees"). Equal-height door cards with `white-space:nowrap` on the count |
| About 150px of blank band sits under the three link cards before the footer, and on phone the footer runs 1.5 screens | desktop-4, phone-7/8 | Cut the bottom padding of `.close`. On phone, set the footer to a 2-column link grid |
| Three small labels surround the globe ("Coins count universities", "How to use the globe", "Imagery: NASA") | desktop-1, phone-1 | Keep the credit. Fold the other two into a single "?" button on the zoom stack |

## Country

| Issue | Where | Fix |
|---|---|---|
| Still from round 5: Public's subtitle is underlined and Private's is not, and both groups have an identical "How applying differs" expander | es desktop-2/3, phone-2/4 | Make the subtitle a muted count only. Name each expander for its group |
| Still from round 5: institution rows are ragged (SDU, Absalon and Zealand stand taller than their neighbours) | dk desktop-2→4; es desktop-2→4 | Equal-height cards with the city/count row on `margin-top:auto`, the same as programme cards |
| The rail stacks "Go deeper" and 14 "On this page" links, all underlined rust | dk desktop-5/6, es desktop-6/7 | Drop "On this page" on desktop, since the h2s already scan. Remove the underline from rail links |
| The map's 11 name chips repeat the cards above, and the white "+ − RESET" controls don't match the home globe's brass buttons. Ghana's single Sources link still gets a full band | es desktop-5, phone-5; gh desktop-2 | Drop the chips (the coins are enough) and reuse the brass zoom buttons. Turn Ghana's source into one line in the rail |

## University

| Issue | Where | Fix |
|---|---|---|
| "Sources" is still set at display size, bigger than "What it asks" | dk-au desktop-3, phone-5; es-ie desktop-5/6 | Use the programme's small "▸ Sources (n)" row |
| On phone the deadlines still come after all 16 cards | es-ie phone-8 | Add one line under the facts: "Next: 6 Nov · Round 1 · All dates ↓" |
| Path rows are inconsistent: Humanities has an underlined "Single degree" over a plain "Dual…", and EBA's "Economics ......" ellipsis is still there | es-ie phone-6; dk-au desktop-2 | Give every path the same muted style with no underline. Fix the ellipsis join |
| Ashesi is unchanged: it opens on "Also in Ghana" and shows ACM as a card and again in the pager | gh-ashesi desktop-1/2, phone-1/2 | Add a lede and a "Degrees at Ashesi ↗" card, and keep ACM in the pager only |

## Programme

| Issue | Where | Fix |
|---|---|---|
| **Text collides in the rail.** `.layout-aside__side` is sticky (`top:5.5rem`) in grid row 2, so it rides up over the non-sticky `.dates-panel` in row 1 | dk-au-cs desktop-2/3; ie-bba desktop-2/3; ub desktop-2 | `.layout-aside--dates > .layout-aside__side { position: static; max-height: none; }`, or wrap the panel and the side in one sticky column |
| h2 sizes still jump: "What you need" and "Taught on two campuses" are display size, while "What it is" and "How places are decided" are about half that | all three, desktop + phone | One h2 size for every main-column section |
| "Taught on two campuses" still sits flush against the paragraph above it | ie-bba phone-2, desktop-2 | Give every main-column h2 the same top margin (`margin-top: var(--s7)`) |
| UB's h1 is still the raw official name, "Grado (Spanish bachelor's degree)" takes 3 lines in the facts, and the breadcrumb wraps onto a line that starts with "/" | ub desktop-1, phone-1/2 | Make the h1 "English Studies" and the facts cell "Grado". Truncate the last crumb |
