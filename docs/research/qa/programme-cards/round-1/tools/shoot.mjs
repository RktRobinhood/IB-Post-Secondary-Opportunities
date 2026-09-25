// Critic round-1 shooter for programme cards (live site). CDP, no deps.
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const OUT = process.argv[2];
const BASE = 'https://rktrobinhood.github.io/IB-Post-Secondary-Opportunities';
const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const PORT = 9341;
await fs.mkdir(OUT, { recursive: true });
const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'pc-shoot-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--hide-scrollbars', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let version;
for (let i = 0; i < 50 && !version; i++) { try { version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); } catch { await sleep(200); } }
const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0; const pending = new Map(); const listeners = [];
ws.addEventListener('message', (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { const { resolve, reject } = pending.get(msg.id); pending.delete(msg.id); msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result); } else if (msg.method) for (const l of listeners) l(msg); });
const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++seq; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
const ev = async (expression) => { const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Page.bringToFront');

let reqs = new Map();
listeners.push((m) => {
  if (m.method === 'Network.responseReceived') { const r = reqs.get(m.params.requestId) || {}; r.url = m.params.response.url; r.type = m.params.type; reqs.set(m.params.requestId, r); }
  if (m.method === 'Network.loadingFinished') { const r = reqs.get(m.params.requestId) || {}; r.bytes = m.params.encodedDataLength; reqs.set(m.params.requestId, r); }
});

async function setup(width, height, scheme, mobile) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
}
async function go(url) {
  reqs = new Map();
  const loaded = new Promise((r) => { const l = (m) => { if (m.method === 'Page.loadEventFired') { listeners.splice(listeners.indexOf(l), 1); r(); } }; listeners.push(l); });
  await send('Page.navigate', { url });
  await Promise.race([loaded, sleep(20000)]);
  await ev(`window.__cls=0; new PerformanceObserver(l=>{for(const e of l.getEntries()) if(!e.hadRecentInput) window.__cls+=e.value}).observe({type:'layout-shift',buffered:true}); 1`);
  await sleep(1200);
}
function progBytes() {
  let n = 0, b = 0, all = 0; const files = [];
  for (const r of reqs.values()) { all += r.bytes || 0; if (r.url?.includes('/assets/img/programmes/')) { n++; b += r.bytes || 0; files.push(r.url.split('/').pop()); } }
  return { progImgRequests: n, progImgBytes: b, totalBytes: all, files };
}
async function scrollThrough() {
  await ev(`(async()=>{const h=document.documentElement.scrollHeight;for(let y=0;y<h;y+=500){scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}scrollTo(0,0);await new Promise(r=>setTimeout(r,500));await Promise.all([...document.images].filter(i=>!i.complete).map(i=>new Promise(r=>{i.onload=i.onerror=r;setTimeout(r,8000)})));return 1})()`);
  await sleep(800);
}
async function shootSelector(file, sel, maxH = 6000) {
  const rect = await ev(`(()=>{const e=${sel};if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height}})()`);
  if (!rect) { console.log('no element for', file); return; }
  const clip = { x: Math.max(0, rect.x - 8), y: Math.max(0, rect.y - 8), width: rect.w + 16, height: Math.min(rect.h + 16, maxH), scale: 1 };
  const { data } = await send('Page.captureScreenshot', { format: 'png', clip, captureBeyondViewport: true });
  await fs.writeFile(path.join(OUT, file), Buffer.from(data, 'base64'));
}
async function shootViewport(file) {
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  await fs.writeFile(path.join(OUT, file), Buffer.from(data, 'base64'));
}

const studySection = `(()=>{const h=[...document.querySelectorAll('h2')].find(h=>/could study/i.test(h.textContent));return h?.closest('section')||h?.parentElement})()`;
const report = {};
const inst = [['aarhus-au', 'dk-au'], ['via', 'dk-via'], ['dtu', 'dk-dtu'], ['tudelft', 'nl-tudelft'], ['utwente', 'nl-utwente']];
const modes = [['desktop', 1280, 900, false], ['phone', 390, 844, true]];
for (const [mname, w, h, mob] of modes) for (const scheme of ['light', 'dark']) {
  await setup(w, h, scheme, mob);
  for (const [name, slug] of inst) {
    const url = `${BASE}/universities/${slug}/`;
    await go(url);
    const before = progBytes();
    const initial = await ev(`(()=>{const imgs=[...document.querySelectorAll('.card__backdrop')];return {cards:imgs.length, lazy:imgs.filter(i=>i.loading==='lazy').length, dims:imgs.filter(i=>i.getAttribute('width')&&i.getAttribute('height')).length, backdrops:imgs.map(i=>i.dataset.backdrop), current: imgs.map(i=>i.currentSrc.split('/').pop())}})()`);
    await scrollThrough();
    const after = progBytes();
    const cls = await ev('window.__cls');
    const current = await ev(`[...document.querySelectorAll('.card__backdrop')].map(i=>i.currentSrc.split('/').pop())`);
    report[`${name}-${mname}-${scheme}`] = { url, ...initial, initialProgBytes: before.progImgBytes, initialProgReqs: before.progImgRequests, afterScroll: after, cls, current };
    await shootSelector(`${name}-${mname}-${scheme}.png`, studySection, mob ? 9000 : 5000);
    console.log('shot', name, mname, scheme);
  }
  // finder
  await go(`${BASE}/programmes/`);
  const f0 = progBytes();
  const finfo = await ev(`(()=>{const rows=[...document.querySelectorAll('.prog--backdrop')];const imgs=[...document.querySelectorAll('.prog__backdrop')];return {rows:rows.length, imgs:imgs.length, lazy:imgs.filter(i=>i.loading==='lazy').length, backdrops: imgs.map(i=>i.dataset.backdrop||i.currentSrc.split('/').pop())}})()`);
  await shootViewport(`finder-top-${mname}-${scheme}.png`);
  await scrollThrough();
  report[`finder-${mname}-${scheme}`] = { ...finfo, initial: f0, after: progBytes(), cls: await ev('window.__cls') };
  await shootSelector(`finder-list-${mname}-${scheme}.png`, `document.querySelector('.prog--backdrop')?.parentElement`, mob ? 7000 : 4500);
  // planner
  await go(`${BASE}/planner/`);
  await ev(`(()=>{const set=(sel,v)=>{const e=document.querySelector(sel);if(e){e.value=v;}};
    const subs=[['english-a-lang-lit','HL',6],['mathematics-aa','HL',6],['physics','HL',6],['chemistry','SL',6],['economics','SL',6],['danish-b','SL',6]];
    subs.forEach(([s,l,g],i)=>{set('.p-subject[data-slot="'+(i+1)+'"]',s);set('.p-level[data-slot="'+(i+1)+'"]',l);set('.p-grade[data-slot="'+(i+1)+'"]',String(g));});
    set('#p-total','38'); const a=document.getElementById('p-award'); if(a){a.value='diploma';}
    document.getElementById('picker').dispatchEvent(new Event('change',{bubbles:true})); return 1})()`);
  await sleep(1500);
  await scrollThrough();
  report[`planner-${mname}-${scheme}`] = { rows: await ev(`document.querySelectorAll('#p-results .prog--backdrop').length`), after: progBytes(), cls: await ev('window.__cls') };
  await shootSelector(`planner-${mname}-${scheme}.png`, `document.getElementById('p-results')`, mob ? 7000 : 4500);
  console.log('shot finder/planner', mname, scheme);
}
await fs.writeFile(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
ws.close(); chrome.kill();
process.exit(0);
