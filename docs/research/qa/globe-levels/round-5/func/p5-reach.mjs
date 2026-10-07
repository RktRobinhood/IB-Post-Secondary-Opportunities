/* P5: which pins/nodes can be reached by a click ANYWHERE (sampled over a 40px disc), and which country nodes at a region level are hit at their coin centre. */
import { setup, open, DESK, PHONE, still, sleep, ev, send, g } from './lib.mjs';
const dev = process.argv[2] === 'phone' ? PHONE : DESK;
await setup(dev, { reduced: true });
await send('Page.navigate', { url: 'about:blank' }); await sleep(300);
await open('/?map=globe');
const probe = `(() => {
  const els = [...document.querySelectorAll('.world__pin, .world__cluster')].filter((p) => !p.hidden && p.offsetParent && getComputedStyle(p).opacity > 0.05);
  const idOf = (e) => e?.closest('.world__pin')?.dataset.place || (e?.closest('.world__cluster') && (e.closest('.world__cluster')._nation || e.closest('.world__cluster')._region)) || '';
  const res = [];
  for (const p of els) {
    const id = idOf(p.querySelector('*') || p);
    const d = (p.querySelector('.world__pin-dot') || p.querySelector('.world__cluster-n')).getBoundingClientRect();
    const cx = d.left + d.width / 2, cy = d.top + d.height / 2;
    const atCentre = idOf(document.elementFromPoint(cx, cy)) === id;
    let anywhere = false;
    for (let r = 0; r <= 20 && !anywhere; r += 2) for (let a = 0; a < 6.28 && !anywhere; a += 0.4) if (idOf(document.elementFromPoint(cx + r * Math.cos(a), cy + r * Math.sin(a))) === id) anywhere = true;
    res.push({ id, atCentre, anywhere });
  }
  return res;
})()`;
for (const [kind, code] of [['region', 'europe'], ['region', 'asia'], ['country', 'sg'], ['country', 'hk'], ['country', 'us'], ['country', 'au'], ['country', 'gb'], ['country', 'nl'], ['country', 'jp'], ['country', 'dk'], ['country', 'ae'], ['country', 'fr']]) {
  if (kind === 'region') await g(`g.goToRegion('${code}'); return true;`);
  else await g(`g.goToCountry(g.country('${code}') || { id: '${code}', name: '${code}', rings: [], start: 0, count: 0, frame: g.places.filter(p => p.country === '${code}').flatMap(p => [p.xyz, ...p.subs.map(q => q.xyz)]) }); return true;`);
  await still(); await sleep(500);
  const r = await ev(probe);
  const mine = kind === 'region' ? r.filter((x) => x.id && x.id.length === 2) : r.filter((x) => x.id.startsWith(code + '-'));
  console.log(`${kind} ${code}: ${mine.length} targets; wrong at centre ${mine.filter((x) => !x.atCentre).length}; unreachable anywhere ${mine.filter((x) => !x.anywhere).length}: ${mine.filter((x) => !x.anywhere).map((x) => x.id).join(' ')}`);
}
