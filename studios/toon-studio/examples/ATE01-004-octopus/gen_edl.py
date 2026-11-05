"""ATE01-004 · How an Octopus Manages Eight Arms — animal-toon-eyes recipe (keyframed cut-out blocks over clean plates, props as
blocks, toon eyes on every octopus pose, one eye in profile, expressions on the beats, real-body scientist with a replaced flat
cartoon head). Script = Notion S01-v1, verbatim. Beat board B1-B7 from Notion. The office / task board / queue are a fictional
analogy (V1); the anatomy cards are our own PIL schematics from make_overlays.py (C1 segmented arm circuitry, C2 more neurons in
the arms than in the central brain, never eight little brains or personalities).
All times = narration seconds (words.json); reactions land ~0.05 s before their word."""
from studio.edl import *   # noqa: F401,F403

END = 72.2
TOP = dict(size=0.045)
setup(
    eye={'OC0': dict(l=(0.47, 0.44), r=(0.545, 0.44), **TOP), 'OC1': dict(l=(0.469, 0.44), r=(0.545, 0.442), **TOP),
         'OC2': dict(l=(0.702, 0.438), size=0.04, single='l'), 'OC3': dict(l=(0.41, 0.362), r=(0.625, 0.362), size=0.15),
         'OC4': dict(l=(0.46, 0.437), r=(0.54, 0.439), **TOP), 'OC5': dict(l=(0.472, 0.437), r=(0.541, 0.437), **TOP),
         'OC6': dict(l=(0.469, 0.385), r=(0.545, 0.385), **TOP), 'OC7': dict(l=(0.466, 0.424), r=(0.558, 0.426), size=0.05),
         'OC8': dict(l=(0.461, 0.436), r=(0.553, 0.436), size=0.042), 'OC9': dict(l=(0.45, 0.433), size=0.045, single='l')},
    shadow={'OC6': (0.5, 0.66, 0.7), 'OC7': (0.5, 0.71, 0.6)},
    lids={'OC': '#8a4a34'}, no_gain=('OC3',))

REEF, OFF, DEEP = 'plate/REEF_b', 'plate/OFFICE_b', 'plate/DEEP_b'
SC0, SCA, SCB, SCC = 'plate/SC_head0', 'plate/SCa', 'plate/SCb', 'plate/SCc'
TIPS = [(0.417, 0.291), (0.605, 0.291), (0.182, 0.371), (0.82, 0.374), (0.117, 0.625), (0.898, 0.61), (0.345, 0.756), (0.638, 0.77)]

def notes_fly(t0, n, dt, dst, t1): return fly('note', t0, n, dt, dst, t1)

def crawl(t0, t1):
    """OC9 / OC0 swapped as a 2-frame crawl loop while the block drifts right."""
    return loop2(REEF, HOLD(0.5, 0.5, 1.04), t0, t1, ('OC9', 'OC0'), 0.38, 0.5)

SHOTS = [
    # B1 — "Eight arms. One body."  the octopus drops onto the sand, label swaps 8 ARMS -> 1 BODY
    (0.0, REEF, HOLD(0.5, 0.5, 1.04), 'cut',
     block('OC0', 0.0, y=-0.3, keys=[{'t': 0.3, 'y': 0.5, 'ease': 'back'}], pose=LAND(0.3, 0.06),
           eye_keys=[(0.0, dict(mood='shock', brow='up')), (0.6, dict(brow='up', look=[0, -0.6])), (1.0, dict(brow='smug', open=0.6, low=0.2))], jitter=False)
     + [text('8 ARMS', 0.1, 1.37, 0.5, 0.17, 0.09, w=0.5, fill=ORA, texts=[[0.6, '1 BODY']], **POP)]),
    # "Who handles all the controls?"  tangled, worried; the control panel slides in
    (1.37, REEF, HOLD(0.5, 0.48, 1.06), 'cut',
     block('OC1', 1.37, eye_keys=[(1.37, dict(brow='worried', look=[-0.6, -0.3])), (1.9, dict(brow='worried', look=[0.8, 0.6], pupil=1.2))], jitter=False)
     + [icon('question', 1.45, 2.37, 0.22, 0.24, 0.1, wobble=8, **POP),
        prop('cp', 'control_panel', 1.9, 2.37, 0.78, 1.2, 0.34, [{'t': 2.1, 'y': 0.78, 'ease': 'back'}], pop=False)]),
    # "An octopus can make the problem look effortless,"  glides across, smug
    (2.37, DEEP, HOLD(0.5, 0.5, 1.03), 'cut',
     block('OC2', 2.37, x=-0.35, keys=[{'t': 3.5, 'x': 0.42, 'ease': 'out'}],
           eye_keys=[(2.37, dict(look=[1, 0], brow='up')), (3.55, dict(brow='smug', open=0.6, low=0.25, look=[0.6, 0]))], jitter=False)
     + [text('EFFORTLESS', 3.57, 4.31, 0.5, 0.25, 0.075, w=0.62, fill=CYA, **POP),
        icon('spark', 3.62, 4.31, 0.78, 0.38, 0.07, **POP), icon('spark', 3.72, 4.31, 0.62, 0.36, 0.06, **POP)]),
    # "but picture trying to keep track of eight flexible limbs"  numbers pop on all eight arm tips
    (4.31, REEF, FT((0.5, 0.52, 1.0), (0.5, 0.52, 1.08)), 'cut',
     block('OC0', 4.31, eye_keys=[(4.31, dict(look=[-0.6, -0.6], brow='up')), (5.5, dict(brow='worried', look=[0.6, 0.6])), (6.2, dict(mood='shock', brow='up'))], jitter=False)
     + [text(str(i + 1), 5.49 + 0.075 * i, 6.93, x, y, 0.06, w=0.07, fill=YEL, **POP) for i, (x, y) in enumerate(TIPS)]
     + [text('8 LIMBS', 5.75, 6.93, 0.5, 0.15, 0.08, w=0.46, fill=ORA, **POP)]),
    # "and all those suckers."  macro of the suckers
    (6.93, 'plate/SK', FT((0.5, 0.5, 1.0), (0.48, 0.52, 1.12)), 'cut',
     [text('SUCKERS', 6.98, 7.63, 0.5, 0.2, 0.085, w=0.55, fill=ORA, **POP)]
     + [icon('spark', 7.0 + 0.06 * i, 7.63, x, y, 0.06, **POP) for i, (x, y) in enumerate([(0.62, 0.3), (0.55, 0.45), (0.45, 0.6), (0.36, 0.78)])]),
    # "An ordinary-looking control panel suddenly seems hopelessly small."  the panel shrinks under its arms
    (7.63, REEF, HOLD(0.5, 0.52, 1.04), 'cut',
     block('OC0', 7.63, eye_keys=[(7.63, dict(look=[0, 0.8], brow='up')), (9.4, dict(look=[0, 1], brow='worried')), (10.0, dict(mood='shock', brow='up'))], jitter=False)
     + [prop('cp2', 'control_panel', 7.73, 10.45, 0.5, 0.62, 0.42, [{'t': 9.43}, {'t': 10.0, 'w': 0.1, 'ease': 'in'}]),
        text('TOO SMALL', 10.0, 10.45, 0.5, 0.2, 0.085, w=0.6, fill=RED, **POP)]),
    # B2 — "Let's give our octopus a fictional office,"  octopus behind a desk on the sea floor
    (10.45, OFF, HOLD(0.5, 0.52, 1.04), 'cut',
     block('OC6', 10.45, x=0.5, y=0.48, w=0.8, keys=[], pose=LAND(10.55, 0.05),
           eye_keys=[(10.45, dict(look=[0, 0], brow='up')), (11.3, dict(brow='smug', open=0.6, low=0.2))], jitter=False)
     + [png('headset', 10.9, 12.03, 0.5, 0.34, 0.22, parent='OC6', **{'in': 'slide_top'}),
        prop('desk', 'desk', 10.5, 12.03, 0.5, 0.72, 0.85),
        text('FICTIONAL', 11.25, 12.03, 0.5, 0.2, 0.085, w=0.58, rot=-8, fill=RED, **POP)]),
    # "with eight requests arriving at the same desk."  notes fly in, the phone rings
    (12.03, OFF, HOLD(0.5, 0.55, 1.06), 'cut',
     block('OC6', 12.03, x=0.5, y=0.48, w=0.8, eye_keys=[(12.03, dict(look=[0.8, 0], brow='up')), (12.7, dict(mood='shock', brow='up', look=[0.6, 0.4])),
                                                    (13.5, dict(brow='worried', look=[0, 0.6]))], jitter=False)
     + [prop('desk2', 'desk', 12.03, 13.99, 0.5, 0.72, 0.85, pop=False),
        prop('ph', 'phone', 12.35, 13.99, 0.22, 0.63, 0.2, wobble=10)]
     + notes_fly(12.15, 8, 0.17, (0.66, 0.62), 13.99)
     + [text('8 REQUESTS', 12.35, 13.99, 0.5, 0.18, 0.08, w=0.62, fill=ORA, **POP)]),
    # "Grab that."  one arm reaches for a shell
    (13.99, REEF, HOLD(0.55, 0.45, 1.06), 'cut',
     block('OC4', 13.99, eye_keys=[(13.99, dict(look=[1, -0.4], brow='up'))], jitter=False)
     + [prop('sh', 'shell', 14.0, 14.49, 0.9, 0.3, 0.14), text('GRAB THAT', 14.0, 14.49, 0.5, 0.17, 0.08, w=0.6, fill=YEL, **POP)]),
    # "Bend here."
    (14.49, REEF, HOLD(0.42, 0.48, 1.06), 'cut',
     block('OC5', 14.49, eye_keys=[(14.49, dict(look=[-1, 0.2], brow='worried'))], jitter=False)
     + [prop('cb', 'circle_red', 14.5, 14.99, 0.15, 0.47, 0.26), text('BEND HERE', 14.5, 14.99, 0.5, 0.17, 0.08, w=0.6, fill=YEL, **POP)]),
    # "Adjust this contact."  a dial at a sucker, turned
    (14.99, REEF, HOLD(0.6, 0.45, 1.06), 'cut',
     block('OC0', 14.99, eye_keys=[(14.99, dict(look=[1, -0.3], brow='angry'))], jitter=False)
     + [prop('dl', 'dial', 15.0, 15.83, 0.82, 0.37, 0.16, [{'t': 15.2}, {'t': 15.7, 'rot': -120}]),
        text('ADJUST CONTACT', 15.0, 15.83, 0.5, 0.17, 0.07, w=0.75, fill=YEL, **POP)]),
    # "It's a silly image,"  close-up, amused
    (15.83, 'art/OC3', FT((0.5, 0.45, 1.05), (0.5, 0.42, 1.14)), 'cut', [
        eyes('OC3', [(15.83, dict(look=[0.6, -0.4], brow='up')), (16.05, dict(mood='happy', brow='up'))], jitter=False),
        text('SILLY', 16.05, 16.65, 0.5, 0.56, 0.1, w=0.4, rot=-10, fill=ORA, **POP)]),
    # "but it gets at a real question:"  the scientist (real body, cartoon head)
    (16.65, SC0, FT((0.5, 0.4, 1.0), (0.5, 0.36, 1.08)), 'cut',
     [icon('question', 17.3, 18.01, 0.78, 0.15, 0.1, wobble=8, **POP), text('REAL QUESTION', 17.3, 18.01, 0.5, 0.1, 0.07, w=0.66, fill=YEL, **POP)]),
    # "how is control organized inside such a complicated animal?"  the plain schematic, small octopus peeks
    (18.01, DEEP, HOLD(0.5, 0.45, 1.02), 'cut',
     [prop('op', 'octo_plain', 18.05, 20.73, 0.5, 0.38, 0.86), text('ORGANIZED HOW?', 18.53, 20.73, 0.5, 0.1, 0.07, w=0.7, fill=YEL, **POP)]
     + [icon('question', 19.6 + 0.12 * i, 20.73, x, 0.32, 0.08, wobble=8, **POP) for i, x in enumerate((0.25, 0.5, 0.75))]
     + block('OC8', 18.01, x=0.82, y=1.25, w=0.5, keys=[{'t': 18.4, 'y': 0.92, 'ease': 'back'}],
             eye_keys=[(18.01, dict(brow='worried', look=[-0.6, -1])), (19.6, dict(mood='shock', brow='up'))], jitter=False)),
    # B3 — "The wrong picture would be eight simple ropes,"  rope diagram stamped WRONG MODEL
    (20.73, DEEP, HOLD(0.5, 0.45, 1.03), 'cut',
     [prop('rp', 'octo_rope', 20.75, 22.57, 0.5, 0.4, 0.88, [{'t': 20.75, 'y': 1.3}, {'t': 21.05, 'y': 0.4, 'ease': 'back'}], pop=False),
      text('WRONG MODEL', 20.87, 22.57, 0.5, 0.42, 0.09, w=0.75, rot=-12, fill=RED, edge='#ffffff', **POP),
      text('8 ROPES?', 22.09, 22.57, 0.5, 0.1, 0.07, w=0.42, fill=YEL, **POP)]),
    # "each waiting for the brain to pull it."  a rope hangs down and is yanked up
    (22.57, DEEP, HOLD(0.5, 0.5, 1.04), 'cut',
     [prop('rope', 'rope', 22.6, 23.91, 0.62, -0.05, 0.07, [{'t': 22.6, 'y': -0.4}, {'t': 22.85, 'y': 0.2, 'ease': 'back'}, {'t': 23.47},
                                                          {'t': 23.7, 'y': -0.02, 'ease': 'in'}], pop=False),
      text('BRAIN PULLS?', 23.47, 23.91, 0.5, 0.15, 0.075, w=0.6, fill=YEL, **POP)]
     + block('OC8', 22.57, x=0.4, y=0.62, w=0.7, eye_keys=[(22.57, dict(look=[0.6, -1], brow='up')), (23.5, dict(mood='shock', brow='up', look=[0.6, -1]))], jitter=False)),
    # "An octopus arm contains a substantial nervous system of its own."  the arm card slides over the reaching arm
    (23.91, REEF, HOLD(0.5, 0.5, 1.04), 'cut',
     block('OC4', 23.91, eye_keys=[(23.91, dict(look=[0.8, -0.6], brow='up')), (25.4, dict(mood='happy', brow='up'))], jitter=False)
     + [prop('af', 'arm_full', 23.95, 26.65, 1.6, 0.2, 0.84, [{'t': 24.3, 'x': 0.5, 'ease': 'back'}], pop=False),
        text('ITS OWN NERVES', 25.39, 26.65, 0.5, 0.33, 0.075, w=0.72, fill=CYA, **POP)]),
    # "Across all eight arms, there are more neurons than in the animal's central brain."  two bars, no numbers (C2)
    (26.65, DEEP, HOLD(0.5, 0.45, 1.02), 'cut',
     [text('ALL 8 ARMS', 26.7, 30.01, 0.5, 0.17, 0.065, w=0.5, fill=ORA, **POP),
      png('bar_arms', 26.9, 30.01, 0.45, 0.25, 0.66, **{'in': 'slide_left', 'in_dur': 0.5}),
      text('CENTRAL BRAIN', 28.89, 30.01, 0.5, 0.36, 0.065, w=0.6, fill=BLU, **POP),
      png('bar_brain', 29.25, 30.01, 0.305, 0.44, 0.37, **{'in': 'slide_left', 'in_dur': 0.35}),
      text('MORE NEURONS', 28.2, 30.01, 0.5, 0.08, 0.075, w=0.66, fill=YEL, **POP)]
     + block('OC7', 26.65, x=0.5, y=0.8, w=0.55, eye_keys=[(26.65, dict(look=[0, -1], brow='up')), (28.2, dict(mood='shock', brow='up'))], jitter=False)),
    # B4 — "Researchers at the University of Chicago described another important detail:"
    (30.01, SC0, FT((0.5, 0.42, 1.0), (0.5, 0.4, 1.06)), 'cut',
     [text('UNIVERSITY OF CHICAGO', 30.5, 31.29, 0.5, 0.1, 0.055, w=0.86, fill=YEL, **POP)]),
    (31.29, SCB, FT((0.5, 0.38, 1.1), (0.5, 0.36, 1.16)), 'cut',
     [text('IMPORTANT DETAIL', 31.99, 32.91, 0.5, 0.1, 0.065, w=0.76, fill=YEL, **POP), icon('spark', 32.0, 32.91, 0.72, 0.18, 0.08, **POP)]),
    # "the circuitry controlling the arms is segmented."  segments light up one after another
    (32.91, DEEP, HOLD(0.5, 0.42, 1.03), 'cut',
     swap('sg', [f'arm_seg_{k}' for k in range(5)], 32.95, 34.95, 0.5, 0.35, 0.84, per=0.38)
     + [text('SEGMENTED', 34.19, 34.95, 0.5, 0.17, 0.09, w=0.6, fill=ORA, **POP)]
     + block('OC0', 32.91, x=0.5, y=0.8, w=0.55, eye_keys=[(32.91, dict(look=[0, -1], brow='up')), (34.2, dict(mood='happy', brow='up'))], jitter=False)),
    # "Rather than treating an arm as one featureless unit,"
    (34.95, DEEP, HOLD(0.5, 0.42, 1.03), 'cut',
     [prop('ap', 'arm_plain', 35.0, 37.05, 0.5, 0.35, 0.84), text('ONE PLAIN UNIT?', 36.15, 37.05, 0.5, 0.17, 0.075, w=0.72, fill=WHT, **POP),
      icon('x', 36.6, 37.05, 0.5, 0.35, 0.36, **POP)]),
    # "the arrangement helps provide control along the arm and across its many suckers."
    (37.05, DEEP, HOLD(0.5, 0.42, 1.04), 'cut',
     swap('pl', [f'arm_pulse_{k}' for k in range(4)], 37.1, 40.53, 0.5, 0.35, 0.84, per=0.36)
     + [text('ALONG THE ARM', 38.3, 40.53, 0.5, 0.17, 0.075, w=0.66, fill=CYA, texts=[[39.2, 'ACROSS SUCKERS']], **POP)]
     + block('OC4', 37.05, x=0.5, y=0.8, w=0.55, eye_keys=[(37.05, dict(look=[0, -1], brow='up')), (39.25, dict(mood='happy', brow='up'))], jitter=False)),
    # B5 — "That doesn't mean eight tiny people are arguing inside the octopus."  eight bubbles shout, crossed out
    (40.53, REEF, HOLD(0.5, 0.5, 1.04), 'cut',
     block('OC0', 40.53, eye_keys=[(40.53, dict(look=[0, 0], brow='up')), (41.5, dict(brow='angry', look=[0.4, -0.4])), (42.7, dict(brow='smug', open=0.6, low=0.2))], jitter=False)
     + [bubble('!!', 41.5 + 0.08 * i, 42.7, x, max(0.16, y - 0.06), 0.17, kind='speech', tail='bl' if x > 0.5 else 'br') for i, (x, y) in enumerate(TIPS)]
     + [icon('x', 42.7, 43.17, 0.5, 0.45, 0.6, **POP), text('NOPE', 42.72, 43.17, 0.5, 0.15, 0.1, w=0.4, fill=RED, **POP)]),
    # "A local nervous circuit isn't a separate personality."  two cards, the second crossed out
    (43.17, DEEP, HOLD(0.5, 0.45, 1.02), 'cut',
     [prop('cl', 'card_local', 43.27, 45.45, 0.5, 0.24, 0.66), icon('check', 43.9, 45.45, 0.82, 0.18, 0.1, **POP),
      prop('cn', 'card_nine', 44.4, 45.45, 0.5, 0.52, 0.78), icon('x', 44.65, 45.45, 0.5, 0.52, 0.5, **POP)]),
    # "And counting where the neurons are doesn't tell us"  the scientist counts with a clicker, worried
    (45.45, SCC, FT((0.5, 0.42, 1.0), (0.5, 0.42, 1.08)), 'cut',
     [png('tally', 45.55, 47.39, 0.68, 0.62, 0.17, **POP, keys=[{'t': 45.6 + 0.3 * i, 'rot': (-10 if i % 2 else 10)} for i in range(6)]),
      text('COUNTING...', 45.6, 47.39, 0.5, 0.1, 0.07, w=0.56, fill=WHT, **POP)]),
    # "that each arm has its own private thoughts, plans, or version of consciousness."
    (47.39, 'art/OC3', FT((0.5, 0.45, 1.05), (0.5, 0.45, 1.14)), 'cut', [
        eyes('OC3', [(47.39, dict(look=[0.6, -0.8], brow='up')), (48.33, dict(look=[-0.6, -0.8], brow='worried')), (49.8, dict(brow='angry', look=[0, 0]))], jitter=False),
        bubble('THOUGHTS?', 48.33, 50.31, 0.5, 0.2, 0.62, texts=[[48.87, 'PLANS?'], [49.75, 'CONSCIOUSNESS?']]),
        icon('x', 49.95, 50.31, 0.5, 0.2, 0.36, **POP)]),
    # B6 — "Return to our imaginary office and replace the single endless queue"  notes queue up, dispenser, crossed out
    (50.31, OFF, HOLD(0.5, 0.55, 1.04), 'cut',
     block('OC6', 50.31, x=0.32, y=0.5, w=0.62, eye_keys=[(50.31, dict(look=[1, 0.3], brow='up')), (52.1, dict(brow='worried', look=[1, 0.4]))], jitter=False)
     + [prop('desk3', 'desk', 50.31, 53.35, 0.32, 0.7, 0.6, pop=False), prop('dsp', 'dispenser', 52.1, 53.35, 0.8, 0.52, 0.22)]
     + [png('note', 51.0 + 0.09 * i, 53.35, 0.5 + 0.045 * i, 0.64 - 0.012 * i, 0.08, rot=-8 + 5 * (i % 3), **POP) for i in range(7)]
     + [text('ONE QUEUE', 51.7, 53.35, 0.5, 0.22, 0.08, w=0.55, fill=YEL, **POP), icon('x', 52.67, 53.35, 0.65, 0.6, 0.35, **POP)]),
    # "with a network of control stations."
    (53.35, DEEP, HOLD(0.5, 0.42, 1.03), 'cut',
     swap('nt', [f'octo_net_{k}' for k in range(4)], 53.4, 54.51, 0.5, 0.4, 0.9, per=0.37)
     + [text('NETWORK', 53.38, 54.51, 0.5, 0.1, 0.09, w=0.5, fill=CYA, **POP)]),
    # "It's still just a visual analogy."
    (54.51, SCB, FT((0.5, 0.4, 1.06), (0.5, 0.38, 1.12)), 'cut',
     [text('JUST AN ANALOGY', 55.09, 55.87, 0.5, 0.1, 0.065, w=0.76, fill=YEL, **POP)]),
    # "But it captures the important shift:"
    (55.87, 'art/OC3', FT((0.5, 0.42, 1.14), (0.5, 0.45, 1.04), 'out'), 'cut', [
        eyes('OC3', [(55.87, dict(look=[0, 0], brow='up')), (56.6, dict(mood='happy', brow='up'))], jitter=False),
        text('THE SHIFT', 56.6, 57.19, 0.5, 0.56, 0.1, w=0.5, fill=ORA, **POP), icon('spark', 56.65, 57.19, 0.78, 0.2, 0.09, **POP)]),
    # "the animal's control machinery extends through the arms instead of being confined to the center."
    (57.19, DEEP, HOLD(0.5, 0.42, 1.03), 'cut',
     [prop(f'gl{k}', f'octo_glow_{k}', 57.2 + 0.4 * k, 57.6 + 0.4 * k if k < 3 else 61.37, 0.5, 0.4, 0.9, pop=(k == 0)) for k in range(4)]
     + [text('THROUGH THE ARMS', 58.8, 61.37, 0.5, 0.1, 0.075, w=0.8, fill=CYA, texts=[[60.25, 'NOT JUST THE CENTER']], **POP),
        prop('cc', 'circle_red', 60.25, 61.37, 0.5, 0.38, 0.32)]),
    # B7 — "Now watch the whole octopus again."
] + crawl(61.37, 62.83) + [
    # "The interesting part isn't a collection of miniature minds."
    (62.83, 'art/OC3', FT((0.5, 0.45, 1.04), (0.5, 0.45, 1.12)), 'cut', [
        eyes('OC3', [(62.83, dict(look=[0.5, -0.5], brow='up')), (64.5, dict(brow='smug', open=0.6, low=0.2))], jitter=False),
        text('MINI MINDS?', 63.8, 64.99, 0.5, 0.56, 0.09, w=0.6, fill=WHT, **POP), icon('x', 64.5, 64.99, 0.5, 0.56, 0.35, **POP)]),
    # "It's the organization of one animal."  rises proudly
    (64.99, DEEP, HOLD(0.5, 0.5, 1.03), 'cut',
     block('OC7', 64.99, y=1.0, keys=[{'t': 65.35, 'y': 0.5, 'ease': 'back'}], eye_keys=[(64.99, dict(look=[0, 0], brow='up')), (66.0, dict(mood='happy', brow='up'))], jitter=False)
     + [text('ONE ANIMAL', 66.0, 66.67, 0.5, 0.15, 0.09, w=0.6, fill=ORA, **POP)]),
    # "Eight busy arms don't need eight tiny personalities; they need a nervous system built to share the control work."  final hold
    (66.67, DEEP, FT((0.5, 0.5, 1.0), (0.5, 0.5, 1.06)), 'cut',
     block('OC7', 66.67, x=0.36, y=0.66, w=0.78, eye_keys=[(66.67, dict(mood='happy', brow='up')), (68.0, dict(brow='smug', open=0.6, low=0.2, look=[1, -0.4])),
                                                    (70.3, dict(mood='happy', brow='up'))], jitter=False)
     + swap('nf', [f'octo_net_{k}' for k in range(4)], 66.8, END, 0.66, 0.31, 0.6, per=0.3)
     + [text('SHARED CONTROL', 69.55, END, 0.5, 0.12, 0.075, w=0.72, fill=CYA, **POP)]),
]

SFX =[S(0.0, 'sx_bubbles', -17), S(0.28, 'sx_plop', -13), S(0.6, 'sx_click', -15), S(1.4, 'sx_wobble', -16), S(1.9, 'sx_boing', -14),
       S(2.37, 'sx_swim', -14), S(3.57, 'sx_twinkle', -15), S(5.49, 'sx_click', -15), S(5.79, 'sx_click', -16), S(6.94, 'sx_plop', -15),
       S(7.73, 'sx_plop', -15), S(9.43, 'sx_shrink', -13), S(10.0, 'sx_boing', -14), S(10.47, 'sx_arrow', -15), S(11.25, 'sx_stamp', -12),
       S(12.15, 'sx_paper', -13), S(12.35, 'sx_bell', -17), S(12.7, 'sx_paper', -14), S(13.2, 'sx_paper', -14), S(14.0, 'sx_grab', -13),
       S(14.5, 'sx_bend', -13), S(15.0, 'sx_dial', -13), S(16.05, 'sx_wobble', -14), S(17.3, 'sx_plop', -15), S(18.05, 'sx_arrow', -16),
       S(19.6, 'sx_boing', -16), S(20.75, 'sx_swim', -16), S(20.87, 'sx_stamp', -11), S(22.62, 'sx_rope', -14), S(23.47, 'sx_rope', -12),
       S(23.95, 'sx_arrow', -15), S(25.39, 'sx_neuro', -15), S(26.9, 'sx_tape', -14), S(28.2, 'sx_twinkle', -16), S(29.25, 'sx_tape', -15),
       S(30.5, 'sx_paper', -16), S(31.29, 'sx_plop', -16), S(32.95, 'sx_neuro', -15), S(34.19, 'sx_node', -14), S(35.0, 'sx_arrow', -16),
       S(36.6, 'sx_buzzer', -15), S(37.1, 'sx_neuro', -16), S(38.3, 'sx_node', -15), S(39.2, 'sx_node', -15), S(41.5, 'sx_bubbles', -14),
       S(42.7, 'sx_buzzer', -13), S(43.27, 'sx_plop', -15), S(43.9, 'sx_twinkle', -15), S(44.4, 'sx_plop', -15), S(44.65, 'sx_buzzer', -13),
       S(45.6, 'sx_click', -14), S(45.9, 'sx_click', -15), S(46.2, 'sx_click', -15), S(46.5, 'sx_click', -15), S(48.33, 'sx_plop', -16),
       S(48.87, 'sx_plop', -16), S(49.75, 'sx_plop', -16), S(49.95, 'sx_buzzer', -14), S(51.0, 'sx_paper', -14), S(52.1, 'sx_dial', -14),
       S(52.67, 'sx_buzzer', -14), S(53.4, 'sx_node', -14), S(55.09, 'sx_stamp', -14), S(56.6, 'sx_twinkle', -15), S(57.2, 'sx_neuro', -15),
       S(58.8, 'sx_node', -15), S(60.25, 'sx_plop', -15), S(61.37, 'sx_swim', -15), S(63.8, 'sx_plop', -16), S(64.5, 'sx_buzzer', -14),
       S(64.99, 'sx_bubbles', -15), S(65.35, 'sx_boing', -15), S(66.0, 'sx_twinkle', -15), S(66.8, 'sx_node', -16), S(69.55, 'sx_twinkle', -14)]
KICKS = [20.87]   # one impact kick (more kicks pushed QA handheld_jitter over the gate)

finish(SHOTS, END, SFX, kicks=KICKS, keep=(66.67,))   # channel build settings: reframes, soft attack, soft kick, grade
