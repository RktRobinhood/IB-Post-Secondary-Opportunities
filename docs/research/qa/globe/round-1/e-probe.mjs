/* Two probes: who handles a list click on /programmes/, and does a touch drag reach the globe. */
import { launch, sleep } from './cdp.mjs';
const b = await launch({ port: 9347, gpu: true });
const { evaluate, G } = b;
await b.open('/programmes/');
await b.globeReady();
console.log(await evaluate(`(async () => {
  const s = document.querySelector('.world__stage');
  const calls = []; s.scrollIntoView = function (...a) { calls.push(JSON.stringify(a)); };
  const a = [...document.querySelectorAll('.world__list a')].find(a => /Odense/.test(a.textContent));
  a.scrollIntoView({ block: 'center' });
  const ev = new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1, button: 0 });
  a.dispatchEvent(ev);
  await new Promise(r => setTimeout(r, 300));
  return { calls, prevented: ev.defaultPrevented, worlds: document.querySelectorAll('.world').length, stages: document.querySelectorAll('.world__stage').length, card: document.querySelector('.world__card:not([hidden]) h3')?.textContent };
})()`));
// touch drag
await b.open('/europe/', { width: 390, height: 844, mobile: true, dpr: 2 });
await b.globeReady();
await evaluate(`(() => { window.__ev = []; for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) document.addEventListener(t, (e) => __ev.push(t[7] + (e.pointerType[0] || '')), true); return 1; })()`);
const st = await b.stageRect();
const x = st.x + st.w * 0.5, y = st.y + st.h * 0.5;
// tap to take hold, then a sideways drag
await b.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x + 100, y: y + 100 }] });
await b.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await sleep(600);
const v0 = await evaluate(`(async () => ({ ...(${G}).view }))()`);
await b.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
for (let i = 1; i <= 10; i++) { await b.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - i * 15, y }] }); await sleep(16); }
await b.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await sleep(1200);
const v1 = await evaluate(`(async () => ({ ...(${G}).view }))()`);
console.log({ v0, v1, ev: (await evaluate('__ev.join(" ")')).slice(0, 400), ta: await evaluate(`document.querySelector('.world__stage').style.touchAction`) });
// sideways drag on an untouched globe (fresh load)
await b.open('/europe/', { width: 390, height: 844, mobile: true, dpr: 2 });
await b.globeReady();
const w0 = await evaluate(`(async () => ({ ...(${G}).view, sy: scrollY }))()`);
await b.send('Input.synthesizeScrollGesture', { x: x, y: y, xDistance: -200, yDistance: 0, gestureSourceType: 'touch', speed: 600 });
await sleep(1200);
const w1 = await evaluate(`(async () => ({ ...(${G}).view, sy: scrollY }))()`);
await b.send('Input.synthesizeScrollGesture', { x: x, y: y, xDistance: 0, yDistance: -250, gestureSourceType: 'touch', speed: 600 });
await sleep(800);
const w2 = await evaluate(`(async () => ({ ...(${G}).view, sy: scrollY }))()`);
console.log({ sidewaysUntouched: [w0, w1], verticalAfter: w2 });
await b.send('Input.synthesizePinchGesture', { x, y: y - (w2.sy - w0.sy), scaleFactor: 2, gestureSourceType: 'touch' });
await sleep(800);
console.log('pinch', await evaluate(`(async () => ({ ...(${G}).view }))()`));
b.close(); process.exit(0);
