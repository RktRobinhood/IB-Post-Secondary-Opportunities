# Art-director critique: templates, round 9

Fixed since round 8: city-only places on home cards, Spain's subtitle and "How to apply" expander, "provisional" now said once with an asterisk, programme eyebrow cut to institution and country, the "no minimum grade" line gone, sibling bands now clearly separate from the programme.

| Page | Score | One line |
|---|---|---|
| Home | **8** | Ships. Desktop cards still drop the city on long degree types. |
| Country | **7** | Denmark is lovely. Blurbs are still cut mid-word, and Spain's group headings use jargon. |
| University | **7** | The new section bar tucks the side panel's heading under itself, and on phone it cuts off a label. |
| Programme | **7** | Calmer, but the hero still repeats the facts strip and the closing blocks repeat each other. |

## Home
| Issue | Where | Fix |
|---|---|---|
| "Professional bachelor · 3½ yrs" and "· 3¼ yrs" drop the city on desktop, while phone shows "Horsens" | desktop-1, desktop-8 | Shorten the long types ("Prof. bachelor", "AP degree") or let the line wrap. Never clip the place |
| Sparse cards leave a gap of about 90px between title and facts, so the facts float mid-card | desktop-1/3/8 | Keep equal height, but put the slack above the foot rule, not between title and facts |
| The "Diploma or Course Results" pill is jargon on a photo | desktop-1/3/8, phone-2 | Use a short plain label ("Diploma or courses"), or drop that pill |

## Country
| Issue | Where | Fix |
|---|---|---|
| Blurbs are cut mid-word or mid-clause ("Esbjerg an…", "route a…", "ta…") | dk desktop-3; es desktop-2/3, phone-4 | Trim at a word or clause boundary at build time |
| Group headings read as process notes ("— UNEDasiss, then preinscripción", "— direct"). "How you apply depends on the kind of institution." is meta | es desktop-2/3 | Make the h3s "Public universities" and "Private universities". Delete the lede. The expander already holds the route |
| Ghana's single Sources row still floats in a tall band (~210px desktop, ~90px of top padding on phone) | gh desktop-2, phone-2 | Size the band to its content when there is no prose |

## University
| Issue | Where | Fix |
|---|---|---|
| The sticky deadline panel slides under the section bar, which clips the "Deadlines" heading | dk-au desktop-2; es-ie desktop-2 | Set the aside's sticky `top` to the masthead height plus the bar height |
| On phone the bar cuts "What it as" against the button, with no sign that it scrolls. Two dark "Official page" buttons show at once on desktop | dk-au phone-1/2, desktop-3 | Fade the right edge of the scrolling links, or shorten the button to "Official ↗". Drop the aside button while the bar shows it |
| EBA "2 campuses" sits over the "Aarhus / Herning" rows. BBA does the same with "Segovia or Madrid / Global BBA". Ashesi's breadcrumb still sits alone in a 200px band | dk-au desktop-2; es-ie desktop-2; ashesi desktop-1, phone-1 | Put the campuses in the facts line and drop the rows. Collapse the empty study band |

## Programme
| Issue | Where | Fix |
|---|---|---|
| "A three-year degree in Aarhus." repeats the facts strip. On phone, the hero and 8 fact cells fill more than a screen before the section bar appears | cs desktop-1; ub phone-1 | Cut a subtitle that only restates facts. Show 4 cells on phone and put the rest behind "More facts" |
| The pager's "Next: International Relations" repeats the first sibling card. "More at UB" is still two bare text cards, and the bar says "More" | ie-bba desktop-3; ub desktop-3 | Drop the pager when siblings show. Give the cards the backdrop, and use "More at UB" in the bar too |
| Meta captions remain: "not a prediction", "Danish requirement: …" under every box, "▶ Below this", "How these requirements read in IB terms →". There is also an empty ~90px gap between the section bar and the breadcrumb | cs desktop-1/2, phone-2; ub desktop-1 | Delete "not a prediction" and "Below this". Show the Danish line only on expand. Halve the gap above the breadcrumb |
