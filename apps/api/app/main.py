import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from . import db
from .config import get_settings
from .routes import router as core_router
from .routes_voice import router as voice_router
from .session import SessionRunner

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("kavach")


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    db.purge_old_events(days=7)
    get_settings().clips_dir.mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(title="Kavach API", version="0.2.0", lifespan=lifespan)
app.include_router(core_router)
app.include_router(voice_router)


@app.get("/health")
def health():
    s = get_settings()
    return {"ok": True, "mock_stt": s.mock_stt, "has_api_key": bool(s.gnani_api_key)}


@app.websocket("/ws/session")
async def ws_session(ws: WebSocket, lang: str = "", rate: int = 16000, profile: str = "default",
                     elder_id: str = "", replay: str = ""):
    await ws.accept()
    s = get_settings()
    runner = SessionRunner(ws, s, lang or s.default_lang, rate, profile,
                           elder_id=elder_id or None, replay=replay or None)
    await runner.run()


@app.get("/clips/{profile}/{filename}")
def serve_clip(profile: str, filename: str):
    if "/" in profile or ".." in profile or "/" in filename or ".." in filename:
        raise HTTPException(400)
    base = get_settings().clips_dir.resolve()
    path = (base / profile / filename).resolve()
    try:
        path.relative_to(base)
    except ValueError:
        raise HTTPException(404)
    if not path.is_file():
        raise HTTPException(404)
    return FileResponse(path, media_type="audio/wav")


_web = get_settings().web_dir
app.mount("/", StaticFiles(directory=_web, html=True), name="web")

# keep Path imported for type checkers / tests that patch
_ = Path
