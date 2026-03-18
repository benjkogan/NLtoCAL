import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { searchEvents } from "@/lib/google-calendar";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { query, startDate, endDate } = await request.json();
  try {
    const events = await searchEvents(session.accessToken, query, startDate, endDate);
    return NextResponse.json({ events });
  } catch (error: unknown) {
    console.error("Search error:", error);
    const gErr = error as { code?: number; message?: string };
    const message =
      gErr.code === 401
        ? "Google session expired — please sign out and sign back in"
        : "Failed to search your calendar — try again";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
