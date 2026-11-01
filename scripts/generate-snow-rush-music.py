"""Generate an original, gentle 32-second winter-sport loop, without samples."""
import math
import struct
import wave

RATE = 22050
DURATION = 32
BEAT = .5  # 120 BPM
CHORDS = [(48, 52, 55), (43, 47, 50), (45, 48, 52), (41, 45, 48)]
MELODY = [72, 76, 79, 76, 74, 71, 67, 71, 72, 76, 81, 79, 77, 76, 74, 72,
          76, 79, 84, 79, 74, 71, 74, 79, 81, 76, 72, 76, 77, 74, 71, 74]

def note(midi, age, decay):
    frequency = 440 * 2 ** ((midi - 69) / 12)
    envelope = min(1, age / .018) * math.exp(-decay * age)
    return envelope * (math.sin(2 * math.pi * frequency * age) + .18 * math.sin(4 * math.pi * frequency * age))

with wave.open('/tmp/game-lab-snow-rush.wav', 'wb') as out:
    out.setparams((1, 2, RATE, 0, 'NONE', 'not compressed'))
    data = bytearray()
    for i in range(RATE * DURATION):
        t = i / RATE
        beat = int(t / BEAT)
        age = t - beat * BEAT
        chord = CHORDS[(beat // 4) % len(CHORDS)]
        sample = .11 * note(MELODY[beat % len(MELODY)], age, 4.2)
        sample += .045 * note(chord[beat % 3] + 12, age, 3.5)
        if beat % 2 == 0:
            sample += .07 * note(chord[0] - 12, age, 3)
        sample *= max(0, min(1, t / .12, (DURATION - t) / .4))
        data.extend(struct.pack('<h', max(-32767, min(32767, int(sample * 32767)))))
    out.writeframes(data)
