# Issue #47 deadlines per school: critique, round 3

**Score: 6 / 10. Do not ship.**

Checked on 26 Sep 2026 against localhost:4380 (the published build), at 1280×800 and 390×844. I read every panel on all 543 pages (471 schools and 72 programmes) from the server-rendered HTML (`crawl.py`, text in `panels-dump.txt`) and captured 13 pages with `shoot.mjs` and `cdp.mjs` (`probe.json`).

## Why

- **All the round-2 faults are fixed.** UBC now shows 7 dates, all UBC's, and SFU shows its own 5. Helsinki leads with 23 Mar group 2. MIT's Early Action is now a hard deadline and is in date order. Binding dates now come first (SDU shows uniTEST). Each phone item is 87–115 px, where round 2 measured about 160. The panel is titled "Deadlines", and /timeline/ asks for a country first.
- **Three school pages still show other schools' dates, so the round fails.**
  - **Iceland University of the Arts** has no date of its own. Its two hard deadlines are "30 Apr: Reykjavik University" and "5 Jun: University of Akureyri".
  - **University of Iceland** shows the same two dates, as its 2nd and 3rd hard deadlines.
  - Cause: neither Reykjavik nor Akureyri has a page. Their dates in `data/countries/is.json` have no `institutions` tie, so they reach every Iceland page. The round-2 guard only knows schools that have pages, so it missed them.
  - **UAL** leads with the "UAT-UK (ESAT, TMUA, TARA)" booking dates, 3 of them hard deadlines. No UAL course uses those tests. Cambridge and Imperial do use them, and they show none. The name fallback reads "UAT" as an initialism for University of the Arts.
- **ETH's first hard deadline belongs to last year's applicants.** "15 Sep–15 Oct 2026: register for the entrance exam" follows, in the site's own note, "the 31 March 2026 application". A student applying now for autumn 2027 applies from 1 Dec 2026, so this is not their deadline. The source also gives no year, and the item is not marked provisional.
- **Dates without a year are marked unevenly.** The Dutch "15 Jan" and "1 May" appear on 20+ pages unmarked, but studyinnl and rijksoverheid give no year. MIT and Samordna dates in the same situation are marked provisional.
- **Coverage.** 166 pages still show no date at all, only "Every date in <country>" (Harvard, for example). Politecnico di Milano shows only "IB results released".
- **Art direction.** At 1280×800 the desktop panel starts at y≈725–762, so the first screen shows the title and nothing else. The side panel is not there at a glance.

## Dates checked (32 dates, sources fetched 26 Sep 2026)

| Page | Shown | Source | Verdict |
|---|---|---|---|
| UBC | 15 Nov 2026, 15 Jan 2027 23:59 PST, 25 Jul 2027 | you.ubc.ca/applying-ubc/dates-deadlines | ✓ "Deadline to apply for Winter Session (September 2027…)" |
| SFU | 15 Dec 2026; 31 Jan 2027 | sfu.ca/…/fall-term.html | ✓ "Application deadline: January 31, 2027" |
| Helsinki | 9–23 Mar 2027 15:00 | helsinki.fi/…/liberal-arts-and-sciences… | ✓ "Ends: 23 Mar 2027 at 15:00" |
| LUT | 30 Apr 2027 23:59; 31 Aug 2027 | lut.fi/…/international-rolling-admission… | ✓ "1 September 2026–30 April 2027 at 23:59" |
| MIT | EA 1 Nov, RA 4 Jan · prov. | mitadmissions.org/…/deadlines-requirements | ✓ no year given, marked provisional |
| HKU | 25 Nov 2026 12:00; 1 Dec; 25 Aug 2027 | admissions.hku.hk/…/international-qualifications | ✓ "25 Aug 2027 Applications close at noon" |
| CUHK | 12 Nov 2026; 7 Jan 2027 | admission.cuhk.edu.hk/…/important-dates | ✓ |
| ETH | 31 Mar 2027 · prov. | ethz.ch/…/how-to-apply.html | ✓ "1 December to 31 March, 23:59" |
| **ETH** | **15 Sep–15 Oct 2026, hard, not provisional** | ethz.ch/…/eth-entrance-examination.html | **✗ wrong cycle for this reader, and no year in the source** |
| UZH | 1 Jan–30 Apr 2027 · prov. | uzh.ch/…/deadlines.html | ✓ "1 January until 30 April" |
| TU/e | 15 Jan 2027 23:59 | tue.nl/…/bachelor-college/selection | ✓ "1 October 2026 until 15 January 2027" |
| TU/e | 1 May 2027 23:59 | studyinnl.org/…/how-to-apply | ~ right day, but no year in the source and not provisional |
| NTNU | 15 Apr 2027 23:59 · prov. | samordnaopptak.no/…/tidsfrister | ✓ "15. april kl. 23.59" (the page covers 2026) |
| NUS | 16 Dec 2026–17 Feb 2027 | nus.edu.sg/oam/…/important-dates | ✓ "IB Diploma Application Period 16 December 2026 to 17 February 2027" |
| U. Iceland | 1 Feb 2027 · prov. | english.hi.is/…/application-deadline | ✓ no year given |
| **U. Iceland, IUA** | **30 Apr 2027 (Reykjavik), 5 Jun 2027 (Akureyri)** | ru.is, unak.is | **✗ wrong school** |
| **UAL** | **UAT-UK booking, closes 28 Sep 2026 18:00** | esat-tmua.ac.uk/deadlines | **✗ wrong school.** The date is right, and UAL is not mentioned on the source page |
| Semmelweis | 31 May 2027; 21 Aug · prov. | semmelweis.hu/…/medicine | ✓ "31 May, 2027" |
| Debrecen | 1 Nov 2026; 15 May 2027 | edu.unideb.hu/…/application-and-admission | ✓ |
| Charles (LF2) | 1 Nov 2026–30 Apr 2027; exams 3 Jun, 2 Jul, 13 Jul, 22 Jul | lf2.cuni.cz/…/key-dates-and-deadlines | ✓ |
| NTU | 19, 22 and 26 Mar 2027 | ntu.edu.sg/…/international-baccalaureate-diploma | ✓ "15 October 2026 - 19 March 2027" |
| KAIST | 14 Jan 2027 18:00 KST; 21 Jan | admission.kaist.ac.kr/…/ApplicationTimeline | ✓ |
| SSE Riga | 6 Apr, 17 Apr, 25 Jul 2027 | sseriga.edu/…/admission | ✓ "The application deadline is April 6, 2027." |
| IE | Round 2 15 Jan 2027 | ie.edu/…/admissions-rounds | ✓. Round 1 (6 Nov) and Round 3 are not shown |
| Vilnius | 1 Jul 2027 | vu.lt (the 2026 page); admissions.vu.lt | ✓ admissions.vu.lt gives the 2027/28 round |
| NYUAD | 1 Nov, 1 Jan, 5 Jan · prov. | nyuad.nyu.edu/…/key-dates | ✓ no year given |

**Tally: 32 dates checked. 26 are correct. 4 are on the wrong school (Iceland ×2 pages, UAL). 1 is for the wrong cycle (ETH). 1 has no year in its source and is not marked provisional (NL 1 May).**

My own scan for wrong-school dates covered all 543 pages, by institution names and by initialisms. The only hits are is-hi, is-lhi and gb-ual. The shared LNAT and "Oxford, Cambridge, medicine…" labels were not counted.

## Three changes that would raise it most

1. **A date that names any institution shows only where it is tied.** Treat a label that names an institution with no page (Reykjavik, Akureyri, Palacký…) as tied to nothing, and stop matching on initialisms against a phrase in a school's full name ("UAT" ≠ UAL). Extend the guard to institutions without pages. Fixed means IUA shows no one else's dates and UAL shows no UAT-UK dates.
2. **Put UAT-UK on the schools that use it**, with `institutions` for Cambridge, Imperial and the others its site lists. **Drop ETH's exam registration, or retitle it for last spring's applicants and move it below 31 Mar.** Fixed means ETH leads with "31 Mar 2027: applications close".
3. **Mark every date whose source gives no year as provisional, NL included, and bring the desktop panel above the fold.** Put it beside the hero, or add a one-line "Next: 15 Jan 2027" chip in the hero. Then give the 166 link-only pages their route's dates through `jurisdiction → applicationRoute`.

## Bugs

| Bug | Screenshot |
|---|---|
| IUA's panel is only Reykjavik and Akureyri dates | `is-lhi-desk-panel.jpg` |
| U. Iceland shows Reykjavik and Akureyri as its hard deadlines | `is-hi-phone-panel.jpg` |
| UAL leads with ESAT/TMUA booking; Cambridge and Imperial show none | `gb-ual-phone-panel.jpg` |
| ETH leads with last cycle's exam registration | `ch-eth-phone-panel.jpg` |
| Desktop panel below the fold (y≈725) | `is-lhi-desk-top.jpg`, `fi-uh-desk-top.jpg` |
| Harvard: no date, only a link | `us-harvard-phone-panel.jpg` |
| Maastricht programme pages cite a UvA page for "Studielink opens"; non-fixus DSAI shows "numerus fixus ranking numbers" | `probe.json` / `panels-dump.txt` |
