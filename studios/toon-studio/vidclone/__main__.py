"""vidclone CLI.

  vidclone analyze <video> --style styles/<name> [--id S01] [--script script.txt]
  vidclone merge   styles/<name>
  vidclone qa      <video> --style styles/<name> [--edl edl.json]
  vidclone assemble <edl.json>
  vidclone captions <words.json> --style styles/<name> --w 1080 --h 1920 --out captions.ass
  vidclone transcribe <audio> --out words.json [--script script.txt]
  vidclone motion  styles/<name>/samples/S01      # (re)measure picture changes + local motion into analysis.json
"""
import argparse, json, os, sys

def main():
    ap = argparse.ArgumentParser(prog='vidclone')
    sub = ap.add_subparsers(dest='cmd', required=True)
    a = sub.add_parser('analyze'); a.add_argument('video'); a.add_argument('--style', required=True)
    a.add_argument('--id'); a.add_argument('--script'); a.add_argument('--no-sheets', action='store_true')
    m = sub.add_parser('merge'); m.add_argument('style')
    qq = sub.add_parser('qa'); qq.add_argument('video'); qq.add_argument('--style', required=True); qq.add_argument('--out'); qq.add_argument('--edl')
    e = sub.add_parser('assemble'); e.add_argument('edl')
    c = sub.add_parser('captions'); c.add_argument('words'); c.add_argument('--style'); c.add_argument('--w', type=int, default=1080)
    c.add_argument('--h', type=int, default=1920); c.add_argument('--out', required=True); c.add_argument('--script')
    t = sub.add_parser('transcribe'); t.add_argument('audio'); t.add_argument('--out', required=True); t.add_argument('--script')
    t.add_argument('--lang', help="force the language, e.g. en (recommended with --script)")
    mo = sub.add_parser('motion'); mo.add_argument('sample_dirs', nargs='+')
    x = ap.parse_args()
    if x.cmd == 'motion':   # back-fill / refresh the motion block of already analysed samples
        from . import profile
        from .common import load, save
        for d in x.sample_dirs:
            d = d.rstrip('/'); r = load(f'{d}/analysis.json')
            r['motion'] = profile.motion(f'{d}/work/proxy.mp4', f'{d}/analysis.json', f'{d}/parts', profile.caption_band(r.get('text')))
            save(r, f'{d}/analysis.json')
            print(d, json.dumps(r['motion']))
        return
    if x.cmd == 'analyze':
        from . import profile
        sid = x.id or os.path.splitext(os.path.basename(x.video))[0]
        r = profile.analyze(x.video, f'{x.style}/samples/{sid}', x.script, not x.no_sheets)
        s = r['edit']['summary']
        print(json.dumps({'dur': r['info']['dur'], 'shots': s['shot_count'], 'transitions': s['transition_mix'],
                          'camera': s['camera_share'], 'wpm': r['speech'].get('wpm'), 'lufs': (r['audio'] or {}).get('lufs'),
                          'captions': r['text']['captions'].get('present_share'), 'sheets': r.get('sheets')}, indent=1))
    elif x.cmd == 'merge':
        from . import profile
        prof, gates = profile.merge(x.style.rstrip('/'))
        print(f"{prof['n']} sample(s) → {len(gates)} gates in {x.style}/gates.json")
    elif x.cmd == 'qa':
        from . import qa
        rep = qa.run(x.video, x.style.rstrip('/'), x.out, x.edl)
        sys.exit(0 if not rep['failed'] else 1)
    elif x.cmd == 'assemble':
        from . import assemble
        assemble.run(x.edl)
    elif x.cmd == 'captions':
        from . import captions
        captions.write(x.words, x.out, x.w, x.h, x.style, x.script)
    elif x.cmd == 'transcribe':
        import tempfile, subprocess
        from . import speech
        wav = tempfile.mktemp(suffix='.wav')
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', x.audio, '-ac', '1', '-ar', '16000', wav], check=True)
        sc = open(x.script, encoding='utf-8').read() if x.script else None
        if os.path.exists(x.out): os.remove(x.out)   # an explicit transcribe always redoes it
        r = speech.transcribe(wav, x.out, sc, x.lang); os.remove(wav)
        print(f"{len(r['words'])} words → {x.out}")

if __name__ == '__main__':
    main()
