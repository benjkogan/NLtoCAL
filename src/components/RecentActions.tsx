"use client";

export interface ActionResult {
  id: string;
  type: "create" | "delete" | "rsvp";
  summary: string;
  success: boolean;
  timestamp: Date;
}

interface RecentActionsProps {
  actions: ActionResult[];
}

export default function RecentActions({ actions }: RecentActionsProps) {
  if (actions.length === 0) return null;

  return (
    <div className="w-full">
      <h2
        className="mb-3 text-xs font-medium uppercase tracking-widest"
        style={{ color: "var(--text-tertiary)" }}
      >
        Recent
      </h2>
      <div className="space-y-1.5">
        {actions.map((action) => (
          <div
            key={action.id}
            className="flex items-center justify-between rounded-lg px-4 py-3"
            style={{ border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-3">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  background: action.success ? "var(--green)" : "var(--red)",
                }}
              />
              <div>
                <span
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {action.type}
                </span>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {action.summary}
                </p>
              </div>
            </div>
            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              {action.timestamp.toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
