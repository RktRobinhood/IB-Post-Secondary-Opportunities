# Issue #52, round 1: one card per programme, campuses inside

**Built from the worktree `wt-52`, 26 September 2026.**
- The screenshots were taken with the headless shooter (`docs/research/qa/schools/shoot.mjs`).
- The build had no `SITE_BASE`, served on :4461.
- There are 36 shots: 9 paths, each at desktop 1280 and phone 390, light and dark. There are also 4 crops.
- Every shot is a JPEG under 400 kB. Full pages over 400 kB were re-encoded, not cut.

The sweep, and the reason for each case, are in [../../../programme-families/campuses-52.md](../../../programme-families/campuses-52.md).

## What changed

| # | Change | Where | Shot |
|---|---|---|---|
| 1 | A family whose paths are on different campuses shows a count on its card line: "BSc · 3 yrs · 2 campuses". It no longer lists "Aarhus or Herning". The rows under it name each campus once, with what differs on it. | `src/lib/paths.mjs` `familyCard` | `crop-au-eba-card--desktop-dark.jpg`, `universities__dk-au--*.jpg` |
| 2 | A campus family's page says it plainly: "The same programme is offered at the Aarhus campus and the Herning campus." The heading is "… on 2 campuses". | `src/lib/paths.mjs` `pathsTable` | `crop-au-eba-campuses-table--desktop-light.jpg`, `programmes__dk-au-…-herning-…`, `programmes__dk-sdu-software-engineering-vejle-…` |
| 3 | The Paths table can also compare **Taught in** and **Apply by**, the first hard closing date of each path's route. As before, a column shows only when the paths differ on it. | `src/lib/paths.mjs` | none: no current family differs on either |
| 4 | **School records get families.** They take `family { name, axis, path, differs, primary }` and `separateFrom [{ name, reason }]` in `schemas/school.schema.json`. A school page draws one card per family, with a row per path. Each path's page has a Paths table built from the record's own fields, and its "More at …" cards are other cards, never its own family. | `src/lib/families.mjs`, `src/pages/schools.mjs`, `src/pages/school-programme.mjs`, `src/build.mjs` (pager order) | `universities__fi-lut--*`, `universities__nl-hanze--*`, `crop-lut-energy-paths--phone-*.jpg`, `universities__fi-lut__energy-technology-hebut-double-degree--*`, `universities__nl-hanze__international-business-3-year--*`, `universities__at-modul__bsc-in-international-management--*` |
| 5 | Five families were merged in school records: LUT Electrical Engineering, Energy Technology and Mechanical Engineering (each with its HEBUT double degree), Hanze International Business (3 or 4 years), and MODUL International Management (with or without professional experience). Fontys's two Marketing Management programmes stay apart, and `separateFrom` records why. | `data/schools/fi-lut.json`, `nl-hanze.json`, `at-modul.json`, `nl-fontys.json` | as above |
| 6 | **Guards.** The data guards now fail on two cards with one name at one institution: `checkFamilies` for Danish records and `checkSchoolFamilies` for school records. They also fail on a same-subject pair that is neither a family nor declared separate. The new `card-names` check reads the built pages. It fails when two programme cards on a `/universities/<key>/` page share a name, when two home cards share a name and an institution, or when a path page has no complete Paths table. `school-pages` now counts one card per family. | `src/lib/families.mjs`, `scripts/check-schools.mjs`, `scripts/test-card-names.mjs`, `scripts/lib/quality-gate.mjs`, `scripts/test-school-pages.mjs` | none |

## Seen in the shots

- **AU Economics and Business Administration.** The card reads "BSc · 3 yrs · 2 campuses", with "Aarhus — last year 36 IB points" and "Herning — last year 30 IB points". The Herning page opens its prose column with the campus table: the last cut-off, and one line each on what is different.
- **LUT.** There are 12 cards for 15 programmes. Each HEBUT double degree is a row on its subject's card, with places 50 or 60. The phone Paths table stacks each path as a block.
- **Hanze.** International Business is one card, "BBA · 3–4 yrs", with rows "4 years" and "3 years".

## Left for the critic

- A school page's "In English" tile still counts degrees (LUT "15 degrees"), not cards (12). A double degree is a degree of its own, so the count stays. Say so if it reads as a mismatch.
- **Open question (in `campuses-52.md`).** SDU's BSc and BEng families differ in admission. #52 says "separate cards only when what a student must do differs", and #46 put them on one card. They were not changed.
- **Candidate specialisation family.** Göteborg's Music, Classical against Improvisation Performance, is still two cards until someone checks that the two use the same admission test.

## After the merge with programme pages round 3 (#43)

Merge resolved on 26 September 2026. Four phone-light shots were re-taken from the merged build. The AU Herning shot came out byte-identical, because round 3 did not touch that page.

**Both sides are kept.** Round 3 brought:
- date scoping;
- the "After your Diploma" and "Not open yet" labels;
- the "Before you apply" note;
- `displayName`;
- the panel hero;
- "More <field> in <country>".

#52 brought families, `separateFrom` and the Paths table.

**Where the two meet:**
- The Paths table's Apply-by column uses round 3's reader-aware `applyBy`. A path with no round for a final-year student shows "After your Diploma" or "Not open yet", the same as its own facts strip.
- A family card's row says "After your Diploma" for a Diploma-holders-only path.
- "More <field> in <country>" draws each other school's card as that school's page does, so a family appears as one card.
- The table heading uses `displayName` ("2 ways to study International Management").
