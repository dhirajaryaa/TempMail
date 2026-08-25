import { NextRequest, NextResponse } from "next/server";
import { getMessages } from "@/lib/mail-api";

export async function GET(request: NextRequest) {
  const token = request.headers.get("x-mail-token");
  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  try {
    const messages = await getMessages(token);
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch messages",
      },
      { status: 500 }
    );
  }
}
