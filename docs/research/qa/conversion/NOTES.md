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
