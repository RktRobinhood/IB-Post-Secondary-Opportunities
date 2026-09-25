# Programme cards: round 4 (issue #46)

**Score: 7 / 10.** Not accepted. The vocabulary is fixed, but what the card says is not yet right.

I checked localhost:4380 (the live build) at desktop and phone widths, in light and dark mode:
- `/` with Show all open (67 cards);
- the SDU and CBS pages;
- the Paths block on SDU Electronics.

The tools are in `../../home/round-3/tools/`, and the card data is in `../../home/round-3/notes-all.json`.

## Reasons

**Fixed:**
- There are four kinds of tag, and none says Quota or Restricted.
- 67 of 67 cards show a degree type.
- The CBS cards show the city.
- A "one of" never shows a single option.
- There are no sticky notes, and all 67 photos are distinct.

**Why it is not an 8:**
- **Two point figures that seem to disagree.**
  - Aarhus Computer Science shows "Last year: 43 IB points" beside "Needs … 28+ IB points and a 5 in Maths HL (AA or AI)". Maths HL is named twice.
  - Data Science, IT Product Development and Cognitive Science do the same.
  - A student will read "28+" as enough.
- **English is back as the only need.** The two Twente cards show just "English A Literature … or 3 other routes".
- **Five of the six CBS cards share a Needs line**, and "History or 5 other subjects" is cryptic.
- **"+" means two things.** In "Physics + Chemistry +2 more", the first means "both" and the second means "more".
- **Lookalike photos:**
  - The two Multimedia Design cards are both a pen in hand on paper. There are four pen-in-hand close-ups in all.
  - The three International Business cards are three meeting rooms.
  - Cyber Security and Mechatronics are both curved desks of monitors.
  - At least five cards are people at laptops.
- **Paths on a phone** reads "Quota 1 needs: at least 31 IB / points". "IB points" splits across the line, and the Danish "7.0" is never explained.

## Three changes

1. **One point figure per card** (`requirementSummary`, `cardTag`).
   - When the tag shows last year's cut-off, leave the points floor for the programme page.
   - Never name a subject twice.
   - Fixed means: no card shows two different point numbers.
2. **English and the grouped requirements, in plain words.**
   - Key Twente's English under English, so it is dropped.
   - Write "History or 5 other subjects" as "one of History, Economics … (+4)".
   - Write "and" where both are needed, never "+".
   - Where requirements are identical (the CBS five), show something that differs, or no Needs line.
3. **One scene per concept** (`programme-images.json`).
   - Give the second Multimedia Design card and two International Business cards a real place.
   - Give Mechatronics a machine.
   - Fixed means: no two cards with the same title share a scene type.

## Bugs

| # | Bug | Shot |
|---|---|---|
| 1 | "28+" beside "Last year: 43", and Maths HL named twice. | `card-aarhus-cs.jpg` |
| 2 | Twente shows only an English A Literature need. | `card-twente-creative-tech.jpg` |
| 3 | Five CBS cards share an identical Needs line. | `dk-cbs-desk-light-cards.jpg` |
| 4 | The two Multimedia Design photos look alike. | `card-multimedia-1.jpg`, `card-multimedia-2.jpg` |
| 5 | Other groups of lookalike photos. | `bug-photo-lookalikes.jpg`, `home-photo-sheet.jpg` |
| 6 | Phone Paths: "31 IB / points" splits, "Quota 1" still shows, and "7.0" is never explained. | `bug-paths-ib-points-split.jpg` |
| 7 | Biotechnology has no length (a record gap). | `notes-all.json` #10 |
| 8 | "Language ab initio SL or Another language" is unclear. | `notes-all.json` #8 |
