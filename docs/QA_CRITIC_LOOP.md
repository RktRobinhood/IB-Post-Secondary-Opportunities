# Template and design review

Optional reference for changes to templates or site-wide design. Routine data
changes, including a date-only refresh, need no independent critic. The explicit
issue list and rules in [roadmap #83](https://github.com/RktRobinhood/IB-Post-Secondary-Opportunities/issues/83)
take precedence.

Before merging #74, #77, #78, #80, #81 or #79:

1. Give a fresh agent the pull request, issue, built pages and desktop/phone
   screenshots of the home page, one country, one data-rich university, one sparse
   university and one programme. It must not have implemented the change. Let it
   judge the artifacts without the implementer's assessment.
2. Ask it to find breakage: missing or wrong facts compared with `main`, broken
   or empty pages, broken links, unreadable text, phone layout failures, and unmet
   issue completion criteria. Taste and a numerical score are not merge criteria.
3. Fix serious findings and ask a fresh critic to check again. Allow at most two
   fix rounds. Merge when no serious findings remain and the full CI gate passes.
4. If serious findings remain, leave the pull request open. Explain the problem,
   attempted fixes and the one needed owner action in a comment mentioning
   `@RktRobinhood`, then take the next independent issue.

Keep findings on the pull request. No repository review diary is required.
The owner is mentioned only for this blocked case or the roadmap's final report.
