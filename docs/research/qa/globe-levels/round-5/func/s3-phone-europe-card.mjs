/* Round 5: on a phone, does a second tap on the Europe coin's spot (during the 0.7 s let-go) cost the Europe card and its rail? */
import { setup, open, PHONE, DESK, state, brief, tap, click, still, sleep, ev, send, nodeAt, shot } from './lib.mjs';
const out = (k, s) => console.log(k.padEnd(40), typeof s === 'string' ? s : brief(s).replace(/\?area=[^#]*#/, '?area=…#'));
const fresh = async () => { await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open('/?map=globe'); };
const settle = async () => { await sleep(2500); await still(); await sleep(300); };
const rail = () => ev(`[...document.querySelectorAll('.world__card:not([hidden]) a, .world__card:not([hidden]) button')].filter(e => e.offsetParent).length`);
for (const [nm, dev, press] of [['phone', PHONE, tap], ['desk', DESK, click]]) {
  await setup(dev, {});
  for (const gap of [null, 150, 400, 600, 900, 1500]) {
    await fresh(); const n = await nodeAt(`(c) => c._region === 'europe'`);
    await press(n.x, n.y); if (gap != null) { await sleep(gap); await press(n.x, n.y); }
    await settle(); const s = await state();
    out(`${nm} Europe ${gap == null ? 'single' : 'again at ' + gap + 'ms'} (card controls ${await rail()})`, s);
    if (nm === 'phone' && gap === 600) await shot('s3-phone-europe-again-600');
  }
}
