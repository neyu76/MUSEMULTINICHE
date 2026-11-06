// Động tác bóng chày làm bằng code (thư viện clip không có): thế đánh, vung gậy, ném bóng (pitch), chờ bắt, bắt bóng, catcher ngồi,
// trượt vào base, trọng tài ra hiệu, tung hứng gậy. Cùng kiểu với bongro.js (aim/ik2/groundIt trên xương UBC).
// Quy ước: hệ toạ độ CỦA NHÂN VẬT: +z phía trước, +x bên TRÁI nhân vật, +y lên. Gọi resetPose qua stance() ở mỗi khung.
// Người đánh tay phải (RH): đứng ô bên base 3 (x ≈ +0,95 so với home), quay mặt về home: root.rotation.y = -Math.PI/2 → người ném ở bên TRÁI.
// Người ném: đứng trên gò (z = 18,44), quay mặt về home: root.rotation.y = Math.PI.
import * as THREE from 'three';
import { aim, resetPose, ik2, groundIt, rotW } from './tuthe.js';

const L = (ch, x, y, z) => new THREE.Vector3(x, y, z).applyQuaternion(ch.root.getWorldQuaternion(new THREE.Quaternion()));
const B = (ch, n) => ch.bones[n];
const lerp = (a, b, k) => a + (b - a) * k;
const cl = (x) => Math.min(1, Math.max(0, x));
const sm = (x) => { x = cl(x); return x * x * (3 - 2 * x); };
export const P = { cl, sm, lerp };
const handIK = (ch, s, T, pole) => ik2(ch, 'upperarm_' + s, 'lowerarm_' + s, 'hand_' + s, T, pole);
const ground = (ch, x, z, y = 0) => { ch.root.position.set(x, 0, z); ch.root.updateMatrixWorld(true); groundIt(ch, 0, 0.0); ch.root.position.y += y; ch.root.updateMatrixWorld(true); };
const W = (ch, x, y, z) => ch.root.position.clone().add(L(ch, x * ch.root.scale.y, y * ch.root.scale.y, z * ch.root.scale.y)); // điểm theo hệ nhân vật, có tỉ lệ chiều cao

// thân + chân chung: crouch 0..1, lean (cúi), feet (dang chân sang 2 bên), stride (chân trái bước lên trước)
export function legs(ch, crouch = 0.3, lean = 0.1, feet = 0.3, stride = 0, twist = 0) {
  resetPose(ch);
  aim(B(ch, 'spine_01'), B(ch, 'spine_02'), L(ch, 0, 1, lean));
  aim(B(ch, 'spine_03'), B(ch, 'neck_01'), L(ch, 0, 1, lean * 0.6));
  for (const [s, k] of [['l', 1], ['r', -1]]) {
    const st = s === 'l' ? stride : -stride * 0.3;
    aim(B(ch, 'thigh_' + s), B(ch, 'calf_' + s), L(ch, k * feet, -1, 0.7 * crouch + st));
    aim(B(ch, 'calf_' + s), B(ch, 'foot_' + s), L(ch, k * feet * 0.5, -1, -0.45 * crouch + st * 0.4));
    aim(B(ch, 'foot_' + s), B(ch, 'ball_' + s), L(ch, k * 0.15, -0.15, 1));
  }
  if (twist) { const up = L(ch, 0, 1, 0); rotW(B(ch, 'spine_02'), up, twist * 0.55); rotW(B(ch, 'spine_03'), up, twist * 0.45); }
}
// đặt gậy theo 2 tay: tâm 2 tay + hướng gậy (thế giới). Gậy từ bat() trong mlb.js (cán ở gốc, đầu gậy +y)
const _Y = new THREE.Vector3(0, 1, 0);
export function placeBat(batObj, handsMid, dir) {
  if (!batObj) return; const d = dir.clone().normalize(); batObj.quaternion.setFromUnitVectors(_Y, d);
  batObj.position.copy(handsMid).addScaledVector(d, -0.125 * batObj.scale.y); batObj.updateMatrixWorld(true);
}
// THẾ ĐÁNH (RH): chân rộng, gối khuỵu, 2 tay cầm gậy sau vai phải, gậy dựng chéo; t: nhấp nhô gậy nhẹ
export function batStance(ch, x, z, t = 0, batObj = null, seed = 0) {
  legs(ch, 0.38, 0.18, 0.34, 0, 0.1); ground(ch, x, z);
  aim(B(ch, 'neck_01'), B(ch, 'Head'), L(ch, 0.75, 0.75, 0.3)); // nhìn về người ném (bên trái)
  const wag = Math.sin(t * 2.6 + seed) * 0.08;
  const hands = W(ch, -0.2, 1.34, 0.12);
  const dir = L(ch, -0.35 + wag, 1, -0.3);
  handIK(ch, 'r', hands.clone().addScaledVector(dir.clone().normalize(), 0.05), L(ch, -0.8, -0.6, -0.2));
  handIK(ch, 'l', hands.clone().addScaledVector(dir.clone().normalize(), -0.04), L(ch, 0.5, -0.8, 0.2));
  placeBat(batObj, hands, dir); return { hands, dir };
}
// VUNG GẬY (RH): k 0..1 — 0–0,25 lấy đà (tay lùi), 0,25–0,55 vung qua vùng đánh (chạm bóng ≈ 0,45), 0,55–1 theo đà quấn ra sau vai trái.
// Trả về { hands, dir, tip, contact } — contact = điểm trên gậy ở k ≈ 0,45 để đặt quả bóng / tia sáng chạm.
export function swing(ch, k, x, z, batObj = null) {
  const load = sm(k / 0.25) * (1 - sm((k - 0.25) / 0.15)); const sw = sm((k - 0.25) / 0.3); const fol = sm((k - 0.55) / 0.45);
  legs(ch, 0.38 - 0.1 * sw, 0.18, 0.34, 0.15 * sw, 0.1 - 0.25 * load + 1.3 * sw + 0.4 * fol); ground(ch, x, z);
  aim(B(ch, 'neck_01'), B(ch, 'Head'), L(ch, lerp(0.75, 0.2, sw), 0.7, lerp(0.3, 0.6, sw)));
  // góc gậy trong mặt phẳng ngang: -90° (chĩa ra sau, về catcher) → 0° (chĩa về phía home, chạm bóng) → +90° (về người ném) → +160° (quấn sau)
  const phi = THREE.MathUtils.degToRad(lerp(lerp(-90, -105, load), 90, sw) + 70 * fol);
  const elev = THREE.MathUtils.degToRad(lerp(62, 4, sm((k - 0.25) / 0.2)) + 36 * fol);
  const hz = new THREE.Vector3(Math.sin(phi), 0, Math.cos(phi)); // trong hệ nhân vật: x = trái, z = trước
  const dirLocal = hz.clone().multiplyScalar(Math.cos(elev)).setY(Math.sin(elev));
  const dir = L(ch, dirLocal.x, dirLocal.y, dirLocal.z);
  const hp = new THREE.Vector3(lerp(-0.2, 0.08, sw) + 0.28 * fol, lerp(1.34, 1.02, sm((k - 0.25) / 0.2)) + 0.26 * fol, lerp(0.12, 0.38, sw) - 0.3 * fol);
  hp.x -= 0.06 * load; const hands = W(ch, hp.x, hp.y, hp.z);
  const nd = dir.clone().normalize();
  handIK(ch, 'r', hands.clone().addScaledVector(nd, 0.05), L(ch, -0.6, -0.7, -0.3));
  handIK(ch, 'l', hands.clone().addScaledVector(nd, -0.04), L(ch, 0.6, -0.6, 0.2));
  placeBat(batObj, hands, dir);
  const tip = hands.clone().addScaledVector(nd, 0.72 * (batObj ? batObj.scale.y : 1)), contact = hands.clone().addScaledVector(nd, 0.6);
  return { hands, dir, tip, contact };
}
// NÉM BÓNG (pitch, tay phải): k 0..1 — 0–0,35 nhấc gối trái, 2 tay chụm ngực; 0,35–0,62 bước dài + tay phải vòng ra sau;
// 0,62–0,72 tay vung qua đầu, nhả bóng ở 0,7; 0,72–1 theo đà cúi người. Trả về { ball, released } (bóng trong tay phải tới khi nhả).
export function pitch(ch, k, x, z) {
  const lift = sm(k / 0.3) * (1 - sm((k - 0.33) / 0.12)); const str = sm((k - 0.35) / 0.27); const arm = sm((k - 0.55) / 0.17); const fol = sm((k - 0.72) / 0.28);
  legs(ch, 0.12 + 0.3 * str, 0.05 + 0.5 * fol, 0.12, 0.55 * str, -0.6 * str * (1 - arm) + 0.7 * arm);
  aim(B(ch, 'thigh_l'), B(ch, 'calf_l'), L(ch, 0.1, lerp(-1, 0.25, lift), lerp(0.2, 1, lift) + 0.6 * str));
  aim(B(ch, 'calf_l'), B(ch, 'foot_l'), L(ch, 0.05, -1, lerp(-0.3, 0.1, lift) + 0.3 * str));
  ground(ch, x, z, 0); ch.root.position.addScaledVector(L(ch, 0, 0, 1), 0.35 * str * ch.root.scale.y); ch.root.updateMatrixWorld(true);
  aim(B(ch, 'neck_01'), B(ch, 'Head'), L(ch, 0, 0.6 - 0.3 * fol, 1)); // nhìn về home
  const chest = W(ch, 0, 1.25, 0.25);
  // tay phải: chụm ngực → vòng ra sau thấp → cao sau đầu → vung qua trước → xuống chéo đầu gối trái
  const back = W(ch, -0.55, 1.35, -0.45), over = W(ch, -0.3, 1.85, 0.05), front = W(ch, 0.05, 1.45, 0.75), low = W(ch, 0.35, 0.75, 0.55);
  let hand;
  if (k < 0.35) hand = chest.clone().addScaledVector(L(ch, -1, 0, 0), 0.04);
  else if (k < 0.55) hand = chest.clone().lerp(back, sm((k - 0.35) / 0.2));
  else if (k < 0.66) hand = back.clone().lerp(over, sm((k - 0.55) / 0.11));
  else if (k < 0.72) hand = over.clone().lerp(front, sm((k - 0.66) / 0.06));
  else hand = front.clone().lerp(low, fol);
  handIK(ch, 'r', hand, L(ch, -0.7, -0.5, -0.4));
  const glove = k < 0.35 ? chest.clone().addScaledVector(L(ch, 1, 0, 0), 0.06) : W(ch, lerp(0.35, 0.25, arm), lerp(1.3, 1.0, fol), lerp(0.55, 0.1, arm));
  handIK(ch, 'l', glove, L(ch, 0.7, -0.4, 0.2));
  const released = k >= 0.7; return { ball: hand.clone(), released };
}
// quỹ đạo bóng ném: từ điểm nhả tới vùng đánh; u 0..1; drop: độ rơi (m) giữa đường (bóng cong)
export function pitchPath(from, to, u, drop = 0.25) { const p = from.clone().lerp(to, u); p.y -= Math.sin(Math.PI * u) * drop * 0.3 + drop * u * u * 0.7; return p; }
// CHỜ BẮT (cầu thủ phòng ngự): khuỵu thấp, 2 tay trước gối, nhún nhẹ
export function fielderReady(ch, x, z, t = 0, seed = 0) {
  legs(ch, 0.55 + Math.sin(t * 4 + seed) * 0.04, 0.4, 0.38); ground(ch, x, z);
  aim(B(ch, 'neck_01'), B(ch, 'Head'), L(ch, 0, 0.5, 1));
  for (const [s, q] of [['l', 1], ['r', -1]]) handIK(ch, s, W(ch, q * 0.18, 0.62, 0.42), L(ch, q * 0.8, -0.2, -0.4));
}
// BẮT BÓNG bằng găng tay trái: đưa găng tới target (thế giới) theo k; nhảy nếu target cao
export function catchBall(ch, x, z, target, k = 1) {
  const hi = cl((target.y - 1.6) / 1.0); legs(ch, 0.25 - 0.2 * hi, 0.12, 0.25); ground(ch, x, z, hi * 0.45 * sm(k));
  const rest = W(ch, 0.25, 1.05, 0.35); const g = rest.clone().lerp(target, sm(k));
  handIK(ch, 'l', g, L(ch, 0.8, -0.4, -0.3));
  handIK(ch, 'r', g.clone().addScaledVector(L(ch, -1, 0, 0), 0.12).addScaledVector(L(ch, 0, -1, 0), 0.05), L(ch, -0.8, -0.4, -0.3));
  aim(B(ch, 'neck_01'), B(ch, 'Head'), target.clone().sub(B(ch, 'neck_01').getWorldPosition(new THREE.Vector3())));
}
// CATCHER ngồi xổm sau home, găng giơ trước làm đích
export function catcherSquat(ch, x, z, t = 0) {
  resetPose(ch);
  aim(B(ch, 'spine_01'), B(ch, 'spine_02'), L(ch, 0, 1, 0.35)); aim(B(ch, 'spine_03'), B(ch, 'neck_01'), L(ch, 0, 1, 0.15));
  for (const [s, k] of [['l', 1], ['r', -1]]) { aim(B(ch, 'thigh_' + s), B(ch, 'calf_' + s), L(ch, k * 0.55, -0.15, 1)); aim(B(ch, 'calf_' + s), B(ch, 'foot_' + s), L(ch, k * 0.1, -1, -0.55)); aim(B(ch, 'foot_' + s), B(ch, 'ball_' + s), L(ch, k * 0.2, -0.2, 1)); }
  ground(ch, x, z); aim(B(ch, 'neck_01'), B(ch, 'Head'), L(ch, 0, 0.4, 1));
  handIK(ch, 'l', W(ch, 0.12, 0.72 + Math.sin(t * 3) * 0.015, 0.55), L(ch, 0.8, -0.4, -0.2));
  handIK(ch, 'r', W(ch, -0.22, 0.5, 0.15), L(ch, -0.8, -0.2, -0.3));
}
// TRƯỢT VÀO BASE (chân trước): k 0..1 di chuyển from→to (thế giới, y bỏ qua); thân ngả ra sau gần nằm, chân trái duỗi, chân phải gập
export function slide(ch, k, from, to) {
  const u = sm(k); const p = from.clone().lerp(to, u); ch.root.rotation.order = 'YXZ';
  const dir = to.clone().sub(from).setY(0).normalize(); ch.root.rotation.y = Math.atan2(dir.x, dir.z); ch.root.rotation.x = -lerp(0.2, 1.15, sm(k / 0.4));
  resetPose(ch);
  aim(B(ch, 'thigh_l'), B(ch, 'calf_l'), L(ch, 0.1, -1, 0.05)); aim(B(ch, 'calf_l'), B(ch, 'foot_l'), L(ch, 0.05, -1, 0.1));
  aim(B(ch, 'thigh_r'), B(ch, 'calf_r'), L(ch, -0.25, -0.6, 0.6)); aim(B(ch, 'calf_r'), B(ch, 'foot_r'), L(ch, -0.15, -1, -0.6));
  for (const [s, q] of [['l', 1], ['r', -1]]) { aim(B(ch, 'upperarm_' + s), B(ch, 'lowerarm_' + s), L(ch, q * 0.9, 0.5, 0.1)); aim(B(ch, 'lowerarm_' + s), B(ch, 'hand_' + s), L(ch, q * 0.5, 1, 0)); }
  ch.root.position.set(p.x, 0, p.z); ch.root.updateMatrixWorld(true); groundIt(ch, 0, 0.02);
  return p; // điểm hiện tại — đặt bụi (hieuung.dust) ở đây
}
// TRỌNG TÀI ra hiệu: kind 'out' (nắm tay phải đấm lên), 'safe' (2 tay dang ngang), 'strike' (tay phải đấm sang bên); k 0..1
export function umpireCall(ch, kind, k, x, z) {
  legs(ch, 0.15, 0.05, 0.2); ground(ch, x, z); const e = sm(k);
  if (kind === 'safe') { for (const [s, q] of [['l', 1], ['r', -1]]) { aim(B(ch, 'upperarm_' + s), B(ch, 'lowerarm_' + s), L(ch, q, lerp(-0.2, 0.05, e), lerp(0.6, 0, e))); aim(B(ch, 'lowerarm_' + s), B(ch, 'hand_' + s), L(ch, q, 0.02, 0)); } }
  else if (kind === 'out') { aim(B(ch, 'upperarm_r'), B(ch, 'lowerarm_r'), L(ch, -0.6, lerp(-0.6, 0.25, e), 0.2)); aim(B(ch, 'lowerarm_r'), B(ch, 'hand_r'), L(ch, -0.1, lerp(-0.2, 1, e), 0.15)); }
  else { aim(B(ch, 'upperarm_r'), B(ch, 'lowerarm_r'), L(ch, -lerp(0.4, 1, e), lerp(-0.6, 0.15, e), 0.1)); aim(B(ch, 'lowerarm_r'), B(ch, 'hand_r'), L(ch, -lerp(0.3, 1, e), lerp(0.2, 0.1, e), lerp(0.6, 0, e))); rotW(B(ch, 'spine_03'), L(ch, 0, 1, 0), -0.25 * e); }
}
// TUNG GẬY (bat flip) sau cú đánh: gậy bay xoay, hạ xuống đất ở điểm `land`; u 0..1 từ lúc rời tay
export function batFlip(batObj, from, land, u) { const p = from.clone().lerp(land, u); p.y = lerp(from.y, land.y, u) + Math.sin(Math.PI * u) * 1.2; batObj.position.copy(p); batObj.rotation.set(u * 9, 0.4, u * 4); batObj.updateMatrixWorld(true); }
