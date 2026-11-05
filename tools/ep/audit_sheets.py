#!/usr/bin/env python3
"""Critic sheets: 8 large tiles per sheet (4×2, 360×640) with the timecode AND the narration spoken at that moment under each tile,
so a reviewer can judge "does the picture show what the voice says" without the audio.

  python3 -I tools/ep/audit_sheets.py <EP> video [fps=2]          frames of deliver/<NAME>.mp4  → $EP/audit/video_NN.jpg
  python3 -I tools/ep/audit_sheets.py <EP> stills <name>          stills from stills.sh <name>   → $EP/audit/<name>_NN.jpg
Needs $EP/out/words.json (audio_mix.sh). Work dir: ${RC_WORK:-~/rc_work}/<EP>.
"""
import sys, os, glob, json, subprocess, tempfile, re
from PIL import Image, ImageDraw, ImageFont

ep = sys.argv[1]; mode = sys.argv[2]; arg = sys.argv[3] if len(sys.argv) > 3 else None
W = os.path.join(os.environ.get("RC_WORK", os.path.expanduser("~/rc_work")), ep)
words = json.load(open(os.path.join(W, "out", "words.json")))
def said(t, span=0.6):
    return " ".join(w["w"] for w in words if w["e"] >= t - span and w["s"] <= t + span)
def font(sz):
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        if os.path.exists(p): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()

tmp = None
if mode == "video":
    fps = float(arg or 2)
    vids = glob.glob(os.path.join(W, "deliver", "*.mp4")); vids = [v for v in vids if not v.endswith("_preview.mp4")]
    if not vids: sys.exit("no deliver/*.mp4 — run finalize.sh first")
    tmp = tempfile.mkdtemp(dir=os.path.expanduser("~/tmp") if os.path.isdir(os.path.expanduser("~/tmp")) else None)
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", vids[0], "-vf", f"fps={fps},scale=360:640", os.path.join(tmp, "f_%05d.jpg")], check=True)
    frames = sorted(glob.glob(os.path.join(tmp, "f_*.jpg"))); items = [((i + 0.5) / fps, f) for i, f in enumerate(frames)]
    tag = "video"
elif mode == "stills":
    src = f"/tmp/rc_stills_{ep}/{arg}"; fs = glob.glob(src + "/still_*.jpg")
    if not fs: sys.exit(f"no stills in {src} — run stills.sh {ep} {arg} first")
    items = sorted((float(re.search(r"still_([0-9.]+)\.jpg", f).group(1)), f) for f in fs); tag = arg
else:
    sys.exit(__doc__)

out = os.path.join(W, "audit"); os.makedirs(out, exist_ok=True)
for old in glob.glob(os.path.join(out, f"{tag}_*.jpg")): os.remove(old)
TW, TH, CAP = 360, 640, 70; f1, f2 = font(22), font(17)
n = 0
for k in range(0, len(items), 8):
    chunk = items[k:k + 8]; sheet = Image.new("RGB", (4 * TW, 2 * (TH + CAP)), (20, 20, 20)); d = ImageDraw.Draw(sheet)
    for i, (t, f) in enumerate(chunk):
        x, y = (i % 4) * TW, (i // 4) * (TH + CAP)
        sheet.paste(Image.open(f).convert("RGB").resize((TW, TH)), (x, y))
        d.rectangle([x, y + TH, x + TW - 2, y + TH + CAP - 2], fill=(0, 0, 0))
        d.text((x + 6, y + TH + 4), f"{t:6.2f}s", font=f1, fill=(255, 220, 0))
        s = said(t); s = s if len(s) <= 40 else s[:39] + "…"
        d.text((x + 6, y + TH + 36), f"“{s}”", font=f2, fill=(230, 230, 230))
        for fx in (0.05, 0.95):   # 5 % safe-area guides
            d.line([(x + int(TW * fx), y), (x + int(TW * fx), y + TH)], fill=(0, 160, 255))
    n += 1; sheet.save(os.path.join(out, f"{tag}_{n:02d}.jpg"), quality=88)
print(f"{n} sheets → {out}/{tag}_NN.jpg ({len(items)} tiles)")
