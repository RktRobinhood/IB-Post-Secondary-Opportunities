# Art-director critique: templates, round 10

Fixed since round 9: home cards now wrap the city instead of clipping it. Spain's groups are now "Public universities" and "Private universities". The deadline panel's heading clears the section bar. There is one "Official page" button. The phone bar fades at its edge. Ashesi's empty study band is gone. The programme pager is gone. The gap above the breadcrumb is halved. "More at UB" cards have backdrops.

| Page | Score | One line |
|---|---|---|
| Home | **8** | Ships. Within a row, the facts lines sit at different heights. |
| Country | **7** | Blurbs are still cut mid-word, and an empty band sits above the footer. |
| University | **7** | The cards repeat campuses twice, and the facts lines drift between cards. |
| Programme | **7** | On phone the facts grid still fills the first screen, and meta captions remain. |

## Home
| Issue | Where | Fix |
|---|---|---|
| A one-line title drops the facts line 15–25px higher than its two-line neighbour, so rows don't line up | desktop-1/3/5 | Give the title block a two-line min-height on desktop |
| Long names stack the footer onto two lines ("Breda University of Applied Sciences / Netherlands") | desktop-2/3/5 | Let the country truncate or sit after a "·" on the same line |
| The "Diploma or Course Results" pill is still jargon on a photo | desktop-1/3, phone-2 | Use "Diploma or courses" |

## Country
| Issue | Where | Fix |
|---|---|---|
| Blurbs cut mid-word: "Esbjerg an…", "taught, an…", "you can ta…", "route a…", "bachelor's a…" | dk desktop-3; es desktop-2/3, phone-4 | Trim at a word or clause boundary at build time. **This is the step to 8** |
| An empty cream band of about 95px sits between the content and the footer, and a white strip follows the stats | dk desktop-1/7/8 | Remove the spacer section, or give it no height when it is empty |
| On phone, Ghana's Sources row has about 100px of empty space above it | gh phone-2 | Size the band to its content |

## University
| Issue | Where | Fix |
|---|---|---|
| "Aarhus +1" sits over "Aarhus / Herning" rows, and "Segovia or Madrid +1" over "Segovia or Madrid / Global BBA". The same place is said twice | dk-au desktop-2, phone-2; es-ie desktop-2; cs desktop-3 | When campus rows show, drop the "+1", or drop the rows. **Step to 8** |
| On sparse cards the facts float about 60px under the title, and the facts lines don't line up across a row (IR 688 vs Political Science 706) | dk-au desktop-2; es-ie desktop-2 | Use the same title min-height as on home, so the facts sit at one height |
| Gap of about 85px between the section bar and the breadcrumb. Ashesi's second facts cell stretches to 900px | dk-au desktop-1; ashesi desktop-1 | Halve the gap, as on the programme page. Make cells equal width when there are fewer than four |

## Programme
| Issue | Where | Fix |
|---|---|---|
| On phone, the hero and 7–8 facts cells fill the first screen, and the section bar only shows at the bottom edge | cs phone-1; ub phone-1 | Show 4 cells and put the rest behind "More facts". **Step to 8** |
| Meta captions remain: "▶ Below this: quota 2", "Danish requirement: …" under every box, "How these requirements read in IB terms →" | cs desktop-2, phone-2 | Show the Danish line only on expand. Fold the quota 2 note into the expander. Delete the IB-terms line |
| "What it is" opens with the hero subtitle word for word. UB's bar still says "More". "More at UB" holds a "Spain" card, and the UB card has no subline | cs desktop-1; ub desktop-2/3 | Start the body after the subtitle. Name the band "Keep exploring" in both places. Give both cards a subline |
