# Country audit (Europe): follow-ups from round 5 (issue #41)

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
