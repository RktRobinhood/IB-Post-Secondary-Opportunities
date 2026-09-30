# ee findings
## ee-ut (listed, 3 programmes)
- ut.ee, taltech.ee, emu.ee are behind a Cloudflare JS challenge (curl/WebFetch 403); the real Chrome tab passes it on its own after ~10-15s (no interaction). Read via javascript textContent.
- Handoff: bachelors page states "3 first level programmes" (BA Business Admin, BSc Science and Technology, Medicine 6y). Matches country record and studyinestonia list.
- 2027: "Admission deadlines, admission requirements ... for the 2027 intake will be added ... by the end of December." -> lastYear 2 Jan-15 April 2026. All criteria are 2026.
- Fees: BA 4,200; S&T 6,000; Medicine 13,200 a year; no EU/non-EU distinction on programme pages. cost-tuition page: no more waivers for non-EU from 2026/27.
- IB: leads conflict on English resolved: English page lists "International Baccalaureate (IB) Diploma Programme in English language with Diploma" as accepted.
- Country requirements: only diploma marked "IB Diploma Awarded" qualifies; can apply with current grades.
## ee-taltech (listed, 4)
- Cloudflare wall, read via Chrome. 4 bachelors confirmed on /en/programmes ("TalTech offers 4 Bachelor's").
- EU: free except School of Business and Governance (IBA, Law €5,000 for EU/EEA and non-EU). Deadline 2026: EU/EEA 1 June (non-EU 1 April). 2027 not published.
- IB waives English proof (bachelor's). IB Diploma awarded required.
- Places not published on pages read.
## ee-tlu (listed, 6)
- curl works. 2027 dates PUBLISHED: bachelor's "November 1, 2026 – March 1, 2027" (application-deadlines page, all bachelor's) -> dates opens/closes (who any).
- Fee page gives 2027/28 bachelor fees (per year): AV 5,000; Crossmedia 5,000; Law 5,800; LAH 4,600; LASS 5,000; PG 5,000. CONFLICT with data/countries/ee.json (4,800/4,600/5,400/4,200/4,600/4,800 = older year). Page: "Where not specified, tuition fees are the same for all students".
- IB: "Students who have completed International Baccalaureate studies can submit their graduation documents as proof of English". No IB points/subjects. Enrolment threshold 65/100.
- Places: AV 40 only. Others unpublished on page.
- Programme URLs: studyinestonia node links redirect to /en/bfm/audiovisual-media etc.; used canonical.
## ee-ebs (listed, 3)
- curl works (ebs.ee redirects to www.ebs.ee/en/university/...). List page shows 3 bachelor's (IBA, Impactful Entrepreneurship, Product and Technology Management), all "Bachelor of Arts in Social Sciences (BA)".
- Fees from programme pages/adm page: IBA 4,050+3,680 = €7,730; IE 3,680+4,050 = €7,730; PTM 4,050 x2 = €8,100 (matches ee.json). Same for EU and non-EU; EU/EEA no application fee (€120 otherwise).
- Deadlines: page shows "Application period 1 February – 1 April Applicants from EU, EEA, USA, Canada and Japan" / "1 February – 30 June Applicants from Latvia and Finland" with NO year; "Admissions open in February". Recorded as lastYear 2026 with "page shows no year".
- IB (international-admissions page): "The minimum score is 24 points." EE/TOK min D; HL each >=3, HL total 12; SL one may be 2, SL total 9. English B2 by test only (IB not listed as a waiver); waived only for previous education fully in English in EU/EEA/US/UK etc.
- IBA needs "sufficient mathematics results", no grade.
- No places figure published.
## ee-emu (listed, 1)
- Cloudflare; read in Chrome. Only Veterinary Medicine (integrated 6y, 38 places, 9,800 EUR/yr). "Number of study places 38" (year not stated on page). Matches country record.
- 2026 cycle: "June 1 for the EU/EEA, UK, Georgian, Ukrainian, Turkish and Switzerland students" (non-EU May 4), decision June 26, 2026. 2027 unpublished -> lastYear.
- Selection: ISAT 200 x0.2 = max 40 pts + motivation letter max 10 pts. ISAT sitting for 2026 intake had to be by May 2026 (registration 13 April).
- IB: english-language-requirements lists "IB Diploma Programme in English language with Diploma". No IB points/subjects.
- Fees page table: Vet application fee "-" (none); fee 9,800/yr, no EU distinction.
## ee-emta (listed, 4)
- curl works. Fees page: "1750 €/year" for EU (and Ukrainian) students English-taught BA/MA 2026/27; non-EU 7,700 per national list (not recorded).
- Dept page lists majors; the national list (2 "programmes": Classical Music Performance; Composition and Improvisational Music) groups them. Official ÕIS curriculum list 2026 (ois.eamt.ee) shows 4 English bachelor's curricula, each 3y/180 ECTS: Composition and Multimedia, Sound Engineering and Music Production, Jazz Studies, Classical Music Performance. I listed those 4 (CONFLICT with data/countries/ee.json "2").
- Traditional and Folk Music BA is Estonian only; Drama, Music Education etc Estonian only.
- Admission dates page: "Information about next year’s admissions will be published in December 2026." No 2026 window on that page -> no lastYear. Application fee 75 EUR. DreamApply for English curricula.
- IB: no IB-specific page; documents required: previous-level certificate with grades + proof of English.
## ee-eava (none)
- curl works. catp page: 120 ECTS (basic + speciality modules) "can currently only be transferred by crediting the ATPL theory and practical training of a flight school". 1-year CATP: "designed especially for professional pilots" (CPL/ATPL recognised for 120 ECTS); "Admission period for the 2026/2027 academic year has ended". 3-year page has no admission requirements/fee/deadline text at all.
- CAM page: "We are not accepting applications for this programme for the 2026/2027 academic year." (ee.json already says so). 2027 unknown -> not listed.
- Scope none is a judgement call: the 3-year CATP is formally a 180 ECTS BSc in English but shows no school-leaver entry route; flag for release check.
- Estonian-taught: Aircraft Engineering, Air Traffic Services, Aircraft Piloting, Aviation Management, AITT under "Programmes Taught in Estonian" nav.
## ee-tallinn-health-university-of-applied-sciences (none)
- curl works. Assistant Pharmacist how-to-apply page: "Admission to this programme is not available in 2026." with only a 2023 schedule (latest). Programme page otherwise 3y prof. higher education, English, 3,100/semester. Study in Estonia list still shows it (CONFLICT with national list / ee.json "1"). Recorded none; if the college confirms a 2027 intake it should become listed.
## ee-euas (listed, 4 cards: 3 + joint programme as a family path)
- curl works. Bachelor's page lists 4 undergraduate (plus Master's IBA). Program names on page: "Creativity and Business Innovations (Joint Programme)", "Creativity and Business Innovation", "Artificial Intelligence Driven Software Technologies and Entrepreneurship" (CONFLICT with ee.json name "Software Development and Entrepreneurship"; studyinestonia still links /program/software_development_and_entrepreneurship, which I did not open), "Game Design and Development". Joint programme and CBI share a family card.
- Fees on programme pages: EU 7,880 monthly plan / 7,820 semester plan (non-EU 8,380/8,320) for CBI, AI, Game (CONFLICT with national list/ee.json 7,120 EU/7,520 non-EU). Joint: EU 6,260/6,200 (non-EU 6,760/6,700) (list said 5,680/6,080). Plus €500 commencement fee for EU citizens.
- Deadlines on pages: "20.09.2026 (EU) / 30.06.2026 (non-EU)". Joint programme: "Next admission in autumn 2027" (no date). 2027 not published.
- IB: doc requirements list "INTERNATIONAL BACCALAUREATE: Diploma ... Academic Transcript"; English certificate required (IELTS 5.5) waived only for UK/US/CA/AU/NZ/IE.
## ee-baltic-methodist-theological-seminary
- curl works. English curriculum exists: "offered in three parallel curricula ... estonian, english or Russian". 3-year bachelor's in Theology and Mission (credential wording: "bachelor's degree in theology and mission", degree title not stated). EU requirements: secondary certificate, motivation letter, pastor recommendation (12 months active), Bible quiz, interview. 2026 cycle: "Applications can be submitted until 11.08.2026"; interviews 13-15.08. Tuition 2,600/yr 2026/27 (matches ee.json). 4 study days a month (11 sessions a year). City Tallinn (Narva mnt 51) - set by country record.
