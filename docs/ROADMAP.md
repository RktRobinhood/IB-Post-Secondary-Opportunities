# Roadmap

This roadmap protects the end state without forcing a rewrite of the current working site. Each phase should leave a useful, publishable product.

## 1. Stabilize the foundation

- Adopt the canonical vocabulary and product principles.
- Add repository metadata, a contributor workflow, and automated build/checks.
- Define JSON schemas for current data and fail clearly on invalid syntax.
- Inventory existing records, source quality, freshness, images, and geographic precision.
- Establish editorial ownership, correction, privacy, analytics, and AI-review policies before public launch.
- Publish an initial site and structured data export from one reproducible build.

## 2. Create the opportunity layer

- Separate Institution, Programme, and intake-specific Opportunity records.
- Normalize language, credential, field, fee, and applicant-status taxonomies.
- Model financial scenarios, support provisions, and outcome pathways without mixing them into eligibility.
- Model requirements as explainable rules with official wording and Evidence links.
- Introduce schema and data versions so old assessments can be reproduced.
- Migrate one country end to end before scaling the pattern.

## 3. Build synchronized discovery

- Create the cropped “world window” with verified place coordinates.
- Build reusable page and interaction templates before multiplying one-off layouts.
- Make map, search, filters, result list, and URL state reflect one query model.
- Add destination, subject area, language, cost, credential, intake, and extra-requirement filters.
- Design mobile, keyboard, no-map, and reduced-motion experiences at the same time.
- Instrument performance before increasing map and animation complexity.

Begin with a bounded vertical slice: 40–100 sample Opportunities across three regions, one semantic result list, field/language/current-fit filters, bidirectional marker/list focus, one Evidence-backed detail panel, and normal/reduced-motion/no-WebGL modes. Choose a production globe or map engine only after this proves that geographic motion improves discovery without weakening access, evidence, or speed.

## 4. Add IB eligibility

- Build an anonymous local Student Profile for subjects, levels, grades, total points, languages, and fee status.
- Evaluate programme requirements with explicit matched, gap, and unknown explanations.
- Distinguish eligibility from competitive selection and historical cut-offs.
- Let students compare and save Opportunities in an Exploration List.
- Add counsellor-friendly print or export views with evidence dates.

## 5. Build application navigation and calendar

- Model Application Jurisdictions, shared Application Systems, direct routes, applicant groups, rounds, Submission Items, and Milestones.
- Research and publish Intake-specific walkthroughs using official sources, starting with representative national and provincial systems.
- Resolve applicant-specific Application Routes and expose assumptions or Needs review states.
- Merge selected Opportunities into a deduplicated checklist with shared and supplementary work.
- Add next-action, journey, agenda/month calendar, by-system, and by-Opportunity views.
- Export printable checklists and snapshot `.ics` calendars with stable event IDs, source links, time zones, and verification dates.
- Defer live calendar synchronization until privacy, authorization, update, and revocation behavior is designed and reviewed.

## 6. Add preparation pathways

- Connect actionable gaps to subject, grade, test, portfolio, and deadline plans.
- Classify extracurricular activity as required, used in selection, or recommended preparation.
- Suggest CAS and Extended Essay directions as exploration prompts tied to interests, never as admissions guarantees.
- Build a timeline that combines application milestones with student-controlled preparation actions.

## 7. Scale the data operation

- Add a source-review queue and stale-data dashboard.
- Automate change detection while retaining human verification for consequential rules.
- Expand country coverage through repeatable research templates and validation.
- Add public data documentation and carefully versioned exports or APIs when demand justifies them.
- Establish an annual rollover process for each new IB session and university Intake.

## Cross-cutting quality gates

Every phase must preserve:

- official-source provenance and visible freshness;
- fast, accessible core journeys without animation;
- graceful behavior for incomplete and conflicting data;
- a clean separation between authored data, source code, and generated deployment output;
- no storage of personally identifying student data by default.
