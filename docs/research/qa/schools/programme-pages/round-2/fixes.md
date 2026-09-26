# Programme pages from school records (#43): fixes before round 2

Round 1 (art director, **6/10**) is in `../../programme-pages-round-1.md`. Its
images are in `../../programme-pages-round-1/`. The round-1 fixes landed on
`feat-43-school-pages` in 0879cf7. This file records them and the two items
`docs/STATUS.md` listed under "Before round 2", which are fixed here.

## What round 1 asked for, and where it stands

| # | Round 1 asked | State (seen in the shots below) |
|---|---|---|
| 1 | "Apply by" is this programme's date or nothing: never a country date for another group (medicine on TUM Aerospace, numerus fixus on Radboud AI). Add a guard | Done in 0879cf7. `applyBy()` reads only the programme's `closes`, the school record's dates, or a route date tied to the school by id. `test-school-pages.mjs` rule 6 checks every tile. **Now also: never a date only for Diploma holders (below)** |
| 2 | A photograph on every programme page, the school's when it has none of its own | Done: compact photo hero (`03`, `05`, `07`, `11`) |
| 3 | Say each thing once: no lede repeated as "What it is", Field in the eyebrow | Done. The lede is the first sentence only when "What it is" has more to say; otherwise it is a line built from the record ("A three-year design degree in Dublin.", `11`) |
| 4 | The facts strip fits its tiles: no filler cells, a short cut-off, parentheticals moved to the note, an Admission tile always there ("Not recorded yet") | Done (`01`, `03`, `05`) |
| 5 | Sparse pages end on something to do and somewhere to go: "Open on …" under the requirement, and three sibling cards | Done (`03`, `05`, `11`) |
| 6 | Name the maths requirement as the record does (a level per option) | Done: `needs` options take `@HL`/`@SL`, shown as "Maths AA (SL or HL) or AI HL" |
| 7 | Chrome bugs: breadcrumb shadow on paper, chip indent, eyebrow wrap, 3-line close heading, empty band on single-programme schools | Done in 0879cf7. The photo hero replaces the paper panel on these pages, and the close heading is "The programme's own page" |
| 8 | School-page cards show they open a page | Done: "The programme →" foot (`11`, `15`) |
| Bug 8 | The NCAD lede opens "CAO code AD211." | **Fixed here** (below) |
| Bug 9 | NCAD's general IB rule names another programme's add-on | Filtered in code in 0879cf7; **the data is now fixed as well** (below) |

## Fixed for round 2

### 1. A date only for Diploma holders is never a final-year student's "Apply by"

The reader is in their final IB year. Some school dates are only for applicants
who already hold the Diploma: Sweden's January round ("only if you already hold
your IB Diploma", "not for final-year IB students"), KI's first intake, and the
Norwegian direct routes that want the diploma in hand (NMBU, UiO). Before this
fix, 47 Swedish and 2 Norwegian programme pages showed one of those dates as
"Apply by" (KTH ICT: 15 January 2027).

- **Model.** `forDiplomaHolders: true` on a school date and on an Application
  Route milestone or round (`schemas/common.schema.json`, `school.schema.json`,
  `application-route.schema.json`). A programme whose own `closes` is in such
  a round has `closesForDiplomaHolders: true`. `src/lib/calendar.mjs` carries
  the flag, and a merged twin keeps it.
- **Data.** The flag is set on every such date, found from the records' own words:
  - Sweden: the January-round dates of GU, KTH, LiU, LTU, LU, MaU, SLU, SU,
    UmU and UU, and KI's first intake.
  - Norway: NMBU's direct route, and UiO's Søknadsweb opening and deadline.
  - The national Swedish route (`se-uhr-2027`): the first-round opening,
    closing, documents and results. Its note: "University Admissions tells IB
    students who have not finished the Diploma not to apply in this round".
  - Gothenburg's music and craft programmes: their `closes` (the record: they
    "run only in the January round, which is not for students still finishing
    the IB"). Opera gets the same round's 15 January as its `closes`.
- **Umeå.** Its note makes Industrial Design the exception ("apply in January
  … and prove entry by 21 June 2027"). So Industrial Design gets its own
  `closes` of 15 January. The January closing and documents dates name Life
  Science and Business and Economics. The April-round dates name Architecture,
  because the record says "only Architecture so far". Life Science and Business
  no longer show an April date that the record says is not published.
- **Pages.**
  - `leadsFor()` in `src/lib/school-dates.mjs` is binding and not only for
    Diploma holders. It decides what leads a dates panel, on school pages and
    programme pages. It also sets `data-binding`, which `dates-panel.js` lifts
    as dates pass.
  - A flagged date is still listed with its label. Where the label does not say
    so already, it gets a "Diploma holders only" badge (`05`, `07`).
  - `applyBy()` in `school-programme.mjs` skips flagged dates. When a flagged
    date is the only closing date, the tile reads "Apply by: Diploma holders
    only · No round for final-year IB students recorded" (`05`, `07`).
  - A school-page card shows "Diploma holders only" instead of "Apply by …"
    (`15`, `16`).
- **Result.** KTH, KI, LU, SLU, GU (its four April-round programmes), MaU, SU
  and UU now show 15 April 2027, the April round. LiU, LTU, UmU Life Science
  and Business, and the GU music and craft programmes show "Diploma holders
  only". UmU Industrial Design keeps 15 January. NMBU and UiO show 15 April
  (Samordna opptak, with a Nordic language A).
- **Guards.**
  - `scripts/check-schools.mjs` fails a school date whose label says it is only
    for Diploma holders and lacks the flag. It also fails an unflagged date of
    the same round as a flagged one ("January round: documents", "January round
    results"), and `closesForDiplomaHolders` without `closes`. Its self-test
    passes "Admission group 2 (IB Diploma holders)", which names the
    qualification, not a round.
  - `scripts/test-school-pages.mjs` rule 7:
    - a dated Apply-by tile is never a flagged date (self-test: KTH ICT, 15
      January refused, 15 April accepted);
    - "Diploma holders only" appears only where the record has such a date;
    - no card of a flagged programme says "Apply by";
    - no dates panel marks a flagged date `data-binding`;
    - a route milestone whose words say it is for Diploma holders must carry
      the flag.
  - `scripts/test-calendar.mjs`: the binding-before-soft check now uses the
    same lead rule.
  - Wording helpers: `saysForDiplomaHolders()` and `roundOf()` in
    `src/lib/schools.mjs`.

### 2. NCAD data

- Every NCAD `about` began "CAO code ADxxx.". The code now has its own
  programme field, `code` (in the schema). The page shows it in the aside as
  "Course code: AD211" (`11`). `about` now says what the degree is.
- Fashion Design's `about` now leads with the degree: "Fashion design, taught
  through the design process as it applies to the fashion industry: from a
  personal visual language to a final-year collection, with an optional Studio+
  placement year." Every word comes from the record.
- The Maths add-on has moved:
  - "Product and Interaction Design add Maths SL 4 or HL 3" is no longer in the
    school's general IB rule.
  - Product Design and Interaction Design each carry it as their own `ib`
    line: "Adds Maths at SL 4 or HL 3; a science can stand in for Maths", taken
    from their `needs` note.
  - Fashion Design and the school's other programmes no longer mention it
    (`11`, `13`).

Also: `is-hi` notes take `main`'s wording, "Nordic citizens have until 5 June"
(bcc587a). Without it the audience guard fails on this branch.

## Left for the critic to judge

- On SU, UU and MaU, "Apply by 15 April 2027" is the April round. Their records
  label that round "if a programme runs it". UU's note says no 2027 round of
  either kind is published yet. The tile does not carry that condition.
- On Gothenburg's music and craft pages (`07`), the panel still lists the April
  round's steps (fee exemption, IB results, reply). The record does not scope
  those dates to the four programmes that run in April.
- On Swedish school pages, the national route's "Second round closes" now
  leads, next to the school's own "April round closes" on the same day. That
  duplicate existed before. On LiU and LTU, the national second round leads
  although those schools list no April 2027 round; its note says to check.

## Gate

`SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs`: **all 35
checks pass**.

## Screenshots (`shots/`)

Built with no `SITE_BASE` and served on :4411. Shot with
`docs/research/qa/schools/shoot.mjs` (1280 px and 390 px, full page), each
under 400 kB.

| File | Page | Shows |
|---|---|---|
| `01-fi-aalto-data-science-desktop-light.jpg` | `/universities/fi-aalto/data-science/` | Enriched Finnish page (needs, selection, cut-off) |
| `02-fi-aalto-data-science-phone-light.jpg` | same, phone | |
| `03-se-kth-ict-desktop-light.jpg` | `/universities/se-kth/information-and-communication-technology/` | Apply by 15 April 2027; the January round listed, not leading |
| `04-se-kth-ict-phone-light.jpg` | same, phone | |
| `05-se-liu-biomedicine-desktop-light.jpg` | `/universities/se-liu/bachelor-s-programme-in-experimental-and-industrial-biomedicine/` | "Apply by: Diploma holders only"; the badges |
| `06-se-liu-biomedicine-desktop-dark.jpg` | same, dark | |
| `07-se-gu-metal-art-desktop-light.jpg` | `/universities/se-gu/bfa-programme-in-metal-art/` | A programme whose own `closes` is for Diploma holders |
| `08-se-gu-metal-art-phone-light.jpg` | same, phone | |
| `09-se-umu-industrial-design-desktop-light.jpg` | `/universities/se-umu/bachelor-programme-in-industrial-design/` | The exception: Apply by 15 January 2027 |
| `10-nl-radboud-ai-desktop-light.jpg` | `/universities/nl-radboud/artificial-intelligence/` | A sparse Dutch page |
| `11-ie-ncad-fashion-design-desktop-light.jpg` | `/universities/ie-ncad/fashion-design/` | The new `about`, "Course code AD211", no Maths add-on |
| `12-ie-ncad-fashion-design-phone-light.jpg` | same, phone | |
| `13-ie-ncad-product-design-desktop-light.jpg` | `/universities/ie-ncad/product-design/` | The Maths add-on on its own programme |
| `14-gb-warwick-school-desktop-light.jpg` | `/universities/gb-warwick/` | A GB school page (GB records are catalogue scope, so no programme pages) |
| `15-se-gu-school-desktop-light.jpg` | `/universities/se-gu/` | A school page: cards tagged "Diploma holders only"; the panel no longer leads with January |
| `16-se-gu-school-phone-light.jpg` | same, phone | |
