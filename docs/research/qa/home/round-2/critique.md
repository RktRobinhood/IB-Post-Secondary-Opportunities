# Home discovery page: art director, round 2 (issue #44)

**Score: 7 / 10.** Round 1 scored 6. It is better, but not ready for students.

I checked the local build at http://localhost:4350/ on 2026-09-26, at 1280×800 and 390×844 (2×), in light and dark mode. The scripts are `tools/shoot.mjs`, `tools/probe.mjs` and `tools/probe2.mjs`. The measured state is in `notes-home.json` and `notes-probe.json`.

## Why 7

**What is fixed:**
- The cards are short now: 292–315 px, one line of Needs, and one tag on the photo.
- The first 12 cards have 12 different titles.
- **Worldwide** turns the globe and shows the 10 country photo tiles. They are the best-looking thing on the page.
- On a phone, the pill puts the count at y=88 and the first card at y=156.
- "medicine" now offers the medicine guide.
- "Show all 67 cards (73 degrees)" hides itself once opened.
- Back undoes a door.
- Dark mode is strong.

**What stops it at 7:**
- **The first screen has no photographs.** At 1280×800 you see a cream form (Search, Subject area, Where, five chips) beside an illustrated globe. The first photo starts at y≈960. The form reads as admin, not as a place.
- **The Europe door is really the Netherlands door.** It shows 16 Dutch cards. The 24 European countries we researched (Germany, the UK, France and others) appear only as globe labels, because the tiles show only when no card matches.
- **Ordinary subjects still hit a dead end.** "psychology" and "law" give "No degree here matches all of those yet." (that is one filter, not "all of those"). The only way out is "Without …".
- **The globe numbers speak a different unit from the doors.** The bubble over Denmark reads 40 on desktop and 42 on a phone, while the door says 57 degrees. After Nearby, the bubbles read 18/8/3/4 against "16 degrees". The legend says "Larger means more opportunities".
- **Text walls under the globe.** On a phone, four grey instruction paragraphs sit between the globe and the results.

## The three changes that would raise it most

1. **Put photographs on the first screen.** In `src/pages/discover.mjs` and `.discover__hero`/`.discover__filters` in `site.css`:
   - Fold the filter panel into a single row: search, one "Filters" button (the phone pattern at every width), and the chips inside the sheet.
   - That frees the left column for a strip of three photo cards under the doors, or lets the first card row rise above the fold.
   - Fixed means: at 1280×800 and 390×844, at least one photograph is visible before any scroll.
2. **Every door and every ordinary word lands on places.** In `discover.js` (`placesInstead`, `renderWays`):
   - Show the tiles for the door's scope *after* its cards, not only when there are none. Nearby then ends with "24 more European countries researched" and their photos.
   - For a word with no match, offer the nearest fields as chips. "psychology" should lead to Cognitive Science and Social sciences; "law" to International Business and Politics and European Studies. Also show the country tiles.
   - Change the empty line to "Nothing on the map for "law" yet."
3. **One unit on the globe, and a one-line legend.** In `discover.js` (the `LIGHTS` counts) and `.world__legend`:
   - Bubbles count degrees, the same unit as the doors, so the Denmark bubble reads 57. Remove the faint rim bubbles.
   - Replace the four legend paragraphs with one line, "Bigger light, more degrees", and put the rest behind "How to use the globe".

## Bugs

| # | Bug | Screenshot |
|---|---|---|
| 1 | The phone pill covers the eyebrow ("MAY 2027 I… 7 ENTRY") and wraps to two lines on Worldwide. | `bug-phone-pill-covers-eyebrow.jpg`, `phone-light-03-door-far.jpg` |
| 2 | The Nearby door shows Dutch cards only. The researched European countries never appear as tiles. | `desk-light-04-door-nearby-results.jpg` |
| 3 | "psychology" and "law" give "No degrees" with no hand-off. The wording "all of those" is wrong for one term. | `notes-home.json` → `q-psychology`, `q-law`; `desk-light-06-medicine-results.jpg` (the same layout) |
| 4 | The globe bubbles count places (40 on desktop, 42 on a phone), while the doors count degrees (57). After Nearby they read 18/8/3/4. | `desk-light-01-first.jpg`, `desk-light-03-door-nearby.jpg`, `phone-light-01-first.jpg` |
| 5 | Semi-transparent "2" and "3" bubbles ghost over the brass ring. The hollow markers show map texture inside them. | `bug-phone-rim-ghost-markers.jpg` |
| 6 | Worldwide frames the Americas, where only 2 of the 10 countries are lit. A grey "44" (Europe) dominates. | `desk-light-03-door-far.jpg`, `phone-light-03-door-far.jpg` |
| 7 | On desktop, a door gives no feedback below the hero: the count sits at y=893 in an 800px viewport and there is no pill. | `notes-probe.json` → `deskAfterNearby` |
| 8 | The legend dots are mint green, but the globe lights are gold. | `phone-dark-08-after-sheet.jpg` |
| 9 | The phone search placeholder is clipped ("Subject, city or universit"). | `phone-light-01-first.jpg` |
| 10 | The label "GB United Kingdom" sits on the Netherlands' "8" bubble and not next to the UK marker. | `desk-light-03-door-nearby.jpg` |

**Harness note:** `scroll-behavior: smooth` moves the page after `scrollIntoView`, so a click can land on the wrong element. The failed "Show all" click in `shoot.mjs` came from this. It works with `summary.click()` and with a settled click (`probe2.mjs`).
