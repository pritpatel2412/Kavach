# Phase 2: Detector v1 on real ASR text (16-22 Oct, parallel)
**Goal:** dictionaries and thresholds tuned on REAL Prisma output, with low false alarms. **Why:** false alarms kill the demo and trust; misses kill the story.

## Tasks
- [ ] Collect real ASR transcripts from spikes/live runs (synthetic or role-played speech only) into `eval/fixtures/` (JSON, label scam/benign, noise, lang)
- [ ] Write >= 12 scam and >= 12 benign scripts (4 authority variants: CBI, TRAI, customs, bank/courier; 2 pacing variants). Benign must include innocent police/OTP/transfer/urgent/confidential mentions
- [ ] Add observed ASR spellings/variants to `default.yaml` (Devanagari + Latin). Add a test for each new class
- [ ] Hindi-specific: check number words, Hinglish code-mixing, "digital arrest" variants, "safe account" paraphrases ("सुरक्षित खाते")
- [ ] Review thresholds with `make eval`; document final values in DETECTION_SPEC.md
- [ ] Add `explain()` output (which phrases fired) to the `risk` event (already `hits`); show in judge panel
- [ ] Second language dictionaries (stretch): Tamil or Telugu stages
- [ ] Guardian "false alarm" feedback path (Phase 4) will use the same fixtures; keep format stable

## Files: `packages/detector/**`, `eval/fixtures/*`, `eval/run_eval.py`, `docs/DETECTION_SPEC.md`
## Acceptance criteria
`make eval`: benign false alarms (L2+) <= 5%; scam L2-before-payment >= 90% clean on the fixture set; all detector tests green; every false positive found has a regression test.
## Pitfalls
Over-fitting to your own scripts: write benign cases adversarially. Avoid generic phrases (see regression). Do not tune on the same transcripts you report as results (hold out a test split).
## Agent prompt
"Read AGENTS.md, docs/DETECTION_SPEC.md and docs/phases/PHASE-2-detector.md. Expand eval/fixtures with adversarial benign calls and scam variants (Hindi Devanagari, Hinglish Latin, English), improve default.yaml, add tests, and report `make eval` before/after. Keep S5 specific. No network calls."
