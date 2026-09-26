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
