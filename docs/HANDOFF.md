# Handoff — for a new Claude session that keeps building this kit

Read this first, then `README.md`, `CLAUDE.md`, `docs/AUTOPILOT.md`, `docs/MUSE_RUNBOOK.md`, `docs/MUSE_START.md`.
Owner writes Vietnamese — answer in Vietnamese. Your role: build and maintain the kit (repo + skills) that **Muse** agents use to make
videos. Muse is the worker; you write code/docs, push to this repo, and give the owner short messages to paste into Muse.

## Muse (Meta's agent) — verified facts (Nov 2026)
- Cloud VM: 4 vCPU, 7.7 GB RAM shared, no GPU, no swap (swapon not permitted), Ubuntu 24.04, Python 3.12, Node 24, root shell.
  `~` (/home/hatch) persists; apt packages and anything outside `~` can vanish when the VM is replaced (happened 5× in one day).
- Background processes survive the end of a turn, not a VM replacement. `cron.add` runs an **agent turn** (not a shell), 15 min works,
  each run costs quota, one run ≤ 24 h. Workflows/cron are stored outside the VM. No user crontab/systemd.
- Secrets: the vault value is **never** readable from the shell or env vars. External APIs only through a custom connector
  (`credentials.request_api_access`: provider, host, api_key header); the agent sends requests with its connector helper.
  So scripts in this kit write request files (e.g. `tools/ep/el_media.py plan`, `studios/toon-studio` `studio el|img plan`) and verify results.
- Git push from Muse: no supported token path. Repo must be readable (owner makes it public while Muse clones/pulls, private after).
- Sub-agents: `subagent.spawn` exists, inherits context, can web-search; shell/image access unverified → CRITIC fallback = separate pass.
- Images: `media.generate_image` (resume_from_snapshot_id for chaining), no aspect parameter. No audio listening, no ASR tool of its own
  (kit uses pocketsphinx / faster-whisper). Drive uploads need approval each time → deliver via built-in storage links (48 h).
  Push notification to the owner's phone works. Max 6 generated videos per message (irrelevant: we render locally).
- Measured: three.js/SwiftShader 720p ≈ 23 s/frame (RickClips, 1 worker); AbsurdPlay engine ≈ 1.7–2.2 s/frame; Remotion (course) ≈ 0.76 s/frame trivial scene.

## Owner decisions
- Autopilot: owner sends a script/outline/brief (or just a sport), Muse self-approves with the CRITIC, max 2 fix rounds, messages only
  with the finished video or a blocker. Small script edits only. ElevenLabs credits uncapped (reason per regeneration).
- Images for animal-toon-eyes: Muse `media.generate_image` (Flow / Gemini API only when the owner says) — photo props, photographic plates,
  a real person (photo body + cartoon head) every episode.
- AbsurdPlay voice: SonicVoice (connector: host sonicvoice.pro, header X-API-Key, custom User-Agent required); music: CC0 library until the
  owner sets MUSIC_ROUTE (ElevenLabs or Suno).
- The purchased course "3D Explainer Shorts" (Invisible Tech) is a **personal license**: never put its files in this repo; the owner gives the ZIP
  to Muse directly (`~/explainer_kit`, studio in `~/ep`). Sample/reference-channel frames and transcripts are never committed.

## Niches in this repo
| Niche | Engine | Muse skill | Status |
|---|---|---|---|
| rickclips | root (`engine_v4/`, `tools/ep/`) | `muse/custom-skills/rickclips` | T015 rebuilt on Muse (QA 21/21, 720p); N02 made by Muse |
| animal-toon-eyes | `studios/toon-studio/` | `muse/custom-skills/toon-studio` | pilot ATE01-901 made; redo with realism rules pending |
| sport-usa-whatif (AbsurdPlay) | `studios/absurdplay/` | `muse/custom-skills/absurdplay` | NFL/NBA proven (E01–E04); MLB + WWE packs added 06/11, load-checked only, Muse must run test pages first |
| 3D explainer (course) | owner's `~/explainer_kit` on Muse | none in repo (license) | studio set up on one Muse account; needs repo clone + SonicVoice connector |

## Open items
- Muse account with the course studio: clone this repo, create SonicVoice connector, pick the voice.
- MLB/WWE packs: visual check by Muse (`test_mlb.html`, `test_wwe.html`), fix libs.
- Asset release `assets-T015` must be uploaded to this repo's Releases for the rickclips niche on new accounts.

## Working rules that worked
- Ask Muse read-only capability questions before designing; paste-ready messages in English, explanations to the owner in Vietnamese.
- Test what you can here (syntax, import, a crash-check render) before pushing; say plainly what is unverified.
- Never put keys in chat/files; never copy other channels' scripts; check licenses of anything the owner uploads.
