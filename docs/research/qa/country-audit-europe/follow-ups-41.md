# Country audit (Europe): follow-ups from round 5 (issue #41)

> **Rounds 2 to 5** (at the end) answer the four critiques (`follow-ups-41-critique-round-1.md` to `-round-4.md`). Each widens the guards; the latest round supersedes earlier descriptions of the guards and the allow-lists.

Editor pass, 2026-09-26, answering the follow-up issue in `round-5.md`. This pass was done offline: no page was fetched, and every rewrite uses only facts already in the same record (founding year, counts, fees, what the institution teaches). Nothing new is asserted.

Scope is wider than the audit's 20 countries. Round 5 asked for the class to be fixed, not the sentences it listed. So the guard reads every Destination, and every hit on every Destination was fixed.

## What was done

1. **Unsourced rankings.** 122 ranking phrases were rewritten, in institution notes, taglines and summaries, for all destinations. The rewrites are listed below. This includes the ones round 5 named:
   - DE: "most fully international";
   - NL: "strongest engineering school" and "most international university";
   - LT: "most liberal-arts-like";
   - HU: "best IB-specific deal";
   - CH: "world's best-known hospitality school";
   - GB: the headline "best-known route out of the IB";
   - EE: "single best-value option" and "by far the most transparent";
   - SI: "one of the best-value places in Europe", in both the country profile and the Destination record.

   Three rankings stay, because the record cites a source for each. They are listed in the guard's allow-list, with that source.
2. **Research-log wording.** 49 student-facing strings were rewritten to say what the fact means for the student. Examples:
   - "No page read on 2026-09-22 stated…" became "…are not published yet (as of September 2026)".
   - "could not be confirmed on any official source" became "Treat that as unconfirmed until an official page says so, and go by the fee on your own programme's page".

   The Evidence records are not rendered, so their `interpretation`, `excerpt` and `retrievedAt` fields are unchanged. `meta.notes` is also unchanged.
3. **LSMU 6 July card: not changed.** The reason is in its own section below.
4. **Two new guards**, both wired into `scripts/lib/quality-gate.mjs`:
   - `superlatives` runs in the data stage.
   - `research-log` runs in the built stage.

## Gate

`SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs`: **all 37 checks pass**, 35 before this pass plus the two new guards. As before, the advisory `freshness` check reports the age of the evidence.

## The guards

### `scripts/test-superlatives.mjs` (stage `data`, id `superlatives`)

**What it reads.** These are the strings a student meets first, before any disclosure:
- `data/countries/*.json`: `tagline`, `summary` and `institutions[].note`;
- `data/destinations/*.json`: `tagline` and `summary`;
- `data/institutions/*.json` and `data/dk/*.json`: `about`. `data/dk` is the input that `migrate:dk` copies, so it is edited in step with `data/institutions`.
- `data/schools/*.json`: `summary`. Once a school has been researched, this replaces the profile note on the card. It has 0 hits now, and this pass did not edit any `data/schools` file.

**What it flags.** It flags two shapes:
- words that are always a ranking: "by far", "best-known", "best-value", "world-class", "world-leading";
- a superlative inside a comparison frame. The frame is "the", "one of the", "among the", or a possessive that names the field, such as "Germany's", "the world's" or "the Netherlands'". The superlatives are: best, strongest, cheapest, widest, largest, biggest, oldest (also "second-oldest"), leading, top, "most <adjective>", and only.

**What it deliberately does not flag.** The full reasoning is in the header of the guard.
- "most" used as a quantifier, as in "most bachelor's are three years".
- "only" used as an adverb, as in "taught only in German".
- A scope statement about the institution's own offer, written with its possessive: "Its only English door is Classical Ballet". The one card written as "The only English door…" was changed to "Its only…". A student reads both the same way. But no rule short of a parser can tell "the only English door" apart from "the only conservatoire in Czechia". So the convention is the rule.
- "the most recent".

**Oldest and largest.** These are measurable, but no record carried a source for them. The usual fix is the founding year that is already in the record, for example "Founded in 1365".

**Attributed claims are not a source.** Examples are "It calls itself…" and "Describes itself as…". Repeating marketing is still the site making the claim. So these were rewritten too: Twente, Maribor, Turiba, Thomas More, Tallinn University's film school.

**Tests.** The guard has fixtures for both sides: rankings it must catch, and quantifiers, adverbs and scope statements it must leave alone. It fails if an allow-list entry no longer matches anything, or has no source URL.

**Allow-list** (the `ALLOW` constant in the guard):

| File | Claim kept | Source already in the record |
|---|---|---|
| `data/countries/ee.json` (Tallinn University) | "The widest choice of English-taught bachelor's degrees in Estonia: six of the 27 on the national list" | `ev-ee-sie-bachelors-list`, the Study in Estonia national list (https://www.studyinestonia.ee/study/programmes/bachelors-programmes). Its claim: "Tallinn University has the most (six)". |
| `data/countries/lu.json` (University of Luxembourg) | "The country's only public university" | `ev-lu-mengstudien-sector` (https://mengstudien.public.lu/en/etudier-luxembourg.html). Its excerpt: "The University of Luxembourg is the only public university in the country". |
| `data/countries/si.json` (University of Maribor) | "the only university where private international students can get a dormitory place" | `si.json` `housing` quotes Study in Slovenia (https://studyinslovenia.si/live/accomodation/): "…you do not have the option of staying in university student dormitories, except in Maribor". The note now quotes it as well. |

### `scripts/test-research-log.mjs` (stage `built`, id `research-log`)

**What it reads.** It reads the visible text (`htmlToText`) of every built Destination page. That is all 35 `dist/destinations/<cc>/index.html` pages plus `dist/denmark/index.html`, not only the 20 in the audit. It fails if the build produced fewer pages than there are country profiles, so it cannot pass on an empty `dist/`.

**What it flags.** It flags the research, narrated:
- `page(s) read`;
- `read on <date>`, and `, read <date>` / `(read <date>` used inside a sentence;
- `were read`;
- `no page read/found` and `page(s) found`;
- `retrieved` and `re-read`;
- `could not be confirmed/verified/found on|in`;
- `not recorded here` and `left as context`;
- `during/in this research` and `this research could`;
- `were not read` and `could find`;
- `wikipedia field`, `that is the finding`, `recorded here so`, `the model can`, `now 404` and `not on this calendar`.

The last group is the regex from rounds 2 to 4 and the round-5 critic's suggestions, kept at last.

**What it leaves alone.** Some dates tell a student how current something is: "still not published on 2026-09-24" and "as of 23 September 2026". The templates' freshness stamps ("Last read 24 September 2026.", "Read 2026-09-22.") are left alone for the same reason, as is the Sources list's "checked …". Each of these is a labelled date in the page's own furniture, not a sentence about a researcher.

**Before and after.** Every line the guard matched when it landed is in the research-log table below, and it now finds 0. The same strings also feed `/timeline/`, `/compare/` and `/guides/`, which are now clean too. Those pages are not in the guard's scope.

## Item 3: the LSMU 6 July card was left as it is

Round 5 asked the route card to say: "LSMU does not say which programmes; for Medicine treat 5 July as your deadline". The brief for this pass allowed that sentence only if the record's own evidence supports the claim that the extra round does not name its programmes.

**The record's evidence does not support it.**
- `ev-lsmu-calendar` (`data/evidence/lt.json`) gives the claim "LSMU's 2026 calendar: portal opens 1 November 2025, … primary deadline 6 July 2026 and final deadline 30 July 2026". Its excerpt is "1 November 2025 … 13 January 2026 … 6 July 2026 … 30 July 2026". Neither mentions the additional round.
- The record says, without quoting it, that the extra round is "for selected programmes":
  - `lt-direct-2027` `milestones[ms-lsmu-primary].note`;
  - `lt.json` `application.deadlines[5].notes`.
- Only the round-5 critic's own reading of lsmu.lt says the page does not name them.

**To land the sentence:**
1. Re-read https://lsmu.lt/en/admission/admission-process/. This needs the web.
2. Add the "Additional admission to selected programmes" wording, and the fact that no programmes are named, to `ev-lsmu-calendar`'s `excerpt` and `interpretation`.
3. Then add to the route note: "LSMU does not say which programmes; if you are applying for Medicine, treat 5 July as your deadline."

The country card already tells the student to submit before results day, so no one is pointed the unsafe way in the meantime.

## What is left

- **Item 4 (needs the web): Warsaw Senate resolution 315 of 24 June 2026.** It amends resolution 278. Someone needs to check whether it changes § 4, the 2 February to 30 September 2027 outer bounds. Then add one line to the PL source note either way. Not done here, because no page could be read.
- **Programme pages render Evidence `interpretation`.** `dist/programmes/*` shows 89 lines of research-log wording, all from Evidence `interpretation` text on DK and NL Opportunities. Examples are "No institution page read for this catalogue states it" and "…should be re-read before anyone relies on…". The brief treats `interpretation` as unrendered, and on Destination pages it is. On programme pages it is rendered. That is a template question for whoever owns `src/pages/programme.mjs`: either stop rendering `interpretation` there, or accept it as the evidence view. Not changed here.
- **University pages render `meta.notes`.** 5 lines on `dist/universities/` (BUas, Erasmus, TU Delft, SEA) are `meta.notes`. `docs/PARALLEL_WORK.md` names that field as the place for research notes, so it was left alone. The same question applies as for programme pages.
- **Out-of-scope pages with a small number of matches.** `/trust/` and `/counsellors/` say sources were "re-read by machine". That is a description of the verification process, which is what those pages are for. Left alone.
- **Round 5's template item.** The "Applications go through …" sentence for HU, AT and CH is in `src/`. This pass did not touch it.
- **LV state-funded places.** The LV page says nothing either way about state-funded places for EU citizens. This is round 5's "separate gap" and needs research.
- **Still in the deeper prose.** The guard reads only first-contact strings. A few comparisons remain in `whyConsider`, where comparison is often the point. Examples are AT "Vienna is consistently ranked among the most liveable cities in Europe" and SI "Primorska has the widest English-taught choice". The two that round 5 named (CH and HU) were fixed by hand. A wider sweep would need its own false-positive rules, such as "the only compulsory payment" and "the top of the Norwegian scale".

## Every string changed

The table cells hold the changed phrase, not the whole field. JSON paths use the record's own field names.

### Rankings (item 1)

**`data/countries/at.json`**

| Field | Before | After |
|---|---|---|
| `institutions[0].note` | The oldest university in the German-speaking world and by far Austria's largest; bachelor's | Founded in 1365; bachelor's |
| `institutions[2].note` | One of Europe's biggest business schools, on a modern campus by the Prater. | A business and economics university on a modern campus by the Prater. |
| `institutions[3].note` | Austria's second-oldest university in a UNESCO-listed student city | Founded in 1585, in a UNESCO-listed student city |
| `institutions[5].note` | World-class quantum physics group and a campus surrounded by the Alps; | Known for physics, geology, sport science and atmospheric sciences, on a campus surrounded by the Alps; |

**`data/countries/au.json`**

| Field | Before | After |
|---|---|---|
| `institutions[1].note` | Australia's oldest university, on a sandstone campus near central Sydney. | Founded in 1850, on a sandstone campus near central Sydney. |
| `institutions[7].note` | It is now South Australia's largest university, and international students apply to it directly. | It teaches across seven campuses in South Australia, and international students apply to it directly. |

**`data/countries/be.json`**

| Field | Before | After |
|---|---|---|
| `institutions[1].note` | A large, research-heavy university in one of the most liveable student cities in Europe; almost | A large, research-heavy university in Ghent; almost |
| `institutions[5].note` | The largest French-speaking university in Belgium, in a purpose-built car-free university town; | A French-speaking research university in a purpose-built car-free university town; |
| `institutions[7].note` | The only public university in Wallonia, with the region's veterinary school; | A public research university in Liège, with a veterinary school; |
| `institutions[11].note` | Practice-oriented, with compulsory internships; it says it has the largest set of English-taught professional bachelor's in Belgium. | Practice-oriented, with compulsory internships, and several English-taught professional bachelor's in business and technology. |

**`data/countries/ch.json`**

| Field | Before | After |
|---|---|---|
| `institutions[0].note` | The single most demanding IB rule in this country file: 38 points, | A demanding IB rule: 38 points, |
| `institutions[2].note` | Switzerland's largest university; applies the swissuniversities IB rule | A German-speaking research university that applies the swissuniversities IB rule |
| `institutions[4].note` | Switzerland's oldest university, German-speaking, at the heart | Founded in 1460, German-speaking, at the heart |
| `institutions[7].note` | The German-speaking world's best-known business school, with a famously strong recruiting network. | A business school whose Assessment Year can be taken entirely in English. |
| `institutions[11].note` | The world's best-known hospitality school, with paid internships built into the degree; | A hospitality business school with an English-taught Bachelor in International Hospitality Management and paid internships built into the degree; |
| `whyConsider[0]` | ETH Zurich and EPFL are among the strongest science and engineering universities in the world, and tuition | ETH Zurich and EPFL are technical universities for science and engineering, and tuition |

**`data/countries/cn.json`**

| Field | Before | After |
|---|---|---|
| `institutions[3].note` | Its joint institutes with Michigan and with ParisTech are the most internationally accessible parts. | It runs joint institutes with Michigan and with ParisTech; the ParisTech one teaches in French and Chinese. |

**`data/countries/cz.json`**

| Field | Before | After |
|---|---|---|
| `institutions[0].note` | Czechia's oldest and largest university, and organised so that the faculty matters more than the name. Its Faculty of Mathematics and Physics is the only one publishing an explicit IB grade rule | Founded in 1347, and organised so that the faculty matters more than the name. Its Faculty of Mathematics and Physics publishes an explicit IB grade rule |
| `institutions[2].note` | One of Europe's oldest technical universities, and the clearest institution in Czechia on the IB: it states outright | Founded in 1707, and explicit about the IB: it states outright |
| `institutions[4].note` | The second-oldest Czech university and by far the cheapest English-taught medicine in the country at 12,500 euros a year, | Founded in 1573, with English-taught medicine at 12,500 euros a year, |
| `institutions[8].note` | and the only one here with rolling admissions and no deadline | with rolling admissions and no deadline |
| `institutions[8].note` | It is also the most expensive on this list at 125,489 CZK a semester for EU students, roughly 10,400 euros a year, and has warned | Tuition is 125,489 CZK a semester for EU students, roughly 10,400 euros a year, and it has warned |
| `institutions[9].note` | Tuition is about 4,000 euros a year from 2026/27, and Ostrava is one of the cheapest cities in the country to live in. | Tuition is about 4,000 euros a year from 2026/27. |
| `institutions[11].note` | and the only conservatoire in Czechia with English-taught bachelor's degrees. | with three English-taught bachelor's degrees: Authorial Acting, Photography at FAMU, and Dance Pedagogy. |

**`data/countries/de.json`**

| Field | Before | After |
|---|---|---|
| `institutions[0].note` | One of Germany's most highly ranked technical universities and an obvious target | A technical university known for engineering, computer science and the natural sciences, and an obvious target |
| `institutions[2].note` | Germany's best-known general university; bachelor's | A general research university founded in 1472; bachelor's |
| `institutions[3].note` | Germany's oldest university and a research heavyweight. | Founded in 1386, and known for medicine, life sciences, physics and law. |
| `institutions[6].note` | but the most fully international English-taught campus in Germany; | but every bachelor's is taught in English, on a residential international campus; |
| `institutions[7].note` | Germany's leading business and social science university, on a baroque palace campus. | A business and social science university on a baroque palace campus. |

**`data/countries/ee.json`**

| Field | Before | After |
|---|---|---|
| `institutions[0].note` | Estonia's flagship and one of the oldest universities in northern Europe, with around 15,500 students. | Founded in 1632, with around 15,500 students. |
| `institutions[1].note` | The only technical university in Estonia, with around 11,000 students, and the single best-value option in the country for an EU/EEA student: two English-taught | A technical university with around 11,000 students, and two English-taught |
| `institutions[2].note` | The widest choice of English-taught bachelor's degrees in Estonia, and by far the most transparent institution in the country — it is the only one that publishes firm 2027 dates | The widest choice of English-taught bachelor's degrees in Estonia: six of the 27 on the national list. It publishes firm 2027 dates |
| `institutions[2].note` | Its Baltic Film, Media and Arts School calls itself the only institution in northern Europe teaching film and television in English. | Its Baltic Film, Media and Arts School teaches film and television in English. |
| `institutions[3].note` | It is the most expensive option on this list and makes no EU versus non-EU distinction. | Its fees, 7,730 to 8,100 euros a year, make no EU versus non-EU distinction. |

**`data/countries/fi.json`**

| Field | Before | After |
|---|---|---|
| `institutions[0].note` | Finland's only regular global top-100 university, but only two | A broad research university founded in 1640, but only two |
| `institutions[2].note` | Eleven English-taught bachelor's degrees, among the widest choice at a Finnish research university. | Eleven English-taught bachelor's degrees, including Automation and Robotics, Biomedical Engineering and Engineering Physics. |
| `institutions[3].note` | The best-documented Finnish option for an IB student: | Well documented for an IB student: |
| `institutions[4].note` | It also has the most IB-friendly wording of any Finnish university: it states in plain English | It also states in plain English |
| `institutions[7].note` | Its master's degrees in international law and human rights and in peace mediation are among the most distinctive in Europe. | Its English-taught master's degrees include international law and human rights, and peace mediation. |
| `institutions[9].note` | Finland's widest English-taught offer at a university of applied sciences, and unusual for having creative degrees like game design and XR design in English. | Thirty-two English-taught listings for the January 2027 cycle, fewer of them open to a school leaver, including creative degrees like game design and XR design. |
| `institutions[11].note` | The most transparent of the universities of applied sciences about which admission route applies to which programme. | Clear about which admission route applies to which programme. |

**`data/countries/fr.json`**

| Field | Before | After |
|---|---|---|
| `institutions[1].note` | France's most famous engineering school; its three-year | An engineering school founded in 1794; its three-year |
| `institutions[3].note` | One of France's top three business schools; its four-year Global BBA costs | A business school whose four-year Global BBA costs |

**`data/countries/gb.json`**

| Field | Before | After |
|---|---|---|
| `tagline` | Still the best-known route out of the IB, and now one of the most expensive | Offers in IB points before your results, and overseas fees since Brexit |
| `institutions[4].note` | Social sciences only and one of the most competitive places in Europe for economics; published IB range | Social sciences only, and demanding: the published IB range |
| `institutions[18].note` | One of the biggest Russell Group universities, with its campus next to the city centre. | A Russell Group university with its campus next to the city centre. |
| `institutions[10].englishBachelors` | All courses in English; one of the largest UK course catalogues | All courses in English |
| `institutions[17].englishBachelors` | All courses in English; one of the largest UK course catalogues | All courses in English |
| `institutions[18].englishBachelors` | All courses in English; one of the largest UK course catalogues | All courses in English |

**`data/countries/gr.json`**

| Field | Before | After |
|---|---|---|
| `institutions[0].note` | The oldest university in modern Greece, founded in 1837. | A research university founded in 1837. |

**`data/countries/hk.json`**

| Field | Before | After |
|---|---|---|
| `institutions[0].note` | Hong Kong's oldest university, reviewing applications | Founded in 1911, and reviewing applications |

**`data/countries/hu.json`**

| Field | Before | After |
|---|---|---|
| `institutions[0].note` | Hungary's flagship medical university and the single biggest draw for Scandinavian medical applicants, with around 16,000 students and teaching in Hungarian, English and German. It is also the most expensive: 9,340 euros a semester for medicine or dentistry. | A medical university with around 16,000 students, teaching in Hungarian, English and German. Medicine or dentistry costs 9,340 euros a semester. |
| `institutions[1].note` | The one Hungarian medical school that will waive the entrance exam outright for a strong IB Diploma: | Waives the entrance exam outright for a strong IB Diploma: |
| `institutions[1].note` | Szeged also has the cheapest dormitories in the country at HUF 13,000 a month. | Szeged's dormitories cost HUF 13,000 a month. |
| `institutions[2].note` | Hungary's largest English-language medical intake outside Budapest, across thirteen faculties, and one of the cheapest big cities to live in — dormitories at HUF 18,000 a month. | A thirteen-faculty university teaching medicine, dentistry, pharmacy and more in English; dormitories cost HUF 18,000 a month. |
| `institutions[3].note` | Hungary's oldest university by founding date and the only medical school with 2027-entry exam dates already published — every Wednesday from 3 March to 14 July 2027. Its fee page is also labelled 2027/28, which makes it the best-dated source in the country. | Founded in 1367, and its medical school has already published its 2027-entry exam dates — every Wednesday from 3 March to 14 July 2027. Its fee page is also labelled 2027/28. |
| `institutions[4].note` | One of Europe's oldest veterinary schools and the cheapest English-taught clinical programme reviewed here. | Founded in 1787, with veterinary medicine taught in English at 12,480 euros a year. |
| `institutions[5].note` | The most IB-literate admissions policy in Hungary: | An admissions policy written with the IB in mind: |
| `institutions[7].note` | Hungary's leading technical university, and often described as the world's oldest institute of technology with university rank. | A technical university founded in 1782, with 13 English-taught BSc degrees and an Architecture MSc. |
| `institutions[8].note` | The oldest continuously operating university in Hungary and the broadest general-academic option in Budapest, with a second campus | Founded in 1635, a general-academic university in Budapest with a second campus |
| `institutions[9].note` | Its John von Neumann informatics faculty is its best-known part. | Its informatics faculty is named after John von Neumann. |
| `institutions[12].note` | Hungary's largest private university and the main English-taught option | A private university and an English-taught option |
| `whyConsider[1]` | — the best IB-specific deal in Hungary, and it will consider | , and it will consider |

**`data/countries/ie.json`**

| Field | Before | After |
|---|---|---|
| `institutions[0].note` | Ireland's oldest and most internationally recognised university, on a walled city-centre campus; its high-points courses are among the hardest in the country to reach. | Founded in 1592, on a walled city-centre campus; its high-points courses are hard to reach. |
| `institutions[1].note` | The largest university in Ireland, on a suburban campus at Belfield, | A research university on a suburban campus at Belfield, |
| `institutions[8].note` | Ireland's largest technological university, practice-focused, with | A practice-focused technological university, with |

**`data/countries/is.json`**

| Field | Before | After |
|---|---|---|
| `institutions[0].note` | Iceland's oldest and largest university, around 14,000 students across five schools, and the only one with a dedicated IB page. | Founded in 1911, with around 14,000 students across five schools, and a dedicated IB page. |
| `institutions[1].note` | The only university-level arts degrees in Iceland, from architecture | University-level arts degrees, from architecture |

**`data/countries/jp.json`**

| Field | Before | After |
|---|---|---|
| `institutions[3].note` | Japan's oldest private university and Waseda's historic rival. | A private university founded in 1858, and Waseda's historic rival. |

**`data/countries/kr.json`**

| Field | Before | After |
|---|---|---|
| `institutions[3].note` | One of the 'SKY' trio with SNU and Yonsei, where the Division of International Studies is the most reliably English-taught part. | One of the 'SKY' trio with SNU and Yonsei; many courses are taught in English, particularly in Business and International Studies, but few majors are guaranteed fully in English. |

**`data/countries/lt.json`**

| Field | Before | After |
|---|---|---|
| `institutions[0].note` | One of the oldest universities in Northern Europe, with a broad English-taught choice and state-funded places open to EU citizens. | Founded in 1579, with more than 30 English-taught bachelor's and integrated programmes, and state-funded places open to EU citizens. |
| `institutions[4].note` | The most liberal-arts-like university in Lithuania - you take a minor | Built on liberal-arts lines - you take a minor |
| `institutions[7].note` | Lithuania's only coastal university and the place for marine science; small, and outside the capital. | A small university on the coast, outside the capital, known for marine science and maritime engineering. |

**`data/countries/lu.json`**

| Field | Before | After |
|---|---|---|
| `summary` | The country is also one of the most expensive in Europe to live in, and there is only one annual intake | Living costs are high - the university's own budget floor is at least 1,517 EUR a month - and there is only one annual intake |
| `institutions[1].note` | the most straightforward English-language bachelor route in Luxembourg, but it charges private tuition. | so there is no second teaching language to plan around, but it charges private tuition. |

**`data/countries/lv.json`**

| Field | Before | After |
|---|---|---|
| `institutions[0].note` | The country's oldest and broadest university, and the one that explains the AIC recognition requirement most clearly on its own pages. | Founded in 1919, and clear on its own pages about the AIC recognition requirement. |
| `institutions[4].note` | Describes itself as the largest business university in the Baltics; applies | A business university teaching business, tourism, communication and law in English; applies |

**`data/countries/nl.json`**

| Field | Before | After |
|---|---|---|
| `institutions[0].note` | The largest research university in the country and the most competitive city to find a room in; several | Founded in 1632, in a city where finding a student room is hard; several |
| `institutions[1].note` | The strongest engineering school in the Netherlands; its English-taught | A technical university founded in 1842; its English-taught |
| `institutions[2].note` | The most international university in the country and built entirely on problem-based learning | Built entirely on problem-based learning |
| `institutions[5].note` | The oldest Dutch university, with a second campus | Founded in 1575, with a second campus |
| `institutions[9].note` | It calls itself the only campus university in the Netherlands, with more than 3,000 | A campus university with more than 3,000 |

**`data/countries/no.json`**

| Field | Before | After |
|---|---|---|
| `institutions[3].note` | Norway's most selective business school — roughly 20% acceptance, | A selective business school — roughly 20% acceptance, |
| `institutions[4].note` | Home to the only veterinary education in Norway, and one of very few | Home to a veterinary school, and one of very few |
| `institutions[5].note` | Norway's oldest and most prestigious university — but for an IB student | Founded in 1811 — but for an IB student |
| `institutions[7].note` | The only English door is Classical Ballet, | Its only English door is Classical Ballet, |
| `institutions[9].note` | World-class for marine and climate science. | Known for marine and climate science. |
| `institutions[11].note` | Ranked among the top three sport-science schools in the world since 2017. | A specialist sport-science university. |

**`data/countries/nz.json`**

| Field | Before | After |
|---|---|---|
| `institutions[4].note` | Home to New Zealand's only veterinary school and a pilot training programme | Home to a veterinary school and a pilot training programme |

**`data/countries/pl.json`**

| Field | Before | After |
|---|---|---|
| `institutions[0].note` | Poland's largest university, where several English-taught bachelor's are free for EU citizens while non-EU students pay - and it publishes the clearest official IB conversion table in the country. | At least 11 English-taught bachelor's and long-cycle programmes, several of them free for EU citizens while non-EU students pay - and it publishes an official IB conversion table. |
| `institutions[1].note` | Poland's oldest university, founded in 1364, and one of the few | Founded in 1364, and one of the few |
| `institutions[2].note` | One of Poland's leading institutes of technology. Unusually, | A technical university with 11 English-taught BSc programmes. Unusually, |
| `institutions[5].note` | Poland's oldest economics university, founded in 1906 as August Zielinski's Private Trade Courses, and its flagship public business school - | Founded in 1906 as August Zielinski's Private Trade Courses, and now a public business school - |
| `institutions[7].note` | The only Polish institution found with a fully published autumn-2027 application calendar, and it explicitly requires | It has already published its full autumn-2027 application calendar, and it explicitly requires |
| `institutions[9].note` | One of the oldest and largest medical schools in Poland, tracing to | A medical university tracing to |
| `institutions[10].note` | Traditionally ranked among Poland's most reputable universities and the main general-academic option in Poznan. | A general-academic university in Poznan with nine English-taught bachelor's. |
| `institutions[11].note` | The largest higher-education institution in Lower Silesia, with an unusually broad English-taught bachelor's list for a Polish university. | A research university with 12 English-taught bachelor's, from Biotechnology to an LLB in International and European Environmental Law. |
| `institutions[12].note` | Described as one of the best technical universities in Poland and a non-capital alternative | A technical university with ten English-taught BSc programmes, and a non-capital alternative |

**`data/countries/pt.json`**

| Field | Before | After |
|---|---|---|
| `institutions[4].note` | A modern, decentralised university whose business school is its best-known international face. | A modern, decentralised university whose English-taught bachelor's are concentrated in its business school, Nova SBE. |

**`data/countries/se.json`**

| Field | Before | After |
|---|---|---|
| `institutions[0].note` | The closest big Swedish university to Denmark - about 45 minutes from Copenhagen by train - and the one with the widest English-taught bachelor's list. | A large university about 45 minutes from Copenhagen by train, with ten English-taught bachelor's programmes open to international students. |
| `institutions[1].note` | The oldest university in the Nordics, with a student-nation | Founded in 1477, with a student-nation |
| `institutions[3].note` | Sweden's leading technical university, but at bachelor level it teaches in English on exactly one programme. | A technical university, but at bachelor level it teaches in English on exactly one programme: Information and Communication Technology. |
| `institutions[9].note` | and home to one of Europe's most respected industrial design schools. | and home to an industrial design school; four of its bachelor's programmes are taught in English. |

**`data/countries/si.json`**

| Field | Before | After |
|---|---|---|
| `summary` | If one of those programmes is what you want, Slovenia is one of the best-value places in Europe. | If one of those programmes is what you want, you study it without tuition. |
| `institutions[0].note` | By far the largest and oldest Slovenian university, teaching | Founded in 1919, teaching |
| `institutions[1].note` | Calls itself the most international university in Slovenia, and it is the only one where private international students can get a dormitory place. | Five English-taught bachelor's confirmed, and the only university where private international students can get a dormitory place: Study in Slovenia says they cannot stay in university dormitories "except in Maribor". |
| `institutions[4].note` | Private, and paradoxically the institution with the most English-taught bachelor programmes in the country - but | Private, with eight English-taught bachelor programmes identified - but |

**`data/destinations/gb.json`**

| Field | Before | After |
|---|---|---|
| `summary` | For an IB student that removes the single most awkward problem in European admissions. | For an IB student that removes an awkward problem: applying before you know your results. |

**`data/destinations/no.json`**

| Field | Before | After |
|---|---|---|
| `summary` | several of the largest universities offer no English-taught bachelor programme at all | several large universities offer no English-taught bachelor programme at all |

**`data/destinations/si.json`**

| Field | Before | After |
|---|---|---|
| `summary` | If one of those is what you want, it is one of the best-value options in Europe. | If one of those is what you want, you study it without tuition. |

**`data/institutions/dk-absalon.json`**

| Field | Before | After |
|---|---|---|
| `about` | and Denmark's largest refinery on its doorstep | and a refinery on its doorstep |

**`data/institutions/dk-ucph.json`**

| Field | Before | After |
|---|---|---|
| `about` | The single most important fact about the University of Copenhagen, | The first thing to know about the University of Copenhagen, |
| `about` | It is Denmark's oldest and largest university, founded in 1479, with about 36,800 students | It was founded in 1479 and has about 36,800 students |

**`data/institutions/nl-erasmus.json`**

| Field | Before | After |
|---|---|---|
| `about` | between them take well over a thousand students a year, which makes Rotterdam the single biggest English-taught destination for a business-minded IB student in the country. | between them take well over a thousand students a year. |

**`data/institutions/nl-maastricht.json`**

| Field | Before | After |
|---|---|---|
| `about` | The most internationally recruited of the Dutch research universities, in a small city wedged between Belgium and Germany, and the one that teaches almost everything | A research university in a small city wedged between Belgium and Germany, teaching almost everything |
| `about` | — which makes Maastricht the single institution where an IB student can see all three Dutch entry regimes side by side. | — so at Maastricht an IB student can see all three Dutch entry regimes side by side. |

**`data/institutions/nl-tudelft.json`**

| Field | Before | After |
|---|---|---|
| `about` | The Netherlands' oldest and largest technical university, on a campus | A technical university founded in 1842, on a campus |

**`data/institutions/nl-utwente.json`**

| Field | Before | After |
|---|---|---|
| `about` | The Netherlands' only campus university, on parkland | A campus university on parkland |
| `about` | which makes it the widest English-taught choice of any Dutch research university and the one with most to lose from the internationalisation bill. | which gives it a lot to lose from the internationalisation bill. |

**`data/dk/absalon.json`**

| Field | Before | After |
|---|---|---|
| `about` | and Denmark's largest refinery on its doorstep | and a refinery on its doorstep |

**`data/dk/ucph.json`**

| Field | Before | After |
|---|---|---|
| `about` | The single most important fact about the University of Copenhagen, | The first thing to know about the University of Copenhagen, |
| `about` | It is Denmark's oldest and largest university, founded in 1479, with about 36,800 students | It was founded in 1479 and has about 36,800 students |

### Research-log wording (item 2)

**`data/countries/at.json`**

| Field | Before | After |
|---|---|---|
| `application.deadlines[2].notes` | The University of Vienna page, read on 23 September 2026, dates this window | The University of Vienna's page, as of 23 September 2026, dates this window |
| `application.deadlines[4].notes` | The University of Vienna page, read on 23 September 2026, gives it as | The University of Vienna's page, as of 23 September 2026, gives it as |
| `application.deadlines[7].notes` | Precedent, read on 23 September 2026:  | Precedent, as published on 23 September 2026:  |

**`data/countries/be.json`**

| Field | Before | After |
|---|---|---|
| `costs.livingCostMonthly.year` | Year not stated on the source page - figures retrieved September 2026 | Year not stated on the source page; figures as published in September 2026 |
| `watchOuts[2]` | needs no equivalence at all (equivalences.cfwb.be, read 2026-09-23). | needs no equivalence at all (equivalences.cfwb.be, as of September 2026). |
| `ibRecognition.notes[1]` | to enter higher education (equivalences.cfwb.be, read 2026-09-23 and 2026-09-24). | to enter higher education (equivalences.cfwb.be, as of September 2026). |

**`data/countries/ee.json`**

| Field | Before | After |
|---|---|---|
| `language.englishTaughtBachelors` | 27 on the official national list, read on 24 September 2026 (one, | 27 on the official national list as of 24 September 2026 (one, |

**`data/countries/fi.json`**

| Field | Before | After |
|---|---|---|
| `application.deadlines[7].notes` | results are published "by 31 March 2027", read on 24 September 2026. | results are published "by 31 March 2027". |
| `costs.notes[3]` | A claim that Finland is moving to full cost recovery or raising fees from 2026 could not be confirmed on any official source and is not stated here as fact. The evidence points both ways: | You may read that Finland is moving to full cost recovery or raising fees from 2026. Treat that as unconfirmed until an official page says so, and go by the fee on your own programme's page. Fees are moving both ways: |

**`data/countries/fr.json`**

| Field | Before | After |
|---|---|---|
| `application.deadlines[11].notes` | but they label it prévisionnel and it is not on any official page, so it is not recorded here. | but they label it prévisionnel (provisional) and no official page gives it yet, so do not plan around it. |

**`data/countries/hu.json`**

| Field | Before | After |
|---|---|---|
| `application.deadlines[1].notes` | will open in October 2026", read on 23 September 2026. | will open in October 2026" (as of 23 September 2026). |
| `application.deadlines[3].notes` | (https://admissions.medschool.pte.hu/application-form), read on 23 September 2026; the page | (https://admissions.medschool.pte.hu/application-form), as of 23 September 2026; the page |
| `application.deadlines[9].notes` | The opening date is still only "later this year". Read on 23 September 2026. | The opening date is still only "later this year" (as of 23 September 2026). |
| `application.deadlines[12].notes` | Still not published. The DreamApply course page read on 23 September 2026 shows "Fall semester 2026/27 - Application period has ended" and offers nothing for 2027/28. | Not published yet: on 23 September 2026 the DreamApply course page still showed "Fall semester 2026/27 - Application period has ended" and nothing for 2027/28. |
| `application.deadlines[12].notes` | it is the one Hungarian medical school in this profile that exempts strong IB science candidates | it exempts strong IB science candidates |

**`data/countries/ie.json`**

| Field | Before | After |
|---|---|---|
| `application.deadlines[2].notes` | Both pages were read on 23 September 2026 and both are live. | Both pages were live on 23 September 2026. |
| `application.deadlines[5].notes` | Both pages were read on 23 September 2026; neither had published a 2027 window, so no date is recorded. | On 23 September 2026 neither page had published a 2027 window, so there is no date to give yet. |
| `application.deadlines[8].notes` | The CAO Handbook 2027, read on 24 September 2026, gives this day and time but marks it "(expected date)", so it stays provisional. | The CAO Handbook 2027 gives this day and time but marks it "(expected date)", so treat it as provisional. |
| `application.deadlines[3].notes` | Confirmed for 2027 entry by the CAO Handbook 2027 (Timetable of Events and Table 1.1), read on 24 September 2026; the Timetable of Events web page still shows the 2026 cycle. | Confirmed for 2027 entry by the CAO Handbook 2027 (Timetable of Events and Table 1.1); on 24 September 2026 the Timetable of Events web page still showed the 2026 cycle. |
| `application.deadlines[6].notes` | Confirmed for 2027 entry by the CAO Handbook 2027 (Timetable of Events and Table 1.1), read on 24 September 2026; the Timetable of Events web page still shows the 2026 cycle. | Confirmed for 2027 entry by the CAO Handbook 2027 (Timetable of Events and Table 1.1); on 24 September 2026 the Timetable of Events web page still showed the 2026 cycle. |
| `application.deadlines[7].notes` | Confirmed for 2027 entry by the CAO Handbook 2027 (Timetable of Events and Table 1.1), read on 24 September 2026; the Timetable of Events web page still shows the 2026 cycle. | Confirmed for 2027 entry by the CAO Handbook 2027 (Timetable of Events and Table 1.1); on 24 September 2026 the Timetable of Events web page still showed the 2026 cycle. |
| `application.deadlines[9].notes` | Confirmed for 2027 entry by the CAO Handbook 2027 (Timetable of Events and Table 1.1), read on 24 September 2026; the Timetable of Events web page still shows the 2026 cycle. | Confirmed for 2027 entry by the CAO Handbook 2027 (Timetable of Events and Table 1.1); on 24 September 2026 the Timetable of Events web page still showed the 2026 cycle. |

**`data/countries/is.json`**

| Field | Before | After |
|---|---|---|
| `healthcare` | There is a widely repeated claim that Icelandic Health Insurance only begins after six months of legal domicile. That could not be confirmed on any official page, though the fact that Menntasjóður lends up to ISK 550,000 a year for health insurance costs suggests a real gap exists. | You may read that Icelandic Health Insurance only begins after six months of legal domicile. That is unconfirmed, but Menntasjóður lends up to ISK 550,000 a year for health insurance costs, which suggests a real gap exists, so check with Icelandic Health Insurance before you arrive whether you need cover for your first months. |

**`data/countries/lt.json`**

| Field | Before | After |
|---|---|---|
| `application.deadlines[4].notes` | For autumn 2026 the page read:  | For autumn 2026 the page said:  |
| `application.deadlines[11].notes` | Read on 23 September 2026 without a year attached, which is why no date is recorded. | The portal gives no year and no day, so there is no date here. |
| `costs.tuitionEuEea.year` | Study in Lithuania figure undated on the page read on 2026-09-22 | Study in Lithuania figure, undated on its page (as of September 2026) |
| `costs.livingCostMonthly.year` | VMU estimate and 2025 survey, read 2026-09-24 | VMU estimate and 2025 survey (as of September 2026) |

**`data/countries/lu.json`**

| Field | Before | After |
|---|---|---|
| `ibRecognition.notes[2]` | and re-read the university's admissions pages in late 2026. | and check the university's admissions pages again in late 2026. |
| `application.deadlines[3].notes` | Both were read on 23 September 2026 and both are live. | Both were live on 23 September 2026. |
| `costs.tuitionEuEea.year` | Current figure on the university budget page, read 2026-09-24 | Current figure on the university budget page (September 2026) |
| `costs.tuitionNonEu.year` | Current figure on the university budget page, read 2026-09-24 | Current figure on the university budget page (September 2026) |
| `costs.notes[0]` | (400 EUR on the university budget page, read 2026-09-24) | (400 EUR on the university budget page, as of September 2026) |

**`data/countries/lv.json`**

| Field | Before | After |
|---|---|---|
| `application.deadlines[0].notes` | that is a different intake from the one this profile is about and it is left as context rather than given an entry of its own, because a May 2027 IB candidate | that is a different intake, which is why it has no card of its own: a May 2027 IB candidate |
| `costs.tuitionEuEea.year` | Study in Latvia figure undated on the page read; SSE Riga figure | Study in Latvia figure undated on its page; SSE Riga figure |
| `costs.livingCostMonthly.year` | Undated on the page read on 2026-09-22 | Undated on the source page (as of September 2026) |

**`data/countries/si.json`**

| Field | Before | After |
|---|---|---|
| `watchOuts[2]` | No page found gives IB-specific minimum points or a mapping onto the Slovenian Matura; you must ask the ENIC-NARIC Centre or the faculty directly | IB-specific minimum points and a mapping onto the Slovenian Matura are not published yet; ask the ENIC-NARIC Centre or the faculty directly |
| `ibRecognition.notes[1]` | own Slovene admission leaflet, read on 23 September 2026, says it is not needed | own Slovene admission leaflet for 2026 says it is not needed |
| `ibRecognition.notes[5]` | No page read on 2026-09-22 or 2026-09-23 published IB-specific minimum points, an HL/SL mapping onto the Slovenian Matura, or a grade conversion table. | IB-specific minimum points, an HL/SL mapping onto the Slovenian Matura and a grade conversion table are not published yet (as of September 2026). |
| `language.notes[1]` | No page read on 2026-09-22 stated whether IB English A or B is accepted as proof of English, or gave IELTS/TOEFL thresholds. | Whether IB English A or B counts as proof of English, and the IELTS/TOEFL thresholds, are not published yet (as of September 2026). |
| `costs.livingCostMonthly.year` | Undated on the page read on 2026-09-22 | Undated on the source page (as of September 2026) |
| `workRights` | Weekly or monthly hour limits, and any EU/non-EU eligibility difference, were not stated on the page read on 2026-09-22. | Weekly or monthly hour limits, and any EU/non-EU eligibility difference, are not published with these rates; ask Student Services before you count on the income. |
| `sources[3].title` | Study in Slovenia - Programmes in English (re-read 2026-09-24: | Study in Slovenia - Programmes in English (as of 2026-09-24: |

**`data/countries/de.json`**

| Field | Before | After |
|---|---|---|
| `costs.notes[0]` | (uni-assist, read 2026-09-24) | (uni-assist, as of September 2026) |

**`data/countries/pl.json`**

| Field | Before | After |
|---|---|---|
| `ibRecognition.notes[2]` | for applying to first-cycle and long-cycle studies (read 23 September 2026). | for applying to first-cycle and long-cycle studies (NAWA, as of 23 September 2026). |

**`data/countries/gr.json`**

| Field | Before | After |
|---|---|---|
| `institutions[9].note` | tuition was not published on the pages read. | tuition is not published, so ask the college. |

**`data/destinations/ee.json`**

| Field | Before | After |
|---|---|---|
| `language.englishTaughtBachelors` | 27 programmes nationally, at ten institutions, on the list read on 24 September 2026. | 27 programmes nationally, at ten institutions, on the national list as of 24 September 2026. |

**`data/destinations/mt.json`**

| Field | Before | After |
|---|---|---|
| `feeContext[0].summary` | No tuition at the University of Malta on the bachelor's pages read ('No fees apply'), nor at MCAST. | No tuition at the University of Malta for a bachelor's ('No fees apply', on its bachelor's pages), nor at MCAST. |

**`data/topics/distinctive-options.json`**

| Field | Before | After |
|---|---|---|
| `options[7].deadlineNote` | Its programme page moved during this research and the fee documents could not be read — check ehl.edu directly. | Its programme page has moved and its fee documents are not available here — check ehl.edu directly. |
| `options[11].cost` | No figures were verified in this research. | None of these figures is verified; ask each school for a quote. |

## Round 2: answering the critique

This pass answers `follow-ups-41-critique-round-1.md`, which scored round 1 at 7/10. It was done on 2026-09-26, offline like round 1.

Every rewrite uses only what the same record already holds: a count, a fee, a named programme, a city or a founding year. Nothing is new and nothing was fetched. Where a replacement text in the critique said more than the record, I used the site's own "not confirmed here" convention instead. This happened three times:
- IT minimum points;
- PT application fee;
- Laurea's 2027 dates.

The critique suggested "not published yet" or "No national minimum is published" for these, which is the overclaim its change 3 objects to.

**Gate:** `SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs` passes all 37 checks. As before, the advisory `freshness` check reports the age of the evidence.

**This section supersedes round 1's descriptions** of both guards and of the allow-list.

### Each critique item, and what changed

| # | Critique item | What changed |
|---|---|---|
| 1 | Close the vocabulary hole in `test-superlatives`, read `englishBachelors` and `ibRecognition.notes`, and rewrite what it finds | The rule now follows its own definition. It moved to `scripts/lib/superlatives.mjs`, so a sweep of other fields can use it. The four shapes are listed after this table. **The guard now also reads** `institutions[].englishBachelors` and `ibRecognition.notes` (country and destination): 1,397 strings, up from 632. **Fixtures:** there are 26 new positive ones, including every phrasing the critique listed as missed, and 11 new negative ones (see after this table). **Result:** every string the widened rule found was rewritten from its own record; there are 80 rewrites in the change 1 table below. Every example the critique named is fixed. **Also fixed by hand,** although the guard does not read these fields: the AT, BE, FI, LU and SI `whyConsider`/`watchOuts` rankings, and CH `watchOuts[4]`, which is where the CH summary got "highest in Europe". **Context notes are still not read,** for a stated reason: 7 of the 9 hits there were about systems, not institutions ("the lowest-scoring applicant admitted", "the highest-ranked place that accepts you"). The two real ones were fixed (change 2, and `no-language-is-the-obstacle`). |
| 2 | Denmark: UCPH on the language-reality note, and ITU | `dk-language-reality.json` now says "founded in 1479, with about 36,800 students". `dk-itu.json` and `data/dk/itu.json` now say "ITU was founded in 1999, has about 2,900 students, and is built around…". Both figures are already in each institution's own record. Aarhus ("Denmark's second university") and CBS ("among the hardest degrees in Denmark") were also fixed, in both `data/institutions` and `data/dk`. So was SDU ("more here than at any other Danish university"). |
| 3 | Undo the "not published yet" overclaims | These are back to "not confirmed here": SI `watchOuts[2]`, `ibRecognition.notes[5]`, `language.notes[1]`, and the GR Deree card. |
| 4 | The GB summary that read backwards | It now reads "For an IB student that solves an awkward problem: you know the exact grades you need before you sit the exams." |
| 5 | SI Maribor: quote Study in Slovenia, do not extend it | The card now reads: Study in Slovenia says a "private international student" cannot stay in university dormitories "except in Maribor". That is the record's own quotation. **The allow-list entry is removed, not updated:** a quotation is not a ranking, so the guard no longer matches the card, and a stale entry fails the guard. **Two allow-list entries remain:** EE Tallinn University and LU University of Luxembourg. |
| 6 | Research-log guard: the missed patterns, `DIST_DIR`, `/universities/` | **Five patterns added:** `read in <language> on/from`, `was/were (not) found`, `when checked`, `cited here`, and `<page/leaflet/portal> on <date>:`. **`DIST_DIR`:** now honoured, as in every other built-stage check. **Pages read:** 506, up from 36. The guard now reads every `dist/universities/*/index.html` as well as the Destination pages. The rewrites are listed in the tables below: AT ×2, FR, SI, IT ×3, PT, FI Laurea, EE ×3, BE ×5, HU, KR ×3, LU ×2 and PL. **`meta.notes`:** the four university-page `meta.notes` that the new scope surfaced were rewritten for a student: BUas, Erasmus ×2, TU Delft and SEA. Round 1 had left these alone. **Programme pages** are still not read. They render Evidence `interpretation`, which is a template question. |
| 7 | Finish the sweep: HU Corvinus, EE `whyConsider[4]` | "Corvinus is the most IB-literate institution in Hungary." is deleted. The Baltic Film, Media and Arts School line now states only what the school teaches. |
| 8 | Polish, and the "Founded in <year>" openers | **Fixes:** the HU stray space. The SI repeated sentence now gives the dorm cost, EUR 80-250 a month, "if you can get one". The two figures come from `si.json` `housing` (80) and `whyConsider[1]` (250). The destination record, which has no dorm figures, drops the sentence. WU now leads with its 240 BBE places. Metropolia is rewritten as the critique proposed. Oslo no longer opens on a non-sequitur. Trinity's circular clause is gone. **Openers:** 30 cards that opened on a founding year now open on a count, a fee, a named programme or a place. Uppsala now explains student "nations". Four "Founded in" openers remain, all pre-existing: Leuven, Bologna, Coimbra, and SGH, which gives its origin as a trade school. |

**The four shapes the superlatives rule now flags:**
1. **Unframed words that always rank:**
   - best/well known, well/highly regarded, famous(ly), world-famous, renowned, prestigious, excellent, unique, premier, unlike any(where);
   - one of (the/relatively/very) few, top-N, No. 1;
   - ranking verbs used of a place, such as "top-ranked" and "ranked among". "Ranked" on its own is not flagged, because selection mechanics like "ranked on the SAT" and "ten ranked choices" use it.
2. **Any superlative inside the existing frames:** any -est or -most word, "most <adjective>", an "-ranked" compound, best, worst, top, leading or only.
3. **An ordinal after a possessive field,** such as "the world's fifth".
4. **Being first,** such as "the first private university in the country to…" or "the first … degree at a German public university".

**The 11 new negative fixtures** cover:
- selection mechanics ("ranked on the SAT");
- transcript rules ("the highest grade counts");
- first in time ("the first cohort", "the first year can be taken in English", "the first opens in October");
- "the most likely reading";
- "the latest date" and "the nearest centre";
- "its newest campus".

### Still open

- **Item 4, which needs the web:** Warsaw Senate resolution 315 and § 4 of resolution 278.
- **LSMU:** the extra-round sentence still waits on `ev-lsmu-calendar`, as in round 1.
- **Programme pages** still show research-log wording from Evidence `interpretation`: 89 lines on DK and NL Opportunities. This is a decision for the owner of `src/pages/programme.mjs`.
- **`data/schools` `notes`** were swept but are not guarded. The 3 hits are all about the institution itself, such as "KI's first intake" and "Arcada's fourth English programme". They are not rankings, and the files are another agent's.
- **Comparisons in prose the guard does not read.** Examples are "the only compulsory payment" and "the top of the Norwegian scale". These are statements about rules and scales, not rankings of institutions.

### Every string changed in round 2

Each cell holds the changed phrase, not the whole field.

#### Change 1: rankings the widened guard finds (80)

| File | Field | Before | After |
|---|---|---|---|
| `data/countries/au.json` | `institutions[13].note` | Accessible entry requirements and well-regarded sport science. | Accessible entry requirements, and sport science, nutrition and cyber security among its degrees. |
| `data/countries/be.json` | `tagline` | Cheap, excellent, and mostly not in English at bachelor level | Low fees, and mostly not in English at bachelor level |
| `data/destinations/be.json` | `tagline` | Cheap, excellent, and mostly not in English at bachelor level | Low fees, and mostly not in English at bachelor level |
| `data/countries/be.json` | `institutions[9].note` | Founded with VUB, this is one of the few places in Belgium offering an entirely English-taught, American-style liberal arts bachelor's | Founded with VUB, it offers an entirely English-taught, American-style liberal arts bachelor's |
| `data/countries/be.json` | `institutions[10].note` | One of the few Flemish institutions with a clearly signposted English-taught bachelor application route. | A clearly signposted application route for its English-taught bachelor's. |
| `data/countries/ca.json` | `institutions[3].englishBachelors` | Best known for co-op degrees that alternate study terms | Co-op degrees that alternate study terms |
| `data/countries/ch.json` | `summary` | Switzerland publishes one of the clearest IB rules in Europe and one of the strictest: swissuniversities sets | Switzerland publishes a precise IB rule, and a strict one: swissuniversities sets |
| `data/countries/ch.json` | `summary` | Tuition is low, but living costs are the highest in Europe and almost every | Tuition is low, but living costs are high - ETH estimates CHF 22,100 a year in Zurich before tuition - and almost every |
| `data/countries/ch.json` | `watchOuts[4]` | Living costs are the highest in Europe: ETH estimates CHF 22,100 a year | Living costs are high: ETH estimates CHF 22,100 a year |
| `data/destinations/ch.json` | `summary` | Switzerland publishes one of Europe's clearest IB rules and one of its strictest: 32 of 42 points | Switzerland publishes a precise IB rule, and a strict one: 32 of 42 points |
| `data/countries/ch.json` | `institutions[12].note` | Switzerland's smallest and newest public university, right by the lake and the mountains; German-speaking and strong in law and health policy. | A public university right by the lake and the mountains; German-speaking, and focused on law, health sciences, political science and sociology. |
| `data/countries/cz.json` | `institutions[1].note` | The broadest English-taught bachelor's menu outside Prague, priced from 3,000 to 14,000 euros depending on programme, and the one institution that runs its medicine entrance exam | Around 11 English-taught bachelor's, priced from 3,000 to 14,000 euros depending on programme, and it runs its medicine entrance exam |
| `data/countries/cz.json` | `institutions[8].note` | The first private university in the country to teach in English, with rolling admissions | A private university teaching in English, with rolling admissions |
| `data/countries/cz.json` | `institutions[10].note` | runs an entrance exam venue in Göteborg — the closest to Denmark found anywhere. | runs an entrance exam venue in Göteborg, in Sweden. |
| `data/countries/cz.json` | `institutions[11].note` | Home of FAMU, the world's fifth university-level film school, with three | Home of FAMU, its film and television school, with three |
| `data/countries/de.json` | `institutions[4].note` | The closest thing Germany has to a Dutch-style English-taught liberal arts college inside a big public research university; | A Dutch-style English-taught liberal arts college inside a big public research university; |
| `data/countries/de.json` | `institutions[4].englishBachelors` | Liberal Arts and Sciences BA/BSc, taught in English - described as the first English-language liberal arts degree at a German public university. | Liberal Arts and Sciences BA/BSc, taught in English. |
| `data/countries/de.json` | `institutions[5].note` | and one of the few German institutions where you can do a full English-taught bachelor's on the state system. | and a large share of its bachelor's degrees are taught entirely in English, across engineering, life sciences, society and economics. |
| `data/countries/de.json` | `institutions[9].note` | but the housing market is the hardest part. | but the housing market is hard. |
| `data/countries/de.json` | `ibRecognition.notes[0]` | Mathematics at Standard Level is the single biggest trap. | Mathematics at Standard Level is the trap to watch. |
| `data/countries/ee.json` | `institutions[3].note` | A private, non-profit business university of around 1,400 students, and the first institution in the Soviet Union to teach business in English. | A private, non-profit business university of around 1,400 students. |
| `data/countries/ee.json` | `institutions[4].note` | Around 2,900 students and a top-100 world position in agriculture and forestry. Its English-taught veterinary degree is one of relatively few in Europe and worth knowing about if that is your plan, | Around 2,900 students, in veterinary medicine, agriculture, forestry and environmental science. Its English-taught six-year Veterinary Medicine is worth knowing about if that is your plan, |
| `data/countries/fi.json` | `institutions[5].note` | Home of the Finland Futures Research Centre and one of the few places in Europe where futures studies is a real discipline. | Home of the Finland Futures Research Centre, where futures studies is taught as a discipline of its own. |
| `data/countries/fi.json` | `institutions[10].note` | The clearest non-exam route among the universities of applied sciences: certificate-based or SAT, | A non-exam route: certificate-based or SAT, |
| `data/countries/fi.json` | `institutions[12].note` | The Safety, Security and Risk Management degree is close to unique in English anywhere in the EU. | Seven English-taught bachelor's, among them Safety, Security and Risk Management, and Cyber Security. |
| `data/countries/fi.json` | `ibRecognition.notes[0]` | The IB and the European Baccalaureate are the only foreign certificates that count for certificate-based selection wherever they were taken. German Reifeprüfung and DIA only count if completed in Finland. | The IB and the European Baccalaureate count for certificate-based selection wherever they were taken; German Reifeprüfung and DIA count only if completed in Finland. |
| `data/countries/fr.json` | `tagline` | Public university costs €178 a year; the famous schools cost 100x that | Public university costs €178 a year; a private business school about 100 times that |
| `data/destinations/fr.json` | `tagline` | Public university costs €178 a year; the famous schools cost 100x that | Public university costs €178 a year; a private business school about 100 times that |
| `data/countries/fr.json` | `institutions[8].note` | France's highest-ranked research university, especially in mathematics and physics, on a large science campus south of Paris. | A research university founded in 2019, focused on mathematics, physics, biology and computer science, on a large science campus south of Paris. |
| `data/countries/gb.json` | `summary` | The teaching and the offer system are excellent; the money is the problem. | The money is the problem. |
| `data/countries/gb.json` | `institutions[3].note` | The broadest subject range of any London university, and one of the few places offering genuinely unusual combinations. | Around 400 undergraduate programmes, all in English, from architecture to neuroscience. |
| `data/countries/gb.json` | `institutions[8].note` | Not Russell Group but consistently top-ranked, very international, and tiny - a small coastal town, | Not Russell Group; around 200 degree combinations, very international, in a small coastal town, |
| `data/countries/gr.json` | `institutions[8].note` | with a well-regarded medical school and a very low cost of living. | with a medical school and a very low cost of living. |
| `data/countries/hk.json` | `institutions[1].note` | and its 2027/28 non-local fee, HK$230,000, is the lowest of HKU, HKUST and CUHK. | and its 2027/28 non-local fee is HK$230,000, against HKU's HK$250,000 to 280,000 outside medicine and dentistry. |
| `data/countries/hk.json` | `institutions[11].note` | Hong Kong's first private university, small and teaching-focused, with a well-regarded journalism department. | A small, teaching-focused private university, with journalism and communication, psychology, law and business taught in English and Chinese. |
| `data/countries/hu.json` | `ibRecognition.notes[3]` | Szeged is the only medical school here with a published IB exemption: grade 5 | Szeged publishes an IB exemption: grade 5 |
| `data/countries/ie.json` | `institutions[3].note` | A green campus in Ireland's second city, strong in food, | A green campus in Cork, strong in food, |
| `data/countries/is.json` | `ibRecognition.notes[0]` | The University of Iceland is the only Icelandic institution with a dedicated IB page. It confirms | The University of Iceland has a dedicated IB page. It confirms |
| `data/countries/it.json` | `institutions[6].note` | Small and alpine, with well-regarded student services. | Small and alpine, with Comparative, European and International Legal Studies taught in English, and computer science and economics in English and Italian. |
| `data/countries/it.json` | `institutions[10].note` | in a city that is hard to live in cheaply but unlike anywhere else. | in a city that is hard to live in cheaply. |
| `data/countries/jp.json` | `institutions[0].note` | It is Todai's first new undergraduate faculty in about seventy years, | Todai has not opened a new undergraduate faculty in about seventy years; this one runs |
| `data/countries/jp.json` | `ibRecognition.notes[4]` | The only published IB score found is the UTokyo College of Design's expectation of 38/42 plus 2 core points, which it says is not a cut-off. | The UTokyo College of Design expects 38/42 plus 2 core points, and says this is not a cut-off. |
| `data/countries/kr.json` | `institutions[7].note` | founded by the POSCO steel company, with a famously high staff-to-student ratio. | founded by the POSCO steel company. |
| `data/countries/lu.json` | `summary` | founded in 2003, and it is unlike anywhere else on this site. | founded in 2003. |
| `data/countries/lv.json` | `institutions[7].note` | A small coastal university best known for its radio astronomy centre. | A small coastal university with a radio astronomy centre, and two English-taught bachelor's: Computer Science, and Start-Up Management. |
| `data/countries/nl.json` | `institutions[7].note` | Amsterdam's second research university, smaller and less frantic than UvA, | Amsterdam's other research university, smaller and less frantic than UvA, |
| `data/countries/no.json` | `institutions[4].note` | Home to a veterinary school, and one of very few English-taught entry points for an IB student drawn to ESS, biology and global development. | Home to a veterinary school, and to an English-taught bachelor in International Environment and Development Studies, for an IB student drawn to ESS, biology and global development. |
| `data/countries/no.json` | `institutions[10].note` | The world's northernmost university and unique for Arctic, marine and space science — but | In Tromsø, focused on Arctic and polar research, space science and fisheries — but |
| `data/countries/no.json` | `ibRecognition.notes[0]` | That Maths AA SL alone satisfies R1+R2 is the single most favourable rule in Norway for IB students. | Maths AA SL alone satisfies R1+R2, which works strongly in an IB student's favour. |
| `data/countries/nz.json` | `institutions[1].englishBachelors` | New Zealand's oldest university, with a famously residential first year and a large health sciences pathway. | A residential first year in Dunedin, and a large health sciences pathway. |
| `data/countries/nz.json` | `institutions[5].englishBachelors` | Mid-sized, with a management school and a well-regarded computing and mathematical sciences faculty. | Mid-sized, with a management school and a computing and mathematical sciences faculty. |
| `data/countries/nz.json` | `institutions[5].note` | and a well-known machine-learning group. | and a machine-learning group. |
| `data/countries/nz.json` | `institutions[6].englishBachelors` | Practice-focused degrees with compulsory work placements in many programmes; New Zealand's youngest university. | Practice-focused degrees with compulsory work placements in many programmes. |
| `data/countries/nz.json` | `institutions[7].englishBachelors` | New Zealand's smallest university, specialising entirely in land, food and environment. | Under 3,000 students, specialising entirely in land, food and environment. |
| `data/countries/pl.json` | `institutions[1].note` | Founded in 1364, and one of the few with its 2027/28 admission rules already adopted - its medical school | Seven English-taught first-cycle programmes plus Medicine in English, and its 2027/28 admission rules are already adopted - its medical school |
| `data/countries/se.json` | `institutions[1].note` | Founded in 1477, with a student-nation social life that is unlike anywhere else in Scandinavia. | Eight international bachelor's, in Uppsala and at Campus Gotland in Visby, and a social life run by the student "nations" - the historic student societies that run much of student life. |
| `data/countries/se.json` | `institutions[5].note` | A broad university spread across Sweden's second city, with unusually strong art and design schools attached. | A broad university spread across Gothenburg, with ten international bachelor's, several of them in craft, design and music. |
| `data/countries/se.json` | `institutions[13].note` | World-famous for medical research and it awards the Nobel Prize in Medicine. | A medical university that awards the Nobel Prize in Medicine. |
| `data/countries/si.json` | `institutions[2].englishBachelors` | Ten - the widest choice in Slovenia: Tourism; | Ten: Tourism; |
| `data/destinations/ca.json` | `ibRecognition.notes[5]` | the universities appear to be the only rule-owners. | the universities appear to set the rules themselves. |
| `data/institutions/dk-au.json` | `about` | Aarhus is Denmark's second university and second city, with roughly 38,000 students | Aarhus University has roughly 38,000 students |
| `data/dk/au.json` | `about` | Aarhus is Denmark's second university and second city, with roughly 38,000 students | Aarhus University has roughly 38,000 students |
| `data/institutions/dk-cbs.json` | `about` | and they are among the hardest degrees in Denmark to get into on grades alone: | and they are hard to get into on grades alone: |
| `data/dk/cbs.json` | `about` | and they are among the hardest degrees in Denmark to get into on grades alone: | and they are hard to get into on grades alone: |
| `data/institutions/dk-sdu.json` | `about` | and where you study matters more here than at any other Danish university. | and where you study matters a great deal. |
| `data/dk/sdu.json` | `about` | and where you study matters more here than at any other Danish university. | and where you study matters a great deal. |
| `data/institutions/dk-sdu.json` | `about` | or in Vejle, SDU's newest campus and an IT-focused one. | or in Vejle, its newest campus and an IT-focused one. |
| `data/dk/sdu.json` | `about` | or in Vejle, SDU's newest campus and an IT-focused one. | or in Vejle, its newest campus and an IT-focused one. |
| `data/institutions/nl-breda-uas.json` | `about` | It is the clearest example in this catalogue of the route | It is a clear example of the route |
| `data/institutions/nl-erasmus.json` | `about` | in a city rebuilt after 1940 and unlike anywhere else in the Netherlands to look at. | in a city rebuilt after 1940. |
| `data/context-notes/no-language-is-the-obstacle.json` | `text` | several of the largest universities teach no bachelor programme in English at all | several large universities teach no bachelor programme in English at all |
| `data/countries/cn.json` | `institutions[2].note` | Its English-taught MBBS is a well-known English-medium medical degree. | It also teaches an English-medium medical degree, the MBBS. |
| `data/countries/es.json` | `institutions[7].note` | A well-known private business-and-law school in Madrid, with its own admission. | A private business-and-law school in Madrid, with its own admission. |
| `data/countries/kr.json` | `institutions[8].note` | Its well-known Korean-language institute helps | Its Korean-language institute helps |
| `data/countries/nz.json` | `institutions[3].englishBachelors` | a large engineering school and a well-known forestry programme. | a large engineering school and a forestry programme. |
| `data/countries/at.json` | `whyConsider[3]` | Vienna is consistently ranked among the most liveable cities in Europe and student transport and culture are heavily discounted. | In Vienna, student transport and culture are heavily discounted. |
| `data/countries/be.json` | `whyConsider[1]` | KU Leuven, founded in 1425, is one of the oldest universities in Europe, and Ghent | KU Leuven dates from 1425, and Ghent |
| `data/countries/fi.json` | `watchOuts[2]` | Several famous names have almost nothing in English at bachelor level: | Several big universities have almost nothing in English at bachelor level: |
| `data/countries/lu.json` | `watchOuts[4]` | Rents in and around Luxembourg City are among the most expensive in the EU, and student housing is limited. | Rents in and around Luxembourg City are high, and student housing is limited. |
| `data/countries/si.json` | `whyConsider[3]` | University of Primorska in Koper has the widest English-taught choice, including | University of Primorska in Koper has ten English-taught bachelor's, including |

#### Change 2: Denmark (3)

| File | Field | Before | After |
|---|---|---|---|
| `data/context-notes/dk-language-reality.json` | `text` | The University of Copenhagen — the country's largest and best known university — teaches | The University of Copenhagen — founded in 1479, with about 36,800 students — teaches |
| `data/institutions/dk-itu.json` | `about` | ITU is Denmark's smallest and youngest university, founded in 1999 and built around | ITU was founded in 1999, has about 2,900 students, and is built around |
| `data/dk/itu.json` | `about` | ITU is Denmark's smallest and youngest university, founded in 1999 and built around | ITU was founded in 1999, has about 2,900 students, and is built around |

#### Change 3: "not published yet" back to "not confirmed here" (4)

| File | Field | Before | After |
|---|---|---|---|
| `data/countries/si.json` | `watchOuts[2]` | IB-specific minimum points and a mapping onto the Slovenian Matura are not published yet; ask | IB-specific minimum points and a mapping onto the Slovenian Matura are not confirmed here; ask |
| `data/countries/si.json` | `ibRecognition.notes[5]` | IB-specific minimum points, an HL/SL mapping onto the Slovenian Matura and a grade conversion table are not published yet (as of September 2026). | IB-specific minimum points, an HL/SL mapping onto the Slovenian Matura and a grade conversion table are not confirmed here. |
| `data/countries/si.json` | `language.notes[1]` | Whether IB English A or B counts as proof of English, and the IELTS/TOEFL thresholds, are not published yet (as of September 2026). | Whether IB English A or B counts as proof of English, and the IELTS/TOEFL thresholds, are not confirmed here. |
| `data/countries/gr.json` | `institutions[9].note` | tuition is not published, so ask the college. | tuition is not confirmed here, so ask the college. |

#### Change 4: the GB summary that read backwards (1)

| File | Field | Before | After |
|---|---|---|---|
| `data/destinations/gb.json` | `summary` | For an IB student that removes an awkward problem: applying before you know your results. | For an IB student that solves an awkward problem: you know the exact grades you need before you sit the exams. |

#### Change 5: SI Maribor quotes Study in Slovenia (1)

| File | Field | Before | After |
|---|---|---|---|
| `data/countries/si.json` | `institutions[1].note` | Five English-taught bachelor's confirmed, and the only university where private international students can get a dormitory place: Study in Slovenia says they cannot stay in university dormitories "except in Maribor". | Five English-taught bachelor's confirmed, and Study in Slovenia says a "private international student" cannot stay in university dormitories "except in Maribor". |

#### Change 6: research log the first guard missed (29)

| File | Field | Before | After |
|---|---|---|---|
| `data/countries/at.json` | `application.deadlines[0].notes` | Precedent, read in German on medizinstudieren.at on 23 September 2026: registration | Precedent, from medizinstudieren.at (in German, as of 23 September 2026): registration |
| `data/countries/at.json` | `application.deadlines[1].notes` | Precedent, read in German on medizinstudieren.at on 23 September 2026: "Der Aufnahmetest | Precedent, from medizinstudieren.at (in German, as of 23 September 2026): "Der Aufnahmetest |
| `data/countries/fr.json` | `application.deadlines[14].notes` | the CVEC portal, read in French on 2026-09-23, says to pay | the CVEC portal says (in French) to pay |
| `data/countries/si.json` | `application.deadlines[1].notes` | Precedent, read in Slovene from the University of Ljubljana VPIS leaflet on 23 September 2026: | Precedent, from the University of Ljubljana's Slovene VPIS leaflet for 2026: |
| `data/countries/it.json` | `ibRecognition.minimumPoints` | No national minimum points figure was found on an official page; individual universities | No national minimum points figure is confirmed here; individual universities |
| `data/countries/it.json` | `ibRecognition.gradeConversion` | No national IB-to-Italian conversion was found. | A national IB-to-Italian conversion is not confirmed here. |
| `data/countries/it.json` | `application.deadlines[6].notes` | does not appear on any official page cited here, so treat it as unconfirmed. | is not on any official source this page links to, so treat it as unconfirmed. |
| `data/countries/pt.json` | `costs.applicationFee` | No application fee was found for the national contest. | No application fee for the national contest is confirmed here. |
| `data/countries/fi.json` | `institutions[12].note` | its 2027 dates were not on the page when checked. | its 2027 dates are not confirmed here. |
| `data/countries/ee.json` | `institutions[0].note` | Its admissions page on 23 September 2026: for 2026 Tartu admits to 3 English-taught first-level programmes and 25 master's. | For 2026 its admissions page listed 3 English-taught first-level programmes and 25 master's. |
| `data/countries/ee.json` | `institutions[1].note` | Its admissions page on 23 September 2026: international applicants prepare their application in DreamApply; | Its admissions page says international applicants prepare their application in DreamApply; |
| `data/countries/ee.json` | `institutions[4].note` | Its admissions page on 23 September 2026: its three English-taught curricula are two master's and the six-year combined Veterinary Medicine, | Its admissions page lists three English-taught curricula, two master's and the six-year combined Veterinary Medicine, |
| `data/countries/be.json` | `application.deadlines[0].notes` | Read in Dutch on the Flemish government's own site. The exam pages are now at vlaanderen.be/toelatingsexamens. | Source, in Dutch: the Flemish government's exam pages at vlaanderen.be/toelatingsexamens. |
| `data/countries/be.json` | `application.deadlines[1].notes` | Read in Dutch on the Flemish government's own site. The exam pages are now at vlaanderen.be/toelatingsexamens. | Source, in Dutch: the Flemish government's exam pages at vlaanderen.be/toelatingsexamens. |
| `data/countries/be.json` | `application.deadlines[2].notes` | Read in Dutch on the Flemish government's own site. The exam pages are now at vlaanderen.be/toelatingsexamens. | Source, in Dutch: the Flemish government's exam pages at vlaanderen.be/toelatingsexamens. |
| `data/countries/be.json` | `application.deadlines[3].notes` | Read in Dutch on the Flemish government's own site. The exam pages are now at vlaanderen.be/toelatingsexamens. | Source, in Dutch: the Flemish government's exam pages at vlaanderen.be/toelatingsexamens. |
| `data/countries/be.json` | `application.deadlines[4].notes` | Read in Dutch on the Flemish government's own site. The exam pages are now at vlaanderen.be/toelatingsexamens. | Source, in Dutch: the Flemish government's exam pages at vlaanderen.be/toelatingsexamens. |
| `data/countries/hu.json` | `application.deadlines[6].notes` | through FELVI." Read in Hungarian on 23 September 2026. | through FELVI." (felvi.hu is in Hungarian.) |
| `data/countries/kr.json` | `ibRecognition.subjectLevelRule` | None of the university pages cited here publishes a minimum IB point score. | None of the university pages linked from this page publishes a minimum IB point score. |
| `data/destinations/kr.json` | `ibRecognition.subjectLevelRule` | None of the university pages cited here publishes a minimum IB point score, | None of the university pages linked from this page publishes a minimum IB point score, |
| `data/countries/kr.json` | `ibRecognition.notes[2]` | Minimum and typical IB scores are not published on any university page cited here. | Minimum and typical IB scores are not published on any university page linked from this page. |
| `data/countries/pl.json` | `application.deadlines[30].notes` | the individual days are on the examination page cited here. | the individual days are on the university's entrance-examination page. |
| `data/institutions/dk-sea.json` | `meta.notes[2]` | SEA does not publish a tuition fee for non-EU students on the pages read, so no fee is recorded here. | A tuition fee for non-EU students is not confirmed here; ask SEA. |
| `data/institutions/nl-breda-uas.json` | `meta.notes[0]` | The admission pages read on 2026-09-23 set out a havo-or-vwo-equivalent diploma and an English requirement and name no examination subject for any of the four programmes recorded here. That is recorded as checked-and-absent rather than as not-checked. | Its admission pages (as of 23 September 2026) set out a havo-or-vwo-equivalent diploma and an English requirement, and name no examination subject for any of the four programmes on this site. |
| `data/institutions/nl-erasmus.json` | `meta.notes[1]` | Both Erasmus pages read on 2026-09-23 describe the 2026-2027 round. | As of 23 September 2026, both Erasmus pages describe the 2026-2027 round. |
| `data/institutions/nl-erasmus.json` | `meta.notes[1]` | Both records carry a reviewBy date for that reason and neither carries a 2027 figure that the source did not state. | So check both again in autumn 2026; no 2027 figure is given here that the source did not state. |
| `data/institutions/nl-tudelft.json` | `meta.notes[3]` | The Aerospace Engineering selection pages carried last year's procedure when read on 2026-09-23 and say | On 23 September 2026 the Aerospace Engineering selection pages still carried last year's procedure, and said |
| `data/countries/lu.json` | `application.deadlines[1].notes` | Precedent, from the Bachelor in Computer Science admissions page on 23 September 2026: | Precedent, from the Bachelor in Computer Science admissions page (as of 23 September 2026): |
| `data/countries/lu.json` | `application.deadlines[2].notes` | Precedent, from the Bachelor in Computer Science admissions page on 23 September 2026: | Precedent, from the Bachelor in Computer Science admissions page (as of 23 September 2026): |

#### Change 7: the rest of the sweep on HU and EE (2)

| File | Field | Before | After |
|---|---|---|---|
| `data/countries/hu.json` | `ibRecognition.notes[4]` | Corvinus is the most IB-literate institution in Hungary. It names the IB Diploma | Corvinus names the IB Diploma |
| `data/countries/ee.json` | `whyConsider[4]` | Tallinn University's Baltic Film, Media and Arts School describes itself as the only place in northern Europe teaching film, television and audiovisual production in English. | Tallinn University's Baltic Film, Media and Arts School teaches film, television and audiovisual production in English. |

#### Change 8: polish, and cards that opened on a founding year (37)

| File | Field | Before | After |
|---|---|---|---|
| `data/countries/hu.json` | `whyConsider[1]` | two Higher Level natural sciences , and it will consider | two Higher Level natural sciences, and it will consider |
| `data/countries/si.json` | `summary` | If one of those programmes is what you want, you study it without tuition. If not, | If one of those programmes is what you want, you pay no tuition, and a dormitory room, if you can get one, costs EUR 80-250 a month. If not, |
| `data/destinations/si.json` | `summary` |  If one of those is what you want, you study it without tuition. | (deleted) |
| `data/countries/at.json` | `institutions[2].note` | A business and economics university on a modern campus by the Prater. | Its English-taught BBE had 240 places in 2026/27, taught on a modern campus by the Prater. |
| `data/countries/fi.json` | `institutions[9].note` | Thirty-two English-taught listings for the January 2027 cycle, fewer of them open to a school leaver, including creative degrees like game design and XR design. | 32 English-taught options for January 2027, though some are top-up degrees you cannot enter from school; they include game design and XR design. |
| `data/countries/no.json` | `institutions[5].note` | Founded in 1811 — but for an IB student without Norwegian there is exactly one English bachelor's door, | For an IB student without Norwegian there is exactly one English bachelor's door, |
| `data/countries/at.json` | `institutions[0].note` | Founded in 1365; bachelor's teaching is in German, | Its bachelor's teaching is in German, |
| `data/countries/at.json` | `institutions[3].note` | Founded in 1585, in a UNESCO-listed student city | In a UNESCO-listed student city |
| `data/countries/au.json` | `institutions[1].note` | Founded in 1850, on a sandstone campus near central Sydney. | A sandstone campus near central Sydney. |
| `data/countries/ch.json` | `institutions[4].note` | Founded in 1460, German-speaking, at the heart of the Basel pharmaceutical cluster. | German-speaking, at the heart of the Basel pharmaceutical cluster, and known for life sciences and pharmacy. |
| `data/countries/cz.json` | `institutions[0].note` | Founded in 1347, and organised so that the faculty matters more than the name. | Organised so that the faculty matters more than the name. |
| `data/countries/cz.json` | `institutions[2].note` | Founded in 1707, and explicit about the IB: | Explicit about the IB: |
| `data/countries/cz.json` | `institutions[4].note` | Founded in 1573, with English-taught medicine at 12,500 euros a year, | English-taught medicine at 12,500 euros a year, |
| `data/countries/de.json` | `institutions[2].note` | A general research university founded in 1472; bachelor's are almost entirely in German, | A general research university whose bachelor's are almost entirely in German, |
| `data/countries/de.json` | `institutions[3].note` | Founded in 1386, and known for medicine, life sciences, physics and law. | Known for medicine, life sciences, physics and law. |
| `data/countries/ee.json` | `institutions[0].note` | Founded in 1632, with around 15,500 students. | Around 15,500 students, and three English-taught bachelor's: Business Administration, Science and Technology, and a six-year Medicine. |
| `data/countries/fi.json` | `institutions[0].note` | A broad research university founded in 1640, but only two of its bachelor's degrees are in English. | A broad research university, but only two of its bachelor's degrees are in English: Liberal Arts and Sciences, and Science. |
| `data/countries/fr.json` | `institutions[1].note` | An engineering school founded in 1794; its three-year English-taught Bachelor | An engineering school whose three-year English-taught Bachelor |
| `data/countries/gr.json` | `institutions[0].note` | A research university founded in 1837. Its English-taught MD costs EUR 17,000 a year (2026-27), its BA in Ancient Greece EUR 6,000, and it also runs an integrated master in Pharmacy. | Three English-taught degrees: an MD at EUR 17,000 a year (2026-27), a BA in Ancient Greece at EUR 6,000, and an integrated master in Pharmacy. |
| `data/countries/hk.json` | `institutions[0].note` | Founded in 1911, and reviewing applications on a rolling basis until 25 August 2027, after IB results. | Every programme is taught in English, and applications are reviewed on a rolling basis until 25 August 2027, after IB results. |
| `data/countries/hu.json` | `institutions[3].note` | Founded in 1367, and its medical school has already published | Its medical school has already published |
| `data/countries/hu.json` | `institutions[4].note` | Founded in 1787, with veterinary medicine taught in English at 12,480 euros a year. | Veterinary medicine taught in English at 12,480 euros a year, over five years plus a practical semester. |
| `data/countries/hu.json` | `institutions[7].note` | A technical university founded in 1782, with 13 English-taught BSc degrees | A technical university with 13 English-taught BSc degrees |
| `data/countries/hu.json` | `institutions[8].note` | Founded in 1635, a general-academic university in Budapest with a second campus in Szombathely. | A general-academic university in Budapest with a second campus in Szombathely; computer science, economics and mechanical engineering are among its English-taught degrees. |
| `data/countries/ie.json` | `institutions[0].note` | Founded in 1592, on a walled city-centre campus; its high-points courses are hard to reach. | A walled city-centre campus, with every programme taught in English; check each course's points from last year before you shortlist it. |
| `data/countries/is.json` | `institutions[0].note` | Founded in 1911, with around 14,000 students across five schools, and a dedicated IB page. | Around 14,000 students across five schools, and a dedicated IB page. |
| `data/countries/jp.json` | `institutions[3].note` | A private university founded in 1858, and Waseda's historic rival. | A private university and Waseda's historic rival. |
| `data/countries/lt.json` | `institutions[0].note` | Founded in 1579, with more than 30 English-taught bachelor's | More than 30 English-taught bachelor's |
| `data/countries/lv.json` | `institutions[0].note` | Founded in 1919, and clear on its own pages about the AIC recognition requirement. | Clear on its own pages about the AIC recognition requirement, with a small number of English-taught bachelor's in business, IT and social sciences. |
| `data/countries/nl.json` | `institutions[0].note` | Founded in 1632, in a city where finding a student room is hard; | A research university in a city where finding a student room is hard; |
| `data/countries/nl.json` | `institutions[1].note` | A technical university founded in 1842; its English-taught bachelor's | A technical university whose English-taught bachelor's |
| `data/countries/nl.json` | `institutions[5].note` | Founded in 1575, with a second campus in The Hague | Split between Leiden and a second campus in The Hague |
| `data/countries/si.json` | `institutions[0].note` | Founded in 1919, teaching its bachelor's in Slovene; an EU applicant wanting its one English programme should ask the faculty first. | Teaches its bachelor's in Slovene; an EU applicant wanting its one English programme, Business and Economics, should ask the faculty first. |
| `data/countries/at.json` | `institutions[2].note` | Its English-taught BBE had 240 places in 2026/27, taught on a modern campus by the Prater. | On a modern campus by the Prater, with 240 places on its English-taught BBE in 2026/27. |
| `data/countries/se.json` | `institutions[1].note` | and a social life run by the student "nations" - the historic student societies that run much of student life. | and a social life organised around student "nations", the historic societies students can join. |
| `data/countries/jp.json` | `institutions[0].note` | Todai has not opened a new undergraduate faculty in about seventy years; this one runs on a September intake with half its places on the international route; applications close on 5 November 2026. | Todai has not opened a new undergraduate faculty in about seventy years. This one runs on a September intake with half its places on the international route, and applications close on 5 November 2026. |
| `data/countries/no.json` | `institutions[5].note` | With Danish, Norwegian or Swedish A, its Norwegian-taught bachelor's are open through Samordna opptak. | With Danish, Norwegian or Swedish A, the university's Norwegian-taught bachelor's are open through Samordna opptak. |

## Round 3: answering the second critique

This pass answers `follow-ups-41-critique-round-2.md`, which scored round 2 at 7/10. It was done on 2026-09-26, offline, on the branch after main was merged in (it includes the planner's `d0d4ec0`).

Every rewrite uses only what the same record holds. The critique's replacement texts were used where the record supports them. In two places I kept to the record instead:
- **KdG:** the record's `englishBachelors` says "business and multimedia routes". It does not say that Applied Computer Science is taught in English.
- **Hasselt:** "Its fields include…", not "Strong in…".

**Planner-owned files were not touched.** These are `data/institutions/dk-{itu,sdu,au,cbs}.json` and `data/dk/{itu,sdu,au,cbs}.json`. What those files still need is listed under "Handed to the planner agent" below.

**Gate:** `SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs` passes all 37 checks. As before, the advisory `freshness` check reports the age of the evidence.

### Each critique item, and what changed

| # | Critique item | What changed |
|---|---|---|
| 1 | Research log off the university pages | These `meta.notes` are rewritten, in `data/institutions` and `data/dk` together, using the critique's texts: UCPH, AAU, Dania, BUas, Twente, TU Delft, and Maastricht ×2. ITU and SDU are planner-owned and are handed off (see below). |
| 2 | Widen `research-log`; fix IS, LV, PL, EE, MT, US | **New patterns:** "N found", "none found", "<bar/example/scheme/figure/table/score/date/fee> found", "could be found", "page(s) checked", "at the time of checking", "not checked here", "<bachelor's/programme/course> checked", "this pass", "the record holds", `ADR \d{4}`, `docs/`, "critic", "Evidence record", "to a fetch", and a leaked camelCase field name. **Real camelCase names** (eApply, uSis, uOttawa, iSchool, ePortal, eResidence, iGraduate, myCampus) are exempt by name. **Fixtures:** 17 positive and 3 negative. One negative is the IT housing "found through Facebook groups". **Fixed on Destination pages:** the six strings the critique named, plus four more the new patterns found. Those four are AU "A table found on a coaching site", AE and SG "see workRights" (a field name on the page), the Innsbruck source title "44 pages checked", and two I found outside the guard's pages: the Minerva line in the `/guides/` page and the Denmark maritime note. **New `HANDED_OFF` list:** three lines are on planner-owned pages. Each entry names its owner and what to change, and fails once the line is gone, so it cannot outlive the fix. |
| 3 | Widen `superlatives`; the six cards, NTNU and Warwick | **New words in the always-flagged list:** reputation, powerhouse, internationally known/recognised, well-respected, top-tier, elite, "a leading", "a top", "one of only …", "the sole", "than any other", "nowhere else", "rare in Europe", "great universities", "ranked 45th", and flagship. The US "public flagship" is exempt, and so are two proper names, the "6G Flagship" and the "Elite Institute". **Frames:** "the second largest" and "among the very best" are now caught. **The "its" loophole is closed:** "its <-est> university/school/institution/city" is flagged, and "its newest campus" still passes. **Fixtures:** 18 positive and 5 negative. **Result:** the rule found 9 strings, all rewritten, including the six named cards, NTNU, Warwick and the EE summary's "a reputation for teaching in English". |
| 4 | Round-2 regressions | **SI summary:** it now says university dorms take private international students only in Maribor, so budget for the private market. **Tartu:** "first-level degrees … six-year integrated Medicine", and the repeated count is deleted. **EMÜ:** the repeat is gone. **ITU's duplicate "2,900 students"** is planner-owned and handed off. |
| 5 | Place rankings; the canonical Destination records | **Fixed:** CH `housing`; LU `costs.notes[2]` and `housing`; and the EHL line in the distinctive-options guide, which now opens "Founded in Lausanne in 1893". **Canonical records:** `data/destinations/ch` (`whyConsider[0]`, `watchOuts[3]`), `ie` (`watchOuts[4]`), `de` (`whyConsider[1]`) and `lu` (`watchOuts[3]`), so these do not come back when the profiles retire. **Also swept by hand:** the rankings the rule now finds in fields it does not read. These are LV "the most selective route in the country", US "the most famous universities", NZ "Otago is famous for", CA "Waterloo built its reputation" and CN "the domestic elite universities". |
| 6 | Polish | **KdG:** it now names its English-taught routes. **HU Szeged:** "Of the medical schools on this page, Szeged is the one that publishes an IB exemption". **CZ Göteborg:** "a short trip from Denmark". **SDU's "Denmark's newest IT campus"** is planner-owned and handed off. |

### The 144 profile notes that never render

The critique's point stands. For GB, NL, CH, AT, SE, NO, FI and DE, a `data/schools` summary replaces the profile note on both the card and the university page. So round 2's rewrites of those notes are correct but unseen.

Two things now answer it:
- **The research-log guard reads rendered pages,** so it sees the `data/schools` text that students actually get: 506 pages, including every `/universities/` page.
- **The superlatives guard reads `data/schools` `summary`.** I swept `data/schools` `summary` and `notes` with the widened rule. The summaries have 0 hits. The notes have 3, and all three are about the institution itself: "Arcada's fourth English programme", "KI's first intake", "The first place you confirm in Finland". None is a ranking, so none was changed.

The guard still reads the unrendered profile notes as well. They cost nothing to keep clean, and they come back into view if a school record is ever withdrawn.

### Handed to the planner agent (not edited here)

The coordinator said the planner agent owns these files. Each item is from the round-2 critique.

**In both `data/institutions/dk-itu.json` and `data/dk/itu.json`:**
- **`meta.notes[5]`:** delete it. It is the "as read by the round-4 conversion critic on 25 Sep 2026 (docs/research/qa/conversion/critique-round-4.md). No Evidence record holds that page's full URL yet; the levelRaise cites…" note. It is a reviewer note and belongs in the Evidence record or the conversion QA doc. The `research-log` guard carries it in `HANDED_OFF`.
- **`about`:** delete ", with roughly 2,900 students in total" from the third sentence. The first sentence already gives the count.

**In both `data/institutions/dk-sdu.json` and `data/dk/sdu.json`:**
- **`meta.notes[10]`:** delete it, or replace it with "SDU's total student number is not confirmed here." Now: "SDU's own student total was not published in a form that could be verified on the pages checked, so it is left blank here rather than guessed." It is in `HANDED_OFF`.
- **`meta.notes[2]`:** delete 'SDU calls it "Denmark's newest IT campus".' An attribution is not a source.

**In both `data/institutions/dk-cbs.json` and `data/dk/cbs.json`:**
- **`meta.notes[4]`** (in `data/dk/cbs.json` this is `notes[4]`): "Read the quotaNotes before planning around it." puts a schema field name on the page. Suggested: "Read the quota notes below before planning around it." It is in `HANDED_OFF`.

**When each is fixed,** remove its `HANDED_OFF` entry in `scripts/test-research-log.mjs`. The guard fails until you do, by design.

### Still open

- **Item 4, which needs the web:** Warsaw resolution 315.
- **LSMU:** the extra-round sentence still needs a reading of lsmu.lt.
- **Programme pages:** they still render Evidence `interpretation`.
- **Deeper prose:** about 40 comparisons remain in fields neither guard reads, such as `housing`, `steps` and `selectionNotes`. Examples are "by far the easiest route" (dorms in JP and KR) and "the only realistic first-year option" (SG). They compare options for the student, not institutions, and were left alone.

### Every string changed in round 3

Each cell holds the changed phrase, not the whole field.

#### Change 1: research log off the university pages (11)

| File | Field | Before | After |
|---|---|---|---|
| `data/institutions/dk-ucph.json` | `meta.notes[6]` | Tuition fee rates for non-EU/EEA bachelor applicants were not published on the English-language pages checked, so no figure is recorded here. | Tuition fees for non-EU/EEA bachelor applicants are not confirmed here; ask UCPH. |
| `data/dk/ucph.json` | `notes[6]` | Tuition fee rates for non-EU/EEA bachelor applicants were not published on the English-language pages checked, so no figure is recorded here. | Tuition fees for non-EU/EEA bachelor applicants are not confirmed here; ask UCPH. |
| `data/institutions/dk-aau.json` | `meta.notes[4]` | AAU did not publish a quota figure for Energy Engineering on its programme page at the time of checking, although the page describes quota 1 and quota 2 selection. | The quota split for Energy Engineering is not confirmed here; the programme page describes quota 1 and quota 2 selection without figures. |
| `data/dk/aau.json` | `notes[4]` | AAU did not publish a quota figure for Energy Engineering on its programme page at the time of checking, although the page describes quota 1 and quota 2 selection. | The quota split for Energy Engineering is not confirmed here; the programme page describes quota 1 and quota 2 selection without figures. |
| `data/institutions/dk-dania.json` | `meta.notes[1]` | Its specific entry requirement is still English B, and that is what the record holds. | Its specific entry requirement is still English B, so plan on English B. |
| `data/dk/dania.json` | `notes[2]` | Its specific entry requirement is still English B, and that is what the record holds. | Its specific entry requirement is still English B, so plan on English B. |
| `data/institutions/nl-breda-uas.json` | `meta.notes[2]` | The step-by-step panels on the BUas programme application pages load their contents by script and return nothing to a fetch or to a DOM read. The selection detail recorded here comes from the regulation PDF instead, which is better evidence anyway. | The selection details here come from BUas's admission regulation (PDF). |
| `data/institutions/nl-utwente.json` | `meta.notes[1]` | Twente is the only institution in this pass that writes requirements three different ways on three programme pages: Advanced Technology in IB terms, Technical Computer Science on the Dutch VWO scale, Creative Technology with no subject at all. The three records preserve that difference instead of smoothing it. | Twente writes requirements three different ways on three programme pages: Advanced Technology in IB terms, Technical Computer Science on the Dutch VWO scale, Creative Technology with no subject at all. So read your own programme's page, not a sibling's. |
| `data/institutions/nl-tudelft.json` | `meta.notes[0]` | TU Delft publishes its IB entry requirements in IB terms and in a single table covering every BSc programme, which is the cleanest example found in the Netherlands of the pattern ADR 0002 predicts: no local scale, no conversion, nothing to translate. | TU Delft publishes its IB entry requirements in IB terms, in one table covering every BSc programme: no local scale and no conversion. |
| `data/institutions/nl-maastricht.json` | `meta.notes[0]` | in IB terms — the same pattern as TU Delft and the same conclusion for ADR 0002: nothing to translate. | in IB terms, as TU Delft does: nothing to convert. |
| `data/institutions/nl-maastricht.json` | `meta.notes[1]` | The three programmes recorded here were chosen because they differ in admission regime rather than in subject: | The three programmes here differ in admission regime: |

#### Change 2: what the widened research-log guard found (13)

| File | Field | Before | After |
|---|---|---|---|
| `data/countries/is.json` | `language.englishTaughtBachelors` | Three found. At the University of Iceland, | Three. At the University of Iceland, |
| `data/countries/lv.json` | `institutions[8].englishBachelors` | None found | None confirmed here |
| `data/countries/lv.json` | `funding[0]` | SSE Riga runs the most substantial scholarship scheme found: | SSE Riga runs a large scholarship scheme: |
| `data/countries/pl.json` | `language.englishProof` | sets the highest bar found at IELTS 6.5, | sets a higher bar: IELTS 6.5, |
| `data/countries/ee.json` | `ibRecognition.notes[2]` | No Estonian institution publishes a minimum IB point score, and no IB-to-Estonian grade conversion table could be found. If you need one, ask Harno, Estonia's recognition centre. | A minimum IB score and an IB-to-Estonian grade conversion are not confirmed here for any Estonian institution; if you need one, ask Harno, Estonia's recognition centre. |
| `data/countries/mt.json` | `costs.tuitionEuEea.value` | for the full-time bachelor's checked: | for the full-time bachelor's listed here: |
| `data/countries/us.json` | `funding[0]` | but were not checked here | but are not confirmed here |
| `data/countries/au.json` | `ibRecognition.notes[3]` | A table found on a coaching site or remembered from a sibling's year | A table on a coaching site, or one remembered from a sibling's year, |
| `data/countries/ae.json` | `funding[5]` | — see workRights. | — see 'Living there' below. |
| `data/countries/sg.json` | `funding[7]` | — see workRights. | — see 'Living there' below. |
| `data/schools/at-uni-innsbruck.json` | `sources[1].title` | Bachelor's programmes (44 pages checked for language of instruction) | Bachelor's programmes (the language of instruction is on each programme's page) |
| `data/topics/distinctive-options.json` | `options[0].deadlineNote` | Deadlines were not published on the pages we read — check minerva.edu from September 2026. | Deadlines are not confirmed here — check minerva.edu from September 2026. |
| `data/destinations/dk.json` | `sectorLandscape.routes[4].note` | Not yet researched in detail here. Recorded because it exists and is named by the Agency, not because we can currently advise on it. | Not covered in detail on this site; it is listed because the Agency names it. Ask the institutions directly. |

#### Change 3: praise the widened superlatives rule found (9)

| File | Field | Before | After |
|---|---|---|---|
| `data/countries/be.json` | `institutions[4].note` | Small and young, with a strong reputation for teaching quality and a much lower cost of living than the big student cities. | Every bachelor's is taught in Dutch; English starts at master's level. Its fields include biomedical sciences, architecture, mobility sciences and data science, with a much lower cost of living than the big student cities. |
| `data/countries/be.json` | `institutions[12].note` | Its game development programme is internationally known and taught in English, which makes Howest an outlier in the Belgian bachelor landscape. | Its Digital Arts and Entertainment bachelor's, a game-development degree, is taught in English. |
| `data/countries/nl.json` | `institutions[6].note` | The business and economics powerhouse; | Business and economics at its core: |
| `data/countries/kr.json` | `institutions[8].note` | A small Jesuit university in Seoul with a reputation for rigour. | A small Jesuit university in Seoul. Some business, economics and international studies courses are in English; check yours with the university. |
| `data/countries/pt.json` | `institutions[5].note` | A public university in central Lisbon with a strong social-science and business focus and a practical, employment-oriented reputation. | A public university in central Lisbon focused on management, sociology, data science and international studies, with some English-taught teaching in management and international studies. |
| `data/countries/pt.json` | `institutions[9].note` | A modern campus university with a strong engineering and materials reputation, in a small coastal city. | A modern campus university in a small coastal city, focused on engineering, materials science, telecommunications and marine sciences; little is taught in English at bachelor level. |
| `data/countries/no.json` | `institutions[8].note` | Norway's engineering powerhouse and its largest university, with a Nobel-winning neuroscience institute. | An engineering-led university in Trondheim, with a Nobel-winning neuroscience institute. |
| `data/countries/gb.json` | `institutions[11].note` | A campus university with a formidable maths and economics reputation; | A campus university known for mathematics and economics; |
| `data/countries/ee.json` | `summary` | Estonia has a reputation for teaching in English, and at master's level that is true. | Estonia is often described as teaching in English, and at master's level that is true. |

#### Change 4: round-2 regressions (4)

| File | Field | Before | After |
|---|---|---|---|
| `data/countries/si.json` | `summary` | If one of those programmes is what you want, you pay no tuition, and a dormitory room, if you can get one, costs EUR 80-250 a month. | If one of those programmes is what you want, you pay no tuition, but university dorms take private international students only in Maribor, so budget for the private market. |
| `data/countries/ee.json` | `institutions[0].note` | Around 15,500 students, and three English-taught bachelor's: Business Administration, Science and Technology, and a six-year Medicine. | Around 15,500 students, and three English-taught first-level degrees: Business Administration, Science and Technology, and a six-year integrated Medicine. |
| `data/countries/ee.json` | `institutions[0].note` |  For 2026 its admissions page listed 3 English-taught first-level programmes and 25 master's. | (deleted) |
| `data/countries/ee.json` | `institutions[4].note` | Its admissions page lists three English-taught curricula, two master's and the six-year combined Veterinary Medicine, applied for through DreamApply, with | It is applied for through DreamApply, with |

#### Change 5: place rankings, and the canonical Destination records (14)

| File | Field | Before | After |
|---|---|---|---|
| `data/countries/ch.json` | `housing` | Zurich, Geneva and Lausanne have some of the tightest and most expensive rental markets in Europe, and student halls | Zurich, Geneva and Lausanne have tight, expensive rental markets, and student halls |
| `data/countries/lu.json` | `costs.notes[2]` | Luxembourg has one of the highest costs of living in the EU, driven mainly by rent. | Living costs in Luxembourg are high, driven mainly by rent. |
| `data/countries/lu.json` | `housing` | The country has one of the most expensive rental markets in the EU and the student population | The country has an expensive rental market, and the student population |
| `data/topics/distinctive-options.json` | `options[7].what` | The oldest hospitality school in the world, founded in Lausanne in 1893, and part of | Founded in Lausanne in 1893, and part of |
| `data/destinations/ch.json` | `whyConsider[0]` | ETH Zurich and EPFL are world-class, at a fraction of UK or US tuition. | ETH Zurich and EPFL teach science and engineering at a fraction of UK or US tuition. |
| `data/destinations/ch.json` | `watchOuts[3]` | Living costs are among the highest in Europe. | Living costs are high. |
| `data/destinations/ie.json` | `watchOuts[4]` | Dublin rents are among the highest in Europe and student accommodation is genuinely scarce. | Dublin rents are high and student accommodation is genuinely scarce. |
| `data/destinations/de.json` | `whyConsider[1]` | The largest higher education system in the EU, with real strength across | A large higher education system, with real strength across |
| `data/destinations/lu.json` | `watchOuts[3]` | Luxembourg is one of the most expensive places in the EU to rent. | Rent in Luxembourg is high. |
| `data/countries/lv.json` | `application.selectionNotes` | SSE Riga is the most selective route in the country: it requires | SSE Riga is selective: it requires |
| `data/countries/us.json` | `application.selectionNotes` | International admit rates at the most famous universities are in the low single digits; | International admit rates at the most selective universities are in the low single digits; |
| `data/countries/nz.json` | `housing` | Otago is famous for its all-in residential first year in Dunedin. | Otago runs an all-in residential first year in Dunedin. |
| `data/countries/ca.json` | `whyConsider[1]` | - Waterloo built its reputation on this. | - Waterloo is built around it. |
| `data/countries/cn.json` | `language.englishTaughtBachelors` | The domestic elite universities offer only a handful, | The Chinese-run universities listed here offer only a handful, |

#### Change 6: polish (3)

| File | Field | Before | After |
|---|---|---|---|
| `data/countries/be.json` | `institutions[10].note` | A clearly signposted application route for its English-taught bachelor's. | Several English-taught bachelor's, including business and multimedia routes, with a clearly signposted application route. |
| `data/countries/hu.json` | `ibRecognition.notes[3]` | Szeged publishes an IB exemption: grade 5 | Of the medical schools on this page, Szeged is the one that publishes an IB exemption: grade 5 |
| `data/countries/cz.json` | `institutions[10].note` | runs an entrance exam venue in Göteborg, in Sweden. | runs an entrance exam venue in Göteborg, a short trip from Denmark. |

## Round 4: answering the third critique

This pass answers `follow-ups-41-critique-round-3.md`, which scored round 3 at 7/10. It was done on 2026-09-26, offline, on the worktree fast-forwarded to main `b417cdd`.

**The critique's structural point was right.** Both guards caught the phrasings critics had quoted, not the class. So this round changes the guards' method before it changes the data:
- **The research-log guard** now flags the repository's own vocabulary, whatever sentence it sits in. It also reads every page a student reads.
- **The superlatives guard** now reads the prose beside the cards, not only the cards.

Every data rewrite uses only what its own record holds. The one exception is changing wording to the site's "not confirmed here" convention.

**Gate:** `SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs` passes all 37 checks. As before, the advisory `freshness` check reports the age of the evidence.

### The owner's decision: "Known for …" / "Strong in …"

The owner wants each school to say what it is known for and what it is like. So "Known for <subjects>" and "Strong in <subjects>" are now house style, written into the header of `scripts/test-superlatives.mjs`. The phrase is allowed when what follows is the subjects, programmes or features the record itself lists (`notableFields`, `knownFor`, the programme list). It is not allowed when what follows is praise. The rule flags "known / famous / noted / renowned / respected for" followed by excellence, quality, high standards, reputation, prestige, rigour, outstanding or strength, and "a strong reputation / standing / name".

Four fixtures cover each side:
- **Allowed:** "Known for marine and climate science", "Strong in food, pharma and life sciences", "Known for film, drama and the performing arts", and Warwick's "known for mathematics and economics".
- **Flagged:** "Known for excellence in teaching", "Known for its rigour", "Well known for its prestigious law school", and "A strong reputation for teaching quality".

**Consequences for the cards:**
- **Warwick** keeps "known for mathematics and economics". The critique's rewrite is not needed under the owner's rule.
- **NTNU** now reads "known for engineering, neuroscience, architecture and the natural sciences", which is its `notableFields`. The "Nobel-winning" clause is gone because the record does not support it.

### The Evidence template (`src/lib/primitives.mjs` `evidenceBlock`)

**`interpretation` is no longer rendered.** It is the researcher's account of how a source was read. `docs/PARALLEL_WORK.md` names it as the place for that account, and it is written for reviewers. On `/prepare/` it showed students "This corrects data/ib-conversion.json… Our file said…". On `/programmes/` it produced about 150 lines of the same register. The claim and the excerpt remain; they are the student's version.

Two things follow:
- **The Evidence records are unchanged.** That includes `dk-national.json` `[11]` and `[2]`, which the critique asked to be rewritten. Their text no longer renders, and reviewers still have it.
- **`data/ib-conversion.json`** no longer carries the wrong "hf-enkeltfag or GSK" sentence. I checked: 0 matches.

**The verification state is kept, in words, once.** "Status: needs-review." after every source was the schema's enum, repeated 210 times on a Destination page. It is replaced by the evidence-policy label: "Not yet checked by a person", "Past its review date", "Sources disagree" and so on. It is shown once per disclosure when every source there shares a state, and on each source when they differ. The product's honesty rule, that the verification state is visible, still holds. It now uses the same words as the rest of the site.

### Each critique item, and what changed

| # | Critique item | What changed |
|---|---|---|
| 1 | Research log off the guarded pages and `/prepare/` | **Rewritten with the critique's texts:** SE `deadlines[4]` and the Erasmus IBIS note (`meta.notes[0]`). **`/prepare/`** is clean through the template change above. **Attributions:** `nl-english-narrowing` now names the bill and "institutions' own announcements". `no-language-is-the-obstacle` now cites "Samordna opptak's published rules, and a count of English-taught Norwegian bachelor programmes". Neither cites "this project" any more. |
| 2 | Gap wording on Destination pages, and siblings | **By rule (70 strings, summarised after this table):** every "Not researched …" route note (25), the 14 "year here is inferred from the intake this profile covers" deadline notes, the card year labels "inferred from the 2026 calendar", the school calendar labels "(page gives no year)", and "Verified example(s)". **By hand (61 strings):** every "Listed/Recorded because/so" note; the critique's NL, LV, JP and DK notes; "Verified …" wherever no person verified anything; the eight "not verified" guide lines, now "not confirmed here"; "this catalogue" and "the model" on programme pages and in programme summaries; LT "this profile sends you to first"; and HU "the only route in this profile". |
| 3 | The 16 live rankings; widen `superlatives` | **All 16 rewritten,** with the critique's texts where the record supports them. Where a critique text was itself a superlative, I used something plainer: US "at the most selective" became "at some of them", and GB "the closest thing in the UK" became "the UK route to look at". **14 more** were found once the guard read the new fields; all rewritten. **New fields read:** countries `whyConsider`; destinations `whyConsider`, `sectorLandscape.summary` and `routes[].what`/`.note`; `context-notes` `text`; and the guide's `options[].what`/`whoItSuits`. **New phrasings flagged:** not find elsewhere, far better regarded, pioneered, second to none, unrivalled, world leader, often described as, highly rated, household name, go-to, punches above its weight, "ranks 12th", and "known for" + praise. **New `NOT_A_RANKING` list (16 entries):** each is a superlative about a fee, a scale, a rule, a student's own experience, or a comparison scoped to the page's own list. Examples are "the only compulsory payment is the ÖH fee", "the top of the Norwegian scale" and "of the five universities covered here". Each entry says why, and a stale entry fails the guard. **Two `ALLOW` entries added** for the LU destination record's "only public university", from the same Ministry evidence as the profile. **`ALLOW[0]`** now says the Estonian count is counted from the national list, instead of quoting the researcher's claim as the page's words. |
| 4 | Widen `research-log`; read every student page | **The rule moved to a new file, `scripts/lib/research-log.mjs`,** in two halves. **Phrases:** every form a critic has quoted. **Vocabulary:** "this profile / project / record / pass / audit / catalogue / dataset", "the model / schema", "our file / sentence / research / record", `data/…` paths, `*.json`, `ev-xx-…` ids, snake_case and camelCase field names, "(not / never) researched / verified", "Recorded / Listed because / so", and "inferred from". **Exemptions:** the page's own furniture is blanked out before matching. That covers the research-depth tier label "Researched in depth", the home page's "Also researched:", and URLs (so `fechas_clave` in a link is not a field name). The student's own "have your documents verified" and "results verified electronically" are exempt too. **Pages read:** 598, every page in `dist/` except the four method pages (`/trust/`, `/counsellors/`, `/about/` and `/credits/`), which describe the method on purpose. That includes the home page, `/prepare/`, the guides, `/compare/`, `/faq/`, `/glossary/`, `/timeline/`, and every university and programme page. **Fixtures:** 31 new positive ones, covering every phrasing the critique listed as missed, plus the round-4 forms. There are 8 new negative ones. |
| 5 | Carry round 3's fixes to their siblings | **Rewritten:** `destinations/ca` `whyConsider[3]`; `destinations/nz` "Otago is famous" (now "runs"); SI `whyConsider[1]`, where the dorm price is gone and the dorms-only-in-Maribor fact is in; the EE summary, now "Estonia teaches many master's degrees in English; at bachelor's level the choice is small"; and NTNU (see above). **Warwick:** kept, under the owner's house style. |
| 6 | Polish | **Done:** McMaster `englishBachelors` (no longer "pioneered"; it now describes problem-based learning across programmes); VGTU (ends at "an aviation engineering programme"); Chung-Ang (the actors clause is deleted); Dania ×2 (the critique's sentence); `ALLOW[0]`'s source (see change 3); and the "Status:" template line (see above). **Not changed:** Guelph's `englishBachelors` "with particular strength in agriculture, food…" stays, as house style (the subjects are the record's own). |

### Still open

- **Item 4, which needs the web:** Warsaw resolution 315.
- **LSMU:** the extra-round sentence still needs a reading of lsmu.lt.
- **Unrendered text:** notes in `data/opportunities` `meta.notes` and some `requirements[].note` still use "this catalogue" or "the model". The rendered-page guard confirms none of them reaches a student page. The same goes for the destination records' `meta.notes` ("MODEL FRICTION", "ADR 0002"). These are the research notes `docs/PARALLEL_WORK.md` puts there, and they were left alone.
- **Deeper prose the superlatives guard still does not read:** `watchOuts`, deadline notes, `housing`, `steps` and `selectionNotes`. As in round 3, what remains there compares options for the student, such as "by far the easiest route" for dorms. The research-log guard does read them, because it reads rendered pages.

### Every string changed in round 4

Each cell holds the changed phrase, not the whole field. The rule-based changes are grouped by rule at the end.

#### Change 1: research log on the guarded pages and /prepare/ (4)

| File | Field | Before | After |
|---|---|---|---|
| `data/countries/se.json` | `application.deadlines[4].notes` | Master's results come a week earlier, on 1 April — that date is context here rather than a milestone of its own, because nothing on this profile is a master's application. | Master's results come a week earlier, on 1 April. |
| `data/institutions/nl-erasmus.json` | `meta.notes[0]` | The IBIS institute code 034892 is RSM's, published on RSM's own admission page for graduated applicants who want their IB results verified electronically. It is recorded at institution level because that is where the model holds codes, but it was published by the school rather than by the university. | The IBIS institute code 034892 is published on the admission page of RSM, Erasmus's business school, for graduated applicants who want their IB results verified electronically. RSM publishes it; the university itself does not. |
| `data/context-notes/nl-english-narrowing.json` | `attribution` | The Internationalisation in Balance bill and institutions’ announced responses, as recorded in this project’s country research | The Internationalisation in Balance bill and institutions’ own announcements |
| `data/context-notes/no-language-is-the-obstacle.json` | `attribution` | This project’s own survey of Norwegian bachelor provision, September 2026 | Samordna opptak’s published rules, and a count of English-taught Norwegian bachelor programmes, September 2026 |

#### Change 2: gap wording, "Listed/Recorded because", "Verified", "this catalogue", "the model" (61)

| File | Field | Before | After |
|---|---|---|---|
| `data/destinations/nl.json` | `sectorLandscape.routes[3].note` | Not covered in detail on this site. Recorded because it exists and because a student who needs it will not find it in the ordinary listings. | Not covered in detail on this site; these schools do not appear in the ordinary programme listings, which is why they are named here. |
| `data/destinations/lv.json` | `sectorLandscape.routes[3].note` | Recorded so the route is visible. Not covered for international applicants on this site. | Not covered for international applicants on this site. |
| `data/destinations/jp.json` | `sectorLandscape.routes[4].note` | The newest category in the Japanese system and the least documented in English. Listed so that the route is visible. | A recent category in the Japanese system, with little documentation in English. |
| `data/destinations/dk.json` | `sectorLandscape.routes[4].note` | Not covered in detail on this site; it is listed because the Agency names it. Ask the institutions directly. | Not covered in detail on this site; the Agency names it as part of the sector. Ask the institutions directly. |
| `data/destinations/ae.json` | `sectorLandscape.routes[1].note` | Listed because a student who would suit it will not otherwise hear of it. | A student who would suit it may not otherwise hear of it. |
| `data/destinations/au.json` | `sectorLandscape.routes[1].note` | Listed because the category exists and a student will meet the phrase. | You will meet the phrase. |
| `data/destinations/au.json` | `sectorLandscape.routes[5].note` | Listed because it is what an agent will offer a student whose predicted score is short, and because it costs a year. | It is what an agent will offer a student whose predicted score is short, and it costs a year. |
| `data/destinations/ca.json` | `sectorLandscape.routes[1].note` | Listed because it exists and is easy to overlook. Two cautions: | Easy to overlook. Two cautions: |
| `data/destinations/de.json` | `sectorLandscape.routes[4].note` | Taught in German. Recorded because it is the route that exists when the KMK rule has not been satisfied. | Taught in German. It is the route that exists when the KMK rule has not been satisfied. |
| `data/destinations/gb.json` | `sectorLandscape.routes[3].note` |  Recorded so that the restriction is visible rather than discovered late. | (deleted) |
| `data/destinations/jp.json` | `sectorLandscape.routes[2].note` | Listed because it has no European equivalent and is rarely mentioned in English-language advice. | It is rarely mentioned in English-language advice. |
| `data/destinations/kr.json` | `sectorLandscape.routes[1].note` | ; it is listed because a student who needs it will not find it in the ordinary listings. | ; a student who needs it will not find it in the ordinary listings. |
| `data/destinations/no.json` | `sectorLandscape.routes[3].note` | Taught in Norwegian. Recorded because it is a real tier of Norwegian post-secondary education, not because it is a realistic route from an IB. | Taught in Norwegian. A real tier of Norwegian post-secondary education, but not a realistic route from an IB. |
| `data/destinations/nz.json` | `sectorLandscape.routes[2].note` | Listed because it is unique to New Zealand and rarely appears in guidance for international undergraduates. | It rarely appears in guidance for international undergraduates. |
| `data/destinations/se.json` | `sectorLandscape.routes[3].note` | Recorded because it is a real and commonly-taken route that no international guidance mentions. Mostly taught in Swedish. | A real and commonly taken route that international guidance rarely mentions. Mostly taught in Swedish. |
| `data/destinations/sg.json` | `sectorLandscape.routes[3].note` | Listed because the route exists, is large, and explains why SIT's admissions calendar | The route is large, and it explains why SIT's admissions calendar |
| `data/destinations/us.json` | `sectorLandscape.routes[5].note` | Not covered in detail here. Listed because a student who needs it will not find it in the ordinary listings. | Not covered in detail on this site; a student who needs it will not find it in the ordinary listings. |
| `data/destinations/us.json` | `sectorLandscape.routes[6].note` | Listed because a student searching online will often meet it first. | A student searching online will often meet it first. |
| `data/countries/cn.json` | `application.deadlines[11].notes` | Listed because of where it sits rather than because anything in China is waiting for it. | This date matters for where it sits, not because anything in China is waiting for it. |
| `data/countries/jp.json` | `funding[0]` | It is listed because people ask about it, not because it is available: | It is here because people ask about it; it is not available: |
| `data/countries/mt.json` | `application.deadlines[2].notes` | Listed so that the IB deadline above is visible as the concession it is: | It shows the IB deadline above for the concession it is: |
| `data/countries/pt.json` | `application.deadlines[14].notes` | It is listed because it falls in this window and is easy to mistake for an EU-open one. | It falls in this window and is easy to mistake for an EU-open one. |
| `data/countries/lt.json` | `application.deadlines[4].notes` | Vilnius University is the university this profile sends you to first. | Vilnius University comes first on this page. |
| `data/countries/hu.json` | `application.deadlines[2].notes` | This is the only route in this profile that starts in February | This is the only route on this page that starts in February |
| `data/application-routes/nl-breda-uas-selection-2027.json` | `milestones[0].note` | The year is inferred from the regulation's stated academic year | The year is taken from the regulation's stated academic year |
| `data/countries/ca.json` | `costs.tuitionNonEu.value` | Verified for 2026/27 at UBC: | At UBC, for 2026/27: |
| `data/destinations/ca.json` | `feeContext[1].typicalRange` | Verified at UBC for 2026/27: | At UBC, for 2026/27: |
| `data/countries/cz.json` | `language.englishTaughtBachelors` | At bachelor's level, verified counts include | At bachelor's level, counts include |
| `data/countries/cz.json` | `costs.tuitionNonEu.value` | Verified gaps: | Examples: |
| `data/countries/cz.json` | `costs.applicationFee` | Verified: 500 CZK | Examples: 500 CZK |
| `data/countries/fi.json` | `funding[3]` | Verified waivers run | Waivers run |
| `data/countries/nz.json` | `ibRecognition.notes[0]` | Verified guaranteed-entry rank scores | Guaranteed-entry rank scores |
| `data/countries/nz.json` | `costs.tuitionNonEu.year` | 2026 (verified) and 2027 (indicative) | 2026 (published) and 2027 (indicative) |
| `data/countries/pl.json` | `costs.livingCostMonthly.value` | contradicted by verified 2026/27 dormitory rates of 670-1,270 PLN at the Jagiellonian. | contradicted by the Jagiellonian's own 2026/27 dormitory rates of 670-1,270 PLN. |
| `data/countries/pl.json` | `costs.livingCostMonthly.year` | dormitory figures verified for 2026/27 | dormitory figures from 2026/27 rates |
| `data/topics/distinctive-options.json` | `options[11].cost` | None of these figures is verified; ask each school for a quote. | None of these figures is confirmed here; ask each school for a quote. |
| `data/topics/distinctive-options.json` | `options[13].cost` | — that could not be verified here. | — that is not confirmed here. |
| `data/topics/distinctive-options.json` | `options[3].cost` | Individual colleges were not verified. | Individual colleges' fees are not confirmed here. |
| `data/topics/distinctive-options.json` | `options[5].cost` | Amounts vary by programme and were not verified here. | Amounts vary by programme and are not confirmed here. |
| `data/topics/distinctive-options.json` | `options[6].cost` | Figures were not verified from an official page. | These figures are not confirmed here. |
| `data/topics/distinctive-options.json` | `options[9].deadlineNote` | Fees were not verified — request the fee schedule from admissions. | Fees are not confirmed here — request the fee schedule from admissions. |
| `data/topics/distinctive-options.json` | `options[10].cost` | Individual figures not verified. | Individual figures are not confirmed here. |
| `data/topics/distinctive-options.json` | `options[14].cost` | Not verified. Duke Kunshan offers | Not confirmed here. Duke Kunshan offers |
| `data/topics/distinctive-options.json` | `options[15].deadlineNote` | Not verified. Check xjtlu.edu.cn | Not confirmed here. Check xjtlu.edu.cn |
| `data/topics/distinctive-options.json` | `options[12].whoItSuits` | For the destinations in this dataset, | For the destinations on this site, |
| `data/opportunities/nl-breda-uas-applied-data-science-and-ai-2027-autumn.json` | `requirements[0].alternativeRoute` | Breda is the only institution in this catalogue whose own rules open a door before you turn 21. | Breda's own rules open a door before you turn 21. |
| `data/opportunities/nl-breda-uas-applied-data-science-and-ai-2027-autumn.json` | `requirements[0].note` | and the model has no requirement kind that says 'a qualification at this level'. It is recorded as a full IB Diploma because that is what this site's readers hold and because it certainly clears the bar. | and this site cannot state 'a qualification at this level', so it shows a full IB Diploma, which is what this site's readers hold and which certainly clears the bar. |
| `data/opportunities/nl-breda-uas-creative-business-2027-autumn.json` | `requirements[0].alternativeRoute` | Breda is the only institution in this catalogue whose own rules open a door before you turn 21. | Breda's own rules open a door before you turn 21. |
| `data/opportunities/nl-breda-uas-creative-business-2027-autumn.json` | `requirements[0].note` | and the model has no requirement kind that says 'a qualification at this level'. It is recorded as a full IB Diploma because that is what this site's readers hold and because it certainly clears the bar. | and this site cannot state 'a qualification at this level', so it shows a full IB Diploma, which is what this site's readers hold and which certainly clears the bar. |
| `data/opportunities/nl-breda-uas-creative-media-and-game-technologies-2027-autumn.json` | `requirements[0].alternativeRoute` | Breda is the only institution in this catalogue whose own rules open a door before you turn 21. | Breda's own rules open a door before you turn 21. |
| `data/opportunities/nl-breda-uas-creative-media-and-game-technologies-2027-autumn.json` | `requirements[0].note` | and the model has no requirement kind that says 'a qualification at this level'. It is recorded as a full IB Diploma because that is what this site's readers hold and because it certainly clears the bar. | and this site cannot state 'a qualification at this level', so it shows a full IB Diploma, which is what this site's readers hold and which certainly clears the bar. |
| `data/opportunities/nl-breda-uas-hotel-management-2027-autumn.json` | `requirements[0].alternativeRoute` | Breda is the only institution in this catalogue whose own rules open a door before you turn 21. | Breda's own rules open a door before you turn 21. |
| `data/opportunities/nl-breda-uas-hotel-management-2027-autumn.json` | `requirements[0].note` | and the model has no requirement kind that says 'a qualification at this level'. It is recorded as a full IB Diploma because that is what this site's readers hold and because it certainly clears the bar. | and this site cannot state 'a qualification at this level', so it shows a full IB Diploma, which is what this site's readers hold and which certainly clears the bar. |
| `data/opportunities/nl-erasmus-international-business-administration-2027-autumn.json` | `requirements[0].alternativeRoute` | This is the one Dutch record in this catalogue where the institution answers the question by name, and the answer is no: | Here the institution answers the question by name, and the answer is no: |
| `data/opportunities/nl-erasmus-international-business-administration-2027-autumn.json` | `requirements[0].note` | which makes this the clearest published refusal of Course Results in this catalogue, and a researched no rather than a silence. | so for Course Results the answer is a published no, not a silence. |
| `data/opportunities/nl-erasmus-international-business-administration-2027-autumn.json` | `requirements[2].note` | The exemption has a second condition the model cannot express: | The exemption has a second condition: |
| `data/programmes/nl-breda-uas-creative-business.json` | `summary` | Its selection procedure is the most explicitly scored in this catalogue: a published points rubric across | Its selection procedure is scored on a published points rubric across |
| `data/programmes/nl-erasmus-economics-and-business-economics.json` | `summary` | It is one of the largest English-taught economics cohorts in Europe, and it is also the programme in this catalogue that states its IB entry rule most precisely: | It states its IB entry rule precisely: |
| `data/programmes/nl-tudelft-nanobiology.json` | `summary` | It asks for more IB science than anything else in this catalogue — | It asks for a lot of IB science — |
| `data/programmes/nl-utwente-technical-computer-science.json` | `summary` | It is also the programme in this catalogue that will not tell you in IB terms whether your mathematics is enough: | It does not tell you in IB terms whether your mathematics is enough: |
| `data/countries/ie.json` | `costs.livingCostMonthly.value` | (an annual figure; the page gives no monthly one) | (an annual figure; TCD gives no monthly one) |

#### Change 3: rankings in the prose beside the cards (30)

| File | Field | Before | After |
|---|---|---|---|
| `data/destinations/gr.json` | `sectorLandscape.routes[2].what` | The American College of Greece (Deree) is the best known. | The American College of Greece (Deree) is one. |
| `data/destinations/se.json` | `sectorLandscape.routes[2].what` | Konstfack, the Royal Institute of Art and the Stockholm University of the Arts are the best known. | They include Konstfack, the Royal Institute of Art and the Stockholm University of the Arts. |
| `data/destinations/se.json` | `sectorLandscape.summary` | but it teaches bachelor degrees of the same standing, and several are highly regarded. | but it teaches bachelor degrees of the same standing. |
| `data/destinations/no.json` | `sectorLandscape.routes[2].what` | Some of the strongest teaching in the country is here, and it is invisible if you only look at the universities. | They are easy to miss if you only look at the universities. |
| `data/destinations/de.json` | `sectorLandscape.routes[2].note` | Worth knowing it exists, because for the right student it is the strongest version of what Germany offers. | Worth knowing it exists. |
| `data/destinations/de.json` | `sectorLandscape.routes[1].what` | Excellent for engineering and business, and far better regarded by German employers than the English translation suggests. | Many of their degrees are in engineering and business. |
| `data/destinations/lt.json` | `sectorLandscape.routes[1].what` | Kauno kolegija, one of the largest, admits | Kauno kolegija, for example, admits |
| `data/destinations/us.json` | `sectorLandscape.routes[1].note` | The best known are highly selective, | Many are highly selective, |
| `data/destinations/us.json` | `sectorLandscape.routes[0].what` | Admission is holistic, opaque and at the famous names in the low single digits for international appl | Admission is holistic, opaque and at some of them in the low single digits for international appl |
| `data/destinations/au.json` | `sectorLandscape.routes[2].note` | Some of these providers are excellent and some are not registered to enrol international students at all. | Some of these providers are registered to enrol international students and some are not. |
| `data/destinations/gb.json` | `sectorLandscape.routes[1].what` | this is the closest thing in the UK to what they are after. | this is the UK route to look at. |
| `data/destinations/is.json` | `sectorLandscape.routes[0].what` | The University of Iceland in Reykjavík, the largest and broadest, and the University of Akureyri in the north. | The University of Iceland in Reykjavík, and the University of Akureyri in the north. |
| `data/destinations/kr.json` | `sectorLandscape.routes[3].note` | because it is the clearest example of a route that exists and is not open to this reader: | because it is an example of a route that exists and is not open to this reader: |
| `data/destinations/lv.json` | `whyConsider[0]` | Some English-taught options close after IB results, which is rare in Europe — Turība | Some English-taught options close after IB results — Turība |
| `data/topics/distinctive-options.json` | `options[3].what` | AUC and UCR are the two best known, but the Netherlands has around eight of these honours liberal arts colleges attached to its research universities: | The Netherlands has around eight of these honours liberal arts colleges attached to its research universities, AUC and UCR among them: |
| `data/topics/distinctive-options.json` | `options[3].whoItSuits` | These are the closest thing in Europe to an American liberal arts college at European prices, | They are close to an American liberal arts college, at European prices, |
| `data/topics/distinctive-options.json` | `options[4].what` | An EU flagship initiative in which | An EU initiative in which |
| `data/topics/distinctive-options.json` | `options[5].what` | Erasmus Mundus Joint Programmes are the EU's flagship joint degrees, | Erasmus Mundus Joint Programmes are the EU's joint degrees, |
| `data/topics/distinctive-options.json` | `options[5].whoItSuits` | this is one of the best-funded routes into a master's in Europe, | this is a fully funded route into a master's in Europe, |
| `data/topics/distinctive-options.json` | `options[10].what` | A route almost invisible from a gymnasium, and one of the few where a bachelor's degree comes with a licence attached. | A route almost invisible from a gymnasium, where the bachelor's degree comes with a licence attached. |
| `data/topics/distinctive-options.json` | `options[10].whoItSuits` | Denmark, with Maersk and one of the world's largest merchant fleets, is an unusually good place | Denmark, home to Maersk, is a good place |
| `data/topics/distinctive-options.json` | `options[13].what` | the only named merit scholarship is | its only named merit scholarship is |
| `data/topics/distinctive-options.json` | `options[14].whoItSuits` | The deadlines are the friendliest in Asia for a May 2027 IB candidate. | The deadlines suit a May 2027 IB candidate. |
| `data/context-notes/dk-language-reality.json` | `text` | Denmark has a reputation for English-language higher education, and at master's level that reputation is earned. At bachelor's level it is not. | Denmark teaches many master's degrees in English. At bachelor's level it mostly does not. |
| `data/context-notes/nl-english-narrowing.json` | `text` | The Netherlands built its reputation with IB students on English-taught bachelor programmes, | The Netherlands has long drawn IB students with English-taught bachelor programmes, |
| `data/context-notes/nl-two-systems.json` | `text` | The single most common misreading of the Dutch system | A common misreading of the Dutch system |
| `data/countries/is.json` | `whyConsider[4]` | Nordic citizens get the simplest possible healthcare position — confirmation of home insurance is enough — and register domicile | Nordic citizens need only confirmation of home insurance for healthcare, and register domicile |
| `data/countries/ca.json` | `institutions[5].englishBachelors` | Known for problem-based learning, which it pioneered in medicine and now uses across health and science programmes. | Problem-based learning across health and science programmes. |
| `data/countries/lt.json` | `institutions[5].note` | including an aviation engineering programme you will not find elsewhere in the region. | including an aviation engineering programme. |
| `data/countries/se.json` | `institutions[7].note` | A smaller foundation university in a lakeside town that punches above its weight on English-taught bachelor's, especially through its international business school. | A smaller foundation university in a lakeside town, with English-taught bachelor's especially through its international business school. |

#### Change 5: round 3's fixes carried to their siblings (5)

| File | Field | Before | After |
|---|---|---|---|
| `data/destinations/ca.json` | `whyConsider[3]` | Waterloo built its reputation on this. | Waterloo is built around it. |
| `data/destinations/nz.json` | `livingContext.housing` | Otago is famous for an almost entirely residential first year in Dunedin. | Otago runs an almost entirely residential first year in Dunedin. |
| `data/countries/si.json` | `whyConsider[1]` | Living costs are genuinely low: a student dorm room is EUR 120-250 a month and a student meal costs you about EUR 4.37 | Living costs are low: a student meal costs about EUR 4.37, but university dorms take private international students only in Maribor, so budget for the private market |
| `data/countries/ee.json` | `summary` | Estonia is often described as teaching in English, and at master's level that is true. At bachelor's level it is not. | Estonia teaches many master's degrees in English; at bachelor's level the choice is small. |
| `data/countries/no.json` | `institutions[8].note` | An engineering-led university in Trondheim, with a Nobel-winning neuroscience institute. | An engineering-led university in Trondheim, known for engineering, neuroscience, architecture and the natural sciences. |

#### Change 6: polish (3)

| File | Field | Before | After |
|---|---|---|---|
| `data/countries/kr.json` | `institutions[13].note` | ; many Korean screen actors and directors trained here. | . |
| `data/institutions/dk-dania.json` | `meta.notes[1]` | meet the language requirement. Its specific entry requirement is still English B, so plan on English B. | meet the language requirement, but the specific entry requirement is still English B. |
| `data/dk/dania.json` | `notes[2]` | meet the language requirement. Its specific entry requirement is still English B, so plan on English B. | meet the language requirement, but the specific entry requirement is still English B. |

#### Change 2, by rule (70 strings)

These were changed by rule rather than one at a time. The rule, and every file it touched:

| Rule | Replacement | Strings | Files |
|---|---|---|---|
| the year here is inferred from the intake this profile covers | "this site assumes the 2027 intake" | 14 | countries/hu.json, countries/ie.json, countries/is.json, countries/lv.json, countries/no.json |
| "inferred from the 2026 calendar / cycle / booklet / period", "an undated annual rule", "a recurring date" (card year labels and route notes) | "projected from …" | 9 | application-routes/ca-apply-direct-2027.json, countries/at.json, countries/hu.json, countries/ie.json, countries/lt.json |
| "Not researched in detail here." and its variants (sectorLandscape route notes) | "Not covered in detail on this site." / "Not covered on this site." / "Not covered for IB applicants on this site." … | 25 | destinations/at.json, destinations/be.json, destinations/ch.json, destinations/cz.json, destinations/de.json, destinations/fr.json, destinations/gb.json, destinations/hu.json, destinations/ie.json, destinations/is.json, destinations/lu.json, destinations/lv.json, destinations/nl.json, destinations/pl.json, destinations/se.json, destinations/si.json |
| "(page gives no year)" / "(yearly date; the page gives no year)" (school calendar labels) | "(year assumed)" / "(yearly date; year assumed)" | 18 | schools/at-modul.json, schools/no-inn.json, schools/no-nmbu.json, schools/no-nord.json, schools/no-uia.json, schools/no-uio.json, schools/no-uis.json |
| "Verified example(s):" | "Example(s):" | 4 | countries/at.json, countries/au.json, countries/fi.json, countries/nz.json |

## Round 5 (last): answering the fourth critique

This pass answers `follow-ups-41-critique-round-4.md`, which scored round 4 "a strong 7". It was done on 2026-09-26, offline, on main `d4e2c3d`, and it is the last round allowed.

The critique found two gaps:
- the rankings had moved to fields the guard did not read;
- the research-log guard caught the words critics had quoted but not their synonyms.

Both guards now read those fields and catch the shape of the sentence, not only the quoted phrases. Every data rewrite uses only what its own record holds.

`data/schools/*.json` is being edited on the programme pages branch and was not touched. The three lines there that the guard now catches are handed off (see "Handed off").

**Gate:** `SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs` passes all 37 checks. As before, the advisory `freshness` check reports the age of the evidence.

### Each critique item, and what changed

| # | Critique item | What changed |
|---|---|---|
| 1 | Rankings on programme pages; the guard should read them | **Rewritten with the critique's texts:** the six named summaries (Maastricht IB, Breda games, TU Delft aerospace, CBS IB, SDU interactive technology, Twente Creative Technology), US `jurisdictions[2]` (MIT), and the Duke Kunshan line in the guide. **The guard now reads** `data/programmes/*.json` `summary` and `data/destinations/*.json` `jurisdictions[].summary`: 2,160 strings in all. **Other hits, rewritten:** AU Herning "Denmark's second city", AU Economics "the broadest", SDU Economics (now its own cut-off, 8.3), SDU Mechanical ×2 "the broadest / widest set", SDU Mechatronics "SDU's largest intake" (deleted), TU Delft CSE "lightest … heaviest competition", and CA Ontario "the largest system" and Nova Scotia "the smallest allocation". **Added to `NOT_A_RANKING`, each with the figures as its reason:** comparisons the site's own records prove: AU Computer Science (2026 quota 1 cut-offs of AU's six English-taught bachelors: 11.4, 11.2, 10.7, 10.1, 9.2, 6.9), AU IT Product Development (10.1 against 11.2 and 11.4), CBS International Business (the six CBS cut-offs: 11.1, 10.7, 10.2, 9.8, 9.8, 9.4), AAU Economics and SDU Anthropology (each university's own programme and campus list), three "the only subject requirement" lines, BUas's selection-score shares, and SG's Tuition Grant rule. **New phrasings flagged:** "internationally acclaimed", "globally respected", "a leader in", "at the forefront of", "cutting-edge", "ranked in the QS…", "features in the THE… rankings", "number one in/for", "voted best", "no other … comes close", "few places match", "hugely popular", "carries real weight", "alumni include … a Nobel laureate". There are 17 new fixtures. |
| 2 | Synonyms of "Listed because" | **Route notes:** every "Named so / Named here so / Named because / Listed for completeness / worth naming" note, on AE, CN, HK, SG, CA, GR, JP, KR ×3 and NL. **Deadline notes:** PT ×2 and IT. **Other data:** JP `funding[0]` (now "It is not open to you:"); Breda ×4 ("…and a full IB Diploma clears it."); and Maastricht ×2 ("publishes no route: it states…"). **Zealand**, in both `data/institutions` and `data/dk`, and in the two opportunities, now says that this site treats AA or AI, SL or HL, as meeting the requirement, that Zealand has not confirmed this, and to check with Zealand. **VIA** ×2 now says "so this site shows them as that one programme". **"Recorded here / above / as", rewritten on:** CH, IE ×3, BE, IS, CA ×3, DE, HU (CEU ×4), JP ×3, KR, LU, NZ, PL, SG, the US, the guide, the GB context note, and the three SDU Course Results notes. **Templates (`src/`):** `programme.mjs` now says "Places on this programme are not limited: everyone who meets…", "is not confirmed here" (was "not recorded here"), and "listed above where it publishes it". `timeline.mjs` now reads "212 dates with no published day" / "Not published yet, or set by each institution rather than centrally." `institutions.mjs` now says "… programmes on this site". `schools.mjs` now says "Its programmes are not listed here yet." (the longer wording breached the `text-walls` 12-word budget). `meta.mjs` FAQ and credits now say "the date its sources were last read". `planner.mjs` now says "no more than the university allows". The research-depth summary in `data.mjs`, and `dates-panel.js`, are also changed. |
| 3 | "Inferred" to "this site assumes the 2027 intake" | **Done on:** CH (five `year` labels, and the ETH note, now "ETH gives no years; this site assumes the autumn 2027 intake"), AT, HU ×2 (country note and route milestone), LT (and "comes first on this page" is gone), and the MT year label. **`data/schools`:** there are no "inferred" hits there that render. |
| 4 | Widen `research-log` to the shape of the sentence | **New patterns in `scripts/lib/research-log.mjs`:** "Named / Listed / Included / Recorded / Mentioned / Shown … so that / so the / because / for completeness", "named / listed / included here because", "for completeness", "worth naming", "recorded / named here / above / below / on this page", "recorded as", "to record", "inferred", "this site cannot / has no / records", "was / were / been / when / we checked" (but not "checked by a person"), "checked in a browser / for <X>", "looked for and", and "we could not / did not / have not / found / checked". **Kept on purpose:** "listed above / below / here", which is navigation; "this site assumes / treats / shows X as …", which tells the student what judgement was made for them and is the convention the critique itself proposed for Zealand and VIA; the "Checked <date>" stamps; and the verification labels. **Fixtures:** 31 new positive ones, covering every live miss in the critique plus probes in the same register, and 11 new negative ones. **Hand-offs:** three lines on university pages come from `data/schools` source titles and are in `HANDED_OFF` (see below). |
| 5 | Rewrites that fell short | **MT:** "This is why the IB deadline above is a concession: …". **CN:** "No Chinese university waits for this date." **NO attribution:** now "this site's own count" again, so it no longer implies an outside count exists. **Erasmus Mundus:** "a route into a master's in Europe where a scholarship can cover tuition, travel and living costs". It does not say "fully funded", because the record says scholarships "normally cover". **McMaster:** "All programmes". **Jönköping:** "whose English-taught bachelor's are mostly in its international business school". **Also QUT:** the "In English" line no longer quotes a marketing slogan. |
| 6 | Template polish | **`evidenceBlock` foot label:** now "None of these sources has been checked by a person yet." when there are several sources, or "This source has not been checked by a person yet." when there is one. For other shared states it reads "All of these sources: past its review date." and so on. **`src/pages/schools.mjs`:** a new self-contained `wholeAnswer()` replaces `firstClause()` for the "In English:" line only. It keeps the first clause whole. A full stop ends the clause only when a space or the end follows and it is not an initial ("B.A."), and a bracket ("BA (Hons) in…") never ends it. If the clause is longer than 30 words, the line is dropped rather than cut. The ANU, LASALLE, DigiPen and ESCP answers now read whole. `firstClause` itself, and the fact tiles that use it, are unchanged. |

### Handed off: the programme pages branch

The research-log guard's `HANDED_OFF` list holds three rendered lines from `data/schools/*.json` source titles. Each entry names the owner and the fix, and fails once the line is gone, so whoever fixes it removes the entry.
- `data/schools/at-mci.json` source title: "(16 listed; fact boxes checked for language)" should become "(16 listed; language on each fact box)".
- `data/schools/de-hsrw.json` source title: drop ", checked in a browser".
- `data/schools/de-tum.json` source title: "(237 results, checked for TUM)" should become "(237 results, filtered to TUM)".

### Still open after the last round

- **Warsaw resolution 315** needs the web.
- **The LSMU extra-round sentence** needs a reading of lsmu.lt.
- **Unrendered research notes** in `data/opportunities` and `data/destinations` `meta.notes` still use this vocabulary. They are the place `docs/PARALLEL_WORK.md` sets aside for it, and the rendered-page guard confirms none of it reaches a student.
- **Prose the superlatives guard does not read:** `watchOuts`, deadline notes, `housing`, `steps` and `selectionNotes`. What is left there compares options for the student.
- **The marketing-register phrasings** the critique probed are now in the rule. Registers nobody has written yet ("a jewel of…") will need their own fixture when they appear.

### Every string changed in round 5

Each cell holds the changed phrase, not the whole field. The `src/` changes are described in the table above.

#### Change 1: rankings on programme pages and in jurisdiction summaries (17)

| File | Field | Before | After |
|---|---|---|---|
| `data/programmes/nl-maastricht-international-business.json` | `summary` | Maastricht's flagship business bachelor, taught entirely | Maastricht's International Business bachelor, taught entirely |
| `data/programmes/nl-breda-uas-creative-media-and-game-technologies.json` | `summary` | One of the few games degrees in Europe with a real industry behind it, split into | A games degree split into |
| `data/programmes/nl-tudelft-aerospace-engineering.json` | `summary` | It is the most oversubscribed engineering degree in the Netherlands, and the whole of the competition | Every one of its 440 places (2026-27) is allocated by selection, and the whole of the competition |
| `data/programmes/dk-cbs-international-business.json` | `summary` | It is the most applied-to and the highest cut-off of any CBS bachelor, and a third | Its 2026 quota 1 cut-off, 11.1, was the highest of CBS's six English-taught bachelors on this site, and a third |
| `data/programmes/dk-sdu-interactive-technology-engineering.json` | `summary` |  It is one of the few engineering degrees where a portfolio instinct is genuinely useful. | (deleted) |
| `data/programmes/nl-utwente-creative-technology.json` | `summary` | which makes it one of the few technical-university routes open to a student who did not take HL sciences | so it is open to a student who did not take HL sciences |
| `data/programmes/dk-au-economics-and-business-administration-herning.json` | `summary` | rather than Denmark's second city. | rather than Aarhus. |
| `data/programmes/dk-au-economics-and-business-administration.json` | `summary` | It is the broadest of AU's English-taught degrees and the usual route | It is a broad degree and the usual route |
| `data/programmes/dk-sdu-economics-and-business-administration.json` | `summary` | It has the lowest quota 1 grade floor of SDU's non-engineering English-taught degrees. | Its 2026 quota 1 cut-off was 8.3. |
| `data/programmes/dk-sdu-mechanical-engineering-beng.json` | `summary` | It offers the broadest set of alternative science entry combinations at SDU. | It accepts several alternative science entry combinations. |
| `data/programmes/dk-sdu-mechanical-engineering.json` | `summary` | It has the widest set of alternative science entry routes of any SDU English-taught degree. | It accepts several alternative science entry routes. |
| `data/programmes/dk-sdu-mechatronics.json` | `summary` |  This is SDU's largest English-taught engineering intake. | (deleted) |
| `data/programmes/nl-tudelft-computer-science-and-engineering.json` | `summary` | It has the lightest subject requirement of the four English-taught Delft degrees — Mathematics AA HL and nothing else — and the heaviest competition for a foreign applicant, because only the English track is open to you. | Its one subject requirement is Mathematics AA HL, and a foreign applicant can only take the English track. |
| `data/destinations/us.json` | `jurisdictions[2].summary` | and MIT is its best-known practitioner: | and MIT is one: |
| `data/destinations/ca.json` | `jurisdictions[0].summary` | The largest system, with its own central application service for universities. | A system with its own central application service for universities. |
| `data/destinations/ca.json` | `jurisdictions[4].summary` | No shared application service, and the smallest study permit allocation of the five provinces here. | No shared application service. |
| `data/topics/distinctive-options.json` | `options[14].whoItSuits` | with a qualification that reads clearly to European and American employers. | with both a US and a Chinese degree at the end. |

#### Change 2: synonyms of "Listed because", and "recorded here / as" (55)

| File | Field | Before | After |
|---|---|---|---|
| `data/destinations/ae.json` | `sectorLandscape.routes[4].note` | Named so the route is visible. No institution | No institution |
| `data/destinations/cn.json` | `sectorLandscape.routes[2].note` | Named so the route is visible. Whether | Whether |
| `data/destinations/hk.json` | `sectorLandscape.routes[3].note` | Named so the route is visible; not covered here. | Not covered here. |
| `data/destinations/sg.json` | `sectorLandscape.routes[4].note` | Not covered here; named so that the route is visible. | Not covered here. |
| `data/destinations/ca.json` | `sectorLandscape.routes[2].note` | Named here so that a student who meets the word knows where it sits. Whether | Whether |
| `data/destinations/gr.json` | `sectorLandscape.routes[1].note` | Named because they exist and are on the same ministry route; not covered further here. | On the same ministry route; not covered further on this site. |
| `data/destinations/jp.json` | `sectorLandscape.routes[1].note` | Named because MEXT names it as one of the five routes open to international students. | MEXT names it as one of the five routes open to international students. |
| `data/destinations/kr.json` | `sectorLandscape.routes[3].note` | Named because it is a visible part of the sector and because it is an example of a route that exists and is not open to this reader: | Not open to you: |
| `data/destinations/kr.json` | `sectorLandscape.routes[4].note` | because it belongs to a different ministry, which is exactly why it is worth naming. Not covered here beyond its existence. | because it belongs to a different ministry. Not covered on this site. |
| `data/destinations/kr.json` | `sectorLandscape.routes[5].note` | Listed for completeness. Note that | Note that |
| `data/destinations/nl.json` | `sectorLandscape.routes[3].note` | these schools do not appear in the ordinary programme listings, which is why they are named here. | these schools do not appear in the ordinary programme listings. |
| `data/countries/pt.json` | `application.deadlines[0].notes` | Listed for completeness. EU citizens cannot use this route: | EU citizens cannot use this route: |
| `data/countries/pt.json` | `application.deadlines[2].notes` | goes through the Concurso Nacional de Acesso instead. Listed for completeness. The spring intake | goes through the Concurso Nacional de Acesso instead. The spring intake |
| `data/countries/it.json` | `application.deadlines[4].notes` |  Listed for completeness only. | (deleted) |
| `data/countries/jp.json` | `funding[0]` | It is here because people ask about it; it is not available: | It is not open to you: |
| `data/opportunities/nl-breda-uas-applied-data-science-and-ai-2027-autumn.json` | `requirements[0].note` | BUas's bar is a havo-OR-vwo equivalent, which is one level below what a Dutch research university needs, and this site cannot state 'a qualification at this level', so it shows a full IB Diploma, which is what this site's readers hold and which certainly clears the bar. | BUas's bar is a havo- or vwo-equivalent diploma, one level below what a Dutch research university needs, and a full IB Diploma clears it. |
| `data/opportunities/nl-breda-uas-creative-business-2027-autumn.json` | `requirements[0].note` | BUas's bar is a havo-OR-vwo equivalent, which is one level below what a Dutch research university needs, and this site cannot state 'a qualification at this level', so it shows a full IB Diploma, which is what this site's readers hold and which certainly clears the bar. | BUas's bar is a havo- or vwo-equivalent diploma, one level below what a Dutch research university needs, and a full IB Diploma clears it. |
| `data/opportunities/nl-breda-uas-creative-media-and-game-technologies-2027-autumn.json` | `requirements[0].note` | BUas's bar is a havo-OR-vwo equivalent, which is one level below what a Dutch research university needs, and this site cannot state 'a qualification at this level', so it shows a full IB Diploma, which is what this site's readers hold and which certainly clears the bar. | BUas's bar is a havo- or vwo-equivalent diploma, one level below what a Dutch research university needs, and a full IB Diploma clears it. |
| `data/opportunities/nl-breda-uas-hotel-management-2027-autumn.json` | `requirements[0].note` | BUas's bar is a havo-OR-vwo equivalent, which is one level below what a Dutch research university needs, and this site cannot state 'a qualification at this level', so it shows a full IB Diploma, which is what this site's readers hold and which certainly clears the bar. | BUas's bar is a havo- or vwo-equivalent diploma, one level below what a Dutch research university needs, and a full IB Diploma clears it. |
| `data/opportunities/nl-maastricht-international-business-2027-autumn.json` | `requirements[0].alternativeRoute` | This programme's own admission page publishes no route, and that absence was checked rather than assumed: it states | This programme's own admission page publishes no route: it states |
| `data/opportunities/nl-maastricht-university-college-maastricht-2027-autumn.json` | `requirements[0].alternativeRoute` | This programme's own admission page publishes no route, and that absence was checked rather than assumed: it states | This programme's own admission page publishes no route: it states |
| `data/institutions/dk-zealand.json` | `meta.notes[0]` | Mathematics: Applications and Interpretation or Analysis and Approaches at SL or HL is recorded as meeting it. | This site treats Mathematics: Applications and Interpretation or Analysis and Approaches, at SL or HL, as meeting it; Zealand does not say so, so confirm with Zealand. |
| `data/dk/zealand.json` | `notes[1]` | Mathematics: Applications and Interpretation or Analysis and Approaches at SL or HL is recorded as meeting it. | This site treats Mathematics: Applications and Interpretation or Analysis and Approaches, at SL or HL, as meeting it; Zealand does not say so, so confirm with Zealand. |
| `data/opportunities/dk-zealand-architectural-technology-and-construction-management-2027-autumn.json` | `requirements[1].note` | Either one at SL or HL is recorded as meeting the requirement, because both are at least the level the source names. Confirm with the institution if in doubt. | This site treats either one, at SL or HL, as meeting the requirement, because both are at least the level the source names; Zealand has not confirmed that, so check with Zealand. |
| `data/opportunities/dk-zealand-cybersecurity-2027-autumn.json` | `requirements[1].note` | Either one at SL or HL is recorded as meeting the requirement, because both are at least the level the source names. Confirm with the institution if in doubt. | This site treats either one, at SL or HL, as meeting the requirement, because both are at least the level the source names; Zealand has not confirmed that, so check with Zealand. |
| `data/institutions/dk-via.json` | `meta.notes[3]` | chosen when you apply, so they are recorded as that one programme. | chosen when you apply, so this site shows them as that one programme. |
| `data/dk/via.json` | `notes[4]` | chosen when you apply, so they are recorded as that one programme. | chosen when you apply, so this site shows them as that one programme. |
| `data/countries/ch.json` | `costs.notes[1]` | ETH's estimate is the only official figure recorded here; | ETH's estimate is the only official figure on this page; |
| `data/countries/ie.json` | `costs.notes[0]` | Trinity College Dublin is recorded above as an example. | Trinity College Dublin's figure is above, as an example. |
| `data/countries/ie.json` | `costs.notes[1]` | Trinity College Dublin is recorded above; expect Dublin | Trinity College Dublin's figure is above; expect Dublin |
| `data/countries/be.json` | `application.deadlines[7].year` | 2026 session - recorded as the pattern for 2027 | 2026 session, the pattern for 2027 |
| `data/countries/ie.json` | `application.deadlines[2].notes` | No date is recorded here, deliberately, because | No date is given here, because |
| `data/countries/is.json` | `application.deadlines[4].notes` | so there is no opening date to record. | so there is no opening date. |
| `data/context-notes/gb-conditional-offers.json` | `text` | and it is worth naming, because the UK is usually discussed in terms of cost. | and it is worth knowing, because the UK is usually discussed in terms of cost. |
| `data/countries/ca.json` | `application.deadlines[16].notes` | UBC's 15 January 2027 and Simon Fraser's 31 January 2027 are each recorded above as their own entries; | UBC's 15 January 2027 and Simon Fraser's 31 January 2027 each have their own entries above; |
| `data/countries/ca.json` | `application.deadlines[20].notes` | McGill's and Concordia's dates are recorded as their own entries below | McGill's and Concordia's dates have their own entries below |
| `data/countries/ca.json` | `application.deadlines[27].notes` | the 2026 figures above are recorded as precedent, not as next year | the 2026 figures above are precedent, not next year |
| `data/countries/de.json` | `application.deadlines[12].notes` | Every DoSV date recorded here is the 2026/27 day carried forward | Every DoSV date on this page is the 2026/27 day carried forward |
| `data/countries/jp.json` | `watchOuts[0]` | the earliest Japanese deadline recorded here. | the earliest Japanese deadline on this page. |
| `data/countries/jp.json` | `ibRecognition.notes[1]` | Every September or October 2027 decision recorded here is made | Every September or October 2027 decision on this page is made |
| `data/application-routes/jp-direct-2027.json` | `rounds[3].note` | The latest closing date of any Japanese route recorded here, | The latest closing date of any Japanese route on this page, |
| `data/destinations/kr.json` | `sectorLandscape.routes[0].what` | every English-taught undergraduate programme named on this page sits | every English-taught undergraduate programme on this page sits |
| `data/countries/lu.json` | `application.deadlines[3].notes` | so no single window is recorded here. | so no single window is given here. |
| `data/countries/nz.json` | `application.deadlines[4].notes` | recorded here as precedent and not as a prediction. | given here as precedent, not as a prediction. |
| `data/countries/pl.json` | `application.deadlines[46].notes` | so no date is recorded here. | so no date is given here. |
| `data/destinations/sg.json` | `sectorLandscape.routes[4].what` | It is listed here because LASALLE's | It appears on this page because LASALLE's |
| `data/countries/us.json` | `application.deadlines[13].notes` | recorded here as precedent and not as a prediction. | given here as precedent, not as a prediction. |
| `data/topics/distinctive-options.json` | `options[13].what` | Included here and not only in the UAE file because its funding model is genuinely unusual. NYUAD | Its funding model is unusual. NYUAD |
| `data/opportunities/dk-sdu-electronics-beng-2027-autumn.json` | `requirements[0].note` | And the 18-point floor recorded here is | And the 18-point floor given here is |
| `data/opportunities/dk-sdu-mechanical-engineering-beng-2027-autumn.json` | `requirements[0].note` | And the 18-point floor recorded here is | And the 18-point floor given here is |
| `data/opportunities/dk-sdu-mechatronics-beng-2027-autumn.json` | `requirements[0].note` | And the 18-point floor recorded here is | And the 18-point floor given here is |
| `data/countries/hu.json` | `application.deadlines[0].notes` | it is listed here because it was founded in Budapest | it appears on this page because it was founded in Budapest |
| `data/countries/hu.json` | `application.deadlines[5].notes` | it is listed here because it was founded in Budapest | it appears on this page because it was founded in Budapest |
| `data/countries/hu.json` | `application.deadlines[8].notes` | it is listed here because it was founded in Budapest | it appears on this page because it was founded in Budapest |
| `data/countries/hu.json` | `application.deadlines[14].notes` | it is listed here because it was founded in Budapest | it appears on this page because it was founded in Budapest |

#### Change 3: the year assumption in the site's convention (12)

| File | Field | Before | After |
|---|---|---|---|
| `data/countries/ch.json` | `application.deadlines[3].year` | 2027 entry - the period is published with no year, so the years here are inferred | 2027 entry - published with no year; this site assumes the 2027 intake |
| `data/countries/ch.json` | `application.deadlines[4].year` | 2027 entry - the period is published with no year, so the year here is inferred | 2027 entry - published with no year; this site assumes the 2027 intake |
| `data/countries/ch.json` | `application.deadlines[3].notes` | The years are inferred forward to the autumn 2027 intake because the page gives none. | ETH gives no years; this site assumes the autumn 2027 intake. |
| `data/countries/at.json` | `application.deadlines[3].notes` | so the year here is inferred one cycle forward and the day could move. | so this site assumes the same window in 2027, and the day could move. |
| `data/countries/hu.json` | `application.deadlines[11].notes` | so this is a genuine 2027 date rather than an inferred one. | so this is a genuine 2027 date rather than an assumed one. |
| `data/application-routes/hu-direct-2027.json` | `milestones[2].note` | '21st of August the year of application', so the year is inferred. | '21st of August the year of application', so this site assumes 2027. |
| `data/countries/lt.json` | `application.deadlines[4].notes` | so the year is inferred. | so this site assumes 2027. |
| `data/countries/lt.json` | `application.deadlines[4].notes` | Vilnius University comes first on this page. It has one intake | Vilnius University has one intake |
| `data/countries/mt.json` | `application.deadlines[7].year` | 2027-28 - published, not inferred | 2027-28 - published with its year |
| `data/countries/ch.json` | `application.deadlines[5].year` | 2027 entry - published with no year, so the year here is inferred | 2027 entry - published with no year; this site assumes the 2027 intake |
| `data/countries/ch.json` | `application.deadlines[6].year` | 2027 entry - published with no year, so the year here is inferred | 2027 entry - published with no year; this site assumes the 2027 intake |
| `data/countries/ch.json` | `application.deadlines[8].year` | 2027 entry - published with no year, so the years here are inferred | 2027 entry - published with no year; this site assumes the 2027 intake |

#### Change 5: rewrites that fell short (7)

| File | Field | Before | After |
|---|---|---|---|
| `data/topics/distinctive-options.json` | `options[5].whoItSuits` | this is a fully funded route into a master's in Europe, | this is a route into a master's in Europe where a scholarship can cover tuition, travel and living costs, |
| `data/countries/ca.json` | `institutions[5].englishBachelors` | Problem-based learning across health and science programmes. | All programmes. |
| `data/countries/se.json` | `institutions[7].note` | A smaller foundation university in a lakeside town, with English-taught bachelor's especially through its international business school. | A smaller foundation university in a lakeside town, whose English-taught bachelor's are mostly in its international business school. |
| `data/countries/mt.json` | `application.deadlines[2].notes` | It shows the IB deadline above for the concession it is: | This is why the IB deadline above is a concession: |
| `data/countries/cn.json` | `application.deadlines[11].notes` | This date matters for where it sits, not because anything in China is waiting for it. | No Chinese university waits for this date. |
| `data/context-notes/no-language-is-the-obstacle.json` | `attribution` | Samordna opptak’s published rules, and a count of English-taught Norwegian bachelor programmes, September 2026 | Samordna opptak’s published rules, and this site’s own count of English-taught Norwegian bachelor programmes, September 2026 |
| `data/countries/au.json` | `institutions[QUT].englishBachelors` | Applied degrees branded 'the university for the real world', with work-integrated learning across most programmes. | Applied degrees, with work-integrated learning across most programmes. |
