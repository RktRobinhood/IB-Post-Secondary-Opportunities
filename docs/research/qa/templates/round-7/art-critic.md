# Art-director critique: templates, round 7

Round 6 scores were home 8, country 7, university 7, programme 6. Since then, these were fixed: the programme rail no longer collides, programme h2s are one size, UB's h1 and facts cell, small Sources rows, unified rail links, equal-height country cards, map chips removed, phone footer in 2 columns, and the next deadline now shows in the phone facts.

| Page | Score | One line |
|---|---|---|
| Home | **8** | Ships. The sticky desk globe beside the cards is the best layout yet. The phone globe labels still collide. |
| Country | **7** | Denmark is lovely. Spain's group headers still repeat themselves and its map controls don't match the globe. Ghana's Sources still gets a full band. |
| University | **7** | AU and IE read well. Ashesi has not changed in three rounds. |
| Programme | **7** | The rail is fixed and the type scale is calm. But Global BBA shows as a path in the table and again as the "Next" sibling. |

## Home
| Issue | Where | Fix |
|---|---|---|
| "South America" covers the 11 coin and "Oceania" crowds the 27 coin | phone-1 | Under 600px, hide labels until a coin is tapped (or offset labels away from coins) |
| The doors wrap to two lines ("278 / universities") | phone-1 | `white-space:nowrap` on the count, or shorten it to "278 unis" |
| One slot holds three kinds of pill: green "Open entry / Diploma or Course Results", amber "Last year", grey "Full Diploma" | desktop-1→8, phone-2→8 | Give every card pill one neutral style. Keep colour only for the points pill |
| Two captions sit under the globe and the country map captions them differently ("Coins count universities" vs "Bigger light, more opportunities") | desktop-1, phone-1; es desktop-5 | Use one legend string everywhere, or fold both captions into a "?" on the zoom stack |

## Country
| Issue | Where | Fix |
|---|---|---|
| The Public h3 already says "UNEDasiss, then preinscripción". Its underlined rust subtitle repeats it, while Private's subtitle has no underline | es desktop-2/3 | Subtitle becomes a muted count only ("6 institutions"), with no underline |
| Both groups have an expander named "How applying differs" | es desktop-2/3, phone-4 | Name each one for its group ("Applying to a public university") |
| The map buttons are white "+ − RESET", unlike the home globe's brass buttons | es phone-5 | Reuse the home zoom-stack component |
| Ghana's single source gets a display-size "Sources" heading in its own band | gh desktop-2, phone-2 | Use the small "▸ Sources (1)" row that university pages use |

## University
| Issue | Where | Fix |
|---|---|---|
| Ashesi still opens on "Also in Ghana" and shows ACM twice (card + pager). It has no lede and no official-page button | gh-ashesi desktop-1/2, phone-1/2 | Add a lede line and a "Degrees at Ashesi ↗" card. Keep ACM in the pager only |
| Campuses are shown as path rows ("Aarhus / Herning", "Segovia or Madrid"), and every path is underlined, so cards look busy | dk-au desktop-2; es-ie desktop-2/4 | Keep campuses in the facts line only. Show paths as plain muted text that underlines on hover |
| EBA's "Needs" line is cut off with "…" | dk-au desktop-2, phone-2 | Use "Needs Any IB Maths +1 more" like the home cards |
| 16 IE cards in one run, with pink fallback stripes stacked together | es-ie desktop-4/5, phone-7 | Show 6 cards per field and then "Show all N" (template-references #2). Use muted fallback hues |

## Programme
| Issue | Where | Fix |
|---|---|---|
| Global BBA is a row in "Taught on two campuses" and also the "Next" sibling. Its first path row repeats "Segovia or Madrid" in both columns | ie-bba desktop-2/3 | Drop programmes that are paths of this one from the pager. Hide the Path column when it repeats Campus |
| Sibling cards have uneven heights, and three cards sit in a four-column grid with a hole | dk-au-cs desktop-3; ie-bba desktop-3 | Equal-height cards. With 3 or fewer, use `repeat(auto-fit,minmax(16rem,1fr))` |
| "More at UB" has two plain text cards; "Every degree here" on a one-programme school | ub desktop-3 | Show the UB photo card, or drop the band and keep the breadcrumb |
| Meta copy: "Every IB applicant at …", a 3-line caption under the official button, and "Provisional dates repeat last year's…" | ie-bba desktop-2; ub desktop-2; cs desktop-2 | Remove the box label. Shorten the caption to "On ie.edu". Show "provisional" once, in the panel |

Compared with the reference sites, we still lack a sticky section nav (#7). The phone facts strip runs to about one screen (cs phone-1, ub phone-1, 7–8 cells). Fix it with a two-tier layout: 4 big facts, then small caps for the rest (UCL, #4).
