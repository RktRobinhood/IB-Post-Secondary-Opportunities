// Measured text contrast on live programme cards: text colour vs the actual rendered pixels behind it.
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
const require = createRequire('D:/OneDrive - Ikast/OneDrive - Ikast-Brande Gymnasium/AI Projects/DK Uni Requirments/ib-pathways-europe/package.json');
const sharp = require('sharp');

const BASE = 'https://rktrobinhood.github.io/IB-Post-Secondary-Opportunities';
const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const PORT = 9342;
const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'pc-con-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let v; for (let i = 0; i < 50 && !v; i++) { try { v = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); } catch { await sleep(200); } }
const t = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0; const pend = new Map();
ws.addEventListener('message', (m) => { const x = JSON.parse(m.data); if (x.id && pend.has(x.id)) { const p = pend.get(x.id); pend.delete(x.id); x.error ? p.rej(new Error(x.error.message)) : p.res(x.result); } });
const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pend.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });
const ev = async (e) => { const r = await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
await send('Page.enable'); await send('Runtime.enable');
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const L = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const cr = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

const out = [];
for (const [slug, sel] of [['dk-au', '.card--backdrop'], ['dk-via', '.card--backdrop'], ['dk-dtu', '.card--backdrop'], ['nl-tudelft', '.card--backdrop'], ['dk-sdu', '.card--backdrop']]) for (const scheme of ['light', 'dark']) {
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
  await send('Page.navigate', { url: `${BASE}/universities/${slug}/` }); await sleep(3500);
  await ev(`(async()=>{const h=document.documentElement.scrollHeight;for(let y=0;y<h;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,100))}scrollTo(0,0);await Promise.all([...document.querySelectorAll('${sel} img')].map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r;setTimeout(r,8000)})));return 1})()`);
  await sleep(600);
  // text-bearing elements
  const els = await ev(`(()=>{const res=[];let k=0;for(const card of document.querySelectorAll('${sel}')){const title=card.querySelector('h3,h2,.card__title')?.textContent.trim().slice(0,40);
    const w=document.createTreeWalker(card,NodeFilter.SHOW_TEXT);let n;const seen=new Set();while(n=w.nextNode()){if(!n.textContent.trim())continue;const e=n.parentElement;if(seen.has(e))continue;seen.add(e);const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none')continue;
      const rg=document.createRange();rg.selectNodeContents(n);for(const r of rg.getClientRects()){if(r.width<4||r.height<4)continue;res.push({card:title,cls:e.className||e.tagName,text:n.textContent.trim().slice(0,30),color:cs.color,fs:cs.fontSize,fw:cs.fontWeight,x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height});}}}return res})()`);
  await ev(`(()=>{const s=document.createElement('style');s.id='__hide';s.textContent='${sel} *{color:transparent!important;text-decoration-color:transparent!important;text-shadow:none!important}';document.head.appendChild(s);return 1})()`);
  await sleep(300);
  const H = await ev('document.documentElement.scrollHeight');
  const { data } = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1280, height: Math.min(H, 8000), scale: 1 }, captureBeyondViewport: true });
  const img = sharp(Buffer.from(data, 'base64')); const { data: px, info } = await img.raw().toBuffer({ resolveWithObject: true });
  for (const e of els) {
    const m = e.color.match(/[\d.]+/g).map(Number); const col = m.slice(0, 3);
    const vals = [];
    for (let y = Math.round(e.y); y < Math.round(e.y + e.h) && y < info.height; y++) for (let x = Math.round(e.x); x < Math.round(e.x + e.w); x++) {
      const i = (y * info.width + x) * info.channels; vals.push(cr(col, [px[i], px[i + 1], px[i + 2]]));
    }
    if (!vals.length) continue; vals.sort((a, b) => a - b);
    out.push({ page: slug, scheme, ...e, min: +vals[0].toFixed(2), p5: +vals[Math.floor(vals.length * 0.05)].toFixed(2), med: +vals[Math.floor(vals.length / 2)].toFixed(2) });
  }
  console.log(slug, scheme, els.length);
}
await fs.writeFile(path.join(import.meta.dirname, 'contrast.json'), JSON.stringify(out, null, 1));
const byCls = {};
for (const o of out) { const k = `${o.scheme} ${String(o.cls).split(' ')[0]} ${o.color} ${o.fs}/${o.fw}`; (byCls[k] ||= []).push(o); }
for (const [k, list] of Object.entries(byCls)) { const w = list.reduce((a, b) => (a.p5 < b.p5 ? a : b)); console.log(k.padEnd(70), 'n', list.length, 'worst p5', w.p5, 'min', w.min, 'med', w.med, '|', w.page, w.card, '|', w.text); }
ws.close(); chrome.kill(); process.exit(0);
