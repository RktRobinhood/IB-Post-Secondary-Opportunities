# Programme pages from school records (#43): critic, round 4

Under review: the 571 non-Danish pages at `/universities/<school>/<programme>/`.
The deadline rule is now in `src/lib/programme-deadline.mjs`. Previous scores:
6, 6 and 5. I did not build this and did not score earlier rounds.

What I did:

- **Built the site myself** from HEAD `8773e01` on 26 September 2026
  (`node src/build.mjs`: 1175 pages, 571 of them non-Danish programme pages)
  and served it on :4472. `serve.mjs` does not rebuild when a `dist/` already
  exists, so I rebuilt it explicitly first.
- **Read all 25 shots in `round-4/shots/`**, cut into full-resolution slices.
- **Ran my own scripted pass over all 571 pages.** I did not reuse the
  project's guard. For every page I pulled the eight tiles, the dates-panel
  status and items, "Before you apply", "What you need" and every card chip.
  I then:
  - traced each Apply-by date back to its source: the programme's `closes`,
    the school's `dates`, or a route milestone in
    `data/application-routes/`;
  - compared the tile against every deadline written in the programme's own
    `ib` / `selectionNote` text and in the school's `notes`;
  - listed every school where a later reader deadline exists than the one
    shown.
- **Shot 10 random pages** (`shuf`, leaving out the pages already in
  `round-4/shots`) **plus 4 hard ones**, at 1280 and 390 px, light and dark.
  After a collision showed up on one phone shot, I shot 3 more pages to
  confirm it. All shots are in the session scratchpad, not the repo.
  - Random: LUNEX Nutrition, Laurea Developing Digital Services, Frankfurt
    School BISE, Leiden Linguistics, UU Game Design & Project Management,
    Vesalius Global Business, UEF Data Engineering, Hanze Sport Studies, NCAD
    Product Design, LTU Music.
  - Hard: Hanze Physiotherapy, THUAS Applied Computer Science, TU/e Applied
    Mathematics, UAntwerp Urban Sustainability Studies.
  - Extra, for the phone check: TAMK Environmental Engineering, JU Industrial
    Engineering, GU Crafting Futures.

## Score: 5/10. Not accepted.

**The rule is much better, but the cases it cannot see are the dangerous
ones.** Round 3's named faults are fixed:

- WU, IMC, Webster, KHiO, MODUL, BCB, Constructor, AUC, UCU and RCSI all read
  correctly.
- Every strip has 8 tiles. No Apply-by tile is dropped.
- "Starts" comes from records: 467 pages read "Autumn 2027", and none read an
  invented "September".
- The card chips match their pages: I checked 1,632 chips and found 0
  mismatches.

Of the 466 dated tiles, 456 trace to a date the school or programme owns, and
the other 10 to a route date the school is governed by. I found no non-EU,
housing, discount or Diploma-holders-only date used as Apply by.

**The fault now lives where the rule cannot see it: deadlines written in the
programme's own text.** The tile takes the school's general closing date, and
the programme's own line on the same page names a different date.

- **Eleven of these tiles are later than the programme's real deadline.**
  - The brief fails a round on one wrong deadline.
  - The worst is **Hanze Physiotherapy**. The tile, the panel ("Hard
    deadline") and the card on every sibling page say **15 August 2027**.
    Twelve lines lower, "What you need" says "selective: apply by 15
    January".
  - A student who trusts the strip misses the programme by seven months.
- **Nine more tiles are earlier than the real deadline** (TU/e). They close a
  door that is still open.

### The deadline faults, by page (all from my pass; every one contradicts its own record)

**Tiles later than the programme's own deadline: a student following them misses the programme (11 pages).**

| Page | Tile says | The record says (same page, "What you need") |
|---|---|---|
| Hanze Physiotherapy | 15 August 2027 | "selective: apply by 15 January", then tests in February |
| Hanze Classical Music | 15 August 2027 | audition, "apply by 1 March in 2026, 2027 date not yet published" |
| Hanze Jazz | 15 August 2027 | "apply by 1 March in 2026, 2027 date not yet published" |
| Hanze Design | 15 August 2027 | "portfolio due 1 June in 2026, 2027 date not yet published" |
| Hanze Popular Culture | 15 August 2027 | Minerva portfolio; "2027 admission dates not yet published" |
| Hanze Sport Studies (random sample) | 15 August 2027 | "Apply by 15 June" |
| Hanze Mechanical Engineering | 15 August 2027 | "EU applicants apply by 1 July" |
| Fontys Circus and Performance Art | 1 June 2027 | "two videos by 5 April 2027"; Studielink date "still reads 1 April" |
| Fontys Music (Conservatory Tilburg) | 1 June 2027 | "upload by 1 March 2027 … or 1 May 2027" |
| Nord Acting and Artistic Production | 15 April 2027 (provisional) | audition; "2026 criteria: apply by 15 March" |
| HSRW Information and Communication Design | 15 July 2027 | "needs a passed portfolio assessment … (last ran 29 Jan–15 Mar)" |

Two things make this worse:

- **The panel label on the Fontys pages says it outright.** It reads "Apply by
  1 June … arts programmes are earlier", and the tile then gives 1 June to
  the arts programmes.
- **Every Hanze page leads "Before you apply" with the Conservatoire/Minerva
  note.** That is 17 pages, including Applied Computer Science and
  Physiotherapy. The one page that needed that caution (Classical Music)
  gets it with a wrong tile above it. Physiotherapy's own caution (apply by
  15 January) is not in the box at all.

**Tiles earlier than the real deadline: the page closes doors that are open (9 pages, plus 16 softer cases).**

- **TU/e: Applied Mathematics, Applied Physics, Automotive, Data Science,
  Electrical Engineering, Industrial Design, Industrial Engineering,
  Psychology & Technology, Sustainable Innovation.**
  - Each reads "Apply by 15 January 2027".
  - The school record has two dates: 15 January for "Selection programmes"
    and 1 May for "All other programmes". The record marks only four
    programmes as numerus fixus, so these nine are 1 May.
  - Leiden and RUG avoid this because their labels name the programmes. TU/e's
    label does not, so `deadlineOf` takes the first `closes`. This is round
    3's "earliest closes wins" fault, surviving where labels are not
    specific.
  - The panel shows both dates. The tile shows the wrong one.
- **Haaga-Helia (6) and TAMK (9).** Both read "21 January 2027".
  - The records have a later reader route with no note on the tile:
    - Haaga-Helia's rolling admission runs to 12 May, and "predicted grades
      count".
    - TAMK's rolling admission closes 28 February.
  - At minimum, the tile's note should carry the rolling route, the way MCI
    shows "Deadline 1 of 4".
- **NHH.** It reads "15 February 2027" (Søknadsweb). But NHH says students
  with Danish/Norwegian/Swedish A should apply through Samordna by 15 April.
  That covers most readers at a school in Denmark.

**A tile the page itself says does not apply (2 pages).**

- **UAntwerp Social-Economic Sciences and Urban Sustainability Studies** read
  "Apply by 31 May 2027".
- The label of that date is "Admission application, **if you must file
  one**". "Before you apply", directly below, says: "With an IB and no visa
  needed, you skip the admission application and enrol directly from July."
- On Urban Sustainability, "What you need" adds a third story: "apply on the
  YUFE Virtual Campus … 2027 deadlines not yet published".
- One screen gives three answers, and the tile's answer is the one the page
  rules out.

**A panel that contradicts its tile, or another programme's steps leading the panel.**

- **THUAS (13) and WUR (8).**
  - The tile reads "Not published yet · 2026: 31 July" (WUR: 15 June).
  - The third item in the panel is "1 May 2027, 23:59 · Applications close
    for everything else", from the Studielink route.
  - It is badged "Equal consideration", but the words say applications
    close. A student cannot tell which date is theirs.
- **RUG (32 non-numerus-fixus pages).**
  - The first item in the Deadlines panel is "15 February 2027 · Numerus
    fixus: personal details verified in Studielink · Hard deadline". The
    panel also shows "15 July · Numerus fixus: final IB results … due". This
    is on American Studies and Industrial Engineering (shot `19` shows it).
  - Two of the three leading items belong to other programmes.
- **All German pages (60), including Constructor, BCB, WHU and Frankfurt
  School.** They carry "1 March 2027 · Start the uni-assist preliminary
  review". Those private schools apply through their own portals, and the
  record says so ("Apply via: Constructor's own application portal"). This
  is a step, not a deadline, but it sends students to pay for something they
  do not need.
- **29 Belgian pages have an empty Deadlines panel: no status line, no dates,
  only "Every date in Belgium"** (Howest 5, KdG 4, KU Leuven 7, Odisee 1,
  Thomas More 9, UCLouvain 1, ULB 2). `fixes.md` says "the dates panel opens
  on the tile's words whenever there is no date". That is true in every
  other country and false here (shot `22`). The tile is honest now. The
  panel beside it is empty.

**Gaps that should be marked, not filled.**

- **RCSI Medicine** needs HPAT-Ireland ("HPAT-Ireland in your year of
  entry"). No HPAT registration date is in the record or on the page. That
  registration runs before CAO's 1 February, so it is the date a medicine
  applicant most needs. It should be marked as a known gap.
- **Rotterdam UAS Fine Art and Graphic Design** read "Not recorded yet". Their
  own line says "2027 round deadlines not yet published", which should read
  "Not published yet".
- **JKU Transformation Studies** reads "No 2027 date out yet". The record says
  the admission procedure is in "January–February 2027", and that belongs in
  the note.

### Art direction

- **The phone hero breaks on long credits.**
  - Five phone heroes shot, five collisions: LTU Music, TAMK Environmental
    Engineering, GU Crafting Futures, JU Industrial Engineering and UAntwerp.
  - The lede prints on top of the photo credit, and the credit starts at x=0
    with no gutter.
  - 42 pages have a credit over 55 characters (GU 11, Fontys 10, TAMK 9, JU 7,
    LTU 4, UCLouvain 1). Long titles make it worse. This is the first thing a
    student sees on a phone.
- **TAMK's 9 credits read "No machine-readable author provided. Qz10 assumed
  (based on copyright claims). · Public domain".** That is raw Wikimedia
  metadata on a student page.
- **68 pages have no photograph** (Hanze 17, Thomas More 9, MODUL 7, EUBS 7,
  Haaga-Helia 6, Howest 5, LUNEX 5, KdG 4, Vesalius 3, SSE 2, UCF, LHI, NHH).
  - **The fallback is acceptable.** The ruled, field-edged hero is honest,
    calm and legible in both themes.
  - **At 1280 it is flat.** A three-line title sits in the left 40%, over
    empty ruled paper (MODUL, Hanze).
  - **At 390 it reads fine.** On a phone I would not block on it.
  - What makes these pages weak is that the fallback coincides with thin
    records. LUNEX Nutrition has no photo, "Apply by: Not recorded yet" and
    "Admission: Not recorded yet". That reads as a form, not a place.
- **Borrowed campus photos are captioned honestly** ("GU's Gothenburg campus",
  "THUAS's The Hague campus", "LTU's Luleå campus"). But a Göteborgs
  universitet façade over a craft school in Dals Långed, 170 km away, is not
  "a place worth going". It works as a stopgap, not as art direction.
- **Broken lede on 4 pages: "A 3½-year computing degree in Online."** These
  are Laurea (2), Constructor Applied Computer Science and SU Earth Science
  Distance Learning.
- **"What you need" holds text that is not a requirement.**
  - Examples:
    - Webster: "Austrian BSc and a US degree … emphases in entrepreneurship";
    - Constructor Applied CS: "Taught entirely online, from home";
    - TU/e Automotive: "Formally part of Electrical Engineering".
  - This is round 3's bug 11 again, across other schools.
- **Researcher phrasing is still in labels and notes.**
  - "(yearly date)" appears in MODUL, Nord, Vesalius and UiS panel labels.
  - LUT's Admission box ends "Table headed 2026."
  - LUT's Admission tile reads "First come, first served / First come, first
    served · 70 places".
- **"Before you apply" leads with another programme's note.**
  - 17 Hanze pages lead with the Conservatoire note.
  - 16 Leiden pages lead with LUC housing in The Hague, including Linguistics
    and Philosophy in Leiden.
  - The block was meant to carry the one sentence that changes the decision.

### What works

- **Round 3's named failures are fixed, visibly, and the fixes propagate.**
  - WU BBE: "Not published yet · 2026: register 2 March–19 May; exam 30
    June".
  - IMC: "2026: 15 April".
  - MODUL: "15 August 2027 · €2,000 off by 15 Jan", with no Hard-deadline
    badge on the discounts.
  - RCSI: 1 February.
  - Constructor: "15 July · Early Action by 1 Feb".
  - GU Metal Art: "After your Diploma", "Autumn 2028 at the earliest".
  - LTU Music: "Not open yet". Its "Before you apply" is the best sentence
    on the site: "as a May 2027 IB candidate you cannot apply yet".
- **Honest gaps.** Status tiles appear on 105 pages, each with a reason, and
  the notes give last year's date only as the record words it.
- **The panel's first item and the tile agree everywhere outside Belgium**,
  THUAS/WUR aside.
- **Photo pages at 1280 look like places**: Aalto, KTH, WU, RUG, Leiden,
  NCAD, Constructor, Frankfurt School.
- **Dark mode holds** on every shot I took.

## The three changes that would raise it most

1. **Make a programme's own deadline text beat the school's general date,
   and guard it across all 571 pages.**
   - Give each of these programmes the date its own line states, as
     structured data:
     - Hanze Physiotherapy: `closes: 2027-01-15`.
     - Hanze Sport Studies: 2027-06-15.
     - Hanze Mechanical Engineering: 2027-07-01.
     - Hanze Classical Music and Jazz: `lastYear` "2026: 1 March (audition)".
     - Hanze Design: `lastYear` "2026: portfolio 1 June".
     - Hanze Popular Culture: `ownDeadline`, "Not published yet".
     - Fontys Circus: `closes: 2027-04-01` (Studielink; videos by 5 April).
     - Fontys Music: `closes: 2027-03-01`, with the note "or 1 May".
     - Nord Acting: `lastYear` "2026: 15 March (audition)".
     - HSRW ICD: `lastYear` "2026 portfolio: 29 Jan–15 Mar".
   - Then add the guard I ran:
     - **Which lines it reads:** each programme's `ib` / `selectionNote` /
       `needs` text.
     - **What it fails:** a line that contains "apply by / deadline /
       audition / portfolio / videos by + a date" earlier than the dated
       tile.
     - **Allowlist:** an exception is allowed only when the record says why.
   - It finds all eleven in under a second. Any label with "earlier", "arts
     programmes" or "audition" on a school-wide date should also fail unless
     the programme is scoped.
2. **When a school has more than one reader deadline, pick by scope, never by
   order.**
   - Scope TU/e's 15 January to its four selection programmes (a
     `programmes:` list, as GU and UmU already use), so the other nine read 1
     May.
   - Add the later rolling route to the tile note at Haaga-Helia ("Rolling to
     12 May") and TAMK ("Rolling to 28 Feb"). Add NHH's Samordna 15 April
     ("With Danish A: 15 April").
   - Drop the UAntwerp "if you must file one" date from the tile. The
     reader's Apply-by is "No application needed · enrol from July" (the
     `noDeadline` mechanism). Urban Sustainability becomes "Not published yet
     (YUFE)".
   - Mark numerus-fixus-only route and school dates `numerusFixusOnly`, so
     they leave the 32 RUG panels.
   - Relabel THUAS/WUR's Studielink 1 May as "Apply by 1 May to keep your
     right to a matching", or keep it off pages whose own date is later.
   - Scope the uni-assist step to schools that use uni-assist.
   - Give the 29 Belgian panels the status line every other country has.
3. **Fix the phone hero and the text students see first.**
   - Reserve the credit its own line under the lede in the phone hero, or
     move long credits below the hero. The lede must never overlap it, and
     it keeps the 16 px gutter.
   - Replace TAMK's Wikimedia placeholder credit with a real attribution, or
     drop the photo.
   - Write "online" ledes as "An online … degree".
   - Make "Before you apply" pick only notes about this programme. A note
     that names another programme or campus (Conservatoire, LUC) must not
     lead.
   - Move non-requirement `ib` text to `about`.
   - Strip "(yearly date)" and "Table headed 2026" from student-facing text.
   - Then start the photo round (#48 or #54) for Hanze (17) first. Its pages
     are the ones where no photo and a wrong date coincide.

## Is it better than what is live now?

**Better than live for about 540 of the 571 pages, and worse than live for
the eleven late-deadline pages.**

- **What main does now.** The school page links out to the university, and
  the student finds the deadline on the university's own site. That is slow,
  but it is not wrong.
- **What this branch adds.** For most programmes it adds a correct,
  sourced date, an honest status where none exists, and the caution that
  matters (LTU, UmU, KTH, IMC, WU).
- **Where it is worse.** On Hanze Physiotherapy it replaces "go and look"
  with a confident, badged date seven months too late. That is worse than
  the link-out.

**Would any page mislead a student? Yes.** At least eleven pages, listed
above, would make a final-year student miss the programme's real deadline:

- Hanze Physiotherapy, Classical Music, Jazz, Design, Popular Culture, Sport
  Studies and Mechanical Engineering;
- Fontys Circus and Music;
- Nord Acting;
- HSRW Information and Communication Design.

Nine TU/e pages and two UAntwerp pages would tell a student a door is closed,
or has a deadline, when by the record it does not. Do not ship until change 1
is done. Changes 2 and 3 are what separate a 6 from an 8.
