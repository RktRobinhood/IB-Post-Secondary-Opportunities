# Issue #47 deadlines per school: critique, round 1

**Score: 4 / 10. Do not ship.**

Checked on 25 Sep 2026 against the local build (localhost:4350). Captures come from `shoot.mjs`, `shoot2.mjs` and `shoot3.mjs`, with probe data in `probe-*.json`.

## Why

- **Wrong dates.** As counsellor I would not repeat two dates to a student. TU Delft's page gives 1 May, but Delft's own deadline for international diplomas is **1 April**. SDU's page gives "Accept your place 2 Aug" as a hard deadline, but SDU's page says **3 August**. Under the round rule, one wrong date fails the round.
- **Few pages get the new panel.** It appears on 19 institution pages and 73 programme pages. **438 of the 470 `/universities/` pages** use a different, older panel in `src/pages/schools.mjs` that says "No dates of its own recorded yet". That includes all 22 UK schools, Leiden, UvA and 17 Dutch schools in total. The national dates (UCAS 13 Jan, Studielink 15 Jan and 1 May) are sitting in the data.
- **On the phone the deadline is hidden.** Only two dates show before the fold-out. On every Danish and Dutch page those two are soft: "Optagelse.dk opens" and "IB coordinator… Your own plan", or "Create your Studielink account". The hard deadline (15 March 12:00, or 15 January) sits behind "All dates".
- **Provisional dates look firm.** `school-dates.mjs` never reads `provisional`. So "Accept your place 2 Aug" and "IB results 6 Jul" appear as fact in the panel. The same dates are flagged provisional on /timeline/.
- **/timeline/ is not filter-first.** With no filter it shows "Next up 10 of 393", one list of every country. That list includes a Portugal **2026-entry** result (30 Sep 2026) and an AGH 2026 window as upcoming items.
- **No sessions.** `data/sessions/` does not exist, so "Upcoming sessions" appears on 0 pages. Only research shards exist, in `docs/research/sessions/shards`.
- **Notes are cut off.** The text inside the "Note" fold-out is cut to 16 words and ends in "…" (`firstSentence(e.note, 16)`). Opening a detail should show all of it.

What works: the new panel reads well on desktop in its side column, and date plus label fits on one line. It has no horizontal overflow at 390px, and it sits right after the facts grid on the phone. UK, Finnish, Italian and Maastricht dates are accurate.

## Date checks (20)

| # | Page / record | Date shown | Verdict | Source |
|---|---|---|---|---|
| 1 | DK route, SDU | Apply 15 Mar 2027 12:00 CET | correct | ufsn.dk/english/…/how-to-apply…; sdu.dk/…/frister |
| 2 | DK | Optagelse.dk opens 1 Feb | correct | sdu.dk/en/uddannelse/ansoegning-optagelse/bachelor-diplomingenioer/frister |
| 3 | DK | Reorder priorities 5 Jul 12:00 | correct | same |
| 4 | DK | Offers 28 Jul | correct | ufsn.dk (as 1) |
| 5 | **SDU panel** | **Accept your place 2 Aug, hard** | **wrong: SDU says 3 August** | sdu.dk/…/frister |
| 6 | DK/NL/UK | IB results 6 Jul 2027 | unverifiable (ibo.org 403; the record admits it is an inference) | ibo.org/…/assessment-and-exams/ |
| 7 | SDU programmes | uniTEST registration 20 Mar | **missing**. The programme copy mentions it but the panel does not | sdu.dk/…/frister |
| 8 | NL | Numerus fixus 15 Jan 2027 | correct | rijksoverheid.nl/…/studiekeuze-en-toelating; vu.nl/…/selection-procedure-numerus-fixus |
| 9 | NL | Ranking numbers 15 Apr | correct | vu.nl (as 8) |
| 10 | **TU Delft panel** | **"Everything else" 1 May** | **wrong: Delft says 1 April** | tudelft.nl/en/education/admission-and-application/bsc-international-diploma/application-procedure |
| 11 | UTwente panel | 1 May 23:59 | **wrong by a day: UT says "before 30 April at 23:59 CET"** | utwente.nl/…/technical-computer-science/enrolment/application-deadline-tcs/ |
| 12 | Maastricht | UCM 1 Feb non-EU, 1 Apr EU, 23:59 | correct | maastrichtuniversity.nl/…/university-college-maastricht/admission-requirements |
| 13 | Maastricht | DSAI 1 Apr non-EU, 1 May EU | correct | …/data-science-and-artificial-intelligence/admission-requirements |
| 14 | Maastricht | Maths syllabus 1 Jun | part wrong: non-EU is 1 May, and the record has no audience | same |
| 15 | Maastricht | Enrolment tasks 31 Aug; Studielink opens 1 Oct | correct | UCM page |
| 16 | UCAS | 15 Oct 2026, 13 Jan 2027 18:00, Clearing 2 Jul, final 23 Sep | correct | ucas.com/undergraduate/applying-university/ucas-undergraduate-when-apply |
| 17 | UK timeline | UAT-UK booking closes 28 Sep 2026 18:00 | correct | esat-tmua.ac.uk/deadlines/ |
| 18 | Aalto | 7 Jan 08:00, 22 Jan 15:00, 29 Jan, 1 Apr, 28 May, 13 Jul | correct as Aalto states it | aalto.fi/…/i-am-applying-with-an-ib-diploma |
| 19 | FI route | Joint application closes 21 Jan | correct per JYU and StudyinFinland. **It conflicts with Aalto's 22 Jan**, and the site does not say so | jyu.fi/…; studyinfinland.fi/news-events/joint-application-autumn-2026 |
| 20 | IT timeline | Bocconi early session 2–29 Sep 2026 15:00 | correct | unibocconi.it/…/admissions |

**Tally: 14 correct, 3 wrong (5, 10, 11), 1 part wrong (14), 1 missing (7), 1 unverifiable (6).**

## Three changes that would raise it most

1. **Put the real panel on every school page.** Delete the old `datesPanel` in `src/pages/schools.mjs` (lines 186–204) and call `datesPanel(site, inst)` from `school-dates.mjs`, as `institutions.mjs` already does. Fixed means UCL shows UCAS 13 Jan, Leiden shows 15 Jan and 1 May, and Aalto gets Note and Source links. No page should say "No dates" while its country has a route.
2. **Correct the school-specific dates, and show which are provisional.** Add a TU Delft override (1 Apr, international diploma) and a UTwente one (30 Apr 23:59). Set the "Accept your place" date per institution, starting with SDU at 3 Aug. Give `ms-maths-syllabus` its EU audience and add the non-EU 1 May twin. Add SDU's uniTEST 20 Mar date. In `dateItem()`, render `e.provisional` as the same "provisional" tag /timeline/ uses.
3. **Always show the next hard deadline, and make /timeline/ filter-first.** In `dates-panel.js`, make the next hard or equal-consideration date the first line on every screen width, with soft or personal items after it. In `calendar.js`, when no scope is set, hide `#cal-next` and show only the country chips plus one prompt ("Pick a country to see its dates"). Leave out anything whose entry cycle is not 2027.

## Bugs (screenshot each)

| Bug | Screenshot |
|---|---|
| 438 of 470 school pages say "No dates of its own recorded yet" | `gb-ucl-desk-panel.jpg`, `nl-leiden-phone-panel.jpg` |
| Old panel on Aalto/Finnish pages: no Note, no Source, placed after all the cards on the phone (y≈4170 of 7400) | `fi-aalto-phone-panel.jpg` |
| Phone shows only 2 dates, both soft; the hard deadline is hidden | `dk-sdu-phone-panel.jpg`, `nl-tudelft-phone-panel.jpg`, `nl-maastricht-phone-open.jpg` |
| Provisional "Accept your place" shown as a firm hard deadline | `bug-dk-accept-phone.jpg` |
| TU Delft shows 1 May | `bug-nl-tudelft-1may-phone.jpg` |
| Note text cut off with "…" even when opened | `dk-sdu-phone-open.jpg`, `nl-tudelft-desk-open.jpg` |
| Two 15 April ranking dates not merged (Maastricht) | `bug-nl-maastricht-twins-desk.jpg` |
| Unfiltered /timeline/ shows one list of all countries, with 2026-entry items | `timeline-desk-nextup.jpg`, `timeline-phone-top.jpg` |
| Phone chip strip scrolls sideways, and the selected Denmark chip is off-screen | `timeline-dk-phone-top.jpg` |
| uniTEST 20 Mar is in the programme copy but not in the panel | `dk-prog-desk-panel.jpg` |
| "Source" links are 44×16 px and "Every date in this country" is 17 px tall: too small to tap on a phone | `dk-sdu-phone-open.jpg` |
| "Upcoming sessions" shows nowhere because `data/sessions/` is missing | (0 of 543 pages) |
