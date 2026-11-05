set -e
# Dùng: EP=<thư mục làm việc của tập> NAME=<Ten_Video> bash assemble.sh
# Cần trong EP: frames/f_%05d.jpg, out/captions.ass+srt, audio/voice_pad.wav, audio/music_ducked.wav, audio/sfx_n.wav, audio/final_mix.wav
# v7.1: chuẩn video tv-range BT.709 (kit v7 để nguyên yuvj420p full-range BT.601 của JPEG → nhiều máy/nền tảng đọc sai,
#       chữ phụ đề trắng ra 235 thay vì 255); thêm lớp unsharp mịn 3×3 (QA độ nét 0,848 → 0,876, xem 100% không quầng).
KIT=${KIT:-$(cd "$(dirname "$0")/.." && pwd)}; R=${EP:-$(pwd)}; NAME=${NAME:-RickClips_video}; D=$R/deliver; mkdir -p $D/media/fonts
TAG="-color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709"
# optional per-episode SAT (episode.env), e.g. 0.93 when warm sets push the QA saturation median over 135; unset = unchanged
EQ=${SAT:+eq=saturation=$SAT,}
ffmpeg -nostdin -v error -y -framerate 30 -i $R/frames/f_%05d.jpg \
  -vf "${EQ}unsharp=5:5:0.5:5:5:0,unsharp=3:3:0.5:3:3:0,scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p" \
  -c:v libx264 -preset slow -tune animation -crf 14 $TAG -r 30 $D/media/video_clean.mp4
cp $R/out/captions.ass $R/out/captions.srt $D/media/
cp "$KIT/fonts/WorkSans-latin-800.ttf" "$KIT/fonts/OFL-WorkSans.txt" "$D/media/fonts/"
cp $R/audio/voice_pad.wav $D/media/voice.wav; cp $R/audio/music_ducked.wav $D/media/music_ducked.wav; cp $R/audio/sfx_n.wav $D/media/sfx.wav
ffmpeg -nostdin -v error -y -i $D/media/video_clean.mp4 -i $R/audio/final_mix.wav -vf "subtitles=$D/media/captions.ass:fontsdir=$D/media/fonts,format=yuv420p" \
  -c:v libx264 -preset slow -tune animation -crf 16 $TAG -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$D/$NAME.mp4"
