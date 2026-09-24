/**
 * Screenshots of requirements shown in IB terms, taken the same way every time.
 *
 *   node src/build.mjs                                   # SITE_BASE unset
 *   node docs/research/qa/conversion/shoot.mjs [round]   # default round-0
 *
 * Serves its own copy of the built site (DIST=<dir> to point it elsewhere —
 * other agents rebuild dist/, so copy it first if that matters) on PORT
 * (default 4399), drives headless Chrome over the DevTools protocol with no
 * dependency, and writes <round>/*.png plus text.json (the visible text of
 * each shot's element, so a critic can read what the picture says).
 *
 * Set CHROME to the browser binary if it is not at the Windows default.
 */
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const ROUND = process.argv[2] || 'round-0';
const OUT = path.join(import.meta.dirname, ROUND);
const DIST = path.resolve(process.env.DIST || path.join(import.meta.dirname, '..', '..', '..', '..', 'dist'));
const PORT = Number(process.env.PORT || 4399);
const CHROME = process.env.CHROME || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const DEVTOOLS = 9334;
const BASE = `http://localhost:${PORT}`;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};
const server = http.createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, BASE).pathname);
  if (p.endsWith('/')) p += 'index.html';
  try {
    const body = await fs.readFile(path.join(DIST, p));
    res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});
await new Promise((r) => server.listen(PORT, r));

await fs.mkdir(OUT, { recursive: true });
const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'conv-shoot-'));
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${DEVTOOLS}`, `--user-data-dir=${profile}`,
  '--hide-scrollbars', '--no-first-run', 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let version;
for (let i = 0; i < 50 && !version; i++) {
  try { version = await (await fetch(`http://127.0.0.1:${DEVTOOLS}/json/version`)).json(); } catch { await sleep(200); }
}
if (!version) throw new Error('Chrome did not start');
const target = await (await fetch(`http://127.0.0.1:${DEVTOOLS}/json/new?about:blank`, { method: 'PUT' })).json();
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
  } else if (msg.method) for (const l of listeners) l(msg);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++seq;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});
const logs = [];
listeners.push((m) => {
  if (m.method === 'Runtime.exceptionThrown') logs.push(`exception: ${m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text}`);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') logs.push(`console.error: ${m.params.args.map((a) => a.value ?? a.description).join(' ')}`);
});
await send('Runtime.enable');
await send('Page.enable');
await send('Page.bringToFront');

async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}

async function open(route, { width = 1280, height = 900, mobile = false } = {}) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  const loaded = new Promise((r) => listeners.push(function once(m) {
    if (m.method === 'Page.loadEventFired') { listeners.splice(listeners.indexOf(once), 1); r(); }
  }));
  await send('Page.navigate', { url: `${BASE}${route}` });
  await loaded;
  await sleep(500);
}

const text = {};

/* The new section runs from its heading to the calculator; wrap it so it can be
   captured as one element. */
const WRAP_LEVELS = `(() => { const h = document.getElementById('levels'); const wrap = document.createElement('div'); wrap.id = 'levels-shot'; let n = h; const nodes = []; while (n && n.id !== 'calculator') { nodes.push(n); n = n.nextElementSibling; } h.before(wrap); nodes.forEach((x) => wrap.append(x)); return nodes.length; })()`;

/** Capture one element (and a margin round it) at full length. */
async function shotOf(selector, name, { pad = 16, maxHeight = 2400 } = {}) {
  const box = await evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return null;
    el.scrollIntoView({ block: 'start' });
    const r = el.getBoundingClientRect();
    return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height, text: el.innerText };
  })()`);
  if (!box) {
    console.log(`  MISSING ${selector} for ${name}`);
    return;
  }
  await sleep(300);
  const clip = {
    x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad),
    width: box.w + pad * 2, height: Math.min(maxHeight, box.h + pad * 2), scale: 1,
  };
  const r = await send('Page.captureScreenshot', { format: 'png', clip, captureBeyondViewport: true });
  await fs.writeFile(path.join(OUT, `${name}.png`), Buffer.from(r.data, 'base64'));
  text[name] = box.text;
  console.log(`  ${name}.png`);
}

try {
  // 1. Aarhus University: "What you could study here"
  await open('/universities/dk-au/');
  await evaluate(`document.querySelectorAll('.card .req').length`);
  await shotOf('#programmes', '01-aarhus-heading', { maxHeight: 200 });
  await shotOf('#programmes + .grid', '01-aarhus-card-grid');

  // 2. The same grid at phone width
  await open('/universities/dk-au/', { width: 390, height: 844, mobile: true });
  await shotOf('#programmes + .grid', '02-aarhus-card-grid-mobile', { maxHeight: 1800 });

  // 3. Programme pages: What you need
  await open('/programmes/dk-au-cognitive-science-2027-autumn/');
  await shotOf('.req-detail', '03-programme-cognitive-science');
  await open('/programmes/dk-via-mechanical-engineering-beng-2027-autumn/');
  await shotOf('.req-detail', '04-programme-via-mechanical-two-one-ofs');
  await open('/programmes/dk-cbs-international-business-2027-autumn/');
  await shotOf('.req-detail', '05-programme-cbs-min-grade');

  // 4. The programme finder, rendered in the browser
  await open('/programmes/?inst=dk-au');
  await shotOf('#prog-results', '06-programme-finder-aarhus', { maxHeight: 1400 });

  // 5. The planner: a profile, and one result opened
  await open('/planner/');
  await evaluate(`(async () => {
    const set = (sel, v) => { const el = document.querySelector(sel); el.value = v; el.dispatchEvent(new Event('change', { bubbles: true })); };
    const six = [['english-b','SL','5'],['mathematics-aa','SL','5'],['history','HL','6'],['biology','HL','5'],['chemistry','SL','4'],['danish-a-literature','SL','6']];
    six.forEach(([s,l,g], i) => { set('.p-subject[data-slot="'+(i+1)+'"]', s); set('.p-level[data-slot="'+(i+1)+'"]', l); set('.p-grade[data-slot="'+(i+1)+'"]', g); });
    set('#p-award', 'diploma');
    const t = document.getElementById('p-total'); t.value = '34'; t.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, 300));
    for (const li of document.querySelectorAll('#p-results > li')) {
      if (/Aarhus|AU/.test(li.textContent) && /Mathematics|Maths/.test(li.textContent)) { li.querySelector('details').open = true; }
    }
    const firstGap = [...document.querySelectorAll('#p-results > li')].find(li => li.dataset.match !== 'yes');
    if (firstGap) { firstGap.querySelector('details').open = true; firstGap.id = 'shot-gap'; }
    const firstYes = document.querySelector('#p-results > li[data-match="yes"]');
    if (firstYes) firstYes.querySelector('details').open = true;
    return true;
  })()`);
  await sleep(300);
  await shotOf('#p-results', '07-planner-results', { maxHeight: 2000 });
  await shotOf('#shot-gap', '07b-planner-a-gap');

  // 6. The conversion page's new table
  await open('/denmark/ib-conversion/');
  await evaluate(WRAP_LEVELS);
  await shotOf('#levels-shot', '08-conversion-levels-table', { maxHeight: 3000 });
  await open('/denmark/ib-conversion/', { width: 390, height: 844, mobile: true });
  await evaluate(WRAP_LEVELS);
  await shotOf('#levels-shot', '09-conversion-levels-mobile', { maxHeight: 1600 });
} finally {
  await fs.writeFile(path.join(OUT, 'text.json'), JSON.stringify({ text, logs }, null, 2));
  if (logs.length) console.log(`  page errors:\n    ${logs.join('\n    ')}`);
  ws.close();
  chrome.kill();
  server.close();
}
