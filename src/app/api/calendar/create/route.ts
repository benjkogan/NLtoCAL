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
    const event = await createEvent(session.accessToken, body);
    return NextResponse.json({ success: true, event });
  } catch (error: unknown) {
    console.error("Create event error:", error);
    const gErr = error as { code?: number; message?: string };
    const message =
      gErr.code === 401
        ? "Google session expired — please sign out and sign back in"
        : gErr.code === 403
        ? "Calendar access denied — make sure you granted calendar permissions"
        : "Failed to create event — check your event details and try again";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
