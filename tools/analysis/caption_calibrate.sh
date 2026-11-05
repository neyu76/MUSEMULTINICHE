# caption_calibrate.sh <Fontsize> <Outline> <MarginV>  → đo chân chữ/cỡ chữ bằng capgeo.py (thư mục làm việc /tmp/rc_cal)
HERE=$(cd "$(dirname "$0")" && pwd); KITD=$(cd "$HERE/../.." && pwd); mkdir -p /tmp/rc_cal && cd /tmp/rc_cal
FS=$1; OL=$2; MV=$3
python3 - $FS $OL $MV <<'PY'
import sys
fs,ol,mv=sys.argv[1:4]
words="happiest stranger memories garbage scratching always noticed weird marched behind money finally".split()
h=f"""[Script Info]
ScriptType: v4.00+
PlayResX: 720
PlayResY: 1280

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Word,Work Sans ExtraBold,{fs},&H00FFFFFF,&H00FFFFFF,&H00000000,&H78000000,0,0,0,0,99,100,0,0,1,{ol},2.5,2,30,30,{mv},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
ev=[f"Dialogue: 0,0:00:{i:02d}.00,0:00:{i+1:02d}.00,Word,,0,0,0,,{w}" for i,w in enumerate(words)]
open('t.ass','w').write(h+'\n'.join(ev)+'\n')
PY
ffmpeg -nostdin -v error -y -f lavfi -i color=c=0x5a6070:s=720x1280:r=30:d=12 -vf "subtitles=t.ass:fontsdir=$KITD/fonts" -c:v libx264 -crf 16 v.mp4
python3 -I "$HERE/capgeo.py" /tmp/rc_cal | tail -1
