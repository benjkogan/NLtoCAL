import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteEventById } from "@/lib/google-calendar";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await request.json();
  if (!eventId) {
    return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
  }

  try {
    await deleteEventById(session.accessToken, eventId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Delete event error:", error);
    const gErr = error as { code?: number; message?: string };
    const message =
      gErr.code === 404
        ? "Event not found — it may have already been deleted"
        : gErr.code === 401
        ? "Google session expired — please sign out and sign back in"
        : gErr.code === 410
        ? "Event was already deleted"
        : "Failed to delete event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
