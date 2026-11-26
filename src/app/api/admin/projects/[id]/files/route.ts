import { NextResponse } from "next/server";
import { PROJECT_FILES_BUCKET } from "@/lib/projects/db";
import { requireAdminApi } from "@/lib/supabase/auth";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80) || "file";
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const isDeliverable = formData.get("isDeliverable") === "true";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File size must be between 1 byte and 25 MB." },
        { status: 400 }
      );
    }

    const cleanName = safeFileName(file.name);
    const storagePath = `${id}/${Date.now()}-${cleanName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadErr } = await auth.admin.storage
      .from(PROJECT_FILES_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    const { error: dbErr } = await auth.admin.from("project_files").insert({
      project_id: id,
      uploaded_by: auth.session.user.id,
      file_name: file.name,
      storage_path: storagePath,
      mime_type: file.type || "application/octet-stream",
      file_size: file.size,
      is_deliverable: isDeliverable,
    });

    if (dbErr) {
      await auth.admin.storage.from(PROJECT_FILES_BUCKET).remove([storagePath]);
      return NextResponse.json({ error: dbErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to upload project file." },
      { status: 500 }
    );
  }
}
