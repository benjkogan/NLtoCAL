import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parseNaturalLanguage } from "@/lib/claude";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text, timezone, localTime, isoTime } = await request.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid 'text' field" },
      { status: 400 }
    );
  }

  try {
    const parsed = await parseNaturalLanguage(text, { timezone, localTime, isoTime });
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Parse error:", error);
    const message =
      error instanceof SyntaxError
        ? "Couldn't understand that — try rephrasing with a clear action, like \"lunch tomorrow at noon\" or \"cancel my 3pm meeting\""
        : error instanceof Error && error.message.includes("401")
        ? "Anthropic API key is invalid or missing"
        : error instanceof Error && error.message.includes("rate")
        ? "Too many requests — please wait a moment and try again"
        : "Something went wrong while parsing your input — try rephrasing";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
