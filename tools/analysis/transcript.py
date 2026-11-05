"""Clean OCR caption stream -> caption events + transcript + pacing stats.  python3 -I transcript.py V1"""
import sys, re, json
import os; D = os.path.abspath(sys.argv[1]); vid = os.path.basename(D)
rows = []
for line in open(f'{D}/captions_ocr.tsv', encoding='utf-8', errors='ignore'):
    p = line.rstrip('\n').split('\t')
    if len(p) < 2: continue
    t = float(p[0]) if p[0] not in ('', '.') else 0.0
    toks = re.findall(r"[A-Za-z0-9$][A-Za-z0-9$,.'’?!%:-]*", p[1])
    # keep tokens that look like words: >=2 letters or digits, or single 'A'/'I'
    toks = [k for k in toks if (sum(c.isalpha() for c in k) >= 2 or re.fullmatch(r"[\d$,.%]+", k) or k in ('A', 'I', 'a'))]
    rows.append((t, ' '.join(toks)))
# stabilise: an event = text that persists >= 2 consecutive OCR samples (0.2 s) or is followed by different stable text
events = []
for i, (t, x) in enumerate(rows):
    if not x: continue
    nxt_t = rows[i + 1][0] if i + 1 < len(rows) else t + 0.3
    dur = nxt_t - t
    key = re.sub(r'[^a-z0-9$]', '', x.lower())
    if events and events[-1]['key'] == key:
        events[-1]['end'] = nxt_t; continue
    events.append({'start': t, 'end': nxt_t, 'text': x, 'key': key})
# merge OCR variants: drop events < 0.15 s whose key is substring-similar to neighbour
clean = []
for e in events:
    d = e['end'] - e['start']
    if d < 0.15 and clean and (e['key'] in clean[-1]['key'] or clean[-1]['key'] in e['key']): clean[-1]['end'] = e['end']; continue
    if d < 0.12: continue
    if clean and clean[-1]['key'] == e['key']: clean[-1]['end'] = e['end']; continue
    clean.append(e)
words = [w for e in clean for w in e['text'].split()]
dur_speech = (clean[-1]['end'] - clean[0]['start']) if clean else 1
wpc = [len(e['text'].split()) for e in clean]
out = {'id': vid, 'n_caption_events': len(clean), 'n_words_est': len(words), 'speech_span_s': round(dur_speech, 1),
       'wpm_est': round(len(words) / dur_speech * 60, 1), 'words_per_caption_mean': round(sum(wpc) / max(1, len(wpc)), 2),
       'share_1w': round(sum(1 for w in wpc if w == 1) / len(wpc), 2), 'share_2w': round(sum(1 for w in wpc if w == 2) / len(wpc), 2),
       'share_3plus': round(sum(1 for w in wpc if w >= 3) / len(wpc), 2),
       'caption_dur_median': round(sorted(e['end'] - e['start'] for e in clean)[len(clean) // 2], 2),
       'events': [{'t': round(e['start'], 1), 'd': round(e['end'] - e['start'], 2), 'text': e['text']} for e in clean]}
json.dump(out, open(f'{D}/transcript.json', 'w'), indent=1, ensure_ascii=False)
open(f'{D}/transcript.txt', 'w').write(' '.join(e['text'] for e in clean))
print(vid, {k: out[k] for k in ['n_caption_events', 'n_words_est', 'wpm_est', 'words_per_caption_mean', 'share_1w', 'share_2w', 'share_3plus', 'caption_dur_median']})
