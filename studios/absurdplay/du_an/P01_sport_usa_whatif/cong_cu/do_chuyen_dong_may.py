# Đo chuyển động máy quay theo từng shot: ước lượng biến đổi affine toàn cục giữa 2 khung (ORB/LK + RANSAC)
import cv2, numpy as np, sys, json
def measure(path, cuts, t_end, scale=360):
    cap = cv2.VideoCapture(path); fps = cap.get(cv2.CAP_PROP_FPS); frames = []
    while True:
        ok, f = cap.read()
        if not ok: break
        h, w = f.shape[:2]; frames.append(cv2.cvtColor(cv2.resize(f, (scale, int(h * scale / w))), cv2.COLOR_BGR2GRAY))
    n = min(len(frames), int(t_end * fps)); bounds = [0] + [int(c * fps) for c in cuts if c < t_end] + [n]
    out = []
    for a, b in zip(bounds[:-1], bounds[1:]):
        a2, b2 = a + 2, b - 2
        if b2 - a2 < 4: continue
        tx = ty = sc = rot = 0; mags = []
        for i in range(a2, b2 - 1):
            p0 = cv2.goodFeaturesToTrack(frames[i], 300, 0.01, 6)
            if p0 is None: continue
            p1, st, _ = cv2.calcOpticalFlowPyrLK(frames[i], frames[i + 1], p0, None)
            g = st.ravel() == 1
            if g.sum() < 10: continue
            M, _ = cv2.estimateAffinePartial2D(p0[g], p1[g], method=cv2.RANSAC)
            if M is None: continue
            s = np.hypot(M[0, 0], M[1, 0]); r = np.degrees(np.arctan2(M[1, 0], M[0, 0]))
            tx += M[0, 2]; ty += M[1, 2]; sc += np.log(s); rot += r
            mags.append(np.hypot(M[0, 2], M[1, 2]))
        dur = (b - a) / fps; W = scale
        mags = np.array(mags) if mags else np.zeros(1)
        out.append(dict(t0=round(a / fps, 2), t1=round(b / fps, 2), dur=round(dur, 2),
            pan_pct_s=round(100 * np.hypot(tx, ty) / W / dur, 1),        # tịnh tiến hình (% bề ngang / giây)
            zoom_pct_s=round(100 * (np.exp(sc) - 1) / dur, 1),           # phóng to (+) / thu nhỏ (-) %/giây
            rot_deg_s=round(rot / dur, 1),
            jerk=round(float(np.std(np.diff(mags))) if len(mags) > 2 else 0, 2)))  # độ giật: dao động tốc độ giữa các khung (px)
    return out
if __name__ == '__main__':
    path, t_end = sys.argv[1], float(sys.argv[2]); cuts = [float(x) for x in sys.argv[3].split(',')] if len(sys.argv) > 3 and sys.argv[3] else []
    print(json.dumps(measure(path, cuts, t_end)))
