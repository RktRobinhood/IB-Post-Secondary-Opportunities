# Project status

Updated 15 November 2026. [Live site](https://rktrobinhood.github.io/IB-Post-Secondary-Opportunities/).

The English-taught undergraduate guide is being simplified under
[roadmap #83](https://github.com/RktRobinhood/IB-Post-Secondary-Opportunities/issues/83).
School records now own every institution and programme; shared country rules
serve the eligibility checker and calendar. Coverage is unfinished.

- #72 introduces the short worker card, root guide and optional references.
- The approved design reference is in `docs/design/university-page-mockup.html`.
  The site-wide restyle is a later step (#80).
- #73 removed obsolete research artifacts; #74 merged the data shapes.
- #75 introduces the [six commands](COMMANDS.md), a core test set and a quick
  school-only check. CI runs the full gate; pushes to main also deploy the site.
- Next: #76 annual source comparison and intake refresh, following #83.

Start data work with [WORKER_CARD.md](WORKER_CARD.md). Dated history lives in
CHANGELOG.md and is read only when a task explicitly requires it.
