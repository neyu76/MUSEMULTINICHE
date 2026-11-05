// Động tác bóng rổ làm bằng code (thư viện clip không có): thế thủ, dẫn bóng, dang tay, ném, úp rổ, ném phạt, gồng tay ăn mừng, ngủ gục.
import * as THREE from 'three';
import { aim, resetPose, ik2, groundIt, rotW } from './tuthe.js';

const L = (ch, x, y, z) => new THREE.Vector3(x, y, z).applyQuaternion(ch.root.getWorldQuaternion(new THREE.Quaternion()));
const B = (ch, n) => ch.bones[n];
const lerp = (a, b, k) => a + (b - a) * k;
const cl = (x) => Math.min(1, Math.max(0, x));
const sm = (x) => { x = cl(x); return x * x * (3 - 2 * x); };
export const P = { cl, sm, lerp };

// thân + chân: crouch 0..1 (khuỵu gối), lean (cúi người), feet: độ dang chân
export function stance(ch, crouch = 0.4, lean = 0.15, feet = 0.18, sway = 0) {
  resetPose(ch);
  aim(B(ch, 'spine_01'), B(ch, 'spine_02'), L(ch, sway * 0.1, 1, lean));
  aim(B(ch, 'spine_03'), B(ch, 'neck_01'), L(ch, sway * 0.1, 1, lean * 0.6));
  aim(B(ch, 'neck_01'), B(ch, 'Head'), L(ch, 0, 1, -lean * 0.4));
  for (const [s, k] of [['l', 1], ['r', -1]]) {
    aim(B(ch, 'thigh_' + s), B(ch, 'calf_' + s), L(ch, k * feet, -1, 0.75 * crouch));
    aim(B(ch, 'calf_' + s), B(ch, 'foot_' + s), L(ch, k * feet * 0.6, -1, -0.45 * crouch));
    aim(B(ch, 'foot_' + s), B(ch, 'ball_' + s), L(ch, k * 0.1, -0.15, 1));
    aim(B(ch, 'upperarm_' + s), B(ch, 'lowerarm_' + s), L(ch, k * 0.28, -1, 0.15));
    aim(B(ch, 'lowerarm_' + s), B(ch, 'hand_' + s), L(ch, k * 0.12, -0.75, 0.6));
  }
}
const ground = (ch, x, z, y = 0) => { ch.root.position.set(x, 0, z); groundIt(ch, 0, 0.0); ch.root.position.y += y; ch.root.updateMatrixWorld(true); };
const handIK = (ch, s, T, pole) => ik2(ch, 'upperarm_' + s, 'lowerarm_' + s, 'hand_' + s, T, pole);
const fwd = (ch) => L(ch, 0, 0, 1), lat = (ch, k = 1) => L(ch, k, 0, 0);
export const handPos = (ch, s) => ch.bones['hand_' + s].getWorldPosition(new THREE.Vector3());
const midHands = (ch) => handPos(ch, 'l').add(handPos(ch, 'r')).multiplyScalar(0.5);

// dẫn bóng tay phải: trả về vị trí bóng (thế giới)
export function dribble(ch, t, x, z, hz = 1.6, crouch = 0.45, R = 0.12) {
  stance(ch, crouch, 0.22, 0.2, Math.sin(t * 2) * 0.3); ground(ch, x, z);
  const ph = (t * hz) % 1, h = Math.abs(Math.cos(Math.PI * ph)); // 1 ở tay, 0 chạm sàn
  const base = ch.root.position.clone().addScaledVector(lat(ch, -1), 0.42).addScaledVector(fwd(ch), 0.38);
  const top = base.clone(); top.y = ch.root.position.y + 0.9 * ch.root.scale.y;
  const bp = base.clone(); bp.y = R + h * (top.y - R);
  const hand = bp.clone(); hand.y = Math.max(bp.y + R, top.y - 0.12) + R * 0.6;
  handIK(ch, 'r', hand, L(ch, -0.6, -0.2, -0.8));
  handIK(ch, 'l', ch.root.position.clone().addScaledVector(lat(ch, 1), 0.45).addScaledVector(fwd(ch), 0.25).setY(ch.root.position.y + 1.0 * ch.root.scale.y), L(ch, 0.6, -0.3, -0.6));
  return bp;
}
// dang 2 tay (sải tay): k 0..1
export function wingspan(ch, k, x, z, t = 0) {
  stance(ch, 0.12, 0.02, 0.22); ground(ch, x, z);
  for (const [s, q] of [['l', 1], ['r', -1]]) {
    aim(B(ch, 'upperarm_' + s), B(ch, 'lowerarm_' + s), L(ch, q * lerp(0.28, 1, k), lerp(-1, 0.06, k), lerp(0.15, 0, k)));
    aim(B(ch, 'lowerarm_' + s), B(ch, 'hand_' + s), L(ch, q * lerp(0.12, 1, k), lerp(-0.75, 0.04 + Math.sin(t * 3) * 0.04 * k, k), lerp(0.6, 0, k)));
    aim(B(ch, 'hand_' + s), B(ch, (s === 'l' ? 'middle_01_l' : 'middle_01_r')) || B(ch, 'hand_' + s), L(ch, q, 0, 0));
  }
}
// cầm bóng trước ngực hai tay; trả về vị trí bóng
export function holdChest(ch, x, z, crouch = 0.2, t = 0, R = 0.12) {
  stance(ch, crouch, 0.1, 0.2); ground(ch, x, z);
  const c = ch.bones.spine_03.getWorldPosition(new THREE.Vector3()).addScaledVector(fwd(ch), 0.36); c.y -= 0.12;
  handIK(ch, 'l', c.clone().addScaledVector(lat(ch, 1), R * 0.95), L(ch, 0.8, -0.6, -0.2)); handIK(ch, 'r', c.clone().addScaledVector(lat(ch, -1), R * 0.95), L(ch, -0.8, -0.6, -0.2));
  return c;
}
// ném (nhảy ném 3 điểm / ném phạt): k 0..1 = hạ người 0–0,35, bật 0,35–0,6, buông bóng 0,6; jump: chiều cao nhảy
export function shoot(ch, k, x, z, jump = 0.35, R = 0.12) {
  const dip = sm(k / 0.3) * (1 - sm((k - 0.3) / 0.2)); const up = sm((k - 0.3) / 0.3); const air = Math.sin(Math.PI * cl((k - 0.35) / 0.55)) * jump;
  stance(ch, 0.15 + dip * 0.55, 0.06, 0.16); ground(ch, x, z, air);
  if (air > 0.02) for (const [s, q] of [['l', 1], ['r', -1]]) { aim(B(ch, 'calf_' + s), B(ch, 'foot_' + s), L(ch, 0, -1, -0.25)); aim(B(ch, 'foot_' + s), B(ch, 'ball_' + s), L(ch, 0, -0.8, 0.6)); }
  const head = ch.bones.Head.getWorldPosition(new THREE.Vector3());
  const set = ch.bones.spine_03.getWorldPosition(new THREE.Vector3()).addScaledVector(fwd(ch), 0.3); set.y -= 0.05;
  const rel = head.clone().addScaledVector(fwd(ch), 0.28 + 0.12 * cl((k - 0.6) / 0.2)); rel.y += 0.32 + 0.18 * cl((k - 0.55) / 0.2);
  const ball = set.clone().lerp(rel, up);
  handIK(ch, 'r', ball.clone().addScaledVector(fwd(ch), -R * 0.9).addScaledVector(lat(ch, -1), 0.03), L(ch, -0.4, -0.7, 0.2));
  handIK(ch, 'l', ball.clone().addScaledVector(lat(ch, 1), R * 0.95), L(ch, 0.8, -0.5, 0));
  if (k > 0.62) { // tay theo đà: cổ tay gập
    aim(B(ch, 'hand_r'), B(ch, 'middle_01_r') || B(ch, 'hand_r'), L(ch, 0, -0.6, 1));
  }
  return ball;
}
// úp rổ: nhân vật bay từ (x0,z0) tới dưới rổ; k 0..1; rim = tâm vành (thế giới); hai tay ôm bóng trên đầu rồi đập xuống, treo vành
export function dunk(ch, k, from, rim, R = 0.12, oneHand = false) {
  const kk = sm(k / 0.55); const hang = cl((k - 0.55) / 0.45);
  const p = from.clone().lerp(new THREE.Vector3(rim.x, 0, rim.z).addScaledVector(new THREE.Vector3(from.x - rim.x, 0, from.z - rim.z).normalize(), 0.42), kk);
  const air = Math.sin(Math.PI * Math.min(1, k / 0.55) * 0.5) * 1.35 * (1 - 0.12 * hang);
  stance(ch, 0.05, -0.08, 0.12);
  for (const [s, q] of [['l', 1], ['r', -1]]) { aim(B(ch, 'thigh_' + s), B(ch, 'calf_' + s), L(ch, q * 0.12, -1, s === 'l' ? 0.6 : -0.1)); aim(B(ch, 'calf_' + s), B(ch, 'foot_' + s), L(ch, 0, -1, -0.7)); }
  ch.root.position.set(p.x, 0, p.z); ch.root.updateMatrixWorld(true); groundIt(ch, 0, 0); ch.root.position.y += air; ch.root.updateMatrixWorld(true);
  const toRim = rim.clone().sub(ch.root.position).setY(0).normalize();
  const above = rim.clone().addScaledVector(toRim, -0.12); above.y += 0.28 - 0.3 * hang;
  const hold = ch.bones.Head.getWorldPosition(new THREE.Vector3()); hold.y += 0.35; hold.addScaledVector(toRim, 0.1);
  const ball = kk < 1 ? hold.clone().lerp(above, sm((k - 0.25) / 0.3)) : above.clone();
  if (hang > 0) ball.copy(rim).add(new THREE.Vector3(0, -0.32 - hang * 1.5, 0)).addScaledVector(toRim, 0.05);
  const rh = hang > 0 ? rim.clone().addScaledVector(toRim, -0.22).add(new THREE.Vector3(0, 0.02, 0)) : ball.clone().addScaledVector(toRim, -R * 0.8);
  handIK(ch, 'r', rh.clone().addScaledVector(lat(ch, -1), hang > 0 ? 0.12 : 0.04), L(ch, -0.5, -0.6, 0));
  if (oneHand && hang <= 0) aim(B(ch, 'upperarm_l'), B(ch, 'lowerarm_l'), L(ch, 0.7, 0.2, 0.3));
  else handIK(ch, 'l', (hang > 0 ? rim.clone().addScaledVector(toRim, -0.22) : ball.clone().addScaledVector(lat(ch, 1), R)).addScaledVector(lat(ch, 1), hang > 0 ? 0.12 : 0), L(ch, 0.5, -0.6, 0));
  return ball;
}
// gồng 2 tay ăn mừng (k 0..1), hét
export function flex(ch, k, x, z, t = 0) {
  stance(ch, 0.25, -0.05, 0.25); ground(ch, x, z);
  for (const [s, q] of [['l', 1], ['r', -1]]) {
    aim(B(ch, 'upperarm_' + s), B(ch, 'lowerarm_' + s), L(ch, q * 1, lerp(-1, 0.1, k), 0.05));
    aim(B(ch, 'lowerarm_' + s), B(ch, 'hand_' + s), L(ch, q * lerp(0.1, 0.15, k), lerp(-0.7, 1, k), 0.15 + Math.sin(t * 9) * 0.06 * k));
  }
  rotW(ch.bones.Head, L(ch, 1, 0, 0), -0.25 * k);
}
// ngồi ghế (khán giả): ngủ gục k 0..1 (đầu gục, vai xệ), wake: ngó nghiêng
export function seated(ch, x, z, y, sleep = 0, t = 0, seed = 0) {
  resetPose(ch);
  aim(B(ch, 'spine_01'), B(ch, 'spine_02'), L(ch, 0, 1, -0.12 + sleep * 0.15));
  aim(B(ch, 'spine_03'), B(ch, 'neck_01'), L(ch, Math.sin(seed) * 0.15 * sleep, 1, -0.05 + sleep * 0.35));
  aim(B(ch, 'neck_01'), B(ch, 'Head'), L(ch, Math.sin(seed * 3) * 0.5 * sleep, 1 - sleep * 0.4, sleep * 0.9 + Math.sin(t * 1.3 + seed) * 0.03));
  for (const [s, q] of [['l', 1], ['r', -1]]) {
    aim(B(ch, 'thigh_' + s), B(ch, 'calf_' + s), L(ch, q * 0.12, -0.05, 1));
    aim(B(ch, 'calf_' + s), B(ch, 'foot_' + s), L(ch, q * 0.05, -1, 0.1));
    aim(B(ch, 'foot_' + s), B(ch, 'ball_' + s), L(ch, 0, -0.1, 1));
    aim(B(ch, 'upperarm_' + s), B(ch, 'lowerarm_' + s), L(ch, q * (0.2 + sleep * 0.1), -1, 0.2));
    aim(B(ch, 'lowerarm_' + s), B(ch, 'hand_' + s), L(ch, -q * 0.3, -0.25, 1));
  }
  ch.root.position.set(x, 0, z); ch.root.updateMatrixWorld(true);
  const pv = ch.bones.pelvis.getWorldPosition(new THREE.Vector3()); ch.root.position.y += y + 0.06 - pv.y; ch.root.updateMatrixWorld(true);
}
// đứng buồn cúi đầu
export function slump(ch, x, z, t = 0, seed = 0) {
  stance(ch, 0.08, 0.3, 0.14); ground(ch, x, z);
  aim(B(ch, 'neck_01'), B(ch, 'Head'), L(ch, Math.sin(t * 0.7 + seed) * 0.1, 0.55, 0.85));
  for (const [s, q] of [['l', 1], ['r', -1]]) { aim(B(ch, 'upperarm_' + s), B(ch, 'lowerarm_' + s), L(ch, q * 0.12, -1, 0.12)); aim(B(ch, 'lowerarm_' + s), B(ch, 'hand_' + s), L(ch, q * 0.05, -1, 0.15)); }
}
// trọng tài tung bóng: k 0..1
export function toss(ch, k, x, z) {
  stance(ch, 0.1 + 0.2 * (1 - k), 0.05, 0.16); ground(ch, x, z);
  aim(B(ch, 'upperarm_r'), B(ch, 'lowerarm_r'), L(ch, -0.15, lerp(-0.3, 1, sm(k)), lerp(0.9, 0.2, k)));
  aim(B(ch, 'lowerarm_r'), B(ch, 'hand_r'), L(ch, 0, lerp(0.2, 1, sm(k)), lerp(0.9, 0.1, k)));
}
// thủ: hai tay giơ cao chắn, nhún
export function defend(ch, t, x, z, seed = 0, up = 0.5) {
  stance(ch, 0.5 + Math.sin(t * 5 + seed) * 0.08, 0.2, 0.3, Math.sin(t * 2 + seed) * 0.4); ground(ch, x, z);
  for (const [s, q] of [['l', 1], ['r', -1]]) {
    aim(B(ch, 'upperarm_' + s), B(ch, 'lowerarm_' + s), L(ch, q * 0.8, lerp(-0.2, 0.8, up), 0.3));
    aim(B(ch, 'lowerarm_' + s), B(ch, 'hand_' + s), L(ch, q * 0.3, lerp(0.2, 1, up), 0.3));
  }
}
