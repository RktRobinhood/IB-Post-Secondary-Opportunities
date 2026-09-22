/**
 * No source file may contain a raw control character.
 *
 * This guard exists because the same bug has now cost real time three separate
 * times in this repository, and it is invisible every time.
 *
 * A regex written through a shell heredoc or a template literal with single
 * backslashes does not fail loudly. `\b` becomes a backspace character (U+0008),
 * `\s` becomes the letter s, `\d` becomes the letter d. The regex still
 * compiles. Nothing throws. It simply stops matching what it was meant to
 * match, and — this is the part that makes it expensive — the output then looks
 * exactly like a real finding:
 *
 *   - A subject-matching probe reported an entire university as unsourced.
 *   - A deadline check reported the Danish national application deadline as
 *     having no source behind it, on a page that states it twice.
 *   - A guard meant to stop context notes speaking like rules silently passed a
 *     note reading "You must complete a group project every semester."
 *
 * In each case the honest-looking report was wrong, and in the third case the
 * broken thing was itself a safety check, which is the worst version of this.
 *
 * You cannot see the difference by reading the file: a backspace renders as
 * nothing. So this is checked mechanically instead of watched for.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIRS = ['src', 'scripts'];
const EXTENSIONS = ['.mjs', '.js', '.json'];

/** Tab, newline and carriage return are legitimate; nothing else is. */
const FORBIDDEN = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/;

const NAMES = {
  8: 'backspace (a mangled \\b)',
  0: 'null',
  27: 'escape',
};

async function walk(dir, out = []) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git', '.cache', 'dist'].includes(e.name)) continue;
      await walk(p, out);
    } else if (EXTENSIONS.includes(path.extname(e.name))) {
      out.push(p);
    }
  }
  return out;
}

const problems = [];
let scanned = 0;

for (const dir of DIRS) {
  for (const file of await walk(path.join(ROOT, dir))) {
    scanned++;
    const text = await fs.readFile(file, 'utf8');
    if (!FORBIDDEN.test(text)) continue;

    const lines = text.split(/\r?\n/);
    lines.forEach((line, i) => {
      const m = FORBIDDEN.exec(line);
      if (!m) return;
      const code = m[0].charCodeAt(0);
      const label = NAMES[code] || `U+${code.toString(16).padStart(4, '0')}`;
      problems.push(
        `${path.relative(ROOT, file)}:${i + 1} contains ${label}\n` +
          `      ${JSON.stringify(line.trim().slice(0, 100))}`
      );
    });
  }
}

console.log(`\nScanned ${scanned} source files for control characters.\n`);
if (problems.length) {
  console.log(`${problems.length} file location(s) with a raw control character:`);
  for (const p of problems) console.log(`  ✗ ${p}`);
  console.log(
    '\nThis is almost always an escape that was eaten before it reached the file.\n' +
      'Rewrite the line with an editor rather than through a shell heredoc, and\n' +
      'check the regex still contains its \\b, \\s and \\d.\n'
  );
  process.exit(1);
}
console.log('No control characters. Escapes survived.\n');
