import { NextRequest, NextResponse } from "next/server";
import { createTempMailSession, DURATION_OPTIONS } from "@/lib/mail-api";
import type { DurationMinutes } from "@/lib/mail-api";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    let durationMinutes: DurationMinutes = 5;

    try {
      const body = await request.json();
      if (
        body.durationMinutes &&
        DURATION_OPTIONS.includes(body.durationMinutes)
      ) {
        durationMinutes = body.durationMinutes;
      }
    } catch {
      // No body or invalid JSON — use default 5 min
    }

    const session = await createTempMailSession(durationMinutes);
    return NextResponse.json(session);
  } catch (error) {
    console.error("Failed to create temp mail session:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create session",
      },
      { status: 500 }
    );
  }
}
