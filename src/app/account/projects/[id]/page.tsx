import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CustomerProjectDetailClient } from "@/components/auth/CustomerProjectDetailClient";
import { Skeleton } from "@/components/ui/Skeleton";
import { getProjectDetailsForActor } from "@/lib/projects/db";
import type { ProjectRecord, ProjectStatus } from "@/lib/projects/types";
import { getUserSession } from "@/lib/supabase/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Project Workspace",
  robots: { index: false, follow: false },
};

async function CustomerProjectContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getUserSession();
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const admin = createSupabaseAdminClient();
  const { data: row } = await admin
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!row) {
    notFound();
  }

  const isOwner =
    session.role === "admin" ||
    row.customer_id === session.user.id ||
    (row.customer_email as string).toLowerCase() === session.email;

  if (!isOwner) {
    notFound();
  }

  const project: ProjectRecord = {
    id: row.id as string,
    projectCode: row.project_code as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
    projectType: (row.project_type as string) ?? "Custom Software",
    customerId: (row.customer_id as string | null) ?? null,
    customerEmail: row.customer_email as string,
    enquiryId: (row.enquiry_id as string | null) ?? null,
    status: row.status as ProjectStatus,
    budget: (row.budget as string) ?? "",
    timeline: (row.timeline as string) ?? "",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };

  const { updates, files } = await getProjectDetailsForActor(project.id, false);

  return (
    <CustomerProjectDetailClient
      project={project}
      updates={updates}
      files={files}
    />
  );
}

export default function CustomerProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[var(--container-max)] px-4 pt-28 pb-20 sm:px-6 lg:px-8">
          <Skeleton rounded="xl" className="h-56 w-full" />
          <Skeleton rounded="xl" className="mt-8 h-80 w-full" />
        </div>
      }
    >
      <CustomerProjectContent params={params} />
    </Suspense>
  );
}
