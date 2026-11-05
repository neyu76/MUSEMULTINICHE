# animal-toon-eyes — production recipe

How this style is MADE with vidclone (the bible `style.md` says what it looks like; this file says how to build it).
Helpers: `channel/style/kit.py`, imported through `studio.edl` (adds prop / swap / bubble / fly / loop2 / finish).
Reference builds: `examples/ATE01-004-octopus/` (current form) and `channel/style/examples/remake_s01_edl.py` (S01's first
20 s structure, accepted by the user 2026-11-03).

## Numbers to hit (measured, `motion` gates in gates.json)
- Picture changes / min (cuts + pose swaps + block moves, `frames.motion`): samples 48–82 over whole videos (S01 98 in its
  busy first 20 s); gate 31–110. Stills with camera moves only reach 15–20 — the action must come from pose pictures and
  keyframed blocks. Reference build: 115 / min.
- Local motion inside shots: 69–100 % of the frame moving, p95 5–11 px/f @720 (reference build 95 %, 16).
- Camera calm while pictures change: camera moving on ~48 % of frames. Small travel per shot (`CAM_GAIN` 0.45 in the
  reference); a big push/pull on every swap hides the swaps.

## 1. Pose script (before any image is made)
Per sentence, the poses the character goes through — one new pose or framing every 0.6–1.5 s (stand → sit → paw on chin →
close-up worried → squashed by a patting hand …). Each pose is its own picture, chained from the character's base picture so
identity holds. 2-frame loops for repeated actions (rubbing a forehead, paddling): two pictures swapped at 2–4 Hz.
Several characters when the narration lists animals; a human stand-in (real body, flat cartoon head) for "scientists / you".
Per pose 1–2 events on the words: expression change, icon pop, bubble, prop slide, squash on impact.

## 2. Assets
- Pose pictures: Nano Banana 2.1, 9:16 2K, realistic animal photo, natural eyes visible. Use whichever front end the
  project's config names (Google Flow web UI, ElevenLabs `gemini-nano-banana-2.1`, Gemini API); generate generously —
  one picture per pose, per expression and per prop, never reuse one picture to save credits.
- Every pose cut out with BiRefNet (full-frame, aligned → x = y = 0.5, w = 1 is its original place).
- ONE clean plate per scene ("remove the animal" edit of a base picture), slightly blurred (radius = width / 300).
- Props, food, plants, side characters generated separately: on pure green #00FF00, or on white #FFFFFF when the prop
  itself is green (grass, leaves) → `python -m vidclone.cutout in.png out.png [--white]`.
- Don't skimp: every prop the samples have is its own block — food held to the mouth, bitten food, chewed bits, grass
  tufts at the feet and in the mouth, bushes / ferns in front of people. Group shots are REBUILT from separate blocks over an
  empty plate, every side character with toon eyes and its own entrance; side characters peek in at frame edges later.

## 3. Motion = keyframed blocks (never point wiggle as the main motion)
- Walk in from the edge with `hop` bounces and shrink to the spot; drop onto a seat with a landing squash (`LAND`); snap in
  with `ease: back`; lean / tilt about a `pivot`; slide in from the side the body is cut off on; rise from the bottom.
- Eating = the jaw lifted off the block (`parts`, dark mouth behind) chewing about its hinge + the food block moving to the
  mouth on each bite + chewed bits popping (`kit.bites`).
- Contact `shadow` under standing / sitting blocks; eyes ride on the block (`parent`).
- Cover cut-out defects (broken legs, halos) with a foreground prop (grass tuft, bush).

## 4. Eyes and expressions
- Sample look: big white eyeball, grey rim, black pupil with highlight, thick round black brows (`brow_w` 0.22).
- Size ≈ 0.75 × eye spacing for pandas / bears (after the ×1.3 in `kit.eyes`), smaller for wide-set dog eyes; close-ups bigger.
- Profile / three-quarter view: ONE eye (`single`: "l" when the nose is to the right of the eye).
- An expression change on almost every beat: brows (up / worried / sad / smug / angry), half lid + `low`, `mood: happy`
  (white ^ band, readable on dark fur), `mood: shock` (small pupils), `pupil` 1.25 for pleading eyes.
- Dark-furred animals: set `lid` (panda #a39c92, black dog #5a524c) or half lids read as black slits.
- Read eye / jaw positions off gridded crops in picture fractions (`kit.grid_crop`), never by guess.

## 4b. People = real body + REPLACED cartoon head (never toon eyes on a real face)
Every human in S01–S03 (ranger, surgeon, sled driver, owner, grandma, diver, boat driver) keeps the real photographed body,
clothes and props, but the whole head is swapped for a flat 2D meme head — the joke depends on it:
- Flat skin fill (warm beige ~#d9a98a, grey-old ~#b9a99a), THICK black outline (~3 % of head width), head drawn
  ~1.1–1.3x real size, slightly squarish oval with a heavy jaw.
- Eyes: white ovals, small black dot pupils, a heavy black upper-lid line; brows = short thick black strokes.
- Nose = two or three thin black lines (bridge + nostril hook); mouth = small line or dark open oval; ears simple.
- Hair, beard, stubble = flat single-colour shapes with outline (brown, black, grey), no texture.
- Real headwear stays photographic ON TOP of the cartoon head: cap, hairnet, beanie, goggles, diving mask, surgical mask.
- Expressions change per beat on the head itself: deadpan, worried (sweat drops light blue), shocked (tiny pupils, open
  mouth), crying, squinting, covering ears. One head design per character, kept across shots.
- Build: generate the person photo, then an edit "replace the head with a flat 2D cartoon meme head ... keep body, clothes,
  hat" chained from one head base per character; one edit per expression. No extra toon-eye layer on these heads.

## 5. Devices seen in S02–S05 (layers.py)
battery `meter` draining with effort · cutout `fill` (silhouette energy gauge) · `bubble` thought / speech whose words
change (`texts`) · `text` + `texts` for calendars and counters · `tint` for night → day / flashback (list it last) · keys
`alpha` + icon `halo` for a ghost · cutout `glow` for the injured / chosen one · icons skull / heart / clock / fire / zap / note
on their words · line-ups of characters entering one by one over labels · big orange outlined words on objects.
Never copy the channel's round logo (top-right) — our own mark or none.

## 5b. Long episodes (60–70 s Notion scripts, ATE01-002 penguin)
- Beats of 8–10 s need reframe cuts: `kit.split_long(SHOTS, max_shot=1.6, piece=1.15, keep=(boards, final hold))` +
  `write_edl(cam_gain=1.0, handheld=0.004)`; without it QA read 4.7 s median shots and a frozen camera (27/42 → 38/42).
- `kit.IDLE.update(breathe=0.014, sway=0.9)` keeps standing animals alive between actions (local motion 39 % → 97 %).
- Snow / white scenes: grade `saturation 1.45, contrast 1.06, brightness -0.05, temperature 5300`, bed_db -10. The
  saturation gate still reads low on snow (content, not grade) — note it in the report instead of over-saturating.
- Text inside reframed shots: keep it between y 0.3 and 0.85 and x 0.15–0.85, off the eyes.
- Anatomy claims: draw the schematic yourself (PIL) from gridded positions instead of asking the image model; the
  X-ray (`fill` on lower body + bones) and the diagram card are the same skeleton, so they always agree.
- Known false fail: `hook_end_s` reads the first Whisper segment, not the first sentence.

## 6. Voice, SFX and captions
ElevenLabs `eleven_v4`, voice `UgBBYS2sOqTuMpoF3BR0` (Mark) reads ~181 wpm → cap pauses at 0.25 s, then atempo 1.2 (~235 wpm).
Start the prompt with `[casual, upbeat, fast-paced, playful, like telling a friend a funny animal fact]`; without it the
take came out at ~216 wpm and needed atempo 1.3 (ATE01-003).
SFX: pick one sound per cue from a real SFX library (search by what happens: "cartoon pop", "stamp thud", "whoosh throw",
"squish", "ding correct", "buzzer wrong", "slide whistle"...), not a fixed set of eight clips reused all video.
Grade: ffmpeg `colortemperature` LOWER kelvin = warmer. Sunset / golden-hour plates already read warm: ~8200 K and
saturation ~0.82 (ATE01-003 failed saturation 172 and warmth 27.7 at 6200 K / 1.25).
Transcribe with `--lang en`, align to the script. Captions: one word, Anton, orange gradient, y 0.72 (style.json).
