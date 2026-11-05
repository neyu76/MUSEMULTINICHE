const { chromium } = require('playwright'); const fs = require('fs'); const http = require('http'); const path = require('path');
const root = __dirname; const [sg, out] = process.argv.slice(2);
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': f.endsWith('.js') ? 'text/javascript' : 'text/html' }); r.end(d); }); }).listen(0);
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 720, height: 1280 } });
  p.on('pageerror', e => console.log('[err]', e.message));
  await p.goto(`http://localhost:${srv.address().port}/index.html`); await p.waitForFunction('window.READY === true', null, { timeout: 120000 });
  const r = await p.evaluate(([sg]) => { const a = []; for (let f = 0; f < 1494; f++) a.push(window.camAt(f / 30, sg)); return a; }, [+sg]);
  fs.writeFileSync(out, JSON.stringify(r)); await b.close(); srv.close(); })();
