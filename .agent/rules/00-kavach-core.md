# Kavach core rules (short form of AGENTS.md; AGENTS.md wins on conflict)
- Read STATUS.md and the current docs/phases/PHASE-N file before coding.
- Never commit secrets, voice embeddings, or recordings. Synthetic/role-played data only.
- Never spend Gnani credits in tests/loops; use KAVACH_MOCK_STT=1 and saved transcripts. Log paid runs in docs/CREDITS_LOG.md.
- Prisma realtime: header-based config via backend proxy; frames exactly 1024 bytes at real-time cadence.
- Cloning only with consent + liveness phrase. No raw audio persistence.
- Honest claims: measured on synthetic calls; no call interception.
- `make test` and `make eval` green before finishing. Update STATUS.md.
