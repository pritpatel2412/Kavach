# Phase 4: Guardian onboarding, consented cloning, alerts (24-27 Oct)
**Goal:** the emotional centrepiece: a consented family voice speaks the warning; the guardian is alerted.

## Tasks
- [ ] Persistence: SQLite (`apps/api/app/db.py`, tables per PRD s12: guardians, elders, voice_profiles, clips, sessions, events). Keep simple, no ORM required
- [ ] Endpoints: `GET /api/voice/challenge` (random sentence), `POST /api/voice/enroll` (audio + consent flag), `POST /api/voice/preview`, `DELETE /api/voice/{id}`
- [ ] Enrollment: consent checkbox -> record 5-30 s reading the random sentence -> Prisma REST transcribes -> must match (fuzzy ok) -> `create_embedding` -> store -> pre-render L1-L3 clips (`synthesize_cloned`) with guardian/elder name templating
- [ ] Hindi grammar: gendered templates ("बोल रहा / बोल रही हूँ") in `warnings.yaml`
- [ ] Guardian wizard UI (`apps/web/guardian.html`): profile, elder, consent, liveness read, preview, delete-my-voice
- [ ] Telegram alert: create bot via BotFather, store chat id; `alerts.py` already sends; add excerpt + timeline link; target < 5 s
- [ ] Session timeline + "Sahi/Galat alert" feedback endpoint
- [ ] Tests: liveness matcher, consent gate (reject without consent), deletion removes files + rows

## Files: `apps/api/app/db.py`, `apps/api/app/routes_voice.py` (new), `apps/web/guardian.html`, `apps/api/app/alerts.py`, `assets/warnings.yaml`
## Acceptance criteria
Enroll -> preview -> live call plays cloned clip at L2; alert received on a phone < 5 s; deletion removes embedding and clips; no embedding or audio in git (`git status` clean).
## Pitfalls
Embeddings are biometric-like data: never log them. Cloned quality may vary by language: fall back to the default voice per language (decision from S6). Keep consent text accurate to Gnani's terms.
## Agent prompt
"Read AGENTS.md, docs/SAFETY.md and docs/phases/PHASE-4-guardian-cloning-alerts.md. Implement the guardian enrollment flow with consent + liveness, SQLite storage, deletion, and tests that run offline by mocking the Gnani client. Never log embeddings."
