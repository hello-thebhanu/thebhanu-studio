import { NextResponse } from "next/server";
import { PROJECT_FILES_BUCKET } from "@/lib/projects/db";
import { getUserSession } from "@/lib/supabase/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const MAX_BYTES = 25 * 1024 * 1024;

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80) || "file";
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const admin = createSupabaseAdminClient();

  const { data: project } = await admin
    .from("projects")
    .select("id, customer_id, customer_email")
    .eq("id", id)
    .maybeSingle();

  const isOwner =
    project &&
    (project.customer_id === session.user.id ||
      (project.customer_email as string).toLowerCase() === session.email);

  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File size must be between 1 byte and 25 MB." },
        { status: 400 }
      );
    }

    const storagePath = `${id}/customer-${Date.now()}-${safeFileName(file.name)}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadErr } = await admin.storage
      .from(PROJECT_FILES_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    const { error: dbErr } = await admin.from("project_files").insert({
      project_id: id,
      uploaded_by: session.user.id,
      file_name: file.name,
      storage_path: storagePath,
      mime_type: file.type || "application/octet-stream",
      file_size: file.size,
      is_deliverable: false,
    });

    if (dbErr) {
      await admin.storage.from(PROJECT_FILES_BUCKET).remove([storagePath]);
      return NextResponse.json({ error: dbErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to upload file." },
      { status: 500 }
    );
  }
}
