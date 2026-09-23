/**
 * Guards on how big a control is allowed to be, and how small type is.
 *
 * Issue #34 was not a bug anybody could have found by running the build. Every
 * page laid out correctly at 375px — `document.scrollWidth` was 375 on all of
 * them — and `npm run check` was green. What was wrong was that eighteen
 * selects rendered at 24px, thirty-seven checkboxes at 13x13, the chips at 30
 * and the header's icon buttons at 36x36, and that the site header set 10.31px
 * type on every page. None of that is an error state. It is ten components each
 * answering "how big is a control?" for itself, correctly as far as it knew.
 *
 * The 44px rule was not missing before #34. It was written down, with a good
 * comment, on `.world__btn` — one component, since #26. So the failure this
 * file exists to prevent is not "somebody forgets the number". It is "somebody
 * states the number again, somewhere else, slightly differently", which is
 * exactly what having it in one place stops being possible to notice by eye.
 *
 * So the checks are mostly refusals, in the manner of scripts/test-images.mjs,
 * and each one corresponds to a way the policy could be got round rather than
 * to a way it could crash:
 *
 *   - restating 44px (or 2.75rem) in a component instead of reading `--tap`;
 *   - narrowing the family of controls the policy names, so a new kind of
 *     control is outside it;
 *   - opting a control out under a coarse pointer with a smaller minimum;
 *   - setting type that resolves below the floor, or that is relative and can
 *     fall below it inside a smaller parent — which is how `small` reached
 *     11.375px thirty-two times on one page;
 *   - re-attaching a control's identity to the container it sits in, which is
 *     the precise cause of the unstyled subject checker: `appearance`, the
 *     border and the chevron were on `.field select`, and the picker is not a
 *     `.field`.
 *
 * What it deliberately does not check: anything that needs a browser. It reads
 * declarations, not geometry, so it cannot see a control that is too short
 * because of its padding rather than because of a declared height, and it
 * cannot see one that is too short because no rule reached it at all — which is
 * the shape of the original bug. Rendered sizes are measured by hand at 375,
 * 768 and desktop; this file's job is to stop the *policy* eroding between
 * those measurements.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

const SHEETS = ['src/assets/css/site.css', 'src/assets/css/primitives.css'];

/** The one number, and where it is allowed to be written. */
const TAP_TOKEN = '--tap';
/** 44px said outright, anywhere. */
const TAP_LITERAL = /\b44px\b/;
/** 44px said in rem, which only reads as the minimum when it is sizing a control. */
const TAP_LITERAL_REM = /\b2\.75rem\b/;
const SIZE_PROPS = ['min-height', 'min-width', 'height', 'width', 'max-height', 'max-width'];

/** The floor under type, and where it is allowed to be written. */
const TYPE_TOKEN = '--type-floor';
const TYPE_FLOOR_PX = 12;

/**
 * Every kind of control the policy has to reach. A selector naming one of these
 * is a control selector as far as this file is concerned.
 */
const CONTROL_FAMILY = ['button', 'select', 'summary', 'textarea', 'input', '[role="button"]'];

/**
 * A control may keep its ink smaller than the minimum only by taking the
 * minimum somewhere else, and only with the reason written down beside it.
 */
const TAP_EXEMPT = [
  [
    '.shell__active button',
    'the × inside a 24px receipt chip: keeps its ink and takes its 44px as a ' +
      'transparent ::after overlay — see the note in primitives.css',
  ],
];

let failures = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok    ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL  ${name}\n          ${e.message}`);
  }
};

/* --- Reading the stylesheets back ----------------------------------------- */

/** Blank out comments, keeping every newline so line numbers stay true. */
const decomment = (css) => css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));

/**
 * Every declaration in a stylesheet, with the selector it belongs to and the
 * at-rules it is nested inside. Hand-written rather than regexed because this
 * repository's CSS nests a media query inside a rule (the dark-theme tokens),
 * and because a `content: "}"` would end a naive scan early.
 */
function declarations(css, file) {
  const text = decomment(css);
  const out = [];
  const stack = [];
  let buf = '';
  let line = 1;
  let bufLine = 1;

  const flush = () => {
    const raw = buf.trim();
    buf = '';
    if (!raw || !raw.includes(':')) return;
    const at = raw.indexOf(':');
    const prop = raw.slice(0, at).trim();
    const value = raw.slice(at + 1).trim();
    if (!/^[-\w]+$/.test(prop)) return; // a selector fragment, not a declaration
    out.push({
      file,
      line: bufLine,
      prop,
      value,
      selector: [...stack].reverse().find((s) => !s.startsWith('@')) || '',
      context: stack.filter((s) => s.startsWith('@')),
    });
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '\n') line++;
    if (ch === '"' || ch === "'") {
      const quote = ch;
      buf += ch;
      for (i++; i < text.length && text[i] !== quote; i++) {
        if (text[i] === '\n') line++;
        buf += text[i];
      }
      buf += quote;
      continue;
    }
    if (ch === '{') {
      stack.push(buf.replace(/\s+/g, ' ').trim());
      buf = '';
      bufLine = line;
    } else if (ch === '}') {
      flush();
      stack.pop();
      bufLine = line;
    } else if (ch === ';') {
      flush();
      bufLine = line;
    } else {
      if (!buf.trim()) bufLine = line;
      buf += ch;
    }
  }
  return out;
}

const sheets = [];
for (const rel of SHEETS) {
  sheets.push({ rel, decls: declarations(await fs.readFile(path.join(ROOT, rel), 'utf8'), rel) });
}
const all = sheets.flatMap((s) => s.decls);
const where = (d) => `${d.file}:${d.line}`;

const isCoarse = (d) => d.context.some((c) => /pointer\s*:\s*coarse/.test(c));
const isPrint = (d) => d.context.some((c) => /^@media[^(]*\bprint\b/.test(c));

/** Split a selector list into its comma-separated members. */
const members = (sel) =>
  sel
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/** Does this selector list target one of the controls the policy names? */
const targetsControl = (sel) =>
  members(sel).some((m) => {
    const last = m.split(/[\s>+~]+/).filter(Boolean).pop() || '';
    return (
      CONTROL_FAMILY.some((c) => last === c || last.startsWith(`${c}[`) || last.startsWith(`${c}:`)) ||
      /\.(btn|chip|icon-btn|world__btn)\b/.test(last)
    );
  });

/** Top-level whitespace split, respecting parentheses and quotes. */
function tokens(value) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (/\s/.test(ch) && depth === 0) {
      if (cur) out.push(cur);
      cur = '';
    } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

/**
 * The smallest number of pixels a length can resolve to, or null when this file
 * has no business guessing. `em` and `%` are reported as their factor so the
 * caller can insist on a floor around them.
 */
function smallestPx(token) {
  const t = token.trim();
  if (/var\(\s*--type-floor\s*\)/.test(t) || /var\(\s*--tap\s*\)/.test(t)) return { floored: true };
  if (/^max\(/i.test(t)) {
    // A max() carrying the floor is the sanctioned way to keep a relative size.
    if (new RegExp(`var\\(\\s*${TYPE_TOKEN}\\s*\\)`).test(t)) return { floored: true };
    return null;
  }
  if (/^clamp\(/i.test(t)) {
    const inner = t.slice(t.indexOf('(') + 1, t.lastIndexOf(')'));
    return smallestPx(tokens(inner.split(',')[0]).join(' '));
  }
  if (/^calc\(/i.test(t) || /^var\(/.test(t)) return null;
  const m = /^(-?[\d.]+)(px|rem|em|pt|%)$/.exec(t);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (m[2] === 'px') return { px: n };
  if (m[2] === 'rem') return { px: n * 16 };
  if (m[2] === 'pt') return { px: (n * 4) / 3 };
  if (m[2] === 'em') return { factor: n };
  if (m[2] === '%') return { factor: n / 100 };
  return null;
}

/** The size out of a `font-size` value or a `font` shorthand. */
function fontSizeToken(d) {
  if (d.prop === 'font-size') return d.value.split('/')[0].trim();
  if (d.prop !== 'font') return null;
  for (const t of tokens(d.value)) {
    const size = t.split('/')[0];
    if (/^(max|clamp|calc|var)\(/i.test(size) || /^-?[\d.]+(px|rem|em|pt|%)$/.test(size)) return size;
  }
  return null;
}

/* --- The number is written once ------------------------------------------- */

check('the touch minimum is declared once, as a token', () => {
  const decls = all.filter((d) => d.prop === TAP_TOKEN);
  assert.equal(decls.length, 1, `${TAP_TOKEN} is declared ${decls.length} times: ${decls.map(where).join(', ')}`);
  assert.equal(decls[0].value, '44px', `${TAP_TOKEN} is ${decls[0].value}, not 44px`);
});

check('no component restates the touch minimum', () => {
  // This is the whole issue in one check. The rule existed before #34, on one
  // component; what it could not do was stop the next component deciding for
  // itself. A second `44px` anywhere is that happening again.
  const strays = all
    .filter((d) => d.prop !== TAP_TOKEN)
    .filter(
      (d) =>
        TAP_LITERAL.test(d.value) ||
        // 2.75rem is 44px, and is only the minimum being restated when it is
        // sizing a control — `.logo-chip` and the card monogram are 2.75rem for
        // reasons that have nothing to do with a thumb.
        (TAP_LITERAL_REM.test(d.value) && SIZE_PROPS.includes(d.prop) && targetsControl(d.selector))
    )
    .map((d) => `${where(d)}  ${d.selector} { ${d.prop}: ${d.value} }`);
  assert.deepEqual(strays, [], `44px is written outside ${TAP_TOKEN}:\n          ${strays.join('\n          ')}`);
});

check('every kind of control is named in the policy', () => {
  // The policy is only inherited by what it names. Dropping `summary` from the
  // list would not fail anything else here, and would put every disclosure on
  // the site back to 21px.
  const named = all
    .filter((d) => isCoarse(d) && d.prop === 'min-height' && new RegExp(`var\\(\\s*${TAP_TOKEN}\\s*\\)`).test(d.value))
    .map((d) => d.selector)
    .join(' , ');
  assert.ok(named, 'no rule under (pointer: coarse) gives a control min-height: var(--tap)');
  const missing = [...CONTROL_FAMILY, 'label'].filter((c) => !named.includes(c));
  assert.deepEqual(missing, [], `the control policy no longer reaches: ${missing.join(', ')}`);
});

check('the policy outranks the components it has to raise', () => {
  // site.css loads before primitives.css, where `.world__btn` sets its own
  // 2rem. A policy written as a bare element list is one class selector too
  // weak to reach it and loses in silence — which is how the map's own first
  // attempt at this failed, per the note it left behind.
  const policy = all.filter(
    (d) => isCoarse(d) && d.prop === 'min-height' && new RegExp(`var\\(\\s*${TAP_TOKEN}\\s*\\)`).test(d.value)
  );
  const weak = policy.filter((d) => !/:root|:is\(|html/.test(d.selector)).map((d) => `${where(d)}  ${d.selector}`);
  assert.deepEqual(
    weak,
    [],
    `the policy is written at element specificity and will lose to a component:\n          ${weak.join('\n          ')}`
  );
});

/* --- Nothing opts out ------------------------------------------------------ */

check('no control opts out of the minimum under a coarse pointer', () => {
  const exempt = (sel) => TAP_EXEMPT.some(([s]) => sel.includes(s));
  const offenders = all
    .filter((d) => isCoarse(d) && ['min-height', 'min-width', 'height', 'width'].includes(d.prop))
    .filter((d) => targetsControl(d.selector) && !exempt(d.selector))
    .filter((d) => {
      const px = smallestPx(d.value);
      return px && px.px !== undefined && px.px < 44;
    })
    .map((d) => `${where(d)}  ${d.selector} { ${d.prop}: ${d.value} }`);
  assert.deepEqual(
    offenders,
    [],
    `a control is smaller than --tap under a thumb:\n          ${offenders.join('\n          ')}`
  );
});

check('every exemption from the minimum is still a real exemption', () => {
  // An allowlist entry for a selector that no longer exists is an allowlist
  // entry that will one day silently cover something else.
  const missing = [];
  for (const [sel] of TAP_EXEMPT) {
    const found = all.some((d) => isCoarse(d) && d.selector.includes(sel));
    if (!found) missing.push(sel);
  }
  assert.deepEqual(missing, [], `allowlisted but no longer present: ${missing.join(', ')}`);
});

/* --- The type floor -------------------------------------------------------- */

check('the type floor is declared once, as a token', () => {
  const decls = all.filter((d) => d.prop === TYPE_TOKEN);
  assert.equal(decls.length, 1, `${TYPE_TOKEN} is declared ${decls.length} times: ${decls.map(where).join(', ')}`);
  const px = smallestPx(decls[0].value);
  assert.equal(px?.px, TYPE_FLOOR_PX, `${TYPE_TOKEN} is ${decls[0].value}, which is not ${TYPE_FLOOR_PX}px`);
});

check('no absolute type size resolves below the floor', () => {
  const offenders = all
    .filter((d) => !isPrint(d))
    .map((d) => ({ d, token: fontSizeToken(d) }))
    .filter(({ token }) => token)
    .map(({ d, token }) => ({ d, token, px: smallestPx(token) }))
    .filter(({ px }) => px && px.px !== undefined && px.px < TYPE_FLOOR_PX)
    .map(({ d, token }) => `${where(d)}  ${d.selector} { ${d.prop}: … ${token} … }`);
  assert.deepEqual(
    offenders,
    [],
    `set below ${TYPE_FLOOR_PX}px:\n          ${offenders.join('\n          ')}`
  );
});

check('no relative type size can fall below the floor', () => {
  // `small { font-size: .875em }` is not a number anybody can check by reading
  // it. Inside `.prog__meta` at .8125rem it resolved to 11.375px, thirty-two
  // times on the programme finder. A size that shrinks against its parent has
  // to say where it stops.
  const offenders = all
    .filter((d) => !isPrint(d))
    .map((d) => ({ d, token: fontSizeToken(d) }))
    .filter(({ token }) => token)
    .map(({ d, token }) => ({ d, token, px: smallestPx(token) }))
    .filter(({ px }) => px && px.factor !== undefined && px.factor < 1)
    .map(
      ({ d, token }) =>
        `${where(d)}  ${d.selector} { ${d.prop}: … ${token} … }  — wrap it: max(var(${TYPE_TOKEN}), ${token})`
    );
  assert.deepEqual(
    offenders,
    [],
    `shrinks against its parent with no floor:\n          ${offenders.join('\n          ')}`
  );
});

/* --- The control carries its own styling ---------------------------------- */

/** Declarations on a selector list that contains the bare element `select`. */
const bareSelect = all.filter((d) => members(d.selector).includes('select'));

check('a select is styled as a select, not as the inside of a field', () => {
  // The whole of #34's worst symptom. `appearance`, the border, the radius and
  // the chevron were all written `.field select`; `/planner/` puts its eighteen
  // selects in `.picker__slot`, which is not a `.field`, so the site's primary
  // call to action rendered in the browser's default chrome.
  const props = new Set(bareSelect.map((d) => d.prop));
  const missing = ['appearance', 'background-image', 'border', 'border-radius', 'padding', 'font-size'].filter(
    (p) => !props.has(p)
  );
  assert.deepEqual(missing, [], `a select only gets these from its container: ${missing.join(', ')}`);
});

check('no container declares what a select is', () => {
  // A container may say how wide a control is; width is a fact about the
  // column. It may not say what the control is. `padding` is left out on
  // purpose: a narrow column legitimately tightens the chevron's reserve, and
  // `.picker__slot .p-grade` does exactly that.
  const identity = ['appearance', 'border', 'border-radius', 'background-image'];
  const offenders = all
    .filter((d) => identity.includes(d.prop))
    .filter((d) =>
      members(d.selector).some((m) => {
        const parts = m.split(/[\s>]+/).filter(Boolean);
        const last = parts.pop() || '';
        return parts.length > 0 && (last === 'select' || last.startsWith('select['));
      })
    )
    .map((d) => `${where(d)}  ${d.selector} { ${d.prop}: ${d.value} }`);
  assert.deepEqual(
    offenders,
    [],
    `a select's identity is attached to its container:\n          ${offenders.join('\n          ')}`
  );
});

check('a text input is styled as a text input, not as the inside of a field', () => {
  const props = new Set(
    all.filter((d) => members(d.selector).some((m) => /^input\[type="(text|search|number)"\]$/.test(m))).map((d) => d.prop)
  );
  const missing = ['border', 'padding', 'background'].filter((p) => !props.has(p));
  assert.deepEqual(missing, [], `a text input only gets these from its container: ${missing.join(', ')}`);
});

console.log(failures ? `\n${failures} failing\n` : '\nAll control guards pass\n');
process.exit(failures ? 1 : 0);
