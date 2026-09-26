# Issue #52, round 2: critique

**Critic, 26 September 2026.** Fresh eyes. I read the round-1 critique, `fixes.md`, `campuses-52.md`, `src/lib/families.mjs` and `scripts/test-card-names.mjs`, and I read 21 of the round-2 shots, cropping the phone shots to the family blocks:

- desktop light: AU, SDU Vejle, Hanze, MODUL IM, home;
- desktop dark: Herning, LUT, Hanze 3-year, MODUL, SDU;
- phone light: SDU, Herning, Hanze, MODUL, Hanze 3-year, LUT;
- phone dark: AU, LUT Energy HEBUT, home, MODUL IM, SDU Vejle;
- the SDU crop.

I rebuilt `wt-52` from a clean `dist` and served it on :4492. `validate`, `check-schools` and `card-names` all pass (633 cards, 109 pages, 22 rows). I extracted every programme card on every `/universities/<key>/` page and ran my own near-name sweep over them. I also ran a twin sweep over the school records: the same credential, length, city, `ib` line, selection and fee under different names. I mutation-tested the built guard and probed `namesAlike`.

My own shots, in four modes each, are in `scratchpad/critic52r2/shots/`: `/universities/fi-laurea/`, `/universities/nl-fontys/`, `/universities/dk-via/`, `/universities/`, `/universities/fi-lut/`, `/denmark/` and `/guides/course-results/`. I stopped the server by its PID.

## Score: 7 / 10

Round 2 fixed most of what round 1 asked for:

- the guard now catches the owner's bracketed-campus shape;
- `separateFrom` sits on the records;
- the institution tiles and the home counter count cards;
- every family row says something;
- MODUL shows semesters and LUT shows "your route";
- the campus sentence appears for credential families.

The family blocks themselves are now good work. It is not an 8, because two of round 1's three headline failures are only half fixed, and both halves are visible to a student:

- **The counts still contradict the cards**, now on the Denmark page itself.
- **The sweep is still not systematic.** It missed a second Lund-shaped case, Laurea, where the umbrella comes after the comma. It also keeps one of the owner's own complaint shapes, Fontys "Marketing Management" beside "Marketing Management - Digital Business Concepts", on a reason the records do not hold.

## Reasons

### 1. Counts: fixed where the guard looks, wrong everywhere it does not

`card-names` checks only the "In English" tile on institution pages and the home counter. Every other count still counts degrees:

| Page | Says | What the student can count |
|---|---|---|
| `/denmark/` hero | "51 programmes taught in English" | 51 cards (correct) |
| `/denmark/`, the institution cards on the same page | SDU "15 programmes", VIA "11 programmes", AU "6 programmes" | 11, 10, 5. The cards add up to 57, under a hero that says 51. |
| `/universities/` | "In Denmark: 57 English-taught programmes recorded here"; SDU 15, VIA 11, AU 6 | 51; 11, 10, 5 |
| `/universities/dk-via/` hero | "it teaches eleven first degrees in English", directly above the tile "10 programmes" | 10 |
| `/universities/dk-au/` "Worth knowing" | "five of the six English-taught programmes" | 5 cards |
| `/guides/course-results/` | "23 of 73 degrees on this site accept Course Results. Show them in Find a degree" | The link opens the home page filtered to Course Results, which shows **22** programmes out of 67. |

My phone shot `denmark--phone-light` shows the contradiction on one screen. The hero says 51, then the first three cards say 15, 11 and 6. A student who taps SDU "15 programmes" lands on a tile that says 11. `fixes.md` said "canonical institution pages do the same" and "the Denmark lede". The lede was fixed; the cards under it were not.

### 2. The sweep missed a pair again: Laurea

`/universities/fi-laurea/` shows two cards:

- "Cyber Security, Business Information Technology"
- "Developing Digital Services, Business Information Technology"

Each reads "BBA · 3½ yrs · Online", with the same body text word for word ("International UAS Exam, as listed on Studyinfo; 2027 criteria not yet published. Online studies only in 2027.").

- **On the records they are twins.** The credential, length, city, `ib`, `selection`, `selectionNote` and fee are all the same. Only the specialisation and the places differ (45 against 40).
- **By the rule the sweep applied to LUT** (same requirements; the paths differ in places and a certificate), this is one card, "Business Information Technology", with two specialisation paths. If Laurea's two options really are separate applications and that matters, then it needs `separateFrom` with that reason. It is neither.
- **`campuses-52.md` does not mention it.** `check-schools` passes it: `namesAlike` returns null. The shared umbrella comes *after* the comma, and the umbrella rule only looks before it. Three shared words out of six fall under the ⅔ threshold.

This is the same class of miss as Lund in round 1, mirrored. The twin sweep (same fields under different names) would have found it; the name sweep cannot.

Two more gaps in the rule:

- **Prepended words.** `fixes.md` says a pair is near when "one name is the other with words added". That is true only for words added at the end. "Physics" against "Applied Physics" and "Economics" against "Business Economics" both return null. RUG has both kinds of pair, with no record saying why.
- **Near-identical twins with no shared umbrella.** VU "Econometrics and Data Science" and "Econometrics and Operations Research" also return null. They are probably right as two cards, but nothing on the record says so.

### 3. Fontys Marketing Management: kept apart on an absence

`/universities/nl-fontys/` shows "Marketing Management · BSc · 4 yrs · Venlo" and, one card later, "Marketing Management - Digital Business Concepts · BSc · 4 yrs · Tilburg". That is the owner's complaint word for word: "separate cards that differ only by location", plus a suffix.

The `separateFrom` reason is that "only the Tilburg version records an intake conversation". The Venlo record has **no `ib` line at all**, so it records nothing either way. A decision that separates two cards because one record is empty is not "backed by the records". Neither card points to the other. A student cannot tell whether these are one programme or two, which is exactly the problem #52 exists to fix.

The honest options are:

- make them one card with two paths (Venlo; Digital Business Concepts, Tilburg), carrying the intake conversation as a Tilburg row;
- or research Venlo's intake and cite it.

### 4. The built guard exempts names, not pairs

`card-names` builds its `separate` set from name *stems*. I added a third card, "Marketing Management (Eindhoven)", to the Fontys page of a copy of `dist` and fixed the tile to 24. `card-names` raised no failure for Fontys. Because Fontys declared one Marketing Management pair separate, every future card with that stem is waved through at the built stage. The data guard would still catch it in the record, but the built guard, whose job is to hold "whatever a template does", does not. Exempt the declared *pairs* by title.

### 5. Merged paths never say they are applied to separately

The owner's line is that a student must not be misled about what they must do. After the merge, one card reads "Economics and Business Administration · 2 campuses".

- **The records back a missing line.** Aarhus and Herning are two Opportunities on Optagelse.dk. The route record says "up to eight ranked programmes", so each campus is its own ranked choice.
- **The advice itself is missing.** The page shows the two cut-offs (36 and 30 IB points) but never gives the counsellor's advice: list Herning as well if 36 is out of reach, and it uses one of your eight.
- **The same gap on LUT and Hanze.** Neither says whether its two paths are one application or two.

A merged card is where a student is most likely to assume one application covers both.

### 6. Photographs on campus pages show the wrong campus

- **The Herning page** (`programmes__dk-au-…-herning…`, every mode) wears AU's institution photograph, the ivy-covered Aarhus building, under the title "Economics and Business Administration (Herning)".
- **The Vejle page** wears SDU's institution photograph, the same one the SDU page uses. It is not Vejle-specific.

On a page whose whole point is *this campus, not that one*, the picture says the opposite. Either use a campus-neutral field image (as the cards already do) or a photograph of that campus.

### 7. Smaller things

- **Fontys single records spanning two cities.** "International Business" and "Mechatronics" are each one record with city "Eindhoven and Venlo".
  - The pages say "A four-year business degree in Eindhoven and Venlo". They do not say whether the student chooses a campus or what differs.
  - UEF handles the same shape well: "you pick one when you apply".
  - The sweep did not look at single records whose `city` names several places. It should, because they are campus families without the table.
- **Hanze International Business card.** The 4-year path is the primary: it is the card's link and comes first. For this reader the 3-year path ("Open to you with the IB Diploma") is the headline.
- **Row layout on SDU Software Engineering.** "Vejle" sits on one line with its detail, but "Sønderborg" wraps its detail onto a second line. Two rows of one card lay out differently (visible in the round-2 crop and `universities__dk-sdu--desktop-dark`). Give the detail its own line always.
- **Hanze 3-year page.** The facts strip reads "Admission: Not recorded yet", while the Paths table says "The entry requirements are the same on each". This is #43's tile, but the two sit a screen apart.

### What is good

- **The Paths blocks are the best part of the site now.** Herning's leads with "The same programme is offered at the Aarhus campus and the Herning campus… the entry requirements are the same on each, but last year's cut-offs were not", then gives one short block per campus with a cut-off. It reads cleanly at 390 px in both themes.
- **LUT Energy Technology** now says plainly: "Taught on two campuses: the LUT degree in Lappeenranta; the LUT + HEBUT double degree in Lahti". Each row carries its campus and "35 of 50 places in your route" / "40 of 60".
- **The SDU credential cards** keep the admission difference in one row each, and the Mechanical Engineering BEng row now flags "more subject combinations".
- **MODUL's rows**, "€9,000 a semester · 6 semesters" and "€8,700 a semester · 7 semesters", are honest.
- **Every checked card shows its degree type.** All 633 cards carry a credential line, for example "BSc or BEng · 3–3½ yrs · Sønderborg" and "BSc · 3 yrs · 2 campuses".
- **The home counts are right.** Home shows "67 programmes", the presets read 51 + 16, and "Show all 67 programmes". Filters count a card once.

## Three changes that would raise the score most

1. **Make every count on the site a card count, and guard it.**
   - On `/denmark/` and `/universities/`, the institution cards read SDU 11, VIA 10, AU 5, and the "In Denmark" line reads 51.
   - VIA's `about` says ten, and AU's note says "five of the five" or is reworded.
   - The Course Results guide says "22 of 67 programmes", or it counts the same thing its link shows.
   - Extend `card-names`: every "N programmes" on a destination, country or institution-index card must equal that institution's card count. Any "N of M" that links to a filtered home page must equal what the filter shows.

2. **Make the sweep find twins, not only near names, and settle what it finds on the records.**
   - Add a record-level twin check to `check-schools`: two programmes of one record with the same credential, years, city, `ib`, selection and fee must be one family or carry `separateFrom`.
   - Extend `namesAlike` to a shared umbrella after the comma, and to words added at the front.
   - Then decide Laurea Business Information Technology: most likely one card, "Business Information Technology", with Cyber Security (45 places) and Developing Digital Services (40 places) as paths.
   - Redo Fontys Marketing Management on evidence: one card with a Tilburg path, or research Venlo and cite it.
   - Give Fontys "Eindhoven and Venlo" records a line on whether you choose a campus.
   - Make the built guard exempt declared *pairs*, not stems.
   - Add all of this to `campuses-52.md`.

3. **Say, on every family, what a student must do to apply to each path. Put the right campus in the picture.**
   - Add an "applied to separately" fact per family, from the records, and one sentence in the Paths block. For example: "Each campus is its own choice on Optagelse.dk. If 36 points is a stretch, list Herning too; it takes one of your eight." Do the same for LUT and Hanze.
   - Stop the Herning and Vejle pages borrowing their institution's main-campus photograph.
   - Re-shoot `/denmark/`, `/universities/`, Laurea and Fontys alongside the eleven round-2 paths.
