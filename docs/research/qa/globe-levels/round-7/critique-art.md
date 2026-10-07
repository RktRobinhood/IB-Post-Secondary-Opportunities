# Art-director critique: globe levels, round 7

**Score: 7 / 10. Not yet. I would not ship it to students today.**

There is real progress on the country maps. The UK and Japan are now flat pastel toys, the chosen colour is a soft apricot, and the NASA credit can finally be read. But the headline fix, "fill and ink are one coast", is not visible in the frames: Denmark still has two coasts. The USA and North America are still photographs. The new phone numbers have no key on screen, and they clash with the legend directly under them. Desktop is about 8, phone about 6.5. That is the same split as round 6, so the score holds.

## What improved (keep it)

- **The UK and Japan country levels are toys now** (input-4-uk, input-4-japan).
  - Flat apricot, pink, yellow and olive on toy-blue sea, with no grain.
  - Korea and China are flat too.
  - That makes 3 of 4 country frames, up from 1 of 4.
- **The chosen colour** is a light apricot (Denmark, the UK, Japan). It reads as warm and friendly, not as a brown stain.
- **The NASA credit is a paper pill** at the bottom-right in every frame, legible in light and dark, and it collides with nothing.
- **Phone pins carry numbers** (phone-*-3/4). The Denmark map finally looks like a numbered treasure map rather than seeds, and the selected pin (4, Aarhus) is big and orange.
- **Dark mode**: the stage edge is cleaner than round 6's muddy halo, though not yet crisp.
- **The report is clean on the basics**: overlaps 0, one camera per level, back is fresh.

## What still fails

### 1. Denmark still has two coasts (claimed fixed; not fixed in desk-light-3, desk-dark-3 or phone-*-3)
- In a 3× crop of desk-light-3 (Jutland, Funen, Zealand), the apricot fill and the rust ink line are still two outlines, offset about 3–6 px down and to the left.
  - The ink runs through open sea along Jutland's west coast and Djursland.
  - The fill pokes past the ink on Funen and Zealand.
  - Each island looks like a misprinted sticker with a drop shadow.
- The fill is still coarse: there is no Limfjord, and Funen is still a pentagon.
- On the phone the doubled line is the busiest texture in the stage.
- If the fill now comes from the per-pixel lookup, then the ink is still the old vector, or it is projected with a different offset. Either way, the student sees two coasts.

### 2. The toy look still stops at Europe and Japan
- **input-4-usa**: the USA is a rust-tinted relief photo, and Canada and Mexico are raw satellite.
- **input-3-north-america**: Canada is burnt yellow-white tundra photo. It is identical to round 6.
- **input-4-uk**: France, under the card, still shows relief mottle, with a hard horizontal tile seam and a dark photo strip at the bottom of the stage.
- The Europe continent level (desk-*-2, phone-*-2) is also relief photo under the pastel. Compared with the flat country maps, it now looks like a different product.

### 3. The phone numbers have no visible key, and they contradict the legend
- No numbered rail appears in phone-*-3, phone-*-4 or phone-*-4b. The words under the card are "Each number counts universities".
- On a country map, though, "4" means "the 4th university", while on a coin "14" means "14 universities". One glyph now carries two meanings, side by side.
- The report counts 2 of 14 named on the phone. Without the rail on screen, the numbers are just a puzzle.

### 4. Leftovers
- **Desktop Europe** still shows DE, AT and CH. The four corner spots did not rescue Germany.
  - Luxembourg's label floats far left of its 2 coin.
  - The report now flags `labelsOnNodes`: Austria and Luxembourg. Round 6 had none.
- **Nearby still says "25 countries"**, but the Europe card says "26 countries · 274 universities".
- **Phone world**:
  - The globe is about 245 px.
  - "+ / − / RESET" are still square form buttons in their own row, a toolbar above a toy.
  - The brass knobs are still not built.
- **Desktop pins** are unchanged: Denmark 8/14, the UK 7/22, Japan 7/15, the USA 6/14. Tokyo and London are still knots of unnamed pins.

## The five changes that would raise the score most

1. **Draw the coast once.** Stroke the ink from the same lat/lon raster that fills the land: take the edge of the fill mask with a 1.5 px darken. Do not overlay a vector.
   - Acceptance: a 3× crop of desk-light-3 shows no blue between the ink and the fill anywhere, and the Limfjord is visible.
2. **Paint the toy map over every country and continent level above 0.3 alt.**
   - The USA, Canada and Mexico: flat pastel.
   - France under the UK card: no tile seam.
   - The Europe and North America continent levels: flat pastel too, so all three levels share one look.
   - Acceptance: zero relief pixels in input-3-*, input-4-*, desk-*-2 and phone-*-2.
3. **Put the phone key on screen and split the two meanings.**
   - Show the rail directly under the stage, above the card, as a 2-column numbered list (14 rows, about 22 px each). Tapping a row selects its pin.
   - Give pin numbers a different shape from count coins: a small square tag or a white disc with ink text.
   - Change the legend to "Numbers on coins count universities · numbers on pins match the list".
4. **Finish Europe's labels and copy.**
   - Write Germany, Austria and Switzerland in full on leaders into the Alps or the Baltic, and pin Luxembourg's label to its coin.
   - Get `labelsOnNodes` back to 0.
   - Change Nearby to "26 countries".
5. **Build the controls into the toy.**
   - Make + and − round brass knobs on the ring (desktop) and on the stage corner (phone), and drop RESET.
   - Use the row this frees to grow the phone globe to at least 290 px, while the first photograph stays on screen one.
