# Data migration status

The original Danish entity migration is complete. Its one-off scripts were
removed in repository cleanup #73. Existing Danish pages and the eligibility
checker still read the canonical records under `data/destinations/`,
`data/institutions/`, `data/programmes/`, `data/opportunities/`,
`data/application-routes/`, `data/places/` and `data/evidence/`.
Other countries continue to use the existing country and school records.

[Roadmap #83](https://github.com/RktRobinhood/IB-Post-Secondary-Opportunities/issues/83)
sets the replacement direction: #74 makes the school format the single authoring
shape and retains student-facing facts and eligibility inputs. Do not start a
second entity migration or regenerate the improved Danish records from the
old `data/dk/` inputs. Do not add institutions until #74 lands.

For current edits use the [worker card](WORKER_CARD.md). Follow neighbouring
records, preserve their identifiers and references, and retain source links and
checked dates. A missing answer stays explicit rather than becoming a guessed
requirement, fee or deadline. Run `node scripts/qa.mjs --stage data` while
editing and `npm test` for the full gate.
