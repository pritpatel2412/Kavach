# Kavach — real-time scam-call guardian for Indian elders

> *Phone kaatiye. Yeh scam hai.*  Built for Gnani AI's Great Indian AI Internship Challenge.

Kavach runs on a second device next to a phone on speaker. It streams audio to **Gnani Prisma** (Indian-language STT),
scores the stages of a "digital arrest" scam script, and speaks a warning with **Gnani Timbre** (optionally a *consented*
cloned family voice via voice cloning), while alerting a guardian. Calls used for testing are synthetic or role-played.

## Quick start (zero credits)
```bash
make setup          # venv + deps + .env
make test           # offline tests
make dev-mock       # open http://localhost:8000/?mock=1&judge=1  -> watch a scripted scam call get caught
```
Live mode: put `GNANI_API_KEY` in `.env`, set `KAVACH_MOCK_STT=0`, run `make dev`, open `/?judge=1`.
(Browsers need HTTPS or localhost for the microphone.)

## Where things are
- Instructions for AI agents/IDEs: `AGENTS.md` (also `AGENT.md`, `CLAUDE.md`, `GEMINI.md`, `.agent/`)
- Progress: `STATUS.md` · Phases: `docs/phases/` · Product: `docs/PRD_SUMMARY.md`
- Gnani API facts: `docs/GNANI_API_NOTES.md` · Architecture: `docs/ARCHITECTURE.md` · Safety: `docs/SAFETY.md`
- Contest plan: `docs/WIN_PLAN.md`, `docs/DEMO_SCRIPT.md`, `docs/SUBMISSION.md`

## Models used
Prisma v2.5 (realtime STT) · Timbre v2.5 (TTS) · Voice cloning `vachana-vc-v1`.
