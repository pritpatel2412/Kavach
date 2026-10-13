// Elder screen + judge panel. Query params: ?judge=1  ?lang=hi-IN  ?mock=1 (no mic; server must run KAVACH_MOCK_STT=1)
const q = new URLSearchParams(location.search);
const lang = q.get("lang") || "hi-IN";
const mock = q.get("mock") === "1";
if (q.get("judge") === "1") document.body.classList.add("judge");
if (mock || q.get("synthetic") === "1") document.getElementById("synthetic").style.display = "inline-block";

const $ = (id) => document.getElementById(id);
const STAGES = ["S1_authority", "S2_accusation", "S3_isolation", "S4_urgency", "S5_payment"];
$("chips").innerHTML = STAGES.map((s) => `<span class="chip" id="c_${s}">${s.replace("_", " ")}</span>`).join("");

let ws, ctx, node, stream, listening = false;
const latencies = [];

function log(line) { const d = document.createElement("div"); d.textContent = line; $("log").prepend(d); }

function setLevel(level, text) {
  const ring = $("ring");
  ring.className = level ? "l" + level : "";
  ring.textContent = ["सुरक्षित", "सावधान", "ख़तरा", "ख़तरा"][level] || "सुरक्षित";
  if (text) $("msg").textContent = text;
  $("help").style.display = level >= 3 ? "inline-block" : "none";
}

function play(url) {
  const a = new Audio(url);
  a.onplay = () => ws.readyState === 1 && ws.send(JSON.stringify({ type: "playback_start" }));
  const end = () => ws.readyState === 1 && ws.send(JSON.stringify({ type: "playback_end" }));
  a.onended = end; a.onerror = end;
  a.play().catch(end);
}

function onEvent(ev) {
  switch (ev.type) {
    case "state": log(`state: ${ev.state}${ev.mock ? " (mock)" : ""}`); break;
    case "transcript":
      if (ev.latency_ms != null) latencies.push(ev.latency_ms);
      log(`#${ev.segment_index} ${ev.text}`);
      if (latencies.length) {
        const s = [...latencies].sort((a, b) => a - b);
        $("stats").textContent = `STT latency p50 ${s[Math.floor(s.length / 2)]} ms · segments ${s.length}`;
      }
      break;
    case "risk":
      $("meterFill").style.width = ev.score + "%";
      STAGES.forEach((s) => $("c_" + s).classList.toggle("on", ev.stages.includes(s)));
      setLevel(ev.level);
      log(`risk ${ev.score} level ${ev.level} hits: ${ev.hits.join(", ")}`);
      break;
    case "intervene":
      setLevel(ev.level, ev.screen_text);
      log(`INTERVENE L${ev.level} @${ev.t_ms}ms ${ev.clip_url || "(no clip rendered yet: text only)"}`);
      if (ev.clip_url) play(ev.clip_url);
      break;
    case "alert_sent": log(`guardian alert L${ev.level} delivered=${ev.delivered}`); break;
    case "stt_error": log("STT ERROR: " + ev.message); break;
  }
}

async function start() {
  const proto = location.protocol === "https:" ? "wss" : "ws";
  ws = new WebSocket(`${proto}://${location.host}/ws/session?lang=${lang}&rate=16000`);
  ws.binaryType = "arraybuffer";
  ws.onmessage = (m) => typeof m.data === "string" && onEvent(JSON.parse(m.data));
  ws.onclose = () => stop(false);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  if (!mock) {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } });
    ctx = new AudioContext();
    await ctx.audioWorklet.addModule("worklet.js");
    node = new AudioWorkletNode(ctx, "pcm16k");
    node.port.onmessage = (e) => ws.readyState === 1 && ws.send(e.data);   // exactly 1024 bytes each
    ctx.createMediaStreamSource(stream).connect(node);                      // not connected to speakers
  }
  listening = true;
  $("toggle").textContent = "बंद करो"; $("toggle").classList.add("stop");
  setLevel(0, "Kavach सुन रहा है");
}

function stop(sendStop = true) {
  if (sendStop && ws && ws.readyState === 1) ws.send(JSON.stringify({ type: "stop" }));
  try { ws && ws.close(); } catch {}
  stream && stream.getTracks().forEach((t) => t.stop());
  ctx && ctx.close();
  listening = false;
  $("toggle").textContent = "सुनना शुरू करो"; $("toggle").classList.remove("stop");
  setLevel(0, "Kavach बंद है");
}

$("toggle").onclick = () => (listening ? stop() : start().catch((e) => { log("start failed: " + e); stop(false); }));
