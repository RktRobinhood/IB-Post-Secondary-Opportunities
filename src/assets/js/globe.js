/* The world window as a globe. ADR 0005.
 *
 * Hand-written WebGL 1, no library. `map.js` imports this only once the figure
 * is near the viewport and only where WebGL exists; until then the stage is
 * empty and transparent, and wherever this throws the list under it is the
 * whole map (ADR 0007: the flat map that used to stand in was removed), so
 * nothing here is ever the only way to see a place.
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
const MAX_ALT = 6.5;         // the desk view is the furthest out a page goes; a tall, narrow stage needs this much
const REST_MAX_ALT = 1.4;   // a single-country page rests no further out; a region shown by show({ bounds }), 1.6x this
const HOME_REST_MIN_ALT = 0.2; // …and no closer: its country, not a group of its places
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
/* The desk globe (the owner, 25 September 2026): at rest the Earth stands in
   a brass meridian ring on a stand, its axis tipped 23.4°, and turns only left
   and right, like the globe on a classroom desk. Choosing somewhere turns it
   to face you and then leans in; the stand fades and the axis straightens as
   the camera comes close, so the dive and the close map are unchanged. */
const TILT = 23.44 * D2R;
const DESK_LAT_MAX = 40;    // the eye sits this far above the equator at most: looking down a little at a desk
/* The assembly in globe radii: the ring's outer edge above, the foot of the
   stand below. The resting camera fits both in the stage. */
const DESK_TOP = 1.13, DESK_BOTTOM = 1.62, DESK_SIDE = 1.16;

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
uniform vec2 uTexel; uniform vec4 uDetailRect; uniform vec2 uDetailTexel; uniform float uDetailOn; uniform float uPunch; uniform float uToon;
uniform sampler2D uPol; uniform float uPolOn; uniform float uInk;
varying vec3 vN; varying vec2 vUv; varying vec3 vW;
float wet(vec3 c) { return smoothstep(0.015, 0.09, c.b - max(c.r, c.g)); }
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
  /* Water is where blue leads: a glint there, none on land. */
  /* On the desk, land and water come from the country raster, not from the
     photograph's colour: a dark or shallow sea read as land by colour
     (round 4: a black Caspian, black bands along coasts). The ink line is
     where that raster's coverage changes, one of its texels away. */
  vec4 pol = texture2D(uPol, vUv);
  float onDesk = clamp(uPolOn * 2.0, 0.0, 1.0);
  float water = mix(wet(c), 1.0 - pol.a, onDesk);
  float px = texture2D(uPol, vUv + vec2(1.0 / 1024.0, 0.0)).a;
  float py = texture2D(uPol, vUv + vec2(0.0, 1.0 / 512.0)).a;
  float coast = clamp((abs(pol.a - px) + abs(pol.a - py)) * 1.6, 0.0, 1.0);
  /* A little cartoony (the owner, round 4) — still recognisably Earth: a
     friendlier ocean, warmer and more saturated land, gently posterised, and
     flatter light. uToon eases off towards the handoff so the close map's
     photograph does not arrive as a different world. */
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  vec3 land = clamp(mix(vec3(lum), c, 1.45) * vec3(1.07, 1.04, 0.9) + 0.035, 0.0, 1.0);
  float band = floor(lum * 6.0 + 0.5) / 6.0;
  land = clamp(mix(land, land * (band + 0.04) / (lum + 0.04), 0.4), 0.0, 1.0);
  vec3 ocean = mix(vec3(0.13, 0.40, 0.70), vec3(0.28, 0.62, 0.86), smoothstep(0.02, 0.22, c.b));
  /* On the desk the land wears a classroom globe's pastel political colours,
     each country its own, with a little of the relief left in. */
  land = mix(land, pol.rgb * (0.8 + 0.4 * lum), uPolOn * 0.85 * pol.a);
  /* A flat classroom ocean: the photograph's blue ramp amplified its JPEG
     blocks into squares (round 4). */
  ocean = mix(ocean, vec3(0.45, 0.72, 0.89), uPolOn);
  vec3 toon = mix(land, ocean, water);
  c = mix(c, toon, uToon);
  float light = mix(0.30 + 0.85 * d, 0.64 + 0.40 * d, uToon);
  light = mix(light, 0.86 + 0.24 * d, uPolOn); // a desk lamp, not the sun
  vec3 h = normalize(uSun + v);
  float spec = pow(max(dot(n, h), 0.0), 70.0) * mix(0.45, 0.25, uToon) * water;
  vec3 col = c * light * vec3(1.02, 1.03, 1.06) + spec * vec3(1.0, 0.96, 0.9);
  col = mix(col, vec3(0.13, 0.19, 0.25), coast * uInk);
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
  /* Softer and rounder: a blurrier level of the cloud map, cut into puffs
     with a soft edge, and lit flat and bright. */
  float a = texture2D(uClouds, vec2(vUv.x + uShift, vUv.y), 1.5).r;
  a = smoothstep(0.28, 0.62, a) * 0.9;
  float light = 0.82 + 0.2 * max(dot(normalize(vN), uSun), 0.0);
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
uniform float uTan; uniform float uAspect; uniform float uShift;
uniform vec3 uHalo; uniform float uHaloStrength; uniform vec3 uDisc; uniform float uShadow;
varying vec2 vXY;
/* The globe floats on the page (the owner's art direction, round 4): no space,
   no stars — only the atmosphere's halo round the limb and a soft shadow on
   the "ground" beneath a whole globe, written premultiplied onto a transparent
   canvas so the page's own paper shows everywhere else. */
void main() {
  vec3 dir = normalize(uFwd + uRight * vXY.x * uTan * uAspect + uUp * (vXY.y - uShift) * uTan);
  float tca = -dot(uEye, dir);
  float b = length(uEye + dir * max(tca, 0.0));
  float halo = 0.0;
  if (tca > 0.0 && b > 1.0) {
    float x = b - 1.0;
    halo = clamp((exp(-x * 22.0) * 0.85 + exp(-x * 6.0) * 0.18) * uHaloStrength, 0.0, 1.0);
  }
  vec2 q = (gl_FragCoord.xy - vec2(uDisc.x, uDisc.y - uDisc.z * 1.1)) / vec2(uDisc.z * 0.8, uDisc.z * 0.11);
  float shadow = (1.0 - smoothstep(0.15, 1.0, length(q))) * uShadow;
  float a = halo + shadow * (1.0 - halo);
  gl_FragColor = vec4(uHalo * halo, a);
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

function texture(gl, source, { repeat = false, mip = true, luminance = false, alpha = false } = {}) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  const fmt = luminance ? gl.LUMINANCE : alpha ? gl.RGBA : gl.RGB;
  gl.texImage2D(gl.TEXTURE_2D, 0, fmt, fmt, gl.UNSIGNED_BYTE, source);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  if (mip) {
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    /* Anisotropic filtering keeps the ground sharp where the tilted camera
       sees it at a grazing angle, towards the horizon. */
    /* The limit is read once per context: a getParameter straight after
       generateMipmap forces the GPU to finish, which cost ~200 ms a texture
       (round 3). */
    if (gl.__aniso === undefined) {
      const e = gl.getExtension('EXT_texture_filter_anisotropic')
        || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
        || gl.getExtension('MOZ_EXT_texture_filter_anisotropic');
      gl.__aniso = e ? { e, max: Math.min(8, gl.getParameter(e.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 1) } : null;
    }
    if (gl.__aniso) gl.texParameterf(gl.TEXTURE_2D, gl.__aniso.e.TEXTURE_MAX_ANISOTROPY_EXT, gl.__aniso.max);
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

/** A lazily loaded texture, decoded off the main thread where the browser
    can (createImageBitmap), so the upload is the only main-thread cost. */
async function loadBitmap(src) {
  if (!('createImageBitmap' in window)) return loadImage(src);
  const r = await fetch(String(src));
  if (!r.ok) throw new Error(`image: ${src}`);
  return createImageBitmap(await r.blob());
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

  /* The desk globe's political colours: neighbours (countries whose pixels
     touch in the picking raster) never share one of six pastels, so every
     border reads without a legend. Greedy, largest country first. */
  const idAt = (k) => (pixels[k + 1] === 255 && pixels[k] && pixels[k + 2] === ((pixels[k] * 53) & 255) ? pixels[k] : 0);
  const near = ranges.map(() => new Set());
  for (let y = 0; y < PH; y++) {
    for (let x = 0; x < PW; x++) {
      const a = idAt((y * PW + x) * 4);
      if (!a) continue;
      for (const k of [(y * PW + ((x + 2) % PW)) * 4, y + 2 < PH ? ((y + 2) * PW + x) * 4 : -1]) {
        const b = k < 0 ? 0 : idAt(k);
        if (b && b !== a) { near[a - 1].add(b - 1); near[b - 1].add(a - 1); }
      }
    }
  }
  const PASTEL = ['#f3d98b', '#efb28c', '#e7a3ad', '#b8d59a', '#c7b5de', '#9fd3bd'];
  const hue = new Array(ranges.length).fill(-1);
  const order = ranges.map((_, i) => i).sort((i, j) => near[j].size - near[i].size);
  for (const i of order) {
    const used = new Set([...near[i]].map((j) => hue[j]));
    const free = PASTEL.findIndex((_, h) => !used.has(h));
    hue[i] = free < 0 ? i % PASTEL.length : free;
  }
  const political = document.createElement('canvas');
  political.width = PW; political.height = PH;
  const pol = political.getContext('2d');
  ranges.forEach((r, i) => { pol.fillStyle = PASTEL[hue[i]]; traceRings(pol, r.rings, PW, PH); });

  return { lines: new Float32Array(lines), ranges, byId: new Map(ranges.map((r) => [r.id, r])), countryAt, political };
}

/* ========================================================================
   The globe
   ======================================================================== */

export async function mountGlobe(figure, { onFail } = {}) {
  const stage = figure.querySelector('.world__stage');
  const list = figure.querySelector('.world__list');
  const caption = figure.querySelector('.world__caption');
  const dataEl = figure.querySelector('.world__data');
  if (!stage || !dataEl) throw new Error('no world data');

  const unit = figure.dataset.unit || '';
  const layer = figure.dataset.layer || 'Map';
  const places = JSON.parse(dataEl.textContent || '[]')
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon))
    .map((p) => ({ ...p, xyz: toXYZ(p.lat, p.lon), dim: false, selected: false }));
  const byId = new Map(places.map((p) => [p.id, p]));
  /* Country → schools (the owner, #53: zooming into a big country should do
     "what Europe does … show the individual schools … as dots"). A light that
     stands for a whole country may carry the institutions inside it that have
     their own position (worldWindow's `schools`). Far out it is one light at
     the country's middle; once the camera is close enough to that country
     (schoolsOpen) it gives way to one pin per institution, which group and
     split with the zoom like any other pins, and each opens a card that is a
     link to that institution's page. Derived from the data; no country is
     named. */
  const schools = [];
  for (const p of places) {
    p.subs = (p.schools || [])
      .filter((q) => Number.isFinite(q.lat) && Number.isFinite(q.lon))
      .map((q) => ({
        id: byId.has(q.id) ? `${p.id}:${q.id}` : q.id,
        name: q.name, lat: q.lat, lon: q.lon, xyz: toXYZ(q.lat, q.lon), href: q.href || '',
        state: q.city || '', cue: '', precision: 'institution', country: p.country, image: q.image || '', external: false,
        count: 1, school: true, parent: p, dim: false, selected: false,
      }));
    delete p.schools;
    p.open = false;
    /* How far apart its schools are, on the sphere: the widest pair, and at
       least two degrees, so a country of one school opens too, close in. */
    let spread = 2 * D2R;
    for (let i = 0; i < p.subs.length; i++) for (let j = i + 1; j < p.subs.length; j++) spread = Math.max(spread, angle(p.subs[i].xyz, p.subs[j].xyz));
    p.spread = spread;
    for (const q of p.subs) { byId.set(q.id, q); schools.push(q); }
  }
  const allPins = [...places, ...schools];
  const links = new Map();
  for (const a of list ? list.querySelectorAll('a[data-place]') : []) links.set(a.dataset.place, a);

  /* --- Context and resources ---------------------------------------------- */

  const canvas = document.createElement('canvas');
  canvas.className = 'world__globe';
  canvas.setAttribute('aria-hidden', 'true');
  /* A globe at 12 frames a second is worse than the list alone, so a machine
     that would draw it in software gets the list instead: the browser is
     asked to refuse a "major performance caveat", and a renderer that names
     itself as software is refused here. `?map=globe` overrides both, for
     testing. */
  const forced = new URLSearchParams(location.search).get('map') === 'globe';
  /* Transparent and premultiplied: the globe floats on the page's paper. */
  const attrs = { antialias: true, alpha: true, premultipliedAlpha: true, depth: true, powerPreference: 'default', failIfMajorPerformanceCaveat: !forced };
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
  let polTex = texture(gl, geography.political, { alpha: true }); // alpha is the land: the seas are where no country is

  /* --- Furniture ---------------------------------------------------------- */

  const pinLayer = el('div', { class: 'world__pins', 'aria-hidden': 'true' });
  /* The route between two choices, and the little vehicle that travels it
     (the owner, round 4: "a little plane or bus or train… a 'Where in the
     World is Carmen Sandiego' vibe"). SVG in the pin layer, so it is crisp at
     any pixel ratio and decorative like the pins. */
  const SVGNS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs = {}) => { const n = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; };
  const routeSvg = svgEl('svg', { class: 'world__route', 'aria-hidden': 'true' });
  const routeDone = svgEl('path', { class: 'world__route-done' });
  const routeLeft = svgEl('path', { class: 'world__route-left' });
  const vehicle = svgEl('g', { class: 'world__vehicle' });
  const vehicleShape = svgEl('g');
  vehicle.append(vehicleShape);
  routeSvg.append(routeDone, routeLeft, vehicle);
  routeSvg.style.display = 'none';
  pinLayer.append(routeSvg);
  /* The desk globe's furniture: the stand and the graduated meridian ring
     behind the globe (a pivot knob at the pole read as a place, round 5). Drawn
     in globe radii and placed each frame from where the globe is on screen. */
  const brassId = `brass-${figure.id || Math.random().toString(36).slice(2)}`;
  const deskBack = svgEl('svg', { class: 'world__desk', 'aria-hidden': 'true' });
  {
    const defs = svgEl('defs');
    const grad = svgEl('linearGradient', { id: brassId, x1: '0', y1: '0', x2: '1', y2: '1' });
    grad.append(svgEl('stop', { offset: '0', class: 'world__desk-shine' }), svgEl('stop', { offset: '0.55', class: 'world__desk-metal' }), svgEl('stop', { offset: '1', class: 'world__desk-deep' }));
    defs.append(grad);
    deskBack.append(defs);
  }
  const deskStand = svgEl('g', { class: 'world__desk-stand' });
  deskStand.append(
    svgEl('ellipse', { class: 'world__desk-shadow', cx: 0, cy: 1.63, rx: 0.66, ry: 0.05 }),
    svgEl('rect', { class: 'world__desk-wood', x: -0.56, y: 1.53, width: 1.12, height: 0.09, rx: 0.035 }),
    svgEl('path', { class: 'world__desk-wood world__desk-wood--top', d: 'M-0.48 1.54Q-0.44 1.39 0 1.37Q0.44 1.39 0.48 1.54Z' }),
    svgEl('path', { class: 'world__desk-metal-fill', fill: `url(#${brassId})`, d: 'M-0.045 1.1L0.045 1.1L0.075 1.38L-0.075 1.38Z' }),
    svgEl('circle', { class: 'world__desk-metal-fill', fill: `url(#${brassId})`, cx: 0, cy: 1.2, r: 0.06 }),
  );
  const deskRing = svgEl('g', { class: 'world__desk-ring' });
  const ticks = [];
  for (let deg = 0; deg < 360; deg += 10) {
    const a = deg * D2R, long = deg % 30 === 0;
    const r0 = long ? 1.05 : 1.062;
    ticks.push(`M${(Math.sin(a) * r0).toFixed(3)} ${(-Math.cos(a) * r0).toFixed(3)}L${(Math.sin(a) * 1.09).toFixed(3)} ${(-Math.cos(a) * 1.09).toFixed(3)}`);
  }
  deskRing.append(
    svgEl('circle', { class: 'world__desk-band', stroke: `url(#${brassId})`, cx: 0, cy: 0, r: 1.07 }),
    svgEl('circle', { class: 'world__desk-ink', cx: 0, cy: 0, r: 1.1 }),
    svgEl('circle', { class: 'world__desk-ink', cx: 0, cy: 0, r: 1.04 }),
    svgEl('path', { class: 'world__desk-ticks', d: ticks.join('') }),
    svgEl('circle', { class: 'world__desk-metal-fill', fill: `url(#${brassId})`, cx: 0, cy: -1.07, r: 0.045 }),
    svgEl('circle', { class: 'world__desk-metal-fill', fill: `url(#${brassId})`, cx: 0, cy: 1.07, r: 0.045 }),
  );
  const deskPlace = svgEl('g');
  deskPlace.append(deskStand, deskRing);
  deskBack.append(deskPlace);

  function drawDesk() {
    const k = closeActive ? 0 : desk(view.alt);
    const show = k > 0.01;
    deskBack.style.display = show ? '' : 'none';
    if (!show) return;
    const d = [-cam.eye[0], -cam.eye[1], -cam.eye[2]];
    const z = dot(d, cam.fwd);
    const nx = dot(d, cam.right) / (z * TAN * (W / H));
    const ny = dot(d, cam.up) / (z * TAN) + cam.shift;
    const r = (Math.tan(Math.asin(Math.min(1, 1 / Math.hypot(...cam.eye)))) / TAN) * (H / 2);
    const cx = (nx + 1) * 0.5 * W, cy = (1 - ny) * 0.5 * H;
    const o = String(Math.min(1, k * 1.15));
    deskBack.style.opacity = o;
    deskPlace.setAttribute('transform', `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) scale(${r.toFixed(2)})`);
    deskRing.setAttribute('transform', `rotate(${(cam.roll * R2D).toFixed(2)})`);
  }

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

  stage.append(deskBack, canvas, pinLayer, hint, credit);
  /* On a narrow screen (a phone) the camera buttons are a row above the
     stage and the card is a sheet below it, so neither covers the globe or
     the places just chosen (#53 round 1: the card hid a chosen country's
     schools, and "+" sat on the ring). On a wide stage both sit in its
     corners, as before. */
  const narrowMQ = matchMedia('(max-width: 44rem)');
  function placeFurniture() {
    if (narrowMQ.matches) {
      stage.before(controls);
      stage.after(card);
    } else {
      pinLayer.after(controls);
      controls.after(card);
    }
    figure.dataset.furniture = narrowMQ.matches ? 'outside' : 'inside';
  }
  placeFurniture();
  narrowMQ.addEventListener?.('change', () => { placeFurniture(); camDirty = true; kick(); });
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
    if (rest) {
      const atRest = Math.abs(view.alt - rest.alt) < 0.02;
      rest = restCamera();
      if (atRest && !flight) view.alt = rest.alt;
    }
    kick();
  }

  /* --- Camera -------------------------------------------------------------- */

  /* `view` is what is on screen; `goal` is where it is heading, for the same
     reason the flat map kept them apart: two quick presses mean two steps. */
  const view = { lat: 20, lon: 0, alt: 2 };
  const cam = { eye: [0, 0, 3], right: [1, 0, 0], up: [0, 1, 0], fwd: [0, 0, -1], shift: 0, pitch: 0, roll: 0, vp: new Float32Array(16) };
  let camDirty = true;
  let rest = null;
  let deskPose = null;      // the desk view: the furthest out any page goes, and where Back-to-the-desk returns

  /* How much of a desk globe the camera is looking at: 1 at the resting
     altitude, 0 once it has leaned in far enough that the stand is gone. */
  let deskAlt = 3.4;
  const deskIn = () => Math.max(1.3, deskAlt * 0.55);
  const desk = (alt) => smooth(deskIn(), deskAlt * 0.93, alt);
  /** The resting altitude at which the globe, its ring and its stand fill the
      stage with a margin: the globe's radius on screen, back to a distance. */
  function deskAltFor() {
    /* A narrow stage keeps a column clear either side for the zoom buttons,
       so they never sit on the ring (round 4, phone). */
    const room = W < 700 && controls.parentNode === stage ? W - 2 * 58 : W * 0.9;
    const r = Math.min((H * 0.92) / (DESK_TOP + DESK_BOTTOM), room / (2 * DESK_SIDE));
    const k = (r * 2 * TAN) / H;
    return Math.min(MAX_ALT, Math.max(2.2, 1 / Math.sin(Math.atan(k)) - 1));
  }

  function solveCamera(s, out = cam) {
    const T = toXYZ(s.lat, s.lon);
    const la = s.lat * D2R, lo = s.lon * D2R;
    const north = [-Math.sin(la) * Math.sin(lo), Math.cos(la), -Math.sin(la) * Math.cos(lo)];
    const dk = desk(s.alt);
    const p = pitchFor(s.alt) * (1 - dk);
    const cp = Math.cos(p), sp = Math.sin(p);
    const back = [cp * T[0] - sp * north[0], cp * T[1] - sp * north[1], cp * T[2] - sp * north[2]];
    out.eye = [T[0] + s.alt * back[0], T[1] + s.alt * back[1], T[2] + s.alt * back[2]];
    out.fwd = [-back[0], -back[1], -back[2]];
    out.up = [sp * T[0] + cp * north[0], sp * T[1] + cp * north[1], sp * T[2] + cp * north[2]];
    out.right = cross(out.fwd, out.up);
    /* On the desk the camera rolls, so the axis leans 23.4° with its north
       end to the right, and the globe sits high enough for its stand below. */
    const roll = TILT * dk;
    if (roll) {
      const c = Math.cos(roll), sn = Math.sin(roll), r0 = out.right, u0 = out.up;
      out.right = [c * r0[0] + sn * u0[0], c * r0[1] + sn * u0[1], c * r0[2] + sn * u0[2]];
      out.up = [c * u0[0] - sn * r0[0], c * u0[1] - sn * r0[1], c * u0[2] - sn * r0[2]];
    }
    const deskShift = ((DESK_BOTTOM - DESK_TOP) / 2) * Math.tan(Math.asin(1 / (1 + s.alt))) / TAN;
    out.shift = shiftFor(s.alt) * (1 - dk) + deskShift * dk;
    out.pitch = p;
    out.roll = roll;
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

  /** Backing off from alt a0 to a1: the view's latitude eases back towards the
      desk's as the stand comes into view, arriving as it does. */
  function liftLat(lat, a0, a1) {
    const d0 = desk(a0), d1 = desk(a1);
    if (!deskPose || d1 <= d0 || d0 >= 1) return lat;
    return lat + (deskPose.lat - lat) * ((d1 - d0) / (1 - d0));
  }

  /**
   * The lowest altitude at which the globe still reads as a sphere on the
   * paper: both upper corners of the stage, and its sides a third of the way
   * down, look past the Earth. A country's or a region's arrival stops here
   * (the owner, #53: "resume into a sphere and not … a sphere with
   * background"); only a dive onto a group of schools or a campus goes lower,
   * into the full stage. Found against the real camera, as fitCamera is.
   */
  function sphereAlt() {
    const misses = (c, x, y) => {
      const nx = (x / W) * 2 - 1, ny = 1 - (y / H) * 2;
      const dir = norm([
        c.fwd[0] + c.right[0] * nx * TAN * (W / H) + c.up[0] * (ny - c.shift) * TAN,
        c.fwd[1] + c.right[1] * nx * TAN * (W / H) + c.up[1] * (ny - c.shift) * TAN,
        c.fwd[2] + c.right[2] * nx * TAN * (W / H) + c.up[2] * (ny - c.shift) * TAN,
      ]);
      const b = dot(c.eye, dir), cc = dot(c.eye, c.eye) - 1;
      return b * b - cc < 0 || -b - Math.sqrt(b * b - cc) < 0;
    };
    const clear = (alt) => {
      const c = solveCamera({ lat: 40, lon: 0, alt }, {});
      return [[0, 0], [W, 0], [0, H / 3], [W, H / 3]].every(([x, y]) => misses(c, x, y));
    };
    let lo = 0.1, hi = Math.max(0.2, deskIn());
    if (clear(lo)) return lo;
    if (!clear(hi)) return hi;
    for (let i = 0; i < 18; i++) { const mid = (lo + hi) / 2; if (clear(mid)) hi = mid; else lo = mid; }
    return hi;
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
    deskAlt = deskAltFor();
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
    /* The desk, turned so the weight of what the page holds — its places,
       weighted by how much each holds — faces the reader, and seen from above
       towards it: for Europe, from about 40° north (round 4). */
    /* Weighted by the square of what each holds, so where most of the page is
       decides, not a scatter of single places far away (round 4: Asia). */
    /* A place known only to its country (a whole country's light) weighs a
       tenth of a city or a campus: it is a door, not a place with degrees. */
    const count = pts.map((q) => {
      const pl = places.find((x) => x.xyz === q);
      return (pl?.count || 1) ** 2 * (pl?.precision === 'region' ? 0.1 : 1);
    });
    const heart = pts.length ? norm(pts.reduce((acc, q, i) => [acc[0] + q[0] * count[i], acc[1] + q[1] * count[i], acc[2] + q[2] * count[i]], [0, 0, 0])) : toXYZ(45, 10);
    const [hLat, hLon] = toLatLon(heart);
    deskPose = { lat: Math.max(0, Math.min(DESK_LAT_MAX, hLat * 0.75)), lon: hLon, alt: deskAlt };
    /* A single-country page rests on its country (round 4: the Netherlands
       as one bubble on the edge of a whole-world desk); the desk is one
       zoom-out away. Never below the hand-back altitude. */
    if (home) {
      const narrow = Math.min(1, Math.max(0.6, W / 1100));
      const fit = fitCamera(pts, { maxAlt: REST_MAX_ALT, minAlt: Math.max(HANDBACK_ALT * 1.15, HOME_REST_MIN_ALT * narrow), pad: [0.16, 0.24, 0.14] });
      if (fit.fits) return { lat: fit.lat, lon: fit.lon, alt: fit.alt };
    }
    return { ...deskPose, alt: deskAlt };
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
    /* A journey's climb stays below the desk, so the stand never blinks in mid-way. */
    const peak = Math.log(Math.min(3.2, deskIn() * 0.95, Math.max(from.alt, to.alt, w * 1.5, climb)));
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
    /* Off the desk: the globe turns on its axis to face you, then you lean in.
       Back onto it: you sit back, then it turns. */
    const leanIn = desk(from.alt) > 0.5 && to.alt < from.alt * 0.8;
    const sitBack = !leanIn && desk(to.alt) > 0.5 && from.alt < to.alt * 0.8;
    const dLon = wrapLon(to.lon - from.lon);
    spin = null;
    flight = { t0: performance.now(), dur: dur * (leanIn || sitBack ? 1.3 : 1), from, to, a, b, la0, la1, ctrl, diveIn, climbOut, leanIn, sitBack, dLon, announce, onArrive };
    if (announce) say(`Flying to ${announce}.`);
    kick();
  }

  function stepFlight(now) {
    const f = flight;
    const t = Math.min(1, (now - f.t0) / f.dur);
    const s = easeInOut(t);
    const move = easeInOut(Math.min(1, Math.max(0, (t - 0.12) / 0.76)));
    f.move = move; // the travelling vehicle rides the same fraction of the way
    if (f.leanIn || f.sitBack) {
      const span = (a, b) => easeInOut(Math.min(1, Math.max(0, (t - a) / (b - a))));
      const turnT = f.leanIn ? span(0, 0.45) : span(0.4, 1);
      const leanT = f.leanIn ? span(0.3, 1) : span(0, 0.65);
      view.lon = wrapLon(f.from.lon + f.dLon * turnT);
      view.lat = f.from.lat + (f.to.lat - f.from.lat) * leanT;
      view.alt = clampAlt(Math.exp(f.la0 + (f.la1 - f.la0) * leanT));
    } else {
      const p = slerp(f.a, f.b, move);
      const [lat, lon] = toLatLon(p);
      const la = (1 - s) * (1 - s) * f.la0 + 2 * s * (1 - s) * f.ctrl + s * s * f.la1;
      view.lat = lat;
      view.lon = lon;
      view.alt = clampAlt(Math.exp(la));
    }
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
    view.lat = Math.max(-80, Math.min(80, view.lat + spin.vLat * dt * (1 - desk(view.alt))));
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
    if (desk(idleBase.alt) > 0.5) {
      /* On the desk the globe rocks ±18° either side of the page's places and
         comes back to them, rather than turning them round the back (round 4). */
      view.lon = wrapLon(idleBase.lon + Math.sin(t * 0.22) * 18);
    } else if (idleBase.alt > 1.3) {
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
  /* Uploads wait for stillness. A 4096² texture upload is tens of
     milliseconds on the main thread; during a flight that turned the climb to
     space into a slideshow (round 3). Fetching and decoding start on intent;
     the upload happens on the first frame with nothing moving. */
  const uploads = [];
  const whenStill = (fn) => { uploads.push(fn); kick(); };
  let big = 'none';
  function upgradeDay() {
    if (big !== 'none' || dead) return;
    big = 'loading';
    loadBitmap(new URL('img/globe/earth-day-4096.webp', assets))
      .then((img) => whenStill(() => {
        if (dead) return;
        const t = texture(gl, img);
        img.close?.();
        gl.deleteTexture(dayTex);
        dayTex = t;
      }))
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
    loadBitmap(new URL(`img/globe/${detailInfo.file}`, assets))
      .then((img) => new Promise((res) => whenStill(() => res(img))))
      .then((img) => {
        if (dead) return;
        gl.deleteTexture(detailTex);
        detailTex = texture(gl, img);
        img.close?.();
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
      .then((data) => new Promise((res) => whenStill(() => res(data))))
      .then((data) => {
        if (!data || dead) return;
        const g = buildGeography(data);
        if (!g.ranges.length) return;
        geography = g;
        gl.deleteTexture(polTex);
        polTex = texture(gl, g.political, { alpha: true });
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

  for (const p of allPins) {
    const node = el('div', { class: 'world__pin', 'data-place': p.id });
    if (p.cue) node.dataset.approx = 'true';
    if (p.school) node.dataset.school = '';
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
  /* What a group holds, in the page's unit. A place known only to its
     country (a whole country's light, precision "region") counts only when
     nothing more precise is in the group: on the home page those lights
     carry institution counts beside the cities' degree counts, and adding
     them made Denmark's group read 320 against 57 degrees (home round 3). */
  function groupCount(members) {
    /* A door (a country with nothing of the page's unit in it, on a page
       that counts degrees) and a school count one place each, never in the
       page's unit: #53 round 1 found the Nearby door saying "16 degrees"
       beside a globe saying 35, 28 and 33 (institutions). A group with
       nothing in the unit says how many places it holds, and is drawn hollow
       (`placesOnly`). */
    const precise = members.filter((m) => m.precision !== 'region' && !m.school);
    if (precise.length) return precise.reduce((n, m) => n + (m.count || 0), 0);
    if (members.some((m) => m.door || m.school)) return members.length;
    return members.reduce((n, m) => n + (m.count || 0), 0);
  }
  const hasDoors = places.some((p) => p.door);
  const placesOnly = (members) => hasDoors && members.every((m) => m.door || m.school || m.precision === 'region') && members.some((m) => m.door || m.school);

  /* When a country's light gives way to its schools: once its schools would
     spread over more than half the stage (a big country, from not far), or
     once the camera is down at the altitude a chosen place is flown to (any
     country in view). A little hysteresis, so a camera resting on the
     threshold does not flicker between the two. */
  const SCHOOLS_ALT = 0.45;
  /* A country chosen (its light or its outline) is opened whatever the
     altitude: the arrival frames its schools (#53 round 1). Cleared by the
     next choice, Reset or Back. */
  const opened = new Set();
  function openOnly(list) {
    opened.clear();
    for (const p of list) if (p.subs?.length) opened.add(p.id);
    clusterAt = -1;
  }
  function schoolsOpen(p) {
    if (!p.subs.length) return false;
    if (opened.has(p.id)) return true;
    const k = p.open ? 0.85 : 1;
    /* Close in, every country is open: its middle may be over the horizon
       while its schools are in front of you (Boston, seen from above it). */
    if (view.alt <= SCHOOLS_ALT / k) return true;
    if (project(p.xyz).facing <= 0.15) return false;
    return p.spread / radPerPx() >= 0.6 * Math.min(W, H) * k;
  }
  function pinnedNow() {
    const out = [];
    for (const p of places) {
      p.open = schoolsOpen(p);
      if (p.open) out.push(...p.subs);
      else out.push(p);
    }
    return out;
  }

  function cluster() {
    /* Facing places are compared where they land on the screen, which is what
       a reader sees — a tilted camera squeezes north and south together. The
       rest, round the back, by angle. Recomputed only when the zoom changes or
       the camera has travelled, so the groups hold still under a spin. */
    const theta = PIN_GAP * radPerPx() * (1 + Math.sin(cam.pitch));
    const cosT = Math.cos(theta);
    const shown = pinnedNow();
    for (const p of shown) p._s = project(p.xyz);
    const near = (a, b) => (a._s.facing > 0.05 && b._s.facing > 0.05
      ? Math.hypot(a._s.x - b._s.x, a._s.y - b._s.y) < PIN_GAP
      : dot(a.xyz, b.xyz) > cosT);
    const left = [...shown].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    const out = [];
    while (left.length) {
      const seed = left.shift();
      const members = [seed];
      for (let i = left.length - 1; i >= 0; i--) {
        if (members.some((m) => near(m, left[i]))) members.push(...left.splice(i, 1));
      }
      const xyz = norm(members.reduce((s, m) => [s[0] + m.xyz[0], s[1] + m.xyz[1], s[2] + m.xyz[2]], [0, 0, 0]));
      out.push({ members, xyz, count: groupCount(members) });
    }
    /* Two groups whose circles (and glow) overlap on screen are one group
       (round 4: a "4" drawn over a "36"). Repeated until nothing overlaps. */
    const drawnR = (g) => (g.members.length === 1 ? radius(g.members[0], maxCount()) + 4 : 11 + Math.min(9, Math.sqrt(g.members.length) * 3) + 7);
    for (let merged = true; merged;) {
      merged = false;
      for (const g of out) g._s = project(g.xyz);
      outer: for (let i = 0; i < out.length; i++) {
        for (let j = i + 1; j < out.length; j++) {
          const a = out[i], b = out[j];
          if (a._s.facing <= 0.05 || b._s.facing <= 0.05) continue;
          if (Math.hypot(a._s.x - b._s.x, a._s.y - b._s.y) >= drawnR(a) + drawnR(b)) continue;
          const members = [...a.members, ...b.members];
          out.splice(j, 1);
          out[i] = { members, xyz: norm(members.reduce((s2, m) => [s2[0] + m.xyz[0], s2[1] + m.xyz[1], s2[2] + m.xyz[2]], [0, 0, 0])), count: groupCount(members) };
          merged = true;
          break outer;
        }
      }
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
        const r = p.school ? 4.5 : radius(p, max);
        const dim = (p.parent || p).dim;
        const on = litSet.has(p.id) || (!!p.parent && litSet.has(p.parent.id));
        node.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`;
        node.style.setProperty('--r', `${r.toFixed(1)}px`);
        node.style.opacity = String(fade * (dim ? 0.55 : 1));
        node.toggleAttribute('data-dim', dim);
        node.toggleAttribute('data-selected', p.selected);
        node.toggleAttribute('data-on', on);
        /* A label goes where it does not cover another label, biggest places
           first. Lit and selected places always get theirs. */
        let show = false;
        let flip = false;
        if (fade > 0.6 && (labels || on || p.selected)) {
          const w = p.name.length * 6.6 + 18;
          /* To the left of the pin when the right would run off the stage
             ("HK Ho…" on a phone, round 3). */
          flip = s.x + r + 2 + w > W - 4 && s.x - r - 2 - w > 4;
          const rect = flip ? [s.x - r - 2 - w, s.y - 11, s.x - r - 2, s.y + 11] : [s.x + r + 2, s.y - 11, s.x + r + 2 + w, s.y + 11];
          const clash = taken.some((t) => rect[0] < t[2] && rect[2] > t[0] && rect[1] < t[3] && rect[3] > t[1]);
          if (!clash || litSet.has(p.id) || p.selected) { show = true; taken.push(rect); }
        }
        node.toggleAttribute('data-label', show);
        node.toggleAttribute('data-flip', show && flip);
      } else {
        for (const m of g.members) { seen.add(m.id); m.node.hidden = true; }
        const node = clusterNode(used++);
        node._members = g.members;
        if (!onScreen) { node.hidden = true; continue; }
        node.hidden = false;
        /* A group says how much it holds in the page's own unit (degrees on
           the home page), the same number the doors and the count use — not
           how many places it covers (home round 2: "40" against "57 degrees"). */
        node.firstChild.textContent = String(g.count || g.members.length);
        node.toggleAttribute('data-places', placesOnly(g.members));
        const r = 11 + Math.min(9, Math.sqrt(g.members.length) * 3);
        node.style.setProperty('--r', `${r.toFixed(1)}px`);
        node.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`;
        node.style.opacity = String(fade);
        node.toggleAttribute('data-dim', g.members.every((m) => (m.parent || m).dim));
        node.toggleAttribute('data-on', g.members.some((m) => litSet.has(m.id) || (!!m.parent && litSet.has(m.parent.id))));
        node.toggleAttribute('data-selected', g.members.some((m) => m.selected));
        taken.push([s.x - r, s.y - r, s.x + r, s.y + r]);
      }
    }
    for (let i = used; i < clusterPool.length; i++) { clusterPool[i].hidden = true; clusterPool[i]._members = null; }
    for (const p of allPins) if (!seen.has(p.id)) p.node.hidden = true;

    stage.dataset.zoomed = String(view.alt < rest.alt * 0.95);
    zoomIn.disabled = view.alt <= MIN_ALT * 1.01;
    zoomOut.disabled = view.alt >= Math.min(MAX_ALT, deskAlt) * 0.99;
  }

  /* --- The route and the vehicle ------------------------------------------ */

  /* Drawn in a 24-unit box, pointing along +x. */
  const VEHICLES = {
    plane: [
      ['path', { d: 'M22.5 12c0-.9-.8-1.4-1.7-1.4h-5.6L10.2 3.2H8.1l2.6 7.4H5.9L4.1 8.3H2.6l1.2 3.7-1.2 3.7h1.5l1.8-2.3h4.8L8.1 20.8h2.1l5-7.4h5.6c.9 0 1.7-.5 1.7-1.4z' }],
    ],
    train: [
      ['path', { d: 'M2.5 7.5h12.8c3.1 0 5.7 2.5 5.7 5.6V16H2.5z' }],
      ['path', { class: 'world__vehicle-window', d: 'M4.5 9.3h3v2.6h-3zM9 9.3h3v2.6H9zM16 9.3c1.7.3 2.9 1.4 3.3 2.6H16z' }],
      ['circle', { cx: 6.5, cy: 17.4, r: 1.6 }],
      ['circle', { cx: 15.5, cy: 17.4, r: 1.6 }],
    ],
  };
  let route = null;
  let lastChosen = null;
  let vehicleKind = '';
  function setVehicle(kind) {
    if (kind === vehicleKind) return;
    vehicleKind = kind;
    vehicleShape.replaceChildren(...VEHICLES[kind].map(([tag, attrs]) => svgEl(tag, attrs)));
  }
  /* A plane for a long hop or one over water; a train for a short one over land. */
  function vehicleFor(a, b) {
    if (angle(a, b) * 6371 > 600) return 'plane';
    for (let i = 1; i < 12; i++) {
      const [lat, lon] = toLatLon(slerp(a, b, i / 12));
      if (!geography.countryAt(lat, lon)) return 'plane';
    }
    return 'train';
  }
  /** A new choice: travel to it from the last one, if there was one. */
  function startRoute(to) {
    const from = lastChosen;
    lastChosen = to;
    if (!from || reducedMotion() || angle(from, to) < 0.003) { route = null; drawRoute(); return; }
    route = { a: from, b: to, done: 0 };
    setVehicle(vehicleFor(from, to));
  }
  function drawRoute() {
    if (!route) { routeSvg.style.display = 'none'; return; }
    const t = flight ? (flight.move ?? 0) : 1;
    if (!flight && !route.done) route.done = performance.now();
    const fade = route.done ? Math.max(0, 1 - (performance.now() - route.done) / 1400) : 1;
    if (fade <= 0) { route = null; routeSvg.style.display = 'none'; return; }
    routeSvg.style.display = '';
    routeSvg.style.opacity = String(fade);
    const N = 64;
    let done = '', left = '', penDone = false, penLeft = false;
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const q = project(slerp(route.a, route.b, u));
      const ok = q.facing > 0.02;
      const xy = `${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
      if (u <= t) { if (ok) { done += (penDone ? 'L' : 'M') + xy; penDone = true; } else penDone = false; }
      if (u >= t - 1 / N) { if (ok) { left += (penLeft ? 'L' : 'M') + xy; penLeft = true; } else penLeft = false; }
    }
    routeDone.setAttribute('d', done);
    routeLeft.setAttribute('d', left);
    const here = project(slerp(route.a, route.b, t));
    const next = project(slerp(route.a, route.b, Math.min(1, t + 0.02)));
    const prev = project(slerp(route.a, route.b, Math.max(0, t - 0.02)));
    const dir = t < 0.99 ? [next.x - here.x, next.y - here.y] : [here.x - prev.x, here.y - prev.y];
    let deg = Math.atan2(dir[1], dir[0]) * R2D;
    /* A train is drawn from the side: going left it is mirrored, not upside down. */
    const flipY = vehicleKind === 'train' && Math.abs(deg) > 90;
    vehicle.style.display = here.facing > 0.02 && fade > 0.25 ? '' : 'none';
    vehicle.setAttribute('transform', `translate(${here.x.toFixed(1)} ${here.y.toFixed(1)}) rotate(${deg.toFixed(1)}) scale(1.15 ${flipY ? -1.15 : 1.15}) translate(-12 -12)`);
  }

  /* --- Drawing ------------------------------------------------------------- */

  const theme = { halo: [0.35, 0.62, 1.0], haloStrength: 0.9, shadow: 0.22 };
  function readTheme() {
    const paper = getComputedStyle(root).getPropertyValue('--paper').trim();
    const m = paper.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    const lum = m ? (0.2126 * parseInt(m[1], 16) + 0.7152 * parseInt(m[2], 16) + 0.0722 * parseInt(m[3], 16)) / 255 : 0.9;
    const dark = lum < 0.5;
    Object.assign(theme, dark
      ? { halo: [0.36, 0.64, 1.0], haloStrength: 0.95, shadow: 0.35 }
      : { halo: [0.28, 0.55, 0.92], haloStrength: 0.7, shadow: 0.16 });
  }
  readTheme();

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

  const cloudAlpha = () => 0.82 * smooth(0.22, 0.85, view.alt) * (1 - desk(view.alt));

  function draw(now) {
    const t0 = performance.now();
    buildVP();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
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
    /* Where the whole globe sits on the canvas, for its ground shadow: the
       centre projected, the radius from its angular size. */
    {
      const d = [-cam.eye[0], -cam.eye[1], -cam.eye[2]];
      const z = dot(d, cam.fwd);
      const dist = Math.hypot(...cam.eye);
      const nx = dot(d, cam.right) / (z * TAN * (W / H));
      const ny = dot(d, cam.up) / (z * TAN) + cam.shift;
      const r = Math.tan(Math.asin(Math.min(1, 1 / dist))) / TAN * canvas.height / 2;
      gl.uniform3f(pr.u.uDisc, (nx + 1) / 2 * canvas.width, (ny + 1) / 2 * canvas.height, r);
    }
    gl.uniform3f(pr.u.uHalo, ...theme.halo);
    const dk = desk(view.alt);
    gl.uniform1f(pr.u.uHaloStrength, theme.haloStrength * (1 - 0.65 * dk) * (0.3 + 0.7 * smooth(0.3, 1.3, view.alt)));
    gl.uniform1f(pr.u.uShadow, theme.shadow * smooth(1.2, 2.2, view.alt) * (1 - dk));
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
    gl.uniform1f(pr.u.uPunch, closeState === 'failed' ? 0 : 0.5 * smooth(0.24, HANDOFF_ALT, view.alt));
    gl.uniform1f(pr.u.uToon, 0.3 + 0.7 * smooth(0.13, 0.5, view.alt));
    gl.uniform1f(pr.u.uPolOn, dk);
    gl.uniform1f(pr.u.uInk, 0.5 * dk);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, polTex);
    gl.uniform1i(pr.u.uPol, 3);
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
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(false);
      pr = progs.line;
      gl.useProgram(pr.p);
      resetAttribs();
      const a = pr.a('aPos');
      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
      gl.enableVertexAttribArray(a);
      gl.vertexAttribPointer(a, 3, gl.FLOAT, false, 0, 0);
      gl.uniformMatrix4fv(pr.u.uVP, false, cam.vp);
      /* Crisp, warm outlines — the cartoon's ink line — over the stylised globe. */
      gl.uniform4f(pr.u.uColor, 0.24, 0.18, 0.12, 0.42 + 0.15 * smooth(1.2, 0.2, view.alt));
      gl.drawArrays(gl.LINES, 0, geography.lines.length / 3);
      const outline = selectedCountry || home;
      if (hoverCountry && hoverCountry !== outline) {
        gl.uniform4f(pr.u.uColor, 0.16, 0.11, 0.07, 0.9);
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
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
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
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
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
          camDirty = true; // one more layout pass: a folded card opens on arrival
          kick();
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
  let warming = null;
  function warmClose(lat, lon, zoom) {
    const run = warmSteps(lat, lon, zoom);
    warming = run;
    run.finally(() => { if (warming === run) warming = null; });
    return run;
  }
  async function warmSteps(lat, lon, zoom) {
    const token = ++warmToken;
    const c = await ensureClose();
    if (!c || closeActive || token !== warmToken) return;
    const m = c.map;
    const start = zoomForAlt(HANDOFF_ALT * 0.9);
    /* A stop just above the handoff too: the first frames with the horizon
       and the sky compile MapLibre's shaders here, hidden, instead of in a
       one-second freeze on the first Reset (round 3). */
    const stops = [start - 1.2, start, 8.5, 11, 13, zoom].filter((z, i) => i < 2 || (z > start + 0.4 && z <= zoom + 0.01));
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
    /* Let the warm-up finish — every level of the dive loaded and drawn once,
       hidden — before the cross-fade, for at most 2.5 s; the globe keeps
       sinking meanwhile. Cutting it short at the handoff is what left the
       street level to arrive tile by tile (round 3's pop). */
    if (warming) await Promise.race([warming, new Promise((r) => setTimeout(r, 2500))]);
    warmToken++;
    if (dead || view.alt > HANDBACK_ALT) { closeState = 'ready'; return false; }
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
    const bottom = !card.hidden && cardSheet ? cardFullHeight + 12 : 0;
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
     the globe gives up and the list is the map. */
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
    const still = !flight && !spin && !closeFlying && !pointers.size && closeState !== 'handing';
    if (uploads.length && still) { uploads.shift()(); camDirty = true; }
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
    if (closeActive && closeFlying) camDirty = true;
    if (route) camDirty = true;
    if (camDirty || (drifting && now - lastDraw > 48)) {
      /* The globe keeps drawing under the close map, at the same camera: any
         tile the map has not loaded yet shows Earth, not the style's cream
         (round 3). The seam between the two is ~1.4 px. */
      draw(now);
      if (camDirty) { layoutPins(); drawRoute(); drawDesk(); }
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
        /* But a page that rests below FINE_ALT rests on the detail texture and
           the finer borders: that is the first picture a student sees, and
           round 2's saving there (0.6 MB) cost the flagship page its
           sharpness. Fetched at idle, uploaded when still. */
        if (rest.alt < FINE_ALT) (window.requestIdleCallback || ((fn) => setTimeout(fn, 800)))(() => { maybeFine(0); maybeDetail(rest); }, { timeout: 3000 });
      }
    }
    if (moving || waiting || flight || spin || drifting || camDirty || uploads.length) raf = requestAnimationFrame(frame);
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
    const parents = new Set([...litSet].map((id) => byId.get(id)?.parent?.id).filter(Boolean));
    for (const [pid, a] of links) a.toggleAttribute('data-on', litSet.has(pid) || parents.has(pid));
    void fromMap;
    camDirty = true;
    kick();
  }

  /* --- Cards --------------------------------------------------------------- */

  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  let cardReturn = null;
  let cardFullHeight = 0;
  let cardSheet = false;
  /* A card is drawn once, in its final form, the moment something is
     chosen. It used to be folded to its title while the camera travelled on
     a phone and opened out on arrival, which the owner saw as one card being
     replaced by another (#53, phone). On a phone the card is now below the
     stage, so there is nothing to fold it out of the way of. */
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
    close.addEventListener('click', () => { closeCard({ restore: true }); clearChoice(); });
    card.append(close);
    build(card);
    card.hidden = false;
    /* On a phone the card is a sheet across most of the stage; its full height
       is measured now (the camera frames the place above it) and then it is
       folded to its title and action while the camera travels, so the climb
       and the cloud dive are seen, not hidden behind it (round 3). It opens
       out when the camera arrives. */
    cardFullHeight = card.offsetHeight;
    cardSheet = card.parentNode === stage && card.getBoundingClientRect().width > W * 0.7;
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
        const img = el('img', { class: 'world__card-img', src: p.image, alt: '', decoding: 'async' });
        img.addEventListener('error', () => img.remove());
        c.append(img);
      }
      const title = cardTitle(c, p.name);
      const facts = [];
      if (p.door && p.count) facts.push(plural(p.count, 'institution'));
      else if (unit && p.count && !p.school) facts.push(plural(p.count, unit));
      if (p.state) facts.push(p.state);
      if (facts.length) c.append(el('p', { class: 'world__card-meta' }, facts.join(' · ')));
      /* "Placed at the country, not at a campus" meant nothing to a student
         on a country's own card (the owner, #53); a city's light still says
         it is the city. */
      if (p.cue && p.precision !== 'region') c.append(el('p', { class: 'world__card-cue' }, p.cue));
      const dest = pages.get(p.country);
      if (dest && !sameHref(dest.href, p.href) && !sameHref(dest.href, location.pathname)) {
        c.append(el('p', { class: 'world__card-where' }, `In ${dest.name}`));
      }
      if (p.href) cardLink(c, title, p.href, actionLabel(p), { external: p.external, select: p });
    }, opts);
  }

  /* The card is the link (the owner, #53: "if a user chooses to click on the
     card the card is the link"). One real link per card, in its title; its
     ::after covers the whole card, so a click anywhere on the photograph, the
     title or the lines under it follows it, while the close button and any
     list of places sit above it and stay buttons of their own — nothing
     interactive is nested in the link. There is no separate "Open … →" line
     (the owner, #53: the card itself is the link): an arrow on the title and
     the whole card lighting under the pointer say it, and the link's name
     says where it goes, for a screen reader. site.js's rule — another site, or one university's or
     programme's page, opens in a new tab — covers it like any other link. A
     page that wants the choice for itself (the explorer filters on it) says so
     by cancelling `world:select`, and then the link does not navigate. */
  function cardTitle(c, text) {
    const h = el('h3', { class: 'world__card-title', tabindex: '-1' }, text);
    c.append(h);
    return h;
  }
  function cardLink(c, title, href, label, { external = false, select = null } = {}) {
    const a = el('a', { class: 'world__card-link', href }, title.textContent);
    a.append(el('span', { class: 'visually-hidden' }, ` — ${label}`), el('span', { class: 'world__card-arrow', 'aria-hidden': 'true' }, '→'));
    if (external) a.rel = 'noopener nofollow';
    title.replaceChildren(a);
    c.dataset.link = 'true';
    if (select) {
      a.addEventListener('click', (e) => {
        const ev = new CustomEvent('world:select', { detail: { id: select.id, name: select.name, href: select.href }, cancelable: true, bubbles: true });
        if (!figure.dispatchEvent(ev)) {
          e.preventDefault();
          closeCard();
        }
      });
    }
    return a;
  }
  function actionLabel(p) {
    const inPage = p.href.startsWith('#');
    return inPage
      ? (unit && p.count ? `Show the ${plural(p.count, unit)} here` : 'Show what is here')
      : p.external ? 'Visit their website' : `Open ${p.name.replace(/^\p{RI}{2}\s*/u, '')}`;
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
      const photo = only?.image || dest?.image || '';
      if (photo) {
        const img = el('img', { class: 'world__card-img', src: photo, alt: '', decoding: 'async' });
        img.addEventListener('error', () => img.remove());
        c.append(img);
      }
      const title = cardTitle(c, `${dest?.flag ? `${dest.flag} ` : ''}${dest?.name || country.name}`);
      const line = !here.length
        ? 'Nothing on this map here yet.'
        : only
          ? [unit && total ? plural(total, unit) : '', only.state].filter(Boolean).join(' · ') || only.name
          : [plural(here.length, 'place'), unit && total ? plural(total, unit) : ''].filter(Boolean).join(' · ') + ' on this map';
      c.append(el('p', { class: 'world__card-meta' }, line));
      if (dest && !sameHref(dest.href, location.pathname)) {
        cardLink(c, title, dest.href, `Open the ${dest.name} page`);
      } else if (!dest) {
        c.append(el('p', { class: 'world__card-cue' }, 'This guide does not cover it yet.'));
      }
      /* The places in it, as buttons of their own under the link and above
         its cover: choosing one flies there instead of leaving the page. */
      if (here.length > 1 && here.length <= 8) {
        const ul = el('ul', { class: 'world__card-list' });
        for (const p of here) {
          const b = el('button', { type: 'button' }, p.name);
          b.addEventListener('click', () => goToPlace(p, { focus: true }));
          const li = el('li'); li.append(b); ul.append(li);
        }
        c.append(ul);
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
    if (card.hidden || !cardSheet) return target;
    const sr = stage.getBoundingClientRect();
    const r = card.getBoundingClientRect();
    const top = r.bottom - sr.top - cardFullHeight;
    if (top < H * 0.3) return target;
    const want = top / 2;
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
  /**
   * `world:choose` on the figure: { kind: 'place' | 'country' | 'view' | null,
   * id, name, restored? }. Fired when the reader chooses something on the
   * globe (or through `show()`), when they clear it (close, Escape, the sea,
   * Reset), and on Back/Forward with `restored: true`. A page filters on it;
   * the globe does not know what the page does with it.
   */
  function announceChoice(sel, extra = {}) {
    const name = !sel ? null
      : sel.kind === 'place' ? byId.get(sel.id)?.name
      : sel.kind === 'country' ? (pages.get(sel.id)?.name || geography.byId.get(sel.id)?.name)
      : null;
    figure.dispatchEvent(new CustomEvent('world:choose', {
      bubbles: true,
      detail: sel ? { kind: sel.kind, id: sel.id, name: name ?? null, ...extra } : { kind: null, id: null, name: null, ...extra },
    }));
  }
  function clearChoice() {
    if (!currentSel) return;
    currentSel = null;
    announceChoice(null);
  }
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
    announceChoice(sel);
  }
  function select(sel) {
    if (sel.kind === 'view') { if (sel.cam) goToView(sel.cam); return !!sel.cam; }
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
        announceChoice(st.sel, { restored: true });
      } else {
        currentSel = null;
        announceChoice(null, { restored: true });
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
    /* A school keeps its country open; anything else opens only itself. */
    if (!(p.parent && opened.has(p.parent.id))) openOnly([p]);
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
        lastChosen = p.xyz; // a short hop inside the close map: no vehicle, but the next journey starts here
        closeFlyTo({ center: [p.lon, p.lat], zoom });
        say(`Flying to ${p.name}.`);
        return;
      }
      startRoute(p.xyz);
      warmClose(p.lat, p.lon, zoom);
      const onArrive = () => handOff({ then: () => closeFlyTo({ center: [p.lon, p.lat], zoom }) });
      flyTo({ lat: p.lat, lon: p.lon, alt: Math.min(view.alt, HANDOFF_ALT * 0.9) }, { announce: p.name, travel: true, onArrive });
      return;
    }
    if (closeActive) { climbOut(() => goToPlace(p, { focus: false, push: false })); return; }
    startRoute(p.xyz);
    /* A whole country's light: opened into its schools, and framed on them
       (Boston to Chicago for the United States, not a bunch at the edge of
       a frame over Kansas), no lower than the globe still reads as a sphere. */
    if (p.subs?.length) {
      const fit = fitCamera([p.xyz, ...p.subs.map((q) => q.xyz)], { maxAlt: 2.4, minAlt: sphereAlt(), pad: [0.1, 0.14, 0.1] });
      flyTo(frameAbove(fit, p.xyz), { announce: p.name, travel: true });
      return;
    }
    const alt = Math.min(view.alt, Math.max(MIN_ALT * 3, 0.32, sphereAlt()));
    flyTo(frameAbove({ lat: p.lat, lon: p.lon, alt }, p.xyz), { announce: p.name, travel: true });
  }

  function goToCountry(country, { focus = false, push = true } = {}) {
    if (push) remember({ kind: 'country', id: country.id });
    if (closeActive) { climbOut(() => goToCountry(country, { focus, push: false })); return; }
    selectedCountry = country;
    paintMask(country);
    /* Framed on what the page holds there — its places, and the schools
       inside its light — or on its outline when it holds nothing; opened
       into its schools; no lower than the globe still reads as a sphere,
       except as far as a country's own places need to come apart — on a
       phone's small stage Denmark's sixteen towns were one "56" at 0.2
       (#53 round 1), so a country with several places may come down to just
       above the street map. */
    const here = places.filter((q) => q.country === country.id);
    openOnly(here);
    const pts = here.flatMap((q) => (q.subs?.length ? q.subs.map((x) => x.xyz) : [q.xyz]));
    const fit = fitCamera(pts.length ? pts : country.frame, { maxAlt: 2.4, minAlt: here.length > 1 ? HANDOFF_ALT * 1.1 : Math.max(0.2, sphereAlt()), pad: [0.1, 0.14, 0.1] });
    countryCard(country, { focus });
    startRoute(cardSubject.xyz);
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
    /* A group of countries dives to where it comes apart into countries and
       no further: above SCHOOLS_ALT, and no lower than the globe still reads
       as a sphere. Schools open on the next choice or zoom (the owner's
       "country, region, countries, schools"; #53 round 1: a click on "281"
       opened 31 groups of schools at once). */
    const countries = members.some((m) => m.precision === 'region' && m.subs?.length);
    if (!members.every((m) => m.parent && opened.has(m.parent.id))) openOnly([]);
    const floor = countries
      ? Math.max(SCHOOLS_ALT * 1.25, sphereAlt())
      : closeState === 'failed' ? MIN_ALT : altForZoom(17);
    const bounds = () => {
      const lats = members.map((m) => m.lat), lons = members.map((m) => m.lon);
      return [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]];
    };
    void bounds;
    const announce = `${members.length} places`;
    /* Frame every member. The camera is found with the globe's own fit — the
       same projection, pitch and lens shift the close map is driven with (the
       seam is ~1.4 px) — so it is the frame that shows them all, not
       MapLibre's flat, pitch-0 bounds fit that put ten of Denmark's twelve
       below the stage (round 3). */
    const pts = members.map((m) => m.xyz);
    const fitAll = (maxAlt) => fitCamera(pts, { maxAlt, minAlt: floor, pad: [0.1, 0.16, 0.12] });
    const fitClose = () => {
      const fit = fitAll(Math.max(view.alt * 0.95, floor * 1.01));
      if (fit.alt > HANDBACK_ALT * 0.95) { climbOut(() => flyTo(fit, { announce })); return; }
      closeFlyTo({ center: [fit.lon, fit.lat], zoom: Math.min(17, zoomForAlt(fit.alt)) });
    };
    if (altToSplit(maxAng) < floor) {
      crowdCard(members, { xyz: centre });
      if (closeActive) { closeFlyTo({ center: [lon, lat], zoom: Math.max(close.map.getZoom(), 15) }); return; }
      flyTo(frameAbove({ lat, lon, alt: Math.max(MIN_ALT, Math.min(view.alt, 0.25)) }, centre), { announce });
      return;
    }
    /* A dive into a group is a choice, and Back undoes it (the owner's rule;
       round 3 found group dives pushed nothing, so Back left the page). */
    const fit = fitAll(Math.max(view.alt * 0.8, floor * 1.01));
    remember({ kind: 'view', id: members.map((m) => m.id).sort().join(','), cam: { lat: fit.lat, lon: fit.lon, alt: fit.alt } });
    if (closeActive) { fitClose(); return; }
    /* Decide the engine before diving: the globe does a frame above the
       handoff alone; only a frame below it dives through to the close map. */
    if (fit.alt >= HANDOFF_ALT || closeState === 'failed') {
      flyTo({ lat: fit.lat, lon: fit.lon, alt: Math.max(MIN_ALT, fit.alt) }, { announce });
      return;
    }
    warmClose(fit.lat, fit.lon, zoomForAlt(fit.alt));
    flyTo({ lat: fit.lat, lon: fit.lon, alt: HANDOFF_ALT * 0.9 }, { announce, onArrive: () => handOff({ then: fitClose }) });
  }

  /** Return to a camera a choice recorded (a group dive, on Back). */
  function goToView(cam) {
    if (closeActive && cam.alt < HANDBACK_ALT) { closeFlyTo({ center: [cam.lon, cam.lat], zoom: Math.min(17, zoomForAlt(cam.alt)) }); return; }
    climbOut(() => flyTo(cam, { travel: angle(toXYZ(view.lat, view.lon), toXYZ(cam.lat, cam.lon)) > HOP }));
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
      const a1 = Math.min(deskAlt, clampAlt(pinch.alt * (pinch.gap / gap)));
      view.lat = liftLat(view.lat, view.alt, a1);
      view.alt = a1;
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
    /* On the desk a drag rolls the globe under the finger: a pixel is one
       globe-radius-th of a radian, whatever the stage's shape (round 5: on a
       tall phone stage the old gain turned it 1.7x faster than the finger). */
    const dk = desk(view.alt);
    const rPx = (Math.tan(Math.asin(Math.min(1, 1 / (1 + view.alt)))) / TAN) * (H / 2);
    const free = (-dx * k) / Math.max(0.25, Math.cos(view.lat * D2R));
    const dLon = free * (1 - dk) + ((-dx / rPx) * R2D) * dk;
    /* A desk globe turns on its axis and nothing else. */
    const dLat = dy * k * (1 + Math.sin(cam.pitch) * 0.9) * (1 - desk(view.alt));
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
      if (speed > 0.002) {
        /* The glide after a fling carries on for ~380 ms of decay per unit of
           speed; on the desk it is capped at ~40° of turn. */
        const cap = 40 / 380;
        const vLon = desk(view.alt) > 0.5 ? Math.max(-cap, Math.min(cap, drag.vLon)) : drag.vLon;
        spin = { vLat: drag.vLat, vLon };
      }
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
      else { closeCard(); clearChoice(); }
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
    const alt = Math.min(deskAlt, clampAlt(view.alt * factor));
    view.lat = liftLat(view.lat, view.alt, alt);
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
      ArrowUp: () => flyTo({ ...view, lat: view.lat + step * (1 - desk(view.alt)) }),
      ArrowDown: () => flyTo({ ...view, lat: view.lat - step * (1 - desk(view.alt)) }),
      '+': () => zoomBy(0.55),
      '=': () => zoomBy(0.55),
      '-': () => zoomBy(1 / 0.55),
      _: () => zoomBy(1 / 0.55),
      0: () => goHome(),
      Escape: () => { if (card.hidden) goHome(); else { closeCard({ restore: true }); clearChoice(); } },
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
    const alt = Math.min(deskAlt, clampAlt(view.alt * f));
    flyTo({ ...view, lat: liftLat(view.lat, view.alt, alt), alt });
  }
  function goHome() {
    closeCard();
    clearChoice();
    openOnly([]);
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
  const motionObserver = new MutationObserver(() => { readTheme(); onMotion(); });
  motionObserver.observe(root, { attributes: true, attributeFilter: ['data-motion', 'data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { readTheme(); camDirty = true; kick(); });
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
  rest = restCamera();
  Object.assign(view, rest);
  paintMask(home);

  const controller = {
    figure,
    /** Re-weight the pins from a filtered set: size means how much is here,
        never how good it is. The list badges follow. */
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
      clusterAt = -1;
      camDirty = true;
      kick();
    },
    reset() { goHome(); },
    /**
     * Go somewhere by data — for a page that drives the globe, such as the
     * home page's distance doors. One of:
     *   { place: id }            a place on this map (its card opens)
     *   { country: code }        a country (its card opens)
     *   { bounds: { north, south, west, east }, label? }   a region, framed
     *   { camera: { lat, lon, alt } }                      an exact camera
     * A place or country is a choice (history, `world:choose`); a region or
     * a camera is a view. Returns false for something this map cannot show.
     */
    show(spec, { push = true } = {}) {
      if (!spec) return false;
      if (spec.place) { const p = byId.get(spec.place); if (!p) return false; goToPlace(p, { push }); return true; }
      if (spec.country) { const c = geography.byId.get(spec.country); if (!c) return false; goToCountry(c, { push }); return true; }
      /* A camera further out than the desk stops at the desk. */
      let cam = spec.camera && Number.isFinite(spec.camera.lat) ? { ...spec.camera, alt: Math.min(deskAlt, spec.camera.alt) } : null;
      if (spec.bounds) {
        const { north, south, west, east } = spec.bounds;
        if (![north, south, west, east].every(Number.isFinite)) return false;
        cam = fitCamera([toXYZ(north, west), toXYZ(north, east), toXYZ(south, west), toXYZ(south, east), toXYZ((north + south) / 2, (west + east) / 2)],
          { maxAlt: REST_MAX_ALT * 1.6, minAlt: HANDBACK_ALT * 1.15 });
      }
      if (!cam) return false;
      closeCard();
      clearChoice();
      const target = { lat: cam.lat, lon: cam.lon, alt: cam.alt };
      climbOut(() => flyTo(target, { announce: spec.label || '', travel: true }));
      return true;
    },
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
        drawDesk();
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
    try { if (select(sel)) { currentSel = sel; announceChoice(sel, { restored: true }); } } finally { restoring = false; }
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
