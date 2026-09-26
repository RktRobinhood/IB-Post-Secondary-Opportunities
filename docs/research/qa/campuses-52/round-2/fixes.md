# Issue #52, round 2: fixes for the round-1 critique (6/10)

The critique is `../round-1/critique.md`. The build is `wt-52` after the programme-pages round-4 merge (4de1a7d) plus these fixes. The gate `SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs` passes all 38 checks.

## 1. The guards catch the owner's complaint, and every decision is on a record

- **`nameStem` (`src/lib/families.mjs`) is wider.** Before comparing two names it sets aside:
  - degree prefixes ("BSc in", "Bachelor's Programme in", "International Bachelor");
  - brackets, a dash suffix, ", Campus X" and "at X";
  - any word that is a town the institution teaches in (`placeWords`);
  - "with professional experience" and similar.
- **New `namesAlike()`** is the sweep's near rule, now enforced:
  - one name is the other with words added;
  - two thirds of the content words are shared;
  - or the names share an umbrella before a comma.

  A pair that is alike must be one family or carry `separateFrom`. `validate` (`checkFamilies`) enforces this for Danish records and `check-schools` (`checkSchoolFamilies`) for school records.
- **The `check-schools` self-test** covers each shape the critic probed:
  - "Civil Engineering (Lappeenranta)", "BSc in Economics", "Bachelor's Programme in Economics";
  - ", Campus Herning", "at Herning", "Economics Venlo";
  - "… with Professional Experience", "International Business and Politics", "Sciences, Physics";
  - and that "Economics" and "Philosophy" pass.
- **`card-names` compares name stems on the built pages.**
  - It exempts only stems that the records declare separate.
  - Its self-test has "Civil Engineering", "Civil Engineering (Lappeenranta)" and "BSc in Civil Engineering at Lahti".
  - Mutation-tested on a copy of `dist`:
    - an extra "Civil Engineering (Lappeenranta)" card fails;
    - a Hanze tile edited to 17 fails;
    - a MODUL row with its detail removed fails.
- **`separateFrom` is written on the records** for every "keep separate" decision:
  - SU, GU, UU, TAU (both groups), HSRW, VU and CBS;
  - **Lund's three NGNAT "Sciences, …" tracks** (kept separate because their subject requirements differ; the row is added to `campuses-52.md`);
  - pairs the stricter rule newly found: IMC Krems, Constructor, HSRW International Business ×2, TUM, Metropolia ×2, Fontys IDE/IE&M and Radboud.

  Each reason comes from the record's own fields. There are 39 school pairs and 2 CBS pairs.
- **AU Herning.** The Opportunity's selection note now agrees with its requirement and with the requirement's own note: AU's English page states no floor, and its Danish page states 6.0. The requirement follows the Danish page, as the other five AU degrees do. The research input `data/dk/au.json` carries the same line.

## 2. Counts are cards

- **"In English" tiles:**
  - school pages now read "N programmes", counted in cards (LUT 12, Hanze 16, MODUL 6);
  - canonical institution pages do the same (AU 5, SDU 11).
- **Other counts:**
  - the destination cards' "N programmes in English";
  - the "Right here" door;
  - the Denmark lede.
- **Home:**
  - the counter reads "67 programmes" and "Show all 67 programmes";
  - the filter counts, the chip counts and "Show N programmes" count cards (`discover.js`: a card matches once, when any of its paths does).
- **Record text.** Summaries that stated a degree count now state the card count: LUT "12 English bachelor's", Hanze "16 English-taught programmes", MODUL "six bachelor's". AU's `about` now says five programmes, with Economics and Business Administration also in Herning.
- **Check:** `card-names` fails when a tile's number differs from the cards on its page, or when the home counter or "Show all" differs from the home cards.

## 3. Every family row says what differs, for this reader

- **`cardLine`** (60 characters at most) is a new optional field on a family. It is the row's own short line.
  - SDU Software Engineering: "Embedded, distributed systems and security; larger intake" / "User-facing software, AI and data; small intake".
  - AU: "Main campus, larger intake" / "Small campus, real companies from day one", beside each cut-off.
  - VIA: "General software engineering; starts in September" / "Augmented, virtual and mixed reality; starts in August".
  - Hanze: "Open to you with the IB Diploma" on 3 years, and "Also open to you; a year longer" on 4 years. This is the record's own line: the IB Diploma meets the HAVO-level entry, and counts as VWO-level for the 3-year version.
- **Rows are set at meta weight:** 14 px, weight 400, underlined link.
- **MODUL** rows and table show "€9,000 a semester · 6 semesters" and "€8,700 a semester · 7 semesters". No total is shown, because whether every semester is charged is not recorded.
- **LUT:**
  - New `routePlaces` field, taken from each LUT programme's own selection note ("35 of the 50 places are in international rolling admission, your route"). Rows and tables read "35 of 50 places in your route" and "40 of 60". The admission tile note uses the same text.
  - Energy Technology's path labels no longer carry the city. The Campus column shows it.
  - The double degree's "What is different" line now names Lahti.
- **Campus sentence, whatever the axis.** Whenever a family's paths span campuses, its page says so plainly (`campusSentence` in `paths.mjs`, used by both tables):
  - LUT Energy: "Taught on two campuses: the LUT degree in Lappeenranta; the LUT + HEBUT double degree in Lahti."
  - VIA: "Taught on two campuses: Horsens; the XR specialisation in Viborg."
  - A campus family still opens with "The same programme is offered at …".
- **SDU BSc/BEng stays one card**, as the critic agreed. The Mechanical Engineering BEng row now adds "more subject combinations": the BEng accepts Geoscience A with Biotechnology A, which the BSc does not. The Needs line above the rows is still the BSc's.
- **Table heading.** It uses round 3's `displayName`: "2 ways to study International Management".
- **Round 4's deadline rule is kept.** The Paths table's Apply-by column and the rows' deadline read `deadlineOf` (`src/lib/programme-deadline.mjs`), the same as each page's tile and card chip.

## Shots (`shots/`)

- **Source:** the merged build, built without `SITE_BASE`, served on :4461. The server was stopped by its PID.
- **Coverage:** 11 paths, each at desktop 1280 and phone 390, light and dark, for 44 full-page shots. There is also one crop, `crop-sdu-family-rows--desktop-light.jpg`. Every file is under 400 kB.

| Path | What to look at |
|---|---|
| `home` | "67 programmes", "Show all 67 programmes" |
| `universities__dk-au` | "5 programmes"; the Economics and Business Administration rows with `cardLine` and cut-off |
| `universities__dk-sdu` | "11 programmes"; the Software Engineering rows; Mechanical Engineering's "more subject combinations" |
| `universities__fi-lut` | "12 programmes"; the rows' "35 of 50 places in your route"; Energy Technology's campus in the row |
| `universities__nl-hanze` | "16 programmes"; "3 years · Open to you with the IB Diploma" at meta weight |
| `universities__at-modul` | "6 programmes"; the fee with its semester count on each row |
| `programmes__dk-au-…-herning-…` | "The same programme is offered at …"; the cut-off column |
| `programmes__dk-sdu-software-engineering-vejle-…` | the campus table |
| `universities__fi-lut__energy-technology-hebut-double-degree` | the campus sentence; the Campus and Places ("in your route") columns; Lahti named |
| `universities__nl-hanze__international-business-3-year` | the Paths table, and the round-3/4 blocks around it |
| `universities__at-modul__bsc-in-international-management` | "2 ways to study International Management"; fee with semesters |

## Left

- The owner has not yet confirmed the SDU wording ("a separate card only when what a student must do differs *and* one row cannot say it").
- GU Music (Classical against Improvisation) is still two cards. It becomes a specialisation family if research finds the two admission tests are the same.
