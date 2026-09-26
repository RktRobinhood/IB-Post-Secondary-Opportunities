# Batch report: Sweden and Norway (se-umu, se-mau, se-ltu, se-slu, se-ki, no-uib, no-uit, no-nih, no-oslomet)

Retrieved 2026-09-26. WebFetch/curl only, no browser. One line per point.

## se-umu — Umeå University

- Scope: listed, 4 programmes (Industrial Design BFA, Life Science BSc, International Business and Economics, Architecture 5-year).
- Completeness: UmU's own list block (API `api.cms.umu.se/UtbildningList`, filters bachelor's level `ag-n` + English `ben-s`) returns `"totalMatching":4`; the same four are what the hand-off page renders. Hand-off count: 4, all first-cycle entry.
- Architecture is a 5-year programme to "Degree of Master of Architecture" ("arkitektexamen"), but it is a school-leaver entry listed by UmU under bachelor's level and "Teaching is in English"; kept, credential spelled out, years 5.
- Architecture 2027: no autumn-2027 occasion on the programme page yet (only "Autumn 2026 … Second admissions round for EU/EEA citizens"); UmU key-dates page lists it under "Programmes only open in the 2nd application round 15 March - 15 April 2027". Selection text marked "2026 criteria; 2027 not yet published".
- Round risk: the 2027 occasions for Industrial Design, Life Science and IBE are "International admissions round HT27" only. In 2026 IBE also had "Second admissions round for EU/EEA citizens HT26"; none published yet for 2027. University Admissions: "If you haven't yet completed your IB Diploma programme but are in your last year at the time of application, we recommend you apply to the second admissions round only if you're a citizen of an EU/EEA country." Recorded as a note, not as a bar.
- Industrial Design occasion: "General entry requirements for bachelor's studies must be submitted no later than supporting documentation deadline for Second admissions round (Autumn)" — so a final-year student can apply in January.
- Date conflict, left out: first-round bachelor's results. UmU key dates say "Admission results published (Bachelor's): 6 April 2027"; UID admission page and University Admissions say "8 April". Not recorded in the file.
- Minor internal inconsistency on UID admission page: "15 October 2026 Application opens" vs UmU/UA "16 October 2026"; and "not to wait until the February 2 deadline" vs its own "1 February 2027 Last day". Recorded 16 Oct and 1 Feb (UA and UmU key dates agree).
- UID admission page also shows "The work samples submission window is now closed" (per WebFetch; stale widget, 2027 assignment PDF `bfa-work-samples-2027.pdf` is linked). Could not verify when the upload opens.
- Contradicts data/countries/se.json: country note "home to one of Europe's most respected industrial design schools" is unsourced by UmU pages I read; not used. `englishBachelors` "Four bachelor's programmes, all taught in English" matches the page ("All programmes are taught entirely in English") — but the four include the 5-year Architecture degree, not four bachelor's degrees.
- IB translation from antagning.se table: Maths 3b/3c = AI SL at 4, AA SL at 3, or AA/AI HL at 3; Biology 2/Chemistry 2 = SL at 4 or HL at 3; Naturkunskap 2 = ESS SL or two of Biology, Chemistry, Physics. UmU has no IB page.

## se-mau — Malmö University

- Scope: listed, 6 programmes (European Studies, Human Rights, International Migration and Ethnic Relations, International Relations, Peace and Conflict Studies: BA; Interaction Design: BSc). All six pages show "30 August 2027 - 9 June 2030".
- Completeness: MAU's bachelor's page lists exactly these six under "Bachelor's programmes (180 Credits)" ("Malmö University offers a variety of bachelor's degree programmes taught in English"). Hand-off count: 6, bachelor's only. Matches data/countries/se.json `englishBachelors` ("Six: …").
- Could not verify against Universityadmissions.se: its programme search is an Angular app whose search API I could not locate by fetch; no browser used.
- Could not verify which of the six are offered in the second (EU/EEA) round for 2027: the pages show no application code or round until the application opens. Interaction Design shows a second instance ("Other instance or pace of study", same dates), consistent with two rounds. MAU's general text: "Citizens from the European Union (EU), a European Economic Area (EEA) country or Switzerland can also apply in the second admission round."
- Date conflict: MAU's admissions page gives the second round as "Application period: 16 March–15 April" and "Admissions results published: 10 July"; University Admissions gives "15 March 2027 Application round opens" and "9 July Admissions results published". Recorded UA's 15 March (label names MAU's 16 March); left second-round results out.
- Date conflict: MAU's step-by-step says "Make sure to apply by 16 January through universityadmissions.se"; its own admission-rounds block and UA say 15 January. Recorded 15 January.
- IB: entry is "General entry requirements + English 6" (+ "Civics 1b" for European Studies and Peace and Conflict Studies). antagning.se: "Samhällskunskap 1b … IB-examen", so the Diploma covers it; no extra IB subject needed.
- Selection "66% Upper Secondary Grades - 34% Swedish Scholastic Aptitude Test (SweSAT)" with "the SweSAT is a test only available in Swedish, and is in no way mandatory for admission" (quoted in a note).
- Degree titles from the programme syllabi: "Bachelor of Arts with a Major in …" (HGPSK, SGFRE, SGIME, SGMRE; SGINE from its autumn-2026 syllabus) and "Degree of Bachelor of Science with a major in Interaction Design" (TGIDE, autumn 2027).
- Broken official link: IR's page links a 2027 syllabus (`…/f03a1161-…/20272`) that returns "Ingenting kunde hittas"; used the 2026 syllabus for the BA title.
- data/countries/se.json note "Twenty minutes over the bridge from Copenhagen" not checked against an MAU page; not used.

## se-ltu — Luleå University of Technology

- Scope: listed, 5 programmes. LTU's Bachelor Programmes page says "5 hits": Computer Game Development and Programming, Computer Graphics for Games and Film, Computer Game Design (all Skellefteå), Mineral Resource Engineering (Luleå), Music (Piteå). Hand-off count: 5, all "Programme - First cycle - 180 Cr".
- Contradicts data/countries/se.json: `englishBachelors` says "Four: Computer Graphics for Games and Film, Computer Game Development and Programming, Mineral Resource Engineering, and Music"; LTU now lists a fifth, "Bachelor Programme in Computer Game Design" (LTU-87458, start 2027-08-30). Its page offers only an "Autumn 2027" syllabus (the others show Autumn 2025/2026/2027), hence "New for 2027" in the record. The se.json count sentence ("Umea and Lulea four") is also stale.
- Every 2027 occasion is "International students", "Last day for application : 2027-01-15", 10 places (Music Composition and Church Music 6). No April 2027 occasion yet. In autumn 2026 the same programmes also had April-round occasions (LTU-87455 CG, 20 places; LTU-87456 Game Dev, 20; LTU-85017 Mineral, 10; each "Sista ansökningsdag : 2026-04-15"). Recorded as a note ("may still be added"), not as fact.
- Music: page says "All of the specialisations are taught in Swedish. The Classical Musician, Composition, and Church Musician specialisations are taught in English and Swedish." The occasions say "Language : English". Listed as one programme (three English tracks) with the "English and Swedish" caveat in `ib`. Degree: "Degree of Bachelor of Fine Arts in Music- Major Music" (BFA).
- Music audition dates for 2027: not published; LTU's how-to-apply page still says "no later than 15 January 2025". Could not verify audition format/location for 2027.
- Degree titles: Mineral "Degree of Bachelor of Science - Major; Natural Resources Engineering…" (BSc). CG "Degree of Bachelor - Major; Media Technology…" → "Bachelor (180 credits)"; Game Dev and Game Design pages give no degree link, same credential used (unverified).
- IB translations (antagning.se): Ma 2a-2c = any IB maths (AI SL at 3 gives Ma 2a); Ma 3b/3c = AI SL 4, AA SL 3, or any HL maths 3; Ma 4 = AA SL 4 or AA/AI HL 3; Physics 2 = Physics SL/HL at 4 (HL 3). Chemistry 1 is not in the antagning table; I wrote "Chemistry at grade 4 (3 at HL)" from the Chemistry 2 row — the strictest reading, unverified that other IB subjects could cover Chemistry 1.
- First-round results 8 April 2027 recorded from University Admissions (no LTU page checked for it).
