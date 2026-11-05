"""Captions (ASS) from word timings, styled after a profile: position, size, colours, words per caption, case.

Style source, later wins: built-in defaults < profile.json (measured) < style.json "captions" block (hand decisions).
"""
import os, re
from .common import load

FONTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'fonts')

def _ass_col(hexc, alpha=0):
    h = hexc.lstrip('#')
    return f'&H{alpha:02X}{h[4:6]}{h[2:4]}{h[0:2]}'.upper()

def style_from(style_dir=None):
    s = {'font': 'Work Sans', 'bold': 1, 'baseline_rel': 0.717, 'height_rel': 0.028, 'fill': '#ffffff', 'edge': '#000000',
         'boxed': False, 'upper': False, 'words_hist': {'1': 0.7, '2': 0.27, '3': 0.03}, 'outline_rel': 0.1, 'shadow_rel': 0.0,
         'size_per_cap': 1.42, 'max_hold': 1.0, 'pop': False, 'strip_punct': False}
    if style_dir and os.path.exists(f'{style_dir}/profile.json'):
        p = load(f'{style_dir}/profile.json'); m = p['metrics']
        if 'caption_baseline' in m: s['baseline_rel'] = m['caption_baseline']['median']
        if 'caption_height' in m: s['height_rel'] = m['caption_height']['median']
        cs = [c for c in p['facts'].get('caption_style', []) if c.get('fill')]
        if cs:
            s['fill'] = cs[0]['fill']; s['edge'] = cs[0]['edge'] or s['edge']; s['boxed'] = bool(cs[0].get('boxed'))
            s['upper'] = (cs[0].get('uppercase_share') or 0) > 0.6
            if cs[0].get('words_hist'): s['words_hist'] = cs[0]['words_hist']
    if style_dir and os.path.exists(f'{style_dir}/style.json'):
        s.update(load(f'{style_dir}/style.json').get('captions', {}))
    return s

def chunks(words, hist, max_hold=1.0):
    """Group words so the share of 1/2/3-word captions follows hist; never across a sentence end."""
    want = {int(k): v for k, v in hist.items() if int(k) > 0}
    tot = sum(want.values()) or 1; want = {k: v / tot for k, v in want.items()}
    out, made, i = [], {1: 0, 2: 0, 3: 0, 4: 0}, 0
    while i < len(words):
        best = 1
        for size in sorted(want, key=lambda k: -(want[k] - made.get(k, 0) / max(1, sum(made.values())))):
            grp = words[i:i + size]
            if len(grp) < size: continue
            if any(re.search(r'[.!?,;:]$', w['w']) for w in grp[:-1]): continue
            if grp[-1]['e'] - grp[0]['s'] > max_hold: continue
            best = size; break
        # very short function words ride with the next word
        if best == 1 and i + 1 < len(words) and len(re.sub(r'\W', '', words[i]['w'])) <= 2 and want.get(2) \
                and not re.search(r'[.!?,;:]$', words[i]['w']) and words[i + 1]['e'] - words[i]['s'] <= max_hold:
            best = 2
        out.append(words[i:i + best]); made[best] = made.get(best, 0) + 1; i += best
    return out

def _t(x):
    x = max(0, x); h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60
    return f'{h}:{m:02d}:{s:05.2f}'

def write(words_json, out, W=1080, H=1920, style_dir=None, script=None, offset=0.0):
    st = style_from(style_dir)
    words = load(words_json)
    words = words['words'] if isinstance(words, dict) else words
    words = [{**w, 's': w['s'] + offset, 'e': w['e'] + offset} for w in words]
    cap_px = st['height_rel'] * H
    size = round(cap_px * st['size_per_cap'])
    outline = max(1, round(size * st['outline_rel']))
    shadow = round(size * st['shadow_rel'])
    margin_v = round(H * (1 - st['baseline_rel']) - size * 0.2)
    border = 3 if st['boxed'] else 1
    hdr = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,{st['font']},{size},{_ass_col(st['fill'])},{_ass_col(st['fill'])},{_ass_col(st['edge'])},{_ass_col(st['edge'], 0x40 if st['boxed'] else 0)},{-1 if st['bold'] else 0},0,0,0,100,100,0,0,{border},{outline},{shadow},2,40,40,{margin_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    cs = chunks(words, st['words_hist'], st['max_hold'])
    ev = []
    for k, c in enumerate(cs):
        s = c[0]['s']
        nxt = cs[k + 1][0]['s'] if k + 1 < len(cs) else c[-1]['e'] + 0.4
        e = min(nxt, c[-1]['e'] + 0.5)
        txt = ' '.join(w['w'] for w in c)
        if st['strip_punct']: txt = re.sub(r'[^\w\s\'%$-]', '', txt)
        if st['upper']: txt = txt.upper()
        f0, ms = int(st.get('pop_from', 0.85) * 100), int(st.get('pop_ms', 70))
        pop = rf'{{\fscx{f0}\fscy{f0}\t(0,{ms},\fscx100\fscy100)}}' if st['pop'] else ''
        ev.append(f'Dialogue: 0,{_t(s)},{_t(e)},Cap,,0,0,0,,{pop}{txt}')
    with open(out, 'w', encoding='utf-8') as f:
        f.write(hdr + '\n'.join(ev) + '\n')
    return {'file': out, 'fontsize': size, 'margin_v': margin_v, 'captions': len(ev), 'fontsdir': os.path.abspath(FONTS)}
