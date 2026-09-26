/* Follow-up probes: Show all, far tiles' photos, desktop feedback after a door, back button, globe bubbles. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { launch, sleep } from './cdp.mjs';
const HOME = path.resolve(import.meta.dirname, '..');
const b = await launch({ gpu: true, port: 9392 });
const ev = (s) => b.evaluate(s);
const out = {};
const jpg = async (name, q = 72) => { await b.settle(400); const r = await b.send('Page.captureScreenshot', { format: 'jpeg', quality: q }); await fs.writeFile(path.join(HOME, name + '.jpg'), Buffer.from(r.data, 'base64')); console.log('  ', name); };

// 1. Show all, desktop.
await b.open('/', { width: 1280, height: 800 }); await sleep(1500);
await ev(`document.querySelector('#discover-more > summary').scrollIntoView({block:'center'})`); await sleep(500);
const s = await ev(`(() => { const r = document.querySelector('#discover-more > summary').getBoundingClientRect(); return { x: r.left + r.width/2, y: r.top + r.height/2, top: document.elementFromPoint(r.left + r.width/2, r.top + r.height/2)?.outerHTML.slice(0,120) }; })()`);
out.summaryHit = s;
await b.click(s.x, s.y); await sleep(1500);
out.showAll = await ev(`(() => { const d = document.getElementById('discover-more'); const lis = [...document.querySelectorAll('#discover .card')].filter(c => c.getClientRects().length && c.getBoundingClientRect().height > 0); return { open: d.open, summaryVisible: !!d.querySelector('summary').getClientRects().length, summaryText: d.querySelector('summary').textContent.trim(), renderedCards: lis.length, docH: document.documentElement.scrollHeight }; })()`);
await jpg('probe-desk-show-all-after');
// 2. Back after opening.
// 3. Worldwide tiles on desktop, all photos loaded?
await b.open('/?scope=far', { width: 1280, height: 800 }); await sleep(2500);
await ev(`document.getElementById('discover-places').scrollIntoView()`); await sleep(300);
for (let i = 0; i < 6; i++) { await ev('scrollBy(0, 400)'); await sleep(500); }
await sleep(1500);
out.farTiles = await ev(`[...document.querySelectorAll('#discover-places li')].filter(li => li.getClientRects().length).map(li => { const i = li.querySelector('img'); return { name: li.querySelector('.tile__name')?.textContent.trim(), img: i?.getAttribute('src'), ok: i ? i.complete && i.naturalWidth > 0 : null, text: li.querySelector('.tile__line')?.textContent.trim() }; })`);
await ev(`document.getElementById('discover-places').scrollIntoView()`); await ev('scrollBy(0, 230)'); await sleep(800);
await jpg('probe-desk-far-tiles');
// 4. Desktop: after a door, where is the count? Is anything below the hero hinting at results?
await b.open('/', { width: 1280, height: 800 }); await sleep(2000);
const d = await ev(`(() => { const r = document.querySelector('.preset[data-scope="nearby"]').getBoundingClientRect(); return { x: r.left + r.width/2, y: r.top + r.height/2 }; })()`);
await b.click(d.x, d.y); await sleep(3000);
out.deskAfterNearby = await ev(`(() => { const c = document.getElementById('prog-count').getBoundingClientRect(); return { countTop: Math.round(c.top), vh: innerHeight, scrollY }; })()`);
// Bubbles on the globe after Nearby: what numbers are drawn?
out.bubbles = await ev(`[...document.querySelectorAll('.maplibregl-marker, [class*="bubble"], [class*="cluster"]')].filter(e => e.getClientRects().length).map(e => e.textContent.trim()).filter(Boolean).slice(0, 30)`);
// Back.
await b.send('Runtime.evaluate', { expression: 'history.back()' }); await sleep(1500);
out.afterBack = await ev(`({ url: location.pathname + location.search, count: document.getElementById('prog-count').textContent.trim(), pressed: [...document.querySelectorAll('.preset[aria-pressed="true"]')].map(p => p.dataset.scope) })`);
// 5. Phone first-screen metrics.
await b.open('/', { width: 390, height: 844, mobile: true, dpr: 2 }); await sleep(2500);
out.phoneFirst = await ev(`(() => { const q = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) }; }; return { title: q('.discover__title'), presets: q('.discover__presets'), search: q('#f-q'), filtersBtn: q('#f-sheet-open'), globe: q('.discover__globe'), count: q('#prog-count'), firstCard: q('#discover .card') }; })()`);
// 6. Phone Worldwide tiles.
await b.open('/?scope=far', { width: 390, height: 844, mobile: true, dpr: 2 }); await sleep(2500);
await ev(`document.getElementById('prog-count').scrollIntoView()`); await ev('scrollBy(0,-70)'); await sleep(1200);
await jpg('probe-phone-far-tiles', 65);
// 7. Phone psychology.
await b.open('/?q=psychology', { width: 390, height: 844, mobile: true, dpr: 2 }); await sleep(2000);
await ev(`document.getElementById('prog-count').scrollIntoView()`); await ev('scrollBy(0,-70)'); await sleep(800);
await jpg('probe-phone-psychology', 65);
await fs.writeFile(path.join(HOME, 'notes-probe.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1).slice(0, 5000));
b.close(); process.exit(0);
