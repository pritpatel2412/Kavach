#!/usr/bin/env python3
"""scripts/run_demo.py: One-command contest demo launcher for Kavach.

Starts the FastAPI backend in offline mock STT mode (zero credits),
waits for port 8000 to become responsive, and launches the default web browser
to http://localhost:8000/?mock=1&judge=1&demo=1 which autoplays the scripted scam call
and renders live telemetry, stage illuminations, and Time-to-Warning (TTW).
"""
from __future__ import annotations

import os
import subprocess
import sys
import threading
import time
import urllib.request
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEMO_URL = "http://localhost:8000/?mock=1&judge=1&demo=1"


def _wait_and_open():
    """Poll localhost:8000/api/health until server is up, then open browser."""
    start_time = time.monotonic()
    opened = False
    while time.monotonic() - start_time < 15.0:
        time.sleep(0.5)
        try:
            with urllib.request.urlopen("http://localhost:8000/api/health", timeout=1.0) as resp:
                if resp.status == 200:
                    print(f"\n[+] Kavach server live at http://localhost:8000")
                    print(f"[+] Opening browser to Contest Demo: {DEMO_URL}")
                    webbrowser.open(DEMO_URL)
                    opened = True
                    break
        except Exception:
            pass

    if not opened:
        print(f"[*] Opening browser directly: {DEMO_URL}")
        webbrowser.open(DEMO_URL)


def main():
    print("========================================================")
    print("      KAVACH CONTEST DEMO ORCHESTRATOR (OFFLINE MOCK)    ")
    print("========================================================")
    print("Mode: Zero Gnani credits (KAVACH_MOCK_STT=1)")
    print("Demo URL: " + DEMO_URL)
    print("Starting server and browser...\n")

    env = dict(os.environ)
    env["KAVACH_MOCK_STT"] = "1"

    # Launch background thread to open browser when ready
    t = threading.Thread(target=_wait_and_open, daemon=True)
    t.start()

    # Find python executable
    py = sys.executable

    # Run uvicorn
    cmd = [py, "-m", "uvicorn", "app.main:app", "--app-dir", str(ROOT / "apps" / "api"), "--port", "8000"]
    try:
        subprocess.run(cmd, env=env, cwd=str(ROOT))
    except KeyboardInterrupt:
        print("\n[+] Demo stopped by user.")


if __name__ == "__main__":
    main()
