# Programme cards: round 3 critique (issue #46)

**Score: 7 / 10.** Not accepted. Round 2 also scored 7, but this is a high 7.

Critic: art director. I judged the local build at http://localhost:4350/ on 2026-09-26, at 1280×800 and 390×844 (2×), in light and dark mode. I looked at `/`, `/universities/dk-sdu/`, `/universities/dk-cbs/` and the Paths section of `/programmes/dk-sdu-electronics-sonderborg-2027-autumn/`. The scripts are in `../../home/round-2/tools/` (`shoot.mjs` with `ONLY=inst`, and `cardshot.mjs`), and the data is in `../../home/round-2/notes-inst.json` and `notes-audit.json`.

## Reasons

**Fixed since round 2:**
- **The cards are short.** They measure 292–315 px, or 360–381 px for a family card.
- **The seam is gone** on the phone.
- **The tags sit on the photo.**
- **Family cards name their degrees**, for example "BSc or BEng · 3–3½ yrs · Sønderborg", and their path rows are one line each.
- **The phone Paths table is now stacked blocks** with no sideways scroll (`paths-phone-*.jpg`).
- **Photos:** `/` has 67 cards with 67 distinct photos. Dark mode looks especially good.

**Why it is not an 8:**
- **The one Needs line shows what is shared, not what differs.**
  - 44 of the 67 home cards spend part of the line on "Any IB English".
  - On the CBS page, all six cards carry the same line, "English B HL or English A — or English B SL 5+ with IELTS 7.0 +2 more", so only the cut-off tag tells them apart.
- **Truncation can mislead.**
  - "Needs one of: Maths AA HL, at least a 4 +7 more" (Erasmus) reads as "needs Maths AA HL".
  - "Needs one of: Any IB English +1 more" has only one option on show.
  - A student can draw a false conclusion from either card.
- **The tags use six ways to talk about admission:** "Accepts Course Results", "Diploma, or another route", "Asks for the full Diploma", "Restricted admission", "Open admission" and the cut-off. The Needs line adds a seventh: "Requires the full IB Diploma".
  - "Restricted admission" and "Quota 1" are Danish jargon on a card for European students.
- **Photos that look alike remain** (`home-photo-sheet.jpg`):
  - **Sticky-note walls (5):** numbers 9, 12, 33, 38 and 60.
  - **Blackboards and whiteboards (4):** numbers 13, 23, 26 and 67.
  - **Assembly chambers (2):** European Studies (42) and International Business and Politics (44).
  - The Kanban note text also shows through the CBS title.

## Three changes that would raise it most

1. **Make the Needs line show what makes this programme different.** In `requirementSummary` (`src/lib/components.mjs`):
   - Rank each unit by how rare it is across all programmes and drop the near-universal ones ("Any IB English"). Their total still goes into "+n more".
   - Never cut a "one of" group down to one option. Show "Maths AA HL or 7 other routes", or leave the group out.
   - Keep each "at least a 4" together with `nowrap`.
   - Fixed means: no two cards of one institution have the same Needs line, and no card starts "one of:" with a single option.
2. **One admission vocabulary, in plain words.** In `cardTag` (`src/lib/paths.mjs`), use at most four tags:
   - "Full Diploma"
   - "Diploma or Course Results"
   - "Open entry"
   - "Last year: 38 points"

   Replace "Restricted admission" with the plain fact it stands for. Keep "Quota 1" off the cards; write "31+ IB points".
3. **Replace the lookalike photos.** In `data/programme-images.json`:
   - Give the `field-business*` pool, Creative Business, Global Business Informatics and CBS Digital Management real places: a trading floor, a harbour, a campus street, a studio.
   - Give one of the two chambers and two of the blackboards a different photo each.
   - Fixed means: the sheet shows no sticky notes and no more than one of each scene type.

## Bugs

| # | Bug | Screenshot |
|---|---|---|
| 1 | Six CBS cards have the same Needs line. | `dk-cbs-desk-light-cards.jpg`, `dk-cbs-phone-dark-cards.jpg` |
| 2 | "one of: Maths AA HL, at least a / 4 +7 more" is misleading and splits "a 4" across lines. | `bug-oneof-erasmus-econ-phone.jpg` |
| 3 | "one of: Any IB English +1 more" shows a single option. | `bug-oneof-crafts-glass-desk.jpg` |
| 4 | Biotechnology still reads "BEng · Kalundborg" with no length. This is a record gap (`dk-absalon-biotechnology-beng.json`). | `bug-biotech-no-years-desk.jpg` |
| 5 | The CBS page cards drop the city ("BSc · 3 yrs"). The home card shows "Frederiksberg". | `dk-cbs-desk-light-cards.jpg` |
| 6 | The Kanban sticky-note text shows through the card title. | `dk-cbs-phone-dark-cards.jpg` |
| 7 | "Quota 1: at least 31 IB points" appears on cards (SDU AI, Computer Science and Software Engineering). | `dk-sdu-desk-light-cards.jpg` |
| 8 | Photos look alike at card size, as listed above. | `home-photo-sheet.jpg` |
| 9 | Phone Paths block: "an average of / 7.0" wraps, leaving the Danish figure alone on its own line. | `paths-phone-light.jpg` |
