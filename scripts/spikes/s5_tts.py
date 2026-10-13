"""SPIKE S5: Timbre warning audio. Check voice names against docs.gnani.ai/api/TTS/available-voices.
  python scripts/spikes/s5_tts.py --text "रुकिए! यह स्कैम है।" --voice Nalini --lang hi-IN --out /tmp/w.wav
  python scripts/spikes/s5_tts.py --text "..." --container mulaw --out /tmp/w.ulaw     # 8 kHz telephony test audio
Listen for: natural prosody, and the spoken form of the helpline number (written as words in warnings.yaml)."""
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import argparse, asyncio
import _common
from app.gnani.tts import synthesize

ap = argparse.ArgumentParser()
ap.add_argument("--text", required=True); ap.add_argument("--voice", default="Nalini")
ap.add_argument("--lang", default="hi-IN"); ap.add_argument("--speed", type=float, default=1.0)
ap.add_argument("--container", default="wav"); ap.add_argument("--rate", type=int, default=48000)
ap.add_argument("--out", required=True)
a = ap.parse_args()
audio = asyncio.run(synthesize(_common.api_key(), a.text, voice=a.voice, language=a.lang, speed=a.speed,
                               sample_rate=a.rate, container=a.container))
open(a.out, "wb").write(audio); print(f"wrote {a.out} ({len(audio)} bytes)")
