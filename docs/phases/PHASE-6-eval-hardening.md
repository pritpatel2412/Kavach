# Phase 6: Evaluation + hardening (28 Oct - 2 Nov)
**Goal:** real numbers for the post and submission; the product survives live conditions.

## Tasks
- [ ] Check the credit table; size the eval set to fit (start: `--only` one scenario)
- [ ] `python eval/generate_calls.py` -> synthetic two-speaker calls rendered with Timbre, degraded to clean / 15 dB / 5 dB at 8 kHz mu-law
- [ ] `python eval/transcribe_calls.py` -> Prisma realtime ONCE per file -> `eval/transcripts/` (this script is untested live: fix as needed)
- [ ] `python eval/run_eval.py --transcripts eval/transcripts` -> report.csv + summary.md; tune offline; hold out a test split
- [ ] Measure live time-to-warning in replay mode (median/p95); measure key-term hit rate with vs without word boosting
- [ ] Optional LLM second opinion (`apps/api/app/llm.py`): 30-85 band only, JSON schema in DETECTION_SPEC, 1.5 s timeout, rules win on failure; tests with a fake client
- [ ] Hardening: API error paths (401/403/429/5xx), network drop, mic denied, session roll, gate edge cases; graceful degrade to on-screen warning if TTS fails
- [ ] Results table + one chart for post/submission (honest labels: synthetic calls)
## Acceptance criteria
Report committed (summary.md; transcripts git-ignored unless synthetic and small); 3 clean live dry runs in a row; numbers recorded in STATUS.md and DEMO card.
## Pitfalls
Credits: never regenerate audio to "fix" detector issues: tune offline. Keep a test split untouched. Report false alarms as prominently as recall.
## Agent prompt
"Read AGENTS.md, docs/DETECTION_SPEC.md, docs/CREDITS_LOG.md and docs/phases/PHASE-6-eval-hardening.md. Review eval tooling for bugs, then propose the cheapest dataset size that fits remaining credits. After I paste real transcripts, tune offline and report precision/recall tradeoffs."
