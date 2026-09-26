/**
 * Motion tokens.
 *
 * Every animation on this site must explain one of four things: geographic
 * movement, a change in the filtered set, progression from overview to detail,
 * or a completed student action. Anything that does not is decoration competing
 * with reading, and does not get a token.
 *
 * All four have a token below. The fourth, `geographic`, came back with the
 * globe (ADR 0005): the camera in `assets/js/globe.js` is its one spender, and
 * the note above `MOTION` records why it was once removed and what brought it
 * back. The flat fallback that panned on `overview-to-detail` was removed with
 * the flat map (ADR 0007).
 *
 * Each token carries its purpose in the data, not in a comment, so the
 * generated stylesheet and the documentation cannot drift apart. Every token
 * declares what it becomes under `prefers-reduced-motion` — and that is never
 * "nothing happens", because a student who cannot see the transition still
 * needs to know the thing changed.
 */

export const EASING = {
  /* Camera moves settle rather than stop. */
  camera: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  /* Interface elements that should feel responsive, not springy. */
  ui: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /* Things entering the page. */
  enter: 'cubic-bezier(0, 0, 0.2, 1)',
  /* Things leaving, faster than they arrived. */
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
};

/*
 * **Since ADR 0005 this history is closed: `geographic` is back, below, and
 * the globe spends it.** What follows is why it was once removed, kept because
 * both reasons still bind the token now that it exists — it is spent only on a
 * camera a student set moving, never on a page load, and never on a CSS
 * transform over the inline SVG.
 *
 * There used to be a fifth token, `geographic`: 900ms on the camera easing, for
 * "the camera moves across the world — a country comes into view, or the map
 * returns to the broad band". It is gone, and this is the record of why, so
 * that whoever needs it back knows what they are walking into.
 *
 * **Nothing on this site moves a camera except `assets/js/map.js`, and that
 * already spends `overview-to-detail` on it.** Every other camera — a
 * destination's map, a chapter's frame — is projected and framed at build time
 * and handed to the reader already arrived at, because the world window is
 * dependency-free inline SVG precisely so that it works with the script off.
 * So `geographic` was a token for a movement that only one file performs, and
 * that file had already chosen a different token for it and written down why.
 * Two tokens for one job is exactly the drift these tokens exist to prevent.
 *
 * **The one spend that could have been invented was not worth having.** The
 * home page's journey chapters each carry their own camera, so the obvious move
 * was to let each frame settle into its target once on load, with a CSS
 * transform on the chapter's `<svg>`. It was built, and then removed, for two
 * reasons that did not go away on inspection. It is triggered by the page
 * loading rather than by anything a student did, so it explains nothing — which
 * is the bar every token here is supposed to clear. And a CSS transform
 * promotes its element to a composited layer, which on these maps means a
 * thousand-path coastline rasterised twice; the performance contract in
 * EXPERIENCE_PRINCIPLES.md is explicit that visual ambition cannot make the
 * core tool feel sluggish on modest mobile hardware, and paying that on first
 * paint for an effect nobody asked for is the wrong side of the trade.
 *
 * It comes back when something genuinely flies a camera — issue #19's globe is
 * the obvious candidate — together with the code that spends it, in that order.
 * (It did: ADR 0005, 24 September 2026.)
 */
export const MOTION = [
  {
    token: 'geographic',
    purpose:
      'The camera travels across the world because a student chose a place: pull out, travel, dive in — through the clouds when it comes down past them. The base length of a flight; the globe scales it with the distance travelled.',
    duration: 1400,
    easing: EASING.camera,
    reduced: 'The camera is at the place at once. No flight, no idle spin, no cloud rush; the live region still says where it went.',
    properties: ['camera'],
  },
  {
    token: 'set-change',
    purpose: 'The filtered set changed: lights fade out, gather, or brighten as results are added or removed.',
    duration: 320,
    easing: EASING.ui,
    reduced: 'Markers and rows swap instantly. The live result count still announces the new total.',
    properties: ['opacity', 'transform'],
    stagger: 18,
  },
  {
    token: 'overview-to-detail',
    purpose: 'Moving from a card or marker into the thing itself — a panel opening, a page taking over.',
    duration: 420,
    easing: EASING.enter,
    reduced: 'The detail appears in place, with focus moved to its heading so the change is not silent.',
    properties: ['opacity', 'transform'],
  },
  {
    token: 'action-complete',
    purpose: 'A student did something and it worked: saved to the exploration list, copied a link, cleared filters.',
    duration: 240,
    easing: EASING.ui,
    reduced: 'A static confirmation appears and is announced. No pulse, no bounce.',
    properties: ['opacity', 'background-color'],
  },
];

/** Generate the CSS custom properties and the reduced-motion overrides. */
export function motionCss() {
  const vars = MOTION.map(
    (m) => `  --motion-${m.token}: ${m.duration}ms ${m.easing};\n  --motion-${m.token}-ms: ${m.duration}ms;`
  ).join('\n');

  const stagger = MOTION.filter((m) => m.stagger)
    .map((m) => `  --motion-${m.token}-stagger: ${m.stagger}ms;`)
    .join('\n');

  const reduced = MOTION.map((m) => `  --motion-${m.token}: 1ms linear;\n  --motion-${m.token}-ms: 1ms;`).join('\n');
  const reducedStagger = MOTION.filter((m) => m.stagger)
    .map((m) => `  --motion-${m.token}-stagger: 0ms;`)
    .join('\n');

  return `/* Generated from src/lib/motion.mjs — do not edit by hand. */
:root {
${vars}
${stagger}
  --ease-camera: ${EASING.camera};
  --ease-ui: ${EASING.ui};
  --ease-enter: ${EASING.enter};
  --ease-exit: ${EASING.exit};
}

@media (prefers-reduced-motion: reduce) {
  :root {
${reduced}
${reducedStagger}
  }
}

/* An in-product control, because the operating-system preference is not always
   the preference a student has right now. */
:root[data-motion="reduced"] {
${reduced}
${reducedStagger}
}
`;
}

/** The documentation table, rendered from the same source as the CSS. */
export function motionTable() {
  return MOTION.map((m) => ({
    token: m.token,
    purpose: m.purpose,
    timing: `${m.duration}ms`,
    reduced: m.reduced,
  }));
}
