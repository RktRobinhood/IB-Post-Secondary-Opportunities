# Experience principles

## Joy with consequence

The experience should feel generous, editorial, and full of discovery. Beauty is not a skin added after the filtering tool; it is how the product gives students confidence to explore unfamiliar places. At the same time, visual excitement must not blur deadlines, costs, requirements, or uncertainty.

## The world window

Use a wide, cropped view of the earth or map as a recurring stage. It may curve, pan, rotate slightly, or zoom into regions, but it should not default to a small complete globe surrounded by dead space.

The map and results must share one state:

- changing a filter updates visible locations and their intensity;
- selecting a location filters or highlights the corresponding results;
- opening an Opportunity moves toward its country, city, or campus when coordinates are reliable;
- clearing filters restores the broader world with a satisfying, calm transition;
- result counts remain available without requiring pointer interaction.

Location lights can communicate availability, clustering, or current filter relevance. They must not imply prestige. Use size, colour, and motion consistently and provide a legend whenever meaning is encoded visually.

## Motion language

Motion should explain one of four things: geographic movement, a change in the filtered set, progression from overview to detail, or a completed student action. Avoid perpetual motion that competes with reading.

- Prefer slow camera easing, staggered lights, route traces, and gentle reveals over bouncy interface animation.
- Keep text and controls stable while the geographic layer moves.
- Provide an equivalent static composition under `prefers-reduced-motion`.
- Provide an in-product reduce-motion control in addition to respecting the operating-system preference.
- Never make eligibility, deadlines, or source links depend on animation completion.
- Test on modest mobile hardware; visual ambition cannot make the core tool feel sluggish.

## Editorial, not institutional

Aim for the warmth and pacing of an illustrated book site: expressive typography, strong colour fields, surprising compositions, purposeful white space, tactile maps, and small moments of wit. Avoid the default visual language of university directories: dense tables, endless cards, pale-blue corporate panels, and interchangeable campus stock photography.

Detailed information still needs structure. Use progressive disclosure: a vivid overview first, a concise fit explanation second, and dense evidence or comparison detail when the student asks for it.

## The two ways through

Every important task needs both:

- **Visual exploration:** map, motion, place, relationships, serendipity.
- **Precise exploration:** search, filters, sortable results, comparison, and direct links.

Neither is a fallback. They are synchronized ways of seeing the same Opportunities.

Treat these as two modes over one URL-serializable query state:

- **Discover mode:** editorial atlas, broad questions, curated journeys, geographic movement, and serendipity.
- **Decide mode:** stable filters, results, comparisons, requirement explanations, financial scenarios, and dated Evidence.

A student can switch modes without losing filters, selected Opportunities, comparison choices, or the route back from a detail view.

## Honest eligibility language

Use these outcomes consistently:

- **Meets published requirements:** all encoded mandatory requirements are met for the selected Intake.
- **Possible with action:** one or more requirements can plausibly be completed before the deadline.
- **Does not currently meet:** at least one mandatory requirement is not met and no supported preparation path is recorded.
- **Needs review:** the data is missing, stale, conditional, or too nuanced to calculate safely.

Never label an Opportunity “safe,” “guaranteed,” or “likely” unless a future, separately validated selection model can support that claim.

## Accessibility and resilience

- The list and filtering controls work without the map.
- Map markers and controls are keyboard reachable and screen-reader named.
- Colour is never the sole signal.
- Important content survives blocked third-party scripts, images, and fonts.
- Controls remain usable at 200% zoom and on narrow screens.
- Focus movement follows the student's action when the map or details change.

## Performance contract

The useful opening must render before the spectacular opening. Show the heading, broad filters, result count, and a static or lightweight world view first; enhance with WebGL only when supported and ready.

- Search, filters, results, comparison, and Evidence remain usable without WebGL.
- Dense points cluster at broad zooms; the semantic list, not DOM markers, remains the interaction source of truth.
- Programme details, logos, and photography load on demand with reserved dimensions.
- Measure map-ready time, first filter response, map/list synchronization, and detail-panel readiness separately from general page metrics.
- Set and test budgets on a mid-range phone and constrained connection before visual polish expands.

