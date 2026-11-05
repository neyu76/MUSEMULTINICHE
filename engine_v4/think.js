import { THREE, scene, ctex, lam, toon, plane, INK, Char } from './core.js';
import { makeCanvas, drawChar } from './chars2.js';
export const TH = { g: new THREE.Group() }; scene.add(TH.g); TH.g.position.set(-300, 0, 0); TH.g.visible = false; const g = TH.g;
const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 48), new THREE.MeshBasicMaterial({ color: 0x0b0b10 })); floor.rotation.x = -Math.PI / 2; g.add(floor);
const pool = new THREE.Mesh(new THREE.CircleGeometry(1.6, 48), new THREE.MeshBasicMaterial({ map: ctex(256, 256, (c, w, h) => { const gr = c.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, 'rgba(255,240,200,0.55)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }), transparent: true, depthWrite: false })); pool.rotation.x = -Math.PI / 2; pool.position.y = 0.01; g.add(pool);
const cone = new THREE.Mesh(new THREE.ConeGeometry(1.7, 9, 32, 1, true), new THREE.MeshBasicMaterial({ map: ctex(64, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,240,200,0.0)'); gr.addColorStop(1, 'rgba(255,240,200,0.07)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }), transparent: true, depthWrite: false, side: THREE.DoubleSide })); cone.position.y = 4.5; g.add(cone);
export const tLight = new THREE.SpotLight(0xfff0d0, 40, 14, 0.35, 0.5, 1.3); tLight.position.set(0, 9, 1.2); g.add(tLight); tLight.target.position.set(0, 1, 0); g.add(tLight.target);
export const tp = new Char('poisson', g);
function cardTex(kind) { return ctex(700, 840, (c, w, h) => {
  const con = kind === 'con', cx = w / 2, cy = h / 2;
  // thought cloud: scalloped ellipse, thick ink outline that varies in weight
  const sc = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; sc.push([cx + Math.cos(a) * (w / 2 - 92), cy + Math.sin(a) * (h / 2 - 92), 78 + 10 * Math.sin(i * 2.1)]); }
  c.fillStyle = INK; sc.forEach(([x, y, r], i) => { c.beginPath(); c.arc(x + 3, y + 5, r + 12 + 4 * Math.sin(i), 0, 7); c.fill(); }); c.beginPath(); c.ellipse(cx, cy, w / 2 - 92, h / 2 - 92, 0, 0, 7); c.fill();
  c.fillStyle = '#ffffff'; sc.forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }); c.beginPath(); c.ellipse(cx, cy, w / 2 - 92, h / 2 - 92, 0, 0, 7); c.fill();
  // portrait disc
  const py = 330, pr = 220; c.save(); c.beginPath(); c.arc(cx, py, pr, 0, 7); c.fillStyle = con ? '#e9edf5' : '#f4ecd9'; c.fill(); c.clip();
  const cv = makeCanvas(); const ctx = cv.getContext('2d');
  if (con) drawChar(ctx, 'd2', { expr: 'smug', look: [-1, 0], arms: { l: [-0.12, 0.85], r: [0.12, 0.85] } }); else drawChar(ctx, 'lustig', { expr: 'neutral', open: { r: true }, arms: { r: [0.46, 1.02] } });
  const s = 0.5; c.drawImage(cv, cx - cv.width * s / 2 + (con ? 0 : 18), py - 330, cv.width * s, cv.height * s); c.restore();
  c.lineWidth = 9; c.strokeStyle = INK; c.beginPath(); c.arc(cx, py, pr, 0, 7); c.stroke();
  // label banner: text measured and fitted with padding
  const label = con ? 'CON MAN' : 'OFFICIAL', col = con ? '#2a2e44' : '#2b4f9c'; let fs = 96; c.font = `900 ${fs}px "DejaVu Sans", sans-serif`; while (c.measureText(label).width > 470 && fs > 50) { fs -= 2; c.font = `900 ${fs}px "DejaVu Sans", sans-serif`; }
  const tw = c.measureText(label).width, bw = tw + 70, bh = fs + 30, by = 572; c.fillStyle = INK; c.beginPath(); c.roundRect(cx - bw / 2 + 4, by + 6, bw, bh, 22); c.fill(); c.fillStyle = col; c.beginPath(); c.roundRect(cx - bw / 2, by, bw, bh, 22); c.fill();
  c.fillStyle = '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, cx, by + bh / 2 + 2);
}); }
export const cards = ['con', 'off'].map((k, i) => { const m = plane(1.5, 1.8, new THREE.MeshBasicMaterial({ map: cardTex(k), transparent: true, alphaTest: 0.05 }), g); m.position.set(i ? 0.74 : -0.74, 3.3, -0.2); m.userData.s = 0.86; return m; });
export const bubbles = [[-0.3, 2.3, 0.07], [-0.5, 2.5, 0.1], [0.3, 2.3, 0.07], [0.5, 2.5, 0.1]].map(([x, y, r]) => { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 20), new THREE.MeshBasicMaterial({ color: 0xffffff })); m.position.set(x, y, -0.1); g.add(m); return m; });
const markTex = (ok) => ctex(256, 256, (c, w, h) => { c.lineCap = 'round'; c.lineWidth = 46; c.strokeStyle = INK; const path = () => { c.beginPath(); if (ok) { c.moveTo(40, 140); c.lineTo(105, 205); c.lineTo(220, 55); } else { c.moveTo(45, 45); c.lineTo(211, 211); c.moveTo(211, 45); c.lineTo(45, 211); } c.stroke(); }; path(); c.lineWidth = 30; c.strokeStyle = ok ? '#2fae4a' : '#d0262e'; path(); });
export const marks = [false, true].map((ok, i) => { const m = plane(0.78, 0.78, new THREE.MeshBasicMaterial({ map: markTex(ok), transparent: true, depthWrite: false }), g); m.position.set(i ? 0.74 : -0.74, 3.42, -0.1); m.visible = false; return m; });
