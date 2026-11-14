import { raw } from '../lib/html.mjs';
import { page, url } from '../lib/layout.mjs';
import { recognitionGuideTokens } from '../lib/recognition-guide.mjs';

/** Authored country guide HTML stays in country data. Root-relative links and
 * stored photographs follow the same deployment base as every other page. */
export function countryContent(content, tokens = {}) {
  const text = typeof content === 'string' ? content : content?.html || '';
  return raw(text.replace(/\{\{([\w.]+)\}\}/g, (all, key) => {
    if (!(key in tokens)) throw new Error(`Unknown country guide token: ${key}`);
    return tokens[key];
  }).replace(/\b(href|src|srcset)="(\/(?!\/)[^"]*)"/g, (_, attr, value) => `${attr}="${attr === 'srcset' ? value.split(',').map((item) => item.trim().replace(/^\S+/, (src) => url(src))).join(', ') : url(value)}"`));
}

export function countryGuide(site, country, guide) {
  const tokens = guide.recognition ? recognitionGuideTokens(site, guide.recognition) : {};
  return page({
    title: guide.title,
    description: guide.description,
    path: guide.path,
    section: country.href,
    scripts: guide.scripts || [],
    body: countryContent((guide.sections || []).map((s) => typeof s === 'string' ? s : s.html).join('\n'), tokens),
  });
}
