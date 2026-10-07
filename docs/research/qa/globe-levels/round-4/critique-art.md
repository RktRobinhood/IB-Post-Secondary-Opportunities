# Art-director critique: globe levels, round 4

**Score: 7 / 10. Close, but I would not ship it to students today.**

This is the first round that moved the score. I would now ship the desktop at about 8. The phone is about 5.5, up from 4.5.
- **The phone pile is gone, but the phone continent level is now a field of 26 anonymous numbers.** On the map, nothing says which coin is Denmark.
- **The country level no longer turns to night,** but the land around the chosen country is still a muddy satellite photograph. In Denmark, the country's outline does not line up with the photograph's coast.

## What improved (keep it)

- **The world rests facing Europe** (desk-*-1, countries-1-world).
  - Europe and Africa face the student, 274 sits on Europe, and the other three coins wait on the visible face.
  - This is the right first impression for this audience. Dark mode holds up just as well.
- **No route at rest.** input-4-uk and input-4-japan are clean. The plane appears only mid-flight (3a), where it belongs.
- **No more night-time swamp.**
  - Every country frame now has a toy-blue sea and the chosen country in a warm pastel.
  - The light-mode jump from Europe to Denmark is now a step, not a cliff.
  - Japan (input-4-japan) and the USA (input-4-usa) are the best country frames so far.
- **The phone continent level has no labels on the map.**
  - `labelsOnNodes` is [] and overlaps are 0 in all four phone continent frames.
  - Light and dark give the same layout (phone-light-2 = phone-dark-2, phone-light-5 = phone-dark-5).
  - The coins are legible and sit on land.
- **The chip rail exists.** It shows flag, name and number, styled like the Countries page rail. It belongs to the same family.
- **The desktop Europe frame** (desk-*-2): 26 of 26 coins are named. It is a handsome, readable poster. Only Austria and Estonia touch a coin.

## What still fails

### 1. Phone continent level: you cannot find your own country (biggest problem)
- **The map is 26 coins with no flags.** The only way to tell which coin is Denmark is to know the geography.
- **The rail shows 2.3 chips:** Netherlands 22, United Kingdom 22, and a cut-off Danish flag. Denmark, the home country, is hidden behind a swipe.
- **Nothing on the map points to the rail, and nothing in the rail points to the map.** No chip lights its coin in the frames.
- **The layout still moves between a fresh visit and coming back.**
  - In phone-*-2, the UK cluster reads 22 · 14 / 22.
  - In phone-*-5, it reads 14 · 22 · 22 in a row.
  - Ireland and the UK swap places. The brief said the same level gives the same picture.
- **The stage is still letterboxed.** It is about 345 px of map under a breadcrumb pill and two square form buttons.

### 2. The country level is half a toy
- **The chosen country is pastel, but its neighbours are not** (desk-*-3/4, input-2-plus-plus, input-3-north-america):
  - Sweden, Norway and Canada are olive satellite texture.
  - Germany and Belgium are a brown-pink grain.
  - The Netherlands is a dirty mustard with photo noise.
- Europe-level neighbours are flat pastels with ink coasts. Here they look like a sepia photocopy.
- **Denmark has a double coastline.**
  - The 50m white outline floats off the photographed coast. It cuts across north Jutland and skips Limfjord.
  - Zealand, Funen and Lolland are polygons laid beside their own photographs.
  - On a phone (phone-*-3), the double coast is the most visible thing on the map.

### 3. Unnamed pin heaps
- **The Randstad** (input-2-plus-plus): 11 unnamed pins.
- **England** (input-4-uk): about 16 unnamed pins between Leeds and London.
- **The Boston and New York area** (input-4-usa): 7 unnamed pins.
- **Phone Denmark:**
  - Only 2 or 3 of 14 pins are named, and *which* ones changes between light and dark.
  - The light frame names Aalborg and "Zealand"; the dark frame adds Business Academy Aarhus.
  - "Zealand" (the academy) reads as the island.
  - Copenhagen's five pins and Aarhus University are unnamed.

### 4. Leftovers flagged in round 3, still open
- **"Imagery: NASA" is still covered by the docked card** in desk-*-3/4, input-2-plus-plus, input-4-uk and input-4-usa.
- **The university card is still one line:** "5 programmes · Aarhus".
- **Explore door** (doors-far): Europe is a grey coin on Siberia.
- **Phone world** (phone-*-1):
  - The "North America" pill sits on the Europe coin (`labelsOnNodes`).
  - The globe is about 250 px wide.
  - +/−/RESET are still a row of form buttons above it.
- **The list copy beside the globe still reads like a database:** "researched, no programme mapped yet" and "Its degrees are not mapped one by one yet."

## The five changes that would raise the score most

1. **Make the phone rail and the map one control** (phone-*-2/5).
   - Pin the home country (Denmark) as the first chip, then sort the rest biggest first.
   - Size the chips so 3.5 are visible, so the swipe is obvious.
   - Give every coin a 12 px flag disc on its rim. That tells you whose coin it is without adding text.
   - A chip tap lights its coin with an orange ring and a 1 s pulse. A coin tap scrolls its chip to the centre.
   - Fix the camera to one stored view per level, so phone-*-2 and phone-*-5 give identical pixels.
   - Guard: a node-position hash that is equal across fresh, back, light and dark.
2. **Finish the toy at country level** (desk-*-3, input-2-plus-plus, input-3-north-america).
   - Paint the neighbours in their Europe-level flat pastel fills with ink coasts. Drop the satellite texture under land completely, or keep it under 10% as paper grain.
   - Draw the chosen country from its 10m polygon, filled rather than outlined, so there is only one coast.
   - Acceptance: no white outline offset from the land edge anywhere in phone-*-3.
3. **Cluster coins for pin heaps** (UK, NL, USA, Copenhagen).
   - Where more than 3 pins fall within 28 px, show one coin ("6 · Randstad", "5 · Copenhagen", "7 · Boston–NYC"), and fan it out on tap.
   - On the phone, always label the biggest university in each cluster, chosen the same way every time. Never let "Zealand" stand alone; write "Zealand Academy".
4. **Move the credit and fatten the university card** (desk-*-3/4, phone-*-4b).
   - Move "Imagery: NASA" to the top-right, under the −.
   - Give the card one subject line, for example "Cognitive science to computer science · 5 programmes".
5. **Tidy the phone frame and the doors** (phone-*-1, doors-far, list copy).
   - Put the zoom controls inside the stage as round brass buttons on the globe's ring, so the globe can grow to about 330 px.
   - Offset the North America pill above its coin.
   - Explore: rotate so Europe is a rim chip pointing west, not a grey coin on Russia.
   - Replace "researched, no programme mapped yet" with "22 universities · see the UK page".
