/* Round 4: (A) the three country names at Europe that missed on desk, with
   their boxes and what lies under the press; (B) the phone continent rail:
   every country button by a real tap; (C) Enter and Space on a country card's chip. */
import { setup, open, DESK, PHONE, state, brief, click, tap, key, still, sleep, ev, send, g, nodeAt, shot } from './lib.mjs';
const out = (k, s) => console.log(k.padEnd(46), typeof s === 'string' ? s : brief(s));
const fresh = async (r = '/?map=globe') => { await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open(r); };
const settle = async () => { await sleep(900); await still(); await sleep(300); };
await setup(DESK, {});
await fresh();
for (const code of ['dk', 'at', 'ee', 'de', 'si', 'lt']) {
  await g(`g.goToRegion('europe'); return true;`); await settle();
  const L = await ev(`(() => { const c = [...document.querySelectorAll('.world__cluster')].find(c => c._nation === '${code}'); const l = c?.querySelector('.world__cluster-label'); if (!l) return null; const r = l.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2; const e = document.elementFromPoint(x, y); const lab = c.hasAttribute('data-label'); const n = c.querySelector('.world__cluster-n').getBoundingClientRect(); return { lab, x: Math.round(x), y: Math.round(y), w: Math.round(r.width), pe: getComputedStyle(l).pointerEvents, top: e ? (e.className.baseVal ?? e.className) + ' ' + (e.closest('.world__cluster')?._nation || '') : null, coin: [Math.round(n.left + n.width/2), Math.round(n.top + n.height/2)] }; })()`);
  if (!L || !L.w) { console.log(code, 'no label', JSON.stringify(L)); continue; }
  await click(L.x, L.y); await settle();
  const s = await state();
  console.log(`A ${code} label ${JSON.stringify(L)} -> ${s.lv.level}/${s.lv.country || s.lv.region}`);
}
await g(`g.goToRegion('europe'); return true;`); await settle(); await shot('r4-c-europe-desk');
/* B: phone rail */
await setup(PHONE, {});
await fresh();
await g(`g.goToRegion('europe'); return true;`); await settle();
const rail = await ev(`[...document.querySelectorAll('.world__card-rail button')].map(b => b.textContent.trim().replace(/\s+/g,' '))`);
console.log('B rail buttons', rail.length, rail.join(' | '));
await shot('r4-c-phone-europe');
const codes = await ev(`[...document.querySelectorAll('.world__card-rail button')].map((b, i) => i)`);
let ok = 0; const bad = [];
for (const i of codes) {
  await g(`g.goToRegion('europe'); return true;`); await settle();
  const b = await ev(`(() => { const b = document.querySelectorAll('.world__card-rail button')[${i}]; if (!b) return null; b.scrollIntoView({ block: 'nearest', inline: 'center' }); const r = b.getBoundingClientRect(); return { t: b.textContent.trim().replace(/\s+/g,' '), x: r.left + r.width / 2, y: r.top + r.height / 2, vis: r.top >= 0 && r.bottom <= innerHeight }; })()`);
  if (!b) { bad.push(`#${i} gone`); continue; }
  await tap(b.x, b.y); await settle();
  const s = await state();
  const name = b.t.replace(/\d+$/, '').trim();
  if (s.lv.level === 'country' && s.card && s.card.startsWith(name)) ok++; else bad.push(`${b.t} -> ${s.lv.level}/${s.lv.country} card=${s.card?.slice(0, 30)}`);
}
console.log(`B phone rail taps ${codes.length}, right ${ok}; wrong: ${bad.join(' | ')}`);
/* rail -> Back */
await g(`g.goToRegion('europe'); return true;`); await settle();
const b0 = await ev(`(() => { const b = [...document.querySelectorAll('.world__card-rail button')].find(b => /Denmark/.test(b.textContent)); b.scrollIntoView({ block: 'nearest', inline: 'center' }); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
await tap(b0.x, b0.y); await settle(); out('B rail Denmark', await state());
await ev('history.back()'); await settle(); out('B Back', await state());
/* C: keys on a chip */
await setup(DESK, {});
await fresh();
await g(`g.goToRegion('europe'); return true;`); await settle();
let n = await nodeAt(`(c) => c._nation === 'gb'`); await click(n.x, n.y); await settle();
await ev(`document.querySelector('.world__stage').focus()`);
let tabs = 0, on = false;
for (; tabs < 12 && !on; tabs++) { await key('Tab'); on = await ev(`!!document.activeElement?.closest('.world__card') && document.activeElement.tagName === 'BUTTON' && document.activeElement.textContent.trim().length > 3`); }
const t = await ev(`document.activeElement.textContent.trim()`);
await key('Enter'); await settle(); out(`C fresh UK, ${tabs} Tabs, Enter on "${t}"`, await state());
await key('Escape'); await settle(); out('C Escape', await state()); out('C focus', await ev(`document.activeElement?.className || document.activeElement?.tagName`));
await ev(`document.querySelector('.world__stage').focus()`);
tabs = 0; on = false;
for (; tabs < 12 && !on; tabs++) { await key('Tab'); on = await ev(`!!document.activeElement?.closest('.world__card') && document.activeElement.tagName === 'BUTTON' && document.activeElement.textContent.trim().length > 3`); }
await key(' ', 'Space', ' '); await settle(); out('C Space on chip', await state());
/* after Back, Enter */
await ev('history.back()'); await settle();
await ev(`document.querySelector('.world__stage').focus()`);
tabs = 0; on = false;
for (; tabs < 12 && !on; tabs++) { await key('Tab'); on = await ev(`!!document.activeElement?.closest('.world__card') && document.activeElement.tagName === 'BUTTON' && document.activeElement.textContent.trim().length > 3`); }
await key('Enter'); await settle(); out('C after Back, Enter on chip', await state());
