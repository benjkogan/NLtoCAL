"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession, signIn } from "next-auth/react";
import NLInput from "@/components/NLInput";
import type { CalendarEvent } from "@/components/EventPicker";
import { ActionResult, UndoData } from "@/components/RecentActions";
import SuggestedCommands from "@/components/SuggestedCommands";
import { CalendarAction, CreateAction, EditAction } from "@/types/calendar";

const ConfirmationCard = dynamic(() => import("@/components/ConfirmationCard"));
const EventPicker = dynamic(() => import("@/components/EventPicker"));
const CalendarPreview = dynamic(() => import("@/components/CalendarPreview"));
const RecentActions = dynamic(() => import("@/components/RecentActions"));

type UIState =
  | { step: "idle" }
  | { step: "confirming"; actions: CreateAction[]; conflicts?: CalendarEvent[]; dayEvents?: CalendarEvent[] }
  | { step: "confirming-edit"; action: EditAction; event: CalendarEvent }
  | { step: "picking"; action: CalendarAction; events: CalendarEvent[] }
  | { step: "executing" };

export default function Home() {
  const { data: session } = useSession();
  const [ui, setUI] = useState<UIState>({ step: "idle" });
  const [actions, setActions] = useState<ActionResult[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (session?.error === "RefreshTokenError") {
      signIn("google");
    }
  }, [session?.error]);

  // After sign-in, auto-run any pending input the user typed before authenticating
  useEffect(() => {
    if (!session) return;
    const pending = localStorage.getItem("pendingInput");
    if (pending) {
      localStorage.removeItem("pendingInput");
      handleParse(pending);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  function transitionTo(newState: UIState) {
    setVisible(false);
    setTimeout(() => {
      setUI(newState);
      setVisible(true);
    }, 150);
  }

  function reset() {
    transitionTo({ step: "idle" });
  }

  async function fetchConflictsAndDayEvents(actions: CreateAction[]): Promise<{
    conflicts: CalendarEvent[];
    dayEvents: CalendarEvent[];
  }> {
    try {
      const starts = actions.map((a) => new Date(a.startTime).getTime());
      const ends = actions.map((a) => new Date(a.endTime).getTime());
      const earliest = new Date(Math.min(...starts));
      const latest = new Date(Math.max(...ends));

      const dayStart = new Date(earliest);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(latest);
      dayEnd.setHours(23, 59, 59, 999);

      const [conflictsRes, dayRes] = await Promise.all([
        fetch("/api/calendar/conflicts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startTime: earliest.toISOString(),
            endTime: latest.toISOString(),
          }),
        }),
        fetch("/api/calendar/conflicts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startTime: dayStart.toISOString(),
            endTime: dayEnd.toISOString(),
          }),
        }),
      ]);

      const conflicts = conflictsRes.ok ? (await conflictsRes.json()).events || [] : [];
      const dayEvents = dayRes.ok ? (await dayRes.json()).events || [] : [];
      return { conflicts, dayEvents };
    } catch {
      return { conflicts: [], dayEvents: [] };
    }
  }

  async function handleParse(text: string) {
    if (!session) {
      localStorage.setItem("pendingInput", text);
      signIn("google");
      return;
    }
    setError(null);
    setIsParsing(true);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          localTime: new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "long" }),
          isoTime: (() => {
            const now = new Date();
            const offset = -now.getTimezoneOffset();
            const sign = offset >= 0 ? "+" : "-";
            const pad = (n: number) => String(Math.abs(n)).padStart(2, "0");
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
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to parse");
      }
      const rawParsed = await res.json();
      const parsedActions: CalendarAction[] = Array.isArray(rawParsed) ? rawParsed : [rawParsed];

      if (parsedActions.every((a) => a.action === "create")) {
        const createActions = parsedActions as CreateAction[];
        const { conflicts, dayEvents } = await fetchConflictsAndDayEvents(createActions);
        transitionTo({ step: "confirming", actions: createActions, conflicts, dayEvents });
      } else {
        const parsed = parsedActions[0];
        if (parsed.action === "create") {
          const { conflicts, dayEvents } = await fetchConflictsAndDayEvents([parsed]);
          transitionTo({ step: "confirming", actions: [parsed], conflicts, dayEvents });
        } else {
          const searchRes = await fetch("/api/calendar/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: parsed.query,
              startDate: parsed.startDate,
              endDate: parsed.endDate,
            }),
          });
          if (!searchRes.ok) {
            throw new Error("Failed to search events");
          }
          const { events } = await searchRes.json();
          transitionTo({ step: "picking", action: parsed, events });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsParsing(false);
    }
  }

  async function handleConfirmCreate(editedActions: CreateAction[]) {
    setUI({ step: "executing" });
    setError(null);

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    for (const action of editedActions) {
      try {
        const res = await fetch("/api/calendar/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: action.title,
            startTime: action.startTime,
            endTime: action.endTime,
            description: action.description,
            location: action.location,
            recurrence: action.recurrence,
            attendees: action.attendees,
            timeZone: tz,
          }),
        });
        const data = await res.json();
        const undoData: UndoData | undefined = res.ok && data.event?.id
          ? { kind: "create", eventId: data.event.id }
          : undefined;
        addResult("create", res.ok ? `Created "${action.title}"` : data.error, res.ok, undoData);
        if (!res.ok) setError(data.error);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    }
    reset();
  }

  async function handlePickEvent(event: CalendarEvent) {
    if (ui.step !== "picking") return;
    const action = ui.action;
    setUI({ step: "executing" });
    setError(null);

    const eventName = event.summary || "(No title)";

    if (action.action === "delete") {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const res = await fetch("/api/calendar/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId: event.id }),
        });
        const data = await res.json();
        const undoData: UndoData | undefined = res.ok
          ? {
              kind: "delete",
              eventData: {
                title: event.summary || "(No title)",
                startTime: event.start.dateTime || event.start.date || "",
                endTime: event.end.dateTime || event.end.date || "",
                timeZone: tz,
              },
            }
          : undefined;
        addResult("delete", res.ok ? `Deleted "${eventName}"` : data.error, res.ok, undoData);
        if (!res.ok) throw new Error(data.error);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } else if (action.action === "rsvp") {
      try {
        const res = await fetch("/api/calendar/rsvp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: event.id,
            status: action.status,
          }),
        });
        const data = await res.json();
        addResult(
          "rsvp",
          res.ok ? `RSVP ${action.status} for "${eventName}"` : data.error,
          res.ok
        );
        if (!res.ok) throw new Error(data.error);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } else if (action.action === "edit") {
      transitionTo({ step: "confirming-edit", action, event });
      return;
    }

    reset();
  }

  async function handleConfirmEdit(changes: EditAction["changes"]) {
    if (ui.step !== "confirming-edit") return;
    const { event } = ui;
    setUI({ step: "executing" });
    setError(null);

    const eventName = event.summary || "(No title)";
    try {
      const res = await fetch("/api/calendar/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          changes,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      const data = await res.json();
      const originalValues: Record<string, string> = {};
      if (changes.title !== undefined) originalValues.title = event.summary || "";
      if (changes.startTime !== undefined) originalValues.startTime = event.start.dateTime || event.start.date || "";
      if (changes.endTime !== undefined) originalValues.endTime = event.end.dateTime || event.end.date || "";
      const undoData: UndoData | undefined = res.ok
        ? { kind: "edit", eventId: event.id, originalValues }
        : undefined;
      addResult("edit", res.ok ? `Updated "${eventName}"` : data.error, res.ok, undoData);
      if (!res.ok) throw new Error(data.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      reset();
    }
  }

  function addResult(type: "create" | "delete" | "rsvp" | "edit", summary: string, success: boolean, undoData?: UndoData) {
    setActions((prev) =>
      [
        {
          id: crypto.randomUUID(),
          type,
          summary,
          success,
          timestamp: new Date(),
          undoData,
        },
        ...prev,
      ].slice(0, 10)
    );
  }

  async function handleUndo(action: ActionResult) {
    if (!action.undoData) return;
    setError(null);

    try {
      const undo = action.undoData;
      if (undo.kind === "create") {
        const res = await fetch("/api/calendar/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId: undo.eventId }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
      } else if (undo.kind === "delete") {
        const res = await fetch("/api/calendar/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: undo.eventData.title,
            startTime: undo.eventData.startTime,
            endTime: undo.eventData.endTime,
            description: undo.eventData.description,
            location: undo.eventData.location,
            timeZone: undo.eventData.timeZone,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
      } else if (undo.kind === "edit") {
        const res = await fetch("/api/calendar/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: undo.eventId,
            changes: undo.originalValues,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
      }

      setActions((prev) =>
        prev.map((a) => (a.id === action.id ? { ...a, undone: true } : a))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to undo");
    }
  }

  const showCalendarPreview =
    ui.step === "confirming" && ui.dayEvents && ui.dayEvents.length > 0;

  return (
    <div className="flex flex-1 flex-col items-center w-full max-w-2xl min-h-0">
      {/* Fixed top: title + input */}
      <div className="w-full shrink-0 pt-8 sm:pt-16">
        <div className="text-center mb-4 sm:mb-6">
          <h2
            className="text-2xl sm:text-3xl font-medium tracking-tight mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            What&apos;s on your calendar{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}?
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Create, edit, delete, or RSVP to events — just type naturally. We&apos;ll handle the rest.
          </p>
        </div>

        <NLInput onSubmit={handleParse} isLoading={isParsing} />

        {error && (
          <div
            className="w-full rounded-lg px-4 py-3 text-sm mt-4"
            style={{
              background: "rgba(248, 113, 113, 0.08)",
              border: "1px solid rgba(248, 113, 113, 0.15)",
              color: "var(--red)",
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Flexible middle: action area with transitions — never scrolls as a whole */}
      <div className="flex-1 w-full min-h-0 py-4 sm:py-6 flex flex-col">
        <div
          className="flex-1 min-h-0 flex flex-col transition-all duration-150 ease-in-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(8px)",
          }}
        >
          {ui.step === "idle" && !isParsing && (
            <SuggestedCommands onSelect={handleParse} />
          )}

          {ui.step === "confirming" && (
            <div className={showCalendarPreview
              ? "flex-1 min-h-0 flex flex-col sm:flex-row gap-4"
              : "flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar"
            }>
              <div className={showCalendarPreview ? "flex-1 min-w-0 overflow-y-auto overflow-x-hidden no-scrollbar" : "w-full"}>
                <ConfirmationCard
                  actions={ui.actions}
                  onConfirmCreate={handleConfirmCreate}
                  onCancel={reset}
                  isLoading={false}
                  conflicts={ui.conflicts}
                />
              </div>
              {showCalendarPreview && (
                <div className="hidden sm:flex sm:flex-col sm:w-52 shrink-0 min-h-0">
                  <CalendarPreview
                    events={ui.dayEvents!}
                    highlightStart={ui.actions[0].startTime}
                    highlightEnd={ui.actions[ui.actions.length - 1].endTime}
                  />
                </div>
              )}
            </div>
          )}

          {ui.step === "confirming-edit" && (
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar">
              <ConfirmationCard
                action={ui.action}
                editEvent={ui.event}
                onConfirmEdit={(changes) => handleConfirmEdit(changes)}
                onCancel={reset}
                isLoading={false}
              />
            </div>
          )}

          {ui.step === "picking" && (
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar">
              <EventPicker
                events={ui.events}
                actionLabel={ui.action.action === "delete" ? "delete" : ui.action.action === "rsvp" ? `RSVP ${ui.action.status}` : ui.action.action === "edit" ? "edit" : ""}
                onSelect={handlePickEvent}
                onCancel={reset}
              />
            </div>
          )}

          {ui.step === "executing" && (
            <p style={{ color: "var(--text-tertiary)" }}>Executing...</p>
          )}
        </div>
      </div>

      {/* Fixed bottom: recent actions */}
      {actions.length > 0 && (
        <div className="w-full shrink-0 pb-4 sm:pb-6">
          <RecentActions actions={actions} onUndo={handleUndo} />
        </div>
      )}
    </div>
  );
}
