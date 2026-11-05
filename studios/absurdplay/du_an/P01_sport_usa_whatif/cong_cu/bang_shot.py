"""Tạo bảng shot tự động cho một video mẫu: mốc cắt (ffmpeg scene), lời trong từng shot (từ transcript Whisper có mốc từ),
ảnh giữa shot, và ảnh ghép đánh số để xem bằng mắt.
Dùng: python3 bang_shot.py <video.mp4> <transcript.json> <thư mục ra> [--nguong 0.22] [--ket-thuc <giây>]
transcript.json: list segment {start,end,text,words:[[t,word],...]}
"""
import sys, json, subprocess, re, os, argparse
from PIL import Image, ImageDraw, ImageFont

ap = argparse.ArgumentParser()
ap.add_argument('video'); ap.add_argument('transcript'); ap.add_argument('out')
ap.add_argument('--nguong', type=float, default=0.22)
ap.add_argument('--ket-thuc', type=float, default=None, help='bỏ phần đuôi (end card) sau mốc này')
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a.video]))
end = min(dur, a.ket_thuc or dur)
log = subprocess.run(['ffmpeg', '-hide_banner', '-i', a.video, '-vf', f"select='gt(scene,{a.nguong})',showinfo", '-an', '-f', 'null', '-'],
                     capture_output=True, text=True).stderr
cuts = [float(m) for m in re.findall(r'pts_time:([0-9.]+)', log)]
cuts = [c for c in cuts if 0.3 < c < end - 0.3]
merged = []
for c in cuts:
    if not merged or c - merged[-1] > 0.4: merged.append(c)
bounds = [0.0] + merged + [end]
words = [(w[0], w[1].strip()) for s in json.load(open(a.transcript)) for w in s['words']]
shots = []
for i in range(len(bounds) - 1):
    s, e = bounds[i], bounds[i + 1]
    txt = ' '.join(w for t, w in words if s <= t < e)
    shots.append({'n': i + 1, 'vao': round(s, 2), 'ra': round(e, 2), 'dai': round(e - s, 2), 'loi': txt})
# thumbnails
th = []
for sh in shots:
    t = (sh['vao'] + sh['ra']) / 2
    p = os.path.join(a.out, f"shot_{sh['n']:02d}.jpg")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{t:.2f}', '-i', a.video, '-frames:v', '1', '-vf', 'scale=180:-1', p])
    th.append(p)
cols = 8; W, H = 180, 320; rows = (len(th) + cols - 1) // cols
sheet = Image.new('RGB', (cols * W, rows * (H + 22)), 'black'); d = ImageDraw.Draw(sheet)
for i, p in enumerate(th):
    x, y = (i % cols) * W, (i // cols) * (H + 22)
    try: sheet.paste(Image.open(p).resize((W, H)), (x, y + 22))
    except Exception: pass
    d.text((x + 3, y + 4), f"#{shots[i]['n']} {shots[i]['vao']:.1f}-{shots[i]['ra']:.1f}", fill='yellow')
sheet.save(os.path.join(a.out, 'shots_sheet.jpg'), quality=85)
json.dump({'video': os.path.basename(a.video), 'thoi_luong': dur, 'ket_thuc_noi_dung': end, 'nguong': a.nguong, 'shots': shots},
          open(os.path.join(a.out, 'shots.json'), 'w'), ensure_ascii=False, indent=1)
ds = [s['dai'] for s in shots]; ds.sort()
print(f"{len(shots)} shot, trung vị {ds[len(ds)//2]:.2f}s, min {ds[0]:.2f}, max {ds[-1]:.2f}")
