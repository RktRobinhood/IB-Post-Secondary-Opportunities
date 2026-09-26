# Batch report: nl-fontys, de-tu-berlin, de-bcb, de-frankfurt-school, de-whu, de-leuphana, lu-*, is-* (issue #43)

Researched 2026-09-26 with WebFetch/WebSearch only (no browser: the pane is shared). Hand-off checks below are
fetch-based, not browser-based; a JavaScript-rendered list may need a browser re-check.

## de-whu (listed, 1 programme)
- Scope listed: one bachelor's open for 2027, BSc International Business Administration (Vallendar), language "English or German/English"; Business Psychology page says "This program is being phased out as of 2026", so excluded.
- Hand-off = the programme page (no list page needed for one programme); fetched, it opens the BSc IBA page. Result count: 1.
- Dates are printed with years on the admissions page: "Application Deadline: January 31, 2027" / "March 31, 2027" / "May 15, 2027"; tests "February 20; February 21, 2027", "April 17; April 18, 2027", "May 29; May 30, 2027"; interviews "March 12; March 13; March 14, 2027", "May 7; May 8; May 9, 2027", "June 19; June 20, 2027". "Application Center opens in October" has no day/year, so no opens date recorded.
- No contradiction with de.json (note: "entry involves its own selection process, not just grades" matches).
- Scholarship: fees page says Global IB Scholarship "awards 20% of the tuition fees"; a WHU search snippet (other page) says 25% and five regional awards. Recorded 20% from the fees page; flag as a conflict.
- Could not verify: when the "6-week internship" listed under requirements must be completed; whether tuition €9,300/semester is the 2027 figure (page gives no year).

## de-bcb (listed, 3 programmes)
- Scope listed: three 4-year BAs (Economics, Politics, and Social Thought; Humanities, the Arts, and Social Thought; Artistic Practice and Society), each page: "Qualifying students receive both a German BA and an American BA". Excluded: BA-MA pathway, Academy Year/Project Year (non-degree).
- Hand-off = first-year application requirements page (deadlines, documents, English, IB sheet). The admissions page lists exactly the 3 BAs; fetched, 3 results.
- Cycle confirmed on the page: "We are now accepting applications for entry in Fall 2027." Dates printed without year except "IDP Berlin: February 6, 2027"; Early Action "November 1" / notification "December 31" recorded as 2026, Regular Decision "January 10" and Final "May 1" / "June 1" as 2027 from that stated cycle.
- Final deadline applies to "Citizens and residents of EU/EEA and Australia, Brazil, Canada, ..., the United Kingdom, and the United States" (recorded who: eu-eea-ch; Switzerland is not named on the page).
- IB: BCB's own sheet "Information Sheet on IB Diploma Recognition in Germany" (last updated September 2026) restates the KMK rule but omits the Maths SL footnote; de.json says Ikast-Brande Gymnasium is on the KMK exception list, so not repeated here. Warning for reviewers: a WebFetch summary of this PDF claimed "Mathematics must be taken at Higher Level" - false; the PDF text does not say that (read the PDF directly).
- Local language: each BA page says candidates "must demonstrate intermediate proficiency in German by the end of their second year" - put on every programme `ib`.
- No contradiction with de.json. Tuition is 2026-27 ("Off-campus Comprehensive Fee: €27,500"); 2027-28 not published.

## de-frankfurt-school (listed, 4 programmes)
- Scope listed: the four full-time BSc (Business Administration, AI & Data Engineering, Management Philosophy & Economics, Business Information Systems Engineering), each "Full-time | 7 semesters", 210 ECTS. BBA language "English or German* *from 4th semester onwards in English" - listed with an English-track note. Excluded: part-time German BA Betriebswirtschaftslehre (and its Quereinstieg).
- Hand-off https://www.frankfurt-school.de/en/study/bachelor lists 6 bachelor's (4 full-time English, 2 part-time German), bachelor's only. No English-only list page exists (/en/study/bachelor/bachelor-science returns 404).
- Dates: each programme page prints "Application Deadline: 30 June 2027" and "Start Date: 1 September 2027". CONFLICT on the MPE page: its FAQ still says "The application portal is open from 1 September 2025 to 30 June 2026" (stale). Recorded 30 June 2027 from the key-facts box. Assessment centre: "The following dates are currently available: 21 October 2026, 18 November 2026, 10 December 2026"; "your application must be submitted at least two weeks before your preferred Assessment Centre date".
- IB: pages list "IB Diploma" among recognised certificates; no points or subject rule published beyond "consult the DAAD website" for unlisted qualifications. Could not verify Frankfurt School's IB/KMK stance (a 2021 IB requirements PDF exists but is out of date; foundation-year and admission URLs from search 404).
- de.json englishBachelors matches the site. No contradiction.

## de-leuphana (listed, 7 programmes)
- Scope listed: seven English majors, each page "English (no German required)" except Studium Individuale: "English (Studium Individuale Core Modules), English & German (Please note that some modules may require German)" - included with that warning on `ib`. Places: CS:OSA 35, Digital Media 36, Economics 55, GESS 70, IBAE 160, Psychology 70, SI 40; all "Restricted admission: yes".
- Credentials from each page: Economics, Psychology, GESS, IBAE "Bachelor of Science (B.Sc.)"; Cultural Studies, Digital Media, Studium Individuale B.A.
- Hand-off https://www.leuphana.de/en/college/bachelor.html: 13 majors, bachelor's only (6 German, 7 English). No English-only list page found.
- Date: international-applications page: "First-year students can apply again from mid-May to 15 July 2027 for study start in the winter semester beginning in October 2027." Programme pages give "Mid May – July 15" without year. No opening day published.
- de.json englishBachelors ("Seven majors taught entirely in English") matches, with the Studium Individuale caveat above.
- English rule quoted: "IB Diploma with English as Language A at Higher Level with a final grade of at least 6.0" or "if the medium of instruction at your secondary school was English, you do not need to send an additional test."
- Could not verify: selection formula weightings; whether IB applicants must supply a KMK/uni-assist check (EU/EEA "can apply directly").

## de-tu-berlin (none)
- Scope none: the admission-requirements page says "German is required for all undergraduate degree programs." The all-programmes page's language filter shows "English (19)" and "German / English (7)", but none of these is a bachelor's (the requirements page is explicit). de.json has englishBachelors null - consistent.
- Hand-off: the page for bachelor's applicants with an international entrance qualification (fetched; it is an overview linking admission requirements, application groups, preparatory school).
- IB way in (language-skills page): C1 German via "DSH-2 or DSH-3", "TestDaF ... TDN 4 or higher in all modules (4-4-4-4)", "telc Deutsch C1 Hochschule", "Goethe-Zertifikat C2"; IB: "German language A at Standard Level or Higher Level or German language B at Higher Level, if German citizenship is additionally proven". A search snippet elsewhere said "TestDaF with at least 16 points"; the page itself says 4-4-4-4 - used the page.
- No dates recorded (none scope; WS 2027/28 windows not found on the fetched pages).

## lu-uni-lu (listed, 2 programmes)
- Bot check: uni.lu returns HTTP 202 (challenge) to curl and an empty page to WebFetch. Read via the r.jina.ai reader (public GET of the official page). Exact sentences used are quoted here.
- Scope listed. Of 38 bachelor's in the programme overview, the EN (monolingual) filter gives 2: Bachelor in Computer Science and Bachelor en Enseignement musical. Hand-off = that filtered list (2 results, bachelor's only; fetched through the reader, a browser re-check is advisable as the list is rendered by JavaScript).
- CONFLICT within uni.lu: the Computer Science card is tagged "EN", but its own page says "Teaching languages: DE + EN + FR". Its admissions page settles it: "The main language of instruction is English. However, a small component of the curriculum will require students to use a second language — either French or German." and "No certificate is required for French or German, although a B1 level is recommended." Listed, with that on `ib`.
- Music Education page: "Language: EN" and "Language requirements: English level C1 (CEFR), oral comprehension and expression of the three official languages of Luxembourg (Lëtzebuergësch, French and German) is an advantage". Audition/solfège test/interview "will take place in July".
- Excluded after reading each admissions page's "Language Skills": BCE English Studies ("English (C1) ... Second Language: French or German (B2) ... Third Language ... (A2)"), Business Administration ("B2 ... in French and in English"), Sciences économiques / Economics (EN+FR, B2 both), Applied IT ("French: B1"), Mathematics ("French: B2"), Physics ("French: B1"), Life Sciences Biology/Biomedicine ("French: B2"), Engineering tracks ("German: B2 (mandatory)"), Psychology ("German: at least level C1"), Animation (entry after 60 ECTS, not first-year).
- Contradicts lu.json englishBachelors ("A small multilingual bachelor portfolio; several programmes involve English alongside French or German"): two bachelor's are English-led. lu.json note "a compulsory semester abroad in every bachelor's degree" not verified beyond Economics' FAQ ("All students spend one semester abroad") - not used.
- Date: admissions page "Applications for the 2027–2028 academic year will open on 1 February 2027." Closing dates for 2027 not published (pages still show 2026: CS "EU: 1 Feb 2026 – 15 Jul 2026 / Non-EU: 1 Feb 2026 – 24 Mar 2026"; Music "01 February 2026 – 03 June 2026"). Admissions page: "The application criteria for the 2027–2028 academic year are currently under review and may be subject to change."
- Credential: pages call it "Bachelor in Computer Science" / "Bachelor in Music Education" and never say BSc/BA, so the full title is used.

## lu-lunex (listed, 5 programmes)
- Scope listed: five bachelor's, each page "English B2", "6 Semesters", "180 ECTS": Physiotherapy ("Start in April & October"), Osteopathy ("Bachelor of Health", "Start in October"), Sport and Exercise Science, International Sport Management, Nutrition Fitness and Health (all "Start in October"). Matches lu.json englishBachelors.
- Hand-off https://lunex.lu/en/study-overview/bachelor: 5 bachelor's, bachelor's only. Programme URLs are /en/study/bachelor-in-<name> (the /en/study-overview/bachelor/<name> paths 404 in the app).
- Pages are a JavaScript app; read from the server HTML with curl (fees sit in the embedded page data). Fee sentences, e.g. Physiotherapy "Winter Semester 2026 Registration fee: 695 € (one-time payment) Year 1: 899 € per month = 10788 € per year"; ISM/NFH "750 € per month = 9 000 € per year"; SES/Osteopathy "825 € per month = 9 900 € per year". 2027 winter-intake fees published only for NFH ("Winter Semester 2027 ... Registration fee: 745 €", same monthly rates) - recorded 2026-intake year-1 figures, labelled.
- No dates: "Applying to LUNEX is easy and possible at any time of the year." Application Day dates not published in text.
- Physiotherapy page: "To practice as a physiotherapist, you must have completed a Master in Physiotherapy." (a WebFetch summary said the same; confirmed in the HTML).
- lu.json note "the most straightforward English-language bachelor route in Luxembourg" is an unsourced superlative; not reused. "private" is sourced: "LUNEX is a trusted private higher education institution".
- Could not verify: whether an English-taught IB counts as B2 proof (the page asks for "Proof of English language skills (minimum B2 level CEFR)" without listing accepted proofs); credential titles other than Osteopathy's "Bachelor of Health" (pages say only "Bachelor"), so full programme titles used.
