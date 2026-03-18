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
  }
) {
  const calendar = getCalendarClient(accessToken);
  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: eventData.title,
      description: eventData.description,
      location: eventData.location,
      start: { dateTime: eventData.startTime },
      end: { dateTime: eventData.endTime },
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
  const timeMin = startDate || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const timeMax = endDate || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const response = await calendar.events.list({
    calendarId: "primary",
    q: query,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 10,
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
