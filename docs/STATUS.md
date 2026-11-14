# Project status

Updated 14 November 2026. [Live site](https://rktrobinhood.github.io/IB-Post-Secondary-Opportunities/).

The English-taught undergraduate guide is being simplified under
[roadmap #83](https://github.com/RktRobinhood/IB-Post-Secondary-Opportunities/issues/83).
The schools and canonical models still coexist; #74 will merge them without
losing student facts or eligibility behaviour. Coverage is unfinished.

- #72 introduces the short worker card, root guide and optional references.
- The approved design reference is in `docs/design/university-page-mockup.html`.
  The site-wide restyle is a later step (#80).
- Next: #73 repository clean-up, then #74 single data shape, following #83.
- Until #75, `npm test` is the full gate; `npm run check` checks built output.
  Pull requests run the gate; pushes to main also deploy the site.

Start data work with [WORKER_CARD.md](WORKER_CARD.md). Dated history lives in
CHANGELOG.md and is read only when a task explicitly requires it.
