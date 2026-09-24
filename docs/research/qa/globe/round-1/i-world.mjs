/* /world/: the whole Earth zoomed out, a long flight to Canada, and Australia by list. */
import { launch, sleep } from './cdp.mjs';
const b = await launch({ port: 9351, gpu: true });
const { evaluate, mouse, G } = b;
const click = async (x, y) => { await mouse('mouseMoved', x, y, { button: 'none' }); await mouse('mousePressed', x, y); await mouse('mouseReleased', x, y); };
await b.open('/world/');
await b.globeReady();
const btn = (i) => evaluate(`(() => { const r = document.querySelectorAll('.world__btn')[${i}].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
const minus = await btn(1);
for (let i = 0; i < 3; i++) { await click(minus.x, minus.y); await sleep(1800); }
console.log('zoomed out', await evaluate(`(async () => { const g = ${G}; return { ...g.view, pins: g.places.filter(p => !p.node.hidden).map(p => p.id).join(',') }; })()`));
await b.shot('i-world-zoomed-out');
const entry = (re) => evaluate(`(() => { const a = [...document.querySelectorAll('.world__list a')].find(a => ${re}.test(a.textContent)); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
let e = await entry('/Canada/');
await click(e.x, e.y); await sleep(3500);
await evaluate(`(() => { const s = document.querySelector('.world__stage'); scrollTo(0, s.getBoundingClientRect().top + scrollY - 90); return 1; })()`);
console.log('canada', await evaluate(`(async () => { const g = ${G}; return { ...g.view, card: document.querySelector('.world__card:not([hidden]) h3')?.textContent, link: document.querySelector('.world__card .world__card-go')?.textContent }; })()`));
await b.shot('i-world-canada');
e = await entry('/Australia/');
await click(e.x, e.y); await sleep(3500);
await evaluate(`(() => { const s = document.querySelector('.world__stage'); scrollTo(0, s.getBoundingClientRect().top + scrollY - 90); return 1; })()`);
await b.shot('i-world-australia');
console.log(b.logs);
b.close(); process.exit(0);
