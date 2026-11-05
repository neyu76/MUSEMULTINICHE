# Autopilot — script in, finished video out (no owner approvals)

The owner sends a script / outline / brief and receives the finished video. The worker never waits for approval.
Every gate in `docs/MUSE_RUNBOOK.md` is passed by the **CRITIC** below instead of the owner. Owner's settings (2026-11-05):

| Setting | Value |
|---|---|
| Script edits | **small**: keep the owner's idea and voice; fix only factual errors, length (target 44–50 s), a weak hook or closer. List every change in the delivery report |
| Fix rounds after the full render | **max 2**; then deliver with the remaining minor issues listed. Never deliver with a BLOCKER |
| Messages to the owner | **only** the delivery, or a blocker only the owner can solve (credits/key/account, machine down > 6 h, a fact that cannot be verified and changes the story) |
| ElevenLabs credits | no cap — but each regeneration needs a stated reason (misread word, vocals in music, alignment fails); never retry in a loop |

## Roles
- **MAKER**: does the work (runbook steps).
- **CRITIC**: judges only what a viewer would see and hear. If your platform can run a **sub-agent / separate session**, run the
  CRITIC there with ONLY these inputs: `script.txt`, `facts.md`, the shot list, the audit sheets, this file. Not the maker's reasoning.
  If it cannot, do the critic pass as a separate step: re-read this file first, then judge the sheets tile by tile as if you had never
  seen the code. Write the verdict to `~/rc_work/<EP>/audit/critic_<stage>.md` (one line per finding: time · severity · what · fix).
- Severity: **BLOCKER** (must fix, never deliver), **MAJOR** (fix in the current round), **MINOR** (fix if cheap; else list in the report).

## Loop
```
0  brief/outline → script            CRITIC-S (script)       fix → re-check (max 3 passes)
1  scaffold, voice, music, shots, mix
2  stills every ~1.5 s + audit sheets CRITIC-V (visual)       fix → stills → re-check (max 4 passes; no render before 0 BLOCKER/MAJOR)
3  full render (watchdog), finalize, QA 21/21, flat none
4  audit sheets of the video, 2 fps  CRITIC-V again + QA      fix → partial re-render → finalize  (max 2 rounds)
5  deliver + report
```
Commands: stills `bash tools/ep/stills.sh <EP> s<N> "<times>" 2` → `python3 -I tools/ep/audit_sheets.py <EP> stills s<N>`;
after finalize `python3 -I tools/ep/audit_sheets.py <EP> video 2`. Each tile shows the timecode, the words spoken at that moment
and blue 5 %/95 % guides. Open **every** sheet.

## CRITIC-S — script checklist
1. **Facts** (true stories): every name, year, number, place and event checked against ≥ 2 independent reliable sources (web search);
   write `episodes/<EP>/facts.md`: claim → source URLs → verdict (true / disputed / legend). A false claim = BLOCKER → fix the words
   minimally. Disputed or legendary → phrase as "legend says / reportedly" (MINOR). Fiction must not use real people's names.
2. **Style** (`docs/KIT_SKILL_v7.md` §3): hook in the first sentence with a concrete picture; one of the 4 story frames; "You see," before
   the explanation; closer ≤ 6 words that loops to the opening; 160–175 words (45 s); numbers spelled out.
3. **Filmable**: every sentence names something that can be shown (object, action, reaction). Abstract sentence → MAJOR: add a
   concrete object/action in the shot plan, not more words.
4. **Logic**: cause → effect is clear to a first-time viewer; nothing contradicts itself; pronouns are unambiguous.

## CRITIC-V — what a viewer can catch (check every tile)
**Sync & meaning**
- The tile shows what the words under it say (±0.15 s): the noun is on screen, the verb is happening. Missing = MAJOR.
- Counts match the narration ("five dealers" → five visible). Wrong count = MAJOR.
- Reaction faces match the emotion of the line; a character speaking/whispering faces the listener.

**Physics & reality**
- Nothing floats: every prop is held, resting on a surface, or hanging from something. Floating = MAJOR.
- Hands actually touch what they hold; held objects move with the hand; nothing passes through a body, table or wall.
- Liquids fall down and pour from a spout/opening into a container; levels rise/fall in the right direction; no water without a source.
- Characters stand on the floor (feet not sunk, not hovering); scale is consistent (a cup is not bigger than a head unless it is a gag).
- Light and shadow direction consistent within a shot; day/night consistent with the story.

**Historical / place accuracy** (true stories)
- Era-correct objects and dress (1920s: no phones, no modern cars, no plastic); currency, signs and language fit the place
  (Paris → French signs, Vienna → German). Landmarks recognisable and correct (the Eiffel Tower has 4 curved legs, arches, 2 platforms,
  a spire — not a ladder). Anachronism = MAJOR; wrong landmark = BLOCKER.
- Text on screen is spelled correctly and agrees with the narration (names, years, numbers).

**Framing & readability**
- Nothing important inside the outer 5 % (blue guides) — text, faces, the hero prop. Cut text = MAJOR.
- No overlaps: marks (✗ ✓ stamps) sit on their own board; props don't cover faces; fx (✨ ? sweat) never cover text; labels never
  cover the hero object. Overlap that hides meaning = MAJOR.
- Text readable at phone size (cap height ≥ ~3 % of frame height); captions not covering key action.
- One clear subject per shot; no clutter of 3+ overlapping papers/objects.

**Continuity**
- A prop that left the scene doesn't reappear without a reason; costumes, hats, props consistent across cuts; the same character keeps
  the same face/colours; the closer matches the opening set.
- No 1-frame flashes, black frames, frozen stretches, or a camera move that jumps (QA covers the numbers; look anyway).

**Audio** (from the QA output + one listen if possible)
- Voice clear, no misread words (compare with script); music has no vocals; SFX match actions (stamp → thump, pour → water).

## Delivery report (the only message, unless blocked)
- Preview MP4 attached; MP4 + Kdenlive zip as storage links (say they expire in 48 h); duration; QA 21/21 line.
- Script changes made (before → after, why) and the `facts.md` verdicts.
- Critic rounds: findings fixed per round; remaining MINOR issues with times.
- Credits spent if known; total hours (render / dead time).
