# Kavach: Real-Time Telephonic Extortion Detection and Intervention System

Kavach is an acoustic, second-device guardian system engineered to protect vulnerable seniors in India from telephonic extortion, impersonation fraud, and "digital arrest" scams. The system listens passively over speakerphone during incoming phone calls, streams normalized audio to Indian-language Speech-to-Text models, tracks the syntactic and semantic progression of extortion scripts via a deterministic multi-stage rule engine, and executes real-time voice interventions using familial voice synthesis while alerting family caregivers.

The system does not intercept or tap cellular network traffic. It operates as an acoustic listening appliance placed alongside a senior's mobile device or landline, ensuring compliance with telecommunications regulations and privacy statutes.

---

## Technical Architecture Overview

Kavach is architected as an asynchronous, event-driven monorepo separating real-time audio telemetry, deterministic risk inference, distributed device management, and high-contrast user interfaces.

```
                          [Senior Phone on Speakerphone]
                                        |  (Acoustic Audio)
                                        v
                          [Tabletop Kiosk: /elder]
                    (Web Audio API / AudioWorklet 16 kHz PCM16)
                                        |
                          [Silence / Energy Gating]
                     (Threshold RMS: skips silent chunks)
                                        |
                                        v
                            [Kavach Gateway API]
                     (FastAPI / WebSocket Session Pipeline)
                        /                                \
                       v                                  v
        [Streaming ASR Engine]                  [Offline Evaluation Engine]
     (Gnani Prisma v3 WebSocket /             (Deterministic Mock Engine /
     1024-byte Frame Pipeline)                 Pre-recorded Audio Fixtures)
                       \                                  /
                        \                                /
                         v                              v
                      [Kavach Deterministic Scorer]
                 (packages/detector: S1-S5 State Machine)
                                        |
                 +----------------------+----------------------+
                 | (Level 1: Score >= 40)                      | (Level 2/3: Score >= 70/90)
                 v                                             v
        [Visual Risk Escalation]                    [Spoken Audio Warning]
     (Elder Kiosk / Caregiver Portal)         (Gnani Timbre TTS / Vachana VC v1)
                                                               |
                                                               v
                                                    [Emergency Alert Dispatch]
                                                (Telegram Bot Webhook / 1930 Helpline)
```

---

## Core Subsystems

### 1. Acoustic Audio Capture and Gating Pipeline
- **AudioWorklet Processing (`apps/web/worklet.js`, `apps/app`)**: Captures microphone input at 16,000 Hz, 16-bit linear PCM mono. Packages audio into contiguous 1024-byte frames to match ASR network transport parameters.
- **Client-Side Silence Gating**: Evaluates Root Mean Square (RMS) energy per 200 ms block. Chunks below ambient room baseline are discarded locally before network transmission, reducing speech-to-text cloud compute consumption by approximately 80% while armed.
- **Acoustic Echo Cancellation Gate**: When Kavach plays a spoken audio warning, the microphone stream is muted locally for the exact duration of the synthesized audio buffer plus 350 ms, preventing the detector from analyzing its own warning output.

### 2. Streaming Speech-to-Text Integration
- **Gnani Prisma v3 Adapter (`apps/api/app/gnani/stt_stream.py`)**: Establishes persistent bidirectional WebSocket connections to `wss://api.vachana.ai/stt/v3/stream`. Transmits audio frames at real-time cadence and parses intermediate hypotheses and final segment boundaries.
- **Supported Languages**: Primary optimization for Hindi (`hi-IN`), Indian English (`en-IN`), and Gujarati (`gu-IN`), including code-mixed Hinglish telephony speech.
- **Zero-Credit Mock Engine (`apps/api/app/gnani/mock_stt.py`)**: Replays synthetic transcripts with randomized token jitter and realistic chunk pacing, allowing end-to-end integration testing and UI verification without API credit expenditure.

### 3. Deterministic Extortion Detection Engine (`packages/detector`)
Digital arrest scams follow a repeatable psychological escalation protocol. The detector decomposes transcripts into five sequential stages:

| Stage Identifier | Stage Weight | Semantic and Tactical Classification | Phrasal Indicators |
|---|---|---|---|
| **S1: Authority** | 15 | Impersonation of police, CBI, ED, TRAI, Supreme Court, or Customs. | *police officer, cbi officer, crime branch, customs department, supreme court order* |
| **S2: Accusation** | 20 | Fabricated allegations of contraband, money laundering, or illegal SIM cards. | *parcel seized, mdma drugs, illegal sim card, money laundering case, arrest warrant* |
| **S3: Isolation** | 25 | Coercion to remain on video call, maintain secrecy, or isolate in a room. | *digital arrest, camera on rakhiye, kisi ko batana mana hai, do not disconnect call, isolated room* |
| **S4: Urgency** | 10 | Imposition of severe time pressure and threats of immediate physical seizure. | *within two hours, turant proceed karein, immediate action, warrant issued* |
| **S5: Payment** | 30 | Direction to liquidate assets or transfer funds to a "safe government verification account". | *rbi verification account, safe account transfer, rbi security deposit, clearing fund* |

#### Scoring and Escalation Formula
```
Raw Score = Sum(Weights of distinct stages observed within a 10-minute sliding window)
Progression Bonus = +10 if >= 3 stages appear in canonical chronological order (S1 -> S2 -> S3 -> S4 -> S5)
Total Score = Min(100, Raw Score + Progression Bonus)
```

- **Level 0 (Score < 40)**: Normal conversation. Baseline monitoring active.
- **Level 1 (Score 40 - 69)**: Suspicious interaction. Kiosk indicates visual advisory; caregiver dashboard updates to caution state.
- **Level 2 (Score 70 - 89)**: Confirmed extortion pattern. Local loudspeaker executes familial voice warning: *"Mummy, phone kaat do! Yeh nakli police hai."*
- **Level 3 (Score >= 90 OR S1 + S5 within 180 seconds)**: Imminent financial transfer. Loud alarm executes, push-to-talk caregiver intercom unlocks, signed emergency link dispatches to Telegram, and 1930 Cyber Crime Helpline action triggers.

#### False-Positive Mitigation Rules
1. **Single-Stage Ceiling**: No single stage can trigger Level 1 or higher on its own (maximum individual weight is 30, whereas Level 1 threshold is 40).
2. **Context-Restricted S5**: Generic transactional statements (*"transfer kar do"*, *"rent transfer"*) are explicitly excluded from S5. The detector mandates corroborating phrases such as *"safe account"* or *"verification account"*.
3. **Phonetic Normalization**: Normalizes Devanagari and Latin characters, strips nuktas, standardizes spacing, and executes fuzzy Levenshtein alignment (threshold >= 90) strictly on multi-word compounds exceeding 14 characters.

---

## Security, Privacy, and DPDP Act 2023 Compliance

Kavach is designed under strict statutory privacy constraints outlined by the Digital Personal Data Protection (DPDP) Act 2023:

1. **Zero Permanent Audio Retention**: Raw voice audio from speakerphone calls is processed entirely in volatile memory and never written to disk, object storage, or persistent databases.
2. **Data Minimization on Transcripts**: Extracted text excerpts are capped at a maximum of 160 characters and are automatically pruned from the database after a 7-day rolling window (`purge_old_events`).
3. **Explicit Senior Consent Protocol**: Kiosks enforce an explicit consent check (`notice_version: "2026-10-elder-v1"`) prior to code activation. Senior consent timestamps are immutably logged with the device record.
4. **Anti-Spoof Voice Cloning Enrollment**:
   - Guardians enrolling a familial voice must provide positive affirmation of voice ownership.
   - The onboarding engine issues a dynamic, single-use liveness challenge phrase.
   - Enrollment verifies phrase matching via speech recognition before generating a 512-dimensional speaker embedding via Vachana VC v1.
   - Guardians can delete their enrolled voice embedding at any time via a single API call, which executes hard deletion from the database and unlinks all pre-rendered audio artifacts from disk.
5. **Cryptographic Device Pairing**:
   - Caregivers generate single-use, 6-character alphanumeric pairing codes with a 15-minute Time-To-Live (TTL).
   - Once redeemed by an elder tablet, the server invalidates the code immediately to prevent replay attacks.
   - Devices receive a high-entropy bearer token (`kav_dev_...`). Tokens are stored exclusively as SHA-256 hashes in the database.
   - Devices transmit periodic heartbeats (`POST /api/devices/heartbeat`). If a caregiver revokes device authorization from the dashboard, subsequent heartbeats return `revoked: true`, immediately clearing credentials and resetting the tablet to the setup screen.
6. **Audit Hash Chaining**: Every administrative action (PII unmasking, device revocation, feature flag toggle) is recorded in an append-only audit ledger where each record contains a cryptographic SHA-256 digest of the previous row.

---

## Monorepo Structure

```
kavach/
├── apps/
│   ├── api/                     # FastAPI backend application
│   │   ├── app/
│   │   │   ├── gnani/           # Prisma STT & Timbre TTS adapters + offline mock
│   │   │   ├── db.py            # SQLite & Neon PostgreSQL database access layer
│   │   │   ├── session.py       # Real-time WebSocket audio pipeline
│   │   │   ├── interventions.py # Voice warning synthesis & pre-rendered clips
│   │   │   ├── alerts.py        # Telegram emergency alerting & dispatch
│   │   │   ├── routes_guardian_auth.py # Passwordless OTP auth & device pairing
│   │   │   ├── routes_modules.py# Admin operations, telemetry, and device sync
│   │   │   └── main.py          # Application entrypoint & middleware configuration
│   │   ├── migrations/          # 13 versioned ANSI SQL database migrations
│   │   └── tests/               # Pytest suite (187 unit, integration, and security tests)
│   ├── app/                     # Guardian Web App & Elder Tabletop Kiosk (Next.js 14)
│   │   └── src/app/
│   │       ├── elder/           # Senior citizen Tabletop Kiosk interface (/elder)
│   │       ├── auth/            # Guardian phone OTP & demo access authentication
│   │       ├── onboarding/      # Household, elder, and familial voice wizard
│   │       ├── alerts/          # Push-to-talk caregiver intercom and incident review
│   │       └── page.tsx         # Guardian dashboard with real-time incident telemetry
│   ├── admin/                   # Operator Telemetry & Governance Console (Next.js 14)
│   │   └── src/app/
│   │       └── page.tsx         # 17 operational modules (Devices, Households, Audit)
│   └── site/                    # Marketing & Documentation Portal (Next.js 14)
├── packages/
│   ├── detector/                # Pure Python scam detection package (kavach_detector)
│   │   ├── kavach_detector/
│   │   │   ├── dictionaries/    # Multi-lingual Devanagari & Latin phrasal lexicons
│   │   │   ├── normalizer.py    # Unicode, punctuation, and diacritic normalization
│   │   │   └── scorer.py        # Chronological progression scoring engine
│   │   └── tests/               # Detector accuracy, false-alarm, and advisory test suite
│   ├── ui/                      # CoinCompass design system component library
│   └── api-contract/            # Shared TypeScript types, schemas, and brand tokens
├── eval/                        # Evaluation harnesses & telephony audio simulation
│   ├── run_eval.py              # Statistical evaluation runner across noise profiles
│   ├── degrade.py               # 8 kHz resampling, mu-law quantization, Gaussian noise
│   └── generate_calls.py        # Multi-stage synthetic conversation generator
├── scripts/                     # Operational utilities & audio clip pre-rendering
└── Makefile                     # Developer workflow and test automation targets
```

---

## Hardware and Deployment Topology

### Device Placement
1. **Target Phone**: The senior citizen's regular mobile phone or landline receiving incoming calls, operated on speakerphone.
2. **Tabletop Kiosk**: A secondary low-cost tablet (Android, iPad, or mobile phone) stationed in the living area or beside the telephone base, running the `/elder` web application in continuous armed mode.

### Secure Context Requirements
Modern browser security models restrict microphone input (`navigator.mediaDevices.getUserMedia`) and display retention (`navigator.wakeLock`) strictly to secure origins:
- Permitted origins: `http://localhost`, `http://127.0.0.1`, or secure `https://` contexts.
- Local network testing across Wi-Fi requires a valid TLS certificate or reverse proxy tunnel (e.g., Caddy, mkcert, or Cloudflare Tunnel).

---

## Database Architecture

Kavach implements an interchangeable database driver supporting local development via SQLite 3 and cloud deployment via Neon Serverless PostgreSQL.

```sql
-- Core entities for household monitoring and device trust
CREATE TABLE guardians (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('m', 'f')),
  telegram_chat_id TEXT,
  email TEXT,
  token_hash TEXT
);

CREATE TABLE elders (
  id TEXT PRIMARY KEY,
  guardian_id TEXT NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  language TEXT NOT NULL,
  phone TEXT
);

CREATE TABLE paired_devices (
  id TEXT PRIMARY KEY,
  guardian_id TEXT NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  elder_id TEXT NOT NULL REFERENCES elders(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  label TEXT,
  elder_consent_ts TEXT NOT NULL,
  paired_at TEXT NOT NULL,
  last_heartbeat TEXT,
  revoked INTEGER DEFAULT 0
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  elder_id TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  max_score INTEGER DEFAULT 0,
  max_level INTEGER DEFAULT 0,
  synthetic INTEGER DEFAULT 1,
  feedback TEXT,
  last_heartbeat TEXT,
  offline_alert_sent INTEGER DEFAULT 0
);
```

---

## Empirical Evaluation and Verification

Evaluation metrics are derived from synthetic telephony degradation pipelines reproducing standard Indian telecommunication channel characteristics (8,000 Hz sampling rate, 8-bit ITU-T G.711 mu-law compression, and calibrated ambient room reverberation).

### Detection Performance Benchmark

| Benchmark Scenario | Dataset Size | Scam Recall (Level 2+) | 95% Wilson Confidence Interval | False Alarm Rate (Benign) | 95% Wilson Confidence Interval |
|---|---|---|---|---|---|
| **Original Baseline (Sprint 3)** | 20 Scenarios | 20.0% (2/10) | [5.7%, 51.0%] | 0.0% (0/10) | [0.0%, 27.8%] |
| **Development Holdout (Post-Revision)** | 20 Scenarios | 100.0% (10/10) | [72.2%, 100.0%] | 0.0% (0/10) | [0.0%, 27.8%] |
| **Telephony Channel Degradation (20% WER)** | 70 Scenarios | 97.3% (36/37) | [86.2%, 99.5%] | 0.0% (0/33) | [0.0%, 10.4%] |
| **Continuous Household Ambient Audio** | 400 Segments | — | — | 0.0 per 1,000 | [0.0, 9.5] |

### System Latency Budget

```
[Speech Utterance End]
       |
       |  < 150 ms (VAD Speech-End Detection)
       v
[AudioWorklet Frame Flush]
       |
       |  < 200 ms (WebSocket Transport RTT to ASR Gateway)
       v
[Prisma ASR Final Hypothesis]
       |
       |  < 1.2 ms (packages/detector Rule Scorer Execution)
       v
[Risk Assessment Output]
       |
       |  < 380 ms (Timbre TTS Streaming Chunk Buffer / Synthesis)
       v
[Audio Warning Played Aloud on Tabletop Speaker]

Total End-to-End Latency: ~730 ms (Comfortably within the 3.0 s statutory safety budget)
```

---

## Developer Quickstart

### Prerequisites
- Python 3.10, 3.11, or 3.12
- Node.js 18.x or 20.x
- Modern web browser supporting Web Audio API and WebSockets

### 1. Environment Setup

#### Windows (PowerShell)
```powershell
# Create virtual environment and install dependencies
.\run.ps1 setup

# Execute 187 offline verification tests (0 API credits consumed)
.\run.ps1 test

# Launch local mock environment with test jury tooling
.\run.ps1 dev-mock
```

#### Linux / macOS (Make)
```bash
# Initialize Python virtualenv and install Node dependencies
make setup

# Execute full offline test suite
make test

# Launch mock development environment
make dev-mock
```

Navigate to `http://localhost:8000/?mock=1&judge=1` to access the elder tablet testing view with live mock controls.

### 2. Monorepo Frontend Applications

```bash
# Guardian Dashboard & Tabletop Kiosk (Port 3000)
npm --prefix apps/app run dev

# Operator & Telemetry Admin Console (Port 3001)
npm --prefix apps/admin run dev

# Marketing & Statutory Documentation Site (Port 3002)
npm --prefix apps/site run dev
```

### 3. Production Deployment with Live Gnani APIs
To switch from mock mode to live telecommunication audio processing:
1. Populate your credentials in `.env`:
   ```env
   GNANI_API_KEY=your_gnani_api_key_here
   KAVACH_MOCK_STT=0
   FEATURE_LIVE_STT=1
   DATABASE_URL=postgresql://user:password@ep-example.ap-southeast-1.neon.tech/kavach?sslmode=require
   ```
2. Start the production ASGI server:
   ```bash
   uvicorn apps.api.app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

---

## License and Ethical Disclosures
- Built for Gnani AI's Great Indian AI Internship Challenge.
- All evaluation audio sets were generated synthetically. No actual private phone calls, real identity documents, or real bank account numbers were collected, processed, or stored.
- Designed exclusively for defensive scam mitigation. Voice cloning requires affirmative biometric liveness challenges and remains restricted to consented familial protective interventions.
