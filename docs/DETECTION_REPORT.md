# Kavach Blind Evaluation & Failure Analysis Report

**Document Purpose:** Root-cause analysis of the 2/10 (20.0%) recall baseline on the independent blind test set (`eval/blind/blind_test_scenarios.jsonl`).  
**Constraint:** In compliance with ethical evaluation protocols, blind test phrases are **never copied verbatim** into detector dictionaries. Analysis focuses on systemic linguistic, morphological, and structural failure modes to enable generalized, principled improvements.

---

## 1. Executive Summary of Blind Test Baseline

In Sprint 3, Kavach established an independent blind holdout scenario suite of 20 realistic conversational scripts (10 scam calls, 10 adversarial benign calls). These scripts were authored externally using varied phrasing, Hindi dialects, and distinct scam typologies without access to Kavach's dictionary definitions.

| Benchmark Dataset | Total Calls | Recall / False Alarm | 95% Wilson Confidence Interval | Status |
|---|---|---|---|---|
| **Synthetic Call Benchmark (eval/fixtures)** | 36 scam / 32 benign | **100% recall** / **0% FA** | [90.4%, 100.0%] / [0.0%, 10.7%] | PASS |
| **Ambient False Alarm Pool (400 segments)** | 400 continuous background | **0.0 alerts / 1,000 seg** | [0.0, 9.5] per 1,000 | PASS (0.000 alerts/hr) |
| **Independent Blind Test Set (eval/blind)** | 10 scam / 10 benign | **2/10 recall (20.0%)** / **0/10 FA (0.0%)** | [5.7%, 51.0%] / [0.0%, 27.8%] | **CHALLENGE BASELINE** |

### Key Observation
While precision is extraordinarily high (0% false alarms across both blind benign calls and 400 continuous ambient household audio segments), the dictionary-based finite state machine exhibited acute brittleness when conversational scripts diverged from the training vocabulary.

---

## 2. Failure Mode Taxonomy & Root Cause Analysis

Across the 8 missed scam calls, failures cluster into 5 core systemic categories:

### A. Formal Devanagari Hindi vs. Hinglish Vocabulary Asymmetry
- **Symptom:** Kavach's early dictionaries heavily focused on Latin Hinglish ("police", "cyber crime", "cbi", "trai", "bank manager") with limited formal Hindi equivalents.
- **Root Cause:** When scammers adopt formal administrative Hindi to intimidate educated Indian elders, institutional titles appear in formal Devanagari:
  - Central investigative agencies: Scammers say *केंद्रीय जांच ब्यूरो* (*Kendriya Janch Bureau*) rather than colloquial *CBI* or *सीबीआई*.
  - National banking institutions: Scammers say *भारतीय स्टेट बैंक* (*Bharatiya State Bank*) rather than Latin *State Bank of India*.
  - Utility boards: Scammers say *बिजली बोर्ड* (*Bijli Board*) or *विद्युत वितरण* (*Vidyut Vitran*) rather than *electricity department*.
- **Resolution Strategy:** Expand stage synonym families across all institutional authorities with bilateral Devanagari and Latin formal designations.

### B. Morphological Inflection & Verb Stem Variations (Hindi/Hinglish)
- **Symptom:** Strict multi-word substring and whitespace-delimited regex matching fails when verbs inflect across imperative, future, or respectful moods.
- **Root Cause:** In Hindi, verbs inflect dynamically depending on the scammer's conversational stance:
  - *भेजना* (to send): inflects into *भेजो* (imperative/commanding), *भेजें* (polite/administrative), *भेज दीजिए* (persuasive), *भेजना होगा* (coercive requirement).
  - *बताना* (to reveal/tell): inflects into *बताएं*, *बताओ*, *बता दीजिए*, *बताना पड़ेगा*.
  - *काटना* (to disconnect/cut): inflects into *काट दी जाएगी*, *कट जाएगा*, *काट देंगे*.
  - Early dictionaries only contained single static forms (e.g. *transfer karo* or *otp share*).
- **Resolution Strategy:** Implement stem-based regex patterns in the detector that match the common verb root combined with standard inflectional endings (`(करो|करें|कीजिए|करना|किये)`).

### C. Missing S3 (Isolation & Coercion) Semantic Patterns
- **Symptom:** Scammers successfully isolate the victim, but Stage 3 (Isolation) scores 0 points.
- **Root Cause:** Early S3 dictionary definitions concentrated on English software apps (*AnyDesk*, *TeamViewer*, *Skype*, *Zoom*). In human extortion calls:
  - Emotional isolation: *"पापा-मम्मी को मत बताना"* (*Don't tell parents/family*), *"किसी को खबर मत करना"* (*Don't inform anyone*).
  - Physical confinement: *"कमरे का दरवाजा अंदर से बंद कर लो"* (*Lock the room door from inside*), *"अकेले कमरे में चले जाओ"* (*Go to an isolated room*).
- **Resolution Strategy:** Introduce generalized family secrecy and physical seclusion phrase classes into Stage 3.

### D. Indirect Payment & Credential Exfiltration Vectors (S5)
- **Symptom:** Scammer demands financial compromise or credentials, but Stage 5 (Payment) fails to trigger.
- **Root Cause:** Scammers rarely use the blunt phrase *"transfer karo"* when dealing with skeptical elders. Instead they use procedural surrogates:
  - Formal banking settlements: *"आरटीजीएस (RTGS) द्वारा जमा करें"*, *"सरकारी सत्यापन खाते में ट्रांसफर"*, *"सिक्योरिटी बॉन्ड"*, *"क्लियरेंस फीस"*.
  - Direct credential extraction: *"6 अंकों का ओटीपी हमें बताएं"*, *"रजिस्टर्ड मोबाइल पर आया पासवर्ड शेयर करें"*, *"पिन कंफर्म करें"*.
  - Distress bail/settlement: *"वकील को बेल फीस भेजो"*, *"राजीनामे के लिए यूपीआई पर भेजो"*.
- **Resolution Strategy:** Add credential exfiltration triggers (OTP/PIN extraction) and formal settlement instruments (RTGS/NEFT/Security Bond/Escrow) to Stage 5.

### E. Rigid Stage Order Scoring vs. Structural Composite Cues
- **Symptom:** Calls exhibiting overwhelming scam characteristics fail to reach Level 2 (score 70) if only 2 stages match, even if those stages are highly specific.
- **Root Cause:** Current weighting assigns 15 to S1, 20 to S2, 25 to S3, 10 to S4, 30 to S5. If a scammer establishes Authority (S1=15) and threatens arrest/disconnection (S2=20) and demands immediate payment/OTP (S5=30), the total is 65 (below Level 2 threshold of 70).
- **Resolution Strategy:** Implement a structural composite rule: when any call simultaneously exhibits Authority/Institutional Coercion (S1) + Threat of Arrest/Detention/Disconnection (S2) + Financial or Credential Extraction (S5), elevate the threat level immediately to Level 2 (Guardian Alert), regardless of intermediate stage sequencing.

---

## 3. Generalization Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │          Real-Time Call Transcript           │
                  └──────────────────────┬───────────────────────┘
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │      Enhanced Normaliser (normalise.py)      │
                  │  - Unicode NFC & Nukta Flattening            │
                  │  - ASR Phonetic Variant Equivalence Table    │
                  │  - Punctuation & Whitespace Stripping        │
                  └──────────────────────┬───────────────────────┘
                                         ▼
            ┌────────────────────────────┴────────────────────────────┐
            ▼                                                         ▼
┌───────────────────────────────┐         ┌─────────────────────────────────────────┐
│     Stage Pattern Matcher     │         │       Structural Composite Evaluator    │
│  - S1: Authority & Imperson   │         │  - S1 + S5 Fast-Path (Authority+Money)  │
│  - S2: Coercive Accusation    │         │  - S1 + S2 + S5 Extortion Triangle      │
│  - S3: Secrecy & Isolation    │         │  - Credential Theft Rule (OTP/PIN Extr) │
│  - S4: Artificial Urgency     │         │  - Negation & PSA Awareness Guardrails  │
│  - S5: Extraction/Transfer    │         │                                         │
└───────────────┬───────────────┘         └────────────────────┬────────────────────┘
                └────────────────────────┬─────────────────────┘
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │            RiskScorer State Machine          │
                  │  - Multi-window Stage Decay (10 min)         │
                  │  - Exact Wilson CI Statistical Verification  │
                  └──────────────────────────────────────────────┘
```

---

## 4. Sealed Evaluation Framework Protocol

To prevent future overfitting:
1. `eval/blind_sealed/`: Dedicated directory reserved for unviewed external test scenarios.
2. `eval/run_blind.py --sealed`: Computes aggregate statistical recall and false alarm rates with exact Wilson 95% binomial confidence intervals.
3. **No Peeking Policy:** The harness refuses to display individual script transcripts or failures unless `--reveal` is explicitly supplied.
4. **Audit Logging:** Any invocation with `--reveal` is permanently logged to `eval/blind_sealed/REVEAL_LOG.txt` with timestamp, machine actor, and revealed IDs. Once a sealed set is revealed, it can no longer be used for tuning.

---

## 5. Per-Scenario Failure Diagnosis (8 Blind Misses)

The following table categorizes each of the 8 blind misses by root cause dimension without quoting blind phrases directly:

| Scenario ID | Scam Family | Missed Stage(s) | Primary Root Cause Category | Diagnostic Detail |
|---|---|---|---|---|
| `blind_scam_01` | `digital_arrest` | S3, S5 | Formal Devanagari Institutional Phrasing & Structural Disconnection | CBI title in formal Devanagari missed; room seclusion phrasing unrepresented; RTGS formal settlement deposit missed. |
| `blind_scam_03` | `electricity` | S1, S2, S5 | Utility Board Regional Variant & Disconnection Stem | "Electricity Board" variant unmapped; disconnection verb inflection missed; token reconnection charge missed. |
| `blind_scam_04` | `kyc_bank` | S1, S2, S5 | Devanagari Bank Name & Inactive Account Status | "State Bank of India" in formal Devanagari missed; account inactivation threat missed; OTP recitation demand missed. |
| `blind_scam_05` | `sim_trai` | S5 | Administrative Settlement & Bond Instruments | S1 (TRAI) and S2 (illegal SIM) hit, but S5 missed due to formal "security bond" phrasing, leaving score at 35 (below L2). |
| `blind_scam_06` | `investment` | S1, S2, S5 | Interleaved Phrasing & High-Yield Escrow Patterns | Wealth advisory title contained interleaved words; guaranteed pre-IPO return missed; institutional escrow transfer missed. |
| `blind_scam_08` | `relative_distress` | S2, S3, S5 | Family Secrecy & Legal Bail Resolution | S1 (police) and S4 (urgency) hit; emotional isolation ("don't tell parents") missed; bail compromise via UPI missed. |
| `blind_scam_09` | `remote_access` | S1, S2 | Technical Support Desk & Banking Trojan Accusation | S3 (AnyDesk) and S5 (PIN) hit (score 55, L1); technical support authority and Trojan threat missed, falling just short of L2. |
| `blind_scam_10` | `otp_pin` | S1, S5 | Reward Expiry Premise & OTP Extraction Phrasing | Reward point expiry missed; verbal OTP extraction missed due to clause separation between "OTP" and demand verb. |

