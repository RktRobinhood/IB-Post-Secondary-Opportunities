# Country batches

Optional reference for coordinating a country batch. The [worker card](WORKER_CARD.md)
is the required brief; [roadmap #83](https://github.com/RktRobinhood/IB-Post-Secondary-Opportunities/issues/83)
gives the current work order and owner decisions.

1. Name the country and the existing institution records being updated. Resolve
   renamed or merged institutions before creating an entry. New institutions wait
   until the single-data-shape migration in #74 has landed.
2. Divide records between workers with exclusive file ownership. Reuse dated
   official-source snapshots where applicable, then read the responsible sources
   for changed requirements, teaching language, fees and application dates.
3. Fill the common fields listed on the worker card. Keep unpublished answers
   explicit, distinguish applicant groups, and retain a source link and checked
   date for each fact. A catalogue is a handoff, not a claim that every course
   meets the student's requirements.
4. Use locally stored photographs with their source and credit. Inspect the
   actual crop. Existing image tooling is reference material, not an additional
   research or reporting workflow.
5. Check the edited records, build and run the full gate as described on the
   worker card. Inspect representative generated country, university and
   programme pages when a data projection changes.
6. Use one issue branch and pull request. Merge low-risk work after green CI;
   template and site-wide changes use the [critic review](QA_CRITIC_LOOP.md).

Facts and remaining questions belong in the records. Use the commit message or
issue for a short handoff; no per-institution narrative report is required.
