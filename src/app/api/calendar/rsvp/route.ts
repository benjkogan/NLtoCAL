import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateRsvpById } from "@/lib/google-calendar";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId, status } = await request.json();
  if (!eventId || !status) {
    return NextResponse.json({ error: "Missing eventId or status" }, { status: 400 });
  }

  try {
    const event = await updateRsvpById(session.accessToken, eventId, status);

    // Check if the status actually changed
    const self = event.attendees?.find((a) => a.self);
    if (self && self.responseStatus !== status) {
      return NextResponse.json(
        { error: `Could not change RSVP — you may not have permission to update this event` },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, event });
  } catch (error: unknown) {
    console.error("RSVP error:", error);
    const gErr = error as { code?: number; message?: string };
    const message =
      gErr.code === 404
        ? "Event not found — it may have been deleted"
        : gErr.code === 401
        ? "Google session expired — please sign out and sign back in"
        : gErr.code === 403
        ? "You don't have permission to RSVP to this event"
        : "Failed to update RSVP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
