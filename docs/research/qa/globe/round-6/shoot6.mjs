/**
 * Evidence for globe round 6 (#53 owner's comments, #62): flags instead of
 * two-letter placeholders, per-nation bubbles, the hovered country's outline,
 * the plane on a country's bubble, the globe as a filter of the cards, the
 * phone Europe labels, the /countries/ phone buttons, and Reset's regrouping.
 *
 *   node src/build.mjs                       # SITE_BASE unset
 *   PORT=4400 node scripts/serve.mjs &
 *   PREVIEW=http://127.0.0.1:4400 PROFILE_ROOT=D:/ibp-tmp/… \
 *     node docs/research/qa/globe/round-6/shoot6.mjs
 *
 * The DevTools-protocol harness of ../owner-notes-53/shoot53.mjs. Pages open
 * with `?map=globe` (headless Chrome draws WebGL in software, which the globe
 * refuses on purpose). JPEG q80. Writes report.json beside the shots.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const OUT = import.meta.dirname;
const BASE = process.env.PREVIEW || 'http://127.0.0.1:4400';
const CHROME = process.env.CHROME || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const PORT = 9336;
const ONLY = process.env.ONLY || '';

const profile = await fs.mkdtemp(path.join(process.env.PROFILE_ROOT || os.tmpdir(), 'shoot6-'));
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--hide-scrollbars', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-first-run',
  'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let version;
for (let i = 0; i < 50 && !version; i++) {
  try { version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); } catch { await sleep(200); }
}
if (!version) throw new Error('Chrome did not start');
const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0;
const pending = new Map();
const listeners = [];
ws.addEventListener('message', (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  } else if (msg.method) {
    for (const l of listeners) l(msg);
  }
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++seq;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});
const logs = [];
listeners.push((m) => {
  if (m.method === 'Runtime.exceptionThrown') logs.push(`exception: ${m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text}`);
  if (m.method === 'Runtime.consoleAPICalled' && /error|warn/.test(m.params.type)) logs.push(`${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description).join(' ')}`);
});
await send('Runtime.enable');
await send('Page.enable');
await send('Page.bringToFront');
await send('Emulation.setFocusEmulationEnabled', { enabled: true });

async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}

const DESK = { width: 1280, height: 800, mobile: false };
const PHONE = { width: 390, height: 844, mobile: true };

async function setup({ width, height, mobile }, dark, reduced = false) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  await send('Emulation.setTouchEmulationEnabled', { enabled: mobile });
  await send('Emulation.setEmulatedMedia', { features: [
    { name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' },
    { name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' },
  ] });
}
async function open(route) {
  const loaded = new Promise((r) => listeners.push(function once(m) {
    if (m.method === 'Page.loadEventFired') { listeners.splice(listeners.indexOf(once), 1); r(); }
  }));
  await send('Page.navigate', { url: `${BASE}${route}` });
  await loaded;
}
async function globeReady(sel = '.world') {
  return evaluate(`(async () => {
    const f = document.querySelector('${sel}');
    const s = f.querySelector('.world__stage');
    scrollTo(0, Math.max(0, s.getBoundingClientRect().top + scrollY - Math.max(8, (innerHeight - s.offsetHeight) / 2)));
    for (let i = 0; i < 200 && f.dataset.globe !== 'on' && f.dataset.globe !== 'off'; i++) await new Promise(r => setTimeout(r, 100));
    await new Promise(r => setTimeout(r, 1200));
    return f.dataset.globe + (f.dataset.globeOff ? ': ' + f.dataset.globeOff : '');
  })()`);
}
const settle = (ms = 600) => evaluate(`new Promise((r) => { const t0 = performance.now(); (function f() { if (performance.now() - t0 > ${ms}) r(true); else requestAnimationFrame(f); })(); })`);
const shots = [];
async function shot(name, what, { settleMs = 600 } = {}) {
  if (settleMs) await settle(settleMs);
  const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 80 });
  const buf = Buffer.from(r.data, 'base64');
  await fs.writeFile(path.join(OUT, `${name}.jpg`), buf);
  shots.push({ file: `${name}.jpg`, kB: Math.round(buf.length / 1024), what });
  console.log(`  ${name}.jpg ${Math.round(buf.length / 1024)} kB`);
}
const G = `(await import('/assets/js/map.js')).enhanceWorld(document.querySelector('.world')).globe`;
const g = (body) => evaluate(`(async () => { const g = ${G}.debug; ${body} })()`);
const mouse = (type, x, y, extra = {}) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1, ...extra });
const move = (x, y) => mouse('mouseMoved', x, y, { button: 'none' });
const click = async (x, y) => { await move(x, y); await mouse('mousePressed', x, y); await mouse('mouseReleased', x, y); };
const tap = async (x, y) => {
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
};
/** Wait until no flight is under way (the debug view stops changing). */
const still = () => evaluate(`(async () => { const g = ${G}.debug; let last = ''; for (let i = 0; i < 80; i++) { await new Promise(r => setTimeout(r, 120)); const k = [g.view.lat, g.view.lon, g.view.alt].map(v => v.toFixed(4)).join(); if (k === last) return true; last = k; } return false; })()`);
const reducedOn = () => evaluate(`document.documentElement.setAttribute('data-motion','reduced')`);
const reducedOff = () => evaluate(`document.documentElement.removeAttribute('data-motion')`);

/* What is on the stage: bubbles (number, flags, label, the countries inside),
   pins with labels, and any label that leaves the stage or sits on a bubble. */
const stageState = () => evaluate(`(() => {
  const s = document.querySelector('.world__stage').getBoundingClientRect();
  const vis = (e) => !e.hidden && e.offsetParent !== null;
  const rect = (e) => e.getBoundingClientRect();
  const hits = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  const clusters = [...document.querySelectorAll('.world__cluster')].filter(vis);
  const bubbles = clusters.map((c) => rect(c.querySelector('.world__cluster-n')));
  const labels = [...document.querySelectorAll('.world__pin[data-label] .world__pin-label, .world__cluster[data-label] .world__cluster-label')].filter((l) => l.offsetParent !== null);
  const RI = /\\p{RI}/u;
  return {
    bubbles: clusters.map((c) => ({ n: c.querySelector('.world__cluster-n').textContent, nation: c._nation || '', nations: [...new Set((c._members || []).map((m) => (m.parent || m).country))].length, flags: c.querySelectorAll('.world__cluster-flags img').length, label: c.hasAttribute('data-label') ? c.querySelector('.world__cluster-label').textContent : '' })),
    pinLabels: labels.map((l) => ({ text: l.textContent, flag: !!l.querySelector('img.world__flag') })),
    labelsOffStage: labels.filter((l) => { const r = rect(l); return r.left < s.left - 1 || r.right > s.right + 1 || r.top < s.top - 1 || r.bottom > s.bottom + 1; }).map((l) => l.textContent),
    labelsOnBubbles: labels.filter((l) => bubbles.some((b) => hits(rect(l), b))).map((l) => l.textContent),
    twoLetterPlaceholders: [...document.querySelectorAll('.world__pins, .world__card, .world__list')].some((n) => RI.test(n.textContent)),
  };
})()`);
const results = () => evaluate(`({ url: location.pathname + location.search + location.hash, count: document.getElementById('prog-count')?.textContent.trim(), chips: [...document.querySelectorAll('#prog-active li')].map((li) => li.textContent.replace('×', '').trim()), cards: [...document.querySelectorAll('[data-card]')].filter((c) => !c.hidden).length, tiles: [...document.querySelectorAll('#discover-places li[data-scope]')].filter((t) => !t.hidden).map((t) => t.querySelector('[data-code]')?.dataset.code), card: document.querySelector('.world__card:not([hidden]) h3')?.textContent || null })`);
const bubbleAt = (pred) => evaluate(`(() => { const c = [...document.querySelectorAll('.world__cluster')].filter((c) => !c.hidden && c.offsetParent).find(${pred}); if (!c) return null; const r = c.querySelector('.world__cluster-n').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, nation: c._nation || '', n: c.querySelector('.world__cluster-n').textContent }; })()`);
const report = { console: logs };
const want = (k) => !ONLY || ONLY.split(',').includes(k);

try {
  /* 1. Rest and the Europe door, both widths, both themes. */
  if (want('grid')) for (const [dev, D] of [['desk', DESK], ['phone', PHONE]]) {
    for (const dark of [false, true]) {
      const th = dark ? 'dark' : 'light';
      await setup(D, dark);
      await open('/?map=globe');
      report[`home-${dev}-${th}-state`] = await globeReady();
      await shot(`h-${dev}-${th}-1-rest`, `Home at rest, ${dev}, ${th}`);
      report[`home-${dev}-${th}-rest`] = await stageState();
      await reducedOn();
      await evaluate(`document.querySelector('.preset[data-scope="nearby"]').click()`);
      await sleep(400);
      await reducedOff();
      await still();
      await sleep(300);
      await shot(`h-${dev}-${th}-2-europe`, `Home, "Nearby · Europe": one bubble per country, with its flag; ${dev}, ${th}`);
      report[`home-${dev}-${th}-europe`] = await stageState();
    }
  }

  /* 2. Desktop: hover, a country's bubble (the plane), the cards (#62), Back. */
  if (want('desk')) {
    await setup(DESK, false);
    await open('/?map=globe');
    await globeReady();
    await reducedOn();
    await evaluate(`document.querySelector('.preset[data-scope="nearby"]').click()`);
    await sleep(400);
    await reducedOff();
    await still();
    /* A bubble of several countries under the pointer: all their outlines. */
    const mixed = await bubbleAt(`(c) => !c._nation && c.querySelectorAll('.world__cluster-flags img').length >= 2`);
    if (mixed) {
      await move(mixed.x, mixed.y);
      await sleep(400);
      await shot('h-desk-light-3b-hover-mixed', `The pointer on a bubble of several countries ("${mixed.n}"): each one's outline`);
      await move(5, 5);
    }
    const b = await bubbleAt(`(c) => c._nation`);
    report.nationBubble = b;
    if (b) {
      await move(b.x, b.y);
      await sleep(400);
      await shot('h-desk-light-3-hover-bubble', `The pointer on ${b.nation}'s bubble: its outline`);
      report.outlineOnBubbleHover = await evaluate(`(() => { const o = document.querySelector('.world__outline'); return { shown: o && o.style.display !== 'none', d: (o?.querySelector('path')?.getAttribute('d') || '').length }; })()`);
      /* The plane: a country's bubble chosen, the flight paused half way. */
      await click(b.x, b.y);
      await sleep(250);
      await g(`g.pause(); g.stepTo(0.5); return true;`);
      await shot('h-desk-light-4-plane', `Half way to ${b.nation} after a click on its bubble: the route and the plane`, { settleMs: 0 });
      report.planeVisible = await evaluate(`(() => { const v = document.querySelector('.world__vehicle'); const r = document.querySelector('.world__route'); return { route: r?.style.display !== 'none', vehicle: v?.style.display !== 'none' }; })()`);
      await g(`g.resume(); return true;`);
      await still();
      await sleep(400);
      await shot('h-desk-light-5-country-arrived', `${b.nation} chosen: its places, its card, neighbours faded`);
      report.afterNationClick = { stage: await stageState(), results: await results() };
      await evaluate(`document.getElementById('prog-count').scrollIntoView({ block: 'start' })`);
      await sleep(300);
      await shot('h-desk-light-6-country-cards', `The cards under the globe after choosing ${b.nation} on it (#62)`);
      await evaluate(`history.back()`);
      await sleep(3500);
      report.afterNationBack = await results();
    }
    /* A land hover (no bubble): the pointer over a country's land. */
    await open('/?map=globe');
    await globeReady();
    await reducedOn();
    await evaluate(`document.querySelector('.preset[data-scope="nearby"]').click()`);
    await sleep(400);
    await reducedOff();
    await still();
    const land = await g(`const s = document.querySelector('.world__stage').getBoundingClientRect(); for (let y = s.top + s.height * 0.35; y < s.bottom - 40; y += 23) for (let x = s.left + 60; x < s.right - 60; x += 29) { const h = g.pickAt(x, y); const el = document.elementFromPoint(x, y); if (h && h.country === 'fr' && !el.closest('.world__pin, .world__cluster')) return { x, y }; } return null;`).catch(() => null);
    if (land) {
      await move(land.x, land.y);
      await sleep(400);
      await shot('h-desk-light-7-hover-land', 'The pointer over a country\'s land: its outline');
    }
    /* A group dived into from the desk: the cards narrow to its countries (#62). */
    await open('/?map=globe');
    await globeReady();
    const big = await bubbleAt(`(c) => !c._nation`);
    report.deskGroup = big;
    if (big) {
      await click(big.x, big.y);
      await sleep(600);
      await still();
      await sleep(400);
      await shot('h-desk-light-8-group-dived', `After a click on the desk's "${big.n}": the countries inside it`);
      report.afterGroupDive = { stage: await stageState(), results: await results() };
      await evaluate(`history.back()`);
      await sleep(3500);
      report.afterGroupBack = await results();
    }
    /* A country with no degree mapped yet, chosen on the globe: its tile. */
    await reducedOn();
    const door = await g(`const p = g.places.find((p) => p.door); if (!p) return null; g.goToCountry(g.country(p.country)); return p.country;`);
    await sleep(600);
    await reducedOff();
    report.doorChoice = { country: door, results: await results() };
    await evaluate(`document.getElementById('prog-count').scrollIntoView({ block: 'start' })`);
    await sleep(300);
    await shot('h-desk-light-9-door-country-cards', `A country without mapped degrees chosen on the globe (${door}): its page's tile under the globe (#62)`);
    /* Search narrows the globe and the cards together. */
    await open('/?map=globe');
    await globeReady();
    await evaluate(`(() => { const q = document.getElementById('f-q'); q.value = 'engineering'; q.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    await sleep(800);
    await shot('h-desk-light-10-search', 'Search "engineering": the globe\'s lights and the cards narrow together');
    report.search = { results: await results(), stage: await stageState(), dimmedPins: await evaluate(`document.querySelectorAll('.world__pin[data-dim]:not([hidden]), .world__cluster[data-dim]:not([hidden])').length`) };
  }

  /* 3. Reset regroups before it lands (round 5, bug 6). */
  if (want('reset')) {
    await setup(DESK, false);
    await open('/?map=globe');
    await globeReady();
    await reducedOn();
    await evaluate(`document.querySelector('.preset[data-scope="nearby"]').click()`);
    await sleep(400);
    await reducedOff();
    await still();
    await evaluate(`document.querySelector('.world__btn[aria-label="Back to the whole view"]').click()`);
    await sleep(60);
    await g(`g.pause(); return true;`);
    report.reset = {};
    for (const f of [0.3, 0.6, 0.9, 1]) {
      await g(`g.stepTo(${f}); return true;`);
      report.reset[f] = await evaluate(`[...document.querySelectorAll('.world__cluster')].filter((c) => !c.hidden).map((c) => c.querySelector('.world__cluster-n').textContent).join(' ')`);
      await shot(`h-desk-light-11-reset-${String(f).replace('.', '')}`, `Reset, ${Math.round(f * 100)}% of the climb`, { settleMs: 0 });
    }
    await g(`g.resume(); return true;`);
  }

  /* 4. Phone: the Europe ending (labels), reduced motion, and /countries/. */
  if (want('phone')) {
    for (const dark of [false, true]) {
      const th = dark ? 'dark' : 'light';
      await setup(PHONE, dark, true);
      await open('/?map=globe');
      await globeReady();
      await evaluate(`document.querySelector('.preset[data-scope="nearby"]').click()`);
      await sleep(800);
      await evaluate(`(() => { const s = document.querySelector('.world__stage'); scrollTo(0, s.getBoundingClientRect().top + scrollY - 60); })()`);
      await shot(`p-${th}-europe-reduced`, `Phone, reduced motion, "Nearby · Europe": labels inside the stage, none on a bubble (${th})`);
      report[`phone-${th}-europe-reduced`] = await stageState();
      await setup(PHONE, dark);
      await open('/countries/?map=globe');
      await globeReady();
      await shot(`c-phone-${th}-rest`, `/countries/ on a phone (${th}): + − Reset in a row above the ring`);
      report[`countries-phone-${th}`] = await evaluate(`(() => {
        const ring = document.querySelector('.world__desk-ring')?.getBoundingClientRect();
        const btns = [...document.querySelectorAll('.world__btn')].map((b) => b.getBoundingClientRect());
        if (!ring) return null;
        const cx = ring.left + ring.width / 2, cy = ring.top + ring.height / 2, R = ring.width / 2;
        const inRing = (r) => [[r.left, r.top], [r.right, r.top], [r.left, r.bottom], [r.right, r.bottom], [(r.left + r.right) / 2, r.bottom]].some(([x, y]) => Math.hypot(x - cx, y - cy) < R);
        return { ringTop: Math.round(ring.top), buttonsBottom: Math.round(Math.max(...btns.map((b) => b.bottom))), buttonOnRing: btns.some(inRing) };
      })()`);
    }
    await setup(DESK, true);
    await open('/countries/?map=globe');
    await globeReady();
    await shot('c-desk-dark-rest', '/countries/ desktop dark: flags in the list and labels');
    report['countries-desk-dark'] = await stageState();
    await setup(DESK, false);
    await open('/destinations/nl/?map=globe');
    await globeReady();
    await shot('nl-desk-light-rest', '/destinations/nl/: a single-country page rests on its places, not one bubble');
    report['nl-desk-light'] = await stageState();
  }
} finally {
  report.shots = shots;
  await fs.writeFile(path.join(OUT, ONLY ? `report-${ONLY.replace(/,/g, '-')}.json` : 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  ws.close();
  chrome.kill();
  await sleep(800);
  await fs.rm(profile, { recursive: true, force: true }).catch(() => {});
}
