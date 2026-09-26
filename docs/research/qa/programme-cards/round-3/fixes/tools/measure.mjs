/* Where things land on the home page's first screen.
   ORIGIN=http://localhost:4370 BASEPATH= OUT=D:/ibp-tmp/r3/shots node measure.mjs [tag] */
import { launch, sleep } from './cdp.mjs';
const tag = process.argv[2] || 'm';
const b = await launch({ gpu: true, port: 9401 });
const rects = () => b.evaluate(`(() => {
  const r = (s) => { const e = document.querySelector(s); if (!e) return null; const x = e.getBoundingClientRect(); return [Math.round(x.left), Math.round(x.top), Math.round(x.width), Math.round(x.height)]; };
  const firstImg = [...document.querySelectorAll('#discover-results > li:not([hidden]) .card__backdrop')][0];
  const fi = firstImg ? firstImg.getBoundingClientRect() : null;
  return JSON.stringify({ vh: innerHeight, eyebrow: r('.discover__eyebrow'), title: r('.discover__title'), presets: r('.discover__presets'), filters: r('#prog-filters'),
    stage: r('.discover__globe .world__stage'), caption: r('.discover__globe .world__caption'), count: r('#prog-count'), firstCard: r('#discover-results > li:not([hidden])'),
    firstPhoto: fi ? [Math.round(fi.left), Math.round(fi.top), Math.round(fi.width), Math.round(fi.height)] : null, pill: r('.discover__pill:not([hidden])'), jump: r('.discover__jump'),
    scrollH: document.documentElement.scrollHeight, overflowX: document.documentElement.scrollWidth - innerWidth });
})()`);
for (const [name, o] of [['desk', { width: 1280, height: 800 }], ['phone', { width: 390, height: 844, mobile: true, dpr: 2 }]]) {
  for (const dark of [false]) {
    await b.open('/', { ...o, dark });
    await sleep(2500);
    console.log(name, await rects());
    await b.shot(`${tag}-${name}-first`, { fmt: 'jpeg' });
  }
}
b.close();
process.exit(0);
