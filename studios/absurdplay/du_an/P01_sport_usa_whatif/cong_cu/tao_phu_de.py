"""Sinh phụ đề ASS kiểu kênh mẫu từ mốc từng từ (Whisper word timestamps).
Quy tắc v0.6 (đo lại 05/11/2026 trên khung 1080x1920 của 2 video mẫu, chồng chữ lên mẫu thấy trùng khít):
vàng #F5F500, chữ thường, **Inter ExtraBold ~46 px CSS = cỡ ASS 66** (bản cũ Montserrat ExtraBold 60 to hơn mẫu ~40 %),
viền đen 4 px + bóng 1 px, căn giữa, chân chữ y = 1309 px, 2–4 từ/lần, ngắt ở dấu câu.
Font phải là TTF đã cài (cong_cu/cai_font.sh) — libass không đọc woff2 và sẽ âm thầm thay bằng DejaVu Sans.
Dùng: python3 tao_phu_de.py <words.json> <ra.ass> [--toi-da-tu 4] [--toi-da-ky-tu 26]
words.json: list segment Whisper {start,end,text,words:[[t, "word"], ...]}, list [[t,word],...] hoặc list {w,s,e}
"""
import json, sys, argparse, re, subprocess
ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('out')
ap.add_argument('--toi-da-tu', type=int, default=4); ap.add_argument('--toi-da-ky-tu', type=int, default=30)
# Cỡ ASS 66 = Inter ExtraBold ~46 px CSS (libass tính cỡ theo chiều cao dòng). Đã hiệu chỉnh: "could the dallas cowboys"
# rộng 574 px (mẫu 572), x 253–826 (mẫu 254–825), chân chữ 1309 với MarginV 594.
ap.add_argument('--font', default='Inter ExtraBold'); ap.add_argument('--co', type=int, default=66)
ap.add_argument('--margin-v', type=int, default=594)
a = ap.parse_args()
try:
    fm = subprocess.run(['fc-match', a.font], capture_output=True, text=True).stdout
    if a.font.split()[0].lower() not in fm.lower():
        print(f'CANH BAO: fc-match "{a.font}" -> {fm.strip()} — chay cong_cu/cai_font.sh truoc khi dot phu de', file=sys.stderr)
except FileNotFoundError:
    pass
d = json.load(open(a.src))
if isinstance(d, dict): d = d['words']
if isinstance(d[0], dict) and 'w' in d[0]:
    words = [(w['s'], w['w'].strip()) for w in d]; end_all = d[-1]['e'] + 0.3
else:
    words = [(w[0], w[1].strip()) for s in d for w in s['words']] if isinstance(d[0], dict) else [(w[0], w[1].strip()) for w in d]
    end_all = d[-1]['end'] if isinstance(d[0], dict) else words[-1][0] + 0.6
# gộp token Whisper tách đôi ("33" "-30", "6" "-point") vào từ trước
mw = []
for t, w in words:
    if mw and w.startswith('-'): mw[-1] = (mw[-1][0], mw[-1][1] + w)
    else: mw.append((t, w))
words = mw
# chia câu trước, rồi chia cụm 2–4 từ cân đối trong từng câu (không để cụm vắt qua hai câu)
sents, cur = [], []
for t, w in words:
    cur.append((t, w))
    if re.search(r'[.?!]$', w): sents.append(cur); cur = []
if cur: sents.append(cur)
chunks = []
for se in sents:
    n = len(se); k = max(1, -(-n // a.toi_da_tu))  # số cụm tối thiểu
    while k < n and any(len(' '.join(x for _, x in se[i * n // k:(i + 1) * n // k])) > a.toi_da_ky_tu for i in range(k)): k += 1
    for i in range(k): chunks.append(se[i * n // k:(i + 1) * n // k])
def ts(x):
    h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60
    return f"{h}:{m:02d}:{s:05.2f}"
L = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: 1080", "PlayResY: 1920", "WrapStyle: 2", "",
     "[V4+ Styles]",
     "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
     f"Style: Cap,{a.font},{a.co},&H0000F5F5,&H000000FF,&H00000000,&H78000000,0,0,0,0,100,100,0,0,1,4,1,2,60,60,{a.margin_v},1", "",
     "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
for i, c in enumerate(chunks):
    st = c[0][0]; en = chunks[i + 1][0][0] if i + 1 < len(chunks) else end_all
    txt = ' '.join(w for _, w in c).lower()
    L.append(f"Dialogue: 0,{ts(st)},{ts(max(en, st + 0.2))},Cap,,0,0,0,,{txt}")
open(a.out, 'w').write('\n'.join(L) + '\n')
n = [len(c) for c in chunks]
print(f"{len(chunks)} cụm phụ đề, {sum(n)/len(n):.1f} từ/cụm")
