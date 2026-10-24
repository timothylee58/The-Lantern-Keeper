#!/usr/bin/env python3
"""Rain & Lanterns: original 60s/96BPM fantasy loop, all sounds synthesized.

Instrument-like colours, not samples or a recreation of any traditional piece.
Run with Python + numpy. Circular placement carries every tail across the seam.
"""
from pathlib import Path
import json
import wave
import numpy as np

RATE = 24000
SECONDS = 60
N = RATE * SECONDS
BEAT = 60 / 96
rng = np.random.default_rng(20261024)
mix = np.zeros((N, 2), dtype=np.float64)


def place(samples, start, volume, pan=0, echo=True):
    indices = (int(start * RATE) + np.arange(len(samples))) % N
    gains = np.sqrt([(1 - pan) / 2, (1 + pan) / 2])
    for channel in range(2):
        np.add.at(mix[:, channel], indices, samples * volume * gains[channel])
        if echo:
            for delay, level in [(0.1875, 0.12), (0.4375, 0.06)]:
                np.add.at(mix[:, 1 - channel], (indices + int(delay * RATE)) % N,
                          samples * volume * gains[channel] * level)


def note(midi, beat, duration, volume, voice, pan=0):
    t = np.arange(int((duration + 1) * RATE)) / RATE
    f = 440 * 2 ** ((midi - 69) / 12)
    phase = 2 * np.pi * f * t
    if voice == 'bamboo':
        # Hollow, woody rattles inspired by bamboo-tube instruments.
        value = (np.sin(phase) + .22 * np.sin(2.76 * phase) * np.exp(-t * 9)
                 + .12 * np.sin(5.4 * phase) * np.exp(-t * 16))
        value *= (1 - np.exp(-t * 170)) * np.exp(-t * 7)
    elif voice == 'gong':
        value = (np.sin(phase) + .23 * np.sin(1.48 * phase) * np.exp(-t * 2)
                 + .12 * np.sin(2.08 * phase) * np.exp(-t * 4))
        value *= (1 - np.exp(-t * 80)) * np.exp(-t / .85)
    elif voice == 'pluck':
        value = sum(np.sin(phase * h) * np.exp(-t * (2.8 + h * 1.4)) / h
                    for h in range(1, 7)) * (1 - np.exp(-t * 240))
    elif voice == 'flute':
        p = phase + .025 * np.sin(2 * np.pi * 5 * t)
        value = (np.sin(p) + .09 * np.sin(2 * p) + .025 * np.sin(3 * p))
        value *= np.minimum(1, t / .09) * np.exp(-t / duration)
        value *= np.clip((duration + .2 - t) / .2, 0, 1)
    elif voice == 'mist':
        value = (np.sin(phase) + .16 * np.sin(phase * 2.003))
        value *= np.sin(np.pi * np.clip(t / (duration + 1), 0, 1)) ** 2
    else:
        value = np.sin(phase) * (1 - np.exp(-t * 60)) * np.exp(-t * 2)
    place(value, beat * BEAT, volume, pan)


def drum(beat, high=False, volume=.045):
    t = np.arange(int(.4 * RATE)) / RATE
    pitch = 150 if high else 86
    tone = np.sin(2 * np.pi * (pitch * t + 5 * (1 - np.exp(-t * 25))))
    noise = rng.normal(0, .25, len(t))
    value = (tone * np.exp(-t * 24) + noise * np.exp(-t * 65))
    value *= 1 - np.exp(-t * 900)
    place(value, beat * BEAT, volume, -.12 if high else .12, False)


# Cyclic filtered noise creates a gentle stereo rainfall bed without a hard cut.
freqs = np.fft.rfftfreq(N, 1 / RATE)
shape = (1 - np.exp(-(freqs / 400) ** 2)) / (1 + (freqs / 2500) ** 3)
time = np.arange(N) / RATE
for channel in range(2):
    rain = np.fft.irfft(np.fft.rfft(rng.normal(size=N)) * shape, n=N)
    rain /= np.std(rain)
    mix[:, channel] += rain * .006 * (1 + .14 * np.sin(2 * np.pi * time / 15))

# Original D-Dorian phrases. No traditional tuning or song is copied.
chords = [(50, 57, 60, 65), (53, 60, 64, 69), (55, 62, 65, 71), (50, 57, 62, 64)]
phrases = [
    [(0, 74), (1.5, 77), (2, 79), (3.25, 81)],
    [(.5, 84), (1.5, 81), (2.5, 79)],
    [(0, 79), (1.25, 83), (2.5, 81), (3.25, 77)],
    [(.5, 76), (1.5, 74), (3, 69)],
    [(0, 77), (1, 79), (2.5, 81), (3.25, 84)],
    [(.5, 86), (1.5, 84), (2.5, 81)],
    [(0, 83), (1.5, 81), (2.5, 79)],
    [(.5, 77), (1.5, 76), (2.5, 74)],
]
for bar in range(24):
    b = bar * 4
    chord = chords[bar % 4]
    lively = 4 <= bar < 20
    for beat, tone in zip([0, 1.5, 2, 3.5], [chord[0], chord[2], chord[1], chord[3]]):
        note(tone + 12, b + beat, .7, .055, 'pluck', -.30)
    # Interlocking bamboo and small gong colours answer across the stereo field.
    for beat, tone in zip([.5, 1.75, 2.75], [chord[2], chord[3], chord[1]]):
        note(tone + 12, b + beat, .6, .048 if lively else .027, 'bamboo', .35)
    if bar % 2 == 0:
        note(chord[0], b, 2.2, .035, 'gong', -.15)
    if lively:
        for beat in [0, 2]:
            drum(b + beat, volume=.048)
        for beat in [1, 2.75, 3.5]:
            drum(b + beat, True, .026)
    else:
        drum(b, volume=.025)
    if 2 <= bar < 22:
        for beat, tone in phrases[(bar - 2) % 8]:
            note(tone, b + beat, .48 if beat > 2 else .7, .052, 'flute', .10)
    if bar % 4 == 3:
        for beat, tone in [(1.75, 81), (2.5, 77), (3.25, 74)]:
            note(tone, b + beat, 1.1, .032, 'gong', -.4)
    # Quiet, slow-moving mist supplies the eerie colour, never a sudden sting.
    if bar % 4 == 0:
        note(62, b + .5, 5, .009, 'mist', -.5)
        note(69, b + 2, 4, .006, 'mist', .5)

mix -= mix.mean(axis=0)
gain = .62 / np.max(np.abs(mix))
mix *= gain
pcm = np.rint(np.clip(mix, -1, 1) * 32767).astype('<i2')
path = Path(__file__).resolve().parents[1] / 'public/audio/rain-and-lanterns.wav'
with wave.open(str(path), 'wb') as f:
    f.setnchannels(2)
    f.setsampwidth(2)
    f.setframerate(RATE)
    f.writeframes(pcm.tobytes())
print(json.dumps({'file': str(path), 'duration': SECONDS, 'bpm': 96,
                  'peak_dbfs': round(20 * np.log10(np.max(np.abs(mix))), 2),
                  'rms_dbfs': round(20 * np.log10(np.sqrt(np.mean(mix ** 2))), 2),
                  'clipped_samples': int(np.sum(np.abs(mix) >= 1)),
                  'seam_delta': np.abs(mix[0] - mix[-1]).tolist()}))
