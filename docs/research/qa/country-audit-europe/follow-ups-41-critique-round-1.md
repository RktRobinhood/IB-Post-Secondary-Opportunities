# Follow-ups #41: Editor critique, round 1

Commit `910247f`, critic pass on 2026-09-26. Everything was judged against the repo's own records, because official sites were blocked. I rebuilt the site into a scratch `DIST_DIR` and read the rendered pages, not only the JSON.

## Score: 7 / 10

You can ship the commit. It is strictly better than what is live, and none of its edits sends a student the wrong way on a date or a fee. But issue #41 cannot be closed on it. The issue asked for the *class* to be fixed, with a guard that holds. The guard holds only for its own word list. About 25 unsourced rankings are still on cards, headlines and short versions, all in fields the guard reads, and a few of them sit on cards this pass edited. Four research-log rewrites also say more than the record holds ("not published yet").

## What is good

- **The rewrites are careful.** Of the 122 ranking rewrites, I checked about 60 against their own record (`founded`, `notableFields`, `englishBachelors`, fees, counts). None asserts a number or name that the record lacks. Several are better than the originals:
  - CZ Palacký: "English-taught medicine at 12,500 euros a year, against 15,200 to 24,250 elsewhere" makes the point with numbers.
  - SI Alma Mater: "eight English-taught bachelor programmes identified" removes a claim that contradicted Primorska's ten.
  - CH St. Gallen: "whose Assessment Year can be taken entirely in English".
  - GB tagline: "Offers in IB points before your results, and overseas fees since Brexit".
  - KR Korea University: now carries the record's caveat, "few majors are guaranteed fully in English".
- **The LSMU decision was right.** The pass refused to write a sentence its evidence does not support, and it says what would unlock the sentence.
- **`follow-ups-41.md` is an exemplary audit trail.** It has every before and after, and it is honest about what is out of scope (programme pages, `meta.notes`, whyConsider).
- **Two of the allow-list entries are honest.** LU's excerpt says it verbatim. EE's count comes from the national list, and the attestation says it was counted entry by entry. SI's entry is sourced, but see change 5.

## (a) Sample of rewrites: where they fall short

I read 35 closely. 26 are good as they stand. The other 9:

| # | Where | After-string | Problem |
|---|---|---|---|
| 1 | `si.json` `ibRecognition.notes[5]`, `language.notes[1]`, `watchOuts[2]` | "…are not published yet (as of September 2026)" | **Says more than the record holds.** The record said no page *we read* had it. The rewrite says nobody publishes it, and "yet" promises that someone will. A gap has been turned into a fact about the world. |
| 2 | `gr.json` `institutions[9].note` (Deree) | "tuition is not published, so ask the college" | Same fault. The record said "not published on the pages read". |
| 3 | `destinations/gb.json` `summary` | "For an IB student that removes an awkward problem: applying before you know your results." | **Reads backwards.** The UK *is* applying before your results. A student can read this as the UK letting you apply after them. |
| 4 | `si.json` and `destinations/si.json` `summary` | "If one of those programmes is what you want, you study it without tuition." | Repeats the summary's own first sentence, word for word in the destination record. Round 5 pointed to the numbers that make the value point (dorms €80–250 a month). The rewrite used neither. |
| 5 | `hu.json` `whyConsider[1]` | "…two Higher Level natural sciences , and it will consider…" | Stray space before the comma. It renders on `/destinations/hu/`. |
| 6 | `fi.json` `institutions[9].note` (Metropolia) | "Thirty-two English-taught listings…, fewer of them open to a school leaver, including creative degrees like game design…" | Hard to parse, and it reads as if the creative degrees are the closed ones. "Listings" is jargon. |
| 7 | `no.json` `institutions[5].note` (Oslo) | "Founded in 1811 — but for an IB student…" | The "but" answered "most prestigious". Against a founding year it is a non-sequitur. |
| 8 | `at.json` `institutions[2].note` (WU) | "A business and economics university on a modern campus by the Prater." | Flat. The record has "BBE, taught entirely in English, 240 places in 2026/27". |
| 9 | `ie.json` `institutions[0].note` (Trinity) | "its high-points courses are hard to reach" | Circular: high-points courses are hard to reach by definition. |

**Blandness as a pattern.** About 27 institution cards now open with "Founded in <year>", and 35 added lines carry a founding year. It is true, but it is the least useful fact on the card. On `/universities/` it also duplicates the "Founded" glance tile: Tartu's page says 1632 four times. Where the record holds a count, a fee or a named programme, use that first. Taking Uppsala as an example, "Eight international bachelor's, in Uppsala and on Gotland" is better than "Founded in 1477". While you are there, explain "student-nation": a 17-year-old will not know it.

## (b) What students still see

### Rankings in the fields the guard reads

Each item below is in `tagline`, `summary`, `institutions[].note` or `about`. I checked each one on the built page, and none has a source in the record.

- **Headlines**
  - BE `tagline` (country and destination): "Cheap, **excellent**, and mostly not in English".
  - FR `tagline` (both records): "the **famous** schools cost 100x that".
- **Short versions**
  - CH `summary`: "one of the **clearest** IB rules in Europe and one of the **strictest**" and "living costs are **the highest in Europe**". The destination record says the same.
  - GB `summary`: "The teaching and the offer system are **excellent**".
  - LU `summary`: "it is **unlike anywhere else** on this site". This is in the same field the pass edited.
- **Cards in the 20-country audit**
  - CH Lucerne: "Switzerland's **smallest and newest** public university".
  - CZ AMU: "the **world's fifth** university-level film school". This card was edited in this pass, and the phrase is also unclear: fifth what?
  - DE Rhine-Waal: "**one of the few** German institutions…".
  - EE EBS: "**the first** institution in the Soviet Union to teach business in English". The Soviet phrase was edited around and left in.
  - EE EMÜ: "a **top-100 world position**" and "**one of relatively few** in Europe".
  - FI Turku: "**one of the few** places in Europe where futures studies is a real discipline".
  - FI Laurea: "**close to unique** in English anywhere in the EU".
  - FR Paris-Saclay: "France's **highest-ranked** research university".
  - GB UCL: "**The broadest** subject range of any London university".
  - GB St Andrews: "**consistently top-ranked**".
  - NO UiT: "The world's **northernmost** university and **unique** for…".
  - SE Uppsala: "**unlike anywhere else** in Scandinavia". This card was edited in this pass, and Lund has student nations too.
  - SE Karolinska: "**World-famous** for medical research".
  - BE Vesalius: "**one of the few** places in Belgium…".
- **Cards outside the audit**
  - AU Deakin: "**well-regarded** sport science".
  - GR Ioannina: "**well-regarded** medical school".
  - HK Shue Yan: "Hong Kong's **first** private university… **well-regarded** journalism department".
  - IT Trento: "**well-regarded** student services".
  - IT Ca' Foscari: "**unlike anywhere else**".
  - KR POSTECH: "**famously** high staff-to-student ratio".
- **Denmark, the students' home page**
  - `data/institutions/dk-itu.json` `about`: "Denmark's **smallest and youngest** university".
  - `data/institutions/nl-erasmus.json` `about`: "**unlike anywhere else** in the Netherlands". This field was edited in this pass.

### Rankings outside the guard's fields, still rendered

- **The Denmark page.** `data/context-notes/dk-language-reality.json` says "The University of Copenhagen — **the country's largest and best known** university". This pass deleted "Denmark's oldest and largest" from UCPH's own record, but the claim is still on the home-country page.
- **HU page.**
  - `hu.json` `ibRecognition.notes[4]`: "Corvinus is **the most IB-literate** institution in Hungary". This is the same claim the pass removed from the Corvinus card.
- **EE page.**
  - `ee.json` `whyConsider[4]`: "describes itself as **the only place in northern Europe**…". The pass's own rule says an attribution is not a source, and it removed this claim from the card.
- **NZ university pages.** `nz.json` `institutions[1,5,6,7].englishBachelors` render as "In English:" on `/universities/nz-*`:
  - "New Zealand's **oldest**…, **famously** residential";
  - "**well-regarded** computing";
  - "New Zealand's **youngest**";
  - "New Zealand's **smallest**".

  The pass edited `englishBachelors` in GB, but the guard does not read that field.
- **Other whyConsider items.** AT "consistently ranked among the most liveable cities" and BE "one of the oldest universities in Europe" are already listed in `follow-ups-41.md` as out of scope. That is acceptable if a follow-up issue is filed.

### Research log still on Destination pages (the guard passes)

- **AT** `application.deadlines[0,1].notes`: "Precedent, read in German on medizinstudieren.at **on 23 September 2026**". These sit in the same deadline list as `[2]` and `[4]`, which this pass rewrote.
- **FR** `application.deadlines[14].notes`: "the CVEC portal, **read in French on 2026-09-23**".
- **SI** `application.deadlines[1].notes`: "Precedent, **read in Slovene** from the University of Ljubljana VPIS leaflet **on 23 September 2026**".
- **IT**
  - `ibRecognition.minimumPoints`: "No national minimum points figure **was found on an official page**".
  - `application.deadlines[6].notes`: "does not appear on any official page **cited here**".
- **PT** `costs.applicationFee`: "No application fee **was found**".
- **FI** Laurea card: "its 2027 dates were not on the page **when checked**".
- **EE** Tartu, TalTech and EMÜ cards: "**Its admissions page on 23 September 2026:** …". This is a borderline case.
- **BE** (×5): "Read in Dutch on the Flemish government's own site." This is also borderline. It tells the student that the source is in Dutch, which is useful, but it is phrased as an account of what a researcher did.

## (c) The guards

**`superlatives` catches the listed words, not the class.** I ran its own `rankings()` over 31 phrasings, and it missed 21 of them.

- Missed: "smallest", "youngest", "newest", "northernmost", "highest-ranked", "top-ranked", "top-100", "clearest", "strictest", "broadest", "fifth", "well-regarded", "famous", "World-famous", "excellent", "premier", "finest", "unlike anywhere", "one of the few", "the first private…", "ranked first", "No. 1".
- Caught: "best known" without a hyphen, which it catches only by chance, because it happened to be next to "largest".

Its own header already names the fix: the problem is "a claim that puts an institution or a place above or alone among others". The vocabulary does not follow that definition. The minimum fix has three parts:

1. Replace the closed superlative list with any `\w+est\b` word, plus `-most` words and `\w+-ranked`, inside the existing frames.
2. Add an unframed always-list: `ranked`, `top-\d+`, `well-regarded`, `highly regarded`, `famous(ly)?`, `renowned`, `prestigious`, `excellent`, `unique`, `unlike any(where)?`, `one of (the|relatively) few`, `the first \w+ (in|to)`, `best[- ]known`.
3. Read `institutions[].englishBachelors`, which renders on `/universities/`, and `ibRecognition.notes`. Round 5's "most IB-literate" lives in the second.

A false positive such as "the first cohort" or "the first year" is cheap to exempt. The current false negatives cost a critic round each.

**`research-log` has the same weakness.**
- "read on \d" misses "read in French on 2026-09-23", which is the commonest form still left.
- "pages? found" misses "was found on an official page".
- There is nothing for "when checked" or "cited here".

Add:
- `\bread in \w+ (?:on|from)\b`
- `\b(?:was|were) (?:not )?found\b`
- `\bwhen checked\b`
- `\bcited here\b`
- `\b(?:page|leaflet|portal) on \d{1,2} \w+ 20\d\d:`

Two more problems:
- **It ignores `DIST_DIR`.** Every other built-stage test honours it (`test-page-budget.mjs` and others), so an agent building elsewhere is checking a stale `dist/`.
- **It skips `/universities/`.** Every card on a Destination page links there, and the page renders the same `note` and `about` text. Programme pages have a separate owner question, as noted in the doc, but university pages are the same content.

**The allow-list is honest, with one caveat on SI** (change 5).

## Changes that would raise the score, ranked

1. **Close the vocabulary hole in `scripts/test-superlatives.mjs`, then fix what it finds** (see (c)).
   - Widen `SUPERLATIVE` and `ALWAYS`.
   - Add `institutions[].englishBachelors` and `ibRecognition.notes` to the strings read.
   - It will surface the ~25 items in (b). Rewrite each from its record, for example:
     - Paris-Saclay: "A science-led research university founded in 2019, strong in mathematics and physics…".
     - UiT: "In Tromsø, inside the Arctic Circle, and focused on Arctic, marine and space science…". Only use this if the city is in the record; otherwise "Focused on Arctic and polar research, space science and fisheries".
     - Karolinska: "A medical university that awards the Nobel Prize in Medicine."
     - CH `summary`: "Switzerland publishes a precise IB rule, and a strict one: …" and "living costs are high: ETH estimates CHF 22,100 a year…", using `watchOuts[4]`'s own figure.
     - LU `summary`: delete "and it is unlike anywhere else on this site".
     - BE `tagline`: "Cheap, well funded, and mostly not in English at bachelor level" or similar, with "excellent" removed.
     - FR `tagline`: "Public university costs €178 a year; the grandes écoles cost up to 100x that".
     - GB `summary`: cut "The teaching and the offer system are excellent;" and keep "the money is the problem".
2. **Fix the Denmark page.** In `data/context-notes/dk-language-reality.json` `text`, replace "the country's largest and best known university" with "founded in 1479, with about 36,800 students", which is UCPH's own record. In `data/institutions/dk-itu.json` and `data/dk/itu.json` `about`, replace "ITU is Denmark's smallest and youngest university, founded in 1999" with "ITU was founded in 1999, has about 2,900 students, and is". These are the students' home pages, and they currently contradict this pass's own UCPH edit.
3. **Undo the four overclaims.** Use the site's existing convention for "we have not seen it", which appears 45 times: "not confirmed here".
   - `si.json` `watchOuts[2]`: "IB-specific minimum points and a mapping onto the Slovenian Matura are not confirmed here; ask the ENIC-NARIC Centre or the faculty directly".
   - `si.json` `ibRecognition.notes[5]` and `language.notes[1]`: replace "are not published yet (as of September 2026)" with "are not confirmed here".
   - `gr.json` `institutions[9].note`: "tuition is not confirmed here, so ask the college".
4. **Rewrite the misleading GB sentence.** In `data/destinations/gb.json` `summary`, replace "For an IB student that removes an awkward problem: applying before you know your results." with "For an IB student that solves an awkward problem: you know the exact grades you need before you sit the exams."
5. **Quote the SI Maribor claim rather than extend it.** In `si.json` `institutions[1].note`, replace "and the only university where private international students can get a dormitory place: Study in Slovenia says they cannot stay in university dormitories "except in Maribor"" with "and Study in Slovenia says students coming on their own, not on exchange, cannot get a university dorm place "except in Maribor"". The same record's `housing` gives Ljubljana dorm places "where available" and accommodation information from Primorska and Nova Gorica, so the "only university" paraphrase is stronger than the record. Also update the ALLOW entry to the new substring.
6. **Close the research-log gaps.** Add the five patterns in (c) to `scripts/test-research-log.mjs`, honour `DIST_DIR`, and add `dist/universities/*`. Then rewrite:
   - AT `application.deadlines[0,1].notes`: "Precedent, from medizinstudieren.at (in German, as of 23 September 2026):".
   - FR `application.deadlines[14].notes`: "the CVEC portal says (in French)".
   - SI `application.deadlines[1].notes`: "Precedent, from the University of Ljubljana's Slovene VPIS leaflet for 2026:".
   - IT `ibRecognition.minimumPoints`: "No national minimum is published; each university and programme sets its own".
   - PT `costs.applicationFee`: "No application fee for the national contest is confirmed here".
   - FI Laurea: "its 2027 dates are not published yet".
7. **Finish the sweep on the pages round 5 named.** Remove "Corvinus is the most IB-literate institution in Hungary." from `hu.json` `ibRecognition.notes[4]`; the rest of that note makes the point. In `ee.json` `whyConsider[4]`, apply the pass's own attribution rule: "Tallinn University's Baltic Film, Media and Arts School teaches film, television and audiovisual production in English."
8. **Polish.**
   - `hu.json` `whyConsider[1]`: delete the space in "sciences , and".
   - `si.json` and `destinations/si.json` `summary`: replace the repeated last-but-one sentence with a number, for example "If one of those programmes is what you want, you pay no tuition and a dorm room, if you get one, costs €80–250 a month."
   - `at.json` `institutions[2].note`: open with "Its English-taught BBE had 240 places in 2026/27".
   - `fi.json` `institutions[9].note`: "32 English-taught listings for January 2027, though some are top-up degrees you cannot enter from school; they include game design and XR design."
   - `no.json` `institutions[5].note`: drop "Founded in 1811 — but" and start "For an IB student without Norwegian there is exactly one English bachelor's door…".

With 1–4 done, this is a 9: the class is closed and nothing on the page says more than the record.
