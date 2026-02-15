import { NextResponse } from "next/server";
import { addToWaitlist } from "@/lib/db";
import type { WaitlistResponse } from "@/lib/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
} as const;

export async function POST(request: Request): Promise<NextResponse<WaitlistResponse>> {
  try {
    const body = await request.json() as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !EMAIL_PATTERN.test(email) || email.length > 320) {
      return NextResponse.json(
        { message: "invalid email address" },
        { status: 400, headers: HEADERS },
      );
    }

    const { added } = addToWaitlist(email);

    if (added) {
      return NextResponse.json(
        { message: "you're on the list" },
        { status: 200, headers: HEADERS },
      );
    }

    return NextResponse.json(
      { message: "already on the list", duplicate: true },
      { status: 200, headers: HEADERS },
    );
  } catch {
    return NextResponse.json(
      { message: "something went wrong" },
      { status: 500, headers: HEADERS },
    );
  }
}
