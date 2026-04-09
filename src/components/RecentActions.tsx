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
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
                style={{
                  background: action.success ? "var(--green)" : "var(--red)",
                }}
              />
              <p
                className="text-sm truncate"
                style={{
                  color: action.success ? "var(--text-primary)" : "var(--red)",
                  textDecoration: action.undone ? "line-through" : "none",
                }}
              >
                {action.summary}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {action.id === undoableId && onUndo && (
                <button
                  onClick={() => onUndo(action)}
                  className="text-xs font-medium transition-colors rounded px-2.5 py-1.5 text-[var(--text-tertiary)] border border-[var(--border)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] active:text-[var(--text-secondary)] active:bg-[var(--bg-hover)]"
                >
                  Undo
                </button>
              )}
              <span className="hidden sm:inline text-xs text-[var(--text-tertiary)]">
                {action.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
