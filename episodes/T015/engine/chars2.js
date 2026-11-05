// RickClips character painter v2 — suit characters (1920s Paris), proportions per Style Bible 2.1:
// head ≈32% of height, bean torso ≈30%, stick legs ≈38%. Units: character space, y up from feet.
export const CW = 4.4, CH = 2.6;
export const PX = 860; // v5: 1080p close-ups need ~1.6× the v4 texture density
const W = Math.round(CW * PX), H = Math.round(CH * PX);
const INK = '#1b1e2e', SKIN = '#fdfdfb', SKIN_SH = '#d3d8e3', LIMB = '#23263b';
export function makeCanvas() { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; }
const X = x => W / 2 + x * PX, Y = y => H - 0.06 * PX - y * PX;
function line(ctx, pts, w, col = INK) { ctx.strokeStyle = col; ctx.lineWidth = w * PX; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))); ctx.stroke(); }
function shape(ctx, pts, fill, ow = 0.012, close = true) { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))); if (close) ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (ow) { ctx.strokeStyle = INK; ctx.lineWidth = ow * PX; ctx.lineJoin = 'round'; ctx.stroke(); } }
function ell(ctx, x, y, rx, ry, fill, ow = 0.012, rot = 0) { ctx.beginPath(); ctx.ellipse(X(x), Y(y), Math.max(0.001, rx * PX), Math.max(0.001, ry * PX), rot, 0, Math.PI * 2); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (ow) { ctx.strokeStyle = INK; ctx.lineWidth = ow * PX; ctx.stroke(); } }
function blob(ctx, pts, fill, ow = 0.012) { ctx.beginPath(); const n = pts.length, m = i => [(pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2]; let s = m(n - 1); ctx.moveTo(X(s[0]), Y(s[1])); for (let i = 0; i < n; i++) { const q = m(i); ctx.quadraticCurveTo(X(pts[i][0]), Y(pts[i][1]), X(q[0]), Y(q[1])); } ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (ow) { ctx.strokeStyle = INK; ctx.lineWidth = ow * PX; ctx.stroke(); } }
function grad(ctx, x0, y0, x1, y1, stops) { const g = ctx.createLinearGradient(X(x0), Y(y0), X(x1), Y(y1)); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
function text(ctx, s, x, y, size, col = INK, font = 'bold', align = 'center', rot = 0, family = '"DejaVu Serif", serif') { ctx.save(); ctx.translate(X(x), Y(y)); ctx.rotate(-rot); ctx.fillStyle = col; ctx.font = `${font} ${size * PX}px ${family}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 0); ctx.restore(); }
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; r = Math.round(r * k); g = Math.round(g * k); b = Math.round(b * k); return `rgb(${Math.min(255, r)},${Math.min(255, g)},${Math.min(255, b)})`; };

// ---- v3 ink helpers: variable-width outline (thicker on shadow side, light from upper-left) + hand-drawn wobble
const hash = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0) / 4294967296; };
function outlinePts(pts) { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return a > 0 ? 1 : -1; }
export function inkFill(ctx, pts, fill, w, seed = 0, vary = 0.6) {
  const n = pts.length, sg = outlinePts(pts), out = [];
  for (let i = 0; i < n; i++) { const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n]; let tx = b[0] - a[0], ty = b[1] - a[1]; const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
    const nx = ty * sg, ny = -tx * sg; // outward
    const shadow = Math.max(0, nx * 0.55 - ny * 0.83); // facing down-right
    const ww = w * (1 - vary * 0.45 + vary * 0.95 * shadow) * (1 + 0.12 * Math.sin(i * 0.9 + seed * 40) + 0.08 * Math.sin(i * 2.3 + seed * 17));
    out.push([pts[i][0] + nx * ww, pts[i][1] + ny * ww]); }
  const path = P => { ctx.beginPath(); P.forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))); ctx.closePath(); };
  path(out); ctx.fillStyle = INK; ctx.fill(); ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = w * 0.25 * PX; ctx.stroke();
  if (fill) { path(pts); ctx.fillStyle = fill; ctx.fill(); }
  return () => path(pts);
}
// sample smooth closed curve through control points (quadratic midpoints)
export function smoothPts(pts, per = 10) { const n = pts.length, m = i => [(pts[i % n][0] + pts[(i + 1) % n][0]) / 2, (pts[i % n][1] + pts[(i + 1) % n][1]) / 2], o = [];
  for (let i = 0; i < n; i++) { const a = m(i - 1 + n), c = pts[i], b = m(i); for (let k = 0; k < per; k++) { const u = k / per; o.push([(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]]); } } return o; }
// tapered noodle limb along polyline
function noodle(ctx, P, w0, w1, col = LIMB) { const pts = []; const seg = []; for (let i = 0; i < P.length - 1; i++) for (let k = 0; k < 8; k++) seg.push([P[i][0] + (P[i + 1][0] - P[i][0]) * k / 8, P[i][1] + (P[i + 1][1] - P[i][1]) * k / 8]); seg.push(P[P.length - 1]);
  // chaikin smooth
  let S = seg; for (let r = 0; r < 2; r++) { const T = [S[0]]; for (let i = 0; i < S.length - 1; i++) { T.push([0.75 * S[i][0] + 0.25 * S[i + 1][0], 0.75 * S[i][1] + 0.25 * S[i + 1][1]], [0.25 * S[i][0] + 0.75 * S[i + 1][0], 0.25 * S[i][1] + 0.75 * S[i + 1][1]]); } T.push(S[S.length - 1]); S = T; }
  const L = [], R = []; for (let i = 0; i < S.length; i++) { const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)]; let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l; const u = i / (S.length - 1), w = (w0 + (w1 - w0) * u) / 2 * (1 + 0.06 * Math.sin(u * 9)); L.push([S[i][0] - ty * w, S[i][1] + tx * w]); R.push([S[i][0] + ty * w, S[i][1] - tx * w]); }
  ctx.beginPath(); L.forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))); R.reverse().forEach(p => ctx.lineTo(X(p[0]), Y(p[1]))); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  const e = S[S.length - 1], s0 = S[0]; ctx.beginPath(); ctx.arc(X(e[0]), Y(e[1]), w1 / 2 * PX, 0, 7); ctx.arc(X(s0[0]), Y(s0[1]), w0 / 2 * PX, 0, 7); ctx.fill(); }

export const TYPES = {
  lustig: { coat: '#24252b', shirt: '#f4f1ea', tie: 'bow', tieCol: '#c8323a', hat: 'top', hatCol: '#1c1c22', hair: 'slick', hairCol: '#1b1512', mustache: 'thin', belly: 0, pants: '#1d1e23', vest: '#3b3d46' },
  poisson: { coat: '#a8693a', shirt: '#efe8d8', tie: 'tie', tieCol: '#2f6e4f', hat: 'flat', hatCol: '#6f6a62', hair: 'side', hairCol: '#5a3a22', mustache: 'walrus', glasses: true, belly: 0.09, pants: '#5b4636' },
  d1: { coat: '#3f8a52', shirt: '#efe8d8', tie: 'tie', tieCol: '#e0b13c', hat: 'bowler', hatCol: '#2b2b2b', hair: 'side', hairCol: '#2a1d14', belly: 0.03, pants: '#3a3a40' },
  d2: { coat: '#2f4f8f', shirt: '#efe8d8', tie: 'tie', tieCol: '#c8323a', hat: 'flat', hatCol: '#3b4250', hair: 'side', hairCol: '#6b4423', mustache: 'thin', belly: 0, pants: '#2e2e36' },
  d3: { coat: '#7d7f86', shirt: '#efe8d8', tie: 'bow', tieCol: '#2a2a2a', hat: 'none', hair: 'curly', hairCol: '#d9d6cf', beard: 'full', beardCol: '#e2dfd8', belly: 0.05, pants: '#4a4a50' },
  d4: { coat: '#8a2f3e', shirt: '#efe8d8', tie: 'tie', tieCol: '#e8c04a', hat: 'none', hair: 'bald', hairCol: '#3a2a20', mustache: 'walrus', belly: 0.11, pants: '#3a2c2c' },
  n1: { coat: '#c9842f', shirt: '#efe8d8', tie: 'tie', tieCol: '#2b4f8c', hat: 'bowler', hatCol: '#5a3a1e', hair: 'side', hairCol: '#2a1d14', belly: 0.04, pants: '#4a3a2a' },
  n2: { coat: '#4d6b3a', shirt: '#efe8d8', tie: 'bow', tieCol: '#e0b13c', hat: 'flat', hatCol: '#2f2f2f', hair: 'curly', hairCol: '#1b1512', mustache: 'thin', belly: 0, pants: '#333' },
  n3: { coat: '#5b3f7a', shirt: '#efe8d8', tie: 'tie', tieCol: '#e8e8e8', hat: 'none', hair: 'slick', hairCol: '#a35a2a', belly: 0.07, pants: '#2e2e36' },
  n4: { coat: '#2f7f86', shirt: '#efe8d8', tie: 'tie', tieCol: '#c8323a', hat: 'bowler', hatCol: '#222', hair: 'side', hairCol: '#e0d9cf', mustache: 'walrus', belly: 0.1, pants: '#333' },
  n5: { coat: '#b8483a', shirt: '#efe8d8', tie: 'bow', tieCol: '#1f1f1f', hat: 'flat', hatCol: '#7a6a52', hair: 'side', hairCol: '#3a2a20', glasses: true, belly: 0.02, pants: '#3a2c2c' },
};

const LEG = 0.70, TOP = 1.28, HR = 0.335, HRY = 0.305; // head radii

// p: { expr, look:[dx,dy], blink, arms:{l,r} (hand targets), open:{l,r} (open palm), items:{...}, fx:{blush,sweat,qmarks,bulb,puff,sparkle,drool,franc,heart}, walk(0..1 phase), lean, hatOff }
export function drawChar(ctx, type, p) {
  const T = TYPES[type], sd = hash(type);
  ctx.clearRect(0, 0, W, H); ctx.save();
  const t = p.t || 0, bw = 0.17 + T.belly * 0.55, fx = p.fx || {};
  // legs: long dark noodles, slight inward curve, small shoes
  const sw = p.walk ? Math.sin(p.walk * Math.PI * 2) * 0.09 : 0, lx = 0.075;
  noodle(ctx, [[-lx, LEG + 0.04], [-lx - 0.012 - sw * 0.5, LEG * 0.5], [-lx - sw, 0.05]], 0.044, 0.038);
  noodle(ctx, [[lx, LEG + 0.04], [lx + 0.012 + sw * 0.5, LEG * 0.5], [lx + sw, 0.05]], 0.044, 0.038);
  for (const [x, d] of [[-lx - sw, -1], [lx + sw, 1]]) inkFill(ctx, smoothPts([[x + d * 0.075, 0.02], [x + d * 0.07, 0.07], [x - d * 0.01, 0.075], [x - d * 0.035, 0.03], [x - d * 0.02, 0.0], [x + d * 0.04, -0.005]], 6), '#2a2533', 0.008, sd, 0.3);
  // torso: tall capsule, slightly pear-shaped, wobble
  const tp = [], N = 56, cy = (TOP + LEG - 0.05) / 2, hh = (TOP + 0.03 - (LEG - 0.07)) / 2;
  for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
    const sx = Math.sign(c) * Math.pow(Math.abs(c), 0.72), sy = Math.sign(sn) * Math.pow(Math.abs(sn), 0.9);
    const wob = 1 + 0.025 * Math.sin(a * 3 + sd * 9) + 0.015 * Math.sin(a * 5 + sd * 4);
    const bulge = 1 + (sy < 0 ? (T.belly * 1.6 + 0.04) * (1 - Math.abs(sy)) : -0.05 * sy);
    tp.push([sx * bw * wob * bulge, cy + sy * hh * wob]); }
  const clipT = inkFill(ctx, tp, T.coat, 0.011, sd, 0.5);
  ctx.save(); clipT(); ctx.clip();
  // cel shading: dark crescent on right, soft highlight on left
  ctx.fillStyle = shade(T.coat, 0.74); ctx.beginPath(); ctx.ellipse(X(bw * 1.15), Y(cy - 0.03), bw * 0.85 * PX, hh * 1.25 * PX, 0.08, 0, 7); ctx.fill();
  ctx.globalAlpha = 0.22; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(X(-bw * 0.55), Y(cy + hh * 0.35), bw * 0.16 * PX, hh * 0.45 * PX, 0.1, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  // shirt V + vest + lapels
  shape(ctx, [[-0.085, TOP + 0.05], [0.085, TOP + 0.05], [0.0, TOP - 0.27]], T.shirt, 0.009);
  if (T.vest) shape(ctx, [[-0.06, TOP - 0.17], [0.06, TOP - 0.17], [0.08, 0.84], [0, 0.8], [-0.08, 0.84]], T.vest, 0.008);
  line(ctx, [[-0.09, TOP + 0.04], [-0.025, TOP - 0.28], [-0.0, 0.82]], 0.01, shade(T.coat, 0.45));
  line(ctx, [[0.09, TOP + 0.04], [0.025, TOP - 0.28]], 0.01, shade(T.coat, 0.45));
  ell(ctx, 0.0, 0.98, 0.015, 0.015, '#e8d9a8', 0.006); ell(ctx, 0.0, 0.87, 0.015, 0.015, '#e8d9a8', 0.006);
  ctx.restore();
  if (T.tie === 'bow') { const bt = TOP - 0.0; inkFill(ctx, smoothPts([[0, bt], [-0.1, bt + 0.05], [-0.105, bt - 0.05]], 5), T.tieCol, 0.008, sd, 0.4); inkFill(ctx, smoothPts([[0, bt], [0.1, bt + 0.05], [0.105, bt - 0.05]], 5), T.tieCol, 0.008, sd, 0.4); ell(ctx, 0, bt, 0.024, 0.022, T.tieCol, 0.009); }
  else if (T.tie === 'tie') shape(ctx, [[-0.022, TOP + 0.01], [0.022, TOP + 0.01], [0.032, TOP - 0.2], [0, TOP - 0.25], [-0.032, TOP - 0.2]], T.tieCol, 0.009);
  // arms: dark noodles from shoulders, round ends (no white gloves, like the samples)
  const sh = bw * 0.82, SL = [-sh, TOP - 0.1], SR = [sh, TOP - 0.1];
  const arms = p.arms || {}; const hl = arms.l || [-0.27, 0.84], hr = arms.r || [0.27, 0.84];
  const items = p.items || {};
  const elbow = (S, Hd, side) => { const mx = (S[0] + Hd[0]) / 2, my = (S[1] + Hd[1]) / 2, dx = Hd[0] - S[0], dy = Hd[1] - S[1], L = Math.hypot(dx, dy) || 1, bend = Math.max(0, 0.5 - L) * 0.6; return [mx + side * bend * 0.6 + side * 0.025, my - bend * 0.3 - 0.02]; };
  const hand = (Hd, open, side) => { if (open) { inkFill(ctx, smoothPts([[Hd[0] - 0.045, Hd[1] - 0.02], [Hd[0] + 0.045, Hd[1] - 0.02], [Hd[0] + 0.05, Hd[1] + 0.035], [Hd[0], Hd[1] + 0.055], [Hd[0] - 0.05, Hd[1] + 0.035]], 5), LIMB, 0.004, sd, 0.2); } else { ctx.fillStyle = LIMB; ctx.beginPath(); ctx.arc(X(Hd[0]), Y(Hd[1]), 0.03 * PX, 0, 7); ctx.fill(); } };
  const arm = (S, Hd, side) => { const e = elbow(S, Hd, side); noodle(ctx, [S, e, Hd], 0.046, 0.04); };
  if (items.cane) drawCane(ctx, items.cane.hand === 'l' ? hl : hr);
  arm(SL, hl, -1); arm(SR, hr, 1);
  for (const k of ['paper', 'paper2', 'envelope', 'envelope2', 'paddle', 'slip', 'stamp', 'suitcase', 'key']) if (items[k]) drawItem(ctx, k, items[k], items[k].hand === 'l' ? hl : hr, t);
  hand(hl, p.open && p.open.l, -1); hand(hr, p.open && p.open.r, 1);
  const hx = (p.lean || 0) * 0.06, hy = TOP + HRY - 0.03 + (p.bob || 0);
  drawHead(ctx, T, hx, hy, p, sd);
  if (items.newspaper) drawNewspaper(ctx, items.newspaper, hx, hy);
  drawFx(ctx, fx, hx, hy, t);
  ctx.restore();
}

function drawCane(ctx, Hd) { line(ctx, [[Hd[0], Hd[1] + 0.02], [Hd[0] + 0.06, 0.02]], 0.03, INK); line(ctx, [[Hd[0], Hd[1] + 0.02], [Hd[0] + 0.06, 0.02]], 0.016, '#3a2418'); ell(ctx, Hd[0], Hd[1] + 0.05, 0.035, 0.03, '#e2b33b', 0.008); }

function drawItem(ctx, k, it, Hd, t) {
  ctx.save(); ctx.translate(X(Hd[0] + (it.ox || 0)), Y(Hd[1] + (it.oy || 0))); ctx.rotate(-(it.ang || 0) * Math.PI / 180);
  const s = PX, R = (x, y, w, h, f, o = 0.01) => { ctx.fillStyle = f; ctx.fillRect(x * s, -y * s - h * s, w * s, h * s); if (o) { ctx.strokeStyle = INK; ctx.lineWidth = o * s; ctx.strokeRect(x * s, -y * s - h * s, w * s, h * s); } };
  const T = (str, x, y, size, col = INK, fam = '"DejaVu Serif", serif', wgt = 'bold') => { ctx.fillStyle = col; ctx.font = `${wgt} ${size * s}px ${fam}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, x * s, -y * s); };
  if (k === 'paper' || k === 'paper2') { const w = it.w || 0.42, h = it.h || 0.55; R(-w / 2, -0.06, w, h, '#fbf6e8'); T(it.title || 'DEED', 0, h - 0.13, 0.065); if (it.sub) T(it.sub, 0, h - 0.22, 0.045, '#444'); ctx.fillStyle = '#9a9488'; for (let i = 0; i < 4; i++) ctx.fillRect(-w * 0.38 * s, -(h * 0.42 - i * 0.06) * s, w * 0.76 * s, 0.012 * s);
    if (it.stamp) stampMark(ctx, 0, h * 0.25, 0.3 * w / 0.42, it.stamp, it.stampText || 'SOLD', -12); if (it.stamp2) stampMark(ctx, 0.04, h * 0.05, 0.3 * w / 0.42, it.stamp2, it.stampText || 'SOLD', 10); }
  if (k === 'envelope' || k === 'envelope2') { const w = it.w || 0.4, h = it.h || 0.26; R(-w / 2, -0.08, w, h, '#e9d6a8'); ctx.strokeStyle = INK; ctx.lineWidth = 0.008 * s; ctx.beginPath(); ctx.moveTo(-w / 2 * s, -(h - 0.08) * s); ctx.lineTo(0, -(h * 0.4 - 0.08) * s); ctx.lineTo(w / 2 * s, -(h - 0.08) * s); ctx.stroke();
    ctx.fillStyle = '#7fb36a'; for (let i = 0; i < 3; i++) { ctx.fillRect((-w / 2 + 0.03 + i * 0.05) * s, -(h - 0.02 + i * 0.012) * s, w * 0.8 * s, 0.05 * s); } T(it.label || 'FR', 0, 0.02, 0.05, '#2b5d2b'); }
  if (k === 'paddle') { line2(ctx, 0, 0, 0, 0.32, 0.03); ell2(ctx, 0, 0.42, 0.12, 0.12, '#fbf6e8'); T(String(it.num || 1), 0, 0.42, 0.11, '#c8323a'); }
  if (k === 'slip') { const w = 0.3, h = 0.16; R(-w / 2, 0.0, w, h, '#fffdf3'); T('SALARY', 0, 0.115, 0.04, '#555'); T(it.text || '3 FR', 0, 0.05, 0.06, '#c8323a'); }
  if (k === 'stamp') { R(-0.07, 0.0, 0.14, 0.05, '#c8323a'); R(-0.025, 0.05, 0.05, 0.12, '#7a4b25'); ell2(ctx, 0, 0.21, 0.06, 0.05, '#7a4b25'); }
  if (k === 'suitcase') { R(-0.26, -0.12, 0.52, 0.34, '#7a4b25', 0.012); ctx.fillStyle = '#7fb36a'; for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate((-0.2 + i * 0.1) * s, -0.24 * s); ctx.rotate((i - 2) * 0.25); ctx.fillRect(-0.04 * s, -0.08 * s, 0.08 * s, 0.14 * s); ctx.strokeStyle = INK; ctx.lineWidth = 0.006 * s; ctx.strokeRect(-0.04 * s, -0.08 * s, 0.08 * s, 0.14 * s); ctx.restore(); } R(-0.06, 0.22, 0.12, 0.05, '#4a2e16'); }
  if (k === 'key') { ell2(ctx, 0, 0.06, 0.05, 0.05, '#e2b33b'); line2(ctx, 0, 0.01, 0, -0.15, 0.025, '#e2b33b'); }
  ctx.restore();
}
function line2(ctx, x0, y0, x1, y1, w, col = '#5a3a1e') { ctx.strokeStyle = INK; ctx.lineWidth = (w + 0.014) * PX; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0 * PX, -y0 * PX); ctx.lineTo(x1 * PX, -y1 * PX); ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = w * PX; ctx.stroke(); }
function ell2(ctx, x, y, rx, ry, f) { ctx.beginPath(); ctx.ellipse(x * PX, -y * PX, rx * PX, ry * PX, 0, 0, 7); ctx.fillStyle = f; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.01 * PX; ctx.stroke(); }
export function stampMark(ctx, x, y, size, k, word = 'SOLD', rotDeg = -12) { // drawn in item-local px space (y up = negative)
  if (k <= 0) return; const sc = 1 + (1 - Math.min(1, k)) * 1.2; ctx.save(); ctx.translate(x * PX, -y * PX); ctx.rotate(rotDeg * Math.PI / 180); ctx.scale(sc, sc); ctx.globalAlpha = Math.min(1, k * 1.5);
  ctx.strokeStyle = '#d0262e'; ctx.lineWidth = 0.02 * PX; ctx.strokeRect(-size / 2 * PX, -size * 0.22 * PX, size * PX, size * 0.44 * PX); ctx.fillStyle = '#d0262e'; ctx.font = `bold ${size * 0.32 * PX}px "DejaVu Sans", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(word, 0, 0); ctx.restore(); }

function drawNewspaper(ctx, it, hx, hy) { // held up in front of face, k = how high (0 lowered, 1 covering face)
  const k = it.k ?? 1, cy = hy - 0.32 + k * 0.3, w = 0.78, h = 0.5;
  shape(ctx, [[-w / 2, cy - h / 2], [w / 2, cy - h / 2], [w / 2, cy + h / 2], [-w / 2, cy + h / 2]], '#f1ead8', 0.012);
  text(ctx, it.title || 'LE JOURNAL', 0, cy + h / 2 - 0.07, 0.06); line(ctx, [[-w / 2 + 0.03, cy + h / 2 - 0.12], [w / 2 - 0.03, cy + h / 2 - 0.12]], 0.006);
  for (let i = 0; i < 5; i++) { line(ctx, [[-w / 2 + 0.04, cy + 0.08 - i * 0.05], [-0.04, cy + 0.08 - i * 0.05]], 0.008, '#9a9488'); line(ctx, [[0.04, cy + 0.08 - i * 0.05], [w / 2 - 0.04, cy + 0.08 - i * 0.05]], 0.008, '#9a9488'); }
  line(ctx, [[0, cy - h / 2], [0, cy + h / 2]], 0.006, '#b9b1a0');
}

function drawHead(ctx, T, hx, hy, p, sd = 0) {
  const rx = HR, ry = HRY, e = p.expr || 'neutral', fx = p.fx || {};
  if (T.beard === 'full') inkFill(ctx, smoothPts([[hx - 0.3, hy - 0.02], [hx - 0.3, hy - 0.22], [hx - 0.15, hy - 0.4], [hx, hy - 0.45], [hx + 0.15, hy - 0.4], [hx + 0.3, hy - 0.22], [hx + 0.3, hy - 0.02]], 6), T.beardCol, 0.012, sd);
  if (T.hair === 'curly') for (let i = 0; i < 9; i++) { const a = Math.PI * (0.05 + i * 0.112); inkFill(ctx, smoothPts([0, 1, 2, 3, 4, 5].map(k => [hx + Math.cos(a) * rx * 0.98 + Math.cos(k) * 0.075, hy + Math.sin(a) * ry * 0.95 + Math.sin(k) * 0.075]), 4), T.hairCol, 0.009, sd + i, 0.4); }
  // head: near-round, slightly wider than tall, hand-drawn wobble, flatter jaw on one side
  const hp = [], N = 90;
  for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
    const wob = 1 + 0.022 * Math.sin(2 * a + sd * 7) + 0.016 * Math.sin(3 * a + sd * 13) + 0.008 * Math.sin(5 * a + sd * 3);
    const yy = sn < 0 ? sn * (0.93 - 0.05 * Math.max(0, -c)) : sn; hp.push([hx + c * rx * wob, hy + yy * ry * wob]); }
  const clipH = inkFill(ctx, hp, SKIN, 0.012, sd, 0.45);
  ctx.save(); clipH(); ctx.clip();
  // v5: soft gradient shading (samples), light from upper-left, shadow pooling lower-right
  const g = ctx.createRadialGradient(X(hx - 0.12), Y(hy + 0.14), 0.03 * PX, X(hx - 0.02), Y(hy + 0.02), 0.46 * PX); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.55, 'rgba(205,210,228,0.22)'); g.addColorStop(1, 'rgba(150,158,190,0.62)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (p.rim) { // rim light on the side facing the scene's key light (p.rim = {col, side:+1 right/-1 left, a})
    const s = p.rim.side || 1, rg = ctx.createLinearGradient(X(hx + s * rx * 1.02), 0, X(hx + s * rx * 0.55), 0); rg.addColorStop(0, p.rim.col || '#ffe2a8'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = p.rim.a ?? 0.75; ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  ctx.restore();
  if (T.beard === 'full') inkFill(ctx, smoothPts([[hx - 0.3, hy - 0.06], [hx - 0.24, hy - 0.26], [hx - 0.08, hy - 0.37], [hx + 0.08, hy - 0.37], [hx + 0.24, hy - 0.26], [hx + 0.3, hy - 0.06], [hx + 0.14, hy - 0.14], [hx, hy - 0.12], [hx - 0.14, hy - 0.14]], 6), T.beardCol, 0.01, sd);
  // hair caps (solid, outlined)
  const hair = pts => inkFill(ctx, smoothPts(pts, 8), T.hairCol, 0.009, sd, 0.45);
  if (T.hair === 'slick') hair([[hx - rx * 0.98, hy + 0.06], [hx - rx * 0.88, hy + ry * 0.78], [hx - 0.05, hy + ry * 1.1], [hx + rx * 0.82, hy + ry * 0.86], [hx + rx * 1.0, hy + 0.08], [hx + rx * 0.62, hy + ry * 0.66], [hx + 0.02, hy + ry * 0.74], [hx - rx * 0.7, hy + ry * 0.56]]);
  if (T.hair === 'side') hair([[hx - rx * 1.0, hy + 0.02], [hx - rx * 0.92, hy + ry * 0.78], [hx - 0.1, hy + ry * 1.1], [hx + rx * 0.78, hy + ry * 0.92], [hx + rx * 1.0, hy + 0.12], [hx + rx * 0.72, hy + ry * 0.58], [hx - 0.15, hy + ry * 0.7], [hx - rx * 0.78, hy + ry * 0.42]]);
  if (T.hair === 'bald') { inkFill(ctx, smoothPts([[hx - rx * 1.0, hy - 0.04], [hx - rx * 1.04, hy + 0.12], [hx - rx * 0.86, hy + 0.1], [hx - rx * 0.88, hy - 0.02]], 5), T.hairCol, 0.008, sd); inkFill(ctx, smoothPts([[hx + rx * 1.0, hy - 0.04], [hx + rx * 1.04, hy + 0.12], [hx + rx * 0.86, hy + 0.1], [hx + rx * 0.88, hy - 0.02]], 5), T.hairCol, 0.008, sd); }
  // face: small features, low-centre, dot eyes like the samples
  const ex = 0.088, ey = hy - 0.01, look = p.look || [0, 0];
  const brow = (cx, side, dy, tilt) => { const by = ey + 0.085 + dy, tt = tilt * 0.03 * side; inkFill(ctx, [[cx - 0.052, by + tt - 0.012], [cx + 0.052, by - tt - 0.012], [cx + 0.05, by - tt + 0.014], [cx - 0.05, by + tt + 0.016]], INK, 0.002, sd, 0); };
  const eye = (cx, side) => {
    let lid = 0, wide = false, dy = 0, tilt = 0;
    switch (e) { case 'smug': lid = 0.38; dy = side < 0 ? 0.012 : -0.004; break; case 'grin': dy = 0.012; break; case 'shock': wide = true; dy = 0.04; break;
      case 'worried': case 'ashamed': tilt = 0.9; dy = 0.008; break; case 'angry': lid = 0.35; tilt = -1.1; dy = -0.01; break; case 'stare': lid = 0.5; tilt = -0.5; break;
      case 'squint': lid = side < 0 ? 0.62 : 0; dy = side < 0 ? -0.012 : 0.03; tilt = side < 0 ? -0.6 : 0.3; break; case 'greedy': wide = true; dy = 0.03; break; }
    if (p.blink === true || p.blink >= 1) lid = 1; else if (p.blink > 0) lid = Math.max(lid, p.blink);
    const closed = e === 'sleepy' || e === 'laugh' || e === 'sigh' || (e === 'wink' && side > 0);
    if (closed || lid >= 1) { if (e === 'laugh' || e === 'wink') line(ctx, [[cx - 0.045, ey - 0.012], [cx, ey + 0.026], [cx + 0.045, ey - 0.012]], 0.017); else line(ctx, [[cx - 0.045, ey + 0.004], [cx, ey - 0.018], [cx + 0.045, ey + 0.004]], 0.016); brow(cx, side, e === 'sigh' ? 0.01 : 0, e === 'sigh' ? 0.7 : 0); return; }
    const lk = e === 'ashamed' ? [look[0], -1] : look;
    if (wide) { ell(ctx, cx, ey, 0.058, 0.064, '#ffffff', 0.011);
      if (fx.franc && e === 'greedy') text(ctx, '₣', cx, ey - 0.004, 0.095, '#2f8f3a', 'bold', 'center', 0, '"DejaVu Sans", sans-serif');
      else ell(ctx, cx + lk[0] * 0.02, ey + lk[1] * 0.02, 0.016, 0.018, INK, 0); }
    else { const px = cx + lk[0] * 0.018, py = ey + lk[1] * 0.014; ell(ctx, px, py, 0.029, 0.041, INK, 0); ell(ctx, px - 0.008, py + 0.013, 0.008, 0.008, '#ffffff', 0);
      if (lid > 0) { const top = ey + 0.04, cut = top - 0.08 * lid; ctx.fillStyle = SKIN; ctx.fillRect(X(cx - 0.05), Y(top + 0.02), 0.1 * PX, (top + 0.02 - cut) * PX); line(ctx, [[cx - 0.05, cut + (tilt * side * 0.012)], [cx + 0.05, cut - (tilt * side * 0.012)]], 0.019); } }
    brow(cx, side, dy + (lid > 0 ? -0.02 : 0), tilt);
  };
  eye(hx - ex, -1); eye(hx + ex, 1);
  if (T.glasses) { ell(ctx, hx - ex, ey, 0.068, 0.068, 'rgba(220,235,255,0.18)', 0.011); ell(ctx, hx + ex, ey, 0.068, 0.068, 'rgba(220,235,255,0.18)', 0.011); line(ctx, [[hx - ex + 0.068, ey + 0.008], [hx + ex - 0.068, ey + 0.008]], 0.01); }
  const my = hy - 0.118;
  if (T.mustache === 'thin') { line(ctx, [[hx - 0.075, my - 0.008], [hx - 0.015, my + 0.012]], 0.016, '#1b1512'); line(ctx, [[hx + 0.075, my - 0.008], [hx + 0.015, my + 0.012]], 0.016, '#1b1512'); }
  if (T.mustache === 'walrus') inkFill(ctx, smoothPts([[hx, my + 0.022], [hx - 0.055, my + 0.03], [hx - 0.11, my - 0.025], [hx - 0.07, my - 0.012], [hx, my - 0.004], [hx + 0.07, my - 0.012], [hx + 0.11, my - 0.025], [hx + 0.055, my + 0.03]], 5), T.hairCol === '#e0d9cf' ? '#e0d9cf' : '#4a3020', 0.006, sd, 0.3);
  const mY = my - 0.058;
  switch (e) {
    case 'grin': case 'laugh': case 'greedy': case 'wink': inkFill(ctx, smoothPts([[hx - 0.085, mY + 0.022], [hx, mY + 0.03], [hx + 0.085, mY + 0.022], [hx + 0.05, mY - 0.05], [hx, mY - 0.06], [hx - 0.05, mY - 0.05]], 5), '#ffffff', 0.009, sd, 0.4); line(ctx, [[hx - 0.075, mY - 0.008], [hx + 0.075, mY - 0.008]], 0.006); for (const dx of [-0.028, 0.028]) line(ctx, [[hx + dx, mY + 0.02], [hx + dx, mY - 0.045]], 0.005); break;
    case 'smug': line(ctx, [[hx - 0.06, mY + 0.004], [hx + 0.02, mY - 0.008], [hx + 0.07, mY + 0.026]], 0.016); break;
    case 'shock': inkFill(ctx, smoothPts([[hx, mY + 0.03], [hx + 0.032, mY - 0.01], [hx, mY - 0.055], [hx - 0.032, mY - 0.01]], 6), '#5a2320', 0.01, sd); break;
    case 'sigh': ell(ctx, hx, mY, 0.022, 0.026, '#5a2320', 0.012); break;
    case 'worried': case 'ashamed': line(ctx, [[hx - 0.06, mY], [hx - 0.03, mY + 0.014], [hx, mY], [hx + 0.03, mY + 0.014], [hx + 0.06, mY]], 0.015); break;
    case 'squint': line(ctx, [[hx - 0.05, mY - 0.01], [hx + 0.05, mY + 0.01]], 0.016); break;
    case 'angry': case 'stare': line(ctx, [[hx - 0.055, mY + 0.004], [hx + 0.055, mY - 0.004]], 0.018); break;
    default: line(ctx, [[hx - 0.045, mY], [hx, mY - 0.012], [hx + 0.045, mY]], 0.016);
  }
  if (fx.drool) { ctx.save(); ctx.fillStyle = '#9fd8f2'; ctx.beginPath(); const dx = hx + 0.06, dy = mY - 0.04; ctx.moveTo(X(dx - 0.01), Y(dy)); ctx.quadraticCurveTo(X(dx - 0.02), Y(dy - 0.06 * fx.drool), X(dx), Y(dy - 0.08 * fx.drool)); ctx.quadraticCurveTo(X(dx + 0.02), Y(dy - 0.06 * fx.drool), X(dx + 0.01), Y(dy)); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.006 * PX; ctx.stroke(); ctx.restore(); }
  if (fx.blush) { ctx.save(); ctx.globalAlpha = Math.min(1, fx.blush) * 0.8; ell(ctx, hx - 0.18, hy - 0.07, 0.065, 0.035, '#f08a8a', 0); ell(ctx, hx + 0.18, hy - 0.07, 0.065, 0.035, '#f08a8a', 0); for (const s of [-1, 1]) for (let i = 0; i < 3; i++) line(ctx, [[hx + s * 0.15 + i * 0.03 - 0.03, hy - 0.05], [hx + s * 0.15 + i * 0.03 - 0.01, hy - 0.09]], 0.009, '#d2464f'); ctx.restore(); }
  // hats (outlined with variable ink)
  const top = hy + ry * 0.9;
  if (!p.hatOff) {
    if (T.hat === 'top') { const l = p.hatLift || 0; inkFill(ctx, smoothPts([[hx - 0.37, top - 0.02 + l], [hx + 0.37, top - 0.01 + l], [hx + 0.38, top + 0.045 + l], [hx - 0.36, top + 0.05 + l]], 3), T.hatCol, 0.013, sd, 0.6); inkFill(ctx, [[hx - 0.215, top + 0.04 + l], [hx + 0.215, top + 0.04 + l], [hx + 0.235, top + 0.43 + l], [hx - 0.24, top + 0.425 + l]], T.hatCol, 0.013, sd, 0.6); shape(ctx, [[hx - 0.218, top + 0.085 + l], [hx + 0.218, top + 0.085 + l], [hx + 0.222, top + 0.145 + l], [hx - 0.222, top + 0.145 + l]], '#a8222f', 0); ctx.globalAlpha = 0.18; shape(ctx, [[hx - 0.18, top + 0.17 + l], [hx - 0.12, top + 0.17 + l], [hx - 0.12, top + 0.4 + l], [hx - 0.18, top + 0.4 + l]], '#ffffff', 0); ctx.globalAlpha = 1; }
    if (T.hat === 'bowler') { inkFill(ctx, smoothPts([[hx - 0.38, top - 0.02], [hx + 0.38, top - 0.02], [hx + 0.34, top + 0.03], [hx - 0.34, top + 0.03]], 3), T.hatCol, 0.012, sd); const bp = []; for (let i = 0; i <= 20; i++) { const a = Math.PI * i / 20; bp.push([hx + Math.cos(a) * 0.27, top + 0.02 + Math.sin(a) * 0.25]); } inkFill(ctx, bp, T.hatCol, 0.012, sd, 0.6); line(ctx, [[hx - 0.26, top + 0.06], [hx + 0.26, top + 0.06]], 0.024, '#111'); }
    if (T.hat === 'flat') inkFill(ctx, smoothPts([[hx - 0.36, top - 0.03], [hx - 0.3, top + 0.11], [hx, top + 0.17], [hx + 0.34, top + 0.09], [hx + 0.47, top - 0.02], [hx + 0.2, top - 0.06], [hx - 0.1, top - 0.05]], 8), T.hatCol, 0.013, sd, 0.6);
  }
}

function drawFx(ctx, fx, hx, hy, t) {
  if (fx.sweat) { const drop = (x, y, s) => { ctx.beginPath(); ctx.moveTo(X(x), Y(y + s * 1.4)); ctx.quadraticCurveTo(X(x + s), Y(y - s * 0.2), X(x), Y(y - s)); ctx.quadraticCurveTo(X(x - s), Y(y - s * 0.2), X(x), Y(y + s * 1.4)); ctx.fillStyle = '#8fd3f4'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.007 * PX; ctx.stroke(); }; drop(hx + 0.3, hy + 0.16 - (t * 0.15) % 0.08, 0.04); if (fx.sweat > 1) drop(hx - 0.32, hy + 0.08, 0.032); }
  if (fx.qmarks) { const n = fx.qmarks; ctx.save(); ctx.globalAlpha = Math.min(1, n); for (let i = 0; i < 3; i++) { const yy = hy + 0.52 + i * 0.02 + Math.sin(t * 4 + i * 2) * 0.03, xx = hx - 0.25 + i * 0.25; text(ctx, '?', xx, yy + (i === 1 ? 0.1 : 0), 0.2, '#ffffff', 'bold', 'center', 0, '"DejaVu Sans", sans-serif'); ctx.lineWidth = 0.01 * PX; ctx.strokeStyle = INK; ctx.font = `bold ${0.2 * PX}px "DejaVu Sans", sans-serif`; ctx.strokeText('?', X(xx), Y(yy + (i === 1 ? 0.1 : 0))); } ctx.restore(); }
  if (fx.bulb) { const k = Math.min(1, fx.bulb), bx = hx + 0.0, by = hy + 0.68; ctx.save(); ctx.globalAlpha = k; const rg = ctx.createRadialGradient(X(bx), Y(by), 0, X(bx), Y(by), 0.3 * PX); rg.addColorStop(0, 'rgba(255,240,150,0.9)'); rg.addColorStop(1, 'rgba(255,240,150,0)'); ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(X(bx), Y(by), 0.3 * PX, 0, 7); ctx.fill(); ell(ctx, bx, by, 0.1, 0.11, '#ffe56b', 0.011); shape(ctx, [[bx - 0.045, by - 0.1], [bx + 0.045, by - 0.1], [bx + 0.04, by - 0.17], [bx - 0.04, by - 0.17]], '#9aa3ad', 0.009); for (let i = 0; i < 7; i++) { const a = Math.PI * (0.05 + i * 0.15); line(ctx, [[bx + Math.cos(a) * 0.15, by + Math.sin(a) * 0.15], [bx + Math.cos(a) * 0.22, by + Math.sin(a) * 0.22]], 0.012, '#f2b632'); } ctx.restore(); }
  if (fx.puff) { const k = fx.puff; ctx.save(); ctx.globalAlpha = Math.max(0, 1 - Math.abs(k - 0.5) * 2) * 0.9; for (let i = 0; i < 3; i++) ell(ctx, hx + 0.2 + k * 0.4 + i * 0.07, hy - 0.15 + i * 0.04, 0.06 + i * 0.02, 0.05 + i * 0.015, '#ffffff', 0.008); ctx.restore(); }
  if (fx.sparkle) { const k = fx.sparkle; ctx.save(); ctx.globalAlpha = Math.min(1, k); for (let i = 0; i < 4; i++) { const a = i * 1.7 + t * 2, r = 0.42 + 0.04 * Math.sin(t * 5 + i), x = hx + Math.cos(a) * r, y = hy + 0.1 + Math.sin(a) * r * 0.8, s = 0.05; ctx.fillStyle = '#fff3a8'; ctx.beginPath(); ctx.moveTo(X(x), Y(y + s)); ctx.lineTo(X(x + s * 0.3), Y(y + s * 0.3)); ctx.lineTo(X(x + s), Y(y)); ctx.lineTo(X(x + s * 0.3), Y(y - s * 0.3)); ctx.lineTo(X(x), Y(y - s)); ctx.lineTo(X(x - s * 0.3), Y(y - s * 0.3)); ctx.lineTo(X(x - s), Y(y)); ctx.lineTo(X(x - s * 0.3), Y(y + s * 0.3)); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.005 * PX; ctx.stroke(); } ctx.restore(); }
  if (fx.shame) { ctx.save(); ctx.globalAlpha = Math.min(1, fx.shame); for (let i = 0; i < 4; i++) line(ctx, [[hx - 0.24 + i * 0.16, hy + 0.36], [hx - 0.24 + i * 0.16, hy + 0.12]], 0.012, '#5a64b8'); ctx.restore(); }
}
