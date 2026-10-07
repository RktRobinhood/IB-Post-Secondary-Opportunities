/* Q9: clicks on land, aimed by latitude/longitude (debug.mineAt projects a
   point to the stage), at each level. A country with nothing on the map should
   give a hint and no flight or history entry; a destination's land should
   choose it. Desk and phone. */
import { setup, open, DESK, PHONE, state, brief, click, tap, still, sleep, ev, send, g, shot, logs } from './lib.mjs';
const out = (k, s) => console.log(k.padEnd(46), typeof s === 'string' ? s : brief(s));
const fresh = async () => { await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open('/?map=globe'); };
const settle = async () => { await sleep(1000); await still(); await sleep(300); };
const where = (lat, lon) => g(`const r = g.mineAt(${lat}, ${lon}); const s = document.querySelector('.world__stage').getBoundingClientRect(); return { x: s.left + r.x, y: s.top + r.y, facing: r.facing, inStage: r.x > 0 && r.y > 0 && r.x < s.width && r.y < s.height, under: (() => { const e = document.elementFromPoint(s.left + r.x, s.top + r.y); return e ? (e.closest('.world__cluster, .world__pin') ? 'node' : e.closest('.world__card, .world__trail, .world__controls') ? 'ui' : e.tagName) : 'none'; })() };`);
const hint = () => ev(`[...document.querySelectorAll('.world__hint')].filter(h => !h.hidden && getComputedStyle(h).opacity > 0.05).map(h => h.textContent.trim()).join(' / ') || '(no hint)'`);
for (const [dn, D] of [['desk', DESK], ['phone', PHONE]]) {
  await setup(D, {});
  const press = (x, y) => (dn === 'phone' ? tap(x, y) : click(x, y));
  const tryAt = async (label, lat, lon, prep) => {
    await fresh(); if (prep) { await g(prep); await settle(); }
    const h0 = await ev('history.length');
    const p = await where(lat, lon);
    if (!p.inStage || p.facing < 0.15) { console.log(`${dn} ${label}: not on the stage (facing ${p.facing?.toFixed?.(2)})`); return; }
    await press(p.x, p.y); await sleep(500);
    const hn = await hint();
    await settle();
    const s = await state();
    out(`${dn} ${label} [under: ${p.under}]`, `${s.lv.level}/${s.lv.region}/${s.lv.country} card=${s.card ? s.card.slice(0, 28) : null} hint="${hn}" history +${(await ev('history.length')) - h0} alt=${s.alt} trail="${s.trail}"`);
  };
  await tryAt('world → Brazil land', -10, -52);
  await tryAt('world → Russia land (Urals)', 58, 60);
  await tryAt('world → India land', 22, 79);
  await tryAt('world → Egypt land', 26, 30);
  await tryAt('world → France land', 46.5, 2.5);
  await tryAt('world → Kazakhstan land', 48, 67);
  const EU = `g.goToRegion('europe'); return true;`;
  await tryAt('Europe → Belarus land', 53.5, 28, EU);
  await tryAt('Europe → Ukraine land', 49, 32, EU);
  await tryAt('Europe → Algeria land', 30, 3, EU);
  await tryAt('Europe → Spain land (inland)', 40, -4, EU);
  await tryAt('Europe → Sweden land (north)', 64, 17, EU);
  await tryAt('Europe → the sea (Bay of Biscay)', 45, -6, EU);
  const DK = `g.goToCountry(g.country('dk')); return true;`;
  await tryAt('Denmark → Sweden land', 56.5, 14, DK);
  await tryAt('Denmark → Germany land', 54, 10.5, DK);
  await tryAt('Denmark → Kattegat sea', 56.8, 11.2, DK);
  await tryAt('Denmark → Denmark land (Jutland)', 56.2, 9.0, DK);
  const FI = `g.goToCountry(g.country('fi')); return true;`;
  await tryAt('Finland → Russia land', 64, 32, FI);
}
console.log('logs', await logs());
