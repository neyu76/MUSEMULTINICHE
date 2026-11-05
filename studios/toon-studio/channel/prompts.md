# Google Flow prompt templates (Nano Banana 2.1, 9:16)

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
