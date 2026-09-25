# Conversion critique, round 4

Critic: an experienced IB Diploma coordinator who knows Danish admissions (KOT,
quota 1 and 2, supplementary courses, the Agency's IB handbook). This is a fresh
critic. I am not the round 1–3 critic and I did not do the work. Written
25 September 2026.

What I judged:
- the **live site** (https://rktrobinhood.github.io/IB-Post-Secondary-Opportunities/),
  at 1280 px and 390 px;
- the round-3 fixes (NOTES.md decisions 34–40);
- nine student profiles run through the live planner, with every Danish
  "action" checked against the university's own page;
- 11 programmes not checked in rounds 1–3, read on the live site and checked
  against the universities' pages, all fetched today;
- CBS's IB subject table, read today in a browser (rounds 2 and 3 left it "not
  re-read").

Evidence is in `round-4/`:
- screenshots `01`–`18b`, taken with headless Chrome from the live URLs;
- `planner-profiles.json`, the nine profiles;
- `planner-verdicts.txt`, every verdict for every profile, 73 programmes each;
- `planner-verdicts-dk.txt`, the Danish cards only, with the ✓ lines removed;
- `text-*.json`, the visible text of each shot.

The driver script is `.cache/critic-r4.mjs`. It is gitignored scratch. Run it
with `node .cache/critic-r4.mjs all`. It reads `round-4/planner-profiles.json`.
Screenshots of phone pages show the sticky site header over the content. That
comes from full-length capture and is not a site bug.

**SCORE: 7 / 10.**

## Verdict

Round 3's first fix landed, and landed well.
- A 27-point student now sees **"Quota 2 only"** on SDU Software Engineering.
  The card says "Your way in: SDU's entrance test (uniTEST …) Apply by 15
  March, 12:00, and register for the test by 20 March".
- The summary counts the state separately: "15 quota 2 only".
- CBS's English action is now the best line in the planner. It names what is
  missing (English A), the test, the section minimums, the TOEFL date rule,
  Cambridge, and "by 5 July, 12:00". I would read it aloud to a student.
- The CBS cards are now five lines, and one IB line on a phone.

All 11 new programmes are right apart from one over-reading. CBS's subject
table is confirmed today, word for word.

It is not an 8, because fix 2 ("every *Possible with action* names a correct,
actionable step") is where I went looking, and there I found three verdicts I
would have to correct in a meeting:

1. **ITU Global Business Informatics tells a student how to fix a missing
   Danish A with a Maths course.**
   - The card says: "✗ This needs Danish A (SL or HL) … To close it: ITU
     accepts a VUC course, the University of Amsterdam's online Mathematics B
     (it corresponds to Danish A) or an International A level in Mathematics
     at C or better." (`10c-planner-p1-itu-gbi.png`)
   - The institution's `levelRaise` text is about Maths, but it is attached to
     every subject.
   - ITU's own page has a separate sentence for this subject: "You complete a
     supplementary course in Danish level A. In Denmark, supplementary courses
     are offered by VUC"
     (en.itu.dk/…/English-language-requirements-and-supplementary-courses).
   - Every profile without Danish A sees this. That is most of the readers.
2. **A missing Physics is hidden, so "Possible with action" names one course
   when two are needed.**
   - Take P1 (no Physics, Maths AI SL) at AAU Applied Industrial Electronics.
     The card shows ✗ Maths HL with an action. The Physics-or-Geoscience
     requirement shows only as "? No IB subject is equivalent to Geoscience A
     …" (`10d-planner-p1-aau-aie.png`). It never says "you have no Physics".
   - The same happens on about 10 programmes for any student without Physics:
     AAU AIE, Absalon Robot Systems, SDU Electronics ×2, EIB, ITE,
     Mechatronics ×2, VIA Software Tech ×2.
   - Two supplementary subjects is a different proposition from one.
     - AU: "It is only possible to take 2 supplementary courses if they are
       completed after 5 July".
     - SDU and the national summer route allow only one subject after 5 July.
   - The student would book the Maths course and still be ineligible.
3. **CBS: "Nothing recorded here replaces this grade" is false for English B
   SL 4.**
   - P5 (English B SL 4, 38 points) gets "Does not currently meet" on all six
     CBS programmes (`14b-planner-p5-cbs-phone.png`).
   - CBS's page, read today (cbs.dk/en/study-programmes/bachelor-programmes/application-and-admission):
     "English B with a minimum grade of 6.0: Cambridge C1 Advanced exam, passed
     with minimum C AND an overall score of minimum 185". And: "if you have
     passed one of the above Cambridge exams with the required minimum score,
     you fulfil both the specific entry requirement of English level B with a
     min. grade of 6.0 and the language requirement English level A."
   - So this student has a published way in: Cambridge C1 185+ (or C2 200+)
     by 5 July. The card even mentions Cambridge, but only "on top of English
     B at 5". Round 3's critique made the same mistake. The site encoded it.

Fix these three and I would give an 8. Fixes 4–6 below are what would make it
comfortable. A fourth, smaller planner fault: a Course Results candidate gets
**0** "meets" because the planner will not add up the six grades it was just
given.

## Round-3 top fixes, verified live

| # | Round-3 fix | Live | Note |
|---|---|---|---|
| 1a | "Quota 2 only" state, counted separately | ✓ | P4 (27 pts): "40 meet · **15 quota 2 only** · 8 possible · 9 review · 1 not met" (`p4-count.png`). SDU ×10 and AU ×5 show "Quota 2 only". The filter chip says **"Another route only"** while the count says "quota 2 only": use one name |
| 1b | Quota 2 route named per institution | ✓ | SDU: uniTEST, 15 March 12:00, register by 20 March, "places go to the highest test scores" (matches every SDU adgangskrav page I read). AU: "assesses the average of your grades in the programme's quota 2 subjects … relevant experience (… 4–12 months) … documented by 15 March" |
| 1c | "All qualified applicants accepted" qualified | ✓ | "All qualified applicants accepted in quota 1, from 31 IB points"; glance "Last intake: All qualified applicants accepted · 2026 intake · quota 1 needs at least 31 IB points" (`05-sdu-se-glance-phone.png`) |
| 1d | Planner legend | ✗ **new** | Still "What the four outcomes mean". It lists four, not five. It still says "Possible with action means one rule is not met … Does not currently meet means more than one rule is unmet", which is no longer how the engine decides (decision 35) |
| 2a | CBS action names English A, the scores, the date | ✓ | Exactly as asked (`10-planner-p1-cbs-ib.png`) |
| 2b | Maths A action from the institution's page | ✓ AU/SDU/ITU, ✗ ITU Danish A | AU: matches bachelor.au.dk/en/international-applicants/moreinfo/supplementary-subject-levels ("It is only possible to take 2 supplementary courses if they are completed after 5 July"; "AP-test … equivalent to A-level in Denmark"). SDU: matches sdu.dk …/special-conditions/supplementary-courses ("conditional on you passing the supplementary course(s) by 31 August"). ITU Maths: matches ITU's page (UvA, VUC, International A level; "only an opportunity for applicants exempted from paying tuition fee"; 5 July / 1 September). **ITU Danish A gets the Maths text** (Verdict 1) |
| 2c | No action → not "possible" | ◐ | Right for ITU DS Maths HL 4 and CBS BA&Soc Maths SL 3. Wrong for **CBS English B SL 4** (Verdict 3). **RUC Social Sciences at 24 pts / Maths AI SL 3** is "Possible with action" with no action: "✗ None of the 2 accepted combinations is complete. The closest needs: Needs at least 28 IB points …" (`17b-planner-p8-ruc.png`). RUC's rule is a hard minimum ("you will receive a rejection letter"), so it should be Not currently met. Outside Denmark, 2–6 Dutch cards per profile are "Possible with action" with no action (e.g. TU Delft CSE: "You do not have Mathematics: Analysis and Approaches at any level"). The "catalogue-wide scenario" in decision 35 does not hold for the rendered planner |
| 3 | CBS card ≤ 4 lines, one English block | ✓ (5 lines) | Desktop: 5 IB lines plus 5 small Danish lines (`01-cbs-card-grid-desktop.png`). Phone: IB line only, 5 lines (`02-cbs-card-grid-phone.png`). Acceptable. The page's English box prints the test phrase twice: once as the detail, again inside "Danish requirement" (`04b-cbs-ib-what-you-need-phone.png`) |
| 4 | Dead options folded on pages | ✓ | SDU Mech BEng: "Also accepted: 3 Danish-only options, with no IB route" (`06-sdu-mech-beng-what-you-need-phone.png`). The wording contradicts itself. "Also accepted" and "no IB route" together read as "accepted, but not for you". Say "Not open with IB: 3 Danish-school options" |
| 5a | AU Herning floor quoted from the Danish page | ✓ | Record: "Karakterkrav på mindst 6,0 i kvote 1" |
| 5b | SEA English exemption | ✗ **over-read** | See correctness row 6. SEA exempts IB holders from the English *test*, not from English B |
| 5c | Finder "No Mathematics A" → "No Maths HL needed" | ✗ | Still "No Mathematics A" (fourth round; decision 40 leaves it to another agent) |
| 5d | Glance "Last cut-off: Restricted" | ◐ | Fixed on SDU. Still "Last cut-off Restricted" on Dania Cyber Security, SEA CS, VIA CGA, Construction Tech, DTB, Graphic Storytelling and Software Tech (programme pages read today) |
| 5e | NOTES 26 corrected; stray "; § 18" | ✓ | § 17/§ 18 sentence reads cleanly |
| 5f | "You: 34 · last cut-off: 42" | ✓ | On every numeric cut-off. But AAU Chemical Eng now prints "3.3, which any IB Diploma clears … **You: 27 · last cut-off: 21**". That brings back a sub-Diploma IB total, which round 2 removed. Print "You: 27 · any Diploma clears it". AAU/RUC still say "most recent cut-off All admitted" |

## Planner: nine profiles, live

Full output is in `round-4/planner-verdicts.txt`. The Danish cards alone are in
`planner-verdicts-dk.txt`. Every profile is a full Diploma unless noted, and
EU/EEA unless noted.

| Profile | Count line | What I checked | Right? |
|---|---|---|---|
| **P1** English B SL 5, Maths AI SL 5, History HL, Econ HL, no Physics; 34 | 23 meet · 31 possible · 5 review · 14 not met | CBS ×6: English A missing, test route with scores and date | ✓ Excellent |
| P1 | | AU CS/DS/ITPD: Maths A action (AU text) + "! Quota 1: needs a 5 in Maths HL" | ✓. The action matches AU's page |
| P1 | | ITU GBI: Danish A missing → **Maths action** | ✗ Verdict 1 |
| P1 | | AAU AIE, Absalon Robot, SDU Electronics/EIB/ITE/Mechatronics, VIA STE: Maths action only; Physics gap shown as a Geoscience "?" | ✗ Verdict 2 |
| **P2** Maths AI SL 6, English A L&L HL, CS HL, Physics HL; 36 | 26 · 27 · 9 · 11 | AU/SDU/ITU CS and DS: Maths A action, institution-specific | ✓ (this student has Physics, so no hidden gap) |
| **P3** Global Politics HL 7, English A Lit HL, Maths AA SL; 37 | 27 · 22 · 11 · 13 | AU Cognitive Science "Meets" via AU's GP rule. CBS ×6 "Meets" via CBS's table (**confirmed today**: "Social Studies B: … Global Politics (SL or HL) … Social and cultural anthropology (HL)"). RUC/SDU/AAU EBA: "Needs review", now one sentence: "Ask the admissions office in writing before 15 March …" | ✓ |
| **P4** 27 pts, Maths AA HL 4, English B HL 4, Physics HL 4 | 40 · **15 quota 2 only** · 8 · 9 · 1 | SDU ×10 → Quota 2 only + uniTEST. AU ×5 → Quota 2 only + AU assessment. SDU BEng ×3 (26) → Meets. ITU DS (Maths HL 4 < 5) → Not met, "Nothing recorded here replaces this grade" | ✓ The round-3 headline fault is fixed |
| P4 | | CBS ×6, DTU: green "Meets" at 27 vs cut-offs of 37–42, with "You: 27 · last cut-off: 42" | ◐ The comparison is there, so I accept it. A student still reads green first. Consider "15 points below last year's cut-off" when the gap is large |
| P4 | | RUC Social Sciences: "Needs review" (Social Studies "?") and "! Quota 1: 28". The quota 2 route RUC publishes (English+Maths averaging 4.0 — this student has 4.0) is not named | ◐ |
| **P5** English B SL 4, 38 (phone) | 48 · 9 · 9 · 7 | CBS ×6: Not met, "Nothing recorded here replaces this grade" | ✗ Verdict 3 (Cambridge C1 185 / C2 200) |
| P5 | | ITU DS: "Possible with action": English test, "ITU does not say whether a test also covers an English grade below 6 that you already hold: confirm with ITU" | ✓ Honest, and ITU's page supports the test route ("The specific admission requirement in English may be met by submitting one of the approved English tests") |
| P5 | | The phone card for a "not met" result is faded grey-on-grey (`14b`). The text is hard to read on a phone | ◐ |
| **P6** DP Course Results, English A HL 6, Maths AA HL 6, Physics HL 6, 3 SL at 5; no total | **0 meet** · 46 possible · 23 review · 4 not met | Universities: "✗ This asks for the full IB Diploma … two successive raises … at least one of them to A level … Retaking … is the other published route". The Agency's rule is right (ufsn.dk Q&A on DP Course Results) | ✓ facts. ✗ usability: the same 90-word paragraph appears on 46 cards. Say it once above the results |
| P6 | | SEA, Dania, BAAA, VIA ATCM, VIA Climate: "? Course Results are accepted here. It asks for 6 graded subjects, 3 of them at HL, at least 3 in every subject and 18 points in total. **Add your predicted total** to check" | ✗ The student entered six grades totalling 34, three at HL, none below 3. The planner can decide this and should say "Meets". A Course Results candidate has no Diploma total to add |
| **P7** as P1, outside the EU/EEA | same as P1 | SDU action: "an EU/EEA applicant who has not finished by 5 July is offered a place conditional …". ITU: "(fee-exempt applicants only)" | ◐ True, but not tailored. SDU: "If you are from a country outside of the EU/EEA, you must have finished your supplementary courses before 5 July". The planner knows the group, so tell this student their date |
| **P8** 24 pts, Maths AI SL 3, English B HL 4 | 21 · 3 quota 2 only · 26 · 7 · 16 | AU Herning / AU EBA / SDU EBA → Quota 2 only, named. CBS BA&Soc Maths 3 → Not met. RUC Social Sciences → **actionless "Possible with action"** | ✗ RUC (see 2c) |
| **P9** Nordic, Danish A Lit SL 5, English A L&L HL, Maths AA SL 5; 33 | 28 · 21 · 10 · 14 | ITU GBI: "✓ your Danish A: Literature SL counts as Danish at A level", then "**? Danish A must be passed even though teaching is in English. — this depends on documentation the profile does not hold**" → Needs review (`18-planner-p9-itu-gbi.png`) | ✗ It contradicts itself. The profile holds Danish A. The real caveat is the one the programme page gives: "At SL the handbook formally counts this as Danish B; universities normally accept it … Confirm with the university". CBS IB "Meets" ✓ |

Summary: the engine's *eligibility* is right in every Danish case I ran,
except CBS for English B SL 4. The *actions* are right for CBS, AU, SDU and
ITU-Maths, and wrong for ITU-Danish. Gaps in "one of" groups are
under-reported.

## Correctness: 11 programmes not checked in rounds 1–3

Fetched 25 Sep 2026.

| # | Programme | Site, IB terms (live) | University's page (URL, quote) | Floor → IB | Verdict |
|---|---|---|---|---|---|
| 1 | SDU Electronics (BSc Eng, Sønderborg) | Any IB English · Maths HL · Physics / Geo A no route · quota 1: 31 · "All qualified applicants accepted" | sdu.dk/en/uddannelse/bachelor/electronics/adgangskrav: "English level B, Mathematics level A, Physics level B or Geoscience level A"; "7.0 or higher"; "All qualified applicants accepted" | 7.0 → 31 ✓ | ✓ |
| 2 | SDU Mechanical Eng. (BSc Eng, Sønderborg) | Maths HL · Physics+Chemistry · 2 Danish-only · quota 1: 31 | …/bachelor/mechanical-engineering/adgangskrav: "Physics level B and Chemistry level C," "Physics level B and Biotechnology level A," or "Geoscience level A and Chemistry level C"; "7.0 or higher"; "All qualified applicants accepted" | 31 ✓ | ✓ The Danish-only options are listed as "Physics B + Biotechnology A / Geoscience A + Chemistry C", which matches SDU's BSc page |
| 3 | SDU Mechatronics BEng (Sønderborg) | Any IB English · Maths HL · Physics / Geo A · quota 1: 26 | …/ingenioer/mekatronik/adgangskrav: "English level B", "Mathematics level A", "Physics level B or Geoscience level A"; "5.0 or higher"; "All qualified applicants accepted" | 5.0 → 26 ✓ | ✓ |
| 4 | SDU Software Engineering (Vejle) | Any IB English · Maths HL · quota 1: 31 | …/bachelor/software-engineering-vejle/adgangskrav: "English level B" and "Mathematics level A"; "7.0 or higher"; "invited to participate in an entrance examination" | 31 ✓ | ✓ |
| 5 | Dania Cyber Security (Viborg) | Any IB English · Any IB Maths | eadania.com/programmes/cyber-security/: "English at the Danish B-level", "Mathematics at the Danish B-level"; "15 March at 12 noon"; "Viborg", "3¼ years" | — | ✓ (glance "Last cut-off Restricted", 5d) |
| 6 | SEA Computer Science (AP, Esbjerg) | Any IB Maths · "Any IB English: IB Diploma holders exempt" | s-e-a.dk/uddannelser/computer-science: "You must have passed maths at B level and english at B level if you want the english course." The exemption sits under "All applicants holding a foreign entrance examination must document their English qualifications, and English tests must be submitted …": "Applicants holding … an International Baccalaureate exam … are exempt from the requirement" | — | ◐ **Over-read.** The exemption is from the *test*, not from English B. Show "Any IB English (no English test needed)". The same applies to SEA Multimedia Design (round-3 fix 39) |
| 7 | VIA Software Technology Eng. (Horsens) | Maths HL ≥3 · Any IB English ≥3 · Physics ≥3 / Geo A | en.via.dk/programmes/bachelor/software-technology-engineering: "Mathematics equivalent to a Danish A-level", "Physics … B-level or Geoscience … A-level", "English … B-level"; "min. average of 2.0"; "Campus Horsens" | 02 → IB 3 ✓ | ✓ |
| 8 | VIA Construction Technology (AP, Horsens) | Any IB Maths ≥3 · one of Any IB English ≥3 / IELTS 6.5 | en.via.dk/…/construction-technology-ap-degree: "Mathematics equivalent to a Danish C-level"; "min. average of 2.0"; English is VIA's general proficiency rule (B-level at 2.0 or a test, per the English-proficiency page read in round 3) | — | ✓ |
| 9 | VIA Design, Technology & Business (AP, Herning) | Any IB Maths ≥3 · Any IB English ≥3 · admissions assignment | en.via.dk/…/design-technology-and-business-ap-degree: "Mathematics equivalent to a Danish C-level", "English … B-level … or a Danish C-level … AND a valid English test"; "minimum average of 2.0"; "admissions assignment"; "Herning" | — | ✓ |
| 10 | VIA Computer Graphic Arts (TAW, Viborg) | one of Any IB English ≥3 / IELTS 6.5 · portfolio, test, interview | animationworkshop.via.dk/…/how-to-apply/step1: "equivalent to a Danish B-level with a minimum weighted grade point average score of 2.0"; step 5: "We only invite the top 40 applicants for each programme to the admission test and interview"; CGA page: "Admission to the programme is talent-based" | — | ✓ |
| 11 | VIA Graphic Storytelling (TAW, Viborg) | as 10 | same steps; step 3: "Graphic Storytelling only admit students every other year. Next time is 2027" | — | ✓ The 2027 intake is right. Consider saying "every other year" on the page |

Also confirmed today:
- **CBS's IB table**, rounds 2–3's open item, read from the "International
  Baccalaureate – IB Diploma" panel:
  - "Social Studies B: Business management (SL or HL), Economics (SL or HL),
    Geography (HL), Global Politics (SL or HL), History (SL or HL), Social and
    cultural anthropology (HL)";
  - "The following is equivalent to English level A: English B (HL) … English
    A Literature (SL) …".
  - The site matches, so remove the "not re-read" note from `dk-cbs.json`.
- **Planner actions:**
  - AU's supplementary page, SDU's supplementary page, ITU's
    English-and-supplementary page and CBS's application page, all quoted
    above.
  - The Agency Q&A on DP Course Results (ufsn.dk), which supports the
    18-point, grade-3, three-HL, two-raises rule.

No wrong deadline, no wrong floor, no wrong conversion. Data faults: SEA's
English (over-read) and CBS's Cambridge route (under-read in the planner).

## Clarity: can a 17-year-old tell at a glance?

What works:
- **SDU and AU cards on a phone** (`03`, `08`):
  - "Needs Any IB English · Maths HL (AA or AI)";
  - "Quota 1: at least 31 IB points; below that, quota 2: SDU's entrance
    test".
  - That is the round-3 jargon fix, done in one line.
- **The finder** carries the same quota line (`07-finder-sdu.png`).
- **CBS cards** fit in five lines. English is one block on the page.
- **The "Quota 2 only" card** (`13-planner-p4-sdu-se.png`) is the clearest
  thing in the planner: a badge, "Your way in:", and a date.

What does not:
1. **Action paragraphs are long and identical.**
   - The national supplementary sentence is 55 words. It repeats on every AAU,
     Absalon, VIA, RUC and DTU gap.
   - The Course Results paragraph is 90 words, on 46 cards.
   - Put each once, in a "How to close a gap" box above the results. On each
     card, say "To close it: Maths A supplementary course (see how ↑)".
2. **The planner legend is stale** (1d). A student reads "four outcomes" and
   sees five chips.
3. **"Also accepted: 3 Danish-only options, with no IB route"** contradicts
   itself.
4. **CBS page, English box**: the test phrase appears twice
   (`04b-cbs-ib-what-you-need-phone.png`). The ITU GBI page prints "IELTS 7.0"
   in the heading, again as its own line, and again inside the Danish line.
5. **AU card list syntax**: "one of Global Politics HL, History, Economics or
   Business Management / Global Politics SL with Economics". The slash inside
   a list is hard to parse. Use "…, Business Management, or Global Politics
   SL with Economics".
6. **Separator mix on cards**: "Any IB Maths — one of …". The em dash reads as
   if it qualifies Maths. Use the same "·" as between the other requirements.
7. **"Last cut-off Restricted"** is still on every academy and VIA glance (5d).
8. **Finder filter "No Mathematics A"**, for the fourth round.
9. **Faded "not met" cards on a phone** are hard to read. Dim the badge, not
   the text.
10. The "?" line reads "whether **your** Global Politics … counts" to students
    who do not take Global Politics (P4, P5). Say "whether Global Politics or
    another social science subject counts".

## Top fixes, ranked

1. **Key every "To close it" action to the missing subject.** (Verdict 1)
   - `levelRaise` on an institution should be per subject, or at least have a
     default and a Maths-specific text.
   - ITU Danish A: "Take Danish A as a supplementary course (VUC offers it)",
     quoting ITU's own sentence.
   - Add a guard: the action text must name the missing subject, or be
     subject-neutral. It must never name another subject.
   - Files: `data/institutions/dk-itu.json` (and the others with
     `levelRaise`), `src/lib/eligibility.mjs`, `scripts/test-eligibility.mjs`.
2. **Report every unmet requirement in a "one of" group.** (Verdict 2)
   - When no option in the group is met, show "✗ This needs Physics (SL or
     HL), and your profile has none. To close it: …" as the lead line. The
     Geoscience "no IB route" note becomes a sub-line.
   - Count the gaps.
     - Two gaps whose published rules allow them (AU: two after 5 July; SDU
       and national: all but one before 5 July) → "Possible with action: 2
       supplementary courses", naming both.
     - Otherwise → "Not currently met".
   - Add a scenario: P1 (no Physics) at AAU Applied Industrial Electronics
     names Physics.
3. **CBS Cambridge route for English B below 5.** (Verdict 3)
   - Record CBS's sentence as a published alternative to the English B 6.0
     grade: Cambridge C1 Advanced, grade C and 185+, or C2 Proficiency, grade
     C and 200+, by 5 July 12:00, which "fulfil[s] both" English B 6.0 and
     English A.
   - P5 then becomes "Possible with action: Cambridge C1 Advanced 185+ by 5
     July".
   - Update the CBS card and page English line: "… or English B SL 5+ with
     IELTS 7.0 — or Cambridge C1 185+ with any English B".
   - Add a scenario: English B SL 4 at CBS International Business is
     `possible-with-action`, naming Cambridge.
4. **Course Results: compute what the grades already show.**
   - With six grades entered, sum them and check the published conditions (6
     subjects, 3 HL, each ≥ 3, ≥ 18). Mark academies that accept Course
     Results as "Meets".
   - Do not ask a Course Results candidate for a "predicted total".
   - Show the Agency's two-raises paragraph once above the results, not on 46
     cards.
5. **Make the outcome model say what it does.**
   - Legend: five outcomes, with definitions from decisions 34–35.
   - Rename the chip "Another route only" to "Quota 2 only" to match the count.
   - RUC Social Sciences below the hard minimum → "Not currently met", quoting
     "you will receive a rejection letter".
   - Extend the "no actionless possible" guard to the *rendered* planner
     text, Dutch programmes included. There are 2–6 per profile today.
6. **Danish A held → no documentation "?"**
   - When the profile holds Danish A (SL or HL), drop "depends on
     documentation the profile does not hold".
   - At SL, carry the page's caveat: "formally Danish B; universities
     normally accept it — confirm with ITU".
7. **Tailor the action to the applicant group.** Non-EU at SDU: "finish before
   5 July". Non-fee-exempt at ITU: "no conditional admission; finish and
   document by 5 July".
8. **Small.**
   - SEA CS and Multimedia Design: "Any IB English (no English test needed)".
   - Glance "Last cut-off Restricted" on academy and VIA pages.
   - AAU Chemical Eng "last cut-off: 21" → "any Diploma clears it". "most
     recent cut-off All admitted" → "all qualified applicants admitted".
   - "Also accepted … no IB route" → "Not open with IB: …".
   - Remove the duplicate test phrase on CBS and ITU pages.
   - AU card slash; card separators.
   - Finder label "No Maths HL needed".
   - Remove "not re-read" from the CBS equivalence note (confirmed above).

With fixes 1–3, every Danish action I tested would be one I could repeat to a
student. That is an 8. With fixes 4–6, the planner would be safe to hand to a
Course Results candidate and a Danish-speaking student as well.
