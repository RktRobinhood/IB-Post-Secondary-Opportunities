/**
 * Round 3 of #53: evidence for each item of critique-round-2.md, with the
 * owner's own test (phone, tap the United States) measured.
 *
 *   node src/build.mjs                        # SITE_BASE unset
 *   PORT=4415 node scripts/serve.mjs &
 *   CHROME=… PREVIEW=http://127.0.0.1:4415 PROFILE_ROOT=<scratch> \
 *     node docs/research/qa/globe/owner-notes-53/round-3/shoot.mjs
 *
 * The harness is ../shoot53.mjs's (itself ../../shoot.mjs's, cut down). Pages
 * are opened with `?map=globe`, because the headless browser draws WebGL in
 * software and the globe refuses a software renderer on purpose.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const OUT = import.meta.dirname;
const BASE = process.env.PREVIEW || 'http://127.0.0.1:4415';
const CHROME = process.env.CHROME || 'chromium';
const PORT = 9338;

const profile = await fs.mkdtemp(path.join(process.env.PROFILE_ROOT || os.tmpdir(), 'shoot53r3-'));
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

async function setup({ width, height, mobile }, dark) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  await send('Emulation.setTouchEmulationEnabled', { enabled: mobile });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }] });
}
async function open(route, { wait = true } = {}) {
  const loaded = new Promise((r) => listeners.push(function once(m) {
    if (m.method === 'Page.loadEventFired') { listeners.splice(listeners.indexOf(once), 1); r(); }
  }));
  await send('Page.navigate', { url: `${BASE}${route}` });
  if (wait) await loaded;
  return loaded;
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
const g = (body) => evaluate(`(async () => { const g = (await import('/assets/js/map.js')).enhanceWorld(document.querySelector('.world')).globe.debug; ${body} })()`);
const report = { console: logs };

const cardState = () => evaluate(`(() => {
  const cs = [...document.querySelectorAll('.world__card')].filter((c) => !c.hidden);
  const c = cs[0];
  if (!c) return { cards: 0 };
  const st = document.querySelector('.world__stage').getBoundingClientRect();
  const r = c.getBoundingClientRect();
  return {
    cards: cs.length,
    sameAsFirst: window.__card0 ? c.querySelector('h3') === window.__card0 : null,
    title: c.querySelector('h3')?.textContent,
    height: Math.round(r.height),
    visibleOpenLine: [...c.querySelectorAll('*')].some((n) => /^Open\\b/.test(n.textContent.trim()) && n.offsetParent && !n.closest('.visually-hidden') && getComputedStyle(n).position !== 'absolute' && n.children.length === 0 && !n.classList.contains('visually-hidden')),
    overStage: !(r.top >= st.bottom - 1 || r.bottom <= st.top + 1),
    links: c.querySelectorAll('a').length,
  };
})()`);
const markCard = () => evaluate(`(window.__card0 = document.querySelector('.world__card:not([hidden]) h3'), true)`);

/* The buttons against the brass ring, at the size the owner looked at. */
const controlsVsRing = () => evaluate(`(() => {
  /* The ring's centre and radius from the desk's own transform (its
     bounding box is a tilted square's, too big): outer ink at 1.1 radii. */
  const desk = document.querySelector('.world__desk');
  const g = desk?.querySelector(':scope > g[transform]');
  const ctl = document.querySelector('.world__controls');
  if (!g || !ctl || getComputedStyle(desk).display === 'none') return null;
  const m = [0, ...g.getAttribute('transform').match(/[-0-9.]+/g)];
  const d = desk.getBoundingClientRect(), c = ctl.getBoundingClientRect();
  const cx = d.left + +m[1], cy = d.top + +m[2], R = 1.1 * +m[3];
  const nx = Math.max(c.left, Math.min(cx, c.right)), ny = Math.max(c.top, Math.min(cy, c.bottom));
  return { ringR: Math.round(R), gapPx: Math.round(Math.hypot(nx - cx, ny - cy) - R), outsideStage: !ctl.closest('.world__stage') };
})()`);

const pinsReport = () => evaluate(`(() => {
  const st = document.querySelector('.world__stage').getBoundingClientRect();
  const on = (n) => { const r = n.getBoundingClientRect(); return !n.hidden && r.left > st.left && r.right < st.right && r.top > st.top && r.bottom < st.bottom; };
  const pins = [...document.querySelectorAll('.world__pin')].filter(on);
  /* A label that is drawn, whatever says so. */
  const drawn = (p) => getComputedStyle(p.querySelector('.world__pin-label')).display !== 'none';
  const labels = pins.filter(drawn).map((p) => p.textContent.trim());
  return {
    countryPins: pins.filter((p) => !p.hasAttribute('data-school')).length,
    schoolPins: pins.filter((p) => p.hasAttribute('data-school')).length,
    groups: [...document.querySelectorAll('.world__cluster')].filter(on).length,
    labels,
    initialsLabels: labels.filter((t) => /^[A-Z][A-Za-z]?[A-Z][A-Z-]*$/.test(t)),
    /* Every drawn label against every drawn group and every other pin. */
    labelsOverGroups: (() => {
      const hit = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      const ls = pins.filter(drawn).map((p) => ({ name: p.textContent.trim(), r: p.querySelector('.world__pin-label').getBoundingClientRect() }));
      const gs = [...document.querySelectorAll('.world__cluster:not([hidden]) .world__cluster-n')].map((n) => n.getBoundingClientRect());
      return ls.filter((l) => gs.some((g) => hit(l.r, g))).map((l) => l.name);
    })(),
  };
})()`);

/* The chosen country's visible numbers: its groups' figures, its single
   school pins (one each) and its own light if still closed, against the
   number its card gives. */
const chosenReport = (id) => evaluate(`(async () => {
  const g = (await import('/assets/js/map.js')).enhanceWorld(document.querySelector('.world')).globe.debug;
  const p = g.places.find((x) => x.id === ${JSON.stringify(id)});
  const subs = new Set(p.subs.map((x) => x.id));
  let sum = 0, mixedGroups = 0;
  for (const c of document.querySelectorAll('.world__cluster:not([hidden])')) {
    const ms = c._members || [];
    const mine = ms.filter((m) => subs.has(m.id) || m.id === p.id).length;
    if (mine && mine < ms.length) mixedGroups++;
    if (mine === ms.length && mine) sum += Number(c.textContent);
  }
  for (const n of document.querySelectorAll('.world__pin:not([hidden])')) {
    if (subs.has(n.dataset.place)) sum += 1;
    if (n.dataset.place === p.id) sum += p.count;
  }
  const meta = document.querySelector('.world__card:not([hidden]) .world__card-meta')?.textContent || '';
  return { schools: p.subs.length, count: p.count, visibleSum: sum, mixedGroups, card: meta, open: p.open };
})()`);

try {
  /* 1. First moments: the still of the desk globe is there at once, and the
        globe lands on it in the same pose. */
  for (const [dev, dname] of [[DESK, 'desk'], [PHONE, 'phone']]) {
    await setup(dev, false);
    const loaded = await open('/?map=globe', { wait: false });
    await sleep(200);
    await shot(`01-home-${dname}-200ms`, `Home, ${dname}, 200 ms after navigation: the still of the desk globe, no other map`, { settleMs: 0 });
    await loaded;
    report[`poster-${dname}`] = await evaluate(`({ poster: !!document.querySelector('.world__poster'), globe: document.querySelector('.world').dataset.globe })`);
    await globeReady();
    await shot(`01-home-${dname}-globe`, `Home, ${dname}: the globe has landed on the still`);
  }

  /* 2. At rest, both pages, both sizes, both themes; the buttons against the ring. */
  for (const [route, key] of [['/', 'home'], ['/countries/', 'countries'], ['/destinations/nl/', 'nl']]) {
    for (const [dev, dname] of [[DESK, 'desk'], [PHONE, 'phone']]) {
      for (const dark of key === 'nl' ? [false] : [false, true]) {
        await setup(dev, dark);
        await open(`${route}?map=globe`);
        await globeReady();
        if (dname === 'phone') report[`controls-${key}-phone${dark ? '-dark' : ''}`] = await controlsVsRing();
        await shot(`02-${key}-${dname}-${dark ? 'dark' : 'light'}`, `${route}, ${dname}, ${dark ? 'dark' : 'light'}, at rest`);
      }
    }
  }

  /* 3. The owner's phone: home, the United States chosen. One card, drawn
        once: the same card right after the click and after the flight. */
  await setup(PHONE, false);
  await open('/?map=globe');
  await globeReady();
  await g(`const p = g.places.find(p => p.id === 'us'); g.goToPlace(p); return true;`);
  await sleep(60);
  await markCard();
  report.phoneUs = { at60ms: await cardState(), pins60: await pinsReport() };
  await shot('03-phone-home-us-60ms', 'Phone home, the United States tapped: 60 ms — the card, and nothing on the ring', { settleMs: 0 });
  await sleep(340);
  report.phoneUs.at400ms = await cardState();
  await shot('03-phone-home-us-400ms', 'Phone home, 400 ms: the same card, mid-turn', { settleMs: 0 });
  await sleep(6000);
  report.phoneUs.arrived = await cardState();
  report.phoneUs.pins = await pinsReport();
  report.phoneUs.chosen = await chosenReport('us');
  report.phoneUs.alt = await g(`return +g.view.alt.toFixed(3);`);
  await evaluate(`document.querySelector('.world').scrollIntoView({ block: 'start', behavior: 'instant' }); scrollBy(0, -70)`);
  await shot('03-phone-home-us-arrived', 'Phone home, after the flight: the same card, below the stage; the US framed on its schools');

  /* 4. The Denmark door on a phone lands with Denmark's places open. */
  await open('/?map=globe');
  await globeReady();
  await evaluate(`document.querySelector('.preset--here').click()`);
  await sleep(6500);
  report.phoneDenmarkDoor = await pinsReport();
  await evaluate(`document.querySelector('.world').scrollIntoView({ block: 'start', behavior: 'instant' }); scrollBy(0, -70)`);
  await shot('04-phone-home-denmark-door', 'Phone home, the "Right here" door: Denmark with its places open');

  /* 5. Desktop /countries/: the United States framed on its schools, with
        names and photographs; then a school's card. */
  await setup(DESK, false);
  await open('/countries/?map=globe');
  await globeReady();
  await g(`const p = g.places.find(p => p.id === 'us'); g.goToPlace(p); return true;`);
  await sleep(6500);
  report.countriesUs = { card: await cardState(), pins: await pinsReport(), chosen: await chosenReport('us'), alt: await g(`return +g.view.alt.toFixed(3);`) };
  await shot('05-countries-us-framed', '/countries/, the United States chosen: framed on its schools, still a sphere, readable names');
  await g(`const s = g.places.find(p => p.id === 'us').subs.find(s => /Michigan/.test(s.name)); g.goToPlace(s); return true;`);
  await sleep(2600);
  report.schoolCard = await cardState();
  await shot('06-countries-school-card', 'A school chosen: its card opens on its photograph and is the link');

  /* 6. The biggest group at rest, clicked: it comes apart into countries,
        not into every school at once. */
  await open('/countries/?map=globe');
  await globeReady();
  const big = await evaluate(`(() => { const c = [...document.querySelectorAll('.world__cluster:not([hidden])')].sort((a, b) => (b._members?.length || 0) - (a._members?.length || 0))[0]; const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, n: c.textContent }; })()`);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: big.x, y: big.y });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: big.x, y: big.y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: big.x, y: big.y, button: 'left', clickCount: 1 });
  await sleep(6500);
  report.bigGroup = { clicked: big.n, alt: await g(`return +g.view.alt.toFixed(3);`), pins: await pinsReport() };
  await shot('07-countries-big-group', `/countries/, the "${big.n}" group clicked: Europe's countries, a sphere on the paper`);

  /* 7. Zoomed in over Europe: the schools level, names not initials. */
  await g(`g.flyTo({ lat: 51, lon: 10, alt: 0.3 }); return true;`);
  await sleep(4500);
  report.europeSchools = await pinsReport();
  await shot('08-countries-europe-schools', '/countries/ at 0.3 radii over Germany: schools with readable names, feathered edges');

  /* 7b. "All places" opened on desktop home: a real list. */
  await setup(DESK, false);
  await open('/?map=globe');
  await globeReady();
  await evaluate(`document.querySelector('.world__fold').open = true`);
  await sleep(500);
  report.allPlaces = await evaluate(`(() => { const l = document.querySelector('.world__list'); const r = l.getBoundingClientRect(); return { width: Math.round(r.width), height: Math.round(r.height), links: l.querySelectorAll('a').length }; })()`);
  await evaluate(`document.querySelector('.world__fold').scrollIntoView({ block: 'center', behavior: 'instant' })`);
  await shot('11-home-desk-all-places', 'Home, desktop: "All places" opened is a real list under the globe', { settleMs: 200 });

  /* 8. Home desktop, the Nearby door: the numbers beside each other. */
  await open('/?map=globe');
  await globeReady();
  await evaluate(`document.querySelector('.preset--nearby').click()`);
  await sleep(6000);
  report.nearby = await evaluate(`({ door: document.querySelector('.preset--nearby .preset__count')?.textContent, count: document.getElementById('prog-count')?.textContent, globe: [...document.querySelectorAll('.world__cluster:not([hidden]) .world__cluster-n')].map(n => n.textContent) })`);
  await shot('09-home-nearby-door', 'Home, the Nearby door');

  /* 9. No globe (as with no WebGL): the still stays, one line, the list folded. */
  for (const [dev, dname] of [[DESK, 'desk'], [PHONE, 'phone']]) {
    await setup(dev, false);
    await open('/?map=off');
    await sleep(600);
    report[`off-${dname}`] = await evaluate(`({ globe: document.querySelector('.world').dataset.globe, posterShown: !!document.querySelector('.world__poster')?.offsetParent, foldOpen: document.querySelector('.world__fold')?.open })`);
    await shot(`10-home-${dname}-no-globe`, `Home, ${dname}, no globe (?map=off): the still, one line, the list one tap away`, { settleMs: 200 });
  }
} finally {
  report.shots = shots;
  await fs.writeFile(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  ws.close();
  chrome.kill();
  await sleep(800);
  await fs.rm(profile, { recursive: true, force: true }).catch(() => {});
}
