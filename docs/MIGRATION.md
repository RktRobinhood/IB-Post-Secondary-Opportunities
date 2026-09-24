# Migrating to the entity model

`docs/DATA_MODEL.md` describes where the data is going. This describes how it
gets there, what is already done, and what happens to the records that have not
moved yet.

## Where things stand

| Layer | Status |
| --- | --- |
| `schemas/` | Done. Eight schemas, validated by `scripts/validate.mjs`. |
| Denmark | **Migrated.** Its pages, programme finder, subject checker and public export all render from `data/destinations`, `data/places`, `data/institutions`, `data/programmes`, `data/opportunities`, `data/application-systems`, `data/application-routes` and `data/evidence`. |
| Every other country | Not migrated. Still one prose record per country under `data/countries/`, rendered by the destination template. |
| `data/dk/` | Research input only. It is the *source* the Denmark migration reads, not something the site renders. |

The site builds from both at once. `src/lib/data.mjs` prefers canonical records
where they exist and falls back to the country profiles where they do not, so a
half-migrated dataset is a normal state rather than a broken one.

## The pilot, end to end

```
data/dk/dtu.json                            research, one file per institution
        │
        │  node scripts/migrate-denmark.mjs
        ▼
data/places/dk-kongens-lyngby.json          Place, with honest coordinate precision
data/institutions/dk-dtu.json               Institution
data/programmes/dk-dtu-general-engineering.json
data/opportunities/dk-dtu-general-engineering-2027-autumn.json
data/evidence/dk.json                       one Evidence record per source URL
        │
        │  node scripts/validate.mjs        schema + cross-reference
        │  node src/build.mjs               pages + dist/data.json
        ▼
dist/
```

Hand-written rather than generated, because they carry judgement the research
files do not hold: `data/destinations/dk.json`,
`data/application-systems/dk-optagelse.json`,
`data/application-routes/dk-optagelse-international-2027.json` and
`data/evidence/dk-national.json`.

## The migration script

> **It has run, and must not be re-run on the live data.** Since September 2026
> the canonical Danish records carry work the research files do not (source
> quotations, reader access, campus splits), and a re-run discards it. The
> script refuses without `--force`. Edit the canonical records instead — see
> [UPDATING.md](UPDATING.md).

`scripts/migrate-denmark.mjs` is **deterministic and idempotent**. Ids are
derived from institution and programme names, so re-running it after new
research lands regenerates the same ids and nothing a student saved breaks. It
deletes any `dk-*` record before rewriting, so a programme removed from the
research disappears rather than lingering.

Three rules it follows, and any future migration should too:

1. **Absent stays absent.** A field the research did not establish is left out.
   It is never guessed, and never turned into a permissive default.
2. **Every source becomes Evidence.** Each distinct URL mints one Evidence
   record with a stable id derived from the URL, marked
   `verificationState: needs-review` and `verifiedBy: automated`. Automation can
   discover a claim; it cannot verify a consequential one. A human upgrades it.
3. **Requirements are flattened, not summarised.** The nested `{all, oneOf}`
   shape becomes a flat list of rules, each with its own id, applicability and
   evidence, so one rule can later be revised or flagged stale without
   disturbing the rest. The official wording is preserved verbatim alongside it
   in `officialRequirementsText`.

## Migrating another country

1. **Write the Destination.** Copy `data/destinations/dk.json` as a shape guide.
   Move national-level facts out of `data/countries/<code>.json`: IB recognition,
   language, fee context, living context. Programme-level rules do not belong
   here.
2. **Mint the national Evidence.** One record per authority page, in
   `data/evidence/<code>-national.json`. Set `verificationState` honestly — most
   start at `needs-review`.
3. **Write the Application System and at least one Application Route.** This is
   where most of the value is, and where country prose is weakest: rounds,
   milestones with their published time zone, submission items, and who is
   responsible for each.
4. **Add Places** for every city an institution sits in, with
   `coordinatePrecision` set truthfully. A city centre must never be presented
   as a verified campus pin.
5. **Split institutions and programmes.** Either by hand for a small country, or
   by generalising `migrate-denmark.mjs` — its only country-specific parts are
   the place gazetteer and the city descriptions.
6. **Run `node scripts/validate.mjs`.** It fails with the file and field, so the
   loop is short.
7. **Delete `data/countries/<code>.json`** only once the destination template
   renders entirely from the entities. Until then, keep both; the loader prefers
   canonical automatically.

## What is deliberately not done yet

- **A general migration script.** Country profiles vary more than Danish
  institution files do, and a script that guessed at the differences would
  quietly manufacture facts. Migration stays per country and reviewed.
- **Splitting Evidence into one file per record.** Grouped per destination is
  easier to review in a diff at this size. If evidence outgrows that, split it —
  ids are already stable, so nothing else has to change.
- **Programme-level data for countries outside Denmark.** The country profiles
  list institutions, not programmes. That is honest about what has been
  researched rather than implying coverage that does not exist.

## Checking a migration

```bash
node scripts/validate.mjs     # schemas and cross-references
node src/build.mjs            # pages and dist/data.json
node scripts/check.mjs        # structure, internal links, accessibility
```

`dist/data.json` reports `recordCounts` and `evidenceCounts` on every build.
A migration that increases `needsReview` without increasing `verified` has moved
data, not improved it.
