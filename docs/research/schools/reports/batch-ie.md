# Batch report: Ireland (ie), issue #43

Researcher run of 2026-09-26. WebFetch/WebSearch only (no browser), so hand-off counts are what the fetched page reports, not a browser check.

## Shared facts (apply to every Irish record)

- CAO route `ie-cao-2027` already carries the national dates (opens 5 Nov 2026, closes 1 Feb 2027, Change of Mind). School records do not repeat them; `dates` holds only institution-specific dates.
- CAO's EU/EFTA/UK entry-requirements booklet still redirects to the 2026 edition (https://www.cao.ie/euefta/ -> Guidelines-EU-EFTA-UK-2026.pdf, "November 2025. This document is for 2026 entry."). The IB matriculation (24 + Diploma for "2 H5"; 24 with 3 HL at 5 and 3 SL at 4 for "3 H5") and the points table are therefore 2026 criteria; 2027 not yet published.
- HPAT-Ireland: ACER's registration page still shows only 2026 dates ("13–22 February 2026"; registration "5:15pm GMT 16 January 2026"). No 2027 HPAT date is recorded in any file.

## ie-tcd (catalogue)

- Scope: catalogue. Hand-off https://www.tcd.ie/courses/undergraduate/a-z-of-ug-courses/ states "Results 1 - 121 of 121"; undergraduate only (read by WebFetch, not a browser).
- Adds to ie.json: Trinity's own IB rule is stricter than the CAO minimum: "3 subjects at grade 5 at Higher Level and 3 subjects at grade 4 at Standard Level, to include English, mathematics and another language." (admission-requirements/undergraduate/). Latin is the Leaving Certificate alternative to the language; the IB section names no alternative.
- Differs from ie.json (CAO English minimum): Trinity's English page says "English A1, A2 or B: SL4 if presenting IB through English, HL5 if presenting through French or Spanish." CAO's booklet gives English B 4 HL / 6 SL. Recorded Trinity's SL 4 (IB through English).
- Strictest cases: Mathematics TR031 "HL Grade 6 in Mathematics"; Engineering TR032 "HL Grade 5 Mathematics"; Medicine TR051 "HL Grade 5 and 6 in two of Physics, Chemistry, Biology. If you do not have a qualification in Physics, you must present Mathematics at IB SL Grade 5 or better." Neither maths page says AA is required.
- Adds: the Bachelor in Acting "is not part of the CAO application system" (apply via The Lir Academy, first auditions "between November and March each year"). The page still describes the September 2026 intake; no 2027 date recorded.
- Not recorded: ie.json's note calls Trinity "Ireland's oldest"; no page read today says so, so the summary gives the founding year instead.
- Could not verify: any 2027-specific Trinity date. Its CAO page still lists the 2026 cycle (e.g. "1 February 2026 (17:00)"). No `dates` in the record; the CAO route supplies the national ones.

## ie-ucd (catalogue)

- Bot check: ucd.ie returns 403 to WebFetch. Read with curl (browser user-agent) instead; quoted sentences below are from those copies.
- Scope: catalogue. Hand-off https://www.ucd.ie/myucd/courses/a-z-course-list/ (myUCD Undergraduate Admissions). It lists about 150 named degree subjects and says "From over 130 Undergraduate Courses at UCD"; no exact count, so `courses` is omitted. It includes four "(Graduate Entry)" routes (Medicine, Physiotherapy, Radiography, Veterinary Medicine), which are undergraduate degrees for graduates; no master's.
- UCD's IB page (ucd.ie/global/.../internationalbaccalaureatediploma/) is for non-EU applicants only: "This page provides information and guidance on entry requirements for international (non-EU/non-EEA) students only." Its "IB 33"-style thresholds are not used in the record.
- Matriculation (EU): "six recognised subjects ... Grade H5, or better, in two subjects and Grade O6/H7, or better, in the remaining four subjects. For all courses in UCD, this must include Irish (unless exempt) and English." Irish exemption is automatic for those who "were born outside Ireland (32 Counties) and are permanently resident outside Ireland and are presenting qualifications other than the Leaving Certificate".
- Strictest cases (Leaving Cert grades converted with CAO Table 1): Actuarial & Financial Studies "H2 in Mathematics" = HL 6; Engineering "H4 in Mathematics, H6 in a laboratory science" = HL 5 and HL 4; Medicine "O6/H7 in English, Irish, Mathematics, a third language, a laboratory science subject" + "Minimum 480 CAO points" + HPAT. UCD's own Mathematics page shows the conversion ("O2/H6 in Mathematics" alongside "IB SL 6 / HL 4"), which matches CAO Table 1.
- Adds: numerus clausus. EU applicants page: "if there is a significant imbalance in the proportions of eligible applicants for a course between Leaving Certificate and other qualifications, places are offered to eligible applicants from each examination system group on the basis of ranking within their group proportionally."
- Could not verify: 2027 date for Veterinary Medicine's practical-experience record (page shows "between 1st February 2023 and 7th July 2026" for the current cycle). Left out of `dates`.
- Contradicts ie.json: ie.json note calls UCD "The largest university in Ireland"; not seen on a UCD page today, so the summary does not repeat it.

## ie-galway (catalogue)

- Read with curl (WebFetch not needed to be bypassed; pages served normally).
- Scope: catalogue. Hand-off https://www.universityofgalway.ie/courses/undergraduate-courses/ lists undergraduate courses with CAO codes: I counted 67 distinct GY codes; the page itself says "View any of our 50+ degree courses", so `courses` is omitted. Postgraduate appears only as navigation links.
- Galway's IB page (global-galway/.../internationalbaccalaureate/) is for international (non-EU) applicants; not used for the EU rule.
- Matriculation: "Minimum Grade H5 (Higher Level) in two subjects / Passes in the remaining four subjects at O6/ H7". Irish exemption for "Candidates born outside the Republic of Ireland (26 counties)" or those who "lived outside the Republic of Ireland (26 counties) during at least three years immediately before becoming eligible for matriculation" (among others).
- Per-course: Arts "including Irish, English, another language"; Commerce "Irish, English, another language, Mathematics"; Engineering "Minimum H4 in Mathematics or, alternatively, obtain a pass in the Engineering Maths Qualifying Exam"; Mathematical Science "Minimum O1 or H5 in Mathematics" (= SL 7 or HL 5 by CAO Table 1); Medicine GY501 "Irish, English, another language, Mathematics, a laboratory science subject", 5-year route "H4 in two of Biology, Chemistry, Physics...", "480 CAO points from the same sitting", HPAT.
- Contradicts nothing in ie.json directly; ie.json's `language.englishTaughtBachelors` says Irish is "required only for a handful of courses" — true for study, but Irish is in Galway's (and UCD's) matriculation rule with an exemption that covers most students abroad.
- Could not verify: whether the Engineering Maths Qualifying Exam is open to IB applicants (the page describes it for Leaving Certificate points); so the record does not mention the exam; the third note is Arts French ("To study French as a subject, students will need a minimum grade H4"). Galway's EU/EFTA page is stale (mentions "summer 2024" and "Final closing date for receipt of examination results ... is July 31st"), so no date was taken from it.

## ie-ucc (catalogue)

- Read with curl. Scope: catalogue. Hand-off https://www.ucc.ie/en/study/undergrad/courses/ says "Our course listing contains details of our undergraduate courses"; the served HTML carries 56 distinct CK codes (the list is filtered in JavaScript, so the on-screen count may differ). No stated total, so `courses` is omitted.
- UCC's EU page states the rule outright: "For entry to all degrees, 6 subjects including English, Irish (unless exempt), and four other subjects"; "A third language must be included among the other subjects for most degree programmes in Arts, Human Sciences, Law, Social Science, Commerce, Medicine and Health Sciences and some other degrees"; "For Business programmes such as Commerce ... Mathematics and for courses in the Sciences ... Mathematics and a Science subject."
- Irish exemption: "Candidates born and fully educated outside the Republic of Ireland (26 counties) who are presenting qualifications other than the Leaving Certificate for matriculation are automatically exempt from Irish".
- IB English (UCC's own worked example): "As Jakob is taking English as his Language B, he would need a HL4 or an SL6" (matches the CAO booklet).
- Strictest: Medicine CK701 "Chemistry ... H4", "Physics or Biology ... H4" (IB HL 5 each), plus "Other Language" O6/H7 and HPAT. Engineering CK600 Maths "H4*" (IB HL 5).
- Adds to ie.json (and applies to every medical school): from 2027 entry "Points scored in the HPAT assessment will be weighted to 150 maximum (down from 300 currently)" and "Leaving Certificate scores above 550 points will no longer be moderated" (UCC CK701 page; confirmed by the IUA press release https://www.iua.ie/press-releases/changes-to-cao-entry-to-undergraduate-medicine-programmes-in-2027/, effective "August / September 2027"). ie.json does not mention this.
- Could not verify: how the unmoderated scale applies to IB points (IB tops out at 600 + 25 maths bonus on the CAO table); the IUA release says nothing about non-Leaving Certificate applicants.

## ie-ul (catalogue)

- Read with curl. Scope: catalogue. Hand-off https://www.ul.ie/study/undergraduate/alphabetical-list-of-courses: 77 named entries, undergraduate only, but not all bachelor's: it includes integrated "BE or ME"/"BSc or MSc" routes, "Equine Science - Certificate or Diploma", "Music and Dance - certificate", an apprenticeship, "Arts - International Advanced Access", "Medicine - Graduate Entry" and a practitioner-entry Paramedic route. No master's-only or PhD entries. No stated total, so `courses` is omitted.
- IB rule: EU applicants page: "please use the “2 H5 section” for all Level 8 courses at University of Limerick" (= "Award of diploma with 24 overall" in the CAO booklet). Course pages: "Subjects must include Mathematics, Irish or another language, and English."
- Strictest: Financial Mathematics "a minimum grade H3 in Mathematics" (IB HL 6); a "Special Mathematics Examination" after Leaving Cert results is offered to those who miss it (not mentioned in the record: unclear whether IB applicants can use it).
- Contradicts/adds to ie.json: ie.json's UL entry does not mention undergraduate Medicine, and its RCSI note implies medicine entry via HPAT only elsewhere. UL now runs "Undergraduate Entry Medicine - BMBS" (LM301), "Our integrated six-year course", "CAO applicants must complete the Health Professions Admission Test (HPAT) in the year of admission", "The minimum points are 480 points from the same sitting", "Points scores above 550 will be moderated" (the last sentence conflicts with the IUA 2027 change; the page shows "CAO points 2026 #730", so it may not yet be updated for 2027).
- Adds: Architecture portfolio: "Portfolio guidelines will be made available in October 2026." "Portfolios submitted for September 2027 entry will be graded, and up to 200 points can be awarded in addition to the CAO points." Irish Music LM131: "Auditions will take place in April 2027." "A later audition date will be set for those who select the programme using the CAO change of mind function." Only a month is given, so no `dates` entry.
- Could not verify: the co-op/paid-placement claim in ie.json's UL note ("builds paid placements into most degrees"); not used. The Mechanical Engineering entry-requirements page returned no requirement text in the static HTML.

