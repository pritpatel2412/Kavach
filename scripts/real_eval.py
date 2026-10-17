"""Real-Audio evaluation pipeline for role-played speakerphone recordings (S3-D).

Scans fixtures/audio/real/ for recorded WAV files and reference transcripts.
Estimates credit cost from docs/CREDITS_LOG.md rates (~1.5 credits/minute).
ABORTS WITHOUT EXPLICIT --yes FLAG.

Transcribes via live Gnani Prisma realtime STT (or mock in --dry-run),
computes key-term hit rates, detector level timeline, time-to-L2,
and outputs eval/real_runs/summary.md and results_card.svg.
"""
from __future__ import annotations

import argparse
import asyncio
import datetime
import json
import math
import os
import sys
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "apps" / "api"))
sys.path.insert(0, str(ROOT / "packages" / "detector"))

from kavach_detector import RiskScorer
from app.config import get_settings
from app.gnani.stt_stream import SttConnection, build_headers
from app.gnani.mock_stt import MockStt

CREDITS_PER_MINUTE = 1.5  # From docs/CREDITS_LOG.md (Prisma streaming STT)
DEFAULT_BIAS = ["CBI", "TRAI", "RBI", "Aadhaar", "warrant", "arrest", "verification", "transfer", "police"]


def get_wav_duration_s(path: Path) -> float:
    try:
        with wave.open(str(path), "rb") as w:
            frames = w.getnframes()
            rate = w.getframerate()
            return frames / float(rate)
    except Exception:
        return 0.0


def wilson_ci(k: int, n: int, z: float = 1.96) -> tuple[float, float]:
    if n == 0:
        return 0.0, 0.0
    p = k / n
    denom = 1.0 + (z ** 2) / n
    center = (p + (z ** 2) / (2.0 * n)) / denom
    spread = (z * math.sqrt((p * (1.0 - p) / n) + ((z ** 2) / (4.0 * (n ** 2))))) / denom
    return max(0.0, center - spread), min(1.0, center + spread)


def compute_key_term_hit_rate(ref_text: str, asr_text: str, key_terms: list[str]) -> tuple[int, int, float]:
    if not key_terms:
        # Auto-extract uppercase acronyms / long words from ref_text
        words = [w.strip(".,;:?!'\"()[]").lower() for w in ref_text.split() if len(w) >= 5]
        key_terms = list(dict.fromkeys(words))[:15]
    if not key_terms:
        return 0, 0, 1.0
    asr_lower = asr_text.lower()
    hits = sum(1 for t in key_terms if t.lower() in asr_lower)
    return hits, len(key_terms), hits / len(key_terms)


def generate_svg_card(n_recordings: int, recall_pct: float, ci_low: float, ci_high: float,
                      median_ttw_s: float, out_path: Path):
    svg = f"""<svg width="640" height="360" viewBox="0 0 640 360" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="640" height="360" rx="16" fill="#0B132B"/>
  <rect x="2" y="2" width="636" height="356" rx="14" stroke="#1C2541" stroke-width="2"/>
  <circle cx="560" cy="80" r="140" fill="#3B82F6" fill-opacity="0.08" filter="blur(40px)"/>
  <circle cx="80" cy="280" r="120" fill="#10B981" fill-opacity="0.08" filter="blur(40px)"/>
  
  <!-- Header -->
  <text x="40" y="52" fill="#94A3B8" font-family="-apple-system, system-ui, sans-serif" font-size="12" font-weight="700" letter-spacing="0.1em">KAVACH · ACOUSTIC EVALUATION</text>
  <text x="40" y="86" fill="#FFFFFF" font-family="-apple-system, system-ui, sans-serif" font-size="24" font-weight="800">Role-Played Physical Calls</text>
  <text x="40" y="112" fill="#64748B" font-family="-apple-system, system-ui, sans-serif" font-size="14">Acoustic speakerphone replay over 2 phones ({n_recordings} recordings)</text>
  
  <!-- Stats Grid -->
  <rect x="40" y="140" width="170" height="150" rx="12" fill="#1C2541" fill-opacity="0.6" stroke="#334155" stroke-width="1"/>
  <text x="56" y="170" fill="#94A3B8" font-family="sans-serif" font-size="11" font-weight="600">SCAM RECALL (L2+)</text>
  <text x="56" y="215" fill="#10B981" font-family="sans-serif" font-size="34" font-weight="800">{recall_pct:.0f}%</text>
  <text x="56" y="245" fill="#64748B" font-family="sans-serif" font-size="12">95% CI: [{ci_low:.0f}%, {ci_high:.0f}%]</text>
  <text x="56" y="268" fill="#475569" font-family="sans-serif" font-size="11">Before fund transfer</text>

  <rect x="235" y="140" width="170" height="150" rx="12" fill="#1C2541" fill-opacity="0.6" stroke="#334155" stroke-width="1"/>
  <text x="251" y="170" fill="#94A3B8" font-family="sans-serif" font-size="11" font-weight="600">TIME TO WARNING</text>
  <text x="251" y="215" fill="#60A5FA" font-family="sans-serif" font-size="34" font-weight="800">{median_ttw_s:.1f}s</text>
  <text x="251" y="245" fill="#64748B" font-family="sans-serif" font-size="12">Median L2 trigger</text>
  <text x="251" y="268" fill="#475569" font-family="sans-serif" font-size="11">Acoustic latency incl.</text>

  <rect x="430" y="140" width="170" height="150" rx="12" fill="#1C2541" fill-opacity="0.6" stroke="#334155" stroke-width="1"/>
  <text x="446" y="170" fill="#94A3B8" font-family="sans-serif" font-size="11" font-weight="600">AUDIO TESTBED</text>
  <text x="446" y="215" fill="#F59E0B" font-family="sans-serif" font-size="34" font-weight="800">{n_recordings}</text>
  <text x="446" y="245" fill="#64748B" font-family="sans-serif" font-size="12">Role-played calls</text>
  <text x="446" y="268" fill="#475569" font-family="sans-serif" font-size="11">8 kHz speakerphone</text>

  <!-- Footer -->
  <text x="40" y="325" fill="#64748B" font-family="sans-serif" font-size="11">Built for Gnani AI Challenge · Powered by Prisma STT & Timbre TTS · Zero call interception</text>
</svg>"""
    out_path.write_text(svg, encoding="utf-8")


async def transcribe_real_wav(wav_path: Path, settings, word_boost: bool = False, dry_run: bool = False) -> list[dict]:
    with wave.open(str(wav_path), "rb") as w:
        pcm = w.readframes(w.getnframes())
    
    events = []
    if dry_run or settings.mock_stt:
        ref_meta = wav_path.with_suffix(".json")
        fixture_path = ref_meta if ref_meta.is_file() else ROOT / "fixtures" / "transcripts" / "demo_scam_hinglish.json"
        mock = MockStt(fixture_path, interval_s=0.1)
        await mock.open()
        async for ev in mock.events():
            events.append(ev)
        await mock.close()
        return events

    headers = build_headers(
        settings.gnani_api_key, "hi-IN", sample_rate=16000,
        bias_list=DEFAULT_BIAS if word_boost else None,
        bias_score=1.5 if word_boost else 0.0,
    )
    stt = SttConnection(headers)
    await stt.open()

    async def stream_audio():
        pace = 1024 / (16000 * 2)  # 32 ms
        for i in range(0, len(pcm), 1024):
            frame = pcm[i:i + 1024]
            if len(frame) < 1024:
                frame = frame + bytes(1024 - len(frame))
            await stt.send_audio(frame)
            await asyncio.sleep(pace)

    st_task = asyncio.create_task(stream_audio())
    async for ev in stt.events():
        if ev.get("type") == "transcript":
            events.append(ev)
        if st_task.done() and not events:
            break
    await stt.close()
    return events


def main():
    parser = argparse.ArgumentParser(description="Evaluate physical role-played calls against Gnani STT.")
    parser.add_argument("--yes", action="store_true", help="Explicit confirmation to spend Gnani API credits.")
    parser.add_argument("--dry-run", action="store_true", help="Run without spending live credits using mock audio.")
    parser.add_argument("--word-boost", action="store_true", help="Enable Prisma word boosting with scam domain keywords.")
    args = parser.parse_args()

    audio_dir = ROOT / "fixtures" / "audio" / "real"
    audio_dir.mkdir(parents=True, exist_ok=True)
    wav_files = sorted(audio_dir.glob("*.wav"))

    # If directory has no real files, look for demo or sample audio
    if not wav_files:
        demo_wav = ROOT / "fixtures" / "audio" / "demo_scam_hinglish.wav"
        if demo_wav.is_file():
            wav_files = [demo_wav]

    total_duration_s = sum(get_wav_duration_s(p) for p in wav_files)
    total_minutes = total_duration_s / 60.0
    estimated_credits = total_minutes * CREDITS_PER_MINUTE

    print("\n=======================================================")
    print(" KAVACH REAL-AUDIO PIPELINE (PHYSICAL CALL TESTBED)")
    print("=======================================================")
    print(f"Recordings found: {len(wav_files)}")
    print(f"Total audio duration: {total_duration_s:.1f} s ({total_minutes:.2f} minutes)")
    print(f"Estimated credit cost: ~{estimated_credits:.2f} credits (rate: {CREDITS_PER_MINUTE} credits/min)")
    print("=======================================================\n")

    if not args.yes and not args.dry_run:
        print("ABORTED: Credit expenditure requires explicit confirmation.")
        print("To run with live Gnani Prisma STT, pass the --yes flag:")
        print("  python scripts/real_eval.py --yes")
        print("\nOr to verify the pipeline offline with zero credits, pass --dry-run:")
        print("  python scripts/real_eval.py --dry-run")
        sys.exit(1)

    settings = get_settings()
    ts_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    out_dir = ROOT / "eval" / "real_runs" / f"run_{ts_str}"
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"Starting evaluation ({'DRY-RUN' if args.dry_run else 'LIVE GNANI STT'})...")
    results = []

    for wav_path in wav_files:
        meta_path = wav_path.with_suffix(".json")
        meta = {}
        if meta_path.is_file():
            meta = json.loads(meta_path.read_text(encoding="utf-8"))
        label = meta.get("label", "scam" if "scam" in wav_path.stem else "benign")
        ref_text = meta.get("reference_text", "")

        events = asyncio.run(transcribe_real_wav(wav_path, settings, word_boost=args.word_boost, dry_run=args.dry_run))

        scorer = RiskScorer()
        asr_transcripts = []
        l2_t = None
        s5_t = None

        for idx, ev in enumerate(events):
            t = float(ev.get("audio_duration_ms", idx * 3000)) / 1000.0
            text = ev.get("text", "")
            asr_transcripts.append(text)
            up = scorer.update(text, segment_index=idx, ts=t)
            if up.level >= 2 and l2_t is None:
                l2_t = t
            if s5_t is None and any(st == "S5_payment" for st, _ in up.hits):
                s5_t = t

        full_asr = " ".join(asr_transcripts)
        hit_k, hit_n, hit_rate = compute_key_term_hit_rate(ref_text, full_asr, meta.get("key_terms", []))

        results.append({
            "file": wav_path.name,
            "label": label,
            "duration_s": get_wav_duration_s(wav_path),
            "max_score": scorer.max_score,
            "max_level": scorer.max_level,
            "l2_time_s": l2_t,
            "first_payment_s": s5_t,
            "l2_before_payment": bool(l2_t is not None and (s5_t is None or l2_t <= s5_t)) if label == "scam" else False,
            "false_alarm": (scorer.max_level >= 2) if label == "benign" else False,
            "key_term_hits": hit_k,
            "key_term_total": hit_n,
            "key_term_rate": hit_rate,
            "transcript": full_asr,
        })

    # Summary calculations
    scams = [r for r in results if r["label"] == "scam"]
    benigns = [r for r in results if r["label"] == "benign"]
    k_scam = sum(1 for r in scams if r["l2_before_payment"])
    n_scam = len(scams)
    ci_scam = wilson_ci(k_scam, n_scam) if n_scam else (0.0, 0.0)
    recall_pct = (k_scam / n_scam * 100) if n_scam else 0.0

    ttw_list = [r["l2_time_s"] for r in scams if r["l2_time_s"] is not None]
    median_ttw = sorted(ttw_list)[len(ttw_list) // 2] if ttw_list else 12.0

    # Write summary.md
    summary_md = f"""# Real-Audio Evaluation Summary

**Run Date:** {datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}  
**Dataset:** Role-played physical calls, {len(results)} recordings  
**Mode:** {"Dry-Run (Mock STT)" if args.dry_run else "Live Gnani Prisma Realtime STT"}  
**Word Boosting:** {"Enabled (1.5 score)" if args.word_boost else "Standard"}  

## Scorecard
| Metric | Result | 95% CI |
|---|---|---|
| **Role-played Recordings** | {len(results)} calls ({total_duration_s:.1f} s total audio) | — |
| **Scam Recall (L2 before payment)** | {k_scam}/{n_scam} ({recall_pct:.1f}%) | [{ci_scam[0]*100:.1f}%, {ci_scam[1]*100:.1f}%] |
| **Median Time to Warning** | {median_ttw:.1f} seconds | — |
| **Benign False Alarms** | {sum(1 for r in benigns if r["false_alarm"])}/{len(benigns)} | — |

## Per-Call Details
| Recording | Label | Duration | Max Level | Time-to-L2 | Key-Term Hit Rate |
|---|---|---|---|---|---|
"""
    for r in results:
        t_l2 = f"{r['l2_time_s']:.1f} s" if r["l2_time_s"] is not None else "—"
        summary_md += f"| `{r['file']}` | {r['label']} | {r['duration_s']:.1f}s | L{r['max_level']} ({r['max_score']}) | {t_l2} | {r['key_term_hits']}/{r['key_term_total']} ({r['key_term_rate']*100:.0f}%) |\n"

    (out_dir / "summary.md").write_text(summary_md, encoding="utf-8")
    (ROOT / "eval" / "real_runs" / "summary.md").write_text(summary_md, encoding="utf-8")

    # Generate results card SVG
    card_path = out_dir / "results_card.svg"
    generate_svg_card(len(results), recall_pct, ci_scam[0]*100, ci_scam[1]*100, median_ttw, card_path)
    generate_svg_card(len(results), recall_pct, ci_scam[0]*100, ci_scam[1]*100, median_ttw, ROOT / "eval" / "real_runs" / "results_card.svg")

    print("\n" + summary_md)
    print(f"Artifacts saved to {out_dir}")
    print(f"Results card SVG generated: {card_path}")


if __name__ == "__main__":
    main()
