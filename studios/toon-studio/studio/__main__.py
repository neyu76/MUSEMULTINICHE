"""toon-studio CLI (run through bin/studio, inside WSL).

  studio new ATE01-005 sloth-sleep ["Title"] [--from path/to/script.txt|outline.md]   new episode folder
  studio status EP                       checklist of every production step
  studio voice EP [--take voice/take1.mp3] [--wpm 242] [--check]   take -> voice.wav + words.json + words.txt
  studio cut EP poses NAME ...           BiRefNet full-frame cut-outs (art/NAME -> cut/NAME.png, art/NAME.png 1080w)
  studio cut EP plates NAME ...          clean plates (plate/NAME.png + plate/NAME_b.png)
  studio cut EP props [--force]          props/green/* -> props/*.png (NAME.white marker = shot on white)
  studio grid EP out.jpg FILE ...        coarse 0.05 grids        studio crop EP NAME:cx:cy[:half] ...   0.01 grid crops
  studio sheet EP out.jpg FILE ...       look sheet               studio overlays EP   run make_overlays.py
  studio build EP [--qa] [--no-assemble] overlays + gen_edl + assemble (+ QA)
  studio qa EP                           QA the render against channel/style gates (known false fails marked)
  studio frames EP t0 t1 step out.jpg    frame grid of the render
  studio deliver EP                      <ID>_<slug>_FINAL.mp4 + _preview.mp4 in the episode folder
  studio audit EP [step=0.5]             critic sheets of the whole render (words, safe area, caption band)
  studio el plan voice|music|sfx EP     ElevenLabs request files for a connector (no key here)   studio el verify EP
EP = folder path, folder name or id (ATE01-004)."""
import argparse, os, sys
from . import cfg

def main():
    ap = argparse.ArgumentParser(prog='studio', description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    n = sub.add_parser('new'); n.add_argument('id'); n.add_argument('slug'); n.add_argument('title', nargs='?'); n.add_argument('--from', dest='src')
    for c in ('status', 'overlays', 'qa', 'deliver'): sub.add_parser(c).add_argument('ep')
    v = sub.add_parser('voice'); v.add_argument('ep'); v.add_argument('--take'); v.add_argument('--wpm', type=float); v.add_argument('--check', action='store_true')
    c = sub.add_parser('cut'); c.add_argument('ep'); c.add_argument('what', choices=['poses', 'plates', 'props']); c.add_argument('names', nargs='*')
    c.add_argument('--force', action='store_true')
    for k in ('grid', 'sheet'):
        g = sub.add_parser(k); g.add_argument('ep'); g.add_argument('out'); g.add_argument('files', nargs='+')
    cr = sub.add_parser('crop'); cr.add_argument('ep'); cr.add_argument('specs', nargs='+')
    b = sub.add_parser('build'); b.add_argument('ep'); b.add_argument('--qa', action='store_true'); b.add_argument('--no-assemble', action='store_true')
    f = sub.add_parser('frames'); f.add_argument('ep'); f.add_argument('t0'); f.add_argument('t1'); f.add_argument('step'); f.add_argument('out')
    au = sub.add_parser('audit'); au.add_argument('ep'); au.add_argument('step', nargs='?', default='0.5')
    e = sub.add_parser('el'); e.add_argument('action', choices=['plan', 'verify']); e.add_argument('a1'); e.add_argument('a2', nargs='?')
    x = ap.parse_args()

    if x.cmd == 'new':
        from . import episode
        return episode.new(x.id, x.slug, x.title, os.path.abspath(x.src) if x.src else None)
    if x.cmd == 'el':
        from . import el
        ep = x.a2 if x.action == 'plan' else x.a1
        if x.action == 'plan' and not x.a2: raise SystemExit('studio el plan voice|music|sfx EP')
        os.chdir(cfg.episode_dir(ep))
        return el.plan(x.a1) if x.action == 'plan' else (None if el.verify() else sys.exit(1))
    d = cfg.episode_dir(x.ep); os.chdir(d)
    if x.cmd == 'status':
        from . import episode; episode.status(d)
    elif x.cmd == 'voice':
        from . import voice; voice.run(d, x.take, x.wpm, retranscribe=x.check)
    elif x.cmd == 'cut':
        from . import assets
        {'poses': lambda: assets.poses(x.names), 'plates': lambda: assets.plates(x.names), 'props': lambda: assets.props(x.force)}[x.what]()
    elif x.cmd in ('grid', 'sheet'):
        from . import assets; getattr(assets, x.cmd)(x.out, x.files)
    elif x.cmd == 'crop':
        from . import assets; assets.crops(x.specs)
    elif x.cmd == 'overlays':
        from . import build; build.overlays()
    elif x.cmd == 'build':
        from . import build
        build.overlays(); build.edl()
        if not x.no_assemble: build.assemble()
        if x.qa: build.qa()
    elif x.cmd == 'qa':
        from . import build; build.qa()
    elif x.cmd == 'frames':
        from . import build, cfg as C
        import json
        build.frames(json.load(open('edl.json'))['out'], x.t0, x.t1, x.step, x.out)
    elif x.cmd == 'audit':
        from . import audit; audit.run(x.step)
    elif x.cmd == 'deliver':
        from . import build; build.deliver()

if __name__ == '__main__':
    sys.exit(main() and 0)
