---
name: audio-captions
description: Build the SFX track, the final −14 LUFS mix and the one-word ASS/SRT captions for an episode, and debug caption size/position or mix levels. Use after voice_prep, or whenever sfx cues, music or caption style change.
---

Run everything from the RickClips repo (`repo_dir` in `~/.rickclips/config.json`, through its `run_prefix`); no config → skill `setup`.
# Audio + captions

```bash
bash tools/ep/audio_mix.sh <EP>
```
1. `episodes/<EP>/build_sfx.py` — list `EV = [(t, name, gain[, dur])]`. Water cues (`pour`, `drain`, `glug`) are ElevenLabs loops from
   `audio/sfx_el/`, looped with crossfades to `dur`; other names are synth cues from `production/audio_kit.py` (`boing whoosh whoosh_fast
   sparkle thump crowd_laugh ting pop crickets` …). Place cues on word times from `~/rc_work/<EP>/out/words.json` (±0.15 s), about one per 1.5 s,
   leave space around the punch line.
2. `production/mix_final.py` — voice −16, bed −23 then side-chain ducked under the voice, SFX −27, master −14 LUFS, limiter, mono 48 kHz.
   Check the printed `music_ducked … s (must equal DUR)`.
3. `tools/ep/captions.py` — groups short function words with the next word; style Work Sans ExtraBold **81** @ PlayRes 720×1280,
   outline 5, MarginV 344, pop-in 88→100 % in 70 ms. Expect `1-word share` 55–80 %.

QA targets (after finalize): caption baseline 918 ± 13, letter height 31–39 (samples 35), centre 360 ± 10, music floor −13.5…−18.5 dB,
loudness −14, true peak ≤ −1, mono.

Caption height fails? `python3 -I tools/ep/caption_probe.py ~/rc_work/<EP>/deliver/<NAME>.mp4 <t>`:
fill ≈ 252 and ascender ≈ 35 = fine. Fill ≈ 235 → the video is full-range (old assemble) → use `engine_v4/assemble.sh` from this repo.
Ascender < 33 → font too small. Music too loud between phrases → `mix_final.py --bed -24`.
