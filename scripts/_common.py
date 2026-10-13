import os, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path[:0] = [str(ROOT / "apps" / "api"), str(ROOT / "packages" / "detector")]
from dotenv import load_dotenv  # noqa: E402
load_dotenv(ROOT / ".env")

def api_key() -> str:
    k = os.getenv("GNANI_API_KEY", "")
    if not k:
        sys.exit("GNANI_API_KEY missing. Copy .env.example to .env and fill it in.")
    return k
