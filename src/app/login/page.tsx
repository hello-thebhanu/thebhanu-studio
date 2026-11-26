import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AnimatedBackground } from "@/components/auth/AnimatedBackground";
import { OtpLoginForm } from "@/components/auth/OtpLoginForm";
import { getUserSession } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your THE BHANU account with a 6-digit verification code.",
  robots: { index: false, follow: false },
};

async function LoginGate() {
  const session = await getUserSession();
  if (session) {
    redirect(session.role === "admin" ? "/admin" : "/account");
  }
  return <OtpLoginForm />;
}

export default function LoginPage() {
  return (
    <div className="relative min-h-[100svh]">
      <AnimatedBackground />
      <Suspense
        fallback={
          <div className="mx-auto flex min-h-[75vh] max-w-md items-center px-4 pt-28 pb-20">
            <div className="glass-surface h-80 w-full animate-pulse rounded-[28px]" />
          </div>
        }
      >
        <LoginGate />
      </Suspense>
    </div>
  );
}
