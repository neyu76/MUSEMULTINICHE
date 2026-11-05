// Tập 3: dàn Chargers + 11 ma-nơ-canh + tư thế bóng bầu dục (giao bóng, lùi ném, ném, sút, ngáp, ăn mừng, cúi đầu).
// Nhận diện (nguồn chargers.com + sportslogos.net, 11/2026): áo nhà xanh bột (powder blue), số trắng viền vàng,
// quần trắng sọc vàng, mũ trắng lưới chắn mặt vàng; KHÔNG vẽ tia sét logo.
import * as THREE from 'three';
import { makeCharacter } from './nhanvat2.js';
import { aim, ik2, rotW, resetPose, groundIt } from './tuthe.js';

export const LAC = { blue: '#62aee8', gold: '#ffc20e', navy: '#0b2340' };
const BASE = { edgeSoft: 1, skinMix: 1, brows: false, eyeScale: 2.3, frontNumberSize: 0.72, backNumberSize: 0.95, numberDrop: 0.1,
  smooth: { jersey: 12, pants: 10, socks: 6, shoes: 10, skin: 4, head: 8 }, puff: { jersey: 0.03, pants: 0.014, socks: 0.006, shoes: 0.02, skin: 0, hand: 0 } };
export const CHARGERS = { ...BASE, jersey: LAC.blue, numberColor: '#ffffff', numberOutline: LAC.gold, pants: '#f4f4f2', pantsStripes: [LAC.gold], socks: LAC.blue, shoes: '#f4f4f4', gloves: '#f4f4f4',
  backNameMax: 150, helmet: '#f6f6f4', helmetStripe: [], helmetMetal: 0.2, mask: LAC.gold, maskThick: 0.085, maskY: -0.1, collar: LAC.gold, build: 'fit', shoulders: 'wide' };

export const CAST3 = {
  // Justin Herbert: số 10, 1,98 m, 236 lb — cao to, da trắng
  herbert: (lib, o = {}) => makeCharacter(lib, { ...CHARGERS, skin: '#f0c8a6', number: 10, backName: 'HERBERT', heightM: 1.98, ...o }),
  // Cameron Dicker: số 11, 1,85 m, 216 lb
  dicker: (lib, o = {}) => makeCharacter(lib, { ...CHARGERS, skin: '#eec7a4', number: 11, backName: 'DICKER', heightM: 1.85, build: null, shoulders: null, ...o }),
  bolt: (lib, o = {}) => makeCharacter(lib, { ...CHARGERS, skin: '#8a5634', number: 70, heightM: 1.93, build: 'big', ...o }),
};

// Ma-nơ-canh: thân người mẫu trơn bóng màu ngà, không mặt, khớp tròn ở vai/khuỷu/cổ tay/gối, cọc inox + đế tròn,
// mũ bảo hiểm trắng trơn (lưới xám). opts.tag = chuỗi trên mác giá treo cổ (vd 'SALE').
const _mq = {};
export function makeMannequin(lib, o = {}) {
  const ch = makeCharacter(lib, { ...BASE, skin: '#efece6', jersey: '#efece6', pants: '#efece6', socks: '#efece6', shoes: '#efece6', number: null, hair: null, beard: false, brows: false,
    helmet: o.helmet === false ? null : '#f2f2ef', helmetStripe: [], helmetMetal: 0.05, mask: '#9aa0a8', maskThick: 0.06, maskY: -0.1, heightM: o.heightM ?? 1.86, body: o.body || 'male', build: o.build || null });
  const shell = _mq.shell || (_mq.shell = new THREE.MeshPhysicalMaterial({ color: '#f1eee8', roughness: 0.26, clearcoat: 0.9, clearcoatRoughness: 0.18, sheen: 0.0 }));
  const joint = _mq.joint || (_mq.joint = new THREE.MeshPhysicalMaterial({ color: '#d9d4cb', roughness: 0.3, clearcoat: 0.7 }));
  ch.root.traverse((n) => { if (n.isSkinnedMesh && /Superhero/.test(n.name + (n.userData.nm || '')) || (n.isSkinnedMesh && n.material && n.material.userData && n.material.userData.uni)) { n.material = shell; } });
  ch.root.updateMatrixWorld(true); const sc = ch.root.scale.x;
  const ball = (bone, r) => { const b = ch.bones[bone]; const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), joint); m.castShadow = true; b.add(m); m.scale.setScalar(1 / sc); return m; };
  for (const s of ['l', 'r']) { ball('upperarm_' + s, 0.062); ball('lowerarm_' + s, 0.048); ball('hand_' + s, 0.038); ball('calf_' + s, 0.062); ball('thigh_' + s, 0.07); }
  ball('neck_01', 0.055);
  // cọc inox + đế tròn (gắn vào bắp chân phải, đế nằm trên mặt đất — cập nhật vị trí trong standBase)
  const steel = new THREE.MeshStandardMaterial({ color: '#d8dde3', metalness: 0.95, roughness: 0.18 });
  const base = new THREE.Group(); const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.025, 40), steel); plate.position.y = 0.0125; base.add(plate);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 10), steel); rod.position.y = 0.5; base.add(rod); base.userData.rod = rod; base.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  ch.stand = base; ch.root.parent ? ch.root.parent.add(base) : null; ch.isMannequin = true;
  if (o.tag) { // mác giá: dây mảnh + thẻ đỏ "SALE –50%"
    const c = document.createElement('canvas'); c.width = 256; c.height = 384; const g = c.getContext('2d');
    g.fillStyle = '#e1251b'; g.fillRect(0, 0, 256, 384); g.fillStyle = '#fff'; g.beginPath(); g.arc(128, 40, 16, 0, 7); g.fill();
    g.font = '900 92px Anton, Impact, sans-serif'; g.textAlign = 'center'; g.fillText(o.tag, 128, 190); g.font = '900 84px Anton, Impact'; g.fillText('-50%', 128, 310);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const card = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.165), new THREE.MeshStandardMaterial({ map: t, side: THREE.DoubleSide, roughness: 0.7 }));
    const str = new THREE.Mesh(new THREE.CylinderGeometry(0.0015, 0.0015, 0.09, 4), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
    const tg = new THREE.Group(); str.position.y = 0.045; card.position.set(0, -0.08, 0); tg.add(str, card);
    const hand = ch.bones.hand_r; hand.add(tg); tg.scale.setScalar(1 / sc); tg.position.set(0, 0.0, 0); ch.tag = tg; }
  return ch;
}
// đặt đế ma-nơ-canh dưới chân phải, cọc lên tới bắp chân
export function standBase(ch) {
  if (!ch.stand) return; ch.root.updateMatrixWorld(true);
  const k = ch.bones.calf_r.getWorldPosition(new THREE.Vector3()), f = ch.bones.foot_r.getWorldPosition(new THREE.Vector3());
  const p = k.clone().lerp(f, 0.5); ch.stand.position.set(p.x - 0.0, 0, p.z); const h = Math.max(0.05, p.y); ch.stand.userData.rod.scale.y = h; ch.stand.userData.rod.position.y = h / 2; ch.stand.visible = ch.root.visible;
}

const L = (ch, x, y, z) => new THREE.Vector3(x, y, z).applyQuaternion(ch.root.getWorldQuaternion(new THREE.Quaternion()));
const B = (ch, n) => ch.bones[n];
const legs = (ch, bend = 0.15, spread = 0.18, stag = 0) => {
  for (const [s, k] of [['l', 1], ['r', -1]]) { const st = s === 'l' ? stag : -stag;
    aim(B(ch, 'thigh_' + s), B(ch, 'calf_' + s), L(ch, k * spread * 0.5, -1, bend + st));
    aim(B(ch, 'calf_' + s), B(ch, 'foot_' + s), L(ch, k * spread * 0.3, -1, -bend * 0.9 + st * 0.3));
    aim(B(ch, 'foot_' + s), B(ch, 'ball_' + s), L(ch, k * 0.1, -0.15, 1)); } };
const place = (ch, x, z) => { ch.root.position.set(x, 0, z); ch.root.updateMatrixWorld(true); groundIt(ch, 0, 0.01); };

// Ma-nơ-canh tạo dáng điệu đà (đứng im tuyệt đối): kiểu 0–5
export function mannequinPose(ch, kind, x, z) {
  resetPose(ch); ch.root.position.set(x, 0, z);
  const up = (s, k, a, b) => { aim(B(ch, 'upperarm_' + s), B(ch, 'lowerarm_' + s), L(ch, ...a)); aim(B(ch, 'lowerarm_' + s), B(ch, 'hand_' + s), L(ch, ...b)); };
  legs(ch, 0.02, 0.2, kind % 2 ? 0.12 : 0);
  if (kind === 0) { up('l', 1, [0.35, -0.75, 0.15], [-0.4, 0.2, 0.5]); up('r', -1, [-0.35, -0.75, 0.15], [0.4, 0.2, 0.5]); } // tay chống hông (nửa)
  if (kind === 1) { up('l', 1, [0.25, 0.95, 0.15], [0.05, 1, 0.1]); up('r', -1, [-0.5, -0.85, 0.1], [-0.15, -1, 0.3]); } // giơ 1 tay cao
  if (kind === 2) { up('l', 1, [0.4, -0.3, 0.86], [0.0, 0.1, 1]); up('r', -1, [-0.4, -0.3, 0.86], [0.0, 0.1, 1]); } // 2 tay đưa ra trước (đỡ bóng)
  if (kind === 3) { up('l', 1, [1, -0.05, 0.1], [1, 0.05, 0.1]); up('r', -1, [-1, -0.05, 0.1], [-1, 0.05, 0.1]); } // dang tay chữ T
  if (kind === 4) { up('l', 1, [0.2, -0.95, 0.05], [0.1, -1, 0.15]); up('r', -1, [-0.6, 0.35, 0.6], [0.3, 0.9, 0.2]); } // tay chạm cằm "suy tư"
  if (kind === 5) { up('l', 1, [0.15, -0.98, 0.1], [0.12, -1, 0.15]); up('r', -1, [-0.15, -0.98, 0.1], [-0.12, -1, 0.15]); } // đứng thẳng xuôi tay
  rotW(B(ch, 'Head'), L(ch, 0, 0, 1), [0.12, -0.1, 0, 0.15, -0.2, 0][kind] || 0);
  ch.root.updateMatrixWorld(true); groundIt(ch, 0, 0.01); standBase(ch);
}

// QB cầm bóng 2 tay trước ngực (lùi về sau thì gọi cùng vị trí khác); trả về vị trí bóng
export function qbHold(ch, x, z, t = 0, crouch = 0.25) {
  resetPose(ch); ch.root.position.set(x, 0, z); legs(ch, crouch, 0.34, 0);
  aim(B(ch, 'spine_01'), B(ch, 'spine_02'), L(ch, 0, 1, 0.12 + crouch * 0.2)); rotW(B(ch, 'Head'), L(ch, 1, 0, 0), -0.12);
  place(ch, x, z); const sc = ch.root.scale.x;
  const c = B(ch, 'spine_03').getWorldPosition(new THREE.Vector3()).add(L(ch, 0, -0.05 * sc, 0.3 * sc)).add(new THREE.Vector3(0, Math.sin(t * 2) * 0.01, 0));
  for (const [s, k] of [['l', 1], ['r', -1]]) ik2(ch, 'upperarm_' + s, 'lowerarm_' + s, 'hand_' + s, c.clone().add(L(ch, k * 0.06 * sc, 0, 0)), L(ch, k, -0.4, -0.3));
  return c;
}
// ném bóng: k 0 (bóng sau tai) → 1 (tay vươn ra trước). Trả về vị trí bàn tay phải
export function qbThrow(ch, x, z, k) {
  resetPose(ch); ch.root.position.set(x, 0, z); legs(ch, 0.15, 0.36, 0.18 * (1 - 2 * k));
  aim(B(ch, 'spine_01'), B(ch, 'spine_02'), L(ch, 0, 1, -0.15 + k * 0.4));
  rotW(B(ch, 'spine_03'), L(ch, 0, 1, 0), 0.6 - k * 1.1);
  place(ch, x, z); const sc = ch.root.scale.x;
  const sh = B(ch, 'upperarm_r').getWorldPosition(new THREE.Vector3());
  const a0 = sh.clone().add(L(ch, -0.12 * sc, 0.25 * sc, -0.32 * sc)), a1 = sh.clone().add(L(ch, -0.05 * sc, -0.05 * sc, 0.6 * sc));
  const T = a0.clone().lerp(a1, k); T.y += Math.sin(Math.PI * k) * 0.18 * sc;
  ik2(ch, 'upperarm_r', 'lowerarm_r', 'hand_r', T, L(ch, -0.6, -0.6, -0.3));
  const lt = B(ch, 'upperarm_l').getWorldPosition(new THREE.Vector3()).add(L(ch, 0.1 * sc, -0.05 * sc + 0.1 * (1 - k), 0.5 * sc * (1 - k * 0.6)));
  ik2(ch, 'upperarm_l', 'lowerarm_l', 'hand_l', lt, L(ch, 1, -0.5, 0));
  return B(ch, 'hand_r').getWorldPosition(new THREE.Vector3());
}
// sút bóng: k 0 (chân phải kéo sau) → 0,5 chạm bóng → 1 (chân vung cao)
export function kick(ch, x, z, k) {
  resetPose(ch); ch.root.position.set(x, 0, z);
  const sw = k < 0.5 ? -0.9 + k * 2 * 1.0 : 0.1 + (k - 0.5) * 2 * 1.5; // góc vung đùi phải (âm = sau)
  aim(B(ch, 'thigh_l'), B(ch, 'calf_l'), L(ch, 0.12, -1, 0.1)); aim(B(ch, 'calf_l'), B(ch, 'foot_l'), L(ch, 0.05, -1, -0.05)); aim(B(ch, 'foot_l'), B(ch, 'ball_l'), L(ch, 0.1, -0.1, 1));
  aim(B(ch, 'thigh_r'), B(ch, 'calf_r'), L(ch, -0.08, -Math.cos(sw), Math.sin(sw)));
  const cb = k < 0.45 ? 0.9 : Math.max(0, 0.9 - (k - 0.45) * 4); aim(B(ch, 'calf_r'), B(ch, 'foot_r'), L(ch, -0.05, -Math.cos(sw - cb), Math.sin(sw - cb)));
  aim(B(ch, 'foot_r'), B(ch, 'ball_r'), L(ch, 0, -0.3, 1));
  aim(B(ch, 'spine_01'), B(ch, 'spine_02'), L(ch, 0, 1, -0.12 - k * 0.15));
  for (const [s, kk] of [['l', 1], ['r', -1]]) { aim(B(ch, 'upperarm_' + s), B(ch, 'lowerarm_' + s), L(ch, kk * 0.75, -0.65 + (s === 'l' ? k * 0.35 : 0), s === 'l' ? 0.35 : -0.25)); aim(B(ch, 'lowerarm_' + s), B(ch, 'hand_' + s), L(ch, kk * 0.6, -0.35, 0.35)); }
  ch.root.updateMatrixWorld(true); groundIt(ch, 0, 0.01);
  return B(ch, 'ball_r').getWorldPosition(new THREE.Vector3());
}
// vươn vai ngáp (k 0→1→0 theo thời gian bên ngoài)
export function yawn(ch, x, z, k) {
  resetPose(ch); ch.root.position.set(x, 0, z); legs(ch, 0.05, 0.3, 0);
  aim(B(ch, 'spine_01'), B(ch, 'spine_02'), L(ch, 0, 1, -0.12 * k));
  for (const [s, kk] of [['l', 1], ['r', -1]]) { aim(B(ch, 'upperarm_' + s), B(ch, 'lowerarm_' + s), L(ch, kk * (0.9 - k * 0.6), -0.9 + k * 1.8, -0.05)); aim(B(ch, 'lowerarm_' + s), B(ch, 'hand_' + s), L(ch, kk * (0.4 - k * 0.6), -0.6 + k * 1.6, 0.1)); }
  rotW(B(ch, 'Head'), L(ch, 1, 0, 0), -0.35 * k); place(ch, x, z);
}
// giơ ngón cái + cười (tay phải ra trước)
export function thumbsUp(ch, x, z, k = 1) {
  resetPose(ch); ch.root.position.set(x, 0, z); legs(ch, 0.04, 0.3, 0);
  aim(B(ch, 'upperarm_r'), B(ch, 'lowerarm_r'), L(ch, -0.35, -0.55 + 0.4 * k, 0.75)); aim(B(ch, 'lowerarm_r'), B(ch, 'hand_r'), L(ch, -0.1, 0.9 * k, 0.5));
  aim(B(ch, 'upperarm_l'), B(ch, 'lowerarm_l'), L(ch, 0.2, -1, 0.05)); aim(B(ch, 'lowerarm_l'), B(ch, 'hand_l'), L(ch, 0.1, -1, 0.15));
  // ngón: nắm lại, ngón cái dựng
  for (const f of ['index', 'middle', 'ring', 'pinky']) { for (const j of ['01', '02', '03']) { const b = B(ch, `${f}_${j}_r`); if (b) rotW(b, L(ch, 1, 0, 0), 1.1 * k); } }
  place(ch, x, z);
}
// cúi đầu đi bộ (chán nản), pha đi = ph
export function sadWalk(ch, x, z, ph) {
  resetPose(ch); ch.root.position.set(x, 0, z); const s = Math.sin(ph);
  aim(B(ch, 'thigh_l'), B(ch, 'calf_l'), L(ch, 0.08, -1, 0.35 * s)); aim(B(ch, 'thigh_r'), B(ch, 'calf_r'), L(ch, -0.08, -1, -0.35 * s));
  aim(B(ch, 'calf_l'), B(ch, 'foot_l'), L(ch, 0.05, -1, 0.1 * s - 0.15 * Math.max(0, -s))); aim(B(ch, 'calf_r'), B(ch, 'foot_r'), L(ch, -0.05, -1, -0.1 * s - 0.15 * Math.max(0, s)));
  aim(B(ch, 'spine_01'), B(ch, 'spine_02'), L(ch, 0, 1, 0.22)); rotW(B(ch, 'neck_01'), L(ch, 1, 0, 0), 0.5);
  for (const [sd, kk] of [['l', 1], ['r', -1]]) { aim(B(ch, 'upperarm_' + sd), B(ch, 'lowerarm_' + sd), L(ch, kk * 0.18, -1, -0.25 * s * kk)); aim(B(ch, 'lowerarm_' + sd), B(ch, 'hand_' + sd), L(ch, kk * 0.1, -1, 0.1)); }
  place(ch, x, z);
}
// chạy nước rút tại chỗ / khởi động (pha ph)
export function sprint(ch, x, z, ph) {
  resetPose(ch); ch.root.position.set(x, 0, z); const s = Math.sin(ph);
  aim(B(ch, 'spine_01'), B(ch, 'spine_02'), L(ch, 0, 1, 0.35));
  aim(B(ch, 'thigh_l'), B(ch, 'calf_l'), L(ch, 0.06, -1, 0.9 * s)); aim(B(ch, 'thigh_r'), B(ch, 'calf_r'), L(ch, -0.06, -1, -0.9 * s));
  aim(B(ch, 'calf_l'), B(ch, 'foot_l'), L(ch, 0.04, -1, -0.8 * Math.max(0, -s) + 0.2 * s)); aim(B(ch, 'calf_r'), B(ch, 'foot_r'), L(ch, -0.04, -1, -0.8 * Math.max(0, s) - 0.2 * s));
  for (const [sd, kk] of [['l', 1], ['r', -1]]) { const a = sd === 'l' ? -s : s; aim(B(ch, 'upperarm_' + sd), B(ch, 'lowerarm_' + sd), L(ch, kk * 0.15, -0.8, 0.6 * a)); aim(B(ch, 'lowerarm_' + sd), B(ch, 'hand_' + sd), L(ch, kk * 0.05, 0.3 + 0.4 * a, 0.9)); }
  place(ch, x, z); ch.root.position.y += Math.abs(Math.cos(ph)) * 0.06;
}

// QB hô tín hiệu: tay trái chỉ quét qua hàng phòng ngự, tay phải kẹp bóng bên hông, đầu nhìn theo tay. Trả về vị trí bóng
export function qbSignal(ch, x, z, t, seed = 0) {
  resetPose(ch); ch.root.position.set(x, 0, z); legs(ch, 0.12 + 0.03 * Math.sin(t * 2.1 + seed), 0.34, 0.04 * Math.sin(t * 1.3 + seed));
  aim(B(ch, 'spine_01'), B(ch, 'spine_02'), L(ch, 0.03 * Math.sin(t * 1.3 + seed), 1, 0.08));
  place(ch, x, z); const sc = ch.root.scale.x;
  const sw = Math.sin(t * 2.4 + seed) * 0.55; // góc quét tay chỉ
  const up = 0.15 + 0.08 * Math.sin(t * 4.8 + seed);
  aim(B(ch, 'upperarm_l'), B(ch, 'lowerarm_l'), L(ch, 0.25 + Math.sin(sw) * 0.6, up, Math.cos(sw)));
  aim(B(ch, 'lowerarm_l'), B(ch, 'hand_l'), L(ch, 0.15 + Math.sin(sw) * 0.7, up + 0.05, Math.cos(sw)));
  rotW(B(ch, 'neck_01'), L(ch, 0, 1, 0), sw * 0.45); rotW(B(ch, 'Head'), L(ch, 0, 1, 0), sw * 0.35); rotW(B(ch, 'spine_03'), L(ch, 0, 1, 0), sw * 0.12);
  const hip = B(ch, 'pelvis').getWorldPosition(new THREE.Vector3()).add(L(ch, -0.2 * sc, 0.18 * sc, 0.12 * sc));
  ik2(ch, 'upperarm_r', 'lowerarm_r', 'hand_r', hip, L(ch, -1, -0.3, -0.5));
  return B(ch, 'hand_r').getWorldPosition(new THREE.Vector3()).add(L(ch, 0, 0.02, 0.05));
}
// "sống": thở (ngực phồng), đổi trọng tâm, quay đầu nhìn quanh — gọi SAU khi đặt tư thế; amt 0..1; mỗi nhân vật seed khác để lệch nhịp
export function liven(ch, t, seed = 0, amt = 1, headAmt = 1) {
  const up = L(ch, 0, 1, 0), lat = L(ch, 1, 0, 0), fw = L(ch, 0, 0, 1);
  const n = (f, o) => Math.sin(t * f + o + seed) * 0.6 + Math.sin(t * f * 2.3 + o * 1.7 + seed * 2) * 0.4;
  rotW(B(ch, 'spine_03'), lat, Math.sin(t * 1.9 + seed) * 0.03 * amt);           // thở
  rotW(B(ch, 'spine_01'), fw, n(0.8, 1) * 0.035 * amt);                           // đổi trọng tâm
  const yaw = n(0.7, 0) * 0.3 * amt * headAmt, pit = n(0.5, 2) * 0.08 * amt * headAmt;
  rotW(B(ch, 'neck_01'), up, yaw * 0.45); rotW(B(ch, 'Head'), up, yaw * 0.55); rotW(B(ch, 'Head'), lat, pit);
  return yaw;
}

// ---- Tập 4: Eagles (nguồn: Eagles.com, ESPN, Statscrew 2026, SportsLogos/OnPattison): áo nhà xanh midnight green,
// số trắng viền than chì, quần trắng, mũ xanh midnight green (KHÔNG vẽ cánh chim), lưới chắn mặt xám bạc.
export const PHI = { green: '#17707a', silver: '#a5acaf', charcoal: '#2b2e33' };
export const EAGLES = { ...BASE, jersey: PHI.green, numberColor: '#ffffff', numberOutline: PHI.charcoal, pants: '#f4f4f2', pantsStripes: [PHI.green, PHI.silver], socks: '#f2f2f2', shoes: '#f4f4f4', gloves: '#f4f4f4',
  backNameMax: 150, helmet: '#176a72', helmetStripe: [], helmetMetal: 0.45, mask: '#9aa0a6', maskThick: 0.085, maskY: -0.1, collar: PHI.charcoal, build: 'fit', shoulders: 'wide' };
export const CAST4 = {
  // Saquon Barkley: số 26, 1,83 m, 233 lb — thấp đậm, đùi to, da nâu
  barkley: (lib, o = {}) => makeCharacter(lib, { ...EAGLES, skin: '#7a4a2c', number: 26, backName: 'BARKLEY', heightM: 1.83, build: 'big', ...o }),
  // Tanner McKee: số 16, 1,98 m, 231 lb — cao, da trắng
  mckee: (lib, o = {}) => makeCharacter(lib, { ...EAGLES, skin: '#f0c8a6', number: 16, backName: 'MCKEE', heightM: 1.98, shoulders: null, ...o }),
  // Jake Elliott: số 4, 1,75 m, 167 lb — nhỏ gọn
  elliott: (lib, o = {}) => makeCharacter(lib, { ...EAGLES, skin: '#eec7a4', number: 4, backName: 'ELLIOTT', heightM: 1.75, build: 'slim', shoulders: null, ...o }),
  ol: (lib, o = {}) => makeCharacter(lib, { ...EAGLES, skin: '#c68c5f', number: 65, heightM: 1.95, build: 'big', ...o }),
};
// ngã ngửa vì bị đè (k 0 đứng → 1 nằm), hướng ngã theo -z cục bộ
export function knockedDown(ch, x, z, k) {
  resetPose(ch); ch.root.position.set(x, 0, z);
  const kk = Math.min(1, Math.max(0, k));
  legs(ch, 0.1 + kk * 0.5, 0.4, 0);
  for (const [s, sg] of [['l', 1], ['r', -1]]) { aim(B(ch, 'upperarm_' + s), B(ch, 'lowerarm_' + s), L(ch, sg * 0.8, 0.5 * kk - 0.3, 0.2)); aim(B(ch, 'lowerarm_' + s), B(ch, 'hand_' + s), L(ch, sg * 0.6, 0.6, 0.3)); }
  const ry = ch.root.rotation.y; ch.root.rotation.set(0, ry, 0); ch.root.rotateX(-kk * 1.45);
  ch.root.updateMatrixWorld(true); groundIt(ch, 0, 0.02);
}
// chạy mang bóng (pha ph, tay phải kẹp bóng); trả về vị trí bóng
export function runCarry(ch, x, z, ph) {
  sprint(ch, x, z, ph); const sc = ch.root.scale.x;
  const c = B(ch, 'spine_03').getWorldPosition(new THREE.Vector3()).add(L(ch, -0.16 * sc, -0.08 * sc, 0.18 * sc));
  ik2(ch, 'upperarm_r', 'lowerarm_r', 'hand_r', c, L(ch, -1, -0.5, -0.2));
  return c;
}
// ăn mừng: 2 tay giơ cao nhún nhảy
export function celebrate(ch, x, z, t, seed = 0) {
  resetPose(ch); ch.root.position.set(x, 0, z); legs(ch, 0.08, 0.36, 0);
  for (const [s, sg] of [['l', 1], ['r', -1]]) { const w = Math.sin(t * 7 + seed + (sg > 0 ? 0 : 1.2)) * 0.25; aim(B(ch, 'upperarm_' + s), B(ch, 'lowerarm_' + s), L(ch, sg * 0.45, 0.9, w)); aim(B(ch, 'lowerarm_' + s), B(ch, 'hand_' + s), L(ch, sg * 0.15, 1, 0.1)); }
  place(ch, x, z); ch.root.position.y += Math.abs(Math.sin(t * 7 + seed)) * 0.12;
}
