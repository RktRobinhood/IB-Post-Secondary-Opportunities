# Template references: how strong sites build university and programme pages

14 Oct 2026. Measured at 1440px and 375px from computed CSS. Studyportals was read as text only; UCAS (bot challenge) and QS/THE were not reached.

Sources measured:
- UCL programme: https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/computer-science-bsc
- Melbourne programme: https://study.unimelb.edu.au/find/courses/undergraduate/bachelor-of-science/
- UvA programme: https://www.uva.nl/en/programmes/bachelors/psychology/psychology.html
- UvA list: https://www.uva.nl/en/education/bachelor-s/bachelor-s-programmes/bachelor-s-programmes.html
- Aarhus programme: https://bachelor.au.dk/en/computerscience/ · Aarhus list: https://bachelor.au.dk/en/
- BigFuture profile: https://bigfuture.collegeboard.org/colleges/university-of-michigan-ann-arbor
- Studyportals university: https://www.bachelorsportal.com/universities/39/university-of-amsterdam.html
- Studyportals programme: https://www.bachelorsportal.com/studies/376584/computer-science.html
- DAAD: https://www2.daad.de/deutschland/studienangebote/international-programmes/en/

## Programme page

**1. Order.** Above the fold everywhere: H1, one-line lede, key facts, 1–2 CTAs.
- UvA: H1 + lede + 3 CTAs on the left. A "ticket" card on the right holds language, mode, location and the next open-day date. Then a sticky section menu. The first H2 is **"Numerus fixus"** (selection: deadline 15 Jan, 270 places). After that come why/fit, a 4-up media row and a 4-up "Related programmes" row.
- UCL: H1 (56px) + lede + Apply/Register. Then "On this page" (a 3-column link grid), Key information, and **Entry requirements as the second section**. About, structure, fees, careers and "How to apply → Selection" follow.
- Melbourne: H1 + rank badges + codes. A 6-fact grid with a CTA column beside it. Then a sticky bar with the course name, "How to apply" and 7 section links.
- Aarhus: the H1 sits over a fact box whose **first line is the admission number** ("Quota 1 2026: 11,4 (Standby: 10,5)"), then language, place and start. Sections below are collapsed accordions.

**2. Key facts.** UCL: two tiers, a 2×2 grid (mode, duration, fees, **deadline**) over a 4-column small-caps row (start, code, location, department). Melbourne: 6 facts in 3×2, including **"Entry requirements: 91.00 lowest selection rank"**; one column on a phone, CTAs after. Studyportals: 4 (tuition, duration, deadline, start). Everywhere the deadline is a fact, not a separate panel.

**3. Requirements and selection.** UCL uses qualification tabs (A levels / IB Diploma / Other) holding label/value rows ("Points 40 · Subjects 20 in three HL incl. 7 in Maths · Contextual offer"), with English etc. in 18px accordions; "Selection" is a 2-line H3 plus link. Studyportals splits Academic / English / Other into short sections.

**4. "This" vs "other".** Other programmes come after the main column ends, in a different shape: UvA's full-width 4-card "Related programmes" row; BigFuture's "You might also be interested in…" spanning the full container; Aarhus's rail list; Studyportals' "Other interesting programmes for you".

**5. Type scale.** UCL 56/36/32 (18px accordion H2s); UvA 46/32/24; Melbourne 48/40/32. Reading column about 775px (UCL), 700px (UvA hero).

## University page

**1. Order.**
- BigFuture: H1 + location, then a sticky tab bar (Overview / Admissions / Academics / Costs / Campus Life). Next is a 5-fact grid, then the overview prose, then **"Important Dates" inline in the main column** (Feb 1 Regular Application Due, with Add to Calendar), then Next Steps and the full-width "You might also be interested in".
- Studyportals: name + rank, then 4 stats (24 Bachelor's programmes, scholarships, rating, rank). **Programmes come next, grouped by discipline.**

**2. Facts and deadlines.** BigFuture: 5 facts in a 2-column grid. Everywhere, dates are a short block in the content flow, never a tall side column; BigFuture's 258px rail holds only short promos.

**3. Long lists.**
- **Studyportals:** discipline tabs, each showing **4 programmes then "Show more programmes"**. A card holds title, degree type, mode, fees and duration.
- **UvA (64 programmes):** 11 category tiles (4 columns), a filter column with counts, then a **single-column list of rows** (~907×173px: title, one line, meta "English · Full-time", Compare) under a sticky "Show 64 items" toolbar.
- **Aarhus (6 programmes):** a 3-column card grid plus a 4th rail column holding the contact box.
- **Melbourne related areas:** heading left, 4-column chip list right (1:2 grid).

**4. Empty columns.** Nobody puts a long list beside a sidebar: lists run full-width (UvA, Studyportals) or the rail sits beside short content (Aarhus, BigFuture).

## Home / discovery and country

UvA runs category tiles, then filters with counts, then rows, with the result count in a sticky toolbar. DAAD filters by course type, language, subject group, fees, admission requirements, city and start date. Both put **counts** on entry points ("24 Bachelor's programmes", "English (24)"); country pages can do the same.

## CSS techniques worth copying

1. **Hero ticket** (UvA `.pageheader__ticket`). The hero is a 2-column grid, `minmax(0,1fr) ~28rem`. The ticket is a card holding 3–4 facts and the next date. On a phone it drops below the lede.
2. **Two-tier facts** (UCL `.key-information__grid` 2×2 + `.key-information__footer-grid` 4 columns). Big values for what decides (deadline, fees, duration, IB points). Small caps for metadata.
3. **Facts + action column** (Melbourne `.key-facts-section`: `grid-template-columns: 3fr 1fr`, with a 3-column inner grid). The aside is only as tall as the facts, so it never leaves a void. On a phone everything becomes one column.
4. **Sticky section nav** (UvA `.c-sectionmenu{position:sticky;top:70px}` with horizontal swipe; BigFuture tab bar `top:0`; Melbourne `.stickyPanel.hide`, shown after the hero, carrying title + Apply). On a phone it becomes one "Overview ▾" dropdown.
5. **Show-N-then-more per group** (Studyportals): 4 per discipline plus a button; `<details>` or a `[hidden]` slice suffices.
6. **Sticky list toolbar with count** (UvA `.c-list__toolbar{position:sticky;top:125px}`).
7. **Break out of the aside** (BigFuture, UvA): close the 2-column wrapper before long or "other" content; run it full width.

## Ranked changes for our templates

1. **University: take dates out of the tall left/right column.** Show the next 2–3 deadlines as a short full-width strip or ticket above the programme grid, so they come first on a phone and the long grid stops sharing its row with an empty column. (BigFuture Important Dates; UvA ticket)
2. **University: show 4–6 cards per field group, then "Show all N".** Add field chips/tabs at the top that jump to each group. (Studyportals discipline tabs; UvA category tiles)
3. **University with 13+ programmes: use compact rows instead of photo cards.** Each row has title, one line and 2 meta tags. Keep cards for short lists. (UvA list rows; Aarhus 3-up cards for 6 programmes)
4. **Programme: move the facts strip into a hero "ticket" on desktop** (UvA). It holds 4–6 fixed facts including **IB score/selection and deadline** (Melbourne entry-requirement fact, UCL deadline fact, Aarhus quota line). On a phone it stacks under the H1.
5. **Programme: present "What you need" as label/value rows.** Use IB points, HL subjects, English and Other, with extras in collapsed rows. Write "How places are decided" as a 2-line block with the key number first. (UCL IB tab and accordions; UvA "Numerus fixus" as first H2)
6. **Programme: settle on one type scale.** H1 ≈ 3rem, H2 ≈ 2rem, H3 ≈ 1.25rem, secondary topics as 1.125rem accordion summaries, prose capped near 45rem. (UCL 56/36/18 with a 775px column; UvA 46/32/24)
7. **Programme and university: add a sticky in-page section nav** that appears after the hero with the title and the official-page button. It becomes a single dropdown on a phone. (Melbourne stickyPanel; UvA sectionmenu; BigFuture tabs)
8. **Programme: close the main column, then run "Other degrees" as a full-width labelled 4-up row.** Use the same card anatomy as the university grid. (UvA "Related programmes"; BigFuture "You might also be interested in…")
