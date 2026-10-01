/**
 * A degree photo the institution publishes itself, checked before it is
 * recorded (docs/IMAGE_STANDARD.md, "Official institution images are
 * hotlinked, not hosted").
 *
 * Where Commons has nothing that shows a discipline, a research line may name
 * instead an image on the institution's own server (`officialUrl`) and the
 * institution's page that publishes it (`sourcePage`): normally the programme
 * page, else its press or media bank. The site links to that image and copies
 * nothing, so the only checks there are happen here, once, when the line is
 * imported:
 *
 *   - the image answers 200, from that address, with an image content type;
 *   - it is at least MIN_WIDTH wide (read from its header in memory, then
 *     dropped) and no heavier than OFFICIAL_MAX_BYTES;
 *   - `sourcePage` names it, the same address or the same path, as its
 *     og:image or twitter:image or in an <img>/<source> src or srcset. That is
 *     the proof the institution publishes it there.
 *
 * `fetch` can be passed in, so the guard can run all of this against fixtures
 * without the network (scripts/test-programme-images.mjs).
 */
import sharp from 'sharp';
import { OFFICIAL_MAX_BYTES } from '../../src/lib/data.mjs';

/**
 * The narrowest official photograph accepted. A card is ~400 CSS px wide, so
 * 720 px covers it at 1.8x. It was 960 (2x, as a Commons master); the owner
 * decided on 1 October 2026 that the university's own picture beats the
 * designed placeholder, and many programme pages publish theirs at 720-900 px.
 */
export const MIN_WIDTH = 720;

/** Names the project; Commons and some institution servers answer a generic agent with 429. */
export const UA = { 'User-Agent': 'ib-pathways/1.0 (IB Pathways Europe, school guidance site; degree-photo check) contact-via-github' };

/** What a record says about its licence: nothing is licensed to us, the institution's own page is linked. */
export const OFFICIAL_LICENCE = 'Published by the institution on its own page; linked, not copied.';

/** An attribute value as a URL: entities undone until they stop changing (some sites double-escape `&amp;amp;`). */
function unescape(value) {
  let out = String(value).trim();
  for (let i = 0; i < 4; i++) {
    const next = out.replace(/&amp;/gi, '&').replace(/&#0*38;/g, '&').replace(/&quot;/gi, '"').replace(/&#0*39;|&apos;/gi, "'");
    if (next === out) break;
    out = next;
  }
  return out;
}

/** Every image a page names as its share image or draws in an <img>, a <source> or a CSS background, as absolute URLs. */
export function imagesOn(html, pageUrl) {
  const out = new Set();
  const add = (v) => { try { out.add(new URL(unescape(v), pageUrl).href); } catch {} };
  for (const [tag] of String(html).matchAll(/<meta\b[^>]*>/gi)) {
    if (!/\b(?:property|name)\s*=\s*["'](?:og:image(?::url|:secure_url)?|twitter:image(?::src)?)["']/i.test(tag)) continue;
    const c = /\bcontent\s*=\s*["']([^"']+)["']/i.exec(tag);
    if (c) add(c[1]);
  }
  for (const [tag] of String(html).matchAll(/<(?:img|source)\b[^>]*>/gi)) {
    // Lazy loaders keep the real address in data-src / data-srcset.
    for (const [, name, value] of tag.matchAll(/\s(?:data-)?(src|srcset)\s*=\s*["']([^"']+)["']/gi)) {
      if (name.toLowerCase() === 'src') { add(value); continue; }
      // A candidate's URL may itself hold commas (a CDN's w_400,h_300), so
      // read the list both ways; an extra candidate cannot make a false match.
      const list = unescape(value);
      for (const part of [...list.split(/,\s+/), ...list.split(',')]) add(part.trim().split(/\s+/)[0]);
    }
  }
  // A hero drawn as a CSS background, inline or through a lazy loader's
  // data-bg, is the page showing that picture as much as an <img> is.
  for (const [, value] of String(html).matchAll(/background(?:-image)?\s*:\s*url\(\s*(?:&quot;|["'])?([^"')&]+(?:&amp;[^"')&]+)*)(?:&quot;|["'])?\s*\)/gi)) add(value);
  for (const [, value] of String(html).matchAll(/\sdata-(?:bg|background|background-image)\s*=\s*["']([^"']+)["']/gi)) add(value.replace(/^url\(\s*["']?|["']?\s*\)$/g, ''));
  return [...out];
}

const pathOf = (u) => { try { return decodeURIComponent(new URL(u).pathname); } catch { return null; } };

/** The address on the page that is this image (the same URL, or the same path under another host or query), or null. */
export function publishedOn(html, pageUrl, imageUrl) {
  let want;
  try { want = new URL(imageUrl).href; } catch { return null; }
  const path = pathOf(want);
  return imagesOn(html, pageUrl).find((c) => c === want || (path && path.length > 1 && pathOf(c) === path)) || null;
}

/**
 * Check one research line. Returns `{ problems }`, and when there are none,
 * also `{ width, height, bytes, type }` for the record.
 */
export async function verifyOfficial({ officialUrl, sourcePage }, { fetch: get = globalThis.fetch, maxBytes = OFFICIAL_MAX_BYTES, minWidth = MIN_WIDTH } = {}) {
  const problems = [];
  if (!/^https:\/\/[^/]/.test(officialUrl || '')) problems.push(`officialUrl "${officialUrl || ''}" is not an https address`);
  if (!/^https:\/\/[^/]/.test(sourcePage || '')) problems.push(`sourcePage "${sourcePage || ''}" is not an https address`);
  if (problems.length) return { problems };

  let image = null;
  try {
    const res = await get(officialUrl, { headers: UA, redirect: 'follow' });
    const type = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    const declared = Number(res.headers.get('content-length'));
    // What is linked is what is served: a redirect is recorded as where it lands.
    if (res.redirected && res.url && res.url !== officialUrl) problems.push(`the image redirects to ${res.url}; name that address`);
    else if (res.status !== 200) problems.push(`the image answers ${res.status}`);
    else if (!/^image\//.test(type) || /svg/.test(type)) problems.push(`the image is served as "${type || 'no content type'}", not a photograph`);
    else if (declared > maxBytes) problems.push(`the image is ${declared} bytes; the ceiling is ${maxBytes}`);
    else {
      const buf = Buffer.from(await res.arrayBuffer());
      const meta = await sharp(buf).metadata();
      // EXIF orientations 5-8 are drawn turned a quarter.
      const turned = (meta.orientation || 1) >= 5;
      image = { width: turned ? meta.height : meta.width, height: turned ? meta.width : meta.height, bytes: buf.length, type };
      if (image.bytes > maxBytes) problems.push(`the image is ${image.bytes} bytes; the ceiling is ${maxBytes}`);
      if (!(image.width >= minWidth)) problems.push(`the image is ${image.width} px wide; at least ${minWidth} is needed`);
    }
  } catch (e) {
    problems.push(`the image could not be read: ${e.message}`);
  }

  try {
    const res = await get(sourcePage, { headers: { ...UA, Accept: 'text/html,application/xhtml+xml' }, redirect: 'follow' });
    if (res.status !== 200) problems.push(`the source page answers ${res.status}`);
    else if (!publishedOn(await res.text(), res.url || sourcePage, officialUrl)) {
      problems.push('the source page does not show the image (og:image, twitter:image or an img/srcset)');
    }
  } catch (e) {
    problems.push(`the source page could not be read: ${e.message}`);
  }

  return problems.length ? { problems } : { problems, ...image };
}
