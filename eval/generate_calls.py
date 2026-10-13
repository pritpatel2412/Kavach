"""Render scenarios (eval/scenarios/*.yaml) into two-speaker audio with Timbre, then degrade to telephony conditions.
Costs TTS credits: start with ONE scenario (--only) and check your credit table first (docs/CREDITS_LOG.md).
  python eval/generate_calls.py --only scam_cbi_hindi_01
Output: eval/out/audio/<id>__<clean|snr15|snr5>.wav (8 kHz mono PCM16) + <id>__<cond>.meta.json"""
import argparse, asyncio, io, json, sys, wave
from pathlib import Path
import numpy as np, yaml

ROOT = Path(__file__).resolve().parents[1]
sys.path[:0] = [str(ROOT / "scripts"), str(ROOT / "apps" / "api"), str(ROOT / "eval")]
import _common  # noqa: E402
from app.gnani.tts import synthesize  # noqa: E402
from degrade import CONDITIONS, degrade, write_wav  # noqa: E402

def wav_bytes_to_np(b: bytes):
    with wave.open(io.BytesIO(b), "rb") as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype="<i2").astype(np.float32) / 32768.0, w.getframerate()

async def render(sc: dict, k: str):
    parts, sr_ref, t, marks = [], 16000, 0.0, []
    for i, turn in enumerate(sc["turns"]):
        voice = sc["caller_voice"] if turn["who"] == "caller" else sc["victim_voice"]
        x, sr = wav_bytes_to_np(await synthesize(k, turn["text"], voice=voice, language=sc["lang"], sample_rate=sr_ref))
        gap = np.zeros(int(0.6 * sr), dtype=np.float32)
        parts += [x, gap]; marks.append({"turn": i, "who": turn["who"], "start_s": t}); t += (len(x) + len(gap)) / sr
    return np.concatenate(parts), sr, marks

async def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--only", default=""); a = ap.parse_args()
    k = _common.api_key(); out = ROOT / "eval" / "out" / "audio"; out.mkdir(parents=True, exist_ok=True)
    for p in sorted((ROOT / "eval" / "scenarios").glob("*.yaml")):
        sc = yaml.safe_load(p.read_text(encoding="utf-8"))
        if a.only and sc["id"] != a.only: continue
        x, sr, marks = await render(sc, k)
        for cond in CONDITIONS:
            y, sr8 = degrade(x, sr, cond); f = out / f"{sc['id']}__{cond}.wav"; write_wav(f, y, sr8)
            f.with_suffix(".meta.json").write_text(json.dumps({"id": sc["id"], "label": sc["label"], "lang": sc["lang"],
                                                               "noise": cond, "turns": marks}, indent=1))
            print("wrote", f)
asyncio.run(main())
