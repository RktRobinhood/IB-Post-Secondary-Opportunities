# Germany school records (#43): admissions counsellor, round 1

Under review: the 14 records `data/schools/de-*.json` and the German sections of
`docs/research/schools/reports/batch-nl-de-lu-is.md`. I checked them on 26 September 2026 against:
- the institutions' own pages;
- the KMK agreement on the IB Diploma (the English translation, with Appendix 1 as at 26/03/2026);
- the PDFs the institutions publish.

I used WebFetch and WebSearch only, with no browser. I read PDFs with `pdftotext`. `progress.md` has no
Germany section yet.

## Score: 7/10. Not yet.

**No deadline is wrong.** I re-checked every date in 12 of the 14 records against the official pages.
Every one is right, as is every "not yet published" note. The KMK rule, the Ikast-Brande and Grenaa
exception, and the IB-to-German-grade conversions are all right too.

What holds the round back is a pattern, not one slip. **Four programme cards leave out a step the student
must complete to get in or stay in.** In each case it is on the programme page the record cites:
- a portfolio assessment that decides admission (E1);
- pre-study internships of six to eight weeks at HSRW, TUM and WHU (E2–E4).

WHU's card even tells the student to "ask" when the internship is due. The cited page says: proof by
15 May 2027, and the internship finished before the start.

This is the class of omission the Finland round-2 review asked the next countries to watch for: "record
every submission a programme demands". Fix E1–E4 and this is an 8.

## Errors

| # | Record | Field | What the record says | What the official page says | Source |
|---|---|---|---|---|---|
| E1 | de-hsrw | Information and Communication Design › `ib` (absent) | Nothing: the card reads as open admission, apply by 15 July. | "Passing an aptitude test (portfolio assessment)" is required: "You can only be admitted to the degree programme if you pass the portfolio assessment **and** also apply via the application portal." HSRW's portfolio page (via search) gave 27 May 2026 for the 2026 round; the 2027 date is not yet confirmed. | https://www.hochschule-rhein-waal.de/en/information-and-communication-design-ba |
| E2 | de-hsrw | `ib` on International Business Administration, Mobility and Logistics, International Business and Management, Gender and Diversity, International Taxation and Law, Sustainable Tourism | Nothing about a placement. | IBA and Mobility and Logistics: "Proof of an eight-week pre-study internship by the time of Re-registration for a new semester". Gender and Diversity: "a pre-study placement lasting at least 8 weeks, to be submitted no later than the time of re-registration for a new semester". IBM: "proof of a pre-study placement lasting at least 8 weeks". ITL and Sustainable Tourism: at least 8 weeks, "no later than when you re-enrol for the 4th semester". | https://www.hochschule-rhein-waal.de/en/international-business-administration-ba (and /mobility-and-logistics-bsc, /gender-and-diversity-ba, /international-business-and-management-ba, /international-taxation-and-law-ba, /sustainable-tourism-ba) |
| E3 | de-tum | Aerospace › `ib` | "Needs a German certificate at A2 by the deadline (German B HL also counts). Aptitude assessment on grades, then an interview for some." | Also: applicants must provide "proof of a pre-study internship of at least eight weeks" by 31 October of the first year. | https://www.tum.de/en/studies/degree-programs/detail/aerospace-bachelor-of-science-bsc |
| E4 | de-whu | `notes[2]` and `dates` | "WHU lists a 6-week internship among its requirements…; ask when the six weeks must be done." There is no documents date and no opening date. | The cited application page answers it: "submit proof of your internship by May 15" (a provisional confirmation if the internship is still under way), and "The actual internships must be finished before the program starts". Also: "Application Period October 15, 2026 to May 15, 2027" / "Our online application portal will open on October 15!" | https://www.whu.edu/en/programs/bachelor-program/bachelor-in-international-business-administration/application-admissions/ |

**How to fix them**

- **E1.** On the ICD card: "Admission needs a passed portfolio assessment as well as the application (2026
  deadline 27 May; 2027 date not yet published)." Cite the programme page, and add HSRW's portfolio page
  to `sources` once it is re-opened. It returned 404 at the URL search gave me.
- **E2.** On each of the six cards, one clause: "8-week pre-study placement, proof due by re-registration
  for semester 2" (IBA, Mobility and Logistics, Gender and Diversity) or "by semester 4" (ITL,
  Sustainable Tourism). For IBM, give the deadline the page gives. Those are the programmes I opened. I
  also checked Engineering, Bioengineering, Agribusiness, Infotronic, Environment and Energy, and
  Nature-Inspired Materials, and none of them states a placement. Sustainable Agriculture only "strongly
  recommends" 8 weeks. I did not check Engineering for Sustainability or
  International Relations for a placement.
- **E3.** Add "8-week pre-study internship, proof by 31 Oct of year 1."
- **E4.** Add two dates:
  - `2027-05-15`, `documents`: "Proof of 6-week internship (provisional confirmation accepted)";
  - `2026-10-15`, `opens`.

  Rewrite the note as "a 6-week full-time internship, finished before the programme starts; proof due
  15 May 2027". The record has 6 dates, so both fit under the limit of 8.

## Smaller points (fix when convenient, not blocking)

1. **de-tum › `handoff`.** The Bachelor + English filter shows 7 results:
   - two of them are TUM Asia B.Eng degrees taught in Singapore (Chemical Engineering, Electronics and
     Data Engineering);
   - it leaves out three of the record's eight (Bioeconomy, SEMP, Information Engineering).

   The source title says so, but the student-facing label doesn't. Use "Bachelor's filtered to English
   (includes TUM Asia degrees in Singapore)".
2. **de-tum › `ib`.** "Each programme then ranks you on grades, then may interview" is not true of Geodesy,
   Bioeconomy or SEMP, where the aptitude check "is merely a recommendation". The programme cards say so.
   Make the institution line "most programmes".
3. **de-constructor › completeness and `handoff`.** The undergraduate page shows 20 programmes. The record
   has 19, and leaves out "Computer Science – Cyber Security Specialization (BSc)". The same page also
   lists four pre-degree (foundation) programmes.
   - If Cyber Security is a separate application, add it. If it is a CS track, say so on the CS card.
   - The hand-off label should not imply the page is bachelor's only.
4. **de-bcb › final deadline `who: "eu-eea-ch"`.** The page lists "EU/EEA citizens and residents of
   Australia, Brazil, Canada, …, the UK, and the US". Switzerland is not named, and the researcher flagged
   this. A Swiss student would read our record as covering them. Say "EU/EEA" in the label and note that
   Switzerland is not listed.
5. **de-bcb › Artistic Practice and Society, "Art samples required".** The programme page I opened does
   not say this. Add the page that does to `sources`.
6. **de-rwth › `summary`.** "Big" is unsourced, and "every bachelor's is taught in German" sits badly with
   the record's own note that Computer Science and Business Administration are partly taught in English.
   "RWTH's bachelor's all require German" is what the language PDF supports. **de-lmu › `summary`**:
   "large" is unsourced too (harmless).
7. **de-lmu › `ib`.** The claim "without your final IB certificate you need a recognition letter from
   Bavaria's ZAST" is not on the prerequisites page it cites. That page says only "you will first need to
   pass a recognized German language test". Cite the page that says it.
8. **de-heidelberg.** The English-programmes page lists American Studies (Bachelor 100%) and English
   Studies without any language caveat. The American Studies page says "English, German". The record's
   scope `none` is right in practice, because DSH 2 is required "at the latest for your registration if
   you are admitted to a Bachelor's degree programme". But `sources` should present this as a
   disagreement between two official pages, as the brief asks.

## What I checked and found right

| Check | Scope | Result |
|---|---|---|
| **Dates** | Every entry in 12 records | **All correct.** Details follow this table. |
| **`ib` lines and subject rules** | 12 records | Right apart from E1–E4 and smaller points 2 and 7. Details follow this table. |
| **Programme completeness** | 5 lists | Complete, apart from smaller point 3. Details follow this table. |
| **Programme URLs** | 15 opened | Each opens its own programme page: Constructor MDDA; Leuphana GESS ("taught entirely in English", 70 places); HSRW NIM, Agribusiness, Bioengineering, IR, IBM and ITL; TUM Aerospace, MDS, Geodesy and Bioeconomy; BCB APS; Frankfurt BBA and MPE. |
| **Credentials** | All 60 | Standard (BSc, BA, "BA or BSc (by major)"), and match the pages: Frankfurt "Bachelor of Science (BSc)", WHU "Bachelor of Science (BSc)", HSRW IBM and IR "Bachelor of Arts", Leuphana GESS "Bachelor of Science (B.Sc.)". |
| **Summaries** | All 14 | ≤150 characters (longest 150, LMU). Only RWTH's and LMU's size words are unsourced (smaller point 6). Heidelberg's "founded 1386" is a fact, not a ranking. |
| **Local languages** | Every `listed` record | Named where they apply: BCB's German by the end of year two, TUM's A2 German for Aerospace and Information Engineering, Leuphana Studium Individuale, Frankfurt's BBA English track, WHU's English track. |
| **Fee status** | All school notes | None. Constructor's "€640 enrolment fee for EU students" is the school's own fee, as its page states. |
| **Hand-offs** | Leuphana, Frankfurt, FU, Heidelberg, WHU | Leuphana (13 majors, bachelor's only), Frankfurt (6 bachelor's), FU (the programme itself), Heidelberg (first-semester applications), WHU (the programme). |

**Dates, record by record:**
- **BCB:** all six are right. Early Action 1 Nov with notification 31 Dec; Regular Decision 10 Jan, which is also the IDP Berlin registration; "IDP Berlin: February 6, 2027"; the final deadline 1 May with notification 1 June. "Bard College Berlin does not charge an application fee."
- **Constructor:**
  - Early Action "October 1, 2026 – February 1, 2027"; rolling admission to July 15, 2027.
  - "€11,925" a semester in 2027/28, "€350" in fees, "€640" enrolment fee, scholarships "up to € 10,000".
  - IB English A "6,7".
- **Frankfurt School:** "30 June 2027"; start "1 September 2027"; assessment-centre dates 21 Oct, 18 Nov and 10 Dec 2026. The MPE page's FAQ still says "September 1, 2025 through June 30, 2026". The record rightly follows the key-facts box.
- **Heidelberg:** "01.06. – 15.07." (restricted and entrance-exam programmes), "01.06. – 31.10." (unrestricted); deadlines falling on a weekend are "not… extended".
- **HSRW:** 15 July for the programmes I opened; 14 August for IBM and ITL.
- **Leuphana:** "from mid-May to 15 July 2027".
- **LMU:** "15 July for the winter semester (Deadline – receipt by LMU)".
- **TUM:**
  - "15.05. – 15.07." on the Aerospace, MDS, Geodesy and Bioeconomy pages.
  - The winter-semester fee is due "September 15" at first enrolment (CIT Information Engineering page).
  - Documents must reach uni-assist by the application deadline.
- **WHU:** all six round dates and test and interview days are right, and so are the fees of €75 (1 Feb – 31 Mar, voucher) and €150 (1 Apr – 15 May).
- **Year-specific deadline pages, rightly left without 2027 dates:**
  - UCF: "The application period is 1 June – 15 July", "The Application Period 2026 is over".
  - FU: "01.06.2026 – 15.07.2026" restricted.
  - RWTH: "open on May 4, 2026", "July 15, 2026".

  The 2026 dates in these records' notes are right and labelled as 2026.

**`ib` lines and subject rules:**
- **KMK agreement:**
  - The rules: six subjects in the set groups; one HL from language/maths/science "from exam year 2025"; "at least IB grade 4 in the six compulsory subjects", with a single 3 compensated by a 5 and 24 points.
  - The Maths SL footnote.
  - Appendix 1, Denmark: "Ikast-Brande Gymnasium… May 2022" and "Grenaa Gymnasium… May 2025". The TUM note is right.
- **The KMK conversion formula:**
  - 37 points gives 1.8, so FU's "grade quota 1.8 (about 37 IB points)" is right.
  - 33 points gives 2.5, so RWTH's "about 33" is right.
  - RWTH's 2.5 rule applies to "applicants who have citizenship of a country outside the EU or the European Economic Area".
- **Mannheim:** "German as Language A in the IB Diploma with a grade 6 or better"; TestDaF 4 in all parts; DSH 2.
- **TU Berlin:** "German language A at Standard Level or Higher Level or German language B at Higher Level, if German citizenship is additionally proven"; TestDaF 4-4-4-4.
- **Leuphana:** "IB Diploma with English as Language A at Higher Level with a final grade of at least 6.0"; IELTS 6.5; seven English majors of 13.
- **Frankfurt School:** "there is no numerus clausus (NC)"; "not required to submit an English certificate"; the assessment centre's four parts.
- **TUM:** "only for the Bachelor's programs in Aerospace and Information Engineering, 'German B (Higher Level)' is also accepted"; a screenshot from the IBO portal is accepted.
- **Freiburg:** English B2 by IELTS 5.5–6.5 or TOEFL iBT 72–94, or an entrance qualification "from a country that is genuinely anglophone". UCF's essay, motivation letter and orientation procedure; about 80 students; DoSV.
- **HSRW:** the English-proofs PDF: "IB-Diploma including the subject 'English' with at least 5 points" gives B2.
- **FU North American Studies:** IELTS "at least 7.0 and at least 6.0 in writing", TOEFL iBT "5.0", and the anglophone-school rule.
- **WHU:** "If you are graduating from an English-taught school… you may be exempt from an English test"; predicted grades accepted; TOEFL 95 / IELTS 7 / C1 Advanced grade C; €9,300 a semester; Global IB Scholarship "20% of the tuition fees".

**Programme completeness:**
- Leuphana: 7 of 7 English majors.
- Frankfurt School: 4 full-time English BSc. The 2 part-time German BAs are rightly excluded.
- TUM: 8. The filter's 7 results, minus the two Singapore degrees, plus Bioeconomy, SEMP and Information Engineering from their own pages.
- HSRW: 16. I did not re-count the filter, which loads by script, but every programme page I opened is English-taught, and the campus and deadline on each card match.
- Constructor: see smaller point 3.

## For the brief (carry to the next countries)

- **Read a programme's requirements box for pre-entry tasks**: internships, placements, portfolio or
  aptitude tests, self-assessments. These are common in Germany: Vorpraktikum at universities of applied
  sciences and TUM, internships at private business schools. They belong in the programme `ib` line with
  their due date. HSRW's Engineering for Sustainability card shows the right form: "Proof of the online
  self-assessment is required".
- **Never write "ask" when the cited page gives the answer.**

## Summary

- Score: **7/10, not yet.** No wrong deadline; the KMK, language and date work is accurate.
- Errors: **4 material omissions** (E1 HSRW ICD portfolio assessment; E2 HSRW 8-week pre-study placements on 6 programmes; E3 TUM Aerospace 8-week internship; E4 WHU internship proof due 15 May 2027 and opening date 15 Oct 2026) and **0 wrong deadlines**, plus 8 smaller points.
- Most important fix: **E1–E2 at HSRW**. Add the portfolio assessment to Information and Communication Design, and the 8-week pre-study placement to the six programmes that require it. Then re-check the three HSRW programmes I did not open.
