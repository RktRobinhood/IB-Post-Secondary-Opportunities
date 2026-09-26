# Programme cards: round 2 critique (issue #46)

**SCORE: 7 / 10.** Not accepted. Round 1 scored 6.

Critic: art director. I judged the local build at http://localhost:4350/ on 2026-09-25, at 1280×800 and 390×844 (2×), in light and dark mode.

## Reasons

**What is fixed:**

- **The photos now read.** The 16:10 anchor works: oscilloscope, wind tunnel, glass furnace, soldering tweezers.
- **No image file repeats.** `/` has 67 cards and 67 distinct photos. SDU (11), AU (5), VIA (10), CBS (6) and TU Delft (4) are clean too (`audit.json`).
- **Contrast passes everywhere.** I measured 2,600+ text runs against the real pixels behind them (`contrast.json`). The worst 5th percentile is 5.3:1 (the "Open admission" tag in light mode). Sand tags are now 6.6:1 in light and 7.7:1 in dark. The credential line is 12.9:1 or better.
- **Families collapse the SDU grid** from 15 cards to 11.

**Why it is still not an 8:**

- **The families built to end the degree confusion hide the degree.** SDU Electronics, Mechanical Engineering and Mechatronics each show only "Sønderborg" under the title.
- **The Paths table breaks on a phone.**
- **Cards are still text walls.** Desktop cards carry the Needs line, the quota line, a Danish-requirement paragraph and a quoted "As published" sentence. The International Bachelor in Social Sciences card runs about 15 lines.
- **Photos that look alike.** No file is repeated, but five sticky-note or whiteboard business workshops look the same at card size. Three "Economics and Business Administration" cards sit side by side.
- **The first screen of the discovery surface is weak.** The first 12 cards are an A–B alphabetical slice that ends with three CBS business cards.

## Three changes that would raise it most

1. **Never drop the degree from a family card.** In `src/lib/paths.mjs` `familyCard()`, when degree or years differ, `line` should read **"BSc or BEng · 3–3½ yrs · Sønderborg"**: the distinct degrees joined with "or", and the years as a range. The rows keep "BSc 3 yrs" and "BEng 3½ yrs (internship)". Add a guard that every rendered `.card__cred` contains a degree.
2. **On a phone, show the Paths table as stacked blocks.** Below 40rem, render each path of `#paths-title`'s table as a block with these lines:
   - the label (with "You are here");
   - "What is different" as one line;
   - then "3 yrs · 180 ECTS", "Quota 1: at least 31 IB points (7.0)" and "Full Diploma needed".

   There should be no horizontal scroll and no column narrower than a word.
3. **Keep each block of the card body to one line.** Drop `.req__local` (the Danish requirement) and the "As published:" quote from cards at every width; the programme page already carries them. Clamp `.req__ib` to 2 lines with a "+ n more" link. The card becomes photo, title, credential line, one Needs line, the tags and the institution.

## Bugs

| # | Bug | Screenshot |
|---|---|---|
| 1 | Credential-axis family cards show "Sønderborg" with no degree or length, on `/` and on the SDU page: Electronics, Mechanical Engineering and Mechatronics. | `sdu-desktop-light-card-electronics.jpg`, `sdu-phone-dark-card-electronics.jpg` |
| 2 | The phone Paths table has 5 columns in 358 px. "At / least / 31 IB / points" stacks one word per line, and the "What is different" column is off-screen. | `member-phone-dark-paths.jpg`, `member-phone-light-paths.jpg` |
| 3 | There is a hard seam under the credential line. On a phone the 16:10 image is about 13.9rem tall, but the veil only reaches solid paper at `--card-headroom + 6rem` = 15rem (`site.css` ~2249), so the photo stops with a step of about 8 levels. Fix: end the gradient by the image's height. | `bug-seam-phone-ucm.jpg` |
| 4 | "Show all 73 degrees" opens a grid of 67 cards. It should count cards, or say "73 degrees on 67 cards". | `bug-showall-count.jpg` |
| 5 | Biotechnology (Absalon) reads "BEng · Kalundborg" with no length. `data/programmes/dk-absalon-biotechnology-beng.json` has no `credential.years` or `ects`. Its sibling, Robot Systems, has 3.5. | `home-desktop-dark-card-biotechnology.jpg` |
| 6 | The degree wording is long and inconsistent, and it wraps on a phone. <ul><li>"Bachelor of Arts or Bachelor of Science · 3 / yrs · Maastricht": the UCM record has no `abbreviation`.</li><li>"Professional bachelor · 3¼ yrs · / Nexø, Bornholm" leaves a dangling "·".</li><li>"Academy Profession degree" and "Professional bachelor" use different casing.</li></ul> Fix: "BA or BSc"; wrap each fact in a `nowrap` span; use one casing. | `home-phone-light-card-university.jpg`, `home-phone-dark-card-crafts.jpg` |
| 7 | The business photos look alike at card size: the `field-business-*` pool, Creative Business and Global Business Informatics are all sticky-note walls. | `home-desktop-light-all.jpg` (the second quarter) |
| 8 | On a phone, "What this means in IB terms" hangs alone under the Needs line once the Danish line is hidden. It reads as an orphan. | `sdu-phone-dark-card-electronics.jpg` |

## Files

- **Shots:** `home-*`, `sdu-*`, `member-*`, `dk-au|nl-tudelft|dk-via-desktop-light-grid.jpg` and `bug-*`.
- **Data:** `audit.json`, which holds every card's line, photo and expected record values, and `contrast.json`.
- **Scripts:** `tools/shoot.mjs`, `tools/audit.mjs`, `tools/contrast.mjs`, `tools/showall.mjs`, `tools/sheet.mjs` and `tools/cdp.mjs`.
