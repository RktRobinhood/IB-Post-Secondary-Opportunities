// Mock of a proposed fix, injected into the live page: photo anchored top at its own 16:10, taller clear band.
import { spawn } from 'node:child_process'; import fs from 'node:fs/promises'; import path from 'node:path'; import os from 'node:os';
const OUT = process.argv[2]; const BASE = 'https://rktrobinhood.github.io/IB-Post-Secondary-Opportunities';
const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'; const PORT = 9344;
const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'pc-mock-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let v; for (let i = 0; i < 50 && !v; i++) { try { v = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); } catch { await sleep(200); } }
const t = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0; const pend = new Map();
ws.addEventListener('message', (m) => { const x = JSON.parse(m.data); if (x.id && pend.has(x.id)) { const p = pend.get(x.id); pend.delete(x.id); x.error ? p.rej(new Error(x.error.message)) : p.res(x.result); } });
const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pend.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });
const ev = async (e) => { const r = await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
await send('Page.enable');
const CSS = `
.card--backdrop{--card-headroom:9rem}
.card--backdrop .card__backdrop{inset:0 0 auto 0;height:auto;aspect-ratio:16/10;object-position:50% 50%}
.card--backdrop::before{background:linear-gradient(to bottom,
  color-mix(in srgb,var(--paper) 8%,transparent) 0,
  color-mix(in srgb,var(--paper) 18%,transparent) calc(var(--card-headroom) * .55),
  color-mix(in srgb,var(--paper) calc(var(--veil-text)*100%),transparent) var(--card-headroom),
  var(--paper) calc(var(--card-headroom) + 6rem))}
`;
for (const [slug, w, mob] of [['dk-sdu', 1280, false], ['dk-via', 1280, false], ['dk-au', 390, true]]) for (const scheme of ['light', 'dark']) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: mob ? 2 : 1, mobile: mob });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
  await send('Page.navigate', { url: `${BASE}/universities/${slug}/` }); await sleep(3500);
  await ev(`(()=>{const s=document.createElement('style');s.textContent=${JSON.stringify(CSS)};document.head.appendChild(s);return 1})()`);
  await ev(`(async()=>{const h=document.documentElement.scrollHeight;for(let y=0;y<h;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,100))}scrollTo(0,0);await Promise.all([...document.querySelectorAll('.card__backdrop')].map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r;setTimeout(r,8000)})));return 1})()`);
  await sleep(600);
  const r = await ev(`(()=>{const h=[...document.querySelectorAll('h2')].find(h=>/could study/i.test(h.textContent));const e=h.closest('section')||h.parentElement;const b=e.getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}})()`);
  const { data } = await send('Page.captureScreenshot', { format: 'png', clip: { x: r.x, y: r.y, width: r.w, height: Math.min(r.h, mob ? 2600 : 2600), scale: 1 }, captureBeyondViewport: true });
  await fs.writeFile(path.join(OUT, `mock-toptrip-${slug}-${mob ? 'phone' : 'desktop'}-${scheme}.png`), Buffer.from(data, 'base64'));
  console.log(slug, scheme);
}
ws.close(); chrome.kill(); process.exit(0);
