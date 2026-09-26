# Follow-ups #41: Editor critique, round 2

This critique covers main at `51a3686`, which includes round 2 (`a9e3cfb`). It was written on 2026-09-26 by a critic who did not do round 1. The web was blocked, so every claim was checked against the repo's own records. I rebuilt the site into a private `DIST_DIR` and read the rendered text (`htmlToText`) of every Destination page, every university page, the Denmark page and `/guides/`. I also ran both guards' own functions over phrasings I wrote to try to get past them.

## Score: 7 / 10

This is better than round 1. Every item round 1 named is fixed, and the rewrites are accurate. In the 40 I checked against their records, none invents a fact. The superlatives rule now follows its own definition much more closely.

It is still not an 8, for the same reason round 1 was not. **Both guards catch their fixtures, not the class, and students can see what gets through:**

- **The worst sentence on the site is on the ITU university page, and `research-log` passes it.** ITU is a Danish university, the students' home country. Under "Worth knowing", the page says the sentence is "quoted from ITU's English-language-requirements-and-supplementary-courses page as read by the round-4 conversion critic on 25 Sep 2026 (docs/research/qa/conversion/critique-round-4.md). No Evidence record holds that page's full URL yet; the levelRaise cites…". The sentence arrived with #42 (`d0d4ec0`), not #41. But round 2 widened this guard to cover `/universities/` and reports "0 across 506 pages", and this sentence is on one of those pages.
- **The university pages still carry the same kind of wording round 2 fixed in four places.** About 15 more research-log lines render on university and Destination pages, in the same `meta.notes` field. Examples: "on the pages checked, so it is left blank here rather than guessed" (SDU), "at the time of checking" (AAU), "that is what the record holds" (Dania), "return nothing to a fetch or to a DOM read" (BUas), "the only institution in this pass" (Twente), "the pattern ADR 0002 predicts" (TU Delft), "In English: Three found." (Iceland).
- **Six cards still praise without a source, in fields the guard reads.** Examples: "a strong reputation for teaching quality" (Hasselt), "The business and economics powerhouse" (Erasmus), "internationally known" (Howest). The rule has no word for reputation or praise that is not a superlative. It also lets "its largest university" through, when "its" refers to a country.

None of this sends a student the wrong way on a date, a fee or a rule. It is closer to an 8 than round 1 was: changes 1 to 3 below are about half a day's work, and with them done I would score it 8.

## (a) Sample of round-2 rewrites

I checked 40 rewrites against the same record. The fields I compared against were `englishBachelors`, `notableFields`, `founded`, `students`, `housing`, `costs`, `watchOuts` and sibling cards.

**33 are good as they stand.** Some are better than what they replaced:
- **UCL:** "Around 400 undergraduate programmes… from architecture to neuroscience".
- **CUHK:** the "lowest of the three" claim became a comparison with HKU's actual fees.
- **Laurea:** it now names seven programmes.
- **Paris-Saclay, UiT and Lucerne:** each now says what the university is focused on, taken from `notableFields`.
- **The CH summary:** it now uses ETH's CHF 22,100 figure.
- **The FR tagline:** "a private business school about 100 times that". ESCP's €20,800 is 117 times €178, so "about" holds.
- **The GB destination summary:** it now reads the right way round.

**7 fall short:**

| # | Where (renders on) | After-string | Problem |
|---|---|---|---|
| 1 | `si.json` `summary` (`/destinations/si/`) | "you pay no tuition, and a dormitory room, if you can get one, costs EUR 80-250 a month" | **Misleading by omission.** The same record's `housing` calls dorms "the practical catch": Study in Slovenia says a private international student cannot stay in university dorms "except in Maribor". The summary quotes a price for something most readers cannot get. |
| 2 | `data/institutions/dk-itu.json` and `data/dk/itu.json` `about` (Denmark page, `/universities/dk-itu/`) | "ITU was founded in 1999, has about 2,900 students, and is built around…" | The rewrite put the student count in the first sentence, and the same paragraph still says "with roughly 2,900 students in total" two sentences later. |
| 3 | `ee.json` `institutions[0].note` (Tartu) | "three English-taught bachelor's: Business Administration, Science and Technology, and a six-year Medicine" | Medicine is not a bachelor's. `englishBachelors` calls it "six-year integrated Medicine". The same note then repeats the count: "listed 3 English-taught first-level programmes". |
| 4 | `ee.json` `institutions[4].note` (EMÜ) | "Its English-taught six-year Veterinary Medicine… lists three English-taught curricula, two master's and the six-year combined Veterinary Medicine" | The same fact appears twice in three sentences. |
| 5 | `be.json` `institutions[10].note` (KdG) | "A clearly signposted application route for its English-taught bachelor's." | **Bland where a fact exists.** The whole card is a fragment about process. The record names International Business, Multimedia and Creative Technology, and Applied Computer Science. |
| 6 | `hu.json` `ibRecognition.notes[3]` | "Szeged publishes an IB exemption" | The pass lost information it could have kept. "The only medical school here" was a statement about this page's own list, which is the scope convention the guard allows. A student now cannot tell that the other HU medical schools on the page publish no exemption. |
| 7 | `cz.json` `institutions[10].note` | "runs an entrance exam venue in Göteborg, in Sweden." | The reason for mentioning it (it is the venue closest to Denmark) went with the ranking. "A short trip from Denmark" keeps the point without ranking. |

**About 144 of the 455 profile `institutions[].note` strings never render.** The data/schools records replace them. This covers GB, NL, CH, AT, SE, NO, FI and DE: their notes appear in neither `/destinations/` nor `/universities/`. So Uppsala's student-nations sentence, Karolinska, UCL's note, St Andrews, Lucerne, Basel and Turku are edits no student sees. The claim of "80 rewrites" therefore overstates the student impact, and the guard spends a third of its reading on dead text. It is harmless, but the next pass should check rendered pages, not records.

## (b) What students still see

### Research log on pages the guard says it covers

Every line below is visible text on `dist/destinations/*` or `dist/universities/*`.

| Page | Source | Text |
|---|---|---|
| `/universities/dk-itu/` | `dk-itu.json` `meta.notes[5]` | "…as read by the round-4 conversion critic on 25 Sep 2026 (docs/research/qa/conversion/critique-round-4.md). No Evidence record holds that page's full URL yet; the levelRaise cites the general admission page until one does." |
| `/universities/dk-sdu/` | `dk-sdu.json` and `data/dk/sdu.json` `meta.notes[10]` | "SDU's own student total was not published in a form that could be verified on the pages checked, so it is left blank here rather than guessed." |
| `/universities/dk-ucph/` | `dk-ucph.json` and `data/dk/ucph.json` `meta.notes[6]` | "…were not published on the English-language pages checked, so no figure is recorded here." |
| `/universities/dk-aau/` | `dk-aau.json` and `data/dk/aau.json` `meta.notes[4]` | "…did not publish a quota figure… at the time of checking" |
| `/universities/dk-dania/` | `dk-dania.json` and `data/dk/dania.json` `meta.notes[1]` | "…and that is what the record holds." |
| `/universities/nl-breda-uas/` | `nl-breda-uas.json` `meta.notes[2]` | "…load their contents by script and return nothing to a fetch or to a DOM read. The selection detail recorded here comes from the regulation PDF instead, which is better evidence anyway." |
| `/universities/nl-utwente/` | `nl-utwente.json` `meta.notes[1]` | "Twente is the only institution in this pass that writes requirements…" |
| `/universities/nl-tudelft/` | `nl-tudelft.json` `meta.notes[0]` | "…the cleanest example found in the Netherlands of the pattern ADR 0002 predicts" |
| `/universities/nl-maastricht/` | `nl-maastricht.json` `meta.notes[0,1]` | "…the same conclusion for ADR 0002" and "The three programmes recorded here were chosen because…" |
| `/destinations/is/` | `is.json` `language.englishTaughtBachelors` | "Three found." |
| `/destinations/lv/`, `/universities/lv-lma/` | `lv.json` `institutions[8].englishBachelors` | "None found" |
| `/destinations/lv/` | `lv.json` `funding[0]` | "the most substantial scholarship scheme found" (a ranking as well) |
| `/destinations/pl/` | `pl.json` `language.englishProof` | "sets the highest bar found at IELTS 6.5" |
| `/destinations/ee/` | `ee.json` `ibRecognition.notes[2]` | "No Estonian institution publishes a minimum IB point score, and no… conversion table could be found." The first half is the universal negative that round 1's change 3 objected to. |
| `/destinations/mt/` | `mt.json` `costs.tuitionEuEea.value` | "for the full-time bachelor's checked" |
| `/destinations/us/` | `us.json` `funding` (need-blind item) | "…but were not checked here" |

**Not on a guarded page, but students still see it:**
- `/guides/distinctive-options/`: "Deadlines were not published on the pages we read".
- The Denmark page: "Not yet researched in detail here. Recorded because it exists and is named by the Agency, not because we can currently advise on it."

### Rankings and praise in fields the guard reads

All of these render on a Destination card and on the university page. `rankings()` returns `[]` for each.

| Where | Text | Rewrite from the record |
|---|---|---|
| `be.json` `institutions[4].note` (Hasselt) | "Small and young, with a strong reputation for teaching quality" | "Every bachelor's is taught in Dutch; English starts at master's level. Strong in biomedical sciences, architecture, mobility sciences and data science, with a much lower cost of living than the big student cities." |
| `be.json` `institutions[12].note` (Howest) | "Its game development programme is internationally known…, which makes Howest an outlier in the Belgian bachelor landscape." | "Its Digital Arts and Entertainment bachelor's, a game-development degree, is taught in English." |
| `nl.json` `institutions[6].note` (Erasmus) | "The business and economics powerhouse;" | "Business and economics at its core:" |
| `kr.json` `institutions[8].note` (Sogang) | "with a reputation for rigour." | "Some business, economics and international studies courses are in English; check yours with the university." |
| `pt.json` `institutions[5].note` (ISCTE) | "…and a practical, employment-oriented reputation." | "…focused on management, sociology, data science and international studies, with some English-taught teaching in management and international studies." |
| `pt.json` `institutions[9].note` (Aveiro) | "with a strong engineering and materials reputation" | "focused on engineering, materials science, telecommunications and marine sciences; little is taught in English at bachelor level" |

Two more cards in guarded fields do not render today, but they show the gaps in the rule:
- NTNU (`no.json` `institutions[8]`): "Norway's engineering powerhouse **and its largest university**". The "its" scope exemption lets this through when "its" refers to the country.
- Warwick (`gb.json` `institutions[11]`): "formidable maths and economics reputation".

### Place rankings left on pages where the same claim was fixed

Round 2 fixed some place rankings by hand but left the same claim elsewhere on the same page:
- **CH:** round 2 removed "highest in Europe" from `summary` and `watchOuts[4]`. The CH page still says, in `housing`, "Zurich, Geneva and Lausanne have some of the tightest and most expensive rental markets in Europe".
- **LU:** round 2 fixed `watchOuts[4]`. The page still says, in `costs.notes[2]`, "Luxembourg has one of the highest costs of living in the EU", and, in `housing`, "one of the most expensive rental markets in the EU".
- **Guide:** `/guides/distinctive-options/` (`topics/distinctive-options.json` `options[7].what`) opens "The oldest hospitality school in the world" for EHL. The EHL card lost "world's best-known" in round 1, so the guide contradicts that fix.

### Latent: the canonical Destination records were not swept

`data/destinations/*.json` still say:
- `ch` `whyConsider[0]`: "ETH Zurich and EPFL are world-class";
- `ch` `watchOuts[3]` and `ie` `watchOuts[4]`: "among the highest in Europe";
- `de` `whyConsider[1]`: "The largest higher education system in the EU";
- `lu` `watchOuts[3]`: "one of the most expensive places in the EU".

The pages render the profile's version today. But these strings ship in the public `dist/data.json`. They will reach the pages when a profile retires, because the canonical record wins per field (`src/lib/catalogue.mjs`). Round 2 fixed the profile copies only.

## (c) The guards

**`superlatives`** has four shapes where it used to have a word list, which is real progress. I ran `rankings()` over 53 phrasings; it missed 41:
- "a leading research university";
- "the second largest university in Denmark";
- "one of only three";
- "the sole public university";
- "Estonia's flagship university";
- "well-respected";
- "a strong reputation";
- "powerhouse";
- "internationally known";
- "elite";
- "top-tier";
- "among the very best";
- "Europe's great universities";
- "more … than any other Danish university";
- "nowhere else in Europe";
- "rare in Europe";
- "Ranked 45th";
- "its largest university".

Five of these misses are live on cards (see the table above). To close the gap:
- **Add to `ALWAYS`:**
  - `reputation`, `powerhouse`, `internationally (?:known|recognised|recognized)`, `well[- ]respected`, `top-tier`, `elite`;
  - `(?:a|an) (?:leading|top) `, `one of (?:only|just) \w+`, `\bthe sole\b`, `than any other`, `nowhere else`;
  - `flagship`, exempting the US term "public flagship".
- **In `FRAMED`,** allow an ordinal before the superlative: `the (?:second|third) (?:largest|oldest|biggest)`. Also allow "very" in `the very best`.
- **Close the "its" loophole:** flag `\bits \w+est (?:university|universities|school|institution|city)\b`. A scope statement is about the institution's own campus, programme or door, and never about "its largest university".

**`research-log`** is the bigger gap, because it now claims to cover `/universities/`. Everything in the first table above passes it. Add these patterns:
- `\b(?:none|one|two|three|four|five|\d+) found\b`
- `\b(?:bar|example|scheme|figure|table) found\b`
- `\bcould be found\b`
- `\bpages? checked\b`
- `\bat the time of checking\b`
- `\bnot checked here\b`
- `\b(?:bachelor's|programmes?) checked\b`
- `\bthis pass\b`
- `\bthe record holds\b`
- `\bADR \d{4}\b`
- `\bdocs/`
- `\bcritic\b`
- `\bEvidence record\b`
- `\bto a fetch\b`
- a leaked field name, `\b[a-z]+[A-Z][a-z]+\w*\b` (it catches "levelRaise"; exempt the few real brand names it hits).

Add fixtures for each. Also exempt the IT housing "found through Facebook groups", which is a harmless use of "found".

## Changes that would raise the score, ranked

1. **Take the research log off the university pages** (these are all `meta.notes`, and they render under "Worth knowing"; edit `data/institutions` and `data/dk` together):
   - `dk-itu.json` `meta.notes[5]`: delete it. It is a reviewer note about a missing citation. It belongs in the Evidence record or the conversion QA doc.
   - `dk-sdu.json` `meta.notes[10]`: delete it. A blank student-count tile needs no explanation. If one is wanted, use "SDU's total student number is not confirmed here."
   - `dk-ucph.json` `meta.notes[6]`: "Tuition fees for non-EU/EEA bachelor applicants are not confirmed here; ask UCPH."
   - `dk-aau.json` `meta.notes[4]`: "The quota split for Energy Engineering is not confirmed here; the programme page describes quota 1 and quota 2 selection without figures."
   - `dk-dania.json` `meta.notes[1]`: replace "and that is what the record holds." with "so plan on English B."
   - `nl-breda-uas.json` `meta.notes[2]`: "The selection details here come from BUas's admission regulation (PDF)."
   - `nl-utwente.json` `meta.notes[1]`: "Twente writes requirements three different ways on three programme pages: … so read your own programme's page, not a sibling's." Drop "the only institution in this pass" and the last sentence.
   - `nl-tudelft.json` `meta.notes[0]`: "TU Delft publishes its IB entry requirements in IB terms, in one table covering every BSc programme: no local scale and no conversion."
   - `nl-maastricht.json` `meta.notes[0]`: end at "in IB terms, as TU Delft does: nothing to convert."
   - `nl-maastricht.json` `meta.notes[1]`: "The three programmes here differ in admission regime: …"
2. **Widen `research-log` with the patterns in (c)** and add fixtures. Then fix what it finds on Destination pages:
   - `is.json` `language.englishTaughtBachelors`: "Three found." becomes "Three."
   - `lv.json` `institutions[8].englishBachelors`: "None found" becomes "None confirmed here".
   - `lv.json` `funding[0]`: "SSE Riga runs the most substantial scholarship scheme found:" becomes "SSE Riga runs a large scholarship scheme:".
   - `pl.json` `language.englishProof`: "sets the highest bar found at" becomes "sets a higher bar:".
   - `ee.json` `ibRecognition.notes[2]`: "A minimum IB score and an IB-to-Estonian grade conversion are not confirmed here for any Estonian institution; if you need one, ask Harno, Estonia's recognition centre."
   - `mt.json` `costs.tuitionEuEea.value`: "for the full-time bachelor's checked" becomes "for the full-time bachelor's listed here".
   - `us.json` need-blind `funding` item: "were not checked here" becomes "are not confirmed here".
3. **Widen `superlatives` as in (c).** Then rewrite the six live cards: Hasselt, Howest, Erasmus, Sogang, ISCTE and Aveiro, using the texts in the table in (b). Also rewrite NTNU and Warwick, even though they do not render: NTNU's record supports "Home to a neuroscience institute whose founders won a Nobel Prize" only if the record says so; otherwise use `notableFields`.
4. **Fix the round-2 regressions:**
   - `si.json` `summary`: "If one of those programmes is what you want, you pay no tuition, but university dorms take private international students only in Maribor, so budget for the private market."
   - `dk-itu.json` and `data/dk/itu.json` `about`: delete ", with roughly 2,900 students in total" from the third sentence.
   - `ee.json` `institutions[0].note`: "three English-taught first-level degrees: Business Administration, Science and Technology, and a six-year integrated Medicine". Also delete the closing "For 2026 its admissions page listed 3 English-taught first-level programmes and 25 master's."
   - `ee.json` `institutions[4].note`: change the last sentence to "It is applied for through DreamApply, with 1 June as the EU/EEA deadline shown for the 2026/27 cycle."
5. **Finish the place-ranking sweep on the pages where round 2 started it:**
   - `ch.json` `housing`: "Zurich, Geneva and Lausanne have tight, expensive rental markets, and student halls…".
   - `lu.json` `costs.notes[2]`: "Living costs in Luxembourg are high, driven mainly by rent."
   - `lu.json` `housing`: "The country has an expensive rental market, and…".
   - `topics/distinctive-options.json` `options[7].what`: "Founded in Lausanne in 1893, and part of the Swiss universities of applied sciences system…".
   - Apply the same round-2 fixes to `data/destinations/{ch,ie,de,lu}.json` `whyConsider`/`watchOuts`, so that they do not come back when the profiles retire.
6. **Polish:**
   - `be.json` `institutions[10].note` (KdG): "English-taught bachelor's include International Business, Multimedia and Creative Technology, and Applied Computer Science, with a clearly signposted application route."
   - `hu.json` `ibRecognition.notes[3]`: "Of the medical schools on this page, Szeged is the one that publishes an IB exemption:".
   - `cz.json` `institutions[10].note`: "an entrance exam venue in Göteborg, a short trip from Denmark."
   - `data/institutions/dk-sdu.json` and `data/dk/sdu.json` `meta.notes[2]`: delete 'SDU calls it "Denmark's newest IT campus".' The pass's own rule says an attribution is not a source.

With changes 1 to 3 done, this is an 8. Adding change 4 makes it a 9.
