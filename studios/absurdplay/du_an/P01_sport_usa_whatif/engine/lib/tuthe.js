// Tư thế tạo bằng code (không cần clip): xoay xương để hướng xương con chỉ về một hướng thế giới.
// Dùng cho em bé (ngồi bệt, bò, nằm) và các tư thế đặc biệt không có trong thư viện động tác.
import * as THREE from 'three';

const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _q = new THREE.Quaternion(), _pq = new THREE.Quaternion(), _wq = new THREE.Quaternion();

// xoay `bone` để vector (bone -> child) trùng với dir (toạ độ thế giới)
export function aim(bone, child, dir) {
  bone.updateWorldMatrix(true, true);
  bone.getWorldPosition(_a); child.getWorldPosition(_b);
  const cur = _b.sub(_a).normalize();
  _q.setFromUnitVectors(cur, dir.clone().normalize());
  bone.getWorldQuaternion(_wq);
  _wq.premultiply(_q);
  bone.parent.getWorldQuaternion(_pq);
  bone.quaternion.copy(_pq.invert().multiply(_wq));
  bone.updateWorldMatrix(false, true);
}

// đưa mọi xương về tư thế nghỉ (bind pose)
export function resetPose(ch) {
  if (!ch._rest) { ch._rest = {}; for (const [n, b] of Object.entries(ch.bones)) ch._rest[n] = b.quaternion.clone(); }
  for (const [n, b] of Object.entries(ch.bones)) b.quaternion.copy(ch._rest[n]);
}

// hướng trong hệ toạ độ của nhân vật (+z là phía trước, +y lên) -> thế giới
function local(ch, x, y, z) { return new THREE.Vector3(x, y, z).applyQuaternion(ch.root.getWorldQuaternion(new THREE.Quaternion())); }

const B = (ch, n) => ch.bones[n];

// t: giây (để thêm cử động nhỏ cho sống động)
export const POSES = {
  sit(ch, t = 0) { // ngồi bệt, chân duỗi ra trước, tay chống/đung đưa
    resetPose(ch);
    const s = Math.sin(t * 2.2) * 0.08;
    aim(B(ch, 'spine_01'), B(ch, 'spine_02'), local(ch, 0, 1, -0.08));
    aim(B(ch, 'spine_03'), B(ch, 'neck_01'), local(ch, s * 0.3, 1, 0.05));
    for (const [side, k] of [['l', 1], ['r', -1]]) {
      aim(B(ch, 'thigh_' + side), B(ch, 'calf_' + side), local(ch, k * 0.35, -0.05, 1));
      aim(B(ch, 'calf_' + side), B(ch, 'foot_' + side), local(ch, k * 0.3, -0.12, 1));
      aim(B(ch, 'foot_' + side), B(ch, 'ball_' + side), local(ch, k * 0.2, 1, 0.3));
      aim(B(ch, 'upperarm_' + side), B(ch, 'lowerarm_' + side), local(ch, k * 0.55, -0.8, 0.35 + s));
      aim(B(ch, 'lowerarm_' + side), B(ch, 'hand_' + side), local(ch, k * 0.15, -0.2, 1));
    }
    aim(B(ch, 'neck_01'), B(ch, 'Head'), local(ch, Math.sin(t * 1.3) * 0.15, 1, 0.1));
  },
  crawl(ch, t = 0) { // bò bằng tay và đầu gối
    resetPose(ch);
    const ph = t * 4.0;
    aim(B(ch, 'spine_01'), B(ch, 'spine_02'), local(ch, 0, 0.1, 1));
    aim(B(ch, 'spine_03'), B(ch, 'neck_01'), local(ch, 0, 0.15, 1));
    aim(B(ch, 'neck_01'), B(ch, 'Head'), local(ch, 0, 0.9, 0.6));
    for (const [side, k, off] of [['l', 1, 0], ['r', -1, Math.PI]]) {
      const sw = Math.sin(ph + off) * 0.35;
      aim(B(ch, 'thigh_' + side), B(ch, 'calf_' + side), local(ch, k * 0.25, -1, sw));
      aim(B(ch, 'calf_' + side), B(ch, 'foot_' + side), local(ch, 0, -0.05, -1));
      aim(B(ch, 'upperarm_' + side), B(ch, 'lowerarm_' + side), local(ch, k * 0.2, -1, 0.2 - sw));
      aim(B(ch, 'lowerarm_' + side), B(ch, 'hand_' + side), local(ch, k * 0.1, -1, 0.15 - sw * 0.5));
    }
  },
  lie(ch, t = 0) { // nằm ngửa đạp chân
    resetPose(ch);
    for (const [side, k, off] of [['l', 1, 0], ['r', -1, 1.7]]) {
      const kk = Math.sin(t * 5 + off) * 0.4;
      aim(B(ch, 'thigh_' + side), B(ch, 'calf_' + side), local(ch, k * 0.3, 0.6 + kk, 0.8));
      aim(B(ch, 'calf_' + side), B(ch, 'foot_' + side), local(ch, k * 0.2, 1, 0.1));
      aim(B(ch, 'upperarm_' + side), B(ch, 'lowerarm_' + side), local(ch, k * 0.7, 0.6, 0.3 - kk));
    }
  },
};

// đặt nhân vật chạm đất: hạ/nâng root để điểm thấp nhất của các xương tiếp đất nằm ở mặt đất (y = groundY)
const _v = new THREE.Vector3();
export function groundIt(ch, groundY = 0, pad = 0.03) {
  ch.root.updateMatrixWorld(true);
  let min = Infinity;
  for (const n of ['foot_l', 'foot_r', 'ball_l', 'ball_r', 'calf_l', 'calf_r', 'hand_l', 'hand_r', 'pelvis', 'thigh_l', 'thigh_r', 'Head'])
    if (ch.bones[n]) { ch.bones[n].getWorldPosition(_v); min = Math.min(min, _v.y); }
  ch.root.position.y += groundY + pad * ch.root.scale.y * 2 - min;
  ch.root.updateMatrixWorld(true);
}

// ---- tư thế bổ sung cho demo NFL ----
const _r = new THREE.Vector3(), _h = new THREE.Vector3(), _f = new THREE.Vector3(), _p = new THREE.Vector3();
function lat(ch, k) { return new THREE.Vector3(k, 0, 0).applyQuaternion(ch.root.getWorldQuaternion(new THREE.Quaternion())); }
// chống đẩy: thân thẳng nghiêng, tay chống thẳng xuống đất; t chạy nhịp lên/xuống
export function pushup(ch, t = 0, ry = 0) {
  const ph = (1 - Math.cos(t * 4.2)) / 2; // 0 = trên, 1 = dưới
  ch.root.rotation.order = 'YXZ'; let beta = 0.42 - 0.17 * ph;
  for (let it = 0; it < 4; it++) {
    resetPose(ch); ch.root.rotation.set(Math.PI / 2 - beta, ry, 0); ch.root.updateMatrixWorld(true);
    const down = new THREE.Vector3(0, -1, 0);
    for (const [side, k] of [['l', 1], ['r', -1]]) {
      const L = lat(ch, k);
      aim(B(ch, 'upperarm_' + side), B(ch, 'lowerarm_' + side), down.clone().addScaledVector(L, 0.25 + 0.75 * ph));
      aim(B(ch, 'lowerarm_' + side), B(ch, 'hand_' + side), down.clone().addScaledVector(L, -0.1 * ph));
    }
    aim(B(ch, 'neck_01'), B(ch, 'Head'), local(ch, 0, 1, 0.35));
    ch.bones.hand_l.getWorldPosition(_h); ch.bones.ball_l.getWorldPosition(_f); ch.bones.Head.getWorldPosition(_p);
    const len = _p.distanceTo(_f); beta += (_f.y - _h.y + 0.02) / len;
  }
  groundIt(ch, 0, 0.0);
}
// IK 2 xương: đặt bàn tay/chân vào điểm T (thế giới); pole: hướng khuỷu/gối
export function ik2(ch, up, lo, end, T, pole) {
  const U = ch.bones[up], L = ch.bones[lo], E = ch.bones[end];
  ch.root.updateMatrixWorld(true);
  const S = U.getWorldPosition(new THREE.Vector3()), M = L.getWorldPosition(new THREE.Vector3()), H = E.getWorldPosition(new THREE.Vector3());
  const a = S.distanceTo(M), b = M.distanceTo(H); const dv = T.clone().sub(S); let d = dv.length(); const u = dv.normalize();
  d = Math.min(d, (a + b) * 0.999); const cosA = THREE.MathUtils.clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1), sinA = Math.sqrt(1 - cosA * cosA);
  const pp = pole.clone().sub(u.clone().multiplyScalar(pole.dot(u))).normalize();
  const elbow = S.clone().addScaledVector(u, a * cosA).addScaledVector(pp, a * sinA);
  aim(U, L, elbow.clone().sub(S)); aim(L, E, S.clone().addScaledVector(u, d).sub(elbow));
}
// ngồi băng ghế: lưng gần thẳng, hơi cúi, hai tay đặt lên đầu gối
export function benchSit(ch, t = 0, seatY = 0.48, sad = 1) {
  resetPose(ch);
  const br = Math.sin(t * 1.6) * 0.015;
  aim(B(ch, 'spine_01'), B(ch, 'spine_02'), local(ch, 0, 1, 0.08 * sad));
  aim(B(ch, 'spine_03'), B(ch, 'neck_01'), local(ch, 0, 1, 0.18 * sad + br));
  for (const [side, k] of [['l', 1], ['r', -1]]) {
    aim(B(ch, 'thigh_' + side), B(ch, 'calf_' + side), local(ch, k * 0.22, 0.02, 1));
    aim(B(ch, 'calf_' + side), B(ch, 'foot_' + side), local(ch, k * 0.04, -1, 0.05));
    aim(B(ch, 'foot_' + side), B(ch, 'ball_' + side), local(ch, 0, -0.2, 1));
  }
  ch.root.updateMatrixWorld(true); ch.bones.pelvis.getWorldPosition(_p);
  ch.root.position.y += seatY + 0.1 * ch.root.scale.y - _p.y; ch.root.updateMatrixWorld(true);
  for (const [side, k] of [['l', 1], ['r', -1]]) {
    const knee = ch.bones['calf_' + side].getWorldPosition(new THREE.Vector3()).add(local(ch, -k * 0.02, 0.07, -0.04));
    ik2(ch, 'upperarm_' + side, 'lowerarm_' + side, 'hand_' + side, knee, local(ch, k * 0.8, 0, -1));
  }
}
// em bé ngồi bệt ngả ra sau, hai tay chống đất phía sau; tay phải đặt lên quả bóng (nếu có)
export function babySit(ch, t = 0, ball = null) {
  resetPose(ch);
  const w = Math.sin(t * 2.3) * 0.06;
  aim(B(ch, 'spine_01'), B(ch, 'spine_02'), local(ch, 0, 1, -0.32));
  aim(B(ch, 'spine_03'), B(ch, 'neck_01'), local(ch, w * 0.3, 1, -0.1));
  aim(B(ch, 'neck_01'), B(ch, 'Head'), local(ch, Math.sin(t * 1.1) * 0.25, 1, 0.25));
  for (const [side, k] of [['l', 1], ['r', -1]]) {
    aim(B(ch, 'thigh_' + side), B(ch, 'calf_' + side), local(ch, k * 0.55, 0.05, 1));
    aim(B(ch, 'calf_' + side), B(ch, 'foot_' + side), local(ch, k * 0.35, -0.05 + (k > 0 ? w : -w), 1));
    aim(B(ch, 'foot_' + side), B(ch, 'ball_' + side), local(ch, k * 0.2, 1, 0.3));
  }
  groundIt(ch, 0, 0.02);
  const pel = ch.bones.pelvis.getWorldPosition(new THREE.Vector3()), sc = ch.root.scale.y;
  const hl = pel.clone().add(local(ch, 0.32 * sc, 0, -0.32 * sc)); hl.y = 0.01;
  ik2(ch, 'upperarm_l', 'lowerarm_l', 'hand_l', hl, local(ch, 0.3, 0, -1));
  if (ball) { ik2(ch, 'upperarm_r', 'lowerarm_r', 'hand_r', ball.clone().add(new THREE.Vector3(0, 0.07, 0)), local(ch, -1, 0.3, -0.3)); }
  else { const hr = pel.clone().add(local(ch, -0.32 * sc, 0, -0.3 * sc)); hr.y = 0.01; ik2(ch, 'upperarm_r', 'lowerarm_r', 'hand_r', hr, local(ch, -0.3, 0, -1)); }
}
// em bé ngã nghiêng sang một bên (k: 0 = đang ngồi, 1 = nằm hẳn)
export function babyTopple(ch, t = 0, k = 0, ry = 0) {
  ch.root.rotation.order = 'YXZ'; ch.root.rotation.set(0, ry, k * 1.15);
  babySit(ch, t, null);
  if (k > 0.3) { aim(B(ch, 'upperarm_l'), B(ch, 'lowerarm_l'), local(ch, 1, 0.4 * k, 0.4)); aim(B(ch, 'lowerarm_l'), B(ch, 'hand_l'), local(ch, 1, 0.6 * k, 0.2)); }
  groundIt(ch, 0, 0.02);
}
// chống nạnh: đặt hai tay lên hông (dùng chồng lên clip đứng)
export function akimbo(ch) {
  const pel = ch.bones.pelvis.getWorldPosition(new THREE.Vector3());
  for (const [side, k] of [['l', 1], ['r', -1]]) {
    const T = pel.clone().add(local(ch, k * 0.2, 0.12, 0.0));
    ik2(ch, 'upperarm_' + side, 'lowerarm_' + side, 'hand_' + side, T, local(ch, k * 1, 0, -0.6));
  }
}
// xoay xương quanh một trục thế giới
export function rotW(bone, axis, ang) {
  bone.updateWorldMatrix(true, false);
  const wq = bone.getWorldQuaternion(new THREE.Quaternion()); wq.premultiply(new THREE.Quaternion().setFromAxisAngle(axis.clone().normalize(), ang));
  const pq = bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert(); bone.quaternion.copy(pq.multiply(wq)); bone.updateWorldMatrix(false, true);
}
// sống động: quay đầu nhìn quanh + gật nhẹ + thở (gọi sau mixer.setTime / tư thế). Trả về góc quay đầu (rad)
export function alive(ch, t, seed = 0, amt = 1, bias = 0) {
  const n = (f, o) => Math.sin(t * f + o + seed) * 0.6 + Math.sin(t * f * 2.3 + o * 1.7 + seed * 2) * 0.4;
  const yaw = (n(0.7, 0) * 0.32 + bias) * amt, pit = n(0.5, 2) * 0.07 * amt;
  const up = local(ch, 0, 1, 0), lat = local(ch, 1, 0, 0);
  rotW(ch.bones.spine_03, lat, Math.sin(t * 1.7 + seed) * 0.025);
  rotW(ch.bones.neck_01, up, yaw * 0.45); rotW(ch.bones.Head, up, yaw * 0.55); rotW(ch.bones.Head, lat, pit);
  return yaw;
}
// em bé ngồi bệt ôm bóng trước bụng; trả về vị trí giữa hai tay để đặt quả bóng
export function sitHold(ch, t = 0) {
  POSES.sit(ch, t);
  for (const [side, k] of [['l', 1], ['r', -1]]) {
    aim(B(ch, 'upperarm_' + side), B(ch, 'lowerarm_' + side), local(ch, k * 0.3, -0.55, 0.75));
    aim(B(ch, 'lowerarm_' + side), B(ch, 'hand_' + side), local(ch, -k * 0.75, 0.05, 0.6));
  }
  groundIt(ch, 0, 0.03);
  const a = ch.bones.hand_l.getWorldPosition(new THREE.Vector3()), b = ch.bones.hand_r.getWorldPosition(new THREE.Vector3());
  return a.add(b).multiplyScalar(0.5);
}
