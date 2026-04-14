const API_BASE = "https://nl2cal.vercel.app";

const input = document.getElementById("input");
const submitBtn = document.getElementById("submit");
const statusEl = document.getElementById("status");

// Auto-resize textarea
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.max(input.scrollHeight, 42) + "px";
});

submitBtn.addEventListener("click", handleSubmit);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSubmit();
  }
});

async function handleSubmit() {
  const text = input.value.trim();
  if (!text) return;

  submitBtn.disabled = true;
  statusEl.className = "";
  statusEl.textContent = "Parsing...";

  try {
    const parseRes = await fetch(`${API_BASE}/api/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        text,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        localTime: new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "long" }),
        isoTime: (() => {
          const now = new Date();
          const offset = -now.getTimezoneOffset();
          const sign = offset >= 0 ? "+" : "-";
          const pad = (n) => String(Math.abs(n)).padStart(2, "0");
          const offsetStr = `${sign}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)}`;
          const yyyy = now.getFullYear();
          const mm = String(now.getMonth() + 1).padStart(2, "0");
          const dd = String(now.getDate()).padStart(2, "0");
          const hh = String(now.getHours()).padStart(2, "0");
          const min = String(now.getMinutes()).padStart(2, "0");
          const ss = String(now.getSeconds()).padStart(2, "0");
          return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}${offsetStr}`;
        })(),
      }),
    });

    if (parseRes.status === 401) {
      throw new Error("Not signed in — open the full app to sign in with Google first.");
    }

    if (!parseRes.ok) {
      const err = await parseRes.json();
      throw new Error(err.error || "Couldn't understand that — try rephrasing.");
    }

    const parsed = await parseRes.json();

    if (parsed.action === "create") {
      statusEl.textContent = `Creating "${parsed.title}"...`;

      const res = await fetch(`${API_BASE}/api/calendar/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: parsed.title,
          startTime: parsed.startTime,
          endTime: parsed.endTime,
          description: parsed.description,
          location: parsed.location,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create event.");
      }

      statusEl.className = "success";
      statusEl.textContent = `Created "${parsed.title}"`;
      input.value = "";
      input.style.height = "42px";
    } else {
      // For delete/rsvp, redirect to full app since they need event selection
      statusEl.className = "";
      statusEl.textContent = "Opening full app for event selection...";
      chrome.tabs.create({ url: API_BASE });
    }
  } catch (err) {
    statusEl.className = "error";
    statusEl.textContent = err.message;
  } finally {
    submitBtn.disabled = false;
  }
}
