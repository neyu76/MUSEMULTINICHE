#!/bin/bash
id=$1; mkdir -p $id/ocr; rm -f $id/ocr/*.png
ffmpeg -nostdin -v error -y -i $id/v.mp4 -vf "fps=10,crop=720:120:0:840,lutyuv=y='if(gt(val,210),0,255)':u=128:v=128" $id/ocr/o_%05d.png
prev=""; : > $id/captions_ocr.tsv
for f in $id/ocr/o_*.png; do n=$(basename $f .png); n=${n:2}; t=$(echo "scale=1;($((10#$n))-1)/10"|bc); w=$(tesseract $f - --psm 7 2>/dev/null | tr -d '\n' | sed 's/[|_~—“”‘’]//g; s/^ *//; s/ *$//'); if [ "$w" != "$prev" ]; then printf "%s\t%s\n" "$t" "$w" >> $id/captions_ocr.tsv; prev="$w"; fi; done
rm -rf $id/ocr
echo "$id $(wc -l < $id/captions_ocr.tsv)"
