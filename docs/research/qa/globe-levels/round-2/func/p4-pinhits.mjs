/* P4: for each pin on a country level, does a click at its dot's centre reach that pin? (elementFromPoint, then a real click on a sample) */
import { setup, open, DESK, PHONE, state, brief, click, tap, still, sleep, ev, send, g, shot } from './lib.mjs';
const dev = process.argv[2] === 'phone' ? PHONE : DESK;
const codes = (process.argv[3] || 'sg,hk,mt,lu,dk,gb,nl,jp,us,au,de,fr,ch,ae').split(',');
await setup(dev, { reduced: true });
await send('Page.navigate', { url: 'about:blank' }); await sleep(300);
await open('/?map=globe');
let total = 0, wrong = 0, hidden = 0;
for (const code of codes) {
  await g(`g.goToCountry(g.country('${code}') || { id: '${code}', name: '${code}', rings: [], start: 0, count: 0, frame: g.places.filter(p => p.country === '${code}').flatMap(p => [p.xyz, ...p.subs.map(q => q.xyz)]) }); return true;`).catch((e) => console.log(e.message));
  await still(); await sleep(500);
  const r = await ev(`(() => {
    const pins = [...document.querySelectorAll('.world__pin')].filter((p) => !p.hidden && p.offsetParent && getComputedStyle(p).opacity > 0.05);
    const res = [];
    for (const p of pins) {
      const d = p.querySelector('.world__pin-dot').getBoundingClientRect();
      const x = d.left + d.width / 2, y = d.top + d.height / 2;
      const hit = document.elementFromPoint(x, y);
      const got = hit?.closest('.world__pin')?.dataset.place || (hit?.closest('.world__card') ? 'CARD' : hit?.closest('.world__cluster') ? 'CLUSTER' : hit?.closest('.world__trail, .world__controls') ? 'FURNITURE' : hit?.className?.baseVal ?? hit?.className);
      res.push({ id: p.dataset.place, got, x: Math.round(x), y: Math.round(y), w: Math.round(d.width) });
    }
    return res;
  })()`);
  const bad = r.filter((p) => p.got !== p.id);
  total += r.length; wrong += bad.length;
  const s = await state();
  console.log(code.padEnd(3), `pins ${r.length}, dot size ${r[0]?.w}px, unreachable at the dot ${bad.length}:`, bad.map((b) => `${b.id}->${b.got}`).join(' '), '| card', s.card);
  if (bad.length && process.argv[4] === 'shots') await shot(`pinhits-${process.argv[2] || 'desk'}-${code}`);
}
console.log(`TOTAL ${wrong}/${total} pins not reachable at their dot centre`);
