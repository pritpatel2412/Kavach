# Kavach: Real-Time Scam-Call Guardian for Indian Elders

> **Tagline:** The second-device guardian that listens, explains, and speaks in a family member's voice to break the scammer's psychological grip before money is lost.

---

## 1. The Problem: India's "Digital Arrest" Epidemic
- **The Scale:** According to the Ministry of Home Affairs (MHA) and the Indian Cybercrime Coordination Centre (I4C), Indians lost over **₹1,750 crore** to digital arrest and cyber extortion scams in the first six months of 2024 alone.
- **Vulnerable Demographic:** Senior citizens and retirees are disproportionately targeted (accounting for over 70% of high-value losses), with individual elderly victims losing their entire life savings and pension corpus (averaging ₹30–80 lakhs per incident).
- **The Psychological Trap:** Scammers weaponize false authority (CBI, Police, ED, Customs, Supreme Court), state coercion, and extreme isolation ("stay on camera, do not disconnect, keep this confidential"). Under acute panic, elders experience cognitive paralysis and comply with "safe account" liquidation demands.
- **The Critical Gap:** Telco spam filters and Truecaller only screen known phone numbers before a call begins. Once an elder answers an untracked VoIP number or spoofed SIM, **zero protection exists during the actual conversation**.

---

## 2. Why Now?
1. **Proliferation of Coercive Scripting:** Scammers no longer rely on simple lottery tricks; they deploy structured multi-stage interrogation protocols lasting 20 to 180 minutes.
2. **Accessible Speech AI:** Gnani AI's high-speed STT (Prisma) and voice cloning (Timbre) allow millisecond-level transcript processing and human-quality voice intervention on the edge.
3. **Hardware Repurposing:** Over 80% of urban Indian households have a retired, functional smartphone or tablet resting in a drawer that can serve as a dedicated tabletop guardian.

---

## 3. How Kavach Works
1. **Zero-Interception Second-Device Architecture:**
   - Kavach runs on a dedicated secondary device (an old phone or tablet) kept on the bedside or living room table.
   - The elder takes suspicious or unknown calls on speakerphone. Kavach captures the room audio via its microphone worklet (16 kHz PCM).
2. **Real-Time Streaming STT (Gnani Prisma):**
   - High-throughput streaming audio websocket with custom acoustic bias terms (`CBI`, `TRAI`, `warrant`, `digital arrest`, `Aadhaar`, `transfer`).
3. **Deterministic Multi-Stage Detector (`kavach_detector`):**
   - Pure Python, zero-network, sub-millisecond scorer tracking 5 distinct psychological stages:
     - **S1 (Authority):** CBI, Customs, Police, ED, Electricity Board, TRAI.
     - **S2 (Accusation):** Narcotics in parcel, money laundering, power cut tonight, account blocked, viral video.
     - **S3 (Isolation):** Stay on video call, confidential, do not tell family, download AnyDesk.
     - **S4 (Urgency):** Right now, within 10 minutes, immediate arrest.
     - **S5 (Payment Demand):** Safe account, verification bond, bail deposit, tell me your OTP/PIN.
   - **Adversarial Benign Filtering:** Built-in semantic negation engine prevents genuine bank security advisories ("never share your OTP", "we will never ask for PIN") from raising false alarms.
4. **Instant Action & Intercom:**
   - **Level 2 (Caution):** Visual warning banner + instant Telegram alert with signed action link sent to the guardian.
   - **Level 3 (Critical Threat):** 
     - Guardian receives Telegram alert with a 1-click `/alert.html` link showing plain Hindi/English explanations, an excerpt, a quick `tel:` button, and a push-to-talk live intercom.
     - **Cloned Voice Fallback:** If the guardian does not speak through the intercom within 20 seconds, Kavach's pre-rendered warning speaks in the child's/guardian's consented voice: *"Mummy, yeh scam call hai! Phone kaat do!"*

---

## 4. Why Voice?
- **Auditory Break:** Under panic, an elder often ignores text notifications or SMS warnings on their screen.
- **Familiarity & Trust:** Hearing the authentic, trusted voice of their son or daughter immediately punctures the scammer's fabricated authority and breaks the fear trance.
- **Ethical Foundation:** Voice cloning is restricted strictly to consenting family guardians reading randomized, single-use liveness challenge phrases. No third-party voices can ever be cloned.

---

## 5. Measured Evaluation Results (Offline Scale Benchmark)
Tested across **68 scripted transcripts** (37 scam calls, 31 adversarial benign calls) in Hindi, Hinglish, and Indian English:

| Metric | WER 0% (Clean) | WER 10% (Light ASR Noise) | WER 20% (Typical Speakerphone) | WER 30% (High Noise) |
|---|---|---|---|---|
| **Scam Recall (L2 before payment)** | **100.0%** | **97.3%** | **97.3%** | **73.0%** |
| **Benign False Alarm Rate (L2+)** | **0.0%** | **3.0%** | **0.0%** | **3.0%** |
| **Test Split Recall (Unseen)** | **100.0%** | **100.0%** | **100.0%** | **73.7%** |
| **Detection Speed (Time to Warning)** | < 650 ms | < 650 ms | < 650 ms | < 750 ms |

*Result: Kavach flags scams before the victim reaches the payment stage in 97.3% of cases even with 20% ASR speech distortion, with zero false alarms on legitimate banking advisories.*

---

## 6. Deployment Pathways
1. **Home Tablet / PWA (Current Direct-to-Consumer):**
   - Free/Freemium web application installable on any Android/iOS phone or tablet.
   - Heartbeat monitoring and Telegram bot alerts for family caregivers.
2. **Telecom Carrier & Device OEM Partnership:**
   - Pre-installed smart speaker appliance (e.g. JioHome, Airtel Xstream, Amazon Echo) acting as an ambient scam-guard for the household.
3. **Banking App SDK Integration:**
   - Bank apps (SBI Yono, HDFC Mobile) embedding Kavach's detector to monitor outgoing UPI payment screens when a voice call is active concurrently on speakerphone.

---

## 7. Threat Model, Ethics & Risks
- **Privacy First (DPDP Act Compliance):** No raw call audio is ever stored on disk or server. Transcripts are limited to short snippets (<=160 chars) auto-expiring in 7 days.
- **Intercom Privacy:** Intercom audio streams live PCM16 directly from guardian mic to elder speaker; zero intercom frames are written to disk.
- **Voice Spoofing Defense:** Liveness verification uses single-use, randomized Hindi/English sentences with similarity bounds (75%–98%) and length checks.
- **Honest Claims:** Kavach does not claim cellular interception; it operates via acoustic room monitoring on speakerphone.

---

## 8. Live Demonstration Plan
1. **Setup:** Elder device armed on laptop (`/?judge=1&mock=1`). Guardian dashboard on mobile (`/guardian.html`).
2. **Normal Routine Call:** Replay benign courier delivery with delivery OTP; show Kavach remaining green (Safe).
3. **Scam Call In Progress:** Scammer claims to be Mumbai Police / CBI narcotics department.
4. **Detection in Action:**
   - S1 (Authority) -> S2 (Accusation) detected in real time.
   - At S3 (Isolation), score hits 70 (Level 2). Screen turns amber; Telegram alert sent to guardian.
   - Scammer demands money transfer (S5). Kavach escalates to Level 3.
5. **Guardian Response:**
   - Guardian taps Telegram action link -> opens `/alert.html`.
   - Sees explanation: *"कॉलर ने खुद को पुलिस बताया और पैसे ट्रांसफर करने को कहा"*.
   - Guardian holds "Push-to-Talk" button: *"Papa, call kaato, main abhi ghar aa raha hoon!"*
   - Audio broadcasts live out of the elder device speaker.
