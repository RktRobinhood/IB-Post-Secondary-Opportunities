# Conversion critique, round 5 (final round)

Critics:
1. **Admissions counsellor.** Would I repeat this to a student in a meeting?
2. **Art director.** Planner and programme pages, on a phone as well as on
   desktop.

I did not do this work. Written 26 September 2026.

What I judged:
- `round-5/fixes.md`, `planner-verdicts.txt` (all nine profiles), and the
  screenshots `10d`, `10c`, `14b`, `14`, `15`, `15c`, `17b`, `18`, `19`, `20`,
  `21`, `22`, `23`, `24`, `26`, `13f`, `p1-how-to-close-a-gap`,
  `p6-how-to-close-a-gap` and `p6-count`.
- Records `dk-aau-applied-industrial-electronics`,
  `dk-itu-global-business-informatics` and `dk-sea-computer-science-ap`, plus
  institutions `dk-itu`, `dk-au`, `dk-sdu` and `dk-cbs`, `data/recognition/dk.json`
  and the Danish Evidence records.
- `src/lib/eligibility.mjs` (`levelRaiseFor`, `planSteps`, `MAX_RAISES`).
- `node scripts/test-eligibility.mjs`: all 202 scenarios pass.

I took fresh phone shots of the planner in its **default state**, with cards
collapsed, as a student first sees it. I used the worktree's `dist` behind a
read-only static server on port 4451, and stopped it when I had finished. The
shots are in the scratchpad `critic-planner/`: `p1-phone-0…3.jpg` and
`p7-phone-cards.jpg`, cropped to `p7-sdu-phone-crop.jpg`.

**SCORE: 6 / 10.**

## Verdict

This round fixed real things, and fixed them well:
- ITU's Danish action is now ITU's own Danish sentence.
- A missing Physics is named (`10d`).
- CBS's Cambridge route turns P5 into a correct "Possible with action" on all six
  programmes.
- A Course Results candidate's six grades are added up (P6 at SEA shows "your 6
  grades add up to 33").
- RUC below its floor is "Does not currently meet", and the rejection-letter
  sentence is quoted.
- The "How to close a gap" box removes most of the repetition.

I checked the sampled verdicts against the records' quotations: AU, SDU, CBS,
the national rule, RUC and the Agency's Course Results rule. The facts are
right.

The bar for this round is that one wrong rule, or one generous verdict the
sources do not support, fails it. I found one wrong rule and two generous
verdicts. Each takes a few minutes to reproduce from the committed verdicts:

1. **Wrong rule, shown to every student from outside the EU/EEA.** The student
   is told they can take one subject after 5 July at SDU. Their own card says
   they cannot.
   - P7 at SDU Electronics (both), EIB, ITE and Mechatronics (both) shows two
     gap lines. Each reads: "SDU accepts supplementary courses. **From outside
     the EU/EEA you must have finished them before 5 July.**"
   - The "To do" line under the same badge reads: "2 supplementary courses …
     **Only one subject can be taken as summer supplementation after 5 July**,
     so any other has to be passed by 5 July."
   - On a phone the gap lines are collapsed by default. The "To do" line is the
     only guidance the student sees, and it is the wrong one
     (`p7-sdu-phone-crop.jpg`).
   - The cause is in the code. `levelRaiseFor` builds the per-group timing, but
     `multiple` is always SDU's fallback to the national sentence, whatever the
     group.
   - The round-4 guard ("P7 at SDU says 5 July and not 31 August") checks the
     gap line and not the summary.
2. **Generous verdict: P6 (Course Results) at SEA Computer Science and SEA
   Multimedia Design is green "Meets published requirements".**
   - SEA requires every holder of a foreign entrance examination to document
     English with a test. It exempts "an International Baccalaureate exam".
     That quotation is in the record's own note.
   - `fixes.md` lists "whether its IB exemption from the English test covers
     Course Results" under **Needs a source**.
   - The record does not model the requirement, so the question the implementer
     left open is shown to the student as a green tick. Silence has become "not
     required".
   - DTU, in the same catalogue, handles exactly this case correctly: "? Documented
     English proficiency — the exemption is for full IB Diploma holders".
3. **Generous verdict: P9 (Danish A Literature SL) at ITU GBI is green
   "Meets".**
   - The card's own line reads "✓ … counts as Danish at A level. At SL the
     handbook formally counts this as Danish B; universities normally accept it
     … Confirm with the university before you rely on it" (`18`).
   - `DK_AUDIT_NATIONAL.md` F10 gives the rule owner's words: accepted "til de
     fleste uddannelser", which means *most* programmes, not this one.
   - A rule that says "confirm before you rely on it" is, by the legend's own
     words, "a rule a person must judge". That is Needs review.
   - Green here resolves the formal rule to the permissive practice.

There is also a planning fault. It is not a wrong rule, but I would correct it
in a meeting every time:

4. **"Possible with action" means "possible for 2027" only for part of the
   two-course plans, and the card does not say which.**
   - The planner asks for a *predicted* total and "which award **will** you
     finish with". It is talking to a current DP2 student.
   - The repo's own notes say GSK is for someone who "already holds a qualifying
     examination". IB results arrive on 6 July (`DK_AUDIT_NATIONAL.md` F11).
   - At every programme that follows the national rule, the second course
     "has to be passed by 5 July". For this student that means a course taken
     alongside the IB (hf-enkeltfag, if VUC admits them) or applying in 2028.
   - This is 60 cards across P1, P2, P3, P7, P8 and P9.
   - The Course Results route to a university bachelor has the same problem on
     31 of P6's cards: two hf-enkeltfag raises, one to A, or a retake. That is a
     year of extra schooling, which is exactly what the comment on `MAX_RAISES`
     says "Possible with action" must never stand for. The route was demoted
     for the Dutch colloquium doctum (age 21), but not for this.
   - Two cases are not credible as a summer plan:
     - P9 at RUC Global Humanities: "2 supplementary courses: **Second Foreign
       Language at B level** and History at B level", from nothing;
     - P1 or P7 at ITU GBI: Danish A from nothing. ITU's own overview page,
       quoted in `dk-itu.json` notes, says "only the programme in Data Science
       is open to international students".

     The national source the planner quotes says one subject "på ét niveau".
     The repo does not establish whether a subject the student never took,
     raised to B or to A, is one course or more. That is a "we do not know",
     but the card counts it as one course.

## The two-course cap (`MAX_RAISES = 2`)

A product rule is acceptable when two things hold:
- (a) it only ever moves a verdict toward the cautious side;
- (b) it is shown as the site's own line wherever it changes a verdict.

It fails both at the moment:
- **(a)** The cap is cautious above two. At two it is permissive, because it
  does not ask whether both courses fit after results for this student's
  group:
  - national rule: one;
  - AU: two;
  - SDU for EU applicants: one (national fallback);
  - SDU for non-EU applicants: none;
  - CBS: none;
  - ITU without fee exemption: none.

  The publisher's `multiple` sentence is printed, but the outcome ignores it.
- **(b)** The legend says "at most two supplementary courses" in the same
  sentence as published definitions, without saying it is the site's limit.
  Where the cap bites, nothing explains it. P1 at DTU General Engineering shows
  three ✗ lines, each with "To close it:", then "Does not currently meet". The
  legend defines that outcome as "a gap with no recorded step", which is false
  for this card.

Keep the cap, and make it honest:
- On the card: "3 courses — more than one intake allows. This is our limit,
  not DTU's."
- In the legend: "…at most two supplementary courses (our limit), and no more
  than the university allows after your results".

## Counsellor checks, sampled

| Check | Source in repo | Result |
|---|---|---|
| AAU AIE: Maths A min 4, Physics B or Geoscience A | record `officialRequirementsText` | ✓ |
| Maths AI SL → Maths B; Physics SL → B; Danish A SL → A (with caution) | `recognition/dk.json`; F10 audit | ✓ / ✗ (P9, verdict 3) |
| National summer supplementation: one subject | `levelRaise.source` quotes ug.dk | ✓ fact; ✗ applied to non-EU SDU (verdict 1) |
| AU: any number before 5 July, two after, documented by 5 Sept | NOTES round 3 | ✓. Evidence cites `bachelor.au.dk/en`, a landing page that does not contain it |
| SDU: EU conditional to 31 Aug; non-EU before 5 July | NOTES round 3 / critique 4 | ✓ on the gap line. Evidence is SDU's bachelor list page |
| CBS Cambridge C1 185 / C2 200 "fulfil both" | critique 4, NOTES round 2 | ✓ (P5 "One step closes both") |
| CBS: no summer supplementation | NOTES round 3 (ug.dk) | ✓ in data, cited to a CBS page |
| ITU Danish A sentence | critique 4 only; no Evidence record | ◐ disclosed in `meta.notes` |
| RUC rejection letter | record `officialWording` | ✓ |
| Course Results: 18 pts, grade 3, three at HL, two raises | `ev-ufsn-ib-course-results` excerpt | ✓ fact; ✗ as a 2027 "possible" (item 4) |
| P6 at SEA: grades add up to 33 | profile | ✓ arithmetic; ✗ English-test unknown (verdict 2) |
| P8 at SDU CS / AU CS: "Possible with action" and below the quota 1 floor | engine | ◐ The quota 2 route and its **15 March** deadline are not named on these cards. `Your way in` appears only on "Quota 2 only" cards, but these students need the same date |

**Provenance.** The AU, SDU, CBS and ITU rules that decide verdicts rest on
quotations in markdown notes. They are cited to Evidence records whose excerpts
do not contain them, and are mostly landing pages checked for "3/12 content
words". This is acceptable for one more round only if it is logged, and it is
logged. A student who taps "Check the official page" will not find the
sentence.

## Art direction

**What works**
- The "Quota 2 only" card.
- Programme pages on a phone. `22`: "Not open with IB: 3 Danish-only options …
  The options above are the way in."
- AU card grid (`26`): one "Needs" line, "+1 more".
- Glance "Admission: Limited places" (`24`).
- "You: 27 · any IB Diploma clears it" (`13f`).
- The "How to close a gap" box, as an idea.

**What fails, phone first**
1. **The legend and "What this cannot tell you" sit under all the results.**
   On a phone that is about 26,000 px down, below roughly 70 cards. A student
   reads five badges before they can find what the badges mean. "Eligibility is
   not selection" is the last thing on the page.
2. **The count line breaks numbers away from their labels at 390 px:** "…
   requirements · **27** / possible with action · **5** need review · **18** /
   not currently met" (`p1-phone-1.jpg`). Keep each number and its label on
   one line.
3. **Every card carries "Evidence: not yet checked by a person, checked
   2026-09-23."** That reads as "not checked, checked". It is the most-read
   line on the site after the badge.
4. **The faded "not met" card now fades the verdict.** In `17b` "Does not
   currently meet" is the least legible text on the card. Dim the picture, not
   the badge.
5. **Gap lines are paragraphs.**
   - CBS for P5 on a phone is about 900 px of reasons (`14b`). The first ✗
     offers "an English test on top of English B at 5", a route this student
     cannot use, and the second ✗ then gives the Cambridge route.
   - "The closest needs: Needs at least 28" and "The closest needs: This needs
     History" stutter.
   - "Take the level as a Danish supplementary course" is used even when the
     student has no level to take.
   - Target: one line per ✗, of 15 words or fewer, with the rest one tap down.
6. **Two markers per line.** Every reason has a hollow list bullet and a ✓, ✗
   or ? glyph. Drop the bullet.
7. **"How to close a gap: said once here for the results below that share it"**
   is a sentence about the page, not a heading. Use "How to close a gap".

## The three changes that would raise the score most

1. **Make the "To do" line and `planSteps` depend on the applicant group and on
   timing. This fixes verdict 1 and item 4.**
   - Give each `levelRaise` (and each group in `groups[]`) an `afterResults`
     count:
     - national 1;
     - AU 2;
     - SDU EU 1 (national fallback);
     - SDU non-EU 0;
     - CBS 0;
     - ITU without fee exemption 0.
   - Choose `multiple` per group, in the same way `levelRaiseFor` chooses the
     timing. SDU non-EU then reads "From outside the EU/EEA every course must be
     passed by 5 July".
   - Outcome: Possible with action only when steps ≤ `afterResults`.
   - Otherwise show Does not currently meet with the line "For 2027: n of these
     have to be passed before your results — in practice during DP2 or by
     applying for 2028". The plan is still listed.
   - Treat the Course Results university route the same way (it is not a 2027
     action).
   - Where the student holds **no** level of a subject that has no summer
     course on record (Danish A, a second foreign language), the step is not
     counted as one course. Use Needs review: "whether this can be done in one
     course is not recorded".
   - For P1/P7 at ITU GBI, quote ITU's own sentence: "only the programme in
     Data Science is open to international students".
   - Guards to add:
     - P7 at SDU Electronics: the summary never says "after 5 July";
     - P1 at AAU AIE is not Possible for 2027 without a course before results;
     - no `actionSummary` contradicts its own gap lines about 5 July.
   - Label the cap in the legend as "our limit".
   - Files: `data/institutions/dk-{sdu,au,cbs,itu}.json`,
     `data/recognition/dk.json`, `src/lib/eligibility.mjs`
     (`levelRaiseFor`, `planSteps`), `scripts/test-eligibility.mjs`,
     `src/pages/planner.mjs`.
2. **No green where the record holds an open question. This fixes verdicts 2
   and 3.**
   - SEA CS and SEA MMD: add the English-documentation rule as a requirement,
     as DTU has it:
     - a Diploma holder is exempt (quoted);
     - a Course Results holder gets "? SEA exempts 'an International
       Baccalaureate exam'; whether that includes Course Results is not
       published — ask SEA".
   - Danish A Literature SL, and Language and Literature SL, against a Danish A
     rule: Needs review, keeping the caution text. The only exception is an
     institution whose own record confirms SL. Never a ✓ followed by "formally
     B".
   - Add a guard: no Meets card may contain "Confirm with" or "formally".
     Every "Needs a source" item in `fixes.md` must map to a "?" on the
     profiles it affects.
3. **Put the phone reading order right.**
   - Move "What the four outcomes mean" and "What this cannot tell you" up. They
     become one collapsed line under the count ("What these mean ▸"), and the
     "How to close a gap" box is collapsed by default.
   - Keep each number and its label together (`white-space:nowrap` on each
     `<b>n</b> label` pair).
   - Change the evidence line to "Source read 23 Sep 2026 · not yet reviewed by
     a person".
   - Undim the badge on "not met" cards.
   - Cap each ✗ at one short lead sentence ("Missing: Physics (SL or HL) — a
     supplementary course, see above"), with the full text one tap down.
   - Drop the list bullet next to the glyph.
   - On "Possible with action" cards below a quota 1 floor (P8 at SDU CS and AU
     CS), add the "Your way in" line with the 15 March date. It already exists
     on "Quota 2 only" cards.

Fixes 1 and 2 are small data and engine changes with clear guards. Once they
are in, every verdict I sampled would be one I could repeat to a student, and I
would give it an 8. Fix 3 is what makes the planner usable on a phone rather
than merely correct.
