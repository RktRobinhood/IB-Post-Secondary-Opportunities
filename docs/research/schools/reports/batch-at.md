# Batch report: at-* (Austria, 15 institutions), issue #43

Researched 2026-09-26 with WebFetch/WebSearch only (no browser: the pane is shared). Hand-off checks are
fetch-based, not browser-based; a JavaScript-rendered list may need a browser re-check.
Dates: only 2027-cycle dates an official page states for 2027 (or as a standing rule with no year) are recorded.

## at-uni-wien (listed, 1 programme)
- Scope listed: Mathematical Foundations of Data Science (BSc) is "English only" and exempt from German ("the bachelor programme Mathematical Foundations of Data Science" needs no German proof).
- Contradicts data/countries/at.json: englishBachelors is null and the note says "bachelor's teaching is in German"; the univie page "Degree Programmes in Foreign Languages" lists it under "Bachelor Programmes taught in English".
- Excluded: International Legal Studies (LLB, "German and English", German is an "admission requirement"), Economics and Physics ("German (& English B2 recommended)").
- IB rule quoted: "You have to have reached a minimum of 24 points (an admission with an IB Certificate is not possible)"; "A minimum of at least three subjects have to be passed in 'Higher Level.'"; IB German = A2 only, C1 required for German-taught bachelor's.
- Dates: none recorded. The periods page gives only 2026/27 ("from 22 June to 5 September 2026"); entrance-test window "2 March to 4 May 2026"; the MFDS written test was "15 July 2026". 2027/28 not published.
- Hand-off: the MFDS admission-procedure page (1 programme). The foreign-languages list was not used because it also lists ~70 master's.

## at-tu-wien (none, German)
- Scope none: FAQ says "All bachelor programmes offered at TU Wien are taught in German."; bachelor list says "generally taught in German" (13 programmes).
- Agrees with data/countries/at.json ("bachelor's are German-taught").
- German: "For a German-taught programme ... level C1 CEFR are required"; "level A2 CEFR are sufficient for the application. In this case, a supplementary German exam will be prescribed."
- Could not verify: any TU Wien page naming the IB Diploma (none found by search).
- Dates: none recorded. Admission page gives only "Winter Semester 2026/27: 6 July to 31 October 2026"; selection registration "April 1 to May 4, 2026". 2027/28 not published.
- Hand-off: the international-certificate admission page (bachelor's only).

## at-wu-vienna (listed, 1 programme)
- Scope listed: BBE is the only English bachelor's ("Business and Economics (BBE) – English"; WiSo and Business Law German).
- Agrees with data/countries/at.json (240 places: "In the winter semester 2026/27 we will accept 240 students."). The note's 2026 dates check out ("March 02 until May 19, 2026"; exam "June 30, 2026").
- 2027/28: "Details on the 2027/28 selection procedure will become available in mid-November." No dates recorded.
- IB rule (WU PDF, 2026/27, German-taught bachelor's): "Besides the language subjects, we currently do not specify any further subject combination or minimum grades."; C1 = "IBDP German A HL: Grade 6 / German A SL: Grade 7 / German B HL: 7 (German B SL is not sufficient...)". PDF read with pdftotext (WebFetch could not parse it).
- Could not verify: a WU page stating that the IB Diploma itself is accepted as the BBE's English B2 proof (the language page names "A passing grade in English on a secondary school leaving certificate issued by a school in the EU, the EEA, or Switzerland").
- Hand-off: WU bachelor's programs page, 3 bachelor's only (1 English).

## at-uni-graz (none, German)
- Scope none: "Most of our degree programmes are in German. In fact, all of the Bachelor's/Diploma courses are."
- Agrees with data/countries/at.json ("its bachelor's are taught in German").
- Contradicts data/countries/at.json ibRecognition "subjectLevelRule: None published": Graz's IB page sets "The three HLs must have a total score of at least 12 points", "No less than 3 points may be achieved in any subject", and two languages + humanities + science + maths. The ministry/ENIC NARIC IB-Information PDF (OeAD) states the same national conditions ("Die drei HL müssen eine Gesamtpunktezahl von 12 haben, keine Note darf unter 3 sein").
- German: "If German was completed at Higher Level (HL) the German requirements are fulfilled." Otherwise a C1 certificate.
- Dates: none recorded; the page gives only 2026/27 ("June 15 – August 24, 2026" for EU/EEA). 2027/28 not published.
- Hand-off: "Applying with an IB Diploma" page (bachelor's/diploma applicants only).

## at-tu-graz (none, German)
- Scope none: programme pages say "Language of instruction: German, many courses offered in English" (Computer Science, Information and Computer Engineering); FAQ: "you must provide proof of German and English proficiency for the following bachelor's programmes: Computer Science, Software Engineering and Management, Information and Computer Engineering, and Chemical and Process Engineering." German C1 required ("Knowledge of German at level C1 ... is required").
- Agrees with data/countries/at.json (englishBachelors null).
- IB: "You have to have at least 24 points out of six subjects."; "3 of the 6 subjects need to have been passed in Higher Level (HL)"; "One foreign language and mathematics need to be among the subjects."; "If the subject German appears as Language A (Level C1) in the IB Diploma, the proof is deemed to have been provided."
- Dates: none recorded; only "Winter 2026/27: Admission period: 6 July to 5 September 2026" is published.
- Hand-off: IB admission page (bachelor's admission). Overview lists 19 bachelor's + 2 teacher-education.

## at-uni-innsbruck (none, German)
- Scope none: all 44 bachelor's pages in the /en/programmes/ list checked by fetch. 41 say "The language of instruction for this programme is German" or inLanguage ["de"] (Computer Science and Sociology on their curriculum pages: "German"); 3 are bilingual: International Business and Economics ("German, English"), Atmospheric Sciences ("German, English", "Language Certificates (German)"), English and American Studies ("German / English"). None English-only. Geography and Mathematics: language not machine-readable on the hub page; treated as German (no English marker).
- Agrees with data/countries/at.json (englishBachelors null). The brief's hint that Innsbruck has English-taught bachelor's was not borne out.
- German: "German proficiency at level B2 has to be proven at the time of admission. This applies to all Bachelor's and Diploma programmes".
- Could not verify: any UIBK page with IB Diploma points/subjects rules (the language page only names the "IB Diploma ... with English as a school subject" as English proof).
- Dates: none recorded (no 2027/28 dates found).
- Hand-off: language-certificates admission page (bachelor's rules first); the programme list is JavaScript-filtered and mixes levels.

## at-jku (listed, 6 programmes)
- Scope listed: 27 bachelor's/diploma pages fetched; "Language English" on 6: Artificial Intelligence, Biological Chemistry, Chemistry and Chemical Technology, International Business Administration ("English (Level C1)"), Quantum Science and Technology, Transformation Studies. Art x Science. The rest German (B2/C1); Medical Engineering "German (Level B2) and English" and NASCITEC "German (Level B2) and partially in English" excluded.
- Contradicts data/countries/at.json: englishBachelors names only "Artificial Intelligence"; the note says "its Artificial Intelligence bachelor's is in English". JKU lists five more English-language bachelor's.
- Quantum Science and Technology: "supposed to start in autumn 2027" pending Senate approval; included with that caveat. Transformation Studies: "Program Begins WS 2027/2028"; Angewandte: "Next admission procedure: January/February 2027, details of the admission procedure will be published in autumn 2026."
- CCT: "during the first year of the program, some of the courses will also be held in German" (no German certificate required); recorded in its ib line.
- IB English (quoted): B2 = "English as Language A with a minimum grade of 4 or Language B with a minimum grade of 5 (HL) or 6 (SL)"; C1 = "Language A with a minimum grade of 6 or Language B with a minimum grade of 7 (HL)".
- Dates: the registration page gives a standing rule with no year: winter semester "General admission period early July September 5" (EU/EEA) and non-EU "To begin studies in winter semester February 6 March 31". Recorded as 2027-09-05 and 2027-03-31, labelled as standing dates. "Early July" opening has no day, so not recorded.
- Could not verify: any JKU page giving IB points/subject rules.
- Hand-off: bachelor's and diploma list (27 programmes, no master's).

## at-plus (none, German)
- Scope none: bachelor's list page says "The language of instruction for all bachelor's degree programmes is German." (about 34 programmes listed, including Artificial Intelligence and Philosophy, Politics and Economics).
- Agrees with data/countries/at.json ("all its bachelor's are taught in German").
- German: B2 or higher (not C1): "language proficiency of B2 or higher is confirmed in the secondary school certificate" or a certificate; A2 + VPLUS course otherwise.
- Could not verify: any Salzburg page naming the IB Diploma or IB German grades.
- Dates: none recorded; no dated 2027/28 admission period found.
- Hand-off: information for prospective international students (bachelor's admission rules).

## at-aau (listed, 6 programmes)
- Scope listed: "Degree Programmes taught in English" page lists 6 bachelor's; each programme page confirms "Language of instruction English". Matches data/countries/at.json (six named) exactly.
- Only IBE has a selection ("Special admission procedure & general admission procedure"); DMC says "Special admission procedure: No"; the others "General admission procedure".
- IBE 2026/27: "12 January 2026 to 23 February 2026", exam "22 April 2026", 50 places; 2027/28 not published. General admission 2026: "06.07.2026 – 05.09.2026"; 2027 not published. No dates recorded.
- English B2 (regulation, §6(1)b): "Successful completion of the subject English as part of the school leaving examination at a school in a member state of the European Union or the European Economic Area..." (PDF read with pdftotext). The IB is not named.
- Could not verify: an AAU page naming IB Diploma requirements.
- Hand-off: "Degree programmes taught in English" (6 bachelor's but also 11 master's and 4 doctoral on the same page; bachelor's listed first). No bachelor's-only English list exists.
- Completeness: AAU's full degree list (data-filter-lang='Englisch', type "Bachelor's degree programme") gives the same 6; the rest are English minors, not degrees.

## at-boku (none, German)
- Scope none: the partner-institution page links "Bachelor Programmes (in German)"; the English list (ECTS guides) covers master's only. No BOKU page lists an English-taught bachelor's.
- Agrees with data/countries/at.json (englishBachelors null).
- German: "sufficient knowledge of the German language must be demonstrated at level C 1"; accepted proofs are certificates or a school-leaving certificate from a German-speaking country; IB German not mentioned.
- Could not verify: any BOKU page naming the IB Diploma.
- Dates: none recorded; the admission page gives "Winter Semester 2026: June 16 – September 5" only.
- Note: the manifest-era URL pattern .../bachelorstudien/zulassung-zu-bachelorstudien-mit-internationaler-vorbildung returns 404; the live page is .../bachelors-programmes/admission-to-a-bachelors-programme-with-international-educational-background.
- Hand-off: that bachelor's admission page (bachelor's only).

## at-meduni-wien (none, German)
- Scope none: only Human Medicine and Dentistry for school-leavers, both diploma degrees ("diploma studies in human medicine or dentistry") taught in German; no bachelor's in English.
- Agrees with data/countries/at.json ("Entry is only through the MedAT test ... the degree is taught in German").
- IB: the page names an "IB Diploma" obtained under IBO regulations as general entrance qualification; no points/subject rule. German C1 before courses; Latin supplementary exam "not necessary, if you have successfully taken Latin at a secondary school to the extent of 10 semester hours", due "before the completion of the first study phase (2 semesters)" (extended by decree to the third semester).
- Dates: none recorded. medizinstudieren.at gives 2026 only ("02.03.2026 bis 31.03.2026 (24:00 Uhr)"); 2027 not published.
- Hand-off: MedUni admission requirements for medicine and dentistry (only those two degrees).

## at-modul (listed, 7 programmes)
- Scope listed: the admissions page and /programs/bachelor-programs list 7 bachelor's (BSc Applied Data Science, BSc HRM, BSc International Management, BSc IM with Professional Experience, BA International Relations and Sustainability, BBA Tourism and Hospitality Management, BBA Tourism, Hotel Management and Operations). The Vienna–Hong Kong "Mobility Agreement" page is an option inside BBA/BSc, not a separate degree; excluded.
- Agrees with data/countries/at.json ("24 points plus a maths minimum"). Fills its gap "fees were not on its admissions page": each programme page gives "€9.000 tuition fee per semester" (IM with Professional Experience "€8.700").
- IB (quoted): "IBDP (International Baccalaureate Diploma) with min. 24 points"; maths "Analysis and Approaches SL minimum 4 points or HL minimum 3 points, or Applications and Interpretation SL minimum 4 points or HL minimum 3 points".
- Dates: the page gives standing dates with no year, per group. EU/EEA FALL: "Super Early Bird 15 January", "Early Bird 15 March", "Final Deadline ... 15 August"; non-EU needing a visa FALL final "1 April". Recorded for 2027 labelled "standing date".
- Hand-off: /programs/bachelor-programs (7 bachelor's + the Hong Kong mobility option; no master's).

## at-webster-vienna (listed, 6 programmes)
- Scope listed: /academics/undergraduate.php lists 6 bachelor's: BA International Relations, BA Strategic Communication, BSc Business Administration, BSc Computer Science with an Emphasis in AI, BSc Psychology, LLB Comparative International Business Law.
- Contradicts data/countries/at.json: englishBachelors says "Four English-taught American-style bachelor's" (BA, IR, Psychology, Strategic Communication); the page now also lists Computer Science/AI and the LLB. The admissions page itself still names only the four. Fills "fees are not confirmed here": "24,068 euros flat fee" a year full-time (2026-2027), same for EU and non-EU.
- LLB: "*Pending AQ Austria and Higher Learning Commission approval"; included with that caveat in its ib line.
- Durations: Business, IR, Strategic Communication and LLB state 4 years/8 semesters (240 ECTS). Psychology and CS/AI pages give no duration; 4 years recorded by analogy with WVPU's other 240-ECTS bachelor's. Could not verify directly.
- IB: IBDP accepted; general "Minimum Secondary School Grade Point Average (GPA) of 2.5 based on a 4-point scale or its converted equivalent" with no IB conversion; English: "HL English A: 4; HL English B: 5; SL English A: 5; SL English B: 6". CS/AI: "IB Mathematics HL score of 5" among maths options.
- Dates: only "Academic Year 2026-2027" published (EU/EEA/AT deadline "July 31, 2026"). None recorded; noted as a 2026 precedent.
- Hand-off: undergraduate programs page (6 bachelor's only).

## at-imc-krems (listed, 8 programmes)
- Scope listed: 20 bachelor's pages checked ("Language English/German" in the fact box). English and full-time: Business Administration, International Business Management, International Wine Business, StartUp Management, Tourism and Leisure Management, Chemistry, Informatics, Medical and Pharmaceutical Biotechnology. German: Gesundheitsmanagement, Unternehmensführung und digitales Management, and all health degrees (Ergotherapie, Gesundheits- und Krankenpflege, Hebammen, Musiktherapie, Physiotherapie).
- Excluded: Sustainability Management (English, "part-time / 6 semesters"; application box says only "No application possible" with no next-year opening, unlike the others). Could not verify whether it takes a 2027 intake.
- Agrees with data/countries/at.json in substance ("Nine taught in English"): nine counting the part-time Sustainability Management.
- Dates (quoted from each programme page): "Application for the next study year possible from 01/12/2026" (recorded as opens 2026-12-01); "Application deadline for EU nationals 15/04/2026" is the 2026 cycle (not recorded; in a note as precedent). Info Day: "Friday 27.11.2026 Highlight Info Event IMC Info Day 14:00 - 18:00" (open-day).
- IB: no IB-specific page; "we check the equivalence ... Supplementary examinations might be necessary"; English: "we'll assess your English language proficiency at your interview".
- Credentials written as the page's full titles: "Bachelor of Arts in Business", "Bachelor of Science in Engineering".
- Hand-off: overview of bachelor programmes (20 bachelor's; bachelor's only).

## at-mci (listed, 3 programmes)
- Scope listed: 16 bachelor's fact boxes read ("Time model & Language"). English: Business & Management ("Full-time | English"); Entrepreneurship, Tourism & Leisure Business ("Full-time | German or English"; its Tourism, Sports & Leisure Business major "held entirely in English"); Business Administration Online ("Online + attendance modules | German or English"). All others "German".
- Agrees with data/countries/at.json ("Business & Management and Entrepreneurship, Tourism & Leisure Business full-time in English, plus an online Business Administration").
- Dates (quoted): "Application Deadlines 2027/2028 Date 1: November 8, 2026 Date 2: February 7, 2027 Date 3: April 11, 2027 Date 4: May 30, 2027"; "Online Info Sessions October 20 & 21, 2026". Page also says "Start of studies in fall 2027!". All recorded.
- Round-1 interviews for Business & Management and ETLB "November 23-25, 2026" (programme pages); not recorded as institution dates.
- Could not verify: an MCI bachelor's page stating IB or English-proof rules (the IB English exemption found by search is on a master's page).
- Hand-off: /en/study/bachelor (bachelor's only, 16).

## Summary
- 15 of 15 finished: 8 listed, 7 none (TU Wien, Uni Graz, TU Graz, Innsbruck, Salzburg, BOKU, MedUni Wien; all German-taught).
- Programme count by record: at-uni-wien 1, at-wu-vienna 1, at-jku 6, at-aau 6, at-modul 7, at-webster-vienna 6, at-imc-krems 8, at-mci 3 = 38 programmes.
- 2027-cycle dates recorded only where published: MCI's four 2027/28 rounds (8 Nov 2026 – 30 May 2027) and info sessions; IMC's 1 Dec 2026 opening and 27 Nov 2026 Info Day; JKU and MODUL standing (yearless) deadlines, labelled as such. No public university had published 2027/28 admission periods; MedAT 2027 and WU BBE 2027 unpublished (WU due mid-November 2026).
- Main contradictions with data/countries/at.json: Uni Wien has an English bachelor's (country says none); JKU has six English-language bachelor's (country names only AI); Webster lists six, not four; national IB conditions exist (three HL totalling 12, no grade below 3, per OeAD/ENIC NARIC and Graz) where the country record says "None published".
