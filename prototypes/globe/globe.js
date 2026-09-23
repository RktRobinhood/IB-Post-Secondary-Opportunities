/*
 * A hand-rolled orthographic globe on a 2D canvas. No dependency, no WebGL.
 *
 * This is the engine issue #19 said to try first, and the reason to try it
 * first is that it is the only candidate that keeps the site's fallback story:
 * if it is not available the page still has the build-time flat SVG sitting in
 * the DOM underneath it, and nothing has to be downloaded to get there.
 *
 * Three things make it cheap enough to hand-roll.
 *
 * 1. A vertex's position on the unit sphere never changes. `build.mjs` pays the
 *    sin/cos once and ships x,y,z. A camera move is then a 3x3 matrix multiply
 *    per vertex — 9 multiplies, 6 adds, no trigonometry, no allocation.
 * 2. The rotation matrix is nine numbers, computed once per frame.
 * 3. Visibility is the sign of one of the three products.
 *
 * One thing makes it expensive, and it is not compute: **clipping a filled
 * polygon to the limb.** A ring that leaves the visible hemisphere and comes
 * back has to be closed along the edge of the disc or the fill bleeds across
 * the planet. `clipRing` below is the honest, simplified version of what
 * d3-geo does properly, and its failure modes are recorded in NOTES.md — they
 * are the single strongest argument in the prototype for reaching for a
 * library, and the single clearest statement of what "hand-rolled" costs.
 */

const TAU = Math.PI * 2;
const D2R = Math.PI / 180;

export function createGlobe(canvas, lonLatRings, opts = {}) {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return null;

  /* lon,lat pairs in, unit-sphere x,y,z out, once. This is the only place the
     geometry is transformed; after it, a camera move touches no trigonometry.
     Timed, because "pay it at load rather than in the payload" is only the
     right trade if the load cost is invisible. */
  const tConvert0 = performance.now();
  const rings = lonLatRings.map((ll) => {
    const n = ll.length / 2;
    const xyz = new Float64Array(n * 3);
    for (let i = 0, j = 0; i < ll.length; i += 2, j += 3) {
      const lo = ll[i] * D2R, la = ll[i + 1] * D2R, cl = Math.cos(la);
      xyz[j] = cl * Math.cos(lo);
      xyz[j + 1] = Math.sin(la);
      xyz[j + 2] = cl * Math.sin(lo);
    }
    return xyz;
  });
  const convertMs = performance.now() - tConvert0;
  const vertexCount = rings.reduce((n, r) => n + r.length / 3, 0);

  const style = {
    sea: opts.sea || '#dce6ee',
    land: opts.land || '#f6f1e7',
    coast: opts.coast || '#5d6b76',
    dot: opts.dot || '#1f4f6d',
    dotDim: opts.dotDim || 'rgba(31,79,109,.28)',
    active: opts.active || '#b8471f',
  };

  /* Where the camera is, and where it is going. Separate for the same reason
     map.js keeps them separate: two quick presses mean two steps, not
     whatever the animation had reached when the second one landed. */
  const view = { lat: 30, lon: 10, k: 1 };
  const goal = { lat: 30, lon: 10, k: 1 };

  let places = [];        // [{ id, lat, lon, r, active, dim }]
  let sphere = [];        // cached unit-sphere coords for the current places
  let w = 0, h = 0, dpr = 1, R = 1, cx = 0, cy = 0;
  let raf = 0;
  let lastFrameMs = 0;
  let onDraw = null;

  /* --- projection ------------------------------------------------------- */

  const m = new Float64Array(9);

  function buildMatrix(lat, lon) {
    // Ry(lon - 90deg) then Rx(lat). Composed by hand; nine numbers a frame.
    const a = (lon - 90) * D2R, b = lat * D2R;
    const ca = Math.cos(a), sa = Math.sin(a);
    const cb = Math.cos(b), sb = Math.sin(b);
    // Ry: [ca 0 sa; 0 1 0; -sa 0 ca]   Rx: [1 0 0; 0 cb -sb; 0 sb cb]
    m[0] = ca;        m[1] = 0;   m[2] = sa;
    m[3] = sb * sa;   m[4] = cb;  m[5] = -sb * ca;
    m[6] = -cb * sa;  m[7] = sb;  m[8] = cb * ca;
  }

  const px = (x, y, z) => m[0] * x + m[1] * y + m[2] * z;
  const py = (x, y, z) => m[3] * x + m[4] * y + m[5] * z;
  const pz = (x, y, z) => m[6] * x + m[7] * y + m[8] * z;

  function toSphere(lat, lon) {
    const la = lat * D2R, lo = lon * D2R, cl = Math.cos(la);
    return [cl * Math.cos(lo), Math.sin(la), cl * Math.sin(lo)];
  }

  /** Screen position of a lat/lon, plus whether it faces the viewer. */
  function project(lat, lon) {
    const [x, y, z] = toSphere(lat, lon);
    const zz = pz(x, y, z);
    return { x: cx + px(x, y, z) * R, y: cy - py(x, y, z) * R, front: zz > 0, z: zz };
  }

  /* --- limb clipping ----------------------------------------------------
     Walk a ring. Keep front-facing points. Where it crosses the limb, put a
     point on the limb (linear interpolation in sphere space, renormalised —
     good to well under a pixel at this vertex density) and, on the way back in,
     walk the limb arc from the exit point to the entry point so the polygon
     closes on the edge of the disc rather than across it.

     What it gets wrong: it always takes the shorter arc. For a ring that wraps
     more than half the visible disc — Eurasia at a low zoom, Antarctica at any
     zoom — the shorter arc is the wrong one and the fill goes inside out. The
     prototype draws such rings as outline only (see `wrapped`), which is
     visibly a compromise and is exactly the compromise a library removes. */

  const LIMB_STEPS = 48;

  function clipRing(flat, out) {
    const n = flat.length / 3;
    out.length = 0;
    let anyFront = false, anyBack = false;
    // First pass: is this ring wholly on one side?
    for (let i = 0; i < n; i++) {
      const j = i * 3;
      if (pz(flat[j], flat[j + 1], flat[j + 2]) > 0) anyFront = true; else anyBack = true;
      if (anyFront && anyBack) break;
    }
    if (!anyFront) return 'hidden';
    if (!anyBack) {
      for (let i = 0; i < n; i++) {
        const j = i * 3, x = flat[j], y = flat[j + 1], z = flat[j + 2];
        out.push(cx + px(x, y, z) * R, cy - py(x, y, z) * R);
      }
      return 'whole';
    }

    let exitAngle = null, entryAngle = null, crossings = 0;
    for (let i = 0; i < n; i++) {
      const j = i * 3, k = ((i + 1) % n) * 3;
      const z0 = pz(flat[j], flat[j + 1], flat[j + 2]);
      const z1 = pz(flat[k], flat[k + 1], flat[k + 2]);
      if (z0 > 0) out.push(cx + px(flat[j], flat[j + 1], flat[j + 2]) * R, cy - py(flat[j], flat[j + 1], flat[j + 2]) * R);
      if ((z0 > 0) !== (z1 > 0)) {
        crossings++;
        const t = z0 / (z0 - z1);
        let lx = flat[j] + (flat[k] - flat[j]) * t;
        let ly = flat[j + 1] + (flat[k + 1] - flat[j + 1]) * t;
        let lz = flat[j + 2] + (flat[k + 2] - flat[j + 2]) * t;
        const len = Math.hypot(lx, ly, lz) || 1;
        lx /= len; ly /= len; lz /= len;
        const sx = px(lx, ly, lz), sy = py(lx, ly, lz);
        const ang = Math.atan2(-sy, sx);
        out.push(cx + sx * R, cy - sy * R);
        if (z0 > 0) exitAngle = ang; else entryAngle = ang;
        // Walk the limb from the exit to the entry, once we know both.
        if (z0 <= 0 && exitAngle !== null) {
          let d = entryAngle - exitAngle;
          while (d > Math.PI) d -= TAU;
          while (d < -Math.PI) d += TAU;
          // Insert the arc *before* the entry point we just pushed.
          const entry = out.splice(out.length - 2, 2);
          for (let s = 1; s < LIMB_STEPS; s++) {
            const a = exitAngle + (d * s) / LIMB_STEPS;
            out.push(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
          }
          out.push(entry[0], entry[1]);
          exitAngle = null;
        }
      }
    }
    return crossings > 2 ? 'wrapped' : 'clipped';
  }

  /* --- drawing ---------------------------------------------------------- */

  const scratch = [];

  function draw() {
    const t0 = performance.now();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    buildMatrix(view.lat, view.lon);

    // Sea: the disc itself. Also the clip, so a zoomed-in globe does not paint
    // outside its own edge.
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.fillStyle = style.sea;
    ctx.fill();
    ctx.clip();

    ctx.lineJoin = 'round';
    ctx.fillStyle = style.land;
    ctx.strokeStyle = style.coast;
    ctx.lineWidth = 1;

    for (const ring of rings) {
      const kind = clipRing(ring, scratch);
      if (kind === 'hidden' || scratch.length < 6) continue;
      ctx.beginPath();
      ctx.moveTo(scratch[0], scratch[1]);
      for (let i = 2; i < scratch.length; i += 2) ctx.lineTo(scratch[i], scratch[i + 1]);
      ctx.closePath();
      if (kind !== 'wrapped') ctx.fill();
      ctx.stroke();
    }

    // Graticule: two lines, enough to say "this is a sphere and it turned".
    ctx.strokeStyle = 'rgba(93,107,118,.35)';
    for (let lat = -60; lat <= 60; lat += 30) strokeParallel(lat);
    for (let lon = -180; lon < 180; lon += 30) strokeMeridian(lon);

    // Markers. Back-facing ones are not drawn: a dot on the far side of a
    // sphere is not "off the edge of the frame", it is behind the planet, and
    // drawing it would put Tokyo in the Atlantic.
    let behind = 0;
    for (let i = 0; i < places.length; i++) {
      const p = places[i], s = sphere[i];
      const z = pz(s[0], s[1], s[2]);
      if (z <= 0) { behind++; continue; }
      const x = cx + px(s[0], s[1], s[2]) * R;
      const y = cy - py(s[0], s[1], s[2]) * R;
      p.sx = x; p.sy = y; p.visible = true;
      const r = p.r * (0.6 + 0.4 * view.k);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fillStyle = p.active ? style.active : p.dim ? style.dotDim : style.dot;
      ctx.fill();
      if (p.active) {
        ctx.beginPath();
        ctx.arc(x, y, r + 5, 0, TAU);
        ctx.strokeStyle = style.active;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.lineWidth = 1;
      }
    }
    for (let i = 0; i < places.length; i++) if (!places[i].visible) places[i].sx = places[i].sy = NaN;

    ctx.restore();
    lastFrameMs = performance.now() - t0;
    if (onDraw) onDraw({ behind, ms: lastFrameMs });
  }

  function strokeParallel(lat) {
    ctx.beginPath();
    let started = false;
    for (let lon = -180; lon <= 180; lon += 6) {
      const p = project(lat, lon);
      if (!p.front) { started = false; continue; }
      if (started) ctx.lineTo(p.x, p.y); else { ctx.moveTo(p.x, p.y); started = true; }
    }
    ctx.stroke();
  }
  function strokeMeridian(lon) {
    ctx.beginPath();
    let started = false;
    for (let lat = -84; lat <= 84; lat += 6) {
      const p = project(lat, lon);
      if (!p.front) { started = false; continue; }
      if (started) ctx.lineTo(p.x, p.y); else { ctx.moveTo(p.x, p.y); started = true; }
    }
    ctx.stroke();
  }

  /* --- camera ----------------------------------------------------------- */

  const shortest = (from, to) => {
    let d = to - from;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    return d;
  };
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function settle() {
    view.lat = goal.lat; view.lon = goal.lon; view.k = goal.k;
    layout();
    draw();
  }

  /**
   * Move the camera. `instant` is the reduced-motion path and it is the same
   * destination, not a faster journey: the reader arrives, having seen nothing
   * in between.
   */
  function flyTo({ lat = goal.lat, lon = goal.lon, k = goal.k, instant = false, ms = 620 } = {}) {
    goal.lat = Math.max(-80, Math.min(80, lat));
    goal.lon = ((lon + 180) % 360 + 360) % 360 - 180;
    goal.k = Math.max(0.7, Math.min(4, k));
    cancelAnimationFrame(raf);
    if (instant) return settle();
    const from = { ...view };
    const dLon = shortest(from.lon, goal.lon);
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      const e = easeInOut(t);
      view.lat = from.lat + (goal.lat - from.lat) * e;
      view.lon = from.lon + dLon * e;
      view.k = from.k + (goal.k - from.k) * e;
      layout();
      draw();
      if (t < 1) raf = requestAnimationFrame(tick);
      else settle();
    };
    raf = requestAnimationFrame(tick);
  }

  function nudge(dLat, dLon, dK, instant) {
    flyTo({ lat: goal.lat + dLat, lon: goal.lon + dLon, k: goal.k * (dK || 1), instant, ms: 260 });
  }

  /* --- hit testing (pointer only; the list is the control surface) ------- */

  function hitTest(x, y, slop = 22) {
    let best = null, bestD = slop * slop;
    for (const p of places) {
      if (!Number.isFinite(p.sx)) continue;
      const d = (p.sx - x) ** 2 + (p.sy - y) ** 2;
      if (d < bestD) { bestD = d; best = p; }
    }
    return best;
  }

  /* --- sizing ------------------------------------------------------------ */

  function layout() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const nw = Math.round(rect.width), nh = Math.round(rect.height);
    if (nw !== w || nh !== h || canvas.width !== Math.round(nw * dpr)) {
      w = nw; h = nh;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    R = (Math.min(w, h) / 2) * 0.94 * view.k;
    cx = w / 2; cy = h / 2;
  }

  function setPlaces(next) {
    places = next.map((p) => ({ ...p, sx: NaN, sy: NaN, visible: false }));
    sphere = places.map((p) => toSphere(p.lat, p.lon));
  }

  /** How many of the given lat/lons are on the near side right now. */
  function visibleCount(list) {
    buildMatrix(view.lat, view.lon);
    let n = 0;
    for (const p of list) {
      const s = toSphere(p.lat, p.lon);
      if (pz(s[0], s[1], s[2]) > 0) n++;
    }
    return n;
  }

  layout();

  return {
    view, goal, draw, flyTo, nudge, hitTest, setPlaces, layout, project, visibleCount, settle,
    convertMs, vertexCount,
    get lastFrameMs() { return lastFrameMs; },
    set onDraw(fn) { onDraw = fn; },
  };
}
