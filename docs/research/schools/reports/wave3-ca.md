# Wave 3 report: Canada (ca), 7 Oct 2026

All records `catalogue`. Dates are retrieved 2026-10-07.

## ca-u-of-t
- 2 flagships (Computer Science St. George, Engineering Science), 4 faculties/divisions, courses 700 ("over 700").
- Dates from future.utoronto.ca/deadlines: 7 Nov early, 15 Jan close, 1 Dec / 1 Feb documents (Engineering and Music documents 15 Jan).
- No international tuition published (fees page: "finalized in the spring"); tuitionEuEea left out.
- Arts & Science IB page is behind a bot check (unreadable); faculty entry uses the university IB page. OUAC site returns 403 to automation: OUAC dates not read; apply cited to U of T timeline page.
- CS St. George requires a supplemental application (programme page); IB prerequisite detail from the university IB page.
## ca-ubc
- 2 flagships (Computer Science BSc Vancouver, Commerce/Sauder), 4 faculties (Applied Science, Arts, Science, Sauder). Other first-year faculties (Forestry, Land and Food Systems, Kinesiology, Education, Music, Nursing, Design) not listed.
- Dates from you.ubc.ca/applying-ubc/dates-deadlines: 15 Nov International Scholars, 15 Jan close, 15 Mar documents, 25 Jul final transcript (all outside-Canada rows).
- Tuition CAD 53,082 (Science) and 66,678.30 (Commerce), 2026/27 rate for a student starting 2026/27; 2027/28 rate not published.
- UBC's IB requirements page loads its table dynamically; subjects and 24-point floor read from the Vancouver calendar IB page and programme pages. Sauder's own site returns 403, so Commerce data comes from you.ubc.ca/programs/commerce.
## ca-mcgill
- 2 flagships (Mechanical Engineering BEng, Bachelor of Commerce/Desautels), 9 faculties. No programme count published.
- Dates: 15 Jan 2027 (McGill Important Dates page, "Friday, January 15, 2027"); documents 1 March from the IB page (page gives no year; current-cycle page, "Application opens October 1").
- Tuition from McGill's 2026-27 international PDF (tuition line, per programme): BEng 65,167.50; BCom 71,687.40; BA 54,000; BSc 64,785.90. Student fees and health insurance extra.
- French: not a general requirement; Nursing needs proof of French proficiency (IB page); IB English A 5+ waives the English test (english-proficiency page).
- Handoff /undergraduate-admissions/programs is the page the site's nav links to, but it returns a WAF block to curl and WebFetch (could not read it). McGill Engineering faculty pages return 403 or access-denied; programme pages under /undergraduate-admissions/program/ read fine.
- Admitted ranges ("subject points out of 42") are a guideline on McGill's page, not a minimum; points field left out.
## ca-waterloo
- 2 flagships (Computer Science, Software Engineering), 5 faculties (Mathematics, Engineering, Science, Health, Arts). Faculty of Environment not listed (no IB page found in 2 attempts). courses 100 ("100+ programs").
- Dates (uwaterloo.ca/future-students/admissions/deadlines): 1 Feb 2027 / docs 15 Feb 2027 for non-Engineering; Engineering 15 Jan / 1 Feb 2027 (scoped to Software Engineering). Page says international students have the same deadlines.
- Tuition = Waterloo's "estimated tuition and incidental fees for two terms" for international students starting Sept 2026: CS CAD 73,000; Software Engineering 75,000.
- Conflict: a search summary said Computer Engineering/Software Engineering total 32; the pages say 31 (used pages).
- OUAC site itself not opened (403 to automation); Waterloo's how-to-apply page cited.
## ca-queen-s
- 2 flagships (Commerce, Engineering), 5 faculties. Third candidate (Computing) not added.
- Dates from queensu.ca/admission/applying/dates-deadlines: opens 1 Oct 2026, close 1 Mar 2027 (most programs), documents 31 Mar 2027; Commerce 1 Feb / supplementary 15 Feb (also Health Sciences, Nursing close 1 Feb).
- Tuition 2026-2027 table (registrar): Commerce yrs 1-2 CAD 60,839.46; Engineering 59,283.74; Arts and Science 44,809.80; Computing 54,808.20.
- Handoff is the IB requirements-by-program page (no standalone course search page found; queensu.ca/admission home and /about/facts-figures gave 404 or no facts).
- Queen's summary says "first-year residence guarantee" from the Engineering admission page; the country record's "very high first-year residence rate" is not stated by a page I read.
## ca-mcmaster
- 2 flagships (Engineering, Honours Health Sciences), 6 faculties. courses 45 ("45 direct-entry undergraduate programs").
- No general application deadline: McMaster's Dates and Deadlines is a JS search tool that returns nothing to automation; no static page gives it. School-level Apply-by left empty. Published dates recorded: Engineering supplementary 28 Jan 2027 (recommended 26 Nov 2026); Arts & Science 1 Feb 2027, Honours Health Sciences "early/mid-February 2027" (not recorded, no day).
- No international tuition: McMaster's fee schedule is a PDF/tool, cost estimator needs a form. tuitionEuEea left out.
- No IB subject/grade table: the Admission Requirements tool is a form; programme `needs` left out. The 90% Health Sciences average appears only in a search snippet from hhsp.healthsci.mcmaster.ca (403 to me), so not recorded.
- Conflict with country record: it says McMaster has no IB page; future.mcmaster.ca/apply/curriculum-requirements/ has an IB section (six subjects, bonus counted out of 45, predicted grades).
## ca-western
- 2 flagships (Medical Sciences, Engineering), 7 faculties/areas. courses 450 ("450 undergraduate majors, minors and specializations").
- Dates (welcome.uwo.ca Note Your Deadlines): "OUAC application for equal consideration ... January 15" 2027; Engineering last Casper test 2 Mar 2027. Western's page does not state a separate international deadline.
- Tuition: no per-programme figure; Western's costs page gives "year 1 international tuition and fees $48,000 to $64,400" (2025-26 rates) with 4% annual cap after year 1: recorded as a note, tuitionEuEea left out on programmes.
- IB table is explicit (27 incl. EE/TOK, no mark below 4, required courses per program). Ontario admission-average guidelines for Medical Sciences/Engineering are Ontario percentages with no IB conversion; not recorded as points.
- Ivey HBA is second-entry (via AEO), not listed as a flagship.
## ca-ualberta
- 2 flagships (Computing Science, Engineering), 6 faculties. courses 200 ("more than 200 program options"). ualberta.ca returns CloudFront 403 to curl for HTML (the subject-requirements PDF downloaded fine); read through WebFetch.
- Dates (dates-deadlines index): opens 1 Oct 2026, close 1 Mar 2027 "for most programs", residence guarantee 30 Apr 2027, documents 1 Aug 2027. Per-programme deadlines sit behind a faculty filter and could not be read.
- IB: page says competitive diplomas 30-37, no grade below 4, five required subjects, IB-to-percentage table; subject lists from U of A's "undergraduateprogramsubjectrequirements.pdf" with the IB equivalence page.
- Tuition: no dollar figure on a page I could read (cost calculator is a tool). Verified only the percentages: +5.5% for Fall 2027 new international students (approved 27 Mar 2026), +26% for Computing Science. tuitionEuEea left out.
- Handoff /undergraduate-programs/index.html is a gateway (quiz, finder), not a list.
## ca-ucalgary
- 2 flagships (Engineering common first year, Commerce/Haskayne), 10 faculties. Calgary's own IB guide (ib-onepager.pdf) gives per-faculty subjects and "estimated competitive IB score".
- Dates from the "Dates and deadlines" page: international application opens Aug. 15; fall application deadline Mar. 1; documents Mar. 15; residence guarantee May 1. The page prints no year (it is the live fall-intake page); a search snippet that said April 1/April 15 for international applicants is NOT on the page I read.
- Tuition: per 3-unit course 2026-27 from the calendar (P.1.1): Schulich 4,148.73, Haskayne 3,610.44, most faculties 3,078.21; I multiplied by the 10 courses of a full year (first-year engineering is "10 courses" per Schulich page) for the programme lines.
- Conflict with country record: ibPageUrl is the calendar A.5.2.3 (three HL, no grade below 3); the one-pager is the page with subjects.
- Faculty count: facts page says "13 faculties", a search snippet "14"; not used.
## ca-sfu
- 2 flagships (Computing Science, Interactive Arts and Technology at Surrey), 8 faculties. Beedie business page opened but no BBA programme page with IB details beyond the IB table; not a flagship.
- Dates (Fall 2027 Term page, "Applications open: October 1, 2026 / Application deadline: January 31, 2027"): documents 28 Feb 2027, Undergraduate Scholars Entrance Scholarship closes 15 Dec 2026, residence/offer acceptance 1 May 2027. Applications via EducationPlannerBC (stated on the dates page).
- Tuition: CAD 38,944 is SFU's own 2026/27 "tuition and fees (includes public transit pass)" estimate for 10 courses, international, Arts/Science typical programme.
- No IB point minimum published (page says "Predicted bonus points are not used"); no points field. "Admission grade ranges" page returned 404 at the URL I tried.
- Summary avoids student counts: the 29,190 undergraduates figure appears only in a search snippet, not a page I opened. "Opened in 1965" is from the search snippet of SFU's history page; country record says founded 1965.
- Country record said "trimester system" / "easier to enter than UBC": no page I read states either; not used.
## ca-uvic
- 2 flagships (Engineering, Computer Science), 6 faculties (each from a programme page with its IB line). UVic's programme pages give "Estimated IB score" per programme (excluding bonus points), plus subject minima: recorded as `points` on the two flagships.
- Dates: UVic's application-deadlines page gives "Most degree programs: January 31" without a year (annual fixed dates); recorded as 2027-01-31. Early admission "by early December" has no day.
- Tuition: UVic's Engineering and Computer Science guide PDF, sample first-year international fees (May 2026 to January 2027 rates): Engineering CAD 47,225; Computer Science 40,841. Commerce 37,575 appears only in a search summary, not recorded.
- UVic's own IB page (info-for/international-baccalaureate-ib-students) has no requirements, only transfer credit/scholarships; requirements sit on the programme pages. Country record's note that UVic is "compact, you can walk across it in ten minutes" not verified; not used.
## ca-dal
- 2 flagships (Marine Biology BSc/BA, Computer Science BCS), 5 faculty/programme-group lines. courses 300 ("300+ degree programs").
- Dates (dates-and-deadlines page): no general close ("where space is available" for most programs; noDeadline set). Health programmes (Nursing, Health Sciences, Medical Sciences, Social Work) 15 Feb 2027, Environmental Design Studies 1 Mar 2027 (in faculty lines only, no flagship takes them); entrance scholarship 15 Feb 2027; guaranteed residence 15 May 2027.
- IB: "at least 26 points (including bonus points)" from the IB page; subject equivalences (English SL/HL, Maths AA or AI SL/HL) from the same page. Programme percentage minimums are Nova Scotia-style and are not converted to IB.
- Tuition 2026/27 international guaranteed annual: Science 37,992, Computer Science 41,688, Engineering 48,594, Management 42,042 (international-tuition-guarantee page; the page says "entering Fall 2026 or Fall 2027" per the tool summary, the international-applicants page says "entering Dalhousie in 2026 - 27"). 2027/28 rates not seen.
- Ocean Sciences programme page URL from a search result now returns 404; not used.
## ca-uottawa
- 2 flagships (Telfer BCom, Political Science Honours BSocSc), 6 faculties. courses 350 ("more than 350 undergraduate programs").
- IB-specific page /study/undergraduate-studies/program-prerequisites/admission-requirements-international-applicants returns 403 to curl and 402 to WebFetch, and no other readable uOttawa page gives IB averages. ib line says only that the Diploma counts as the Ontario diploma equivalent (Telfer FAQ: "diploma equivalent to the Ontario Secondary School Diploma (OSSD)"); no points, no IB conversions. The country record's "uOttawa 29 points" is not on any page I could read.
- Dates (application-deadlines page): opens 17 Sep 2026; "we recommend that you submit your application before January 15, 2027"; requirements by 15 Feb 2027 or 30 days after applying; "International applicants: Most programs close in May" (no day) so noDeadline is set, no 'closes' date.
- Tuition: the 2026-27 fees example is for an unspecified programme (tuition CAD 31,582.15 a term; total CAD 65,165.81 for two terms); a search summary quoted CAD 24,200 a term from the tuition table, which I could not read (JS tables). tuitionEuEea left out; the 65,165.81 example is in notes.
- Language: bilingual; English proficiency exemption rule on the language-requirements page; no French required for English-taught programmes.
## ca-concordia
- 2 flagships (Commerce at John Molson, Film Production BFA), 4 faculties. No `courses` count: the only figure found mixes graduate and undergraduate programs.
- IB: Concordia admits IB Diploma applicants to the 120-credit Extended Credit Program (4 years); subject rules table (Maths for BComm/BCompSc/BSc/BEng) on the international requirements page; John Molson: "predicted score of 29 points as well as a predicted grade of 5 in SL or 4 in HL mathematics". No school-wide minimum points is published.
- Dates: apply page says "Deadline: March 1 ... U.S. and international applicants: Apply no later than February 1" with NO year (as the country record notes). I recorded 2027-02-01 as the international close. Film Production: "Fall 2027 Deadline: March 1st, 2027" is explicit (Cinema apply page).
- Tuition per credit (Fall 2026): Arts and Science 1,160, Gina Cody 1,285, John Molson 1,400: from the search result for concordia.ca/students/financial/tuition-fees/rates/undergrad.html; the international table does not render without a browser, so I did not multiply it to a year.
- French: English-language; no French admission requirement on the pages read. Quebec's CAQ is not mentioned on the Concordia pages I read (country record covers it).
## ca-york
- 3 flagships (Engineering, Business Administration BBA at Schulich, Computer Science), 6 faculties/schools. No `courses` count (only a search snippet says "150 programs").
- Dates (registrar.yorku.ca/requirements/deadlines): Fall 2027 International Students "March 24, 2027" (most programs); Schulich BBA "will not accept applications after the January 15 deadline" with supplementary 1 Feb 2027. Applications via OUAC (how-to-apply page states OUAC is the route).
- IB: program pages give "minimum IB diploma point scores" (Engineering 30, Computer Science 30, BBA 36, Global Health 28, Kinesiology 28) and subjects; six passes (3 SL + 3 HL, or 2 SL + 4 HL). Country record says "most programmes ask for 28 IB points": true for some, not for Engineering/CS/BBA.
- Tuition 2026-27 approximate annual (York tuition page): Most programs 40,000; Business 40,000-44,000; Computer Science 38,000; Engineering 47,000 (36 credits); a search snippet quoted exact figures (Engineering 49,727), not on the page I read.
- Summary avoids student numbers; the 53,000 figure is only a search snippet.
## ca-tmu
- 2 flagships (Mechatronics Engineering, Journalism), 6 faculties. courses 60 ("60+ undergraduate programs").
- IB (international requirements page): "grades of 4 or higher in 3 Higher Level and 3 Standard Level subjects ... total score of 28 or higher (bonus points will be accepted)"; predicted: "bonus points will not be considered". Matches the country record's 28.
- Dates: "Guaranteed consideration date: February 1, 2027" (TMU Global how-to-apply page); programmes may close earlier. Applications: TMU International Application (CAD 150) or OUAC; the OUAC route is required for international students at Ontario secondary schools.
- Tuition 2026-27 international, by faculty (admissions tuition page): Engineering and Architectural Science 44,375-44,675; Creative School 38,733-39,209; range 38,693-44,675. Country-record lead "CAD 25,926-29,219 looks too low": confirmed too low.
- IB equivalents for Ontario Grade 12 prerequisites are not published; needs entries state Ontario-equivalent subjects and say TMU decides equivalency. Programme grade ranges (85-90% engineering, 70-75% journalism) are Ontario percentages; not converted.
## ca-carleton
- 3 flagships (Engineering, Journalism, Public Affairs and Policy Management), 6 faculties. No `courses` count published.
- IB: IB page "full IB (three SL and three HL), with a minimum of 28 points ... one subject with a grade of 3, provided it is offset by a grade of 5 or better. Prerequisite subjects must have a grade of 4 or better". Per-degree points and subject grades come from "Maintaining your conditional offer of admission for the 2027-2028 academic year (IB)": e.g. Engineering 26 to 32, Journalism 26, PAPM 28, Computer Science 28. These are the points needed to keep a conditional offer; Carleton also says the overall average required for admission is set each year.
- Dates (dates and deadlines page, "based on the 2026-2027 academic year"): "April 1, 2027 - Main deadline to apply for international students (whose transcripts originate outside Canada or the US)"; March 1, 2027 Prestige Scholarship and program-specific deadlines (some programmes earlier: check).
- Tuition: "USA and International Costs" page: Arts etc. 39,000; Commerce 45,000; Engineering/Computer Science 55,000, frozen for 2026/27, 2027/28, 2028/29; the exact 2026/27 figures a search snippet quoted (e.g. Engineering 57,505.68) are on the student-accounts page, not opened.
- Apply: Carleton's own International Student Application (CAD 100) or OUAC, both stated on the IB page.
## ca-manitoba
- 2 flagships (Engineering, Computer Science BSc), 9 faculty/area lines from the IB requirements page. courses 100 ("100+ undergraduate programs").
- IB page: "Three (3) courses at the higher level (HL) and three (3) courses at the standard level (SL) are required with an overall minimum grade of 24"; per faculty an average over four courses (4 = 70% for Arts, 6 = 80% Science/Engineering, 6 = 85% Commerce/Health/Kinesiology). Engineering: "Preference will be given to Canadian citizens and permanent residents with an aim to admit a minimum of 10% international students."
- Dates: "Fall Term (September): March 1" for the faculties and "March 1 (recommended), August 1 (final deadline)" for University 1; the page prints no year (recorded as 2027-03-01). Music closes 15 January.
- Tuition: only the average, "$28,000 Average first year international student tuition and fees (CAD)" on the international tuition page. Per-faculty rates from a search snippet (Arts 24,000, Engineering 31,400) not on a page I read; tuitionEuEea left out.
- Country record's minimum "24 points at Manitoba" confirmed.