# Safety, privacy, ethics (non-negotiable; also part of our pitch)
- **Consent for cloning:** explicit checkbox + random-phrase liveness read (transcribed with Prisma REST; must match) before any embedding is created. Only the speaker's own voice.
- **Deletion:** guardian can delete embedding + clips instantly; deletion removes stored files and DB rows.
- **No raw audio stored.** Transcript excerpts (<=160 chars) kept 7 days for the alert timeline only.
- **Visible listening indicator** at all times; stop button always available.
- **Synthetic/role-played calls only.** No real scammer numbers, victims, accounts, Aadhaar, PAN. Label demo audio "role-played".
- **Honest framing:** we detect and warn; we do not intercept or block calls; we point to 1930 / cybercrime.gov.in. Results are "in our tests on synthetic calls".
- **Misuse:** cloning is also a scammer tool; ours is owner-only, consent-gated, deletable, used only to warn. Say this publicly in the post and README.
- Check Gnani's terms for voice cloning limits before the final submission and quote them in the consent text.
- Design to DPDP principles: consent, purpose limitation, data minimisation.

## Known limitations (Transparency & Risk Disclosure)
1. **Voice Spoofing of Liveness Check:**
   - Single-use, expiring randomized challenge sentences prevent replay of previously recorded static audio.
   - However, an attacker with a high-fidelity real-time voice clone could theoretically synthesize the challenge phrase.
   - *Mitigation:* The enrollment flow is intended for the family guardian in person; future enterprise deployments should require out-of-band video or biometric liveness.
2. **Speakerphone Acoustic & Environmental Limits:**
   - Kavach relies on hearing both sides of the conversation over speakerphone in a room environment.
   - High background noise (television, street traffic) or weak speakerphone volume can cause ASR word drops or phonetic mangling.
   - *Mitigation:* Detector normaliser handles spelling variants and fuzzy matching, but extreme noise (>20 dB SNR degradation) reduces detection recall.
3. **Second-Device Deployment & No Cellular Interception:**
   - Kavach runs on a second device (old phone, tablet, laptop) placed near the primary call device.
   - It does not intercept, record, or block cellular radio calls directly due to mobile OS security sandboxes and browser privacy restrictions.
   - The elder or caregiver must actively place the call on speaker and keep Kavach armed.
