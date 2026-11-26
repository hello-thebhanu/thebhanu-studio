import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminSession } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

async function AdminLoginGate() {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin");
  }
  return <AdminLoginForm />;
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[72vh] max-w-md items-center px-4 pt-28 pb-20">
          <div className="glass-surface h-80 w-full animate-pulse rounded-[var(--radius-xl)]" />
        </div>
      }
    >
      <AdminLoginGate />
    </Suspense>
  );
}
