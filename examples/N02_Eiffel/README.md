# Tập mẫu N02 — The Man Who Sold the Eiffel Tower Twice (49,8 s)

Tập đầu tiên làm trọn quy trình skill bản 7, đạt 21/21 QA (độ nét chi tiết mịn 0,887, bão hòa 108, −14,0 LUFS).
Dùng làm khuôn mẫu khi làm tập mới. Bối cảnh 3D của tập này nằm sẵn trong `engine_v4/` (`paris.js`, `rooms.js`, `think.js`, `main.js`, tranh nền `mg/`).

| File | Nội dung |
|---|---|
| `script.txt` | Kịch bản 173 từ (khuôn "mưu mẹo có twist", hook "nhân vật + hành vi lạ") |
| `shot_list.md` | Shot list có mã kỹ thuật T01–T24 |
| `voice/align.json` | Mốc từng từ (căn cưỡng bức pocketsphinx) |
| `out/captions.ass/.srt`, `out/words.json` | Phụ đề từng từ (Work Sans ExtraBold 75/99/5/2.5/344) |
| `audio/events.json` | 33 cue SFX chọn lọc (t, tên, gain) |

Không có trong gói (tạo lại khi làm tập): giọng đọc WAV (SonicVoice), nhạc nền (Magnific), file SFX (kho EditorNghiepDu), khung hình.

## Các bước đã chạy cho tập này (tóm tắt — chi tiết trong SKILL.md)
```bash
EP=~/rc_N02; mkdir -p $EP/{voice,out,audio,frames}; cp script.txt $EP/
# 1) Giọng: SonicVoice giọng clone RickClips, speed 1.2 (178 → 211 từ/phút)
python3 $KIT/production/sonicvoice_tts.py tts $EP/script.txt --voice uv_1883_936c76a0be06 --provider mini --language English --speed 1.2 --out $EP/voice/voice
# 2) Mốc từng từ + phụ đề
python3 $KIT/engine_v4/align_ps.py $EP/voice/voice_final.wav $EP/script.txt $EP/voice/align.json   # sửa bảng NUM trong file cho các số của kịch bản
EP=$EP python3 $KIT/engine_v4/captions_n02.py      # → out/captions.ass, words.json
# 3) Nhạc: Magnific audio_music_generate (elevenlabs-music-generation-v2, instrumental, 50 s), chọn bản đều/sáng hơn
# 4) SFX: kho EditorNghiepDu → audio/sfxlib + map.json → python3 $KIT/production/mix_lib.py 49.8
cd $EP/audio && python3 $KIT/production/mix_final.py --voice ../voice/voice_final.wav --music music.mp3 --sfx sfx_lib.wav --dur 49.8
#    → voice_pad / music_ducked / sfx_n / final_mix.wav (voice −16, bed −23 + duck, SFX −27, master −14). N02 đo: sàn khoảng nghỉ −18,1 dB
# 5) Render: thử khung khó trước (SS=1 rồi SS=2), sau đó 2 tiến trình song song
cd $KIT/engine_v4 && SS=2 node render.js $EP/frames 0 16.43 30   # tiến trình 1
cd $KIT/engine_v4 && SS=2 node render.js $EP/frames 16.43 49.8 30  # tiến trình 2
# 6) Ráp + Kdenlive + QA
EP=$EP NAME=Eiffel_Tower_Sold_Twice_RickClips bash $KIT/engine_v4/assemble.sh
EP=$EP NAME=Eiffel_Tower_Sold_Twice_RickClips python3 $KIT/engine_v4/gen_kdenlive.py
python3 -I $KIT/tools/analysis/qa_compare.py $EP/deliver/Eiffel_Tower_Sold_Twice_RickClips.mp4 $EP/qa_out --captions $EP/out/captions.ass
```
