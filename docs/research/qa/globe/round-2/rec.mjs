/* Real-time recording: screencast frames + a page-side sampler of the camera + frame gaps + long tasks + bytes,
   then a contact sheet composed in the browser. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { OUT, sleep } from './cdp.mjs';

export async function record(b, name, ms, action, { sheet = 12, cols = 4, clipStage = true } = {}) {
  const { send, listeners, evaluate, G } = b;
  await evaluate(`(async () => { window.__g = ${G}; window.__samp = []; window.__sampOn = true; const t0 = performance.now(); window.__t0 = t0;
    (function f() { if (!window.__sampOn) return; const g = window.__g; window.__samp.push({ t: Math.round(performance.now() - t0), alt: +g.view.alt.toFixed(4), lat: +g.view.lat.toFixed(3), lon: +g.view.lon.toFixed(3), close: g.close.active, cs: g.close.state, z: g.close.zoom == null ? null : +g.close.zoom.toFixed(2), hint: !document.querySelector('.world__hint')?.hidden ? document.querySelector('.world__hint').textContent : '' }); requestAnimationFrame(f); })();
    return 1; })()`);
  const frames = [];
  const on = (m) => {
    if (m.method !== 'Page.screencastFrame') return;
    frames.push({ ts: m.params.metadata.timestamp, data: m.params.data });
    send('Page.screencastFrameAck', { sessionId: m.params.sessionId }).catch(() => {});
  };
  listeners.push(on);
  const stage = await b.stageRect();
  await send('Page.startScreencast', { format: 'jpeg', quality: 70, everyNthFrame: 1 });
  await sleep(150);
  await b.startFrames();
  const wall0 = Date.now();
  const tAct = Date.now() / 1000;
  await action();
  await sleep(ms);
  const frameStats = await b.stopFrames();
  await send('Page.stopScreencast');
  listeners.splice(listeners.indexOf(on), 1);
  const samp = await evaluate(`(() => { window.__sampOn = false; return window.__samp; })()`);
  const bytes = b.bytes(wall0);
  /* Milestones from the sampler */
  const firstClose = samp.find((s) => s.close);
  const minAlt = Math.min(...samp.map((s) => s.alt));
  const maxZ = Math.max(...samp.map((s) => s.z || 0));
  const hints = [...new Set(samp.map((s) => s.hint).filter(Boolean))];
  const loadingWait = (() => { const w = samp.filter((s) => /Loading/.test(s.hint)); return w.length ? w[w.length - 1].t - w[0].t : 0; })();
  /* Save frames and make a sheet of `sheet` evenly spaced frames */
  const dir = path.join(OUT, `${name}-frames`);
  await fs.mkdir(dir, { recursive: true });
  const f0 = frames[0]?.ts ?? tAct;
  await Promise.all(frames.map((f, i) => fs.writeFile(path.join(dir, `${String(i).padStart(3, '0')}_${Math.round((f.ts - tAct) * 1000)}ms.jpg`), Buffer.from(f.data, 'base64'))));
  const pick = [];
  for (let i = 0; i < sheet && frames.length; i++) pick.push(frames[Math.min(frames.length - 1, Math.round((i * (frames.length - 1)) / (sheet - 1)))]);
  if (pick.length) await makeSheet(b, `${name}-sheet`, pick.map((f) => ({ data: f.data, label: `${((f.ts - tAct)).toFixed(2)} s` })), cols, clipStage ? stage : null);
  const res = { name, frames: frames.length, frameStats, firstCloseMs: firstClose?.t ?? null, minAlt, maxZ, hints, loadingWaitMs: loadingWait, bytes, samples: samp.filter((_, i) => i % 6 === 0) };
  await fs.writeFile(path.join(OUT, `${name}.json`), JSON.stringify(res, null, 1));
  return res;
}

/** Compose a contact sheet in a scratch page, crop each frame to the stage. */
export async function makeSheet(b, name, items, cols = 4, clip = null) {
  const { send, evaluate } = b;
  const cur = await evaluate('location.href');
  const vp = await evaluate('({ w: innerWidth, h: innerHeight, sy: scrollY })');
  const c = clip ? { x: clip.x, y: clip.y, w: clip.w, h: clip.h } : { x: 0, y: 0, w: vp.w, h: vp.h };
  const tw = 480, th = Math.round((tw * c.h) / c.w);
  const rows = Math.ceil(items.length / cols);
  const W = cols * tw, H = rows * (th + 22);
  const html = await evaluate(`(async () => {
    const items = ${JSON.stringify(items)};
    const cv = document.createElement('canvas'); cv.width = ${W}; cv.height = ${H};
    const x = cv.getContext('2d'); x.fillStyle = '#111'; x.fillRect(0, 0, ${W}, ${H});
    for (let i = 0; i < items.length; i++) {
      const im = new Image(); im.src = 'data:image/jpeg;base64,' + items[i].data; await im.decode();
      const sx = im.naturalWidth / ${vp.w};
      const col = i % ${cols}, row = Math.floor(i / ${cols});
      x.drawImage(im, ${c.x} * sx, ${c.y} * sx, ${c.w} * sx, ${c.h} * sx, col * ${tw}, row * ${th + 22} + 22, ${tw}, ${th});
      x.fillStyle = '#fff'; x.font = '14px sans-serif'; x.fillText(items[i].label, col * ${tw} + 6, row * ${th + 22} + 16);
    }
    return cv.toDataURL('image/jpeg', 0.85);
  })()`);
  await fs.writeFile(path.join(OUT, `${name}.jpg`), Buffer.from(html.split(',')[1], 'base64'));
  console.log(`  ${name}.jpg`);
  void cur; void send;
}
