# Programme pages from school records (#43): art director, round 1

Under review: the new programme pages at `/universities/<key>/<slug>/`
(`src/pages/school-programme.mjs`), and the school-page cards that now open
them. The benchmark is the Danish programme page (`src/pages/programme.mjs`),
`/programmes/dk-sdu-artificial-intelligence-2027-autumn/`.

Built with `SITE_BASE=''`, served from `dist`, shot with
`docs/research/qa/schools/shoot.mjs` at 1280 and 390 px, light and dark:
28 full-page captures in `D:\ibp-tmp\w43\pp-r1\` (crops in `crops\`). I looked
at every one and cut the tall ones into full-resolution slices.

| Page | Why |
|---|---|
| `/universities/fi-aalto/data-science/` | Enriched: needs, selection, cut-off, places |
| `/universities/ie-ncad/fashion-design/` | Enriched: `about` and `selection`, no `needs` |
| `/universities/de-tum/aerospace/` | Un-enriched: name, credential, `ib` line, fee |
| `/universities/nl-radboud/artificial-intelligence/` | Un-enriched |
| `/universities/se-kth/information-and-communication-technology/` | Un-enriched, the school's only programme |
| `/programmes/dk-sdu-artificial-intelligence-2027-autumn/` | The benchmark |
| `/universities/fi-aalto/` | The school page and its cards |

The ten images cited below are in `programme-pages-round-1/`.

## Score: 6/10. Not accepted.

The skeleton is right. The order is the Danish order: eyebrow, facts strip,
dates panel, what you need, how places are decided, what it is, then one
targeted hand-off. On the enriched Aalto page a student gets degree, length,
city, start, apply-by and fee at a glance, and the need is a chip in IB terms.
The hand-off is a real programme page, and prev/next pages through the
school's programmes. That is a good base.

Four things keep it well short of the Danish standard:

- **The apply-by date is wrong on some pages.** It is the first thing a
  student acts on. TUM Aerospace says "Apply by 31 May 2027", which is the
  national *medicine* date for gap-year applicants. TUM's own record says
  15 July 2027 (`03`, `04`). On Radboud AI it says 15 January 2027, the
  numerus fixus date, but nothing in the record says AI is numerus fixus. The
  record's EU/EEA dates are 1 May and 1 July (`05`). Under the brief, one wrong
  deadline fails a round.
- **There is no photograph.** The Danish page opens on a picture. These pages
  open on ruled paper: a title, and on un-enriched pages nothing else.
  Photographs first is the first line of the brief.
- **Sparse pages look unfinished, not intentional.** On TUM, Radboud and KTH at
  desktop, the main column is one requirement card, then about 600 px of empty
  paper beside the aside (`03`, `05`).
- **The enriched page says things twice and shows a local number raw.** The
  lede and "What it is" are the same sentence word for word (Aalto `01`, NCAD
  `07`). The cut-off tile reads "143.7 first-timers, 143.4 others /172.1" over
  three lines of display type (`01`, `06`). The Danish page leads with IB
  points and puts the local figure in the note.

## Changes, ranked

1. **Make "Apply by" and the dates panel this programme's, or say nothing.**
   - `applyBy()` takes the first binding closing date in `datesFor(...)`. That
     includes country-wide dates for other programme groups, such as "Medicine
     group closes…" and "Numerus fixus applications close". Rank the
     programme's own `closes`, then the school record's `closes`
     (`school.dates`), before any country date. Use a country date only when
     the school record has none.
   - Keep dates scoped to a subset (medicine, numerus fixus, `numerusFixusOnly`)
     off pages that are not in that subset. When the record does not say
     whether a programme is in it, leave the date off the strip.
   - A guard: for every school-programme page, the "Apply by" tile must equal a
     date in that school's record or in the programme's `closes`, or be absent.
     No country branch is needed. It is a rule about where the date comes from.
2. **Give every programme page a photograph, as the Danish page has.**
   - Use `hero({ variant: 'compact', image })` with the programme's own picture
     where there is one. Otherwise use the school's picture, the same fallback
     `programme.mjs` already makes through `institutionPicture`.
   - Record this in `STATUS.md`, next to the round-3 card/page ruling, as one
     line: "a programme page may show its school's photo". Allow that pair in
     the `unique-images` guard. Danish programme pages already work this way.
   - If the owner refuses the reuse, the fallback is to tint the panel hero
     with the programme's field colour (`card--fam-*`). The page then at least
     carries the colour of the card the student clicked.
3. **Say each thing once.**
   - When `firstSentence(p.about) === p.about`, skip the "What it is" paragraph.
   - "Degree and length" under it repeats Degree and Length from the strip. The
     only new fact is Field. Move Field into the eyebrow
     ("Aalto · Computing · BSc (Tech) · 3 yrs · Espoo") and drop the topic when
     it would say nothing new.
   - When `about` is longer than one sentence, keep the Danish pattern.
4. **Make the facts strip fit its tiles, and keep every tile to one or two
   lines.**
   - *No filler.* Aalto has 9 tiles in a 7-column `auto-fit` grid. The two
     orphans leave a block of the rule colour across five columns (`01`, `10`).
     On a phone it is the half-cell beside "EU/EEA fee" (`06`), and TUM's phone
     strip has the same filler (`04`). Give `.glance` a paper background so an
     empty track reads as paper, or let the last tile span the rest of its row.
     Better still, hold the strip to 8 tiles: put "30 places" in the cut-off
     tile's note, as the Danish tile does with its intake.
   - *The cut-off.* When there is no `ibPoints`, the tile value is the short
     number, "143.7 of 172.1". The note reads "Aalto scoring table · 2026 · not
     a prediction". The first-timers/others split goes into "The last cut-off"
     disclosure. Do not print a sentence in display type in a fact tile.
   - *Parentheticals in values go to the note.* "€2,771 (2027/28 statutory
     fee)" becomes "€2,771" with the note "2027/28 statutory fee". "Free (€97
     semester fee)" becomes "Free" with the note "€97 semester fee". This is a
     generic split on `value (note)`, not a country rule.
   - *Always show the admission tile.* The Danish page always has an Admission
     tile, "Not recorded" when unknown. Here it disappears on un-enriched pages,
     so a student cannot tell "open" from "we don't know". Show "Admission: Not
     recorded yet". A gap is marked as a gap.
5. **Make a sparse page look chosen.**
   - With no `about`, `selection` or `cutoff`, the main column should still end
     on something to do and somewhere to go:
     - put the primary button "Open on tum.de ↗" straight under the requirement
       card, the way the Danish aside has "The official page";
     - under it, show "More at TUM" with 3 sibling programme cards, using the
       field bands already built for the school page.
   - This fills the empty 600 px with possibilities, not padding. On a phone it
     also puts the way out before the aside's facts.
   - The un-enriched hero needs a line under the title. With no `about`, use the
     credential and field in words, for example "A three-year engineering
     bachelor's in Garching", built from the record's own fields, or show the
     photograph (change 2), which makes the missing lede matter less.
6. **Name the maths requirement the way the record does.** Aalto shows the
   chip "Any IB Maths" with the note "AI counts only at HL" (`01`, `06`). The
   bold line tells an AI SL student they qualify, and the small line takes it
   back. The record's own words are clearer: "Advanced maths (AA SL/HL or AI
   HL) at grade 6".
   - Let `needs` carry a level per option: `anyOf: [{id:'mathematics-aa',
     level:'SL'}, {id:'mathematics-ai', level:'HL'}]`.
   - `needPhrase` then yields "Maths AA (SL or HL) or AI HL".
   - Until that exists, a need with a `note` that narrows the phrase should
     print the record's `ib` line as the chip, not the collapsed phrase.
7. **Fix the chrome bugs.** See the list below.
8. **School-page cards need a cue that they open a page.** The "On aalto.fi ↗"
   foot was removed when the cards began linking in-site. At rest, nothing on a
   card now says it goes anywhere (`09`). Add a foot in accent colour, "The
   programme →", or a → at the right of the field band.

## Bugs

| # | What | Where | Screenshot |
|---|---|---|---|
| 1 | "Apply by 31 May 2027" is the medicine gap-year date. TUM's record says 15 July | TUM Aerospace, strip and panel | `03`, `04` |
| 2 | The dates panel's first two entries are medicine dates on an Aerospace page | TUM Aerospace | `03`, `04` |
| 3 | "Apply by 15 January 2027" is the numerus fixus date, with no fixus status recorded for the programme | Radboud AI | `05` |
| 4 | The hero lede and "What it is" are the same sentence | Aalto Data Science, NCAD Fashion Design | `01`, `07` |
| 5 | Filler block in the facts strip: 9 tiles in a 7-track grid; a half-cell on a phone | Aalto (desktop and phone), TUM (phone) | `01`, `06`, `04`, `10` |
| 6 | The breadcrumb in a panel hero keeps the photo hero's dark `text-shadow` and smudges on paper. `.hero .crumbs` (site.css ~2928) is not reset for `.hero--panel` / `.hero--plain` | Every school-programme page, light mode | `08` |
| 7 | The "How places are decided" chips sit about 24 px right of the heading and the text (list padding) | Aalto, NCAD | `01`, `07` |
| 8 | The NCAD lede opens "CAO code AD211." A code is not the first thing to read. Move it to the end of `about`, or to its own line | NCAD Fashion Design | `07` |
| 9 | The school's general IB rule on a programme page names other programmes' add-ons ("Product and Interaction Design add Maths SL 4 or HL 3") | NCAD Fashion Design | `07` |
| 10 | The eyebrow wraps on a phone ("… GARCHING / AND OTTOBRUNN"). The same city also fills 3 lines in the Where tile | TUM Aerospace | `04` |
| 11 | The close heading repeats the page title in display type. For long names it is 3 lines ("Information and Communication Technology at KTH"). Use "Next step" with the button alone, or a short title | KTH ICT; Radboud AI is 2 lines | `05` |
| 12 | A single-programme school has no pager, so about 80 px of empty paper sits between the close band and the footer | KTH ICT (dark desktop) | full capture only |

Not scored, but seen: the Danish benchmark's own hero lede is cut mid-sentence
("…rather than computer science with…", `02`). The benchmark has the flaw that
bug 4 avoids by accident.

## What works

- **The order matches the Danish page.** Eyebrow "AALTO · BSC (TECH) · 3 YRS ·
  ESPOO", then facts, dates, need, selection, what it is. A student who has used
  one kind of page can read the other.
- **Aalto's enriched page is close to the standard.** The requirement is a chip
  with its minimum grade. The selection chips plus one line ("Round B: ranked on
  IB grades…") explain how you get in. The cut-off is marked "not a prediction".
  The dates panel is right and specific (22 January, Aalto's own application).
- **The hand-off is targeted.** "Open on aalto.fi ↗" goes to the programme's
  own page, and "Every degree at Aalto" brings you back. Prev/next pages
  through siblings in card order. That is the navigation rule kept.
- **The un-enriched pages are honest.** They show the record's `ib` line as the
  requirement and invent nothing. "Requirements in full" holds the school rule
  and the sources.
- **Dark mode holds.** Tiles, chips, the need card and the dates panel all keep
  their contrast (`10`). There were no dark-only defects apart from bug 12.
- **The phone order is sensible.** Facts, then deadlines, then the need, then
  the aside, then the close. Nothing overflows at 390 px.
- **The school-page cards are in plain words.** "BSc (Tech) · 3 yrs" and a
  one-line IB rule per card, with field bands that now carry colour (`09`).

## Screenshots in `programme-pages-round-1/`

- `01-aalto-data-science-desktop-light.jpg`: the enriched page. Duplicate lede,
  strip filler, raw cut-off, indented chips.
- `02-dk-benchmark-sdu-ai-desktop-light.jpg`: the benchmark, with a photo hero
  and IB points leading the cut-off.
- `03-tum-aerospace-desktop-light.jpg`: the sparse page, the wrong apply-by,
  medicine dates, the empty column.
- `04-tum-aerospace-phone-light-top.jpg`: the same on a phone, with the eyebrow
  wrap and the strip filler.
- `05-radboud-ai-desktop-light.jpg`: the numerus fixus date as apply-by, the
  3-line fee tile, the sparse column.
- `06-aalto-data-science-phone-light-top.jpg`: the phone strip, with the
  3-line cut-off and the half-cell filler.
- `07-ncad-fashion-design-desktop-light.jpg`: the lede repeated, "CAO code"
  first, another programme's rule.
- `08-panel-hero-crumb-shadow-zoom.jpg`: the smudged breadcrumb on paper.
- `09-aalto-school-cards-desktop-light.jpg`: the cards with no "opens a page"
  cue.
- `10-aalto-data-science-desktop-dark-top.jpg`: dark mode, with the strip
  filler.

## Summary

1. Score 6/10, not accepted. The skeleton matches the Danish page, but trust and
   pictures fall short.
2. The worst fault is truth. "Apply by" takes country-wide dates for other
   programmes: medicine on TUM Aerospace, numerus fixus on Radboud AI.
3. There is no photograph on any of these pages, and the Danish benchmark has
   one. Reuse the school's photo, as Danish programme pages already do.
4. The enriched pages repeat the lede as "What it is", leave filler in the facts
   strip, and print a local cut-off raw.
5. Sparse pages need an in-column way out ("Open on …" and 3 sibling cards) so
   they look chosen, not empty.
