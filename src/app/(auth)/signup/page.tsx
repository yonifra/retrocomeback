import { Suspense } from "react";
import { SignupForm } from "./signup-form";

export const metadata = {
  title: "Sign Up | RETROCOMEBACK",
  description: "Create your RETROCOMEBACK account",
};

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
