import * as THREE from 'three';
import { EffectComposer, RenderPass, EffectPass, SMAAEffect, DepthOfFieldEffect, BloomEffect, HueSaturationEffect, VignetteEffect, BrightnessContrastEffect } from 'postprocessing';
import { N8AOPostPass } from 'n8ao';
import { gsap } from 'gsap';
export const EASE = { pop: gsap.parseEase('back.out(3)'), slam: gsap.parseEase('expo.in'), settle: gsap.parseEase('elastic.out(1, 0.45)'), io: gsap.parseEase('power2.inOut') };
import { makeCanvas, drawChar, CW, CH } from './chars2.js';
export { THREE };
// v5 (team samples are 1080×1920): render size; captions (PlayRes 720×1280) scale with libass
export const WIDTH = 1080, HEIGHT = 1920, FPS = 30;
export const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
// supersampling: render at SS× then downscale to 720×1280 (crisp lines like an offline renderer). ?ss=1 for quick previews
export const SS = +(new URLSearchParams(location.search).get('ss') || 1.5);
renderer.setPixelRatio(SS); renderer.setSize(WIDTH, HEIGHT);
window.__lost = false; renderer.domElement.addEventListener('webglcontextlost', () => { window.__lost = true; });
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.localClippingEnabled = true; // v5: cutaway.js section cuts
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 1400);

let seed = 12345;
export const setSeed = s => { seed = s; };
export const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
export const R = (a, b) => a + (b - a) * rnd();
export const INK = '#1b1e2e';

// painterly variation: soft blotches + fine grain, only on existing pixels (source-atop), wrap-safe for tiling textures
export let PAINT_OVER = true;
function paintOver(g, w, h, wrap) { g.save(); g.globalCompositeOperation = 'source-atop'; const s0 = seed; let sd = (w * 31 + h * 17) % 2147483647 || 7; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const n = Math.round(w * h / 9000); for (let i = 0; i < n; i++) { const x = r() * w, y = r() * h, rad = (0.04 + r() * 0.14) * Math.min(w, h), dark = r() < 0.55;
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, rad); const a = 0.035 + r() * 0.05; gr.addColorStop(0, dark ? `rgba(60,35,20,${a})` : `rgba(255,248,230,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr;
    for (const dx of wrap ? [-w, 0, w] : [0]) for (const dy of wrap ? [-h, 0, h] : [0]) { g.save(); g.translate(x + dx, y + dy); g.beginPath(); g.arc(0, 0, rad, 0, 7); g.fill(); g.restore(); } }
  const m = Math.round(w * h / 60); for (let i = 0; i < m; i++) { g.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.035)' : 'rgba(255,255,255,0.035)'; g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); }
  g.restore(); seed = s0; }
export function ctex(w, h, paint, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); paint(g, w, h); if (PAINT_OVER) paintOver(g, w, h, !!repeat);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  t.userData = { canvas: c, g }; return t;
}
export const lam = (color, o = {}) => new THREE.MeshLambertMaterial({ color, ...o });
const toonGrad = (() => { const d = new Uint8Array([95, 175, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
export const toon = (color, o = {}) => new THREE.MeshToonMaterial({ color, gradientMap: toonGrad, ...o });
const outlineMat = new THREE.MeshBasicMaterial({ color: 0x2b1d16, side: THREE.BackSide });
export function outline(mesh, w = 0.02) { const g = mesh.geometry.clone(); g.computeVertexNormals(); const p = g.attributes.position, n = g.attributes.normal; for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) + n.getX(i) * w, p.getY(i) + n.getY(i) * w, p.getZ(i) + n.getZ(i) * w); const o = new THREE.Mesh(g, outlineMat); mesh.add(o); return mesh; }
export function box(w, h, d, mat, x = 0, y = 0, z = 0, parent, ol = 0) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (ol) outline(m, ol); if (parent) parent.add(m); return m; }
export function plane(w, h, mat, parent) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); if (parent) parent.add(m); return m; }

// ---------- textures ----------
export function woodTex(h = 28, l = 40, planks = 6, vertical = false, size = 512) {
  return ctex(size, size, (g, w, hh) => { for (let i = 0; i < planks; i++) { const d = R(-6, 6); g.fillStyle = `hsl(${h}, 50%, ${l + d}%)`; if (vertical) g.fillRect(i * w / planks, 0, w / planks, hh); else g.fillRect(0, i * hh / planks, w, hh / planks);
    g.strokeStyle = 'rgba(60,30,10,0.3)'; g.lineWidth = 2; for (let k = 0; k < 6; k++) { g.beginPath(); if (vertical) { const x = i * w / planks + R(5, w / planks - 5); g.moveTo(x, 0); g.bezierCurveTo(x + R(-6, 6), hh / 3, x + R(-6, 6), hh * 2 / 3, x, hh); } else { const y = i * hh / planks + R(5, hh / planks - 5); g.moveTo(0, y); g.bezierCurveTo(w / 3, y + R(-6, 6), w * 2 / 3, y + R(-6, 6), w, y); } g.stroke(); }
    g.fillStyle = 'rgba(40,20,5,0.6)'; if (vertical) g.fillRect(i * w / planks, 0, 3, hh); else g.fillRect(0, i * hh / planks, w, 3); } });
}
export function parquetTex(h = 30, l = 46) { return ctex(512, 512, (g, w, hh) => { const n = 8, s = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const v = (i + j) % 2; for (let k = 0; k < 4; k++) { g.fillStyle = `hsl(${h + R(-3, 3)}, 48%, ${l + R(-6, 5)}%)`; if (v) g.fillRect(i * s + k * s / 4, j * s, s / 4, s); else g.fillRect(i * s, j * s + k * s / 4, s, s / 4); } g.strokeStyle = 'rgba(50,25,10,0.45)'; g.lineWidth = 2; g.strokeRect(i * s, j * s, s, s); } }, [1, 1]); }
export function wallpaperTex(base, stripe, motif = 'damask') {
  return ctex(512, 512, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); if (motif === 'stripe') { g.fillStyle = stripe; for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 22, h); }
    else { g.fillStyle = stripe; for (let y = 0; y < h; y += 128) for (let x = (y / 128 % 2) * 64; x < w; x += 128) { g.save(); g.translate(x + 32, y + 64); g.beginPath(); g.moveTo(0, -40); g.bezierCurveTo(26, -20, 26, 20, 0, 40); g.bezierCurveTo(-26, 20, -26, -20, 0, -40); g.fill(); g.beginPath(); g.arc(0, 0, 9, 0, 7); g.fillStyle = base; g.fill(); g.fillStyle = stripe; g.restore(); } }
    g.fillStyle = 'rgba(0,0,0,0.05)'; for (let i = 0; i < 400; i++) g.fillRect(R(0, w), R(0, h), 2, 2); }, [1, 1]);
}
export function stoneTex(base = 'hsl(40,30%,80%)', rows = 8, cols = 4) { return ctex(512, 512, (g, w, h) => { g.fillStyle = '#b9ab90'; g.fillRect(0, 0, w, h); for (let r = 0; r < rows; r++) for (let c = -1; c <= cols; c++) { const bw = w / cols, bh = h / rows, x = c * bw + (r % 2) * bw / 2, y = r * bh; g.fillStyle = `hsl(40, ${R(20, 30)}%, ${R(76, 84)}%)`; g.fillRect(x + 3, y + 3, bw - 6, bh - 6); g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x + 3, y + 3, bw - 6, 3); } }, [1, 1]); }
export function gravelTex() { return ctex(512, 512, (g, w, h) => { g.fillStyle = '#d8c9a6'; g.fillRect(0, 0, w, h); for (let i = 0; i < 3000; i++) { g.fillStyle = `hsla(38, ${R(15, 35)}%, ${R(55, 82)}%, 0.8)`; g.beginPath(); g.arc(R(0, w), R(0, h), R(1, 3), 0, 7); g.fill(); } }, [1, 1]); }
export function grassTex(h1 = 100, l1 = 46) { return ctex(512, 512, (g, w, h) => { g.fillStyle = `hsl(${h1}, 50%, ${l1}%)`; g.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { g.strokeStyle = `hsla(${h1 + R(-12, 12)}, 55%, ${l1 + R(-10, 12)}%, 0.6)`; g.lineWidth = R(1, 2.5); const x = R(0, w), y = R(0, h); g.beginPath(); g.moveTo(x, y); g.lineTo(x + R(-3, 3), y - R(4, 10)); g.stroke(); } }, [1, 1]); }
// generic text sign texture: lines = [{t, size, col, font, y}] in canvas px
export function signTex(w, h, bg, lines, border = 10, extra) {
  return ctex(w, h, (g) => { if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } if (border) { g.strokeStyle = INK; g.lineWidth = border; g.strokeRect(border / 2, border / 2, w - border, h - border); }
    if (extra) extra(g, w, h);
    lines.forEach(L => { g.font = `${L.w || 'bold'} ${L.size}px ${L.font || '"DejaVu Serif", serif'}`; g.textAlign = L.align || 'center'; g.textBaseline = 'middle'; if (L.stroke) { g.strokeStyle = L.stroke; g.lineWidth = L.sw || 8; g.strokeText(L.t, L.x ?? w / 2, L.y); } g.fillStyle = L.col || INK; g.fillText(L.t, L.x ?? w / 2, L.y); }); });
}
export function digitTex(d) { return ctex(128, 192, (g, w, h) => { g.fillStyle = '#f3ead6'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, h / 2 - 2, w, 4); g.fillStyle = INK; g.font = 'bold 150px "DejaVu Serif", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(d), w / 2, h / 2 + 8); }); }
export const DIG = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(digitTex);
export function stampTex(word = 'SOLD', col = '#d0262e') { return ctex(512, 256, (g, w, h) => { g.strokeStyle = col; g.lineWidth = 22; g.strokeRect(16, 16, w - 32, h - 32); g.lineWidth = 6; g.strokeRect(38, 38, w - 76, h - 76); g.fillStyle = col; g.font = 'bold 150px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(word, w / 2, h / 2 + 6); g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 260; i++) { g.beginPath(); g.arc(R(0, w), R(0, h), R(1, 4), 0, 7); g.fill(); } }); }

// ---------- painted (Magnific) textures ----------
export const TEXLOAD = [];
export function imgTex(url, repeat) { const t = new THREE.TextureLoader().load(url); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); } TEXLOAD.push(new Promise(r => { const iv = setInterval(() => { if (t.image && t.image.complete !== false && t.image.width) { clearInterval(iv); r(); } }, 30); })); return t; }
// painted backdrop wall: keeps its own baked light (emissive) but still takes scene light + shadows
export function paintedMat(tex, k = 0.55, base = 0xb8b8b8, opts = {}) { return new THREE.MeshLambertMaterial({ map: tex, color: base, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: k, ...opts }); }
// ---------- lights / sky ----------
export const hemi = new THREE.HemisphereLight(0xdfefff, 0x9c8a62, 1.0); scene.add(hemi);
export const sun = new THREE.DirectionalLight(0xfff1d6, 2.3); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02; scene.add(sun); scene.add(sun.target);
export function placeSun(target, dir = [-6, 10, 5], span = 8, far = 80) { const sc = sun.shadow.camera; sun.target.position.set(...target); sun.position.set(target[0] + dir[0], target[1] + dir[1], target[2] + dir[2]); sc.left = -span; sc.right = span; sc.top = span; sc.bottom = -span; sc.near = 0.5; sc.far = far; sc.updateProjectionMatrix(); }
scene.fog = new THREE.Fog(0xd5e6f3, 80, 600);
export const skyU = { top: { value: new THREE.Color('#5e9be0') }, mid: { value: new THREE.Color('#a9cdf0') }, bot: { value: new THREE.Color('#e3eef5') } };
export const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: 'varying vec3 vp; void main(){ vp = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 bot; varying vec3 vp; void main(){ float y=vp.y; vec3 c = y>0.15? mix(mid,top,smoothstep(0.15,0.7,y)) : mix(bot,mid,smoothstep(-0.05,0.15,y)); gl_FragColor=vec4(c,1.0);\n#include <colorspace_fragment>\n}' }));
sky.renderOrder = -10; scene.add(sky);
export function daySky() { sky.visible = true; skyU.top.value.set('#4f8fdc'); skyU.mid.value.set('#a3c9ef'); skyU.bot.value.set('#e8f0f4'); scene.fog.color.set(0xdbe8f2); scene.fog.near = 90; scene.fog.far = 700; scene.background = null; hemi.color.set(0xdfefff); hemi.groundColor.set(0x9c8a62); }
function cloudTex(sv) { return ctex(768, 384, (g, w, h) => { setSeed(sv); const base = h * 0.72, blobs = []; for (let i = 0; i < 9; i++) { const x = w * (0.12 + 0.76 * i / 8) + R(-20, 20), r = R(40, 70) * (1 - Math.abs(i - 4) / 9 * 0.9); blobs.push([x, base - r * R(0.5, 0.9), r]); } for (let i = 0; i < 5; i++) blobs.push([w * R(0.3, 0.7), base - R(90, 140), R(50, 80)]);
  g.save(); g.beginPath(); blobs.forEach(([x, y, r]) => { g.moveTo(x + r, y); g.arc(x, y, r, 0, 7); }); g.rect(w * 0.1, base - 30, w * 0.8, 30); g.clip(); const gr = g.createLinearGradient(0, base - 220, 0, base); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.55, '#f4f5fc'); gr.addColorStop(1, '#c8c9e8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.restore(); }); }
const CLOUDS = [cloudTex(11), cloudTex(23), cloudTex(37), cloudTex(51)];
export function cloud(parent, x, y, z, s, i) { const m = new THREE.Mesh(new THREE.PlaneGeometry(2 * s, s), new THREE.MeshBasicMaterial({ map: CLOUDS[i % 4], transparent: true, depthWrite: false, fog: false })); m.position.set(x, y, z); parent.add(m); return m; }

// ---------- characters ----------
export const CHAR_GLOW = { k: 0.42 };
export class Char {
  constructor(type, parent) {
    this.type = type; this.canvas = makeCanvas(); this.ctx = this.canvas.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.canvas); this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 8;
    const geo = new THREE.PlaneGeometry(CW, CH); geo.translate(0, CH / 2 - 0.06, 0);
    // v5: characters take the scene light (tinted by moon/candle/neon like the samples); emissive floor keeps them readable
    this.mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: this.tex, emissive: 0xffffff, emissiveMap: this.tex, emissiveIntensity: CHAR_GLOW.k, transparent: true, alphaTest: 0.04, side: THREE.DoubleSide }));
    this.mesh.castShadow = true; this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.tex, alphaTest: 0.5 });
    parent.add(this.mesh); this.key = '';
  }
  set(state, t) { const k = JSON.stringify(state, (kk, v) => typeof v === 'number' ? Math.round(v * 100) / 100 : v); if (k !== this.key) { drawChar(this.ctx, this.type, { ...state, t }); this.tex.needsUpdate = true; this.key = k; } }
  at(x, y, z, s = 1) { this.mesh.position.set(x, y, z); this.mesh.scale.setScalar(s); return this; }
  face(cam) { const m = this.mesh; const wp = new THREE.Vector3(); m.getWorldPosition(wp); const parentRot = m.parent ? m.parent.rotation.y : 0; m.rotation.y = Math.atan2(cam.position.x - wp.x, cam.position.z - wp.z) - parentRot; }
}

// ---------- animation helpers ----------
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const lerp = (a, b, k) => a + (b - a) * k;
export const lerpA = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
export function monotone(keys, t) {
  const n = keys.length; if (t <= keys[0][0]) return keys[0].slice(1); if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
  let i = 0; while (keys[i + 1][0] < t) i++;
  const dim = keys[0].length - 1, out = [];
  for (let d = 1; d <= dim; d++) { const x = keys.map(k => k[0]), y = keys.map(k => k[d]); const del = []; for (let j = 0; j < n - 1; j++) del.push((y[j + 1] - y[j]) / (x[j + 1] - x[j]));
    const m = new Array(n); m[0] = del[0]; m[n - 1] = del[n - 2]; for (let j = 1; j < n - 1; j++) m[j] = del[j - 1] * del[j] <= 0 ? 0 : (del[j - 1] + del[j]) / 2;
    for (let j = 0; j < n - 1; j++) { if (del[j] === 0) { m[j] = 0; m[j + 1] = 0; continue; } const a = m[j] / del[j], b = m[j + 1] / del[j], s = a * a + b * b; if (s > 9) { const tau = 3 / Math.sqrt(s); m[j] = tau * a * del[j]; m[j + 1] = tau * b * del[j]; } }
    const h = x[i + 1] - x[i], u = (t - x[i]) / h, u2 = u * u, u3 = u2 * u; out.push((2 * u3 - 3 * u2 + 1) * y[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * y[i + 1] + (u3 - u2) * h * m[i + 1]); }
  return out;
}
// camera v2: linear extrapolation past end keys + Gaussian time-smoothing (sigma s) so no move is a sub-0.3 s spike
function monoX(keys, t) { const n = keys.length, a = keys[0], b = keys[n - 1];
  if (t < a[0]) { const s = monotone(keys, a[0]), q = monotone(keys, a[0] + 0.02); return s.map((v, i) => v + (q[i] - v) / 0.02 * (t - a[0])); }
  if (t > b[0]) { const s = monotone(keys, b[0]), q = monotone(keys, b[0] - 0.02); return s.map((v, i) => v + (v - q[i]) / 0.02 * (t - b[0])); }
  return monotone(keys, t); }
export let CAM_SIGMA = 0.2;
export function camSmooth(keys, t, sg = (typeof window !== 'undefined' && window.__sg !== undefined) ? window.__sg : CAM_SIGMA) { if (!sg) return monoX(keys, t); const N = 8, acc = new Array(keys[0].length - 1).fill(0); let ws = 0;
  for (let k = -N; k <= N; k++) { const o = k / N * 2.5 * sg, w = Math.exp(-0.5 * (o / sg) ** 2), v = monoX(keys, t + o); for (let i = 0; i < acc.length; i++) acc[i] += w * v[i]; ws += w; }
  return acc.map(v => v / ws); }
// impact kicks (measured on the samples' style): image offset flips sign EVERY frame, ~3 px @720 per unit, roll ±0.23° per unit,
// gone in 7 frames; the push-in should stop on the hit. CAM_KICKS = [[t, gain], ...]; empty = no effect (T015 unchanged)
export let CAM_KICKS = [];
export const setKicks = (list) => { CAM_KICKS = list; };
export const kickAt = (t) => { let a = 0; for (const [t0, g] of CAM_KICKS) { const n = Math.round((t - t0) * 30); if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5; } return a; };
export function setCam(keys, t, sg) { const v = sg === undefined ? camSmooth(keys, t) : camSmooth(keys, t, sg); camera.position.set(v[0], v[1], v[2]); camera.up.set(0, 1, 0); camera.lookAt(v[3], v[4], v[5]); if (v[7]) camera.rotateZ(v[7] * Math.PI / 180);
  const a = kickAt(t); if (a) { const ang = a * 3 / 640 * Math.tan(v[6] * Math.PI / 360); camera.rotateY(ang); camera.rotateX(0.6 * ang); camera.rotateZ(a * 0.004); }
  camera.fov = v[6]; camera.updateProjectionMatrix(); camLook(v); return v; }
export function track(list, t, d = 0.18) { let v = list[0][1]; for (let i = 1; i < list.length; i++) { const [ti, vi] = list[i]; if (t <= ti - d) break; const k = ss(ti - d, ti, t); v = Array.isArray(vi) ? lerpA(v, vi, k) : (k > 0.5 ? vi : v); } return v; }
export const step = (list, t) => { let v = list[0][1]; for (const [ti, vi] of list) if (t >= ti) v = vi; return v; };
export const blink = (t, off) => ((t + off) % 3.3) < 0.09;
// new episodes: eyelid 0 open … 1 shut. Samples' style: gaps 0.5–2.3 s, 4-frame blink half/shut/shut/half, and a blink across
// every expression swap (swaps = word times where expr changes). Pass the result as CH.set({ blink }) — chars2 draws 0.5 as a half lid.
const LID = [0.5, 1, 1, 0.5], hh = (i, s) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
export const blinkLid = (t, seed = 0, swaps = []) => {
  for (const ts of swaps) { const k = Math.floor((t - ts + 2 / 30) * 30) + 1; if (k >= 0 && k < 4) return LID[k]; }
  let s = -2 * hh(seed, 9);
  for (let n = 0; s <= t && n < 400; n++) { const k = Math.floor((t - s) * 30); if (k >= 0 && k < 4) return LID[k]; s += 0.5 + 1.8 * hh(seed * 31 + n, 13); }
  return 0; };
// reactions (expression/action changes) land 0–3 frames BEFORE their word: use t + REACT_LEAD when looking up expression tables
export const REACT_LEAD = 2 / 30;
// GSAP back.out overshoot pop (props/labels/bubbles appearing)
export const pop = (t0, t, d = 0.18) => { const k = clamp((t - t0) / (d * 1.6)); return k <= 0 ? 0 : EASE.pop(k); };
export const talk = (t, on) => on ? (Math.sin(t * 22) > 0) : false;

// ---------- v3 post: depth of field (focus on nearest in-frame character, else look target) + grade + vignette ----------
export const CHARS = [];
const _origAt = Char.prototype.at; Char.prototype.at = function (...a) { if (!CHARS.includes(this)) CHARS.push(this); return _origAt.apply(this, a); };
export const POST = { on: true, lib: true, dof: false, k: 1.0, maxR: 7.5, sat: 1.12, vig: 0.28, focus: null, focusPoint: null };
let lastLook = new THREE.Vector3();
export function camLook(v) { lastLook.set(v[3], v[4], v[5]); }
const rt = new THREE.WebGLRenderTarget(WIDTH, HEIGHT, { samples: 4, type: THREE.HalfFloatType });
rt.depthTexture = new THREE.DepthTexture(WIDTH, HEIGHT); rt.depthTexture.type = THREE.UnsignedIntType;
const postMat = new THREE.ShaderMaterial({ uniforms: { tC: { value: rt.texture }, tD: { value: rt.depthTexture }, near: { value: 0.05 }, far: { value: 1500 }, focus: { value: 5 }, K: { value: 1 }, maxR: { value: 7 }, res: { value: new THREE.Vector2(WIDTH, HEIGHT) }, sat: { value: 1.1 }, vig: { value: 0.25 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }',
  fragmentShader: `#include <packing>
  uniform sampler2D tC; uniform sampler2D tD; uniform float near, far, focus, K, maxR, sat, vig; uniform vec2 res; varying vec2 vUv;
  float vz(vec2 uv){ float d = texture2D(tD, uv).x; return -perspectiveDepthToViewZ(d, near, far); }
  float coc(float z){ return clamp(K * abs(z - focus) / max(z, 0.05) * 1.6, 0.0, 1.0) * maxR; }
  void main(){ float z0 = vz(vUv); float c0 = coc(z0); vec3 acc = texture2D(tC, vUv).rgb; float wsum = 1.0;
    if (c0 > 0.6) { for (int i = 0; i < 24; i++) { float fi = float(i) + 0.5; float r = sqrt(fi / 24.0) * c0; float a = fi * 2.39996; vec2 o = vec2(cos(a), sin(a)) * r / res; float zt = vz(vUv + o); float ct = coc(zt);
        float w = (zt < z0 - 0.05) ? smoothstep(r - 1.0, r + 0.5, ct) : 1.0; acc += texture2D(tC, vUv + o).rgb * w; wsum += w; } }
    vec3 col = acc / wsum;
    float l = dot(col, vec3(0.299, 0.587, 0.114)); col = mix(vec3(l), col, sat);
    col = col * vec3(1.02, 1.0, 0.97) + vec3(0.0, 0.004, 0.018) * (1.0 - l);
    col = (col - 0.5) * 1.05 + 0.5;
    vec2 q = vUv - 0.5; q.x *= 0.75; col *= 1.0 - vig * smoothstep(0.32, 0.78, length(q));
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    #include <colorspace_fragment>
  }` });
const postScene = new THREE.Scene(); const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat));
function visibleWorld(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
export function subjectFocus() { if (POST.focus) return POST.focus; const v = new THREE.Vector3(); let best = Infinity;
  for (const ch of CHARS) { const m = ch.mesh; if (!visibleWorld(m)) continue; m.getWorldPosition(v); v.y += 1.5 * m.scale.y; const p = v.clone().project(camera); const d = v.distanceTo(camera.position);
    if (Math.abs(p.x) < 0.75 && p.y > -1.0 && p.y < 0.95 && p.z < 1 && d < best) best = d; }
  const ld = camera.position.distanceTo(lastLook); return Math.min(best, ld * 1.0) === best ? best : ld; }
// v4 post: pmndrs postprocessing — N8AO contact shadows, DOF on subject, bloom on lamps, grade, vignette, SMAA
let comp = null, dofE = null, aoP = null;
let gradeE, dofPass;
function buildComposer() { comp = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType, stencilBuffer: true }); // stencil: cutaway caps
  comp.addPass(new RenderPass(scene, camera));
  aoP = new N8AOPostPass(scene, camera, WIDTH * SS, HEIGHT * SS); aoP.setQualityMode('Low'); aoP.configuration.halfRes = true; aoP.configuration.aoRadius = 0.7; aoP.configuration.distanceFalloff = 0.6; aoP.configuration.intensity = 2.2; aoP.configuration.color = new THREE.Color(0x1a1020); comp.addPass(aoP);
  // DOF (postprocessing >= 6.3x): focusDistance/focusRange are WORLD units. Off by default: samples are sharp edge to edge.
  dofE = new DepthOfFieldEffect(camera, { worldFocusDistance: 5, worldFocusRange: 40, bokehScale: 1.0, resolutionScale: 1 }); dofE.target = new THREE.Vector3();
  // v5 grade: team samples are saturated (sat 104–133) with glow around light sources → no desaturation, stronger bloom
  gradeE = [new BloomEffect({ intensity: 0.32, luminanceThreshold: 0.82, luminanceSmoothing: 0.18, mipmapBlur: true }), new HueSaturationEffect({ saturation: 0.08 }), new BrightnessContrastEffect({ brightness: 0.0, contrast: 0.08 }), new VignetteEffect({ offset: 0.4, darkness: 0.32 })];
  dofPass = new EffectPass(camera, dofE); comp.addPass(dofPass);
  comp.addPass(new EffectPass(camera, ...gradeE));
  comp.addPass(new EffectPass(camera, new SMAAEffect())); }
export function subjectPoint() { const v = new THREE.Vector3(); let best = Infinity, bp = null;
  for (const ch of CHARS) { const m = ch.mesh; if (!visibleWorld(m)) continue; m.getWorldPosition(v); v.y += 1.5 * m.scale.y; const p = v.clone().project(camera); const d = v.distanceTo(camera.position);
    if (Math.abs(p.x) < 0.75 && p.y > -1.0 && p.y < 0.95 && p.z < 1 && d < best) { best = d; bp = v.clone(); } }
  return bp || lastLook.clone(); }
export function renderPost() { if (POST.lib) { if (!comp) buildComposer(); dofPass.enabled = !!POST.dof; if (POST.dof) { const fp = POST.focusPoint || subjectPoint(); const dl = camera.position.distanceTo(lastLook); if (dl < camera.position.distanceTo(fp)) fp.copy(lastLook); dofE.target.copy(fp); dofE.worldFocusRange = Math.max(30, 8 * camera.position.distanceTo(fp)); } aoP.enabled = POST.ao !== false; comp.render(); return; }
  if (!POST.on) { renderer.render(scene, camera); return; }
  renderer.setRenderTarget(rt); renderer.render(scene, camera); renderer.setRenderTarget(null);
  const u = postMat.uniforms; u.near.value = camera.near; u.far.value = camera.far; u.focus.value = subjectFocus(); u.K.value = POST.k; u.maxR.value = POST.maxR; u.sat.value = POST.sat; u.vig.value = POST.vig;
  renderer.render(postScene, postCam); }
