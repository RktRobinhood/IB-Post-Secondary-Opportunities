/* One illustrated pastel globe, world to country. ADR 0005.
 * map.js progressively loads WebGL; the semantic list is the complete fallback.
 * DOM pins carry names and links; reduced motion arrives without animation. */

const root = document.documentElement;
const reducedMotion = () =>
  root.getAttribute('data-motion') === 'reduced' || matchMedia('(prefers-reduced-motion: reduce)').matches;

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
/* A gentle perspective keeps the floating sphere readable. */
const FOV = 36.87 * D2R;
const TAN = Math.tan(FOV / 2);
const ATLAS_COUNTRY_MIN = 0.045; // country framing only, not a street map
const MIN_ALT = 0.12;      // country level; never a campus or street camera
const MAX_ALT = 6.5;         // the desk view is the furthest out a page goes; a tall, narrow stage needs this much
const REST_MAX_ALT = 1.4;   // a single-country page rests no further out; a region shown by show({ bounds }), 1.6x this
const HOME_REST_MIN_ALT = 0.2; // …and no closer: its country, not a group of its places
const PHONE_HOLD_MS = 4000;
const FINE_ALT = 0.9;       // below this the finer border layer is fetched
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
   the camera comes close, so the country stays clear of the stand. */
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
attribute vec3 aPos;
uniform mat4 uVP; uniform float uR;
varying vec3 vN; varying vec3 vW;
void main() { vec3 p = aPos * uR; vN = aPos; vW = p; gl_Position = uVP * vec4(p, 1.0); }`;

const EARTH_FS = `${MED}
uniform sampler2D uMask; uniform sampler2D uPol; uniform sampler2D uPolL;
uniform vec3 uEye; uniform vec3 uSun; uniform vec3 uTint; uniform float uMaskOn;
uniform vec4 uPolRect; uniform float uPolLOn;
varying vec3 vN; varying vec3 vW;
void main() {
  vec3 n = normalize(vN), v = normalize(uEye - vW);
  vec2 uv = vec2(atan(n.x, n.z) / 6.2831853 + 0.5, acos(clamp(n.y, -1.0, 1.0)) / 3.1415927);
  vec2 pu = (uv - uPolRect.xy) / max(uPolRect.zw - uPolRect.xy, vec2(0.00001));
  float local = uPolLOn * step(0.0, pu.x) * step(pu.x, 1.0) * step(0.0, pu.y) * step(pu.y, 1.0);
  vec4 pol = mix(texture2D(uPol, uv), texture2D(uPolL, clamp(pu, 0.0, 1.0)), local);
  vec4 nx = mix(texture2D(uPol, uv + vec2(1.0 / 2048.0, 0.0)), texture2D(uPolL, clamp(pu + vec2(1.0 / 2048.0, 0.0), 0.0, 1.0)), local);
  vec4 ny = mix(texture2D(uPol, uv + vec2(0.0, 1.0 / 1024.0)), texture2D(uPolL, clamp(pu + vec2(0.0, 1.0 / 2048.0), 0.0, 1.0)), local);
  float border = pol.a * nx.a * ny.a * clamp((length(pol.rgb - nx.rgb) + length(pol.rgb - ny.rgb)) * 4.0, 0.0, 1.0);
  float coast = clamp((abs(pol.a - nx.a) + abs(pol.a - ny.a)) * 1.6 + border, 0.0, 1.0);
  float water = 1.0 - pol.a;
  vec3 col = mix(pol.rgb, vec3(0.45, 0.72, 0.89), water) * (0.86 + 0.24 * max(dot(n, uSun), 0.0));
  col += pow(max(dot(n, normalize(uSun + v)), 0.0), 70.0) * 0.18 * water;
  col = mix(col, vec3(0.24, 0.18, 0.12), coast * 0.5);
  col = mix(col, uTint, texture2D(uMask, uv).r * uMaskOn * 0.3);
  col = mix(col, vec3(0.42, 0.66, 1.0), pow(1.0 - max(dot(n, v), 0.0), 2.6) * 0.35);
  gl_FragColor = vec4(col, 1.0);
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

/* A transparent halo around the limb and a soft shadow on the paper. */
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

function texture(gl, source, { mip = true, luminance = false, alpha = false } = {}) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  const fmt = luminance ? gl.LUMINANCE : alpha ? gl.RGBA : gl.RGB;
  gl.texImage2D(gl.TEXTURE_2D, 0, fmt, fmt, gl.UNSIGNED_BYTE, source);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
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
  return t;
}

/** A sphere whose position doubles as its normal. */
function sphereMesh(latSteps = 80, lonSteps = 160) {
  const pos = [], idx = [];
  for (let i = 0; i <= latSteps; i++) {
    const lat = 90 - (i / latSteps) * 180;
    for (let j = 0; j <= lonSteps; j++) {
      const lon = -180 + (j / lonSteps) * 360;
      pos.push(...toXYZ(lat, lon));
    }
  }
  const row = lonSteps + 1;
  for (let i = 0; i < latSteps; i++) {
    for (let j = 0; j < lonSteps; j++) {
      const a = i * row + j, b = a + row;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  return { pos: new Float32Array(pos), idx: new Uint16Array(idx) };
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
  /* An anti-aliased edge pixel can pass the check digit by chance and name a
     country past the end of the list (the finer borders, 6 October: the whole
     layer failed to load on it): such a pixel is nobody's. */
  const idAt = (k) => (pixels[k + 1] === 255 && pixels[k] && pixels[k] <= ranges.length && pixels[k + 2] === ((pixels[k] * 53) & 255) ? pixels[k] : 0);
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
  /* Twice the picking raster's size: a continent's height magnifies it
     (globe levels), and its edge is the ink coastline. */
  ranges.forEach((r, i) => { r.colour = PASTEL[hue[i]]; });
  const political = document.createElement('canvas');
  political.width = PW * 2; political.height = PH * 2;
  const pol = political.getContext('2d');
  ranges.forEach((r, i) => { pol.fillStyle = PASTEL[hue[i]]; traceRings(pol, r.rings, PW * 2, PH * 2); });

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
    .map((p) => ({ ...p, ...splitFlag(p.name), xyz: toXYZ(p.lat, p.lon), dim: false, selected: false }));
  const byId = new Map(places.map((p) => [p.id, p]));
  /* A country is a place to go only when it holds a light (the owner, 14 Oct
     2026: "you can't zoom into countries that don't have any schools").
     Clicks, double clicks and the hover outline pass over the rest. */
  let schooled = null;  // filled on first use, once every place knows its country
  const holdsSchools = (c) => !!c && (schooled ||= new Set(places.map((p) => p.country).filter(Boolean))).has(c.id);
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
        count: 1, school: true, parent: p, dim: false, selected: false, inst: q.inst || q.id, n: 0,
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
  const [geo, destinations] = await Promise.all([
    fetch(new URL('geo/countries.json', assets)).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    fetch(new URL('geo/destinations.json', assets)).then((r) => (r.ok ? r.json() : [])).catch(() => []),
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
  /* A place's own flag: the one its name carried (a whole country's light),
     or, on a page of several countries, its country's — so a town reads as
     that country's town. Schools sit inside their country's light and carry
     none. A flag the site has no drawing for is dropped when it fails to
     load, never shown as letters. */
  const flagSrc = (code) => new URL(`img/flags/${code}.svg`, assets).href;
  function flagEl(code) {
    const img = el('img', { class: 'world__flag', src: flagSrc(code), alt: '', width: '18', height: '12', decoding: 'async' });
    img.addEventListener('error', () => img.remove(), { once: true });
    return img;
  }
  for (const p of places) if (!p.flag && countries.size > 1 && p.country) p.flag = p.country;

  /* --- Levels (the owner, 6 October 2026) ----------------------------------
   *
   * "The globe has too many granular zoom settings and gets quite confused."
   * A page whose lights are whole countries, in more than one country — the
   * home page, Countries — is read in levels that line up with the site's
   * templates, not in altitudes:
   *
   *   world    the desk globe, one bubble per continent, with its number;
   *   region   a continent chosen: one node per country — never two countries
   *            in one — each with its number;
   *   country  a country chosen (its node or its outline): its card, which is
   *            the country page, and its universities, one pin each, whose
   *            cards are the universities' pages.
   *
   * Each level has its frame and the camera goes there; +, −, the wheel and a
   * pinch step one level; there is no close map and no street level. Nothing
   * groups: two nodes that would overlap are nudged apart, with a thread back
   * to where they belong. The numbers are universities, what the next level
   * down shows. A Destination's continent is its record's (destinations.json
   * `continent`); nothing here names one.
   */
  const continentOfCode = (code) => pages.get(code)?.continent || '';
  const levels = !home && countries.size > 1
    && places.every((p) => p.precision === 'region' && p.country)
    && places.some((p) => continentOfCode(p.country));
  const regions = new Map();
  if (levels) {
    for (const p of places) {
      /* A Destination whose record names no continent the vocabulary knows is
         a region of its own: one click past it is its country. */
      const id = continentOfCode(p.country) || `own-${p.country}`;
      if (!regions.has(id)) regions.set(id, { id, name: pages.get(p.country)?.continentName || p.name, members: [] });
      regions.get(id).members.push(p);
      p.region = id;
      /* Its number is its universities: the pins its country level shows. */
      if (p.subs.length) p.count = p.subs.length;
      // The inventory of universities on the map is distinct from a degree
      // search's transient set of matches (e.g. Nearby excludes home).
      p.atlasCount = p.count || 0;
    }
    /* A continent's coin sits on the country at its heart: the one whose
       universities-weighted distance to all the others is least (round 1: the
       mean of Europe's lights put its coin over Belarus). */
    for (const r of regions.values()) {
      let best = r.members[0], bestD = Infinity;
      for (const m of r.members) {
        const d = r.members.reduce((n, k) => n + (k.count || 1) * angle(m.xyz, k.xyz), 0);
        if (d < bestD) { bestD = d; best = m; }
      }
      r.xyz = best.xyz;
    }
  }
  const lv = { level: 'world', region: '', country: '' };
  const focusedAtlas = levels && figure.id === 'discover-map';

  const progs = {
    earth: program(gl, SPHERE_VS, EARTH_FS),
    line: program(gl, LINE_VS, LINE_FS),
    sky: program(gl, QUAD_VS, SKY_FS),
  };

  const mesh = sphereMesh();
  const buf = (data, target = gl.ARRAY_BUFFER) => {
    const b = gl.createBuffer();
    gl.bindBuffer(target, b);
    gl.bufferData(target, data, gl.STATIC_DRAW);
    return b;
  };
  const posBuf = buf(mesh.pos);
  const idxBuf = buf(mesh.idx, gl.ELEMENT_ARRAY_BUFFER);
  const lineBuf = buf(geography.lines.length ? geography.lines : new Float32Array(6));
  const quadBuf = buf(new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]));

  const blank = document.createElement('canvas');
  blank.width = blank.height = 1;
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = 1024; maskCanvas.height = 512;
  const maskCtx = maskCanvas.getContext('2d');
  let maskTex = texture(gl, maskCanvas, { mip: false, luminance: true });
  let polTex = texture(gl, geography.political, { alpha: true }); // alpha is the land: the seas are where no country is
  /* The chosen country's surroundings, painted sharp (paintLocal). */
  const localCanvas = document.createElement('canvas');
  localCanvas.width = localCanvas.height = 2048;
  const localCtx = localCanvas.getContext('2d');
  let localTex = texture(gl, blank, { mip: false });
  let localRect = [0, 0, 0, 0];
  let localFor = '';

  /* --- Furniture ---------------------------------------------------------- */

  const pinLayer = el('div', { class: 'world__pins', 'aria-hidden': 'true' });
  const SVGNS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs = {}) => { const n = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; };
  /* The outline of the country under the pointer — its land, its bubble, a
     pin in it, or its entry in the list — drawn over the globe in the pin
     layer, two strokes wide, so it is clear which country a click will
     choose (the owner, #53: "hovering shows the boundaries of the nation so
     it is easier to see what you are clicking"). A GL line is one pixel
     wide on most machines; this is not. */
  const outlineSvg = svgEl('svg', { class: 'world__outline', 'aria-hidden': 'true' });
  const outlineUnder = svgEl('path', { class: 'world__outline-under' });
  const outlineOver = svgEl('path', { class: 'world__outline-over' });
  outlineSvg.append(outlineUnder, outlineOver);
  outlineSvg.style.display = 'none';
  /* The threads from a nudged node back to where it belongs (levels). */
  const threadSvg = svgEl('svg', { class: 'world__threads', 'aria-hidden': 'true' });
  const threadPath = svgEl('path', { class: 'world__thread' });
  const threadDots = svgEl('path', { class: 'world__thread-dot' });
  threadSvg.append(threadPath, threadDots);
  threadSvg.style.display = 'none';
  pinLayer.append(outlineSvg, threadSvg);
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

  /** Where the globe's disc is on the stage, in CSS pixels. */
  function globeDisc() {
    const d = [-cam.eye[0], -cam.eye[1], -cam.eye[2]];
    const z = dot(d, cam.fwd);
    const nx = dot(d, cam.right) / (z * TAN * (W / H));
    const ny = dot(d, cam.up) / (z * TAN) + cam.shift;
    const r = (Math.tan(Math.asin(Math.min(1, 1 / Math.hypot(...cam.eye)))) / TAN) * (H / 2);
    return { cx: (nx + 1) * 0.5 * W, cy: (1 - ny) * 0.5 * H, r };
  }

  function drawDesk() {
    const k = desk(view.alt);
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

  /* Where the globe is, on a levels page: "World › Europe › Denmark", each
     step above the current one a button back up to it. */
  const trail = el('nav', { class: 'world__trail', 'aria-label': 'Where the globe is', hidden: '' });
  /* A phone's key to a country's numbered pins, right under the stage. */
  const keyList = el('ol', { class: 'world__key', hidden: '' });
  const controls = el('div', { class: 'world__controls' });
  const zoomIn = button('Zoom in', '+');
  const zoomOut = button('Zoom out', '−');
  const zoomReset = button('Back to the whole view', 'Reset');
  zoomReset.classList.add('world__btn--wide');
  controls.append(zoomIn, zoomOut, zoomReset);

  const card = el('section', { class: 'world__card', hidden: '', 'aria-label': 'Selected on the globe' });
  const hint = el('p', { class: 'world__hint', 'aria-hidden': 'true', hidden: '' });
  const credit = el('p', { class: 'world__credit' });
  const creditLink = el('a', { href: `${root.dataset.base === '/' ? '' : root.dataset.base || ''}/credits/#globe` }, 'Map sources');
  credit.append(creditLink);

  const atlasHover = focusedAtlas ? el('p', { class: 'world__hover-readout', hidden: '', 'aria-hidden': 'true' }) : null;
  stage.append(deskBack, canvas, pinLayer, hint, credit);
  if (atlasHover) stage.append(atlasHover);
  /* On a narrow screen (a phone) the camera buttons are a row above the
     stage and the card is a sheet below it, so neither covers the globe or
     the places just chosen (#53 round 1: the card hid a chosen country's
     schools, and "+" sat on the ring). On a wide stage both sit in its
     corners, as before. */
  const narrowMQ = matchMedia('(max-width: 44rem)');
  const coarse = matchMedia('(pointer: coarse)').matches;
  function placeFurniture() {
    if (narrowMQ.matches) {
      stage.before(controls);
      stage.after(card);
      if (levels) { controls.prepend(trail); (focusedAtlas && lv.level === 'country' ? card : stage).after(keyList); }
    } else {
      pinLayer.after(controls);
      controls.after(card);
      if (levels) {
        controls.before(trail);
        if (focusedAtlas && lv.level !== 'world') stage.after(card);
        if (focusedAtlas && lv.level === 'country') card.after(keyList);
        else { keyList.hidden = true; keyList.remove(); }
      }
    }
    stage.toggleAttribute('data-trail', levels && !trail.hidden && trail.parentNode === stage);
    figure.dataset.furniture = narrowMQ.matches ? 'outside' : 'inside';
    if (focusedAtlas) figure.dataset.atlasLevel = lv.level;
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
        levels
          ? 'Drag to spin the globe. Choose a continent, then a country, then a university; + and − step in and out. Every place is in the list either way.'
          : 'Drag to spin the globe, pinch or use + and − to zoom, click a country or a light to fly there. Every place is in the list either way.')
    : null;
  if (legendHint) caption.append(legendHint);

  /* --- Size ---------------------------------------------------------------- */

  let W = 1, H = 1, dpr = 1;
  let atlasFit = null;
  function resize() {
    const r = stage.getBoundingClientRect();
    const refit = atlasFit && (Math.abs(W - r.width) > 1 || Math.abs(H - r.height) > 1);
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
    if (refit) {
      stopMotion();
      lvCam = atlasFit();
      Object.assign(view, lvCam);
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
    /* A levels page tips the camera less: the continent fills the stage,
       not a band of sky over a horizon (round 2: "a cream fog band"). */
    const p = pitchFor(s.alt) * (1 - dk) * (levels ? 0.55 : 1);
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
    const near = Math.max(0.0015, (dist - 1) * 0.45);
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
    const nx = dot(d, c.right) / (z * TAN * (w / h));
    const ny = dot(d, c.up) / (z * TAN) + c.shift;
    return { x: (nx + 1) * 0.5 * w, y: (1 - ny) * 0.5 * h, facing };
  }

  /** The point on the Earth under a pixel, or null for space. */
  function pick(clientX, clientY) {
    const r = stage.getBoundingClientRect();
    return pickStage(clientX - r.left, clientY - r.top);
  }

  function pickStage(x, y) {
    const nx = (x / W) * 2 - 1;
    const ny = 1 - (y / H) * 2;
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
   * paper: the top of the stage (corners and middle) and both its sides
   * half way down look past the Earth, so the limb shows on top, left and
   * right (on a phone the sphere may run on below the feathered bottom). A country's or a region's arrival stops here
   * (the owner, #53: "resume into a sphere and not … a sphere with
   * background"); the view never approaches a campus or street. Found against the real camera, as fitCamera is.
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
      /* The Earth's edge shows across the top and down both sides (#53
         round 2: a phone landed on a dome whose sides were feathered off). */
      return [[0, 0], [W / 2, 0], [W, 0], [0, H / 2], [W, H / 2]].every(([x, y]) => misses(c, x, y));
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
  function fitCamera(points, { maxAlt = MAX_ALT, minAlt = MIN_ALT * 1.6, pad = [0.12, 0.18, 0.1], left = 0, below = 0 } = {}) {
    if (!points.length) return { lat: 30, lon: 10, alt: REST_MAX_ALT, fits: true };
    const centre = norm(points.reduce((s, p) => [s[0] + p[0], s[1] + p[1], s[2] + p[2]], [0, 0, 0]));
    const [lat0, lon0] = toLatLon(centre);
    let tgt = { lat: Math.max(-70, Math.min(75, lat0)), lon: lon0 };
    const mx = Math.min(W * pad[0], 140), top = H * pad[1], bot = H * pad[2];
    const fits = (alt) => {
      const c = solveCamera({ ...tgt, alt }, {});
      return points.every((p) => {
        const s = project(p, c);
        return s.facing > 0.12 && s.x > mx + left / 2 && s.x < W - mx - left / 2 && s.y > top + below / 2 && s.y < H - bot - below / 2;
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
    const ok = fitsAt(alt);
    /* Room kept on the left (an open card beside what it is about): the frame
       was found as wide as the room is, in the middle; now it slides right by
       half the card, at the same height. */
    for (let pass = 0; (left > 0 || below > 0) && pass < 5; pass++) {
      const c = solveCamera({ ...tgt, alt }, {});
      const s = points.map((p) => project(p, c)).filter((q) => q.facing > 0);
      if (!s.length) break;
      const xs = s.map((q) => q.x), ys = s.map((q) => q.y);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
      const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      const k = radPerPx(alt) * R2D;
      tgt = {
        lat: Math.max(-70, Math.min(75, tgt.lat - (cy - (top + H - bot - below) / 2) * k * (1 + Math.sin(pitchFor(alt))))),
        lon: wrapLon(tgt.lon + ((cx - (W + left) / 2) * k) / Math.max(0.3, Math.cos(tgt.lat * D2R))),
      };
    }
    return { ...tgt, alt, fits: ok };
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
    let heart = pts.length ? norm(pts.reduce((acc, q, i) => [acc[0] + q[0] * count[i], acc[1] + q[1] * count[i], acc[2] + q[2] * count[i]], [0, 0, 0])) : toXYZ(45, 10);
    /* The arrival and its poster face Europe. Other continents are a turn away. */
    if (levels) heart = toXYZ(52, 12);
    const [hLat, hLon] = toLatLon(heart);
    deskPose = { lat: Math.max(0, Math.min(DESK_LAT_MAX, hLat * 0.75)), lon: hLon, alt: deskAlt };
    /* A single-country page rests on its country (round 4: the Netherlands
       as one bubble on the edge of a whole-world desk); the desk is one
       zoom-out away. Never below country level. */
    if (home) {
      const narrow = Math.min(1, Math.max(0.6, W / 1100));
      const fit = fitCamera(pts, { maxAlt: REST_MAX_ALT, minAlt: Math.max(MIN_ALT, HOME_REST_MIN_ALT * narrow), pad: [0.16, 0.24, 0.14] });
      if (fit.fits) return { lat: fit.lat, lon: fit.lon, alt: fit.alt };
    }
    return { ...deskPose, alt: deskAlt };
  }


  /* --- Motion -------------------------------------------------------------- */

  let flight = null;       // an eased journey in progress
  let spin = null;         // inertia after a drag
  let idle = !reducedMotion();
  let idleBase = null;

  function stopMotion() {
    flight = null;
    spin = null;
  }

  /* Fine country outlines wait for intent, except where a country page
     needs them for its initial view. */
  let touched = false;
  function touch() {
    idle = false;
    if (!touched) {
      touched = true;
      const later = window.requestIdleCallback || ((fn) => setTimeout(fn, 400));
      later(() => maybeFine(0), { timeout: 2500 });
    }
    hideHint();
  }

  /** Smoothly turn and lean between world, continent and country. */
  function flyTo(target, { announce = '', onArrive = null } = {}) {
    touch();
    const alt = focusedAtlas && lv.level === 'country' ? Math.max(ATLAS_COUNTRY_MIN, Math.min(MAX_ALT, target.alt)) : clampAlt(target.alt);
    const to = { lat: Math.max(-80, Math.min(80, target.lat)), lon: wrapLon(target.lon), alt };
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
    const peak = Math.log(Math.min(3.2, deskIn() * 0.95, Math.max(from.alt, to.alt, w * 1.5)));
    const ctrl = peak > Math.max(la0, la1) ? 2 * peak - (la0 + la1) / 2 : (la0 + la1) / 2;
    const top = Math.exp(Math.max(peak, la0, la1));
    /* The site's `geographic` motion token is the length of a typical flight;
       a longer journey, or a deeper dive, takes proportionally longer. */
    const base = parseFloat(getComputedStyle(root).getPropertyValue('--motion-geographic-ms')) || 1400;
    const dur = base * Math.min(2.1, Math.max(0.65, 0.68 + w * 0.46 + Math.abs(la1 - la0) * 0.12 + (top > Math.max(from.alt, to.alt) * 1.2 ? 0.18 : 0)));
    maybeFine(to.alt);
    /* Off the desk: the globe turns on its axis to face you, then you lean in.
       Back onto it: you sit back, then it turns. */
    const leanIn = desk(from.alt) > 0.5 && to.alt < from.alt * 0.8;
    const sitBack = !leanIn && desk(to.alt) > 0.5 && from.alt < to.alt * 0.8;
    const dLon = wrapLon(to.lon - from.lon);
    spin = null;
    flight = { t0: performance.now(), dur: dur * (leanIn || sitBack ? 1.3 : 1), from, to, a, b, la0, la1, ctrl, leanIn, sitBack, dLon, announce, onArrive };
    if (announce) say(`Flying to ${announce}.`);
    kick();
  }

  function stepFlight(now) {
    const f = flight;
    const t = Math.min(1, (now - f.t0) / f.dur);
    const s = easeInOut(t);
    const move = easeInOut(Math.min(1, Math.max(0, (t - 0.12) / 0.76)));
    f.move = move;
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
    camDirty = true;
    if (t >= 1) {
      Object.assign(view, f.to);
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
  const uploads = [];
  const whenStill = (fn) => { uploads.push(fn); kick(); };
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
        if (selectedCountry) selectedCountry = g.byId.get(selectedCountry.id) || (selectedCountry.count ? null : selectedCountry);
        if (home) home = g.byId.get(home.id) || home;
        if (selectedCountry || home) paintLocal(selectedCountry || home);
        paintMask(selectedCountry || home);
        hoverCountry = null;
        camDirty = true;
        kick();
      })
      .catch((err) => console.warn('[world] the finer borders could not load; the coarse ones stay.', err?.message || err))
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
    const label = el('span', { class: 'world__pin-label' });
    if (p.flag && !p.school) label.append(flagEl(p.flag));
    label.append(document.createTextNode(p.name));
    node.append(dotEl, label);
    pinLayer.append(node);
    p.node = node;
    p.labelEl = label;
    node.addEventListener('pointerenter', () => { if (!focusedAtlas || lv.level === 'world') { light(p.id, { fromMap: true }); outlineFor([nationOf(p)]); } });
    /* The card's photograph is on its way before the finger lifts. */
    node.addEventListener('pointerdown', () => prefetch(p.image || pages.get(p.country)?.image));
    node.addEventListener('pointerenter', () => prefetch(p.image || pages.get(p.country)?.image), { once: true });
    node.addEventListener('pointerleave', () => { if (!focusedAtlas || lv.level === 'world') { light(null); outlineFor([]); } });
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
    nationChosen = '';
    nationForced = '';
    clusterAt = -1;
  }
  /* A chosen country opens only once the turn has brought it round to face
     the camera, off the desk's ring (#53 round 2: its schools rode the brass
     ring at the limb while the globe still showed Africa). While a country
     is chosen, no other country opens: its neighbours stay single, faded
     lights, so everything numbered on the stage is the chosen country's
     (round 2: a "19" of 11 US and 8 Canadian schools). */
  const chosenSide = (m) => (opened.has((m.parent || m).id) || (!!nationChosen && nationOf(m) === nationChosen) ? 1 : 0);
  function schoolsOpen(p) {
    if (!p.subs.length) return false;
    if (opened.has(p.id)) return project(p.xyz).facing > 0.3 && desk(view.alt) < 0.05;
    if (opened.size) return false;
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

  /* --- Per nation ----------------------------------------------------------
   *
   * The owner (#53): "the bubbles are becoming cluttered and yes should be
   * grouped initially, but then per nation". So the groups have three
   * levels, and each level is one kind of thing:
   *
   *   1. on the desk, everything groups by distance, as it always has (a
   *      "40" over Europe);
   *   2. leaned in, a country's places are one bubble — its flag and its
   *      count — never a slice of it beside a slice of its neighbour. A
   *      bubble holds two countries only when their bubbles would sit on top
   *      of each other, and then it shows both flags;
   *   3. a country opens into its own places once they would come apart on
   *      the stage (NATION_SPLIT of its shorter side), once the camera is
   *      down at SCHOOLS_ALT, or when it is chosen; its places then group
   *      only with each other.
   *
   * A click on a country's bubble chooses the country (its outline, its
   * card); a click on a mixed bubble dives until it comes apart.
   * Read from each place's `country`; nothing here names one.
   */
  const NATION_SPLIT = 0.2;
  const nationOf = (m) => (m.parent || m).country || '';
  let nationChosen = '';  // the country chosen on the globe, whose places are open
  let nationForced = '';  // the country of a chosen place: open, so the place is a pin
  const wasOpen = new Map();
  function nationOpen(code, members) {
    if (!code || members.length < 2) return true;
    if ((home && home.id === code) || nationChosen === code || nationForced === code) return true;
    if (members.some((m) => (m.parent || m).selected)) return true;
    if (view.alt <= SCHOOLS_ALT) return true;
    let spread = 0;
    for (let i = 0; i < members.length; i++) for (let j = i + 1; j < members.length; j++) spread = Math.max(spread, angle(members[i].xyz, members[j].xyz));
    /* A little hysteresis, so a camera resting on the threshold does not flicker. */
    return spread / radPerPx() >= NATION_SPLIT * Math.min(W, H) * (wasOpen.get(code) ? 0.85 : 1);
  }
  const centreOf = (list) => norm(list.reduce((s, m) => [s[0] + m.xyz[0], s[1] + m.xyz[1], s[2] + m.xyz[2]], [0, 0, 0]));
  const nationsIn = (members) => [...new Set(members.map(nationOf).filter(Boolean))];

  function cluster() {
    if (levels) { clusterLevels(); return; }
    /* Facing places are compared where they land on the screen, which is what
       a reader sees — a tilted camera squeezes north and south together. The
       rest, round the back, by angle. Recomputed only when the zoom changes or
       the camera has travelled, so the groups hold still under a spin. */
    const theta = PIN_GAP * radPerPx() * (1 + Math.sin(cam.pitch));
    const cosT = Math.cos(theta);
    const shown = pinnedNow();
    const onDesk = desk(view.alt) > 0.5;
    /* The units: a closed country is one, at its middle — its own light's
       position when it has one (a country's light sits at its visual
       centre), else the middle of its places; every other place is one. */
    const byNation = new Map();
    for (const p of shown) {
      const c = nationOf(p);
      if (c) (byNation.get(c) || byNation.set(c, []).get(c)).push(p);
    }
    /* A town's label carries its country's flag only while it stands for its
       country alone; among its country's other places the flag is noise. */
    for (const p of shown) p._solo = p.precision === 'region' || (byNation.get(nationOf(p))?.length || 0) <= 1;
    const closed = new Set();
    for (const [code, members] of byNation) {
      const open = nationOpen(code, members);
      wasOpen.set(code, open);
      if (!open) closed.add(code);
    }
    const units = [];
    for (const code of closed) {
      const members = byNation.get(code);
      const own = members.find((m) => m.precision === 'region' && !m.school);
      units.push({ members, xyz: own ? own.xyz : centreOf(members), nation: code, count: groupCount(members) });
    }
    for (const p of shown) if (!closed.has(nationOf(p))) units.push({ members: [p], xyz: p.xyz, nation: '', count: p.count || 0 });
    for (const u of units) u._s = project(u.xyz);
    /* Off the desk, two things group by distance only inside one country:
       the level below a country is its own places. */
    const sameNation = (a, b) => nationOf(a.members[0]) === nationOf(b.members[0]);
    const near = (a, b) => chosenSide(a.members[0]) === chosenSide(b.members[0])
      && (onDesk || (!a.nation && !b.nation && sameNation(a, b)))
      && (a._s.facing > 0.05 && b._s.facing > 0.05
        ? Math.hypot(a._s.x - b._s.x, a._s.y - b._s.y) < PIN_GAP
        : dot(a.xyz, b.xyz) > cosT);
    const left = [...units].sort((a, b) => b.count - a.count || (a.members[0].name || '').localeCompare(b.members[0].name || ''));
    const out = [];
    while (left.length) {
      const seed = left.shift();
      const parts = [seed];
      for (let i = left.length - 1; i >= 0; i--) {
        if (parts.some((m) => near(m, left[i]))) parts.push(...left.splice(i, 1));
      }
      const members = parts.flatMap((u) => u.members);
      const xyz = parts.length === 1 ? seed.xyz : centreOf(members);
      /* A group that is exactly one closed country is that country's bubble. */
      out.push({ members, xyz, count: groupCount(members), nation: parts.length === 1 ? seed.nation : '' });
    }
    /* Two groups whose circles (and glow) overlap on screen are one group
       (round 4: a "4" drawn over a "36"). Repeated until nothing overlaps. */
    const drawnR = (g) => (g.members.length === 1 ? radius(g.members[0], maxCount()) + 4 : 11 + Math.min(9, Math.sqrt(g.members.length) * 3) + 7);
    /* Off the desk, two countries' bubbles merge only when the discs
       themselves would touch, not their glows: neighbours stay apart as long
       as they can be told apart (round 6: the Low Countries and Germany as
       one "16"). */
    const coreR = (g) => (g.members.length === 1 ? radius(g.members[0], maxCount()) + 2 : 11 + Math.min(9, Math.sqrt(g.members.length) * 3) + 2);
    const gap = (a, b) => (onDesk || nationsIn(a.members).join() === nationsIn(b.members).join() ? drawnR(a) + drawnR(b) : coreR(a) + coreR(b));
    for (let merged = true; merged;) {
      merged = false;
      for (const g of out) g._s = project(g.xyz);
      outer: for (let i = 0; i < out.length; i++) {
        for (let j = i + 1; j < out.length; j++) {
          const a = out[i], b = out[j];
          if (a._s.facing <= 0.05 || b._s.facing <= 0.05) continue;
          if (chosenSide(a.members[0]) !== chosenSide(b.members[0])) continue;
          if (Math.hypot(a._s.x - b._s.x, a._s.y - b._s.y) >= gap(a, b)) continue;
          const members = [...a.members, ...b.members];
          out.splice(j, 1);
          out[i] = { members, xyz: centreOf(members), count: groupCount(members), nation: '' };
          merged = true;
          break outer;
        }
      }
    }
    groups = out;
    clusterAt = view.alt;
    clusterFrom = toXYZ(view.lat, view.lon);
  }

  /** The groups as they will be at another camera (a climb's destination). */
  function clusterFor(target) {
    const saved = { lat: view.lat, lon: view.lon, alt: view.alt };
    Object.assign(view, { lat: target.lat, lon: target.lon, alt: target.alt });
    solveCamera(view);
    try { cluster(); } finally {
      Object.assign(view, saved);
      solveCamera(view);
    }
  }

  function clusterNode(i) {
    while (clusterPool.length <= i) {
      const node = el('div', { class: 'world__cluster' });
      /* The number; under it the flags of the countries it holds (up to
         four); and, for one country's bubble, its name beside it, placed
         like a pin's label. */
      node.append(el('span', { class: 'world__cluster-n' }), el('span', { class: 'world__cluster-flags' }), el('span', { class: 'world__pin-label world__cluster-label' }));
      node.addEventListener('pointerenter', () => {
        if (!node._members || (focusedAtlas && lv.level !== 'world')) return;
        light(node._members.map((m) => m.id).join(' '), { fromMap: true });
        outlineFor(nationsIn(node._members));
      });
      node.addEventListener('pointerleave', () => { if (!focusedAtlas || lv.level === 'world') { light(null); outlineFor([]); } });
      pinLayer.append(node);
      clusterPool.push(node);
    }
    return clusterPool[i];
  }

  let litSet = new Set();

  function layoutPins() {
    if (touched) maybeFine();
    /* A card is judged only once the camera has arrived: during a flight its
       subject is legitimately off-stage. */
    if (cardSubject && !flight) cardStillAbout();
    /* During a flight the groups hold still and are recomputed on arrival:
       watching "12" become 10, 9, then 5 and 5 mid-dive is noise. A climb
       back out (Reset, Back, a sit-back to the desk) regroups for where it
       is going half way up, so it lands on its own groups rather than on
       the split ones it left, merging a second after landing (round 5,
       bug 6: "5", "15", "2" and a pile of rings before "40"). */
    /* On a levels page the old level's nodes ride the first half of a
       flight and the new level's pop in at half way, as the camera comes
       near enough to show them apart (round 0: Europe's coin burst into a
       honeycomb of 26 countries on the desk, before the globe had leaned in). */
    if (levels && flight && (flight.move ?? 0) < 0.5 && groups.length) {
      /* held */
    } else if (flight && clusterAt > 0) {
      if (!flight.regrouped && flight.to.alt > flight.from.alt * 1.5 && (flight.move ?? 0) >= 0.45) {
        flight.regrouped = true;
        clusterFor(flight.to);
      }
    } else if (clusterAt < 0 || Math.abs(Math.log(view.alt / clusterAt)) > 0.06
      || angle(clusterFrom, toXYZ(view.lat, view.lon)) > Math.min(0.35, 0.25 * view.alt + 0.03)) cluster();
    if (levels) { layoutLevels(); return; }
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
    /* On the desk, the globe's disc on screen: a pin or a label past its edge
       would be drawn over the brass ring (#53 round 2). */
    const dk = desk(view.alt);
    const disc = dk > 0.02 ? globeDisc() : null;
    const offDisc = (x, y, pad = 0) => !!disc && Math.hypot(x - disc.cx, y - disc.cy) + pad > disc.r;
    /* Pins and groups are placed first and are all obstacles; labels come
       after, so a label never lands on a group drawn later (round 2:
       "Macalester" across a "19"). */
    const obstacles = [];
    const wanted = [];
    for (const g of groups) {
      const s = project(g.xyz);
      const onScreen = s.facing > 0 && s.x > -40 && s.x < W + 40 && s.y > -40 && s.y < H + 40;
      const fade = Math.min(1, Math.max(0, (s.facing - 0.02) / 0.2));
      /* A chosen country's neighbours recede. */
      const aside = (opened.size || nationChosen) && !chosenSide(g.members[0]) ? 0.45 : 1;
      if (g.members.length === 1) {
        const p = g.members[0];
        seen.add(p.id);
        const node = p.node;
        const r = p.school ? 4.5 : radius(p, max);
        if (!onScreen || offDisc(s.x, s.y, r + 2)) { node.hidden = true; continue; }
        node.hidden = false;
        const dim = (p.parent || p).dim;
        const on = litSet.has(p.id) || (!!p.parent && litSet.has(p.parent.id));
        node.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`;
        node.style.setProperty('--r', `${r.toFixed(1)}px`);
        node.style.opacity = String(fade * (dim ? 0.55 : 1) * aside);
        node.toggleAttribute('data-dim', dim);
        node.toggleAttribute('data-selected', p.selected);
        node.toggleAttribute('data-on', on);
        node.toggleAttribute('data-plain', !p._solo);
        obstacles.push({ id: p.id, rect: [s.x - r - 2, s.y - r - 2, s.x + r + 2, s.y + r + 2] });
        if (fade > 0.6 && aside === 1 && (labels || on || p.selected)) {
          wanted.push({ p, node, s, r, rank: (p.selected ? 4 : 0) + (litSet.has(p.id) ? 2 : 0) + (chosenSide(p) ? 1 : 0) });
        } else {
          node.toggleAttribute('data-label', false);
          node.toggleAttribute('data-flip', false);
        }
      } else {
        for (const m of g.members) { seen.add(m.id); m.node.hidden = true; }
        const node = clusterNode(used++);
        node._members = g.members;
        node._nation = g.nation;
        const gid = `g${used}`;
        const r = 11 + Math.min(9, Math.sqrt(g.members.length) * 3);
        if (!onScreen || offDisc(s.x, s.y, r)) { node.hidden = true; continue; }
        node.hidden = false;
        /* No flag row under a bubble (owner, 30 Sep: flags everywhere at rest
           read as clutter). A country's flag shows in its name label, and
           only while it is hovered or chosen (primitives.css); hovering a
           mixed bubble outlines the countries it holds. */
        const flags = [];
        const key = flags.join(' ');
        if (node._flags !== key) {
          node._flags = key;
          node.children[1].replaceChildren(...flags.map(flagEl));
        }
        node.toggleAttribute('data-flags', flags.length > 0);
        const nationName = g.nation ? (pages.get(g.nation)?.name || geography.byId.get(g.nation)?.name || '') : '';
        const labelEl = node.children[2];
        if (labelEl._for !== g.nation) {
          labelEl._for = g.nation;
          labelEl.replaceChildren(...(g.nation ? [flagEl(g.nation), document.createTextNode(nationName)] : []));
        }
        if (nationName && labels && fade > 0.6 && aside === 1) {
          wanted.push({ p: { id: gid, name: nationName, flag: g.nation, count: g.count }, node, s, r, rank: 1 });
        } else {
          node.toggleAttribute('data-label', false);
          node.toggleAttribute('data-flip', false);
        }
        /* A group says how much it holds in the page's own unit (degrees on
           the home page), the same number the doors and the count use — not
           how many places it covers (home round 2: "40" against "57 degrees"). */
        /* A bubble whose places a filter has emptied says 0, not how many
           places it covers (round 6: a grey "16" for Denmark beside a gold
           "16" programmes). */
        const emptied = g.members.every((m) => (m.parent || m).dim);
        // Emptied by a filter: a faded bubble with no number, not a grey "0".
        node.firstChild.textContent = emptied ? '' : String(g.count || g.members.length);
        node.toggleAttribute('data-places', placesOnly(g.members));
        node.style.setProperty('--r', `${r.toFixed(1)}px`);
        node.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`;
        node.style.opacity = String(fade * aside);
        node.toggleAttribute('data-dim', g.members.every((m) => (m.parent || m).dim));
        node.toggleAttribute('data-on', g.members.some((m) => litSet.has(m.id) || (!!m.parent && litSet.has(m.parent.id))));
        node.toggleAttribute('data-selected', g.members.some((m) => m.selected));
        /* The flag row under the number is part of the bubble. */
        obstacles.push({ id: gid, rect: [s.x - r - 3, s.y - r - 3, s.x + r + 3, s.y + r + 3 + (flags.length ? 14 : 0)] });
      }
    }
    /* Labels, most wanted first (the selected place, a lit one, the chosen
       country's, then the biggest): to the right of the pin, or flipped to
       its left, or not at all — never across a group, another pin, another
       label, the furniture, the stage's edge or the ring. */
    const hits = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
    wanted.sort((a, b) => b.rank - a.rank || (b.p.count || 0) - (a.p.count || 0) || a.p.name.localeCompare(b.p.name));
    for (const { p, node, s, r } of wanted) {
      const w = p.name.length * 6.6 + 18 + (p.flag && !p.school && p._solo !== false ? 22 : 0);
      const sides = [
        [s.x + r + 2, s.y - 11, s.x + r + 2 + w, s.y + 11],
        [s.x - r - 2 - w, s.y - 11, s.x - r - 2, s.y + 11],
      ];
      let placed = -1;
      for (let i = 0; i < sides.length && placed < 0; i++) {
        const rect = sides[i];
        if (rect[0] < 4 || rect[2] > W - 4 || rect[1] < 2 || rect[3] > H - 2) continue;
        if (disc && (offDisc(rect[0], rect[1]) || offDisc(rect[2], rect[1]) || offDisc(rect[0], rect[3]) || offDisc(rect[2], rect[3]))) continue;
        if (taken.some((t) => hits(rect, t))) continue;
        if (obstacles.some((o) => o.id !== p.id && hits(rect, o.rect))) continue;
        placed = i;
        taken.push(rect);
      }
      node.toggleAttribute('data-label', placed >= 0);
      node.toggleAttribute('data-flip', placed === 1);
    }
    for (let i = used; i < clusterPool.length; i++) { clusterPool[i].hidden = true; clusterPool[i]._members = null; }
    for (const p of allPins) if (!seen.has(p.id)) p.node.hidden = true;

    stage.dataset.zoomed = String(view.alt < rest.alt * 0.95);
    zoomIn.disabled = view.alt <= MIN_ALT * 1.01;
    zoomOut.disabled = view.alt >= Math.min(MAX_ALT, deskAlt) * 0.99;
  }

  /* --- The hovered country's outline ------------------------------------- */

  let outlineIds = [];      // countries named by a hovered bubble, pin or list entry
  let outlineKey = '';
  const ringCache = { geo: null, byId: new Map() };
  function outlineFor(codes) {
    /* On a levels page the chosen country is outlined already: a second,
       coarser outline over it read as a misprint (round 1). */
    const next = [...new Set(codes.filter((c) => c && !(levels && c === lv.country)))];
    if (next.join(' ') === outlineIds.join(' ')) return;
    outlineIds = next;
    camDirty = true;
    kick();
  }
  /** A country's rings as points on the sphere, made once per border set. */
  function ringsOf(id) {
    if (ringCache.geo !== geography) { ringCache.geo = geography; ringCache.byId.clear(); }
    if (!ringCache.byId.has(id)) {
      const c = geography.byId.get(id);
      ringCache.byId.set(id, c ? c.rings.map((flat) => {
        const pts = [];
        for (let i = 0; i < flat.length; i += 2) pts.push(toXYZ(flat[i + 1], flat[i]));
        return pts;
      }) : []);
    }
    return ringCache.byId.get(id);
  }
  function drawOutline() {
    const ids = [...new Set([...outlineIds, hoverCountry?.id].filter(Boolean))];
    if (!ids.length) {
      if (outlineKey) { outlineKey = ''; outlineSvg.style.display = 'none'; }
      return;
    }
    let d = '';
    let whole = true;
    for (const id of ids) {
      for (const ring of ringsOf(id)) {
        let pen = false, sub = '', cut = false;
        for (const q of ring) {
          const s = project(q);
          if (s.facing <= 0.01) { pen = false; cut = true; continue; }
          sub += `${pen ? 'L' : 'M'}${s.x.toFixed(1)} ${s.y.toFixed(1)}`;
          pen = true;
        }
        /* A ring wholly round the back (an overseas territory) is simply not
           drawn; one the limb cuts is drawn open, and unfilled. */
        if (!sub) continue;
        if (cut) whole = false;
        d += `${sub}${cut ? '' : 'Z'}`;
      }
    }
    outlineKey = ids.join(' ');
    outlineSvg.style.display = d ? '' : 'none';
    /* Filled only when every ring faces the camera: a ring cut by the limb
       would fill across the sea. */
    outlineSvg.toggleAttribute('data-part', !whole);
    outlineUnder.setAttribute('d', d);
    outlineOver.setAttribute('d', d);
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
  let drawMs = 0;

  function bindSphere(prog) {
    const ap = prog.a('aPos');
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.enableVertexAttribArray(ap);
    gl.vertexAttribPointer(ap, 3, gl.FLOAT, false, 0, 0);
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
    /* A levels page marks the chosen country in its sharp map, not with the
       coarse mask's blurred glow (round 5). */
    gl.uniform1f(pr.u.uMaskOn, levels && lv.level === 'country' ? 0 : selectedCountry ? 1 : home ? 0.45 : 0);
    const localOn = localRect[2] > localRect[0] && !!(selectedCountry || home) ? 1 : 0;
    gl.uniform1f(pr.u.uPolLOn, localOn);
    gl.uniform4f(pr.u.uPolRect, ...localRect);
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, localTex);
    gl.uniform1i(pr.u.uPolL, 4);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, polTex);
    gl.uniform1i(pr.u.uPol, 3);
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
      /* At a country on a levels page the sharp map draws its own ink: no
         second set of lines beside it. */
      const ownInk = !!localOn;
      if (!ownInk) gl.drawArrays(gl.LINES, 0, geography.lines.length / 3);
      const outline = selectedCountry || home;
      if (hoverCountry && hoverCountry !== outline && !ownInk) {
        gl.uniform4f(pr.u.uColor, 0.16, 0.11, 0.07, 0.9);
        gl.drawArrays(gl.LINES, hoverCountry.start, hoverCountry.count);
      }
      if (outline && !ownInk) {
        /* On a levels page the chosen country's coast is a warm ink stroke,
           drawn from the same borders its colour map is painted from. */
        if (levels && lv.level === 'country') gl.uniform4f(pr.u.uColor, 0.62, 0.3, 0.12, 0.95);
        else gl.uniform4f(pr.u.uColor, 1.0, 0.78, 0.6, selectedCountry ? 1.0 : 0.8);
        gl.drawArrays(gl.LINES, outline.start, outline.count);
      }
      gl.depthMask(true);
    }

    gl.disable(gl.CULL_FACE);
    const ms = performance.now() - t0;
    drawMs = drawMs ? drawMs * 0.9 + ms * 0.1 : ms;
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

    const still = !flight && !spin && !pointers.size;
    if (uploads.length && still) { uploads.shift()(); camDirty = true; }
    if (camDirty) {
      draw(now);
      if (camDirty) { layoutPins(); drawDesk(); drawOutline(); }
      camDirty = false;
      if (first) {
        first = false;
        figure.dataset.globe = 'on';
        if (rest.alt < FINE_ALT) (window.requestIdleCallback || ((fn) => setTimeout(fn, 800)))(() => maybeFine(0), { timeout: 3000 });
      }
    }
    if (moving || flight || spin || camDirty || uploads.length) raf = requestAnimationFrame(frame);
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
    if (focusedAtlas) { delete card.dataset.rail; delete card.dataset.link; }
    delete card.dataset.waiting;
    const close = el('button', { type: 'button', class: 'world__card-close', 'aria-label': 'Close' }, '×');
    close.addEventListener('click', () => { closeCard({ restore: true }); if (!levels) clearChoice(); });
    card.append(close);
    build(card);
    card.hidden = false;
    /* Wide stages reserve room beside or above their card. A phone keeps
       the card outside the stage, below the globe. */
    cardFullHeight = card.offsetHeight;
    cardSheet = card.parentNode === stage && card.getBoundingClientRect().width > W * 0.7;
    cardReturn = from;
    if (focus) card.querySelector('h3')?.focus({ preventScroll: true });
  }

  function closeCard({ restore = false } = {}) {
    if (card.hidden) return;
    card.hidden = true;
    card.replaceChildren();
    if (selectedCountry && !levels) { selectedCountry = null; paintMask(home); }
    if (levels) for (const q of schools) q.selected = false;
    cardSubject = null;
    if (restore && cardReturn?.isConnected) cardReturn.focus({ preventScroll: true });
    cardReturn = null;
    camDirty = true;
    kick();
  }

  /* A card's photograph fades into its reserved box, on the paper's tone,
     rather than popping in (#53 round 2); one already fetched is there at
     once. */
  const fetched = new Set();
  function prefetch(src) {
    if (!src || fetched.has(src)) return;
    fetched.add(src);
    const im = new Image();
    im.decoding = 'async';
    im.src = src;
  }
  function photoIn(img) {
    const done = () => img.setAttribute('data-in', '');
    if (img.complete && img.naturalWidth) done();
    else img.addEventListener('load', done, { once: true });
  }

  function placeCard(p, opts) {
    cardFor = `p:${p.id}`;
    /* On a phone a university's card opens right under the stage, above the
       key, and its row in the key is marked (round 8: the card landed 400 px
       down, under the key, and the tap seemed to do nothing). */
    if (levels && narrowMQ.matches && !focusedAtlas && keyList.isConnected) keyList.before(card);
    if (focusedAtlas && keyList.isConnected) keyList.before(card);
    figure.toggleAttribute('data-card-first', !!(levels && (narrowMQ.matches || focusedAtlas)));
    for (const b of keyList.querySelectorAll('button')) b.toggleAttribute('aria-current', b.dataset.id === p.id);
    cardSubject = { xyz: p.xyz, alt: null };
    openCard((c) => {
      if (p.image) {
        const img = el('img', { class: 'world__card-img', src: p.image, alt: '', decoding: 'async' });
        img.addEventListener('error', () => img.remove());
        photoIn(img);
        c.append(img);
      }
      const title = cardTitle(c, p.name, p.precision === 'region' ? p.flag : '');
      const facts = [];
      if (p.door && p.count && !levels) facts.push(plural(p.count, 'institution'));
      else if (unit && p.count && !p.school && !levels) facts.push(plural(p.count, unit));
      if (p.school && unit && p.n) facts.push(plural(p.n, unit));
      /* What you can study there, when the page knows (round 4). */
      if (p.school && p.fields?.length) facts.unshift(p.fields.slice(0, 3).join(', '));
      if (p.state) facts.push(p.state);
      if (facts.length) c.append(el('p', { class: 'world__card-meta' }, facts.join(' · ')));
      /* "Placed at the country, not at a campus" meant nothing to a student
         on a country's own card (the owner, #53); a city's light still says
         it is the city. */
      if (p.cue && p.precision !== 'region') c.append(el('p', { class: 'world__card-cue' }, p.cue));
      const dest = pages.get(p.country);
      if (!levels && dest && !sameHref(dest.href, p.href) && !sameHref(dest.href, location.pathname)) {
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
  /* A country's card, and a whole country's light, lead with its flag: a
     picture beside the name, outside the link, never part of its words. */
  function cardTitle(c, text, flag = '') {
    const h = el('h3', { class: 'world__card-title', tabindex: '-1' }, text);
    if (flag) h.prepend(flagEl(flag));
    c.append(h);
    return h;
  }
  function cardLink(c, title, href, label, { external = false, select = null } = {}) {
    const a = el('a', { class: 'world__card-link', href }, title.textContent);
    a.append(el('span', { class: 'visually-hidden' }, ` — ${label}`), el('span', { class: 'world__card-arrow', 'aria-hidden': 'true' }, '→'));
    if (external) a.rel = 'noopener nofollow';
    const flag = title.querySelector('.world__flag');
    title.replaceChildren(a);
    if (flag) title.prepend(flag);
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

  let cardFor = '';
  function countryCard(country, opts) {
    cardFor = `c:${country.id}`;
    if (levels && (narrowMQ.matches || focusedAtlas) && keyList.isConnected) keyList.before(card);
    figure.toggleAttribute('data-card-first', focusedAtlas);
    cardSubject = { xyz: norm(country.frame.reduce((s, q) => [s[0] + q[0], s[1] + q[1], s[2] + q[2]], [0, 0, 0])), alt: null };
    const here = places.filter((p) => p.country === country.id);
    const total = here.reduce((n, p) => n + (p.count || 0), 0);
    const dest = pages.get(country.id);
    openCard((c) => {
      /* One place in the country — on a page of countries, the place is the
         country — so its picture and its count are the country's. */
      const only = here.length === 1 ? here[0] : null;
      const photo = focusedAtlas ? '' : only?.image || dest?.image || '';
      if (photo) {
        const img = el('img', { class: 'world__card-img', src: photo, alt: '', decoding: 'async' });
        img.addEventListener('error', () => img.remove());
        photoIn(img);
        c.append(img);
      }
      const title = cardTitle(c, dest?.name || country.name, dest?.flag ? dest.code : '');
      if (levels && here.length) {
        /* Its universities — the pins now on the stage — and, where the page
           counts something more, how many of those there are. */
        const light = here[0];
        const unis = focusedAtlas ? light.atlasCount : light.subs.length ? light.subs.filter((q) => !q.dim).length : light.count;
        const bits = [unis ? `${unis} ${unis === 1 ? 'university' : 'universities'}` : 'Nothing that matches here', unit && light.degrees ? plural(light.degrees, unit) : ''];
        /* A postcard: the country's own one-line hook, then what is here
           (round 1: "Programmes recorded" read like a status report). */
        if (dest?.tagline && !focusedAtlas) c.append(el('p', { class: 'world__card-hook' }, dest.tagline));
        c.append(el('p', { class: 'world__card-meta' }, bits.filter(Boolean).join(' · ')));
        /* On a phone the stage is too small to name every pin: the card names
           the country's universities, most to study first, each a way to its
           own card (round 1: one name among Denmark's fourteen pins). */
        if (light.subs.length) {
          const ranked = [...light.subs].sort((a, b) => Number(a.dim) - Number(b.dim) || (b.n || 0) - (a.n || 0) || a.name.localeCompare(b.name));
          keyOf.clear();
          ranked.forEach((q, i) => keyOf.set(q.id, i + 1));
          /* On a phone the key is a list of its own under the stage, every
             university by its pin's number (round 7: the rail was off screen). */
          if (narrowMQ.matches || focusedAtlas) {
            if (focusedAtlas) keyList.setAttribute('aria-label', `Universities in ${dest?.name || country.name}`);
            keyList.replaceChildren(...ranked.map((q) => {
              const li = el('li');
              const b = el('button', { type: 'button', 'data-id': q.id });
              b.append(el('span', { class: focusedAtlas ? 'world__key-pin' : 'world__key-n', 'aria-hidden': 'true' }, focusedAtlas ? '' : String(keyOf.get(q.id))), document.createTextNode(q.name));
              b.addEventListener('click', () => goToSchool(q, { focus: true }));
              if (focusedAtlas) {
                b.addEventListener('focus', () => setAtlasHover({ key: 's:' + q.id, kind: 'school', members: [q] }));
                b.addEventListener('blur', () => setAtlasHover(null));
              }
              li.append(b);
              return li;
            }));
            keyList.hidden = false;
          }
          const ul = el('ul', { class: 'world__card-list' });
          for (const q of ranked.slice(0, (narrowMQ.matches || focusedAtlas) ? 0 : 3)) {
            const b = el('button', { type: 'button' });
            if (narrowMQ.matches) b.append(el('span', { class: 'world__key-n' }, String(keyOf.get(q.id))));
            b.append(document.createTextNode(q.name));
            b.addEventListener('click', () => goToSchool(q, { focus: true }));
            const li = el('li'); li.append(b); ul.append(li);
          }
          const shown = narrowMQ.matches || focusedAtlas ? ranked.length : 3;
          if (ranked.length > shown) ul.append(el('li', { class: 'world__card-more' }, `+${ranked.length - shown} on the map`));
          if (ul.children.length) c.append(ul);
        }
        if (dest && !sameHref(dest.href, location.pathname)) {
          if (focusedAtlas) c.append(el('a', { class: 'world__atlas-country-link', href: dest.href }, `Open the ${dest.name} guide →`));
          else cardLink(c, title, dest.href, `Open the ${dest.name} page`);
        }
        return;
      }
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
   * id, name, nations? (a view's countries), restored? }. Fired when the reader chooses something on the
   * globe (or through `show()`), when they clear it (close, Escape, the sea,
   * Reset), and on Back/Forward with `restored: true`. A page filters on it;
   * the globe does not know what the page does with it.
   */
  function announceChoice(sel, extra = {}) {
    const name = !sel ? null
      : sel.kind === 'place' ? byId.get(sel.id)?.name
      : sel.kind === 'country' ? (pages.get(sel.id)?.name || geography.byId.get(sel.id)?.name)
      : sel.kind === 'region' ? regions.get(sel.id)?.name
      : null;
    /* A university chosen says which one in the catalogue, so a page can
       narrow to its degrees. */
    if (sel?.kind === 'region' && regions.has(sel.id)) sel = { ...sel, nations: regions.get(sel.id).members.map((m) => m.country).sort() };
    const chosen = sel?.kind === 'place' ? byId.get(sel.id) : null;
    if (chosen?.school) extra = { inst: chosen.inst || '', country: nationOf(chosen), ...extra };
    figure.dispatchEvent(new CustomEvent('world:choose', {
      bubbles: true,
      detail: sel ? { kind: sel.kind, id: sel.id, name: name ?? null, ...(sel.nations ? { nations: sel.nations } : {}), ...extra } : { kind: null, id: null, name: null, ...extra },
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
        { ...(history.state || {}), world: figure.id, sel: currentSel, cam: { lat: view.lat, lon: view.lon, alt: view.alt }, ...(levels ? { lv: { ...lv } } : {}) },
        ''
      );
      history.pushState({ world: figure.id, sel, cam: null }, '', `#${sel.kind}=${encodeURIComponent(sel.id)}`);
    } catch { /* a sandboxed frame without history: choices still work, Back just leaves */ }
    currentSel = sel;
    announceChoice(sel);
  }
  function select(sel) {
    if (sel.kind === 'view') { if (sel.cam) goToView(sel.cam); return !!sel.cam; }
    if (sel.kind === 'region') return levels && regions.has(sel.id) ? (goToRegion(sel.id, { push: false }), true) : false;
    if (sel.kind === 'place') { const p = byId.get(sel.id); if (p) goToPlace(p, { push: false }); return !!p; }
    const c = levels ? countryFor(sel.id) : geography.byId.get(sel.id);
    if (c && levels && !places.some((p) => p.country === c.id)) { showHint(`No universities from ${c.name} on this map yet`); return false; }
    if (c) goToCountry(c, { push: false });
    return !!c;
  }
  /* Which popstate a page's show() ran in: a listener registered before the
     globe's (discover.js) reframes first, and the globe then leaves it be. */
  let popAt = 0, shownAt = -1, popSeq = 0;
  /* When a page last moved the globe (show()). Chrome runs a window's
     popstate listeners in the order they were added, capture or not (round
     2, M2), so the page's reframe is recognised by time: a show() at or after
     this popstate was created is the page answering it. */
  let lastShowAt = -1;
  window.addEventListener('popstate', () => { popAt = ++popSeq; }, { capture: true });
  const linkedSel = () => {
    const m = location.hash.match(/^#(place|country|region)=(.+)$/);
    return m ? { kind: m[1], id: decodeURIComponent(m[2]) } : null;
  };
  const onPop = (e) => {
    const st = e.state;
    if (st?.world && st.world !== figure.id) return;
    restoring = true;
    try {
      if (st?.sel && select(st.sel)) {
        currentSel = st.sel;
        announceChoice(st.sel, { restored: true });
      } else if (levels && !st && linkedSel()) {
        /* A choice typed into the address bar (#region=asia). */
        const sel = linkedSel();
        if (select(sel)) { currentSel = sel; announceChoice(sel, { restored: true }); }
      } else if (levels && (shownAt === popAt || lastShowAt >= e.timeStamp)) {
        /* The page has already moved the globe for this entry (a door's
           frame, discover.js): that is where Back goes (round 1: Nearby →
           Explore → Back left the globe on the world under Europe's cards),
           card and all (round 4: a phone's continent lost its rail). */
        currentSel = null;
      } else {
        currentSel = null;
        announceChoice(null, { restored: true });
        closeCard();
        const cam = st?.cam;
        /* On a levels page, the level the entry was left at. */
        const was = levels ? st?.lv : null;
        if (levels && !was) {
          /* Nothing stamped: the page may still be about to reframe (a door);
             give it this task, then go home only if it did not. */
          const t = e.timeStamp;
          setTimeout(() => { if (lastShowAt < t && !currentSel) goHome(); }, 0);
          return;
        }
        if (was?.level === 'region' && regions.has(was.region)) goToRegion(was.region, { push: false });
        else if (was?.level === 'country' && countryFor(was.country)) goToCountry(countryFor(was.country), { push: false });
        else if (cam && !levels) flyTo(cam);
        else goHome();
      }
    } finally {
      restoring = false;
    }
  };
  window.addEventListener('popstate', onPop);

  /** Choose a place without leaving the country-level globe. */
  function goToPlace(p, { focus = false, from = null, push = true } = {}) {
    if (levels) {
      if (p.school) { goToSchool(p, { focus, from, push }); return; }
      const c = countryFor(p.country);
      if (c) goToCountry(c, { focus, push });
      return;
    }
    if (push) remember({ kind: 'place', id: p.id });
    /* A school keeps its country open; anything else opens only itself. A
       place inside the chosen country keeps the country chosen; any place
       keeps its own country open, so it is a pin, not inside a bubble. */
    const keep = nationChosen && nationOf(p) === nationChosen ? nationChosen : '';
    if (!(p.parent && opened.has(p.parent.id))) openOnly([p]);
    nationChosen = keep;
    nationForced = nationOf(p);
    light(p.id);
    selectedCountry = null;
    paintMask(home);
    placeCard(p, { focus, from });
    /* A whole country's light: opened into its schools, and framed on them
       (Boston to Chicago for the United States, not a bunch at the edge of
       a frame over Kansas), no lower than the globe still reads as a sphere. */
    if (p.subs?.length) {
      const fit = fitCamera([p.xyz, ...p.subs.map((q) => q.xyz)], { maxAlt: 2.4, minAlt: sphereAlt(), pad: [0.1, 0.14, 0.1] });
      flyTo(frameAbove(fit, p.xyz), { announce: p.name });
      return;
    }
    const alt = Math.min(view.alt, Math.max(MIN_ALT * 3, 0.32, sphereAlt()));
    flyTo(frameAbove({ lat: p.lat, lon: p.lon, alt }, p.xyz), { announce: p.name });
  }

  function goToCountry(country, { focus = false, push = true } = {}) {
    if (!holdsSchools(country)) return;
    if (push) remember({ kind: 'country', id: country.id });
    selectedCountry = country;
    paintMask(country);
    paintLocal(country);
    /* Frame the country and its university pins, never a campus or street. */
    const here = places.filter((q) => q.country === country.id);
    openOnly(here);
    nationChosen = country.id;
    const pts = here.flatMap((q) => (q.subs?.length ? q.subs.map((x) => x.xyz) : [q.xyz]));
    if (levels) {
      /* The country's own outline and its universities — those within its
         mainland's reach (and at least 1,000 km) of its middle: a campus on
         an ocean island (the Azores) is still a pin, but does not shrink the
         mainland to fit it. */
      const mid = here[0]?.xyz;
      const reach = mid ? Math.max(1000 / 6371, 1.25 * Math.max(0, ...(country.frame || []).map((f) => angle(f, mid)))) : 0;
      const near = mid ? pts.filter((x) => angle(x, mid) < reach) : pts;
      pts.length = 0;
      pts.push(...(near.length ? near : here.map((q) => q.xyz)));
      setLevel({ level: 'country', region: here[0]?.region || continentOfCode(country.id) || lv.region, country: country.id });
      paintLocal(country);
      light(null);
      /* The country and its universities, framed whole, clear of the card:
         its outline and every pin, never lower than a country reads. */
      countryCard(country, { focus });
      /* The whole country — unless its outline dwarfs where its universities
         are (China's west, Canada's north): then the universities, so they
         are not packed into a corner (round 2: Shanghai's ten on a phone). */
      const span = (list) => {
        const ll = list.map(toLatLon);
        const la = ll.map((q) => q[0]), lo = ll.map((q) => q[1]);
        const mid = ((Math.min(...la) + Math.max(...la)) / 2) * D2R;
        return Math.max(1, (Math.max(...la) - Math.min(...la)) * (Math.max(...lo) - Math.min(...lo)) * Math.cos(mid));
      };
      const outline = country.frame || [];
      const whole = !outline.length || pts.length < 2 || span(outline) < 4 * span(pts);
      const frame = [...pts, ...(whole ? outline : [])];
      const findFit = () => fitCamera(frame, { maxAlt: Math.min(2.4, deskIn() * 0.92), minAlt: focusedAtlas ? ATLAS_COUNTRY_MIN : 0.12, pad: focusedAtlas ? [0.10, 0.15, 0.13] : [0.08, 0.13, 0.04], below: focusedAtlas ? 0 : cardBelow() });
      const { lat, lon, alt } = findFit();
      lvCam = { lat, lon, alt };
      if (focusedAtlas) {
        atlasFit = findFit;
        // The card is outside the map. Do not recenter the solved frame on it.
        flyTo(lvCam, { announce: pages.get(country.id)?.name || country.name });
        return;
      }
      /* The card waits for the camera to land (round 5: it arrived mid-flight). */
      if (!reducedMotion()) {
        card.dataset.waiting = '';
        const show = () => { delete card.dataset.waiting; };
        setTimeout(show, 4000);
        flyTo(frameAbove(lvCam, cardSubject.xyz), { announce: pages.get(country.id)?.name || country.name, onArrive: show });
        return;
      }
      flyTo(frameAbove(lvCam, cardSubject.xyz), { announce: pages.get(country.id)?.name || country.name });
      return;
    }
    const fit = fitCamera(pts.length ? pts : country.frame, { maxAlt: 2.4, minAlt: Math.max(MIN_ALT, home ? rest.alt : sphereAlt()), pad: [0.1, 0.14, 0.1] });
    countryCard(country, { focus });
    flyTo(frameAbove(fit, cardSubject.xyz), { announce: pages.get(country.id)?.name || country.name });
  }


  /* --- Levels: choosing and stepping ---------------------------------------- */

  let lvCam = null;        // the frame of the level the camera is at, for a pinch that lets go between levels
  function setLevel(next) {
    if (next.level !== 'country' || next.country !== lv.country) { keyList.hidden = true; keyOf.clear(); }
    const changed = ['level', 'region', 'country'].some((k) => k in next && next[k] !== lv[k]);
    Object.assign(lv, next);
    if (changed && focusedAtlas) { atlasFit = null; setAtlasHover(null); hoverCountry = null; placeFurniture(); }
    if (changed && !reducedMotion()) lvLeaving = true;
    /* A page may size the stage by level (a phone's grows square below the
       world): measured now, before the level's frame is fitted to it. */
    if (stage.dataset.level !== lv.level) { stage.dataset.level = lv.level; resize(); }
    updateTrail();
  }

  /** A country by its code: its outline when the borders have one, else a
      stand-in framed on its light and its universities (a microstate the
      coarse borders leave out). */
  function countryFor(code) {
    const c = geography.byId.get(code);
    if (c) return c;
    const p = places.find((q) => q.country === code);
    if (!p) return null;
    return { id: code, name: pages.get(code)?.name || p.name, rings: [], start: 0, count: 0, frame: [p.xyz, ...p.subs.map((q) => q.xyz)] };
  }

  /** How far up from the stage's bottom edge the open card reaches: on a
      levels page a wide stage docks it along the bottom (a stage is taller
      than wide, so the room it leaves keeps the country large). */
  function cardBelow() {
    if (card.hidden || card.parentNode !== stage) return 0;
    const r = card.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    return Math.max(0, s.bottom - r.top + 6);
  }

  /**
   * A country's surroundings as a sharp colour map: every country within a
   * window round it, filled in its own pastel from the finer borders, the
   * chosen one a little warmer. The world raster is too coarse at a country's
   * height (round 5: "a tinted photograph"); this one is ~1 km a texel.
   */
  function paintLocal(country) {
    const key = `${country.id}|${geography.ranges.length}`;
    if (localFor === key) return;
    localFor = key;
    const pts = (country.rings || []).flatMap((ring) => { const u = unwrap(ring); const out = []; for (let i = 0; i < u.length; i += 2) out.push([u[i], u[i + 1]]); return out; });
    if (!pts.length) { localRect = [0, 0, 0, 0]; return; }
    const lons = pts.map((q) => q[0]), lats = pts.map((q) => q[1]);
    const cx = (Math.min(...lons) + Math.max(...lons)) / 2, cy = (Math.min(...lats) + Math.max(...lats)) / 2;
    const half = Math.min(60, Math.max(focusedAtlas ? 13 : 6, (Math.max(...lons) - Math.min(...lons)) * 0.9, (Math.max(...lats) - Math.min(...lats)) * 1.3));
    const west = cx - half, east = cx + half;
    const north = Math.min(89, cy + half * 0.75), south = Math.max(-89, cy - half * 0.75);
    const Wc = localCanvas.width, Hc = localCanvas.height;
    localCtx.clearRect(0, 0, Wc, Hc);
    const fill = (rings, colour) => {
      localCtx.fillStyle = colour;
      for (const flat of rings) {
        const ring = unwrap(flat);
        for (const shift of [-360, 0, 360]) {
          localCtx.beginPath();
          for (let i = 0; i < ring.length; i += 2) {
            const x = ((ring[i] + shift - west) / (east - west)) * Wc;
            const y = ((north - ring[i + 1]) / (north - south)) * Hc;
            if (i) localCtx.lineTo(x, y); else localCtx.moveTo(x, y);
          }
          localCtx.closePath();
          localCtx.fill();
        }
      }
    };
    for (const r of geography.ranges) if (r.id !== country.id) fill(r.rings, r.colour || '#f3d98b');
    /* The chosen one a light apricot of its own, against its neighbours'
       pastels (round 6: "a heavy rust"). */
    fill(country.rings, '#f8d2a8');
    gl.deleteTexture(localTex);
    localTex = texture(gl, localCanvas, { mip: false, alpha: true });
    /* As the world raster's uv: x from the antimeridian, y from the pole. */
    localRect = [(west + 180) / 360, (90 - north) / 180, (east + 180) / 360, (90 - south) / 180];
    camDirty = true;
    kick();
  }

  /** A continent, framed on its countries — their middles and mainland
      outlines, not their universities: an island campus an ocean away does
      not push the whole continent back, and two countries' middles alone
      framed North America as a field in Saskatchewan — off the desk. */
  function regionFrame(r) {
    const outlines = r.members.flatMap((p) => [p.xyz, ...(geography.byId.get(p.country)?.frame || [])]);
    const pts = focusedAtlas && r.id === 'europe' ? r.members.map(p => p.xyz) : outlines;
    // Frame European destinations rather than remote extremes of the continent:
    // every destination still fits, and there is real room for on-land counts.
    const fit = fitCamera(pts, { maxAlt: Math.min(3, deskIn() * 0.985), minAlt: 0.3, pad: focusedAtlas && r.id === 'europe' ? [0.065, 0.045, 0.055] : [0.06, 0.14, 0.07] });
    return { lat: fit.lat, lon: fit.lon, alt: fit.alt };
  }

  function goToRegion(id, { push = true } = {}) {
    const r = regions.get(id);
    if (!r) return false;
    if (r.members.length === 1) {
      const c = countryFor(r.members[0].country);
      if (c) goToCountry(c, { push });
      return !!c;
    }
    if (push) remember({ kind: 'region', id, nations: r.members.map((m) => m.country).sort() });
    closeCard();
    openOnly([]);
    selectedCountry = null;
    paintMask(null);
    light(null);
    setLevel({ level: 'region', region: id, country: '' });
    lvCam = regionFrame(r);
    if (focusedAtlas) atlasFit = () => regionFrame(r);
    flyTo(lvCam, { announce: r.name });
    if (narrowMQ.matches || focusedAtlas) regionCard(r);
    return true;
  }

  /** A continent's countries as a rail of chips under a phone's stage: flag,
      name and number, the most universities first; each one its country. */
  function regionCard(r) {
    cardSubject = null;
    openCard((c) => {
      c.dataset.rail = '';
      const lit = focusedAtlas ? r.members : r.members.filter((m) => !m.dim);
      const visibleCount = (m) => focusedAtlas ? m.atlasCount : m.count || 0;
      const total = lit.reduce((n, m) => n + visibleCount(m), 0);
      c.append(el('h3', { class: 'world__card-title', tabindex: '-1' }, r.name));
      c.append(el('p', { class: 'world__card-meta' }, `${lit.length} countries · ${total} universities`));
      const ul = el('ul', { class: 'world__card-list world__card-rail' });
      const first = figure.dataset.here || '';
      for (const m of [...r.members].sort((a, b) => (b.country === first) - (a.country === first) || visibleCount(b) - visibleCount(a) || a.name.localeCompare(b.name))) {
        const b = el('button', { type: 'button' });
        if (!focusedAtlas) b.append(flagEl(m.country));
        b.append(el('span', {}, pages.get(m.country)?.name || m.name), el('span', { class: 'world__rail-n' }, String(visibleCount(m))));
        b.toggleAttribute('data-dim', !!m.dim);
        b.addEventListener('click', () => { const cc = countryFor(m.country); if (cc) goToCountry(cc, { focus: true }); });
        if (focusedAtlas) {
          b.addEventListener('focus', () => setAtlasHover({ key: 'c:' + m.country, nation: m.country, kind: 'country', members: [m], count: visibleCount(m) }));
          b.addEventListener('blur', () => setAtlasHover(null));
        }
        const li = el('li'); li.append(b); ul.append(li);
      }
      c.append(ul);
    });
  }

  /** A university: its country's level, then its card, which is its page. */
  function goToSchool(q, { focus = false, from = null, push = true } = {}) {
    if (push) remember({ kind: 'place', id: q.id });
    const code = q.parent.country;
    if (lv.level !== 'country' || lv.country !== code) {
      const c = countryFor(code);
      if (c) goToCountry(c, { push: false });
    }
    for (const s of schools) s.selected = s === q;
    placeCard(q, { focus, from });
    camDirty = true;
    kick();
  }

  /** The node of a kind nearest a point on the stage (client coordinates),
      or nearest the middle. */
  function nearestGroup(kind, at = null) {
    const sr = stage.getBoundingClientRect();
    const px = at ? at.x - sr.left : W / 2;
    const py = at ? at.y - sr.top : H / 2;
    let best = null, bestD = Infinity;
    /* Mid-flight the stage still shows the level being left: a quick second
       step looks at the level it is stepping from (round 1: "+ + +" was one). */
    const toward = flight ? solveCamera(flight.to, {}) : cam;
    for (const g of lvLeaving ? levelGroups() : groups) {
      if (g.kind !== kind) continue;
      const s = project(g.xyz, toward);
      if (s.facing < 0.1) continue;
      const off = lvOff.get(g.key) || [0, 0];
      const d = Math.hypot(s.x + off[0] - px, s.y + off[1] - py);
      if (d < bestD) { bestD = d; best = g; }
    }
    return best;
  }

  /** Nothing chosen, and Back can return to what was. */
  function pushWorld() {
    if (restoring || !currentSel) return;
    try {
      history.replaceState({ ...(history.state || {}), world: figure.id, sel: currentSel, cam: { lat: view.lat, lon: view.lon, alt: view.alt }, lv: { ...lv } }, '');
      history.pushState({ world: figure.id, sel: null, cam: null, lv: { level: 'world' } }, '', location.pathname + location.search);
    } catch { /* no history: the step still happens */ }
  }
  function toWorldLevel() {
    selectedCountry = null;
    paintMask(null);
    light(null);
    lvCam = null;
    setLevel({ level: 'world', region: '', country: '' });
  }
  function goWorld() {
    if (levels && lv.level !== 'world') pushWorld();
    goHome();
    /* The whole world, asked for: a page clears its distance too (round 1:
       Right here → World left the door pressed and the cards on Denmark). */
    if (levels) announceChoice(null, { reset: true });
  }

  /** One level in (+1), towards a point when there is one, or out (−1).
      Returns whether it went anywhere. */
  function levelStep(dir, at = null) {
    if (dir < 0) {
      if (lv.level === 'country' && (regions.get(lv.region)?.members.length || 0) > 1) return goToRegion(lv.region);
      if (lv.level !== 'world') { goWorld(); return true; }
      return false;
    }
    if (lv.level === 'world') {
      const g = nearestGroup('region', at);
      return g ? goToRegion(g.region.id) : false;
    }
    if (lv.level === 'region') {
      const g = nearestGroup('country', at);
      const c = g && countryFor(g.nation);
      if (c) goToCountry(c);
      return !!c;
    }
    showHint('Choose a university on the map');
    return false;
  }

  function updateTrail() {
    if (!levels) return;
    const steps = [];
    if (lv.level !== 'world') {
      steps.push({ label: 'World', go: goWorld });
      const r = regions.get(lv.region);
      if (r && r.members.length > 1) steps.push({ label: r.name, go: lv.level === 'country' ? () => goToRegion(r.id) : null });
      if (lv.level === 'country') {
        const dest = pages.get(lv.country);
        steps.push({ label: dest?.name || countryFor(lv.country)?.name || '', flag: dest?.flag ? lv.country : '' });
      }
    }
    const ol = el('ol', { class: 'world__trail-list' });
    for (const st of steps) {
      const li = el('li');
      if (st.go) {
        const b = el('button', { type: 'button', class: 'world__trail-btn' });
        /* "World" is a little globe as well as a word; a phone shows the globe. */
        if (st.go === goWorld) {
          const icon = svgEl('svg', { class: 'world__trail-icon', viewBox: '0 0 16 16', 'aria-hidden': 'true' });
          icon.append(svgEl('circle', { cx: 8, cy: 8, r: 6.25 }), svgEl('path', { d: 'M1.75 8h12.5M8 1.75c-2.2 2.1-2.2 10.4 0 12.5M8 1.75c2.2 2.1 2.2 10.4 0 12.5' }));
          b.append(icon);
        }
        b.append(el('span', { class: 'world__trail-word' }, st.label));
        /* The trail redraws itself on the step, so the click must stop here:
           bubbling on, its target is no longer in the trail and the stage took
           it for a click on the coin underneath (round 2: Europe → Norway). */
        b.addEventListener('click', (e) => { e.stopPropagation(); st.go(); });
        li.append(b);
      } else {
        const here = el('span', { class: 'world__trail-here', 'aria-current': 'location' }, st.label);
        if (st.flag) here.prepend(flagEl(st.flag));
        li.append(here);
      }
      ol.append(li);
    }
    trail.replaceChildren(ol);
    trail.hidden = !steps.length;
    stage.toggleAttribute('data-trail', !trail.hidden && trail.parentNode === stage);
    camDirty = true;
    kick();
  }

  /* --- Levels: what is on the stage ----------------------------------------- */

  let lvKeys = new Set();   // the nodes on the stage, by key
  let lvFresh = new Set();  // the ones that have just arrived, which pop in
  /* A level left mid-flight: its nodes fade out over the first third of the
     flight, the next level's pop in from half way (round 1: names arrived
     before their coins, and ghost coins hung about). */
  let lvLeaving = false;
  /** The level's nodes: the continents (the chosen one opened into its
      countries), and the chosen country opened into its universities. */
  function clusterLevels() {
    const out = levelGroups();
    const keys = new Set(out.map((g) => g.key));
    /* A level is laid out from its own places each time it is entered, so
       light, dark and the way back up give the same picture (round 2). */
    if ([...keys].some((k) => !lvKeys.has(k))) lvOff.clear();
    lvFresh = lvKeys.size ? new Set([...keys].filter((k) => !lvKeys.has(k))) : new Set();
    lvKeys = keys;
    lvLeaving = false;
    groups = out;
    clusterAt = view.alt;
    clusterFrom = toXYZ(view.lat, view.lon);
  }
  function levelGroups() {
    const out = [];
    for (const r of regions.values()) {
      const count = r.members.reduce((n, m) => n + (m.count || 0), 0);
      if (lv.level === 'world' || r.id !== lv.region || r.members.length === 1 && lv.level !== 'country') {
        /* At a country, other continents are not on the way anywhere: no
           faded coins at the edges (round 1: "ghost coins"). */
        if (lv.level === 'country' && r.id !== lv.region) continue;
        if (focusedAtlas && lv.level === 'region' && r.id !== lv.region) continue;
        out.push({ kind: 'region', key: `r:${r.id}`, region: r, members: r.members, xyz: r.xyz, count, nation: '', aside: lv.level !== 'world' });
        continue;
      }
      /* At a country, its nearest neighbours only, faded: a way across the
         border, not the whole continent again (round 2: 25 coins and a
         starburst of threads mid-flight). */
      const chosen = lv.level === 'country' ? r.members.find((m) => m.country === lv.country) : null;
      const nearest = chosen ? new Set(r.members.filter((m) => m !== chosen)
        .sort((a, b) => angle(a.xyz, chosen.xyz) - angle(b.xyz, chosen.xyz)).slice(0, 6)) : null;
      for (const p of r.members) {
        if (focusedAtlas && chosen && p !== chosen) continue;
        if (nearest && p !== chosen && !nearest.has(p)) continue;
        if (lv.level === 'country' && p.country === lv.country && p.subs.length) {
          for (const q of p.subs) out.push({ kind: 'school', key: `s:${q.id}`, members: [q], xyz: q.xyz, count: 1, nation: '', aside: false });
        } else {
          out.push({ kind: 'country', key: `c:${p.country}`, members: [p], xyz: p.xyz, count: focusedAtlas && lv.level === 'region' ? p.atlasCount : p.count || 0, nation: p.country, aside: lv.level === 'country' && p.country !== lv.country });
        }
      }
    }
    return out;
  }

  const lvOff = new Map();  // a node's nudge on the stage, kept from frame to frame so it never jumps
  /* A phone's stage is a third of a desktop's: its nodes are a little smaller. */
  const lvScale = () => (Math.min(W, H) < 420 ? 0.86 : 1);
  const lvRadius = (g) => (g.kind === 'region' ? (17 + Math.min(10, Math.sqrt(g.count || 0) * 0.65)) * lvScale()
    : g.kind === 'country' ? (10 + Math.min(6, Math.sqrt(g.count || 0) * 1.1)) * lvScale()
      : narrowMQ.matches ? 9 : 5.5);
  /* A university's number in its country's key: most to study first, as the rail lists them. */
  const keyOf = new Map();
  /** What a node is called on the stage. */
  const lvName = (g) => (g.kind === 'region' ? g.region.name
    : g.kind === 'country' ? (pages.get(g.nation)?.name || geography.byId.get(g.nation)?.name || g.members[0].name)
      : g.members[0].name);
  /** The box a coin and its name take together, round the coin's centre: a
      country's or a continent's name is a pill centred under its coin, and
      the two move as one (round 1: names beside their coins paired with the
      wrong coin). A university's name is placed beside it afterwards, if
      there is room. `compact`: a crowded stage names a country by its flag. */
  /* A coin on a phone's continent, whose name is in the rail: its flag under it. */
  const flagged = (g) => g.kind === 'country' && lv.level === 'region' && narrowMQ.matches;
  function lvBox(g, r, withFlag = false, compact = false) {
    if (g.kind !== 'region') return [-r - 2, -r - 2, r + 2, r + 2 + (withFlag ? 13 : 0)];
    const half = Math.max(r, (lvName(g).length * (compact ? 6.5 : 7.4) + (compact ? 12 : 22)) / 2);
    return [-half, -r, half, r + (compact ? 24 : 30)];
  }
  /* Where a country's name may go round its coin, in order of preference,
     and the same again as its flag alone: a coin stays near its country and
     its name finds the room (round 1b: big name pills pushed Switzerland's
     coin to Hamburg). */
  const LABEL_SPOTS = ['below', 'right', 'left', 'above', 'below-right', 'below-left', 'above-right', 'above-left',
    'far-right', 'far-left', 'far-below', 'far-above'];
  const labelW = new Map();   // a name's drawn width, measured the first time it shows
  function labelRect(pos, x, y, r, w) {
    const h = 22;
    const k = r * 0.8 + 2;
    if (pos === 'below-right') return [x + k, y + k, x + k + w, y + k + h];
    if (pos === 'below-left') return [x - k - w, y + k, x - k, y + k + h];
    if (pos === 'above-right') return [x + k, y - k - h, x + k + w, y - k];
    if (pos === 'above-left') return [x - k - w, y - k - h, x - k, y - k];
    const f = r + 20;
    if (pos === 'far-right') return [x + f, y - h / 2, x + f + w, y + h / 2];
    if (pos === 'far-left') return [x - f - w, y - h / 2, x - f, y + h / 2];
    if (pos === 'far-below') return [x - w / 2, y + f, x + w / 2, y + f + h];
    if (pos === 'far-above') return [x - w / 2, y - f - h, x + w / 2, y - f];
    if (pos === 'below') return [x - w / 2, y + r + 3, x + w / 2, y + r + 3 + h];
    if (pos === 'above') return [x - w / 2, y - r - 3 - h, x + w / 2, y - r - 3];
    if (pos === 'right') return [x + r + 3, y - h / 2, x + r + 3 + w, y + h / 2];
    return [x - r - 3 - w, y - h / 2, x - r - 3, y + h / 2];
  }

  /**
   * Nodes whose boxes would overlap are pushed apart along the shorter
   * overlap, the smaller giving way more (and anything faded aside more
   * still); the furniture on the stage (trail, buttons, card) pushes them
   * out of its way; and each is drawn back towards its own place by a
   * quarter of the way every frame — so the universities of one city open
   * into a little rosette and close again as the camera comes near enough to
   * show them apart.
   */
  function relax(items, disc = null, furniture = [], padding = 14) {
    /* A level just entered settles in its first frame — the pull home and the
       push apart run to rest at once — so nothing moves under a reader's
       finger a moment later, and every visit draws the same picture. */
    const fresh = items.some((it) => it.fresh);
    for (let cycle = 0; cycle < (fresh ? 10 : 1); cycle++) relaxOnce(items, disc, furniture, padding);
    for (const it of items) lvOff.set(it.g.key, [it.x - it.s.x, it.y - it.s.y]);
  }
  function relaxOnce(items, disc, furniture, padding) {
    for (const it of items) { it.x += (it.s.x - it.x) * 0.25; it.y += (it.s.y - it.y) * 0.25; }
    const mass = (it) => it.r * (it.g.aside ? 0.35 : 1);
    const abs = (it) => [it.x + it.box[0], it.y + it.box[1], it.x + it.box[2], it.y + it.box[3]];
    for (let k = 0; k < 40; k++) {
      let any = false;
      for (let i = 0; i < items.length; i++) {
        const a = items[i];
        for (let j = i + 1; j < items.length; j++) {
          const b = items[j];
          const A = abs(a), B = abs(b);
          const gap = a.g.kind === 'school' && b.g.kind === 'school' ? (coarse ? 12 : 7) : 5;
          const ox = Math.min(A[2], B[2]) - Math.max(A[0], B[0]) + gap;
          const oy = Math.min(A[3], B[3]) - Math.max(A[1], B[1]) + gap;
          if (ox <= 0 || oy <= 0) continue;
          any = true;
          let dx = (B[0] + B[2]) / 2 - (A[0] + A[2]) / 2, dy = (B[1] + B[3]) / 2 - (A[1] + A[3]) / 2;
          if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) { const t = (i + 1) * 2.399963 + j * 0.7; dx = Math.cos(t); dy = Math.sin(t); }
          const ma = mass(a), mb = mass(b);
          const wa = mb / (ma + mb), wb = 1 - wa;
          /* Along the shorter overlap, a little of the other way too, so a
             column of names can also fan out. */
          if (ox < oy) { const sx = Math.sign(dx) || 1; a.x -= sx * ox * wa; b.x += sx * ox * wb; const sy = Math.sign(dy); a.y -= sy * ox * 0.15 * wa; b.y += sy * ox * 0.15 * wb; }
          else { const sy = Math.sign(dy) || 1; a.y -= sy * oy * wa; b.y += sy * oy * wb; const sx = Math.sign(dx); a.x -= sx * oy * 0.15 * wa; b.x += sx * oy * 0.15 * wb; }
        }
      }
      for (const it of items) {
        if (disc) {
          const dx = it.x - disc.cx, dy = it.y - disc.cy, d = Math.hypot(dx, dy), room = disc.r - it.r - 4;
          if (d > room && room > 0) { it.x = disc.cx + (dx / d) * room; it.y = disc.cy + (dy / d) * room; }
        }
        for (const f of furniture) {
          const A = abs(it);
          const ox = Math.min(A[2], f[2]) - Math.max(A[0], f[0]);
          const oy = Math.min(A[3], f[3]) - Math.max(A[1], f[1]);
          if (ox <= 0 || oy <= 0) continue;
          any = true;
          const cx = (A[0] + A[2]) / 2, cy = (A[1] + A[3]) / 2;
          if (ox < oy) it.x += cx < (f[0] + f[2]) / 2 ? -ox : ox;
          else it.y += cy < (f[1] + f[3]) / 2 ? -oy : oy;
        }
      }
      if (!any) break;
    }
    for (const it of items) {
      /* On the desk a node stays on the globe, inside its brass ring: a
         continent near the edge is kept on the face (round 1: on a phone Asia
         slid off the edge and the world showed one bubble). */
      if (disc) {
        const dx = it.x - disc.cx, dy = it.y - disc.cy, d = Math.hypot(dx, dy), room = disc.r - it.r - 4;
        if (d > room && room > 0) { it.x = disc.cx + (dx / d) * room; it.y = disc.cy + (dy / d) * room; }
      }
      /* Inside the stage, box and all (round 1: neighbours cut off at the top). */
      it.x = Math.min(W - it.box[2] - padding, Math.max(-it.box[0] + padding, it.x));
      it.y = Math.min(H - it.box[3] - padding, Math.max(-it.box[1] + padding, it.y));
      lvOff.set(it.g.key, [it.x - it.s.x, it.y - it.s.y]);
    }
  }

  // Count only on its own land; if the badge cannot fit, keep an anchored
  // micro-marker and use the same hover readout and named destination list.
  function atlasCountryBadge(g, p, occupied) {
    const hw = String(g.count).length > 1 ? 9.2 : 7, hh = 7.4;
    const offset = [0, -6, 6, -12, 12, -19, 19, -27, 27, -38, 38];
    const candidates = [];
    for (const dx of offset) for (const dy of offset) {
      if (Math.hypot(dx, dy) <= 40) candidates.push([p.x + dx, p.y + dy]);
    }
    // An institution centroid may be offshore or on a thin coast (the UK,
    // Sweden). Add a small grid inside its *projected outline bounds* to
    // find a genuinely interior patch, not a neighbour of the anchor.
    for (let dx = -14; dx <= 14; dx += 2) for (let dy = -17; dy <= 17; dy += 2) {
      if (Math.hypot(dx, dy) <= 19) candidates.push([p.x + dx, p.y + dy]);
    }
    const outline = geography.byId.get(g.nation)?.frame || [];
    const points = outline.map(q => project(q)).filter(q => q.facing > 0.08);
    if (points.length) {
      const xs = points.map(q => q.x), ys = points.map(q => q.y);
      const l = Math.max(hw + 4, Math.min(...xs));
      const r = Math.min(W - hw - 4, Math.max(...xs));
      const t = Math.max(hh + 4, Math.min(...ys));
      const b = Math.min(H - hh - 4, Math.max(...ys));
      if (r - l >= 2 * hw && b - t >= 2 * hh) {
        const nx = Math.min(13, Math.ceil((r - l) / 6));
        const ny = Math.min(13, Math.ceil((b - t) / 6));
        for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) {
          candidates.push([l + (r - l) * i / nx, t + (b - t) * j / ny]);
        }
      }
    }
    candidates.sort((a, b) => (a[0] - p.x) ** 2 + (a[1] - p.y) ** 2 - (b[0] - p.x) ** 2 - (b[1] - p.y) ** 2);
    const owns = (x, y) => {
      const h = pickStage(x, y);
      return h && geography.countryAt(h.lat, h.lon)?.id === g.nation;
    };
    for (const [x, y] of candidates) {
      if (x < hw + 4 || x > W - hw - 4 || y < hh + 4 || y > H - hh - 4) continue;
      if (occupied.some(b => Math.abs(x - b.x) < hw + b.hw + 3 && Math.abs(y - b.y) < hh + b.hh + 3)) continue;
      if (!owns(x, y)) continue;
      const fractions = [-1, -.8, -.6, -.4, -.2, 0, .2, .4, .6, .8, 1];
      if (fractions.every(dx => fractions.every(dy => owns(x + dx * hw, y + dy * hh)))) {
        return { x, y, r: Math.max(hw, hh), hw, hh, micro: false };
      }
    }
    return { x: p.x, y: p.y, r: 4, micro: true };
  }

  let atlasHoverKey = '';
  function setAtlasHover(g) {
    if (!atlasHover || atlasHoverKey === (g?.key || '')) return;
    atlasHoverKey = g?.key || '';
    atlasHover.hidden = !g;
    const count = g?.members[0].atlasCount ?? g?.count ?? 0;
    atlasHover.textContent = !g ? '' : g.kind === 'country'
      ? lvName(g) + ' · ' + count + (count === 1 ? ' university' : ' universities')
      : lvName(g);
    outlineFor(g ? (g.kind === 'country' ? [g.nation] : nationsIn(g.members)) : []);
    // This feedback never changes geometry, text width or hit targets.
    for (const h of lvHit) h.node?.toggleAttribute('data-preview', h.g.key === atlasHoverKey);
  }

  function layoutAtlas() {
    const targetKind = lv.level === 'country' ? 'school' : 'country';
    const items = groups.filter(g => g.kind === targetKind).map(g => ({ g, p: project(g.xyz) }))
      .filter(({p}) => p.facing > 0.02 && p.x >= 5 && p.x <= W - 5 && p.y >= 5 && p.y <= H - 5);
    // Reserve dots first so a neighbour's count cannot hide a tiny country.
    const anchors = items.map(({p}) => ({ x:p.x, y:p.y, hw:4, hh:4 })), badges = [];
    let used = 0; const visible = new Set();
    lvHit = [];
    for (let i = 0; i < items.length; i++) {
      const {g, p} = items[i];
      const badge = g.kind === 'country' ? atlasCountryBadge(g, p, [...anchors.filter((_,j)=>j!==i), ...badges])
        : { x: p.x, y: p.y, r: 7, micro: false };
      if (g.kind === 'country' && !badge.micro) badges.push(badge);
      let node;
      if (g.kind === 'school') {
        const q = g.members[0];
        node = q.node;
        visible.add(q.id);
        node.toggleAttribute('data-num', false);
        if (node.firstChild.textContent) node.firstChild.textContent = '';
        node.toggleAttribute('data-selected', q.selected);
        node.toggleAttribute('data-dim', q.dim);
      } else {
        node = clusterNode(used++);
        node._members = g.members;
        node._nation = g.nation;
        node._region = '';
        node.dataset.kind = 'country';
        const text = badge.micro ? '' : String(g.count);
        if (text !== node.firstChild.textContent) node.firstChild.textContent = text;
        node.toggleAttribute('data-micro', badge.micro);
        node.toggleAttribute('data-flags', false);
        node.toggleAttribute('data-selected', false);
        node.toggleAttribute('data-dim', g.count === 0);
      }
      node.dataset.atlasKey = g.key;
      node.hidden = false;
      node.style.transform = 'translate3d(' + badge.x.toFixed(1) + 'px, ' + badge.y.toFixed(1) + 'px, 0)';
      node.style.setProperty('--r', badge.r + 'px');
      node.style.opacity = '1';
      node.toggleAttribute('data-label', false);
      node.toggleAttribute('data-on', false);
      node.toggleAttribute('data-preview', g.key === atlasHoverKey);
      lvHit.push({g, x: badge.x, y: badge.y, r: badge.r, node, micro: badge.micro});
    }
    for (let i = used; i < clusterPool.length; i++) { clusterPool[i].hidden = true; clusterPool[i]._members = null; }
    for (const p of allPins) if (!visible.has(p.id)) p.node.hidden = true;
    threadSvg.style.display = 'none';
    stage.dataset.zoomed = 'true';
    stage.dataset.level = lv.level;
    zoomIn.disabled = lv.level === 'country';
    zoomOut.disabled = false;
  }

  // A pin is anchored at its tip, but its visible head is nine pixels above it.
  function atlasDistance(h, x, y) {
    const dx = x - h.x, dy = y - h.y;
    return h.g.kind === 'school' ? Math.hypot(dx, dy - Math.max(-9, Math.min(0, dy))) : Math.hypot(dx, dy);
  }

  function nearestAtlasHit(x, y, touch = false) {
    let best = null, distance = Infinity, head = Infinity;
    for (const h of lvHit) {
      const d = atlasDistance(h, x, y);
      const reach = Math.max(9, h.r + 3, touch ? 22 : 0);
      const headDistance = h.g.kind === 'school' ? Math.hypot(x - h.x, y - (h.y - 9)) : d;
      if (d <= reach && (d < distance || (d === distance && headDistance < head))) {
        best = h; distance = d; head = headDistance;
      }
    }
    return best;
  }

  function atlasPointer(e) {
    if (flight || e.target.closest('.world__controls, .world__card, .world__credit, .world__trail')) {
      setAtlasHover(null);
      return;
    }
    const sr = stage.getBoundingClientRect(), x = e.clientX - sr.left, y = e.clientY - sr.top;
    const near = nearestAtlasHit(x, y);
    if (near) { setAtlasHover(near.g); return; }
    if (lv.level === 'region') {
      // Only a tiny-country marker may hold across a blank two-pixel margin;
      // never retain one target while another is the marker under the mouse.
      const held = lvHit.find(({g, micro}) => micro && g.key === atlasHoverKey);
      if (held && atlasDistance(held, x, y) <= 11) return;
      const h = pick(e.clientX, e.clientY), found = h && geography.countryAt(h.lat, h.lon);
      const g = found && groups.find((g) => g.kind === 'country' && g.nation === found.id);
      setAtlasHover(g || null);
    } else setAtlasHover(null);
  }

  function layoutLevels() {
    if (focusedAtlas && lv.level !== 'world') { layoutAtlas(); return; }
    const sr = stage.getBoundingClientRect();
    const compactHome = H < 240 && lv.level === 'world' && figure.closest('.discover__globe');
    figure.toggleAttribute('data-compact-home', Boolean(compactHome));
    /* The furniture inside the stage: nodes keep out of it, labels do too. */
    const furniture = [controls, card, trail, credit].filter((n) => !n.hidden && stage.contains(n) && n.offsetParent).map((n) => {
      const r = n.getBoundingClientRect();
      return [r.left - sr.left - 4, r.top - sr.top - 4, r.right - sr.left + 4, r.bottom - sr.top + 4];
    });
    const taken = furniture.map((f) => f.slice());
    const dk = desk(view.alt);
    const disc = dk > 0.02 ? globeDisc() : null;
    const offDisc = (x, y, pad = 0) => !!disc && Math.hypot(x - disc.cx, y - disc.cy) + pad > disc.r;
    /* The level being left fades over the first third of its flight. */
    const leaving = lvLeaving && flight ? 1 - smooth(0.06, 0.3, flight.move ?? 0) : 1;
    const items = [];
    for (const g of groups) {
      let s = project(g.xyz);
      const r = compactHome && g.kind === 'region' ? 14 : lvRadius(g);
      /* On the desk, a continent round the back waits at the rim on the side
         you would turn the globe to reach it (round 1: North America and
         Oceania were nowhere to be seen). */
      if (disc && g.kind === 'region' && s.facing <= 0.08 && g.members.every((m) => m.dim)) continue;
      if (disc && g.kind === 'region' && s.facing <= 0.08) {
        const dx = dot(g.xyz, cam.right), dy = -dot(g.xyz, cam.up);
        const l = Math.hypot(dx, dy) || 1;
        s = { x: disc.cx + (dx / l) * disc.r * 0.82, y: disc.cy + (dy / l) * disc.r * 0.82, facing: 0.25, behind: true };
      }
      if (!(s.facing > (disc ? 0.08 : 0.02) && s.x > -r && s.x < W + r && s.y > -r && s.y < H + r)) continue;
      /* Laid out from the places themselves every frame — the same camera
         always gives the same picture, however it was reached (round 4: the
         way back up swapped two coins). */
      items.push({ g, s, r, box: lvBox(g, r, flagged(g), compactHome), x: s.x, y: s.y, fresh: true });
    }
    // Home's compact phone globe leaves room around the disc for continent
    // names. Keeping all six labelled coins on its face makes them overlap.
    relax(items, compactHome ? null : disc, furniture, compactHome ? 4 : 14);

    let used = 0;
    const seen = new Set();
    const obstacles = [];
    const wanted = [];
    let threads = '', dots = '';
    let popped = 0;
    lvHit = items.map((it) => ({ g: it.g, x: it.x, y: it.y, r: it.r }));
    for (const it of items) {
      const { g, s, r, x, y } = it;
      const fade = Math.min(1, Math.max(0, (s.facing - 0.02) / 0.2)) * leaving;
      const aside = g.aside ? (g.kind === 'region' ? 0.5 : 0.6) : 1;
      const dim = g.members.every((m) => m.dim);
      const on = g.members.some((m) => litSet.has(m.id) || (!!m.parent && litSet.has(m.parent.id)));
      const dx = x - s.x, dy = y - s.y, d = Math.hypot(dx, dy);
      if (d > 3 && fade > 0.3 && !g.aside) {
        threads += `M${s.x.toFixed(1)} ${s.y.toFixed(1)}L${(x - (dx / d) * r).toFixed(1)} ${(y - (dy / d) * r).toFixed(1)}`;
        dots += `M${(s.x - 2).toFixed(1)} ${s.y.toFixed(1)}a2 2 0 1 0 4 0a2 2 0 1 0-4 0`;
      }
      let node;
      if (g.kind === 'school') {
        const p = g.members[0];
        seen.add(p.id);
        node = p.node;
        node.hidden = false;
        node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        node.style.setProperty('--r', `${r}px`);
        node.style.opacity = String(fade * (p.dim ? 0.7 : 1));
        node.toggleAttribute('data-dim', p.dim);
        node.toggleAttribute('data-selected', p.selected);
        node.toggleAttribute('data-on', on);
        node.toggleAttribute('data-plain', true);
        /* On a phone, where most names cannot fit, a pin carries its number
           in the rail under the stage — a key, nothing grouped (round 6). */
        const num = narrowMQ.matches ? String(keyOf.get(p.id) || '') : '';
        if (node.firstChild.textContent !== num) node.firstChild.textContent = num;
        node.toggleAttribute('data-num', !!num);
        obstacles.push({ id: p.id, rect: [x - r - 2, y - r - 2, x + r + 2, y + r + 2] });
        /* The chosen, the lit, then the ones with the most to study first. */
        if (fade > 0.6) wanted.push({ id: p.id, name: p.name, node, x, y, r, rank: (p.selected ? 8 : 0) + (on ? 4 : 0) + (p.dim ? 0 : 1), n: p.n || 0 });
        else { node.toggleAttribute('data-label', false); node.toggleAttribute('data-flip', false); }
      } else {
        node = clusterNode(used++);
        node._members = g.members;
        node._nation = g.kind === 'country' ? g.nation : '';
        node._region = g.kind === 'region' ? g.region.id : '';
        node.dataset.kind = g.kind;
        node.hidden = false;
        node.firstChild.textContent = dim ? '' : String(g.count);
        node.style.setProperty('--r', `${r.toFixed(1)}px`);
        node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        node.style.opacity = String(fade * aside);
        node.toggleAttribute('data-dim', dim);
        node.toggleAttribute('data-on', on);
        node.toggleAttribute('data-selected', g.kind === 'country' && g.nation === lv.country);
        node.toggleAttribute('data-places', false);
        if (!flagged(g)) node.toggleAttribute('data-flags', false);
        node.toggleAttribute('data-flip', false);
        node.toggleAttribute('data-behind', !!s.behind);
        const labelEl = node.children[2];
        const name = lvName(g);
        const labelKey = `${g.key}|${name}`;
        if (labelEl._for !== labelKey) {
          labelEl._for = labelKey;
          labelEl.replaceChildren(...(g.kind === 'country' ? [flagEl(g.nation), el('span', { class: 'world__cluster-code' }, g.nation.toUpperCase())] : []), el('span', { class: 'world__cluster-name' }, name));
        }
        const A = [x + it.box[0], y + it.box[1], x + it.box[2], y + it.box[3]];
        obstacles.push({ id: g.key, rect: A });
        if (g.kind === 'region') {
          /* A continent's name is part of its coin: under it, always. */
          node.toggleAttribute('data-label', fade > 0.4);
          if (fade > 0.4) taken.push(A);
        } else if (fade > 0.4 && narrowMQ.matches && lv.level === 'region') {
          /* On a phone a continent's countries are named in the rail under the
             stage, not crammed between the coins (round 3: 11 names on coins);
             each coin carries its flag (round 4). */
          node.toggleAttribute('data-label', false);
          if (node._flags !== g.nation) { node._flags = g.nation; node.children[1].replaceChildren(flagEl(g.nation)); }
          node.toggleAttribute('data-flags', true);
        } else if (fade > 0.4) {
          wanted.push({ id: g.key, name, node, x, y, r, country: true, rank: (g.nation === lv.country ? 8 : 0) + (on ? 4 : 0) + (g.aside ? 0 : 2), n: g.count });
        } else {
          node.toggleAttribute('data-label', false);
        }
      }
      if (lvFresh.has(g.key)) {
        lvFresh.delete(g.key);
        if (!reducedMotion() && node.firstChild?.animate) {
          /* The coin pops; the whole node, label and all, fades in with it, so
             no name arrives before its coin (round 1). */
          const timing = { duration: 380, delay: Math.min(260, popped++ * 14), easing: 'cubic-bezier(.2,.9,.3,1)', fill: 'backwards' };
          node.firstChild.animate([{ transform: 'scale(.15)' }, { transform: 'scale(1.12)', offset: 0.7 }, { transform: 'scale(1)' }], timing);
          node.animate([{ opacity: 0 }, { opacity: node.style.opacity || 1 }], timing);
        }
      }
    }
    /* Universities' names, most wanted first, beside their dot or flipped to
       its other side, or not at all — never across a node, another name, the
       furniture or the edge. */
    const hits = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
    wanted.sort((a, b) => b.rank - a.rank || b.n - a.n || a.name.localeCompare(b.name));
    const fits = (rect, id) => !(rect[0] < 3 || rect[2] > W - 3 || rect[1] < 2 || rect[3] > H - 2)
      && !(disc && (offDisc(rect[0], rect[1]) || offDisc(rect[2], rect[1]) || offDisc(rect[0], rect[3]) || offDisc(rect[2], rect[3])))
      && !taken.some((t) => hits(rect, t))
      && !obstacles.some((o) => o.id !== id && hits(rect, o.rect));
    /* Countries first: every coin is a country to choose, and is named. */
    for (const w of wanted.filter((v) => v.country)) {
      let spot = null;
      for (const short of [false, true]) {
        /* Its real width once it has been drawn; an estimate until then
           (round 2b: a long name ran past the stage's edge). */
        const width = labelW.get(`${w.name}|${short}`) || (short ? 50 : w.name.length * 6.6 + 44);
        for (const pos of LABEL_SPOTS) {
          const rect = labelRect(pos, w.x, w.y, w.r, width);
          if (fits(rect, w.id)) { spot = { pos, short, rect }; break; }
        }
        if (spot) break;
      }
      /* Nowhere free: its flag and code under it, if that covers no other
         coin or dot; else none (it is named on hover, in its card and in the
         list). */
      if (!spot) {
        const rect = labelRect('below', w.x, w.y, w.r, 50);
        if (!obstacles.some((o) => o.id !== w.id && hits(rect, o.rect))) spot = { pos: 'below', short: true, rect };
      }
      if (!spot) { w.node.toggleAttribute('data-label', false); continue; }
      taken.push(spot.rect);
      /* A name on the far ring has a short leader back to its coin. */
      if (spot.pos.startsWith('far-')) {
        const [x0, y0, x1, y1] = spot.rect;
        const tx = Math.max(x0, Math.min(x1, w.x)), ty = Math.max(y0, Math.min(y1, w.y));
        const dx = tx - w.x, dy = ty - w.y, d = Math.hypot(dx, dy) || 1;
        threads += `M${(w.x + (dx / d) * w.r).toFixed(1)} ${(w.y + (dy / d) * w.r).toFixed(1)}L${tx.toFixed(1)} ${ty.toFixed(1)}`;
      }
      w.node.toggleAttribute('data-label', true);
      w.node.dataset.pos = spot.pos;
      w.node.toggleAttribute('data-short', spot.short);
      const wk = `${w.name}|${spot.short}`;
      if (!labelW.has(wk)) { const lw = w.node.children[2].offsetWidth; if (lw) labelW.set(wk, lw + 2); }
    }
    for (const w of wanted.filter((v) => !v.country)) {
      const width = w.name.length * 6.6 + 18;
      const sides = [
        [w.x + w.r + 3, w.y - 11, w.x + w.r + 3 + width, w.y + 11],
        [w.x - w.r - 3 - width, w.y - 11, w.x - w.r - 3, w.y + 11],
      ];
      let placed = -1;
      for (let i = 0; i < sides.length && placed < 0; i++) {
        const rect = sides[i];
        if (rect[0] < 4 || rect[2] > W - 4 || rect[1] < 2 || rect[3] > H - 2) continue;
        if (disc && (offDisc(rect[0], rect[1]) || offDisc(rect[2], rect[1]) || offDisc(rect[0], rect[3]) || offDisc(rect[2], rect[3]))) continue;
        if (taken.some((t) => hits(rect, t))) continue;
        if (obstacles.some((o) => o.id !== w.id && hits(rect, o.rect))) continue;
        placed = i;
        taken.push(rect);
      }
      /* The chosen university is named if any side is clear of other dots. */
      if (placed < 0 && w.rank >= 8) {
        const side = w.x + w.r + 3 + width > W - 4 ? 1 : 0;
        if (!obstacles.some((o) => o.id !== w.id && hits(sides[side], o.rect))) placed = side;
      }
      w.node.toggleAttribute('data-label', placed >= 0);
      w.node.toggleAttribute('data-flip', placed === 1);
    }
    for (let i = used; i < clusterPool.length; i++) { clusterPool[i].hidden = true; clusterPool[i]._members = null; }
    for (const p of allPins) if (!seen.has(p.id)) p.node.hidden = true;
    threadPath.setAttribute('d', threads);
    threadDots.setAttribute('d', dots);
    threadSvg.style.display = threads ? '' : 'none';
    threadSvg.style.opacity = String(leaving);

    stage.dataset.zoomed = String(lv.level !== 'world');
    stage.dataset.level = lv.level;
    zoomIn.disabled = lv.level === 'country';
    zoomOut.disabled = lv.level === 'world';
  }

  /**
   * A group dives until it splits. Only a group whose whole *diameter* still
   * fits inside one pin at the closest zoom is "too close to separate" and
   * opens a list instead — judging by the closest pair called twelve Danish
   * cities one spot because two of them are 3 km apart.
   */
  function openGroup(members) {
    let maxAng = 0;
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const a = angle(members[i].xyz, members[j].xyz);
        maxAng = Math.max(maxAng, a);
      }
    }
    const centre = norm(members.reduce((s, m) => [s[0] + m.xyz[0], s[1] + m.xyz[1], s[2] + m.xyz[2]], [0, 0, 0]));
    const [lat, lon] = toLatLon(centre);
    const altToSplit = (ang) => (ang / (PIN_GAP * 1.25)) * H / (2 * TAN);
    /* Dense groups remain at country level and offer their named list. */
    const floor = home ? rest.alt : Math.max(MIN_ALT, sphereAlt());
    const announce = `${members.length} places`;
    const pts = members.map((m) => m.xyz);
    const fitAll = (maxAlt) => fitCamera(pts, { maxAlt, minAlt: floor, pad: [0.1, 0.16, 0.12] });
    if (altToSplit(maxAng) < floor) {
      crowdCard(members, { xyz: centre });
      flyTo(frameAbove({ lat, lon, alt: Math.max(floor, Math.min(view.alt, 0.25)) }, centre), { announce });
      return;
    }
    /* A dive into a group is a choice, and Back undoes it (the owner's rule;
       round 3 found group dives pushed nothing, so Back left the page). */
    const fit = fitAll(Math.max(view.alt * 0.8, floor * 1.01));
    /* The countries the dive will show — the group's and any other on the
       stage when it lands — travel with the choice, so a page can narrow to
       what the globe shows (the home page's cards, #62). */
    const landed = solveCamera(fit, {});
    const inView = places.filter((p) => { const q = project(p.xyz, landed); return q.facing > 0.1 && q.x > 0 && q.x < W && q.y > 0 && q.y < H; });
    remember({ kind: 'view', id: members.map((m) => m.id).sort().join(','), cam: { lat: fit.lat, lon: fit.lon, alt: fit.alt }, nations: nationsIn([...members, ...inView]).sort() });
    flyTo({ lat: fit.lat, lon: fit.lon, alt: Math.max(floor, fit.alt) }, { announce });
  }

  /** Restore a frame recorded in browser history. */
  function goToView(cam) { flyTo(cam); }

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
  }

  stage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.world__controls, .world__card, .world__credit, .world__trail')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    touch();
    /* A mouse takes hold at once. A finger takes hold on a tap or a sideways
       drag, so a thumb swiping up the page still scrolls it (touch-action is
       pan-y until then). */
    if (e.pointerType === 'mouse') engage();
    downOn = e.target.closest('.world__pin, .world__cluster');
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    /* On a levels page a press does not stop a flight — only a drag does: a
       second click that is then let go (a double click) stranded the camera
       between two levels (round 2, B1). */
    if (!levels) { flight = null; }
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
    if (!pointers.has(e.pointerId)) {
      // Hovering: which country is under the pointer.
      if (e.pointerType === 'mouse' && focusedAtlas && lv.level !== 'world') { atlasPointer(e); return; }
      if (e.pointerType === 'mouse' && !e.target.closest('.world__pin, .world__cluster, .world__controls, .world__card, .world__trail')) {
        const hit = pick(e.clientX, e.clientY);
        const found = hit ? geography.countryAt(hit.lat, hit.lon) : null;
        const c = holdsSchools(found) ? found : null;
        if (c !== hoverCountry) { hoverCountry = c; stage.style.cursor = c ? 'pointer' : ''; camDirty = true; kick(); }
      }
      return;
    }
    const prev = pointers.get(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      const gap = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const a1 = Math.min(deskAlt, Math.max(home ? rest.alt : MIN_ALT, clampAlt(pinch.alt * (pinch.gap / gap))));
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
      if (levels && flight) { flight = null; clusterAt = -1; lvInterrupted = true; }
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

  /* A drag that stopped a level's flight half way: on letting go, the camera
     finishes the journey to the level's frame (round 4: a swipe mid-flight
     left 28 coins piled on the desk). */
  let lvInterrupted = false;
  const endPointer = (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (levels && lvInterrupted && !pointers.size) {
      lvInterrupted = false;
      setTimeout(() => flyTo(lvCam && lv.level !== 'world' ? lvCam : { ...rest }, { onArrive: () => { delete card.dataset.waiting; } }), 0);
    }
    try { stage.releasePointerCapture(e.pointerId); } catch {}
    if (pinch && pointers.size < 2) {
      /* On a levels page a pinch that let go far enough in or out is a step;
         one that did not settles back on the level's own frame. */
      if (levels) {
        const k = pinch.alt / view.alt;
        const at = { x: pinch.mx, y: pinch.my };
        pinch = null;
        if (!(k > 1.3 && levelStep(1, at)) && !(k < 0.77 && levelStep(-1))) flyTo(lvCam && lv.level !== 'world' ? lvCam : { ...rest });
        if (pointers.size === 1) {
          const [p] = [...pointers.values()];
          drag = { x: p.x, y: p.y, t: performance.now(), vLat: 0, vLon: 0 };
        }
        return;
      }
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
      if (focusedAtlas) setAtlasHover(null);
      if (hoverCountry) { hoverCountry = null; camDirty = true; kick(); }
    }
    if (!pointers.size) light(null);
  });
  const onOutside = (e) => { if (!stage.contains(e.target)) disengage(); };
  document.addEventListener('pointerdown', onOutside);

  /** A university pin is a direct doorway to its page; previews and the
      named list still use goToPlace without navigation. */
  function followPin(p) {
    if (p.href && (p.school || p.precision !== 'region')) { location.assign(p.href); return; }
    goToPlace(p);
  }

  /* One click: a pin opens its page, a group dives, a country flies, the sea
     closes whatever was open. A double click zooms in on the spot. */
  let clickTimer = 0;
  let lastTap = null;
  stage.addEventListener('click', (e) => {
    if (moved) return;
    if (e.target.closest('.world__controls, .world__card, .world__credit, .world__trail')) return;
    if (levels && levelsClick(e)) return;
    const atlas = focusedAtlas && lv.level !== 'world';
    const pinEl = !atlas && (e.target.closest('.world__pin') || (downOn?.classList.contains('world__pin') ? downOn : null));
    const clusterEl = !atlas && (e.target.closest('.world__cluster') || (downOn?.classList.contains('world__cluster') ? downOn : null));
    downOn = null;
    if (pinEl) { const p = byId.get(pinEl.dataset.place); if (p) followPin(p); return; }
    /* One country's bubble chooses the country, as a click on its land does
       (the outline and its card); a mixed one dives. */
    /* A continent's bubble opens it into its countries. */
    if (clusterEl?._region) { goToRegion(clusterEl._region); return; }
    if (clusterEl?._nation && countryFor(clusterEl._nation)) { goToCountry(countryFor(clusterEl._nation)); return; }
    if (clusterEl?._members) { openGroup(clusterEl._members); return; }
    const at = { x: e.clientX, y: e.clientY };
    const now = performance.now();
    if (lastTap && now - lastTap.t < 330 && Math.hypot(at.x - lastTap.x, at.y - lastTap.y) < 30) {
      clearTimeout(clickTimer);
      lastTap = null;
      if (levels) { levelStep(1, at); return; }
      const hit = pick(at.x, at.y);
      const land = hit ? geography.countryAt(hit.lat, hit.lon) : null;
      if (land && !holdsSchools(land)) { showHint(`No universities in ${pages.get(land.id)?.name || land.name} on this map yet`); return; }
      if (hit) flyTo({ lat: hit.lat, lon: hit.lon, alt: view.alt <= (home ? rest.alt : MIN_ALT) * 1.05 ? deskAlt : Math.max(home ? rest.alt : MIN_ALT, view.alt * 0.4) });
      return;
    }
    lastTap = { ...at, t: now };
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => {
      const hit = pick(at.x, at.y);
      const country = hit ? geography.countryAt(hit.lat, hit.lon) : null;
      if (country && !holdsSchools(country)) {
        showHint(`No universities in ${pages.get(country.id)?.name || country.name} on this map yet`);
        return;
      }
      if (country) goToCountry(country);
      /* The sea closes the card; on a levels page the level and its choice stay. */
      else { closeCard(); if (!levels) clearChoice(); }
    }, 250);
  });

  /* On a levels page a click is resolved against what is drawn, not against
     the invisible fingertip-sized targets, which overlap where nodes are
     close: the nearest node's centre within reach wins (round 1: 46% of
     university pins opened a neighbour). A second click of a double click,
     and a click in the first moments of a level's flight, land on what is
     leaving, and are let go (round 1: a double click on Denmark opened
     Czechia). */
  let lvHit = [];
  let lvChoseAt = 0;      // when a click last changed the level
  let lvChoseKey = '';    // and what the last click chose
  function levelsClick(e) {
    if (!e.target.isConnected) return true;
    const node = e.target.closest('.world__pin, .world__cluster') || downOn;
    /* For a moment after a level change, presses land on what is leaving or
       on what has just appeared: they are let go (round 4: a double tap on a
       country opened one of its universities). */
    if (flight || performance.now() - lvChoseAt < 700) { downOn = null; return true; }
    /* A press on a name is a press on its own node, wherever the nearest
       centre is (round 2, M1: a country's name opened its neighbour). */
    /* By where the names are drawn, not by which element is on top: a
       neighbour's fingertip-sized target can lie over a name (round 2b). */
    /* Names are never drawn over another node's dot, so a press on a name is
       its owner's (round 4: a name read over a neighbour's dot). */
    const label = [...pinLayer.querySelectorAll('.world__pin[data-label]:not([hidden]) .world__pin-label, .world__cluster[data-label]:not([hidden]) .world__pin-label')]
      .map((l) => ({ l, r: l.getBoundingClientRect() }))
      .filter(({ r }) => e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom)
      .sort((a, b) => Math.hypot(a.r.left + a.r.width / 2 - e.clientX, a.r.top + a.r.height / 2 - e.clientY) - Math.hypot(b.r.left + b.r.width / 2 - e.clientX, b.r.top + b.r.height / 2 - e.clientY))[0]?.l;
    const owner = label?.closest('.world__pin, .world__cluster');
    if (owner) {
      const key = owner.classList.contains('world__pin') ? `s:${owner.dataset.place}`
        : owner._region ? `r:${owner._region}` : owner._nation ? `c:${owner._nation}` : '';
      const hit = lvHit.find((h) => h.g.key === key);
      if (hit) {
        downOn = null;
        if (e.detail > 1 && key === lvChoseKey) return true;
        lvChoseKey = key;
        if (hit.g.kind !== 'school') lvChoseAt = performance.now();
        if (hit.g.kind === 'school') followPin(hit.g.members[0]);
        else if (hit.g.kind === 'region') goToRegion(hit.g.region.id);
        else { const c = countryFor(hit.g.nation); if (c) goToCountry(c); }
        return true;
      }
    }
    const sr = stage.getBoundingClientRect();
    const x = e.clientX - sr.left, y = e.clientY - sr.top;
    const atlas = focusedAtlas && lv.level !== 'world';
    let best = atlas ? nearestAtlasHit(x, y, coarse) : null, bestD = Infinity;
    if (!atlas) for (const h of lvHit) {
      const d = Math.hypot(h.x - x, h.y - y);
      const reach = Math.max(h.r + 5, coarse ? 22 : 14);
      if (d <= reach && d < bestD) { bestD = d; best = h; }
    }
    downOn = null;
    if (!best) return !!node && !atlas; // on this atlas, ordinary land remains selectable
    const g = best.g;
    /* The second click of a double click on the same node is the same choice
       — but two quick taps on two neighbouring universities are two choices
       (round 2: Hong Kong's pins read as a double tap). */
    if (e.detail > 1 && g.key === lvChoseKey) return true;
    lvChoseKey = g.key;
    if (g.kind !== 'school') lvChoseAt = performance.now();
    if (g.kind === 'school') followPin(g.members[0]);
    else if (g.kind === 'region') goToRegion(g.region.id);
    else { const c = countryFor(g.nation); if (c) goToCountry(c); }
    return true;
  }

  /* The wheel zooms only once the reader has taken hold of the globe — by
     clicking or dragging it — or with Ctrl/⌘ held, which is also what a
     trackpad pinch sends. A wheel passing over the map on its way down the
     page scrolls the page, and a short hint says how to take hold. */
  stage.addEventListener('wheel', (e) => {
    if (!engaged && !e.ctrlKey && !e.metaKey) { showHint(); return; }
    e.preventDefault();
    touch();
    if (levels) { wheelStep(e); return; }
    flight = null; spin = null;
    const factor = Math.exp(Math.max(-0.6, Math.min(0.6, e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0018))));
    const alt = Math.min(deskAlt, Math.max(home ? rest.alt : MIN_ALT, clampAlt(view.alt * factor)));
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

  /* On a levels page the wheel steps a level: a turn of the wheel (or a
     trackpad's swipe) adds up until it is worth one step, and one step is all
     a single gesture gets: its momentum tail is ignored until the wheel has
     been still for a moment. */
  const wheelAcc = { v: 0, last: 0, lockedAt: 0 };
  function wheelStep(e) {
    const now = performance.now();
    const gap = now - wheelAcc.last;
    wheelAcc.last = now;
    if (wheelAcc.lockedAt) {
      /* At least most of a flight's length, whatever the gaps: a busy main
         thread delivers a swipe's events in bursts (round 1: one swipe, two
         steps). */
      const held = now - wheelAcc.lockedAt;
      if (held < 900 || (gap < 240 && held < 1600)) return;
      wheelAcc.lockedAt = 0;
      wheelAcc.v = 0;
    }
    if (gap > 300) wheelAcc.v = 0;
    wheelAcc.v += e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 400 : 1);
    if (Math.abs(wheelAcc.v) < 70) return;
    const dir = wheelAcc.v < 0 ? 1 : -1;
    wheelAcc.v = 0;
    wheelAcc.lockedAt = now;
    if (!levelStep(dir, { x: e.clientX, y: e.clientY })) showHint(dir > 0 ? 'Choose a university, or step back out with −' : 'This is the whole world');
  }

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
    const keys = {
      ArrowLeft: () => flyTo({ ...view, lon: view.lon - step / Math.max(0.3, Math.cos(view.lat * D2R)) }),
      ArrowRight: () => flyTo({ ...view, lon: view.lon + step / Math.max(0.3, Math.cos(view.lat * D2R)) }),
      ArrowUp: () => flyTo({ ...view, lat: view.lat + step * (1 - desk(view.alt)) }),
      ArrowDown: () => flyTo({ ...view, lat: view.lat - step * (1 - desk(view.alt)) }),
      '+': () => zoomBy(0.55),
      '=': () => zoomBy(0.55),
      '-': () => zoomBy(1 / 0.55),
      _: () => zoomBy(1 / 0.55),
      0: () => (levels ? goWorld() : goHome()),
      Escape: () => {
        if (levels && !card.hidden && cardFor.startsWith('p:') && lv.level === 'country') { const c = countryFor(lv.country); if (c) goToCountry(c); stage.focus({ preventScroll: true }); return; }
        if (levels) { if (card.hidden) levelStep(-1); else { closeCard({ restore: true }); if (!figure.contains(document.activeElement) || document.activeElement === document.body) stage.focus({ preventScroll: true }); } return; }
        if (card.hidden) goHome(); else { closeCard({ restore: true }); clearChoice(); }
      },
    };
    const act = keys[e.key];
    if (!act) return;
    e.preventDefault();
    act();
  });

  function zoomBy(f) {
    if (levels) { levelStep(f < 1 ? 1 : -1); return; }
    const alt = Math.min(deskAlt, Math.max(home ? rest.alt : MIN_ALT, clampAlt(view.alt * f)));
    flyTo({ ...view, lat: liftLat(view.lat, view.alt, alt), alt });
  }
  function goHome() {
    closeCard();
    clearChoice();
    openOnly([]);
    if (levels) toWorldLevel();
    flyTo({ ...rest }, { announce: 'the whole view' });
  }

  zoomIn.addEventListener('click', () => zoomBy(0.5));
  zoomOut.addEventListener('click', () => zoomBy(2));
  zoomReset.addEventListener('click', goWorld);

  /* --- The list, which is the other half of every one of these ------------- */

  for (const [id, a] of links) {
    const nation = () => [byId.get(id) ? nationOf(byId.get(id)) : ''];
    a.addEventListener('pointerenter', () => { light(id); outlineFor(nation()); });
    a.addEventListener('pointerleave', () => { light(null); outlineFor([]); });
    a.addEventListener('focus', () => { light(id); outlineFor(nation()); });
    a.addEventListener('blur', () => { light(null); outlineFor([]); });
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
    if (reducedMotion()) { idle = false; if (flight) Object.assign(view, flight.to); stopMotion(); }
    camDirty = true;
    kick();
  };
  const motionObserver = new MutationObserver(() => { readTheme(); onMotion(); });
  motionObserver.observe(root, { attributes: true, attributeFilter: ['data-motion', 'data-theme'] });
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
    atlasHover?.remove();
    if (focusedAtlas) { delete figure.dataset.atlasLevel; keyList.remove(); trail.remove(); }
    legendHint?.remove();
    delete figure.dataset.globe;
  }

  /* --- Go ------------------------------------------------------------------ */

  resize();
  rest = restCamera();
  Object.assign(view, rest);
  paintMask(home);
  if (home) paintLocal(home);
  if (levels) {
    figure.dataset.levels = '';
    for (const p of places) {
      const badge = links.get(p.id)?.querySelector('.world__count');
      if (badge) badge.textContent = String(p.count);
    }
    updateTrail();
  }

  const controller = {
    figure,
    /** Re-weight the pins from a filtered set: size means how much is here,
        never how good it is. The list badges follow. */
    setCounts(counts, { selected = '', fields = null } = {}) {
      /* On a levels page the numbers are universities. A university is lit
         when its country is lit as a whole (a distance or a country chosen,
         no question asked about degrees), or when any of its degrees matches
         (counted by its catalogue id); a country's number is its lit
         universities. */
      if (levels) {
        for (const p of places) {
          const whole = (counts.get(p.id) || 0) > 0;
          let lit = 0, degrees = 0;
          for (const q of p.subs) {
            q.n = counts.get(q.inst) || 0;
            q.fields = fields?.get(q.inst) || q.fields || [];
            q.dim = !(whole || q.n > 0);
            if (!q.dim) lit++;
            degrees += q.n;
          }
          p.count = p.subs.length ? lit : whole ? 1 : 0;
          p.degrees = counts.has(`deg:${p.id}`) ? counts.get(`deg:${p.id}`) : degrees;
          p.dim = p.count === 0;
          const a = links.get(p.id);
          const badge = a?.querySelector('.world__count');
          if (badge) badge.textContent = String(p.count);
          a?.toggleAttribute('data-dim', p.dim);
        }
        void selected;
        /* A country's card opened before the page counted (a link that opens
           on it) is redrawn with the numbers. */
        if (!card.hidden && cardFor === `c:${lv.country}`) countryCard(countryFor(lv.country));
        else if (!card.hidden && cardFor.startsWith('p:') && byId.get(cardFor.slice(2))?.school) placeCard(byId.get(cardFor.slice(2)));
        clusterAt = -1;
        camDirty = true;
        kick();
        return;
      }
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
      shownAt = popAt;
      lastShowAt = performance.now();
      setTimeout(() => { if (shownAt === popAt) shownAt = -1; }, 0);
      if (spec.place) { const p = byId.get(spec.place); if (!p) return false; goToPlace(p, { push }); if (!push) currentSel = { kind: 'place', id: p.id }; return true; }
      if (spec.country) { const c = levels ? countryFor(spec.country) : geography.byId.get(spec.country); if (!c || !holdsSchools(c)) return false; goToCountry(c, { push }); if (!push) currentSel = { kind: 'country', id: c.id }; return true; }
      if (spec.region) {
        if (!levels || !regions.has(spec.region)) return false;
        const shown = goToRegion(spec.region, { push });
        if (shown && !push) currentSel = lv.level === 'country'
          ? { kind: 'country', id: lv.country } : { kind: 'region', id: spec.region };
        return shown;
      }
      /* A camera further out than the desk stops at the desk. */
      let cam = spec.camera && Number.isFinite(spec.camera.lat) ? { ...spec.camera, alt: Math.min(deskAlt, spec.camera.alt) } : null;
      if (spec.bounds) {
        const { north, south, west, east } = spec.bounds;
        if (![north, south, west, east].every(Number.isFinite)) return false;
        cam = fitCamera([toXYZ(north, west), toXYZ(north, east), toXYZ(south, west), toXYZ(south, east), toXYZ((north + south) / 2, (west + east) / 2)],
          { maxAlt: REST_MAX_ALT * 1.6, minAlt: MIN_ALT });
      }
      if (!cam) return false;
      closeCard();
      clearChoice();
      if (levels) { openOnly([]); toWorldLevel(); }
      const target = { lat: cam.lat, lon: cam.lon, alt: cam.alt };
      flyTo(target, { announce: spec.label || '' });
      return true;
    },
    destroy,
    /* For the QA scripts and the console: the camera, and the few actions a
       screenshot needs to be taken mid-way through. Not used by the page. */
    debug: {
      view, get rest() { return rest; }, places, groups: () => groups, flyTo, goToPlace, goToCountry, openGroup,
      levels, lv, goToRegion, levelStep, regions, fitCamera, cardBelow, toXYZ, hits: () => lvHit.map((h) => ({ key: h.g.key, x: Math.round(h.x), y: Math.round(h.y), r: h.r, micro: h.micro })),
      country: (id) => geography.byId.get(id),
      camPitch: () => cam.pitch * R2D,
      mineAt: (lat, lon) => { solveCamera(view); return project(toXYZ(lat, lon)); },
      pickAt: (clientX, clientY) => { const h = pick(clientX, clientY); return h ? { lat: h.lat, lon: h.lon, country: geography.countryAt(h.lat, h.lon)?.id || null } : null; }, get drawMs() { return drawMs; }, pause: () => { paused = true; }, resume: () => { paused = false; kick(); },
      /** Put a paused flight at an exact fraction of the way, and draw it. */
      stepTo: (frac) => {
        if (!flight) return false;
        const now = flight.t0 + flight.dur * frac;
        stepFlight(now);
        draw(now);
        layoutPins();
        drawDesk();
        drawOutline();
        return true;
      },
    },
  };
  kick();
  /* A link to a choice — #place=… or #country=… — opens on it. */
  const linked = location.hash.match(/^#(place|country|region)=(.+)$/);
  if (linked) {
    const sel = { kind: linked[1], id: decodeURIComponent(linked[2]) };
    restoring = true;
    try { if (select(sel)) { currentSel = sel; announceChoice(sel, { restored: true, initial: true }); } } finally { restoring = false; }
  }
  return controller;
}

/* --- Small helpers --------------------------------------------------------- */

/**
 * A name the records wrote with an emoji flag in front ("🇬🇧 United Kingdom")
 * as `{ name, flag }`: the name without it, and the flag's two letters, lower
 * case. Windows has no flag emoji and draws the letters ("GB United Kingdom";
 * the owner, #53: "we need country flags not 2 letter place holders"), so the
 * globe draws its own flag (img/flags, scripts/make-flags.mjs) instead.
 * Read from the characters; no country is named.
 */
function splitFlag(text) {
  const s = String(text ?? '');
  const m = s.match(/^(\p{RI})(\p{RI})\s*/u);
  if (!m) return { name: s, flag: '' };
  const letter = (c) => String.fromCharCode(c.codePointAt(0) - 0x1f1e6 + 97);
  return { name: s.slice(m[0].length), flag: letter(m[1]) + letter(m[2]) };
}

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
