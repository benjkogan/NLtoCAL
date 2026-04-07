"use client";

import { CalendarEvent } from "@/components/EventPicker";

interface CalendarPreviewProps {
  events: CalendarEvent[];
  highlightStart: string;
  highlightEnd: string;
}

function getHour(iso: string): number {
  const d = new Date(iso);
  return d.getHours() + d.getMinutes() / 60;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function CalendarPreview({
  events,
  highlightStart,
  highlightEnd,
}: CalendarPreviewProps) {
  const newStart = getHour(highlightStart);
  const newEnd = getHour(highlightEnd);

  // Determine visible hour range
  const allHours = [newStart, newEnd];
  events.forEach((e) => {
    const start = e.start.dateTime;
    const end = e.end.dateTime;
    if (start) allHours.push(getHour(start));
    if (end) allHours.push(getHour(end));
  });

  const minHour = Math.floor(Math.min(...allHours));
  const maxHour = Math.ceil(Math.max(...allHours));
  const totalHours = maxHour - minHour;

  if (totalHours <= 0) return null;

  const hourHeight = 40; // px per hour
  const totalHeight = totalHours * hourHeight;

  function getTop(hour: number): number {
    return ((hour - minHour) / totalHours) * totalHeight;
  }

  function getHeight(startHour: number, endHour: number): number {
    return ((endHour - startHour) / totalHours) * totalHeight;
  }

  // Filter to only timed events (not all-day)
  const timedEvents = events.filter((e) => e.start.dateTime && e.end.dateTime);

  return (
    <div className="w-full">
      <h3
        className="mb-3 text-xs font-medium uppercase tracking-widest"
        style={{ color: "var(--text-tertiary)" }}
      >
        Your day
      </h3>
      <div
        className="overflow-y-auto rounded-lg"
        style={{
          border: "1px solid var(--border)",
          maxHeight: `${totalHeight + 8}px`,
        }}
      >
        <div
          className="relative"
          style={{
            height: `${totalHeight}px`,
            background: "var(--bg-raised)",
          }}
        >
        {/* Hour grid lines */}
        {Array.from({ length: totalHours + 1 }, (_, i) => {
          const hour = minHour + i;
          if (hour > 24) return null;
          const label =
            hour === 0 ? "12 AM" :
            hour < 12 ? `${hour} AM` :
            hour === 12 ? "12 PM" :
            `${hour - 12} PM`;
          return (
            <div
              key={hour}
              className="absolute left-0 right-0 flex items-start"
              style={{ top: `${getTop(hour)}px` }}
            >
              <span
                className="text-[11px] w-10 text-right pr-2 -mt-2 shrink-0"
                style={{ color: "var(--text-tertiary)" }}
              >
                {label}
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: "var(--border)" }}
              />
            </div>
          );
        })}

        {/* Existing events */}
        {timedEvents.map((event) => {
          const eStart = getHour(event.start.dateTime!);
          const eEnd = getHour(event.end.dateTime!);
          return (
            <div
              key={event.id}
              className="absolute rounded px-2 py-1 text-xs overflow-hidden"
              style={{
                top: `${getTop(eStart)}px`,
                height: `${Math.max(getHeight(eStart, eEnd), 20)}px`,
                left: "40px",
                right: "8px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              <div className="font-medium truncate">{event.summary || "(No title)"}</div>
              <div style={{ color: "var(--text-tertiary)" }}>
                {formatTime(event.start.dateTime!)}
              </div>
            </div>
          );
        })}

        {/* New event highlight */}
        <div
          className="absolute rounded px-2 py-1 text-xs overflow-hidden"
          style={{
            top: `${getTop(newStart)}px`,
            height: `${Math.max(getHeight(newStart, newEnd), 20)}px`,
            left: "40px",
            right: "8px",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid var(--accent)",
            color: "var(--accent)",
          }}
        >
          <div className="font-medium truncate">New event</div>
          <div style={{ opacity: 0.7 }}>
            {formatTime(highlightStart)}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
