// renderer.js
// UI for Start / Stop / Process. Uses window.electronAPI exposed by preload.js
// Expected methods in preload: startCapture(deviceId), stopCapture(), processText(text)
// and event subscriptions: onTranscript(cb), onStatus(cb), onCollectedAll(cb)

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const processBtn = document.getElementById("processBtn");
const statusEl = document.getElementById("status");
const transcriptContainer = document.getElementById("transcriptContainer");

let isCapturing = false;
let isStopped = true;
let partialText = "";
let finalSegments = [];

// helper - render rows
function renderRows() {
  transcriptContainer.innerHTML = "";
  const maxRows = 200; // safety cap
  const rows = [...finalSegments];
  if (partialText) rows.push(partialText + " 🔄");

  const start = Math.max(0, rows.length - maxRows);
  for (let i = start; i < rows.length; i++) {
    const div = document.createElement("div");
    div.className = "row " + (i < finalSegments.length ? "final" : "partial");
    div.textContent = rows[i];
    transcriptContainer.appendChild(div);
  }

  // show scrollbar as soon as text overflows (browser handles); keep scrolled to bottom
  transcriptContainer.scrollTop = transcriptContainer.scrollHeight;
  updateButtons();
}

// helper - enable/disable buttons
function updateButtons() {
  startBtn.disabled = isCapturing;
  stopBtn.disabled = !isCapturing;
  processBtn.disabled = !(
    isStopped && finalSegments.join(" ").trim().length > 0
  );
}

// safe bridge check
function hasBridge() {
  return (
    typeof window.electronAPI === "object" &&
    typeof window.electronAPI.startCapture === "function"
  );
}

// Start
startBtn.addEventListener("click", async () => {
  if (!hasBridge()) {
    statusEl.textContent = "IPC bridge missing (preload).";
    return;
  }
  statusEl.textContent = "Starting...";
  startBtn.disabled = true;
  try {
    // startCapture expects { deviceId } in earlier main; we pass null to auto-select
    const res = await window.electronAPI.startCapture(null);
    // main returns { ok: true } (but we don't strictly rely on it)
    isCapturing = true;
    isStopped = false;
    partialText = "";
    // keep collected finals (don't clear) — user may start/stop multiple times
    statusEl.textContent = "Capturing";
  } catch (err) {
    console.error("startCapture error", err);
    statusEl.textContent =
      "Start failed: " + (err && err.message ? err.message : String(err));
  } finally {
    updateButtons();
  }
});

// Stop
stopBtn.addEventListener("click", async () => {
  if (!hasBridge()) {
    statusEl.textContent = "IPC bridge missing (preload).";
    return;
  }
  statusEl.textContent = "Stopping...";
  try {
    await window.electronAPI.stopCapture();
    isCapturing = false;
    isStopped = true;
    partialText = "";
    statusEl.textContent = "Stopped";
  } catch (err) {
    console.error("stopCapture error", err);
    statusEl.textContent =
      "Stop failed: " + (err && err.message ? err.message : String(err));
  } finally {
    updateButtons();
  }
});

// Process
processBtn.addEventListener("click", async () => {
  if (!hasBridge()) {
    statusEl.textContent = "IPC bridge missing (preload).";
    return;
  }
  const text = finalSegments.join(" ").trim();
  if (!text) return;
  processBtn.disabled = true;
  statusEl.textContent = "Processing...";
  try {
    const res = await window.electronAPI.processText(text);
    if (res && res.ok) {
      statusEl.textContent = "Processed successfully";
    } else {
      statusEl.textContent =
        "Process failed: " + (res && res.error ? res.error : "unknown");
    }
  } catch (err) {
    console.error("processText error", err);
    statusEl.textContent =
      "Process error: " + (err && err.message ? err.message : String(err));
  } finally {
    updateButtons();
  }
});

// IPC event handlers (from main)
// transcript events contain { type: 'partial'|'final', text }
if (hasBridge()) {
  window.electronAPI.onTranscript((data) => {
    if (!data) return;
    if (data.type === "partial") {
      partialText = data.text || "";
    } else if (data.type === "final") {
      if (data.text && data.text.trim()) finalSegments.push(data.text.trim());
      partialText = "";
    }
    renderRows();
  });

  window.electronAPI.onStatus((s) => {
    if (s) statusEl.textContent = s;
  });

  // when main sends 'collected-all' after stop, it may include aggregated text
  if (typeof window.electronAPI.onCollectedAll === "function") {
    window.electronAPI.onCollectedAll((payload) => {
      if (payload && payload.text) {
        // replace renderer's finalSegments with aggregated text split into sentences (best-effort)
        const sent = payload.text.trim();
        if (sent) {
          finalSegments = sent.split(/(?<=\\.|!|\\?|\\n)\\s+/).filter(Boolean);
          renderRows();
        }
      }
      statusEl.textContent = "Ready to process";
      isCapturing = false;
      isStopped = true;
      updateButtons();
    });
  }
} else {
  // no bridge: grey out UI and show message
  statusEl.textContent = "No IPC bridge (preload). UI disabled.";
  startBtn.disabled = true;
  stopBtn.disabled = true;
  processBtn.disabled = true;
}

renderRows();
updateButtons();
