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

## What is possible before what is required

A student opening a page is deciding whether this place is worth any effort at all. What decides that is something concrete and appealing — a named university, in a city they can picture, teaching something they want. So every page that describes a place leads with what a student could do there, and only then with what it will take.

On a Destination page that means, in this order:

1. **The place** — the hero.
2. **How far to trust the page** — one line: the research depth in counts, with its explanation and the freshness note one tap beneath. It comes before the list because learning afterwards that a list was a sketch is being misled; it is one line because it is not the point.
3. **Where to study** — the institutions, each with its city, one sentence, and a link to its own site.
4. **The questions** — the system, how the IB is read, applying, deadlines, money, language, living — each as a heading and a short answer, with the full researched prose in a native `<details>` beneath it.
5. **Sources** — last, and closed.

**Short answers are the deliverable; the long form is what they point at.** A short answer is taken from the record — its summary, or the first sentence of the field — and never written fresh in the template. Nothing is deleted to make a page short: the depth is relocated behind a disclosure and reachable in one action. Disclosure summaries are controls and take their minimum size from the touch policy like every other control.

### Every page, not only Destinations

The same order holds everywhere: a picture or a list of ways in first, one sentence of copy per block, and the rules one tap beneath. As rebuilt in September 2026:

| Page | Opens with | Then |
|---|---|---|
| Home | Photo hero, then three equal doors — Denmark, Europe, Worldwide | A reel of named universities; "What do you want to study?"; the tools, one line each |
| Denmark | Photo hero, four facts, the universities | "How it works" as short answers |
| Europe / Worldwide | Photo tiles per country, by region | The map; compare |
| University | Photo hero, a glance band, the degrees | What it tells IB students, notes, sources — short answers |
| Programme | Photo hero with one sentence, a glance band, required subjects as chips | The fine print, what it is, deadlines — short answers |
| Preparing | A board: decides / weighed / changes nothing | Each action, reasoning behind "Why" |
| Deadlines | The dated list, one line per date | Details, undated dates and closed routes behind a tap |
| Guides | The options | Sections as short answers |

**Denmark is one of three doors, not the front page.** Most readers are at a Danish school and will look at Denmark anyway. What the home page exists to show them is how much else is open. Denmark goes first and at equal weight; it does not get its own map, its own chapter, or its own copy on the home page.

A hero lede is one sentence. Where a record's summary is longer, the hero takes its first sentence (`firstSentence`) and the page carries the rest.

### The budget

Measured at 375px on the rebuilt pages, and enforced by `scripts/test-page-budget.mjs` in the gate's built stage. "Default view" means the words inside `<main>` a reader sees without opening anything — a closed `<details>` counts its summary line only — less navigation, scripts and SVG (`scripts/lib/page-measure.mjs`).

| | Budget | Measured when set |
|---|---|---|
| Words before "Where to study" | **120** | 28–45 |
| Words of reading after the institutions | **650** | 307–488 |
| Words in one topic's default view | **90** | at most 64 |
| Words in the whole default view | **1,500** | 616–1,298 (was 2,849–9,580) |
| Institutions before every topic, sources last and closed | **always** | — |

At 375×812 that puts "Where to study" at about one screen (801px, under a 568px hero) and the first institution inside about 1.6 screens, on every Destination. Germany went from 52 phone screens to 14.5, Canada from 83 to 16.6.

The whole-view ceiling is the loose one on purpose: most of it is the institution list, which is the part of the page that is meant to be there, and it grows with the number of institutions. The number to defend is the reading after them. When a page breaches the budget, the fix is a shorter short answer or a new disclosure — not a higher number.

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

