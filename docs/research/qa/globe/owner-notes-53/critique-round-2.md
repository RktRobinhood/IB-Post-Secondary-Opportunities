# Globe after the owner's notes on #53: critique, round 2

This critique covers two roles at once: the art director and the motion critic. I am a fresh critic. I did not build this and did not score round 1.

**Inputs:**
- `round-2/fixes.md`, all 25 JPEGs beside it, and `round-2/report.json`
- `critique-round-1.md`
- the owner's notes on #53, including the later phone notes: no visible "Open United States →" line, and one card, not a quick card and then a detailed one

**What I shot:** `main` at d2e5fcf, built into a private copy and served on :4442. The pages were opened with `?map=globe`, in headless Chromium with SwiftShader.

**Where the shots are:** outside the repo, in the session scratch directory `…/scratchpad/critic-globe2/shots/`. The JSON for each run is in `report-*.json` in the same folder.
- `p-{light,dark,reduced}-*`: a 390×844 phone on home. I turned the globe to the United States by hand with touch drags, then made a real touch tap on its light. There are frames at 60 ms, about 400 ms, about 1.2 s and after the flight, plus Back. A MutationObserver and a per-frame sampler watched the card from the tap onwards.
- `m-phone-sheet.jpg`, `m-desk-sheet.jpg`: the flight to the United States in slow motion. The page clock ran at 1/10 speed, so every step of the turn and the lean-in is visible. `m-phone-*` and `m-desk-*` are the single frames.
- `s-phone-*`: first paint over 1.6 Mbit/s with 150 ms latency.
- `f-{phone,desk}-fold-open`: "All places" opened on home.
- `nums` report: the United States light's count, and the members of the groups on arrival.

I have not scored the street-level tiles, which cannot load here.

## SCORE: 7.5 / 10

**It is close, but not yet 8.**

**Every note the owner wrote is now met or mostly met:**
- It floats.
- No old map appears first.
- The card is the link, with no "Open …" line.
- One card, drawn once.
- The buttons sit off the globe on the phone.
- Lights sit at country centres.
- A group dive stops at the countries level.

This is a real step up from round 1, and the motion is the best this hero has had.

**Why it is not 8:** the frame the owner will see first when they repeat their own phone test (tap the United States on home) still has three faults:
- A school label sits on top of a numbered group.
- Three different numbers describe the United States: 12 or 15 on the light, 14 on the card, and 19 in the biggest group.
- Clouds cover the land and there are JPEG blocks in the sea, so the "photographs first" moment looks murky.

The zoomed view is also only half round. The flight passes through a clean floating sphere, then overshoots into a dome with blurred edges.

## Why

### The owner's notes, checked on a phone (390×844)

| Owner's note | Verdict | Evidence |
|---|---|---|
| One card, not a quick card and then a detailed one | **Met** | The observer logged one burst of mutations, at the first frame after the tap. The card never changes after that: the same element, the same title, 224 px tall in every sample. It is the same in light, dark and reduced motion. It is identical in every frame of `m-phone-sheet.jpg`. The only later change is the photograph filling its reserved box about 200 ms later on localhost. On a school network, a student will see an empty tinted box and then Georgetown. That is not a two-step card, but it is still a small pop (see change 3). |
| No visible "Open United States →" | **Met** | The card shows the flag, the title, a small accent arrow and "14 institutions · Researched in depth". There is one link, and its hidden name says "— Open United States" for a screen reader only. |
| The card is the link | **Met** | One `<a>`, stretched over the card, with nothing interactive nested inside it. |
| No background; it floats | **Met at rest, mostly met when zoomed** | At rest in both themes it is a brass desk globe on the page's own paper. The lean-in has feathered edges now, not a hard slab. |
| "Resume into a sphere, not a sphere with background" | **Half met** | The flight does exactly what the owner described, briefly. At about alt 2.2 there is a whole photographic sphere floating free on the paper (`m-desk-sheet` #12, `m-phone-sheet` #13). Then it keeps diving. The phone lands at alt 0.90 on a dome: the limb shows only across the top, and the left, right and bottom edges are feathered into paper (`p-light-05-us-arrived.jpg`). It no longer reads as a box, but it does not read as a sphere either. It reads as a cropped photo with blurred edges and a blue haze along the top. |
| Pins at the centre of large countries | **Met** | United States over Kansas, Canada over Manitoba. |
| "Country, region, countries, schools" | **Mostly met** | The big group now opens into named countries (`07`). But once a country is chosen, its schools are grouped together with its neighbour's (below). |
| No old map before the globe | **Met** | Paper, then the still of the desk globe, then the globe. Nothing is swapped for something different. |
| Buttons off the globe | **Met** | On a phone, "+ − Reset" is a row above the stage: outside it, 22 px clear of the ring, and in the same place at rest and after arrival. The card is below the stage. |
| Reduced motion | **Met** | With `prefers-reduced-motion: reduce`, the first frame after the tap is already the end state: the same alt 0.897, the same pins and the same card (`p-reduced-02-us-60ms.jpg`). Back closes the card and restores the URL in every mode. |

### Motion: it feels like holding a world

The desktop sheet is the strongest evidence in this round.
- The desk globe turns left on its axis (#0 to #8) and leans a little towards the light (#10).
- The ring and stand then dissolve as the painted globe becomes the photograph (#11).
- For one beat it is a whole floating Earth (#12), and then it leans in.

That is the owner's brief in one second. The phone follows the same path.

Three things break readability while it moves:
- **The chosen country's schools appear before the turn.** At #4 on desktop, "Arizona State University" and the "4" and "7" groups sit on the brass ring at the upper-left limb, while the globe still shows Africa. On the phone, the "12" light rides over the ring at the limb at 60 ms (round 2's own `03-phone-home-us-60ms.jpg` shows the same).
- **At desk altitude, a single school label crosses the whole United States** (`m-desk` #8 and #10). It hides the groups under it.
- **The round-5 cloud streak is still there.** At alt 0.82, a long white diagonal streak comes down from the top of the stage (`m-desk-sheet` #14).

### Where it still fails the art director

1. **The owner's own test ends on a collision and three numbers.** In `p-light-05-us-arrived.jpg`:
   - The "Macalester" label covers the "19" group, so the owner sees a struck-through "1̶9".
   - The US light read "12" during the turn, or "15" when merged at desk altitude. The card says "14 institutions". The biggest group on arrival says "19".
   - The "19" is 11 US schools plus 8 Canadian ones (uOttawa, U of T, Queen's, McMaster, McGill, Dal, Concordia, Waterloo, Western), and the "5" is Canada's west.
   - So after choosing the United States, the phone names only two of its 14 schools: Macalester and Arizona State. Most of the rest are inside a group that holds more schools than the country has in total.

   The same collision happens on desktop: "Michigan" is on the "4" (`05`, `m-desk` #24), the United Kingdom label is under a grey "16" (`09`), and "Norway" and "Austria" are covered by rings (`07`).
2. **The lean-in photograph is not good enough to be the hero.**
   - Clouds cover a third of the United States on the phone, including the Great Lakes, where the "19" sits.
   - The seas have 8×8 blocks (`09`: the North Sea, the Adriatic and the Aegean; `05`: the Gulf and the Atlantic).
   - Clouds are pixelated along the right-hand limb (`m-desk` #24).

   The brief says photographs first. At this altitude, the photograph is the satellite image, and it looks like a compressed JPEG.
3. **The schools level is a bingo card.** Over Europe at 0.3 (`08`) there are about 45 numbered circles and 8 names. Some of those names are still cryptic to a student in Denmark: "Unistra", "Nord", "Constructor", "U of T", "Dal", "Western". "Michigan" reads as a state; its card says "Ann Arbor, Michigan", which does not settle it. `readableName()` treats any single capitalised token as "a word".
4. **Home's legend contradicts the card.** "Bigger light, more degrees" sits directly under a card that counts "14 institutions". The United States is a door on home.
5. **A dead control on desktop home.** "All places (55)" is visible under the globe. Clicking it opens a `<details>` whose list is hidden on purpose (`site.css`, `.discover__globe .world__list` is visually hidden when the globe is on). Nothing appears, and the summary just gets a margin (`f-desk-fold-open.jpg`). On a phone it is hidden unless it has focus, which is fine.
6. **The still does not fix the slow first paint.**
   - The poster is `<img … loading="lazy" decoding="async">` in the first screen, so the browser fetches it late.
   - At 1.6 Mbit/s the phone hero was still an empty 290 px hole about 3 s after navigation, and the still arrived at about 4 s (`s-phone-2500.jpg` compared with `s-phone-4000.jpg`). Round 1 measured 3.7 s, so the still has barely moved the time the hole is visible.
   - The poster's halo is also a hard-edged grey plate: 245/244/239 on 251/246/240 paper, with a visible rim in `01-home-desk-200ms.jpg`. The live globe's halo is soft, so the handover shows a disc disappearing.

### What is clearly better than round 1

- **The phone layout is right.** Buttons are above the stage, the card is a full-width sheet below it, and the chosen country owns the whole stage. Round 1's worst phone problem, the card covering the schools, is gone.
- **The countries level exists on a group dive** (`07`): flags and names, and a curved horizon with paper around it.
- **Schools carry photographs**, including Denmark's card with the AAU photograph.
- **No globe means a still plus one honest line**, not 55 chips (`10-*`).
- **Home's Nearby door and the globe now agree on 16.**

## The three changes that would raise it most (ranked)

1. **Make the arrival on a chosen country clean and consistent. This is the owner's own test.**
   - When a country is chosen, cluster only that country's schools. Leave the neighbours' schools unclustered at reduced opacity, or hide them until the choice is cleared. Choosing the United States should show 14 schools as names and groups that add up to 14, never a "19" that includes Canada.
   - A chosen country's light never merges with a neighbour, and it shows the card's number: 14, not 12 or 15.
   - Place labels after groups. Drop or flip any label whose rectangle crosses a group or another pin. This fixes Macalester over 19, Michigan over 4, the United Kingdom under 16, and Norway and Austria.
   - Add two guards to `test-map.mjs`:
     - At 390×844, after `goToPlace(us)`, no label intersects a group, and the visible counts of the chosen country's pins sum to `p.count`.
     - The country light shows `p.count`.
   - Do not open the chosen country's schools until the turn has brought them to face the camera. Nothing may be drawn over the brass ring.
2. **Land a country lean-in on a sphere, and make the picture there a photograph worth landing on.**
   - The flight already passes a perfect floating Earth (desktop alt ≈ 2.2, phone ≈ 2.2). For a country or region choice, stop where the limb is visible on the top, left and right of the stage. On the phone, let the sphere extend below the feathered bottom edge. Keep the full-stage feathered view for a group of schools, a campus, or a later zoom.
   - Fade the cloud layer to 0 below about alt 1.3. That removes the white blobs over the schools and the diagonal streak.
   - Replace the blocky sea: a flat or gradient sea colour masked by the land, or a sea texture that is not 8×8 JPEG blocks.
   - Result: the owner's "resume into a sphere" becomes the end state, not a single passing frame.
3. **First paint and small honesty fixes on home.**
   - Poster: `loading="eager" fetchpriority="high"`, plus `<link rel="preload" as="image">` for the current theme's still.
   - Give the still a soft radial halo that matches the live one, not a flat grey disc.
   - Give the card photograph a placeholder in its average colour and a 150 ms fade, or prefetch it when the finger touches down on a light.
   - Either draw "All places" as a real list when it is opened on desktop home, or remove the summary while the globe is on.
   - Make the home legend match the door: "Bigger light, more places" (or the count's own unit) when a door's card is open.
   - Tighten `readableName()` so that "U of T", "Dal", "Unistra", "Nord" and "Western" fall back to the full name, and a school named like its state gets its full name ("University of Michigan").

## Also worth doing (after the three)

- Thin out the schools level over Europe (`08`). For example, show countries' lights until a country is chosen or the zoom passes a threshold. That keeps "country, region, countries, schools" strictly in order instead of 45 numbers at once.
- Round 5's leftover pins drawn on the limb (`02-countries-desk-*`: half-visible rings on the right-hand edge of the globe), and the grey "2" floating above the horizon in `08`.
