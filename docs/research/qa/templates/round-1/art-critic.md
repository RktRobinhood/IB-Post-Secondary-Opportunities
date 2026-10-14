# Art-director critique: templates, round 1

Judged from the round-1 slices at desktop and phone widths, scored fresh. Round 0 gave country 6, university 6, programme 5.

| Template | Score | One line |
|---|---|---|
| Country | **6** | Denmark and Spain look like places you would want to go. Ghana is still mostly empty: a blank globe zone about one screen tall with a single "2" pin. |
| University | **7** | AU and IE are strong. Ashesi now looks deliberate rather than broken, but the programme cards are uneven inside. |
| Programme | **7** | **The owner's complaint is solved.** The full-bleed tinted band, "END OF COMPUTER SCIENCE" and "Other degrees at AU" read clearly as a way out of the page on both widths. Some fixes did not reach every page, and the sparse page has no ending. |

## Programme

| Issue | Where | Fix |
|---|---|---|
| The "X on 2 campuses" title repeat is still live: "Business Administration on 2 campuses" sits under the h1 "Business Administration". The fix is in `lib/paths.mjs:580` but this page renders through `src/pages/school-programme.mjs:306` | ie-bba desktop-1/2, phone-2 | Delete the h2 builder in `school-programme.mjs` and call the `paths.mjs` one, so there is one renderer (this is also the one-template rule). Also fix the lede "at the Segovia or Madrid campus and the Madrid, Singapore, Dubai; year 4… campus", which reads as nonsense. |
| The sources label differs between pages. DK shows a boxed accordion, "Where this comes from (2 sources)", from `primitives.mjs:609`. IE and UB show a quiet "Sources for this programme: 2 official pages" | dk-au-cs desktop-3, phone-3 vs ie-bba desktop-3 | Route the DK programme page through the `programme.mjs` `sources-foot`. Use one label and one style. |
| The sparse page just stops. There is no "End of…" and no sibling band, so after "What it is" there is ~180px of blank cream before the footer | ub-english desktop-2, phone-4 | Always render the end band. With 0 siblings, show "Not this programme" plus one link card ("All English-taught degrees at UB →" / "Other programmes in Spain"). |
| The "Worth knowing" box at the top of English Studies is about *other* programmes (Business Administration, Biomedical Engineering): a university note placed in the programme's own space | ub-english desktop-1, phone-1 | Show programme-level notes only above the breadcrumb. Move university-scope notes to the university page, or filter out notes that name another programme. |
| The pager sits inside the tinted band, its cards are the same tint and nearly invisible, and a ~95px strip of bare cream sits between the band and the footer | ie-bba desktop-4; dk-au-cs phone-6 | Close the band before the pager, or give pager cards a `--paper` fill and border. Cut the bottom margin so the band runs straight into the footer. |

Also: the 4th facts cell on the second row is empty (dk-au-cs desktop-1); "Check it on bachelor.au.dk" on phone repeats the "The official page" button lower down; path rows in sibling cards still end mid-word with "…" (desktop-3).

## University

| Issue | Where | Fix |
|---|---|---|
| Cards stretch to row height, so light cards have a 40–90px dead gap between the title and the meta row, and meta rows sit at different heights | dk-au desktop-2 (CS, Data Sci, IT PD); es-ie desktop-2 (Behavior, Communication) | In the card grid, set `align-items:start`. Inside the card, use title → meta → paths → topic with fixed gaps and pin only the topic line to the bottom. |
| Card titles sit on the photo's fade, so the type sits on muddy imagery | dk-au desktop-2, phone-2 | Put the title on solid paper below a fixed-height image. Drop the fade overlap. |
| Ashesi: the dashed "Its degrees are not listed here yet." box reads as a drop-zone placeholder, and the deadlines panel says "check its admissions page" with no link to it | gh-ashesi desktop-1, phone-1/2 | Use a solid tinted box with a button, "See Ashesi's degrees ↗", to the official site. Put the same link in the deadline line. Make that the dark primary button instead of "Other schools in Ghana". |
| Path rows are truncated at ~12px ("BBA + Bachelor in Inte…") | es-ie desktop-2/5 | Show the label only ("Dual with Economics"), with no trailing descriptor. Use 13px or larger and at most 2 rows plus "+2 more". |
| 5 cards in a 2-up grid leave an orphan card and half a row of empty space | dk-au desktop-3; es-ie desktop-5 | When the count is odd, span the last card across both columns with a horizontal layout. |

## Country

| Issue | Where | Fix |
|---|---|---|
| A sparse country still spends about one screen on a globe zone with two pins, plus zoom buttons floating in empty space | gh desktop-2/3, phone-2 | With 3 or fewer institutions, don't render the globe section. Keep the pill row and let the cards lead. |
| The band labels ("IS IT FOR YOU?", "GETTING IN") are 11px eyebrows under a hairline, smaller than every topic h3, so the three groups barely register | denmark desktop-4/6, phone-7 | Make band labels larger than the topics: a ~1.5rem serif band title, `--s9` space above, and a tint shift or full-width rule per band. Drop the topic h3s one step. |
| Ghana's "IS IT FOR YOU?" band holds only "Outline only. Check dates and fees…", which answers nothing | gh desktop-3 | With 1 or fewer real topics, drop the band labels. Fold the outline line into the "Ask each university about" chip row. |
| Ashesi's monogram "AU" still clashes with Aarhus's "AU" | gh desktop-2, phone-2 | Monograms come from the full name (e.g. "ASH"), or show the name itself as the type. |
| The eyebrow has a stray gap before the separator: "NORDICS  · MAY…", "WEST AFRICA  · MAY…" | denmark desktop-1; gh desktop-1 | The region and the session sit in separate spans with a leading " · ". Join all the parts in one array with `.filter(Boolean).join(' · ')`. |

On the plus side: the contour panels for missing photos look designed, not missing, and Denmark and Spain on phone (image-left cards) read well.
