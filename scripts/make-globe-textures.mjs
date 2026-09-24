/**
 * Vendors the NASA textures the globe is painted with.
 *
 *   node scripts/make-globe-textures.mjs
 *
 * Downloads the originals into `.cache/globe/` (once — a cached original is
 * reused), then writes compressed WebP beside the engine in
 * `src/assets/img/globe/`. The provenance is in the README there; this file is
 * how the bytes were made, so the next person can remake them at a different
 * size without guessing at the settings.
 *
 * Four files, in the order the globe asks for them (ADR 0005, round 1):
 *
 *   earth-day.webp            2048 x 1024  first frame, with the clouds
 *   earth-clouds.webp         2048 x 1024  first frame
 *   earth-day-4096.webp       4096 x 2048  swapped in once the globe is idle
 *   earth-detail-europe.webp  4096 x 2048  over DETAIL only, fetched the first
 *                                          time the camera comes down over it
 *
 * plus `detail.json`, which tells the globe where the detail texture sits. The
 * detail region is where most of this site's Destinations are; it is data the
 * engine reads, not a region the engine knows.
 *
 * All NASA imagery, public domain in the United States.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const CACHE = path.join(ROOT, '.cache', 'globe');
const OUT = path.join(ROOT, 'src', 'assets', 'img', 'globe');

/* Blue Marble: Next Generation, July 2004 — July, not December: a December
   Earth has Scandinavia under snow, which on a map of where to study reads as
   cloud. The 21600 x 10800 master is ~60 pixels a degree, enough for every
   file below to be a downsample rather than an upscale. */
const DAY = 'https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74092/world.200407.3x21600x10800.jpg';
const CLOUDS = 'https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/cloud_combined_2048.jpg';

/* Where the detail texture goes: every European Destination, from Iceland to
   Cyprus and from Portugal to Finland, with a margin. */
const DETAIL = { west: -25, east: 45, south: 34, north: 72 };

async function original(url) {
  const cached = path.join(CACHE, path.basename(new URL(url).pathname));
  try {
    return await fs.readFile(cached);
  } catch {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(cached, buf);
    return buf;
  }
}

async function write(name, pipeline) {
  const out = await pipeline.toBuffer();
  await fs.writeFile(path.join(OUT, name), out);
  const meta = await sharp(out).metadata();
  console.log(`${name.padEnd(26)} ${meta.width}x${meta.height}  ${Math.round(out.length / 1024)} kB`);
}

await fs.mkdir(CACHE, { recursive: true });
await fs.mkdir(OUT, { recursive: true });
sharp.cache(false);

const day = await original(DAY);
const master = () => sharp(day, { limitInputPixels: false });
const W = 21600, H = 10800;

await write('earth-day.webp', master().resize(2048, 1024, { kernel: 'lanczos3' }).webp({ quality: 85, effort: 6 }));
await write('earth-day-4096.webp', master().resize(4096, 2048, { kernel: 'lanczos3' }).webp({ quality: 80, effort: 6 }));

const px = (lon) => Math.round(((lon + 180) / 360) * W);
const py = (lat) => Math.round(((90 - lat) / 180) * H);
await write(
  'earth-detail-europe.webp',
  master()
    .extract({ left: px(DETAIL.west), top: py(DETAIL.north), width: px(DETAIL.east) - px(DETAIL.west), height: py(DETAIL.south) - py(DETAIL.north) })
    .resize(4096, 2048, { kernel: 'lanczos3' })
    .webp({ quality: 78, effort: 6 })
);
await fs.writeFile(
  path.join(OUT, 'detail.json'),
  JSON.stringify({ file: 'earth-detail-europe.webp', ...DETAIL }, null, 2) + '\n'
);

/* Clouds are read as one brightness channel, used as alpha. The 2048 master is
   the largest NASA publishes of this layer. A 0.6 px blur before encoding and
   a high quality keep WebP's 4 x 4 blocks out of the soft edges, which is where
   the lossy 1024 version showed squares. */
const clouds = await original(CLOUDS);
await write('earth-clouds.webp', sharp(clouds).blur(0.6).grayscale().webp({ quality: 82, effort: 6, smartSubsample: true }));
