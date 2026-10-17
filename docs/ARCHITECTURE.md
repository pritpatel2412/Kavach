# Architecture (Sprint 2 Updated)

```
[Second device: browser / PWA]  mic -> AudioWorklet (16 kHz PCM16, 512-sample = 1024-byte frames)
        | WS /ws/session?lang=hi-IN&rate=16000&elder_id=&replay=     ^ JSON events + clip URLs + intercom
        v                                                            |
[FastAPI]  SessionRunner
   browser audio --(echo gate: silence while warning plays)--> SttConnection --wss--> Prisma v3 stream
   Prisma events -> transcript -> RiskScorer (kavach_detector) -> InterventionManager -> {intervene, clip_url, reason}
                                              \-> alerts.py -> Telegram with signed /alert.html link
   /clips/<profile>/<lang>_L<level>.wav  (pre-rendered with Timbre or cloned voice)
   Intercom relay: guardian mic -> WS /ws/intercom?token= -> elder device speaker
```

## REST API (Authentication & Access Control)

### Guardian & Elder Management
- `POST /api/guardians`: `{name, gender: "m"|"f", telegram_chat_id?}` -> `{id, token}`
  * Returns an opaque Bearer authentication token.
- `GET  /api/guardians`: `Authorization: Bearer <token>` -> `{guardians: [...]}` (caller's guardian profile)
- `POST /api/elders`: `Authorization: Bearer <token>`, `{name, language, phone?}` -> `{id}`
  * Guardian ID is inferred from the authenticated Bearer token.
- `GET  /api/elders`: `Authorization: Bearer <token>` -> `{elders: [...]}` (caller's elders only)

### Voice Enrollment & Consent (Liveness-gated & Owner-only)
- `GET  /api/voice/challenge`: -> `{challenge_id, sentence}` (single use, 5 min TTL; rate-limited).
- `POST /api/voice/enroll`: `Authorization: Bearer <token>`, multipart `{audio_file, challenge_id, elder_id, consent="true"}`
  * Verifies elder ownership by the calling guardian (cross-guardian access rejected with 403).
  * Validates explicit consent (`consent="true"`). Rejects mock audio if `KAVACH_MOCK_STT=0`.
  * Verifies audio transcript against challenge sentence via configurable threshold (`LIVENESS_THRESHOLD`, default 75).
  * Obtains voice embedding from Gnani VC API; pre-renders L1–L3 clips.
- `POST /api/voice/preview`: `Authorization: Bearer <token>`, `{voice_profile_id, level}` -> `audio/wav`
  * Verifies voice profile ownership (cross-guardian access rejected with 403).
- `DELETE /api/voice/{voice_profile_id}`: `Authorization: Bearer <token>` -> `{deleted: true}`
  * Verifies voice profile ownership; unlinks files and purges database rows immediately.

### Session Incidents, Device Health & Feedback
- `GET  /api/sessions`: `Authorization: Bearer <token>` -> `{sessions: [...]}`
  * Scoped strictly to sessions belonging to the authenticated guardian's elders.
- `GET  /api/sessions/{session_id}`: `Authorization: Bearer <token>` -> `{id, started_at, ended_at, max_score, max_level, feedback, events: [...], alerts: [...]}`
  * Rejects access if the session does not belong to the calling guardian (403/404).
- `POST /api/sessions/{session_id}/feedback`: `Authorization: Bearer <token>`, `{verdict: "real"|"false_alarm"}` -> `{ok: true}`
- `POST /api/device/heartbeat`: `{session_id, elder_id}` -> `{ok: true}`
  * Sent every 30s by armed elder device. If missed > 90s while armed, triggers guardian Telegram alert.
- `GET  /api/device/status?elder_id=...`: `Authorization: Bearer <token>` -> `{status: "armed"|"offline"|"idle", last_seen_s}`

### Guardian Action Link & Intercom
- Alert Link: Telegram alert sends signed HMAC token link: `/alert.html?token=<signed_token>`.
- `GET  /api/alert/details?token=...`: Validates signature + expiry (15m); returns `{session_id, elder_name, elder_phone, stages, excerpt, reason_hi, reason_en}`.
- `WS   /ws/intercom?token=...`:
  * Validates signed token.
  * Relays one-way 16 kHz PCM audio from guardian mic to elder's `/ws/session`.
  * If guardian does not connect within 20s of an L3 alert, elder automatically plays cloned warning clip.
  * Zero intercom audio persisted.

## WebSocket Protocol (`/ws/session`)

Client -> Server:
- Binary frames: 1024-byte PCM16 mono 16 kHz frames.
- JSON messages:
  - `{"type": "playback_start"|"playback_end"|"stop"}`
  - `{"type": "heartbeat", "session_id": "..."}`

Server -> Client JSON Events:
| type | fields |
|---|---|
| `state` | `state` ("listening"|"stopped"), `lang`, `mock`, `session_id`, `max_score`, `max_level` |
| `stt_connected` / `stt_processing` / `stt_error` | STT telemetry |
| `transcript` | `text`, `segment_index`, `latency_ms`, `audio_ms` |
| `risk` | `score`, `level`, `stages`, `hits`, `segment_index`, `session_id`, `reason_en`, `reason_hi` |
| `intervene` | `level`, `clip_url`, `screen_text`, `clip_text`, `t_ms`, `ttw_ms`, `reason_en`, `reason_hi` |
| `intercom_audio` | `audio` (base64 PCM16), `rate`: 16000 |
| `alert_sent` | `level`, `delivered`, `action_url` |

## Database Schema (`SQLite`)
- `guardians`: `id`, `name`, `gender`, `telegram_chat_id`, `token`, `created_at`
- `elders`: `id`, `guardian_id`, `name`, `language`, `phone`
- `voice_profiles`: `id`, `guardian_id`, `elder_id`, `embedding_json`, `consent_ts`, `liveness_phrase`, `deleted_at`
- `clips`: `id`, `voice_profile_id`, `level`, `language`, `audio_path`
- `sessions`: `id`, `elder_id`, `started_at`, `ended_at`, `max_score`, `max_level`, `synthetic`, `feedback`, `last_heartbeat`
- `events`: `id`, `session_id`, `ts`, `segment_index`, `text_excerpt` (<=160 chars), `stages`, `score`, `level`, `reason_en`, `reason_hi`
- `alerts`: `id`, `session_id`, `ts`, `level`, `delivered`, `action_token`
