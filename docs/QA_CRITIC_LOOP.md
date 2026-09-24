# The critic loop

How work that changes what a student sees is accepted. **Read this when you
coordinate a workflow or a pass** — an aesthetic pass, a batch of research, a
redesign, a photo round. An agent doing one scoped task inside such a workflow
does not run the loop itself; the coordinator runs it on the result.

Adopted by the site owner on 24 September 2026, after several passes were
declared finished that did not meet the brief.

## The rule

1. **A separate agent critiques the work.** It is not the agent that did the
   work, and it is given a *role*, not a checklist: a named critic whose
   standards are the brief (below). It looks at the real artefacts —
   screenshots at desktop and phone width, contact sheets, the diff, the
   report — not a summary of them.
2. **It gives a score from 0 to 10**, with its reasons and the few changes that
   would raise the score most.
   - **8 or above: accepted.** Commit it.
   - **7: not yet.** Below 7: not an acceptable standard.
3. **Below 8, iterate and critique again.** Fix what the critic named, then give
   the new state to a critic again (a fresh one is better than the same one,
   so the score is not anchored).
4. **At most five rounds.** If the fifth critique is still below 8, stop:
   - file a GitHub issue titled for the problem, with every round's score and
     reasons, what was tried, and the screenshots;
   - commit the evidence under `docs/research/qa/<topic>/` (round-by-round
     `round-N.md` and the images it cites);
   - leave the work in its best state if that state is better than what was
     there before, or revert it if not, and say which in the issue;
   - move on to something else. A later build loop picks the issue up.

## Roles

Pick the critic that matches the work. More than one may be needed, and the
work passes only when each scores 8 or above.

| Work | Critic |
|---|---|
| Home page, country or programme pages, any visual change | **Art director** — for a student-facing site that must feel like a place worth going: photographs first, one line of copy per block, nothing that reads like homework. Rates the phone view as seriously as the desktop one. |
| Photographs | **Photo editor** — is it the right place, is it beautiful, would a 17-year-old stop scrolling for it; no logos, maps, events, car parks. |
| Research and data | **Admissions counsellor** — would I repeat this to a student in a meeting? Checks a sample against the cited official pages; one wrong deadline fails the round. |
| Copy | **Editor** — short, concrete, true; no hedging paragraphs, no jargon a student would not know. |
| The globe, or any camera motion | **Art director** as above, plus a **motion critic** — does it feel like holding a world (drag, spin, fly, the dive through the clouds), does it stay readable while it moves, and does reduced motion still arrive everywhere? Judges `docs/research/qa/globe/shoot.mjs` output, which renders mid-flight frames deterministically, at desktop and phone width and in both themes. |
| Code and structure | **Maintainer** — could the owner make next year's update without reading this code? Modular, named for what it holds, no country branches, tests that fail when it breaks. |

## The brief every critic is given

- Possibilities before requirements: a picture or a list of places first, then
  one-line answers, and the detail one tap down (`docs/EXPERIENCE_PRINCIPLES.md`).
- Denmark is prominent but one of three doors — Denmark, Europe, Worldwide.
- Nothing invented. A gap is marked as a gap; a source is cited.
- It must work on a phone.

## A critic prompt that works

> You are the *art director* for IB Pathways, a site that shows IB students the
> universities open to them. [The brief above.] Here is what changed and why:
> [one paragraph]. Look at these screenshots [paths] at desktop and phone
> width. Score it 0–10 against the brief: 8 means you would ship it to students
> today. Give the score first, then the three changes that would raise it most,
> each specific enough to act on. Do not soften the score.

Record every round — score, reasons, screenshots — in the repository as it
happens, per `docs/PARALLEL_WORK.md`: a critique that lives only in a session
is lost with it.
