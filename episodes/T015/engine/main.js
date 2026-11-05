import { THREE, scene, camera, renderer, WIDTH, HEIGHT, hemi, sun, sky, setCam, step, ss, clamp, lerp, lerpA, blink, pop, renderPost, POST, TEXLOAD } from './core.js';
import { A, B, ac, jug, SPOUT, cupA, setCupLevel, setStream, drainA, pourA, splash, setTray, TRAY, CUP, cupB, setPipe, pathPt, drainB, bubbles, LB, PT, setPointer, pipeGlow, S, BASE, back, beam, lampLight, flame, setDrops, aKey, aLight, tracer, highRing, pourB, jugB, setJugB } from './taverna.js';

// RC01-T015 full episode (46.4 s): voice starts 0.10 s; all times below are video time (word marks from voice/align.json + 0.10)
export const DURATION = 46.4;

// v5 lighting acts (samples: every act has its own colour of light, and it lands on the characters)
const ACTS = {
  hook:    { key: 0xffd2a0, ki: 1.5, hemi: 0xfff0dc, hg: 0x6a5040, hi: 0.6, wall: 0xc0b8b0, wk: 0.6, beam: 0.16, lamp: 0, rim: ['#ffd59a', 0.6] },
  earlier: { key: 0xf2f6ff, ki: 1.35, hemi: 0xeef4ff, hg: 0x7a6a5a, hi: 0.72, wall: 0xc8ccd8, wk: 0.62, beam: 0.1, lamp: 0, rim: ['#ffffff', 0.45] },
  golden:  { key: 0xffaa60, ki: 1.75, hemi: 0xffdcb0, hg: 0x6a4030, hi: 0.55, wall: 0xd8a888, wk: 0.56, beam: 0.26, lamp: 0, rim: ['#ffb35a', 0.85] },
  dusk:    { key: 0xff8f9a, ki: 0.75, hemi: 0x9a8cd0, hg: 0x403050, hi: 0.5, wall: 0x9a88c0, wk: 0.42, beam: 0.06, lamp: 2.4, rim: ['#ffb070', 0.9] } };
const _c1 = new THREE.Color(), _c2 = new THREE.Color();
const mixC = (a, b, k) => _c1.set(a).lerp(_c2.set(b), k).getHex();
function lightAct(a, b, k = 0) { const L = {}; for (const key in a) L[key] = typeof a[key] === 'number' && key !== 'key' && key !== 'hemi' && key !== 'hg' && key !== 'wall' ? lerp(a[key], b[key], k) : a[key];
  for (const key of ['key', 'hemi', 'hg', 'wall']) L[key] = mixC(a[key], b[key], k); L.rim = k < 0.5 ? a.rim : b.rim; L.rimA = lerp(a.rim[1], b.rim[1], k);
  aKey.color.set(L.key); aKey.intensity = L.ki; hemi.color.set(L.hemi); hemi.groundColor.set(L.hg); hemi.intensity = L.hi; back.material.color.set(L.wall); back.material.emissiveIntensity = L.wk;
  beam.material.opacity = L.beam; lampLight.intensity = L.lamp; flame.visible = L.lamp > 0.1; aLight.intensity = 6 * (L.ki / 1.5); return { col: L.rim[0], side: -1, a: L.rimA }; }

const SETS = [A.g, B.g];
function show(g) { SETS.forEach(s => s.visible = s === g); }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function interiorA() { sky.visible = false; scene.background = new THREE.Color(0x2a2018); scene.fog.color.set(0x2a2018); scene.fog.near = 30; scene.fog.far = 80; sun.intensity = 0; hemi.intensity = 0.62; hemi.color.set(0xfff0dc); hemi.groundColor.set(0x6a5040); }
function interiorB() { sky.visible = false; scene.background = new THREE.Color(0x14223f); scene.fog.near = 100; scene.fog.far = 400; sun.intensity = 0; hemi.intensity = 0.95; hemi.color.set(0xe6f0ff); hemi.groundColor.set(0x30405a); }
const K = (ox, keys) => keys.map(k => [k[0], k[1] + ox, k[2], k[3], k[4] + ox, k[5], k[6], k[7], k[8] || 0]);
// pull the camera back along its view line by factor f (keeps look point + fov)
const far = (keys, f) => keys.map(k => [k[0], k[4] + (k[1] - k[4]) * f, k[5] + (k[2] - k[5]) * f, k[6] + (k[3] - k[6]) * f, k[4], k[5], k[6], k[7], k[8] || 0]);

// ---------------------------------------------------------------- shared taverna state
const CH = ac.drinker; const CHX = -0.08, CHZ = -0.12; const OW = ac.owner;
const REST = [0.3, 1.25], POUR = [0.41, 1.7], DOWN = [0.22, 1.15]; // DOWN: jug set on the counter (bottom ≈ counter top), clear of the tray
const _hw = new THREE.Vector3(), _cam = new THREE.Vector3();
function taverna(t, s) { // s: {act, owner, tilt, hand, level, stem, drain, tray, expr, look, fx, armL, open}
  show(A.g); interiorA();
  const rim = lightAct(ACTS[s.act[0]], ACTS[s.act[1] || s.act[0]], s.act[2] || 0);
  CH.at(CHX, 0, CHZ); CH.face(camera); CH.mesh.updateMatrixWorld();
  const hand = s.hand || lerpA(REST, POUR, s.tilt || 0);
  CH.set({ expr: s.expr || 'neutral', look: s.look || [1, -0.5], blink: s.noBlink ? false : blink(t, 0.6), arms: { r: hand, l: s.armL || [-0.28, 0.92] }, open: s.open || {}, fx: s.fx || {}, rim }, t);
  // owner behind the counter: knows the trick, reacts to the customer
  const o = s.owner || {}; OW.at(-0.88, 0, -0.75); OW.face(camera); // left end of the counter: out of the cup close-ups, in the wides
  OW.set({ expr: o.expr || 'smug', look: o.look || [0.8, -0.3], blink: blink(t, 1.7), arms: o.arms || { l: [-0.12, 1.02], r: [0.12, 1.0] }, open: o.open || {}, fx: o.fx || {}, bob: o.bob || 0, rim }, t);
  CH.mesh.localToWorld(_hw.set(hand[0], hand[1], 0)); _cam.subVectors(camera.position, _hw).normalize();
  jug.position.copy(A.g.worldToLocal(_hw.clone().addScaledVector(_cam, 0.06))); jug.rotation.set(0, CH.mesh.rotation.y, -(s.tilt || 0) * 1.2);
  setCupLevel(cupA, s.level, s.stem); setTray(s.tray || 0);
  jug.updateMatrixWorld(); cupA.updateMatrixWorld();
  const surf = cupA.localToWorld(V(0, CUP.stemTop + Math.max(0.01, s.level) * (CUP.bowlTop - CUP.stemTop), 0));
  setStream(pourA, jug.localToWorld(SPOUT.clone()), surf, (s.tilt || 0) > 0.75, t);
  const traySurf = V(TRAY.x, TRAY.y + 0.012 + clamp(s.tray || 0) * 0.034, TRAY.z);
  setStream(drainA, cupA.localToWorld(V(0, 0.0, 0)), traySurf, !!s.drain, t);
  splash.visible = !!s.drain; if (s.drain) { const k = (t * 2.6) % 1; splash.position.y = 0.012 + clamp(s.tray || 0) * 0.034 + 0.002; splash.scale.setScalar(0.4 + k * 2.2); splash.material.opacity = 0.8 * (1 - k); }
  // droplets: at the tray under the stem while draining, else at the cup surface while pouring
  if (s.drain) setDrops(true, traySurf.x, traySurf.y, traySurf.z, t, 0.8);
  else if ((s.tilt || 0) > 0.75) { const p = A.g.worldToLocal(surf.clone()); setDrops(true, p.x, p.y, p.z, t, 0.5); }
  else setDrops(false);
}
// ---------------------------------------------------------------- A1 hook 0–3.0: "One extra pour, and this cup starts emptying itself."
const CAM_A1 = far([[0.0, 0.2, 1.55, 2.05, 0.12, 1.35, -0.05, 50], [1.2, 0.3, 1.48, 1.7, 0.22, 1.3, -0.02, 48], [2.2, 0.55, 1.3, 1.25, 0.45, 1.12, 0.05, 44], [3.25, 0.62, 1.22, 1.05, 0.52, 1.05, 0.07, 42]], 1.35);
function segA1(t) { setCam(CAM_A1, t);
  const tilt = 1 - ss(1.0, 1.45, t);
  taverna(t, { act: ['hook'], owner: { expr: t < 1.8 ? 'smug' : 'grin', look: [0.9, -0.4] }, tilt, level: lerp(0.86, 0.32, ss(0.55, 3.2, t)), stem: t > 0.45, drain: t > 0.55, tray: 0.08 + 0.4 * ss(0.6, 3.2, t),
    expr: step([[0, 'greedy'], [1.0, 'grin'], [1.95, 'shock']], t), look: [1, -0.6], fx: { sweat: t > 2.0 ? 2 : 0, sparkle: t < 0.9 ? 1 : 0 },
    armL: t > 1.95 ? [-0.45, 1.5] : [-0.28, 0.92], open: { l: t > 1.95 } });
}
// ---------------------------------------------------------------- A2 3.0–10.3: "At first, it behaves perfectly. A little water goes in, and stays there. Our thirsty customer decides that a little more would be even better."
const CAM_A2 = far([[2.85, -0.15, 1.75, 2.7, -0.2, 1.45, -0.3, 52], [4.6, 0.2, 1.65, 2.2, 0.15, 1.4, -0.2, 48], [5.6, 0.6, 1.42, 1.0, 0.52, 1.25, 0.05, 40], [6.75, 0.62, 1.4, 0.9, 0.52, 1.26, 0.05, 39],
  [7.65, 0.05, 1.75, 1.45, -0.08, 1.62, -0.12, 42], [9.7, 0.04, 1.72, 1.2, -0.08, 1.6, -0.12, 40], [10.45, 0.1, 1.62, 1.6, 0.05, 1.45, -0.1, 44]], 1.35);
function segA2(t) { setCam(CAM_A2, t);
  const tilt = ss(5.0, 5.2, t) * (1 - ss(5.75, 6.0, t));
  const lift = ss(9.75, 10.1, t);
  const greedy = t > 7.9 && t < 9.75;
  taverna(t, { act: ['earlier'], owner: { expr: step([[0, 'neutral'], [3.9, 'grin'], [6.9, 'smug']], t), look: t > 6.9 ? [1, 0] : [0.8, -0.4] }, tilt, hand: tilt > 0.01 ? null : lerpA(REST, [0.36, 1.48], lift), level: lerp(0.3, 0.56, ss(5.2, 5.8, t)), tray: 0,
    expr: step([[0, 'neutral'], [3.87, 'grin'], [6.2, 'smug'], [6.9, 'squint'], [7.9, 'greedy'], [9.75, 'grin']], t), look: t > 6.9 && t < 9.75 ? [0.9, -0.3] : [1, -0.6],
    fx: { sparkle: greedy ? 1 : (t > 9.8 ? ss(9.8, 10.0, t) : 0), drool: ss(8.5, 8.9, t) * (1 - ss(9.7, 9.9, t)) } });
}
// ---------------------------------------------------------------- A3 10.3–19.2: past the mark → out through the stem → stops → keeps draining → the tray gets his drink
function levelA3(t) { if (t < 10.9) return 0.56; if (t < 12.15) return lerp(0.56, 0.86, ss(10.9, 12.15, t)); if (t < 14.5) return lerp(0.86, 0.74, (t - 12.15) / 2.35); return lerp(0.74, 0.06, ss(14.5, 18.8, t)); }
const CAM_A3 = far([[10.25, 0.1, 1.62, 1.6, 0.05, 1.45, -0.1, 44], [11.0, 0.15, 1.55, 1.75, 0.15, 1.38, -0.05, 46], [11.85, 0.6, 1.42, 0.95, 0.52, 1.3, 0.05, 38], [13.4, 0.62, 1.18, 0.95, 0.52, 1.06, 0.07, 40],
  [14.35, 0.2, 1.55, 1.9, 0.12, 1.38, -0.08, 48], [15.3, 0.18, 1.52, 1.75, 0.15, 1.36, -0.05, 46], [16.25, 0.55, 1.45, 0.8, 0.52, 1.3, 0.05, 38],
  [17.2, 0.66, 1.16, 0.85, 0.52, 1.02, 0.07, 40], [18.4, 0.6, 1.12, 0.75, 0.52, 1.02, 0.07, 39], [19.35, 0.52, 1.62, 0.22, 0.52, 1.2, 0.07, 34]], 1.35);
function segA3(t) { setCam(CAM_A3, t);
  const tilt = ss(10.75, 11.0, t) * (1 - ss(14.4, 14.65, t));
  const stopped = t > 14.5;
  const laugh = t > 12.25 && t < 15.4;
  taverna(t, { act: ['earlier', 'golden', ss(10.3, 14.0, t)], owner: { expr: laugh ? 'laugh' : (t > 16.9 ? 'grin' : 'smug'), look: [0.9, -0.5], bob: laugh ? Math.abs(Math.sin(t * 16)) * 0.02 : 0, arms: laugh ? { l: [-0.13, 0.86], r: [0.13, 0.86] } : null },
    tilt, hand: stopped ? lerpA(POUR, DOWN, ss(14.5, 15.0, t)) : null, level: levelA3(t), stem: t > 12.1, drain: t > 12.15, tray: 0.95 * ss(12.2, 19.0, t), // stopped: the jug goes down onto the counter
    expr: step([[0, 'grin'], [10.9, 'greedy'], [12.25, 'shock'], [15.4, 'worried'], [16.9, 'stare']], t), look: t > 16.9 ? [0.8, -1] : (t > 12.25 ? [0.9, -0.9] : [1, -0.5]),
    fx: { sweat: t > 12.3 && t < 16.9 ? 2 : 0, qmarks: ss(15.8, 16.05, t) * (1 - ss(16.8, 17.0, t)), sparkle: t > 10.9 && t < 12.2 ? 1 : 0 },
    armL: t > 12.3 && t < 15.4 ? [-0.46, 1.52] : [-0.28, 0.92], open: { l: t > 12.3 && t < 15.4 } });
}
// ---------------------------------------------------------------- B 19.2–39.8: x-ray — siphon path, high point, priming, flow below the mark, air, residue
const CAM_B = K(300, far([[19.0, 0, 2.3, 1.0, 0, 1.3, 0, 40], [20.3, 0, 1.15, 3.6, 0, 0.95, 0, 42], [21.6, 0.1, 1.2, 3.3, 0, 1.0, 0, 42], [22.8, 0.15, 1.5, 2.3, 0, 1.4, 0, 40],
  [24.0, 0.1, 0.9, 2.6, 0, 0.8, 0, 42], [25.2, 0.05, 0.45, 2.4, 0, 0.35, 0, 42], [26.4, -0.15, 1.2, 3.0, 0, 1.2, 0, 42], [27.8, -0.1, 1.3, 2.6, 0, 1.3, 0, 41],
  [29.0, 0.15, 1.55, 2.2, 0, 1.45, 0, 40], [30.4, 0.1, 0.8, 2.7, 0, 0.7, 0, 42], [31.6, 0.05, 0.45, 2.4, 0, 0.3, 0, 42], [32.8, -0.1, 1.15, 2.9, 0, 1.15, 0, 42],
  [34.2, 0, 1.05, 3.0, 0, 1.0, 0, 42], [35.6, 0.1, 1.0, 2.2, 0, 0.95, 0, 40], [36.8, 0.05, 1.0, 2.0, 0, 0.95, 0, 40], [38.2, 0, 1.45, 1.8, 0, 0.98, 0, 40], [40.0, 0, 1.5, 1.6, 0, 0.98, 0, 40]], 1.5));
const S_TOP = (() => { let best = 0, by = -1; for (let i = 0; i <= 400; i++) { const p = pathPt(i / 400); if (p.y > by) { by = p.y; best = i / 400; } } return best; })();
function sAtY(y) { for (let i = 0; i <= 400; i++) { const s = i / 400 * S_TOP; if (pathPt(s).y >= y) return s; } return S_TOP; }
function levelB(t) { if (t < 26.0) return 0.45; if (t < 27.9) return lerp(0.45, 0.62, ss(26.0, 27.9, t)); if (t < 29.5) return lerp(0.62, 0.86, ss(28.3, 29.5, t)); if (t < 36.3) return lerp(0.86, 0.07, ss(29.9, 36.3, t)); return 0.07; } // 0.07 ≈ intake height: "a little may remain"
const bw = (x, y, z) => B.g.localToWorld(V(x, y, z));
function segB(t) { show(B.g); interiorB(); setCam(CAM_B, t);
  const L = levelB(t); setCupLevel(cupB, L, t > 30.0 && t < 37.0); cupB.userData.lab.visible = false;
  const yL = BASE + (CUP.stemTop + L * (CUP.bowlTop - CUP.stemTop)) * S;
  // water in the pipe: rises with the bowl (communicating), primes over the high point at ~29.3 s, then air breaks it at 36.4 s
  let s0 = 0, s1 = sAtY(yL);
  if (t >= 29.3) s1 = lerp(S_TOP, 1, ss(29.3, 30.4, t));
  if (t >= 36.4) s0 = ss(36.4, 37.3, t);
  setPipe(s0, s1);
  B.g.updateMatrixWorld();
  setStream(drainB, bw(0, BASE - 0.02, 0), bw(0, 0.07, 0), t > 30.3 && t < 37.2, t);
  // filling from above: "fill it far enough" — a ghost jug pours, so the stream is not a bare line from the top of the frame
  const jIn = ss(25.7, 26.0, t) * (1 - ss(29.6, 29.95, t)); jugB.visible = jIn > 0.01;
  const spout = bw(0.08, 2.05 + 0.35 * (1 - jIn), 0);
  if (jugB.visible) { jugB.position.set(0, 0, 0); jugB.rotation.set(0, 0, -lerp(0.55, 1.15, ss(25.8, 26.05, t))); jugB.updateMatrixWorld();
    jugB.position.copy(B.g.worldToLocal(spout.clone()).sub(B.g.worldToLocal(jugB.localToWorld(SPOUT.clone())))); setJugB(jIn); }
  setStream(pourB, spout, bw(0.08, yL, 0), t > 26.0 && t < 29.6, t);
  pipeGlow.material.opacity = 0.55 * ss(20.9, 21.1, t) * (1 - ss(25.6, 26.0, t)) * (0.75 + 0.25 * Math.sin(t * 9));
  // tracer: rises to the high point (21.7–23.4), then down to the outlet (23.5–25.6)
  const tr = t < 23.45 ? ss(21.7, 23.4, t) * S_TOP : lerp(S_TOP, 1, ss(23.5, 25.6, t)); tracer.visible = t > 21.65 && t < 25.9; if (tracer.visible) tracer.position.copy(pathPt(tr));
  highRing.visible = t > 26.3 && t < 34.0; if (highRing.visible) highRing.material.opacity = ss(26.3, 26.6, t) * (1 - ss(33.7, 34.0, t));
  bubbles.forEach((b, i) => { const tt = t - 36.4 - i * 0.14; b.visible = tt > 0 && tt < 0.75; if (b.visible) b.position.copy(pathPt(clamp(tt / 0.75) * S_TOP * 0.95)); });
  const lab = (m, x, y, t0, t1, w) => { const k = pop(t0, t, 0.16) * (1 - ss(t1 - 0.15, t1, t)); m.visible = k > 0.01; m.position.set(x, y, 0.35); m.scale.setScalar(Math.max(0.01, k) * (w || 1)); return m.visible; };
  setPointer(PT.siphon, V(0, 1.86, 0.3), V(0, 1.4, 0.05), lab(LB.siphon, 0, 1.98, 20.95, 22.9));
  // second HIGH POINT call-out sits right of the cup: the ghost jug occupies the top-centre while filling
  if (t < 26.15) setPointer(PT.high, V(0, 1.86, 0.3), V(0, BASE + CUP.high * S + 0.02, 0.05), lab(LB.high, 0.04, 1.98, 22.9, 26.0, 0.7));
  else setPointer(PT.high, V(0.36, 1.76, 0.3), V(0.28, BASE + CUP.high * S + 0.01, 0.05), t < 28.0 && lab(LB.high, 0.42, 1.87, 26.3, 28.0, 0.7));
  setPointer(PT.outlet, V(0.2, 0.42, 0.3), V(0.02, BASE - 0.01, 0.05), lab(LB.outlet, 0.33, 0.52, 24.8, 26.1, 0.7) || lab(LB.outlet, 0.33, 0.52, 31.1, 32.6, 0.7));
  setPointer(PT.air, V(0.32, 1.12, 0.3), V(0.07, BASE + (CUP.stemTop + 0.006) * S, 0.05), lab(LB.air, 0.4, 1.22, 36.4, 38.9, 0.85));
}
// ---------------------------------------------------------------- A4 39.8–46.4: "Our customer wanted a fuller cup. Now he is looking at a fuller tray. More water. Less drink."
const CAM_A4 = far([[39.65, 0.25, 1.62, 1.45, 0.05, 1.45, -0.1, 44], [41.3, 0.22, 1.6, 1.25, 0.08, 1.42, -0.08, 42], [42.3, 0.62, 1.3, 0.85, 0.52, 1.05, 0.06, 40], [43.35, 0.63, 1.28, 0.8, 0.52, 1.04, 0.07, 39],
  [44.35, 0.0, 1.6, 2.15, -0.12, 1.35, -0.08, 53], [46.6, -0.02, 1.57, 1.95, -0.12, 1.35, -0.08, 52]], 1.35);
function segA4(t) { setCam(CAM_A4, t);
  const wink = t > 44.65;
  taverna(t, { act: ['dusk'], owner: { expr: wink ? 'wink' : 'smug', look: wink ? [0, 0] : [0.9, -0.6], arms: wink ? { l: [-0.12, 1.02], r: [0.34, lerp(1.0, 1.4, ss(44.65, 44.95, t))] } : null, open: { r: wink }, fx: { sparkle: ss(44.75, 45.05, t) } }, tilt: 0, hand: DOWN, level: 0.04, tray: 1,
    expr: step([[0, 'worried'], [41.7, 'stare'], [44.6, 'stare']], t), look: t < 41.7 ? [0.9, -0.4] : (t < 44.55 ? [0.8, -1] : [0, 0]),
    fx: { shame: ss(44.65, 44.85, t), sweat: t > 44.65 ? 1 : 0 } }); // no qmarks here: the close-up cut them off at the frame edge
}

// ---------------------------------------------------------------- edit
const SEGS = [{ t0: 0, t1: 3.0, f: segA1 }, { t0: 3.0, t1: 10.3, f: segA2 }, { t0: 10.3, t1: 19.2, f: segA3 }, { t0: 19.2, t1: 39.8, f: segB }, { t0: 39.8, t1: DURATION, f: segA4 }];
const TRANS = { 3.0: 'dissolve', 19.2: 'dissolve', 39.8: 'dissolve' };
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
