# Updating the site: the yearly playbook

Step-by-step recipes for the changes that come round every year. Each one was
tried on a copy of this repository in September 2026, and `npm test` passed
afterwards.

You need two things open: the project folder in VS Code, and a terminal in that
folder (VS Code: **Terminal → New Terminal**). Every command below is typed
there.

## Three rules before anything else

1. **Never run `npm run migrate:dk`.** Danish data used to be edited in
   `data/dk/` and then converted. That conversion ran once, and the Danish
   records have been improved by hand since then. Running it again throws that
   work away, so it now refuses to run without `--force`. Edit the records in
   `data/programmes/` and `data/opportunities/` directly, as the recipes below
   show.
2. **Never invent a figure.** If the university does not publish it, leave the
   field out. A missing number is honest. A number that looks right but is wrong
   is worse, because nobody will check it.
3. **Only a person can mark a source `verified`,** and not the person who wrote
   the record. See recipe 10.

## The loop you will use every time

```bash
npm run validate     # 5 seconds: are the files well-formed, do all the ids match up?
npm run dev          # builds the site and serves it at http://localhost:4321, rebuilding when you save
npm test             # about a minute: every check the live site has to pass
```

`npm test` is the same check GitHub runs before it publishes. If it passes on
your machine, the site will deploy.

To find something across all the data, use VS Code's search (**Ctrl+Shift+F**).
Most recipes start with "search for the id".

---

## Where each fact lives

| The fact | The file you edit | Where it shows up |
| --- | --- | --- |
| Danish programme: entry requirements, cut-off, start month, capacity note, selection notes | `data/opportunities/dk-<inst>-<programme>-2027-autumn.json` | `/programmes/<that id>/`, the university page, Find a degree (`/programmes/`), Check my subjects (`/planner/`) |
| Danish programme: name, degree title, ECTS, years, subject area, summary, official link | `data/programmes/dk-<inst>-<programme>.json` | The same pages |
| University: description, links, campuses, "known for" | `data/institutions/dk-<inst>.json` | `/universities/dk-<inst>/`, `/denmark/`, `/universities/` |
| City: map position and the short description of the city | `data/places/<country>-<city>.json` | Maps on university, Denmark and country pages |
| Where a fact came from, and whether a person has checked it | `data/evidence/<country>.json` (Danish: `dk.json`; national rules: `dk-national.json`) | "Sources" boxes on every page, `/trust/` |
| Danish application dates (optagelse.dk, 15 March, documentation deadline) | `data/application-routes/dk-optagelse-international-2027.json` | `/timeline/`, `/denmark/apply/`, programme pages |
| Danish text written into the page code (15 March, SU rates, the step-by-step guide) | `src/pages/denmark.mjs` | `/denmark/`, `/denmark/apply/`, `/denmark/money/` |
| Danish IB conversion tables, as shown on the page | `data/ib-conversion.json` | `/denmark/ib-conversion/` |
| Danish IB conversion tables, as used by the subject checker | `data/recognition/dk.json` | `/planner/`, programme pages |
| IB results day and the transcript deadline | `data/ib-calendar.json` | `/timeline/` and every route that mentions results day |
| Another country: everything on its page, including its list of universities and its deadlines | `data/countries/<code>.json` | `/destinations/<code>/`, `/europe/` or `/world/`, `/compare/`, `/timeline/` |
| Another country: the newer, source-backed version of its rules, fees and sector | `data/destinations/<code>.json` (where it exists, it wins over the profile) | The same pages |
| Another country: application dates as a route | `data/application-routes/<code>-*.json` | `/timeline/`, the country page |
| Dutch programmes (the only other country with programme-level records) | `data/institutions/nl-*.json`, `data/programmes/nl-*.json`, `data/opportunities/nl-*.json` | `/universities/nl-*/`, `/programmes/`, `/planner/` |
| A university's IB recognition statement (the "IB transcripts sent here" line) | `data/ib-statements.json` | University cards |
| Photographs and their credits | `data/images.json` (+ the picture in `src/assets/img/places/`) | Everywhere, credits on `/credits/` |
| Which photos open the home page | `data/site-config.json` → `homeDoors` | `/` |
| "May 2027 IB session · Autumn 2027 entry" | `src/lib/layout.mjs` → `SITE.cycle` | The top and bottom of every page, `/about/` |
| Rollover dates for the freshness report | `data/freshness-policy.json` → `rollover` | `npm run rollover` |
| Guides | `data/topics/*.json` | `/guides/<name>/` |
| Glossary and FAQ | `src/pages/meta.mjs` (text in the code) | `/glossary/`, `/faq/` |

`data/dk/<inst>.json` is the original research for each Danish university. **The
site does not read it.** Keep it in step as your notes if you like. The one
thing it still does: the photo scripts look there to find Danish universities
(see recipe 4).

---

## What the error messages mean

| You see | It means | Fix |
| --- | --- | --- |
| `Expected double-quoted property name at line 14, column 24` | A JSON typing mistake, usually a comma too many or too few | Go to that line. JSON needs a comma between items and none after the last one |
| `unknown field — the schema does not allow "startMonht" here` | A misspelt field name | Correct the spelling. Copy field names from an existing file |
| `expected boolean, got string "yes"` | `true`/`false` written as text | Write `true` or `false` with no quotes |
| `no Place with id "dk-kobenhavn"` | The id doesn't match any file in `data/places/` | Use an existing id (look in the folder) or create the place (recipe 4) |
| `no Evidence with id "ev-…"` | A source id that doesn't exist | Check the spelling, or add the evidence record (recipe 10) |
| `duplicate opportunity id "…": fileA and fileB` | Two files claim the same id | Give one of them a different `id` *and* file name |
| `ev-…: no sourceClass — what this source may establish is undeclared` | An evidence record without `sourceClass` | Add one (table in recipe 10) |
| `shorter than 30 characters` | Some description fields have a minimum length | Write a full sentence |
| `FAIL  release … TypeError: Invalid URL … input: 'https://…'` | A `url` somewhere is a placeholder, not a real address | Search `data` for the text shown after `input:` and paste the real address |
| `FAIL  floor … N of M cite no source of their own: X` | A university on a country page has no link to its own website | Give it `website` and `admissionsUrl` on its own domain |
| `FAIL  ib-statements … not institutions on the site: dk-ruc` | You removed a university but not its IB statement | Recipe 5, step 3 |
| `FAIL  a Danish Institution page still sits under Denmark`, `FAIL  a Dutch Programme page does not sit under Denmark`, `kr-gks-embassy-2027 is gone` | A test uses Aarhus University, TU Delft Aerospace or a 2027 route as its example, and you removed or renamed it | Recipe 5 note, recipe 8 step 11, Rough edges |

`npm run freshness` ends with an npm error today. That is expected: 8 sources are
marked `conflicting` on purpose (a university's own pages disagree with each
other), and the report exits with an error while any conflict exists.
`npm test` treats it as a note, not a failure.

---

## 1. Change a Danish programme's requirements or cut-off

**When:** the programme page shows a new subject rule, a new minimum grade, or
last summer's cut-off has been published.

**File:** `data/opportunities/dk-<inst>-<programme>-2027-autumn.json`.

**A requirement.** Find the rule in `requirements` and change its fields
together. The `label` is what the page shows; `subject`, `level` and `minGrade`
are what the subject checker uses.

```json
{
  "id": "req-all-1",
  "kind": "local-equivalency",
  "mandatory": true,
  "label": "Mathematics at A level, minimum grade 7",
  "subject": "Mathematics",
  "levelScale": "dk-abc",
  "level": "A",
  "minGrade": 7,
  "gradeScale": "dk-7-point",
  "operator": "at-least",
  "applicability": { "intake": "2027-autumn", "applicantGroup": "any" },
  "evidence": ["ev-en-itu-dk-2ox9v8"]
}
```

- `minGrade` and `gradeScale` are optional. Leave both out if there is no grade
  requirement.
- `subject` must be spelled the way the Danish table spells it: `Mathematics`,
  `English`, `Physics`, `Chemistry`, `Biology`, `Biotechnology`, `Geoscience`,
  `History`, `Social Studies`, `International Economics`, `Danish`,
  `Second Foreign Language`. A different spelling still passes every check, but
  the subject checker can't match it and shows students "Needs review".
- A rule where students need one of several combinations is a
  `subject-combination` block with `alternatives`. Copy one from
  `data/opportunities/dk-aau-energy-engineering-2027-autumn.json`.

Also paste the university's new wording into `officialRequirementsText[0].text`,
word for word, and set `meta.dataAsOf` to today.

**A cut-off.** Add the new year **at the top** of `admission.historicalCutoffs`.
The page only shows the first one. Keep the older ones below it.

```json
"historicalCutoffs": [
  { "intake": "2027-autumn", "quota": "Quota 1", "value": "6.4", "scale": "dk-7-point", "evidence": ["ev-en-itu-dk-2ox9v8"] },
  { "intake": "2026-autumn", "quota": "Quota 1", "value": "5.9", "scale": "dk-7-point", "evidence": ["ev-en-itu-dk-2ox9v8"] }
]
```

`value` is text in quotes. If there was no cut-off (everyone qualified was
admitted), write what the university says, e.g. `"All qualified applicants"`.
The page then shows "Restricted" rather than a number. Only `intake` and `value`
are required.

**The source.** Open the evidence record named in `evidence` (in
`data/evidence/dk.json`) and set `retrievedAt` to today. Recipe 10 has the rest.

**Run:**

```bash
npm run validate
npm run verify -- --id ev-en-itu-dk-2ox9v8 --verbose
npm test
```

`npm run verify` re-reads the page and confirms that the subject and level are
still printed there. **It does not check grades or cut-off numbers.** Those you
check yourself.

---

## 2. Add a new English-taught programme at an existing Danish university

**When:** a university starts teaching a bachelor's in English.

**Files:** one programme file, one opportunity file per campus, and one evidence
record. Choose the ids first:

- programme: `dk-<inst>-<name-in-lowercase-with-hyphens>`, e.g. `dk-aau-sustainable-energy-systems`
- opportunity: the programme id plus `-2027-autumn`
- on two campuses: the programme id plus the campus plus `-2027-autumn`, e.g.
  `dk-aau-sustainable-energy-systems-esbjerg-2027-autumn`

The file name is always the id plus `.json`.

**One degree on two campuses, or two degrees?** If the curriculum and degree
title are the same, it's one programme file with two opportunity files. If the
two campuses teach different things under the same name (SDU Software
Engineering in Vejle and Sønderborg is like this), make two programme files.

**`data/programmes/dk-aau-sustainable-energy-systems.json`**

```json
{
  "id": "dk-aau-sustainable-energy-systems",
  "institution": "dk-aau",
  "name": "Sustainable Energy Systems",
  "credential": {
    "comparableLevel": "bachelor",
    "structure": "standard",
    "localTitle": "Bachelor i teknisk videnskab",
    "localTitleEn": "BSc in Engineering",
    "abbreviation": "BSc",
    "eqf": 6,
    "ects": 180,
    "years": 3,
    "title": "BSc in Engineering",
    "level": "bachelor"
  },
  "field": { "primary": "engineering" },
  "summary": "Two or three plain sentences: what you study, how it is taught, where graduates go.",
  "links": {
    "official": "https://www.en.aau.dk/education/bachelor/sustainable-energy-systems",
    "admissions": "https://www.en.aau.dk/education/bachelor/sustainable-energy-systems/admission"
  },
  "evidence": ["ev-aau-sustainable-energy-systems"],
  "meta": { "schemaVersion": "1.0", "dataAsOf": "2026-09-24" }
}
```

Required: `id`, `institution`, `name`, `credential.comparableLevel`, `meta`.
Everything else is optional but should be filled in. For the Danish titles (BSc,
BEng / diplomingeniør, professionsbachelor), copy `credential` from an existing
programme with the same degree. `field.primary` is one of `engineering`,
`computing`, `natural-sciences`, `mathematics`, `business`, `economics`,
`social-sciences`, `law`, `humanities`, `languages`, `education`, `health`,
`medicine`, `design-architecture`, `arts-music`, `agriculture-environment`,
`hospitality-tourism`, `interdisciplinary`, `other`.

**`data/opportunities/dk-aau-sustainable-energy-systems-esbjerg-2027-autumn.json`**
(for one campus only, drop the campus from the id and file name)

```json
{
  "id": "dk-aau-sustainable-energy-systems-esbjerg-2027-autumn",
  "programme": "dk-aau-sustainable-energy-systems",
  "institution": "dk-aau",
  "destination": "dk",
  "place": "dk-esbjerg",
  "intake": "2027-autumn",
  "startMonth": "September",
  "language": { "instruction": "English", "fullyInLanguage": true },
  "admission": {
    "restricted": true,
    "historicalCutoffs": [
      { "intake": "2026-autumn", "quota": "Quota 1", "value": "6.8", "scale": "dk-7-point", "evidence": ["ev-aau-sustainable-energy-systems"] }
    ]
  },
  "requirements": [
    {
      "id": "req-entry-award",
      "kind": "ib-diploma",
      "mandatory": true,
      "label": "A qualifying upper-secondary examination",
      "applicability": { "intake": "2027-autumn", "applicantGroup": "any" },
      "evidence": ["ev-ufsn-ib-course-results"]
    },
    {
      "id": "req-all-1",
      "kind": "local-equivalency",
      "mandatory": true,
      "label": "English at B level",
      "subject": "English",
      "levelScale": "dk-abc",
      "level": "B",
      "operator": "at-least",
      "applicability": { "intake": "2027-autumn", "applicantGroup": "any" },
      "evidence": ["ev-aau-sustainable-energy-systems"]
    },
    {
      "id": "req-all-2",
      "kind": "local-equivalency",
      "mandatory": true,
      "label": "Mathematics at A level, minimum grade 4",
      "subject": "Mathematics",
      "levelScale": "dk-abc",
      "level": "A",
      "minGrade": 4,
      "gradeScale": "dk-7-point",
      "operator": "at-least",
      "applicability": { "intake": "2027-autumn", "applicantGroup": "any" },
      "evidence": ["ev-aau-sustainable-energy-systems"]
    }
  ],
  "officialRequirementsText": [
    { "text": "The university's own wording of the entry requirements, word for word.", "language": "en", "official": true }
  ],
  "cost": [
    { "applicantGroup": "eu-eea-ch", "feeStatus": "no-fee", "priceYear": "2026/27", "evidence": ["ev-aau-sustainable-energy-systems"] }
  ],
  "applicationRoutes": ["dk-optagelse-international-2027"],
  "evidence": ["ev-aau-sustainable-energy-systems", "ev-ufsn-ib-course-results"],
  "meta": { "schemaVersion": "1.0", "dataAsOf": "2026-09-24" }
}
```

- Required: `id`, `programme`, `institution`, `destination`, `intake`,
  `language`, `meta`. Fill in everything else you can find. Leave out what you
  can't.
- `place` must be an existing file in `data/places/`. For a new town, see
  recipe 4.
- `historicalCutoffs` is optional. Leave it out for a brand-new programme.
- The `req-entry-award` block above is the short form. Better: copy the whole
  `req-entry-award` block from any existing Danish opportunity (it has the
  Agency's wording and the Course Results route). It is the same on every Danish
  programme.
- Copy the whole file for the second campus and change `id` and `place`.

**The source.** Add one evidence record to the end of `data/evidence/dk.json`
(recipe 10 has the template). Its `supports` should list the programme and each
opportunity:

```json
"supports": [
  { "entity": "dk-aau-sustainable-energy-systems", "field": "summary" },
  { "entity": "dk-aau-sustainable-energy-systems-aalborg-2027-autumn", "field": "requirements" },
  { "entity": "dk-aau-sustainable-energy-systems-esbjerg-2027-autumn", "field": "requirements" }
]
```

**Also:** if the university's `about` text or its
`languageOfInstruction.englishTaughtUndergraduate` (`few` / `some` / `many`) in
`data/institutions/dk-aau.json` counts its English programmes, update it.

**Run:** `npm run validate`, then `npm run dev` and open
`/universities/dk-aau/`. Each campus appears as its own card and gets its own
page. Then `npm test`.

---

## 3. Remove a Danish programme

**When:** a programme closes, or switches to Danish.

1. Delete `data/opportunities/<its id>-2027-autumn.json` (every campus).
2. Delete `data/programmes/<its id>.json`, unless another opportunity still uses
   it.
3. Search the `data` folder for the programme id. In `data/evidence/dk.json`,
   remove each `supports` line that names it. If that leaves a record's
   `supports` list empty, delete the whole record. Otherwise the validator
   stops with `supports: needs at least 1 item(s), has 0`. The national record
   `ev-ufsn-ib-course-results` also lists every Danish opportunity, so remove
   the line there as well.
4. If the university's `about` counts its English programmes, update it.

**Run:** `npm run validate` and `npm test`. Nothing fails if you forget step 3,
but the source-change report will keep listing a programme that no longer
exists.

---

## 4. Add a new Danish university

**When:** a university, university college or business academy starts an
English-taught bachelor's you want to list.

**a. The town.** Look in `data/places/` for `dk-<town>.json`. If it isn't there,
create it. Use the town centre's coordinates (copy them from Wikipedia's
coordinates link) and say honestly that they are the town, not the campus:

```json
{
  "id": "dk-horsens",
  "destination": "dk",
  "name": "Horsens",
  "kind": "city",
  "coordinates": { "lat": 55.8607, "lon": 9.8503 },
  "coordinatePrecision": "city",
  "character": "One or two sentences about the town for a student. Optional.",
  "meta": { "schemaVersion": "1.0", "dataAsOf": "2026-09-24" }
}
```

`coordinatePrecision` is `campus` only if you took the pin from the campus
itself. The map test fails if the point is outside Denmark, which catches
swapped latitude and longitude.

**b. The university: `data/institutions/dk-via.json`**

```json
{
  "id": "dk-via",
  "destination": "dk",
  "name": "VIA University College",
  "shortName": "VIA",
  "localName": "VIA University College",
  "type": "university-college",
  "founded": 2008,
  "places": ["dk-horsens"],
  "about": "Two or three plain sentences: what kind of place it is, where, and what an IB student should know first.",
  "knownFor": ["Engineering", "Business"],
  "links": {
    "website": "https://en.via.dk",
    "admissions": "https://en.via.dk/admission",
    "wikipedia": "https://en.wikipedia.org/wiki/VIA_University_College"
  },
  "languageOfInstruction": { "primary": "Danish", "englishTaughtUndergraduate": "few" },
  "evidence": ["ev-via-global-business-engineering"],
  "meta": { "schemaVersion": "1.0", "dataAsOf": "2026-09-24" }
}
```

Required: `id`, `destination`, `name`, `type`, `meta`. `type` is one of
`research-university`, `technical-university`, `business-school`,
`university-college`, `business-academy`, `art-academy`, `music-conservatoire`,
`other`. Optional but useful: `codes.ibResultsService` (the IBIS code your
coordinator needs) and `meta.notes` (a list of sentences shown under "Worth
knowing").

**c. Its programmes:** exactly as recipe 2.

**d. Its source:** one or more evidence records (recipe 10). At least one should
support the institution: `{ "entity": "dk-via", "field": "about" }`.

**e. The page.** Nothing else to do. The university page (`/universities/dk-via/`),
its card on `/denmark/` and `/universities/`, and its map pin are all built from
these files. Until it has a photograph it shows a plain lettered panel, and that
is the intended look.

**f. A photograph (optional).** The photo script only knows about Danish
universities that have a file in `data/dk/`. Create a small one,
`data/dk/via.json`:

```json
{
  "id": "via",
  "name": "VIA University College",
  "shortName": "VIA",
  "website": "https://en.via.dk",
  "admissionsUrl": "https://en.via.dk/admission",
  "wikipedia": "https://en.wikipedia.org/wiki/VIA_University_College",
  "programmes": []
}
```

Then continue with recipe 9: `npm run images -- --only=via`, look at the picture,
approve it. The key is the bare `via`. The site finds it for `dk-via`.

**Run:** `npm run validate`, `npm run dev` (look at `/universities/dk-via/` and
`/denmark/`), `npm test`.

> **Alternative: the migration, on a copy.** If you already have the research in
> the old `data/dk/` format, you can convert it. Do this in a *copy* of the
> project folder, never in the real one: add the research file there, run
> `node scripts/migrate-denmark.mjs --force`, then `node scripts/migrate-credentials.mjs --write`
> and `npm run migrate:scales`. Copy **only** the new files (`data/places/dk-<town>.json`,
> `data/institutions/dk-<inst>.json`, `data/programmes/dk-<inst>-*.json`,
> `data/opportunities/dk-<inst>-*.json`) back into the real project, and paste
> the new evidence records (the ones whose `sourceUrl` is on the new
> university's website) into the real `data/evidence/dk.json`. Then give each of
> those records `"sourceClass": "institutional-guidance"`, which the migration
> leaves out and the validator requires, and add the `req-entry-award` block to
> each opportunity. This was tested. It saves typing only if the research file
> is already written.

---

## 5. Remove a Danish university

1. Delete its files: `data/institutions/dk-<inst>.json`,
   `data/programmes/dk-<inst>-*.json`, `data/opportunities/dk-<inst>-*.json`.
2. Its town: search the `data` folder for `"dk-<town>"`. If nothing else uses
   it, you may delete `data/places/dk-<town>.json`. Keeping it does no harm.
3. In `data/ib-statements.json`, delete the entry `"dk-<inst>": { … }` under
   `statements`. **`npm test` fails if you forget this.**
4. Search `data/evidence/` for `dk-<inst>`. Delete records whose `supports` only
   name this university and its programmes (in `dk.json` and
   `ib-statements.json`), and remove its lines from records that support other
   things too (`ev-ufsn-ib-course-results` again).
5. Delete `data/dk/<inst>.json`, so the photo scripts stop fetching for it. The
   entry in `data/images.json` can stay; nothing shows it.
6. If `data/site-config.json` → `homeDoors` uses its photo, choose another
   (recipe 9).

**Run:** `npm run validate` and `npm test`.

Removing **Aarhus University (`dk-au`)** fails two checks in `npm test` even
when you've done everything right, because they use it as their example (see
Rough edges).

---

## 6. Add, change or remove a university in another country

For every country except Denmark and the Netherlands, the universities live in
**one list** inside `data/countries/<code>.json`, under `institutions`. There
are no separate files.

**Change one:** edit its entry and move the file's `dataAsOf` (near the top) to
today. If you used a new page, add it to the file's `sources` list:

```json
{ "title": "Lund University - entry requirements", "url": "https://www.lunduniversity.lu.se/study/admission-degree-studies/entry-requirements", "retrieved": "2026-09-24" }
```

Paste the whole address. A placeholder like `https://…` crashes the release
check with `TypeError: Invalid URL`.

**Add one:** add an entry to the `institutions` list (mind the comma after the
entry before it):

```json
{
  "name": "Linnaeus University",
  "shortName": "LNU",
  "city": "Växjö",
  "type": "Research university",
  "founded": 2010,
  "website": "https://lnu.se/en/",
  "admissionsUrl": "https://lnu.se/en/education/apply/",
  "ibPageUrl": null,
  "englishBachelors": "What it teaches in English, in a sentence.",
  "notableFields": ["Business", "Computer science"],
  "note": "One sentence a student would want to know.",
  "wikipedia": "https://en.wikipedia.org/wiki/Linnaeus_University"
}
```

- `name` is required. `website` and `admissionsUrl` should both be on the
  university's own domain. On a country that has a `data/destinations/<code>.json`
  file, the publication check (`floor`) fails without that.
- Canada, the USA, Australia, Belgium, Spain, France, Greece, Portugal, China,
  Singapore and the UAE have regional application systems. Copy the
  `jurisdiction` value from a neighbour in the same province or state, e.g.
  `"jurisdiction": "ca-on"` for Ontario. Otherwise the `floor` check says the
  university "is on no route".
- **The map pin:** run

  ```bash
  npm run geocode -- --only=se
  ```

  It looks the university up on Wikidata, creates `data/places/se-<city>.json`
  if needed, and adds `"place": "se-…"` to your entry. (Tested: it added
  `se-vaxjo` for Linnaeus.) You can also type `"place"` yourself with an
  existing id from `data/places/`. **No check catches a mistyped place id.**
  The university just has no pin, so look at the map.
- **A photograph:** `npm run images -- --only=se-lnu` (the key is the country
  code plus the `shortName` in lowercase), then recipe 9.

**Remove one:** delete its entry from the list, then delete its line in
`data/ib-statements.json` (the key is the country code plus its short name,
e.g. `se-slu`). `npm test` fails with `not institutions on the site` if you
forget. Optionally delete its `ev-ibrs-…` record in
`data/evidence/ib-statements.json`.

**Run:** `npm run validate`, then `npm run dev` and open `/destinations/se/`,
then `npm test`.

**The Netherlands** is the one other country with programme-level records.
Its five researched universities exist twice: in `data/countries/nl.json` (the
country page) **and** in `data/institutions/nl-*.json` with programmes and
opportunities (the university pages, Find a degree and the subject checker).
Change both. A Dutch programme is added like recipe 2, copying an existing
`nl-*` file. Dutch requirements are written in IB terms rather than Danish ones:

```json
{
  "id": "r-math",
  "kind": "ib-subject",
  "mandatory": true,
  "label": "Mathematics: Analysis and Approaches at HL",
  "ibSubject": "mathematics-aa",
  "ibLevel": "HL",
  "applicability": { "intake": "2027-autumn", "applicantGroup": "any" },
  "evidence": ["ev-tudelft-nl-ib-subjects"]
}
```

`ibSubject` is an id from `data/ib-subjects.json` (`mathematics-aa`,
`mathematics-ai`, `physics`, `chemistry`, `english-b`, …). `ibLevel` is `HL`,
`SL` or `any`. Use `nl-studielink-2027` (or the university's own selection
route) for `applicationRoutes`.

---

## 7. Add a whole new destination country

There are two levels. Start with the first; the second is more work, and the
checks hold you to it once you start.

**Level 1: a country page.** Create `data/countries/<code>.json`, where `<code>`
is the two-letter country code. That one file gives the country its page, a
card on `/europe/` or `/world/`, a row in `/compare/` and its deadlines on
`/timeline/`. The easiest start is to copy the smallest existing profile
(`lu.json` or `mt.json`) and replace everything. The minimum that was tested:

```json
{
  "code": "cy",
  "name": "Cyprus",
  "adjective": "Cypriot",
  "region": "Southern Europe",
  "scope": "europe",
  "capital": "Nicosia",
  "currency": "EUR",
  "eu": true,
  "eea": true,
  "dataAsOf": "2026-09-24",
  "targetIntake": "Autumn 2027 (May 2027 IB session)",
  "tagline": "One short line for the index card",
  "summary": "Three or four plain sentences: what an IB student should know first.",
  "whyConsider": ["One reason, as a sentence."],
  "watchOuts": ["One trap, as a sentence."],
  "ibRecognition": {
    "accepted": true,
    "minimumPoints": null,
    "subjectLevelRule": null,
    "gradeConversion": "How the IB is read here, or null.",
    "notes": []
  },
  "application": {
    "centralised": false,
    "portal": { "name": "None - apply to each university directly.", "url": "https://www.ucy.ac.cy/admissions/" },
    "deadlines": [
      {
        "label": "University of Cyprus, international applicants",
        "date": "2027-03-31",
        "consequence": "hard",
        "provisional": true,
        "year": "2027 entry",
        "notes": "Why this date, and whether the year is confirmed.",
        "source": "https://www.ucy.ac.cy/admissions/"
      }
    ],
    "steps": ["Step one, as a sentence."]
  },
  "language": {
    "englishTaughtBachelors": "What is taught in English, honestly.",
    "englishProof": "What English evidence is asked for.",
    "localLanguageRequired": false,
    "notes": []
  },
  "costs": {
    "tuitionEuEea": { "value": "What an EU student pays.", "year": "2026/27", "source": "https://www.ucy.ac.cy/admissions/" },
    "tuitionNonEu": null,
    "livingCostMonthly": null
  },
  "funding": [],
  "institutions": [
    {
      "name": "University of Cyprus",
      "shortName": "UCY",
      "city": "Nicosia",
      "type": "Research university",
      "website": "https://www.ucy.ac.cy/",
      "admissionsUrl": "https://www.ucy.ac.cy/admissions/",
      "englishBachelors": "What it teaches in English.",
      "notableFields": ["Economics"],
      "note": "One sentence a student would want to know.",
      "wikipedia": "https://en.wikipedia.org/wiki/University_of_Cyprus"
    }
  ],
  "sources": [
    { "title": "University of Cyprus - admissions", "url": "https://www.ucy.ac.cy/admissions/", "retrieved": "2026-09-24" }
  ]
}
```

- `scope` is `europe` or `worldwide`. `region` is one of `Nordics`,
  `British Isles`, `Western Europe`, `Central Europe`, `Baltics`,
  `Southern Europe`, `North America`, `Asia-Pacific`, `Middle East`, `Other`.
- A deadline `date` is a real date (`2027-03-31`) or `null` with
  `"dateState": "not-published"`. Never a sentence. `consequence` is `hard`,
  `equal-consideration`, `priority`, `rolling`, `indicative` or `personal`.
  `provisional: true` means "last year's date, not yet republished".
- Leave out what you don't know (`null` or an empty list). Say so in `watchOuts`.

Then:

```bash
npm run geocode -- --only=cy     # map pins for its universities
npm run images -- --only=cy      # a photograph for the country (then recipe 9)
npm test
```

**Level 2: publishing it properly.** Writing `data/destinations/<code>.json`
counts as *publishing* the country, and from then on the `floor` check requires
all five of these: a `sectorLandscape` with at least one route, at least one
evidence record in `data/evidence/<code>.json`, an application route in
`data/application-routes/<code>-….json`, every deadline dated or explained, and
every university linked to its own website. The shapes are in
`data/destinations/is.json`, `data/application-routes/is-direct-2027.json` and
`data/evidence/is.json`. Copy those. A minimal version of all three passed
`npm test` for Cyprus. Watch for `shorter than 30 characters` on the sector
description.

The country's flag emoji is a list in the code (`FLAGS` in `src/lib/data.mjs`).
A new country has no flag until someone adds it there. Nothing breaks.

---

## 8. Roll the site over to the next intake (every September)

This is the big one: every date and requirement on the site belongs to one
intake. A full practice run (2027 → 2028) on a copy touched **338 files** and
then passed `npm test`. Plan a few days, and get help with the mechanical
renaming (see Rough edges).

**Important:** changing only the label in step 1 also passes `npm test`. No
check notices that the data underneath still says 2027. The checklist is the
only safeguard.

1. **Snapshot what students saw.** Copy `dist/data.json` somewhere safe (e.g.
   `archive/2027/data.json` outside `dist/`), or ask for a git tag. The build
   deletes `dist/` every time.
2. **The label.** `src/lib/layout.mjs`, near the top:

   ```js
   description: '… Built for the May 2028 session.',
   cycle: {
     session: 'May 2028',
     intake: 'Autumn 2028',
     label: 'May 2028 IB session · Autumn 2028 entry',
   },
   ```

3. **The freshness policy.** `data/freshness-policy.json` → `rollover`:
   `currentIntake: "2028-autumn"`, `currentSession: "May 2028"`,
   `nextIntake: "2029-autumn"`, `nextSession: "May 2029"`.
4. **IB results day.** In `data/ib-calendar.json`, copy the `2027-05` block in
   `sessions` to make `2028-05` (change `id`, `name`, `appliesToIntake`, the
   dates; set `provisional: true` until the IB publishes). Set
   `isTheCycleThisSiteCovers` to `false` on the old one. The file's own
   `$comment` explains the rest.
5. **Every country's target.** `targetIntake` in each `data/destinations/*.json`
   (`"2028-autumn"`) and each `data/countries/*.json`
   (`"Autumn 2028 (May 2028 IB session)"`).
6. **Application routes.** Each `data/application-routes/*-2027.json` becomes
   `*-2028.json`: new file name, new `id`, `intake: "2028-autumn"`. For every
   milestone: put in the new date if it is published, otherwise last year's day
   and month with the new year and `"provisional": true`. (Rounds cannot carry
   `provisional`; the validator will say so.) Change
   `"ibCalendar": "2027-05/…"` to `"2028-05/…"`. **Read every `label` and
   `note`.** They say things like "Fall 2027" and "AY2027/2028".
7. **Country-page deadlines.** In every `data/countries/*.json`,
   `application.deadlines`: the same treatment as step 6.
8. **Opportunities.** Each `data/opportunities/*-2027-autumn.json` becomes
   `*-2028-autumn.json`: new file name, new `id`, `intake: "2028-autumn"`,
   `applicability.intake` in every requirement (including inside
   `alternatives`), and `applicationRoutes` pointing at the new route ids.
   Delete the 2027 files. The site shows every opportunity it finds, so
   keeping both would list every programme twice. Then re-check each
   programme's requirements against its page (recipe 1), add the new cut-off at
   the top of `historicalCutoffs`, and update `priceYear` in `cost` once the
   fee is published for the new year.
9. **Every reference to a renamed id.** Search `data/` for each old id (e.g.
   `dk-optagelse-international-2027`) and replace it, especially in the
   `supports` lists in `data/evidence/`.
10. **Re-point IB dates.** Run

    ```bash
    node scripts/migrate-ib-results-day.mjs --write
    ```

    This moves every "IB results released" milestone and every cached source
    quotation onto the new session. Its list of "deliberately untouched" dates
    is worth reading.
11. **Two tests that name 2027 records.** In `scripts/test-calendar.mjs`,
    search for `kr-gks-embassy-2027` and change it to the new route id. In
    `scripts/test-destinations.mjs`, search for
    `nl-tudelft-aerospace-engineering-2027-autumn`. Without this, `npm test`
    fails with `kr-gks-embassy-2027 is gone` and
    `expected TU Delft Aerospace Engineering`.
12. **Text in the page code.** Search `src/pages` for `2026` and `2027`. Most
    hits are in `denmark.mjs` (15 March, the SU rate, the application timeline),
    `meta.mjs` (glossary, FAQ, About), `counsellors.mjs`, `planner.mjs` and
    `timeline.mjs`. Also `src/pages/destinations.mjs` has `'2027-autumn'`
    written in once; change it to the new intake.
13. **The Danish conversion table** (by 1 March): update **both**
    `data/ib-conversion.json` (what the page shows) and `data/recognition/dk.json`
    (what the subject checker uses). No check compares the two.
14. **The spring routes** `jp-mext-embassy-2028` and `kr-direct-2028-spring`
    belong to the 2027 cycle. They become `-2029` in the same way.

Then:

```bash
npm run rollover        # every date-bound claim still to re-verify (837 today)
npm run watch:sources   # which source pages changed since they were last read
npm test
npm run release-check   # "should a seventeen-year-old act on this?"
```

`npm run rollover` lists all claims whose intake isn't the policy's *next*
intake. Work down it through the autumn. Anything you have only rolled forward
stays `provisional: true` until the authority republishes it. The site then
labels it "provisional", which is honest.

---

## 9. Change a photograph

Photos come from Wikimedia Commons and are recorded in `data/images.json`, one
entry per key. Keys: a country code (`se`), a country code plus a university's
short name (`se-lu`), or a bare Danish short id (`itu`, `dtu`, `au`). A photo is
only shown if a person approved it, or if the picker scored it 40 or more.

**Replace a university's or country's photo:**

1. Find a better picture on commons.wikimedia.org and copy its file name
   (e.g. `IT University of Copenhagen 2019.jpg`).
2. In `data/images.json`, in that key's entry, set `"file"` to that name and add
   `"pin": true`.
3. Download and resize it:

   ```bash
   npm run images -- --refresh --only=itu
   ```

4. Look at it, then approve it (this writes your name and today's date on the
   entry):

   ```bash
   npm run images:review -- --show itu
   npm run images:review -- --approve itu --by "M. Pilley" --note "Main building, daylight"
   ```

   Or reject a bad one: `--reject itu --by "M. Pilley" --note "what is wrong"`.
   The page then shows the lettered panel instead.

`npm run images:review` on its own lists the photos worth a look, worst first.
Tested: an unapproved low-scoring picture did not appear, and appeared as soon
as it was approved. Step 3 downloads from Wikimedia and was not re-run while
testing this document. It is the documented route in `docs/IMAGE_STANDARD.md`.

**The home page photos.** `data/site-config.json` → `homeDoors`:

```json
"homeDoors": {
  "denmark": { "image": "dk-au" },
  "europe": { "image": "gb" },
  "world": { "image": "jp" },
  "hero": ["nl", "pt", "mt"]
}
```

Each value is a key from `data/images.json`. `hero` is the slideshow at the top,
in order. Don't use the same key twice on the page. Changing `denmark` to `dtu`
and rebuilding put DTU's photo on the Denmark door. **A mistyped key or an
unapproved photo is silently skipped.** No check complains, so look at the
home page.

---

## 10. Recording a source, and what "verified" means

Every consequential fact points at an **evidence record** in
`data/evidence/<country>.json`. Each file is a list; add new records at the end,
with a comma after the one before.

```json
{
  "id": "ev-aau-sustainable-energy-systems",
  "sourceUrl": "https://www.en.aau.dk/education/bachelor/sustainable-energy-systems/admission",
  "publisher": "Aalborg University",
  "publisherType": "institution",
  "sourceClass": "institutional-guidance",
  "retrievedAt": "2026-09-24",
  "appliesToIntake": "2027-autumn",
  "excerpt": "A short quotation copied from the page, word for word.",
  "claim": "What this page establishes, in one sentence.",
  "supports": [
    { "entity": "dk-aau-sustainable-energy-systems-aalborg-2027-autumn", "field": "requirements" }
  ],
  "verificationState": "needs-review",
  "attestation": { "by": "M. Pilley", "at": "2026-09-24", "method": "read-browser" },
  "meta": { "schemaVersion": "1.0", "dataAsOf": "2026-09-24" }
}
```

- Required: `id`, `sourceUrl`, `publisher`, `retrievedAt`, `verificationState`,
  `supports`, and in practice `sourceClass` (the validator refuses without it).
- `id`: `ev-` then lowercase words and hyphens. It must be unique across all the
  evidence files.
- `supports`: which record (`entity` = its id) and which part of it (`field`:
  `requirements`, `summary`, `about`, `feeContext`, `milestones`, …) this page
  backs. This is how `npm run watch:sources` knows what to re-check when the
  page changes.
- `attestation` records that **you read the page** while writing the record.
  `method` is `read-source`, `read-browser` (the page needed a browser),
  `read-pdf`, `read-secondary` or `derived` (you calculated it from the page).
- Optional: `excerpt`, `claim`, `appliesToIntake`, `interpretation` (why you read
  an unclear page the way you did), `meta.reviewBy` (a date to look again).

**Which `sourceClass`:**

| The page is from | `sourceClass` | Can it alone back a requirement, deadline or fee? |
| --- | --- | --- |
| The university itself | `institutional-guidance` | Yes |
| The ministry or agency that sets the rule | `official-rule-owner` | Yes |
| The application portal (optagelse.dk, UCAS, Studielink) | `admissions-authority` | Yes |
| A recognition body (e.g. Nuffic) | `recognition-body` | Yes |
| Study in Denmark and similar promotion agencies | `promotion-agency` | No |
| Another school's counselling page | `school-guidance` | No |
| Wikipedia | `encyclopaedic` | No |
| A course-listing website | `aggregator` | No |

**What `verificationState` means:**

| State | Meaning |
| --- | --- |
| `needs-review` | The page was read and recorded, but no second person has checked it. The page shows it with a caveat. This is where every new record starts, including yours. |
| `verified` | **A different person** read the record back against the page and agreed. |
| `superseded` | The claim has been replaced. |
| `unavailable` | The page can't be reached. The subject checker then refuses to answer for that programme. |

**To sign off someone else's record** (for example one written by a research
pass), read the page yourself, then set these three fields on it:

```json
"verificationState": "verified",
"verifiedBy": "M. Pilley",
"review": { "by": "M. Pilley", "at": "2026-09-24", "agreed": true, "note": "Maths A 6 and English B 6, as stated." }
```

It's worth adding `"reviewBy": "2027-03-01"` inside the record's existing
`meta`: the date after which it counts as stale again. Tested failures:

- `verified` with no `review` fails: *"no published record claims verified without an independent review"*.
- `verifiedBy` left as `"automated"` (the Danish records have it) or missing fails:
  *"no verified record was verified by a machine"*. Replace it with your name.
- `review.by` equal to `attestation.by` fails: *"A record cannot be reviewed by
  the party that attested it"*. You can't sign off your own record.
- Found the record wrong? Correct the data, record `"agreed": false` in `review`,
  and leave the state at `needs-review`.
- A promotion agency, school page or Wikipedia can never be `verified` for a
  requirement, deadline or fee. The validator refuses.

`npm run build` prints the count on every run
(`evidence: 1 verified · 758 awaiting review …`), and `/trust/` shows it.
Raising that number is the most valuable ordinary work on this site.

---

## 11. Before you publish

```bash
npm test
```

Every check must say `ok` and the last line must read `All … checks pass.` (the
`freshness` line is a `note`, and that's fine).
Then `npm run dev`, open http://localhost:4321, and look at what you changed:

- [ ] The page you edited: the programme page (`/programmes/<id>/`), the
      university (`/universities/<id>/`) or the country (`/destinations/<code>/`).
      Is the new fact there, worded as the university words it?
- [ ] **Check my subjects** (`/planner/`): enter an IB profile that should just
      meet the programme you changed. Does it say "Meets published requirements",
      and does the reasoning match the rule? If it says "Needs review", a
      `subject` is probably misspelt (recipe 1).
- [ ] **Find a degree** (`/programmes/`): is a new programme listed, once per
      campus? Is a removed one gone?
- [ ] **The map** on the university or country page: is the pin in the right
      town? (A wrong `place` id is not caught by any check.)
- [ ] **Deadlines** (`/timeline/`): if you touched dates, are they right, and
      are the carried-over ones marked provisional?
- [ ] **The home page** (`/`): if you changed `homeDoors`, are the photos there?
- [ ] **Sources** at the bottom of the page: does the link open the page you
      read?

Then commit and push (or ask whoever does). GitHub runs the same `npm test`
before it publishes, and a failure stops the deployment. Nothing broken goes
live.

---

## Rough edges

Things that work but are harder than they should be. None is fixed here.

1. **Removing anything means hand-editing a 300 KB evidence file.** Recipes 3
   and 5 need `supports` lines removed across `data/evidence/dk.json`,
   `ib-statements.json` and the national record, and nothing tells you if you
   miss one. *Suggestion:* a `npm run remove -- <id>` script that deletes a
   record, its children, its IB statement and every `supports` line naming it,
   and prints what it did.
2. **The rollover is 338 files of mechanical renaming,** and a label-only
   rollover passes every check. *Suggestion:* a `npm run rollover -- --write`
   that renames opportunities and routes to the next intake, re-points every
   reference, rolls unpublished dates forward as `provisional: true`, and adds
   the new IB session. People then do only the reading. Also add a check that
   fails when `SITE.cycle` and `freshness-policy.json` disagree with the intake
   the opportunities carry.
3. **Year-specific text is written into the page code** (`src/pages/denmark.mjs`,
   `meta.mjs` and others: 15 March 2027, the SU rate, a hard-coded
   `'2027-autumn'` in `destinations.mjs`). *Suggestion:* move those facts into a
   data file (e.g. `data/destinations/dk.json` or `data/site-config.json`) so the
   rollover is data-only.
4. **Tests pinned to real records.** `scripts/test-destinations.mjs` needs
   `dk-au` and `nl-tudelft-aerospace-engineering-2027-autumn`, and
   `scripts/test-calendar.mjs` needs `kr-gks-embassy-2027`. Removing Aarhus
   University or rolling the intake fails `npm test` for reasons that have
   nothing to do with the change. *Suggestion:* have those tests pick "any
   Danish institution with a cut-off" and "any closed route" instead of a
   named id.
5. **The Danish conversion table is kept twice**, in `data/ib-conversion.json`
   (the page) and `data/recognition/dk.json` (the checker), and changing one
   alone passes every check. *Suggestion:* generate one from the other, or add
   a check that they agree.
6. **Photos for a new Danish university need a stub in `data/dk/`,** because
   `scripts/fetch-images.mjs` and `fetch-official-images.mjs` still find Danish
   institutions there rather than in `data/institutions/`. The same mismatch
   means the five Dutch universities in `data/institutions/` have no photo on
   their own pages (their pictures are filed as `nl-tu-delft`, the pages look
   for `nl-tudelft`). *Suggestion:* make both scripts read `data/institutions/`
   and key pictures by the canonical id.
7. **The Netherlands is in two places.** Five Dutch universities are in both
   `data/countries/nl.json` and `data/institutions/nl-*.json`, under different
   ids, and the country page doesn't link to the university pages.
   *Suggestion:* have the country page list canonical institutions where they
   exist and link to them.
8. **Silent typos.** A wrong `place` id in a country profile, a wrong key in
   `homeDoors`, and a misspelt Danish `subject` all pass `npm test` and just
   quietly show less. *Suggestion:* extend `npm run validate` to check country
   profile `place` ids and `homeDoors` keys, and to warn on a `subject` the
   Danish table doesn't know.
9. **`verifiedBy` is marked deprecated in the schema but required by the test**
   for every verified record. *Suggestion:* decide which one is right and make
   the other agree, so a sign-off needs one name, not two.
