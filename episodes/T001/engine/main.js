import { THREE, scene, camera, renderer, WIDTH, HEIGHT, hemi, sun, sky, setCam, step, ss, clamp, lerp, blink, pop, renderPost, POST, TEXLOAD } from './core.js';
import { P, M, B, TOP, SC, crate1, crate2, crate3, setLoad, setScale, limitGlow, setCount, fbG, setStack, notice, setNotice, pKey, pLight, pc,
  ORIGIN, VERNAL, rings, pinO, pinV, ML, mCrate, setRoute, routePt, setDashes, mKey, MAPW,
  setFacade, setStampDecal, STAMPED, STAMPED_I, NBR, townSign, bCrates, bSun, bc } from './vernal.js';

// RC01-T001 "He Mailed the Bricks for a Bank" (45.6 s): voice starts 0.10 s; all times below are video time (word marks from voice/align.json + 0.10)
export const DURATION = 45.6;

const SETS = [P.g, M.g, B.g];
function show(g) { SETS.forEach(s => s.visible = s === g); }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const K = (ox, keys) => keys.map(k => [k[0], k[1] + ox, k[2], k[3], k[4] + ox, k[5], k[6], k[7], k[8] || 0]);
const _c1 = new THREE.Color(), _c2 = new THREE.Color();
const mixC = (a, b, k) => _c1.set(a).lerp(_c2.set(b), k).getHex();

// ---------------------------------------------------------------- lighting acts (each act has its own light colour, and it lands on the characters)
const ACTS = {
  morning: { key: 0xffe2b8, ki: 1.5, hemi: 0xfff0dc, hg: 0x6a5040, hi: 0.66, pl: 5, rim: ['#ffd59a', 0.6] },
  busy:    { key: 0xfff2dc, ki: 1.4, hemi: 0xf4f0ff, hg: 0x6a5a4a, hi: 0.72, pl: 4.5, rim: ['#ffffff', 0.45] },
  dusk:    { key: 0xff9f86, ki: 0.95, hemi: 0xa898d8, hg: 0x403050, hi: 0.55, pl: 7, rim: ['#ffb070', 0.9] } };
function lightP(a, b, k = 0) { const A = ACTS[a], Bb = ACTS[b || a];
  pKey.color.set(mixC(A.key, Bb.key, k)); pKey.intensity = lerp(A.ki, Bb.ki, k); hemi.color.set(mixC(A.hemi, Bb.hemi, k)); hemi.groundColor.set(mixC(A.hg, Bb.hg, k)); hemi.intensity = lerp(A.hi, Bb.hi, k);
  pLight.intensity = lerp(A.pl, Bb.pl, k); sky.visible = false; sun.intensity = 0; scene.background = new THREE.Color(0x2a2018); scene.fog.color.set(0x2a2018); scene.fog.near = 30; scene.fog.far = 80;
  const r = k < 0.5 ? A.rim : Bb.rim; return { col: r[0], side: -1, a: lerp(A.rim[1], Bb.rim[1], k) }; }
function lightM() { sky.visible = false; sun.intensity = 0; scene.background = new THREE.Color(0x2a1d14); scene.fog.color.set(0x2a1d14); scene.fog.near = 40; scene.fog.far = 90; hemi.color.set(0xfff4e6); hemi.groundColor.set(0x5a4a3a); hemi.intensity = 0.9; mKey.intensity = 1.3; }
function lightB(warm = 0) { sky.visible = false; sun.intensity = 0; scene.background = new THREE.Color(0xb9d4ec); scene.fog.color.set(0xd8e2ea); scene.fog.near = 30; scene.fog.far = 120;
  hemi.color.set(mixC(0xe6f0ff, 0xffe0c0, warm)); hemi.groundColor.set(0x9c8a62); hemi.intensity = 0.85; bSun.color.set(mixC(0xfff1d6, 0xffc08a, warm)); bSun.intensity = 2.0;
  return { col: warm > 0.5 ? '#ffb35a' : '#ffffff', side: -1, a: 0.6 }; }

// ---------------------------------------------------------------- characters
const DIR_P = [-0.3, -0.1], CLK_P = [1.0, -0.8];
function chars(set, t, d, c, rim) { const C = set === 'P' ? pc : bc;
  C.director.at(...(d.pos || [DIR_P[0], 0, DIR_P[1]])); C.director.face(camera);
  C.director.set({ expr: d.expr || 'neutral', look: d.look || [0.6, -0.3], blink: blink(t, 0.6), arms: d.arms || { l: [-0.28, 0.92], r: [0.28, 0.92] }, open: d.open || {}, fx: d.fx || {}, items: d.items || {}, bob: d.bob || 0, rim }, t);
  C.clerk.mesh.visible = !!c; if (!c) return;
  C.clerk.at(...(c.pos || [CLK_P[0], 0, CLK_P[1]])); C.clerk.face(camera);
  C.clerk.set({ expr: c.expr || 'neutral', look: c.look || [-0.6, -0.3], blink: blink(t, 1.7), arms: c.arms || { l: [-0.27, 0.9], r: [0.27, 0.9] }, open: c.open || {}, fx: c.fx || {}, items: c.items || {}, bob: c.bob || 0, rim }, t);
}
// ---------------------------------------------------------------- post office state
const ALL10 = Array(10).fill(1);
function po(t, s) { // s: {act, load[10], lb, label, count, stack, c2, lid2, c3, note[], noteIn, crate1y, glow}
  show(P.g); const rim = lightP(...s.act);
  crate1.position.set(SC.x, TOP + 0.066 + (s.crate1y || 0), SC.z); setLoad(s.load || ALL10); setScale(s.lb || 0); crate1.userData.lab.visible = !!s.label; crate1.userData.lab.scale.setScalar(Math.max(0.01, s.label || 0));
  limitGlow.material.opacity = s.glow || 0; setCount(s.count || 0); fbG.visible = !s.noBoard; setStack(s.stack || 0);
  crate2.visible = s.c2 !== undefined; if (crate2.visible) { crate2.position.set(s.c2, TOP + 0.002, 0.25); crate2.userData.lid.rotation.x = -(s.lid2 || 0) * 2.5; } // lid falls back past upright, out of the clerk's face
  crate3.visible = s.c3 !== undefined; if (crate3.visible) { crate3.position.set(1.3, TOP + 0.002 + s.c3, 0.2); crate3.rotation.y = -0.15; }
  notice.visible = s.noteIn !== undefined; if (notice.visible) { notice.position.set(lerp(-1.6, 0.0, s.noteIn), TOP, 0.16); setNotice(s.note || [0, 0, 0, 0, 0]); }
  return rim;
}

// ---------------------------------------------------------------- S1 hook 0–2.85 (P): "He sent bank bricks through the mail because freight cost too much."
const CAM_HOOK = [[0.0, 0.85, 1.62, 1.68, 0.35, 1.42, 0.0, 42], [1.0, 0.75, 1.58, 1.42, 0.34, 1.42, 0.0, 41], [1.55, 0.5, 1.56, 1.6, 0.12, 1.42, -0.04, 42],
  [2.4, -0.3, 1.5, 1.85, -0.5, 1.35, -0.1, 44], [3.0, -0.33, 1.5, 1.65, -0.5, 1.37, -0.1, 43]];
function segHook(t) { setCam(CAM_HOOK, t);
  const land = ss(0.05, 0.45, t), bounce = t > 0.45 ? Math.sin((t - 0.45) * 26) * Math.exp(-(t - 0.45) * 6) : 0;
  const lb = 50 * ss(0.45, 0.62, t) + 6 * bounce;
  const rim = po(t, { act: ['morning'], crate1y: 0.32 * (1 - land), lb, label: pop(1.12, t), count: 0 });
  const paper = t > 1.45 ? { paper: { hand: 'l', title: 'FREIGHT', sub: '$$$', w: 0.44, h: 0.5, ang: -8, stamp: ss(2.22, 2.4, t), stampText: 'TOO MUCH' } } : {};
  chars('P', t, { expr: step([[0, 'grin'], [0.65, 'smug'], [2.26, 'stare']], t), look: t < 1.45 ? [0.9, -0.6] : [0.2, 0],
    arms: t < 0.6 ? { l: [-0.1, lerp(1.45, 1.22, land)], r: [0.42, lerp(1.45, 1.22, land)] } : (t < 1.45 ? { l: [-0.28, 0.92], r: [0.3, 1.0] } : { l: [-0.42, lerp(0.8, 0.98, ss(1.45, 1.7, t))], r: [0.27, 0.92] }),
    items: paper }, { expr: step([[0, 'neutral'], [0.72, 'shock']], t), look: [-0.9, -0.6], fx: { sweat: t > 0.9 ? 1 : 0 } }, rim);
}
// ---------------------------------------------------------------- S2 town 2.85–10.8 (B): 1916 · Vernal, Utah · bank front needs special bricks · freight expensive · parcels cheaper
const CAM_TOWN = K(600, [[2.7, 0.8, 1.1, 7.6, 0.0, 1.9, -1.0, 48], [3.7, -0.95, 1.3, 4.6, -1.5, 1.5, 0.5, 48], [4.7, -1.1, 1.4, 4.1, -1.5, 1.5, 0.6, 50],
  [5.6, -0.3, 1.9, 5.6, -0.4, 2.0, -0.2, 46], [6.5, 0.15, 2.1, 7.2, 0.0, 2.2, -1.0, 46], [7.0, 0.1, 2.1, 6.9, 0.0, 2.15, -1.0, 46],
  [7.85, -0.32, 1.38, 3.1, -0.52, 1.3, 0.8, 43], [9.2, -0.32, 1.5, 3.0, -0.52, 1.43, 0.8, 44], [10.1, -0.3, 1.5, 2.8, -0.52, 1.43, 0.8, 44], [11.0, -0.28, 1.5, 2.6, -0.5, 1.43, 0.8, 44]]); // 8–11 s: paper title above the caption band, idea bulb still in frame; keeps pushing in
function segTown(t) { setCam(CAM_TOWN, t); show(B.g); const rim = lightB(0);
  setFacade(0, (0.55 + 0.45 * Math.sin(t * 9)) * ss(5.55, 5.75, t) * (1 - ss(7.0, 7.3, t))); setStampDecal(false);
  bCrates.forEach(c => c.visible = false); townSign.scale.setScalar(Math.max(0.01, pop(2.95, t, 0.22)));
  const paper = t > 7.3 && t < 9.45 ? { paper: { hand: 'r', title: 'FREIGHT', sub: '$$$', w: 0.56, h: 0.52, ang: 6, ox: -0.04 } }
    : (t >= 9.45 ? { paper: { hand: 'r', title: 'PARCEL POST', sub: '$', w: 0.62, h: 0.52, ang: 6, ox: -0.04, stamp: ss(10.3, 10.5, t), stampText: 'CHEAP' } } : {});
  const point = t > 5.5 && t < 7.2;
  chars('B', t, { pos: [-0.75, 0, 0.8], expr: step([[0, 'neutral'], [3.95, 'smug'], [5.55, 'greedy'], [7.3, 'worried'], [8.45, 'shock'], [9.25, 'squint'], [9.75, 'grin']], t),
    look: point ? [0.5, 0.9] : (t < 3.95 ? [-0.8, 0.1] : [0.3, -0.2]),
    arms: point ? { l: [-0.28, 0.92], r: [0.5, 1.75] } : (t > 7.3 ? { l: [-0.28, 0.92], r: [0.42, 0.78] } : { l: [-0.15, 1.02], r: [0.15, 1.02] }), open: { r: point }, // paper top stays under the head
    fx: { sweat: t > 8.45 && t < 9.3 ? 2 : 0, bulb: ss(9.25, 9.45, t) * (1 - ss(10.0, 10.2, t)), sparkle: t > 5.55 && t < 7.0 ? 1 : (t > 10.36 ? 1 : 0) }, items: paper }, null, rim);
}
// ---------------------------------------------------------------- S3 map 10.8–17.55 (M): delivery zones vs the actual route over difficult terrain
const CAM_MAP = K(300, [[10.6, 0.1, 5.3, 2.3, 0.15, 0, -0.4, 42], [12.3, 0.2, 4.6, 1.7, 0.2, 0, -0.7, 42], [13.6, 0.9, 3.3, 1.7, 0.65, 0, -0.3, 42],
  [14.7, 0.7, 3.4, 1.3, 0.55, 0, -0.5, 42], [15.8, 0.05, 4.75, 2.1, 0.12, 0, -0.4, 43], [16.9, 0.25, 4.45, 1.95, 0.28, 0, -0.55, 44], [17.8, 0.27, 4.25, 1.82, 0.28, 0, -0.55, 44]]);
const _q = new THREE.Quaternion();
function mlab(m, p, t0, t1, t, w = 1.45) { const k = pop(t0, t, 0.16) * (1 - ss(t1 - 0.15, t1, t)); m.visible = k > 0.01; if (!m.visible) return; m.position.copy(p); m.quaternion.copy(camera.quaternion); m.parent.getWorldQuaternion(_q); m.quaternion.premultiply(_q.invert()); m.scale.setScalar(Math.max(0.01, k) * w); }
function segMap(t) { setCam(CAM_MAP, t); show(M.g); lightM();
  pinO.visible = t > 10.85; pinO.scale.setScalar(Math.max(0.01, pop(10.85, t))); pinV.visible = t > 11.05; pinV.scale.setScalar(Math.max(0.01, pop(11.05, t)));
  rings.forEach((r, i) => { const t0 = 11.9 + i * 0.22; const k = ss(t0, t0 + 0.35, t); r.visible = k > 0.01; r.scale.setScalar(Math.max(0.01, k)); r.material.opacity = 0.9 * (1 - 0.6 * ss(14.6, 15.2, t)); r.userData.fill.material.opacity = 0.16 * k * (1 - ss(14.6, 15.2, t)); });
  const rk = t < 16.45 ? 0.5 * ss(12.9, 14.6, t) : lerp(0.5, 1, ss(16.45, 17.3, t)); setRoute(rk);
  mCrate.visible = t > 12.85; if (mCrate.visible) { const p = routePt(rk), q = routePt(Math.min(1, rk + 0.01)); mCrate.position.set(p.x, 0.02, p.z); mCrate.rotation.y = Math.atan2(q.x - p.x, q.z - p.z); mCrate.position.y += Math.abs(Math.sin(t * 18)) * 0.012; }
  setDashes(ss(14.8, 15.6, t));
  mlab(ML.bricks, V(ORIGIN.x + 0.18, 0.42, ORIGIN.z - 0.42), 10.9, 12.8, t); // above the caption band mlab(ML.vernal, V(VERNAL.x, 0.44, VERNAL.z), 11.1, 17.6, t);
  mlab(ML.zones, V(VERNAL.x + 0.4, 0.3, VERNAL.z + 0.75), 11.95, 14.5, t); mlab(ML.map, V((ORIGIN.x + VERNAL.x) / 2 - 0.3, 0.3, (ORIGIN.z + VERNAL.z) / 2), 15.25, 17.6, t);
  const rp = routePt(0.36); mlab(ML.route, V(rp.x - 0.38, 0.35, rp.z + 0.1), 16.55, 17.6, t);
}
// ---------------------------------------------------------------- S4+S5 post office 17.55–31.2 (P): ten bricks per crate · 50 lb limit · 15,000 bricks · the clerk's surprise
const CAM_PO2 = [[17.4, 0.14, 2.95, 1.2, 0.13, TOP, 0.03, 44], [19.3, 0.14, 2.75, 1.05, 0.14, TOP, 0.03, 43], [20.5, 0.16, 2.65, 0.98, 0.18, TOP + 0.05, 0.03, 42],
  [21.45, 0.48, 1.8, 1.05, 0.35, 1.62, -0.06, 39], [22.35, 0.45, 1.8, 0.95, 0.35, 1.68, -0.09, 38],
  [23.3, -0.9, 1.55, 1.85, -1.02, 1.3, -0.2, 44], [25.15, -0.95, 1.52, 1.62, -1.02, 1.3, -0.2, 44],
  [26.0, 0.55, 1.85, 3.3, 1.05, 1.2, -0.3, 52], [26.5, 0.68, 1.78, 3.0, 1.08, 1.2, -0.3, 51],
  [27.3, 0.85, 1.6, 1.75, 0.88, 1.42, -0.35, 45], [28.6, 0.82, 1.95, 1.4, 0.82, 1.3, 0.0, 42], [29.8, 0.84, 1.9, 1.5, 0.84, 1.33, -0.1, 43],
  [30.6, 0.95, 1.85, 1.68, 0.95, 1.33, -0.1, 45], [31.4, 1.0, 1.85, 1.52, 1.0, 1.33, -0.1, 45]];
function segPO2(t) { setCam(CAM_PO2, t);
  const load = [...Array(10).keys()].map(i => ss(19.36 + i * 0.105, 19.36 + i * 0.105 + 0.28, t)); const nIn = load.filter(k => k >= 1).length;
  const lb = 5 * load.reduce((a, b) => a + b, 0) + (t > 21.5 ? 1.2 * Math.sin((t - 21.5) * 20) * Math.exp(-(t - 21.5) * 5) : 0);
  const count = t < 24.29 ? nIn : lerp(10, 15000, ss(24.29, 25.05, t));
  const rim = po(t, { act: ['busy'], load, lb, label: pop(20.6, t), glow: 0.85 * ss(22.1, 22.25, t) * (0.7 + 0.3 * Math.sin(t * 14)), count, stack: 24 * ss(24.4, 26.0, t),
    c2: t > 27.3 ? lerp(1.55, 0.68, ss(27.3, 27.85, t)) : undefined, lid2: ss(28.3, 28.65, t), c3: t > 30.3 ? Math.max(0, 0.6 * (1 - ss(30.32, 30.5, t) ** 2)) : undefined });
  const expecting = t > 26.9 && t < 28.2, lifting = t > 28.2 && t < 29.4;
  chars('P', t, { expr: step([[0, 'smug'], [19.4, 'grin'], [24.3, 'greedy'], [26.0, 'smug']], t), look: [0.8, -0.5], fx: { sparkle: t > 24.3 && t < 25.6 ? 1 : 0 },
      arms: { l: [-0.12, 1.02], r: [0.12, 1.0] } },
    { expr: step([[0, 'neutral'], [19.4, 'squint'], [22.1, 'worried'], [24.3, 'shock'], [26.2, 'grin'], [28.2, 'neutral'], [29.49, 'shock'], [30.36, 'ashamed']], t),
      look: t < 26.2 ? [-0.7, -0.5] : (t < 28.2 ? [0, 0] : [0, -1]),
      arms: expecting ? { l: [-0.34, 1.2], r: [0.34, 1.2] } : (lifting ? { l: [-0.27, 0.9], r: [0.1, lerp(1.0, 1.32, ss(28.3, 28.65, t))] } : (t > 29.49 && t < 30.36 ? { l: [-0.45, 1.5], r: [0.45, 1.5] } : { l: [-0.27, 0.9], r: [0.27, 0.9] })),
      open: { l: expecting || (t > 29.49 && t < 30.36), r: expecting || (t > 29.49 && t < 30.36) },
      fx: { sweat: t > 29.49 ? 2 : (t > 24.3 && t < 26.0 ? 1 : 0), shame: ss(30.4, 30.6, t), sparkle: expecting ? 1 : 0 } }, rim);
}
// ---------------------------------------------------------------- S5b facade 31.2–33.65 (B): "Eventually, those deliveries became the bank's facade."
const CAM_FAC = K(600, [[31.0, 0.35, 0.65, 1.7, 0.0, 0.55, -1.0, 46], [32.2, 0.2, 1.6, 3.1, 0.0, 1.6, -1.0, 48], [33.2, 0.1, 2.0, 6.1, 0.0, 2.1, -1.0, 46], [33.85, 0.08, 2.0, 5.8, 0.0, 2.1, -1.0, 45]]);
function segFacade(t) { setCam(CAM_FAC, t); show(B.g); const rim = lightB(0.3);
  const k = ss(31.15, 33.1, t); setFacade(k, 0); setStampDecal(Math.round(k * NBR) > STAMPED_I); townSign.scale.setScalar(1);
  bCrates.forEach((c, i) => c.visible = k < 1 - i / 7);
  chars('B', t, { pos: [-0.75, 0, 0.8], expr: step([[0, 'grin'], [32.4, 'laugh']], t), look: [0.4, 0.6], arms: { l: [-0.15, 1.02], r: [0.15, 1.02] }, bob: t > 32.4 ? Math.abs(Math.sin(t * 15)) * 0.015 : 0, fx: { sparkle: t > 33.0 ? 1 : 0 } }, null, rim);
}
// ---------------------------------------------------------------- S6 notice 33.65–42.2 (P, dusk): Nov 1916 rule — heavy daily shipments, one sender → one recipient, await instructions
const CAM_NOTE = [[33.5, 0.25, 1.75, 3.0, 0.35, 1.2, -0.2, 48], [34.6, 0.06, 1.56, 1.95, 0.0, 1.3, 0.1, 44], [36.0, 0.05, 1.46, 1.38, 0.0, 1.36, 0.16, 40],
  [38.4, 0.03, 1.43, 1.32, 0.0, 1.36, 0.16, 40], [39.7, 0.02, 1.42, 1.24, 0.0, 1.36, 0.16, 40], [40.85, 0.2, 1.75, 3.0, 0.25, 1.25, -0.3, 52], [41.4, 0.22, 1.7, 2.75, 0.27, 1.25, -0.3, 50],
  [42.25, 0.36, 1.21, 0.56, 0.35, 1.21, 0.19, 36]];
function segNotice(t) { setCam(CAM_NOTE, t);
  const note = [ss(34.42, 34.7, t), ss(35.55, 35.85, t), ss(37.1, 37.4, t), ss(37.75, 38.05, t), clamp((t - 38.66) / 0.25)];
  const rim = po(t, { act: ['busy', 'dusk', ss(33.6, 35.5, t)], lb: 50, label: 1, count: 15000, stack: 24, c2: 0.68, lid2: 1, c3: 0, noteIn: ss(33.85, 34.3, t), note, noBoard: true });
  chars('P', t, { pos: [-0.62, 0, -0.1], expr: step([[0, 'neutral'], [35.6, 'worried'], [37.7, 'shock'], [40.45, 'ashamed']], t), look: t < 40.45 ? [0.8, -0.3] : [0.2, -0.8],
      fx: { blush: ss(41.45, 41.7, t), sweat: t > 37.7 && t < 40.45 ? 1 : 0 } },
    { expr: step([[0, 'smug'], [38.6, 'stare'], [40.45, 'smug']], t), look: t < 40.45 ? [-0.8, -0.4] : [-1, -0.2],
      arms: t > 35.5 && t < 38.5 ? { l: [-0.5, 1.28], r: [0.27, 0.9] } : (t > 40.45 ? { l: [-0.55, 1.35], r: [0.27, 0.9] } : { l: [-0.27, 0.9], r: [0.27, 0.9] }), open: { l: t > 35.5 && t < 38.5 },
      items: t > 38.5 && t < 40.4 ? { stamp: { hand: 'r' } } : {} }, rim);
}
// ---------------------------------------------------------------- S7 payoff 42.2–45.6 (B): "Special delivery. Very special." — the stamped brick in the facade, then the whole bank
const S_ = STAMPED;
const CAM_PAY = K(600, [[42.0, S_.x + 0.02, S_.y + 0.01, S_.z + 0.4, S_.x, S_.y, S_.z, 36], [42.85, S_.x + 0.03, S_.y + 0.02, S_.z + 0.5, S_.x, S_.y, S_.z, 36],
  [43.9, -0.25, 1.5, 2.3, -0.35, 1.45, -0.9, 44], [44.8, 0.1, 1.95, 5.2, 0.0, 1.95, -0.9, 46], [45.8, 0.1, 1.92, 4.9, 0.0, 1.92, -0.9, 46]]);
function segPayoff(t) { setCam(CAM_PAY, t); show(B.g); const rim = lightB(0.85);
  setFacade(1, 0); setStampDecal(true); townSign.scale.setScalar(1); bCrates.forEach(c => c.visible = false);
  const wink = t > 43.45;
  chars('B', t, { pos: [0.45, 0, 0.75], expr: wink ? 'wink' : 'smug', look: wink ? [0, 0] : [-0.6, 0.3], arms: wink ? { l: [-0.15, 1.02], r: [0.36, lerp(1.0, 1.42, ss(43.45, 43.75, t))] } : { l: [-0.15, 1.02], r: [0.15, 1.02] }, open: { r: wink }, fx: { sparkle: ss(43.55, 43.85, t) } },
    { pos: [1.3, 0, 0.45], expr: t > 43.45 ? 'ashamed' : 'stare', look: [-0.8, 0.2], fx: { sweat: t > 43.45 ? 1 : 0 } }, rim);
}

// ---------------------------------------------------------------- edit
const SEGS = [{ t0: 0, t1: 2.85, f: segHook }, { t0: 2.85, t1: 10.8, f: segTown }, { t0: 10.8, t1: 17.55, f: segMap }, { t0: 17.55, t1: 31.2, f: segPO2 },
  { t0: 31.2, t1: 33.65, f: segFacade }, { t0: 33.65, t1: 42.2, f: segNotice }, { t0: 42.2, t1: DURATION, f: segPayoff }];
const TRANS = { 2.85: 'dissolve', 10.8: 'dissolve', 17.55: 'dissolve', 31.2: 'dissolve', 33.65: 'dissolve', 42.2: 'dissolve' };
export const EDIT = { SEGS, TRANS };
const segAt = t => { for (let i = 0; i < SEGS.length; i++) if (t < SEGS[i].t1) return i; return SEGS.length - 1; };
const HALF = 3.5 / 30;
const acc = document.createElement('canvas'); acc.width = WIDTH; acc.height = HEIGHT; const actx = acc.getContext('2d'); actx.imageSmoothingQuality = 'high';
const tmp = document.createElement('canvas'); tmp.width = WIDTH; tmp.height = HEIGHT; const tctx = tmp.getContext('2d'); tctx.imageSmoothingQuality = 'high';
function renderSeg(i, t) { POST.focus = null; SEGS[i].f(t); renderPost(); }
function camState() { return [camera.position.clone(), new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion), camera.fov]; }
function blurPx(i, t) { const dt = 0.5 / 30; SEGS[i].f(t); const [p0, d0] = camState(); SEGS[i].f(t + dt); const [p1, d1] = camState(); const ang = d0.angleTo(d1); const lin = p0.distanceTo(p1) / 1.5; return (ang + lin) / (camera.fov * Math.PI / 180) * HEIGHT; }
function drawSeg(ctx, i, t, maxSub) { const bp = blurPx(i, t); const n = bp < 4 ? 1 : Math.max(2, Math.min(maxSub, Math.ceil(bp / 3))); ctx.clearRect(0, 0, WIDTH, HEIGHT); const mid = Math.floor((n - 1) / 2);
  const order = [mid, ...[...Array(n).keys()].filter(k => k !== mid)];
  order.forEach((k, j) => { const ts = t + (n > 1 ? (k / (n - 1) - 0.5) * 0.5 / 30 : 0);
    if (k === mid) { POST.lib = true; POST.on = true; POST.ao = true; renderSeg(i, ts); ctx.globalAlpha = 1 / (j + 1); ctx.drawImage(renderer.domElement, 0, 0, WIDTH, HEIGHT); return; }
    renderer.setSize(WIDTH / 2, HEIGHT / 2, false); POST.lib = false; POST.on = false; renderSeg(i, ts);
    sctx.globalCompositeOperation = 'source-over'; sctx.filter = GRADE_CSS; sctx.drawImage(renderer.domElement, 0, 0, WIDTH, HEIGHT); sctx.filter = 'none';
    sctx.globalCompositeOperation = 'multiply'; sctx.drawImage(VIG, 0, 0); sctx.globalCompositeOperation = 'source-over';
    renderer.setSize(WIDTH, HEIGHT, false); ctx.globalAlpha = 1 / (j + 1); ctx.drawImage(subc, 0, 0); });
  POST.lib = true; POST.on = true; ctx.globalAlpha = 1; return n; }
const GRADE_CSS = 'saturate(1.08) contrast(1.08) brightness(1.0)'; // v5: matches the core.js grade (no desaturation)
const subc = document.createElement('canvas'); subc.width = WIDTH; subc.height = HEIGHT; const sctx = subc.getContext('2d'); sctx.imageSmoothingQuality = 'high';
const VIG = document.createElement('canvas'); VIG.width = WIDTH; VIG.height = HEIGHT; { const g = VIG.getContext('2d'); const gr = g.createRadialGradient(WIDTH / 2, HEIGHT / 2, HEIGHT * 0.4, WIDTH / 2, HEIGHT / 2, HEIGHT * 0.75); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#d4d4d4'); g.fillStyle = gr; g.fillRect(0, 0, WIDTH, HEIGHT); }
window.renderAt = (t, maxSub = 5) => {
  let i = segAt(t), sub = 1, done = false;
  for (const [bs, type] of Object.entries(TRANS)) { const b = +bs; const j = SEGS.findIndex(s => Math.abs(s.t0 - b) < 1e-6);
    if (type === 'dissolve' && t >= b - HALF && t < b + HALF) { const k = ss(b - HALF, b + HALF, t); drawSeg(actx, j - 1, t, maxSub); drawSeg(tctx, j, t, maxSub); actx.globalAlpha = k; actx.drawImage(tmp, 0, 0); actx.globalAlpha = 1; done = true; }
    if (done) break; }
  if (!done) sub = drawSeg(actx, i, t, maxSub);
  return { url: acc.toDataURL('image/jpeg', 0.97), sub, seg: i };
};
Promise.all(TEXLOAD).then(() => { window.READY = true; });
window.camAt = (t, sg) => { const i = segAt(t); if (sg !== undefined) window.__sg = sg; SEGS[i].f(t); const [p, d, f] = camState(); return [...p.toArray(), ...d.toArray(), f, i]; };
window.__blurPx = (t) => { const i = segAt(t); return blurPx(i, t); };
