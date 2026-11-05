"""Look: colour, light, sharpness, palette, framing, faces — from the 1 fps stills."""
import numpy as np, cv2
from sklearn.cluster import KMeans
from .common import stills, dist, q

_face = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def _letterbox(g):
    rows = g.mean(1); cols = g.mean(0)
    top = int(np.argmax(rows > 12)); bot = int(np.argmax(rows[::-1] > 12))
    lef = int(np.argmax(cols > 12)); rig = int(np.argmax(cols[::-1] > 12))
    return top / len(rows), bot / len(rows), lef / len(cols), rig / len(cols)

def analyze(work):
    files = stills(work)
    S, V, C, D, warm, clip, crush, faces, fsize, bars, pix = [], [], [], [], [], [], [], [], [], [], []
    for p in files:
        f = cv2.imread(p)
        h, w = f.shape[:2]
        g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY).astype(np.float32)
        hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV).astype(np.float32)
        lab = cv2.cvtColor(f, cv2.COLOR_BGR2LAB).astype(np.float32)
        S.append(float(np.median(hsv[..., 1]))); V.append(float(hsv[..., 2].mean()))
        C.append(float(g.std()))
        lap = cv2.Laplacian(g, cv2.CV_32F).var()
        D.append(float(1 - cv2.Laplacian(cv2.GaussianBlur(g, (0, 0), 1.0), cv2.CV_32F).var() / (lap + 1e-6)))
        warm.append(float((lab[..., 2] - 128).mean()))          # +yellow / -blue
        clip.append(float((hsv[..., 2] > 250).mean() * 100)); crush.append(float((hsv[..., 2] < 8).mean() * 100))
        fs = _face.detectMultiScale(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY), 1.1, 6, minSize=(w // 12, w // 12))
        faces.append(len(fs) > 0)
        if len(fs): fsize.append(float(max(r[2] for r in fs)) / w)
        bars.append(_letterbox(g))
        sm = cv2.resize(lab, (48, int(48 * h / w)), interpolation=cv2.INTER_AREA).reshape(-1, 3)
        pix.append(sm)
    pal = []
    if pix:
        X = np.concatenate(pix)
        km = KMeans(6, n_init=4, random_state=0).fit(X)
        cnt = np.bincount(km.labels_, minlength=6) / len(X)
        for c, s in sorted(zip(km.cluster_centers_, cnt), key=lambda x: -x[1]):
            bgr = cv2.cvtColor(np.uint8([[np.clip(c, 0, 255)]]), cv2.COLOR_LAB2BGR)[0, 0]
            pal.append({'hex': '#%02x%02x%02x' % (bgr[2], bgr[1], bgr[0]), 'share': round(float(s), 3)})
    b = np.array(bars) if bars else np.zeros((1, 4))
    # brightness arc: thirds of the video
    th = np.array_split(np.array(V), 3) if len(V) >= 3 else [V]
    return {
        'saturation': dist(S), 'brightness': dist(V), 'contrast': dist(C), 'detail': dist(D),
        'warmth': dist(warm), 'clipped_pct': dist(clip), 'crushed_pct': dist(crush),
        'face_share': round(float(np.mean(faces)), 3) if faces else 0.0,
        'face_size_rel': dist(fsize),
        'letterbox': {'top': q(b[:, 0]), 'bottom': q(b[:, 1]), 'left': q(b[:, 2]), 'right': q(b[:, 3])},
        'palette': pal,
        'brightness_arc': [round(float(np.mean(x)), 1) for x in th],
        'per_second': {'sat': [round(x, 1) for x in S], 'val': [round(x, 1) for x in V], 'face': [bool(x) for x in faces]},
    }
