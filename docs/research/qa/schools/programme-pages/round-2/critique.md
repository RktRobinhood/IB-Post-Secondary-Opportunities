# Programme pages from school records (#43): art director, round 2

Under review: `/universities/<school>/<programme>/`, built by `src/pages/school-programme.mjs`.
I also checked it as an admissions counsellor would. Round 1 scored 6/10
(`../../programme-pages-round-1.md`). The fixes are listed in `fixes.md`.

I looked at all 16 shots in `shots/`, cut into full-resolution slices. I also
built and shot five more pages at 1280 and 390 px, light and dark. Those shots
are in the session scratchpad, not the repo: LiU Biomedicine (phone), UmU
Industrial Design (phone), TUM Aerospace, Radboud AI (phone) and the Danish
benchmark. I read every page against its record in `data/schools/*.json`.

## Score: 6/10. Not accepted.

Visually this round is a clear step up. Every page now opens on a photograph.
The facts strip fits its tiles. The maths chip says what the record says. TUM
Aerospace's deadline is now right. Enriched pages (Aalto, NCAD) say each thing
once and end on three sibling cards. At a glance the Aalto page is close to the
Danish standard.

The score stays at 6 because the round-1 fault is still here, in a smaller
set of pages: **dates that are not this student's, shown as if they were.**
Three of the ten pages I checked would mislead a final-year IB student about
when or whether they can apply. The record has the right answer each time, but
the page drops it:

- **UmU Industrial Design says "Apply by 15 January 2027" and nothing else**
  (`09`, and my phone shot). The record's own note says a May IB candidate
  must "prove entry by 21 June 2027. May IB results come in early July, so ask
  UmU first". So a student can apply, pass the portfolio round and still be
  unable to take the place. That note is not on the page. The dates panel also
  marks the round's opening, "16 October 2026 · First admissions round opens",
  **Diploma holders only**, although this is the one programme where the page
  tells you to apply in that round.
- **GU Metal Art's dates panel leads with three "Hard deadline" dates from the
  April round**: 23 April, 5 July and 16 July (`07`, `08`). The record says
  this programme runs only in January. On a phone these are the first dated
  things under the strip. The dates that really belong to this programme
  (16 Oct to 15 Jan) are hidden under "8 more". `fixes.md` left this for the
  critic to judge. It is a fail.
- **Radboud AI's "Apply by 1 May 2027" is the SSH& housing lottery date.**
  The record's EU/EEA application deadline is 1 July (`10`, and my phone
  shot). The panel also puts the **non-EU/EEA** deadline (1 April) first, on a
  site whose readers are EU/EEA citizens. An early date does less harm than a
  late one, but the tile names something the record does not call a deadline.

There is one cause behind all three, and behind a set of smaller gaps: **the
page never shows the school record's `notes`**. That is where the researchers
wrote the answers that matter to a student:

- LiU: "you cannot apply yet; in 2026 it also ran an April round".
- KTH: "10% of eligible applicants admitted".
- Radboud: binding study advice.
- NCAD: "late applications are not accepted".
- GU: the craft BFAs are 170 km from Gothenburg, and Metal Art takes six to
  eight students.
- UmU: "ask UmU first".

The programme page reads the dates and drops the sentences that qualify them.

The "Diploma holders only" tile is also ambiguous. It covers two different
facts with the same words and the note "No round for final-year IB students
recorded":

- LiU and UmU Life Science: **not published yet** (there was an April round in 2026).
- GU Metal Art and the music BFAs: **never, until you hold the Diploma**.

"Recorded" makes both sound like a data gap. A student cannot tell "wait until
March" from "this is a gap-year option".

The art direction is better, but not done:

- **Single-programme schools still leave an empty column.** KTH and LiU have
  roughly 900 px of blank paper beside the aside at 1280 (`03`, `05`, `06`).
  There are also two identical "Open on kth.se" buttons one scroll apart.
  Sibling cards fill the column on multi-programme schools, but with no
  siblings nothing fills it.
- **Official names are set as display type.** "Bachelor´s Programme in
  Experimental and Industrial Biomedicine" fills five lines of the hero at
  1280. On a phone it also needs a three-line breadcrumb (`05`, LiU phone).
  The record has an acute accent (´) where the apostrophe should be, and it
  ships as is. "Bachelor Programme in Industrial Design" and "BFA Programme in
  Metal Art" repeat what the eyebrow already says (BFA).
- **The photograph is the school's, and it is the same on every programme.**
  Paging through NCAD with prev/next gives the same crop of the same façade on
  every page. On GU Metal Art the hero shows Gothenburg's main building over
  the line "a design degree in Dals Långed". The record says that campus is
  170 km away. The photograph tells the student the wrong place.
- **Place names lose their letters:** "Linkoping", "Umea" (from
  `data/countries/se.json` and `data/places/`). On the UmU page, the card
  below says "Umeå".

## The three changes that would raise it most

### 1. Scope every date on the page to this programme and this reader, and say why when there is no date for them

Most of the fix is one rule in `datesPanel`/`keepFor` plus data scoping:

- **Other rounds drop out.** When a programme's `closes` is in a named round
  (`roundOf()` already exists), drop the school's dates from other rounds.
  GU Metal Art, Opera, the music and craft BFAs then lose the April-round
  steps. In the data, give GU's April-round dates a
  `programmes: [four slugs]` scope, as UmU's already do in their labels.
- **The Diploma flag is per programme.** A school date flagged
  `forDiplomaHolders` must not get the badge on a programme whose own `closes`
  is in that round and is *not* flagged. On UmU Industrial Design, the opening
  then reads "16 October 2026 · Applications open", with no badge.
- **Other audiences drop out.** `who: 'non-eu'` dates leave the panel, as
  they already leave the tile (`READER`). Radboud's panel then starts on 1 May.
- **Apply by is an application date only.** Rank a label that says
  "application deadline" or "final application" ahead of any other `closes`.
  Put housing, fee and lottery dates in the tile's note. Radboud then reads
  "Apply by 1 July 2027", note "1 May to join the housing lottery". The better
  fix is a record field `kind: 'closes'` versus `kind: 'housing'`. Add a guard
  case to rule 6.
- **The "Diploma holders only" tile says which case it is, in one line from
  the record:**
  - No reader round published yet (LiU, LTU, UmU Life Science and Business):
    "Apply by: **Not open yet**", note "No 2027 round for May IB candidates
    published; there was an April round in 2026". Show the 2026 clause only
    where the record says so.
  - The programme's only round is for Diploma holders (GU music and craft):
    "Apply by: **After your Diploma**", note "Runs only in the January round,
    which needs the Diploma in hand".
  - In both cases the dates panel opens on that same line, and the flagged
    dates stay under "All dates". It must not lead with three struck-through
    options.

### 2. Put the record's notes on the page: one line up top, the rest one tap down

- Add a **"Before you apply"** block directly under the facts strip, above
  "What you need". It sits on every phone before the dates panel and in the
  main column on desktop. Style it like the aside's "Always verify" note.
- It shows **one** line: the first school `note` that names this programme,
  else the first that names no other programme of the school. "N more things"
  opens the rest. This is the school page's "Worth knowing" pattern, filtered.
  - UmU Industrial Design: "Apply in January, then prove entry by 21 June
    2027. May IB results come in early July, so ask UmU first." Set it as a
    **warn** note, not plain text, because it changes whether to apply.
  - LiU: "LiU lists only a January round for 2027, so you cannot apply yet."
  - NCAD: "List studio courses on CAO by 1 February; late applications are
    not accepted."
  - Radboud: the binding study advice line.
  - KTH: "Highly competitive: 10% of eligible applicants admitted in 2024."
- **Stop saying "Admission: Not recorded yet" when the page itself says how
  places are decided.** On TUM ("Ranked on grades; some interviewed") and UmU
  ("work samples … interview … about 15 places"), the tile contradicts the card
  under it. Two options:
  - Structure those records (`selection: ['grades','interview']`,
    `['portfolio','interview']`, `places: 15`). This is the right fix.
  - Or, when `p.ib` mentions ranking or selection, show "Admission: See what
    you need" rather than "Not recorded yet".
- The same goes for **NCAD's missing tiles**. With no Apply-by and no fee, the
  strip has 6 tiles and silently drops the two a student acts on. Show
  "Apply by 1 February 2027" from the CAO route: tie `ie-cao-2027`'s closing
  date to NCAD through `institutions`, since NCAD's note makes it binding. Show
  "EU/EEA fee: Not recorded yet", as the Admission tile already does for a gap.

### 3. Make sparse and long-named pages look chosen

- **Title.** Set a display title that drops the degree-type prefix the
  eyebrow already carries. Strip a leading `Bachelor(´|')?s? (of \w+ )?(Programme|Program) in`,
  `BFA Programme in`, `Bachelor of Fine Arts in` and `Bachelor of Science
  Programme in`:
  - "Experimental and Industrial Biomedicine" (2 lines, not 5)
  - "Industrial Design"
  - "Metal Art"

  Keep the full official name on one line in the aside as "Official name". Fix
  `´` → `'` in `se-liu.json`, and add a check for `´` in names.
- **Empty column.** When a school has no siblings (KTH, LiU, and every
  one-programme school), fill "More at <school>" with **"More <field> in
  <country>"**: 3 cards from other schools in the same country and `field`,
  using the same `programmeCard`. KTH ICT gets Swedish computing degrees and
  LiU gets Swedish sciences. This is the brief's "possibilities first", and it
  removes about 900 px of blank paper at 1280.
- **One "Open on" button.** Drop the in-column "Open on …" button when the
  close band follows. On sparse pages the close band is enough, or keep the
  in-column one and drop the band.
- **Photograph.** Where the programme has its own `city` that differs from
  the school's (GU's Steneby BFAs in Dals Långed, TUM Straubing), do not show
  the main-campus photo. Use the place's photo from `data/places/`, or the
  field-coloured panel hero from round 1's fallback. The credit line must
  never sit under the wrong town.
- **Diacritics.** Restore "Linköping" and "Umeå" in `data/countries/se.json`
  and `data/places/se-*.json`. The Where tile and the lede read from there.

## Bugs

| # | What | Where | Shot |
|---|---|---|---|
| 1 | Dates panel leads with three April-round "Hard deadline" dates for a programme that runs only in January | GU Metal Art (and the other GU music and craft pages) | `07`, `08` |
| 2 | The record's "prove entry by 21 June; results come early July; ask UmU first" is missing. The round's opening date is badged "Diploma holders only" on the one programme told to apply in that round | UmU Industrial Design | `09`, phone |
| 3 | "Apply by 1 May 2027" is the housing lottery date; the record's EU/EEA deadline is 1 July | Radboud AI | `10`, phone |
| 4 | Dates panel leads with the non-EU/EEA deadline | Radboud AI | `10` |
| 5 | "Diploma holders only / No round … recorded" covers both "not published yet" and "never before the Diploma" | LiU, GU Metal Art | `05`, `07` |
| 6 | The LiU dates panel leads with three Diploma-holder dates, two of them the same 16 Oct opening (national route plus school) | LiU Biomedicine | `05`, `06` |
| 7 | "Admission: Not recorded yet" beside a requirement card that describes the selection | TUM Aerospace, UmU Industrial Design, GU Metal Art | `09`, `07`, TUM shot |
| 8 | No Apply-by tile and no fee tile; the strip drops to 6 tiles | NCAD Fashion and Product Design | `11`, `13` |
| 9 | About 900 px of empty main column beside the aside | KTH ICT, LiU Biomedicine (desktop) | `03`, `05`, `06` |
| 10 | Two "Open on …" buttons a scroll apart | Every bare page (KTH, LiU, GU, UmU, Radboud) | `03`, `04` |
| 11 | Five-line hero title; `´` for an apostrophe; three-line breadcrumb on a phone, with a stray leading "/" on the second line | LiU | `05`, LiU phone, `04` (KTH) |
| 12 | "Linkoping", "Umea" lose their diacritics, next to "Umeå" in the card below | LiU, UmU | `05`, `09` |
| 13 | A main-campus photo over a programme taught 170 km away | GU Metal Art (Dals Långed) | `07`, `08` |
| 14 | Status chips in "More at …" sibling cards sit about 24 px right of the card text ("Diploma holders only", "Apply by 15 Apr 2027") | GU Metal Art, UmU Industrial Design | `07`, `09` |
| 15 | About 100 px of empty paper between the close band and the footer on a school with no pager (round-1 bug 12, still there) | KTH ICT | `03`, `04` |
| 16 | "Master of Architecture (5-year programme) · 5 yrs" says the length twice | UmU sibling card | `09` |
| 17 | The Apply-via tile clips to "Universityadmissions" at 390 px (school page) | GU school, phone | `16` |

Not scored, but seen:
- The Danish benchmark's hero image fails to load on a local build. Its alt
  text shows at the top left over a grey hero.
- The GU school page lists the seven "Diploma holders only" cards before the
  four a final-year student can apply to (`15`, `16`). Possibilities first
  means those four should lead.

## What works

- **A photograph opens every page.** The compact hero, eyebrow and one-line
  lede ("A three-year computing degree in Espoo.") read like a place worth
  going. Dark mode holds everywhere (`06`).
- **The strip is disciplined.** It has 8 tiles in a 4×2 grid on desktop and
  2 columns on a phone, with no filler cells. The cut-off reads "143.7 of
  172.1" with "2026 · not a prediction · 30 places" as its note. Fee
  parentheticals are notes.
- **The maths chip is right:** "Maths AA (SL or HL) or AI HL · minimum 6".
- **Deadlines are right where the model covers them.** TUM Aerospace reads 15
  July, KTH reads the April round, and Aalto reads its own 22 January. The
  deadline guard (rule 7 in `test-school-pages.mjs`) is the right kind of
  protection.
- **Sibling cards and prev/next** give every multi-programme page a way on.
  The "The programme →" foot on school cards fixes round-1 change 8.
- **NCAD reads well now.** The course code is in the aside, `about` says what
  the degree is, and no other programme's add-on appears.

## Summary

1. **6/10, not accepted.** The pages look much better: photos, a clean strip,
   one-line ledes, sibling cards.
2. Three of the ten pages still show dates that are not this student's:
   - GU Metal Art leads with another round's deadlines.
   - UmU Industrial Design hides the record's "ask UmU first" warning.
   - Radboud's Apply-by is a housing date.
3. The common cause: the page never shows the record's `notes`. That is where
   the caveats live.
4. The ranked fixes:
   - Scope dates to this programme, round and reader, and split "Diploma
     holders only" into "Not open yet" and "After your Diploma".
   - Add a one-line "Before you apply" note from the record.
   - Shorten display titles and fill the empty column of single-programme
     pages with same-field programmes in that country.
