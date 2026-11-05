"""{ID} diagrams / cards — our own PIL schematics, accurate to brief.md claims and conditions (run by studio build / overlays).
Reference: examples/ATE01-004-octopus/make_overlays.py (top-down schematic, side-view arm, bars, cards)."""
from studio.diagrams import *   # noqa: F401,F403

if __name__ == '__main__':
    # save(text_card(['LOCAL', 'CIRCUITS'], (20, 150, 120)), 'card_local')
    # save(bar((255, 140, 40), W=1000), 'bar_a'); save(bar((60, 140, 255), W=560), 'bar_b')   # same height, no numbers
    save(circle_red(), 'circle_red'); save(arrow(), 'arrow_cyan')
    print('overlays written')
