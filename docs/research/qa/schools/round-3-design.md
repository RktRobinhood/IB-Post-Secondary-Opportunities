# Curated school pages (#43): art director, round 3

Screenshots: `D:\ibp-tmp\shots-r3\`. The set is Aalto, Metropolia, Åbo Akademi, Oxford and the Finland country page, at desktop 1280 and phone 390, in light and dark: 20 images. I looked at every one. I cut the tall captures into full-resolution slices and zoomed into the phone hero breadcrumbs. I also read `src/pages/schools.mjs` and the `.card--prog` styles, to explain what the screenshots show.

## Score: 7/10. Not accepted, but close.

Both round-2 defects are gone. The close button wraps on a phone. The page says things once: tuition is one line, each card ends in "On aalto.fi ↗", and the orange "#" has gone everywhere. Åbo Akademi is now "Taught in Swedish", and its close leads on to "Other schools in Finland". The page holds together in both themes and at both widths. A student would trust it.

It is not an 8 yet. The programme section is where a student decides the school is worth a look, and it is still the weakest part of the page:

- **The grouping made Aalto sparser, not easier to read.** It has 11 programmes in 7 groups, and 4 of those groups hold a single card. At desktop, most rows are one card with two-thirds of the row empty, under a heading that repeats the chip on the card ("Design · 1", then "DESIGN"). The grouping starts at 7 programmes (`GROUP_FROM = 7`), which is too early.
- **The colour does not code anything.** The band is `i % 6` over the field list, so unrelated fields share a colour. In dark mode, Business, Arts, Design, Economics, Engineering, Health and Social sciences all come out the same mint. At 6 px, the band is still a rule, not colour.
- **The credentials are still raw codes.** Metropolia shows "BHealthCare", "BSocHealthCare", "BConstrMgmt", "BLabServices" and "BSocServices". Round 2 asked for plain words.
- **On a phone, Metropolia is still about 4,800 px of cards:** 21 cards at about 200 px each. Round 2 asked for compact rows or a fold. Neither was done.

## Changes, ranked

1. **Make the programme section read as a spread of subjects.**
   - *Group later, and never leave a group of one.* Group only from about 13 programmes. When you do, give a heading only to fields with 3 or more programmes, and put the rest in a last group, "Other fields · N". Under that rule, Aalto (11) becomes one full 3-column grid. Metropolia gets "Engineering · 6", "Health · 7" and "Other fields · 8".
   - *Drop the field chip inside a headed group.* The heading already says it. Keep the chip in flat grids and in "Other fields".
   - *Give each field its own colour.* Map each field to a colour explicitly, not with `i % 6`. Check the result in dark mode, where the greens currently fall together.
   - *Make the band a band.* A 28–32 px field-tinted header that holds the field name in small caps, in place of the chip. Without a photograph on every card, this is where the page gets its colour.

2. **Write the credentials in plain words.** Put a data mapping (credential code → words) in the school data or a shared lookup, never in a branch for one country:

   | Code | Plain words |
   |---|---|
   | BHealthCare | Bachelor of Health Care |
   | BSocHealthCare | Bachelor of Social Services and Health Care |
   | BConstrMgmt | Bachelor of Construction Management |
   | BLabServices | Bachelor of Laboratory Services |
   | BSocServices | Bachelor of Social Services |

   The rule is "BSc · 3 yrs" at a glance, and a code a student cannot read fails that rule.

3. **Make long lists short on a phone.**
   - For grouped lists below 600 px, show each programme as a compact row: the title, the credential line under it, and ↗ on the right. Leave out the chip and the foot rule. A row is about 64 px, so Metropolia drops from about 4,800 px to about 1,600 px.
   - Alternatively, show the first two groups open and put the rest behind `<details>` ("Health · 7 ▸").
   - Do not hide `p.ib` on shorter lists. On Aalto's phone view, "IB grades do not count: preliminary assignments… decide" is gone from Design and Media, and it is the most useful line on that card.

4. **Give the catalogue and Swedish-taught cases something to look at.**
   - *Oxford.* "Nearly every course at Oxford is taught in English" and the fact "In English: Nearly everything" are true of every UK school, so they tell the student nothing.
     - Make the fact "52 courses". The number is already in the hero lede.
     - Make the line say what is particular to Oxford, for example "One subject in depth, taught in college tutorials."
     - Turn the four "Known for" chips into tiles, 2×2 on a phone, each a body-size word. These chips are still the smallest things on the page, and round 1 and round 2 both asked for them to be bigger.
   - *Åbo Akademi.* Keep "Taught in Swedish", but make the line under it the opening, not the refusal: "Swedish A at grade 2 or Swedish B at grade 5 gets you in." Close the gap of about 70 px between the heading and that line, and the gap of about 80 px under the chips.

5. **Polish the chrome.**
   - *The breadcrumb on a phone hero.* Oxford's "United Kingdom / Oxford" sits on the stone balustrade and is barely legible at 390 px. Add a short top scrim to the hero, or move the crumb below the photograph on a phone. In dark mode the "/" separators disappear (Aalto and Åbo desktop dark).
   - *"Apply via" on a phone.* The value wraps to 4 lines ("Studyinfo.fi (Aalto's own separate application)"). Show "Studyinfo.fi" as the link, and put the note on a second, muted line.
   - *The close heading should match where the button goes.*
     - "Go on to University of Oxford" needs "the".
     - Metropolia's close says "Go on to Metropolia…" but the button is "Spring Joint Application, English degrees", which goes to a national portal.
     - Let the hand-off data set the heading, or use the neutral "Next step" heading with the button alone.
   - *The deadlines panel.* Each label is still an underlined link, so the column has 6 underlines. Drop the underline and keep it on hover. The "Links → Admissions" link is set larger than everything else in the panel. Match it to the label size.
   - *The pager.*
     - There is still about 120 px of empty paper under the pager, on both desktop and phone.
     - Oxford's lone "Next" card spans the full width with its label left-aligned. On Finland pages, "Next" is right-aligned.
     - Give the next school its card thumbnail. This was asked in round 1.
   - *The way in (Finland page).* "See the school →" is there now, but it is set in grey meta type at the same weight as "Helsinki · Research university". In 5 of the 14 cards it wraps onto a line of its own, and "IB statement ↗" in orange is still the loudest thing on each card. Set "See the school →" in the accent colour, or make the card title carry the cue.

## The coordinator's notes

- **The hero is the card photo. I agree.** A card that shows the photo of the page it opens is a thumbnail, and the Danish institutions work the same way. The owner's rule is about different things sharing a picture. Record this reading in `STATUS.md` under the standing rules, in one line, so that the next critic does not raise it again. Have the `unique-images` guard allow only that pair: a card and its own page.
- **A second photo mid-page is out of scope. I accept that.** That is why change 1 matters: without photographs, the field bands have to carry the colour in the middle of the page.
- **The phone photo strips on the country page are the compact layout from #37. I accept that.** I have not scored them.

## Round-2 points: what was fixed

| Round-2 point | Status |
|---|---|
| Close button runs off the screen at 390 px | Fixed. It wraps inside the width |
| Hero is the same photograph as the card | Resolved by the coordinator's reading, which I agree with. Record it (above) |
| Group long lists under field headings | Done. The threshold is too low, and single-card groups hurt it (change 1) |
| Compact rows or a fold for long lists on a phone | Not done. Card text is hidden, but each card is still about 200 px (change 3) |
| Say shared tuition once and drop the per-card chip | Fixed ("Free for EU/EEA citizens.") |
| Credentials in plain words | Not fixed (change 2) |
| Equal card heights within a row | Fixed |
| "On metropolia.fi ↗" foot on each card | Fixed |
| Aalto's count said three times | Fixed. The section lede now says tuition |
| Åbo: "Taught in Swedish" as the title | Fixed |
| Åbo: a positive line under the title | Not fixed. It still reads "No English-taught bachelor's here for 2027." (change 4) |
| Åbo: label the chips "Known for" | Fixed |
| Åbo: a close that leads on to the other Finnish schools | Fixed ("Other schools in Finland") |
| A picture mid-page | Out of scope by the coordinator's decision |
| A field header band of 32–40 px | Not done. The band is 6 px and the colours collide (change 1) |
| Oxford: "Known for" as tiles or body-size chips | Labelled, but still small chips (change 4) |
| Remove the orange "#" | Fixed, on school pages and on the Finland page |
| Deadline labels in ink, not a block of orange | Mostly fixed. They are ink now, but still underlined (change 5) |
| Breadcrumb out of the gap between the fact strip and the heading | Moved into the hero. On a phone it is now hard to read over busy photographs (change 5) |
| Drop the close subline that repeats the button | Fixed |
| Tighten the gap before the pager | Fixed above the pager. About 120 px is still left below it |
| Finland page: "See the school →" | Added, but too quiet (change 5) |
| Finland page: phone top photo | Kept as accepted in #37 |
| Finland page: descriptions ending in "…" | Not fixed (below) |
| Finland page: "UOulu" | Not fixed (below) |

## Outside this change

- **The Finland map still captures as a flat black rectangle** at both widths and in both themes. On a phone, the right-hand labels are clipped at the edge ("University of Eas", "LUT Universit"). The map label and pill still say "UOulu".
- **Nine Finland card descriptions still end in "…":** Aalto, Tampere, Oulu, Jyväskylä, Metropolia, Haaga-Helia, Tampere UAS, Laurea and Arcada. Write them to fit.
- **Haaga-Helia's card is still a monogram** on ruled paper. On a phone it is a narrow ruled strip with "HH".
- **LUT's card photograph shows the university's name lettered on the building.** That goes to the photo editor.
- **The Finland hero has faint horizontal lines across the sky** on desktop. It looks like the ruled-paper texture bleeding over the photograph.
- **The Finland page's topic stack** is still about 11 accordions in a row.
