# Kavach: Real-Time Scam-Call Guardian for Indian Elders

**Product Requirements Document v1.0** · Created 12 Oct 2026 · Contest: Great Indian AI Internship Challenge (Gnani AI) · **Final submission: 10 Nov 2026, 11:59 PM IST** · Internal target: submit by 8 Nov

## 1. Summary

Kavach is a "chowkidar" for elders. It runs on a second device (old phone, tablet or laptop) placed next to the phone while a suspicious call is on speaker. It streams the audio to Gnani Prisma for Indian-language speech-to-text, watches for the stages of a "digital arrest" scam script, and when risk crosses a threshold it **speaks a warning aloud in the elder's language, in the cloned voice of a family member** (Gnani Timbre voice cloning, with consent). It also alerts the family.

**Tagline:** *Phone kaatiye. Yeh scam hai.* (Hang up. This is a scam.)

**Gnani models used:** Prisma v2.5 (realtime and REST STT), Timbre v2.5 (TTS), Voice Cloning (`vachana-vc-v1`).

## 2. Contest constraints that shape the product

| Constraint | Implication |
| --- | --- |
| Deadline 10 Nov 11:59 PM IST, no extensions | Plan to submit 8 Nov; 2 days buffer |
| 5,000 programme credits, API platform only (app.gnani.ai/voice); agent builder out of scope | Build on raw STT/TTS/VC APIs, not the agent builder |
| Evon LLM is not on the API platform (open weights, by request on Hugging Face) | Core build does not depend on Evon; use any other LLM for the optional classifier layer |
| Do not use real phone numbers, account numbers, Aadhaar, PAN or recorded calls | All test and demo calls are scripted/synthetic |
| Submission needs demo video, written explanation, models used, one nominated post link per platform; posts live before submit; tags #GnaniAI #GreatIndianAIInternshipChallenge | Distribution plan in section 19 |
| Shortlist is by verified engagement on **nominated** posts; offers are individual | Record each member's contribution clearly (section 20) |
| Bought engagement, bots, paid promotion, engagement swaps are disqualifying | Organic distribution only |
| One award per participant; ten awards of ₹50,000 | Lead target: Real Deal; supporting: Noise Canceller, Main Character, Mixed Vibes, Jugaad Genius, Demo Day Drop |

## 3. Problem and evidence

In a "digital arrest" scam, callers pose as police, CBI, TRAI or RBI officials, accuse the victim of a crime (misused Aadhaar, illegal SIM, money laundering, a parcel with drugs), forbid them from telling anyone, keep them on a call, and push them to "verify" funds by transfer. Police repeatedly state there is no legal provision for "digital arrest".

- Government data reviewed by News18 shows 297,727 complaints and ₹4,057.7 crore lost between 2022 and May 2026, with 15,215 complaints and ₹481.1 crore in the first five months of 2026 alone ([NewsBytes, 6 Jul 2026](https://www.newsbytesapp.com/news/science/india-s-digital-arrest-scam-causes-4-000cr-losses-in-3-years/story)).
- Pune cyber police data: senior citizens lost over ₹100 crore across 136 cases in 19 months; one 82-year-old lost ₹10.75 crore ([Punekar News, 21 Sep 2026](https://www.punekarnews.in/?p=245348)).
- Elderly and retired people are the most targeted group ([Kuvera explainer](https://kuvera.in/blog/?p=41997)).

**Gap:** existing awareness campaigns and spam labels act before or after the call. Nothing sits with the elder *during* the 30 to 90 minutes when the scam works, speaks their language, and carries a trusted voice. Kavach fills that window.

## 4. Goals, non-goals, success metrics

**Goals**

- G1: Detect a live scam-script progression from speech and warn before the payment stage.
- G2: Work on noisy, narrowband telephony-quality speech in Hindi and Hinglish (stretch: one southern language).
- G3: Deliver the warning in a voice the elder trusts (cloned family voice, consent-gated).
- G4: Notify a guardian within seconds of a high-risk call.
- G5: Produce a measured benchmark on synthetic noisy calls (accuracy, false alarms, time-to-warning).
- G6: Ship a 60-second demo that is understood without sound explanations.

**Non-goals**

- Not a call interceptor: mobile OSes restrict third-party call-audio capture, so Kavach listens over speakerphone on a second device. We say so openly.
- Not a call blocker, carrier product, or video/deepfake detector.
- Not a replacement for 1930 or the cybercrime portal; it points to them.
- No storage of raw audio by default.
- No use of the Gnani agent builder.

**Success metrics (targets, to be validated, not claims)**

| Metric | Target |
| --- | --- |
| Scam scripts escalated to level 2 before the payment-demand turn (clean audio) | ≥ 90% |
| Same, on 8 kHz µ-law with noise at about 5 dB SNR | ≥ 80% |
| False alarms on benign synthetic calls (bank KYC, courier, family, doctor) at level 2+ | ≤ 5% |
| Median time from trigger utterance end to warning audio start | ≤ 3.0 s |
| End-to-end demo works live, 3 consecutive dry runs | Yes |
| Submitted with nominated post(s) live | By 8 Nov |

## 5. Users

- **Elder (primary):** 65+, speaks Hindi/Hinglish or a regional language, low tech comfort, trusts family voices, panics under authority pressure. Needs: zero setup per call, big controls, audio-first feedback.
- **Guardian (setup and alerts):** adult child or grandchild, comfortable with apps. Needs: one-time setup, instant alerts, ability to mark false alarms.
- **Viewer (judge/LinkedIn audience):** sees 60 seconds. Needs: instant understanding, an emotional beat, proof it works.

## 6. Scope (MoSCoW)

**Must:** realtime STT pipeline; scam-stage detector with 3 risk levels; spoken warning (default voice); cloned guardian voice with consent and liveness check; guardian alert; elder screen; judge/demo mode with live risk meter; synthetic dataset and eval report; demo video.

**Should:** LLM second-opinion layer; Hindi + Hinglish both well supported; false-alarm feedback; session timeline; Telegram alert channel.

**Could:** second regional language (Tamil or Telugu); WhatsApp alerts; Pipecat variant; self-hosted Evon classifier experiment.

**Won't (this contest):** native mobile app, call interception, multi-tenant accounts, payments.

## 7. User journeys

**J1. Guardian onboarding (about 4 minutes)**

1. Opens web app, creates guardian profile (name, gender for Hindi grammar, Telegram chat link).
2. Adds elder (name, language: Hindi / Hinglish / other).
3. Voice enrollment: reads consent text, then reads a **randomly generated sentence** aloud (5 to 30 s). Prisma transcribes it; the sentence must match, proving a live speaker rather than an uploaded clip of someone else. Embedding is created and stored.
4. Previews the warning in their cloned voice; approves or re-records.
5. System pre-renders warning clips (levels 1 to 3) so no synthesis is needed during a call.

**J2. Arming Kavach (elder or family)**

1. Device placed near the phone. Elder taps the large green **"Sunna shuru karo"** button (or guardian arms it remotely in a later version).
2. Status ring turns green: "Kavach sun raha hai".

**J3. Live call**

1. Caller starts the script. Transcript segments arrive; stage chips light up in order.
2. Level 1 (score ≥ 40): ring turns amber, soft spoken nudge, on-screen "Savdhan".
3. Level 2 (score ≥ 70): ring turns red, cloned-voice warning plays loud, guardian alerted.
4. Level 3 (score ≥ 90, or payment demand after authority claim): final warning, 1930 prompt, second guardian alert with transcript excerpt.
5. Elder hangs up; taps "Band karo".

**J4. After the call** Guardian sees a timeline (stages, scores, excerpt) and taps "Sahi alert" or "Galat alert"; feedback is logged for threshold tuning.

## 8. Functional requirements

**Audio capture and streaming**

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-1 | Capture mic audio in browser with echo cancellation and noise suppression requested; downsample to 16 kHz mono PCM16 in an AudioWorklet | Must |
| FR-2 | Send exact 1,024-byte frames (512 samples = 32 ms) at real-time cadence over WebSocket to the backend | Must |
| FR-3 | Backend proxies to Prisma realtime with API key held server-side only | Must |
| FR-4 | Auto-reconnect and roll the Prisma session before its 15-minute cap (at about 14:30) without losing detector state | Must |
| FR-5 | **Echo gate:** while any warning audio plays and for 400 ms after, discard transcripts (Kavach must not analyse its own voice) | Must |

**Detection**

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-6 | Normalise each transcript (lowercase, punctuation strip, script-variant mapping Devanagari/Latin) | Must |
| FR-7 | Match stage dictionaries with exact and fuzzy matching (edit distance threshold per term length) | Must |
| FR-8 | Maintain per-session risk state; score and level computed per segment | Must |
| FR-9 | Escalate immediately when authority claim + payment demand co-occur in a 3-minute window | Must |
| FR-10 | LLM second opinion invoked only when rule score is between 30 and 85 or on guardian-defined sensitivity; 1.5 s timeout, fall back to rules | Should |
| FR-11 | Guardian allowlist: a number/label "known caller" suppresses levels (demo-mode only, no real numbers stored) | Could |

**Intervention**

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-12 | Play pre-rendered level 1/2/3 clips in the elder's language; clone voice if enrolled, else default Timbre voice | Must |
| FR-13 | Do not repeat a level within 45 s unless score rises to the next level | Must |
| FR-14 | Alert guardian via Telegram bot with level, stage summary and a 2-line excerpt | Must |
| FR-15 | Show on-screen large-text warning with a "Call 1930" button (tel: link) | Must |

**Enrollment and consent**

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-16 | Voice cloning only after explicit consent checkbox and a successful random-phrase liveness read | Must |
| FR-17 | Guardian can delete their voice embedding at any time; deletion is immediate | Must |
| FR-18 | Clips, embeddings and transcripts are never shared between guardians | Must |

**Demo and eval**

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-19 | Judge mode: live risk meter, stage chips, per-segment latency, "synthetic call" badge | Must |
| FR-20 | Replay mode: stream a saved synthetic call audio file through the full pipeline at real-time pace | Must |
| FR-21 | Eval harness produces a report (CSV + summary markdown) from synthetic calls | Must |

## 9. Scam-detection specification

**Stage model** (each distinct stage counted once per rolling 10-minute window):

| Stage | Meaning | Weight | Example cues (matched in Hindi, Hinglish, English) |
| --- | --- | --- | --- |
| S1 Authority | Claims to be police/CBI/TRAI/RBI/ED/customs/court | 15 | cbi, police, trai, crime branch, cyber cell, court, warrant |
| S2 Accusation | Alleges crime tied to victim | 20 | aadhaar misuse, money laundering, case registered, parcel drugs, sim illegal |
| S3 Isolation | Secrecy, stay on call/video, "digital arrest" | 25 | don't tell anyone, stay on video, don't hang up, digital arrest |
| S4 Urgency | Time pressure | 10 | right now, within two hours, immediately |
| S5 Payment | Money movement to a "safe/verification account" | 30 | transfer, safe account, verification deposit, break FD, RTGS, UPI |

**Scoring:** `score = sum(weights of distinct stages seen)`. Add +10 if three or more stages appear in the typical order. Cap at 100. Levels: **L1 ≥ 40**, **L2 ≥ 70**, **L3 ≥ 90 or (S1 and S5 together)**.

**LLM layer (optional):** receives the last 8 segments plus rule hits; returns strict JSON `{"scam_probability":0-1,"stages":[...],"reason":"<20 words"}`. It may adjust the score by up to ±25. Temperature 0, 1.5 s timeout, rules win on failure.

**False-positive guards:** legitimate bank, courier and doctor calls rarely combine authority + accusation + isolation + payment. Benign test set (section 15) must include mentions of "police", "OTP", "transfer" and "urgent" in innocent contexts. A single stage never exceeds L1.

**Dictionaries:** YAML per language and stage, with Devanagari and Latin variants and common ASR mis-spellings collected from the synthetic test transcripts. Library suggestion: `rapidfuzz`.

## 10. System architecture

```
[Browser PWA on second device]
  mic -> AudioWorklet (16 kHz, 1024-byte frames)
        | WebSocket /ws/session
        v
[FastAPI backend]
  WS proxy ----------------> wss://api.vachana.ai/stt/v3/stream  (Prisma v2.5)
      | transcript events
      v
  Normaliser -> Rule scorer -> (optional) LLM check
      | risk level changes
      v
  Intervention manager --> pre-rendered clips (stored audio) --> WS -> browser plays
      |                                  ^ built at enrollment via
      |                                    Timbre REST + vachana-vc-v1
      +--> Telegram Bot API (guardian alert)
  SQLite/Postgres: guardians, elders, voice_profiles, sessions, events
```

**Latency budget (speech end to warning audio starting):** VAD silence close 400 to 500 ms + Prisma latency (docs example about 320 ms) + scorer < 50 ms (LLM path adds up to 1.5 s) + playback start < 300 ms from pre-rendered clip = about 1.2 s rules-only, under 3 s with LLM. Gnani's published figures are P95 about 200 ms for STT; measure ours.

## 11. Gnani integration specification

**11.1 Realtime STT (Prisma)**

- Endpoint: `wss://api.vachana.ai/stt/v3/stream`. Config is sent as **upgrade headers**. Browsers cannot set them, hence the backend proxy.
- Headers: `x-api-key-id`, `lang_code` (`hi-IN`; `en-IN` accepts Hindi-English mixed speech and returns Latin script), `x-sample-rate: 16000`, `x-format: verbatim` (needed for word boosting), `x-bias-list`, `x-bias-score: 1.0`.
- Bias list: single, letters-only words, max 100; invalid lists are silently ignored with HTTP 200, so unit-test that boosting is on. Start with CBI, TRAI, RBI, Aadhaar, warrant, arrest, verification, transfer plus Devanagari equivalents (use `\u` escapes in the JSON header).
- VAD (telephony style): `x-vad-threshold: 0.7`, `x-min-speech-ms: 200`, `x-min-silence-ms: 400` to `500`. Tune on the synthetic set. Raising `x-min-segment-ms` too far silently drops short words.
- Frames: exactly 1,024 bytes at real-time cadence (no bursts). Session hard cap 15 minutes.
- Server messages used: `connected`, `processing` (speech ended), `transcript` (`text`, `segment_id`, `segment_index`, `latency`), `error`.
- Use a raw WebSocket client: the Python SDK does not expose VAD headers. Today only final transcripts are sent (no partials), so budget for segment-level detection.

**11.2 REST STT** (`POST /stt/v3`, ≤ 60 s): used for the enrollment liveness phrase and file replays. `language_code`, `format=verbatim`.

**11.3 TTS (Timbre v2.5)**

- `POST /api/v1/tts/inference` with `model: timbre-v2.5`, `voice`, `language`, `speed` (0.85 to 1.15), `audio_config`. Use `language: auto` for mixed scripts.
- Write numbers as spoken words (see Gnani's Input Formatting Guide); verify the pronunciation of the 1930 helpline text on day 1.
- Default warning voices: Hindi **Yashvi** or **Chitra** (warm, empathetic); Hinglish **Poorvi**; Telugu **Lavanya**; Tamil **Trisha**. Scammer actors for synthetic calls: **Hemraj** and **Omkar** (authoritative male), **Urmila** (formal).
- Output WAV 16 or 48 kHz for playback; for the synthetic test set also `container: mulaw` (forced 8 kHz).

**11.4 Voice cloning**

1. `POST /api/v1/tts/voice-clone/embeddings` (multipart `audio_file`, WAV/MP3, 5 to 30 s clean speech).
2. Handle both documented response shapes (`{embedding, shape, dtype}` and `data.voice_clone_embedding`). Store the object whole.
3. Synthesize via `POST /api/v1/tts/inference` with `model: vachana-vc-v1` and `speaker_embedding`.
4. **Spike:** verify cloned output quality in Hindi and one southern language; the docs show no language parameter for VC.

**11.5 Error handling:** 401 key, 403 credits exhausted, 429 rate limit (exponential backoff), 500/503 retry with backoff, then degrade to rules-only plus on-screen warning if audio synthesis is down.

## 12. Data model and privacy

| Table | Key fields |
| --- | --- |
| guardians | id, name, gender, telegram\_chat\_id |
| elders | id, guardian\_id, name, language |
| voice\_profiles | id, guardian\_id, embedding\_json, consent\_ts, liveness\_phrase, deleted\_at |
| clips | id, voice\_profile\_id, level, language, audio\_path |
| sessions | id, elder\_id, started\_at, ended\_at, max\_score, max\_level, synthetic(bool) |
| events | id, session\_id, ts, segment\_index, text\_excerpt, stages, score, level |

Privacy rules: no raw call audio stored; transcript text stored only as short excerpts for alerts, auto-deleted after 7 days; API keys only in server env; embeddings deletable by owner; a visible "Kavach is listening" indicator at all times; design to DPDP principles (consent, purpose limitation, minimisation).

## 13. Internal API

| Method / WS | Path | Purpose |
| --- | --- | --- |
| POST | `/api/guardians`, `/api/elders` | Profiles |
| GET | `/api/voice/challenge` | Random liveness sentence |
| POST | `/api/voice/enroll` | Audio upload: check phrase (REST STT), create embedding, pre-render clips |
| POST | `/api/voice/preview` | Preview a warning in the cloned voice |
| DELETE | `/api/voice/{id}` | Delete embedding and clips |
| WS | `/ws/session` | Client sends binary PCM frames and JSON \`{type:"playback\_start" |
| GET | `/api/sessions/{id}` | Timeline |
| POST | `/api/sessions/{id}/feedback` | Real/false alert |

## 14. UI specification

- **Elder screen:** one giant button, status ring (green/amber/red), one line of large Hindi text, no menus. Minimum 24 px text, high contrast, haptic-free.
- **Guardian screens:** setup wizard (profile, elder, consent, liveness read, preview), alert history, delete-my-voice.
- **Judge mode (demo):** split view with live transcript, stage chips S1 to S5, risk meter 0 to 100, per-segment latency, "SYNTHETIC / ROLE-PLAYED CALL" badge.
- UI strings in Hinglish with Devanagari option.

## 15. Evaluation plan

**Synthetic call generator:** two-speaker scripts rendered with Timbre (scammer and victim voices), exported as 8 kHz, passed through µ-law encode/decode, mixed with background noise (street, TV, fan) at clean, 15 dB and 5 dB SNR.

**Matrix (start small, scale if credits allow):** 12 scam scripts (4 variants of authority: CBI, TRAI, customs, bank) × 2 languages (Hindi, Hinglish) × 3 noise levels, plus 12 benign scripts × same languages at 2 noise levels.

**Process:** run Prisma on each file **once**, save the transcripts (JSON). Tune the dictionaries, thresholds and LLM prompt **offline on saved transcripts at zero credit cost**.

**Metrics:** per-stage recall; level-2 escalation before the payment turn; benign false-alarm rate; time-to-warning (replay mode, real-time pace); key-term hit rate with and without word boosting.

**Deliverable:** one results table and one chart for the demo end-card and the written submission.

## 16. Credit plan (5,000 credits)

Gnani does not publish the credit-to-usage conversion in the docs I reviewed. **Day-1 measurement:** note the dashboard balance, run (a) 60 s of REST STT, (b) 60 s of realtime STT, (c) 500 characters of TTS, (d) one embedding, (e) 500 characters of cloned TTS, and record the balance after each. Then fill this table:

| Item | Credits per unit | Planned units | Subtotal |
| --- | --- | --- | --- |
| STT realtime (per min) | ? | dev \~60 min, demo \~30 min |  |
| STT REST/batch (per min) | ? | eval \~150 min |  |
| TTS (per 1k chars) | ? | scripts \~60k chars |  |
| Cloned TTS (per 1k chars) | ? | warning clips only |  |
| Embedding (each) | ? | \~10 |  |

Budget split: 35% development, 35% evaluation, 15% demo and rehearsal, **15% reserve**. Savings: pre-render and cache all TTS; unit tests run on saved transcripts; arm the realtime stream only on button press; never leave a session open unattended.

## 17. Non-functional requirements

- **Latency:** see section 10; show measured P50/P95 in judge mode.
- **Reliability:** reconnect on socket drop within 2 s; never crash the UI on API error.
- **Security:** keys server-side; HTTPS; rate-limit the public endpoints; no secrets in the repo.
- **Accessibility:** large text, audio-first, works with one tap.
- **Compatibility:** Chrome on Android and desktop; test mic on the exact demo device.

## 18. Safety, ethics, compliance

- Voice cloning is consent-gated, owner-only, deletable, and used only to warn. We state publicly that cloning is also a scammer tool and explain why our design is different.
- No real scam numbers, victims or recordings in the demo; role-played and labelled as such.
- Claims are limited to what we measured on synthetic data. We say "in our tests".
- Warning copy must be factual: agencies do not arrest over phone or video calls or ask for money; report at 1930 or cybercrime.gov.in.
- Misuse risks (cloning others' voices, stalking via listening) are mitigated by liveness read, visible listening indicator and guardian-only controls.

## 19. Demo and distribution plan

**60-second script (Demo Day Drop):**

1. 0 to 5 s: text card, "₹4,057 crore lost to digital arrest scams (2022 to May 2026)".
2. 5 to 15 s: elder persona (a consenting relative) with phone on speaker; Kavach on the second device.
3. 15 to 35 s: role-played CBI call escalates; stage chips light up S1 to S5; meter climbs.
4. 35 to 45 s: the cloned family voice breaks in: "Hang up. This is a scam."; guardian's phone buzzes.
5. 45 to 55 s: results card from our eval ("X% caught, Y s median, on noisy 8 kHz synthetic calls").
6. 55 to 60 s: end card with #GnaniAI #GreatIndianAIInternshipChallenge and a tag to Gnani AI.

**Distribution:** only *nominated* posts count toward verified engagement, so publish the **main nominated post early (about 28 Oct)** with a working demo, then add progress as replies or reshares of that same post. Keep one nominated post per platform (LinkedIn and X). Share organically with college groups, family WhatsApp circles, senior-citizen associations and local cyber-awareness volunteers. No bought engagement, bots or swaps. Confirm in the submission form exactly how posts are nominated.

## 20. Timeline and roles (two-person team)

Roles: **A = backend/voice** (WS proxy, Prisma/Timbre/VC integration, enrollment, alerts); **B = frontend/detection/eval** (PWA, scorer, dictionaries, synthetic set, demo). Each logs their commits and contributions weekly, since offers are individual.

| Dates | Milestone | Owner |
| --- | --- | --- |
| 12 to 14 Oct | Spikes S1 to S8 (section 22), credit measurement, repo setup | A+B |
| 15 to 18 Oct | WS proxy + realtime transcripts on screen; dictionaries v0 and rule scorer; pre-rendered clips | A / B |
| 19 to 22 Oct | Stage scoring + levels; intervention manager; echo gate; reconnect logic | A+B |
| 23 to 27 Oct | Guardian wizard, consent + liveness, cloned clips; Telegram alerts; judge mode UI | A / B |
| 28 Oct | **Publish main nominated post** with first working demo | A+B |
| 28 Oct to 1 Nov | Synthetic generator, saved transcripts, eval report; tune thresholds | B / A |
| 2 to 5 Nov | LLM layer (if time), second language (stretch), polish, edge cases | A+B |
| 6 to 7 Nov | Record final demo; update post; write submission text | A+B |
| 8 Nov | **Submit** | A+B |
| 9 to 10 Nov | Buffer only |  |

## 21. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Mobile browser mic muted during a native phone call | Second-device design; test on day 1; fallback is laptop mic |
| Echo: Kavach transcribes its own warnings | FR-5 echo gate; test with loud speaker |
| Credits run out | Section 16 plan; reserve; offline tuning on saved transcripts |
| Docs vs. reality gaps (language counts, response shapes, diarization limits) | Build to the API docs; handle both shapes; log raw responses |
| Cloned voice weak in non-Hindi languages | Day-1 spike; fall back to default Timbre voice |
| False alarms embarrass the demo | Benign test set; single-stage cap at L1; demo script rehearsed |
| Prisma returns only final segments (delayed detection) | Tune `x-min-silence-ms`; measure real time-to-warning honestly |
| Cloning ethics backlash | Consent + liveness + deletion + public explanation |
| Teammate imbalance affects individual offers | Clear role split and contribution log |

## 22. Day-1 spikes (go/no-go)

| # | Spike | Pass condition |
| --- | --- | --- |
| S1 | Create API keys; record credit costs | Table in section 16 filled |
| S2 | Realtime STT with a Hindi sample, 16 kHz frames | Transcripts printed, latency logged |
| S3 | Same on 8 kHz µ-law noisy sample | Key terms recognised; else tune VAD |
| S4 | Word boosting on vs. off | Measurable hit-rate difference |
| S5 | Timbre warning in Yashvi/Poorvi; check number pronunciation | Natural audio; "1930" spoken correctly |
| S6 | Voice clone from a 20 s sample; Hindi output | Recognisably similar, intelligible |
| S7 | Browser mic during an active phone call on speaker | Capture works on chosen device |
| S8 | Echo test: warning playing while streaming | Gate prevents self-transcription |

If S7 fails on phones, the product is two-device (tablet/laptop/old phone). If S6 fails for a language, use the default voice for that language.

## 23. Submission checklist

- [ ] Demo video (final cut under 60 s plus an optional 2-minute walkthrough)
- [ ] Posts live on LinkedIn and X with #GnaniAI #GreatIndianAIInternshipChallenge and a Gnani AI tag
- [ ] Written explanation: problem, users, architecture, measured results, limits
- [ ] Models used listed: Prisma v2.5 realtime/REST, Timbre v2.5, voice cloning `vachana-vc-v1`
- [ ] Each member's contribution written clearly
- [ ] Statement that all calls are synthetic or role-played
- [ ] Repo (public or shared) with README and eval report
- [ ] Submitted by 8 Nov, confirmation saved

## 24. Appendices

**A. Synthetic scam scenario outline (for the generator)** Caller claims to be from a TRAI/CBI desk, says the victim's SIM or Aadhaar is linked to a case, insists the victim stay on video and not tell family, cites a deadline, and finally asks for a "verification transfer" to a "safe account". Victim voice hesitates, asks questions, then starts to comply. Write 4 authority variants and 2 pacing variants each; 12 benign counterparts (bank KYC reminder, courier OTP confusion, doctor appointment, family chat).

**B. LLM prompt (system)** "You judge whether a phone conversation excerpt shows a scam in progress. Input: last 8 transcript segments and rule hits. Output ONLY JSON: {"scam\_probability": number 0-1, "stages": \["S1"..."S5"\], "reason": string under 20 words}. Genuine banks, couriers and doctors do not demand transfers to safe accounts, forbid secrecy, or threaten arrest by phone."

**C. Warning copy (Hindi, level 2)** रुकिए! यह स्कैम है। पुलिस या सीबीआई फ़ोन पर किसी को गिरफ़्तार नहीं करती। फ़ोन काट दीजिए। Level 3 adds: परिवार को सूचना भेज दी गई है; साइबर हेल्पलाइन पर कॉल कीजिए। Provide gendered variants for the guardian's own voice ("बोल रहा / बोल रही हूँ").

**D. Repo layout** `apps/web` (PWA), `apps/api` (FastAPI), `packages/detector` (dictionaries, scorer, tests), `eval` (generator, transcripts, report), `demo` (replay audio, scripts), `docs`.

**E. Environment variables** `GNANI_API_KEY`, `LLM_PROVIDER`, `LLM_API_KEY`, `TELEGRAM_BOT_TOKEN`, `DATABASE_URL`, `APP_BASE_URL`. Never commit them.

**F. Open questions**

1. Exact credit-to-usage rates (S1). 2. Whether VC output works well beyond Hindi (S6). 3. How the submission form nominates posts and whether post edits are allowed. 4. Whether Gnani's terms impose limits on cloned-voice use that need to be quoted in our consent text.
