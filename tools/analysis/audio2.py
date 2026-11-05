"""Audio deep-dive: voice pitch, music bed under pauses, transient (SFX) density, spectral balance.
python3 -I audio2.py V1 -> V1/audio2.json"""
import sys, json, numpy as np, scipy.io.wavfile as wf, scipy.signal as sg
import os; D = os.path.abspath(sys.argv[1]); vid = os.path.basename(D)
sr, a = wf.read(f'{D}/a48.wav'); a = a.astype(float) / 32768
st = a.ndim > 1
L = a[:, 0] if st else a; Rr = a[:, 1] if st else a
m = (L + Rr) / 2; s = (L - Rr) / 2
hop = 480  # 10 ms
n = len(m) // hop
def rms(x):
    x = x[:n * hop].reshape(n, hop); return np.sqrt((x ** 2).mean(1) + 1e-12)
def band(x, lo, hi):
    b, aa = sg.butter(4, [lo / (sr / 2), min(hi, sr / 2 - 100) / (sr / 2)], 'band'); return sg.lfilter(b, aa, x)
voice = rms(band(m, 300, 3400)); bass = rms(band(m, 40, 160)); air = rms(band(m, 6000, 16000)); sideE = rms(s); full = rms(m)
db = lambda x: 20 * np.log10(x + 1e-9)
vdb = db(voice); top = np.percentile(vdb, 95)
speech = vdb > top - 18; pause = vdb < top - 30
# smooth masks
k = np.ones(15) / 15
speech_s = np.convolve(speech.astype(float), k, 'same') > 0.6
pause_s = np.convolve(pause.astype(float), k, 'same') > 0.6
bed_db = float(np.median(db(full)[pause_s])) if pause_s.sum() > 20 else None
sp_db = float(np.median(db(full)[speech_s]))
# pitch via autocorrelation on speech frames (40 ms windows)
f0s = []
win = int(0.04 * sr); lp = band(m, 70, 900)
for i in np.where(speech_s)[0][::5]:
    seg = lp[i * hop:i * hop + win]
    if len(seg) < win: continue
    seg = seg - seg.mean(); ac = np.correlate(seg, seg, 'full')[win - 1:]
    lo, hi = int(sr / 400), int(sr / 75)
    if ac[0] <= 0: continue
    j = lo + np.argmax(ac[lo:hi]);
    if ac[j] / ac[0] > 0.45: f0s.append(sr / j)
f0s = np.array(f0s)
# transient detection in air band during speech pauses OR big jumps anywhere (stricter)
airdb = db(air); d = np.diff(airdb, prepend=airdb[0])
peaks, _ = sg.find_peaks(d, height=9, distance=15)
trans = [round(p * hop / sr, 2) for p in peaks if airdb[p] > np.percentile(airdb, 70)]
# whoosh-like: sustained rise of 1-8 kHz noise > 150 ms with low voice
nb = db(rms(band(m, 1000, 8000)))
whoosh = []
i = 0
while i < n - 20:
    if nb[i + 15] - nb[i] > 10 and np.mean(voice[i:i + 15]) < np.median(voice[speech_s]) * 0.7:
        whoosh.append(round(i * hop / sr, 2)); i += 40
    else: i += 1
dur = len(m) / sr
out = {'id': vid, 'dur': round(dur, 2),
       'speech_share': round(float(speech_s.mean()), 3), 'pause_share': round(float(pause_s.mean()), 3),
       'speech_level_db': round(sp_db, 1), 'bed_in_pauses_db': round(bed_db, 1) if bed_db else None,
       'voice_to_bed_gap_db': round(sp_db - bed_db, 1) if bed_db else None,
       'f0_median': round(float(np.median(f0s)), 1) if len(f0s) else None, 'f0_p10_p90': [round(float(np.percentile(f0s, 10)), 1), round(float(np.percentile(f0s, 90)), 1)] if len(f0s) else None,
       'bass_minus_voice_db': round(float(np.median(db(bass)[speech_s]) - np.median(vdb[speech_s])), 1),
       'air_minus_voice_db': round(float(np.median(airdb[speech_s]) - np.median(vdb[speech_s])), 1),
       'side_minus_mid_db': round(float(np.median(db(sideE)) - np.median(db(full))), 1),
       'transients': trans, 'transient_rate': round(len(trans) / dur, 2), 'whoosh_candidates': whoosh, 'whoosh_rate_per_10s': round(len(whoosh) / dur * 10, 2)}
json.dump(out, open(f'{D}/audio2.json', 'w'), indent=1)
print(vid, {k: out[k] for k in ['speech_share', 'voice_to_bed_gap_db', 'f0_median', 'side_minus_mid_db', 'transient_rate', 'whoosh_rate_per_10s']})
