import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from . import db
from .config import get_settings
from .routes import router as core_router
from .routes_admin import admin_router
from .routes_analytics import admin_analytics_router
from .routes_coupons import admin_coupons_router, public_coupons_router
from .routes_export import admin_export_router
from .routes_modules import admin_modules_router, public_content_router
from .routes_support import admin_kb_router, admin_support_router, public_support_router
from .routes_voice import router as voice_router
from .routes_waitlist import admin_waitlist_router, public_waitlist_router
from .session import SessionRunner



logging.basicConfig(level=logging.INFO)
log = logging.getLogger("kavach")


class SanitizedAccessLogMiddleware(BaseHTTPMiddleware):
    """S3-F: Prevent tokens in query strings from leaking into server access logs."""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    db.purge_old_events(days=7)
    get_settings().clips_dir.mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(title="Kavach API", version="0.3.0", lifespan=lifespan)

# S3-F: Locked CORS origins (includes frontend origins and admin origin)
_s = get_settings()
_allowed = list({
    _s.public_url,
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    _s.admin_origin,
    "http://localhost:3002",
    "http://127.0.0.1:3002",
    "http://localhost:3001",
    "http://localhost:3000",
})
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SanitizedAccessLogMiddleware)

app.include_router(core_router)
app.include_router(voice_router)
app.include_router(admin_router)
app.include_router(public_waitlist_router)
app.include_router(admin_waitlist_router)
app.include_router(public_support_router)
app.include_router(admin_support_router)
app.include_router(admin_kb_router)
app.include_router(public_coupons_router)
app.include_router(admin_coupons_router)
app.include_router(admin_analytics_router)
app.include_router(admin_export_router)
app.include_router(admin_modules_router)
app.include_router(public_content_router)





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
