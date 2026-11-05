# MUSEMULTINICHE — 3D vertical explainer shorts, made by agents (one repo, many niches)

The pipeline (three.js toon characters → CPU render → voice/music/captions → QA) plus the operating kit for agent workers (Muse).

```
engine_v4/ tools/ production/ setup.sh     core pipeline (shared by every niche) — see CLAUDE.md
docs/AUTOPILOT.md                          script in → finished video out (MAKER/CRITIC loop, checklists, fix limits)
docs/MUSE_RUNBOOK.md                       worker profile (4 CPU / 8 GB): 720p, 1 worker, watchdog, commands, known errors
docs/MUSE_START.md                         how to set up a new worker account + the first message to paste
docs/KIT_SKILL_v7.md                       style rules (script, camera, captions, audio)
niches/<name>/                             one niche = channel.env (voice, music, size) + STYLE.md + CRITIC.md (+ examples/)
studios/toon-studio/                       second engine: real-photo cut-outs with toon eyes (niche animal-toon-eyes)
muse/custom-skills/rickclips/SKILL.md      agent entry point for the RickClips niche (copy to ~/workspace/custom-skills/)
muse/custom-skills/toon-studio/SKILL.md    agent entry point for animal-toon-eyes
```

Give a worker a niche: *"Your niche is `niches/<name>`. Follow docs/MUSE_START.md once, then docs/AUTOPILOT.md for every episode."*

New niche: `cp -r niches/_template niches/<name>` and fill channel.env (own voice!), STYLE.md, CRITIC.md.

Binaries (backdrops, voice, music, the T015 reference) are not in git: release `assets-T015` → `rickclips_assets_T015.zip`,
restored with `bash setup.sh --assets rickclips_assets_T015.zip`. Per-episode binaries: `bash tools/ep/pack_assets.sh <EP>`.
API keys never go in this repo (agents keep them in their own vault/connector).

## Niches
| Niche | Engine | Skill |
|---|---|---|
| `rickclips` (history / curiosity, 3D round-head toons, ~45 s) | root (`engine_v4/`, `tools/ep/`) | `muse/custom-skills/rickclips` |
| `animal-toon-eyes` (animal facts, photo cut-outs + toon eyes, ~70 s, TikTok) | `studios/toon-studio/` | `muse/custom-skills/toon-studio` |
