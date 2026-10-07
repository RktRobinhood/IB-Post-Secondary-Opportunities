# Wave 3 report: Singapore, remaining schools (sg), 7 Oct 2026

Sites behind Incapsula (SMU) answer curl with a challenge page; they open in the browser pane once the tab is fronted, then same-origin fetch + DOMParser reads the pages.

## sg-smu
- Catalogue. 3 flagships (Business Management, Accountancy, Law), 7 faculties (the seven schools on the programmes page). Three fee lines from the AY2026/27 fee table ("Other International Students" subsidised S$26,200; Law S$30,450; non-subsidised S$47,700 / S$56,150).
- Dates: the IB page and important-dates page show only AY2026-27 (17 Nov 2025 to 19 Mar 2026). 2027 is not published: `dates` empty, `lastYear` "applications closed 19 March".
- IB: no minimum total published. English A grade 6 or 7 for Law and Computing & Law; "a good pass" in IB Maths for Economics and Computer Science (both stated on the IB page). Predicted scores must come from the teacher; self-declared refused.
- Law: in-person writing test at SMU, then interview (2026 practice). Applicants outside Singapore: online interviews for non-Law degrees.
- The lead's "S$15 application fee" was not on any page read; not used.

## sg-sutd
- Listed (5 degrees: ASD BSc, CSD BEng, DAI BSc, EPD BEng, ESD BEng; "SUTD currently offers five undergraduate programmes", handoff page lists exactly these). Applicants apply to SUTD, not to a degree; pillar core starts in Term 4. Credentials stored as BSc/BEng because the full "Bachelor of Science (Architecture and Sustainable Design)" exceeds the 48-character limit.
- No IB total or subject prerequisite published ("reviewed comprehensively based on both academic and non-academic achievements"). English test needed only if English was not the medium of instruction. Dates: only 2026 window (2 Jan to 2 Mar 2026; "Applications for 2026 are closed. See you in 2027") so `lastYear`, `dates` empty.
- Fee AY2026 "All other IS" subsidised S$31,600 a year (per term S$15,800); grant bond "work for a Singapore entity for three years" is stated for PRs on the page and the standard grant rule for international students (one note). Years = 4: fees are paid for "8 academic terms (i.e. normal course duration)" at two terms a year.
- CSD page URL is the ISTD pillar's undergraduate page (the CSD degree is "offered under the ISTD pillar").

## sg-sit
- Catalogue. 2 flagships (Diagnostic Radiography, Food Technology), 7 cluster pages as faculties (the programme-list filter groups; SIT has no faculties). No course count (the list mixes SIT, joint, partner-only and CSM-pathway variants). Handoff: undergraduate programmes list (about 41 entries).
- EU IB applicants are eligible: IB Diploma, grade 5 in at least two HL and one SL; the IB page lists the degrees open to IB ("may be considered ... case-by-case" applies to the international-qualifications group). Mother Tongue requirement is for citizens/PRs/flow-through students; international students in privately funded schools are exempt (page table).
- Dates: only AY2026 (application period 8 Jan to 19 Mar 2026; interviews mid-Feb to mid-May; join the Joint Acceptance Portal by the acceptance deadline) so `lastYear`, `dates` empty. Fee: the fees checker is dynamic; no EU/international figure recorded.
- Lead hint "Application International Guide PDF" not opened. Flagship choice rests on the programme pages (accreditation, labs); SIT publishes no "strengths" page beyond "best known for engineering, computing and health sciences".

## sg-suss
- Listed: 11 of the 12 full-time degrees the international page names ("twelve full-time undergraduate programmes for international students who are on Student's Pass"). LEFT OUT: BA Chinese Studies (its page is bilingual and states no language of instruction; it asks for good Chinese at IB HL or SL); add it if SUSS confirms English teaching.
- SUSS is behind Cloudflare (curl 403); read in the browser after the challenge cleared on its own. Handoff page lists exactly those 12 names.
- Dates: every full-time programme page reads "Application Period 19 Nov 2026 to 19 Mar 2027 Next Intake July 2027"; the application guide says "Application for the July 2027 intake will begin in November 2026". Recorded opens 19 Nov 2026 and closes 19 Mar 2027 (cited to the Accountancy page).
- IB: eligibility page lists only "A diploma from an IB School" plus IB transcript release (institution code on page); no points or subjects. Psychology's minimums are in local grades (O Level English B4, Maths C5 or A-level equivalents): no IB conversion published. Lead hint "S$30 international application fee" is on the application guide (not recorded).
- Fees: AY2026 estimated total for 4 years, "All Other International Students" subsidised: S$76,800 (Accountancy S$82,000). Quoted as total over four years, not per year.
- Selection: up to 3-stage (response essay, online cognitive test, programme interview; international students outside Singapore may attend virtually).

## sg-lasalle
- Listed: 16 BA (Hons) degrees (the programmes listing, 3 pages, and the admissions page's programme selector agree), all 3 years full-time, degrees conferred by University of the Arts Singapore. Page `/study/programmes/` is a paginated list; each degree has its own page.
- Dates (BA (Hons) admissions page): window opens 1 Oct 2026, "Apply by 1 Nov 2026", outcomes by 23 Dec 2026; Music "Apply by 28 Feb 2027", outcomes by 20 Apr 2027; "Future application windows may open if programme seats remain available". Music carries its own `closes` and music-scoped dates. The page's other line (shortlisted LOCAL applicants interviewed from Feb 2027, outcomes from Apr 2027) is for local applicants and not recorded.
- IB: IB Diploma is a listed common entry qualification; no points or subjects; English IELTS 6.0 / TOEFL 80 for non-English-medium schooling. No anticipated-results rule found on the admissions pages (lead hint not confirmed; not recorded).
- Fees (August 2027 intake, per annum): Non-funded full fee International S$30,380. Funded (Tuition Grant) International figure is blank in the table (PR S$13,895), so only the full fee is recorded; Design for Social Futures, Dance and Music Business (and a Creative Media Arts degree named in a footnote) are non-funded. Dance: Year 1 at London Contemporary Dance School GBP 24,000 international, years 2-3 S$30,380.
- LEFT OUT: "BA (Hons) Creative Media Arts: Immersive and Interdisciplinary AI Practices" is named in the fees footnote but has no page (404) and is not in the programme list or admissions selector.
- International application fee S$120 (SC/PR S$75).

## sg-nafa
- Listed: 6 of 7 bachelor's degrees (Biophilic Design, Design Practice, Fine Art, Performance Making, Instrumental & Vocal Teaching, Music). LEFT OUT: BA (Hons) Contemporary Chinese Theatres (page: "Mandarin-language performance", Mandarin monologue audition). Degree list from the bachelor's admissions page; each has its own /programmes/ page. Entry requirements are on three faculty admission pages.
- CONFLICT with data/countries/sg.json note: it says NAFA 2027 dates are not published and the guide is AY2026/27. The faculty pages now read "Programme Starts 9 August 2027", "Application Period Opens on 1 October 2026", outcomes "progressively by mid-April 2027", "Applications will close once the programme reaches full capacity". Recorded as opens 1 Oct 2026 plus `noDeadline`; no closing date.
- IB: IB Diploma listed with A-level/diploma as minimum entry; IB transcript release to NAFA mandatory; no points or subjects. Audition dates on the performing-arts page that fall in Oct 2026 to Mar 2027 belong to Contemporary Chinese Theatres only; other audition lists are 2025/26 dates (not recorded).
- Fees (2027 entry, "Non-subsidised Student (without Tuition Grant)", with GST): Design/Fine Art/Biophilic S$30,400; Performance Making S$31,400; IVT and Music S$32,700 (include a 7-week residential study visit). No international-with-grant figure published; no bond text read at NAFA, so no bond statement made.
- Music: "new 4-year Bachelor of Music (Honours), jointly conferred by the Royal College of Music, London, and the University of the Arts Singapore". Design Practice, Fine Art, Performance Making: entrants to Year 1 in August 2027 receive UAS degrees.

## sg-jcu-singapore
- Listed: 23 course pages in 8 cards (Business 7 paths, Commerce 6, Business and Environmental Science 2 via family; 8 single degrees). Not listed: three Diplomas of Higher Education, Bachelor of Early Childhood Education ("Teach out by Dec 2026"), BSc Internet of Things ("Teach out by September 2027"), Psychological Science (Honours) (12-month add-on). JCU is behind Cloudflare to curl; read in the browser.
- No IB score or subject published; entry text is "satisfactorily completed 12 years of schooling or equivalent", English IELTS 6.0 (TOEFL 74, PTE 52). Fees are totals for the 24-month course, "Effective for students commencing from Trimester 1, 2027" (the second figure of the Domestic/International pair, e.g. Business S$70,893.60); recorded as totals not per year.
- Dates: intakes Trimester January, May, September; the "Admissions Schedule 2027" is an image (not readable), application page says "Application cut-off date is at least 6 weeks before the course commencement date": recorded as `noDeadline`, no dated entries.
- MOE Tuition Grant not mentioned on JCU pages read (private campus): no note made.

## sg-curtin-singapore
- Listed: 3 first degrees (Commerce with 6 single and 6 double majors as one degree; Computing (Cyber Security); Information Technology). Not listed: Bachelor of Communications (Top-Up) and Nursing conversion (top-ups for diploma holders / registered nurses).
- IB: academic requirements page, Bachelor column: "IB Diploma with 24 points from 6 subjects at one sitting. 3 of the subjects must be at the higher level and one of the 6 subjects must be English"; each course page's cut-off table also says "IB Diploma 24". IT and Cyber Security list "Essential course prerequisites: Mathematics. Calculus is desirable." Recorded as maths any level.
- Fee: international total tuition S$62,400 before GST / S$68,016 with 9% GST for the two-year course ("indicative and subject to annual increases"). Recorded as total. Intakes: Commerce February, July, November; Computing and IT February, July. Cyber page: "Apply for the Trimester 1A February 2027 intake and receive a 50% scholarship" (no date). No application closing date published; offer documents are due 6 weeks before start (`noDeadline`).

## sg-digipen-singapore
- Listed: 3 degrees (BS Computer Science in Real-Time Interactive Simulation, BS Computer Science in Interactive Media and Game Development, BA User Experience and Game Design). All applications are processed through SIT's portal; 2026 window "8 January to 19 March 2026", so `lastYear`, `dates` empty.
- CONFLICT: SIT's IB page and programme list still name "Digital Art and Animation", but DigiPen's own degree page says the BFA "has taken in its final cohort of students in AY2025/AY2026" and "has been ceased"; left out. The "BS in Computer Science and Game Design" page is the pre-2020 name of the IMGD degree (page text), also left out.
- Programme names over 48 characters (the university's own names): "Computer Science in Real-Time Interactive Simulation" (52) and "Computer Science in Interactive Media and Game Development" (58): need adding to scripts/lib/long-titles.json (not edited by this run).
- IB (SIT-DigiPen requirements pages): Diploma, grade 5 in at least two HL and one SL; the BS degrees add "a pass in one of the following HL subjects (Mathematics or Physics or Computing); or a pass in SL Mathematics". Personal statement max 300 words; interview/assessment for shortlisted. Tuition: "available on the SIT website" (fee checker is dynamic): none recorded.

## sg-sim-ge
- Catalogue (partner degrees, 74 bachelor's results on the filtered listing `?academic=2%7C`, 134 across all levels; handoff checked: Bachelor's Degree filter only). 2 flagships (Buffalo BA Communication, Stirling BA (Hons) Marketing), 8 partner universities as `faculties` (lines for Buffalo, Stirling, London, RMIT, Wollongong from their programme pages; Birmingham, Cardiff, Alberta rows are "(Top-up)" titles). The flagship choice rests on programme pages that state IB entry; SIM publishes no strengths page.
- IB: only Buffalo ("Most recent 3 years of high school grade of 'B' equivalent to IB score 4.5. IB Diploma holders can expect up to 30 credit exemptions with a minimum of 30 total scores"; English: IB English A Lang & Lit HL/SL grade 5, or IELTS 6.5) and Stirling ("Admission to Year 1 ... International Baccalaureate (IB) Diploma") name the IB. London: English via "IB Diploma - English at grade 4 or better" on the Computer Science page. RMIT and Wollongong list A-levels/diplomas only ("Other qualifications will be considered on a case-by-case basis" at RMIT).
- Dates are per programme: Buffalo "Open Now for Spring 2027 (Jan) Intake and Fall 2027 (Aug) Intake" (no close); Stirling "Direct Entry (3-yr pathway): Now till 28 Jun 2027 (Intl), 12 Jul 2027 (Local)" recorded as closes 2027-06-28, ASSUMING the 3-year route is the Year 1 (school-leaver) route, as the admission criteria suggest.
- Fees are estimated totals incl. GST; the Buffalo range is S$46,008.90 to S$82,404 (International). No MOE grant statement made (not found on pages read).

## sg-essec-asia-pacific
- Listed: 1 programme (Global BBA). It qualifies: the ESSEC page lists "English Track in Singapore" among the 5 tracks a student can start in (year 1 at "ESSEC Asia-Pacific Campus Singapore") and "English Track (Cergy, Rabat, Singapore)" in the English-test and document rules.
- Dates: the 2027 intake table (embedded in the page's data, not visible as text; same as the France record): Round 1 28 Oct 2026, Round 2 12 Jan 2027, Round 3 10 Mar 2027, Round 4 22 Apr 2027 (noon Paris time); Round 4 interviews 20 to 26 May, final results by 2 Jun 2027. Rounds 1 to 3 recorded as kind `early` with date-only labels; Round 4 as `closes`. Consistent with data/schools/fr-essec.json.
- Fee: page table is labelled "Applicable for the 2026 intake": EU citizens, Cergy and Singapore, tuition EUR 15,400 a year, registration EUR 2,000 a year, service fee EUR 2,653 (non-EU EUR 17,383 / 2,000 / 2,810). WebFetch's summary of the page said EUR 15,900, which does not appear in the page data; not used.
- No IB points published. Programme URL: the lead's `.../global-bba-international/program/` (the France record uses `/global-bba-international/`; both load the same page).
