import logging

from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles

from .config import get_settings
from .session import SessionRunner

logging.basicConfig(level=logging.INFO)
app = FastAPI(title="Kavach API", version="0.1.0")


@app.get("/health")
def health():
    s = get_settings()
    return {"ok": True, "mock_stt": s.mock_stt, "has_api_key": bool(s.gnani_api_key)}


@app.websocket("/ws/session")
async def ws_session(ws: WebSocket, lang: str = "", rate: int = 16000, profile: str = "default"):
    await ws.accept()
    s = get_settings()
    runner = SessionRunner(ws, s, lang or s.default_lang, rate, profile)
    await runner.run()


_s = get_settings()
_s.clips_dir.mkdir(parents=True, exist_ok=True)
app.mount("/clips", StaticFiles(directory=_s.clips_dir), name="clips")
app.mount("/", StaticFiles(directory=_s.web_dir, html=True), name="web")
