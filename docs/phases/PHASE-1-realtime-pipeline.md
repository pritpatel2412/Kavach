# Phase 1: Live realtime pipeline (16-19 Oct)
**Goal:** speak into the browser -> live Prisma transcripts on the judge panel, robustly. **Why:** everything depends on this.

## Tasks
- [ ] Run `make dev` (KAVACH_MOCK_STT=0) and verify end to end with a real mic: transcripts appear, `latency_ms` shown
- [ ] Confirm frames are exactly 1024 bytes at 16 kHz and cadence is steady (log inter-frame gaps for 60 s; no bursts)
- [ ] Tune VAD for the demo environment (start: threshold 0.7, silence 500, speech 200); record the chosen values in DECISIONS.md
- [ ] Validate word boosting is active (send an `update_settings` bias frame and check `bias_word_count` > 0 in `settings_updated`; the `connected` message does not report it). Add Devanagari boost words (`\u` escaped) only after S4 shows benefit
- [ ] Reconnect: kill network briefly; confirm `SttConnection.events()` reconnects; confirm the 14:30 roll works (shorten `ROLL_AT_S` via env for a test)
- [ ] Add `stt_error` handling in UI (visible message), and a "mic permission denied" state
- [ ] Add structured logging of per-segment latency; expose p50/p95 in judge panel (already p50)
- [ ] Unit tests for anything new that can run offline (framing, gating, reconnect logic with a fake socket)

## Files: `apps/api/app/gnani/stt_stream.py`, `apps/api/app/session.py`, `apps/web/app.js`, `apps/web/worklet.js`
## Acceptance criteria
5-minute live session without crash; transcripts for Hindi/Hinglish speech; reconnect works; p50 STT latency measured and written in STATUS.md; `make test` green.
## Pitfalls
Browser mic requires localhost/HTTPS. Do not burst frames. `x-min-segment-ms` too high silently drops short words. Each session costs credits: use short sessions, stop the stream when done.
## Fallbacks
Browser capture unstable -> use `scripts/spikes/s2_stt_realtime.py` file replay as the demo input (replay mode FR-20) and keep live mic as bonus.
## Agent prompt
"Read AGENTS.md, STATUS.md, docs/phases/PHASE-1-realtime-pipeline.md and docs/GNANI_API_NOTES.md. Harden the realtime pipeline per the task list. Write offline tests with a fake websocket. Do not call live APIs; tell me exactly what to run live and what output to paste back."
