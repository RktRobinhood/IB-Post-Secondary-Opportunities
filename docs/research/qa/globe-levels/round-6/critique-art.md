# Art-director critique: globe levels, round 6

**Score: 7 / 10. Not yet. I would not ship it to students today.**

Denmark is now a toy at last: flat colour, sea, no green photo rims and no blurred glow. But the new map has a fault of its own: two coasts that do not line up. And the "toy" look stops at Denmark. The UK, the USA, Japan and the North America continent are still tinted photographs. Pin naming hasn't moved since round 5 (phone Denmark 3/14, and the selected pin is still unnamed). Desktop is about 8, phone about 6.5. That is the same split as last round, so the score stays where it was.

## What improved (keep it)

- **Denmark's country level is flat pastel on toy-blue sea** (desk-*-3/4, phone-*-3).
  - The satellite grain and green rims are gone from Denmark.
  - Germany is a flat pink and Sweden a flat olive.
  - Light and dark give the same map.
- **The card waits for the camera to land** (desk-light-3a). At 50% of the flight there is no card, and the plane over Germany is visible. That is the best frame on the site.
- **The phone university card** (phone-*-4b) shows the Aarhus photo, then "Aarhus University →", then what you can study there. It is clean, and the filter chip below matches it.
- **"Zealand Academy" is written in full**, and it no longer reads as the island.
- **Explore door** (doors-far): no grey Europe coin sits on Siberia now.
  - The new lead, "10 countries to explore · each has its own page:", is an invitation, not an apology.
  - The words "not mapped one by one yet" are gone everywhere I looked.
- **The NASA credit is out from under the docked card.**
- **The report is clean:** `overlaps` 0 and `labelsOnNodes` 0 in every run, and one camera per level (desk alt 0.151, phone 0.125, back = fresh).

## What still fails

### 1. Denmark has two coasts that disagree (new, and the most visible thing in the frame)
- Zoom into desk-light-3 (north Jutland, Djursland, Funen, Zealand). The terracotta fill and the thin rust ink line are two separate outlines, offset by about 4–8 px.
  - The ink runs through open sea west of Jutland and north of Zealand.
  - The fill pokes out past the ink on Funen's south coast.
- The result looks like a misprinted stamp. On the phone (phone-*-3) the doubled coast is again the busiest texture in the stage.
- **The fill polygon is coarse.** The Limfjord is missing, and Funen is a rounded pentagon. Inside it the terracotta still carries mottled blotches, so it is not flat.
- **The chosen colour is a dark rust-terracotta, not a "warmer pastel."** Against pink Germany and olive Sweden it reads as heavy and brown, not as a toy.

### 2. The toy look stops at Denmark
- **input-4-uk:**
  - Britain is olive-tan satellite with grain.
  - France and the Low Countries are brown grain.
  - The chosen country has no warm stroke at all.
- **input-4-usa:** the USA is a tinted relief photo, and Mexico and Cuba are raw satellite.
- **input-4-japan:** Japan is tan grain, Korea olive grain and China brown grain. The coasts are doubled.
- **input-3-north-america:** Canada's Arctic islands are burnt yellow-white satellite, and Mexico is raw.
- So 1 of the 4 country frames I checked is a toy. A student who clicks the UK gets the round-5 look.

### 3. Pins are still seeds, not places (no change since round 5)
- **Phone Denmark:** 3 of 14 named.
  - In phone-*-4b Aarhus University is the selected orange pin and has no name on the map.
  - Copenhagen's five pins, Odense and Esbjerg are anonymous.
- **Desktop:**
  - Denmark 8/14, the Netherlands 8/22, the UK 7/22, Japan 7/15, the USA 6/14.
  - The UK still has a white spider of leader lines over London.
  - Tokyo is a knot of six unnamed pins.

### 4. Leftovers
- **"Imagery: NASA" now collides with the + button** in input-4-uk, input-4-japan and doors-far (where it reads "Imagery: NAS"). In dark mode (desk-dark-3, phone-dark-3) it is nearly invisible grey on grey.
- **Desktop Europe** (desk-*-2):
  - Austria's 8 coin has no label (report `label: ""`).
  - Germany, Luxembourg and Switzerland are still DE, LU and CH.
  - Portugal's label still floats above-left of its 9 coin.
- **The Nearby door says "25 countries"**, but the map and card say 26.
- **Phone world** (phone-*-1):
  - The globe is still about 250 px wide.
  - +/−/RESET are square form buttons in their own row. They read as a spreadsheet toolbar above a toy.
- **The list copy repeats itself:** "United Kingdom · its universities and how to apply →" is followed straight away by "Its universities, and how to apply:". Pick one.
- **The stage edge is a soft cream vignette.** In dark mode it becomes a muddy halo around a very bright day-blue map. Give the stage a crisp rounded edge in dark mode.

## The five changes that would raise the score most

1. **One coast, from one source.** Draw the land fill and the ink stroke from the same polygon in the same projection pass, so the offset is zero.
   - Use the finer borders for both, so the Limfjord and the Funen bays show.
   - Fill flat, with no texture. Use a lighter apricot for the chosen country (about #F2B98A), with a 2 px warm-ink stroke.
   - Acceptance: in a 3× crop of desk-light-3 there is no ink in open sea, and no fill outside the ink.
2. **Paint the toy map for every country level, not just Denmark.**
   - The UK, the USA, Japan, Canada, Mexico, Korea, China and France should all be flat pastel with one ink coast.
   - Do the same at continent level for North America and Asia (input-3-*): no relief photo under land above 0.3 altitude.
   - Acceptance: no satellite pixels in input-3-north-america or input-4-*.
3. **Name every pin, with no grouping.**
   - Use a fixed "museum key" column at the stage edge, with straight leaders to dense pins (Copenhagen ×5, London, Tokyo, Boston–NY, Randstad).
   - Always name the selected pin.
   - Targets: phone Denmark 14/14, and desktop NL, UK and Japan at least 18/22, 18/22 and 13/15.
4. **Move the controls onto the toy.**
   - Make +/− round brass knobs on the ring or stage corner, and drop RESET (the breadcrumb's "World" already does that job).
   - Move "Imagery: NASA" to the bottom-left of the stage in 10 px type, at 60% opacity, with a contrast check in dark mode.
5. **One pass on Europe and the copy.**
   - Label Austria.
   - Write Germany in full; Luxembourg and Switzerland can sit outside on leaders.
   - Pin Portugal's label to its coin.
   - Change "25 countries" to 26.
   - Cut the second "Its universities, and how to apply:" line.
