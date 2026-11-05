// node render.js out_dir t0 t1 [fps] [stillsCSV]     env: SS=2 (supersampling, default 1.5 → use 2 for delivery, 1 for previews)  env: MB=12 max motion-blur sub-frames
// Robust: restarts Chromium every RESTART frames and whenever the WebGL context is lost (SwiftShader at SS=2 can run out of
// memory → black/frozen frames). A frame rendered after a context loss is discarded and rendered again on a fresh browser.
const { chromium } = require('playwright'); const fs = require('fs'); const http = require('http'); const path = require('path');
const root = __dirname; const [out, t0s, t1s, fpss, stills] = process.argv.slice(2); const fps = +(fpss || 30);
const RESTART = +(process.env.RESTART || 120); const MB = +(process.env.MB || 12);   // MB: max motion-blur sub-frames (12; 4 = faster, needed for 1080p SS=2 on 8 GB)
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': f.endsWith('.js') ? 'text/javascript' : 'text/html' }); r.end(d); }); }).listen(0);
async function open() {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 720, height: 1280 } });
  p.on('console', m => { const s = m.text(); if (!s.startsWith('THREE')) console.log('[page]', s); }); p.on('pageerror', e => console.log('[err]', e.message));
  await p.goto(`http://localhost:${srv.address().port}/index.html?ss=${process.env.SS || 1.5}`); await p.waitForFunction('window.READY === true', null, { timeout: 180000 });
  return { b, p };
}
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const times = stills ? stills.split(',').map(Number) : (() => { const a = []; for (let f = Math.round(+t0s * fps); f < Math.round(+t1s * fps); f++) a.push(f / fps); return a; })();
  const fname = t => stills ? `still_${t.toFixed(2)}.jpg` : `f_${String(Math.round(t * fps)).padStart(5, '0')}.jpg`;
  let s = await open(), count = 0; const T = Date.now();
  for (let k = 0; k < times.length; k++) {
    const t = times[k];
    if (!stills && fs.existsSync(path.join(out, fname(t)))) continue;
    if (count >= RESTART) { await s.b.close().catch(() => {}); s = await open(); count = 0; }
    let r = null;
    try { r = await s.p.evaluate(([t, mb]) => { const r = window.renderAt(t, mb); r.lost = window.__lost; return r; }, [t, MB]); } catch (e) { console.log('[render error]', t, e.message); }
    if (!r || r.lost) { console.log('[restart] context lost / page error at t=', t.toFixed(2)); await s.b.close().catch(() => {}); s = await open(); count = 0; k--; continue; }
    fs.writeFileSync(path.join(out, fname(t)), Buffer.from(r.url.split(',')[1], 'base64')); count++;
    if (!stills && Math.round(t * fps) % 30 === 0) console.log(`t=${t.toFixed(2)} sub=${r.sub} seg=${r.seg} elapsed=${((Date.now() - T) / 1000).toFixed(0)}s`);
  }
  await s.b.close().catch(() => {}); srv.close(); console.log('done', ((Date.now() - T) / 1000).toFixed(1), 's');
})();
