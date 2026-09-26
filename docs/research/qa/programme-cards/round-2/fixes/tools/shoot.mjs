/* Before/after shots and measurements for the round-2 card and home fixes.
   ORIGIN=http://localhost:4370 BASEPATH= TAG=after node shoot.mjs
   Writes <TAG>-*.png/jpg and <TAG>-measure.json beside this folder. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { launch, sleep, OUT } from './cdp.mjs';

const TAG = process.env.TAG || 'after';
const only = (process.env.ONLY || '').split(',').filter(Boolean);
const want = (k) => !only.length || only.includes(k);
const b = await launch({ gpu: true, port: 9371 + (TAG === 'before' ? 1 : 0) });
const out = {};
const name = (n) => `${TAG}-${n}`;

const cardStats = () => b.evaluate(`(() => {
  const cards = [...document.querySelectorAll('#discover-results > li:not([hidden]) > .card')].slice(0, 12);
  return cards.map((c) => {
    const r = c.getBoundingClientRect();
    const t = (s) => c.querySelector(s)?.textContent.replace(/\\s+/g, ' ').trim() || '';
    const req = c.querySelector('.req__ib');
    const lh = req ? parseFloat(getComputedStyle(req).lineHeight) : 0;
    return { title: t('.card__title'), cred: t('.card__cred'), h: Math.round(r.height), w: Math.round(r.width),
      needsLines: req ? Math.round(req.getBoundingClientRect().height / lh) : 0,
      credLines: Math.round((c.querySelector('.card__cred')?.getBoundingClientRect().height || 0) / 19),
      tags: c.querySelectorAll('.tag').length, local: !!c.querySelector('.req__local, .req-local') };
  });
})()`);

const scrollTo = (sel, pad = 12) => b.evaluate(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return false; scrollTo(0, e.getBoundingClientRect().top + scrollY - ${pad}); return true; })()`);
const waitImgs = () => b.evaluate(`Promise.all([...document.images].filter(i => { const r = i.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }).map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 4000); })))`);

for (const dark of [false, true]) {
  const theme = dark ? 'dark' : 'light';
  if (want('home')) {
    // Desktop: the first cards.
    await b.open('/', { width: 1280, height: 800, dark });
    await sleep(800);
    await scrollTo('#prog-count', 8);
    await sleep(400); await waitImgs();
    out[`home-desktop-${theme}`] = await cardStats();
    await b.shot(name(`home-desktop-${theme}-cards`));
    await b.evaluate('scrollBy(0, 700)'); await sleep(300); await waitImgs();
    await b.shot(name(`home-desktop-${theme}-cards-2`));
    // Phone.
    await b.open('/', { width: 390, height: 844, mobile: true, dpr: 2, dark });
    await sleep(800);
    await scrollTo('#prog-count', 8);
    await sleep(400); await waitImgs();
    out[`home-phone-${theme}`] = await cardStats();
    await b.shot(name(`home-phone-${theme}-cards`));
  }
  if (want('sdu')) {
    await b.open('/universities/dk-sdu/', { width: 1280, height: 800, dark });
    await sleep(600);
    const found = await scrollTo('a[href$="/programmes/dk-sdu-electronics-sonderborg-2027-autumn/"]', 260);
    await sleep(300); await waitImgs();
    if (found) await b.shot(name(`sdu-desktop-${theme}-families`));
    await b.open('/universities/dk-sdu/', { width: 390, height: 844, mobile: true, dpr: 2, dark });
    await sleep(600);
    if (await scrollTo('a[href$="/programmes/dk-sdu-electronics-sonderborg-2027-autumn/"]', 220)) { await sleep(300); await waitImgs(); await b.shot(name(`sdu-phone-${theme}-electronics`)); }
  }
  if (want('paths')) {
    await b.open('/programmes/dk-sdu-electronics-sonderborg-2027-autumn/', { width: 390, height: 844, mobile: true, dpr: 2, dark });
    await sleep(600);
    if (await scrollTo('#paths-title', 12)) {
      await sleep(300);
      out[`paths-phone-${theme}`] = await b.evaluate(`({ pageScrollX: document.scrollingElement.scrollWidth - innerWidth,
        tableOverflow: (() => { const s = document.querySelector('.paths .table-scroll'); return s ? s.scrollWidth - s.clientWidth : null; })() })`);
      await b.shot(name(`paths-phone-${theme}`));
    }
    await b.open('/programmes/dk-sdu-electronics-sonderborg-2027-autumn/', { width: 1280, height: 800, dark });
    await sleep(600);
    if (await scrollTo('#paths-title', 12)) { await sleep(300); await b.shot(name(`paths-desktop-${theme}`)); }
  }
}

if (want('phoneflow')) {
  // Home on a phone: a door, then the pill, then the count and the first card.
  await b.open('/', { width: 390, height: 844, mobile: true, dpr: 2 });
  await sleep(1200);
  const door = await b.evaluate(`(() => { const d = document.querySelector('.preset[data-scope="here"]'); d.scrollIntoView({ block: 'center' }); const r = d.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  await sleep(400);
  await b.tap(door.x, door.y);
  await sleep(1500);
  out.phoneAfterDoor = await b.evaluate(`(() => { const p = document.querySelector('.discover__pill'); const c = document.getElementById('prog-count').getBoundingClientRect();
    return { pill: p && !p.hidden ? p.textContent : null, countOnScreen: c.top >= 0 && c.bottom <= innerHeight }; })()`);
  await b.shot(name('phone-door-here-pill'));
  const pill = await b.evaluate(`(() => { const p = document.querySelector('.discover__pill'); if (!p || p.hidden) return null; const r = p.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  if (pill) {
    await b.tap(pill.x, pill.y);
    await sleep(1500); await waitImgs();
    out.phoneAfterPill = await b.evaluate(`(() => { const c = document.getElementById('prog-count').getBoundingClientRect(); const f = document.querySelector('#discover-results > li:not([hidden]) .card').getBoundingClientRect();
      return { countTop: Math.round(c.top), firstCardTop: Math.round(f.top), bothOnScreen: c.top >= 0 && f.top < innerHeight - 60 }; })()`);
    await b.shot(name('phone-door-here-after-pill'));
  }
  // Search with no degree.
  await b.open('/?q=medicine', { width: 390, height: 844, mobile: true, dpr: 2 });
  await sleep(1200);
  await scrollTo('#prog-count', 8); await sleep(300);
  out.medicine = await b.evaluate(`document.getElementById('discover-empty')?.innerText`);
  await b.shot(name('phone-search-medicine'));
}

if (want('far')) {
  await b.open('/', { width: 1280, height: 800 });
  await sleep(800);
  await b.globeReady();
  await b.evaluate(`window.scrollTo(0, 0)`);
  await sleep(300);
  const far = await b.evaluate(`(() => { const d = document.querySelector('.preset[data-scope="far"]'); const r = d.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  await b.click(far.x, far.y);
  await sleep(4500);
  out.far = await b.evaluate(`({ count: document.getElementById('prog-count').textContent, tiles: [...document.querySelectorAll('#discover-places li:not([hidden])')].length })`);
  await b.shot(name('desktop-door-far'));
  await scrollTo('#prog-count', 8); await sleep(500); await waitImgs();
  await b.shot(name('desktop-door-far-results'));
}

await fs.writeFile(path.join(OUT, `${TAG}-measure.json`), JSON.stringify(out, null, 2));
console.log(JSON.stringify(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, Array.isArray(v) ? v.map((c) => `${c.h}px n${c.needsLines} c${c.credLines} t${c.tags}${c.local ? ' LOCAL' : ''} ${c.title}`) : v])), null, 1));
if (b.logs.length) console.log('logs:', b.logs.filter((l) => !/favicon/.test(l)).slice(0, 20));
b.close();
process.exit(0);
