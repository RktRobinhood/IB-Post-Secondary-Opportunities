# IBA — maintainer critique, round 1

Run: `fe8ee962-a593-4652-8c75-1f7f5fb0c6ea` · 7 November 2026.

Reviewer: Codex, independent maintainer agent `/root/iba_visual_maintainer`.
Scope: one IBA unit and the common delivery-mode seam required to publish its
online first-year BA (Hons) International Business Management accurately.

## Status

**Final: maintainability 8.6/10; shared format 8.4/10 — accepted for the bounded
online BA improvement. Full institution information parity is not accepted.**

Reviewed the final shared patch and actual clean output from snapshot
`cbb6464ac5c2459ebf97c40c2bd977d51579c76d`. The coordinator's final clean release
gate completed exit 0 with all 43 checks passing; its existing freshness advisory
is separate from this unit. The earlier template failure and its repair are
retained below. No outstanding structural blocker remains in this slice.

The initial architectural direction is appropriate. In the code inspected before
the patch, `src/pages/programme.mjs` uses `p.campus || inst.city` both in `Where`
and `plainLine()`. The canonical adapter in `src/lib/canonical.mjs` derives campus
from `Opportunity.place`; omission therefore does not prevent a false “in Kolding”
attendance statement. IBA's actual provider city must remain intact. This is an
observed shared projection defect, not a reason for an IBA renderer or fictitious
Online Place.

An optional explicit `deliveryMode` enum on the canonical Opportunity and legacy
school Programme, projected through a shared helper, is proportionate. Programme
structure prose can hold learning details but cannot safely drive attendance
labels. Omitted-mode compatibility and physical-location preservation for hybrid
study are part of the contract. Existing summary/credential/outcome fields can
name the Leeds Beckett award; this slice does not demonstrate a need for another
award schema field.

Final review must inspect schema/validation, adapters, programme cards and detail,
family path rows, discovery geography and relevant saved/compare projections. An
online label must remain authoritative even when a stale physical place is
present, and no online programme may acquire its provider's attendance pin.

## Working-tree inspection

Read the real shared delivery diff and new `src/lib/delivery.mjs`. The optional
enum is defined once in `common.schema.json` and referenced from both models.
Canonical online projection suppresses even a stale Opportunity place but retains
the provider institution's city. The helper supplies Online/Hybrid labels and
grammar, preserves the existing explicit legacy `city: Online` convention, and
does not parse descriptions. Discovery indexing and planner display use it.
Canonical fixtures cover omitted, on-campus, hybrid and online values, invalid
mode rejection, stale place suppression and preserved institution identity.
The proposed build integration check inspects actual online page Where bands,
finder member city/place and planner location instead of relying on schema tests.

Two related omissions were sent to the implementer before the gate: legacy
`schoolPathsTable()` still used `m.city || inst.city`, and native/legacy family
headings could count the Online display label as a physical campus. These must
be corrected before accepting the advertised common projection. Their presence
does not justify institution-specific exceptions.

Reinspected the corrections: both native and legacy path tables use the common
location projection, use a Where column for remote/hybrid paths, and avoid
counting them as physical campuses in the heading. Card path counts are also
neutral for such families. A canonical mixed-online/campus family fixture checks
the rendered table and card language. `docs/PAGE_TEMPLATES.md` records the sourced
model gap, additive version-compatible field and common consumer contract.

The coordinator reported a first clean gate failing the university `#ib` contract.
The repair is a shared institution-adapter fallback to actual programme-level
mandatory prior-education `openQuestion` text, with the programme named and linked,
only where no institution IB statement or notes exist. I inspected the code: it
does not create a threshold or imply an institution-wide recognition policy.
It is an honest unanswered qualification question in the existing IB slot.

I also inspected the common requirements-text correction identified by the
admissions critic. The adapter preserves whether the first recorded text is
explicitly `official: true`; the shared programme page labels all other text
Requirements summary. True, false and omitted are covered by a projection fixture,
and built pages are checked for the summary label. This removes a misleading
quotation claim without introducing a private programme layout.

## Final output and acceptance

Independently read the exact release HTML/JSON under
`D:/ibp-tmp/absalon-release-20261030/dist`, without rebuilding it:

- The IBA programme Where band says **Online**; credential names the Leeds Beckett
  award, and start/deadline/language appear in the existing facts band.
- Its discovery member has `c: Online` and empty `p`; its planner record has
  `deliveryMode: online` and `display.campus: Online`.
- The institution retains Kolding, has its real `#ib` topic and says to confirm
  how the qualification is assessed. This is provider identity rather than an
  attendance claim for the degree.
- Programme HTML includes **Requirements summary** and does not label its
  paraphrase “In the institution's own words”.

Opened all twelve final university/programme/official-credit screenshots at
desktop 1280px and phone 390px in both themes, including explicit original-detail
inspection. The paired [visual report](dk-international-business-academy-iba-visual-round-1.md)
records their exact paths and the source-image review. The shared template renders
the actual attendance/award distinction clearly on a phone as well as desktop.

The score reflects a narrow, reusable data seam, preservation of existing
omitted-mode presentation, no country/provider-specific rendering branch, named
common helpers and regression coverage of the failure rather than an IBA string
fixture. Next year's source updates can change records without reading layout
code. Qualification and language questions remain questions, with provenance.

The most useful future improvements are data and parity work: resolve the IB
qualification/language conflicts, complete the other first-year portfolio leads,
and bring fuller curriculum/support answers through the same shared contract.
These do not overturn safe publication of the supported online BA slice.

The separate admissions critic accepts that slice at **8.3/10** but scores full
institution public information parity **6.4/10**, deferred to **15 January 2027**.
This maintainer acceptance does not turn a one-programme improvement into an
exhaustive IBA catalogue or complete institution parity.

## Review basis

Read `docs/QA_CRITIC_LOOP.md`, `docs/adr/0008-shared-templates-define-information-quality.md`,
`docs/PAGE_TEMPLATES.md`, root `CONTEXT.md`, and `docs/IMAGE_STANDARD.md`; inspected
the actual pre-patch canonical and legacy adapters and projection consumers.
The institution's broader portfolio and information parity remain separate from
acceptance of this bounded online BA slice.
