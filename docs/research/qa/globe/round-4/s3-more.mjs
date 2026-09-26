import { launch, sleep } from './cdp.mjs';
import { record } from './rec.mjs';
import fs from 'node:fs/promises';
const b = await launch({ port: 9376 });
const out = {};
const cam = () => b.g('return { lat: +g.view.lat.toFixed(2), lon: +g.view.lon.toFixed(2), alt: +g.view.alt.toFixed(3), pitch: +g.camPitch().toFixed(1), close: g.close.active, desk: document.querySelector(".world__desk").style.display === "none" ? 0 : +document.querySelector(".world__desk").style.opacity };');
const biggest = () => b.evaluate(`(() => { const c = [...document.querySelectorAll('.world__cluster')].filter(n => !n.hidden && n.style.opacity !== '0').map(n => { const r = n.getBoundingClientRect(); return { n: +n.textContent.replace(/\D/g,''), x: r.left, y: r.top }; }).sort((a,b) => b.n - a.n); return c[0] || null; })()`);
const D = { width: 1280, height: 800 };
/* A. lean-in middle fractions */
await b.open('/', D); await b.globeReady(); await sleep(600);
let g0 = await biggest(); await b.g('g.pause(); return 1;'); await b.click(g0.x, g0.y); await sleep(150);
out.mid = {};
for (const f of [0.5, 0.55, 0.6, 0.65]) { await b.g(`g.stepTo(${f}); return 1;`); out.mid[f] = await cam(); await b.shot(`s3a-lean-f${String(f).replace('.', '')}`); }
await b.g('g.resume(); return 1;');
/* B. wheel on the desk: out stops at desk? in leans? page scroll? */
await b.open('/', D); await b.globeReady(); await sleep(600);
let st = await b.stageRect(); const cx = st.x + st.w / 2, cy = st.y + st.h * 0.42;
out.wheel = { before: await cam(), sy0: await b.evaluate('scrollY') };
for (let i = 0; i < 6; i++) { await b.wheel(cx, cy, 120); await sleep(60); }
await sleep(1200); out.wheel.afterOut = await cam(); out.wheel.sy1 = await b.evaluate('scrollY');
for (let i = 0; i < 6; i++) { await b.wheel(cx, cy, -120); await sleep(60); }
await sleep(1500); out.wheel.afterIn = await cam(); out.wheel.sy2 = await b.evaluate('scrollY');
await b.shot('s3b-after-wheel-in');
/* C. reduced motion: group click + pin click */
await b.open('/', { ...D, reduced: true }); await b.globeReady(); await sleep(600);
out.reduced = { rest: await cam(), idleSpin: null };
await sleep(1500); out.reduced.restLater = await cam();
g0 = await biggest(); const t0 = Date.now(); await b.click(g0.x, g0.y); await sleep(250);
out.reduced.afterGroup250 = await cam(); await sleep(2500); out.reduced.afterGroup = await cam(); out.reduced.ms = Date.now() - t0;
await b.shot('s3c-reduced-group');
await b.evaluate('history.back()'); await sleep(1200); out.reduced.back = await cam(); await b.shot('s3c-reduced-back');
/* reduced phone: tap first pin */
await b.open('/', { width: 390, height: 844, mobile: true, dpr: 2, reduced: true }); await b.globeReady(); await sleep(600);
const pin = await b.evaluate(`(() => { const n = [...document.querySelectorAll('.world__pin')].filter(n => !n.hidden && n.style.opacity !== '0' && n.querySelector('.world__pin-dot').getBoundingClientRect().width > 0)[0]; const d = n.querySelector('.world__pin-dot').getBoundingClientRect(); return { id: n.dataset.place, x: d.left + d.width/2, y: d.top + d.height/2 }; })()`);
await b.tap(pin.x, pin.y); await sleep(300); out.reduced.phonePin = { pin, at300: await cam() }; await sleep(2500); out.reduced.phonePin.end = await cam();
await b.shot('s3d-reduced-phone-pin');
/* D. /countries/ and /destinations/nl/ group dive, real time */
for (const route of ['/countries/', '/destinations/nl/']) {
  await b.open(route, D); await b.globeReady(); await sleep(600);
  const gg = await biggest();
  const slug = route.replace(/\//g, '-').replace(/^-|-$/g, '');
  const r = await record(b, `s3e-${slug}-group-rec`, 5000, () => b.click(gg.x, gg.y), { sheet: 8, clipStage: true });
  out[route] = { target: gg, end: await cam(), frameStats: r.frameStats };
  await b.shot(`s3e-${slug}-group-end`);
}
out.logs = b.logs.filter(l => !/READ-usage/.test(l)).slice(0, 40);
await fs.writeFile(new URL('./s3-more.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
b.close(); process.exit(0);
