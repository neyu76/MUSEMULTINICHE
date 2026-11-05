#!/bin/bash
# bash tools/ep/sheets.sh <EP> [video] [fps=4]   → $EP/review/sheet_NN.jpg (6×2 tiles, timecode burned in; 4 fps = 3 s per sheet)
# The manual review pass: open every sheet and look for floating props, clipped text, missing water/streams, labels over objects.
set -e; source "$(dirname "$0")/env.sh" "$1"
V=${2:-$EP/deliver/$NAME.mp4}; O=$EP/review; rm -rf "$O"; mkdir -p "$O"
ffmpeg -v error -i "$V" -vf "fps=${3:-4},scale=270:480,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='%{pts\:hms}':x=6:y=6:fontsize=18:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=6x2" "$O/sheet_%02d.jpg"
echo "$(ls "$O" | wc -l) sheets in $O"
