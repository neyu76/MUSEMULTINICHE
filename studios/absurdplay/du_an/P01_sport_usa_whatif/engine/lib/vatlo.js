// Động tác đấu vật giải trí (WWE-style) bằng code, cho 1 hoặc 2 nhân vật: thế thủ, khoe cơ/ra hiệu khán giả, ôm khoá (lock-up), clothesline,
// body slam, nằm ngửa, đè đếm (pin) + trọng tài đếm 1-2-3, leo cột góc, bay xuống (splash/elbow drop), bật dây, giơ tay người thắng, giơ đai,
// đập ghế. Đòn là ĐIỆU BỘ hoạt hình (không mô phỏng chấn thương thật); khớp 2 người bằng IK tay vào xương của người kia.
// Quy ước như bongchay.js: hệ nhân vật +z trước, +x trái; thảm cao MAT_Y (wwe.js). Mọi hàm đặt root + tư thế cho khung t/k.
import * as THREE from 'three';
import { aim, resetPose, ik2, groundIt, rotW } from './tuthe.js';
import { legs } from './bongchay.js';
import { MAT_Y } from './wwe.js';

const L = (ch, x, y, z) => new THREE.Vector3(x, y, z).applyQuaternion(ch.root.getWorldQuaternion(new THREE.Quaternion()));
const B = (ch, n) => ch.bones[n];
const lerp = (a, b, k) => a + (b - a) * k;
const cl = (x) => Math.min(1, Math.max(0, x));
const sm = (x) => { x = cl(x); return x * x * (3 - 2 * x); };
const WP = (ch, n) => ch.bones[n].getWorldPosition(new THREE.Vector3());
const handIK = (ch, s, T, pole) => ik2(ch, 'upperarm_' + s, 'lowerarm_' + s, 'hand_' + s, T, pole);
const face = (ch, target) => { const d = target.clone().sub(ch.root.position); ch.root.rotation.y = Math.atan2(d.x, d.z); ch.root.updateMatrixWorld(true); };
const onMat = (ch, x, z, y = MAT_Y) => { ch.root.position.set(x, y, z); ch.root.updateMatrixWorld(true); groundIt(ch, y, 0.0); };
const Wl = (ch, x, y, z) => ch.root.position.clone().add(L(ch, x * ch.root.scale.y, y * ch.root.scale.y, z * ch.root.scale.y));
const upright = (ch) => { ch.root.rotation.order = 'YXZ'; ch.root.rotation.x = 0; ch.root.rotation.z = 0; };

// THẾ THỦ: khuỵu, 2 tay trước ngực sẵn sàng ôm; nhún vai theo t
export function wrestlerStance(ch, x, z, t = 0, seed = 0, y = MAT_Y) {
  upright(ch); legs(ch, 0.45 + Math.sin(t * 3 + seed) * 0.04, 0.3, 0.38, 0.1, Math.sin(t * 1.5 + seed) * 0.15); onMat(ch, x, z, y);
  for (const [s, q] of [['l', 1], ['r', -1]]) handIK(ch, s, Wl(ch, q * 0.3, 1.2, 0.45), L(ch, q * 0.9, -0.4, -0.3));
  aim(B(ch, 'neck_01'), B(ch, 'Head'), L(ch, 0, 0.7, 0.8));
}
// KHOE / RA HIỆU KHÁN GIẢ: kind 'flex' (gồng 2 tay), 'point' (chỉ tay lên khán đài), 'ear' (tay đặt sau tai "nghe tiếng hò"), 'belt' (giơ 2 tay cao)
export function taunt(ch, kind, k, x, z, t = 0, y = MAT_Y) {
  upright(ch); legs(ch, 0.12, -0.05, 0.3); onMat(ch, x, z, y); const e = sm(k);
  if (kind === 'flex') for (const [s, q] of [['l', 1], ['r', -1]]) { aim(B(ch, 'upperarm_' + s), B(ch, 'lowerarm_' + s), L(ch, q, lerp(-1, 0.1, e), 0.05)); aim(B(ch, 'lowerarm_' + s), B(ch, 'hand_' + s), L(ch, q * 0.15, lerp(-0.7, 1, e), 0.15 + Math.sin(t * 9) * 0.05 * e)); }
  else if (kind === 'point') { aim(B(ch, 'upperarm_r'), B(ch, 'lowerarm_r'), L(ch, -0.5, lerp(-1, 0.9, e), 0.6)); aim(B(ch, 'lowerarm_r'), B(ch, 'hand_r'), L(ch, -0.5, lerp(-0.6, 1, e), 0.7)); }
  else if (kind === 'ear') { handIK(ch, 'r', WP(ch, 'Head').addScaledVector(L(ch, -1, 0, 0), 0.14).addScaledVector(L(ch, 0, 0, -1), 0.03), L(ch, -1, 0.3, -0.3)); rotW(B(ch, 'Head'), L(ch, 0, 0, 1), -0.25 * e); }
  else { for (const [s, q] of [['l', 1], ['r', -1]]) { aim(B(ch, 'upperarm_' + s), B(ch, 'lowerarm_' + s), L(ch, q * 0.35, lerp(-1, 1, e), 0.1)); aim(B(ch, 'lowerarm_' + s), B(ch, 'hand_' + s), L(ch, q * 0.1, 1, 0.05)); } }
}
// ÔM KHOÁ (lock-up): A và B đối mặt cách 0,8 m, mỗi người 1 tay sau gáy, 1 tay nắm khuỷu người kia; đẩy qua lại theo t
export function lockUp(A, Bc, t, cx, cz, ry = 0) {
  const sway = Math.sin(t * 2.2) * 0.12; const dir = new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry));
  const pa = new THREE.Vector3(cx, 0, cz).addScaledVector(dir, -0.4 + sway), pb = new THREE.Vector3(cx, 0, cz).addScaledVector(dir, 0.4 + sway);
  for (const [ch, p, q] of [[A, pa, pb], [Bc, pb, pa]]) { upright(ch); ch.root.position.set(p.x, MAT_Y, p.z); face(ch, q); legs(ch, 0.4, 0.45, 0.4, 0.15); onMat(ch, p.x, p.z); }
  for (const [ch, o] of [[A, Bc], [Bc, A]]) { handIK(ch, 'r', WP(o, 'neck_01').addScaledVector(L(o, 0, 0, -1), 0.06), L(ch, -0.9, 0.2, -0.3)); handIK(ch, 'l', WP(o, 'lowerarm_r'), L(ch, 0.9, -0.3, -0.3)); }
}
// NẰM NGỬA trên thảm (bị hạ gục): đầu về hướng `ry`; thở; arms: 'out' dang tay, 'side' xuôi
export function lieBack(ch, x, z, t = 0, ry = 0, arms = 'out', y = MAT_Y) {
  ch.root.rotation.order = 'YXZ'; ch.root.rotation.set(-Math.PI / 2, ry, 0); resetPose(ch);
  const br = Math.sin(t * 2.4) * 0.03; aim(B(ch, 'spine_02'), B(ch, 'spine_03'), L(ch, 0, 1, br));
  for (const [s, q] of [['l', 1], ['r', -1]]) { aim(B(ch, 'upperarm_' + s), B(ch, 'lowerarm_' + s), arms === 'out' ? L(ch, q, -0.2, -0.1) : L(ch, q * 0.2, -1, -0.1)); aim(B(ch, 'lowerarm_' + s), B(ch, 'hand_' + s), arms === 'out' ? L(ch, q, 0.3, -0.1) : L(ch, q * 0.1, -1, -0.1));
    aim(B(ch, 'thigh_' + s), B(ch, 'calf_' + s), L(ch, q * 0.15, -1, 0.05)); aim(B(ch, 'calf_' + s), B(ch, 'foot_' + s), L(ch, q * 0.15, -1, 0)); }
  ch.root.position.set(x, y, z); ch.root.updateMatrixWorld(true); groundIt(ch, y, 0.02);
}
// CLOTHESLINE: A chạy từ `from` tới B ở `at`, tay phải dang ngang ngang cổ; k ≥ 0,5 B lật ngửa ra sau rồi nằm. Trả về { hit } (true tại khung chạm)
export function clothesline(A, Bc, k, from, at) {
  const run = sm(k / 0.5), u = cl((k - 0.5) / 0.5); const pa = from.clone().lerp(at.clone().addScaledVector(at.clone().sub(from).setY(0).normalize(), -0.35), run);
  upright(A); A.root.position.set(pa.x, MAT_Y, pa.z); face(A, at); const ph = k * 14;
  legs(A, 0.25, 0.35, 0.2, Math.sin(ph) * 0.6, 0.2); onMat(A, pa.x, pa.z);
  aim(B(A, 'upperarm_r'), B(A, 'lowerarm_r'), L(A, -1, 0.15, 0.25)); aim(B(A, 'lowerarm_r'), B(A, 'hand_r'), L(A, -1, 0.2, 0.3));
  aim(B(A, 'upperarm_l'), B(A, 'lowerarm_l'), L(A, 0.4, -0.7, Math.cos(ph) * 0.5)); aim(B(A, 'lowerarm_l'), B(A, 'hand_l'), L(A, 0.2, -0.3, 0.8));
  if (u <= 0) { upright(Bc); Bc.root.position.set(at.x, MAT_Y, at.z); face(Bc, from); legs(Bc, 0.15, 0.05, 0.25); onMat(Bc, at.x, at.z); aim(B(Bc, 'neck_01'), B(Bc, 'Head'), L(Bc, 0, 0.8, 0.6)); }
  else { // lật: xoay quanh trục ngang, bay nhẹ lên rồi rơi nằm ngửa
    const fx = from.clone().sub(at).setY(0).normalize(); Bc.root.rotation.order = 'YXZ'; const ry = Math.atan2(fx.x, fx.z);
    if (u < 0.75) { Bc.root.rotation.set(-sm(u / 0.75) * Math.PI / 2 * 1.15, ry, 0); resetPose(Bc);
      for (const [s, q] of [['l', 1], ['r', -1]]) { aim(B(Bc, 'thigh_' + s), B(Bc, 'calf_' + s), L(Bc, q * 0.2, -0.6, 0.6)); aim(B(Bc, 'upperarm_' + s), B(Bc, 'lowerarm_' + s), L(Bc, q, 0.3, 0.2)); }
      Bc.root.position.set(at.x, MAT_Y, at.z).addScaledVector(fx, -0.5 * u); Bc.root.updateMatrixWorld(true); groundIt(Bc, MAT_Y, 0); Bc.root.position.y += Math.sin(Math.PI * u / 0.75) * 0.55; Bc.root.updateMatrixWorld(true); }
    else { const p = at.clone().addScaledVector(fx, -0.5); lieBack(Bc, p.x, p.z, k * 3, ry + Math.PI, 'out'); }
  }
  return { hit: k >= 0.49 && k < 0.53 };
}
// BODY SLAM: A nhấc B lên ngang vai (0–0,35), giữ (0,35–0,55), quật xuống (0,55–0,72), B nằm ngửa (0,72–1). Trả về { impact } ở khung chạm thảm
export function bodySlam(A, Bc, k, x, z, ry = 0) {
  const lift = sm(k / 0.35), drop = sm((k - 0.55) / 0.17); upright(A); A.root.rotation.y = ry; A.root.position.set(x, MAT_Y, z);
  legs(A, lerp(0.45, 0.2, lift) + 0.35 * drop, 0.15 + 0.3 * drop, 0.38, 0.1); onMat(A, x, z);
  const fwd = new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry)), side = new THREE.Vector3(Math.cos(ry), 0, -Math.sin(ry));
  if (k < 0.72) { const hold = new THREE.Vector3(x, MAT_Y + lerp(1.0, 1.9, lift) * A.root.scale.y, z).addScaledVector(fwd, lerp(0.35, 0.25, lift));
    const target = new THREE.Vector3(x, MAT_Y + 0.15, z).addScaledVector(fwd, 0.9); const c = hold.clone().lerp(target, drop);
    Bc.root.rotation.order = 'YXZ'; Bc.root.rotation.set(-lerp(0.2, Math.PI / 2, Math.max(lift, drop)), ry + Math.PI / 2, 0); resetPose(Bc);
    for (const [s, q] of [['l', 1], ['r', -1]]) { aim(B(Bc, 'upperarm_' + s), B(Bc, 'lowerarm_' + s), L(Bc, q, 0.2, 0.3)); aim(B(Bc, 'thigh_' + s), B(Bc, 'calf_' + s), L(Bc, q * 0.25, -1, 0.3 * Math.sin(k * 20))); }
    Bc.root.updateMatrixWorld(true); const mid = WP(Bc, 'spine_01'); Bc.root.position.add(c.clone().sub(mid)); Bc.root.updateMatrixWorld(true);
    handIK(A, 'r', WP(Bc, 'spine_03').addScaledVector(side, 0.02), L(A, -0.8, -0.3, -0.3)); handIK(A, 'l', WP(Bc, 'pelvis'), L(A, 0.8, -0.3, -0.3));
  } else { const p = new THREE.Vector3(x, 0, z).addScaledVector(fwd, 0.9); lieBack(Bc, p.x, p.z, k * 3, ry + Math.PI / 2, 'out');
    for (const [s, q] of [['l', 1], ['r', -1]]) { aim(B(A, 'upperarm_' + s), B(A, 'lowerarm_' + s), L(A, q * 0.6, -0.7, 0.5)); } }
  return { impact: k >= 0.71 && k < 0.75 };
}
// ĐÈ ĐẾM (pin): B nằm ngửa ở (x,z); A quỳ cạnh, nằm đè ngang ngực B, 1 tay móc chân B. ry = hướng đầu của B
export function pinCover(A, Bc, t, x, z, ry = 0) {
  lieBack(Bc, x, z, t, ry, 'out'); const chest = WP(Bc, 'spine_03'), knee = WP(Bc, 'calf_r');
  const side = new THREE.Vector3(Math.cos(ry), 0, -Math.sin(ry));
  A.root.rotation.order = 'YXZ'; A.root.rotation.set(Math.PI / 2 * 0.85, ry + Math.PI / 2, 0); resetPose(A);
  for (const [s, q] of [['l', 1], ['r', -1]]) { aim(B(A, 'thigh_' + s), B(A, 'calf_' + s), L(A, q * 0.2, -1, 0.5)); aim(B(A, 'calf_' + s), B(A, 'foot_' + s), L(A, q * 0.1, -0.3, -1)); }
  A.root.position.copy(chest).addScaledVector(side, -0.25); A.root.updateMatrixWorld(true); groundIt(A, MAT_Y, 0.06);
  const chA = WP(A, 'spine_03'); A.root.position.add(chest.clone().addScaledVector(side, -0.05).setY(chest.y + 0.22).sub(chA).setY(0)); A.root.updateMatrixWorld(true);
  handIK(A, 'r', knee.clone().add(new THREE.Vector3(0, 0.1, 0)), L(A, -0.6, 0.4, 0.2)); handIK(A, 'l', chest.clone().addScaledVector(side, 0.25).setY(MAT_Y + 0.05), L(A, 0.6, 0.4, 0));
}
// TRỌNG TÀI ĐẾM: nằm sấp nghiêng cạnh pin, đập tay xuống thảm 3 lần (k 0..1 → đập ở 0,2 / 0,5 / 0,8). Trả về số đếm hiện tại (0–3) + slap (true ở khung đập)
export function refCount(ref, k, x, z, ry = 0, maxCount = 3) {
  ref.root.rotation.order = 'YXZ'; ref.root.rotation.set(Math.PI / 2 * 0.7, ry, 0.15); resetPose(ref);
  for (const [s, q] of [['l', 1], ['r', -1]]) { aim(B(ref, 'thigh_' + s), B(ref, 'calf_' + s), L(ref, q * 0.25, -1, 0.3)); }
  ref.root.position.set(x, MAT_Y, z); ref.root.updateMatrixWorld(true); groundIt(ref, MAT_Y, 0.08);
  const beats = [0.2, 0.5, 0.8].slice(0, maxCount); let count = 0, slap = false, up = 1;
  for (const b of beats) { if (k >= b) count++; const d = k - b; if (d > -0.12 && d < 0.04) up = Math.min(up, cl(Math.abs(d + 0.0) / 0.1)); if (d >= 0 && d < 0.02) slap = true; }
  const mat = WP(ref, 'spine_03').addScaledVector(L(ref, 0, 0, 1), 0.35).addScaledVector(L(ref, -1, 0, 0), 0.25); mat.y = MAT_Y + 0.03 + up * 0.55;
  handIK(ref, 'r', mat, L(ref, -0.8, 0.5, 0)); aim(B(ref, 'neck_01'), B(ref, 'Head'), L(ref, 0, 0.3, 1));
  return { count, slap };
}
// LEO CỘT GÓC: corner = vị trí cột (thế giới, y bỏ qua); k 0..1: đi tới, bước dây 2, đứng dây trên cùng, quay mặt vào đài
export function climbTurnbuckle(ch, k, corner, t = 0) {
  const inward = new THREE.Vector3(-corner.x, 0, -corner.z).normalize(); const base = new THREE.Vector3(corner.x, 0, corner.z).addScaledVector(inward, 0.45);
  const top = new THREE.Vector3(corner.x, 0, corner.z).addScaledVector(inward, 0.18); const step1 = sm(k / 0.4), step2 = sm((k - 0.4) / 0.35), turn = sm((k - 0.75) / 0.25);
  upright(ch); const p = base.clone().lerp(top, Math.max(step1, step2)); ch.root.position.set(p.x, MAT_Y, p.z);
  ch.root.rotation.y = Math.atan2(-inward.x, -inward.z) + Math.PI * turn; ch.root.updateMatrixWorld(true);
  legs(ch, 0.2 + 0.2 * (1 - turn), 0.15, 0.3, 0.4 * (step1 - step2)); groundIt(ch, MAT_Y + lerp(0, 0.46, step1) + lerp(0, 0.76, step2), 0); ch.root.updateMatrixWorld(true);
  if (turn < 0.5) for (const [s, q] of [['l', 1], ['r', -1]]) handIK(ch, s, new THREE.Vector3(corner.x, MAT_Y + 1.25, corner.z).addScaledVector(inward, 0.05).add(L(ch, q * 0.25, 0, 0)), L(ch, q * 0.9, -0.3, -0.3));
  else taunt(ch, 'belt', sm((turn - 0.5) / 0.5), ch.root.position.x, ch.root.position.z, t, ch.root.position.y);
}
// BAY XUỐNG (splash): from = điểm đứng trên cột, to = điểm trên thảm (người nằm); u 0..1 — thân xoay úp ngang, tay chân dang; chạm ở u = 1
export function diveSplash(ch, u, from, to) {
  const e = sm(u); const p = from.clone().lerp(to, e); p.y = lerp(from.y, MAT_Y + 0.25, e) + Math.sin(Math.PI * Math.min(1, u * 1.1)) * 1.1;
  const d = to.clone().sub(from).setY(0).normalize(); ch.root.rotation.order = 'YXZ'; ch.root.rotation.set(lerp(0, Math.PI / 2, sm(u / 0.6)), Math.atan2(d.x, d.z), 0); resetPose(ch);
  for (const [s, q] of [['l', 1], ['r', -1]]) { aim(B(ch, 'upperarm_' + s), B(ch, 'lowerarm_' + s), L(ch, q, 0.25, 0.3)); aim(B(ch, 'lowerarm_' + s), B(ch, 'hand_' + s), L(ch, q, 0.4, 0.2)); aim(B(ch, 'thigh_' + s), B(ch, 'calf_' + s), L(ch, q * 0.35, -1, -0.15)); }
  ch.root.position.copy(p); ch.root.updateMatrixWorld(true); return { landed: u >= 0.98 };
}
// BẬT DÂY: chạy lùi lưng chạm dây ở cạnh `ropePoint` (thế giới) rồi bật ngược về `back`; k 0..1 (chạm 0,45). Trả về pushAmount để gọi ropes.push(side, null, amount)
export function ropeRebound(ch, k, start, ropePoint, back) {
  const inP = sm(k / 0.45), outP = sm((k - 0.5) / 0.5); const p = k < 0.5 ? start.clone().lerp(ropePoint, inP) : ropePoint.clone().lerp(back, outP);
  upright(ch); ch.root.position.set(p.x, MAT_Y, p.z); face(ch, k < 0.5 ? ropePoint : back); const ph = k * 16;
  legs(ch, 0.25, 0.3, 0.2, Math.sin(ph) * 0.6, 0); onMat(ch, p.x, p.z);
  for (const [s, q] of [['l', 1], ['r', -1]]) aim(B(ch, 'upperarm_' + s), B(ch, 'lowerarm_' + s), L(ch, q * 0.4, -0.6, Math.cos(ph + (s === 'l' ? 0 : Math.PI)) * 0.5));
  const push = Math.max(0, 1 - Math.abs(k - 0.47) / 0.08) * 0.35; return { push };
}
// GIƠ TAY NGƯỜI THẮNG: trọng tài nắm cổ tay phải người thắng giơ cao; k 0..1
export function raiseHand(ref, winner, k, x, z) {
  upright(winner); legs(winner, 0.1, -0.05, 0.25); onMat(winner, winner.root.position.x, winner.root.position.z);
  aim(B(winner, 'upperarm_r'), B(winner, 'lowerarm_r'), L(winner, -0.25, lerp(-1, 1, sm(k)), 0.05)); aim(B(winner, 'lowerarm_r'), B(winner, 'hand_r'), L(winner, -0.1, lerp(-0.6, 1, sm(k)), 0.05));
  upright(ref); ref.root.position.set(x, MAT_Y, z); face(ref, winner.root.position); legs(ref, 0.1, 0.0, 0.22); onMat(ref, x, z);
  handIK(ref, 'r', WP(winner, 'hand_r').add(new THREE.Vector3(0, -0.05, 0)), L(ref, -0.8, -0.3, -0.2));
}
// GIƠ ĐAI qua đầu (2 tay); belt = champBelt(); k 0..1
export function holdBeltUp(ch, belt, k, x, z, t = 0, y = MAT_Y) {
  taunt(ch, 'belt', k, x, z, t, y); const a = WP(ch, 'hand_l'), b = WP(ch, 'hand_r');
  belt.position.copy(a).add(b).multiplyScalar(0.5).add(new THREE.Vector3(0, 0.05, 0)); belt.quaternion.copy(ch.root.getWorldQuaternion(new THREE.Quaternion())); belt.updateMatrixWorld(true);
}
// ĐẬP GHẾ (gag hoạt hình): chair = steelChair(true); giơ cao 2 tay (0–0,5) rồi bổ xuống trước mặt (0,5–0,7). Trả về { impact }
export function chairSwing(ch, chair, k, x, z, ry = 0) {
  upright(ch); ch.root.rotation.y = ry; ch.root.position.set(x, MAT_Y, z); const up = sm(k / 0.5), down = sm((k - 0.5) / 0.2);
  legs(ch, 0.2 + 0.25 * down, 0.05 + 0.45 * down, 0.32, 0.2); onMat(ch, x, z);
  const hi = Wl(ch, 0, 2.15, -0.1), lo = Wl(ch, 0, 0.9, 0.75); const c = hi.clone().lerp(lo, down); const start = Wl(ch, 0, 1.1, 0.35); const hp = start.clone().lerp(c, up);
  for (const [s, q] of [['l', 1], ['r', -1]]) handIK(ch, s, hp.clone().add(L(ch, q * 0.17, 0, 0)), L(ch, q * 0.9, -0.3, -0.3));
  chair.position.copy(hp).add(L(ch, 0, 0.18, 0)); chair.quaternion.copy(ch.root.getWorldQuaternion(new THREE.Quaternion())); chair.rotateX(-Math.PI / 2 * down); chair.updateMatrixWorld(true);
  return { impact: k >= 0.69 && k < 0.73 };
}
