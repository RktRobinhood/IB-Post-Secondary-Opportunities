# Art-director critique: globe levels, round 2

**Score: 6 / 10. Not shippable today.**

Desktop alone would be about 7.5. The continent level on desktop is now a real map: pastel desk-globe countries, ink coasts, and a flag and name on most coins. The cards are postcards. The numbers agree. Three things keep this from shipping:
- On a phone, the continent level is still a heap of coins that a student cannot read.
- The country level has a regression. Every highlighted country (Denmark, Netherlands, Japan, UK) is now drawn as a crude lasso polygon instead of its coastline.
- The flight's plane and dotted route stay on the map after landing.

## What improved (keep it)

- **Desktop continent level** (desk-light-2-europe, desk-dark-2-europe, doors-nearby, desk-*-5) is the best new frame:
  - The pastel political fill and ink borders carry the desk globe down a level.
  - The flags in dark pills look friendly and international.
  - 17 of 26 coins have a flag and a name.
  - Light and dark modes match.
- **Engineering filter** (doors-filter-engineering) is still the calmest, clearest frame. Grey dots, the two lit coins (Denmark 5, Netherlands 2) and every country flagged.
- **Postcard cards** (desk-*-3-denmark, input-4-uk, input-4-japan, input-4-usa, input-2-plus-plus):
  - Photo on the left, then the flag and name, a one-line hook, "14 universities · 51 programmes" and three university chips.
  - This is the right template, and Nyhavn, Tower Bridge, Kinderdijk and Central Park make the site feel like a place to go.
  - The status lines are gone.
- **Numbers agree.** UK shows 22 on the coin, the card and the list. Japan 15, Canada 20, China and UAE 14 all agree too.
- **Mid-flight to Europe** (2a, 2b) is much cleaner. The old coins have gone by 70%, and no ghost "243" is left.
- **World hover** (1b) keeps the coin on top: Europe turns into an orange "274" and stays readable.
- **North America** (input-3-north-america) is a lovely continent frame: two coins, two names and big pastel shapes.
- **USA at country level** (input-4-usa) stays in the pastel style with a soft salmon fill. It is the most "desk globe" of the country frames and should be the model for the others.

## What still fails

### 1. Phone continent level: a pile, not a map (biggest problem)
- **Labels sit on other coins.** report.json lists 8 to 10 labels on top of other coins in phone-light-2, phone-dark-2 and phone-*-5. On the desktop the count is 1 to 3.
  - In phone-light-2 the "United Kingdom" pill covers the coins between the UK and Denmark, and no Danish flag is visible anywhere. **The home country is unidentifiable on the phone again.**
- **Most coins carry only a flag, and the flags are 12 px.** At that size the Netherlands, Luxembourg, Austria and Latvia flags cannot be told apart.
- **Labels change between visits.** The same view shows different labels in light and dark, and again on the way back:
  - phone-light-2 names the UK and France.
  - phone-light-5 shows the UK as a flag only and France unnamed.
  - phone-dark-2 names Ireland; phone-light-2 does not.
- **The stage is wasted.**
  - It is about 340 px tall, and the top 50 px is empty fog.
  - The map is framed on the whole continent's outline, so Iceland, Malta and Portugal force a zoom-out and 20 coins cram into the middle 200 px.
- **The phone world globe is unchanged** (phone-*-1-world). It is still about 210 px across in a 390 px viewport, below a row of +/−/RESET buttons.

### 2. Country outlines have regressed to cut paper
- Compare round-1 input-4-japan (a real coastline with Kyushu, Shikoku and Hokkaido) with round-2 input-4-japan: Japan is now a 10-point lasso around the pins.
- The same shape appears elsewhere:
  - **Denmark** (desk-*-3/4, doors-here, phone-*-3/4): Jutland is a hexagon. Funen and Zealand are a single trapezoid.
  - **The Netherlands** (input-2-plus-plus): a six-point wedge.
  - **The UK** (input-4-uk): a jagged hull.
- The satellite photo underneath shows the real coast, so the outline visibly disagrees with the ground.
- Royal Danish Academy's Bornholm pin floats outside any outline.
- This is the home country, behind the "Right here" door, and it now looks like a convex hull, not Denmark.

### 3. The country level changes style
- Europe (pastel) → Denmark (dark satellite, heavy black vignette) is a hard jump. In light mode the stage becomes a dark green-black swamp beside a cream page.
- The USA stays pastel and Japan, Denmark, the UK and the Netherlands go satellite, so the style depends on altitude, not on the design.
- Below the world level, the brass ring and stand still vanish with nothing in their place. No bezel, no ticks.
- In light mode, the top ~110 px of the Europe stage is still empty milky fog (desk-light-2, doors-nearby).

### 4. The route and plane stay after landing; threads go to the wrong place
- **At rest the plane is still parked on the map.** A dotted trail runs in from outside the stage:
  - phone-light-3, phone-dark-3: the trail enters from the left edge and the plane sits on Jutland.
  - input-4-uk: the trail comes from the left edge to Lancaster.
  - input-4-japan: the trail starts under the breadcrumb.
- The dotted line looks better than last round's grey stroke, but it is still a straight line, not an arc. It should be gone once the flight lands.
- **Germany's leader thread** (desk-*-3, desk-*-4, doors-here) drops vertically from the faded "9" straight into the top edge of the docked card. It reads as the card hanging from Germany.
- **Mid-flight to Denmark at 50%** (desk-light-3a) is the messiest frame in the set:
  - All 26 Europe coins are still on screen.
  - A white starburst of threads surrounds Denmark.
  - Three half-coins are clipped at the left edge.
  - The card has already appeared, with a blank grey slot where the photo should be.

### 5. Coins at the edges and on the wrong land
- **Faded neighbour coins are jammed against the frame:**
  - Sweden "13" is pinned to the top edge (desk-*-3/4, doors-here, phone-*-3, where Norway is too).
  - Netherlands "22" and Belgium "11" are half off the right edge (input-4-uk).
  - Iceland "2" sits under the breadcrumb (input-4-uk).
  - Denmark "14" is crammed against the +/− buttons (input-2-plus-plus).
- **Continents waiting at the rim sit on the wrong land:**
  - doors-far: the "North America 34" coin sits on Japan and the Sea of Okhotsk, and Europe is a grey dot on Siberia.
  - input-3-asia: a ghost "274 Europe" hangs over the Caspian, and a ghost "27" sits on the rim.
  - input-3-asia: South Korea's "14" sits on Honshu, under the Japan pill, so it reads as Japan's number.

### 6. Smaller things
- **Flag-only coins on desktop include two of the biggest destinations.** The Netherlands (22) and Germany (9) carry only a flag. The tied-top coin is the one without a name. Belgium, Luxembourg, Switzerland, Austria, Slovenia and Estonia/Lithuania are flag-only too.
- **Labels move between visits on desktop.** desk-light-2 names Czechia and Poland but leaves Estonia and Lithuania as flags; desk-light-5 does the opposite.
- **Two hooks for one country on one screen.**
  - UK: "The system built for the IB, at the price of leaving the EU" on the globe card, and "Offers in IB points before your results, and overseas fees since Brexit" on the list card beside it.
  - USA and Japan also have slightly different wording in the two places.
- **The university card is thin** ("Aarhus University → / 5 programmes · Aarhus"). There is no line about what you can study there.
  - In desk-dark-4 the selected pin has no label (light mode shows "Aarhus University").
  - On a phone the orange pin is never named on the map.
- **Phone country level** labels 1 or 2 of 14 pins (unchanged from round 1).
- **The legend still uses a small-dot/large-dot pair**, but all coins are the same size.
- **"Imagery: NASA"** is cut off by the docked card's corner (desk-light-3/4, input-2-plus-plus).

## The five changes that would raise the score most

1. **Rebuild the phone continent level so every coin can be read** (phone-*-2-europe, phone-*-5).
   - Frame on the country *coins*, not the continent outline. Pull Iceland, Malta and Portugal in with an edge marker if needed, so the 26 coins fill a near-square stage about 360 × 380.
   - Start the map at the stage top; no empty fog band.
   - Below 480 px, use one fixed scheme: the coin with a 2-letter code inside a pill directly under it ("🇩🇰 DK"). Never a bare flag, never a name that lands on another coin.
   - Make the layout deterministic: same seed, same spots, in light, dark and on the way back.
   - Target in report.json: `labelsOnNodes` = [] on phone-*-2 and phone-*-5, with identical label sets across all four.
   - Also enlarge the phone world globe to about 330 px and float +/− inside the stage corner.

2. **Put real coastlines back on the highlighted country** (desk-*-3/4, doors-here, input-4-japan, input-4-uk, input-2-plus-plus, phone-*-3/4).
   - Use the 50m country geometry from round 1, not a hull around the pins. Japan's islands, Funen, Zealand and Northern Ireland must be visible as their own shapes.
   - Include Bornholm, so the Royal Danish Academy pin sits inside Denmark.
   - Guard: the outline's vertex count is more than 100 for Denmark, Japan and the UK, and no university pin falls outside its own country's polygon.

3. **One look at country level: pastel desk globe, like the USA** (desk-*-3, input-4-uk, input-4-japan, input-2-plus-plus).
   - Keep the political pastel raster and ink coasts at country zoom, as input-4-usa already does. Use satellite only as a faint texture under the pastel, if at all.
   - Swap the black vignette for a thin brass bezel with the ring's tick marks. Use it on every level below world, in both themes. It ties the levels to the desk object.
   - In light mode, remove the cream fog band at the top of the continent stage.

4. **Clear the route and threads when the flight lands** (phone-*-3, input-4-uk, input-4-japan, desk-*-3/4, desk-light-3a).
   - Fade the plane and the dotted trail to 0 within 600 ms of arrival. The rest frame shows neither.
   - Draw the trail as a curved arc that begins inside the stage, never under the breadcrumb or at the edge.
   - Do not draw leader threads for faded neighbour coins. Where one must exist, it must never point into the card.
   - In flight, show the card only after its photo has loaded, and clear all 26 old coins by 30% (Denmark flight, 3a).

5. **Finish the coin labels and card copy on desktop** (desk-*-2, desk-*-5, input-3-asia, doors-far, input-4-uk, desk-*-4).
   - Rank label placement by university count, so the Netherlands (22) and Germany get full names before Luxembourg or Slovenia.
   - Use one deterministic layout per view (fresh or back gives identical labels).
   - Clamp all coins, including faded neighbours, 24 px inside the stage and clear of the breadcrumb and the +/− buttons. Hide them if they cannot fit.
   - Put rim-waiting continents *on the rim in their true direction*, as an arrow chip ("North America 34 →"), never on Japan or Siberia. Keep each country's coin on its own country (South Korea on Korea, not Honshu).
   - Use the list card's hook verbatim on the globe card.
   - Give the university card one line about what you can study there ("5 programmes, from cognitive science to computer science"). Always label the selected pin, in both themes and on a phone.

## Lower priority
- Phone country level: label the 5 or 6 largest pins, or show a "5 · Copenhagen" cluster coin that fans out.
- The legend should use a single coin glyph.
- Inset "Imagery: NASA" so the docked card never covers it.
- The Boston and Randstad pin heaps (input-4-usa, input-2-plus-plus) want the same cluster-coin treatment.
