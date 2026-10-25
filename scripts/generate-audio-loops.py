"""Create quiet 32-second loops using original arrangements and Kenney CC0 steel jingle samples.

Requires ffmpeg and the Kenney Music Jingles ZIP downloaded from
https://kenney.nl/assets/music-jingles. Run manually; committed outputs are used at runtime.
"""
from array import array
import math
from pathlib import Path
import random
import struct
import subprocess
import sys
import wave

RATE = 22050
SECONDS = 32
COUNT = RATE * SECONDS
ROOT = Path(__file__).resolve().parents[1]
if len(sys.argv) not in (2, 3) or len(sys.argv) == 3 and sys.argv[2] != 'color':
    raise SystemExit('Usage: python3 scripts/generate-audio-loops.py <extracted Kenney ZIP>/Audio/Steel jingles [color]')
SOURCE = Path(sys.argv[1])


def decode(path: Path) -> array:
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(path), '-ac', '1', '-ar', str(RATE), '-f', 'f32le', '-'])
    samples = array('f')
    samples.frombytes(raw)
    return samples


def write_audio(name: str, samples: list[float], target: Path) -> None:
    peak = max(abs(value) for value in samples)
    gain = 0.44 / peak if peak else 0
    wav_path = target.with_suffix('.wav')
    wav_path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(wav_path), 'wb') as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, value * gain)) * 32767)) for value in samples))
    for extension, codec, rate in [('webm', 'libopus', '32k'), ('mp3', 'libmp3lame', '48k')]:
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(wav_path), '-c:a', codec, '-b:a', rate, str(target.with_suffix('.' + extension))], check=True)
    wav_path.unlink()
    print(name, [str(target.with_suffix('.' + ext).stat().st_size) for ext in ('webm', 'mp3')])


def render(name: str, chords: list[list[float]], melody: list[int], jingle: Path, target: Path) -> None:
    samples = [0.0] * COUNT
    for bar, chord in enumerate(chords):
        for frequency in chord:
            for local in range(RATE * 9):
                index = bar * RATE * 8 + local
                if index >= COUNT:
                    index -= COUNT
                t = local / RATE
                envelope = min(1.0, t / 1.0, (9 - t) / 1.0)
                envelope = max(0.0, envelope)
                samples[index] += 0.027 * envelope * (math.sin(2 * math.pi * frequency * t) + 0.18 * math.sin(4 * math.pi * frequency * t))
    for beat in range(64):
        frequency = melody[beat % len(melody)]
        start = beat * RATE // 2
        for local in range(RATE // 3):
            index = start + local
            if index >= COUNT:
                break
            t = local / RATE
            envelope = (1 - math.exp(-t * 80)) * math.exp(-t * 11)
            samples[index] += 0.048 * envelope * (math.sin(2 * math.pi * frequency * t) + 0.1 * math.sin(4 * math.pi * frequency * t))
    ornament = decode(jingle)
    for at in (7.5, 23.5):
        start = int(at * RATE)
        for local, value in enumerate(ornament):
            index = start + local
            if index >= COUNT:
                break
            edge = min(1.0, local / (RATE * 0.06), (len(ornament) - local) / (RATE * 0.1))
            samples[index] += float(value) * 0.045 * max(0.0, edge)
    for index in range(RATE // 3):
        mix = index / (RATE // 3)
        samples[COUNT - RATE // 3 + index] = samples[COUNT - RATE // 3 + index] * (1 - mix) + samples[index] * mix
    wav_path = target.with_suffix('.wav')
    wav_path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(wav_path), 'wb') as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, value * 4)) * 32767)) for value in samples))
    for extension, codec, rate in [('webm', 'libopus', '32k'), ('mp3', 'libmp3lame', '48k')]:
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(wav_path), '-c:a', codec, '-b:a', rate, str(target.with_suffix('.' + extension))], check=True)
    wav_path.unlink()
    print(name, [str(target.with_suffix('.' + ext).stat().st_size) for ext in ('webm', 'mp3')])


def render_color(jingle: Path, target: Path) -> None:
    """120 BPM, bright C-major melody, soft offbeat chords and a gentle bounce."""
    samples = [0.0] * COUNT
    # Eight four-second phrases: C–G–Am–F, then C–G–F–G resolves to C on repeat.
    phrases = [
        (130.81, [261.63, 329.63, 392.00], [523.25, 659.25, 783.99, 1046.50]),
        (98.00, [246.94, 392.00, 493.88], [493.88, 587.33, 783.99, 987.77]),
        (110.00, [261.63, 329.63, 440.00], [440.00, 523.25, 659.25, 880.00]),
        (87.31, [261.63, 349.23, 440.00], [440.00, 523.25, 698.46, 880.00]),
        (130.81, [261.63, 329.63, 392.00], [523.25, 659.25, 783.99, 1046.50]),
        (98.00, [246.94, 392.00, 493.88], [493.88, 587.33, 783.99, 987.77]),
        (87.31, [261.63, 349.23, 440.00], [440.00, 523.25, 698.46, 880.00]),
        (98.00, [246.94, 392.00, 493.88], [493.88, 587.33, 783.99, 987.77]),
    ]
    tune = [0, None, 1, 2, 3, 2, 1, None, 2, None, 1, 0, 2, 1, 0, None]

    def pluck(start: float, frequency: float, duration: float, volume: float, decay: float) -> None:
        first = int(start * RATE)
        for local in range(int(duration * RATE)):
            index = first + local
            if index >= COUNT:
                break
            t = local / RATE
            envelope = min(1.0, t * 170) * math.exp(-decay * t)
            tone = math.sin(2 * math.pi * frequency * t) + 0.3 * math.sin(4 * math.pi * frequency * t)
            samples[index] += volume * envelope * tone

    for phrase_index, (bass, chord, notes) in enumerate(phrases):
        offset = phrase_index * 4.0
        for beat in range(8):
            at = offset + beat * 0.5
            # Short bass notes and a rounded tick make the pulse lively without a loud drum.
            pluck(at, bass * (2 if beat % 4 == 2 else 1), 0.3, 0.058, 7)
            if beat % 2 == 1:
                for frequency in chord:
                    pluck(at, frequency, 0.35, 0.023, 5)
        for slot, note in enumerate(tune):
            if note is None:
                continue
            accent = 1.1 if slot in (0, 4, 8, 12) else 0.85
            pluck(offset + slot * 0.25, notes[note], 0.24, 0.055 * accent, 6)

    noise = random.Random(3025)
    for step in range(128):
        if step % 4 == 0:
            continue
        start = int(step * 0.25 * RATE)
        for local in range(int(0.045 * RATE)):
            t = local / RATE
            samples[start + local] += noise.uniform(-1, 1) * 0.006 * math.exp(-60 * t)

    ornament = decode(jingle)
    for at in (7.35, 23.35):
        start = int(at * RATE)
        for local, value in enumerate(ornament):
            index = start + local
            if index >= COUNT:
                break
            edge = min(1.0, local / (RATE * 0.06), (len(ornament) - local) / (RATE * 0.12))
            samples[index] += float(value) * 0.025 * max(0.0, edge)

    for index in range(RATE // 5):
        samples[COUNT - RATE // 5 + index] *= 1 - index / (RATE // 5 - 1)
    write_audio('color', samples, target)


if __name__ == '__main__':
    if len(sys.argv) == 2:
        render('stack', [[130.81, 164.81, 196.0], [110.0, 146.83, 196.0], [130.81, 174.61, 220.0], [98.0, 146.83, 196.0]],
               [261, 330, 392, 330, 293, 349, 392, 349], SOURCE / 'jingles_STEEL03.ogg', ROOT / 'games/perfect-stack/public/audio/stack-loop')
        render('monster', [[146.83, 174.61, 220.0], [130.81, 164.81, 196.0], [146.83, 196.0, 246.94], [130.81, 174.61, 220.0]],
               [293, 349, 440, 349, 330, 392, 493, 392], SOURCE / 'jingles_STEEL11.ogg', ROOT / 'games/monster-math/public/audio/monster-loop')
    render_color(SOURCE / 'jingles_STEEL05.ogg', ROOT / 'games/color-lab/public/audio/color-loop-v2')
