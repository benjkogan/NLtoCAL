import Anthropic from "@anthropic-ai/sdk";
import { CalendarAction } from "@/types/calendar";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a calendar assistant that parses natural language into structured calendar actions. Today's date and time is provided below. Always return valid JSON matching one of these schemas:

For creating events:
{ "action": "create", "title": string, "startTime": ISO8601, "endTime": ISO8601, "description"?: string, "location"?: string, "recurrence"?: string }

For deleting events:
{ "action": "delete", "query": string (search terms to find the event), "startDate"?: ISO8601, "endDate"?: ISO8601 }

For changing RSVP status:
{ "action": "rsvp", "query": string (search terms to find the event), "status": "accepted" | "declined" | "tentative", "startDate"?: ISO8601, "endDate"?: ISO8601 }

Rules:
- If no end time is specified for a created event, default to 1 hour after start.
- Use the provided current date/time and timezone to resolve relative dates like "tomorrow", "next Friday", etc.
- "noon" means 12:00 PM, "midnight" means 12:00 AM. Pay careful attention to the specific times mentioned.
- All returned times must include the correct timezone offset.
- For delete and rsvp, include startDate/endDate to help narrow the search window.
- If the user specifies a recurring event (e.g. "every Monday", "weekly", "daily", "every weekday"), include a "recurrence" field with a valid RRULE string. Examples: "RRULE:FREQ=WEEKLY;BYDAY=MO", "RRULE:FREQ=DAILY", "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR", "RRULE:FREQ=MONTHLY;BYDAY=1FR". If the user specifies an end date for the recurrence, add UNTIL (e.g. "RRULE:FREQ=WEEKLY;BYDAY=MO;UNTIL=20260401T000000Z"). If a count is specified, use COUNT (e.g. "RRULE:FREQ=WEEKLY;COUNT=10"). Do not include "recurrence" for one-time events.
- Return ONLY the JSON object, no other text.`;

export async function parseNaturalLanguage(
  text: string,
  clientTime?: { timezone?: string; localTime?: string; isoTime?: string }
): Promise<CalendarAction> {
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

  return JSON.parse(raw) as CalendarAction;
}
