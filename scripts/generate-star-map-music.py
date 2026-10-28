"""Render an original, soft 32-second music loop for Star Map; no external samples."""
import math, wave, struct
RATE=22050
DURATION=32
notes=[('C4','E4','G4'),('A3','C4','E4'),('F3','A3','C4'),('G3','B3','D4')]
melody=['E5','G5','A5','G5','C5','E5','G5','E5','A4','C5','F5','E5','D5','G5','B4','G4']
semitones={'C':0,'D':2,'E':4,'F':5,'G':7,'A':9,'B':11}
def freq(note):
    midi=12*(int(note[1])+1)+semitones[note[0]]
    return 440*2**((midi-69)/12)
def tone(t,f,decay):
    if t<0:return 0
    env=min(1,t/.035)*math.exp(-t*decay)
    return env*(math.sin(2*math.pi*f*t)+.22*math.sin(2*math.pi*f*2*t)+.08*math.sin(2*math.pi*f*3*t))
with wave.open('/tmp/game-lab-star-map.wav','wb') as out:
    out.setparams((1,2,RATE,0,'NONE','not compressed'))
    buf=bytearray()
    for i in range(RATE*DURATION):
        t=i/RATE;bar=int(t//4); local=t%4; chord=notes[bar%4]
        sample=sum(tone(local,freq(n),.8) for n in chord)*.075
        step=int(t//2); sample+=tone(t-step*2,freq(melody[step%len(melody)]),1.5)*.12
        # Seamlessly fade into the next loop.
        fade=min(1,t/.4,(DURATION-t)/1.2);sample*=max(0,fade)
        buf.extend(struct.pack('<h',max(-32767,min(32767,int(sample*32767)))))
    out.writeframes(buf)
