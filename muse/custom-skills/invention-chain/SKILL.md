---
name: invention-chain
description: Make a finished "How you invented X" TikTok short (9:16, 33–36 s, viewer "you" invents an everyday object through 5–6 fail→fix loops, crude humour, double-entendre ending; MakeHuman + mocap three.js 3D) on autopilot — from nothing ("next one"), an object, an outline or a script: topic, script, voice, 3D scene, render, mix, QA, deliver. Use whenever the owner asks for a new "how you invented" / P02 / invention-chain video or names an object for it.
---
# How you invented X (P02) — Muse autopilot (install: copy this folder to ~/workspace/custom-skills/invention-chain/)

The owner writes Vietnamese: answer in Vietnamese. Message the owner ONLY with the finished video + report, or a blocker only they can solve.

## Sources (read before the first episode of a session)
- Kit (public): `git clone https://github.com/mailcontentnba76-cell/absurdplay-kit -b du-an-moi ~/absurdplay-kit` → `P=~/absurdplay-kit/du_an/P02_oddtilt`.
  Before `git pull` of the kit: `git -C ~/absurdplay-kit checkout -- du_an/P02_oddtilt/engine/render.js`, then re-run cai_overlay.sh (it re-patches).
  Read `~/absurdplay-kit/skill/invention-chain-shorts/SKILL.md` (style law) and `QUY_TRINH_DAY_DU.md` (14 steps) — follow them with the Muse changes below.
- This repo (MUSEMULTINICHE, cloned at `~/wynn-media`): `bash ~/wynn-media/studios/p02-invention/cai_overlay.sh ~/absurdplay-kit` after every clone/pull
  (adds `cong_cu/moc_shot.py giong_chuan.py tron_am_auto.py qa_tap.py tao_phu_de.py render_nen.sh`, `engine/render.js` with resume + CHROME_PATH).
- Content skills: `~/wynn-media/skills/invention-topic-studio/SKILL.md`, `~/wynn-media/skills/invention-script-writer/SKILL.md` (+ their references/).
- Settings: `~/wynn-media/niches/how-you-invented/channel.env`; critic: `~/wynn-media/niches/how-you-invented/CRITIC.md` + `~/wynn-media/docs/AUTOPILOT.md`.

## First-time setup on an account
1. `bash $P/cai_dat/cai_dat.sh` (pip, npm, Playwright, Parakeet + MakeHuman into `~/.p02`) → `bash $P/cai_dat/kiem_tra.sh --render` (if your safety check blocks kiem_tra.sh, run the same checks yourself and render 3 test frames of
   `engine/e8_den_bat_muoi.html` at 1080×1920 with render.js to measure s/frame). If Playwright cannot
   download Chromium, point `CHROME_PATH` at an existing headless Chromium. Every session: re-check ffmpeg (apt may vanish after a VM replacement).
2. Audio pack `AbsurdPlay_P02_am_thanh.zip` (SFX library + ukulele music + `giong_goc_E05.mp3`): the owner uploads it once → `unzip -o … -d $P`.
   Missing at the first episode = blocker (ask once, together with the voice question below).
3. Voice (channel.env `VOICE_ROUTE`; the kit's "Odd Tilt" lives in the owner's Magnific account, which you cannot use):
   - `sonicvoice` (owner's choice 09/11 — do NOT use the ElevenLabs API/connector): SonicVoice connector (host sonicvoice.pro, header `X-API-Key`;
     every request needs a custom `User-Agent`, e.g. "P02-TTS/1.0", or Cloudflare returns 403). Voice = ElevenLabs library voice
     VOICE_ID=7EzWGsX10sAS4c9m9cPf ("Jack John") through provider `eleven`.
     Once: `GET https://sonicvoice.pro/api/v1/models?provider=eleven` → write VOICE_MODEL in channel.env: eleven_v4 if listed, else eleven_v3
     (emotion tags work only on these); neither → VOICE_TAGS=off (send loi_doc.txt with CAPS only — turbo/multilingual read tags aloud) and tell the owner.
     Optional check: `GET /api/v1/voices?provider=eleven&q=Jack` shows the voice.
     Per take: `GET /api/v1/me/balance` (enough chars?) → `POST /api/v1/tts/jobs` {"kind":"single","provider":"eleven","voice_id":VOICE_ID,
     "model":VOICE_MODEL,"text":<loi_tts.txt>,"speed":SONIC_SPEED,"language":"English","split_mode":"keep","srt_out":true,"title":"<EP>",
     "stability":0.3,"similarity_boost":0.75,"style":0.4,"use_speaker_boost":true} (production/sonicvoice_tts.py is the reference) → poll
     `GET /api/v1/tts/jobs/{id}` every ~5 s until succeeded/failed → `GET /api/v1/tts/jobs/{id}/audio` (WAV) → `$T/am_thanh/giong_goc.wav`.
     422 on a field (e.g. stability on v3/v4) → drop that field and resend once. `giong_chuan.py` fixes the pace with atempo.
     If ASR shows a tag spoken as a word (e.g. "excited") → remove/replace that tag and regenerate once.
   - `owner_mp3`: after CRITIC-S passes, send the owner the exact script once and wait for the mp3 (the only allowed stop).

## One episode (EP = E06, E07 … next free number; T=$P/tap/<EP>_<object>)
1. **Topic** — object given → check it against `topic-bank.md` §1–2 and the kit's "đã dùng" tables; nothing given → `invention-topic-studio` quick_pick.
   Need: object, motive, 5–6 real parts with sources, ending keyword, cast, one setting, opening gag, accent colour. Score ≥ 75.
2. **Script** — `invention-script-writer` → `$T/loi_doc.txt` (clean), `$T/loi_tts.txt` (tags), `$T/KICH_BAN.md`, `$T/facts.json`. Praise lines from
   channel.env PRAISE_WORDS; never the reference channel's lines (kit SKILL §1d). Choose the kit's trampoline (§1b) or fridge (§1c) template by object. **CRITIC-S** — max 2 rounds.
   Owner sent a script → small edits only (facts, word count, ending loop).
3. **Voice** — one TTS request per take from `$T/loi_tts.txt` (tags + CAPS, script skill §3b) by VOICE_ROUTE (setup step 3) → `$T/am_thanh/giong_goc.mp3|wav`.
   Then `python3 -I $P/cong_cu/giong_chuan.py $T` (silenceremove → atempo to 218 wpm → Parakeet → words.json → word match). atempo outside 0.8–1.25
   or match < 95 % → regenerate once (speed ±0.1); never loop.
4. **Timing** — `KHEN="<praise words, comma separated>" python3 -I $P/cong_cu/moc_shot.py $T --kieu $CUT_STYLE` → `moc_shot.json`, `engine/moc/<EP>_<object>.js`, `cues_auto.json` and the
   formula check on the REAL audio. LỆCH lines are advice (the kit's own E07/E08 end ~4 s before the end): fix the script only for a P0/P1 in CRITIC.md,
   otherwise write the reason in KICH_BAN.md.
5. **Captions** — `python3 -I $P/cong_cu/tao_phu_de.py $T/am_thanh/words.json $T/phu_de_1080.ass` (insults like DUMBASS in caps).
6. **Cast, textures, scene** — kit B8–B10. Textures/backdrops: `media.generate_image` with the kit's prompts (square output; tileable textures are square
   anyway; backdrops: use MirroredRepeat or reuse `engine/assets/tex/mag/*`) → `tex_magnific.py`. Scene = copy `engine/e5_xe_dap.html`, then
   `import {MOC} from './moc/<EP>_<object>.js'` and build SH from MOC: each FIX = macro of the object with the named part popping in on its word,
   TWIST = visible failure + reaction, MECH = science graphic, PAYOFF = callback of the opening framing (kit SKILL §1b, §5–7a2).
7. **Stills → CRITIC-V** — kit B11 (360p, 2 frames/s, `anh_ghep.py`), open every sheet, CRITIC.md V1–V10. Fix, re-render only those frames.
8. **Render** — 360p full + `qa_giat.py` (kit B12), then 1080p in the background:
   `bash $P/cong_cu/render_nen.sh "<scene>.html?mb=3" ~/p02_work/<EP>/r1080 <frames=dur×30> 2`. Measured on Muse: ≈ 12–14 s/frame at 1080p
   with MSAA and no blur; a motion-blur frame costs blurN × that (E08 opening, 5 subframes: 59.9 s/frame). Before the 1080p render:
   `cd $P/engine && node liet_ke_khung.js <scene>.html <frames>` lists the blur frames → estimate = blur×(subframes×13) + rest×13 s ÷ 2 processes.
   In new scenes make blurN return `+q.get('mb')||5` instead of 5 and render with `?mb=3` (≈ 40 % less time on blur frames, still smooth);
   keep FAST ranges short (only real fast action). Target ≤ 4 h per episode; over that, shorten FAST ranges before rendering. Watchdog: `cron.add` every 15 min (agent turn) → `render_nen.sh --dem …`; "không chạy" and not complete →
   run the same `render_nen.sh` line again (skips finished frames). Delete the cron when complete. Keep `$T/checkpoint.json` (stage, fix_rounds).
9. **SFX + mix** — action sounds (fall, snap, pop, wind, the object's own sound) → `$T/cues_tay.json` [[t,"name",dB]…]; names from
   `tai_nguyen/sfx/README.md`; a missing sound → ElevenLabs Sound Effects through the connector (save as `tai_nguyen/sfx/<name>.mp3`) or drop the cue.
   `python3 -I $P/cong_cu/tron_am_auto.py $T` (2-pass loudnorm −14 LUFS, music −19 dB).
10. **Encode** — kit B13 ffmpeg line (frames + `$T/am_thanh/mix.wav` + `ass=$T/phu_de_1080.ass:fontsdir=$P/engine/fonts`, crf 15, +faststart).
11. **Final QA** — `python3 -I $P/cong_cu/qa_tap.py <mp4> $T` (all ĐẠT) + open every `$T/qa/sheet_*.jpg` against CRITIC.md V1–V11. You cannot
    hear: the audio checks are the numbers + words.json match. Max 2 fix rounds after the full render, then deliver with the remaining notes.
12. **Deliver** — MP4 as a storage link (48 h) + a short Vietnamese report: object, hook/ending, numbers from qa_tap, what is not perfect, credits used.
    Then update: kit SKILL "đã dùng" tables (7a/7b), `topic-bank.md` §1 in ~/wynn-media, `$T/KICH_BAN.md`; commit on a branch `ep/<EP>` (no mp4/wav/mp3).
    If you cannot push, say so in the report.

## Rules that do not change
Each episode new: object, cast, setting, opening gag. One accent colour = the object. No MakeHuman logo clothes (casualsuit06). Nuclear cooling-tower
gag per channel.env NUCLEAR_GAG. Never copy another channel's object + failure chain + lines. Never put keys in files, logs or chat.
