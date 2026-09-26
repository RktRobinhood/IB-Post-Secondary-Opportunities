# Batch be: Belgium school records (#43)

Researcher run started 2026-09-26. One line per point. WebFetch/WebSearch only (no browser), so hand-off counts are from fetched page text.

## be-ku-leuven (listed, 7 programmes)
- Scope: listed. KU Leuven's "Choose your programme" page says "Are you interested in one of our 7 bachelor's programmes taught in English?"; the seven found: Business Administration, Business Engineering (both Brussels), Engineering Technology, European Studies (joint BAES), Philosophy, Theology and Religious Studies, Joint Bachelor in Sustainability (BASUS).
- Hand-off: programme search filtered to English + Academic Bachelor's; it is a JS app, so the result count could not be read by fetch (the choose-your-programme page gives 7). Needs a browser check.
- Excluded: "Bachelor of Laws (Brussels et al)" appears in the application-window tool but is not in the English-taught list (trilingual/Dutch law); abridged Philosophy/TRS programmes (not for school-leavers).
- Contradicts data/countries/be.json englishBachelors ("Business Administration, Business Engineering, European Studies, Philosophy and Theology and Religious Studies"): it misses Engineering Technology and the Joint Bachelor in Sustainability.
- Dates: none recorded. The application-window tool's embedded data covers only 2024-25, 2025-26 and 2026-27 (checked in the page source 2026-09-26); 2026-27 EEA deadlines were 1 July (BA, BE), 1 June (Eng Tech, Philosophy, TRS), 1 April (BAES). The BAES apply page says the 2027-28 window "opens in fall 2026".
- Could not verify: BASUS 2027 intake (basus.info shows 2026/27 only; year 1 at Jagiellonian University, Kraków); Engineering Technology positioning-test date ("beginning of July", no day).
- IB/English: IB exempts from English test "if at least half of their courses are taught in the English language" (BA, BE, Eng Tech); Philosophy exempts only UK/US/etc. degrees; BAES requires a test from all ("All applicants must prove their English language proficiency").

## be-vub (listed, 3 programmes)
- Scope: listed; Business Economics (BSc), Linguistics and Literary Studies (BA), Social Sciences with UGent (BSc). The programme listing is a JS app (could not count by fetch); VUB's bachelor's page links "Discover our English-taught bachelor's programmes". Hand-off count needs a browser check.
- Dates: 2027-28 applications "will open on 15 November 2026" (general deadlines page). Deadlines from the programme pages: "Foreign diploma and student visa required (often non-EEA students): Apply before 1 April 2027 (last day: 31 March)" and "Foreign diploma and no student visa required (often EEA students): Apply before 1 August 2027 (last day: 31 July)". The general deadlines page still shows the 2026 versions.
- English: VUB accepts an English-medium school certificate or IELTS 6.5 / TOEFL 79; no blanket IB exemption. IB is on VUB's equivalent-diploma list (PDF, 2025).
- Linguistics: Dutch as a major needs C1, French B2 ("Students of Dutch are to have obtained level C1"); recorded in programme ib.
- Matches data/countries/be.json englishBachelors ("Three: Business Economics, Linguistics and Literary Studies, and Social Sciences").

## be-ugent (listed, 1 programme)
- Scope: listed with one programme. Study guide 2027-2028, filter Bachelor + English: "3 programmes found" — all three are majors (Political Sciences, Communication Studies, Sociology) of one Bachelor of Science in Social Sciences, joint with VUB, "registration takes place at the Vrije Universiteit Brussel". Merged into one entry.
- UGent's own requirement page: "all bachelor programmes are taught in Dutch (with the exception of the Bachelor of Social Sciences - application at Vrije Universiteit Brussel)". Language page: "Dutch at level B2 is required upon enrolment for most bachelor programmes. Level C1 is required for the Bachelor of Arts in Applied Language Studies".
- Refines data/countries/be.json ("three English-taught bachelor's listed for 2026-2027"): they are one degree with three majors, applied for at VUB.
- Dates: none recorded at institution level; UGent's deadlines page gives a standing "Before 1 JUNE" (no visa) / "Before 1 APRIL" (visa) without a year, so kept as a note. The programme's closes (2027-07-31) is VUB's EEA deadline.

## be-vesalius (listed, 3 programmes)
- Scope: listed. Vesalius College now teaches as the Brussels School of Governance (BSoG); three BAs: International Affairs, Global Business and Entrepreneurship, International and European Law ("the degree will be awarded by Vesalius College"). BA Preparatory Programme excluded.
- Hand-off: BA admission requirements by diploma page (BSoG's "Study at the BSoG" list mixes BA, MA, certificates, so it fails the bachelor's-only test). No programme-count listing exists.
- IB: "At least 27 IBDP points. No specific subjects required. English proficiency scores are not required." Matches data/countries/be.json note.
- Dates: "Applications for our Fall 2027 BA programmes open on 1 October 2026" recorded. Deadline table says "EEA citizens 30 June" / "Non-EEA citizens 30 April" for Fall with no year, so kept as a note, not a date.
- Contradiction between official pages: VUB's deadline page says "Brussels School of Governance : apply before 1 September 2026 (last day: 31 August)" (2026 cycle), BSoG's own admission page says 30 June for EEA. Followed BSoG's own page; neither is a 2027 date.
- Tuition "7.500 EUR per semester, so 15.000 EUR for a full academic year" for EEA and non-EEA; data/countries/be.json englishBachelors says "business, international affairs and communication": there is no communication BA now, and law is missing.

## be-uantwerpen (listed, 2 programmes)
- Scope: listed. Bachelors page: "34 results found", two tagged "Taught in English": Social-Economic Sciences, Urban Sustainability Studies. The admission page confirms: "Except for the Bachelor of Social-Economic Science and the YUFE Bachelor of Urban Sustainability Studies, all our bachelor's programmes (undergraduate) are taught in Dutch." Matches data/countries/be.json.
- Hand-off: the bachelors page with language filter; the unfiltered page returns 34 bachelor's only (programme level = Bachelor), 2 in English. Filter state is client-side, so the link opens unfiltered; browser check wanted.
- Dates: "The admission application for academic year 2027-2028 will open on 4 November 2026"; Objective 1 "28 February 2027" (non-EEA) / "31 May 2027" (EEA); Objective 2 "31 May 2027" / "30 June 2027". These apply only to those who must file an admission application; IB holders without a visa "can enrol directly" ("Enrolments start in July").
- Urban Sustainability Studies: own YUFE procedure; its page still shows 2026 periods ("EEA students with an EEA degree: Registration is open from 1 June 2026 to 10 July 2026") — not recorded.
- Could not verify: the exact degree title of both programmes (BSc/BA not stated); recorded as the page names them.

## be-uhasselt (none, Dutch)
- Scope: none. UHasselt FAQ: "Do you offer English-taught Bachelor programmes? All Bachelor programmes are taught in Dutch." Matches data/countries/be.json.
- Hand-off: international application-process page (FAQ + deadlines; the deadlines on it are all master's). The programme list (117 studies, 18 bachelor's) was too slow to page through by fetch; the first page shows bachelor's all "Dutch".
- Dutch route from the Dutch toelatingsvoorwaarden page: ITNA "ERK B2", CNaVT "Educatief Startbekwaam", NT2 programma II, one passed year of Dutch-medium secondary; own AUHL test "105 euro voor niveau B2", "in de periode mei-september maar één maal".
- No dates: UHasselt publishes no bachelor-specific deadline for foreign diplomas on its English pages.

## be-uclouvain (listed, 1 programme)
- Scope: listed with one programme. The Saint-Louis Brussels bachelor's page lists Business Engineering "Full english" (BBEB1BA, joint with KU Leuven; "all candidate must first submit an application via the KU Leuven admission platform"). All other UCLouvain bachelor's are French or bilingual French-English / French-English-Dutch (excluded: they require French).
- Contradicts data/countries/be.json englishBachelors ("Essentially none - bachelor teaching is in French"): one fully English joint bachelor exists.
- Hand-off: Saint-Louis Brussels bachelor's list (bachelor's only; about 25 entries incl. language variants; one "Full english"). UCLouvain has no English-bachelor list.
- Dates: none for 2027. Deadlines table (read from page HTML) gives 2026-27 only: EU + "Belgian diploma, an IBO or a Schola Europaea" → "30 September 2026"; recorded as a note.
- French proof: "attestation, certificate or diploma attesting to your knowledge of the French language (DELF, DALF, TCF or other official attestations) if your studies were not conducted in French" — no bachelor CEFR level stated on the page; could not verify a level.
- The 2027 programme page (prog-2027-bbeb1ba) redirects to a login (not yet public).

## be-uliege (none, French)
- Scope: none. ULiège's "Foreign language courses" page lists four bachelor's (Economics and management multilingual, BSc Engineering, BSc Computer science, Law), but each programme page says "This programme is taught in French only" (economics: "either in French or in French/German"). Matches data/countries/be.json ("Essentially none at bachelor level").
- Hand-off: EU-student enrolment page (no English bachelor list exists).
- French: the non-EU bachelor page says "Vous devez, le cas échéant, apporter la preuve d'un niveau B2 dans la langue d'enseignement"; the EU page states no level — could not verify an EU-specific requirement.
- Dates: EU page says "complete the online form from mid-February and upload your PDF documents before 31 August" with no year; kept as a note. No 2027 dates.
- Official pages disagree on veterinary medicine: Wallonie-Bruxelles Campus lists only medicine and dentistry under the entrance exam ("any student wishing to enrol in medicine or dental sciences must also successfully pass an entrance exam"), while data/countries/be.json cites the ARES concours as covering sciences vétérinaires. Note limited to what both support (vet has a non-resident quota).

## be-umons (none, French)
- Scope: none. UMONS: "The majority of the courses offered at UMONS are in French, even though certain courses are taught in English"; FPMs: "The Faculty of Engineering offers 3 courses taught entirely in English. These are the 3 Master's". No English bachelor found. Matches data/countries/be.json.
- Hand-off: bachelor registration page for EU students with a degree obtained abroad (bachelor-only procedure page).
- Dates: page says "Applications may be submitted up to and including 30th September" (no year; its document list refers to 2026 school-leavers) — note only. French test page: "The dates for the 2025-2026 academic year have yet to be set" (stale), so no test date recorded.
- Engineering admission exam page shows 2023 dates only; not recorded. It says holders of a CESS or engineering equivalence take maths only; "Other candidates will also have non-mathematical tests (French, History, Geography, Science, and a second language". Whether a full IB (no equivalence needed in FWB) counts as "valid equivalence for engineering sciences" is not stated — could not verify; note gives the page's rule.
