# Programme cards round 3 (#46) and home round 2 (#44): fixes

The gate build is `D:/ibp-tmp/dist-cards`. It was built with `SITE_BASE=/IB-Post-Secondary-Opportunities`, and **all 35 checks pass**.

The shots come from a second build, `D:/ibp-tmp/dist-cards-local`, served on :4370.
- They are in `fixes/`. The harness is in `fixes/tools/`: `shoot.mjs`, plus `measure.mjs`, `probe.mjs`, `pill.mjs`, `fold.mjs` and `how.mjs` on top of `cdp.mjs`.
- Run it as `ORIGIN=http://localhost:4370 BASEPATH= OUT=<dir> node shoot.mjs`.

## Home (#44)

### 1. Photographs on the first screen
The filters are one row at every width: search and **Filters**. The Subject area and Where questions and the chips open in a sheet:
- full screen on a phone;
- on a wider screen, a drawer from the right over a dimmed page (`filters-sheet-*.jpg`).

The search label is visually hidden. The placeholder is now "Subject, city, university", so it no longer clips on a phone (bug 9).

**Desktop (≥64rem).** The words and the cards share one column. The globe sits beside them, sticky and as tall as the window, so it answers every choice without a scroll.
- At 1280×800 the count sits at y=446. The first photograph runs from y=503 to 686, fully on screen (`home-desk-*-first.jpg`).
- Before this, the first photograph started at y≈960.
- The title now fits on two lines.

**Phone (<64rem).** The layout stacks: the words, a shorter globe (`min(34vh, 21rem)`) and then the cards.
- The doors sit on one row.
- The legend is one line.
- At 390×844 the first photograph starts at y=743 (`home-phone-*-first.jpg`). Before, it started at y=1272.

The globe stays in the hero at both widths.

### 2. Every door and every ordinary word lands on places
- **A door shows its cards, then its researched countries' tiles.**
  - Nearby shows 16 degrees, then "24 more countries researched, their degrees not yet mapped one by one:" and the 24 European tiles (`door-nearby-*-tiles.jpg`).
  - Worldwide shows its 10 tiles.
  - Right here shows no tile line, because it has none.
- **A word that is the name of no degree finds the degrees whose own descriptions use it.**
  - Matching is by stem: "economist" finds economics.
  - Nothing is a synonym table, and nothing names a subject or a country. The data is each programme's `summary`, carried on the card data as `w`.
  - Those cards show under the line "Nothing on the map is called “psychology” yet, but it comes up in 2 degrees below." The count reads "2 degrees near “psychology”".
  - Chips follow, one per subject area of those degrees ("All Social sciences degrees", which swaps the word for that area), then "Without “psychology”".
  - The globe lights the places of those degrees.
  - Results:

    | Search | Leads to |
    |---|---|
    | "psychology" | RUC Global Humanities and International Bachelor in Social Sciences |
    | "law" | CBS International Shipping and Trade ("maritime law") |
    | "medicine" | the medicine guide and Absalon Biotechnology |

  - A word that matches nothing at all ("zzzz") offers the 34 researched countries as tiles.
- **"all of those" is gone for a single filter.** One word gives the sentence above. One other filter gives "No degree matches that yet." Only two or more filters give "…all of those yet."
- **Filtered results are one grid.** With a filter on, the cards folded behind "Show all" join the first twelve. Two matches used to sit one above the fold line and one below it; now they sit side by side. They fold back when the filters clear, and Back and Forward keep this right (`fold.mjs`).

### 3. Globe legend and framing
- **The legend is one line under the globe:** "● Bigger light, more degrees". The dots are the lights' gold (`#E3B863`, the globe's `--pin`) in place of mint (bug 8).
- **The rest is one tap down, under "How to use the globe":** what the size means, hollow markers, anything outside the frame and the caption. The globe's own drag hint shows only while that is open (`how-desk.jpg`).
- On a phone, the folded "All places (55)" line (the keyboard's way in) is visually hidden until it is focused.
- **Worldwide** now turns to where the far lights weigh most: the mean on the sphere of the 10 far Destinations, weighted by institutions. It lands on Asia–Pacific, not the Americas (`presetView.far` in discover.mjs; `door-far-*.jpg`).

### 4. The pill
The pill now works at every width.
- It shows only when the count is out of sight.
- It never wraps (`nowrap`, with an ellipsis).
- While the words above the globe are on screen, it sits at the foot of the screen, so it never covers the eyebrow (bug 1; `pill-short-phone-door.jpg`, 360×640). Once they have scrolled away, it sits under the masthead.

In the new layouts, the count after a door is already on screen at 1280×800 (y=446) and at 390×844 (y=694), so bug 7 is gone.

## Programme cards (#46)

### 1. The Needs line shows what is distinctive
Changed in `requirementSummary`, components.mjs.
- **What a unit is.** Each requirement is a unit, and so is each "one of", as one unit. A unit is keyed by the IB subject areas it names, plus " HL" when only HL is accepted.
  - So every way of asking for English counts as one requirement: "Any IB English", CBS's fold, Erasmus's five English options.
  - "Maths HL (AA or AI)" and "Any IB Maths" count as different requirements.
- **What is dropped.** `needsRarity` counts each key across the catalogue. A key that 50% or more of programmes ask for is left off the card.
  - English is on 84% and is dropped. Maths HL is on 45% and is kept.
  - Anything dropped is still counted in "+n more", and the programme page is unchanged.
- **What is shown.** The rest are taken rarest first while they fit, then shown in reading order.
- **Steps are units too.** The steps a programme asks of everyone (a portfolio, a test, an interview, from `mandatory` requirement kinds) are units. So VIA Character Animation now reads "Needs a portfolio · a test +1 more".
- **A "one of" is never cut to one option.**
  - It shows in full ("one of: A / B").
  - Or it shows one option plus a count: "Maths AA HL, at least a 4 or 2 other routes" (Erasmus, bug 2); "History or 5 other subjects" (CBS, where the widest subject is named first).
  - Or it is left out and counted.
  - "one of: Any IB English +1 more" now reads "Any IB English or 1 other route" (Crafts in Glass and Ceramics, bug 3).
- **Grades never split.** "at least a 4" and any figure are held together with non-breaking spaces.
- **CBS.** Five of the six CBS programmes have identical requirements, so they read the same apart from their cut-off tags (38, 37, 42, 40 and 39 IB points).
  - Sociology differs: "Any IB Maths, 5+ in Maths SL (AA or AI) · History or 5 other subjects +1 more".
  - This uses a new short form of a one-level grade, `short` in `requirementModel`.
  - Nothing is invented to tell the other five apart.

### 2. One admission vocabulary
`cardTag` in paths.mjs now has four kinds of tag (`TAG_KINDS`):

| Kind | Example |
|---|---|
| Last year | "Last year: 38 IB points", "Last year: all qualified got in", "Last year: any Diploma got in" |
| Open entry | "Open entry" |
| Full Diploma | "Full Diploma" |
| Course Results | "Diploma or Course Results" |

- **Priority.** Last year's figure comes first, then open entry, then the award.
- **What went.** "Restricted admission" is off the cards. A restricted programme with no figure falls through to its award.
- **Quota floors.** These read "31+ IB points", with no "Quota 1" on any card (bug 7). The path rows read the same way: "Full Diploma · 31+ IB points", "last year 32 IB points".
- **Cards with no subject requirements.** The Breda cards and UCM now say how places are decided, from their Selection Factors: "Selected on a test · a portfolio · an interview". The seventh phrasing, "Requires the full IB Diploma", is gone.
- **"Last year".** It means the round before this site's intake (`SITE.cycle.intake`); any other round is shown by its year.
- **One card, two pages.** The home page and every institution page draw the same card (`programmeCard` in paths.mjs). This also fixes the CBS page dropping the city (bug 5): the campus is always named.
- **The programme page** now says "Limited places" and "Open entry", matching the cards.

### 3. Photographs
Nine photographs were replaced (details under "Photos replaced" below). They came through the normal pipeline:
1. lines appended to `docs/research/programme-images/additions.jsonl`;
2. `fetch-images.mjs --manifest=programmes --refresh --only=…`;
3. `import-programme-images.mjs`, which signed the reviews.

The inherited `focus` was dropped. The new contact sheet is `fixes/home-photo-sheet.jpg`:
- It has no sticky notes.
- It has one assembly chamber (European Studies).
- It has two boards (Erasmus 13 and AU Computer Science 26; the critic asked for two of four to go).

The candidate research is in `fixes/photo-candidates.jsonl`, with rank 2 as fallbacks, and the rejections are in `fixes/photo-rejected.md`.

### 4. Small fixes
- **CBS city:** fixed (see above).
- **"7.0" in the phone Paths block:** "an average of 7.0" now moves as one piece (`nowrap`, and the figure is held to its words). Bug 9, `paths-phone-light.jpg`.
- **Phone placeholder:** fixed.

## Guards
- **`test-requirement-translation.mjs`**
  - A card may show a points floor as "31+ IB points" and a one-level grade in its short form.
  - "or N other routes" counts as naming the hidden options.
  - New: a "one of:" that shows one option fails. It has a self-test on the round-3 Crafts card.
- **`test-programme-images.mjs`**
  - New: every programme card on `/` and on every institution page uses at most four kinds of tag, and shows no "Quota N", "Restricted admission" or "Requires". It has a self-test.
  - New: the home filters are a sheet at every width. The hide rule is checked outside any `@media` block.
  - New: the globe caption has exactly one legend line outside "How to use the globe".
  - New: every researched country with no mapped degree is a tile with a scope, and every card member carries its description words.

## Globe-side items (reported, not fixed; globe.js untouched)
1. **Bubble numbers count places, not degrees.** In `layoutPins`, globe.js does `node.firstChild.textContent = String(g.members.length)`, and the radius also comes from `members.length`.
   - That is why Denmark reads 40, 41 or 45 against the door's 57, and why Nearby reads 18/9/5/3.
   - The fix is to print the sum of the members' `count`. `cluster()` already computes this as `g.count`.
   - This is why changing LIGHTS in discover.js could not change the bubbles.
2. **A no-degree country light has no "lit, uncounted" state.** `setCounts` treats any falsy count as dim (`counts.get(id) || 0`). `placeCard` prints any truthy count as `plural(count, unit)`.
   - Today a Germany light's card reads "14 degrees · Researched", where 14 is its institution count, and the light is sized as 14.
   - Passing 1 would print "1 degree", so the LIGHTS weights are left as they were.
   - The globe needs a way to take a lit door with no count: for example, count it as 0 in bubbles and print no number for it.
3. **Faint bubbles ghost over the brass ring**, and hollow markers show map texture (round 2, bug 5).
4. **Label collision.** The "GB United Kingdom" label sits on the Netherlands "9" bubble after Nearby (`door-nearby-desk-light-first.jpg`).
5. **Phone controls.** On a phone, the + / − / RESET buttons overlap the top right of the sphere in the shorter stage.
6. **Worldwide framing:** fixed from discover.mjs, as above.

## Record gaps (nothing invented)
- `dk-absalon-biotechnology-beng` still records no `credential.years` (round 3, bug 4), so it reads "BEng · Kalundborg".
- The five CBS programmes with identical requirements can differ only by their cut-offs.

## Files changed
- **`src/lib/components.mjs`:**
  - `requirementSummary`, `needsUnits`, `needsRarity`, `needsKeys`;
  - `floorShort`, `keepTogether`;
  - `short` and `floor` on the model's parts;
  - `floorLine().card`.
- **`src/lib/paths.mjs`:**
  - `cutoffFact`, `cutoffLabel`;
  - `TAG_KINDS`, `cardTag`, `selectionLine`, `stepsOf`, `rarityOf`;
  - `familyCard().tag`, `programmeCard` (new);
  - Paths table cells.
- **`src/lib/primitives.mjs`:** the `worldWindow` caption only.
- **`src/pages/discover.mjs`:**
  - `programmeCard`, `wordsOf`;
  - the search row, the empty-state position and the places line;
  - `presetView.far` and `foldList`.
- **`src/pages/institutions.mjs`:** small. It now draws `programmeCard`, so it shares the vocabulary and names the campus. This file is outside my listed set; it is not in the other agent's either.
- **`src/pages/programme.mjs`:** the admission note and fact wording.
- **`src/assets/js/discover.js`:**
  - `nearest`, `renderWays`, `placesFor`;
  - the one-grid move;
  - the pill;
  - the sheet at all widths (a click beside the drawer closes it);
  - `paintMap(near)`.
- **`src/assets/css/site.css`:** the discover block (the grid layout, the sheet, the legend, the pill), the Paths `nowrap` and the empty-state chips.
- **Photographs:**
  - `data/programme-images.json`;
  - `src/assets/img/programmes/`: 9 photographs × 3 sizes;
  - `docs/research/programme-images/additions.jsonl`: 9 lines.
- **Guards:** `scripts/test-requirement-translation.mjs`, `scripts/test-programme-images.mjs`.

## Photos replaced (credited on /credits/ from the records)

| Card | Now | Author | Licence |
|---|---|---|---|
| Creative Business (Breda), was a sticky-note workshop | [Professionelle Produktfotografie im Fotostudio.jpg](https://commons.wikimedia.org/wiki/File:Professionelle_Produktfotografie_im_Fotostudio.jpg) | Klaus Ohlenschläger | CC BY-SA 4.0 |
| CBS Digital Management, was the Kanban board whose text showed through the title | [AutoStore robots on the grid.jpg](https://commons.wikimedia.org/wiki/File:AutoStore_robots_on_the_grid.jpg) | Euku | CC BY-SA 4.0 |
| AAU Economics and Business Administration, was a sticky-note workshop | [Canary Wharf Isle of Dogs from River Thames London England 01.jpg](https://commons.wikimedia.org/wiki/File:Canary_Wharf_Isle_of_Dogs_from_River_Thames_London_England_01.jpg) | Acabashi | CC BY-SA 4.0 |
| AU Economics and Business Administration, was a SWOT sticky-note wall | [Markthal - City of Rotterdam.jpg](https://commons.wikimedia.org/wiki/File:Markthal_-_City_of_Rotterdam.jpg) | Frans Berkelaar | CC BY-SA 2.0 |
| ITU Global Business Informatics, was a Business Model Canvas wall | [Idufirma Starship pakirobot Tartu kesklinnas 2017. aastal..jpg](https://commons.wikimedia.org/wiki/File:Idufirma_Starship_pakirobot_Tartu_kesklinnas_2017._aastal..jpg) | Sillerkiil | CC BY-SA 4.0 |
| Maastricht DSAI, was a blackboard | [2017 BSC Superordenador MareNostrum-4 Barcelona-Supercomputing-Center.jpg](https://commons.wikimedia.org/wiki/File:2017_BSC_Superordenador_MareNostrum-4_Barcelona-Supercomputing-Center.jpg) | Martidaniel | CC BY-SA 4.0 |
| SDU Computer Science, was a blackboard close-up | [Jugend hackt Süd 2016 (27538057431).jpg](https://commons.wikimedia.org/wiki/File:Jugend_hackt_S%C3%BCd_2016_(27538057431).jpg) | Open Knowledge Foundation Deutschland from Deutschland | CC BY 2.0 |
| CBS International Business and Politics, was the UN General Assembly chamber | [Palais des Nations unies, à Genève.jpg](https://commons.wikimedia.org/wiki/File:Palais_des_Nations_unies,_%C3%A0_Gen%C3%A8ve.jpg) | Groov3 | CC0 |

The Frankfurt Stock Exchange trading floor was fetched first for field-business, then swapped for Canary Wharf: at card size its round desks of monitors read as the same scene as the Cyber Security control room beside it. Each review note is in the record (automated visual review, as delegated by the owner).
