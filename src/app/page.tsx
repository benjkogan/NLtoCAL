"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import AuthButton from "@/components/AuthButton";
import NLInput from "@/components/NLInput";
import ConfirmationCard from "@/components/ConfirmationCard";
import EventPicker, { CalendarEvent } from "@/components/EventPicker";
import RecentActions, { ActionResult } from "@/components/RecentActions";
import { CalendarAction } from "@/types/calendar";

type UIState =
  | { step: "idle" }
  | { step: "confirming"; action: CalendarAction }
  | { step: "picking"; action: CalendarAction; events: CalendarEvent[] }
  | { step: "executing" };

export default function Home() {
  const { data: session } = useSession();
  const [ui, setUI] = useState<UIState>({ step: "idle" });
  const [actions, setActions] = useState<ActionResult[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.error === "RefreshTokenError") {
      signIn("google");
    }
  }, [session?.error]);

  function reset() {
    setUI({ step: "idle" });
  }

  async function handleParse(text: string) {
    setError(null);
    setIsParsing(true);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to parse");
      }
      const parsed: CalendarAction = await res.json();

      if (parsed.action === "create") {
        setUI({ step: "confirming", action: parsed });
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
        setUI({ step: "picking", action: parsed, events });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsParsing(false);
    }
  }

  async function handleConfirmCreate(edited: CalendarAction) {
    if (edited.action !== "create") return;
    setUI({ step: "executing" });
    setError(null);

    const action = edited;
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
        }),
      });
      const data = await res.json();
      addResult("create", res.ok ? `Created "${action.title}"` : data.error, res.ok);
      if (!res.ok) throw new Error(data.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      reset();
    }
  }

  async function handlePickEvent(event: CalendarEvent) {
    if (ui.step !== "picking") return;
    const action = ui.action;
    setUI({ step: "executing" });
    setError(null);

    const eventName = event.summary || "(No title)";

    if (action.action === "delete") {
      try {
        const res = await fetch("/api/calendar/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId: event.id }),
        });
        const data = await res.json();
        addResult("delete", res.ok ? `Deleted "${eventName}"` : data.error, res.ok);
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
    }

    reset();
  }

  function addResult(type: "create" | "delete" | "rsvp", summary: string, success: boolean) {
    setActions((prev) => [
      {
        id: crypto.randomUUID(),
        type,
        summary,
        success,
        timestamp: new Date(),
      },
      ...prev,
    ]);
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-pattern px-6">
      <header className="flex w-full max-w-2xl items-center justify-between py-8">
        <h1 className="text-2xl font-semibold tracking-wide" style={{ color: "var(--text-primary)" }}>
          NLtoCal
        </h1>
        <div className="flex items-center gap-4">
          <a
            href="/about"
            className="text-sm underline transition-colors"
            style={{ color: "var(--text-tertiary)" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
          >
            About
          </a>
          <AuthButton />
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center gap-8 pt-32 w-full max-w-2xl">
        {session ? (
          <>
            <div className="text-center mb-4">
              <h2
                className="text-3xl font-medium tracking-tight mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                What&apos;s on your calendar?
              </h2>
              <p style={{ color: "var(--text-secondary)" }}>
                Create, delete, or RSVP to events — just type naturally.
              </p>
            </div>

            <NLInput onSubmit={handleParse} isLoading={isParsing} />

            {error && (
              <div
                className="w-full rounded-lg px-4 py-3 text-sm"
                style={{
                  background: "rgba(248, 113, 113, 0.08)",
                  border: "1px solid rgba(248, 113, 113, 0.15)",
                  color: "var(--red)",
                }}
              >
                {error}
              </div>
            )}

            {ui.step === "confirming" && (
              <ConfirmationCard
                action={ui.action}
                onConfirm={handleConfirmCreate}
                onCancel={reset}
                isLoading={false}
              />
            )}

            {ui.step === "picking" && (
              <EventPicker
                events={ui.events}
                actionLabel={ui.action.action === "delete" ? "delete" : ui.action.action === "rsvp" ? `RSVP ${ui.action.status}` : ""}
                onSelect={handlePickEvent}
                onCancel={reset}
              />
            )}

            {ui.step === "executing" && (
              <p style={{ color: "var(--text-tertiary)" }}>Executing...</p>
            )}

            <RecentActions actions={actions} />
          </>
        ) : (
          <div className="text-center pt-8">
            <h2
              className="text-3xl font-medium tracking-tight mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Natural language to calendar
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Sign in with Google to manage your calendar with plain English.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
