# Phase 7: Polish, final demo, submit (3-8 Nov; 9-10 Nov buffer only)
**Goal:** submit a polished, honest, reproducible project by 8 Nov.

## Tasks
- [ ] Feature freeze on 3 Nov: bug fixes only after that
- [ ] Final demo recording (3 rehearsals first; fallback pre-recorded take); update the nominated posts via replies
- [ ] README: 3-command quick start (mock), live setup, architecture, results, limits, safety. Add screenshots/GIF
- [ ] Secret scan (`git grep -n "GNANI_API_KEY="`, check history); ensure no embeddings/recordings committed
- [ ] Final `make test` + `make eval`; numbers in posts == numbers in report
- [ ] Fill `docs/SUBMISSION.md` checklist and written explanation; record each member's contribution
- [ ] Submit via the form; save confirmation; verify posts are live and public
- [ ] Prepare for interviews: 5-min pipeline walkthrough each; list of failures, fixes, trade-offs
## Acceptance criteria
Submission confirmation saved by 8 Nov; posts public; repo public/shareable; both teammates can demo and explain everything.
## Pitfalls
Last-minute dependency changes; unverified claims; leaving posts private; forgetting hashtags/tags.
## Agent prompt
"Read docs/SUBMISSION.md and docs/phases/PHASE-7-polish-submit.md. Audit the repo for secrets, stale docs, broken commands and unverifiable claims; update README; draft the written explanation from docs and the latest eval report."
