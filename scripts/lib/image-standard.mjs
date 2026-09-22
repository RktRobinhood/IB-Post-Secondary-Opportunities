/**
 * The one shape every hosted photograph takes. See docs/IMAGE_STANDARD.md for
 * the reasoning; this file is the source of truth for the numbers.
 *
 * Deliberately split in two halves:
 *
 *   - the constants and `probeWebp` are dependency-free, so scripts/check.mjs
 *     can gate CI on them without an npm install;
 *   - `normalise` imports sharp lazily, so importing this module from a
 *     CI-side script never reaches for a devDependency that is not there.
 *
 * Nothing under src/ may import this module. The site build runs on Node's
 * standard library alone.
 */

/** Widest we store. Templates declare width="800"; this is 2x for retina. */
export const MAX_WIDTH = 1600;

/** `.card__media` is aspect-ratio: 16 / 10, so the browser crops to this anyway. */
export const ASPECT = 16 / 10;

/** Hard ceiling per file. One 5 MB photograph undoes fifty small ones. */
export const MAX_BYTES = 300_000;

/**
 * The ladder walked until a result fits MAX_BYTES: widths outer, quality
 * inner. Width is reduced before quality is pushed below 62, because a
 * slightly smaller sharp photograph reads better than a full-width mushy one —
 * and roughly a dozen of the busiest pictures in the back catalogue cannot
 * reach the ceiling at 1600px however far quality is dropped.
 */
export const QUALITY_STEPS = [78, 70, 62];
export const WIDTH_STEPS = [MAX_WIDTH, 1400, 1200, 1024];

export const EXT = '.webp';

/**
 * The size a source should become: never wider than MAX_WIDTH, never wider
 * than the source itself, and never taller than the source can fill at 16:10.
 * That last term is what stops a 1400x642 image being stretched to 1400x875.
 */
export function targetSize(width, height) {
  const w = Math.min(MAX_WIDTH, width, Math.round(height * ASPECT));
  return { width: w, height: Math.round(w / ASPECT) };
}

/** Is a stored file already what the standard asks for? */
export function conforms({ file, width, height, bytes }) {
  const problems = [];
  if (!file.endsWith(EXT)) problems.push(`not ${EXT}`);
  if (width > MAX_WIDTH) problems.push(`${width}px wide, max ${MAX_WIDTH}`);
  if (bytes > MAX_BYTES) problems.push(`${Math.round(bytes / 1024)} kB, max ${Math.round(MAX_BYTES / 1024)}`);
  // One pixel of slack: 16:10 of an odd width does not land on an integer.
  if (Math.abs(width / height - ASPECT) > ASPECT / Math.min(width, height) + 1e-9) {
    problems.push(`${width}x${height} is not 16:10`);
  }
  return problems;
}

/**
 * Read a WebP's dimensions from its header. No dependencies, because CI uses
 * this and CI does not install any.
 *
 * Handles all three container variants: VP8 (lossy), VP8L (lossless) and VP8X
 * (extended, used when the file carries an alpha or metadata chunk).
 */
export function probeWebp(buf) {
  if (buf.length < 30) return null;
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null;

  const fourcc = buf.toString('ascii', 12, 16);

  if (fourcc === 'VP8 ') {
    // Key-frame start code, then 14-bit width and height.
    if (buf[23] !== 0x9d || buf[24] !== 0x01 || buf[25] !== 0x2a) return null;
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }

  if (fourcc === 'VP8L') {
    if (buf[20] !== 0x2f) return null;
    const bits = buf.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }

  if (fourcc === 'VP8X') {
    // Canvas size, stored as three-byte little-endian values minus one.
    const read24 = (o) => buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16);
    return { width: read24(24) + 1, height: read24(27) + 1 };
  }

  return null;
}

/**
 * Turn any source image into the standard: cropped to 16:10 from the centre
 * (matching object-fit: cover, so nothing moves on the page), never enlarged,
 * metadata stripped, and encoded down the quality ladder until it fits the
 * byte ceiling.
 *
 * Returns the buffer and what it became. Throws if even the lowest quality
 * step cannot fit, because a picture that big is the wrong picture.
 */
export async function normalise(input) {
  const { default: sharp } = await import('sharp');

  const meta = await sharp(input).metadata();
  if (!meta.width || !meta.height) throw new Error('could not read image dimensions');
  const full = targetSize(meta.width, meta.height);

  /* Candidate widths, never above what this source can actually give. */
  const widths = [...new Set(WIDTH_STEPS.filter((w) => w <= full.width))];
  if (!widths.length) widths.push(full.width);

  let last;
  for (const w of widths) {
    const height = Math.round(w / ASPECT);
    const resized = sharp(input)
      .resize(w, height, { fit: 'cover', position: 'centre' })
      .toColourspace('srgb');

    for (const quality of QUALITY_STEPS) {
      const data = await resized.clone().webp({ quality, effort: 5 }).toBuffer();
      last = { data, quality, width: w, height };
      if (data.length <= MAX_BYTES) {
        return { data, width: w, height, bytes: data.length, quality, source: meta.format };
      }
    }
  }

  throw new Error(
    `cannot reach ${Math.round(MAX_BYTES / 1024)} kB: ` +
      `${Math.round(last.data.length / 1024)} kB at ${last.width}px quality ${last.quality}`
  );
}
