@AGENTS.md

# Claude-specific notes
- For any change touching more than 2 files, write a short plan first, then implement.
- Run `make test` after every meaningful change; it is offline and fast.
- Use the mock UI (`make dev-mock`, `/?mock=1&judge=1`) to verify UI work; do not burn credits to check layout.
- Prefer editing existing files over creating new ones. Keep `STATUS.md` current at the end of each session.
- When a Gnani API detail is uncertain, re-read `docs/GNANI_API_NOTES.md` and the linked docs page instead of guessing.
