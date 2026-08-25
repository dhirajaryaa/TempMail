import { NextRequest, NextResponse } from "next/server";
import { deleteAccount } from "@/lib/mail-api";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { token, accountId } = await request.json();
    if (!token || !accountId) {
      return NextResponse.json(
        { error: "Missing token or accountId" },
        { status: 400 }
      );
    }

    await deleteAccount(token, accountId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to cleanup account:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to cleanup account",
      },
      { status: 500 }
    );
  }
}
