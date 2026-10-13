"""SPIKE S6: voice cloning. Use ONLY your own voice or a person who has consented (see docs/SAFETY.md).
  python scripts/spikes/s6_clone.py --ref my_voice_20s.wav --text "अम्मा, यह स्कैम है। फ़ोन काट दीजिए।" --out /tmp/clone.wav --save-embedding /tmp/me.json
Then listen: similar voice? intelligible Hindi? Try Tamil/Telugu text too. Record results in docs/DECISIONS.md."""
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import argparse, asyncio, json
import _common
from app.gnani.tts import create_embedding, synthesize_cloned

ap = argparse.ArgumentParser()
ap.add_argument("--ref", required=True); ap.add_argument("--text", required=True)
ap.add_argument("--out", required=True); ap.add_argument("--save-embedding", default="")
a = ap.parse_args()
async def go():
    k = _common.api_key()
    emb = await create_embedding(k, open(a.ref, "rb").read(), a.ref.split("/")[-1])
    if a.save_embedding:
        json.dump(emb, open(a.save_embedding, "w")); print("embedding saved (treat as PRIVATE biometric data; git-ignored)")
    audio = await synthesize_cloned(k, a.text, emb)
    open(a.out, "wb").write(audio); print(f"wrote {a.out}")
asyncio.run(go())
