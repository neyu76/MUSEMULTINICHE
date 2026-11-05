"""QA đo theo mẫu (v0.6) — chạy trên bản cắt thử hoặc bản cuối, so với dải đo trên video mẫu.
Đo: thời lượng, nhịp đọc (nếu có words.json), shot & lóa trắng, máy quay (đứng / đẩy / cú lia), màu, phụ đề (font, cỡ, chân chữ),
và xuất ảnh ghép 1 khung/giây có vạch dải phụ đề (y 1265–1325) để soi mặt/chủ thể bị phụ đề che.
Cần: python3 + opencv-python + numpy; ffmpeg; tesseract không cần.
Dùng: python3 kiem_theo_mau.py <video.mp4> [--words giong/words.json] [--sheet ra.jpg] [--co-phu-de]   (--co-phu-de: video đã đốt phụ đề)
Dải mẫu (V1 McGregor 71,8 s / V2 Cowboys 61,5 s, đo 05/11/2026):
  thời lượng 61–72 s · 160–161 từ/phút · shot trung vị 1,62–1,77 s · lóa trắng 3–10 lần (đỉnh 0,5–0,65, 2 khung)
  máy (đo bằng chính công cụ này): đứng 54–71 % · đẩy chậm 14–27 % · cú lia nhanh 2,7–2,8 / 10 s
  (E04 v0.5 đo cùng công cụ: đứng 75 %, đẩy 11 %, lia 0,8 / 10 s, bão hòa 46, sáng 150, 174 từ/phút, 0 lóa)
  màu (HSV trung vị): bão hòa 76–128 · sáng 95–134
  phụ đề: chữ vàng rộng 572 px cho "could the dallas cowboys" (Inter ExtraBold), chân chữ y = 1309
"""
import argparse, json, subprocess, sys
import cv2, numpy as np
ap = argparse.ArgumentParser(); ap.add_argument('video'); ap.add_argument('--words'); ap.add_argument('--sheet'); ap.add_argument('--co-phu-de', action='store_true')
a = ap.parse_args()
RANGE = dict(dur=(55, 85), wpm=(152, 166), shot=(1.5, 2.2), flash=(3, 12), static=(0.45, 0.75), push=(0.12, 0.35), moves=(1.2, 3.0), sat=(75, 135), val=(95, 140))
cap = cv2.VideoCapture(a.video); fps = cap.get(cv2.CAP_PROP_FPS) or 30
L, S, H, flows, looks, prev, i = [], [], [], [], [], None, 0
cap_rows = []
while True:
    ok, f = cap.read()
    if not ok: break
    g = cv2.resize(f, (270, 480)); hsv = cv2.cvtColor(g, cv2.COLOR_BGR2HSV)
    L.append(hsv[..., 2].mean()); S.append(hsv[..., 1].mean())
    h = cv2.calcHist([hsv], [0, 1], None, [16, 8], [0, 180, 0, 256]); cv2.normalize(h, h); H.append(h.flatten().astype(np.float32))
    gr = cv2.cvtColor(g, cv2.COLOR_BGR2GRAY); gr[316:356] = 0  # che dải phụ đề
    if prev is not None:
        fl = cv2.calcOpticalFlowFarneback(prev, gr, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        yy, xx = np.mgrid[0:480, 0:270]; cx, cy = xx - 135, yy - 240
        tr = np.hypot(np.median(fl[..., 0]), np.median(fl[..., 1]))
        zoom = np.median((fl[..., 0] * cx + fl[..., 1] * cy) / (cx * cx + cy * cy + 1e-6)) * 100  # %/khung
        flows.append((tr, zoom))
    else: flows.append((0, 0))
    prev = gr
    if i % int(fps) == 0: looks.append((np.median(hsv[..., 1]), np.median(hsv[..., 2])))
    if a.co_phu_de and i % 15 == 7:
        band = cv2.cvtColor(f[1150:1450], cv2.COLOR_BGR2HSV)
        m = (band[..., 0] > 20) & (band[..., 0] < 40) & (band[..., 1] > 150) & (band[..., 2] > 200)
        ys, xs = np.nonzero(m)
        if len(xs) > 200: rows = m.sum(1); d = np.nonzero(rows > rows.max() * 0.35)[0]; cap_rows.append((d.max() + 1150, d.max() - d.min() + 1))
    i += 1
n = i; dur = n / fps
cuts = [k for k in range(1, n) if cv2.compareHist(H[k - 1], H[k], cv2.HISTCMP_BHATTACHARYYA) > 0.28]
grp = []
for c in cuts:
    if grp and c - grp[-1][-1] <= 4: grp[-1].append(c)
    else: grp.append([c])
flash = 0
for g in grp:
    lo, hi = max(0, g[0] - 5), min(n - 1, g[-1] + 4)
    if max(L[k] - max(L[lo], L[hi]) for k in range(g[0] - 1, g[-1] + 1)) > 18: flash += 1
shots = np.diff([0] + [g[0] for g in grp] + [n]) / fps
cutset = set(c for g in grp for c in range(g[0] - 1, g[-1] + 2))
F = np.array([flows[k] for k in range(n) if k not in cutset])
static = float(np.mean((F[:, 0] < 0.08) & (np.abs(F[:, 1]) < 0.03)))
push = float(np.mean(F[:, 1] > 0.03))
fast = F[:, 0] > 1.2; moves = int(np.sum(np.diff(fast.astype(int)) == 1)) / dur * 10
lk = np.array(looks)
R = dict(dur=dur, shot=float(np.median(shots)), flash=flash, static=static, push=push, moves=moves, sat=float(np.median(lk[:, 0])), val=float(np.median(lk[:, 1])))
if a.words:
    w = json.load(open(a.words)); w = w['words'] if isinstance(w, dict) else w
    R['wpm'] = len(w) / ((w[-1]['e'] - w[0]['s']) / 60)
print(f"{'chỉ số':10s} {'đo':>8s}   dải mẫu        kết quả")
for k, v in R.items():
    lo, hi = RANGE[k]; ok = lo <= v <= hi
    print(f"{k:10s} {v:8.2f}   {lo:>5} – {hi:<5}   {'ĐẠT' if ok else 'LỆCH'}")
if cap_rows:
    b = np.median([r[0] for r in cap_rows]); hgt = np.median([r[1] for r in cap_rows])
    print(f"phụ đề     chân chữ {b:.0f} (mẫu 1309 ±6) · cao lõi chữ {hgt:.0f} px (mẫu 24–26) {'ĐẠT' if abs(b - 1309) <= 6 and 22 <= hgt <= 28 else 'LỆCH'}")
if a.sheet:
    vf = "fps=1,scale=216:384,drawbox=x=0:y=253:w=216:h=12:color=red@0.35:t=fill,tile=10x8"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a.video, '-vf', vf, '-frames:v', '1', a.sheet], check=False)
    print('ảnh ghép (vạch đỏ = dải phụ đề, mặt/chủ thể không được nằm trên vạch):', a.sheet)
