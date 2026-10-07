/* Q7: (A) a dimmed university under a search, by a real click; (B) the country
   card's university chips by mouse and by keyboard, and Back after a chip;
   (C) clicks on country NAMES at the continent level and continent names at
   the world, desk and phone; (D) the Countries page walk and Back. */
import { setup, open, DESK, PHONE, state, brief, click, tap, key, still, sleep, ev, send, g, nodeAt, shot, logs } from './lib.mjs';
const out = (k, s) => console.log(k.padEnd(44), typeof s === 'string' ? s : brief(s));
const fresh = async (r = '/?map=globe') => { await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open(r); };
const settle = async () => { await sleep(900); await still(); await sleep(300); };
await setup(DESK, {});

/* A */
await fresh();
await ev(`(() => { const q = document.getElementById('f-q'); q.value = 'medicine'; q.dispatchEvent(new Event('input', { bubbles: true })); q.dispatchEvent(new Event('change', { bubbles: true })); })()`);
await sleep(900);
await ev(`document.querySelector('.world__stage').scrollIntoView({ block: 'center' })`); await sleep(400);
let n = await nodeAt(`(c) => c._region === 'europe'`); await click(n.x, n.y); await settle();
n = await nodeAt(`(c) => c._nation === 'dk'`); await click(n.x, n.y); await settle();
out('A medicine → Denmark', await state());
const pins = await ev(`[...document.querySelectorAll('.world__pin[data-school]')].filter(p => !p.hidden && p.offsetParent).map(p => { const r = p.querySelector('.world__pin-dot').getBoundingClientRect(); return { id: p.dataset.place, dim: p.hasAttribute('data-dim'), x: r.left + r.width / 2, y: r.top + r.height / 2 }; })`);
const dim = pins.find(p => p.dim), lit = pins.find(p => !p.dim);
if (dim) { await click(dim.x, dim.y); await settle(); out(`A click dimmed ${dim.id}`, await state()); await shot('q7-a-dimmed'); }
if (lit) { await click(lit.x, lit.y); await settle(); out(`A click lit ${lit.id}`, await state()); }

/* B: chips */
await fresh();
await g(`g.goToRegion('europe'); return true;`); await settle();
n = await nodeAt(`(c) => c._nation === 'gb'`); await click(n.x, n.y); await settle();
const chips = await ev(`[...document.querySelectorAll('.world__card:not([hidden]) button, .world__card:not([hidden]) a')].map(b => (b.textContent || b.getAttribute('aria-label') || '').trim().replace(/\\s+/g, ' ')).join(' | ')`);
out('B UK card controls', chips);
const chip = await ev(`(() => { const b = [...document.querySelectorAll('.world__card:not([hidden]) button')].find(b => !/close/i.test(b.getAttribute('aria-label') || '') && b.textContent.trim().length > 3); if (!b) return null; const r = b.getBoundingClientRect(); return { t: b.textContent.trim(), x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
if (chip) { await click(chip.x, chip.y); await settle(); out(`B click chip "${chip.t}"`, await state()); }
await ev('history.back()'); await settle(); out('B Back', await state());
/* keyboard: focus the card's first chip with Tab from the stage, Enter */
await ev(`document.querySelector('.world__stage').focus()`);
let tabs = 0, onChip = false;
for (; tabs < 12 && !onChip; tabs++) { await key('Tab'); onChip = await ev(`!!document.activeElement?.closest('.world__card') && document.activeElement.tagName === 'BUTTON' && document.activeElement.textContent.trim().length > 3`); }
out(`B Tab presses from the stage to a chip: ${onChip ? tabs : 'never'}`, await ev(`document.activeElement?.textContent?.trim() || document.activeElement?.className`));
if (onChip) { await key('Enter'); await settle(); out('B Enter on chip', await state()); out('B focus after', await ev(`document.activeElement?.className + ' ' + (document.activeElement?.textContent || '').trim().slice(0, 40)`)); }

/* C: names */
for (const [dn, D] of [['desk', DESK], ['phone', PHONE]]) {
  await setup(D, {});
  await fresh();
  const press = (x, y) => (dn === 'phone' ? tap(x, y) : click(x, y));
  const contLabels = await ev(`[...document.querySelectorAll('.world__cluster[data-kind="region"]')].filter(c => !c.hidden && c.offsetParent && getComputedStyle(c).opacity > 0.05).map(c => { const l = c.querySelector('.world__cluster-label'); const r = l?.getBoundingClientRect(); return { region: c._region, name: l?.textContent, x: r ? r.left + r.width / 2 : 0, y: r ? r.top + r.height / 2 : 0, w: r ? r.width : 0 }; }).filter(l => l.w > 0)`);
  for (const L of contLabels) {
    await fresh();
    await press(L.x, L.y); await settle();
    const s = await state();
    console.log(`C ${dn} world: name "${L.name}" → ${s.lv.level}/${s.lv.region}`);
  }
  await fresh();
  await g(`g.goToRegion('europe'); return true;`); await settle();
  const labs = await ev(`[...document.querySelectorAll('.world__cluster[data-kind="country"], .world__cluster')].filter(c => c._nation && !c.hidden && c.offsetParent && getComputedStyle(c).opacity > 0.05 && c.hasAttribute('data-label')).map(c => { const l = c.querySelector('.world__cluster-label'); const r = l.getBoundingClientRect(); return { nation: c._nation, name: l.textContent.trim(), x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; }).filter(l => l.w > 0)`);
  let ok = 0; const bad = [];
  for (const L of labs) {
    await g(`g.goToRegion('europe'); return true;`); await settle();
    const now = await ev(`(() => { const c = [...document.querySelectorAll('.world__cluster')].find(c => c._nation === '${L.nation}'); const l = c?.querySelector('.world__cluster-label'); if (!l) return null; const r = l.getBoundingClientRect(); return r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; })()`);
    if (!now) { bad.push(`${L.name}: label gone`); continue; }
    await press(now.x, now.y); await settle();
    const s = await state();
    if (s.lv.level === 'country' && s.lv.country === L.nation) ok++; else bad.push(`${L.name} → ${s.lv.level}/${s.lv.country || s.lv.region}${s.card ? ' card ' + s.card.slice(0, 30) : ''}`);
  }
  console.log(`C ${dn} Europe: country names clicked ${labs.length}, right ${ok}; wrong: ${bad.join(' | ')}`);
}

/* D: Countries page */
await setup(DESK, {});
await fresh('/countries/?map=globe');
out('D countries world', await state());
n = await nodeAt(`(c) => c._region === 'europe'`); if (n) { await click(n.x, n.y); await settle(); out('D Europe', await state()); }
n = await nodeAt(`(c) => c._nation === 'fr'`); if (n) { await click(n.x, n.y); await settle(); out('D France', await state()); }
n = await nodeAt(`(c) => c.classList.contains('world__pin')`); if (n) { await click(n.x, n.y); await settle(); out('D pin ' + n.place, await state()); }
await ev('history.back()'); await settle(); out('D back', await state());
await ev('history.back()'); await settle(); out('D back 2', await state());
await ev('history.back()'); await settle(); out('D back 3', await state());
console.log('logs', await logs());
