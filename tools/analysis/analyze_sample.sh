#!/bin/bash
# Phân tích 1 video mẫu mới theo đúng quy trình Style Bible.
# Dùng: tools/analysis/analyze_sample.sh path/to/sample.mp4 out_dir
set -e; H=$(cd "$(dirname "$0")" && pwd); SRC=$(realpath "$1"); D=$(realpath -m "$2"); mkdir -p "$D"
ffmpeg -nostdin -v error -y -i "$SRC" -vf "scale=720:1280,fps=30" -c:v libx264 -preset veryfast -crf 18 -c:a aac "$D/v.mp4"
ffmpeg -nostdin -v error -y -i "$D/v.mp4" -ar 48000 -ac 2 "$D/a48.wav"
python3 -I "$H/measure.py" "$D"; python3 -I "$H/cuts3.py" "$D"; python3 -I "$H/capgeo.py" "$D"; python3 -I "$H/audio2.py" "$D"
bash "$H/ocr.sh" "$D" && python3 -I "$H/transcript.py" "$D"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$D/v.mp4" | cut -d. -f1)
for s in $(seq 0 20 $DUR); do ffmpeg -nostdin -v error -y -ss $s -t 20 -i "$D/v.mp4" -vf "fps=1,scale=180:-1,drawtext=text='%{eif\:t+$s\:d}s':x=3:y=3:fontsize=16:fontcolor=yellow:box=1:boxcolor=black@0.7,tile=10x2" -frames:v 1 "$D/sheet_$(printf %02d $s).jpg"; done
ffmpeg -nostdin -v error -y -t 15 -i "$D/a48.wav" -lavfi "showspectrumpic=s=1600x500:legend=1:scale=log:fscale=log:mode=combined:start=40:stop=16000" "$D/spec15.png"
echo "Xong: $D (measure.json, capgeo.json, audio2.json, transcript.json, sheet_*.jpg, spec15.png)."
echo "Bước tiếp: xem từng sheet, ghi bảng mốc thời gian theo mẫu references/per_video/V01.md, cập nhật STYLE_BIBLE nếu có quy tắc mới."
