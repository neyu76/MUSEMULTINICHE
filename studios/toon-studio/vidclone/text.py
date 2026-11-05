"""On-screen text: captions (text that matches the narration) and other overlays, via tesseract on the 1 fps stills.

Caption geometry is relative to frame height so it transfers across resolutions.
"""
import os, re, subprocess, numpy as np, cv2
from .common import stills, dist, q

def _band_ocr(img, y0, y1, fill_hex):
    """Second pass on the caption band: isolate pixels near the caption fill colour, black-on-white, 2× up."""
    band = img[y0:y1]
    fc = np.array([int(fill_hex[5:7], 16), int(fill_hex[3:5], 16), int(fill_hex[1:3], 16)], float)
    m = (np.abs(band.astype(float) - fc).max(2) < 60).astype(np.uint8) * 255
    m = cv2.resize(255 - m, None, fx=2, fy=2, interpolation=cv2.INTER_NEAREST)
    tmp = '/tmp/_vc_band_%d.png' % os.getpid()
    cv2.imwrite(tmp, m)
    out = []
    for b in _ocr(tmp, psm='6'):
        out.append({**b, 'x': b['x'] // 2, 'y': y0 + b['y'] // 2, 'w': b['w'] // 2, 'h': b['h'] // 2})
    return out

def _ocr(img_path, psm='11'):
    tsv = subprocess.run(['tesseract', img_path, 'stdout', '--psm', psm, 'tsv'], capture_output=True, text=True).stdout
    out = []
    for ln in tsv.splitlines()[1:]:
        c = ln.split('\t')
        if len(c) < 12 or not c[11].strip(): continue
        conf = float(c[10])
        t = c[11].strip()
        if conf < 55 or len(re.sub(r'\W', '', t)) < 1: continue
        out.append({'t': t, 'x': int(c[6]), 'y': int(c[7]), 'w': int(c[8]), 'h': int(c[9]), 'conf': conf})
    return out

def _norm(s):
    return re.sub(r"[^a-z0-9']", '', s.lower())

def _colors(img, boxes):
    fill, edge, bg_std = [], [], []
    for b in boxes:
        x, y, w, h = b['x'], b['y'], b['w'], b['h']
        crop = img[y:y + h, x:x + w].reshape(-1, 3).astype(float)
        if len(crop) < 20: continue
        l = crop.mean(1)
        fill.append(np.median(crop[l >= np.percentile(l, 80)], 0))
        edge.append(np.median(crop[l <= np.percentile(l, 15)], 0))
        pad = img[max(0, y - h):y + 2 * h, max(0, x - w // 2):x + w + w // 2]
        bg_std.append(float(pad.std()))
    hx = lambda c: '#%02x%02x%02x' % (int(c[2]), int(c[1]), int(c[0]))
    if not fill: return None
    return {'fill': hx(np.median(fill, 0)), 'edge': hx(np.median(edge, 0)), 'bg_std': q(bg_std)}

def analyze(work, words):
    files = stills(work)
    spoken = {}
    for w in words:
        spoken.setdefault(_norm(w['w']), []).append(w['s'])
    cap_rows, other, per_sec = [], [], []

    def split(boxes, t):
        cap, ovl = [], []
        for b in boxes:
            n = _norm(b['t'])
            hit = n and any(abs(ts - t) < 2.0 for ts in spoken.get(n, []))
            (cap if hit else ovl).append(b)
        return cap, ovl

    def row(img, cap, t):
        H, W = img.shape[:2]
        ys = sorted(b['y'] + b['h'] for b in cap); base = ys[len(ys) // 2]
        line = [b for b in cap if abs(b['y'] + b['h'] - base) < H * 0.02]
        x0 = min(b['x'] for b in line); x1 = max(b['x'] + b['w'] for b in line)
        letters = ''.join(b['t'] for b in line)
        return {
            't': t, 'words': len(line), 'baseline_rel': base / H, 'height_rel': np.median([b['h'] for b in line]) / H,
            'center_x_rel': (x0 + x1) / 2 / W, 'width_rel': (x1 - x0) / W,
            'upper': sum(ch.isupper() for ch in letters) / max(1, sum(ch.isalpha() for ch in letters)),
            'colors': _colors(img, line),
        }

    for i, p in enumerate(files):
        t = i + 0.5  # fps=1 stills are sampled at the middle of each second
        img = cv2.imread(p); H, W = img.shape[:2]
        boxes = _ocr(p)
        cap, ovl = split(boxes, t)
        per_sec.append({'t': t, 'caption': ' '.join(b['t'] for b in cap), 'other': ' '.join(b['t'] for b in ovl if b['h'] > H * 0.012)})
        if cap: cap_rows.append(row(img, cap, t))
        for b in ovl:
            if b['h'] > H * 0.012 and len(b['t']) > 1:
                other.append({'t': t, 'text': b['t'], 'y_rel': round(b['y'] / H, 3), 'h_rel': round(b['h'] / H, 4)})
    # second pass on the caption band for seconds the full-frame OCR missed
    if len(cap_rows) >= 3:
        fills0 = [r['colors']['fill'] for r in cap_rows if r['colors']]
        fill = max(set(fills0), key=fills0.count) if fills0 else '#ffffff'
        H = cv2.imread(files[0]).shape[0]
        base = float(np.median([r['baseline_rel'] for r in cap_rows])) * H
        hh = float(np.percentile([r['height_rel'] for r in cap_rows], 90)) * H
        y0, y1 = int(max(0, base - 3.5 * hh)), int(min(H, base + 1.5 * hh))
        have = {r['t'] for r in cap_rows}
        for i, p in enumerate(files):
            t = i + 0.5
            if t in have: continue
            img = cv2.imread(p)
            cap, _ = split(_band_ocr(img, y0, y1, fill), t)
            if cap:
                cap_rows.append(row(img, cap, t)); per_sec[i]['caption'] = ' '.join(b['t'] for b in cap)
        cap_rows.sort(key=lambda r: r['t'])
    n = len(files)
    fills = [r['colors']['fill'] for r in cap_rows if r['colors']]
    edges = [r['colors']['edge'] for r in cap_rows if r['colors']]
    wc = [r['words'] for r in cap_rows]
    return {
        'captions': {
            'present_share': round(len(cap_rows) / max(1, n), 3),
            'baseline_rel': dist([r['baseline_rel'] for r in cap_rows]),
            'height_rel': dist([r['height_rel'] for r in cap_rows]),
            'center_x_rel': dist([r['center_x_rel'] for r in cap_rows]),
            'width_rel': dist([r['width_rel'] for r in cap_rows]),
            'words_on_screen': dist(wc),
            'words_hist': {str(k): round(wc.count(k) / max(1, len(wc)), 3) for k in sorted(set(wc))},
            'uppercase_share': q([r['upper'] for r in cap_rows]),
            'fill': max(set(fills), key=fills.count) if fills else None,
            'edge': max(set(edges), key=edges.count) if edges else None,
            'boxed': (q([r['colors']['bg_std'] for r in cap_rows if r['colors']]) or 99) < 18,
        } if cap_rows else {'present_share': 0.0},
        'overlay_text_share': round(sum(1 for r in per_sec if r['other']) / max(1, n), 3),
        'overlay_samples': other[:80],
        'per_second': per_sec,
    }
