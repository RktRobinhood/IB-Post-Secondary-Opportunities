# Application journeys and calendar

The product has three connected jobs:

1. **Discover:** reveal inspiring, credible Opportunities through an editorial atlas.
2. **Decide:** help a student understand academic, financial, practical, and personal fit.
3. **Apply:** turn selected Opportunities into applicant-specific routes, checklists, and a trustworthy calendar.

The Apply experience should remove procedural uncertainty without pretending to submit an application or replace the responsible admissions authority.

## Why applications need their own model

Geography, Institution, and application process do not align neatly. A national system may cover most undergraduate applications, a provincial system may cover one subset, an institution may accept direct applications, and a specific Programme may require a supplementary portfolio or test outside the central portal.

Model these relationships explicitly:

```text
Application Jurisdiction
  └─ Application System

Opportunity + applicant context
  └─ Application Route
      ├─ central or direct submission channel
      ├─ Application Round
      ├─ Submission Items
      ├─ Application Milestones
      ├─ supplementary Institution steps
      └─ Evidence

Exploration List + Student Profile + target Intake
  └─ Application Plan
      ├─ resolved routes
      ├─ deduplicated shared milestones
      ├─ personal target dates
      └─ calendar and printable exports
```

An Application System is never assumed to cover every Institution in its geography. An Opportunity can have multiple Application Routes, and the correct one can depend on qualification, residence, citizenship, current school location, applicant type, intended Intake, or whether the student is applying for first-year, transfer, deferred, or advanced entry.

## Application-system guide

Each shared system or direct-application category should have a guide answering:

- Who operates it and which Institutions or Opportunities it covers?
- Is it mandatory, optional, or one of several possible routes?
- Which applicant types and Intakes use it?
- How many choices are allowed, and must they be ranked?
- Can choices be changed, added, substituted, or withdrawn?
- Which information and documents go through the shared system?
- Which items must still go directly to the Institution?
- What fees, waivers, tests, references, predicted results, or result-release steps apply?
- Which deadlines are hard, priority, equal-consideration, rolling, or applicant-specific?
- How and when are decisions, replies, deposits, and final results handled?
- What is the official starting link and where can current rules be verified?

Walkthroughs should be step-based, dated for a target Intake, and generated where possible from structured route data. Avoid evergreen prose that quietly becomes wrong each year.

## Checklist design

A checklist item should contain:

- a short action written as a verb;
- the responsible party: student, school/counsellor, referee, testing body, or Institution;
- the Application Route and Opportunities it affects;
- prerequisite items and what becomes possible afterward;
- earliest useful start, personal target date, and official Deadline when applicable;
- Submission Items and accepted formats;
- where the action happens: shared portal, Institution portal, testing service, school, or other authority;
- official Evidence, last verification date, and target Intake;
- status: not started, waiting, ready, completed, not applicable, or needs review;
- notes that remain local by default.

Completing an item should not imply that the external portal received it. Use wording such as “mark complete in your plan,” and link the student to the authoritative system to verify submission status.

## Milestone and deadline semantics

Not every important date is a Deadline. Model at least:

- applications open;
- recommended preparation start;
- test registration and test date;
- equal-consideration or priority Deadline;
- final/hard submission Deadline;
- document, transcript, reference, predicted-grade, fee, portfolio, or audition Deadline;
- interview or audition window;
- decision release or expected decision period;
- applicant reply Deadline;
- deposit, housing, scholarship, visa, results-release, and enrolment Milestones.

Each Application Milestone needs:

- a type and plain-language consequence;
- exact date and time when published, with authoritative time zone;
- start/end dates for windows;
- applicant group, Application Round, Intake, and affected Opportunities;
- whether it is hard, priority, equal-consideration, rolling, indicative, or personal;
- source, retrieval date, effective period, and Verification State;
- update behavior and a note when the date is based on a previous cycle.

Store date-only deadlines as date-only values. Do not invent midnight. When an authority publishes “by 18:00 UK time,” preserve both the local time zone and a display conversion for the student.

## Personal application plan

When a student promotes an Opportunity from the Exploration List into an Application Plan, the product should:

1. confirm the target Intake and the profile fields needed to resolve an Application Route;
2. explain why that route applies and expose unresolved assumptions;
3. merge central-system and Institution-specific steps;
4. deduplicate shared work, such as one portal account or common personal statement;
5. show dependencies and the next useful action;
6. separate official Deadlines from suggested personal target dates;
7. highlight collisions, missing Evidence, and dates that precede predicted or final IB results;
8. keep the official submission and status check outside this product unless a future authorized integration is deliberately built.

Students should be able to see the plan as:

- **Next actions:** a short, calm list of what matters now;
- **Journey:** a dependency-aware vertical timeline;
- **Calendar:** month, agenda, and deadline views;
- **By application system:** shared portal work grouped once;
- **By Opportunity:** the complete route for one choice;
- **Print/export:** a counsellor-friendly checklist with sources and verification dates.

## Calendar interface

The calendar should be a derived view of the Application Plan, not a second store of dates. Filters should include Opportunity, Application System, milestone type, responsibility, status, and urgency.

Visual hierarchy should distinguish:

- official hard or equal-consideration Deadlines;
- official windows and result/reply dates;
- student-created target dates;
- stale, provisional, or previous-cycle dates;
- completed items and unresolved route assumptions.

Use colour plus icons and text; colour alone cannot carry urgency. Avoid anxiety-inducing countdowns and false precision. A calm “next consequential date” is more useful than a wall of red badges.

## Calendar export and connection

Start with open, low-risk interoperability:

- downloadable `.ics` for the complete Application Plan, one Application System, or one Opportunity;
- stable event identifiers so a later export can update rather than duplicate events where calendar clients support it;
- event title, local and student-display time zones, consequence, affected Opportunities, official URL, verification date, and product detail URL;
- printable checklist and agenda view;
- explicit “Add to calendar” actions for individual events.

A downloaded calendar file is a snapshot. The interface must say that changes on the website will not automatically update an already imported event.

Live subscribed calendar feeds can come later. They require stable private feed URLs, revocation, update semantics, and a privacy/security review. Direct Google, Microsoft, or Apple account synchronization requires explicit authorization, minimal scopes, disconnect controls, and careful handling of student data; it should not be required for core use.

Calendar reminders are convenience copies, not authoritative notices. Every exported event should point back to the official source and show when the date was last verified.

## Aesthetic direction

The Apply experience should feel like the practical chapter of the same beautiful journey, not a separate administrative product.

- Use routes, passport-stamp rhythms, unfolding itineraries, and geographic transitions as restrained metaphors.
- Let selecting an Opportunity draw its application route from place to system to Institution without implying that geography alone determines the process.
- Turn complex shared-system rules into short editorial chapters followed by a precise checklist.
- Celebrate meaningful preparation progress gently, without streaks, competition, or gamified pressure.
- Preserve the editorial imagery and sense of possibility on overview pages, then reduce visual noise as the student approaches a Deadline or checklist task.

## Important edge cases

- One central portal submission plus a separate Institution portfolio, test, or scholarship application.
- Different Deadlines for medicine, art, conservatoires, or highly selective Programmes.
- A shared system that is common but not mandatory.
- A portal whose coverage is provincial or state-based rather than national.
- A student eligible for two routes with different fees or Deadlines.
- Rolling admission with a final close date and earlier scholarship or priority dates.
- A Deadline defined by the applicant's local time, the authority's time zone, or date only.
- A deadline announced for the previous cycle while the new Intake is not yet published.
- A shared Deadline that affects several selected Opportunities and should appear only once in the plan.
- An institution changing or cancelling a Programme after the student exports the date.
- Final IB results, transcripts, or result-release authorization occurring after the application itself.

When the correct route or consequence is uncertain, show **Needs review** and direct the student to the responsible authority rather than guessing.

