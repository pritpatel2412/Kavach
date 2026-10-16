# Architecture

```
[Second device: browser]  mic -> AudioWorklet (16 kHz PCM16, 512-sample = 1024-byte frames)
        | WS /ws/session?lang=hi-IN&rate=16000&elder_id=&replay=     ^ JSON events + clip URLs
        v                                                            |
[FastAPI]  SessionRunner
   browser audio --(echo gate: silence while warning plays)--> SttConnection --wss--> Prisma v3 stream
   Prisma events -> transcript -> RiskScorer (kavach_detector) -> InterventionManager -> {intervene, clip_url}
                                              \-> alerts.py -> Telegram (guardian)
   /clips/<profile>/<lang>_L<level>.wav  (pre-rendered with Timbre or cloned voice)
```

## REST API

### Guardian & Elder Management
- `POST /api/guardians`: `{name, gender: "m"|"f", telegram_chat_id?}` -> `{id}`
- `GET  /api/guardians`: List registered guardians -> `{guardians: [...]}`
- `POST /api/elders`: `{guardian_id, name, language}` -> `{id}`
- `GET  /api/elders`: List registered elders -> `{elders: [...]}`

### Voice Enrollment & Consent (Owner-only & Liveness-gated)
- `GET  /api/voice/challenge`: -> `{challenge_id, sentence}` (random Hindi/English sentence, single use, 5 min TTL)
- `POST /api/voice/enroll`: multipart `{audio_file, challenge_id, guardian_id, elder_id, consent="true"}`
  - Validates explicit consent checkbox (`consent="true"`).
  - Transcribes audio via Prisma REST and verifies against challenge sentence using fuzzy matching (threshold 75%).
  - Calls Gnani `POST /api/v1/tts/voice-clone/embeddings` to extract 768-dim voice embedding (never logged).
  - Pre-renders L1–L3 personalized warning clips with elder name and gendered Hindi grammar. Falls back to default Timbre voice if cloning fails (`fallback: true`).
  - Returns `200 {voice_profile_id, profile, clips:[{lang, level, url, fallback?}]}`.
- `POST /api/voice/preview`: `{voice_profile_id, level: 1|2|3}` -> `audio/wav` (streams stored pre-rendered clip without synthesis latency or cost).
- `DELETE /api/voice/{voice_profile_id}`: -> `{deleted: true}` (hard-deletes voice profile database row and deletes all associated audio clip files from disk).

### Session Incidents & Feedback
- `GET  /api/sessions`: List recent call sessions -> `{sessions: [...]}`
- `GET  /api/sessions/{session_id}`: -> `{id, started_at, ended_at, max_score, max_level, feedback, events: [{ts, segment_index, excerpt, stages, score, level}], alerts: [{ts, level, delivered}]}`
- `POST /api/sessions/{session_id}/feedback`: `{verdict: "real"|"false_alarm"}` -> `{ok: true}`

## WebSocket Protocol (`/ws/session`)

Query parameters:
- `lang`: Language code (`hi-IN` default, `en-IN`)
- `rate`: Sample rate (16000 default)
- `profile`: Voice profile ID (`default` or guardian voice profile ID)
- `elder_id`: Selected elder ID (automatically selects the elder's active voice profile, language, and gender)
- `replay`: Name of synthetic WAV fixture from `fixtures/audio/<name>` to stream at real-time pace (or transcript fixture in mock mode)

### Client -> Server:
- Binary frames: Exactly 1024 bytes (512 samples) PCM16 mono 16 kHz at real-time cadence (32 ms).
- JSON control messages:
  - `{"type": "playback_start"}`: Warning audio playback started on client (activates echo gate).
  - `{"type": "playback_end"}`: Warning audio playback finished (keeps echo gate active for `ECHO_GATE_TAIL_S` = 0.4s).
  - `{"type": "stop"}`: Gracefully end the session.

### Server -> Client JSON Events:
| type | fields |
|---|---|
| `state` | `state` ("listening"|"stopped"), `lang`, `mock` (bool), `session_id`, `max_score`, `max_level` |
| `stt_connected` / `stt_processing` / `stt_error` | Passthrough of Prisma STT events. `stt_processing` marks speech end timestamp. |
| `transcript` | `text`, `segment_index`, `latency_ms`, `audio_ms` |
| `risk` | `score` (0-100), `level` (0-3), `stages` (list), `hits` (list), `segment_index`, `session_id` |
| `intervene` | `level` (1-3), `clip_url` (URL to pre-rendered WAV or null), `screen_text`, `clip_text`, `t_ms`, `ttw_ms` (time-to-warning in ms from speech end) |
| `alert_sent` | `level`, `delivered` (bool) |

## Database Schema (`SQLite`)
Stdlib `sqlite3` at `data/kavach.db` (auto-created on startup, never checked into git):
- `guardians`: `id`, `name`, `gender` ('m'|'f'), `telegram_chat_id`
- `elders`: `id`, `guardian_id`, `name`, `language`
- `voice_profiles`: `id`, `guardian_id`, `elder_id`, `embedding_json`, `consent_ts`, `liveness_phrase`, `deleted_at`
- `clips`: `id`, `voice_profile_id`, `level`, `language`, `audio_path`
- `sessions`: `id`, `elder_id`, `started_at`, `ended_at`, `max_score`, `max_level`, `synthetic`, `feedback`
- `events`: `id`, `session_id`, `ts`, `segment_index`, `text_excerpt` (<=160 chars), `stages`, `score`, `level`
- `alerts`: `id`, `session_id`, `ts`, `level`, `delivered`

Retention: Privacy-first auto-purge drops transcript excerpts and events older than 7 days (`db.purge_old_events(7)` at startup).

## Key Design Decisions
- **Zero Live Latency on Warning:** Clips are pre-rendered at enrollment into `assets/clips/<profile>/<lang>_L<level>.wav`. Zero credit cost and zero synthesis delay during an active call.
- **Echo Gate:** While the client plays a warning (+0.4 s tail), the server feeds silent frames into Prisma VAD and ignores incoming transcripts, preventing Kavach from transcribing or reacting to its own voice.
- **Biometric Privacy:** Voice embeddings are stored in SQLite and never printed or written to log files. Hard deletion immediately drops DB records and unlinks all audio files.
- **Resilience:** Automatic STT WebSocket reconnect on dropped connection, 14:30 session roll before 15-minute Prisma limit, and failure-tolerant Telegram alerts that never interrupt caller monitoring.
