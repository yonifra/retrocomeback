"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

async function createServerSession(idToken: string): Promise<boolean> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  return res.ok;
}

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const formData = new FormData(e.currentTarget);
      const displayName = formData.get("displayName") as string;
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const acceptTerms = formData.get("acceptTerms");

      if (!displayName || !email || !password) {
        setError("All fields are required");
        setIsPending(false);
        return;
      }

      if (!acceptTerms) {
        setError("You must accept the Terms of Service");
        setIsPending(false);
        return;
      }

      // Validate password client-side
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        setIsPending(false);
        return;
      }

      const credential = await createUserWithEmailAndPassword(auth, email, password);

      // Set display name
      await updateProfile(credential.user, { displayName });

      // Create server session
      const idToken = await credential.user.getIdToken();
      const ok = await createServerSession(idToken);

      if (!ok) {
        setError("Account created but failed to create session. Please sign in.");
        setIsPending(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === "auth/email-already-in-use") {
        setError("An account with this email already exists");
      } else if (firebaseError.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else if (firebaseError.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else {
        setError(firebaseError.message ?? "Sign up failed");
      }
      setIsPending(false);
    }
  }

  async function handleGoogleSignup() {
    setError(null);
    setIsGooglePending(true);

    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      const idToken = await credential.user.getIdToken();
      const ok = await createServerSession(idToken);

      if (!ok) {
        setError("Failed to create session");
        setIsGooglePending(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === "auth/popup-closed-by-user") {
        // User closed the popup — not an error
      } else {
        setError(firebaseError.message ?? "Google sign up failed");
      }
      setIsGooglePending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Card */}
      <div className="gradient-border rounded-lg bg-card p-6 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-lg text-foreground">CREATE ACCOUNT</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join the arcade, insert coin
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Google OAuth */}
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2 border-border bg-secondary hover:bg-muted hover:neon-glow-cyan"
          onClick={handleGoogleSignup}
          disabled={isGooglePending || isPending}
        >
          {isGooglePending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <GoogleIcon className="size-5" />
          )}
          <span className="text-sm">Continue with Google</span>
        </Button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              or sign up with email
            </span>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-sm text-foreground">
              Display Name
            </Label>
            <Input
              id="displayName"
              name="displayName"
              type="text"
              placeholder="Player One"
              autoComplete="name"
              required
              className="bg-secondary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-foreground">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="player1@arcade.com"
              autoComplete="email"
              required
              className="bg-secondary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-foreground">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required
              className="bg-secondary"
            />
            <p className="text-xs text-muted-foreground">
              Min 8 chars, with uppercase, lowercase, and a number
            </p>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox id="acceptTerms" name="acceptTerms" required />
            <Label
              htmlFor="acceptTerms"
              className="text-xs leading-relaxed text-muted-foreground"
            >
              I agree to the{" "}
              <Link href="/terms" className="text-primary hover:text-primary/80">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:text-primary/80">
                Privacy Policy
              </Link>
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isPending || isGooglePending}
            className="w-full neon-glow"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </div>

      {/* Footer link */}
      <p className="text-center text-sm text-muted-foreground">
        Already a player?{" "}
        <Link
          href="/login"
          className="text-primary transition-colors hover:text-primary/80"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
