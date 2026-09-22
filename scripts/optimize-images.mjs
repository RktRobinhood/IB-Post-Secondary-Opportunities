/**
 * Brings the hosted photographs into line with docs/IMAGE_STANDARD.md.
 *
 *   node scripts/optimize-images.mjs         # convert whatever does not conform
 *   node scripts/optimize-images.mjs --dry   # report only, touch nothing
 *
 * Idempotent. A file already meeting the standard is skipped, so running this
 * twice costs one directory listing. In normal use you should never need to
 * run it at all: scripts/fetch-images.mjs produces conforming files directly.
 * This exists for the back catalogue and for the day someone adds a picture
 * by hand.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { EXT, conforms, normalise, probeWebp } from './lib/image-standard.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const IMG_DIR = path.join(ROOT, 'src', 'assets', 'img', 'places');
const PICKS = path.join(ROOT, 'data', 'images.json');
const DRY = process.argv.includes('--dry');

const kb = (n) => `${Math.round(n / 1024)} kB`;

async function main() {
  const files = (await fs.readdir(IMG_DIR)).filter((f) => !f.startsWith('.')).sort();
  const picks = JSON.parse(await fs.readFile(PICKS, 'utf8'));

  /* src path -> manifest key, so a converted file can update its own record. */
  const bySrc = new Map();
  for (const [key, rec] of Object.entries(picks)) {
    if (rec?.src) bySrc.set(rec.src, key);
  }

  let converted = 0, skipped = 0, failed = 0, before = 0, after = 0;
  const problems = [];

  for (const file of files) {
    const abs = path.join(IMG_DIR, file);
    const buf = await fs.readFile(abs);
    before += buf.length;

    /* Already conforming? Leave it alone. */
    if (file.endsWith(EXT)) {
      const dim = probeWebp(buf);
      if (dim && conforms({ file, ...dim, bytes: buf.length }).length === 0) {
        after += buf.length;
        skipped++;
        continue;
      }
    }

    let out;
    try {
      out = await normalise(buf);
    } catch (err) {
      console.log(`  ✗ ${file.padEnd(30)} ${err.message}`);
      problems.push(`${file}: ${err.message}`);
      after += buf.length;
      failed++;
      continue;
    }

    const target = file.replace(/\.[^.]+$/, EXT);
    const saved = ((1 - out.bytes / buf.length) * 100).toFixed(0);
    console.log(
      `  ${file.padEnd(30)} ${kb(buf.length).padStart(8)} -> ${kb(out.bytes).padStart(7)}` +
        `  ${(saved + '%').padStart(5)}  ${out.source} -> ${out.width}x${out.height} q${out.quality}`
    );

    if (!DRY) {
      await fs.writeFile(path.join(IMG_DIR, target), out.data);
      if (target !== file) await fs.rm(abs);

      const key = bySrc.get(`/assets/img/places/${file}`);
      if (key) {
        picks[key].src = `/assets/img/places/${target}`;
        picks[key].width = out.width;
        picks[key].height = out.height;
        picks[key].bytes = out.bytes;
      } else {
        problems.push(`${file}: converted, but no data/images.json record points at it`);
      }
    }

    after += out.bytes;
    converted++;
  }

  if (!DRY) await fs.writeFile(PICKS, JSON.stringify(picks, null, 2) + '\n');

  /* A manifest entry whose file vanished renders <img src> onto a 404. */
  for (const [key, rec] of Object.entries(picks)) {
    if (!rec?.src?.startsWith('/assets/img/places/')) continue;
    const name = rec.src.split('/').pop();
    try {
      await fs.access(path.join(IMG_DIR, name));
    } catch {
      problems.push(`data/images.json "${key}" points at ${name}, which does not exist`);
    }
  }

  console.log(
    `\n${DRY ? 'Would convert' : 'Converted'} ${converted} · skipped ${skipped}` +
      `${failed ? ` · failed ${failed}` : ''}`
  );
  console.log(
    `${(before / 1e6).toFixed(1)} MB -> ${(after / 1e6).toFixed(1)} MB ` +
      `(${((1 - after / before) * 100).toFixed(1)}% smaller)${DRY ? ', nothing written' : ''}`
  );

  if (problems.length) {
    console.log(`\n${problems.length} problem(s):`);
    for (const p of problems) console.log(`  · ${p}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
