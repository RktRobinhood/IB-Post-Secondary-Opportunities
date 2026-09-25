# Top navigation audit

Measured on the live site (https://rktrobinhood.github.io/IB-Post-Secondary-Opportunities/), 25 September 2026.
Every page in the sitemap (149) was loaded in headless Chrome at 375×812 and at 1440×900. "Screens" means the page height divided by the viewport height. Word counts use `scripts/lib/page-measure.mjs`, the same measure the gate uses. Screenshots are in [`before/`](before/) and the comparable-site research is in [`comparables.md`](comparables.md).

## 1. What the menu is today

The masthead shows seven items at 1024px and wider: **Denmark · Europe · Worldwide · Find a degree · Check my subjects · Preparing · Deadlines**. Below 1024px (phones and tablets) the same seven are plain links in a drawer, followed by "About this site" and "For counsellors". The menu is defined in `src/lib/layout.mjs` (`NAV`, and the drawer markup inside `page()`).

| Item | URL | What is actually there | Phone screens | Default words |
|---|---|---|---|---|
| Denmark | `/denmark/` | Photo hero with two buttons (See every degree, Check my subjects). Four facts. 14 institution cards, which run to screen 9.2. "How it works": six short answers. Three sub-pages (apply, money, IB conversion) are not in the menu. | 13.8 | 634 |
| Europe | `/europe/` | Hero. 25 country tiles in 6 regions, running to screen 10. Globe at screen 10.1. "Compare destinations" at the end. **Denmark is not on this page.** | 13.5 | 828 |
| Worldwide | `/world/` | **Same template as Europe** (`countryIndex()` in `src/pages/destinations.mjs`). 10 countries in 5 regions. The H1 says "Beyond Europe". | 7.8 | 398 |
| Find a degree | `/programmes/` | 73 degrees, **Denmark and the Netherlands only**. Map and a list of 21 cities. Five filters and three chips. **A 4,770-word always-open "If you will not hold the full Diploma" note between the filters and the results.** Then 73 cards. | **77.8** (first result at **screen 26.1**) | 5,182 |
| Check my subjects | `/planner/` | Six subject slots, a total, the IB award and fee status. Then **the same 73 programmes in the same `prog-list` cards**, filtered by fit. Empty until two subjects are chosen. | 5.3 | 935 |
| Preparing | `/prepare/` | A board of three columns (Decides / Weighed / Changes nothing), then each action with its "why", then two topics. H1: "What actually counts". | 11.0 | 872 |
| Deadlines | `/timeline/` | "Showing every deadline on the site — 758 in all". 541 dated events, oldest first; **60 of them are already past**, and the first is 1 September 2025. Then 214 undated dates and 3 closed routes behind taps. H1: "The calendar". | **157.8** | 12,607 |

Pages a student can reach but that are not in the menu: `/compare/`, `/universities/` (the Denmark and Netherlands institutions), `/denmark/apply/`, `/denmark/money/`, `/denmark/ib-conversion/`, the two guides, `/faq/`, `/glossary/`.

### One page, four names

Every destination goes by up to four names, depending on where you meet it:

| Menu | Page H1 | Footer | Home toolkit |
|---|---|---|---|
| Worldwide | Beyond Europe | Beyond Europe | — |
| Europe | Europe, country by country | Europe A–Z | — |
| Find a degree | Every English-taught programme | Programme finder | "Or search every degree" |
| Check my subjects | Will my subjects get me in? | Subject checker | Check my subjects |
| Preparing | What actually counts | CAS, the EE and what counts | What counts |
| Deadlines | The calendar | Application calendar | Every deadline |

A student who follows the footer, the home page and then the menu goes to "the same place" by three different labels. Pick one name for each destination and use it on the menu, the H1 eyebrow, the footer, the home page and the `<title>`.

## 2. The overlaps

**a) Three menu items, one axis, two templates.** Denmark, Europe and Worldwide all answer "which country?". Europe and Worldwide are literally one function called with a different list. Denmark sits outside both: it is not a tile on `/europe/`, even though it is in Europe and is on `/compare/`. The only honest difference is that Denmark has a richer template and its own sub-pages.

**b) Find a degree covers only a slice of those countries.** The finder holds the 73 degrees researched to programme depth, all in Denmark and the Netherlands. The Netherlands is also one of 25 tiles on `/europe/`, where it looks like any other country. A student who clicks "Find a degree" hoping for Germany gets nothing, and learns why only from the eyebrow. The layout comment says the chip was removed as clutter, so the scope now appears only in a `title` tooltip that nobody on a phone sees. And `/universities/` repeats the Denmark and Netherlands institution cards from `/denmark/` and `/destinations/nl/`, without appearing in any menu.

**c) Find a degree and Check my subjects are the same list.** Both render the same 73 Opportunities with the same card component (`prog-list`). One filters by field, place and institution; the other by subjects and grades. A student who filters by "Engineering" on one page and then checks their subjects on the other has to start again, because the two pages share no state. The product vision already describes these as one thing: "Filtering starts broad … and can become personal through IB subjects, levels, predicted grades."

**d) Preparing and Deadlines are two halves of "what do I do, and when".** Preparing says *what* matters (subject levels, tests, portfolios) with a timing on each action. Deadlines says *when*. `/denmark/apply/` does both for one country as eight dated steps, and it is the best-shaped planning page on the site. The overlap is mild; each page is worth keeping. The real failure is that neither page knows which countries the student cares about.

**e) The Destination pages' "Deadlines" topic duplicates the calendar.** That is fine, and deliberate: both read the same records. The calendar should be the filtered union of them, not a second encyclopaedia.

## 3. What students come to do, in priority order

These come from the product vision's core journey and the audience note (EU/EEA citizens at a Danish school, about a fifth Danish), and are checked against what comparable sites put first ([comparables](comparables.md)):

1. **See where they could go.** "Is anywhere worth the effort?" Places, pictures, three doors. (Home already does this well.)
2. **Find degrees in something they like.** A field first, then a place. (Home's "What do you want to study?" links straight into the finder.)
3. **Find out whether their subjects qualify.** This is the highest-consequence question on the site, because a subject *level* closes doors years before grades matter. It belongs *on* the degree list, not on a separate page.
4. **Know the next deadline that applies to them.** Some fall before predicted grades exist (UCAS 15 October, Dutch numerus fixus 15 January, Denmark 15 March 12:00 CET).
5. **Understand how one country works.** How to apply, how the IB is read, money, language.
6. **Decide what to do with CAS, the EE, tests and subject choice.** Mostly DP1 students, and mostly read once.
7. **Compare two or three countries.**

Counsellors and parents want 5, 7 and the audit trail. That is a second audience, and like Common App's counsellor band it gets its own quieter link rather than a slot in the student menu.

## 4. Three alternatives

### A. Four task-first items (recommended)

**Countries · Find a degree · Deadlines · What counts**, plus a quieter **For counsellors** link.

- **Pros:** one item per question a student asks (where / what / when / what matters). No two items lead to the same records. Check my subjects becomes a mode of the list it was always filtering. The three doors survive as the opening of Countries, at equal weight, so "Denmark is one of three doors" still holds. Four short labels fit at 1024px without crowding. Close to Bachelorsportal's object nav (Programmes · Universities · Countries) and universityadmissions.se's top-level "Key dates and deadlines".
- **Cons:** Denmark, the most-visited place, goes from 1 click to 2 on desktop. On mobile it stays 1, because the drawer shows the three doors under Countries (see §6). Merging the planner into the finder is real engineering in two scripts that are being edited now. A new `/countries/` URL needs redirects.

### B. Keep the three doors, merge the tools

**Denmark · Europe · Worldwide · Degrees · Plan**

- **Pros:** mirrors the home page's three doors exactly, and keeps Denmark one click away. The smallest change: only the tool items merge (Find a degree + Check my subjects → Degrees; Preparing + Deadlines → Plan).
- **Cons:** keeps two menu items for one template (Europe/Worldwide). "Plan" hides the word "Deadlines", which is what students actually look for (universityadmissions.se puts it at the top level for that reason). The menu still mixes two axes, places and tools, and that mix is what makes it read as overlapping. Five items.

### C. Journey verbs (after Common App)

**Explore · Check · Plan · Apply**

- **Pros:** follows the product vision's journey (open the world → understand fit → plan forward → act at the source). It creates a home for "how to apply", which today is buried in each country page and in `/denmark/apply/`.
- **Cons:** abstract labels need a sentence of explanation each, and a 17-year-old scanning the bar does not know what "Explore" holds. "Apply" implies the site submits applications, which the vision rules out ("planning support, not an application submitted by this product"). It needs a new Apply hub that does not exist yet. "Explore" would fold 36 institution-level countries and 73 programme-level degrees into one bucket, and they are different depths.

## 5. Recommendation: A

| # | Label | URL | One line (used in the drawer and as the page eyebrow) |
|---|---|---|---|
| 1 | **Countries** | `/countries/` (new) | Denmark, Europe and the rest of the world: where the English-taught degrees are. |
| 2 | **Find a degree** | `/programmes/` | Every mapped degree. Filter by subject and place, or add your IB subjects to see what you qualify for. |
| 3 | **Deadlines** | `/timeline/` | The next dates that apply to you, in order. |
| 4 | **What counts** | `/prepare/` | Subjects, grades, CAS, the EE and tests: what decides, what is weighed, what changes nothing. |
| — | For counsellors | `/counsellors/` | Right-aligned beside the theme toggle on desktop, below a rule in the drawer. |

### What each page becomes

- **Countries** (`/countries/`, built from `countryIndex()`): hero → **three doors at equal weight** (Denmark · Europe · Worldwide, each a photo with a count and a line, reusing `doors()` from the home page) → a sticky row of region chips (Denmark · Nordics · Britain & Ireland · Western · Central · Baltics · Southern · North America · Gulf · Asia-Pacific) → all 36 destination tiles grouped by region, **with a Denmark tile first** → the globe → "Compare two or three" (links `/compare/`). The Denmark door links to `/denmark/`, which is unchanged. `/europe/` and `/world/` stop being pages.
- **Find a degree** (`/programmes/`): see `text-walls.md` §2. The planner becomes a **"My subjects" panel** on this page: a button in the filter row opens it, and entering two subjects adds a fit badge to every card and a "Only what I qualify for" chip. The scope moves from a tooltip into the H1 line: "73 degrees in Denmark and the Netherlands, mapped subject by subject. Elsewhere, start from **Countries**." Phase 2 adds tabs **Degrees | Universities** over the same filters (after Bachelorsportal), which absorbs `/universities/`.
- **Deadlines** (`/timeline/`): upcoming only, grouped by month. Scoped to the countries the student has picked, asked as chips at the top the first time. Past dates collapse into one closed disclosure. See `text-walls.md` §3.1.
- **What counts** (`/prepare/`): the board stays as the opening. Phase 2 splits the actions **by IB year** (DP1 / DP2 summer / DP2 autumn), after Common App's per-grade checklists, and links each timed action to its deadline on `/timeline/`.

### What moves or merges

| From | To | Why |
|---|---|---|
| Denmark (menu) | first door on Countries, plus a drawer sub-link | Three equal doors, one axis |
| Europe (menu), `/europe/` | Countries, `#europe` | Same template |
| Worldwide (menu), `/world/` | Countries, `#worldwide` | Same template |
| Check my subjects (menu), `/planner/` | Find a degree, "My subjects" panel (`/programmes/#my-subjects`) | Same 73 records, same cards |
| Preparing (label) | What counts | Matches the H1 and the home toolkit |
| Footer columns | Rename to the menu's four labels; keep Guides and About | One name per destination |
| Home toolkit | "Check my subjects" → `/programmes/#my-subjects`; "Compare countries" stays | Links follow the merge |

### Redirects needed

GitHub Pages cannot send a 301, so each old URL gets a small stub page. It carries `<meta http-equiv="refresh" content="0; url=…">`, a `<link rel="canonical">`, `<meta name="robots" content="noindex">`, and one line of script that replaces the location while **keeping the query string and hash**, so saved planner links like `/planner/?…` keep their state. Stubs stay out of `sitemap.xml`. `scripts/check.mjs` must accept them as valid targets, but internal links should point at the new URL.

| Old | New |
|---|---|
| `/europe/` | `/countries/#europe` |
| `/world/` | `/countries/#worldwide` |
| `/planner/` | `/programmes/#my-subjects` (query preserved) |
| `/universities/` (phase 2 only) | `/programmes/?view=universities` |

`/denmark/…`, `/destinations/…`, `/timeline/` and `/prepare/` keep their URLs.

### Mobile drawer

The menu shows as a drawer below 64rem (1024px), so this covers tablets too.

- A full-height sheet from the right, and a labelled **Menu** button rather than an icon alone (Study in NL, Common App).
- Four large rows, each a label plus its one line from the table above (a drawer can afford one line; a desktop bar cannot).
- Under **Countries**, three inline chips: **Denmark · Europe · Worldwide**. This keeps Denmark one tap away on the device most students use.
- The current page gets `aria-current="page"`. The drawer lacks it today, though the desktop bar has it.
- Below a rule: For counsellors · About · Something wrong?
- Focus moves into the sheet on open and back to the button on close. Escape already closes it (`site.js`), and focus should also stay trapped inside while it is open.
- If the student has saved countries (the Exploration List), one small line: "Your countries: Denmark, Netherlands →", linking to Deadlines scoped to them.

## 6. What was borrowed, and from where

| Pattern | From | Used for |
|---|---|---|
| Menu by object, one noun each | Bachelorsportal (Programmes · Universities · Countries) | Countries / Find a degree |
| Deadlines as their own top-level item, exact dates, time zone stated once | universityadmissions.se ("Key dates and deadlines") | Deadlines stays top-level |
| No prose between filters and first result; count in the heading | Study in NL studyfinder, Common App Explore, universityadmissions.se | Find a degree |
| "?" popover beside a filter, around 35 words, detail on a guide page | Study in NL, universityadmissions.se | Course Results and subject-level explanations |
| One "Filter" button on mobile, opening a full-screen sheet with a sticky live count | Study in NL | Find a degree on phones |
| Deadline status on each result card | universityadmissions.se | Card line "Apply by 15 Mar · 12:00 CET" |
| Preparation split by school year | Common App ("Your path to college") | What counts, phase 2 |
| Audience band separate from the student menu | Common App, UCAS | For counsellors |
| Tabs over one filter state (Programmes · Universities) | Bachelorsportal | Find a degree, phase 2 |
| One descriptive sentence per menu item | Study in NL home | Drawer lines |

What to avoid, from the same research: a national finder that is one text box and a disclaimer (Study in Denmark), long intro prose above search results (DAAD), and vague deadlines ("usually in summer", Bachelorsportal).
