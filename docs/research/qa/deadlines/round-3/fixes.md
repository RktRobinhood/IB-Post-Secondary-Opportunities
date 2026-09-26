# Issue #47 deadlines per school: round-3 fixes

Written 26 Sep 2026, in reply to `critique.md` (6/10). Every source below was fetched on 26 Sep 2026.

## 1. Zero wrong-school dates, including institutions without pages

**The rule now** (`src/lib/school-dates.mjs`; no country appears in code):

- **Tied dates.** A date with `institutions` shows only on the pages it lists. This is unchanged.
- **Dates for an institution with no page.** A date for an institution that has no page carries its name in the new field `institutionsWithoutPage` (`schemas/common.schema.json` → `institutionNames`). If it has no `institutions` as well, it reaches no school page and stays on /timeline/.
- **Who a label can name.** The name fallback now looks at every institution the records know for the Destination, not only the school pages. The new `institutionsWithoutPages()` collects them from two places: the `institutionsWithoutPage` names, and evidence publishers of type `institution`. A publisher counts as a page's own, not as another institution, in four cases:
  - it names the page;
  - the page spells it ("NYU Abu Dhabi" is New York University Abu Dhabi);
  - its source is on the page's own web site ("Universität Wien" at univie.ac.at is the University of Vienna);
  - its evidence is about the page or one of its programmes ("Erasmus School of Economics" for an EUR programme).
- **What is left.** Six institutions without a page remain: Reykjavik University, University of Akureyri, Higher Colleges of Technology, Université Claude Bernard Lyon 1, Università Vita-Salute San Raffaele and University of the Arts Singapore.
- **Stricter fallback.** An untied date whose label names any other institution, with a page or without, and does not name this school, is dropped. Round 2 dropped it only when exactly one other school was named. Shared rules must now say whose they are with `institutions`.
- **Initialisms.** An initialism must spell a school's whole name or its closing words (`initialismOf(…, { toEnd: true })` in `calendar.mjs`). A letter taken from inside a word can no longer be the last letter.
  - "UAT" no longer names "University of the Arts London", or "Iceland University of the Arts" through the T inside "Arts".
  - "UBC", "XJTLU" and the category "UAS" ("… University of Applied Sciences") still match.

**Ties and names added (records edited directly):**

| Date(s) | Change | Source for the tie |
|---|---|---|
| UAT-UK (ESAT, TMUA, TARA): booking 20 Jul–28 Sep 2026, sitting 12–16 Oct 2026, booking 26 Oct–21 Dec 2026, sitting 4–8 Jan 2027 (`gb.json`) | `institutions`: gb-cambridge, gb-imperial, gb-oxford, gb-ucl, gb-lse, gb-warwick, gb-durham. **Not UAL.** | esat-tmua.ac.uk/about-the-tests/esat-test/: "Imperial College London, the University of Cambridge, the University of Oxford and UCL all use the ESAT". /tmua-test/: seven universities (Cambridge, LSE, Warwick, Durham, UCL, Oxford, Imperial). /tara/: "used by the University of Oxford and UCL". Confirmed on undergraduate.study.cam.ac.uk/applying/admission-assessments and imperial.ac.uk/study/apply/undergraduate/process/admissions-tests/. Dates confirmed with years at esat-tmua.ac.uk/deadlines/. |
| UCAS "Oxford, Cambridge, medicine, dentistry and veterinary medicine/science", 15 Oct 2026 (`gb-ucas-2027/ms-oxbridge` and its `gb.json` twin) | `institutions`: Oxford, Cambridge and the 14 page schools with an undergraduate medicine, dentistry or vet degree (Imperial, UCL, KCL, Edinburgh, Glasgow, St Andrews, Manchester, Bristol, Lancaster, QMUL, Birmingham, Leeds, City St George's, Nottingham). It leaves Bath, Durham, LSE, Loughborough, Warwick (graduate-entry medicine only) and UAL. | ucas.com/applying/applying-to-university/dates-and-deadlines-for-uni-applications ("15 Oct … Oxford and Cambridge, and for most courses in medicine, dentistry, and veterinary medicine/science"). ucat.ac.uk/about-ucat/universities/ for the medicine and dentistry courses, dentalschoolscouncil.ac.uk member list, rcvs.org.uk vet schools list. Warwick: warwick.ac.uk/fac/sci/med/study/ugr/ ("Graduate Entry Medicine"). |
| Reykjavik University 5 Feb and 30 Apr 2027; University of Akureyri 5 Jun 2027 (`is.json`, `is-direct-2027`) | `institutionsWithoutPage`. They now show on no Iceland school page. "Registration fee … University of Iceland and Akureyri" keeps its is-hi tie and also names Akureyri. | ru.is/en/namid/um-namid/application-dates-and-deadlines; unak.is/english/study/application/applications |
| International UAS Exam: 10–12 Mar, 22 Mar, 23 Mar and 14 Apr 2027 (`fi.json`) | `institutions`: fi-tamk and fi-metropolia. They leave Arcada, Haaga-Helia and Laurea. | uasinfo.fi/international-uas-exam/ gives every date with 2027. TAMK: "Students are admitted through the International UAS Exam" (tuni.fi/en/tamk/bachelors-degrees/software-engineering). Metropolia's own record already dates the exam, citing uasinfo "spring 2027". No page lists Arcada, Haaga-Helia or Laurea as using it. |
| Charles 2nd Faculty of Medicine: 8 dates (`cz.json`) | `institutions`: cz-cu | lf2.cuni.cz/en/applicants/how-to-apply/key-dates-and-deadlines (all dates with 2026/2027) |
| VSB Faculty of Materials Science 1 Oct 2026–31 Jan 2027, and Faculty of Economics (`cz.json`) | `institutions`: cz-vsb-tuo. `yearUnpublished: false` on the first: the table gives "01. 10. 2026 - 31. 01. 2027", and the note's "no year" is about a banner. | vsb.cz/cs/uchazec/prijimaci-rizeni/terminy-pro-podani-prihlasek/ |
| Masaryk faculty dates on `cz-direct-2027` (3) | `institutions`: cz-muni | the records' own Masaryk sources |
| NYU Abu Dhabi ED I, ED II, RD (`ae.json`) | `institutions`: ae-nyuad | nyuad.nyu.edu key dates (as recorded) |
| Victoria University of Wellington, 1 May and 8 Dec 2027 (`nz.json`) | `institutions`: nz-victoria-wellington | as recorded |
| Dalhousie health programmes, 15 Feb 2027 (`ca-apply-direct-2027`) | `institutions`: ca-dal | as recorded |

**Guard** (`scripts/test-calendar.mjs`):

- **Institutions without a page.** The wrong-school scan now also knows institutions without a page. It collects them itself, independently of the lib: the `institutionsWithoutPage` names, plus evidence publishers of type `institution`, cut to the name before a unit, less those that are a page's own by name, initialism, web site or entity. A date is flagged when it names any other institution, with a page or without, and not this one.
- **New checks:**
  - a date for an institution without a page reaches no school page;
  - a date on no route reaches a page only by naming the school or by a tie, never by a guessed initialism (this is the check that catches UAL);
  - every dated label that names an institution without a page carries `institutionsWithoutPage` or a tie;
  - `initialismOf` cases: UAT ≠ UAL, UAT ≠ IUA, UBC, UAS, XJTLU;
  - **"the scan catches the round-3 faults"**: the round-3 dates are fed to the scan, and it must flag Reykjavik and Akureyri on is-hi and is-lhi, and UAT-UK on gb-ual.

**The scan on the build** (`D:/ibp-tmp/dates3/scan.py`, reading the built HTML of every /universities/ and /programmes/ page; 377 pages have a panel):

| | Before (round-3 build) | After |
|---|---|---|
| Dates naming an institution without a page | **4** on 2 pages (Reykjavik and Akureyri on is-hi and is-lhi) | **0** |
| Dates naming one other school page | 0 | 0 |
| UAT-UK dates on UAL (reached through a guessed initialism) | **4** | **0**. Cambridge and Imperial now show all 4. |
| "Oxford, Cambridge, medicine …" on a school that is neither | 20 | 14, all tied (the medical, dental and vet schools above) |
| ETH exam dates from last cycle on ETH's page | 2 (and they led the panel) | 0 |

From the panel diff of the whole site: 32 date placements removed (all listed above, plus the numerus fixus dates in §5), 28 added (UAT-UK on its 7 schools) and 394 newly marked provisional (§4). `test-calendar.mjs` sees 470 pages and 6 institutions without a page, and passes.

## 2. UAT-UK

See the table in §1. UAL now shows only UCAS dates and IB results.

## 3. ETH entrance examination

ETH's page (ethz.ch/en/studies/bachelor/application/non-swiss-matriculation-certificate/eth-entrance-examination.html) says "You must apply by 31 March 2026 at the latest", registration is "between 15 September and 15 October", and "The next entrance examination will be held on 18–28 January 2027". That timetable belongs to last spring's applicants, and ETH has not published the next cycle's exam.

- **Relabelled.** Both dates now read "… (only if you applied by 31 March 2026)".
- **Closed.** Both carry `readerAccess: closed`, with the reason and the new evidence record `ev-ch-eth-entrance-exam-2027` (`data/evidence/ch.json`).
- **Result.** They are off the school panel and appear on /timeline/ as closed. ETH's page now leads with **31 Mar 2027: ETH Zurich bachelor applications close · provisional**. That date is provisional because "from 1 December to 31 March" has no year.

## 4. Provisional where the source gives no year

**New field.** `yearUnpublished` (common schema, route rounds and milestones, profile deadlines) means the source was read and gives the day and month but no year. Rounds can now be `provisional` too; `fromRouteRound` used to hard-code false. `mergeTwins` now ORs `provisional` and `yearUnpublished`. Before, a provisional profile twin lost its flag to a confirmed-looking route record, which is how 1 May showed as confirmed.

**Guard.**
- `yearUnpublished` ⇒ `provisional`.
- Every dated record whose note says the year is missing ("no year", "without a year", "year here is inferred", …) must set `yearUnpublished`. `false` is allowed where the source was read and the note's "no year" is about something else.
- 57 existing records, all already provisional, were flagged by the note test and now carry `yearUnpublished: true`: MIT, NYUAD, NYU Shanghai, RIT Dubai, McGill, Concordia, EPFL/UZH, Masaryk, SDU, Iceland, Turība, Agder, Nord, Vienna, Semmelweis, Corvinus, AGH, CAO and the German date.

**Dates changed (source fetched 26 Sep 2026):**

| Date | Was | Now | Source and what it says |
|---|---|---|---|
| NL numerus fixus 15 Jan 2027 (`nl-studielink-2027/ms-fixus`, `nl.json`) | confirmed, cited to rijksoverheid (no year) | **confirmed, cited to Studielink first** | info.studielink.nl/nl/nieuws/vanaf-1-oktober-inschrijven-mogelijk-voor-studiejaar-2027-2028: "De sluitingsdatum … numerus fixus is 15 januari 2027". New evidence `ev-studielink-2027-2028-dates` in `data/evidence/nl.json`. |
| NL 1 May 2027, "Applications close for everything else" (route and profile) | confirmed on 32 pages | **provisional**, `yearUnpublished` | rijksoverheid.nl/onderwerpen/hoger-onderwijs/studiekeuze-en-toelating: "uiterlijk op 1 mei". studyinnl.org/plan-your-stay/how-to-apply: "1 May for all other study programmes". Studielink: "aanmelddeadline op 1 mei". None gives a year. |
| NL ranking numbers 15 Apr 2027 | provisional | + `yearUnpublished` | studyinnl.org: "on 15 April" |
| DK 15 Mar 2027 applications close and signature, 1 Mar IB coordinator, 5 Jul, 28 Jul, round-main (`dk-optagelse-international-2027`) | confirmed on 72 pages | **provisional**, `yearUnpublished` | ufsn.dk/english/…/how-to-apply-for-a-higher-education-programme-in-denmark/: "15 March, 12 noon (CET) and 5 July", "28 July you will receive an answer". No year; the only years on the page are 2025 and 2026. SDU's frister page is still titled "2026". No 2027-dated DK source was found. |
| UiO Technology Systems 1 Dec 2026 (`no.json`) | confirmed | **provisional** | uio.no/…/admission-no-norwegian.html: "Application deadline: 1 December" |
| Vilnius EU/EFTA 1 Jul 2027 (`lt.json`) | confirmed | **provisional**, note extended | vu.lt/en/admissions/admissions-to-bachelor-studies: no year. admissions.vu.lt has "1 July" with no year on the line, though it frames the 2027/2028 round. The site root cannot be cited (sourcing guard). |
| TAMK 14 Apr 2027 UAS Exam results (`data/schools/fi-tamk.json`) | cited to a TAMK page with "14 April", no year | **re-cited** to uasinfo.fi/international-uas-exam/ | "The results will be published on 14 April 2027 at the latest" |

**Checked and left as confirmed, because the source gives the year:**
- Aalto, Åbo Akademi, Arcada, Helsinki, JYU, LUT, Metropolia, Oulu, TAMK, TAU, UTU and uasinfo: every date with 2027.
- PTE Pécs: 1 Nov 2026 and 30 Jun 2027, and exams "between 3rd March and 14th July 2027".
- Debrecen: 1 Nov 2026 and 15 May 2027.
- Charles LF2: all dates.
- VŠE: 1 Nov 2026, 28 Feb 2027 and 31 Jul 2027. The interview is "March 2027".
- VŠB: 1 Oct 2026–31 Jan 2027.
- Semmelweis: 31 May 2027.
- CEU: 15 Oct 2026, 2 Feb, 15 Apr and 15 Jul 2027.
- PUMS: 20 Jul 2027 and 6–12 Sep 2027. The exam sittings are under "sessions in 2027".
- RSU: September 2027 tab.
- SSE Riga: 11 May and 25 Jul 2027.
- Sciences Po: 8 Dec 2026, 8 Mar and 13 Apr 2027.
- Bocconi: Winter Session 25 Nov 2026–26 Jan 2027; last test 21 Jan 2027.
- NHH: 15 Feb 2027.
- Duke Kunshan: 1 May 2027.
- LNAT: all dates.
- Toronto: under the "2027 admissions" table heading.
- NMBU: "1 December, the year before you plan to start".

## 5. Maastricht programme pages

- **"Studielink opens for 2027-2028" (1 Oct 2026).** The profile twin cited a University of Amsterdam page. It now cites Studielink's own news item: "Vanaf donderdag 1 oktober 2026 … voor studiejaar 2027-2028". The route milestone lists `ev-studielink-2027-2028-dates` first. No Maastricht panel links to uva.nl any more (0, was 4).
- **Numerus fixus dates, generically.**
  - A date can be marked `numerusFixusOnly`, and an opportunity can record `admission.numerusFixus` (`opportunity.schema.json`).
  - A programme page recorded as not numerus fixus leaves those dates out. So does a school page whose every listed programme is recorded that way.
  - Marked `numerusFixusOnly`: the national 15 Jan, ranking numbers 15 Apr, and "Accept your numerus fixus place" (route and profile).
  - `numerusFixus: true` on the six programmes whose record says numerus fixus: Maastricht IB, Erasmus EBE and IBA, TU Delft Aerospace, CSE and Nanobiology.
  - `numerusFixus: false` on Maastricht DSAI and UCM, from maastrichtuniversity.nl/study/admission-enrolment/applying-maastricht-university/free-selective-and-fixus-bachelors. That page lists the fixus programmes (Brain Science, European Law School, Geneeskunde, International Business, Psychology), UCM as selective and DSAI as free.
  - DSAI and UCM now show no "Numerus fixus applications close" and no "Numerus fixus ranking numbers issued".
  - A guard checks this for every programme recorded false.

## 6. Not done (noted)

- **The 166 multi-route pages.** A rule to give them their jurisdiction's route dates (`jurisdiction → applicationRoute`) was not built, as instructed. Harvard and the others still show "Every date in <country>".
- **Desktop panel above the fold.** Layout was not in this round's scope.

## Could not verify, or left open

- **UEF** (uef.fi returned 403) and **Otago** (403): not re-read. Their records are unchanged.
- **TAU application-documents**: the dates sit in collapsed sections the fetch could not read.
- **Jagiellonian and Warsaw PDFs**: no text could be extracted. Warsaw's resolution page confirms it covers 2027/2028, but it was amended by Uchwała nr 315 (24 Jun 2026), which was not read.
- **Found on the way, not changed:**
  - ufsn.dk does not mention the DK "1 March: have your IB coordinator register you" date at all, and gives 5 July as the entry-requirements date, not "reorder priorities".
  - UTU's IB section still shows 2026 dates (predicted grades 31 March 2026).
  - Bocconi's Early Session ran 2–29 Sep 2026, not "until 2 Sep".
  - PUMS's Oslo (20–21 Jun) and Dublin (3–4 Jul) sittings are already windows.
  - The DK and SDU pages still title their dates "2026".
- **Other labels naming an institution without a tie**: University of Athens (3) and "Bifröst, the Agricultural University and the University of the Arts". They have no date, so they reach no panel.

## Files changed

- **Code:** `src/lib/school-dates.mjs`, `src/lib/calendar.mjs`, `scripts/test-calendar.mjs`.
- **Schemas:** `schemas/common.schema.json`, `schemas/application-route.schema.json`, `schemas/opportunity.schema.json`.
- **Routes** (`data/application-routes/`):
  - ties, flags and evidence: `gb-ucas-2027`, `nl-studielink-2027`, `nl-maastricht-selection-2027`, `dk-optagelse-international-2027`, `is-direct-2027`, `cz-direct-2027`, `ca-apply-direct-2027`;
  - `yearUnpublished` only: `ae-nyuad-common-app-2027` (rounds also made provisional), `ae-branch-campus-direct-2027`, `ch-direct-2027`, `cn-common-app-2027`, `lv-direct-2027`, `us-direct-2027`.
- **Country profiles** (`data/countries/`): `gb`, `nl`, `is`, `fi`, `cz`, `nz`, `ae`, `ch`, `no`, `lt`, `at`, `ca`, `cn`, `de`, `hu`, `ie`, `lv`, `pl`, `us`.
- **Evidence:** `data/evidence/nl.json`, `data/evidence/ch.json`.
- **Opportunities:** 8 in `data/opportunities/nl-*`.
- **Schools:** `data/schools/fi-tamk.json`.

## Gate

- `node scripts/test-calendar.mjs`: all calendar guards pass, including the 7 new ones and the extended wrong-school scan.
- `DIST_DIR=D:/ibp-tmp/dist-dates node src/build.mjs`, then `MSYS_NO_PATHCONV=1 SITE_BASE=/IB-Post-Secondary-Opportunities DIST_DIR=D:/ibp-tmp/dist-dates node scripts/qa.mjs`: **all 35 checks pass**. Freshness is advisory.
- One earlier run failed `sourcing`, because the Vilnius date was cited to the admissions.vu.lt site root. That was fixed as in §4.
