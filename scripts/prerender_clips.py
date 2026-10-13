"""Pre-render warning clips (zero TTS latency and zero credits during a live call).
  python scripts/prerender_clips.py                         # default voices -> assets/clips/default/
  python scripts/prerender_clips.py --embedding /tmp/me.json --profile guardian1 --lang hi-IN
Files: assets/clips/<profile>/<lang>_L<level>.wav  (served at /clips/...)"""
import argparse, asyncio, json
import _common
from app.gnani.tts import synthesize, synthesize_cloned
from app.interventions import load_warnings

DEFAULT_VOICES = {"hi-IN": "Nalini", "en-IN": "Kaveri", "hi-en": "Poorvi"}   # names seen in Gnani docs; verify in catalog

ap = argparse.ArgumentParser()
ap.add_argument("--profile", default="default"); ap.add_argument("--embedding", default="")
ap.add_argument("--lang", default="")
a = ap.parse_args()

async def go():
    k = _common.api_key(); warnings = load_warnings(); emb = json.load(open(a.embedding)) if a.embedding else None
    out_dir = _common.ROOT / "assets" / "clips" / a.profile; out_dir.mkdir(parents=True, exist_ok=True)
    for lang, levels in warnings.items():
        if a.lang and lang != a.lang: continue
        for level, copy in levels.items():
            if emb: audio = await synthesize_cloned(k, copy["clip_text"], emb)
            else: audio = await synthesize(k, copy["clip_text"], voice=DEFAULT_VOICES.get(lang, "Nalini"), language=lang)
            p = out_dir / f"{lang}_L{level}.wav"; p.write_bytes(audio); print("wrote", p)
asyncio.run(go())
