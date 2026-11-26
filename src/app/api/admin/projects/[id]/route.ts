import { NextResponse } from "next/server";
import {
  getProjectDetailsForActor,
  PROJECT_FILES_BUCKET,
} from "@/lib/projects/db";
import {
  PROJECT_LIFECYCLE_STATUSES,
  type ProjectStatus,
} from "@/lib/projects/types";
import { requireAdminApi } from "@/lib/supabase/auth";

const VALID_STATUSES = new Set<ProjectStatus>(PROJECT_LIFECYCLE_STATUSES);

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const details = await getProjectDetailsForActor(id, true);
  return NextResponse.json(details);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as {
      title?: string;
      description?: string;
      status?: ProjectStatus;
      budget?: string;
      timeline?: string;
    };

    const patch: Record<string, unknown> = {};
    if (body.title !== undefined) patch.title = body.title.trim();
    if (body.description !== undefined) patch.description = body.description.trim();
    if (body.status !== undefined && VALID_STATUSES.has(body.status)) {
      patch.status = body.status;
    }
    if (body.budget !== undefined) patch.budget = body.budget.trim();
    if (body.timeline !== undefined) patch.timeline = body.timeline.trim();

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided." },
        { status: 400 }
      );
    }

    const { error } = await auth.admin
      .from("projects")
      .update(patch)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid project update payload." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const { data: files } = await auth.admin
    .from("project_files")
    .select("storage_path")
    .eq("project_id", id);

  const paths = (files ?? [])
    .map((f) => f.storage_path as string)
    .filter(Boolean);

  const { error } = await auth.admin.from("projects").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (paths.length > 0) {
    await auth.admin.storage.from(PROJECT_FILES_BUCKET).remove(paths);
  }

  return NextResponse.json({ ok: true });
}
