# Wave 3 report: Australia and Singapore (au, sg), 7 Oct 2026

Intake is recorded as `2027-autumn` (the schema's only current value); the real start month is in `starts`. A May-2027 IB student reaches the July 2027 mid-year intake or February/March 2028 (2028 dates not yet published).
Sites behind Cloudflare (curl/WebFetch 403) were read through the browser tab with fetch/textContent.

## au-melbourne
- 2 flagships (BSc, Biomedicine), 5 faculties (via degree pages), no course count. Direct application for IB outside Australia/NZ (VTAC only for IB in Australia/NZ).
- Date: mid-year 2027 direct close 31 Mar 2027 (course page key dates). CONFLICT: the international applications page says 31 May 2027. Recorded the earlier; both in a note.
- IB scores from the IB entry-score page (BSc 31, Commerce/Biomed 34, Arts 27, Design 29, Oral Health 37, Agriculture 25); page gives no year (labelled "indicative"). Fees from course pages (BSc 2027 A$55,556-65,344; Biomed 2026 A$54,780-61,460).
- Fine Arts and Music faculty left out (degree page slug not found); the Feb 2027 close (30 Nov 2026) is not recorded as a date because the May-session reader cannot use it.

## au-sydney
- 2 flagships (Advanced Computing, Commerce), 7 faculties (via course pages; Engineering/Law/Education pages not reachable), no course count.
- IB totals and 2027 first-year fees from the 2027 International Guide PDF (indicative, per course). Maths prerequisite does not apply to IB outside Australia; assumed knowledge is in HSC terms so no `needs`.
- Date: Semester 2 (Aug) close 29 May of the commencing year = 29 May 2027 (application-dates page's standing rule). Feb intake close is 1 Dec of the prior year (not recorded: reader cannot use it).
- Route: direct for IB outside Australia; UAC only for IB studied in Australia (matches Sydney's own page; UAC says IB students can apply through UAC from abroad: Sydney's page is the one followed).

## au-anu
- 1 flagship (PPE; only course whose page claims a strength), 6 colleges (via 2027 program pages), no course count.
- Dates: Semester 2 2027 closes 15 May 2027 (ANU international applications page, key dates tab). Semester 1 2027 closes 15 Dec 2026 (not recorded).
- IB: ANU entrance rank to IB table (schools outside Australia). PPE guaranteed rank 94 = 38 points; min consideration rank 79 (not in table).
- Route conflict: ANU says IB students "should" use UAC (and its IB page "encourages" UAC for adjustment factors); recorded "ANU portal or UAC". UAC's own key dates (5 Feb 2027) are for Nov-session IB; no UAC mid-year date read.
- Fees: 2027 schedule band table; PPE spans bands 1 to 4 by discipline, so a range.

## au-uq
- 2 flagships (Science, Engineering Honours), 4 faculties (via program pages). No international closing date is published (page says apply early, up to 2 years ahead): `dates` left empty.
- IB scores are "lowest adjusted offer in Semester 1, 2026" per program page (recorded as `cutoff`, not `points`). Fees A$56,800 (Science, 2027), A$60,952 (Engineering, 2027). Intake: Semester 1 22 Feb 2027, Semester 2 26 Jul 2027 (2028 dates not yet confirmed).
- Prerequisites are Queensland subjects; UQ's IB equivalent table is for IB studied in Australia and the overseas section was not read in full, so the Engineering `needs` carry no grades.

## au-monash
- 2 flagships (Science, Engineering Honours), 4 faculties (via course pages; Education, IT, Law, Medicine/Nursing/Health, Pharmacy, Art/Design/Architecture not covered). Pages are Cloudflare-blocked to curl: read in the browser tab with fetch.
- IB totals are the "Entry Score - 2027 intake" row of each course's international requirements (Science 28, Engineering 30, Business 27, Arts 26). Fees: 2027 international full fee per 48 credit points (Science A$60,040; Engineering A$63,040).
- No international closing date published (page: "some courses may close a few months or a year before"): `dates` empty. The 2027 International UG Course Guide PDF is also blocked to curl, not read.
- Prerequisite subject detail for Engineering (per specialisation) and the Science maths/science columns not read; only English (SL 4 / HL 3) recorded.

## au-unsw
- 2 flagships (Engineering Hons, Commerce), 5 faculties (Law & Justice omitted: no Law bachelor page found). IB totals read from the 2027 international entry table PDF (IB = 7th numeric column; cross-checked against ATAR 92 = IB 36, ATAR 97 = IB 41). Table is "a guide only".
- Route: UNSW's own page says international IB Diploma students apply through UAC. UAC key dates (5 Feb 2027) are for the Nov session; UNSW's direct schedule shows Term 1 2027 final deadline 24 Sep 2026 (not the reader's intake). No Term 2/3 2027 undergraduate deadline read: `dates` empty.
- Fees: 2026 indicative first-year full fee on degree pages (Engineering A$61,500; Commerce A$56,500); 2027 per-unit table is in a JS filter, not read.

## au-uwa
- 2 flagships (Science, Engineering Honours), 4 course-page "faculties" (UWA has schools; names kept generic). No tuition recorded: UWA's international fee is per credit point via a calculator (dynamic), not read.
- IB-to-ATAR table and WA-to-IB prerequisite map read in the browser from the IB page (24=70, 27=80, 30=85, 32=90, 35=94). Course ATARs from course-page quick details (Science 70, Biomedical Science 70, Arts 70, Commerce 80, Engineering 80).
- CONFLICT on one page: Bachelor of Science body says "MINIMUM ATAR 70" with 29 majors; its meta description says "Minimum ATAR 80" with 27 majors. Recorded 70 (rendered quick details), named in a note.
- No international closing date published ("Some courses have earlier closing dates and will be listed on the relevant course pages"): `dates` empty. Route: direct (portal or agent); no TISC for overseas IB found on the international page.

## au-adelaide
- 2 flagships (Civil Engineering Honours, Science); NO faculties list (the site's colleges structure was not found on the pages read). 2027 international degree pages (URL pattern /study/degrees/2027/<slug>/int/?student=future) give IB minimum by "country of academic completion": Global IB 25 Science/Arts/Business, 26 Computer Science, 28 Civil Engineering. Fees 2027 indicative annual (Science A$55,400; Civil A$57,100).
- No closing date: "some degrees have different application deadlines... check the program page"; the degree pages read carry no date. `dates` empty.
- Manifest/lead URL on the old path was not used; "merged university" wording comes from the lead (search titles), not a page I read.

## au-uts
- 1 flagship (Engineering Honours Flexible), 1 faculty line (Engineering and IT). Only course whose international page was read in full; UTS course pages show no IB total (the lead's "28 final / 33 predicted" was NOT found on any page read), so `points` is left out and the ib text says so.
- Date: Spring session (July start) closes 30 Apr for applicants outside Australia (application-dates page, undated table, read as 2027). Autumn 30 Nov, Summer 30 Aug not recorded (not the reader's intake / earlier).
- Fee: 2027 indicative first-year A$57,240 (course page). Route: UTS Application Portal; UAC is for domestic applicants per the dates page.

## au-rmit
- 2 flagships (Business, Computer Science), 3 college lines (via degree pages). RMIT publishes no per-degree IB total: the IB page converts Australian % to IB (70%=27, 75%=29...), and I applied it to the degree page's ATAR (Business 2027 guaranteed ATAR 70; Computer Science 75.10 lowest offer, about 29 by interpolation between 75%=29 and 80%=31: stated "about").
- No date: Semester 2, 2027 dates "will be available later this year"; Semester 1 2027 bachelor deadline is 3 March 2027 (not the reader's intake). Fees 2027 annual international: Business A$47,040, Computer Science A$45,120.
- Architectural Design (BP250): Semester 2 intake is closed to recent school leavers; noted rather than made a flagship.
- VTAC: its use for IB (lead said before 12 Jan 2027) was not on the pages read; route recorded as direct.

## au-qut
- THIN: 1 flagship (Engineering Honours), no faculties, no IB total, no fee, no dates. QUT is Cloudflare-blocked to curl; its IB acceptance page now redirects to an ATAR page for Australian Year 12, and the IB guide and 2027 International Quick Guide are PDFs behind the same wall (browser opens them but text could not be extracted). The Year 12 ATAR threshold for Engineering (84) is quoted, labelled as such.
- Needs a second pass (browser PDF text) for the IB cut-offs and 2027 fee.

## au-uow
- THIN: 0 flagships, 0 faculties. The site is domestic-first; the per-degree IB minimum sits in a JS course finder, not read. Facts used: IB page ("more than 200 undergraduate degrees", minimum IB scores per degree, UAC for citizens/residents), international apply page (agent or UOW Apply). No international closing date found. Lead hint "20 March 2027 Europe/UK" not found on any page read (not used).


## au-curtin
- 1 flagship (Engineering Honours), 4 faculty lines (from the IB page's indicative totals; all four link the IB page because no faculty admissions page was read). Curtin works with curl.
- CONFLICT: IB page says Engineering "Indicative IB scores of 31 and above"; the course page's cut-off table says IB 30 (guaranteed ATAR 80). Recorded 31 (stricter), 30 as `cutoff`, both in the ib line.
- Dates: international applications "close 10 weeks before the course start date" for listed countries, "4 weeks before" for others, 2 weeks if on a student visa in Australia (no fixed date): `dates` empty. Quota courses (Medicine, Physiotherapy etc.) have strict dates in a table I could not read. Fee: 2027 indicative year 1 A$47,652.

## au-macquarie
- THIN: 0 flagships, 0 faculties. Site is Cloudflare-blocked to curl; read in the browser. The IB-to-selection-rank tables are embedded in the academic requirements page and did not render as text; no course page was readable with IB totals or fees.
- Route (page's own words): UAC if completing an IB Diploma in Australia; "all other international applicants may apply directly... or through an authorised agent". No closing date found: `dates` empty.

## au-deakin
- 2 flagships (Engineering Honours, Science) with 2027-page first-year fees (A$46,800, A$44,800) and Trimester 1/2 intakes. NO IB totals: Deakin shows them only through a per-country selector that did not render in static HTML. International dates: "Application closing dates vary by intake and country" (March/July/November): `dates` empty. International URL pattern /course/<slug>-international.

## au-utas
- 1 flagship (Marine and Antarctic Science), no faculties. IB: "International Baccalaureate (IB) Diploma: Overall score of 24" is the minimum on the entry-requirements-by-country table (UTAS: "some programs do have a higher admission requirement"). Fee 2027 A$49,950 (course page, International tab). Semester 1 and 2, Hobart.
- Dates: "There is no closing date for submitting your application for most courses" (recommend 5 months before for overseas): recorded as `noDeadline`. Course-specific IB totals other than the general 24 not found.

## au-griffith
- THIN: 0 flagships, 0 faculties. IB and apply facts only. Degree Finder (per-degree IB/ATAR score) is a JS page not read; international fees not read. Page text: "We accept applications all year round" (recommended: mid-November for Trimester 1, mid-April for Trimester 2, mid-July for Trimester 3) recorded as `noDeadline`, not as dates. International students at an Australian high school use QTAC; others apply online or via an agent. Trimester 1 2027 classes start 1 March 2027.

## sg-ntu
- Scope catalogue (all English). 2 flagships (Materials Engineering, Business), 5 colleges. Window from the IB admissions page table: "International Baccalaureate (IB) Diploma ... 15 Oct 2026 - 19 Mar 2027" (the row is labelled "Closed", which reads as stale for the 2027/28 cycle; the same page's text gives "closing date of 19 March 2027"). IBO transcript access by end of June 2027 for May sitters (recorded as 30 Jun 2027).
- CONFLICT: NTU's prerequisite PDF lists Business as 3 years; the programme page says "four-year business degree". Recorded 4 (programme page), named in the `ib` line.
- Fees AY2026/27 (tuition page): "All Other IS" subsidised S$21,400 (Business S$21,800), non-subsidised S$36,350-40,600 (Business S$45,600); MOE grant bond: "work for a Singapore entity for three (3) years upon graduation" (one note). 2027/28 fee page not yet published.
- Computer Science's own programme page was not found (guessed slug 404): not a flagship. Prerequisites quoted from the IB listing PDF; Medicine (LKCMedicine): HL Chemistry and HL Biology/Physics, BMAT, referee reports.

## sg-nus
- Scope catalogue. 1 flagship (Computer Science), 6 faculty lines (programmes page links). NUS (www host) is behind Incapsula; the nus.edu.sg host (no www) answered in the browser tab.
- Window read from important-dates (AY2027/2028): "IB Diploma Application Period 16 December 2026 to 17 February 2027" (the page tags it "[Closed]", a stale template label). May-2027 IB sitters: predicted results, IB personal code by 16 June 2027, transcript received by 6 July 2027, outcome by 3rd week of July 2027 (admission-requirements page). Medicine/Dentistry extra tests due by 17 February 2027.
- UNVERIFIED: the Computer Science IB prerequisite line comes from a search summary of NUS's ibdp-sp.pdf (the PDF is behind Incapsula, not opened). Fee table (ugtuitioncurrent.pdf) also blocked: tuitionEuEea left out. Tuition-grant bond is confirmed on the registrar fees page ("required to work for a Singapore entity for three years upon graduation").
- CS duration (4) is not stated on the programme page; typical honours length used.

