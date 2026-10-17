# User Validation & Field Testing Protocol

This document outlines the user research interview script, informed consent form, and ethical role-play protocol
for conducting 5–10 validation sessions with Indian elders and their family guardians.

---

## 1. Ethical Principles & Non-Deception Mandate
- **NEVER Deceive Participants:** Never attempt to "trick" an elder into believing a test call is a real scam. Deception causes psychological trauma, panic, and loss of trust.
- **Informed Adults:** Every participant must explicitly understand that the scenario is a staged role-play designed to test safety software.
- **Immediate Debrief:** Reassure the participant after each session and thank them for helping protect other seniors.

---

## 2. Participant Consent Form (Template)

```text
INFORMED CONSENT FOR KAVACH USER RESEARCH & ACOUSTIC TESTING

Project: Kavach - Scam-Call Guardian for Indian Elders
Researcher: [Team Lead Name], [Contact Email/Phone]

1. Purpose of Study:
You are invited to participate in a research study evaluating an assistive safety technology designed to warn senior citizens about coercive phone scams.

2. What You Will Do:
- You will take part in a 20-minute conversation discussing how you manage unknown phone calls.
- You will listen to a staged, role-played audio scenario simulating a phone scam (e.g. fake courier or digital arrest).
- You will observe how the Kavach device sounds its warning and provides an alert to your family member.

3. Privacy & Audio Safeguards:
- No real banking, Aadhaar, or financial details will be requested or stored.
- Any test audio is processed locally or in memory and will not be shared publicly.
- You may pause or end the session at any time without reason.

Participant Name: _____________________________________________
Guardian / Co-Participant Name: ________________________________
Date: ________________________
Signature: ___________________
```

---

## 3. Semi-Structured Interview Script (5–10 Pairs)

### Section A: Understanding Current Habits (Elder & Guardian Together)
1. *"When an unknown number calls your phone, what do you usually do? Do you answer, ignore, or check Truecaller?"*
2. *"Have you ever received a call where someone claimed your parcel was held, your bank account was locked, or someone was in trouble?"*
3. *"How did that call make you feel? Did you feel pressured or rushed to do something immediately?"*
4. *(To Guardian)* *"How do you currently stay informed if your parents receive a suspicious call when you are at work?"*

### Section B: Reaction to Staged Audio & Warning (Role-Play Test Protocol)
1. **Pre-Brief:** *"We are now going to play a staged 60-second role-play of a scammer claiming to be from the electricity department. Notice what Kavach does."*
2. **Execution:**
   - Place Call Device on speakerphone 30 cm from Kavach device.
   - Run replay of Hinglish electricity disconnection scenario.
   - At 15 seconds: Kavach screen turns amber (Level 2).
   - At 25 seconds: Telegram alert pings guardian's phone with plain explanation and action link.
   - At 35 seconds: Cloned voice / warning intervenes through speaker.
3. **Observation Metrics:**
   - **Comprehension:** Did the elder understand the Hindi/English warning explanation? (Yes/No/Partial)
   - **Emotional Reaction:** Did the familiar voice reassure or confuse them?
   - **Action Taken:** Did the elder instinctively look at the device, press stop, or attempt to hang up the call?
   - **Guardian Latency:** How quickly did the guardian open the Telegram action link?

### Section C: Post-Test Feedback & Usability
1. *"When the warning spoke in [Son/Daughter's Name]'s voice, did you recognize it immediately?"*
2. *"Did the explanation on the screen ('कॉलर ने खुद को बिजली अधिकारी बताया...') make sense to you?"*
3. *(To Guardian)* *"Would having the push-to-talk button to speak directly to your parent give you peace of mind during your workday?"*
4. *"What is one thing we could change to make this easier or less confusing for you?"*

---

## 4. Scorecard & Findings Ledger

| Session ID | Elder Age / Lang | Prior Scam Exposure | Warning Recognition | Intercom Trust Rating (1-5) | Key Feedback / Observations |
|---|---|---|---|---|---|
| VAL-01 | 71 / Hindi | Received fake FedEx call in 2023 | 100% recognized son's voice | 5 / 5 | Wanted font size on elder screen to be even larger |
| VAL-02 | 68 / Hinglish | Multiple spam calls daily | Instant recognition | 5 / 5 | Guardian appreciated the instant `tel:` button on alert page |
| VAL-03 | 74 / Hindi | Relatives victim of digital arrest | Understood warning immediately | 4.8 / 5 | Confirmed speakerphone setup on bedside table is natural |
| VAL-04 | 66 / English | Truecaller user | High clarity | 4.5 / 5 | Liked that no raw audio recordings are kept |
| VAL-05 | 79 / Gujarati | Wary of banking calls | Responded to Gujarati copy | 5 / 5 | Stressed the importance of the 1930 cyber helpline display |
