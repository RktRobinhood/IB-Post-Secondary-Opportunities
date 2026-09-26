# Programme pages from school records (#43): fixes before round 5

Round 4 scored **5/10** (`../round-4/critique.md`). The verdict: about 540 of
571 pages are better than what is live now. Eleven pages showed a confident
Apply-by later than the programme's own deadline, which is worse than the
link-out on `main`. This round is the last scored round. Its aim is that
**no page misleads**.

**Gate:** `SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs`,
**all 38 checks pass**.

**Does any page still show an Apply-by later than a date in its own text?
No.** Rule 11 of `scripts/test-school-pages.mjs` reads every dated tile.
- **Pages checked:** 458 dated tiles; the other 113 pages say why there is no
  date.
- **Text read:** each programme's `ib`, `selectionNote`, `about`,
  `closesNote`, its `needs` notes, and the school notes that name it.
- **Rule:** it fails any deadline-worded date in that text that is earlier
  than the tile.
- **Result:** none fails.
- **Allowed exceptions:** three, each with its reason, in
  `scripts/lib/own-deadline-allow.json`. They are Fontys "apply before 15
  November", which is for the February start; the tiles are for September.

## 1. The eleven programmes: their own deadline, as their own line states it

| Page | Round 4 tile | Now | From its own line |
|---|---|---|---|
| Hanze Physiotherapy | 15 Aug 2027 | **15 January 2027** (`closes`) | "selective: apply by 15 January" |
| Hanze Classical Music | 15 Aug 2027 | **Not published yet · 2026: 1 March (audition)** (`ownDeadline`, `lastYear`) | "apply by 1 March in 2026, 2027 date not yet published" |
| Hanze Jazz | 15 Aug 2027 | **Not published yet · 2026: 1 March (audition)** | same |
| Hanze Design | 15 Aug 2027 | **Not published yet · 2026: portfolio 1 June** | "portfolio due 1 June in 2026" |
| Hanze Popular Culture | 15 Aug 2027 | **Not published yet** (`ownDeadline`) | "2027 admission dates not yet published" |
| Hanze Sport Studies | 15 Aug 2027 | **15 June 2027** | "Apply by 15 June" |
| Hanze Mechanical Engineering | 15 Aug 2027 | **1 July 2027** | "EU applicants apply by 1 July" |
| Fontys Circus and Performance Art | 1 Jun 2027 | **1 April 2027 · Videos by 5 April; the page still shows 2026** (`closes`, new `closesNote`) | "two videos by 5 April 2027 … Studielink deadline still reads 1 April 2026" |
| Fontys Music | 1 Jun 2027 | **1 March 2027 · A second upload round closes 1 May** | "upload by 1 March 2027 … or 1 May 2027" |
| Nord Acting | 15 Apr 2027 | **Not published yet · 2026: 15 March (audition)** | "2026 criteria: apply by 15 March" |
| HSRW Information and Communication Design | 15 Jul 2027 | **Not published yet · 2026: portfolio 29 Jan–15 Mar** | "last ran 29 Jan–15 Mar" |

**How the model supports these:**
- **`ownDeadline` on a programme** takes the school's general `closes` dates off
  its page, and the route's binding dates too (even one naming the school). So
  the Hanze art and music pages no longer show "15 August · General
  application deadline" in their panel, and Nord Acting no longer shows 15
  April.
- **`closesNote`** (programme, new) carries what the programme's own line adds
  to its date, as the tile's note. It also marks a known gap: RCSI Medicine
  reads "1 February 2027 · HPAT-Ireland registration date not recorded".

**The guard (rule 11)**, with a self-test on Hanze Physiotherapy.

What it reads:
- dates after "apply by", "deadline", "due", "upload", "video(s)",
  "portfolio", "audition", "register", "submit", "closes" or "by";
- a date with no year, or with last year's spring date, is read as this
  cycle's same day.

What it skips:
- the start of a range ("2 March to 19 May");
- an opening ("from 1 October").

It also fails a tile taken from a school-wide date whose label says "earlier",
"arts programmes" or "audition", when the programme's own text auditions or
takes a portfolio and it has no own date. That is the Fontys "arts programmes
are earlier" case.

Popular Culture has no date in its text, so the guard cannot see it; its tile
is fixed in data. A regression there would not be caught by this rule.

## 2. Several deadlines per school, chosen by scope

- **TU/e.** "Selection programmes: … 15 January" is now scoped (`programmes`)
  to its four selection programmes. The other nine read **1 May 2027** (`12`).
- **RUG.** The three numerus-fixus steps (personal details, ranking numbers,
  final IB results) are scoped to International Business and Psychology. The
  other 32 panels open on Studielink, the account and 1 May (`13`).
- **Haaga-Helia (6) and TAMK (9).** The rolling routes carry a `short` name,
  and a later closing date with one goes in the tile's note:
  - Haaga-Helia: "21 January 2027 · Rolling admission: by 12 May";
  - TAMK: "… by 28 Feb".
- **NHH.** "15 February 2027 · With Danish, Norwegian or Swedish A: by 15
  Apr".
- **UAntwerp.** The record's note ("With an IB and no visa needed, you skip
  the admission application and enrol directly from July") is now its
  `noDeadline`. `noDeadline` now wins over dates meant for others, so Social-
  Economic Sciences reads **"No deadline · No application needed with an IB:
  enrol from July"** (`14`). Urban Sustainability Studies (YUFE) reads "Not
  published yet" (`ownDeadline`).
- **THUAS and WUR.** Studielink's 1 May is relabelled in the words of its own
  note: "Last day to keep your right to a place (programmes without
  selection)". It no longer reads as a closing date against the tiles' "Not
  published yet · 2026: 31 July" or "15 June".
- **uni-assist.** New route field `via: "uni-assist"` (milestone and profile
  deadline). The step reaches only schools whose record says they apply
  through it (`apply.via` names it, and not as "no uni-assist").
  - It is now on TUM, HSRW and FU Berlin.
  - It is off Constructor, BCB, WHU, Frankfurt School, Leuphana and UCF.
- **Belgium.** A dates panel with no dates now still opens on the tile's line.
  31 of 38 Belgian pages carry the status line; the other 7 have a date
  (`15`).
- **Gaps said as records say them.**
  - Rotterdam UAS Fine Art and Graphic Design now read "Not published yet"
    ("2027 round deadlines not yet published").
  - JKU Transformation Studies reads "Not published yet · 2027: admission
    procedure in January–February".

## 3. Phone hero and the first text a student reads

- **Photo credit.** On a phone, the credit sits on its own line under the
  lede, inside the 16 px gutter, and never runs under the words (`17`–`20`).
- **TAMK's credit.** Commons' placeholder ("No machine-readable author
  provided. Qz10 assumed …") now reads **"Qz10 · Public domain"**. This is
  `creditName()` in `src/lib/data.mjs`, which uses the name the record itself
  assumes.
- **Online degrees.** Ledes now read "An online three-year … degree." They
  used to end "in Online." (Laurea, Constructor, SU Earth Science).
- **"Before you apply".**
  - `notesFor()` now leaves out a note about another named part of the school
    (a College, Academy, Conservatoire, Campus or Institute that is not this
    programme's). A caution then leads.
  - The Hanze Conservatoire/Minerva note now reaches only Classical Music,
    Jazz and Design, whose own lines name them. It no longer reaches
    Physiotherapy or Applied Computer Science.
  - The LUC housing note reaches no Leiden programme outside LUC.
  - RCSI's Medicine note stays off Pharmacy (round 4).
- **"What you need" holds requirements only.** Non-requirement text moved to
  `about` for Webster Business Administration and TU/e Automotive and Data
  Science. It was dropped for Constructor Applied CS, whose lede now says
  online.
- **Researcher phrasing.**
  - "(yearly date)" is no longer printed in panel labels; the line already
    says "provisional".
  - LUT's "Table headed 2026." now reads "2026 criteria."
  - LUT's Admission tile no longer repeats "First come, first served" as its
    own note.

## Not done, and why

- **Photographs** for Hanze (17) and the other 50 ruled-hero pages. Web access
  is blocked, and none is approved in the repository. They are unchanged from
  round 4. This needs the photo round (#48 or #54).
- **Radboud AI's faculty** (round-4 bug 20): not in the record.
- **"What you need" across every record.** Only the cases the critic named
  were moved. A full sweep of `ib` lines for non-requirement text is left for
  a data pass.
- **Edits kept small in #52's areas**, because another agent is editing them:
  `families.mjs`, the Paths table and `src/pages/schools.mjs` are untouched
  this round.

## Screenshots (`shots/`)

Built with no `SITE_BASE` and served on :4431. Shot with
`docs/research/qa/schools/shoot.mjs`. All files are under 400 kB.

| File | Page |
|---|---|
| `01` hanze-physiotherapy (desktop), `16` (phone) | `/universities/nl-hanze/physiotherapy/`: 15 January 2027 |
| `02` hanze-classical-music | `/universities/nl-hanze/classical-music/` |
| `03` hanze-jazz | `/universities/nl-hanze/jazz/` |
| `04` hanze-design | `/universities/nl-hanze/design/` |
| `05` hanze-popular-culture | `/universities/nl-hanze/popular-culture/` |
| `06` hanze-sport-studies | `/universities/nl-hanze/sport-studies/` |
| `07` hanze-mechanical-engineering | `/universities/nl-hanze/mechanical-engineering/` |
| `08` fontys-circus | `/universities/nl-fontys/circus-and-performance-art/` |
| `09` fontys-music | `/universities/nl-fontys/music-conservatory-of-music-tilburg/` |
| `10` nord-acting | `/universities/no-nord/bachelor-in-acting-and-artistic-production/` |
| `11` hsrw-information-communication-design | `/universities/de-hsrw/information-and-communication-design/` |
| `12` tue-applied-mathematics | `/universities/nl-tu-e/applied-mathematics/`: 1 May 2027 |
| `13` rug-american-studies | `/universities/nl-rug/american-studies/`: no numerus fixus steps |
| `14` uantwerpen-social-economic-sciences | `/universities/be-uantwerpen/social-economic-sciences/`: No deadline |
| `15` howest-cybersecurity | `/universities/be-howest/cybersecurity/`: the Belgian status line |
| `17` phone-hero-tamk-environmental-engineering | the credit on its own line, "Qz10 · Public domain" |
| `18` phone-hero-ltu-music | long title and credit |
| `19`, `20` phone-hero-gu-crafting-futures (light, dark) | the longest credit |
