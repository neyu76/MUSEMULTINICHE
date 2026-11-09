# CRITIC — how-you-invented (P02)

Used by the Muse autopilot (`muse/custom-skills/invention-chain/SKILL.md`) together with `docs/AUTOPILOT.md`.
Numbers come from 5 viral channel videos (`skills/invention-script-writer/references/viral-analysis.md`).
Verdict per item: PASS / FIX (what, where). Any P0 = do not continue. Max 2 fix rounds per gate.

## CRITIC-S — script (before voice)
| # | Check | Pass | Level |
|---|---|---|---|
| S1 | Word count (loi_doc.txt, no tags) | 120–150 (33–42 s at 218 wpm); hard range 110–158 | P0 outside 100–165 |
| S2 | Hook | ≤ 12 words, "you", one crude word, motive visible in frame 0, object not named yet | P1 |
| S3 | First "so you" | ≤ 12 words into the script (≈ ≤ 3.4 s) | P1 |
| S4 | Fix loops | 5–6 "so you" fixes, each a REAL part of the modern object with a source in facts.json | P0 if a mechanism is wrong |
| S5 | Failure sources | escalate, no two neighbours of the same type; ≥ 1 caused by the friend / a third person | P1 |
| S6 | Praise | 1–2, from channel.env PRAISE_WORDS; "Clever!/Genius!/Much better!" (reference channel's lines) = FIX | P1 |
| S7 | Mechanism line | 1–2 ("Now when you…", "As the…") | P2 |
| S8 | Crude words | 2–5; "fucking" ≤ 1; no slurs; children only in slapstick, never in an innuendo | P0 if slur / minor in innuendo |
| S9 | Ending | starts "Now…", ≤ 10 words, reuses the hook's motive/keyword, double meaning implied not explicit | P0 if it does not close the loop |
| S10 | Every sentence opens with so you / But / Except / Now / praise | ≥ 90 % | P2 |
| S11 | New | object, motive, cast, setting, opening gag not in the "đã dùng" tables or `skills/invention-topic-studio/references/topic-bank.md` §1 | P0 |
| S12 | Nuclear gag | per channel.env NUCLEAR_GAG (never = no cooling towers in words or pictures) | P1 |
| S13 | Own words | no hook/ending/pun line reused from the reference videos (`skills/invention-script-writer/references/viral-analysis.md` §2) or from earlier episodes | P0 |
| S14 | Tags (VOICE_TAGS=on) | loi_tts.txt = loi_doc.txt word for word + 6–10 tags describing delivery; 1–3 CAPS words | P1 |

## CRITIC-V — stills, 360p cut, final (open every contact sheet)
| # | Check | Pass |
|---|---|---|
| V1 | Frame 0 | the motive/problem is visible, face readable, ≥ 2 helper layers (sweat, smell waves, flies, hearts…) |
| V2 | Each "so you" | cut/turn to a MACRO of the object; the named part appears exactly when it is said |
| V3 | Each "But/Except" | a physical failure you can see (fall, snap, pinch, launch, wind) + 1–2 s reaction |
| V4 | Mechanism line | one science graphic (force arrows, airflow, heat arrows, waves) |
| V5 | Friend beat | two-shot, friend causes it, caption swear word in CAPS |
| V6 | Ending | calls back the opening framing with the motive achieved |
| V7 | Cuts | `qa_tap.py`: ≥ 70 % of hard cuts within ±0.35 s of so you/But/Except/Now (CUT_STYLE=cat) |
| V8 | Camera | never static (kit `qa_may_nhapnhay.py`: static ≤ 10 % per shot) |
| V9 | Colour | one accent colour = the invented object; characters separate from the background |
| V10 | Clean | no floating/intersecting props, no 1-frame flash, no MakeHuman logo, captions never cover the face or the part being named |
| V11 | Numbers | `qa_tap.py` all ĐẠT (1080×1920, 30 fps, 30–43 s, −14 ± 1 LUFS, TP ≤ −1, no silence > 0.45 s, 205–235 wpm) |
