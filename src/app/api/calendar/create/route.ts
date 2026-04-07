import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createEvent } from "@/lib/google-calendar";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  try {
    const event = await createEvent(session.accessToken, {
      title: body.title,
      startTime: body.startTime,
      endTime: body.endTime,
      description: body.description,
      location: body.location,
      recurrence: body.recurrence,
      attendees: body.attendees,
      timeZone: body.timeZone,
    });
    return NextResponse.json({ success: true, event });
  } catch (error: unknown) {
    console.error("Create event error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    const gErr = error as { code?: number; message?: string; errors?: Array<{ message: string }> };
    const detail = gErr.errors?.[0]?.message || gErr.message || "";
    const message =
      gErr.code === 401
        ? "Google session expired — please sign out and sign back in"
        : gErr.code === 403
        ? "Calendar access denied — make sure you granted calendar permissions"
        : detail.includes("Invalid value for")
        ? `Invalid event data: ${detail}`
        : "Failed to create event — check your event details and try again";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
