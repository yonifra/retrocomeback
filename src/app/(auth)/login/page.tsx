import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Login | RETROCOMEBACK",
  description: "Sign in to your RETROCOMEBACK account",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
