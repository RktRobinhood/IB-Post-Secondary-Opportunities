// Reproduces the rendered measurements in ../text-walls.md. Start Chrome with --headless=new --remote-debugging-port=9333,
// then: node cdp.mjs 9333 measure <file of paths> <outdir>   or   node cdp.mjs 9333 shoot <file of paths> <outdir>
// Needs measure-in-page.js beside it. Paths are site-relative (e.g. /programmes/); BASE is the live site.
// Drive headless Edge over CDP: rendered text metrics and screenshots.
// usage: node cdp.mjs <port> <mode: measure|shoot> <listfile> <outdir>
import fs from 'node:fs';
import path from 'node:path';
const [port, mode, listFile, outDir] = process.argv.slice(2);
// BASE=http://localhost:4321 to shoot a local build; SUFFIX=.before to keep a before shot beside the after.
const BASE = process.env.BASE || 'https://rktrobinhood.github.io/IB-Post-Secondary-Opportunities';
const SUFFIX = process.env.SUFFIX || '';
const list = fs.readFileSync(listFile, 'utf8').split(/\r?\n/).filter(Boolean);
fs.mkdirSync(outDir, { recursive: true });

const ver = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
const ws = new WebSocket(ver.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
const events = [];
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
  else if (m.method) events.push(m);
});
const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const S = (m, p) => send(m, p, sessionId);
await S('Page.enable');
await S('Runtime.enable');

const VIEWPORTS = {
  phone: { width: 375, height: 812, deviceScaleFactor: 2, mobile: true },
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
};

const MEASURE = fs.readFileSync(path.join(import.meta.dirname, 'measure-in-page.js'), 'utf8');

async function load(u, vp) {
  await S('Emulation.setDeviceMetricsOverride', VIEWPORTS[vp]);
  await S('Emulation.setUserAgentOverride', { userAgent: vp === 'phone' ? 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0 Mobile Safari/537.36' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0 Safari/537.36 Edg/145.0' });
  events.length = 0;
  await S('Page.navigate', { url: BASE + u });
  const t0 = Date.now();
  while (!events.some((e) => e.method === 'Page.loadEventFired') && Date.now() - t0 < 25000) await sleep(100);
  await sleep(2500);
}

const results = [];
for (const u of list) {
  for (const vp of mode === 'measure' ? ['phone', 'desktop'] : ['desktop', 'phone']) {
    try {
      await load(u, vp);
      const slug = (u.replace(/^\/|\/$/g, '').replace(/\//g, '__') || 'home');
      if (mode === 'measure') {
        const r = await S('Runtime.evaluate', { expression: MEASURE, returnByValue: true, awaitPromise: true });
        results.push({ url: u, vp, ...r.result.value });
        process.stdout.write(`${vp} ${u} fold=${r.result.value?.foldWords} screens=${r.result.value?.screens}\n`);
      } else {
        // Freeze motion so the shot is stable.
        await S('Runtime.evaluate', { expression: `document.documentElement.setAttribute('data-motion','reduce'); window.scrollTo(0,0);` });
        await sleep(300);
        const fold = await S('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(outDir, `${slug}--${vp}-fold${SUFFIX}.png`), Buffer.from(fold.data, 'base64'));
        const { cssContentSize } = await S('Page.getLayoutMetrics');
        const w = VIEWPORTS[vp].width;
        const h = Math.min(Math.ceil(cssContentSize.height), vp === 'phone' ? 14000 : 9000);
        const full = await S('Page.captureScreenshot', { format: 'jpeg', quality: 60, captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: h, scale: vp === 'phone' ? 0.5 : 0.5 } });
        fs.writeFileSync(path.join(outDir, `${slug}--${vp}-full${SUFFIX}.jpg`), Buffer.from(full.data, 'base64'));
        process.stdout.write(`shot ${vp} ${u} h=${Math.ceil(cssContentSize.height)}\n`);
      }
    } catch (e) {
      process.stdout.write(`ERR ${vp} ${u} ${e.message}\n`);
    }
  }
}
if (mode === 'measure') fs.writeFileSync(path.join(outDir, 'rendered-metrics.json'), JSON.stringify(results, null, 1));
await send('Target.closeTarget', { targetId });
ws.close();
process.exit(0);
