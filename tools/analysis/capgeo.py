"""Caption geometry: white text with dark outline in lower-middle band. python3 -I capgeo.py V1"""
import sys, json, numpy as np, cv2
import os; D = os.path.abspath(sys.argv[1]); vid = os.path.basename(D)
cap = cv2.VideoCapture(f'{D}/v.mp4'); n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
res = []
for fi in np.linspace(30, n - 30, 40).astype(int):
    cap.set(cv2.CAP_PROP_POS_FRAMES, int(fi)); ok, fr = cap.read()
    if not ok: continue
    g = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY)
    band = g[700:1050]
    white = (band > 235).astype(np.uint8)
    dark = cv2.dilate((band < 50).astype(np.uint8), np.ones((5, 5), np.uint8))
    txt = white & cv2.dilate(dark, np.ones((7, 7), np.uint8))   # white pixels near dark outline
    nb, lab, stats, cen = cv2.connectedComponentsWithStats(txt)
    comps = [s for s in stats[1:] if 6 < s[3] < 80 and s[2] < 80 and s[4] > 15]
    if len(comps) < 3: continue
    ys = np.array([c[1] + c[3] for c in comps]); hs = np.array([c[3] for c in comps])
    base = np.median(ys); sel = [c for c in comps if abs(c[1] + c[3] - base) < 12]
    if len(sel) < 3: continue
    x0 = min(c[0] for c in sel); x1 = max(c[0] + c[2] for c in sel)
    res.append({'t': round(fi / 30, 2), 'baseline_y': int(700 + base), 'cap_h': int(np.percentile([c[3] for c in sel], 90)), 'x0': int(x0), 'x1': int(x1), 'center_x': int((x0 + x1) / 2)})
out = {'id': vid, 'samples': len(res)}
if res:
    for k in ['baseline_y', 'cap_h', 'center_x']:
        v = [r[k] for r in res]; out[k] = {'median': float(np.median(v)), 'p10': float(np.percentile(v, 10)), 'p90': float(np.percentile(v, 90))}
json.dump({'summary': out, 'rows': res}, open(f'{D}/capgeo.json', 'w'), indent=1)
print(vid, out)
