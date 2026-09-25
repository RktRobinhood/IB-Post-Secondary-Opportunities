# Upcoming sessions research (open days, info sessions, webinars)

Checked: 2026-09-25. Window: 25 Sep 2026 – Sep 2027 (autumn 2027 entry).
Status: IN PROGRESS. Per-group shards are being written to `shards/*.jsonl`; they are merged into
`sessions.jsonl` at the end. If this line is still here, the merge did not happen: read the shards.

## Record format (one JSON object per line)

| field | meaning |
|---|---|
| `institution` | site id, e.g. `dk-au`, `nl-tudelft`; flagship-only schools use `<cc>-<slug>` and `"flagship": true` |
| `title` | the institution's own name for the event |
| `kind` | `open-day` \| `info-session` \| `webinar` \| `taster` \| `tour` \| `fair` |
| `status` | `announced` (dates published for this cycle) \| `precedent` (last cycle's dates; 2026–27 not yet announced) \| `none-published` (nothing found; one line per institution so coverage is explicit) \| `recurring` (standing offer bookable on request, e.g. weekly campus tours) |
| `start`, `end` | ISO 8601 with offset where times are known (`2027-02-27T10:00:00+01:00`); date only (`2027-02-27`) if no time |
| `timezone` | IANA zone the times are in, e.g. `Europe/Copenhagen` |
| `format` | `online` \| `in-person` \| `hybrid` |
| `place` | campus / city / platform |
| `language` | `en`, `da`, `nl`, … |
| `audience` | `international` \| `ib` \| `all` \| `domestic` (e.g. Danish-language gymnasium events) |
| `registrationRequired` | `true` \| `false` \| `null` (unknown) |
| `registrationDeadline` | ISO date or `null` |
| `url` | the institution's own page proving it |
| `quote` | short verbatim text from that page showing the date |
| `checked` | date the page was read |
| `notes` | anything else (recurring pattern, per-programme variants, precedent year) |

## Coverage per institution

(filled in at merge)

## Recurring patterns

(filled in at merge)

## Gaps

(filled in at merge)
