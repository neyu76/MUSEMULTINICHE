#!/bin/bash
# bash tools/ep/finalize.sh <EP>
# frames + captions + stems → deliver/<NAME>.mp4 (captions burned) + Kdenlive project (melt-checked) → QA (21 checks) + black-frame scan.
# Needs: all $NFRAMES frames (render.sh), audio_mix.sh done.
set -e; source "$(dirname "$0")/env.sh" "$1"
N=$(ls "$EP"/frames/f_*.jpg 2>/dev/null | wc -l); echo "frames $N / $NFRAMES"
[ "$N" -eq "$NFRAMES" ] || { echo "missing frames → bash tools/ep/render.sh $EPN"; exit 1; }
rm -rf "$EP/deliver"
EP=$EP NAME=$NAME KIT=$RC SAT=${SAT:-} bash "$RC/engine_v4/assemble.sh"
echo "video: $(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,pix_fmt,color_range,color_space -of compact=p=0 "$EP/deliver/$NAME.mp4")"
# Kdenlive master gain from the measured stem sum (so the project plays at −14 LUFS like the mp4)
L=$(ffmpeg -nostdin -i "$EP/audio/sum.wav" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
GAIN=$(python3 -c "print(round(10**((-14-($L))/20),3))") EP=$EP NAME=$NAME python3 -I "$RC/engine_v4/gen_kdenlive.py"
M=/tmp/rc_melt_$EPN.mp4; rm -f $M
(cd "$EP/deliver" && timeout -k 15 900 melt -quiet $NAME.kdenlive -consumer avformat:$M vcodec=libx264 acodec=aac </dev/null >/dev/null 2>&1) || true   # melt waits on stdin keys when detached
if [ -s $M ]; then echo "melt check: dur $(ffprobe -v error -show_entries format=duration -of csv=p=0 $M) s, $(ffmpeg -nostdin -i $M -af ebur128 -f null - 2>&1 | grep -E '^\s+I:' | tail -1 | xargs)"
else echo "melt check: FAILED (no output)"; fi
python3 -I -c "import shutil; shutil.make_archive('$EP/${NAME}_kdenlive', 'zip', '$EP/deliver')"   # project + media (relative paths) → $EP/<NAME>_kdenlive.zip
bash "$RC/tools/ep/qa.sh" "$EPN"
