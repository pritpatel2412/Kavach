"""Unified local dev/manual testing orchestrator for Kavach.

Starts all 5 services:
1. SMTP Catcher (Port 1025)
2. FastAPI Backend + Mock STT (Port 8000)
3. Marketing Site (Port 3000)
4. Guardian App & Elder Kiosk (Port 3001)
5. Admin Console (Port 3002)
"""
import os
import sys
import time
import signal
import urllib.request
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PY_EXE = sys.executable
PNPM_CMD = "pnpm.cmd" if sys.platform == "win32" else "pnpm"

ENV = {
    **os.environ,
    "KAVACH_MOCK_STT": "1",
    "SMTP_PORT": "1025",
    "SMTP_HOST": "127.0.0.1",
    "EMAIL_MODE": "smtp",
    "ADMIN_ENABLED": "1",
    "ENV": "development",
}

SERVICES = [
    {
        "name": "SMTP Catcher",
        "cmd": [PY_EXE, str(ROOT / "scripts" / "testing" / "smtp_catcher.py")],
        "port": 1025,
        "probe": None,
    },
    {
        "name": "FastAPI Backend",
        "cmd": [PY_EXE, "-m", "uvicorn", "app.main:app", "--app-dir", str(ROOT / "apps" / "api"), "--host", "127.0.0.1", "--port", "8000"],
        "port": 8000,
        "probe": "http://127.0.0.1:8000/health",
    },
    {
        "name": "Marketing Site",
        "cmd": [PNPM_CMD, "--filter", "@kavach/site", "start"],
        "port": 3000,
        "probe": "http://127.0.0.1:3000",
    },
    {
        "name": "Guardian & Elder App",
        "cmd": [PNPM_CMD, "--filter", "@kavach/app", "start"],
        "port": 3001,
        "probe": "http://127.0.0.1:3001",
    },
    {
        "name": "Admin Console",
        "cmd": [PNPM_CMD, "--filter", "@kavach/admin", "start"],
        "port": 3002,
        "probe": "http://127.0.0.1:3002",
    },
]

processes = []

def cleanup(sig=None, frame=None):
    print("\nShutting down all Kavach services...")
    for p in reversed(processes):
        try:
            p.terminate()
            p.wait(timeout=2)
        except Exception:
            try:
                p.kill()
            except Exception:
                pass
    print("All services stopped.")
    sys.exit(0)

signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)

def probe_url(url, timeout=2):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "KavachHealthCheck/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status == 200
    except Exception:
        return False

def main():
    print("=" * 60)
    print(" Starting All Kavach Services for Manual Testing")
    print("=" * 60)

    for svc in SERVICES:
        print(f"Launching {svc['name']} on port {svc['port']}...")
        p = subprocess.Popen(
            svc["cmd"],
            cwd=str(ROOT),
            env=ENV,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        processes.append(p)

    print("\nWaiting for services to become ready...")
    all_ready = False
    for attempt in range(25):
        time.sleep(1)
        ready_count = 0
        for svc in SERVICES:
            if svc["probe"]:
                if probe_url(svc["probe"]):
                    ready_count += 1
            else:
                # port-only check or assume running
                ready_count += 1
        if ready_count == len(SERVICES):
            all_ready = True
            break
        print(f"  [{attempt + 1}/25] {ready_count}/{len(SERVICES)} services responsive...")

    print("=" * 60)
    if all_ready:
        print(" ALL SERVICES ARE LIVE AND READY FOR MANUAL TESTING!")
    else:
        print(" Services started (some still initializing).")
    print("=" * 60)
    print("\nAccess the applications at:")
    print("  - Marketing Site:         http://localhost:3000")
    print("  - Guardian Portal:        http://localhost:3001")
    print("  - Elder Tabletop Kiosk:   http://localhost:3001/elder")
    print("  - Admin Operations:       http://localhost:3002")
    print("  - Real-Time Mock Studio:  http://localhost:8000/?mock=1&judge=1")
    print("  - Backend OpenAPI Docs:   http://localhost:8000/docs")
    print("  - Local SMTP Catcher:     127.0.0.1:1025")
    print("\nPress Ctrl+C to stop all services.\n")
    sys.stdout.flush()

    try:
        while True:
            time.sleep(1)
            # check if any process died
            for i, p in enumerate(processes):
                if p.poll() is not None:
                    svc = SERVICES[i]
                    print(f"Warning: {svc['name']} exited unexpectedly with code {p.returncode}")
    except KeyboardInterrupt:
        cleanup()

if __name__ == "__main__":
    main()
