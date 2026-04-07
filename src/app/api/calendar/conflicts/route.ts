import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getEventsInRange } from "@/lib/google-calendar";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (!body.startTime || !body.endTime) {
    return NextResponse.json({ error: "Missing startTime or endTime" }, { status: 400 });
  }

  try {
    const events = await getEventsInRange(
      session.accessToken,
      body.startTime,
      body.endTime
    );
    return NextResponse.json({ events });
  } catch (error: unknown) {
    console.error("Conflict check error:", error);
    return NextResponse.json({ events: [] });
  }
}
