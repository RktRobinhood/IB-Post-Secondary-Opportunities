/* Round 4: why a university's name opens another (phone DTU→VIA, Delft→Radboud; desk Leiden→Utrecht).
   Geometry at the press point: the label's box, the element on top, the nearest dots. */
import { setup, open, DESK, PHONE, still, sleep, ev, send, g, tap, click, shot } from './lib.mjs';
const run = async (dev, code, ids) => {
  await setup(dev === 'phone' ? PHONE : DESK, { reduced: true });
  await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open('/?map=globe');
  for (const id of ids) {
    await g(`g.goToCountry(g.country('${code}')); return 1;`); await still(); await sleep(400);
    const d0 = await ev(`(() => { const p = [...document.querySelectorAll('.world__pin')].find(q => q.querySelector('.world__pin-label')?.textContent === '${id}'); const d = p?.querySelector('.world__pin-dot').getBoundingClientRect(); return d ? [d.left + d.width / 2, d.top + d.height / 2] : null; })()`);
    if (d0) { if (dev === 'phone') await tap(d0[0], d0[1]); else await click(d0[0], d0[1]); await sleep(500); await g(`g.goToCountry(g.country('${code}')); return 1;`); await still(); await sleep(400); }
    const r = await ev(`(() => { const p = [...document.querySelectorAll('.world__pin')].find(q => q.querySelector('.world__pin-label')?.textContent === '${id}'); if (!p) return { id: '${id}', missing: true }; const l = p.querySelector('.world__pin-label'); const b = l.getBoundingClientRect(); if (!b.width) return { id: '${id}', hiddenLabel: true }; const x = b.left + b.width / 2, y = b.top + b.height / 2;
      const top = document.elementFromPoint(x, y); const owner = top?.closest('.world__pin, .world__cluster');
      const dots = [...document.querySelectorAll('.world__pin')].filter(q => !q.hidden && q.offsetParent).map(q => { const d = q.querySelector('.world__pin-dot').getBoundingClientRect(); return { id: q.dataset.place, d: Math.round(Math.hypot(d.left + d.width / 2 - x, d.top + d.height / 2 - y)), r: Math.round(d.width / 2) }; }).sort((a, b) => a.d - b.d).slice(0, 3);
      return { id: '${id}', label: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)], press: [Math.round(x), Math.round(y)], top: (top?.className?.baseVal ?? top?.className) + ' of ' + (owner?.dataset.place || owner?._nation || '-'), nearestDots: dots }; })()`);
    if (r.missing || r.hiddenLabel) { console.log(dev, JSON.stringify(r)); continue; }
    if (dev === 'phone') await tap(r.press[0], r.press[1]); else await click(r.press[0], r.press[1]);
    await sleep(500);
    r.got = await ev(`document.querySelector('.world__card:not([hidden]) h3')?.textContent.slice(0, 40) || '(none)'`);
    console.log(dev, JSON.stringify(r));
  }
  await g(`g.goToCountry(g.country('${code}')); return 1;`); await still(); await sleep(400); await shot(`r4-e-${dev}-${code}`);
};
await run('phone', 'dk', ['Technical University of Denmark']);
await run('phone', 'nl', ['Delft University of Technology', 'Eindhoven University of Technology']);
await run('desk', 'nl', ['Leiden University']);
await run('desk', 'se', ['Umeå University']);
