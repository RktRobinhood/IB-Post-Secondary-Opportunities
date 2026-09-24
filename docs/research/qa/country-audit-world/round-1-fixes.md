# Country audit (world and Southern Europe, 15 destinations): fixes after critic round 1

Editor pass, 2026-09-24, answering `round-1.md` (score 7/10). Scope: es, it, pt, gr, mt, us, ca, au, nz, ae, jp, kr, cn, hk, sg.

- Files edited: only `data/countries/<cc>.json`, `data/destinations/<cc>.json` and `data/application-routes/<cc>-*.json`. There are no context notes for these codes.
- Not touched: `src/`, `scripts/`, `data/evidence/` and every `meta` block.
- Already done by the coordinator before this pass: routes outside the EU/EEA use `applicantGroup: "any"`, so "Applies to: non-eu" no longer renders, and the deadline-label guard was widened.

## Checks after the edits

- `node scripts/test-deadline-labels.mjs`: **ok, every label agrees with its note** (756 events, all 35 countries). Before this pass it failed on 19 cards.
- `npm run validate`: all 1,476 records are valid.
- All pass: `test-calendar`, `test-ib-calendar`, `test-floor`, `test-destinations`, `test-sourcing`, `test-evidence-policy`, `test-no-control-chars`, `test-jurisdictions` and `test-page-budget` (35 pages inside the budget).
- `node src/build.mjs`: wrote 152 pages. The built US, SG, ES, CA and KR pages no longer contain "five weeks before", "halves", "high 30s", "collides", "inside the May", "Pamplona, Bilbao", "both aimed at", "first of the autonomous" or "longest window".

## How the labels were chosen

These follow the European editor's rule (`../country-audit-europe/round-4-fixes.md`):
- `indicative` is the consequence that shows no badge.
- An undated card that explains who sets a date, or announces that a date will be published, is `indicative`. Where the date is set per institution, it also gets `dateState: "varies-by-institution"`.
- An undated card for one real deadline whose day is not out yet stays `hard`, with `not-published` or `not-yet-announced`.

## 1. Undated cards marked "Hard deadline" (the 19 the guard failed on)

Every one of these changed `consequence: hard → indicative`. No label or note text changed.

| File | Card |
|---|---|
| `application-routes/ae-federal-direct-2027.json` | `ms-ae-fed-zu-dates` "Zayed University confirms its undergraduate application dates" (announcement) |
| `application-routes/ae-federal-direct-2027.json` | `ms-ae-fed-uaeu-window` "UAEU announces an application period" (announcement) |
| `application-routes/ae-private-direct-2027.json` | `ms-ae-priv-ku-timeline` "Khalifa University publishes its Fall 2027 application timeline" (announcement) |
| `countries/ca.json` | "Ontario — accept the offer and pay the deposit" (set in each offer letter) |
| `countries/ca.json` | "British Columbia — University of Victoria applications close" (set per programme) |
| `countries/ca.json` | "Alberta — University of Alberta and University of Calgary applications close" (set per programme) |
| `application-routes/cn-joint-direct-2027.json` | `ms-cn-jv-others` "UNNC, CUHK-Shenzhen and Wenzhou-Kean" |
| `application-routes/cn-national-direct-2027.json` | `ms-cn-nat-apply` "University application windows" |
| `application-routes/es-private-2027.json` | `ms-apply` "Each private university's own admission rounds" |
| `application-routes/gr-public-english-2027.json` | `ms-gr-en-other` "Other English-taught programmes" |
| `application-routes/hk-direct-2027.json` | `ms-hk-others` "Other universities" |
| `application-routes/it-direct-2027.json` | `ms-apply` "Each university's own application round" |
| `application-routes/kr-direct-2027.json` | `ms-uic-round2-open` "Yonsei UIC 2nd Round opens for Fall 2027". An opening; the round's hard deadline is already its own card in `countries/kr.json` ("Yonsei UIC 2nd Round, Fall 2027 entry", `not-yet-announced`, hard). |
| `application-routes/mt-direct-2027.json` | `ms-others` "MCAST, ITS and the private institutions" |
| `countries/nz.json` | "Semester 2 2027, the mid-year intake — …" |
| `countries/nz.json` | "Semester 1 2028, the main intake — …" |
| `countries/nz.json` | "Programmes with early closing dates — …" |
| `countries/us.json` | "Applications close — and there is no American closing date, …" |
| `countries/us.json` | "Financial aid forms are due with the application, …" |

### The same fault on cards the guard did not catch

These are explanation cards that were marked `not-published` and hard, which slipped past the guard's pattern. Each now reads as what it is.

- `application-routes/au-direct-2027.json`, "Each university's own closing date": `consequence: hard → indicative`, with `dateState: varies-by-institution` added. This is the card round 1 named on the AU calendar.
- `application-routes/nz-direct-2027.json`, "Closing dates for the main February 2028 intake": `hard → indicative`, with `dateState: varies-by-institution` added.
- `application-routes/us-common-app-2027.json`, "Regular Decision — each college sets its own date":
  - `hard → indicative`, with `dateState: varies-by-institution` added.
  - Note: "This one is genuinely hard: after a college's Regular Decision date it is finished for the year" → "Each college's own date is final: after a college's Regular Decision date it is finished for the year".
- `countries/cn.json`, "Peking University, Fudan University and Shanghai Jiao Tong University — international undergraduate admission": `dateState: not-published → varies-by-institution` and `consequence: hard → indicative`. The card covers three universities and their three calendars.

### Single deadlines not yet published: kept hard, label made to name a deadline

- `countries/ae.json`: "Khalifa University — Fall 2027 application timeline" → "Khalifa University — Fall 2027 application deadline". It stays `not-yet-announced`, hard.
- `countries/ae.json`: "Zayed University — Fall 2027 application dates" → "Zayed University — Fall 2027 application deadline". It stays `not-yet-announced`, hard.
- `countries/ae.json` "American University of Sharjah — Fall 2027 application closing date" is left as it was: `not-published` and hard, and its note says "ask AUS". That is the shape the brief asks for.

## 2. UBC 15 November (fix 3)

Source: https://you.ubc.ca/applying-ubc/dates-deadlines/, re-read 2026-09-24 with curl: "November 15, 2026 (11:59 p.m. PST) … International applicants: Deadline to apply to UBC and submit an award application if you're an international student and you wish to be considered for the UBC International Scholars Program awards."

`countries/ca.json`, the 2026-11-15 deadline:
- `label`: "British Columbia — UBC, the date for international applicants and for the International Scholars Program awards" → "British Columbia — UBC International Scholars Program: apply and submit the award application"
- `audience`: "international applicants, and anyone seeking a UBC International Scholars Program award" → "international applicants who want an International Scholars award"

`application-routes/ca-epbc-2027.json`, `ms-ubc-scholars`:
- The audience vocabulary (`$defs.applicantGroup`: eu-eea-ch, nordic, domestic, non-eu, any) has no value for "award applicants", so `audience` stays `"any"` and the label says who the date is for.
- `label`: "UBC International Scholars - application and award application due" → "UBC International Scholars Program, for award applicants only - apply and submit the award application"
- `note`: "…in the first term of the final IB year. Award applicants also…" → "…in the first term of the final IB year. If you are not applying for the award, your date is 15 January. Award applicants also…"

## 3. Spain: PCE timing (fix 4)

Sources:
- UNEDasiss, https://unedasiss.uned.es/fechas_clave, re-read 2026-09-24 with curl: "Convocatoria de mayo/junio de 2026 España, del 25 al 29 de mayo".
- The IB May 2026 schedule, "Friday 24 April 2026 to Wednesday 20 May 2026". The dates come from the search index of ibo.org's `may-2026-examination-schedule.pdf`. ibo.org itself returns 403 or a Cloudflare page to both curl and WebFetch.

Changes:
- `countries/es.json` watchOuts[0]: "The timetable is brutal for an IB student: the ordinary PCE exams (25–29 May in 2026) fall inside the May IB exam session" → "The timetable is tight for an IB student: the ordinary PCE exams in Spain (25–29 May in 2026) fall in the week straight after the May IB exams end (20 May in 2026), so you revise for both at once".
  - The page says "in Spain" because UNED tells candidates at other exam centres only "Comprueba tu resguardo".
- `countries/es.json`, the PCE exams ordinary-call card:
  - `label`: "PCE exams, ordinary (May/June) call - the window that collides with your IB exams" → "PCE exams, ordinary (May/June) call - the week straight after your IB exams"
  - `notes`: "That is inside the IB May examination session, which is one of the hardest things about applying to Spain from an IB school, and it is why the September call exists as a fallback." → "The IB May 2026 exams ran from 24 April to 20 May, so the PCE came in the week straight after them and you revise for both at once. That is one of the hardest things about applying to Spain from an IB school, and the September call is the fallback."
- `countries/es.json`, the PCE registration extraordinary-call card, `notes`: "…for an IB student who will not sit PCE in the middle of the IB session - but…" → "…for an IB student who will not sit PCE the week after the IB exams end - but…"
- `countries/es.json` steps[3]: "The May/June call collides with the IB session; the September call does not, but falls after the admission deadline." → "The May/June call comes the week straight after the IB exams end; the September call gives you the summer, but falls after the admission deadline."
- `destinations/es.json` watchOuts[1]: "The May PCE subject tests, which lift your grade above 10, clash with the IB exams." → "…come the week straight after the IB exams end."
- `application-routes/es-public-2027.json` supplementarySteps[1]: "The May call falls during IB exams." → "The May call comes the week straight after the IB exams end."

## 4. Korea: KAIST sector note (fix 5)

Source: https://admission.kaist.ac.kr/intl-undergraduate/application/ApplicationGuide/ApplicationTimeline, re-read 2026-09-24.
- Early: "September 22 ~ October 22, 2026, 6:00 PM (KST)"; "Academic Year Begins: End of February, 2027".
- Regular: "November 10, 2026 ~ January 14, 2027"; result "March 25, 2027"; "Academic Year Begins: End of August, 2027".

Change:
- `destinations/kr.json` sectorLandscape (science and technology institutes) `note`: "KAIST runs an Early and a Regular round both aimed at the September intake and both closing more than half a year ahead of it, which is a North American shape and not a Korean one." → "KAIST runs two international rounds. The Early round (closes 22 October 2026) starts at the end of February 2027; only the Regular round (closes 14 January 2027, results 25 March) leads to the September intake, more than seven months after it closes."

## 5. Spain: Pamplona (fix 5)

Source: https://en.unav.edu/studies/degrees, re-read 2026-09-24. It lists "Degree in Medicine + International Program" and similar add-on programmes, and no fully English-taught bachelor's. This matches the Navarra card: "No fully English-taught bachelor's".

- `countries/es.json` whyConsider[4]: "Strong English-taught options in Madrid and Barcelona, plus real alternatives in Pamplona, Bilbao and Segovia" → "…plus real alternatives in Bilbao and Segovia".
- The housing paragraph's "Segovia, Pamplona and Bilbao are far easier" is about rent, not teaching language, so it is kept.

## 6. US and Singapore overclaims (fix 6)

### University of California: the filing window was wrong, not only the heading

**This is a date correction.** The brief asked for the heading "One window, 1–30 November", but UC's own pages, re-read 2026-09-24, give the fall 2027 filing period as **1 October to 30 November 2026**:
- https://admission.universityofcalifornia.edu/how-to-apply/applying-as-a-first-year/: "Application filing periods Fall quarter/semester: October 1–November 30".
- https://admission.universityofcalifornia.edu/how-to-apply/applying-as-a-first-year/dates-and-deadlines.html: the table row's month cell holds two lines, "October" and "November", against "1 -" / "30" and "Fall 2027 admission application filing period".
  - Flattened to text, this reads "October November 1 - 30", which is how it was misread as "November 1–30".
  - WebFetch's summary of this page makes the same misreading. The raw HTML (`<p>October</p><p>November</p>` beside `<p>1 -</p><p>30</p>`) and the first-year page settle it.

The closing date, 30 November 2026, was right and is unchanged. Only the opening date and the wording were wrong.

Changes:
- `destinations/us.json` jurisdiction `us-uc`, deadlines variation:
  - `label`: "One window, five weeks before everyone else" → "One window, 1 October to 30 November"
  - `summary`: "opens on 1 August 2026, is filed between 1 and 30 November 2026" → "opens for drafting on 1 August 2026, is filed between 1 October and 30 November 2026"
- `destinations/us.json` jurisdiction `us-uc` summary: "Berkeley is the campus in this profile" → "Berkeley is the campus on this page". This is research-log residue from round 1, section 5.
- `application-routes/us-uc-2027.json`:
  - `round-fall-2027`: `opens: 2026-11-01 → 2026-10-01`
  - its note: "One thirty-day window and nothing else. … only accepted between 1 and 30 November 2026" → "One filing window and nothing else. … only accepted between 1 October and 30 November 2026"
  - `ms-uc-open` note: "three months before you may file it" → "two months before you may file it"
- `countries/us.json`:
  - steps: "File the University of California application between 1 and 30 November 2026." → "…between 1 October and 30 November 2026."
  - The "University of California application closes" card (30 Nov 2026):
    - `notes`: "The cited page gives \"November 1 - 30\" as the \"Fall 2027 admission application filing period\", and the application itself opens on 1 August." → "UC's first-year page gives the fall filing period as \"October 1–November 30\"; its dates table lists the \"Fall 2027 admission application filing period\" across October and November. The application itself opens on 1 August for drafting."
    - `sources` added: the first-year page.

### US: unsourced comparisons

- `countries/us.json` whyConsider[3]: "…and are often more generous to internationals than the famous research universities." → "…and several (Amherst, Bowdoin) are need-blind for internationals."
  - Bowdoin, re-read 2026-09-24 at bowdoin.edu/admissions/apply/international-students/: "Bowdoin College is need blind for international students."
  - Amherst: its financial-aid pages for international students, as indexed, say Amherst is "need-blind" in evaluating international students and meets 100% of need. amherst.edu returns 405 to a fetch.
- `destinations/us.json` whyConsider[3]: the same sentence, same change ("…and several (Amherst, Bowdoin) are need-blind for international students.").
- `countries/us.json` whyConsider[4]: "Research, internships and campus jobs are built into the undergraduate experience in a way that is rare in Europe." → "…built into the undergraduate experience."
- `countries/us.json` financial aid (merit): "Merit awards are usually partial, 10,000-30,000 USD a year, and are concentrated at universities outside the top 20." → "Merit awards are usually partial, 10,000-30,000 USD a year."
- `destinations/us.json` Direct jurisdiction summary: "MIT is its best-known practitioner: it has never joined the Common App and does not intend to." → "MIT is its best-known practitioner: it uses its own application, not the Common App." This is round 1, section 4.

### Singapore

NTU's page, re-read 2026-09-24, gives "15 October 2026 - 19 March 2027" and "SGD25 for international applicants". NUS opens 16 December 2026 (round 1, item 29).

The Tuition Grant arithmetic uses the page's own figures:
- NUS: SGD 33,400 falls to 21,400, a cut of 36%.
- NTU: SGD 40,600 falls to 21,800, a cut of 46%.

Changes:
- `application-routes/sg-autonomous-2027.json` `ms-sg-au-ntu-open` note: "The first of the autonomous universities to open, two months before NUS." → "Opens two months before NUS."
- `countries/sg.json`, the NTU application-window card, `notes`: "The longest window of the six autonomous universities, and the first of them to open." → "It opens two months before NUS."
- `countries/sg.json` steps[1]: "LASALLE opens on 1 October 2026 and asks you to apply by 1 November 2026 — before any Singapore university has opened." → "LASALLE opens on 1 October 2026, two weeks before NTU, and asks you to apply by 1 November 2026, six weeks before NUS opens."
  - The old claim was false: NTU opens 15 October, before 1 November.
- "Halves the fee", changed in three places:
  - `countries/sg.json` steps[2]: "Taking it halves the fee" → "Taking it cuts tuition by roughly a third to almost half".
  - `application-routes/sg-autonomous-2027.json` `si-sg-au-tg-election` note: "Electing the grant halves the fee" → "Electing the grant cuts tuition by roughly a third to almost half".
  - `destinations/sg.json` summary: "the MOE Tuition Grant roughly halves international tuition" → "the MOE Tuition Grant cuts international tuition by roughly a third to almost half".
- The "high 30s to low 40s" sentence, cut in two places:
  - `countries/sg.json` ibRecognition.notes[3]: "Official indicative IB grade profiles are not published. Competitive applicants to NUS and NTU are generally said to be in the high 30s to low 40s; treat that as a caution rather than a threshold, and ask admissions for the published profile." → "Official indicative IB grade profiles are not published; ask admissions for the published profile."
  - `destinations/sg.json` ibRecognition.minimumPoints: the "Competitive applicants … threshold." sentence is cut.

## Left for the coordinator (outside this editor's files)

- **`data/evidence/us.json`, `ev-uc-dates-fall-2027`.** Its `claim` still reads "must be filed between 1 and 30 November 2026". It should read "between 1 October and 30 November 2026". The excerpt itself ("October November 1 - 30") is faithful to the page.
- **`data/destinations/us.json` `meta.notes[0]`.** It still says "the University of California closes five weeks before everyone else". It is a meta block, so this pass left it alone.
- **Not done: round 1's lower-priority items.** These are:
  - the AU UAC past-tense notes;
  - the SG SUSS and SIM research-log lines;
  - "all ten states in this profile" (US) and "the one this profile covers" (CN);
  - a dated AU worked example;
  - the section 4 rewordings of UPC, CUHK "big three" and GKS "flagship".
