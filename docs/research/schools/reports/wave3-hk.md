# Wave 3: Hong Kong school records (7 October 2026)

All `catalogue` unless stated. Dates and fees are for the 2027 intake as the university's own pages publish them on 7 October 2026. Hong Kong sets no EU rate: every EU/EEA applicant is "non-local".

## hk-hku (catalogue, 3 flagships, 14 faculties/schools)
- Read: international-qualifications page (dates), its admissions-standards API (`/api/international_qualification/admission_standard/Denmark`, "IB Diploma": expected lower boundary and subject grades per programme, 57 programmes), tuition page, programme pages (BDS, MBBS, Surveying, CDS), Faculty of Dentistry BDS guidelines.
- Dates: opens 23 Sep 2026; first round noon 25 Nov 2026; predicted grades typed in by 1 Dec 2026; applications close noon 25 Aug 2027. The BDS faculty page confirms the same dates and asks for a complete file before 23 Jun 2027 (not recorded as a date).
- Fees: HK$250,000 non-STEM, HK$280,000 STEM, HK$590,000 MBBS and BDS (2027/28).
- `courses: 152` = "There are 152 programmes that match you" on the programme index (counts majors separately).
- The admissions-standards numbers come from a JavaScript selector (no static URL); cited as the international-qualifications page. Expected lower boundary: 34 to 43 IB points.
- Faculty urls: Dentistry, Architecture, Arts, Business, Education, Engineering, Medicine, Science, CDS, Innovation, BME use their own sites; Law, Social Sciences and Future Media use the programme page on admissions.hku.hk (no faculty admissions page found).
- Not verified: HKU's `needs` for English follow the standards table ("Grade 5 English A, or 6 English B"); the table does not say which year's boundaries it is. Page is live for 2027 entry (dates match).

## hk-cuhk (catalogue, 3 flagships, 8 faculties)
- Read: requirements page, important dates (2027 Admissions Exercise), 2027-entry IB sheet (PDF: preferences only, no grade minima), fees page (HK$230,000, 2027/28), programme pages (MBChB, CSE, IBBA, CSCI/CENG for the credentials), Faculty of Medicine non-JUPAS page.
- Dates: opens 2 Oct 2026 (page: "2 Oct 2026 Application Opens"); Advance Offer Round closes 12 Nov 2026; Regular Round closes 7 Jan 2027. Country record's "7 Jan" confirmed; its "From Feb 2026" note is a misprint on CUHK's page for the Regular Round announcement (page now reads "From Feb 2027").
- IB: minimum 30 of 45; English grade 4; Chinese grade 4, "may be exempted at the discretion of the Faculty Dean". Subject sheet is "preferences ... NOT subject requirements".
- Medicine faculty page (no year given): six subjects incl. three HL, Chemistry or Biology at HL; interviews of top-ranked after results in late July.
- Faculty urls for Law, Education, Social Science use CUHK admissions programme pages or the faculty's programme list; faculties' own sites expose no admissions page.

## hk-hkust (catalogue, 3 flagships, 5 schools)
- Read: international-qualifications page (dates, IB selector at `?general_requirement=46205`), admissions-grades PDF, English-requirement PDF, application-procedures, fees page, school and programme pages.
- Dates: opens 2 Oct 2026; priority round 25 Nov 2026 (recorded as "First round"); rolling from 26 Nov; closes 30 Jun 2027. Offers from late December (not recorded as a date).
- IB: no minimum; middle half of 2026 entrants 35 to 41 (2025: 35 to 40) including bonus points. Subject text uses "senior level Mathematics", not IB levels; recorded with `level: any` and the quote in `note`.
- English: IB English A grade 4, English B HL 4 / SL 5 (elar.pdf).
- Fee: HK$260,000 (non-local, year not stated on the page, sits beside "2027/28" for local fee).
- Country record says priority round also gates two named scholarships; not found on the pages read, so not repeated.

## hk-polyu (catalogue, 3 flagships, 11 faculties/schools)
- Read: key dates (a PNG timeline, read as an image), general requirements, admission figures, English, preferred subjects, tuition page, programme pages JS3310, JS3569, JS3290 (2027 international versions).
- Dates: opens 23 Sep 2026; first round (PolyU's "Early Round") 17 Nov 2026; Main Round 11 Feb 2027; rolling until 14 May 2027.
- IB: "typically 32 or more out of 45"; predicted 30+ may be interviewed. Middle half of 2026 entrants 33 to 38 (including TOK/EE points). The older lead hint "24 points with grade 4 in two HL" is not on the current page.
- Fee HK$240,000 (2027/28); initial fee HK$20,000 on accepting an offer.
- Faculty lines come from the "Preferred subjects" page, whose headings are used as names; most share that one url.

## hk-cityu (catalogue, 3 flagships, 4 faculties)
- cityu.edu.hk/admo is behind an Incapsula bot wall (curl, the browser pane and Chrome all got the challenge page; not bypassed). Facts come from the search tool's reading of the official pages, plus the earlier country record's quotes: opens 24 Sep 2026, Early Round 15 Nov 2026, Main Round 15 Jan 2027; IB Diploma needed for year-one entry; English A 4 / English B HL 4 / SL 5; Advanced Standing I needs 30 of 45.
- Vet Medicine criteria (Maths HL 4 or SL 5, Biology HL 4, Chemistry 4, English A 6 or English B HL 7) are from the JCC page, which still shows a 15 Nov 2025 deadline: recorded as "2026 criteria; 2027 not yet published".
- Fees: HK$190,000 (2026/27) and HK$392,000 for vet, from the country record (CityU fees page); 2027/28 not set. Faculty list is partial (JCC vet, Creative Media, Data Science, Engineering): the other colleges' pages could not be read. Needs a human re-read before release.

## hk-hkbu (catalogue, 3 flagships, 6 schools/faculties)
- Read: international-qualifications page, programme-search JSON, programme pages, fees page, application system event calendar.
- Dates (system calendar, 2027/28): opens 2 Oct 2026; Early Round to 16 Nov 2026; Main Round to 1 Feb 2027; Extended Round to 31 May 2027. Offers from late Dec 2026.
- IB: no minimum; middle half of 2026 entrants 30 to 34 (incl. TOK/EE); English A 4, B HL 4 / SL 5; Chinese qualification table for Chinese Medicine (IB Chinese A 5 HL / 6 SL, B 7 HL). Fee HK$240,000 (2027/28).
- Programme display names were shortened from the university's (Communication; Chinese Medicine and Biomedical Science) to stay under 48 characters.

## hk-lingnan (catalogue, 1 flagship, 3 faculties)
- ln.edu.hk is behind a Cloudflare wall (403 to curl, "Just a moment" in the browser pane; not bypassed). Read through the search tool only: rounds 30 Nov 2026 / 28 Feb 2027 / 30 Jun 2027; English A 4, B HL 4 / SL 5; non-local tuition HK$205,000 for 2027-28 (Animation and Digital Arts HK$165,000).
- The IB points minimum was not obtainable (one search summary said "6.0", unclear what it measures; not recorded). Needs a human re-read before release.

## hk-eduhk (catalogue, 2 flagships, 3 faculties)
- Read: international-qualifications entrance requirements, dates, procedures, programme list, fees page, programme pages.
- Dates (marked provisional by EdUHK): opens 5 Oct 2026; Early Round 16 Nov 2026; Main Round 6 Jan 2027; Late Round 7 May 2027; rolling. Fee HK$210,000 (2027/28, "non-local students"). IB: accepted, no points published; English A 4, B HL 4 / SL 5.
- Medium of instruction is stated only for Psychology and AI and Educational Technology ("all major courses ... English"); teacher-education double degrees and some others need Chinese. Scope is catalogue but the English claim does not hold for every degree: coordinator to decide whether the page's "every degree taught in English" line is acceptable.

## hk-hkapa (listed, 3 programmes)
- Read: deadlines page, admission requirements, fees, school pages. Applications opened 7 Sep 2026; Main Round closes 8 Dec 2026 (all programmes); Dance clearing round 30 Jan 2027 (Drama 15 Feb, Chinese Opera 30 Apr, Film and TV and Music main round only per the page's footnote).
- IB 24 points; English A SL 5 / HL 4, B SL 5 / HL 4. Fee HK$63,000 (2026/27; 2027/28 not published).
- Listed: Music, Dance, Theatre and Entertainment Arts. Left out: Chinese Opera, Drama and Film and Television (the page names them as Chinese-medium and asks for a Chinese qualification). The page does not state the medium for the three listed, but they ask for English only.

## hk-hsuhk (catalogue, 1 flagship, 5 schools)
- IB 24 points (3 HL + 3 SL, 12 from HL); Actuarial Studies needs Maths 5; English proof by IELTS 5.5 / TOEFL iBT 70 (IB English not listed). Important-dates page still shows the 2026 cycle (closed 10 Jun): `lastYear` used, no 2027 dates.
- Fees 2026-27 non-local first year HK$153,820 (most) / HK$193,240 (art and design). "Most modules are conducted in English" (Global Affairs Office page); Chinese-language degrees are not.

## hk-hkmu (catalogue, 0 flagships, 5 schools)
- Admissions pages are partly stale (a banner still says "2024/25 admission will be commenced on 1 October 2023"); the programmes page lists 2026 periods: 1st round 20 Oct 2025 to 31 Mar 2026, final round to 31 May 2026 (`lastYear`). IB 24 points minimum; English proof list does not label which row is IB.
- No tuition, no medium of instruction by programme found. Scope catalogue is provisional: coordinator to decide between catalogue and none.

## hk-hksyu (catalogue, 0 flagships, 4 faculties)
- IB page: IB Diploma at least 24 points; English IB 4 (HL/SL), IELTS 5.5, TOEFL 79; non-local applicants also show Chinese; dates table: opens 3 Dec 2026, non-local IB documents 15 Jun 2027, non-local applications close 30 Jun 2027. Application fee HK$650. No tuition found.
- No per-programme medium of instruction; scope catalogue is provisional (as HKMU).

## hk-thei (catalogue, 0 flagships, 6 departments)
- Programme page lists 2026/27 degrees with fee (HK$117,000 to 187,020) and language (English for most; Putonghua or Cantonese for a few). No IB points; individual assessment; IB English B HL 4 / SL 5 or A 4. No 2027 dates and no last-year deadline on the pages.

## Gate state
- validate and check-schools: 0 failing for hk-* (7 Oct 2026). Long display names remaining: none over 48 characters.
## Re-read (7 Oct)

Read in a real Chrome session (the automated tab cleared CityU but Lingnan's Cloudflare check only passed in Chrome). Run stopped at the usage ceiling after HKMU; HKSYU and THEI were not re-read.

### hk-cityu (catalogue) - rewritten from CityU's own pages
- Dates confirmed on the international-admissions page: opens 24 Sep 2026, Early Round 15 Nov 2026, Main Round 15 Jan 2027. IB Diploma for first-year entry; English A 4, English B HL 4 / SL 5; Advanced Standing I 30 of 45.
- Corrections: non-local tuition is HK$240,000 (2027/28), HK$400,000 for veterinary (fees page, non-local tab). The earlier HK$190,000 / HK$392,000 were wrong. Acceptance fee HK$20,000, application HK$600.
- Veterinary page is now the 2027/28 one: English A 6 or English B HL 7, Maths HL 4 / SL 5, Biology HL 4 and Chemistry HL 4 (was "Chemistry 4"), 70 hours animal work, CASPer 30% + subjects 70%, MMI; indicative IB 37 or more. Removed the "2026 criteria" caveat.
- BA Creative Media: old url (ba-creative-media-0) was the 3-year Advanced Standing page (1456A). Now the 4-year first-year page (JS1042). SCM's own page says international applicants are required to submit a portfolio within 10 days of applying (CityU's general page says strongly encouraged).
- Data Science: IB Maths table (IB_mathematics.pdf, read with pdf.js): AA HL or SL, AI HL only. The School of Data Science sits inside the College of Computing; faculty list is now the ten colleges/schools that run first-year programmes (Biomedicine, Business, Computing, Engineering, LASS, Science, JCC Vet, Creative Media, Energy and Environment, Law), each linked to its admo college page.
- Middle half of 2025 IB entrants: 32 to 38 (admissions-score-reference, includes TOK/EE points).

### hk-lingnan (catalogue) - rewritten
- Dates confirmed: opens 8 Oct 2026, Early Round 30 Nov 2026, Main Round 28 Feb 2027, Final Round 30 Jun 2027 (non-local).
- IB: the admission-information PDF lists "IB Diploma" with no points minimum. The earlier "6.0" was the IELTS requirement. English: A 4, B HL 4 / SL 5.
- Tuition HK$205,000 (UGC-funded, 2027-28); self-financed Animation and Digital Arts HK$165,000 (table year not labelled).
- The ADA application-interview page (portfolio, 3-minute presentation, 20 MB) now returns 404; those claims were removed. 34 programmes (was 33); faculties now five (Arts, Business, Social Sciences, Wu Jieh Yee School of Interdisciplinary Studies, School of Data Science).

### hk-eduhk (converted catalogue -> listed, 5 degrees)
- Non-local applicants need Chinese IB grade 4 unless the programme is English-medium (waiver case by case); that is why the medium matters.
- English stated on the department/faculty page: Psychology (all major courses), AI and Educational Technology (mainly English), Integrated Environmental Management (all major courses), Personal Finance (English), Special Education (mainly English).
- Left out: Digital Chinese Culture and Heritage Education (Chinese), Speech Pathology (English but needs fluent Cantonese), English Studies and Digital Communication, Creative and Digital Arts, Sports Science (no medium stated on pages opened), teacher-education double degrees (not checked).
- Fee HK$210,000 (2027/28); dates re-confirmed (5 Oct, 16 Nov, 6 Jan, 7 May).

### hk-hkmu (converted catalogue -> listed, 2 degrees)
- IB confirmed on the direct-admission selector: overall 24, IB English grade 4 or above; interview normally required. Dates still show the 2025/26 cycle (`lastYear` kept).
- HKMU documents course-code suffixes (C Chinese, B bilingual, others English) only for distance learning (dl/faq). Explicit "Language of instruction: English": Cyber and Computer Security, Electronic and Computer Engineering (listed). Also explicit English but not listed: English Language Teaching and English Language Studies (teacher education). Language Studies and Translation: "English and Chinese".
- By course-code letters (inference, not listed): the 14 business degrees, Computer Science, Data Science and AI, English Language and Culture, Psychology, Social Sciences are mostly English-coded. A later pass could list them.
- Not direct non-local: Nursing, Physiotherapy, Diagnostic Radiography, Medical Laboratory Science. Tuition 2026/27 from the non-local fee PDF: Cyber HK$111,490, Electronic and Computer Engineering HK$118,370.

### hk-hksyu, hk-thei: not re-read
- Still `catalogue` (so the site still says every degree is taught in English). Hold back.
