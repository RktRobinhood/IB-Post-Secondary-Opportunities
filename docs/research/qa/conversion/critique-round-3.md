# Conversion critique, round 3

Critic: an experienced IB Diploma coordinator who knows Danish admissions (KOT,
quota 1 and 2, the Agency's IB handbook). A fresh critic, not the round-1 or
round-2 critic and not the agent that did the work. Written 25 September 2026.

Judged:
- the **live site** (https://rktrobinhood.github.io/IB-Post-Secondary-Opportunities/),
  at 1280 px and 375 px;
- the round-2 fixes (NOTES.md decisions 25–33);
- 18 programme pages read on the live site and checked against the
  universities' own pages, all fetched today;
- the Agency's IB table, read in a browser from the Eksamenshåndbogen embed;
- five student profiles run through the live planner.

Evidence is in `round-3/`:
- screenshots `01`–`14b`, taken with headless Chrome from the live URLs;
- `planner-profiles.json` (the five profiles);
- `planner-verdicts.txt` (every Danish verdict the planner gave each profile);
- `text.json` (the visible text of each shot).

Note: `10-planner-p1-cbs.png` caught Maastricht's "International Business", not
CBS's. The CBS verdict is quoted in full below and is also in
`planner-verdicts.txt`.

**SCORE: 7 / 10.**

## Verdict

The facts are now right. All 18 programmes I checked match the university's
own page, and every IB-points figure matches the Agency's table exactly. The
CBS test route, the SDU, AU and RUC grade floors, the Markdown leak, the
Zealand line and the "any IB Diploma" cut-off all landed. I would repeat
nearly every line on a programme page to a student in a meeting. That is a
real change from round 2.

It is not an 8 yet, because the **planner** still says the reassuring thing
where the careful thing is true, and it rarely names the action it promises:

1. **A 27-point student sees a green "Meets published requirements" on SDU
   Software Engineering.** The line beside it says "All qualified applicants
   accepted". The floor warning is a "!" line at the bottom (`13-planner-p4-sdu-se.png`).
   - SDU's page: quota 1 needs "7.0 or higher". Quota 2 means applicants are
     "invited to participate in an entrance examination", and places go to
     "the applicants with the highest test scores".
   - So this student's only way in is to sit SDU's entrance test. The planner
     never says so. Its line "where more than your average counts" does not
     tell a student what to do.
   - This is round 2's most dangerous line. It is fixed on the programme page,
     not in the planner.
   - It affects 15 SDU programmes and 6 AU programmes, and the count at the top
     ("55 meet the published requirements" for 27 points) inflates to match.
2. **"Possible with action" usually names no action.**
   - CBS, English B SL 5: "✗ Your subjects do not meet this on their own. The
     other published way in: An English test … on top of English B at 6.0."
     It does not say which requirement is unmet (English A). It does not say
     that the student's 5 already clears the 6.0.
   - AU, SDU and ITU, Maths AI SL: it says what is missing (Maths HL) but not
     the fix, a supplementary Mathematics A course by 5 July or AU's summer
     course with conditional admission.
   - ITU Data Science, English B SL 4: no action at all.
   - A student cannot act on a verdict with no action in it.
3. **CBS cards are too long to scan.**
   - Desktop: 9 lines of "Needs" plus 5 lines of "Danish requirement".
   - Phone: about 16 plus 7 lines per card, six cards in a row (`02-cbs-card-grid-phone.png`).
   - English is split across two places: "Any IB English: at least a 5 in
     English B SL", then later "one of: English A … / an English test".
   - The CBS Social Studies route repeats History, Economics and Business
     Management, which are already listed as their own options.
   - At that length it is not acceptable (see Clarity).

Fix 1 and 2 and I would give this an 8. Fix 3 as well and it is comfortably
over.

## Round-2 top fixes, verified on the live site

| # | Round-2 fix | Live | Note |
|---|---|---|---|
| 1 | CBS English test route | ✓ | On all six CBS pages and cards, and in the planner ("Possible with action … An English test (IELTS Academic 7.0 or TOEFL iBT 5) on top of English B at 6.0"). English B SL 4 correctly does not qualify for the test route: P5's CBS results are in "not currently met". **But** the wording is Danish-grade ("English B at 6.0"), and the verdict does not name the unmet requirement (see Verdict 2). |
| 2 | Grade floors as data, in IB terms | ✓ facts / ◐ planner | AU DS: "Quota 1: at least 28 IB points and a 5 in Maths HL (AA or AI)". SDU: 31 (7.0), BEng 26 (5.0), EBA 31 (7.0 from 2027, as SDU announces). RUC Social Sciences: a hard one-of ("at least 28 IB points" / "English and Mathematics averaging 4.0 … a 4 in each is enough"), plus the quota 1 floor. "No minimum grade is recorded" is gone wherever a floor exists. In the planner the floor is a caveat under a green badge (Verdict 1). |
| 3 | Raw Markdown link | ✓ | No "](/" on any page I fetched (22 programme pages, AU/SDU institution pages, conversion page). |
| 4 | Cut-off below the Diploma minimum | ✓ | AAU Chemical Eng: "Any IB Diploma · Danish 3.3" (glance), "any IB Diploma clears it" (text and planner). |
| 5 | Requirements published in IB terms | ✓ | Zealand Cybersecurity and Architectural Technology: "Any IB Maths", no "Danish requirement" line. |
| 6a | Glance leads with IB points | ✓ | "42 IB points / Danish 11.2 · 2026 intake · not a prediction" (`08-au-ds-glance-desktop.png`). |
| 6b | Finder "No Mathematics A" → "No Maths HL needed" | ✗ | Still "No Mathematics A" live. Deferred in NOTES decision 32 (another agent's files). |
| 6c | Global Politics "awkward case" agrees with the levels table | ✓ | "Aarhus publishes … CBS lists … Anywhere else, write to the admissions office before 15 March". |
| 6d | § 17 EU/EEA scope and § 18 | ✓ | Present on the conversion page. Typo: "from an EU or EEA country ; § 18" (stray space). |
| 6e | ITU GBI Danish A SL flagged | ✓ | "At SL the handbook formally counts this as Danish B … Confirm with the university before you rely on it." |

## Grade conversion: checked against the Agency

I read the table in a browser at the Eksamenshåndbogen embed
(ufmembedlandedb…azurewebsites.net/?handbookId=3&countryId=269, tab
"Karakterer", "Senest redigeret: 23-01-2026", "Statistisk omregning 2026").

- **Averages.** The table goes "18 2,4 … 26 5,2 … 28 6,0 … 31 7,3 … 40 10,7 …
  45 12,7". Every row matches `data/ib-conversion.json` gradeAverage.table
  exactly.
- **Single grades.** The table goes "1 -3, 2 0, 3 2, 4 4, 5 7, 6 10, 7 12".
  This matches `singleGrade.table` exactly.
- **Floors.** 6.0 → 28 points. 7.0 → 31 points, because 30 = 6.9. 5.0 → 26
  points, because 25 = 4.7. The site prints 26 for the SDU BEng floor.
  NOTES decision 26 says "BEng 5.0 → 25", but the live site shows 26, which is
  correct. Fix the note.
- **Cut-offs.** 11.2 → 42, 9.4 → 37, 6.9 → 30, 7.6 → 32, 8.3 → 34 and
  7.7 → 32 are all right.
- **The Agency's own page is inconsistent.** Its heading says "gældende for
  sommeroptaget 2025" while the table is labelled "Statistisk omregning 2026".
  The site's "may move a decimal or two by 1 March 2027" covers this.

## Correctness: 18 programmes, 11 institutions

Fetched 25 Sep 2026. ★ = not checked in rounds 1–2 (12 of 18).

| # | Programme | Site, IB terms (live) | University's own page (URL, quote) | Floor / cut-off → IB | Verdict |
|---|---|---|---|---|---|
| 1 ★ | SDU Electronics BEng (Sønderborg) | Any IB English · Maths HL (AA or AI) · Physics (SL or HL) / Geoscience A: no route · Quota 1: 26 pts | sdu.dk/en/uddannelse/ingenioer/electronics/adgangskrav: "English level B", "Mathematics level A", "Physics B or Geoscience A"; "equivalent to 5.0 or higher"; 2026 "All qualified applicants accepted" | 5.0 → 26 ✓ | ✓ |
| 2 ★ | SDU Artificial Intelligence (Vejle) | Any IB English · Maths HL · Quota 1: 31 | …/artificial-intelligence-vejle/adgangskrav: "English level B", "Mathematics level A"; "7.0 or higher"; "Required GPA in 2026: 7,6" | 7.0 → 31 ✓; 7.6 → 32 ✓ | ✓ |
| 3 ★ | SDU Economics & Business Admin (Sønderborg) | … History / Econ or BM / Social Studies: no route / HoI: no route · Quota 1: 31 | …/ha-soenderborg/adgangskrav: "History … or Social Sciences … or History of Ideas … or Contemporary History … or International Economy level B"; "6.0 or higher", and "from 2027 onwards … the grade requirement for quota 1 will change to 7,0"; "Required GPA in 2026: 8,3" | 7.0 → 31 ✓ (2027 rule); 8.3 → 34 ✓ | ✓ |
| 4 ★ | SDU Interactive Technology Eng. (Vejle) | Any IB English · Maths HL · Physics / Geoscience A: no route · Quota 1: 31 | …/interactive-technology-engineering/adgangskrav: "Physics level B or Geoscience level A"; "7.0 or higher"; "All qualified applicants accepted" | 31 ✓ | ✓ |
| 5 ★ | SDU Mechanical Eng. BEng (Sønderborg) | 4 combinations: Phys+Chem / Phys+Biotech A / Geo A+Chem / Geo A+Biotech A · Quota 1: 26 | …/ingenioer/mechanical-engineering/adgangskrav: "Physics level B and Chemistry level C", "…Biotechnology level A", "Geoscience level A and Chemistry level C", "Geoscience level A and Biotechnology level A"; "5.0 or higher" | 26 ✓ | ✓ facts. Clarity: 3 of 4 boxes are dead ends, and the Geoscience paragraph is printed twice (`07-sdu-mech-beng-what-you-need-phone.png`) |
| 6 ★ | SDU Engineering, Innovation & Business | Any IB English · Maths HL · Physics / Geo A · Quota 1: 31 | …/innovation_and_business/adgangskrav: "Physics level B or Geoscience level A"; "7.0 or higher"; "All qualified applicants accepted" | 31 ✓ | ✓ |
| 7 | SDU Software Engineering (Sønderborg), re-check | Any IB English · Maths HL · Quota 1: 31; glance "Restricted / Quota 1: at least 31 IB points" | …/softwareengineering-sb/adgangskrav: "7.0 or higher"; quota 2 is an entrance examination, "You may choose to skip the entrance examination if you meet the minimum requirements for quota 1" | 31 ✓ | ✓ on the page. The glance label "Last cut-off: Restricted" does not read as a cut-off. **The planner is wrong in emphasis** (Verdict 1) |
| 8 ★ | AU Economics & Business Admin (Herning) | … History / GP HL or GP SL+Econ (AU's rule) / Econ or BM / HoI: no route · Quota 1: 28 · cut-off 30 pts | English page bachelor.au.dk/en/economics-and-business-administration-auhe (rev. 04.08.2026): **no floor stated**; "Quota 1 2026: 6,9". Danish page bachelor.au.dk/economics-and-business-administration-auhe: "Karakterkrav på mindst 6,0 i kvote 1" | 6.0 → 28 ✓; 6.9 → 30 ✓ | ✓ in substance. **Provenance fault**: the record's `officialWording` ("You must have a minimum GPA of 6.0 … to be assessed in quota 1", marked `en`, official) is the Aarhus EBA page's sentence. The Herning English page does not contain it. Quote the Danish page |
| 9 | AU Data Science, re-check | Any IB English · Maths HL · Quota 1: 28 pts and a 5 in Maths HL | bachelor.au.dk/en/datascience: "minimum GPA of 6.0 and a minimum GPA of 6.0 in Mathematics A … to be assessed in quota 1"; "Quota 1 2026: 11,2" | 28 ✓; Maths A 6.0 → IB 5 ✓; 11.2 → 42 ✓ | ✓ |
| 10 ★ | CBS BA & Service Management | English: 5 in English B SL, any grade at A · one of English A (SL/HL) or English B HL / test · Any IB Maths · one of … | cbs.dk …/application-and-admission: "English level B with a minimum grade of 6.0", "Mathematics level B", "History level B or International Economics level B or Social Studies level B or History of Ideas level B or Contemporary History level B", language requirement "English level A"; "If you have taken a subject at level A and passed it, this fulfils any grade requirement at B-level" | 9.4 → 37 ✓ (figure from a summarised fetch, not read word for word) | ✓ |
| 11 | CBS International Business, re-check | as 10 | same page. Test route sentence and IELTS 7.0/6.0, TOEFL 5/4.5 as quoted in NOTES round 2. Cambridge C1 185 / C2 200 "meet both" | 11.1 → 42 ✓ | ✓ facts. Wording (Verdict 2, 3). The Cambridge route is in the note only |
| 12 ★ | Absalon Robot Systems BEng | Maths HL · Any IB English · Physics / Geoscience A: no route | en.phabsalon.dk …/admission-requirements-bachelor-engineering-robot: "Mathematics equivalent to a Danish A-level", "Physics … B-level or Geoscience … A-level", "English equivalent to Danish B-level"; selection by exam results, experience, possibly "an admission interview or … a short video"; "not yet been finalised" | — | ✓ |
| 13 ★ | Royal Danish Academy, Crafts in Glass & Ceramics | one of: Any IB English / IELTS 6.5 · admission tests and portfolio shown | royaldanishacademy.com/en/crafts-requirements-rules: "IB English B (SL)", "IELTS Academic … 6.5 with a minimum score of 6,0 in each"; …/crafts-admission-professional-bachelor: "Intake is 100% quota 2 … two admission tests"; …/crafts-qualifying-exams-other-countries: IB "equivalent to a Danish 'stx'", "no further requirements … apart from English at level B" | — | ✓ |
| 14 ★ | SEA Multimedia Design (AP) | Any IB English · one of Any IB Maths / Econ or BM | s-e-a.dk/uddannelser/multimedia-design: "English level B plus either Maths or Managerial Economics level C or Business Economics level C"; later "Mathematic C (required for Multimedia Design)"; "Applicants holding … an International Baccalaureate exam … are exempt from the requirement" | — | ◐ The site requires "Any IB English", but SEA exempts IB holders from its English requirement. This is harmless for almost every reader, but it is stricter than the source. SEA's page contradicts itself on Maths C vs Business Economics C. No effect for Diploma holders, who all take Maths, but flag it |
| 15 ★ | VIA Architectural Tech. & Construction Mgmt | Any IB Maths, at least a 3 · one of: Any IB English at least a 3 / IELTS 6.5 | en.via.dk/programmes/bachelor/architectural-technology: "A C-level in Mathematics"; "min. average of 2.0"; english-proficiency-requirements: "Danish B-level with a minimum weighted grade point average score of 2.0", IELTS "6.5" | 02 → IB 3 ✓ | ✓ |
| 16 ★ | VIA Climate & Supply Engineering BEng | Maths HL ≥3 · Any IB English ≥3 · Physics / Geo A · Chemistry / Biotech A | en.via.dk …/climate-supply-engineering: "Mathematics … A-level", "Physics … B-level or Geoscience … A-level", "Chemistry … C-level or Biotechnology … A-level", "English … B-level", "min. average of 2.0"; english page: "An English proficiency test cannot replace English as a specific entry requirement" | — | ✓ (no test option shown, correctly) |
| 17 ★ | VIA Character Animation (TAW) | one of: Any IB English ≥3 / IELTS 6.5 · portfolio, test, interview | animationworkshop.via.dk …/step1: "English … Danish B-level with a minimum weighted grade point average score of 2.0", else a test; …/character-animation: "Admission to the programme is talent-based" | — | ✓ |
| 18 ★ | Zealand Architectural Tech. & Constr. Mgmt | Any IB Maths · one of: Any IB English / IELTS 6.5 | zealand.com/fuldtid/architectural-technology-and-construction-management/: IB + "Mathematical Studies, standard level (SL)"; zealand.com/admission-full-time-degree/: "English B or equivalent", "IELTS (Academic) … 6.5" | — | ✓ |

Also re-read today:
- **VIA Software Technology Eng. XR**: Maths A, Physics B / Geoscience A,
  English B, "min. average of 2.0", no Chemistry. ✓
- **Zealand Cybersecurity**: IB + Maths SL; English B "cannot be replaced by an
  English test". ✓
- **RUC Social Sciences**: ruc.dk/en/minimum-grade-requirements says quota 1
  is "6.0 … from your entry qualification" only, while quota 2 accepts 6.0 or
  "4.0 … in the subjects English and Mathematics", and "you will receive a
  rejection letter, regardless of whether there are fewer applicants". The site
  models exactly this. ✓

No wrong deadline, no wrong subject, no wrong conversion. The only data fault is
the AU Herning quote's provenance (#8).

## Planner: five profiles, live, EU/EEA, full Diploma

Full verdicts are in `round-3/planner-verdicts.txt`.

| Profile | Programme | Planner verdict and action | Right? |
|---|---|---|---|
| **P1**: English B SL 5, Maths AI SL 5, History HL 6, Econ HL 6, Biology SL 5, Language A HL 6; 34 pts | CBS International Business | "Possible with action." "✓ Needs Any IB English … your English B SL at 5 … converts to 7, at or above 6" and then "✗ Your subjects do not meet this on their own. The other published way in: An English test (IELTS Academic 7.0 or TOEFL iBT 5) on top of English B at 6.0." | **Verdict right. The action is half-named.** A tick and a cross for English in one card confuse. It does not say the unmet part is English A, that the student already has the "6.0", the 6.0-per-section band, or that the result must arrive by 5 July |
| P1 | AU Cognitive Science | "Meets published requirements"; "✓ Quota 1: Needs at least 28 IB points: your 34 points…"; cut-off "40 IB points" | Right on eligibility. It does not compare 34 with 40; the student has to do that |
| P1 | ITU Data Science / AU Computer Science | "Possible with action"; "This needs Maths HL (AA or AI). Your Mathematics: AI SL counts only as Mathematics at B level." | Right. **No action named** (a supplementary Mathematics A course) |
| **P2**: Maths AI SL 6, wants CS; English A L&L HL, CS HL, Physics HL; 36 pts | AU / SDU / ITU Computer Science and Data Science | All "Possible with action", with the Maths HL line; the AU cards add a quota 1 "!" | Right. Same missing action as P1. SEA Computer Science, Zealand/Dania Cybersecurity "Meets" (Maths B/C) are right, and a useful alternative. The planner does not point to them from the CS results |
| **P3**: Global Politics HL 7, English A Lit HL, Maths AA SL; 37 pts | AU Cognitive Science | "Meets": GP HL via Aarhus's own rule | ✓ |
| P3 | CBS (all six) | "Meets": English A meets the language requirement; GP counts as Social Studies under CBS's table | ✓, as encoded. The CBS table is still flagged "not re-read" |
| P3 | RUC Social Sciences / SDU EBA / AAU EBA | "Needs review"; "No IB subject is equivalent to Social Studies B … ask the admissions office in writing before 15 March." | ✓ Right, and it names the action. The paragraph is 70 words and lists Aarhus, CBS and Copenhagen rules in a card about RUC. Cut it to the last sentence |
| **P4**: 27 pts, Maths AA HL 4, English B HL 4, Physics HL 4 | SDU Software Engineering, Computer Science, AI, EIB, ITE, EBA | **"Meets published requirements"** (green), "All qualified applicants accepted"; last line "! Quota 1: Needs at least 31 IB points: your 27 points convert to 5.6, below 7.0 … you can still be admitted in the other quota" | **Wrong emphasis.** The only way in is quota 2, which at SDU is an entrance examination. It should read "Quota 2 only: sit SDU's entrance test" |
| P4 | SDU Electronics / Mechanical BEng | "Meets", no floor warning | ✓ (27 ≥ 26) |
| P4 | AU Computer Science / Data Science | "Meets", with two "!" lines (28 pts; Maths HL 5) | Eligible, yes. But the student is quota 2 only, twice over, against cut-offs of 42–43. Green is misleading |
| P4 | DTU General Engineering | "Meets", cut-off "40 IB points" | Eligible, but 27 against 40 with no comparison |
| P4 | AAU Chemical Eng | "Meets"; "3.3, which any IB Diploma clears" | ✓ |
| **P5**: English B SL 4, Maths AA HL 7, Physics HL 7, Chem HL 6; 38 pts (phone) | ITU Data Science | "Possible with action"; "Your English B SL at 4 converts to 4, below the 6 asked for." | Right that it is unmet. **No action.** ITU accepts no test for English B |
| P5 | CBS International Business | In "not currently met" | ✓ English B 6.0 fails, and CBS: "You cannot fulfil English level B with a language test" |
| P5 | AU CS / DTU / SDU | "Meets" | ✓ |

Summary: the engine grades correctly in every case I ran. What the student sees
does not always match the grade: a quota-2-only student gets green, and an
"action" verdict does not say what the action is.

## Clarity: can a 17-year-old tell at a glance whether they qualify and what to do?

What works:
- **SDU and AU cards on a phone** (`03-sdu-card-grid-phone.png`): "Needs Any IB
  English · Maths HL (AA or AI)" and "Quota 1: at least 31 IB points". Two
  lines, both in IB terms. That is the target.
- **The glance** leads with "42 IB points".
- **The RUC page** puts the hard minimum and the quota 1 floor in two
  plain-English boxes.
- **"What you need" on a phone** has a clear hierarchy: the IB phrase is bold
  and the Danish form is small.

What does not:
1. **CBS card length is not acceptable.** Nine lines on desktop is a paragraph,
   not a card. The phone is worse (`02-cbs-card-grid-phone.png`): about 23 lines
   per card, six cards that look the same, each reading as a wall. The brief
   says one line per block.
   - The five CBS "choices" are really two: English, and one social-science
     subject.
   - Suggested card line: "Needs English A or English B HL (or English B SL 5 +
     IELTS 7.0) · Any IB Maths · History, Economics, Business, Global Politics,
     Geography HL or Anthropology HL".
   - Drop the "Danish requirement" line from cards on a phone. Keep it on the
     programme page and behind "What this means in IB terms".
2. **English is split in two on CBS pages** (`04-cbs-ib-what-you-need-phone.png`).
   A box saying "Any IB English: at least a 5 in English B SL" is followed by
   "And one of these: English A … / An English test … on top of English B at
   6.0". The second half quietly overrides the first.
   - Make it one block: "English A or English B HL, any grade — or English B SL
     at 5+ plus IELTS Academic 7.0 (6.0 each) or TOEFL iBT 5".
   - Write "English B SL at 5+", not "English B at 6.0".
3. **"Quota 1" is jargon** to this reader. "Quota 1: at least 31 IB points"
   needs a second clause they can act on: "below that, SDU's entrance test
   (quota 2)" for SDU, or "below that, you are assessed on your subjects and
   application (quota 2)" for AU. "Where more than your average counts" says
   nothing.
4. **Dead options crowd programme pages.** SDU Mechanical BEng shows four boxes,
   three of them "no IB route", and repeats the Geoscience paragraph twice. VIA
   Climate & Supply and AAU Chemical Eng do the same. On pages, fold every
   no-route option into one muted line ("2 other options need Danish-school
   subjects: Biotechnology A, Geoscience A"), as the cards already do.
5. **The glance label "Last cut-off: Restricted / Quota 1: at least 31 IB
   points"** (`05-sdu-se-glance-phone.png`): "Restricted" is not a cut-off.
   Either label the cell "To get in" or print "All qualified admitted (2026) ·
   quota 1 needs 31+".
6. **The finder filter still says "No Mathematics A".**
7. Minor:
   - "from an EU or EEA country ; § 18" has a stray space.
   - The planner's Social Studies "?" paragraph is 70 words in every
     Social-Studies card.

Card length, directly: SDU and AU cards (2–4 lines) are acceptable. CBS cards
(~9 lines desktop, ~23 phone) are not.

## Top fixes, ranked

1. **Below a quota 1 floor, the planner must not show green.**
   - When `assessment.floors` has a miss, show a distinct state ("Quota 2
     only") in place of "Meets published requirements", and count it
     separately in the summary.
   - Replace "All qualified applicants accepted" with "All qualified quota 1
     applicants accepted (31+ points)" whenever a floor exists.
   - Name the quota 2 route per institution, as data on the Institution
     record (no country branch):
     - SDU: "SDU's entrance test (uniTEST) — quota 2, apply by 15 March".
     - AU: "assessed on your English/Maths average and application".
     - RUC: quota 2 accepts English + Maths averaging 4.0.
   - Add a scenario: 27 points against SDU Software Engineering must not be
     "yes".
   - Files: `src/lib/eligibility.mjs`, the planner result renderer
     (`src/lib/primitives.mjs` or the planner JS), `data/dk/*.json` or
     institution records, `scripts/test-eligibility.mjs`.
2. **Every "Possible with action" names the action.**
   - CBS: say the unmet part is English A. Say "your English B SL 5 already
     meets the 6.0". Give the scores (IELTS Academic 7.0, 6.0 each section /
     TOEFL iBT 5, 4.5 each / Cambridge C1 185 or C2 200) and the date ("result
     by 5 July, 12:00").
   - Maths A missing: "raise Maths to Danish A with a supplementary course
     before 5 July (AU also offers conditional admission with a summer course)".
     Take the text from the institution's own page and cite it.
   - Where no published action exists (ITU English B grade), say so: "No test
     replaces this; the grade must come from your Diploma", and use "Not
     currently met" rather than "Possible with action".
3. **Shorten CBS: one English block, then trim the card.**
   - Fold the English B minimum, the English A language requirement and the
     test route into one requirement line on page and card.
   - Dedupe the CBS Social Studies route against the History and Econ/BM
     options, so it shows only what it adds: Global Politics, Geography HL,
     Anthropology HL.
   - Drop the Danish-requirement line from cards on phones.
   - Target: at most 4 lines per CBS card on desktop.
4. **Fold dead options on programme pages** into one muted line, as on cards.
   SDU Mechanical BEng, VIA Climate & Supply, AAU Chemical Eng, SDU Electronics.
5. **Small corrections.**
   - AU Herning: re-quote the floor from the Danish page ("Karakterkrav på
     mindst 6,0 i kvote 1"), not the Aarhus English sentence.
   - SEA Multimedia Design: record the IB exemption from the English
     requirement, and flag SEA's own Maths C contradiction.
   - Rename the finder filter to "No Maths HL needed".
   - The glance cell "Last cut-off: Restricted".
   - NOTES decision 26 says 5.0 → 25; it is 26, and the site is right.
   - Remove the stray space before "; § 18".
   - In the planner, show "You: 34 · last cut-off: 40" beside each numeric
     cut-off.

Fixes 1 and 2 are what stand between this and an 8. With fix 3, a student
could read the CBS page on a phone in the time it takes to decide whether to
book an IELTS.
