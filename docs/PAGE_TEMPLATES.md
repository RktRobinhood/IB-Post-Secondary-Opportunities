# Page and interaction templates

Templates keep a large site coherent while leaving room for surprise. They define information hierarchy and interaction contracts, not identical page layouts. Each destination can have its own colour, illustration, motion accent, and editorial rhythm within these structures.

The design references and adopt/adapt/avoid notes behind these templates live in [Dynamic site inspiration](research/DYNAMIC_SITE_INSPIRATION.md).

## Shared experience shell

Every exploration surface uses one shared query state for filters, map, list, counts, comparison, and URL. The shell contains:

- a compact product identity and route back to the current exploration;
- the world window or its static equivalent;
- progressive filter controls with active-filter summary and clear-all action;
- live result count announced accessibly;
- map/list/compare view choices that preserve state;
- an Exploration List entry point;
- visible target Intake, profile assumptions, and data freshness.

The shell must remain usable when the map, animation, images, or JavaScript enhancement fails.

## Home: invitation to possibility

**Purpose:** create wonder, explain the promise, and give students an immediate way in.

**Composition:** full-bleed photographs of real universities; one strong sentence; three photographic doors at equal weight — Denmark, Europe, Worldwide (`doors()`); a reel of named universities spread across all three (`reel()`); one question, "What do you want to study?"; and the tools last, one line each (`toolkit()`). A living sample of opportunities rather than generic statistics. Which photograph opens each door is recorded in `data/site-config.json` under `homeDoors`.

**Avoid:** a dashboard of every feature, long institutional copy, or forcing profile entry before exploration.

## Explore: world window plus results

**Purpose:** move fluidly between geographic discovery and precise filtering.

**Composition:** cropped geographic stage; responsive location lights; filter dock; synchronized result stream; clear legends; selected-place story fragment; URL-addressable state.

**Avoid:** encoding prestige as marker size, map-only navigation, or filters that silently exclude unknown data.

## Destination story

**Purpose:** explain how a study system actually works for this student and Intake.

**Required blocks:** honest opening thesis; why consider it; constraints; IB recognition; English-taught reality; application sequence; cost scenarios; residence and housing; student life and support; Opportunity set; sources and freshness.

**Editorial freedom:** local cartography, cultural details, colour, photography, and a distinctive transition into the country.

## Institution portrait

**Purpose:** give an institution identity without allowing brand language to replace programme facts.

**Required blocks:** official identity and locations; institution type and accreditation context; teaching environment; support links; Opportunity list; official sources; media attribution.

**Avoid:** unsourced prestige claims, rankings without methodology, and treating institution-level language claims as programme-level proof.

## Opportunity detail

**Purpose:** support a serious decision about one specific programme, Intake, campus, and language.

**Opening answer:** what it is, where and when it happens, language, credential, duration, and the student's current eligibility outcome.

**Required blocks:** explainable requirements; competitive selection; deadlines; financial scenario; curriculum and learning pattern; placements or special components; support; outcome and recognition context; gaps and Preparation Actions; official application link; evidence drawer.

## Fit explanation

**Purpose:** make every calculated result auditable.

**Composition:** outcome label; assumptions; rules met; actionable gaps; hard blockers; unknown or stale rules; changed-since-last-view notice; source links; “what if?” controls for predicted grades or planned actions.

**Avoid:** admission probability, opaque scores, celebratory language before uncertainty is shown, or treating unknown as met.

## Compare

**Purpose:** support trade-offs without flattening Opportunities into a ranking.

**Composition:** student-selected Opportunities; sticky identity; separate academic, financial, practical, learning, support, future, and preference sections; difference highlighting; missing-data indicators; source dates.

On small screens, compare two at a time or use one dimension at a time rather than shrinking a wide table into illegibility.

## Plan

**Purpose:** turn interest into a sequence of realistic student actions.

**Composition:** Intake timeline; student-controlled milestones; application deadlines; subject and grade goals; test, portfolio, activity, CAS, or EE prompts; evidence explaining why an action matters; status that remains local by default.

Suggestions must be labelled separately from official requirements and selection factors.

## Application-system guide

**Purpose:** explain a shared national, provincial, state, sector, or multi-institution process once and connect it to every Opportunity that uses it.

**Required blocks:** operator and jurisdiction; coverage and exceptions; applicant groups; choice limits and ranking; fees; step-by-step walkthrough; central and supplementary Submission Items; Application Rounds; milestone/deadline timeline; decisions and replies; official links; Evidence and target Intake.

**Avoid:** calling a common portal universal when direct or alternate routes exist, mixing current and previous-cycle dates without warning, or burying Programme-specific supplementary work.

## Apply workspace

**Purpose:** merge a student's selected Opportunities into one explainable Application Plan.

**Composition:** unresolved route assumptions; next actions; shared-system work grouped once; per-Opportunity supplementary steps; dependency-aware journey; official versus personal dates; status controls that remain local by default; print and calendar export.

The workspace must repeatedly distinguish “marked complete here” from “received by the official portal.”

## Application calendar

**Purpose:** reveal collisions, sequencing, and the next consequential milestone without creating deadline anxiety.

**Composition:** agenda/month views; filters by Opportunity, Application System, milestone type, responsibility, and status; icons and text for deadline consequence; stale/provisional warnings; official source links; individual and plan-level `.ics` export.

**Avoid:** invented midnight times, red-countdown overload, silently duplicated shared deadlines, or implying that an exported calendar stays synchronized when it is only a snapshot.

## Guide or editorial story

**Purpose:** teach a cross-cutting topic such as medicine abroad, portfolios, financing, or choosing IB subjects.

**Composition:** strong editorial opening; scannable explanation; interactive example or decision path; relevant Opportunities generated from canonical data; dated sources; next action.

Do not hard-code programme facts into editorial prose when they can be queried from canonical data.

## Evidence drawer

**Purpose:** let a student or counsellor audit a displayed claim without derailing the main journey.

**Required fields:** claim supported; official wording or faithful excerpt; publisher; source link; retrieval date; effective dates or Intake; applicant group; verification state; interpretation notes; conflict warning when applicable.

## Reusable component grammar

Build these as content- and data-driven primitives instead of purchasing or imitating a single animated template:

- `WorldWindow`: geographic overview with a static fallback and explicit active layer;
- `MapChapter`: title, copy, camera bounds, highlighted Opportunity IDs, data layer, media, and motion policy;
- `OpportunityTeaser`: place, field, plain-language fit reason, media policy, and Evidence state;
- `FilterQuestion`: a student-friendly prompt mapped to canonical query fields;
- `FitExplanation`: outcome, matched Requirements, gaps, uncertainty, and changed assumptions;
- `EvidenceBlock`: value, source, source type, Intake, jurisdiction, checked date, and verification state;
- `PreparationPath`: goal, relevance category, timing, and explicit non-guarantee;
- `ComparisonTray`: a deliberately small set of Opportunities with aligned decision dimensions.

Components provide predictable semantics and behavior. Destination-specific art direction supplies visual variety.

## Template acceptance checklist

- The primary student question is answered before decorative detail.
- The next meaningful action is obvious and keyboard reachable.
- Dense evidence is available without dominating the opening view.
- Loading, empty, stale, conflicting, and error states are designed.
- Motion has a narrative or spatial purpose and a reduced-motion equivalent.
- The page works at narrow widths, 200% zoom, and without pointer input.
- Authored content, canonical data, and generated presentation remain separate.
