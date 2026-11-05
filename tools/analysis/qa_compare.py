#!/usr/bin/env python3
"""QA một video dựng mới theo Style Bible RickClips (mục 15).
Dùng:  python3 -I qa_compare.py video.mp4 [workdir] [--captions captions.ass]
- Chuẩn hóa về 720x1280/30fps, chạy measure.py, cuts3.py, capgeo.py, audio2.py (cùng thư mục với file này),
  so với ngưỡng của 18 video mẫu, in bảng ĐẠT/KHÔNG ĐẠT và ghi qa_report.json.
"""
import sys, os, json, subprocess, re
HERE = os.path.dirname(os.path.abspath(__file__))
args = [a for a in sys.argv[1:] if not a.startswith('--')]
src = os.path.abspath(args[0]); work = os.path.abspath(args[1] if len(args) > 1 else os.path.splitext(src)[0] + '_qa')
cap_file = sys.argv[sys.argv.index('--captions') + 1] if '--captions' in sys.argv else None
os.makedirs(work, exist_ok=True)
run = lambda c: subprocess.run(c, capture_output=True, text=True)
probe = json.loads(run(['ffprobe', '-v', 'error', '-show_entries', 'stream=width,height,r_frame_rate,codec_type:format=duration', '-of', 'json', src]).stdout)
vs = [s for s in probe['streams'] if s['codec_type'] == 'video'][0]
W, H = int(vs['width']), int(vs['height']); fps = eval(vs['r_frame_rate']); dur = float(probe['format']['duration'])
run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', src, '-vf', 'scale=720:1280,fps=30', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-c:a', 'aac', f'{work}/v.mp4'])
run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', src, '-ar', '48000', '-ac', '2', f'{work}/a48.wav'])
for s in ['measure.py', 'cuts3.py', 'capgeo.py', 'audio2.py']:
    r = run([sys.executable, '-I', os.path.join(HERE, s), work])
    if r.returncode: print('lỗi', s, r.stderr[-400:])
m = json.load(open(f'{work}/measure.json')); c3 = json.load(open(f'{work}/cuts3.json')); a = json.load(open(f'{work}/audio2.json')); cg = json.load(open(f'{work}/capgeo.json'))['summary']
ks = m['kind_share']
# run length of camera-motion kinds
kinds = [x['kind'].split('_')[0] for x in m['segments']]; runs = []; c = 1
for p, q in zip(kinds, kinds[1:]):
    if p == q: c += 1
    else: runs.append(c * 0.5); c = 1
runs.append(c * 0.5); runs.sort(); run_med = runs[len(runs) // 2]
# silences in audio > 0.35 s (speech section only)
sil = run(['ffmpeg', '-nostdin', '-i', f'{work}/a48.wav', '-af', 'silencedetect=n=-45dB:d=0.35', '-f', 'null', '-']).stderr
n_sil = len(re.findall(r'silence_end', sil))
# caption stats from ASS (optional)
one_share = None
if cap_file and os.path.exists(cap_file):
    txt = [l.split(',', 9)[-1] for l in open(cap_file, encoding='utf-8') if l.startswith('Dialogue:')]
    txt = [re.sub(r'\{[^}]*\}', '', t).strip() for t in txt]
    one_share = sum(1 for t in txt if len(t.split()) == 1) / max(1, len(txt))
# pause floor: 5th pct of 50 ms RMS minus median (music/SFX level heard between phrases); samples −13.4…−18.1 dB (median −16)
import numpy as _np, wave as _wave
_w = _wave.open(f'{work}/a48.wav'); _x = _np.frombuffer(_w.readframes(_w.getnframes()), _np.int16).astype(float).reshape(-1, _w.getnchannels()).mean(1)
_r = _np.sqrt(_np.convolve(_x ** 2, _np.ones(2400) / 2400, 'valid')[::1200] + 1e-9); _d = 20 * _np.log10(_r)
floor_db = round(float(_np.percentile(_d, 5) - _np.percentile(_d, 50)), 1)
checks = [
    ('Độ phân giải', f'{W}x{H}', (W, H) in [(720, 1280), (1080, 1920)]),
    ('FPS', round(fps, 2), abs(fps - 30) < 0.01),
    ('Thời lượng (s)', round(dur, 1), 34 <= dur <= 78),
    ('Loudness (LUFS)', m['audio']['I_LUFS'], m['audio']['I_LUFS'] is not None and -15.6 <= m['audio']['I_LUFS'] <= -13.5),
    ('True peak (dBFS)', m['audio']['true_peak'], m['audio']['true_peak'] is not None and m['audio']['true_peak'] <= -1.0),
    ('Side−Mid (dB) ≤ −20', a['side_minus_mid_db'], a['side_minus_mid_db'] <= -20),
    ('Đứng yên ≤ 5%', round(m['static_share'] * 100, 1), m['static_share'] <= 0.05),
    ('Đẩy vào 25–65%', round(ks.get('push_in', 0) * 100, 1), 0.25 <= ks.get('push_in', 0) <= 0.65),
    ('Đổi kiểu máy: trung vị ≤ 1,5 s', run_med, run_med <= 1.5),
    ('Cắt cứng ≤ 2/video (mẫu: 0–2)', len(c3['cuts']), len(c3['cuts']) <= 2),
    ('Phụ đề baseline y≈918 (±13)', cg.get('baseline_y', {}).get('median'), cg.get('baseline_y') is not None and abs(cg['baseline_y']['median'] - 918) <= 13),
    ('Phụ đề cao chữ ≈35 px (31–39)', cg.get('cap_h', {}).get('median'), cg.get('cap_h') is not None and 31 <= cg['cap_h']['median'] <= 39),
    ('Phụ đề căn giữa x≈360 (±10)', cg.get('center_x', {}).get('median'), cg.get('center_x') is not None and abs(cg['center_x']['median'] - 360) <= 10),
    ('Khoảng lặng > 0,35 s (≤ 1)', n_sil, n_sil <= 1),
    ('Sàn nhạc giữa câu −13,5…−18,5 dB', floor_db, -18.5 <= floor_db <= -13.5),
]
# sharpness (content-normalised detail ratio) + colour, above caption band; samples: detail_med 0.88–0.93, sat_med 65–133
sys.path.insert(0, HERE); from sharpness import measure as _sharp
sh = _sharp(f'{work}/v.mp4', 60)
checks += [('Độ nét: chi tiết mịn trung vị ≥ 0,86 (mẫu 0,88–0,93)', sh['detail_med'], sh['detail_med'] >= 0.86),
           ('Độ nét: 10% mờ nhất ≥ 0,78', sh['detail_p10'], sh['detail_p10'] >= 0.78),
           ('Bão hòa màu trung vị ≤ 135 (mẫu 65–133)', sh['sat_med'], sh['sat_med'] <= 135)]
# frozen / black frames (render crash, lost WebGL context): longest run of identical frames and share of near-black frames
import cv2 as _cv
_c = _cv.VideoCapture(f'{work}/v.mp4'); _prev = None; _run = _maxrun = 0; _black = _n = 0
while True:
    _ok, _f = _c.read()
    if not _ok: break
    _g = _cv.resize(_cv.cvtColor(_f[:840], _cv.COLOR_BGR2GRAY), (90, 105)).astype(float); _n += 1
    if _g.mean() < 8: _black += 1
    if _prev is not None and _np.abs(_g - _prev).mean() < 0.15: _run += 1; _maxrun = max(_maxrun, _run)
    else: _run = 0
    _prev = _g
checks += [('Khung đứng hình liên tiếp ≤ 0,5 s', round(_maxrun / 30, 2), _maxrun / 30 <= 0.5),
           ('Khung đen ≤ 1% (ngoài iris)', round(_black / max(1, _n) * 100, 1), _black / max(1, _n) <= 0.01)]
if one_share is not None: checks.append(('Phụ đề 1 từ 55–80%', round(one_share * 100, 1), 0.55 <= one_share <= 0.80))
w = max(len(c[0]) for c in checks)
print(f"QA: {src}")
for name, val, ok in checks: print(f"  {'ĐẠT ' if ok else 'KHÔNG'}  {name:<{w}}  {val}")
json.dump({'video': src, 'checks': [{'name': n, 'value': v, 'pass': bool(o)} for n, v, o in checks]}, open(f'{work}/qa_report.json', 'w'), indent=1, ensure_ascii=False)
print(f"  → {sum(1 for c in checks if c[2])}/{len(checks)} đạt. Báo cáo: {work}/qa_report.json")
print("  Còn phải kiểm tra bằng mắt: hook khung 0, bảng chữ→hành động, vật kể chuyện T01–T04, câu chốt + kết vòng.")
