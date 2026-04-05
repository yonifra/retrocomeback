import { cookies } from "next/headers";
import { adminAuth } from "./admin";

const SESSION_COOKIE_NAME = "session";
const SESSION_EXPIRY_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export interface SessionUser {
  uid: string;
  email: string | undefined;
  displayName: string | undefined;
}

/**
 * Get the current user from the Firebase session cookie.
 * Returns null if no valid session exists.
 * Use this in Server Components and Server Actions.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) return null;

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);

    return {
      uid: decoded.uid,
      email: decoded.email,
      displayName: decoded.name ?? decoded.email?.split("@")[0],
    };
  } catch {
    return null;
  }
}

/**
 * Create a session cookie from a Firebase ID token.
 * Called after client-side sign-in to establish a server-side session.
 */
export async function createSessionCookie(idToken: string): Promise<string> {
  return adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRY_MS,
  });
}

/**
 * Clear the session cookie (for logout).
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export { SESSION_COOKIE_NAME, SESSION_EXPIRY_MS };
