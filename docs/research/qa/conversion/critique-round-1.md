# Conversion critique — round 1

Critic: an experienced IB Diploma coordinator who also knows Danish admissions
(KOT, quota 1/2, the Agency's IB handbook). A fresh critic, not the one who did
the work. Written 25 September 2026.

Judged: Danish programme requirements shown in IB terms (NOTES.md decisions
1–15, screenshots `round-0b/`), against `data/ib-conversion.json`,
`data/recognition/dk.json`, the built pages, the engine (`assess`, run against
the live opportunity records), and the universities' own pages fetched today.

**SCORE: 6 / 10.**

## Verdict

The translation layer does what the owner asked for, and most of it is right.
"Any IB English · Maths HL (AA or AI)" is exactly what a coordinator would tell
a student. The English and Maths mappings, the science mappings and the
single-grade conversions all match the handbook. The AU cards read cleanly on a
phone. It is not ready to accept, for four reasons:

1. **Wrong at the university level where the site already has the
   university's answer.** Aarhus publishes its own IB page: Global Politics HL
   *is* Social Studies B, and GP SL is Social Studies B with Economics. The site
   says "Social Studies B: no IB equivalent … Aarhus only in combination with
   Economics … Meet this requirement through one of the other options instead"
   on every AU card and page, and the planner puts a GP HL student into "needs
   review" with the same wrong sentence. `data/dk/au.json` `ibNotes` already
   records the correct rule. `data/dk/cbs.json` records a CBS table that says
   Social Studies B is met by BM, Economics, GP or History (SL/HL), Geography
   HL or Anthropology HL. The CBS pages still say "no IB equivalent".
2. **ITU's minimum grades are wrong for students who hold the subject at A
   level.** ITU writes "average mark of at least 6 … (no grade requirement if
   Danish A-level is passed)". The site says "Any IB English, at least a 5".
   The engine then reports a **gap** for English B HL at grade 4, which ITU
   would accept. This affects both ITU programmes, for English, and GBI for
   Maths as well.
3. **Broken rendering on 8 programme pages and 7 institution cards.** When a
   one-of alternative is not a Danish subject (for example "or an accepted
   English test"), it is dropped. What is left is "Needs one of: Any IB
   English, at least a 3 /" with a trailing slash, and an empty "Danish
   requirement:" line on the page. The BAAA card is scrambled. VIA Design,
   Technology and Business shows "Any IB English, at least a 3 / Any IB
   English, at least a 3". The `ib-terms` guard passes all of this.
4. **The half of "the conversion scale" a student feels most is not
   converted.** Every card and page shows "Last cut-off 11.4" or "most recent
   cut-off 10.7" as a Danish GPA. For an IB student that is the most confusing
   number on the card. The average table to translate it is already in the
   Recognition Scheme.

## Gate

- `$env:SITE_BASE='/IB-Post-Secondary-Opportunities'; node scripts/qa.mjs`:
  **all 30 checks pass**. The first run hit EPERM on `dist/` because another
  agent was building; the retry was clean. `ib-terms` passes, but it does not
  catch finding 3.
- `node src/build.mjs` with SITE_BASE unset: ok after retries (ENOENT/EPERM
  from concurrent builds). 152 pages. Snapshot taken to the scratchpad for
  reading.

## Correctness table

16 programmes, 9 institutions. "Site" is the card or programme-page IB wording.
Official quotes were fetched 25 Sep 2026.

| # | Programme | Danish requirement (record) | Site, IB terms | Handbook check | University's own page (quote) | Verdict |
|---|---|---|---|---|---|---|
| 1 | AU Cognitive Science | Eng B, Maths B, one of Hist B / Idéhist B / Samf B / Samtidshist B | Any IB English · Any IB Maths — one of: History (SL or HL) + 3 options with no IB route | Eng B ← Eng B SL/HL, Eng A ✓; Maths B ← AA/AI SL/HL ✓ | bachelor.au.dk/en/cognitivescience: "English B", "Mathematics B", "History B or History of Ideas B or Social Studies B or Contemporary History B". bachelor.au.dk/en/admission/moreinfo/international-baccalaureate-ib: GP HL "Recognised as Social Science B"; GP SL "Recognised as Social Science B in combination with Economics SL/HL" | **Wrong** on Social Studies (AU route exists). Contemporary History also has a route (row 16) |
| 2 | AU Economics & Business Admin | as 1 + Int. Econ B | … / Economics or Business Management (SL or HL) + 3 no IB route | Econ/BM → business subjects B/A ✓ | bachelor.au.dk/en/economics-and-business-administration: "History B or History of Ideas B or Social Studies B or Contemporary History B or International Economics B" | **Wrong** on Social Studies (as 1). Rest ✓ |
| 3 | AU Computer Science | Eng B, Maths A | Any IB English · Maths HL (AA or AI) | Maths A ← AA HL, AI HL ✓ | bachelor.au.dk/en/computerscience: "English B", "Mathematics A" | ✓ |
| 4 | CBS International Business | Eng A (language req) + Eng B min 6, Maths B, one of 5 | Two English lines: "English A (Lit or L&L), SL or HL; or English B HL" and "Any IB English, at least a 5" · Any IB Maths | Eng A ← Eng A any / Eng B HL ✓; 6 → IB 5 (IB 4→4, IB 5→7) ✓ | cbs.dk …/bsc-international-business: English "B with a minimum grade of 6.0", "Language requirement: A"; Maths "B"; "History, Social Studies or International Economics" B | Grades ✓. **Wrong** on Social Studies against CBS's own table in `data/dk/cbs.json` (could not re-read it live: the CBS accordion does not render). English is correct but split into two lines (see clarity) |
| 5 | CBS BA & Sociology | as 4, Maths B min 6 | … Any IB Maths, at least a 5 | 6 → IB 5 ✓ | cbs.dk …/bsc-business-administration-and-sociology: Maths "B with min. 6.0 grade average" | ✓ (Social Studies as 4) |
| 6 | ITU Data Science | Maths A min 6, Eng B min 6 | Maths HL (AA or AI), at least a 5 · Any IB English, at least a 5 | ✓ as encoded | en.itu.dk …/data-science: English "corresponding to the Danish B-level with an average mark of at least 6 … (or Danish A-level with no grade requirement)" | **Wrong** for English A / English B HL holders: no minimum applies. Engine reports a gap for English B HL at 4 |
| 7 | ITU Global Business Informatics | Maths B min 6, Eng B min 6, Danish A | Any IB Maths, at least a 5 · Any IB English, at least a 5 · Danish A (Lit or L&L), SL or HL | Danish A SL: formally Danish B in the handbook, "normally accepted" | en.itu.dk …/global-business-informatics: Maths and English B "average mark of at least 6 … (no grade requirement if Danish A-level is passed)"; Danish "A-level … must be passed" | **Wrong** for Maths HL and English A / English B HL holders (as 6). Danish A ✓ |
| 8 | AAU Energy Engineering | Eng B, Maths A min 4, one of Phys B+Chem C / Phys B+Biotech A / Geosci A+Chem C | Maths HL (AA or AI), at least a 4 … | 4 → IB 4 ✓; Biotech A, Geosci A: no IB row ✓ | en.aau.dk …/energy-engineering: "Mathematics A with a minimum average grade of 4.0"; "Physics B and Chemistry C" / "Physics B and Biotechnology A" / "Geoscience A and Chemistry C" | ✓ |
| 9 | AAU Economics & Business Admin | Eng B, Maths B, one of 5 | as AU EBA | ✓ | en.aau.dk …/economics-and-business-administration: "History B or History of Ideas B or Contemporary History B or Social Studies B or International Economics B" | ✓ against the handbook. Social Studies "no IB route" is defensible here, because AAU publishes no IB table |
| 10 | VIA Mechanical Engineering (BEng) | Maths A, Eng B, Phys B / Geosci A, Chem C / Biotech A, all min 02 | Maths HL (AA or AI), at least a 3 · Any IB English, at least a 3 — Physics … — Chemistry … | 02 → IB 3 ✓ | en.via.dk …/mechanical-engineering: Chemistry "equivalent to a Danish C-level … OR Biotechnology … A-level"; "must be passed with a min. average of 2.0" | ✓ (the second one-of now shows, per NOTES 8) |
| 11 | VIA Global Business Engineering | Maths B, Eng A, min 02 | Any IB Maths, at least a 3 · English A (Lit or L&L), SL or HL; or English B HL, at least a 3 | ✓ | en.via.dk …/global-business-engineering: "English equivalent to a Danish A-level", "min. average of 2.0" | ✓ |
| 12 | DTU General Engineering | Maths A, Eng B, Phys B, Chem B | Maths HL (AA or AI) · Any IB English · Physics (SL or HL) · Chemistry (SL or HL) | ✓ | dtu.dk …/general-engineering: "Mathematics A-level", "Physics B-level", "Chemistry B-level", "English B-level" | ✓ |
| 13 | RUC Global Humanities | Eng B, 2nd foreign lang B, Hist B / Idéhist B / Samtidshist B | Any IB English · Another language (A or B), SL or HL; or Language ab initio SL · History | ab initio → beginner A; B → continuation A ✓ | ruc.dk …/bachelor-global-humanities-int: "either beginner's language at Danish A-level or advanced language at Danish B-level" | ✓ |
| 14 | SDU Mechatronics (BSc) | Eng B, Maths A, Phys B / Geosci A | Any IB English · Maths HL (AA or AI) · Physics (SL or HL) + 1 no IB route | ✓ | sdu.dk …/mechatronics/adgangskrav: "English level B", "Mathematics level A", "Physics level B … OR Geoscience level A" | ✓ |
| 15 | SDU European Studies | Eng B, Maths B, Hist B / Samf B / Idéhist B / Samtidshist B | Any IB English · Any IB Maths — History … | ✓ | sdu.dk …/europaeiske_studier/adgangskrav: "History level B OR Social Sciences level B OR History of Ideas level B OR Contemporary History level B" | ✓ |
| 16 | BAAA Multimedia Design (AP) | Eng C; Maths C / Econ C; language req Eng B or test | Card: "Any IB English — one of: Any IB Maths / Economics or Business Management (SL or HL) — one of: Any IB English /" | Econ SL → Erhvervsøkonomi C ✓ | baaa.dk admission-requirements: "English at the Danish B-level … if you only fulfil … English at C level … the language requirement can be satisfied with an English test" (IELTS 6.5 etc.) | Mapping ✓. **Rendering broken**: the test option vanishes and an empty "Danish requirement:" is left |

Cross-cutting checks against the owner's questions:

- **"Any IB English" for Danish English B.** True per the handbook: English B
  SL → B, English B HL → A, English A Lit / Lang & Lit SL or HL → A. AU adds
  that English must appear on the Diploma ("not possible to grant a
  dispensation … if you do not have English as a subject"), which fits. One
  caveat: English ab initio is not in the catalogue and is not accepted. "Any
  IB English" should say "(not ab initio)" once, on the conversion page.
- **Maths A = Maths HL (AA or AI).** Correct: handbook row "Mathematics:
  Analysis and Approaches HL / Applications and Interpretation HL".
- **Maths B = any SL, AI SL included.** Correct: handbook row lists both SL
  courses. "Any IB Maths" is the right phrase, since every current Diploma
  has one of the four.
- **Minimum grades.** 02 → IB 3, 4 → IB 4, 6 (6.0 average) → IB 5: all
  right per the single-grade table, and CBS's own note "Danish grade 6.0 =
  local grade 5" (recorded in `cbs.json`) agrees. What is missing is the
  institution-level "no minimum if A-level" waiver (ITU).
- **"No IB route" claims.**
  - Geoscience A: right. The handbook leaves it blank.
  - Biotechnology A: right.
  - History of Ideas B: right. There is no handbook row, and Philosophy is not
    listed for it.
  - Contemporary History B: **not right for History HL.** The handbook's
    History A row names "Historie / historie med samfundskundskab /
    samtidshistorie", so History HL is Contemporary History A, which covers B.
    The conversion page contradicts itself: its History A row shows
    "samtidshistorie" in the Danish name, and the Contemporary History B row
    below it says "No IB equivalent". It does no harm in practice, because
    History is always a sibling option. But it inflates "+ 3 options with no IB
    route" to 3 when it should be 2.
  - Social Studies B: right nationally. **Wrong at AU**, where AU publishes
    the route, and at CBS per the repo's own record. It is also discouraging:
    "Meet this requirement through one of the other options instead" tells a GP
    student to give up on an option the university has said yes to.

## Clarity (read as a 17-year-old IB student)

What works:

- AU card grid, desktop and phone (`round-0b/01`, `02`): "Needs Any IB English
  · Maths HL (AA or AI)" answers the question in one line. The small grey
  Danish line with "What this means in IB terms" is the right hierarchy.
- The conversion page opener ("A/B/C are levels of study, not grades … not the
  IB course English B") is the sentence the owner asked for. The subject table
  is useful.
- Planner "met" lines lead with the IB phrase and end with the Danish form.
  That works.

What is still confusing:

1. **Cut-offs are only in Danish GPA.** "Last cut-off 11.4" on a card,
   "most recent cut-off 10.7 on the Danish 7-point grading scale" on a page,
   "most recent cut-off 7.5" in the planner. To an IB student these are noise.
   From the average table: 10.7 ≈ 40 points, 11.4 ≈ 43, 9.2 ≈ 36, 6.9 ≈ 30.
2. **CBS shows two English requirements.** "English A (Lit or L&L), SL or HL;
   or English B HL" plus "Any IB English, at least a 5". A student with English
   B SL 7 reads the second line and thinks they are fine; the engine correctly
   says they are not. In IB terms the two collapse to one line: **English A
   (any) or English B HL, at least a 5.**
3. **"+ 3 options with no IB route"** reads as "the door is shut". Two of the
   three do not matter, because History is right there, and the third
   (Social Studies) is sometimes open. Suggest "+ 3 Danish-school subjects",
   with the GP exception shown where a university publishes it.
4. **"No minimum grade is recorded for this subject."** It is repeated under
   every requirement (5–8 times per page) and is the noisiest line on the
   programme page. Say it once above the list.
5. **Planner "✓ You satisfy one of the 5 accepted subject combinations"** does
   not say which one. "Your History SL counts as History at B level" would
   teach the mapping.
6. **Conversion page, phone** (`round-0b/09`): the table caption ("EVERY
   SUBJECT A PROGRAMME ON THIS SITE ASKS FOR …") wraps one word per line in a
   narrow column. That is a layout bug.
7. **Conversion page Social Studies B row** says only "No IB equivalent.
   Denmark publishes no fixed equivalence". It should add "Global Politics can
   count at some universities (Aarhus: GP HL; GP SL with Economics)".

## Top fixes, ranked

1. **Institution-level IB equivalences override the national "no equivalent"**
   (Social Studies B via Global Politics at AU; CBS's published list). Encode
   them as data on the institution or opportunity, not as a country branch.
   The engine and `ibTermsFor` should read them first. Then AU/CBS cards say
   "History / Economics or BM / Global Politics HL", and the planner passes a
   GP HL student at AU. Fix the scheme sentence in
   `data/recognition/dk.json` (`subjectsWithoutEquivalence[Social Studies]` and
   `global-politics.unmapped`) to "Aarhus accepts GP HL, and GP SL with
   Economics". Drop "Meet this requirement through one of the other options
   instead" wherever a route is published. Files: `data/recognition/dk.json`,
   `data/dk/au.json`, `data/dk/cbs.json` → opportunities,
   `src/lib/eligibility.mjs`, the schema.
2. **Model "minimum grade unless held at a higher level"** (ITU: "no grade
   requirement if Danish A-level is passed") and re-encode ITU Data Science and
   ITU GBI. IB wording: "Any IB English — at least a 5 at SL (English B SL);
   any grade at HL or English A". Files:
   `data/opportunities/dk-itu-*.json`, `data/dk/itu.json`,
   `src/lib/eligibility.mjs`, `scripts/test-eligibility.mjs` (add the English
   B HL 4 scenario).
3. **Render non-subject alternatives** ("or an accepted English test — IELTS
   6.5 …") instead of dropping them. Kill the empty "Danish requirement:" and
   the trailing "/". De-duplicate identical IB phrases inside one one-of (VIA
   Design, Technology and Business). Extend
   `scripts/test-requirement-translation.mjs` to fail on an empty `.req-local`,
   a trailing separator, or a repeated phrase in one list. Pages: BAAA
   Multimedia, VIA Character Animation / Computer Graphic Arts / Graphic
   Storytelling / Architectural Technology / Construction Technology / Design
   Technology & Business, Zealand Architectural Technology, Royal Danish
   Academy Crafts.
4. **Show cut-offs in IB points next to the Danish figure**: "Last cut-off 10.7
   (≈ 40 IB points)", using the lowest total whose conversion reaches the
   cut-off, read from `gradeConversion.average`. Link to `#average`. Check
   before wording it whether the 1.08 multiplier for applying within two years
   of the exam applies to converted international averages, and say so if it
   does. Files: card, programme page and planner templates under `src/pages/`,
   plus a helper beside `convertAverage` in `src/lib/eligibility.mjs`.
5. **Contemporary History B ← History HL.** Add the handbook's History A
   aliases (samtidshistorie, historie med samfundskundskab) to the scheme, so
   Contemporary History A is met by History HL and B by History HL.
   `data/recognition/dk.json`.
6. **Merge same-subject requirements into one IB line** (CBS English: "English
   A (any) or English B HL, at least a 5"). Say "No minimum grade is recorded"
   once. Name the matched combination in the planner. Fix the table caption on
   phone on the conversion page. Add "(not English ab initio)" to the "Any IB
   English" explanation on `#levels`.

Fixes 1–3 would move this to 8. Fix 4 is what makes it a 9 for the owner's
actual complaint.
