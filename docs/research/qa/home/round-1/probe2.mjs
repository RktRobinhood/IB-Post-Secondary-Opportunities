/* Probe 2: same checks with smooth scrolling switched off, so clicks land where measured. */
import { launch, sleep } from './cdp.mjs';
const b = await launch({ gpu: true, port: 9373 });
const { evaluate, open, shot, click } = b;
const out = {};
const noSmooth = `document.documentElement.style.scrollBehavior = 'auto'; 1`;
const to = (sel, off = -200) => evaluate(`(() => { ${noSmooth}; const e = document.querySelector(${JSON.stringify(sel)}); window.scrollTo({ top: e.getBoundingClientRect().top + scrollY + ${off}, behavior: 'instant' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, l: r.left, t: r.top }; })()`);
await open('/', { width: 1280, height: 800 });
await sleep(1500);
let r = await to('#discover-more > summary', -300);
await sleep(300);
out.hit = await evaluate(`document.elementFromPoint(${r.x}, ${r.y})?.tagName`);
await click(r.x, r.y); await sleep(800);
out.afterClick = await evaluate(`({ open: document.getElementById('discover-more').open, h: document.documentElement.scrollHeight, summary: document.querySelector('#discover-more > summary').textContent })`);
await shot('probe2-show-all-open');
await evaluate(`scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }); 1`); await sleep(1500);
await shot('probe2-show-all-end');
// Phone: card 1 up close
await open('/', { width: 390, height: 844, mobile: true, dpr: 2 });
await sleep(1500);
r = await to('.discover__card', -80); await sleep(1500);
r = await evaluate(`(() => { const e = document.querySelector('.discover__card'); const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; })()`);
await shot('probe2-phone-card-1', { clip: { x: 0, y: Math.max(0, r.t - 8), width: 390, height: Math.min(r.h + 16, 780) } });
// Phone after pressing a door: what is on screen
await open('/', { width: 390, height: 844, mobile: true, dpr: 2 });
await sleep(1500);
r = await to('.preset[data-scope=here]', -300); await sleep(300);
await click(r.x, r.y); await sleep(2500);
out.phoneAfterDoor = await evaluate(`({ y: scrollY, countOnScreen: (() => { const r = document.getElementById('prog-count').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; })(), countTop: Math.round(document.getElementById('prog-count').getBoundingClientRect().top) })`);
// Phone: search no result — what does the student see?
await open('/', { width: 390, height: 844, mobile: true, dpr: 2 });
await sleep(1500);
r = await to('#f-q', -300); await click(r.x, r.y);
await b.send('Input.insertText', { text: 'medicine' }); await sleep(800);
out.phoneMedicine = await evaluate(`({ count: document.getElementById('prog-count').textContent, countTop: Math.round(document.getElementById('prog-count').getBoundingClientRect().top), vh: innerHeight })`);
await shot('probe2-phone-search-medicine');
console.log(JSON.stringify(out, null, 1));
b.close();
