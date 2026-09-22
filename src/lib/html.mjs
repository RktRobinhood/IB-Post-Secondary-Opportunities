/**
 * A very small templating layer.
 *
 * `html` is a tagged template that escapes every interpolated value, so data
 * from the JSON files can never break the page or inject markup. Arrays are
 * joined, null/undefined/false become nothing, and anything already produced by
 * `html` (or explicitly wrapped in `raw`) passes through untouched.
 */

const RAW = Symbol('raw');

export function raw(value) {
  return { [RAW]: true, value: String(value ?? '') };
}

export function escape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function render(value) {
  if (value === null || value === undefined || value === false || value === true) return '';
  if (typeof value === 'object' && value[RAW]) return value.value;
  if (Array.isArray(value)) return value.map(render).join('');
  return escape(value);
}

export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += render(values[i]) + strings[i + 1];
  return raw(out);
}

/** Render to a plain string, for writing to disk. */
export function toString(node) {
  return render(node);
}

/** Build a class attribute from strings and conditionals. */
export function cx(...parts) {
  return parts
    .flat()
    .filter((p) => p && typeof p === 'string')
    .join(' ');
}

/** Turn a title into a URL-safe slug, keeping Danish and other Latin letters readable. */
export function slugify(input) {
  return String(input ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ø/gi, 'o')
    .replace(/æ/gi, 'ae')
    .replace(/å/gi, 'aa')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * The tiniest possible Markdown: paragraphs, **bold**, *italic*, `code`,
 * [links](url), and - bullet lists. Content in the data files is plain prose,
 * so this is all the formatting it ever needs.
 */
export function md(text) {
  if (!text) return raw('');
  const inline = (s) =>
    escape(s)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" rel="noopener">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');

  const blocks = String(text).trim().split(/\n{2,}/);
  const out = blocks
    .map((block) => {
      const lines = block.split('\n');
      if (lines.every((l) => /^\s*[-•]\s+/.test(l))) {
        return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-•]\s+/, ''))}</li>`).join('')}</ul>`;
      }
      if (/^#{2,4}\s/.test(lines[0])) {
        const level = lines[0].match(/^#+/)[0].length;
        const head = `<h${level}>${inline(lines[0].replace(/^#+\s*/, ''))}</h${level}>`;
        const rest = lines.slice(1).join(' ');
        return rest ? `${head}<p>${inline(rest)}</p>` : head;
      }
      return `<p>${inline(lines.join(' '))}</p>`;
    })
    .join('\n');
  return raw(out);
}

/** Shorten prose for cards and meta descriptions without cutting mid-word. */
export function truncate(text, max = 160) {
  const s = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  return s.slice(0, s.lastIndexOf(' ', max - 1)).replace(/[,;:.]$/, '') + '…';
}

/** "1 programme" / "4 programmes" */
export function plural(n, one, many = one + 's') {
  return `${n} ${n === 1 ? one : many}`;
}

/** Join a list the way a person would write it. */
export function listSentence(items, conjunction = 'and') {
  const a = items.filter(Boolean);
  if (a.length === 0) return '';
  if (a.length === 1) return a[0];
  if (a.length === 2) return `${a[0]} ${conjunction} ${a[1]}`;
  return `${a.slice(0, -1).join(', ')} ${conjunction} ${a.at(-1)}`;
}
