---
name: flow-art
description: Generate an episode's pictures in Google Flow (flow.google.com, Nano Banana 2.1, 9:16) from the Claude app's built-in browser pane — base animal, chained poses and expressions, clean plates, green-screen props, real-body people with a replaced cartoon head — and download them into the episode folder. Use whenever the episode needs pictures; never draw with ElevenLabs.
---

# Pictures with Google Flow (browser pane)

Prompt templates: `channel/prompts.md`. Picture list: the episode's `shots.md`.

## Driving Flow
- Open flow.google.com in the built-in browser pane (account on ULTRA = ~0 credits per image). If a Google sign-in page
  shows, ask the user to sign in there, then continue.
- New project per episode. Settings popover: `[role=radio]` 9:16 and x1; model Nano Banana 2.1 (default).
- Prompt box = `contenteditable` with aria-label "Bạn muốn tạo những gì?". Fill it with JS
  (`el.focus(); document.execCommand('insertText', false, prompt)`), then a REAL click on the submit button (find it with
  `find` / screenshot; JS `.click()` is ignored). Enter only adds a newline (prompts merge). NEVER press Escape after filling
  (it clears the prompt and the reference chip).
- Reference image (identity chaining): dispatch `contextmenu` on the tile's `img[data-media-id]`, click the menu item
  "Thêm vào câu lệnh" → a chip appears in the prompt. It clears after every submit: re-add it for every pose.
- Generate one picture at a time, wait for the tile, look at it (screenshot / zoom) before using it as a reference.

## Downloads
- Tile `img[data-media-id]` src ends `=s512-rw` → replace with `=s0`, `fetch` as blob, anchor download (1K 768×1376) →
  lands in the Windows Downloads folder; space downloads ≥ 2 s apart or some are dropped. Move them into the episode
  folder with the right names (`art/NAME.jpg`, `props/green/NAME.jpg`) via PowerShell `Move-Item`.
- The 2K/4K upscale download is unreliable (worked once, then silently stopped): use 1K; `studio cut` upscales to 1080 wide.
- Record each prompt in the episode's `prompts.json` ({name: {prompt, ref, media_id}}) so a picture can be redone.

## What to make (one picture each — generous)
1. Base animal (realistic photo, natural eyes visible, big in frame, plain readable background). Anatomy first: count limbs.
2. Poses / expressions chained from the base (same individual, same colours, same camera); a 2-frame loop = 2 pictures.
3. Clean plate per scene: edit of a base "remove the animal, keep the background exactly".
4. People: real photo → ONE head-swap edit (recipe §4b) → one edit per expression from that head picture.
5. Props on pure green #00FF00 (white if the prop is green), isolated, no shadow on the background, no text.

## Checks
Wrong limb count, text/watermarks, a different-looking animal, cartoon eyes painted by the model (we add eyes ourselves),
toon eyes on people — redo. Image models drew octopuses with 7 arms from front/45° views; a steep top-down clock-face
prompt gave 8.
