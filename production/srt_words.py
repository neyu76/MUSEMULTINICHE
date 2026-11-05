import re, json, sys
# python srt_words.py voice_sentences.srt words.json captions.ass -0.03
srt, out_json, out_ass, offset = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]) if len(sys.argv) > 4 else 0
t = lambda s: (lambda h, m, x: int(h)*3600+int(m)*60+float(x.replace(',', '.')))(*s.split(':'))
SPOKEN = {"1995": "nineteen ninety five"}  # thêm số/viết tắt khi gặp
def weight(w):
    core = re.sub(r"[^\w']", "", w); return len(SPOKEN.get(core, core)) + 2
words = []
for blk in open(srt, encoding='utf-8').read().strip().split('\n\n'):
    lines = blk.strip().split('\n'); a, b = [t(x.strip()) for x in lines[1].split('-->')]
    ws = ' '.join(lines[2:]).split(); tot = sum(weight(w) for w in ws); cur = a
    for w in ws:
        d = (b - a) * weight(w) / tot
        words.append({"word": w, "start": round(max(0, cur + offset), 3), "end": round(cur + d + offset, 3)}); cur += d
json.dump({"source": "srt-estimate", "words": words}, open(out_json, 'w'), indent=1)
def ts(s): return f"{int(s//3600)}:{int(s%3600//60):02d}:{s%60:05.2f}"
hdr = """[Script Info]
ScriptType: v4.00+
PlayResX: 720
PlayResY: 1280
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Word,Work Sans ExtraBold,75,&H00FFFFFF,&H00FFFFFF,&H00000000,&H78000000,0,0,0,0,99,100,0,0,1,5,2.5,2,30,30,344,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
ev = []
for i, w in enumerate(words):
    end = words[i+1]["start"] if i+1 < len(words) and words[i+1]["start"] - w["end"] < 0.45 else w["end"] + 0.2
    ev.append(f"Dialogue: 0,{ts(w['start'])},{ts(end)},Word,,0,0,0,,{{\\fscx88\\fscy88\\t(0,70,\\fscx100\\fscy100)}}{w['word']}")
open(out_ass, 'w', encoding='utf-8').write(hdr + '\n'.join(ev) + '\n')
