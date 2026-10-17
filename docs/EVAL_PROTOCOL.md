# Kavach Evaluation Protocol

This protocol defines the benchmark methodology, tier distinctions, statistical reporting standards, and strict claims boundaries for Kavach.

---

## 1. Evaluation Tiers

To prevent data leakage, overfitting, and misleading marketing claims, Kavach organizes evaluation across four strictly partitioned tiers:

| Tier | Name | Dataset Path | Purpose | Modification Policy | Allowed Public Claims |
|---|---|---|---|---|---|
| **Tier 1** | **Development Set** | `eval/fixtures/` (`dev` split, 34 calls) | Phrase discovery, threshold tuning, and error analysis. | Permitted during iterative sprints. | *"In development tuning on synthetic text"* |
| **Tier 2** | **Held-out Test Set** | `eval/fixtures/` (`test` split, 34 calls) | Internal generalization check on scripted calls. | **FROZEN.** Never tuned on. Evaluated at clean & WER 10/20/30%. | *"In scripted synthetic text tests on held-out calls"* |
| **Tier 3** | **Blind Independent Set** | `eval/blind/*.jsonl` (20 calls) | Independent scripts written by external contributors/models without dictionary access. | **SEALED.** Evaluated by `eval/run_blind.py`; dictionaries are never modified to fit misses. | *"In independent blind synthetic text tests"* |
| **Tier 4** | **Ambient False Alarm Set** | `eval/ambient/` (400 segments: 200 dev, 200 sealed test) | Measures false alert rate per 1,000 segments across continuous TV news, serials, prayers, cooking, and shop chatter. | **SEALED HALF.** Evaluated by `eval/run_eval.py`. | *"X alerts per 1,000 ambient segments (synthetic text tests)"* |
| **Tier 5** | **Real Audio Acoustic Set** | `fixtures/audio/real/*.wav` | Real-world two-phone speakerphone acoustic recordings (ambient noise, reverberation, Indian English/Hinglish accents). | Continuous collection. | *"In acoustic tests on N role-played speakerphone recordings"* |

---

## 2. Mandatory Claims Boundaries

1. **Synthetic vs. Real Audio Distinction:**
   Any performance number derived from text fixtures (JSON, JSONL) **must** be explicitly labelled as **"synthetic text tests"** or **"scripted text benchmarks"**. It is strictly prohibited to describe synthetic text benchmark numbers as *"real-world call accuracy"* or *"field performance"*.

2. **No Call Interception Claims:**
   Kavach does **not** intercept cellular or VoIP calls. Kavach operates on a second device (ambient speakerphone listener). All product descriptions must explicitly state:
   > *"Kavach listens over speakerphone on a second device and does not intercept cellular calls."*

3. **Statistical Confidence Intervals:**
   Bare percentages (e.g. *"100% recall"*) can be misleading when sample sizes are finite. All official evaluation tables must report exact counts ($k / n$) and the exact **Wilson score 95% binomial confidence interval**:
   $$\hat{p}_{center} = \frac{k + \frac{z^2}{2}}{n + z^2}, \quad \text{spread} = \frac{z}{n + z^2} \sqrt{\frac{k(n - k)}{n} + \frac{z^2}{4}}$$
   where $z = 1.96$ for a 95% confidence level.

4. **Ambient Alert Conversion Formula:**
   Ambient false alarm rate is reported as **Alerts per 1,000 Segments**. To convert to estimated real-time ambient alerts per hour:
   $$\text{Alerts per Hour} = \frac{\text{L2+ Alerts}}{\text{Total Ambient Segments}} \times \frac{\text{Ambient Segments}}{\text{Hour}}$$
   where $\text{Ambient Segments per Hour}$ is an acoustic parameter empirically measured from continuous microphone activity (typically 120–240 segments/hour in quiet homes, or 300–450 segments/hour with active television).
