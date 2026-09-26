# Netherlands school records (#43): admissions counsellor, round 1

Under review: the 17 records `data/schools/nl-*.json`, the Fontys section of
`docs/research/schools/reports/batch-nl-de-lu-is.md`, and the staging notes in
`docs/research/schools/.nl-staging/`. I checked them on 26 September 2026 against the institutions' own
pages, Studielink-era programme pages and the PDFs they publish. I used WebFetch and WebSearch only, with
no browser, and read PDFs with `pdftotext`. `progress.md` has no Netherlands section yet.

Pages I could not read:
- tilburguniversity.edu returns 403 to every scripted fetch;
- the UvA, AUAS, Hanze and VU programme lists load by script and came back empty.

I have not counted any of these against the records.

## Score: 8/10. Accepted, on condition that E1 and E2 are fixed before commit.

**No wrong deadline.** I re-checked about 60 date entries in 15 of the 17 records. Every date I could open
is right, including these:
- the 15 January numerus fixus deadline at eight institutions;
- the Studielink opening date of 1 October 2026;
- the 1 April / 1 May split between non-EU and EU applicants;
- the earlier institution deadlines (AUC, UCU and LUC on 1 December, UU PPE on 14 January, PPLE and AUC on
  1 February, LUC on 15 March);
- the selection-test dates.

The IB subject lines I could open are exact and name the strictest case. The TU/e, UU MBLS, AUC,
Radboud Biology, VU and THUAS tables all match the institutions' 2027-28 documents.

Both errors below are one-line fixes and need no further round of review:
- **E1** leaves out Leiden's main deadline, which covers 14 of its 17 programmes.
- **E2** under-states the German entry level for one RUG major.

## Errors

| # | Record | Field | What the record says | What the official page says | Source |
|---|---|---|---|---|---|
| E1 | nl-leiden | `dates` | Only two dates: "Applications open" on 1 Oct 2026 and "Numerus fixus programmes (IRO, Psychology)" closing 15 Jan 2027. None of the 14 programmes without numerus fixus has a closing date, and neither has LUC except on its programme. A student reading the page sees 15 January as Leiden's only deadline. | Deadlines page: "The application deadline is **1 May**. If you require a visa and/or residence permit to study in the Netherlands, the deadline is **1 April**." The Security Studies page ties the date to this intake: application "before 1 May" for "Academic year '27-'28", with matching "before 1 August 2027". | https://www.universiteitleiden.nl/en/education/admission-and-application/bachelors/application-deadlines · https://www.universiteitleiden.nl/en/education/study-programmes/bachelor/security-studies/admission-and-application/compulsory-matching |
| E2 | nl-rug | European Languages, Cultures and Politics › `ib` | "French, German and Spanish Plus majors need about A2 in that language" | French Plus: "(A2 level entry)". Spanish Plus: "(A2 level entry)". **German Plus: "(B1-B2 level entry)"**, via "VWO + German" or an A-level equivalent. A student with A2 German would think they qualify for German Plus. The strictest case is not named. | https://www.rug.nl/bachelors/european-languages-cultures-and-politics/?lang=en |

**How to fix them**

- **E1.** Add two dates, citing the Security Studies page for the year:
  - `2027-05-01`, closes, `eu-eea-ch`, "Programmes without numerus fixus (with matching)";
  - `2027-04-01`, closes, `non-eu`, "If you need a visa or residence permit".

  The researcher left these out because the general page prints no year. But Fontys, and in Germany
  Heidelberg, LMU, TUM and HSRW, all record yearless standing dates. Leiden's own 2027-28 programme pages
  also confirm the date.
- **E2.** "French and Spanish Plus need A2; German Plus needs B1–B2; Italian, Russian, Swedish and Dutch
  start from zero."

## Smaller points (fix when convenient, not blocking)

1. **nl-auas-hva › International Business `closes: 2027-05-01`.** The programme's enrolment page says
   "The application deadline for academic year 2027-2028 is 1 May 2027". AUAS's general how-to-apply page
   gives full-time programmes "Deadline: 31 August 2027", and 1 May 2027 only "for international students
   who need a study visa". The official pages disagree. Keep 1 May as the safe date, but add a note that
   the general page gives EU/EEA applicants until 31 August 2027, and cite both. The brief says never to
   resolve a conflict towards "you can't".
   - Sources: https://www.amsterdamuas.com/programmes/international-business/enrolment · https://www.amsterdamuas.com/study/international-admissions/how-to-apply/eu-and-international
2. **nl-hanze › open day 2027-02-13.** The date is right, but it is not on the cited Applied Computer
   Science page. That page lists only "21 Nov 2026" (on campus) and "04 Dec 2026" (online). Cite the event
   page instead: https://www.hanze.nl/en/events/study/events/2027/02/on-campus-open-day
3. **nl-vu-amsterdam › `ib`: "any IB maths for most others".**
   - Maths: VU's IB PDF lists "Required IB subjects: None" for Psychology, Communication Science, CADS,
     Political Science, the humanities programmes and Law in Society. Say "no maths requirement in the
     social sciences, humanities and law".
   - English: the same PDF also accepts an IB "completed with English A Language and Literature SL 7/HL 6
     or 7". The record gives only the English-taught route.
4. **nl-radboud › Biology `ib`.** The 2027-28 PDF says "Subjects from Group 6 (the Arts), will not be
   considered for admission purposes (HL nor SL), and must be replaced by a 2nd subject from the Science
   group (Group 4)". A student taking Visual Arts HL would miss this. Add it to Biology, and check the
   Chemistry, MLS and Natural Sciences PDFs for the same line. I read only the Biology one.
5. **Study in NL cited where the institution states the date itself.**
   - Rotterdam UAS: the International Business application page gives "31 Jul" (EU/EEA) and "1 April"
     (non-EEA).
   - UCR: the application page gives "Apply by May 1" and "Apply by April 1".
   - UU: the dates are on the programme pages too.

   The dates are right. Cite the institution's page. Keep Study in NL for Tilburg, whose own site blocked
   me.
6. **nl-vu-amsterdam › Psychology `ib`.** The online test has a pass mark: "A minimum score of 5.5/10 is
   required to pass". Worth adding.
7. **nl-auc › `apply.via`** says "AUC's online application form". The page says you apply "in SIS, the
   University of Amsterdam's online application portal".
8. **nl-tilburg › Psychology "250 English places".** I could not open Tilburg's site. Search results show
   250 as the 2026-27 figure. Label it "(2026-27)" unless the 2027-28 number is published.
9. **nl-fontys › 1 June.** The EEA page reads "Apply before **1 June**", which a careful student could
   take as 31 May. The programme timeline says "International students: 1 June". Recording 1 June is
   defensible, but "Apply by 1 June" in the label would match both pages.

## What I checked and found right

| Check | Scope | Result |
|---|---|---|
| **Dates** | 15 records, about 60 entries | **All correct.** Details follow this table. |
| **`ib` lines and subject rules** | TU/e, UU, AUC, Radboud, VU, THUAS, UCU, UCR, UvA, RUG, Hanze | Right apart from E2 and smaller points 3 and 4. Details follow this table. |
| **Programme completeness** | 8 lists | Complete and nothing extra. Details follow this table. |
| **Programme URLs** | About 25 opened | Each opens its own programme or track page, for example VU "Literature and Society (Track)… English" and UvA Sign Language Linguistics ("BA Linguistics", taught in English, NGT learnt in the programme). |
| **Credentials** | All 215 | No invented abbreviation: BSc, BA, BBA, LLB, BMus, "BA or BSc". Hanze Physiotherapy is "Bachelor of Science" (240 ECTS, 4 years) on its page. I did not open the DUO register behind the Fontys credentials. |
| **Summaries** | All 17 | ≤150 characters (longest 149, Rotterdam UAS). No unsourced ranking. TU/e's "all asking for Maths AA HL" is exactly what the TU/e PDF says. |
| **Local languages** | Leiden, UU, RUG, WUR, TU/e, Rotterdam UAS | Named where they apply: Leiden Dutch Studies, UU Linguistics' Dutch track, RUG's Dutch/English track choices, WUR's twelve Dutch-taught degrees, TU/e BME/MST, Rotterdam IB's language track. Fontys Physiotherapy and MIRT pages state no Dutch requirement, and the record states none. |
| **Fee status** | All school notes | Kept out of every school note. Tuition is the programme's own figure, and €2,771 is the 2027-28 statutory fee (TU/e: "2027-2028: € 2,771"). |
| **Hand-offs** | THUAS, Radboud, RUG, TU/e, Leiden | All bachelor's only. |

**Dates, record by record:**
- **AUAS:** 15 Jan 2027 numerus fixus; 1 May 2027 visa; AMFI "until 15 January"; Sport Studies Studielink "1 October 2026 and 15 January 2027", €130 sport medical exam; ESP 100 places, IELTS 6.5.
- **AUC:** 1 Dec 2026 and 1 Feb 2027 at 23:59 CET; decisions before 10 Feb and 10 Apr; the 1 May late deadline "announced in March 2027".
- **Fontys:** 1 June; housing 15 June; start 6 Sep 2027; EEA final deadline 15 Aug; Feb start 15 Nov.
  - Dance: Studielink 1 Mar 2027, material 4 Mar, auditions 19–22 Apr 2027.
  - Music: auditions 15–19 Mar and 24–28 May 2027, with uploads due 1 Mar and 1 May.
  - The Circus page's stale 2026 dates are flagged in the record, as they should be.
- **Hanze:** EU 15 Aug, non-EU 1 June. Physiotherapy: "before 15th of January", then a selection day on Wednesday 10 February. Mechanical Engineering "July 1st (EU)". Sport Studies "before 15 June".
- **Leiden:**
  - IRO: open 1 Oct 2026; close 15 Jan 2027 at 23:59; uSis 31 Jan; assessment 18–19 Feb 2027.
  - LUC: 1 Dec 2026 and 15 Mar. The page misprints "2026" for the regular deadline; the record correctly uses 2027.
- **Radboud:** open 1 Oct 2026; non-EU 1 Apr 2027; the housing lottery "by 1 May"; otherwise "up to and including 1 July"; Psychology 15 Jan 2027, 600 places, 60/40.
- **RUG:** 1 Oct 2026 – 15 Jan 2027; personal details by 15 Feb; ranking 15 Apr; proof by 15 July; 550 places (IB) and 250 (Psychology EN); €100 fee; History "01 May 2027". The early bird's "within 15 working days" matches the early-bird page.
- **TU/e:** 1 Oct 2026 – 15 Jan 2027; the four selection programmes; tests on 6, 13 and 20 March and a campus day on 3 April 2027.
- **UU:** PPE "14 January 2027, 23:59 hrs CET", 75 places. Pharmacy 15 Jan, 60 places, 1 March 2027 for applicants abroad.
- **UCU:** all six dates (1 Dec 2026, 1 Feb, 1 May, 1 June, 1 July, 31 July 2027).
- **UCR:** 1 May / 1 Apr / 1 Mar, from UCR's own page. The €300 deposit is right.
- **UvA:** 1 Apr (non-EU or housing) and 1 May 2027. Business Administration 650 places, tests on 17 and 27 Feb. EBE 850, tests on 20 Feb and 3 Mar. Political Science lottery, 345 places. Psychology 300 places, ranking on 15 Apr 2027. PPLE: 1 Feb at 23:59, exam on 27 Mar at 14:00–16:00. The IB route skips the file and fee for 15 programmes, with IBO sending results "no later than 31 August".
- **VU:** open 1 Oct 2026; 1 Apr / 1 May; numerus fixus 15 Jan; fees by 31 Aug, or 15 July for numerus fixus programmes. Psychology 600 places, test on 6 Mar 2027.
- **Tilburg:** 1 Apr / 1 May 2027, on Study in NL.
- **Rotterdam UAS:** 31 Jul / 1 Apr. WdKA opens "from 1 October 2026" and still shows the 2026 rounds, so "2027 not yet published" is right.
- **Published-date gaps left open correctly:** WUR (the page shows only September 2026: "Applications to start in September 2026 are closed") and THUAS (the page gives only 2025-26/2026 dates).

**`ib` lines and subject rules:**
- **TU/e:** the Required IB subjects PDF matches line for line. AA HL is required for all 13 English programmes. Physics HL is added for Applied Physics, Architecture, Automotive, EE, Industrial Design and Mechanical Engineering. For Chemical Engineering, Physics and Chemistry are needed with one at HL.
- **UU:**
  - EMI-advanced: "English A or B as final exam subject at either Standard or Higher Level".
  - MBLS: "Analysis & Approaches at Higher Level, Biology at Higher Level, Chemistry at Higher Level and Physics at Standard Level".
- **AUC:** the maths rules per major, including the lower bar with a STEM subject; "Predicted grades… are not accepted"; IB SL English grade 5 as alternative proof.
- **Radboud:** English A SL/HL 4 or English B HL 6. Biology: Bio and Chem HL; "A&I SL is not accepted"; 27 points excluding core; every grade 4.
- **VU:** the PDF's maths rows for EBE and IBA (AI SL 5), AI, Business Analytics, CS, Maths, Econometrics and PPE (31 points excluding TOK, EE and CAS).
- **THUAS:** the 2027-28 leaflet: "at least 6 academic IB courses… 3 courses at Higher Level (HL) > 12 points… at least 24… TOK… English as exam subject on HL".
- **UCU:** "at least 3 Higher Levels… Minimum of 32 points, excluding Theory of Knowledge and Extended Essay"; English Lang & Lit HL 6.
- **UCR:** "30 out of 42 points (excluding TOK, EE & CAS)"; "Not admissible are: IBCP, IB Certificates".
- **UvA:** Actuarial Science "Analysis and Approaches HL, with a minimum of 4 points".

**Programme completeness:**
- TU/e: 13 English of 16 listed.
- THUAS: 17 cards, which are 13 programmes with 4 dual tracks.
- Radboud: "Result 1 - 14 of 14".
- RUG: 34. The page also lists Philosophy of a Specific Discipline, which is not a first-year entry and is rightly left out.
- UU: 12 on the list, which is 10 plus UCU and UCR.
- Rotterdam UAS: 3.
- Leiden: 17. The filter's other results are LUC majors.
- VU: 19. The PDF also lists Ancient Studies and Archaeology, which the note sends to UvA.

## For the brief

- **A yearless standing date is still a date.** Where a programme page for the intake ties it to 2027-28,
  record it and cite that page. Don't drop it because the general page prints no year (E1). Apply the
  same rule in every country: Germany already records yearless standing dates.

## Summary

- Score: **8/10, accepted**, on condition that E1 and E2 are fixed before commit. No further round is needed.
- Errors: **2 material** (E1, an omitted main deadline at Leiden; E2, RUG German Plus understated) and **0 wrong deadlines**, plus 9 smaller points.
- Most important fix: **E1**. Add Leiden's 1 May 2027 (EU/EEA) and 1 April 2027 (visa) deadlines for its 14 programmes without numerus fixus.
