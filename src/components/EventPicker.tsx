"use client";

import { useState } from "react";

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

interface EventPickerProps {
  events: CalendarEvent[];
  actionLabel: string;
  onSelect: (event: CalendarEvent) => void;
  onCancel: () => void;
}

function formatDateTime(dt: { dateTime?: string; date?: string }) {
  const iso = dt.dateTime || dt.date;
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export type { CalendarEvent };

export default function EventPicker({
  events,
  actionLabel,
  onSelect,
  onCancel,
}: EventPickerProps) {
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  if (events.length === 0) {
    return (
      <div
        className="w-full rounded-lg p-6"
        style={{
          background: "var(--bg-raised)",
          border: "1px solid var(--border)",
        }}
      >
        <p style={{ color: "var(--text-secondary)" }}>No matching events found.</p>
        <button
          onClick={onCancel}
          className="mt-4 rounded px-4 py-2 text-sm transition-colors"
          style={{
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
        >
          Back
        </button>
      </div>
    );
  }

  if (selected) {
    return (
      <div
        className="w-full rounded-lg p-6"
        style={{
          background: "var(--bg-raised)",
          border: "1px solid var(--border)",
        }}
      >
        <span
          className="text-xs font-medium uppercase tracking-widest"
          style={{ color: actionLabel.toLowerCase().includes("delete") ? "var(--red)" : "var(--blue)" }}
        >
          Confirm {actionLabel}
        </span>
        <h3
          className="text-xl font-medium mt-3"
          style={{ color: "var(--text-primary)" }}
        >
          {selected.summary || "(No title)"}
        </h3>
        <p className="mt-1.5" style={{ color: "var(--text-secondary)" }}>
          {formatDateTime(selected.start)} &ndash; {formatDateTime(selected.end)}
        </p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => onSelect(selected)}
            className="rounded px-4 py-2 text-sm font-medium transition-all"
            style={{
              background: "var(--accent)",
              color: "var(--bg)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "var(--accent)")}
          >
            Confirm &amp; {actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)}
          </button>
          <button
            onClick={() => setSelected(null)}
            className="rounded px-4 py-2 text-sm transition-colors"
            style={{
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full rounded-lg p-6"
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
      }}
    >
      <h3
        className="mb-4 text-xs font-medium uppercase tracking-widest"
        style={{ color: "var(--text-tertiary)" }}
      >
        Select an event to {actionLabel}
      </h3>
      <div className="space-y-2">
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => setSelected(event)}
            className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors"
            style={{ border: "1px solid var(--border)" }}
            onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                {event.summary || "(No title)"}
              </p>
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                {formatDateTime(event.start)} &ndash; {formatDateTime(event.end)}
              </p>
            </div>
            <span
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: "var(--text-tertiary)" }}
            >
              {actionLabel}
            </span>
          </button>
        ))}
      </div>
      <button
        onClick={onCancel}
        className="mt-4 rounded px-4 py-2 text-sm transition-colors"
        style={{
          color: "var(--text-secondary)",
          border: "1px solid var(--border)",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
        onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
      >
        Nevermind
      </button>
    </div>
  );
}
