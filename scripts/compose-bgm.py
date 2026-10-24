#!/usr/bin/env python3
"""Original 48-second looping fantasy score; no sampled cultural recordings."""
import math, array, wave, random
from pathlib import Path
RATE=32000; LENGTH=48; N=RATE*LENGTH
left=array.array('f',[0])*N;right=array.array('f',[0])*N
rng=random.Random(41)
def note(midi,start,duration,volume,voice='pluck',pan=0):
 freq=440*2**((midi-69)/12); count=int((duration+1.8)*RATE); offset=int(start*RATE)
 lp=math.sqrt((1-pan)/2);rp=math.sqrt((1+pan)/2)
 for i in range(count):
  t=i/RATE
  if voice=='pad':
   env=min(1,t/.6)*min(1,max(0,(duration+1.8-t)/1.8))
   value=(math.sin(2*math.pi*freq*t)+.17*math.sin(2*math.pi*freq*2*t))*.5*env
  elif voice=='flute':
   env=min(1,t/.12)*math.exp(-t/(duration*.9))*min(1,max(0,(duration+.6-t)/.6))
   phase=2*math.pi*freq*t+.013*math.sin(2*math.pi*4.8*t)
   value=(math.sin(phase)+.12*math.sin(phase*2)+.04*math.sin(phase*3))*env
  else:
   env=(1-math.exp(-t*95))*math.exp(-t/(1.2 if voice=='bell' else .5))
   value=(math.sin(2*math.pi*freq*t)+.32*math.sin(2*math.pi*freq*2*t)*math.exp(-t*3)+.1*math.sin(2*math.pi*freq*3*t)*math.exp(-t*6))*env
  value*=volume
  index=(offset+i)%N;left[index]+=value*lp;right[index]+=value*rp
  # Quiet, circular delay makes the loop seam carry its natural reverb tail.
  echo=(index+int(RATE*.375))%N;left[echo]+=value*rp*.16;right[echo]+=value*lp*.16
chords=[(48,55,60,64),(45,52,57,60),(41,48,53,57),(43,50,55,62)]*4
melodies=[ [72,None,76,79],[81,79,76,None],[77,None,76,72],[74,79,74,None],
 [72,76,None,79],[81,None,84,81],[79,77,76,None],[74,None,72,None],
 [76,None,79,84],[81,79,76,None],[77,81,None,79],[74,None,79,74],
 [76,79,84,None],[81,None,79,76],[77,76,72,None],[74,None,None,None] ]
for bar,chord in enumerate(chords):
 start=bar*3
 for tone in chord[:3]:note(tone,start,2.8,.025,'pad',-.2)
 for beat,tone in enumerate([chord[0]+12,chord[2]+12,chord[1]+12,chord[3]+12]):note(tone,start+beat*.75,1.1,.07,'pluck',-.35 if beat%2 else .35)
 for beat,tone in enumerate(melodies[bar]):
  if tone is not None:note(tone,start+beat*.75,.9 if beat<3 else 1.4,.09,'flute',.12)
 if bar%4==0:note(chord[2]+24,start,3,.04,'bell',-.5)
peak=max(max(abs(v) for v in left),max(abs(v) for v in right));gain=.72/max(peak,1e-6)
output=array.array('h')
for l,r in zip(left,right):output.extend([int(max(-1,min(1,l*gain))*32767),int(max(-1,min(1,r*gain))*32767)])
path=Path('dist/assets/lantern-after-rain.wav')
with wave.open(str(path),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(RATE);f.writeframes(output.tobytes())
print('Original 48s stereo score; peak normalized to -2.9 dBFS; cyclic note and reverb tails.')
