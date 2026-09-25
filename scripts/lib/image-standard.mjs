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
export const WIDTH_STEPS = [MAX_WIDTH, 1400, 1200, 1024, 896, 768];

export const EXT = '.webp';

/**
 * The size a source should become: never wider than MAX_WIDTH, never wider
 * than the source itself, and never taller than the source can fill at 16:10.
 * That last term is what stops a 1400x642 image being stretched to 1400x875.
 */
export function targetSize(width, height, maxWidth = MAX_WIDTH) {
  const w = Math.min(maxWidth, MAX_WIDTH, width, Math.round(height * ASPECT));
  return { width: w, height: Math.round(w / ASPECT) };
}

/**
 * Is a stored file already what the standard asks for?
 *
 * Returns `{ kind, message }` rather than bare strings so a caller can treat
 * the categories differently. check.mjs does: format, width and ratio are
 * build failures, because they are always fixable by re-running the converter;
 * `bytes` is only a warning, because a photograph that will not compress
 * cannot be fixed by any tool and a gate nobody can clear gets switched off.
 */
export function conforms({ file, width, height, bytes }) {
  const problems = [];
  const add = (kind, message) => problems.push({ kind, message });

  if (!file.endsWith(EXT)) add('format', `not ${EXT}`);
  if (width > MAX_WIDTH) add('width', `${width}px wide, max ${MAX_WIDTH}`);
  if (bytes > MAX_BYTES) {
    add('bytes', `${Math.round(bytes / 1024)} kB, over the ${Math.round(MAX_BYTES / 1024)} kB ceiling`);
  }
  // One pixel of slack: 16:10 of an odd width does not land on an integer.
  if (Math.abs(width / height - ASPECT) > ASPECT / Math.min(width, height) + 1e-9) {
    add('ratio', `${width}x${height} is not 16:10`);
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
 * Returns the buffer and what it became. If the ladder runs out it returns the
 * smallest candidate it produced, flagged `overBudget`, rather than throwing —
 * see the note at the bottom of this function for why that matters.
 */
export async function normalise(input, { maxWidth } = {}) {
  const { default: sharp } = await import('sharp');

  const meta = await sharp(input).metadata();
  if (!meta.width || !meta.height) throw new Error('could not read image dimensions');
  const full = targetSize(meta.width, meta.height, maxWidth);

  /* Candidate widths, never above what this source can actually give. A
     smaller use (a card background, `maxWidth`) starts from its own width
     and then walks the same ladder below it. Without `maxWidth` this is
     unchanged. */
  const widths = maxWidth
    ? [...new Set([full.width, ...WIDTH_STEPS.filter((w) => w < full.width)])]
    : [...new Set(WIDTH_STEPS.filter((w) => w <= full.width))];
  if (!widths.length) widths.push(full.width);

  let best;
  for (const w of widths) {
    const height = Math.round(w / ASPECT);
    const resized = sharp(input)
      .resize(w, height, { fit: 'cover', position: 'centre' })
      .toColourspace('srgb');

    for (const quality of QUALITY_STEPS) {
      const data = await resized.clone().webp({ quality, effort: 5 }).toBuffer();
      if (!best || data.length < best.data.length) best = { data, quality, width: w, height };
      if (data.length <= MAX_BYTES) {
        return { data, width: w, height, bytes: data.length, quality, source: meta.format };
      }
    }
  }

  /* The ladder ran out. Hand back the smallest candidate anyway, flagged.
     This used to throw, and throwing was wrong: the caller then kept the
     ORIGINAL file, which is invariably larger than the WebP we just declined
     to write. A rule meant to hold page weight down was making the page
     heavier and leaving behind a format the checker fails on — a gate that
     cannot be cleared is a gate someone eventually switches off.
     Reported loudly by optimize-images.mjs and warned about by check.mjs;
     the real fix is a human choosing a less punishing photograph. */
  return {
    data: best.data,
    width: best.width,
    height: best.height,
    bytes: best.data.length,
    quality: best.quality,
    source: meta.format,
    overBudget: true,
  };
}

/**
 * A smaller copy of an already-normalised WebP, for a `srcset`. It is the same
 * 16:10 picture at a narrower width, never enlarged. It is written next to its
 * parent and described on the parent's record as `variants`. It is not a
 * picture of its own and carries no credit or review: those belong to the
 * parent.
 */
export async function variant(stored, width) {
  const { default: sharp } = await import('sharp');
  const meta = await sharp(stored).metadata();
  const w = Math.min(width, meta.width);
  const height = Math.round(w / ASPECT);
  const data = await sharp(stored).resize(w, height, { fit: 'cover', position: 'centre' }).webp({ quality: 72, effort: 5 }).toBuffer();
  return { data, width: w, height, bytes: data.length };
}
