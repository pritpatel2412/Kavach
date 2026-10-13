# Phase 3: Spoken intervention, echo gate, UI (20-23 Oct)
**Goal:** a live scripted call triggers the right spoken warning, never transcribes itself, and looks great on camera.

## Tasks
- [ ] Run `make clips` (default voices; few credits). Listen to every clip; fix text/pronunciation (numbers as words)
- [ ] Verify intervention flow live: L1 soft, L2 loud, L3 final + 1930 button; no repeats inside 45 s; never steps down
- [ ] **Echo gate test (S8):** warning plays while streaming -> confirm no transcript of Kavach's own voice (silence-substitution in `session.py`). Tune `ECHO_GATE_TAIL_S`
- [ ] Elder screen polish: giant button, status ring, large Hindi text, audio-first. Use the `frontend-design` skill/guidance if available; keep no-build plain JS
- [ ] Judge mode polish: readable on a phone recording (large type, chips, risk meter, latency, SYNTHETIC badge)
- [ ] Add a Replay mode: stream a saved audio file through the full pipeline at real-time pace (FR-20) for repeatable demos
- [ ] Measure time-to-warning (segment end -> `intervene` event) in replay; show in judge panel

## Files: `apps/api/app/session.py`, `apps/api/app/interventions.py`, `assets/warnings.yaml`, `apps/web/*`, `scripts/prerender_clips.py`
## Acceptance criteria
Scripted live call: L2 audio plays before the payment-demand turn; no self-transcription in 5 runs; median time-to-warning measured (target <= 3 s); UI legible in a phone screen recording.
## Pitfalls
Autoplay policies: the first user tap must start audio context (the Start button does). Loud warnings feed back into the mic: use the gate; consider lower volume + directional placement.
## Agent prompt
"Read AGENTS.md and docs/phases/PHASE-3-intervention-ui.md. Add replay mode, polish the elder and judge UI, and write offline tests for the echo-gate logic (fake STT). Verify visually in mock mode. List the live checks I must run."
