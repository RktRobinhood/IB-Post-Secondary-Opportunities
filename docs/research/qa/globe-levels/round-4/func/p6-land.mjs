/* P6: clicks on land (outlines) at each level, and on the sea. Real mouse; normal motion. */
import { setup, open, DESK, state, brief, click, still, sleep, ev, send, g, shot, nodeAt, logs } from './lib.mjs';
const out = (k, s) => console.log(k.padEnd(30), typeof s === 'string' ? s : brief(s));
await setup(DESK, {});
const fresh = async () => { await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open('/?map=globe'); };
const hitAt = async (x, y) => ev(`(() => { const e = document.elementFromPoint(${x}, ${y}); return e?.closest('.world__pin, .world__cluster, .world__card, .world__trail, .world__controls') ? 'UI' : 'globe'; })()`);
async function landClick(name, x, y, waitMs = 600) {
  const h = await hitAt(x, y);
  await click(x, y); await sleep(waitMs); await still(); await sleep(400);
  const s = await state();
  out(`${name} @${x},${y} [${h}]`, s);
  return s;
}
/* World level: Russia, China, India, Egypt (no destination or one), and Spain's land. */
for (const [n, x, y] of [['russia?', 1150, 250], ['china?', 1180, 340], ['india?', 1110, 440], ['africa?', 950, 470], ['spain?', 880, 360], ['sea (Indian Ocean)', 1100, 540]]) {
  await fresh();
  const s = await landClick(`world→${n}`, x, y);
  if (n.startsWith('russia')) {
    await shot('land-world-russia');
    /* then − : where does it go? */
    await ev(`document.querySelector('.world__btn[aria-label="Zoom out"]').click()`); await sleep(400); await still();
    out('  then −', await state());
  }
}
/* Region level (Europe): land between the nodes. */
await fresh();
await g(`g.goToRegion('europe'); return true;`); await still(); await sleep(500);
await shot('land-europe-before');
for (const [n, x, y] of [['east (Russia/Belarus?)', 1300, 330], ['north africa?', 1000, 720], ['france land?', 920, 470], ['germany land?', 1040, 430], ['sea (Atlantic)', 790, 470]]) {
  await g(`g.goToRegion('europe'); return true;`); await still(); await sleep(400);
  await landClick(`europe→${n}`, x, y);
}
/* Country level (Denmark): a click on Sweden's land, on Germany's land, on the sea, on Denmark's land. */
for (const [n, x, y] of [['sweden land', 1180, 300], ['germany land', 1000, 600], ['sea (Kattegat)', 1020, 250], ['denmark land (no pin)', 880, 440]]) {
  await g(`g.goToCountry(g.country('dk')); return true;`); await still(); await sleep(400);
  await landClick(`denmark→${n}`, x, y);
}
console.log('logs', await logs());
