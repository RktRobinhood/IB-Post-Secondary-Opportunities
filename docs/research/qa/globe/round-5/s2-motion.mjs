/* Desk globe motion: drag L/R, vertical drag, group click (stepped + real time), reset, back. PHONE=1 for touch. DARK=1 dark. */
import { launch, sleep } from './cdp.mjs';
import { record } from './rec.mjs';
import fs from 'node:fs/promises';
const phone = !!process.env.PHONE, dark = !!process.env.DARK;
const route = process.env.ROUTE || '/';
const P = (phone ? 'p' : 'd') + (dark ? 'k' : '') + (route === '/' ? '' : route.replace(/\//g, '-').replace(/-$/, ''));
const opts = phone ? { width: 390, height: 844, mobile: true, dpr: 2, dark } : { width: 1280, height: 800, dark };
const b = await launch({ port: phone ? 9373 : (dark ? 9375 : 9372) });
const out = {};
const cam = () => b.g('return { lat: +g.view.lat.toFixed(2), lon: +g.view.lon.toFixed(2), alt: +g.view.alt.toFixed(3), pitch: +g.camPitch().toFixed(1), close: g.close.active, desk: document.querySelector(".world__desk").style.opacity, deskDisp: document.querySelector(".world__desk").style.display };');
async function fresh() {
  await b.open(route, opts);
  if (dark) await b.evaluate(`document.documentElement.setAttribute('data-theme','dark')`);
  await b.globeReady(); await sleep(600);
}
async function drag(x0, y0, dx, dy, steps = 16, ms = 320) {
  if (phone) {
    await b.touch('touchStart', [{ x: x0, y: y0 }]);
    for (let i = 1; i <= steps; i++) { await b.touch('touchMove', [{ x: x0 + dx * i / steps, y: y0 + dy * i / steps }]); await sleep(ms / steps); }
    await b.touch('touchEnd', []);
  } else {
    await b.mouse('mouseMoved', x0, y0, { button: 'none' }); await b.mouse('mousePressed', x0, y0);
    for (let i = 1; i <= steps; i++) { await b.mouse('mouseMoved', x0 + dx * i / steps, y0 + dy * i / steps); await sleep(ms / steps); }
    await b.mouse('mouseReleased', x0 + dx, y0 + dy);
  }
}
const press = async (x, y) => phone ? b.tap(x, y) : b.click(x, y);
const biggest = () => b.evaluate(`(() => { const c = [...document.querySelectorAll('.world__cluster')].filter(n => !n.hidden && n.style.opacity !== '0').map(n => { const r = n.getBoundingClientRect(); return { n: +n.textContent.replace(/\D/g,''), x: r.left, y: r.top }; }).sort((a,b) => b.n - a.n); return c[0] || null; })()`);
const S = async () => b.stageRect();

/* 1. rest + horizontal drag + vertical drag */
await fresh();
let st = await S();
const cx = st.x + st.w / 2, cy = st.y + st.h * 0.42;
await b.shot(`${P}-1-rest`);
out.rest = await cam();
out.drag = { before: await cam() };
await drag(cx + 80, cy, -220, 0);
await sleep(80); out.drag.justAfter = await cam();
await sleep(1500); out.drag.after = await cam();
await b.shot(`${P}-2a-after-drag-left`);
out.vdrag = { before: await cam() };
await drag(cx, cy - 60, 0, 220);
await sleep(80); out.vdrag.justAfter = await cam();
await sleep(1200); out.vdrag.after = await cam();
await b.shot(`${P}-2b-after-drag-down`);
/* drag recorded real-time for feel */
out.dragRec = (({ frames, frameStats }) => ({ frames, frameStats }))(await record(b, `${P}-2c-drag-rec`, 1600, () => drag(cx - 100, cy, 260, 30, 20, 400), { sheet: 8, clipStage: !phone }));

/* 2. biggest group: stepped */
await fresh();
const grp = await biggest();
out.group = { target: grp };
await b.g('g.pause(); return 1;');
await press(grp.x, grp.y);
await sleep(150);
out.group.hasFlight = await b.g('return g.stepTo(0.0);');
for (const f of [0.2, 0.45, 0.7, 1.0]) {
  await b.g(`g.stepTo(${f}); return 1;`);
  out.group['f' + f] = await cam();
  await b.shot(`${P}-3-group-f${String(f).replace('.', '')}`);
}
await b.g('g.resume(); return 1;');
await sleep(2500);
out.group.end = await cam();
out.group.card = await b.evaluate(`(() => { const c = document.querySelector('.world__card'); return c && !c.hidden ? c.innerText.slice(0, 300) : null; })()`);
await b.shot(`${P}-3-group-end`);
/* Back returns to desk? */
await b.evaluate('history.back()'); await sleep(3500);
out.group.afterBack = await cam();
out.group.urlAfterBack = await b.evaluate('location.href');
await b.shot(`${P}-4a-after-back`);

/* 3. real-time: group click, then reset */
await fresh();
const grp2 = await biggest();
out.groupRec = (({ frames, frameStats, minAlt }) => ({ frames, frameStats, minAlt }))(await record(b, `${P}-3r-group-rec`, 4500, () => press(grp2.x, grp2.y), { sheet: 12, clipStage: !phone }));
const reset = await b.evaluate(`(() => { const r = [...document.querySelectorAll('.world__btn')].find(n => /Reset/i.test(n.textContent)).getBoundingClientRect(); return { x: r.left + r.width/2, y: r.top + r.height/2 }; })()`);
out.resetRec = (({ frames, frameStats, minAlt }) => ({ frames, frameStats, minAlt }))(await record(b, `${P}-4r-reset-rec`, 4500, () => press(reset.x, reset.y), { sheet: 12, clipStage: !phone }));
out.afterReset = await cam();
await b.shot(`${P}-4b-after-reset`);

/* 4. a single place: choose the first visible pin */
await fresh();
const pin = await b.evaluate(`(() => { const n = [...document.querySelectorAll('.world__pin')].filter(n => !n.hidden && n.style.opacity !== '0' && n.querySelector('.world__pin-dot').getBoundingClientRect().width > 0)[0]; if (!n) return null; const d = (n.querySelector('.world__pin-dot')||n).getBoundingClientRect(); return { id: n.dataset.place, x: d.left + d.width/2, y: d.top + d.height/2 }; })()`);
out.pin = pin;
if (pin) {
  out.pinRec = (({ frames, frameStats, minAlt, firstCloseMs }) => ({ frames, frameStats, minAlt, firstCloseMs }))(await record(b, `${P}-5r-place-rec`, 6000, () => press(pin.x, pin.y), { sheet: 12, clipStage: !phone }));
  out.pinEnd = await cam();
  await b.shot(`${P}-5-place-end`);
}
out.logs = b.logs.filter(l => !/READ-usage/.test(l)).slice(0, 40);
await fs.writeFile(new URL(`./${P}-motion.json`, import.meta.url), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
b.close(); process.exit(0);
