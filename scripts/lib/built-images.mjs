/** Image addresses the browser may load, including deferred hero slides and card JSON. */
import { decodeEntities } from './html-text.mjs';

export const localImage = (src) => typeof src === 'string' && /^\/(?!\/)[^\s]+$/.test(src);
const attr = (tag, name) => decodeEntities(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i').exec(tag)?.[1] || '');
export const srcsetImages = (set) => String(set || '').split(',').map(v => v.trim().split(/\s+/)[0]).filter(Boolean);

/** One entry per image element; srcset alternatives belong to that same photograph. */
export function imageElements(markup) {
  return [...String(markup).matchAll(/<img\b[^>]*>/gi)].map(([tag]) => ({ src: attr(tag, 'src'), variants: srcsetImages(attr(tag, 'srcset')), tag }));
}

/** Find remote sources in HTML and the JSON used to create images later. */
export function remoteImages(markup) {
  const bad = [];
  const check = (src) => { if (src && !localImage(src)) bad.push(src); };
  for (const { src, variants } of imageElements(markup)) { check(src); variants.forEach(check); }
  for (const [tag] of String(markup).matchAll(/<source\b[^>]*>/gi)) srcsetImages(attr(tag, 'srcset')).forEach(check);
  const inspect = (value) => {
    if (typeof value === 'string' && /<img\b/.test(value)) bad.push(...remoteImages(value));
    else if (Array.isArray(value)) value.forEach(inspect);
    else if (value && typeof value === 'object') {
      if (typeof value.src === 'string') check(value.src);
      Object.values(value).forEach(inspect);
    }
  };
  for (const [, encoded] of String(markup).matchAll(/\bdata-slides="([^"]*)"/g)) inspect(JSON.parse(decodeEntities(encoded)));
  for (const [, json] of String(markup).matchAll(/<script\b[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/g)) inspect(JSON.parse(json));
  return [...new Set(bad)];
}
