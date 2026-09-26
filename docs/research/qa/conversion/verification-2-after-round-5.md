# Second verification after round 5 (issue #42)

Critic: **admissions counsellor**, with an art director's eye on the phone.
I did not build this and have not scored it before. Written 26 September 2026
against `main` at `09804d5`.

**SCORE: 7 / 10.**

## What I did

- **Tests.** Ran `node scripts/test-eligibility.mjs` in `/home/user/ibp-main`.
  All 276 scenarios pass.
- **Build.** Copied the checkout (without `dist`, `node_modules` or `.git`) to
  `scratchpad/critic42v2/site`, symlinked `node_modules` and built it: 604
  pages.
- **Engine check.** Re-ran the nine round-4 profiles through the engine against
  the built planner data, into `critic42v2/verdicts-now.txt`. The verdicts, ✗, ?
  and ! lines and "To do" lines are identical to the committed
  `round-5/after-verification/planner-verdicts.txt`. The only lines that differ
  are the Dutch Course Results prose on two NL cards (Breda and Erasmus), which
  changed in #41 and do not affect verdicts.
- **Committed shots.** Read all 18 phone shots in `after-verification/`.
- **Fresh shots.** Served the build on port 4482 and shot a 390 px phone. The
  shots are in `critic42v2/shots/`:
  - `p1-screens-*`: the default state;
  - `p8-cards-*`, `p9-cards-*` and `p2-cards-*`: collapsed cards;
  - `sea-cs-0/1`: the SEA programme page.

  I also measured every card's position (`critic42v2/probe-*.txt`). I stopped
  my own server by its PID (28450).
- **Synthetic checks.**
  - Danish A Language and Literature at HL and at SL, and Danish A Literature at
    HL, at ITU GBI.
  - Maastricht's English line for P5, who has English B SL 4.
- **Verdicts checked against records.** I checked **70 verdicts across all nine
  profiles** against:
  - the records: `data/opportunities/dk-*`, `data/institutions/dk-{au,sdu,itu,cbs}`,
    `data/recognition/dk.json` (`levelRaise`, grade tables, Danish cautions) and
    `data/evidence/dk.json`;
  - the quotations in `NOTES.md` for rounds 3–5;
  - `DK_AUDIT_NATIONAL.md` F10 and F14.

## 1. The verification report's changes 1–5

| # | Change | Cards checked | Verdict |
|---|---|---|---|
| 1 | The national after-results count is conditional | These are now **Needs review** with "To check: … Whether this programme accepts summer supplementation is not recorded here — ask the institution": P1, P5 and P7 at VIA Global Business Engineering; P2 at AAU Applied Industrial Electronics, Absalon Robot Systems, VIA Software Technology Engineering and VIA STE XR. The legend reads "…is recorded as allowing after your results". SDU EU/EEA (1), AU (2) and ITU fee-exempt (1) still give Possible, and all three counts are sourced. | **Fixed** for verdicts. The same unrecorded permission still shows in the wording of about 60 "not met" cards (see B below). |
| 2 | No "your way in is quota 2" where the plan's course supplies the subject | P1, P2, P3 and P9 at AU CS, DS and ITPD: no quota 2 line. The floor is "? Quota 1: Also needs a 5 in Maths HL (AA or AI) — that will be the grade from your course" (`p1-au-cs-phone.jpg`). P8 at AU CS still shows the quota 2 line, because 24 is below the 28 total. | **Fixed**. The new floor sentence uses the wrong unit (see C). |
| 3 | Every "Still needs a source" item is a "?" | P7 at AU CS, DS and ITPD: Needs review, "Whether AU's conditional admission after 5 July is open to applicants from outside the EU/EEA is not recorded — ask AU". P7 at VIA GBE: Needs review. P7 at Maastricht DSAI: Needs review with "? … the date for applicants from outside the EU/EEA is not recorded". A test ties the bullet count in `fixes.md` to the scenarios. | **Fixed**. The guard only compares counts, not content, but it holds. |
| 4 | The caution leads, and a met "one of" names what met it | P9 at ITU GBI: "? Danish A: Literature SL for Danish A (SL or HL): at SL the handbook formally counts this as Danish B; universities normally accept it…". This matches F10's "til de fleste uddannelser". P1 at AAU EBA, AU CogSci, RUC IBSS and SDU ES: "✓ Needs History (SL or HL): your History HL counts as History at A level… (One of the 5 accepted options.)" ITU's hedge is gone ("which covers an English grade below 6 too"), which is acceptable on ITU's unconditional sentence. | **Fixed** |
| 5 | SEA's open question on the SEA programme pages | On SEA CS and SEA MMD the "Which IB award" box is amber and carries "**But:** English documented with a test … whether that includes DP Course Results is not published. Ask SEA". The box sits inside the collapsed "Requirements in full" disclosure, though. The visible summary above it still says **"DP Course Results are accepted. Meeting the requirements does not guarantee a place."**, and "What you need" lists only Maths B and English B (`shots/sea-cs-1.jpg`, `sea-cs-0.jpg`). On a phone, the unqualified yes is what a Course candidate reads, and the "But" is one tap away. | **Partly fixed**. The page and the planner no longer disagree, but the visible summary leads with the permissive half, which change 4 exists to forbid. |

Changes 6–8 are also done as `fixes.md` says:
- the badge is under the title;
- a "To do" or "To check" line appears on every Possible card;
- inside "Why this result" the order is ✗, ?, then ✓;
- actionable cards come first;
- the legend is a list;
- no "·" is left dangling;
- Danish A Language and Literature is a "?" at both levels. I confirmed this
  synthetically: Language and Literature HL and SL are Needs review at ITU GBI,
  and Danish A Literature HL is Meets.

## 2. Verdicts against the records

I would repeat 59 of the 70 verdicts I checked to a student as they stand,
including:
- **P1:** AU CS, DS and ITPD Possible (Maths A; AU's "only possible to take 2
  supplementary courses if they are completed after 5 July"). CBS ×6 through the
  test (English B SL 5 → 7 ≥ 6.0, by 5 July 12:00). ITU DS (fee-exempt, pass by 1
  September). SDU AI, CS and SE ×2 (EU/EEA, 31 August). SDU EIB, Mechatronics
  and ITE "not met": Maths A plus Physics B from nothing, one after 5 July. The
  national sentence "som udgangspunkt kun ét fag" supports "only one". AAU AIE,
  DTU and VIA STE are not met. AAU EBA, AU CogSci, RUC IBSS and SDU ES meet
  through History HL, and SEA CS through the quoted "an International
  Baccalaureate exam" exemption.
- **P2:** SDU Electronics BEng Possible (Physics HL held), plus the six Needs
  review cards named in change 1. AU CogSci and RUC Global Humanities are Needs
  review (History from nothing). SDU Mechanical BEng is not met.
- **P3:** SDU and AAU EBA are Needs review on Social Studies (no IB equivalent).
  AU CS is Possible.
- **P4:** AU CS "Quota 2 only" (27 → 5.6 < 6.0, and Maths A 4 < 6.0). SDU SE
  Sønderborg "Quota 2 only" with uniTEST. ITU DS is not met (Maths HL 4 < 5, and
  no grade replacement is recorded). SDU Electronics BEng meets (27 → 5.6 ≥ 5.0).
- **P5:** CBS ×6 through Cambridge ("fulfils both"). ITU DS through a test. VIA
  GBE is Needs review.
- **P6:** SEA ×2 are Needs review. AU CS and CBS are "For 2027" (later intake).
  DTU is not met, with the English "?". Absalon Robot, VIA GBE and SDU
  Electronics BEng meet (national Course Results rule for professionsbachelor,
  and SDU's own BEng list). The six grades sum to 33 ≥ 18, all ≥ 3 and three
  at HL.
- **P7:** every SDU card is not met, with "every course must be passed by
  5 July". ITU DS and GBI are not met (no conditional admission without fee
  exemption). CBS through a test. SEA CS meets.
- **P8:** AU EBA, AU Herning and SDU EBA are "Quota 2 only" with the named
  route. CBS BA and Sociology is not met. RUC IBSS is not met. SEA MMD meets.
- **P9:** CBS IB meets. ITU GBI is Needs review (caution). AU CS and ITU DS are
  Possible (Nordic counts as EU/EEA and fee-exempt). RUC Global Humanities is not
  met (Second Foreign Language B and History B). AU CogSci is Needs review.

Every grade and total conversion I spot-checked matches the Agency tables:
- IB 5 → 7, IB 4 → 4 and IB 3 → 02, so "min 6" is an IB 5, "min 4" an IB 4 and
  "min 02" an IB 3;
- 26 → 5.2, 27 → 5.6, 28 → 6.0, 31 → 7.3, 34 → 8.5;
- the cut-offs 11.4 → 43, 9.8 → 38, 7.3 → 31 and 5.9 → 28.

### What fails

**A. A conflict resolved to the permissive claim: P8 at AU CS, DS and ITPD
(3 cards, generous).**
- The collapsed card (`shots/p8-cards-0.jpg`) says "**Possible with action**",
  then "To do: Mathematics at A level as a supplementary course", then "Below
  the quota 1 floor, your way in is quota 2: … **Everything must be documented
  by 15 March.**"
- The only way the plan fits for 2027 is AU's conditional admission after
  5 July, but this student can only be admitted in quota 2, and AU's own quota 2
  text says everything by 15 March.
- No record says AU's conditional admission after 5 July applies to a quota 2
  applicant. Read literally, the card's two lines say the course has to be
  finished by 15 March in DP2.
- The honest verdict is **Needs review**, with: "Whether AU's conditional
  admission after 5 July applies in quota 2, where documents are due 15 March,
  is not recorded — ask AU."
- SDU CS, AI and SE for P8 are the same case in a milder form: uniTEST, "apply
  by 15 March", and the 31 August conditional pass are never shown to combine.
- The first verification accepted these cards. I do not.

**A2. A tick on silence (planner, NL records from #41): Maastricht English,
about 11 verdicts.**
- On Maastricht DSAI, IB and UCM, every Diploma profile gets "✓ Holders of a
  full IB Diploma are exempt from this requirement." That includes P5 with
  English B SL 4, who is **Meets** at Maastricht DSAI.
- The record itself says the exemption "could not be captured", that it "rests
  on a pattern rather than on a quoted sentence", and to "Confirm it on the
  programme page".
- That is silence shown as a yes. It should be a "?" (Needs review) until a
  sentence is quoted.
- This is outside the Danish data but inside `/planner/`, so it counts.

**B. The residue of change 1 in the wording (about 60 "not met" cards, verdicts
correct).**
- On every national-rule card with two or more courses, the lines read "2
  supplementary courses: … **1 of them** has to be passed before your IB results
  arrive". The same goes for "2 of them" out of three. This covers AAU, Absalon,
  DTU, RUC and VIA, for P1, P2, P3, P7, P8 and P9, and P9 at RUC Global
  Humanities.
- `planSteps` computes that "1" from `afterResultsIfAccepted`, which is the
  permission change 1 says is not recorded.
- The honest line is: "At least 1 of them — all of them unless the programme
  accepts summer supplementation — has to be passed before your IB results."
- The verdict is right either way, but the sentence states a permission nobody
  has recorded.

**C. A target in the wrong unit (18 cards).**
- "Quota 1: Also needs a 5 in Maths HL (AA or AI) — that will be the grade from
  your course." appears on AU CS, DS and ITPD for P1, P2, P3, P7, P8 and P9.
- The course is a Danish (or AP or A-level) Maths A course, not IB Maths HL.
  What AU publishes is 6.0 in Mathematics A, which on a Danish course means a 7
  or better.
- Telling a student to get "a 5 in Maths HL" from a VUC course is wrong. The
  floor should read: "Quota 1 also needs 6.0 in Mathematics A — a 7 or better
  from your course; whether AU applies it to a course passed after 5 July is not
  recorded."

**Borderline** (I would add a caveat in a meeting, but it is not wrong):
- **P1 and P2 at ITU GBI:** "To check: 1 supplementary course: Danish at A
  level" for a student with no Danish. This is carried over. It frames Danish
  from nothing as one course when ITU says only Data Science is open to
  international students.
- **AU "To do" lines have no date.** "Mathematics at A level as a supplementary
  course." should name before 5 July, or at most two after, with documentation
  by 5 September. Neither date is shown on the collapsed card, while SDU, ITU
  and CBS show theirs. ITU DS's test "To do" (P5) also omits "valid on 5 July".

## 3. Phone reading order

Much better than in the first verification:
- **Top of page** (`shots/p1-screens-0.jpg`): the count, then the chips, then
  two collapsed disclosures, then the first card.
- **Card order:** actionable cards come first. P1's first Possible card is at
  2,463 px, where it was about 11,700 before, and P5's first CBS card now comes
  right after the legend.
- **Inside a card:** the badge sits under the title, the "To do" / "To check"
  line under the badge, and the reasons one tap down in ✗ / ? / ✓ order.
- **Quota 2 only cards** open with "Your way in".

Still wrong:
1. **Needs review cards whose reason is a "?" show no reason when collapsed.**
   - P9 at ITU GBI (`shots/p9-cards-0.jpg`) is title, then "Needs review", then
     "Why this result +". The Danish caution that decides it is hidden.
   - The same goes for every Social Studies "?" card (RUC IBSS, SDU ES, SDU MMA
     and AAU EBA) and the portfolio cards.
   - Possible cards got their step, but these did not get a "To check" line.
2. **The SEA page leads with the unqualified yes** (change 5 above). "The fine
   print: DP Course Results are accepted." is the visible sentence, and the
   "But" is inside the disclosure.
3. **P8's AU card has two lines that contradict each other on one screen**
   (item A). Each is legible, but read together they are not.
4. **P7 at Maastricht:** the "To check" line repeats the deadline sentence twice
   ("…1 June 2027. Maastricht's deficiency deadline is recorded for EU/EEA
   applicants (1 June 2027); …"), and the "?" inside repeats it a third time.
5. **Small points:**
   - The "Quota 2 only" chip shows on profiles with no such result (P1, P7, P9).
   - "Meets" cards are not compacted: P1's page is 23,075 px and P8's is
     23,931 px.
   - Each card's side block (cut-off, source and link) adds about 200 px.

## Remaining changes, ranked

1. **Make P8's AU cards Needs review (and check SDU the same way).**
   - A plan that relies on conditional admission after 5 July, on a card whose
     only way in is quota 2 (documents by 15 March), is "To check": "Whether
     AU's conditional admission after 5 July applies to quota 2 applicants is not
     recorded — ask AU."
   - Guard: no Possible result has both an unmet quota 1 floor and a step whose
     timing is after the quota 2 documentation date, unless an institution field
     (`levelRaise.quota2AfterResults`) says it does.
   - Files: `src/lib/eligibility.mjs` (the `assess` and `planSteps` join),
     `data/institutions/dk-au.json`, `dk-sdu.json` and
     `scripts/test-eligibility.mjs`.
2. **Turn the Maastricht English tick into a "?".**
   - `r-english` in the three `nl-maastricht-*` records should carry an
     `openQuestion` ("Maastricht's English exemption for IB Diploma holders
     could not be captured as a sentence — confirm on the programme page"), or
     the tick should be dropped until it is quoted.
   - Guard: a requirement whose note says it "rests on a pattern" cannot be
     `satisfiedBy`.
3. **Say the unrecorded count in the "For 2027" line.**
   - When any raise has `afterResults: null`, print "At least N of them — all of
     them unless the programme accepts summer supplementation — have to be passed
     before your IB results."
   - Guard: no "For 2027" summary gives a bare "N of them" count unless every
     raise's `afterResults` is an integer.
   - File: `src/lib/eligibility.mjs` `planSteps`, the last return.
4. **Correct the AU Maths floor unit.**
   - Where the floor's grade will come from the plan's course, state it in the
     published unit: "Quota 1 also needs 6.0 in Mathematics A — a 7 or better
     from your course; whether AU applies this floor to a course passed after
     5 July is not recorded."
   - Never phrase it as an IB HL grade.
5. **Finish change 5 on the SEA pages.**
   - The visible "fine print" summary should carry the qualifier: "DP Course
     Results are accepted, but whether SEA's English-test exemption covers them
     is not published — ask SEA."
   - Or list "English test (Course Results: ?)" in "What you need".
   - Guard (ib-terms): an `openQuestion` on a requirement must appear in the
     page's visible summary, not only inside a disclosure.
6. **Give every Needs review card its "To check" line when collapsed.**
   - Use the first "?" message (the caution, the Social Studies question or the
     portfolio), as the Possible cards now do.
   - De-duplicate Maastricht's P7 "To check" line.
7. **Put timing in AU's and ITU's "To do".**
   - AU: "Mathematics at A level as a supplementary course — pass by 5 July, or
     after it as conditional admission with documentation by 5 September (at
     most two)."
   - ITU test: "— valid on 5 July".
8. **Smaller points.**
   - Hide chips whose count is 0.
   - Make ITU GBI "Danish from nothing" read as not open to international
     applicants, rather than as one course.
   - Compact "Meets" cards on a phone.

## Why 7 and not 8

Changes 1–4 are fixed properly, and the engine now keeps apart what a university
is recorded as allowing and what it merely might allow. That is the right
model, and the phone card finally reads verdict first.

I still would not repeat every verdict to a student today:
- Three P8 cards call a plan "possible" by combining a conditional admission
  after 5 July with a quota 2 route whose own text says everything by 15 March.
  No source joins the two.
- The planner ticks Maastricht's English on a record that says it has no quoted
  sentence for it.
- About 60 "not met" cards still count the unrecorded national permission in
  their "1 of them before your results" line.
- Eighteen AU cards set a target in the wrong unit.
- SEA's visible summary still leads with the unqualified yes.

None of these is large in code, and each has an obvious guard. Once changes 1–5
above are made, every verdict I sampled is one I would repeat.
