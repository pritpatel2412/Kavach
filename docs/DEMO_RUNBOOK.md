# Kavach Contest Demo Runbook

**Contest:** Gnani AI's Great Indian AI Internship Challenge  
**Submission Target:** 8 November 2026 · **Final Deadline:** 10 November 2026, 11:59 PM IST  
**System Mode:** 100% Offline Mock Mode (Zero Live Paid Credits) or Guided Live Mode  

---

## 1. Quick Start: Single-Command Contest Demo

Kavach provides one-command demo orchestration that requires **zero manual setup**, zero live API credits, and zero configuration.

### Windows (PowerShell)
```powershell
.\run.ps1 demo
```

### Linux / macOS (Make)
```bash
make demo
```

### Python Cross-Platform
```bash
python scripts/run_demo.py
```

### What Happens Automatically:
1. Starts the FastAPI backend with `KAVACH_MOCK_STT=1` (offline mock STT mode, zero credits).
2. Polls `http://localhost:8000/api/health` until the server is live (within 1.5 seconds).
3. Launches the system's default browser to `http://localhost:8000/?mock=1&judge=1&demo=1`.
4. The web client automatically initiates audio unlock and begins replaying the scripted Hinglish digital arrest scam call.
5. **Visible On-Screen In Real Time:**
   - **Status Ring:** Transitions from Green `SAFE` (L0) to Yellow `CAUTION` (L1) to Flashing Red `CRITICAL THREAT` (L3).
   - **Judge Telemetry Panel:**
     - **Scam Probability / Risk Score:** Climbs in real-time from 0 to 100 / 100.
     - **Stage Chips:** Illuminates sequentially: `S1 Authority` (CBI) &rarr; `S2 Accusation` (Narcotics/Aadhaar) &rarr; `S3 Isolation` (Digital Arrest) &rarr; `S4 Urgency` &rarr; `S5 Payment`.
     - **Time-to-Warning (TTW):** Real-time measurement displayed in milliseconds (median ~580 ms from speech trigger).
     - **Audio Intervention:** Plays the Hindi voice warning: *"पापा, यह फ़र्ज़ी कॉल है। फ़ोन तुरंत काट दीजिए।"*
     - **Guardian Alert:** Logs Telegram push alert and displays push-to-talk intercom link.

---

## 2. 3-Rehearsal Checklist

Execute all three rehearsals in order prior to recording the final submission video or presenting live to contest judges.

### Rehearsal 1: Fully Offline Mock Run (Technical Sanity)
- [ ] Run `python -m pytest -q` and verify all unit and regression tests pass (100% green).
- [ ] Run `python eval/run_eval.py --transcripts eval/fixtures` to verify 100% clean scam recall and 0.0 false alarms.
- [ ] Run `.\run.ps1 demo` (or `make demo`).
- [ ] Confirm browser opens automatically to `http://localhost:8000/?mock=1&judge=1&demo=1`.
- [ ] Verify the scripted call autoplays within 600 ms of page load.
- [ ] Verify audio warning plays clearly through speakers/headphones (browser AudioContext unlocked).
- [ ] Verify `Time to Warning (Median)` metric renders a valid numeric millisecond value.
- [ ] Verify `Detection Reason (Explainability)` renders bilingual cues (Hindi + English).

### Rehearsal 2: Role-Played Human Recording Replay (Authentic Acoustic Test)
- [ ] Place any role-played human recording WAV in `fixtures/audio/real/` (or use `fixtures/audio/demo_scam_hinglish.wav`).
- [ ] Run the CLI replay runner:
  ```bash
  python scripts/replay_human_voice.py --fast
  ```
- [ ] Confirm terminal scorecard displays:
  - `Fund Transfer Blocked: [YES] Warning fired before payment stage`
  - Exact `Time-to-Warning` timestamp in seconds.
- [ ] In the browser demo panel (`http://localhost:8000/?mock=1&judge=1`), open the **Select Recording Replay** dropdown.
- [ ] Select the human voice recording and click **▶ Play Scripted Scam Call**.
- [ ] Verify the stage chips and risk meter reflect the timing of the human speaker's voice.
- [ ] Verify that the guardian Telegram alert link (`/alert.html?token=...`) opens the remote intercom interface.

### Rehearsal 3: Dress Rehearsal & Screen Capture (Camera-Ready)
- [ ] **Recording Tool:** Set OBS Studio or Screen Studio to 1080p, 60 FPS, 16:9 aspect ratio.
- [ ] **Audio Capture:** Enable desktop / browser system audio capture so the Timbre TTS warning audio is captured in high fidelity.
- [ ] **Mandatory Contest Disclaimers:**
  - Verify that the on-screen badge `SYNTHETIC / ROLE-PLAYED` is visible in the header.
  - Verify that the subtitle/caption text states: *"Role-played call on synthetic data. Kavach operates on a second device over speakerphone and does not intercept cellular calls."*
- [ ] **Subtitles / Captions:** Use the **Export Captions (SRT)** feature on `http://localhost:8000/demo.html` to generate synchronized subtitles for the 60-second video.
- [ ] Run through the complete 60-second narrative per `docs/DEMO_SCRIPT.md`:
  - 0–4s: Problem slide (297,727 complaints & ₹4,057 Cr lost).
  - 4–12s: Kavach tabletop device on standby.
  - 12–32s: Scammer speakerphone audio playing; chips lighting up (S1 &rarr; S2 &rarr; S3 &rarr; S4).
  - 32–42s: Red ring flash, Hindi warning audio intervention, and guardian phone alert.
  - 42–52s: Evaluation scorecard (97.3%–100% recall, 0.0 false alarms, measured TTW).
  - 52–60s: Credits slide (Gnani Prisma STT, Timbre TTS, Voice Cloning).

---

## 3. Human Voice Replay Guide

To record a video where a human reads the scammer script without making actual phone calls or spending live API credits:

1. **Record the audio:**
   - Have a consenting role-player read the scam script into a phone or microphone.
   - Save the recording as a standard 16-bit PCM WAV (mono, 16,000 Hz or 8,000 Hz) to:
     ```
     fixtures/audio/real/my_scam_call.wav
     ```
   - *(Note: `fixtures/audio/real/` is strictly `.gitignore`d to prevent any accidental commit of voice data).*
2. **Add matching reference transcript (optional):**
   - Save `fixtures/audio/real/my_scam_call.json` with the spoken lines:
     ```json
     {
       "language": "hi-IN",
       "segments": [
         {"text": "Main CBI headquarters se Inspector bol raha hoon"},
         {"text": "Aapke Aadhaar se illegal parcel link hua hai"},
         {"text": "Aap digital arrest mein hain kisi ko mat batana"},
         {"text": "Verification ke liye turant account mein paise transfer karo"}
       ]
     }
     ```
3. **Execute the replay:**
   ```bash
   python scripts/replay_human_voice.py fixtures/audio/real/my_scam_call.wav
   ```
   Or select it directly from the UI dropdown at `http://localhost:8000/?mock=1&judge=1`.

---

## 4. Failure Contingency Matrix

| Failure Mode | Root Cause | Automatic System Behavior | Presenter Immediate Action |
|---|---|---|---|
| **Wi-Fi / Internet Drop** | Local network loss | Backend operates 100% offline via `KAVACH_MOCK_STT=1`. WebSocket client automatically attempts reconnect every 2.5 seconds. | None needed. Demo continues unaffected because mock STT and pre-rendered audio clips run entirely on `localhost`. |
| **Gnani API Outage / HTTP 500 / 429** | Cloud service interruption during live mode | System automatically falls back to local pre-rendered audio clips (`assets/clips/`) and local rule scorer. | Pass `?mock=1` in URL or switch to `.\run.ps1 demo` for guaranteed zero-dependency presentation. |
| **Browser Mic Permission Denied** | Browser security prompt dismissed or blocked | UI displays `माइक्रोफ़ोन अनुमति नहीं मिली · mic permission denied` and disarms gracefully. | Click the green **▶ Play Scripted Scam Call** button. Scripted replay uses internal audio streaming and requires no microphone permissions. |
| **Browser Autoplay Audio Policy** | Browser blocks audio until user interaction | `unlockAudio()` triggers silent pulse on first click. If launched directly, browser may suppress warning audio. | Click anywhere on the elder screen (or click the Start button once) to unlock the browser AudioContext. |
| **Telegram Bot Offline / Rate Limited** | Telegram API network timeout | Server catches the alert exception without crashing (`alert raised: ...`); logs the incident locally in SQLite. | Open `/timeline.html?session=<id>` in another tab to show the recorded alert record and timeline telemetry. |

---

## 5. Live Smoke Test Protocol (`scripts/live_check.py`)

If testing against live Gnani Prisma and Timbre endpoints before presentation day:

1. **Verify offline first (zero credits consumed):**
   ```bash
   python scripts/live_check.py --dry-run
   ```
2. **Execute live smoke test (consumes ~1.58 calculated credits):**
   ```bash
   python scripts/live_check.py --yes
   ```
3. **Credit Verification:**
   - Prisma Streaming STT: Measured at 1.50 credits / minute.
   - Timbre TTS Synthesis: Measured at ~0.50 credits / 500 characters.
   - Output logs are saved to `eval/live_runs/` and appended to `docs/CREDITS_LOG.md`.
