# Kavach Real Phone Speakerphone Test Protocol

This document provides exact step-by-step instructions to safely perform **ONE real-world validation call** using your personal smartphone on speakerphone, with zero risk of runaway Gnani API credit leakage.

---

## 1. Safety & Credit Guard Pre-Flight Checklist

Before testing with real audio, ensure the following guards are verified:

1. **Verify Daily STT Credit Cap**:
   - Check that `GLOBAL_STT_MINUTES_PER_DAY` is set to `5.0` (or `10.0`) in the backend dashboard to guarantee a hard ceiling.
2. **Verify User Allowlist**:
   - Set `LIVE_STT_ALLOWLIST=your-email@example.com` in backend environment variables.
3. **Verify Audio Leakage Guard**:
   - Kavach NEVER stores raw speakerphone audio. Transcripts are ephemeral (<=160 chars) and auto-purged after 7 days.
4. **Synthetic Test Data Rule**:
   - During the test call, **NEVER recite real bank account numbers, debit/credit card CVVs, Aadhaar numbers, or real home addresses**. Use fictional numbers (e.g., account ending in `0000`, card ending in `9999`).

---

## 2. Test Setup (Two Devices in the Room)

```
       [ Device A: Personal Smartphone ]
           (Placing the scam call)
                     |
         Speakerphone audio in room (Hindi/English)
                     v
       [ Device B: Tabletop Kiosk / Tablet ]
           (Running Kavach at /app/elder)
                     |
             Direct WebSocket (16 kHz PCM)
                     v
       [ Kavach Backend Container ]
                     v
             Gnani Prisma STT
                     v
         Kavach 5-Stage Detector
                     v
          Familial TTS Warning Plays
```

1. **Device B (The Tabletop Guardian)**:
   - Open Chrome or Safari on your tablet or second phone.
   - Navigate to `https://kavach.ai/app/elder` (or `http://localhost:3001/elder`).
   - Tap **"Resume Protection"** so the green badge reads **"Microphone Listening on Speaker"**.
   - Make sure your speaker volume is set to 80%+.

2. **Device A (Your Phone)**:
   - Call a friend or second phone line, or simulate caller audio using speakerphone.
   - Switch your phone call to **Speakerphone**.
   - Place Device A approximately 1 to 2 feet away from Device B.

---

## 3. Execution Script: The "Digital Arrest" Simulation

Speak clearly into Device A on speakerphone using this scripted progression:

### Stage 1: Authority Impersonation (S1)
> *"Namaste. Main Mumbai Police Crime Branch aur CBI Cyber Cell se Senior Inspector bol raha hoon. Kya aap Mrs. Kamala Iyer bol rahi hain?"*
- **Expected Tabletop Reaction**: The tabletop kiosk remains calm; status displays Stage 1 detected (Risk Meter: 20-30%).

### Stage 2: Coercion & Fake Warrant (S2)
> *"Aapke Aadhaar card se Canara Bank mein illegal account khola gaya hai jisme 40 lakh rupees money laundering hua hai. Supreme Court se aapke khilaf non-bailable arrest warrant issue ho chuka hai!"*
- **Expected Tabletop Reaction**: Risk level elevates to Stage 2 (Orange badge; Risk Score: 50-65%).

### Stage 3: Isolation Mandate (S3 - Red Line)
> *"Aap turant kamre ka darwaza band kijiye aur kisi se baat mat kijiye! Yeh national security matter hai. Agar kisi ko bataya toh beta bhi jail jayega. Video call par rahiye!"*
- **Expected Tabletop Reaction**:
  - **IMMEDIATE P0 ESCALATION**: Tablet screen flashes high-contrast emergency banner: **"WARNING: SCAM EXTORTION DETECTED! HANG UP IMMEDIATELY!"**
  - **Familial Audio Interruption Plays**: The pre-rendered voice alert speaks out loud over the speaker: *"Mummy, yeh scam call hai! Phone kaat do! Main ghar aa raha hoon."*
  - **Guardian Alert**: An immediate alert notification is pushed to the Guardian App (`/app`) and Telegram (if configured).

---

## 4. Verification & Post-Test Audit

Immediately after the call:
1. Tap **"Pause Protection"** on Device B.
2. Check your backend logs or `/health`:
   ```bash
   curl https://kavach.ai/api/health
   ```
3. Verify that the call lasted under 2 minutes and consumed <= 2 STT minutes.
4. Open the Guardian App at `https://kavach.ai/app` to confirm the incident was logged with the exact timestamp and detected trigger phrases.
5. In your test incident, tap **"Confirm Real Scam Call"** to verify the caregiver feedback loop.
