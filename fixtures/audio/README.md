# Recording Real Audio Calls for Kavach (Acoustic Evaluation)

This guide documents how to record and test synthetic, role-played scam calls under real-world room acoustics
without compromising privacy or spending excessive API credits.

## Acoustic Hardware Setup (Two-Phone Speakerphone Protocol)
Kavach operates on a second device placed near the primary call device. To capture authentic room acoustics:
1. **Device 1 (Call Device):** A phone receiving a call on speakerphone at typical conversational volume (65–70 dB SPL at 30 cm).
2. **Device 2 (Kavach Device):** A phone, tablet, or laptop running Kavach positioned 20–50 cm away from Device 1 on the same table.
3. **Format:** 16-bit PCM WAV, 8,000 Hz or 16,000 Hz, mono channel.

## Synthetic & Role-Play Guidelines (CRITICAL)
- **Role-Play Only:** All calls must be staged role-plays between consenting adults who are fully aware it is a test.
- **Never Record Real Scammers:** Do not record or transcribe actual criminal calls.
- **No Real PII:** Never use real phone numbers, real Aadhaar numbers, real PAN numbers, or real bank account numbers. Use 555-prefix numbers or standard placeholder digits (e.g. `XXXX-XXXX-1234`).
- **Consent Note:** Any participant contributing their voice must provide written/signed consent acknowledging that the audio will be used solely for evaluating Kavach scam detection algorithms and may be deleted at any time upon request.

## File Naming Convention
Store audio files in `fixtures/audio/` following this pattern:
```
<family>_<lang>_<scenario>_<snr>.wav
```
Examples:
- `cbi_hi_digital_arrest_clean.wav`
- `fedex_en_narcotics_snr15.wav`
- `electricity_hinglish_disconnect_snr5.wav`
- `benign_hi_amazon_delivery_clean.wav`

## Git & Privacy Safeguards
Private voice recordings must **NEVER** be committed to git.
The repo `.gitignore` contains:
```gitignore
fixtures/audio/*.wav
fixtures/audio/recordings/
!fixtures/audio/demo_scam_hinglish.wav  # Only public synthetic demo clip tracked
```
Any raw user recording remains strictly on your local disk.
