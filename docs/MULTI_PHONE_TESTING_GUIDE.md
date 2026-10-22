# Kavach: End-to-End Multi-Phone Real-World Testing Guide

> **Authoritative Testing Runbook**  
> **System:** Kavach Real-Time Scam-Call Guardian  
> **Architecture:** Second-device acoustic speakerphone listener (zero telecom interception)  
> **Target Scenarios:** Digital Arrest scams, Fake Law Enforcement (CBI/Police), Narcotics parcel extortion  
> **Supported Operational Modes:** Live Gnani AI (Real-time STT/TTS) & Zero-Credit Offline Mock Mode

---

## 1. Architectural Overview & Physical Topology

Kavach **does not tap or intercept cellular phone lines** (which is illegal and technically impossible without carrier-level telco taps). Instead, Kavach operates as an **acoustic tabletop guardian**: it sits on a table next to an elder's smartphone while the elder speaks on speakerphone.

To thoroughly test the entire pipeline end-to-end, you need a multi-device setup.

```
       [ PHONE 1: The Scammer / Caller ]
            (Role-player reads script)
                       │
             Cellular / WhatsApp Call
                       ▼
       [ PHONE 2: The Elder's Phone ]
   (Answers call, switches to LOUDSPEAKER)
                       │
                 Acoustic Audio
                 (10 - 25 cm)
                       ▼
    [ PHONE 3: Kavach Tabletop Sentinel ]  ◄────── Connected to Kavach API
       (Runs Kavach Web Client via Mic)            (Streams to Gnani Prisma STT
         - Live Risk Meter (S1-S5)                  & scores scam stages)
         - Speaks Audio Warning
         - Echo Gate Active
                       │
            Telegram Emergency Alert
                       ▼
    [ PHONE 4: Remote Guardian Phone ]
       (Son / Daughter in another location)
         - Receives Instant Telegram Alert
         - Taps Signed Action Link
         - Push-to-Talk Intercom to Phone 3
```

### Device Role Matrix

| Device | Hardware | Purpose & Setup |
|---|---|---|
| **Phone 1: Scammer** | Any smartphone or landline | Calls Phone 2 via standard voice call or WhatsApp call. Tester reads the scam script aloud. |
| **Phone 2: Elder** | Any smartphone | Receives the call, answers, and turns **LOUDSPEAKER ON** (volume at 80–100%). Placed flat on table. |
| **Phone 3: Kavach Sentinel** | Smartphone / Tablet / Laptop | Placed flat on the table 10–25 cm next to Phone 2. Runs the Kavach web application in Chrome/Safari with the microphone armed (`START` clicked). Listens to Phone 2's speakerphone, transcribes, scores risk, and plays spoken warnings. |
| **Phone 4: Guardian** | Smartphone | The remote son/daughter's phone. Has the Telegram app installed to receive real-time push alerts and opens the remote intercom dashboard. |

> **Note on Device Reductions:**
> - **3-Phone Minimal Setup:** Phone 1 (Scammer), Phone 2 (Elder), Phone 3 (Kavach Sentinel). You can open the Guardian Telegram link directly on Phone 3 or a nearby laptop.
> - **2-Phone Budget Setup:** Phone 1 plays the scammer audio through its speaker, Phone 2 acts as Kavach Sentinel listening to it.

---

## 2. Network & Browser HTTPS Requirement (Crucial)

> [!IMPORTANT]
> **Mobile Browser Security Restriction (`getUserMedia`):**  
> Modern mobile browsers (Google Chrome on Android, Apple Safari on iOS) **strictly prohibit microphone access (`navigator.mediaDevices.getUserMedia`) and the Screen Wake Lock API over plain HTTP (`http://192.168.x.x:8000`)**.  
> The microphone **only** works on `http://localhost`, `http://127.0.0.1`, or over **HTTPS**.

Choose **one** of the following three connectivity setups to connect your mobile devices to Kavach:

### Option A (Recommended): Free Instant HTTPS Tunnel (Cloudflare or ngrok)

This is the fastest, cleanest method. It works across any Wi-Fi or mobile cellular network without messing with phone browser settings or SSL certificates.

#### Using Cloudflare Tunnel (100% Free, No Account Needed):
1. On your host machine (where Kavach backend runs):
   ```powershell
   # If you have cloudflared installed:
   cloudflared tunnel --url http://localhost:8000
   ```
2. Cloudflare will output a public HTTPS URL (e.g. `https://random-subdomain.trycloudflare.com`).
3. Open this HTTPS URL directly on **Phone 3** and **Phone 4**.

#### Using ngrok:
1. On your host machine:
   ```powershell
   ngrok http 8000
   ```
2. Copy the forwarding URL (e.g. `https://abc-123.ngrok-free.app`).
3. In your `.env` file, update:
   ```env
   PUBLIC_URL=https://abc-123.ngrok-free.app
   ```
4. Open the ngrok HTTPS URL on **Phone 3** and **Phone 4**.

---

### Option B: Local Wi-Fi (Android Chrome Insecure Origin Bypass)

If you are on local Wi-Fi without internet access, you can whitelist your computer's local IP inside Android Chrome:

1. Find your computer's local LAN IP:
   ```powershell
   # Windows PowerShell
   Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -match "Wi-Fi|Ethernet" } | Select-Object IPAddress
   ```
   *(Suppose your IP is `192.168.1.15`).*
2. Ensure your backend binds to all interfaces:
   ```powershell
   # Start with --host 0.0.0.0
   uvicorn app.main:app --app-dir apps/api --host 0.0.0.0 --port 8000 --reload
   ```
3. On **Phone 3 (Android)**:
   - Open Chrome and navigate to: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
   - Paste: `http://192.168.1.15:8000`
   - Set dropdown to **Enabled**.
   - Tap **Relaunch** at the bottom.
4. Navigate to `http://192.168.1.15:8000`. Chrome will now allow microphone permissions over HTTP.

---

### Option C: Production Deployed Instance

If you have already deployed Kavach to Render, Railway, or AWS (e.g. `https://kavach.yourdomain.com`):
- Open `https://kavach.yourdomain.com` directly on Phone 3 and Phone 4.
- Microphone access works immediately without any special configuration.

---

## 3. Server Configuration & Setup

### Mode 1: Live Gnani AI Testing (Real Voice & STT)
Use this mode when you want to speak live into the phones and verify Gnani Prisma STT transcription and Timbre voice warnings.

1. Open `.env` in the repository root and verify:
   ```env
   GNANI_API_KEY=your_actual_gnani_api_key_here
   KAVACH_MOCK_STT=0
   FEATURE_LIVE_STT=1
   DEFAULT_LANG=hi-IN
   
   # Telegram Guardian Alerts
   TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
   TELEGRAM_CHAT_ID=your_personal_telegram_chat_id
   
   # Server Base URL (HTTPS tunnel or local IP)
   PUBLIC_URL=https://your-ngrok-or-tunnel-url.ngrok-free.app
   ```
2. Start the server:
   ```powershell
   .\run.ps1 dev
   ```

### Mode 2: Zero-Credit Offline Mock Testing (Full E2E without spending API credits)
Use this mode if you want to test the multi-device physical setup, WebSocket streaming, UI animations, audio warning playback, Telegram alerts, and guardian intercom without consuming Gnani API credits.

1. Start the mock server:
   ```powershell
   .\run.ps1 dev-mock
   ```
2. On Phone 3, append `?mock=1&judge=1` to the URL:
   `https://your-url.ngrok-free.app/?mock=1&judge=1`

---

## 4. Pre-Flight Device Check (1 Minute)

Perform this quick check before starting the simulated phone call:

### On Phone 3 (Kavach Sentinel Device):
1. Open the Kavach web app (`https://your-url/?judge=1` or `/?mock=1&judge=1`).
2. **Audio Unlock:** Tap anywhere on the screen (or tap the **START** button once) so the mobile browser's autoplay audio policy allows Kavach to speak warnings out loud.
3. **Microphone Permission:** When prompted, select **"Allow while using app"**.
4. **Arming:** Tap **"सुनना शुरू करो · START"**.
   - Status Ring turns Green (`सुरक्षित · SAFE`).
   - Badge displays `Kavach आर्मड · Armed & Listening`.
   - Screen Wake Lock activates (prevents the phone screen from sleeping during the call).

### On Phone 4 (Guardian Phone):
1. Open your Telegram app and ensure you have started a chat with your Kavach Telegram bot (`/start`).
2. Keep Phone 4 on the table or in another room.

### Physical Acoustic Placement:
```
           ┌──────────────────────┐
           │      PHONE 2         │
           │   (Elder Speaker)    │
           │                      │
           │    [Volume: 80-100%] │
           └──────────┬───────────┘
                      │
                   15 cm
                      │
           ┌──────────▼───────────┐
           │      PHONE 3         │
           │   (Kavach Sentinel)  │
           │                      │
           │    [Microphone UP]   │
           └──────────────────────┘
```
- Place Phone 2 and Phone 3 side-by-side on a wooden or cushioned table, spaced **10 cm to 25 cm apart**.
- Point Phone 2's bottom loudspeaker towards Phone 3's microphone.
- Keep the room reasonably quiet (switch off loud TV or blaring music; normal ceiling fans are fine as Kavach has VAD filtering).

---

## 5. Live Scam Simulation: Step-by-Step Test Procedure

This test simulates the classic **"Digital Arrest & Customs Drug Parcel"** scam executed by criminal syndicates.

### Step 1: Establish the Call
1. **Phone 1 (Scammer)** calls **Phone 2 (Elder)**.
2. **Phone 2** answers the call.
3. On **Phone 2**, tap **"Speaker"** (Loudspeaker). Set volume to **80% - 100%**.
4. Confirm Phone 3 is showing **"Armed & Listening"** with the green ring.

---

### Step 2: Speak Stage 1 — False Authority (`S1_authority`)
**Tester on Phone 1 speaks clearly into the phone:**
> *"नमस्ते, मैं दिल्ली पुलिस क्राइम ब्रांच और CBI साइबर सेल से सब-इंस्पेक्टर शर्मा बोल रहा हूँ।"*  
> *(English translation: "Hello, I am Sub-Inspector Sharma speaking from Delhi Police Crime Branch and CBI Cyber Cell.")*

#### Expected Real-Time Behavior:
- **Phone 3:**
  - Live transcript updates with the spoken text.
  - Risk Meter climbs to **~15% - 25%**.
  - **`S1 authority`** chip illuminates on the telemetry panel.
  - Ring remains `SAFE` or turns `CAUTION` (Level 1).

---

### Step 3: Speak Stage 2 — Serious Accusation (`S2_accusation`)
**Tester on Phone 1 speaks:**
> *"आपके आधार कार्ड नंबर से मुंबई एयरपोर्ट पर एक संदिग्ध पार्सल पकड़ा गया है, जिसमें गैर-कानूनी ड्रग्स और जाली पासपोर्ट मिले हैं। आपके नाम पर गैर-जमानती गिरफ्तारी वारंट जारी हुआ है।"*  
> *(English translation: "A suspicious parcel has been seized at Mumbai airport linked to your Aadhaar card, containing illegal drugs and fake passports. A non-bailable arrest warrant has been issued in your name.")*

#### Expected Real-Time Behavior:
- **Phone 3:**
  - Transcript displays *"आधार कार्ड"*, *"ड्रग्स"*, *"वारंट"*.
  - Risk Meter climbs to **~45% - 65%**.
  - **`S2 accusation`** chip lights up.
  - Ring transitions to Yellow: **`सावधान · CAUTION` (Level 1)**.

---

### Step 4: Speak Stage 3 — Psychological Isolation & Digital Arrest (`S3_isolation`)
**Tester on Phone 1 speaks:**
> *"यह राष्ट्रीय सुरक्षा का मामला है। सुप्रीम कोर्ट के आदेश से आप अभी डिजिटल अरेस्ट में हैं। कमरे का दरवाज़ा अंदर से बंद कर लीजिए और परिवार में किसी को मत बताना।"*  
> *(English translation: "This is a matter of national security. Under Supreme Court orders, you are under digital arrest right now. Lock your room from inside and do not tell anyone in your family.")*

#### Expected Real-Time Behavior:
- **Phone 3:**
  - Transcript identifies *"डिजिटल अरेस्ट"*, *"कमरे का दरवाज़ा बंद"*, *"किसी को मत बताना"*.
  - Risk Meter spikes to **~75% - 85%**.
  - **`S3 isolation`** chip lights up.
  - Ring flashes Red: **`ख़तरा · SCAM DETECTED` (Level 2)**.
  - **Audio Intervention Fired (Level 2):** Phone 3 speaks out loud:
    > *"सावधान! यह कॉल संदिग्ध है। सरकारी अफ़सर फ़ोन पर गिरफ़्तारी या पैसे की बात नहीं करते।"*
  - **Echo Gate Engaged:** While Kavach's speaker is talking, its incoming microphone audio is automatically muted to prevent hearing its own voice and creating a feedback loop!

---

### Step 5: Speak Stage 4 & 5 — Urgency & Extortion / Safe Account (`S4_urgency` + `S5_payment`)
**Tester on Phone 1 speaks:**
> *"अगर जेल जाने से बचना है, तो तुरंत अगले 30 मिनट में अपने सारे पैसे हमारे RBI सेफ अकाउंट में वेरिफिकेशन के लिए ट्रांसफर कीजिए।"*  
> *(English translation: "If you want to avoid going to jail, transfer all your money immediately within 30 minutes to our RBI safe account for verification.")*

#### Expected Real-Time Behavior:
- **Phone 3:**
  - Risk Meter hits **95% - 100% / 100**.
  - All 5 chips are now glowing: `S1`, `S2`, `S3`, `S4`, `S5`.
  - Ring flashes Critical Red: **`गंभीर ख़तरा · CRITICAL THREAT` (Level 3)**.
  - **Critical Audio Warning Fired (Level 3):** Phone 3 speaks out loud at full volume:
    > *"पापा, यह फ़र्ज़ी कॉल है! फ़ोन तुरंत काट दीजिए। कोई पुलिस फ़ोन पर डिजिटल अरेस्ट नहीं करती।"*
  - **Emergency Action:** The **"1930 साइबर हेल्पलाइन कॉल करें"** button appears prominently on Phone 3.

---

### Step 6: Verify Remote Guardian Push Alert & Push-to-Talk Intercom
**Simultaneously check Phone 4 (Guardian's Phone):**

1. **Telegram Instant Push Notification:**
   - Phone 4 receives a high-priority message from the Kavach bot:
     ```
     🚨 KAVACH CRITICAL ALERT (Level 3)
     Elder: Papa
     Status: Digital Arrest Scam in progress!
     Matched Stages: S1 Authority, S2 Accusation, S3 Isolation, S4 Urgency, S5 Payment
     Heard on Call: "अगले 30 मिनट में सारे पैसे RBI सेफ अकाउंट में ट्रांसफर कीजिए"
     
     👉 Intercom Action Link: https://your-url/alert.html?token=...
     📊 Incident Timeline: https://your-url/timeline.html?session=...
     ```
2. **Open the Intercom on Phone 4:**
   - Tap the `alert.html` link on Phone 4.
   - The screen shows the active threat banner, heard quotes, and a large blue **"🎙️ Push to Talk (बोलने के लिए दबाएं)"** button.
3. **Speak through the Remote Intercom:**
   - On Phone 4, press and hold the **Push to Talk** button.
   - Speak into Phone 4: *"पापा, फ़ोन काट दो! मैं राहुल बोल रहा हूँ, यह फ़्रॉड है!"*
   - Release the button.
4. **Acoustic Broadcast on Phone 3:**
   - Phone 3 (sitting next to the elder) immediately broadcasts the guardian's live voice into the room!
   - On Phone 3's screen, the status temporarily shows: `🎙️ Intercom Active (Guardian Speaking)`.

---

## 6. Control Test: Benign Normal Call (False Alarm Check)

A guardian system is useless if it cries wolf on innocent calls. Run this negative control test to prove Kavach does **not** falsely trigger on everyday family or commercial calls.

### Procedure:
1. Tap **STOP** then **START** on Phone 3 to reset the session.
2. Call Phone 2 from Phone 1 on speakerphone.
3. **Tester on Phone 1 speaks innocent daily conversations:**

#### Script A: Food / Courier Delivery & OTP
> *"भैया, मैं स्विगी डिलीवरी से बोल रहा हूँ, गेट के बाहर खड़ा हूँ। आपका पार्सल आ गया है, कृपया ओटीपी बता दीजिए।"*

#### Script B: Hospital / Doctor Appointment
> *"नमस्ते अंकल, डॉक्टर मेहता के क्लिनिक से बोल रहे हैं। आपकी कल दोपहर तीन बजे की अपॉइंटमेंट कन्फर्म है, समय पर आ जाइयेगा।"*

#### Script C: Family & Legitimate Rent Transfer
> *"अरे बेटा, इस महीने का मकान का किराया बैंक खाते में भेज दिया है। जब बैंक से मैसेज आये तो मुझे बता देना।"*

### Expected Behavior:
- **Phone 3:**
  - Status Ring stays completely Green: **`सुरक्षित · SAFE`**.
  - Risk Score stays **below 20%**.
  - **Zero audio warnings are played.**
  - **Zero Telegram alerts are dispatched.**
  - Proves the detector discriminates legitimate conversation from criminal extortion.

---

## 7. Comprehensive Pass / Fail Checklist

Mark each item as you complete the test run:

| Category | Test Item | Verification Method | Result |
|---|---|---|---|
| **Acoustic Capture** | Phone 3 microphone captures Phone 2 speaker audio from 15-20 cm distance | Speech appears in live transcript box on Phone 3 within 800 ms | [ ] PASS |
| **Stage Recognition** | S1 (Authority) detected | Chip `S1 authority` lights up when "CBI / Police" spoken | [ ] PASS |
| **Stage Recognition** | S2 (Accusation) detected | Chip `S2 accusation` lights up when "Aadhaar / Drugs" spoken | [ ] PASS |
| **Stage Recognition** | S3 (Isolation) detected | Chip `S3 isolation` lights up when "Digital Arrest / Kamra band" spoken | [ ] PASS |
| **Stage Recognition** | S4 (Urgency) detected | Chip `S4 urgency` lights up when "30 minute / Abhi ke abhi" spoken | [ ] PASS |
| **Stage Recognition** | S5 (Payment) detected | Chip `S5 payment` lights up when "RBI safe account / transfer" spoken | [ ] PASS |
| **Voice Intervention** | Level 2 / Level 3 warning audio plays out loud | Hindi warning audio clearly audible from Phone 3 speaker | [ ] PASS |
| **Echo Cancellation** | Warning audio does not re-trigger the microphone | Incoming audio is gated during warning playback (no infinite loop) | [ ] PASS |
| **Telegram Alert** | Emergency push notification arrives on Phone 4 | Notification arrives within 2 seconds of Level 3 trigger | [ ] PASS |
| **Remote Intercom** | Push-to-Talk audio relay | Guardian speaking into Phone 4 is heard out loud on Phone 3 | [ ] PASS |
| **Helpline Shortcut** | 1930 Cyber Crime Helpline button | Tapping 1930 on Phone 3 opens dialer with `tel:1930` prefilled | [ ] PASS |
| **False Alarm Control** | Benign delivery / doctor / family call | Ring stays SAFE (0-20), zero alerts sent | [ ] PASS |
| **Incident Logging** | Timeline audit trail | Session appears on `/timeline.html` with segment breakdown | [ ] PASS |

---

## 8. Diagnostic & Troubleshooting Matrix

| Symptom | Probable Cause | Immediate Resolution |
|---|---|---|
| **"माइक्रोफ़ोन अनुमति नहीं मिली" (Mic Permission Denied)** | Phone 3 accessed via HTTP instead of HTTPS | Switch to HTTPS via Cloudflare Tunnel (`cloudflared`) or ngrok, or enable `chrome://flags/#unsafely-treat-insecure-origin-as-secure` on Android Chrome. |
| **Transcript is empty while talking** | Volume too low or `FEATURE_LIVE_STT` disabled | 1. Increase Phone 2 volume to 100% and move Phone 3 closer (10-15 cm).<br>2. In `.env`, ensure `FEATURE_LIVE_STT=1` and `KAVACH_MOCK_STT=0`.<br>3. Verify `GNANI_API_KEY` is valid. |
| **Warning audio is silent on Phone 3** | Mobile browser blocked autoplay audio | Tap anywhere on the Phone 3 screen to unlock the browser's `AudioContext`. |
| **Telegram alert does not arrive on Phone 4** | Bot token or Chat ID misconfigured | 1. Send `/start` to your bot in Telegram.<br>2. Check `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in `.env`.<br>3. Verify backend terminal logs for `telegram alert sent` or error trace. |
| **Kavach triggers warnings on its own voice** | Echo gate tail time too short | In `.env`, increase `ECHO_GATE_TAIL_S=0.6` (default is 0.4s) to allow room reverb to decay before un-gating. |
| **Phone 3 screen turns off during call** | Screen Wake Lock unsupported or tab hidden | Ensure the Kavach tab stays active in the foreground; do not switch apps on Phone 3 during the test. |

---

## 9. Next Steps & Video Recording Tips

When recording a live demonstration video for contest judges or stakeholder presentations:
1. **Show the physical arrangement:** Film a wide-angle shot showing Phone 2 (on speaker) and Phone 3 (Kavach listening) on the table.
2. **Capture both audio channels:** Ensure the camera mic clearly captures both the scammer's voice from Phone 2 and Kavach's spoken intervention from Phone 3.
3. **Capture Phone 4 receiving the Telegram alert:** Cut to Phone 4 ringing with the Telegram emergency notification.
4. **Demonstrate the Intercom:** Show the guardian speaking into Phone 4 and their voice coming out of Phone 3.
5. **Always display the required disclaimer:** *"Role-played call on synthetic data. Kavach operates on a second device over speakerphone and does not intercept cellular calls."*
