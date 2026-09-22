# Data model and evidence contract

The product will outgrow country pages containing nested prose. Its long-term unit of discovery is an **Opportunity**: a Programme offered by an Institution for a particular Intake, campus, and teaching language.

This document describes the target model. Existing country and Danish institution JSON files can migrate incrementally; presentation code should not gain new assumptions that make that migration harder.

## Canonical entities

| Entity | Stable identity | Owns |
| --- | --- | --- |
| Destination | ISO country code plus jurisdiction when needed | application system, fee context, national IB recognition, living context |
| Place | stable place ID | coordinates, city/region labels, geographic hierarchy |
| Institution | namespaced institution ID | official names, type, locations, official links, brand assets |
| Programme | institution ID plus durable programme ID | credential, field taxonomy, duration, academic description |
| Opportunity | programme, intake, campus, language | deadlines, capacity context, tuition, application route, requirements |
| Requirement | stable ID within an Opportunity | rule type, operator, threshold, alternatives, applicability, evidence |
| Evidence | source URL plus claim ID | publisher, retrieval date, effective dates, structured claim, verification state |
| Student Profile | local anonymous profile ID | IB subjects, levels, grades, points, languages, fee status, interests |
| Eligibility Assessment | Opportunity plus profile and data version | outcome, matched rules, gaps, unknowns, explanation |
| Preparation Action | durable action ID | timing, relation to a gap or interest, official status, supporting evidence |
| Financial Scenario | Opportunity, Student Profile, and Intake | tuition, mandatory fees, living estimate, aid, currency, assumptions, evidence |
| Support Provision | institution or Opportunity plus support type | accessibility, academic, language, wellbeing, careers, and international-student support |
| Outcome Pathway | programme plus jurisdiction | accreditation, professional recognition, further-study access, and work-route context |
| Application Jurisdiction | authority type plus geographic or sector ID | shared admissions rules, responsible authority, covered systems |
| Application System | durable operator/system ID | coverage, portal, choice rules, fees, shared steps, decision and reply model |
| Application Route | Opportunity, applicant group, and Intake | submission channel, rounds, supplementary steps, submission items, milestones |
| Application Milestone | route plus durable milestone ID | type, date/window, time zone, consequence, audience, evidence |
| Submission Item | route plus durable item ID | document/action type, responsible party, destination, format, dependencies |
| Application Plan | local anonymous plan ID | selected Opportunities, resolved routes, checklist state, personal target dates |

## Relationships

```text
Destination
  └─ Place
      └─ Institution
          └─ Programme
              └─ Opportunity (intake + campus + language)
                  ├─ Requirement ── Evidence
                  ├─ Deadline ───── Evidence
                  └─ Cost ───────── Evidence

Student Profile + Opportunity + data version
  └─ Eligibility Assessment
      ├─ matched requirements
      ├─ gaps and unknowns
      └─ Preparation Actions

Application Jurisdiction
  └─ Application System

Opportunity + Student Profile + Intake
  └─ Application Route
      ├─ Application Round
      ├─ Submission Items
      └─ Application Milestones

Exploration List + resolved Application Routes
  └─ Application Plan
```

## Requirement vocabulary

Requirements need machine-readable rules and student-readable wording. Preserve the official wording alongside the normalized form.

Supported categories should include:

- full IB Diploma and minimum total points;
- named IB subject, level, and minimum grade;
- one-of or all-of subject combinations;
- general language proof and programme-specific language proof;
- prerequisite equivalencies in the destination's local system;
- aptitude tests, portfolios, auditions, interviews, essays, references, and work samples;
- documented extracurricular or service activity;
- citizenship, residency, age, or prior-education constraints;
- application round, quota, and deadline conditions.

Each rule needs an applicability statement: intake, applicant group, fee status, qualification version, and any exception. “Not recorded” is not equivalent to “not required.”

## Evidence contract

Every consequential claim should be traceable to an Evidence record with:

- `sourceUrl` and `publisher`;
- `retrievedAt`;
- `effectiveFrom` and `effectiveTo` when known;
- the Intake or qualification version to which it applies;
- a short official excerpt or faithful structured claim;
- `verificationState`: `verified`, `needs-review`, `superseded`, or `unavailable`;
- the entity and field supported by the evidence;
- optional notes explaining interpretation or conflicts.

Prefer responsible Official Sources. Aggregators can help discovery but should not be the final authority for admissions rules.

When sources disagree, preserve both claims, show the conflict internally, and downgrade the public result to **Needs review** until resolved. Do not pick the more permissive rule silently.

## Freshness policy

Different facts age differently. Admissions rules, deadlines, tuition, and programme availability need intake-specific review. Institution descriptions and locations change less often. Each data type should eventually have its own review interval and automated stale-data report.

The public UI should show:

- the target Intake;
- when the underlying rule was last verified;
- a warning when an upcoming Intake relies on previous-cycle evidence;
- the official link students must confirm before acting.

Application dates require field-level freshness. A route can remain correct while one Deadline changes. Store the responsible authority, applicant group, Intake, official time zone, consequence, and verification state with each Application Milestone. Dates inherited from a previous cycle remain provisional and must not be normalized into confirmed current-cycle values.

## Application routes and milestones

Do not attach one undifferentiated application URL to an Institution or Destination. Resolve an Application Route for an Opportunity and applicant context. The same Opportunity may have central, direct, transfer, international, or special-category routes with different rounds, fees, Submission Items, and Deadlines.

Application Milestones should support exact date-time values, date-only values, and start/end windows. Preserve the published time zone and classify the consequence as hard, equal-consideration, priority, rolling, indicative, or personal. Open dates, result dates, reply dates, and personal target dates are milestones but not necessarily Deadlines.

Application Plans are derived, student-controlled data. Shared portal actions and Deadlines should deduplicate across Opportunities without erasing Programme-specific supplementary steps. A status marked locally never represents external submission or receipt.

## Geographic and media data

Map behavior requires reliable coordinates at the right level: campus when verified, otherwise institution or city. Record `coordinatePrecision` so a city-centre fallback is never presented as an exact campus location.

Institution media records should include asset type, source URL, source page, owner, licence or usage basis, retrieval date, alt text, focal point, and any expiry or hotlink restriction. A logo is identification, not decoration; do not infer permission merely because it is publicly visible.

## Student data and privacy

The first version should keep Student Profiles in the browser and avoid personally identifying information. Subject choices, predicted grades, interests, and fee status are enough for useful matching. If accounts or synchronization are introduced later, that change requires a separate privacy and security decision.

Sensitive preference fields should be minimized. Disability, health, religion, ethnicity, sexuality, and family finances must not become casual filter dimensions. Where support information is useful, let students explore provisions without requiring disclosure and collect only what is necessary for a user-requested calculation.

## Decision dimensions

The product should preserve distinct dimensions instead of producing one universal rank:

- academic eligibility and competitive selection;
- financial feasibility, including tuition, mandatory fees, realistic living costs, and aid eligibility;
- practical feasibility, including deadlines, visa or residence rules, housing, language, and travel;
- learning fit, including programme structure, teaching, assessment, placements, and flexibility;
- support and belonging, including accessibility, wellbeing, language, academic, and international-student provision;
- future options, including accreditation, professional recognition, postgraduate access, and work routes;
- personal preference, including place, climate, campus type, scale, and distance from home.

Any future recommendation should show these dimensions separately with source coverage and uncertainty. It must not hide value judgments inside a composite score.

## Derived data

Eligibility results, filter facets, map clusters, comparison rows, and public exports are derived views. They must be reproducible from canonical data plus a versioned rule engine. Do not hand-edit a displayed eligibility result.

Application checklists and calendars are also derived views. They must be reproducible from selected Opportunities, Student Profile assumptions, target Intake, Application Routes, official milestones, and student-created target dates. Snapshot calendar exports do not become canonical data.

Each generated dataset should carry:

- generation timestamp;
- schema version;
- data revision or commit;
- target Intake;
- counts of verified, stale, incomplete, and conflicting records.

## Repository direction

As coverage grows, evolve toward explicit, independently updateable records rather than larger country files:

```text
data/
  destinations/
  places/
  institutions/
  programmes/
  opportunities/
  application-jurisdictions/
  application-systems/
  application-routes/
  evidence/
  taxonomies/
schemas/
src/
scripts/
docs/
dist/                 # generated and ignored
```

This is a migration direction, not permission for a disruptive rewrite while research data is in flight.
