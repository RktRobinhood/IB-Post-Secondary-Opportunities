/**
 * Motion tokens.
 *
 * Every animation on this site must explain one of four things: geographic
 * movement, a change in the filtered set, progression from overview to detail,
 * or a completed student action. Anything that does not is decoration competing
 * with reading, and does not get a token.
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

export const MOTION = [
  {
    token: 'geographic',
    purpose: 'The camera moves across the world — a country comes into view, or the map returns to the broad band.',
    duration: 900,
    easing: EASING.camera,
    reduced: 'The view cuts directly to the new position and the place name is announced. No pan, no zoom.',
    properties: ['transform', 'opacity'],
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
