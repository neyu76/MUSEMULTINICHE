---
name: episode
description: Make one complete animal-toon-eyes episode (vertical ~70 s TikTok/Shorts) from just a script, an outline or a brief — pasted text, a file, or a Notion page — through script, voice, Google Flow art, cut-outs, PIL diagrams, SFX, music, EDL build, QA, delivery and the Notion tick. Use when the user asks for a new episode / video for the channel (e.g. "/toon-studio:episode ATE01-005 ..." or "làm tập ... từ kịch bản này").
---

# Episode: input → finished video

The user gives ONE input: a **script** (narration text), an **outline** (beats / bullet points) or a **brief** (topic + claims),
inline, as a file, or as a Notion link. Everything else is this skill. Repo: `C:\Claude creator\1\toon-studio`
(WSL `/mnt/c/Claude creator/1/toon-studio`). Read first: `CLAUDE.md`, `channel/channel.json`, `channel/style/recipe.md`
(how the style is built — follow it exactly), and the reference build `examples/ATE01-004-octopus/` (gen_edl.py, make_overlays.py, brief.md).

Run tools in WSL as root from a `.sh` file you write with the Write tool (PowerShell breaks quoting; Set-Content adds CRLF/BOM):
`wsl.exe -u root bash /mnt/c/.../scratchpad/step.sh`. CLI: `"/mnt/c/Claude creator/1/toon-studio/bin/studio" <cmd> <EP>`.
Keep the task list current. Never commit or push the repo unless the user says so. Never buy anything (SFX packs, credits).

## 0. Episode folder
- Id: the user's id, or the next free `<prefix>-NNN` in `work_dir` (channel.json). Slug = 1–2 words (the animal).
- `studio new ATE01-005 sloth "Why Sloths Are So Slow" [--from input.txt]` → folder with `episode.json`, templates
  (`brief.md`, `shots.md`, `gen_edl.py`, `make_overlays.py`) and the empty asset dirs.
- Notion link: open it in the app's browser pane (no Notion connector), expand toggles with JS, `get_page_text`; save the
  page's Narration (EN), beat board, claims and conditions into `input.md`.

## 1. Script (`script.txt`) and brief (`brief.md`)
- **Script given** → use it VERBATIM (it is the narration). Check against `style.md` §2 (hook flips a belief in ≤ 3 s, beats,
  closer 11–31 words, no CTA) and length (~280–290 words ≈ 70 s at 242 wpm); report issues, don't rewrite silently.
- **Outline / brief given** → run the `script` skill to write it, then show the script to the user before spending
  credits, unless they said to go straight through.
- Numbers spelled as read ("twenty-four"). One paragraph per beat B1–B7.
- `brief.md`: beat table (sentences → what we SEE, gag, expression), **claims** (what may be stated, with source wording),
  **conditions** (what must not be said/shown: no invented numbers, analogies labelled, species-correct anatomy), visual language.

## 2. Voice → `voice/voice.wav` + `words.json`
1. ElevenLabs MCP `creative_generate_speech`: model `eleven_v4`, voice `UgBBYS2sOqTuMpoF3BR0` (Mark), ONE take, text =
   `channel.voice.tag` + space + script.txt. Download the full-res URL (`creative_get_generations`) to `voice/take1.mp3`.
2. `studio voice EP` — transcribes (faster-whisper, en), aligns to script.txt, caps every pause at 0.25 s, atempo to 242 wpm,
   maps the timings (no second ASR pass). Prints take/tight/final wpm; `ok` must be true (235–250) and words = script tokens.
   Writes `words.txt` (per sentence `word@time`) — plan every shot from it. `--check` re-transcribes the result to verify.
3. END = last word end + ~1.0 s.

## 3. Pose script + shot list (`shots.md`) — BEFORE any picture
Per sentence: the pose / framing (new one every 0.6–1.5 s), the expression on each beat, props, text pops, icons,
the diagram, the SFX. Then the picture list: one picture per pose, per expression, per prop, per plate — generous.
- Main animal: ONE base picture first; every other pose chained from it (reference image) so it stays the same animal.
  Pick the view the image model draws anatomically right (octopus: top-down clock-face prompt gave 8 arms; front views gave 7).
- One clean plate per scene ("remove the animal", chained from a base) + a sucker/texture macro if useful.
- People: real photo body, then ONE head-swap edit to a flat 2D meme head (recipe §4b), then one edit per expression from
  that head picture. Real hats / glasses / masks stay on top. NO toon eyes on people.
- Props: each on pure green #00FF00 (white #FFFFFF when the prop is green) → props/green/NAME.jpg.
- Diagrams / anatomy: NOT from the image model — drawn in `make_overlays.py` (PIL) from the claims.

## 4. Pictures — Google Flow only (never ElevenLabs for drawing)
Follow the `flow-art` skill (browser pane, Nano Banana 2.1, 9:16, x1, reference chips, 1K =s0 downloads ≥ 2 s apart).
Prompt templates: `channel/prompts.md`. Save as `art/NAME.jpg` (poses, plates, people) and `props/green/NAME.jpg`.
Look at every picture (`studio sheet EP out/look.jpg art/*.jpg`) — redo wrong anatomy, extra limbs, text, wrong identity.

## 5. Cut-outs and positions
- `studio cut EP poses OC0 OC1 ...` — BiRefNet, full frame (block at x=y=0.5, w=1 sits where the animal was); ~1 min/picture on CPU.
  Also person pictures that become blocks.
- `studio cut EP plates REEF OFFICE SC_head0 ...` — plates (+ `_b` blurred). Person close-ups used as backgrounds are plates too.
- `studio cut EP props` — green/white-screen props. Check cut edges on `studio sheet` (RGBA on checker).
- Eye positions: `studio crop EP OC0:0.5:0.44 ...` → `out/crops.jpg`; read centres off the 0.01 grid. Two eyes front, ONE
  eye in profile (`single='l'` when the nose points right). Never guess positions.

## 6. Sound
- SFX: MCP `editornghiepdu-sfx` — `sfx_status` first (Trial must be active; if it is not, stop and tell the user — never buy).
  `sfx_search` with ONE keyword + a category (multi-word queries return 0), `sfx_resolve` to download, copy into
  `audio/sx_<action>.mp3`. One distinct sound per kind of action (~15–25 files); never a fixed set of 8 reused.
- Music: MCP `creative_generate_in_flow` music (`eleven_music_v2`), prompt `channel.music.prompt`, length ≥ END + 5 s,
  instrumental → `audio/music.mp3`.

## 7. Build (`gen_edl.py`, `make_overlays.py`)
Write them like `examples/ATE01-004-octopus/` (import `from studio.edl import *` / `from studio.diagrams import *`):
- SHOTS = (start, plate, camera, 'cut', layers) per sentence/beat; `block()` for every animal / person pose with `eye_keys`
  (expression change every beat: brow up / worried / smug / angry, `mood` happy / shock, `look`, `pupil`), props as
  `prop()` blocks with keys (slide in from the side they are cut on, `ease: back` snaps, LAND squash), `text()` pops,
  `icon()`, `bubble()`, `swap()` for diagram pulses, `fly()` for piles, `loop2()` for 2-frame action loops.
- Every visual ~0.05 s BEFORE its word; its SFX `S(t, 'sx_..', db)` at the same time. 1 kick at most.
- Text: x 0.15–0.85, keep out of the caption band (y ≈ 0.57–0.79), off the eyes; diagram cards w ≤ 0.84 (reframes crop).
- `finish(SHOTS, END, SFX, kicks=[..], keep=(final_hold_start,))` applies split_long reframes and the channel build settings.
- `studio build EP --qa` (overlays → EDL → render ~3–6 min → QA). Run long builds in the background.

## 8. QA loop — not done until it passes
- Read the QA summary: `studio qa` marks the channel's known false fails (`hook_end_s`, `handheld_jitter` within ~1 %).
  Fix every other fail at the source (timing, camera, grade, text placement, levels) and rebuild. Stop after 3 rounds
  without improvement and explain.
- By eye: `out/qa/sheets/sec_*.jpg`, `shots_*.jpg`, `problems.jpg`, and `studio frames EP t0 t1 0.25 out/f.jpg` around
  every gag. Check: action on every key word, nothing cropped by reframes, captions never covered, text legible, same
  animal everywhere, eyes on the eyes, one eye in profile, no copied logo/script/music/voice.

## 9. Deliver and close
- `studio deliver EP` → `<ID>_<slug>_FINAL.mp4` + `_preview.mp4` (720p) in the episode folder; send the preview with
  `SendUserFile`.
- Notion: tick `Đã làm video` on the episode's page in the browser pane (signed in on app.notion.com; widen the viewport
  to 1280×900 before clicking; verify `aria-checked` and after a reload). Only that box.
- Report (Vietnamese if the user writes Vietnamese): duration, QA x/y with every fail explained, what was checked by eye,
  credits/tools used, anything not done. Update memory with what was new. No commit unless asked.
