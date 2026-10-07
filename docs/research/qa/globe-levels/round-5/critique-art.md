# Art-director critique: globe levels, round 5

**Score: 7 / 10. Not yet. I would not ship it to students today.**

The desktop is now a real 8: World and Europe are posters I would hang. The phone has gone from about 5.5 to about 6.5. Its continent level is fixed. But the frame every student reaches next, their own country, is still the weakest picture on the site. On a phone it names 3 of 14 universities.

## What improved (keep it)

- **The phone continent level works** (phone-*-2, phone-*-5).
  - Every coin now carries its flag, so you can find Denmark without knowing the map.
  - The rail opens with Denmark 14, then the Netherlands 22.
  - Fresh, back, light and dark give identical pixels. The UK/Ireland swap from round 4 is gone.
- **One camera per level** holds everywhere I checked:
  - desk-2 = desk-5
  - desk-4 = desk-6 history-back (same report numbers, alt 0.151)
  - phone alt 0.125 in every Denmark frame
- **The phone world no longer puts a label on a coin** (phone-*-1). The "North America" pill sits clear of the 274 coin.
- **The university card says what you can study there:** "Computing and IT, Business, Social sciences · 5 programmes · Aarhus" (desk-*-4, phone-*-4b). The country card's three named chips plus "+11 on the map" are good too.
- **No label sits on a dot.** `overlaps` and `labelsOnNodes` are 0 in every frame.
- **Neighbour countries are now coins at country level** (input-4-uk shows Ireland 14, Netherlands 22, Denmark 14). That is a good way to step sideways.
- **Mid-flight Europe** (desk-light-3a) is lovely: flat pastels, ink coasts and a little plane. This is the look the whole globe should have.

## What still fails

### 1. The country level is still a tinted photograph, not a toy (biggest problem)
- **Denmark** (desk-*-3/4, phone-*-3, crops):
  - The "soft glow" is a blurred orange blob that does not line up with the photographed land.
  - Green satellite rims show all round north Jutland, Djursland, Limfjord and Lolland.
  - The coast is still doubled, just blurred now. On the phone it is the most visible thing in the frame.
- **The neighbours are only partly pastel:**
  - Sweden is olive-khaki with photo grain.
  - Germany is pink grain.
  - In input-4-usa, Mexico and Cuba are raw satellite.
  - In input-4-japan, Korea and China are tan satellite.
  - In input-3-north-america, Canada and the USA are muddy olive and tan.
- Compare desk-light-3a at 50%: the Europe-level look is right, and it disappears the moment you land.

### 2. Unnamed pin heaps are the norm at country level
- **Phone Denmark:** 3 of 14 pins are named (`pinLabels` 3).
  - Aarhus University is unnamed, even while it is the selected orange pin (phone-*-4b).
  - Copenhagen's five pins, SDU in Odense and Esbjerg are unnamed.
  - "Zealand" still stands alone and reads as the island.
- **Desktop:**
  - Netherlands: 8 of 22 named. Delft, Leiden, Rotterdam and Utrecht are anonymous.
  - UK: 7 of 22. About 14 pins between Leeds and London, plus a white spider of leader lines.
  - Japan: Tokyo's 6 pins and Kyoto and Osaka are unnamed.
  - USA: Boston to New York is unnamed.
- The pins look like seeds, not places. I accept the owner's rule against grouping, so the fix has to be naming, not clustering.

### 3. The list copy is still a database apology
These still read like a database:
- "Its degrees are not mapped one by one yet. Its own page:" (input-4-uk/usa/japan)
- "Their degrees are not mapped one by one yet. Each country has its own page:" (doors-far, input-3-north-america)

The new lead, "— its universities and how to apply are on its own page", is better. But the old sentence still sits under it, so the student reads two disclaimers.

### 4. Old leftovers still open
- **"Imagery: NASA" is under the docked card** in every desktop country frame (desk-*-3/4, input-2, input-4-*). Third round in a row.
- **Explore door** (doors-far): Europe is still a grey coin on Siberia.
- **Phone world** (phone-*-1):
  - The globe is still about 250 px wide.
  - +/−/RESET are still square form buttons in their own row.
  - At continent level the map is still letterboxed at about 345 px under the breadcrumb and two form buttons.
- **Counts disagree.** The Nearby door says "Europe · 25 countries", but the map shows 26 coins and the card says "26 countries · 274 universities".
- **Desktop Europe labels** (desk-*-2):
  - Germany, Luxembourg and Switzerland are shortened to DE, LU and CH. Germany has room for its full name.
  - "Portugal" sits away from its 9 coin (the report's own `wrongs: ["pt->"]`).
- **The country card arrives at 50% of the flight** (desk-light-3a) and covers the plane.

## The five changes that would raise the score most

1. **Make the country level a toy, with one coast** (desk-*-3, phone-*-3, input-4-*, input-3-north-america).
   - Above 0.5 altitude, drop the satellite texture under land entirely (keep at most 8% as paper grain).
   - Fill every land polygon, chosen and neighbours alike, in its Europe-level flat pastel with ink coasts, exactly as in desk-light-3a.
   - Show the chosen country by a stronger saturation of the same polygon plus a 2 px warm outer stroke, not a blurred mask.
   - Acceptance: no green or tan photo pixels inside or around Denmark in phone-*-3, and Mexico, Korea and China are pastel.
2. **Name every pin, without grouping** (phone-*-3, input-2, input-4-uk/japan).
   - Fan dense pins into a short, fixed leader-line column at the stage edge, like a museum key. For example, Copenhagen gets one tidy stack of five names to the right of Zealand. Use no stray white spider lines.
   - Always name the selected pin.
   - Write "Zealand Academy" in full.
   - Target: phone Denmark 14/14 named, the Netherlands and UK at least 18/22.
3. **Rewrite the list copy as an invitation.**
   - Drop "not mapped one by one yet" everywhere.
   - Write "United Kingdom · 22 universities · how to apply →" above the card.
   - Under Explore, write "10 countries to explore · each has its own page". Then show the cards.
4. **Tidy the phone frame** (phone-*-1/2).
   - Put +/− as round brass knobs on the globe's ring and drop RESET (the breadcrumb's "World" already does that job).
   - Let the globe grow to about 330 px and the continent stage to about 420 px tall.
   - Make the Nearby door count match the map (26).
5. **Clear the old leftovers in one pass.**
   - Move "Imagery: NASA" to the top-right under the −.
   - Rotate Explore so Europe is a rim chip pointing west, not a grey coin on Siberia.
   - Give Germany its full name, and attach Portugal's label to its coin.
   - Hold the country card until the camera lands.
