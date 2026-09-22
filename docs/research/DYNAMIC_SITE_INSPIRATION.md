# Dynamic site inspiration

## Recommendation in one sentence

Build an **editorial atlas with a decision workspace**, not a globe-themed database: a cinematic, cropped world window creates the emotional invitation, while a synchronized, fully accessible list and evidence panel handle serious filtering and admissions decisions.

This direction borrows interaction principles, not branding, illustration styles, page layouts, or signature motifs. None of the references below should become a visual template to copy.

## Reference sites

### 1. Seth Ring — a story world before a catalogue

**Live site:** [sethring.com](https://sethring.com/)

The opening is a full-bleed illustration with minimal navigation. Scrolling produces decisive, chapter-like scene changes: hero art gives way to an editorial split composition, then a dark icon-led series selector and another large visual invitation. The site makes the catalogue feel like entry into a world rather than inventory.

- **Adopt:** emotional arrival; strong art direction; large scene changes; a recurring visual language; one obvious invitation per scene.
- **Adapt:** make the opening world window useful immediately by showing real opportunity locations and a visible result count. Let each scroll chapter introduce one question—where, what, can I qualify, how do I prepare—rather than one book series.
- **Avoid:** copying its fantasy motifs, circular ornament, type treatment, or compositions; placing important admissions text over busy art; forcing a long cinematic prelude before search; relying on pointer hover or low-contrast decorative text.

### 2. Google Earth and Voyager — place as narrative material

**Live product:** [Google Earth](https://earth.google.com/web/)  
**First-party overview:** [Google Earth: create stories and maps](https://earth.google.com/)

Earth pairs free exploration with guided Voyager stories. It treats a placemark as more than a coordinate: a place can carry a saved camera view, text, photography, video, and a presentation sequence. Its strongest lesson is that spatial exploration and authored narrative can coexist.

- **Adopt:** a location can be both an explorable map target and an editorial chapter; curated journeys can help a student who does not yet know what to search for.
- **Adapt:** use a cropped “world window,” restrained pitch, and short point-to-point transitions instead of reproducing a photorealistic planet. A programme selection should move the camera only when that movement adds orientation.
- **Avoid:** a separate creation tool, satellite-detail arms race, deep 3D controls, or unexplained camera movement. The product is about opportunities, not mastery of a globe UI.

### 3. NASA Eyes on the Earth — wonder anchored by legible layers

**Live site:** [NASA Eyes on the Earth](https://eyes.nasa.gov/apps/earth/)

NASA presents a dramatic 3D Earth but anchors it with named layers and specific, observable data such as sea level, temperature, ozone, precipitation, and satellites. The visual spectacle has a clear answer to “what am I looking at?”

- **Adopt:** use a small number of meaningful visual layers, always paired with a legend and plain-language state; allow a layer to change what the world means rather than merely recolour it.
- **Adapt:** layers here should be student questions—English-taught availability, current fit, affordability, deadlines, or preparation needs. The active layer and filter summary should remain visible beside the map.
- **Avoid:** ambient rotation, dense simulation controls, or effects that suggest scientific precision the admissions data does not have. Lights must encode availability or fit, never prestige.

### 4. Mapbox scrollytelling demo — a reusable camera-and-chapter grammar

**Live example:** [Mapbox Scrollytelling](https://docs.mapbox.com/resources/demos-and-projects/scrollytelling/)  
**Implementation example:** [Fly to a location based on scroll position](https://docs.mapbox.com/mapbox-gl-js/example/scroll-fly-to/)

The official pattern keeps the map stable while text chapters enter the reading column; the visible chapter triggers a defined camera target and layer state. This is a useful interaction grammar because content, location, and transition are configured rather than hard-coded into one page.

- **Adopt:** chapter objects with title, copy, camera bounds, active data layer, highlighted opportunities, and optional media; explicit active-chapter state.
- **Adapt:** reserve scroll-driven camera moves for onboarding and curated journeys. In the main explorer, direct filter and selection actions—not passive scrolling—should control the camera.
- **Avoid:** scroll hijacking, long flights, narrative text that disappears before it can be read, and a layout in which the map consumes the only usable space on a phone.

### 5. The Pudding’s Human Terrain — data made tactile and memorable

**Live site:** [Human Terrain](https://pudding.cool/2018/10/city_3d/)

Human Terrain turns population density into a three-dimensional landscape, then offers a small set of high-value controls: compare years, show change, fly to a named city, and move through a bounded sequence. It also publishes caveats about source quality and processing.

- **Adopt:** one memorable visual metaphor; named destinations; guided “next” steps; nearby controls; visible methodology and caveats.
- **Adapt:** use light intensity, clustering, or terrain-like density only where the encoding is truthful. A “fly to Copenhagen” action could expose a region story and matched programmes without hiding the exact result list.
- **Avoid:** making comparison depend on 3D perception; using height, glow, or size ambiguously; loading all visual detail before the student can begin; treating a beautiful graphic as sufficient evidence.

### 6. Climate TRACE Explore — one state shared by map, summary, and list

**Live site:** [Climate TRACE Explore](https://www.climatetrace.org/explore)

Climate TRACE coordinates a huge geographic dataset with a search field, sector/year/unit controls, a summary, and a ranked list. The map is not an isolated visualization: every surface describes the same current selection.

- **Adopt:** one canonical query state shared by URL, filters, map, totals, list, and detail panel; visible scope and result count; summaries that update with the current selection.
- **Adapt:** replace ranking with neutral groupings such as country, field, fit state, intake, and cost. Make every active constraint removable and every “no results” state explain which constraint caused it.
- **Avoid:** visual rankings that imply university quality; silently changing units or populations; presenting an enormous initial dataset before a student understands the controls.

### 7. Data USA — automated profiles with progressive disclosure

**Live site:** [Data USA](https://datausa.io/)  
**Relevant profile example:** [University of the People profile](https://datausa.io/profile/university/university-of-the-people)

Data USA turns structured public data into repeatable entity profiles. It opens with a small identity-and-key-metrics summary, then uses a section index and progressively deeper charts, comparisons, explanations, and underlying-data actions.

- **Adopt:** schema-driven programme profiles; key facts first; stable section navigation; chart explanations; a path from summary to evidence; consistent comparison slots.
- **Adapt:** generate opportunity pages from structured records but give admissions requirements priority over decorative statistics. Put “why this matches,” uncertainty, source, and “as of” date near the top.
- **Avoid:** very long chart walls, unexplained metrics, and an institution-level fact standing in for a programme-and-intake requirement.

### 8. UNESCO World Heritage interactive map — useful filter breadth and a warning

**Live site:** [UNESCO World Heritage Interactive Map](https://whc.unesco.org/en/interactive-map/)

UNESCO exposes a large, authoritative collection through search and facets for property, country, region, status, keywords, dates, themes, and criteria. Its controls include explicit keyboard instructions for multi-select fields. It also demonstrates how quickly a map can become a specialist GIS cockpit.

- **Adopt:** faceted filtering from authoritative records; clear multi-select behaviour; a textual list equivalent; filters based on actual user questions.
- **Adapt:** stage complexity. Start with four or five high-value filters, place the rest under “More filters,” and show saved/active criteria as removable chips with human-readable labels.
- **Avoid:** an always-open wall of controls, expert GIS vocabulary, and filtering that requires the map to understand the result.

## The combined product pattern

### Two synchronized modes, one query state

The best synthesis is not a single elaborate home page. It is two views over the same state:

1. **Discover mode** — cropped world window, inviting editorial prompt, illuminated clusters, curated journeys, and a compact set of broad filters.
2. **Decide mode** — stable filter rail, sortable result list, comparison tray, requirement-by-requirement fit, and dated primary sources.

A student can move between them without losing filters, selected opportunities, scroll context, or comparison choices. Selecting a marker highlights the matching list item; focusing a list item highlights the marker; opening a detail view preserves the way back. The URL should serialize the meaningful query state so counsellors and students can share a view.

### Suggested editorial rhythm

1. **Invitation:** “Where could your IB take you?” plus the living world window and an immediate search escape hatch.
2. **First choice:** one friendly question, such as field of interest or destination openness.
3. **World response:** lights and count change together; a short sentence explains the new scope.
4. **Possibility cards:** three contrasting, evidence-backed opportunities—not a prestige ranking.
5. **Personal fit:** optional IB profile progressively reveals subject, level, grade, language, portfolio, and other constraints.
6. **Preparation:** actionable gaps link to subject planning, CAS/extracurricular evidence, tests, portfolio work, or possible EE directions, clearly labelled as required, selection-relevant, or exploratory.
7. **Decision:** compare, save locally, and leave through official programme/application sources.

### A template system worth building

Do not buy or imitate a single animated-site template. Build a small content-driven grammar that can scale with the dataset:

- `WorldWindow` — visual overview with static fallback;
- `MapChapter` — copy, camera target, highlighted IDs, layer, and motion policy;
- `OpportunityTeaser` — image/logo policy, place, field, fit reason, evidence state;
- `FilterQuestion` — plain-language prompt mapped to canonical query fields;
- `FitExplanation` — outcome plus requirement-level reasons and uncertainty;
- `EvidenceBlock` — value, source URL, source type, intake, jurisdiction, checked date, and reviewer state;
- `PreparationPath` — goal, relevance category, timing, and explicit non-guarantee;
- `ComparisonTray` — a small, fixed maximum of opportunities with aligned fields.

This creates visual variety from authored content and data while preserving accessible semantics and predictable behaviour.

## Motion and accessibility contract

Motion is allowed only when it explains geography, a changed result set, overview-to-detail progression, or completion. The no-motion experience is a first-class composition, not the same animation played faster.

- Honour `prefers-reduced-motion` by default and provide an in-product “Reduce motion” control. W3C guidance specifically calls for suppressing non-essential interaction-triggered motion and notes that large parallax and zoom effects can cause vestibular harm: [Understanding WCAG 2.3.3](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions) and [Technique C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39).
- In reduced-motion mode, replace flights with an immediate camera change plus a short opacity transition; stop ambient rotation and particle travel; retain selection, highlight, and focus changes.
- Pause or stop any automatic movement lasting more than five seconds, following [WCAG 2.2.2](https://www.w3.org/TR/WCAG22/#pause-stop-hide).
- Keep search, filters, results, comparison, and all evidence usable without WebGL. Canvas is an enhancement; the semantic list is the source of interaction truth.
- Provide keyboard map controls only when the map has focus, a visible “Skip map” link, named markers, announced result counts, persistent focus indicators, and non-colour status cues.
- Do not let page scrolling unexpectedly zoom the map. Mapbox supports disabling `scrollZoom` while retaining deliberate controls: [Mapbox gesture options](https://docs.mapbox.com/mapbox-gl-js/guides/user-interactions/gestures/).

## Performance contract

The visual opening should never block the useful opening.

- Render the heading, broad filters, result count, and a static world image or lightweight vector silhouette first; hydrate WebGL afterward and only when supported.
- Load programme detail, logos, and photography on demand. Use responsive images, reserved dimensions, and locally controlled placeholders.
- Cluster dense points at broad zooms. Do not create one DOM marker per opportunity at scale; use a WebGL symbol/circle layer and expose the same records in the semantic list.
- Keep static geography separate from rapidly changing selection/highlight state. Mapbox recommends vector tiles for large stable datasets and a small separate source or feature state for frequent updates: [Map performance guidance](https://docs.mapbox.com/help/troubleshooting/mapbox-gl-js-performance/) and [large GeoJSON guidance](https://docs.mapbox.com/help/troubleshooting/working-with-large-geojson-data/).
- Define budgets before polishing: useful text and controls on a mid-range phone before the globe; no long main-thread task caused by initial map setup; camera and filter response should feel immediate; the experience must remain usable under slow data and failed image/font requests.
- Instrument Web Vitals and map-specific timings separately: map-ready, first filter response, marker-to-list synchronization, and detail-panel ready.

## What to prototype first

Prototype one vertical slice before committing to a globe engine:

1. A cropped world window containing 40–100 sample opportunities in three regions.
2. A semantic results list using the same records.
3. Three filters—field, language, and current IB fit—that update map, count, and list atomically.
4. Marker/list bidirectional focus and one opportunity detail panel with evidence.
5. Three motion modes: normal, OS-driven reduced motion, and no WebGL.
6. Mobile and keyboard layouts from the start.

The prototype decision is not “does the globe look impressive?” It is “does geographic motion help a student discover and understand a credible option faster than a static map, without weakening accessibility, evidence, or performance?”

## Decision summary

- Use **Seth Ring** for emotional ambition and editorial scene changes.
- Use **Google Earth, NASA Eyes, and The Pudding** for spatial wonder, layers, and guided discovery.
- Use **Mapbox’s chapter pattern** as a configurable interaction grammar, not as the whole application.
- Use **Climate TRACE and Data USA** for shared state, repeatable profiles, and progressive disclosure.
- Use **UNESCO** as both a source of good facet ideas and a reminder to stage complexity.
- Keep the serious admissions experience text-first, source-first, and fully functional without the animated world.
