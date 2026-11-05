# Niches

`niches/<name>/channel.env` holds what makes a niche/channel distinct: name, language, ElevenLabs voice, tempo, music style, render size.
`bash tools/ep/new_episode.sh <EP> <script.txt> <name>` scaffolds an episode with those defaults (episode.env gets `CHANNEL=<name>`).

Start a new niche (then fill its STYLE.md and CRITIC.md):
```bash
cp -r niches/_template niches/<name>
# edit niches/<name>/channel.env: CHANNEL_NAME, NAME_SUFFIX, LANGUAGE, VOICE_ID (its own voice), MUSIC_PROMPT, WIDTH/HEIGHT, WORKERS
```
Keep each channel's voice, look (backdrop style, character palette), topics and titles its own. Uploading the same or near-identical
videos to several channels is what platforms treat as reused/inauthentic content.

Capacity per worker (measured on a 4-core / 7.7 GB VM, 720p, 1 worker): ~9 h render per ~46 s episode → ~2 episodes per day.
More episodes per day = more worker machines (one render at a time per 8 GB VM).
