# Coordinating parallel work

Optional reference. Start with the [worker card](WORKER_CARD.md) and the
[current roadmap](https://github.com/RktRobinhood/IB-Post-Secondary-Opportunities/issues/83).

- Work on one issue branch and pull request at a time. Split independent files
  between workers, with one named owner per file; keep shared-module edits sequential.
- Workers edit their assigned files. The coordinator reviews the combined diff,
  runs the gate and handles Git so unrelated changes remain intact.
- Store student-facing facts, source links, checked dates and unresolved answers
  in the records. A concise commit message or issue comment is enough to hand off.
- Routine data changes need no separate critic. Template and site-wide changes
  follow [QA_CRITIC_LOOP.md](QA_CRITIC_LOOP.md).
- Follow #83's merge and notification rules. Never rewrite history. Leave the
  checkout clean after merging, and keep [STATUS.md](STATUS.md) to current state.
