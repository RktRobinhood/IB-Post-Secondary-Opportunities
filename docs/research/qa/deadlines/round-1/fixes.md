# Issue #47 deadlines per school: round-1 fixes

Written 25 Sep 2026, in reply to `critique.md` (4/10). Every date below was re-read at its source on 25 Sep 2026. Each record carries the source as an evidence record, the way the records around it do.

## Dates

| # | Where | Was | Now | Source |
|---|---|---|---|---|
| 10 | TU Delft (`nl-studielink-2027/ms-tudelft-other`) | national 1 May | **1 April**, hard, provisional (the page gives no year). It supersedes the national 1 May on TU Delft pages. | https://www.tudelft.nl/en/education/admission-and-application/bsc-international-diploma/application-procedure (`ev-tudelft-nl-application-procedure`) |
| 11 | Twente, Technical Computer Science (`nl-studielink-2027/ms-utwente-tcs`) | national 1 May 23:59 | **30 April 23:59 CET**, provisional (the page still reads 30 April 2026). It supersedes 1 May on the TCS page only. | https://www.utwente.nl/en/education/bachelor/programmes/technical-computer-science/enrolment/application-deadline-tcs/ (`ev-utwente-nl-tcs-deadline`) |
| 5 | SDU (`dk-optagelse-international-2027/ms-sdu-reply`) | "Accept your place 2 Aug", looked firm | **3 August**, hard, shown as provisional. It supersedes the national 2 August on SDU pages. | https://www.sdu.dk/en/uddannelse/ansoegning-optagelse/bachelor-diplomingenioer/frister (`ev-sdu-dk-frister-2027`) |
| 7 | SDU uniTEST (`ms-sdu-unitest`) | missing | **20 March 12:00 CET**, hard, provisional | same SDU page |
| 14 | Maastricht maths syllabus | 1 June, no audience | **EU/EEA/Swiss 1 June** (`audience: eu-eea-ch`) and **non-EU/EEA 1 May** (new `ms-maths-syllabus-noneu`, `audience: non-eu`), both 23:59 CET. The labels name the programme (DSAI), so they show on the DSAI page only. | https://www.maastrichtuniversity.nl/education/bachelor/programmes/data-science-and-artificial-intelligence/admission-requirements (`ev-um-nl-dsai`, excerpt extended) |
| 19 | Finland, 21 vs 22 January | the profile said Aalto's 22 January "is wrong" | **Both are right.** Studyinfo's joint application record ("Joint Application to Higher Education, Spring 2027", Finnish National Agency for Education) runs 7 Jan 08:00 to **21 Jan 2027 15:00**. None of its 440 programmes is Aalto's. Aalto runs its own Studyinfo application ("admission round B to Bachelor's programs in English 2027"), 7 Jan 08:00 to **22 Jan 2027 15:00**. The `fi.json` watch-out and note, the route note and Aalto's labels now say so. Aalto's own close supersedes the joint window on its page. | https://opintopolku.fi/konfo/en/haku/1.2.246.562.29.00000000000000092075, read through the JSON the page is built from (`konfo-backend/haku/…92075`, `konfo-backend/toteutus/1.2.246.562.17.00000000000000008190`) (`ev-fi-studyinfo-joint-application-2027`) |

A label only: the German "Medicine group" gap-year label (`de.json`) is now 10 words, not 17. It had become a repeated 16-word sentence on 14 school pages. The date is unchanged.

## Code

- **One panel everywhere.** `src/pages/schools.mjs` now calls `datesPanel()` from `school-dates.mjs`. The old panel is deleted. The panel sits beside the degrees, first on a phone (Aalto: y≈815, was ≈4170). 0 of 470 `/universities/` pages say "No dates". 304 have a full panel (was 19). The other 166 are in countries with several routes (AU, BE, CA, US, KR, PT, GR, ES, CN, AE, SG, JP, LT, FR). Their panel is one link, "Dates in <country>", because nothing in the records says which route such a school uses.
- **Universal rules in `school-dates.mjs`:**
  - A school with no listed programmes takes its country's route when the country has exactly one route open to all.
  - School-record dates (`data/schools/`) are events.
  - A school's own date replaces the general one through a new `supersedes` field (`"<route>/<milestone>"`). It is in both schemas.
  - A date naming *one* other school is that school's. A date naming several is shared: UCAS "Oxford, Cambridge, medicine…" now shows on UCL too.
  - A name the label spells out further wins: "TU Delft" is not TU/e.
  - Last year's entry dates are left out.
- **The next binding deadline leads** (hard or equal-consideration). This is `leadOrder()` at build time. `dates-panel.js` redoes it after it drops past dates, with `data-binding`. Provisional dates show "· provisional" on the date line.
- **Notes are shown in full** inside "Note", split into paragraphs, with no clamp. **Source** and "Every date in …" links are 24 px tall. The double rule between items is gone. All CSS is in `primitives.css`.
- **Twin dates merge.** "issued / published / released / announced" join the calendar's generic words, so Maastricht's two 15 April ranking dates merge into one.
- **/timeline/ is filter-first.** With no country chosen, `calendar.js` shows only the chips and "Pick a country to see its dates." "Every country" is now "Clear". Dates for an earlier entry year are chosen by `isForEarlierEntry()` in `calendar.mjs`, which reads the event's intake (45 events, mostly PT/PL/BE 2026). They leave "Next up" and every upcoming count, and sit in their own disclosure, "Last year's dates, kept as a pattern". The chosen chip scrolls into view in the phone strip.

No guard was loosened.

## Could not verify, or left open

- **IB results 6 July 2027** (critique #6) is unchanged, still an inference and still marked provisional. ibo.org was not re-read.
- **Twente, other programmes.** Advanced Technology's own deadline page gives "before 1 May" (non-EEA), "before 1 July" (EEA) and "before 1 August" (Dutch) for a finished Osiris application. The AT, CreaTe and TCS opportunity notes all say Twente's 2026 deadline was 30 April. That fits TCS only. The notes need a re-read. They are not changed here, and the 30 April date is not applied to the whole university.
- **Years inferred.** TU Delft's 1 April and SDU's 20 March and 3 August are published with day and month only. They are provisional until the institutions publish dated pages.
- **Sessions import** (`data/sessions/`) is out of scope, so "Upcoming sessions" still shows nowhere. The research shards wait in `docs/research/sessions/shards`.
- **Portugal duplicate.** Portugal's two routes each list "IB results released", so the PT scope shows it twice. This was already the case.
