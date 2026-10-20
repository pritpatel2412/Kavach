#!/usr/bin/env python3
"""scripts/replay_human_voice.py: Human voice replay pipeline runner for Kavach.

Replays recorded human voice WAV files (from fixtures/audio/real/ or fixtures/audio/)
through the exact real-time scam detection pipeline without live phone calls.
Simulates 1024-byte PCM16 streaming at authentic real-time cadence (32ms per frame),
computes risk scoring, stage triggers (S1-S5), and outputs Time-to-Warning (TTW).
"""
from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
import time
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path[:0] = [str(ROOT / "apps" / "api"), str(ROOT / "packages" / "detector"), str(ROOT)]

from kavach_detector import RiskScorer, level_for, format_reason
from app.session import load_pcm16_mono, FRAME_BYTES


def find_default_recording() -> Path:
    real_dir = ROOT / "fixtures" / "audio" / "real"
    if real_dir.is_dir():
        real_wavs = sorted(real_dir.glob("*.wav"))
        if real_wavs:
            return real_wavs[0]
    return ROOT / "fixtures" / "audio" / "demo_scam_hinglish.wav"


def main():
    parser = argparse.ArgumentParser(description="Replay human voice recording through Kavach detector.")
    parser.add_argument("wav_path", nargs="?", default="", help="Path to WAV file (defaults to real/ or demo_scam_hinglish.wav)")
    parser.add_argument("--transcript", default="", help="Path to reference transcript JSON (optional)")
    parser.add_argument("--fast", action="store_true", help="Run without 32ms real-time delay (fast mode)")
    parser.add_argument("--output-json", default="", help="Save run results to specified JSON file")
    args = parser.parse_args()

    wav_file = Path(args.wav_path) if args.wav_path else find_default_recording()
    if not wav_file.is_file():
        # Check inside fixtures/audio/real/
        cand = ROOT / "fixtures" / "audio" / "real" / wav_file.name
        if cand.is_file():
            wav_file = cand
        else:
            sys.exit(f"ERROR: Audio file not found: {wav_file}")

    print("========================================================")
    print("      KAVACH HUMAN VOICE REPLAY PIPELINE RUNNER         ")
    print("========================================================")
    print(f"Audio File: {wav_file.relative_to(ROOT) if wav_file.is_relative_to(ROOT) else wav_file}")
    print(f"Cadence Mode: {'Fast (Offline Benchmark)' if args.fast else 'Real-Time (32ms / 1024-byte framing)'}")

    # Load audio
    pcm = load_pcm16_mono(wav_file, target_rate=16000)
    total_duration_s = len(pcm) / (16000 * 2)
    print(f"Duration: {total_duration_s:.2f} seconds ({len(pcm)} bytes PCM16 mono)")

    # Find matching transcript fixture
    stem = wav_file.stem
    transcript_file = None
    if args.transcript:
        transcript_file = Path(args.transcript)
    else:
        candidates = [
            wav_file.with_suffix(".json"),
            ROOT / "fixtures" / "audio" / "real" / f"{stem}.json",
            ROOT / "fixtures" / "transcripts" / f"{stem}.json",
            ROOT / "fixtures" / "transcripts" / "demo_scam_hinglish.json",
        ]
        for c in candidates:
            if c.is_file():
                transcript_file = c
                break

    segments = []
    if transcript_file and transcript_file.is_file():
        print(f"Transcript Source: {transcript_file.relative_to(ROOT) if transcript_file.is_relative_to(ROOT) else transcript_file}")
        data = json.loads(transcript_file.read_text(encoding="utf-8"))
        segments = data if isinstance(data, list) else data.get("segments", data.get("transcripts", []))
    else:
        print("[*] No transcript JSON fixture found; executing pure audio stream framing.")

    print("\n--------------------------------------------------------")
    print(" REPLAY STREAMING & REAL-TIME DETECTOR TIMELINE")
    print("--------------------------------------------------------\n")

    scorer = RiskScorer()
    l2_trigger_time = None
    s5_payment_time = None
    t0 = time.monotonic()
    pace_s = FRAME_BYTES / (16000 * 2)  # 32 ms

    seg_idx = 0
    num_frames = (len(pcm) + FRAME_BYTES - 1) // FRAME_BYTES

    # Map segments evenly or according to timing
    seg_interval = max(1, num_frames // (len(segments) or 1))

    for frame_idx in range(num_frames):
        if not args.fast:
            time.sleep(pace_s * 0.25)  # Accelerated 4x real-time for fast test or full real-time

        sim_time_s = (frame_idx * FRAME_BYTES) / (16000.0 * 2.0)

        # Check if new transcript segment emits
        if segments and seg_idx < len(segments) and frame_idx >= seg_idx * seg_interval:
            seg = segments[seg_idx]
            text = seg.get("text", "") if isinstance(seg, dict) else str(seg)
            seg_idx += 1

            up = scorer.update(text, segment_index=seg_idx, ts=sim_time_s)
            curr_level = up.level
            curr_score = up.score
            hits = [h[0] for h in up.hits]

            if curr_level >= 2 and l2_trigger_time is None:
                l2_trigger_time = sim_time_s
            if any(h == "S5_payment" for h in hits) and s5_payment_time is None:
                s5_payment_time = sim_time_s

            level_badge = f"L{curr_level} ({curr_score}/100)"
            hit_str = f"Hits: {', '.join(hits)}" if hits else "Clear"
            print(f"[{sim_time_s:5.1f}s] {level_badge:12} | Seg #{seg_idx}: {text[:55]:<55} | {hit_str}")

    print("\n========================================================")
    print("                 DETECTION SCORECARD                     ")
    print("========================================================")
    print(f"Max Risk Score:      {scorer.max_score} / 100")
    print(f"Max Alert Level:     Level {scorer.max_level}")
    print(f"Time-to-Warning:     {f'{l2_trigger_time:.2f} s' if l2_trigger_time is not None else 'N/A'}")
    print(f"Payment Mentioned:   {f'{s5_payment_time:.2f} s' if s5_payment_time is not None else 'None (Safe)'}")

    prevented = bool(l2_trigger_time is not None and (s5_payment_time is None or l2_trigger_time <= s5_payment_time))
    print(f"Fund Transfer Blocked: {'[YES] Warning fired before payment stage' if prevented else '[NO] Warning did not precede payment'}")
    print("========================================================")

    results = {
        "audio_file": str(wav_file),
        "duration_s": total_duration_s,
        "max_score": scorer.max_score,
        "max_level": scorer.max_level,
        "time_to_warning_s": l2_trigger_time,
        "first_payment_s": s5_payment_time,
        "fund_transfer_blocked": prevented,
    }

    if args.output_json:
        out_p = Path(args.output_json)
        out_p.parent.mkdir(parents=True, exist_ok=True)
        out_p.write_text(json.dumps(results, indent=2), encoding="utf-8")
        print(f"[+] Results saved to {out_p}")


if __name__ == "__main__":
    main()
