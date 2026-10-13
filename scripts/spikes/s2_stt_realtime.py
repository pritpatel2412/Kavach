"""SPIKE S2/S3/S4: stream a WAV/PCM file to Prisma realtime at real-time pace; print transcripts + latency.

  python scripts/spikes/s2_stt_realtime.py --file samples/hi_16k.wav --lang hi-IN --rate 16000
  python scripts/spikes/s2_stt_realtime.py --file samples/hi_8k.wav  --lang hi-IN --rate 8000 --bias CBI,TRAI,warrant   # S3 + S4
Input must be mono 16-bit PCM at --rate (convert: ffmpeg -i in.mp3 -ac 1 -ar 8000 -c:a pcm_s16le out.wav)
RECORD the dashboard credit balance before and after in docs/CREDITS_LOG.md (Spike S1).
"""
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import argparse, asyncio, json, wave
import _common
from app.gnani.stt_stream import SttConnection, build_headers, FRAME_BYTES

async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--file", required=True); ap.add_argument("--lang", default="hi-IN")
    ap.add_argument("--rate", type=int, default=16000); ap.add_argument("--bias", default="")
    ap.add_argument("--silence-ms", type=int, default=500); ap.add_argument("--vad", type=float, default=0.7)
    a = ap.parse_args()
    with wave.open(a.file, "rb") as w:
        assert (w.getnchannels(), w.getsampwidth(), w.getframerate()) == (1, 2, a.rate), "need mono PCM16 at --rate"
        pcm = w.readframes(w.getnframes())
    bias = [b for b in a.bias.split(",") if b]
    h = build_headers(_common.api_key(), a.lang, sample_rate=a.rate, bias_list=bias or None,
                      vad_threshold=a.vad, min_silence_ms=a.silence_ms, min_speech_ms=200 if a.rate == 8000 else None)
    conn = SttConnection(h); await conn.open()
    frame_s = 512 / a.rate                       # 32 ms @16k, 64 ms @8k
    async def reader():
        async for ev in conn.events():
            if ev["type"] == "transcript":
                print(f"[{ev['segment_index']}] {ev['text']}   (latency {ev.get('latency')} ms, {ev.get('audio_duration_ms')} ms audio)")
            elif ev["type"] in ("error", "connected"):
                print(ev["type"], json.dumps(ev, ensure_ascii=False))
    rt = asyncio.create_task(reader())
    for i in range(0, len(pcm), FRAME_BYTES):
        await conn.send_audio(pcm[i:i + FRAME_BYTES].ljust(FRAME_BYTES, b"\0"))
        await asyncio.sleep(frame_s)
    await asyncio.sleep(2.0)                     # let the last segment close
    await conn.close(); rt.cancel()

asyncio.run(main())
