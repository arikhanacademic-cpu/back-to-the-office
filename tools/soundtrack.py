"""Original soundtrack for the 'Back to the Office' promo: 100 bpm, A minor, 52.8 s.
Everything is synthesised from scratch with numpy/scipy (no samples)."""
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
BPM = 100
BEAT = 60 / BPM          # 0.6 s
BAR = BEAT * 4           # 2.4 s
DUR = 22 * BAR           # 52.8 s
N = int(DUR * SR) + SR * 3
rng = np.random.default_rng(1015)

def buf(): return np.zeros((N, 2))
def t_(n): return np.arange(n) / SR
def midi(m): return 440 * 2 ** ((m - 69) / 12)
def sos(kind, f, order=2): return signal.butter(order, f, btype=kind, fs=SR, output='sos')
def place(bus, x, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N: return
    x = x[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    bus[i:i + len(x), 0] += x * gain * l * 1.414
    bus[i:i + len(x), 1] += x * gain * r * 1.414

def saw(f, n, detune=0.0):
    ph = np.cumsum(np.full(n, f * (1 + detune)) / SR)
    return 2 * (ph % 1) - 1

def env(n, a, d, s=0.0, r=0.0, hold=None):
    tt = t_(n)
    e = np.minimum(1, tt / max(a, 1e-4))
    if hold is None:
        e *= np.exp(-np.maximum(0, tt - a) / max(d, 1e-4)) * (1 - s) + s
    else:
        rel = np.clip((tt - hold) / max(r, 1e-4), 0, 1)
        e *= (1 - rel)
    return e

# ───────── instruments ─────────
def kick(g=1.0):
    n = int(0.5 * SR); tt = t_(n)
    f = 45 + 95 * np.exp(-tt * 28)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7)
    click = signal.sosfilt(sos('highpass', 2000), rng.standard_normal(n)) * np.exp(-tt * 300) * 0.25
    return (x + click) * g

def clap():
    n = int(0.35 * SR); tt = t_(n)
    nz = signal.sosfilt(signal.butter(2, [900, 2600], btype='bandpass', fs=SR, output='sos'), rng.standard_normal(n))
    e = np.zeros(n)
    for k, off in enumerate([0, 0.011, 0.022]):
        i = int(off * SR); e[i:] += np.exp(-(tt[: n - i]) * (90 if k < 2 else 16))
    return nz * e * 0.5

def hat(open_=False):
    n = int((0.22 if open_ else 0.05) * SR); tt = t_(n)
    nz = signal.sosfilt(sos('highpass', 7500, 4), rng.standard_normal(n))
    return nz * np.exp(-tt * (14 if open_ else 70)) * 0.35

def bass(m, dur):
    n = int(dur * SR)
    x = saw(midi(m), n) + 0.5 * saw(midi(m - 12), n)
    x = signal.sosfilt(sos('lowpass', 520), x)
    return x * env(n, 0.005, 0.18, 0.55) * np.clip((dur - t_(n)) / 0.02, 0, 1)

def pluck(m, dur=0.28, bright=2600):
    n = int(dur * SR)
    x = saw(midi(m), n) * 0.6 + np.sign(np.sin(2 * np.pi * midi(m) * t_(n))) * 0.25
    x = signal.sosfilt(sos('lowpass', bright), x)
    return x * env(n, 0.003, 0.09)

def pad(notes, dur, cutoff=1400):
    n = int(dur * SR); x = np.zeros(n)
    for m in notes:
        for dt in (-0.006, 0, 0.0065):
            x += saw(midi(m), n, dt)
    x = signal.sosfilt(sos('lowpass', cutoff), x) / (len(notes) * 3)
    return x * env(n, 0.6, 0, hold=dur - 0.8, r=0.8)

def riser(dur):
    n = int(dur * SR); tt = t_(n)
    nz = rng.standard_normal(n); out = np.zeros(n); blk = 2048
    for i in range(0, n, blk):
        fc = 300 + 7000 * (i / n) ** 2
        out[i:i + blk] = signal.sosfilt(signal.butter(2, [fc * 0.7, fc * 1.3], btype='bandpass', fs=SR, output='sos'), nz[i:i + blk])
    tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * (tt / dur) ** 2) / SR) * 0.15
    return (out + tone) * (tt / dur) ** 2 * 0.6

def whoosh(dur=0.5):
    n = int(dur * SR); tt = t_(n)
    nz = signal.sosfilt(signal.butter(2, [600, 5000], btype='bandpass', fs=SR, output='sos'), rng.standard_normal(n))
    return nz * np.sin(np.pi * tt / dur) ** 2 * 0.35

def impact():
    n = int(2.5 * SR); tt = t_(n)
    boom = np.sin(2 * np.pi * np.cumsum(32 + 70 * np.exp(-tt * 9)) / SR) * np.exp(-tt * 2.2)
    nz = signal.sosfilt(sos('lowpass', 3000), rng.standard_normal(n)) * np.exp(-tt * 5) * 0.3
    return boom * 0.9 + nz

def tick():
    n = int(0.03 * SR)
    return np.sin(2 * np.pi * 3200 * t_(n)) * np.exp(-t_(n) * 200) * 0.25

# ───────── arrangement ─────────
drums, bassb, music, fx = buf(), buf(), buf(), buf()
# chords per 2 bars (A minor): i – VI – III – VII
PROG = [(57, [57, 60, 64, 71]), (53, [53, 57, 60, 64]), (48, [55, 60, 64, 67]), (55, [55, 59, 62, 67])]
def chord_at(bar): return PROG[(bar // 2) % 4]

kick_times = []
for bar in range(22):
    t0 = bar * BAR
    root, notes = chord_at(bar)
    intro = bar < 3
    build = bar == 3
    week = 4 <= bar < 14
    friday = bar in (12, 13)
    cards = 14 <= bar < 18
    summary = 18 <= bar < 20
    end = bar >= 20
    # pads everywhere except the end bars (handled separately)
    if not end:
        if bar % 2 == 0:
            cut = 900 if intro else (700 if friday else 1500)
            place(music, pad([n + 12 for n in notes], BAR * 2 + 0.6, cut), t0, 0.28 if intro else 0.22)
    # pulse / ticks in the intro: the clock
    if intro or summary:
        for b in range(8):
            place(fx, tick(), t0 + b * BEAT / 2, 0.5 if b % 2 == 0 else 0.25, pan=0.3 if b % 2 else -0.3)
        for b in range(4):
            place(bassb, bass(root - 12, BEAT * 0.9), t0 + b * BEAT, 0.35)
    if build:
        for b in range(4):
            place(drums, kick(0.8), t0 + b * BEAT); kick_times.append(t0 + b * BEAT)
        for s in range(16):
            place(drums, clap(), t0 + BAR * 0.5 + s * BEAT / 8, 0.12 + 0.5 * s / 16) if s >= 8 else None
        place(bassb, bass(root - 12, BAR), t0, 0.45)
    if week or cards:
        thin = friday
        for b in range(4):
            tb = t0 + b * BEAT
            if not thin or b in (0, 2):
                place(drums, kick(1.0), tb); kick_times.append(tb)
            if b in (1, 3) and not thin: place(drums, clap(), tb, 0.55)
            place(drums, hat(False), tb + BEAT / 2, 0.55 if not thin else 0.3, pan=0.25)
            if not thin:
                place(drums, hat(False), tb + BEAT / 4, 0.18, pan=-0.25)
                place(drums, hat(False), tb + 3 * BEAT / 4, 0.18, pan=-0.25)
        # driving 8th-note bass
        pat = [0, 0, 12, 0, 0, 7, 0, 10]
        for e in range(8):
            if thin and e % 2: continue
            place(bassb, bass(root - 12 + pat[e], BEAT / 2 * 0.92), t0 + e * BEAT / 2, 0.55 if not thin else 0.35)
        # 16th arpeggio pluck (offices lighting up)
        if not thin:
            arp = notes + [notes[1] + 12, notes[2] + 12, notes[3], notes[2]]
            for s in range(16):
                m = arp[s % len(arp)] + 12
                place(music, pluck(m, bright=1800 + 1400 * ((bar - 4) / 10)), t0 + s * BEAT / 4, 0.16, pan=0.35 * np.sin(s))
        else:
            for s in range(0, 16, 4):  # Friday: sparse, lights going out
                place(music, pluck(notes[0] + 24, 0.5, 1200), t0 + s * BEAT / 4, 0.12, pan=-0.3)

# section hits
place(fx, riser(BAR * 2), 7.2 - BAR * 2, 0.5)
place(fx, impact(), 7.2, 0.8)
place(fx, riser(BAR), 9.6 - BAR, 0.55)
place(fx, impact(), 9.6, 0.7)
place(fx, riser(BAR), 33.6 - BAR, 0.45)
place(fx, impact(), 33.6, 0.6)
# day changes (lower thirds)
W0, DAY = 9.6, 4.8
for d in range(5):
    place(fx, whoosh(0.45), W0 + d * DAY + 0.05, 0.6, pan=-0.4)
# card wipes
for tc in (34.1, 37.5, 40.9):
    place(fx, whoosh(0.4), tc - 0.1, 0.7, pan=0.4)
    place(fx, kick(0.6), tc + 0.1, 0.5)
place(fx, whoosh(0.5), 44.3, 0.6)
# end: big final chord + impact
place(fx, riser(BAR), 48 - BAR, 0.5)
place(fx, impact(), 48.0, 0.9)
final = pad([45, 57, 64, 67, 71, 76], BAR * 2 + 1.5, 2200)
place(music, final, 48.0, 0.5)
place(bassb, bass(33, BAR * 2), 48.0, 0.5)
for s, m in enumerate([69, 72, 76, 79, 83, 88]):
    place(music, pluck(m, 0.8, 2400), 48.0 + s * BEAT / 4, 0.13, pan=-0.5 + s * 0.2)

# ───────── mix ─────────
# sidechain: duck music + bass under kicks
duck = np.ones(N)
for kt in kick_times:
    i = int(kt * SR); n = int(0.28 * SR)
    seg = 1 - 0.5 * np.exp(-t_(min(n, N - i)) * 14)
    duck[i:i + len(seg)] = np.minimum(duck[i:i + len(seg)], seg)
music *= duck[:, None]; bassb *= duck[:, None] ** 0.6

# reverb (synthetic decaying-noise IR) on music + fx
ir_n = int(2.6 * SR)
ir = rng.standard_normal((ir_n, 2)) * np.exp(-t_(ir_n) * 2.4)[:, None]
ir = signal.sosfilt(sos('lowpass', 6000), ir, axis=0); ir /= np.sqrt((ir ** 2).sum(axis=0))
wet_src = music * 0.9 + fx * 0.6
wet = np.stack([signal.fftconvolve(wet_src[:, c], ir[:, c])[:N] for c in range(2)], axis=1) * 0.35

mix = drums * 0.9 + bassb * 0.9 + music + fx + wet
mix = signal.sosfilt(sos('highpass', 28), mix, axis=0)
# fade out tail
end_i = int((DUR + 1.2) * SR)
fade = np.ones(N); fade[int((DUR - 1.5) * SR):end_i] = np.linspace(1, 0, end_i - int((DUR - 1.5) * SR)); fade[end_i:] = 0
mix *= fade[:, None]
mix = mix[: int(DUR * SR)]
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix /= np.abs(mix).max() / 0.89
wavfile.write('soundtrack.wav', SR, (mix * 32767).astype(np.int16))
print('ok', mix.shape[0] / SR, 's')
