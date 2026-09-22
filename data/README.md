# Where new data goes

This repository is built to absorb a lot more data than it currently holds. The
rule that makes that possible: **adding data should never require editing code.**

If you find yourself wanting to change something in `src/` to accommodate a new
country, institution or programme, that is a bug in the templates, not a
requirement of the data. Open an issue.

## The decision, in one question

> Does this describe **one specific programme, at one institution, for one
> intake**?

**Yes** → it belongs in the entity model (`opportunities/`, `programmes/`,
`institutions/`, `places/`).
**No** → it is country-level context and belongs in `destinations/` (migrated)
or `countries/` (not yet migrated).

## Adding a country

Drop one file into `countries/` named `<iso2>.json`. That is the whole job —
the build picks it up, generates its page, adds it to the index, the comparison
table and the public export, and the link checker verifies it.

The schema lives in the research brief and every existing file is an example.
The fields that matter most:

| Field | Why it matters |
| --- | --- |
| `dataAsOf` | Without it the freshness report cannot see the record at all. |
| `sources` | A page with no sources is an opinion. |
| `scope` | `europe` or `worldwide` — decides which index it appears on. |
| `region` | Groups it on the index page. |
| `artDirection` | Optional. Accent colour and background pattern only. |
| `institutions[].wikipedia` | Lets the image and geocoding scripts find it. |

Then:

```bash
npm run geocode -- --only=<iso2>   # give its institutions map positions
npm run images                     # find a photograph for each
npm run build && npm run check
```

**Never invent a figure.** Leave the field out and record the gap in
`watchOuts`. A missing number is a known unknown; a plausible-looking wrong
number is worse than nothing, because nobody will check it.

## Adding or correcting a Danish programme

Danish research lives in `dk/<institution>.json`, one file per institution with
its programmes nested. That is the input format, not the published format. Edit
it and re-run the migration:

```bash
npm run migrate:dk && npm run validate && npm run build
```

The migration is deterministic: the same input always produces the same ids, so
re-running it after new research lands does not break anything a student saved.

## Adding a new institution to a country that already exists

Append to that country's `institutions` array. Give it a `wikipedia` URL if you
can — the image and geocoding scripts both use it, and without one the
institution will have no photograph and no position on the map.

## Adding a source

Evidence records live in `evidence/`, grouped by destination. Each one is a
claim you can point at:

```json
{
  "id": "ev-<host>-<short-hash>",
  "sourceUrl": "https://…",
  "publisher": "Who is responsible for the rule",
  "publisherType": "national-agency",
  "retrievedAt": "2026-09-22",
  "excerpt": "A short faithful quotation.",
  "claim": "What it establishes, in one sentence.",
  "supports": [{ "entity": "opp-…", "field": "requirements" }],
  "verificationState": "needs-review",
  "meta": { "schemaVersion": "1.0", "dataAsOf": "2026-09-22", "reviewBy": "2027-03-01" }
}
```

`verificationState: "verified"` means **a person read the page and signed it
off**. Anything a script produced stays `needs-review`. Do not upgrade records
in bulk to make the build summary look healthier — that number is the honest
measure of how much of this dataset has been checked.

`supports` is what lets the tooling work backwards: when `watch-sources.mjs`
notices a page changed, it lists every claim resting on it.

## What each folder is

| Folder | Holds | Migrated? |
| --- | --- | --- |
| `destinations/` | Country-level rules, fees, IB recognition | Denmark only |
| `places/` | Coordinates, with honest precision | All countries, via `geocode.mjs` |
| `institutions/` | Universities and colleges | Denmark only |
| `programmes/` | Degrees | Denmark only |
| `opportunities/` | A programme, one intake, one campus, one language | Denmark only |
| `application-systems/` | optagelse.dk, UCAS, Studielink… | Denmark only |
| `application-routes/` | Rounds, milestones, submission items | Denmark only |
| `evidence/` | Every source | All |
| `countries/` | Country profiles awaiting migration | 34 countries |
| `dk/` | Danish research input to the migration | — |

Both models build side by side. The loader prefers canonical records where they
exist and falls back to country profiles where they do not, so a half-migrated
dataset is a normal working state rather than a broken one. See
[`../docs/MIGRATION.md`](../docs/MIGRATION.md) for migrating a country.

## Reference files

| File | What it is |
| --- | --- |
| `ib-conversion.json` | The Danish Agency's tables, in its own wording |
| `ib-subjects.json` | The IB subject catalogue, machine-readable, used by the subject checker |
| `freshness-policy.json` | How long each kind of claim stays trustworthy |
| `images.json` | Self-hosted photographs and their credits |
| `official-images.json` | Institutions' own share images, linked not copied |
| `source-fingerprints.json` | Generated by `watch-sources.mjs` — do not edit |

## Before you commit

```bash
npm test
```

Validates every record against its schema, checks every cross-reference, runs
the eligibility scenarios, builds, and checks the built site. The same sequence
runs in CI, and a failure stops the deployment.
