# STATUS (update at the end of every session)

**Last updated:** 13 Oct 2026 · **Deadline:** 10 Nov 2026 11:59 PM IST · **Submit target:** 8 Nov · **Today = Day 1 of 29**

## Phase tracker
| Phase | Window | Status | Owner |
|---|---|---|---|
| 0 Setup + spikes | 13-15 Oct | **In progress** (scaffold done; spikes S1-S8 pending) | A + B |
| 1 Realtime pipeline | 16-19 Oct | Not started (code skeleton exists; needs live validation) | A |
| 2 Detector v1 + dictionaries | 16-22 Oct | v0 done + tested; needs real ASR transcripts to tune | B |
| 3 Intervention + echo gate + UI | 20-23 Oct | Skeleton done; needs live validation + polish | A + B |
| 4 Guardian onboarding, consent, cloning, alerts | 24-27 Oct | Not started | A / B |
| 5 Launch (nominated post) | 28 Oct | Not started | A + B |
| 6 Eval + hardening (+ optional LLM layer) | 28 Oct-2 Nov | Eval tooling scaffolded, untested live | B / A |
| 7 Polish, demo video, submission | 3-8 Nov | Not started | A + B |
| Buffer | 9-10 Nov | | |

## Done
- Repo scaffold; AGENTS.md/CLAUDE.md/GEMINI.md/.agent rules; phase docs.
- `kavach_detector` (normaliser, dictionaries, scorer) with tests. Fixed fuzzy false-positive found on first eval run.
- API: Prisma realtime proxy client (headers verified against docs), TTS + voice-clone client, session pipeline, interventions, alerts, mock STT.
- Web client: AudioWorklet 16 kHz/1024-byte frames, elder screen, judge panel.
- Offline checks: `make test` -> 21 passing; `make eval` -> fixtures: L2-before-payment 100%, false alarms 0% (tiny fixture set, NOT a result).

## Next 3 actions
1. Create Gnani API key; run Spike S1 (measure credit costs) and fill `docs/CREDITS_LOG.md`.
2. Run Spikes S2-S6 (`scripts/spikes/`); record outcomes in `docs/DECISIONS.md`.
3. Run Spike S7 (browser mic while a real phone call is on speaker) and S8 (echo) on the actual demo device.

## Blockers / open questions
- Credit-to-usage conversion unknown (S1). - VC quality outside Hindi unknown (S6). - Mobile mic during call unknown (S7).
- Exact way posts are "nominated" in the submission form (opens near deadline).

## Latest numbers
Credits remaining: ____ / 5000 · `make eval`: fixtures only · live-latency p50/p95: not measured
