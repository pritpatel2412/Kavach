# Demo script (60 s) + recording notes
Goal: A viewer with sound off understands it in 5 seconds; with sound on, feels it at 35 s.

| Timestamp | Visual Element | Audio / Voiceover / Captions |
|---|---|---|
| **0–4 s** | Black card: **"297,727 complaints & ₹4,057.7 Cr lost to digital arrest scams (2022 to May 2026)"**<br>*Source: Ministry of Home Affairs / NCRP data reported by NewsBytes/News18* | Low ambient heartbeat / tension tone |
| **4–12 s** | Elder persona with phone on speaker; Kavach tabletop tablet running next to phone with glowing green ring (`SAFE · LISTENING`) | Voiceover: *"Meet Kavach: an ambient real-time scam guardian for Indian elders."* |
| **12–32 s** | Scammer voice plays on phone; Kavach Director panel streams transcript in real-time. Chips light up in order: **S1 Authority** (CBI), **S2 Accusation** (Narcotics), **S3 Isolation** (Digital Arrest), **S4 Urgency** | Scammer: *"You are under digital arrest. Close your door and do not tell your family."* |
| **32–42 s** | Kavach ring flashes red (**LEVEL 3 CRITICAL THREAT**). Cloned family voice intervenes over tablet speaker:<br>**"पापा, यह फ़र्ज़ी कॉल है। फ़ोन तुरंत काट दीजिए।"**<br>Simultaneously, guardian's smartphone buzzes with Telegram alert and push-to-talk intercom link. | *The emotional beat* — familiar family voice breaking the scammer's psychological grip. |
| **42–52 s** | Evaluation scorecard:<br>• **97.3% – 100% scam recall before payment** *(synthetic text tests on 68 calls, 0–20% WER)*<br>• **0.0 false alerts / 1,000 ambient segments** *(400 news, serial, and household segments)*<br>• **[MEASURED_TTW_S]s median time-to-warning** *(acoustic speakerphone runs)* | Voiceover: *"Multi-stage rule scoring stops the scam before any money moves."* |
| **52–60 s** | End card: Built for Gnani AI's Great Indian AI Internship Challenge.<br>Powered by **Gnani Prisma STT**, **Timbre TTS**, and **Voice Cloning**.<br>*#GnaniAI #GreatIndianAIInternshipChallenge* | Audio resolves to clean silence. |

---

## Technical Notes & Studio Recording Checklist
1. **Screen Recording:** Open `http://localhost:8000/demo.html` in a clean Chrome window (or vertical phone layout at `http://localhost:8000/?mock=1&judge=1`).
2. **Subtitles / Captions:** Use the **"📥 Export Captions (SRT)"** button on `demo.html` to generate synchronized `.srt` subtitle files with millisecond timestamps for burning into video.
3. **Disclosure Requirement:** Prominently display *"Role-played call / synthetic data"* on-screen at 12–35s per challenge guidelines.
4. **Zero Call Interception:** Reiterate that Kavach listens over speakerphone on a second device and does not intercept cellular calls.
