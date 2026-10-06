# Art-director critique — globe levels, round 1

**Score: 6 / 10. Not shippable today.**

The world level is lovely and the four-level idea now reads well: breadcrumb, coins, card, pins. The continent level is where students will spend most of their time, and it fails the basic test for a map: on desktop 10 of the 26 country coins in Europe have no name, and on a phone 17 or 18 of 26 have none, Denmark included. On top of that, the numbers on the coins disagree with the numbers on the cards beside them. On the phone the continent stage is a thin letterbox. A stray straight line from the plane cuts across the stage and through the card.

## What works (keep it)

- **World level** (desk-light-1, desk-dark-1, phone-*-1, countries-1-world): the brass ring, wooden stand, pastel political map and gold coins with ink rings all look like one object. Light and dark are both strong. This is the look the owner loved, and it survived the rebuild.
- **Breadcrumb** ("World › Europe › 🇩🇰 Denmark") is clear, small and well placed on desktop.
- **Country views that work:** USA (input-4-usa), Japan (input-4-japan) and Germany (input-2-plus-plus). In each, a crisp outline glows on the satellite, the pins are labelled, and the neighbours are dimmed with their own coins. This is the template working.
- **Card photography:** Nyhavn, Heidelberg, Fuji over Tokyo and Central Park are first-rate. On desktop the docked card (photo left, words right) is elegant, and on a phone the big photo card reads as a postcard.
- **Engineering filter** (doors-filter-engineering): coins that don't match turn to grey dots and the matches keep their number. Calm and readable. Best frame in the set.
- **Light/dark parity** is good on every level: same layout and same coin treatment, and the dark vignette looks especially rich.

## What is wrong

### 1. Coins without names (continent level) — the biggest problem
- report.json, `desk-light-2-europe`: 10 of 26 coins have no label. They are 16 (UK), 15 (Netherlands), 13 (Sweden), 8, 8, 8, 6, 5, 6 and 2. A student cannot tell which gold "16" is the UK or which "15" is the Netherlands. Those are two of the biggest destinations.
- On the phone (`phone-light-2-europe`, `phone-dark-2-europe`) 17 or 18 of 26 have no label, **Denmark's 14 among them**. The home country goes nameless at the level just above it.
- Label placement is inconsistent. Some names sit left of the coin (Ireland, Norway, Belgium, France) and some sit right, so the eye can't pair them. In reduced-europe, "Poland" sits closer to Germany's 8 than to its own 13. In desk-light-2, "Belgium" is a toss-up between 8 and 2.
- The brief promised "flag + name label beside" the country coin. **No country label has a flag.** Flags appear only in the breadcrumb. Round 6 (`globe/round-6/h-desk-light-2-europe.jpg`) had them and looked friendlier.
- Phone light and phone dark label *different* sets of countries (Belgium in one, Sweden/France in the other). Labels that come and go between visits look broken.

### 2. Numbers that contradict each other on the same screen
"Nothing invented" also means not showing two numbers for the same thing:
- input-4-uk: the globe card says **United Kingdom 16 universities** and the list card under it says **22 universities**.
- input-3-north-america: the Canada coin says **14** and the Canada card says **20 universities**.
- input-3-asia: China **9** on the coin vs **14** on the card, and UAE **10** vs **14**.
- input-4-japan: **14** on the globe card vs **15** on the list card.
- input-2-plus-plus: Germany **8** vs **9**.
- desk-light-2: the "Nearby · Europe" door says **25 countries** and the chip beside it says **On the globe: 26 countries**.
- doors-nearby: picking "Nearby" filters the list to 16 programmes, but every coin keeps its full university count. The engineering filter does change the coins, so the two filters behave differently.

### 3. The phone continent and country stages
- phone-*-2-europe: the stage shrinks to a letterbox about 250 px tall. 26 coins pile into a strip and touch each other, and most of Europe is cropped. There is dead cream space between the controls row and the map.
- The phone breadcrumb drops the word "World" and leaves a bare globe icon followed by "›". It reads as a glitch.
- The Malta coin and its label sit on top of the "Imagery: NASA" credit (phone-*-2, phone-*-5).
- phone-light-4: the sticky "10 of 67 programmes ↓" pill covers the card's last line ("In Denm…").
- phone-*-3-denmark: only 1 of 14 pins has a label (Aalborg University), so the country level on a phone is a scatter of anonymous dots.
- phone-*-1-world: the globe is only about 210 px wide. The doors, search and the +/−/RESET row push it down, and the hero heading has scrolled away. The best object on the site is the smallest thing on the phone screen.

### 4. Line work and motion
- **The flight trail**: a straight, thin, grey line runs from off-stage to the plane. In desk-light-3-denmark and desk-dark-3 it continues on past the plane and through the docked card. In doors-here it exits off the right edge, in input-2-plus-plus it runs top to bottom through Germany and out under the card, and on the phone it stabs down into the card. It reads as a rendering bug, not travel eye candy.
- **Denmark's outline** (desk-*-3, desk-*-4, phone-*-3) is coarse. The islands are triangles and quadrilaterals, and Funen and Zealand look like cut paper. The UK, US, Japan and Germany are smooth. The home country, behind the "Right here" door, has the worst geometry on the site.
- **University selected** (desk-*-4-university): a second, white outline is drawn offset from the orange one, so Denmark appears doubled and jittery. The white line also cuts through "Aalborg University" ("Aalborg" loses its A) and "Zealand".
- **Mid-flight** (desk-light-2a-35, 2b-70): at 35% the destination's "Europe" pill sits on top of a half-transparent 243 coin with a white scribble of outlines over it, and the North America coin shows as a ghost "28". At 70%, 14 country names arrive *before* their coins, so labels float with nothing attached and tiny thread stubs are scattered over Germany and Poland. The labels should arrive after their coins.
- **Hover at world** (desk-*-1b-hover-europe): the hover outline fill (white lines, orange tint) sits *on top of* the 243 coin, which becomes unreadable ("74"). The coin must stay on top.
- Faded neighbour coins are clipped at the top edge behind the breadcrumb (Norway 8 and Sweden 13 in desk-*-3, doors-here, phone-*-3). Half-coins jammed against the frame look accidental.
- In input-3-asia a ghost Europe "243" coin hangs over Kazakhstan in the upper-left.
- In doors-far a translucent "24" (Oceania) melts into the globe's rim and reads as a smudge.

### 5. The desk-globe feel falls away below world level
Once you zoom past the world view, the ring and stand vanish. What is left is a generic satellite web map with a cream fog vignette. In light mode that fog is a wide, milky smear. In desk-light-2, the top 120 px of the Europe stage is empty fog. The imagery is posterised (blocky colour bands across Spain, the Sahara and Turkey). The gold coins carry the theme, but the stage has stopped being a desk object.

### 6. Card copy reads like a database status
- "Programmes recorded", "Researched in depth" and "In Denmark" are internal status labels, not a line a student wants to read. The country one-liners already exist on the list cards ("No tuition, but your IB subject choice decides everything", "A named minority route, on a calendar built for it") and the globe card should use them.

## The five changes that would raise the score most

1. **Every country coin carries its name and flag, everywhere.** At continent level, make the coin and its label one unit: a small pill directly under the coin (as the continent coins already do) with the flag and the name at 11 px, always centred on the coin, never sometimes-left and sometimes-right. When pills collide, use the existing nudge-and-thread to move the *pill*, not drop it. On a phone, allow the short form ("UK", "NL", "CZ") with the flag before you ever drop a name. Target in report.json: unlabelled = 0 on desk-*-2-europe and phone-*-2-europe, and identical label sets in light and dark.

2. **One number per thing.** The coin, the globe card and the list card under it must agree for every country. Either count the same set everywhere, or say what the coin counts: the globe card reads "16 on the map · 22 researched". Fix "25 countries" vs "26 countries". Make the Nearby/Right-here doors re-count the coins the way the subject filter does. Check: input-4-uk, input-3-north-america, input-3-asia, input-4-japan and input-2-plus-plus show no contradicting numbers.

3. **Give the phone a real stage.** Below 768 px, make the region and country stages near-square (about 390×400) and frame each continent tightly to its country nodes. Float + and − inside the stage corner instead of in a separate row. Restore the word "World" in the breadcrumb. Inset the "Imagery: NASA" credit so it never sits under a node. Stop the sticky "N of 67 programmes" pill while the card is in view. At the country level, label the 6 largest pins on the phone too (not 1). At world level, let the globe take the full width (about 340 px) and tuck RESET into the stage.

4. **Clean the line work and choreography.**
   - Draw the flight trail as a curved dashed brass arc that ends at the plane and fades out within about 1 s of landing. It must never cross the card or leave the stage.
   - Replace Denmark's outline with higher-resolution geometry (at least 1:50m, so Funen and Zealand look like islands).
   - On university select, thicken or brighten the existing outline instead of drawing a second, offset white one.
   - In flight, fade out the old level's coins and pills completely by 30%, pop each new coin first and then its pill about 80 ms later, and never show a pill without its coin.
   - On world hover, keep the coin above the country highlight.
   - Clamp faded neighbour coins at least 24 px inside the stage and clear of the breadcrumb, or hide them.

5. **Write the cards as a postcard, not a status report.** For the country card, use the flag, the name and the one-line hook from the country list card, then "14 universities · 51 programmes →". For the university card, use the name, the city, one line about what you can study there ("10 programmes, from engineering to nursing"), and →. Delete "Programmes recorded", "Researched in depth" and "In Denmark".

## Lower-priority notes
- **Keep the desk-globe feel below world level.** Keep a thin brass bezel (the ring's colour and tick marks) around the satellite stage on every level, and swap the cream fog for that bezel. In light mode, cut the vignette by about half so the top of the Europe stage isn't an empty milky band. If you can, use a less posterised satellite tile at continent zoom.
- **Pin clusters:** Copenhagen (5 pins), Tokyo (about 8) and Boston to New York (about 6) are unlabelled heaps. Show one cluster coin ("5 · Copenhagen") that fans out on tap.
- **World at rest** shows only Europe and Asia, with Oceania half hidden on the rim (doors-far "24"). Add a slow idle drift, or a one-line row of continent chips under the stage, so students know four or five more doors exist round the back.
- **Legend:** the dot pair in "Each number counts universities" (one small dot, one large) implies size carries meaning, but all coins are now the same size. Use a single coin glyph.
- **Long labels** such as "University of Freiburg - University College Freiburg" should be shortened to the student-facing name ("University College Freiburg").
