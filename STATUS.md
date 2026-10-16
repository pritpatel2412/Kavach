# STATUS (update at the end of every session)

**Last updated:** 16 Oct 2026 · **Deadline:** 10 Nov 2026 11:59 PM IST · **Submit target:** 8 Nov

## Phase tracker
| Phase | Window | Status | Owner |
|---|---|---|---|
| 0 Setup + spikes | 13-15 Oct | **Done** (scaffold + fake sockets + unit tests complete) | A + B |
| 1 Realtime pipeline | 16-19 Oct | **Done offline** (WS framing, reconnect, 14:30 roll, mock STT, VAD settings verified) | A |
| 2 Detector v1 + dictionaries | 16-22 Oct | **Done** (5-stage digital arrest scorer, Hinglish normaliser, 100% eval on fixtures) | B |
| 3 Intervention + echo gate + UI | 20-23 Oct | **Done** (echo gate, personalized warning clips, giant elder UI, judge mode telemetry) | A + B |
| 4 Guardian onboarding, consent, cloning, alerts | 24-27 Oct | **Done** (SQLite persistence, 5-step wizard, liveness gate, Telegram alert, timeline feedback) | A + B |
| 5 Launch (nominated post) | 28 Oct | Scaffolded / In preparation | A + B |
| 6 Eval + hardening (+ optional LLM layer) | 28 Oct-2 Nov | S1 LLM second-opinion layer scaffolded + tested; eval harness active | B / A |
| 7 Polish, demo video, submission | 3-8 Nov | In preparation | A + B |
| Buffer | 9-10 Nov | | |

## Done in this Sprint
- **A1. Persistence (`apps/api/app/db.py`):**
  - Complete stdlib `sqlite3` schema: `guardians`, `elders`, `voice_profiles`, `clips`, `sessions`, `events`, `alerts`.
  - Auto-created schema on startup; 7-day auto-purge for transcript excerpts (`purge_old_events`).
  - Unit tests for CRUD, purge, and cascading deletions (`test_db.py`).
- **A2. Voice Routes (`apps/api/app/routes_voice.py`):**
  - `GET /api/voice/challenge`: 5-min TTL, single-use random Hindi/English liveness sentences.
  - `POST /api/voice/enroll`: Strict consent check (`consent="true"`), fuzzy liveness verification against Prisma REST STT transcript, voice embedding extraction via Gnani VC API, pre-rendered L1–L3 clips with personalized elder/guardian names and gendered Hindi grammar.
  - `POST /api/voice/preview`: Instant audio playback of stored pre-rendered clips (zero live latency).
  - `DELETE /api/voice/{id}`: Hard-deletes voice profile database records and unlinks all audio files.
  - Unit tests verifying consent gating, wrong phrase rejection, clip storage, file deletion, and `caplog` assertion proving embeddings are never written to logs (`test_voice.py`).
- **A3 & A4. Sessions, Replay & Resilience (`apps/api/app/session.py`, `apps/api/app/gnani/stt_stream.py`):**
  - Session runner persists sessions, events (excerpts <=160 chars), and Telegram alert deliveries.
  - `ttw_ms` calculated from segment speech end to intervene send time.
  - `replay=` parameter streams audio fixtures at real-time cadence (live) or transcript fixtures (mock).
  - Exact 1024-byte framing buffer; STT connection auto-reconnect on dropped socket; session roll at 14:30 before 15-min cap (`STT_ROLL_AT_S` env-overridable).
  - Echo-gate silence substitution (`gated_audio`) prevents Kavach from self-transcribing while warnings play.
  - Unit tests in `test_resilience.py` and `test_session_mock.py`.
- **A6. Shared Pre-rendering Pipeline (`apps/api/app/clips.py`, `scripts/prerender_clips.py`):**
  - Single unified codebase used by both enrollment endpoint and CLI pre-renderer.
- **A7. End-to-End Offline Integration (`apps/api/tests/test_e2e.py`):**
  - Full flow tested offline: create guardian + elder -> enroll voice -> run mock session -> verify cloned clip URLs and `ttw_ms` on L2/L3 -> assert alert -> retrieve timeline -> submit feedback -> delete voice.
- **B1. Guardian Onboarding Wizard (`apps/web/guardian.html`, `guardian.js`):**
  - 5-step wizard: Guardian Profile -> Elder Profile -> Explicit Consent -> Liveness Reading -> Preview & Manage.
  - Built with rich dark-mode aesthetics, step progress bar, timer, audio playback check, and mock demo voice generation.
- **B2 & B3. Elder Screen & Judge Mode (`apps/web/index.html`, `app.js`):**
  - Elder screen: Elder selection dropdown, giant Start/Stop button, glowing animated status ring (Safe, Caution, Scam Detected), high-contrast Hindi copy, always-visible listening indicator, and 1930 Cyber Helpline quick-dial on L3.
  - Judge mode: SYNTHETIC badge, 5 stage chips (`S1 Authority`, `S2 Accusation`, `S3 Isolation`, `S4 Urgency`, `S5 Payment`), risk score meter, STT latency p50/p95, TTW median, guardian alert status, and Hinglish Scam demo replay.
- **B4. Incident Timeline & Feedback (`apps/web/timeline.html`, `timeline.js`):**
  - Detailed incident report: Session ID, Max Risk Level, Start/End timestamps, Telegram alert status cards, and transcript stream with detected stages.
  - Feedback voting buttons ("Sahi alert / Galat alert") with instant feedback persistence.
- **B5. Verification & Documentation:**
  - Automated browser subagent executed full flow in mock mode and captured visual screenshots into `docs/img/`.
  - Updated `docs/ARCHITECTURE.md`, `README.md`, and `STATUS.md`.

## Latest Numbers
- **Test Suite (`make test`):** 42 passing, 0 failing (offline, zero credits)
- **Evaluation Harness (`make eval`):** L2-before-payment 100%, false alarms 0% (synthetic clean & snr5 fixtures)
- **Credits Spent:** 0 / 5,000 (100% budget intact)
- **Screenshots:** 7 verified screens captured in `docs/img/` (`guardian_step1`, `guardian_step3`, `guardian_step4`, `guardian_step5`, `elder_screen`, `judge_escalation`, `timeline`)

## Next 3 Actions
1. Run live spike verification with real `GNANI_API_KEY` following the Live Checklist.
2. Record credit consumption per operation into `docs/CREDITS_LOG.md`.
3. Record 60-second video demo of the working product on a physical test phone.
