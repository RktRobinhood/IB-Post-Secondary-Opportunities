# Globe round 6: flags, per-nation groups, the globe as a filter (#53, #62)

Worktree `D:\ibp-tmp\w53`, branch `globe-53`. The owner's latest #53 comments come first:
flags instead of two-letter placeholders; groups that become per-nation; the nation's
boundary on hover; keep the plane on a nation click. Then #62 (globe as a filter), then
the quick unchecked #53 items.

## Baseline

- `SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs` before any change: all 39 checks pass (freshness advisory).
- The "GB United Kingdom" placeholders are emoji flags (`src/lib/data.mjs` FLAGS). Windows has no flag emoji, so it draws the two regional-indicator letters.
  They reach the globe through place names (`discover.mjs` country lights, `destinations.mjs` /countries/ lights), the country card title (`destinations.json` `flag`), the world list, and the "also researched" tiles under the home globe.

## Log

- **Flags drawn.** `scripts/make-flags.mjs` writes 36 SVG flags (3:2, 17.9 kB total) to `src/assets/img/flags/`, one per code in `data.mjs` FLAGS, with a README. Drawn here from each flag's construction, simplified for 18 x 12 px; no download. Contact sheet: `round-6/flags-sheet.png`.
- **Flags on the globe.** `globe.js splitFlag()` strips a leading emoji flag from a place's name at parse time and keeps its two letters; pins, the country card and a country light's card show `img/flags/<code>.svg` instead. On a page of several countries a town's label carries its country's flag while it stands for its country alone (hidden among its country's other towns, `data-plain`). `primitives.mjs flagged()/flagsInHtml()` do the same at build time for the world list and home's "also researched" tiles. Evidence: no regional-indicator character left in the pins, card or list (`twoLetterPlaceholders: false` in every shot).
- **Per nation.** `cluster()` now has three levels: on the desk everything groups by distance; leaned in, a closed country is one bubble (its flag, its name when there is room, its count), and two countries share a bubble only when their discs (not glows) would touch, showing both flags (up to four); a country opens into its towns at 0.2 of the stage's short side of spread, at SCHOOLS_ALT, or when chosen. A click on a country's bubble is `goToCountry` (outline, card, the plane); a mixed bubble dives.
- **Hover outline.** An SVG outline (ink under-stroke + paper line, faint wash when the whole country faces the camera) for the country under the mouse, a hovered bubble's countries, a hovered pin's country, or a hovered/focused list entry.
- **The plane** now also flies on the first choice (from where the camera looks), not only between two choices.
- **Reset** regroups for its destination half way up the climb (`clusterFor`), so it lands on the desk's groups.
- **#62.** A group dive narrows the cards to the countries it lands on (`area`); a country with no mapped degree narrows to its own tile; a globe choice outside the active distance drops the distance; the globe counts cards per place, like the results count.
- **/countries/ phone buttons**: `.world > .world__controls` is a row of its own (margin-bottom `var(--s2)` instead of tucking into the stage).
- **Guards.** `scripts/test-map.mjs`: two source-shape regexes follow the new grouping (the `near()` chosen-side rule now names a unit's first member; `const left = [...units]`, plus a new assertion that every shown pin, schools included, becomes a unit). Intent unchanged. The home tiles keep `<li data-scope="…">` exactly (test-programme-images reads it); the code rides on the tile's link as `data-code`.

## Evidence

- `round-6/shoot6.mjs` (this round's harness) → `h-*`, `p-*`, `c-*`, `nl-*` JPEGs and `report.json` (+ `report-desk.json`, the desktop scenarios re-run after the last change). Desktop and phone, light and dark; hover, plane, cards, Back, group dive, a country with no mapped degree, search, Reset frames, phone Europe (reduced motion), /countries/ phone.
- `round-6/shoot/` — the standard `../shoot.mjs` run (PNG + report.json): dives, close map, Reset from street level, Back, group click, phone group tap, reduced motion; console clean.
- Measured: no regional-indicator letters in pins, card or list on any page shot; no label off the stage or on a bubble (all 12 stage states); /countries/ phone buttons end at y=235, ring starts at y=242 (`buttonOnRing: false`, light and dark); Reset groups `16 2 3 0` at 30% of the climb, `16 2 2` from 60% to landing (no change on arrival).

## Gate

`SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs`: **All 39 checks pass** (freshness advisory).

## Left on #53

- Deep rendering, not attempted: JPEG squares / Adriatic border line in the photo sea; cloud streaks mid-dive; the soft texture before the close map; the NL close map's lighter tile and warm-to-cool handoff.
- `/destinations/nl/`: the desk is still several "−" presses away.
- Owner's call: the mouse wheel over the desk scrolls the page until the globe is clicked.
- The phone "Nearby · Europe" frame is small on the current home layout (stage ~280 px tall), so Europe stays one mixed "16" there until a tap; it splits into countries on the dive.
- Emoji flags outside the globe (programme/country cards via `components.mjs`, compare, timeline, destination eyebrows) still show letters on Windows; `primitives.mjs flagImg()/flagsInHtml()` can replace them page by page (files this session was asked not to edit).
