const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('console',m=>console.log('C:',m.text()));
await p.goto('file://'+__dirname+'/char.html');await p.waitForFunction('window.ready');
const N=3;const t0=Date.now();
for(let f=0;f<N;f++){await p.evaluate(t=>window.renderFrame(t),f/30);const d=await p.evaluate(()=>document.getElementById('c').toDataURL('image/jpeg',0.92));require('fs').writeFileSync(`f_${String(f).padStart(4,'0')}.jpg`,Buffer.from(d.split(',')[1],'base64'));}
console.log('sec/frame',(Date.now()-t0)/N/1000);
console.log(await p.evaluate(()=>{const gl=document.createElement('canvas').getContext('webgl2');const e=gl.getExtension('WEBGL_debug_renderer_info');return gl.getParameter(e.UNMASKED_RENDERER_WEBGL)}));await b.close();})();
