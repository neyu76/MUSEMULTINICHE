#!/bin/bash
# bash tools/ep/voice_prep.sh <EP> [take] [tempo]
# ElevenLabs take → mono, highpass, de-ess, tempo (pitch kept), trimmed, exactly −16 LUFS → pocketsphinx forced alignment (word times).
# out: $EP/voice/voice_final.wav, $EP/voice/align.json
set -e; source "$(dirname "$0")/env.sh" "$1"
T=${2:-$TAKE}; TP=${3:-$TEMPO}
cp "$SRC/script.txt" "$EP/script.txt"
ffmpeg -v error -y -i "$SRC/voice/$T.mp3" -ac 1 -ar 48000 \
  -af "highpass=f=100,deesser=i=0.3,atempo=$TP,silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5:LRA=11,alimiter=limit=0.8" \
  "$EP/voice/voice_pre.wav"
I=$(ffmpeg -hide_banner -nostats -i "$EP/voice/voice_pre.wav" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
ffmpeg -v error -y -i "$EP/voice/voice_pre.wav" -af "volume=$(python3 -c "print(-16-($I))")dB,alimiter=limit=0.89:level=false" "$EP/voice/voice_final.wav"
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$EP/voice/voice_final.wav"); W=$(wc -w < "$EP/script.txt")
python3 -c "print('voice %.2f s, %d words, %.0f wpm (samples 208–244)'%($D,$W,$W/$D*60))"
python3 "$RC/engine_v4/align_ps.py" "$EP/voice/voice_final.wav" "$EP/script.txt" "$EP/voice/align.json" | head -1
