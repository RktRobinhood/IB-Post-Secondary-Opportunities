# IB Post-Secondary Opportunities

**[rktrobinhood.github.io/IB-Post-Secondary-Opportunities](https://rktrobinhood.github.io/IB-Post-Secondary-Opportunities/)**

A guide to English-taught undergraduate study for IB Diploma students, built for
the **May 2027 session** and **autumn 2027 entry**. Denmark in programme-level
detail; 35 countries across Europe and beyond in country-level detail.

It is a static site with no database, no accounts and no tracking. Every page is
generated from JSON records in this repository, and every consequential fact
carries a source, a date, and a statement of how far it can be trusted.

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
  destinations/    country-level rules, fees, IB recognition
  places/          cities and campuses, with honest coordinate precision
  institutions/    universities and colleges
  programmes/      degrees
  opportunities/   a programme, for one intake, campus and language
  application-systems/  optagelse.dk, UCAS, Studielink…
  application-routes/   rounds, milestones, submission items
  evidence/        every source, with a retrieval date and a verification state
  countries/       country profiles not yet migrated to the entity model
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

**The Opportunity is the unit.** A Programme becomes several Opportunities when
its intake, campus or teaching language differs — SDU teaches Software
Engineering in both Vejle and Sønderborg, so that is one Programme with two
Opportunities. It teaches Mechatronics as both a BSc and a BEng, so that is two
Programmes. Getting this wrong silently overwrote records on disk until the
validator caught it.

**Evidence is a first-class entity.** Not a footnote — a record with a publisher,
a retrieval date, an applicability window, an excerpt, and a verification state.
Claims point at evidence; the freshness tooling walks the other way, from a
changed page to every claim resting on it.

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
| `npm run test:eligibility` | 131 scenarios against the eligibility engine. |
| `npm run test:probes` | Guards on the source-matching logic, including the negative cases. |
| `npm run check` | The built site: structure, internal links, images, accessibility basics. |
| `npm run check:links` | The above, plus every outbound link. |
| `npm run freshness` | What can no longer be trusted, and why. |
| `npm run rollover` | Every date-bound claim needing re-verification for the next intake. |
| `npm run watch:sources` | Which source pages have changed since they were last read. |
| `npm run verify` | Re-read every cited source and report whether it still carries the claim. |
| `npm run verify:write` | The same, recording the finding and the supporting quotation on each record. |
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

### Fixing a Danish programme

**Step-by-step recipes for every yearly change are in [docs/UPDATING.md](docs/UPDATING.md).**

Edit the canonical records directly: `data/programmes/dk-<id>.json` for the name,
field, summary and official link; `data/opportunities/dk-<id>-2027-autumn.json`
for requirements, cut-offs, selection notes and start month. Keep the research
notes in `data/dk/<institution>.json` in step. Then:

```bash
npm run validate && npm run build
```

Do **not** run `npm run migrate:dk`. The migration was one-way and has happened;
the canonical records have been improved since, and re-running it would discard
that work. It now refuses unless given `--force`.

### Fixing a country

Country profiles are `data/countries/<code>.json` — one file, plain fields. Edit
and rebuild. If you change a fact, move `dataAsOf` forward and add the source to
`sources`.

### Adding a source

Evidence lives in `data/evidence/`. The fields that matter:

```json
{
  "id": "ev-example-abc123",
  "sourceUrl": "https://…",
  "publisher": "Who is responsible for the rule",
  "retrievedAt": "2026-09-22",
  "excerpt": "A short faithful quotation.",
  "claim": "What we take it to establish, in one sentence.",
  "supports": [{ "entity": "opp-…", "field": "requirements" }],
  "verificationState": "verified",
  "meta": { "schemaVersion": "1.0", "dataAsOf": "2026-09-22", "reviewBy": "2027-03-01" }
}
```

`verificationState: "verified"` means **a person read the page and signed it
off**. Anything a script produced stays `needs-review`. That distinction is load-
bearing and should not be smoothed over to make the build summary look better.

---

## The rules the code follows

These are opinions, encoded, and they are the reason to trust the output.

**Silence means "we do not know", never "not required".** A missing rule produces
*Needs review*, not a pass. Several of the 131 eligibility scenarios exist purely
to assert that the engine refuses to be generous.

**Four outcomes, and they mean what they say.** *Meets published requirements* ·
*Possible with action* · *Does not currently meet* · *Needs review*. Nothing is
ever labelled safe, likely or guaranteed. A scenario asserts that no field
anywhere in a result matches `/likely|probability|chance of|guaranteed/`.

**Eligibility is not selection.** Meeting the requirements and getting a place
are different things, computed separately. Historical cut-offs are shown as
context and explicitly labelled *not a prediction*.

**Automation discovers; people verify.** `watch-sources.mjs` can tell you a page
changed and which claims rest on it. `verify-evidence.mjs` can re-read every
cited source and quote the supporting sentence onto the record. Neither can edit
a requirement or mark anything verified. A machine signing off an admissions
rule is the one failure this product cannot afford.

The distinction is not pedantry. An automated check confirms that "Matematik A"
is still printed on the page it came from; it cannot notice that the page now
means something different by it. So the two are reported as separate numbers and
never merged — currently **0 records signed off by a person, 280 with their source
re-read**, and the site says so on `/trust/` rather than quoting the flattering
one.

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
| [`docs/PRODUCT_VISION.md`](docs/PRODUCT_VISION.md) | What this is for and who it serves |
| [`docs/EXPERIENCE_PRINCIPLES.md`](docs/EXPERIENCE_PRINCIPLES.md) | How it should feel, and the honesty rules for eligibility language |
| [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) | Entities and the evidence contract |
| [`docs/MIGRATION.md`](docs/MIGRATION.md) | How Denmark was migrated, and how to migrate another country |
| [`docs/FRESHNESS.md`](docs/FRESHNESS.md) | Review intervals, conflicts, and the annual rollover |
| [`docs/DECISION_FRAMEWORK.md`](docs/DECISION_FRAMEWORK.md) | Why fit is more than eligibility |
| [`docs/TRUST_AND_GOVERNANCE.md`](docs/TRUST_AND_GOVERNANCE.md) | Corrections, privacy, editorial independence |
| [`docs/IMAGE_STANDARD.md`](docs/IMAGE_STANDARD.md) | The one shape every hosted photograph takes |
| [`docs/UPDATING.md`](docs/UPDATING.md) | The yearly update: tested recipes for every kind of change |
| [`docs/PARALLEL_WORK.md`](docs/PARALLEL_WORK.md) | Running agents in parallel without losing their work |
| [`docs/QA_CRITIC_LOOP.md`](docs/QA_CRITIC_LOOP.md) | How a pass is accepted: a critic scores it, 8/10 or it goes round again |
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
