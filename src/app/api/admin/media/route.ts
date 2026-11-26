import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/supabase/auth";

const BUCKET_NAME = "product-media";
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

function sanitizeBaseName(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "asset";
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folderRaw = formData.get("folder");
    const folder =
      typeof folderRaw === "string" && /^[a-z0-9-_]+$/i.test(folderRaw)
        ? folderRaw
        : "uploads";

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    const ext = ALLOWED_MIME_TYPES[file.type];
    if (!ext) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Allowed formats: PNG, JPEG, WebP, SVG.",
        },
        { status: 400 }
      );
    }

    if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "File size must be between 1 byte and 5 MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storagePath = `${folder}/${Date.now()}-${sanitizeBaseName(file.name)}.${ext}`;

    const { error: uploadErr } = await auth.admin.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    const { data: publicUrlData } = auth.admin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    return NextResponse.json(
      {
        ok: true,
        url: publicUrlData.publicUrl,
        storagePath,
        mimeType: file.type,
        size: file.size,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to upload media file." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as { storagePath?: string };
    const storagePath = body.storagePath?.trim() ?? "";
    if (!storagePath || storagePath.includes("..")) {
      return NextResponse.json(
        { error: "Valid storagePath is required." },
        { status: 400 }
      );
    }

    const { error } = await auth.admin.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid delete media request." },
      { status: 400 }
    );
  }
}
