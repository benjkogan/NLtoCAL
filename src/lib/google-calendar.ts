import { google, calendar_v3 } from "googleapis";

function getCalendarClient(accessToken: string): calendar_v3.Calendar {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth });
}

export async function createEvent(
  accessToken: string,
  eventData: {
    title: string;
    startTime: string;
    endTime: string;
    description?: string;
    location?: string;
    recurrence?: string;
    attendees?: string[];
    timeZone?: string;
  }
) {
  const calendar = getCalendarClient(accessToken);

  const tz = eventData.timeZone || "UTC";

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: eventData.title,
      description: eventData.description,
      location: eventData.location,
      start: { dateTime: eventData.startTime, timeZone: tz },
      end: { dateTime: eventData.endTime, timeZone: tz },
      ...(eventData.recurrence ? { recurrence: [eventData.recurrence] } : {}),
      ...(eventData.attendees?.length ? { attendees: eventData.attendees.map(email => ({ email })) } : {}),
    },
  });
  return response.data;
}

export async function searchEvents(
  accessToken: string,
  query: string,
  startDate?: string,
  endDate?: string
) {
  const calendar = getCalendarClient(accessToken);

  const now = new Date();
  const timeMin = startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const timeMax = endDate || new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();

  const response = await calendar.events.list({
    calendarId: "primary",
    q: query,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 25,
  });

  return response.data.items || [];
}

export async function getEventsInRange(
  accessToken: string,
  timeMin: string,
  timeMax: string
) {
  const calendar = getCalendarClient(accessToken);
  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 25,
  });
  return response.data.items || [];
}

export async function deleteEventById(
  accessToken: string,
  eventId: string
) {
  const calendar = getCalendarClient(accessToken);
  await calendar.events.delete({
    calendarId: "primary",
    eventId,
  });
}

export async function getEventById(
  accessToken: string,
  eventId: string
) {
  const calendar = getCalendarClient(accessToken);
  const { data } = await calendar.events.get({
    calendarId: "primary",
    eventId,
  });
  return data;
}

export async function updateEventById(
  accessToken: string,
  eventId: string,
  changes: {
    title?: string;
    startTime?: string;
    endTime?: string;
    description?: string;
    location?: string;
  },
  timeZone?: string
) {
  const calendar = getCalendarClient(accessToken);

  const requestBody: Record<string, unknown> = {};
  if (changes.title !== undefined) requestBody.summary = changes.title;
  if (changes.description !== undefined) requestBody.description = changes.description;
  if (changes.location !== undefined) requestBody.location = changes.location;

  // Google requires both start and end if either changes
  if (changes.startTime !== undefined || changes.endTime !== undefined) {
    const tz = timeZone || "UTC";
    // If only one is changing, we need the other from the existing event
    // The caller should ensure both are provided when one changes
    if (changes.startTime !== undefined) {
      requestBody.start = { dateTime: changes.startTime, timeZone: tz };
    }
    if (changes.endTime !== undefined) {
      requestBody.end = { dateTime: changes.endTime, timeZone: tz };
    }
    // If only one is set, fetch the event to get the other
    if (changes.startTime !== undefined && changes.endTime === undefined) {
      const event = await getEventById(accessToken, eventId);
      requestBody.end = event.end;
    } else if (changes.endTime !== undefined && changes.startTime === undefined) {
      const event = await getEventById(accessToken, eventId);
      requestBody.start = event.start;
    }
  }

  const response = await calendar.events.patch({
    calendarId: "primary",
    eventId,
    requestBody,
  });
  return response.data;
}

export async function updateRsvpById(
  accessToken: string,
  eventId: string,
  status: "accepted" | "declined" | "tentative"
) {
  const calendar = getCalendarClient(accessToken);

  const { data: event } = await calendar.events.get({
    calendarId: "primary",
    eventId,
  });

  const attendees = event.attendees || [];
  const selfAttendee = attendees.find((a) => a.self);

  if (selfAttendee) {
    selfAttendee.responseStatus = status;
  } else {
    attendees.push({ self: true, responseStatus: status });
  }

  const response = await calendar.events.patch({
    calendarId: "primary",
    eventId,
    requestBody: { attendees },
  });

  return response.data;
}
