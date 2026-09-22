# IB Post-Secondary Opportunities

A joyful, visual guide to the post-secondary opportunities that an IB Diploma can open. The product combines an exploratory map with precise filters, programme-level admissions information, and planning guidance for IB subjects, grades, CAS, and the Extended Essay.

## Product promise

Students should leave feeling that the world has opened up **and** understanding what to do next. The experience must therefore hold two qualities at once:

- **Wonder:** destinations feel alive, discoverable, and worth imagining.
- **Trust:** every consequential claim is dated, sourced, and honest about uncertainty.

This is not a university ranking or an admissions guarantee. It is a decision-support tool that helps students discover options, test published requirements against an IB profile, notice gaps early, and continue to official application sources.

Read [the product vision](docs/PRODUCT_VISION.md), [experience principles](docs/EXPERIENCE_PRINCIPLES.md), [application journeys](docs/APPLICATION_JOURNEYS.md), [dynamic-site research](docs/research/DYNAMIC_SITE_INSPIRATION.md), [decision framework](docs/DECISION_FRAMEWORK.md), [page templates](docs/PAGE_TEMPLATES.md), [data model](docs/DATA_MODEL.md), [trust and governance rules](docs/TRUST_AND_GOVERNANCE.md), and [roadmap](docs/ROADMAP.md) before making structural changes.

## Current shape

The app is a dependency-free static-site generator:

- `data/` contains researched admissions and destination information.
- `src/` turns that data into pages and client-side interactions.
- `scripts/` contains research, image, checking, and local-preview utilities.
- `dist/` is generated output and is not committed.

The current implementation is already broader than Denmark, but its data shapes are still evolving. Do not multiply country-specific exceptions in presentation code. New work should move toward the canonical entities and evidence rules in `docs/DATA_MODEL.md`.

## Working locally

```powershell
node src/build.mjs
node scripts/serve.mjs
```

Then open the local URL printed by the server. Run the project checks before publishing:

```powershell
node scripts/check.mjs
```

## Non-negotiables

1. Programme-level facts, not vague institutional claims, determine whether an opportunity appears to fit a student.
2. An eligibility result must explain itself and link to the evidence behind it.
3. Missing or stale data is shown as unknown; it is never silently treated as permissive.
4. The map, result list, comparison view, and planner are different views of the same filtered opportunity set.
5. Motion supports geography and discovery, respects reduced-motion settings, and never blocks access to information.
6. Logos and imagery need recorded ownership, source, usage basis, and accessible alternatives.
7. Generated deployment files stay separate from authored data and source code.
8. Eligibility is only one dimension of fit; affordability, practical feasibility, support, personal preferences, and future options stay visible.
9. Commercial relationships, automation, and missing evidence never influence results invisibly.
10. Application guidance resolves the student's actual route, distinguishes official from personal dates, and keeps external portals authoritative for submission status.

## Repository

GitHub: <https://github.com/RktRobinhood/IB-Post-Secondary-Opportunities>
