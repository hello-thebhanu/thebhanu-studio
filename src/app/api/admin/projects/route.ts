import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getAdminProjectsOverview } from "@/lib/projects/db";
import {
  PROJECT_LIFECYCLE_STATUSES,
  type ProjectStatus,
} from "@/lib/projects/types";
import { requireAdminApi } from "@/lib/supabase/auth";

const VALID_STATUSES = new Set<ProjectStatus>(PROJECT_LIFECYCLE_STATUSES);

function generateProjectCode(): string {
  const now = new Date();
  const yy = String(now.getUTCFullYear()).slice(-2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const rand = randomBytes(2).toString("hex").toUpperCase();
  return `PRJ-${yy}${mm}${dd}-${rand}`;
}

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const data = await getAdminProjectsOverview();
  if (!data.schemaReady) {
    return NextResponse.json(
      { error: data.errorMessage ?? "Projects table not ready." },
      { status: 503 }
    );
  }

  return NextResponse.json({
    projects: data.projects,
    customers: data.customers,
  });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as {
      title?: string;
      description?: string;
      projectType?: string;
      customerEmail?: string;
      enquiryId?: string | null;
      status?: ProjectStatus;
      budget?: string;
      timeline?: string;
    };

    const title = body.title?.trim() ?? "";
    const customerEmail = body.customerEmail?.trim().toLowerCase() ?? "";

    if (!title || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json(
        { error: "Project title and valid customer email are required." },
        { status: 400 }
      );
    }

    // Link customer_id if profile already exists
    const { data: profile } = await auth.admin
      .from("profiles")
      .select("id")
      .ilike("email", customerEmail)
      .maybeSingle();

    const status: ProjectStatus =
      body.status && VALID_STATUSES.has(body.status)
        ? body.status
        : "Enquiry Received";

    const projectCode = generateProjectCode();
    const { data: created, error } = await auth.admin
      .from("projects")
      .insert({
        project_code: projectCode,
        title,
        description: body.description?.trim() ?? "",
        project_type: body.projectType?.trim() || "Custom Software",
        customer_id: (profile?.id as string | undefined) ?? null,
        customer_email: customerEmail,
        enquiry_id: body.enquiryId || null,
        status,
        budget: body.budget?.trim() ?? "",
        timeline: body.timeline?.trim() ?? "",
      })
      .select("id, project_code")
      .single();

    if (error || !created) {
      return NextResponse.json(
        { error: error?.message ?? "Failed to create project." },
        { status: 500 }
      );
    }

    // If converted from an enquiry, mark enquiry Accepted
    if (body.enquiryId) {
      await auth.admin
        .from("enquiries")
        .update({ status: "Accepted" })
        .eq("id", body.enquiryId);
    }

    return NextResponse.json(
      { ok: true, id: created.id, projectCode: created.project_code },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid project payload." },
      { status: 400 }
    );
  }
}
