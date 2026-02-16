"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, loginWithGoogle, type AuthResult } from "../actions";

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

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const message = searchParams.get("message");
  const errorParam = searchParams.get("error");

  const [state, formAction, isPending] = useActionState<AuthResult, FormData>(
    async (_prevState: AuthResult, formData: FormData) => {
      formData.set("redirectTo", redirectTo);
      return login(formData);
    },
    {}
  );

  const error = state?.error || errorParam;

  return (
    <div className="space-y-6">
      {/* Card */}
      <div className="gradient-border rounded-lg bg-card p-6 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-lg text-foreground">SIGN IN</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the grid, player one
          </p>
        </div>

        {/* Status messages */}
        {message && (
          <div className="mb-4 rounded-md border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Google OAuth */}
        <form action={loginWithGoogle}>
          <Button
            type="submit"
            variant="outline"
            className="w-full gap-2 border-border bg-secondary hover:bg-muted hover:neon-glow-cyan"
          >
            <GoogleIcon className="size-5" />
            <span className="text-sm">Continue with Google</span>
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              or sign in with email
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form action={formAction} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm text-foreground">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="bg-secondary"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full neon-glow"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>

      {/* Footer link */}
      <p className="text-center text-sm text-muted-foreground">
        New to the arcade?{" "}
        <Link
          href="/signup"
          className="text-primary transition-colors hover:text-primary/80"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
