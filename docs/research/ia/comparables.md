# Comparables: navigation and programme-search IA

Research for the IB Pathways navigation and programme-finder redesign. All pages were fetched on
2026-09-25. Most were read with WebFetch, which converts server HTML to text, so it can miss
widgets that only render in the browser. Study in NL, universityadmissions.se, Study in Denmark
and Common App were also opened in a real browser, at desktop width and at 375 px mobile width.
Two sites showed a Cloudflare bot check in the browser: UCAS course search and Bachelorsportal
search. I did not try to get past it, so those two layouts come from WebFetch or UCAS's own help
pages.

## 1. Top-level navigation labels

| Site | Top-level labels (in order) | Grouping principle |
|---|---|---|
| UCAS (ucas.com) | Discover · Applying · Money & student life · International (+ audience switch: Students · Providers · Advisers · Businesses) | Stage (discover → apply), audience separate |
| Bachelorsportal | Programmes · Universities · Countries · Scholarships · Resources | Object type (what you are looking for) |
| Common App | Find Colleges · About · Plan for college · Apply to college · Pay for college (+ "For counselors and teachers", "For colleges and universities") | Task, verb-led; audience in a secondary band |
| Study in Denmark | Study in Denmark · Plan Your Studies · Programmes · Living in Denmark · Working in Denmark after graduation · Cookies · Search site | Mixed: journey stage + one object (Programmes) |
| Study in NL | Home · Dutch education · Finances · Plan your stay · Life in NL · After your studies · Student stories · Newsletter | Journey order (system → money → prepare → live → after) |
| universityadmissions.se (SE) | Search for courses · Key dates and deadlines · Entry requirements · Apply to master's · Apply to bachelor's · Selection and admissions results · Fees, scholarships and residence permit · Find out more · Support Centre · About | Task-first. Deadlines are a top-level item |
| Unifrog (student platform, per its schools page) | Quizzes · Exploring and Connecting · Recording · Searching and Applying · Materials; university search split by region (UK, US, Europe English-taught, Canada, Asia, ...) | Stage, with the search split by region ("doors") |

## 2. Per-site notes

### UCAS: https://www.ucas.com/ (fetched 2026-09-25)
- Four top items. The "Applying" children are in time order: Before you apply · Applying to university · After applying (plus Conservatoires and Parents).
- The home hero is one search box ("Choose your future") with a type selector: Courses, Universities, Scholarships, Apprenticeships, Events, Subject guides.
- Course search (https://www.ucas.com/explore/search/courses-beta) returned 403 to WebFetch and showed a bot challenge in the browser, so I did not see it directly.
- The entry-requirements filter is explained on its own page (https://www.ucas.com/entry-requirements-filter), linked from search. You enter your qualifications or Tariff points, and IB HL is supported. The page warns that it does not cover all EU/international qualifications and tells you to check with the university. The explanation sits off the results page and the caveat is stated plainly.

### Bachelorsportal: https://www.bachelorsportal.com/ (fetched 2026-09-25)
- Home, top to bottom: search hero → 15 discipline image cards → about 10 country cards, each with a one-line hook (free tuition, quality of life) → "Take a free test" matching quiz → articles.
- Search (https://www.bachelorsportal.com/search/bachelor/denmark), top to bottom:
  - Breadcrumb.
  - An H1 that carries the count: "54 Bachelor's degrees in Denmark".
  - Tabs: Programmes | Universities | Scholarships (the same filters applied to different objects).
  - Active-filter chips with "Clear all", then sort and "Filters (1)".
  - Cards. There is no prose between the filters and the first result.
- Filters: field, location, university, tuition, duration, format, attendance, degree type, special programme.
- Card: logo, university and rating, location, title, a ~50-word blurb, degree/format/duration, tuition. 20 per page, numbered pages.
- Country page (https://www.bachelorsportal.com/countries/6/denmark.html): in-page tab bar Study · Living · About · Universities · Student visa, followed by How to apply.
- Anti-patterns:
  - Deadlines are vague (roughly "usually during summer ... or in winter").
  - Paid "Featured" cards are mixed into the results.
  - Sign-up nags.
  - The blurbs mean fewer results fit on a screen.

### Common App: https://www.commonapp.org/ (fetched 2026-09-25)
- Explore (https://www.commonapp.org/explore):
  - H1 "Explore colleges" with no intro prose, then a search box.
  - A row of checkboxes and dropdowns, with "Filters+" for the rest.
  - "1170 colleges found", a grid/list/map toggle and sort. The search page shows no deadlines.
- Explore on mobile: Grid view / Map view pills, a collapsed "Filters +", the count, and compact rows (name, city, thumbnail).
- Mobile menu: a full-screen overlay with Close at the top.
  - Search field first, then "FIND COLLEGES" as a direct link.
  - About / Plan / Apply / Pay as accordions.
  - The audience links sit in a tinted band.
  - Sign in / Create account buttons at the bottom.
- Plan (https://www.commonapp.org/plan) is a card landing page for orientation, with no dates.
- Prep checklists (https://www.commonapp.org/plan/your-path-to-college) are split by school year: 9th, 10th, 11th and 12th grade.
- Apply (https://www.commonapp.org/apply) has 4 numbered steps: Create profile → Add colleges → Gather requirements → Submit. First-year and transfer run as parallel tracks.
- Deadlines and requirements for each college live in the logged-in college list, not on the guide pages.

### Study in Denmark: https://studyindenmark.dk/ (fetched 2026-09-25)
- Home: tagline hero, then two big cards ("How to apply", "Scholarships"), testimonials, events.
- Programmes (https://studyindenmark.dk/portal): an H1, then ~85 words of prose that include a notice that the site is being revised, then one free-text box with example queries. There are no facets. Results were still "Loading" after 10 s. **Anti-pattern:** the official national finder is a single text box plus a disclaimer.
- How to apply (https://studyindenmark.dk/study-options/how-to-apply) is one long page in time order:
  - Before applying (general, specific and language requirements).
  - The application process, via optagelse.dk.
  - Things to remember.
  - Deadlines: plain dates (15 March 12:00 CET, 5 July, 28 July), each labelled by applicant group.

### Study in NL: https://www.studyinnl.org/ (fetched 2026-09-25)
- Each nav item has a one-sentence description. The home page has four task cards: Financing your studies · Find a study programme · How to apply · Finding a place to live.
- Studyfinder (https://www.studyinnl.org/dutch-education/studies):
  - A coloured hero with the H1, one 14-word sentence and a search box.
  - Directly below: "1531 programmes (of 1531)" and sort.
  - **No prose between the filters and the first result.**
  - Left sidebar of facets with counts: Type of programme, Field of study, Scholarships, City, Type of institution, Institutions. Long lists have their own search box and "Show all".
- Explanations: a "?" button next to a facet heading opens a dismissible popover of about 35 words. There are no paragraphs of explanation inline.
- Card: title, institution with logo, level, city, duration. "Show more" loads the next batch.
- Mobile (375 px):
  - Header: logo, search icon and a "Menu" button with a text label.
  - The menu is a right-hand drawer with the same 8 items, each with an icon.
  - The breadcrumb shrinks to a single "‹ Dutch education" link.
  - The facets become one full-width "Filter" button. It opens a full-screen sheet whose sticky footer button shows the live count ("1531 programmes").

### universityadmissions.se: https://www.universityadmissions.se/intl/start (fetched 2026-09-25)
- The header shows only Log in · My selection · Menu. The menu is a hamburger even on desktop.
- Key dates (https://www.universityadmissions.se/en/key-dates-and-deadlines/) are grouped by semester, and each date is labelled with the action it is for. One line says all deadlines are midnight CET.
- Entry requirements are split into general and specific. The subject rules sit in accordions and English has its own sub-page. IB is not mentioned.
- Search (https://www.universityadmissions.se/intl/search):
  - H1, then a bar with the Semester dropdown first and a keyword box second. No prose.
  - Left "Filter" sidebar with "Reset (n)" and "?" info buttons on Level, Distance, Start period and Pace.
  - "Showing 2,224 results for Spring 2027" and sort.
- Card:
  - Title and a heart that saves to "My selection".
  - **A status dot with "Application period: 15 Sep - 15 Oct"**, or "Open/Closed for late application".
  - University, credits, pace, location.
  - "Show more" expands the card in place: tuition with the note "EU/EEA citizens are not required to pay fees", dates, level, language, code.

### DAAD International Programmes: https://www2.daad.de/deutschland/studienangebote/international-programmes/en/ (fetched 2026-09-25)
- The H1 is followed by about 200 words of intro before the filters. The filters are stacked above the results (type, language, subject group, fees, start). "About this database" comes below and links to pre-filtered popular searches.
- **Anti-pattern:** the long intro pushes the search below the fold.

### Unifrog: https://www.unifrog.org/international-schools (fetched 2026-09-25)
- The public site is marketing only; the student platform needs a login. The schools page describes the tools in stage groups: Quizzes → Exploring → Recording → Searching and Applying → Materials.
- University search is split into separate tools by region: UK, Oxbridge, US, European (English-taught), Canadian, Asian, and others.
- Students can record a "Plan A and Plan B" and track all applications in one list. IB students at the school may already know this model.

## 3. Patterns to borrow

1. **No prose between the filters and the first result.** Put at most one sentence under the H1, then the count, then the cards. (Study in NL Studyfinder, Common App Explore, universityadmissions.se. DAAD's 200-word intro and Study in Denmark's 85 words are the counter-examples.)
2. **Explain a filter with a "?" popover next to it**, about 35 words and dismissible, and link to a guide page for detail. This is where eligibility text for "check my subjects" should go. (Study in NL, universityadmissions.se; UCAS uses a separate entry-requirements-filter page with a plain caveat.)
3. **Say the count out loud**, for example "54 bachelor's in Denmark" or "Showing 2,224 results for Spring 2027", and have it reflect the current filters. (Bachelorsportal H1, universityadmissions.se, Study in NL.)
4. **Mobile filters: one "Filter" button opens a full-screen sheet, and its sticky footer button shows the live count.** Mobile menu: a button labelled "Menu" (not just an icon) that opens a drawer or overlay with search at the top. (Study in NL; Common App's mobile overlay.)
5. **Put deadline status on each result card**, e.g. a status dot plus "Application period: 15 Sep – 15 Oct" or "Open for late application". Details expand inside the card, including the "EU/EEA pays no fees" note. (universityadmissions.se.)
6. **Make deadlines a top-level destination with dated, action-labelled rows** grouped by intake, with one line fixing the time zone (e.g. "midnight CET"). This maps directly to the IB Pathways calendar. (universityadmissions.se "Key dates and deadlines"; Study in Denmark lists exact dates for each applicant group. Bachelorsportal's vague "usually summer" is the anti-pattern.)
7. **Name nav items as short verbs in journey order**, e.g. Find → Plan → Apply, with audience links (teachers/parents) kept in a separate, visually distinct band. (Common App: Find Colleges · Plan · Apply · Pay; UCAS Applying sub-items in time order.)
8. **Split preparation by school year** (Common App's 9th–12th grade checklists). For IB this would be DP1 / DP2 pages for subject choice, EE, CAS and then application.
9. **Present regions as parallel doors** that share one finder and one set of filter state, e.g. tabs or pills for Denmark | Europe | Worldwide, with a count on each. (Unifrog's per-region search tools; Bachelorsportal's Programmes | Universities | Scholarships tabs over the same filters.)
10. **Put a short sentence under each top-level section and give the home page task cards** such as "Find a programme" and "How to apply". (Study in NL home page and nav descriptions; Study in Denmark home page cards.)

Anti-patterns to avoid:
- A finder that is only a text box, with a "being revised" notice (Study in Denmark).
- Paid "Featured" results mixed into the results (Bachelorsportal).
- Long intro text above the search (DAAD).
- Deadlines described in words rather than dates (Bachelorsportal country pages).
- Eligibility caveats hidden. UCAS states its IB/EU gaps plainly; copy that honesty.
