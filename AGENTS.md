# Kavach: agent instructions (source of truth)

Kavach is a real-time scam-call guardian for Indian elders, built for Gnani AI's "Great Indian AI Internship Challenge"
(deadline **10 Nov 2026, 11:59 PM IST**; internal submit target **8 Nov**). A second device listens to a call on speaker,
streams audio to Gnani Prisma (STT), a rule-based detector scores "digital arrest" scam stages, and Kavach speaks a
warning (Gnani Timbre TTS, optionally a consented cloned family voice) and alerts the guardian.
We are building to WIN: working demo, measured results, authentic engagement. Full PRD: docs/PRD_SUMMARY.md.

## Read first, every session
1. `STATUS.md` (what is done / next / blocked)  2. the current phase file in `docs/phases/`
3. `docs/GNANI_API_NOTES.md` before touching any Gnani call  4. `docs/DECISIONS.md` before re-debating a choice

## Repo map
- `apps/api/app/` FastAPI. `session.py` (pipeline), `gnani/stt_stream.py` (Prisma WS), `gnani/tts.py` (TTS+clone),
  `gnani/mock_stt.py` (offline), `interventions.py`, `alerts.py`, `main.py`
- `apps/web/` plain HTML/JS client (`app.js`, `worklet.js` = 16 kHz PCM16 1024-byte frames). Served by the API at `/`.
- `packages/detector/` `kavach_detector`: normaliser, `dictionaries/default.yaml`, `scorer.py`. Pure Python, no I/O.
- `eval/` synthetic call generation (`generate_calls.py`), degrade to 8 kHz mu-law + noise (`degrade.py`), offline replay (`run_eval.py`)
- `scripts/` spikes (`scripts/spikes/`), `prerender_clips.py`.  `assets/warnings.yaml` warning copy.  `fixtures/` mock transcripts.

## Commands
`make setup` · `make test` (offline, must stay green) · `make dev-mock` (zero credits; open `http://localhost:8000/?mock=1&judge=1`)
· `make dev` (live Prisma, uses credits) · `make eval` · `make clips`

## Golden rules (non-negotiable)
1. **Secrets:** never commit keys. `.env` is git-ignored. Gnani key stays server-side; browsers never talk to Gnani.
2. **Credits are scarce (5,000 total).** Tests and dev must run offline via mock STT and saved transcripts. Never call paid
   APIs in loops, tests, or CI. Anything that costs credits is logged in `docs/CREDITS_LOG.md`. Ask the human before any run that
   could exceed ~50 credits (e.g. generating the full eval set).
3. **Synthetic data only.** No real phone numbers, account numbers, Aadhaar, PAN, or recorded real calls anywhere in the repo or demo.
4. **Gnani facts come from `docs/GNANI_API_NOTES.md`** (verified 13 Oct 2026 against docs.gnani.ai). If reality differs from docs,
   record it in `docs/DECISIONS.md`; do not silently guess. Realtime STT frames are EXACTLY 1024 bytes at real-time cadence.
5. **Consent:** voice cloning only with consent checkbox + random-phrase liveness read; embeddings deletable; never clone third parties.
6. **Privacy:** no raw call audio stored. Transcript excerpts only (<=160 chars), auto-deleted after 7 days. Always show a "listening" indicator.
7. **Honest claims:** say "in our tests on synthetic calls". We do NOT intercept phone calls; Kavach listens over speakerphone on a second device.
8. **Detector discipline:** every new phrase class or false positive gets a test in `packages/detector/tests/`. Keep S5 phrases specific
   (generic "transfer karo" once caused a false alarm). `make test` and `make eval` must pass before you finish.
9. **Scope discipline:** stay inside the current phase. No new frameworks, no rewrites, no agent-builder, no native app. Ask first for new dependencies.
10. **Small commits** with clear messages (`feat(api): ...`, `fix(detector): ...`, `docs: ...`).
11. **UI Theme (CoinCompass Law):** All SaaS frontend interfaces (`packages/ui`, `apps/site`, `apps/app`, `apps/admin`) strictly obey `docs/design/THEME.md` and `.agent/rules/ui-theme.md`: body bg `#e3e8dc`, 28px rounded main frame on gradient `linear-gradient(160deg,#0a2a12 0%,#0d3617 45%,#0a2a12 100%)`, accent lime `#c8f542`, Geist/Inter fonts with Indic fallbacks, `solar:` Iconify icons only, and zero fake stats or testimonials.

## Session workflow
Start: read STATUS.md + phase file -> plan in <=8 bullets -> implement -> run `make test` -> manual check in mock UI if UI changed ->
update `STATUS.md` (done / next / blockers / credits used) -> commit.

## Definition of done (any task)
Acceptance criteria in the phase file met; tests added/updated and green; no secrets; STATUS.md updated; docs updated if behaviour changed.

## Code style
Python 3.10+, type hints on public functions, async I/O for network, `logging` not `print` (scripts may print). Keep functions small.
JS: no framework, no build step, ES modules not required. Comments explain WHY (especially protocol constraints).

## Ask the human when
Credits would be spent beyond budget; Gnani behaviour contradicts docs; a decision affects the demo story; a spike fails (see phase fallbacks);
adding dependencies; anything involving real people's voices or data.

## Never
Commit `.env`/embeddings/recordings; call Gnani from the browser; claim call interception; skip the consent flow; spend credits in tests;
change `docs/PRD_SUMMARY.md` scope without recording it in DECISIONS.md.
