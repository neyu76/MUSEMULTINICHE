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
