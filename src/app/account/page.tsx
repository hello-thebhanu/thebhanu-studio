import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountPortalClient } from "@/components/auth/AccountPortalClient";
import { Skeleton } from "@/components/ui/Skeleton";
import type { EnquiryRecord, EnquiryStatus } from "@/lib/enquiries/types";
import { getCustomerProjects } from "@/lib/projects/db";
import { getUserSession } from "@/lib/supabase/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

async function AccountContent() {
  const session = await getUserSession();
  if (!session) {
    redirect("/login");
  }

  let enquiries: EnquiryRecord[] = [];
  try {
    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from("enquiries")
      .select("*")
      .ilike("customer_email", session.email)
      .order("created_at", { ascending: false });

    enquiries = (data ?? []).map((row) => ({
      id: row.id as string,
      referenceCode: row.reference_code as string,
      projectType: row.project_type as string,
      selectedFeatures: (row.selected_features as string[]) ?? [],
      techPreferences: (row.tech_preferences as string[]) ?? [],
      projectDescription: row.project_description as string,
      budgetRange: row.budget_range as string,
      expectedTimeline: row.expected_timeline as string,
      customerName: row.customer_name as string,
      customerEmail: row.customer_email as string,
      customerCompany: (row.customer_company as string | null) ?? null,
      customerPhone: (row.customer_phone as string | null) ?? null,
      sourceProductSlug: (row.source_product_slug as string | null) ?? null,
      status: row.status as EnquiryStatus,
      adminNotes: "",
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    }));
  } catch {
    enquiries = [];
  }

  const projects = await getCustomerProjects(session.user.id, session.email);

  return (
    <AccountPortalClient
      email={session.email}
      fullName={session.fullName}
      role={session.role}
      enquiries={enquiries}
      projects={projects}
    />
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[var(--container-max)] px-4 pt-28 pb-20 sm:px-6 lg:px-8">
          <Skeleton rounded="xl" className="h-32 w-full" />
          <Skeleton rounded="xl" className="mt-8 h-64 w-full" />
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
