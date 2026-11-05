// RC01-T001 — sets: P post office counter (x=0), M relief map (x=300), B Bank of Vernal street (x=600)
import { THREE, scene, ctex, lam, toon, outline, box, R, setSeed, INK, signTex, Char, imgTex, paintedMat, woodTex, gravelTex, DIG, stampTex, clamp, lerp, TEXLOAD } from './core.js';
import { TYPES } from './chars2.js';

TYPES.director = { coat: '#3d5a3a', shirt: '#f4ecdc', tie: 'tie', tieCol: '#c8323a', vest: '#e9dcc0', hat: 'bowler', hatCol: '#2a2420', hair: 'side', hairCol: '#3a2a20', mustache: 'walrus', belly: 0.12, pants: '#2e2e36' };
TYPES.clerk = { coat: '#2b3f6b', shirt: '#f4ecdc', tie: 'bow', tieCol: '#1f1f1f', hat: 'flat', hatCol: '#22305a', hair: 'side', hairCol: '#6b4423', mustache: 'thin', glasses: true, belly: 0.02, pants: '#262a36' };

const UP = new THREE.Vector3(0, 1, 0);
// ---------- shared props: bricks, crates, postage label ----------
export const BRICK = { w: 0.2, h: 0.057, d: 0.095 };
const brickGeo = new THREE.BoxGeometry(BRICK.w, BRICK.h, BRICK.d);
const brickMats = [0xb4472e, 0xa63f2a, 0xc0583a, 0x9c3a26].map(c => toon(c));
export function brick(parent, i = 0) { const m = new THREE.Mesh(brickGeo, brickMats[i % 4]); m.castShadow = m.receiveShadow = true; outline(m, 0.003); parent.add(m); return m; }
const pine = woodTex(36, 66, 3, false, 256);
const pineM = toon(0xffffff, { map: pine }), pineD = toon(0xd8c7a8, { map: pine });
export const CRATE = { w: 0.25, h: 0.3, d: 0.24, t: 0.014 };
// postage label: kraft tag with three stamps + red cancel rings
const labelTex = ctex(512, 320, (g, w, h) => { g.fillStyle = '#e8d3a4'; g.fillRect(0, 0, w, h); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8);
  g.fillStyle = INK; g.font = 'bold 54px "DejaVu Serif", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PARCEL POST', w / 2, 62);
  ['#3f7f4a', '#c8323a', '#2f5f95'].forEach((c, i) => { const x = 70 + i * 130, y = 130; g.fillStyle = '#fbf6e8'; g.fillRect(x - 6, y - 6, 112, 132); g.fillStyle = c; g.fillRect(x + 6, y + 6, 88, 108); g.fillStyle = '#fbf6e8'; g.beginPath(); g.arc(x + 50, y + 55, 26, 0, 7); g.fill(); g.fillStyle = c; g.font = 'bold 30px "DejaVu Sans", sans-serif'; g.fillText(String([5, 10, 20][i]), x + 50, y + 57); });
  g.strokeStyle = 'rgba(200,40,40,0.85)'; g.lineWidth = 7; g.beginPath(); g.arc(410, 200, 70, 0, 7); g.stroke(); for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(40, 160 + k * 26); for (let x = 40; x < 470; x += 20) g.lineTo(x, 160 + k * 26 + Math.sin(x / 18) * 7); g.stroke(); } });
export function postLabel(parent, w = 0.16) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 320 / 512), new THREE.MeshLambertMaterial({ map: labelTex, emissive: 0xffffff, emissiveMap: labelTex, emissiveIntensity: 0.35, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 })); parent.add(m); return m; }
// crate: open box (slatted walls), optional hinged lid, 10 brick slots (5 layers × 2)
export function makeCrate(parent, { lid = false, bricks = true } = {}) {
  const g = new THREE.Group(); parent.add(g); const { w, h, d, t } = CRATE;
  box(w, t, d, pineD, 0, t / 2, 0, g, 0.004);
  for (const s of [-1, 1]) for (const y of [0.075, 0.225]) { box(w, 0.12, t, pineM, 0, y, s * (d / 2 - t / 2), g, 0.004); box(t, 0.12, d - 2 * t, pineM, s * (w / 2 - t / 2), y, 0, g, 0.004); }
  for (const s of [-1, 1]) box(0.03, h, 0.03, pineD, s * (w / 2 - 0.012), h / 2, d / 2 - 0.004, g, 0.004);
  const lab = postLabel(g); lab.position.set(0, h * 0.52, d / 2 + 0.012); lab.visible = false;
  const slots = []; for (let i = 0; i < 10; i++) slots.push(new THREE.Vector3(0, t + BRICK.h / 2 + 0.002 + Math.floor(i / 2) * (BRICK.h + 0.002), (i % 2 ? 1 : -1) * (BRICK.d / 2 + 0.003)));
  const br = []; if (bricks) for (let i = 0; i < 10; i++) { const b = brick(g, i); b.position.copy(slots[i]); br.push(b); }
  let lidG = null; if (lid) { lidG = new THREE.Group(); lidG.position.set(0, h, -d / 2); g.add(lidG); box(w + 0.01, t, d + 0.01, pineM, 0, t / 2, d / 2, lidG, 0.004); const l2 = postLabel(lidG, 0.14); l2.rotation.x = -Math.PI / 2; l2.position.set(0, t + 0.002, d / 2); }
  g.userData = { lab, slots, br, lid: lidG }; return g;
}

// =================== P: POST OFFICE (x = 0) ===================
setSeed(101);
export const P = { g: new THREE.Group() }; scene.add(P.g); P.g.visible = false;
const pg = P.g;
const planks = woodTex(30, 46, 8, false, 1024); planks.wrapS = planks.wrapT = THREE.RepeatWrapping; planks.repeat.set(4, 4);
const pFloor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), lam(0xffffff, { map: planks })); pFloor.rotation.x = -Math.PI / 2; pFloor.receiveShadow = true; pg.add(pFloor);
const poTex = imgTex('mg/postoffice_back.jpg');
export const pBack = new THREE.Mesh(new THREE.PlaneGeometry(10, 10 * 768 / 1376), paintedMat(poTex, 0.6)); pBack.position.set(0.2, 10 * 768 / 1376 / 2 - 0.05, -3.0); pBack.receiveShadow = true; pg.add(pBack);
for (const s of [-1, 1]) { const sw = new THREE.Mesh(new THREE.PlaneGeometry(9, 5.6), lam(0xe9dcc4)); sw.rotation.y = -s * Math.PI / 2; sw.position.set(s * 5.0, 2.8, 1.5); sw.receiveShadow = true; pg.add(sw); }
// counter: dark panelled front, light worn top
const panel = ctex(1024, 512, (g, w, h) => { g.fillStyle = '#5a3820'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) { const x = 18 + i * (w - 36) / 6; g.fillStyle = '#6b4428'; g.fillRect(x + 10, 40, (w - 36) / 6 - 20, h - 80); g.strokeStyle = 'rgba(25,12,4,0.7)'; g.lineWidth = 6; g.strokeRect(x + 10, 40, (w - 36) / 6 - 20, h - 80); g.strokeStyle = 'rgba(255,220,170,0.18)'; g.lineWidth = 3; g.strokeRect(x + 18, 48, (w - 36) / 6 - 36, h - 96); } }, [2, 1]);
const topWood = woodTex(28, 52, 5, false, 1024);
export const TOP = 0.99;
box(2.8, 0.08, 1.0, toon(0xffffff, { map: topWood }), 0.2, 0.95, 0, pg, 0.012);
box(2.7, 0.9, 0.9, lam(0xffffff, { map: panel }), 0.2, 0.45, -0.02, pg, 0.01);
// parcel scale: green iron base, brass platform, dial on a column (needle in lb, red LIMIT at 50)
export const SC = new THREE.Vector3(0.35, TOP, 0.06);
const scaleG = new THREE.Group(); scaleG.position.copy(SC); pg.add(scaleG);
const iron = toon(0x2f5d4a), brassM = toon(0xc9a44a);
box(0.34, 0.05, 0.3, iron, 0, 0.025, 0, scaleG, 0.005);
export const platform = box(0.33, 0.016, 0.29, brassM, 0, 0.058, 0, scaleG, 0.004);
box(0.045, 0.66, 0.045, iron, 0, 0.36, -0.13, scaleG, 0.004);
const dialTex = ctex(512, 512, (g, w, h) => { const c = w / 2; g.fillStyle = '#f6efdc'; g.beginPath(); g.arc(c, c, 250, 0, 7); g.fill();
  const ang = lb => (-135 + lb / 60 * 270) * Math.PI / 180;
  g.strokeStyle = 'rgba(208,38,46,0.9)'; g.lineWidth = 34; g.beginPath(); g.arc(c, c, 200, ang(50) - Math.PI / 2, ang(60) - Math.PI / 2); g.stroke();
  g.strokeStyle = INK; g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let lb = 0; lb <= 60; lb += 2) { const a = ang(lb) - Math.PI / 2, big = lb % 10 === 0; g.lineWidth = big ? 7 : 3; g.beginPath(); g.moveTo(c + Math.cos(a) * (big ? 168 : 186), c + Math.sin(a) * (big ? 168 : 186)); g.lineTo(c + Math.cos(a) * 218, c + Math.sin(a) * 218); g.stroke();
    if (big) { g.font = `bold ${lb === 50 ? 52 : 40}px "DejaVu Sans", sans-serif`; g.fillStyle = lb === 50 ? '#c8202a' : INK; g.fillText(String(lb), c + Math.cos(a) * 128, c + Math.sin(a) * 128); } }
  g.fillStyle = INK; g.font = 'bold 44px "DejaVu Sans", sans-serif'; g.fillText('LB', c, c + 92); g.fillStyle = '#c8202a'; g.font = 'bold 36px "DejaVu Sans", sans-serif'; g.fillText('LIMIT', c + 112, c - 182); });
export const dial = new THREE.Mesh(new THREE.CircleGeometry(0.15, 64), new THREE.MeshLambertMaterial({ map: dialTex, emissive: 0xffffff, emissiveMap: dialTex, emissiveIntensity: 0.4 })); dial.position.set(0, 0.74, -0.105); scaleG.add(dial);
{ const rim = new THREE.Mesh(new THREE.TorusGeometry(0.153, 0.014, 10, 64), brassM); rim.position.copy(dial.position); scaleG.add(rim); const back = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.03, 48), iron); back.rotation.x = Math.PI / 2; back.position.set(0, 0.74, -0.125); scaleG.add(back); }
const needle = new THREE.Group(); needle.position.set(0, 0.74, -0.098); scaleG.add(needle);
{ const n = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.13, 0.004), new THREE.MeshBasicMaterial({ color: 0x1b1e2e })); n.position.y = 0.05; needle.add(n); const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.01, 16), brassM); hub.rotation.x = Math.PI / 2; needle.add(hub); }
// red 50–60 lb arc on the dial texture runs from 3 o'clock 45° downward (canvas clockwise = 3D clockwise seen from the front)
export const limitGlow = new THREE.Mesh(new THREE.RingGeometry(0.104, 0.13, 48, 1, -Math.PI / 4, Math.PI / 4), new THREE.MeshBasicMaterial({ color: 0xff3a3a, transparent: true, opacity: 0, depthWrite: false }));
limitGlow.position.set(0, 0.74, -0.101); scaleG.add(limitGlow);
export function setScale(lb) { platform.position.y = 0.058 - clamp(lb / 60) * 0.012; needle.rotation.z = -(-135 + lb / 60 * 270) * Math.PI / 180; }
// hero crate on the scale + pile of loose bricks beside it ("ten to a wooden crate")
export const crate1 = makeCrate(pg); crate1.position.set(SC.x, TOP + 0.066, SC.z);
export const PILE = []; for (let i = 0; i < 10; i++) PILE.push(new THREE.Vector3(-0.1 + (i % 2) * 0.03, TOP + BRICK.h / 2 + Math.floor(i / 3) * (BRICK.h + 0.001), (i % 3) * 0.105 - 0.04));
const _v = new THREE.Vector3();
// k: 0 = brick i lies on the pile, 1 = in its slot in crate1 (arc between)
export function setLoad(k) { crate1.updateMatrixWorld(); crate1.userData.br.forEach((b, i) => { const ki = clamp(k[i]); if (ki >= 1) { b.position.copy(crate1.userData.slots[i]); b.rotation.set(0, 0, 0); return; }
  crate1.localToWorld(_v.copy(crate1.userData.slots[i])); const p = PILE[9 - i].clone().lerp(_v, ki); p.y += Math.sin(ki * Math.PI) * 0.22; crate1.worldToLocal(p); b.position.copy(p); b.rotation.set(0, (1 - ki) * 1.4 + Math.sin(ki * Math.PI) * 0.6, Math.sin(ki * Math.PI) * 0.5); }); }
// surprise crate (closed, slides in) and the next one that drops on it
export const crate2 = makeCrate(pg, { lid: true }); crate2.visible = false;
export const crate3 = makeCrate(pg, { lid: true }); crate3.visible = false;
// flip-digit counter (T02): BRICKS MAILED 00000
export const FB = new THREE.Vector3(-1.02, TOP, -0.22);
export const fbG = new THREE.Group(); fbG.position.copy(FB); pg.add(fbG);
box(0.86, 0.34, 0.06, toon(0x3a2416), 0, 0.2, 0, fbG, 0.006);
for (const s of [-1, 1]) box(0.04, 0.12, 0.04, toon(0x3a2416), s * 0.36, 0.01, 0, fbG);
const hdr = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.15), new THREE.MeshLambertMaterial({ map: signTex(860, 150, '#e9d9b2', [{ t: 'BRICKS MAILED', size: 92, y: 80, col: '#7a2f22' }], 10), emissive: 0xffffff, emissiveIntensity: 0.25 }));
hdr.position.set(0, 0.45, 0.0); fbG.add(hdr); hdr.material.emissiveMap = hdr.material.map;
const src = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.06), new THREE.MeshBasicMaterial({ map: signTex(500, 60, '#f3ead6', [{ t: 'SOURCE: USPS HISTORY', size: 34, y: 32, col: '#444', font: '"DejaVu Sans", sans-serif' }], 4) }));
src.position.set(0, 0.075, 0.032); fbG.add(src);
export const digits = [0, 1, 2, 3, 4].map(i => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.18), new THREE.MeshLambertMaterial({ map: DIG[0], emissive: 0xffffff, emissiveMap: DIG[0], emissiveIntensity: 0.3 })); m.position.set(-0.3 + i * 0.14 + (i >= 2 ? 0.03 : 0), 0.24, 0.032); fbG.add(m); return m; });
{ const cm = new THREE.Mesh(new THREE.CircleGeometry(0.012, 12), new THREE.MeshBasicMaterial({ color: 0xf3ead6 })); cm.position.set(-0.3 + 2 * 0.14 - 0.055, 0.16, 0.033); fbG.add(cm); }
export function setCount(n) { const s = String(Math.max(0, Math.min(99999, Math.round(n)))).padStart(5, '0'); digits.forEach((m, i) => { const d = DIG[+s[i]]; if (m.material.map !== d) { m.material.map = d; m.material.emissiveMap = d; m.material.needsUpdate = true; } }); }
// crate stack on the floor right of the counter (24 crates, 4 × 6)
const stackG = new THREE.Group(); stackG.position.set(2.05, 0, -0.35); pg.add(stackG);
export const stack = []; for (let i = 0; i < 24; i++) { const c = makeCrate(stackG, { lid: true, bricks: false }); const col = i % 4, row = Math.floor(i / 4); c.position.set((col - 1.5) * 0.27 + (row % 2) * 0.04, row * (CRATE.h + 0.025), (col % 2) * 0.05); c.rotation.y = R(-0.12, 0.12); c.userData.lab.visible = true; c.visible = false; stack.push(c); }
export function setStack(n) { stack.forEach((c, i) => { const k = clamp(n - i); c.visible = k > 0; if (c.visible) { const row = Math.floor(i / 4); c.position.y = row * (CRATE.h + 0.025) + (1 - k) * 0.35; } }); }
// rubber stamp (3D, comes down onto crate1's front label in the hook)
export const rstamp = new THREE.Group(); pg.add(rstamp); rstamp.visible = false;
box(0.09, 0.03, 0.06, toon(0xc8323a), 0, 0.015, 0, rstamp, 0.003); { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.09, 16), toon(0x7a4b25)); h.position.y = 0.075; outline(h, 0.003); rstamp.add(h); const k = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), toon(0x7a4b25)); k.position.y = 0.13; outline(k, 0.003); rstamp.add(k); }
// NOTICE placard (Nov 1916 rule): lines + AWAIT INSTRUCTIONS stamp appear on the narration
const NOTE_LINES = ['OVER 200 LB A DAY', 'ONE SENDER → ONE RECIPIENT', 'NON-PERISHABLE'];
const noteCanvas = document.createElement('canvas'); noteCanvas.width = 640; noteCanvas.height = 840; const ng = noteCanvas.getContext('2d');
const noteTex = new THREE.CanvasTexture(noteCanvas); noteTex.colorSpace = THREE.SRGBColorSpace; noteTex.anisotropy = 8;
let noteKey = '';
export function setNotice(k) { const key = k.map(v => Math.round(clamp(v) * 20)).join(','); if (key === noteKey) return; noteKey = key; const g = ng, w = 640, h = 840;
  g.fillStyle = '#f6efdc'; g.fillRect(0, 0, w, h); g.strokeStyle = INK; g.lineWidth = 14; g.strokeRect(7, 7, w - 14, h - 14);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = INK; g.font = 'bold 92px "DejaVu Serif", serif'; g.fillText('NOTICE', w / 2, 92); g.fillRect(70, 150, w - 140, 6);
  g.font = 'bold 50px "DejaVu Serif", serif'; g.fillStyle = '#7a2f22'; g.fillText('NOVEMBER 1916', w / 2, 210);
  // k[0]: "PARCEL POST RULES" (on "the rules were clarified"); k[1..3]: the three conditions; k[4]: AWAIT INSTRUCTIONS stamp
  const fit = (s, px) => { g.font = `bold ${px}px "DejaVu Sans", sans-serif`; while (g.measureText(s).width > w - 90 && px > 20) { px -= 2; g.font = `bold ${px}px "DejaVu Sans", sans-serif`; } };
  if (k[0] > 0) { g.save(); g.globalAlpha = clamp(k[0]); g.fillStyle = '#555'; fit('PARCEL POST RULES', 34); g.fillText('PARCEL POST RULES', w / 2, 268); g.restore(); }
  g.fillStyle = INK;
  NOTE_LINES.forEach((L, i) => { const a = clamp(k[i + 1]); if (a <= 0) return; g.save(); g.globalAlpha = a; g.translate((1 - a) * -40, 0); fit(L, 44); g.fillText(L, w / 2, 345 + i * 82); g.restore(); });
  const s = clamp(k[4]); if (s > 0) { const sc = 1 + (1 - s) * 1.0; g.save(); g.translate(w / 2, 650); g.rotate(-0.12); g.scale(sc, sc); g.globalAlpha = Math.min(1, s * 1.5); g.strokeStyle = '#c8202a'; g.lineWidth = 12; g.strokeRect(-270, -78, 540, 156); g.fillStyle = '#c8202a'; g.font = 'bold 60px "DejaVu Sans", sans-serif'; g.fillText('AWAIT', 0, -32); g.fillText('INSTRUCTIONS', 0, 34); g.restore(); }
  noteTex.needsUpdate = true; }
setNotice([0, 0, 0, 0, 0]);
export const notice = new THREE.Group(); pg.add(notice); notice.visible = false;
{ const pm = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.656), new THREE.MeshLambertMaterial({ map: noteTex, emissive: 0xffffff, emissiveMap: noteTex, emissiveIntensity: 0.35 })); pm.position.set(0, 0.36, 0.012); notice.add(pm);
  box(0.54, 0.7, 0.02, toon(0x5a3820), 0, 0.36, 0, notice, 0.005); const leg = box(0.03, 0.62, 0.03, toon(0x5a3820), 0, 0.3, -0.16, notice); leg.rotation.x = -0.45; }
// set dressing: inkwell + ledger, string spool, mail sack, stamp drawer
box(0.36, 0.05, 0.26, toon(0x7a2f22), -0.42, TOP + 0.025, 0.28, pg, 0.004).rotation.y = 0.2;
{ const ink = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.06, 16), toon(0x1f2a3a)); ink.position.set(1.05, TOP + 0.03, 0.25); outline(ink, 0.003); pg.add(ink);
  const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.07, 20), toon(0xd8c38a)); sp.position.set(1.25, TOP + 0.035, 0.1); outline(sp, 0.003); pg.add(sp);
  const sack = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 14), toon(0x8a7a5a)); sack.scale.set(1, 1.25, 0.8); sack.position.set(-1.75, 0.38, 0.35); outline(sack, 0.008); pg.add(sack); }
export const pKey = new THREE.DirectionalLight(0xfff0d8, 1.4); pKey.position.set(-3.0, 5, 4); pKey.castShadow = true; pKey.shadow.mapSize.set(2048, 2048); { const c = pKey.shadow.camera; c.left = -4; c.right = 4; c.top = 4; c.bottom = -4; c.far = 20; } pKey.shadow.bias = -0.0005; pg.add(pKey); pKey.target.position.set(0.3, 1, 0); pg.add(pKey.target);
export const pLight = new THREE.PointLight(0xffe0b0, 5, 9, 1.6); pLight.position.set(0.3, 2.9, 1.2); pg.add(pLight);
export const pc = { director: new Char('director', pg), clerk: new Char('clerk', pg) };

// =================== M: RELIEF MAP (x = 300) ===================
setSeed(201);
export const M = { g: new THREE.Group() }; M.g.position.set(300, 0, 0); scene.add(M.g); M.g.visible = false;
const mg = M.g;
const mapTex = imgTex('mg/relief_map.jpg');
const table = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), lam(0x6b4428, { map: woodTex(24, 34, 10, false, 512) })); table.rotation.x = -Math.PI / 2; table.position.y = -0.01; table.receiveShadow = true; mg.add(table);
export const MAPW = 2.234, MAPH = 4.0;
const mapM = new THREE.Mesh(new THREE.PlaneGeometry(MAPW, MAPH), paintedMat(mapTex, 0.62, 0xc8c8c8)); mapM.rotation.x = -Math.PI / 2; mapM.receiveShadow = true; mg.add(mapM);
box(MAPW + 0.06, 0.012, MAPH + 0.06, toon(0x3a2416), 0, -0.013, 0, mg); // frame top stays under the map plane
export const mapPt = (u, v, y = 0.01) => new THREE.Vector3(-MAPW / 2 + u * MAPW, y, -MAPH / 2 + v * MAPH);
export const ORIGIN = mapPt(0.52, 0.64), VERNAL = mapPt(0.54, 0.19);
const ROUTE = new THREE.CatmullRomCurve3([[0.52, 0.64], [0.66, 0.68], [0.85, 0.60], [0.9, 0.42], [0.92, 0.25], [0.88, 0.12], [0.8, 0.08], [0.7, 0.12], [0.6, 0.15], [0.54, 0.19]].map(p => mapPt(p[0], p[1], 0.02)), false, 'catmullrom', 0.3);
const RSEG = 300;
const routeM = new THREE.Mesh(new THREE.TubeGeometry(ROUTE, RSEG, 0.02, 8, false), new THREE.MeshBasicMaterial({ color: 0xd0262e })); mg.add(routeM);
export function setRoute(k) { const n = Math.floor(clamp(k) * RSEG) * 8 * 6; routeM.geometry.setDrawRange(0, n); routeM.visible = n > 0; }
export const routePt = s => ROUTE.getPointAt(clamp(s)).clone();
// straight "as it looks on the map" line: dashes
const dashes = []; { const N = 16; for (let i = 0; i < N; i++) { const a = ORIGIN.clone().lerp(VERNAL, (i + 0.15) / N), b = ORIGIN.clone().lerp(VERNAL, (i + 0.7) / N); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); const d = b.clone().sub(a); m.position.copy(a).addScaledVector(d, 0.5); m.position.y = 0.03; m.quaternion.setFromUnitVectors(UP, d.clone().normalize()); m.scale.y = d.length(); mg.add(m); dashes.push(m); } }
export function setDashes(k) { dashes.forEach((m, i) => { m.visible = i < Math.round(clamp(k) * dashes.length); }); }
// delivery zone rings around Vernal
export const rings = [0.7, 1.3, 1.95].map((r, i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.016, 8, 128), new THREE.MeshBasicMaterial({ color: [0x3f8fd8, 0x2f7fc8, 0x1f6fb8][i], transparent: true, opacity: 0.9, depthWrite: false })); m.rotation.x = Math.PI / 2; m.position.copy(VERNAL); m.position.y = 0.025; mg.add(m); m.visible = false;
  const f = new THREE.Mesh(new THREE.RingGeometry(i ? [0.7, 1.3][i - 1] : 0, r, 128), new THREE.MeshBasicMaterial({ color: 0x5fa8e8, transparent: true, opacity: 0.0, depthWrite: false, side: THREE.DoubleSide })); f.rotation.x = -Math.PI / 2; f.position.y = -0.008; m.add(f); m.userData.fill = f; return m; });
function pin(col) { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.22, 16), toon(0x2a2a2a)); c.rotation.x = Math.PI; c.position.y = 0.11; g.add(c); const h = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 14), toon(col)); h.position.y = 0.25; outline(h, 0.005); g.add(h); mg.add(g); g.visible = false; return g; }
export const pinO = pin(0xd0262e), pinV = pin(0x2f6fd0); pinO.position.copy(ORIGIN); pinV.position.copy(VERNAL);
function mLabel(text, w, bg = '#f2c94c', col = INK) { const size = Math.min(84, Math.floor(84 * 440 / (text.length * 54))); const t = signTex(512, 150, bg, [{ t: text, size, y: 80, col, font: '"DejaVu Sans", sans-serif' }], 10); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 150 / 512), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthTest: false })); m.renderOrder = 30; mg.add(m); m.visible = false; return m; }
export const ML = { vernal: mLabel('VERNAL, UTAH', 0.7, '#ffffff'), zones: mLabel('DELIVERY ZONES', 0.8, '#bfe0ff'), route: mLabel('ACTUAL ROUTE', 0.75, '#ffb3a8'), map: mLabel('ON THE MAP', 0.65, '#ffffff'), bricks: mLabel('BRICKS', 0.45) };
// travelling crate on the route
export const mCrate = new THREE.Group(); mg.add(mCrate); mCrate.visible = false;
{ const c = makeCrate(mCrate, { lid: true, bricks: false }); c.scale.setScalar(0.45); c.userData.lab.visible = true; }
export const mKey = new THREE.DirectionalLight(0xfff4e0, 1.3); mKey.position.set(-2, 5, 3); mKey.castShadow = true; mKey.shadow.mapSize.set(2048, 2048); { const c = mKey.shadow.camera; c.left = -3; c.right = 3; c.top = 3; c.bottom = -3; c.far = 20; } mg.add(mKey); mKey.target.position.set(0, 0, 0); mg.add(mKey.target);

// =================== B: BANK OF VERNAL, MAIN STREET (x = 600) ===================
setSeed(301);
export const B = { g: new THREE.Group() }; B.g.position.set(600, 0, 0); scene.add(B.g); B.g.visible = false;
const bg = B.g;
const dirt = gravelTex(); dirt.repeat.set(10, 10);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), lam(0xe0c49a, { map: dirt })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; bg.add(ground);
const stTex = imgTex('mg/street_back.jpg');
export const bBack = new THREE.Mesh(new THREE.PlaneGeometry(18, 18 * 768 / 1376), paintedMat(stTex, 0.7, 0xd0d0d0, { fog: false })); bBack.position.set(0, 18 * 768 / 1376 / 2 - 3.2, -8); // painted horizon ≈ camera height; the painted foreground hides under the 3D ground bg.add(bBack);
// bank building: plaster sides, unfinished wood front, cornice + sign
export const FW = 3.2, FH = 3.6, FZ = -1.0;
const plasterB = toon(0xd9c7a5);
box(FW, FH, 2.6, plasterB, 0, FH / 2, FZ - 1.3 - 0.01, bg, 0.012);
const sheath = woodTex(34, 70, 10, true, 512); sheath.wrapS = sheath.wrapT = THREE.RepeatWrapping; sheath.repeat.set(2, 2);
const front = new THREE.Mesh(new THREE.PlaneGeometry(FW, FH), lam(0xd8c8a8, { map: sheath })); front.position.set(0, FH / 2, FZ + 0.002); front.receiveShadow = true; bg.add(front);
box(FW + 0.3, 0.26, 0.36, toon(0xe8dcc0), 0, FH + 0.13, FZ + 0.02, bg, 0.008);
box(FW + 0.1, 0.5, 0.2, toon(0xe8dcc0), 0, FH + 0.5, FZ - 0.05, bg, 0.008);
const signB = signTex(1300, 220, '#24452f', [{ t: 'BANK OF VERNAL', size: 118, y: 116, col: '#f2c94c' }], 18);
const bSign = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 2.7 * 220 / 1300), new THREE.MeshLambertMaterial({ map: signB, emissive: 0xffffff, emissiveMap: signB, emissiveIntensity: 0.3 })); bSign.position.set(0, FH + 0.5, FZ + 0.06); bg.add(bSign);
// openings: door + 5 windows (frames exist from the start)
export const OPEN = [[-0.38, 0.38, 0, 1.85], [-1.3, -0.72, 0.85, 1.95], [0.72, 1.3, 0.85, 1.95], [-1.3, -0.72, 2.35, 3.25], [-0.3, 0.3, 2.35, 3.25], [0.72, 1.3, 2.35, 3.25]];
const glass = lam(0x34506e, { emissive: 0x18283a }), trim = toon(0xf1e9d6), doorM = toon(0x5a3820);
OPEN.forEach(([x0, x1, y0, y1], i) => { const w = x1 - x0, h = y1 - y0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  box(w, h, 0.04, i === 0 ? doorM : glass, cx, cy, FZ - 0.01, bg, 0.004);
  box(w + 0.1, 0.07, 0.09, trim, cx, y1 + 0.035, FZ + 0.03, bg, 0.004); if (i) { box(w + 0.1, 0.06, 0.12, trim, cx, y0 - 0.03, FZ + 0.04, bg, 0.004); box(0.04, h, 0.05, trim, cx, cy, FZ + 0.01, bg); }
  for (const s of [-1, 1]) box(0.05, h, 0.08, trim, cx + s * (w / 2 + 0.025), cy, FZ + 0.03, bg, 0.004); });
{ const knob = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), toon(0xc9a44a)); knob.position.set(0.25, 0.95, FZ + 0.04); bg.add(knob); }
// brick facade: running bond, bottom-up order; count = how many are laid; ghost copy for "needed special bricks"
const BP = { x: 0.252, y: 0.09, w: 0.24, h: 0.08, d: 0.05 };
const inOpen = (x, y) => OPEN.some(([x0, x1, y0, y1]) => x > x0 - 0.16 && x < x1 + 0.16 && y > y0 - 0.06 && y < y1 + 0.07);
const BR = []; for (let r = 0; r < Math.floor(FH / BP.y); r++) for (let c = -7; c <= 7; c++) { const x = c * BP.x + (r % 2) * BP.x / 2, y = r * BP.y + BP.h / 2 + 0.005; if (Math.abs(x) > FW / 2 - BP.w / 2) continue; if (inOpen(x, y)) continue; BR.push([x, y, r]); }
export const NBR = BR.length;
const fGeo = new THREE.BoxGeometry(BP.w, BP.h, BP.d);
export const facade = new THREE.InstancedMesh(fGeo, toon(0xffffff), NBR); facade.castShadow = facade.receiveShadow = true;
export const ghost = new THREE.InstancedMesh(fGeo, new THREE.MeshBasicMaterial({ color: 0xffb08a, transparent: true, opacity: 0.0, depthWrite: false }), NBR);
{ const m4 = new THREE.Matrix4(), col = new THREE.Color(); BR.forEach(([x, y], i) => { m4.makeTranslation(x, y, FZ + BP.d / 2 + 0.006); facade.setMatrixAt(i, m4); ghost.setMatrixAt(i, m4); col.setHSL(R(0.015, 0.035), R(0.5, 0.62), R(0.36, 0.46)); facade.setColorAt(i, col); }); }
bg.add(facade); bg.add(ghost);
// mortar lines drawn as a dark backing behind the bricks so gaps read
const mortar = new THREE.Mesh(new THREE.PlaneGeometry(FW, FH), lam(0x8a7a66)); mortar.position.set(0, FH / 2, FZ + 0.004); bg.add(mortar);
export function setFacade(k, gk = 0) { const n = Math.round(clamp(k) * NBR); facade.count = n; facade.visible = n > 0; mortar.visible = n > 0; mortar.scale.y = clamp(n ? (BR[n - 1][1] + BP.h) / FH : 0.001, 0.001, 1); mortar.position.y = mortar.scale.y * FH / 2;
  ghost.visible = gk > 0.01; ghost.material.opacity = 0.55 * clamp(gk); }
// the stamped brick (payoff): left of the door, chest height
const SB = BR.reduce((best, b, i) => { const d = Math.hypot(b[0] + 0.62, b[1] - 1.3); return d < best[0] ? [d, i] : best; }, [1e9, 0])[1];
export const STAMPED = new THREE.Vector3(BR[SB][0], BR[SB][1], FZ + BP.d + 0.012); export const STAMPED_I = SB;
const stampDecal = postLabel(bg, 0.13); stampDecal.position.copy(STAMPED); stampDecal.visible = false;
export function setStampDecal(on) { stampDecal.visible = on; }
// town sign + hitching rail + barrels
{ const post = box(0.1, 1.9, 0.1, toon(0x6b4423), -1.95, 0.95, 0.45, bg, 0.006); }
const townT = signTex(900, 380, '#ead9b2', [{ t: 'VERNAL, UTAH', size: 90, y: 140, col: '#24452f' }, { t: '1916', size: 120, y: 280, col: '#8a2f2f' }], 16);
export const townSign = new THREE.Group(); townSign.position.set(-1.95, 1.62, 0.52); bg.add(townSign);
box(1.12, 0.48, 0.04, [toon(0x7a4b25), toon(0x7a4b25), toon(0x7a4b25), toon(0x7a4b25), lam(0xffffff, { map: townT, emissive: 0xffffff, emissiveMap: townT, emissiveIntensity: 0.3 }), toon(0x7a4b25)], 0, 0, 0, townSign, 0.008);
box(1.6, 0.06, 0.06, toon(0x6b4423), 2.1, 0.85, 0.6, bg, 0.004); for (const x of [1.4, 2.8]) box(0.08, 0.85, 0.08, toon(0x6b4423), x, 0.42, 0.6, bg, 0.004);
for (const [x, z] of [[1.75, -0.6], [2.05, -0.75]]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.55, 20), toon(0x8a5a32)); b.position.set(x, 0.275, z); outline(b, 0.006); bg.add(b); }
// crates delivered, waiting by the door (they empty as the facade fills)
export const bCrates = []; for (let i = 0; i < 6; i++) { const c = makeCrate(bg, { lid: true, bricks: false }); c.position.set(-1.25 + (i % 3) * 0.3, Math.floor(i / 3) * (CRATE.h + 0.02), 0.25 + (i % 2) * 0.05); c.rotation.y = R(-0.2, 0.2); c.userData.lab.visible = true; bCrates.push(c); }
export const bSun = new THREE.DirectionalLight(0xfff1d6, 2.0); bSun.position.set(-4, 7, 5); bSun.castShadow = true; bSun.shadow.mapSize.set(2048, 2048); { const c = bSun.shadow.camera; c.left = -5; c.right = 5; c.top = 6; c.bottom = -3; c.far = 30; } bSun.shadow.bias = -0.0005; bg.add(bSun); bSun.target.position.set(0, 1.5, -1); bg.add(bSun.target);
export const bc = { director: new Char('director', bg), clerk: new Char('clerk', bg) };
