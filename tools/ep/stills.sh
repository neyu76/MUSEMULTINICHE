#!/bin/bash
# bash tools/ep/stills.sh <EP> <name> <t1,t2,...> [SS]
# Render single frames (default SS=1, ~5–15 s each) → contact sheet $EP/preview/<name>.png (red line = caption baseline).
# Use before every full render: check the hard shots (close-ups of text, fast moves, every changed shot).
set -e; source "$(dirname "$0")/env.sh" "$1"
bash "$RC/tools/ep/sync_engine.sh" "$EPN" >/dev/null
OUT=/tmp/rc_stills_$EPN/$2; rm -rf "$OUT"; mkdir -p "$EP/preview"
cd "$E" && SS=${4:-1} timeout 1500 node render.js "$OUT" 0 0 30 "$3" 2>&1 | grep -E "err|done|page" | tail -15
python3 -I - "$OUT" "$EP/preview/$2.png" <<'PY'
import sys, glob
from PIL import Image, ImageDraw
src, dst = sys.argv[1:3]; fs = sorted(glob.glob(src + '/still_*.jpg'), key=lambda f: float(f.split('_')[-1][:-4]))
cols = min(6, len(fs)); rows = (len(fs) + cols - 1) // cols; o = Image.new('RGB', (cols * 300, rows * 533)); d = ImageDraw.Draw(o)
for i, f in enumerate(fs):
    x, y = (i % cols) * 300, (i // cols) * 533; o.paste(Image.open(f).resize((300, 533)), (x, y)); d.text((x + 6, y + 6), f.split('_')[-1][:-4], fill='yellow')
    d.line([(x, y + 382), (x + 300, y + 382)], fill=(255, 0, 0))
o.save(dst); print('sheet', dst, len(fs))
PY
