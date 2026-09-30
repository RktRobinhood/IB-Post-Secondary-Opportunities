/**
 * A designed backdrop for a programme with no photograph (#67).
 *
 * The owner: "I hate the look of the empty cards, so a fallback that is still
 * unique would be cool and a good placeholder." A card with no photograph was
 * a bare text box among full-bleed photograph cards. It now gets a drawn
 * pattern in the photograph's place, so every card has the same shape. A
 * photograph, when there is one, always wins; this is only what a card draws
 * when `backdrop` is null.
 *
 * An earlier fallback, a field monogram, was reverted because every business
 * card showed the same "BU". So a design says two things:
 *
 *   - **The field, at a glance** (round 2). Its entry in `FIELD_TONES`
 *     (canonical.mjs, a vocabulary table) gives a hue, a saturation and a
 *     family of three motifs, so a reader learns "blue grid" as engineering the
 *     way they learn a map's key. A field's colour comes in three tones: its
 *     own, a lighter and a deeper, a few degrees either side.
 *   - **The programme, by its details.** Its seed is its page's address
 *     (stable: the slug or the programme id); a hash of it sets the motif's
 *     angle, scale, weight, origin and the accent (every n-th line, a disc or
 *     a band) with its hue.
 *
 * No two alike side by side (round 2, fix 2; round 3). Two designs look
 * alike (`alike`) when their motifs read the same at card size (`LOOKS`:
 * rings, arcs and contour are all concentric curves) and their field hues
 * are within ten degrees, whatever the lighter or deeper tone. Every page
 * that shows designed cards shows one school's, so a school's designs are
 * dealt together, in the order its page lists them:
 *
 *   1. A card takes the first of its field's nine pairs (motif, tone) that
 *      no earlier card of the school has taken and that looks like none of
 *      its neighbours: the LOOK_BACK cards before it in the school and in
 *      its field (a run uses every look before it repeats one, so no grid
 *      width sets two alike beside or near each other) and, for the
 *      school's last cards, its first ones (a programme page's siblings
 *      wrap round). The pairs take the
 *      field's three motifs in turn, tone by tone, starting at a tone the
 *      school and field hash to, so the same field at two schools mostly
 *      starts apart.
 *   2. Past those, any other motif, least used first, in the field's tones:
 *      the colour still says the field.
 *   3. The accent differs from its neighbours' where it can.
 *   4. The whole parameter tuple (`key`) is unique site-wide: a seed whose
 *      tuple is taken is drawn again with the next salt.
 *
 * The cards that draw their design are dealt first, then the pages that
 * draw one only in their hero; a programme with a photograph still gets a
 * design (its page must resolve one) from what is left.
 * `scripts/test-unique-images.mjs` reads the built pages back.
 *
 * It is inline SVG, drawn at build time, with no network and no ids. Its
 * colours are CSS custom properties (`--dh`, `--ds`, `--dl`, `--da`) that
 * site.css turns into a light, a dark and a hero palette, so one drawing
 * serves both themes. It is decorative (`aria-hidden`), carries no text and
 * no credit, and is marked `data-backdrop="designed"` with its tuple in
 * `data-design`: `motif/tone/accent/…`, the tone `<field hue>.<0|1|2>`.
 *
 * Nothing here names a programme, a field value or a country.
 * `scripts/test-programme-images.mjs` reads this file back to keep it that way.
 */
import { html, raw } from './html.mjs';

/** The motifs, each an abstract, editorial pattern: no letters, no icons. */
export const MOTIFS = ['contour', 'arcs', 'rays', 'hatch', 'dots', 'weave', 'waves', 'tiles', 'grid', 'steps', 'rings', 'chevrons'];

/**
 * How the second colour enters: as every n-th line of the motif, as a disc
 * behind it, or as a band behind it.
 */
export const ACCENTS = ['lines', 'disc', 'band'];

/**
 * A field's three tones: its own colour, a lighter one and a deeper one, a
 * few degrees either side, so they stay the field's (`dl` is the change of
 * lightness in points, which site.css applies per theme).
 */
export const TONES = [
  { shift: 0, dl: 0 },
  { shift: -7, dl: 6 },
  { shift: 7, dl: -6 },
];

/**
 * The motifs as a reader tells them apart at card size: concentric curves
 * (rings, arcs, contour) read as one, so do ruled lines (hatch, weave) and
 * zigzags (steps, chevrons).
 */
export const LOOKS = {
  contour: 'curves', arcs: 'curves', rings: 'curves',
  hatch: 'lines', weave: 'lines',
  steps: 'zigzag', chevrons: 'zigzag',
  rays: 'rays', dots: 'dots', waves: 'waves', tiles: 'tiles', grid: 'grid',
};

/**
 * How far back a card looks for a look-alike: one less than the number of
 * looks, so a run of cards uses every look before it repeats one. A school
 * page's grid is two across beside its dates panel, so a card four on sits
 * two rows down, still in view (round 4).
 */
export const LOOK_BACK = new Set(Object.values(LOOKS)).size - 1;

/** How close two field hues may be and still read as one colour. */
export const HUE_NEAR = 10;

/**
 * Whether two designs look alike: motifs of one look, in field hues within
 * HUE_NEAR degrees (a design's `tone` is `<field hue>.<tone>`).
 */
export function alike(a, b) {
  if (!a || !b || (LOOKS[a.motif] || a.motif) !== (LOOKS[b.motif] || b.motif)) return false;
  const d = Math.abs(parseInt(a.tone, 10) - parseInt(b.tone, 10)) % 360;
  return Math.min(d, 360 - d) <= HUE_NEAR;
}

/** How far the accent's hue sits from the field's: a near neighbour, or across the wheel. */
const ACCENT_TURNS = [150, 35, -35, 190, 60, -70];

/**
 * The frames a design is drawn in. A card's is the photograph's own 16:10,
 * so the design sits where a photograph would; a programme page's hero is
 * wider. The motif, its parameters and its colours are the same in both;
 * only the extent of the drawing differs, so the pattern keeps its scale.
 */
export const FRAMES = { card: { w: 400, h: 250 }, hero: { w: 800, h: 280 } };

/** 32-bit FNV-1a: a stable number from a string. */
export function hash(s) {
  let h = 0x811c9dc5;
  for (const ch of String(s)) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: a small seeded generator, [0, 1). */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A copy of `list` in a seeded order. */
function shuffled(list, r) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** An integer in [lo, hi]. */
const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));

const turn = (h) => ((Math.round(h) % 360) + 360) % 360;

/** How many motifs a field's family has. */
export const FAMILY = 3;

/** A field's tone record, with a family of FAMILY known motifs. */
function toneOf(tones, field) {
  const t = tones[field] || tones.other || { hue: 40, sat: 8 };
  const family = [...new Set((t.motifs || []).filter((m) => MOTIFS.includes(m)))].slice(0, FAMILY);
  while (family.length < FAMILY) family.push(MOTIFS.find((m) => !family.includes(m)));
  return { hue: turn(t.hue), sat: Math.max(0, Math.min(70, Math.round(t.sat))), family };
}

/**
 * The continuous parameters of one design. `salt` is 0 unless the tuple it
 * would give is already taken by another programme.
 */
function draw(entry, motif, v, accent, salt, tone) {
  const r = rng(hash(`${entry.seed}#${salt}`));
  const d = {
    motif,
    tone: `${tone.hue}.${v}`,
    accent,
    rot: int(r, 0, 35) * 5,
    gap: int(r, 10, 20),
    every: int(r, 3, 6),
    weight: int(r, 12, 22) / 10,
    ox: int(r, 5, 95) / 100,
    oy: int(r, 5, 95) / 100,
    hue: turn(tone.hue + TONES[v].shift),
    sat: tone.sat,
    dl: TONES[v].dl,
    accentHue: turn(tone.hue + ACCENT_TURNS[int(r, 0, ACCENT_TURNS.length - 1)]),
  };
  d.key = [d.motif, d.tone, d.accent, d.rot, d.gap, d.every, d.weight, d.ox, d.oy, d.accentHue].join('/');
  return d;
}

/**
 * Build a resolver for every programme the site shows.
 *
 * `entries` is `[{ seed, field, group, order, shown }]`: `seed` the programme
 * page's address, `field` its `field.primary` vocabulary value, `group` the
 * school whose page shows its card with its siblings, `order` its place in
 * that page's card order, and `shown` what draws the design: 'card' (a card
 * with no photograph, and its page), 'page' (only its own page's hero: a
 * path inside a family's card) or false (it has a photograph). `tones` is the field → `{ hue, sat, motifs }` table.
 * The whole catalogue is needed because uniqueness is a property of the
 * whole catalogue.
 *
 * Returns `(seed) => design | null`; a design also carries its `field`.
 */
export function designResolver(entries, tones = {}) {
  const groups = new Map();
  const seen = new Set();
  for (const e of entries || []) {
    if (!e?.seed || seen.has(e.seed)) continue;
    seen.add(e.seed);
    const g = String(e.group ?? '');
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(e);
  }
  const out = new Map();
  const taken = new Set();
  const byOrder = (a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || String(a.seed).localeCompare(String(b.seed));
  for (const g of [...groups.keys()].sort()) {
    const members = groups.get(g);
    const pairs = new Set();
    const uses = new Map();
    const deal = (e, near) => {
      const field = e.field || '';
      const tone = toneOf(tones, e.field);
      const r = rng(hash(`motif:${e.seed}`));
      const fam = tone.family;
      const others = shuffled(MOTIFS.filter((m) => !fam.includes(m)), r).sort((x, y) => (uses.get(x) || 0) - (uses.get(y) || 0));
      /* The field's nine pairs, its motifs in turn, tone by tone, starting
         where this school's hash says: two schools' first cards of one field
         (side by side on a page of the field elsewhere) mostly differ. */
      const own = [];
      for (let v = 0; v < TONES.length; v++) for (const m of fam) own.push([m, v]);
      const start = fam.length * (hash(`${g}|${field}`) % TONES.length);
      const ranked = [...own.slice(start), ...own.slice(0, start)];
      for (const m of others) for (let v = 0; v < TONES.length; v++) ranked.push([m, v]);
      const free = ([m, v]) => !pairs.has(`${m}|${tone.hue}.${v}`);
      const unlike = ([m, v]) => !near.some((x) => alike(x, { motif: m, tone: `${tone.hue}.${v}` }));
      const pick = ranked.find((c) => free(c) && unlike(c)) || ranked.find(free) || ranked[0];
      const [motif, v] = pick;
      const accents = shuffled(ACCENTS, r);
      const accent = accents.find((x) => !near.some((y) => y.accent === x)) || accents[0];
      let salt = 0;
      let d = draw(e, motif, v, accent, salt, tone);
      while (taken.has(d.key)) d = draw(e, motif, v, accent, ++salt, tone);
      taken.add(d.key);
      pairs.add(`${motif}|${d.tone}`);
      uses.set(motif, (uses.get(motif) || 0) + 1);
      out.set(e.seed, { ...d, field: e.field || null, seed: e.seed });
      return d;
    };
    /* The cards that draw their design, in their page's order. A card's
       neighbours are the LOOK_BACK before it in the school and in its field
       (so a run uses every look before repeating one, whatever the grid's
       width), and, near the end, the first cards, which a programme page's
       three siblings wrap round to. */
    const cards = members.filter((x) => x.shown === 'card').sort(byOrder);
    const dealt = [];
    const runs = new Map();
    const hueOf = (field) => toneOf(tones, field).hue;
    const near = (x, y) => Math.min(Math.abs(x - y) % 360, 360 - (Math.abs(x - y) % 360)) <= HUE_NEAR;
    cards.forEach((e, i) => {
      const field = e.field || '';
      /* Its own field's run, and any field of a near colour: a page can set
         small fields together under "Other fields". */
      const runsNear = [...runs].filter(([f]) => near(hueOf(f || null), hueOf(e.field))).flatMap(([, run]) => run.slice(-LOOK_BACK));
      const wrap = i >= 3 ? dealt.slice(0, Math.max(0, i - cards.length + 3)) : [];
      const d = deal(e, [...dealt.slice(-LOOK_BACK), ...runsNear, ...wrap]);
      dealt.push(d);
      runs.set(field, [...(runs.get(field) || []), d]);
    });
    /* Then the designs only a programme's own page draws; then the rest. */
    for (const e of members.filter((x) => x.shown && x.shown !== 'card').sort(byOrder)) deal(e, []);
    for (const e of members.filter((x) => !x.shown).sort(byOrder)) deal(e, []);
  }
  return (seed) => out.get(seed) || null;
}

/* --- Drawing -------------------------------------------------------------- */

const n = (v) => Math.round(v);

/**
 * Parallel lines across the frame, before rotation: `count` rows `step`
 * apart, spanning a square of half-side `R` around the centre, so a rotated
 * set still covers every corner.
 */
function rows({ w, h }, step) {
  const R = Math.ceil(Math.hypot(w, h) / 2) + step;
  const out = [];
  for (let y = h / 2 - R, i = 0; y <= h / 2 + R; y += step, i++) out.push({ i, y: n(y), x0: n(w / 2 - R), len: 2 * R });
  return out;
}

/**
 * A row cut to the part that lands in the frame once the motif is turned by
 * `rot` about the centre, plus `pad` either side, so a motif drawn period
 * by period (waves, steps, chevrons) spends no bytes off the card. The start
 * is snapped to the period, so the rows stay in step. Null when it misses.
 */
function clip({ w, h }, rot, l, pad, period) {
  const a = (-rot * Math.PI) / 180;
  const [cx, cy] = [w / 2, h / 2];
  const pts = [[0, 0], [w, 0], [w, h], [0, h]].map(([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)]);
  const xs = [];
  for (let i = 0; i < 4; i++) {
    const [p, q] = [pts[i], pts[(i + 1) % 4]];
    if ((p[1] - l.y) * (q[1] - l.y) > 0 || p[1] === q[1]) continue;
    xs.push(p[0] + ((l.y - p[1]) / (q[1] - p[1])) * (q[0] - p[0]));
  }
  if (!xs.length) return null;
  const lo = Math.max(l.x0, l.x0 + Math.floor((Math.min(...xs) - pad - l.x0) / period) * period);
  const hi = Math.min(l.x0 + l.len, Math.max(...xs) + pad);
  return hi > lo ? { ...l, x0: n(lo), len: n(hi - lo) } : null;
}
const clipped = (f, d, list, pad, period) => list.map((l) => clip(f, d.rot, l, pad, period)).filter(Boolean);

/** A path's `d` from rows, each a straight line. */
const lineD = (list, dx = () => 0) => list.map((l) => `M${l.x0 + dx(l)} ${l.y}h${l.len}`).join('');

/** Which rows are accent lines: every `every`-th, when the accent is lines. */
const split = (list, d) => {
  if (d.accent !== 'lines') return [list, []];
  return [list.filter((l) => l.i % d.every), list.filter((l) => !(l.i % d.every))];
};

/** A point on the frame's edge from a fraction and a side, just outside it. */
function edgePoint({ w, h }, d, pad) {
  const side = Math.floor(d.rot / 45) % 4;
  return [
    [n(d.ox * w), -pad],
    [w + pad, n(d.oy * h)],
    [n(d.ox * w), h + pad],
    [-pad, n(d.oy * h)],
  ][side];
}

const MOTIF = {
  /* Parallel strokes: a line drawing's shading. */
  hatch(f, d) {
    const [main, acc] = split(rows(f, d.gap), d);
    return { main: `<path d="${lineD(main)}"/>`, accent: acc.length ? `<path d="${lineD(acc)}"/>` : '', rotate: true };
  },

  /* A hexagonal field of dots: a round cap on a zero-length dash. */
  dots(f, d) {
    const step = d.gap + 2;
    const list = rows(f, Math.round(step * 0.87));
    const [main, acc] = split(list, d);
    const dx = (l) => (l.i % 2 ? n(step / 2) : 0);
    const dot = `stroke-dasharray="0 ${step}" stroke-linecap="round" stroke-width="${(d.weight * 1.7 + 1.2).toFixed(1)}"`;
    return {
      main: `<path ${dot} d="${lineD(main, dx)}"/>`,
      accent: acc.length ? `<path ${dot} d="${lineD(acc, dx)}"/>` : '',
      rotate: true,
    };
  },

  /* A twill: fine strands over two and under two, stepping one each row.
     Sparse and thin (round 2, fix 7: broad strands read as upholstery). */
  weave(f, d) {
    const g = d.gap + 7;
    const list = rows(f, g);
    const x0 = list[0].x0;
    const y0 = list[0].y;
    const across = list.map((l) => ({ ...l, x0: x0 - 4 * g + (l.i % 4) * g, y: n(l.y + g / 2), len: l.len + 4 * g }));
    const [main, acc] = split(across, d);
    const down = list.map((l) => `M${n(x0 + l.i * g + g / 2)} ${y0 - 4 * g + ((l.i + 1) % 4) * g}v${l.len + 4 * g}`).join('');
    const strand = `stroke-dasharray="${2 * g} ${2 * g}"`;
    /* The strands one way in the line colour, the other in the soft one. */
    return {
      main: `<path ${strand} d="${lineD(main)}"/>`,
      soft: `<path ${strand} stroke-width="${(d.weight * 2).toFixed(1)}" d="${down}"/>`,
      accent: acc.length ? `<path ${strand} d="${lineD(acc)}"/>` : '',
      rotate: true,
    };
  },

  /* Stacked waves, each a smooth run of quadratic curves. */
  waves(f, d) {
    const step = Math.round(d.gap * 1.6);
    const half = 22 + d.gap * 2;
    const amp = Math.round(d.gap * 0.55 + 3);
    const wave = (l) => {
      const runs = Math.ceil(l.len / half);
      return `M${l.x0} ${l.y}q${n(half / 2)} ${-2 * amp} ${half} 0${`t${half} 0`.repeat(runs - 1)}`;
    };
    const [main, acc] = split(clipped(f, d, rows(f, step), 2 * half, 2 * half), d);
    return { main: `<path d="${main.map(wave).join('')}"/>`, accent: acc.length ? `<path d="${acc.map(wave).join('')}"/>` : '', rotate: true };
  },

  /* Contour lines: drifting ellipses around a point, like a map of a hill. */
  contour(f, d) {
    const r = rng(hash(d.key));
    const cx = d.ox * f.w;
    const cy = d.oy * f.h;
    const reach = Math.hypot(Math.max(cx, f.w - cx), Math.max(cy, f.h - cy)) * 1.25;
    const drift = [(r() - 0.5) * d.gap * 0.6, (r() - 0.5) * d.gap * 0.6];
    const phase = r() * 6.28;
    const main = [];
    const acc = [];
    for (let i = 1, rx = d.gap * 0.8; rx < reach; i++, rx += d.gap * 1.35) {
      const e = 0.66 + 0.16 * Math.sin(i * 0.5 + phase);
      const el = `<ellipse cx="${n(cx + drift[0] * i)}" cy="${n(cy + drift[1] * i)}" rx="${n(rx)}" ry="${n(rx * e)}"/>`;
      (d.accent === 'lines' && !(i % d.every) ? acc : main).push(el);
    }
    return { main: main.join(''), accent: acc.join(''), rotate: true };
  },

  /* Concentric arcs rising from one edge, every other ring broken. */
  arcs(f, d) {
    const [x, y] = edgePoint(f, d, d.gap * 2);
    const reach = Math.hypot(f.w, f.h) + d.gap * 3;
    const whole = [];
    const broken = [];
    const acc = [];
    for (let i = 1, rad = d.gap * 1.2; rad < reach; i++, rad += d.gap * 1.15) {
      const c = `<circle cx="${x}" cy="${y}" r="${n(rad)}"/>`;
      if (d.accent === 'lines' && !(i % d.every)) acc.push(c);
      else (i % 2 ? whole : broken).push(c);
    }
    return {
      main: whole.join(''),
      soft: broken.length ? `<g stroke-dasharray="${n(d.gap * 0.9)} ${n(d.gap * 0.6)}">${broken.join('')}</g>` : '',
      accent: acc.join(''),
    };
  },

  /* Rays fanning from one edge, alternately long and short. */
  rays(f, d) {
    const [x, y] = edgePoint(f, d, d.gap);
    const reach = Math.hypot(f.w, f.h) + d.gap * 2;
    const step = (3 + d.gap / 5) * (Math.PI / 180);
    const main = [];
    const acc = [];
    /* Only the rays that point into the frame: the rest would draw nothing. */
    const [vx, vy] = [f.w / 2 - x, f.h / 2 - y];
    const into = (a) => (Math.cos(a) * vx + Math.sin(a) * vy) / Math.hypot(vx, vy) > -0.05;
    for (let i = 0, a = (d.rot * Math.PI) / 180; i * step < Math.PI * 2; i++, a += step) {
      if (!into(a)) continue;
      const [ex, ey] = [x + Math.cos(a) * reach, y + Math.sin(a) * reach];
      const from = d.gap * (i % 2 ? 6 : 3);
      const seg = `M${n(x + Math.cos(a) * from)} ${n(y + Math.sin(a) * from)}L${n(ex)} ${n(ey)}`;
      (d.accent === 'lines' && !(i % d.every) ? acc : main).push(seg);
    }
    return { main: `<path d="${main.join('')}"/>`, accent: acc.length ? `<path d="${acc.join('')}"/>` : '' };
  },

  /* Truchet tiles: two quarter-circles in each square, turned at random. */
  tiles(f, d) {
    const r = rng(hash(d.key));
    const t = 36 + d.gap * 2;
    const q = n(t / 2);
    const main = [];
    const acc = [];
    let i = 0;
    for (let y = -n(d.oy * t); y < f.h; y += t) {
      for (let x = -n(d.ox * t); x < f.w; x += t, i++) {
        const arcs = r() < 0.5
          ? `M${x + q} ${y}a${q} ${q} 0 0 1-${q} ${q}M${x + t} ${y + q}a${q} ${q} 0 0 0-${q} ${q}`
          : `M${x + q} ${y}a${q} ${q} 0 0 0 ${q} ${q}M${x} ${y + q}a${q} ${q} 0 0 1 ${q} ${q}`;
        (d.accent === 'lines' && !(i % (d.every + 2)) ? acc : main).push(arcs);
      }
    }
    return { main: `<path d="${main.join('')}"/>`, accent: acc.length ? `<path d="${acc.join('')}"/>` : '' };
  },
};

Object.assign(MOTIF, {
  /* A drafting grid: two sets of rules at right angles, the second softer. */
  grid(f, d) {
    const step = Math.round(d.gap * 1.7);
    const list = rows(f, step);
    const [main, acc] = split(list, d);
    const x0 = list[0].x0;
    const y0 = list[0].y;
    const down = list.map((l) => `M${x0 + l.i * step} ${y0}v${l.len}`).join('');
    return { main: `<path d="${lineD(main)}"/>`, soft: `<path d="${down}"/>`, accent: acc.length ? `<path d="${lineD(acc)}"/>` : '', rotate: true };
  },

  /* Stairs: rows of rising steps, like a chart that only climbs. */
  steps(f, d) {
    const s = 8 + Math.round(d.gap * 0.9);
    const list = clipped(f, d, rows(f, Math.round(d.gap * 2.4)), 2 * s, 2 * s);
    /* A battlement: up a step, along, down a step, along. */
    const stair = (l) => `M${l.x0} ${l.y}${`h${s}v-${s}h${s}v${s}`.repeat(Math.ceil(l.len / (2 * s)))}`;
    const [main, acc] = split(list, d);
    return { main: `<path d="${main.map(stair).join('')}"/>`, accent: acc.length ? `<path d="${acc.map(stair).join('')}"/>` : '', rotate: true };
  },

  /* Rings: a few centres, each with a handful of concentric circles. */
  rings(f, d) {
    const r = rng(hash(d.key));
    const main = [];
    const soft = [];
    const acc = [];
    const k = 3 + (d.every % 3);
    for (let c = 0; c < k; c++) {
      const cx = n(((d.ox + c / k) % 1) * f.w);
      const cy = n((0.15 + r() * 0.7) * f.h);
      const base = 10 + r() * d.gap * 2;
      for (let i = 0; i < 4; i++) {
        const el = `<circle cx="${cx}" cy="${cy}" r="${n(base + i * d.gap * 1.1)}"/>`;
        (d.accent === 'lines' && c === 0 ? acc : i % 2 ? soft : main).push(el);
      }
    }
    return { main: main.join(''), soft: soft.join(''), accent: acc.join('') };
  },

  /* Chevrons: rows of zigzags, sharp and even. */
  chevrons(f, d) {
    const a = 8 + Math.round(d.gap * 0.7);
    const list = clipped(f, d, rows(f, Math.round(d.gap * 2.4)), 2 * a, 2 * a);
    const zig = (l) => `M${l.x0} ${l.y}${`l${a} -${a}l${a} ${a}`.repeat(Math.ceil(l.len / (2 * a)))}`;
    const [main, acc] = split(list, d);
    return { main: `<path stroke-linejoin="miter" d="${main.map(zig).join('')}"/>`, accent: acc.length ? `<path d="${acc.map(zig).join('')}"/>` : '', rotate: true };
  },
});

/** The accent drawn behind the motif: a disc or a band, in the accent's pale fill. */
function ground(f, d) {
  if (d.accent === 'disc') {
    return `<circle class="dz__f" cx="${n((1 - d.ox) * f.w)}" cy="${n((1 - d.oy) * f.h)}" r="${n(f.h * (0.22 + d.every * 0.04))}"/>`;
  }
  if (d.accent === 'band') {
    const bh = n(f.h * (0.14 + d.every * 0.02));
    return `<rect class="dz__f" x="${-f.w}" y="${n(d.oy * f.h - bh / 2)}" width="${3 * f.w}" height="${bh}" transform="rotate(${(d.rot + 90) % 180 - 45} ${n(f.w / 2)} ${n(f.h / 2)})"/>`;
  }
  return '';
}

/**
 * The design as inline SVG. `frame` is 'card' (16:10, where a card's
 * photograph sits) or 'hero' (a programme page's heading). It fills its box
 * and crops, as a photograph does (`slice`).
 */
export function designedSvg(d, { frame = 'card', className = '' } = {}) {
  const f = FRAMES[frame] || FRAMES.card;
  const m = MOTIF[d.motif](f, d);
  const turn = m.rotate && d.rot ? ` transform="rotate(${d.rot} ${n(f.w / 2)} ${n(f.h / 2)})"` : '';
  const layer = (cls, body, width) => (body ? `<g class="${cls}" stroke-width="${width}"${turn}>${body}</g>` : '');
  const svg =
    `<svg class="${['dz', className].filter(Boolean).join(' ')}" viewBox="0 0 ${f.w} ${f.h}" preserveAspectRatio="xMidYMid slice"` +
    ` aria-hidden="true" focusable="false" data-backdrop="designed" data-design="${d.key}"` +
    ` style="--dh:${d.hue};--ds:${d.sat}%;--dl:${d.dl || 0};--da:${d.accentHue}">` +
    ground(f, d) +
    layer('dz__s', m.soft, d.weight) +
    layer('dz__a', m.main, d.weight) +
    layer('dz__b', m.accent, (d.weight * 1.6).toFixed(1)) +
    '</svg>';
  return html`${raw(svg)}`;
}
