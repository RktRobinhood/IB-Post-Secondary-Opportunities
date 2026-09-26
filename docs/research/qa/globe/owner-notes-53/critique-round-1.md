# Globe after the owner's notes on #53: critique, round 1

Two critics at once: the art director and the motion critic. The critique covers the implementer's `notes.md`, all 26 JPEGs beside it, `report.json` and `report-before.json`, and ADR 0007. The baseline is round 5 (`../round-5/critique.md`, 8/10). The owner's own words come from the #53 comment.

I also took extra shots. They are in the session scratch directory, outside the repo: `…/scratchpad/critic-globe/`. I built the merged working copy to a private `DIST_DIR` and served it on :4441. The repo's `dist/` was stale and still had the flat map in it, so `serve.mjs` would have served the old site. The shots:

- `p-*`: phone, United States chosen, New England, home top, Denmark door
- `d-door-*`: desktop, the three home doors
- `d-countries-biggroup`: desktop, a real click on the "281" group on `/countries/`
- `r-*`: reduced motion
- `s-*`: 1.6 Mbit/s first paint
- `m-desk-sheet.jpg`: the flight from rest to the United States

The JSON for these is in `report-{phone,desk,reduced,slow}.json` in that folder. The street-level tiles cannot load here, so I have not scored them.

## SCORE: 7 / 10

This is not yet something I would ship to students today. Three of the owner's five notes are fully met: the flash is gone, the card is the link, and the lights sit at each country's centre. The globe at rest floating on the paper is the best this hero has looked. But the new schools level, which the owner asked for, arrives half-dressed. Of 416 school pins, 275 carry acronyms and none carries a photograph. One more owner sentence was not addressed at all: the zoomed globe should stay "a sphere and not … a sphere with background". The phone view of a chosen country also hides the schools behind the card. And round 5's phone leftovers are still there, with one of them now also on home.

## Why

### What is clearly better than round 5

- **It floats.** Home and `/countries/` at rest, in both themes, show a brass desk globe standing on the page's own paper (`02-home-desk-light.jpg`, `02-countries-desk-dark.jpg`). I sampled the pixels around it: the halo differs from the page by 1–7 levels, so it reads as air, not as a panel. The night-sky band on home is gone. In light mode, the page finally looks like one surface: the headline, the doors, then the object.
- **No old map first.** Compare `00-before-home-desk-light-200ms.jpg` (hollow rings on a dark band) with `01-home-desk-light-200ms.jpg`. Nothing is drawn and then replaced. The owner's complaint is fully answered.
- **The card is the link.** `report.json` shows `links: 1` and `nestedInteractive: 0`, and a click on the card's body landed on `/destinations/us/`. A Harvard card goes to `/universities/us-harvard/`. That is right and clean.
- **Centred lights.** The United States sits in Kansas and Canada in Manitoba (`03-countries-us-light-centred.jpg`). You can see this is correct at a glance.
- **Motion, turn then lean in.** It still reads as holding a world (`m-desk-sheet.jpg`). At 0.15 of the flight the desk globe turns left, at 0.35 it faces you with the US in pastel inside the ring, and by 0.55 it has crossfaded to the photograph and leans in. Reduced motion arrives in the same end state within 700 ms on desktop and on phone (`r-us-700ms.jpg`, `r-p-denmark.jpg`: same pins, same card).

### What holds it at 7

1. **The zoomed globe is a hard-edged box, which is what the owner asked to lose.** The owner wrote: "zoom into the world and then can resume into a sphere and not do a sphere with background … there's some stuff to play with here". Nothing in `notes.md` or ADR 0007 addresses this. At rest the globe floats. From about 0.55 of any lean-in, the stage becomes a full-width rectangle of satellite imagery with a blue sky band across the top, cut off square at all four edges:
   - `/countries/`: 1184×592 (`04`, `06`, `d-countries-biggroup.jpg`)
   - home: 595×672, running into the viewport's right edge with no gutter (`08`, `d-door-here.jpg`)
   - phone home: 390 px wide at `left: 0` (`p-home-denmark.jpg`)

   In light mode, this dark slab after the Denmark door is exactly the "obstructive" look the owner complained about. It has just moved from rest to zoom.

2. **The schools level reads like a timetable, not a place.**
   - **Acronyms.** `schoolsOf()` (`src/pages/destinations.mjs`) names pins `i.shortName || i.name`, so 275 of 416 pins are acronyms: MUG, UCF, PLUS, UP, UD, SZTE, PTE, UGA, VSB-TUO, UEF, UiA, JU, LiU (`08`, `d-countries-biggroup.jpg`, `d-door-here.jpg`). A student in Denmark cannot tell what UCF is. The same file already has `readableName()` for exactly this problem.
   - **No photos.** School pins carry no `image` at all (0 of 416), so a school's card is three lines of text (`07-countries-harvard-card.jpg`). The destination pages' own pins do pass `picture(site, i.key)` (same file, around line 483).
   - **Denmark has no photo.** It is the only country light on `/countries/` without one, and its card on home has none either (`d-door-here.jpg`, `p-home-denmark.jpg`). Denmark is the prominent door, and it gets the one text-only card. The United States gets Georgetown's towers.

3. **Too many markers at once: the "countries" step is skipped.** The owner described "country, region, countries, schools". A real click on the "281" group on `/countries/` dives to alt 0.41. That is below `SCHOOLS_ALT` (0.45), so every country opens at once into **31 numbered groups and 20 acronym pins** (`d-countries-biggroup.jpg`, `report-desk.json`), and no country's name is visible. The countries level exists (the Nearby door at about alt 1 shows Iceland, Finland, the United Kingdom, Germany and others: `d-door-nearby.jpg`), but a group dive jumps past it.

4. **A chosen country is framed on its centre, not on its schools.** Choosing the United States flies to 0.32 over Kansas. Eight of its 14 schools are then bunched into two "4" groups at the stage's right edge, with Macalester, Grinnell and Illinois in the middle (`04`, `r-us-700ms.jpg`). The centre is the right place for the far-out light, but the wrong frame for the arrival.

5. **On the phone, you cannot see what you chose.**
   - **The card covers the schools.** With the United States chosen, the card is 219 px tall on a 358 px stage (61%), and the "+ − RESET" row covers most of the rest. The schools the owner asked for sit under the card (`p-us-chosen.jpg`, `p-us-east.jpg`).
   - **The Denmark door leaves a thin strip of map.** About 120 px is left between the controls and the card. Denmark is one "56" blob among grey neighbours, and none of its places are open (`p-home-denmark.jpg`).
   - **The controls sit on the ring again, now on home too.** Round 5 recorded the home phone controls as fixed ("a row above the ring"). Now the "+" button's corner is inside the globe's disc on home (`02-home-phone-light.jpg`, `p-home-top.jpg`) as well as on `/countries/` (`02-countries-phone-*.jpg`, issue #53's open box).

6. **The hero is empty for about 4 s on a school network.** At 1.6 Mbit/s with 150 ms latency, the stage stays empty paper for 4.1 s on desktop and 3.7 s on phone before the canvas starts fading in (`report-slow.json`, `s-phone-slow-2s.jpg`). On the phone that is a 290 px hole in the middle of the first screen, with "Bigger light, more degrees" captioning nothing. Part of this is SwiftShader, but most of it is the 0.5 MB of textures.

7. **Round-5 leftovers are still visible in the new shots:**
   - label collisions: "Amherst" is under a "2" (`06`)
   - JPEG squares in the photo sea: off New England (`06`) and in the Adriatic and Biscay (`d-countries-biggroup.jpg`)
   - stretched cloud streaks at about 0.75 of a dive (`m-desk-sheet.jpg`, frame 4)

8. **The numbers disagree on home.** The Nearby door says "16 degrees" and the chip says "16 of 73 degrees", but the globe beside them shows 28, 33, 35 and 16 (`d-door-nearby.jpg`). With Denmark chosen, the light reads 56 and its card says 57 degrees (`p-home-denmark.jpg`). The notes call this older than #53. The schools level makes it worse, because a school pin counts one institution while the legend says "Bigger light, more degrees".

## The trade-off: no globe means no picture

I would accept it for now, but not as the end state. The honest line and the opened list are better than a second, different map; the owner was right that two maps in a row looks broken. The list also works, and `?map=off` shows it in the globe's column.

It does cost something:

- **On home, the hero becomes 55 chips** (`09-home-no-globe.jpg`). Countries with flags are mixed with Danish towns without flags (Sønderborg, Aarhus, Horsens). That is the "reads like homework" look the brief rules out, in the most important spot on the site.
- **The refusal of software renderers now costs a picture.** Before, a GPU-less school laptop still got a map. Now it gets a list. A Chromebook in software mode does not sound exotic for a school.

The same one asset fixes this and point 6 above: **a still of the desk globe at its rest pose**, a transparent WebP of about 40–60 kB with no pins, as the stage's poster. It paints at first paint and the canvas fades in over it. Because it is the same globe in the same pose, the handover is invisible, so this is not the "old map, then globe" swap the owner banned. Where the globe cannot run, the still stays, the line says "Every place is in the list below", and the list stays folded instead of forced open on home. ADR 0007 already names this as the next step. I would do it now, not wait for complaints. The empty first seconds affect every reader, not only the no-WebGL few.

## The three changes that would raise it most (ranked)

1. **Keep the zoomed globe a sphere on the paper, and frame arrivals on what matters.**
   - When the camera is below the desk (the ring has faded), stop filling the stage with a rectangle. Either:
     - cap a country or region lean-in so the limb stays visible, with the curved horizon and paper beyond it and no sky band, and fill the stage fully only for a school dive that hands off to the street map; or
     - at the very least, give the stage rounded corners and a feathered edge. Use a CSS `mask-image` that fades the last 32–48 px to transparent on all four sides, and keep the 16 px side gutter on home and phone.
   - Choosing a country should `fitCamera()` over its schools' `xyz` (`p.subs`, with `pad` like `openGroup`), not fly to 0.32 over its centre. The United States should arrive with Boston to Chicago in frame.
   - A group dive from the desk should stop at the altitude where the group splits into **countries**, above `SCHOOLS_ALT`. A second choice, a country or a closer zoom, then opens schools. That is the owner's "country, region, countries, schools" order.

2. **Make the phone show what was chosen.**
   - On narrow screens, put the card as a sheet **below** the stage, not over it. The card is already the link, so it can sit right under the globe at full width with its photograph. The chosen country's schools then own the whole 358 px stage.
   - Put "+ − Reset" in a row above the stage on every globe page. Home has regressed and `/countries/` was never fixed. Add a guard to `test-map.mjs` that the controls' rectangle does not intersect the ring's circle at 390×844.
   - Make the Denmark door on phone land close enough that Denmark's places are open, as they are on desktop (`d-door-here.jpg`: Aalborg, Esbjerg, Odense, Sønderborg).

3. **Give the schools level names and photographs.**
   - In `schoolsOf()`, use `readableName(i)` instead of `i.shortName || i.name`, and pass `image: picture(site, i.key)` (the same call the destination pins use) so a school's card opens on its campus.
   - On a crowded stage, a pin can keep a short label only if the short label is a word (McGill, Durham, Yale), not initials.
   - Give Denmark's country light a photograph on `/countries/` and on home. It is the only country without one, and it is the first door.

## Also worth doing (after the three)

- The still poster described in the trade-off section, which fixes the 4 s empty hero and the no-WebGL hero.
- One unit on home: either the lights count degrees everywhere, including a school pin and its group, or the legend says what they count. A door, its chip and the globe beside them should show the same number.
- Round-5 leftovers seen again here: label collisions (`06`), JPEG sea squares (`06`, `d-countries-biggroup`), and cloud streaks at about 0.75 of the dive (`m-desk-sheet`).
- The repo's `dist/` still holds the old flat-map build (`curl :4441/countries/` showed `world__svg` before I rebuilt). Anyone running `serve.mjs` without a rebuild will review the wrong site.
