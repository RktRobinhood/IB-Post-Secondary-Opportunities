/* Q6: a second press while a level's flight is under way (a double click, an
   impatient click, a double tap). Does the camera still arrive where the level says? */
import { setup, open, DESK, PHONE, state, brief, click, dblclick, tap, still, sleep, ev, send, g, nodeAt, shot, logs, stageRect } from './lib.mjs';
const out = (k, s) => console.log(k.padEnd(44), typeof s === 'string' ? s : brief(s));
const fresh = async () => { await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open('/?map=globe'); };
const settle = async () => { await sleep(2500); await still(); await sleep(300); };
const frameOf = () => g(`return { lvl: g.lv.level, alt: +g.view.alt.toFixed(3) };`);

await setup(DESK, {});
const sr = await (async () => { await fresh(); return stageRect(); })();
/* 1 */
let n = await nodeAt(`(c) => c._region === 'europe'`);
await dblclick(n.x, n.y); await settle();
out('1 desk dblclick Europe bubble', await state()); await shot('q6-1-dblclick-europe');
/* 2 */
await fresh(); n = await nodeAt(`(c) => c._region === 'europe'`);
await click(n.x, n.y); await sleep(250); await click(sr.x + 40, sr.y + 40); await settle();
out('2 desk Europe, then sky 250ms later', await state()); await shot('q6-2-europe-then-sky');
/* 2b: recover? */
n = await nodeAt(`(c) => c._nation === 'dk'`);
if (n) { await click(n.x, n.y); await settle(); out('2b then click DK node', await state()); }
/* 3 */
await fresh(); n = await nodeAt(`(c) => c._region === 'europe'`);
await click(n.x, n.y); await sleep(600); await click(n.x, n.y); await settle();
out('3 desk Europe, same spot again at 600ms', await state()); await shot('q6-3-europe-again-600');
/* 4: region → country, impatient second click on the same node */
await fresh(); await g(`g.goToRegion('europe'); return true;`); await settle();
n = await nodeAt(`(c) => c._nation === 'dk'`);
await click(n.x, n.y); await sleep(300); await click(n.x, n.y); await settle();
out('4 desk DK node, again at 300ms', await state()); await shot('q6-4-dk-again-300');
/* 5: a drag-free press-and-release mid-flight (touchpad tap) at 1 s */
await fresh(); n = await nodeAt(`(c) => c._region === 'asia'`);
await click(n.x, n.y); await sleep(1000); await click(sr.cx, sr.cy); await settle();
out('5 desk Asia, a click mid-stage at 1 s', await state());

await setup(PHONE, {});
const pr = await (async () => { await fresh(); return stageRect(); })();
/* 6 double tap on Europe */
n = await nodeAt(`(c) => c._region === 'europe'`);
await tap(n.x, n.y); await sleep(150); await tap(n.x, n.y); await settle();
out('6 phone double tap Europe', await state()); await shot('q6-6-phone-doubletap-europe');
/* 7 double tap on a country node */
await fresh(); await g(`g.goToRegion('europe'); return true;`); await settle();
n = await nodeAt(`(c) => c._nation === 'dk'`);
await tap(n.x, n.y); await sleep(150); await tap(n.x, n.y); await settle();
out('7 phone double tap DK node', await state()); await shot('q6-7-phone-doubletap-dk');
/* 8 tap Europe then tap the globe 400 ms later */
await fresh(); n = await nodeAt(`(c) => c._region === 'europe'`);
await tap(n.x, n.y); await sleep(400); await tap(pr.cx, pr.cy); await settle();
out('8 phone Europe, tap mid-stage at 400ms', await state()); await shot('q6-8-phone-tap-midflight');
console.log('logs', await logs());
