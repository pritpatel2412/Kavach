"""Unit tests for S3-A: Client-side silence gating and sustained speech VAD logic."""
import math
import struct
import pytest

SILENCE_THRESHOLD = 250  # RMS in 16-bit integer units
HANGOVER_FRAMES = 15     # ~480 ms hangover window at 32 ms/frame


class SilenceGater:
    """Python reference implementation of the AudioWorklet silence gating algorithm."""
    def __init__(self, threshold: int = SILENCE_THRESHOLD, hangover: int = HANGOVER_FRAMES):
        self.threshold = threshold
        self.hangover = hangover
        self.hangover_count = 0

    def process_frame(self, int16_samples: list[int]) -> tuple[bool, float]:
        """Returns (should_transmit, rms)."""
        sum_sq = sum(s * s for s in int16_samples)
        rms = math.sqrt(sum_sq / len(int16_samples))
        is_silent = rms < self.threshold
        if not is_silent:
            self.hangover_count = self.hangover
            return True, rms
        elif self.hangover_count > 0:
            self.hangover_count -= 1
            return True, rms
        else:
            return False, rms


def make_frame(amplitude: int) -> list[int]:
    """Generate 512 samples of a 440 Hz tone with specified amplitude."""
    return [int(amplitude * math.sin(2 * math.pi * 440 * i / 16000)) for i in range(512)]


def test_pure_silence_never_transmitted():
    gater = SilenceGater()
    # 50 frames of ambient room background noise (amplitude 30, RMS ~21)
    silent_frame = make_frame(amplitude=30)
    transmitted = 0
    for _ in range(50):
        send, rms = gater.process_frame(silent_frame)
        assert rms < SILENCE_THRESHOLD
        if send:
            transmitted += 1
    # Pure silence must never stream to server
    assert transmitted == 0


def test_speech_frames_transmitted():
    gater = SilenceGater()
    # Loud speech frame (amplitude 5000, RMS ~3535)
    speech_frame = make_frame(amplitude=5000)
    transmitted = 0
    for _ in range(20):
        send, rms = gater.process_frame(speech_frame)
        assert rms > SILENCE_THRESHOLD
        if send:
            transmitted += 1
    assert transmitted == 20


def test_hangover_window_preserves_short_pauses():
    gater = SilenceGater(hangover=3)
    speech = make_frame(5000)
    silence = make_frame(30)

    # 1. Speech frame -> transmitted
    send, _ = gater.process_frame(speech)
    assert send is True

    # 2. Brief 2-frame pause -> preserved by hangover window
    send1, _ = gater.process_frame(silence)
    send2, _ = gater.process_frame(silence)
    assert send1 is True
    assert send2 is True

    # 3. Third silence frame -> last hangover frame
    send3, _ = gater.process_frame(silence)
    assert send3 is True

    # 4. Fourth silence frame -> hangover expired, gated!
    send4, _ = gater.process_frame(silence)
    assert send4 is False
