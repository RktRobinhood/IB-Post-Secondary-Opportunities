# gb-a findings

## gb-oxford
- Flagships: PPE (L0V0), Computer Science (G400), English Language and Literature (Q300); source = each course page on ox.ac.uk (opened in browser tab; curl/WebFetch get 403 from Cloudflare). All closes 2026-10-15 stated on the course pages.
- Faculties: 4 divisions (Humanities, Social Sciences, MPLS, Medical Sciences). Division sites carry little admissions direction; lines draw on Oxford's central summary table (cited in sources) + medsci Medicine requirements page. Social Sciences url (socsci.ox.ac.uk/education) is thin.
- Fix: summary-table source URL replaced with its canonical (redirected) address.
- Unverifiable: CS page says "HL Mathematics" without AA/AI (both listed). Overseas fee for CS GBP 66,580 as the page shows.

## gb-cambridge
- Flagships: Natural Sciences, Classics (3-yr with Latin / 4-yr route), Economics; source = each undergraduate.study.cam.ac.uk course page. curl works there. Fees from the 2027-entry international fees table (groups: NatSci 46,872; Classics/Economics 30,798). Closes 2026-10-15 from application-dates page.
- Faculties: 6 Schools (Cambridge's own grouping). Schools have no admissions pages; urls are the UG-site pages that govern that group (college assessments, natural sciences, UCAT, admission tests, TMUA, ESAT). Lines from those pages.
- Unverifiable: HL Maths AA vs AI only where page says; Classics years set to 3 (4-yr route in about/ib). No fixes to other fields.

## gb-imperial
- Flagships: Aeronautical Engineering MEng (H401), Medicine MBBS/BSc (A100), Chemistry MSci (F103); source = each imperial.ac.uk/study/courses/undergraduate/... page (curl works). Closes: Medicine 2026-10-15, others 2027-01-13 (stated on the course pages; UCAS page confirms both dates). Overseas fees 2027 on each page (47,800 / 61,550 / 47,800).
- Faculties: 4 (Engineering, Natural Sciences, Medicine, Business School). Lines from Imperial's admissions-tests-by-department page and the Business School how-to-apply page; the faculty pages themselves are thin.
- Note: a web-search summary said Chemistry needs ESAT; Imperial's Chemistry page says the department uses no test (used the page).
- Medicine overseas fee 61,550 is the page's 2027 figure (may differ in clinical years).

## gb-ucl
- Flagships: Arts and Sciences (Societies) BASc (Y005), Architecture BSc (K100), Economics BSc (Econ) (L100). Sources: the ucl.ac.uk/study course pages (403 for curl; read in browser tab). Closes 2027-01-13 (course pages; UCAS confirms). International fees 2027/28: 36,800 / 40,800 / 40,800.
- Faculties: 10 (Arts & Humanities, Bartlett, Brain Sciences, Education & Society/IOE, Engineering Sciences, Laws, Life Sciences, MAPS, Medical Sciences, Social & Historical Sciences). Faculty pages are mostly marketing; lines come from UCL's "Tests, tasks and interviews" page, the MBBS admissions page and course pages. Population Health Sciences not listed (no first-year intake found).
- Unverified: BASc needs a "Social Science" at HL (no needs[] entry; stated in ib). The URL ucl.ac.uk/.../courses/economics-bsc 404s; the live page is economics-bsc-econ.

## gb-lse
- Flagships: Economics BSc (L101), International Relations BSc (L250), LLB (M100); sources = the lse.ac.uk course pages (curl works). Closes 2027-01-13 (course pages; UCAS confirms). Overseas fees 2027/28: 41,900 / 33,800 / 37,500.
- Faculties: LSE has departments, not faculties. 5 entries: Economics, Law School, International Relations, a maths-heavy-degrees group (entry requirements page), and "all other departments". Lines from course pages and LSE's entry requirements page.
- Note: entry-requirements page says Maths AA HL is "preferred (both streams considered)" for Economics; the Economics page says 7 in Mathematics (AA/AI both listed in needs). Redirected URL of entry-requirements page (Prospective-Students/How-to-Apply/entry-requirements) used for new sources; old capital-case URL left in existing fields.

## gb-kcl
- Flagships: War Studies BA (L252), Law LLB (M100), Neuroscience BSc (B140). Sources: kcl.ac.uk course pages + /entry-requirements (curl works; fees are in hidden page data, read via browser textContent). International fees 2027-28: 34,000 / 35,900 / 42,900. closes 2027-01-13 (course pages leave the deadline blank; UCAS page gives the date).
- Dropped Medicine as a flagship: international places are quota-limited and the selection/interview detail was only on an unopened 2023 PDF.
- Faculties: 9 (all KCL faculties incl. King's Business School). Faculty pages are marketing; urls for most are the representative course entry-requirements page, lines from those pages.

## gb-st-andrews
- Flagships: International Relations MA (L250), Astrophysics BSc (F511), Medicine BSc A100; sources: st-andrews.ac.uk/subjects course pages (curl works). Fees "EU and overseas" 34,910; Medicine "rest of the world" 41,600. Medicine closes 2026-10-15 (page); others 2027-01-13 (UCAS page).
- Faculties: 4 (Arts, Divinity, Science, Medicine) per St Andrews' "Faculties" page; Arts/Science urls are representative course pages since faculties have no admissions page.
- Medicine: selection facts (UCAT ranking, ~650 interviews, MMI format, overseas trained at Manchester) are from 2026-entry wording on the selection page.

## gb-durham
- Flagships: Natural Sciences (CFG0), Archaeology (F400), Law (M101). Sources: durham.ac.uk/study/courses/<name>/september-2027/ pages (curl gets 403 CloudFront; read in browser). 2027 fees are "not yet confirmed" on the pages, so tuitionEuEea quotes 2026 entry international fees (34,500 / 29,250 / 29,250). closes 2027-01-13 (UCAS page).
- Faculties: 4 (Arts and Humanities, Science, Social Sciences and Health, Business School). Faculty pages carry no admissions direction; lines from course pages and the UK-students grade table (AAA = IB 36/666 etc., opened).
- Not verified: Durham's maths-tests page still shows 2025-26 dates, so no Maths flagship; LNAT deadline for Durham relies on the existing record date.

## gb-warwick
- Flagships: Economics BSc (L100), Computer Science BSc (G400), Ancient History and Classical Archaeology BA (VV14). Sources: warwick.ac.uk/study/undergraduate/courses/... pages (curl works). Overseas 2027-28 fees "not set": quoted 2026-27 bands (Band 2 35,530; Band 1 27,870). closes 2027-01-13 (UCAS page).
- Faculties: 3 (Arts, Science Engineering and Medicine, Social Sciences); urls are each faculty's "Study" page (undergraduate courses list); lines from course pages. Warwick Business School not listed separately (not confirmed as a faculty); Medicine is graduate-entry.
- Warwick CS page says "All 2026-27 applicants will be required to take TMUA" (application cycle for 2027 entry).
