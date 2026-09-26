# Germany school records (#43): admissions counsellor, round 2

Under review: the 14 records `data/schools/de-*.json` as they stand after the round-1 fixes
("Round-1 fixes (NL, DE)" in `docs/research/schools/progress.md`). I checked them on 2026-09-26 against
the institutions' own pages and the KMK agreement (English translation, Appendix 1 as at 26/03/2026,
read with `pdftotext`). I used WebFetch and WebSearch only, with no browser. Every page I needed opened,
apart from TUM's semester-fee page (404 at the URL I tried). That did not matter, because the programme
pages carry the fee.

## Score: 7/10. Not yet.

**No deadline is wrong.** I re-checked every date in 10 of the 14 records against the official pages,
and each one is right. The four records with no dates (FU, Mannheim, RWTH, UCF) are still right to have
none: each page still shows only 2026 or winter 2026/27 dates. **Every round-1 error (E1–E4) and all
8 smaller points are fixed.** I checked each one against the page itself, not against the researcher's
quote.

What holds the round back is the same kind of omission round 1 named: a step the student must complete
to get in. This time it is at TUM, and partly an effect of round 1's own smaller point 2. Three TUM
cards (Bioeconomy, SEMP, Geodesy) tell the student that the aptitude check "is only a recommendation".
They leave out that taking part is compulsory. For Bioeconomy and SEMP it is an online test that must be
done and proved to complete the application. For Geodesy it is an interview, if TUM invites you. The
institution line now says "for a few the check is only advice".

A student who reads "only a recommendation" and skips the test sends an incomplete application. I would
not repeat those cards in a meeting as they stand. Four lines fix it. Then this is an 8.

## Errors

| # | Record | Field | What the record says | What the official page says | Source |
|---|---|---|---|---|---|
| E1a | de-tum | Sustainable Engineering for Materials and Processes › `ib` | "No language certificate; the aptitude check is only a recommendation and does not decide admission." | "participation in the test – and the corresponding proof – is mandatory for the application"; "the result of the online test has no influence on your eligibility for admission". The test is a 20-minute Moodle test, taken during the 15.05.–15.07. window. | https://www.tum.de/en/studies/degree-programs/detail/sustainable-engineering-for-materials-and-processes-bachelor-of-science-bsc |
| E1b | de-tum | Bioeconomy › `ib` | "…No language certificate; the aptitude check is only a recommendation." | "Participation in the test is a required part of the complete application"; "the result of the online test has no impact on your potential admission". The test takes about 15 minutes. | https://www.tum.de/en/studies/degree-programs/detail/bioeconomy-bachelor-of-science-bsc |
| E1c | de-tum | Geodesy and Earth Observation › `ib` | "Its aptitude check is only a recommendation: admission does not depend on it." | "The Aptitude Recommendation is a mandatory part of the application process… applicants are either immediately admitted, or invited to a mandatory interview." The result is "merely a recommendation". | https://www.tum.de/en/studies/degree-programs/detail/geodesy-and-earth-observation-bachelor-of-science-bsc |
| E1d | de-tum | `ib.text` | "Most programmes then rank you on grades and may interview; for a few the check is only advice." | As E1a–c: for those few, taking part is compulsory, and only the result is advice. | as above |

**How to fix it**
- **SEMP and Bioeconomy:** "You must take TUM's short online aptitude test and upload proof by 15 July; the score does not affect admission."
- **Geodesy:** "The aptitude check is compulsory (grades, then an interview if invited), but its result is only advice: admission does not depend on it."
- **Institution line:** "…for a few, taking part is compulsory but the result is only advice."

## Smaller points (fix when convenient, not blocking)

1. **de-lmu › `apply.via`** says "or MoveIN for some subjects". LMU's page names MoveIN only "For the
   Master's programs" (Art History, Biochemistry, Informatics…). A bachelor's applicant should never be
   sent there. Say "LMU International Office (application form)".
2. **de-leuphana › `ib`** says an "English-medium school" proves English. The page's wording is
   "Certificate from an English-speaking school that entitles the holder to study in the respective
   country". That means a school-leaving certificate from an English-speaking country. A student at an
   IB school in Denmark with English B would read our line as covering them. The safe route for them is
   "IB English A HL at 6" or IELTS 6.5. Quote the page's wording, or drop the clause. The page also says
   proof may follow "up until the start of the teaching period", which is worth one clause.
   - Source: https://www.leuphana.de/en/college/application/international-applications/requirements/language-proficiency/eng-maj2.html
3. **de-frankfurt-school › `notes[2]`** says "you also work at one of the school's industry partners".
   The page says "either with one of our cooperation partner or a company of your choice". The
   partner-company route (salary, part of the fees paid) is "For applicants with fluent German language
   skills". Say "you also work, at a partner company or one you choose".
4. **de-hsrw › Engineering for Sustainability** says "Proof of the online self-assessment is required."
   I could not find this on the programme page or on the faculty's page for the programme
   (`/en/faculties/technology-and-bionics/…/engineering`). Neither mentions a self-assessment. Cite the
   page that says it, or drop the clause. I have not counted it as an error: an unneeded extra step does
   not cost a student a place.
5. **de-whu › programme `ib`** does not mention the 6-week internship. It is in `notes[2]` and in the
   15 May `documents` date, so the page shows it. But round 1's brief note puts pre-entry tasks in the
   programme line with their due date. Add "6-week business internship, finished before 1 Sep 2027;
   proof by 15 May 2027."
6. **de-hsrw › `dates`.** The portfolio page gives the general application window as "2 May to 15 July".
   Like 15 July, it has no year, and it is the standing date. Consider adding an `opens` date to match the
   close. The waiting-list round begins "in late August or early September", not only "late August"
   (`notes[2]`).
7. **de-bcb › `ib`** paraphrases the KMK rule as "each at 4, 24 points". KMK 1(d) lets a single 3 be
   "compensated for if a minimum IB grade of 5 and a minimum total of 24 points have been obtained in
   another subject". The line leans towards "can't". Add "(one 3 can be offset)".

## What I checked and found right

**Round-1 errors, re-checked on the official page:**
- **E1, HSRW ICD:** fixed. The page says: "You can only be admitted to the degree programme if you pass
  the portfolio asessment **and** also apply via the application portal". The portfolio page says: "29
  January to 15 March"; "The deadline for submitting portfolios for the start of the 26/27 winter
  semester has passed"; the next period "will be announced here". The card now says exactly that, with
  no guessed 2027 date.
- **E2, HSRW placements:** fixed on all seven cards. Each clause matches its page:
  - IBA: "Proof of an eight-week pre-study internship by the time of Re-registration for a new
    semester". The card says semester 2.
  - Mobility and Logistics: the same wording, "placement".
  - Gender and Diversity: "no later than the time of re-registration for a new semester of study".
  - IBM: "no later than when you re-enrol for the 4th semester". The researcher was right to correct
    round 1 here.
  - ITL: the same as IBM.
  - Sustainable Tourism: "re-enrolment for the 4th semester".
  - International Relations (added): "by the time of re-enrolment for the 4th semester at the latest".
  - No other programme needs a placement. Agribusiness, Bioengineering, Engineering, Environment and
    Energy, Infotronic, NIM and Engineering for Sustainability state no pre-study placement. Sustainable
    Agriculture's "strongly recommends" is presented as a recommendation, which is right.
- **E3, TUM Aerospace:** fixed. The page says "proof of a pre-study internship of at least eight weeks",
  due by 31 October. An application without the proof is possible, with a later mandatory deadline.
  The card also keeps German A2 (German B HL accepted), "15.05. – 15.07." and the €97 fee.
- **E4, WHU:** fixed. The page says: "Applications from October 15, 2026 until May 15, 2027"; English
  test results and internship proof are due "May 15, 2027, at the latest"; the internship is "a total of
  six weeks" and "must be completed before the start of the program". There is no "ask" left.

**Round-1 smaller points, all fixed:**
1. TUM hand-off label: the filter still shows 7 results, 2 of them in Singapore, and the label now says so.
2. TUM institution line: now says "most programmes". But see E1d.
3. Constructor: 20 entries on the undergraduate page, one of them the Cybersecurity specialization. The
   specialization page says: "To apply for the Cybersecurity specialization, please select the
   Bachelor's program Computer Science". So 19 cards plus a note on the CS card is right.
4. BCB final deadline: the label now names the page's list, and says Switzerland is not listed.
5. BCB APS art samples: sourced. The page says APS applicants "are required to submit samples of their
   artistic practice digitally via the application form".
6. RWTH and LMU summaries: the size words are gone.
7. LMU ZAST: now cited on the applications page, which says "a recognition letter from the
   Zeugnisanerkennungsstelle für den Freistaat Bayern (ZAST)".
8. Heidelberg: both source titles state the disagreement. The English list marks American Studies and
   English Studies "yes*", with the footnote "DSH 2 … at the latest for your registration".

**Dates, re-checked in 10 records (every date in each; none wrong):**
- **BCB:**
  - Early Action 1 Nov, notification 31 Dec;
  - Regular Decision 10 Jan, which is also the IDP Berlin registration;
  - "IDP Berlin event: February 6, 2027";
  - the final deadline 1 May, with notification 1 June, for the named countries;
  - "does not charge an application fee".
- **Constructor:** Early Action "October 1, 2026 – February 1, 2027"; rolling "February 2, 2027 – July 15,
  2027"; decisions in 2–4 weeks.
- **Frankfurt School:**
  - "30 June 2027" on the BBA, BISE and AI & Data Engineering pages;
  - assessment centres 21 Oct, 18 Nov and 10 Dec 2026, "at least two weeks before";
  - fees of €100 and €600.
- **Heidelberg:** "01.06. – 15.07." (restricted and entrance-exam programmes); "01.06. – 31.10."
  (unrestricted); weekend deadlines "not extended".
- **HSRW:**
  - 15 July on Agribusiness, Bioengineering, Engineering, EfS, E&E, G&D, ICD, Infotronic, IBA, IR, M&L,
    NIM and Sustainable Tourism;
  - 14 August on IBM and ITL;
  - restricted and open status on the cards matches every page I opened. The seven restricted programmes
    are Bioengineering, EfS, Infotronic, IBA, IBM, IR and M&L.
- **Leuphana:** "from mid-May to 15 July 2027".
- **LMU:** "15 July for the winter semester (Deadline – receipt by LMU)".
- **TUM:**
  - "15.05. – 15.07." on Aerospace, MDS, M&T, SMT, SEMP, Bioeconomy and Geodesy;
  - the semester fee due "September 15" at first enrolment (CIT page);
  - "all required documents must be submitted to uni-assist by the application deadline".
- **WHU:** all 8 dates:
  - portal opens 15 Oct 2026;
  - Round 1: 31 Jan, 20–21 Feb, 12–14 Mar;
  - Round 2: 31 Mar, 17–18 Apr, 7–9 May;
  - Round 3: 15 May, 29–30 May, 19–20 Jun;
  - documents 15 May;
  - fees of €75 and €150.
- **No 2027 date yet, rightly none recorded:**
  - FU: "01.06.2026 – 15.07.2026";
  - Mannheim: "fall semester 2026/2027", 1 June – 15 July, and 31 August for the named Culture and
    Economy tracks;
  - RWTH: "open on May 4, 2026", 15 July 2026;
  - UCF: "The Application Period 2026 is over… amend them for 2027".

**`ib` lines and language rules:**
- **KMK, from the PDF:**
  - 1(b): one HL in a language, maths or a science;
  - 1(d): grade 4 in six subjects, and the single-3 compensation rule;
  - footnote 3: Maths AA or AI SL limits you to courses outside the mathematical, scientific and
    technical field, with the Appendix 1 and 2 schools excepted;
  - Appendix 1, Denmark: "Ikast-Brande Gymnasium … May 2022" and "Grenaa Gymnasium … May 2025".
  - TUM's note is right.
- **TUM languages:** "only for the Bachelor's programs in Aerospace and Information Engineering, 'German
  B (Higher Level)' is also accepted". A2 is required for Information Engineering, and "An industrial
  internship is not mandatory". M&T is taught in English and German except "The specialization in
  Computer Engineering", and needs "sufficient German or English". SMT has no certificate: an interview
  in English is the fallback.
- **The `none` records name the German requirement correctly:**
  - Mannheim: C1 via "TestDaF … level 4 or better in each of the four test parts", DSH 2 or telc C1
    Hochschule, proved by 15 July.
  - TU Berlin: DSH-2, TestDaF 4-4-4-4 or telc C1 Hochschule. IB German A (SL or HL) or German B HL
    counts "if German citizenship is additionally proven".
  - Heidelberg: DSH 2 at the latest by registration.
  - LMU: German proof, and its English-taught list is master's only.
  - RWTH: the 2026/27 page, with no 2027/28 dates.
- **Other `listed` records:**
  - Leuphana: "IB Diploma with English as Language A at Higher Level with a final grade of at least
    6.0"; IELTS 6.5. EU, EEA and Swiss nationals "can apply directly".
  - Constructor: IB English A at "6,7"; no SAT unless the diploma doesn't give German entry.
  - Frankfurt: "no numerus clausus"; no English certificate needed.
  - WHU: TOEFL 95, IELTS 7, C1 Advanced C; English-taught-school exemption; predicted grades; €9,300 a
    semester; Global IB Scholarship 20%.
  - FU NAS: C1 English; "A minimum of one semester of subject-related study abroad is obligatory".
  - UCF: essay, motivation letter, "Student Orientation Procedure", "about 80 students", DoSV.

**Pre-entry steps, programme by programme:**
- **Right:**
  - HSRW's portfolio and its eight placement lines;
  - TUM Aerospace;
  - WHU (note and date);
  - BCB APS art samples;
  - UCF's orientation procedure;
  - Frankfurt's assessment centre (institution `ib`).
- **Needs nothing:**
  - Constructor SDT: "prior programming experience" and no test;
  - Leuphana Digital Media: grades plus experience, no portfolio;
  - TUM MDS and SMT: their aptitude step is covered by the institution line.
- **Wrong:** only TUM Bioeconomy, SEMP and Geodesy (E1).

**Programme completeness, at 4 institutions:**
- Leuphana: 13 majors, 7 in English. All 7 are on the record.
- Frankfurt School: 6 bachelor's, 4 of them full-time in English. The two part-time German BAs are
  rightly left out.
- Constructor: 20 entries, less the CS track, gives 19.
- TUM: the filter's 7, less 2 in Singapore, plus Bioeconomy, SEMP and Information Engineering from
  their own pages, gives 8.

**Summaries:** all 14 are ≤150 characters (the longest is 145, Constructor). The three flagged words are
the pages' own:
- Mannheim: "currently only offers German-language bachelor's programs";
- TU Berlin: "German is required for all undergraduate degree programs";
- RWTH: the language PDF.

No superlatives or ranks. WHU's "two internships and a semester abroad" matches its page: "2, at least
one abroad".

## Three-line summary

- Score: 7/10, not yet. No deadline is wrong in 10 re-checked records, and every round-1 error and smaller point is fixed on the official page.
- Errors: 1, on four lines of de-tum. Bioeconomy, SEMP and Geodesy (and the institution line) call the aptitude check "only a recommendation", but taking part is compulsory: an online test with proof for Bioeconomy and SEMP, and an interview if invited for Geodesy.
- Most important fix: on those three TUM cards, and in TUM's `ib.text`, say that taking part in the aptitude step is compulsory and only its result is advice. Then this is an 8.

## Re-check of E1 (26 September)

I opened the three TUM programme pages cited in `de-tum.json` again and compared the four lines.

- **E1a, SEMP › `ib`:** now reads "No language certificate. The online aptitude test is compulsory (upload proof); only its result is advice."
  - Page: "participation in the test – and the corresponding proof – is mandatory for the application"; "the result of the online test has no influence on your eligibility for admission". It also says you "must upload the proof of participation". **Fixed.**
- **E1b, Bioeconomy › `ib`:** now reads "Mainly English, but some modules may be offered in German only. No language certificate. The online aptitude test is compulsory (upload proof); only its result is advice."
  - Page: "participation in the test is a required part of the complete application"; "the result of the online test has no impact on your potential admission". The language wording matches the page too. **Fixed.**
  - Small point: the page I fetched does not mention uploading proof for Bioeconomy (SEMP's page does). This is not wrong, because proof of taking part is how the test is shown. Say "take part" if the proof wording cannot be found.
- **E1c, Geodesy › `ib`:** now reads "No language certificate. The aptitude process is compulsory, with an interview if invited."
  - Page: "The Aptitude Recommendation is a mandatory part of the application process… applicants are either immediately admitted, or invited to a mandatory interview"; the result "is merely a recommendation". **Fixed.** The line does not say the result is only advice, but nothing in it is wrong.
- **E1d, TUM `ib.text`:** now reads "…Most programmes rank on grades and may interview; a few add a compulsory aptitude test whose result is advice."
  - Page wording: the same as E1a–c. **Fixed.** For Geodesy, the "test" is a points check plus an interview, so the word is loose but not misleading.

No new errors on the three pages.

## Score after re-check: 8/10
