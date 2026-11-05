# Starting a new worker account (same niche)

Everything the worker needs is in this repo. The only per-account setup is the ElevenLabs API key (and, for a new channel, its own voice).

## What the owner does once
1. Give the new agent the repo: GitHub access to `neyu76/wynn-media` (clone + `gh release download`), or upload the source zip
   (`wynn-media_src_*.zip`) and the asset zip `rickclips_assets_T015.zip` (from release `assets-T015`).
2. ElevenLabs API key → the agent's Secure Vault through its connector flow (`credentials.request_api_access`: provider elevenlabs,
   host api.elevenlabs.io, header `xi-api-key`). The key never goes in chat, files or the repo. Approve ElevenLabs calls for the
   agent's scheduled task if it asks once.
3. A niche: `niches/rickclips` exists; a new one is `cp -r niches/_template niches/<name>` + its own channel.env / STYLE.md / CRITIC.md.

## Agent skill (Muse: ~/workspace/custom-skills persists across VM replacements)
`mkdir -p ~/workspace/custom-skills && cp -r ~/wynn-media/muse/custom-skills/rickclips ~/workspace/custom-skills/`

## First message to paste into the new agent
```text
You are the worker for a vertical-shorts pipeline (3D toon explainers, CPU-only). Your standing instructions are in the repo:
CLAUDE.md, docs/MUSE_RUNBOOK.md (follow it exactly), docs/KIT_SKILL_v7.md (style), plugins/rickclips/skills/*/SKILL.md (stages).

Setup (once):
1. Get the code: git clone https://github.com/neyu76/MUSEMULTINICHE ~/wynn-media
   (or unzip the source zip I upload to ~/wynn-media, then: cd ~/wynn-media && git init -q && git add -A && git commit -qm "kit import")
2. Assets: gh release download assets-T015 --repo neyu76/MUSEMULTINICHE --pattern 'rickclips_assets_T015.zip*' (or use the zip I upload);
   sha256sum -c rickclips_assets_T015.zip.sha256 (if you have the .sha256)
3. cd ~/wynn-media && bash setup.sh --assets rickclips_assets_T015.zip   → must end with SETUP OK
4. ElevenLabs: set up a connector with credentials.request_api_access (provider elevenlabs, host api.elevenlabs.io, api_key in
   header xi-api-key); I'll enter the key in the vault. Test with ONE short request: GET https://api.elevenlabs.io/v1/voices/J8XNjWRT3iUYhRklysg1
   through the connector helper → report the voice name, and whether an approval card appeared.
5. Install the skill: mkdir -p ~/workspace/custom-skills && cp -r ~/wynn-media/muse/custom-skills/rickclips ~/workspace/custom-skills/
6. Benchmark this machine: cd ~/rc_work && bash ~/wynn-media/tools/ep/sync_engine.sh T015 && cd ~/rc_work/engine_T015 &&
   (sed 's/WIDTH = 1080, HEIGHT = 1920/WIDTH = 720, HEIGHT = 1280/' core.js > /tmp/c && cp /tmp/c core.js) &&
   time env SS=2 node render.js ~/tmp/bench 10 10.2 30 ; ls -l ~/tmp/bench ; free -h ; nproc
   Report s/frame, frame sizes (13 KB = black), RAM — then run sync_engine.sh T015 again to restore the copy.

For every episode I send (a script, an outline or a brief + the channel name), run docs/AUTOPILOT.md end to end with
docs/MUSE_RUNBOOK.md: you approve your own gates with the CRITIC (use a sub-agent if you can), fix, render with tools/ep/watchdog.sh
on a 15-min schedule, run the final audit, and message me ONLY with the finished video + report, or a blocker only I can solve.
Never edit engine_v4/ for one episode, never put a comment mid-line, syntax-check every edited file, keep API keys out of chat/logs/repo.
```

## Episode request template (what the owner sends each time)
```text
New episode <EP, e.g. N03> — niche <rickclips | name>.
Type: script | outline | brief
<text>
Autopilot (docs/AUTOPILOT.md) — message me only with the finished video or a blocker.
```
