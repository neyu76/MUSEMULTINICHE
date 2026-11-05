// Máy quay "điện ảnh" cho render từng khung: dùng camera-controls (yomotsu, MIT) để nội suy vị trí/điểm nhìn
// theo cung cầu (lerpLookAt) + easing + rung tay (simplex-noise, MIT). Mọi chuyển động là hàm thuần của t
// -> render song song từng đoạn vẫn cho kết quả giống hệt.
import * as THREE from 'three';
import CameraControls from '../node_modules/camera-controls/dist/camera-controls.module.js';
import { createNoise2D } from '../node_modules/simplex-noise/dist/esm/simplex-noise.js';

CameraControls.install({ THREE });

export const EASE = {
  linear: (x) => x,
  inOut: (x) => x * x * (3 - 2 * x),                 // smoothstep
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  out: (x) => 1 - Math.pow(1 - x, 3),
  in: (x) => x * x * x,
  smoother: (x) => x * x * x * (x * (6 * x - 15) + 10),     // smootherstep: gia tốc bằng 0 ở hai đầu -> mượt nhất
  whip: (x) => (x < 0.5 ? 16 * x ** 5 : 1 - Math.pow(-2 * x + 2, 5) / 2), // tăng/giảm tốc rất gắt (whip pan)
};

function seeded(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export class CameraRig {
  // style (v0.6, đo trên 2 video mẫu): máy mẫu đứng/đẩy chậm phần lớn thời gian, có 1,5–2,4 cú lia nhanh mỗi 10 s,
  // rung tay nhẹ. Lớp này cộng lên MỌI shot (trừ shot có style:false):
  //   push   : tỉ lệ khoảng cách máy→điểm nhìn rút ngắn mỗi giây (mẫu 2,4–3,5 %/s)
  //   arrive : xác suất một shot mở bằng cú "lia vào" (máy trượt ngang + lùi rồi dừng gắt, ~0,45 s)
  //   hand   : biên độ rung tay (1 = ~0,4 % khoảng cách, 1,3 Hz)
  // Shot có thể ghi đè: {push:0, arrive:true|false, hand:0.5, style:false}. style:{off:true} tắt cả lớp.
  constructor(camera, dom, { seed = 7, style = {} } = {}) {
    this.cam = camera;
    this.cc = new CameraControls(camera, dom);
    this.cc.smoothTime = 0; this.cc.draggingSmoothTime = 0;
    this.shots = [];
    this.seed = seed;
    this.style = Object.assign({ off: false, push: 0.028, arrive: 0.6, arriveDur: 0.45, arriveAmt: 0.16, hand: 1 }, style);
    this.n1 = createNoise2D(seeded(seed)); this.n2 = createNoise2D(seeded(seed + 1)); this.n3 = createNoise2D(seeded(seed + 2));
  }
  // shot: {t0, t1, from:{pos:[x,y,z], look:[x,y,z]}, to:{...}, ease, shake, fov:[a,b], follow:Object3D, followOffset:[x,y,z]}
  // shot đường cong: {t0,t1, path:[[x,y,z],...], look:[x,y,z] hoặc lookPath:[[...],...], ease:'smoother', fov:[a,b], follow}
  // CatmullRom centripetal + tham số theo độ dài cung (getPointAt) -> tốc độ máy đều, không giật ở điểm nút
  add(shot) {
    const s = Object.assign({ ease: shot.path ? 'smoother' : 'inOut', shake: 0, shakeHz: 0.6 }, shot);
    if (s.path) { s._pc = new THREE.CatmullRomCurve3(s.path.map((p) => new THREE.Vector3(...p)), false, 'centripetal');
      if (s.lookPath) s._lc = new THREE.CatmullRomCurve3(s.lookPath.map((p) => new THREE.Vector3(...p)), false, 'centripetal'); }
    this.shots.push(s); return this;
  }
  shotAt(t) { return this.shots.find((s) => t >= s.t0 && t < s.t1) || this.shots[this.shots.length - 1]; }
  apply(t) {
    const s = this.shotAt(t); const k = Math.min(1, Math.max(0, (t - s.t0) / Math.max(1e-6, s.t1 - s.t0)));
    const e = EASE[s.ease](k);
    if (s._pc) {
      const p = s._pc.getPointAt(e), l = s._lc ? s._lc.getPointAt(e) : new THREE.Vector3(...s.look);
      if (s.follow) { const w = s.follow.getWorldPosition(new THREE.Vector3()); p.add(w); l.add(w); }
      this.cc.setLookAt(p.x, p.y, p.z, l.x, l.y, l.z, false);
      if (s.fov) { this.cam.fov = s.fov[0] + (s.fov[1] - s.fov[0]) * e; this.cam.updateProjectionMatrix(); }
      this.cc.update(0); this._style(s, t); this._shake(s, t); return s;
    }
    const to = s.to || s.from;
    let fp = new THREE.Vector3(...s.from.pos), fl = new THREE.Vector3(...s.from.look), tp = new THREE.Vector3(...to.pos), tl = new THREE.Vector3(...to.look);
    if (s.follow) { // bám theo nhân vật: vị trí & điểm nhìn cộng thêm vị trí hiện tại của đối tượng
      const w = s.follow.getWorldPosition(new THREE.Vector3()); fp.add(w); fl.add(w); tp.add(w); tl.add(w);
    }
    if (s.orbit) { // quay quanh điểm nhìn: s.orbit = góc (rad) quay thêm theo trục y trong suốt shot
      const off = tp.clone().sub(tl); off.applyAxisAngle(new THREE.Vector3(0, 1, 0), s.orbit * e); tp.copy(tl).add(off);
      this.cc.setLookAt(tp.x, tp.y, tp.z, tl.x, tl.y, tl.z, false);
    } else {
      this.cc.lerpLookAt(fp.x, fp.y, fp.z, fl.x, fl.y, fl.z, tp.x, tp.y, tp.z, tl.x, tl.y, tl.z, e, false);
    }
    if (s.fov) { this.cam.fov = s.fov[0] + (s.fov[1] - s.fov[0]) * e; this.cam.updateProjectionMatrix(); }
    this.cc.update(0); this._style(s, t); this._shake(s, t);
    return s;
  }
  _style(s, t) {
    const st = this.style; if (st.off || s.style === false) return;
    const l = this.cc.getTarget(new THREE.Vector3()), p = this.cam.position.clone(); const d = Math.max(0.3, p.distanceTo(l));
    const u = Math.max(0, t - s.t0), fwd = l.clone().sub(p).normalize();
    const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)); if (right.lengthSq() < 1e-6) right.set(1, 0, 0); right.normalize();
    // đẩy chậm vào chủ thể
    p.addScaledVector(fwd, d * Math.min(0.35, (s.push ?? st.push) * u));
    // lia vào đầu shot (tất định theo chỉ số shot)
    const i = this.shots.indexOf(s), h = (k) => { const x = Math.sin((i + 1) * 12.9898 + this.seed * 78.233 + k) * 43758.5453; return x - Math.floor(x); };
    const arr = s.arrive ?? (i > 0 && h(1) < st.arrive);
    // trượt cả máy lẫn điểm nhìn (khung hình trôi ngang rồi dừng gắt, như cú lia của mẫu); lùi nhẹ để có thêm chiều sâu
    if (arr && u < st.arriveDur) { const a = 1 - EASE.out(u / st.arriveDur), sg = h(2) < 0.5 ? -1 : 1;
      const off = right.clone().multiplyScalar(sg * a * st.arriveAmt * d);
      p.add(off); l.addScaledVector(off, 0.85); p.addScaledVector(fwd, -a * st.arriveAmt * 0.4 * d); }
    // rung tay
    const hh = (s.hand ?? st.hand) * 0.004 * d, f = t * 1.3;
    p.x += this.n1(f, 40) * hh; p.y += this.n2(f, 41) * hh * 0.7; p.z += this.n3(f, 42) * hh;
    this.cam.position.copy(p); this.cam.lookAt(l);
  }
  _shake(s, t) {
    if (s.shake > 0) { // rung tay: lệch nhỏ vị trí + xoay, tần số thấp, tính theo t
      const f = t * s.shakeHz;
      this.cam.position.x += this.n1(f, 0) * s.shake; this.cam.position.y += this.n2(f, 3) * s.shake * 0.7;
      this.cam.rotateZ(this.n3(f, 9) * s.shake * 0.15); this.cam.rotateX(this.n2(f, 17) * s.shake * 0.12);
    }
  }
  // cắt cảnh có trong khoảng (để dựng/ghi mốc)
  cuts() { return this.shots.map((s) => s.t0); }
}

// preset nhanh: trả về {from,to} cho các kiểu máy hay dùng trong kênh mẫu
export const PRESET = {
  pushIn: (target, dist0, dist1, h = 1.5, yaw = 0) => ({ from: { pos: around(target, dist0, h, yaw), look: target }, to: { pos: around(target, dist1, h * 0.95, yaw), look: target } }),
  pullOut: (target, dist0, dist1, h = 1.5, yaw = 0) => ({ from: { pos: around(target, dist0, h, yaw), look: target }, to: { pos: around(target, dist1, h * 1.15, yaw), look: target } }),
  crane: (target, dist, h0, h1, yaw = 0) => ({ from: { pos: around(target, dist, h0, yaw), look: target }, to: { pos: around(target, dist, h1, yaw), look: target } }),
  truck: (target, dist, h, yaw0, yaw1) => ({ from: { pos: around(target, dist, h, yaw0), look: target }, to: { pos: around(target, dist, h, yaw1), look: target } }),
  topDown: (target, h0, h1) => ({ from: { pos: [target[0], target[1] + h0, target[2] + 0.01], look: target }, to: { pos: [target[0], target[1] + h1, target[2] + 0.01], look: target } }),
};
function around(t, d, h, yaw) { return [t[0] + Math.sin(yaw) * d, t[1] + h, t[2] + Math.cos(yaw) * d]; }
