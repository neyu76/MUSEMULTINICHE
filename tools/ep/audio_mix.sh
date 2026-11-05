#!/bin/bash
# bash tools/ep/audio_mix.sh <EP>
# SFX track (episodes/<EP>/build_sfx.py) + final mix (production/mix_final.py: voice −16, bed −23 ducked, SFX −27, master −14 LUFS)
# + word captions. Needs voice_prep.sh first.
set -e; source "$(dirname "$0")/env.sh" "$1"
cp "$SRC/audio/$MUSIC" "$EP/audio/music.mp3"
ffmpeg -v error -y -i "$EP/voice/voice_final.wav" -af "adelay=$(python3 -c "print(int($VOICE_OFFSET*1000))"):all=1" -ar 48000 -ac 1 "$EP/voice/voice_off.wav"
python3 -I "$SRC/build_sfx.py" "$RC/production" "$SRC" "$EP/audio/sfx.wav" $DUR
cd "$EP/audio" && python3 -I "$RC/production/mix_final.py" --voice ../voice/voice_off.wav --music music.mp3 --sfx sfx.wav --dur $DUR
echo "music_ducked $(ffprobe -v error -show_entries format=duration -of csv=p=0 music_ducked.wav) s (must equal $DUR)"
python3 -I "$RC/tools/ep/captions.py" "$EP" $VOICE_OFFSET $DUR
