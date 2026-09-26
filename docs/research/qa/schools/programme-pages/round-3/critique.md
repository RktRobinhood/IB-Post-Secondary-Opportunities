# Programme pages from school records (#43): art director, round 3

Under review: `/universities/<school>/<programme>/`, built by
`src/pages/school-programme.mjs`. I also checked the pages as an admissions
counsellor would. Round 1 scored 6/10 and round 2 scored 6/10. The fixes are
in `fixes.md` (commit a2372d9).

What I looked at:

- **The 21 shots in `shots/`.** I cut each one into full-resolution slices and
  read every slice.
- **8 more pages, one per country, picked at random** with `shuf` from
  `dist/universities/`, leaving out the schools in `shots/`. Each was shot at
  1280 and 390 px, light and dark. The shots are in the session scratchpad,
  not the repo.
  - UTU ICT (FI)
  - Nord Games and Entertainment Technology (NO)
  - University College Tilburg (NL)
  - HSRW Agribusiness (DE)
  - MODUL BBA Tourism, Hotel Management and Operations (AT)
  - EU Business School Leisure & Tourism (CH)
  - RCSI Pharmacy (IE)
  - Thomas More International Media and Entertainment Business (BE)
- **Every page against its record** in `data/schools/*.json` and
  `data/application-routes/`.
- **A scripted pass over all 571 non-Danish programme pages in `dist/`**, to
  see how widely each fault reaches.

## Score: 5/10. Not accepted.

**The pages the round set out to fix are fixed.** Most of round 2's 17 bugs
are closed:

- GU Metal Art opens on "After your Diploma".
- UmU Industrial Design carries its "ask UmU first" warning.
- Radboud reads 1 July, with the housing date as a note.
- NCAD has its 1 February.
- "Before you apply" is the best addition since round 1. It puts the
  researcher's sentence that changes the decision directly under the strip.
  On a phone it comes before the dates panel.
- The Aalto, KTH, Radboud and TUM pages read like places worth going.

**The score drops because the round fixed cases, not the rule.** Away from
the Swedish and Dutch pages it tuned, the same fault is still there in other
countries: **a date that is not this student's deadline, shown as if it
were.** The brief fails a round on one wrong deadline. I found these:

- **WU Vienna Business and Economics (BBE): the only deadline on the page is
  "5 September 2027 · General closing date at public universities · Hard
  deadline".**
  - The record says the BBE selection runs once, in spring, before IB results.
    In 2026 registration ran 2 March to 19 May, with the exam on 30 June.
  - A student who plans around the panel misses the programme by more than
    three months.
  - The route's own note on that date says "Fachhochschulen and private
    universities set their own, usually earlier". The page shows it anyway.
- **IMC Krems (8 pages) and Webster Vienna (6 pages)** lead with the same
  public-university 5 September date.
  - IMC is a Fachhochschule. Its record says the 2026 deadline was 15 April.
  - Webster is private. Its 2026 EU/EEA deadline was 31 July.
  - On both, the only "Hard deadline" is later than the real one.
- **KHiO Classical Ballet** leads with "15 April 2027 · Samordna opptak main
  deadline (Norwegian-taught programmes) · Hard deadline". Its own requirement
  card, a few lines down, says "2026 deadline was 27 February". It is an
  audition programme, and the page gives the Norwegian-taught route's date
  instead.
- **MODUL (7 pages) reads "Apply by 15 January 2027", with a "Hard deadline"
  badge.** That is the Super Early Bird discount. The record's EU/EEA final
  deadline is 15 August 2027.
  - `fixes.md` left this for the critic. It is the Radboud housing fault
    again: the tile names a date the record does not call the deadline.
- **The same class, found by search** (a school's earliest `closes` becomes
  Apply-by, whatever its label). About 35 pages:
  - **Bard College Berlin:** "Apply by 1 November 2026" is Early Action. The
    EU/EEA final is 1 May 2027.
  - **Constructor (19 pages):** "1 February 2027" is Early Action. Rolling
    admission runs to 15 July.
  - **AUC and UCU:** "1 December 2026" is the early-bird or early round. The
    regular deadline is 1 February.
  - **BI:** the 1 March priority deadline.
  - An early date does less harm than a late one, but it still closes doors
    that are open. A student who reads AUC on 2 December is told it is over.
    The brief is "possibilities before requirements".

Three smaller faults, each wide:

- **100 of 571 pages (17%) have no Apply-by tile at all**, and nothing says a
  date is missing. Round 2 asked for gaps to be marked. NCAD was fixed through
  its data, not through the renderer (`applyBy`: "with none at all, no tile").
  - RCSI (5 pages): the dates panel's first item is the CAO "1 February 2027 ·
    Normal closing date – the one that matters", but the strip has no Apply-by
    tile. This is round 2's NCAD bug again, at the other CAO school.
  - Thomas More, KU Leuven, Howest, KdG and 27 other Belgian pages have an
    empty dates panel, with only the "Every date in Belgium" link.
  - The strip drops to 7 tiles. It sets as 7 columns at 1280, where
    "Professional bachelor" wraps. At 390 it leaves an orphan tile.
- **"Starts September 2027" is on all 571 pages, and no record says so.** No
  programme in `data/schools/` carries `starts`. The tile infers September from
  `intake: "2027-autumn"`. The site's own records disagree:
  - `data/countries/de.json`: "before the semester starts in October". TUM
    Aerospace still reads September.
  - The JKU note: "October 2027 start".
  - `data/countries/se.json`: "late August or early September".
  - On the 7 "After your Diploma" pages (GU music and craft), a start in
    September 2027 is impossible for the reader.

  This breaks the brief's "nothing invented", in the strip's most confident
  tile.
- **"Admission: Not recorded yet" is on 380 of 571 pages (67%).** On RCSI it
  sits beside "ranked on IB points converted to CAO points". On HSRW it sits
  beside "restricted ones rank on grade". A tile that says "gap" on two pages
  in three is not information. It is a grey stamp over the strip.

**Art direction on the long tail is weaker than the shots suggest.**

- **125 of 571 pages (22%) open on ruled paper, not a photograph.** Four of my
  eight random pages had none: MODUL, Thomas More, EU Business School, Nord.
  The worst schools:
  - Hanze: 17
  - Fontys: 10
  - Thomas More: 9
  - EU Business School: 7
  - MODUL: 7
  - TUM: 6
- **`displayName` misses the most common prefixes.** It does not strip
  "Degree Programme in", "Bachelor's (and Master's) Degree Programme in",
  "BBA in" or "Bachelor in". UTU ICT is a four-line hero at 1280 and on a
  phone, under a two-line breadcrumb. MODUL's "BBA in …" is three lines under
  an eyebrow that already says BBA. 94 display titles are over 40 characters.
- **Sibling and "More <field> in <country>" cards use full official names**
  ("Bachelor's Programme in Game Design and Programming"). They carry a status
  chip only when the programme has its own `closes` (`schools.mjs:122`):
  - KTH's "More computing in Sweden" offers LTU Game Development (Not open
    yet) and GU Computer Science and AI (open, 15 April) with identical cards.
  - LiU's "More sciences" offers UmU Life Science, another "Not open yet"
    page, with no chip.
  - The strip sends a student from one dead end to the next and does not say
    so.

## The three changes that would raise it most

### 1. Make "the deadline" one rule that holds in every country, and guard it

- **A route date applies only to the schools the route governs.**
  - `at-direct-2027`'s "General closing date at public universities" must not
    reach a Fachhochschule (IMC Krems), a private university (Webster, MODUL)
    or a programme with its own selection or test registration (WU BBE, Uni
    Wien's entrance-test degrees).
  - Samordna opptak's "Norwegian-taught programmes" date must not reach KHiO
    Ballet.
  - Mark the route date with the school types it covers (`appliesTo:
    ['public-university']`). Give each school a type, and filter in `keepFor`.
- **Where a school's own 2027 date is missing, the tile and the panel say
  "Not published yet" and give last year's date from the record:**
  - WU BBE: note "2026: register 2 March–19 May, exam 30 June".
  - IMC Krems: note "2026: 15 April".
  - Webster: note "2026: 31 July (EU/EEA)".
  - KHiO Ballet: note "2026: 27 February (audition)".

  Every one of these is already a sentence in the record. It is simply not
  structured.
- **Apply by is the last date this reader can apply.** Add a date kind
  `early` (Early Action, early bird, priority, discount), as `housing` was
  added. It is never Apply-by, and the nearest one shows as the tile's note:
  - MODUL: "Apply by 15 August 2027 · €2,000 off if by 15 January"
  - Bard College Berlin: "1 May 2027 · Early Action 1 November"
  - Constructor: "15 July 2027 · Early Action 1 February"
  - AUC and UCU: "1 February 2027 · Early round 1 December"
  - WHU: "15 May 2027 · 3 rounds, first 31 January"

  Drop the "Hard deadline" badge from discount dates.
- **Guard it.** Extend rule 7 of `test-school-pages.mjs`:
  - refuse an Apply-by or lead panel date whose label says "early", "bird",
    "priority", "discount", "public universities" or "Norwegian-taught"
    unless the school's record owns it;
  - self-test on MODUL, WU, IMC and KHiO.

### 2. Never drop a tile, and never fill one by inference

- **Apply by is always a tile.** When nothing is recorded, it says "Not
  published yet" (with last year's date as the note, where the record has it)
  or "Not recorded yet". The dates panel then opens on the same line, as it
  does for "Not open yet". The strip is always 8 tiles, 4×2 and 2×4.
- **Tie CAO's 1 February to every CAO school** through `institutions` or the
  school's `applyVia`, not through a per-school date. RCSI then reads "Apply by
  1 February 2027", like NCAD.
- **Starts comes from a record, not a default.**
  - Put the start month in the country or route data: October for German and
    Austrian public universities; late August for Sweden, Norway and Finland.
  - Let a programme or school override it (HSRW: 1 September).
  - Where nothing is recorded, write "Autumn 2027".
  - On "After your Diploma" pages, write "Autumn 2028 at the earliest".
  - Fix GU's music and craft `ib` lines. "applications only 16 October 2026 to
    15 January 2027" reads as "you can apply now" on a page that says you
    cannot. Write "only in the January round (16 Oct–15 Jan), which needs the
    Diploma in hand".
- **Admission.** Show "See what you need" whenever `ib` or the school's
  general rule mentions ranking or points (RCSI, HSRW), not only when the
  programme's own `ib` does.
  - If a record has neither, leave the tile out and let the fee move up,
    rather than stamp "Not recorded yet" on two pages in three.
  - Replace "Test score (SAT, ACT or similar)" with the schema label the
    programme means. LiU's is the Swedish aptitude test (SweSAT), which a
    Danish IB student cannot treat as their SAT.

### 3. Finish the long tail's art direction: photographs, short titles, honest cards

- **A photograph on every school.** Source one for Hanze, Fontys, Thomas More,
  EU Business School, MODUL, Nord, HSRW's second campus, TUM Garching,
  Straubing, Steneby and Visby, in that order. That is 125 pages, and the list
  runs by page count. The ruled-paper hero is honest, but the brief is
  photographs first. One in five pages opening on a beige panel is not "a
  place worth going".
- **`displayName`**: also strip
  - `Degree Programme in`
  - `Bachelor's( and Master's)? Degree Programme in`
  - `Bachelor in`
  - `B(BA|Sc|A) in`
  - `Bachelor of Arts in`

  Apply it to the sibling cards, the "More … in …" cards and the prev/next
  pager too. Add a guard that fails a display title over 48 characters, and
  list the exceptions it allows.
- **Every programme card carries the same status as its page's tile**:
  "Apply by 15 Apr", "Not open yet" or "After your Diploma". Compute it with
  the page's own `applyBy`/`holdersStatus`, not `p.closes`.
  - "More <field> in <country>" should pick open programmes first, so a
    student on a closed page is sent somewhere they can apply.

## Bugs

| # | What | Where | Shot |
|---|---|---|---|
| 1 | Only deadline shown is the public-university 5 Sept; real selection registration closed 19 May in 2026 | WU Vienna BBE | text extract |
| 2 | Public-university 5 Sept shown as the hard deadline at a Fachhochschule (2026 close: 15 April) and a private university (2026 close: 31 July) | IMC Krems (8), Webster Vienna (6) | text extract |
| 3 | Lead hard deadline is Samordna's Norwegian-taught 15 April; the programme's own (2026) audition deadline was 27 February | KHiO Classical Ballet | text extract |
| 4 | Apply-by is a discount date (Super Early Bird); the EU/EEA final is 15 August; "Hard deadline" badge on discounts | MODUL (7) | my MODUL shots |
| 5 | Apply-by is Early Action or early-bird instead of the final date | Bard College Berlin, Constructor (19), AUC, UCU, BI | survey |
| 6 | No Apply-by tile although the panel's first item is the CAO 1 February | RCSI (5) | my RCSI shots |
| 7 | No Apply-by tile and an empty dates panel, with no gap marked | Thomas More (9), KU Leuven, Howest, KdG and more; 100 pages in all | my Thomas More, EUBS shots |
| 8 | 7-tile strip: 7 columns at 1280 with a wrapping value, and an orphan tile at 390 | every page without Apply-by | my Thomas More, RCSI, EUBS shots |
| 9 | "Starts September 2027" everywhere, inferred; wrong where the site's own data says October (DE, AT) or late August (SE); impossible on "After your Diploma" pages | all 571 | `17`, `07` |
| 10 | "Admission: Not recorded yet" beside a requirement line that says how places are ranked | RCSI, HSRW, MODUL; 380 pages in all | my shots |
| 11 | "What you need" is not a requirement ("Optional year at The City College of New York"): `about` content in the `ib` field | MODUL BBA Tourism, Hotel Management and Operations | my MODUL shots |
| 12 | Requirement line "applications only 16 October 2026 to 15 January 2027" under "After your Diploma" | GU music and craft (7) | `07`, `08` |
| 13 | Display title not shortened: 4-line hero, 2-line crumb on a phone | UTU ICT, Haaga-Helia (6), UEF, MODUL | my UTU, MODUL shots |
| 14 | Sibling and cross-school cards use full official names and have no status chip unless the record has `closes`, so closed and open programmes look the same | KTH, LiU, UmU, GU | `03`, `05`, `09` |
| 15 | Dates panel reads out of time order: binding dates first, then the rest, with no divider (UmU: 15 Jan, 1 Feb, then "16 October 2026 · January round opens"; TUM: 15 Jul, 15 Sep, 1 Mar). 327 of 571 panels | UmU ID, TUM, Radboud, NCAD, HSRW, Nord | `09`, `18`, `10` |
| 16 | Raw time-zone IDs shown to students: "12:00 Europe/Dublin", "18:00 Europe/London", "23:59 Europe/Oslo" | NCAD, RCSI, Nord, Warwick | `11`, `14` |
| 17 | Researcher's working note in a student-facing label: "(yearly date; the page gives no year)", "(page gives no year)" | MODUL, Nord, NMBU, UiO | my MODUL, Nord shots |
| 18 | "Test score (SAT, ACT or similar)" for LiU's SweSAT; its "How places are decided" box holds two chips and no sentence | LiU | `05`, `19` |
| 19 | "Before you apply" leads with a line that is not a caution: EUBS's triple-degree marketing line; Thomas More's "several … also start in February"; RCSI's Pharmacy description | EUBS, Thomas More, RCSI | my shots |
| 20 | Radboud's binding-study-advice line gives Science (39) and Arts (45) but not the number for AI's faculty | Radboud AI | `10` |
| 21 | About 150 px of empty right column beside "Before you apply" at 1280; the aside starts below it | every desktop page | `01`, `03`, `10` |

Not scored: the GU school page (`15`, `16`) lists "15 April · Second round
closes" and "15 April · April round closes" as two entries. The four
April-round programme cards have no "Apply by 15 Apr" chip, while the seven
closed ones do have their "After your Diploma" chip.

## What works

- **"Before you apply" is the right idea, in the right place.** UmU Industrial
  Design, LiU, TUM, Nord and NCAD now carry the one sentence a counsellor would
  say first. It sits above the dates on a phone.
- **"Not open yet" and "After your Diploma" are clear.** The dates panel opens
  on the same words as the tile, and the dates that are only for Diploma
  holders wait under "All dates" (LiU, GU Metal Art).
- **Sweden and the Netherlands are now scoped properly.** Round-scoped and
  programme-scoped dates, `housing`, non-EU dates removed from every panel,
  and school dates superseding route dates all work where the data uses them.
- **Aalto, KTH, Radboud, NCAD, TUM, UmU, HSRW and Tilburg** open on a
  photograph and a one-line lede. The 8-tile strip is clean. The cut-off tile
  ("143.7 of 172.1 · 2026 · not a prediction · 30 places") is the best single
  element on the site.
- **Dark mode holds** on every shot, the panel hero included.
- **"More computing in Sweden"** removes the round-2 empty column and uses
  real records.

## Summary

1. **5/10, not accepted.** The round fixed every case round 2 named. In other
   countries, a random sample and a survey of all 571 pages found the same
   fault:
   - WU BBE, IMC, Webster and KHiO lead with a route's general date instead of
     their own, earlier deadline.
   - MODUL and about 35 other pages call an early-bird or Early Action date
     "Apply by".
2. **Gaps are still dropped silently:**
   - 100 pages have no Apply-by tile. RCSI is one of them, although its panel
     shows the CAO date.
   - "Starts September 2027" is inferred on every page, against the site's own
     October and August data.
3. **Art direction on the long tail:**
   - 22% of pages open without a photograph.
   - `displayName` misses "Degree Programme in" and "BBA in".
   - Cards do not show whether a programme is open.
4. **The three ranked changes:**
   - one deadline rule for every country, with a guard;
   - never drop or invent a tile;
   - photographs, short titles and status chips on every card.
