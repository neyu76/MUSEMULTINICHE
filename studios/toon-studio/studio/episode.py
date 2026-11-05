"""New episode folder from the input (script / outline / brief) + a status checklist of every production step."""
import glob, json, os, re, shutil
from . import cfg

DIRS = ['art', 'cut', 'plate', 'props/green', 'audio', 'voice', 'out', 'heads']

def new(ep_id, slug, title=None, src=None):
    slug = re.sub(r'[^a-z0-9]+', '-', slug.lower()).strip('-')
    d = os.path.join(cfg.WORK_DIR, f'{ep_id}-{slug}')
    if os.path.exists(os.path.join(d, 'episode.json')): raise SystemExit(f'{d} already exists')
    for s in DIRS: os.makedirs(os.path.join(d, s), exist_ok=True)
    json.dump({'id': ep_id, 'slug': slug, 'title': title or slug.replace('-', ' ').title()},
              open(os.path.join(d, 'episode.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    T = title or slug.replace('-', ' ').title()
    for f in os.listdir(cfg.TEMPLATES):
        dst = os.path.join(d, f)
        if not os.path.exists(dst):
            s = open(os.path.join(cfg.TEMPLATES, f), encoding='utf-8').read().replace('{ID}', ep_id).replace('{TITLE}', T)
            open(dst, 'w', encoding='utf-8').write(s)
    if src:
        kind = 'script.txt' if src.endswith('script.txt') else 'input.md'
        shutil.copyfile(src, os.path.join(d, kind))
    print(d)
    return d

def _n(pat): return len(glob.glob(pat))

def status(d):
    os.chdir(d); E = cfg.episode(d); N = cfg.out_names(d); V = cfg.CHANNEL.get('voice', {})
    rows = []
    def row(ok, step, info=''): rows.append(('x' if ok else ' ', step, info))
    has = os.path.exists
    row(has('input.md') or has('script.txt'), 'input (input.md / script.txt)')
    sc = open('script.txt', encoding='utf-8').read().split() if has('script.txt') else []
    row(bool(sc), 'script.txt', f'{len(sc)} words')
    row(has('brief.md') and 'TODO' not in open('brief.md', encoding='utf-8').read(), 'brief.md (beats, claims, conditions)')
    row(has('voice/take1.mp3') or has('voice/take1.wav'), 'voice take (voice/take1.mp3)')
    if has('words.json'):
        W = json.load(open('words.json'))['words']; span = W[-1]['e'] - W[0]['s']; wpm = len(W) / span * 60
        lo, hi = V.get('wpm_range', [0, 999])
        row(lo <= wpm <= hi and len(W) == len(sc), 'voice.wav + words.json', f'{len(W)} words, {wpm:.0f} wpm, ends {W[-1]["e"]:.2f}s')
    else: row(False, 'voice.wav + words.json')
    row(has('shots.md') and 'TODO' not in open('shots.md', encoding='utf-8').read(), 'shots.md (pose script + shot list)')
    arts = [os.path.splitext(os.path.basename(p))[0] for p in glob.glob('art/*.jpg') + glob.glob('art/*.webp')]
    row(bool(arts), 'art/ (Flow pictures)', f'{len(arts)}')
    row(_n('cut/*.png') > 0, 'cut/ (BiRefNet poses)', f'{_n("cut/*.png")}')
    row(_n('plate/*_b.png') > 0, 'plate/ (clean plates)', f'{_n("plate/*_b.png")}')
    row(_n('props/*.png') > 0, 'props/ (cut props + diagrams)', f'{_n("props/*.png")} png, {_n("props/green/*.*")} green')
    sfx = [p for p in glob.glob('audio/*.mp3') if not p.endswith('music.mp3')]
    row(len(sfx) >= 8, 'audio/ SFX (library, one per action)', f'{len(sfx)}')
    row(has('audio/music.mp3'), 'audio/music.mp3')
    row(has('edl.json'), 'edl.json')
    row(has(N['render']), N['render'])
    if has('out/qa/qa.json'):
        q = json.load(open('out/qa/qa.json')); known = cfg.CHANNEL.get('qa', {}).get('known_false_fails', {})
        real = [k for k in q['failed'] if k not in known]
        row(not real, 'QA', f"{q['passed']}/{q['checked']}, fails {q['failed']}")
    else: row(False, 'QA')
    row(has(N['final']) and has(N['preview']), 'delivered', f"{N['final']}, {N['preview']}")
    print(f"{E['id']} {E.get('title', '')}  ({d})")
    for m, s, i in rows: print(f'  [{m}] {s:42s} {i}')
