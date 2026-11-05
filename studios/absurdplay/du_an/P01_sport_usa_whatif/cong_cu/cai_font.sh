#!/bin/bash
# Cài font TTF của dự án vào ~/.fonts để libass (ffmpeg subtitles, melt avfilter.subtitles, Kdenlive) dùng đúng font.
# Chạy 1 lần mỗi máy, sau đó kiểm: fc-match "Inter ExtraBold" phải ra Inter, không ra DejaVu.
set -e
D="$(cd "$(dirname "$0")/.." && pwd)/engine/fonts/ttf"
mkdir -p ~/.fonts && cp "$D"/*.ttf ~/.fonts/ && fc-cache -f ~/.fonts >/dev/null
for f in "Inter ExtraBold" "Inter Black" "Montserrat ExtraBold"; do printf '%-22s -> %s\n' "$f" "$(fc-match "$f")"; done
fc-match "Inter ExtraBold" | grep -qi inter || { echo "LOI: Inter ExtraBold chua cai duoc"; exit 1; }
