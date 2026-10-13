# PRD summary (agent-readable copy; the long PRD lives in Claude Docs: https://claude.ai/artifact/JNRxpT37khZkZ13U7jN93c)

**Product:** Kavach: second-device "chowkidar" that hears a suspicious call on speaker, detects scam-script stages in Hindi/Hinglish,
and warns the elder aloud (default Timbre voice or consented cloned guardian voice) + alerts the guardian.

**Why it can win:** real, fresh, emotional problem ("digital arrest" scams: 297,727 complaints and ₹4,057.7 crore lost 2022 to May 2026 per
government data reported by News18/NewsBytes); uses 3 Gnani capabilities (realtime STT, TTS, cloning); measurable on synthetic noisy 8 kHz calls;
a 60-second demo with a clear emotional beat. Contest selection = verified engagement on public posts, then interview.

**Goals:** detect before the payment stage; work on noisy telephony audio; trusted-voice warning; guardian alert in seconds; benchmark; 60 s demo.
**Non-goals:** call interception, call blocking, video/deepfake detection, raw-audio storage, native app, agent builder.

**Targets (validate, don't claim):** L2 before payment >= 90% clean / >= 80% at ~5 dB SNR 8 kHz mu-law; false alarms <= 5% on benign calls;
median speech-end-to-warning <= 3 s.

**Detection:** stages S1 authority(15) S2 accusation(20) S3 isolation(25) S4 urgency(10) S5 payment(30); +10 if >=3 stages in typical order;
L1>=40, L2>=70, L3>=90 or S1+S5 within 3 min. Details: `docs/DETECTION_SPEC.md`.

**Must-haves:** realtime STT pipeline; detector; spoken warning; consented clone + liveness; guardian alert; elder screen; judge mode; synthetic dataset + eval; demo video.
**Should:** LLM second opinion; Hindi + Hinglish; false-alarm feedback; session timeline. **Could:** 2nd regional language; WhatsApp; Pipecat variant.

**Contest facts:** 5,000 credits (API platform only); Evon not on API platform; synthetic data only; one nominated post per platform counts for engagement;
hashtags #GnaniAI #GreatIndianAIInternshipChallenge; one award per participant; offers are individual (log each member's contribution).
