"use client";

import { useState } from "react";
import { CalendarAction, CreateAction } from "@/types/calendar";

interface ConfirmationCardProps {
  action: CalendarAction;
  onConfirm: (edited: CalendarAction) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function toLocalDatetime(iso: string) {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function fromLocalDatetime(local: string) {
  return new Date(local).toISOString();
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ConfirmationCard({
  action,
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmationCardProps) {
  const [editing, setEditing] = useState(false);
  const [edited, setEdited] = useState<CreateAction>(
    action.action === "create" ? { ...action } : { action: "create", title: "", startTime: "", endTime: "" }
  );

  function handleFieldChange(field: keyof CreateAction, value: string) {
    setEdited((prev) => ({ ...prev, [field]: value }));
  }

  const inputStyle = {
    background: "var(--bg-raised)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
  };

  return (
    <div
      className="w-full rounded-lg p-6"
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
      }}
    >
      {action.action === "create" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <span
              className="text-xs font-medium uppercase tracking-widest"
              style={{ color: "var(--green)" }}
            >
              {editing ? "Edit Event" : "Create Event"}
            </span>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs transition-colors"
                style={{ color: "var(--text-tertiary)" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
              >
                Edit details
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs" style={{ color: "var(--text-tertiary)" }}>
                  Title
                </label>
                <input
                  type="text"
                  value={edited.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  className="w-full rounded px-3 py-2 text-sm focus:outline-none"
                  style={inputStyle}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs" style={{ color: "var(--text-tertiary)" }}>
                    Start
                  </label>
                  <input
                    type="datetime-local"
                    value={toLocalDatetime(edited.startTime)}
                    onChange={(e) => handleFieldChange("startTime", fromLocalDatetime(e.target.value))}
                    className="w-full rounded px-3 py-2 text-sm focus:outline-none"
                    style={inputStyle}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs" style={{ color: "var(--text-tertiary)" }}>
                    End
                  </label>
                  <input
                    type="datetime-local"
                    value={toLocalDatetime(edited.endTime)}
                    onChange={(e) => handleFieldChange("endTime", fromLocalDatetime(e.target.value))}
                    className="w-full rounded px-3 py-2 text-sm focus:outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs" style={{ color: "var(--text-tertiary)" }}>
                  Location
                </label>
                <input
                  type="text"
                  value={edited.location || ""}
                  onChange={(e) => handleFieldChange("location", e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded px-3 py-2 text-sm focus:outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs" style={{ color: "var(--text-tertiary)" }}>
                  Description
                </label>
                <input
                  type="text"
                  value={edited.description || ""}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded px-3 py-2 text-sm focus:outline-none"
                  style={inputStyle}
                />
              </div>
            </div>
          ) : (
            <div>
              <h3
                className="text-xl font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {(action as CreateAction).title}
              </h3>
              <p className="mt-1.5" style={{ color: "var(--text-secondary)" }}>
                {formatDateTime((action as CreateAction).startTime)} &ndash;{" "}
                {formatDateTime((action as CreateAction).endTime)}
              </p>
              {(action as CreateAction).location && (
                <p className="mt-1 text-sm" style={{ color: "var(--text-tertiary)" }}>
                  {(action as CreateAction).location}
                </p>
              )}
              {(action as CreateAction).description && (
                <p className="mt-1 text-sm" style={{ color: "var(--text-tertiary)" }}>
                  {(action as CreateAction).description}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <button
          onClick={() => onConfirm(editing ? edited : action)}
          disabled={isLoading}
          className="rounded px-4 py-2 text-sm font-medium transition-all disabled:opacity-30"
          style={{
            background: "var(--accent)",
            color: "var(--bg)",
          }}
          onMouseOver={(e) => {
            if (!e.currentTarget.disabled) e.currentTarget.style.background = "var(--accent-hover)";
          }}
          onMouseOut={(e) => (e.currentTarget.style.background = "var(--accent)")}
        >
          {isLoading ? "Adding..." : "Confirm & Add Event"}
        </button>
        <button
          onClick={() => {
            if (editing) {
              setEdited(action.action === "create" ? { ...action } : edited);
              setEditing(false);
            } else {
              onCancel();
            }
          }}
          disabled={isLoading}
          className="rounded px-4 py-2 text-sm transition-colors"
          style={{
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {editing ? "Cancel" : "Nevermind"}
        </button>
      </div>
    </div>
  );
}
