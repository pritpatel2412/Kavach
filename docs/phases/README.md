# Phases (work strictly in order; Phase 2 runs parallel to 1 and 3)

| Phase | Dates (2026) | Goal | Exit gate |
|---|---|---|---|
| [0](PHASE-0-setup-spikes.md) | 13-15 Oct | Env + 8 go/no-go spikes | Credit table filled; S2-S8 outcomes in DECISIONS.md |
| [1](PHASE-1-realtime-pipeline.md) | 16-19 Oct | Live Prisma streaming from the browser, reliable | 5-min live session with transcripts, reconnect works |
| [2](PHASE-2-detector.md) | 16-22 Oct | Detector tuned on REAL ASR transcripts | Benign set clean; scam L2 before payment |
| [3](PHASE-3-intervention-ui.md) | 20-23 Oct | Spoken warning, echo gate, polished elder + judge UI | Live scripted call triggers L2/L3 audio, no self-transcription |
| [4](PHASE-4-guardian-cloning-alerts.md) | 24-27 Oct | Guardian onboarding, consent+liveness cloning, Telegram alerts | Cloned clip plays at L2; alert arrives <5 s |
| [5](PHASE-5-launch.md) | 28 Oct | Publish MAIN nominated post | Posts live on LinkedIn + X |
| [6](PHASE-6-eval-hardening.md) | 28 Oct-2 Nov | Synthetic dataset, metrics, hardening, optional LLM layer | Results table + chart; 3 clean live dry runs |
| [7](PHASE-7-polish-submit.md) | 3-8 Nov | Final demo, repo polish, submit | Submitted by 8 Nov |

Each phase file: Goal · Why it matters · Tasks · Files · Acceptance criteria · Pitfalls · Fallbacks · Agent prompt.
At the end of every phase: update `STATUS.md`, commit, tag `phase-N-done`.
