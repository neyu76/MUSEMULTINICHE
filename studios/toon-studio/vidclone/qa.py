"""QA a new video against a style's gates: analyze it the same way, compare, check every frame (black / white / frozen /
pops), write report.md/json + compare and problem sheets."""
import os, glob
from . import profile, sheets, frames
from .common import load, save

def run(video, style_dir, out=None, edl=None):
    name = os.path.splitext(os.path.basename(video))[0]
    out = out or f'{style_dir}/qa/{name}'
    r = profile.analyze(video, out, with_sheets=True)
    st = load(f'{style_dir}/style.json') if os.path.exists(f'{style_dir}/style.json') else {}
    fc_cfg = st.get('frame_check', {})
    planned = frames.planned_from_edl(load(edl)) if edl else frames.planned_from_transitions(r['edit'].get('transitions', []))
    fc = frames.check(video, f'{out}/sheets', planned, fc_cfg.get('max_frozen_s', 0.4))
    gates = load(f'{style_dir}/gates.json')
    rows = []
    for g in gates:
        if not g.get('on', True): continue
        v = profile._get(r, g['path'])
        if not isinstance(v, (int, float)) or isinstance(v, bool):
            rows.append({**g, 'value': v, 'ok': None}); continue
        ok = bool((g['lo'] is None or v >= g['lo']) and (g['hi'] is None or v <= g['hi']))
        rows.append({**g, 'value': round(float(v), 4), 'ok': ok})
    passed = sum(1 for x in rows if x['ok']); failed = [x for x in rows if x['ok'] is False]
    samples = sorted(glob.glob(f'{style_dir}/samples/*/work'))
    if samples: sheets.compare(samples[0], f'{out}/work', f'{out}/sheets/compare.jpg')
    rep = {'video': os.path.abspath(video), 'passed': passed, 'checked': sum(1 for x in rows if x['ok'] is not None),
           'failed': [x['key'] for x in failed] + ([] if fc['ok'] else ['frame_check']), 'rows': rows, 'frame_check': fc}
    save(rep, f'{out}/qa.json')
    fmt = lambda x: '—' if x is None else f'{x:g}' if isinstance(x, (int, float)) else str(x)
    md = [f'# QA {name} vs {os.path.basename(style_dir.rstrip("/"))}', '',
          f'**{passed}/{rep["checked"]} pass**' + (f' — fail: {", ".join(rep["failed"])}' if failed else ''), '',
          '| | Metric | Value | Target | Range |', '|---|---|---|---|---|']
    for x in rows:
        mark = '✅' if x['ok'] else '❌' if x['ok'] is False else '·'
        md.append(f"| {mark} | {x['label']} | {fmt(x['value'])} | {fmt(x['target'])} | {fmt(x['lo'])} … {fmt(x['hi'])} |")
    sec = lambda fs: ', '.join(f'{f} ({f / frames.FPS:.2f}s)' for f in fs[:12]) or 'none'
    md += ['', f"## Frame check ({fc['frames']} frames at {frames.FPS} fps{', planned jumps from the EDL' if edl else ''}) "
           + ('✅' if fc['ok'] else '❌'), '',
           f"- black frames: {sec(fc['black'])}",
           f"- unplanned white frames: {sec(fc['white_unplanned'])}",
           f"- frozen holds ≥ {fc['max_frozen_s']} s: " + (', '.join(f'{a}–{b} ({a / frames.FPS:.2f}–{b / frames.FPS:.2f}s)' for a, b in fc['frozen'][:12]) or 'none'),
           f"- unplanned pops (review by eye, not a fail): {sec(fc['pops_unplanned'])}",
           f"- frames held (almost no change): {fc['held_share'] * 100:.0f} %"]
    if fc.get('sheet'): md.append('- problem frames (prev | frame | next): `sheets/problems.jpg`')
    md += ['', 'Sheets: `sheets/compare.jpg` (sample | new), `sheets/sec_*.jpg`, `sheets/shots_*.jpg` — review them by eye too.']
    open(f'{out}/report.md', 'w', encoding='utf-8').write('\n'.join(md) + '\n')
    print('\n'.join(md))
    return rep
