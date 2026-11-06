// GÓI ĐỒ HOẠ TRUYỀN HÌNH CỐ ĐỊNH (v0.6) — đo trên khung 1080x1920 của video mẫu Cowboys vs 50 babies (05/11/2026).
// Kênh mẫu dùng MỘT bộ nhận diện cho mọi tập cùng môn; chỉ đổi màu đội. KHÔNG đổi phong cách theo tập nữa.
// Thẻ đứng yên, BẬT/TẮT CỨNG đúng điểm cắt (không phóng, không xoay, không mờ dần).
//
//  bug    : y 300–390 hàng chính + dải vàng 390–420; x 70–1010; 3 ô (đội A 290 px | đội B 290 px | đồng hồ 360 px)
//           chữ Inter ExtraBold 44 trắng, tỉ số vàng #F5D50E 52; ô down&distance vàng chữ đen trong ô đồng hồ.
//  card   : x 90–990; dải tiêu đề 62 px (vàng #C9A227 hoặc hồng/đỏ theo phe), chữ 34 px navy đậm;
//           khối navy #0B0F24 @92 %, giá trị trắng Inter ExtraBold 120 px; dòng phụ vàng #F2D21B 40 px. Đặt top ≈ 500.
//  tag    : nhãn nhỏ "▶ REPLAY" (đỏ) / "STARTING QB" (navy viền trắng) góc trên phải hoặc trên đầu nhân vật.
//  final  : bảng FINAL lớn (Inter Black Italic) — ưu tiên dựng 3D trong cảnh tối; bản 2D này dùng khi không có cảnh.
//  flash  : lóa trắng đo trên mẫu — thường [0.58, 0.28] ở khung cắt và khung kế; replay: dâng 4 khung tới 0.8.
//
// Dùng trong trang epXX_gfx.html:  import {TV} from './lib/goi_truyenhinh.js'; const tv=TV({teams:{A:{...},B:{...}}, league:'NFL'});
export const THEME = {
  NFL: { gold: '#C9A227', navy: '#0B0F24', clock: '#12121E', yellow: '#F5D50E', sub: '#F2D21B', head: '#1D1A33' },
  NBA: { gold: '#E8B21C', navy: '#0D1226', clock: '#141420', yellow: '#FFD31A', sub: '#FFD31A', head: '#1D1A33' },
  // MLB: bug dùng q = hiệp ('TOP 9' / 'BOT 9'), clock = số out ('2 OUT'), down = đếm bóng ('3-2'); 3 ô base vẽ bằng setBases()
  MLB: { gold: '#D4A017', navy: '#0C1A33', clock: '#101826', yellow: '#F5D50E', sub: '#F2D21B', head: '#14213D' },
  // WWE: không tỉ số — dùng plate() (thẻ tên đô vật góc dưới), card(), tag('▶ REPLAY'); bug có thể tắt cả tập
  WWE: { gold: '#C0C4CC', navy: '#0A0A10', clock: '#16161E', yellow: '#F2C230', sub: '#F2C230', head: '#0A0A10' },
};
const CSS = (T) => `
@font-face{font-family:TVI;font-weight:800;src:url(fonts/inter-latin-800-normal.woff2)}
@font-face{font-family:TVI;font-weight:900;src:url(fonts/inter-latin-900-normal.woff2)}
@font-face{font-family:TVI;font-weight:900;font-style:italic;src:url(fonts/inter-latin-900-italic.woff2)}
.tv{position:absolute;font-family:TVI;font-weight:800;display:none;letter-spacing:0}
.tv.on{display:block}
.tv-bug{left:70px;top:300px;width:940px}
.tv-bug .row{display:flex;height:90px}
.tv-bug .tm{width:290px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;box-sizing:border-box;color:#fff;font-size:44px}
.tv-bug .tm b{color:${T.yellow};font-size:52px;font-weight:900}
.tv-bug .ck{flex:1;background:${T.clock};display:flex;align-items:center;gap:34px;padding:0 0 0 30px;color:#fff;font-size:40px;position:relative}
.tv-bug .dd{position:absolute;right:0;top:0;bottom:0;display:none;align-items:center;padding:0 16px;background:${T.yellow};color:#111;font-size:30px;font-weight:900}
.tv-bug .dd.on{display:flex}
.tv-bug .sb{height:30px;background:${T.gold};color:#141414;font-size:22px;display:flex;align-items:center;justify-content:center;letter-spacing:.5px}
.tv-card{left:90px;width:900px;top:500px;text-align:center}
.tv-card .h{height:62px;line-height:62px;background:${T.gold};color:${T.head};font-size:34px;letter-spacing:.5px}
.tv-card .b{background:rgba(11,15,36,.92);padding:22px 20px 26px}
.tv-card .v{color:#fff;font-size:120px;line-height:1.02;font-weight:900;white-space:nowrap}
.tv-card .s{color:${T.sub};font-size:40px;margin-top:10px;white-space:nowrap}
.tv-card .rows{color:#fff;font-size:46px;text-align:left;padding:4px 30px}
.tv-card .rows div{display:flex;justify-content:space-between;padding:10px 0}.tv-card .rows b{color:${T.yellow}}
.tv-tag{top:330px;right:40px;padding:8px 20px;font-size:34px;color:#fff;background:#D0021B;font-weight:900}
.tv-tag.navy{background:${T.navy};border:3px solid #fff}
.tv-plate{left:70px;top:1050px;min-width:560px;padding:0}
.tv-plate .n{background:${T.navy};color:#fff;font-weight:900;font-size:64px;padding:10px 28px;border-left:14px solid ${T.yellow};white-space:nowrap}
.tv-plate .s{background:${T.yellow};color:#111;font-size:32px;font-weight:900;padding:6px 28px;display:inline-block}
.tv-bug .bases{position:absolute;right:120px;top:14px;width:62px;height:62px}
.tv-bug .bases i{position:absolute;width:22px;height:22px;border:3px solid #fff;transform:rotate(45deg);box-sizing:border-box}
.tv-bug .bases i.on{background:${T.yellow};border-color:${T.yellow}}
.tv-final{left:0;width:1080px;top:560px;text-align:center}
.tv-final .t{font-style:italic;font-weight:900;font-size:230px;color:#fff;line-height:1;-webkit-text-stroke:6px #000;paint-order:stroke fill}
.tv-final .l{font-size:96px;font-weight:900;line-height:1.15;-webkit-text-stroke:5px #000;paint-order:stroke fill}
.tv-final .s{font-style:italic;font-weight:900;font-size:56px;color:${T.sub};-webkit-text-stroke:4px #000;paint-order:stroke fill}
#tvflash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}
`;
export function TV({ league = 'NFL', teams, sub = '' } = {}) {
  const T = THEME[league] || THEME.NFL;
  const st = document.createElement('style'); st.textContent = CSS(T); document.head.appendChild(st);
  const mk = (cls, html) => { const d = document.createElement('div'); d.className = 'tv ' + cls; d.innerHTML = html; document.body.appendChild(d); return d; };
  const A = teams.A, B = teams.B;
  const bug = mk('tv-bug', `<div class="row"><div class="tm" style="background:${A.color}">${A.abbr}<b class="sa">0</b></div><div class="tm" style="background:${B.color}">${B.abbr}<b class="sb_">0</b></div><div class="ck"><span class="q">1ST</span><span class="c">15:00</span><span class="dd"></span></div></div><div class="sb">${sub}</div>`);
  const flash = document.createElement('div'); flash.id = 'tvflash'; document.body.appendChild(flash);
  const items = {};
  const api = {
    T, bug, items,
    card(id, { head, value, sub = '', headColor, rows } = {}) {
      const body = rows ? `<div class="rows">${rows.map((r, i) => `<div><span>${r[0]}</span><b class="r${i}">${r[1] ?? ''}</b></div>`).join('')}</div>` : `<div class="v">${value}</div>${sub ? `<div class="s">${sub}</div>` : ''}`;
      items[id] = mk('tv-card', `<div class="h" style="${headColor ? 'background:' + headColor : ''}">${head}</div><div class="b">${body}</div>`); return items[id];
    },
    tag(id, text, { navy = false, top, right, left } = {}) { const e = mk('tv-tag' + (navy ? ' navy' : ''), text); if (top != null) e.style.top = top + 'px'; if (right != null) e.style.right = right + 'px'; if (left != null) { e.style.left = left + 'px'; e.style.right = 'auto'; } items[id] = e; return e; },
    // thẻ tên đô vật / nhân vật góc dưới (WWE ra sân, nhân vật mới): đặt top ngoài vùng phụ đề (mặc định 1050 < chân phụ đề 1309 − 2 dòng)
    plate(id, { name, sub = '', top } = {}) { const e = mk('tv-plate', `<div class="n">${name}</div>${sub ? `<div class="s">${sub}</div>` : ''}`); if (top != null) e.style.top = top + 'px'; items[id] = e; return e; },
    // MLB: 3 ô base trong bug (b1, b2, b3 = có người)
    setBases(b1 = false, b2 = false, b3 = false) { let el = bug.querySelector('.bases'); if (!el) { el = document.createElement('div'); el.className = 'bases';
      el.innerHTML = '<i style="left:36px;top:22px"></i><i style="left:20px;top:4px"></i><i style="left:4px;top:22px"></i>'; bug.querySelector('.ck').appendChild(el); }
      const [i1, i2, i3] = el.querySelectorAll('i'); i1.classList.toggle('on', !!b1); i2.classList.toggle('on', !!b2); i3.classList.toggle('on', !!b3); },
    final(id, { a, b, colA = '#fff', colB = '#fff', subline = '' }) { items[id] = mk('tv-final', `<div class="t">FINAL</div><div class="l" style="color:${colA}">${a}</div><div class="l" style="color:${colB}">${b}</div><div class="s">${subline}</div>`); return items[id]; },
    // trạng thái bug mỗi khung
    setBug({ on = true, a, b, q, clock, down } = {}) {
      bug.classList.toggle('on', on); if (a != null) bug.querySelector('.sa').textContent = a; if (b != null) bug.querySelector('.sb_').textContent = b;
      if (q != null) bug.querySelector('.q').textContent = q; if (clock != null) bug.querySelector('.c').textContent = clock;
      const dd = bug.querySelector('.dd'); dd.classList.toggle('on', !!down); if (down) dd.textContent = down;
    },
    // bật đúng các thẻ có trong cửa sổ [a,b) — cứng, không hiệu ứng
    show(t, TL) { const on = new Set(TL.filter(([, a, b]) => t >= a && t < b).map(([id]) => id)); for (const [id, e] of Object.entries(items)) e.classList.toggle('on', on.has(id)); },
    setRows(id, vals) { const e = items[id]; vals.forEach((v, i) => { const x = e.querySelector('.r' + i); if (x) x.textContent = v; }); },
    // lóa trắng: list = [số giây | {t, kind:'replay'}]
    flash(t, list) { flash.style.opacity = flashAlpha(t, list); },
  };
  return api;
}
export function flashAlpha(t, list, fps = 30) {
  let a = 0;
  for (const it of list) { const tc = typeof it === 'number' ? it : it.t, kind = typeof it === 'number' ? 'cut' : it.kind || 'cut';
    const f = Math.round((t - tc) * fps); const P = kind === 'replay' ? { '-3': 0.12, '-2': 0.2, '-1': 0.34, 0: 0.64, 1: 0.81, 2: 0.49, 3: 0.22 } : { 0: 0.58, 1: 0.28 };
    a = Math.max(a, P[f] ?? 0); }
  return a;
}
