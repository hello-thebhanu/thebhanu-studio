import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type {
  CustomerProfileRecord,
  ProjectFileRecord,
  ProjectRecord,
  ProjectStatus,
  ProjectUpdateRecord,
} from "./types";

export const PROJECT_FILES_BUCKET = "project-files";

export async function getAdminProjectsOverview(): Promise<{
  projects: ProjectRecord[];
  customers: CustomerProfileRecord[];
  schemaReady: boolean;
  errorMessage?: string;
}> {
  try {
    const admin = createSupabaseAdminClient();
    const [projRes, custRes] = await Promise.all([
      admin
        .from("projects")
        .select("*")
        .order("updated_at", { ascending: false }),
      admin
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    if (projRes.error) {
      return {
        projects: [],
        customers: [],
        schemaReady: false,
        errorMessage: projRes.error.message,
      };
    }

    const projects: ProjectRecord[] = (projRes.data ?? []).map((r) => ({
      id: r.id as string,
      projectCode: r.project_code as string,
      title: r.title as string,
      description: (r.description as string) ?? "",
      projectType: (r.project_type as string) ?? "Custom Software",
      customerId: (r.customer_id as string | null) ?? null,
      customerEmail: r.customer_email as string,
      enquiryId: (r.enquiry_id as string | null) ?? null,
      status: r.status as ProjectStatus,
      budget: (r.budget as string) ?? "",
      timeline: (r.timeline as string) ?? "",
      createdAt: r.created_at as string,
      updatedAt: r.updated_at as string,
    }));

    const customers: CustomerProfileRecord[] = (custRes.data ?? []).map((c) => ({
      id: c.id as string,
      email: c.email as string,
      fullName: (c.full_name as string) ?? "",
      company: (c.company as string) ?? "",
      phone: (c.phone as string) ?? "",
      role: (c.role as "admin" | "customer") ?? "customer",
      adminNotes: (c.admin_notes as string) ?? "",
      createdAt: c.created_at as string,
      updatedAt: c.updated_at as string,
    }));

    return { projects, customers, schemaReady: true };
  } catch (err) {
    return {
      projects: [],
      customers: [],
      schemaReady: false,
      errorMessage:
        err instanceof Error ? err.message : "Failed to load projects.",
    };
  }
}

export async function getCustomerProjects(
  userId: string,
  email: string
): Promise<ProjectRecord[]> {
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("projects")
      .select("*")
      .or(`customer_id.eq.${userId},customer_email.ilike.${email}`)
      .order("updated_at", { ascending: false });

    if (error || !data) return [];

    return data.map((r) => ({
      id: r.id as string,
      projectCode: r.project_code as string,
      title: r.title as string,
      description: (r.description as string) ?? "",
      projectType: (r.project_type as string) ?? "Custom Software",
      customerId: (r.customer_id as string | null) ?? null,
      customerEmail: r.customer_email as string,
      enquiryId: (r.enquiry_id as string | null) ?? null,
      status: r.status as ProjectStatus,
      budget: (r.budget as string) ?? "",
      timeline: (r.timeline as string) ?? "",
      createdAt: r.created_at as string,
      updatedAt: r.updated_at as string,
    }));
  } catch {
    return [];
  }
}

export async function getProjectDetailsForActor(
  projectId: string,
  includeInternal: boolean
): Promise<{
  updates: ProjectUpdateRecord[];
  files: Array<ProjectFileRecord & { signedUrl?: string | null }>;
}> {
  const admin = createSupabaseAdminClient();

  let updatesQuery = admin
    .from("project_updates")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (!includeInternal) {
    updatesQuery = updatesQuery.eq("is_internal", false);
  }

  const [updRes, fileRes] = await Promise.all([
    updatesQuery,
    admin
      .from("project_files")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false }),
  ]);

  const updates: ProjectUpdateRecord[] = (updRes.data ?? []).map((u) => ({
    id: u.id as string,
    projectId: u.project_id as string,
    authorId: (u.author_id as string | null) ?? null,
    authorRole: (u.author_role as "admin" | "customer") ?? "admin",
    title: (u.title as string) ?? "",
    message: u.message as string,
    isInternal: Boolean(u.is_internal),
    createdAt: u.created_at as string,
  }));

  const rawFiles: ProjectFileRecord[] = (fileRes.data ?? []).map((f) => ({
    id: f.id as string,
    projectId: f.project_id as string,
    uploadedBy: (f.uploaded_by as string | null) ?? null,
    fileName: f.file_name as string,
    storagePath: f.storage_path as string,
    mimeType: (f.mime_type as string) ?? "application/octet-stream",
    fileSize: Number(f.file_size ?? 0),
    isDeliverable: Boolean(f.is_deliverable),
    createdAt: f.created_at as string,
  }));

  const files = await Promise.all(
    rawFiles.map(async (f) => {
      const { data: signed } = await admin.storage
        .from(PROJECT_FILES_BUCKET)
        .createSignedUrl(f.storagePath, 3600);
      return { ...f, signedUrl: signed?.signedUrl ?? null };
    })
  );

  return { updates, files };
}
