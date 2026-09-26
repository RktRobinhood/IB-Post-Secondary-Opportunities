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

## se-slu — Swedish University of Agricultural Sciences

- Scope: listed, 1 programme. SLU's bachelor's page: "SLU offers one international Bachelor's programme, Forest and Landscape. The application period for international students is from 16 October 2026 to 15 January 2027 for studies starting in the autumn semester of 2027." Hand-off is that page (1 English programme; it links Swedish-taught ones only via the Swedish site). Matches data/countries/se.json.
- Forest and Landscape facts block: "Next start: HT 2027", "Application deadline for international students: 2027-01-15", "Application deadline for Swedish students: 2027-04-15", "Study location: Alnarp", "Language: English". Recorded 15 April as the second (national) round close, labelled with SLU's words "Swedish students"; the second round is open to EU/EEA citizens per University Admissions.
- Page glitch: the admission paragraph says "There are two admission rounds for this Master's programme" on a bachelor's page. Not used.
- IB: requirements "Mathematics 2a, 2b or 2c Natural sciences 2 Social sciences 1b … English 6"; antagning.se maps Naturkunskap 2 to "Environmental Systems, SL eller två av ämnena Chemistry, Physics och Biology" and Samhällskunskap 1b to "IB-examen". SLU also mentions "general substitute requirements" for Natural sciences 2 (not read).
- Could not verify completeness against Universityadmissions.se search (JS app); relied on SLU's own "one international Bachelor's programme".

## se-ki — Karolinska Institutet

- Scope: listed, 1 programme. KI: "Karolinska Institutet offers one bachelor's programme in English, the Bachelor's Programme in Biomedicine." KI's programme search (Bachelor + English) shows "1 result … Autumn 2026, Autumn 2027". Hand-off: KI's "Apply for a bachelor's programme" page (one programme, bachelor's only). Matches data/countries/se.json.
- Two 2027 intakes on the programme page: "First intake Autumn 2027 … KI-D7000 … Application deadline: 2027-01-15" and "Second intake Autumn 2027 … KI-D8000 … Application deadline: 2027-04-15". Degree: "Bachelor of Medical Science with a Major in Biomedicine". Location Solna.
- Round rule (quoted in a note): "The first admissions round is open for non-EU and EU/EEA citizens with completed upper secondary studies" … "If you are an EU/EEA citizen in your final upper secondary school year you can apply to the Second admissions round." Second-round documentation: "21 June 2027* … *… until 5 July 2027 to submit documentation of your completed upper secondary studies".
- Second-round selection: "final upper secondary school qualifications and results from the Swedish Scholastic Aptitude Test. The test is given in Swedish and is not a requirement."
- IB: Biology 2, Chemistry 2, Mathematics 4, English 6 → Biology and Chemistry SL at 4 / HL at 3; Ma 4 = AA SL at 4 or AA/AI HL at 3 (antagning.se). KI: "KI is not involved in the assessment of your upper secondary school credentials."
- data/countries/se.json note "it awards the Nobel Prize in Medicine" not checked on a KI page in this run; not used.

## no-uib — University of Bergen

- Scope: none, language Norwegian. UiB's programme finder, Bachelor's + English, "Displaying 1-3 of totally 3 hits": Kinesisk, Samfunnsøkonomi, Sosialantropologi. Their pages say "Undervisningsspråk: Norsk, engelsk og kinesisk" / "Norsk og engelsk" and "Søk på Samordna opptak". None is an English-taught degree. Agrees with data/countries/no.json ("None in practice … all three are Norwegian-language degrees with English components").
- Arts bachelor's at KMD (applied via Søknadsweb, not Samordna): kunst-bachelor and design-bachelor pages say "Undervisningsspråk Norsk". Other KMD bachelor slugs I guessed returned 404; not exhaustive.
- Hand-off: UiB programme finder filtered to bachelor's, `?study_level=bachelor` → "Displaying 1-10 of totally 62 hits" (bachelor's only). Caveat: the finder is flaky by fetch — `/en/programmes?study_level=bachelor` and paged URLs returned "3 hits" on some requests; the `/en/studies/programmes?study_level=bachelor` URL returned 62 on re-check.
- Could not find a UiB English page that states in words that bachelor's are taught in Norwegian or need Norwegian (the English admissions pages cover master's only). The none verdict rests on the programme finder and the Samordna opptak rule that general admission needs Norwegian.
- IB way in (Samordna IB page): "Norwegian A på higher level eller … Swedish A på higher eller standard level eller Danish A på higher eller standard level" at grade 3; for 2021+ diplomas Norwegian B only at HL ("På IB-diplom fra og med 2021 dekker Norwegian A … eller Norwegian B på Higher level kravet i norsk"). no-ntnu's `ib` line omits Norwegian B HL; mine includes it.
- MATTE4 (Samfunnsøkonomi): Samordna IB table "4 i studiekompetansefaget matematikk (224 timer): Mathematics på standard level (alle kurs) med karakteren 3 eller Mathematics på higher level (alle kurs) med karakteren 3".
- Dates: none recorded. Samordna opptak's deadline page says "Gjeld for opptaket til universitet og høgskole i 2026"; 2027 calendar not published. Note says "has been 15 April".

## no-uit — UiT The Arctic University of Norway

- Scope: none, language Norwegian. UiT admission page: "UiT the Arctic University of Norway currently does not offer any bachelor programmes taught in English." FAQ: "Please note that for bachelor programmes and integrated master degrees you have to document sufficient Norwegian language proficiency, and they are not taught in English." Agrees with data/countries/no.json.
- Hand-off: en.uit.no/admission (international admissions; states the no-English-bachelor's rule). No bachelor's list to count.
- Contradicts data/countries/no.json note: "The world's northernmost university" — not found on UiT pages I read; not used. The same note's "Master's applications open 1 February 2027" not checked (master's, out of scope).
- UiT FAQ: "Nordic applicants may meet the Norwegian language requirements with completed High School from their home country." Quoted as UiT's words in a note; whether a Danish-school IB counts as "completed High School from their home country" is not stated — could not verify.
- Summary campuses from UiT's About page: "The main campuses are located in Tromsø, Alta, Narvik and Harstad".
- Dates: none recorded (Samordna opptak 2027 calendar not published).

## no-nih — Norwegian School of Sport Sciences

- Scope: none, language Norwegian. NIH Studies: "We offer online courses, one-year, master, and Ph.d. programs in English." Programs in English lists 2 master's, online courses, 1 one-year study (Sport, Culture and Development Cooperation), PhD — no bachelor's. Admission page: "You apply for one-year studies, bachelor- and 5-year integrated master programs through the Samordna opptak application portal." Agrees with data/countries/no.json.
- NIH's Norwegian list has four bachelor's: Friluftsliv, helse og naturguiding; Sport Management; Trenerrollen og idrettspsykologi; Trening, helse og prestasjon (each "Bachelor / Heltid / 3 år"). "Sport Management" has an English name but is not on the English list and its page is Norwegian-only ("Søknadsfrist: 15. april Studieplasser: 35").
- Hand-off: NIH's English "Application and admission" page (bachelor's via Samordna opptak). No bachelor's list in English to count.
- Contradicts data/countries/no.json note: "Ranked among the top three sport-science schools in the world since 2017" — not found on NIH pages I read; not used.
- NIH additional requirements: "If you wish to apply to one of our Norwegian language programs, you must have a documented B2 level of Norwegian", then points to Samordna opptak's list; Samordna's IB page counts Danish A (SL/HL) at 3 as meeting "kravet i norsk". Did not find a page equating the two explicitly.
- Dates: none recorded. NIH says "The ordinary deadline to apply through Samordna opptak is April 15" (no year); Samordna's calendar is for 2026.

## no-oslomet — Oslo Metropolitan University

- Scope: none, language Norwegian. Resolves data/countries/no.json's "Unclear — the programme filter indicates one, but it could not be identified": OsloMet's English search filtered to "Bachelor's degree" (`education_type=6`) shows "Showing: 1 of 1 … Entrepreneurial Mindset, Resilience, and Long-Term Success (ØAADM3820) Bachelor's degree 1 semester 7.5 ECTS credits" — a mislabelled single course, not a degree programme.
- OsloMet's English "Study at OsloMet" page offers "Master's programmes", "Exchange students", "PhD programmes" and links "Study programmes in Norwegian"; no English bachelor's.
- Norwegian study overview, "Bachelorprogram (42)"; the hand-off is that filter (`studier/studieoversikt?education_type=6`), 42 hits, bachelor's only (loads 30, "p=2" shows all 42).
- Checked all 42 pages for "Undervisningsspråk": 25 say "Norsk" only; 17 say "Norsk Engelsk" (bioingeniør, ergoterapi, farmasi, ortopediingeniør, paramedisin, psykologi, radiografi, sykepleie, vernepleie, utviklingsstudier, anvendt datateknologi, dataingeniør, energi og miljø, informasjonsteknologi, maskiningeniør, matematisk modellering og datavitenskap, produktdesign); tegnspråk and tolking pages did not match the pattern. None is English-only.
- Utviklingsstudier: "Du søker på Samordna opptak med studiekode 215 484"; "store deler av undervisningen vil derfor foregå på engelsk" (a semester shared with exchange students) — still a Norwegian-entry degree with GSK. Produktdesign/Informasjonsteknologi: "må du ha generell studiekompetanse"; "Søkere med utdanningsbakgrunn fra land utenfor Norden må dokumentere at de oppfyller krav til norsk".
- data/countries/no.json note (product-design fee cut for non-EEA, "around 20,000 students") not checked; not used.
- Dates: none recorded (Samordna opptak 2027 calendar not published).

## Summary

- 9 of 9 done: 5 listed (se-umu 4, se-mau 6, se-ltu 5, se-slu 1, se-ki 1 = 17 programmes), 4 none (no-uib, no-uit, no-nih, no-oslomet; all Norwegian). `node scripts/check-schools.mjs`: 0 failing.
- Riskiest: whether IB final-year students can use the January round at UmU (3 programmes) and LTU (all 5) — only January occasions are published for 2027; recorded as notes pointing to University Admissions' advice, not as a bar.
- Riskiest: IB translations of Swedish course codes (Maths 3b/3c/4, Chemistry 1 at LTU) come from antagning.se's table, not from the universities.
- Date conflicts left out or flagged in labels: UmU first-round results (6 vs 8 April), MAU second round (16 vs 15 March; 10 vs 9 July), MAU "apply by 16 January" vs 15 January. No Norwegian dates recorded (Samordna 2027 calendar unpublished).
- Contradicts data/countries: se.json LTU count (four → five, new Computer Game Design); no.json OsloMet "Unclear" resolved to none (the one "Bachelor's degree" is a 7.5-credit course).
