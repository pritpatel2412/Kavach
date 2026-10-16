const $ = (id) => document.getElementById(id);
const err = (m) => {
  const el = $("err");
  el.textContent = m || "";
  if (m) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
};
const ok = (m) => { $("ok").textContent = m || ""; };

let guardianId = localStorage.getItem("kavach_guardian_id") || "";
let elderId = localStorage.getItem("kavach_elder_id") || "";
let voiceId = localStorage.getItem("kavach_voice_id") || "";
let challenge = null;
let chunks = [];
let rec = null;
let recStream = null;
let recStart = 0;
let recTimer = null;
let wavBlob = null;

const STEPS = ["s1", "s2", "s3", "s4", "s5"];

function show(id) {
  err("");
  ok("");
  const stepIdx = STEPS.indexOf(id);
  STEPS.forEach((s, idx) => {
    $(s).classList.toggle("hidden", s !== id);
    const node = $("node" + (idx + 1));
    if (node) {
      node.classList.toggle("active", idx === stepIdx);
      node.classList.toggle("done", idx < stepIdx);
    }
  });
}

function apiError(data) {
  const d = data && data.detail;
  if (d && d.error) {
    const map = {
      consent_required: "सहमति चाहिए · Explicit consent required",
      liveness_failed: "वाक्य मेल नहीं खाया · Liveness check failed — read the sentence again clearly",
      challenge_invalid: "वाक्य समाप्त · Challenge expired or already used — please fetch a new one",
    };
    return map[d.error] || d.error;
  }
  return typeof d === "string" ? d : "अनुरोध विफल रहा · Request failed";
}

$("next1").onclick = async () => {
  err("");
  const name = $("gname").value.trim();
  if (!name) return err("कृपया अपना नाम लिखें · Please enter your name");
  try {
    const r = await fetch("/api/guardians", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, gender: $("gender").value, telegram_chat_id: $("tg").value.trim() || null }),
    });
    const data = await r.json();
    if (!r.ok) return err(apiError(data));
    guardianId = data.id;
    localStorage.setItem("kavach_guardian_id", guardianId);
    show("s2");
  } catch (e) {
    err("सर्वर से संपर्क नहीं हो सका · Server connection failed: " + e.message);
  }
};

$("next2").onclick = async () => {
  err("");
  const name = $("ename").value.trim();
  if (!name) return err("बुज़ुर्ग का नाम लिखें · Elder's name is required");
  try {
    const r = await fetch("/api/elders", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guardian_id: guardianId, name, language: $("lang").value }),
    });
    const data = await r.json();
    if (!r.ok) return err(apiError(data));
    elderId = data.id;
    localStorage.setItem("kavach_elder_id", elderId);
    show("s3");
  } catch (e) {
    err("सर्वर त्रुटि · Server error: " + e.message);
  }
};

$("next3").onclick = async () => {
  err("");
  if (!$("consent").checked) return err("कृपया सहमति बॉक्स चेक करें · Please check the consent checkbox to continue");
  try {
    const r = await fetch("/api/voice/challenge");
    challenge = await r.json();
    $("sentence").textContent = challenge.sentence;
    show("s4");
    // Show demo audio option in mock environments
    if ($("useDemo")) $("useDemo").style.display = "inline-block";
  } catch (e) {
    err("वाक्य लोड नहीं हो सका · Could not load challenge: " + e.message);
  }
};

function encodeWav(float32, sampleRate) {
  const outRate = 16000;
  const ratio = sampleRate / outRate;
  const n = Math.floor(float32.length / ratio);
  const pcm = new Int16Array(n);
  for (let i = 0; i < n; i++) {
    const x = Math.max(-1, Math.min(1, float32[Math.floor(i * ratio)] || 0));
    pcm[i] = x < 0 ? x * 0x8000 : x * 0x7fff;
  }
  const buf = new ArrayBuffer(44 + pcm.length * 2);
  const v = new DataView(buf);
  const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + pcm.length * 2, true); w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, outRate, true); v.setUint32(28, outRate * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data");
  v.setUint32(40, pcm.length * 2, true);
  new Int16Array(buf, 44).set(pcm);
  return new Blob([buf], { type: "audio/wav" });
}

function makeDemoWav() {
  const sampleRate = 16000;
  const numSamples = sampleRate * 5; // 5 seconds
  const pcm = new Int16Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    pcm[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0x3fff;
  }
  const buf = new ArrayBuffer(44 + pcm.length * 2);
  const v = new DataView(buf);
  const w = (o, s) => { for (let j = 0; j < s.length; j++) v.setUint8(o + j, s.charCodeAt(j)); };
  w(0, "RIFF"); v.setUint32(4, 36 + pcm.length * 2, true); w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data");
  v.setUint32(40, pcm.length * 2, true);
  new Int16Array(buf, 44).set(pcm);
  return new Blob([buf], { type: "audio/wav" });
}

$("rec").onclick = async () => {
  err("");
  ok("");
  chunks = [];
  wavBlob = null;
  if ($("playback")) $("playback").style.display = "none";
  try {
    recStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (e) {
    if ($("useDemo")) $("useDemo").style.display = "inline-block";
    return err("माइक्रोफ़ोन अनुमति नहीं मिली · Mic permission denied. You can click 'Use Demo Voice' to continue.");
  }
  const ctx = new AudioContext();
  await ctx.resume();
  const src = ctx.createMediaStreamSource(recStream);
  const proc = ctx.createScriptProcessor(4096, 1, 1);
  const mute = ctx.createGain();
  mute.gain.value = 0;
  const acc = [];
  proc.onaudioprocess = (ev) => acc.push(new Float32Array(ev.inputBuffer.getChannelData(0)));
  src.connect(proc);
  proc.connect(mute);
  mute.connect(ctx.destination);
  recStart = Date.now();
  rec = { ctx, proc, src, acc };
  $("rec").disabled = true;
  $("stopRec").disabled = false;
  $("upload").disabled = true;
  if ($("recDot")) $("recDot").classList.add("active");
  recTimer = setInterval(() => {
    const s = Math.floor((Date.now() - recStart) / 1000);
    $("timer").textContent = s + " s / 30 s";
    if (s >= 30) $("stopRec").click();
  }, 200);
};

$("stopRec").onclick = () => {
  if (!rec) return;
  clearInterval(recTimer);
  const dur = (Date.now() - recStart) / 1000;
  const sr = rec.ctx.sampleRate || 44100;
  rec.proc.disconnect();
  rec.src.disconnect();
  rec.ctx.close();
  recStream && recStream.getTracks().forEach((t) => t.stop());
  const len = rec.acc.reduce((n, a) => n + a.length, 0);
  const all = new Float32Array(len);
  let o = 0;
  rec.acc.forEach((a) => { all.set(a, o); o += a.length; });
  wavBlob = encodeWav(all, sr);
  rec = null;
  $("rec").disabled = false;
  $("stopRec").disabled = true;
  if ($("recDot")) $("recDot").classList.remove("active");
  if (dur < 5) {
    $("upload").disabled = true;
    return err("कम से कम 5 सेकंड पढ़ें · Please read for at least 5 seconds (" + Math.round(dur) + "s recorded)");
  }
  $("upload").disabled = false;
  ok("रिकॉर्डिंग तैयार · Recording ready (" + Math.round(dur) + "s). You can listen below or upload.");
  if ($("playback")) {
    $("playback").src = URL.createObjectURL(wavBlob);
    $("playback").style.display = "block";
  }
};

if ($("useDemo")) {
  $("useDemo").onclick = () => {
    wavBlob = makeDemoWav();
    $("upload").disabled = false;
    $("timer").textContent = "5 s / 30 s (Demo audio ready)";
    ok("डेमो ऑडियो तैयार · Demo 5s audio generated. Ready to upload.");
    if ($("playback")) {
      $("playback").src = URL.createObjectURL(wavBlob);
      $("playback").style.display = "block";
    }
  };
}

$("upload").onclick = async () => {
  err("");
  ok("");
  if (!wavBlob || !challenge) return err("पहले वाक्य रिकॉर्ड करें · Record the challenge sentence first");
  const fd = new FormData();
  fd.append("audio_file", wavBlob, "liveness.wav");
  fd.append("challenge_id", challenge.challenge_id);
  fd.append("guardian_id", guardianId);
  fd.append("elder_id", elderId);
  fd.append("consent", "true");
  try {
    const r = await fetch("/api/voice/enroll", { method: "POST", body: fd });
    const data = await r.json();
    if (!r.ok) return err(apiError(data));
    voiceId = data.voice_profile_id;
    localStorage.setItem("kavach_voice_id", voiceId);
    $("elderLink").href = `/?mock=1&judge=1&elder=${elderId}`;
    const fallbackList = (data.clips || []).filter((c) => c.fallback).map((c) => "L" + c.level).join(", ");
    ok("आवाज़ सफलतापूर्वक सेव हो गई · Voice enrolled! Fallback clips: " + (fallbackList || "none"));
    show("s5");
  } catch (e) {
    err("अपलोड विफल · Upload failed: " + e.message);
  }
};

document.querySelectorAll("[data-level]").forEach((btn) => {
  btn.onclick = async () => {
    err("");
    if (!voiceId) return err("कोई आवाज़ प्रोफ़ाइल नहीं मिली · No voice profile enrolled");
    try {
      const r = await fetch("/api/voice/preview", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice_profile_id: voiceId, level: Number(btn.dataset.level) }),
      });
      if (!r.ok) return err("क्लिप लोड नहीं हुई · Clip preview failed");
      const url = URL.createObjectURL(await r.blob());
      const aud = new Audio(url);
      aud.play();
    } catch (e) {
      err("ऑडियो प्लेबैक त्रुटि · Audio playback error: " + e.message);
    }
  };
});

$("del").onclick = async () => {
  if (!voiceId) return;
  if (!confirm("क्या आप अपनी आवाज़ और सभी क्लिप्स हमेशा के लिए मिटाना चाहते हैं?\nAre you sure you want to permanently delete your voice profile and all audio clips?")) {
    return;
  }
  try {
    const r = await fetch("/api/voice/" + voiceId, { method: "DELETE" });
    const data = await r.json();
    if (!r.ok || !data.deleted) return err("डिलीट नहीं हो सका · Delete failed");
    localStorage.removeItem("kavach_voice_id");
    voiceId = "";
    ok("आवाज़ और क्लिप्स मिटा दी गईं · Voice embedding and clips deleted successfully");
    show("s1");
  } catch (e) {
    err("डिलीट त्रुटि · Delete error: " + e.message);
  }
};

// Check if user already has active profile
if (voiceId) {
  // Option to jump to preview
  show("s1");
}
