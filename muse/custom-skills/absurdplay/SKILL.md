---
name: absurdplay
description: Make a finished AbsurdPlay "What If" sports short (TikTok 9:16, 60–72 s, NFL/NBA stars vs absurd opponents, three.js 3D characters, TV graphics, yellow captions, "Sport USA" voice) from a sport name, a news item, an idea or a script — fully on autopilot: latest news, script, voice, 3D scene, render, QA, Kdenlive project, deliver. Use whenever the owner names a sport/team/player or sends an idea/script for AbsurdPlay / Sport USA (project P01).
---
# AbsurdPlay / Sport USA "What If" — Muse autopilot (install: copy this folder to ~/workspace/custom-skills/absurdplay/)

Kit: `~/wynn-media/studios/absurdplay/` (MUSEMULTINICHE cloned at ~/wynn-media). Its own docs say `/root/work/...`; on Muse that is
`~/work/...` (home persists, /root may not). Set up the paths once per session:
```
mkdir -p ~/work/assets/audio && ln -sfn ~/wynn-media/studios/absurdplay ~/work/BO_HUONG_DAN_SAN_XUAT_VIDEO && ln -sfn ~/work /root/work
P=~/work/BO_HUONG_DAN_SAN_XUAT_VIDEO/du_an/P01_sport_usa_whatif
```
Read before the first episode of a session, in order: `$P/skill/sport-usa-whatif/SKILL.md` (THE workflow, v0.6 — follow it, with the
Muse changes below) → `00_HUONG_DAN_CHO_CLAUDE.md` → `$P/HO_SO_DU_AN.md`, `$P/QUY_TRINH_DU_AN.md`, `$P/NHAT_KY_LOI.md` →
`$P/PHAN_TICH_MAU/HIEU_CHINH_V06.md` + `TONG_HOP.md` → the latest `$P/tap/E0x/HUONG_DAN_TIEP_TUC.md` →
`~/wynn-media/niches/sport-usa-whatif/CRITIC.md` → `~/wynn-media/docs/AUTOPILOT.md` (MAKER/CRITIC loop, owner settings).
The owner writes Vietnamese: answer in Vietnamese.

## Owner settings (autopilot — replaces the kit's two approval points)
Never wait for approval: the CRITIC passes "kịch bản" and "bản cắt thử" (AUTOPILOT.md CRITIC-S / CRITIC-V + niche CRITIC.md).
Given a sport only: pick the best fresh story yourself (kit §0 rules: sources ≥ 2 / official, troll-the-losing-team priority, no repeats
of the "đã dùng" table). Small script edits only when the owner sent a script. Max 2 fix rounds after the full render. Message the
owner ONLY with the finished video + report (+ the 3 viral titles and hashtags the kit asks for), or a blocker only they can solve.

## Muse changes to the kit workflow
- **Setup (first time)**: `cp -r $P/engine ~/work/engine && cd ~/work/engine && npm install && npx playwright install chromium` (or set
  `CHROME_PATH` to an existing headless Chromium — render.js reads it), `bash $P/cong_cu/cai_font.sh`, `python3 patches/va_realism_effects_three170.py`
  (again after every npm install), `pip install --user faster-whisper numpy` (or a venv in ~), apt: ffmpeg melt. Audio libraries: the
  4 `git clone` lines in `$P/tai_nguyen/am_thanh/README.md` into ~/work/assets/audio. Test: `cd ~/work/engine && node render.js "ep04.html#nomb" out_test 30 0 1 360 640 30,300,900`
  → 3 JPEGs. Every session: re-check ffmpeg/melt/fonts (apt and ~/.fonts outside ~ may vanish) and the /root/work link.
- **News (§0)**: no `fetch_sports_data` widget here — use web search + the official sites/AP/ESPN pages directly; same ≥ 2 sources rule,
  write the "Tin đã chọn" table with URLs and dates. Verify current team, jersey number, home/away kit, hair/beard, height (heightM) on the web.
- **Voice "Sport USA"**: the clone lives in the owner's Magnific account (not ElevenLabs). Route = `niches/sport-usa-whatif/channel.env`
  VOICE_ROUTE:
  - `owner_mp3` (default until the owner decides): after the CRITIC passes the script, send the owner ONE message with the exact script
    text + tag `[energetic, fast-paced narrator]` and ask for the mp3 (this is the only allowed stop); continue when it arrives.
  - `elevenlabs`: if the owner re-creates the clone in ElevenLabs and gives a VOICE_ID — send the TTS request through the ElevenLabs
    connector (host api.elevenlabs.io, header xi-api-key, model eleven_v4), then the kit's rut_nghi.py / tempo steps.
  - `magnific_browser`: only if the owner signs in to Magnific in your browser and says so.
- **Music**: `MUSIC_ROUTE` in channel.env — `cc0_library` (kit default: alvana-audio CC0, a different track each episode, 100–110 BPM,
  never `music/corporate`), `elevenlabs` (ElevenLabs Music through the connector with MUSIC_PROMPT, instrumental forced, length ≥ video + 5 s),
  or `owner_mp3` (the owner makes it, e.g. on Suno, and sends the mp3 — ask in the same single message as the voice). Record the track in
  the "đã dùng" table either way.
- **Stadium SFX (`magnific_sfx/`)** are not in the kit: generate equivalents with ElevenLabs Sound Effects through the connector
  (crowd_cheer, crowd_boo, ref_whistle, buzzer, sneaker_squeak, swish, football_hit, sad_trombone, crowd_ambience loop …), save under
  ~/work/assets/audio/magnific_sfx/ with the same names, or skip a cue rather than use a wrong sound.
- **Render (§5)**: measured on a 4-CPU cloud box: ~1.7–2.2 s per 720×1280 frame with motion blur → a 70 s episode ≈ 1–2.5 h with 1–2
  processes. Run in the background; a 15-min cron watchdog (agent turn) checks `ps` and re-renders missing frames after a VM restart
  (render.js renders a list of frames — render the gaps). Keep `~/work/tap/<EP>/checkpoint.json` (stage, fix_rounds, critic_rounds).
- **CRITIC-V** on the cut and the final: the kit's `kiem_theo_mau.py --sheet` (every line ĐẠT) + frames every 0.5 s of the whole video
  (ffmpeg fps=2 tiles) judged with AUTOPILOT.md CRITIC-V + niche CRITIC.md. Spawn the CRITIC as a sub-agent (brief in
  muse/custom-skills/rickclips/SKILL.md); if it cannot open images, do the pass yourself as a separate step.
- **Deliver**: final MP4 + Kdenlive project zip as storage links (48 h), preview attached, QA.md, the 3 titles + hashtags, report.
- **Keep the kit current**: after each episode, update `$P/skill/sport-usa-whatif/SKILL.md` "đã dùng" table, NHAT_KY_LOI.md, the
  episode's HUONG_DAN_TIEP_TUC.md in ~/wynn-media, commit on a branch `ep/<EP>` (no mp4/mov/wav, no node_modules). Pushing needs the
  owner's git access — if you cannot push, say so in the report.
