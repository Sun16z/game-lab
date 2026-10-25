"""Create quiet 32-second loops using original arrangements and Kenney CC0 steel jingle samples.

Requires ffmpeg and the Kenney Music Jingles ZIP downloaded from
https://kenney.nl/assets/music-jingles. Run manually; committed outputs are used at runtime.
"""
from array import array
import math
from pathlib import Path
import struct
import subprocess
import sys
import wave

RATE = 22050
SECONDS = 32
COUNT = RATE * SECONDS
ROOT = Path(__file__).resolve().parents[1]
if len(sys.argv) != 2:
    raise SystemExit('Usage: python3 scripts/generate-audio-loops.py <extracted Kenney ZIP>/Audio/Steel jingles')
SOURCE = Path(sys.argv[1])


def decode(path: Path) -> array:
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(path), '-ac', '1', '-ar', str(RATE), '-f', 'f32le', '-'])
    samples = array('f')
    samples.frombytes(raw)
    return samples


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


if __name__ == '__main__':
    render('stack', [[130.81, 164.81, 196.0], [110.0, 146.83, 196.0], [130.81, 174.61, 220.0], [98.0, 146.83, 196.0]],
           [261, 330, 392, 330, 293, 349, 392, 349], SOURCE / 'jingles_STEEL03.ogg', ROOT / 'games/perfect-stack/public/audio/stack-loop')
    render('monster', [[146.83, 174.61, 220.0], [130.81, 164.81, 196.0], [146.83, 196.0, 246.94], [130.81, 174.61, 220.0]],
           [293, 349, 440, 349, 330, 392, 493, 392], SOURCE / 'jingles_STEEL11.ogg', ROOT / 'games/monster-math/public/audio/monster-loop')
    render('color', [[130.81, 196.0, 261.63], [146.83, 196.0, 293.66], [164.81, 220.0, 329.63], [130.81, 174.61, 261.63]],
           [392, 440, 523, 440, 349, 440, 587, 440], SOURCE / 'jingles_STEEL05.ogg', ROOT / 'games/color-lab/public/audio/color-loop')
