# Kavach — Real-Time Scam-Call Guardian for Indian Elders

> *Phone kaatiye. Yeh scam hai.* Built for Gnani AI's Great Indian AI Internship Challenge.

Kavach runs on a second device next to a phone on speaker. It streams audio to **Gnani Prisma** (Indian-language STT),
scores the stages of a "digital arrest" scam script, and speaks a warning with **Gnani Timbre** (optionally a *consented*
cloned family voice via voice cloning), while alerting a guardian via Telegram. All evaluation metrics derive from synthetic text tests. Kavach does NOT intercept phone calls; it listens acoustically over speakerphone on a second device.

## Demo Quick Start (Zero Credits, Fully Offline)

## Demo Quick Start (Zero Credits, Fully Offline)

### Windows (PowerShell)
```powershell
.\run.ps1 setup          # create venv + install dependencies
.\run.ps1 test           # 79 offline unit tests (0 credits)
.\run.ps1 dev-mock       # runs offline mock server on http://localhost:8000/?mock=1&judge=1
.\run.ps1 eval           # evaluate multi-lingual WER noise & 400 ambient segments
.\run.ps1 blind-eval     # run independent blind evaluation with exact Wilson 95% CIs
```

### Linux / macOS (Make)
```bash
make setup          # venv + dependencies + .env
make test           # 79 offline tests (0 paid credits)
make dev-mock       # runs with KAVACH_MOCK_STT=1 on http://localhost:8000/?mock=1&judge=1
make eval           # evaluate detector across WER levels and ambient audio
```

> **Important Browser Requirement (HTTPS / Localhost):**
> Modern web browsers (Chrome, Safari, Edge, Firefox) strictly enforce secure context restrictions: microphone access (`navigator.mediaDevices.getUserMedia`) and the Screen Wake Lock API (`navigator.wakeLock`) are only permitted on `http://localhost`, `http://127.0.0.1`, or via HTTPS. When deploying to a local mobile device over Wi-Fi, run behind a reverse proxy with TLS (e.g. Caddy, mkcert, or ngrok).

### 3. End-to-End Walkthrough
1. **Guardian Voice Onboarding (`/guardian.html`)**:
   - Register guardian name, gender (for Hindi grammar `बोल रहा हूँ` / `बोल रही हूँ`), and optional Telegram Chat ID.
   - Add elder name and warning language (`hi-IN` / `en-IN` / `gu-IN`).
   - Accept the explicit consent agreement (owner-only, liveness-gated, DPDP compliant).
   - Read the single-use random challenge sentence aloud (or click *Use Demo Voice* in mock environments).
   - Preview the pre-rendered L1, L2, L3 warning clips spoken in the enrolled voice.
2. **Elder Listening Screen (`/?mock=1&judge=1`)**:
   - Tap **START** or click **▶ Replay Hinglish Scam Demo**.
   - Watch the scam transcript stream in, the risk meter climb, and the stage chips (`S1 Authority`, `S2 Accusation`, `S3 Isolation`, `S4 Urgency`, `S5 Payment`) light up.
   - At Level 2 and Level 3, Kavach intervenes with personalized voice warnings. Echo gate mutes incoming audio while the warning speaks.
   - At Level 3, the emergency **1930 Cyber Helpline** call button appears and a signed emergency alert link is dispatched to Telegram.
   - Guardian can join via live push-to-talk intercom at `/alert.html?token=...` or let Kavach fall back to the cloned family warning clip after 20 seconds.
3. **Incident Timeline & Feedback (`/timeline.html`)**:
   - Review the complete transcript segment chronology, stage progression, explainability reasons in Hindi and English, and guardian alert delivery status.
   - Click **सही अलर्ट (Real Scam)** or **गलत अलर्ट (False Alarm)** to submit verification feedback.
4. **Permanent Voice Deletion**:
   - On `/guardian.html`, tap **Delete My Voice** to permanently erase the voice embedding from SQLite and unlink all clip files from disk.

---

## Live Production Mode (Uses Gnani Credits)

To run with live microphone audio and real Gnani API services:
1. Set `GNANI_API_KEY` in `.env` (Auth header `X-API-Key-ID` per official Gnani API docs; no separate token required).
2. Set `KAVACH_MOCK_STT=0`.
3. Run `.\run.ps1 dev` (or `make dev`) and open `http://localhost:8000/?judge=1`.

---

## Project Structure
- `apps/api/app/`: FastAPI backend, WebSocket session pipeline, SQLite persistence (`db.py`), voice enrollment (`routes_voice.py`), interventions, and Telegram alerts.
- `apps/web/`: Vanilla HTML/CSS/JS client: Elder Screen (`index.html`), Guardian Wizard (`guardian.html`), Incident Timeline (`timeline.html`), AudioWorklet (`worklet.js`).
- `packages/detector/`: Pure Python deterministic multi-stage scam detector (`kavach_detector`).
- `eval/`: Synthetic telephony audio evaluation tools (`run_eval.py`, `degrade.py`).
- `docs/`: Architecture, safety guidelines, Gnani API verified specs, and screenshots (`docs/img/`).

## Models & APIs Used
- **Prisma v3 Realtime Stream** (`wss://api.vachana.ai/stt/v3/stream`)
- **Prisma REST STT** (`POST https://api.vachana.ai/stt/v3`) for enrollment liveness
- **Timbre v2.5 TTS** (`POST https://api.vachana.ai/api/v1/tts/inference`)
- **Vachana VC v1** (`POST /api/v1/tts/voice-clone/embeddings`) for consented guardian voice cloning
