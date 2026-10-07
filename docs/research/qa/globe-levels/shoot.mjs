/**
 * Evidence for the globe's levels (owner, 6 October 2026): world → continent →
 * country → university on the home page (and /countries/).
 *
 *   npm run dev   (or any server of dist/)
 *   PREVIEW=http://127.0.0.1:4321 ROUND=round-1 PROFILE_ROOT=D:/ibp-tmp \
 *     node docs/research/qa/globe-levels/shoot.mjs
 *
 * The DevTools-protocol harness of ../globe/round-6/shoot6.mjs. Pages open with
 * `?map=globe` (headless Chrome draws WebGL in software, which the globe
 * refuses on purpose). Real mouse, wheel and touch events where the point is
 * the input; mid-flight frames by pausing the flight (debug.stepTo). JPEG q82.
 * Writes report.json beside the shots in ROUND/.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const OUT = path.join(import.meta.dirname, process.env.ROUND || 'round-1');
await fs.mkdir(OUT, { recursive: true });
const BASE = process.env.PREVIEW || 'http://127.0.0.1:4321';
const CHROME = process.env.CHROME || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const PORT = 9341;
const ONLY = process.env.ONLY || '';

const profile = await fs.mkdtemp(path.join(process.env.PROFILE_ROOT || os.tmpdir(), 'levels-'));
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

const DESK = { width: 1366, height: 860, mobile: false };
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
    return f.dataset.globe + (f.dataset.globeOff ? ': ' + f.dataset.globeOff : '') + (f.hasAttribute('data-levels') ? ' levels' : '');
  })()`);
}
const settle = (ms = 600) => evaluate(`new Promise((r) => { const t0 = performance.now(); (function f() { if (performance.now() - t0 > ${ms}) r(true); else requestAnimationFrame(f); })(); })`);
const shots = [];
async function shot(name, what, { settleMs = 500, clip = null } = {}) {
  if (settleMs) await settle(settleMs);
  const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 82, ...(clip ? { clip: { ...clip, scale: 1 } } : {}) });
  const buf = Buffer.from(r.data, 'base64');
  await fs.writeFile(path.join(OUT, `${name}.jpg`), buf);
  shots.push({ file: `${name}.jpg`, kB: Math.round(buf.length / 1024), what });
  console.log(`  ${name}.jpg  ${what}`);
}
const G = `(await import('/assets/js/map.js')).enhanceWorld(document.querySelector('.world')).globe`;
const g = (body) => evaluate(`(async () => { const g = ${G}.debug; ${body} })()`);
const mouse = (type, x, y, extra = {}) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1, ...extra });
const move = (x, y) => mouse('mouseMoved', x, y, { button: 'none' });
const click = async (x, y) => { await move(x, y); await mouse('mousePressed', x, y); await mouse('mouseReleased', x, y); };
const wheel = (x, y, deltaY) => send('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 0, deltaY, button: 'none' });
const tap = async (x, y) => {
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
};
/** Wait until no flight is under way (the camera stops changing). */
/* Still for 0.6 s on end: a flight's first half second can turn the globe
   almost in place before it leans in, which a single repeat mistook for rest. */
const still = () => evaluate(`(async () => { const g = ${G}.debug; let last = '', same = 0; for (let i = 0; i < 120; i++) { await new Promise(r => setTimeout(r, 140)); const k = [g.view.lat, g.view.lon, g.view.alt].map(v => v.toFixed(4)).join(); same = k === last ? same + 1 : 0; if (same >= 4) return true; last = k; } return false; })()`);
const stageClip = () => evaluate(`(() => { const f = document.querySelector('.world'); const r = f.getBoundingClientRect(); return { x: Math.max(0, r.left - 8), y: Math.max(0, r.top - 8), width: Math.min(innerWidth, r.width + 16), height: Math.min(innerHeight - Math.max(0, r.top - 8), r.height + 16) }; })()`);

/* What is on the stage: the level, each node (kind, number, label), the pins,
   any two nodes that overlap, any label off the stage or on a node. */
const stageState = () => evaluate(`(async () => {
  const g = ${G}.debug;
  const s = document.querySelector('.world__stage').getBoundingClientRect();
  const vis = (e) => !e.hidden && e.offsetParent !== null && getComputedStyle(e).opacity > 0.05;
  const rect = (e) => e.getBoundingClientRect();
  const hits = (a, b, pad = 0) => a.left + pad < b.right && a.right - pad > b.left && a.top + pad < b.bottom && a.bottom - pad > b.top;
  const nodes = [...document.querySelectorAll('.world__cluster')].filter(vis).map((c) => ({ kind: c.dataset.kind, n: c.querySelector('.world__cluster-n').textContent, label: c.hasAttribute('data-label') ? c.querySelector('.world__cluster-label').textContent : '', r: rect(c.querySelector('.world__cluster-n')), faded: +c.style.opacity < 0.9 }));
  const pins = [...document.querySelectorAll('.world__pin')].filter(vis).map((p) => ({ name: p.querySelector('.world__pin-label').textContent, label: p.hasAttribute('data-label'), r: rect(p.querySelector('.world__pin-dot')), dim: p.hasAttribute('data-dim') }));
  const dots = [...nodes.map((n) => n.r), ...pins.map((p) => p.r)];
  let overlaps = 0;
  for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) if (hits(dots[i], dots[j], 1)) overlaps++;
  const labels = [...document.querySelectorAll('.world__pin[data-label] .world__pin-label, .world__cluster[data-label] .world__cluster-label')].filter((l) => l.offsetParent !== null);
  return {
    level: { ...g.lv },
    trail: document.querySelector('.world__trail:not([hidden])')?.textContent.replace(/\\s+/g, ' ').trim() || '',
    card: document.querySelector('.world__card:not([hidden]) h3')?.textContent || null,
    cardMeta: document.querySelector('.world__card:not([hidden]) .world__card-meta')?.textContent || null,
    cardHref: document.querySelector('.world__card:not([hidden]) a.world__card-link')?.getAttribute('href') || null,
    nodes: nodes.map(({ r, ...n }) => n),
    pins: pins.length, pinLabels: pins.filter((p) => p.label).length, dimPins: pins.filter((p) => p.dim).length,
    overlaps,
    labelsOffStage: labels.filter((l) => { const r = rect(l); return r.left < s.left - 1 || r.right > s.right + 1 || r.top < s.top - 1 || r.bottom > s.bottom + 1; }).map((l) => l.textContent),
    labelsOnNodes: labels.filter((l) => dots.some((b) => hits(rect(l), b, 1))).map((l) => l.textContent),
    zoomIn: !document.querySelector('.world__btn[aria-label="Zoom in"]')?.disabled,
    zoomOut: !document.querySelector('.world__btn[aria-label="Zoom out"]')?.disabled,
    url: location.pathname + location.search + location.hash,
    alt: +g.view.alt.toFixed(3),
  };
})()`);
const nodeAt = (pred) => evaluate(`(() => { const c = [...document.querySelectorAll('.world__cluster, .world__pin')].filter((c) => !c.hidden && c.offsetParent).find(${pred}); if (!c) return null; const r = (c.querySelector('.world__cluster-n') || c.querySelector('.world__pin-dot')).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, label: (c.querySelector('.world__cluster-label') || c.querySelector('.world__pin-label'))?.textContent || '' }; })()`);
const report = { console: logs, runs: {} };
const want = (k) => !ONLY || ONLY.split(',').includes(k);
const log = (k, v) => { report.runs[k] = v; };

/** One whole walk at one size and theme: world → continent → country → university → back up. */
async function walk(dev, D, dark) {
  const th = dark ? 'dark' : 'light';
  const p = `${dev}-${th}`;
  await setup(D, dark);
  await open('/?map=globe');
  log(`${p}-ready`, await globeReady());
  const clip = dev === 'desk' ? await stageClip() : null;
  await shot(`${p}-1-world`, `World level at rest (${dev}, ${th})`);
  log(`${p}-1-world`, await stageState());
  const eu = await nodeAt(`(c) => c.dataset.kind === 'region' && /Europe/.test(c.textContent)`);
  if (dev === 'desk' && eu) {
    await move(eu.x, eu.y);
    await sleep(400);
    await shot(`${p}-1b-hover-europe`, 'The pointer on the Europe bubble: its countries outlined', { clip });
  }
  if (!eu) return;
  if (dev === 'phone') await tap(eu.x, eu.y); else await click(eu.x, eu.y);
  await sleep(300);
  if (dev === 'desk' && !dark) {
    await g(`g.pause(); g.stepTo(0.35); return true;`);
    await shot(`${p}-2a-to-europe-35`, 'Mid-flight to Europe, 35%', { settleMs: 0, clip });
    await g(`g.stepTo(0.7); return true;`);
    await shot(`${p}-2b-to-europe-70`, 'Mid-flight to Europe, 70%', { settleMs: 0, clip });
    await g(`g.resume(); return true;`);
  }
  await still();
  await sleep(500);
  await shot(`${p}-2-europe`, `Continent level: Europe opened into its countries (${dev}, ${th})`);
  log(`${p}-2-europe`, await stageState());
  const dk = await nodeAt(`(c) => c._nation === 'dk'`);
  if (!dk) return;
  if (dev === 'phone') await tap(dk.x, dk.y); else await click(dk.x, dk.y);
  await sleep(300);
  if (dev === 'desk' && !dark) {
    await g(`g.pause(); g.stepTo(0.5); return true;`);
    await shot(`${p}-3a-to-denmark-50`, 'Mid-flight to Denmark, 50%: the route and the plane', { settleMs: 0, clip });
    await g(`g.resume(); return true;`);
  }
  await still();
  await sleep(600);
  await shot(`${p}-3-denmark`, `Country level: Denmark, its card and its universities (${dev}, ${th})`);
  log(`${p}-3-denmark`, await stageState());
  const uni = await nodeAt(`(c) => c.classList.contains('world__pin') && /Aarhus/.test(c.textContent)`);
  if (uni) {
    if (dev === 'desk') { await move(uni.x, uni.y); await sleep(300); }
    if (dev === 'phone') await tap(uni.x, uni.y); else await click(uni.x, uni.y);
    await still();
    await sleep(500);
    await shot(`${p}-4-university`, `University level: Aarhus University's card (${dev}, ${th})`);
    log(`${p}-4-university`, await stageState());
  }
  if (dev === 'phone') {
    await evaluate(`window.scrollBy(0, 300)`);
    await sleep(300);
    await shot(`${p}-4b-university-card`, 'The university card below the stage on a phone');
    await evaluate(`window.scrollBy(0, -300)`);
  }
  /* Up with the trail: Europe, then World. */
  const crumb = await evaluate(`(() => { const b = [...document.querySelectorAll('.world__trail-btn')].find((b) => /Europe/.test(b.textContent)); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  if (crumb) {
    if (dev === 'phone') await tap(crumb.x, crumb.y); else await click(crumb.x, crumb.y);
    await still();
    await sleep(500);
    await shot(`${p}-5-back-to-europe`, 'Trail "Europe": back up to the continent');
    log(`${p}-5-back-to-europe`, await stageState());
  }
  await evaluate(`history.back()`);
  await still();
  await sleep(500);
  log(`${p}-6-history-back`, await stageState());
}

try {
  /* A one-off question: PROBE_URL opened at desk size, PROBE (a function body
     given `g`, the globe's debug handle) evaluated, its answer printed. */
  if (process.env.PROBE) {
    await setup(process.env.PROBE_PHONE ? PHONE : DESK, false, !!process.env.PROBE_REDUCED);
    await open(process.env.PROBE_URL || '/?map=globe');
    console.log('ready', await globeReady());
    console.log(JSON.stringify(await g(process.env.PROBE), null, 1));
  }
  /* Every university, every country listed: a real click (a tap on a phone)
     at its dot's centre must open that university's own card. */
  if (want('pinclicks')) {
    for (const [dev, D] of [['desk', DESK], ['phone', PHONE]]) {
      await setup(D, false, true);
      await open('/?map=globe');
      await globeReady();
      let total = 0, wrong = 0;
      const misses = [];
      for (const code of (process.env.CODES || 'dk,gb,nl,jp,us,au,de,fr,ch,ae,sg,hk,mt,lu,cn,ca,it,es').split(',')) {
        await g(`g.goToCountry(g.country('${code}') || g.places.find(p => p.country === '${code}') && { id: '${code}', name: '${code}', rings: [], start: 0, count: 0, frame: [g.places.find(p => p.country === '${code}').xyz] }); return true;`);
        await sleep(700);
        const pins = await evaluate(`[...document.querySelectorAll('.world__pin[data-school]')].filter((p) => !p.hidden && p.offsetParent).map((p) => { const r = p.querySelector('.world__pin-dot').getBoundingClientRect(); return { id: p.dataset.place, name: p.querySelector('.world__pin-label').textContent, x: r.left + r.width / 2, y: r.top + r.height / 2 }; })`);
        for (const first of pins) {
          /* Where it is now: a dot can shift a little when the card beside it changes. */
          const pin = await evaluate(`(() => { const p = document.querySelector('.world__pin[data-place="${first.id}"]'); if (!p || p.hidden) return null; const r = p.querySelector('.world__pin-dot').getBoundingClientRect(); return { id: p.dataset.place, name: p.querySelector('.world__pin-label').textContent, x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
          if (!pin) { misses.push(`${code}: ${first.name} gone`); continue; }
          if (pin.y < 0 || pin.y > D.height) continue;
          /* Only a dot the reader can see: not one under the card or a button. */
          const clear = await evaluate(`(() => { const e = document.elementFromPoint(${pin.x}, ${pin.y}); return !!e && !e.closest('.world__card, .world__controls, .world__trail') && !!e.closest('.world__stage'); })()`);
          if (!clear) { misses.push(`${code}: ${pin.name} covered`); continue; }
          if (dev === 'phone') await tap(pin.x, pin.y); else await click(pin.x, pin.y);
          await sleep(520);
          const got = await evaluate(`document.querySelector('.world__card:not([hidden]) h3')?.textContent.replace(/ —.*$/, '').replace('→', '').trim() || ''`);
          total++;
          if (got !== pin.name) { wrong++; misses.push(`${code}: ${pin.name} -> ${got || '(nothing)'}`); }
        }
      }
      log(`pinclicks-${dev}`, { total, wrong, misses });
      console.log(`  pinclicks ${dev}: ${wrong}/${total} wrong`, misses.slice(0, 12).join(' | '));
    }
  }
  /* The round-2 blockers: a double click mid-flight, a click on a name, and
     Back after one door then another. */
  if (want('regress')) {
    const out = {};
    for (const [dev, D] of [['desk', DESK], ['phone', PHONE]]) {
      await setup(D, false);
      await open('/?map=globe');
      await globeReady();
      const eu = await nodeAt(`(c) => c.dataset.kind === 'region' && /Europe/.test(c.textContent)`);
      if (dev === 'phone') { await tap(eu.x, eu.y); await sleep(120); await tap(eu.x, eu.y); }
      else { await click(eu.x, eu.y); await sleep(120); await mouse('mousePressed', eu.x, eu.y, { clickCount: 2 }); await mouse('mouseReleased', eu.x, eu.y, { clickCount: 2 }); }
      await still();
      const r1 = await g(`return { lv: g.lv.level, alt: +g.view.alt.toFixed(2) };`);
      /* names: press each country's name at the continent level */
      const names = await evaluate(`[...document.querySelectorAll('.world__cluster[data-kind="country"][data-label] .world__cluster-label')].filter((l) => l.offsetParent).map((l) => { const r = l.getBoundingClientRect(); return { code: l.closest('.world__cluster')._nation, x: r.left + r.width - 6, y: r.top + r.height / 2 }; })`);
      let right = 0; const wrongs = [];
      for (const n of names.slice(0, 26)) {
        await g(`g.goToRegion('europe', { push: false }); return true;`);
        await still();
        const now = await evaluate(`(() => { const c = [...document.querySelectorAll('.world__cluster')].find((c) => c._nation === '${n.code}' && !c.hidden); const l = c?.querySelector('.world__cluster-label'); if (!l || !l.offsetParent) return null; const r = l.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
        if (!now) continue;
        if (dev === 'phone') await tap(now.x, now.y); else await click(now.x, now.y);
        await sleep(400);
        const got = await g(`return g.lv.country;`);
        if (got === n.code) right++; else wrongs.push(`${n.code}->${got}`);
      }
      out[dev] = { doubleClickEurope: r1, names: `${right}/${names.slice(0, 26).length}`, wrongs };
      /* door then door then Back */
      await open('/?map=globe');
      await globeReady();
      await evaluate(`document.querySelector('.preset[data-scope="nearby"]').click()`);
      await still();
      await evaluate(`document.querySelector('.preset[data-scope="far"]').click()`);
      await still();
      await evaluate(`history.back()`);
      await sleep(400);
      await still();
      out[dev].nearbyFarBack = await g(`return { lv: g.lv.level + ':' + g.lv.region, scope: new URLSearchParams(location.search).get('scope') };`);
      await open('/?map=globe');
      await globeReady();
      await evaluate(`document.querySelector('.preset[data-scope="here"]').click()`);
      await still();
      await evaluate(`document.querySelector('.preset[data-scope="nearby"]').click()`);
      await still();
      await evaluate(`history.back()`);
      await sleep(400);
      await still();
      out[dev].hereNearbyBack = await g(`return { lv: g.lv.level + ':' + (g.lv.country || g.lv.region), scope: new URLSearchParams(location.search).get('scope') };`);
      await open('/?map=globe#country=dk');
      await globeReady();
      await still();
      out[dev].deepLink = await evaluate(`({ count: document.getElementById('prog-count')?.textContent.trim(), card: document.querySelector('.world__card:not([hidden]) .world__card-meta')?.textContent })`);
    }
    log('regress', out);
    console.log(JSON.stringify(out, null, 1));
  }
  /* A double click on Europe, five times over, with the camera sampled. */
  if (want('dbl')) {
    await setup(DESK, false);
    for (let k = 0; k < 5; k++) {
      await open('/?map=globe');
      await globeReady();
      const eu = await nodeAt(`(c) => c.dataset.kind === 'region' && /Europe/.test(c.textContent)`);
      await evaluate(`window.__trace = []; (async () => { const g = ${G}.debug; const t0 = performance.now(); for (let i = 0; i < 40; i++) { await new Promise(r => setTimeout(r, 100)); window.__trace.push([Math.round(performance.now() - t0), +g.view.alt.toFixed(2), g.lv.level]); } })(); true`);
      await click(eu.x, eu.y); await sleep(120); await mouse('mousePressed', eu.x, eu.y, { clickCount: 2 }); await mouse('mouseReleased', eu.x, eu.y, { clickCount: 2 });
      await sleep(4300);
      const tr = await evaluate(`window.__trace`);
      console.log(k, tr.filter((_, i) => i % 3 === 0).map((x) => x.join(':')).join(' '));
    }
  }
  if (want('walk')) {
    await walk('desk', DESK, false);
    await walk('desk', DESK, true);
    await walk('phone', PHONE, false);
    await walk('phone', PHONE, true);
  }

  /* The wheel and the buttons: one step per gesture. */
  if (want('input')) {
    await setup(DESK, false);
    await open('/?map=globe');
    await globeReady();
    const s = await evaluate(`(() => { const r = document.querySelector('.world__stage').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
    await click(s.x, s.y - 300); // take hold of the globe (sky above it)
    await sleep(300);
    const eu = await nodeAt(`(c) => c.dataset.kind === 'region' && /Europe/.test(c.textContent)`);
    for (let i = 0; i < 12; i++) { await wheel(eu.x, eu.y, -40); await sleep(30); } // one trackpad swipe, momentum tail and all
    await still();
    log('wheel-in-once', await stageState());
    await shot('input-1-wheel-into-europe', 'One swipe of the wheel over Europe: one step in, to the continent');
    await sleep(400);
    for (let i = 0; i < 6; i++) { await wheel(s.x, s.y, 60); await sleep(30); }
    await still();
    log('wheel-out-once', await stageState());
    await evaluate(`document.querySelector('.world__btn[aria-label="Zoom in"]').click()`);
    await still();
    log('button-plus-world', await stageState());
    await evaluate(`document.querySelector('.world__btn[aria-label="Zoom in"]').click()`);
    await still();
    log('button-plus-region', await stageState());
    await shot('input-2-plus-plus', 'Two presses of +: a continent, then the country nearest the middle');
    await evaluate(`document.querySelector('.world__btn[aria-label="Zoom out"]').click()`);
    await still();
    log('button-minus', await stageState());
    await evaluate(`document.querySelector('.world__btn[aria-label="Back to the whole view"]').click()`);
    await still();
    log('button-reset', await stageState());
    /* Asia, then a big country, then the UK at country level. */
    for (const [region, country, name] of [['asia', 'jp', 'japan'], ['north-america', 'us', 'usa'], ['europe', 'gb', 'uk']]) {
      await g(`g.goToRegion('${region}'); return true;`);
      await still();
      await sleep(400);
      await shot(`input-3-${region}`, `Continent level: ${region}`);
      log(`region-${region}`, await stageState());
      const c = await nodeAt(`(c) => c._nation === '${country}'`);
      if (c) { await click(c.x, c.y); await still(); await sleep(500); }
      await shot(`input-4-${name}`, `Country level: ${name}`);
      log(`country-${name}`, await stageState());
    }
    /* A click on a country's land (Germany) from the world. */
    await evaluate(`document.querySelector('.world__btn[aria-label="Back to the whole view"]').click()`);
    await still();
    const land = await g(`const s = document.querySelector('.world__stage').getBoundingClientRect(); for (let y = s.top + 40; y < s.bottom - 40; y += 7) for (let x = s.left + 40; x < s.right - 40; x += 7) { const h = g.pickAt(x, y); const el = document.elementFromPoint(x, y); if (h && h.country === 'de' && !el.closest('.world__pin, .world__cluster')) return { x, y }; } return null;`).catch(() => null);
    if (land) {
      await click(land.x, land.y);
      await sleep(400);
      await still();
      await sleep(400);
      await shot('input-5-land-germany', 'A click on Germany\'s land from the world: straight to the country');
      log('land-germany', await stageState());
    }
  }

  /* The doors and a filter. */
  if (want('doors')) {
    await setup(DESK, false);
    for (const door of ['nearby', 'here', 'far']) {
      await open('/?map=globe');
      await globeReady();
      await evaluate(`document.querySelector('.preset[data-scope="${door}"]').click()`);
      await sleep(400);
      await still();
      await sleep(400);
      await shot(`doors-${door}`, `The "${door}" door`);
      log(`door-${door}`, await stageState());
    }
    await open('/?map=globe');
    await globeReady();
    await evaluate(`(() => { const q = document.getElementById('f-q'); q.value = 'engineering'; q.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    await sleep(800);
    await g(`g.goToRegion('europe'); return true;`);
    await still();
    await sleep(400);
    await shot('doors-filter-engineering', 'Search "engineering": countries with no matching degree dim, numbers are the universities left');
    log('filter-engineering', await stageState());
  }

  /* Reduced motion arrives everywhere, instantly. */
  if (want('reduced')) {
    await setup(DESK, false, true);
    await open('/?map=globe');
    await globeReady();
    const eu = await nodeAt(`(c) => c.dataset.kind === 'region' && /Europe/.test(c.textContent)`);
    await click(eu.x, eu.y);
    await sleep(500);
    log('reduced-europe', await stageState());
    await shot('reduced-europe', 'Reduced motion: Europe at once');
  }

  /* The Countries page has the same levels. */
  if (want('countries')) {
    await setup(DESK, false);
    await open('/countries/?map=globe');
    log('countries-ready', await globeReady());
    await shot('countries-1-world', '/countries/: the world level');
    log('countries-world', await stageState());
  }
} finally {
  report.shots = shots;
  await fs.writeFile(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  ws.close();
  chrome.kill();
  await sleep(800);
  await fs.rm(profile, { recursive: true, force: true }).catch(() => {});
}
