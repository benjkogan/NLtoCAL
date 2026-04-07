import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateEventById } from "@/lib/google-calendar";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (!body.eventId || !body.changes) {
    return NextResponse.json({ error: "Missing eventId or changes" }, { status: 400 });
  }

  try {
    const event = await updateEventById(
      session.accessToken,
      body.eventId,
      body.changes,
      body.timeZone
    );
    return NextResponse.json({ success: true, event });
  } catch (error: unknown) {
    console.error("Edit event error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    const gErr = error as { code?: number; message?: string };
    const message =
      gErr.code === 401
        ? "Google session expired — please sign out and sign back in"
        : gErr.code === 404
        ? "Event not found — it may have been deleted"
        : gErr.code === 403
        ? "Calendar access denied — make sure you granted calendar permissions"
        : "Failed to update event — please try again";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
