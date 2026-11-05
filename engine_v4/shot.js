const { chromium } = require('playwright'); const http=require('http'),fs=require('fs'),path=require('path');
const [page,out,w,h]=process.argv.slice(2);
const srv=http.createServer((q,r)=>{const f=path.join(__dirname,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'Content-Type':f.endsWith('.js')?'text/javascript':'text/html'});r.end(d);});}).listen(0);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:+w,height:+h}});p.on('pageerror',e=>console.log('[err]',e.message));p.on('console',m=>console.log('[c]',m.text()));
await p.goto(`http://localhost:${srv.address().port}/${page}`);await p.waitForFunction('window.READY===true',null,{timeout:60000});await p.screenshot({path:out});await b.close();srv.close();})();
