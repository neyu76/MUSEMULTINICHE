"""{ID} · {TITLE} — animal-toon-eyes episode build (run: studio build {ID} --qa).
Keyframed cut-out blocks over clean plates, props as their own blocks, toon eyes on every animal pose (ONE eye in profile),
an expression change on every beat, people = real body + replaced cartoon head (no toon eyes on them), PIL diagrams from
make_overlays.py. Reference build: examples/ATE01-004-octopus/gen_edl.py.
All times = narration seconds (words.txt); a visual lands ~0.05 s before its word, its SFX at the same time."""
from studio.edl import *   # noqa: F401,F403  (kit helpers + prop / swap / bubble / fly / loop2 / finish / S / colours)

END = 0.0   # TODO: last word end (words.txt) + ~1.0 s tail

# Eye positions read off `studio crop` grids (picture fractions), never guessed.
setup(
    eye={
        # 'XX0': dict(l=(0.47, 0.44), r=(0.545, 0.44), size=0.045),       # front view: two eyes
        # 'XX2': dict(l=(0.70, 0.44), size=0.04, single='l'),             # profile: ONE eye ('l' when the nose points right)
    },
    shadow={},            # 'XX6': (x, y, width) contact shadow for standing / sitting blocks
    lids={},              # 'XX': '#8a4a34' lid colour for dark / coloured skin
    no_gain=())           # close-ups whose eye size is set directly

PLATE = 'plate/TODO_b'

SHOTS = [
    # B1 — hook: the animal drops in, expression on the first key word, label pops
    # (0.0, PLATE, HOLD(0.5, 0.5, 1.04), 'cut',
    #  block('XX0', 0.0, y=-0.3, keys=[{'t': 0.3, 'y': 0.5, 'ease': 'back'}], pose=LAND(0.3, 0.06),
    #        eye_keys=[(0.0, dict(mood='shock', brow='up')), (1.0, dict(brow='smug', open=0.6, low=0.2))], jitter=False)
    #  + [text('HOOK WORD', 0.1, 1.3, 0.5, 0.17, 0.09, w=0.5, fill=ORA, **POP)]),
]

SFX = [
    # S(0.28, 'sx_plop', -13),
]
KICKS = []   # 1 impact kick at most (more push QA handheld_jitter over the gate)

finish(SHOTS, END, SFX, kicks=KICKS, keep=())   # keep = start time of the final hold
