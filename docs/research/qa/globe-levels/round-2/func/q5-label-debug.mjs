/* Q5: what a click on a university's NAME does (DK, NL), and whether NL's pins survive a choice. */
import { setup, open, DESK, state, brief, click, still, sleep, ev, send, g, shot } from './lib.mjs';
await setup(DESK, { reduced: true });
await send('Page.navigate', { url: 'about:blank' }); await sleep(300);
await open('/?map=globe');
const info = (code) => ev(`(() => { const ps = [...document.querySelectorAll('.world__pin[data-school]')]; return { total: ps.length, mine: ps.filter(p => p.dataset.place.startsWith('${code}-')).length, shown: ps.filter(p => !p.hidden && p.offsetParent && getComputedStyle(p).opacity > 0.05).map(p => p.dataset.place).join(' ') }; })()`);
for (const code of ['dk', 'nl']) {
  await g(`g.goToCountry(g.country('${code}')); return true;`); await still(); await sleep(500);
  console.log(code, 'at open', JSON.stringify(await info(code)));
  const labs = await ev(`[...document.querySelectorAll('.world__pin[data-school]')].filter(p => !p.hidden && p.offsetParent).map(p => { const l = p.querySelector('.world__pin-label'); const r = l.getBoundingClientRect(); const cs = getComputedStyle(l); return { id: p.dataset.place, name: l.textContent, w: Math.round(r.width), x: r.left + r.width / 2, y: r.top + r.height / 2, vis: cs.visibility, op: cs.opacity, disp: cs.display, pe: cs.pointerEvents, hasLabel: p.hasAttribute('data-label') }; }).filter(l => l.w > 0)`);
  console.log(' labels with width:', labs.map(l => `${l.id}[${l.vis}/${l.op}/${l.disp}/pe=${l.pe}/data-label=${l.hasLabel}]`).join(' '));
  const L = labs.find(l => l.op > 0.05 && l.vis !== 'hidden');
  if (L) {
    console.log(' elementFromPoint at label', L.name, await ev(`(() => { const e = document.elementFromPoint(${L.x}, ${L.y}); return e ? e.tagName + '.' + (e.className.baseVal ?? e.className) : null; })()`));
    await click(L.x, L.y); await sleep(700); await still();
    console.log(' after click on label:', brief(await state()));
  }
  // choose the first pin by its dot, then see the pins
  await g(`g.goToCountry(g.country('${code}')); return true;`); await still(); await sleep(400);
  const d = await ev(`(() => { const p = [...document.querySelectorAll('.world__pin[data-school]')].find(p => !p.hidden && p.offsetParent); const r = p.querySelector('.world__pin-dot').getBoundingClientRect(); return { id: p.dataset.place, x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  await click(d.x, d.y); await sleep(700); await still();
  console.log(' after dot click', d.id, brief(await state()));
  console.log(' pins now', JSON.stringify(await info(code)));
  await shot(`q5-${code}-after-pin`);
}
