"""Local motion inside shots ("puppet" animation): optical flow minus the camera move.

For every shot: dense flow per frame pair, a robust similarity fit (= camera) is subtracted, the leftover is motion of parts
(jaw chewing, head bob, limb swing, body jiggle, props sliding). Measures per shot, in px/frame at 720 px short side:
  active_share  share of the picture whose mean leftover motion > 0.35 px/f (caption band excluded)
  local_p95     95th percentile leftover speed inside the active area
  hz, amp       dominant frequency / amplitude (px) of the main moving blob's vertical and horizontal motion (FFT)
  blob          bounding box (0..1) of the main moving region
Sheets: the shot's middle frame with the leftover-motion heat map and the numbers, for reading by eye.

  python -m vidclone.parts <proxy.mp4> <analysis.json> <out_dir> [--band 0.57 0.79]
"""
import json, os, sys, numpy as np, cv2
from .common import read_frames, probe
from .edit import _simfit

THR = 0.35

def _model(p, w, h):
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    cx, cy = xs - w / 2, ys - h / 2
    return np.dstack([p[0] * cx - p[1] * cy + p[2], p[1] * cx + p[0] * cy + p[3]])

def analyze(proxy, analysis, out_dir, band=(0.57, 0.79), max_w=240):
    A = json.load(open(analysis)); edit = A['edit']
    info = probe(proxy); fps = info['fps'] or 30
    FW, FH = info['w'], info['h']
    w = min(max_w, FW); h = int(round(FH * w / FW / 2) * 2)
    k720 = 720 / min(FW, FH) * (FW / w)            # px at analysis size -> px at 720 short side
    tr_frames = set()
    for t in edit.get('transitions', []):
        f = int(round(t['t'] * fps)); n = max(1, int(round(t.get('dur', 0) * fps)))
        tr_frames.update(range(f - n - 2, f + n + 3))
    rows = np.arange(h); keep_rows = (rows < band[0] * h) | (rows > band[1] * h)
    pool = (rows[keep_rows][:, None] * w + np.arange(w)[None, :]).ravel()
    rng = np.random.default_rng(0)
    frames = [cv2.resize(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY), (w, h), interpolation=cv2.INTER_AREA) for f in read_frames(proxy)]
    colour = {}
    shots_out = []
    for si, s in enumerate(edit['shots']):
        a, b = int(round(s['start'] * fps)) + 1, int(round(s['end'] * fps)) - 1
        acc, series, n = np.zeros((h, w), np.float32), [], 0
        res_all = []
        for i in range(a, min(b, len(frames) - 1)):
            if i in tr_frames or i + 1 in tr_frames: continue
            fl = cv2.calcOpticalFlowFarneback(frames[i], frames[i + 1], None, 0.5, 3, 13, 3, 5, 1.1, 0)
            p, _, _ = _simfit(fl, rng, pool)
            r = (fl - _model(p, w, h)) * k720
            r[~keep_rows] = 0
            mag = np.hypot(r[..., 0], r[..., 1])
            acc += mag; n += 1; res_all.append(r)
        if n < 6:
            shots_out.append({'shot': si, 'start': s['start'], 'end': s['end'], 'frames': n}); continue
        mean = acc / n
        active = mean > THR
        share = float(active[keep_rows].mean())
        rec = {'shot': si, 'start': s['start'], 'end': s['end'], 'frames': n, 'active_share': round(share, 4),
               'local_mean': round(float(mean[keep_rows].mean()), 3)}
        if active.sum() > 20:
            # main blob = largest connected active component
            num, lab, stats, _ = cv2.connectedComponentsWithStats(active.astype(np.uint8), 8)
            j = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA])); m = lab == j
            x, y, bw, bh = stats[j, :4]
            vals = np.concatenate([np.hypot(rr[..., 0], rr[..., 1])[m] for rr in res_all])
            rec['local_p95'] = round(float(np.percentile(vals, 95)), 2)
            rec['blob'] = [round(x / w, 3), round(y / h, 3), round((x + bw) / w, 3), round((y + bh) / h, 3)]
            for comp, name in ((1, 'v'), (0, 'h')):
                sig = np.array([rr[..., comp][m].mean() for rr in res_all]); sig -= sig.mean()
                pos = np.cumsum(sig)                       # displacement (px) of the blob over time
                if len(pos) >= 12:
                    F = np.abs(np.fft.rfft(pos * np.hanning(len(pos)))); fr = np.fft.rfftfreq(len(pos), 1 / fps)
                    F[0] = 0; sel = (fr >= 0.7) & (fr <= 8)
                    if sel.any():
                        jj = np.argmax(np.where(sel, F, 0))
                        rec[f'hz_{name}'] = round(float(fr[jj]), 2)
                        rec[f'amp_{name}'] = round(float((pos.max() - pos.min()) / 2), 2)
        shots_out.append(rec); colour[si] = mean
    os.makedirs(out_dir, exist_ok=True)
    good = [r for r in shots_out if 'active_share' in r]
    moving = [r for r in good if r['active_share'] > 0.02]
    summ = {'shots': len(good), 'shots_with_local_motion': len(moving),
            'share_with_local_motion': round(len(moving) / max(1, len(good)), 3),
            'active_share_median': round(float(np.median([r['active_share'] for r in good])), 4) if good else None,
            'local_p95_median': round(float(np.median([r['local_p95'] for r in moving if 'local_p95' in r])), 2) if moving else None,
            'hz_v': sorted(r['hz_v'] for r in moving if 'hz_v' in r), 'amp_v': sorted(r['amp_v'] for r in moving if 'amp_v' in r)}
    json.dump({'summary': summ, 'shots': shots_out}, open(f'{out_dir}/parts.json', 'w'), indent=1)
    # sheet: middle frame + heat map per shot
    tiles = []
    for r in shots_out:
        if r.get('shot') not in colour: continue
        mid = int(round((r['start'] + r['end']) / 2 * fps)); base = cv2.cvtColor(frames[min(mid, len(frames) - 1)], cv2.COLOR_GRAY2BGR)
        heat = cv2.applyColorMap(np.clip(colour[r['shot']] / 2.0 * 255, 0, 255).astype(np.uint8), cv2.COLORMAP_JET)
        msk = (colour[r['shot']] > THR)[..., None]
        tile = np.where(msk, (base * 0.45 + heat * 0.55), base * 0.8).astype(np.uint8)
        tile = cv2.resize(tile, (180, int(180 * h / w)))
        lab = f"#{r['shot']} {r['start']:.1f}s a{r['active_share'] * 100:.0f}%"
        lab2 = f"{r.get('local_p95', 0)}px {r.get('hz_v', '-')}Hz"
        cv2.rectangle(tile, (0, 0), (180, 30), (0, 0, 0), -1)
        cv2.putText(tile, lab, (3, 12), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (0, 255, 255), 1, cv2.LINE_AA)
        cv2.putText(tile, lab2, (3, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (0, 255, 255), 1, cv2.LINE_AA)
        tiles.append(tile)
    for pg in range(0, len(tiles), 24):
        page = tiles[pg:pg + 24]
        while len(page) % 8: page.append(np.zeros_like(tiles[0]))
        sheet = np.vstack([np.hstack(page[i:i + 8]) for i in range(0, len(page), 8)])
        cv2.imwrite(f'{out_dir}/parts_{pg // 24 + 1:02d}.jpg', sheet, [cv2.IMWRITE_JPEG_QUALITY, 88])
    return summ

if __name__ == '__main__':
    a = sys.argv[1:]
    band = (float(a[a.index('--band') + 1]), float(a[a.index('--band') + 2])) if '--band' in a else (0.57, 0.79)
    print(json.dumps(analyze(a[0], a[1], a[2], band), indent=1))
