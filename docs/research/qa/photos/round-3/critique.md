# Photo round 3: photo editor's critique

**SCORE: 7 / 10.** Not yet. This is a strong 7, and the gap to 8 is small and specific. Under `docs/QA_CRITIC_LOOP.md` it needs one more iteration and a fresh critic.

Critic: photo editor (Claude, round 3 of the photo loop, fresh agent), 24 September 2026.

What I judged:
- `round-2/iteration.md`, including its "## Applied" section, and the contact sheets `round-2/applied-1..5.jpg`;
- the verdict files in `docs/research/photo-review/`, read in the apply script's own order (regional files first, then iteration-1, -2, -3);
- a fresh `node src/build.mjs` (152 pages, no EBUSY) and `node scripts/test-image-records.mjs` (ok: 511 pictures in 492 records, 523 verdicts applied);
- the served WebPs in `src/assets/img/places/`, which I viewed myself. My contact sheets are in this folder:
  - `flagged-and-denmark.jpg`: the fixer's flags and every Danish main and gallery photo;
  - `sample-1.jpg` and `sample-2.jpg`: 48 live main photos, drawn at random (seeded) from all 466 pictures referenced in `dist/`, leaving out the 30 already on the round-2 sheets;
  - `proposed-replacements.jpg`: the Commons files proposed below, viewed at 16:10.

## Verdict in one paragraph

All three round-2 blockers are fixed, and fixed properly:
- the record, the file on disk and the credit now agree, and a gate enforces it;
- approved campus photographs are no longer hidden behind stock shots of people;
- blank cards on the four test pages are down from 14 to 3.

The new photographs are good. Old Joe, the Trent Building, the Radcliffe Camera from St Mary's, the Bramante cloister, Kromhoutkazerne and University College Toronto would all make a 17-year-old stop scrolling. The home reel is now clean, apart from one railing tile.

Two things keep this off 8:
1. **Two rule-breaks the fixer found were left live.** `at-jku` is a car park and road. `ucph` gallery 3 is a Pride parade banner. The fixer named both and changed neither.
2. **The rule still reaches only the photos a critic names.** In my random sample of 48 live photos that no critic had named, 4 break the rules outright (8%) and 9 more are borderline. This is the same pattern round 2 described, one layer further down.

## 1. Round 2's blockers

| Blocker | Status | Evidence |
|---|---|---|
| Approved file ≠ served file, wrong credit | **Resolved** | `test-image-records` now checks the bytes and dimensions on disk, credits, review/file agreement and unapplied verdicts. It passes. On `/credits/`, `ie-dcu` now credits SSCOhA, CC BY-SA 4.0, and links `DCU_Glasnevin_Library_in_2009.jpg`. `lu-mudec` and `ee-eka` are gone because their institutions left the data, and the note in `iteration.md` says so honestly. |
| Approved Commons photos hidden behind stock official images | **Resolved** | On `/destinations/{nl,se,gb,jp}/` no card hotlinks an external image any more. `se-uu`, `nl-rug`, `gb-lancaster`, `gb-lse`, `gb-kcl`, `se-ki`, `nl-leiden`, `nl-uva`, `nl-eur`, `nl-auas-hva`, `se-chalmers`, `se-gu`, `se-umu` and `gb-manchester` all serve their local Commons WebP. |
| Coverage (typographic panels) | **Resolved** | See the table below. |

Panels, from `card__media--empty` in my build:

| Page | Round 2 | Now | Remaining panels |
|---|---|---|---|
| `/destinations/nl/` | 7 / 22 | **1 / 22** | Hanze (nothing clean on Commons; see `iteration.md`) |
| `/destinations/gb/` | 6 / 22 | **1 / 22** | City St George's |
| `/destinations/se/` | 0 / 14 | 0 / 14 | |
| `/destinations/jp/` | 1 / 15 | 1 / 15 | Temple University Japan |
| **Four pages** | **14 / 73** | **3 / 73** | |
| All destination pages | 59 / 455 | 44 / 455 | ae is still 10/14, ee 4/10, si 3/7, mt 3/6 |
| Home page | 0 | 0 | All 3 doors and 12 reel tiles are photographs |
| `/denmark/` | not counted | 2 / 14 | Zealand and Dania. Dania's only machine pick was a map of Florida, rightly rejected. |

The remaining panels are all small schools with no clean photo on Commons, which is the designed outcome.

## 2. Home page

I checked the crops against `site.css`. `.door__img` and `.tile__img` use `object-fit: cover`, centred, and `.tile` is 4:5, so the portrait crops on `applied-4.jpg` and `applied-5.jpg` are what a student sees.

| Slot | Verdict |
|---|---|
| Hero `nl` (TU Delft library) | Excellent. |
| Door, Europe `gb` (London at dusk) | Excellent. |
| Door, World `jp` (Fuji over Shinjuku) | Excellent. |
| Door, Denmark `ucph` | **Acceptable, and the weakest of the three.** It is a wide-angle shot from Vor Frue's tower: the horizon bends, the whole frame leans about 15°, and the colour is pushed. It is unmistakably the University of Copenhagen on Frue Plads (universitetshistorie.ku.dk confirms the main building of 1831–36), and both crops keep the facade and the red roofs. It is a big improvement on `au-2`'s sky and grass bank. I would keep it. I looked for a level Copenhagen rooftop view: *Copenhagen, view from Rundetårn, 20220617 1006 6721.jpg* is level but has cranes on the left skyline, so it is not better. If the owner wants a calmer door, the fallback remains `dtu-2` (students on the Lyngby lawn). |
| Reel `fi-aalto`, `ca-u-of-t` | Clean. Both are new and both hold 4:5. |
| Reel `au-2` (Aarhus) | **Passes.** At 4:5 it is the ivy wall over the grass amphitheatre of the University Park. It is quiet, but it is a real and recognisable place and breaks no rule. `au-3` (the ivy courtyard) would be an equal swap, not a better one. |
| Reel `sdu` | Passes at 4:5: the cars fall outside the crop. At 16:10 on SDU's own page a red car and a silver car sit at the bottom right (about 5%), which is borderline. |
| Reel `at-wu-vienna` | **Borderline.** Steel ramp handrails run across the bottom fifth of the 4:5 crop, which is a railing as a band. The fixer kept it because the next Austrian pick is `at-jku`. Fix `at-jku` (§3), then decide on WU. |
| Reel `gb-manchester`, `au-melbourne`, `nl-thuas`, `jp-waseda`, `cbs`, `sg-nus`, `ruc` | Pass. |
| `homeReel.skip` (`dk-via`, `gb-kcl`) | A sensible data-driven mechanism, with no country branch. VIA's gravel pavilion and KCL's road band no longer reach the home page. |

## 3. The fixer's flags

| Key | Where it is live | My verdict |
|---|---|---|
| `at-jku` main (*Linz - JKU - Science Park 2.jpg*) | `/destinations/at/` | **Fails.** A road and a car park fill the bottom third, with a white SUV, a row of parked cars and a give-way sign. Its note ("modern, sharp, sunny") never looked below the building. Replace with **[JKU Campus Buildings.jpg](https://commons.wikimedia.org/wiki/File:JKU_Campus_Buildings.jpg)** (CC BY-SA 2.0, 2044 px): the campus lawn, the Gigant sculpture and the Keplergebäude wing under a blue sky, with no cars. I viewed it at 16:10. |
| `ucph` gallery 3 (*Copenhagen Pride Parade 2023 51.jpg*) | `/universities/dk-ucph/` | **Fails.** It is an event, and a University of Copenhagen banner is its subject. Both are named rules. Its review is signed "Claude (automated visual review…)", yet the note says "previously approved by human review". The record contains no human approval. Under `IMAGE_STANDARD.md` an approval is an accountability record, so a claim of human approval must not be carried across in a note. Reject it. The gallery keeps Festhalen and the KU Frederiksberg main building. |
| `ucph` main as the Denmark door | home | Keep (see §2). |
| `au-2` in the reel | home | Passes (see §2). |
| `no-oslomet` | `/destinations/no/` | Tolerable. The facade lettering is part of the building, and the "40" and no-entry signs sit at the edges, under about 3%. |
| `fr-edhec` | `/destinations/fr/` | Tolerable. It has wooden bollards along the bottom and a white sky, but the curved glass over the lawn is a real place. |
| `au-utas` | `/destinations/au/` | **Borderline logo.** The red UTAS emblem is on the tower at the centre of the frame and is the first thing the eye lands on. It is nearer 6–7% than the 4% the verdict claims. Every alternative on Commons is worse, so tolerate it, but correct the note. |
| `gb-leeds` | `/destinations/gb/` | Tolerable. The lamp post and traffic lights are thin verticals, and the Parkinson Building fills the frame. |
| `nl-rotterdam-uas` | `/destinations/nl/` | Tolerable. Grey, but it is the right building on the harbour. rotterdamuas.com confirms Wijnhaven 99–107. |
| `gb-ual` (*Granary Square fountain*) | `/destinations/gb/` | **Weak, not flagged by the fixer.** The fountain jets are the subject, and the Granary Building (Central Saint Martins) is a strip behind them. It is a picture of a public square. It is better than a panel, but the next iteration should look for a Granary Building facade without the road markings. |

## 4. Random sample: 48 live main photos

Sheets: `sample-1.jpg` and `sample-2.jpg`.

**Clean and strong (35):** au-uow, au-uq, be-umons, ca-concordia, ca-ualberta, ch-ehl, ch-unibas, ch-webster-geneva, cz-ctu, cz-cu, cz-upol, de-rwth, es-ucm, fi-laurea, gb-edinburgh, gr-ihu, gr-nkua, hk-polyu, hu-elte, hu-oe, ie-tcd, ie-tu-dublin, is-hi, it-unitn, jp-hokudai, kr-yonsei-uic, no-nih, no-ntnu, pt-uminho, se-uu, sg-nus, si-um, us-colby, us-mit, nl-rug.

**Break the rules (4):**

| Key | Problem | Proposed replacement (viewed at 16:10) |
|---|---|---|
| `ch-unige` | A large pink "UNIVERSITÉ DE GENÈVE" **banner** on the left third. A pedestrian crossing, a yellow-and-black bollard and scooters make a **road band** across the bottom. | **[Uni Bastions 01.jpg](https://commons.wikimedia.org/wiki/File:Uni_Bastions_01.jpg)**, CC0, 4128 px. The same building from the park lawn, with no banner or road. |
| `kr-skku` | The 600th Anniversary Hall above a **road with a yellow centre line** filling the bottom third. The verdict's `checkedAgainst` is empty. | **[Sungkyunkwan University Bicheondang and 600th Anniversary Hall.jpg](https://commons.wikimedia.org/wiki/File:Sungkyunkwan_University_Bicheondang_and_600th_Anniversary_Hall.jpg)**, CC BY-SA 4.0, 4069 px. The Joseon-era Bicheondang in front of the same hall, blue sky, no road. skku.edu places the hall on the Humanities and Social Sciences Campus, Seoul. |
| `hk-hkbu` | A **name board** is the subject: the Chinese and English "Ho Sin Hang Campus" lettering fills the left half. The verdict note says "with name". `checkedAgainst` is empty. | **[Academic and Administration Building of Hong Kong Baptist University.JPG](https://commons.wikimedia.org/wiki/File:Academic_and_Administration_Building_of_Hong_Kong_Baptist_University.JPG)**, CC BY-SA 4.0, 2736 px wide. The 16:10 crop is the building against a blue sky. The vertical name lettering is part of the facade (about 4%). One lamp post. |
| `nl-uva` | Two red **no-entry signs**, a white direction sign and a **bridge railing** across the bottom. Place: Commons files it under Oudezijds Achterburgwal 235. That is UvA's **BG4**, which was the Amsterdamse Academische Club until 2022 and is now let as a jazz bar (campus.uva.nl, November 2024). It is a UvA building, but not one where a student studies. `checkedAgainst` is empty. | No clean Commons file found. The Oudemanhuispoort files have street signs or are portrait close-ups, and Roeterseiland has no usable photo. Search `Category:Roeterseiland` and `Category:University of Amsterdam` again. Failing that, a well-cropped Oudemanhuispoort courtyard. |

**Borderline (9):** each has a car, a road, a banner or a sign at about 5–10% of the frame.
- `au-adelaide`: university banners on lamp posts, and a road sign;
- `gb-bristol`: a white car and traffic lights (flagged in round 2 and unchanged);
- `gb-kcl`: a road along the bottom. It is skipped from the reel for this, but it is still the card on `/destinations/gb/`;
- `cz-muni`: parked cars and tram wires;
- `cz-czu`: an empty paved plaza and a car;
- `de-tu-berlin`: a grey sky and parking bollards;
- `hu-bme`: a thin row of parked cars along the bottom;
- `lt-lmta`: an aerial with a car park at the right;
- `pt-ucp`: parked cars in the middle ground.

Denmark, outside the sample:
- `absalon` is a gravel path with Absalon's red name sign in the right third (borderline sign);
- `sdu` gallery 3 (`sdu-4.webp`) is five students working on a Formula Student car: people as the subject, no place.

**Rate: 4 of 48 fail (8%), and 13 of 48 are weak or failing (27%).** Round 2 found 11 weak among 43 named replacements. The named keys are now clean, but the long tail was never swept.

## 5. Place: spot-checked against the institution's own site (9)

| Key | Photo | Official check | Result |
|---|---|---|---|
| `ucph` | Main building, Frue Plads | universitetshistorie.ku.dk (Hovedbygningen, 1831–36) | ✓ |
| `nl-ucr` | Middelburg Stadhuis | ucr.nl/conference-center: "the former city hall at Lange Noordstraat 1", UCR's Franklin building | ✓ |
| `nl-rotterdam-uas` | Wijnhaven 99–107 | rotterdamuas.com/about/locations/wijnhaven-107 lists the address | ✓ (building matched by eye) |
| `gb-qmul` | Queens' Building | qmul.ac.uk: "the historical heart … the original People's Palace" | ✓ |
| `pl-swps` | Chodakowska 19/31 | swps.pl/kontakty: main address ul. Chodakowska 19/31 | ✓ |
| `au-utas` | Centenary Building | utas.edu.au campus pages, and Hayball's project page: School of Business and Economics, Sandy Bay | ✓ |
| `kr-skku` | 600th Anniversary Hall | skku.edu: Humanities and Social Sciences Campus, Seoul | ✓ place. Its Commons page says "Suwon", but the geotag and skku.edu both say Seoul |
| `hk-hkbu` | Ho Sin Hang campus | Commons category HKBU Ho Sin Hang Campus. I did not reach hkbu.edu.hk | ✓ place, fails on subject (§4) |
| `nl-uva` | Oudezijds Achterburgwal 235 (BG4) | campus.uva.nl: a UvA building now let as a jazz bar | **Misleading.** Not a teaching building |

**No card shows the wrong institution.**

**The verification gap is still wide.** I read each live main photo's latest verdict in the apply script's order:
- **271 of 452** have an empty `checkedAgainst`;
- **54** are "checked" only against Commons or Wikipedia, which is circular.

| Region | Empty | Circular | Out of |
|---|---|---|---|
| Central | 66 | | 69 |
| Nordic/Baltic | 46 | | 73 |
| West | 45 | | 46 |
| South | 27 | 16 | 49 |
| World | 83 | 32 | 118 |

The West figure counts only the original approvals: iteration 2 re-checked the replacements, not these.

`iteration.md` says openly that the world file was out of scope. All three of my sample failures with empty checks are from this unchecked tail. Doing this for every photo is bigger than one iteration. It should become a GitHub issue rather than block this round, but the next critic should see it progressing.

## 6. Noted in passing (not photo judgements)

- While I worked, another agent rebuilt `dist/` at 20:57 with `SITE_BASE` rewritten by Git Bash into `D:/Vibe Coding/Git/IB-Post-Secondary-Opportunities`. 150 HTML files now load CSS and images from a Windows path. My counts above come from my own build, run from PowerShell, before that happened.
  - This is the same mangling the round-2 "Applied" section recorded.
  - It is harmless to the deploy, which builds in CI, but a critic or screenshot agent reading `dist/` now sees an unstyled site.
  - Rebuild from PowerShell before the next round.
- The apply script still prints "replace ee-eka / lu-mudec" on every run for records that no longer exist. It is cosmetic, as `iteration.md` says.

## Top fixes (in order of impact)

1. **`at-jku` → [JKU Campus Buildings.jpg](https://commons.wikimedia.org/wiki/File:JKU_Campus_Buildings.jpg)** (CC BY-SA 2.0, 2044 px). Write a reject line with this replacement, with jku.at in `checkedAgainst`. Then re-judge `at-wu-vienna` in the reel: if its ramp handrails are still a band at 4:5, add it to `homeReel.skip` and let JKU take the tile.
2. **Reject `ucph` gallery 3** (*Copenhagen Pride Parade 2023 51.jpg*): an event, with a banner as the subject. Also stop any verdict note claiming "previously approved by human review" when the record holds no human review. Only this one line, in `denmark-verdicts.jsonl`, carries that phrase.
3. **Replace the four sample failures:**
   - `ch-unige` → [Uni Bastions 01.jpg](https://commons.wikimedia.org/wiki/File:Uni_Bastions_01.jpg) (CC0);
   - `kr-skku` → [Sungkyunkwan University Bicheondang and 600th Anniversary Hall.jpg](https://commons.wikimedia.org/wiki/File:Sungkyunkwan_University_Bicheondang_and_600th_Anniversary_Hall.jpg) (CC BY-SA 4.0);
   - `hk-hkbu` → [Academic and Administration Building of Hong Kong Baptist University.JPG](https://commons.wikimedia.org/wiki/File:Academic_and_Administration_Building_of_Hong_Kong_Baptist_University.JPG) (CC BY-SA 4.0);
   - `nl-uva`: find a teaching building (Roeterseiland, or the Oudemanhuispoort courtyard). If nothing is clean, prefer the panel to a bar with no-entry signs.
4. **Sweep the long tail for bands, not for places.** Put every live main photo that has not been re-judged since the regional pass (about 300) on 16:10 contact sheets, 24 to a sheet, and reject or replace any with a road, car park, sign, banner, railing, construction or event as a band or as the subject. Record each decision as a verdict line. This is a visual pass of about 13 sheets, not a research pass, and it is the thing that turns "the named keys are clean" into "the site is clean". Start with the §4 borderlines:
   - `gb-bristol`, `gb-kcl`, `cz-muni`, `hu-bme`, `pt-ucp`, `lt-lmta`, `au-adelaide`, `de-tu-berlin`;
   - `absalon` (name sign);
   - `gb-ual` (the fountains are the subject);
   - `sdu` gallery 3 (people, no place).
5. **Official-site checks for the unchecked tail** (271 empty and 54 circular). File this as a GitHub issue with the per-region counts in §5, and work it region by region, world first. Do not block round 4 on it.

If fixes 1–4 are done, I would expect round 4 to reach 8. The pipeline is sound, the home page is strong, and nearly every named photo is now one a student would stop for. What is left is applying the same eye to the photos nobody has named yet.
