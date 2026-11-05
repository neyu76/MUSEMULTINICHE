# Style bible — animal-toon-eyes

Samples (local only, `/root/vc_samples/new`, analysed 2026-11-02): S01 panda diet 50.0 s · S02 husky obedience 49.3 s ·
S03 two animals saving people 60.8 s · S04 animals and death 51.5 s · S05 koala sleep 10.8 s.
S03/S04 carry a channel logo (top right) and a vertical re-upload watermark (left edge); they are the same format, so they are kept.
A sixth file (3D round-head toon, water clock) is a different series and is excluded (that look is the `rickclips` engine).
Tags: [measured] analysis.json/profile.json · [seen] contact sheets · [inferred].

## 1. Format and niche
- Vertical 1080×1920, 60 fps source (we make 30 fps) [measured]. 50–61 s for full episodes, a 10–11 s micro-cut also exists [measured].
- English, US-casual. Animal facts for a general / teen audience: myth-busting ("X does Y because Z, right? Nope.") or
  "N animals that …" countdowns and true rescue stories [seen]. Tone: funny-curious, then a mild "whoa" or a soft emotional ending [inferred].

## 2. Narrative template
| Beat | % of duration | Purpose | Typical line (paraphrased) |
|---|---|---|---|
| Hook | 0–6 % (ends 2.9–4.3 s, median 3.1 s) [measured] | state a popular belief as a question, flip it at once | "Sloths are slow because they're lazy, right? Not even close." |
| Setup question | 6–12 % | name the real question | "So why do they …?" |
| Wrong-logic / context | 12–40 % | show why the obvious answer fails, often by comparing with 2–3 other animals | "If that were true, then dogs / bears / horses would …" |
| Evidence / turn | 40–70 % | scientists look inside / a time jump ("about N million years ago") / the key mechanism | "Scientists finally looked inside …", "Here's the twist …" |
| Consequence | 70–95 % | what that means today, often a funny or relatable payoff | "That's why today they still …" |
| Closer | last 1 sentence, 11–31 words (median 18) [measured] | concrete number or vivid image; no CTA, no "follow for more" | "…so they spend 16 hours a day eating just to have the energy to eat more." |

- List variant (S04): "Here are N animals that …" → "First up, X." → "Next, Y." → "And what about Z?" — each 25–35 % [seen].
- Story variant (S03): one-line hook with a promise, then year + name + place, short punchy sentences, cliffhanger "Even crazier is …" before story 2 [seen].
- Pace 232–293 wpm (median 249) [measured]; first word at 0.0 s, longest pause ≤ 0.36 s, voice ends within 0.2 s of the video end [measured].
- Person: "you" 0–4 times, mainly in the logic part ("if you apply that…") [measured]. 0–5 questions, mostly in the first 20 % [measured].
- Recurring phrases: "…, right?", "Um, nope." / "Actually, …", "So why…", "And guess what?", "The problem is…", "Just like that," [seen].

## 3. Visual medium and art direction
- **Photoreal animals (AI-generated photos / composites) + flat 2D cartoon face parts** [seen]: big white circle eyes with thick black
  outline and black pupils, thick black brows, sometimes a cartoon mouth, blue teardrops, sweat drops, "zZz", red "!" / "?".
  The photo stays real; only the face and props are cartoon.
- **Humans**: real photo body + flat 2D cartoon head (round skin-tone head, black line face, big eyes) — ranger with binoculars,
  scientist in surgical mask, owner, diver [seen]. Real-photo **hands** reach in from a frame edge to poke, pat or hand over a prop [seen].
- Backgrounds: natural habitat, soft depth of field, even daylight; forests, snow, ocean, savanna, campsite, kitchen [seen].
- Palette is the habitat's, muted earth tones (#615943, #807b63, #a2907a, #c1cdd2) with blue water scenes (#1e79b5, #3e788e) [measured];
  saturation median 69 (51–109), brightness 140, contrast 49, warm b* +6 [measured]. Accent colours come only from the cartoon layer:
  saturated yellow (#f2d417), red, cyan, pink [seen].

## 4. Shot grammar
- The animal is **centred, full body, facing camera** most of the time; close-up on the face for the reaction word ("nope") [seen].
- Every sentence becomes one literal picture; the key noun gets a prop: meat steak, bamboo, DNA helix, clock, skull, battery,
  wooden signpost (Meat ↔ Bamboo), name tag around the neck ("CARNIVORE") [seen].
- **Sub-shot changes on words**: inside a shot the eyes change expression, a tear appears, a prop pops in, a hand enters — every 0.4–0.7 s
  (camera/move changes every 0.53 s median) [measured+seen].
- Explainer devices [seen]: thought bubble (with picture or "I miss U"), white handwritten tilted text ("Am I a herbivore?",
  "basically poison"), letter-scatter text ("R I G H T ?"), black body silhouette filled yellow as an energy gauge, 3-row split screen with
  battery icons, surgery line + scalpel → organ cut-away, round iris/scope POV (keyhole, sniper scope, peephole), clock overlay or
  "DAY 3" counter for time, halo over a dead animal, X eyes for dead.
- Story variant: cartoon-head humans in real settings, "HELP" text bursting from a window, little props (alarm clock, pet bowl with name) [seen].

## 4b. Animation inside shots (re-checked at 6 fps, 2026-11-03 — the part v1 missed)
The samples are not "stills with camera moves". Something animates in every shot [seen at 6 fps on S01, S02, S05]:
- **Eyes live**: flat cartoon eyes change every 0.3–0.5 s — darts left/right/down, blinks (2–4 frames), brows angry ↔ worried ↔
  raised, half-lid smug, eyes widening (scale 1.2–1.4×) on surprise words. Expressions follow the narration word by word.
- **Props move in**: hands slide in from the frame edge and pat / poke (S01 2.7 s, S05 3.2 s), bamboo slides in from the left (S01 3.7 s),
  icons pop with overshoot ("?" 1.7 s, zZz bobbing, skull), a running animal crosses the frame (S02 0–0.8 s), batteries drain.
- **Text animates**: "RIGHT?" letters drop in one by one with a bounce (S02 2.8 s); small white notes appear tilted.
- **Captions pop**: every word appears ~1.4× and settles to 1.0 in ~0.15 s; emphasis words stay a bit bigger.
- **Subject is big**: the animal fills ~70 % of the frame width (chunky, close medium shot); full-body shots still fill the height.
- **Camera snaps**: shots often open with a fast pull or punch-in (ease-out over ~6 f), not slow creeps.
- **Cut-out puppets** [measured with `vidclone.parts` + camera-compensated difference sheets]: after removing the camera move,
  65–100 % of the picture still moves (local speed p95 6–11 px/f @720; our v1/v2 stills: 24 %, 1.5–1.8 px/f). The animal is a
  separate cut-out over a still background plate: the whole silhouette breathes / sways (S05 koala), parts move on their own —
  mouth chewing and bamboo moving in the paws (S01), head bob/tilt and tongue swap (S02), whole animals slide in from the frame edge
  (S04 elephants), pose swaps (stand → sit).
- **Pose drawings carry the action** [measured, `frames.motion` → gate `picture_changes_per_min`]: picture changes per minute
  S01 82, S05 56, S03 54, S02 52, S04 48 (S01's first 20 s: 98) — stills + camera (our gecko v3, otter) only 15–20.
  How to build it: `recipe.md` (+ `kit.py`, `examples/`). S01 0–20 s, frame by frame: stand → sit (1.2 s) → paw on chin
  (1.8) → face close-up + bird flying across (2.2) → hand pats head, panda squashes, sad eyes (2.8) → hand slides bamboo to mouth (3.8)
  → ranger rises from behind ferns (4.8) → binoculars up (5.6) → eating loop of 2 pictures (6.4–8.2) → word-by-word headline (8.4) →
  ranger writing (9.4) → pull-out to full body (11.0) → group of deer/ranger/hippo/frog (11.4) → ranger rubbing forehead loop + scribble
  bubble (12.4) → dog head-down eating grass (13.6) → dog standing (13.8) → tongue out + vomit splat (15.4) → polar bear leaning in eating
  berries (16.0) → eating seaweed (17.8) → looks up, tear, thought bubble with a seal (18.4) → stands, paw on chin, typed note (19.4).
How we make it: `layers` in the EDL (vidclone/layers.py) — `cutout` layer (BiRefNet matte of the picture) over a clean plate
(Nano Banana "remove the animal"), with breathe / sway / keys and its own puppet `warp` (nod, wag, chew, paddle, jiggle, shake),
eyes as children of the cut-out; — procedural eyes over the real animal's eyes (positions from Gemini
vision), props cut out from green-screen renders (vidclone/cutout.py) with pop / slide / bob / keyframes, icons and bounce text.
Keyframed BLOCKS, not wiggle [seen at 10 fps, S01–S05]: every character / prop is a cut-out over a fixed, slightly blurred plate
and moves as a whole (walk in with bounces, drop and squash, snap with overshoot, lean, slide in from the cut-off side, rise from
the bottom); eating = the jaw lifted off the block and chewing, food held to the mouth, chewed bits popping; profile = one eye.
More devices in S02–S05 [seen]:
- energy gauges: a battery that drains while the animal runs (S02); the animal as a black silhouette with a yellow level that
  drops (S05) → layers `meter`, cutout `fill`;
- thought / speech bubbles whose words change on the narration ("Obey" → "go rogue", "keep going") → layer `bubble` + `texts`;
- line-ups: breeds enter one by one from the right and leave left, each over a labelled bowl (SHEPHERD / PUG / BEAGLE);
- time passing: a calendar flipping months (MAY → NOV) while the scene goes from night to day (S04) → `text` + `texts`, `tint`;
- ghost of a lost animal (faded block + halo icon), a pulsing red glow under the hurt one (S04) → keys `alpha`, icon `halo`,
  cutout `glow`;
- icon pops on key words: skull on "poison" (S05), alarm clock while waiting (S03), plus heart / fire / zap / note;
- big orange outlined words on objects ("HELP" on a window, S03); people / divers with flat cartoon heads in the scene;
- the channel puts its own round logo top-right — use OUR own mark or none, never theirs.

## 5. Camera and edit
- Median shot 1.5 s (1.33–1.67) [measured]; 22–37 transitions/min (median 32) [measured].
- Mix ≈ 58 % hard cuts, 38 % dissolves (median 0.45 s, 0.32–0.63), ~3 % whips, rare fade [measured]. Many "cuts" are in-place swaps of the
  same picture with a changed face or prop [seen].
- Camera never rests long: push 34 %, pull 28 %, pan 4–36 %, tilt 0–13 %, static 9 % (S04 is the outlier at 53 % static) [measured].
  Moves are gentle (slow push/pull, small zoom) [seen]. Handheld jitter 7.0 (6–8.5) [measured].
- No cut in the last 3 s; the last shot holds and dissolves [measured].

## 6. Typography
- Captions: **one word at a time** (93–100 %) [measured], UPPERCASE [seen], heavy condensed sans (Anton/Bebas-like) [seen],
  yellow→orange vertical gradient with a thin dark-brown/black outline and soft shadow [seen; measured fill #ff7602/#e87e33, edge #000],
  small: letter height 2.9 % of frame [measured], centred at **y = 0.72** (lower-middle, over the animal's chest) [measured].
  Key words occasionally bigger (numbers "4.2 MILLION", "BECAUSE", "DIFFERENT") [seen].
- Other text: white rounded sans, slight tilt, for inner thoughts; big white outlined headline text ("You Are What You Eat" stacked one word
  per line); "DAY 1/3" white condensed in the top-left [seen].

## 7. Sound
- Voice: adult male, f0 110–137 Hz [measured], casual US, fast and continuous, speech covers 83–93 % of the runtime [measured].
- Music: quiet quirky underscore in a minor key (A, G, C, D minor), 108–144 bpm [measured]; bed 6–11 dB under the voice in gaps [measured].
- SFX: many small cartoon hits on visual changes (pops, boings, whooshes, ticks); ~7–22 hits/min in word gaps [measured as gap_hits_per_min].
- Loudness −13.1 to −14.0 LUFS, peaks to 0 dBTP, LRA < 3, near-mono (side −15…−26 dB) [measured]. We deliver at −14 LUFS / −1 dBTP.

## 8. What makes it work
- Contradiction in the first 3 s ("right? …nope") — a hook that is a mini plot twist.
- Photoreal animal + goofy cartoon eyes = instant comedy and readable emotion without animation.
- Something changes on screen every half second, synced to words, so the 250 wpm narration never feels like a lecture.
- Every abstract idea (energy, digestion, evolution, time) turned into one concrete visual gag.
- Ends on a concrete number or a touching image, no outro.

## Appendix — beat tables (paraphrased)
S05 (10.8 s, full micro-episode):
| time | narration | on screen | shot / move | trans | text | sound |
|---|---|---|---|---|---|---|
| 0.0–1.8 | myth: they sleep all day because lazy? | koala eyes shut, "zZz" | full body, push | — | 1-word orange caps | voice from frame 0 |
| 1.8–3.6 | "…right? Nope." | eyes pop open → face close-up, hand pats head | push to close-up | cut | NOPE | pop |
| 3.7–5.0 | only food is eucalyptus | koala holding leaves, eyes look down | full body, push | cut | EUCALYPTUS | — |
| 5.1–5.9 | it's basically poison | leaf branch alone, white tilted note, skull pops on | push | cut | POISON | pop |
| 6.0–7.0 | almost no calories | black silhouette, yellow fill drains to red | pull | cut | CALORIES | drain sfx |
| 7.1–10.8 | barely awake; one meal takes days | sleepy eyes → clock overlay → "DAY 3", pink gut spiral | push | dissolve | DIGEST | tick |

S01 (first 16 s): hook on panda with "?" → hand pats sad panda → hand offers bamboo ("bamboo?") → cartoon-head ranger with binoculars
in ferns ("scientists watched") → panda chewing → big white stacked headline text → ranger frowning, writing → ranger sweating with a
scribble thought bubble between a deer and hippo ("you run into trouble") → dog eating grass, cartoon vomit → polar bear with berries,
thought bubble of a seal "I miss U" [seen]. Pattern: 1 image per clause, 2–4 face/prop swaps per image.

## 9. Avoid
- Long holds (> 2.5 s) without an eye/prop change; static centred images with no move.
- Big multi-word captions, white captions, captions at the bottom edge.
- Realistic animated mouths/deepfake-like faces — the face layer must stay flat 2D cartoon.
- Slow or breathy narration, long pauses, music louder than ~6 dB under voice, a CTA ending.
- Do not copy: the samples' scripts and stories (the panda/husky/koala/whale/pig scripts), the named real people from S03, the channel logo,
  the watermark, their music, or a cloned voice of the narrator.
