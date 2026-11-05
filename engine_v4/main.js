import { THREE, scene, camera, renderer, WIDTH, HEIGHT, hemi, sun, placeSun, sky, daySky, setCam, track, step, ss, clamp, lerp, blink, pop, talk, DIG, renderPost, POST, TEXLOAD } from './core.js';
import { P, TOWER, flakes, board, flaps, cafe, ring, car, roadSign, nfs, nfsStamps, lustig, poisson, lustigCar } from './paris.js';
import { H, curtains, drawChalk, hLight, hSpot, hKey, plaque, model, weight, nameCard, env1, env2, armP, armL, hc, SEATS, hStamp, L, letter, seal, stack, lLamp, lc, V, vLight, calPage, calFlip, CAL_DAYS, CAL_MONTHS, hands, vc2, PH, pLight, pKey, fire, deedFrame, phc } from './rooms.js';
import { TH, tLight, tp, cards, bubbles, marks } from './think.js';

export const DURATION = 49.8;
const SETS = [P.g, H.g, L.g, V.g, PH.g, TH.g];
function show(g) { SETS.forEach(s => s.visible = s === g); }
function interior(bg = 0x1a1410, hemiI = 0.5) { sky.visible = false; scene.background = new THREE.Color(bg); scene.fog.near = 200; scene.fog.far = 400; sun.intensity = 0; hemi.intensity = hemiI; hemi.color.set(0xffe8cc); hemi.groundColor.set(0x5a4030); }
function exterior() { daySky(); sun.intensity = 2.5; hemi.intensity = 0.95; }
const O = (x, y, z, ox) => [x + ox, y, z];
const K = (ox, keys) => keys.map(k => [k[0], k[1] + ox, k[2], k[3], k[4] + ox, k[5], k[6], k[7], k[8] || 0]);

// ---------------------------------------------------------------- P1 hook 0–3.62
const CAM_P1 = [[0.0, 0.0, 0.5, -4.9, 0.0, 9.0, -40, 58], [1.25, 0.0, 0.85, -6.0, 0.0, 6.0, -40, 55], [2.3, 0.4, 1.3, -7.5, 0.55, 1.6, -12, 46], [3.75, -0.45, 1.45, -8.7, -0.75, 1.6, -12.3, 44]];
function segP1(t) {
  show(P.g); exterior(); placeSun([0, 0, -14], [-7, 11, 7], 9, 90); setCam(CAM_P1, t);
  car.visible = false; roadSign.visible = true; nfs.visible = false;
  lustig.at(-0.8, 0, -12.2); poisson.at(0.8, 0, -12.0);
  const slam = t > 0.22 && t < 0.42; const raised2 = ss(2.9, 3.2, t);
  const stampHand = slam ? [-0.05, 1.02] : (t < 0.22 ? [-0.15, 1.45] : (raised2 > 0 ? [lerp(-0.35, -0.42, raised2), lerp(0.9, 1.6, raised2)] : [-0.35, 0.9]));
  const deedWithL = t < 0.95;
  lustig.set({ expr: step([[0, 'smug'], [0.3, 'grin'], [1.2, 'smug'], [2.9, 'grin']], t), look: [0.8, 0], blink: blink(t, 0.4), arms: { l: stampHand, r: deedWithL ? [0.42, 0.98] : [0.28, 0.85] }, items: { stamp: { hand: 'l' }, ...(deedWithL ? { paper: { hand: 'r', stamp: ss(0.27, 0.4, t), title: 'DEED', sub: 'EIFFEL TOWER', ox: 0.12, oy: -0.02 } } : {}) }, fx: { sparkle: ss(3.0, 3.2, t) } }, t);
  const emb = ss(2.0, 2.2, t);
  poisson.set({ expr: emb > 0.5 ? 'ashamed' : step([[0, 'greedy'], [1.0, 'grin']], t), look: [-0.8, 0], blink: blink(t, 1.3), arms: { l: deedWithL ? [-0.42, 0.98] : (emb > 0.5 ? [-0.3, 0.85] : [-0.35, 1.0]), r: [0.3, 0.86] },
    items: deedWithL ? {} : (emb > 0.5 ? {} : { paper: { hand: 'l', stamp: 1, title: 'DEED', sub: 'EIFFEL TOWER', ox: -0.12 } }), fx: { franc: 1, blush: emb, sweat: emb > 0.5 ? 2 : 0, shame: ss(2.3, 2.5, t) } }, t);
  lustig.face(camera); poisson.face(camera);
}
// ---------------------------------------------------------------- P2 newspaper → rust → repair board 3.62–8.10
const CAM_P2 = [[3.5, -3.95, 3.2, -59.45, -3.95, 1.1, -60.0, 46], [4.4, -3.68, 2.25, -60.25, -3.66, 1.1, -60.6, 44], [5.15, -3.88, 2.55, -59.95, -3.92, 1.1, -60.35, 46], [5.75, -4.6, 2.4, -60.0, -8.0, 2.6, -68, 50],
  [6.55, -6.5, 2.1, -62.0, -10.6, 4.6, -71, 50], [6.85, -7.0, 2.0, -62.6, -10.8, 4.0, -71, 48], [7.4, 0.3, 1.9, -57.2, 0.5, 1.85, -64.5, 48], [8.25, 0.5, 1.85, -57.9, 0.5, 1.8, -64.5, 46]];
function segP2(t) {
  show(P.g); exterior(); placeSun(t < 6 ? [-4, 0, -60] : [-9, 0, -67], [-7, 11, 7], t < 6 ? 4 : 10, 90); setCam(CAM_P2, t);
  car.visible = false; nfs.visible = false; lustig.at(0, -50, 0); poisson.at(0, -50, 0); lustig.set({}, t); poisson.set({}, t);
  const k = ss(3.95, 4.35, t); ring.scale.set(Math.max(0.01, k), Math.max(0.01, k), 1); ring.visible = k > 0;
  flakes.forEach(f => { const u = f.userData, tt = t - 6.45 - u.d; f.visible = tt > 0 && tt < 2.5; f.position.set(u.x + Math.sin(tt * 3 + u.ph) * 0.15, u.y0 - tt * u.v, u.z); });
  // flip counter: 000000 → 999999 at "fortune" (7.58)
  const prog = ss(7.15, 7.62, t); flaps.forEach((f, i) => { const v = t < 7.15 ? 0 : Math.min(9, Math.floor(prog * 9 + (5 - i) * 0.12 * (1 - prog))); f.material.map = DIG[t >= 7.62 ? 9 : v]; const sp = t > 7.1 && t < 7.7 ? Math.abs(Math.cos((t * 18 + i) * Math.PI)) : 1; f.scale.y = 0.15 + 0.85 * sp; });
}
// ---------------------------------------------------------------- L Lustig room 8.10–10.50
const CAM_L = K(300, [[7.95, -0.1, 1.95, 1.9, -0.2, 1.3, -2.5, 46], [9.05, -0.15, 1.75, 0.6, -0.2, 1.25, -2.4, 44], [9.35, -0.12, 1.7, 0.45, -0.18, 1.2, -2.4, 44], [10.1, -0.1, 2.15, -1.25, -0.08, 0.95, -2.05, 46], [10.65, -0.05, 2.0, -1.4, -0.05, 0.95, -2.05, 44]]);
function segL(t) {
  show(L.g); interior(0x0d0f1c, 0.32); setCam(CAM_L, t);
  const ch = lc.lustig; ch.at(-0.15, 0, -2.83);
  const slam = t > 9.08 && t < 9.32; const up = t < 9.08;
  ch.set({ expr: step([[0, 'smug'], [9.12, 'grin']], t), look: [0, -1], blink: blink(t, 0.7), lean: 0, arms: { r: slam ? [0.12, 0.98] : (up ? [0.2, lerp(1.2, 1.5, ss(8.6, 9.0, t))] : [0.32, 1.25]), l: [-0.32, 0.98] }, items: { stamp: { hand: 'r' } } }, t);
  ch.face(camera);
  seal.visible = t >= 9.12; const sk = pop(9.12, t, 0.16); seal.scale.set(sk, sk, 1);
  const n = Math.floor(clamp((t - 9.6) / 0.85) * 9); stack.forEach((s, i) => s.visible = i < n);
}
// ---------------------------------------------------------------- H hotel 10.50–27.70 (+ H3 44–45.3)
const CAM_H = K(200, [[10.35, -2.3, 1.8, 3.6, -4.3, 1.55, 1.75, 50], [11.6, -2.55, 1.78, 3.35, -4.3, 1.55, 1.8, 48], [12.05, -1.9, 2.2, 4.6, -3.0, 1.6, 0.6, 48], [12.6, 0.0, 2.7, 7.4, 0.0, 1.15, -1.2, 50],
  [13.9, 0.0, 2.5, 6.4, 0.0, 1.2, -1.6, 48], [14.85, 0.0, 1.85, 1.6, 0.0, 1.5, -3.6, 42], [15.95, 0.0, 1.8, 0.4, 0.0, 1.55, -3.6, 40], [16.85, 0.0, 2.6, 5.4, -0.2, 1.25, -2.4, 50], [18.8, 0.05, 2.55, 5.0, -0.1, 1.25, -2.2, 50],
  [19.7, 0.2, 1.85, 3.3, 1.05, 1.45, 0.8, 44], [21.0, 0.55, 1.75, 2.6, 1.05, 1.5, 0.8, 42], [22.7, 0.6, 1.75, 2.5, 1.05, 1.5, 0.8, 41, 5], [23.45, 0.2, 1.75, -0.9, 0.0, 1.6, -3.6, 42], [26.4, 0.15, 1.72, -1.4, 0.0, 1.55, -3.6, 40], [27.8, 0.35, 1.5, -1.7, 0.3, 1.25, -3.6, 44]]);
const CAM_H3 = K(200, [[43.8, 0.0, 2.55, 5.2, 0.0, 1.3, -2.4, 50], [45.5, 0.0, 2.3, 3.9, 0.0, 1.35, -2.6, 48]]);
const DEALERS = ['d1', 'd2', 'd3', 'poisson', 'd4'], NEW = ['n1', 'n2', 'n3', 'n4', 'n5'];
function hotelBase(t, set2) {
  show(H.g); interior(0x1a1410, 0.5);
  const spot = !set2 && t > 18.9 && t < 23.1 ? ss(18.9, 19.5, t) * (1 - ss(22.9, 23.1, t)) : 0;
  hLight.intensity = 18 * (1 - 0.6 * spot) * (set2 ? 1 : (1 - 0.25 * ss(13.6, 14.3, t))); hKey.intensity = 1.1 * (1 - 0.7 * spot); hSpot.intensity = 60 * spot; hSpot.target.position.set(1.3, 1.2, 0.8);
  const close = set2 ? 1 : ss(13.6, 14.3, t); curtains.forEach(c => { c.position.x = 0 + c.userData.s * lerp(1.35, 0.4, close); });
  const names = set2 ? NEW : DEALERS; ['d1', 'd2', 'd3', 'd4', 'n1', 'n2', 'n3', 'n4', 'n5'].forEach(k => { if (!names.includes(k)) hc[k].at(0, -50, 0); });
  if (set2) hc.poisson.at(0, -50, 0);
  return names;
}
function segH(t) {
  const names = hotelBase(t, false); setCam(CAM_H, t);
  // dealers arrive 12.0–13.6 (walk in from front), seated afterwards
  names.forEach((k, i) => { const [x, z] = SEATS[i]; const ta = 12.05 + i * 0.3; const a = ss(ta, ta + 0.5, t); const c = hc[k];
    c.at(x + (1 - a) * (x < 0 ? -0.6 : 0.6), 0, z + (1 - a) * 4.5);
    const lean = ss(14.4, 14.8, t) * (1 - ss(16.3, 16.6, t));
    const shock = t > 17.15 && t < 17.8; const bidT = 17.85 + [0, 0.15, 0.3, 0.6, 0.45][i]; const bid = t > bidT && t < 19.0;
    const isP = k === 'poisson';
    let expr = shock ? 'shock' : (lean > 0.5 ? 'stare' : (bid ? 'grin' : 'neutral'));
    let arms = { l: [-0.3, 0.86], r: [0.3, 0.86] }, items = {}, fx = {}, open;
    if (bid) { const pk = pop(bidT, t, 0.15); arms.r = [0.34, 0.9 + 0.55 * Math.min(1, pk)]; items.paddle = { hand: 'r', num: i + 1 }; }
    if (isP && t > 18.95) {
      expr = step([[18.95, 'grin'], [21.05, 'greedy'], [22.05, 'squint'], [23.1, 'neutral']], t);
      if (t > 21.05 && t < 22.05) { const rub = Math.sin(t * 30) * 0.03; arms = { l: [-0.07 + rub, 0.98], r: [0.07 - rub, 0.98] }; fx = { franc: 1, drool: ss(21.2, 21.5, t), sparkle: 1 }; }
      if (t > 22.05 && t < 23.1) { fx = { qmarks: ss(22.1, 22.35, t) }; arms = { l: [-0.3, 0.86], r: [0.12, 1.12] }; }
      if (t > 23.1) expr = 'stare';
    }
    if (t > 23.1 && t < 27.7 && !isP) expr = t > 26.2 ? 'stare' : 'neutral';
    c.set({ expr, look: t > 23.1 ? [(x < 0 ? 0.6 : -0.6), 0.2] : (lean > 0.5 ? [x < 0 ? 0.7 : -0.7, 0.3] : [0, 0]), blink: blink(t, i * 0.7), walk: a < 1 ? t * 2.2 : 0, bob: lean * -0.05, arms, items, fx, open }, t);
  });
  // Lustig at head of table
  const lu = hc.lustig; const atDoor = t < 11.9;
  if (atDoor) lu.at(-3.75, 0, 1.6); else lu.at(0, 0, -3.65);
  let lexpr = 'smug', larms = { l: [-0.3, 0.86], r: [0.3, 0.86] }, litems = {}, lfx = {}, lopen = {};
  if (atDoor) { larms.r = [0.36, lerp(0.9, 1.3, ss(10.6, 10.9, t))]; litems.key = { hand: 'r' }; lfx.sparkle = ss(11.1, 11.3, t); lexpr = 'grin'; }
  else if (t < 14.45) { lexpr = 'smug'; larms = { l: [-0.2, 0.75], r: [0.2, 0.75] }; lopen = { l: true, r: true }; }
  else if (t < 16.4) { lexpr = 'smug'; larms.l = [-0.12, 1.5]; lopen = { l: true }; }
  else if (t < 18.95) { lexpr = t > 17.8 ? 'grin' : 'stare'; larms.r = [0.42, lerp(0.95, 1.35, ss(16.4, 16.7, t))]; lopen = { r: true }; }
  else if (t < 23.1) { lexpr = 'smug'; }
  else { lexpr = step([[23.1, 'neutral'], [23.4, 'sigh'], [24.5, 'worried'], [26.2, 'smug']], t); lfx.puff = t > 23.4 && t < 24.3 ? (t - 23.4) / 0.9 : 0;
    if (t > 24.6 && t < 26.1) { larms.r = [0.3, lerp(0.86, 1.25, ss(24.6, 24.9, t))]; litems.slip = { hand: 'r', text: '3 ₣' }; }
    if (t > 26.15) { larms.r = [lerp(0.3, 0.5, ss(26.6, 27.0, t)), lerp(0.86, 1.0, ss(26.6, 27.0, t))]; lopen.r = t > 26.7; larms.l = [-0.13, lerp(0.86, 1.22, ss(26.15, 26.4, t)) * (t < 26.6 ? 1 : 0) + (t >= 26.6 ? 0.86 : 0)]; } }
  lu.set({ expr: lexpr, look: atDoor ? [-1, 0.2] : (t > 18.95 && t < 23.1 ? [1, -0.2] : [0, 0]), blink: blink(t, 1.9) && !['sigh'].includes(lexpr), arms: larms, open: lopen, items: litems, fx: lfx }, t);
  // props
  const tip = ss(15.1, 15.5, t); model.rotation.x = -tip * 1.5; model.position.set(0.55, 0.95, -2.7);
  drawChalk(clamp((t - 16.43) / 0.45), clamp((t - 17.0) / 0.3));
  const wd = clamp((t - 16.95) / 0.18); const bounce = t > 17.13 ? Math.abs(Math.sin((t - 17.13) * 14)) * Math.exp(-(t - 17.13) * 9) * 0.25 : 0;
  weight.visible = t > 16.9; weight.position.set(0, lerp(3.2, 0.95, wd * wd) + bounce, -0.45);
  nameCard.visible = true; hStamp.visible = false; env1.visible = env2.visible = armP.visible = armL.visible = false;
  Object.values(hc).forEach(c => c.face(camera));
}
function segH3(t) {
  const names = hotelBase(t, true); setCam(CAM_H3, t);
  names.forEach((k, i) => { const [x, z] = SEATS[i]; const c = hc[k]; c.at(x, 0, z); const shock = t > 44.75; c.set({ expr: shock ? 'shock' : 'grin', look: [x < 0 ? 0.7 : -0.7, 0.2], blink: blink(t, i), fx: shock ? { sweat: 1 } : {} }, t); });
  const lu = hc.lustig; lu.at(0, 0, -3.65);
  const slam = t > 44.68 && t < 44.85; lu.set({ expr: t > 44.7 ? 'wink' : 'grin', arms: { l: slam ? [-0.15, 1.0] : [-0.3, lerp(1.0, 1.55, ss(44.1, 44.5, t))], r: [0.42, 0.98] }, items: { stamp: { hand: 'l' }, paper: { hand: 'r', stamp: ss(44.72, 44.85, t), title: 'DEED', sub: 'EIFFEL TOWER', ox: 0.1 } }, fx: { sparkle: ss(44.85, 45.0, t) } }, t);
  model.rotation.x = 0; weight.visible = false; drawChalk(1, 1); nameCard.visible = false;
  env1.visible = env2.visible = armP.visible = armL.visible = false;
  Object.values(hc).forEach(c => c.face(camera));
}
// ---------------------------------------------------------------- H2 top-down payment 33.0–35.40
const CAM_H2 = K(200, [[32.8, 0.05, 3.25, -0.6, 0.05, 0.95, -1.05, 46], [35.6, 0.0, 3.0, -0.85, 0.0, 0.95, -1.25, 44]]);
function segH2(t) {
  hotelBase(t, true); setCam(CAM_H2, t); ['d1', 'd2', 'd3', 'd4', 'poisson', 'lustig', 'n1', 'n2', 'n3', 'n4', 'n5'].forEach(k => hc[k].at(0, -50, 0));
  weight.visible = false; model.rotation.x = 0; nameCard.visible = false; hStamp.visible = false;
  // envelope 1 pushed by Poisson's arm from the right (+x) toward Lustig (−z)
  const a1 = ss(33.35, 33.75, t), a2 = ss(34.4, 34.85, t), grab1 = ss(34.05, 34.3, t), grab2 = ss(35.0, 35.25, t);
  env1.visible = true; env1.position.set(lerp(0.75, 0.05, a1) - grab1 * 0.0, 0.952, lerp(-0.6, -1.55, a1) - grab1 * 0.9); env1.rotation.z = lerp(0.4, 0.05, a1);
  env2.visible = t > 34.25; env2.position.set(lerp(0.8, -0.05, a2), 0.954, lerp(-0.35, -1.25, a2) - grab2 * 0.9); env2.rotation.z = lerp(-0.5, 0.1, a2);
  armP.visible = true; const ap = t < 34.2 ? a1 * (1 - ss(33.85, 34.15, t)) : a2 * (1 - ss(34.95, 35.25, t)); const ez = t < 34.2 ? env1.position : env2.position;
  armP.position.set(0.55 + lerp(0.6, 0.12, ap), 0.96, (t < 34.2 ? lerp(-0.6, -1.5, a1) : lerp(-0.35, -1.2, a2)) + 0.02); armP.rotation.set(-Math.PI / 2, 0, Math.PI - 0.55 * 0 + 0.0); armP.rotation.z = Math.PI + 0.5;
  armL.visible = t > 33.9; const gl = t < 34.6 ? ss(33.95, 34.15, t) * (1 - ss(34.35, 34.6, t)) : ss(34.85, 35.05, t) * (1 - ss(35.25, 35.45, t)); armL.position.set(0.2, 0.962, -2.5 + gl * 0.75); armL.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
}
// ---------------------------------------------------------------- P3 car leaves 35.40–37.62
const CAM_P3 = [[35.2, -1.4, 1.7, 26.0, -1.6, 1.35, 18.3, 46], [36.3, -0.9, 1.7, 25.5, -0.6, 1.4, 18.3, 46], [37.8, 2.6, 1.8, 25.2, 3.6, 1.5, 18.0, 48]];
function segP3(t) {
  show(P.g); exterior(); placeSun([0, 0, 18], [-6, 11, 7], 9, 90); setCam(CAM_P3, t); nfs.visible = false; roadSign.visible = true;
  lustig.at(0, -50, 0); poisson.at(0, -50, 0); lustig.set({}, t); poisson.set({}, t);
  const go = t > 36.15 ? Math.pow(t - 36.15, 2) * 4.2 : 0; car.visible = true; car.position.set(-1.6 + go, 0, 18.3); car.userData.wheels.forEach(w => w.rotation.z = -go / 0.45);
  lustigCar.at(-1.6 + go - 0.55, 0.62, 18.3); lustigCar.set({ expr: t > 36.1 ? 'laugh' : 'grin', look: [1, 0], arms: { l: [-0.3, 0.95], r: [0.38, lerp(1.0, 1.5, ss(35.6, 35.9, t))] }, open: { r: true }, fx: { sparkle: ss(35.7, 36.0, t) } }, t);
  lustigCar.face(camera);
  car.userData.bills.forEach(b => { const u = b.userData, tt = t - 36.25 - u.d * 0.6; b.visible = tt > 0 && tt < 1.8; if (!b.visible) return; const base = car.userData.case.getWorldPosition(new THREE.Vector3()); b.position.set(base.x + u.v[0] * tt, base.y + 0.3 + u.v[1] * tt - 2.2 * tt * tt, base.z + u.v[2] * tt); b.material.rotation = u.sp * tt; });
}
// ---------------------------------------------------------------- V Vienna 37.62–39.75 and calendar 42.62–43.95
const CAM_V = K(400, [[37.4, -0.05, 1.8, 2.9, -0.45, 1.65, -2.4, 48], [39.9, -0.1, 1.72, 2.1, -0.45, 1.6, -2.4, 45]]);
const CAM_V2 = K(400, [[42.5, -1.3, 2.15, -0.45, -1.45, 2.1, -2.97, 42], [44.0, -1.4, 2.12, -0.95, -1.45, 2.1, -2.97, 40]]);
function vienna(t) { show(V.g); interior(0x1a1a22, 0.75); }
function flipCal(t, list, t0, dt) { const n = list.length; const i = clamp(Math.floor((t - t0) / dt), 0, n - 1); const ph = clamp(((t - t0) / dt) - i); const cur = list[i], nxt = list[Math.min(n - 1, i + 1)];
  if (t < t0) { calPage.material.map = list[0]; calFlip.visible = false; return; } calPage.material.map = nxt; calFlip.visible = i < n - 1; calFlip.material.map = cur; calFlip.rotation.x = -ph * Math.PI * 0.95; }
function segV(t) {
  vienna(t); setCam(CAM_V, t); const ch = vc2.lustig; ch.at(0.2, 0, -2.2);
  flipCal(t, CAL_DAYS, 37.75, 0.24);
  hands[0].rotation.z = -t * 3; hands[1].rotation.z = -t * 18;
  const nothing = t > 39.15;
  ch.set({ expr: nothing ? 'stare' : 'smug', look: nothing ? [0, 0] : [0.9, 0.1], blink: blink(t, 0.3), arms: nothing ? { l: [-0.48, 1.0], r: [0.48, 1.0] } : { l: [-0.28, 1.05], r: [0.28, 1.05] }, open: nothing ? { l: true, r: true } : {}, items: nothing ? {} : { newspaper: { k: 0.35, title: 'WIENER ZEITUNG' } }, bob: nothing ? Math.sin((t - 39.15) * 18) * 0.015 * (t < 39.6 ? 1 : 0) : 0 }, t);
  ch.face(camera);
}
function segV2(t) { vienna(t); setCam(CAM_V2, t); vc2.lustig.at(0, -50, 0); flipCal(t, CAL_MONTHS, 42.72, 0.19); }
// ---------------------------------------------------------------- PH Poisson home 39.75–42.62
const CAM_PH = K(500, [[39.55, 0.0, 1.75, 2.1, 0.0, 1.55, -2.6, 46], [42.8, 0.1, 1.72, 1.15, 0.15, 1.6, -2.6, 42]]);
function segPH(t) {
  show(PH.g); interior(0x1a1410, 0.45); setCam(CAM_PH, t); fire.scale.y = 1 + Math.sin(t * 13) * 0.08;
  const ch = phc.poisson; ch.at(-0.35, 0, -2.0); const turn = ss(41.55, 41.95, t);
  deedFrame.userData.inner.rotation.y = turn * Math.PI;
  const reach = ss(41.3, 41.55, t) * (1 - ss(42.05, 42.3, t));
  ch.set({ expr: 'ashamed', look: [0.6, -1], arms: { l: [-0.3, 1.02], r: reach > 0 ? [lerp(0.3, 0.75, reach), lerp(1.0, 1.75, reach)] : [0.3, 1.02] }, items: reach > 0.1 ? {} : { newspaper: { k: 0.72, title: 'LE JOURNAL' } }, fx: { blush: 1, sweat: 2, shame: 1 } }, t);
  ch.face(camera);
}
// ---------------------------------------------------------------- TH think 27.70–33.0
const CAM_TH = K(-300, [[27.5, -0.35, 1.8, 7.9, 0.0, 2.1, 0, 50], [29.45, -0.15, 1.95, 6.85, 0.0, 2.25, 0, 50], [31.4, 0.0, 2.08, 6.05, 0.0, 2.34, 0, 51], [33.2, 0.12, 2.12, 5.45, 0.0, 2.4, 0, 51]]);
function segT(t) {
  show(TH.g); sky.visible = false; scene.background = new THREE.Color(0x07070a); sun.intensity = 0; hemi.intensity = 0.25; setCam(CAM_TH, t);
  tp.at(0, 0, 0); tp.set({ expr: step([[27.7, 'squint'], [28.6, 'grin'], [30.35, 'stare'], [32.25, 'grin']], t), look: t > 31.7 ? [0.8, 0.8] : (t > 29.6 ? [-0.8, 0.8] : [0, 0.6]), blink: blink(t, 0.2), fx: { bulb: ss(28.58, 28.75, t) * (1 - ss(29.5, 29.7, t)), sparkle: t > 32.3 ? 1 : 0 }, arms: { l: [-0.3, 0.86], r: t > 28.6 && t < 29.6 ? [0.32, 1.45] : [0.3, 0.86] } }, t);
  tp.face(camera);
  const c1 = pop(29.55, t, 0.2), c2 = pop(31.65, t, 0.2); cards[0].scale.setScalar(Math.max(0.001, c1) * 0.86); cards[1].scale.setScalar(Math.max(0.001, c2) * 0.86); cards[0].visible = c1 > 0; cards[1].visible = c2 > 0;
  bubbles.forEach((b, i) => { const k = i < 2 ? pop(29.45 + i * 0.05, t, 0.15) : pop(31.55 + (i - 2) * 0.05, t, 0.15); b.scale.setScalar(Math.max(0.001, k)); b.visible = k > 0; });
  const m1 = pop(30.36, t, 0.15), m2 = pop(32.25, t, 0.15); marks[0].visible = m1 > 0; marks[0].scale.setScalar(Math.max(0.001, m1) * 0.8); marks[1].visible = m2 > 0; marks[1].scale.setScalar(Math.max(0.001, m2) * 0.8);
}
// ---------------------------------------------------------------- P4 ending 45.30–49.80
const CAM_P4 = [[45.1, 0.15, 1.5, -10.2, 0.15, 1.6, -15.5, 56], [46.9, 0.22, 0.9, -10.3, 0.3, 4.0, -30, 64], [48.2, 0.2, 0.68, -10.4, 0.28, 5.6, -40, 65], [49.8, 0.1, 0.8, -9.7, 0.18, 6.0, -42, 66]];
function segP4(t) {
  show(P.g); exterior(); sun.color.set(0xffe2b8); placeSun([0, 0, -15], [-7, 9, 8], 9, 90); setCam(CAM_P4, t); car.visible = false; nfs.visible = true;
  poisson.at(0, -50, 0); poisson.set({}, t); lustig.at(-0.95, 0, -14.9);
  const s1 = t > 47.75 && t < 47.92, s2 = t > 48.02 && t < 48.2;
  nfsStamps[0].visible = t > 47.82; nfsStamps[1].visible = t > 48.1; nfsStamps.forEach((m, i) => { const k = pop(i ? 48.1 : 47.82, t, 0.14); m.scale.set(Math.max(0.01, k), Math.max(0.01, k), 1); });
  const hand = s1 ? [0.55, 1.62] : (s2 ? [0.62, 1.38] : [0.4, lerp(1.0, 1.75, ss(47.3, 47.6, t)) * (t < 48.3 ? 1 : 0) + (t >= 48.3 ? 0.98 : 0)]);
  lustig.set({ expr: step([[0, 'smug'], [47.8, 'grin'], [48.55, 'wink']], t), look: t > 48.4 ? [0, 0] : [1, 0.3], blink: blink(t, 0.5) && t < 48.4, arms: { r: hand, l: t > 48.55 ? [-0.15, lerp(0.86, 1.7, ss(48.55, 48.8, t))] : [-0.3, 0.86] }, items: { stamp: { hand: 'r' }, cane: undefined }, hatLift: ss(48.6, 48.85, t) * 0.12 * (1 - ss(49.3, 49.6, t)), fx: { sparkle: ss(48.6, 48.9, t) } }, t);
  lustig.face(camera);
}

// ---------------------------------------------------------------- edit
const SEGS = [
  { t0: 0, t1: 3.62, f: segP1 }, { t0: 3.62, t1: 8.1, f: segP2 }, { t0: 8.1, t1: 10.5, f: segL }, { t0: 10.5, t1: 27.7, f: segH }, { t0: 27.7, t1: 33.0, f: segT },
  { t0: 33.0, t1: 35.4, f: segH2 }, { t0: 35.4, t1: 37.62, f: segP3 }, { t0: 37.62, t1: 39.75, f: segV }, { t0: 39.75, t1: 42.62, f: segPH }, { t0: 42.62, t1: 43.95, f: segV2 }, { t0: 43.95, t1: 45.3, f: segH3 }, { t0: 45.3, t1: 49.8, f: segP4 }];
const TRANS = { 3.62: 'dissolve', 8.1: 'dissolve', 10.5: 'dissolve', 27.7: 'iris', 33.0: 'flash', 35.4: 'dissolve', 37.62: 'dissolve', 39.75: 'dissolve', 42.62: 'dissolve', 43.95: 'cut', 45.3: 'dissolve' };
export const EDIT = { SEGS, TRANS };
const segAt = t => { for (let i = 0; i < SEGS.length; i++) if (t < SEGS[i].t1) return i; return SEGS.length - 1; };
const HALF = 3.5 / 30;
const acc = document.createElement('canvas'); acc.width = WIDTH; acc.height = HEIGHT; const actx = acc.getContext('2d'); actx.imageSmoothingQuality = 'high';
const tmp = document.createElement('canvas'); tmp.width = WIDTH; tmp.height = HEIGHT; const tctx = tmp.getContext('2d'); tctx.imageSmoothingQuality = 'high';
function renderSeg(i, t) { POST.focus = null; SEGS[i].f(t); renderPost(); }
function camState() { return [camera.position.clone(), new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion), camera.fov]; }
function blurPx(i, t) { const dt = 0.5 / 30; SEGS[i].f(t); const [p0, d0] = camState(); SEGS[i].f(t + dt); const [p1, d1] = camState(); const ang = d0.angleTo(d1); const lin = p0.distanceTo(p1) / 4.0; return (ang + lin) / (camera.fov * Math.PI / 180) * HEIGHT; }
// heavy post (N8AO/bokeh/bloom) only on the centre sub-frame; other motion-blur sub-frames use the light shader post
function drawSeg(ctx, i, t, maxSub) { const bp = blurPx(i, t); const n = bp < 4 ? 1 : Math.max(2, Math.min(maxSub, Math.ceil(bp / 3))); ctx.clearRect(0, 0, WIDTH, HEIGHT); const mid = Math.floor((n - 1) / 2);
  const order = [mid, ...[...Array(n).keys()].filter(k => k !== mid)];
  // centre sub-frame: full post at full res. Other sub-frames (only during fast moves, already blurred): raw render at half res,
  // graded in 2D to match the post (saturation/contrast/brightness + vignette) so the average has no colour ghosting.
  order.forEach((k, j) => { const ts = t + (n > 1 ? (k / (n - 1) - 0.5) * 0.5 / 30 : 0);
    if (k === mid) { POST.lib = true; POST.on = true; POST.ao = true; renderSeg(i, ts); ctx.globalAlpha = 1 / (j + 1); ctx.drawImage(renderer.domElement, 0, 0, WIDTH, HEIGHT); return; }
    renderer.setSize(WIDTH / 2, HEIGHT / 2, false); POST.lib = false; POST.on = false; renderSeg(i, ts);
    sctx.globalCompositeOperation = 'source-over'; sctx.filter = GRADE_CSS; sctx.drawImage(renderer.domElement, 0, 0, WIDTH, HEIGHT); sctx.filter = 'none';
    sctx.globalCompositeOperation = 'multiply'; sctx.drawImage(VIG, 0, 0); sctx.globalCompositeOperation = 'source-over';
    renderer.setSize(WIDTH, HEIGHT, false); ctx.globalAlpha = 1 / (j + 1); ctx.drawImage(subc, 0, 0); });
  POST.lib = true; POST.on = true; ctx.globalAlpha = 1; return n; }
const GRADE_CSS = 'saturate(0.8) contrast(1.06) brightness(0.99)';
const subc = document.createElement('canvas'); subc.width = WIDTH; subc.height = HEIGHT; const sctx = subc.getContext('2d'); sctx.imageSmoothingQuality = 'high';
const VIG = document.createElement('canvas'); VIG.width = WIDTH; VIG.height = HEIGHT; { const g = VIG.getContext('2d'); const gr = g.createRadialGradient(WIDTH / 2, HEIGHT / 2, HEIGHT * 0.4, WIDTH / 2, HEIGHT / 2, HEIGHT * 0.75); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#d4d4d4'); g.fillStyle = gr; g.fillRect(0, 0, WIDTH, HEIGHT); }
window.renderAt = (t, maxSub = 5) => {
  let i = segAt(t), sub = 1;
  // transition windows
  let done = false;
  for (const [bs, type] of Object.entries(TRANS)) { const b = +bs; const j = SEGS.findIndex(s => Math.abs(s.t0 - b) < 1e-6);
    if (type === 'dissolve' && t >= b - HALF && t < b + HALF) { const k = ss(b - HALF, b + HALF, t); drawSeg(actx, j - 1, t, maxSub); drawSeg(tctx, j, t, maxSub); actx.globalAlpha = k; actx.drawImage(tmp, 0, 0); actx.globalAlpha = 1; done = true; }
    if (type === 'flash' && t >= b - 0.2 && t < b + 0.2) { drawSeg(actx, t < b ? j - 1 : j, t, maxSub); const k = 1 - Math.abs(t - b) / 0.2; actx.fillStyle = `rgba(255,255,250,${Math.pow(k, 0.7)})`; actx.fillRect(0, 0, WIDTH, HEIGHT); done = true; }
    if (type === 'iris' && t >= b - 0.3 && t < b + 0.25) { const before = t < b; drawSeg(actx, before ? j - 1 : j, t, maxSub); const k = before ? 1 - ss(b - 0.3, b, t) : ss(b, b + 0.25, t); const r = 30 + k * 900; actx.save(); actx.fillStyle = '#000'; actx.beginPath(); actx.rect(0, 0, WIDTH, HEIGHT); actx.arc(WIDTH * (before ? 0.58 : 0.5), HEIGHT * (before ? 0.42 : 0.5), r, 0, Math.PI * 2, true); actx.fill('evenodd'); actx.restore(); done = true; }
    if (done) break; }
  if (!done) sub = drawSeg(actx, i, t, maxSub);
  return { url: acc.toDataURL('image/jpeg', 0.97), sub, seg: i };
};
Promise.all(TEXLOAD).then(() => { window.READY = true; });
window.camAt = (t, sg) => { const i = segAt(t); if (sg !== undefined) window.__sg = sg; SEGS[i].f(t); const [p, d, f] = camState(); return [...p.toArray(), ...d.toArray(), f, i]; };
window.__blurPx = (t) => { const i = segAt(t); return blurPx(i, t); };
window.__gradeTest = (t) => { const i = segAt(t); POST.lib = true; POST.on = true; POST.ao = true; renderSeg(i, t); const a = renderer.domElement.toDataURL('image/png');
  renderer.setSize(WIDTH / 2, HEIGHT / 2, false); POST.lib = false; POST.on = false; renderSeg(i, t); sctx.filter = GRADE_CSS; sctx.drawImage(renderer.domElement, 0, 0, WIDTH, HEIGHT); sctx.filter = 'none';
  sctx.globalCompositeOperation = 'multiply'; sctx.drawImage(VIG, 0, 0); sctx.globalCompositeOperation = 'source-over'; renderer.setSize(WIDTH, HEIGHT, false); POST.lib = true; POST.on = true; return [a, subc.toDataURL('image/png')]; };
