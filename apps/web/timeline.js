const q = new URLSearchParams(location.search);
let sessionId = q.get("session") || localStorage.getItem("kavach_last_session_id") || "";
let guardianToken = q.get("token") || localStorage.getItem("kavach_guardian_token") || "";
const $ = (id) => document.getElementById(id);

function authHeaders(extra = {}) {
  const h = { ...extra };
  if (guardianToken) h["Authorization"] = "Bearer " + guardianToken;
  return h;
}

async function loadSessionList() {
  try {
    const r = await fetch("/api/sessions", { headers: authHeaders() });
    if (!r.ok) {
      if (r.status === 401) {
        $("sid").textContent = "प्रमाणीकरण आवश्यक · Guardian token required to view sessions";
      }
      return;
    }
    const data = await r.json();
    const sessions = data.sessions || [];
    if (!sessions.length) {
      $("sid").textContent = "कोई कॉल सत्र नहीं मिला · No sessions recorded yet";
      return;
    }
    const picker = $("sessionPicker");
    const select = $("sessionSelect");
    picker.style.display = "block";
    select.innerHTML = '<option value="">— एक सत्र चुनें / Select a session —</option>' +
      sessions.map((s) => {
        const time = s.started_at ? new Date(s.started_at).toLocaleTimeString() : s.id.slice(0, 8);
        return `<option value="${s.id}">${time} · Max L${s.max_level} (Score ${s.max_score}) ${s.feedback ? "[" + s.feedback + "]" : ""}</option>`;
      }).join("");

    select.onchange = () => {
      if (select.value) {
        sessionId = select.value;
        const url = new URL(location.href);
        url.searchParams.set("session", sessionId);
        history.pushState({}, "", url);
        load(sessionId);
      }
    };

    // If no session was in URL, load the most recent session
    if (!sessionId && sessions.length > 0) {
      sessionId = sessions[0].id;
      select.value = sessionId;
      load(sessionId);
    }
  } catch (e) {
    console.error("Failed to load sessions:", e);
  }
}

async function load(id) {
  if (!id) {
    await loadSessionList();
    return;
  }
  $("sid").textContent = id;
  try {
    const r = await fetch("/api/sessions/" + id, { headers: authHeaders() });
    if (!r.ok) {
      $("sid").textContent = "सत्र नहीं मिला · Session not found (" + id + ")";
      return;
    }
    const s = await r.json();
    
    // Max level badge
    const badge = $("maxLevelBadge");
    const levelNames = ["L0 SAFE", "L1 CAUTION", "L2 DANGER", "L3 CRITICAL"];
    badge.className = "level-badge l" + s.max_level;
    badge.textContent = levelNames[s.max_level] || ("L" + s.max_level);

    // Meta details
    const startTime = s.started_at ? new Date(s.started_at).toLocaleString() : "—";
    const endTime = s.ended_at ? new Date(s.ended_at).toLocaleTimeString() : "Ongoing / Live";
    $("metaDetails").innerHTML =
      `<strong>प्रारंभ / Started:</strong> ${startTime} &nbsp;·&nbsp; ` +
      `<strong>समाप्त / Ended:</strong> ${endTime} &nbsp;·&nbsp; ` +
      `<strong>अधिकतम स्कोर / Max Risk:</strong> ${s.max_score} / 100 &nbsp;·&nbsp; ` +
      `<strong>फीडबैक / Verdict:</strong> ${s.feedback || "Not rated yet"}`;

    // Alerts
    const alertsEl = $("alerts");
    if (!s.alerts || !s.alerts.length) {
      alertsEl.innerHTML = '<div style="color:var(--mut);font-size:14px;padding:8px 0;">कोई अभिभावक अलर्ट रिकॉर्ड नहीं हुआ · No Telegram alerts triggered.</div>';
    } else {
      alertsEl.innerHTML = s.alerts.map((a) => {
        const atime = a.ts ? new Date(a.ts).toLocaleTimeString() : "—";
        const statusClass = a.delivered ? "var(--ok)" : "var(--warn)";
        return `
          <div class="alert-banner">
            <div>
              <div class="alert-status">⚠️ Telegram Alert Level ${a.level}</div>
              <div style="font-size:13px;color:${statusClass};margin-top:2px;">
                ${a.delivered ? "✅ सफलतापूर्वक डिलीवर हुआ · Delivered to guardian" : "⚠️ डिलीवरी लंबित या विफल · Not delivered"}
              </div>
            </div>
            <div class="alert-time">${atime}</div>
          </div>
        `;
      }).join("");
    }

    // Events
    const eventsEl = $("events");
    if (!s.events || !s.events.length) {
      eventsEl.innerHTML = '<div style="color:var(--mut);font-size:14px;padding:8px 0;">कोई बातचीत रिकॉर्ड नहीं हुई · No transcript segments recorded.</div>';
    } else {
      eventsEl.innerHTML = s.events.map((e) => {
        const etime = e.ts ? new Date(e.ts).toLocaleTimeString() : "";
        const stages = (e.stages || []).map((st) => `<span class="stage-tag">${st.replace("_", " ")}</span>`).join("");
        return `
          <div class="timeline-item l${e.level}">
            <div class="event-card">
              <div class="event-header">
                <div>
                  <span class="event-badge l${e.level}">Level ${e.level} (Score ${e.score})</span>
                  <span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--mut);margin-left:8px;">#${e.segment_index}</span>
                </div>
                <div style="font-size:12px;color:var(--mut);font-family:'JetBrains Mono',monospace;">${etime}</div>
              </div>
              ${stages ? `<div class="stages-tags">${stages}</div>` : ""}
              <div class="event-excerpt">"${e.excerpt}"</div>
            </div>
          </div>
        `;
      }).join("");
    }
  } catch (e) {
    $("sid").textContent = "डेटा लोड करने में त्रुटि · Error loading timeline: " + e.message;
  }
}

async function vote(verdict) {
  if (!sessionId) return;
  try {
    const r = await fetch("/api/sessions/" + sessionId + "/feedback", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ verdict }),
    });
    const data = await r.json();
    $("msg").textContent = data.ok
      ? (verdict === "real" ? "✅ सहेजा गया: वास्तविक स्कैम कॉल (Real Scam)" : "✅ सहेजा गया: गलत चेतावनी (False Alarm)")
      : "फीडबैक सेव नहीं हो सका · Failed to save feedback";
    load(sessionId);
  } catch (e) {
    $("msg").textContent = "त्रुटि · Error: " + e.message;
  }
}

$("real").onclick = () => vote("real");
$("fa").onclick = () => vote("false_alarm");

if (sessionId) {
  load(sessionId);
} else {
  loadSessionList();
}
