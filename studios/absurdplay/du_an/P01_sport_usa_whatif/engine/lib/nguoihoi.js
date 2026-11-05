// Người hơi vẫy tay (inflatable tube man) — tập 4. Thân là ống vải dựng lại MỖI KHUNG từ một đường gãy 3D
// (TubeGeometry) nên uốn, quật, gập đôi rồi bật dậy tự nhiên; 2 tay là ống mảnh quật theo nhịp riêng.
// Mặt (mắt to + miệng cười) và chỏm tóc tua rua gắn vào điểm đầu ống, hướng theo tiếp tuyến. Mọi chuyển động là hàm thuần của t.
import * as THREE from 'three';

const std = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.55 }, o));
const N = 22; // số đoạn thân

export function makeTubeMan(o = {}) {
  const P = Object.assign({ color: '#ff3b30', arm: null, H: 3.0, R: 0.27, seed: 1, hair: '#ffffff', mouth: '#7a0d0d' }, o);
  const g = new THREE.Group();
  const mat = std(P.color, { roughness: 0.62, side: THREE.DoubleSide });
  const armMat = std(P.arm || P.color, { roughness: 0.62, side: THREE.DoubleSide });
  const body = new THREE.Mesh(new THREE.BufferGeometry(), mat); body.castShadow = true; body.frustumCulled = false; g.add(body);
  const arms = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.BufferGeometry(), armMat); m.castShadow = true; m.frustumCulled = false; g.add(m); return m; });
  // quạt thổi: hộp trụ đen + lưới
  const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.42, 28), std('#1b1d22', { roughness: 0.4, metalness: 0.3 })); fan.position.y = 0.21; fan.castShadow = true; g.add(fan);
  const grill = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.02, 6, 28), std('#8a8f98', { metalness: 0.7, roughness: 0.3 })); grill.rotation.x = Math.PI / 2; grill.position.y = 0.43; g.add(grill);
  // đầu: mắt + miệng + tóc tua rua (nhóm gắn theo điểm đầu)
  const head = new THREE.Group(); g.add(head);
  const eyeW = std('#ffffff', { roughness: 0.25 }), eyeB = std('#111111', { roughness: 0.2 });
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(P.R * 0.36, 20, 14), eyeW); e.scale.set(1, 1.25, 0.5); e.position.set(s * P.R * 0.42, P.R * 0.35, P.R * 0.86); head.add(e);
    const p = new THREE.Mesh(new THREE.SphereGeometry(P.R * 0.17, 16, 12), eyeB); p.scale.set(1, 1.2, 0.5); p.position.set(s * P.R * 0.38, P.R * 0.3, P.R * 1.03); head.add(p); p.userData.pupil = s;
  }
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(P.R * 0.45, P.R * 0.09, 8, 24, Math.PI), std(P.mouth)); mouth.rotation.z = Math.PI; mouth.position.set(0, -P.R * 0.2, P.R * 0.92); head.add(mouth);
  const hairM = std(P.hair, { roughness: 0.7, side: THREE.DoubleSide }); const hair = [];
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; const h = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.012), hairM); h.position.set(Math.cos(a) * P.R * 0.45, P.R * 0.55 + 0.22, Math.sin(a) * P.R * 0.45); h.rotation.set(Math.sin(a) * 0.32, -a, -Math.cos(a) * 0.32); h.castShadow = true; head.add(h); hair.push(h); }
  const tm = { root: g, P, body, arms, head, fold: 0, lean: new THREE.Vector2(0, 0), amp: 1, faceYaw: 0, pts: [] };
  // trạng thái điều khiển từ ngoài: tm.amp (0 = gần đứng, 1 = vẫy bình thường, 2 = cuồng loạn), tm.fold (0..1 gập đôi giữa thân),
  // tm.lean (Vector2 nghiêng cả thân về x,z cục bộ — vd lao vào ai đó), tm.armReach (Vector3 cục bộ: tay vươn về điểm đó, null = quật tự do)
  tm.update = (t) => updateTubeMan(tm, t);
  return tm;
}

const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0);
function wiggle(t, sd) { return Math.sin(t * 2.3 + sd) * 0.55 + Math.sin(t * 3.9 + sd * 1.7) * 0.3 + Math.sin(t * 6.1 + sd * 2.9) * 0.15; }

export function updateTubeMan(tm, t) {
  const { P } = tm, sd = P.seed, amp = tm.amp ?? 1, fold = tm.fold ?? 0;
  const base = 0.42, L = P.H - base, seg = L / N;
  // đường thân: tích luỹ góc uốn theo chiều cao (cong dần lên ngọn) + gập ở 45 % thân
  const pts = [new THREE.Vector3(0, base, 0)];
  // góc lệch khỏi phương đứng tại mỗi độ cao (không cộng dồn → không cuộn thành vòng): ngọn quật mạnh, gốc gần đứng;
  // gập (fold) bẻ nửa trên đổ về phía trước (+z cục bộ = hướng mặt), lean nghiêng cả thân
  for (let i = 1; i <= N; i++) {
    const s = i / N, sp = Math.pow(s, 1.4);
    const ax = tm.lean.x * s + 0.62 * Math.pow(amp, 0.6) * sp * wiggle(t - s * 0.5, sd);
    const fz = fold * 2.5 * THREE.MathUtils.smoothstep(s, 0.38, 0.62);
    const az = tm.lean.y * s + 0.45 * Math.pow(amp, 0.6) * sp * wiggle(t * 0.9 - s * 0.45, sd + 3.3) + fz;
    const p = pts[i - 1].clone().add(new THREE.Vector3(Math.sin(ax) * Math.cos(az), Math.cos(ax) * Math.cos(az), Math.sin(az)).multiplyScalar(seg));
    if (p.y < 0.12) p.y = 0.12; pts.push(p);
  }
  tm.pts = pts;
  // dựng lại ống thân (bán kính co nhẹ ở cổ, phình ở đầu)
  const curve = new THREE.CatmullRomCurve3(pts);
  tm.body.geometry.dispose(); tm.body.geometry = new THREE.TubeGeometry(curve, N * 3, P.R, 18, false);
  // nắp đầu tròn
  if (!tm.cap) { tm.cap = new THREE.Mesh(new THREE.SphereGeometry(P.R, 18, 12), tm.body.material); tm.cap.castShadow = true; tm.root.add(tm.cap); }
  const top = pts[N], tan = curve.getTangentAt(1).normalize(); tm.cap.position.copy(top);
  // đầu: đặt ở đỉnh, hướng mặt về +z cục bộ đã xoay theo tiếp tuyến (+ quay mặt theo faceYaw)
  _q.setFromUnitVectors(UP, tan); tm.head.position.copy(top); tm.head.quaternion.copy(_q).multiply(new THREE.Quaternion().setFromAxisAngle(UP, tm.faceYaw || 0));
  tm.head.children.forEach((c) => { if (c.userData.pupil) c.position.x = c.userData.pupil * P.R * 0.38 + Math.sin(t * 1.7 + sd) * P.R * 0.06; });
  // 2 tay: gốc ở 78 % thân, quật theo nhịp riêng (lệch pha), hoặc vươn tới armReach
  const sh = curve.getPointAt(0.78), stan = curve.getTangentAt(0.78).normalize();
  const side = new THREE.Vector3().crossVectors(stan, new THREE.Vector3(0, 0, 1)).normalize(); if (side.lengthSq() < 1e-4) side.set(1, 0, 0);
  tm.arms.forEach((m, k) => {
    const sg = k ? 1 : -1, ap = [sh.clone().add(side.clone().multiplyScalar(sg * P.R * 0.9))]; let a1 = sg * (0.9 + 0.7 * amp * wiggle(t * 1.4, sd + k * 5)), a2 = 0.6 * amp * wiggle(t * 1.7, sd + 9 + k);
    const AL = 1.35, ns = 8;
    for (let i = 1; i <= ns; i++) {
      const s = i / ns; a1 += sg * 0.12 * amp * wiggle(t * 2.1 - s, sd + k * 2.2);
      let d = new THREE.Vector3(Math.sin(a1), Math.cos(a1), Math.sin(a2)).normalize();
      if (tm.armReach) { const tg = tm.armReach.clone().sub(ap[i - 1]).normalize(); d.lerp(tg, Math.min(1, s * 1.5)).normalize(); }
      ap.push(ap[i - 1].clone().add(d.multiplyScalar(AL / ns)));
    }
    m.geometry.dispose(); m.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ap), 24, P.R * 0.36, 10, false); m.userData.tip = ap[ns];
  });
  return pts;
}
// điểm thế giới của đầu / đầu ngón tay (để bóng bám, chạm người)
export function tubeHead(tm) { tm.root.updateMatrixWorld(true); return tm.pts[N].clone().applyMatrix4(tm.root.matrixWorld); }
export function tubeTip(tm, k) { tm.root.updateMatrixWorld(true); return tm.arms[k].userData.tip.clone().applyMatrix4(tm.root.matrixWorld); }
