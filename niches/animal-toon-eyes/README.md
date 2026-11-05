# Niche: animal-toon-eyes (TikTok / Shorts, English, ~70 s)

Real animal photos, cut out (BiRefNet) and animated as keyframed blocks with big cartoon eyes; people = real body + flat cartoon
head; PIL diagrams; voice "Mark" (ElevenLabs `UgBBYS2sOqTuMpoF3BR0`, eleven_v4, 242 wpm); quirky pizzicato music; 15–25 SFX.

This niche uses its own studio, not the RickClips three.js engine: `studios/toon-studio/` (CLI `bin/studio`, render ~3–6 min on CPU).
- Settings: `studios/toon-studio/channel/channel.json` (ids ATE01-NNN, voice, images = Muse media.generate_image at the ATE01-004 photo level, music, SFX = ElevenLabs, build, QA)
- Style: `studios/toon-studio/channel/style/style.md` (what it looks like) + `recipe.md` (how to build it) + `channel/prompts.md`
- Workflow: `studios/toon-studio/plugins/toon-studio/skills/episode/SKILL.md`; Muse autopilot: `muse/custom-skills/toon-studio/SKILL.md`
- Critic additions: `CRITIC.md` here

Give a worker this niche: *"Your niche is animal-toon-eyes: install muse/custom-skills/toon-studio, then make episodes on autopilot."*
