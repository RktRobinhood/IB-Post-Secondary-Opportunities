# Issue #47 deadlines per school: critique, round 4

**Score: 6 / 10. Do not ship.**

Checked on 26 Sep 2026 against localhost:4380, at 1280×800 and 390×844. All 543 panels were read from the server-rendered HTML (`crawl.py`, output in `D:/ibp-tmp/r4/crawl.json`). 377 have dates and 166 have none. Screenshots were taken with `shoot.mjs` and `cdp.mjs`; the measurements are in `probe.json`.

## Why

- **Every round-3 fault is fixed.**
  - IUA shows only "IB results released".
  - The University of Iceland page no longer shows the Reykjavik and Akureyri dates.
  - UAL shows only UCAS dates.
  - ETH leads with "31 Mar 2027 · provisional".
  - Dutch 1 May is provisional everywhere. 15 Jan now cites Studielink, which gives the year.
  - Maastricht DSAI and UCM no longer show numerus fixus dates, and no Maastricht panel links to uva.nl.
- **The new dates are good.** Of the 18 dates no earlier round checked, 16 are right, and the other 2 are right but have a weak citation (CAO).
- **Two school pages still show dates that do not apply to them, so the round fails.** Oxford and Cambridge each carry three:
  - **UAT-UK "test booking for the January sitting", 26 Oct–21 Dec 2026, marked "Hard deadline".** The site's own note on that item says "Not available for Oxford or Cambridge applicants". UAT-UK says the January sitting is "Not applicable for Cambridge or Oxford applicants" unless they apply to a mature college or Oxford's Foundation Year. Neither applies to an IB school-leaver.
  - **UAT-UK "January sitting", 4–8 Jan 2027.** It has the same note.
  - **UCAS "Equal consideration date for most courses", 13 Jan 2027.** UCAS titles this date "…except those with a 15 October deadline", and every Oxbridge course has a 15 October deadline.
  - Related: "Extra opens", "Clearing opens" and "23 Sep 2027 Final date for 2027 entry applications · Hard deadline" also sit on both pages. The 23 Sep item is out of order, listed after 6 Jul.
  - **Cause.** The round-3 tie put all four UAT-UK dates on seven schools, but the January dates should leave out Oxford and Cambridge. The UCAS 13 Jan milestone has no rule for schools where every course closes on 15 Oct.
  - **Why the guard missed it.** The label names no institution, so the name scan cannot see it. The site's own note contradicts the placement.
- **Citations.** On 14 Irish pages the 1 Feb and 20 Jan CAO dates cite cao.ie's "Timetable of Events", which still shows the 2025/26 cycle: "20th January 2026" and "1st February (17:00)" with no year. The 2027 handbook, which the site cites for 5 Nov, does confirm both dates.
  - Chalmers cites Stockholm University's page for two national dates.
  - Haaga-Helia and Laurea cite a Tampere University page for the joint application.
  - The dates in these cases are right, but a student who opens "Source" lands on another school or another year.
- **Art direction.** The desktop panel is unchanged. It starts at y = 725–785 on a 800 px screen, so the first screen shows its title at best (`is-lhi-desk-panel.jpg`, `gb-cambridge-desk-panel.jpg`).
  - The phone is good. It shows three dates at 87–117 px each, then "All dates (n more)". There is no sideways scroll.
  - /timeline/ asks "Which countries?" before it shows any date.
  - DSAI leads with the non-EU/EEA date, which most of our readers can ignore.
- **Coverage.** 166 pages still have no date of their own, for example Harvard and PoliMi.

## Dates checked (sources fetched 26 Sep 2026)

| Page | Shown | Source | Verdict |
|---|---|---|---|
| Sciences Po (FR) | 4 Nov 2026, 23:59 Paris | sciencespo.fr/admissions/en/undergraduate/foreign-secondary-schools/ | ✓ "if you apply no later than 4 November 2026"; "Paris time (11.59pm)" |
| Sciences Po | 1 Mar 2027, 23:59 | same | ✓ "dual degrees … is set on 1 March 2027" |
| CEU (AT) | 15 Oct 2026, 23:59 CET | ceu.edu/admissions/bachelor | ✓ "Admission Round 1 Deadline: October 15, 2026 (23:59, Central European Time)" |
| CEU | 2 Feb 2027 | same | ✓ "Deadline: February 2, 2027" |
| Chalmers (SE) | 15 Jan 2027 | universityadmissions.se/…/autumn-semester-dates/ | ✓ "15 January 2027 Application deadline" |
| Chalmers | 16 Oct 2026 opens | su.se/…/important-dates | ✓ "16 October 2026 Application round opens". The source is Stockholm University's page, not Chalmers' |
| TCD + 13 other IE pages | 1 Feb 2027, 17:00 | cao.ie timetable of events | ~ the cited page gives "1st February (17:00)" with no year, in the 2025/26 table. The 2027 handbook gives "1 February 2027 at 5pm" |
| TCD + 13 other IE pages | 20 Jan 2027, 17:00 | same | ~ the cited page says "20th January 2026". The handbook gives "20 January 2027 at 5pm" |
| Keio (JP) | PEARL I 2 Dec 2026 | keio.ac.jp/…/pearl/ | ✓ "October 21, 2026 - 3:00 p.m. on December 2, 2026 (JST)" |
| Kyoto (JP) | iUP 3 Dec 2026, 17:00 JST | iup.kyoto-u.ac.jp/apply/ | ✓ "November 2 until December 3, 2026 (5 p.m. JST)" |
| Tohoku (JP) | 14 Jan 2027 | admissions.tohoku.ac.jp/…/gateway_college/ | ✓ "December 15-January 14 APPLY … October 2027 ENROLLMENT" |
| McGill (CA) | 15 Jan 2027 | mcgill.ca/importantdates/…-370820 | ✓ "Friday, January 15, 2027" |
| NHH (NO) | 15 Feb 2027 | nhh.no/…/admission-bsc-in-business-economics… | ✓ "EU/EEA/Swiss nationals 1 January – 15 February 2027" |
| VŠE (CZ) | 28 Feb 2027 | ibb.vse.cz/…/entrance-exam/ | ✓ "Application Deadline: … February 28th, 2027" |
| RSU (LV) | EU 1 Jul 2027 | rsu.lv/…/when-apply | ✓ "Medicine Dentistry 1 Mar – 1 Jul 2027" (EU/EEA column) |
| PUMS (PL) | 20 Jul 2027 | pums.edu.pl/…/application-calendar/ | ✓ "Application deadline … 20 Jul 2027" |
| Tallinn Univ. (EE) | 1 Mar 2027 | tlu.ee/en/application-deadlines | ✓ "Autumn 2027: November 1, 2026 – March 1, 2027" |
| Pécs (HU) | 30 Jun 2027 | admissions.medschool.pte.hu/application-form | ✓ "application deadline is 30th June 2027" |
| Cambridge | UAT-UK October booking closes 28 Sep 2026, 18:00 BST | esat-tmua.ac.uk/deadlines/ | ✓ "Test booking closes for October 2026 28th September 2026 6pm BST" |
| **Cambridge, Oxford** | **UAT-UK January booking 26 Oct–21 Dec 2026, Hard deadline; January sitting 4–8 Jan 2027** | same | **✗ wrong school.** The dates are right, but the source says "January 2027 Test Sitting Not applicable for Cambridge or Oxford applicants" |
| **Cambridge, Oxford** | **13 Jan 2027, 18:00, Equal consideration** | ucas.com/events/2027-entry-deadline-…-475546 | **✗ wrong school.** "all 2027 entry undergraduate courses, except those with a 15 October deadline" |
| Oxford, Cambridge | LNAT sit by 15 Oct 2026 | lnat.ac.uk/…/dates-and-deadlines/ | ✓ "Sit the LNAT before, or at the latest on, 15 October 2026" |

Deusto (2–30 Nov 2026) could not be checked because deusto.es returned 403.

**Tally: 22 dates checked (18 of them new), across 13 countries.**
- 18 are correct.
- 2 are correct but cite a page with the wrong year (CAO).
- 2 are on pages they do not apply to: Oxford and Cambridge, 6 placements in all.
- No date is wrong in itself.

## Wrong-school scan

`scan.py` covered all 470 `/universities/*/` pages. For each date it matched the distinctive words of every other school's name against the one-line label, and it also searched for the six institutions that have no page. It then listed every source domain that 2–4 schools share.

- **Label hits.** All are false positives or tied shared rules:
  - "Norwegian" in the Samordna label;
  - "CEU (Vienna)" matching the Vienna universities;
  - "Helsinki time";
  - the tied "Oxford, Cambridge, medicine…" on 14 medical schools;
  - "University of Iceland and Akureyri" on is-hi, which is Iceland's own fee.
- **Domain hits.** tuni.fi appears on Haaga-Helia and Laurea, and epfl.ch on UZH ("EPFL and the University of Zurich close…", which is correct). The Haaga-Helia and Laurea dates are right, but the source is Tampere's page.
- **Found by reading, not by the scan.** The Oxford and Cambridge placements above. They are the only wrong-school dates, and name matching cannot find them.

## Three changes that would raise it most

1. **Scope shared dates by the rule's exceptions.**
   - Tie the two January UAT-UK dates to Imperial, UCL, LSE, Warwick and Durham only.
   - Keep UCAS 13 Jan, Extra, Clearing and 23 Sep off any page whose courses all close on 15 Oct (Oxford, Cambridge).
   - Add a guard: a date whose own note says "Not available for X" must not reach X's page.
2. **Bring the desktop panel above the fold.** Put it beside the hero, or add a "Next: 28 Sep 2026 · UAT-UK booking closes" chip in the hero.
3. **Cite the page that carries the year.** CAO 1 Feb, 20 Jan and 1 Jul should cite the 2027 handbook. Chalmers should cite universityadmissions.se, and Haaga-Helia and Laurea opintopolku or their own pages. Then give the 166 link-only pages their route dates.

## Bugs

| Bug | Evidence |
|---|---|
| Cambridge and Oxford: UAT-UK January booking shown as Hard deadline, with a note saying it is not available to them | `gb-cambridge-desk-panel.jpg`, `gb-cambridge-phone-panel.jpg` (under "8 more"), crawl |
| Cambridge and Oxford: UCAS 13 Jan, Extra, Clearing and 23 Sep shown; 23 Sep is sorted after 6 Jul | crawl |
| CAO dates cite the 2025/26 timetable | `ie-tcd-phone-panel.jpg` |
| Desktop panel starts at y = 725–785 | `is-lhi-desk-panel.jpg`, probe.json |
| 15 Jan numerus fixus shown as confirmed on TU/e but provisional on Maastricht IB, both citing Studielink | crawl |
| DSAI and IB "All enrolment tasks complete" cite the UCM programme page | `nl-um-dsai-phone-panel.jpg`, crawl |
| Fixed and confirmed: ETH, IUA, /timeline/ asks for a country first | `ch-eth-phone-panel.jpg`, `is-lhi-desk-panel.jpg`, `timeline-*-top.jpg` |
