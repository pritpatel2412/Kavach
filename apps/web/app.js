// Elder screen + judge panel.
// Query: ?judge=1  ?lang=hi-IN  ?mock=1  ?elder=<id>  ?replay=<wav>
const q = new URLSearchParams(location.search);
const lang = q.get("lang") || "hi-IN";
const mock = q.get("mock") === "1";
const replayQ = q.get("replay") || "";
if (q.get("judge") === "1") document.body.classList.add("judge");
if (mock || q.get("synthetic") === "1" || replayQ) document.getElementById("synthetic").style.display = "inline-block";

const $ = (id) => document.getElementById(id);
const STAGES = ["S1_authority", "S2_accusation", "S3_isolation", "S4_urgency", "S5_payment"];
$("chips").innerHTML = STAGES.map((s) => `<span class="chip" id="c_${s}">${s.replace("_", " ")}</span>`).join("");

let ws, ctx, node, stream, listening = false, sessionId = null, audioUnlocked = false;
const latencies = [];
const ttws = [];
let lastAlert = "none";

function log(line) {
  const d = document.createElement("div");
  d.textContent = line;
  $("log").prepend(d);
}

function pct(arr, p) {
  if (!arr.length) return "—";
  const s = [...arr].sort((a, b) => a - b);
  const i = Math.min(s.length - 1, Math.max(0, Math.ceil((p / 100) * s.length) - 1));
  return s[i] + " ms";
}

function renderStats() {
  const p50 = pct(latencies, 50);
  const p95 = pct(latencies, 95);
  const ttwMed = pct(ttws, 50);
  if ($("statStt")) $("statStt").textContent = `${p50} / ${p95}`;
  if ($("statTtw")) $("statTtw").textContent = ttwMed;
  if ($("statAlert")) $("statAlert").textContent = lastAlert;
  if ($("stats")) {
    $("stats").textContent =
      `STT p50 ${p50} · p95 ${p95} · TTW median ${ttwMed} · Alert ${lastAlert}`;
  }
}

let wakeLock = null;
let heartbeatTimer = null;
let reconnectTimer = null;
let currentReplay = "";

async function requestWakeLock() {
  if ("wakeLock" in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      log("screen wake lock active");
    } catch (e) {
      log("wake lock err: " + e);
    }
  }
}

function releaseWakeLock() {
  if (wakeLock) {
    try { wakeLock.release(); } catch {}
    wakeLock = null;
  }
}

document.addEventListener("visibilitychange", () => {
  if (wakeLock !== null && document.visibilityState === "visible" && listening) {
    requestWakeLock();
  }
});

function setDeviceState(state, extra) {
  const el = $("listen");
  const txt = $("listenTxt");
  const statDev = $("statDevice");
  el.className = "";
  if (state === "armed") {
    el.className = "on";
    txt.textContent = "Kavach आर्मड · Armed & Listening";
    if (statDev) { statDev.textContent = "Armed · Standby"; statDev.style.color = "var(--ok)"; }
  } else if (state === "reconnecting") {
    el.className = "reconnecting";
    txt.textContent = "पुनः जुड़ रहा है · Reconnecting...";
    if (statDev) { statDev.textContent = "Reconnecting..."; statDev.style.color = "var(--warn)"; }
  } else {
    el.className = "off";
    txt.textContent = extra || "Kavach ऑफ़लाइन · Offline / Disarmed";
    if (statDev) { statDev.textContent = "Offline"; statDev.style.color = "var(--mut)"; }
  }
}

function startHeartbeat() {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: "heartbeat" }));
    }
  }, 30000);
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

function setListening(on, extra) {
  setDeviceState(on ? "armed" : "offline", extra);
}

function setLevel(level, text) {
  const ring = $("ring");
  ring.className = level ? "l" + level : "";
  const hindi = ["सुरक्षित", "सावधान", "ख़तरा", "ख़तरा"][level] || "सुरक्षित";
  const english = ["SAFE", "CAUTION", "SCAM DETECTED", "CRITICAL THREAT"][level] || "SAFE";
  if ($("ringStatus")) {
    $("ringStatus").textContent = hindi;
  } else {
    ring.textContent = hindi;
  }
  if ($("ringSub")) $("ringSub").textContent = english;
  if (text) $("msg").textContent = text;
  $("help").style.display = level >= 3 ? "inline-block" : "none";
}

function unlockAudio() {
  if (audioUnlocked) return;
  const a = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=");
  a.play().catch(() => {});
  audioUnlocked = true;
}

function play(url) {
  const a = new Audio(url);
  a.onplay = () => ws && ws.readyState === 1 && ws.send(JSON.stringify({ type: "playback_start" }));
  const end = () => ws && ws.readyState === 1 && ws.send(JSON.stringify({ type: "playback_end" }));
  a.onended = end; a.onerror = end;
  a.play().catch(end);
}

let playbackCtx = null;
function playIntercomPcm(b64Pcm, sampleRate = 16000) {
  try {
    const bin = atob(b64Pcm);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const int16 = new Int16Array(bytes.buffer);
    if (!playbackCtx) playbackCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate });
    const buf = playbackCtx.createBuffer(1, int16.length, sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < int16.length; i++) ch[i] = int16[i] / 32768.0;
    const src = playbackCtx.createBufferSource();
    src.buffer = buf;
    src.connect(playbackCtx.destination);
    src.start();
    if ($("statDevice")) {
      $("statDevice").textContent = "🎙️ Intercom Active (Guardian Speaking)";
      $("statDevice").style.color = "var(--bad)";
      clearTimeout(window._intercomReset);
      window._intercomReset = setTimeout(() => {
        if ($("statDevice")) {
          $("statDevice").textContent = "Armed · Standby";
          $("statDevice").style.color = "var(--ok)";
        }
      }, 1500);
    }
  } catch (err) {
    log("intercom audio err: " + err);
  }
}

function onEvent(ev) {
  switch (ev.type) {
    case "state":
      sessionId = ev.session_id || sessionId;
      if (sessionId) {
        localStorage.setItem("kavach_last_session_id", sessionId);
        const tlLink = document.querySelector('a[href*="timeline.html"]');
        if (tlLink) tlLink.href = `timeline.html?session=${sessionId}`;
      }
      log(`state: ${ev.state}${ev.mock ? " (mock)" : ""} session=${ev.session_id || ""}`);
      if (ev.stt_minutes_today !== undefined && $("statUsage")) {
        $("statUsage").textContent = `${ev.stt_minutes_today.toFixed(1)} / ${ev.max_stt_minutes_per_day || 30} min`;
        if (ev.stt_minutes_today >= (ev.max_stt_minutes_per_day || 30)) {
          $("statUsage").style.color = "var(--bad)";
        }
      }
      if (ev.state === "listening") setDeviceState("armed");
      if (ev.state === "stopped") {
        setDeviceState("offline");
        if (sessionId) log("timeline: /timeline.html?session=" + sessionId);
      }
      break;
    case "error":
      $("err").textContent = ev.message || "Error";
      log("SERVER ERROR: " + ev.message);
      if (ev.stt_minutes_today !== undefined && $("statUsage")) {
        $("statUsage").textContent = `${ev.stt_minutes_today.toFixed(1)} / ${ev.max_stt_minutes_per_day || 30} min (Exceeded)`;
        $("statUsage").style.color = "var(--bad)";
      }
      stop(false);
      break;
    case "transcript":
      if (ev.latency_ms != null) latencies.push(ev.latency_ms);
      log(`#${ev.segment_index} ${ev.text}`);
      renderStats();
      break;
    case "risk":
      $("meterFill").style.width = ev.score + "%";
      if ($("scoreText")) $("scoreText").textContent = ev.score + " / 100";
      STAGES.forEach((s) => $("c_" + s).classList.toggle("on", (ev.stages || []).includes(s)));
      setLevel(ev.level);
      if ($("judgeReason") && (ev.reason_hi || ev.reason_en)) {
        $("judgeReason").textContent = `${ev.reason_hi || ""} · ${ev.reason_en || ""}`;
      }
      log(`risk ${ev.score} L${ev.level} hits: ${(ev.hits || []).join(", ")}`);
      break;
    case "intervene":
      setLevel(ev.level, ev.screen_text);
      if (ev.ttw_ms != null) ttws.push(ev.ttw_ms);
      if ($("judgeReason") && (ev.reason_hi || ev.reason_en)) {
        $("judgeReason").textContent = `${ev.reason_hi || ""} · ${ev.reason_en || ""}`;
      }
      renderStats();
      log(`INTERVENE L${ev.level} ttw=${ev.ttw_ms}ms ${ev.clip_url || "(text only)"}`);
      if (ev.clip_url) play(ev.clip_url);
      break;
    case "intercom_audio":
      playIntercomPcm(ev.audio, ev.rate || 16000);
      break;
    case "alert_sent":
      lastAlert = `L${ev.level} ${ev.delivered ? "delivered" : "not delivered"}`;
      renderStats();
      log(`guardian alert ${lastAlert}`);
      break;
    case "stt_error":
      $("err").textContent = "STT error: " + (ev.message || "connection failed");
      setDeviceState("reconnecting", "STT error · reconnecting?");
      log("STT ERROR: " + ev.message);
      break;
    case "stt_connected":
      $("err").textContent = "";
      setDeviceState("armed");
      log("STT connected");
      break;
  }
}

function elderId() {
  return q.get("elder") || localStorage.getItem("kavach_elder_id") || $("elder").value || "";
}

async function loadElders() {
  try {
    const isMock = q.get("mock") === "1";
    const token = q.get("token") || localStorage.getItem("kavach_guardian_token") || "";
    if (!token) {
      if (isMock) {
        const sel = $("elder");
        sel.innerHTML = '<option value="">— select / चुनें —</option>' +
          '<option value="demo_elder_1">Dada ji (hi-IN)</option>' +
          '<option value="demo_elder_2">Dadi ji (hi-IN)</option>';
        if (q.get("elder")) sel.value = q.get("elder");
      }
      return;
    }
    const headers = { "Authorization": "Bearer " + token };
    const r = await fetch("/api/elders", { headers });
    if (!r.ok) return;
    const data = await r.json();
    const sel = $("elder");
    sel.innerHTML = '<option value="">— select / चुनें —</option>' +
      (data.elders || []).map((e) => `<option value="${e.id}">${e.name} (${e.language})</option>`).join("");
    const saved = q.get("elder") || localStorage.getItem("kavach_elder_id");
    if (saved) sel.value = saved;
    sel.onchange = () => localStorage.setItem("kavach_elder_id", sel.value);
  } catch (e) {
    log("elders: " + e);
  }
}

let callStartTime = 0;
let lastSpeechTime = 0;
let sustainedSpeechMs = 0;
let handsFreeRingBuffer = [];
let handsFreeActive = false;
const MAX_SILENCE_MS = 3 * 60 * 1000;      // 3 minutes continuous silence auto-stop
const MAX_CALL_MS = 20 * 60 * 1000;        // 20 minutes maximum call duration
const SUSTAINED_SPEECH_TRIGGER_MS = 10000; // 10 seconds sustained speech

function handleWorkletFrame(e) {
  const data = e.data;
  const buf = data.buffer || data;
  const shouldTransmit = data.shouldTransmit !== undefined ? data.shouldTransmit : true;
  const isSilent = data.isSilent !== undefined ? data.isSilent : false;
  const now = Date.now();

  // Hands-Free pre-trigger local VAD monitoring (S3-A)
  if (handsFreeActive && !listening) {
    handsFreeRingBuffer.push(buf);
    if (handsFreeRingBuffer.length > 350) handsFreeRingBuffer.shift(); // ~11s ring
    if (!isSilent) {
      sustainedSpeechMs += 32;
      if (sustainedSpeechMs >= SUSTAINED_SPEECH_TRIGGER_MS) {
        log("Sustained speech detected (>=10s) -> auto-activating call protection!");
        sustainedSpeechMs = 0;
        start().then(() => {
          while (handsFreeRingBuffer.length && ws && ws.readyState === 1) {
            ws.send(handsFreeRingBuffer.shift());
          }
        }).catch(err => log("hands-free activation err: " + err));
      }
    } else {
      sustainedSpeechMs = Math.max(0, sustainedSpeechMs - 48);
    }
    return;
  }

  // Active call monitoring (S3-A)
  if (listening) {
    if (!isSilent) {
      lastSpeechTime = now;
    } else if (lastSpeechTime > 0 && now - lastSpeechTime > MAX_SILENCE_MS) {
      log("Auto-stopped: 3 minutes continuous silence reached (credit guard)");
      stop(true);
      return;
    }
    if (callStartTime > 0 && now - callStartTime > MAX_CALL_MS) {
      log("Auto-stopped: 20 minutes maximum call duration reached (credit guard)");
      stop(true);
      return;
    }

    // Never stream silence: client-side gating (S3-A)
    if (shouldTransmit && ws && ws.readyState === 1) {
      ws.send(buf);
    }
  }
}

async function start(replayName) {
  $("err").textContent = "";
  unlockAudio();
  currentReplay = replayName || replayQ;
  const proto = location.protocol === "https:" ? "wss" : "ws";
  const eid = elderId();
  const replay = currentReplay;
  const params = new URLSearchParams({ lang, rate: "16000" });
  if (eid) params.set("elder_id", eid);
  const defaultWs = `${proto}://${location.host}/ws/session`;
  const baseWs = (typeof window !== "undefined" && window.__KAVACH_CONFIG__ && window.__KAVACH_CONFIG__.wsUrl) || defaultWs;
  const targetWs = baseWs.includes("?") ? `${baseWs}&${params}` : `${baseWs}?${params}`;
  ws = new WebSocket(targetWs);
  ws.binaryType = "arraybuffer";
  ws.onmessage = (m) => typeof m.data === "string" && onEvent(JSON.parse(m.data));
  ws.onclose = () => {
    if (listening) {
      setDeviceState("reconnecting");
      log("socket disconnected · auto-reconnecting in 2.5s...");
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => {
        if (listening) {
          start(currentReplay).catch(e => log("reconnect failed: " + e));
        }
      }, 2500);
    }
  };
  ws.onerror = () => {
    $("err").textContent = "कनेक्शन नहीं जुड़ा · connection error";
  };
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  if (!mock && !replay) {
    if (!stream) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } });
      } catch (e) {
        $("err").textContent = "माइक्रोफ़ोन अनुमति नहीं मिली · mic permission denied";
        setDeviceState("offline", "mic denied");
        stop(false);
        return;
      }
    }
    if (!ctx) {
      ctx = new AudioContext();
      await ctx.audioWorklet.addModule("worklet.js");
      node = new AudioWorkletNode(ctx, "pcm16k");
      node.port.onmessage = handleWorkletFrame;
      ctx.createMediaStreamSource(stream).connect(node);
    }
  }
  listening = true;
  callStartTime = Date.now();
  lastSpeechTime = Date.now();
  requestWakeLock();
  startHeartbeat();
  $("toggle").textContent = "बंद करो · STOP";
  $("toggle").classList.add("stop");
  setLevel(0, "Kavach सुन रहा है");
  setDeviceState("armed");
}

function stop(sendStop = true) {
  listening = false;
  callStartTime = 0;
  lastSpeechTime = 0;
  clearTimeout(reconnectTimer);
  stopHeartbeat();
  releaseWakeLock();
  if (sendStop && ws && ws.readyState === 1) ws.send(JSON.stringify({ type: "stop" }));
  try { ws && ws.close(); } catch {}
  if (!handsFreeActive) {
    stream && stream.getTracks().forEach((t) => t.stop());
    stream = null;
    ctx && ctx.close();
    ctx = null;
  }
  $("toggle").textContent = "सुनना शुरू करो · START";
  $("toggle").classList.remove("stop");
  setLevel(0, "Kavach बंद है");
  setDeviceState("offline");
}

$("toggle").onclick = () => (listening ? stop() : start().catch((e) => {
  $("err").textContent = "शुरू नहीं हो सका · " + e;
  log("start failed: " + e);
  stop(false);
}));
$("replayBtn").onclick = () => {
  const sel = $("replaySelect");
  const chosen = (sel && sel.value) ? sel.value : "demo_scam_hinglish.wav";
  const url = new URL(location.href);
  url.searchParams.set("judge", "1");
  url.searchParams.set("mock", "1");
  url.searchParams.set("replay", chosen);
  if (listening) stop();
  history.replaceState({}, "", url);
  start(chosen).catch((e) => log("replay failed: " + e));
};

const hfToggle = $("handsFreeToggle");
if (hfToggle) {
  hfToggle.onchange = async () => {
    handsFreeActive = hfToggle.checked;
    const consent = $("handsFreeConsent");
    if (consent) consent.style.display = handsFreeActive ? "block" : "none";
    if (handsFreeActive && !listening && !stream) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } });
        ctx = new AudioContext();
        await ctx.audioWorklet.addModule("worklet.js");
        node = new AudioWorkletNode(ctx, "pcm16k");
        node.port.onmessage = handleWorkletFrame;
        ctx.createMediaStreamSource(stream).connect(node);
        log("Hands-free local energy-VAD monitoring active");
      } catch (e) {
        log("Hands-free mic permission denied: " + e);
        hfToggle.checked = false;
        handsFreeActive = false;
      }
    }
  };
}

fetch("/api/usage").then(r => r.json()).then(u => {
  if ($("statUsage")) {
    $("statUsage").textContent = `${u.stt_minutes_today.toFixed(1)} / ${u.max_stt_minutes_per_day} min`;
    if (u.budget_exceeded) $("statUsage").style.color = "var(--bad)";
  }
}).catch(() => {});

async function loadReplays() {
  try {
    const r = await fetch("/api/replays");
    if (!r.ok) return;
    const data = await r.json();
    const sel = $("replaySelect");
    if (sel && data.replays && data.replays.length > 1) {
      sel.style.display = "inline-block";
      sel.innerHTML = data.replays.map(rp => `<option value="${rp.name}">${rp.label}</option>`).join("");
      if (q.get("replay")) sel.value = q.get("replay");
    }
  } catch {}
}

loadElders();
loadReplays();
renderStats();

if (q.get("demo") === "1" || q.get("autoplay") === "1") {
  const startAutoplay = () => {
    setTimeout(() => {
      const btn = $("replayBtn");
      if (btn && !listening) {
        log("Auto-starting contest demo replay...");
        btn.click();
      }
    }, 600);
  };
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", startAutoplay);
  } else {
    startAutoplay();
  }
}
