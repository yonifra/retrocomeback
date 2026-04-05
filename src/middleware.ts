import { type NextRequest, NextResponse } from "next/server";

/**
 * Middleware: protect /account/* routes by checking for a Firebase session cookie.
 *
 * We can't call firebase-admin in Edge middleware, so we only verify the
 * cookie *exists*. The actual cryptographic verification happens server-side
 * in getSessionUser() within each Server Component / Server Action.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /account routes
  if (pathname.startsWith("/account")) {
    const sessionCookie = request.cookies.get("session")?.value;

    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
