# Text walls: where the site dumps instead of answering

Live site, 25 September 2026, all 149 pages in the sitemap. Screenshots of the worst pages (desktop and phone, the first screen and the full page) are in [`before/`](before/).

**The rule applied throughout:** one intro line per block, details on demand, and every paragraph has to earn its place by changing what a student does. A paragraph that is true, sourced and careful still fails the rule if a student reads it and does nothing differently. That is the failure the product vision already names: "every individual sentence defensible … and the sum a wall of text."

## 1. How the pages were measured

| Measure | How |
|---|---|
| Phone / desktop screens | Rendered page height ÷ viewport, in headless Chrome at 375×812 and 1440×900. |
| Words above the phone fold | Visible text nodes inside `<main>` whose top edge is above 812px. |
| Default-view words | `scripts/lib/page-measure.mjs` `defaultView()`: `<main>` with closed `<details>` bodies, nav, SVG and scripts removed. The same number the page-budget guard uses. |
| Total words | Everything in `<main>`, including closed disclosures. |
| Longest prose run | The most words in consecutive paragraphs, with headings allowed between them, before a picture, control, card, table or disclosure breaks the run. Measured in the rendered page. |
| Long paragraphs | `<p>`, `<li>` or `<dd>` of 15 or more words, visible by default. |
| Boilerplate | Sentences of 8 or more words that appear word for word on 5 or more pages; the figure is how many such words a page carries. |
| Duplicate words | Words in paragraphs repeated word for word *within* the same page. |
| Score | 0.5 × rendered words + 2 × longest run + 20 × long paragraphs + 0.3 × boilerplate + duplicates. A rough ranking, not a metric to defend; the columns are what matter. |

The measuring scripts are in [`tools/`](tools/): `cdp.mjs` with `measure-in-page.js` for the rendered numbers and screenshots, `static-measure.mjs` for default view, boilerplate and duplicates, and `text-wall-probe.mjs`, the prototype of the proposed guard.

### Summary by page family

| Family | Pages | Phone screens | Default words | Total words | Boilerplate words each | Verdict |
|---|---|---|---|---|---|---|
| Find a degree | 1 | **77.8** | 5,182 | 5,182 | 807 | Worst page on the site |
| Deadlines | 1 | **157.8** | 12,607 | 62,081 | 789 | A list wall, not a prose wall |
| Denmark sub-pages | 3 | 8.6–48.3 | 740–2,027 | 740–2,243 | 11–23 | Never rebuilt after #37 |
| Trust, counsellors, about, credits | 4 | 6.3–263.7 | 497–7,354 | 497–7,354 | 0 | Essays |
| Programme pages (Denmark) | 57 | 3.9–7.4 | 282–519 | 1,518–2,330 | **770–1,000** | Front fine; the disclosures dump |
| Programme pages (Netherlands) | 16 | 5.4–6.5 | 273–351 | **4,583–5,825** | **2,045–2,453** | Front fine; the disclosures dump |
| Destinations | 35 | 9.6–18.7 | 513–1,415 | 3,507–10,299 | 97–742 | Inside budget (#37 fixed them) |
| Universities | 20 | 3.9–11.0 | 104–842 | 200–1,422 | 0–26 | Mostly fine |
| Home, Europe, World, Denmark hub, Prepare, guides | 7 | 4.1–13.8 | 278–935 | — | ≤58 | Fine to good |

The pages rebuilt in September (Destinations, Home, Denmark hub, Programme front, Prepare) are the pattern to copy. Everything the rebuild did not reach is where the walls are.

### The ten most-repeated sentences

| Pages | Sentence (first words) | Where it belongs |
|---|---|---|
| 108 | "Read from the source, not yet checked by a person." | A state icon with a tooltip: one word, not a sentence |
| 97 | "Treat them as indicative and check before you rely on them." | Same freshness line; one tooltip |
| 73 | "Open this to see the exact page each rule came from, when it was read, and whether a person has checked it." (22 words) | The disclosure's summary should just say "Sources (12)" |
| 68 | "This programme has restricted admission, so meeting the requirements does not guarantee a place." | A glance-band chip "Restricted", with a tooltip |
| 66 | "3 dates on this page are carried over from the previous cycle…" (21 words) | A "provisional" badge on each date, and the sentence once in the legend |
| 57–58 | Twelve Danish national-rule paragraphs, 1,000 words in all: Course Results 18-point rule, GSK trap, results service, institution codes, MitID signature… | **One page**, `/denmark/ib-conversion/#access`, linked in one line |
| 35 | "The Danish Agency treats DP Course Results of at least 18 points…" (69 words) | Same |
| 16–20 | Dutch statute paragraphs: WHW art. 7.24, Nuffic deelcertificaten, DUO vwo exams, colloquium doctum (about 2,000 words) | **One** Course Results guide, linked |

---

## 2. Find a degree (`/programmes/`), section by section

**Before:** 77.8 phone screens and 30.9 desktop screens. The first programme sits at **phone screen 26.1** (desktop screen 7.0). The first result has 5,118 words above it. The longest prose run is **4,773 words in 16 consecutive paragraphs**, starting at phone screen 2.7.
Screenshots: `before/programmes--phone-fold.jpg`, `before/programmes--phone-full.jpg`, `before/programmes--desktop-full.jpg`. The full desktop capture shows the grey block between the filters and the list.

### Inventory: what is below the map and filters

| # | Block | Phone y (screens) | Words | Does a student need it here? | Verdict |
|---|---|---|---|---|---|
| 0 | Hero: eyebrow "Denmark and the Netherlands", H1 "Every English-taught programme", 16-word lede | 0–0.6 | 24 | Yes. It is the scope, and the only place the scope appears | **Keep**, and put the count in the H1 |
| 1 | Breadcrumb "Home / Find a degree" | 0.6 | 4 | No. It is a top-level page, and the menu already marks it | **Cut** |
| 2 | Map (world window) with + − Reset | 0.6–1.6 | — | Yes: pictures and places first | **Keep**, but no taller than about 0.45 screens on a phone |
| 3 | List of 21 cities, each with a count and ". Placed at the city, not at the campus", **said 21 times** | under the map | ~200 | The cities yes; the caveat once | **Becomes a horizontal chip row** (Sønderborg 10 · Aarhus 6 …); the caveat goes once into the legend |
| 4 | Figcaption: two legend sentences and "Choose a place on the map or in the list, then show its programmes. The list below is the same set either way." | under the map | 38 | The legend yes; the instruction no | **One line**: ● campus ○ city · bigger = more degrees |
| 5 | Filters: search · "What do you want to study?" · "Anywhere in particular?" (institution *abbreviations*: AAU, BUas, BAAA, SEA…) · "Which city?" · "Full Diploma, or Course Results?" with a 22-word help paragraph that describes a "Not established" state the filter does not offer | ~1.7–2.4 | ~90 | Yes, but five selects is one too many, and the abbreviations and the stale help text are noise | **Keep** search and subject. **Merge** institution and city into one "Where?" select grouped Country → City → Institution, with full names. The award becomes a chip with a ? popover (see #7) |
| 6 | Chips: Open admission only · **No Mathematics A** · Clear filters | 2.4 | 9 | "Mathematics A" is a Danish level, so it breaks ADR 0002 (the IB scale is the lingua franca) | **Relabel** to "No Maths HL needed"; keep the other two |
| 7 | **"If you will not hold the full Diploma"**, an always-open `note()`: 16 paragraphs and **4,770 words** | **2.7–26** | 4,770 | See the breakdown below. Almost none of it, on this page | **Cut from this page; relocate** (nothing is deleted) |
| 8 | Result count and active-filter chips | 2.6 | 5 | Yes | **Keep**, and move it into the heading line ("73 degrees", then "12 of 73") |
| 9 | 73 cards at 37–131 words each (about 80 on average), 0.7 phone screens per card | 26.1–75.8 | ~5,100 | Name, place, picture, IB subjects and deadline yes; the rest no | **Slim to ≤35 words** (below) |

#### Block 7, paragraph by paragraph

| ¶ | Words | Content | Problem |
|---|---|---|---|
| 0 | 44 | What DP Course Results are | A definition; belongs in a ? popover and the glossary |
| 1 | 17 | "Asks for the full Diploma — 50 of 73. Reachable on Course Results — 23 of 73." | Repeats the counts already in the filter options |
| 2 | 24 | "Asking for the Diploma is not the same as closing the door…" | A framing sentence |
| 3 | 107 | Denmark's national Course Results rule (18 points, grade 3s, 3 HL, two raises) | Useful, but it is one national rule, and it is also printed on 57 programme pages and on `/denmark/ib-conversion/` |
| 4–5 | 490 + 492 | Breda 21+ assessment, **twice**, near-verbatim | Duplicate; neither names the programme |
| 6 | 420 | TU Delft colloquium doctum | Says "this one" and never names which programme |
| 7 | 384 | Erasmus: colloquium doctum not published for this programme | Same |
| 8 | 330 | RSM: "Only the full IB Diploma is accepted" | **A "no", listed under "another way in"**. It contradicts ¶2 |
| 9 | 368 | Maastricht colloquium doctum, age-gated | Anonymous "this one" |
| 10–11 | 398 + 399 | Maastricht "no route on this page", **twice** | Duplicate |
| 12–14 | 431 + 432 + 429 | Twente colloquium doctum, **three times** | Triplicate |
| 15 | 52 | "Not established is the honest third answer…" | Describes a state this catalogue does not contain (50 + 23 = 73) |

**Why it is broken, not just long.** `explorer.mjs` collects every distinct `alternativeRoute` string from the records and prints them all (`routes` → `note()`). Those strings were written *for one programme's page*: "It does not close **this one** to you". Pulled out of context and deduplicated only by exact string, they become anonymous and repetitive, and one of them is a refusal presented as a route. The same strings already render in their proper place: on each programme page (`programme-facts.mjs` l.41) and in the subject checker's fit explanation (`eligibility.mjs` l.683).

### Redesign

**Target:** the first programme card inside **1.5 phone screens** and **1 desktop screen**, with **≤60 words** between the H1 and that card and **no prose paragraph** between the filters and the results.

```
┌ H1  73 degrees taught in English                    (count in the heading — Bachelorsportal)
│     Denmark and the Netherlands, mapped subject by subject. Elsewhere → Countries
├ [ map strip, ≤0.45 screens ]   ● campus ○ city · bigger = more degrees
├ chips →  Sønderborg 10 · Aarhus 6 · Frederiksberg 6 · Delft 4 · …   (scrolls sideways)
├ [ Search… ] [ Subject ▾ ] [ Where ▾ ]  [ + My subjects ]      desktop: one row
│   phone: [ Search… ] [ Filters (2) ] [ My subjects ]  → full-screen sheet, sticky "Show 12 degrees"
├ chips: Open admission · No Maths HL needed · Accepts Course Results (23) ⓘ · Clear
├ 12 of 73 · [Engineering ×] [Aarhus ×]
└ cards …
```

| Content | Becomes |
|---|---|
| Course Results explanation (¶0–2, ¶15) | A **ⓘ popover** on the "Accepts Course Results" chip, ≤35 words: "Finishing with DP Course Results rather than the Diploma? 23 of these 73 publish a way in. Each programme page says how." Plus a link: **"How Course Results are read →"** |
| National rules (¶3 for Denmark; the Dutch statute and colloquium doctum background) | A new guide page, **`/guides/course-results/`** ("If you won't hold the full Diploma"). The opening is one line per country as a table (Denmark: national rule, 18 points and two raises; Netherlands: diploma required by law, colloquium doctum at 21+ at some institutions). The per-institution detail sits in `<details>`. Generated from the records, with no country branching in code |
| Per-programme routes (¶4–14) | Stay where they already are: the programme page's fine print. The card gets a **badge**: "Course Results: route published" or "Diploma only", linking to `…/#requirements` |
| The contradictory RSM "no" | A "Diploma only" badge on that card. It never appears in a list of routes again |
| The stale "Not established" help text | **Cut** until the catalogue holds that state. Render the help from the options offered, not from a constant |
| 21 × "Placed at the city, not at the campus" | Said once, in the legend |
| Breadcrumb | Cut on top-level pages |
| Five selects | Search · Subject · Where (grouped, full names) · My subjects |
| Check my subjects (`/planner/`) | The **"My subjects" panel** on this page (nav-audit §5): six slots and the award. Cards then show fit badges ("Meets" / "Possible with action" / "Needs review") and a chip "Only what I qualify for" appears |

**The card, ≤35 words** (coordinate with the agent currently editing `explorer.js` and `components.mjs`):

```
[photo]  International Business                     ← name (link)
         CBS · Frederiksberg · BSc · 3 yrs           ← one meta line
         Needs: English · Maths (any) · History or Econ     ← IB-term subject chips, ≤4
         Apply by 15 Mar 12:00 CET · Restricted ⓘ    ← deadline status (universityadmissions.se)
         [Meets ✓]                                   ← only when My subjects is filled
```

The card sheds the 170-character summary (it is the programme page's lede; at most one clause stays), the "Danish requirement: …" translations (they belong on the programme page, where the IB translation sits beside them), and "Most recent cut-off 11.1 — history, not a forecast." (becomes "Cut-off 11.1 (2026) ⓘ" in the meta line).

**Expected after:** about 60 words before the first card, the first card at about 1.3 phone screens, and 73 cards at about 0.35 screens each, so roughly **27 phone screens instead of 78**. With "My subjects" or a field filter set, 3–8 screens.

---

## 3. The ten other worst pages

Ranked by harm to a student, which weighs the score by how often the page is visited and how consequential its content is. Two reference pages that score higher on raw numbers (credits, glossary) are placed lower for that reason.

### 3.1 Deadlines (`/timeline/`): 157.8 phone screens, 12,607 default words

**Inventory.** The hero ("The calendar"). A scope box: "Showing every deadline on the site — **758 in all**. Once you start comparing destinations, this narrows to yours." A picker behind "Choose which destinations to show". Then **541 dated events, oldest first: the first is 1 September 2025 and 60 are already past.** By country: Poland 43, Canada 39, the UK 32, the US 27 … Denmark and the Netherlands together have 34. Each event has a date, intake, country, label, consequence badge, "Via …" route and a "Details" disclosure. Then "214 dates we could not pin down" and "Not open to you" (3). An aside explains "Provisional" and gives two stat tiles. `before/timeline--phone-fold.jpg` shows a greyed past date as the first thing below the scope box.

**Needs vs dumped.** A student needs *the next few dates that apply to them*. They get every date for 36 countries, starting with last year. Each item is already short (the #35 fix put details behind a tap), so this is not prose: it is a list with no default filter. The scope depends on an Exploration List most students never build.

**Redesign.**
- **Stays:** one line per date, the consequence badge, and Details behind a tap.
- **Cut from the default view:** past dates, which move into one closed "Earlier this cycle (60)" disclosure. The route line becomes part of the country label.
- **Becomes an interactive opening:** "Which countries?" as **chips with counts** (Denmark 12 · Netherlands 22 · UK 32 …). Preselect whatever the Exploration List or compare tray holds. With nothing picked, show **the next 10 dates across all countries** and the chips, not 541 rows.
- **Becomes a visual:** a **month strip** (Oct–Aug) with one tick per date in scope and a "you are here" marker. Tapping a month jumps to it. The heading carries the count ("Next up: 7 dates in October").
- **Becomes a link:** undated (214) and closed (3) stay behind their taps, and each links to the country page's Deadlines topic.
- **Target:** ≤150 words and ≤2 phone screens before the student chooses anything.

### 3.2 How Denmark converts your IB (`/denmark/ib-conversion/`): 48.3 phone screens, 2,027 default words

**Inventory (phone y).** Hero with a 140-word opening, including a note "If you finish in May 2027" (3 bullets) (0–1.4). "What a Danish requirement means in IB terms": 454 words and a **30-row level table that stacks into 10 phone screens** (1.4–11.9). **"Work out your Danish average", the calculator, at screen 12.2** (first control; 623 words before it). "Total points to Danish grade average" table (12.5–19.7). "Single subject grades" table (19.7–23). "The handbook's subject table, in full" (23–39.9). "The awkward cases" (40). "What qualifies you" (409 words, 40.6). "Danish language". Sources.

**Needs vs dumped.** The one thing a student does here is *type a total and see a Danish average*, or *look up one subject*. The page leads with the reference tables and buries the calculator at screen 12.

**Redesign.**
- **Stays, first:** the calculator ("Your IB total → Danish average", one input, one answer) and directly under it a **subject lookup**: pick your subject and level, see its Danish level and which programmes ask for it.
- **One line each, with the table behind `<details>`:** the level table (keep only the rows a programme on the site asks for, which the page already counts), the points table, the single-grade table and the full handbook table.
- **Moves:** "What qualifies you" (409 words) becomes three short answers (Diploma ≥24 points / Course Results rule / retakes), with the long form behind a disclosure. It then becomes the single home for the Danish Course Results text that is now copied onto 57 programme pages (§3.5).
- **Cut:** the "If you finish in May 2027" note becomes one line in the hero ("Tables for summer 2027 are published by 1 March 2027") with a date stamp.
- **Target:** calculator above the phone fold; ≤8 phone screens by default.

### 3.3 Money, SU and what it costs (`/denmark/money/`): 14.6 phone screens, 1,432 words, **all open**

**Inventory.** Tuition (141 words). SU (311 words), with 3 bullet routes of up to 64 words each and "Taking SU to a degree abroad" (271 words). A warning note on the 2027 SU reform (74 words). Cost of living: a budget table of 8 rows. Housing (76). Working (95). "The order you have to do things in": 4 steps of up to 79 words. Sources. **The longest prose run is 760 words in 12 paragraphs, starting at 0.6 screens. There are no disclosures.**

**Needs vs dumped.** A student wants three numbers (tuition: 0 for EU/EEA; SU: DKK 7,426/month *if eligible*; living: DKK 8,450–13,700) and one question answered (*can I get SU?*). They get an essay on residence-permit acts.

**Redesign.**
- **Becomes a visual opening:** a **glance band** with the three numbers: Tuition €0 (EU/EEA) · SU up to DKK 7,426/mo · Living DKK 8,450–13,700/mo.
- **Becomes interactive:** **"Can I get SU?"**, a three-question stepper (citizenship → parent working in Denmark? → 5 years resident? / own job 10–12 h a week?) that ends in one of the three routes. This replaces the 311 + 271 words.
- **Short answers + `<details>`** (the Destination `topic()` pattern): Tuition, SU reform, Housing, Working, SU abroad. One line each.
- **Stays as is:** the budget table and the four-step admin order, as step cards with one line each and the detail behind a tap.
- **Target:** ≤300 default words (topic budget 90 each).

### 3.4 Trust and corrections (`/trust/`): 24.6 phone screens, 2,341 words, all open

**Inventory.** "Something here is wrong. What do I do?" (208 + 100 words). "How a claim gets onto the site" (184), "Where this currently stands" (390, with a table), "How far each destination has been researched" (403, table). "What automation is allowed to do" (124). "Who pays" (88). "Why things are in the order they are" (90). **"What moves, and what happens if you would rather it did not" (373 words about animation)**. "What this site knows about you" (158). "What this site does not do" (164). 33 long paragraphs; the longest run is 472 words.

**Redesign.** Turn it into an **FAQ of short answers**: nine questions as `topic()` blocks with one line each and the long form in `<details>`. Two numbers go in a glance band at the top ("x% of claims checked by a person · y destinations researched in depth"). The "report a mistake" route becomes a **button** at the top. The motion essay shrinks to one line ("Reduce motion is in the footer; the OS setting is respected") and moves to `/about/`. **Target** ≤400 default words.

### 3.5 Programme pages, fine print and sources (73 pages, one template)

**Inventory.** The front of each page is good: hero, glance band, "What you need" subject cards, three topics (282–519 default words, 3.9–7.4 phone screens). The dumping is **behind the disclosures**, and it is the same text on every page:
- "Requirements in full, and how places are allocated": **838 words** on a Breda page, mostly the national Course Results and statute paragraphs.
- "All 8 dates": 358 words.
- **"Where this comes from (12 sources)": 4,425 words**, every Evidence excerpt printed in full.
- Boilerplate: **770–1,000 words** on each Danish page (12 national-rule paragraphs on 57 pages) and **2,045–2,453** on each Dutch page (WHW statute, Nuffic, DUO, colloquium doctum on 16 pages).
- Also: the freshness aside (3 sentences, on 66–108 pages), "Apply by" shown twice (the glance band and the side aside), and the "What it is" topic repeating the hero lede word for word.

**Redesign.**
- **Stays:** the front, unchanged.
- **Fine print:** first the programme's *own* rules, and the national rule as **one line with a link** ("Denmark reads Course Results under one national rule → how"). The link goes to `/denmark/ib-conversion/#access` or `/guides/course-results/`.
- **Sources:** one line per source (claim · publisher · date · link). The excerpt goes behind a per-source toggle, the Evidence drawer the templates doc describes, instead of a 4,400-word dump.
- **Freshness:** a state chip ("Read from source · 23 Sep") with a tooltip, not three sentences.
- **Cut:** the duplicate "Apply by" in the aside and the repeated lede in "What it is".
- **Target:** ≤600 words total on a Danish page and ≤900 on a Dutch one, including closed disclosures, excluding the sources toggle.

### 3.6 How to apply in Denmark (`/denmark/apply/`): 8.6 phone screens, 740 words, no disclosures

**Inventory.** Eight dated steps (each 26–118 words), then "If you are a subject short" (87), "Taking a sabbatår" (130) and an "On ranking" note. Thirteen consecutive long paragraphs (734 words) from 0.6 screens.

**Redesign.** This is the right *shape*, a dated sequence, written as prose. Make it a **vertical stepper**: each step shows its date and a one-line action ("15 Mar 12:00 CET: submit up to 8 priorities"), with the rest behind the step's own `<details>`. Institution codes and MitID signature mechanics go behind the step they belong to. "Subject short" and "sabbatår" become two `topic()` short answers. Each step's date is linked to its calendar entry. **Target:** the whole sequence visible in ≤2 phone screens; ≤250 default words.

### 3.7 Compare destinations (`/compare/`): 27.3 phone screens (6.0 on desktop)

**Inventory.** The hero lede (22 words). A note "Why there is no ranking" (49). A picker "Add a destination". **"Or scan the whole set": a 36-row × 6-column table that stacks into roughly 22 phone screens**, with each cell a truncated sentence ("The whole system. Every bachelor's degree…").

**Redesign.** The note becomes one line under the H1 (the lede already says it). On phone, the full table becomes a **sortable compact list**: country · EU tuition (a number or "free") · English-taught (a word: wide / limited / little) · coverage (●●●○○). The cell prose goes behind each row's expander. Sentences as table cells are the wall here. The compare-two view stays as the main tool. **Target** ≤6 phone screens.

### 3.8 For counsellors (`/counsellors/`): 10.5 phone screens, 1,033 words

**Inventory.** Seven sections of essay: coverage (192 words and a table), conversation order (138), "four things students get wrong" (203), what to check (94), how much is verified (138), what it will not do (94), reporting (138). A 481-word run.

**Redesign.** Counsellors do read more, so the budget is looser (≤600 default words), but the shape should still be scannable. The coverage table leads. The "four things students get wrong" become **four cards** with one line each; these are the most reusable content on the page, and the same four should be linked from Find a degree's "My subjects" panel. "Conversation order" becomes a 4-step strip (Subjects → Country → Programme → Institution). The rest becomes short answers with `<details>`.

### 3.9 About (`/about/`): 6.3 phone screens, 497 words, **11 consecutive paragraphs from the top**

**Redesign.** Three short answers (Who it's for · How it's built · How accurate it is), each ≤2 sentences, then the disclaimer as one line and links to Trust and Credits. This is also the place for the motion paragraph moved out of Trust. **Target** ≤200 default words.

### 3.10 Sources and photo credits (`/credits/`): **263.7 phone screens**, 7,354 words

**Inventory.** "Freely licensed photographs" runs 6,303 words over 216 phone screens, one attribution paragraph per image. "Institutional photographs" runs 865.

**Redesign.** It is a reference page, and full attribution is a licence obligation, but it does not need to be open. Group the credits **by country and institution in closed `<details>`** (e.g. "Denmark (48 photos)"), with a search box. Each photo's credit also stays next to the photo (`hero__credit`), which is where the licence is actually met. **Target** ≤3 screens by default.

### Also measured (not top 10)

- **Glossary** (`/glossary/`, 10.9 screens, 742 words, 25 consecutive entries): a lookup page, so prose is expected. Add a filter box and A–Z jump chips, and make each term's definition one line with detail on tap.
- **University pages** (e.g. `/universities/dk-sdu/`, 11 screens): 15 degree cards with 347 duplicate words, because two campuses of one degree repeat the same card. Group them into one card with "Odense · Sønderborg".
- **Destinations** (35 pages): inside the #37 budget. Long institution lists (Netherlands 20+) could take sector chips (Research university / University of applied sciences / University college). The Netherlands page carries 742 boilerplate words.
- **Planner** (`/planner/`): a 50-word Course Results help paragraph under the award select. Make it a ⓘ popover. The rest disappears into the Find a degree merge.
- **Prepare**, **guides**, **FAQ**, **home**, **Europe/World**, **Denmark hub**: fine. Prepare's board is the model for "a picture of the answer, then the reasoning one tap down".

---

## Appendix: every page, ranked

Score as defined in §1. Programme slugs have `-2027-autumn` shortened to `…`. A dash means no value (for example no control on the page).

| # | Page | Score | Phone screens | Desktop screens | Words above phone fold | Default-view words | Total words (incl. closed) | Longest prose run (words) | Long paras (≥15w) | Boilerplate words | Duplicate words |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `/programmes/` | 18855 | 77.8 | 30.9 | 24 | 5182 | 5182 | 4773 | 181 | 807 | 0 |
| 2 | `/timeline/` | 11461 | 157.8 | 96.1 | 68 | 12607 | 62081 | 81 | 76 | 789 | 3238 |
| 3 | `/credits/` | 4130 | 263.7 | 77 | 87 | 7354 | 7354 | 139 | 7 | 0 | 18 |
| 4 | `/trust/` | 2757 | 24.6 | 11.4 | 126 | 2341 | 2341 | 472 | 33 | 0 | 0 |
| 5 | `/denmark/money/` | 2741 | 14.6 | 7 | 100 | 1432 | 1432 | 760 | 25 | 23 | 0 |
| 6 | `/glossary/` | 2233 | 10.9 | 7 | 70 | 742 | 742 | 681 | 25 | 0 | 0 |
| 7 | `/denmark/apply/` | 2101 | 8.6 | 4 | 81 | 740 | 740 | 734 | 13 | 11 | 0 |
| 8 | `/counsellors/` | 1894 | 10.5 | 5.3 | 73 | 1033 | 1033 | 481 | 21 | 0 | 0 |
| 9 | `/denmark/ib-conversion/` | 1609 | 48.3 | 17.5 | 102 | 2027 | 2243 | 129 | 17 | 0 | 9 |
| 10 | `/about/` | 1447 | 6.3 | 3.3 | 94 | 497 | 497 | 489 | 11 | 0 | 0 |
| 11 | `/destinations/nl/` | 1377 | 18.1 | 10.9 | 37 | 1415 | 6557 | 45 | 9 | 742 | 178 |
| 12 | `/destinations/ca/` | 1289 | 18.7 | 13.1 | 40 | 1346 | 10299 | 56 | 10 | 112 | 270 |
| 13 | `/programmes/nl-breda-uas-creative-media-and-game-technologies…/` | 1260 | 5.5 | 2.7 | 50 | 289 | 5818 | 77 | 5 | 2453 | 126 |
| 14 | `/programmes/nl-breda-uas-applied-data-science-and-ai…/` | 1256 | 5.6 | 2.7 | 51 | 280 | 5825 | 77 | 5 | 2453 | 126 |
| 15 | `/programmes/nl-breda-uas-creative-business…/` | 1255 | 5.4 | 2.6 | 50 | 279 | 5808 | 77 | 5 | 2453 | 126 |
| 16 | `/programmes/nl-breda-uas-hotel-management…/` | 1255 | 5.4 | 2.7 | 50 | 279 | 5812 | 77 | 5 | 2453 | 126 |
| 17 | `/programmes/nl-maastricht-university-college-maastricht…/` | 1226 | 6 | 2.8 | 52 | 351 | 5513 | 83 | 5 | 2086 | 159 |
| 18 | `/programmes/nl-maastricht-international-business…/` | 1207 | 6.1 | 2.8 | 47 | 330 | 5443 | 83 | 5 | 2086 | 150 |
| 19 | `/programmes/nl-maastricht-data-science-and-artificial-intelligence…/` | 1206 | 6.1 | 2.9 | 53 | 330 | 5238 | 83 | 5 | 2045 | 161 |
| 20 | `/destinations/au/` | 1168 | 17.4 | 11.8 | 44 | 1304 | 6575 | 63 | 11 | 135 | 130 |
| 21 | `/destinations/jp/` | 1149 | 14.9 | 8.8 | 38 | 1085 | 6209 | 43 | 9 | 128 | 330 |
| 22 | `/programmes/nl-tudelft-aerospace-engineering…/` | 1118 | 5.7 | 2.8 | 53 | 287 | 4638 | 74 | 4 | 2187 | 90 |
| 23 | `/programmes/nl-tudelft-computer-science-and-engineering…/` | 1118 | 5.7 | 2.8 | 55 | 287 | 4642 | 74 | 4 | 2187 | 90 |
| 24 | `/destinations/ae/` | 1116 | 16.4 | 11 | 41 | 1222 | 7886 | 63 | 12 | 136 | 141 |
| 25 | `/programmes/nl-erasmus-economics-and-business-economics…/` | 1114 | 6.5 | 3.4 | 52 | 346 | 4583 | 74 | 4 | 2109 | 80 |
| 26 | `/programmes/nl-tudelft-nanobiology…/` | 1111 | 5.6 | 2.8 | 52 | 289 | 4600 | 74 | 4 | 2160 | 90 |
| 27 | `/programmes/nl-erasmus-international-business-administration…/` | 1098 | 5.9 | 3 | 49 | 295 | 4672 | 74 | 4 | 2109 | 90 |
| 28 | `/programmes/nl-utwente-advanced-technology…/` | 1084 | 6.1 | 3.1 | 50 | 304 | 4789 | 66 | 4 | 2068 | 100 |
| 29 | `/programmes/nl-tudelft-earth-climate-and-technology…/` | 1082 | 5.6 | 2.8 | 58 | 273 | 4584 | 66 | 4 | 2146 | 90 |
| 30 | `/programmes/nl-utwente-technical-computer-science…/` | 1076 | 5.7 | 2.9 | 50 | 288 | 4964 | 66 | 4 | 2068 | 100 |
| 31 | `/programmes/nl-utwente-creative-technology…/` | 1075 | 5.7 | 2.8 | 50 | 285 | 4717 | 66 | 4 | 2068 | 100 |
| 32 | `/destinations/hu/` | 1038 | 14.5 | 8.9 | 40 | 1040 | 6636 | 43 | 10 | 114 | 198 |
| 33 | `/destinations/ie/` | 1026 | 15.5 | 9.1 | 37 | 1165 | 7024 | 56 | 10 | 171 | 81 |
| 34 | `/destinations/fr/` | 1013 | 14.5 | 9.3 | 44 | 1053 | 5235 | 60 | 10 | 121 | 130 |
| 35 | `/destinations/gb/` | 1006 | 17.3 | 10.7 | 39 | 1352 | 5709 | 31 | 8 | 172 | 58 |
| 36 | `/destinations/cn/` | 981 | 15.3 | 10 | 36 | 1030 | 5308 | 65 | 10 | 122 | 100 |
| 37 | `/destinations/hk/` | 977 | 14.9 | 8.9 | 37 | 1079 | 3989 | 45 | 8 | 118 | 153 |
| 38 | `/destinations/at/` | 975 | 14.9 | 9.1 | 42 | 1148 | 4709 | 47 | 11 | 127 | 49 |
| 39 | `/destinations/sg/` | 969 | 15.3 | 9.4 | 41 | 1066 | 7783 | 61 | 10 | 104 | 131 |
| 40 | `/destinations/ch/` | 966 | 15 | 9 | 40 | 1185 | 5315 | 57 | 10 | 97 | 32 |
| 41 | `/destinations/de/` | 938 | 15.1 | 9.2 | 39 | 1114 | 6353 | 49 | 10 | 151 | 39 |
| 42 | `/prepare/` | 931 | 11 | 5.9 | 74 | 872 | 3384 | 43 | 13 | 35 | 138 |
| 43 | `/destinations/be/` | 927 | 15.6 | 9.9 | 38 | 1140 | 5612 | 60 | 8 | 113 | 46 |
| 44 | `/guides/distinctive-options/` | 910 | 12 | 5.7 | 54 | 935 | 3835 | 51 | 17 | 0 | 0 |
| 45 | `/destinations/us/` | 901 | 15.4 | 10.1 | 47 | 1160 | 9256 | 55 | 9 | 133 | 43 |
| 46 | `/destinations/kr/` | 896 | 14.8 | 8.9 | 41 | 1069 | 5133 | 43 | 9 | 128 | 110 |
| 47 | `/destinations/se/` | 893 | 14.4 | 9 | 31 | 992 | 5287 | 59 | 9 | 149 | 54 |
| 48 | `/destinations/fi/` | 883 | 15 | 8.8 | 33 | 1101 | 4732 | 40 | 9 | 122 | 36 |
| 49 | `/destinations/gr/` | 877 | 13.3 | 9.1 | 43 | 896 | 4413 | 60 | 10 | 150 | 64 |
| 50 | `/universities/dk-sdu/` | 877 | 11 | 4.9 | 40 | 842 | 1422 | 32 | 2 | 16 | 347 |
| 51 | `/destinations/no/` | 858 | 15 | 9.1 | 30 | 1063 | 4917 | 45 | 9 | 128 | 18 |
| 52 | `/destinations/es/` | 849 | 14.3 | 8.9 | 39 | 971 | 5011 | 66 | 8 | 111 | 39 |
| 53 | `/destinations/cz/` | 842 | 13.9 | 8.7 | 38 | 1004 | 7698 | 54 | 8 | 114 | 38 |
| 54 | `/destinations/lt/` | 829 | 13.7 | 8.2 | 40 | 961 | 4743 | 43 | 8 | 140 | 60 |
| 55 | `/destinations/lv/` | 819 | 12.6 | 8.1 | 38 | 860 | 4057 | 50 | 9 | 106 | 78 |
| 56 | `/programmes/dk-cbs-business-administration-and-sociology…/` | 817 | 7.4 | 4 | 58 | 519 | 1800 | 81 | 4 | 1000 | 16 |
| 57 | `/destinations/pl/` | 815 | 14.7 | 8.8 | 38 | 1070 | 8308 | 34 | 9 | 106 | 0 |
| 58 | `/destinations/pt/` | 815 | 13.3 | 8.8 | 40 | 876 | 4488 | 65 | 9 | 110 | 34 |
| 59 | `/destinations/nz/` | 815 | 12.8 | 8.1 | 44 | 876 | 6232 | 42 | 8 | 142 | 126 |
| 60 | `/programmes/dk-cbs-business-administration-and-digital-management…/` | 814 | 7.3 | 4 | 58 | 513 | 1790 | 81 | 4 | 1000 | 16 |
| 61 | `/programmes/dk-cbs-international-business-and-politics…/` | 810 | 7.3 | 4.1 | 57 | 504 | 1779 | 81 | 4 | 1000 | 16 |
| 62 | `/programmes/dk-cbs-international-shipping-and-trade…/` | 809 | 7.3 | 4.1 | 57 | 503 | 1778 | 81 | 4 | 1000 | 16 |
| 63 | `/programmes/dk-cbs-business-administration-and-service-management…/` | 807 | 7.4 | 4.1 | 48 | 498 | 1775 | 81 | 4 | 1000 | 16 |
| 64 | `/programmes/dk-cbs-international-business…/` | 805 | 7.3 | 4 | 52 | 494 | 1765 | 81 | 4 | 1000 | 16 |
| 65 | `/programmes/dk-ruc-international-bachelor-in-natural-sciences…/` | 790 | 7.2 | 4.1 | 51 | 494 | 1746 | 81 | 4 | 950 | 16 |
| 66 | `/programmes/dk-au-economics-and-business-administration…/` | 784 | 7.1 | 3.9 | 58 | 471 | 1762 | 81 | 4 | 968 | 16 |
| 67 | `/destinations/it/` | 777 | 13.7 | 8.7 | 44 | 960 | 4495 | 43 | 8 | 137 | 10 |
| 68 | `/programmes/dk-au-economics-and-business-administration-herning…/` | 775 | 7.2 | 3.9 | 52 | 467 | 1761 | 81 | 4 | 946 | 16 |
| 69 | `/programmes/dk-sdu-economics-and-business-administration…/` | 775 | 7.1 | 3.9 | 53 | 461 | 1712 | 81 | 4 | 955 | 16 |
| 70 | `/programmes/dk-au-cognitive-science…/` | 774 | 6.8 | 3.7 | 56 | 452 | 1736 | 81 | 4 | 968 | 16 |
| 71 | `/programmes/dk-aau-economics-and-business-administration…/` | 772 | 7.1 | 3.9 | 51 | 461 | 1699 | 81 | 4 | 946 | 16 |
| 72 | `/programmes/dk-sdu-market-and-management-anthropology…/` | 772 | 7 | 3.8 | 54 | 455 | 1702 | 81 | 4 | 955 | 16 |
| 73 | `/programmes/dk-sdu-mechanical-engineering-sonderborg…/` | 771 | 6.9 | 3.8 | 47 | 438 | 1692 | 81 | 4 | 980 | 16 |
| 74 | `/programmes/dk-ruc-international-bachelor-in-social-sciences…/` | 769 | 7 | 3.8 | 56 | 454 | 1735 | 81 | 4 | 946 | 16 |
| 75 | `/programmes/dk-aau-chemical-engineering-and-biotechnology…/` | 767 | 6.8 | 3.8 | 60 | 451 | 1697 | 81 | 4 | 946 | 16 |
| 76 | `/programmes/dk-aau-energy-engineering…/` | 765 | 6.7 | 3.7 | 51 | 444 | 1688 | 81 | 4 | 950 | 16 |
| 77 | `/programmes/dk-royal-danish-academy-crafts-in-glass-and-ceramics…/` | 765 | 5.9 | 3 | 57 | 302 | 2330 | 80 | 4 | 834 | 124 |
| 78 | `/programmes/dk-sdu-european-studies…/` | 761 | 6.8 | 3.7 | 52 | 438 | 1697 | 81 | 4 | 946 | 16 |
| 79 | `/destinations/mt/` | 757 | 11.3 | 6.9 | 39 | 699 | 4187 | 85 | 10 | 127 | 0 |
| 80 | `/programmes/dk-sdu-mechanical-engineering-beng…/` | 751 | 7.2 | 4 | 47 | 507 | 2047 | 80 | 4 | 770 | 26 |
| 81 | `/programmes/dk-sdu-engineering-innovation-and-business…/` | 749 | 6.5 | 3.4 | 51 | 381 | 1642 | 81 | 4 | 1000 | 16 |
| 82 | `/destinations/ee/` | 746 | 12.8 | 8.1 | 37 | 839 | 3838 | 45 | 9 | 114 | 27 |
| 83 | `/programmes/dk-sdu-interactive-technology-engineering…/` | 745 | 6.4 | 3.4 | 47 | 373 | 1634 | 81 | 4 | 1000 | 16 |
| 84 | `/programmes/dk-ruc-bachelor-in-global-humanities…/` | 744 | 6.7 | 3.6 | 55 | 405 | 1663 | 81 | 4 | 946 | 16 |
| 85 | `/programmes/dk-dtu-general-engineering…/` | 744 | 6.3 | 3.3 | 60 | 377 | 1597 | 88 | 4 | 946 | 16 |
| 86 | `/programmes/dk-sdu-electronics-sonderborg…/` | 742 | 6.3 | 3.4 | 48 | 367 | 1622 | 81 | 4 | 1000 | 16 |
| 87 | `/programmes/dk-sdu-mechatronics-sonderborg…/` | 741 | 6.3 | 3.4 | 48 | 366 | 1621 | 81 | 4 | 1000 | 16 |
| 88 | `/programmes/dk-via-climate-and-supply-engineering-beng…/` | 734 | 6.8 | 3.7 | 51 | 441 | 1827 | 80 | 4 | 824 | 26 |
| 89 | `/programmes/dk-aau-applied-industrial-electronics…/` | 727 | 6.4 | 3.4 | 53 | 368 | 1602 | 81 | 4 | 950 | 16 |
| 90 | `/programmes/dk-itu-global-business-informatics…/` | 725 | 6.2 | 3.2 | 58 | 367 | 1654 | 81 | 4 | 946 | 16 |
| 91 | `/programmes/dk-via-mechanical-engineering-beng…/` | 725 | 6.8 | 3.6 | 45 | 424 | 1793 | 80 | 4 | 824 | 26 |
| 92 | `/programmes/dk-absalon-biotechnology-beng…/` | 724 | 6.7 | 3.7 | 40 | 402 | 1882 | 80 | 4 | 824 | 36 |
| 93 | `/destinations/si/` | 719 | 11.5 | 7.5 | 39 | 722 | 4980 | 58 | 9 | 122 | 25 |
| 94 | `/programmes/dk-absalon-robot-systems-beng…/` | 719 | 6.3 | 3.4 | 44 | 352 | 1960 | 80 | 4 | 824 | 56 |
| 95 | `/universities/dk-via/` | 716 | 9.1 | 4.3 | 41 | 730 | 1012 | 30 | 2 | 0 | 251 |
| 96 | `/programmes/dk-sdu-artificial-intelligence…/` | 714 | 5.9 | 3.1 | 54 | 326 | 1571 | 81 | 4 | 975 | 16 |
| 97 | `/programmes/dk-sdu-software-engineering-vejle…/` | 707 | 5.8 | 3 | 49 | 297 | 1549 | 81 | 4 | 1000 | 16 |
| 98 | `/programmes/dk-via-computer-graphic-arts…/` | 706 | 5.9 | 3 | 52 | 299 | 2147 | 80 | 4 | 834 | 66 |
| 99 | `/programmes/dk-itu-data-science…/` | 705 | 5.8 | 3 | 59 | 326 | 1589 | 81 | 4 | 946 | 16 |
| 100 | `/programmes/dk-sdu-computer-science…/` | 704 | 5.8 | 3.1 | 52 | 307 | 1552 | 81 | 4 | 975 | 16 |
| 101 | `/programmes/dk-sdu-software-engineering-sonderborg…/` | 704 | 5.8 | 3 | 50 | 291 | 1543 | 81 | 4 | 1000 | 16 |
| 102 | `/programmes/dk-au-it-product-development…/` | 703 | 5.9 | 3 | 57 | 310 | 1591 | 81 | 4 | 968 | 16 |
| 103 | `/programmes/dk-via-graphic-storytelling…/` | 701 | 5.7 | 3 | 47 | 290 | 2157 | 80 | 4 | 834 | 66 |
| 104 | `/programmes/dk-via-software-technology-engineering-xr-beng…/` | 701 | 6.4 | 3.4 | 49 | 376 | 1720 | 80 | 4 | 824 | 26 |
| 105 | `/programmes/dk-au-computer-science…/` | 700 | 5.8 | 3 | 54 | 303 | 1582 | 81 | 4 | 968 | 16 |
| 106 | `/programmes/dk-au-data-science…/` | 700 | 5.8 | 3 | 51 | 304 | 1583 | 81 | 4 | 968 | 16 |
| 107 | `/programmes/dk-via-software-technology-engineering-beng…/` | 695 | 6.5 | 3.4 | 50 | 384 | 1677 | 80 | 4 | 824 | 16 |
| 108 | `/programmes/dk-via-character-animation…/` | 692 | 5.8 | 3 | 51 | 292 | 2060 | 80 | 4 | 834 | 56 |
| 109 | `/programmes/dk-sdu-mechatronics-beng…/` | 687 | 6.3 | 3.4 | 46 | 367 | 1901 | 80 | 4 | 790 | 26 |
| 110 | `/programmes/dk-sdu-electronics-beng…/` | 680 | 6.3 | 3.4 | 46 | 353 | 1887 | 80 | 4 | 790 | 26 |
| 111 | `/programmes/dk-via-construction-technology-ap…/` | 679 | 6.1 | 3.1 | 56 | 320 | 1746 | 80 | 4 | 843 | 26 |
| 112 | `/programmes/dk-zealand-architectural-technology-and-construction-management…/` | 679 | 6.4 | 3.4 | 47 | 310 | 1734 | 80 | 4 | 834 | 34 |
| 113 | `/programmes/dk-via-design-technology-and-business-ap…/` | 676 | 6.1 | 3.2 | 53 | 335 | 1650 | 80 | 4 | 843 | 16 |
| 114 | `/programmes/dk-zealand-cybersecurity…/` | 675 | 6.1 | 3.1 | 45 | 301 | 1744 | 80 | 4 | 834 | 34 |
| 115 | `/programmes/dk-via-architectural-technology-and-construction-management…/` | 674 | 6.1 | 3.2 | 54 | 315 | 1785 | 80 | 4 | 834 | 26 |
| 116 | `/compare/` | 672 | 27.3 | 6 | 82 | 897 | 897 | 77 | 4 | 0 | 0 |
| 117 | `/programmes/dk-sea-multimedia-design-ap…/` | 669 | 6 | 3.2 | 57 | 320 | 1549 | 80 | 4 | 843 | 16 |
| 118 | `/programmes/dk-via-global-business-engineering-beng…/` | 669 | 5.9 | 3.1 | 48 | 313 | 1644 | 80 | 4 | 824 | 26 |
| 119 | `/programmes/dk-dania-cyber-security…/` | 658 | 5.8 | 3 | 47 | 284 | 1637 | 80 | 4 | 834 | 26 |
| 120 | `/universities/dk-cbs/` | 656 | 3.9 | 3.9 | 49 | 649 | 1130 | 34 | 1 | 16 | 356 |
| 121 | `/destinations/lu/` | 653 | 9.6 | 6.3 | 38 | 513 | 3507 | 58 | 9 | 143 | 58 |
| 122 | `/programmes/dk-sea-computer-science-ap…/` | 650 | 5.7 | 3 | 55 | 282 | 1518 | 80 | 4 | 843 | 16 |
| 123 | `/destinations/is/` | 637 | 9.9 | 6.4 | 34 | 569 | 4348 | 58 | 9 | 127 | 18 |
| 124 | `/guides/medicine-abroad/` | 633 | 6.5 | 4 | 70 | 450 | 2456 | 70 | 12 | 23 | 21 |
| 125 | `/denmark/` | 600 | 13.8 | 6.5 | 58 | 634 | 2122 | 63 | 7 | 58 | 0 |
| 126 | `/programmes/dk-baaa-multimedia-design-ap…/` | 574 | 3.9 | 3.5 | 49 | 349 | 1702 | 34 | 1 | 843 | 26 |
| 127 | `/planner/` | 500 | 5.3 | 2.2 | 36 | 935 | 935 | 129 | 5 | 0 | 0 |
| 128 | `/europe/` | 472 | 13.5 | 5.9 | 46 | 828 | 828 | 29 | 0 | 0 | 0 |
| 129 | `/universities/` | 393 | 14.8 | 5.7 | 36 | 602 | 602 | 36 | 1 | 0 | 0 |
| 130 | `/universities/dk-au/` | 373 | 7.3 | 3.8 | 44 | 408 | 889 | 34 | 1 | 16 | 76 |
| 131 | `/universities/dk-aau/` | 300 | 6.5 | 3.8 | 39 | 369 | 671 | 29 | 1 | 16 | 33 |
| 132 | `/faq/` | 284 | 4.1 | 2.3 | 110 | 202 | 1069 | 78 | 1 | 23 | 0 |
| 133 | `/universities/nl-utwente/` | 268 | 6.1 | 3.3 | 41 | 255 | 570 | 33 | 2 | 16 | 30 |
| 134 | `/universities/dk-ucph/` | 256 | 5.2 | 3 | 43 | 171 | 486 | 63 | 2 | 16 | 0 |
| 135 | `/world/` | 251 | 7.8 | 4.8 | 42 | 398 | 398 | 26 | 0 | 0 | 0 |
| 136 | `/universities/dk-ruc/` | 248 | 6.1 | 3.4 | 43 | 314 | 594 | 33 | 1 | 16 | 0 |
| 137 | `/universities/nl-tudelft/` | 232 | 6.1 | 3.5 | 47 | 212 | 467 | 39 | 2 | 26 | 0 |
| 138 | `/universities/nl-erasmus/` | 229 | 5.9 | 3.4 | 42 | 233 | 513 | 34 | 2 | 16 | 0 |
| 139 | `/` | 219 | 5.7 | 3.4 | 47 | 278 | 278 | 30 | 1 | 0 | 0 |
| 140 | `/universities/dk-itu/` | 214 | 5.6 | 3.3 | 49 | 223 | 483 | 39 | 1 | 16 | 0 |
| 141 | `/universities/nl-breda-uas/` | 207 | 5.8 | 3.4 | 45 | 177 | 440 | 37 | 2 | 16 | 0 |
| 142 | `/universities/nl-maastricht/` | 200 | 5.7 | 3.3 | 40 | 183 | 523 | 32 | 2 | 16 | 0 |
| 143 | `/universities/dk-absalon/` | 183 | 5.2 | 3 | 36 | 198 | 362 | 32 | 1 | 0 | 0 |
| 144 | `/universities/dk-dtu/` | 179 | 5.2 | 3.3 | 45 | 164 | 353 | 36 | 1 | 16 | 0 |
| 145 | `/universities/dk-royal-danish-academy/` | 171 | 4.9 | 3.1 | 39 | 133 | 245 | 32 | 2 | 0 | 0 |
| 146 | `/universities/dk-baaa/` | 162 | 4.8 | 3.1 | 38 | 136 | 245 | 27 | 2 | 0 | 0 |
| 147 | `/universities/dk-sea/` | 153 | 5.1 | 3 | 39 | 153 | 233 | 28 | 1 | 0 | 0 |
| 148 | `/universities/dk-zealand/` | 153 | 5.1 | 3.1 | 32 | 181 | 321 | 21 | 1 | 0 | 0 |
| 149 | `/universities/dk-dania/` | 114 | 4.5 | 2.8 | 47 | 104 | 200 | 21 | 1 | 0 | 0 |
