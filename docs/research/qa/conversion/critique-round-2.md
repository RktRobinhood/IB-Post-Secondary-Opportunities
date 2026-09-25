# Conversion critique, round 2

Critic: an experienced IB Diploma coordinator who knows Danish admissions (KOT,
quota 1 and 2, the Agency's IB handbook). This is a fresh critic, not the round-1
critic and not the agent that did the work. Written 25 September 2026.

Judged: the round-1 fixes (NOTES.md decisions 16–24, screenshots `round-1/`),
the built site (`node src/build.mjs` with SITE_BASE unset, 152 pages, snapshot
served locally), the engine (`assess` run against the live opportunity and
institution records) and the universities' own pages, fetched today.

**SCORE: 6 / 10.**

## Verdict

Every round-1 fix landed, and most landed well. Aarhus's and CBS's own Social
Studies routes now appear on cards, pages and in the planner. A Global Politics
HL student meets AU Cognitive Science "under Aarhus University's own rule". ITU's
"no minimum at A level" reads correctly: "at least a 5 in English B SL, any grade
otherwise". The BAAA and VIA rendering faults are gone. Cut-offs carry IB points,
and every conversion I checked is right. I read the no-bonus claim in BEK 288
myself, and it holds.

It still cannot be accepted, for the same reason round 1 failed: in places the
site shuts a door that the university has published as open, or says a door is
open when it is shut. Four new findings, each checked against the official page:

1. **CBS: the English test route is missing on all six programmes.** CBS lets an
   applicant meet the English A language requirement with a test if they already
   hold English B at 6.0 or better. The site gives only "English A … or English B
   HL". English B SL is the most common English for a non-Danish IB student. The
   planner gives such a student "Possible with action" on every CBS programme and
   names no action. The action is IELTS 7.0.
2. **Grade floors are not translated, and one hard minimum is missing.**
   - **RUC Social Sciences.** RUC requires a GPA of 6.0 or a 4.0 average in
     English and Maths. The page says "No minimum grade is recorded for any of
     these subjects". The engine says **meets** for a 25-point student with a 3 in
     English and a 3 in Maths, who does not qualify.
   - **SDU (14 programmes) and AU (5 programmes).** These set quota 1 GPA floors:
     SDU 7.0, which is 31 IB points; AU 6.0, which is 28 points, plus 6.0 in
     Maths A (IB Maths HL 5) on CS, Data Science and IT Product Development.
     - SDU's floors appear nowhere on the site.
     - AU's appear only in a collapsed note, in Danish GPA.
     - SDU Software Engineering shows "All qualified applicants accepted" with no
       floor. A 27-point student reads that as a sure place, but they cannot enter
       quota 1 at all.
     - A "6.0" is exactly the STX shorthand the owner asked us to translate.
3. **Raw Markdown on 24 programme pages.** The cut-off paragraph prints
   `([how totals convert](/denmark/ib-conversion/#average))` as literal text.
   The `ib-terms` guard does not catch this.
4. **Two Zealand programmes print an IB course as the "Danish requirement".**
   The line reads "Danish requirement: Mathematics: Applications and
   Interpretation SL". The IB line lists AA SL and AI SL only, so a Maths HL
   student reads it as not accepted. The engine does accept HL.

Fix 1 and 2 and this reaches 8. Fixes 3 and 4 are one-line fixes.

## Gate

- `$env:SITE_BASE='/IB-Post-Secondary-Opportunities'; node scripts/qa.mjs`:
  **all 31 checks pass**, and `ib-terms` passes. None of the four findings above
  trips a guard. `freshness` is advisory.
- `node src/build.mjs` with SITE_BASE unset: ok, 152 pages. The only warning is
  "dk-ucph: no programmes". I snapshotted the output to the scratchpad and served
  it locally for the planner and finder.

## Round-1 fixes, verified in dist/

| # | Fix (NOTES) | Verified | Note |
|---|---|---|---|
| 16 | Institution routes as data (AU GP; CBS table) | ✓ | AU card: "Global Politics HL, or Global Politics SL with Economics". Engine: GP HL alone meets AU CogSci "under Aarhus University's own rule". Other institutions still show "no IB route" with a reason that names AU, CBS and Copenhagen (SDU MMA, SDU EBA, RUC SocSci). |
| 17 | Minimum waived at A level | ✓ | ITU DS English, ITU GBI Maths and English, CBS BA&Soc Maths. Wording is right. |
| 18 | CBS English, one line | ✓ as encoded | But the line is incomplete (finding 1). |
| 19 | Non-subject options, dedupe | ✓ | BAAA card is clean. The BAAA programme page still reads "Any IB English (English C)" and then "one of: Any IB English (English B) / an English test". That is correct but redundant. VIA DTB has a one-item "And one of these". |
| 20 | "(1 other option needs a Danish-school subject)" | ✓ | Reads well. |
| 21 | Cut-offs in IB points | ✓ numbers | Markdown bug (finding 3). Sub-Diploma totals (below). The glance shows the Danish figure large and the IB points small, which is the wrong way round for this reader. |
| 22 | Contemporary History B ← History HL | ✓ | "History B or Contemporary History B → History (SL or HL)". |
| 23 | Clarity items | ✓ | "No minimum grade" is said once. The planner names the met option. The phone caption is fixed (checked at 375 px). The ab initio caveat is present. |
| 24 | Guard extended | ✓ | It passes, but it cannot see findings 3 and 4. |

## Correctness table

19 programmes at 9 institutions. 13 were not checked in round 1 (marked ★).
Official pages were fetched on 25 Sep 2026. Handbook = `data/ib-conversion.json`
subjectLevels, the Agency table.

| # | Programme | Site, IB terms | Handbook | University's own page (URL, quote) | Cut-off → IB | Verdict |
|---|---|---|---|---|---|---|
| 1 | AU Cognitive Science | Any IB English · Any IB Maths · one of History (SL/HL) / GP HL or GP SL+Econ / History of Ideas: no route | ✓ | bachelor.au.dk/en/international-applicants/moreinfo/international-baccalaureate-ib (rev. 21.08.2026): GP HL "Recognised as Social Science B"; SL "…in combination with Economics SL/HL" | 10.7 → 40 ✓ | ✓. Quota 1 6.0 floor not shown (finding 2) |
| 2 ★ | AU Data Science | Any IB English · Maths HL (AA or AI) · "No minimum grade is recorded" | ✓ | bachelor.au.dk/en/datascience: "minimum GPA of 6.0 and a minimum GPA of 6.0 in Mathematics A … to be assessed in quota 1"; "Quota 1: 11.2" | 11.2 → 42 ✓ | **Incomplete**: the quota 1 floors (28 pts; Maths HL 5) are hidden. Engine says "meets" for Maths HL 3 / 26 pts with no quota 1 warning |
| 3 ★ | AU IT Product Development | as 2 | ✓ | bachelor.au.dk/en/itproductdevelopment: "a minimum GPA of 6.0 in Mathematics A"; "Quota 1 2026: 10,1 (Standby: 6,9)" | 10.1 → 39 ✓ | as 2 |
| 4 | CBS International Business | English A (Lit or L&L) SL/HL or English B HL · Any IB Maths · one of … | ✓ | cbs.dk …/bsc-international-business: "Language requirement: A"; "Grade point average 2026: 11.1". cbs.dk …/application-and-admission: "You can only take a language test to fulfil the language requirement English level A if you have already passed English level B with a minimum grade of 6.0"; IELTS "overall score of at least 7.0 … 6.0 for each"; also Cambridge C1 185 / C2 200 | 11.1 → 42 ✓ | **Wrong**: omits the test route (finding 1) |
| 5 ★ | CBS Int. Business & Politics | as 4 | ✓ | cbs.dk …/bsc-international-business-and-politics: English "B with a minimum grade of 6.0", "Language requirement: A"; "History, Social Studies or International Economics"; "2026: 10.7" | 10.7 → 40 ✓ | **Wrong** as 4 |
| 6 ★ | CBS Int. Shipping & Trade | as 4 | ✓ | same CBS rule (application-and-admission) | 10.2 → 39 ✓ (not re-read) | **Wrong** as 4 |
| 7 ★ | CBS BA & Digital Management | as 4 | ✓ | same | 9.8 → 38 ✓ (not re-read) | **Wrong** as 4 |
| 8 | ITU Data Science | Maths HL, at least a 5 · Any IB English: 5 in English B SL, any grade otherwise | 6 → IB 5 ✓ | en.itu.dk …/data-science: Maths A "average mark of at least 6"; English B "at least 6" "(no grade requirement if you have passed English A-level)"; quota 1 "5.9" | 5.9 → 28 ✓ | ✓ (round-1 fix confirmed) |
| 9 | ITU Global Business Informatics | Maths: 5 at SL, any at HL · English likewise · Danish A (Lit or L&L), SL or HL | 6 → 5 ✓. Danish A SL is formally **Danish B** in the handbook; Danish A Lang & Lit has no handbook row | en.itu.dk …/global-business-informatics: "average mark of at least 6" with the A-level waiver; "Danish at A level is a requirement. No required mark but the subject must be passed"; "7.3" | 7.3 → 31 ✓ | ✓ for Maths and English. Danish SL rests on "normally accepted", which ITU has not stated; flag it as unverified |
| 10 ★ | AAU Chemical Eng. & Biotech | Any IB English · Maths HL, at least a 4 · Physics+Chemistry (+2 need Danish subject) | 4 → 4 ✓ | en.aau.dk …/chemicalengineering-biotechnology: "Mathematics A with a minimum grade of 4,0"; "Physics B and Chemistry B" / "Physics B and Biotechnology A" / "Geoscience A and Chemistry B"; quota "3.3" | 3.3 → **"21 IB points"** | Subjects ✓. **Misleading**: 21 is below the Diploma minimum of 24 (4.4), so any Diploma clears it. Say so |
| 11 ★ | AAU Applied Industrial Electronics | Any IB English · Maths HL at least 4 · Physics (SL/HL) / Geoscience A: no route | ✓ | en.aau.dk …/applied-industrial-electronics: "Mathematics A with a minimum average grade of 4.0"; "Physics B or Geoscience A"; "All Admitted"; "From 2027, the programme is restricted" | AO | ✓ |
| 12 ★ | SDU Computer Science (Vejle) | Any IB English · Maths HL (AA or AI) | ✓ | sdu.dk/en/uddannelse/bachelor/computer-science-vejle/adgangskrav: "English level B", "Mathematics level A"; "your GPA must be equivalent to 7.0 or higher"; "Required GPA in 2026: 7,8" | 7.8 → 33 ✓ | **Incomplete**: 7.0 floor (31 pts) absent from the site |
| 13 ★ | SDU Market & Mgmt Anthropology | Any IB English · Any IB Maths · History / SocSt: no route / HoI: no route | ✓ | sdu.dk …/market_management_anthropology/adgangskrav: "History level B or Social Sciences level B or History of Ideas level B or Contemporary History level B"; "7.0 or higher"; "Required GPA in 2026: 8,7" | 8.7 → 35 ✓ | Subjects ✓; floor absent |
| 14 ★ | SDU Software Engineering (Sønderborg) | Any IB English · Maths HL; "All qualified applicants accepted" | ✓ | sdu.dk …/softwareengineering-sb/adgangskrav: "your GPA must be equivalent to 7.0 or higher" | AO | **Misleading**: "all accepted" with no 31-point floor |
| 15 ★ | RUC Int. Social Sciences | Any IB English · Any IB Maths · History / … · "No minimum grade is recorded" | ✓ | ruc.dk/en/bachelor/international-bachelor-social-sciences-int: "6.0 on the Danish 7-point grading scale from your entry qualification" or "4.0 … in the subjects English and Mathematics". ruc.dk/adgangskvotienter-bachelor: "2026: 7,7" | 7.7 → 32 ✓ | **Wrong**: a hard minimum is missing. In IB terms: 28 points, or English + Maths averaging 4 (IB 4 = 4). Engine passes a 25-point student |
| 16 ★ | RUC Int. Natural Sciences | Any IB English · Maths HL · Physics+Chemistry / +Biotech (no route) / Chemistry+Geoscience (no route) | ✓ (Chem B+Bio A+Phys C folded into Phys+Chem, which is correct in IB terms) | ruc.dk/en/bachelor/international-bachelor-natural-sciences-int: four combinations as listed; adgangskvotienter: "2026: Alle optaget" | AO | ✓ |
| 17 | RUC Global Humanities | Any IB English · Another language … · History / HoI: no route | ✓ | ruc.dk/en/bachelor/bachelor-global-humanities-int: "beginner's language at Danish A-level or advanced language at Danish B-level"; adgangskvotienter "2026: 6,6" | 6.6 → 30 ✓ | ✓ |
| 18 ★ | Absalon Biotechnology BEng | Maths HL · Any IB English · Physics / Geoscience (no route) · Chemistry / Biotech (no route) | ✓ | en.phabsalon.dk/full-degree/bachelor-engineering-biotechnology: Maths "Danish A-level"; Physics B "OR" Geoscience A; Chemistry B "OR" Biotechnology A; English B | — | ✓ |
| 19 ★ | Zealand Cybersecurity | "one of: Mathematics: AI SL / Mathematics: AA SL"; "Danish requirement: Mathematics: Applications and Interpretation SL" | n/a (published in IB terms) | zealand.com/fuldtid/cybersecurity: IB "+ Mathematical Studies, standard level (SL)"; "English B-level is a specific requirement … cannot be replaced by English test" | — | **Rendering wrong** (finding 4). It should read "Any IB Maths", with no "Danish requirement" line |

Also checked without a fresh fetch, against the record's quoted wording:
- SEA Computer Science: Any IB Maths · Any IB English. s-e-a.dk: "Mathematic B (required…)"; IB holders "exempt from English testing". ✓
- Dania Cyber Security: eadania.com: "English at the Danish B-level", "Mathematics at the Danish B-level". ✓
- VIA Software Technology Engineering: en.via.dk: "min. average of 2.0", so IB 3. ✓

### Cut-off → IB points, and the 1.08 claim

- Every cut-off checked converts correctly against `data/ib-conversion.json`
  (Statistisk omregning 2026), using the lowest total whose value is ≥ the
  cut-off. 10.7→40, 11.1→42, 11.2→42, 10.1→39, 10.2→39, 9.8→38, 9.4→37, 9.2→36,
  8.7→35, 8.3→34, 8.2→34, 7.8→33, 7.7→32, 7.6→32, 7.5→32, 7.3→31, 6.9→30,
  6.6→30, 5.9→28, 10.6→40. The cut-off values match the official pages for AU
  DS, AU ITPD, CBS IB, CBS IBP, SDU CS, SDU MMA, RUC SocSci, RUC GH, ITU DS, ITU
  GBI and AAU Chem.
- **Below 24 points.** AAU Chemical Engineering's 3.3 shows as "21 IB points".
  No Diploma is below 24 (4.4). Print "any IB Diploma (24+) clears it" instead.
- **1.08 bonus: the claim holds.** I read retsinformation.dk/eli/lta/2026/288 in
  a browser. It is marked GÆLDENDE, "Adgangsbekendtgørelsen", in force 21 Feb 2026
  (§ 65), and contains no "1,08", "hurtig" or "bonus". § 17 stk. 2: the quotient
  is "1) eksamensgennemsnittet ifølge beviset for den adgangsgivende eksamen … eller
  2) eksamensgennemsnittet omregnet til 7-trins-skalaen for en eksamen fra en
  EU-medlemsstat eller en EØS-stat."
  - NOTES.md quotes stk. 2 without the "EU/EØS" clause. § 18 stk. 1 nr. 5 puts
    applicants whose exam is from outside the EU/EEA in quota 2. The site's
    audience rule (EU/EEA student at a school in Denmark) covers this, but the
    conversion page should say it in one line.
  - The same order, **§ 10**, is the legal basis for the grade floors in
    finding 2. Quoted: "Universitetet kan kræve, at ansøgeren har opnået mindst et
    bestemt gennemsnit … mindst en bestemt karakter i udvalgte fag"; stk. 3
    allows limiting a floor to quota 1.
  - Only university programmes show a numeric cut-off, so the academies'
    separate order does not matter for the IB-points line.
- Open question, not scored: DTU's page says "March 15 for Quota 2
  (international applicants)". If DTU puts IB holders in quota 2, its "40 IB
  points" line is the wrong comparison. Worth one email to DTU.

## Clarity (read as a 17-year-old, mostly non-Danish, IB student)

What works:

- AU cards: "Needs Any IB English · Maths HL (AA or AI)" and "Last cut-off 11.2
  · 42 IB points". A student can answer "can I?" in two seconds, and the GP
  route shows on the card.
- The programme page "What you need" section on a phone (CBS, 375 px): IB
  phrase bold, Danish form small, "No minimum grade" said once. Good hierarchy.
- The planner "why" lines teach the mapping: "Needs History (SL or HL): your
  History SL counts as History at B level."
- The conversion page opener ("levels of study, not grades … not the IB course
  English B … not English ab initio") is the sentence the owner asked for.

What still confuses:

1. **"No minimum grade is recorded" next to a programme that has one.** This
   happens on AU CS, Data Science and ITPD (Maths A 6.0 in quota 1) and RUC
   SocSci. The student believes it, and it is the most trusted-looking line on
   the page.
2. **"All qualified applicants accepted" at SDU** with a hidden 31-point quota 1
   floor. This is the single most dangerous line for a student at 27–30 points.
3. **CBS "Possible with action" names no action.** The student cannot tell that
   the action is an IELTS 7.0.
4. **The glance puts the Danish number big and the IB points small** ("11.1",
   then "42 IB points · 2026 intake" in small grey). For this reader, lead with
   "42 IB points" and put "(Danish 11.1)" second.
5. **The finder filter "No Mathematics A"** is STX shorthand in the IB tool
   itself. Use "No Maths HL needed".
6. **The planner summary chips speak Danish.** One Economics HL shows as
   "Business Economics A · Economics A · International Economics A". Either drop
   the chips or say "Your subjects count as: …" in a collapsible.
7. **The conversion page contradicts itself on Global Politics.** The levels
   table names the AU and CBS routes. "The awkward cases" still says "Do not
   assume it counts … write to the admissions office". Say: "Aarhus and CBS
   publish that it counts; elsewhere, write before 15 March."
8. **Zealand**: the "Danish requirement: Mathematics: Applications and
   Interpretation SL" line, and no "or HL".
9. **Minor.**
   - The BAAA programme page shows "Any IB English" twice (English C, then English
     B-or-test).
   - VIA DTB has a one-item "And one of these".
   - The conversion page lists Danish A as "SL or HL" while its own handbook table
     below maps Danish A Literature SL to Danish B.
   - On a phone, the levels table has 30 stacked cards, including "Asked for by —"
     rows no programme uses. Hide the unused rows.

## Top fixes, ranked

1. **CBS English test route.** Add a non-subject alternative to CBS's English A
   language requirement: "or English B at 6.0+ (IB 5 in English B SL) plus
   IELTS Academic 7.0 (6.0 each) / TOEFL iBT 5 (4.5 each) / Cambridge C1 185,
   C2 200". Quote from cbs.dk …/application-and-admission. Render it via
   `otherOf`. Have the engine name it as the action for English B SL ≥ 5, and add
   a scenario. Files: `data/opportunities/dk-cbs-*.json` (6),
   `data/dk/cbs.json`, `src/lib/eligibility.mjs`, `scripts/test-eligibility.mjs`.
2. **Grade floors as data, shown in IB terms.** Model the overall minimum average
   and the per-subject minimum as structured fields, with an optional quota
   scope. Today they are free text in `admission.selection`. Render them
   through `ibPointsFor` and the single-grade table:
   - "To be ranked in quota 1: at least 28 IB points, and a 5 in Maths HL" (AU
     CS/DS/ITPD).
   - "Quota 1: at least 31 IB points" (SDU, 14 programmes).
   - "Needs at least 28 points, or English + Maths averaging a 4" (RUC SocSci; a
     hard requirement, so the engine must grade it).

   Put the line in "What you need" and on the card beside the cut-off. Replace
   "No minimum grade is recorded" wherever a floor exists. Make the planner warn
   below the quota 1 floor ("quota 2 only"). Files:
   `schemas/opportunity.schema.json`, `data/opportunities/dk-au-*`,
   `dk-sdu-*`, `dk-ruc-international-bachelor-in-social-sciences-*`,
   `src/lib/eligibility.mjs`, `src/pages/components.mjs`,
   `src/pages/programme-facts.mjs`, `src/lib/primitives.mjs` (planner result).
3. **Markdown link in the cut-off paragraph.** In
   `src/pages/programme-facts.mjs:113`, either render links in `md()` or build
   the anchor as HTML. Extend `scripts/test-requirement-translation.mjs` (or
   `check`) to fail on `](/` in any built page.
4. **Cut-offs below the Diploma minimum.** When `ibPointsFor` returns under the
   entry award's minimum (24), print "any IB Diploma clears it". File:
   `src/lib/eligibility.mjs` `ibPointsFor` caller in `src/lib/canonical.mjs` /
   the templates.
5. **Requirements published in IB terms.** Don't print a "Danish requirement:"
   line for an `ib-subject` rule. Phrase an ib-subject at SL as "or higher", so
   Zealand reads "Any IB Maths". Files: `src/pages/components.mjs`
   (`requirementModel`), `src/lib/eligibility.mjs` (`ibTermsPhrase`).
6. **Clarity pass.**
   - Lead the glance with IB points (`src/pages/programme.mjs`).
   - Rename the finder's "No Mathematics A" to "No Maths HL needed"
     (`src/pages/programmes*.mjs`).
   - Fix the conversion page's Global Politics "awkward case" to agree with the
     levels table (`data/ib-conversion.json` or its template).
   - Add one line under the average table on § 17 stk. 2's EU/EEA scope and § 18
     (non-EU/EEA exam → quota 2).
   - Label the ITU GBI "Danish A, SL" route as "normally accepted, confirm with
     ITU".

Fixes 1 and 2 are what stand between this and an 8. With 3–5 as well, I would
repeat the site's answers to a student in a meeting.
