/**
 * Screenshots of the three level templates, rich and sparse, for the critic
 * loop on template content and legibility (October 2026).
 *
 *   node src/build.mjs
 *   node docs/research/qa/templates/shoot.mjs round-1
 *
 * Serves dist/ on PORT (default 4398), drives headless Chrome over the
 * DevTools protocol, and writes <round>/<page>--<desktop|phone>-<n>.jpg
 * (the page cut into screen-height slices) plus text.json (each page's
 * visible text, so a critic can read what the pictures say).
 * CHROME, PROFILE_ROOT (default D:/ibp-tmp), DEVTOOLS_PORT as in
 * ../conversion/shoot.mjs.
 */
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROUND = process.argv[2] || 'round-0';
const OUT = path.join(import.meta.dirname, ROUND);
const DIST = path.resolve(process.env.DIST || path.join(import.meta.dirname, '..', '..', '..', '..', 'dist'));
const PORT = Number(process.env.PORT || 4398);
const CHROME = process.env.CHROME || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const DEVTOOLS = Number(process.env.DEVTOOLS_PORT || 9335);
const BASE = `http://localhost:${PORT}`;
const MAX_SLICES = Number(process.env.MAX_SLICES || 6);

/** Rich and sparse examples at each level. */
export const PAGES = (process.env.PAGES || [
  'denmark',
  'destinations/es',
  'destinations/gh',
  'universities/dk-au',
  'universities/es-ie',
  'universities/gh-ashesi-university',
  'programmes/dk-au-computer-science-2027-autumn',
  'universities/es-ie/bachelor-in-business-administration',
  'universities/es-ub/bachelor-s-degree-in-english-studies',
].join(',')).split(',');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.avif': 'image/avif',
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
const root = process.env.PROFILE_ROOT || 'D:/ibp-tmp';
await fs.mkdir(root, { recursive: true });
const profile = await fs.mkdtemp(path.join(root, 'tpl-shoot-'));
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
await send('Runtime.enable');
await send('Page.enable');

async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}

async function open(route, { width, height, mobile }) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }, { name: 'prefers-color-scheme', value: 'light' }] });
  const loaded = new Promise((r) => listeners.push(function once(m) {
    if (m.method === 'Page.loadEventFired') { listeners.splice(listeners.indexOf(once), 1); r(); }
  }));
  await send('Page.navigate', { url: `${BASE}/${route}/` });
  await loaded;
  // Lazy images: walk the page once so they load.
  await evaluate(`(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); })()`);
  await sleep(600);
}

const VIEWS = { desktop: { width: 1366, height: 900, mobile: false }, phone: { width: 390, height: 844, mobile: true } };
const text = {};
try {
  for (const route of PAGES) {
    const slug = route.replace(/\//g, '__');
    for (const [view, size] of Object.entries(VIEWS)) {
      await open(route, size);
      const h = await evaluate('document.documentElement.scrollHeight');
      if (view === 'desktop') text[route] = await evaluate('document.querySelector("main")?.innerText || ""');
      const n = Math.min(MAX_SLICES, Math.ceil(h / size.height));
      for (let i = 0; i < n; i++) {
        const clip = { x: 0, y: i * size.height, width: size.width, height: Math.min(size.height, h - i * size.height), scale: 1 };
        const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70, clip, captureBeyondViewport: true });
        await fs.writeFile(path.join(OUT, `${slug}--${view}-${i + 1}.jpg`), Buffer.from(r.data, 'base64'));
      }
      console.log(`  ${slug} ${view}: ${n} of ${Math.ceil(h / size.height)} slices (${h}px)`);
    }
  }
  await fs.writeFile(path.join(OUT, 'text.json'), JSON.stringify(text, null, 1));
} finally {
  ws.close();
  chrome.kill();
  server.close();
}
