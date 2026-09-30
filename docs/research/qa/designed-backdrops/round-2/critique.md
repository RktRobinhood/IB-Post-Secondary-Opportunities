# Designed backdrops and uniform cards: art director, round 2, 7/10 (30 Sep 2026)

I judged all 26 shots in this folder, in light and dark:

- `constructor-mixed`, `ucp`, `fontys`, `lut`, `rug-27-cards`, `home`,
  `pw-one-field-engineering` and `programme-designed-hero` at 1280 px;
- the RUG page and the programme hero at 360 and 390 px, in real device emulation;
- both contact sheets.

I accept that the round-1 phone overflow was a capture artefact: the true 360 and
390 px shots show no overflow.

## Score: 7/10

This is a large step up, and most of round 1 is fixed:

- **The phone is clean.** At 360 and 390 px, in both themes, the school hero wraps, the
  stats sit in a 2×2 grid, and cards fill the column with nothing clipped. The
  programme facts grid wraps to 2×4 and the hero title sits well.
- **The field reads at a glance from hue.** `pw-one-field-engineering` proves it:
  seven engineering cards share one steel blue, and Computing (lavender), Environment
  (green) and Architecture (grey-green grid) are clearly other families. The same holds
  at RUG (computing lavender, engineering steel, humanities sand, social sciences
  rose, sciences teal) and in dark mode.
- **Dark mode is fixed.** Every motif is now visible at the strength of rays and
  contour. Constructor's Industrial Engineering hatch and Software, Data and Technology
  waves read as designed, not empty.
- **Photos are back to full strength.** Fontys's wind tunnel and Mechatronics, RUG's
  bird and Life Science flask all have punch again, and the short fade still carries
  the title.
- **Sparser weave and chevrons are calmer.** They no longer read as upholstery.
- **The home search box is fixed:** one line, with Filters beside it.
- **A designed card beside a photo card is a peer** in both themes.

It is not an 8 yet for one reason the brief names outright: **two designed cards on one
page still look alike**, on the biggest page, stacked on top of each other. The guard
passes because it compares exact values, while the eye compares shapes.

## Must change before shipping

1. **The uniqueness guard is being satisfied on paper, not by the eye.** The contact
   sheet shows tones like 32.0 and 32.1, and 58.0 and 58.1. A 0.1° hue offset makes the
   guard treat a repeat as unique. Treat any tones within about 10° as one tone. On
   RUG this lets through:
   - **History and Religious Studies:** both *rays* from the top edge in sand, with a
     pale green band. They are **vertically adjacent**, in the left column in
     consecutive rows.
   - **American Studies and Media Studies:** both *dots* in sand. Communication and
     Information Studies is *dots* as well, per the contact sheet.
   - **Global Politics and Sustainability and Psychology:** both *weave* in rose, in
     consecutive rows.

   Fix the guard so it compares motif **and** the rounded tone family, and counts
   above and below as adjacent as well as side by side. Then re-deal RUG. With about
   ten motifs and seven humanities cards, each humanities card can have its own motif.
2. **Some different motifs look like the same motif.** *Rings* and *arcs* or *contour*
   read as one shape family at card size: concentric blue curves.
   - At Fontys, Industrial Engineering and Management (*rings*) and Logistics
     Engineering (*arcs*) sit side by side in the same steel blue, both with a green
     band. They look like twins.
   - At PW, Electric and Hybrid Vehicles (*rings*) is fine alone, but Aerospace and
     Environmental Engineering are both parallel diagonal *hatch* with a band, in the
     same column.

   Group motifs into look-alike families for the guard: rings, arcs and contour count
   as one; hatch and grid-lines as one; waves and chevrons, if the same amplitude.

## Should change (not blocking)

3. **The designed programme hero's grey disc.** The light hero is now clean and
   saturated (mustard for business), as asked. But the overlay disc is flat neutral
   grey, the heaviest shape on the page. It sits under the nav at top right and
   crosses the kicker rule, and it looks like a placeholder. Tint it from the field
   palette at low opacity, as on the cards, or keep it off the kicker line.
4. **The gap has moved from the bottom to the middle.** With facts pinned to the foot,
   note-less cards now float the title with 60–90 px of paper under it. Examples are
   American Studies, Religious Studies, Media Studies and Computer and Information
   Technology. It reads better than round 1's dead band, but a slightly taller image
   band on short cards would close it.
5. **Row heights still differ down a grid.** Row by row, cards match their neighbour,
   which is what the owner asked. A row of note-less cards is about 40 px shorter than
   the row above. I accept this; noted only so no one chases "one size" into fixed
   heights that clip notes.

## Checks against the brief

| Brief point | Round 1 | Round 2 |
|---|---|---|
| Every card in a grid reads as one set | fail on phone (artefact) | **pass**, desktop and 360/390 |
| Designed cards intentional and calm, paper and ink | mostly | **pass**; weave is calmer |
| No two designed cards on a page alike | fail | **fail**: RUG rays, dots and weave; Fontys rings next to arcs |
| Field readable at a glance | fail | **pass** by hue |
| Text contrast in both themes | pass | **pass** |
| A designed card beside a photo is not second-class | borderline in dark | **pass** |
| Programme hero with a design looks finished | pass (muddy) | **pass**; fix the grey disc |

Fix 1 and 2, re-deal RUG and Fontys, and re-shoot those two pages. I would expect 8.
