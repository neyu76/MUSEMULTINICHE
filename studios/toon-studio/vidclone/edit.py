"""Editing grammar: shots, transitions (cut / dissolve / flash / fade / whip) and camera motion.

One decode of the proxy at 180 px short side. Camera motion = robust similarity fit
(zoom, rotation, pan, tilt) of dense optical flow per frame, classified per frame and
summarised per shot. Transition detection:
  cut      single-frame histogram jump
  dissolve frames between A and B are a linear blend of A and B (alpha monotonic)
  flash    brightness spike to near white;  fade = dip to near black
  whip     very fast pan/blur bridging two different-looking frames
"""
import numpy as np, cv2
from .common import probe, read_frames, dist, q

def _hist(f):
    hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
    h = cv2.calcHist([hsv], [0, 1, 2], None, [12, 4, 4], [0, 180, 0, 256, 0, 256])
    return cv2.normalize(h, h).flatten()

def _hd(a, b):
    return float(cv2.compareHist(a, b, cv2.HISTCMP_BHATTACHARYYA))

def _simfit(flow, rng, pool=None):
    """dx = s*cx - r*cy + tx ; dy = r*cx + s*cy + ty, iteratively reweighted. pool = allowed flat pixel indices."""
    h, w = flow.shape[:2]
    ys, xs = np.mgrid[0:h, 0:w]
    cx, cy = (xs - w / 2).ravel(), (ys - h / 2).ravel()
    dx, dy = flow[..., 0].ravel(), flow[..., 1].ravel()
    pool = np.arange(h * w) if pool is None else pool
    sel = rng.choice(pool, min(4000, len(pool)), replace=False)
    for _ in range(3):
        A = np.zeros((2 * len(sel), 4)); b = np.empty(2 * len(sel))
        A[0::2, 0] = cx[sel]; A[0::2, 1] = -cy[sel]; A[0::2, 2] = 1
        A[1::2, 0] = cy[sel]; A[1::2, 1] = cx[sel]; A[1::2, 3] = 1
        b[0::2] = dx[sel]; b[1::2] = dy[sel]
        p, *_ = np.linalg.lstsq(A, b, rcond=None)
        res = np.hypot(*(A @ p - b).reshape(-1, 2).T)
        keep = res <= np.percentile(res, 70)
        inl = np.median(res[keep])
        sel = sel[keep] if keep.sum() > 300 else sel
    mag = float(np.median(np.hypot(dx, dy)))
    return p, float(inl), mag

def _grammar(cam, near, sharp, fps, FW, FH):
    """Camera grammar in px/frame at 720 px short side (the unit most measured style notes use):
    hold/drift/move shares, move bursts (peak, attack, release, FWHM, size), push-in during quiet frames,
    high-frequency residual (hand-held float), impact kicks (sign flips every frame), whips (fast + blurred)."""
    from scipy.ndimage import gaussian_filter1d
    n = len(cam)
    k = 720 / min(FW, FH); R = np.hypot(FW, FH) / 2 * k          # px scale; frame-corner radius
    s, tx, ty = cam[:, 6].copy(), cam[:, 7] * k, cam[:, 8] * k
    bad = near.copy(); bad[0] = True
    # fill transition frames with 0 motion before smoothing so they do not smear into neighbours
    for a in (s, tx, ty): a[bad] = 0
    g = lambda a: gaussian_filter1d(a, 1.2, mode='nearest')
    ss, sx, sy = g(s), g(tx), g(ty)
    trans = np.hypot(sx, sy)
    speed = np.hypot(trans, ss * R)
    ok = ~bad
    sp = speed[ok]
    out = {'hold_share': None}
    if not ok.any(): return out, speed
    out['hold_share'] = round(float(np.mean(sp < 0.3)), 3)
    out['drift_share'] = round(float(np.mean((sp >= 0.3) & (sp < 2))), 3)
    out['move_share'] = round(float(np.mean(sp >= 2)), 3)
    out['speed_px720'] = dist([float(v) for v in sp])

    # bursts: local peaks ≥ 6 px/f; attack/release measured to 10 % of the peak, FWHM at 50 %
    bursts, last = [], -99
    for i in range(1, n - 1):
        if bad[i] or speed[i] < 6 or speed[i] < speed[max(0, i - 5):i + 6].max(): continue
        if i - last < 4: continue
        pk = speed[i]
        a = i
        while a > 0 and not bad[a - 1] and speed[a - 1] >= 0.1 * pk and i - a < 90: a -= 1
        b = i
        while b < n - 1 and not bad[b + 1] and speed[b + 1] >= 0.1 * pk and b - i < 90: b += 1
        h0 = i
        while h0 > a and speed[h0 - 1] >= 0.5 * pk: h0 -= 1
        h1 = i
        while h1 < b and speed[h1 + 1] >= 0.5 * pk: h1 += 1
        bursts.append({'f': i, 't': round(i / fps, 2), 'peak': round(float(pk), 1), 'attack': i - a, 'release': b - i,
                       'fwhm': h1 - h0 + 1, 'size_px': round(float(speed[a:b + 1].sum()), 0),
                       'zoom_pct': round(float(ss[a:b + 1].sum() * 100), 1)})
        last = i
    dur_ok = ok.sum() / fps
    out['moves_per_10s'] = round(len(bursts) / max(dur_ok, 1e-6) * 10, 2)
    out['move_peak_px720'] = dist([b['peak'] for b in bursts])
    out['move_attack_f'] = dist([b['attack'] for b in bursts])
    out['move_release_f'] = dist([b['release'] for b in bursts])
    out['move_fwhm_f'] = dist([b['fwhm'] for b in bursts])
    out['move_size_px720'] = dist([b['size_px'] for b in bursts])
    sym = [b['attack'] / b['release'] for b in bursts if b['release']]
    out['move_attack_over_release'] = round(float(np.median(sym)), 2) if sym else None

    # quiet frames (translation < 2 px/f): is the camera still pushing in?
    quiet = ok & (trans < 2)
    if quiet.any():
        zq = ss[quiet] * 100  # %/frame
        act = np.abs(zq) >= 0.05
        out['quiet_zoom_active_share'] = round(float(act.mean()), 3)
        out['quiet_push_share'] = round(float((zq[act] > 0).mean()), 3) if act.any() else 0.0
        out['quiet_push_rate_pct_f'] = dist([float(v) for v in zq[act & (zq > 0)]])

    # hand-held float = residual of the raw path around the smoothed one
    hf = np.hypot(tx - sx, ty - sy)[ok]
    out['hf_residual_px720'] = round(float(np.median(hf)), 3)

    # impact kicks: ≥ 3 frames in a row whose residual flips sign, |res| ≥ 1.5 px
    rx, ry = tx - gaussian_filter1d(tx, 3), ty - gaussian_filter1d(ty, 3)
    res = np.where(np.abs(rx) > np.abs(ry), rx, ry)
    kicks, i = [], 1
    while i < n - 2:
        j = i
        while j + 1 < n and ok[j + 1] and abs(res[j]) >= 1.5 and abs(res[j + 1]) >= 1.5 and np.sign(res[j]) != np.sign(res[j + 1]):
            j += 1
        if ok[i] and j - i + 1 >= 3:
            kicks.append({'t': round(i / fps, 2), 'frames': j - i + 1, 'amp_px': round(float(np.abs(res[i:j + 1]).max()), 1)})
            i = j + 1
        else:
            i += 1
    out['kicks_per_min'] = round(len(kicks) / max(dur_ok, 1e-6) * 60, 2)
    out['kicks'] = kicks[:20]

    # whips: bursts with peak ≥ 40 px/f; blur = sharpness at the peak / median sharpness ±15 f
    sharp = np.asarray(sharp, float); whips = []
    for b in bursts:
        if b['peak'] < 40: continue
        i = b['f']; ctx = np.r_[sharp[max(0, i - 15):max(0, i - 4)], sharp[i + 5:i + 16]]
        whips.append({'t': b['t'], 'peak': b['peak'], 'blur_ratio': round(float(sharp[i] / (np.median(ctx) + 1e-6)), 2) if len(ctx) else None})
    out['whips_per_min'] = round(len(whips) / max(dur_ok, 1e-6) * 60, 2)
    out['whips'] = whips
    out['bursts'] = bursts
    return out, speed

def analyze(proxy, fps_out=30, mask_band=None):
    """mask_band = (y0, y1) as fractions of the height: rows left out of the camera fit (burned-in captions)."""
    info = probe(proxy)
    W = 180
    H = int(round(W * info['h'] / info['w'] / 2) * 2)
    if info['w'] > info['h']:
        H = 180; W = int(round(H * info['w'] / info['h'] / 2) * 2)
    # camera flow runs on the full proxy (360 px short side): sub-pixel holds/drifts need the resolution
    FW, FH = info['w'], info['h']
    rows = np.arange(FH)
    if mask_band:
        rows = rows[(rows < mask_band[0] * FH) | (rows > mask_band[1] * FH)]
    pool = (rows[:, None] * FW + np.arange(FW)[None, :]).ravel()
    rng = np.random.default_rng(0)
    hist, luma, sharp, diff, cam = [], [], [], [], []
    prev = None; frames = []
    for big in read_frames(proxy):
        G = cv2.cvtColor(big, cv2.COLOR_BGR2GRAY)
        f = cv2.resize(big, (W, H), interpolation=cv2.INTER_AREA)
        g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
        hist.append(_hist(f)); luma.append(float(g.mean()))
        sharp.append(float(cv2.Laplacian(g, cv2.CV_32F).var()))
        frames.append(cv2.resize(g, (W // 2, H // 2), interpolation=cv2.INTER_AREA).astype(np.float32))
        if prev is None:
            diff.append(0.0); cam.append([0, 0, 0, 0, 0, 0, 0, 0, 0])
        else:
            diff.append(float(np.abs(G.astype(np.int16) - prev).mean()))
            fl = cv2.calcOpticalFlowFarneback(prev, G, None, 0.5, 3, 15, 3, 5, 1.2, 0)
            p, inl, mag = _simfit(fl, rng, pool)
            # zoom %/frame, rot deg/frame, pan/tilt % of width/frame, fit residual, flow magnitude,
            # raw fit (zoom fraction, tx px, ty px) for the camera-grammar measures
            cam.append([p[0] * 100, np.degrees(p[1]), p[2] / FW * 100, p[3] / FW * 100, inl, mag / FW * 100, p[0], p[2], p[3]])
        prev = G
    n = len(hist); fps = info['fps'] or fps_out
    hd1 = np.array([0] + [_hd(hist[i - 1], hist[i]) for i in range(1, n)])
    luma = np.array(luma); sharp = np.array(sharp); cam = np.array(cam, float)

    # ---- candidates: single-frame jumps and 0.2 s-apart peaks
    k = max(3, int(round(0.2 * fps)))
    dk = np.zeros(n)
    for i in range(k, n - k): dk[i] = _hd(hist[i - k], hist[i + k])
    cand = []
    for i in range(1, n):
        lo, hi = max(1, i - 15), min(n, i + 16)
        neigh = np.delete(hd1[lo:hi], i - lo)
        if hd1[i] > max(0.25, 4 * np.median(neigh) + 0.08): cand.append((hd1[i], i))
    for i in range(k, n - k):
        if dk[i] >= 0.22 and dk[i] >= dk[max(0, i - k):i + k + 1].max(): cand.append((dk[i], i))

    def blend(a, b):
        """mean residual of frames a..b as a linear blend of a and b; alphas."""
        A, B = frames[a], frames[b]; d = B - A; den = float((d * d).sum()) + 1e-6; ad = np.abs(d).mean() + 1e-6
        al = [float(((frames[j] - A) * d).sum() / den) for j in range(a + 1, b)]
        rs = [float(np.abs(frames[j] - (A + x * d)).mean()) / ad for j, x in zip(range(a + 1, b), al)]
        return (np.mean(rs) if rs else 9), al

    trans, taken = [], np.zeros(n, bool)
    for score, i in sorted(cand, reverse=True):
        if taken[i]: continue
        kind, span = None, 0
        # hard cut: the jump is isolated (frames either side are each stable)
        if i >= 3 and i + 2 < n:
            j = hd1[i]
            if j > 0.25 and _hd(hist[i - 3], hist[i - 1]) < 0.3 * j and _hd(hist[i], hist[i + 2]) < 0.3 * j:
                kind = 'cut'
        if kind is None:
            for kk in (2, 3, 4, 6, 8, 11, 15):  # dissolves of ~4–30 frames
                a, b = i - kk, i + kk
                if a < 0 or b >= n or _hd(hist[a], hist[b]) < 0.2: continue
                mid = luma[a:b + 1]
                if mid.max() > max(luma[a], luma[b]) + 60 and mid.max() > 200: kind, span = 'flash', 2 * kk; break
                if mid.min() < 18 and min(luma[a], luma[b]) > 40: kind, span = 'fade', 2 * kk; break
                r, al = blend(a, b)
                if r < 0.4 and np.all(np.diff(al) > -0.08) and 0.2 < al[len(al) // 2] < 0.8:
                    # length: alpha of each frame against anchors 4 frames outside the smallest passing window
                    # (close enough that camera motion barely moves them); the dissolve is the contiguous run
                    # around i where alpha is between 0.1 and 0.9
                    wa, wb = max(0, i - kk - 4), min(n - 1, i + kk + 4)
                    _, alw = blend(wa, wb)
                    alw = np.array(alw); c = i - wa - 1; s_, e_ = c, c
                    while s_ > 0 and 0.1 < alw[s_ - 1] < 0.9: s_ -= 1
                    while e_ < len(alw) - 1 and 0.1 < alw[e_ + 1] < 0.9: e_ += 1
                    kind, span = 'dissolve', max(2, e_ - s_ + 2); break
        if kind is None:
            a, b = max(0, i - k), min(n - 1, i + k)
            speed = np.hypot(cam[a:b + 1, 2], cam[a:b + 1, 3]).max()
            if speed > 6 and _hd(hist[max(0, i - 2 * k)], hist[min(n - 1, i + 2 * k)]) > 0.45:
                kind, span = 'whip', 2 * k
        if kind is None: continue
        trans.append({'kind': kind, 'f': i, 't': round(i / fps, 3), 'dur': round(span / fps, 3)})
        taken[max(0, i - max(span, 2 * k)):i + max(span, 2 * k)] = True
    trans.sort(key=lambda x: x['f'])

    # ---- shots
    bounds = [0] + [t['f'] for t in trans] + [n]
    shots = []
    for s, e in zip(bounds[:-1], bounds[1:]):
        if e - s < 2: continue
        shots.append({'start': round(s / fps, 3), 'end': round(e / fps, 3), 'dur': round((e - s) / fps, 3)})

    # ---- camera classes per frame (outside transitions)
    near = np.zeros(n, bool)
    for t in trans:
        r = int(max(t['dur'] * fps, 2)) + 2
        near[max(0, t['f'] - r):t['f'] + r] = True
    z = cam[:, 0] * fps; pan = cam[:, 2] * fps; tilt = cam[:, 3] * fps; rot = cam[:, 1] * fps
    # 0.3 s median smoothing so one noisy frame does not flip the class
    from scipy.ndimage import median_filter
    sm = lambda x: median_filter(x, size=max(3, int(0.3 * fps) | 1), mode='nearest')
    z, pan, tilt, rot = sm(z), sm(pan), sm(tilt), sm(rot)
    cls = []
    for i in range(n):
        if near[i] or i == 0: cls.append(None); continue
        m = {'push': z[i] / 1.0, 'pull': -z[i] / 1.0, 'pan': abs(pan[i]) / 2.0, 'tilt': abs(tilt[i]) / 2.0, 'roll': abs(rot[i]) / 3.0}
        best = max(m, key=m.get)
        cls.append(best if m[best] >= 1.0 else 'static')
    valid = [c for c in cls if c]
    share = {c: round(valid.count(c) / max(1, len(valid)), 3) for c in ['static', 'push', 'pull', 'pan', 'tilt', 'roll']}
    # how often the move changes (runs of the same class)
    runs = []; cur = None; ln = 0
    for c in cls:
        if c is None:
            if cur: runs.append(ln)
            cur = None; ln = 0; continue
        if c == cur: ln += 1
        else:
            if cur: runs.append(ln)
            cur, ln = c, 1
    if cur: runs.append(ln)
    # high-frequency jitter (handheld): residual of pan after 0.5 s smoothing
    from scipy.ndimage import uniform_filter1d
    raw = cam[:, 2] * fps
    jitter = float(np.std((raw - uniform_filter1d(raw, int(0.5 * fps)))[~near]))
    grammar, speed = _grammar(cam, near, sharp, fps, FW, FH)
    for sh_ in shots:
        a, b = int(sh_['start'] * fps), int(sh_['end'] * fps)
        cc = [c for c in cls[a:b] if c]
        sh_['move'] = max(set(cc), key=cc.count) if cc else None
        sh_['zoom_pct_s'] = round(float(np.mean(z[a:b])), 2)
        sh_['pan_pct_s'] = round(float(np.mean(pan[a:b])), 2)
        sh_['tilt_pct_s'] = round(float(np.mean(tilt[a:b])), 2)

    dur = n / fps
    kinds = [t['kind'] for t in trans]
    return {
        'frames': n, 'fps': fps, 'mask_band': list(mask_band) if mask_band else None,
        'shots': shots,
        'camera_grammar': grammar,
        'transitions': trans,
        'summary': {
            'shot_count': len(shots),
            'shot_len': dist([s['dur'] for s in shots]),
            'transitions_per_min': round(len(trans) / dur * 60, 2),
            'transition_mix': {k_: kinds.count(k_) for k_ in ['cut', 'dissolve', 'flash', 'fade', 'whip']},
            'dissolve_dur': dist([t['dur'] for t in trans if t['kind'] == 'dissolve']),
            'camera_share': share,
            'camera_move_run_s': dist([r / fps for r in runs]),
            'zoom_rate_pct_s': dist([float(v) for v, c in zip(z, cls) if c in ('push', 'pull')]),
            'pan_rate_pct_s': dist([float(abs(v)) for v, c in zip(pan, cls) if c == 'pan']),
            'handheld_jitter': round(jitter, 3),
            'cuts_in_last_3s': sum(1 for t in trans if t['kind'] == 'cut' and t['t'] > dur - 3),
        },
        'series': {  # 10 Hz downsample, for plotting/comparison
            't': [round(i / fps, 2) for i in range(0, n, 3)],
            'zoom': [round(float(v), 2) for v in z[::3]], 'pan': [round(float(v), 2) for v in pan[::3]],
            'tilt': [round(float(v), 2) for v in tilt[::3]], 'luma': [round(float(v), 1) for v in luma[::3]],
            'speed_px720': [round(float(v), 1) for v in speed[::3]],
        },
    }
