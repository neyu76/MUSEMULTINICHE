---
name: toon-studio
description: Make a finished animal-toon-eyes episode (vertical ~70 s TikTok/Shorts: real animal photos cut out with cartoon eyes, keyframed cut-out motion, PIL diagrams, voice "Mark", music, SFX) from a script, outline or brief, fully on autopilot — self-review, fix, build, QA, deliver. Use whenever the owner sends a script/outline/brief for the animal-toon-eyes niche (ids ATE01-…).
---
# toon-studio autopilot (install: copy this folder to ~/workspace/custom-skills/toon-studio/)

Code: `~/wynn-media/studios/toon-studio` (call it TS; the repo is MUSEMULTINICHE cloned at ~/wynn-media). CLI: `TS/bin/studio <cmd> <EP>`.
Episodes live in `~/toon_work/<ID>-<slug>/` (persists). Read before the first episode of a session, in order:
TS/CLAUDE.md → TS/plugins/toon-studio/skills/episode/SKILL.md (the workflow — follow it, with the Muse changes below) →
TS/channel/style/recipe.md (how the style is built — follow exactly) → TS/channel/style/style.md → TS/channel/prompts.md →
TS/examples/ATE01-004-octopus/ (reference gen_edl.py, make_overlays.py, brief.md) → ~/wynn-media/niches/animal-toon-eyes/CRITIC.md →
~/wynn-media/docs/AUTOPILOT.md (MAKER/CRITIC loop, owner settings, delivery report).

## Owner settings (autopilot)
Never wait for approval: the CRITIC passes the gates (script, pictures, render). Small script edits only (facts, length,
weak hook/closer), listed in the report. Max 2 fix rounds after the first full build (TS's own rule: stop after 3 QA rounds
without improvement). Message the owner ONLY with the finished video + report, or a blocker only they can solve.
ElevenLabs credits uncapped; every regeneration needs a stated reason.

## Muse changes to the episode skill
- **Setup / every session**: `cd ~/wynn-media && git pull; bash studios/toon-studio/setup.sh --birefnet` the first time, then
  `bash studios/toon-studio/setup.sh --check` each session — re-run setup if ffmpeg/tesseract are MISSING (apt packages vanish on
  VM replacement; the venvs in ~/.toonstudio persist). No WSL, no PowerShell, no Windows paths.
- **Input**: the owner pastes the script / outline / brief. No Notion (skip step 0's Notion part and step 9's tick).
  `TS/bin/studio new <ID> <slug> "<Title>" --from <file>` — write the pasted text to a file first (`script.txt` if it is a script).
- **Script (step 1)**: outline/brief → write it (skill `script`, TS/plugins/toon-studio/skills/script/SKILL.md); CRITIC-S
  (AUTOPILOT.md) instead of showing the owner. Facts: web search, `brief.md` claims with sources.
- **Voice (step 2)**: `TS/bin/studio el plan voice EP` → send `el_requests_voice.json` through the ElevenLabs connector (host
  api.elevenlabs.io, key in header xi-api-key) → body to `voice/take1.mp3` → `TS/bin/studio el verify EP` → `TS/bin/studio voice EP`
  (`ok` must be true, words = script tokens; misread → regenerate the take once with the reason noted).
- **Pictures (step 4)** — channel.json `images.tool` = `gemini_api` (Nano Banana, the model of the ATE01-004 reference):
  once per account set up a connector with credentials.request_api_access: provider google-gemini, host
  generativelanguage.googleapis.com, api_key in header `x-goog-api-key` (owner's Google AI Studio key, billing on).
  Write `art_plan.json` (every picture of shots.md: name, kind, prompt from channel/prompts.md, ref) → `TS/bin/studio img plan EP` →
  send each request in img_requests.json through the connector, write each RESPONSE JSON to its "response" path →
  `TS/bin/studio img save EP` → repeat plan/send/save until 0 requests (base pictures first, chained poses/plates/heads after).
  Follow the "Non-negotiable" section of channel/prompts.md: physical props are PHOTOS on green (never PIL/clip-art), plates are
  photographic scenes (analogy = real miniature set in the habitat), and EVERY episode has a real person with a cartoon head
  (≥ 3 expressions, ≥ 3 appearances). Minimum picture list ≈ the reference build: 8+ animal poses, 6–8 plates (incl. the analogy
  set and the person's place), the person photo + head swap + 3 expressions, every physical prop of the shot list.
  Look at every picture (`studio sheet`): limb counts, same individual, no text/watermark, no painted cartoon eyes, props look real.
  Fallbacks only if the Gemini connector is impossible: `flow` (owner signs in to Google in the browser; skill flow-art) or
  `muse` (media.generate_image — props must still be photoreal; reject clip-art results).
- **SFX (step 6)**: write `audio/sfx_plan.json` (15–25 entries, one distinct sound per kind of action, 0.3–3 s, short concrete
  prompts like "soft cartoon boing", "paper stamp thump", "bubbly underwater pop") → `TS/bin/studio el plan sfx EP` → connector →
  `studio el verify EP`. Music: `studio el plan music EP` after the voice (length ≥ END + 5 s, instrumental forced).
- **Build (step 7)**: `TS/bin/studio build EP --qa` takes ~3–6 min on CPU; run it in the background and poll. No watchdog cron needed
  unless a build exceeds ~30 min; keep `~/toon_work/<EP>/checkpoint.json` (stage, fix_rounds, critic_rounds) after every stage.
- **QA (step 8)** + CRITIC-V: `studio qa` (known false fails: hook_end_s, handheld jitter within ~1 %), then `TS/bin/studio audit EP`
  and the CRITIC opens EVERY `out/audit/audit_*.jpg` (whole video, 0.5 s, words + safe area + caption band), plus
  `out/qa/sheets/*.jpg` and `studio frames EP t0 t1 0.25 out/f_<t0>.jpg` around every gag, using AUTOPILOT.md CRITIC-V +
  niches/animal-toon-eyes/CRITIC.md. Spawn the CRITIC as a sub-agent (brief in muse/custom-skills/rickclips/SKILL.md, inputs =
  script.txt, brief.md, the sheets); if it cannot open images, do the pass yourself as a separate step.
- **Deliver (step 9)**: `TS/bin/studio deliver EP` → attach `<ID>_<slug>_preview.mp4`, FINAL.mp4 as a storage link (48 h), and the
  AUTOPILOT.md report (+ QA x/y with every fail explained, pictures/credits used). That is the only message.
