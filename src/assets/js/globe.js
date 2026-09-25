/* The world window as a globe. ADR 0005.
 *
 * Hand-written WebGL 1, no library. `map.js` imports this only once the figure
 * is near the viewport and only where WebGL exists; until then, and wherever
 * this throws, the build-time flat SVG is the map, so nothing here is ever the
 * only way to see a place.
 *
 * What it draws, back to front, every frame:
 *
 *   1. a fullscreen pass: space, stars fixed to the sky (so they turn with the
 *      camera), and the atmosphere's halo around the limb;
 *   2. the Earth: NASA's Blue Marble on a UV sphere, lit from over the viewer's
 *      shoulder, with a glint on water, a blue rim, and the chosen country
 *      tinted from a mask;
 *   3. country borders from data/geo/countries.json, faint, as GL lines;
 *   4. NASA's cloud layer on a slightly larger shell, drifting, fading out as
 *      the camera comes down so it never hides a pin;
 *   5. during a dive, the same clouds again in screen space, rushing past the
 *      camera and gone — the "through the clouds" moment.
 *
 * The pins are DOM, not GL: they use the site's own type and palette, they
 * carry labels, and they are `aria-hidden` and never focusable, because the
 * list under the map names every place, counts it, links it, and is already
 * the control. Everything a pin does, its list entry does.
 *
 * Motion explains a camera move and nothing else. Reduced motion — the
 * operating system's or the site's own toggle — makes every camera change
 * instant, stops the idle spin and the drift, and skips the cloud rush. The
 * reader still arrives; they just are not flown there.
 */

const root = document.documentElement;
const reducedMotion = () =>
  root.getAttribute('data-motion') === 'reduced' || matchMedia('(prefers-reduced-motion: reduce)').matches;

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
/* Vertical field of view: MapLibre's own default, so that when the camera is
   handed to the close map (globe-close.js) the perspective does not jump.
   Narrow enough to look like a globe, wide enough for a tilted horizon. */
const FOV = 36.87 * D2R;
const TAN = Math.tan(FOV / 2);
const MIN_ALT = 0.06;       // Earth radii above the surface: ~380 km. Closer, even the detail texture is magnified past reading
const MAX_ALT = 4.2;
const REST_MAX_ALT = 1.4;   // a page's resting camera never backs off further: big, cropped, not a small disc
const REST_MIN_ALT = 0.42;  // nor comes closer: at rest the horizon is in the frame
const HOME_REST_MIN_ALT = 0.2; // a single-country page rests on its country, not on a group of its places
const TRAVEL_CLIMB = 1.05;  // a journey of more than a hop climbs at least this high, above the cloud deck, so the dive goes through it
const HOP = 500 / 6371;     // …and "more than a hop" is 500 km of great circle
const PHONE_HOLD_MS = 4000; // a finger lets go of the globe this long after its last gesture
/* The close map (MapLibre) takes over below HANDOFF_ALT and hands back above
   HANDBACK_ALT — the gap between them stops a camera hovering at the boundary
   from flickering between the two. It is fetched once the camera is below
   CLOSE_PRELOAD_ALT, so it is usually ready by the time it is needed. */
const HANDOFF_ALT = 0.12;
const HANDBACK_ALT = 0.16;
const CLOSE_PRELOAD_ALT = 0.3;
const EARTH_M = 6371000;
/* How far in a place's dive goes once the close map has it, by how precisely
   the record places it: a campus to street level, a city to the city. A place
   known only to its country stays on the globe. */
const CLOSE_ZOOM = { campus: 15, institution: 15, city: 11.5 };
const FINE_ALT = 0.9;       // below this the finer border layer is fetched
const CLOUD_R = 1.012;
const BORDER_R = 1.0016;
/* Two pins closer than this on screen are drawn as one group. */
const PIN_GAP = 30;
/* The smallest thing a thumb can reliably hit. WCAG 2.5.8 asks for 24;
   Apple and Google both ask for 44. */
const TOUCH_TARGET = 44;
const LABEL_ALT = 2.5;      // below this, pins with room carry their names (a whole-world rest included)
const DPR_CAP = 2;

/** Camera pitch and lens shift grow as the camera comes down, so a close
    view shows the horizon curving across the top of the frame instead of a
    flat patch — and a far view is a whole, centred globe. */
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const pitchFor = (alt) => 40 * D2R * (1 - smooth(0.35, 2.3, alt));
const shiftFor = (alt) => -0.3 * (1 - smooth(0.45, 2.4, alt));

const toXYZ = (lat, lon) => {
  const la = lat * D2R, lo = lon * D2R, c = Math.cos(la);
  return [c * Math.sin(lo), Math.sin(la), c * Math.cos(lo)];
};
const toLatLon = (p) => [Math.asin(Math.max(-1, Math.min(1, p[1]))) * R2D, Math.atan2(p[0], p[2]) * R2D];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const angle = (a, b) => Math.acos(Math.max(-1, Math.min(1, dot(a, b))));
const wrapLon = (lon) => ((((lon + 180) % 360) + 360) % 360) - 180;
const clampAlt = (a) => Math.min(MAX_ALT, Math.max(MIN_ALT, a));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Spherical interpolation between two unit vectors. */
function slerp(a, b, t) {
  const w = angle(a, b);
  if (w < 1e-6) return a.slice();
  const s = Math.sin(w);
  const ka = Math.sin((1 - t) * w) / s, kb = Math.sin(t * w) / s;
  return norm([a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb]);
}

/* ========================================================================
   Shaders
   ======================================================================== */

const HIGH = 'precision highp float;\n';
const MED = '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n';

const SPHERE_VS = `${HIGH}
attribute vec3 aPos; attribute vec2 aUv;
uniform mat4 uVP; uniform float uR;
varying vec3 vN; varying vec2 vUv; varying vec3 vW;
void main() { vec3 p = aPos * uR; vN = aPos; vUv = aUv; vW = p; gl_Position = uVP * vec4(p, 1.0); }`;

const EARTH_FS = `${MED}
uniform sampler2D uDay; uniform sampler2D uMask; uniform sampler2D uDetail;
uniform vec3 uEye; uniform vec3 uSun; uniform vec3 uTint; uniform float uMaskOn; uniform float uSharp;
uniform vec2 uTexel; uniform vec4 uDetailRect; uniform vec2 uDetailTexel; uniform float uDetailOn; uniform float uPunch;
varying vec3 vN; varying vec2 vUv; varying vec3 vW;
/* An unsharp mask that works under magnification: the pixel against the mean
   of its four neighbours one texel away. (A blurrier mip level does nothing
   here — magnified, every LOD bias still lands on level 0.) */
vec3 sharp(sampler2D t, vec2 uv, vec2 texel) {
  vec3 c = texture2D(t, uv).rgb;
  vec3 b = (texture2D(t, uv + vec2(texel.x, 0.0)).rgb + texture2D(t, uv - vec2(texel.x, 0.0)).rgb
          + texture2D(t, uv + vec2(0.0, texel.y)).rgb + texture2D(t, uv - vec2(0.0, texel.y)).rgb) * 0.25;
  return clamp(c + (c - b) * uSharp, 0.0, 1.0);
}
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(uEye - vW);
  vec3 c = sharp(uDay, vUv, uTexel);
  /* The detail texture, where there is one, blended in with a soft edge.
     Sampled everywhere and weighted to nothing outside its rectangle, so no
     texture fetch sits in a branch. */
  vec2 du = (vUv - uDetailRect.xy) / (uDetailRect.zw - uDetailRect.xy);
  vec2 de = min(du, 1.0 - du);
  float dw = uDetailOn * smoothstep(0.0, 0.025, min(de.x, de.y));
  c = mix(c, sharp(uDetail, clamp(du, 0.0, 1.0), uDetailTexel), dw);
  float d = max(dot(n, uSun), 0.0);
  float light = 0.30 + 0.85 * d;
  /* Water is where blue leads: a glint there, none on land. */
  float water = smoothstep(0.015, 0.09, c.b - max(c.r, c.g));
  vec3 h = normalize(uSun + v);
  float spec = pow(max(dot(n, h), 0.0), 70.0) * 0.45 * water;
  vec3 col = c * light * vec3(1.02, 1.03, 1.06) + spec * vec3(1.0, 0.96, 0.9);
  float m = texture2D(uMask, vUv).r * uMaskOn;
  col = mix(col, uTint, m * 0.30) + uTint * m * 0.06;
  /* Just above the handoff the Blue Marble leans towards the satellite map's
     brighter, crisper palette, so the cross-fade reads as "sharper", not as
     "a different map". */
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 punchy = clamp((col - 0.5) * 1.12 + 0.5 + (col - vec3(luma)) * 0.3 + 0.02, 0.0, 1.0);
  col = mix(col, punchy, uPunch);
  float f = 1.0 - max(dot(n, v), 0.0);
  col = mix(col, vec3(0.42, 0.66, 1.0), pow(f, 2.6) * 0.62);
  gl_FragColor = vec4(col, 1.0);
}`;

const CLOUD_FS = `${MED}
uniform sampler2D uClouds; uniform vec3 uSun; uniform float uShift; uniform float uAlpha;
varying vec3 vN; varying vec2 vUv; varying vec3 vW;
void main() {
  float a = texture2D(uClouds, vec2(vUv.x + uShift, vUv.y)).r;
  a = smoothstep(0.1, 0.95, a);
  float light = 0.35 + 0.8 * max(dot(normalize(vN), uSun), 0.0);
  gl_FragColor = vec4(vec3(light), a * uAlpha);
}`;

const LINE_VS = `${HIGH}
attribute vec3 aPos; uniform mat4 uVP;
void main() { gl_Position = uVP * vec4(aPos * ${BORDER_R.toFixed(4)}, 1.0); }`;
const LINE_FS = `${MED}
uniform vec4 uColor;
void main() { gl_FragColor = uColor; }`;

const QUAD_VS = `${HIGH}
attribute vec2 aXY; varying vec2 vXY;
void main() { vXY = aXY; gl_Position = vec4(aXY, 0.0, 1.0); }`;

/* Space, the stars, and the atmosphere's halo. A ray per pixel from the eye:
   where it passes the Earth closely it glows; where it points at the sky it
   finds a star cell. The stars are fixed to directions, not to the screen, so
   they turn with the camera and the spin reads as a spin. */
const SKY_FS = `${MED}
uniform vec3 uEye; uniform vec3 uRight; uniform vec3 uUp; uniform vec3 uFwd;
uniform float uTan; uniform float uAspect; uniform float uShift; uniform float uCellPx;
varying vec2 vXY;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec3 dir = normalize(uFwd + uRight * vXY.x * uTan * uAspect + uUp * (vXY.y - uShift) * uTan);
  vec3 col = mix(vec3(0.010, 0.014, 0.030), vec3(0.030, 0.045, 0.085), 0.5 + 0.5 * vXY.y);
  vec2 sp = vec2(atan(dir.z, dir.x), asin(clamp(dir.y, -1.0, 1.0))) * 38.0;
  vec2 cell = floor(sp);
  float h = hash(cell);
  if (h > 0.90) {
    vec2 at = vec2(hash(cell + 7.1), hash(cell + 3.7));
    float d = length(fract(sp) - at) * uCellPx;
    float b = (h - 0.90) * 10.0;
    col += vec3(0.85, 0.9, 1.0) * b * b * smoothstep(1.6, 0.0, d);
  }
  float tca = -dot(uEye, dir);
  float b = length(uEye + dir * max(tca, 0.0));
  if (tca > 0.0 && b > 1.0) {
    float x = b - 1.0;
    col += vec3(0.32, 0.58, 1.0) * (exp(-x * 26.0) * 0.95 + exp(-x * 5.0) * 0.14);
  }
  gl_FragColor = vec4(col, 1.0);
}`;

/* The dive. Three sheets of the same cloud texture, each growing past the
   camera and fading as it goes, heavier at the edges than in the middle so the
   place being dived on is never the thing hidden. */
const RUSH_FS = `${MED}
uniform sampler2D uClouds; uniform float uRush; uniform float uPhase; uniform float uAspect;
varying vec2 vXY;
void main() {
  vec2 p = vXY * vec2(uAspect, 1.0);
  float a = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float s = fract(uPhase + fi / 3.0);
    vec2 uv = vec2(0.18 + fi * 0.27, 0.30 + fi * 0.17) + p * mix(0.22, 0.018, s);
    float c = smoothstep(0.1, 0.95, texture2D(uClouds, uv).r);
    a = max(a, c * sin(s * 3.14159));
  }
  float edge = mix(0.45, 1.0, smoothstep(0.0, 1.1, length(vXY)));
  a = clamp(a * edge * uRush * 1.35, 0.0, 0.94);
  gl_FragColor = vec4(mix(vec3(0.78, 0.83, 0.9), vec3(1.0), a), a);
}`;

/* ========================================================================
   GL plumbing
   ======================================================================== */

function program(gl, vs, fs) {
  const make = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(`shader: ${gl.getShaderInfoLog(s)}`);
    return s;
  };
  const p = gl.createProgram();
  gl.attachShader(p, make(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, make(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(`link: ${gl.getProgramInfoLog(p)}`);
  const u = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(p, i);
    u[info.name] = gl.getUniformLocation(p, info.name);
  }
  return { p, u, a: (name) => gl.getAttribLocation(p, name) };
}

function texture(gl, source, { repeat = false, mip = true, luminance = false } = {}) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  const fmt = luminance ? gl.LUMINANCE : gl.RGB;
  gl.texImage2D(gl.TEXTURE_2D, 0, fmt, fmt, gl.UNSIGNED_BYTE, source);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  if (mip) {
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    /* Anisotropic filtering keeps the ground sharp where the tilted camera
       sees it at a grazing angle, towards the horizon. */
    const aniso = gl.getExtension('EXT_texture_filter_anisotropic')
      || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
      || gl.getExtension('MOZ_EXT_texture_filter_anisotropic');
    if (aniso) {
      const max = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 1;
      gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, max));
    }
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }
  t.w = source.width || 1;
  t.h = source.height || 1;
  return t;
}

/** A UV sphere: position doubles as normal, u from longitude, v from latitude. */
function sphereMesh(latSteps = 80, lonSteps = 160) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= latSteps; i++) {
    const lat = 90 - (i / latSteps) * 180;
    for (let j = 0; j <= lonSteps; j++) {
      const lon = -180 + (j / lonSteps) * 360;
      pos.push(...toXYZ(lat, lon));
      uv.push(j / lonSteps, i / latSteps);
    }
  }
  const row = lonSteps + 1;
  for (let i = 0; i < latSteps; i++) {
    for (let j = 0; j < lonSteps; j++) {
      const a = i * row + j, b = a + row;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  return { pos: new Float32Array(pos), uv: new Float32Array(uv), idx: new Uint16Array(idx) };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`image: ${src}`));
    img.src = String(src);
  });
}

/* ========================================================================
   Geography: borders, picking, masks
   ======================================================================== */

/** Longitudes unwrapped so a ring that crosses the antimeridian is one shape
    rather than a band across the whole map. */
function unwrap(flat) {
  const out = [];
  let prev = null, off = 0;
  for (let i = 0; i < flat.length; i += 2) {
    let lon = flat[i];
    if (prev !== null) {
      const d = lon + off - prev;
      if (d > 180) off -= 360;
      else if (d < -180) off += 360;
    }
    lon += off;
    out.push(lon, flat[i + 1]);
    prev = lon;
  }
  return out;
}

function traceRings(ctx, rings, W, H) {
  for (const flat of rings) {
    const ring = unwrap(flat);
    for (const shift of [-360, 0, 360]) {
      ctx.beginPath();
      for (let i = 0; i < ring.length; i += 2) {
        const x = ((ring[i] + shift + 180) / 360) * W;
        const y = ((90 - ring[i + 1]) / 180) * H;
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    }
  }
}

function buildGeography(geo) {
  const countries = (geo?.countries || []).filter((c) => c.id && c.rings?.length);
  const lines = [];
  const ranges = [];
  for (const c of countries) {
    const start = lines.length / 3;
    let main = null, mainArea = -1;
    for (const flat of c.rings) {
      const n = flat.length / 2;
      let minLo = Infinity, maxLo = -Infinity, minLa = Infinity, maxLa = -Infinity;
      const ring = unwrap(flat);
      for (let i = 0; i < n; i++) {
        const a = toXYZ(flat[i * 2 + 1], flat[i * 2]);
        const j = (i + 1) % n;
        const b = toXYZ(flat[j * 2 + 1], flat[j * 2]);
        lines.push(...a, ...b);
        minLo = Math.min(minLo, ring[i * 2]); maxLo = Math.max(maxLo, ring[i * 2]);
        minLa = Math.min(minLa, ring[i * 2 + 1]); maxLa = Math.max(maxLa, ring[i * 2 + 1]);
      }
      const area = (maxLo - minLo) * (maxLa - minLa) * Math.cos(((minLa + maxLa) / 2) * D2R);
      if (area > mainArea) { mainArea = area; main = flat; }
    }
    /* A country's camera frames its largest ring — its mainland — so that a
       territory an ocean away does not drag the camera into the sea. */
    const pts = [];
    const step = Math.max(1, Math.floor(main.length / 2 / 48));
    for (let i = 0; i < main.length; i += 2 * step) pts.push(toXYZ(main[i + 1], main[i]));
    ranges.push({ id: c.id, name: c.name, rings: c.rings, start, count: lines.length / 3 - start, frame: pts });
  }

  /* The picking raster: each country filled in its own colour on an
     equirectangular canvas. A click becomes a ray, the ray a latitude and
     longitude, and that a pixel. Green is a validity flag and blue a check
     digit, so an anti-aliased edge pixel — a blend of two colours — reads as
     "nothing" rather than as some third country. */
  const PW = 1024, PH = 512;
  const pc = document.createElement('canvas');
  pc.width = PW; pc.height = PH;
  const px = pc.getContext('2d', { willReadFrequently: true });
  ranges.forEach((r, i) => {
    px.fillStyle = `rgb(${i + 1},255,${((i + 1) * 53) & 255})`;
    traceRings(px, r.rings, PW, PH);
  });
  const pixels = px.getImageData(0, 0, PW, PH).data;
  const countryAt = (lat, lon) => {
    const x = Math.min(PW - 1, Math.max(0, Math.floor(((lon + 180) / 360) * PW)));
    const y = Math.min(PH - 1, Math.max(0, Math.floor(((90 - lat) / 180) * PH)));
    const k = (y * PW + x) * 4;
    const i = pixels[k];
    if (!i || pixels[k + 1] !== 255 || pixels[k + 2] !== ((i * 53) & 255)) return null;
    return ranges[i - 1] || null;
  };

  return { lines: new Float32Array(lines), ranges, byId: new Map(ranges.map((r) => [r.id, r])), countryAt };
}

/* ========================================================================
   The globe
   ======================================================================== */

export async function mountGlobe(figure, { onFail } = {}) {
  const stage = figure.querySelector('.world__stage');
  const svg = figure.querySelector('.world__svg');
  const list = figure.querySelector('.world__list');
  const caption = figure.querySelector('.world__caption');
  const dataEl = figure.querySelector('.world__data');
  if (!stage || !dataEl) throw new Error('no world data');

  const unit = figure.dataset.unit || '';
  const layer = (svg?.getAttribute('aria-label') || 'Map').split(':')[0];
  const places = JSON.parse(dataEl.textContent || '[]')
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon))
    .map((p) => ({ ...p, xyz: toXYZ(p.lat, p.lon), dim: false, selected: false }));
  const byId = new Map(places.map((p) => [p.id, p]));
  const links = new Map();
  for (const a of list ? list.querySelectorAll('a[data-place]') : []) links.set(a.dataset.place, a);

  /* --- Context and resources ---------------------------------------------- */

  const canvas = document.createElement('canvas');
  canvas.className = 'world__globe';
  canvas.setAttribute('aria-hidden', 'true');
  /* A globe at 12 frames a second is worse than the flat map, so a machine
     that would draw it in software gets the flat map instead: the browser is
     asked to refuse a "major performance caveat", and a renderer that names
     itself as software is refused here. `?map=globe` overrides both, for
     testing. */
  const forced = new URLSearchParams(location.search).get('map') === 'globe';
  const attrs = { antialias: true, alpha: false, depth: true, powerPreference: 'default', failIfMajorPerformanceCaveat: !forced };
  const gl = canvas.getContext('webgl', attrs) || canvas.getContext('experimental-webgl', attrs);
  if (!gl) throw new Error('WebGL refused (or only in software)');
  if (!forced) {
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    if (/swiftshader|llvmpipe|softpipe|basic render|software/i.test(renderer)) throw new Error(`software renderer: ${renderer}`);
  }

  const assets = new URL('../', import.meta.url);
  const [geo, destinations, detailInfo, dayImg, cloudImg] = await Promise.all([
    fetch(new URL('geo/countries.json', assets)).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    fetch(new URL('geo/destinations.json', assets)).then((r) => (r.ok ? r.json() : [])).catch(() => []),
    fetch(new URL('img/globe/detail.json', assets)).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    loadImage(new URL('img/globe/earth-day.webp', assets)),
    loadImage(new URL('img/globe/earth-clouds.webp', assets)).catch(() => null),
  ]);
  let geography = buildGeography(geo);
  const pages = new Map((destinations || []).map((d) => [d.code, d]));

  /* A place's country: the record says, when it can; the raster otherwise. */
  for (const p of places) {
    if (!p.country) p.country = geography.countryAt(p.lat, p.lon)?.id || '';
  }
  /* When every place on the page is in one country — a Destination's own page
     — that country is outlined and faintly lit at rest, so the page's subject
     is visible on the planet before anything is chosen. Derived from the
     places, never named. */
  const countries = new Set(places.map((p) => p.country));
  let home = places.length && countries.size === 1 && !countries.has('') ? geography.byId.get([...countries][0]) || null : null;

  const progs = {
    earth: program(gl, SPHERE_VS, EARTH_FS),
    cloud: program(gl, SPHERE_VS, CLOUD_FS),
    line: program(gl, LINE_VS, LINE_FS),
    sky: program(gl, QUAD_VS, SKY_FS),
    rush: program(gl, QUAD_VS, RUSH_FS),
  };

  const mesh = sphereMesh();
  const buf = (data, target = gl.ARRAY_BUFFER) => {
    const b = gl.createBuffer();
    gl.bindBuffer(target, b);
    gl.bufferData(target, data, gl.STATIC_DRAW);
    return b;
  };
  const posBuf = buf(mesh.pos);
  const uvBuf = buf(mesh.uv);
  const idxBuf = buf(mesh.idx, gl.ELEMENT_ARRAY_BUFFER);
  const lineBuf = buf(geography.lines.length ? geography.lines : new Float32Array(6));
  const quadBuf = buf(new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]));

  let dayTex = texture(gl, dayImg);
  /* The detail texture starts as one transparent pixel and is replaced the
     first time the camera comes down over its rectangle. */
  const blank = document.createElement('canvas');
  blank.width = blank.height = 1;
  let detailTex = texture(gl, blank, { mip: false });
  let detailOn = 0;
  const detailRect = detailInfo
    ? [(detailInfo.west + 180) / 360, (90 - detailInfo.north) / 180, (detailInfo.east + 180) / 360, (90 - detailInfo.south) / 180]
    : [0, 0, 0, 0];
  const cloudTex = cloudImg ? texture(gl, cloudImg, { repeat: true, luminance: true }) : null;
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = 1024; maskCanvas.height = 512;
  const maskCtx = maskCanvas.getContext('2d');
  let maskTex = texture(gl, maskCanvas, { mip: false, luminance: true });

  /* --- Furniture ---------------------------------------------------------- */

  const pinLayer = el('div', { class: 'world__pins', 'aria-hidden': 'true' });
  const controls = el('div', { class: 'world__controls' });
  const zoomIn = button('Zoom in', '+');
  const zoomOut = button('Zoom out', '−');
  const zoomReset = button('Back to the whole view', 'Reset');
  zoomReset.classList.add('world__btn--wide');
  controls.append(zoomIn, zoomOut, zoomReset);

  const card = el('section', { class: 'world__card', hidden: '', 'aria-label': 'Selected on the globe' });
  const hint = el('p', { class: 'world__hint', 'aria-hidden': 'true', hidden: '' });
  const credit = el('p', { class: 'world__credit' });
  const creditLink = el('a', { href: `${root.dataset.base === '/' ? '' : root.dataset.base || ''}/credits/#globe` }, 'Imagery: NASA');
  credit.append(creditLink);

  stage.append(canvas, pinLayer, controls, card, hint, credit);
  stage.tabIndex = 0;
  stage.setAttribute('role', 'group');
  stage.setAttribute(
    'aria-label',
    `${layer}, on a globe. Arrow keys turn it, plus and minus zoom, zero returns to the whole view. Every place is also in the list below.`
  );
  const status = el('p', { class: 'visually-hidden', role: 'status', 'aria-live': 'polite' });
  figure.append(status);

  const legendHint = caption
    ? el('span', { class: 'world__legend world__legend--hint' },
        'Drag to spin the globe, pinch or use + and − to zoom, click a country or a light to fly there. Every place is in the list either way.')
    : null;
  if (legendHint) caption.append(legendHint);

  /* --- Size ---------------------------------------------------------------- */

  let W = 1, H = 1, dpr = 1;
  function resize() {
    const r = stage.getBoundingClientRect();
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    dpr = lowPower ? 1 : Math.min(DPR_CAP, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    camDirty = true;
    clusterAt = -1;
    kick();
  }

  /* --- Camera -------------------------------------------------------------- */

  /* `view` is what is on screen; `goal` is where it is heading, for the same
     reason the flat map kept them apart: two quick presses mean two steps. */
  const view = { lat: 20, lon: 0, alt: 2 };
  const cam = { eye: [0, 0, 3], right: [1, 0, 0], up: [0, 1, 0], fwd: [0, 0, -1], shift: 0, pitch: 0, vp: new Float32Array(16) };
  let camDirty = true;

  function solveCamera(s, out = cam) {
    const T = toXYZ(s.lat, s.lon);
    const la = s.lat * D2R, lo = s.lon * D2R;
    const north = [-Math.sin(la) * Math.sin(lo), Math.cos(la), -Math.sin(la) * Math.cos(lo)];
    const p = pitchFor(s.alt);
    const cp = Math.cos(p), sp = Math.sin(p);
    const back = [cp * T[0] - sp * north[0], cp * T[1] - sp * north[1], cp * T[2] - sp * north[2]];
    out.eye = [T[0] + s.alt * back[0], T[1] + s.alt * back[1], T[2] + s.alt * back[2]];
    out.fwd = [-back[0], -back[1], -back[2]];
    out.up = [sp * T[0] + cp * north[0], sp * T[1] + cp * north[1], sp * T[2] + cp * north[2]];
    out.right = cross(out.fwd, out.up);
    out.shift = shiftFor(s.alt);
    out.pitch = p;
    return out;
  }

  function buildVP() {
    solveCamera(view);
    const { eye, right: r, up: u, fwd } = cam;
    const b = [-fwd[0], -fwd[1], -fwd[2]];
    const dist = Math.hypot(...eye);
    const near = Math.max(0.0015, (dist - CLOUD_R) * 0.45);
    const far = dist + 1.2;
    const f = 1 / TAN, aspect = W / H, nf = 1 / (near - far);
    const P = [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, -cam.shift, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
    const V = [
      r[0], u[0], b[0], 0,
      r[1], u[1], b[1], 0,
      r[2], u[2], b[2], 0,
      -dot(r, eye), -dot(u, eye), -dot(b, eye), 1,
    ];
    for (let c = 0; c < 4; c++) {
      for (let rr = 0; rr < 4; rr++) {
        let s = 0;
        for (let k = 0; k < 4; k++) s += P[k * 4 + rr] * V[c * 4 + k];
        cam.vp[c * 4 + rr] = s;
      }
    }
  }

  /** Where a point on the sphere lands on the panel, in CSS pixels, and how
      squarely it faces the camera (negative: behind the planet). */
  function project(p, c = cam, w = W, h = H) {
    const d = [p[0] - c.eye[0], p[1] - c.eye[1], p[2] - c.eye[2]];
    const z = dot(d, c.fwd);
    const facing = -dot(p, norm(d));
    if (z <= 1e-4) return { x: 0, y: 0, facing: -1 };
    /* Under the close map, a pin goes exactly where the map draws its place. */
    if (closeActive && c === cam && facing > 0) {
      const [lat, lon] = toLatLon(p);
      const q = close.project(lon, lat);
      return { x: q.x, y: q.y, facing };
    }
    const nx = dot(d, c.right) / (z * TAN * (w / h));
    const ny = dot(d, c.up) / (z * TAN) + c.shift;
    return { x: (nx + 1) * 0.5 * w, y: (1 - ny) * 0.5 * h, facing };
  }

  /** The point on the Earth under a pixel, or null for space. */
  function pick(clientX, clientY) {
    const r = stage.getBoundingClientRect();
    const nx = ((clientX - r.left) / W) * 2 - 1;
    const ny = 1 - ((clientY - r.top) / H) * 2;
    const dir = norm([
      cam.fwd[0] + cam.right[0] * nx * TAN * (W / H) + cam.up[0] * (ny - cam.shift) * TAN,
      cam.fwd[1] + cam.right[1] * nx * TAN * (W / H) + cam.up[1] * (ny - cam.shift) * TAN,
      cam.fwd[2] + cam.right[2] * nx * TAN * (W / H) + cam.up[2] * (ny - cam.shift) * TAN,
    ]);
    const b = dot(cam.eye, dir);
    const c = dot(cam.eye, cam.eye) - 1;
    const disc = b * b - c;
    if (disc < 0) return null;
    const t = -b - Math.sqrt(disc);
    if (t < 0) return null;
    const p = [cam.eye[0] + dir[0] * t, cam.eye[1] + dir[1] * t, cam.eye[2] + dir[2] * t];
    const [lat, lon] = toLatLon(p);
    return { lat, lon, xyz: p };
  }

  /** Radians of Earth under one CSS pixel at the middle of the view. */
  const radPerPx = (alt = view.alt) => (alt * 2 * TAN) / H;

  /**
   * The lowest camera that puts every point inside the panel with room round
   * it. Solved numerically against the real projection rather than from a
   * formula, because the pitch and the lens shift change with altitude and a
   * formula that forgot either would frame everything slightly wrong.
   */
  function fitCamera(points, { maxAlt = MAX_ALT, minAlt = MIN_ALT * 1.6, pad = [0.12, 0.18, 0.1] } = {}) {
    if (!points.length) return { lat: 30, lon: 10, alt: REST_MAX_ALT, fits: true };
    const centre = norm(points.reduce((s, p) => [s[0] + p[0], s[1] + p[1], s[2] + p[2]], [0, 0, 0]));
    const [lat0, lon0] = toLatLon(centre);
    let tgt = { lat: Math.max(-70, Math.min(75, lat0)), lon: lon0 };
    const mx = Math.min(W * pad[0], 140), top = H * pad[1], bot = H * pad[2];
    const fits = (alt) => {
      const c = solveCamera({ ...tgt, alt }, {});
      return points.every((p) => {
        const s = project(p, c);
        return s.facing > 0.12 && s.x > mx && s.x < W - mx && s.y > top && s.y < H - bot;
      });
    };
    const search = () => {
      let lo = minAlt, hi = maxAlt;
      if (fits(lo)) return lo;
      if (!fits(hi)) return hi;
      for (let i = 0; i < 22; i++) {
        const mid = Math.sqrt(lo * hi);
        if (fits(mid)) hi = mid; else lo = mid;
      }
      return hi;
    };
    /* Fit, then move the target so the places sit in the middle of the room
       left under the horizon, then fit again: with a tilted camera the middle
       of the places is not the middle of their picture. */
    let alt = search();
    const fitsAt = (a) => fits(a);
    for (let pass = 0; pass < 3; pass++) {
      const c = solveCamera({ ...tgt, alt }, {});
      const s = points.map((p) => project(p, c)).filter((q) => q.facing > 0);
      if (!s.length) break;
      const xs = s.map((q) => q.x), ys = s.map((q) => q.y);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
      const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      const k = radPerPx(alt) * R2D;
      tgt = {
        lat: Math.max(-70, Math.min(75, tgt.lat - (cy - (top + H - bot) / 2) * k * 0.8)),
        lon: wrapLon(tgt.lon + ((cx - W / 2) * k * 0.8) / Math.max(0.3, Math.cos(tgt.lat * D2R))),
      };
      alt = search();
    }
    return { ...tgt, alt, fits: fitsAt(alt) };
  }

  /* The resting camera: an explicit frame if the page gave one, otherwise the
     places this page holds. Never further out than REST_MAX_ALT — a whole-world
     page rests on a big, cropped globe that turns, not on a small disc. */
  function restCamera() {
    const f = (figure.dataset.frame || '').split(',').map(Number);
    let pts;
    if (f.length === 4 && f.every(Number.isFinite)) {
      const [n, s, w, e] = f;
      pts = [toXYZ(n, w), toXYZ(n, e), toXYZ(s, w), toXYZ(s, e), toXYZ((n + s) / 2, (w + e) / 2)];
    } else {
      pts = places.map((p) => p.xyz);
    }
    /* A phone's square stage is a third of a desktop's width, so it may rest
       closer before its places become one group. */
    const narrow = Math.min(1, Math.max(0.6, W / 1100));
    /* …but never below the hand-back altitude: the globe owns every resting
       view, and the close map only ever arrives because someone dived. */
    const minAlt = Math.max(HANDBACK_ALT * 1.15, (home ? HOME_REST_MIN_ALT : REST_MIN_ALT) * narrow);
    const fit = fitCamera(pts, { maxAlt: REST_MAX_ALT, minAlt, pad: [0.16, 0.24, 0.14] });
    return fit.fits ? fit : worldRest(pts);
  }

  /**
   * Places spread round the planet do not fit any one camera. Rest where the
   * most of them — weighted by how much each holds — are in view and facing,
   * on a whole globe that still overfills the panel, and let the idle spin
   * bring the rest round.
   */
  function worldRest(pts) {
    const weight = pts.map((q) => {
      const p = places.find((pl) => pl.xyz === q);
      return 1 + Math.log(1 + (p?.count || 0));
    });
    let best = null;
    for (const alt of [1.7, 1.9, 2.1, 2.3]) {
      for (let lat = -10; lat <= 30; lat += 5) {
        for (let lon = -180; lon < 180; lon += 10) {
          const c = solveCamera({ lat, lon, alt }, {});
          let score = 0;
          pts.forEach((q, i) => {
            const s = project(q, c);
            if (s.facing > 0.2 && s.x > W * 0.06 && s.x < W * 0.94 && s.y > H * 0.08 && s.y < H * 0.94) score += weight[i];
          });
          score -= alt * 0.5; // a bigger, more cropped globe wins unless backing off shows another place
          if (!best || score > best.score) best = { lat, lon, alt, score };
        }
      }
    }
    return { lat: best.lat, lon: best.lon, alt: best.alt };
  }

  /* --- Motion -------------------------------------------------------------- */

  let flight = null;       // an eased journey in progress
  let spin = null;         // inertia after a drag
  let idle = !reducedMotion();
  let idleBase = null;
  let rush = 0, rushPhase = 0;

  function stopMotion() {
    flight = null;
    spin = null;
    rush = 0;
  }

  /* The first gesture is the first sign of interest, and the only thing that
     fetches the big textures, the finer borders and (near the ground) the
     close map. A student who only looks at the resting globe pays for none
     of them. */
  let touched = false;
  function touch() {
    idle = false;
    pendingThen = null;
    if (!touched) {
      touched = true;
      const later = window.requestIdleCallback || ((fn) => setTimeout(fn, 400));
      later(() => { upgradeDay(); maybeFine(0); }, { timeout: 2500 });
    }
    hideHint();
  }

  /**
   * Fly the camera: pull out, travel, dive in. The altitude follows a curve in
   * log space whose top is higher the further apart the two ends are, and the
   * travel starts a beat after the climb and ends a beat before the landing,
   * which is what makes it read as one arc rather than a zoom and a pan.
   *
   * When the dive crosses the cloud deck, the clouds rush past the camera on
   * the way down — or fall away beneath it on the way up.
   */
  function flyTo(target, { announce = '', onArrive = null, travel = false } = {}) {
    touch();
    const to = { lat: Math.max(-80, Math.min(80, target.lat)), lon: wrapLon(target.lon), alt: clampAlt(target.alt) };
    if (cardSubject) cardSubject.alt = null;
    if (reducedMotion()) {
      stopMotion();
      Object.assign(view, to);
      camDirty = true;
      clusterAt = -1;
      kick();
      if (announce) say(announce);
      onArrive?.();
      return;
    }
    const from = { ...view };
    const a = toXYZ(from.lat, from.lon), b = toXYZ(to.lat, to.lon);
    const w = angle(a, b);
    const la0 = Math.log(from.alt), la1 = Math.log(to.alt);
    /* A journey — more than a hop, or setting off from the page's resting
       view — climbs above the cloud deck, so the descent passes through it
       even when both ends are below the clouds. Zoom buttons and arrow keys
       are not journeys and do not climb. */
    const fromRest = Math.abs(from.alt - rest.alt) < 0.02 && angle(a, toXYZ(rest.lat, rest.lon)) < 0.05;
    const climb = travel && (w > HOP || fromRest) ? Math.max(TRAVEL_CLIMB, to.alt * 2.4) : 0;
    const peak = Math.log(Math.min(3.2, Math.max(from.alt, to.alt, w * 1.5, climb)));
    const ctrl = peak > Math.max(la0, la1) ? 2 * peak - (la0 + la1) / 2 : (la0 + la1) / 2;
    const top = Math.exp(Math.max(peak, la0, la1));
    /* The site's `geographic` motion token is the length of a typical flight;
       a longer journey, or a deeper dive, takes proportionally longer. */
    const base = parseFloat(getComputedStyle(root).getPropertyValue('--motion-geographic-ms')) || 1400;
    const dur = base * Math.min(2.1, Math.max(0.65, 0.68 + w * 0.46 + Math.abs(la1 - la0) * 0.12 + (top > Math.max(from.alt, to.alt) * 1.2 ? 0.18 : 0)));
    maybeFine(to.alt);
    maybeDetail(to);
    const diveIn = to.alt < 0.9 && top / to.alt > 2.2;
    const climbOut = !diveIn && from.alt < 0.9 && to.alt / from.alt > 2.2;
    spin = null;
    flight = { t0: performance.now(), dur, from, to, a, b, la0, la1, ctrl, diveIn, climbOut, announce, onArrive };
    if (announce) say(`Flying to ${announce}.`);
    kick();
  }

  function stepFlight(now) {
    const f = flight;
    const t = Math.min(1, (now - f.t0) / f.dur);
    const s = easeInOut(t);
    const move = easeInOut(Math.min(1, Math.max(0, (t - 0.12) / 0.76)));
    const p = slerp(f.a, f.b, move);
    const [lat, lon] = toLatLon(p);
    const la = (1 - s) * (1 - s) * f.la0 + 2 * s * (1 - s) * f.ctrl + s * s * f.la1;
    view.lat = lat;
    view.lon = lon;
    view.alt = clampAlt(Math.exp(la));
    rush = 0;
    if (f.diveIn && t > 0.5) {
      const k = (t - 0.5) / 0.46;
      rush = k < 1 ? Math.pow(Math.sin(Math.PI * k), 1.1) : 0;
      rushPhase = k * 1.5;
    } else if (f.climbOut && t < 0.5) {
      const k = (t - 0.04) / 0.46;
      rush = k > 0 && k < 1 ? Math.pow(Math.sin(Math.PI * k), 1.1) * 0.85 : 0;
      rushPhase = 1.5 * (1 - k);
    }
    camDirty = true;
    if (t >= 1) {
      Object.assign(view, f.to);
      rush = 0;
      flight = null;
      clusterAt = -1;
      if (f.announce) say(arrivalMessage(f.announce));
      f.onArrive?.();
    }
  }

  function stepSpin(dt) {
    const k = Math.exp(-dt / 380);
    spin.vLat *= k;
    spin.vLon *= k;
    view.lat = Math.max(-80, Math.min(80, view.lat + spin.vLat * dt));
    view.lon = wrapLon(view.lon + spin.vLon * dt);
    camDirty = true;
    if (Math.abs(spin.vLat) + Math.abs(spin.vLon) < 0.0004) spin = null;
  }

  /* Until the first touch, the globe breathes: a whole-world view turns
     slowly; a close one sways a few degrees either side of where it rests, so
     the places the page is about never drift out of the frame. */
  function stepIdle(now) {
    if (!idleBase) idleBase = { ...view, t0: now };
    const t = (now - idleBase.t0) / 1000;
    if (idleBase.alt > 1.3) {
      view.lon = wrapLon(idleBase.lon + t * 6);
    } else {
      /* A sway of about 4% of the panel's width, whatever the zoom: enough to
         read as alive, never enough to carry an edge pin out of frame. */
      const amp = Math.min(6, (0.04 * W * radPerPx(idleBase.alt) * R2D) / Math.max(0.3, Math.cos(idleBase.lat * D2R)));
      view.lon = wrapLon(idleBase.lon + Math.sin(t * 0.3) * amp);
    }
    camDirty = true;
  }

  /* The finer borders (Natural Earth 50m, ~134 kB gzip) are fetched the first
     time the camera comes down to where the 110m outlines look like polygons,
     and then replace them for good: lines, picking and masks. */
  /* The big textures, lazily. The 4096 day map replaces the 2048 once the
     globe is on and the browser is idle; the detail texture is fetched the
     first time the camera comes below FINE_ALT over (or near) its rectangle. */
  let big = 'none';
  function upgradeDay() {
    if (big !== 'none' || dead) return;
    big = 'loading';
    loadImage(new URL('img/globe/earth-day-4096.webp', assets))
      .then((img) => {
        if (dead) return;
        const t = texture(gl, img);
        gl.deleteTexture(dayTex);
        dayTex = t;
        camDirty = true;
        kick();
      })
      .catch(() => {});
  }
  let detail = detailInfo ? 'none' : 'done';
  function maybeDetail(at = view) {
    if (detail !== 'none' || at.alt > FINE_ALT) return;
    const m = 8; // degrees of margin: start fetching as the camera approaches
    if (at.lat < detailInfo.south - m || at.lat > detailInfo.north + m) return;
    const lon = wrapLon(at.lon);
    if (lon < detailInfo.west - m || lon > detailInfo.east + m) return;
    detail = 'loading';
    loadImage(new URL(`img/globe/${detailInfo.file}`, assets))
      .then((img) => {
        if (dead) return;
        gl.deleteTexture(detailTex);
        detailTex = texture(gl, img);
        const t0 = performance.now();
        const fade = () => {
          detailOn = reducedMotion() ? 1 : Math.min(1, (performance.now() - t0) / 500);
          camDirty = true;
          kick();
          if (detailOn < 1) requestAnimationFrame(fade);
        };
        fade();
      })
      .catch(() => {})
      .finally(() => { detail = 'done'; });
  }

  let fine = 'none';
  function maybeFine(alt = view.alt) {
    if (fine !== 'none' || alt > FINE_ALT) return;
    fine = 'loading';
    fetch(new URL('geo/borders-50m.json', assets))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || dead) return;
        const g = buildGeography(data);
        if (!g.ranges.length) return;
        geography = g;
        gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
        gl.bufferData(gl.ARRAY_BUFFER, g.lines, gl.STATIC_DRAW);
        if (selectedCountry) selectedCountry = g.byId.get(selectedCountry.id) || null;
        if (home) home = g.byId.get(home.id) || home;
        paintMask(selectedCountry || home);
        hoverCountry = null;
        camDirty = true;
        kick();
      })
      .catch(() => {})
      .finally(() => { fine = 'done'; });
  }

  /* --- Pins and groups ----------------------------------------------------- */

  const maxCount = () => Math.max(1, ...places.map((p) => p.count || 0));
  const radius = (p, max) => (p.count ? 4.5 + Math.sqrt(p.count / max) * 7 : 3.5);

  for (const p of places) {
    const node = el('div', { class: 'world__pin', 'data-place': p.id });
    if (p.cue) node.dataset.approx = 'true';
    const dotEl = el('span', { class: 'world__pin-dot' });
    const label = el('span', { class: 'world__pin-label' }, p.name);
    node.append(dotEl, label);
    pinLayer.append(node);
    p.node = node;
    p.labelEl = label;
    node.addEventListener('pointerenter', () => light(p.id, { fromMap: true }));
    node.addEventListener('pointerleave', () => light(null));
  }

  let groups = [];
  let clusterAt = -1;     // the altitude the groups were computed at
  let clusterFrom = null; // and where the camera was pointing
  const clusterPool = [];

  /**
   * Group places that would sit within PIN_GAP pixels of each other. The test
   * is an angle on the sphere scaled by the zoom, not a distance on the
   * screen, so the groups hold still while the globe spins and only split
   * or merge as the camera comes down or backs off.
   */
  function cluster() {
    /* Facing places are compared where they land on the screen, which is what
       a reader sees — a tilted camera squeezes north and south together. The
       rest, round the back, by angle. Recomputed only when the zoom changes or
       the camera has travelled, so the groups hold still under a spin. */
    const theta = PIN_GAP * radPerPx() * (1 + Math.sin(cam.pitch));
    const cosT = Math.cos(theta);
    for (const p of places) p._s = project(p.xyz);
    const near = (a, b) => (a._s.facing > 0.05 && b._s.facing > 0.05
      ? Math.hypot(a._s.x - b._s.x, a._s.y - b._s.y) < PIN_GAP
      : dot(a.xyz, b.xyz) > cosT);
    const left = [...places].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    const out = [];
    while (left.length) {
      const seed = left.shift();
      const members = [seed];
      for (let i = left.length - 1; i >= 0; i--) {
        if (members.some((m) => near(m, left[i]))) members.push(...left.splice(i, 1));
      }
      const xyz = norm(members.reduce((s, m) => [s[0] + m.xyz[0], s[1] + m.xyz[1], s[2] + m.xyz[2]], [0, 0, 0]));
      out.push({ members, xyz, count: members.reduce((n, m) => n + (m.count || 0), 0) });
    }
    groups = out;
    clusterAt = view.alt;
    clusterFrom = toXYZ(view.lat, view.lon);
  }

  function clusterNode(i) {
    while (clusterPool.length <= i) {
      const node = el('div', { class: 'world__cluster' });
      node.append(el('span', { class: 'world__cluster-n' }));
      node.addEventListener('pointerenter', () => { if (node._members) light(node._members.map((m) => m.id).join(' '), { fromMap: true }); });
      node.addEventListener('pointerleave', () => light(null));
      pinLayer.append(node);
      clusterPool.push(node);
    }
    return clusterPool[i];
  }

  let litSet = new Set();

  function layoutPins() {
    if (touched) { maybeFine(); maybeDetail(); }
    /* A card is judged only once the camera has arrived: during a flight its
       subject is legitimately off-stage. */
    if (cardSubject && !flight && !closeFlying) cardStillAbout();
    /* During a flight the groups hold still and are recomputed on arrival:
       watching "12" become 10, 9, then 5 and 5 mid-dive is noise. */
    if (flight && clusterAt > 0) { /* keep */ } else if (clusterAt < 0 || Math.abs(Math.log(view.alt / clusterAt)) > 0.06
      || angle(clusterFrom, toXYZ(view.lat, view.lon)) > Math.min(0.35, 0.25 * view.alt + 0.03)) cluster();
    const max = maxCount();
    const labels = view.alt < LABEL_ALT;
    /* The camera buttons and the open card are furniture a label must not go under. */
    const sr = stage.getBoundingClientRect();
    const taken = [controls, card].filter((n) => n && !n.hidden).map((n) => {
      const r = n.getBoundingClientRect();
      return [r.left - sr.left - 6, r.top - sr.top - 6, r.right - sr.left + 6, r.bottom - sr.top + 6];
    });
    let used = 0;
    const seen = new Set();
    for (const g of groups) {
      const s = project(g.xyz);
      const onScreen = s.facing > 0 && s.x > -40 && s.x < W + 40 && s.y > -40 && s.y < H + 40;
      const fade = Math.min(1, Math.max(0, (s.facing - 0.02) / 0.2));
      if (g.members.length === 1) {
        const p = g.members[0];
        seen.add(p.id);
        const node = p.node;
        if (!onScreen) { node.hidden = true; continue; }
        node.hidden = false;
        const r = radius(p, max);
        node.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`;
        node.style.setProperty('--r', `${r.toFixed(1)}px`);
        node.style.opacity = String(fade * (p.dim ? 0.55 : 1));
        node.toggleAttribute('data-dim', p.dim);
        node.toggleAttribute('data-selected', p.selected);
        node.toggleAttribute('data-on', litSet.has(p.id));
        /* A label goes where it does not cover another label, biggest places
           first. Lit and selected places always get theirs. */
        let show = false;
        if (fade > 0.6 && (labels || litSet.has(p.id) || p.selected)) {
          const w = p.name.length * 6.6 + 18;
          const rect = [s.x + r + 2, s.y - 11, s.x + r + 2 + w, s.y + 11];
          const clash = taken.some((t) => rect[0] < t[2] && rect[2] > t[0] && rect[1] < t[3] && rect[3] > t[1]);
          if (!clash || litSet.has(p.id) || p.selected) { show = true; taken.push(rect); }
        }
        node.toggleAttribute('data-label', show);
      } else {
        for (const m of g.members) { seen.add(m.id); m.node.hidden = true; }
        const node = clusterNode(used++);
        node._members = g.members;
        if (!onScreen) { node.hidden = true; continue; }
        node.hidden = false;
        node.firstChild.textContent = String(g.members.length);
        const r = 11 + Math.min(9, Math.sqrt(g.members.length) * 3);
        node.style.setProperty('--r', `${r.toFixed(1)}px`);
        node.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`;
        node.style.opacity = String(fade);
        node.toggleAttribute('data-dim', g.members.every((m) => m.dim));
        node.toggleAttribute('data-on', g.members.some((m) => litSet.has(m.id)));
        node.toggleAttribute('data-selected', g.members.some((m) => m.selected));
        taken.push([s.x - r, s.y - r, s.x + r, s.y + r]);
      }
    }
    for (let i = used; i < clusterPool.length; i++) { clusterPool[i].hidden = true; clusterPool[i]._members = null; }
    for (const p of places) if (!seen.has(p.id)) p.node.hidden = true;

    stage.dataset.zoomed = String(view.alt < rest.alt * 0.95);
    zoomIn.disabled = view.alt <= MIN_ALT * 1.01;
    zoomOut.disabled = view.alt >= MAX_ALT * 0.99;
  }

  /* --- Drawing ------------------------------------------------------------- */

  let hoverCountry = null;
  let selectedCountry = null;
  let lastDraw = 0;
  let drawMs = 0;

  function bindSphere(prog) {
    const ap = prog.a('aPos'), au = prog.a('aUv');
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.enableVertexAttribArray(ap);
    gl.vertexAttribPointer(ap, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.enableVertexAttribArray(au);
    gl.vertexAttribPointer(au, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
  }
  function bindQuad(prog) {
    const a = prog.a('aXY');
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
  }
  function resetAttribs() {
    for (let i = 0; i < 4; i++) gl.disableVertexAttribArray(i);
  }

  const cloudAlpha = () => 0.82 * smooth(0.22, 0.85, view.alt);

  function draw(now) {
    const t0 = performance.now();
    buildVP();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.01, 0.014, 0.03, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /* Light from over the viewer's left shoulder, so the side being looked
       at is always day and the limb falls into a soft terminator. */
    const sun = norm([
      cam.right[0] * -0.45 + cam.up[0] * 0.55 - cam.fwd[0] * 0.8,
      cam.right[1] * -0.45 + cam.up[1] * 0.55 - cam.fwd[1] * 0.8,
      cam.right[2] * -0.45 + cam.up[2] * 0.55 - cam.fwd[2] * 0.8,
    ]);

    // 1. Sky
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    let pr = progs.sky;
    gl.useProgram(pr.p);
    resetAttribs();
    bindQuad(pr);
    gl.uniform3fv(pr.u.uEye, cam.eye);
    gl.uniform3fv(pr.u.uRight, cam.right);
    gl.uniform3fv(pr.u.uUp, cam.up);
    gl.uniform3fv(pr.u.uFwd, cam.fwd);
    gl.uniform1f(pr.u.uTan, TAN);
    gl.uniform1f(pr.u.uAspect, W / H);
    gl.uniform1f(pr.u.uShift, cam.shift);
    // How many CSS pixels one star cell spans, so a star is a point at any zoom.
    gl.uniform1f(pr.u.uCellPx, (H / 2) / (TAN * 38));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // 2. Earth
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    pr = progs.earth;
    gl.useProgram(pr.p);
    resetAttribs();
    bindSphere(pr);
    gl.uniformMatrix4fv(pr.u.uVP, false, cam.vp);
    gl.uniform1f(pr.u.uR, 1);
    gl.uniform3fv(pr.u.uEye, cam.eye);
    gl.uniform3fv(pr.u.uSun, sun);
    gl.uniform3f(pr.u.uTint, 1.0, 0.62, 0.36);
    gl.uniform1f(pr.u.uMaskOn, selectedCountry ? 1 : home ? 0.45 : 0);
    gl.uniform1f(pr.u.uSharp, 0.7 * smooth(1.3, 0.35, view.alt));
    gl.uniform2f(pr.u.uTexel, 1 / dayTex.w, 1 / dayTex.h);
    gl.uniform4f(pr.u.uDetailRect, ...detailRect);
    gl.uniform2f(pr.u.uDetailTexel, 1 / detailTex.w, 1 / detailTex.h);
    gl.uniform1f(pr.u.uDetailOn, detailOn);
    gl.uniform1f(pr.u.uPunch, closeState === 'failed' ? 0 : 0.8 * smooth(0.24, HANDOFF_ALT, view.alt));
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, detailTex);
    gl.uniform1i(pr.u.uDetail, 2);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, dayTex);
    gl.uniform1i(pr.u.uDay, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, maskTex);
    gl.uniform1i(pr.u.uMask, 1);
    gl.drawElements(gl.TRIANGLES, mesh.idx.length, gl.UNSIGNED_SHORT, 0);

    // 3. Borders
    if (geography.ranges.length) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(false);
      pr = progs.line;
      gl.useProgram(pr.p);
      resetAttribs();
      const a = pr.a('aPos');
      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
      gl.enableVertexAttribArray(a);
      gl.vertexAttribPointer(a, 3, gl.FLOAT, false, 0, 0);
      gl.uniformMatrix4fv(pr.u.uVP, false, cam.vp);
      gl.uniform4f(pr.u.uColor, 1, 1, 1, 0.16 + 0.12 * smooth(1.2, 0.2, view.alt));
      gl.drawArrays(gl.LINES, 0, geography.lines.length / 3);
      const outline = selectedCountry || home;
      if (hoverCountry && hoverCountry !== outline) {
        gl.uniform4f(pr.u.uColor, 1, 1, 1, 0.75);
        gl.drawArrays(gl.LINES, hoverCountry.start, hoverCountry.count);
      }
      if (outline) {
        gl.uniform4f(pr.u.uColor, 1.0, 0.78, 0.6, selectedCountry ? 1.0 : 0.8);
        gl.drawArrays(gl.LINES, outline.start, outline.count);
      }
      gl.depthMask(true);
    }

    // 4. Clouds
    const ca = cloudAlpha();
    if (cloudTex && ca > 0.01) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(false);
      pr = progs.cloud;
      gl.useProgram(pr.p);
      resetAttribs();
      bindSphere(pr);
      gl.uniformMatrix4fv(pr.u.uVP, false, cam.vp);
      gl.uniform1f(pr.u.uR, CLOUD_R);
      gl.uniform3fv(pr.u.uSun, sun);
      gl.uniform1f(pr.u.uShift, reducedMotion() ? 0 : (now / 1000) * 0.0022);
      gl.uniform1f(pr.u.uAlpha, ca);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, cloudTex);
      gl.uniform1i(pr.u.uClouds, 0);
      gl.drawElements(gl.TRIANGLES, mesh.idx.length, gl.UNSIGNED_SHORT, 0);
      gl.depthMask(true);
    }
    gl.disable(gl.CULL_FACE);

    // 5. The rush through the clouds
    if (cloudTex && rush > 0.01) {
      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      pr = progs.rush;
      gl.useProgram(pr.p);
      resetAttribs();
      bindQuad(pr);
      gl.uniform1f(pr.u.uRush, rush);
      gl.uniform1f(pr.u.uPhase, rushPhase);
      gl.uniform1f(pr.u.uAspect, W / H);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, cloudTex);
      gl.uniform1i(pr.u.uClouds, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    const ms = performance.now() - t0;
    drawMs = drawMs ? drawMs * 0.9 + ms * 0.1 : ms;
    lastDraw = now;
  }

  /* --- The close map ------------------------------------------------------- */

  let close = null;          // globe-close.js's handle, once made
  let closeState = 'none';   // none | loading | ready | handing | failed
  let closeActive = false;   // the close map has the camera
  let closeFlying = false;   // the close map is on a flight this file started
  let pendingThen = null;    // what to do once the close map has the camera, if it was not ready in time
  /* MapLibre's pixels per metre at zoom 0, measured on the map itself (its
     globe scales with latitude a little differently from Mercator) and
     re-measured whenever it settles. The estimate is Mercator's. */
  let K = 512 / (2 * Math.PI * EARTH_M);
  const zoomForAlt = (alt) => Math.log2(H / (2 * TAN * alt * EARTH_M) / K);
  const altForZoom = (z) => H / (2 * TAN * EARTH_M * K * 2 ** z);
  const coarse = matchMedia('(pointer: coarse)').matches;
  function closeCamera(at = view) {
    return {
      center: [wrapLon(at.lon), at.lat],
      zoom: zoomForAlt(at.alt),
      pitch: pitchFor(at.alt) * R2D,
      padding: { top: Math.max(0, -shiftFor(at.alt) * H), bottom: 0, left: 0, right: 0 },
    };
  }
  function calibrate() {
    if (close) K = close.pxPerMetre() / 2 ** close.map.getZoom();
  }

  let closeReady = null;
  /** The close map, made once, in idle time — never in the middle of a
      gesture's frames. Resolves to its handle, or null if it cannot start. */
  function ensureClose() {
    if (closeReady) return closeReady;
    closeState = 'loading';
    const later = window.requestIdleCallback || ((fn) => setTimeout(fn, 1));
    closeReady = new Promise((r) => later(r, { timeout: 500 }))
      .then(() => import('./globe-close.js'))
      .then(({ createCloseMap }) => createCloseMap(stage, { assets, before: pinLayer, coarse, camera: closeCamera() }))
      .then((c) => {
        if (dead) { c.destroy(); return; }
        close = c;
        calibrate();
        const map = c.map;
        map.on('move', () => {
          if (!closeActive) return;
          const ce = map.getCenter();
          view.lat = ce.lat;
          view.lon = ce.lng;
          view.alt = altForZoom(map.getZoom());
          camDirty = true;
          kick();
        });
        map.on('moveend', () => {
          if (!closeActive) return;
          calibrate();
          closeFlying = false;
          if (view.alt > HANDBACK_ALT) handBack();
        });
        map.on('dragstart', () => { moved = true; touch(); });
        map.on('zoom', () => { if (closeActive && !closeFlying && view.alt > HANDBACK_ALT) handBack(); });
        closeState = 'ready';
        kick();
        return c;
      })
      .catch((err) => {
        closeState = 'failed';
        console.warn('[world] the close map could not start; the globe stays on its own.', err?.message || err);
        return null;
      });
    return closeReady;
  }

  /**
   * While the globe is still flying, walk the hidden close map down the zoom
   * levels the dive will pass through, over the destination, so that every
   * level's tiles are loaded before the reader sees any of them: the handoff
   * then waits a moment, not seconds, and the dive never goes through blur.
   * Cancelled by any later warm, and by the handoff itself.
   */
  let warmToken = 0;
  async function warmClose(lat, lon, zoom) {
    const token = ++warmToken;
    const c = await ensureClose();
    if (!c || closeActive || token !== warmToken) return;
    const m = c.map;
    const start = zoomForAlt(HANDOFF_ALT * 0.9);
    const stops = [start, 8.5, 11, 13, zoom].filter((z, i) => i === 0 || (z > start + 0.4 && z <= zoom + 0.01));
    const padding = { top: Math.max(0, -shiftFor(0.1) * H), bottom: 0, left: 0, right: 0 };
    for (const z of stops) {
      if (closeActive || closeState !== 'ready' || token !== warmToken) return;
      m.jumpTo({ center: [lon, lat], zoom: z, pitch: pitchFor(0.1) * R2D, padding });
      await c.settled(1800);
    }
    if (!closeActive && closeState === 'ready' && token === warmToken) m.jumpTo(closeCamera({ lat, lon, alt: HANDOFF_ALT * 0.9 }));
  }

  /** Cross-fade from the globe to the close map at exactly this camera. */
  async function handOff({ then = null } = {}) {
    /* A dive that arrives before the close map has loaded keeps its next step
       until the map is ready; the automatic handoff in the loop picks it up. */
    if (then) pendingThen = then;
    if (closeState !== 'ready' || closeActive) {
      if (then && closeState === 'loading') showHint('Loading the close-up map…');
      return false;
    }
    closeState = 'handing';
    warmToken++;
    const map = close.map;
    map.jumpTo(closeCamera());
    calibrate();
    map.jumpTo(closeCamera());
    /* A moment, not seconds: the warm-up has already loaded these tiles. */
    await close.settled(350);
    closeState = 'ready';
    if (dead || view.alt > HANDBACK_ALT) return false;
    map.jumpTo(closeCamera());
    calibrate();
    closeActive = true;
    figure.dataset.close = 'on';
    if (engaged) map.scrollZoom.enable(); else map.scrollZoom.disable();
    camDirty = true;
    kick();
    hideHint();
    const next = pendingThen;
    pendingThen = null;
    next?.();
    return true;
  }

  /** Give the camera back to the globe, where the close map left it. */
  function handBack() {
    if (!closeActive) return;
    closeActive = false;
    closeFlying = false;
    close.map.stop();
    delete figure.dataset.close;
    idleBase = null;
    camDirty = true;
    kick();
  }

  /**
   * A flight inside the close map, with the phone card's room kept clear.
   * Across first, at the current zoom, then — once that view's tiles are in
   * — down: never a dive into tiles that have not loaded.
   */
  async function closeFlyTo({ center, zoom }) {
    const m = close.map;
    const bottom = !card.hidden && card.getBoundingClientRect().width > W * 0.7 ? card.offsetHeight + 12 : 0;
    const padding = { top: Math.max(0, -shiftFor(0.1) * H), bottom, left: 0, right: 0 };
    const pitch = pitchFor(0.1) * R2D;
    if (cardSubject) cardSubject.alt = null;
    closeFlying = true;
    if (reducedMotion()) {
      m.jumpTo({ center, zoom, padding, pitch });
      return;
    }
    m.stop();
    closeFlying = true;
    const at = m.project(center);
    if (Math.hypot(at.x - W / 2, at.y - (H + padding.top - bottom) / 2) > Math.min(W, H) * 0.12) {
      await new Promise((r) => { m.once('moveend', r); m.easeTo({ center, padding, pitch, duration: 700 }); });
      closeFlying = true;
      await close.settled(800);
    }
    closeFlying = true;
    /* Already there: nothing to fly (a flyTo to where the camera is still
       animates, and would hold closeFlying for a second and a half). */
    const c0 = m.getCenter();
    if (Math.abs(m.getZoom() - zoom) < 0.05 && Math.hypot(c0.lng - center[0], c0.lat - center[1]) < 1e-4) {
      closeFlying = false;
      return;
    }
    m.flyTo({ center, zoom, padding, pitch, duration: 1500, essential: true });
  }

  /**
   * Leave the close map the way a reader arrived: zoom out in it to the
   * hand-back altitude, give the camera to the globe there, then carry on.
   * Used by Reset, by a country, and by a place that is far or off the stage.
   */
  function climbOut(then) {
    if (!closeActive) { then?.(); return; }
    const m = close.map;
    const zoom = zoomForAlt(HANDBACK_ALT * 1.05);
    closeFlying = true;
    if (cardSubject) cardSubject.alt = null;
    const done = () => { handBack(); then?.(); };
    /* Stop whatever the map was doing first: MapLibre ends an interrupted
       animation with its own 'moveend', which would otherwise be taken for
       the end of this climb and hand the camera back at street level (the
       round-2 "Reset pops to orbit"). */
    m.stop();
    closeFlying = true;
    if (reducedMotion()) { m.jumpTo({ zoom }); done(); return; }
    m.once('moveend', done);
    m.easeTo({ zoom, duration: 1100, easing: (t) => t * t * (3 - 2 * t) });
  }

  /* --- The loop ------------------------------------------------------------ */

  let raf = 0;
  let onScreen = true;
  let lastNow = 0;
  let first = true;
  let dead = false;
  let paused = false; // the QA harness's freeze-frame; never set by the page

  /* The frame-rate watch. If the first 30 consecutive frames run at a median
     over 25 ms the pixel ratio drops to 1; if the next 30 are still over 40 ms
     the globe gives up and the flat map takes over. */
  const gaps = [];
  let lowPower = false;
  function watchFrame(gap) {
    if (forced || gap > 250) return;
    gaps.push(gap);
    if (gaps.length < 30) return;
    const p50 = [...gaps].sort((a, b) => a - b)[15];
    gaps.length = 0;
    if (!lowPower && p50 > 25) { lowPower = true; resize(); return; }
    if (lowPower && p50 > 40) { destroy(); onFail?.('frames too slow'); }
    if (!lowPower || p50 <= 40) watchFrame.done = true;
  }

  function frame(now) {
    raf = 0;
    if (dead || paused || !onScreen || document.hidden) return;
    if (lastNow && !watchFrame.done) watchFrame(now - lastNow);
    const dt = lastNow ? Math.min(64, now - lastNow) : 16;
    lastNow = now;
    const moving = !!(flight || spin || (idle && !reducedMotion()));
    if (flight) stepFlight(now);
    else if (spin) stepSpin(dt);
    else if (idle && !reducedMotion()) stepIdle(now);

    if (closeState === 'none' && touched && view.alt < CLOSE_PRELOAD_ALT) ensureClose();
    /* A dive that has arrived before the close map is ready keeps sinking,
       slowly, instead of stopping dead: a still frame reads as broken, a slow
       descent reads as "nearly there". */
    const waiting = !!pendingThen && !closeActive && !flight && closeState !== 'ready' && closeState !== 'failed' && !reducedMotion();
    if (waiting) {
      view.alt = Math.max(MIN_ALT * 1.15, view.alt * (1 - dt * 0.00018));
      camDirty = true;
    }
    if (!closeActive && closeState === 'ready' && view.alt <= HANDOFF_ALT && !flight && !pointers.size) handOff();

    const drifting = !closeActive && cloudTex && !reducedMotion() && cloudAlpha() > 0.01;
    if (camDirty || (drifting && now - lastDraw > 48)) {
      /* Under the close map the globe is covered; only the pins move. */
      if (!closeActive) draw(now);
      if (camDirty) layoutPins();
      camDirty = false;
      if (first) {
        first = false;
        figure.dataset.globe = 'on';
        /* Once the globe is showing, and the browser has nothing better to do:
           the 4096 day map, and the finer borders (parsed now rather than as
           a hitch on the first dive). */
        /* The 4096 day map and the finer borders now wait for the first
           gesture (touch()), not for idle time on every visit — except on a
           single-country page, where the country's own outline is the
           subject of the resting view and a 110m outline of it is a polygon. */
        if (home) (window.requestIdleCallback || ((fn) => setTimeout(fn, 800)))(() => maybeFine(0), { timeout: 3000 });
      }
    }
    if (moving || waiting || flight || spin || drifting || camDirty) raf = requestAnimationFrame(frame);
    else lastNow = 0;
  }
  function kick() {
    if (!raf && !dead && !paused && onScreen && !document.hidden) raf = requestAnimationFrame(frame);
  }

  /* --- Lighting, both ways ------------------------------------------------- */

  let lit = null;
  function light(key, { fromMap = false } = {}) {
    if (lit === key) return;
    lit = key;
    litSet = new Set(key ? key.split(' ') : []);
    if ([...litSet].some((id) => CLOSE_ZOOM[byId.get(id)?.precision])) ensureClose();
    for (const [pid, a] of links) a.toggleAttribute('data-on', litSet.has(pid));
    void fromMap;
    camDirty = true;
    kick();
  }

  /* --- Cards --------------------------------------------------------------- */

  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  let cardReturn = null;
  /* What the open card is about: a point on the sphere, and the altitude the
     camera arrived at. A card whose subject has left the view — panned off,
     round the back, or zoomed far out from — closes itself. */
  let cardSubject = null;
  function cardStillAbout() {
    if (cardSubject.alt == null) { cardSubject.alt = view.alt; return; }
    const s = project(cardSubject.xyz);
    const off = s.facing <= 0.02 || s.x < -20 || s.x > W + 20 || s.y < -20 || s.y > H + 20;
    if (off || view.alt > cardSubject.alt * 2.5) closeCard();
  }

  function openCard(build, { focus = false, from = null } = {}) {
    card.replaceChildren();
    const close = el('button', { type: 'button', class: 'world__card-close', 'aria-label': 'Close' }, '×');
    close.addEventListener('click', () => closeCard({ restore: true }));
    card.append(close);
    build(card);
    card.hidden = false;
    cardReturn = from;
    if (focus) card.querySelector('h3')?.focus({ preventScroll: true });
  }

  function closeCard({ restore = false } = {}) {
    if (card.hidden) return;
    card.hidden = true;
    card.replaceChildren();
    if (selectedCountry) { selectedCountry = null; paintMask(home); }
    cardSubject = null;
    if (restore && cardReturn?.isConnected) cardReturn.focus({ preventScroll: true });
    cardReturn = null;
    camDirty = true;
    kick();
  }

  function placeCard(p, opts) {
    cardSubject = { xyz: p.xyz, alt: null };
    openCard((c) => {
      if (p.image) {
        const img = el('img', { class: 'world__card-img', src: p.image, alt: '', loading: 'lazy', decoding: 'async' });
        img.addEventListener('error', () => img.remove());
        c.append(img);
      }
      c.append(el('h3', { class: 'world__card-title', tabindex: '-1' }, p.name));
      const facts = [];
      if (unit && p.count) facts.push(plural(p.count, unit));
      if (p.state) facts.push(p.state);
      if (facts.length) c.append(el('p', { class: 'world__card-meta' }, facts.join(' · ')));
      if (p.cue) c.append(el('p', { class: 'world__card-cue' }, p.cue));
      const dest = pages.get(p.country);
      if (dest && !sameHref(dest.href, p.href) && !sameHref(dest.href, location.pathname)) {
        c.append(el('p', { class: 'world__card-where' }, `In ${dest.name}`));
      }
      if (p.href) c.append(actionFor(p));
    }, opts);
  }

  /* One real link per card, so site.js's rule — another site, or one
     university's or programme's page, opens in a new tab — covers it like any
     other link. A page that wants the choice for itself (the explorer filters
     on it) says so by cancelling `world:select`, and then the link does not
     navigate. */
  function actionFor(p) {
    const inPage = p.href.startsWith('#');
    const label = inPage
      ? (unit && p.count ? `Show the ${plural(p.count, unit)} here` : 'Show what is here')
      : p.external ? 'Visit their website' : `Open ${p.name.replace(/^\p{RI}{2}\s*/u, '')}`;
    const a = el('a', { class: 'world__card-go', href: p.href }, label);
    if (p.external) a.rel = 'noopener nofollow';
    a.addEventListener('click', (e) => {
      const ev = new CustomEvent('world:select', { detail: { id: p.id, name: p.name, href: p.href }, cancelable: true, bubbles: true });
      if (!figure.dispatchEvent(ev)) {
        e.preventDefault();
        closeCard();
      }
    });
    return a;
  }

  function countryCard(country, opts) {
    cardSubject = { xyz: norm(country.frame.reduce((s, q) => [s[0] + q[0], s[1] + q[1], s[2] + q[2]], [0, 0, 0])), alt: null };
    const here = places.filter((p) => p.country === country.id);
    const total = here.reduce((n, p) => n + (p.count || 0), 0);
    const dest = pages.get(country.id);
    openCard((c) => {
      /* One place in the country — on a page of countries, the place is the
         country — so its picture and its count are the country's. */
      const only = here.length === 1 ? here[0] : null;
      if (only?.image) {
        const img = el('img', { class: 'world__card-img', src: only.image, alt: '', loading: 'lazy', decoding: 'async' });
        img.addEventListener('error', () => img.remove());
        c.append(img);
      }
      c.append(el('h3', { class: 'world__card-title', tabindex: '-1' }, `${dest?.flag ? `${dest.flag} ` : ''}${dest?.name || country.name}`));
      const line = !here.length
        ? 'Nothing on this map here yet.'
        : only
          ? [unit && total ? plural(total, unit) : '', only.state].filter(Boolean).join(' · ') || only.name
          : [plural(here.length, 'place'), unit && total ? plural(total, unit) : ''].filter(Boolean).join(' · ') + ' on this map';
      c.append(el('p', { class: 'world__card-meta' }, line));
      if (here.length > 1 && here.length <= 8) {
        const ul = el('ul', { class: 'world__card-list' });
        for (const p of here) {
          const b = el('button', { type: 'button' }, p.name);
          b.addEventListener('click', () => goToPlace(p, { focus: true }));
          const li = el('li'); li.append(b); ul.append(li);
        }
        c.append(ul);
      }
      if (dest && !sameHref(dest.href, location.pathname)) {
        c.append(el('a', { class: 'world__card-go', href: dest.href }, `Open the ${dest.name} page`));
      } else if (!dest) {
        c.append(el('p', { class: 'world__card-cue' }, 'This guide does not cover it yet.'));
      }
    }, opts);
  }

  function crowdCard(members, { xyz, ...opts } = {}) {
    cardSubject = { xyz, alt: null };
    openCard((c) => {
      c.append(el('h3', { class: 'world__card-title', tabindex: '-1' }, `${members.length} places here`));
      c.append(el('p', { class: 'world__card-meta' }, 'Too close together to separate on the map. Choose one:'));
      const ul = el('ul', { class: 'world__card-list' });
      for (const p of members) {
        const b = el('button', { type: 'button' }, p.name);
        b.addEventListener('click', () => { placeCard(p, { focus: true }); light(p.id); });
        const li = el('li'); li.append(b); ul.append(li);
      }
      c.append(ul);
    }, opts);
  }

  function sameHref(a, b) {
    if (!a || !b) return false;
    try { return new URL(a, location.href).pathname === new URL(b, location.href).pathname; } catch { return false; }
  }

  function paintMask(country) {
    maskCtx.fillStyle = '#000';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    if (country) {
      maskCtx.fillStyle = '#fff';
      traceRings(maskCtx, country.rings, maskCanvas.width, maskCanvas.height);
    }
    gl.bindTexture(gl.TEXTURE_2D, maskTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gl.LUMINANCE, gl.UNSIGNED_BYTE, maskCanvas);
  }

  /* --- Acting -------------------------------------------------------------- */

  function arrivalMessage(name) {
    const bits = [`${name}.`];
    const ids = groups.filter((g) => project(g.xyz).facing > 0).length;
    if (ids) bits.push(`${ids} ${ids === 1 ? 'light' : 'lights'} in view.`);
    return bits.join(' ');
  }

  /**
   * Where the camera must point so that `xyz` lands in the middle of the room
   * left above a card that sits along the bottom of the stage (a phone), rather
   * than under it. On a wide stage the card is in a corner and nothing moves.
   */
  function frameAbove(target, xyz) {
    const r = card.hidden ? null : card.getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    if (!r || r.top - sr.top < H * 0.3 || r.width < W * 0.7) return target;
    const want = (r.top - sr.top) / 2;
    let t = { ...target };
    for (let i = 0; i < 4; i++) {
      const s = project(xyz, solveCamera(t, {}));
      const k = radPerPx(t.alt) * R2D * (1 + Math.sin(pitchFor(t.alt)));
      t = { ...t, lat: Math.max(-80, Math.min(80, t.lat - (s.y - want) * k * 0.8)) };
    }
    return t;
  }

  /* --- History: a deliberate choice is a step Back can undo ----------------
   *
   * Choosing a place or a country pushes one history entry (#place=… or
   * #country=…), and Back returns the globe to what it showed before — the
   * previous choice, or the camera and no card — instead of leaving the page.
   * Drags, zooms and spins push nothing: they are looking, not choosing. The
   * entry being left is first stamped with the camera and choice it had, so
   * there is always something exact to go back to. Reduced motion makes the
   * return instant, like every other camera change.
   */
  let currentSel = null;
  let restoring = false;
  const sameSel = (a, b) => !!a && !!b && a.kind === b.kind && a.id === b.id;
  function remember(sel) {
    if (restoring || sameSel(sel, currentSel)) return;
    try {
      history.replaceState(
        { ...(history.state || {}), world: figure.id, sel: currentSel, cam: { lat: view.lat, lon: view.lon, alt: view.alt } },
        ''
      );
      history.pushState({ world: figure.id, sel, cam: null }, '', `#${sel.kind}=${encodeURIComponent(sel.id)}`);
    } catch { /* a sandboxed frame without history: choices still work, Back just leaves */ }
    currentSel = sel;
  }
  function select(sel) {
    if (sel.kind === 'place') { const p = byId.get(sel.id); if (p) goToPlace(p, { push: false }); return !!p; }
    const c = geography.byId.get(sel.id);
    if (c) goToCountry(c, { push: false });
    return !!c;
  }
  const onPop = (e) => {
    const st = e.state;
    if (st?.world && st.world !== figure.id) return;
    restoring = true;
    try {
      if (st?.sel && select(st.sel)) {
        currentSel = st.sel;
      } else {
        currentSel = null;
        closeCard();
        const cam = st?.cam;
        if (cam) climbOut(() => flyTo(cam, { travel: true }));
        else goHome();
      }
    } finally {
      restoring = false;
    }
  };
  window.addEventListener('popstate', onPop);

  /**
   * Fly to one place. A place known to its city or campus dives through the
   * clouds on the globe and carries on down in the close map, to the city or
   * to street level; a place known only to its country stops on the globe.
   */
  function goToPlace(p, { focus = false, from = null, push = true } = {}) {
    if (push) remember({ kind: 'place', id: p.id });
    light(p.id);
    selectedCountry = null;
    paintMask(home);
    placeCard(p, { focus, from });
    const zoom = CLOSE_ZOOM[p.precision];
    if (zoom && closeState !== 'failed') {
      if (closeActive) {
        /* Far, or off the stage: up through the globe and down again, with
           the clouds, rather than across blank tiles at street level. */
        const s = close.project(p.lon, p.lat);
        const onStage = s.x > 0 && s.x < W && s.y > 0 && s.y < H;
        if (!onStage || angle(toXYZ(view.lat, view.lon), p.xyz) > HOP) {
          climbOut(() => goToPlace(p, { focus: false, push: false }));
          return;
        }
        /* The place's own depth, not wherever the camera happens to be: a
           city is a city even when you arrive from a campus. */
        closeFlyTo({ center: [p.lon, p.lat], zoom });
        say(`Flying to ${p.name}.`);
        return;
      }
      warmClose(p.lat, p.lon, zoom);
      const onArrive = () => handOff({ then: () => closeFlyTo({ center: [p.lon, p.lat], zoom }) });
      flyTo({ lat: p.lat, lon: p.lon, alt: Math.min(view.alt, HANDOFF_ALT * 0.9) }, { announce: p.name, travel: true, onArrive });
      return;
    }
    if (closeActive) { climbOut(() => goToPlace(p, { focus: false, push: false })); return; }
    const alt = Math.min(view.alt, Math.max(MIN_ALT * 3, 0.32));
    flyTo(frameAbove({ lat: p.lat, lon: p.lon, alt }, p.xyz), { announce: p.name, travel: true });
  }

  function goToCountry(country, { focus = false, push = true } = {}) {
    if (push) remember({ kind: 'country', id: country.id });
    if (closeActive) { climbOut(() => goToCountry(country, { focus, push: false })); return; }
    selectedCountry = country;
    paintMask(country);
    const fit = fitCamera(country.frame, { maxAlt: 2.4, minAlt: 0.2 });
    countryCard(country, { focus });
    flyTo(frameAbove(fit, cardSubject.xyz), { announce: pages.get(country.id)?.name || country.name, travel: true });
  }

  /**
   * A group dives until it splits. Only a group whose whole *diameter* still
   * fits inside one pin at the closest zoom is "too close to separate" and
   * opens a list instead — judging by the closest pair called twelve Danish
   * cities one spot because two of them are 3 km apart.
   */
  function openGroup(members) {
    let minAng = Infinity, maxAng = 0;
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const a = angle(members[i].xyz, members[j].xyz);
        minAng = Math.min(minAng, a);
        maxAng = Math.max(maxAng, a);
      }
    }
    const centre = norm(members.reduce((s, m) => [s[0] + m.xyz[0], s[1] + m.xyz[1], s[2] + m.xyz[2]], [0, 0, 0]));
    const [lat, lon] = toLatLon(centre);
    const altToSplit = (ang) => (ang / (PIN_GAP * 1.25)) * H / (2 * TAN);
    /* With the close map available the floor is street level, not the globe's. */
    const floor = closeState === 'failed' ? MIN_ALT : altForZoom(17);
    const bounds = () => {
      const lats = members.map((m) => m.lat), lons = members.map((m) => m.lon);
      return [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]];
    };
    const announce = `${members.length} places`;
    /* In the close map: frame the group, always closer than now and never so
       far out that the camera would be handed straight back (the old bounce). */
    const fitClose = () => {
      const m = close.map;
      const pad = Math.min(60, W * 0.08);
      const cam = m.cameraForBounds(bounds(), { padding: { top: Math.max(0, -shiftFor(0.1) * H) + pad, bottom: pad, left: pad, right: pad }, maxZoom: 17 });
      const z = Math.min(17, Math.max(cam?.zoom ?? 0, m.getZoom() + 0.6, zoomForAlt(HANDOFF_ALT) + 0.3));
      const c = cam?.center ? [cam.center.lng, cam.center.lat] : [lon, lat];
      closeFlyTo({ center: c, zoom: z });
    };
    if (altToSplit(maxAng) < floor) {
      crowdCard(members, { xyz: centre });
      if (closeActive) { closeFlyTo({ center: [lon, lat], zoom: Math.max(close.map.getZoom(), 15) }); return; }
      flyTo(frameAbove({ lat, lon, alt: Math.max(MIN_ALT, Math.min(view.alt, 0.25)) }, centre), { announce });
      return;
    }
    if (closeActive) { fitClose(); return; }
    /* Decide the engine before diving: frame the whole group on the globe; if
       that frame is above the handoff the globe does it alone (the next click
       on a smaller group goes further), and only a frame below the handoff
       dives through to the close map. */
    const fit = fitCamera(members.map((m) => m.xyz), { maxAlt: view.alt * 0.8, minAlt: floor });
    const target = Math.min(fit.alt, view.alt * 0.7);
    if (target >= HANDOFF_ALT || closeState === 'failed') {
      flyTo({ lat: fit.lat, lon: fit.lon, alt: Math.max(MIN_ALT, target) }, { announce });
      return;
    }
    warmClose(fit.lat, fit.lon, zoomForAlt(target));
    flyTo({ lat: fit.lat, lon: fit.lon, alt: HANDOFF_ALT * 0.9 }, { announce, onArrive: () => handOff({ then: fitClose }) });
  }

  function say(message) { status.textContent = message; }

  /* --- Pointer ------------------------------------------------------------- */

  let engaged = false;    // the reader has taken hold of the globe on this visit
  const pointers = new Map();
  let drag = null;
  let pinch = null;
  let moved = false;
  let downOn = null;

  const setTouchAction = () => { stage.style.touchAction = engaged ? 'none' : 'pan-y'; };
  setTouchAction();

  function engage() {
    if (!engaged) { engaged = true; setTouchAction(); stage.dataset.engaged = 'true'; }
    close?.map.scrollZoom.enable();
    /* Taking hold of the globe is the first sign someone may dive: fetch the
       close map now, so it is there when they arrive. */
    if (places.some((p) => CLOSE_ZOOM[p.precision])) ensureClose();
  }
  /* A finger that has taken hold of the globe cannot scroll the page over it,
     and on a phone the globe is half the screen. So a touch hold lets go
     PHONE_HOLD_MS after the last gesture, and the hint says how to let go
     sooner. A mouse keeps its hold until it leaves the stage. */
  let holdTimer = 0;
  let toldHowToLetGo = false;
  function touchHeld() {
    clearTimeout(holdTimer);
    holdTimer = setTimeout(disengage, PHONE_HOLD_MS);
    if (!toldHowToLetGo) { toldHowToLetGo = true; showHint('Tap outside the globe to scroll the page'); }
  }
  function disengage() {
    if (engaged) { engaged = false; setTouchAction(); delete stage.dataset.engaged; }
    close?.map.scrollZoom.disable();
  }

  stage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.world__controls, .world__card, .world__credit')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    touch();
    /* A mouse takes hold at once. A finger takes hold on a tap or a sideways
       drag, so a thumb swiping up the page still scrolls it (touch-action is
       pan-y until then). */
    if (e.pointerType === 'mouse') engage();
    downOn = e.target.closest('.world__pin, .world__cluster');
    if (closeActive) { moved = false; return; } // the close map drags itself
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    flight = null;
    rush = 0;
    spin = null;
    if (pointers.size === 1) {
      moved = false;
      drag = { x: e.clientX, y: e.clientY, t: performance.now(), vLat: 0, vLon: 0 };
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { gap: Math.hypot(a.x - b.x, a.y - b.y) || 1, alt: view.alt, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
      drag = null;
      moved = true;
    }
  });

  stage.addEventListener('pointermove', (e) => {
    if (closeActive) return;
    if (!pointers.has(e.pointerId)) {
      // Hovering: which country is under the pointer.
      if (e.pointerType === 'mouse' && !e.target.closest('.world__pin, .world__cluster, .world__controls, .world__card')) {
        const hit = pick(e.clientX, e.clientY);
        const c = hit ? geography.countryAt(hit.lat, hit.lon) : null;
        if (c !== hoverCountry) { hoverCountry = c; stage.style.cursor = c ? 'pointer' : ''; camDirty = true; kick(); }
      }
      return;
    }
    const prev = pointers.get(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      const gap = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      view.alt = clampAlt(pinch.alt * (pinch.gap / gap));
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      turn(mx - pinch.mx, my - pinch.my);
      pinch.mx = mx; pinch.my = my;
      camDirty = true;
      kick();
      return;
    }
    if (!drag) return;
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
    if (!moved && Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 5) {
      moved = true;
      /* Captured only once it is a drag: capturing on the press would retarget
         the click to the stage and a pin could never be clicked. */
      try { stage.setPointerCapture(e.pointerId); } catch {}
    }
    if (!moved) return;
    const now = performance.now();
    const dt = Math.max(1, now - drag.t);
    const [dLat, dLon] = turn(dx, dy);
    drag.vLat = drag.vLat * 0.6 + (dLat / dt) * 0.4;
    drag.vLon = drag.vLon * 0.6 + (dLon / dt) * 0.4;
    drag.t = now;
    stage.dataset.dragging = 'true';
    camDirty = true;
    kick();
  });

  /** Turn the globe by a drag of dx, dy CSS pixels. Returns what it did. */
  function turn(dx, dy) {
    const k = radPerPx() * R2D;
    const dLon = (-dx * k) / Math.max(0.25, Math.cos(view.lat * D2R));
    const dLat = dy * k * (1 + Math.sin(cam.pitch) * 0.9);
    view.lat = Math.max(-80, Math.min(80, view.lat + dLat));
    view.lon = wrapLon(view.lon + dLon);
    return [dLat, dLon];
  }

  const endPointer = (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    try { stage.releasePointerCapture(e.pointerId); } catch {}
    if (pinch && pointers.size < 2) {
      pinch = null;
      clusterAt = -1;
      camDirty = true;
      kick();
      if (pointers.size === 1) {
        const [p] = [...pointers.values()];
        drag = { x: p.x, y: p.y, t: performance.now(), vLat: 0, vLon: 0 };
      }
      return;
    }
    if (drag && moved && e.type === 'pointerup' && !reducedMotion() && performance.now() - drag.t < 80) {
      const speed = Math.abs(drag.vLat) + Math.abs(drag.vLon);
      if (speed > 0.002) spin = { vLat: drag.vLat, vLon: drag.vLon };
    }
    if (e.type === 'pointerup' && e.pointerType !== 'mouse') { engage(); touchHeld(); }
    drag = null;
    delete stage.dataset.dragging;
    kick();
  };
  stage.addEventListener('pointerup', endPointer);
  stage.addEventListener('pointercancel', endPointer);
  stage.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse') {
      disengage();
      if (hoverCountry) { hoverCountry = null; camDirty = true; kick(); }
    }
    if (!pointers.size) light(null);
  });
  const onOutside = (e) => { if (!stage.contains(e.target)) disengage(); };
  document.addEventListener('pointerdown', onOutside);

  /* One click: a pin opens its card, a group dives, a country flies, the sea
     closes whatever was open. A double click zooms in on the spot. */
  let clickTimer = 0;
  let lastTap = null;
  stage.addEventListener('click', (e) => {
    if (moved) return;
    if (e.target.closest('.world__controls, .world__card, .world__credit')) return;
    const pinEl = e.target.closest('.world__pin') || (downOn?.classList.contains('world__pin') ? downOn : null);
    const clusterEl = e.target.closest('.world__cluster') || (downOn?.classList.contains('world__cluster') ? downOn : null);
    downOn = null;
    if (pinEl) { const p = byId.get(pinEl.dataset.place); if (p) goToPlace(p); return; }
    if (clusterEl?._members) { openGroup(clusterEl._members); return; }
    /* On the close map a bare click only closes the card: at street level a
       click on the ground is exploring, not choosing a country. */
    if (closeActive) { if (e.target.closest('.world__close')) closeCard(); return; }
    const at = { x: e.clientX, y: e.clientY };
    const now = performance.now();
    if (lastTap && now - lastTap.t < 330 && Math.hypot(at.x - lastTap.x, at.y - lastTap.y) < 30) {
      clearTimeout(clickTimer);
      lastTap = null;
      const hit = pick(at.x, at.y);
      if (hit) flyTo({ lat: hit.lat, lon: hit.lon, alt: view.alt <= MIN_ALT * 1.05 ? rest.alt : view.alt * 0.4 });
      return;
    }
    lastTap = { ...at, t: now };
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => {
      const hit = pick(at.x, at.y);
      const country = hit ? geography.countryAt(hit.lat, hit.lon) : null;
      if (country) goToCountry(country);
      else closeCard();
    }, 250);
  });

  /* The wheel zooms only once the reader has taken hold of the globe — by
     clicking or dragging it — or with Ctrl/⌘ held, which is also what a
     trackpad pinch sends. A wheel passing over the map on its way down the
     page scrolls the page, and a short hint says how to take hold. */
  stage.addEventListener('wheel', (e) => {
    if (!engaged && !e.ctrlKey && !e.metaKey) { showHint(); return; }
    if (closeActive) {
      /* The close map zooms itself — but pins, labels and the card sit above
         its canvas, and a wheel over them would bubble here and scroll the
         page away mid-zoom. So the page is never scrolled from here, and a
         wheel that did not start on the map is handed to it. */
      e.preventDefault();
      if (!engaged) engage();
      if (!e.target.closest?.('.world__close')) {
        close.map.getCanvas().dispatchEvent(new WheelEvent('wheel', {
          deltaX: e.deltaX, deltaY: e.deltaY, deltaZ: e.deltaZ, deltaMode: e.deltaMode,
          clientX: e.clientX, clientY: e.clientY, screenX: e.screenX, screenY: e.screenY,
          ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, altKey: e.altKey,
          bubbles: true, cancelable: true,
        }));
      }
      return;
    }
    e.preventDefault();
    touch();
    flight = null; rush = 0; spin = null;
    const factor = Math.exp(Math.max(-0.6, Math.min(0.6, e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0018))));
    const alt = clampAlt(view.alt * factor);
    const hit = pick(e.clientX, e.clientY);
    if (hit && alt < view.alt) {
      // Zoom towards the pointer: move the target a share of the way to it.
      const p = slerp(toXYZ(view.lat, view.lon), hit.xyz, 1 - alt / view.alt);
      [view.lat, view.lon] = toLatLon(p);
      view.lat = Math.max(-80, Math.min(80, view.lat));
    }
    view.alt = alt;
    camDirty = true;
    kick();
  }, { passive: false });

  let hintTimer = 0;
  function showHint(text) {
    hint.textContent = text || (matchMedia('(pointer: coarse)').matches
      ? 'Tap the globe to take hold of it'
      : `Click the globe to zoom with the wheel — or hold ${/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'}`);
    hint.hidden = false;
    clearTimeout(hintTimer);
    hintTimer = setTimeout(hideHint, 1600);
  }
  function hideHint() { hint.hidden = true; }

  /* --- Keyboard ------------------------------------------------------------ */

  stage.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target !== stage && e.key !== 'Escape') return;
    const step = Math.max(2, radPerPx() * R2D * Math.min(W, H) * 0.22);
    if (closeActive && e.key !== 'Escape' && e.key !== '0') {
      const pan = Math.min(W, H) * 0.22;
      const m = close.map;
      const by = { ArrowLeft: [-pan, 0], ArrowRight: [pan, 0], ArrowUp: [0, -pan], ArrowDown: [0, pan] }[e.key];
      const animate = !reducedMotion();
      if (by) { e.preventDefault(); m.panBy(by, { animate }); return; }
      if (e.key === '+' || e.key === '=') { e.preventDefault(); m.zoomIn({ animate }); return; }
      if (e.key === '-' || e.key === '_') { e.preventDefault(); m.zoomOut({ animate }); return; }
      return;
    }
    const keys = {
      ArrowLeft: () => flyTo({ ...view, lon: view.lon - step / Math.max(0.3, Math.cos(view.lat * D2R)) }),
      ArrowRight: () => flyTo({ ...view, lon: view.lon + step / Math.max(0.3, Math.cos(view.lat * D2R)) }),
      ArrowUp: () => flyTo({ ...view, lat: view.lat + step }),
      ArrowDown: () => flyTo({ ...view, lat: view.lat - step }),
      '+': () => zoomBy(0.55),
      '=': () => zoomBy(0.55),
      '-': () => zoomBy(1 / 0.55),
      _: () => zoomBy(1 / 0.55),
      0: () => goHome(),
      Escape: () => (card.hidden ? goHome() : closeCard({ restore: true })),
    };
    const act = keys[e.key];
    if (!act) return;
    e.preventDefault();
    act();
  });

  function zoomBy(f) {
    if (closeActive) {
      if (f < 1) close.map.zoomIn({ animate: !reducedMotion() });
      else close.map.zoomOut({ animate: !reducedMotion() });
      return;
    }
    flyTo({ ...view, alt: view.alt * f });
  }
  function goHome() {
    closeCard();
    climbOut(() => flyTo({ ...rest }, { announce: 'the whole view', travel: true }));
  }

  zoomIn.addEventListener('click', () => zoomBy(0.5));
  zoomOut.addEventListener('click', () => zoomBy(2));
  zoomReset.addEventListener('click', goHome);

  /* --- The list, which is the other half of every one of these ------------- */

  for (const [id, a] of links) {
    a.addEventListener('pointerenter', () => light(id));
    a.addEventListener('pointerleave', () => light(null));
    a.addEventListener('focus', () => light(id));
    a.addEventListener('blur', () => light(null));
    /* Activating an entry flies the globe to it and opens its card, which
       carries the link. A modified click is left to the browser, so "open in
       a new tab" still works on the list. */
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const p = byId.get(id);
      if (!p) return;
      e.preventDefault();
      const keyboard = e.detail === 0;
      goToPlace(p, { focus: keyboard, from: a });
      /* Bring the whole stage into view below the sticky masthead, or the
         card that just opened is under it. */
      const r = stage.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(root).scrollPaddingTop) || 88;
      if (r.top < pad || r.bottom > innerHeight) {
        scrollTo({ top: r.top + scrollY - pad, behavior: reducedMotion() ? 'auto' : 'smooth' });
      }
    });
  }

  /* --- Being polite about resources ---------------------------------------- */

  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  const io = new IntersectionObserver((entries) => {
    onScreen = entries.some((en) => en.isIntersecting);
    if (onScreen) { camDirty = true; kick(); }
  }, { rootMargin: '120px' });
  io.observe(stage);
  const onVisibility = () => { if (!document.hidden) { lastNow = 0; camDirty = true; kick(); } };
  document.addEventListener('visibilitychange', onVisibility);
  const onMotion = () => {
    if (reducedMotion()) { idle = false; stopMotion(); if (flight) { Object.assign(view, flight.to); } }
    camDirty = true;
    kick();
  };
  const motionObserver = new MutationObserver(onMotion);
  motionObserver.observe(root, { attributes: true, attributeFilter: ['data-motion'] });
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', onMotion);

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    destroy();
    onFail?.();
  });

  function destroy() {
    dead = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    motionObserver.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    document.removeEventListener('pointerdown', onOutside);
    window.removeEventListener('popstate', onPop);
    canvas.remove(); pinLayer.remove(); controls.remove(); card.remove(); hint.remove(); credit.remove(); status.remove();
    legendHint?.remove();
    close?.destroy();
    delete figure.dataset.close;
    delete figure.dataset.globe;
  }

  /* --- Go ------------------------------------------------------------------ */

  resize();
  let rest = restCamera();
  Object.assign(view, rest);
  paintMask(home);

  const controller = {
    figure,
    /** Re-weight the pins from a filtered set: size means how much is here,
        never how good it is. The list badges follow, as on the flat map. */
    setCounts(counts, { selected = '' } = {}) {
      for (const p of places) {
        const n = counts.get(p.id) || 0;
        p.count = n;
        p.dim = n === 0;
        p.selected = !!selected && p.id === selected;
        const a = links.get(p.id);
        if (a) {
          const badge = a.querySelector('.world__count');
          if (badge) badge.textContent = String(n);
          a.toggleAttribute('data-dim', n === 0);
          if (p.selected) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        }
      }
      svg?.setAttribute('aria-label', `${layer}: ${counts.size} of ${places.length} places match the current filters.`);
      clusterAt = -1;
      camDirty = true;
      kick();
    },
    reset() { goHome(); },
    destroy,
    /* For the QA scripts and the console: the camera, and the few actions a
       screenshot needs to be taken mid-way through. Not used by the page. */
    debug: {
      view, get rest() { return rest; }, places, groups: () => groups, flyTo, goToPlace, goToCountry, openGroup,
      country: (id) => geography.byId.get(id),
      get close() { return { state: closeState, active: closeActive, zoom: close?.map.getZoom() ?? null, K }; },
      handOff, handBack, ensureClose,
      closeMap: () => close?.map, camPitch: () => cam.pitch * R2D,
      mineAt: (lat, lon) => { solveCamera(view); const was = closeActive; closeActive = false; const r = project(toXYZ(lat, lon)); closeActive = was; return r; },
      /** How far, in pixels, the globe's own projection puts each facing
          place from where the close map draws it — the handoff's seam. */
      seam: () => {
        if (!close) return null;
        solveCamera(view);
        let worst = 0;
        for (const p of places) {
          const mine = (() => { const was = closeActive; closeActive = false; const r = project(p.xyz); closeActive = was; return r; })();
          if (mine.facing <= 0.1 || mine.x < 0 || mine.x > W || mine.y < 0 || mine.y > H) continue;
          const q = close.project(p.lon, p.lat);
          worst = Math.max(worst, Math.hypot(q.x - mine.x, q.y - mine.y));
        }
        return +worst.toFixed(1);
      },
      pickAt: (clientX, clientY) => { const h = pick(clientX, clientY); return h ? { lat: h.lat, lon: h.lon, country: geography.countryAt(h.lat, h.lon)?.id || null } : null; }, get drawMs() { return drawMs; }, pause: () => { paused = true; }, resume: () => { paused = false; kick(); },
      /** Put a paused flight at an exact fraction of the way, and draw it. */
      stepTo: (frac) => {
        if (!flight) return false;
        const now = flight.t0 + flight.dur * frac;
        stepFlight(now);
        draw(now);
        layoutPins();
        return true;
      },
    },
  };
  kick();
  /* A link to a choice — #place=… or #country=… — opens on it. */
  const linked = location.hash.match(/^#(place|country)=(.+)$/);
  if (linked) {
    const sel = { kind: linked[1], id: decodeURIComponent(linked[2]) };
    restoring = true;
    try { if (select(sel)) currentSel = sel; } finally { restoring = false; }
  }
  return controller;
}

/* --- Small helpers --------------------------------------------------------- */

function el(tag, attrs = {}, text) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text) node.textContent = text;
  return node;
}

function button(label, glyph) {
  const b = el('button', { type: 'button', class: 'world__btn', 'aria-label': label, title: label });
  b.textContent = glyph;
  return b;
}
