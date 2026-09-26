# UK school records (#43): admissions counsellor, round 2

Under review: the 22 records `data/schools/gb-*.json` as they stand after the round-1 fixes, and the
fee-status rule that round 1 asked to move to `data/countries/gb.json`. Checked on 2026-09-26 against
the official pages with scripted fetches only (no browser). Oxford, UCL, Durham, City St George's and
Nottingham returned 403 or 503 to scripted reads, so I could not re-open them. Where that matters, I
say so below, and I have not counted it against the record.

## Score: 8/10. Accepted (the school records).

**No deadline is wrong.** I re-checked 70-odd dates in 15 records against the official pages. None
is wrong, including:
- the UCAS 15 Oct and 13 Jan dates, both 18:00;
- UCAT 16 Sep (15:00) and 24 Sep;
- the LNAT split: 15 Sep and 15 Oct for Oxbridge, 31 Dec for KCL, LSE and UCL, 13 Jan for Bristol
  and Durham;
- the UAT-UK dates: booking closes 28 Sep and 21 Dec at 18:00, and the sittings run 12–16 Oct and 4–8 Jan;
- Cambridge's My Cambridge Application deadline (22 Oct, 18:00) and decisions (27 Jan);
- Leeds's decision deadline of 12 May;
- 30 June for international applicants at Bristol and Glasgow;
- QMUL Malta's deadline of 1 March 2027.

Every round-1 error I could re-open is fixed on the official page. The two I could not re-open
(Oxford and UCL) now carry the page's own words, which round 1 quoted.

The fee rule round 1 asked for now lives on `gb.json` (`costs.tuitionEuEea`), and it is right. But four
older lines in the same country record still tell an Irish citizen or a UK national living in Denmark
the opposite, and one tells an Irish citizen they need a visa. These are country-record errors, not
school-record errors, so they don't sink this round. **Fix them in the same commit.** Round 1's
error 3 is only half closed while they stand.

## Errors

The school records have none. The errors below are all on the country record.

| # | Record | Field | What the record says | What the official page says | Source |
|---|---|---|---|---|---|
| 1 | gb.json | `costs.notes[0]` | "a UK 'Home' student in England pays a capped fee of GBP 9,790 … You will not get that rate." | Irish citizens, and UK nationals and their families, resident in the EEA or Switzerland on 31 Dec 2020 who meet the 3-year residence test qualify for Home fees for "courses starting before 2028". Autumn 2027 is the last intake. So do EU citizens with settled or pre-settled status. The line also contradicts `costs.tuitionEuEea` two fields above it. | https://www.ukcisa.org.uk/student-advice/fees/full-list-of-categories-for-he-in-england/ and https://www.ukcisa.org.uk/media/aahedhfg/brexit-tempy-offer-irish-citizens-public-eng-18.pdf |
| 2 | gb.json | `watchOuts[0]` | "You pay international tuition." (unconditional) | As error 1. Say "most EU students". | as above |
| 3 | gb.json | `watchOuts[1]`, `funding[0]` | "No access to UK tuition fee loans or maintenance loans as an EU citizen; you must fund it yourself" and "Assume you are paying every year in full." | DfE: Irish citizens in this group are "eligible for home fee status and tuition fee support from Student Finance England for courses starting on or after 1 August 2021 and before 1 January 2028". UK nationals and their families get "home fee status, tuition fee and maintenance support". An Irish citizen is an EU citizen, so the sentence is false for them. | https://educationhub.blog.gov.uk/access-to-student-finance-from-academic-year-2021-22-faqs/ |
| 4 | gb.json | `costs.tuitionEuEea.source` | Cites `https://www.gla.ac.uk/undergraduate/fees/intlfees/`. | That is a Scottish university's international-fees page. It cannot support a rule about England's Home-fee exceptions, and nothing in `gb.json` cites UKCISA. Cite the UKCISA category list (and the DfE FAQ). The brief requires the country-level source. | https://www.ukcisa.org.uk/student-advice/fees/full-list-of-categories-for-he-in-england/ |
| 5 | gb.json | `residency` | "You need a Student visa. EU citizenship gives you no shortcut since Brexit." Then the £558 fee and the £776-a-year Immigration Health Surcharge. | For Irish nationality, GOV.UK's visa checker says: "You do not need a visa or an electronic travel authorisation (ETA) to come to the UK." (Common Travel Area.) An Irish student in Denmark would budget about £3,000 for a visa they cannot and need not get. Add "Irish citizens do not need a visa." | https://www.gov.uk/check-uk-visa/y/ireland |

### Smaller points (fix while you are there)

- **gb-st-andrews `dates[2]`** says 13 Jan is the "Deadline for all other courses". The direct-application page gives the BA (International Honours) with William & Mary a deadline of 1 May 2027. Say "most other courses".
  - Source: https://www.st-andrews.ac.uk/study/undergraduate/apply/direct/
- **gb-glasgow `ib`** uses History as its example, "34 (6,5,5)". The History page adds a subject condition: "English HL6 or Humanities HL6 with English SL6". A student with SL English 5 would read the example as met. Either add the condition or pick an example without one.
  - Source: https://www.gla.ac.uk/undergraduate/degrees/history/
- **gb-durham `dates[0–1]`** label the TMUA "optional". Durham's page says Law and Mathematics applicants are "strongly encouraged" to sit it, and the record's own note says so too. Use "(strongly encouraged, Mathematics)" so the date and the note agree.
- **gb-lancaster `ib`** says "IB English at SL or HL 5 proves your English", which is correct: the English page says "International Baccalaureate English Higher Level or Standard Level at 5". But `ib.url` is the qualifications page, and that page does not say it. The English-requirements page is already in `sources`; it just isn't the page this line cites.
- **gb-ual `handoff`.** The researcher's own count of the Undergraduate filter found 1 MSc, 3 diplomas and the closed BA Architecture among its 107 results. That is UAL's own filter, and it is the best undergraduate list UAL has, so it can stay. But `courses: 107` then overstates the BAs a 2027 applicant can choose from. Either drop `courses` or record 102 (95 BA + 7 BSc).
  - I could not re-open it: the results load by script and returned empty.
- **Summaries.** "Large" appears unsourced in Glasgow, KCL, Manchester, Nottingham and QMUL. It isn't on the banned list, and it's harmless, but it's the kind of word the brief warns about.
  - Also: Edinburgh's "about 330", Manchester's "about 300" and City's "about 80" come from the researcher counting links, not from a number the university states. "About" covers it, but prefer a stated figure where one exists. Birmingham's subjects page says "over 350 different undergraduate courses", and Leeds's search shows a count.

## What I checked and found right

- **Round-1 errors, re-checked on the official page:**
  1. LSE `ib`: the 8 AA-required degrees match the page exactly. AA is only "preferred" for Economics, Economics with Economic History, EME and Finance. The English rule is also right: English A HL any grade or SL 6, English B HL 7 (from LSE's English-language page).
  2. LSE hand-off: "Showing 1-12 results of 43", and the first 12 are all BA or BSc. It is the undergraduate filter.
  3. Fee sentence: gone from all 18 English school notes. Bath's page itself says "your fee status may be Home or Overseas, depending on your circumstances", which agrees with the new `gb.json` rule.
  4. UAL: the note quotes "A standalone architecture qualification at Undergraduate level is no longer running at Central Saint Martins" and points to the Integrated MArch, as the page does. Architecture is no longer the `ib` example.
  5. Edinburgh: "For 2026-2027, we estimate that it will cost an average of £1,546 each month". The record now says 2026-27.
  6. Oxford: the wording is now "will consider exempting you". ox.ac.uk returned 403, so I checked it against round 1's quote only.
  - The smaller points are fixed too:
    - KCL: the test table lists Dentistry A205/A206/A202 with UCAT, and the label now matches.
    - Glasgow: Common App for "Arts, Engineering, Law, Nursing, Science, and Social Sciences".
    - Manchester: "Some courses, such as Mathematics, Chemical Engineering and Computer Science, will only accept Mathematics: analysis and approaches", and the record now says "e.g.".
    - UCL: the English A levels read correctly. The page returned 403 to scripted fetches.
- **`gb.json` fee rule** (`costs.tuitionEuEea`): "Most EU students pay the international rate. In England, settled or pre-settled status, or (for autumn 2027, the last intake) being Irish or a UK national long resident in the EEA, can mean Home fees. Scotland sets its own rules." This matches UKCISA's three categories, "courses starting before 2028", and the Irish-citizen PDF's conditions (a)–(e). "Can mean" is the right hedge for a residence test.
- **Dates**, re-checked in:
  - Oxford (every date, against the LNAT, UCAT and UAT-UK pages);
  - Cambridge (all 7);
  - Imperial (all 7, plus "only your first test score will be considered" for ESAT);
  - LSE (TMUA 28 Sep, 21 Dec and both sittings, LNAT 31 Dec; "no advantage to sitting the test in the first or second sitting");
  - UCL (UAT-UK, LNAT 31 Dec);
  - KCL (LNAT 31 Dec, 15 Oct for Medicine and Dentistry);
  - Birmingham (15 Oct for Medicine and Dentistry, 13 Jan);
  - Bristol (15 Oct at 6 pm, 13 Jan at 6 pm, final deadline 30 June);
  - Leeds (15 Oct, 13 Jan, 12 May);
  - Edinburgh (15 Oct for Medicine and Vet, 13 Jan);
  - Glasgow (15 Oct, 13 Jan for UK applicants, 30 June for international);
  - St Andrews (15 Oct and 13 Jan, direct or UCAS, £50, counts in the five);
  - Warwick (TMUA sittings, 21 Dec);
  - Durham (LNAT 13 Jan, TMUA booking);
  - QMUL (15 Oct for Medicine, Malta 1 Mar 2027, applied for directly).
  - Shared sources:
    - https://www.ucas.com/undergraduate/applying-university/ucas-undergraduate-when-apply
    - https://www.ucat.ac.uk/about-ucat/ucat-test-dates/
    - https://lnat.ac.uk/registration/dates-and-deadlines/
    - https://esat-tmua.ac.uk/deadlines/
- **`ib` lines round 1 did not check in detail**, all right:
  - Bath: the page says "If you are studying four Higher Level subjects, your three best grades will be accepted". Accounting and Finance is "36 points overall and 7, 6, 6 or 7, 7, 5 … including 6 in either HL Mathematics". Modern Languages is "35 points overall and 6, 5, 5".
  - Birmingham: 7,6,6 / 6,6,6 / 6,6,5 / 6,5,5 "with a minimum of 32 points overall", excluding Liberal Arts and Natural Sciences.
  - Lancaster: 36/16, 35/16, 32/16, 30/15. A required subject needs HL 6. English is SL or HL 5.
  - Loughborough: the full Diploma with at least three HL subjects. Industrial Design is "34 (6,5,5 HL)". Sport and Exercise Science is "38 - 37 (7,6,6 - 6,6,6 HL)".
  - QMUL: Accounting and Finance is 36 with 6,6,6 plus SL Maths 4. Applied AI is 34 with 6,6,5. Medicine asks for UCAT "Fourth decile or above, SJT Bands 1- 3".
  - Warwick: Maths is "39 points overall, with 6, 6, 6 … Mathematics ('Analysis and Approaches' only)", and TMUA or STEP. English A is 4 for bands A–B and 5 for band C. The TMUA is optional for Economics. TMUA results count only in the year sat.
  - Leeds: "a minimum of 31 points overall with 15-18 points from higher level subjects". English A is 4, English B is HL 5 or SL 6, and Literature and Performance and ab initio are excluded. Business School is 35 with 16–17 at HL.
  - Manchester: 30–39, with HL 7 = A*.
  - Edinburgh: SL English 5. The "grades most applicants needed to receive an offer in recent years" definition matches the note.
  - Durham: I could not verify it (403). The notes' "strongly encouraged" wording matches the Durham text quoted in search results.
  - Nottingham: I could not verify it (503).
- **Fees and other notes, still right:**
  - Bath: 2027 bands £26,150, £29,500 and £32,950;
  - Loughborough: £31,500 and £35,000, the DPS, and "more than 90% of Design students undertaking paid placements";
  - QMUL: £30,950, £34,750 and £56,650;
  - Lancaster: the £40 college fee;
  - Manchester: "up to 7% each year";
  - UAL: £30,890 for 2026 with "up to 5%" increases, PebblePad with at most 30 pages, 25 points, IB English HL 5 / SL 6;
  - KCL: English A HL 4 / SL 5;
  - LSE's "about 34,000 applications for 1,900 places" is on LSE's own site.
- **Hand-offs** re-opened this round, all undergraduate only:
  - LSE (43);
  - Bath ("over 190 undergraduate degrees", 2027);
  - Birmingham (undergraduate subject areas);
  - Glasgow (2027 A–Z);
  - Leeds (undergraduate search, 2027).
- **Summaries:** all ≤150 characters (the longest is 148). None uses "every", "all", "only", "largest" or "oldest".

## Three-line summary

- Score: 8/10. The 22 UK school records are accepted. No deadline is wrong, and every round-1 error is fixed.
- Errors: 0 in the school records. There are 5 in `data/countries/gb.json`: four lines contradict its own new fee rule or the visa rule for Irish citizens and UK nationals living in the EEA, and one cites a Glasgow page as the source of an English rule.
- Most important fix: in `gb.json`, remove "You will not get that rate" and "You pay international tuition", correct the loans lines (tuition fee support is available to Irish citizens and UK nationals under the temporary offer), say that Irish citizens need no visa, and cite UKCISA for `tuitionEuEea`.
