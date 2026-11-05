# RickClips — 3D vertical explainer shorts (CPU pipeline)

Vertical 1080×1920 / 30 fps / 34–78 s story shorts in the "Ricks Clips" style: round-headed toon characters in a three.js 2.5D set,
camera always moving, one-word captions, voice + music + SFX mixed to −14 LUFS, delivered as MP4 + an editable Kdenlive project.
Everything except 3D-prop generation runs on a **CPU-only Linux box** (three.js rendered by headless Chromium + SwiftShader).

Reference episode: **T015 "The Cup That Punishes One Extra Pour"** (Tantalus cup, 46.4 s, QA 21/21). Rebuilding it is the acceptance test.

## Repo map
| Path | What |
|---|---|
| `setup.sh` | clean Ubuntu → apt, Node 22, `.venv` (pinned), `npm ci`, Chromium, fonts; `--assets <zip>` unpacks + verifies SHA256 |
| `engine_v4/` | kit engine: `core.js` (renderer, post FX, `Char`), `chars2.js` (procedural characters), `render.js` (Playwright frame renderer), `assemble.sh`, `gen_kdenlive.py`, `align_ps.py` |
| `episodes/<EP>/` | one episode: `script.txt`, `episode.env` (NAME DUR TAKE TEMPO VOICE_OFFSET MUSIC), `engine/*.js` overlay (replaces/extends engine_v4 files), `build_sfx.py`, `prepare_mg.sh`; binaries `art/ audio/ voice/` come from the asset zip |
| `tools/ep/` | the pipeline (every script takes the episode name): `env.sh sync_engine.sh voice_prep.sh audio_mix.sh captions.py stills.sh render.sh finalize.sh qa.sh preview.sh sheets.sh run_all.sh` + kit: `preflight.sh new_episode.sh watchdog.sh pack_assets.sh` + checks `drop_bad_frames.py flat_frames.py detail_by_time.py caption_probe.py compare_ref.py` |
| `tools/analysis/` | kit measurement tools: `qa_compare.py` (21 checks), `sharpness.py`, `capgeo.py`, `cuts3.py`, `flowprof.py`, `camanal.py`, `analyze_sample.sh` … |
| `production/` | `mix_final.py` (final mix), `audio_kit.py` (synth SFX), `sonicvoice_tts.py`, `align.py` |
| `tools3d/` | **GPU only**: Hunyuan3D-2 install + image→GLB (`run_gen.sh`, `gen_prop.py`) |
| `references/` | Style Bible (18 sample videos measured), per-video breakdowns, sample scripts, metrics |
| `docs/KIT_SKILL_v7.md` | full style/production rules (story structure, camera, transitions, captions, audio) — read before writing a new episode |
| `docs/AUTOPILOT.md` | script in → finished video out: MAKER/CRITIC loop, script + visual checklists (facts, physics, era, framing, continuity), fix-round limits; `tools/ep/audit_sheets.py` makes the critic sheets |
| `docs/MUSE_RUNBOOK.md` | brain + worker split on a CPU-only cloud VM (4 cores / 8 GB): 720p, 1 worker, 15-min watchdog, two review gates, worker-specific errors |
| `studios/toon-studio/` | second engine for the `animal-toon-eyes` niche (photo cut-outs + toon eyes, vidclone EDL render); its own CLAUDE.md, CLI `bin/studio`, setup.sh |
| `studios/absurdplay/` | third engine for the `sport-usa-whatif` niche (AbsurdPlay, three.js 3D sports what-if, Kdenlive); generic process `00_HUONG_DAN_CHO_CLAUDE.md`, project `du_an/P01_sport_usa_whatif/` |
| `niches/<name>/channel.env` | per-channel identity (voice, tempo, music prompt, resolution, workers); `tools/ep/new_episode.sh <EP> <script> <channel>` scaffolds from it |
| `plugins/rickclips/` | Claude Code plugin = the workflow knowledge: `/rickclips:episode <Notion link + script>` (whole episode), `/rickclips:setup`, `/rickclips:voice-id`, stage skills `voice audio-captions shots render finalize-qa prop-3d`. Marketplace: `.claude-plugin/marketplace.json` |

Work output never goes in the repo: `RC_WORK` (default `~/rc_work`) → `~/rc_work/<EP>/{voice,audio,out,frames,deliver,qa_out,review,logs}` and the built engine `~/rc_work/engine_<EP>/`.

## Quick start (fresh machine)
```bash
gh release download assets-T015 --repo neyu76/MUSEMULTINICHE --pattern 'rickclips_assets_T015.zip*'   # 219 MB, private repo → gh auth login first
sha256sum -c rickclips_assets_T015.zip.sha256
bash setup.sh --assets rickclips_assets_T015.zip      # ~1–5 min; ends with "SETUP OK"
# other episodes ship their binaries the same way, one release each: assets-T001 → rickclips_assets_T001.zip (unpack after T015's)
bash tools/ep/run_all.sh T015                          # ~2 h (render ≈ 95 %); or step by step below
```
Long jobs: `setsid nohup bash tools/ep/run_all.sh T015 > ~/rc_work/T015.run.log 2>&1 &` (agent/terminal timeouts kill foreground jobs).

## Pipeline, step by step
1. **Engine** — `bash tools/ep/sync_engine.sh T015`: `engine_v4` + `episodes/T015/engine/*.js` + textures (`prepare_mg.sh`) → `~/rc_work/engine_T015` (node_modules symlinked).
2. **Voice** — `bash tools/ep/voice_prep.sh T015`: `voice/take2.mp3` → mono, highpass 100 Hz, de-ess, `atempo 1.14`, trim, exactly −16 LUFS → `voice_final.wav`; pocketsphinx forced alignment → `align.json` (one entry per script word; numbers must be written as words in `script.txt`). Target 208–244 wpm (T015: 214).
3. **Audio + captions** — `bash tools/ep/audio_mix.sh T015`: SFX track from `build_sfx.py` (timed cue list, ~1 cue / 1.5 s; ElevenLabs water loops + kit synth cues) → `mix_final.py` (voice −16, bed −23 then side-chain ducked, SFX −27, master −14 LUFS, limiter, mono 48 kHz) → `captions.py` (ASS + SRT).
4. **Stills check** — `bash tools/ep/stills.sh T015 check "0.6,14.9,27.5,45.0" [SS]` → `~/rc_work/T015/preview/check.png`. Always check every changed shot here before a full render.
5. **Render** — `bash tools/ep/render.sh T015 [workers] ["a-b c-d"]` → `frames/f_00000.jpg…` (resumable; the optional ranges delete+re-render frame indices after a fix).
6. **Finalize** — `bash tools/ep/finalize.sh T015`: `assemble.sh` → `deliver/<NAME>.mp4` + `deliver/media/*` + `<NAME>.kdenlive` (melt-rendered as a check) + `~/rc_work/T015/<NAME>_kdenlive.zip`, then `qa.sh`.
7. **Review by eye** — `bash tools/ep/sheets.sh T015` → 4 fps contact sheets in `review/`. Open every sheet (see checklist below). QA numbers do not catch floating props or missing water.
8. **Preview** — `bash tools/ep/preview.sh T015` (~17 MB phone copy).
9. **Compare with reference** — `python3 -I tools/ep/compare_ref.py ~/rc_work/T015 assets/reference/T015`.

## Render / encode parameters
- **Frames**: 1080×1920 (`WIDTH/HEIGHT` in the episode `core.js`; kit v4 is 720×1280), 30 fps, `SS=2` internal supersampling for delivery (`SS=1` previews), JPEG q0.97. Motion blur: sub-frames when a camera move exceeds 4 px/frame (≤ 12 sub-frames, shutter 0.5 frame).
- **Renderer**: Playwright 1.64.1 → Chromium build 1248, flags `--use-gl=angle --use-angle=swiftshader`; Chromium restarts every 120 frames and after a lost WebGL context.
- **Speed** (i7-12700K, 20 threads, 32 GB): ~42 s per frame per worker at SS=2; 10 workers → 1392 frames ≈ 100 min. One worker ≈ 1–1.5 GB RAM.
- **video_clean.mp4**: `unsharp=5:5:0.5:5:5:0,unsharp=3:3:0.5:3:3:0`, convert full-range BT.601 (JPEG) → **tv-range BT.709**, x264 `-preset slow -tune animation -crf 14`, yuv420p, tagged `bt709/tv`.
- **Final mp4**: captions burned with libass (`subtitles=…:fontsdir=media/fonts`), x264 slow/animation **crf 16**, AAC 192k 48 kHz, `+faststart`, same colour tags.
- **QA re-encode** (inside `qa_compare.py`, how the samples were measured): scale 720×1280, `libx264 -preset veryfast -crf 18`. This costs ~0.015–0.02 detail, so check the QA number, not the master's.
- **Captions**: Work Sans ExtraBold 81 @ PlayRes 720×1280, white, black outline 5, shadow 2.5, bottom-centre, MarginV 344, pop-in `\fscx88→100` over 70 ms; short function words join the next word (~65 % one-word events).
- **Audio**: voice −16 LUFS, bed −23 (pre-duck), SFX −27, master −14 LUFS, true peak ≤ −1 dBTP, mono.

## QA gates (`tools/ep/qa.sh` → `qa_compare.py`, all 21 must pass, plus the extra checks)
| Check | Pass | T015 |
|---|---|---|
| Resolution / FPS / duration | 1080×1920 (or 720×1280), 30, = DUR | ✓ |
| Loudness | −14 LUFS (≥ −15.5) | −14.1 |
| True peak | ≤ −1 dBFS | −4.2 |
| Side − Mid | ≤ −20 dB (near-mono) | −100.8 |
| Static camera | ≤ 5 % | 0 |
| Push-in share | 25–65 % | 45.7 |
| Camera-move change, median | ≤ 1.5 s | 1.0 |
| Hard cuts | ≤ 2 | 1 |
| Caption baseline y | 918 ± 13 @1280 | 917 |
| **Caption letter height** | **≈ 35 px (31–39)** @1280 (samples: ascender 35–36, x-height 27) | 37 |
| Caption centre x | 360 ± 10 | 360 |
| Silences > 0.35 s | ≤ 1 | 0 |
| Music floor between phrases | −13.5 … −18.5 dB | −14.4 |
| **Detail (fine-detail ratio), median** | **≥ 0.86** (samples 0.88–0.93) | 0.877 |
| Detail, worst 10 % | ≥ 0.78 | 0.819 |
| Saturation median | ≤ 135 (samples 65–133) | 103.9 |
| Frozen frames | ≤ 0.5 s | 0 |
| Black frames (sampled) | ≤ 1 % | 0 |
| One-word captions | 55–80 % | 65.8 |
| **Extra: every-frame black scan** (`flat_frames.py`) | none | none |
| **Extra: eye review** of 4 fps sheets | checklist below | — |

Eye-review checklist (each item was a real T015 bug): props held by nobody/floating; signs or labels clipped by their board or the frame edge;
water/streams present whenever the narration says so; labels overlapping objects; effects (`?`, sparkles) cut off in close-ups;
1-frame flashes; text readable at phone size.

## Errors met and fixes (keep — each cost a render)
| Symptom | Cause | Fix (where) |
|---|---|---|
| Caption QA 25 px, white looks grey | kit `assemble.sh` kept JPEG full-range/BT.601 (`yuvj420p`, `pc`); decoders read white as 235; letters split at the 235 threshold | `engine_v4/assemble.sh`: convert to tv-range BT.709 + tag. Probe: `tools/ep/caption_probe.py` (fill ≈ 252 = good) |
| Caption still small | font 75 was ~8 % under the samples | size 81 (`tools/ep/captions.py`) |
| Detail 0.846 < 0.86 | soft AA edges + QA re-encode | extra `unsharp=3:3:0.5` (no halos at 100 %) → 0.877. Grain does NOT help (encoder removes it) |
| 1-frame black flashes (14.0 s, 18.7 s) | a killed/context-lost worker left a valid but black JPEG; sampled QA missed it | `drop_bad_frames.py` in `render.sh` + every-frame `flat_frames.py` in `qa.sh` |
| Ducked music stops at 27.6 s | `sidechaincompress` ends with the shorter input | `production/mix_final.py`: `,apad,atrim=0:DUR` |
| Kdenlive opens at 720×1280 | profile hard-coded | `gen_kdenlive.py` reads the video size; master gain from measured stem sum (`GAIN`) |
| Jug floating mid-air after "he stops pouring" | hand target left at head height | `episodes/T015/engine/main.js`: `DOWN` hand pose sets the jug on the counter |
| "FREE WATEI" sign | text wider than the 900 px sign texture | font 128 → 104 (`taverna.js`) |
| X-ray pour = bare line from the frame top | no source object | ghost copy of the jug GLB (`jugB`) pours |
| Water/tray/streams vanished in 10–19 s | a `//` comment inserted mid-line commented out `level/stem/drain/tray` | never put a comment in the middle of a line or argument list; re-check stills after every edit |
| Same mistake broke `mix_final.py` (SyntaxError) | comment inside a call | `python3 -c "import ast…"` / `bash -n` / `node --check` every edited file |
| Sweat drops / sparkles differ between renders (PSNR ~32 dB in those frames) | `Char.set` caches the face canvas by state **without t**, so time-animated fx freeze at the first frame each worker drew → output depends on how frames were split between workers | T015 keeps the original behaviour (to match the delivery). For new episodes: add `fx ? Math.round(t*30) : ''` to the cache key in `core.js` `Char.set` |
| `melt` hangs when run detached | waits on stdin | `</dev/null` + `timeout -k` |
| ffprobe `csv=p=0` prints `1080,` | trailing separator | use `-of default=nw=1:nk=1` |
| Old 720p frames reused after switching to 1080p | `render.js` skips existing files | clear `frames/` when the resolution changes |
| Background render killed after ~10 min (agent host) | job tied to the calling shell | `setsid nohup … &` (WSL from Windows: `Start-Process wsl.exe … -WindowStyle Hidden`) |
| pocketsphinx won't build | missing compiler/headers | `build-essential python3-dev` (setup.sh) |
| Hunyuan3D texture build: "exception specification is incompatible" | CUDA 12.8 headers vs glibc ≥ 2.41 | `tools3d/fix_cuda_glibc.sh` |
| Hunyuan3D DINOv2 `state_dict` error | transformers too new | pins in `install_hunyuan3d.sh` (transformers 4.48.3, diffusers 0.32.2, huggingface_hub 0.27.1, accelerate 1.3.0) |
| Hunyuan3D mesh is solid (no inside) | generator outputs closed solids | cutaways use `cutaway.js` (`strata`, `sectionCut` stencil caps, `xray`) instead of real hollow meshes |

## What needs a GPU, a network service, or a person
- **GPU only (NVIDIA, CUDA 12.8; tested RTX 3060 12 GB, peak 6.7 GB with CPU offload, ~10 min per prop, ~25 GB model cache)**: Hunyuan3D-2 image→3D (`tools3d/*`). Everything else runs on CPU. On a CPU-only box reuse
  `episodes/T015/art/jug.glb` from the asset zip, or model props as primitives / use a CC0 library model.
- **Not GPU, but external accounts** (done through the ElevenLabs connector in the original session; outputs for T015 are in the asset zip):
  voice (eleven_v4, cloned voice "Rick" `DKsARo574aeDoZ21UXE4`), music (Music v2.5), water SFX (Sound Effects v2), painted backdrops and
  the jug reference image (Nano Banana 2.1). A new episode needs these generated again; API keys go only in `~/.secrets/` (chmod 600), never in the repo.
- **Kdenlive GUI** is optional (the project is verified headless with `melt`).

## Determinism (what "identical" means here)
Rebuilding T015 from the asset zip in a clean copy of the repo (tested on Ubuntu 26.04 WSL with apt packages already present — a bare OS install was not tested): `align.json` and `captions.ass` byte-identical, voice 45.09 s −16.0 LUFS (same),
mix 46.40 s −14.2 vs −14.1 LUFS, frames PSNR ≈ 58 dB except frames with animated sweat/sparkle fx (≈ 32 dB, cache bug above).
Pinned: Node 22, npm lock (three 0.170.0, postprocessing 6.39.5, n8ao 2.0.1, gsap 3.15.0, playwright 1.64.1 → Chromium 1248), Python `requirements.lock`, ffmpeg 8.0.1 (Ubuntu 26.04 apt).
Other ffmpeg/x264 versions give visually identical but not byte-identical MP4s.

## Conventions
- Episode code lives in `episodes/<EP>/engine/`; never edit `engine_v4/` for one episode. A new episode starts as a copy of T015 (skill `episode`, steps 1–2).
- Per-machine settings (voice id, repo/work dirs, how to run long jobs) live in `~/.rickclips/config.json`, written by `/rickclips:setup`.
- Keep comments at the end of a statement or on their own line. Syntax-check every edited file before rendering.
- After any engine edit: stills of every changed shot → look → only then `render.sh` with the affected ranges.
- Deliverables: `<NAME>.mp4`, `<NAME>_preview.mp4`, `<NAME>_kdenlive.zip`, QA output. Sample videos/frames of other channels are never packaged.
