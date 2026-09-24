/* Touch tap on a pin (phone) and the list-click scroll, instrumented. */
import { launch, sleep } from './cdp.mjs';
import fs from 'node:fs/promises';
const b = await launch({ port: 9346, gpu: true });
const { evaluate, mouse, G } = b;
const R = {};
await b.open('/programmes/', { width: 390, height: 844, mobile: true, dpr: 2 });
await b.globeReady();
await sleep(500);
await evaluate(`(() => { window.__ev = []; for (const t of ['pointerdown', 'pointerup', 'pointercancel', 'click', 'touchstart', 'touchend']) document.addEventListener(t, (e) => __ev.push(t + ':' + (e.pointerType || '') + ':' + (e.target.className?.baseVal ?? e.target.className)), true); return 1; })()`);
const pin = await evaluate(`(() => { const n = [...document.querySelectorAll('.world__pin, .world__cluster')].find(n => !n.hidden); const r = n.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, cls: n.className, txt: n.textContent }; })()`);
R.target = pin;
await b.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pin.x, y: pin.y, id: 1 }] });
await sleep(60);
await b.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await sleep(2800);
R.events = await evaluate('__ev');
R.state = await evaluate(`(async () => { const g = ${G}; return { view: { ...g.view }, card: document.querySelector('.world__card:not([hidden]) h3')?.textContent || null, ta: document.querySelector('.world__stage').style.touchAction }; })()`);
await b.shot('d-phone-tap-cluster');
// Now a vertical swipe on the globe after taking hold: does the page scroll?
const st = await b.stageRect();
const y0 = await evaluate('scrollY');
const x = st.x + st.w / 2, y = st.y + st.h * 0.6;
await b.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 2 }] });
for (let i = 1; i <= 10; i++) { await b.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - i * 20, id: 2 }] }); await sleep(16); }
await b.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await sleep(800);
R.swipeUpAfterHold = { scrolled: (await evaluate('scrollY')) - y0, view: await evaluate(`(async () => ({ ...(${G}).view }))()`) };
// Use the synthesized gesture API for a real scroll gesture on the globe
const y1 = await evaluate('scrollY');
await b.send('Input.synthesizeScrollGesture', { x, y, yDistance: -300, gestureSourceType: 'touch', speed: 800 });
await sleep(500);
R.gestureScrollAfterHold = (await evaluate('scrollY')) - y1;
// pinch on the globe
const alt0 = await evaluate(`(async () => (${G}).view.alt)()`);
await b.send('Input.synthesizePinchGesture', { x, y: st.y + st.h / 2 - ((await evaluate('scrollY')) - y1) , scaleFactor: 2.5, gestureSourceType: 'touch' }).catch((e) => (R.pinchErr = String(e)));
await sleep(800);
R.pinch = { alt0, alt1: await evaluate(`(async () => (${G}).view.alt)()`) };

// Desktop list click scroll
await b.open('/programmes/');
await b.globeReady();
const e = await evaluate(`(() => { const a = [...document.querySelectorAll('.world__list a')].find(a => /Odense/.test(a.textContent)); a.scrollIntoView({ block: 'center' }); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
await sleep(300);
await evaluate(`(() => { window.__sc = []; const s = document.querySelector('.world__stage'); const o = s.scrollIntoView; s.scrollIntoView = function (...a) { __sc.push(JSON.stringify(a)); return o.apply(this, a); }; addEventListener('scroll', () => __sc.push('scroll ' + Math.round(scrollY))); return 1; })()`);
await mouse('mouseMoved', e.x, e.y, { button: 'none' }); await mouse('mousePressed', e.x, e.y); await mouse('mouseReleased', e.x, e.y);
await sleep(2000);
R.scrollCalls = await evaluate('__sc.slice(0, 12)');
R.stageTopAfter = await evaluate(`Math.round(document.querySelector('.world__stage').getBoundingClientRect().top)`);
// manual: what does nearest do from here
R.manualNearest = await evaluate(`(async () => { const s = document.querySelector('.world__stage'); s.scrollIntoView({ block: 'nearest' }); await new Promise(r => setTimeout(r, 100)); return Math.round(s.getBoundingClientRect().top); })()`);
R.overflow = await evaluate(`(() => { const s = document.querySelector('.world__stage'); let n = s.parentElement, out = []; while (n) { const cs = getComputedStyle(n); if (/(auto|scroll|hidden|clip)/.test(cs.overflow + cs.overflowY)) out.push(n.tagName + '.' + n.className + ' ' + cs.overflow + '/' + cs.overflowY); n = n.parentElement; } return out; })()`);
R.logs = b.logs;
await fs.writeFile(new URL('./d-touch-scroll.json', import.meta.url), JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
b.close(); process.exit(0);
