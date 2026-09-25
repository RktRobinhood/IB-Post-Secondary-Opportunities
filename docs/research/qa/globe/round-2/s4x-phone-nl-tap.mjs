/* Why does a tap on a list entry on the phone NL page not fly? */
import { launch, sleep } from './cdp.mjs';
import fs from 'node:fs/promises';
const b = await launch({ port: 9367 });
const R = {};
const PH = { width: 390, height: 844, mobile: true, dpr: 2 };
const state = () => b.g('const m = g.closeMap(); return { alt: +g.view.alt.toFixed(4), close: g.close.active, cs: g.close.state, zoom: g.close.zoom && +g.close.zoom.toFixed(2), pad: m && m.getPadding(), card: document.querySelector(".world__card:not([hidden]) h3")?.textContent || null, cardH: document.querySelector(".world__card:not([hidden])")?.offsetHeight || 0, sy: Math.round(scrollY) };');
await b.open('/destinations/nl/', PH);
await b.globeReady();
for (let i = 0; i < 40; i++) { const s = await state(); if (s.close) break; await sleep(250); }
R.rest = await state();
await b.shot('s4x-phone-nl-rest-close');
// Real tap on the list entry
const p = await b.evaluate(`(() => { const a = [...document.querySelectorAll('.world__list a')].find(a => /TU Delft/.test(a.textContent)); a.scrollIntoView({ block: 'center' }); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, href: a.href, target: a.target }; })()`);
R.entry = p;
const targetsBefore = (await (await fetch('http://127.0.0.1:9367/json/list')).json()).length;
await b.tap(p.x, p.y);
const seq = [];
for (let i = 0; i < 16; i++) { seq.push({ ms: i * 250, ...(await state()) }); await sleep(250); }
R.afterTap = seq;
R.newTabs = (await (await fetch('http://127.0.0.1:9367/json/list')).json()).length - targetsBefore;
await b.shot('s4x-phone-nl-after-tap');
// Direct call, to separate the input path from the flight
R.direct = [];
await b.g('const p = g.places.find(p => /Delft/.test(p.name)); g.goToPlace(p); return 1;');
for (let i = 0; i < 12; i++) { R.direct.push({ ms: i * 250, ...(await state()) }); await sleep(250); }
await b.shot('s4x-phone-nl-direct');
R.logs = b.logs.filter((l) => !/READ-usage/.test(l)).slice(0, 12);
await fs.writeFile(new URL('./s4x-phone-nl-tap.json', import.meta.url), JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
b.close(); process.exit(0);
