# Running work in parallel

Most of the work in this repository is done by several agents at once — a
research pass per Destination, a migration per batch of records, a front-end
pass per issue. That only works if a few things are true, and they are not
obvious, so they are written down.

**Accepting the result is a step of its own.** Before a workflow's output is
committed as done, the coordinator puts it through the critic loop in
[QA_CRITIC_LOOP.md](QA_CRITIC_LOOP.md): a separate critic scores it 0–10, 8 or
above is accepted, and after five rounds below 8 the problem becomes an issue.
Agents doing a single scoped task inside the workflow do not run the loop.

## `main` is the product; everything else is scaffolding

The owner, 26 September 2026: "main is the primary focus; branches and work
trees are temporary work environments with the intention of putting them on
main", and every session must "return always to a clean state". The owner
follows the live site, not branches, and so do students and counsellors.

1. **Start from `main`.** Each piece of work begins as a fresh worktree or
   branch cut from the current `main`, never from another unfinished branch.
   Stacking one unfinished branch on another is how `feat-43-school-pages`
   grew to 197 files and kept work off the site for days.
2. **Keep the piece small enough to land the same day.** One issue, or one
   slice of one. If it cannot be made good in a day, split it.
3. **Land it.** When the gate passes on a clean copy of `main`
   (`SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs`) and a
   critic scores it 8 or more — or it is plainly better than what is live,
   with no wrong fact added — merge it to `main` and push. Keep iterating on
   `main` afterwards; do not hold a better version back for a later release.
   Work that would put a wrong date or a generous verdict in front of a
   student does not land until that is fixed.
4. **Clean up in the same session.** Delete the branch (on GitHub too) and
   the worktree once it is on `main`, and update [STATUS.md](STATUS.md). At
   the end of a session the only branches are `main` and any piece still in
   flight, and STATUS says what each in-flight branch is for.
5. **Never commit the scaffolding.** A worktree often links `node_modules`
   to the main checkout; `.gitignore` ignores it as a file or folder, and
   `git add -A` must never be used where it would pick up anything else
   outside the work.

## Every finding goes into the repository, not into a report

**This is the rule the others exist to protect.** An agent's report is a
message. Messages are lost when a session ends, a budget runs out, or a window
is closed, and everything the agent learned goes with them — including the
half of the work that is most expensive to redo, which is not the records it
wrote but the things it established that *nobody can see in a diff*: the page
that 403s to every automated fetch, the two official pages that contradict each
other, the date that was checked and genuinely is not published anywhere.

So a finding is written to disk before it is reported:

| Kind of finding | Where it goes |
|---|---|
| A fact about the world | the record, with its Evidence |
| A gap — checked, not found | the record's own field for it (`dateState`, `ibAccessible: "unknown"`, a `watchOut`), never an empty field |
| Why a source was read a particular way | `interpretation` on the Evidence record |
| A page that cannot be fetched, or was read in a browser | `verifiedBy` or `meta.notes` on the record |
| Something wrong that is out of scope to fix | a GitHub issue |
| Something wrong with the *model* | [PROGRAMME.md](PROGRAMME.md), under "Model friction" |
| What is done and what is next | [PROGRAMME.md](PROGRAMME.md) |

A report then summarises what is already durable. If the session ends the
moment before the report is written, nothing of value is lost.

## Agents do not run git

One agent per commit is a property of the history, not of the work. Several
agents committing into one repository interleave their changes, race the index
lock, and produce a log in which no commit is a complete thought.

So agents write files and the coordinating session commits. It reads the work,
checks it, and writes the message — which is also the point at which somebody
reads the work at all.

## File ownership is stated up front, and it is exclusive

Every agent is told the files it owns and told that it owns nothing else. Where
it must touch a shared file, it is told to make the smallest edit that works
and to list every one in its report, so the coordinating session can check them
without diffing the world.

Conflicts in this repository are almost never in `data/` — records are named
after their subject and a Destination is one agent's business. They are in
`src/lib/` and `src/pages/`, where two passes both want the same primitive. The
cheap fix is sequencing: the data agents run together, the code agents run one
per file.

## The contract is a test, not a prompt

Every fan-out pass writes to a shape that something already enforces:
`npm run validate`, `npm run floor`, `scripts/test-calendar.mjs`,
`scripts/test-jurisdictions.mjs`. This matters more with agents than with
people, because a prompt is advice and a failing test is not, and because ten
agents reading the same prose will produce ten readings of it.

Where a pass needs a shape nothing enforces yet, **write the guard first**. The
deadline migration is the worked example: the model and its guard landed before
any of the four migration agents started, so "did it work" was a command rather
than a judgement, and each agent could verify itself without waiting.

## Two agents must not build at the same time

`src/build.mjs` clears `dist/` and rewrites it. Two builds racing produce
`ENOTEMPTY: directory not empty, rmdir dist/assets/img/places` and
`ENOENT: dist/assets/css/motion.css`, and `scripts/check.mjs` reports
`data.json: missing or unparseable` — three different errors, none of which
names the cause, and all of which look like a real fault in whatever you last
changed. The tell is that they move: a second run fails somewhere else.

It cost a style pass half an hour of chasing a data collision that was really
a second agent's `node src/build.mjs`. When a verification fails in a way that
does not reproduce, check for another agent before believing it.

## Say what the *hard* record is

An agent given eight records will do the first well and the last quickly. Name
the one that is genuinely difficult and say why it is difficult — the entry
holding six events in one sentence, the country whose two official pages
disagree — and the attention goes where the value is.

## Ask for the refusals

The most useful thing a research agent produces is the list of what it could
not establish and what it would take to establish it. Ask for it explicitly, or
you get a report about what was found and a silent implication that the rest
does not exist.
