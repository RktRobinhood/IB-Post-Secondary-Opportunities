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
