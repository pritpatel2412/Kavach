# Decisions log (ADR-lite). Add a row when a spike or experiment changes the plan.

| # | Date | Decision | Why | Status |
|---|---|---|---|---|
| 1 | 13 Oct | Product = Kavach scam-call guardian | Fresh, high-impact, demo-friendly; uses STT+TTS+cloning | Accepted |
| 2 | 13 Oct | Second-device deployment (no call interception) | OS restrictions on call audio; honest framing | Accepted; verify S7 |
| 3 | 13 Oct | Raw WebSocket to Prisma via backend proxy | Need VAD headers (SDK lacks them); browser cannot set headers; key stays server-side | Accepted |
| 4 | 13 Oct | Rule-first detector; LLM optional | Latency, explainability, offline tests | Accepted |
| 5 | 13 Oct | Pre-render warning clips | Zero latency/credits during a call | Accepted |
| 6 | 13 Oct | Evon not on critical path | Not on API platform; needs big GPU | Accepted |
| 7 | 13 Oct | S5 phrases kept specific; fuzzy only >= 14 chars | Regression found by first eval run | Accepted |
| 8 | 13 Oct | AGENTS.md is the source of truth; AGENT.md/CLAUDE.md/GEMINI.md point to it | Antigravity and others read AGENTS.md/GEMINI.md | Accepted |

## Spike outcomes (fill in)
| Spike | Result | Consequence |
|---|---|---|
| S1 credit costs | | |
| S2 realtime STT hi-IN 16 kHz | | |
| S3 8 kHz noisy | | |
| S4 word boosting on/off | | |
| S5 TTS voices + number pronunciation | | |
| S6 cloning quality (Hindi + 1 southern language) | | |
| S7 browser mic during native call | | |
| S8 echo gate | | |
