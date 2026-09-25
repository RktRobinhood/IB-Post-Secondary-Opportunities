# Local-level requirements shown in IB terms — working notes

Owner's problem: Danish programme requirements were shown in Danish STX shorthand
("Needs English B · Mathematics B — one of: History B / History of Ideas B / …").
An IB student cannot tell that "English B" there is a *level*, not the IB course,
or what "Mathematics A" means for them.

## Decisions (logged as made)

1. **One translation, in the engine.** The inverse of the Recognition Scheme's
   `subjectEquivalence` (local subject + level → the IB subjects and levels that
   satisfy it) is computed in `src/lib/eligibility.mjs` (`ibTermsFor`,
   `ibTermsPhrase`). The engine already owns the forward direction; putting the
   inverse beside it means the card, the programme page and the planner's
   "why this result" lines are all read off the same rows the engine grades on,
   and the browser gets it for free (eligibility.mjs is copied to dist as-is).
   No mapping is duplicated, and no country is named in the code.
2. **"Or higher" follows the scheme's ranks.** An IB subject/level counts if the
   scheme maps it to the required subject at a level whose rank is >= the
   required rank. So English B is met by English B SL (maps to B) *and* by
   English B HL / any English A (map to A). In IB words the ladder has only two
   rungs, so "or higher" is written "SL or HL".
3. **Phrase shape.** Options with the same set of levels are grouped; courses of
   one family are folded: "Maths HL (AA or AI)", "English B or English A
   (Literature or Lang & Lit), SL or HL", "History SL or HL". The family/course
   words are data: optional `family` and `course` fields added to
   `data/ib-subjects.json` (universal IB vocabulary, no country).
4. **No IB equivalent is said plainly.** A local subject that no IB subject maps
   to renders as "History of Ideas B — no IB equivalent". Where the scheme has a
   reason (`subjectsWithoutEquivalence`, e.g. Social Studies, Geoscience) the
   programme page shows it; in a one-of list the page adds "meet this through
   another option"; on its own (the `all` list) it says the reason, or that the
   scheme publishes no equivalent.
5. **Minimum grades are converted with the single-grade table**: the lowest IB
   grade whose local value is >= the local minimum (02 → IB 3; 4 → IB 4;
   6 → IB 5, because IB 5 converts to 7 and IB 4 only to 4). No minimum → the
   programme page says "No minimum grade is recorded" rather than inventing a
   "pass" (the handbook says a 2 may sit in a Diploma, so "a pass" would be a
   claim we cannot make per subject).
6. **Local form kept, secondary.** Shown small as "Danish requirement: English B
   · Mathematics B · …" in the English names the university's own English page
   uses, with a link to the conversion explanation. The label and the link come
   from the Recognition Scheme record (`display.requirementLabel`,
   `display.explainedAt`), not from code — added to the schema.
7. **Guard markup.** Every rendered requirement block carries `data-req`; inside
   it IB text sits in `.req-ib`, untranslatable items in `.req-none`, the local
   form in `.req-local`. `scripts/test-requirement-translation.mjs` strips those
   and fails if any local "Subject Level" is left bare, and checks each local
   requirement's IB phrase is actually on the page.
8. **A bug the guard found: a second "one of" overwrote the first.**
   `denormalise` in `src/lib/canonical.mjs` kept one `oneOf`, so seven
   programmes with two subject-combination rules (VIA Mechanical and Climate &
   Supply Engineering, Absalon Biotechnology, BAAA Multimedia Design, Zealand
   Architectural Technology, Erasmus EBE, Twente Advanced Technology) showed only
   the second set — e.g. VIA Mechanical never showed "Physics B or Geoscience A".
   The engine graded them correctly; only the pages dropped it. The projection
   now carries `oneOfSets` (all of them; `oneOf` stays the first for old
   readers), and cards, programme pages and the finder's "No Maths A" filter
   read every set.
9. **Planner sentences say "at B level".** "It counts as English B" in a "why
   this result" line was the same ambiguity again, so the engine now writes
   "counts as English at B level", leads with the IB phrase ("This needs Maths
   HL (AA or AI), at least a 4") and ends with "(Danish requirement:
   Mathematics A, minimum 4.)". Test wording in `scripts/test-eligibility.mjs`
   updated; one check split in two, so the README scenario count went 103 → 104
   (release-check reads it).
10. **Conversion page.** New first section `#levels`: the one-line "A/B/C are
   levels, not grades; English B there is not the IB course" explanation, then
   a table of every subject+level a programme on the site asks for (plus the
   handbook's other levels of those subjects), each translated by the same
   `ibTermsFor`, with how many programmes ask for it. The handbook's own table
   stays below, renamed "The handbook's subject table, in full".
11. **Local grade shown as the record holds it** ("minimum 2", not "02"): the
   record stores the number; formatting a Danish 02 would be a country branch.
   Open question for a critic.

## Round 0

Screenshots in `round-0/` taken with `shoot.mjs` against a snapshot of dist
(built with SITE_BASE unset). Gate: `$env:SITE_BASE='/IB-Post-Secondary-Opportunities'; node scripts/qa.mjs`
→ all 30 checks pass, including the new `ib-terms`
(`scripts/test-requirement-translation.mjs`: 57 programmes, 740 checks).

Open for a critic:
- "no IB equivalent" for Social Studies B is strictly "no *fixed* equivalent"
  (Global Politics is decided case by case); the card says the short form, the
  programme page and the conversion table give the reason.
- Cards for programmes with long one-of lists (AU Economics) run to ~6 lines.

## Round 0b — shorter cards (coordinator's pass)

12. **Collapse by area, from the data.** `data/ib-subjects.json` gains an
    optional `area` ("English" on English A Literature, English A Lang & Lit and
    English B; "Maths" on AA and AI; "Danish" on the three Danishes). When a rule
    accepts *every* catalogue subject in an area at the same levels,
    `ibTermsPhrase` names the area: both levels → "Any IB English" / "Any IB
    Maths"; one level → "Maths HL (AA or AI)". No subject name is in the code —
    the collapse is "accepted set == catalogue members of that area". Levels
    are now written "History (SL or HL)", "Biology HL". Caveat: "Any IB
    English" means any English in our catalogue — it has no English ab initio.
13. **Cards list only options with an IB route**; the rest become a muted
    "+ 3 options with no IB route" (named, with the reasons, on the programme
    page). A one-of with a single IB option drops the "one of:" label only when
    nothing else is hidden.
14. **Danish grades written the Danish way.** The Recognition Scheme's
    `gradeScale` gains optional `grades: [{value, label}]` (schema updated), so
    02 prints as "02" and 00 as "00" — card small line, programme page,
    planner. A value not on the scale (CBS's "6") prints as the number.
15. **Planner "met" lines lead with the IB requirement**: "Needs Any IB English:
    your English B SL counts as English at B level. (Danish requirement:
    English B.)" — "Your English B SL meets Any IB English" read badly.

Result: a typical card is "Needs Any IB English · Maths HL (AA or AI)" (one
line); the longest Aarhus cards (Economics, 2 IB options + 3 hidden) take 3–4
lines at desktop width, Cognitive Science 2 lines plus the muted note.
Gate: all 30 checks pass. Screenshots in `round-0b/`.

## Round 1 — critic fixes (critique-round-1.md, scored 6/10)

Verified before building (25 Sep 2026):

- **Hurtig start 1.08 does not apply.** The university admission order in force,
  Adgangsbekendtgørelsen BEK nr 288 af 17/02/2026
  (https://www.retsinformation.dk/eli/lta/2026/288, read in a browser because
  the page needs JavaScript), contains no "1,08", "hurtig" or "bonus". §17 stk. 2
  defines the quota 1 quotient as "eksamensgennemsnittet ifølge beviset for den
  adgangsgivende eksamen … eller eksamensgennemsnittet omregnet til
  7-trins-skalaen". So a cut-off converts to IB points with the Agency's table
  and nothing else. ufsn.dk's old "bonus-for-hurtig-studiestart" page is a 404;
  ug.dk's current kvote 1 article describes no bonus. Not checked: the separate
  order for academy/professional bachelor programmes (erhvervsakademi /
  professionshøjskole) — the page wording says "universities' admission order".
- **AU** (bachelor.au.dk/en/international-applicants/moreinfo/international-baccalaureate-ib,
  revised 21.08.2026): GP HL "Recognised as Social Science B"; GP SL
  "Recognised as Social Science B in combination with Economics SL/HL". Nothing
  on History of Ideas / Contemporary History / Philosophy.
- **ITU**: Data Science — English B avg ≥ 6 "(there is no grade requirement if
  you have passed English corresponding to the Danish A-level)"; Maths A ≥ 6 has
  no waiver. GBI — Maths B and English B avg ≥ 6, each with the same A-level
  waiver.
- **CBS** application-and-admission page: "If you have taken a subject at level A
  and passed it, this fulfils any grade requirement at B-level for that
  subject." So CBS's English B ≥ 6.0 and Maths B ≥ 6.0 are waived at A too, and
  CBS's English A language requirement always implies it: in IB terms CBS
  English is one line, "English A (any) or English B HL", no grade. The CBS
  Social Studies table (BM, Economics, GP, History SL/HL; Geography HL;
  Anthropology HL) could NOT be re-read — the page is ~618k characters and the
  fetcher stops at ~140k. It is encoded from the record taken 22 Sep
  (data/dk/cbs.json ibNotes, evidence ev-cbs-dk-jtk0jr) and flagged as such.

Decisions, round 1:

16. **Institution routes are data.** `ibEquivalences` on the canonical
    Institution record (schema: institution.schema.json): `{levelScale, subject,
    level, accepts: [[{ibSubject, ibLevel}]], note, evidence}`. AU: GP HL, or GP
    SL with Economics → Social Studies B (ev-bachelor-au-dk-1qq5514). CBS: BM,
    Economics, GP, History SL/HL; Geography HL; Anthropology HL → Social Studies
    B (ev-cbs-dk-jtk0jr, flagged in the row's note as not re-read). The engine
    indexes them (`buildSubjectIndex({ …, institutions })`), `ibTermsFor(rule,
    index, institutionId)` adds them to the phrase and clears "no equivalent",
    and `assess` reads `opportunity.institution` — so a GP HL student meets AU
    Social Studies B, a GP SL student alone does not, and at an institution
    with no route GP HL is still Needs review. The planner receives the same
    records. The scheme's Social Studies / Global Politics sentences now name
    AU, CBS and Copenhagen.
17. **Minimum grade waived at a level** — `minGradeWaivedAtLevel` on the
    requirement (opportunity.schema.json). ITU Data Science English B; ITU GBI
    Maths B and English B; every CBS B-level minimum (CBS: "a subject at level
    A … fulfils any grade requirement at B-level"). The engine meets a rule at
    or above the waiver level with any grade; the wording names the graded
    subset: "Any IB English: at least a 5 in English B SL, any grade
    otherwise". Scenario added: English B HL at 4 meets it, English B SL at 4
    does not.
18. **Same subject twice → one line.** CBS English A (language) + English B
    ≥ 6 fold into "English A (Literature or Lang & Lit), SL or HL; or English B
    HL" with no grade, because the B minimum is waived at A — the critic's
    suggested "at least a 5" would have been wrong by CBS's own rule. The
    published line keeps both.
19. **Non-subject options** ("An accepted English test instead …") are
    projected (`otherOf` in canonical.mjs) and shown as written in `.req-other`.
    On a card, an option that asks for everything a smaller option asks for is
    dropped (VIA DTB: English B / English C + test = "Any IB English"), an
    option whose IB routes a sibling already accepts is dropped (Contemporary
    History B = History HL, beside History SL/HL), and a whole "one of" already
    settled by a subject required outright is left off (BAAA's English B-or-test
    after English C). Programme pages keep every option, with the published
    forms merged ("History B or Contemporary History B").
20. **Hidden options note** is "(1 other option needs a Danish-school
    subject)" — not "+ 3 …", because "+" on that line means "together with"
    (AAU Energy: "Physics + Chemistry + 2 …" read as one combination). The noun
    is data: `display.localOnlyNoun`.
21. **Cut-offs in IB points**: `ibPointsFor(value, gradeScale, index)` — the
    lowest total whose converted average reaches the cut-off, read from the
    scheme whose `gradeScale.id` matches the cut-off's `scale`. Shown on
    institution cards ("Last cut-off 10.7 · 40 IB points"), the programme
    glance, the programme fine print (linked to `display.averageExplainedAt`),
    the finder and the planner. The conversion page's average section now says
    there is no 1.08 bonus, citing BEK 288/2026 § 17.
22. **Contemporary History**: History HL maps to Contemporary History A too
    (handbook History A row: "historie / historie med samfundskundskab /
    samtidshistorie"), so Contemporary History B reads "History HL".
23. **Clarity**: "No minimum grade is recorded" said once above the list; the
    planner names the combination that was met ("One of the 4 accepted options
    is met. Needs History (SL or HL): your History HL …"); the conversion
    table's caption is now a paragraph (it wrapped one word per line on a
    phone); "Any IB English … not English ab initio" added; the levels table
    names AU's and CBS's own Social Studies routes under "No national IB
    equivalent".
24. **Guard** (`test-requirement-translation.mjs`) now reads what to expect
    from `requirementModel` (exported by components.mjs, used by the card and
    the page) and fails on an empty published line, a line ending on a
    separator, and one option listed twice in a line or list — with planted
    samples of the BAAA and VIA faults to prove it sees them.

Round 1 result: gate 31/31 (ib-terms 741 checks, eligibility 118 scenarios;
README count updated 104 → 118). Screenshots in `round-1/`.

## Round 2 — critic fixes (critique-round-2.md, scored 6/10)

Verified on the universities' own pages, 25 Sep 2026:

- **CBS test route** (application-and-admission, read in a browser, sections
  expanded): "You can only take a language test to fulfil the language
  requirement English level A if you have already passed English level B with
  a minimum grade of 6.0." IELTS Academic "an overall score of at least 7.0 and
  a minimum score of 6.0 for each of the four different sections"; TOEFL iBT
  on/after 21 Jan 2026 "at least 5 and … 4,5 in each"; results "no later than
  5 July at 12.00"; test date ≤ 2 years old on 5 July. Cambridge C1 185 / C2
  200 meet both English B 6.0 and English A. The page still shows no IB subject
  table (the Social Studies list stays flagged "not re-read").
- **RUC Social Sciences** (programme page + ruc.dk/en/minimum-grade-requirements):
  "One of the following: 6.0 … from your entry qualification; 4.0 … in the
  subjects English and Mathematics"; "If you do not meet the grade
  requirements, you will receive a rejection letter, regardless of whether
  there are fewer applicants than the number of study places." Quota 1 needs
  the 6.0; quota 2 accepts either. Global Humanities and Natural Sciences have
  no such rule.
- **AU**: 6.0 "to be assessed in quota 1" on Cognitive Science, CS, Data
  Science, ITPD, EBA Aarhus; CS/DS/ITPD also "a minimum GPA of 6.0 in
  Mathematics A"; quota 2 "except the GPA requirement". EBA Herning: the page
  (Danish text) says "Karakterkrav på mindst 6,0 i kvote 1" — the record's
  "no floor stated" was wrong, so Herning gets the floor too.
- **SDU**: every English-taught bachelor says "To be considered for a study
  place in quota 1, your GPA must be equivalent to X or higher"; X = 7.0,
  except the three BEng (Electronics, Mechanical, Mechatronics) = 5.0, and EBA
  Sønderborg = 7.0 from 2027 (6.0 until 2026). Quota 2 is uniTEST, no floor.
- **DTU (critic's open question)**: DTU's quotas page: quota 1 is for those who
  "hold a Danish upper secondary exam, an IB diploma, or an upper secondary exam
  from a Nordic or EU/EEA country" — ranked on GPA; "15 March for Quota 2 (and
  all applicants with an international exam)" is a deadline, not a quota. So
  DTU's "40 IB points" cut-off comparison is the right one for an IB student.

Decisions:

25. **`minimum-average`** requirement kind (schema): `minAverage`,
    `gradeScale`, optional `averageOf` (subjects on a local scale) and optional
    `quota`. Unscoped it is graded like any rule (RUC: a `subject-combination`
    of "6.0 overall" / "4.0 across English and Mathematics"). Scoped to a quota
    it is evaluated into `assessment.floors` and raised as a caveat, never a
    gap — below AU's 6.0 you are still eligible in quota 2. Data: AU ×6 (+ Maths
    A 6.0 on 3), SDU ×15, RUC Social Sciences.
26. **Floors in IB terms** (`floorTerms`): overall → lowest IB total that
    converts to it ("at least 28 IB points"; SDU 7.0 → 31; BEng 5.0 → 25),
    one subject → lowest IB grade in that subject's IB terms ("a 5 in Maths HL
    (AA or AI)"), several → "English and Mathematics averaging 4.0 once
    converted (a 4 in each is enough)". Shown on the card under the IB line,
    as its own card on the programme page ("To be ranked in quota 1"), in the
    glance where the cut-off is not a number (SDU "All qualified applicants
    accepted"), and in the planner as a "!" line: "Quota 1: Needs at least 28
    IB points: your 26 points convert to 5.2 … Below it you can still be
    admitted in the other quota". "No minimum grade is recorded" is replaced
    where a floor exists.
27. **CBS English**: the English A language requirement is now a one-of —
    English A, or "An English test (IELTS Academic 7.0 or TOEFL iBT 5) on top
    of English B at 6.0" (full scores in the item's note) — on all six CBS
    programmes. Engine: a combination whose closest alternative is only a
    `test` returns an actionable gap naming it, so English B SL 5 is
    "Possible with action … The other published way in: An English test …";
    English B SL 4 does not meet (English B 6.0 fails first). 4 scenarios.
28. **Markdown**: `md()` renders site-relative links; the ib-terms guard
    scans every built page's visible text for "](/" or "](http".
29. **Below the Diploma minimum**: `diplomaMinimumPoints: 24` in
    data/ib-subjects.json (IB vocabulary). A cut-off or floor at or below it
    reads "any IB Diploma" (AAU Chemical Eng 3.3: "Last cut-off: any IB
    Diploma (Danish 3.3)").
30. **Requirements published in IB terms** get no "Danish requirement" line
    and are phrased like the rest (SL counts HL too); a one-of of IB subjects
    collapses — Zealand's "Mathematics: AI SL / AA SL" is "Any IB Maths".
31. **Clarity**: glance leads with "42 IB points", "Danish 11.1" second; the
    planner's Danish-level chips sit in a collapsed "What your subjects count as
    on the Danish scale"; the conversion page's Global Politics case now agrees
    with the levels table; § 17 stk. 2's EU/EEA scope and § 18 (non-EU/EEA
    exam → quota 2) stated under the average table; the levels table shows
    only levels programmes ask for; Danish A at SL carries a caution (scheme
    row `caution`: "formally Danish B … confirm with the university"), shown
    on the programme page and the conversion table (ITU GBI). A "one of" left
    with a single option is listed with the requirements; one already settled
    by a subject required outright is a small note ("already met by what is
    listed above") — BAAA, VIA DTB.
32. **Not done here (another agent's files)**: the finder filter label "No
    Mathematics A" → "No Maths HL needed" lives in src/pages/explorer.mjs /
    src/assets/js/explorer.js, which the redesign agent owns. The filter's
    logic (`needsMathsA`) reads `entry.oneOfSets`, which is unchanged.
33. **Text-wall budget**: the CBS card line ran to 91–104 words (limit 90), so
    the test item carries a `shortLabel` for cards ("an English test (IELTS
    7.0) with English B at 5+"; the page shows the full label), and a family
    whose every catalogue course is accepted is written as the family alone
    ("English A (SL or HL)", not "English A (Literature or Lang & Lit), SL or
    HL") — `index.families`. The repeated floor sentences were cut under 12
    words.

Round 2 result: every conversion check passes — ib-terms (738 checks, now also
scanning every built page for unrendered Markdown links), eligibility (131
scenarios; README updated 118 → 131), validate, conversion, text-walls,
release. The last gate run failed only `controls`
(src/assets/css/site.css:2294 `.drawer … a.chip` and :2354 `.region-nav .chip`
restate 44px) — another agent's drawer/region-nav work, not this change.
Earlier runs in the same hour also failed `map` (globe close-map reduced
motion), `destinations` ("/countries/" crumbs) and `build` (destinations.mjs
export mid-edit) while other agents were working; each cleared without any
change here. Screenshots in `round-2/`.

Still long: CBS cards are ~9 lines — five requirement lines, each with a real
choice in it. Left for a design decision rather than hidden.
