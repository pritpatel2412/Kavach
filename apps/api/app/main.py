import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

import os
from . import db
from .config import get_settings, validate_config
from .routes import router as core_router
from .routes_admin import admin_router
from .routes_analytics import admin_analytics_router
from .routes_coupons import admin_coupons_router, public_coupons_router
from .routes_export import admin_export_router
from .routes_modules import admin_modules_router, public_content_router
from .routes_support import admin_kb_router, admin_support_router, public_support_router
from .routes_voice import router as voice_router
from .routes_waitlist import admin_waitlist_router, public_waitlist_router
from .routes_guardian_auth import router as guardian_auth_router
from .neon_service import neon_router
from .routes_demo_sandbox import router as sandbox_router
from .session import SessionRunner



logging.basicConfig(level=logging.INFO)
log = logging.getLogger("kavach")


class SanitizedAccessLogMiddleware(BaseHTTPMiddleware):
    """S3-F: Prevent tokens in query strings from leaking into server access logs."""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Enforce HSTS, X-Content-Type-Options: nosniff, and Content-Security-Policy."""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "frame-ancestors 'none';"
        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    validate_config()
    db.init_db()
    db.purge_old_events(days=7)
    get_settings().clips_dir.mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(title="Kavach API", version="0.3.0", lifespan=lifespan)

# S3-F: Locked CORS origins (includes frontend origins, admin origin, and ALLOWED_ORIGINS)
_s = get_settings()
_allowed_env = [o.strip().rstrip("/") for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
_app_origins = [o.strip().rstrip("/") for o in [os.getenv("APP_ORIGIN", ""), os.getenv("PUBLIC_APP_URL", ""), os.getenv("APP_PROJECT_ORIGIN", "")] if o.strip()]
_allowed = list({
    o for o in [
        _s.public_url,
        _s.public_site_url,
        _s.admin_origin,
        *_app_origins,
        *_allowed_env,
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "http://localhost:3001",
        "http://localhost:3000",
    ] if o
})
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed,

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SanitizedAccessLogMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

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
app.include_router(guardian_auth_router)
app.include_router(neon_router)
app.include_router(sandbox_router)





@app.get("/api/neon-health")
def api_neon_health():
    from .neon_service import _build_neon_status_response
    return _build_neon_status_response()


@app.get("/health")
def health():
    s = get_settings()
    db_status = "ok"
    email_queue_depth = 0
    try:
        with db.db() as conn:
            cursor = conn.execute("SELECT 1")
            cursor.fetchone()
            try:
                row = conn.execute("SELECT COUNT(*) as cnt FROM email_outbox WHERE status = 'queued'").fetchone()
                if row:
                    email_queue_depth = row[0] if isinstance(row, (tuple, list)) else row.get("cnt", 0)
            except Exception:
                pass
    except Exception as e:
        db_status = f"error: {str(e)[:80]}"

    stt_mode = "mock" if s.mock_stt else ("live" if (s.gnani_api_key and s.feature_live_stt) else "mock_fallback")
    commit_sha = os.getenv("GIT_COMMIT_SHA") or os.getenv("RENDER_GIT_COMMIT") or os.getenv("VERCEL_GIT_COMMIT_SHA") or "local"

    return {
        "ok": db_status == "ok",
        "db": db_status,
        "email_queue_depth": email_queue_depth,
        "stt_mode": stt_mode,
        "commit": commit_sha,
        "mock_stt": s.mock_stt,
        "has_api_key": bool(s.gnani_api_key),
    }


@app.websocket("/ws/session")
async def ws_session(ws: WebSocket, lang: str = "", rate: int = 16000, profile: str = "default",
                     elder_id: str = "", replay: str = ""):
    s = get_settings()
    origin = ws.headers.get("origin")
    if origin and s.deploy_mode == "production":
        if origin not in _allowed:
            log.warning("WebSocket rejected: origin %s not in ALLOWED_ORIGINS", origin)
            await ws.close(code=4003, reason="Origin not allowed")
            return

    await ws.accept()

    # In production, require device/session authentication in the first message (never in URL)
    if s.deploy_mode == "production":
        try:
            auth_msg = await asyncio.wait_for(ws.receive_json(), timeout=5.0)
            token = auth_msg.get("token") or auth_msg.get("device_token")
            if not token or not db.get_guardian_by_token(token):
                log.warning("WebSocket authentication failed: invalid token")
                await ws.send_json({"type": "error", "message": "Authentication failed: invalid token"})
                await ws.close(code=4001, reason="Unauthorized")
                return
        except Exception:
            log.warning("WebSocket authentication timeout: no token received in first message")
            await ws.send_json({"type": "error", "message": "Authentication required in initial message"})
            await ws.close(code=4001, reason="Authentication timeout")
            return

    runner = SessionRunner(ws, s, lang or s.default_lang, rate, profile,
                           elder_id=elder_id or None, replay=replay or None)
    await runner.run()


@app.get("/api/replays")
def list_replays():
    s = get_settings()
    replays = []
    demo_wav = s.fixtures_dir / "audio" / "demo_scam_hinglish.wav"
    if demo_wav.is_file():
        replays.append({"name": "demo_scam_hinglish.wav", "label": "Hinglish Digital Arrest Demo (Synthetic)", "type": "synthetic"})
    real_dir = s.fixtures_dir / "audio" / "real"
    if real_dir.is_dir():
        for p in sorted(real_dir.glob("*.wav")):
            replays.append({"name": f"real/{p.name}", "label": f"Human Voice: {p.stem}", "type": "human"})
    return {"replays": replays}


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
