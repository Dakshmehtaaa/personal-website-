#!/usr/bin/env python3
"""Voice-over and timing for the "Why now" explainer (why-sustainability-matters.html).

SCENES below is the single source of truth for the narration. Running this:

  1. renders every line in English and French with the macOS `say` voices,
  2. lays the lines out on one timeline. Each line gets a slot as long as the
     longer of its two readings, so both language tracks share the same cue
     times and the animation never needs a second set of timings,
  3. writes assets/audio/explainer-en.m4a and assets/audio/explainer-fr.m4a,
  4. writes js/explainer-timing.js (scene lengths, cue times, captions),
  5. checks that every data-at / data-out cue in the page names a line that
     exists *in the same scene*, and that every data-sfx names a sound defined
     in js/explainer.js. Any mismatch fails the build instead of shipping an
     animation that silently drifts off its narration.

The page reads its cue times from the generated file, so after editing a line,
a pause or a voice you only re-run this script:

  python3 tools/build-explainer-audio.py
  EN_VOICE="Jamie (Premium)" FR_VOICE="Audrey (Premium)" python3 tools/build-explainer-audio.py

Better voices: System Settings > Accessibility > Spoken Content > System voice >
Manage Voices, download a "(Premium)" voice, then pass its exact name as above
(`say -v '?'` lists what is installed).

Needs macOS (say, afconvert) and numpy.
"""
import hashlib
import json
import os
import pathlib
import re
import subprocess
import sys
import tempfile
import wave
from html.parser import HTMLParser

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGE = ROOT / 'why-sustainability-matters.html'
ENGINE = ROOT / 'js' / 'explainer.js'
AUDIO_DIR = ROOT / 'assets' / 'audio'
TIMING = ROOT / 'js' / 'explainer-timing.js'

VOICES = {'en': os.environ.get('EN_VOICE', 'Daniel'), 'fr': os.environ.get('FR_VOICE', 'Thomas')}
RATES = {'en': int(os.environ.get('EN_RATE', '182')), 'fr': int(os.environ.get('FR_RATE', '190'))}
SR = 24000            # speech only: 24 kHz mono is plenty and keeps the files small
BITRATE = 56000       # AAC, per track
DEFAULT_AFTER = 300   # ms of air after a line unless the line says otherwise

# lead: ms between the scene cutting in and its first line (room for the
# transition). Each line: id (what the page's cues refer to), en / fr (the
# caption), optional say_en / say_fr (what the voice reads, when it differs -
# numbers spelled out, acronyms dotted so they are read letter by letter),
# optional after (ms of air after the line; the last line's is the scene tail).
SCENES = [
    {'lead': 650, 'lines': [
        {'id': 'v1a', 'en': 'Ten years ago, sustainability reporting was a nice extra.',
         'fr': 'Il y a dix ans, le reporting de durabilité était un petit plus.'},
        {'id': 'v1b', 'en': 'Today, it’s becoming unavoidable.',
         'fr': 'Aujourd’hui, il devient incontournable.', 'after': 1200},
        {'id': 'v1c', 'en': 'In 2025, over 22,000 companies reported to CDP.',
         'say_en': 'In twenty twenty-five, over twenty-two thousand companies reported to C.D.P.',
         'fr': 'En 2025, plus de 22 000 entreprises ont répondu au CDP.',
         'say_fr': 'En deux mille vingt-cinq, plus de vingt-deux mille entreprises ont répondu au C.D.P.'},
        {'id': 'v1d', 'en': 'Together, they’re worth more than half the world’s stock market.',
         'fr': 'Ensemble, elles pèsent plus de la moitié de la bourse mondiale.', 'after': 900},
    ]},
    {'lead': 650, 'lines': [
        {'id': 'v2a', 'en': 'Yes, it’s about protecting the planet and its people.',
         'fr': 'Bien sûr, il s’agit de protéger la planète et ceux qui y vivent.', 'after': 400},
        {'id': 'v2b', 'en': 'But there’s a reason much closer to home.',
         'fr': 'Mais il y a une raison bien plus proche de vous.', 'after': 900},
    ]},
    {'lead': 650, 'lines': [
        {'id': 'v3a', 'en': 'Your customers.', 'fr': 'Vos clients.', 'after': 500},
        {'id': 'v3b', 'en': 'Whether you sell to businesses, or to consumers,',
         'fr': 'Que vous vendiez à des entreprises, ou à des particuliers,', 'after': 200},
        {'id': 'v3c', 'en': 'they’re comparing you with a more sustainable competitor.',
         'fr': 'ils vous comparent à un concurrent plus durable.', 'after': 1400},
        {'id': 'v3d', 'en': 'EcoVadis already rates more than 175,000 companies.',
         'say_en': 'Eco Vadis already rates more than one hundred seventy-five thousand companies.',
         'fr': 'EcoVadis note déjà plus de 175 000 entreprises.',
         'say_fr': 'Écovadis note déjà plus de cent soixante-quinze mille entreprises.', 'after': 900},
    ]},
    {'lead': 650, 'lines': [
        {'id': 'v4a', 'en': 'And then, Europe made it law.', 'fr': 'Puis l’Europe en a fait une loi.', 'after': 800},
        {'id': 'v4b', 'en': 'Under the CSRD, the largest companies must now report in detail.',
         'say_en': 'Under the C.S.R.D., the largest companies must now report in detail.',
         'fr': 'Avec la CSRD, les plus grandes entreprises doivent désormais tout publier en détail.',
         'say_fr': 'Avec la C.S.R.D., les plus grandes entreprises doivent désormais tout publier en détail.',
         'after': 800, 'after': 600},
        {'id': 'v4c', 'en': 'To do that, they need data from their suppliers.',
         'fr': 'Pour cela, elles ont besoin des données de leurs fournisseurs.', 'after': 300},
        {'id': 'v4d', 'en': 'And that means you.', 'fr': 'C’est-à-dire, vous.', 'after': 1000},
        {'id': 'v4e', 'en': 'But being transparent isn’t enough.', 'fr': 'Mais la transparence ne suffit pas.', 'after': 350},
        {'id': 'v4f', 'en': 'You have to show you’re improving,', 'fr': 'Il faut montrer que vous progressez,', 'after': 150},
        {'id': 'v4g', 'en': 'on environment, social and governance.',
         'fr': 'sur l’environnement, le social et la gouvernance.', 'after': 1200},
    ]},
    {'lead': 650, 'lines': [
        {'id': 'v5a', 'en': 'The good news? Start early, and it’s easier than it looks.',
         'fr': 'La bonne nouvelle ? En commençant tôt, c’est plus simple qu’il n’y paraît.', 'after': 1000},
        {'id': 'v5b', 'en': 'Measure.', 'fr': 'Mesurer.', 'after': 280},
        {'id': 'v5c', 'en': 'Decide.', 'fr': 'Décider.', 'after': 280},
        {'id': 'v5d', 'en': 'Disclose.', 'fr': 'Publier.', 'after': 280},
        {'id': 'v5e', 'en': 'Act.', 'fr': 'Agir.', 'after': 350},
        {'id': 'v5f', 'en': 'One step at a time.', 'fr': 'Une étape à la fois.', 'after': 1000},
    ]},
    {'lead': 650, 'lines': [
        {'id': 'v6a', 'en': 'Ready to start? Explore the free resources below.',
         'fr': 'Prêt à commencer ? Explorez les ressources gratuites ci-dessous.', 'after': 450},
        {'id': 'v6b', 'en': 'Or write to me today.', 'fr': 'Ou écrivez-moi dès aujourd’hui.', 'after': 1800},
    ]},
]

CUE = re.compile(r'^([a-z]\w*?)([+-]\d+)?$', re.I)


def fail(msg):
    print('FAILED: ' + msg, file=sys.stderr)
    sys.exit(1)


def speakable(text):
    # the voices stumble on typographic punctuation; captions keep it
    return (text.replace('’', "'").replace(' ', ' ').replace(' ', ' ')
                .replace(' ?', '?').replace(' !', '!'))


def render(text, lang, out):
    cmd = ['say', '-v', VOICES[lang], '-r', str(RATES[lang]), '--file-format=WAVE',
           f'--data-format=LEI16@{SR}', '-o', str(out), speakable(text)]
    subprocess.run(cmd, check=True)
    with wave.open(str(out)) as w:
        if w.getframerate() != SR or w.getnchannels() != 1:
            fail(f'unexpected audio format from say for {out.name}')
        pcm = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(np.float32) / 32768
    return trim(pcm)


def trim(pcm, floor_db=-45, margin_ms=25):
    """Cut the voice's own leading/trailing silence so slots measure speech, not padding."""
    loud = np.nonzero(np.abs(pcm) > 10 ** (floor_db / 20))[0]
    if not len(loud):
        fail('a line rendered as silence - is the voice installed?')
    margin = int(SR * margin_ms / 1000)
    return pcm[max(0, loud[0] - margin): loud[-1] + margin]


def level(pcm, target_db=-18.0, ceiling_db=-1.5):
    """Bring each line to the same loudness so no sentence jumps out."""
    voiced = pcm[np.abs(pcm) > 0.01]
    rms = float(np.sqrt(np.mean(voiced ** 2))) if len(voiced) else 1e-9
    out = pcm * (10 ** (target_db / 20) / max(rms, 1e-9))
    peak = float(np.max(np.abs(out)))
    ceiling = 10 ** (ceiling_db / 20)
    if peak > ceiling:
        out *= ceiling / peak
    fade = int(SR * 0.008)
    out[:fade] *= np.linspace(0, 1, fade)
    out[-fade:] *= np.linspace(1, 0, fade)
    return out


def ms(samples):
    return int(round(len(samples) * 1000 / SR))


def build():
    lines = [line for scene in SCENES for line in scene['lines']]
    ids = [line['id'] for line in lines]
    if len(ids) != len(set(ids)):
        fail('duplicate line id in SCENES')

    clips = {'en': {}, 'fr': {}}
    with tempfile.TemporaryDirectory() as tmp:
        for line in lines:
            for lang in ('en', 'fr'):
                text = line.get('say_' + lang, line[lang])
                clips[lang][line['id']] = level(render(text, lang, pathlib.Path(tmp) / f"{line['id']}-{lang}.wav"))
                print(f"  {line['id']} {lang} {ms(clips[lang][line['id']]):5d} ms")

    # timeline: both languages share every slot start
    cues, scenes, captions = {}, [], {'en': [], 'fr': []}
    t = 0
    for index, scene in enumerate(SCENES):
        start = t
        t += scene['lead']
        for line in scene['lines']:
            cues[line['id']] = t
            longest = max(ms(clips['en'][line['id']]), ms(clips['fr'][line['id']]))
            for lang in ('en', 'fr'):
                captions[lang].append({'id': line['id'], 'scene': index, 'start': t,
                                       'end': t + ms(clips[lang][line['id']]) + 250, 'text': line[lang]})
            t += longest + line.get('after', DEFAULT_AFTER)
        scenes.append({'start': start, 'dur': t - start})
    total = t

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    urls = {}
    for lang in ('en', 'fr'):
        track = np.zeros(int(total * SR / 1000) + SR // 10, dtype=np.float32)
        for line in lines:
            clip = clips[lang][line['id']]
            at = int(cues[line['id']] * SR / 1000)
            track[at:at + len(clip)] += clip
        pcm = (np.clip(track, -1, 1) * 32767).astype('<i2')
        with tempfile.TemporaryDirectory() as tmp:
            wav = pathlib.Path(tmp) / f'explainer-{lang}.wav'
            with wave.open(str(wav), 'wb') as w:
                w.setnchannels(1)
                w.setsampwidth(2)
                w.setframerate(SR)
                w.writeframes(pcm.tobytes())
            out = AUDIO_DIR / f'explainer-{lang}.m4a'
            subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', str(BITRATE), str(wav), str(out)], check=True)
        digest = hashlib.sha1(out.read_bytes()).hexdigest()[:8]
        urls[lang] = f'assets/audio/{out.name}?v={digest}'
        print(f'  {out.relative_to(ROOT)}  {out.stat().st_size // 1024} KB')

    data = {'total': total, 'scenes': scenes, 'cues': cues, 'captions': captions,
            'audio': urls, 'voices': VOICES}
    body = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    TIMING.write_text('/* Generated by tools/build-explainer-audio.py - edit the script there, not this file. */\n'
                      f'window.XV_TIMING = {body};\n')
    version = hashlib.sha1(body.encode()).hexdigest()[:8]
    html = PAGE.read_text()
    html, n = re.subn(r'js/explainer-timing\.js\?v=\w+', f'js/explainer-timing.js?v={version}', html)
    if n:
        PAGE.write_text(html)
    print(f'  {TIMING.relative_to(ROOT)}  total {total / 1000:.1f} s, {len(lines)} lines, {len(scenes)} scenes')
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
