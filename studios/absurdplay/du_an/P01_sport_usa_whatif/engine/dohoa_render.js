// Render HTML graphics page to transparent PNG frames. node dohoa_render.js page.html outDir fps f0 f1
const http=require('http'),fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const [page,out,fps='30',f0='0',f1='1']=process.argv.slice(2);
const srv=http.createServer((q,s)=>{const p=path.join(__dirname,decodeURIComponent(q.url.split('?')[0]));fs.readFile(p,(e,d)=>{if(e){s.writeHead(404);s.end();return;}s.writeHead(200,{'Content-Type':({'.js':'text/javascript','.html':'text/html','.woff2':'font/woff2'})[path.extname(p)]||'application/octet-stream'});s.end(d);});}).listen(0,async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
await pg.goto(`http://127.0.0.1:${srv.address().port}/${page}`);await pg.waitForFunction('window.ready===true');fs.mkdirSync(out,{recursive:true});const t0=Date.now();
for(let f=+f0;f<+f1;f++){await pg.evaluate(t=>window.renderFrame(t),f/+fps);await pg.screenshot({path:path.join(out,`g_${String(f).padStart(5,'0')}.png`),omitBackground:true});}
console.log('sec/frame',((Date.now()-t0)/1000/Math.max(1,f1-f0)).toFixed(3));await b.close();srv.close();});
