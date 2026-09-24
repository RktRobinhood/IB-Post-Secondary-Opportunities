/* The place card on a phone: is its title and action reachable? */
import { launch, sleep } from './cdp.mjs';
const b = await launch({ port: 9348, gpu: true });
const { evaluate, G } = b;
for (const route of ['/programmes/', '/europe/']) {
  await b.open(route, { width: 390, height: 844, mobile: true, dpr: 2 });
  await b.globeReady();
  const r = await evaluate(`(async () => { const g = ${G}; const p = g.places.find(p => p.image) || g.places[0]; g.goToPlace(p); await new Promise(r => setTimeout(r, 2600));
    const c = document.querySelector('.world__card'); const s = document.querySelector('.world__stage'); const cs = getComputedStyle(c);
    const a = c.getBoundingClientRect(), z = s.getBoundingClientRect(); const go = c.querySelector('.world__card-go'); const h = c.querySelector('h3');
    const pin = p.node.hidden ? null : p.node.getBoundingClientRect();
    return { place: p.name, card: [Math.round(a.top - z.top), Math.round(a.height)], stageH: Math.round(z.height), scrollH: c.scrollHeight, clientH: c.clientHeight, overflowY: cs.overflowY, maxH: cs.maxHeight,
      titleVisibleInStage: h ? h.getBoundingClientRect().top < z.bottom && h.getBoundingClientRect().bottom <= Math.min(a.bottom, z.bottom) : null,
      actionVisible: go ? go.getBoundingClientRect().bottom <= Math.min(a.bottom, z.bottom) : null,
      pinUnderCard: pin ? (pin.top + pin.height / 2 > a.top) : 'hidden', pinY: pin && Math.round(pin.top + pin.height / 2 - z.top) }; })()`);
  console.log(route, r);
  await b.shot(`f-phone-card${route.replace(/\//g, '_')}`);
}
b.close(); process.exit(0);
