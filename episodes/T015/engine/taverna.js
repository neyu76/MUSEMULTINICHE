// RC01-T015 demo — sets: A taverna counter (x=0), B X-ray cutaway (x=300)
import { THREE, scene, ctex, lam, toon, outline, box, plane, R, setSeed, INK, signTex, Char, imgTex, paintedMat, clamp, lerp, TEXLOAD } from './core.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TYPES } from './chars2.js';

TYPES.drinker = { coat: '#e07b39', shirt: '#f4ecdc', tie: 'none', hat: 'none', hair: 'curly', hairCol: '#2a1d14', mustache: 'thin', belly: 0.07, pants: '#4a3a2a' };
TYPES.owner = { coat: '#2f5f95', shirt: '#f4ecdc', tie: 'tie', tieCol: '#c8323a', vest: '#f1e9d6', hat: 'none', hair: 'bald', hairCol: '#3a2a20', mustache: 'walrus', belly: 0.14, pants: '#2e2e36' };

const WATER = new THREE.MeshPhongMaterial({ color: 0x5fb8e6, emissive: 0x0c3550, shininess: 90, specular: 0xffffff, transparent: true, opacity: 0.82 });
const GLASS = new THREE.MeshPhongMaterial({ color: 0xe6f4ff, emissive: 0x223038, shininess: 120, specular: 0xffffff, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide });
const RIM = new THREE.MeshBasicMaterial({ color: 0x2c3e55 });

// ---------- Tantalus cup (local units, foot bottom y=0) ----------
export const CUP = { foot: 0.02, stemTop: 0.12, bowlTop: 0.28, high: 0.235, max: 0.24 };
const BH = CUP.bowlTop - CUP.stemTop;
export const bowlR = y => 0.095 + 0.045 * Math.pow(clamp(y / BH), 0.7); // y from bowl bottom
function ring(r, y, parent, mat = RIM, tube = 0.003) { const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 8, 64), mat); m.rotation.x = Math.PI / 2; m.position.y = y; parent.add(m); return m; }
function maxTex() { return ctex(256, 96, (g, w, h) => { g.fillStyle = '#c8323a'; g.font = 'bold 72px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('MAX', w / 2, h / 2 + 4); }); }
export function makeCup(parent, opts = {}) {
  const g = new THREE.Group(); parent.add(g);
  const pts = []; for (let i = 0; i <= 24; i++) { const y = BH * i / 24; pts.push(new THREE.Vector2(bowlR(y), CUP.stemTop + y)); }
  const bowl = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), GLASS); bowl.renderOrder = 5; g.add(bowl);
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(bowlR(0), 48), GLASS); bottom.rotation.x = -Math.PI / 2; bottom.position.y = CUP.stemTop; g.add(bottom);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, CUP.stemTop - CUP.foot, 32, 1, true), GLASS); stem.position.y = (CUP.stemTop + CUP.foot) / 2; stem.renderOrder = 5; g.add(stem);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.068, CUP.foot, 48), GLASS); foot.position.y = CUP.foot / 2; foot.renderOrder = 5; g.add(foot);
  ring(bowlR(BH), CUP.bowlTop, g, RIM, 0.0045); ring(bowlR(0), CUP.stemTop, g); ring(0.068, 0.0, g); ring(0.05, CUP.foot, g);
  // central column (hides the siphon)
  const colMat = opts.xray ? GLASS : toon(0xf2ead8);
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.024, CUP.high - CUP.stemTop + 0.008, 32, 1, !!opts.xray), colMat); col.position.y = (CUP.high + CUP.stemTop + 0.008) / 2; if (!opts.xray) outline(col, 0.003); g.add(col);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.022, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), colMat); cap.position.y = CUP.high + 0.008; g.add(cap);
  // MAX line + label (T03)
  const maxRing = ring(bowlR(CUP.max - CUP.stemTop) + 0.001, CUP.max, g, new THREE.MeshBasicMaterial({ color: 0xc8323a }), 0.0028);
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.026), new THREE.MeshBasicMaterial({ map: maxTex(), transparent: true, depthWrite: false })); lab.position.set(0, CUP.max + 0.017, bowlR(CUP.max - CUP.stemTop) + 0.004); g.add(lab);
  // water in bowl + in stem
  const water = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.01, 48), WATER); water.renderOrder = 4; g.add(water);
  const stemWater = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, CUP.stemTop - CUP.foot, 16), WATER); stemWater.position.y = (CUP.stemTop + CUP.foot) / 2; g.add(stemWater);
  g.userData = { water, stemWater, level: -1, maxRing, lab };
  return g;
}
// level 0..1 of bowl height
export function setCupLevel(cup, level, stemFull) {
  const u = cup.userData; const L = clamp(level, 0, 1); const h = Math.max(0.002, L * BH);
  if (Math.abs(L - u.level) > 0.002) { u.water.geometry.dispose(); u.water.geometry = new THREE.CylinderGeometry(bowlR(h) * 0.965, bowlR(0) * 0.965, h, 48); u.water.position.y = CUP.stemTop + h / 2; u.level = L; }
  u.water.visible = L > 0.004; u.stemWater.visible = !!stemFull;
}
// stream cylinder between two world points (in parent space)
export function stream(parent, r = 0.011) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.8, 1, 12, 1, true), WATER); parent.add(m); m.visible = false; return m; }
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _d = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
export function setStream(m, a, b, on, t) { m.visible = !!on; if (!on) return; _a.copy(a); _b.copy(b); m.parent.worldToLocal(_a); m.parent.worldToLocal(_b); _d.subVectors(_b, _a); const L = _d.length();
  m.position.copy(_a).addScaledVector(_d, 0.5); m.quaternion.setFromUnitVectors(UP, _d.normalize().negate()); m.scale.set(1 + 0.12 * Math.sin(t * 40), L, 1 + 0.12 * Math.cos(t * 37)); }

// =================== A: TAVERNA (x = 0) ===================
setSeed(1501);
export const A = { g: new THREE.Group() }; scene.add(A.g); A.g.visible = false;
const ag = A.g;
const tiles = ctex(1024, 1024, (g, w, h) => { const n = 4, s = w / n; g.fillStyle = '#b89c84'; g.fillRect(0, 0, w, h); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = `hsl(${R(14, 24)}, ${R(48, 60)}%, ${R(48, 58)}%)`; g.fillRect(i * s + 5, j * s + 5, s - 10, s - 10);
  for (let k = 0; k < 60; k++) { g.fillStyle = `rgba(${R(0, 1) < 0.5 ? '90,40,20' : '255,235,210'},${R(0.05, 0.14)})`; g.beginPath(); g.arc(i * s + R(10, s - 10), j * s + R(10, s - 10), R(2, 9), 0, 7); g.fill(); }
  g.fillStyle = 'rgba(255,240,220,0.22)'; g.fillRect(i * s + 5, j * s + 5, s - 10, 6); g.fillStyle = 'rgba(60,25,10,0.25)'; g.fillRect(i * s + 5, j * s + s - 11, s - 10, 6); } }, [8, 8]);
const tilesBg = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), lam(0xd9c8b4)); tilesBg.rotation.x = -Math.PI / 2; tilesBg.position.y = -0.002; ag.add(tilesBg);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), lam(0xffffff, { map: tiles })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; ag.add(floor);
const backTex = imgTex('mg/taverna_back_v5.jpg');
export const back = new THREE.Mesh(new THREE.PlaneGeometry(10, 10 * 768 / 1376), paintedMat(backTex, 0.58)); back.position.set(0.3, 10 * 768 / 1376 / 2 - 0.05, -3.0); back.receiveShadow = true; ag.add(back);
const plaster = lam(0xefe6d6);
for (const s of [-1, 1]) { const sw = new THREE.Mesh(new THREE.PlaneGeometry(9, 5.6), plaster); sw.rotation.y = -s * Math.PI / 2; sw.position.set(s * 5.0, 2.8, 1.5); sw.receiveShadow = true; ag.add(sw); }
// sign on the wall (T01 readable): the ironic house rule
const signT = signTex(900, 340, '#ead9b2', [{ t: 'FREE WATER', size: 104, y: 130, col: '#1f4f8a' }, { t: 'ONE CUP EACH', size: 84, y: 255, col: '#8a2f2f' }], 16);
const sign = box(1.5, 0.57, 0.04, [lam(0x7a4b25), lam(0x7a4b25), lam(0x7a4b25), lam(0x7a4b25), lam(0xffffff, { map: signT }), lam(0x7a4b25)], -0.55, 2.55, -2.9, ag, 0.012);
// counter
const wood = ctex(1024, 1024, (g, w, h) => { for (let i = 0; i < 6; i++) { g.fillStyle = `hsl(${R(24, 30)}, ${R(46, 56)}%, ${R(36, 46)}%)`; g.fillRect(0, i * h / 6, w, h / 6); g.fillStyle = 'rgba(40,20,5,0.55)'; g.fillRect(0, i * h / 6, w, 4); g.fillStyle = 'rgba(255,220,170,0.18)'; g.fillRect(0, i * h / 6 + 4, w, 3);
  g.strokeStyle = 'rgba(60,30,10,0.28)'; g.lineWidth = 2; for (let k = 0; k < 14; k++) { const y = i * h / 6 + R(8, h / 6 - 8); g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w / 3, y + R(-7, 7), w * 2 / 3, y + R(-7, 7), w, y); g.stroke(); }
  for (let k = 0; k < 2; k++) { const x = R(40, w - 40), y = i * h / 6 + h / 12; g.fillStyle = 'rgba(70,35,12,0.45)'; g.beginPath(); g.ellipse(x, y, R(10, 18), R(5, 8), 0, 0, 7); g.fill(); } } }, [2, 1]);
const blueBoard = ctex(1024, 512, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = `hsl(${R(205, 212)}, ${R(42, 52)}%, ${R(42, 50)}%)`; g.fillRect(i * w / 8, 0, w / 8, h); g.fillStyle = 'rgba(20,30,50,0.5)'; g.fillRect(i * w / 8, 0, 5, h); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(i * w / 8 + 5, 0, 3, h);
  for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(240,235,220,${R(0.08, 0.25)})`; g.fillRect(i * w / 8 + R(8, w / 8 - 8), R(0, h), R(2, 10), R(1, 3)); } } }, [2, 1]);
box(2.8, 0.08, 1.0, toon(0xffffff, { map: wood }), 0.2, 0.95, 0, ag, 0.012);
box(2.7, 0.9, 0.9, lam(0xffffff, { map: blueBoard }), 0.2, 0.45, -0.02, ag, 0.01);
// tray + stand + cup
export const TRAY = new THREE.Vector3(0.52, 0.99, 0.08);
const trayG = new THREE.Group(); trayG.position.copy(TRAY); ag.add(trayG);
const trayProf = [[0, 0], [0.2, 0], [0.215, 0.045], [0.205, 0.045], [0.19, 0.008], [0, 0.008]].map(p => new THREE.Vector2(p[0], p[1]));
const trayM = new THREE.Mesh(new THREE.LatheGeometry(trayProf, 64), toon(0xb8bcc4, { side: THREE.DoubleSide })); trayM.castShadow = trayM.receiveShadow = true; trayG.add(trayM); ring(0.215, 0.045, trayG, RIM, 0.004);
export const trayWater = new THREE.Mesh(new THREE.CylinderGeometry(0.192, 0.19, 1, 48), WATER); trayG.add(trayWater);
export function setTray(k) { const h = 0.004 + clamp(k) * 0.034; trayWater.scale.y = h; trayWater.position.y = 0.008 + h / 2; trayWater.visible = k > 0.01; }
const stand = new THREE.Group(); stand.position.set(0, 0.008, 0); trayG.add(stand);
const brass = toon(0xc9a44a); ring(0.07, 0.11, stand, brass, 0.008); for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + 0.5; const l = box(0.012, 0.11, 0.012, brass, Math.cos(a) * 0.07, 0.055, Math.sin(a) * 0.07, stand); }
export const cupA = makeCup(trayG); cupA.position.y = 0.008 + 0.115;
export const drainA = stream(ag, 0.009);
export const pourA = stream(ag, 0.011);
export const splash = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.004, 8, 32), new THREE.MeshBasicMaterial({ color: 0xd8f0ff, transparent: true, opacity: 0.8 })); splash.rotation.x = Math.PI / 2; trayG.add(splash);
// jug (grip at origin, body to +x, spout up-right)
export const jug = new THREE.Group(); ag.add(jug);
{ const clay = toon(0xc0693a); const pr = [[0, -0.15], [0.07, -0.15], [0.095, -0.1], [0.1, -0.02], [0.08, 0.06], [0.05, 0.1], [0.055, 0.12], [0.0, 0.12]].map(p => new THREE.Vector2(p[0], p[1]));
  const body = new THREE.Mesh(new THREE.LatheGeometry(pr, 40), clay); body.position.x = 0.13; outline(body, 0.006); body.castShadow = true; jug.add(body);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.099, 0.006, 8, 40), toon(0x2b2b3a)); band.rotation.x = Math.PI / 2; band.position.set(0.13, -0.03, 0); jug.add(band);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 10, 24, Math.PI * 1.1), clay); handle.position.set(0.045, 0.0, 0); handle.rotation.z = Math.PI * 0.45; outline(handle, 0.004); jug.add(handle);
  const sp = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 16, 1, true), clay); sp.position.set(0.215, 0.1, 0); sp.rotation.z = -Math.PI * 0.32; jug.add(sp); }
export const SPOUT = new THREE.Vector3(0.25, 0.125, 0);
// v5: hero jug = Hunyuan3D-2 model (art/jug.glb, from a Nano Banana image). Replaces the primitive jug once loaded:
// scaled to 0.28 m, handle at the grip origin, spout recomputed from the model's bounding box.
export const JUG_RY = 0.46; // turntable calibration: handle left, spout right when seen from the front
TEXLOAD.push(new Promise(res => new GLTFLoader().load('mg/jug.glb', g => {
  const m = g.scene; m.rotation.y = JUG_RY; let bb = new THREE.Box3().setFromObject(m); m.scale.setScalar(0.28 / bb.getSize(new THREE.Vector3()).y);
  bb = new THREE.Box3().setFromObject(m); m.position.set(-(bb.min.x + 0.03), -0.15 - bb.min.y, -(bb.min.z + bb.max.z) / 2);
  m.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; const mt = o.material; if (mt.map) { mt.emissive = new THREE.Color(0xffffff); mt.emissiveMap = mt.map; mt.emissiveIntensity = 0.22; mt.roughness = 0.75; mt.metalness = 0; } } });
  // spout = real mesh vertex furthest toward +x near the rim (a bbox corner floats off the model)
  m.updateMatrixWorld(true); bb = new THREE.Box3().setFromObject(m); const v = new THREE.Vector3(); let best = -1e9;
  m.traverse(o => { if (!o.isMesh) return; const p = o.geometry.attributes.position; for (let i = 0; i < p.count; i += 3) { v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld);
    if (v.y > bb.max.y - 0.07) { const sc = v.x + 0.35 * v.y; if (sc > best) { best = sc; SPOUT.copy(v); } } } });
  jug.children.slice().forEach(c => jug.remove(c)); jug.add(m);
  // x-ray copy for set B: same model, see-through
  const gm = m.clone(); gm.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.depthWrite = false; o.castShadow = false; } }); jugB.add(gm); res();
}, undefined, () => { console.log('jug.glb missing, keeping primitive jug'); res(); })));
export const ac = { drinker: new Char('drinker', ag), owner: new Char('owner', ag) };
export const aLight = new THREE.PointLight(0xffe0b0, 6, 9, 1.6); aLight.position.set(0.3, 2.9, 1.2); ag.add(aLight);

// ---- v5 set dressing: counter clutter, oil lamp, hanging herbs (samples: dense, every surface has props) ----
const clay = toon(0xc0693a), clayD = toon(0x9a4f2a), cream = toon(0xf2ead8), olive = toon(0x5c6b2a), lemonM = toon(0xf2cf3a), bread = toon(0xc98a45), brassM = toon(0xd2a64a);
function lathe(pts, mat, x, y, z, s = 1, ol = 0.004) { const m = new THREE.Mesh(new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), 32), mat); m.position.set(x, y, z); m.scale.setScalar(s); m.castShadow = m.receiveShadow = true; if (ol) outline(m, ol); ag.add(m); return m; }
const TOP = 0.99;
// olive bowl
lathe([[0, 0], [0.09, 0.005], [0.12, 0.05], [0.115, 0.055], [0.085, 0.012], [0, 0.012]], toon(0x3b6fa8, { side: THREE.DoubleSide }), -0.78, TOP, 0.22);
for (let i = 0; i < 14; i++) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), olive); o.scale.set(1, 0.8, 0.8); o.position.set(-0.78 + R(-0.07, 0.07), TOP + 0.035 + R(0, 0.015), 0.22 + R(-0.06, 0.06)); ag.add(o); }
// bread loaf + lemons
{ const b = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), bread); b.scale.set(1.5, 0.6, 0.9); b.position.set(-1.12, TOP + 0.055, 0.05); b.castShadow = true; outline(b, 0.004); ag.add(b);
  for (let i = 0; i < 3; i++) { const sc = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.03, 0.14), toon(0x8a5528)); sc.position.set(-1.2 + i * 0.08, TOP + 0.11, 0.05); sc.rotation.z = 0.4; ag.add(sc); } }
for (const [x, z] of [[1.08, 0.25], [1.18, 0.2], [1.13, 0.32]]) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), lemonM); l.scale.set(1.25, 1, 1); l.position.set(x, TOP + 0.04, z); l.castShadow = true; outline(l, 0.003); ag.add(l); }
// stacked cups
for (let i = 0; i < 3; i++) lathe([[0, 0], [0.04, 0], [0.05, 0.07], [0.046, 0.07], [0.036, 0.006], [0, 0.006]], cream, 1.0 - i * 0.0, TOP + i * 0.05, -0.15, 1, 0.003);
// folded cloth
box(0.28, 0.025, 0.18, toon(0xd9534f), 0.95, TOP + 0.012, 0.32, ag, 0.003).rotation.y = 0.3;
// small amphora on counter end + plant pot
lathe([[0, 0], [0.05, 0], [0.11, 0.12], [0.1, 0.25], [0.045, 0.32], [0.04, 0.38], [0.055, 0.4], [0, 0.4]], clay, -1.38, TOP, -0.2);
lathe([[0, 0], [0.09, 0], [0.12, 0.16], [0, 0.16]], clayD, 1.35, TOP, -0.25);
for (let i = 0; i < 9; i++) { const lf = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), toon(0x3f8a3a)); lf.scale.set(0.5, 1.6, 0.25); const a = i / 9 * Math.PI * 2; lf.position.set(1.35 + Math.cos(a) * 0.06, TOP + 0.25, -0.25 + Math.sin(a) * 0.06); lf.rotation.set(Math.sin(a) * 0.5, a, Math.cos(a) * 0.5); ag.add(lf); }
// oil lamp (warm practical light, carries the dusk act)
lathe([[0, 0], [0.06, 0.0], [0.07, 0.03], [0.04, 0.06], [0.015, 0.07], [0, 0.07]], brassM, -0.55, TOP, -0.25);
export const flame = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffd27a })); flame.scale.set(0.8, 1.6, 0.8); flame.position.set(-0.55, TOP + 0.1, -0.25); ag.add(flame);
export const lampLight = new THREE.PointLight(0xffa24a, 0, 4, 1.8); lampLight.position.set(-0.55, TOP + 0.2, -0.15); ag.add(lampLight);
// hanging herbs near the camera (foreground layer in wide shots)
for (let i = 0; i < 5; i++) { const h = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.35, 8), toon(i % 2 ? 0x7d8a3a : 0x9a7a3a)); h.position.set(-0.95 + i * 0.13, 2.55 - (i % 2) * 0.06, 1.05); h.rotation.z = Math.PI; h.castShadow = true; outline(h, 0.004); ag.add(h); }
box(0.9, 0.025, 0.025, toon(0x6b4423), -0.7, 2.75, 1.05, ag);
// window light beam (additive) — painted window sits at about x −1.9, y 2–4.4 on the back wall
const beamTex = ctex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,240,200,0.0)'); gr.addColorStop(0.15, 'rgba(255,240,200,1)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const gx = g.createLinearGradient(0, 0, w, 0); gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(0.5, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = gx; g.fillRect(0, 0, w, h); });
export const beam = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 4.2), new THREE.MeshBasicMaterial({ map: beamTex, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
beam.position.set(-1.15, 2.2, -1.6); beam.rotation.set(-0.55, 0.15, 0.62); ag.add(beam);
// splash droplets (deterministic in t)
const dropMat = new THREE.MeshBasicMaterial({ color: 0xdff4ff });
export const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.0065, 6, 5), dropMat, 24); drops.frustumCulled = false; ag.add(drops);
const _m4 = new THREE.Matrix4(), DSEED = [...Array(24)].map((_, i) => [Math.sin(i * 12.9898) * 43758.5453 % 1, Math.sin(i * 78.233) * 12345.678 % 1, Math.sin(i * 39.425) * 9876.54 % 1].map(v => Math.abs(v)));
export function setDrops(on, cx, cy, cz, t, k = 1) { drops.visible = !!on; if (!on) return;
  for (let i = 0; i < 24; i++) { const [a, b, c] = DSEED[i], per = 0.42 + b * 0.25, ph = ((t + a * per) % per) / per, ang = c * Math.PI * 2, sp = (0.25 + b * 0.35) * k, up = 0.55 + a * 0.5, tt = ph * per;
    const y = cy + up * tt - 4.9 * tt * tt; if (y < cy) _m4.makeScale(0, 0, 0); else _m4.makeTranslation(cx + Math.cos(ang) * sp * tt, y, cz + Math.sin(ang) * sp * tt); drops.setMatrixAt(i, _m4); }
  drops.instanceMatrix.needsUpdate = true; }
export const aKey = new THREE.DirectionalLight(0xfff0d8, 1.25); aKey.position.set(-3.5, 5, 4); aKey.castShadow = true; aKey.shadow.mapSize.set(2048, 2048); { const c = aKey.shadow.camera; c.left = -4; c.right = 4; c.top = 4; c.bottom = -4; c.far = 20; } aKey.shadow.bias = -0.0005; ag.add(aKey); aKey.target.position.set(0.3, 1, 0); ag.add(aKey.target);

// =================== B: X-RAY CUTAWAY (x = 300) ===================
setSeed(1502);
export const B = { g: new THREE.Group() }; B.g.position.set(300, 0, 0); scene.add(B.g); B.g.visible = false;
const bg = B.g;
const grid = ctex(1024, 1024, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w * 0.7); gr.addColorStop(0, '#24406e'); gr.addColorStop(1, '#14223f'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(160,200,255,0.16)'; g.lineWidth = 2; for (let i = 0; i <= w; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } g.strokeStyle = 'rgba(160,200,255,0.07)'; g.lineWidth = 1; for (let i = 0; i <= w; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } });
const gridM = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ map: grid })); gridM.position.set(0, 1.0, -2.2); bg.add(gridM);
export const S = 5, BASE = 0.32; // cutaway scale, cup base height
const big = new THREE.Group(); big.scale.setScalar(S); big.position.y = BASE; bg.add(big);
export const cupB = makeCup(big, { xray: true });
{ const brassB = toon(0xc9a44a); const r0 = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.02, 8, 40), brassB); r0.rotation.x = Math.PI / 2; r0.position.y = BASE - 0.01; bg.add(r0);
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + 0.5; box(0.035, BASE, 0.035, brassB, Math.cos(a) * 0.3, BASE / 2, Math.sin(a) * 0.3, bg, 0.006); } }
export const trayB = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.4, 0.06, 40), toon(0x8a93a3)); trayB.position.set(0, 0.03, 0); outline(trayB, 0.006); bg.add(trayB);
// siphon path (cup-local units)
const PATH = new THREE.CatmullRomCurve3([[0.011, CUP.stemTop + 0.004], [0.011, 0.17], [0.011, 0.215], [0.006, 0.229], [0, CUP.high], [-0.006, 0.229], [-0.011, 0.215], [-0.011, 0.17], [-0.011, CUP.stemTop], [-0.004, 0.08], [0, 0.04], [0, -0.003]].map(p => new THREE.Vector3(p[0], p[1], 0.0)), false, 'catmullrom', 0.2);
export const TSEG = 240;
// X-ray look: the siphon pipe draws on top of glass and bowl water
const pipe = new THREE.Mesh(new THREE.TubeGeometry(PATH, TSEG, 0.0058, 12, false), new THREE.MeshPhongMaterial({ color: 0xe9eef5, emissive: 0x3a4555, transparent: true, opacity: 0.75, depthWrite: false, depthTest: false })); pipe.renderOrder = 20; big.add(pipe);
export const pipeWater = new THREE.Mesh(new THREE.TubeGeometry(PATH, TSEG, 0.0046, 12, false), new THREE.MeshPhongMaterial({ color: 0x4fd2ff, emissive: 0x1f86b8, shininess: 60, depthTest: false, transparent: true, opacity: 1 })); pipeWater.renderOrder = 21; big.add(pipeWater);
export const pipeGlow = new THREE.Mesh(new THREE.TubeGeometry(PATH, TSEG, 0.009, 12, false), new THREE.MeshBasicMaterial({ color: 0xffe27a, transparent: true, opacity: 0.0, depthWrite: false, depthTest: false })); pipeGlow.renderOrder = 19; big.add(pipeGlow);
export function setPipe(s0, s1) { const per = 12 * 6; const a = Math.floor(clamp(s0) * TSEG), b = Math.floor(clamp(s1) * TSEG); pipeWater.geometry.setDrawRange(a * per, Math.max(0, b - a) * per); pipeWater.visible = b > a; }
export const pathPt = s => PATH.getPointAt(clamp(s)).clone().multiplyScalar(S).add(new THREE.Vector3(0, BASE, 0));
export const drainB = stream(bg, 0.03);
export const bubbles = [0, 1, 2, 3, 4].map(i => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false })); m.renderOrder = 22; bg.add(m); m.visible = false; return m; });
function label(text, w = 0.62, col = '#f2c94c') { const size = Math.min(84, Math.floor(84 * 440 / (text.length * 56))); const t = signTex(512, 150, col, [{ t: text, size, y: 80, col: INK, font: '"DejaVu Sans", sans-serif' }], 10); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 150 / 512), new THREE.MeshBasicMaterial({ map: t, transparent: true })); bg.add(m); m.visible = false; return m; }
function pointer() { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1, 8), new THREE.MeshBasicMaterial({ color: 0xf2c94c })); bg.add(m); m.visible = false; return m; }
export const LB = { siphon: label('SIPHON'), high: label('HIGH POINT', 0.78), outlet: label('OUTLET'), air: label('AIR IN', 0.5, '#ffffff') };
export const PT = { siphon: pointer(), high: pointer(), outlet: pointer(), air: pointer() };
export function setPointer(m, a, b, on) { m.visible = on; if (!on) return; const d = new THREE.Vector3().subVectors(b, a); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(UP, d.clone().normalize()); m.scale.set(1, d.length(), 1); }
// full episode: tracer that rides the siphon path, ring marking the high-point level, pour stream filling the big cup
export const tracer = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff1a0, depthTest: false })); tracer.renderOrder = 25; bg.add(tracer); tracer.visible = false;
export const tracerHalo = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffd24a, transparent: true, opacity: 0.35, depthTest: false, blending: THREE.AdditiveBlending })); tracerHalo.renderOrder = 24; tracer.add(tracerHalo);
export const highRing = new THREE.Mesh(new THREE.TorusGeometry(bowlR(CUP.high - CUP.stemTop) * S + 0.01, 0.009, 8, 80), new THREE.MeshBasicMaterial({ color: 0xffd24a, depthTest: false, transparent: true })); highRing.rotation.x = Math.PI / 2; highRing.position.y = BASE + CUP.high * S; highRing.renderOrder = 23; bg.add(highRing); highRing.visible = false;
export const pourB = stream(bg, 0.028);
export const jugB = new THREE.Group(); jugB.scale.setScalar(S * 0.55); jugB.visible = false; bg.add(jugB); // ghost jug that fills the big cup (scaled down vs the 5× cup so it fits the frame)
export function setJugB(k) { jugB.traverse(o => { if (o.isMesh) o.material.opacity = 0.62 * k; }); }
export const bLight = new THREE.DirectionalLight(0xffffff, 1.4); bLight.position.set(-2, 4, 5); bg.add(bLight); bLight.target.position.set(0, 1, 0); bg.add(bLight.target);
