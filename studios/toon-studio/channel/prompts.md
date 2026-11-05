# Image prompt templates (Muse media.generate_image by default; same prompts work in Google Flow / Gemini API), 9:16

Fill the {slots}; keep the shared tail so every picture of an episode matches. Every pose after the base goes with the
base picture as a reference chip.

## Shared tails
- PHOTO: `Realistic wildlife photograph, natural light, sharp focus, high detail, vertical 9:16 frame, no text, no watermark, no cartoon elements.`
- GREEN: `Isolated object centred on a flat pure green #00FF00 chroma key background, even lighting, no shadow on the background, no text.`
- WHITE (green props): same with `flat pure white #FFFFFF background`.

## Animal
- Base: `A {animal} {pose}, {view}, its natural eyes clearly visible, the whole body in frame with space around it, on {setting}. {anatomy}. PHOTO`
  - {anatomy} = explicit counts / parts the model gets wrong (e.g. `exactly EIGHT arms spread evenly like a star, at 1, 2, 4, 5, 7, 8, 10 and 11 o'clock`).
  - {view}: choose the view the model draws right; for many-limbed animals a steep top-down view.
- Pose (ref = base): `The same {animal} from the reference — same individual, same colours and skin pattern, same camera and lighting — now {pose / action}. {anatomy}. Keep its natural eyes visible. PHOTO`
- Close-up (ref = base): `Close-up of the same {animal}'s face from the reference, eyes large in frame, {mood}. PHOTO`
- 2-frame loop: two poses, identical camera, only the moving part differs (`left arm forward` / `right arm forward`).

## Plates
- Remove (ref = a base): `Remove the {animal} completely and fill in the background naturally; keep the camera, light, colours and every other detail exactly the same. Empty scene. No animal.`
- New scene: `Empty {scene} with nothing in the foreground centre, room for a character, matching {light} light. PHOTO`
- Fictional set (analogy): `A small {office / factory / control room} built on {habitat floor}, realistic miniature set, empty, centred, room in front. PHOTO`

## People (real body + replaced cartoon head, recipe §4b)
- Photo: `A real photo of a {role} ({age}, {clothes}, {headwear}) {action} in {place}, waist-up, facing the camera. PHOTO`
- Head swap (ref = photo): `Keep the photo exactly — same body, hands, clothes, {headwear}, background — but replace the whole head with a flat 2D cartoon meme head: thick black outline, flat beige skin #d9a98a, white oval eyes with small black dot pupils and a heavy black upper lid line, short thick black brows, a nose made of two thin black lines, a small line mouth, flat single-colour {hair} with outline, simple ears, head slightly larger than real and slightly squarish with a heavy jaw. The {headwear} stays photographic on top of the cartoon head. Expression: deadpan.`
- Expression (ref = head-swapped picture): `Same picture, change only the cartoon head's expression to {shocked: tiny pupils, open dark oval mouth | worried: brows tilted up, two light-blue sweat drops | smug: half-closed lids, one-sided smile | crying | squinting}. Keep everything else identical.`

## Props
- `{prop description}, {material}, cartoon-friendly but realistic. GREEN`  (green/leafy prop → WHITE)
- One prop per picture; several parts of one action = several pictures (knob and rope separately).

## Non-negotiable (from the ATE01-004 reference vs the ATE01-901 Muse pilot)
- **Every physical object is a PHOTOGRAPH** from the image model on green (desk, phone, control box, shell, valve dial, rope,
  ticket dispenser, headset, food, tools…): realistic material, real wear, natural light — "a real vintage wooden office desk",
  "a real red rotary telephone", never "icon", "cartoon", "flat", "illustration". PIL draws ONLY diagrams, charts, text cards,
  marks (✓ ✗ ? !) and highlight circles.
- **Every scene plate is a PHOTOGRAPH**: the habitat (sunlit shallow sand with caustics, open water with god rays, reef) and,
  for every analogy, a real miniature set built IN the habitat ("a small sunken office on the sandy sea floor: an old metal filing
  cabinet, two swivel chairs, seaweed, sun rays from above, empty centre"). No flat colour or plain-texture backgrounds.
- **Every episode has a real person** (recipe §4b): a real photo body in a real place that fits the topic (marine lab with a big
  aquarium for sea animals, vet clinic, field ranger, zoo keeper), head replaced by the flat cartoon meme head, then ≥ 3 expression
  edits (deadpan, smug, worried with sweat drops). On screen ≥ 3 times: the "real question" / "researchers found" beat (B4), the
  limits beat (B5, worried/counting), the "just an analogy" moment.
- Same light and colour family across the episode (warm sun on sand, teal water) so cut-outs sit in their plates.
