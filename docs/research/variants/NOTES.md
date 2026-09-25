# Variants, unique images, systemic duplication: working notes

Phase A (analysis, data, images). Log written as the work happens so an
interrupted session loses nothing. Newest entries at the bottom.

## 2026-09-25

- Catalogue: 73 programmes, each with exactly one opportunity (`data/programmes`,
  `data/opportunities`). Cards on /programmes/, institution pages and the planner
  are one per programme.
- Programme-card photographs as resolved today (`src/lib/programme-imagery.mjs`):
  **73 cards draw on 39 distinct photographs**; 34 cards repeat a photograph
  another card already shows. Worst: 8 computing cards on one photo, 7 on a
  second computing photo, 7 business on one, 6 on a second business photo.
  (The owner's "51" counted records in `data/programme-images.json`: 57 records,
  of which several are field fallbacks no card reaches.)
- Candidate variant groups found by name at one institution (script diff of
  every field a student sees, `node <scratch>/diff.mjs a b`):
  1. SDU Electronics BSc / BEng (Sønderborg)
  2. SDU Mechanical Engineering BSc / BEng (Sønderborg)
  3. SDU Mechatronics BSc / BEng (Sønderborg)
  4. SDU Software Engineering Sønderborg / Vejle
  5. AU Economics and Business Administration Aarhus / Herning
  6. VIA Software Technology Engineering (Horsens) / – XR (Viborg)
- Record-level differences found (before checking SDU/AU/VIA pages):
  - SDU BSc vs BEng pairs: credential (BSc 180 ECTS 3 yr vs diplomingeniør
    210 ECTS 3.5 yr), quota-1 GPA floor **7.0 vs 5.0**, and DP Course Results
    accepted without supplementary subjects on the BEng only. Subject
    requirements identical, except Mechanical BEng accepts one more combination
    (Geoscience A + Biotechnology A).
  - SDU Software Engineering: identical requirements; campus and emphasis differ.
  - AU EBA: identical subject requirements; Aarhus has a 6.0 quota-1 floor,
    Herning states none; cut-off 2026 9.2 vs 6.9.
  - VIA STE vs XR: identical requirements; campus, specialisation, start month.
- Verified on institution pages (sources in groups.md): SDU BEng = 3½ yrs incl.
  half-year internship, vocational, MSc still open; BSc = research-based first
  3 yrs of the MSc route. SDU quota-1 floors read: BEng Electronics 5.0, BSc 7.0.
  AU Herning = "the same" degree as Aarhus. VIA XR = "Software Technology
  Engineering - specialised in XR".
- All six groups classified MERGE (3 with admission "differs"). Data written:
  `family` blocks on 12 programme records, `separateFrom` in schema,
  `src/lib/families.mjs` (checks + near-duplicate detector) wired into
  `scripts/validate.mjs`; evidence `ev-sdu-beng-vs-bsc` in
  `data/evidence/variants.json`. validate passes; negative test catches a wrong
  `admission`, a wrong axis, and an undeclared near-duplicate.
- AU Herning record conflict (6.0 floor requirement vs selection note "no
  floor"; page states none) left for the conversion agent; in systemic.md.
- Resolver rewritten (`src/lib/programme-imagery.mjs`): one photograph per
  card, cards keyed by family; `src/lib/data.mjs` passes card + primary.
  With current records: 67 cards, 39 photographs, **28 cards short**:
  business 10, computing 11, social sciences 2, engineering field 2, VIA
  Mechanical 1, SEA Multimedia 1, Zealand ATCM 1. Target: 67 distinct.
- Guard `scripts/test-unique-images.mjs` (built stage, in the gate list):
  card uniqueness by SHA-1 of the stored file, site-wide slots (places,
  galleries, cards), official share images per card, built pages and finder /
  planner data, and a no-special-case read-back of families.mjs and the
  resolver. Allowlist `scripts/lib/unique-images-allow.json` (empty). Against the
  pre-fix data it failed with 9 repeat groups, as it should.
- Commons hunts: `hunt.mjs` (search → 16:10 contact sheet) in the session
  scratchpad `variants/`; ~40 sheets, ~800 candidates viewed. Picks reviewed at
  16:10 on `final1.jpg` / `final2.jpg`; PNG field-notes photo checked full frame
  for insignia (none). 32 lines appended to
  `docs/research/programme-images/additions.jsonl` (why + cropNote each), run
  through `scripts/import-programme-images.mjs` → fetch-images → signed.
  Repins (old files deleted first so the fetcher re-downloads): SDU Mechanical
  (NASA T-shirt → Arusha lathes), VIA Climate & Supply (sludge → heat pump),
  field-computing-2 (hackathon → Wocintech 61). SDU Mechanical BEng record
  follows its primary. `focus: "50% 70%"` on field-business-2 (SWOT headings);
  fetch-images keeps `focus` on re-fetch.
- **Result: 73 programmes → 67 cards → 67 distinct photographs, 0 repeats**
  (before: 39 photographs, 34 cards repeating). Contact sheet:
  `contact-sheet.jpg`. Gate: all 33 checks pass (SITE_BASE set), build with
  SITE_BASE unset OK.
- Not done / for Phase B: render merged cards + paths block (design.md), the
  critic's fixes 1/3/5, 720w variant, credits "Used for" with institution.
  MIREA robot-cell candidate kept in reserve (not added).
