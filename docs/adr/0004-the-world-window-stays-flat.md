# The world window stays flat: a globe spends two-thirds of the panel on fidelity the task never uses

> **Superseded by [ADR 0005](0005-the-world-window-becomes-a-globe.md)** on
> 24 September 2026. The site owner overruled this decision and asked for a
> rotating, flyable 3D globe; 0005 records how that build answers each cost
> measured here. The measurements below stand as measurements.

## What forced the decision

Issue #19 asks for a rotating, flyable 3D globe — "the thing a student remembers
about the site". It also, to its credit, refuses to assume the answer:

> **Is 3D actually better here?** A globe is worse than a flat map for comparing
> European Destinations, which is most of what our students do. It may be right
> for arrival and for the worldwide view, and wrong for the decide-mode
> explorer. Prototype before committing.

`docs/research/DYNAMIC_SITE_INSPIRATION.md` states the test the prototype has to
pass, and it is not a test about looks:

> The prototype decision is not "does the globe look impressive?" It is "does
> geographic motion help a student discover and understand a credible option
> faster than a static map, without weakening accessibility, evidence, or
> performance?"

Two things have changed since #19 was written, and both raise the bar. #12 and
#26 landed, so the flat window is no longer a dot cloud waiting to be replaced:
it has real coastlines at a measured 3.36:1 contrast, a keyboard camera,
clustering, spiderfying, pinch and double-tap zoom, and a responsive panel with
44px targets. And ADR 0003 decided there is one exploration surface rather than
two modes — while naming the globe as one of the two things that could overturn
it, because "a WebGL surface … needs a viewport, and a viewport it does not
always own is a mode in everything but name."

So the question was never "can we build a globe". It was whether a globe pays
for itself against a flat map that already works.

## What was built and measured

`prototypes/globe/` — a throwaway vertical slice, self-contained, not wired into
`src/build.mjs` and not shipped. The source is committed because a prototype
whose code is deleted cannot be re-examined when someone reopens this in six
months, and `prototypes/globe/NOTES.md` carries every number below with the
method that produced it.

It is the research doc's six requirements, built on real records: 155 real Place
records across the 15 real Destination records and three regions, on
`data/geo/countries.json` unchanged; a semantic list over the same records;
three filters over real Destination fields updating map, count and list in one
pass; bidirectional marker/list focus and a detail panel resolving real Evidence
records; normal, reduced-motion and no-canvas modes; mobile and keyboard from
the first commit. Both engines live in the one page — a hand-rolled orthographic
globe on a 2D canvas, and the shipped flat map's exact camera, which is one SVG
`transform` attribute — so the two are timed doing the same job.

The engine was hand-rolled first, as #19 asked, and it worked. A vertex's
position on the unit sphere never changes, so the trigonometry is paid once at
load (1.5 ms for 5,904 vertices) and a camera move becomes a nine-number matrix
multiply per vertex. A full redraw costs **0.45–1.01 ms**. At the 4–6x multiplier
a mid-range Android deserves against the machine this was measured on, that is
around 6 ms against a 16.7 ms frame budget. **Compute is not the argument.**

Nor is distortion, which was the expected argument and did not survive contact
with a measurement. Across the 75 European places the worst radial compression
from the European centroid is **0.973** and the median is **0.997**. A globe
centred on Europe does not distort Europe.

What the globe costs is the panel.

An orthographic disc fitted to the 960x460 stage occupies **33.3%** of it. Two
thirds of a wide map panel is thrown away on the corners outside the circle. Put
usefully: Europe subtends 13.4 degrees from its own centroid, so on the globe at
rest it is a **63 x 72 px** blob; the same 75 places on a flat map of the same
scope in the same panel are **91 x 106 px**, and on the Europe framing `/europe/`
ships today they are **960 x 460**. To draw Europe as large as the flat map
already draws it, the globe must zoom to k = 4.6, at which point the disc is
1,989 px across in a 460 px panel and the horizon has left the screen. **The
sphere is only legible as a sphere at the zoom levels where the content is too
small to compare.** On a 375px phone it is worse and quieter: the stage is
343 x 455, the 75 European places become a **47 x 53 px** blob, and the filters
and the count fill the first screen, so the globe is below the fold — paid for
before it is seen.

Occlusion is the other cost, and it has a number. A greedy hemisphere cover over
the filtered set says how many camera positions it takes to see a result set at
all:

| Filter | Results | Globe camera positions | Best single position | Flat map |
|---|---|---|---|---|
| Everything | 155 | 3 | 131 (85%) | 1 (100%) |
| Europe | 75 | **1** | 75 (100%) | 1 (100%) |
| Outside Europe | 80 | 3 | 56 (70%) | 1 (100%) |

Which is the finding underneath the finding. **For the site's most common task
the globe never needs to move at all** — every European place is co-visible from
one camera, so the camera move that was supposed to justify the globe does not
happen on the pages where the students are. The move only earns its keep on the
worldwide view, which is the smaller half of the catalogue and the half a Danish
IB student reaches last.

Occlusion also breaks the keyboard in a way the flat map cannot. Focusing a list
entry lights its marker; on a flat map a marker is either on screen or the
caption says it is outside the frame; on a globe it can be behind the planet.
At the default camera, **52 of 155 list entries (34%)** highlight a marker nobody
can see. The fixes are to fly the camera on every focus move — motion that
explains nothing, which the research doc forbids — or to teach a new concept
called "behind the globe" that the flat map never needed.

Bytes, finally. A globe needs the whole world every time, because it can be
rotated to any of it: **26,576 bytes gzip** of geometry, against the **12,684**
the `/europe/` page inlines today for the only coastline it will ever show, plus
**5,082** for the engine before any of `map.js`'s clustering is reimplemented.
And the geometry moves from "already in the HTML" to "a second request that must
land before anything is drawn". Two runs of the same page on the same machine
put the first globe frame at **81 ms** and at **3,389 ms**, against
`domInteractive` at 28 ms and 138 ms. The slow run is an uncompressed local
fetch and is not a production figure; it is the shape of the risk stated loudly.
The flat map is on screen at `domInteractive` whatever else happens, because its
coastline is in the HTML. Only one of the two engines can vary at all.

Everything the constraints demanded, the prototype did meet. No canvas falls
back to the build-time flat SVG with filters, count and list intact. Reduced
motion arrives at the exact target camera in **5.1 ms** with no journey. Nothing
is drawn by script on first paint. No marker is focusable, so the list stays the
one control surface. The wheel does not zoom. None of that is in dispute; it is
just not enough.

## The decision

**The world window stays flat. The globe does not ship — not on the explorer,
not on the home page, not now.**

Issue #19 is declined as specified, and the reason is not that a globe is hard.
The hand-rolled orthographic engine works, it is fast, it degrades correctly and
it is 5 KB. The reason is that a globe buys area fidelity and a rotation, and
this product's most common task uses neither: a student comparing four European
Destinations compares entry requirements, fees and deadlines, and pays for the
globe in panel area, in a second request, and in a third of the list highlighting
nothing they can see.

**ADR 0003 therefore stands, and stands harder than before.** The globe was one
of the two things named as able to overturn it. It was prototyped on the same
terms — one query state, the list as truth, the map painted from the filtered
list — and it did not. A surface that needs a square viewport to be legible, and
that is illegible at the zoom where the content is comparable, is exactly the
viewport-owning mode 0003 declined to build.

**Where a globe would be right, if the catalogue ever earns one**, is the
worldwide arrival and nowhere else: a home-page chapter whose whole job is "this
is bigger than Denmark", on a square panel, above a count and a list that do the
work. That is the "here and not there" answer, and it is recorded rather than
built, because today 53 of 53 Opportunity records are Danish and a globe
advertising a worldwide catalogue we do not have is the kind of picture this
repository exists to refuse.

## The alternative that was rejected, and why

**Reach for a library and try again.** Globe.gl, three.js, or MapLibre's globe
projection would all remove the one thing the hand-rolled version genuinely
could not do: clip a filled polygon to the limb correctly. Measured over 72
camera positions, the simplified clipper in `globe.js` falls back to outline-only
on a mean of **2.6 visible rings per frame** out of 158.6, worst case 10 — Eurasia,
Africa and Antarctica, the rings that wrap more than half the disc. That is a
real defect and d3-geo's clipping is the real fix.

It was rejected because **it fixes the only limitation that did not matter.**
Every number that argues against the globe — 33.3% of the panel, 63 x 72 px,
three camera positions, 34% silent highlights, the whole world in the payload —
is a property of an orthographic projection, not of this implementation. A
library makes the coastlines correct and makes all of those slightly worse, since
the smallest credible WebGL globe is tens of times the 5 KB this one cost and
takes the no-WebGL fallback story with it. #19's own instinct was right: the
hand-rolled version is the cheap way to find out, and what it found out is that
the ceiling is the projection.

Two smaller alternatives were also considered and rejected. **A globe on the home
page only** still ships the whole-world geometry and the engine to every arriving
student for a picture that is below the fold on a phone, and it splits the map
grammar in two so that `worldWindow` means something different on one page than
on every other — the duplicate-surface failure ADR 0003 was written about.
**A globe behind a toggle** is a mode with extra steps, and every accessibility
cost above arrives with it, plus the cost of making the toggle itself work
without script.

## What would change this

**A catalogue that is actually worldwide.** Today the Opportunity set is 53
records, all Danish, and 75 of the 155 Places in the prototype are European. If
Opportunities reach a spread where the worldwide view is a real destination
rather than an aspiration — and the greedy cover over the *Opportunity* set, not
the Place set, needs more than one camera position — then the arrival case comes
back and should be reopened with this prototype rather than from scratch.

**A panel that is square.** Every number above is partly a consequence of a
960 x 460 stage. A design where the map panel is square, or is a full-bleed
background rather than a figure in a column, changes the 33.3% and changes the
argument. If someone proposes that layout, re-run `prototypes/globe/build.mjs`
and measure it rather than reasoning about it.

**A task that is about distance or region rather than requirements.** "What is
near me", "how far is this from home", "what else is on this side of the world"
are tasks a globe answers better than a flat map, and the site does not ask any
of them today. If a Preparation or Decision surface starts asking them, the
fidelity stops being decorative.

**Someone finding the prototype slower than the flat map for a real comparison,
in front of a real student.** Everything here is measured in pixels, bytes and
milliseconds, which is the honest half of the question. The other half is whether
a student remembers the site, and #19 is right that this matters. Nobody has put
either map in front of a sixteen-year-old yet. That is the evidence that would
overturn this fastest, in either direction.
