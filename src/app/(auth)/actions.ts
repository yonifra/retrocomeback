"use server";

import { redirect } from "next/navigation";
import { clearSessionCookie } from "@/lib/firebase/session";

export type AuthResult = {
  error?: string;
};

/**
 * Server action: log out by clearing the Firebase session cookie.
 * Firebase Auth sign-out on the client side is handled separately
 * in the component (auth.signOut()).
 */
export async function logout() {
  await clearSessionCookie();
  redirect("/");
}
