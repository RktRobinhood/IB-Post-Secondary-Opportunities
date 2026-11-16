/** Local discipline photographs. Reuse is allowed across pages; a school’s
 * cards draw distinct photos, and the finder deals photos within each page. */
import { publishable } from './imagery.mjs';
import { schoolCardGroups } from './families.mjs';

export const FALLBACK_SCOPE = 'field:interdisciplinary';
export const VEIL = {
  light: { top: 0.08, text: 0.84, foot: 0.94, dim: 1 },
  dark: { top: 0.12, text: 0.86, foot: 0.93, dim: 0.85 },
};
const identity = r => r.page || r.src;
const hash = value => [...String(value)].reduce((h,c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);

export function shape(r, key = r.key) {
  return {
    key, src: r.src, identity: identity(r), scope: r.scope, width: r.width, height: r.height,
    alt: r.description || r.subject || '',
    ...(r.focus ? { focus: r.focus } : {}),
    illustrative: !!r.illustrative,
    credit: { text: `${r.illustrative ? 'Illustrative photo · ' : ''}${r.author} · ${r.licence}`, url: r.page },
    srcset: [...(r.variants || []), { src: r.src, width: r.width }]
      .filter(v => v.src && v.width).sort((a,b) => a.width - b.width)
      .map(({src,width}) => ({src,width})),
  };
}

/** Pools are discipline first, then suitable reading/study photos from data.
 * A record may name related fields, so sharing never depends on a school name. */
export function photoPools(records) {
  const pools = {};
  for (const [key,r] of Object.entries(records || {}).sort(([a],[b])=>a.localeCompare(b))) {
    if (!publishable(r)) continue;
    const fields = [...new Set([r.field || (r.scope?.startsWith('field:') ? r.scope.slice(6) : null), ...(r.fields || [])].filter(Boolean))];
    for(const field of fields) (pools[field] ||= []).push({...r,key});
  }
  return Object.fromEntries(Object.entries(pools).map(([field,list]) => [field,
    [...new Map(list.map(r=>[identity(r),r])).values()].map(r=>shape(r))]));
}

/** Select a photo without repeating a source already used on this page. */
export function choosePhoto(preferred, field, used, pools, seed = '') {
  const take = photo => { used.add(photo.src); used.add(photo.identity); return photo; };
  const free = photo => !used.has(photo.src) && !used.has(photo.identity);
  if(preferred && free(preferred)) return take(preferred);
  const list = pools[field] || pools.interdisciplinary || [];
  const offset = hash(seed) % Math.max(list.length,1);
  for(let n=0;n<list.length;n++) { const r=list[(offset+n)%list.length]; if(free(r)) return take(r); }
  throw new Error(`No distinct stored photo for ${field || 'unknown field'} (${seed})`);
}

/** Assign by degree family, with a separate deal for each university. */
export function programmePhotos(records, institutions, places = {}) {
  const pools=photoPools(records), byScope=new Map(), result=new Map();
  for(const [key,r] of Object.entries(records || {})) if(publishable(r)) byScope.set(r.scope,shape(r,key));
  for(const inst of institutions) {
    const place = [inst.key, ...(inst.aliases || []), inst.key.replace(/^[a-z]{2}-/,'')].map(key=>places[key]).find(Boolean);
    const used=new Set([place,...(place?.gallery||[])].filter(Boolean).flatMap(r=>[r.src,identity(r)]));
    for(const {members} of schoolCardGroups(inst.programmes)) {
      const p=members.find(x=>x.family?.primary)||members[0];
      const own=members.map(m=>byScope.get(`programme:${m.id}`)||byScope.get(`school:${inst.key}-${m.slug}`)).find(b=>b&&!used.has(b.src)&&!used.has(b.identity));
      const b=choosePhoto(own,p.field,used,pools,inst.key+p.slug);
      for(const member of members) result.set(member.href,b);
    }
  }
  return { pools, get: href => result.get(href) || null };
}

/** A backdrop's srcset attribute, with each path passed through `url`. */
export function srcsetOf(backdrop, url = (s) => s) {
  return (backdrop?.srcset || []).filter(v=>v.src && Number.isFinite(v.width)).map((v) => `${url(v.src)} ${v.width}w`).join(', ');
}

/**
 * The `sizes` a card background is drawn at. A grid card is at most about
 * 400 px wide on a desktop, half the viewport on a tablet, and the full width
 * on a phone. A finder row is the full width.
 */
export const CARD_SIZES = '(min-width: 66rem) 400px, (min-width: 44rem) 50vw, calc(100vw - 2rem)';
export const ROW_SIZES = '100vw';

/* --- Contrast, for the guard and anyone checking a colour ---------------- */

const channel = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
export function luminance([r, g, b]) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
export function hex(h) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(h).trim());
  if (!m) throw new Error(`not a six-digit hex colour: ${h}`);
  return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
}
/** The colour a veil of `paper` at `alpha` makes over a photograph pixel. The browser composites in sRGB. */
export function veiled(paper, alpha, pixel) {
  return paper.map((c, i) => alpha * c + (1 - alpha) * pixel[i]);
}
/**
 * The worst-case background under text on a veiled card. For dark text that
 * is a black pixel. For pale text it is a white pixel dimmed by `dim`. The
 * text's own lightness decides which is worse.
 */
export function worstBackground(paper, alpha, text, dim = 1) {
  const pale = luminance(text) > luminance(paper);
  const pixel = pale ? [255 * dim, 255 * dim, 255 * dim] : [0, 0, 0];
  return veiled(paper, alpha, pixel);
}
