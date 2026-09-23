#!/usr/bin/env python3
"""Timing and captions for the "Why now" explainer (why-sustainability-matters.html).

SCENES below is the single source of truth for the explainer's words. There is
no voice-over: the captions are the on-screen narration, so each line is given
as long as it takes to read it. Running this:

  1. times every line from its length (the longer of the English and French
     versions, so one set of cue times works in both languages),
  2. writes js/explainer-timing.js (scene lengths, cue times, captions) and
     bumps its ?v= in the page,
  3. checks that every data-at / data-out cue in the page names a line that
     exists *in the same scene*, and that every data-sfx names a sound defined
     in js/explainer.js. Any mismatch fails the build instead of shipping an
     animation that drifts off its words.

Wrap a word in *asterisks* to highlight it in the caption. After editing a
line or a pause, just re-run:

  python3 tools/build-explainer-timing.py
"""
import hashlib
import json
import pathlib
import re
import sys
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGE = ROOT / 'why-sustainability-matters.html'
ENGINE = ROOT / 'js' / 'explainer.js'
TIMING = ROOT / 'js' / 'explainer-timing.js'

# Reading pace. A caption stays up through the pause after it, until the next
# line arrives, so the real time on screen is longer than the slot itself.
CPS = 20              # characters per second the slot is sized for
BASE_MS = 250         # plus a beat to notice the new line
MIN_MS = 900
DEFAULT_AFTER = 300   # ms of air after a line unless the line says otherwise

# lead: ms between the scene cutting in and its first line (room for the
# transition). Each line: id (what the page's cues refer to), en / fr, and
# optional after (ms of air after the line; the last line's is the scene tail).
SCENES = [
    {'lead': 650, 'lines': [
        {'id': 'v1a', 'en': 'Ten years ago, sustainability reporting was a nice extra.',
         'fr': 'Il y a dix ans, le reporting de durabilité était un petit plus.'},
        {'id': 'v1b', 'en': 'Today, it’s *expected*.', 'fr': 'Aujourd’hui, il est *attendu*.', 'after': 1400},
        {'id': 'v1c', 'en': 'In 2025, *22,000+ companies* reported to CDP.',
         'fr': 'En 2025, *plus de 22 000 entreprises* ont répondu au CDP.'},
        {'id': 'v1d', 'en': 'Together, they’re worth *more than half* the world’s stock market.',
         'fr': 'Ensemble, elles pèsent *plus de la moitié* de la bourse mondiale.', 'after': 1100},
    ]},
    {'lead': 650, 'lines': [
        {'id': 'v2a', 'en': 'Yes, it’s about the planet and its people.',
         'fr': 'Bien sûr, il s’agit de la planète et de ses habitants.', 'after': 500},
        {'id': 'v2b', 'en': 'But the real reason is *closer to home*.',
         'fr': 'Mais la vraie raison est *plus proche de vous*.', 'after': 1200},
    ]},
    {'lead': 650, 'lines': [
        {'id': 'v3a', 'en': '*Your customers.*', 'fr': '*Vos clients.*', 'after': 500},
        {'id': 'v3b', 'en': 'Whether you sell to businesses or to consumers,',
         'fr': 'Que vous vendiez à des entreprises ou à des particuliers,', 'after': 200},
        {'id': 'v3c', 'en': 'they compare you with a *greener competitor*.',
         'fr': 'ils vous comparent à un *concurrent plus durable*.', 'after': 1500},
        {'id': 'v3d', 'en': 'EcoVadis already rates *175,000+ companies*.',
         'fr': 'EcoVadis note déjà *plus de 175 000 entreprises*.', 'after': 1100},
    ]},
    {'lead': 650, 'lines': [
        {'id': 'v4a', 'en': 'Then Europe made it *law*.', 'fr': 'Puis l’Europe en a fait une *loi*.', 'after': 900},
        {'id': 'v4b', 'en': 'Under the *CSRD*, the largest companies must now report in detail.',
         'fr': 'Avec la *CSRD*, les plus grandes entreprises doivent tout publier en détail.', 'after': 700},
        {'id': 'v4c', 'en': 'To do that, they need data from their suppliers.',
         'fr': 'Pour cela, elles ont besoin des données de leurs fournisseurs.', 'after': 250},
        {'id': 'v4d', 'en': 'That means *you*.', 'fr': 'C’est-à-dire *vous*.', 'after': 1200},
        {'id': 'v4e', 'en': 'Being transparent isn’t enough.', 'fr': 'La transparence ne suffit pas.', 'after': 300},
        {'id': 'v4f', 'en': 'You have to show you’re *improving*,', 'fr': 'Il faut montrer que vous *progressez*,', 'after': 150},
        {'id': 'v4g', 'en': 'on environment, social and governance.',
         'fr': 'sur l’environnement, le social et la gouvernance.', 'after': 1400},
    ]},
    {'lead': 650, 'lines': [
        {'id': 'v5a', 'en': 'The good news? Start early and it’s *easier than it looks*.',
         'fr': 'La bonne nouvelle ? En commençant tôt, c’est *plus simple qu’il n’y paraît*.', 'after': 1100},
        {'id': 'v5b', 'en': 'Measure.', 'fr': 'Mesurer.', 'after': 250},
        {'id': 'v5c', 'en': 'Decide.', 'fr': 'Décider.', 'after': 250},
        {'id': 'v5d', 'en': 'Disclose.', 'fr': 'Publier.', 'after': 250},
        {'id': 'v5e', 'en': 'Act.', 'fr': 'Agir.', 'after': 350},
        {'id': 'v5f', 'en': '*One step at a time.*', 'fr': '*Une étape à la fois.*', 'after': 1300},
    ]},
    {'lead': 650, 'lines': [
        {'id': 'v6a', 'en': 'Ready to start? The free resources are just below.',
         'fr': 'Prêt à commencer ? Les ressources gratuites sont juste en dessous.', 'after': 400},
        {'id': 'v6b', 'en': 'Or *write to me* today.', 'fr': 'Ou *écrivez-moi* dès aujourd’hui.', 'after': 2600},
    ]},
]

CUE = re.compile(r'^([a-z]\w*?)([+-]\d+)?$', re.I)


def fail(msg):
    print('FAILED: ' + msg, file=sys.stderr)
    sys.exit(1)


def reading_ms(text):
    visible = text.replace('*', '')
    return max(MIN_MS, int(BASE_MS + len(visible) * 1000 / CPS))


def build():
    lines = [line for scene in SCENES for line in scene['lines']]
    ids = [line['id'] for line in lines]
    if len(ids) != len(set(ids)):
        fail('duplicate line id in SCENES')
    for line in lines:
        for lang in ('en', 'fr'):
            if line[lang].count('*') % 2:
                fail(f"unbalanced *highlight* in {line['id']} ({lang})")

    cues, scenes, captions = {}, [], {'en': [], 'fr': []}
    t = 0
    for index, scene in enumerate(SCENES):
        start = t
        t += scene['lead']
        rows = []
        for line in scene['lines']:
            cues[line['id']] = t
            rows.append((line, t))
            t += max(reading_ms(line['en']), reading_ms(line['fr'])) + line.get('after', DEFAULT_AFTER)
        end = t
        scenes.append({'start': start, 'dur': end - start})
        # a caption stays up until the next line (or the end of its scene)
        for k, (line, at) in enumerate(rows):
            until = rows[k + 1][1] - 60 if k + 1 < len(rows) else end - 150
            for lang in ('en', 'fr'):
                captions[lang].append({'id': line['id'], 'scene': index, 'start': at, 'end': until, 'text': line[lang]})
    total = t

    data = {'total': total, 'scenes': scenes, 'cues': cues, 'captions': captions}
    body = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    TIMING.write_text('/* Generated by tools/build-explainer-timing.py - edit the script there, not this file. */\n'
                      f'window.XV_TIMING = {body};\n')
    version = hashlib.sha1(body.encode()).hexdigest()[:8]
    html = PAGE.read_text()
    html, n = re.subn(r'js/explainer-timing\.js\?v=\w+', f'js/explainer-timing.js?v={version}', html)
    if n:
        PAGE.write_text(html)
    print(f'  {TIMING.relative_to(ROOT)}  total {total / 1000:.1f} s, {len(lines)} lines, {len(scenes)} scenes: '
          + ', '.join(f"{s['dur'] / 1000:.1f}" for s in scenes))
    return {line['id']: i for i, scene in enumerate(SCENES) for line in scene['lines']}


class CueCheck(HTMLParser):
    """Walks the explainer markup, tracking which scene each cue sits in."""

    def __init__(self, scene_of, sounds):
        super().__init__()
        self.scene_of, self.sounds = scene_of, sounds
        self.scene, self.errors = -1, []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'xv-scene' in (a.get('class') or '').split():
            self.scene += 1
        for key in ('data-at', 'data-out'):
            value = a.get(key)
            if value is None or re.fullmatch(r'-?\d+', value):
                continue
            m = CUE.match(value)
            if not m or m.group(1) not in self.scene_of:
                self.errors.append(f'{key}="{value}" names no line (line {self.getpos()[0]})')
            elif self.scene_of[m.group(1)] != self.scene:
                self.errors.append(f'{key}="{value}" is in scene {self.scene + 1} but its line is in scene '
                                   f'{self.scene_of[m.group(1)] + 1} (line {self.getpos()[0]})')
        sfx = a.get('data-sfx')
        if sfx and sfx not in self.sounds:
            self.errors.append(f'data-sfx="{sfx}" is not a sound in js/explainer.js (line {self.getpos()[0]})')


def check(scene_of):
    html = PAGE.read_text()
    engine = ENGINE.read_text() if ENGINE.exists() else ''
    block = re.search(r'var SFX = \{(.*?)\n  \};', engine, re.S)
    sounds = set(re.findall(r'^\s{4}(\w+):', block.group(1), re.M)) if block else set()
    checker = CueCheck(scene_of, sounds)
    checker.feed(html)
    if checker.scene + 1 not in (0, len(SCENES)):
        checker.errors.append(f'page has {checker.scene + 1} scenes, the script has {len(SCENES)}')
    if checker.errors:
        fail('explainer markup is out of step with the script:\n  ' + '\n  '.join(checker.errors))
    print(f'  cues checked: {checker.scene + 1} scenes, all references resolve')


if __name__ == '__main__':
    check(build())
