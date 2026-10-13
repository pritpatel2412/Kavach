# Phase 0: Setup + spikes (13-15 Oct)
**Goal:** a working dev environment and answers to the 8 risks that could break the plan. **Why:** fail fast; a wrong assumption here costs days later.

## Tasks
- [ ] `make setup`; `make test` green; `make dev-mock` -> `http://localhost:8000/?mock=1&judge=1` shows the scripted scam reach L3 (UI check)
- [ ] Create Gnani API key (app.gnani.ai/voice); put in `.env`; set `KAVACH_MOCK_STT=0` only when testing live
- [ ] **S1** measure credit costs (REST STT 60 s, realtime 60 s, TTS 500 chars, embedding, cloned TTS 500 chars) -> `docs/CREDITS_LOG.md`; fill budget table
- [ ] **S2** `python scripts/spikes/s2_stt_realtime.py --file <hi 16k wav> --lang hi-IN --rate 16000`
- [ ] **S3** same on 8 kHz mu-law-degraded noisy audio (`--rate 8000`; create with `eval/degrade.py`)
- [ ] **S4** run S3 audio with and without `--bias CBI,TRAI,warrant`; count key-term hits
- [ ] **S5** TTS: `scripts/spikes/s5_tts.py` with Nalini/Poorvi/Kaveri; check the voice catalog; check spoken "1930" in `assets/warnings.yaml` text
- [ ] **S6** clone your OWN 20 s voice: `scripts/spikes/s6_clone.py`; Hindi text, then Tamil/Telugu text
- [ ] **S7** on the actual demo device: open the app, start listening, place a real phone call on speaker. Does the mic keep capturing both sides? Try a second device too
- [ ] **S8** echo: play a warning clip while streaming; confirm no self-transcription (needs Phase 3 UI path; do a first check here by playing a clip near the mic)
- [ ] Write all outcomes in `docs/DECISIONS.md` (spike table)

## Files: `scripts/spikes/*`, `docs/CREDITS_LOG.md`, `docs/DECISIONS.md`
## Acceptance criteria
Credit table complete; S2 and S5 pass (or fallback chosen); S6/S7 outcomes recorded with a consequence for the plan.
## Pitfalls
Audio must be mono PCM16 at the declared rate (ffmpeg: `ffmpeg -i in.mp3 -ac 1 -ar 8000 -c:a pcm_s16le out.wav`). Invalid bias list is silently ignored: to confirm boosting is active, send an `update_settings` frame and read `bias_word_count` in the `settings_updated` reply.
## Fallbacks
S7 fails on phones -> two-device design stays (tablet/laptop/old phone). S6 poor for a language -> use default Timbre voice for that language. S2 poor on hi-IN -> try `en-IN` for Hinglish and compare.
## Agent prompt
"Read AGENTS.md, STATUS.md and docs/phases/PHASE-0-setup-spikes.md. Run `make setup && make test`. Verify mock UI. Then help me run spikes S1-S6 one at a time with the scripts in scripts/spikes, interpret results, and update docs/CREDITS_LOG.md and docs/DECISIONS.md. Do not spend credits beyond the spike list."
