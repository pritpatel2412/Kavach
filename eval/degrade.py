"""Turn clean TTS audio into 'bad phone line' audio: 8 kHz, G.711 mu-law companding, background noise at a target SNR.
numpy only (audioop was removed in Python 3.13)."""
from __future__ import annotations

import wave
from pathlib import Path

import numpy as np


def read_wav(path: str | Path) -> tuple[np.ndarray, int]:
    with wave.open(str(path), "rb") as w:
        assert w.getsampwidth() == 2, "expect 16-bit PCM"
        sr, ch = w.getframerate(), w.getnchannels()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2").astype(np.float32) / 32768.0
    if ch > 1:
        x = x.reshape(-1, ch).mean(axis=1)
    return x, sr


def write_wav(path: str | Path, x: np.ndarray, sr: int) -> None:
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes(pcm.tobytes())


def resample(x: np.ndarray, sr_in: int, sr_out: int) -> np.ndarray:
    if sr_in == sr_out:
        return x
    n_out = int(round(len(x) * sr_out / sr_in))
    return np.interp(np.linspace(0, len(x) - 1, n_out), np.arange(len(x)), x).astype(np.float32)


def mulaw_roundtrip(x: np.ndarray, mu: int = 255) -> np.ndarray:
    """Compand + 8-bit quantise + expand: the audible artefact of a G.711 mu-law line."""
    x = np.clip(x, -1, 1)
    y = np.sign(x) * np.log1p(mu * np.abs(x)) / np.log1p(mu)
    q = np.round((y + 1) / 2 * 255) / 255 * 2 - 1
    return (np.sign(q) * (np.expm1(np.abs(q) * np.log1p(mu))) / mu).astype(np.float32)


def add_noise(x: np.ndarray, snr_db: float, rng: np.random.Generator | None = None) -> np.ndarray:
    rng = rng or np.random.default_rng(0)
    p_sig = float(np.mean(x ** 2)) + 1e-12
    noise = rng.standard_normal(len(x)).astype(np.float32)
    # slightly coloured (low-pass-ish) noise: closer to street/fan hiss than pure white
    noise = np.convolve(noise, np.ones(4) / 4, mode="same")
    noise *= np.sqrt(p_sig / (10 ** (snr_db / 10)) / (float(np.mean(noise ** 2)) + 1e-12))
    return x + noise


CONDITIONS = {"clean": None, "snr15": 15.0, "snr5": 5.0}


def degrade(x: np.ndarray, sr: int, condition: str) -> tuple[np.ndarray, int]:
    """clean = just 8 kHz mu-law (still telephony); snr15/snr5 add noise before the codec."""
    y = resample(x, sr, 8000)
    snr = CONDITIONS[condition]
    if snr is not None:
        y = add_noise(y, snr)
    return mulaw_roundtrip(y), 8000
