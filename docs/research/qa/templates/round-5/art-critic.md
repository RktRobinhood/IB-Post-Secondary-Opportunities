# Art-director critique: templates, round 5

Scored fresh at both widths. Round 4 gave country 8, university 7, programme 8.

| Template | Score | One line |
|---|---|---|
| Country | **8** | Ships. The hero stat now matches the deadlines, the lone expanders are folded, and Ghana's table of contents is gone. Spain's group headers are still unfixed. |
| University | **7** | AU looks good. IE's layout has a 3,000px hole, and four round-4 items are still open, Ashesi included. |
| Programme | **7** | Siblings stay clearly separate at both widths: a rust rule, a darker ground, and "Other degrees at X". It drops a point for a heading collision and uneven h2 sizes. |

## Country

| Issue | Where | Fix |
|---|---|---|
| The group subtitle repeats the heading. Public's subtitle is still underlined like a link and Private's is not. Both groups have an identical "How applying differs" expander | es desktop-2/3, phone-2/4 | Make the subtitle muted text with the count only ("6 institutions"). Label each expander for its group |
| The institution grid has ragged rows, with cards in the same row ending at different heights | denmark desktop-2/3/4; es desktop-2/3 | Make the cards equal height and pin the city/count row to the foot (`margin-top:auto`) |
| Ghana gives one source link a full band with an h2. The card rule floats under the title with nothing above it | gh desktop-2, phone-1/2 | Turn the source into one muted line in the rail. Drop the card divider when there is no blurb |

## University

| Issue | Where | Fix |
|---|---|---|
| IE puts 16 cards in 2 columns beside an empty rail for about 3,000px. On phone the deadlines panel still comes after all 16 cards | es-ie desktop-3→5, phone-8 | Once the rail ends, run the grid 3-up at full width. On phone, add a one-line "Next: 6 Nov · Round 1 · All dates ↓" under the facts |
| The facts strip says "Next deadline 5 Mar 2027", but the panel starts at 6 Nov 2026. "Sources" is set at display size, bigger than the section above it | es-ie desktop-1 vs -2; dk-au desktop-3; es-ie desktop-5 | Take the strip date from the same sorted list, or show "5 March · Round 1 by 6 Nov" as the programme page does. Use the programme's "▸ Sources (n)" row |
| Card anatomy is still uneven. EBA's "Needs" line ends in "Economics ......". Path rows mix underlined and plain text. Ashesi is unchanged: it opens on "Also in Ghana" and shows ACM twice | dk-au desktop-2, phone-2; es-ie desktop-3, phone-6; gh-ashesi desktop-1/2, phone-1 | Fix the ellipsis join. Give non-link paths a muted style with no underline. For Ashesi, add a hero lede and a "Degrees at Ashesi ↗" card, and keep ACM in the pager only |

## Programme

| Issue | Where | Fix |
|---|---|---|
| "Taught on two campuses" sits flush against the paragraph above it, so the two read as one block | ie-bba desktop-2, phone-2 | Give every main-column h2 the same top margin |
| h2 sizes jump: "What you need" and "Taught on two campuses" are display size, while "What it is" and "How places are decided" are about half that | dk-au-cs desktop-1/2; ie-bba desktop-2; ub desktop-2 | Use one h2 size for all sections |
| UB's h1 is still the raw official name. "Grado (Spanish bachelor's degree)" takes 3 lines in the phone facts. The breadcrumb wraps onto a line that starts with "/" | ub desktop-1, phone-1/2 | Use "English Studies" as the h1. The facts cell should read "Grado". Truncate the last breadcrumb |

Also noted: IE BBA's pager says "Next: Global BBA", but Global BBA is one of this degree's paths, so it reads as a sibling. On phone, the CS "What it is" runs to 9 lines; clamp it to 2 lines with a "More" link.
