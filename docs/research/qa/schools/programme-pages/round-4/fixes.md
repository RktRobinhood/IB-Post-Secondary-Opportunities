# Programme pages from school records (#43): fixes before round 4

Round 3 scored **5/10** (`../round-3/critique.md`). Its point was that the
round had fixed cases, not the rule. This round replaces the rule, guards it
across all 571 pages, and works through the smaller bugs.

It builds on the merged working branch: #52 families and campus cards,
`schoolCards`, the Paths table, and `test-card-names`. #52's behaviour is
kept. Family cards now carry each path's status in their rows.

**Gate:** `SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs`,
**all 38 checks pass**.

## 1. One deadline rule for every country, enforced

**The rule is one module, `src/lib/programme-deadline.mjs`.** The page's tile,
its dates panel, the Paths table and every card of the programme read from it:
- the programme's own page;
- its card on the school page;
- its card as a sibling, or under "More … in …" on other pages.

**Apply by** is the first closing date (`kind: "closes"`) of the programme or
its school that an EU/EEA reader in their final IB year can use. It is never:
- a non-EU date;
- a date only for Diploma holders;
- a housing date;
- an **earlier chance**: new kind `early`, for Early Action, early birds,
  priority dates, discounts and earlier rounds, with an optional `short` name.
  The nearest one becomes the tile's note.

**A route date reaches only the schools it governs.** Three new fields on
route milestones, rounds and profile deadlines (`common.schema.json`), carried
by `calendar.mjs` and read in `school-dates.mjs` `datesFor`:

| Field | What it says | Example |
|---|---|---|
| `institutionTypes` | The kinds of school the date governs, by the country profile's `type` | `at-direct-2027` "General closing date at public universities" (5 September) governs `Research university` and `Technical university` only |
| `taughtIn` | The teaching languages the date is for | Samordna opptak's steps, and `no.json`'s "main deadline (Norwegian-taught programmes)": `taughtIn: ["Norwegian"]` |
| `everySchool` | The date is every such school's deadline, so it may be Apply by | CAO's normal closing date; Austria's 5 September for the public universities |

- **The 5 September date** no longer reaches IMC Krems (a Fachhochschule), or
  Webster and MODUL (business schools).
- **The Samordna dates** never reach an English-taught programme page, KHiO
  Ballet included. They still reach the school pages of Norwegian-taught
  schools (scope `none`).
- **CAO's 1 February** is now every CAO school's Apply by: RCSI reads "1
  February 2027", like NCAD.
- **Own selection: `ownDeadline`** (school or programme). The route's general
  date is not this deadline.
  - Set on WU (school), Uni Wien Mathematical Foundations of Data Science,
    AAU International Business and Economics, JKU Transformation Studies and
    KHiO Classical Ballet.
  - A programme with it reads only its own `closes` or dates scoped to it.
  - WU's school page no longer leads with 5 September.
- **Where the 2027 date is not out: `lastYear` `{year, text}`**, only as each
  record's own note says it. The tile reads "Not published yet" with the note:

  | Programme | Note |
  |---|---|
  | WU BBE | "2026: register 2 March–19 May; exam 30 June" |
  | IMC Krems (8) | "2026: 15 April" |
  | Webster (6) | "2026: 31 July (EU/EEA)" |
  | KHiO Ballet | "2026: 27 February (audition)" |
  | Uni Wien Data Science | "2026: register 2 March–4 May" |
  | AAU IBE | "2026: register 12 January–23 February" |
  | KU Leuven | "1 April–1 July (EEA), by programme" |
  | Howest | "1 July (EEA)" |
  | KdG | "no deadline for EEA nationals" |
  | ULB | "30 September" |
  | UCLouvain | "30 September" |
  | FU Berlin | "1 June–15 July" |
  | UCF | "1 June–15 July" |
  | WUR | "15 June" |
  | THUAS | "31 July" |
  | Uni.lu Computer Science | "1 February–15 July" |

- **Early dates, with the notes they now give:**

  | School | Tile |
  |---|---|
  | MODUL | "15 August 2027 · Not yet confirmed for 2027 · €2,000 off by 15 Jan". Yearly date, so provisional; the "Hard deadline" badge is gone from the discounts |
  | Bard College Berlin | "1 May 2027 · Early Action by 1 Nov". Early Action and Regular Decision are `early` |
  | Constructor (19) | "15 July 2027 · Early Action by 1 Feb" |
  | AUC | "1 February 2027 · Early bird by 1 Dec" |
  | UCU | "1 February 2027 · Early round by 1 Dec" |
  | WHU | "15 May 2027 · Round 1 by 31 Jan" |
  | MCI | "30 May 2027 · Deadline 1 of 4 by 8 Nov" |
  | Franklin | Early Action is `early` |
  | BI | "Not recorded yet · Priority deadline by 1 Mar". The record has only the priority date, with rolling admission after it |

- **Guards.**
  - `scripts/check-schools.mjs` (with a self-test):
    - a `closes` date whose label says early, bird, priority or discount
      fails;
    - a label with "page gives no year" fails.
  - `scripts/test-school-pages.mjs` rule 10:
    - self-tests: MODUL 15 Jan refused and 15 Aug accepted; WU 5 Sep refused;
      IMC 5 Sep refused; AAU 5 Sep accepted; KHiO 15 Apr refused; plus the
      word net;
    - the net refuses a leading panel date whose label says "early", "bird",
      "priority", "discount", "public universities" or "Norwegian-taught",
      unless the school's record, or a route that governs its type, owns it;
    - a whole-site check: every one of the 571 pages must have an Apply-by
      tile and 8 tiles. A dated tile must be:
      - a reader's closing date of the programme or school (scoped, not
        flagged, not early or housing, not non-EU); or
      - a route date tied to the school; or
      - an `everySchool` route date that governs the school's type, at a
        school without its own selection.
    - each status tile must follow from the record, and the dates panel must
      open on the same line.

## 2. Never drop a tile, never guess

- **The Apply-by tile is always there.** All 571 strips have 8 tiles, and the
  guard fails otherwise. Over all 571 pages:
  - 466 dates;
  - 62 "Not published yet";
  - 9 "No deadline": Thomas More, whose new `noDeadline` field reads "Apply
    up to the start of the semester";
  - 8 "Not open yet";
  - 7 "After your Diploma";
  - 19 "Not recorded yet": EU Business School 7, LUNEX 5, BI 3, Rotterdam UAS
    WdKA 2, Odisee 1, Uni.lu Music Education 1.
- **The dates panel opens on the tile's words** whenever there is no date.
- **Starts comes from records.**
  - New school field `starts`:
    - October: TUM, UCF, FU Berlin, Leuphana (`de.json`: "before the semester
      starts in October"), JKU and LUNEX (their notes);
    - September: HSRW ("winter semester (1 September)") and AUC ("to start in
      September 2027");
    - "Late August or early September": every Swedish school (`se.json`);
    - "Late August": Webster Geneva (its note).
  - Everything else reads "Autumn 2027" (467 pages).
  - "After your Diploma" pages read "Autumn 2028 at the earliest".
  - The same function feeds the Paths table.
- **GU music and craft** `ib` lines now read "only in the January round (16
  Oct–15 Jan), which needs the Diploma in hand".
- **Admission.**
  - "See what you need" is shown whenever the programme's line or the
    school's general IB rule mentions ranking, selection, points, an
    interview, a portfolio or a test (RCSI, HSRW…).
  - "Not recorded yet" fell from 380 to 224 pages.
  - The strip stays at 8 tiles, as the coordinator asked. The tile is not
    dropped.
- **LiU**: SAT/ACT chip replaced by `selectionNote`: "67% of places go on
  grades and 33% on the Swedish aptitude test (SweSAT)…". This is the record's
  note, now structured.

## 3. Art direction

- **Photographs.**
  - Web access is blocked, so no new photographs were fetched. A programme
    taught away from its school's photographed campus still opens on the
    school's approved photograph. The caption names the campus it shows, so
    no page names the wrong place. For example: "GU's Gothenburg campus ·
    credit" over Metal Art in Dals Långed, and "TUM's Munich campus" over
    Garching and Straubing. The same applies to Fontys Tilburg and Venlo, Nord
    Levanger, UU Visby, LTU Skellefteå, SLU Alnarp, NMBU and the rest.
  - Pages with a photograph went from 446 to **503 of 571**.
  - **68 pages still open on the ruled, field-edged hero.** Their schools
    have no approved photograph in the repository: Hanze 17, Thomas More 9,
    EU Business School 7, MODUL 7, Haaga-Helia 6, LUNEX 5, Howest 5, KdG 4,
    Vesalius 3, SSE 2, NHH 1, LHI 1, UCF 1.
  - In `data/images.json`:
    - MODUL, Thomas More and EUBS each have a candidate that was rejected in
      the photo review;
    - Hanze has no candidate at all.
  - Howest's official image is hot-linked, which neither page type shows.
  - The `unique-images` guard allows a programme page only its school's photo
    or none, so field photos from `programme-images.json` cannot be used.
  - These pages need a photo round (#48 or #54).
- **`displayName`** has moved to `src/lib/schools.mjs`. It also strips:
  - "Degree Programme in";
  - "Bachelor's (and Master's) Degree Programme in";
  - "Bachelor in";
  - "BBA/BSc/BA/BEng/BMus in";
  - "Bachelor of Arts/Science/Business Administration in";
  - a trailing "Degree Programme".

  For example: UTU "Information and Communication Technology"; MODUL
  "Tourism, Hotel Management and Operations".

  It now applies to:
  - the hero and breadcrumb;
  - every programme card (school page, siblings, "More … in …");
  - the prev/next pager (`build.mjs`).

  **Length guard:** a display title over 48 characters fails rule 10. The 36
  official names that have no degree-type words to strip are listed with the
  reason in `scripts/lib/long-titles.json`.
- **Cards carry the page's status.**
  - Every programme card shows the same answer as its page's tile: "Apply by
    15 Apr", "Not open yet", "After your Diploma", "Not published yet" or "No
    deadline".
  - For a family whose paths differ, it goes in each path's row.
  - The guard compares card and tile on every single-programme card.
  - On the school page, programmes whose only round needs the Diploma still come last (from round 3).
  - "More <field> in <country>" picks, per school, a programme that is open
    now, and lists open ones first. WU BBE's first neighbour is JKU
    International Business Administration, "Apply by 5 Sep".

## The 21 bugs

| # | Bug | State |
|---|---|---|
| 1 | WU BBE shows the public-university 5 September | Fixed: `ownDeadline`; "Not published yet · 2026: register 2 March–19 May; exam 30 June" (`01`, `02`) |
| 2 | IMC and Webster show 5 September | Fixed: `institutionTypes`, plus `lastYear` (`03`–`06`) |
| 3 | KHiO Ballet leads with Samordna's Norwegian-taught 15 April | Fixed: `taughtIn` and `ownDeadline`; "Not published yet · 2026: 27 February (audition)" (`07`, `08`) |
| 4 | MODUL's Apply by is a discount date | Fixed: `early`. Now "15 August 2027 · €2,000 off by 15 Jan"; no Hard deadline badge on the discounts (`09`, `10`) |
| 5 | Early Action or early bird shown as Apply by (BCB, Constructor, AUC, UCU, BI) | Fixed, as above (`21`) |
| 6 | RCSI has no Apply-by | Fixed: CAO `everySchool`; "1 February 2027" (`11`, `12`) |
| 7 | No Apply-by tile and an empty panel, with no gap marked | Fixed: the tile is always there, with its reason, and the panel opens on it (`22` KU Leuven) |
| 8 | 7-tile strips | Fixed: always 8, guarded |
| 9 | "Starts September 2027" inferred everywhere | Fixed: from records, else "Autumn 2027"; "Autumn 2028 at the earliest" after the Diploma (`17`) |
| 10 | "Admission: Not recorded yet" beside ranking text | Fixed where the programme's or the school's line says it (380 → 224 pages) |
| 11 | MODUL's "What you need" was `about` content | Fixed in data: moved to `about` |
| 12 | GU "applications only 16 Oct–15 Jan" under "After your Diploma" | Fixed in data (`17`) |
| 13 | Display titles not shortened | Fixed: `displayName` extended, plus the length guard (`13`, `09`) |
| 14 | Cards use full names and show no status | Fixed: display names and status chips on every card |
| 15 | Panel out of time order | Fixed: the build and `dates-panel.js` still pick the leading dates by weight, but show them in date order |
| 16 | Raw time-zone ids | Fixed: `calendar.mjs` `zoneName` ("Irish time", "UK time", "Oslo time"); guarded |
| 17 | "(page gives no year)" in labels | Fixed in data: "(yearly date)" and `provisional`; guarded in `check-schools` and on built pages |
| 18 | SAT/ACT chip for LiU's SweSAT; chips and no sentence | Fixed: `selectionNote` from the record |
| 19 | "Before you apply" leads with a non-caution | Fixed. The first note that changes whether or when to apply now leads; with none, the block is "Worth knowing" in plain style. Also fixed: RCSI's HPAT note had been read as naming no programme ("Medicine" is in RCSI's own name) |
| 20 | Radboud's binding study advice does not give AI's faculty | Not fixed: the record does not say which faculty AI belongs to, and the web is blocked |
| 21 | Empty right column beside "Before you apply" | Fixed: the note runs the full width |

Seen but not scored in round 3:
- The GU school page no longer has cards without a status. Its four April
  programmes read "Apply by 15 Apr" and come first.
- The GU school page still lists "Second round closes" and "April round
  closes" on the same day. The April date is scoped to four programmes, so it
  does not replace the national one on the school page.

## Screenshots (`shots/`)

Built with no `SITE_BASE` and served on :4431. Shot with
`docs/research/qa/schools/shoot.mjs` at 1280 px and 390 px. All files are
under 400 kB. The six random pages were drawn with `shuf` from
`dist/universities/*/*/`, leaving out the named schools.

| File | Page |
|---|---|
| `01`, `02` wu-bbe | `/universities/at-wu-vienna/business-and-economics-bbe/` |
| `03`, `04` imc-business-administration | `/universities/at-imc-krems/business-administration/` |
| `05`, `06` webster-business-administration | `/universities/at-webster-vienna/business-administration/` |
| `07`, `08` khio-ballet | `/universities/no-khio/bachelor-s-programme-in-classical-ballet/` |
| `09`, `10` modul-tourism-hotel | `/universities/at-modul/bba-in-tourism-hotel-management-and-operations/` |
| `11`, `12` rcsi-pharmacy | `/universities/ie-rcsi/pharmacy/` |
| `13`, `14` utu-ict | `/universities/fi-utu/degree-programme-in-information-and-communication-technology/` |
| `15`, `16` hanze-applied-computer-science | `/universities/nl-hanze/applied-computer-science/` (no photo in the repo: ruled hero) |
| `17`, `18` gu-metal-art (light, dark) | `/universities/se-gu/bfa-programme-in-metal-art/`: the captioned campus photo |
| `19` random-rug-industrial-engineering | `/universities/nl-rug/industrial-engineering-and-management/` |
| `20` random-leiden-philosophy | `/universities/nl-leiden/philosophy-global-and-comparative-perspectives/` |
| `21` random-constructor-medicinal-chemistry | `/universities/de-constructor/medicinal-chemistry-and-chemical-biology/` |
| `22` random-ku-leuven-business-engineering | `/universities/be-ku-leuven/bachelor-of-business-engineering/` |
| `23`, `25` random-laurea-business-management | `/universities/fi-laurea/business-management/` (desktop, phone) |
| `24` random-lut-hebut-double-degree | `/universities/fi-lut/software-and-systems-engineering-hebut-double-degree/` (#52 Paths table) |
