# Issue #47 deadlines per school: critique, round 2

**Score: 6 / 10. Do not ship.**

Checked on 26 Sep 2026 against localhost:4350, at 1280×800 and 390×844. Harness: `shoot.mjs` + `cdp.mjs`. Panel text for 23 pages and /timeline/ is in `probe.json`.

## Why

- **All six round-1 corrections are right.** Every school page now has the panel (0 of 471 say "No dates"). The binding deadline comes first. Provisional dates are tagged, notes show in full, and /timeline/ asks for a country before it shows anything. That is real progress.
- **Two schools show deadlines that are not theirs, so the round fails.**
  - **Helsinki's first hard deadline is the national joint application, 7–21 Jan 2027.** Helsinki says its bachelor applications are "separate from the Finnish national joint application". Studyinfo's joint-application record lists 440 programmes, none of them Helsinki's. The note inside that same line even says Aalto is not in it, while showing it on Helsinki's page.
  - **UBC's panel, headed "All dates for this school", lists five Simon Fraser dates**, among them "SFU Undergraduate Scholars Entrance Scholarship closes 15 Dec" as a hard deadline. SFU's page has UBC's dates the same way. The cause: the label prefix "British Columbia —" completes the words of "University of *British Columbia*", so `namedIn()` in `src/lib/school-dates.mjs` reads every BC date as naming UBC.
- **MIT's Early Action deadline shows as "Priority"** (`us-direct-2027.json` `ms-mit-ea`, `consequence: "priority"`). So "30 Nov: SAT taken" comes first and "1 Nov: EA closes" second, out of date order. It is not a priority date. It is the Early Action deadline.
- **"Deadlines & sessions" has no sessions.** `data/sessions/` still does not exist, so the owner's side-panel rule is half met on 543 of 543 pages.
- **Phone density.** Each date takes about 160 px (date, label, pill, Note, Source), so one screen holds two. On SDU the second slot goes to the soft "Optagelse.dk opens" on the phone, and on the desktop "Your own plan" also shows. The second hard deadline, uniTEST 20 Mar, sits behind "6 more".
- **166 multi-route pages (US, CA, AU…) show only a link** "Dates in <country>". Harvard's page gives a student no date. This is honest, but it is not yet "deadlines live with each school".

## Date checks (22, each source fetched 26 Sep 2026)

| # | Page | Shown | Source | Verdict / quoted line |
|---|---|---|---|---|
| 1 | TU Delft | 1 Apr 2027 · prov. | tudelft.nl/…/bsc-international-diploma/application-procedure | correct: "All other programmes: 1 april" |
| 2 | UT TCS | 30 Apr 2027 23:59 · prov. | utwente.nl/…/application-deadline-tcs/ | correct: "30 April 2026 23:59 CET", marked provisional |
| 3 | SDU | Accept 3 Aug 2027 · prov. | sdu.dk/…/frister | correct: "confirm your admission … by 3 August" |
| 4 | SDU | uniTEST 20 Mar 12:00 · prov. | same | correct: "20 March at 12 noon (CET)" |
| 5 | UM DSAI | syllabus non-EU 1 May 2027 23:59 | maastrichtuniversity.nl/…/data-science-…/admission-requirements | correct: "1 May 2027, 23:59 CET … syllabus … non-EU/EEA" |
| 6 | UM DSAI | syllabus EU 1 Jun 2027 23:59 | same | correct: "1 June 2027, 23:59 CET" |
| 7 | UM DSAI | non-EU closes 1 Apr 2027 23:59 | same | correct |
| 8 | Aalto | closes 22 Jan 2027 15:00 | aalto.fi/…/i-am-applying-with-an-ib-diploma | correct: "22 January 2027 at 3pm" |
| 9 | Aalto | accept place 13 Jul 2027 15:00 | same | correct |
| 10 | FI route | joint closes 21 Jan 2027 15:00 | opintopolku.fi konfo-backend/haku/…92075 | correct: `paattyy 2027-01-21T15:00` |
| 11 | **Helsinki** | **joint 7–21 Jan as its hard deadline** | helsinki.fi/…/apply-bachelors-programmes | **wrong school**: "separate from the Finnish national joint application" |
| 12 | Helsinki | group 2 9–23 Mar 2027 15:00 | helsinki.fi/…/liberal-arts-and-sciences… | correct: "09 Mar 2027 at 08:00 Ends: 23 Mar 2027 at 15:00" |
| 13 | UCL | LNAT sit by 31 Dec 2026 | lnat.ac.uk/registration/dates-and-deadlines/ | correct: "Sit the LNAT before or on 31 December 2026" |
| 14 | Oxford | LNAT sit by 15 Oct 2026 | same | correct |
| 15 | UK | 13 Jan 2027 18:00 | ucas.com/…/ucas-undergraduate-when-apply | correct |
| 16 | TUM | Neuabi 15 Jul 2027 · prov. | hochschulstart.de/…/termine | correct: "15.07.2026", only WS 2026/27 published |
| 17 | TUM | Altabi 31 May 2027 · prov. | same | correct: "31.05.2026" |
| 18 | Bocconi | Winter 25 Nov 2026–26 Jan 2027 15:00; test 21 Jan | unibocconi.it/…/admissions | correct |
| 19 | UBC | 15 Nov 2026 & 15 Jan 2027, 23:59 PST | you.ubc.ca/applying-ubc/dates-deadlines/ | correct |
| 20 | UBC | accept 1 May–1 Jun 2027 | same | correct: "May 1, 2027 or June 1, 2027" |
| 21 | **UBC** | **SFU scholarship 15 Dec; SFU closes 31 Jan** | sfu.ca/…/fall-term.html | **wrong school**: correct for SFU, but shown as UBC's |
| 22 | MIT | EA 1 Nov, tests 30 Nov, RA 4 Jan · prov. | mitadmissions.org/…/deadlines-requirements/ | dates correct (no year, marked provisional). **EA mis-typed "Priority"** |

**Tally: 20 correct, 2 wrong-school (11, 21), 1 mis-typed (22).**

## Three changes that would raise it most

1. **Tie school-specific milestones to schools by id, not by name.** Add `institutions: ["ca-sfu"]` (or similar) to the BC milestones in `data/countries/ca.json` and `ca` routes, and filter on it in `school-dates.mjs`. At the very least, remove a leading "<Region> —" before `namedIn()`. Fixed means UBC shows 7 UBC dates and 0 SFU dates, and SFU shows the reverse.
2. **Take Helsinki off the joint route.** Add an exclusion in `fi-studyinfo-2027.json` (the way Aalto has its own application), or add `supersedes: "fi-studyinfo-2027/ms-joint-application"` to Helsinki's own group-2 date. Fixed means Helsinki leads with "23 Mar 2027 15:00: group 2 (IB) closes". Check Åbo Akademi the same way.
3. **Sessions, and a tighter phone item.** Import `docs/research/sessions/shards` into `data/sessions/`, or retitle the panel "Deadlines" until that is done. Fold "Note" and "Source" into one "Details" row, so each item is about 90 px. Show every binding date before any soft one: SDU should show 15 Mar and 20 Mar first. Set `ms-mit-ea` to `hard`.

## Bugs

| Bug | Screenshot |
|---|---|
| SFU dates in UBC's "dates for this school" | `ca-ubc-desk-panel.jpg` |
| Helsinki leads with a joint-application deadline it is not in | `fi-uh-phone-panel.jpg` |
| MIT EA "Priority" and listed after 30 Nov | `us-mit-phone-panel.jpg` |
| Soft items take the slots before the second hard deadline (SDU uniTEST hidden) | `dk-sdu-desk-panel.jpg`, `dk-sdu-phone-panel.jpg`, `nl-tudelft-phone-panel.jpg` |
| "Deadlines & sessions" on every page, sessions on none | `gb-ucl-desk-top.jpg` (header, lower right) |
| UCL fact tile reads "In English: All courses in" (cut off) | `gb-ucl-desk-top.jpg` |
| Phone chip strip starts at Australia, so Denmark and the Netherlands are off-screen; "Denmark — the destinations in this link." is odd copy | `timeline-phone-top.jpg`, `timeline-dk-phone-top.jpg` |
| Link copy differs: "Every date in this country" (DK) vs "Every date in the Netherlands" (Leiden) | probe.json |
