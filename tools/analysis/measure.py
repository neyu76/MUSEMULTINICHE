"""Per-video measurements: cuts, global camera motion (optical flow), brightness/colour, audio loudness & SFX onsets.
usage: python3 -I measure.py V1  -> V1/measure.json"""
import sys, json, subprocess, numpy as np, cv2, scipy.io.wavfile as wf, scipy.signal as sg
import os; D = os.path.abspath(sys.argv[1]); vid = os.path.basename(D)
cap = cv2.VideoCapture(f'{D}/v.mp4'); fps = cap.get(cv2.CAP_PROP_FPS)
prev = None; prevh = None; rows = []
W, H = 90, 160
ys, xs = np.mgrid[0:H, 0:W]; cx, cy = (W - 1) / 2, (H - 1) / 2
rx, ry = xs - cx, ys - cy; rr = rx * rx + ry * ry + 1e-6
while True:
    ok, fr = cap.read()
    if not ok: break
    sm = cv2.resize(fr, (W, H), interpolation=cv2.INTER_AREA)
    g = cv2.cvtColor(sm, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(sm, cv2.COLOR_BGR2HSV)
    hist = cv2.calcHist([hsv], [0, 1], None, [16, 8], [0, 180, 0, 256]); hist = cv2.normalize(hist, hist).flatten()
    r = {'t': len(rows) / fps, 'luma': float(g.mean()), 'sat': float(hsv[..., 1].mean()), 'hue': float(np.median(hsv[..., 0])),
         'b': float(sm[..., 0].mean()), 'g': float(sm[..., 1].mean()), 'r': float(sm[..., 2].mean())}
    if prev is not None:
        r['hdiff'] = float(cv2.compareHist(prevh, hist, cv2.HISTCMP_BHATTACHARYYA))
        r['adiff'] = float(np.abs(g.astype(float) - prev.astype(float)).mean())
        fl = cv2.calcOpticalFlowFarneback(prev, g, None, 0.5, 3, 9, 3, 5, 1.1, 0)
        fx, fy = fl[..., 0], fl[..., 1]
        r['tx'] = float(np.median(fx)); r['ty'] = float(np.median(fy))
        r['zoom'] = float(((fx * rx + fy * ry) / rr).mean())      # >0 = expanding = push in
        r['rot'] = float(((fy * rx - fx * ry) / rr).mean())
        r['mag'] = float(np.sqrt(fx * fx + fy * fy).mean())
        r['resid'] = float(np.sqrt((fx - r['tx']) ** 2 + (fy - r['ty']) ** 2).mean())  # local (object) motion + parallax
    rows.append(r); prev = g; prevh = hist
# cuts: hdiff spike vs neighbours
hd = np.array([r.get('hdiff', 0) for r in rows]); ad = np.array([r.get('adiff', 0) for r in rows])
cuts = []
for i in range(2, len(rows) - 2):
    loc = np.median(np.r_[hd[max(1, i - 6):i - 1], hd[i + 2:i + 7]]) if i > 3 else 0
    if hd[i] > 0.28 and hd[i] > 3 * loc + 0.08 and ad[i] > 8:
        cuts.append(round(rows[i]['t'], 2))
# fast whip/blur moments: mag spikes
mag = np.array([r.get('mag', 0) for r in rows])
# camera state per 0.5 s window
segs = []
step = int(fps / 2)
for i in range(1, len(rows) - step, step):
    w = rows[i:i + step]
    z = np.mean([x['zoom'] for x in w]); tx = np.mean([x['tx'] for x in w]); ty = np.mean([x['ty'] for x in w]); m = np.mean([x['mag'] for x in w]); res = np.mean([x['resid'] for x in w])
    if m < 0.06: k = 'static'
    elif abs(z) * 40 > max(abs(tx), abs(ty)): k = 'push_in' if z > 0 else 'pull_out'
    elif abs(tx) >= abs(ty): k = 'pan/truck_' + ('L' if tx > 0 else 'R')   # content moves right => camera moves left
    else: k = 'tilt/crane_' + ('up' if ty > 0 else 'down')
    segs.append({'t': round(w[0]['t'], 2), 'kind': k, 'mag': round(m, 3), 'zoom': round(z * 1000, 2), 'tx': round(tx, 3), 'ty': round(ty, 3), 'resid': round(res, 3)})
# audio
sr, a = wf.read(f'{D}/a48.wav'); a = a.astype(float) / 32768
if a.ndim > 1: mono = a.mean(1); side = (a[:, 0] - a[:, 1]) / 2
else: mono = a; side = np.zeros_like(a)
lufs = subprocess.run(['ffmpeg', '-nostdin', '-i', f'{D}/a48.wav', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
def grab(key):
    import re; m = re.findall(rf'{key}:\s+(-?[\d.]+)', lufs); return float(m[-1]) if m else None
# onset detection on >2.5kHz band (SFX candidates: whooshes, clangs, pops)
f, tt, Z = sg.stft(mono, sr, nperseg=2048, noverlap=1536)
hi = np.abs(Z[f > 2500]).sum(0); lo = np.abs(Z[(f > 80) & (f < 400)]).sum(0)
flux = np.maximum(0, np.diff(hi)); flux = flux / (np.median(flux) + 1e-9)
pk, _ = sg.find_peaks(flux, height=12, distance=int(0.15 * sr / 512))
onsets = [round(float(tt[p + 1]), 2) for p in pk]
# silence (gaps in speech-ish band energy)
env = np.abs(Z[(f > 300) & (f < 3400)]).sum(0); envdb = 20 * np.log10(env / env.max() + 1e-9)
quiet = envdb < -38
gaps = []; s = None
for i, q in enumerate(quiet):
    if q and s is None: s = i
    if not q and s is not None:
        if (i - s) * 512 / sr > 0.2: gaps.append([round(float(tt[s]), 2), round((i - s) * 512 / sr, 2)])
        s = None
stereo_width = float(np.sqrt((side ** 2).mean()) / (np.sqrt((mono ** 2).mean()) + 1e-9))
out = {'id': vid, 'fps': fps, 'frames': len(rows), 'dur': len(rows) / fps, 'cuts': cuts,
       'n_cuts': len(cuts), 'segments': segs,
       'kind_share': {k: round(sum(1 for x in segs if x['kind'] == k) / len(segs), 3) for k in sorted(set(x['kind'] for x in segs))},
       'static_share': round(np.mean([x['mag'] < 0.06 for x in segs]), 3),
       'mean_mag': round(float(mag.mean()), 3), 'p90_mag': round(float(np.percentile(mag, 90)), 3),
       'whips': [round(rows[i]['t'], 2) for i in sg.find_peaks(mag, height=max(2.0, np.percentile(mag, 97)), distance=10)[0]],
       'luma_mean': round(np.mean([r['luma'] for r in rows]), 1), 'sat_mean': round(np.mean([r['sat'] for r in rows]), 1),
       'luma_by_sec': [round(np.mean([r['luma'] for r in rows[i:i + int(fps)]]), 1) for i in range(0, len(rows), int(fps))],
       'warm_by_sec': [round(np.mean([r['r'] - r['b'] for r in rows[i:i + int(fps)]]), 1) for i in range(0, len(rows), int(fps))],
       'audio': {'I_LUFS': grab('I'), 'LRA': grab('LRA'), 'true_peak': grab('Peak'), 'stereo_width': round(stereo_width, 3),
                 'onsets_hi': onsets, 'onset_rate_per_s': round(len(onsets) / (len(mono) / sr), 2), 'gaps_gt_0.2s': gaps}}
json.dump(out, open(f'{D}/measure.json', 'w'), indent=1)
print(vid, 'dur', round(out['dur'], 1), 'cuts', out['n_cuts'], 'static', out['static_share'], 'LUFS', out['audio']['I_LUFS'], 'onsets/s', out['audio']['onset_rate_per_s'])
