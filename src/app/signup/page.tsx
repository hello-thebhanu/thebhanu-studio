import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Sign in or create your THE BHANU account.",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  redirect("/login");
}
