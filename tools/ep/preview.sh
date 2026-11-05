#!/bin/bash
# bash tools/ep/preview.sh <EP>  → $EP/deliver/<NAME>_preview.mp4 (~17 MB phone preview, same colour tags as the master)
set -e; source "$(dirname "$0")/env.sh" "$1"
ffmpeg -nostdin -v error -y -i "$EP/deliver/$NAME.mp4" -c:v libx264 -preset slow -tune animation -crf 24 \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 160k -movflags +faststart "$EP/deliver/${NAME}_preview.mp4"
ls -la "$EP/deliver/${NAME}_preview.mp4"
