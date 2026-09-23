# Discover and Decide are scenes on one surface, not two modes behind a toggle

## What forced the decision

`docs/research/DYNAMIC_SITE_INSPIRATION.md` makes one central recommendation
and calls it "the best synthesis": **two synchronized modes over one query
state.** Discover mode is the cropped world window, the inviting prompt, the
illuminated clusters, the curated journeys and a handful of broad filters.
Decide mode is the stable filter rail, the result list, the comparison tray,
the requirement-by-requirement fit and the dated sources. A student moves
between them without losing filters, selections, scroll context or
comparisons. `docs/EXPERIENCE_PRINCIPLES.md` repeats it under "The two ways
through".

We built one surface. `/programmes/` is a world window, a filter rail, a live
count and a list, all driven by `src/assets/js/explorer.js`, which holds a
single `state` object and drives the URL, the map, the counts and the list from
it. Nothing anywhere offers a mode switch, and nobody decided not to build one
— it simply never got built, which is the worst way for an architecture to
arrive. Issue #18 asks for the answer to be made deliberate.

## The decision

**There is one exploration surface. Discover and Decide are scenes within it,
in that order, sharing the one query state that already exists.**

A page opens on the discovering end of the surface — a camera, lights, a count,
broad questions — and continues, in the same scroll, into the deciding end:
filters, the list, requirements, sources. There is no mode control, and the two
ends are not two renderings of the state. The list is the state; the map is
drawn *from* the filtered list, which is why they cannot disagree.

The **first choice** may be made before the surface is reached. A
`filterQuestion({ type: 'links' })` is the same student-facing question as a
filter control, asked where there is no query state yet — on the home page —
with each option carrying the URL that sets the canonical field. The explorer
reads that field out of the URL on load and shows it as a removable chip. So
"Discover" can begin on a page that has no JavaScript at all and hand the
student to "Decide" with their first answer already applied.

## Why not the two modes the research asked for

**Two modes are two renderings of one state, and this repository has been
burned by that twice in the last month.** The explorer used to draw its own dot
cloud — its own projection, its own bounding box, its own graticule — so
Denmark was a different shape there than on its own page; that duplicate was
deleted in #12. The calendar filtered itself correctly, reported "16 of 269
dates" and rendered all 269, because `[hidden]` sits at the bottom of the
cascade. Both are the same failure: a second surface that believed it was
showing the same thing and was not. A mode switch is an invitation to build a
third.

**The dataset is not large enough to need one.** Climate TRACE, which the
research doc takes the pattern from, coordinates a global emissions inventory
where no list could ever be read end to end, so a map-first mode earns its
keep. Denmark's English-taught catalogue is thirty-seven Opportunities across
eight institutions, and the Destination set is thirty-five countries. The
entire result set fits on one screen at a scroll. A mode switch would be
ceremony around a list a student can already see.

**A mode is a thing you can be in the wrong one of.** The failure state of two
modes is a student who is in Discover looking for a deadline, or in Decide
looking for somewhere they had not thought of, and who has to learn the
product's own vocabulary to get out. The failure state of one surface is a long
page, which is what the rest of this site already is and what students already
know how to read.

**The accessibility contract does not survive a mode switch cheaply.** A mode
control has to preserve filters, selection, scroll position, focus and the
route back, announce the change, and behave with JavaScript switched off. The
last of those is the expensive one: a mode control that only works with the
script on makes the no-script experience a third thing, and the site's promise
is that the serious admissions experience is fully functional without the
animated world.

## What this commits us to

The recommendation is not abandoned; the parts of it that were doing the work
are kept and the mode switch is dropped.

- **One canonical query state, serialized in the URL.** Already true in
  `explorer.js`; every constraint is a removable, human-readable chip.
- **Every surface describes the same current selection.** The map is painted
  from the filtered list, never filtered separately.
- **The discovering end comes first on the page and the deciding end follows.**
  A page may open on a camera, but the filters and the list are always reachable
  in one scroll and never behind a control.
- **The first choice can be asked anywhere**, as a link that sets a canonical
  field, and must arrive at the surface as a visible, removable constraint.
- **Curated journeys are chapters, not a mode.** `mapChapter()` carries the
  editorial half of Discover — a question, a camera, a scope sentence, one way
  in — and links into the surface rather than being a separate way of using it.

## When to revisit

Two things would overturn this.

**Scale.** If the Opportunity set reaches a size where the list stops being
readable end to end — the research doc's own benchmark is a map that must
cluster because one DOM node per record is untenable — then a map-first mode
starts earning the synchronization cost it imposes.

**A globe.** Issue #19 proposes one. A WebGL surface is not something a student
scrolls past on the way to a filter rail; it needs a viewport, and a viewport
it does not always own is a mode in everything but name. If #19 lands, this
decision is the first thing it has to argue with.
