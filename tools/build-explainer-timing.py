#!/usr/bin/env python3
"""Timing and captions for the "Why now" explainer (why-sustainability-matters.html).

SCENES below is the single source of truth for the explainer's words. There is
no voice-over: the captions are the on-screen narration, so each line is given
as long as it takes to read it. Running this:

  1. times every line from its length (the longer of the English and French
     versions, so one set of cue times works in both languages),
  2. writes js/explainer-timing.js (scene lengths, cue times, captions) and
     bumps its ?v= in the page,
  3. checks that every data-at / data-out / data-fx cue in the page names a
     line that exists *in the same scene* and lands inside that scene, that
     camera keys (data-cam) are well formed, that every scene has a data-enter,
     and that every data-sfx sits on a data-at anchor and names a sound defined
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
CPS = 22              # characters per second the slot is sized for
BASE_MS = 250         # plus a beat to notice the new line (and for the words to rise in)
MIN_MS = 850
DEFAULT_AFTER = 200   # ms of air after a line unless the line says otherwise
ENTERS = ('open', 'wipe', 'cut')  # how each scene arrives (data-enter on .xv-scene)
CAM_SCALE = (1.0, 1.06)           # camera keys stay this close to the canvas

# lead: ms between the scene cutting in and its first line (room for the
# transition). Each line: id (what the page's cues refer to), en / fr, and
# optional after (ms of air after the line; the last line's is the scene tail).
SCENES = [
    {'lead': 450, 'lines': [
        {'id': 'v1a', 'en': 'Ten years ago, sustainability reporting was a nice extra.',
         'fr': 'Il y a dix ans, le reporting de durabilité était un petit plus.', 'after': 200},
        {'id': 'v1b', 'en': 'Today, it’s *expected*.', 'fr': 'Aujourd’hui, il est *attendu*.', 'after': 600},
        {'id': 'v1c', 'en': 'In 2025, *22,000+ companies* reported to CDP.',
         'fr': 'En 2025, *plus de 22 000 entreprises* ont répondu au CDP.', 'after': 150},
        {'id': 'v1d', 'en': 'Together, they’re worth *more than half* the world’s stock market.',
         'fr': 'Ensemble, elles pèsent *plus de la moitié* de la bourse mondiale.', 'after': 700},
    ]},
    {'lead': 450, 'lines': [
        {'id': 'v2a', 'en': 'Yes, it’s about the planet and its people.',
         'fr': 'Bien sûr, il s’agit de la planète et de ses habitants.', 'after': 200},
        {'id': 'v2b', 'en': 'But the real reason is *closer to home*.',
         'fr': 'Mais la vraie raison est *plus proche de vous*.', 'after': 700},
    ]},
    {'lead': 250, 'lines': [
        {'id': 'v3a', 'en': '*Your customers.*', 'fr': '*Vos clients.*', 'after': 250},
        {'id': 'v3b', 'en': 'Whether you sell to businesses or to consumers,',
         'fr': 'Que vous vendiez à des entreprises ou à des particuliers,', 'after': 100},
        {'id': 'v3c', 'en': 'they compare you with a *greener competitor*.',
         'fr': 'ils vous comparent à un *concurrent plus durable*.', 'after': 700},
        {'id': 'v3d', 'en': 'EcoVadis already rates *175,000+ companies*.',
         'fr': 'EcoVadis note déjà *plus de 175 000 entreprises*.', 'after': 700},
    ]},
    {'lead': 450, 'lines': [
        {'id': 'v4a', 'en': 'Then Europe made it *law*.', 'fr': 'Puis l’Europe en a fait une *loi*.', 'after': 450},
        {'id': 'v4b', 'en': 'Under the *CSRD*, the largest companies must now report in detail.',
         'fr': 'Avec la *CSRD*, les plus grandes entreprises doivent tout publier en détail.', 'after': 300},
        {'id': 'v4c', 'en': 'To do that, they need data from their suppliers.',
         'fr': 'Pour cela, elles ont besoin des données de leurs fournisseurs.', 'after': 200},
        {'id': 'v4d', 'en': 'That means *you*.', 'fr': 'C’est-à-dire *vous*.', 'after': 600},
        {'id': 'v4e', 'en': 'Being transparent isn’t enough.', 'fr': 'La transparence ne suffit pas.', 'after': 150},
        {'id': 'v4f', 'en': 'You have to show you’re *improving*,', 'fr': 'Il faut montrer que vous *progressez*,', 'after': 100},
        {'id': 'v4g', 'en': 'on environment, social and governance.',
         'fr': 'sur l’environnement, le social et la gouvernance.', 'after': 700},
    ]},
    {'lead': 450, 'lines': [
        {'id': 'v5a', 'en': 'The good news? Start early and it’s *easier than it looks*.',
         'fr': 'La bonne nouvelle ? En commençant tôt, c’est *plus simple qu’il n’y paraît*.', 'after': 500},
        {'id': 'v5b', 'en': 'Measure.', 'fr': 'Mesurer.', 'after': 120},
        {'id': 'v5c', 'en': 'Decide.', 'fr': 'Décider.', 'after': 120},
        {'id': 'v5d', 'en': 'Disclose.', 'fr': 'Publier.', 'after': 120},
        {'id': 'v5e', 'en': 'Act.', 'fr': 'Agir.', 'after': 200},
        {'id': 'v5f', 'en': '*One step at a time.*', 'fr': '*Une étape à la fois.*', 'after': 700},
    ]},
    {'lead': 450, 'lines': [
        {'id': 'v6a', 'en': 'Ready to start? The free resources are just below.',
         'fr': 'Prêt à commencer ? Les ressources gratuites sont juste en dessous.', 'after': 250},
        {'id': 'v6b', 'en': 'Or *write to me* today.', 'fr': 'Ou *écrivez-moi* dès aujourd’hui.', 'after': 1000},
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
    scene_of = {line['id']: i for i, scene in enumerate(SCENES) for line in scene['lines']}
    return scene_of, cues, scenes


class CueCheck(HTMLParser):
    """Walks the explainer markup, tracking which scene each cue sits in.

    Checks, per element: every data-at / data-out / data-fx names a line of its
    own scene and lands inside that scene (0..dur ms); data-cam keys are well
    formed and sit on an element with data-at; data-sfx sits on a data-at
    anchor (never on a data-fx one-shot) and names a sound in js/explainer.js;
    and every scene says how it arrives (data-enter)."""

    def __init__(self, scene_of, cues, scenes, sounds):
        super().__init__()
        self.scene_of, self.cues, self.scenes, self.sounds = scene_of, cues, scenes, sounds
        self.scene, self.errors = -1, []

    def err(self, msg):
        self.errors.append(f'{msg} (line {self.getpos()[0]})')

    def local(self, key, value):
        """ms into the current scene for a cue value, or None after reporting why not"""
        if re.fullmatch(r'\d+', value):
            return int(value)
        m = CUE.match(value)
        if not m or m.group(1) not in self.scene_of:
            self.err(f'{key}="{value}" names no line')
            return None
        if self.scene_of[m.group(1)] != self.scene:
            self.err(f'{key}="{value}" is in scene {self.scene + 1} but its line is in scene '
                     f'{self.scene_of[m.group(1)] + 1}')
            return None
        return self.cues[m.group(1)] + int(m.group(2) or 0) - self.scenes[self.scene]['start']

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'xv-scene' in (a.get('class') or '').split():
            self.scene += 1
            enter = a.get('data-enter')
            if enter not in ENTERS:
                self.err(f'scene {self.scene + 1} needs data-enter="{"|".join(ENTERS)}", has {enter!r}')
            elif (enter == 'open') != (self.scene == 0):
                self.err(f'scene {self.scene + 1}: only scene 1 may (and must) be data-enter="open"')
        for key in ('data-at', 'data-out', 'data-fx'):
            value = a.get(key)
            if value is None:
                continue
            if self.scene < 0:
                self.err(f'{key}="{value}" sits outside any scene')
                continue
            ms = self.local(key, value)
            if ms is not None and not 0 <= ms <= self.scenes[self.scene]['dur']:
                self.err(f'{key}="{value}" lands at {ms} ms, outside scene {self.scene + 1} '
                         f'(0..{self.scenes[self.scene]["dur"]} ms)')
        if 'data-at' in a and 'data-fx' in a:
            self.err('an element carries both data-at and data-fx: nest them instead')
        cam = a.get('data-cam')
        if cam is not None:
            f = cam.split()
            rest = f[3:]
            if rest and rest[-1] == 'lin':
                rest = rest[:-1]
            ok = 3 <= len(f) and len(rest) <= 1 and all(re.fullmatch(r'\d+', v) for v in rest)
            try:
                nums = [float(v) for v in f[:3]]
            except ValueError:
                ok = False
            if not ok:
                self.err(f'data-cam="{cam}" should be "x y scale [ms] [lin]"')
            elif not CAM_SCALE[0] <= nums[2] <= CAM_SCALE[1]:
                self.err(f'data-cam="{cam}": scale must stay within {CAM_SCALE[0]}..{CAM_SCALE[1]}')
            if 'data-at' not in a:
                self.err(f'data-cam="{cam}" needs a data-at saying when the move starts')
        sfx = a.get('data-sfx')
        if sfx is not None:
            if sfx not in self.sounds:
                self.err(f'data-sfx="{sfx}" is not a sound in js/explainer.js')
            if 'data-at' not in a:
                self.err(f'data-sfx="{sfx}" must sit on a data-at anchor (sounds never ride on data-fx)')


def check(scene_of, cues, scenes):
    html = PAGE.read_text()
    engine = ENGINE.read_text() if ENGINE.exists() else ''
    block = re.search(r'var SFX = \{(.*?)\n  \};', engine, re.S)
    sounds = set(re.findall(r'^\s{4}(\w+):', block.group(1), re.M)) if block else set()
    checker = CueCheck(scene_of, cues, scenes, sounds)
    checker.feed(html)
    if checker.scene + 1 not in (0, len(SCENES)):
        checker.errors.append(f'page has {checker.scene + 1} scenes, the script has {len(SCENES)}')
    if checker.errors:
        fail('explainer markup is out of step with the script:\n  ' + '\n  '.join(checker.errors))
    print(f'  cues checked: {checker.scene + 1} scenes, all references resolve')


if __name__ == '__main__':
    check(*build())
