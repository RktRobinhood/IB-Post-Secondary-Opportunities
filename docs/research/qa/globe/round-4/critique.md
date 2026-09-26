# Globe: round 4 critique (desk globe)

**SCORE: 7 / 10.** Not yet an 8.

## Why

**What works.** The desk globe is a real idea, and it lands. The brass ring, the stand, the 23.4° axis and the pastel countries make a place you want to spin (`s1-home-desk-top.png`, `s1-countries-desk-stage.png`), and it looks right in light and dark.
- **Motion is correct.** A horizontal drag turns the globe (+60° on the drag, +89° with inertia). A vertical drag changes latitude by 0.00 (`d-motion.json`, `d-2b-after-drag-down.png`). Frame p95 is 16.8 ms at rest, while dragging and in flights.
- **Turn, then lean in, reads as one gesture** (`s3a-lean-sheet.jpg`). The globe turns at desk distance (0–0.45). Between 0.5 and 0.55 the ring ghosts out, the pastel gives way to the photograph and the axis straightens. The clouds follow (`d-3r-group-rec-sheet.jpg`).
- **Coming back works.** Reset and Back both climb out and sit back onto the desk (`d-4r-reset-rec-sheet.jpg`, `d-4a-after-back.png`).
- **Reduced motion arrives everywhere.** A group lands in under 250 ms and a phone pin in under 300 ms. The globe does not idle-spin, and Back returns to the desk (`s3-more.json`, `s3c-*.png`, `s3d-*.png`).

**What holds it at 7.**
- **The resting picture has visible rendering faults**, and it is the hero, the first thing a student sees. The Caspian, the Persian Gulf and the Red Sea render **black**. The coasts carry thick black bands, and the ocean shows JPEG-block squares (`s1-home-phone-coast-crop.png`). The same faults follow you down (`d-5-place-ocean-crop.png`, `s3e-countries-group-end.png`). They look broken, not hand-drawn.
- **The globe turns away from the student's own world.** The idle turn is 6°/s from the rest pose, so within about 4 s of load every page faces the Middle East and India (`s1-*-stage.png`, rest lon ≈ 27, view lon ≈ 55). Europe then sits squashed on the top limb. This matters because Denmark and Europe are two of the three doors and hold most of the places.
- **On the rest pose itself, Europe crowds.** With the eye capped at 24°N, Denmark sits near the top limb. The "4" cluster is drawn on top of the "36", so a student clicks "4" and flies to Denmark's 36 (`d-1-rest.png`, `d-3r-group-rec-sheet.jpg` at 0.32 s).
- **Destination pages lost their subject.** `/destinations/nl/` now rests on a whole-world desk that faces Africa, with the Netherlands as one "15" bubble on the limb (`s1-destinations-nl-desk-stage.png`). In round 3 it rested over the Netherlands.
- **The last seam of the dive is still there.** For 0.7–1 s before the close map, the view is blurry, blocky green mush (`d-3r-group-rec-sheet.jpg` 2.05–2.42 s, `s3e-destinations-nl-group-rec-sheet.jpg` 1.96–2.66 s).
- **Phone.** The + / − / Reset buttons sit on the ring and hide its top pivot (`s1-phone-sheet.jpg`, `p-3-lean-and-end-crop.jpg`). The Europe group ends with "15" overlapping "3", and rings overlapping the "United Kingdom" and "Italy" labels (`p-3-group-end.png`).

## Three changes that would raise the score most

1. **Paint the desk surface from geography, not from pixel colour** (`globe.js`, `EARTH_FS`).
   - Take `water` from the political raster (`1.0 - pol.a`, smoothed), not from `wet(c)`. Blue Marble's shallow or dark seas fail the blue-leads test and turn into dark "land".
   - Draw the ink line from the edge of `pol.a` at 1 texel, not 3, so it stays about 1 px wide.
   - Fade `uInk` to 0 once `desk()` is below about 0.3.
   - Replace `smoothstep(0.02, 0.22, c.b)` in `ocean`, which amplifies JPEG blocks, with a flat desk ocean. Below the desk, use a gentle ramp on a blurred sample.
   - **Fixed looks like:** blue inland seas, no black coastal bands at any altitude, and no squares in the ocean in `d-5`, `s3e-countries` or the phone hero.
2. **Make the rest pose serve Denmark and Europe** (`restCamera`, `stepIdle`, `DESK_LAT_MAX`, cluster layout).
   - Let the eye rise to about 35–40° when the page's weighted heart is above 45°N, so Denmark is inside the disc and not on the limb.
   - Replace the endless 6°/s turn with a slow sway of about ±40° around the heart, or a turn that pauses facing it.
   - Merge any two clusters whose circles overlap.
   - Let destination and school pages rest leaned in over their country (the desk is for `/` and `/countries/`), or at least face it without drifting.
   - **Fixed looks like:** at any moment in the first 20 s, Denmark and Europe face the reader as one clearly labelled group, and the NL page opens on the Netherlands.
3. **Clean up the final metres and the phone frame.**
   - Hand off to the close map before the globe texture goes soft. The mush starts around alt 0.3, so start the handoff there, or hold the Europe detail upload in place.
   - On narrow stages, move `.world__controls` off the ring, stacked above the stand or to the top-left outside the disc.
   - At the end of a flight, hide pin labels that collide with a cluster or another pin.
   - **Fixed looks like:** no blurred frame between clouds and satellite, the ring unobstructed, and `p-3-group-end` readable.

## Bugs found

| # | Bug | Evidence |
|---|---|---|
| 1 | Black inland seas and coasts, and blocky ocean squares (`wet()` misclassifies water) | `s1-home-phone-coast-crop.png`, `d-5-place-ocean-crop.png`, `s3e-countries-group-end.png` |
| 2 | Overlapping clusters: the "4" covers the "36", and the lit cluster is not the one you fly to | `d-1-rest.png`, `d-3r-group-rec-sheet.jpg` |
| 3 | `/destinations/nl/` rests on a world desk facing Africa, with its subject on the limb | `s1-destinations-nl-desk-stage.png` |
| 4 | Idle turn carries every page's places to the back within seconds | `s1-rest.json` (view lon vs rest lon) |
| 5 | Pre-handoff mush, 0.7–1 s | `d-3r-group-rec-sheet.jpg`, `s3e-destinations-nl-group-rec-sheet.jpg` |
| 6 | Phone controls overlap the ring and its pivot | `s1-phone-sheet.jpg` |
| 7 | Phone group end: clusters and labels overlap | `p-3-lean-and-end-crop.jpg` |
| 8 | Light theme: "Every place on the globe (55)" is dark brown `rgb(75,68,59)` on the black hero, which is unreadable | `s1-home-desk-top.png`, `s1-home-phone-stage.png` |
| 9 | Legend repeats "Hollow markers" with two different meanings (country vs city) | `s1-home-desk-top.png`, `s1-home-phone-stage.png` |
| 10 | The wheel over the desk scrolls the page and never leans in (a design choice to confirm; zoom-out stops at the desk as asked) | `s3-more.json` `wheel` |

Harness: `cdp.mjs` (browser profile on D:), `rec.mjs`, `s1-rest.mjs`, `s2-motion.mjs` (set `PHONE=1` / `DARK=1` for phone and dark), `s3-more.mjs`, `sheet.py`. Contact sheets: `d-contact-sheet.jpg`, `p-contact-sheet.jpg`, `s3a-lean-sheet.jpg`, `s1-phone-sheet.jpg`.
