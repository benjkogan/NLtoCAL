"use client";

import { useState } from "react";
import { CreateAction, EditAction } from "@/types/calendar";
import { CalendarEvent } from "@/components/EventPicker";

interface CreateConfirmProps {
  actions: CreateAction[];
  onConfirmCreate: (actions: CreateAction[]) => void;
  onCancel: () => void;
  isLoading: boolean;
  conflicts?: CalendarEvent[];
}

interface EditConfirmProps {
  action: EditAction;
  editEvent: CalendarEvent;
  onConfirmEdit: (changes: EditAction["changes"]) => void;
  onCancel: () => void;
  isLoading: boolean;
}

type ConfirmationCardProps = CreateConfirmProps | EditConfirmProps;

function isEditProps(props: ConfirmationCardProps): props is EditConfirmProps {
  return "editEvent" in props;
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

function formatRecurrence(rrule: string): string {
  const rule = rrule.replace("RRULE:", "");
  const parts = Object.fromEntries(rule.split(";").map((p) => p.split("=")));
  const dayMap: Record<string, string> = {
    MO: "Mon", TU: "Tue", WE: "Wed", TH: "Thu", FR: "Fri", SA: "Sat", SU: "Sun",
  };
  const freq = parts.FREQ?.toLowerCase();
  if (!freq) return rrule;
  let label = freq === "daily" ? "Daily" : freq === "weekly" ? "Weekly" : freq === "monthly" ? "Monthly" : freq === "yearly" ? "Yearly" : freq;
  if (parts.BYDAY) {
    const days = parts.BYDAY.split(",").map((d: string) => dayMap[d] || d).join(", ");
    label += ` on ${days}`;
  }
  if (parts.COUNT) label += ` (${parts.COUNT} times)`;
  if (parts.UNTIL) {
    const until = parts.UNTIL;
    const date = `${until.slice(0, 4)}-${until.slice(4, 6)}-${until.slice(6, 8)}`;
    label += ` until ${new Date(date).toLocaleDateString()}`;
  }
  return label;
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

const inputStyle = {
  background: "var(--bg-raised)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
};

function CreateEventCard({
  action,
  index,
  total,
  edited,
  editing,
  onEdit,
  onFieldChange,
  onCancelEdit,
}: {
  action: CreateAction;
  index: number;
  total: number;
  edited: CreateAction;
  editing: boolean;
  onEdit: () => void;
  onFieldChange: (field: string, value: unknown) => void;
  onCancelEdit: () => void;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span
          className="text-xs font-medium uppercase tracking-widest"
          style={{ color: "var(--green)" }}
        >
          {editing ? "Edit Event" : total > 1 ? `Event ${index + 1} of ${total}` : "Create Event"}
        </span>
        {!editing && (
          <button
            onClick={onEdit}
            className="text-xs transition-colors py-2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] active:text-[var(--text-secondary)]"
          >
            Edit details
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs" style={{ color: "var(--text-tertiary)" }}>Title</label>
            <input
              type="text"
              value={edited.title}
              onChange={(e) => onFieldChange("title", e.target.value)}
              className="w-full rounded px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs" style={{ color: "var(--text-tertiary)" }}>Start</label>
              <input
                type="datetime-local"
                value={toLocalDatetime(edited.startTime)}
                onChange={(e) => onFieldChange("startTime", fromLocalDatetime(e.target.value))}
                className="w-full rounded px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs" style={{ color: "var(--text-tertiary)" }}>End</label>
              <input
                type="datetime-local"
                value={toLocalDatetime(edited.endTime)}
                onChange={(e) => onFieldChange("endTime", fromLocalDatetime(e.target.value))}
                className="w-full rounded px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs" style={{ color: "var(--text-tertiary)" }}>Location</label>
            <input
              type="text"
              value={edited.location || ""}
              onChange={(e) => onFieldChange("location", e.target.value)}
              placeholder="Optional"
              className="w-full rounded px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs" style={{ color: "var(--text-tertiary)" }}>Description</label>
            <input
              type="text"
              value={edited.description || ""}
              onChange={(e) => onFieldChange("description", e.target.value)}
              placeholder="Optional"
              className="w-full rounded px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs" style={{ color: "var(--text-tertiary)" }}>Attendees</label>
            <input
              type="text"
              value={(edited.attendees || []).join(", ")}
              onChange={(e) => {
                const emails = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                onFieldChange("attendees", emails.length ? emails : undefined);
              }}
              placeholder="email@example.com, another@example.com"
              className="w-full rounded px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs" style={{ color: "var(--text-tertiary)" }}>Recurrence</label>
            <select
              value={edited.recurrence || ""}
              onChange={(e) => onFieldChange("recurrence", e.target.value)}
              className="w-full rounded px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
            >
              <option value="">None (one-time)</option>
              <option value="RRULE:FREQ=DAILY">Daily</option>
              <option value="RRULE:FREQ=WEEKLY">Weekly</option>
              <option value="RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR">Every weekday</option>
              <option value="RRULE:FREQ=MONTHLY">Monthly</option>
              <option value="RRULE:FREQ=YEARLY">Yearly</option>
            </select>
          </div>
          <button
            onClick={onCancelEdit}
            className="text-xs transition-colors py-2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] active:text-[var(--text-secondary)]"
          >
            Done editing
          </button>
        </div>
      ) : (
        <div>
          <h3 className="text-xl font-medium" style={{ color: "var(--text-primary)" }}>
            {action.title}
          </h3>
          <p className="mt-1.5" style={{ color: "var(--text-secondary)" }}>
            {formatDateTime(action.startTime)} &ndash; {formatDateTime(action.endTime)}
          </p>
          {action.location && (
            <p className="mt-1 text-sm" style={{ color: "var(--text-tertiary)" }}>{action.location}</p>
          )}
          {action.description && (
            <p className="mt-1 text-sm" style={{ color: "var(--text-tertiary)" }}>{action.description}</p>
          )}
          {action.attendees && action.attendees.length > 0 && (
            <p className="mt-1 text-sm" style={{ color: "var(--text-tertiary)" }}>
              Attendees: {action.attendees.join(", ")}
            </p>
          )}
          {action.recurrence && (
            <p className="mt-1 text-sm" style={{ color: "var(--blue)" }}>
              Repeats: {formatRecurrence(action.recurrence)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ConfirmationCard(props: ConfirmationCardProps) {
  if (isEditProps(props)) {
    return <EditConfirmCard {...props} />;
  }
  return <CreateConfirmCard {...props} />;
}

function CreateConfirmCard({
  actions,
  onConfirmCreate,
  onCancel,
  isLoading,
  conflicts,
}: CreateConfirmProps) {
  const [editedActions, setEditedActions] = useState<CreateAction[]>(
    actions.map((a) => ({ ...a }))
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  function handleFieldChange(index: number, field: string, value: unknown) {
    setEditedActions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  const count = actions.length;

  return (
    <div
      className="w-full rounded-lg p-6"
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
      }}
    >
      {conflicts && conflicts.length > 0 && (
        <div
          className="mb-4 rounded-lg px-4 py-3 text-sm"
          style={{
            background: "rgba(251, 191, 36, 0.15)",
            border: "1px solid rgba(251, 191, 36, 0.35)",
            color: "rgba(251, 191, 36, 1.0)",
          }}
        >
          <span className="font-semibold">Heads up:</span> You have{" "}
          {conflicts.map((c, i) => (
            <span key={c.id}>
              {i > 0 && ", "}
              <strong>{c.summary || "(No title)"}</strong> at{" "}
              {formatDateTime(c.start.dateTime || c.start.date || "")}
            </span>
          ))}{" "}
          which overlaps with this event.
        </div>
      )}

      <div className={count > 1 ? "space-y-6 divide-y divide-[rgba(255,255,255,0.1)]" : ""}>
        {editedActions.map((edited, i) => (
          <div key={i} className={i > 0 ? "pt-6" : ""}>
            <CreateEventCard
              action={editingIndex === i ? edited : actions[i]}
              index={i}
              total={count}
              edited={edited}
              editing={editingIndex === i}
              onEdit={() => setEditingIndex(i)}
              onFieldChange={(field, value) => handleFieldChange(i, field, value)}
              onCancelEdit={() => setEditingIndex(null)}
            />
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onConfirmCreate(editedActions)}
          disabled={isLoading}
          className="rounded px-4 py-2 text-sm font-medium transition-all disabled:opacity-30 w-full sm:w-auto bg-[var(--accent)] text-[var(--bg)] enabled:hover:bg-[var(--accent-hover)] enabled:active:bg-[var(--accent-hover)]"
        >
          {isLoading
            ? "Adding..."
            : count > 1
            ? `Confirm & Add ${count} Events`
            : "Confirm & Add Event"}
        </button>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="rounded px-4 py-2 text-sm transition-colors text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-hover)] active:bg-[var(--bg-hover)]"
        >
          Nevermind
        </button>
      </div>
    </div>
  );
}

function EditConfirmCard({
  action,
  editEvent,
  onConfirmEdit,
  onCancel,
  isLoading,
}: EditConfirmProps) {
  const [editedChanges, setEditedChanges] = useState<EditAction["changes"]>(
    { ...action.changes }
  );

  function handleEditChangeField(field: keyof EditAction["changes"], value: string) {
    setEditedChanges((prev) => ({ ...prev, [field]: value || undefined }));
  }

  return (
    <div
      className="w-full rounded-lg p-6"
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="mb-4">
        <span
          className="text-xs font-medium uppercase tracking-widest"
          style={{ color: "var(--blue)" }}
        >
          Update Event
        </span>
      </div>
      <h3
        className="text-xl font-medium mb-3"
        style={{ color: "var(--text-primary)" }}
      >
        {editEvent.summary || "(No title)"}
      </h3>
      <div className="space-y-3">
        {editedChanges.title !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <span style={{ color: "var(--text-tertiary)" }}>Title:</span>
            <input
              type="text"
              value={editedChanges.title || ""}
              onChange={(e) => handleEditChangeField("title", e.target.value)}
              className="flex-1 rounded px-2 py-1 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>
        )}
        {editedChanges.startTime !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <span style={{ color: "var(--text-tertiary)" }}>Start:</span>
            <input
              type="datetime-local"
              value={toLocalDatetime(editedChanges.startTime || "")}
              onChange={(e) => handleEditChangeField("startTime", fromLocalDatetime(e.target.value))}
              className="flex-1 rounded px-2 py-1 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>
        )}
        {editedChanges.endTime !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <span style={{ color: "var(--text-tertiary)" }}>End:</span>
            <input
              type="datetime-local"
              value={toLocalDatetime(editedChanges.endTime || "")}
              onChange={(e) => handleEditChangeField("endTime", fromLocalDatetime(e.target.value))}
              className="flex-1 rounded px-2 py-1 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>
        )}
        {editedChanges.location !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <span style={{ color: "var(--text-tertiary)" }}>Location:</span>
            <input
              type="text"
              value={editedChanges.location || ""}
              onChange={(e) => handleEditChangeField("location", e.target.value)}
              className="flex-1 rounded px-2 py-1 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>
        )}
        {editedChanges.description !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <span style={{ color: "var(--text-tertiary)" }}>Description:</span>
            <input
              type="text"
              value={editedChanges.description || ""}
              onChange={(e) => handleEditChangeField("description", e.target.value)}
              className="flex-1 rounded px-2 py-1 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onConfirmEdit(editedChanges)}
          disabled={isLoading}
          className="rounded px-4 py-2 text-sm font-medium transition-all disabled:opacity-30 w-full sm:w-auto bg-[var(--accent)] text-[var(--bg)] enabled:hover:bg-[var(--accent-hover)] enabled:active:bg-[var(--accent-hover)]"
        >
          {isLoading ? "Updating..." : "Confirm & Update Event"}
        </button>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="rounded px-4 py-2 text-sm transition-colors text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-hover)] active:bg-[var(--bg-hover)]"
        >
          Nevermind
        </button>
      </div>
    </div>
  );
}
