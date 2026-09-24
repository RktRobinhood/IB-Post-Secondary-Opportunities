import { launch } from './cdp.mjs';
for (const gpu of [false, true]) {
  const b = await launch({ gpu, port: gpu ? 9341 : 9342 });
  await b.open('/world/');
  const r = await b.evaluate(`(() => { const c = document.createElement('canvas').getContext('webgl'); const d = c && c.getExtension('WEBGL_debug_renderer_info'); return c ? (d ? c.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'webgl') : 'none'; })()`);
  console.log(gpu, r);
  b.close();
}
process.exit(0);
