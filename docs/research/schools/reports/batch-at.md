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
