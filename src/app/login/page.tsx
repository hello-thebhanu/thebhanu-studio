import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserAuthForm } from "@/components/auth/UserAuthForm";
import { getUserSession } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your THE BHANU account.",
  robots: { index: false, follow: false },
};

async function LoginGate() {
  const session = await getUserSession();
  if (session) {
    redirect(session.role === "admin" ? "/admin" : "/account");
  }
  return <UserAuthForm mode="login" />;
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[75vh] max-w-md items-center px-4 pt-28 pb-20">
          <div className="glass-surface h-80 w-full animate-pulse rounded-[var(--radius-xl)]" />
        </div>
      }
    >
      <LoginGate />
    </Suspense>
  );
}
