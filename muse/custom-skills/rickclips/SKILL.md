---
name: rickclips
description: Make a finished RickClips-style vertical 3D explainer short (three.js toon characters, ~45 s, captions, voice, music) from a script, outline or brief, fully on autopilot — self-review, fix, render, QA, deliver. Use whenever the owner sends a script/outline/brief for a video or names an episode/channel.
---
# RickClips autopilot (install: copy this folder to ~/workspace/custom-skills/rickclips/)

The pipeline lives in ~/wynn-media (git repo). Read, in this order, before the first episode of a session:
~/wynn-media/CLAUDE.md → docs/AUTOPILOT.md (the loop and the CRITIC checklists — follow exactly) → docs/MUSE_RUNBOOK.md (commands) →
docs/KIT_SKILL_v7.md §3 (script style) → plugins/rickclips/skills/shots/SKILL.md (scene code rules).

The owner names a niche per worker/episode (default `rickclips`): also read `niches/<niche>/STYLE.md` and `CRITIC.md` and apply them
in the script and in both CRITIC passes; `bash tools/ep/new_episode.sh <EP> <script.txt> <niche>` scaffolds with its channel.env.

Owner's standing settings: small script edits only (list them); max 2 fix rounds after the render; message the owner ONLY with the
finished video + report or a blocker only they can solve; ElevenLabs credits uncapped but every regeneration needs a reason.

## Per episode
1. `cd ~/wynn-media && git pull 2>/dev/null; bash tools/ep/preflight.sh`
2. Write `~/rc_work/<EP>/checkpoint.json` after every stage: {"stage", "updated", "inputs_sha256", "outputs", "critic_rounds", "fix_rounds", "blocked"}.
   On any new session/restart: read it and resume at the recorded stage — never start over.
3. Run docs/AUTOPILOT.md stages 0–5. Frames are rendered locally (render.sh) — do NOT use media.generate_video / Runway for
   episode footage (paid, approval cards, and the 6-videos-per-message cap don't apply to local renders).
4. Render: start it once yourself (`bash ~/wynn-media/tools/ep/watchdog.sh <EP> 1` — it launches render.sh detached; a background
   process survives your turn but not a VM replacement). Then `cron.add` every 15 min (quota is ample: 2B extra tokens) with a
   minimal body, because each cron run is a full agent turn that costs quota:
   "Run `bash ~/wynn-media/tools/ep/watchdog.sh <EP> 1`. If it prints `finished`, continue docs/AUTOPILOT.md from
    ~/rc_work/<EP>/checkpoint.json (finalize → audit → fix rounds → deliver) and remove this cron. Otherwise do nothing else."
   One cron run is capped at 24 h, so long work is a chain of runs resuming from checkpoint.json.

## Voice + music (ElevenLabs through a connector — the vault key never reaches the shell)
Once per account: `credentials.request_api_access` for provider `elevenlabs`, host `api.elevenlabs.io`, scheme api_key, key in the
HTTP header `xi-api-key` (the owner enters the key in the vault). Then per episode:
```
python3 -I tools/ep/el_media.py plan tts <EP> 2          # → episodes/<EP>/el_requests_tts.json
python3 -I tools/ep/el_media.py plan music <EP> <DUR+10> # → episodes/<EP>/el_requests_music.json
```
Send every request in those files with your connector helper (method, url, headers, json body); write each response body (audio/mpeg)
to its "out" path. Then `python3 -I tools/ep/el_media.py verify <EP>` (fails if a body is an error JSON instead of audio).
If the connector call shows an approval card, that is a blocker only the owner can clear: message them once ("approve ElevenLabs
calls for this scheduled task") and wait — do not switch voices or tools on your own.

## CRITIC via sub-agent
Sub-agents inherit your context, so independence comes from the brief, not the platform. Spawn a fresh one per review:
```
subagent.spawn message:
"You are the CRITIC. Read ONLY ~/wynn-media/docs/AUTOPILOT.md (sections Roles, CRITIC-S or CRITIC-V) and the inputs listed.
 Ignore anything you remember about how the shots were built — judge only what a viewer sees.
 Inputs: episodes/<EP>/script.txt, episodes/<EP>/facts.md, ~/rc_work/<EP>/audit/<tag>_*.jpg (open every sheet), QA output <path>.
 Write ~/rc_work/<EP>/audit/critic_<stage>_<round>.md: one line per finding `time · BLOCKER|MAJOR|MINOR · what · suggested fix`,
 last line `VERDICT: PASS` (no BLOCKER/MAJOR) or `VERDICT: FIX`. Do not edit any other file. Do not generate media."
```
The MAKER (you) fixes, re-renders stills/frames, rebuilds the audit sheets, spawns a fresh CRITIC. Sub-agents can web-search
(facts check); if a sub-agent cannot open images or run shell, the parent produces the sheets and does CRITIC-V itself as a separate
pass (re-read AUTOPILOT.md CRITIC-V first, judge tile by tile, write the same critic_*.md file).

## What cannot be checked by eye here (cover it with measurements)
- Audio cannot be listened to. voice_prep.sh's forced alignment must print `N N` (aligned words = script words): a misread or
  skipped word fails it → regenerate that take. Loudness/peaks/silences come from qa.sh. Vocals in music can't be heard here:
  always generate music with the instrumental flag (el_media.py forces it).
- Motion is reviewed through 2 fps audit sheets + the QA camera metrics (static %, push-in %, move changes, hard cuts, frozen frames).

## Delivery
Attach `<NAME>_preview.mp4` (≈ 17 MB) and give the MP4 + Kdenlive zip as built-in storage links (valid 48 h — say so in the report;
Drive uploads ask for approval every time, so don't use Drive unless the owner granted it). Send the report from docs/AUTOPILOT.md.
That message (which reaches the owner's phone as a push) is the only one they get per episode.
