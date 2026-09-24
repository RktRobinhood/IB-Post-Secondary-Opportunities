# Audience correction — inventory and plan

Status: **Phase 2b complete, 2026-09-24** — see "Phase 2b — result" at the end. Phase 1 was the read-only inventory
below. Phase 2a did three things: verified the open questions against official
sources (`verification.md`), applied the edits in the quiet files, and added
the shared SU record and the planner changes. **Phase 2b** is still to do: the
busy files (`data/countries`, `data/destinations`, `data/evidence`,
`data/application-routes`, `src/pages/destinations.mjs` L615), wiring the
guard, and `scripts/test-calendar.mjs` for MEXT. **On hold** until the coordinator confirms that the country and photo agents
are done.

## Phase 2a — what changed

**Verifications that changed the plan** (details in `verification.md`):
- **SU equal status.** A non-Danish EU/EEA student can gain equal status
  through a parent who works in Denmark (if they moved here before 21), through
  five years' residence, or through their own job. The copy named only the job
  route. The parent and residence routes now lead, because they fit this
  readership.
- **SU abroad.** SU for a degree abroad needs Danish citizenship *or* equal
  status under EU rules, *plus* the ties-to-Denmark requirement, which Danish
  citizens must meet too. Equal status under Denmark's own rules does not
  cover study abroad. The phase-1 label "EU/EEA citizens with sufficient ties"
  was replaced by the label in `data/funding/dk-su.json`.
- **MEXT.** The first screening is "at the Japanese diplomatic mission in the
  country of the applicant's nationality". Making the route conditional is
  confirmed.
- **GKS 2027 Embassy Track.** It is closed to *every* May 2027 IB candidate,
  because graduation must be certified by 31 December 2026. **Decided:** it stays `closed`, with the reason changed to the
  graduation date; only MEXT becomes conditional (`verification.md` §7).
- **Stipendium Hungaricum.** No EU state is a partner, so it is closed to all EU
  citizens. The bilateral state scholarships do depend on nationality; the
  country list is still unverified.
- **AU and ITU wording.**
  - AU's Computer Science and IT Product Development pages literally say
    "Danish applicants", so the edit quotes AU instead of paraphrasing.
  - ITU requires Danish A, not Danish schooling. The rewrite stands.
- **Exchange rates.** The ECB reference rates of 24 September 2026 replace the
  reviewers' assumed rates, some of which were 5–8% off (NOK, JPY). NOK 15,488
  is €1,435, not €1,300.

**Applied (quiet files only):**
- **13 data files, 42 edits**, via `apply-quiet.mjs`, which is re-runnable and
  refuses busy files:
  - `data/application-systems/au-uac.json`
  - `data/application-systems/jp-mext-embassy.json`
  - `data/context-notes/no-language-is-the-obstacle.json`
  - `data/dk/au.json`, `data/dk/itu.json`
  - `data/institutions/dk-au.json`
  - `data/opportunities/dk-au-computer-science-2027-autumn.json`,
    `data/opportunities/dk-au-it-product-development-2027-autumn.json`,
    `data/opportunities/nl-breda-uas-hotel-management-2027-autumn.json`
  - `data/preparation.json`
  - `data/programmes/dk-itu-global-business-informatics.json`
  - `data/topics/distinctive-options.json`, `data/topics/medicine-abroad.json`
- **Source edits:**
  - `src/pages/home.mjs`: the "Close to home" door becomes "Where you already are".
  - `src/lib/dimensions.mjs`: the Nordic line.
  - `src/pages/timeline.mjs`: the closed-routes line.
  - `src/pages/meta.mjs`: the lede, the medicine FAQ, the NOK/DKK euros, and
    the SU FAQ (now also corrected to "as if you studied in Denmark" rather
    than "+12 months", matching the 2025 reform). The glossary's SU entry is
    now generated from the funding record.
  - `src/pages/denmark.mjs`: the hub's money topic and the money page's SU
    section render from the funding record. The job paragraph is rewritten,
    and the residence and CPR admin steps are now written for a student who
    already lives here.
  - `src/build.mjs`: passes `site` to the glossary.
  - `README.md`: the scenario count is updated to 103.

**New shared records:**
- `data/funding/dk-su.json` holds SU: rate, who can claim it (three
  equal-status routes), the abroad rules, `label`, `otherwise`, and su.dk
  sources. It is validated by the new `schemas/funding-scheme.schema.json`
  (registered in `scripts/validate.mjs`) and loaded by `src/lib/data.mjs` as
  `site.fundingSchemes` and `site.funding`.
  - **Phase 2b:** the ~50 SU funding lines in `data/countries/*.json` and
    `data/destinations/*.json` should render or quote `fund-dk-su`
    (`label` + `otherwise`) instead of restating the rule.
  - **Phase 2b:** add Evidence records for the su.dk pages in `data/evidence/`,
    which the record currently cites only as `sources`.
- `data/applicant-groups.json` holds the fee-status groups: `nordic` is
  declared `within: ["eu-eea-ch"]`.
  - `src/lib/eligibility.mjs` gains `applicantGroupsOf()` and matches a
    profile's expanded groups. There is no group or country name in the code.
  - The planner offers "Nordic citizen (…)", built from the data.
  - `src/assets/js/planner.js` reads the groups and the scheme adjective from
    the page's JSON, with no hard-coded "Danish". On the current mixed-scheme
    catalogue it says "local", which matches the server-rendered placeholder.
  - `scripts/test-eligibility.mjs` has 6 new scenarios (Nordic meets EU/EEA,
    not the reverse, and so on): 103 pass.

**Guard (still in `draft/`, not wired):**
- Improved in three ways: a quoted source phrase is exempt; "who can claim"
  counts as a label; there is a draft `audience-allowlist.json` of 9 reasoned
  entries.
- It now reports **no hits in quiet files**. The 308 remaining are all in
  the busy files.

The rule being applied is `docs/PRODUCT_VISION.md` → "Who it is for": the
default reader is an **EU/EEA (or Swiss) citizen, an IB Diploma candidate at a
school in Denmark, living in Denmark**. About a fifth hold Danish citizenship;
the rest come from across Europe (Czech Republic, Germany, Norway, Sweden …),
so some are Nordic citizens and most are not.

## Files in this folder

| File | What it is |
|---|---|
| `candidates/*.jsonl` | Every scanner hit that needs a human reading, de-duplicated by text. One line = one distinct string + every place it occurs. |
| `candidates/*.spotcheck.jsonl` | Hits inside records that describe the Danish system itself (dk institutions, programmes, conversion tables). Default C; read for exceptions. |
| `parts/*.jsonl` | Classifications, one file per reviewer group, written as the work happens. |
| `inventory.jsonl` | The merged result: one line per hit location. Built from `parts/` + automatic C classifications. Fields: `file`, `path` (JSON path or `L<line>`), `current`, `class`, `edits[{find,replace}]`, `proposed` (current with edits applied), `appliesTo`, `needsVerification`, `verifyNote`, `readerAccess`, `note`. |
| `build-inventory.mjs` | Rebuilds `inventory.jsonl` and prints the counts below. Re-runnable. |
| `candidates/scan.mjs`, `candidates/triage.cjs` | The scanner and triage that produced the candidates (patterns listed in the scanner). |
| `candidates/auto-c.jsonl` | Hits classified C without reading: code comments, verbatim evidence excerpts, URLs, and strings that matched only neutral patterns (EU/EEA, international applicant, foreign, domestic, tuition-free, "in Denmark"). Spot-checked. |
| `draft/` | The proposed guard (`audience-lib.mjs`, `test-audience.mjs`), its config (`audience-config.json`) and `calibrate.mjs`, which scores the guard against the reviewers' classifications. Runs read-only today. |
| `PLAN.md` | This file. |

## Classification rubric (used by every reviewer)

**A — wrong assumption. Rewrite.** The sentence treats the reader as Danish,
or Denmark as home, where the underlying rule does not depend on Danish
citizenship. Rewrite to the category the rule actually turns on:

| The rule actually turns on | Write |
|---|---|
| EU/EEA citizenship (fees, visas, residence, work rights, deadlines by passport) | "EU/EEA citizens", "as an EU/EEA citizen", "your EU/EEA passport or national ID card". Add "or Swiss" where the source says so. |
| Nordic citizenship (Iceland/Norway/Finland/Sweden Nordic rules, Menntasjóður, Nordic deadlines) | "Nordic citizens (Danish, Finnish, Icelandic, Norwegian or Swedish)". Never narrow a Nordic rule to Danes. |
| Being a non-local / international applicant (US, CA, AU, NZ, HK, SG, CN, JP, KR, CH) | "an international applicant", "a European applicant", "a student applying from Denmark". |
| Where the student is schooled / lives (IB sat in Denmark, applying from Denmark, Danish time zone, offshore applicant) | Keep location wording — that is class **C**. "An IB candidate at a school in Denmark" replaces "a Danish IB candidate" when the point is the school, not the passport. |
| Language profile (Danish A counts as Norwegian at Samordna; Swedish at Åbo Akademi) | "If you take Danish, Norwegian or Swedish A…" / "If you speak Danish or Norwegian…" — a condition, not an assumption. Only name the languages the source names. |
| Family / home | "your family", "your family's income (wherever it is earned)", "close to Denmark", "a short trip from Denmark". Never "close to home", "a Danish family", "what you are used to" as Danish culture. |
| Health cover | "your EHIC" / "the EHIC from the country where you are insured". The Danish yellow card is a *resident's* card, not a citizen's — "the Danish yellow card" in a list of things not valid abroad is C. |
| Consular / travel advice | "your own foreign ministry's travel advice" (the Danish MFA advises Danes). |

**B — true only for Danish citizens or holders of Danish qualifications.
Keep, label, and say what applies to everyone else.**

- Label with a condition, not an identity: "If you hold Danish citizenship…",
  "Danish citizens only:", "On a Danish passport…". Then one clause on the rest:
  "…other EU/EEA citizens: …" or "…if you are not Danish, check …".
- **Danish SU abroad**: portable for Danish citizens; an EU/EEA citizen needs
  equal status or qualifying ties to Denmark (repo's own wording in
  `countries/fi.json` and `se.json`). For everyone else add: "If you are not
  Danish, check your own country's student finance first — several EU/EEA
  systems fund a full degree in another country." `needsVerification: true`
  whenever a specific national scheme is named.
- **Nationality-routed scholarships** (MEXT embassy track, GKS embassy track,
  CSC Type A, Hungarian bilateral scholarships, government "target country"
  awards): "closed to Danish nationals" is true only for the Danish fifth.
  Rewrite as "depends on your nationality — Denmark is not on the list; check
  whether your country is" / "apply through the Japanese embassy in your
  country of citizenship". `needsVerification: true`. Where the record has a
  `readerAccess: closed` that rests on Danish nationality, note that the state
  should become `conditional` (see "Data model" below).
- **Practising medicine / regulated professions in Denmark** (KBU, Danish
  authorisation): label "if you plan to practise in Denmark", and generalise the
  check to "the country where you want to practise".
- **Danish-qualification facts** (studentereksamen nostrification, quota rules
  written for Danish qualifications) are usually **C** — they describe the
  Danish system, and the reader holds an IB. B only if phrased as the reader's
  own situation.

**C — fine as is.** Denmark described neutrally; the Danish application system
(optagelse.dk, quotas, conversion, MitID/CPR mechanics — these already apply to
anyone living in Denmark); "applying from Denmark", Danish time, "a school in
Denmark"; verbatim source excerpts; code comments; URLs; comparisons phrased
"than in Denmark" (where the reader lives now).

**money** — a hit whose only issue is currency presentation. See "Money
convention".

When a string has several problems, classify by the worst (A > B > money > C)
and give every edit.

### Output format for `parts/*.jsonl`

One JSON object per line, per candidate id:

```json
{"id":"c10e637392","class":"B","edits":[{"find":"exact substring of current text","replace":"new text"}],"appliesTo":"Danish citizens; others: own-country finance","needsVerification":true,"verifyNote":"what to check and where","note":"optional reviewer note"}
```

- `edits[].find` must be an **exact substring** of the candidate's `text`, so
  phase 2 can apply and re-validate mechanically. Several small edits beat one
  whole-string rewrite. C entries have `edits: []`.
- `appliesTo` only for B.
- `readerAccess` (optional): `{"from":"closed","to":"conditional","reason":"≤240 chars"}` when a route's access state rests on Danish nationality.
- Keep the house voice: plain, second person, no hedging beyond what the
  source supports, British spelling.

## Money convention

1. **A cost is stated in the currency it is charged in**, as the source
   publishes it (EUR, GBP, CHF, NOK, SEK, CZK, HUF, PLN, USD, DKK …).
2. **EUR is the comparison currency.** Where the charging currency is not EUR,
   add an approximate EUR figure in parentheses with the rate month:
   "HK$0.9–1.1 million (roughly €100,000–125,000 at September 2026 rates)". EUR
   is the one currency the whole readership shares; DKK is only the currency
   of the place they happen to go to school.
3. **DKK stays for Danish costs** — SU, the residence-permit fee, Danish rent
   and living costs, Danish non-EU tuition — because students live in Denmark
   and pay these in DKK. DKK first, EUR in parentheses where a comparison is
   useful.
4. **Never DKK as the only conversion of a foreign cost** (e.g. Hong Kong
   tuition "about DKK 770,000"). A DKK figure may follow the EUR one where the
   page is about budgeting from Denmark, never replace it.
5. SU amounts remain in DKK (they are paid in DKK) and are class B — labelled
   for who can claim them.

Nine strings are money-only, and about ten more A strings carry a
missing-EUR note (USD, AUD, CHF, GBP, HK$, JPY, KRW figures). **Every
conversion the reviewers wrote uses an assumed September 2026 rate and is
flagged**: CHF ≈ 1.07, GBP ≈ 1.15, USD ≈ 0.86, HK$ ≈ 0.11, ≈172 JPY and
≈1,620 KRW per EUR, ≈7.46 DKK and ≈11.7 NOK per EUR. Phase 2 should fetch one
rate table and record its date once (for example a `currency.asOf` in
`data/site-config.json`). It should then recompute every EUR figure from that
table rather than trust the reviewers' arithmetic. DKK-only conversions of
foreign costs are replaced: Hong Kong tuition ("about DKK 770,000–940,000")
and the ATPL "six-figure DKK sum", which also has no source.

## Results

The scanner read every string in `data/**/*.json` and every line of
`src/pages`, `src/lib` and `src/assets/js`. It found **2,864 hit locations**.
Of these, 1,560 were classified C automatically. The other 1,304 locations are
1,003 distinct strings, and each was read by a reviewer.

| Class | Distinct strings | Locations |
|---|---|---|
| **A**: wrong assumption, rewrite | 251 (+1 found by reading) | 257 |
| **B**: Danish-citizen-only, label it | 100 | 103 |
| **money**: currency only | 9 | 9 |
| **C**: fine | 642 read + 1,560 automatic | 2,495 |

130 distinct strings are marked `needsVerification`.

### By file group (locations)

| Group | A | B | money | C |
|---|---|---|---|---|
| data/countries | 144 | 55 | 5 | 622 |
| data/evidence (claim/interpretation; rendered in "Where this comes from") | 41 | 4 | 0 | 455 |
| data/destinations | 36 | 17 | 2 | 293 |
| data/application-routes | 8 | 7 | 0 | 105 |
| data/topics | 8 | 9 | 1 | 32 |
| src/pages | 8 | 9 | 1 | 143 |
| data/dk | 4 | 0 | 0 | 177 |
| data/opportunities | 3 | 0 | 0 | 401 |
| data/application-systems | 1 | 1 | 0 | 23 |
| data/context-notes | 1 | 0 | 0 | 13 |
| data/institutions | 1 | 0 | 0 | 65 |
| data/programmes | 1 | 0 | 0 | 12 |
| data/preparation | 0 | 1 | 0 | 10 |
| src/lib | 1 | 0 | 0 | 40 |
| everything else (ib-conversion, recognition, images, places, freshness-policy, ib-subjects, src/assets) | 0 | 0 | 0 | 104 |

**89% of the A/B/money work (320 of 369 locations) is in files other agents are
editing now**: `data/countries`, `data/destinations`, `data/evidence` and
`data/application-routes`.

### The ten most misleading

1. **Finland, residency** (`8e1243306c`). "As a Danish citizen you do not apply to Migri" → "As a Nordic citizen (Danish, Icelandic, Norwegian or Swedish) you do not apply to Migri … Other EU/EEA citizens register their EU right of residence with Migri." As written, it tells a Czech or German reader to skip a step they must take.
2. **Portugal, five deadline notes** (`161c077438` and four others). "A Danish citizen is NOT eligible / may NOT use this route" → "An EU/EEA citizen …". The international-student statute excludes every EU/EEA national, and the Danish wording leaves the other four fifths guessing.
3. **Japan MEXT embassy track, `readerAccess.reason`** (`4535d7f614`). The route is `closed`, so the calendar tells *every* reader "Not open to you". The reason is that the embassy in Copenhagen offers Danish nationals only the graduate types. Proposed: `conditional`, "Depends on your nationality: the Japanese embassy in your country of citizenship runs this track …". Korea's GKS Embassy Track has the same shape: Denmark is not among the 74 invited countries, while Sweden and Poland are.
4. **Iceland, 5 June deadline** (`f230fa4d36`, `5c0008e83a`, `3d8bd5b719`). The Nordic-citizens deadline is narrowed to "a Dane". That is wrong for the Norwegian, Swedish and Finnish readers it also covers, and silent for everyone else. Proposed: "any Nordic citizen … if you are not a Nordic citizen, 1 February is your deadline either way."
5. **Denmark, SU** (`src/pages/denmark.mjs` L118/L536/L589, `destinations/dk.json` whyConsider/funding, the glossary). "Danish students can claim SU". The only route to equal status it names is working 10–12 hours a week. For students who moved here with working parents, the more likely routes are probably being the child of an EU/EEA worker in Denmark, or five years' residence. **Verify on su.dk before writing either version.**
6. **Hungary, summary** (`a3951224a0`). "As a Danish student you are self-funded", because Denmark is not on the bilateral-scholarship partner list → "these depend on your nationality — Denmark is not on the list, so check whether your country is." Other readers' countries may be on it.
7. **Switzerland, UZH deadline** (`45884ed6ef`). "A Danish citizen needs a residence permit rather than a visa, so 30 April is the deadline" → "An EU/EEA citizen …". This sentence decides which deadline the reader believes is theirs.
8. **Sweden and Norway, language** (`776e98abb6` and about 10 Norway entries). "As a Danish speaker you already meet the Swedish-language requirement with Danish Language A" and "a Danish IB student with Danish A" → "If you take Swedish, Danish or Norwegian Language A …". It is a subject condition, and Norwegian and Swedish readers meet it too.
9. **ITU Global Business Informatics** (`be2254b232`, 2 locations). "realistically only open to applicants who went to school in Denmark or studied Danish to A level". Every reader went to school in Denmark, so this reads as "you qualify". Proposed: "who have Danish at A level … Going to school in Denmark is not enough on its own" (verify against ITU's page).
10. **The "home" framing**: the home-page door `'Close to home'` (`src/pages/home.mjs` L81), the Norway tagline "Free, close to home" and the Latvia tagline "Cheap, close to home" (countries and destinations), `dimensions.mjs` "Nordic — close to home", and the medicine page title "coming home to practise in Denmark". Proposed: "Where you already are", "close to Denmark", and "getting licensed to practise in Denmark or elsewhere in the EU".

Other frequent A patterns:
- "As a Danish (EU) citizen" (work rights, residence, visas) → "As an EU/EEA citizen".
- "your Danish EHIC" → "your EHIC" (9 hits). One Latvia line also wrongly says the Danish yellow card covers "EU-funded treatment", and the edit removes it.
- "a Danish IB candidate" where the rule turns on the school → "an IB candidate at a school in Denmark" (Canada, Australia, UBC, McGill).
- "a Danish family" (Italy ISEE, US aid) → "your family".
- "Danish students pay international fees" (AU, CA, NZ, HK, SG, US, UAE) → "EU/EEA students" / "international students".
- "Read the Danish foreign ministry's travel advice" → "your own foreign ministry's".

## Planner and Student Profile

- **Nothing defaults the student to Danish.** `src/pages/planner.mjs` offers
  "Your fee status", defaulting to `eu-eea-ch` ("EU, EEA or Swiss citizen"),
  then `non-eu`, then "Prefer not to say". That default is the new default
  reader, so keep it.
- **Gap 1, Nordic citizens.** `schemas/common.schema.json` has `applicantGroup:
  "nordic"`, and `primitives.mjs` has a label for it, but no data record uses
  it and the planner does not offer it. Nordic rules live only in prose
  (Iceland's 5 June deadline, Samordna, Menntasjóður, Finland's Migri
  exemption, Nordic SU treatment). Proposal:
  1. Add the option "Nordic citizen (Danish, Finnish, Icelandic, Norwegian or Swedish)" to `#p-group`.
  2. Declare the containment in data rather than code, e.g. `"nordic": { "within": ["eu-eea-ch"] }` in a small `data/applicant-groups.json` read by `eligibility.mjs`, so that a rule for `eu-eea-ch` is met by a `nordic` profile. Today `eligibility.mjs` compares groups with `===`, which would mark a Norwegian unmet on every EU/EEA rule.
  3. Encode the Nordic deadlines as `applicantGroup: "nordic"` in phase 2 or later.
- **Gap 2, `readerAccess` assumes one nationality.** The schema defines the
  reader as "an IB Diploma candidate in Denmark, on an EU passport". That is
  right, but `closed` has been used for closures that hold only for Danish
  passports. Rule for phase 2: `closed` only when the closure holds for every
  EU/EEA passport, as with Portugal's statute. A nationality-specific closure
  is `conditional`, with a reason naming the nationality test. Proposed changes:
  `data/application-routes/jp-mext-embassy-2028.json` and
  `data/application-routes/kr-gks-embassy-2027.json` (the reason text for the
  latter is in the note on `59f5d5b80c`). After that,
  `src/pages/timeline.mjs` L118 ("Routes … a Danish IB student cannot take")
  becomes "Routes you may have heard of that are closed to you — each one says
  who it is closed to."
- **Gap 3, the scheme adjective is hard-coded in browser code.**
  `src/assets/js/planner.js` L167/L182/L186 hard-code "Your Danish levels",
  "a Danish average" and "no published Danish equivalent". The server
  template already derives the adjective from the sole Recognition Scheme
  (`schemeAdjective`), and the JS should read the same value (for example a
  `data-` attribute). This is not an audience fault, but it breaks the "data
  carries the difference" rule.
- **Not proposed:** a citizenship-country picker. The engine has nothing to
  match it against, and nationality is closer to identifying data than fee
  status is. Nationality-routed scholarships stay as labelled prose with
  `conditional` access.

## Data-model notes for phase 2

- **SU is restated in about 50 places**, one per destination, with drifting
  wording ("Danish citizen", "Danish citizens or EU/EEA with ties", "equal
  status (in practice through part-time work)"). Once su.dk is verified, write
  the rule once in a single funding record for "Danish SU abroad", which each
  destination's funding line references or quotes. Rewriting 50 sentences by
  hand guarantees they drift again.
- **Denmark written for someone arriving.** The admin order on `/denmark/money/`
  (residence document "within three months of arriving", CPR "issued once you
  have an address") assumes the reader is moving to Denmark. Most readers
  already live here. Found by reading (inventory entry
  `extra-denmark-residence`), not by the scanner.
- **Reviewer proposals that still need a second pass** (the draft guard refuses
  the rewrite; `calibrate.mjs --list` names them): `nl.json funding[0]`
  keeps "for a Danish student", `sg.json funding[4]` has "Danish or other EU",
  `evidence/kr.json [9]` keeps "Dane", `distinctive-options` "Most Danish
  students", and `dimensions.mjs` L157 has "Danish SU" unlabelled.
- **Nothing in `data/dk`, `data/opportunities` or `data/recognition` needs more
  than four edits.** The Danish-system records are written neutrally. The
  exception is `dk-au` Computer Science and IT Product Development, whose AU
  notes say "Danish applicants" where AU's rule turns on Danish A (verify the
  AU wording).

## The guard: `scripts/test-audience.mjs`

A draft that runs today is in `draft/`. Phase 2 moves `draft/audience-lib.mjs`
to `scripts/lib/audience.mjs` and `draft/test-audience.mjs` to
`scripts/test-audience.mjs`, and registers it in `scripts/lib/quality-gate.mjs`
under `// --- data`, after `destinations`:

```js
{
  id: 'audience',
  script: 'scripts/test-audience.mjs',
  stage: 'data',
  title: 'The reader is an EU/EEA student at a school in Denmark, not a citizen of it',
},
```

`scripts/test-quality-gate.mjs` already fails if a `scripts/test-*.mjs` exists
without a manifest entry, so the move cannot land unwired. Deploy CI runs
`qa.mjs`, so it is covered by the same gate.

**Names no country (project rule).** The guard builds its patterns from data:
- `data/site-config.json` gets an `audience` block: `schoolCountry: "dk"`,
  `readerGroup: "eu-eea-ch"`, a `reader` sentence, `schoolCountryPeople:
  {singular: "Dane", plural: "Danes"}`, and `citizenGrants: ["SU"]` (draft in
  `draft/audience-config.json`).
- The adjective ("Danish") and the name ("Denmark") come from
  `data/destinations/<schoolCountry>.json`.
- The last check reads the guard and its library back off disk and fails if
  any of those words appears in them. The fixtures use a made-up
  "Flatland / Flatlandish / Flatlander", as `test-jurisdictions` does.

**What it reads:**
- Every string in `data/**/*.json`, except `harvests/`, `geo/`,
  `source-fingerprints.json` and the allowlist itself. Within records it skips
  verbatim quotations (`excerpt`, `quote`, anything under `sourceCheck`) and
  URLs.
- Every line of `src/pages`, `src/lib`, `src/assets/js` and `src/templates`
  with comments blanked out. For a src line, a label within ±4 lines counts,
  because a template sentence spans several lines.

**Patterns.** Here `{A}` is the adjective, `{N}` the country name, `{D}/{Ds}`
the demonyms and `{G}` the grant names, all taken from data.

| Rule | Class | Refuses | Example caught |
|---|---|---|---|
| `identity` | A | `as a {A} [(EU) / EU / or other EU] citizen/national/speaker/student…`; `for/to a {A} student/applicant/candidate…`; `{A} and/or other EU` | "As a Danish (EU) citizen you have free access…" |
| `reader-noun` | A | `a/the/any/most/many/typical {A} student/applicant/candidate/IB student/school-leaver/reader`, plural `{A} students/applicants/…` | "a Danish IB student", "Danish students pay international fees" |
| `family` | A | `{A} family/families/household/parents/income`, `family's {A}` | "a Danish family on a normal income" |
| `documents` | A | `your/with a/bring a {A} passport/ID card/EHIC/blue card/yellow card/health card/cover/insurance`; `EHIC … from {N}` | "Bring your European Health Insurance Card from Denmark" |
| `people` | A | `{D}`, `{Ds}` anywhere | "EU citizens, including Danes" |
| `home` | A | `close to / not far from / near / back home` | "Free, close to home" |
| `standards` | A | `by {A} standards` | "socially conservative by Danish standards" |
| `grant` | B | `{A} {G}` or `{N}'s {G}` (not "… reform"); `{G}` offered to "you" in one sentence | "Danish SU for a full degree abroad…" |
| `nationality-closure` | B | `closed/not open/not eligible/cannot/may not … {A} citizens/nationals/passport`, `{A} citizens … are NOT eligible` | "A Danish citizen is NOT eligible for this route" |

- **Labels.** An A match is excused when its sentence carries a label. A B
  match is excused when its string carries one (for src, the surrounding
  window). The labels are: `if/unless/when/whether you hold/have/are (a) {A}
  citizen(ship)/national(ity)/passport`, `{A} citizens only`, `only for {A}
  nationals`, `for {A} citizens`, `without/not/non-{A}`, `on a {A} passport`,
  `{A} citizens, or (other) EU…`, `if you can claim / qualify for / may
  qualify for`, `equal status`, `your/other nationality`, `other nationals`,
  `country of (your) citizenship`, `whether your country`, `your own
  country's`. "Labelled" therefore means the sentence says whom it is for, and
  nothing is exempted by file.
- **Allowlist.** `data/audience-allowlist.json` holds
  `{ "entries": [{ "file", "match", "rule", "reason" }] }`. `match` is an
  exact substring, not a line number, so it survives edits. The guard fails
  when an entry no longer matches anything (stale), or when its `reason` is
  under 20 characters. Expected initial entries are the calibrated false
  positives, about 8: `is.json funding[2]` (the Icelandic loan rule mentions
  "Danish SU" as another state's aid), `freshness-policy.json` hardStop,
  `medicine-abroad notCheckedNotes[3]`, `dk-sdu meta.notes[1]` ("Danish
  applicants" describing Danes), `it.json` "low by Danish standards" (the
  place they live now), `publication-floor.mjs` L123 (a developer-facing
  message), and `denmark.mjs` L547/L597 (the SU page itself).

**Calibration today** (`node docs/research/audience/draft/calibrate.mjs`):
- The draft refuses **342 strings** in the current tree.
- It catches **74%** of the strings reviewers classed A/B (262 of 352), with
  **9 false positives** among the 642 read-C strings.
- The 26% it misses are not pattern-shaped: "Danish citizens receive a visa on
  arrival" (true of all EU), "the Embassy of Japan in Denmark", "Denmark's SU
  works differently", and money-only notes. That residue is why the inventory,
  not the guard, is the phase-2 worklist. The guard's job is to stop the
  pattern-shaped cases coming back.

**Landing order.** The guard fails until the rewrite is done, so register it
in the same change that applies the last busy-file batch. Before that, run it
with `--report` as the worklist's checklist. Its fixtures pass today.

## Apply order (phase 2)

Files being edited by other agents right now. **Do these last**, and re-validate
every `find` first: `build-inventory.mjs` reports any `find` no longer present
in the text.

- `data/countries/` (204 A/B/money locations)
- `data/destinations/` (55)
- `data/evidence/` (45)
- `data/application-routes/` (15, including both `readerAccess` changes)
- `src/lib/primitives.mjs` (no edits proposed; its `AUDIENCE` labels are already correct)
- `src/pages/destinations.mjs` (1, L615)
- `src/pages/explorer.mjs` (no audience edits)
- `src/assets/js/map.js` (no hits)

The rest can go first (49 locations):
1. `src/pages/home.mjs`, `denmark.mjs`, `meta.mjs` and `timeline.mjs`, plus
   `src/lib/dimensions.mjs`. The SU sentences wait for su.dk verification.
2. `data/topics/*` (medicine-abroad, distinctive-options) and `data/preparation.json`.
3. `data/dk/itu.json` and `data/institutions/dk-itu.json`, `data/dk/au.json`
   and the AU opportunities, `application-systems` and `context-notes`.
4. The planner: the Nordic option, the data-declared group containment, and
   the scheme adjective in JS.
5. The `audience` block in `site-config.json`, the allowlist, and the guard,
   last and together.

The memory rule "canonical records are live" applies: edit `data/dk` records
directly, and never re-run `migrate:dk`.

## Needs official verification before phase 2 writes it

| Topic | Where | What to check |
|---|---|---|
| SU equal status for EU/EEA citizens living in Denmark | su.dk "EU rules" | Routes beyond own work: a parent working in Denmark, five years' residence; whether Swiss citizens are covered. This affects ~50 strings. |
| SU for a full degree abroad, non-Danish EU/EEA | su.dk | "Equal status or sufficient ties to Denmark": the exact test. Also degrees outside the EU/EEA (AU, CA, NZ, JP, KR, SG, UAE lines). |
| Other countries' portable student finance | Lånekassen, CSN, BAföG … | Only name schemes once checked. The rewrites say "your own country's student finance". |
| MEXT embassy track | Japanese embassies | Whether a non-Danish EU citizen living in Denmark applies through the embassy in their country of citizenship, or can use the Copenhagen embassy. |
| GKS Embassy Track | NIIED 2027 guidelines | Which EU/EEA states are among the 74 invited countries (Sweden and Poland are; Denmark is not). |
| Hungarian bilateral scholarships | Tempus / Stipendium Hungaricum | Which EU states have bilateral agreements. |
| Iceland 5 June deadline | University of Iceland | Confirm that non-Nordic EU/EEA applicants are on the 1 February deadline. |
| Norway "outside the Nordic countries" | NMBU | Whether this means citizenship or school location. |
| Studieprøven | Danish institutions | That it is the route into Danish-taught programmes for an IB holder without Danish A. |
| ITU Global Business Informatics | itu.dk | Whether the rule is Danish A, or Danish schooling. |
| AU "Danish applicants" | au.dk | Whether AU's wording turns on Danish A or on citizenship. |
| SIRI registration | nyidanmark.dk | Whether an EU citizen registered as a family member needs a new basis on becoming a student. |
| Folk high school price | højskolerne | Whether EU/EEA residents pay the subsidised price. |
| One-offs | see `verifyNote` | CSC Type A embassy; UAE and Singapore visa-free lists; EPFL "Swiss applicants"; Czech "EU citizens/residents"; Quebec RAMQ agreements; Latvian loans; NZ Excellence Awards; Study in Iceland "Nordic students". |
| Exchange rates | one dated table | Every EUR figure the reviewers added. |

Filter `inventory.jsonl` on `needsVerification: true` for all 130 distinct strings.

## Phase 2b — log (busy-file batch, started 2026-09-24 after the coordinator's go)

- **Funding references.** The SU funding lines become references to the
  shared record rather than restatements.
  - A funding item may now be `{ "fund": "fund-dk-su", "note": "…" }`
    (`schemas/destination.schema.json`).
  - `src/lib/data.mjs` `fundingLine()` resolves it to "Danish SU, <label>.
    <note> <otherwise>". The adjective comes from the Destination record, and
    the code names no country.
- **Scholarship access (decided).** GKS 2027 stays `closed` with the
  graduation-date reason; MEXT becomes `conditional`.
- **EUR figures.** Recomputed from the ECB table of 24 September 2026, not the
  reviewers' assumed rates.

### Phase 2b — result (2026-09-24)

**Applied by `apply-busy.mjs`** (re-runnable; a re-run reports 0 to apply and
342 already applied):
- 295 inventory edits across 80 files in `data/countries`,
  `data/destinations`, `data/evidence`, `data/application-routes` and
  `data/application-systems`. Every edit was re-validated against the current
  text; 0 had to be relocated.
- **10 edits were stale** because the round-3/4 country fixer had already
  rewritten those lines: Portugal ×5, Italy ×1, Japan MEXT ×4. The guard finds
  nothing left in any of them.
- **EUR figures** in 20 edits were recomputed from the ECB table of
  24 September 2026 and cite it ("at the ECB rate of 24 September 2026").
- **41 SU funding lines → `{ "fund": "fund-dk-su", "note": … }`**. The
  label and fallback come from the shared record. Each note keeps only what is
  particular to the country (Nordic terms, the four-year cap, outside EU/EEA,
  the rate where the page quoted it). The "studievejleder" references are gone.
  - Denmark's own two SU lines became one reference.
  - `scripts/validate.mjs` now checks every `fund` reference, in both
    `data/destinations` and `data/countries`.
  - The seven SU labels that said "EU/EEA citizens with sufficient/qualifying
    ties" were corrected to "equal status, and in both cases the
    ties-to-Denmark requirement" (verification §1).
- **Access states:**
  - `jp-mext-embassy-2028` and its `jp.json` deadline are now `conditional`,
    with the nationality reason. The calendar renders "Only if: Depends on your
    nationality…".
  - `kr-gks-embassy-2027` and its `kr.json` deadline stay `closed`, with the
    reason now the 31 December 2026 graduation-certificate rule.
  - `scripts/test-calendar.mjs` pins both, in two checks.

**By hand (guard residue):**
- ch fee note; cn and hk SU watch-outs; lu "EU citizens, including Danes";
  sg ASEAN; us summary; hk summary; us fee lines ×3; kr evidence [9];
  it "by Danish standards".
- `src/pages/destinations.mjs` L615 now reads "EU/EEA citizens usually pay the
  home-student rate".

**Round-4 small fixes** (verified):
- **SMU:** English A at 6/7 for Law and Computing & Law. I read it on SMU's IB
  page in a browser on 2026-09-24; its text is rendered by script.
- **Dalhousie:** guaranteed residence needs an application by 15 May 2027
  (dal.ca dates page, 2026-09-24).
- **NYUAD:** IB median 40 (38–41), from `ev-ae-nyuad-admit-rate-2022`.
- **Zhejiang:** some majors open to 31 May 2026. This rests on round 4's
  reading of the 2026 guide; I did not re-read it.

**Guard wired:**
- The draft moved to `scripts/lib/audience.mjs` and `scripts/test-audience.mjs`.
- `data/site-config.json` gained its `audience` block, and
  `data/audience-allowlist.json` holds 10 reasoned entries.
- It is registered in `scripts/lib/quality-gate.mjs` as `audience`, stage data.
- Funding-reference notes are read in the context of their scheme's label.
- The draft copies in `draft/` were removed. `draft/calibrate.mjs` now imports
  the real library.

**Gate** (PowerShell, `SITE_BASE=/IB-Post-Secondary-Opportunities`): **28 of
29 pass**, including the new `audience` check, `calendar`, `validate`, `build`,
`check`, `page-budget` and `release`. The one failure is `image-records`: 7
photo records (`data/images.json`), which belong to the photo agent and were
not touched here.

**Left as C on purpose**, visible in `dist/`:
- "a Danish studentereksamen" in comparisons (CZ, IS, glossary);
- "a Swedish or Danish student taking time out" (SE);
- AU's own words, quoted: "Danish applicants";
- BAAA's quoted fee source.

## Round 1 fixes (critique-round-1.md, scored 6/10)

Verification is in `verification.md` §8 (klip) and §9 (Ukraine). The data
edits are in `apply-round1.mjs` (re-runnable).

1. **Nordic-only admin steps are now conditional, each with the EU/EEA step
   beside it.**
   - **Norway** (steps and residency): "If you are a Nordic citizen, you do not
     register with the police. Other EU/EEA citizens staying more than three
     months register with the police within three months of arriving." Source:
     UiO, already cited.
   - **Finland** (why-it-suits, steps, residency): "If you are a Nordic
     citizen…", plus "Other EU/EEA citizens … Migri". Source: Migri, already
     cited.
   - **Iceland** (residency): EU/EEA and Swiss students register with Registers
     Iceland within three months. Nordic citizens' track is simpler. Source:
     skra.is student page, added.
   - **New guard rule, `group-identity`.** It is built from
     `data/applicant-groups.json`: every group `within` the reader group that
     declares an `adjective`, currently `nordic` → "Nordic". It refuses "as a
     {group} citizen/national/student" and "you are a {group} citizen" as a
     statement. No label excuses it, and only "if you are…" passes. It names no
     group in code; the read-back check covers the group names too.
2. **GKS 2027 University Track closed.**
   - `kr-gks-university-2027` has `readerAccess: closed` with the
     graduation-date reason, and its label no longer says "open to every
     nationality".
   - The Korea page leads with "No May 2027 IB candidate can use the 2027
     round, on either track … Plan for 2028", then the 2028 nationality test
     (`kr.json` ×4, `destinations/kr.json` ×2).
   - `test-calendar.mjs` pins both 2027 tracks as closed.
3. **The shared SU record is reworded.**
   - `label` (for Denmark) now says "five years living in Denmark", not "here",
     with no nested parenthesis.
   - The new `abroad.label` (schema added) is used on every other
     Destination's page: "…equal status under EU rules) and meet the
     ties-to-Denmark requirement". `fundingLine()` chooses it by comparing
     the page's destination with the scheme's.
   - `abroad.ties` is now a full sentence. `rate.basis` reads "a student … their
     parents".
   - The duplicated "ties" clause was removed from 19 country notes.
   - The seven legalistic "(…and in both cases the ties-to-Denmark
     requirement)" parentheticals are cut to "If you can claim Danish SU, …";
     the page's funding line carries the conditions. "If you are not Danish,
     check…" became "If you cannot claim it, check…".
4. **Klip question settled on su.dk** ("Hvad kan du få"). Nordic study is paid
   as if in Denmark and does use SU klip, within the overall 70-klip frame for
   higher education abroad.
   - The FAQ's "does not consume your klippekort" is removed.
   - Norway's "same SU-klip as a Danish degree" now reads "uses SU-klip, within
     the 70-klip frame…".
   - The record states that the reform's effect on the frame is not yet on
     su.dk.
   - The FAQ answer now leads with the answer.
5. **Hungary.**
   - Stipendium Hungaricum is "closed to EU citizens … (Ukraine, among other
     non-EU countries, is)".
   - The Diaspora Scholarship is "closed to anyone living in the EU".
   - The watch-out ends "Unless it is, plan to be self-funded".
   - The destination summary is conditional.
   - The tagline is now "Medicine in English — usually paid for yourself".
6. **Displaced persons from Ukraine.** One labelled line each on the `/denmark/`
   money topic and the `/denmark/money/` tuition paragraph: no tuition and no
   application fee under Act no. 324 of 16 March 2022. Verified on AU's
   bachelor fee page and the Royal Danish Academy's page; the AU source was
   added. SU for this group was not verified, so the line says nothing about
   it. The money page lede now says "EU, EEA and Swiss citizens".
7. **Guard hygiene.**
   - The `not {A}` label now needs "citizen(ship)/national(ity)/passport", or
     "if/unless you are not {A}"; "not Danish-taught" no longer excuses.
   - `home` cannot be excused by a label, and also catches "your home country,
     {N}".
   - `identity` catches "you are {A}" as a statement.
   - There are new fixtures for each loophole the critic listed.
   - The `publication-floor.mjs` allowlist reason now says it is rendered on
     `/trust/`.
   - One new allowlist entry covers Registers Iceland's own page title.
8. **Housekeeping.**
   - The MEXT `readerAccess.reason` ends at "…each decides what it offers.";
     the Copenhagen fact stays once, in the steps and watch-outs.
   - Reykjavik University's fee is recomputed: ISK 656,000 ≈ €4,750.
   - README count left alone, as instructed.
   - Prose:
     - the Norway context note ("Doing so" / "will not") was rewritten;
     - the Finland "If you are not Danish" line became "If you cannot claim SU".

**Gate** (PowerShell, `SITE_BASE=/IB-Post-Secondary-Opportunities`): **all 30
checks pass**, including `audience`, `calendar`, `validate`, `release` and
`image-records` (now green after the photo agent's work).
