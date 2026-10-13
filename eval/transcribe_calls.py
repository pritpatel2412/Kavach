"""Run each generated 8 kHz call through Prisma realtime ONCE and SAVE transcripts to eval/transcripts/.
After that, tune with eval/run_eval.py --transcripts eval/transcripts at zero credit cost.
Runs at real-time pace (a 60 s call takes 60 s). UNTESTED against the live API at scaffold time: validate in Phase 6."""
import argparse, asyncio, json, sys, time, wave
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path[:0] = [str(ROOT / "scripts"), str(ROOT / "apps" / "api")]
import _common  # noqa: E402
from app.gnani.stt_stream import SttConnection, build_headers, FRAME_BYTES  # noqa: E402
from app.session import DEFAULT_BIAS  # noqa: E402

async def transcribe(path: Path, meta: dict, k: str) -> dict:
    with wave.open(str(path), "rb") as w: pcm = w.readframes(w.getnframes())
    h = build_headers(k, meta["lang"], sample_rate=8000, bias_list=DEFAULT_BIAS, vad_threshold=0.7,
                      min_silence_ms=500, min_speech_ms=200)
    conn = SttConnection(h); await conn.open(); segs, t0 = [], time.monotonic()
    async def reader():
        async for ev in conn.events():
            if ev["type"] == "transcript":
                segs.append({"text": ev["text"], "t": round(time.monotonic() - t0, 2), "latency_ms": ev.get("latency")})
    rt = asyncio.create_task(reader())
    for i in range(0, len(pcm), FRAME_BYTES):
        await conn.send_audio(pcm[i:i + FRAME_BYTES].ljust(FRAME_BYTES, b"\0")); await asyncio.sleep(512 / 8000)
    await asyncio.sleep(2.5); await conn.close(); rt.cancel()
    return {"label": meta["label"], "noise": meta["noise"], "lang": meta["lang"], "source": path.name, "segments": segs}

async def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--only", default=""); a = ap.parse_args()
    k = _common.api_key(); outdir = ROOT / "eval" / "transcripts"; outdir.mkdir(exist_ok=True)
    for wav in sorted((ROOT / "eval" / "out" / "audio").glob("*.wav")):
        if a.only and a.only not in wav.name: continue
        meta = json.loads(wav.with_suffix(".meta.json").read_text())
        res = await transcribe(wav, meta, k)
        (outdir / (wav.stem + ".json")).write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")
        print("saved", wav.stem, len(res["segments"]), "segments")
asyncio.run(main())
