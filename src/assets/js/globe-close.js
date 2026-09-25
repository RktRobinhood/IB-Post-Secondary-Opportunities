/* The close half of the globe: MapLibre, from the altitude where the
 * hand-written globe's textures run out down to campus level. ADR 0005.
 *
 * `globe.js` owns the camera from space. When the reader comes down below a
 * handoff altitude it asks this module for a map, sets it to exactly the same
 * centre, scale and pitch, and cross-fades to it; when the reader zooms back
 * out past a slightly higher altitude it takes the camera back. The two are
 * meant to feel like one dive: same projection (MapLibre's globe), same pitch,
 * same point of the frame for the centre, the same pins and cards on top.
 *
 * Nothing here is loaded on first paint. The library (vendored, see
 * assets/vendor/maplibre-gl/README.md) and the tiles are fetched only when a
 * reader comes close. The tiles:
 *
 *   - satellite, EOxCloudless Sentinel-2 2024 (non-commercial use with
 *     attribution), strongest where it continues the Blue Marble from above;
 *   - the OpenFreeMap "liberty" street map (OpenStreetMap data), which comes
 *     through as the satellite fades out towards street level.
 */

const STYLE = 'https://tiles.openfreemap.org/styles/liberty';
const SATELLITE = 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/{z}/{y}/{x}.jpg';
const SATELLITE_CREDIT =
  '<a href="https://cloudless.eox.at/" target="_blank" rel="noopener">EOxCloudless 2024</a> by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2024)';

let library = null;

/** The library, once, from the vendored copy beside this file. */
function loadLibrary(assets) {
  if (window.maplibregl) return Promise.resolve(window.maplibregl);
  if (!library) {
    library = new Promise((resolve, reject) => {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = String(new URL('vendor/maplibre-gl/maplibre-gl.css', assets));
      document.head.append(css);
      const js = document.createElement('script');
      js.src = String(new URL('vendor/maplibre-gl/maplibre-gl.js', assets));
      js.async = true;
      js.onload = () => (window.maplibregl ? resolve(window.maplibregl) : reject(new Error('maplibregl missing')));
      js.onerror = () => reject(new Error('the map library did not load'));
      document.head.append(js);
    });
    library.catch(() => { library = null; });
  }
  return library;
}

/** The street style with the satellite slid in under the roads and labels. */
async function style() {
  const st = await fetch(STYLE).then((r) => {
    if (!r.ok) throw new Error(`style ${r.status}`);
    return r.json();
  });
  st.sources.satellite = { type: 'raster', tiles: [SATELLITE], tileSize: 256, maxzoom: 14, attribution: SATELLITE_CREDIT };
  /* Under the first road or building layer: fills (water, parks, land use)
     sit beneath the satellite and show through only as it fades. */
  let at = st.layers.findIndex((l) => ['transportation', 'building', 'aeroway'].includes(l['source-layer']));
  if (at < 0) at = 1;
  st.layers.splice(at, 0, {
    id: 'satellite',
    type: 'raster',
    source: 'satellite',
    paint: {
      /* Full until the street map has faded in (13.5), and handed over by
         14.5: the Sentinel source stops at z14, and overzoomed beyond that it
         is milky rather than sharper (round 3). */
      'raster-opacity': ['interpolate', ['linear'], ['zoom'], 12.5, 1, 13.5, 0.8, 14.5, 0.3, 17, 0.2],
      /* The globe arrives a little stylised (round 4: brighter, more
         saturated, flatter); the photograph starts the same way and settles
         to itself by city zoom, so the dive does not jump from cartoon to
         photo in one frame. */
      'raster-saturation': ['interpolate', ['linear'], ['zoom'], 5, 0.22, 11, 0],
      'raster-contrast': ['interpolate', ['linear'], ['zoom'], 5, 0.08, 11, 0],
      'raster-brightness-min': ['interpolate', ['linear'], ['zoom'], 5, 0.06, 11, 0],
      'raster-fade-duration': 120,
    },
  });
  /* No cream. The style's opaque background painted every not-yet-loaded
     tile cream when the camera went up (Reset, wheel-out, climb-out). Below
     street level it is transparent, so the globe — still drawing underneath
     at the same camera — shows through instead; at street level, where the
     warm-up has loaded the tiles, it is the street map's ground again. */
  const bg = st.layers.find((l) => l.type === 'background');
  if (bg) bg.paint = { ...(bg.paint || {}), 'background-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0, 14.5, 1] };
  /* Suburb and village names from 13, not 8–9: at city zoom they buried the
     place the student chose under italic clutter (round 3). */
  for (const l of st.layers) {
    if (l['source-layer'] === 'place' && /^label_(other|village)$/.test(l.id)) l.minzoom = Math.max(l.minzoom || 0, 13);
  }
  /* Satellite first, street map only near the ground. Below zoom 9.5 the
     reader is looking at a region from above, and a road atlas over the
     imagery made the handoff look like a different app (round 2) — and cost
     most of the bytes, since vector tiles for zooms 5–9 load whether or not
     the satellite covers them. So every vector layer starts at 9.5, and the
     3D buildings only at street level, where they are worth their frame time. */
  const OPACITY = { fill: ['fill-opacity'], line: ['line-opacity'], symbol: ['text-opacity', 'icon-opacity'], 'fill-extrusion': ['fill-extrusion-opacity'] };
  for (const l of st.layers) {
    if (l.source === 'satellite' || l.type === 'background') continue;
    l.minzoom = Math.max(l.minzoom || 0, l.type === 'fill-extrusion' ? 15 : 9.5);
    /* …and it fades in over 12–13.5 instead of snapping on: the street map
       arriving all at once at the end of a dive was round 3's pop. Only
       constant opacities are wrapped (a zoom expression must stay top-level);
       the few zoom-driven ones are left as the style wrote them. */
    for (const prop of OPACITY[l.type] || []) {
      const v = l.paint?.[prop];
      if (v !== undefined && typeof v !== 'number') continue;
      const from = l.type === 'fill-extrusion' ? 15 : 12;
      l.paint = { ...(l.paint || {}), [prop]: ['interpolate', ['linear'], ['zoom'], from, 0, from + 1.5, v ?? 1] };
    }
  }
  st.projection = { type: 'globe' };
  /* Beyond the horizon: nothing. The globe floats on the page (round 4), and
     it is still drawing underneath at the same camera, so its own halo is the
     horizon here too. */
  st.sky = {
    'sky-color': 'rgba(0,0,0,0)',
    'horizon-color': 'rgba(0,0,0,0)',
    'fog-color': 'rgba(0,0,0,0)',
    'sky-horizon-blend': 0,
    'horizon-fog-blend': 0,
    'fog-ground-blend': 1,
    'atmosphere-blend': 0,
  };
  return st;
}

/**
 * Make the close map inside `stage`, hidden, and resolve once it has drawn.
 *
 * @param {HTMLElement} stage
 * @param {object} o
 * @param {URL} o.assets          the site's /assets/ URL
 * @param {HTMLElement} o.before  the element the map goes underneath (the pins)
 * @param {boolean} o.coarse      a touch screen: two fingers move the map, one scrolls the page
 * @param {object} o.camera       { center:[lon,lat], zoom, pitch, padding }
 */
export async function createCloseMap(stage, { assets, before, coarse, camera }) {
  const maplibregl = await loadLibrary(assets);
  const container = document.createElement('div');
  container.className = 'world__close';
  container.setAttribute('aria-hidden', 'true');
  stage.insertBefore(container, before);

  const map = new maplibregl.Map({
    container,
    style: await style(),
    center: camera.center,
    zoom: camera.zoom,
    pitch: camera.pitch,
    bearing: 0,
    attributionControl: { compact: true },
    cooperativeGestures: !!coarse,
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
    keyboard: false,
    maxPitch: 60,
    maxZoom: 17.5,
    fadeDuration: 150,
    renderWorldCopies: false,
    /* Less work per frame on a phone, and a bounded tile cache on any
       machine: a school Chromebook is not a GIS workstation. */
    pixelRatio: coarse ? Math.min(window.devicePixelRatio || 1, 1.5) : window.devicePixelRatio || 1,
    maxTileCacheSize: 120,
  });
  map.touchZoomRotate.disableRotation();
  /* The street style names a few point-of-interest icons its sprite sheet
     does not carry. Give each an empty image rather than a console warning. */
  map.on('styleimagemissing', (e) => {
    if (!map.hasImage(e.id)) map.addImage(e.id, { width: 1, height: 1, data: new Uint8Array(4) });
  });
  map.setPadding(camera.padding);
  await new Promise((resolve, reject) => {
    map.once('load', resolve);
    map.once('error', (e) => reject(e?.error || new Error('map error')));
  });
  /* The compact attribution opens itself on load; on a phone it covered a
     fifth of the stage. Start it closed — the ⓘ opens it. */
  container.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show');

  /* Scale at the centre, measured rather than assumed: pixels per metre
     east-west through the centre, which neither pitch nor padding changes. */
  function pxPerMetre() {
    const c = map.getCenter();
    const d = 0.01;
    const a = map.project([c.lng - d, c.lat]);
    const b = map.project([c.lng + d, c.lat]);
    const metres = 2 * d * (Math.PI / 180) * 6371000 * Math.cos((c.lat * Math.PI) / 180);
    return Math.hypot(b.x - a.x, b.y - a.y) / metres;
  }

  return {
    map,
    container,
    pxPerMetre,
    /** Where a longitude/latitude lands on the stage, in CSS pixels. */
    project(lon, lat) {
      const p = map.project([lon, lat]);
      return { x: p.x, y: p.y };
    },
    /** The longitude/latitude under a stage pixel. */
    unproject(x, y) {
      const ll = map.unproject([x, y]);
      return { lat: ll.lat, lon: ll.lng };
    },
    /** Resolves once the tiles in view have loaded, or after `ms` regardless. */
    settled(ms = 2500) {
      return new Promise((resolve) => {
        if (map.loaded() && map.areTilesLoaded()) { resolve(); return; }
        const t = setTimeout(resolve, ms);
        map.once('idle', () => { clearTimeout(t); resolve(); });
      });
    },
    destroy() {
      map.remove();
      container.remove();
    },
  };
}
