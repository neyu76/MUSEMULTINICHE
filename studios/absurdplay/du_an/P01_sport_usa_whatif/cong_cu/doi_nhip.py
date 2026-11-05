"""Đổi nhịp đọc của một tập (v0.6): atempo giữ cao độ + dời MỌI mốc theo cùng hệ số, để không phải dựng lại tập.
atempo h kéo giãn thời gian đều: mốc mới = mốc cũ / h. Vì vậy có thể dời mốc trước, ghép giọng sau.
  h = từ/phút đích / từ/phút hiện tại   (vd E04: 162 / 174,3 = 0,93 → 49,09 s thành 52,78 s)
Dùng (trong thư mục tập):
  python3 ../../cong_cu/doi_nhip.py --he-so 0.93 --shots ../../engine/ep04_shots.js --words giong/words.json giong/words_raw.json giong/words_tw.json --mo-ta mo_ta.json
  python3 ../../cong_cu/doi_nhip.py --he-so 0.93 --giong am_thanh/giong.wav am_thanh/giong.wav      (khi đã có file giọng; chạy 1 lần)
Mỗi file được sao lưu thành <tên>.truoc_nhip trước khi ghi đè (đã có bản sao lưu thì KHÔNG chạy lại phần mốc — tránh dời 2 lần).
Sau đó: tao_phu_de.py (phụ đề từ words.json mới), render lại, tron_am_thanh.py (đọc mốc từ shots.js), tao_kdenlive.py.
"""
import argparse, json, os, re, shutil, subprocess, sys
ap = argparse.ArgumentParser(); ap.add_argument('--he-so', type=float, required=True)
ap.add_argument('--shots'); ap.add_argument('--words', nargs='*', default=[]); ap.add_argument('--mo-ta'); ap.add_argument('--giong', nargs=2)
a = ap.parse_args(); h = a.he_so
def backup(p):
    b = p + '.truoc_nhip'
    if os.path.exists(b): sys.exit(f'{b} đã tồn tại — mốc của {p} có vẻ đã dời rồi; xoá bản sao lưu nếu chắc chắn muốn dời lần nữa')
    shutil.copy2(p, b)
sc = lambda x: round(x / h, 3)
if a.shots:
    backup(a.shots); src = open(a.shots, encoding='utf-8').read()
    out = []
    for line in src.split('\n'):
        if line.lstrip().startswith('export const'):
            line = re.sub(r'(?<![\w.])(\d+\.\d+|\d+)(?![\w])', lambda m: str(sc(float(m.group(1)))), line)
        out.append(line)
    out.insert(0, f'// Mốc đã dời bằng doi_nhip.py --he-so {h} (bản gốc: {os.path.basename(a.shots)}.truoc_nhip)')
    open(a.shots, 'w', encoding='utf-8').write('\n'.join(out)); print('shots:', a.shots)
for p in a.words:
    backup(p); d = json.load(open(p, encoding='utf-8'))
    L = d['words'] if isinstance(d, dict) else d
    for w in L:
        if isinstance(w, dict):
            for k in ('s', 'e', 'start', 'end'):
                if k in w and w[k] is not None: w[k] = sc(w[k])
        else: w[0] = sc(w[0])
    json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('words:', p)
if a.mo_ta:
    backup(a.mo_ta); d = json.load(open(a.mo_ta, encoding='utf-8'))
    for tr in d.get('tracks', []):
        for c in tr.get('clips', []):
            for k in ('start', 'in', 'out'): c[k] = sc(c[k])
    json.dump(d, open(a.mo_ta, 'w', encoding='utf-8'), ensure_ascii=False); print('mo_ta:', a.mo_ta)
if a.giong:
    vao, ra = a.giong
    if os.path.abspath(vao) == os.path.abspath(ra): backup(vao); vao = vao + '.truoc_nhip'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', vao, '-af', f'atempo={h}', '-ar', '48000', ra], check=True)
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', ra], capture_output=True, text=True).stdout)
    print(f'giọng: {ra} ({dur:.2f} s)')
