# Country audit (Europe, 20 destinations): fixes after critic round 4

Editor pass, 2026-09-24, answering `round-4.md` (score 7/10). Scope: fi, is, no, se, ee, lv, lt, pl, cz, hu, gb, ie, nl, be, lu, de, at, ch, fr, si.

- Files edited: only `data/countries/<cc>.json`, `data/destinations/<cc>.json` and `data/application-routes/<cc>-*.json`. No context note needed a change.
- Not touched: `src/`, `scripts/` and every `meta` block.
- Some route files keep short arrays on one line. Those files were patched in place, so their formatting is unchanged.

**How the labels were chosen.** The vocabulary is `$defs.consequence` in `schemas/common.schema.json`. How each value renders is set by `CONSEQUENCE` in `src/lib/calendar.mjs`:

| Value | What the card says |
|---|---|
| `hard` | "Hard deadline. After this the door closes." |
| `equal-consideration` | "Applications in by this date are guaranteed to be considered. Later ones may still be read, at the institution's discretion, against whatever places remain." |
| `priority` | "Later applications are considered after these." |
| `indicative` | No badge at all. |

`indicative` is the only way to give a card no consequence, because the schema requires the field on route milestones.

The rule applied to undated cards:
- A card that explains who sets a date ("set by each institution", "set per programme", or a route the reader does not use) is `indicative`.
- A card for one real deadline whose date is not out yet stays `hard`, because its note says the deadline is hard. Examples: Parcoursup wishes, MedAT registration, HPAT registration, Vilnius, Corvinus, Szeged and ARES.

## Checks after the edits

- `npm run validate`: all 1,476 records are valid.
- `node scripts/test-deadline-labels.mjs`, the coordinator's new guard: **ok — every label agrees with its note** (756 events). Before this pass it failed on three cards: UK Oxford/Cambridge, the LSMU final deadline and Slovenia 10 July.
- These tests all pass: `test-calendar`, `test-ib-calendar`, `test-floor`, `test-destinations`, `test-sourcing`, `test-evidence-policy` and `test-no-control-chars`.
- Guard over the built pages. I ran `node src/build.mjs`, then ran the regexes case-insensitively over the tag-stripped text of `dist/destinations/<cc>/index.html` for the 20 codes:
  - The round-4 guard regex: **0 matches**.
  - The round-4 critic's extra terms: **0 matches**. These are `not on this calendar|extracted from|could find|were not read|pages read|promotion agency|that is the finding|wikipedia field|during this research|in this research|this research could`.
  - My own extra terms: **0 matches**. These are `lowest headline|shorter than most|the one country on this list|twenty years|than Latvia or Estonia|only Berlin|found in Poland|the model can|now 404|redirects to|Recorded here so|One is:`.
- `dist/timeline/`: the guard still matches there, but every match comes from pt, gr, it, jp, mt or nz, which the other editor owns.

## Official pages re-read for this pass (2026-09-24)

**Charles 2nd Faculty of Medicine, key dates.** https://www.lf2.cuni.cz/en/applicants/how-to-apply/key-dates-and-deadlines
- London is "2 July 2027" and Berlin is "13 July 2027".
- Also dated: Dubai, New Delhi, Doha, Tel-Aviv and Bangkok (Newton Sixth Form).
- Listed as "TBA": Oslo, Frankfurt, Vienna, Munich, Vechta, Lisbon, Athens, Limassol, Istanbul, Toronto and Seoul.
- Registration deadlines are published only for the Prague sittings.

**Rijksoverheid, the Dutch government.** https://www.rijksoverheid.nl/onderwerpen/hoger-onderwijs/studiekeuze-en-toelating
- "Aanmelding tot en met 1 mei betekent ook recht op toelating."
- "Studenten die zich pas ná 1 mei voor het eerst aanmelden, kunnen door de opleiding geweigerd worden."
- That makes 1 May an equal-consideration date, so both 1 May cards now say so. Study in NL's how-to-apply page calls 1 May only a "general deadline".

**LSMU, admission process.** https://lsmu.lt/en/admission/admission-process/
- "6 July … Application deadline. The online application system will be closed on 6 July at 00:00."
- "7 July … Additional admission to selected programmes."
- "30 July … Application deadline."
- "Applications submitted after the deadline could be considered only in case of available study places in a certain degree programme."

## Consequence labels changed (35)

| Card | Old → new | Why |
|---|---|---|
| GB, country card and route `ms-oxbridge`: Oxford, Cambridge, medicine, dentistry and vet, 15 Oct 2026 | equal-consideration → **hard** (×2) | The note says "it is hard", and UCAS says late applications to these courses are unusual. Both notes are reworded. |
| GB, country card: final date for applications to be sent to universities, 30 Jun 2027 | hard → priority | After this date you go into Clearing, so the door does not close. It closes on 23 Sep, which stays hard. |
| NL, route `ms-regular`: 1 May 2027 | hard → equal-consideration | It now matches the country card and the government rule above. Both notes are reworded from the government page. |
| LT, country card and route: LSMU primary deadline, 6 Jul 2027 | hard → priority (×2) | An additional round for selected programmes opens the next day. |
| LT, country card and route: LSMU final deadline, 30 Jul 2027 | hard → equal-consideration (×2) | LSMU says late applications "could be considered only in case of available study places". |
| SI: have every document in by 10 July | hard → priority | The note says that if you miss it "you are not rejected": you move to the September list. |
| SI: Maribor, Primorska and Nova Gorica | hard → indicative | This is an explanation (they share the national periods), not a deadline. |
| IS, route `ms-others`: Bifröst, the Agricultural University and the University of the Arts | hard → indicative | It has no date, and "each sets its own date". |
| EE, route `ms-eamt` (Academy of Music and Theatre: 2027 dates) and `ms-others` | hard → indicative (×2) | Both are undated explanations. |
| Ten route cards: LV `ms-others`, LT `ms-others`, PL `ms-apply`, CZ `ms-submit-others`, HU `ms-apply`, AT `ms-entrance-procedure`, CH `ms-submit-others`, FR `ms-fr-other-schools`, BE-FWB `ms-be-fwb-apply` and LU `ms-lu-unilu-close` | hard → indicative (×10) | Each is an undated "set by each institution" or "set per programme" card. |
| Eight country cards: CZ Charles University English-taught programmes; HU central felvételi deadline (a route a Danish IB student does not use); BE KU Leuven bachelor deadlines; LU closing date set per programme (EU) and LU non-EU window; AT degrees with an entrance procedure; CH other Swiss universities; FR CVEC payment (no fixed date) | hard → indicative (×8) | All are undated explanations. The notes still state the stakes in words. |
| PL: University of Warsaw "admissions must conclude by 30 Sep 2027" and Jagiellonian "admissions must be closed by 1 Oct 2027" | hard → indicative (×2) | These are legal outer limits, not the closing date of any round, and the Jagiellonian note says the Rector may allow a further round. They now match the paired opening-bound cards. |
| IE, country card: IB free results requests and CAO access, 5 Jul 2027 | personal → indicative | The label "Not published by anyone" contradicted the IB's own published "before 5 July" rule. The label and note are rewritten: the card is the IB's cut-off, a fee step like the 20 January card, and it tells you to have it done by 4 July. |
| NL, Maastricht route `ms-maths-syllabus`: 1 Jun 2027 | personal → hard | The label "Not published by anyone" contradicted Maastricht's own "deadline for submitting a syllabus for the mathematics sufficiency check". The label and note are rewritten. |

**Other calendar-card fixes that are not label changes:**
- **IE route `ms-round1`:** the card dated 26 August 2027, 14:00 is now undated and marked `not-yet-announced`. That matches the country card and the Handbook's "(TBC)". The note gives 26 August 2026 as the previous year's date.
- **IE route `ms-submit`** (1 Feb, still hard): the note no longer says late applications "reopen". It now says 1 Feb is the last day for restricted courses, and that the 5 March–1 May late window takes other courses only.
- **LV country card, RSU February 2027 intake:** it now has `readerAccess: closed` (evidence `ev-rsu-when-apply-2027`), so it shows as "Not open to you" rather than as a hard deadline to act on. Its note also began with a broken fragment ("One is:"), which is fixed.
- **LT route `ms-lsmu-final`:** the note said "Late applications are considered only if places remain" on a hard card. The note and label now agree (see the table).
- **NL Maastricht `ms-dsai-eu`:** the note is reworded to say this is Maastricht's own deadline.
- **CZ country:** there is a new card for the London sitting (see section 2 below).

**Checked and left unchanged, because the label agrees with the note:**
- Every other `hard` card in the 20 countries, including the undated deadlines that are not announced yet (listed above).
- CH EPFL 10 July. It is hard for supporting documents, and the note explains that the diploma can come later, up to 30 September.
- CZ Palacký 31 July, the "outer boundary".
- The IE late window, 5 March to 1 May.
- SE first round, 15 January.
- Every `priority`, `rolling` and `equal-consideration` card.

## Every change (file, path: old → new)

### 1. Consequence labels

- `data/countries/gb.json` application.deadlines.11.consequence: "equal-consideration" → "hard"
- `data/countries/gb.json` application.deadlines.11.notes: "Equal consideration date for these courses. This is three months before everyone else and it is hard. Admissio…" → "UCAS’s deadline for these courses, three months before everyone else’s. UCAS says it is unusual for these univ…"
- `data/application-routes/gb-ucas-2027.json` milestones.2 (ms-oxbridge).consequence: "equal-consideration" → "hard"
- `data/application-routes/gb-ucas-2027.json` milestones.2 (ms-oxbridge).note: "Thirteen months before the course starts. Admissions tests for these courses register earlier still, and the r…" → "Thirteen months before the course starts. UCAS says it is unusual for these universities to consider a late ap…"
- `data/countries/gb.json` application.deadlines.21.consequence: "hard" → "priority"
- `data/countries/gb.json` application.deadlines.21.notes: "UCAS: \"Applications received by this deadline will be sent to universities and colleges.\" After this you go in…" → "UCAS: \"Applications received by this deadline will be sent to universities and colleges.\" Apply after it and y…"
- `data/countries/nl.json` application.deadlines.4.notes: "Studielink publishes it as \"until 23:59 on 1 May\". Nuffic warns the exact date varies by institution and progr…" → "Studielink closes at 23:59 on 1 May. The government’s rule is what makes it an equal-consideration date: apply…"
- `data/countries/nl.json` application.deadlines.4.sources: (none) → ["https://www.rijksoverheid.nl/onderwerpen/hoger-onderwijs/studiekeuze-en-toelating"]
- `data/application-routes/nl-studielink-2027.json` milestones.3 (ms-regular).consequence: "hard" → "equal-consideration"
- `data/application-routes/nl-studielink-2027.json` milestones.3 (ms-regular).note: "Applying by 1 May carries an entitlement to admission for a non-selective programme you are qualified for. App…" → "Apply by 1 May and you are entitled to admission to a non-selective programme you qualify for. The government …"
- `data/countries/si.json` application.deadlines.3.consequence: "hard" → "priority"
- `data/countries/si.json` application.deadlines.9.consequence: "hard" → "indicative"
- `data/application-routes/is-direct-2027.json` milestones.3 (ms-others).consequence: "hard" → "indicative"
- `data/application-routes/ee-direct-2027.json` milestones.2 (ms-eamt).consequence: "hard" → "indicative"
- `data/application-routes/ee-direct-2027.json` milestones.3 (ms-others).consequence: "hard" → "indicative"
- `data/application-routes/lv-direct-2027.json` milestones.8 (ms-others).consequence: "hard" → "indicative"
- `data/application-routes/lt-direct-2027.json` milestones.2 (ms-others).consequence: "hard" → "indicative"
- `data/application-routes/pl-direct-2027.json` milestones.0 (ms-apply).consequence: "hard" → "indicative"
- `data/application-routes/cz-direct-2027.json` milestones.3 (ms-submit-others).consequence: "hard" → "indicative"
- `data/countries/cz.json` application.deadlines.25.consequence: "hard" → "indicative"
- `data/application-routes/hu-direct-2027.json` milestones.0 (ms-apply).consequence: "hard" → "indicative"
- `data/countries/hu.json` application.deadlines.6.consequence: "hard" → "indicative"
- `data/countries/be.json` application.deadlines.8.consequence: "hard" → "indicative"
- `data/application-routes/be-fwb-direct-2027.json` milestones.0 (ms-be-fwb-apply).consequence: "hard" → "indicative"
- `data/countries/lu.json` application.deadlines.1.consequence: "hard" → "indicative"
- `data/countries/lu.json` application.deadlines.2.consequence: "hard" → "indicative"
- `data/application-routes/lu-direct-2027.json` milestones.1 (ms-lu-unilu-close).consequence: "hard" → "indicative"
- `data/countries/at.json` application.deadlines.6.consequence: "hard" → "indicative"
- `data/application-routes/at-direct-2027.json` milestones.0 (ms-entrance-procedure).consequence: "hard" → "indicative"
- `data/countries/ch.json` application.deadlines.9.consequence: "hard" → "indicative"
- `data/application-routes/ch-direct-2027.json` milestones.3 (ms-submit-others).consequence: "hard" → "indicative"
- `data/application-routes/fr-direct-2027.json` milestones.7 (ms-fr-other-schools).consequence: "hard" → "indicative"
- `data/application-routes/fr-direct-2027.json` milestones.7 (ms-fr-other-schools).note: "Not collected here. Check each school's admissions page." → "Each school runs its own rounds and dates. Check each school’s admissions page."
- `data/countries/fr.json` application.deadlines.14.consequence: "hard" → "indicative"
- `data/countries/lt.json` application.deadlines.5.consequence: "hard" → "priority"
- `data/application-routes/lt-direct-2027.json` milestones.3 (ms-lsmu-primary).consequence: "hard" → "priority"
- `data/application-routes/lt-direct-2027.json` milestones.3 (ms-lsmu-primary).note: "The system closes at 00:00, so in practice the night before." → "The system closes at 00:00, so in practice the night before. An additional round for selected programmes opens…"
- `data/countries/lt.json` application.deadlines.7.consequence: "hard" → "equal-consideration"
- `data/countries/lt.json` application.deadlines.7.notes: "The last published entrance test sits on the same calendar day at 10:00, after the application system has alre…" → "The last published entrance test sits on the same calendar day at 10:00, after the application system has alre…"
- `data/application-routes/lt-direct-2027.json` milestones.6 (ms-lsmu-final).consequence: "hard" → "equal-consideration"
- `data/application-routes/lt-direct-2027.json` milestones.6 (ms-lsmu-final).note: "Late applications are considered only if places remain." → "The last LSMU deadline, and the system again closes at 00:00. LSMU says an application after the deadline coul…"
- `data/countries/pl.json` application.deadlines.40.consequence: "hard" → "indicative"
- `data/countries/pl.json` application.deadlines.40.notes: "The closing half of the same sentence in Senate resolution 278: admissions last \"nie dłużej niż do dnia 30 wrz…" → "The closing half of the same sentence in Senate resolution 278: admissions last \"nie dłużej niż do dnia 30 wrz…"
- `data/countries/pl.json` application.deadlines.41.consequence: "hard" → "indicative"
- `data/application-routes/ie-cao-2027.json` milestones.2 (ms-submit).note: "Early by European standards. Late applications reopen in March at a higher fee and cannot be used for every co…" → "The last day to apply at the normal fee, and the last day to apply at all for restricted courses such as medic…"
- `data/application-routes/ie-cao-2027.json` milestones.6 (ms-round1).date: "2027-08-26" → (removed)
- `data/application-routes/ie-cao-2027.json` milestones.6 (ms-round1).timeOfDay: "14:00" → (removed)
- `data/application-routes/ie-cao-2027.json` milestones.6 (ms-round1).timeZone: "Europe/Dublin" → (removed)
- `data/application-routes/ie-cao-2027.json` milestones.6 (ms-round1).provisional: true → (removed)
- `data/application-routes/ie-cao-2027.json` milestones.6 (ms-round1).dateState: (none) → "not-yet-announced"
- `data/application-routes/ie-cao-2027.json` milestones.6 (ms-round1).note: "The 2026 date. The CAO Handbook 2027 lists Round One as \"(TBC)\": it follows Irish Leaving Certificate results …" → "Late August. The CAO Handbook 2027 lists Round One as \"(TBC)\"; in 2026 it was 26 August at 14:00. It follows t…"
- `data/countries/ie.json` application.deadlines.10.label: "Ask your IB coordinator to give the Central Applications Office access to your results" → "IB free results requests close - make sure CAO is on your coordinator’s list"
- `data/countries/ie.json` application.deadlines.10.consequence: "personal" → "indicative"
- `data/countries/ie.json` application.deadlines.10.notes: "CAO requires this and publishes no date for it. The CAO Handbook 2027 repeats it for this cycle: \"If you are a…" → "The IB’s cut-off: before 5 July your coordinator sends your results to up to six institutions free of charge; …"
- `data/application-routes/nl-maastricht-selection-2027.json` milestones.7 (ms-maths-syllabus).label: "Mathematics sufficiency syllabus, EU/EEA and Swiss applicants" → "Mathematics sufficiency check: syllabus deadline (only if Maastricht asks)"
- `data/application-routes/nl-maastricht-selection-2027.json` milestones.7 (ms-maths-syllabus).consequence: "personal" → "hard"
- `data/application-routes/nl-maastricht-selection-2027.json` milestones.7 (ms-maths-syllabus).note: "Only if Maastricht judges your mathematics short of the requirement. A deficiency here is a process rather tha…" → "Maastricht’s deadline for EU/EEA and Swiss applicants to submit a syllabus for the mathematics sufficiency che…"
- `data/application-routes/nl-maastricht-selection-2027.json` milestones.5 (ms-dsai-eu).note: "The ordinary national date, because this programme is not capped." → "Maastricht’s own deadline for the whole application, Studielink and MyApplication tasks included. The programm…"
- `data/countries/lv.json` application.deadlines.10.readerAccess: (none) → {"state":"closed","reason":"This intake starts in February 2027, before a May 2027 IB Diploma is awarded, so a May 2027 candidate cannot use it.","evidence":["ev-rsu-when-apply-2027"]}
- `data/countries/lv.json` application.deadlines.10.notes: "One is: RSU's \"when to apply\" page carries a February 2027 tab giving \"4 Sep – 1 Dec 2026\" for EU/EEA and visa…" → "RSU’s \"when to apply\" page has a February 2027 tab giving \"4 Sep – 1 Dec 2026\" for EU/EEA and visa-free applic…"

### 2. Czechia: overseas sittings

- `data/countries/cz.json` application.deadlines.17.notes: "The only overseas sitting on the faculty's 2027 list that carries a date rather than \"TBA\", run through the ag…" → "Run through the agency Medical Doorway, and with London (2 July 2027) the nearest dated sitting to Denmark - r…"
- `data/countries/cz.json` application.deadlines.21.notes: "The faculty lists roughly twenty overseas locations for 2027 and gives a date for almost none of them. Oslo, r…" → "The faculty lists about twenty overseas locations for 2027. The dated ones nearest Denmark are London (2 July …"
- `data/countries/cz.json` application.deadlines.17: (new entry) → "Charles 2nd Faculty of Medicine, entrance exam in London", 2027-07-02, indicative, source https://www.lf2.cuni.cz/en/applicants/how-to-apply/key-dates-and-deadlines
- `data/countries/cz.json` watchOuts.5: "No entrance exam venue anywhere inside Denmark was found. Charles 2nd Faculty lists Oslo through EduPlanet but…" → "None of these faculties lists an entrance-exam venue in Denmark. For Charles 2nd Faculty the nearest dated ove…"
- `data/countries/cz.json` application.steps.5: "an online sitting at Palacký or Hradec Králové, or Berlin." → "an online sitting at Palacký or Hradec Králové, or London (2 July) or Berlin (13 July 2027) for Charles 2nd Fa…"

### 3. Comparisons

- `data/countries/fr.json` whyConsider.0: "Public university tuition is €178 a year for a licence in 2026/27 — the lowest headline fee in Western Europe" → "Public university tuition is €178 a year for a licence in 2026/27"
- `data/destinations/fr.json` whyConsider.0: "Public university tuition is among the lowest in Western Europe." → "Public university tuition is €178 a year for a licence in 2026/27."
- `data/countries/nl.json` whyConsider.2: "Three-year research-university bachelor's, so you finish a year earlier than in most of Europe." → "Research-university bachelor's take three years, like Denmark's; universities of applied sciences take four."
- `data/countries/gb.json` whyConsider.2: "Everything is taught in English and three-year English/Welsh degrees are shorter than most of Europe" → "Everything is taught in English, and degrees in England and Wales take three years, like Denmark’s"
- `data/countries/fi.json` summary: "Finland is the one country on this list where your IB transcript is converted into a published, field-by-field…" → "Finland converts your IB transcript into points on published tables that differ by field of study, and admits …"
- `data/countries/nl.json` summary: "The Netherlands has been the default choice for Danish IB students for twenty years: hundreds of" → "The Netherlands is a common choice for Danish IB students: hundreds of"
- `data/destinations/nl.json` summary: "For twenty years the Netherlands has been the default answer for a Danish IB student who wanted an English-tau…" → "The Netherlands is a common choice for a Danish IB student who wants an English-taught degree in Europe: hundr…"
- `data/destinations/nl.json` tagline: "The most English-taught system in Europe, and the one changing fastest" → "Hundreds of English-taught degrees, and a system that is changing"
- `data/countries/nl.json` tagline: "The biggest English-taught offer in Europe, and it is shrinking" → "Hundreds of English-taught degrees, and the number is shrinking"
- `data/countries/nl.json` whyConsider.1: "More fully English-taught bachelor's degrees than anywhere else on the continent, across 13 research universit…" → "Hundreds of fully English-taught bachelor's degrees, across 13 research universities"
- `data/destinations/nl.json` whyConsider.0: "By far the widest English-taught bachelor provision in continental Europe, at both research universities and u…" → "Hundreds of English-taught bachelor’s degrees, at both research universities and universities of applied scien…"
- `data/countries/lt.json` summary: "Lithuania has more English-taught bachelor programmes than Latvia or Estonia and is unusual in that EU citizen…" → "Lithuania has a wide choice of English-taught bachelor programmes, and EU citizens"
- `data/destinations/gb.json` summary: "The UK is the one destination whose admissions process assumes from the outset that applicants do not yet have…" → "UK admissions are built around the fact that applicants do not yet have their results."
- `data/destinations/gb.json` whyConsider.0: "Conditional offers in IB points solve the July problem outright. Nowhere else in Europe is the process designe…" → "Conditional offers in IB points solve the July problem outright: the whole process is designed around results …"
- `data/countries/be.json` summary: "Tuition for an EU student is among the lowest in western Europe - 1,181.40 EUR for a full year in Flanders in …" → "Tuition for an EU student is low - 1,181.40 EUR for a full year in Flanders in 2026/27 -"
- `data/countries/be.json` whyConsider.1: "KU Leuven, Ghent and UCLouvain are among the oldest and most research-intensive universities in continental Eu…" → "KU Leuven, founded in 1425, is one of the oldest universities in Europe, and Ghent and UCLouvain are large res…"
- `data/countries/ee.json` whyConsider.2: "Living costs are among the lowest in the EU — dormitories from 150 to 350 euros a month," → "Living costs are modest — dormitories from 150 to 350 euros a month,"
- `data/countries/pl.json` whyConsider.4: "English-taught medicine at Gdansk is around 14,800 euros a year, among the cheapest six-year MD programmes in …" → "English-taught medicine at Gdansk is around 14,800 euros a year for a six-year MD."
- `data/destinations/hu.json` summary: "Hungary is where Scandinavians go to study medicine in English:" → "Hungary is a common choice for Scandinavians who want to study medicine in English:"
- `data/countries/cz.json` whyConsider.4: "and it accepts predicted grades, the only verified case in the country." → "and it accepts predicted grades, the only Czech faculty in this guide known to do so."
- `data/countries/cz.json` language.englishProof: "Varies more than anywhere else on this list." → "Varies widely."
- `data/countries/lu.json` application.deadlines.1.notes: "That is nine days after IB results are released, which makes Luxembourg one of the very few destinations where…" → "That is nine days after IB results are released, so an EU student could apply on actual results rather than pr…"
- `data/countries/pl.json` institutions.3.note: "The widest set of clearly priced English-taught engineering bachelor's found in Poland, running from" → "Clearly priced English-taught engineering bachelor's, running from"
- `data/countries/hu.json` application.deadlines.0.notes: "it is here because it is the Hungarian-founded university an IB student is most likely to meet, but you would …" → "it is listed here because it was founded in Budapest, but you would be living in Austria."
- `data/countries/hu.json` application.deadlines.5.notes: "it is here because it is the Hungarian-founded university an IB student is most likely to meet, but you would …" → "it is listed here because it was founded in Budapest, but you would be living in Austria."
- `data/countries/hu.json` application.deadlines.8.notes: "it is here because it is the Hungarian-founded university an IB student is most likely to meet, but you would …" → "it is listed here because it was founded in Budapest, but you would be living in Austria."
- `data/countries/hu.json` application.deadlines.14.notes: "it is here because it is the Hungarian-founded university an IB student is most likely to meet, but you would …" → "it is listed here because it was founded in Budapest, but you would be living in Austria."
- `data/countries/pl.json` institutions.8.note: "The cheapest verified English-taught MD in Poland at about 14,770 euros a year for 2026/27, and it publishes t…" → "An English-taught MD at about 14,770 euros a year for 2026/27, and it publishes a clear table of IB Higher Lev…"
- `data/countries/cz.json` institutions.5.note: "The cheapest verified English-taught bachelor's route in Czechia for an EU student — 500 euros a year" → "One of the cheapest English-taught bachelor's routes in this guide for an EU student — 500 euros a year"
- `data/countries/cz.json` institutions.5.note: "One of the cheapest English-taught bachelor's routes in this guide for an EU student — 500 euros a year" (the batch-2 wording of "The cheapest verified English-taught bachelor's route in Czechia…") → "An English-taught bachelor's route at 500 euros a year for an EU student"

### 4. Research-log wording

- `data/countries/de.json` application.deadlines.7.notes: "The hidden deadline in the German system, and it was not on this calendar at all. Published" → "The hidden deadline in the German system. Published"
- `data/countries/ee.json` language.notes.2: "Tallinn University's TOEFL minimum could not be read reliably — the figure extracted from its page was corrupt…" → "Tallinn University's TOEFL minimum is not given here; check it on its admissions page if you need the TOEFL ro…"
- `data/countries/fi.json` ibRecognition.notes.5: "The Administrative and Social Sciences table and the Education table were not read. " → "The Administrative and Social Sciences and Education tables are not covered here; check them on Studyinfo. "
- `data/countries/lv.json` institutions.8.note: "It offers no English-taught bachelor's degree that we could find: its English pages (read 23 September 2026) d…" → "Its English pages (September 2026) describe exchange study and a joint master's in Service Design and Innovati…"
- `data/countries/lt.json` funding.1: "details were not verified on the pages read." → "details are not confirmed here; check with each university."
- `data/application-routes/nl-studielink-2027.json` milestones.2.note: "Carried from the promotion agency rather than the government page, so treat the exact date as indicative." → "Indicative: Nuffic’s date, not the government’s."
- `data/application-routes/nl-studielink-2027.json` milestones.4.note: "How each institution handles a conditional place pending results is set per institution and is not yet establi…" → "How a conditional place pending results is handled is set by each institution; ask yours."
- `data/countries/nl.json` application.deadlines.3.notes: "There is genuinely no date to publish here, and that is the finding rather than a gap: the deadline is two wee…" → "The deadline is two weeks from your own offer, not a day in the calendar."
- `data/countries/lv.json` sources.22.title: "are taken from the English Wikipedia article linked in each institution's wikipedia field, not from a fetched …" → "are from Wikipedia."
- `data/countries/lt.json` sources.14.title: "are taken from the English Wikipedia article linked in each institution's wikipedia field, not from a fetched …" → "are from Wikipedia."
- `data/countries/si.json` sources.17.title: "are taken from the English Wikipedia article linked in each institution's wikipedia field, not from a fetched …" → "are from Wikipedia."
- `data/countries/gb.json` sources.20.title: "Founding years for each institution are taken from the English Wikipedia article linked in that institution's …" → "Founding years are from Wikipedia."
- `data/countries/be.json` ibRecognition.gradeConversion: "No published IB-to-Belgian grade conversion was found on an official source during this research." → "No official IB-to-Belgian grade conversion is published."
- `data/countries/be.json` language.englishTaughtBachelors: "No official count of English-taught bachelor programmes was verified during this research." → "No official count of English-taught bachelor programmes is confirmed here."
- `data/countries/be.json` costs.applicationFee: "No single national figure was verified during this research." → "No single national figure is confirmed here; check with the university."
- `data/countries/be.json` application.deadlines.10.notes: "and it is not verified here." → "and it is not confirmed here."
- `data/countries/be.json` workRights: "that limit was not re-verified here." → "check that limit with the university."
- `data/countries/lu.json` ibRecognition.subjectLevelRule: "No published IB-specific rule was found on an official page during this research." → "No IB-specific rule is published."
- `data/countries/lu.json` ibRecognition.gradeConversion: "No official IB-to-Luxembourgish conversion was found during this research." → "No official IB-to-Luxembourgish conversion is published."
- `data/countries/lu.json` language.englishTaughtBachelors: "No verified count of fully English-taught bachelor programmes was found during this research." → "No count of fully English-taught bachelor programmes is confirmed here."
- `data/countries/lu.json` funding.1: "were not verified during this research, so check them at guichet.public.lu" → "are not confirmed here, so check them at guichet.public.lu"
- `data/countries/lu.json` application.steps.1: "and note that the criteria for 2027-2028 were under review when this was written." → "and note that the university says its 2027-2028 criteria are under review."
- `data/countries/lu.json` application.deadlines.1.notes: "the Bachelor en Medecine was reported to close for EU applicants on 8 July 2026, two days after results, but t…" → "a date of 8 July 2026 circulates for the Bachelor en Medecine, but it is not on the university's own page, so …"
- `data/countries/lu.json` costs.notes.1: "The amount was not confirmed on a current page: the university's 2022 news item is titled "Uni.lu introduces a…" → "The current amount is not confirmed here: the university's 2022 news item is titled "Uni.lu introduces a 50 EU…"
- `data/countries/at.json` ibRecognition.notes.3: "this research could not verify the current Latin/Biology/Maths supplementary rules from an official page." → "the current Latin/Biology/Maths supplementary rules are not confirmed here."
- `data/countries/at.json` language.englishProof: "requirements are set per institution and were not verified centrally in this research." → "requirements are set per institution and are not confirmed here; check with the university."
- `data/countries/at.json` institutions.12.note: "fees were not verified from an official page in this research." → "fees are not confirmed here; check with the university."
- `data/countries/ch.json` costs.tuitionNonEu.value: "Fees at other Swiss universities were not verified in this research." → "Fees at other Swiss universities are not confirmed here; check with each university."
- `data/countries/ch.json` institutions.10.note: "and could not be verified here." → "and is not confirmed here."
- `data/countries/ch.json` institutions.11.note: "and fees were not verified here." → "and fees are not confirmed here."
- `data/countries/fr.json` watchOuts.3: "requirements vary by institution and were not verified during research" → "requirements vary by institution, so check with the university"
- `data/countries/fr.json` language.englishTaughtBachelors: "No official national count was found during research." → "No official national count is published."
- `data/countries/fr.json` language.englishProof: "Whether IB English A or B is accepted in place of a test was not verified for each institution." → "Whether IB English A or B is accepted in place of a test is not confirmed here; check with each institution."
- `data/countries/fr.json` language.notes.1: "The exact level varies by institution and was not verified during research." → "The exact level varies by institution; check with the university."
- `data/countries/fr.json` costs.notes.1: "Figures beyond the €0–€14,900 range were not verified on an official page." → "Figures beyond the €0–€14,900 range are not confirmed here."
- `data/countries/fr.json` funding.3: "eligibility for EU nationals depends on residence conditions not verified during research." → "eligibility for EU nationals depends on residence conditions not confirmed here; check with CROUS."
- `data/countries/fr.json` institutions.6.note: "tuition figures could not be read from the official page during research." → "tuition figures are not confirmed here; check with the college."
- `data/countries/fr.json` institutions.10.note: "Checked 2026-09-23: the university's English site has gone. www.univ-grenoble-alpes.fr/english/ is dead and it…" → "UGA's main site is in French; its English pages for prospective international students are at international.un…"
- `data/countries/fr.json` institutions.11.note: "Checked 2026-09-23: Unistra has no English site. Both unistra.fr and the en.unistra.fr host serve the French p…" → "Unistra's main site is in French; its English guidance for applicants from abroad is at international-welcome.…"
- `data/countries/de.json` language.englishProof: "Exact requirement not verified centrally - check each programme page." → "The exact requirement is set per programme - check each programme page."
- `data/countries/gb.json` language.englishProof: "Exact accepted grades vary by university and were not verified on a single national source; check each course …" → "Exact accepted grades vary by university; check each course page."
- `data/countries/gb.json` funding.1: "amounts and deadlines are set per university and were not verified from a single national source." → "amounts and deadlines are set per university, so check each one."
- `data/countries/gb.json` funding.2: "This is the single most important thing to check with your studievejleder, and it was not verified from a UK s…" → "This is the single most important thing to check with your studievejleder."
- `data/countries/is.json` workRights: "and the weekly hour limit could not be verified on any official page." → "and the weekly hour limit is not confirmed here."
- `data/countries/fi.json` institutions.1.note: "Aalto's programme-level IB thresholds could not be read." → "Aalto's programme-level IB thresholds are not given here; check each programme page."
- `data/countries/fi.json` institutions.8.englishBachelors: "UEF's own pages could not be read, so the full list is unconfirmed." → "The full list is not confirmed here; check UEF's own pages."
- `data/countries/fi.json` application.deadlines.9.notes: "and its 2027 date had not been published when this was checked." → "and its 2027 date had not been published by September 2026."
- `data/countries/lv.json` ibRecognition.subjectLevelRule: "the exact IB subject and grade rules were not published on the pages read on 2026-09-22." → "the exact IB subject and grade rules are not published; ask the programme."
- `data/countries/lv.json` ibRecognition.gradeConversion: "No public IB-to-Latvian grade conversion table was found on the pages read." → "No IB-to-Latvian grade conversion table is published."
- `data/countries/lv.json` application.selectionNotes: "but whether an EU citizen from Denmark can compete for them was not confirmed on the pages read on 2026-09-22." → "but whether an EU citizen from Denmark can compete for them is not confirmed here; ask the university."
- `data/countries/lv.json` language.englishTaughtBachelors: "An exact national count was not published on the pages read." → "No exact national count is published."
- `data/countries/lv.json` language.englishProof: "Whether IB English A or B is accepted in place of a test was not confirmed on the pages read - ask the program…" → "Whether IB English A or B is accepted in place of a test is not confirmed here - ask the programme directly."
- `data/countries/lv.json` funding.1: "eligibility for a Danish citizen was not confirmed on the pages read." → "eligibility for a Danish citizen is not confirmed here; ask SSE Riga."
- `data/countries/lv.json` funding.2: "Check this with your studievejleder - it was not verified from a Latvian source." → "Check this with your studievejleder."
- `data/countries/lv.json` institutions.0.englishBachelors: "an exact count was not published on the pages read" → "no exact count is published"
- `data/countries/lv.json` institutions.9.englishBachelors: "English-taught bachelor options not verified" → "English-taught bachelor options not confirmed here"
- `data/countries/lv.json` institutions.5.note: "Checked 2026-09-23: it changed its name on 1 September 2026 and is now the UL FinTech Business School. It was …" → "On 1 September 2026 it changed its name to the UL FinTech Business School; it was already part of the Universi…"
- `data/countries/lv.json` application.deadlines.1.notes: "It is not a 22-month window; it is one intake's cell with the previous intake's opening date left in it. Three…" → "RSU's table prints the opening as "1 Sep 2025", which is the previous intake's date: the master's row for the …"
- `data/countries/lv.json` application.deadlines.2.notes: "and RSU had not restated it for 2027 when this was read on 23 September 2026, so confirm it" → "and RSU had not restated it for 2027 by 23 September 2026, so confirm it"
- `data/application-routes/lv-direct-2027.json` milestones.7.note: "The one window found that stays open after IB results." → "The only window here that stays open after IB results."
- `data/countries/lt.json` watchOuts.4: "was not published in English on the pages read - ask the university how your IB grades will be scored" → "is not published in English - ask the university how your IB grades will be scored"
- `data/countries/lt.json` ibRecognition.gradeConversion: "No public IB-to-Lithuanian ten-point conversion table was found on the pages read on 2026-09-22." → "No IB-to-Lithuanian ten-point conversion table is published."
- `data/countries/lt.json` application.selectionNotes: "was not published in English on the pages read on 2026-09-22." → "is not published in English; ask the university."
- `data/countries/lt.json` language.englishTaughtBachelors: "A national total was not published on the pages read." → "No national total is published."
- `data/countries/lt.json` costs.notes.0: "no national figure was published on the official pages read." → "no national figure is published."
- `data/countries/lt.json` residency: "The precise EU registration procedure was not confirmed on the pages read on 2026-09-22." → "The precise EU registration procedure is not confirmed here; ask your university's international office."
- `data/countries/lt.json` housing: "Specific dormitory application deadlines were not published on the pages read." → "Dormitory application deadlines are set by each university."
- `data/countries/lt.json` healthcare: "Detailed requirements were not published on the pages read." → "Detailed requirements are not confirmed here; ask your university."
- `data/countries/lt.json` institutions.1.englishBachelors: "the English-taught bachelor count was not published on the pages read" → "no English-taught bachelor count is published"
- `data/countries/lt.json` institutions.4.englishBachelors: "count not verified" → "count not confirmed here"
- `data/countries/lt.json` institutions.5.englishBachelors: "count not verified" → "count not confirmed here"
- `data/countries/lt.json` institutions.6.englishBachelors: "count not verified" → "count not confirmed here"
- `data/countries/lt.json` institutions.7.englishBachelors: "count not verified" → "count not confirmed here"
- `data/countries/lt.json` institutions.11.englishBachelors: "count not verified" → "count not confirmed here"
- `data/countries/lt.json` institutions.9.englishBachelors: "English-taught bachelor options not verified" → "English-taught bachelor options not confirmed here"
- `data/countries/lt.json` institutions.10.englishBachelors: "English-taught bachelor options not verified" → "English-taught bachelor options not confirmed here"
- `data/countries/lt.json` application.deadlines.11.notes: "so beyond the three universities dated in this calendar you have to ask each institution." → "so beyond the three universities dated on this page you have to ask each institution."
- `data/countries/lt.json` institutions.10.note: "Checked 2026-09-23: LMTA has rebuilt its site in Lithuanian only. The English pages were not carried across an…" → "LMTA's main site is in Lithuanian; its English pages are at old.lmta.lt, which is where the admissions link po…"
- `data/countries/pl.json` application.deadlines.25.notes: "and it has its own entry in this calendar." → "and it has its own entry."
- `data/countries/pl.json` application.deadlines.37.notes: "The only fully published autumn-2027 application deadline found in Poland, and it is stated identically on two…" → "One of the few autumn-2027 application deadlines in Poland published in full, and it is stated identically on …"
- `data/countries/pl.json` application.deadlines.7.notes: "; the model can carry a time on a start date but not on an end date, so the time is recorded in this sentence …" → "."
- `data/countries/pl.json` application.deadlines.44.notes: "The rules exist and carry two real 2027 dates, now recorded as separate entries;" → "The rules exist and carry two real 2027 dates, shown as separate entries;"
- `data/countries/pl.json` application.deadlines.45.notes: "The 2026 dates are recorded as entries of their own above rather than left as a sentence here." → "The 2026 dates are shown above as a guide."
- `data/countries/pl.json` language.englishTaughtBachelors: "A reliable national total could not be verified." → "No reliable national total is published."
- `data/countries/pl.json` funding.4: "but their eligibility rules could not be read." → "but their eligibility rules are not confirmed here."
- `data/countries/pl.json` workRights: "and whether any hour limits apply to students, could not be verified." → "and whether any hour limits apply to students, is not confirmed here."
- `data/countries/pl.json` residency: "The detailed procedure, forms and processing time could not be verified." → "The detailed procedure, forms and processing time are not confirmed here; ask the voivodeship office."
- `data/countries/pl.json` healthcare: "The NFZ premium and enrolment route for an EU student could not be verified." → "The NFZ premium and enrolment route for an EU student are not confirmed here; ask your university."
- `data/countries/pl.json` institutions.4.note: "- its programme list, fees and deadlines could not be verified." → "- its programme list, fees and deadlines are not confirmed here."
- `data/countries/pl.json` institutions.5.englishBachelors: "Fees not verified" → "Fees not confirmed here"
- `data/countries/pl.json` institutions.10.englishBachelors: "Fees not verified" → "Fees not confirmed here"
- `data/countries/pl.json` institutions.11.englishBachelors: "Fees not verified" → "Fees not confirmed here"
- `data/countries/pl.json` institutions.12.englishBachelors: "Fees not verified" → "Fees not confirmed here"
- `data/countries/pl.json` institutions.9.englishBachelors: "Fees and deadlines sit on separate recruitment sites that were not read" → "Fees and deadlines are on separate recruitment sites; check them there"
- `data/countries/cz.json` watchOuts.1: "Most 2027 deadlines had not been published when this was researched." → "Most 2027 deadlines are not published yet."
- `data/countries/cz.json` application.deadlines.2.notes: "and it is now an entry of its own here." → "and it has its own entry."
- `data/countries/cz.json` application.deadlines.13.notes: "The window here spans the published month because the model holds days, not months; no individual day exists t…" → "No individual day is published, so the whole month is shown."
- `data/countries/cz.json` application.deadlines.0.notes: "The page's own summary table and its per-faculty detail sections disagree in places, the table dropping the op…" → "Where the page's summary table and its per-faculty sections disagree, go by the faculty section, which gives t…"
- `data/countries/cz.json` application.deadlines.3.notes: "The page's own summary table and its per-faculty detail sections disagree in places, the table dropping the op…" → "Where the page's summary table and its per-faculty sections disagree, go by the faculty section, which gives t…"
- `data/countries/cz.json` application.deadlines.4.notes: "The page's own summary table and its per-faculty detail sections disagree in places, the table dropping the op…" → "Where the page's summary table and its per-faculty sections disagree, go by the faculty section, which gives t…"
- `data/countries/cz.json` application.deadlines.7.notes: "The page's own summary table and its per-faculty detail sections disagree in places, the table dropping the op…" → "Where the page's summary table and its per-faculty sections disagree, go by the faculty section, which gives t…"
- `data/countries/cz.json` application.deadlines.8.notes: "The page's own summary table and its per-faculty detail sections disagree in places, the table dropping the op…" → "Where the page's summary table and its per-faculty sections disagree, go by the faculty section, which gives t…"
- `data/countries/cz.json` application.deadlines.9.notes: "The page's own summary table and its per-faculty detail sections disagree in places, the table dropping the op…" → "Where the page's summary table and its per-faculty sections disagree, go by the faculty section, which gives t…"
- `data/countries/cz.json` application.deadlines.10.notes: "The page's own summary table and its per-faculty detail sections disagree in places, the table dropping the op…" → "Where the page's summary table and its per-faculty sections disagree, go by the faculty section, which gives t…"
- `data/countries/cz.json` application.deadlines.11.notes: "The page's own summary table and its per-faculty detail sections disagree in places, the table dropping the op…" → "Where the page's summary table and its per-faculty sections disagree, go by the faculty section, which gives t…"
- `data/countries/cz.json` application.deadlines.5.notes: "The opening day has been 1 November in the cycle read," → "The opening day was 1 November in the 2026 cycle,"
- `data/countries/cz.json` application.deadlines.1.notes: "which is why it is not the source here." → "so go by the faculty table rather than the banner."
- `data/countries/cz.json` application.deadlines.20.notes: "the two disagree and the later page is the one used here, but confirm" → "the two disagree; go by the later page, but confirm"
- `data/countries/cz.json` funding.4: "Whether Denmark or any EU state qualifies could not be verified." → "Whether Denmark or any EU state qualifies is not confirmed here."
- `data/countries/cz.json` residency: "Whether an EU student should also obtain the optional certificate of temporary residence could not be verified…" → "Whether an EU student should also obtain the optional certificate of temporary residence is not confirmed here…"
- `data/countries/cz.json` healthcare: "is not addressed on the official pages and could not be verified." → "is not addressed on the official pages; ask your university."
- `data/countries/hu.json` application.deadlines.6.notes: "Recorded here so the difference is visible rather than assumed. " → "(deleted)"
- `data/countries/hu.json` application.deadlines.6.notes: "while the English-taught programmes in this calendar are applied for directly" → "while the English-taught programmes on this page are applied for directly"
- `data/countries/hu.json` application.deadlines.10.notes: "for the 2027/28 cycle when this was read on 23 September 2026, so no closing date is recorded." → "for the 2027/28 cycle by 23 September 2026, so no closing date is given."
- `data/countries/hu.json` ibRecognition.notes.7: "and the minimum score for medicine could not be verified." → "and the minimum score for medicine are not confirmed here; ask the university."
- `data/countries/hu.json` language.englishTaughtBachelors: "Budapest Metropolitan and Széchenyi István could not be verified." → "Budapest Metropolitan and Széchenyi István are not confirmed here."
- `data/countries/hu.json` language.notes.0: "Whether an EU citizen is legally eligible could not be verified, and" → "Whether an EU citizen is legally eligible is not confirmed here, and"
- `data/countries/hu.json` funding.4: "and the amounts could not be verified." → "and the amounts are not confirmed here."
- `data/countries/hu.json` housing: "Whether international fee-paying students can actually get dormitory places could not be verified, and no univ…" → "Whether international fee-paying students can actually get dormitory places is not confirmed here, and neither…"
- `data/countries/hu.json` healthcare: "alongside the EHIC could not be verified — the official healthcare page does not mention it at all." → "alongside the EHIC is not confirmed here — the official healthcare page does not mention it; ask your universi…"
- `data/countries/hu.json` institutions.1.englishBachelors: "Dentistry and pharmacy fees sit with separate faculties and could not be verified." → "Dentistry and pharmacy fees are set by separate faculties and are not confirmed here."
- `data/countries/hu.json` institutions.2.note: "and its exam dates and venues could not be read." → "and its exam dates and venues are not confirmed here."
- `data/countries/hu.json` institutions.6.note: "Its tuition could not be verified; only the 500-euro registration fee is confirmed." → "Its tuition is not confirmed here; the 500-euro registration fee is."
- `data/countries/hu.json` institutions.7.note: "fees and 2027 deadlines were not verified." → "fees and 2027 deadlines are not confirmed here."
- `data/countries/hu.json` institutions.8.note: "Fees and 2027 deadlines could not be verified." → "Fees and 2027 deadlines are not confirmed here."
- `data/countries/hu.json` institutions.9.englishBachelors: "The full programme list is rendered in a way that could not be read" → "Check the university's own site for the full programme list"
- `data/countries/hu.json` institutions.10.note: "Whether any bachelor's programme is taught in English could not be verified." → "Whether any bachelor's programme is taught in English is not confirmed here."
- `data/countries/hu.json` institutions.11.note: "Whether it offers English-taught bachelor's degrees could not be verified." → "Whether it offers English-taught bachelor's degrees is not confirmed here."
- `data/countries/hu.json` institutions.12.note: "Its exact English-taught bachelor count and fees could not be verified." → "Its exact English-taught bachelor count and fees are not confirmed here."
- `data/countries/hu.json` institutions.13.note: "Its English-taught provision and fees could not be verified." → "Its English-taught provision and fees are not confirmed here."
- `data/countries/no.json` application.deadlines.6.notes: "The opening of the round on 1 February is now its own entry." → "The round opens on 1 February, which has its own entry."
- `data/countries/no.json` application.deadlines.5.notes: "It covers Academic Esports and English; the two music performance degrees close earlier, on 15 December (next …" → "It covers Academic Esports and English; the two music performance degrees close earlier, on 15 December (their…"
- `data/countries/no.json` application.deadlines.7.notes: "Split out of the old "EU/EEA applicants (typical)" entry, where Nord's 15 April sat six weeks behind a headlin…" → "Published"
- `data/countries/no.json` application.deadlines.7.notes: "Note that the programme pages themselves do not carry these dates; they are on Nord's central admission page, …" → "The dates are on Nord's central admission page, not on the programme pages."
- `data/countries/ee.json` application.steps.3: "Tallinn University closes 1 March 2027; the others had not published 2027 dates when this was researched." → "Tallinn University closes 1 March 2027; the others had not published 2027 dates by September 2026."
- `data/countries/ee.json` institutions.6.note: "Checked 2026-09-23: the academy has moved from eava.ee to lennuakadeemia.ee, its Estonian name; the old domain…" → "Its website is now lennuakadeemia.ee, its Estonian name, rather than eava.ee."
- `data/countries/be.json` application.deadlines.0.notes: "The exam pages moved during 2026: toelatingsexamenartstandarts.be now redirects to vlaanderen.be/toelatingsexa…" → "The exam pages are now at vlaanderen.be/toelatingsexamens."
- `data/countries/be.json` application.deadlines.1.notes: "The exam pages moved during 2026: toelatingsexamenartstandarts.be now redirects to vlaanderen.be/toelatingsexa…" → "The exam pages are now at vlaanderen.be/toelatingsexamens."
- `data/countries/be.json` application.deadlines.2.notes: "The exam pages moved during 2026: toelatingsexamenartstandarts.be now redirects to vlaanderen.be/toelatingsexa…" → "The exam pages are now at vlaanderen.be/toelatingsexamens."
- `data/countries/be.json` application.deadlines.3.notes: "The exam pages moved during 2026: toelatingsexamenartstandarts.be now redirects to vlaanderen.be/toelatingsexa…" → "The exam pages are now at vlaanderen.be/toelatingsexamens."
- `data/countries/be.json` application.deadlines.4.notes: "The exam pages moved during 2026: toelatingsexamenartstandarts.be now redirects to vlaanderen.be/toelatingsexa…" → "The exam pages are now at vlaanderen.be/toelatingsexamens."
- `data/countries/be.json` application.deadlines.1.notes: "the first genuine 2027 date Belgium has put on the record." → "one of the first 2027 dates Belgium has published."
- `data/countries/be.json` application.deadlines.5.notes: "Checked on the official site and genuinely not published:" → "Not yet published:"
- `data/countries/be.json` application.deadlines.5.notes: "those dates are now separate entries so that the pattern is visible on the calendar." → "those 2026 dates are shown as separate entries, as a guide."
- `data/countries/be.json` application.deadlines.8.notes: "That page carries no dates at all: it is an interactive tool that renders its answers in JavaScript, and neith…" → "KU Leuven publishes its deadlines only through an interactive tool on its application pages (www.kuleuven.be/e…"
- `data/countries/be.json` application.deadlines.8.notes: "Look your own programme up rather than working to a university-wide date, and note the site moved: the old /en…" → "Look your own programme up rather than working to a university-wide date."
- `data/countries/be.json` watchOuts.5: "Two of the pages that matter most in Belgium cannot be read without a browser. The Flemish entrance-examinatio…" → "Two of the pages that matter most in Belgium are interactive: the Flemish entrance-examination pages, now at v…"
- `data/countries/be.json` institutions.7.note: "Checked 2026-09-23: ULiège's English home page has been withdrawn and now redirects to the French one, so the …" → "ULiège's main site is in French; its English enrolment page is the admissions link here."
- `data/countries/be.json` institutions.9.note: "Checked 2026-09-23: it has not existed under its own name since February 2021, when it merged" → "It has not existed under its own name since February 2021, when it merged"
- `data/countries/be.json` institutions.9.note: " vesalius.edu now redirects to a one-paragraph notice of that merger, and the degrees are taught, awarded and …" → " The degrees are taught, awarded and advertised as Brussels School of Governance BA programmes."
- `data/countries/si.json` institutions.5.note: "Checked 2026-09-23: GEA has withdrawn its English site. gea-college.si/en/ now redirects to the Slovenian home…" → "GEA's site is in Slovenian; its only substantial English page is the incoming-students page linked here, which…"
- `data/countries/fi.json` watchOuts.3: "No English-taught Finnish medicine bachelor's could be verified," → "No English-taught Finnish medicine bachelor's is confirmed here,"
- `data/countries/ee.json` costs.applicationFee: "No other institution's fee could be verified." → "Other institutions' fees are not confirmed here; check each one."
- `data/countries/ee.json` funding.2: "eligibility is limited to a list of countries whose contents could not be checked. Denmark's inclusion is unco…" → "eligibility is limited to a list of countries. Whether Denmark is on it is not confirmed here."
- `data/countries/ee.json` funding.5: "The University of Tartu reportedly offers tuition reductions" → "The University of Tartu is described as offering tuition reductions"
- `data/countries/ee.json` funding.5: "This comes from summary text only, because Tartu's site could not be loaded." → "This is not confirmed on Tartu's own pages here, so check it with Tartu."
- `data/countries/ee.json` funding.6: "could not be checked at all — whether a Danish citizen" → "are not confirmed here — whether a Danish citizen"
- `data/countries/pl.json` funding.6: "but no source was found stating that outright." → "but no source states it outright."
- `data/countries/pl.json` housing: "University of Warsaw dormitory rates could not be verified." → "University of Warsaw dormitory rates are not confirmed here."
- `data/countries/hu.json` ibRecognition.notes.3: "Szeged is the only medical school with a verified IB exemption:" → "Szeged is the only medical school here with a published IB exemption:"
- `data/countries/hu.json` language.notes.1: "No evidence was found that state-funded places exist on English-taught programmes at all." → "No official source says state-funded places exist on English-taught programmes at all."
- `data/countries/at.json` ibRecognition.minimumPoints: "no separate Austrian points threshold above the IB's own pass standard (24 points and the IB's pass conditions…" → "no separate Austrian points threshold above the IB's own pass standard (24 points and the IB's pass conditions…"
- `data/countries/at.json` ibRecognition.notes.2: "No official IB-points-to-Austrian-grade conversion table was found." → "No official IB-points-to-Austrian-grade conversion table is published."
- `data/countries/ch.json` ibRecognition.notes.4: "No official conversion of IB points into Swiss grades (1-6) was found published." → "No official conversion of IB points into Swiss grades (1-6) is published."
- `data/countries/fr.json` ibRecognition.gradeConversion: "No national IB-to-French conversion was found." → "No national IB-to-French conversion is published."
- `data/countries/si.json` application.selectionNotes: "The exact points formula, and how IB grades are converted into it, was not found on any page read on 2026-09-2…" → "The exact points formula, and how IB grades are converted into it, is set out in each faculty’s razpis for the…"
- `data/countries/si.json` costs.applicationFee: "No application fee for eVS was found." → "No application fee for eVS is published."
- `data/countries/si.json` funding.2: "No general merit scholarship aimed at EU bachelor applicants was found -" → "There is no general merit scholarship aimed at EU bachelor applicants -"
