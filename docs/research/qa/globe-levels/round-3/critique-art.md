# Art-director critique: globe levels, round 3

**Score: 6 / 10. Not shippable today.**

The desktop is now about 7.5. The world globe, the Europe map, Asia, North America, the USA and the mid-flight frames all look like one toy. The phone is still at about 4.5, and the phone counts as much as the desktop.
- The phone continent level is still a heap. It got worse, not better: report.json lists 11 to 12 labels on other coins in phone-*-2 and phone-*-5, up from 8 to 10 in round 2. The layout also still changes between visits.
- The country level still jumps from a pastel toy to a dark satellite photograph. The "pastel wash" cannot be seen in light mode.
- The dotted route is still on the map at rest in two of the five country frames.

## What improved (keep it)

- **Real coastlines are back.** Frames: input-4-uk, input-4-japan, input-4-usa.
  - Great Britain, Northern Ireland, Kyushu, Shikoku and Hokkaido are their own shapes again.
  - The Bornholm pin now sits inside Denmark (desk-*-3).
  - The lasso is gone.
- **Mid-flight frames are clean.**
  - Mid-flight to Denmark (desk-light-3a) was the worst frame in round 2 and is now one of the best. The Europe coins are gone, Denmark has a white outline, a small plane flies in, and the card arrives with its Nyhavn photo already loaded.
  - Mid-flight to Europe (2a) shows the globe turned to Europe and Africa. It is the most beautiful frame in the set.
- **Asia** (input-3-asia) works as a continent frame.
  - The pastel globe limb, a flag and name on each of six coins, and Europe waiting as a ghost on the rim in its true direction.
  - South Korea's 14 now sits on Korea.
- **Neighbours at country level have no threads.** In input-4-uk, Ireland, Denmark, the Netherlands, Belgium, Luxembourg and France sit quietly faded at the edges. Nothing hangs into the card.
- **One hook per country.** The globe card and the list tile now say the same thing (UK, Japan, USA, Netherlands).
- **The chosen university is named on the map.** "Aarhus University" has an orange pin and a label in both themes and on the phone (desk-*-4, phone-*-4b).
- **The desktop continent level** (desk-*-2): 25 of 26 coins are named or coded. "DE" and "LU" are a sensible fallback.

## What still fails

### 1. Phone continent level: still a pile, now a bigger one (biggest problem)
- `labelsOnNodes` has these counts:
  - phone-light-2: 12
  - phone-dark-2: 11
  - phone-light-5: 11
  - phone-dark-5: 12
  - Desktop: 1 or 2.
- **Denmark cannot be found.**
  - In phone-light-2 and phone-dark-2, no Danish flag is visible anywhere.
  - In phone-light-5, the pill reads only "K", with a coin covering the rest.
  - This is the home country, three taps from the "Right here" door.
- **The layout is not stable.** The brief said a level's layout is the same on every visit, but it is not:
  - phone-light-2 names Sweden and Spain.
  - phone-light-5 shows "SE" and "ES", and names Norway and Latvia instead.
  - phone-dark-2 names Ireland; phone-light-2 does not.
  - The camera framing differs too: the UK coin is at y≈430 in one frame and y≈462 in another.
- **Some coins sit on the wrong land.** report.json lists `es->, ch->, si->it, is->`:
  - The Spain pill sits on France.
  - The Iceland "2" sits beside Sweden's pill.
  - The Netherlands, Belgium, Luxembourg and Germany form one stack of pills and coins on top of each other.
- **The stage is still letterboxed.** The map takes about 340 px of an 844 px screen, under a row of breadcrumb and +/−.

### 2. The country level is still a different art style
- desk-light-3, desk-light-4, phone-light-3, phone-light-4b and input-2-plus-plus show a dark navy sea and an olive-black land photograph beside a cream page. The tan tint on the country itself is the only trace of a "wash".
- Europe is a bright blue toy, the USA is pastel salmon on a toy-blue sea, and Denmark and the Netherlands are a night-time swamp. In light mode, this is the largest visual jump on the site.

### 3. The route is still on the map at rest
- **input-4-uk:** the dotted trail enters at the left edge and runs to Lancaster.
- **input-4-japan:** the dotted trail runs from under the breadcrumb down to Honshu.
- The fix may work on the Denmark walk, but these are rest frames, and a student will see them.

### 4. Denmark's coast is still too coarse for a country close-up
- At 50m, Jutland has straight sides and Zealand, Funen and Lolland are low-poly blocks (desk-*-3, phone-*-3).
- Next to the real coast in the photograph underneath, it still reads as cut paper.
- The UK and Japan hold up at 50m. Denmark, the Netherlands and other small countries need 10m.

### 5. Pins and cards at the country level
- **Unnamed pin heaps:**
  - The Randstad (input-2-plus-plus) has 11 unnamed pins.
  - The phone Denmark frame (phone-*-3) names 3 of 14 pins.
  - The Boston and New York area (input-4-usa) has 7 unnamed pins.
- **The university card is still one line long:** "5 programmes · Aarhus" (desk-*-4, phone-*-4b). There is nothing about what you can study there.
- **"Imagery: NASA" is still cut off** by the docked card (desk-*-3/4, input-2-plus-plus, input-4-usa).

### 6. Smaller things
- **The world globe at rest (desk-*-1) faces Central Asia.**
  - Europe is pushed to the left side of the globe, and most of the view is Russia and China.
  - For a European audience, the 2a orientation (Europe and Africa facing the student, with all four coins still visible) is the better resting view.
- **Mid-flight (2a): Oceania's 27 sits on Iran.** A rim chip would be better.
- **Explore door (doors-far): Europe is a grey coin on Siberia.** It is the right direction, but it reads as the wrong place.
- **Desktop Europe:**
  - Luxembourg's "2" floats inside Germany, away from its "LU" pill.
  - Portugal's coin is in the Atlantic (`pt->`).
  - Austria's label sits on another coin.
- **The phone world globe** (phone-*-1) is about 235 px wide, an improvement but not the ~330 px asked for. +/−/RESET still sit above it as a row of form buttons.
- **The list copy beside the globe reads like homework.** For example: "researched, no programme mapped yet" and "Its degrees are not mapped one by one yet. Its own page:" (input-4-uk/japan/usa, input-3-asia).

## The five changes that would raise the score most

1. **Phone continent level: stop placing labels on the map** (phone-*-2-europe, phone-*-5).
   - Below 480 px, the map carries only the numbered coins, pushed apart so none overlaps, each with a small dot to its true spot when moved.
   - Directly under the map, add a horizontally scrolling chip rail: flag, 2-letter code and count, sorted by count, with Denmark pinned first. Tapping a chip lights its coin; tapping a coin scrolls to its chip.
   - Fix the camera to the coins' bounding box with a fixed seed. Light, dark, fresh and back must give identical pixels.
   - Guard: `labelsOnNodes` = [] and an identical node-position hash in all four phone frames.

2. **Make the country level the same toy as Europe** (desk-light-3/4, phone-light-3/4b, input-2-plus-plus, input-4-uk, input-4-japan).
   - Use the input-4-usa recipe everywhere:
     - Toy-blue sea.
     - The chosen country in a solid pastel political fill with ink coasts.
     - Neighbours in their pastel fills.
   - Satellite only as a texture of 15% or less, or not at all.
   - Remove the dark vignette.
   - Acceptance: the light-mode Denmark stage's mean luminance is within 15% of the Europe stage's.

3. **Kill the route at rest, for real** (input-4-uk, input-4-japan).
   - Remove the trail and plane from the DOM or canvas when the camera settles, not on a timer that a deep link or keyboard flight can skip.
   - Add a rest-frame check to report.json (trail elements = 0) for every country frame.

4. **Use 10m coastlines at country zoom and name the heaps** (desk-*-3, phone-*-3, input-2-plus-plus, input-4-usa).
   - Load 10m outlines for the selected country and its neighbours, so Limfjord, the Danish islands and the Dutch Wadden islands appear.
   - Wherever more than 3 pins fall within 24 px, draw a cluster coin ("6 · Randstad", "5 · Copenhagen", "7 · Boston–NYC") that fans out on tap.
   - On the phone, label at least 6 of Denmark's 14.

5. **Richer university card, Europe-facing world rest, inset credit** (desk-*-4, phone-*-4b, desk-*-1, desk-*-3).
   - Give the university card one line about its subjects, for example "Cognitive science to computer science · 5 programmes".
   - Rest the world globe at the 2a orientation, with Europe facing the student and the other three coins on the visible face or as rim chips, never on Iran or Siberia.
   - Inset "Imagery: NASA" top-right so the docked card never covers it.
