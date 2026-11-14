# IB Post-Secondary Opportunities

**[rktrobinhood.github.io/IB-Post-Secondary-Opportunities](https://rktrobinhood.github.io/IB-Post-Secondary-Opportunities/)**

A guide to English-taught undergraduate study for IB Diploma students, built for
the **May 2027 session** and **autumn 2027 entry**. Denmark in programme-level
detail; 35 countries across Europe and beyond in country-level detail.

It is a static site with no database, no accounts and no tracking. Every page is
generated from JSON records in this repository, and every consequential fact
carries a source, a date, and a statement of how far it can be trusted.

For implementation work, start with [CLAUDE.md](CLAUDE.md) and the
[worker card](docs/WORKER_CARD.md). The current work order and owner decisions
are in [roadmap #83](https://github.com/RktRobinhood/IB-Post-Secondary-Opportunities/issues/83).
The longer documentation below is optional background.

---

## What it does

**Tells a student what they qualify for, and shows its working.** Enter six IB
subjects, levels and grades and the [subject checker](https://rktrobinhood.github.io/IB-Post-Secondary-Opportunities/planner/)
converts them onto the Danish scale using the Agency's official table, then
tests them against every English-taught Danish programme — rule by rule:

> ✓ English A: Literature HL counts as English A, which covers the required B.
> ✓ Mathematics: Analysis and Approaches HL counts as Mathematics A; grade 6 converts to 10, at or above the required 4.
> ✓ You satisfy one of the 2 accepted subject combinations.
>
> **Meets published requirements** · Restricted admission — most recent cut-off 7.5 (2026 intake, not a prediction)

**Reproduces the conversion tables nobody else publishes in full.** The Danish
Agency's *Eksamenshåndbogen* is the handbook every Danish university defers to.
It is Danish-only, behind a JavaScript database view, and several universities'
own summaries of it are out of date — one still lists a maths course discontinued
years ago. [The conversion page](https://rktrobinhood.github.io/IB-Post-Secondary-Opportunities/denmark/ib-conversion/)
has the subject table, the points-to-average scale and the single-grade scale,
with the awkward cases spelled out.

**Says when the answer is no.** A country page that tells you there is nothing
for you has done its job. Norway's four biggest universities offer no
English-taught bachelor's at all. Iceland has exactly one in the whole country.
The University of Copenhagen teaches every bachelor's degree in Danish.

**Refuses to guess.** Where a figure could not be verified, the field is empty
and the page says so. Where two official sources disagree, both are kept and the
result is held back rather than quietly resolved to the friendlier reading.

---

## How it is put together

```
data/            the source of truth — JSON, hand- and research-written
  schools/         one institution with its programmes and optional detailed intakes
  countries/       country facts, application systems, routes and milestones
  country-guides/  optional detailed country guides
  places/          cities and campuses, with coordinate precision
  recognition/     shared IB subject and grade translation rules
  funding/         shared student-finance schemes
  ib-conversion.json  the Danish Agency's tables, as published
  ib-subjects.json    the IB subject catalogue, machine-readable
  freshness-policy.json  how long each kind of claim stays trustworthy

schemas/         JSON Schema for every entity
src/
  build.mjs        the generator
  lib/             templating, data loading, the eligibility engine
  pages/           one module per page family
  assets/          CSS, client JavaScript, photographs
scripts/          fetchers, validator, checkers, migration
docs/             the product and data specifications
dist/             generated; not committed
```

**One school record owns its programmes.** Optional nested intakes carry
structured eligibility, delivery, fees and application routes. Runtime indexes
serve the checker and calendar; there is one authoring shape and one adapter
for each country, university and programme template.

**Each fact keeps its source and checked date.** Source quotations preserve
useful published wording. Git history records changes; internal attestation
and review ledgers are not authoring requirements.

---

## Running it

Node 20 or newer. There are no dependencies, no lockfile and no install step —
the entire toolchain is Node's standard library.

```bash
npm run dev          # build and serve on :4321, rebuilding on change
npm run build        # generate dist/
npm test             # the quality gate: every check a releasable build must pass
```

**`npm test` is the gate, and deploy CI runs the same one.** Both call
`scripts/qa.mjs`, which runs the list in `scripts/lib/quality-gate.mjs` — one
manifest rather than a set union spread across `package.json` and the workflow
file, which is how the two had come to run different checks from each other.
`npm run qa:list` prints what it runs and what it deliberately leaves out.

| Command | What it does |
| --- | --- |
| `npm test` / `npm run qa` | **The quality gate.** Every check, in stage order: data, build, built site. |
| `npm run qa:data` | Just the checks that read `data/` — the fast loop while editing records. |
| `npm run qa -- --only floor,map` | One or more checks by id, for when you know what you broke. |
| `npm run qa:list` | The manifest: every check, and the network-dependent ones excluded on purpose. |
| `npm run validate` | Records against schemas, and every cross-reference. Fails with the file and the field. |
| `npm run test:eligibility` | Behavioural scenarios against the eligibility engine. |
| `npm run test:probes` | Guards on the source-matching logic, including the negative cases. |
| `npm run check` | The built site: structure, internal links, images, accessibility basics. |
| `npm run check:links` | The above, plus every outbound link. |
| `npm run freshness` | What can no longer be trusted, and why. |
| `npm run rollover` | Every date-bound claim needing re-verification for the next intake. |
| `npm run watch:sources` | Which source pages have changed since they were last read. |
| `npm run migrate:dk` | The one-way Danish migration. Refuses to run without `--force`; see docs/UPDATING.md. |
| `npm run images` | Find and self-host a freely licensed photograph per institution. |
| `npm run images:official` | Collect each institution's own Open Graph image to link to. |
| `npm run images:official -- --report` | Which official images are too heavy to hot-link, so the page falls back to Commons. |
| `npm run images:review` | How much of the imagery a person has actually looked at, worst first. |

Pushing to `main` runs validate → eligibility scenarios → freshness → build →
check, then deploys to GitHub Pages. A broken record or a failing scenario stops
the deployment.

---

## Editing the content

**No HTML is involved.** Every page is generated, so correcting a fact means
editing one JSON file.

Read [the worker card](docs/WORKER_CARD.md) for the data-work brief.

Edit a university and its programmes in `data/schools/<key>.json`. General
country facts, systems, routes and milestones are in `data/countries/<code>.json`.
Keep a source link and the date actually checked beside the changed fact; keep
work notes in Git history. Unknown remains unknown.

Run `node scripts/qa.mjs --stage data` while editing, then `npm test` before
release. Build with `npm run build` and inspect affected desktop and phone pages.

An inline source is small:

```json
{
  "title": "Undergraduate entry requirements",
  "url": "https://example.edu/admissions/requirements",
  "retrieved": "2026-11-14"
}
```

---

## The rules the code follows

These are opinions, encoded, and they are the reason to trust the output.

**Silence means "we do not know", never "not required".** A missing rule produces
*Needs review*, not a pass. Several eligibility scenarios exist purely
to assert that the engine refuses to be generous.

**Four outcomes, and they mean what they say.** *Meets published requirements* ·
*Possible with action* · *Does not currently meet* · *Needs review*. A student
who meets every rule but sits below the floor for one admission route sees
*Meets* as the route that is left (*Quota 2 only*), never as a plain yes. *Possible
with action* names its step for every gap — one test or route, or supplementary
courses no more than the university is recorded as allowing after the IB results,
and at most two (our limit). A permission nobody has recorded is *Needs review*,
not a yes. Nothing is
ever labelled safe, likely or guaranteed. A scenario asserts that no field
anywhere in a result matches `/likely|probability|chance of|guaranteed/`.

**Eligibility is not selection.** Meeting the requirements and getting a place
are different things, computed separately. Historical cut-offs are shown as
context and explicitly labelled *not a prediction*.

**Facts keep a source link and a checked date.** Follow the official institution or rule-owner before applying. The date records when a page was checked, not independent sign-off or a guarantee that its rule is unchanged. Git history holds change notes; internal verification and review bookkeeping are not part of school records.

**Conflicts are never resolved to the permissive claim.** Both are kept, linked,
and the public result is held back.

**A provisional date is never presented as confirmed.** Dates inherited from a
previous cycle are marked, and the page says the authority has not republished
them.

**Nothing about a student leaves their browser.** The profile is subjects,
levels, grades, a predicted total and a fee status. No name, no contact, no
identifier. It lives in one `localStorage` key and a button erases it.

---

## Photographs

Two sources, both with permission you can point at.

**The institution's own Open Graph image**, linked from its own server. That is
the picture a university publishes precisely so its pages look right when
shared. Nothing is copied into this repository, and each one links back to the
page it came from.

**Freely licensed photographs from Wikimedia Commons**, self-hosted and credited
in full on [the credits page](https://rktrobinhood.github.io/IB-Post-Secondary-Opportunities/credits/).
`scripts/fetch-images.mjs` resolves each institution to its Wikidata item and
takes the community's own representative image, rather than keyword-searching
Commons — which mostly returns roadworks near the campus.

A logo identifies; it does not license. Permission is never inferred from public
visibility.

---

## Where it is honest about itself

At the last build: **6 evidence records verified, 100 awaiting review, 0 stale,
0 conflicting**, across 103 distinct sources, all currently reachable.

The six are the Danish national rules, read page by page. The hundred came from
research that did read official pages, but no person has signed them off
individually. Every build prints that line so the ratio cannot quietly rot, and
raising it is the most valuable thing anyone can do to this repository.

Known gaps, all recorded in the data rather than hidden:

- Country profiles outside Denmark list institutions, not programmes.
- Several Asian and Central European fee pages are PDFs or JavaScript-rendered
  and could not be read; those fields are empty rather than estimated.
- Some 2027 dates have not been published by their authorities yet, and are
  marked provisional.

---

## Documentation

| Document | What it covers |
| --- | --- |
| [`CLAUDE.md`](CLAUDE.md) and [`docs/WORKER_CARD.md`](docs/WORKER_CARD.md) | Current agent entry point and university brief |
| [`docs/PRODUCT_VISION.md`](docs/PRODUCT_VISION.md) | What this is for and who it serves |
| [`docs/EXPERIENCE_PRINCIPLES.md`](docs/EXPERIENCE_PRINCIPLES.md) | How it should feel, and the honesty rules for eligibility language |
| [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) | Entities and the evidence contract |
| [`docs/MIGRATION.md`](docs/MIGRATION.md) | How Denmark was migrated, and how to migrate another country |
| [`docs/FRESHNESS.md`](docs/FRESHNESS.md) | Review intervals, conflicts, and the annual rollover |
| [`docs/DECISION_FRAMEWORK.md`](docs/DECISION_FRAMEWORK.md) | Why fit is more than eligibility |
| [`docs/TRUST_AND_GOVERNANCE.md`](docs/TRUST_AND_GOVERNANCE.md) | Corrections, privacy, editorial independence |
| [`docs/IMAGE_STANDARD.md`](docs/IMAGE_STANDARD.md) | The one shape every hosted photograph takes |
| [`docs/UPDATING.md`](docs/UPDATING.md) | The yearly update: tested recipes for every kind of change |
| [`docs/COUNTRY_PIPELINE.md`](docs/COUNTRY_PIPELINE.md) | Optional country-batch coordination reference |
| [`docs/PARALLEL_WORK.md`](docs/PARALLEL_WORK.md) | Running agents in parallel without losing their work |
| [`docs/QA_CRITIC_LOOP.md`](docs/QA_CRITIC_LOOP.md) | Breakage review for templates and site-wide design changes |
| [`docs/PREVIEW.md`](docs/PREVIEW.md) | Showing the site to students and counsellors for feedback |
| [`CONTEXT.md`](CONTEXT.md) | The vocabulary — what an Opportunity is, what a Requirement is not |

---

## Licence and disclaimer

Text and data: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
Code: MIT. Photographs carry their own terms — see the credits page.

**This is not admissions advice.** Admission rules change every year, and
several rules described here are scheduled to change before autumn 2027. Every
page links to the institution's own page. Before you act on anything, open that
link and check it still says what this site says. If it does not, the institution
is right — and please open an issue.
