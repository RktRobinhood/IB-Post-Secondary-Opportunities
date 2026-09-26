/**
 * Evidence for the owner's notes on #53: the globe floats, no old map
 * flashes first, the card is the link, country lights sit in the middle, and
 * a big country opens into its schools.
 *
 *   node src/build.mjs                        # SITE_BASE unset
 *   PORT=4413 node scripts/serve.mjs &
 *   CHROME=… PREVIEW=http://127.0.0.1:4413 PROFILE_ROOT=<scratch> \
 *     node docs/research/qa/globe/owner-notes-53/shoot53.mjs
 *
 * The DevTools-protocol harness is the one in ../shoot.mjs, cut down to what
 * these shots need. Pages are opened with `?map=globe`, because a headless
 * browser draws WebGL in software and the globe refuses a software renderer
 * on purpose (a real laptop with a GPU needs no flag). JPEG at q80 keeps each
 * shot well under 400 kB.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const OUT = import.meta.dirname;
const BASE = process.env.PREVIEW || 'http://127.0.0.1:4413';
const CHROME = process.env.CHROME || 'chromium';
const PORT = 9334;

const profile = await fs.mkdtemp(path.join(process.env.PROFILE_ROOT || os.tmpdir(), 'shoot53-'));
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
/* BEFORE=1: only the first moments, against a build of the code before this
   change (served on PREVIEW), named 00-before-*, for the comparison. */
const BEFORE = !!process.env.BEFORE;
const pre = BEFORE ? '00-before' : '01';

try {
  /* 1. The first moments: nothing but the page and an empty stage, then the
        globe. A flat map would be on screen at 200 ms, before the globe. */
  for (const [route, key] of [['/', 'home'], ['/countries/', 'countries']]) {
    await setup(DESK, false);
    const loaded = await open(`${route}?map=globe`, { wait: false });
    await sleep(200);
    report[`${key}-200ms`] = await evaluate(`({ svgMaps: document.querySelectorAll('.world svg.world__svg, .world__land, .world__place').length, stageChildren: [...(document.querySelector('.world__stage')?.children || [])].map(c => c.className || c.tagName), globe: document.querySelector('.world')?.dataset.globe || null })`).catch((e) => String(e));
    await shot(`${pre}-${key}-desk-light-200ms`, BEFORE ? `${route} 200 ms after navigation, before this change: the flat map is the first paint` : `${route} 200 ms after navigation: the stage is empty, no flat map`, { settleMs: 0 });
    await loaded;
    await sleep(300);
    await shot(`${pre}-${key}-desk-light-load`, `${route} at the load event${BEFORE ? ', before this change' : ''}`, { settleMs: 0 });
    if (BEFORE) { await globeReady(); await shot(`${pre}-${key}-desk-light-globe`, `${route} once the globe has replaced it, before this change`); }
  }

  if (BEFORE) throw 'done';
  /* 2. At rest: home and /countries/, desktop and phone, light and dark. */
  for (const [route, key] of [['/', 'home'], ['/countries/', 'countries']]) {
    for (const [dev, dname] of [[DESK, 'desk'], [PHONE, 'phone']]) {
      for (const dark of [false, true]) {
        await setup(dev, dark);
        await open(`${route}?map=globe`);
        report[`${key}-${dname}-${dark ? 'dark' : 'light'}`] = await globeReady();
        await shot(`02-${key}-${dname}-${dark ? 'dark' : 'light'}`, `${route}, ${dname}, ${dark ? 'dark' : 'light'} theme, globe at rest`);
      }
    }
  }

  /* 3. /countries/: the United States' light is in the middle of the country;
        choose it, the card opens, the country opens into its schools; the
        card is one link and clicking its body goes to the country page. */
  await setup(DESK, false);
  await open('/countries/?map=globe');
  await globeReady();
  report.usLight = await g(`const p = g.places.find(p => p.id === 'us'); return p && { lat: p.lat, lon: p.lon, schools: p.subs.length };`);
  await g(`const p = g.places.find(p => p.id === 'us'); g.flyTo({ lat: p.lat, lon: p.lon, alt: 2.4 }); return true;`);
  await sleep(4000);
  await shot('03-countries-us-light-centred', 'The United States light at the middle of the country (Kansas), before zooming in');
  await g(`const p = g.places.find(p => p.id === 'us'); g.goToPlace(p); return true;`);
  await sleep(6000);
  report.usOpen = await evaluate(`({ schoolPins: document.querySelectorAll('.world__pin[data-school]:not([hidden])').length, groups: document.querySelectorAll('.world__cluster:not([hidden])').length, usPinHidden: document.querySelector('.world__pin[data-place="us"]')?.hidden })`);
  report.card = await evaluate(`(() => { const c = document.querySelector('.world__card:not([hidden])'); if (!c) return null; return { links: c.querySelectorAll('a').length, href: c.querySelector('a')?.getAttribute('href'), nestedInteractive: c.querySelectorAll('a button, a a, a [tabindex]').length, linkName: c.querySelector('a')?.textContent.trim() }; })()`);
  await shot('04-countries-us-schools-and-card', 'Chosen: the US card (one link) and the US opened into its schools');
  /* A click on the card's body, away from the title: it must navigate. */
  const body = await evaluate(`(() => { const c = document.querySelector('.world__card:not([hidden])'); const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.bottom - 12 }; })()`);
  const nav = new Promise((r) => listeners.push(function once(m) {
    if (m.method === 'Page.frameNavigated' && !m.params.frame.parentId) { listeners.splice(listeners.indexOf(once), 1); r(m.params.frame.url); }
  }));
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: body.x, y: body.y });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: body.x, y: body.y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: body.x, y: body.y, button: 'left', clickCount: 1 });
  report.cardClickWentTo = await Promise.race([nav, sleep(4000).then(() => null)]);
  await sleep(1500);
  await shot('05-card-click-landed', 'After clicking the card body (not the title): the United States page', { settleMs: 200 });

  /* 4. A school on the globe: its own card, a link to its own page. */
  await open('/countries/?map=globe');
  await globeReady();
  await g(`const p = g.places.find(p => p.id === 'us'); g.flyTo({ lat: 40.5, lon: -75, alt: 0.3 }); return true;`);
  await sleep(4500);
  await shot('06-countries-us-east-schools', 'Zoomed in over the US east coast: the schools as their own dots and groups');
  await g(`const s = g.places.find(p => p.id === 'us').subs.find(s => /Harvard/.test(s.name)); g.goToPlace(s); return true;`);
  /* Taken on the way down: this sandbox has no network, so the street map
     the dive hands over to cannot load its tiles. */
  await sleep(2600);
  report.schoolCard = await evaluate(`(() => { const c = document.querySelector('.world__card:not([hidden])'); return c && { title: c.querySelector('h3')?.textContent, href: c.querySelector('a')?.getAttribute('href') }; })()`);
  await shot('07-countries-harvard-card', 'A school chosen: its card is a link to its page on this site');

  /* 5. Home: Europe opens into schools at the altitude a chosen place is flown to. */
  await setup(DESK, false);
  await open('/?map=globe');
  await globeReady();
  await g(`g.flyTo({ lat: 51.5, lon: 8, alt: 0.42 }); return true;`);
  await sleep(4500);
  report.homeEurope = await evaluate(`({ schoolPins: document.querySelectorAll('.world__pin[data-school]:not([hidden])').length, groups: document.querySelectorAll('.world__cluster:not([hidden])').length })`);
  await shot('08-home-europe-schools', 'Home, over Germany and the Low Countries: countries opened into schools');

  /* 6. Without the globe (?map=off, as with no WebGL): the list and one line. */
  for (const [route, key] of [['/', 'home'], ['/countries/', 'countries']]) {
    await setup(DESK, false);
    await open(`${route}?map=off`);
    await sleep(500);
    await evaluate(`(() => { const o = document.querySelector('.world__off'); scrollTo({ top: Math.max(0, o.getBoundingClientRect().top + scrollY - 90), behavior: 'instant' }); })()`);
    await sleep(300);
    report[`${key}-off`] = await evaluate(`({ globe: document.querySelector('.world').dataset.globe, why: document.querySelector('.world').dataset.globeOff, stageShown: getComputedStyle(document.querySelector('.world__stage')).display !== 'none', listVisible: document.querySelector('.world__list').getBoundingClientRect().height > 20 })`);
    await shot(`09-${key}-no-globe`, `${route} with the globe unavailable (?map=off): the list and one line`, { settleMs: 200 });
  }
} catch (e) {
  if (e !== 'done') throw e;
} finally {
  report.shots = shots;
  await fs.writeFile(path.join(OUT, BEFORE ? 'report-before.json' : 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  ws.close();
  chrome.kill();
  await sleep(800);
  await fs.rm(profile, { recursive: true, force: true }).catch(() => {});
}
