---
name: setup
description: Prepare this machine and account for RickClips — get the code repo and the T015 asset zip, install the toolchain in whatever way fits this machine (Ubuntu, WSL, other Linux, macOS), connect ElevenLabs and Notion, choose the narration voice, and save it all to ~/.rickclips/config.json. Run once per machine, or when another rickclips skill finds no config.
---
# RickClips setup (adapt to this machine)

The plugin only carries the workflow. The code (engine, pipeline scripts, QA tools) is the git repo
`https://github.com/neyu76/wynn-media` (private: the user's GitHub account needs access), binaries are in its release `assets-T015`.
Read the repo's `CLAUDE.md` after cloning — it is the full reference (parameters, QA gates, known bugs).

## 1. Look at the machine first
Report what you find before installing: OS + version, shell, CPU threads, RAM, free disk (need ~5 GB, +30 GB for 3D props), NVIDIA GPU (`nvidia-smi`),
and whether `git`, `gh`, `node`, `python3`, `ffmpeg`, `melt` exist. Windows → everything runs inside WSL Ubuntu (install it if missing;
the user may need to reboot). macOS → use Homebrew equivalents (ffmpeg, mlt, node@22, python@3.x); the reference build is Ubuntu, so
results can differ slightly — say so.

## 2. Code + assets
```bash
gh repo clone neyu76/wynn-media <dir>           # or git clone; ask the user where (default ~/rickclips; in WSL keep it on the Linux disk)
cd <dir> && gh release download assets-T015 --pattern 'rickclips_assets_T015.zip*' && sha256sum -c rickclips_assets_T015.zip.sha256
```
No access → ask the user to be invited to the repo. Don't work around it.

## 3. Toolchain
On Ubuntu/WSL: `bash setup.sh --assets rickclips_assets_T015.zip` (apt + Node 22 + pinned `.venv` + `npm ci` + Chromium + fonts; ends with `SETUP OK`).
Elsewhere: read `setup.sh` and do the equivalent by hand; keep the pinned versions (`requirements.lock`, `engine_v4/package-lock.json`).
Then prove it: `bash tools/ep/stills.sh T015 smoke "0.6,27.5" 1` and look at the sheet (taverna with jug pouring; x-ray cup).
GPU present and the user wants new 3D props → skill `prop-3d` (optional; reuse/primitive props otherwise).

## 4. Services (accounts, not GPUs)
- **ElevenLabs** (voice, music, SFX, images via Nano Banana): prefer the claude.ai ElevenLabs connector (check which tools exist:
  speech, music, sound effects, image generation, list voices, get generations). No connector → ElevenLabs API key in
  `~/.secrets/elevenlabs_key` (chmod 600) and call the REST API with curl. Never write a key into the repo, the config or chat.
- **Notion** (scripts): the Notion connector if present; otherwise read the page in a browser tool; otherwise ask the user to paste the script.

## 5. Voice
List the user's ElevenLabs voices and ask which one narrates (show name + id). The original channel voice is a private clone in its
owner's account — another account must use or clone its own voice (cloning a real person needs their consent). Save the choice with skill `voice-id`.

## 6. Save ~/.rickclips/config.json
In the home folder of the machine where Claude Code runs (Windows: `C:\Users\<you>\.rickclips\config.json`, even if the pipeline runs in WSL).
```json
{ "repo_dir": "/root/rickclips", "work_dir": "/root/rc_work", "run_prefix": "",
  "voice_id": "<elevenlabs voice id>", "voice_name": "<name>", "voice_model": "eleven_v4", "tempo": 1.14,
  "elevenlabs": "connector", "notion": "connector", "render_workers": 10, "gpu": false,
  "long_jobs": "setsid nohup <cmd> > <log> 2>&1 &" }
```
`run_prefix` = how to reach the Linux shell from the agent's shell (e.g. `wsl.exe -u root bash` on Windows; empty on Linux).
`long_jobs` = how to start a job that outlives the agent's tool timeout on this machine (Windows/WSL: `Start-Process wsl.exe … -WindowStyle Hidden`).
Write machine quirks you discover into `<repo_dir>/CLAUDE.local.md` (not committed) so later sessions read them.
