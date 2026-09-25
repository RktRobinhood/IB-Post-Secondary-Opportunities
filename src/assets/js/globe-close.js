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
      'raster-opacity': ['interpolate', ['linear'], ['zoom'], 9, 1, 12.5, 0.8, 15, 0.35, 17, 0.2],
      'raster-fade-duration': 120,
    },
  });
  st.projection = { type: 'globe' };
  /* Beyond the horizon: the same night as the globe's own frame. */
  st.sky = {
    'sky-color': '#050a16',
    'horizon-color': '#27509c',
    'fog-color': '#0b1426',
    'sky-horizon-blend': 0.6,
    'horizon-fog-blend': 0.5,
    'fog-ground-blend': 0.85,
    'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 8, 0.8, 12, 0],
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
