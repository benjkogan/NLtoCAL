"use client";

export type UndoData =
  | { kind: "create"; eventId: string }
  | { kind: "delete"; eventData: { title: string; startTime: string; endTime: string; description?: string; location?: string; timeZone?: string } }
  | { kind: "edit"; eventId: string; originalValues: Record<string, string> };

export interface ActionResult {
  id: string;
  type: "create" | "delete" | "rsvp" | "edit";
  summary: string;
  success: boolean;
  timestamp: Date;
  undoData?: UndoData;
  undone?: boolean;
}

interface RecentActionsProps {
  actions: ActionResult[];
  onUndo?: (action: ActionResult) => void;
}

export default function RecentActions({ actions, onUndo }: RecentActionsProps) {
  if (actions.length === 0) return null;

  // Only the most recent successful, non-undone action with undoData can be undone
  const undoableId = actions.find(
    (a) => a.success && !a.undone && a.undoData
  )?.id;

  const displayed = actions.slice(0, 3);

  return (
    <div className="w-full">
      <h2
        className="mb-2 text-xs font-medium uppercase tracking-widest"
        style={{ color: "var(--text-tertiary)" }}
      >
        Recent
      </h2>
      <div className="space-y-1">
        {displayed.map((action) => (
          <div
            key={action.id}
            className="flex items-center justify-between rounded-lg px-3 py-2"
            style={{
              border: "1px solid var(--border)",
              opacity: action.undone ? 0.4 : 1,
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  background: action.success ? "var(--green)" : "var(--red)",
                }}
              />
              <p
                className="text-sm"
                style={{
                  color: action.success ? "var(--text-primary)" : "var(--red)",
                  textDecoration: action.undone ? "line-through" : "none",
                }}
              >
                {action.summary}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {action.id === undoableId && onUndo && (
                <button
                  onClick={() => onUndo(action)}
                  className="text-xs font-medium transition-colors rounded px-2 py-1"
                  style={{
                    color: "var(--text-tertiary)",
                    border: "1px solid var(--border)",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.background = "var(--bg-hover)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = "var(--text-tertiary)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  Undo
                </button>
              )}
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                {action.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
