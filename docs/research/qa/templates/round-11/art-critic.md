# Art-director critique: templates, round 11

Fixed since round 10: blurbs now end at a word, not mid-word. The "+1" campus duplicate is gone. Phone programme facts show 4 cells, then "More facts", so the section bar now sits in the first screen. "What it is" no longer repeats the subtitle. Quota 2 is folded into an expander. UB's band is called "Keep exploring" and its cards have sublines. Ashesi's facts cells are equal width. The home pill now reads "Diploma or courses", and long footers truncate.

| Page | Score | One line |
|---|---|---|
| Home | **8** | Ships. The cards have a large empty gap, and the facts lines still sit at different heights. |
| Country | **8** | Ships. All the blurbs are clean. An empty band remains above the footer. |
| University | **8** | Ships. The campus duplicate is gone. The facts lines still drift between cards in a row. |
| Programme | **8** | Ships. The phone's first screen is fixed. A few small leftovers remain. |

## Home
| Issue | Where | Fix |
|---|---|---|
| The facts block is pinned to the foot, so a taller "Needs" block lifts its first line 10–40px above its neighbour's (Creative Tech 333 vs Global Humanities 312) | desktop-1/3/8 | Fix the facts' first line at one offset under a two-line title box. Let "Needs" grow downward into the spacer, and keep the footer rule pinned |
| A dead gap of 100–120px between the title and the facts on short cards | desktop-1/3/8 | The same fix closes it. Sparse cards end up with the space at the bottom, not in the middle |

## Country
| Issue | Where | Fix |
|---|---|---|
| A blank band of about 95px between the last section and the footer. A white strip follows the stats band | dk desktop-1/8; ashesi desktop-2 | Remove the spacer section above the footer, or collapse it when empty. It is site-wide |
| Ghana's Sources band still has about 90px of empty space above it on phone | gh phone-2 | Size the band's top padding to its content |
| The Accra card has no blurb, so its rule floats beneath an empty body | gh phone-2 | When there is no blurb, drop the rule or let the footer move up |

## University
| Issue | Where | Fix |
|---|---|---|
| The facts lines drift within a row (Econ 297 vs CS 340; IR 685 vs Political Science 704) | dk-au desktop-2; es-ie desktop-2 | Use the home fix above, since it is the same card |
| Sparse cards still leave about 90px of air under the title | dk-au desktop-2 (Data Science, IT Product) | Same fix |

## Programme
| Issue | Where | Fix |
|---|---|---|
| "How these requirements read in IB terms →" is still meta | cs desktop-2, phone-2 | Delete it. "Check my subjects against it" does the job |
| The band is "Other degrees at AU" on one page and "Keep exploring" on another, and its cards drift like the university cards | cs desktop-3; ub desktop-2 | Pick one label. Apply the card fix |
| The paths table's first column is squeezed: "Spain-based BBA" breaks over 3 lines | ie-bba desktop-2 | Give the first column a min-width of about 9rem, or nowrap |
