# The flat map is removed: the globe is the only map, and the list is the fallback

Supersedes the flat-map parts of [ADR 0004](0004-the-world-window-stays-flat.md)
and [ADR 0005](0005-the-world-window-becomes-a-globe.md): "the flat SVG is still
the first paint, the no-JavaScript map and the no-WebGL map" (0005, "Bytes and
first paint") and `map-flat.js` as the fallback. The rest of 0005 stands.

## What forced the decision

The owner, on issue #53, 26 September 2026:

> there seems to be a bug right now where when the page loads I see the old
> map load and then I see it getting replaced by the Globe so for efficiency
> sake let's take out the code for the Old map entirely and then just use this
> globe interface that we have

That was not a bug but the design 0005 recorded: the build-time flat SVG was
the first paint, and the globe cross-faded it out once its first frame was
drawn. What the owner saw was two different maps, one after the other, on
every page with a globe. In the same notes he asked for the globe to float on
a transparent background in both themes, for the card on the globe to be a
link, for country lights at a country's middle, and for a big country to open
into its schools as you zoom in.

## The decision

**There is one map, the globe. There is no flat map anywhere.**

- `worldWindow()` writes an empty, transparent stage the size the globe will
  be (so nothing on the page moves when it lands), the places as JSON for the
  globe, the list, and one line, hidden until needed: "This browser cannot
  draw the globe. Every place is in the list below."
- The generator code (the inline SVG, the projection and framing, the baked
  coastline paths), the flat interaction layer `map-flat.js` (780 lines) and
  the flat map's CSS (sea, land, markers, groups, spider legs, callouts) are
  deleted. `data/geo/countries.json` stays: the globe draws its borders and
  picks countries from it, and the build's country check reads it.
- **Where the globe cannot run the list is the map.** JavaScript off (the head
  script sets `data-js` before first paint), no WebGL, a context the browser
  refuses or later loses, a software renderer, frames the machine cannot keep
  up with, or the globe failing to load: the figure is marked
  `data-globe="off"`, the stage is not shown, the line above is, and a folded
  list opens. Nothing different is drawn in the globe's place. `?map=off`
  forces this for testing (it replaces `?map=flat`).
- The stage has no background and no border, and the home page's band is the
  page's own paper in both themes rather than a night sky: the globe floats.

## What this costs, stated plainly

- A reader without JavaScript or WebGL, or on a machine that would draw the
  globe in software, gets a list and no picture at all. 0004's flat map worked
  everywhere; this does not. The refusal of software renderers and slow frames
  is kept on purpose — a globe at 12 frames a second is worse than the list —
  so a school laptop without a GPU now sees the list where it used to see the
  flat map. If that turns out to be many students, the answer is a static
  still of the globe in the stage for that case, not the flat map back.
- Until the globe's first frame (the first-load textures, about 0.5 MB) the
  stage is empty paper. That is the owner's choice over a first paint that is
  a different map.
- The per-page HTML is smaller: the inline coastline was up to tens of
  kilobytes a page.

## Also decided with it (#53)

- **The card is the link.** A place's or a country's card on the globe is one
  link, in its title, stretched over the whole card; the close button and a
  country card's list of places sit above it and stay buttons. Nothing
  interactive is nested in the link.
- **A country's light is at its middle.** It was the medoid of its places
  (ADR 0005, round 1), which is a campus: Detroit for the United States. It is
  now the visual centre of the country's own outline (Natural Earth 50m): the
  area centroid of its main land when that is well inside it, otherwise the
  nearest point to it that is (`src/lib/geo.mjs` `visualCentre`). Kansas for
  the United States, northern Manitoba for Canada, the middle of Australia.
- **Country → schools.** A country's light carries the institutions inside it
  that have a position and a page. Far out it is one light at the country's
  middle; once the camera is close to that country (its schools would spread
  over more than half the stage, or the camera is down at the altitude a
  chosen place is flown to) it gives way to one pin per institution, which
  group and split with the zoom like Europe's places, and each opens a card
  that links to the institution's page.

## Guards

`scripts/test-map.mjs` (the gate's `map` check): no SVG and no basemap in
`worldWindow()`, no `map-flat`; the stage is empty and keeps its size; the
stage is transparent and borderless and nothing holding the globe paints a
dark background; the stage is hidden only with the globe off or JavaScript
off, and the line shows then; the card is one stretched link with nothing
nested; every country light is at least a third as deep inside its country as
the country's deepest point; every institution with a position rides on its
country's light and the globe opens it.

## Round 2 (26 September 2026, after a 7/10 critique and the owner's phone notes)

- **The still of the globe.** Home and `/countries/`, which rest on the desk,
  carry a still of their own desk globe at rest (`scripts/make-globe-poster.mjs`,
  ~56 kB WebP per theme) in the stage from the first paint, placed where the
  globe will be drawn. The globe lands on its own picture. This is not a
  second map, so it does not reopen the decision above; it answers "no WebGL
  means no picture" for those two pages, where the still stays and the list
  stays one tap away. Other pages still show no stage without the globe.
- **The globe stays a sphere.** The stage is rounded and its imagery feathers
  into the paper; a country's, a region's or a group of countries' arrival
  stops at `sphereAlt()`, where the limb and paper are still in view. Only a
  dive onto schools or a campus fills the stage.
- **A card is the link, drawn once.** No visible "Open … →" line; no folded
  first card replaced by a full one. On a phone the card is a sheet below the
  stage and the buttons a row above it.
