import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { requireAdminPage } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: {
    default: "Admin Studio",
    template: "%s | Admin Studio | THE BHANU",
  },
  robots: { index: false, follow: false },
};

async function ProtectedAdminContent({ children }: { children: ReactNode }) {
  const session = await requireAdminPage();
  return <AdminShell email={session.email}>{children}</AdminShell>;
}

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[var(--container-max)] px-4 pt-28 pb-20 sm:px-6 lg:px-8">
          <Skeleton rounded="xl" className="h-24 w-full" />
          <Skeleton rounded="xl" className="mt-8 h-96 w-full" />
        </div>
      }
    >
      <ProtectedAdminContent>{children}</ProtectedAdminContent>
    </Suspense>
  );
}
