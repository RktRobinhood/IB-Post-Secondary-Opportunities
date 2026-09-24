/* Play with /programmes/ the way a student would, with real input events. */
import { launch, sleep } from './cdp.mjs';
import fs from 'node:fs/promises';
const b = await launch({ port: 9344, gpu: process.env.SWIFT ? false : true });
if (process.env.THROTTLE) await b.send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.THROTTLE) });
const { evaluate, mouse, shot, G } = b;
const TAG = process.env.TAG || '';
const R = {};
const state = () => evaluate(`(async () => { const g = ${G}; const c = document.querySelector('.world__card:not([hidden])'); return { lat: +g.view.lat.toFixed(2), lon: +g.view.lon.toFixed(2), alt: +g.view.alt.toFixed(3), card: c ? c.querySelector('h3')?.textContent : null, scrollY }; })()`);
const frameProbe = (ms) => evaluate(`new Promise(r => { const t = []; const t0 = performance.now(); let lt = 0; const po = new PerformanceObserver(l => { for (const e of l.getEntries()) lt += e.duration; }); try { po.observe({ type: 'longtask', buffered: false }); } catch {} (function f(n) { t.push(n); if (n - t0 < ${ms}) requestAnimationFrame(f); else { po.disconnect(); const d = t.slice(1).map((x, i) => x - t[i]).sort((a, b) => a - b); r({ frames: d.length, p50: +d[Math.floor(d.length * .5)].toFixed(1), p95: +d[Math.floor(d.length * .95)].toFixed(1), max: +d[d.length - 1].toFixed(1), over25: d.filter(x => x > 25).length, longTaskMs: Math.round(lt) }); } })(t0); })`);
const click = async (x, y) => { await mouse('mouseMoved', x, y, { button: 'none' }); await mouse('mousePressed', x, y); await mouse('mouseReleased', x, y); };
const listEntry = (re) => evaluate(`(() => { const a = [...document.querySelectorAll('.world__list a')].find(a => ${re}.test(a.textContent)); a.scrollIntoView({ block: 'center' }); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);

await b.open('/programmes/');
R.firstGlobeMs = await evaluate(`(async () => { const f = document.querySelector('.world'); const s = f.querySelector('.world__stage'); const t0 = performance.now(); scrollTo(0, s.getBoundingClientRect().top + scrollY - 90); for (let i = 0; i < 500 && f.dataset.globe !== 'on'; i++) await new Promise(r => setTimeout(r, 20)); return Math.round(performance.now() - t0); })()`);
await sleep(800);
R.idleFrames = await frameProbe(2000);
R.rest = await state();
let st = await b.stageRect();
// 1. Click the biggest cluster (Denmark)
const c12 = await evaluate(`(() => { const n = [...document.querySelectorAll('.world__cluster')].filter(n => !n.hidden).sort((a, b) => +b.textContent - +a.textContent)[0]; const r = n.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, n: n.textContent }; })()`);
await click(c12.x, c12.y);
R.clusterDiveFrames = await frameProbe(2600);
await sleep(300);
R.afterCluster = await state();
R.afterClusterGroups = await evaluate(`(async () => { const g = ${G}; return g.groups().filter(x => x.members.length > 1).map(x => x.members.map(m => m.id).join('+')); })()`);
await shot(`b01-after-cluster-click${TAG}`);
// 2. Click the Copenhagen pin if visible
const cph = await evaluate(`(() => { const n = document.querySelector('.world__pin[data-place="dk-copenhagen"]'); if (!n || n.hidden) return null; const r = n.querySelector('.world__pin-dot').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
R.cphPinVisible = !!cph;
if (cph) { await click(cph.x, cph.y); await sleep(2500); R.afterPin = await state(); await shot(`b02-pin-card${TAG}`); }
// 3. Zoom all the way in with the + button
const plus = await evaluate(`(() => { const r = document.querySelector('.world__btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
for (let i = 0; i < 6; i++) { await click(plus.x, plus.y); await sleep(1500); }
R.minZoom = await state();
await shot(`b03-closest-zoom${TAG}`);
st = await b.stageRect();
await b.shot(`b03b-closest-zoom-crop${TAG}`, { x: st.x + 300, y: st.y + 150, width: 500, height: 300 });
// 4. Drag far away with the card open: is the card stale?
let mx = st.x + st.w * 0.7, my = st.y + st.h * 0.5;
await mouse('mouseMoved', mx, my, { button: 'none' }); await mouse('mousePressed', mx, my);
for (let i = 1; i <= 20; i++) { await mouse('mouseMoved', mx - i * 30, my - i * 5); await sleep(16); }
await mouse('mouseReleased', mx - 600, my - 100); await sleep(1500);
R.afterPanWithCard = await state();
await shot(`b04-card-after-pan${TAG}`);
// 5. Zoom out with − several times
const minus = await evaluate(`(() => { const r = document.querySelectorAll('.world__btn')[1].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
for (let i = 0; i < 5; i++) { await click(minus.x, minus.y); await sleep(1600); }
R.zoomedOut = await state();
await shot(`b05-zoomed-out-max${TAG}`);
// 6. Fling
mx = st.x + st.w * 0.5; my = st.y + st.h * 0.5;
let before = await state();
await mouse('mouseMoved', mx, my, { button: 'none' }); await mouse('mousePressed', mx, my);
for (let i = 1; i <= 6; i++) { await mouse('mouseMoved', mx + i * 45, my); await sleep(10); }
await mouse('mouseReleased', mx + 270, my);
R.flingFrames = await frameProbe(1500);
await sleep(1500);
let after = await state();
R.fling = { dLon: +(after.lon - before.lon).toFixed(1) };
// 7. Reset
const reset = await evaluate(`(() => { const r = document.querySelectorAll('.world__btn')[2].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
await click(reset.x, reset.y);
R.resetFrames = await frameProbe(2600);
R.afterReset = await state();
// 8. Click bare land in Germany at rest -> the dive, real time
const spot = await evaluate(`(async () => { const g = ${G}; const s = document.querySelector('.world__stage').getBoundingClientRect(); for (let fy = 0.3; fy < 0.95; fy += 0.02) for (let fx = 0.2; fx < 0.8; fx += 0.02) { const x = s.left + s.width * fx, y = s.top + s.height * fy; const e = document.elementFromPoint(x, y); const h = g.pickAt(x, y); if (e && e.classList.contains('world__globe') && h && h.country === 'de') return { x, y }; } return null; })()`);
R.deSpot = spot;
if (spot) {
  await click(spot.x, spot.y);
  R.countryDiveFrames = await frameProbe(3000);
  R.afterCountry = await state();
  await shot(`b06-germany-card${TAG}`);
}
// 9. Double-click zoom
await click(st.x + st.w * 0.5, st.y + st.h * 0.7); await sleep(80); await click(st.x + st.w * 0.5, st.y + st.h * 0.7);
await sleep(2500);
R.afterDbl = await state();
// 10. Keyboard
await evaluate(`document.querySelector('.world__stage').focus()`);
for (const [k, c] of [['ArrowRight', 39], ['ArrowRight', 39], ['ArrowUp', 38]]) { await b.send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code: k, windowsVirtualKeyCode: c }); await b.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code: k, windowsVirtualKeyCode: c }); await sleep(1600); }
R.afterKeys = await state();
await b.send('Input.dispatchKeyEvent', { type: 'keyDown', key: '0', code: 'Digit0', text: '0', windowsVirtualKeyCode: 48 }); await b.send('Input.dispatchKeyEvent', { type: 'keyUp', key: '0', code: 'Digit0', windowsVirtualKeyCode: 48 });
await sleep(2600);
R.afterKey0 = await state();
// 11. List click for Maastricht
const e = await listEntry('/Maastricht/');
await click(e.x, e.y);
await sleep(3000);
R.afterList = await state();
R.stageInView = await evaluate(`(() => { const r = document.querySelector('.world__stage').getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight }; })()`);
await shot(`b07-list-maastricht${TAG}`);
R.cardLink = await evaluate(`(() => { const a = document.querySelector('.world__card a.world__card-go'); return a ? { text: a.textContent, href: a.getAttribute('href') } : null; })()`);
R.memory = await evaluate(`(() => performance.memory ? { usedMB: Math.round(performance.memory.usedJSHeapSize / 1048576) } : null)()`);
R.drawMs = await evaluate(`(async () => (${G}).drawMs)()`);
R.logs = b.logs;
await fs.writeFile(new URL(`./b-play${TAG}.json`, import.meta.url), JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
b.close(); process.exit(0);
