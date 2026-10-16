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

function setListening(on, extra) {
  $("listen").className = on ? "on" : "off";
  $("listenTxt").textContent = on
    ? "Kavach सुन रहा है · listening"
    : (extra || "Kavach सुन नहीं रहा · not listening");
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
      if (ev.state === "listening") setListening(true);
      if (ev.state === "stopped") {
        setListening(false);
        if (sessionId) log("timeline: /timeline.html?session=" + sessionId);
      }
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
      log(`risk ${ev.score} L${ev.level} hits: ${(ev.hits || []).join(", ")}`);
      break;
    case "intervene":
      setLevel(ev.level, ev.screen_text);
      if (ev.ttw_ms != null) ttws.push(ev.ttw_ms);
      renderStats();
      log(`INTERVENE L${ev.level} ttw=${ev.ttw_ms}ms ${ev.clip_url || "(text only)"}`);
      if (ev.clip_url) play(ev.clip_url);
      break;
    case "alert_sent":
      lastAlert = `L${ev.level} ${ev.delivered ? "delivered" : "not delivered"}`;
      renderStats();
      log(`guardian alert ${lastAlert}`);
      break;
    case "stt_error":
      $("err").textContent = "STT error: " + (ev.message || "connection failed");
      setListening(true, "STT error · reconnecting?");
      log("STT ERROR: " + ev.message);
      break;
    case "stt_connected":
      $("err").textContent = "";
      log("STT connected");
      break;
  }
}

function elderId() {
  return q.get("elder") || localStorage.getItem("kavach_elder_id") || $("elder").value || "";
}

async function loadElders() {
  try {
    const r = await fetch("/api/elders");
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

async function start(replayName) {
  $("err").textContent = "";
  unlockAudio();
  const proto = location.protocol === "https:" ? "wss" : "ws";
  const eid = elderId();
  const replay = replayName || replayQ;
  const params = new URLSearchParams({ lang, rate: "16000" });
  if (eid) params.set("elder_id", eid);
  if (replay) params.set("replay", replay);
  ws = new WebSocket(`${proto}://${location.host}/ws/session?${params}`);
  ws.binaryType = "arraybuffer";
  ws.onmessage = (m) => typeof m.data === "string" && onEvent(JSON.parse(m.data));
  ws.onclose = () => { if (listening) { setListening(false); log("socket closed"); } };
  ws.onerror = () => { $("err").textContent = "कनेक्शन नहीं जुड़ा · connection error"; };
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  if (!mock && !replay) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } });
    } catch (e) {
      $("err").textContent = "माइक्रोफ़ोन अनुमति नहीं मिली · mic permission denied";
      setListening(false, "mic denied");
      stop(false);
      return;
    }
    ctx = new AudioContext();
    await ctx.audioWorklet.addModule("worklet.js");
    node = new AudioWorkletNode(ctx, "pcm16k");
    node.port.onmessage = (e) => ws.readyState === 1 && ws.send(e.data);
    ctx.createMediaStreamSource(stream).connect(node);
  }
  listening = true;
  $("toggle").textContent = "बंद करो · STOP";
  $("toggle").classList.add("stop");
  setLevel(0, "Kavach सुन रहा है");
  setListening(true);
}

function stop(sendStop = true) {
  if (sendStop && ws && ws.readyState === 1) ws.send(JSON.stringify({ type: "stop" }));
  try { ws && ws.close(); } catch {}
  stream && stream.getTracks().forEach((t) => t.stop());
  ctx && ctx.close();
  listening = false;
  $("toggle").textContent = "सुनना शुरू करो · START";
  $("toggle").classList.remove("stop");
  setLevel(0, "Kavach बंद है");
  setListening(false);
}

$("toggle").onclick = () => (listening ? stop() : start().catch((e) => {
  $("err").textContent = "शुरू नहीं हो सका · " + e;
  log("start failed: " + e);
  stop(false);
}));
$("replayBtn").onclick = () => {
  const url = new URL(location.href);
  url.searchParams.set("judge", "1");
  url.searchParams.set("mock", "1");
  url.searchParams.set("replay", "demo_scam_hinglish.wav");
  if (listening) stop();
  history.replaceState({}, "", url);
  start("demo_scam_hinglish.wav").catch((e) => log("replay failed: " + e));
};

loadElders();
renderStats();
