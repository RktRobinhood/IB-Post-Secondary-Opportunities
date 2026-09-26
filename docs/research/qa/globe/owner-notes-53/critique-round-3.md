# Globe after the owner's notes on #53: critique, round 3

This critique covers two roles at once: the art director and the motion critic. I am a fresh critic. I did not build this and did not score rounds 1 or 2.

**Inputs:** `round-3/fixes.md`, all 26 JPEGs and `report.json` beside it, and `critique-round-{1,2}.md`.

**What I shot:** `main` at d4e2c3d, copied to a private folder, built, and served on :4443. Pages were opened with `?map=globe` in headless Chromium with SwiftShader. Street tiles cannot load here, so I have not scored them. Shots and JSON are in `scratchpad/critic-globe3/shots/`.
- `p-{light,dark,reduced}-*`: the owner's test on a 390×844 phone. I turned the globe to the United States with touch drags, then tapped its light with a real touch, and took frames at 60 ms, "400 ms", and on arrival, then pressed Back. A MutationObserver and a per-frame sampler watched the card.
  - SwiftShader stretches real time: the "400 ms" frame was taken at 1.4 s.
  - The true mid-flight frames are in the slow-motion runs (page clock at 1/8 speed): `sheet-phone-us.jpg` and `sheet-desk-us.jpg`.
- `e-*`, `b-*`, `g-*`, `g3-*`, `u-*`:
  - desktop home and `/countries/`
  - the Europe group dive on desktop and on a phone
  - Denmark from the group, then Back twice
  - the Denmark door on a phone
  - reduced motion with dark mode on desktop
  - the chosen-country count for the UK, Denmark, the Netherlands and Germany
- `n-*`: first paint on a throttled link (1.6 Mbit/s, 150 ms latency, cache off).

## SCORE: 7 / 10

**The owner's own test now passes. The European paths that most of these students will try first do not.**

What round 3 fixed, which I confirmed:
- **The phone US test is clean.**
  - The card is drawn once, 115 ms after the tap. It is the same element to the end, 224 px tall, in light, dark and reduced motion.
  - The US opens only once it faces you.
  - 2 + 4 + 7 + Arizona State = 14, which matches the card. No label sits on a group, and nothing rides the ring.
  - The mid-flight frame is the owner's brief exactly: a whole photographic Earth floating on the paper (`m-phone-us-06.jpg`).
- **Clouds are gone at arrival** on the phone and on `/countries/`.
- **First paint is fixed.** On the throttled phone, the still is preloaded alongside the CSS. First paint and LCP are the same frame, at 2.99 s, and that frame is the desk globe. There is no longer a hole. The live globe lands on the still in the same pose, about 8 s in.

Why it is still not 8. Each of the following was found with a real tap, on a path a student in Denmark will take in their first minute:

1. **Back does not restore the globe.**
   - Choose the United States on home, then press Back. The card closes and the URL is restored, but the US light stays coral (`data-on`). Every other light, including Denmark's "73", stays at 45% opacity (`b-after-back-6s.jpg`; the probe logged `73@0.45`). Tapping elsewhere does not clear it.
   - On `/countries/`, go group → Denmark → Back. The camera returns to the group view, but the Denmark card stays open and everything else stays faded (`e-03-countries-back1.jpg`).
   - Press Back again. The globe is at rest, but every light is ghosted at 0.45 and the groups have re-merged into different numbers ("204", "75", "18" instead of "281", "25"; `e-04-countries-back2.jpg`).
   - **Cause:** in `globe.js`, `onPop`, the branch with no selection calls `closeCard()` but not `openOnly([])` or `light(null)`, which `goHome()` does call. The branch that pops to a `view` never closes the card. This breaks the owner's standing rule that Back undoes every choice.
2. **On a phone, the group dive is a dead end.**
   - On `/countries/`, tap "308". The camera stops at alt 1.977 and shows "206", "75" and "25", not countries.
   - Tap "206": pointerdown, pointerup and click all reach `.world__cluster` (15 countries), and the camera does not move (alt 1.977 before and after, `g-phone-tap2.jpg`). Only "+" gets you further.
   - **Cause:** `openGroup` sets `floor = max(SCHOOLS_ALT*1.25, sphereAlt())`. Round 3's new `sphereAlt()` needs the limb at both sides at half height, which is about 1.95 on a 358 px stage. The fit is clamped to where the camera already is.
   - The round-3 fix for "land on a sphere" caused this regression. On desktop the same click does reach the countries level (`e-01`).
3. **Europe's own countries arrive as one lump with the wrong number.** The US was measured; nothing else was. On `/countries/` at 1280×800, every country lands at the same alt, 0.479: the sphere floor.

   | Chosen | Card and chip say | On the globe | Schools named |
   |---|---|---|---|
   | United Kingdom | 22 institutions | "13" + "3" = 16 | 0 |
   | Netherlands | 22 institutions | one "15" | 0 |
   | Germany | 14 | 3 + 7 + 2 + 1 = 13 | 1 |
   | Denmark | 15 | "14" + an unlabelled dot | 0 |

   (`u-gb/nl/de/dk.jpg`, `e-02-countries-denmark.jpg`)
   - The UK, the Netherlands and Germany have fewer schools placed on the globe than their count says (16/22, 15/22, 13/14), so the numbers disagree for every European student.
   - At the sphere floor, a small country never comes apart. Choosing the Netherlands, or Denmark, the students' own country, shows one number and no school names.
   - Around that number are about 20 identical hollow rings: the neighbours at 45% with their labels dropped. In dark mode they read as holes punched in the photograph (`g-desk-reduced-dark-uk.jpg`).
4. **The Denmark door ("Right here", phone) was not given the round-3 rules.**
   - Four navy groups ("3", "6", "2", "6", which are Norwegian, Swedish and German schools) sit at full strength around Denmark's gold "27" and "14", with grey dots scattered between them.
   - The card says "16 places · 57 degrees", and the navy numbers belong to neither count.
   - The stage is a feathered rectangle, which is the "sphere with background" the owner asked not to see. "Sønderborg" is pressed against the stage's left edge, and one dot sits below the stage's bottom feather (`e-09-phone-dk-door-stage.jpg`).

## Why, in detail

### Motion: does it feel like holding a world?

**Phone: yes.** This is the best flight this hero has had (`sheet-phone-us.jpg`).
- The desk globe turns on its axis (frames 00–04).
- It leans in and the brass grows (05).
- The desk dissolves into a whole photographic Earth floating free on the paper, with clouds (06).
- The clouds thin as it leans in (07–08), and only then does the US light open into 2, 4, 7 and Arizona State (09).
- The whole move takes about 1.3 s of real time. The country light swaps to its groups in one frame, which reads as the zoom stepping down a level, not as a second card.

**Desktop `/countries/`: less so** (`sheet-desk-us.jpg`).
- During the lean, the brass ring and stand grow past the stage and are cut off by a straight line at the top and bottom (`m-desk-us-04.jpg`). The invisible box shows for a beat, in the one frame that should be a desk globe.
- The next frame (alt 2.19) is already bigger than the stage, so on desktop there is never a whole floating Earth.
- It then lands at alt 0.52 on a horizon: the limb on top, with the flanks feathered off. That is better than round 2's slab, but it is a horizon, not a sphere.
- At alt 2.19 there is still a vertical cloud streak through the Great Lakes (`m-desk-us-05.jpg`).

**Desktop home, US** (`e-06-home-desk-us-arrived.jpg`):
- It lands at alt 2.38, above the cloud cut-off, so white cloud banks cover Michigan and the Great Lakes. That is where the "7" sits, and the Michigan pin has lost its label under them.
- The sphere is cut by the stage at the top and the right.
- A ghosted "73" sits behind the RESET button, and a ghosted "2" sits on the limb.
- The chosen country's groups are navy here, coral on the phone, and gold on `/countries/`. That is three colours for the same meaning.

**Reduced motion: met.** The first frame after the tap is already the end state, on the phone (60 ms) and on desktop in dark mode (80 ms). Its only problems are the Back bug and the lump above.

**Readable while it moves:** yes on the phone. Nothing is drawn on the brass, and no label is drawn during the turn.

### Art director

- **Photographs first:**
  - The card photographs are good: Georgetown, the AAU building, TU Delft's library, Tower Bridge at dusk.
  - The satellite image at alt 0.48–0.52 is soft and blotchy on desktop: the deserts and the Great Plains look like JPEG. The sea is smooth now.
  - `06-countries-school-card` (Michigan) is a blurred green smear under a plane. That is where street tiles would be, so I have not scored it.
- **One line per block:**
  - The card is right: a flag, a title, an arrow, and one meta line.
  - The school card has three lines ("Ann Arbor, Michigan" and "In United States"). One would do: "Ann Arbor · United States".
- **The phone is as serious as desktop in layout:** the buttons are above the stage and the card is below it, with no overlap. But at rest the globe is only about 210 px across on a 390 px screen, and the stand takes a quarter of the stage. It is the smallest thing in the first screen after the headline.
- **Fun:** the desk globe is charming, and the dotted route and plane appear between places. The hollow neighbour rings, the grey ghost rings, and the navy/coral/gold mix make the zoomed views look like a dashboard rather than a toy.

### The owner's notes, on a phone

| Note | Verdict |
|---|---|
| Floats, no background | Met at rest in both themes. The dark theme at arrival looks especially good: a planet with a blue rim. |
| "Resume into a sphere" | Phone: met in flight, and mostly at arrival (limb on top and both sides, feathered bottom). Desktop: not met (a horizon, and the box crops the desk during the lean). Denmark door and the Netherlands page: feathered rectangles. |
| Pins at the centre of large countries | Met. |
| Country, region, countries, schools | Met for the US. Broken on a phone after a group (dead tap). Broken for small European countries (a lump, not schools). |
| No old map first | Met, and now also on a slow link. |
| The card is the link, no "Open …" | Met. There is one `<a>`, and "Open United States" is for screen readers only. |
| One card, no two-step | Met everywhere I looked. |

## The three changes that would raise it most (ranked)

1. **Make Back and Reset undo the whole choice, and test it on the phone.**
   - In `onPop`, the branch with no selection should do what `goHome()` does: `openOnly([])`, `light(null)` and `closeCard()`.
   - When popping to a `view` selection, close the card and relight only that view's members.
   - Add a browser guard to `test-map.mjs` or the shoot:
     - On a phone, tap the US and press Back. No `.world__pin[data-on]`, every light at opacity 1, and the rest numbers equal the ones before the tap ("73" on home; "281" and "25" on `/countries/`).
     - Group → Denmark → Back. No card.

   This takes minutes, and it is currently the first thing a curious student will run into.
2. **Let Europe's countries land on their schools, with numbers that add up.** This is what these students will actually choose.
   - **The dead tap:**
     - `openGroup` must never be a no-op. If the fit is not at least about 15% below `view.alt`, go to the next level anyway: countries, then schools.
     - On a phone, the countries floor must be below the altitude at which the group splits. Use the round-2 idea: stop at the sphere only for the first choice, never for a second tap.
   - **Small countries:**
     - When a chosen country's schools cannot come apart at the sphere floor, either drop below the floor for that country (a feathered close-up is right for "schools"), or fan the chosen country's schools out around its light at the floor, with names.
     - Either way, Denmark and the Netherlands must show school names on arrival, not "14" and "15".
   - **The count:** either put every institution the card counts on the globe, or make the card say what the globe shows ("16 of 22 on the map"). Extend `chosenReport` to every country page and add a guard that the sum equals the card for all of them, not only `us`.
   - **Neighbours:** show them as small solid dots, not the unlabelled hollow rings, which read as holes.
   - **The Denmark door:** give it round 3's chosen-country rules (neighbours closed and faded, no navy groups at full strength), and end it on a sphere, not a rectangle.
3. **Make the desktop lean-in as good as the phone's.**
   - Start the desk's dissolve before the brass reaches the stage edge, or shrink it while it leans, so no straight crop line ever cuts the ring or the stand.
   - For a country choice on desktop, land where the phone lands relative to the stage: a whole Earth with limb all round, like `m-phone-us-06`. Keep 0.48 for a second choice.
   - Desktop home lands at 2.38, above the cloud cut-off. Fade clouds from the moment a country is chosen, not by altitude alone, so Michigan is not under a cloud bank. Keep ghosted neighbours out from behind the buttons.
   - Use one colour for "the chosen country's schools" (coral) everywhere. Label more than one of the US's 14 on the phone: 5 of them would fit next to the three groups at alt 1.45.

## Also worth doing (after the three)

- Make the phone globe bigger at rest (about 260–280 px across). The stage has the room, and the stand can shrink.
- The Europe schools level at 0.3 is still a bingo card of about 45 numbers (`08`, acknowledged in `fixes.md`).
- On a phone, `×` after a choice rewrote the URL to `/#place=us` and dropped the query string. That is harmless for `?map=globe`, but check it cannot drop a real filter query.
- The school card's meta could be one line: "Ann Arbor · United States".
