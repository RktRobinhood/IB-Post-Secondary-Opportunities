/* Round 5: how many university names a student can read at a country level, and a picture. */
import { setup, open, DESK, PHONE, still, sleep, ev, send, g, shot } from './lib.mjs';
for (const [name, dev] of [['phone', PHONE], ['desk', DESK]]) {
  await setup(dev, {});
  await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open('/?map=globe');
  for (const code of ['dk', 'nl', 'gb']) {
    await g(`g.goToCountry(g.country('${code}')); return 1;`); await sleep(2500); await still(); await sleep(600);
    const r = await ev(`(() => { const pins = [...document.querySelectorAll('.world__pin')].filter(p => !p.hidden && p.offsetParent && getComputedStyle(p).opacity > 0.05);
      const shown = pins.filter(p => { const l = p.querySelector('.world__pin-label'); if (!l) return false; const cs = getComputedStyle(l); return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05 && l.getBoundingClientRect().width > 0; });
      return pins.length + ' pins, ' + shown.length + ' names: ' + shown.map(p => p.querySelector('.world__pin-label').textContent).join('; '); })()`);
    console.log(name, code, r);
    await shot(`s2-${name}-${code}`);
  }
}
