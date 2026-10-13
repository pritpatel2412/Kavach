# Gnani API notes (verified 13 Oct 2026 against docs.gnani.ai; re-check the linked page if something misbehaves)

Auth: header `X-API-Key-ID: <key>` on REST. Realtime STT uses upgrade header `x-api-key-id`. Dashboard: https://app.gnani.ai/voice/ (3 free keys).
Credit-to-usage conversion is NOT documented: measure in Spike S1 and record in `docs/CREDITS_LOG.md`.

## STT realtime (Prisma v2.5) /api/STT/stt-websocket
- `wss://api.vachana.ai/stt/v3/stream`. Config via **upgrade headers**; browsers cannot set them -> backend proxy (`apps/api/app/gnani/stt_stream.py`).
- Headers: `x-api-key-id` (req), `lang_code` (req; hi-IN, en-IN, bn-IN, gu-IN, kn-IN, ml-IN, mr-IN, pa-IN, ta-IN, te-IN), `x-sample-rate` (8000|16000|44100|48000),
  `x-format` (`verbatim` default | `transcribe` = ITN), `itn_native_numerals`, `x-bias-list`, `x-bias-score`, `x-enable-substitution`, `x-substitution-map` (<=10 rules).
- **en-IN accepts Hindi-English mixed audio and outputs Latin script (Hinglish).** hi-IN outputs Devanagari.
- VAD headers (fixed per connection): `x-vad-threshold` (0.7; telephony 0.65-0.75), `x-min-silence-ms` (500; telephony 400-600), `x-min-speech-ms` (100; 200 at 8 kHz),
  `x-min-segment-ms` (120; too high silently drops short words), `x-max-speech-s` (disabled).
- Audio: raw PCM16 LE mono, **binary frames EXACTLY 1024 bytes** (512 samples) at real-time cadence: 32 ms @16 kHz, 64 ms @8 kHz. Never burst. 44.1/48 kHz resampled server-side.
- Session cap **15 minutes** (we roll at 14:30).
- Server msgs: `connected`, `processing` (speech end), `transcript` {text, audio_duration_ms, segment_id, segment_index, latency}, `error`, `settings_updated`.
  Only final transcripts today (a `x-partials` header exists in docs; not relied on).
- Control frame: `{"type":"update_settings","bias":{"list":[...],"score":1.0}}` updates word boosting mid-session.
- **Word boosting:** <=100 words, each a single word, letters only, `x-format: verbatim`, score in {0.0,0.5,1.0,1.5,2.0}. **Any invalid entry => whole list silently ignored (HTTP 200).**
  Indic words in headers: JSON array with `\uXXXX` escapes (our `build_headers` does this).
- Python SDK `gnani-vachana` does NOT expose VAD headers -> we use raw `websockets`.

## STT REST /api/STT/speech-to-text
`POST https://api.vachana.ai/stt/v3` multipart `audio_file`, `language_code`; <=60 s; WAV/MP3/OGG/FLAC/AAC/M4A, 8-44.1 kHz. Response `{success, request_id, transcript, model}`.
Use for enrollment liveness phrase and short clips.

## TTS Timbre v2.5 /api/TTS/tts-inference
`POST https://api.vachana.ai/api/v1/tts/inference` JSON `{text, voice, model:"timbre-v2.5", language, speed(0.85-1.15), audio_config{sample_rate, num_channels, sample_width, encoding, container}}`.
Languages: auto, hi-IN, en-IN, ta-IN, te-IN, kn-IN, ml-IN, mr-IN, pa-IN, bn-IN, gu-IN, hi-en (Hinglish). Containers: wav, raw, mp3, ogg, mulaw (forced 8 kHz), alaw.
Voices seen in docs: Nalini (Hindi), Kaveri (English), Deepak (Hindi), Poorvi (Hinglish); full catalog (42 voices) at /api/TTS/available-voices (verify names in Spike S5).
**Numbers/IDs must be written as spoken words** (Input Formatting Guide) or they are mispronounced. Streaming: SSE `/api/v1/tts/sse`; realtime WS `wss://api.vachana.ai/api/v1/tts` (header `X-API-Key-ID`).
Errors: 400 bad params, 403 forbidden/credits, 429 rate limit, 500/503 retry.

## Voice cloning (vachana-vc-v1)
1. `POST /api/v1/tts/voice-clone/embeddings` multipart `audio_file` (5-30 s clean WAV/MP3) -> embedding. **Two documented response shapes**
   (`{embedding,shape,dtype}` and `{data:{voice_clone_embedding:{...}}}`); `normalise_embedding()` handles both. Shape [1,768], dtype torch.bfloat16.
2. `POST /api/v1/tts/inference` with `{text, model:"vachana-vc-v1", audio_config{...}, speaker_embedding{embedding,shape,dtype}}` (no `voice`/`language` fields documented).
Unknown: quality outside Hindi/English (Spike S6).

## Other
Batch STT: diarization, language ID, denoise, bias list (docs disagree on max speakers: 2 vs 8). Pipecat/LiveKit plugins exist but we use raw WS.
Evon (30B reasoning, open weights on Hugging Face, by request) is NOT on the API platform: optional, not on the critical path.
