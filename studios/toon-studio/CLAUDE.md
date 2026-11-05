# toon-studio — notes for Claude

One channel (animal-toon-eyes), many episodes. Input = a script, an outline or a brief; output = a finished vertical
episode. The workflow is the `episode` skill (`plugins/toon-studio/skills/episode/SKILL.md`); this file is the code map.
Never commit or push unless the user says so.

## Layout
| Path | What |
|---|---|
| `bin/studio` | CLI (WSL): new, status, voice, cut, grid/crop/sheet, overlays, build, qa, frames, deliver — `studio --help` |
| `studio/` | pipeline tools: `cfg` (paths, channel.json, local.json, episode names), `voice` (take → words.json), `assets` (plates, props, sheets, crops; poses via `birefnet_cut.py` in the rembg venv), `edl` (what an episode's gen_edl.py imports: kit + prop/swap/bubble/fly/loop2/finish), `diagrams` (PIL cards, bars, arrows), `build` (EDL, render, QA with known false fails, frames, deliver), `episode` (new folder, status) |
| `vidclone/` | the render / analysis engine, copied from the vidclone repo (2026-11-05): `layers.py` (blocks, eyes, props, text, bubbles), `assemble.py` (EDL → mp4), `qa.py`, `captions.py`, `mixer.py`, `cutout.py`, `speech.py` |
| `channel/channel.json` | channel settings: id prefix, work_dir, Notion fields, voice (Mark, eleven_v4, tag, 0.25 s gaps, 242 wpm), images (Flow), music, SFX, build settings (split_long, cam_gain, grade, kicks), QA known false fails, delivery names |
| `channel/style/` | style bible `style.md`, `recipe.md` (how it is built — follow it), `style.json` (captions), `gates.json` (QA), `kit.py` (block / eyes / split_long / write_edl), one sample's stills for the QA compare sheet |
| `channel/prompts.md` | Google Flow prompt templates |
| `templates/episode/` | files `studio new` copies into a new episode (brief, shots, gen_edl, make_overlays) |
| `examples/ATE01-004-octopus/` | reference build in the current form (studio.edl); `ATE01-003-wombat` older form |
| `local.json` | machine paths (gitignored): python, birefnet_python, work_dir |

Episodes live OUTSIDE the repo in `work_dir` (default `~/toon_work/<ID>-<slug>`; set local.json `work_dir` on another machine).

## Episode folder
`episode.json` · `input.md` · `script.txt` · `brief.md` · `shots.md` · `prompts.json` · `voice/take1.mp3` → `voice/voice.wav` ·
`words.json` + `words.txt` · `art/` (Flow pictures, upscaled .png) · `cut/` (BiRefNet RGBA, full frame) · `plate/` (+ `_b`) ·
`props/green/` → `props/` (cut props + PIL diagrams) · `audio/` (sx_*.mp3 + music.mp3) · `gen_edl.py` · `make_overlays.py` ·
`edl.json` · `out/<ID>_<slug>.mp4` · `out/qa/` · `<ID>_<slug>_FINAL.mp4` + `_preview.mp4`.

## Gotchas
- Windows: run everything in WSL as root from `.sh` files written with the Write tool (PowerShell `Set-Content` adds CRLF/BOM).
- words.json keys are `w`/`s`/`e`. `studio voice` maps timings through the pause cuts and the tempo exactly.
- `finish()` checks every file the EDL uses and stops on missing ones (e.g. a prop not cut yet).
- `kit.write_edl` writes kicks at amp 0.014; `finish()` lowers them to `build.kick_amp` (0.008) — more / stronger kicks
  push QA handheld_jitter over the gate.
- QA known false fails (channel.json): `hook_end_s` (first Whisper segment), `jitter` = handheld jitter (block slides read
  as pan; ATE01-004 12.18 vs gate 12.13). Verified 2026-11-05: the ATE01-004 example rebuilt here gives the same 40/42.
- Engine changes: edit `vidclone/` here; it no longer follows the vidclone repo.
