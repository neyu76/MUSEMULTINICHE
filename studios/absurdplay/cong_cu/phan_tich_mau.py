"""Đo tự động một video mẫu (bước G2 của quy trình chung). Không gắn với dự án nào.
Dùng:  python -X utf8 phan_tich_mau.py <video> <thư mục ra> [--fps-do 6] [--nguong-cat 0.3]  (hạ 0.15–0.2 nếu mẫu có hòa hình nhẹ)
Cần:   ffmpeg + ffprobe trong PATH. Tùy chọn: numpy + opencv-python(-headless) để đo màu, độ nét, chuyển động; Pillow để ghi mốc lên lưới khung.
Ra:    do_luong.json (mọi số đo), bao_cao.md (tóm tắt), luoi_1s_XX.jpg (lưới 1 khung/giây), nghi_cat/ (khung quanh điểm nghi cắt cảnh).
Mọi con số là [ĐO] thô: điểm nghi cắt cảnh PHẢI xem lại bằng mắt; script không phân biệt cắt cứng với hòa hình/cú máy nhanh."""
import hashlib, json, os, re, shutil, subprocess, sys

def run(args):
    return subprocess.run(args, capture_output=True, text=True, encoding='utf-8', errors='replace')

def need(tool):
    if not shutil.which(tool): sys.exit(f'Thiếu {tool} trong PATH — cài ffmpeg (https://ffmpeg.org/download.html) rồi chạy lại.')

def ffprobe(v):
    r = run(['ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', v]); return json.loads(r.stdout)

def audio_metrics(v, has_audio, stereo):
    out = {}
    if not has_audio: return {'co_am_thanh': False}
    r = run(['ffmpeg', '-nostdin', '-hide_banner', '-i', v, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-'])
    tail = r.stderr[r.stderr.rfind('Summary'):]
    for k, pat in (('loudness_LUFS', r'I:\s+(-?[\d.]+) LUFS'), ('LRA_LU', r'LRA:\s+(-?[\d.]+) LU'), ('true_peak_dBFS', r'Peak:\s+(-?[\d.]+) dBFS')):
        m = re.search(pat, tail); out[k] = float(m.group(1)) if m else None
    if stereo:
        vol = {}
        for name, pan in (('mid', 'pan=mono|c0=0.5*c0+0.5*c1'), ('side', 'pan=mono|c0=0.5*c0-0.5*c1')):
            r = run(['ffmpeg', '-nostdin', '-hide_banner', '-i', v, '-vn', '-af', pan + ',volumedetect', '-f', 'null', '-'])
            m = re.search(r'mean_volume:\s+(-?[\d.]+) dB', r.stderr); vol[name] = float(m.group(1)) if m else None
        out['side_tru_mid_dB'] = round(vol['side'] - vol['mid'], 1) if None not in vol.values() else None
    r = run(['ffmpeg', '-nostdin', '-hide_banner', '-i', v, '-vn', '-af', 'silencedetect=n=-40dB:d=0.35', '-f', 'null', '-'])
    ends = re.findall(r'silence_end: ([\d.]+) \| silence_duration: ([\d.]+)', r.stderr)
    out['khoang_lang_gt_0_35s'] = [{'ket_thuc': float(a), 'dai': float(b)} for a, b in ends]
    return out

def scene_candidates(v, thr):
    r = run(['ffmpeg', '-nostdin', '-hide_banner', '-i', v, '-an', '-vf', f"select='gt(scene,{thr})',showinfo", '-f', 'null', '-'])
    return [round(float(t), 3) for t in re.findall(r'pts_time:([\d.]+)', r.stderr)]

def contact_sheets(v, out, dur, w):
    n = int(dur) + 1; cols, rows = 9, 3; per = cols * rows; files = []
    tw = 200; th = int(round(tw * (w[1] / w[0]) / 2) * 2) if w[0] else 356
    for i in range(0, n, per):
        f = os.path.join(out, f'luoi_1s_{i // per + 1:02d}.jpg')
        run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', str(i), '-t', str(per), '-i', v, '-vf', f'fps=1,scale={tw}:{th},tile={cols}x{rows}', '-frames:v', '1', f])
        if os.path.exists(f): files.append((f, i))
    try:  # ghi mốc giây lên lưới (Pillow), không bắt buộc
        from PIL import Image, ImageDraw
        for f, t0 in files:
            im = Image.open(f); d = ImageDraw.Draw(im)
            for k in range(per):
                t = t0 + k
                if t >= n: break
                x, y = (k % cols) * tw, (k // cols) * th; d.rectangle((x, y, x + 34, y + 16), fill=(0, 0, 0)); d.text((x + 3, y + 2), f'{t}s', fill=(255, 220, 0))
            im.save(f, quality=90)
    except Exception:
        pass
    return [os.path.basename(f) for f, _ in files]

def cut_frames(v, out, cuts):
    d = os.path.join(out, 'nghi_cat'); os.makedirs(d, exist_ok=True)
    for t in cuts[:40]:  # 12 khung liền quanh mỗi điểm nghi cắt → xem bằng mắt
        run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', f'{max(0, t - 0.2):.3f}', '-i', v, '-frames:v', '12', '-vf', 'scale=120:-2,tile=12x1', os.path.join(d, f'cat_{t:07.2f}.jpg')])

def visual_metrics(v, fps_do):
    try:
        import cv2, numpy as np
    except ImportError:
        return {'ghi_chu': 'không có numpy/opencv → bỏ qua đo màu, độ nét, chuyển động'}
    cap = cv2.VideoCapture(v); src_fps = cap.get(cv2.CAP_PROP_FPS) or 30; step = max(1, int(round(src_fps / fps_do)))
    i = 0; prev = None; rows = []
    while True:
        ok, fr = cap.read()
        if not ok: break
        if i % step == 0:
            t = i / src_fps; small = cv2.resize(fr, (180, int(180 * fr.shape[0] / fr.shape[1]) // 2 * 2))
            hsv = cv2.cvtColor(small, cv2.COLOR_BGR2HSV); g = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
            big = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY).astype(np.float32)
            blur = cv2.GaussianBlur(big, (0, 0), 2.0); detail = float(np.mean(np.abs(big - blur)) / (np.mean(np.abs(big - cv2.GaussianBlur(big, (0, 0), 6.0))) + 1e-6))
            row = {'t': round(t, 3), 'bao_hoa': float(hsv[..., 1].mean()), 'sang': float(hsv[..., 2].mean()), 'lap_var': float(cv2.Laplacian(big, cv2.CV_32F).var()), 'ti_le_chi_tiet_min': detail, 'den': bool(hsv[..., 2].mean() < 12)}
            if prev is not None:
                fl = cv2.calcOpticalFlowFarneback(prev, g, None, 0.5, 3, 15, 3, 5, 1.2, 0)
                row['chuyen_dong_px'] = float(np.median(np.linalg.norm(fl, axis=2)) * fps_do)  # px/giây trên ảnh rộng 180
            prev = g; rows.append(row)
        i += 1
    cap.release()
    if not rows: return {}
    a = lambda k: np.array([r[k] for r in rows if k in r])
    mv = a('chuyen_dong_px'); dt = a('ti_le_chi_tiet_min')
    q = lambda x, p: round(float(np.percentile(x, p)), 3) if len(x) else None
    return {'mau_do_moi_giay': fps_do,
            'bao_hoa_trung_vi': q(a('bao_hoa'), 50), 'sang_trung_vi': q(a('sang'), 50),
            'ti_le_chi_tiet_min_trung_vi': q(dt, 50), 'ti_le_chi_tiet_min_p10': q(dt, 10),
            'ti_le_khung_den_pct': round(100 * float(np.mean([r['den'] for r in rows])), 2),
            'chuyen_dong_px_s_trung_vi': q(mv, 50), 'ti_le_dung_yen_pct': round(100 * float(np.mean(mv < 2.0)), 1) if len(mv) else None,
            'chuoi_thoi_gian': rows}

def main():
    if len(sys.argv) < 3: sys.exit(__doc__)
    v, out = sys.argv[1], sys.argv[2]; fps_do = 6
    if '--fps-do' in sys.argv: fps_do = float(sys.argv[sys.argv.index('--fps-do') + 1])
    thr = float(sys.argv[sys.argv.index('--nguong-cat') + 1]) if '--nguong-cat' in sys.argv else 0.3
    need('ffmpeg'); need('ffprobe'); os.makedirs(out, exist_ok=True)
    meta = ffprobe(v); vs = next((s for s in meta['streams'] if s['codec_type'] == 'video'), {}); au = next((s for s in meta['streams'] if s['codec_type'] == 'audio'), None)
    dur = float(meta['format'].get('duration', 0)); w = (int(vs.get('width', 0)), int(vs.get('height', 0)))
    num, den = (vs.get('r_frame_rate', '0/1').split('/') + ['1'])[:2]
    res = {'file': os.path.basename(v), 'md5': hashlib.md5(open(v, 'rb').read()).hexdigest(), 'thoi_luong_s': round(dur, 3),
           'do_phan_giai': f'{w[0]}x{w[1]}', 'ti_le': f'{w[0] / w[1]:.4f}' if w[1] else None, 'fps': round(float(num) / float(den), 3) if float(den) else None,
           'codec_hinh': vs.get('codec_name'), 'codec_tieng': au.get('codec_name') if au else None, 'so_kenh_tieng': au.get('channels') if au else 0}
    res['am_thanh'] = audio_metrics(v, au is not None, bool(au and au.get('channels', 1) >= 2))
    cuts = scene_candidates(v, thr); res['nguong_cat'] = thr; res['nghi_cat_canh'] = cuts; res['so_nghi_cat'] = len(cuts)
    res['luoi'] = contact_sheets(v, out, dur, w); cut_frames(v, out, cuts)
    vm = visual_metrics(v, fps_do); series = vm.pop('chuoi_thoi_gian', None); res['hinh'] = vm
    json.dump(res | {'chuoi_thoi_gian_hinh': series}, open(os.path.join(out, 'do_luong.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    A = res['am_thanh']; H = res['hinh']
    md = [f"# Đo tự động: {res['file']}", '', 'Tất cả là [ĐO] thô, đo bằng phan_tich_mau.py. Điểm nghi cắt phải xem lại trong `nghi_cat/`. Phần quan sát và nghe làm theo MAU_02.', '',
          '| Mục | Giá trị |', '|---|---|',
          f"| Thời lượng / độ phân giải / fps | {res['thoi_luong_s']} s / {res['do_phan_giai']} / {res['fps']} |",
          f"| Codec hình / tiếng / số kênh | {res['codec_hinh']} / {res['codec_tieng']} / {res['so_kenh_tieng']} |",
          f"| Loudness / true peak / LRA | {A.get('loudness_LUFS')} LUFS / {A.get('true_peak_dBFS')} dBFS / {A.get('LRA_LU')} LU |",
          (f"| Side − Mid | {A.get('side_tru_mid_dB')} dB (≤ −20 ≈ mono) |" if A.get('side_tru_mid_dB') is not None else f"| Side − Mid | mono ({res['so_kenh_tieng']} kênh) |"),
          f"| Khoảng lặng > 0,35 s | {len(A.get('khoang_lang_gt_0_35s', []))} |",
          f"| Điểm nghi cắt cảnh (scene > {thr}) | {res['so_nghi_cat']} — {', '.join(str(c) for c in cuts[:30])} |",
          f"| Bão hòa / sáng trung vị (HSV 0–255) | {H.get('bao_hoa_trung_vi')} / {H.get('sang_trung_vi')} |",
          f"| Tỉ lệ chi tiết mịn trung vị / p10 | {H.get('ti_le_chi_tiet_min_trung_vi')} / {H.get('ti_le_chi_tiet_min_p10')} (chỉ so tương đối giữa các video) |",
          f"| Chuyển động khung trung vị / % đứng yên | {H.get('chuyen_dong_px_s_trung_vi')} px/s (ảnh rộng 180) / {H.get('ti_le_dung_yen_pct')} % |",
          f"| Khung đen | {H.get('ti_le_khung_den_pct')} % |", '', f"Lưới 1 khung/giây: {', '.join(res['luoi'])}"]
    if 'ghi_chu' in H: md.append(f"\nGhi chú: {H['ghi_chu']}")
    open(os.path.join(out, 'bao_cao.md'), 'w', encoding='utf-8').write('\n'.join(md) + '\n'); print('\n'.join(md))

if __name__ == '__main__':
    main()
