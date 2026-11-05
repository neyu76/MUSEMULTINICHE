"""Word captions (ASS + SRT) from the forced alignment — style matched to the team samples.
usage: python3 -I captions.py <EP_workdir> <voice_offset_s> <END_s>
Needs <EP>/voice/align.json (voice_prep.sh) and <EP>/script.txt. Writes <EP>/out/captions.ass, captions.srt, words.json.
Style: Work Sans ExtraBold 81 @ PlayRes 720×1280 (scales with libass to 1080×1920), white, black outline 5, MarginV 344 →
baseline y≈917 @1280, ascender ≈35 px / x-height ≈27 px like the samples (size 75 measured ~8 % small).
Grouping: a short function word joins the next word (≤ 11 chars) → ~65 % one-word events (samples 55–80 %)."""
import sys, json, re
EP, OFF, END = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
A = json.load(open(EP + '/voice/align.json')); script = open(EP + '/script.txt').read()
toks = [t for t in re.findall(r"[A-Za-z0-9'’]+[.,!?\"”]*", script)]
assert len(toks) == len(A), (len(toks), len(A))
words = [{'w': t, 's': a['start'] + OFF, 'e': a['end'] + OFF} for t, a in zip(toks, A)]
SHORT = {'a', 'the', 'to', 'of', 'in', 'for', 'and', 'he', 'it', 'is', 'an', 'his', 'so', 'was', 'with', 'at', 'had', 'but', 'its', 'our'}
groups = []; k = 0
while k < len(words):
    w = words[k]; core = w['w'].lower().strip('.,!?"')
    if core in SHORT and k + 1 < len(words) and not re.search(r'[.,!?]$', w['w']) and len(w['w']) + len(words[k + 1]['w']) <= 11:
        groups.append({'t': w['w'] + ' ' + words[k + 1]['w'], 's': w['s'], 'e': words[k + 1]['e']}); k += 2
    else: groups.append({'t': w['w'], 's': w['s'], 'e': w['e']}); k += 1
one = sum(1 for g in groups if len(g['t'].split()) == 1) / len(groups)
ts = lambda s: f"{int(s // 3600)}:{int(s % 3600 // 60):02d}:{s % 60:05.2f}"
srt_t = lambda s: f"{int(s // 3600):02d}:{int(s % 3600 // 60):02d}:{int(s % 60):02d},{int(round((s % 1) * 1000)):03d}"
hdr = """[Script Info]
ScriptType: v4.00+
PlayResX: 720
PlayResY: 1280
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Word,Work Sans ExtraBold,81,&H00FFFFFF,&H00FFFFFF,&H00000000,&H78000000,0,0,0,0,99,100,0,0,1,5,2.5,2,30,30,344,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
ass, srt = [], []
for i, g in enumerate(groups):
    nxt = groups[i + 1]['s'] if i + 1 < len(groups) else END
    end = nxt if nxt - g['e'] < 0.45 else g['e'] + 0.2
    if i == len(groups) - 1: end = min(END - 0.05, g['e'] + 1.0)
    txt = g['t'].replace('"', '')
    ass.append(f"Dialogue: 0,{ts(g['s'])},{ts(end)},Word,,0,0,0,,{{\\fscx88\\fscy88\\t(0,70,\\fscx100\\fscy100)}}{txt}")
    srt.append(f"{i + 1}\n{srt_t(g['s'])} --> {srt_t(end)}\n{txt}\n")
open(EP + '/out/captions.ass', 'w').write(hdr + '\n'.join(ass) + '\n'); open(EP + '/out/captions.srt', 'w').write('\n'.join(srt))
json.dump(words, open(EP + '/out/words.json', 'w'), indent=0)
print(len(groups), 'caption events, 1-word share', round(one * 100, 1), '%')
