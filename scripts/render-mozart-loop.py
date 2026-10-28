"""Render Mutopia K.545 MIDI into a soft 36-second loop without external samples.
MIDI transcription: Alejandro Sierra / Mutopia Project, CC BY-SA 3.0;
see knowledge/audio/source/mozart-k545-1.md for provenance and license.
"""
import math, struct, wave
from pathlib import Path

raw=Path('knowledge/audio/source/mozart-k545-1.mid').read_bytes()
assert raw[:4]==b'MThd'
header_length=struct.unpack_from('>I',raw,4)[0]
_,tracks,division=struct.unpack_from('>HHH',raw,8)
assert not division & 0x8000
pos=8+header_length
all_events=[]
def variable(data,at):
    value=0
    while True:
        byte=data[at];at+=1;value=(value<<7)|(byte&127)
        if not byte&128:return value,at
for _ in range(tracks):
    assert raw[pos:pos+4]==b'MTrk'
    length=struct.unpack_from('>I',raw,pos+4)[0];data=raw[pos+8:pos+8+length];pos+=8+length
    i=tick=0;running=None
    while i<len(data):
        delta,i=variable(data,i);tick+=delta;status=data[i]
        if status<128:
            if running is None:raise ValueError('Missing running status')
            status=running
        else:
            i+=1
            if status<240:running=status
        if status==255:
            kind=data[i];i+=1;size,i=variable(data,i);payload=data[i:i+size];i+=size
            if kind==81:all_events.append((tick,'tempo',int.from_bytes(payload,'big'),0))
        elif status in (240,247):
            size,i=variable(data,i);i+=size
        else:
            kind=status&240;count=1 if kind in (192,208) else 2
            values=data[i:i+count];i+=count
            if kind in (128,144):all_events.append((tick,'note',status&15,(values[0], values[1] if kind==144 else 0)))
all_events.sort(key=lambda x:x[0]);tempo=500000;last=0;seconds=0.;active={};notes=[]
for tick,kind,channel,value in all_events:
    seconds+=(tick-last)*tempo/(division*1_000_000);last=tick
    if kind=='tempo':tempo=channel;continue
    note,velocity=value
    key=(channel,note)
    if velocity and (key not in active):active[key]=(seconds,velocity)
    elif key in active:
        start,vel=active.pop(key);notes.append((start,seconds,note,vel))
rate=22050;duration=36;out=[0.0]*(rate*duration)
for start,end,note,velocity in notes:
    if start>=duration:continue
    frequency=440*2**((note-69)/12);stop=min(duration,end+.25,start+3)
    first=max(0,int(start*rate));last=min(len(out),int(stop*rate))
    volume=.12*velocity/127
    for i in range(first,last):
        t=i/rate-start;release=max(0,min(1,(stop-i/rate)/.22));envelope=min(1,t/.018)*math.exp(-1.15*t)*release
        out[i]+=volume*envelope*(math.sin(2*math.pi*frequency*t)+.20*math.sin(4*math.pi*frequency*t)+.05*math.sin(6*math.pi*frequency*t))
with wave.open('/tmp/game-lab-mozart-k545.wav','wb') as f:
    f.setparams((1,2,rate,0,'NONE','not compressed'));buf=bytearray()
    for i,sample in enumerate(out):
        t=i/rate;fade=max(0,min(1,t/.35,(duration-t)/1.0));buf.extend(struct.pack('<h',max(-32767,min(32767,int(sample*fade*32767)))))
    f.writeframes(buf)
