# Replay audio (FR-20)

`?replay=<name>` on `/ws/session` streams `fixtures/audio/<name>`:

- **Live Prisma** (`KAVACH_MOCK_STT=0`): PCM is sliced into 1024-byte frames and sent at real-time cadence (32 ms @ 16 kHz).
- **Mock STT** (`KAVACH_MOCK_STT=1`): browser/file audio is ignored; the server replays `fixtures/transcripts/<stem>.json` (falls back to `demo_scam_hinglish.json`).

Recorded call audio is **git-ignored**. Do not commit real or long recordings.

Checked in: `demo_scam_hinglish.wav` — a tiny silent 16 kHz PCM16 WAV used only so replay-mode tests and the judge “Replay demo” button have a real file path. It is synthetic silence, not a phone call.
