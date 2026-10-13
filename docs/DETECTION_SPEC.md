# Detection spec

| Stage | Weight | Meaning |
|---|---|---|
| S1_authority | 15 | claims to be police/CBI/TRAI/customs/court |
| S2_accusation | 20 | alleges crime (money laundering, drugs parcel, illegal SIM, warrant) |
| S3_isolation | 25 | secrecy, stay on video/call, "digital arrest" |
| S4_urgency | 10 | time pressure |
| S5_payment | 30 | move money to a "safe/verification account" |

`score = sum(weights of distinct stages seen in last 10 min) (+10 if >=3 stages first-seen in S1..S5 order), cap 100`
Levels: **L1 >= 40**, **L2 >= 70**, **L3 >= 90 OR (S1 and S5 within 180 s)**. Implemented in `packages/detector/kavach_detector/scorer.py`.

## Matching
Normalise text and phrases (lowercase, strip punctuation/nukta/apostrophes). Whitespace-delimited exact phrase match; fuzzy (`rapidfuzz.partial_ratio >= 90`) ONLY for phrases >= 14 chars and multi-word.
Dictionary: `kavach_detector/dictionaries/default.yaml`. Both Devanagari and Latin variants.

## False-positive rules
- One stage alone can never exceed L1 (max single weight 30 < 40).
- Keep S5 specific. Generic phrases ("transfer karo", "rent transfer") are banned: they appear in normal family calls (regression test exists).
- Benign set must include innocent mentions of police, OTP, transfer, confidential, urgent, doctor, courier.

## Tuning loop (zero credits)
1. Run real/synthetic audio through Prisma ONCE (`eval/transcribe_calls.py`) -> `eval/transcripts/*.json`.
2. `make eval` -> see misses; read the transcripts for ASR spellings; add variants/phrases to the YAML.
3. Add a test per fix. Re-run `make test && make eval`. Watch false alarms first, recall second.

## LLM second opinion (Phase 6, optional)
Invoked only when rule score is 30-85. Input: last 8 segments + hits. Output strict JSON `{"scam_probability":0-1,"stages":[...],"reason":"<20 words"}`.
May adjust score within +/-25. Temperature 0, timeout 1.5 s, rules win on failure. Genuine banks/couriers/doctors do not demand safe-account transfers, forbid secrecy, or threaten arrest by phone.
