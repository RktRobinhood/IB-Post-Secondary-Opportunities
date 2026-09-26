# Verification after round 5 (issue #42)

Critic: **admissions counsellor**, with an art director's eye on the phone view.
I did not build this and did not score earlier rounds. Written 26 September 2026.

What I did:
- `node scripts/test-eligibility.mjs` in `/home/user/ibp-main`: **all 232 scenarios pass**.
- Copied the checkout (no `dist`, no `node_modules`) to the scratchpad `critic42v/`,
  built it, and re-ran the nine round-4 profiles through the engine against the
  built planner data. My output is **byte-identical** to the committed
  `round-5/after-fixes/planner-verdicts.txt`, so that file shows the current code.
- Checked 50 verdicts across all nine profiles against the records
  (`data/opportunities/dk-*`, `data/institutions/dk-{au,sdu,cbs,itu}`,
  `data/recognition/dk.json`), the Course Results Evidence excerpt, `NOTES.md`
  rounds 2–3 and `DK_AUDIT_NATIONAL.md` F10/F14.
- Served the build on port 4481 and shot a 390 px phone with the scratchpad
  Chrome. Shots are in the scratchpad `critic42v/shots/`:
  - `p7-default-0…4` shows the default state from the count down;
  - `p7-sdu-closed-*`, `p1-cards-*`, `p5-cards-*` and `p8-cards-*` are collapsed cards;
  - `p9-open-*` and `p6-sea-open-*` have "Why this result" open;
  - `p1-legend-*` has both disclosures open.

  I stopped the server by its PID when I had finished.
- Synthetic check: the P9 profile with Danish A Language and Literature (HL, then SL) in
  place of Literature SL.

**SCORE: 7 / 10.**

## 1. The three round-5 failures

| Round-5 failure | Now | Fixed? |
|---|---|---|
| Non-EU at SDU told one course may come "after 5 July" | P7 at SDU CS, Electronics (both), EIB, ITE, Mechanical, Mechatronics: "Does not currently meet". Collapsed card: "For 2027: … has to be passed before your IB results arrive … From outside the EU/EEA every course must be passed by 5 July." No line on any SDU card mentions "after 5 July" (`p7-sdu-closed-1.jpg`). This matches SDU's quotation. | **Yes** |
| SEA "Meets" for a Course Results student | P6 at SEA CS and SEA MMD: "Needs review" with "? English documented with a test … whether that includes DP Course Results is not published". A Diploma holder (P8 at SEA MMD) still meets it (`p6-sea-open-1.jpg`). | **Yes** in the planner. The SEA programme pages do not carry it (see change 5). |
| ITU GBI "Meets" for Danish A Literature SL | P9 at ITU GBI: "Needs review"; Danish A HL still meets. | **Yes** as a verdict. The line the student sees on a phone now leads with the permissive claim (see change 4). |

## 2. Did the fixes add a wrong rule or a generous verdict?

The bar is the same as round 5: one wrong rule, or one verdict greener than the
sources allow, keeps this below 8. I found two generous classes and one new
wrong statement.

### A. "Possible with action" depends on a permission nobody has recorded (7 cards)

The national fallback now carries `afterResults: 1`. Its own text says the course
can come after 5 July only "**where the programme accepts it**". The quotation
behind it (ug.dk) has CBS and KU refusing summer supplementation, so it is decided
programme by programme.

No record in the repo says that VIA, AAU or Absalon accept it. I grepped
`data/` and `docs/` for "sommersupp" and "summer supplementation": the only
institution records are AU, SDU, ITU and CBS. So the one course after the
results, on which "possible for 2027" rests, is an unknown, and the tool shows it
as a yes:
- P1, P5 and P7 at VIA Global Business Engineering;
- P2 at AAU Applied Industrial Electronics, Absalon Robot Systems, and VIA
  Software Technology Engineering (both).

The legend now makes this worse. It defines Possible as "supplementary courses no
more than the university lets you finish after your results". For these seven,
the university has not been recorded as letting you do anything. I accept that
the round-5 critic proposed "national 1". Taken as written, though, the national
sentence is conditional, and a condition nobody has checked is silence. Silence
is not a yes.

### B. An open question the fix-writer listed, shown as "possible" (P7, 4 cards)

`fixes.md` › "Still needs a source" says whether AU's "two after 5 July", and the
national one, apply to applicants from outside the EU/EEA is not established. It
adds: "P7 is still 'Possible' at AU CS, AU DS, AU ITPD and VIA GBE."

SDU's own page is the precedent that such a restriction exists. The round-5
critic's rule was that every "Needs a source" item maps to a "?" on the profiles
it affects. This one does not.

### C. A new line that is wrong and hides the step (12 cards)

The fix added "Below the quota 1 floor, your way in is quota 2: … documented by
15 March" to non-"Quota 2 only" cards with an unmet floor (`planner.js`
around line 348). It fires on the Maths A 6.0 floor when the student has **no
Maths A yet**. That covers P1, P2, P3, P7 and P9 at AU CS, DS and ITPD.

In `p1-cards-0.jpg`, P1 has 34 points, 6 above the floor. Their collapsed "Possible
with action" card shows one line of guidance, and it says their way in is quota 2.
It does not name the Maths A course that is the actual step. No record says this.
The floor is "unmet" only because the grade does not exist yet, and whether AU
applies its 6.0 floor to a course passed after 5 July is not recorded.

For P8 (24 points, below the 28 total floor) the line is right, and that was
its purpose.

### What I checked and would repeat to a student

I would repeat 38 of the 50 verdicts I checked as they stand. Among them:
- **P1:** AU CS (the verdict; the card line is item C), CBS ×6 through the test
  route (English B SL 5 → 7 ≥ 6, results by 5 July), SDU CS/AI/SE (EU, 31 August),
  ITU DS (fee-exempt, pass by 1 September), Maastricht DSAI (deficiency route,
  EU date), and AAU AIE "Does not currently meet" (2 courses against the
  national 1; Physics from nothing).
- **P2:** SDU Electronics BEng, and DTU "Does not currently meet".
- **P3:** AU Cognitive Science and CBS IBP meet under the universities' own
  Global Politics rules. RUC IBSS and SDU EBA are Needs review on Social Studies.
- **P4:** AU CS "Quota 2 only" (27 < 28, and Maths A 4 < 6.0). DTU meets (the
  cut-off is not a rule). RUC IBSS through the 4.0 English and Maths route.
- **P5:** CBS through Cambridge ("One step closes both"), and ITU GBI "Does not
  currently meet".
- **P6:** SEA ×2 Needs review. AU CS and DTU are "later intake". VIA GBE, Dania
  Cyber and SDU Electronics BEng meet on the Agency's rule, or on SDU's own list
  for diplomingeniør.
- **P7:** all SDU cards, ITU DS and ITU GBI (without fee exemption, no
  conditional admission), CBS through a test by 5 July, and AAU AIE.
- **P8:** AU CS and SDU CS, with the quota 2 line and the 15 March / uniTEST
  dates. CBS BA and Sociology ("nothing replaces this grade"). RUC IBSS (rejection
  letter quoted). SEA MMD meets.
- **P9:** CBS IB meets. AU Cognitive Science Needs review (History from nothing).
  RUC Global Humanities "Does not currently meet".

**Borderline** (acceptable, but I would add a caveat in a meeting):
- **P5 at ITU DS.** "Possible", yet the step's own line says "ITU does not say
  whether a test also covers an English grade below 6 … confirm with ITU". ITU's
  quoted sentence ("may be met by submitting one of the approved English
  tests") is unconditional, so either drop the hedge or make it a "?". At the
  moment the card is Possible and "confirm with" at the same time. The new guard
  only forbids that on Meets cards.
- **P7 at Maastricht DSAI.** "Possible", showing the EU/EEA deadline to a non-EU
  student. `fixes.md` records that the non-EU date is unknown, but the card does
  not say so.
- **P1 at ITU GBI.** "Needs review", headed "To check: 1 supplementary course:
  Danish at A level". Counting Danish from nothing as "1 course" frames it as a
  plan, when ITU itself says only Data Science is open to international students.

**Pre-existing rule issue**, not from these fixes but found in the sample:
- Danish A **Language and Literature** HL → Danish A is a green tick with no
  caution. The SL caution says "the handbook formally counts this as Danish B".
- `DK_AUDIT_NATIONAL.md` F10 says the handbook "is silent on Danish A Lang & Lit"
  and "a Lang & Lit student is not covered".
- So the HL tick is the permissive reading of silence, and the SL caution
  attributes a rule to a handbook that does not state it. My synthetic P9 with
  Lang & Lit HL is "Meets" at ITU GBI.

## 3. Phone reading order

Better, and closer to acceptable:
- The count, then the chips, then "What these results mean, and what they cannot
  tell you" (collapsed), then "How to close a gap" (collapsed). The meaning of the
  badges is now one tap from the count, not 26,000 px down (`p7-default-0.jpg`).
- Each number stays with its label.
- The evidence line reads "Source read 23 Sep 2026 · not yet reviewed by a person."
- Badges on "not met" cards are no longer dimmed. One glyph per reason.

Still wrong:
1. **The verdict comes after the reasons.**
   - Collapsed: title, then "Why this result +", then the badge.
   - Opened: all the reasons, then the badge (`p9-open-*`, `p6-sea-open-1`).
   - The badge belongs directly under the title, above the disclosure.
2. **Single-step "Possible" cards show no step when collapsed.**
   - P1 VIA GBE reads "Possible with action · Restricted admission." and nothing
     else (`p1-cards-1.jpg`).
   - P5 ITU DS and P1 ITU DS are the same.
   - Only multi-step and CBS cards have a "To do" line.
   - On AU cards the only visible line is the wrong quota 2 sentence (item C).
3. **"First sentence, rest one tap down" produces empty or wrong leads.**
   - "✓ One of the 2 accepted options is met. ▸" and "✓ One of the 5 accepted
     options is met. ▸" say nothing (`p9-open-0.jpg`).
   - "? Check: needs Danish A (SL or HL): your Danish A: Literature SL counts as
     Danish at A level. ▸" (`p9-open-2.jpg`). The visible line states the
     permissive claim that round 5 removed from the verdict.
   - The Maths lead is still five lines at 390 px.
4. **The decisive line is last.** On SEA for P6 the "?" that decides the verdict
   comes after three ✓ lines. Gaps and questions should lead.
5. **Length.** With "not met" hidden by default:
   - P5's page is 31,554 px, and the eight actionable cards start below 48 "Meets"
     cards (CBS at about 23,100 px).
   - P1's first "Possible" card is at about 11,700 px.

   A student who needs to act has to scroll past everything they need not act on.
6. **Smaller points.**
   - The four outcomes in the legend run as one paragraph. Make them a four-row list.
   - The count line leaves a trailing "·" at the end of wrapped lines.
   - CBS's collapsed "To do" drops "by 5 July, 12:00".
   - P5's first CBS ✗ still offers the IELTS route, which needs English B 5; P5
     has a 4.

## Remaining changes, ranked

1. **Make the national after-results count conditional on the programme.**
   - Set the scheme's `afterResults` to *unknown* (null), not 1.
   - Count 1 only where the institution record carries a sourced
     "accepts summer supplementation" (AU 2, SDU-EU 1, ITU fee-exempt 1 are
     already sourced).
   - When a plan fits only if an unrecorded programme accepts it, the result is
     **Needs review**, with the line: "Whether VIA accepts summer supplementation
     is not recorded — ask VIA; otherwise the course has to be passed before your
     results."
   - Change the legend to "…no more than the university **is recorded as
     allowing** after your results".
   - Guard: no "Possible with action" whose raise text contains "where the
     programme accepts it" unless the institution confirms it.
   - Affects the seven cards in 2A.
   - Files: `data/recognition/dk.json` (`levelRaise.afterResults`),
     `src/lib/eligibility.mjs` (`levelRaiseFor`, `planSteps`),
     `src/pages/planner.mjs` (legend), `scripts/test-eligibility.mjs`.
2. **Do not say "your way in is quota 2" when the only unmet floor is a subject
   the plan will supply.**
   - In `assess` (the quota-scoped `floors` mapping, `src/lib/eligibility.mjs` around line 1664), a subject floor for a subject the profile does not
     hold yet, where a gap's step will add that subject, should be
     `status: 'unknown'`, not `unmet`, with the line: "Quota 1 also needs 6.0 in
     Mathematics A — that will be the grade from your course."
   - Show the card-level quota 2 line (`planner.js` around line 348) only for
     floors that stay unmet whatever the plan does: the total, or a grade already
     held.
   - Guard: P1 at AU CS never shows "your way in is quota 2". P8 at AU CS still does.
3. **Map every "Still needs a source" item to a "?" (P7).**
   - Add non-EU `groups[]` to AU and to the national scheme with
     `afterResults: null` and the line "Whether AU's conditional admission after
     5 July is open to applicants from outside the EU/EEA is not recorded — ask
     AU."
   - P7 at AU CS, DS and ITPD, and VIA GBE, become Needs review.
   - Do the same for Maastricht's non-EU deadline: "the date for applicants from
     outside the EU/EEA is not recorded".
   - Add a test that reads the `fixes.md` list, or better a data field for it,
     so the two cannot drift apart.
4. **Never lead with the permissive half of a caution.** For a mapping with a
   `caution`, the visible lead must be the caution. Examples:
   - "? Danish A Literature SL: formally Danish B; most universities accept it for
     Danish A — ask ITU."
   - "? English test: ITU does not say whether it covers a grade below 6 you
     already hold."

   Fix the empty "One of the n accepted options is met." leads by naming the
   option that met it: "✓ History HL (one of 5 accepted)".
5. **Carry the SEA fix to the SEA programme pages.**
   - `dk-sea-computer-science-ap` and `dk-sea-multimedia-design-ap` say "DP
     Course Results are accepted" and list only Maths and English under "What
     you need". The English-test rule and its open question appear nowhere a
     student would read them.
   - Render `language-general` rules with an `openQuestion` in "What you need",
     or in the award box: "Course Results: SEA's English-test exemption names
     'an International Baccalaureate exam'; whether that includes Course
     Results is not published."
   - The planner and the page must not disagree.
6. **Put the verdict first on the card and give every "Possible" card its step.**
   - Order: badge directly under the title, then the one-line "To do" (for single
     steps too, e.g. "To do: Maths A as a supplementary course — conditional place,
     pass by 5 September"), then "Why this result ▸".
   - Inside "Why", order the lines ✗, then ?, then ✓.
   - Add CBS's "by 5 July, 12:00" to its "To do".
7. **Danish A Language and Literature.**
   - Record a source that the handbook's "Danish A1" covers Lang & Lit, or show
     a "?" at both levels ("the handbook names Danish A Literature, not Language
     and Literature — ask the institution").
   - Remove "the handbook formally counts this as Danish B" from the Lang & Lit
     caution. The handbook says nothing about Lang & Lit.
8. **Shorten the phone page for students who need to act.**
   - When a profile has any "Possible" or "Needs review" results, show them first,
     or collapse the Meets cards into one compact list (title, institution, badge)
     with "Show details".
   - Turn the legend's four outcomes into a list.
   - Drop the trailing "·" in the count line.

## Why 7 and not 8

The round-5 failures are fixed properly. The engine now counts courses per
publisher, per applicant group and per intake, which is the right model. The SDU,
SEA and ITU cards now say what their sources say.

But the same model now states a permission ("the university lets you finish
after your results") for seven programmes where nobody has recorded that
permission. It also shows four P7 cards as "possible" on a question the
implementer wrote down as open. And one of the fixes added a sentence to twelve
cards that no source supports, which hides the actual step. Each of these is small
in data and has an obvious guard. Once changes 1–4 are made, every verdict I
sampled is one I would repeat to a student.
