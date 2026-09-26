# Globe textures

NASA imagery, public domain. Remade with `node scripts/make-globe-textures.mjs`,
which downloads the originals into `.cache/globe/` and writes the WebP files
here.

| File | Size | When the globe fetches it |
|---|---|---|
| `earth-day.webp` | 2048 x 1024, ~135 kB | With the first frame |
| `earth-clouds.webp` | 2048 x 1024 greyscale, ~302 kB | With the first frame |
| `earth-day-4096.webp` | 4096 x 2048, ~357 kB | Once the globe is showing and the browser is idle; replaces the 2048 |
| `earth-detail-europe.webp` | 4096 x 2048 over lon −25…45, lat 34…72, ~443 kB | The first time the camera comes down (altitude < 0.9) over or near that rectangle |
| `detail.json` | — | With the first frame: where the detail texture sits |
| `poster-discover-map[-dark].webp`, `poster-index-countries[-dark].webp` | 600 x 700 with alpha, ~56 kB each | In the HTML of home and /countries/ (the theme's one only): a still of that page's desk globe at rest, the first paint and the no-WebGL picture. Made from these textures by `scripts/make-globe-poster.mjs` (#53 round 2) |

So a page's first globe frame waits for ~437 kB of texture; a reader who dives
into Europe eventually loads ~1.2 MB in all.

## Sources

- **Day maps and the detail crop:** **Blue Marble: Next Generation, July 2004**
  (true colour land surface and shallow water, no topography or bathymetry),
  NASA Earth Observatory / Reto Stöckli, NASA Goddard Space Flight Center.
  Master: <https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74092/world.200407.3x21600x10800.jpg>
  (21600 x 10800 JPEG, ~60 pixels a degree). Record:
  <https://visibleearth.nasa.gov/images/74092>. July, because December has
  Scandinavia under snow, which reads as cloud.
- **Clouds:** **Blue Marble clouds** (combined cloud layer), NASA Goddard Space
  Flight Center / Visible Earth. Original:
  <https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/cloud_combined_2048.jpg>
  (2048 x 1024 JPEG, the largest published). Record:
  <https://visibleearth.nasa.gov/images/57747>.

All are equirectangular (plate carrée): longitude −180 at the left edge,
latitude +90 at the top. The detail crop is the same projection over its own
rectangle, stated in `detail.json`.

## Licence

NASA imagery is not protected by copyright in the United States unless noted
otherwise ("NASA Images and Media Usage Guidelines",
<https://www.nasa.gov/nasa-brand-center/images-and-media/>). Neither record
carries a notice. Credit is requested, not required, and is given on the
site's credits page (`/credits/#globe`) and here: *NASA Earth Observatory /
NASA Goddard Space Flight Center, Blue Marble.* NASA's name and insignia are
not used to imply endorsement.

## Why these sizes (round 1)

The first budget was "at most 2048 x 1024 and a few hundred kB", and the
critic found the closest zoom a smear: one texel of a 2048 map is 20 km, which
at the closest camera covered 40–65 screen pixels. The owner moved the budget
to make it look good, on the condition that the first load stays sensible:

- the **first frame** still waits only for 2048 x 1024 maps (~437 kB);
- the **4096 day map** doubles the density everywhere, fetched in idle time;
- the **Europe detail** crop is ~57 pixels a degree, five times the 2048 map,
  where most Destinations are, and only for a reader who zooms in there;
- the **clouds** are 2048 x 1024 at quality 82 with a 0.6 px pre-blur, because
  the lossy 1024 version showed WebP's 4 x 4 blocks as square cloud tufts.

`scripts/test-map.mjs` holds the budget: first-load maps ≤ 2048 x 1024 and
< 500 kB together; lazy maps ≤ 4096 x 2048 and < 600 kB each, and the engine
must still load them lazily.
