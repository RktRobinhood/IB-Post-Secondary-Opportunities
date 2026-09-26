# Programme pages from school records (#43): fixes before round 3

Round 2 scored **6/10**. Its critique is `../round-2/critique.md`: 17 bugs and
3 ranked changes. This file maps each item to what changed, or says why it did
not. The round-2 work is commit cf29c2f.

Gate: `SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs`, **all
35 checks pass**.

## The three ranked changes

### 1. Only this programme's dates, for this reader, and say why when there are none

- **Rounds a programme does not run in.** Two new structured fields in
  `schemas/school.schema.json`:
  - A school date may carry `programmes: [slugs]`. It then shows only on those
    programmes' pages, and on the school's page.
  - A programme may carry `round` ("January round"). Its page then keeps
    - its school's dates of that round,
    - dates of no named round,
    - none of the route's general dates (`school-programme.mjs` `forDates`,
      `keepFor`).
  - Data:
    - Gothenburg: the six April-round dates are scoped to the four programmes
      its note names (Business and Economics, Computer Science and AI,
      International Relations, Software Engineering). The seven music and
      craft programmes, Opera included, are `round: "January round"`.
    - Umeå: the April-round dates are scoped to `architecture-programme`, and
      Architecture is `round: "April round"`. The labels are back to plain
      words; the scope is now in the fields.
- **Diploma flag per programme.** On a programme with `round` and its own
  `closes`, the dates of that round take the programme's
  `closesForDiplomaHolders` in place of the round's flag.
  - Umeå Industrial Design (`round: "January round"`, unflagged `closes`)
    shows "January round opens, 13:00 CET" and the 1 February documents date
    with no badge.
  - Life Science and Business still show them flagged.
- **Other audiences.** `datesPanel` drops every date for applicants from
  outside the EU/EEA (`who: "non-eu"`), on school pages and programme pages
  (`forReader` in `src/lib/school-dates.mjs`). Radboud's panel no longer
  starts on the non-EU 1 April.
- **Apply by is an application deadline only.**
  - New date kind `housing`. Radboud's "SSH& housing lottery" (1 May) and
    UvA's "UvA Housing" (1 April) now carry it.
  - A housing date is never Apply-by. It appears as the tile's note.
  - Radboud AI now reads "Apply by 1 July 2027 · Housing: apply by 1 May".
  - Guard self-test: Radboud 1 May refused, 1 July accepted.
- **Two states instead of "Diploma holders only"**, decided from data:
  - **After your Diploma**: the programme's only round needs the Diploma in
    hand (`closesForDiplomaHolders`). Note: "Runs only in the January round,
    which needs the Diploma in hand". Applies to Gothenburg's 7 music and
    craft programmes.
  - **Not open yet**: every closing date is for Diploma holders, and the
    programme has no only-round of its own. Note: "No 2027 round for
    final-year IB students published yet". Applies to LiU, LTU's 5
    programmes, and UmU Life Science and Business.
  - In both cases the dates panel opens on the same line. Dates only for
    Diploma holders wait under "All dates" (`status` option of `datesPanel`;
    `dates-panel.js` keeps them there as dates pass). The panel keeps the
    school's own dates and the IB calendar. It drops the route's other-round
    steps, such as "Second round results published".
  - In every panel, dates for Diploma holders now sort after the reader's
    other dates.
  - A school-page card of such a programme says "After your Diploma", never
    "Apply by".
- **Also, from the same critique point:**
  - Uppsala, Stockholm and Malmö have not said which programmes run in the
    2027 April round ("if a programme runs it"). Those dates are now
    `provisional` (new field). The tile reads "Apply by 15 April 2027 · Not
    yet confirmed for 2027", and the panel marks the dates provisional.
  - Swedish school dates now `supersede` the national route's date for the
    same step. The same day no longer appears twice, once from the route and
    once from the school (LiU's two 16 October openings, KTH's two 15 April
    closes).

### 2. The record's notes on the page

- **"Before you apply"** is a warn note directly under the facts strip. It
  comes before the dates panel on a phone and sits in the main column on
  desktop.
  - It shows one line: the first school `note` that names this programme,
    else the first that names no other programme.
  - The rest sit behind "N more things to know".
  - The selection is `notesFor()` in `src/lib/schools.mjs`. The page renders
    the note lines as panel lines, not prose, because a school note repeats
    on each of its programme pages.
  - UmU Industrial Design: "Industrial Design is the exception: apply in
    January (work samples by 1 February 2027) and prove entry by 21 June 2027.
    May IB results come in early July, so ask UmU first."
  - LiU: "…you cannot apply yet; in 2026 it also ran an April round".
  - NCAD: "list them on CAO by 1 February, because late applications are not
    accepted".
  - Radboud: binding study advice.
  - GU Metal Art: Campus Steneby, 170 km from Gothenburg, six to eight
    students.
  - KTH: round 2, with "10% admitted" one tap down.
- **Admission tile.**
  - Structured `selection` added to:
    - TUM Aerospace: grades, interview ("Ranked on grades; some interviewed");
    - UmU Industrial Design: portfolio, motivation, interview;
    - GU craft BFAs: portfolio, interview;
    - GU music programmes: entrance-exam ("Admission test decides");
    - LiU: grades, test-score ("67% on grades and 33% on the Swedish aptitude
      test").
  - Where a record still has no `selection` but its requirement line says how
    places are decided, the tile reads "See what you need", not "Not recorded
    yet".
- **NCAD tiles.**
  - The school record now has its own date: "CAO normal closing date; studio
    courses take no late applications", 2027-02-01, superseding
    `ie-cao-2027/ms-submit`. Every NCAD page reads "Apply by 1 February 2027".
  - A missing EU/EEA fee now shows "Not recorded yet" on every page. The
    strip is back to 8 tiles.

### 3. Sparse and long-named pages

- **Title.**
  - `displayName()` drops the degree-type prefix and suffix the eyebrow
    already carries: "Experimental and Industrial Biomedicine", "Industrial
    Design", "Metal Art".
  - The hero and the breadcrumb use it.
  - The full name appears once in the aside as "Official name".
  - LiU's `´` is now an apostrophe, and `check-schools.mjs` fails any name
    with one.
- **Empty column.** A school with one programme ends the column on "More
  <field> in <country>". That is three cards from the country's other listed
  schools in the same field, one per school, from real records. Each card
  names its school. KTH ICT gets "More computing in Sweden", LiU "More
  sciences in Sweden".
- **One "Open on" button.** The in-column button is gone. The close band is
  the page's one way out.
- **Photograph.**
  - When the programme's `city` is not one of the school's towns (Dals Långed,
    Garching and Ottobrunn, Visby…), the page no longer shows the
    main-campus photograph.
  - It opens on the ruled-paper panel instead, edged in its field's colour
    (`hero--fam`).
  - "Online" and "Joensuu or Kuopio" against "Joensuu and Kuopio" still
    count as the school's town.
  - No per-town photographs exist in the repo, so the honest fallback is the
    panel.
- **Diacritics.**
  - Cause: the data. `data/countries/se.json` and `data/places/se-*.json` were
    researched in ASCII; no display function strips accents.
  - Fixed: Linköping, Umeå, Jönköping, Malmö and Luleå. These are
    institution names, cities and prose in `se.json`, and place names in
    `se-linkoping`, `se-umea`, `se-jonkoping`, `se-malmo` and `se-lulea`.
  - Left as they are: records of external things, such as image `subject`
    and evidence `publisher`.

## The 17 bugs

| # | Bug | State |
|---|---|---|
| 1 | GU Metal Art panel leads with April-round deadlines | Fixed: `round` and `programmes` scope. The panel opens on "After your Diploma" and its own January dates sit under "All dates" (`07`, `08`) |
| 2 | UmU Industrial Design: the note is missing and the opening is badged | Fixed: "Before you apply" shows the warning; the opening and documents dates are unbadged on this page (`09`, `20`) |
| 3 | Radboud Apply-by is the housing date | Fixed: `kind: "housing"`; the tile reads 1 July 2027 with a housing note (`10`, `21`) |
| 4 | Radboud panel leads with the non-EU deadline | Fixed: non-EU dates leave every panel |
| 5 | "Diploma holders only" is ambiguous | Fixed: two states, "Not open yet" and "After your Diploma" (`05`, `07`) |
| 6 | LiU panel leads with three Diploma-holder dates, two of them the same opening | Fixed: status line first, flagged dates under "All dates", and school dates supersede the route's (`05`, `19`) |
| 7 | "Admission: Not recorded yet" beside a card that describes selection | Fixed: structured `selection` for TUM, UmU ID, GU and LiU, and a "See what you need" fallback (`17`, `09`, `07`) |
| 8 | NCAD has no Apply-by and no fee tile | Fixed: 1 February from NCAD's own date, and "Not recorded yet" for the fee (`11`, `13`) |
| 9 | Empty main column (KTH, LiU) | Fixed: "More <field> in <country>" plus the "Before you apply" block (`03`, `05`) |
| 10 | Two "Open on" buttons | Fixed: one, in the close band |
| 11 | Five-line title, `´`, three-line breadcrumb | Fixed: display title in hero and crumb, the record corrected, and a guard. The stray "/" is the next crumb's own separator; it now stays with that crumb when the trail wraps |
| 12 | "Linkoping", "Umea" | Fixed at the data source (above) |
| 13 | Main-campus photo over a programme taught 170 km away | Fixed: panel hero in the field's colour (`07`, `17`) |
| 14 | Chips in sibling cards indented about 24 px | Fixed: `.prose .card .tags`, `.prog-siblings .tags` have no list padding |
| 15 | Empty paper between the close band and the footer when there is no pager | Fixed: no footer margin after a closing band |
| 16 | "Master of Architecture (5-year programme) · 5 yrs" | Fixed in data: credential "Master of Architecture" |
| 17 | Apply-via clips at 390 px | Fixed: `overflow-wrap: anywhere` on strip and aside values (`16`) |
| — | GU school page lists the seven "Diploma holders only" cards first | Fixed: `inCardOrder` puts `closesForDiplomaHolders` programmes after the rest (`15`, `16`) |
| — | The Danish benchmark hero fails to load on a local build | Not touched: outside these pages |

## Guards added

- **`scripts/check-schools.mjs`**, each with a self-test:
  - every `programmes` slug names a programme of the record;
  - a programme's `round` is one its record's dates name;
  - no name contains `´`;
  - every date of a round labelled "if a programme runs it" is `provisional`.
- **`scripts/test-school-pages.mjs`**
  - Rule 7:
    - Apply-by is never a housing date;
    - "After your Diploma" and "Not open yet" follow from the record, and the
      dates panel opens on the same line.
  - Rule 8: no dates panel on a school page or a programme page shows a
    non-EU date. No programme page shows a date scoped to other programmes or
    from a round it does not run in.
  - Rule 9: every programme page with a note for it opens on that note in
    "Before you apply". This holds on 558 of 571 pages.
- The text-walls, audience and calendar guards stay green.

## Left for the critic

- The Swedish school pages still lead with the national "Second round
  closes" where the school has no whole-school April date: GU and UmU scope
  theirs to some programmes, and LiU has none. The route's note says to
  check that the programme runs in it.
- "Test score (SAT, ACT or similar)" is the schema's label for LiU's SweSAT
  share. The note one tap down says which test.
- Modul's "Super Early Bird" (15 January) is still a `closes` date, so it is
  Modul's Apply-by. A discount kind like `housing` would fix it; it is not in
  this critique.

## Screenshots (`shots/`)

Built with no `SITE_BASE` and served on :4431. Shot with
`docs/research/qa/schools/shoot.mjs` at 1280 px and 390 px, full page, light.
All files are under 400 kB. The first sixteen are the round-2 set.

| File | Page |
|---|---|
| `01-fi-aalto-data-science-desktop-light.jpg`, `02-…-phone-light.jpg` | `/universities/fi-aalto/data-science/` |
| `03-se-kth-ict-desktop-light.jpg`, `04-…-phone-light.jpg` | `/universities/se-kth/information-and-communication-technology/`: More computing in Sweden, one button |
| `05-se-liu-biomedicine-desktop-light.jpg`, `06-…-desktop-dark.jpg`, `19-…-phone-light.jpg` | `/universities/se-liu/bachelor-s-programme-in-experimental-and-industrial-biomedicine/`: Not open yet, short title, Linköping |
| `07-se-gu-metal-art-desktop-light.jpg`, `08-…-phone-light.jpg` | `/universities/se-gu/bfa-programme-in-metal-art/`: After your Diploma, panel hero for Dals Långed |
| `09-se-umu-industrial-design-desktop-light.jpg`, `20-…-phone-light.jpg` | `/universities/se-umu/bachelor-programme-in-industrial-design/`: the warning, unbadged January dates |
| `10-nl-radboud-ai-desktop-light.jpg`, `21-…-phone-light.jpg` | `/universities/nl-radboud/artificial-intelligence/`: 1 July, housing note, no non-EU date |
| `11-ie-ncad-fashion-design-desktop-light.jpg`, `12-…-phone-light.jpg` | `/universities/ie-ncad/fashion-design/`: 1 February, fee "Not recorded yet" |
| `13-ie-ncad-product-design-desktop-light.jpg` | `/universities/ie-ncad/product-design/` |
| `14-gb-warwick-school-desktop-light.jpg` | `/universities/gb-warwick/` |
| `15-se-gu-school-desktop-light.jpg`, `16-…-phone-light.jpg` | `/universities/se-gu/`: the four April programmes first |
| `17-de-tum-aerospace-desktop-light.jpg`, `18-…-phone-light.jpg` | `/universities/de-tum/aerospace/`: selection tile, Garching panel hero |
