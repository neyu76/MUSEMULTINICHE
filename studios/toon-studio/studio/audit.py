"""Critic sheets for the whole render: a frame every STEP s (default 0.5), 8 per sheet (4×2, 360×640), each with the timecode, the
words spoken at that moment, the 5 % / 95 % safe-area guides (blue) and the caption band y 0.57–0.79 (magenta).
The CRITIC opens EVERY sheet — not only the gags. Writes out/audit/audit_NN.jpg.
usage: studio audit EP [step]"""
import glob, json, os, shutil, subprocess, tempfile
from PIL import Image, ImageDraw, ImageFont
from . import cfg

def run(step=0.5):
    video = json.load(open('edl.json'))['out'] if os.path.exists('edl.json') else None
    if not video or not os.path.exists(video): raise SystemExit('no render yet: studio build EP first')
    W = json.load(open('words.json'))['words']
    said = lambda t: ' '.join(w['w'] for w in W if w['e'] >= t - 0.5 and w['s'] <= t + 0.5)
    tmp = tempfile.mkdtemp()
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', video, '-vf', f'fps={1 / float(step)},scale=360:640', f'{tmp}/f_%05d.png'], check=True)
    frames = sorted(glob.glob(f'{tmp}/f_*.png')); os.makedirs('out/audit', exist_ok=True)
    for old in glob.glob('out/audit/audit_*.jpg'): os.remove(old)
    try: f1, f2 = ImageFont.truetype(cfg.FONT, 26), ImageFont.truetype(cfg.FONT, 19)
    except OSError: f1 = f2 = ImageFont.load_default()
    TW, TH, CAP = 360, 640, 72; n = 0
    for k in range(0, len(frames), 8):
        sh = Image.new('RGB', (4 * TW, 2 * (TH + CAP)), (20, 20, 20)); d = ImageDraw.Draw(sh)
        for i, f in enumerate(frames[k:k + 8]):
            t = (k + i + 0.5) * float(step); x, y = (i % 4) * TW, (i // 4) * (TH + CAP)
            sh.paste(Image.open(f).convert('RGB'), (x, y))
            for fx in (0.05, 0.95): d.line([(x + int(TW * fx), y), (x + int(TW * fx), y + TH)], fill=(0, 160, 255))
            for fy in (0.05, 0.95): d.line([(x, y + int(TH * fy)), (x + TW, y + int(TH * fy))], fill=(0, 160, 255))
            for fy in (0.57, 0.79): d.line([(x, y + int(TH * fy)), (x + TW, y + int(TH * fy))], fill=(255, 0, 200))
            d.rectangle([x, y + TH, x + TW - 2, y + TH + CAP - 2], fill=(0, 0, 0))
            d.text((x + 6, y + TH + 2), f'{t:6.2f}s', font=f1, fill=(255, 220, 0))
            s = said(t); s = s if len(s) <= 38 else s[:37] + '…'
            d.text((x + 6, y + TH + 38), f'“{s}”', font=f2, fill=(230, 230, 230))
        n += 1; sh.save(f'out/audit/audit_{n:02d}.jpg', quality=88)
    shutil.rmtree(tmp); print(f'{n} sheets → {os.path.abspath("out/audit")}/audit_NN.jpg ({len(frames)} frames, every {step} s)')
