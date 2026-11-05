---
name: script
description: Turn an outline or a brief (topic, beats, claims) into an animal-toon-eyes narration script (~70 s, ~285 words, beats B1–B7) with brief.md (beat board, claims, conditions), or check a given script against the channel bible. Use from the episode skill, or when the user asks to write / check a script for the channel.
---

# Script from an outline / brief

Read `channel/style/style.md` §2 (narrative template) and the reference scripts `examples/*/script.txt` + `brief.md`.

## Rules
- English, US-casual, "telling a friend a funny animal fact". Second person "you" ≤ 4 times.
- ~280–290 words (70 s at 242 wpm). Seven paragraphs = beats B1–B7:
  - B1 hook (≤ 3 s, ~8–12 words): a popular belief / puzzle, flipped or sharpened at once.
  - B2 setup: a concrete, visual analogy or situation the art can SHOW (an office, a factory, a race).
  - B3 wrong picture: why the obvious answer fails (often a "wrong model" we can stamp WRONG).
  - B4 evidence: who found what ("Researchers at …"), the mechanism, stated only as strongly as the source.
  - B5 limits: what this does NOT mean (no overclaiming).
  - B6 back to the analogy, updated.
  - B7 closer: one sentence, 11–31 words, vivid image, no CTA, no "follow for more".
- Every sentence must be drawable: name things we can show (an arm, a desk, a rope, a gauge).
- Facts: only from the brief's sources; no invented numbers, dates or names. Numbers spelled as spoken.
- Never copy lines from the sample channel; recurring phrases only in spirit ("…, right?", "Here's the twist").

## Output
- `script.txt`: the narration only, one paragraph per beat, no headings.
- `brief.md` (template in the episode folder): beat table, claims C1.. (source wording), conditions, visual ideas per beat.
- Show the script + word count to the user and wait for OK unless they asked to go straight through.

## Checking a given script
Report: word count / estimated duration, hook length, closer length, beats found, risky claims (beyond the source),
undrawable sentences. Suggest edits; never change a given script silently.
