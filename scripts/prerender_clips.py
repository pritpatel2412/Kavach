"""Pre-render warning clips (zero TTS latency and zero credits during a live call).

  python scripts/prerender_clips.py                         # default voices -> assets/clips/default/
  python scripts/prerender_clips.py --embedding /tmp/me.json --profile guardian1 --lang hi-IN

Same renderer as POST /api/voice/enroll (`app.clips.render_profile_clips`).
Files: assets/clips/<profile>/<lang>_L<level>.wav  (served at /clips/...)
"""
import argparse
import asyncio
import json

import _common
from app.clips import render_profile_clips

ap = argparse.ArgumentParser()
ap.add_argument("--profile", default="default")
ap.add_argument("--embedding", default="")
ap.add_argument("--lang", default="hi-IN")
ap.add_argument("--elder-name", default="आप")
ap.add_argument("--guardian-name", default="Kavach")
ap.add_argument("--gender", default="m", choices=("m", "f"))
ap.add_argument("--mock", action="store_true", help="write silent placeholder WAVs (zero credits)")
a = ap.parse_args()


async def go():
    emb = json.load(open(a.embedding, encoding="utf-8")) if a.embedding else None
    clips = await render_profile_clips(
        profile=a.profile, lang=a.lang, embedding=emb,
        elder_name=a.elder_name, guardian_name=a.guardian_name, gender=a.gender,
        mock=a.mock or None, api_key=_common.api_key() if not a.mock else "",
    )
    for c in clips:
        print("wrote", c)


asyncio.run(go())
