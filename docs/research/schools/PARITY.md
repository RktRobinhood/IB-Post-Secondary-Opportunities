# School-page parity contract

Issue #56 asked why institution and programme pages do not always look like the
Danish examples. The page renderer is shared across countries; the meaningful
variation comes from the research state and from what an institution actually
offers. This document separates those intentional variants from gaps that
belong in the improvement queue.

## The invariant

Every institution page uses the same shell: breadcrumb and hero, at-a-glance
facts, dates beside the study options, evidence and notes, a targeted hand-off,
and previous/next navigation. A school photograph uses the hero slot when a
publishable one exists; otherwise the designed panel hero is the honest
fallback. Country is not a styling input.

For a listed programme, every card uses the same component and opens an
on-site programme page. Field colour, card count, family/path rows, deadlines,
fees and photographs vary with recorded facts, not with country.

## Intentional variants

| Research state | What the student should see | Why it differs |
|---|---|---|
| `listed` | One card per programme or programme family, with on-site programme pages | The institution has a bounded set of English-taught bachelor's degrees that can be listed completely. |
| `catalogue` | A concise catalogue hand-off, course count when verified, and directional information | Nearly everything is taught in English; reproducing hundreds of courses would be noisy and quickly stale. Flagships and faculties are a separate enrichment layer. |
| `none` | A clear local-language message and the useful route for a student who has that language | Research confirmed that there is no English-taught bachelor's option for the intake. An empty card grid would imply missing data. |
| no school record | The older country-profile answer, explicitly labelled “not listed here yet” | This is unfinished research, not an alternative finished design. It should disappear as country batches land. |

A programme family is also intentional: several campuses, credentials or
specialisations can share one card when the application choice is one degree
with paths. Separate cards remain separate when the student applies to them as
different programmes.

## Accidental drift

These are queueable gaps, regardless of country:

- an institution has no school record;
- a `listed` record is incomplete or its programme list is not known to be
  exhaustive;
- a listed programme lacks `about` or `selection`, so its page cannot explain
  what it is and how places are allocated;
- a programme lacks its own suitable photograph and falls back to the school
  image (acceptable temporarily, but still an asset gap);
- an institution has no publishable photograph and therefore uses the panel
  hero (an intentional fallback, but an asset gap unless no suitable image can
  be verified);
- a `catalogue` record lacks the planned flagship/faculty enrichment;
- deadlines, requirements, links, or images are stale, unverified, broken, or
  inconsistent with the current intake;
- prose, metadata or family grouping violates the shared schemas and card
  rules.

Do not “fix” drift with country-specific markup or CSS. Fix the source record,
asset, shared component, or schema rule that produced it.

## What “Danish-standard” means

It is a release outcome, not one coverage number. Assess its layers separately:

1. **Research coverage:** the institution has a reviewed school record and the
   correct scope.
2. **Programme detail:** each listed programme has at least `about` and
   `selection`; requirements, dates, places and cut-offs are added when the
   official sources publish them.
3. **Visual coverage:** the institution has a publishable image, and priority
   programmes have their own relevant image rather than the school fallback.
4. **Interaction parity:** the shared page and card components render the same
   facts in the same hierarchy at phone and desktop widths.
5. **Evidence quality:** official sources, retrieval dates and intake caveats
   let a counsellor see what is known and what is provisional.

The coverage report must therefore keep programme detail, programme photos,
school photos and missing records as separate columns. None alone may be
labelled “the Danish standard.”

## Queue order

Choose work in this order unless a student deadline makes another batch more
urgent:

1. finish already-started country research without mixing it into unrelated
   releases;
2. add low-friction, licence-safe school images where the visible fallback can
   be removed quickly;
3. enrich and photograph countries whose listed programmes are already
   complete and detailed;
4. complete programme detail before spending heavily on programme images;
5. build catalogue flagships/faculties as their own product slice;
6. leave a designed empty state when no suitable, attributable image exists.

Every release should be a small, reviewable commit on `main` (or a short-lived
branch merged immediately), with focused checks first and the full release gate
before push.
