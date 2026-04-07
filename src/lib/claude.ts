import Anthropic from "@anthropic-ai/sdk";
import { CalendarAction } from "@/types/calendar";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a calendar assistant that parses natural language into structured calendar actions. Today's date and time is provided below. Always return valid JSON matching one of these schemas:

For creating events:
{ "action": "create", "title": string, "startTime": ISO8601, "endTime": ISO8601, "description"?: string, "location"?: string, "recurrence"?: string, "attendees"?: string[] }

For deleting events:
{ "action": "delete", "query": string (search terms to find the event), "startDate"?: ISO8601, "endDate"?: ISO8601 }

For editing/updating existing events:
{ "action": "edit", "query": string (search terms to find the event), "startDate"?: ISO8601, "endDate"?: ISO8601, "changes": { "title"?: string, "startTime"?: ISO8601, "endTime"?: ISO8601, "description"?: string, "location"?: string } }

For changing RSVP status:
{ "action": "rsvp", "query": string (search terms to find the event), "status": "accepted" | "declined" | "tentative", "startDate"?: ISO8601, "endDate"?: ISO8601 }

Rules:
- If no end time is specified for a created event, default to 1 hour after start.
- Use the provided current date/time and timezone to resolve relative dates like "tomorrow", "next Friday", etc.
- "noon" means 12:00 PM, "midnight" means 12:00 AM. Pay careful attention to the specific times mentioned.
- Parse compact time formats carefully: "1030am" = 10:30 AM, "230pm" = 2:30 PM, "9am" = 9:00 AM. Always respect AM/PM exactly as written.
- CRITICAL timezone rule: Times the user mentions are ALWAYS in their local timezone. If the user says "noon" and their timezone is America/New_York (UTC-4), output "2026-03-24T12:00:00-04:00" — the time portion (12:00) must match what the user said. Do NOT convert to UTC. The offset in the ISO string indicates the timezone, not an amount to add.
- When the user says "thru" or "through" a date for a recurring event, that date is inclusive — use UNTIL with that exact date.
- When duration is specified (e.g. "for 1.5 hours", "for 90 minutes"), calculate endTime by adding the duration to startTime.
- For recurring events on specific days (e.g. "Tue Thur"), the first occurrence should start on the next matching day, not today.
- For delete and rsvp, include startDate/endDate to help narrow the search window.
- If the user specifies a recurring event (e.g. "every Monday", "weekly", "daily", "every weekday"), include a "recurrence" field with a valid RRULE string. Examples: "RRULE:FREQ=WEEKLY;BYDAY=MO", "RRULE:FREQ=DAILY", "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR", "RRULE:FREQ=MONTHLY;BYDAY=1FR". If the user specifies an end date for the recurrence, add UNTIL (e.g. "RRULE:FREQ=WEEKLY;BYDAY=MO;UNTIL=20260401T000000Z"). If a count is specified, use COUNT (e.g. "RRULE:FREQ=WEEKLY;COUNT=10"). Do not include "recurrence" for one-time events.
- For edit actions, only include the fields that are changing in "changes". Do not include unchanged fields.
- If the user mentions people by email address (e.g. alice@example.com), include them in the "attendees" array. Only include valid email addresses, not names.
- When no end time or duration is specified, infer duration from the event type:
  - "lunch" or "dinner" → 1.5 hours
  - "coffee", "quick chat", "quick call", "quick sync" → 30 minutes
  - "workshop", "training", "seminar" → 2 hours
  - "meeting" or anything else → 1 hour (default)
- If the user describes multiple distinct events in one message (e.g. "lunch at noon and coffee at 3pm"), return a JSON array of action objects instead of a single object. Only return arrays when all actions are "create" actions.
- Return ONLY the JSON object (or array), no other text.`;

export async function parseNaturalLanguage(
  text: string,
  clientTime?: { timezone?: string; localTime?: string; isoTime?: string }
): Promise<CalendarAction | CalendarAction[]> {
  const now = new Date();
  const timezone = clientTime?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localTime = clientTime?.localTime || now.toLocaleString("en-US", { timeZone: timezone, dateStyle: "full", timeStyle: "long" });
  const isoTime = clientTime?.isoTime || now.toISOString();

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Current date/time: ${localTime}\nTimezone: ${timezone}\nISO: ${isoTime}\n\nUser input: ${text}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  // Strip markdown code fences if present
  let raw = content.text.trim();
  raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

  const parsed = JSON.parse(raw);
  return parsed as CalendarAction | CalendarAction[];
}
