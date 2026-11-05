---
name: setup
description: Prepare a machine for toon-studio — WSL/Linux toolchain (ffmpeg, tesseract, Python venv, BiRefNet rembg venv), local.json paths, and a check of the connectors the episode skill needs (ElevenLabs, EDITORNGHIEPDU SFX, browser pane for Google Flow and Notion). Use once per machine or when a studio command reports a missing venv.
---

# Setup

1. Windows: WSL (Ubuntu) is required; run everything as root via `.sh` files (`wsl.exe -u root bash file.sh`).
2. `bash "/mnt/c/Claude creator/1/toon-studio/setup.sh" --birefnet` — ffmpeg, tesseract, main venv (reuses
   `~/.vidclone/venv` when it exists), rembg venv for BiRefNet. Writes `local.json` if missing.
3. `local.json` (gitignored) keys: `python`, `birefnet_python`, `work_dir` (episode root; default from channel.json).
4. `studio --help`, then `setup.sh --check`.
5. Connectors: ElevenLabs MCP (voice + music: `creative_generate_speech`, `creative_generate_in_flow`), EDITORNGHIEPDU SFX
   MCP (`sfx_status` → Trial active), the app's built-in browser pane signed in to Google (Flow) and Notion.
6. First runs download models: faster-whisper `small` (~500 MB), BiRefNet (~1 GB to ~/.u2net).
