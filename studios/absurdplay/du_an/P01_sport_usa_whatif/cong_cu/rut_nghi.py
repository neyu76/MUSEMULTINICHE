"""Rút ngắn khoảng nghỉ trong file giọng theo năng lượng (không cắt vào âm đầu/cuối từ).
Dùng: python3 rut_nghi.py vao.(mp3|wav) ra.wav [--toi-da 0.22] [--nguong-db -22]"""
import sys, subprocess, numpy as np, argparse
ap = argparse.ArgumentParser(); ap.add_argument('vao'); ap.add_argument('ra')
ap.add_argument('--toi-da', type=float, default=0.22); ap.add_argument('--nguong-db', type=float, default=-22)
a = ap.parse_args(); sr = 48000
x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', a.vao, '-ac', '1', '-ar', str(sr), '-f', 's16le', '-'], capture_output=True).stdout, np.int16).astype(np.float32)
hop = int(0.01 * sr); n = len(x) // hop
db = 20 * np.log10(np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1)) / 32768 + 1e-9)
peak = np.percentile(db, 95); quiet = db < peak + a.nguong_db  # dB dưới mức lời (p95)
runs, i = [], 0
while i < n:
    if quiet[i]:
        j = i
        while j < n and quiet[j]: j += 1
        if i > 0 and j < n and (j - i) * 0.01 > a.toi_da: runs.append((i, j))
        i = j
    else: i += 1
keep, cur, half = [], 0, int(a.toi_da / 2 * sr)
for i, j in runs:
    keep.append((cur, i * hop + half)); cur = j * hop - half
keep.append((cur, len(x)))
f = int(0.005 * sr); out = []
for s, e in keep:
    p = x[s:e].copy()
    if len(p) > 2 * f: p[:f] *= np.linspace(0, 1, f); p[-f:] *= np.linspace(1, 0, f)
    out.append(p)
y = np.concatenate(out)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(sr), '-ac', '1', '-i', '-', '-af', 'loudnorm=I=-16:TP=-1.5', '-ar', str(sr), a.ra], input=y.astype(np.int16).tobytes())
print(f'{len(runs)} khoảng nghỉ rút ngắn; {len(x)/sr:.2f}s → {len(y)/sr:.2f}s')
