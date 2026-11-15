/** Fetch and compare source content. A failed fetch can never confirm a fact. */
import { createHash } from 'node:crypto';
import http from 'node:http';
import https from 'node:https';
import { createGunzip, createInflate, createBrotliDecompress } from 'node:zlib';
import { decodeEntities, pageTitle } from './html-text.mjs';

// Version the normalization as well as the content: an older algorithm is not
// evidence that this year's source is unchanged.
export const FINGERPRINT_VERSION = 2;
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const HIDDEN = new Set(['head', 'script', 'style', 'noscript', 'template', 'svg', 'canvas', 'nav', 'footer']);
const BLOCK = /^(?:address|article|aside|blockquote|br|dd|div|dl|dt|fieldset|figcaption|figure|form|h[1-6]|header|hr|li|main|ol|p|pre|section|table|tbody|td|tfoot|th|thead|tr|ul)$/;
const NOISE = /(?:^|[\s_-])(?:cookie|cookies|consent|carousel|rotator|rotating|slideshow|advertisement|advert|live-clock|current-time|session-token|csrf-token)(?:[\s_-]|$)/i;
const tokens = (html) => String(html || '').match(/<!--[\s\S]*?-->|<![^>]*>|<\/?[a-z][^>]*>|[^<]+|</gi) || [];
const attr = (tag, name) => {
  const m = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(tag);
  return m ? m[1] ?? m[2] ?? m[3] ?? '' : '';
};
const TRACKING = /^(?:utm_.*|gclid|fbclid|dclid|msclkid|mc_eid|_ga|session(?:id|token)?|sid|jsessionid|phpsessid|csrf(?:token)?|token|nonce|timestamp|cachebuster|_)$/i;
function linkDestination(href) {
  if (!href || /^(?:#|mailto:|tel:|javascript:|data:)/i.test(href)) return '';
  try {
    const absolute = /^(?:https?:)?\/\//i.test(href);
    const url = new URL(decodeEntities(href), 'https://source.invalid/');
    url.hash = '';
    url.pathname = url.pathname.replace(/;jsessionid=[^/;]*/gi, '');
    for (const key of [...url.searchParams.keys()]) if (TRACKING.test(key)) url.searchParams.delete(key);
    url.searchParams.sort();
    return absolute ? url.href : url.pathname + url.search;
  } catch { return href; }
}

/** Primary visible content, with navigation and explicitly dynamic UI removed.
 * Admission dates, tuition, ordinary <time> elements and update notices remain.
 * We only mask machine timestamps when labelled as request/render-time noise.
 */
export function normalizePage(html) {
  const all = tokens(html);
  const hasMain = all.some(t => /^<(?:main)\b/i.test(t) || /^<[a-z]/i.test(t) && attr(t, 'role') === 'main');
  const stack = [];
  const output = [];
  let mainDepth = 0;
  for (const token of all) {
    if (/^<!--|^<!/.test(token)) continue;
    const close = /^<\/([a-z][\w:-]*)\b/i.exec(token);
    if (close) {
      const name = close[1].toLowerCase();
      const i = stack.findLastIndex(x => x.name === name);
      if (i < 0) continue;
      const entries = stack.splice(i);
      if (entries.some(x => x.main)) mainDepth--;
      if (BLOCK.test(name)) output.push('\n');
      continue;
    }
    const open = /^<([a-z][\w:-]*)\b/i.exec(token);
    if (open) {
      const name = open[1].toLowerCase();
      const isMain = name === 'main' || attr(token, 'role').toLowerCase() === 'main';
      const inherited = stack.at(-1)?.hidden || false;
      const hidden = inherited || HIDDEN.has(name) ||
        /\shidden(?:\s|=|>)/i.test(token) || attr(token, 'aria-hidden').toLowerCase() === 'true' ||
        NOISE.test(`${attr(token, 'class')} ${attr(token, 'id')}`) ||
        ['navigation', 'contentinfo'].includes(attr(token, 'role').toLowerCase());
      if (BLOCK.test(name) && !hidden) output.push('\n');
      // A replacement PDF or admissions destination matters even if the author
      // kept the same anchor text. Tracking/session parameters do not.
      if (name === 'a' && !hidden && (!hasMain || mainDepth)) {
        const destination = linkDestination(attr(token, 'href'));
        if (destination) output.push(`[link: ${destination}]`);
      }
      if (!VOID.has(name) && !/\/\s*>$/.test(token)) {
        stack.push({ name, hidden, main: isMain });
        if (isMain) mainDepth++;
      }
      continue;
    }
    // A page title may sit above <main>; it can carry the admission year.
    if (!stack.at(-1)?.hidden && (!hasMain || mainDepth || stack.some(node => node.name === 'h1'))) output.push(token);
  }
  return decodeEntities(output.join(' '))
    .normalize('NFKC')
    .replace(/[\u00ad\u200b-\u200d\ufeff]/g, '')
    .replace(/\b(session[\s_-]?(?:id|token)|csrf[\s_-]?token|request[\s_-]?id|nonce)\s*[:=]\s*[^\s]+/gi, '$1 [dynamic]')
    .replace(/\b((?:page )?(?:generated|rendered|served)|server time|current time|request time)\s*(?:at|on|:)\s*\d{4}-\d\d-\d\d[T ][\d:.]+(?:\s*(?:Z|UTC|GMT|[+-]\d\d:?\d\d))?/gi, '$1 [dynamic]')
    .replace(/[ \t\r\f\v]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim()
    .toLowerCase();
}

export function fingerprint(text) {
  return createHash('sha256').update(text).digest('hex');
}

const SOFT_404 = /\b404\b|page (?:not found|cannot be found|can['’]t be found|does not exist|no longer exists|introuvable)|(?:the )?(?:requested )?page (?:you (?:are|were) looking for )?(?:could not|cannot|can['’]t) be found|file not found|seite (?:nicht gefunden|wurde nicht gefunden)|pagina (?:niet gevonden|non trovata)|página (?:no encontrada|não encontrada)|siden (?:findes ikke|blev ikke fundet)|sidan kan inte hittas|nie znaleziono strony|stránka nebyla nalezena/i;
const BODY_404 = /^(?:sorry[,!.\s]*|oops[,!.\s]*)?(?:(?:the )?(?:requested )?(?:web ?)?page (?:you (?:are|were) looking for )?(?:was not found|is not found|could not be found|cannot be found|does not exist|is no longer available)|we (?:could not|cannot|can['’]t) find (?:the|this) page|nothing (?:was )?found|not found)(?:[.!\s]|$)/im;
const CHALLENGE = /just a moment|attention required|checking your browser|access denied|human verification|are you a robot|you have been blocked|enable javascript and cookies|pardon our interruption|request unsuccessful.*incapsula/i;
const compact = (s) => decodeEntities(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const heading = (html) => compact(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1] || '');
const home = (u) => /^\/(?:(?:[a-z]{2}(?:-[a-z]{2})?)\/)?(?:(?:home|index|default)(?:\.(?:html?|aspx?|php))?\/?)?$/i.test(u.pathname);
const search = (u) => /(?:^|\/)(?:search|search-results|searchresults|suche|zoeken|sog|søg)(?:\.(?:html?|aspx?|php))?(?:\/|$)/i.test(u.pathname) || ['s', 'search', 'searchTerm', 'searchquery'].some(k => u.searchParams.has(k));

function wrongRedirect(url, finalUrl) {
  try {
    const from = new URL(url), to = new URL(finalUrl || url);
    if (from.pathname.replace(/\/$/, '') === to.pathname.replace(/\/$/, '') && from.search === to.search) return null;
    if (!home(from) && home(to)) return 'redirected from a specific page to a homepage';
    if (!search(from) && search(to)) return 'redirected to a search page';
  } catch { return 'invalid source or redirect URL'; }
  return null;
}

/** Conservative verdicts: unverified pages stay in the work list, never carry. */
export function inspectPage({ url, finalUrl = url, status, html = '', contentType = 'text/html' }) {
  const base = { finalUrl, httpStatus: status };
  if (status === 404 || status === 410) return { ...base, status: 'broken', reason: `HTTP ${status}` };
  if (!(status >= 200 && status < 300)) return { ...base, status: 'unverified', reason: `HTTP ${status || 'unavailable'}` };
  const redirectReason = wrongRedirect(url, finalUrl);
  if (redirectReason) return { ...base, status: 'broken', reason: redirectReason };
  if (!/text\/(?:html|plain)|application\/xhtml\+xml/i.test(contentType)) return { ...base, status: 'unverified', reason: `unsupported content type: ${contentType || 'unknown'}` };
  const text = /text\/plain/i.test(contentType) ? String(html).trim() : normalizePage(html);
  const title = /text\/plain/i.test(contentType) ? '' : pageTitle(html);
  const h1 = heading(html);
  if (SOFT_404.test(`${title}\n${h1}`) || BODY_404.test(text)) return { ...base, status: 'broken', reason: '200 response contains a not-found page', text, title };
  if (CHALLENGE.test(`${title}\n${h1}\n${text.slice(0, 300)}`)) return { ...base, status: 'unverified', reason: 'robot challenge or access wall', text, title };
  if (text.length < 80) return { ...base, status: 'unverified', reason: 'too little readable content to confirm the source (possibly a JavaScript shell)', text, title };
  return { ...base, status: 'ok', text, title, hash: fingerprint(text), kind: 'text' };
}

const MAX_BYTES = 12 * 1024 * 1024;
const REDIRECT = new Set([301, 302, 303, 307, 308]);
const USER_AGENT = 'IB-Pathways-Refresh/1.0 (+https://github.com/RktRobinhood/IB-Post-Secondary-Opportunities; educational, non-commercial)';

/** Core HTTP keeps malformed/aborted responses inside a per-source verdict.
 * Node's bundled fetch parser can assert outside its promise on some university
 * TLS responses. No response is allowed to crash the full annual comparison.
 */
function requestPage(url, { deadline, timeoutMs, maxBytes }) {
  const target = new URL(url);
  return new Promise((resolve, reject) => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) { reject(new Error(`request timed out after ${timeoutMs} ms`)); return; }
    let request, response, decoder, settled = false;
    const timer = setTimeout(() => finish(new Error(`request timed out after ${timeoutMs} ms`)), remaining);
    function finish(error, result) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) {
        decoder?.destroy(); response?.destroy(); request?.destroy();
        reject(error);
      } else resolve(result);
    }
    const client = target.protocol === 'https:' ? https : http;
    request = client.get(target, {
      agent: false,
      headers: {
        'user-agent': USER_AGENT,
        accept: 'text/html,application/xhtml+xml,application/pdf,text/plain;q=0.9,*/*;q=0.5',
        'accept-encoding': 'identity', connection: 'close',
      },
    }, res => {
      response = res;
      res.on('error', error => finish(error));
      res.on('aborted', () => finish(new Error('response ended before the complete body was received')));
      res.on('close', () => { if (!res.complete && !settled) finish(new Error('response socket closed before completion')); });
      const result = { httpStatus: res.statusCode, headers: res.headers, finalUrl: url };
      if (REDIRECT.has(res.statusCode) && res.headers.location) {
        finish(null, { ...result, location: res.headers.location });
        res.destroy();
        return;
      }
      const contentType = res.headers['content-type'] || '';
      // A status or unsupported media type needs no potentially unbounded body.
      if (!(res.statusCode >= 200 && res.statusCode < 300) || !/text\/(?:html|plain)|application\/(?:xhtml\+xml|pdf|octet-stream)/i.test(contentType)) {
        finish(null, { ...result, bytes: Buffer.alloc(0) });
        res.destroy();
        return;
      }
      if (Number(res.headers['content-length']) > maxBytes) { finish(new Error(`response exceeds ${maxBytes} byte limit`)); return; }
      const encoding = String(res.headers['content-encoding'] || 'identity').trim().toLowerCase();
      if (encoding === 'gzip' || encoding === 'x-gzip') decoder = createGunzip();
      else if (encoding === 'deflate') decoder = createInflate();
      else if (encoding === 'br') decoder = createBrotliDecompress();
      else if (encoding !== 'identity') { finish(new Error(`unsupported content encoding: ${encoding}`)); return; }
      const body = decoder || res;
      const chunks = [];
      let wireBytes = 0, decodedBytes = 0;
      res.on('data', chunk => {
        wireBytes += chunk.length;
        if (wireBytes > maxBytes) finish(new Error(`response exceeds ${maxBytes} byte limit`));
      });
      body.on('data', chunk => {
        decodedBytes += chunk.length;
        if (decodedBytes > maxBytes) finish(new Error(`decoded response exceeds ${maxBytes} byte limit`));
        else chunks.push(chunk);
      });
      body.on('error', error => finish(error));
      body.on('end', () => finish(null, { ...result, bytes: Buffer.concat(chunks) }));
      if (decoder) res.pipe(decoder);
    });
    request.on('error', error => finish(error));
    request.setTimeout(remaining, () => finish(new Error(`request timed out after ${timeoutMs} ms`)));
  });
}

/** One uncached GET with bounded redirects, time and decoded response size. */
export async function fetchSource(url, { timeoutMs = 15000, maxBytes = MAX_BYTES, maxRedirects = 8 } = {}) {
  let finalUrl = url;
  try {
    if (!/^https?:\/\//i.test(url)) return { status: 'unverified', reason: 'source is not an HTTP(S) URL', finalUrl: url };
    const deadline = Date.now() + timeoutMs;
    let res;
    for (let hops = 0; ; hops++) {
      res = await requestPage(finalUrl, { deadline, timeoutMs, maxBytes });
      if (!res.location) break;
      if (hops >= maxRedirects) throw new Error(`more than ${maxRedirects} redirects`);
      finalUrl = new URL(res.location, finalUrl).href;
      if (!/^https?:\/\//i.test(finalUrl)) throw new Error('redirect is not an HTTP(S) URL');
    }
    const contentType = res.headers['content-type'] || '';
    // PDFs are compared as bytes, never decoded as HTML or counted as empty.
    // Metadata changes can cause a conservative changed verdict, which is safe.
    if (res.httpStatus >= 200 && res.httpStatus < 300 && /application\/(?:pdf|octet-stream)/i.test(contentType)) {
      const bytes = res.bytes;
      const redirectReason = wrongRedirect(url, finalUrl);
      if (redirectReason) return { status: 'broken', reason: redirectReason, finalUrl, httpStatus: res.httpStatus };
      if (bytes.subarray(0, 5).toString() === '%PDF-') return { status: 'ok', hash: fingerprint(bytes), text: '[PDF document: compare the linked source visually when changed]', kind: 'pdf', finalUrl, httpStatus: res.httpStatus };
      return { status: 'unverified', reason: `unsupported or invalid binary source: ${contentType}`, finalUrl, httpStatus: res.httpStatus };
    }
    const charset = /charset\s*=\s*["']?([^;\s"']+)/i.exec(contentType)?.[1] || 'utf-8';
    const html = new TextDecoder(charset).decode(res.bytes);
    return inspectPage({ url, finalUrl, status: res.httpStatus, html, contentType });
  } catch (error) {
    return { status: 'unverified', finalUrl, reason: `fetch failed: ${error.message}` };
  }
}
