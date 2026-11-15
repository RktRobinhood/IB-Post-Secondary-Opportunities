# Annual source refresh

Use the annual refresh in [COMMANDS.md](COMMANDS.md#annual-refresh).
`data/site-config.json` owns the intake and IB session. Sources and their checked
dates stay beside facts; there are no per-record recheck schedules.

The command compares primary page content, ignoring navigation, rotating UI,
render timestamps and session tokens. New, changed, broken and unreadable sources
need a country-batch review. An unchanged source can carry an intake label forward;
it cannot establish a newly published deadline. Carried dates remain visibly
previous-cycle guidance, with their original values intact.

Reports, readable source snapshots and the reviewed comparison baseline stay in
ignored `.cache/refresh/`. The first run establishes a baseline after review;
absence of a baseline never means unchanged. Keep the baseline between years.
Do not commit reports or add a university audit diary.

The old age-interval policy, standalone source watcher and institution-only link
checker have been replaced by `npm run refresh` and `npm run check:links`.
