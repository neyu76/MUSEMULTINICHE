---
name: voice
description: Prepare the narration — from a recorded/generated voice take to a cleaned −16 LUFS voice track with per-word timings (pocketsphinx forced alignment). Use when a new take arrives, the tempo/wpm is off, or captions don't line up.
---

Run everything from the RickClips repo (`repo_dir` in `~/.rickclips/config.json`, through its `run_prefix`); no config → skill `setup`.
# Voice

Input: `episodes/<EP>/script.txt` (exact words read, numbers spelled out) and `episodes/<EP>/voice/<take>.mp3`.
Settings in `episodes/<EP>/episode.env`: `TAKE`, `TEMPO`, `VOICE_OFFSET`.

```bash
bash tools/ep/voice_prep.sh <EP>                 # uses TAKE/TEMPO from episode.env
bash tools/ep/voice_prep.sh <EP> take1 1.10      # try another take / tempo
```
Prints `voice X s, N words, W wpm`. Target **208–244 wpm** (samples median ~223). Change `TEMPO` (atempo keeps pitch) until inside,
then write it into `episode.env`. T015: take2, 1.14 → 45.09 s, 214 wpm.

Alignment must print `N N` (aligned words = script words). If not: the take deviates from `script.txt` (ad-lib, missing word) or a
number is written as digits — fix the text to match what is spoken.

Generating a new take (needs the ElevenLabs connector/API, not a GPU): model eleven_v4, cloned voice "Rick" `DKsARo574aeDoZ21UXE4`,
make 2 takes, keep the one with fewer odd pauses (`silencedetect` in the old voice_measure step). The clone reads ~180–185 wpm → tempo 1.14–1.17.
Never store API keys in the repo; `~/.secrets/<service>_key` (chmod 600).
