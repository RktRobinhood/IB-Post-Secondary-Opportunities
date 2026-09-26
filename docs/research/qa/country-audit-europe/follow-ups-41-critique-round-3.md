# Follow-ups #41: Editor critique, round 3

This critique covers main at `a5406e9`, which includes round 3 (`13a3f16`) and the planner's hand-off fixes (`a5406e9`: ITU, SDU and CBS; `HANDED_OFF` is now empty). It was written on 2026-09-26 by a critic who did not write or score rounds 1 and 2. The web was blocked, so every claim was checked against the repo's own records.

How I checked:
- I built the site with `DIST_DIR` into a private scratch folder (602 pages) and ran both guards against that build. Both pass.
- I read the rendered text (`htmlToText`) of every page except `/programmes/` and `/credits/`.
- I ran `rankings()` over every rendered line.
- I ran both guards' own rules over 75 phrasings I wrote to try to get past them.

## Score: 7 / 10

Round 3 did what it was asked to do, and did it accurately. I checked all 54 changed strings against their records. 49 are good, and none invents a fact. Every item that round 2 named is fixed, including the planner-owned ones. The cards, taglines and summaries are now clean: `rankings()` finds nothing there that is not in `ALLOW`. On the fields students meet first, the job is done.

It is not an 8, for the same structural reason as rounds 1 and 2. **The research-log guard still catches its fixtures, not the class.** I wrote 31 new phrasings in the same register, and it caught 1. Two live sentences on pages it claims to cover (17 pages in total) pass it. The superlatives rule is now good: it caught 29 of 44 new phrasings. But it reads only card fields. About 15 rankings of institutions and places render in the sector-landscape, context-note and guide prose next to those cards. Round 3's "Still open" says these "compare options for the student, not institutions". Several of them rank institutions: "Deree is the best known", "Some of the strongest teaching in the country is here", "Konstfack … are the best known".

None of this sends a student the wrong way on a date, a fee or a rule. Changes 1 to 3 below are about two to three hours of work. With them done, I would score this 8.

## (a) Round-3 rewrites, checked against their records

I compared all 54 rows in "Every string changed in round 3" with the same record. The fields I checked against were `englishBachelors`, `notableFields`, `housing`, `ibRecognition.notes`, sibling institution notes and the Evidence records.

**49 are good.** Several are better than the text round 2 suggested:
- **Hasselt, Aveiro, ISCTE and Sogang:** each now says what the record says (`englishBachelors` and `notableFields`), not what the institution is reputed for.
- **KdG:** the rewrite correctly refused to claim that Applied Computer Science is English-taught, because the record does not say so.
- **HU Szeged:** "the one that publishes" holds. `notes[6]` says Debrecen and Semmelweis offer no exemption, and Pécs's card says its IB position was not published.
- **Tartu:** "first-level degrees … six-year integrated Medicine" is now right.
- **AE and SG:** "see 'Living there' below" points to a real section heading that comes after Funding on both pages.
- **The Minerva line, the Denmark maritime note, the UCPH, AAU, BUas, Twente, TU Delft and Maastricht notes, and all the canonical Destination fixes:** these are clean.

**5 fall short:**

| # | Where | After | Problem |
|---|---|---|---|
| 1 | `data/countries/ee.json` `summary` | "Estonia is often described as teaching in English" | A weasel attribution replaced a reputation claim. Described by whom? Round 1's rule says an attribution is not a source. The fact the record holds is simpler: "Estonia teaches many master's degrees in English. At bachelor's level it does not." The Denmark page has the same shape unfixed (see (b)). |
| 2 | `data/countries/gb.json` `institutions[11].note` (Warwick) | "known for mathematics and economics" | This swaps one reputation word for another. Round 3 itself refused "Strong in…" for Hasselt on exactly this ground. (This note does not render; the Warwick school record replaces it.) |
| 3 | `data/countries/no.json` `institutions[8].note` (NTNU) | "with a Nobel-winning neuroscience institute" | Round 2 said to keep this only if the record says so. It does not: `notableFields` has "Neuroscience" and nothing about a prize. (This note does not render.) |
| 4 | `data/countries/si.json` `summary` | now correct | But the same page's `whyConsider[1]` still leads with "Living costs are genuinely low: a student dorm room is EUR 120-250 a month". That is the same omission round 2 flagged in the summary, one field over, on the same page. |
| 5 | `data/dk/dania.json` and `data/institutions/dk-dania.json` | "Its specific entry requirement is still English B, so plan on English B." | This says English B twice in one sentence. Better: "…meet the language requirement, but the specific entry requirement is still English B." |

**Fixes were not carried to their siblings.** Round 2's criticism was that a claim was fixed in one field and left in the next one. That pattern continues:
- **DK maritime and its siblings:** "Not yet researched in detail here. Recorded because it exists…" was rewritten on DK. Its exact twin is still on NL, and 25 "Not researched…" notes still render on 16 Destination pages.
- **Canonical records:** CA "Waterloo built its reputation" and NZ "Otago is famous" were fixed in `data/countries/` but not in `data/destinations/`:
  - `ca.json` `whyConsider[3]`;
  - `nz.json` `livingContext.housing`.

  Both still ship in `dist/data.json`. They would render the moment the profile retires, which is exactly the latent risk round 2 described.
- **The distinctive-options guide:** Minerva's "the pages we read" was fixed. Seven "not verified" siblings on the same guide were left.

## (b) What students still see

### Research log on pages the guard says it covers (`/destinations/`, `/universities/`, Denmark)

| Rendered on | Source | Text |
|---|---|---|
| `/destinations/se/`, 15 Swedish `/universities/` pages, `/timeline/` | `data/countries/se.json` `application.deadlines[4].notes` | "Master's results come a week earlier, on 1 April — that date is context here rather than a milestone of its own, **because nothing on this profile is a master's application**." |
| `/universities/nl-erasmus/` | `data/institutions/nl-erasmus.json` `meta.notes[0]` | "It is recorded at institution level **because that is where the model holds codes**, but it was published by the school rather than by the university." |
| `/destinations/{at,be×2,ch×2,cz,de,fr×3,gb,hu,ie×2,is×2,lu,lv×2,nl,pl×2,se,si×2}/` | `data/destinations/*.json` `sectorLandscape.routes[].note` | "Not researched in detail here." / "Not researched further." / "Not researched for IB applicants." / "Admission of an IB applicant was not researched here". Also, on IE: "Not researched in detail here, and worth knowing exists." (which is also broken grammar). |
| `/destinations/nl/` | `data/destinations/nl.json` `sectorLandscape.routes[3].note` | "Recorded because it exists and because a student who needs it will not find it in the ordinary listings." This is the twin of the DK note that round 3 rewrote. |
| `/destinations/lv/`, `/destinations/jp/` | `lv.json` `routes[3].note`, `jp.json` `routes[4].note` | "Recorded so the route is visible." / "Listed so that the route is visible." |
| `/destinations/{hu,ie,is,lv,no}/`, `/timeline/` | `data/countries/{hu,ie,is,lv,no}.json` `application.deadlines[].notes` (15 notes; 14 render) | "the year here is inferred from the intake **this profile covers**". "Profile" is repository vocabulary. The student needs "no year given; this site assumes 2027". |
| `/destinations/nl/` | `data/context-notes/nl-english-narrowing.json` `attribution` | "as recorded in this project's country research". The site cites itself as its own source. |

**Outside the guarded pages:**
- **`/prepare/`,** from `data/evidence/dk-national.json` `[11].interpretation`, rendered in an Evidence card: "**This corrects data/ib-conversion.json** rather than conflicting with anything. **Our file said** supplementary subjects… A Course Results student following **our sentence** would have…". A file path and an internal correction story, on the page a Year 1 student reads. The same page has, from `[2].interpretation`: "It is the only source found that covers…". This is the same leak the guard's own header excludes for `/programmes/`, but `/prepare/` is not excluded or read by anyone.
- **`/guides/distinctive-options/`,** from `data/topics/distinctive-options.json`:
  - `options[3].cost`: "Individual colleges were not verified."
  - `options[5].cost` and `options[6].cost`: "were not verified (here)".
  - `options[9].deadlineNote`: "were not verified".
  - `options[10].cost`: "Individual figures not verified."
  - `options[13].cost`: "that could not be verified here".
  - `options[14].cost` and `options[15].deadlineNote`: "Not verified."

  The site's convention is "not confirmed here".
- **Evidence furniture on every Destination page:** "Status: needs-review." appears 210 times. The paragraph above it already says it in English ("None has been signed off by a person yet"), so the line only adds a schema enum value. This is a template issue (`src/lib/primitives.mjs`), not a content one.

### Rankings in fields the superlatives guard does not read

Each of these is caught by `rankings()` itself. They pass only because the guard does not read the field.

| Rendered on | Source | Text | Rewrite from the record |
|---|---|---|---|
| `/destinations/gr/` | `destinations/gr.json` `sectorLandscape.routes[2].what` | "The American College of Greece (Deree) is the best known." | "The American College of Greece (Deree) is one." |
| `/destinations/se/` | `destinations/se.json` `routes[2].what` | "Konstfack, the Royal Institute of Art and the Stockholm University of the Arts are the best known." | "They include Konstfack, the Royal Institute of Art and the Stockholm University of the Arts." |
| `/destinations/se/` | `destinations/se.json` `sectorLandscape.summary` | "…of the same standing, and several are highly regarded." | "…of the same standing." |
| `/destinations/no/` | `destinations/no.json` `routes[2].what` | "Some of the strongest teaching in the country is here, and it is invisible if you only look at the universities." | "They are easy to miss if you only look at the universities." |
| `/destinations/de/` | `destinations/de.json` `routes[2].note` | "for the right student it is the strongest version of what Germany offers." | Delete the clause; end at "Worth knowing it exists." |
| `/destinations/de/` | `destinations/de.json` `routes[1].what` | "Excellent for engineering and business, and far better regarded by German employers than the English translation suggests." | "Many of their degrees are in engineering and business." |
| `/destinations/lt/` | `destinations/lt.json` `routes[1].what` | "Kauno kolegija, one of the largest, admits…" | "Kauno kolegija, for example, admits…" |
| `/destinations/us/` | `destinations/us.json` `routes[1].note` | "The best known are highly selective" | "Many are highly selective" |
| `/destinations/us/` | `destinations/us.json` `routes[0].what` | "at the famous names in the low single digits" | "at the most selective in the low single digits" (the wording round 3 used in `us.json` `selectionNotes`) |
| `/destinations/au/` | `destinations/au.json` `routes[2].note` | "Some of these providers are excellent and some are not registered…" | "Some of these providers are registered to enrol international students and some are not." |
| `/guides/distinctive-options/` | `options[3].what` | "AUC and UCR are the two best known, but the Netherlands has around eight…" | "The Netherlands has around eight…, including AUC and UCR:" |
| same | `options[3].whoItSuits` | "the closest thing in Europe to an American liberal arts college" | "close to an American liberal arts college" |
| same | `options[5].whoItSuits` | "one of the best-funded routes into a master's in Europe" | "a fully funded route into a master's in Europe" (the record's own `what` says full scholarships) |
| same | `options[10].whoItSuits` | "Denmark, with Maersk and one of the world's largest merchant fleets, is an unusually good place…" | "Denmark, home to Maersk, is a good place…" |
| `/denmark/` | `context-notes/dk-language-reality.json` `text` | "Denmark has a reputation for English-language higher education, and at master's level that reputation is earned." | "Denmark teaches many master's degrees in English. At bachelor's level it does not." |
| `/destinations/nl/` | `context-notes/nl-english-narrowing.json` `text` | "The Netherlands built its reputation with IB students on English-taught bachelor programmes" | "The Netherlands has long drawn IB students with English-taught bachelor programmes" |

**Guarded card fields with praise the rule does not catch** (these pass `rankings()`):
- `ca.json` `institutions[5].englishBachelors` (McMaster). It renders on `/universities/ca-mcmaster/` as "In English: Known for problem-based learning, which it pioneered in medicine and now uses." This is marketing, it claims to be first ("pioneered"), `firstClause()` cuts the sentence off mid-thought, and it does not answer the question the label asks. Use "All programmes".
- `ca.json` `institutions[18].englishBachelors` (Guelph). It renders as "In English: Four-year degrees with particular strength in agriculture, food, animal and…." Use "All programmes".
- `lt.json` `institutions[5].note` (VGTU): "an aviation engineering programme you will not find elsewhere in the region". This is a uniqueness claim the rule does not word-match.
- `kr.json` `institutions[13].note` (Chung-Ang): "many Korean screen actors and directors trained here". This is an unsourced claim; delete the clause.

**A policy question, not scored:** about 50 card notes open "Strong in…" or "Known for…". Round 3 refused "Strong in" for Hasselt because the record's `notableFields` does not establish strength. Either adopt "known for <notableFields>" as the house convention and say so in the guard header, or reword them all to "Its fields include…". At the moment the same claim is edited out in one card and left in fifty.

## (c) The guards

### `superlatives`

**The rule is now good.** On my 44 new phrasings it caught:
- "the leading university in Portugal";
- "Latvia's biggest university";
- "one of Asia's best";
- "among Europe's oldest";
- "a top-50 university";
- "with an elite reputation";
- all the other frames.

It missed soft praise:
- "known for";
- "strong in";
- "pioneered";
- "not find elsewhere";
- "far better regarded";
- "highly rated";
- "a world leader";
- "second to none";
- "unrivalled";
- "punches above its weight";
- "household name";
- "go-to";
- "often described as";
- "Ranks 12th".

**Its weakness is what it reads, not how it reads.** The "What it reads" list leaves out `sectorLandscape.summary`, `sectorLandscape.routes[].what` and `.note`, `whyConsider`, `data/context-notes/*.json` `text`, and `data/topics/*.json` `what` and `whoItSuits`. Every live ranking in the table above is in one of those fields.

**Exemptions:**
- **`ALLOW` has two entries,** and both rankings are supported by their Evidence records.
- **The Estonian entry misquotes its source.** It puts "Tallinn University has the most (six)" in quotation marks as if the page said it. That sentence is the record's `claim`, written by the researcher. The `excerpt` is a generic page description. The count is fair, because it can be read off the list, so say that instead: `source: 'counted from the national list: six of 27 (ev-ee-sie-bachelors-list)'`.
- **`elite(?! Institute)`, `(?<!public |6G )flagship` and the `ITS` rule are honest,** narrow and tested.

### `research-log`

**This is still a list of every phrase a critic has quoted.** All 17 patterns round 3 added come from round 2's table, and they catch those phrases. I ran it on 31 phrasings in the same register that nobody has quoted yet. It caught one, "The dateState is open.". It missed:
- "Not researched in detail here";
- "Recorded because it exists";
- "nothing on this profile";
- "where the model holds codes";
- "This corrects data/ib-conversion.json";
- "Our file said";
- "this project's country research";
- "were not verified";
- "page gives no year";
- "the year here is inferred";
- "Per the round-5 audit";
- "ev-ee-sie-bachelors-list";
- "See data/evidence/ee.json";
- "The date_state is open".

**The exemptions are honest.**
- **`HANDED_OFF` is empty.** The design that fails when a fix lands worked: the planner fixed all three hand-offs and the list emptied.
- **`CAMEL_OK` holds real product names only.**

**Its scope is too narrow.** It does not read `/prepare/`, `/guides/`, `/compare/`, `/faq/`, `/glossary/`, the home page or the Denmark sub-pages. The worst leak on the site, the file path on `/prepare/`, is on one of those.

**What would make it catch the class instead of the cases:**
- **Flag the repository's own nouns,** whatever verb surrounds them:
  - `\bthis (?:profile|project|record|pass|audit|sweep)\b`
  - `\bthe (?:model|schema|record)\b` (exempt "the record" only if a real use turns up)
  - `\bdata\/[\w\/-]+\.json\b`, `\b\w+\.json\b`
  - `\bev-[a-z]{2,}-[\w-]+\b`
  - `\b[a-z]+_[a-z_]+\b` (snake_case field names)
  - `\bour (?:file|sentence|research|record)s?\b`
- **Flag the research verbs** in the passive and in the negative:
  - `\b(?:not |were not |was not |is not )?(?:researched|verified)\b` in running text. Exempt the trust page's labelled counts. Exempt "verified electronically", which is the student's own action, by allowing `verified (?:automatically|electronically|in Studielink)`.
  - `\b(?:Recorded|Listed) (?:because|so)\b`
  - `\binferred from\b`
  - `\bpage gives no\b`
- **Read every student page.** Add `/prepare/`, `/guides/*`, `/compare/`, `/faq/`, `/glossary/`, `/denmark/*` and `/index.html`. Leave `/programmes/`, `/trust/`, `/counsellors/` and `/credits/` out, and say why in the header.
- **Add the 31 phrasings above as fixtures.**

## Changes that would raise the score, ranked

1. **Take the research log off the pages the guard covers, and off `/prepare/`** (15 minutes):
   - **`data/countries/se.json` `application.deadlines[4].notes`:** "Bachelor's results. Master's results come a week earlier, on 1 April. If you applied in this round at all, this is your day."
   - **`data/institutions/nl-erasmus.json` `meta.notes[0]`:** "The IBIS institute code 034892 is published on the admission page of RSM, Erasmus's business school, for graduated applicants who want their IB results verified electronically. RSM publishes it; the university itself does not."
   - **`data/evidence/dk-national.json` `[11].interpretation`:** delete the first two sentences and the fourth. Start at "A supplementary course can do two different jobs: GSK fills a subject gap for somebody whose examination already qualifies them, and hf-enkeltfag raises the level of the examination itself. Course Results reaching a university bachelor need hf-enkeltfag; a GSK course leaves the level unchanged." Keep the last sentence, which begins "GSK is the right tool…". Also fix `ib-conversion.json` if its sentence is still wrong.
   - **`[2].interpretation`:** "the only source found that covers" becomes "the source that covers".
   - **`data/context-notes/nl-english-narrowing.json` `attribution`:** name the bill and cite a public source from `data/evidence/nl.json`, or delete the line. Do not cite "this project's country research".
2. **Sweep the gap wording on Destination pages to the site's convention**, as round 3 did for DK (30 minutes):
   - **All 25 rendered "Not researched…" notes in `sectorLandscape.routes[].note`:** "Not covered in detail on this site; ask the institutions directly." Where a note already says something useful, keep that part: "Taught in French; not covered in detail on this site." or "Flanders only; not covered in detail on this site."
   - **NL `routes[3].note`:** "Not covered in detail on this site. It is listed because these schools do not appear in the ordinary programme listings."
   - **LV `routes[3].note` and JP `routes[4].note`:** delete "Recorded so the route is visible." and "Listed so that the route is visible."
   - **The 15 deadline notes:** "the year here is inferred from the intake this profile covers" becomes "no year is given, so this site assumes the 2027 intake".
   - **The 8 "not verified" lines on the guide:** "…are not confirmed here; ask admissions for the fee schedule."
3. **Fix the 16 live rankings in the table in (b)** with the texts given there. **Widen `superlatives` to read** `sectorLandscape.summary`, `sectorLandscape.routes[].what`/`.note`, `whyConsider`, `context-notes` `text` and `topics` `what`/`whoItSuits`. Add `known for|strong in` only if the house decides against them (see the policy question). Always add `not (?:find|found) elsewhere`, `far better regarded`, `pioneer(?:ed|ing)?`, `second to none`, `unrivalled`, `world leader` and `often described as`.
4. **Widen `research-log`** with the noun and verb patterns in (c), read every student page, and add the 31 phrasings as fixtures. This is what stops a fourth round finding a fourth layer.
5. **Carry round 3's fixes to their siblings:**
   - `data/destinations/ca.json` `whyConsider[3]`: "Waterloo is built around it."
   - `data/destinations/nz.json` `livingContext.housing`: "Otago runs an almost entirely residential first year in Dunedin."
   - `data/countries/si.json` `whyConsider[1]`: "Living costs are low: a student meal costs about EUR 4.37, but university dorms take private international students only in Maribor, so budget for the private market."
   - `ee.json` `summary`: "Estonia teaches many master's degrees in English. At bachelor's level it does not."
   - `gb.json` `institutions[11].note` (Warwick): "A campus university whose fields include mathematics, economics, business and engineering;".
   - `no.json` `institutions[8].note` (NTNU): drop "with a Nobel-winning neuroscience institute", or add the Evidence for it.
6. **Polish:**
   - `ca.json` `institutions[5].englishBachelors` and `[18].englishBachelors`: "All programmes".
   - `lt.json` `institutions[5].note`: end at "including an aviation engineering programme".
   - `kr.json` `institutions[13].note`: delete "; many Korean screen actors and directors trained here".
   - Dania ×2: the sentence given in (a) #5.
   - In `scripts/test-superlatives.mjs` `ALLOW[0].source`: stop quoting the claim as though it were the page's words.
   - Template: drop the "Status: needs-review." line under each source in the Destination Evidence disclosure (`src/lib/primitives.mjs`). The sentence above it already says it in English.

With changes 1 to 3 done, this is an 8. With change 4 as well, I would expect the next critic to find nothing new in this class, which is what a 9 means here.
