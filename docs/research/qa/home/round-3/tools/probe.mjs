/* Pill + globe bubble probe. ORIGIN=http://localhost:4380 BASEPATH= OUT=D:/ibp-tmp/crit-r3 node probe.mjs */
import fs from 'node:fs';
import { launch, sleep } from './cdp.mjs';
const b = await launch({ gpu: true, port: 9432 });
const out = {};
const pill = () => b.evaluate(`JSON.stringify([...document.querySelectorAll('[class*="pill"]')].map(p => { const r = p.getBoundingClientRect(); return { cls: p.className, hidden: p.hidden, disp: getComputedStyle(p).display, vis: getComputedStyle(p).visibility, op: getComputedStyle(p).opacity, text: p.textContent.trim().slice(0, 60), top: Math.round(r.top), h: Math.round(r.height) }; }))`).then(JSON.parse);
const bubbles = () => b.evaluate(`JSON.stringify([...document.querySelectorAll('.world *')].filter(e => e.children.length <= 1 && /^\\d+$/.test(e.textContent.trim()) && e.getBoundingClientRect().width > 0).map(e => { const r = e.getBoundingClientRect(); return { cls: (e.className.baseVal ?? e.className) + ' < ' + ((e.parentNode.className && (e.parentNode.className.baseVal ?? e.parentNode.className)) || ''), n: e.textContent.trim(), x: Math.round(r.left), y: Math.round(r.top), op: getComputedStyle(e.parentNode).opacity }; }))`).then(JSON.parse);
for (const [dev, o] of [['desk', { width: 1280, height: 800 }], ['phone', { width: 390, height: 844, mobile: true, dpr: 2 }]]) {
  await b.open('/', o); await sleep(3500);
  out[`${dev}-rest-bubbles`] = await bubbles();
  await b.evaluate(`document.querySelector('.preset[data-scope="nearby"]').click()`); await sleep(3000);
  out[`${dev}-nearby-bubbles`] = await bubbles();
  await b.evaluate(`document.documentElement.style.scrollBehavior = 'auto'`);
  for (const y of [900, 1800, 2600]) { await b.evaluate(`scrollTo(0, ${y}); dispatchEvent(new Event('scroll'))`); await sleep(1000); out[`${dev}-nearby-y${y}-pill`] = await pill(); }
  // Change the scope while scrolled down, from the filter sheet.
  await b.evaluate(`document.getElementById('f-sheet-open').click()`); await sleep(700);
  await b.evaluate(`(() => { const c = [...document.querySelectorAll('#f-sheet button, #f-sheet label')].find(e => /Open entry/.test(e.textContent)); c && c.click(); })()`); await sleep(500);
  await b.evaluate(`(() => { const c = [...document.querySelectorAll('#f-sheet button')].find(e => /^Show /.test(e.textContent.trim())); c && c.click(); })()`); await sleep(1200);
  out[`${dev}-after-sheet-pill`] = await pill(); out[`${dev}-after-sheet-scrollY`] = await b.evaluate('scrollY');
  await b.shot(`probe-${dev}-after-sheet`, { fmt: 'jpeg' });
  await b.open('/', o); await sleep(2500);
  await b.evaluate(`(() => { const i = document.getElementById('f-q'); i.value = 'psychology'; i.dispatchEvent(new Event('input', { bubbles: true })); })()`); await sleep(2500);
  out[`${dev}-psych-bubbles`] = await bubbles();
}
fs.writeFileSync((process.env.OUT || '.') + '/notes-probe.json', JSON.stringify(out, null, 1));
b.close(); process.exit(0);
