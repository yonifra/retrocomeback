import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie, clearSessionCookie } from "@/lib/firebase/session";

/**
 * POST /api/auth/session
 * Receives a Firebase ID token from the client after sign-in,
 * creates a server-side session cookie, and returns 200.
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "Missing idToken" },
        { status: 400 },
      );
    }

    const sessionCookie = await createSessionCookie(idToken);

    const response = NextResponse.json({ status: "success" });
    response.cookies.set("session", sessionCookie, {
      maxAge: 14 * 24 * 60 * 60, // 14 days in seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Session creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 401 },
    );
  }
}

/**
 * DELETE /api/auth/session
 * Clears the session cookie (client-side logout helper).
 */
export async function DELETE() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ status: "success" });
  } catch {
    return NextResponse.json({ status: "success" });
  }
}
