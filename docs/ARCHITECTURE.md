# Architecture

```
[Second device: browser]  mic -> AudioWorklet (16 kHz PCM16, 512-sample = 1024-byte frames)
        | WS /ws/session?lang=hi-IN&rate=16000        ^ JSON events + clip URLs
        v                                             |
[FastAPI]  SessionRunner
   browser audio --(echo gate: silence while warning plays)--> SttConnection --wss--> Prisma v3 stream
   Prisma events -> transcript -> RiskScorer (kavach_detector) -> InterventionManager -> {intervene, clip_url}
                                              \-> alerts.py -> Telegram (guardian)
   /clips/<profile>/<lang>_L<level>.wav  (pre-rendered with Timbre or cloned voice)
```

## WebSocket protocol (browser <-> API)
Client -> server: binary frames (exactly 1024 bytes PCM16 mono 16 kHz) · JSON `{"type":"playback_start"|"playback_end"|"stop"}`.
Server -> client JSON:
| type | fields |
|---|---|
| `state` | state (listening/stopped), lang, mock, max_score/max_level on stop |
| `stt_connected` / `stt_processing` / `stt_error` | passthrough of Prisma events |
| `transcript` | text, segment_index, latency_ms, audio_ms |
| `risk` | score 0-100, level 0-3, stages[], hits[], segment_index |
| `intervene` | level, clip_url (null if clip not rendered), screen_text, clip_text, t_ms |
| `alert_sent` | level, delivered |

## Key design decisions
- Raw WebSocket, not the SDK/Pipecat: need VAD headers; we are not building a conversational agent.
- Rule-first detector (fast, explainable, testable offline); LLM second opinion is optional (Phase 6) with a 1.5 s timeout and rules win on failure.
- Warnings are **pre-rendered** at enrollment: no synthesis latency or credit spend during a call.
- **Echo gate:** while our warning plays (+0.4 s tail) the server substitutes silence frames (keeps VAD cadence) and drops transcripts, so Kavach never analyses its own voice.
- Second-device deployment because mobile OSes restrict apps capturing call audio and browsers often mute mic during a native call (verify in Spike S7).
- Mock STT (`KAVACH_MOCK_STT=1`) replays `fixtures/transcripts/*.json`: whole pipeline testable with zero credits.

## Latency budget (speech end -> warning audio starting)
VAD silence 400-500 ms + Prisma latency (~320 ms in docs) + scorer <50 ms + playback start <300 ms ~= 1.2 s rules-only; <3 s with LLM. Measure; show p50/p95 in judge mode.
