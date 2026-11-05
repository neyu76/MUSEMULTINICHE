# Niche critic additions: animal-toon-eyes (on top of docs/AUTOPILOT.md CRITIC-S / CRITIC-V)

**Script (CRITIC-S)** — channel rules (style.md §2, script skill): hook flips a belief in ≤ 3 s; beats B1–B7; ~280–290 words;
closer 11–31 words, no CTA; "you" ≤ 4 times; every sentence drawable. Claims only as strong as the source ("Researchers at …"),
no invented numbers/dates/names, analogies labelled. Never reuse lines or stories from the sample channel (panda/husky/koala/whale/pig).

**Pictures** (before cutting): species-correct anatomy — COUNT limbs/arms/fins/eyes (octopus 8 arms; insects 6 legs; spiders 8);
the same individual in every pose (colours, markings, size); natural eyes visible (we add toon eyes); no painted cartoon eyes or
text/watermarks from the image model; people = real photo body + flat cartoon head, real hats/masks photographic on top, NO toon eyes.

**Render (CRITIC-V)**:
- Toon eyes sit exactly on the animal's eyes in every pose; ONE eye in profile; eyes follow the block when it moves; expression
  changes on every beat and matches the line.
- Action on every key word (~0.05 s before it) with its own SFX; ≥ 1 picture change every 0.6–1.5 s (motion gate 31–110 / min).
- Cut-out defects hidden (halos, broken legs, missing tail tips) — cover with a foreground prop or redo the cut.
- Props held / resting / sliding in from the side they are cut on — nothing floating; contact shadows under standing blocks.
- Text pops inside x 0.15–0.85, out of the caption band (y ≈ 0.57–0.79), never over the eyes; diagram cards w ≤ 0.84, not cropped
  by the split-long reframes; diagram facts match brief.md claims exactly.
- Captions never covered; same animal everywhere; no copied logo/script/music/voice.

**Found on the first Muse pilot (ATE01-901) — check these explicitly every time**
- Run `studio audit EP` and open EVERY sheet (frame every 0.5 s): the gag-only frame grids missed all of the issues below.
- Empty frames: a plate with nothing on it (only a caption) for ≥ 0.3 s = MAJOR (pilot 17.0, 19.5, 42.5 s). Every frame has the
  character or a prop/diagram that illustrates the spoken word.
- Cut-out leftovers: grey/sand blobs floating next to arm tips after BiRefNet (pilot 22–23 s, 32–40 s) = MAJOR — clean the alpha
  (drop islands not connected to the body) or redo the cut; look at cut/*.png on the checker sheet before building.
- Caption band (magenta lines y 0.57–0.79 on the audit sheets): no card, label or bubble may enter it (pilot 20–22 s card bottom
  edge, 44 s "NINE PERSONALITIES" card over the caption) = MAJOR.
- Safe area (blue 5 % lines): no text above y 0.05 (pilot 29 s "MORE NEURONS" at the top edge) = MAJOR.
- Counts inside diagrams match the narration: an "8 ropes" / 8-arm diagram must draw exactly 8 (pilot 20–22 s drew ~10) = MAJOR.
- Crossed-out cards: the ✗ must leave the word readable (draw it beside or semi-transparent), else the joke is lost = MINOR.
