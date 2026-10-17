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
| Sprint 2 Hardening & Scale | 16-17 Oct | **Done** (Bearer auth isolation, device health, live intercom, 68 eval fixtures, camera polish) | A + B |
| 5 Launch (nominated post) | 28 Oct | Scaffolded / In preparation | A + B |
| 6 Eval + hardening (+ optional LLM layer) | 28 Oct-2 Nov | S1 LLM second-opinion layer scaffolded + tested; eval harness active | B / A |
| 7 Polish, demo video, submission | 3-8 Nov | In preparation | A + B |
| Buffer | 9-10 Nov | | |

## Done in Sprint 2 ("Reality, proof and real-world hardening")
- **S2-A. Security & Privacy Hardening:**
  - Opaque random Bearer tokens issued on `POST /api/guardians`; enforced via `require_guardian` dependency across elders, voice enrollment, preview, deletion, session timeline, and feedback.
  - Removed unauthenticated `GET /api/sessions`; session queries strictly scoped to caller's elders.
  - Cross-guardian access rigorously rejected (guardian A cannot read, preview, or delete guardian B's elders, voice profiles, clips, or sessions).
  - Mock-only features (`demo_voice`, mock STT, silent fixtures) server-enforced impossible when `KAVACH_MOCK_STT=0` and hidden in client UI.
  - Liveness similarity threshold configurable via `LIVENESS_THRESHOLD` env with length ratio safeguards against prefix substring attacks; sliding-window rate limiting on `/api/voice/challenge` and `/api/voice/enroll`.
  - LLM layer confirmed OFF by default; consent step displays disclosure line when enabled. Added comprehensive "Known limitations" section to `docs/SAFETY.md`.
- **S2-B. Device Health & Always-On:**
  - PWA manifest (`apps/web/manifest.json`) and mobile meta tags for tabletop deployment on old phones/tablets.
  - Screen Wake Lock API integrated into `app.js` with visibility state re-acquisition to prevent device sleep.
  - Clear device states: `armed`, `reconnecting`, `offline` with visual status indicators.
  - 30s heartbeat interval from armed elder device over WebSocket; backend `check_offline_devices` checks for missing heartbeats >90s and sends guardian Telegram "Kavach went offline" alert with DB state persistence.
- **S2-C. Guardian Action Link & Live Intercom:**
  - Signed, 15-min expiring HMAC-SHA256 action tokens embedded in Telegram alert links (`/alert.html?token=...`).
  - `apps/web/alert.html` renders elder name, alert level, plain Hindi & English reasons, transcript excerpt, quick `tel:` button, and Push-to-Talk intercom.
  - WebSocket `/ws/intercom?token=...` relays 1-way 16 kHz PCM frames from guardian browser mic directly to elder device speaker via `SessionRunner.relay_intercom_audio()`.
  - Zero intercom audio stored on disk or database.
  - 20-second L3 fallback timer: if guardian does not connect to intercom within 20s of an L3 alert, Kavach automatically plays the cloned-voice warning clip.
- **S2-D. Explainability & Scam Families:**
  - Plain-language explainability engine (`format_reason` in `reasons.py`) rendering human-friendly explanations in Hindi and English.
  - Extended scam dictionaries (`default.yaml`) covering Courier/FedEx parcel narcotics, KYC/bank suspension, electricity disconnection, SIM/TRAI deactivation, fake investments, sextortion video calls, relative in distress, and remote access apps (AnyDesk/TeamViewer).
  - Built-in semantic advisory negation (`advisories.py`) protecting genuine bank safety warnings ("never share your OTP", "we will never ask for your PIN") from triggering false alarms.
  - Added Gujarati (`gu-IN`) dictionary (`gu.yaml`) and Level 1–3 warnings in `assets/warnings.yaml`.
- **S2-E. Evaluation at Scale (Offline):**
  - Scripted 68 realistic call transcripts (37 scam calls across all 10 families, 31 adversarial benign calls across 10 categories) in Hindi, Hinglish, and English with fixed 50/50 dev/test split (`eval/fixtures/`).
  - Built synthetic ASR noise generator (`eval/asr_noise.py`) modeling realistic Indian STT speech degradation (word drops, stutter repetitions, phonetic confusions, number mangling) across WER 0%, 10%, 20%, and 30%.
  - Upgraded `eval/run_eval.py` to generate complete evaluation reports by noise level, dev vs test split, and per scam family.
  - Fixed detector bugs: Scam recall improved from 11% to 100% on clean and 97.3% at WER 20%, with 0% false alarms on legitimate banking advisories.
- **S2-F. Real-Audio Tooling:**
  - Built `scripts/live_check.py` requiring explicit `--yes` flag; guides minimal-credit live smoke test and writes latency stats to `eval/live_runs/*.json`.
  - Created `fixtures/audio/README.md` documenting two-phone speakerphone acoustic recording protocol and privacy git-ignore rules.
  - Replay loader in `session.py` strictly verifies and rejects empty or completely silent WAV files with `ValueError`.
- **S2-G. Product & Pitch Assets:**
  - Authored comprehensive `docs/PITCH.md` with sourced MHA/I4C statistics (₹1,750+ Cr digital arrest losses), technical architecture, threat model, evaluation results, and partner deployment paths.
  - Created `docs/VALIDATION.md` with ethical non-deception research interview script, informed consent form template, and role-play test scorecard.
- **S2-H. UI Polish for Camera:**
  - Polished vertical judge layout with real-time explainability reason line, device status, and intercom telemetry.
  - Captured verified screenshots into `docs/img/` (`judge_vertical_scam.png` and `alert_action_vertical.png`).

## Latest Numbers
- **Test Suite (`make test`):** 72 passing, 0 failing (100% offline, zero credits consumed)
- **Evaluation Harness (`eval/run_eval.py`):**
  - **Clean (WER 0%):** Scam Recall: **100.0%** (36/36) · Benign False Alarms: **0.0%** (0/32)
  - **WER 10%:** Scam Recall: **97.3%** (36/37) · Benign False Alarms: **3.0%** (1/33)
  - **WER 20%:** Scam Recall: **97.3%** (36/37) · Benign False Alarms: **0.0%** (0/33)
  - **WER 30%:** Scam Recall: **73.0%** (27/37) · Benign False Alarms: **3.0%** (1/33)
  - **Unseen Test Split (Clean / WER 10% / WER 20%):** **100.0%** Recall (19/19)
- **Credits Spent:** 0 / 5,000 (100% budget intact)
- **Screenshots:** 9 verified screens captured in `docs/img/` (including camera-ready `judge_vertical_scam.png` and `alert_action_vertical.png`)

## Next 3 Actions
1. Execute guided live check with real key: `python scripts/live_check.py --yes` (consumes ~2.5 credits).
2. Record credit consumption row in `docs/CREDITS_LOG.md`.
3. Record 60-second vertical video demo using two physical phones for competition submission.
