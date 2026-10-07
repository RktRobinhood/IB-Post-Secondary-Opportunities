# Art-director critique: globe levels, round 8

**Score: 7 / 10. Close, but I would not ship it to students today.**

This is the best round so far. Denmark finally has one coast, and the phone has a real key, so the numbers mean something. Desktop is now a solid 8. The phone has risen to about 7, but two things still fail. First, the "flat everywhere below the world" claim is only true at country level: the Europe and North America continent levels still show the photo. Second, on the phone, tapping a pin sends its card below a 14-row list, off the screen. Austria has also lost its label altogether. So the score holds at 7, from a higher floor.

## What improved (keep it)

- **One coast.** In a 3× crop of desk-light-3, the fill and the ink are the same edge. There is no blue gap and no offset. Jutland, Funen and Zealand read as clean, low-poly toy stickers in both light and dark. This was the round-7 headline failure, and it is fixed.
- **The phone key** (phone-light-4b). It is a tidy two-column list, 1 to 14, in the same rounded-square tag as the pins, directly under the stage. A student can now name every pin.
- **Two meanings, two shapes.** Pins are square tags and coins are round. The legend says "Coins count universities". The number clash is gone.
- **The UK is a toy, and so is France under its card** (input-4-uk). Neighbours fade to ghost labels. Japan and Korea are flat too, and Asia's continent level is nearly flat.
- **Controls.** The +/− round brass knobs sit well on the desktop stage, Reset has gone, and the trail's World goes home. The chrome is quieter.
- **Report.** Overlaps are 0, `labelsOnNodes` is 0 (down from 2), and the console is clean.

## What still fails

1. **On the phone, the selected card is off screen** (phone-*-4).
   - The pin turns orange, but the Aarhus card sits below all 14 key rows, about 400 px down. The student taps and sees nothing happen.
   - Row 4 in the key is not highlighted either.
2. **The photo still shows at continent level.**
   - input-3-north-america: Canada is white-and-yellow tundra speckle, and the Rockies show as relief.
   - desk-*-2 Europe: the Alps and Italy are mottled. The levels still look like two products.
   - The USA country map (input-4-usa) is flatter, but it is soft and blurry next to Denmark's crisp edge, and the Rockies still show faintly through it.
3. **Europe's labels (desktop).**
   - Austria's coin "8" has no label at all (the report shows `label: ""`). This is a regression.
   - Germany and Switzerland are still "DE" and "CH".
   - Luxembourg's label floats left, under Belgium's, far from its "2" coin, and no leader can be seen.
4. **Desktop pins are still unnamed knots.** Denmark has 8 of 14 named and the UK 7 of 22. Copenhagen, London, Esbjerg and Bornholm have no names. The phone has a key, but the desktop has none.
5. **Leftovers.**
   - The phone world globe is still about 245 px. The knob row above it wastes a band of screen.
   - In dark mode on desktop, the stage edge glows cream at its top and left (desk-dark-3).
   - The Nearby door says "25 countries", but the Europe card says "26 countries". It is defensible, because Denmark is excluded, but it is unexplained.

## The five changes that would raise the score most

1. **Make the phone card follow the tap.**
   - When a pin or a key row is selected, put the card directly under the stage, above the key, or collapse the key to one line.
   - Highlight the selected row.
   - Acceptance: phone-*-4 shows the orange pin and the card's photo on one screen.
2. **Paint the toy map at continent level too.**
   - Europe, North America and Asia at about 1.0 alt get the same flat pastel as Denmark.
   - Raise the USA and Canada raster so their coasts are as crisp as Jutland's.
   - Acceptance: no tundra speckle in input-3-north-america, and no Alpine mottle in desk-*-2.
3. **Name every European country in full on desktop.**
   - Austria, Germany and Switzerland get their full names on leaders out to the far ring.
   - Luxembourg gets a visible leader to its coin.
   - Acceptance: all 26 labels are non-empty and none is a two-letter code.
4. **Give the desktop the phone's grammar.**
   - Use numbered square tags on every pin, plus the same numbered key under the stage or in the country card. Keep names on the pins where they fit.
   - Acceptance: every pin in desk-*-3 and input-4-uk can be identified without hovering.
5. **Free the phone's world globe.**
   - Float the knobs over the stage's bottom corner, beside the stand, and drop their row.
   - Grow the globe to at least 290 px, while the first photograph stays on screen one.
   - Kill the cream halo on the dark stage.
