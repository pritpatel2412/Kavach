# Kavach Customer Support & Scam Emergency Playbook

This playbook establishes standard operating procedures, SLA benchmarks, canned macros, and immediate response protocols for support agents operating the Kavach Support Inbox.

---

## 1. Priority Tiers & SLA Benchmarks

Every inbound ticket created via `/support` or within the mobile app is automatically categorized and assigned an SLA countdown timer:

| Priority Tier | Category Scope | First Response SLA | Resolution SLA | Auto-Escalation |
| :--- | :--- | :--- | :--- | :--- |
| **P0: Scam Emergency** | Digital Arrest, Police Impersonation, MDMA parcel threats, live coercion | **< 15 minutes** (24/7/365) | < 2 hours | 10 mins without response alerts on-call lead |
| **P1: High** | Account lockout, billing dispute, false alarm panic, hardware failure | **< 2 hours** | < 12 hours | 90 mins alerts duty manager |
| **P2: Normal** | Tabletop kiosk setup, voice consent questions, listening mode config | **< 8 hours** | < 48 hours | None |
| **P3: Low** | Feature requests, language suggestions, general feedback | **< 24 hours** | < 5 business days | None |

---

## 2. P0: Scam Emergency Protocol (Immediate Action)

When a ticket arrives in the **🚨 Scam Emergency** queue:

### Step 1: Immediate Automated Guidance (Dispatched in 0 ms)
The system immediately fires an automated multi-channel alert (SMS + email) to both elder and caregiver:
> *"URGENT SAFETY ADVISORY: If an unknown caller claiming to be police, CBI, customs, or court officials is demanding you stay on video or transfer money into a 'verification account', HANG UP IMMEDIATELY. Law enforcement in India NEVER conducts arrests via video call or demands money for verification. Call the National Cyber Crime Helpline at 1930 right now."*

### Step 2: Human Operator Immediate Script (Call / Portal Reply)
If the elder or guardian is still in active contact with the scammer, follow this script:
1. **De-escalate & Reassure:**
   *"You are in no legal danger. This is a common syndicate tactic known as 'Digital Arrest'. They use fake badges, police logos, and legal threats to induce panic."*
2. **Sever Communication:**
   *"Disconnect the call immediately. Block the phone number and Skype/WhatsApp ID. Do not answer callbacks."*
3. **Financial Protection (Critical first 2 hours):**
   - Did the citizen transfer funds?
     - **YES:** *"Call **1930** immediately. 1930 connects directly to the Indian Financial Cyber Fraud Reporting System to freeze the beneficiary account before the scammers cash out at an ATM."*
     - **NO:** *"Excellent. Your funds are completely safe. Do not share any OTP, UPI PIN, or bank details."*
4. **Official Lodging:**
   - Instruct the family to file a formal cyber fraud complaint at `https://cybercrime.gov.in`.

---

## 3. Canned Macros & Quick Responses

### Macro 1: Scam Emergency Follow-Up
```text
Namaste {{requester_name}},

We have reviewed the incident flagged for the {{household_name}} household. Our rule engine detected coercive digital arrest patterns during this call.

Please confirm that:
1. The call was disconnected and no money or account details were transferred.
2. If any transfer occurred, you dialed 1930 immediately to freeze the transaction.

We are actively tuning our acoustic and linguistic models to ensure Kavach interrupts such calls even earlier. Please let us know if your family needs any further support.
```

### Macro 2: Tabletop Kiosk Restart & Audio Worklet Reconnect
```text
Namaste {{requester_name}},

If your tabletop tablet displays "Standby (Disconnected)" or the audio worklet is paused:
1. Power-cycle the tablet device (hold power button for 5 seconds and tap Restart).
2. Open Chrome and verify the Kavach tablet URL is loaded.
3. Ensure the tablet is connected to your home Wi-Fi and plugged into its wall charger.
4. When prompted, tap "Allow Microphone" to ensure 16 kHz acoustic streaming is armed.

Our backend telemetry shows your tablet DEV-{{device_id}} was last active {{last_heartbeat}}.
```

### Macro 3: False Alarm Review & Clarification
```text
Namaste {{requester_name}},

Thank you for providing feedback on alert {{alert_id}}. We reviewed the transcript segment with our detector engineering team and confirmed this was a false alarm triggered by a legitimate conversation regarding {{context}}.

We have added this specific phrasing pattern to our negative dictionary filter. Your feedback directly trains our detection models to protect Indian elders with zero unnecessary alarms.
```

---

## 4. Ticket Merging, Internal Notes & CSAT Rating

1. **Internal Notes vs Customer Replies:**
   - Toggle between **Customer Reply** (visible in customer portal) and **Internal Team Note** (yellow background, visible only to authorized admin agents).
   - Internal notes must be used to record bank branch details, local police station FIR numbers, or internal investigation notes.
2. **Customer Portal (`/support/t/{token}`):**
   - Customers access ticket threads passwordlessly via a high-entropy signed link.
   - Customers can upload screenshots (scammer phone numbers, WhatsApp chats) and mark tickets resolved.
3. **CSAT Feedback Collection:**
   - Once an agent marks a ticket `Solved`, an automated CSAT survey email is sent requesting a 1 to 5 star rating with optional commentary.
   - CSAT responses feed the **Support Analytics** dashboard in real time.
