"""Build, QA, look and deliver an episode (cwd = episode folder)."""
import json, os, shutil, subprocess, sys, tempfile
from . import cfg

ENV = lambda: dict(os.environ, PYTHONPATH=cfg.REPO + (':' + os.environ['PYTHONPATH'] if os.environ.get('PYTHONPATH') else ''))

def py(*args):
    subprocess.run([sys.executable, *args], check=True, env=ENV())

def overlays():
    if os.path.exists('make_overlays.py'): py('make_overlays.py')
    else: print('no make_overlays.py (no diagrams in this episode)')

def edl():
    py('gen_edl.py')

def assemble():
    py('-m', 'vidclone', 'assemble', 'edl.json')

def qa(video=None):
    video = video or json.load(open('edl.json'))['out']
    r = subprocess.run([sys.executable, '-m', 'vidclone', 'qa', video, '--style', cfg.STYLE, '--edl', 'edl.json', '--out', 'out/qa'], env=ENV())
    rep = json.load(open('out/qa/qa.json'))
    known = cfg.CHANNEL.get('qa', {}).get('known_false_fails', {})
    real = [k for k in rep['failed'] if k not in known]
    print(f"\nQA {rep['passed']}/{rep['checked']}; failed: {rep['failed'] or 'none'}; known false fails: "
          f"{[k for k in rep['failed'] if k in known] or 'none'}; to fix: {real or 'none'}")
    for row in rep['rows']:
        if row['key'] in rep['failed']:
            print(f"  {row['key']}: {row['value']} (range {row['lo']} .. {row['hi']})" + (f"  <- known: {known[row['key']]}" if row['key'] in known else ''))
    return rep

def frames(video, t0, t1, step, out):
    """Grid of frames (6 columns) with timestamps - check moments by eye at higher time resolution than the QA sheets."""
    d = tempfile.mkdtemp(); i = 0; t = float(t0)
    while t <= float(t1) + 1e-6:
        subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.2f}', '-i', video, '-frames:v', '1', '-vf',
                        f"scale=270:480,drawtext=fontfile='{cfg.FONT}':text='{t:.2f}':x=6:y=6:fontsize=26:fontcolor=red:borderw=2",
                        f'{d}/{i:03d}.png'], check=True)
        i += 1; t += float(step)
    rows = (i + 5) // 6
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-pattern_type', 'glob', '-i', f'{d}/*.png', '-vf', f'tile=6x{rows}', '-frames:v', '1', out], check=True)
    shutil.rmtree(d); print(out, i, 'frames')

def deliver():
    N = cfg.out_names(os.getcwd()); src = json.load(open('edl.json'))['out']
    shutil.copyfile(src, N['final'])
    w = cfg.CHANNEL.get('deliver', {}).get('preview_width', 720)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', N['final'], '-vf', f'scale={w}:-2', '-c:v', 'libx264', '-crf', '26', '-preset', 'medium',
                    '-c:a', 'aac', '-b:a', '128k', N['preview']], check=True)
    for k in ('final', 'preview'):
        p = N[k]; dur = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout.strip()
        print(f'{k}: {os.path.abspath(p)}  {os.path.getsize(p) / 1e6:.1f} MB  {float(dur):.1f} s')
