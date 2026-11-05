# Worker runbook (brain + worker split, CPU-only cloud VM)

**Default mode: `docs/AUTOPILOT.md`** — every GATE below is passed by the CRITIC there, not by the owner. Don't wait for approvals.

Measured on the first worker (Muse, Nov 2026): 4 cores, 7.7 GB RAM shared, no swap, no GPU, Ubuntu 24.04, Python 3.12, Node 24.
`~` survives VM replacements; everything outside `~` (apt packages, /etc, crontab) can vanish. The VM was replaced 5× in one day.

## Worker profile (what works on 4 cores / 8 GB)
| Setting | Value | Why |
|---|---|---|
| Resolution | **720×1280** (`niches/<ch>/channel.env` WIDTH/HEIGHT) | 1080p SS=2 loses the WebGL context (black frames) unless `MB=4`; 720p passes QA 21/21 (T015: detail 0.914) |
| Workers | **1** | 2 workers gave only 1.29× and RAM floor near 0 |
| SS / MB / RESTART | SS=2, MB=12 (default), RESTART=120 (default) | 720p needs no per-frame restart |
| Speed | ~23 s/frame average (13–37 by scene) → ~9 h per 46 s episode | T015: 1392 frames, 8.9 h of rendering |
| TMPDIR | `~/tmp` | `/tmp` is a 512 MB RAM tmpfs |
| Restarts | `tools/ep/watchdog.sh <EP> 1` from the agent's scheduler every **15 min**. Each cron run is an agent turn (costs quota) and is capped at 24 h | 3-hourly checks wasted 6.6 h of 15.4 h on T015 |

## Every session
```bash
cd ~/wynn-media && git pull && bash tools/ep/preflight.sh      # reinstalls apt packages that vanished (melt…)
```

## Episode, stage by stage (worker does all commands; the CRITIC in docs/AUTOPILOT.md passes the gates)
0. **Brief → script** (when the user sends an outline/brief instead of a finished script): write the narration by
   `docs/KIT_SKILL_v7.md` §3 — hook in 0–4 s with a concrete image (one of the 6 hook types), one of the 4 story frames,
   "You see," before the mechanism, closer ≤ 6 words looping to the opening, 45 s ≈ 160–170 words, every sentence a visible action,
   true stories keep real names/years/facts. **GATE 0**: send the script (+ title, word count, est. length, the hook type and frame) and
   wait for approval — the voice is generated from it and every shot is timed to it.
1. **Scaffold**: `bash tools/ep/new_episode.sh <EP> <script.txt> <channel>` — then spell out every number in `episodes/<EP>/script.txt`.
2. **Media**: voice = 2 takes with the channel's `VOICE_ID`/`VOICE_MODEL`: `python3 -I tools/ep/el_media.py plan tts <EP>` → send via the ElevenLabs connector → `el_media.py verify <EP>` (or `el_media.py tts <EP>` where a key file is allowed); `bash tools/ep/voice_prep.sh <EP> <take> <TEMPO>`
   for each, keep the one with aligned words = script words and fewer pauses, 212–224 wpm; set TAKE, TEMPO, DUR (voice + ~1.3 s) in
   `episode.env`. Music: `python3 -I tools/ep/el_media.py plan music <EP> <DUR+10>` (same connector route) (MUSIC_PROMPT, instrumental forced; listen once for vocals), set MUSIC in episode.env. Backdrops: vertical, painterly, warm,
   no characters, no text. Props: primitives in the set file, or a ≤ 20k-triangle GLB.
   **Final voice before any render** — every shot time derives from `out/words.json`; a new voice = a full re-render.
3. **Shots**: set file + `main.js` (skill `shots`, pattern T015). All times derived from words.json. `node --check` every file.
4. **Audio**: `build_sfx.py` cues from word times → `bash tools/ep/audio_mix.sh <EP>` (master −14 ±0.5 LUFS, one-word captions 55–80 %).
5. **GATE 1 — stills** (no render yet): `bash tools/ep/stills.sh <EP> review "<one time per ~1.5 s>" 2`; send as sheets of ≤ 8 stills.
   Brain checks: each sentence has its visible action on the word; nothing within 5 % of the frame edge; no overlaps (marks on boards,
   props over faces, fx over text); nothing floats unheld; the closer loops to the opening. Fix → stills → repeat.
6. **Render**: start `tools/ep/watchdog.sh <EP> 1` on a 15-min schedule (it launches and resumes `render.sh`); remove it after
   `RENDER FINISHED`. Never call `render.js` directly for real frames (render.sh drops black/broken frames and re-renders them).
7. **Finalize**: `finalize.sh`, `sheets.sh`, `preview.sh` (`TMPDIR=~/tmp`).
8. **GATE 2 — review**: QA 21/21 + `flat none` + every `review/sheet_*.jpg` by eye (checklist in CLAUDE.md). Fix → stills →
   `bash tools/ep/render.sh <EP> 1 "a-b"` (only the affected frames) → finalize again.
9. **Keep it**: commit `episodes/<EP>` sources on a branch; `bash tools/ep/pack_assets.sh <EP>` → upload the zip as release `assets-<EP>`
   (or Drive). Deliver `<NAME>.mp4`, `<NAME>_preview.mp4`, `<NAME>_kdenlive.zip`.

## Errors met on the worker (keep)
| Symptom | Cause | Fix |
|---|---|---|
| Frames 2+ black (13 KB) at 1080p SS=2 | SwiftShader out of RAM → WebGL context lost; the loss event arrives one frame late | 720p, or 1080p with `MB=4 RESTART=1` (~75 s/frame) |
| `process is not defined` loop, 0 frames | env read inside `page.evaluate` (runs in Chromium) | read env in Node, pass as an evaluate argument (render.js `MB`) |
| `melt check: FAILED (no output)` | apt package gone after VM replacement | `tools/ep/preflight.sh` |
| swapon: Operation not permitted | sandboxed VM | none — keep to 1 worker |
| Render dead for hours | VM replaced; checks too far apart | 15-min watchdog from an external scheduler |
| Labels cut at frame edge, ✗/✓ over the deed, props over faces (N02 first pass) | placement not checked against the camera | GATE 1 checklist; project label bboxes and warn outside 5–95 % |
| Music generator returned with "Instrumental: False" | flag not set, prompt only | set the instrumental flag; listen once |
