# hu-a findings

## hu-semmelweis (done)
- 11 programmes (3 long-cycle, 8 bachelor's). Handoff https://semmelweis.hu/admission/programs/ also lists MSc (mixed list; bachelor's cannot be filtered).
- 2027 deadlines published on programme pages: "Application deadline: 31 May, 2027" (MD/DMD/Pharm), "31 July, 2027" (ETK BSc). Conductive Education page still shows "Application deadline: 01 August, 2026" (2026 only).
- Fees: programme pages EUR per semester (9,340 medicine/dentistry; 5,820 pharmacy; ETK 3,800-4,350; Conductive 4,640). 2026/27 rules PDF says "USD 10 450 / semester" for medicine, USD 6,620 pharmacy: conflict with EUR pages; used the programme pages (2027). No separate EU fee published.
- No IB rule anywhere; exemption only for relevant BSc holders. Country record says "offers no exam exemption" - consistent.
- Conflict: medicine page "from early March until the end of June" vs exam page "from early February".
- Country record mentions Nursing only for health; site lists 7 health BSc + conductive education. Midwifery 2-year (with nursing BSc) not a school-leaver route: left out.
- Optometry programme name long: page title "Medical Diagnostic Analysis BSc with Optometry Specialization"; used "Medical Diagnostic Analysis (Optometry)". "Health Care Management with Health Tourism Specialisation" is 56 chars.
- Exam page shows sample-test login credentials: not used.

## hu-szte (done)
- 22 programmes: 12 distinct (MD, DMD, Pharmacy, Nurse, Physio, Psychology, Business Admin, Tourism & Catering, Computer Science, Biochemical Engineer, Agricultural Engineering [Hódmezővásárhely], English & American Studies) + 10 Music Performance instruments as one `family`.
- Source of list: DreamApply apply.u-szeged.hu (JS; read through its POST /courses/find/results + /chunk endpoints, filtered type BA/UD and language en). 126 courses total, 28 BA/UD. Excluded: French/German/Italian/Spanish Studies (taught in those languages), MD in German, "Computer Science Engineering - For institutional partners only" (u-szeged.hu/english/bachelor-programmes), "BSc International College - SZTE_Computer Science" (course 515; only intake listed "Fall semester 2028/29").
- The static u-szeged.hu "Bachelor's Programmes" list (English/bachelor-programmes, dated 2016) omits Medicine (undivided) and some BA; used DreamApply as the complete list. Handoff https://apply.u-szeged.hu/courses/search lists all levels (126) - mixed.
- Application deadlines: none published on course pages ("Application period has ended" for Fall 2026/27). No 2026 schedule page found => no lastYear. Medicine 2027 exam calendar (JS page, read in browser): sessions 26-28 Jan ... 22-24 Jun 2027, "Registration deadline" 19 Jan ... 15 Jun. Recorded first and last session as test dates.
- IB: med.u-szeged.hu Medical Programme page: "grade 5 in two natural science subjects at Higher Level (Biology, Chemistry or Physics)" = exemption from exam (matches country record). Dentistry same. Pharmacy grade 4 two HL (bio/chem/phys/maths). Nursing grade 4 two sciences at min SL. Physio same + Sports science. Business & Tourism: "Holders of IB degree ... Standard Level 4 or higher; Higher Level 3 or higher in Mathematics" = maths exam exemption.
- Country record says med ~200 places; med page says "close to 250 students per year". Not recorded as `places` (approximate).
- Fees: single EUR per semester price on each course page, no EU distinction. 
- Fee pages (med.u-szeged.hu fees) JS-rendered; WebFetch gave 7100+800 deposit first semester then 7900 (matches course page).

## hu-ud (done)
- 33 programmes: 3 one-tier medical (Medicine MD, Dentistry DMD, Pharmacy Pharm.D.) + 30 bachelor's (from edu.unideb.hu/p/bachelor-programs, each programme page opened). Excluded: Romance Philology (French Studies) - taught in French ("All courses are taught in French"); prep/foundation/Basic Medicine Course.
- Names shortened to pass the gate's duplicate-name check: "Nursing", "Physiotherapy", "Public Health" (site: "Nursing and Patient Care (Nurse)", "Nursing and Patient Care (Physiotherapy)", "Health Care and Disease Prevention (Public Health)" = 50 chars). Computer Science vs Computer Science Engineering declared separateFrom.
- Nursing is taught at Nyíregyháza campus (programme page: "this Program is based at our Campus in Nyíregyháza"); city set.
- NOT listed though the fee table counts them: Agribusiness and Rural Development Engineering, Food Engineering, Precision Agricultural Engineering, Geography BSc, Kindergarten Education (fee table 2026/27 only; no current programme page - slugs fall back to the site shell), and Dietetics (menu shows "Nursing and Patient Care (Dietetics), BSc" -> /p/dietetics-bsc-hons redirects to home). Facts page says "36 Bachelor's programs fully taught in English" + "1 Bachelor's in French"; we have 30. Flag to owner.
- Deadline: application page: "The application period for the September 2027 intake will open later this year, and the final application deadline will be May 15, 2027." (in the Medicine/Dentistry closed notice; medicine page repeats). Recorded for Medicine & Dentistry only. 2026: "all other programs: 15th June 2026" -> lastYear. Pharmacy 2027 not stated.
- Fees in USD per year, same for all applicants; no EU rate on any UD page. 
- No IB rule/exemption anywhere; FAQ: "Taking an exam such as SAT does not exempt you from taking our entrance exam/interview."
- English proof: "standardized, at least upper-intermediate (B2) level language certificate, obtained at a proctored exam ... exempted ... completed the secondary or higher education in the English language (medium of instruction certificate)". Country record said "check whether IB counts" - not stated.
- Fee table needed rowspan-aware parsing (flattened text mis-grouped duration/fee).

## hu-szte addendum
- Portal JSON (apply.u-szeged.hu/courses/course/<id>?json=v1) gives 2026 "001" deadlines: medicine/dentistry/pharmacy/nurse/physio 2026-06-15; CS, Biochemical 2026-05-15; EAS 2026-04-30; Psychology 2026-04-30/05-15; business/tourism 06-15 and 06-30. Used as school-level lastYear "most programmes 15 June (some earlier)". No EU territory in the fee data (single 001 price).

## hu-pte (done)
- 47 programmes: long-cycle General Medicine, Dentistry, Pharmacy, Accelerated Pharmacy-Biotechnology (5+1), Architecture (BSc+MSc), Graphic Artist/Painting/Sculpture OTM (5 yrs); 38 bachelor's incl. 5-instrument music family and 2-path Designer Making family. List built from international.pte.hu/study-programs (views rows, type Bachelor/One-tier Master, language English) cross-checked against apply.pte.hu DreamApply (138 courses).
- Excluded: taught in German/French/Italian/Spanish/Russian/Hungarian (Germanic x2, Romance x3, Hungarian Lit. "Hungarian with English as an intermediary language", German medicine/dentistry); "Fast-Track PharmD" (for BSc-pharmacy graduates, joins year 3); preparatory/foundation; MA/MSc/PhD/BEd.
- On DreamApply (2027/28 intake, status Online) but no page on international.pte.hu: Mathematics BSc, Electrical Engineering BSc, Midwifery BSc (8 sem; text says "degree in a shortened time due to prior learning") -> included with apply.pte.hu course pages as url; flagged in a record note.
- EU fee: DreamApply fee data has an "EU" territory and the programme pages say "(for EU students)": Archaeology EUR 1,700, Comm&Media 2,100, EAS 1,800, IR 1,800, Liberal Arts 1,700, Pedagogy 2,100, Psychology 2,900, Romology 1,700, Social Work 1,700, BAM 1,150 (non-EU 2,750) per semester. Others: one price. Medical USD 16,750 / 17,350 a year; Pharmacy EUR 8,400 a year; engineering USD 3,400-4,000 a semester.
- IB: "The International Baccalaureate Diploma (IB DP) is required for general admission. Individual IB certificates are not accepted." (general-admission PDF). Language PDF 2026/27: IB Diploma exempts from English test; Health Sciences, Engineering, Pharmacy, Medical School still test English. Medical School: "possessing an IB diploma does not make you eligible for exemption".
- Deadlines (2027/28, programme pages + portal JSON, same for EU): 15 May electronic music; 31 May BAM, pre-school; 1 June arts; 15 June CSE, Mechanical; 30 June all others. Conflict: Pre-school Teaching intl page says 06/30/2027 but portal JSON says 2027-05-31 -> used 31 May (stricter). Social Work: intl list shows 11/30/2026 (spring-2027 intake); portal 2027 intake = 2027-06-30 used.
- Medical School: exams "every Wednesday as of 3rd March until the 14th July 2027" (online, USD 250). Country record said the same.
- Conflict: country record says Pécs "position on the IB not published" -> it is (PDFs above). Country record med fee not given; USD 16,750.
- Names shortened/adjusted: Liberal Arts named "Liberal Arts" (site: "Liberal Arts BA with majors: Art History, Classical Studies, Ethics, Film and Visual Studies"). "Accelerated Pharmacy-Biotechnology Degree Pathway" is 49 chars.
- Country record "General Medicine (180 places)": not found on current pages.

## hu-univet (done)
- 2 programmes: Veterinary Medicine (DVM, 5.5 yrs; "Type: BSc+MSc together") and Research Zoology (10-semester undivided master's, English; level/length only stated on the Hungarian page univet.hu/hu/felveteli/szakok-bemutatasa/kutato-zoologus-osztatlan-mesterkepzes/ : "tíz féléves ... angol nyelvű kutató zoológus mesterszak"; the English admission pages do not state level). Country record mentions "Also biology BSc and MSc" - no English BSc Biology page found on univet.hu/en; left out.
- Fees: DVM "for new admissions for the Academic Year 2026/27: EUR 12,480"; Zoology EUR 10,000 a year; 2027/28 not published. No EU rate.
- Dates: "Applications are accepted on a rolling basis from 1st January until 30th June"; exam dates page lists 2026-27 only (Feb-Jun 2026) -> lastYear only.
- No IB rule; exemptions only transfers/French BCPST ("An oral exam, however, is mandatory ... for all applicants"). Matches country record.
- Zoology page says "(Application period is open between 1stJanuary - 30thJune, 2026)".

## hu-corvinus (done)
- 8 programmes (Applied Economics, Business and Management, Business Informatics, Communication and Media Science, Data Science in Business, International Relations, International Business, PPE), each with its own page /post/landing-page/bachelors/<slug>/ and own admissions-requirements page. Card list on the main pages is click-to-expand (no links); found links via the Start-here landing page.
- CONFLICT with the brief/lead ("closes early: February in 2026", "2 February 2026"): current application-information page shows rolling admissions: application phase "From 1 October 2025 to 26 January 2026" -> exam deadline "8 February 2026 Last chance for early bird applicants"; "from 27 January onwards until 25 May 2026" -> exam deadlines 22 Feb, 29 Mar, 3 May, 26 May 2026, oral exams to 10-12 June 2026. No final application deadline is stated; early-bird discount requires applying by 26 January. So February is the early-bird/first-round exam date, not a closing date. 2027: "The online admission platform for the Academic year 2027/28 will open in October 2026." Recorded as lastYear only.
- EU fee: EEA applicants pay HUF: 1,980,000/yr (Applied Econ, BAM, BI, DSB, IB) and 1,700,000/yr (Comm & Media, IR, PPE) on programme pages that state "Start date September 2027"; non-EEA EUR 7,000 / 6,600. Fees page unlabelled by year. Programme pages also give "cca. 2 750 EUR/semester" approximations.
- Conflict: application fee EUR 100 on general pages vs EUR 95 on programme admissions pages (not recorded).
- IB: general admissions page lists IB Diploma, IB English SL5/HL4 for B2 proof, IB Maths SL5/HL4 for maths requirement (Applied Econ, BI, BAM, DSB, IB, PPE); interview for Comm&Media, IR, PPE (PPE needs maths first). Lead said "Maths SL 5 or HL 4 substitutes the maths exam" - confirmed.
- Not recorded: per-programme thresholds/cutoffs (Dean sets yearly), places.

## hu-ceu (done)
- 3 programmes (Culture, Politics and Society; Data Science and Society; Philosophy, Politics and Economics), all taught in Vienna ("These studies will take place in Vienna, Austria"). Country record city is "Vienna, Austria", so no programme `city` set. 3-year Austrian degree or 4-year US+Austrian degree; years recorded 3.
- Dates (same page, EU/EEA can use all four rounds; page title says "academic year 2026/2027" but decisions run to July 2027 = autumn 2027 entry): R1 15 Oct 2026, R2 2 Feb 2027, R3 15 Apr 2027, R4 15 Jul 2027 ("subject to space availability"; "Applicable to all applicants with visa-free entry to Austria, incl. EU/EEA"). Country record said "15 October 2026" - it is Round 1 of four, as the lead suspected; lead's "Round 4 ... October 15, 2026" numbering was wrong. Recorded R4 as `closes`, R1-R3 as `early`.
- Fee: "Tuition for each of CEU's bachelor's degree programs is EUR 8,000 per year"; no EU/non-EU split.
- IB: English 5+ (HL or SL) exempts English test; DSS maths reference "IB Math HL: 5 or IB Math SL: 6" competitive, not required; PPE "Mathematics in final year strongly recommended". Country record "IB code 039515" not checked/recorded.

## Final checks
- node scripts/validate.mjs: all records valid. node scripts/check-schools.mjs: 0 failing (incl. my 7 files).
