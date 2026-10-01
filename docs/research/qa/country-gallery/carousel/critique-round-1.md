# Art director critique, country photo carousel, round 1

**Score: 6 / 10** (8 = ship to students today)

The idea is right and the motion is well behaved: staggered beats, a slow crossfade, lazy loading, reduced-motion stop. The tiles look good in the screenshots (Norway Bryggen, Iceland Vestrahorn, Denmark Møns Klint, Ireland Glendalough all land). The score is held down by the set and the hero details, not the mechanism.

## The three changes that would raise it most

1. **Re-curate the first photo and the weakest slides, because the first photo is the one every student sees.**
   - The hero is slide 1 of every country and is the weakest picture in several sets.
   - Replace these heroes:
     - US 35.1: it reads as a Gothic university building (Healy Hall), which breaks "never a university".
     - CA 5.1: a dark CN Tower silhouette.
     - AU 6.1: a drab Canberra aerial.
     - NL 28.1: a library roof.
     - AE 36.1: a murky night shot.
     - DE 10.1: a distant skyline.
     - NZ 29.1: a generic Auckland skyline.
   - Replace these slides too: AE 36.5 (bleak desert lakes), PL 1.3 (soft Tatra), HU 18.4 and IS 20.4 (grey water), SE 32.5 (kallbadhus).
   - Aim for at least one picture with young people in it per country. Only a handful have any (Tartu beach, Copenhagen cyclists, Munich Isar, Basel Rhine).
   - Lead each set with the most vivid, most recognisable frame, not the Wikipedia hero.

2. **Make the hero carousel controllable and fix its caption.**
   - Auto-advancing content that lasts more than 5 seconds needs a pause or stop control (WCAG 2.2.2). Reduced motion is handled; a normal user has no way to hold a photo or go back to one they liked.
   - Add small dots or "1 / 5" with prev/next and a pause button. Pause on hover and focus too.
   - The caption appears only after the first rotation. Poland t0 and Denmark t0 have no place name, then "Gdańsk's Motława waterfront" and "Cycling through Copenhagen" appear at t10. Caption slide 1 from the start.
   - The caption sits at x=24 px while everything else on the page uses a 48 px gutter, and it is small, so it looks like a stray label.
   - Align it to the 48 px gutter and give it a place-pin glyph so it reads as a caption.
   - The credit link is tiny and underlined, low-contrast on bright frames. Move it behind an "i" or reduce it to one line.

3. **Fix legibility and busyness on the tiles.**
   - Text sits on a shallow scrim.
   - On bright slides (Denmark's pale building at t9, Iceland's sky, Finland's sky) the name and the grey small-print line lose contrast.
   - Deepen the bottom gradient, or add a stronger text-shadow on the name and description.
   - Keep the `.tile__text` block in a consistent position; on desktop the headings float at different heights because the descriptions wrap differently (Denmark, Finland and Iceland headings sit at different y).
   - On the phone, 2 to 3 full-width tiles are on screen at once and all crossfade on offset beats. That is more motion than a first impression of "possibilities" needs.
   - Cap simultaneous crossfades to about 2 on screen, or slow phone tiles to roughly 7 s.
   - Tiles also give no hint that there is more than one photo (no dots, no count). A faint "1 of 5" pip row, or a one-word place caption on the tile, would tell students these are different places, which is the point of the change.

## Smaller notes

- The contact sheet shows truncated captions ("Prague's Christmas market at blue ho", "Piazza Maggiore, Bologna at blue ho"). Check that the data is not truncated, not just the sheet.
- The 1.2 s blend of two unrelated photos mid-transition produces a ghosted frame (Denmark t9). Acceptable, but a slightly longer hold or a 0.8 s fade would look crisper.
- Denmark's card first photo (cycling street) differs from its hero (Nyhavn). Fine, but the door and the page should open on the same frame.

---

# Round 2

**Score: 7.5 / 10** (8 = ship to students today)

What now works: the new leads are a clear step up (US Central Park is a lovely hero, and no hero is a university building); every hero has its place caption on first paint, on the 48 px gutter; the pause button exists and is clearly an on/off control; the tiles turn one at a time, and the deeper scrim holds the text on Iceland and Norway. The set no longer embarrasses itself.

## Top remaining fixes

1. **The pause button collides with the photo credit (a visible bug).**
   - In page-pl-paused.png the 44 px circle sits on top of "CC BY-SA 4.0".
   - In page-denmark-t10.png it covers "CC BY 2.0" and the long credit ("Tony Webster from Portland, Oregon, United States") runs right into it.
   - Move the button above the credit (stack: button, then credit), or move the credit left of the button with a right margin of at least 56 px. It must never overlap on a phone either, where the long credits will wrap.
   - Also give the button a translucent dark backing so the white icon and ring read on bright frames.
2. **Tile dots are too small and too faint to do their job.**
   - At about 5 px, top-right, they vanish on pale skies (Sweden dusk, Ireland, Iceland, Finland). On the phone they are barely there.
   - Make them about 7 px with a 1 px dark halo or a small dark pill behind the row, and the active dot clearly bigger or longer.
   - Confirm they are decorative (aria-hidden) so a screen reader does not read five unlabelled items per tile.
3. **Heading height and legibility are still uneven (pre-existing, but now the most visible flaw on /countries/).**
   - Denmark, Finland, Iceland, Norway and Sweden headings sit at five different heights because taglines wrap differently.
   - Anchor the text block to the bottom, with a fixed two-line clamp on the tagline, and the grid will look composed.
   - Denmark's pale building at t9 still gives the description line modest contrast. One more notch of scrim at the bottom third would settle it.

## Smaller notes

- With one tile turning every 2.6 s and ~5 tiles on screen, each tile moves about every 13 s. That is calm, and it is fine. Check that a lone tile on screen (a section with one row) does not turn faster than the staggered beat.
- Slides the photo editor kept (PL Tatra, HU Danube Bend, IS Akureyri, SE Malmö) are acceptable as true, pleasant slides. I am not pressing them.
- The country-page hero still has no dots or prev/next, so a visitor cannot go back to a photo. The pause button covers the accessibility need; navigation is a nice-to-have.

---

# Round 3

**Score: 8 / 10** (ship to students today)

All three round-2 fixes check out in the round-3 screenshots.
- The pause/play disc now sits clear above the credit and reads on the Copenhagen, Gdansk and Yosemite frames, with no overlap.
- The tile dots (7 px on a dark pill, 16 px active bar) are legible on the pale Sweden and Ireland skies and on the phone.
- Names align across a row (Denmark, Finland, Iceland and Norway headings all at the same height, and Sweden holds the same offset from its card top), and the bottom scrim holds the text.

Left for later, none blocking:
- Denmark's tagline now ends in an ellipsis ("a conversion table that..."). It is the strongest sentence on the card, so consider trimming the copy to fit two lines instead of clipping it.
- The count line still wraps to two lines on desktop ("Researched in depth" dangling). A shorter label would tidy it.
- The country-page hero has no dots or prev/next, so a visitor cannot return to a photo they liked; the pause button covers accessibility only.
