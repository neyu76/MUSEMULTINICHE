#!/usr/bin/env python3
"""Độ nét + màu của video (vùng trên phụ đề, y < 840 @1280) — so với 18 mẫu.
Dùng: python3 -I sharpness.py video.mp4 [n_khung]  → in JSON: lap_med, lap_p10, sat_med, val_med, clip_pct.
detail = 1 − Lap(mờ σ1)/Lap(gốc): tỉ lệ chi tiết mịn, KHÔNG phụ thuộc nội dung tối/phẳng (mẫu: trung vị 0,88–0,93; p10 0,85–0,91; N02 v4 lỗi DOF 0,77/0,71). lap = phương sai Laplacian (phụ thuộc nội dung, chỉ tham khảo). p10 bắt đoạn mờ cục bộ (DOF sai, nhòe nhiều lớp)."""
import cv2, sys, json, numpy as np
def measure(path, n=60):
    c = cv2.VideoCapture(path); N = int(c.get(7)); L = []; S = []; V = []; C = []; D = []
    for i in np.linspace(N * 0.03, N * 0.97, n).astype(int):
        c.set(1, i); ok, f = c.read()
        if not ok: continue
        f = cv2.resize(f, (720, 1280), interpolation=cv2.INTER_AREA)[:840]
        g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY).astype(float); l = cv2.Laplacian(g, cv2.CV_64F).var(); L.append(l)
        D.append(1 - cv2.Laplacian(cv2.GaussianBlur(g, (0, 0), 1.0), cv2.CV_64F).var() / (l + 1e-6))
        h = cv2.cvtColor(cv2.resize(f, (360, 420)), cv2.COLOR_BGR2HSV).astype(float)
        S.append(h[..., 1].mean()); V.append(h[..., 2].mean()); C.append((h[..., 2] > 245).mean() * 100)
    r = lambda x, q=50: round(float(np.percentile(x, q)), 1)
    return {'detail_med': round(float(np.median(D)), 3), 'detail_p10': round(float(np.percentile(D, 10)), 3), 'lap_med': r(L), 'lap_p10': r(L, 10), 'sat_med': r(S), 'val_med': r(V), 'clip_pct': r(C)}
if __name__ == '__main__':
    print(json.dumps(measure(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 60)))
