# eval/blind: Burned Evaluation Dataset Notice

> **STATUS: BURNED / RECLASSIFIED AS DEVELOPMENT SET AFTER REVISION**

## History & Integrity Disclosure
1. **Original Holdout Evaluation (Sprint 3):**
   - The 20 scenarios in `blind_test_scenarios.jsonl` (10 scam, 10 benign) were authored as an independent holdout set.
   - On initial evaluation, the detector achieved **2 / 10 scam recall (20.0%, 95% CI: [5.7%, 51.0%])** and **0 / 10 false alarms (0.0%)**.
2. **Failure Analysis & Tuning (Sprint X, Phase X1):**
   - The 8 misses were inspected during failure analysis to identify root causes (documented in `docs/DETECTION_REPORT.md`: Hindi verb inflections, regional authority synonyms, room isolation cues, and composite scoring rules).
   - Rules and dictionaries in `packages/detector/` were revised based on these failure patterns.
3. **Current Status:**
   - Because these test scenarios were inspected and tuned against, **this dataset is BURNED as a true blind holdout set**.
   - In `README.md` and `docs/CLAIMS.md`, the true holdout result is reported solely as the original **2/10 (20.0%)**.
   - Performance on this file is now reported solely as **"10/10 on development set after revision"**.
4. **Clean Holdout Protocol:**
   - Future blind holdouts must be placed into `eval/blind_sealed/` by an independent human evaluator and evaluated with `python eval/run_blind.py --sealed`.
   - `eval/blind_sealed/` remains strictly uninspected and empty until provided by an external human evaluator.
