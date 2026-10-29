# External institution research specification

Version 1.0. Prepared 19 October 2026 for IB Pathways. This document is a reusable prompt: give it to a research AI together with one assignment line from `ASSIGNMENTS.md`. It is self-contained; the AI does not need repository access or the companion schema to understand the task.

## Your task

Research the institution in the assignment using live official sources. Return **one valid UTF-8 JSON file**, named `<institution_key>.research.json`, following the format below. If file attachments are unavailable, return the JSON in one code block with the filename above it. Do not return a prose report instead of the file.

The readers are IB students at a school in Denmark, predominantly EU/EEA citizens, planning first-year post-secondary entry in **2027**, normally autumn or the institution's corresponding main intake. They may hold the full IB Diploma or DP Course Results. Citizenship, residence, school location and fee status are separate: studying in Denmark does not establish Danish citizenship or a particular fee classification.

Use the exact `institution_key` supplied. Starting links, hints, existing names and summaries in the assignment are unverified leads. Confirm the correct institution and campus. A branch campus can have different programmes, entry rules, fees and accreditation from its parent. Do not change the assignment to a similarly named institution.

### Follow the assigned mode

| Mode | Required work |
| --- | --- |
| `full` | Determine scope, research institution entry and application rules, and collect the programmes and topics below. |
| `enrich` | Address every named gap. Retain existing programme identities. Add supporting sources and any directly relevant corrections. Research new flagships only when `flagships` is requested. |
| `overview` | Research the named programme targets and write their descriptions. Do not spend the run researching entry rules, fees or dates. |

For an `enrich` assignment, existing programmes are a baseline to avoid duplicates, not an instruction to research every field again. `targets` identifies programme descriptions/detail to research; `gaps` can additionally request institution-level work such as faculties or IB entry. If you find a serious contradiction outside scope, record it as a gap or conflict.

Work through the assignment yourself. Save useful partial research if tools, time or usage run out. An honestly incomplete file is acceptable. Never fill a required topic with an invented fact to make the package appear complete. Do not edit the website, publish data, contact admissions, create accounts or submit applications.

## Establish which programmes belong

Choose one research scope from official programme catalogues and language/entry pages:

- `listed`: a bounded set of English-taught first-year programmes; enumerate **every eligible programme**, not a convenient sample. Record catalogue pages and filters used. Set `programme_list_complete` true only after checking the full list for the target intake.
- `catalogue`: nearly all undergraduate study is in English and the catalogue is too large to reproduce. Research **two to four flagships** supported by the institution's own descriptions of its strengths, plus its undergraduate faculty/school/college structure and first-year guidance. Provide the undergraduate course-search handoff. Document a justified smaller set or a college with no faculty structure rather than inventing them. Keep `programme_list_complete` false: the flagship set is intentionally selective.
- `none`: official evidence establishes that no in-scope English-taught first-year option exists for the intake. Keep `programmes` empty and explain the evidence in a scope claim. Such records are internal exclusions.
- `undetermined`: access or evidence is insufficient to decide. Keep the uncertainty visible. A blocked website or an unsuccessful search never proves `none`.

Include bachelor's and locally equivalent professional first degrees; include a long-cycle first degree only when school leavers can enter it directly. Explain the credential and duration. Exclude master's-only study, exchanges, isolated English modules, postgraduate medicine, foundation-only routes, top-ups, and programmes requiring previous higher education or professional training. Distinguish bilingual teaching and mandatory local-language clinical placements from fully English delivery. An English webpage is not evidence of English instruction or first-year access.

For 2027 entry beginning in January/February or another term, name the actual intake in the claim and programme campus/intake information; do not force an autumn calendar onto the Southern Hemisphere. Preserve separate application choices where programmes share a title but differ in campus, credential or route. Do not multiply one programme's specialisations into separate degrees unless applicants apply to them separately.

## Information to collect

For `full` work, attempt each institution topic: `identity`, `scope`, `ib_diploma`, `ib_course_results`, `english`, `application`, `dates`, `tuition`, `funding`. For each included programme, attempt `programme`, `description`, `eligibility`, `subjects`, `selection`, `dates`, `tuition`, `places`, `cutoff`. Catalogue work also attempts `flagship` for each flagship and `faculty` for each first-year faculty/college. A topic may be answered by several precise claims or a documented gap. For `none`, explain which topics are not applicable rather than researching irrelevant programme details.

| Topic | What the answer must distinguish |
| --- | --- |
| `identity` | Official name, type, campus/city, awarding institution, useful institutional context and targeted official handoff. Use a facts/about page for descriptive claims. |
| `scope`, `programme` | Programme availability for the intake, direct first-year access, English delivery, official title and credential, duration, campus, programme URL, catalogue scope and exclusions. |
| `description` | A short `about` sentence and a plain English `overview`: core study, teaching methods, distinguishing features and supported progression. |
| `ib_diploma`, `eligibility` | Full Diploma acceptance, overall minimum, HL total and individual grades where published, core points inclusion/exclusion, predicted versus achieved results, exclusions and conditional offers. Separate a minimum from a typical offer or competitive range. |
| `ib_course_results` | Explicit policy for DP Course Results, including any alternative qualification, combination, bridging or other conditions. Do not infer acceptance or rejection from a Diploma-only page. |
| `subjects` | All mandatory subjects, AA versus AI, HL versus SL, grades and AND/OR combinations. Keep recommendations separate. Retain the original local rule and official conversion source when translating; never invent an IB equivalence. |
| `english` | Tests, scores, component thresholds, validity and IB waivers, distinguishing English A/B and HL/SL where the source does. Include other language requirements when relevant. |
| `selection` | Ranking, tests, interview, portfolio, audition, assignment, essays, activities, quotas and programme-specific steps. Describe eligibility separately from selection. |
| `application` | Portal/direct route, rounds, citizenship/residence rules, application fees, predicted/final-result submission, documents, translations and qualification recognition. Keep legally consequential rules tied to the responsible official source. |
| `dates` | Opening, final submission, priority/early, test registration, tests/auditions, documents, predicted and final IB results, decisions, replies and deposits. Identify the event, intake, applicant group and affected programmes. Keep scholarship and housing dates separate from application closure. |
| `tuition`, `funding` | Official tuition and mandatory fees, currency, year/semester/credit basis, applicable fee group, academic year and conditions. Include official scholarship/aid routes and their separate deadlines; distinguish advertised eligibility from an award guarantee. |
| `places`, `cutoff` | Capacity and historical lowest admitted score, if officially published, with year, selection round, quota and scoring scale. Never substitute a minimum or average for a cut-off; never estimate admission probability. |
| `flagship`, `faculty` | The institution's own basis for a flagship choice; first-year faculties/colleges and their supported entry guidance, each with a targeted URL. Generic liberal arts admission can be institution-wide; say so. |

For descriptions use your own words. `about` should be 40–320 characters. `overview` should normally be 3–5 sentences, roughly 380–750 characters, and at most 130 words, in one paragraph. Cover only what the official material supports; shorter supported text is preferable to padding. Keep scores, application dates and fees outside the description. Avoid rankings, slogans and marketing adjectives. Existing exact names, credentials and campuses must remain identifiable through `existing_name`.

If official description material is thin, first try the same programme's curriculum, study guide, module catalogue and faculty pages. An informed fallback paragraph may use comparable programmes only if generalisations are phrased as typical, the description claim has `status: "inferred"`, and its sources and limitations are clear. Do this only for descriptions. Such material requires editorial approval and cannot establish institution-specific modules, facilities, partners, careers or admissions rules.

## Sources and evidence

Use official institution, admissions portal, government and qualification-authority sources for factual conclusions. Search engines, aggregators and rankings can locate official pages; their snippets do not count as reading the source. Do not guess URLs. Open each cited page or PDF and record what it actually says. A homepage is a starting link, not evidence for a threshold, fee or deadline.

Each factual claim needs a unique ID, responsible source references, applicability and a useful locator. Every non-null factual field in `institution`, `programmes` and `faculties` must be covered by a claim's `supports_paths`; an enclosing object pointer is allowed only when the evidence supports **all** its non-null factual contents. Assignment identity echoes (`institution_key`, `institution_name`, country code) and administrative IDs are not verified merely by being echoed. `existing_name` is also an identity echo; programme title, credential, language and URL still need evidence when newly asserted. Omit unresearched baseline programmes from partial returns rather than presenting their fields as verified.

`sources` is the bibliography; `claims[].evidence` explains how each source supports a particular claim. For each evidence item include the page heading/table row or PDF page, and a short paraphrase in `supports`. An optional exact `excerpt` can help a reviewer locate a rule. Keep quotations short: normally no more than 25 quoted words in total from any one source across the file. Paraphrase the rest. Preserve the original wording only when needed to explain a consequential ambiguity, within that limit.

For PDFs, record page and section in `locator`; for HTML use a heading, table row, anchor or distinctive passage. If available, an archive link or locally saved small screenshot/PDF extract can be described by `saved_copy`. Add `sha256` only if computed from the actual saved bytes. These materials are optional; a referenced filename without the supplied file is not evidence. Do not reproduce entire copyrighted pages. Do not claim a snapshot, hash, publication date or page number you did not obtain.

Record actual access dates and distinguish them from publication/update dates and the intake the material covers. A page read in October 2026 can describe 2026 entry. For 2027 facts not published, return `unpublished` with evidence that the institution says so; if you merely did not locate them, use `not_found`. Historical rules may be useful but must say `historical` and name their actual year. Do not roll a 2026 deadline forward by one year. A standing date needs explicit evidence of its applicability to the target cycle before it is treated as current.

Keep EU/EEA, Swiss, non-EU, domestic, residence and fee-status distinctions as the source states them. If two official pages disagree, retain both claims with `status: "conflict"` and add a conflict record. Explain a possible scope difference without silently selecting the easier rule. Do not label your submission independently verified; verification happens after handback.

## Exact JSON contract

Use these top-level keys and no others. All listed keys are required. Use `null` for an unknown nullable scalar, `[]` for an empty collection, numeric JSON values for numbers, and JSON booleans for booleans. Do not use comments, trailing commas, ellipses, `NaN`, footnote markers or tool citation tokens. Optional keys are explicitly identified below. The companion `research-pack.schema.json` encodes these structural rules; the definitions here are sufficient without that file.

| Key | Type and content |
| --- | --- |
| `schema_version` | Exactly `"1.0"`. |
| `institution_key`, `institution_name`, `country_code` | Strings echoed from the assignment; country code is two lowercase letters. |
| `target_intake` | Exactly `"2027"`; individual claims retain their actual cycle. |
| `research_date` | Actual `YYYY-MM-DD` completion date. Source access dates can be earlier. |
| `assignment` | `{ "mode": "full" or "enrich" or "overview", "gaps": [exact requested gap labels] }`. |
| `coverage` | `{ "scope": "listed" or "catalogue" or "none" or "undetermined", "programme_list_complete": boolean, "notes": string }`. Explain scope limitations. |
| `institution` | `{ "summary": string or null, "handoff_url": URL or null }`. Summary normally at most 150 characters. |
| `programmes` | Array of programme objects described below. Include only programmes actually researched in this return. |
| `faculties` | Array of `{ "id": string, "name": string, "url": URL or null, "guidance": string or null }`. IDs unique across programmes/faculties and different from `institution`. |
| `claims` | Array of claim objects described below. Each addresses one coherent rule or fact. |
| `sources` | Array of source objects described below. One entry per source URL, re-used by ID. |
| `gaps` | Array of gap objects described below. Include unresolved requested topics, partial catalogue coverage and interrupted work. |
| `conflicts` | Array of `{ "id": string, "claim_ids": [at least two claim IDs], "explanation": string, "next_step": string }`. |

Each programme object has **all** these keys:

```json
{
  "id": "p01",
  "name": "Official programme title",
  "existing_name": null,
  "credential": null,
  "campus": null,
  "language": null,
  "duration_years": null,
  "url": null,
  "about": null,
  "overview": null
}
```

`id` is a stable ID within the returned file. `existing_name` echoes the exact baseline name for an existing programme; otherwise null. Other nulls mean unknown. `duration_years` is a positive number when known; the other values are strings or null. Record programme term, detailed language conditions, accreditation and first-year eligibility in claims. A programme's factual name itself needs a programme/description claim and evidence.

Each claim has **all** these keys:

```json
{
  "id": "c01",
  "entity_id": "p01",
  "topic": "subjects",
  "status": "supported",
  "statement": "Plain English statement of the rule, with its limits.",
  "value": null,
  "applies_to": {
    "intake": "2027",
    "applicant_group": "Full IB Diploma applicants; EU/EEA citizens where applicable",
    "programme_ids": ["p01"],
    "fee_status": null
  },
  "evidence": [],
  "supports_paths": [],
  "notes": null
}
```

`entity_id` is `institution`, a programme ID or a faculty ID. `topic` must be one of the topic names in the information table. `status` is one of `supported`, `historical`, `unpublished`, `not_found`, `blocked`, `conflict`, `not_applicable`, `inferred`. `value` is an object or null. `notes`, `fee_status` and `applies_to.intake` are strings or null; use null intake for genuinely undated identity facts. `programme_ids` is empty for institution-wide facts. An unknown policy must not be encoded as false or zero.

`evidence` contains objects with **all** keys `{ "source_id": "s01", "locator": "Heading or PDF page and section", "excerpt": null, "supports": "What this passage establishes" }`. The array must be nonempty for `supported`, `historical`, `unpublished`, `conflict` and `inferred` claims. Other statuses normally belong in `gaps`. `supports_paths` is an array of JSON Pointer strings, for example `/programmes/0/overview`; escape `~` as `~0` and `/` as `~1` inside property names.

Use structured `value` for numbers and consequential rules, with the following shapes. Include all shown keys; unknown components are null. Split distinct rounds, events or fee groups into separate claims. Additional keys inside `value` are allowed when needed and explained by the statement.

| Claim | Structured `value` |
| --- | --- |
| IB point threshold | `{ "minimum_total": 32, "out_of": 45, "includes_core": true, "minimum_hl_total": null, "threshold_kind": "minimum" }`; threshold kind can instead be `typical_offer` or `competitive_range`. A range uses additional `maximum_total`. |
| Subject requirements | `{ "original_rule": "Paraphrase of the published rule", "requirements": { "all": [{ "subject": "mathematics-aa", "level": "HL", "minimum_grade": 6 }, { "any": [{ "subject": "physics", "level": "HL", "minimum_grade": 5 }, { "subject": "chemistry", "level": "HL", "minimum_grade": 5 }] }] }, "conversion_source_ids": [] }`. Use recursive `all`/`any` nodes to retain the logic. Canonical subject names may be plain English when no project ID is known. Never treat AA and AI as interchangeable without evidence. |
| Milestone/date | `{ "event": "application_closes", "date": "2027-01-15", "time": null, "timezone": null, "round": null, "date_kind": "final", "consequence": "Applications after this date are not considered" }`. Allowed date kinds: `opens`, `final`, `priority`, `test_registration`, `test`, `documents`, `results`, `decision`, `reply`, `deposit`, `housing`, `scholarship`. For an official window use additional `end_date`; for a month-only or undated rolling policy use null `date` plus `date_text`. Do not invent day, closing time or zone. |
| Tuition or fee | `{ "amount": 12000, "currency": "EUR", "basis": "academic_year", "academic_year": "2027-2028", "fee_group": "EU/EEA", "mandatory_fees_included": false, "conditions": null }`. Basis is `academic_year`, `semester`, `credit`, `programme`, `application`, `other`. A range adds `maximum_amount`; free tuition is zero only when explicitly supported. |
| Capacity | `{ "places": 40, "intake": "2027", "quota": "all entrants", "round": null }`. |
| Historical cut-off | `{ "score": "139.4", "scale": "Finnish technology selection score out of 172.1", "intake": "2026", "quota": "first-time applicants", "round": "certificate admission" }`. Keep the original scale. Add an IB conversion only with an official source. |

Each source has **all** these keys:

```json
{
  "id": "s01",
  "url": "https://official.example/admissions",
  "title": "Actual page or document title",
  "publisher": "Responsible institution or authority",
  "kind": "official_institution",
  "accessed_on": "2026-10-19",
  "published_on": null,
  "updated_on": null,
  "source_intake": null,
  "access": "read",
  "material_type": "html",
  "saved_copy": null
}
```

Allowed `kind`: `official_institution`, `official_portal`, `government`, `qualification_body`, `other`. Allowed `access`: `read`, `blocked`, `not_found`, `snippet_only`. Allowed `material_type`: `html`, `pdf`, `official_dataset`, `other`. Dates are `YYYY-MM-DD` or null except `accessed_on`, which is required. `source_intake` is a string or null. `saved_copy` is null or `{ "filename": string, "sha256": string or null }`. Nonofficial material supports discovery or explicitly inferred descriptions only.

Each gap has **all** keys `{ "entity_id": "institution", "topic": "ib_course_results", "status": "not_found", "reason": "Specific remaining question and limits", "attempted_source_ids": ["s01"], "searches": ["Actual search query, catalogue filter or access attempt"] }`. Use the same topic vocabulary and these gap statuses: `unpublished`, `not_found`, `blocked`, `conflict`, `not_applicable`. Distinguish failure to find a rule from an explicit rule that something is not accepted. In a partial return, every requested topic is either answered or explicitly unresolved.

## Before returning the file

1. Parse the JSON if your tools allow it; remove invalid syntax and citation tokens. Check IDs, source references and paths.
2. Check every requested gap and targeted programme has an answer or a specific unresolved gap. If interrupted, retain completed claims and list remaining work.
3. Check every substantive factual claim cites a source actually read, with a precise locator. Requirements, dates and fees must cite a responsible official source. No invented verification.
4. Check cycle, campus, qualification, applicant group and fee status on consequential claims. Preserve historical years and source conflicts.
5. Return the single `<institution_key>.research.json` file. Optional saved extracts may accompany it; the JSON must remain useful without them.

## Handback and later validation

The owner can collect files from different AIs and return them in batches, optionally as a ZIP. The local review first checks JSON/schema, identity, IDs, source links, unresolved gaps and assignment coverage. It then opens sources and verifies admissions rules, dates, fees, language and first-year access, samples descriptive claims, reconciles conflicts and checks against existing records. Large or inconsistent submissions may need additional source checks. A syntactically valid pack is not proof of accuracy.

The research pack is an interchange format. It does **not** replace `data/schools`, canonical Institution/Programme/Opportunity records or their existing schemas, and there is no automatic importer. Accepted claims can be mapped to the appropriate records while preserving provenance; unknown, historical, inferred and conflicting facts require an explicit editorial decision before publication.

When returning files locally, an optional structural and consistency check is available:

```powershell
python scripts/validate-external-research.py path/to/returned-files
```

The checker uses Python's `jsonschema` package and does not access the network or modify records. It reports whether the structure and internal evidence links pass, plus gaps requiring review. The two documents needed for outsourcing are this spec and one line from the assignment list; the schema, audit and checker are supporting local tools.
