---
name: voice-id
description: Show or change the ElevenLabs narration voice RickClips uses on this machine (voice_id, model, tempo in ~/.rickclips/config.json). Use when the user wants another voice, after cloning a new voice, or when a voice generation fails with an unknown voice.
---
# Narration voice

1. Read `~/.rickclips/config.json` (missing → skill `setup`).
2. List the account's voices (ElevenLabs connector "list voices" tool, or `GET https://api.elevenlabs.io/v1/voices` with the key from
   `~/.secrets/elevenlabs_key`). Show name, id, category (cloned / premade). Ask the user which one.
3. Test it: generate ~90 characters ("One extra pour, and this cup starts emptying itself. At first, it behaves perfectly.") with
   model `eleven_v4`, download, measure words per minute (`ffprobe` duration). Narration must land at **208–244 wpm** after `atempo`:
   tempo = 223 / measured_wpm, clamp 1.0–1.25. A clone of the original channel voice read ~185 wpm → tempo 1.14.
4. Save `voice_id`, `voice_name`, `voice_model`, `tempo` to the config. Episodes copy `tempo` into their `episode.env` (TEMPO).

Style target for a substitute voice: one young, energetic male narrator (F0 ~180–215 Hz), continuous delivery, pauses ≤ 0.3 s.
