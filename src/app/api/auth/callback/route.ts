import { NextResponse } from "next/server";

/**
 * GET /api/auth/callback
 *
 * This route was used by Supabase OAuth. With Firebase, OAuth is handled
 * entirely client-side via signInWithPopup/signInWithRedirect.
 * This route now just redirects to the homepage.
 */
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/`);
}
