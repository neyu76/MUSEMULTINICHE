#!/bin/bash
# bash tools/ep/qa.sh <EP> [video]       (default video: $EP/deliver/<NAME>.mp4)
# 1) qa_compare.py: 21 measured checks vs the 18 samples (re-encodes to 720×1280 crf18 veryfast first, like the samples were measured)
# 2) sharpness.py on the delivered file   3) every frame scanned for black/flat frames   4) per-second detail (find soft shots)
set -e; source "$(dirname "$0")/env.sh" "$1"
V=${2:-$EP/deliver/$NAME.mp4}
python3 -I "$RC/tools/analysis/qa_compare.py" "$V" "$EP/qa_out" --captions "$EP/out/captions.ass" | tail -28
echo "sharpness (delivered file): $(python3 -I "$RC/tools/analysis/sharpness.py" "$V" 40)"
python3 -I "$RC/tools/ep/flat_frames.py" "$V" || echo "!! BLACK/FLAT FRAMES — re-render them: bash tools/ep/render.sh $EPN \"\" \"<i>-<i>\""
python3 -I "$RC/tools/ep/detail_by_time.py" "$V" > "$EP/qa_out/detail_by_time.txt"; echo "per-second detail → $EP/qa_out/detail_by_time.txt (lowest 5:)"; sort -k3 -n "$EP/qa_out/detail_by_time.txt" | head -5
