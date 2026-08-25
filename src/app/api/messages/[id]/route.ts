import { NextRequest, NextResponse } from "next/server";
import { getMessage } from "@/lib/mail-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.headers.get("x-mail-token");
  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const message = await getMessage(token, id);
    return NextResponse.json(message);
  } catch (error) {
    console.error("Failed to fetch message:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch message",
      },
      { status: 500 }
    );
  }
}
