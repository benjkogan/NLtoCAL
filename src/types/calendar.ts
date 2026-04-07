export type CalendarAction = CreateAction | DeleteAction | RsvpAction | EditAction;

export interface CreateAction {
  action: "create";
  title: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  description?: string;
  location?: string;
  recurrence?: string; // RRULE string, e.g. "RRULE:FREQ=WEEKLY;BYDAY=MO"
  attendees?: string[]; // email addresses
}

export interface DeleteAction {
  action: "delete";
  query: string;
  startDate?: string; // ISO 8601 date to narrow search
  endDate?: string;
}

export interface RsvpAction {
  action: "rsvp";
  query: string;
  status: "accepted" | "declined" | "tentative";
  startDate?: string;
  endDate?: string;
}

export interface EditAction {
  action: "edit";
  query: string;
  startDate?: string;
  endDate?: string;
  changes: {
    title?: string;
    startTime?: string;
    endTime?: string;
    description?: string;
    location?: string;
  };
}
